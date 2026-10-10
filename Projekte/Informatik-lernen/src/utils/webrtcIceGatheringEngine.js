// @ts-check
/**
 * WebRTC STUN/TURN & ICE (Interactive Connectivity Establishment) Candidate Gathering Engine
 * Simulates RFC 8445 ICE Agent, STUN binding requests, TURN relay allocations,
 * and candidate pair priority evaluations (Host, Server Reflexive, Relay).
 */

/**
 * @typedef {'host' | 'srflx' | 'relay'} IceCandidateType
 */

/**
 * @typedef {Object} IceCandidate
 * @property {string} foundation
 * @property {number} component (1 = RTP, 2 = RTCP)
 * @property {'UDP' | 'TCP'} transport
 * @property {number} priority RFC 8445 priority: (2^24)*(type_pref) + (2^8)*(local_pref) + (2^0)*(256 - component)
 * @property {string} ip
 * @property {number} port
 * @property {IceCandidateType} type
 * @property {string} [relIp]
 * @property {number} [relPort]
 * @property {string} rawSdpCandidate
 */

/**
 * @typedef {Object} NatScenario
 * @property {'FullCone' | 'RestrictedCone' | 'PortRestrictedCone' | 'Symmetric'} natType
 * @property {boolean} stunReachable
 * @property {boolean} turnReachable
 * @property {boolean} firewallBlocksDirectUdp
 */

/**
 * Generates RFC 8445 compliant ICE candidates based on network scenario
 * @param {NatScenario} scenario
 * @returns {IceCandidate[]}
 */
export function gatherIceCandidates(scenario) {
  /** @type {IceCandidate[]} */
  const candidates = [];
  let foundation = 1;

  // 1. Host Candidates (Lokale Schnittstellen: eth0, wlan0)
  const hostPrio = Math.round(126 * Math.pow(2, 24) + 65535 * Math.pow(2, 8) + 255);
  candidates.push({
    foundation: String(foundation++),
    component: 1,
    transport: 'UDP',
    priority: hostPrio,
    ip: '192.168.1.105',
    port: 54320,
    type: 'host',
    rawSdpCandidate: `candidate:1 1 UDP ${hostPrio} 192.168.1.105 54320 typ host`
  });

  // 2. Server Reflexive (STUN - RFC 5389 / RFC 8489)
  if (scenario.stunReachable && scenario.natType !== 'Symmetric') {
    const srflxPrio = Math.round(100 * Math.pow(2, 24) + 65535 * Math.pow(2, 8) + 255);
    candidates.push({
      foundation: String(foundation++),
      component: 1,
      transport: 'UDP',
      priority: srflxPrio,
      ip: '203.0.113.42',
      port: 38291,
      type: 'srflx',
      relIp: '192.168.1.105',
      relPort: 54320,
      rawSdpCandidate: `candidate:2 1 UDP ${srflxPrio} 203.0.113.42 38291 typ srflx raddr 192.168.1.105 rport 54320`
    });
  }

  // 3. Relay Candidate (TURN - RFC 8656, type preference = 0)
  if (scenario.turnReachable) {
    const relayPrio = Math.round(65535 * Math.pow(2, 8) + 255);
    candidates.push({
      foundation: String(foundation++),
      component: 1,
      transport: 'UDP',
      priority: relayPrio,
      ip: '198.51.100.88', // TURN server public IP
      port: 49152,
      type: 'relay',
      relIp: '203.0.113.42',
      relPort: 38291,
      rawSdpCandidate: `candidate:3 1 UDP ${relayPrio} 198.51.100.88 49152 typ relay raddr 203.0.113.42 rport 38291`
    });
  }

  return candidates.sort((a, b) => b.priority - a.priority);
}

/**
 * Simulates ICE Connectivity Checks and selects the nominated pair
 * @param {IceCandidate[]} localCandidates
 * @param {NatScenario} localScenario
 * @param {NatScenario} remoteScenario
 */
export function nominateIcePair(localCandidates, localScenario, remoteScenario) {
  if (localCandidates.length === 0) {
    return { nominatedPair: null, connectionType: 'FAILED', reason: 'Keine Kandidaten gesammelt' };
  }

  // Symmetric NAT to Symmetric NAT requires TURN relay
  const isBothSymmetric = localScenario.natType === 'Symmetric' && remoteScenario.natType === 'Symmetric';
  const isDirectBlocked = localScenario.firewallBlocksDirectUdp || remoteScenario.firewallBlocksDirectUdp;

  if (isBothSymmetric || isDirectBlocked) {
    const relayCandidate = localCandidates.find(c => c.type === 'relay');
    if (relayCandidate) {
      return {
        nominatedPair: relayCandidate,
        connectionType: 'RELAY_TURN',
        reason: isBothSymmetric 
          ? 'Beide Peers hinter Symmetric NAT -> P2P STUN Hole-Punching unmöglich, TURN Relay zwingend nötig.'
          : 'Firewall blockiert direkte UDP-Pakete -> Fallback auf TURN Relay.'
      };
    } else {
      return {
        nominatedPair: null,
        connectionType: 'FAILED',
        reason: 'Direkte P2P-Verbindung unmöglich und kein TURN-Server konfiguriert.'
      };
    }
  }

  // STUN Server Reflexive P2P
  const srflxCandidate = localCandidates.find(c => c.type === 'srflx');
  if (srflxCandidate) {
    return {
      nominatedPair: srflxCandidate,
      connectionType: 'P2P_STUN_SRFLX',
      reason: 'Direktes P2P NAT-Traversal via STUN Binding Request erfolgreich (Hole Punching).'
    };
  }

  // Local Host P2P
  const hostCandidate = localCandidates.find(c => c.type === 'host');
  return {
    nominatedPair: hostCandidate || null,
    connectionType: 'P2P_LOCAL_HOST',
    reason: 'Verbindung im gleichen Subnetz / LAN über Host-Kandidaten.'
  };
}
