// @ts-check
/**
 * IEEE 802.1D (STP) & IEEE 802.1w (RSTP) Spanning Tree Protocol Engine
 * Simulates:
 * - Root Bridge Election (Priority + MAC address)
 * - Path Cost Evaluation (10G=2, 1G=4, 100M=19, 10M=100)
 * - Port Role Assignment (Root Port, Designated Port, Alternate/Blocking Port)
 * - Loop Detection and Blocking Port Placement
 * - Convergence Comparison: STP (30-50s) vs. RSTP (<1s Proposal/Agreement)
 * - Cisco IOS CLI Configuration Generation
 * @module stpProtocolEngine
 */

/**
 * Standard IEEE 802.1D / 802.1w Port Speeds and Path Costs
 */
export const STP_PATH_COSTS = {
  '10M': 100,
  '100M': 19,
  '1G': 4,
  '10G': 2
};

/**
 * @typedef {{
 *   id: string;
 *   name: string;
 *   priority: number;
 *   mac: string;
 * }} StpSwitch
 *
 * @typedef {{
 *   id: string;
 *   switchA: string;
 *   portA: string;
 *   switchB: string;
 *   portB: string;
 *   speed: '10M' | '100M' | '1G' | '10G';
 *   cost?: number;
 *   isFailed?: boolean;
 * }} StpLink
 *
 * @typedef {'ROOT' | 'DESIGNATED' | 'ALTERNATE'} StpPortRole
 * @typedef {'FORWARDING' | 'BLOCKING' | 'LISTENING' | 'LEARNING' | 'DISCARDING'} StpPortState
 *
 * @typedef {{
 *   switchId: string;
 *   portId: string;
 *   role: StpPortRole;
 *   state: StpPortState;
 *   costToRoot: number;
 * }} EvaluatedPort
 */

/**
 * Compares two Bridge IDs (Priority first, then MAC)
 * Returns < 0 if a wins (lower), > 0 if b wins
 * @param {StpSwitch} a
 * @param {StpSwitch} b
 * @returns {number}
 */
export function compareBridgeId(a, b) {
  if (a.priority !== b.priority) {
    return a.priority - b.priority;
  }
  return a.mac.localeCompare(b.mac);
}

/**
 * Selects the Root Bridge with the lowest Bridge ID (Priority + MAC)
 * @param {StpSwitch[]} switches
 * @returns {StpSwitch}
 */
export function electRootBridge(switches) {
  if (!switches || switches.length === 0) {
    throw new Error('No switches provided for Root Bridge election');
  }
  const sorted = [...switches].sort(compareBridgeId);
  return sorted[0];
}

/**
 * Computes Spanning Tree for a topology of switches and links
 * @param {StpSwitch[]} switches
 * @param {StpLink[]} links
 * @param {'stp' | 'rstp'} [mode='rstp']
 * @returns {{
 *   rootBridge: StpSwitch;
 *   portAssignments: Record<string, EvaluatedPort>;
 *   activeLinks: string[];
 *   blockedLinks: string[];
 *   switchRootCosts: Record<string, number>;
 * }}
 */
export function computeSpanningTree(switches, links, mode = 'rstp') {
  if (!switches || switches.length === 0) {
    throw new Error('Switches required');
  }

  const rootBridge = electRootBridge(switches);
  const activeLinks = links.filter((l) => !l.isFailed);

  // Helper map for link lookup
  /** @type {Map<string, Array<{ neighbor: string; myPort: string; theirPort: string; linkId: string; cost: number }>>} */
  const adj = new Map();
  switches.forEach((s) => adj.set(s.id, []));

  activeLinks.forEach((link) => {
    const cost = link.cost ?? STP_PATH_COSTS[link.speed] ?? 4;
    adj.get(link.switchA)?.push({
      neighbor: link.switchB,
      myPort: link.portA,
      theirPort: link.portB,
      linkId: link.id,
      cost
    });
    adj.get(link.switchB)?.push({
      neighbor: link.switchA,
      myPort: link.portB,
      theirPort: link.portA,
      linkId: link.id,
      cost
    });
  });

  // Dijkstra to calculate shortest path cost from each switch to rootBridge
  /** @type {Record<string, number>} */
  const switchRootCosts = {};
  /** @type {Record<string, any>} */
  const rootPortChoice = {}; // switchId -> { portId, linkId, neighborId, cost }

  switches.forEach((s) => {
    switchRootCosts[s.id] = s.id === rootBridge.id ? 0 : Infinity;
  });

  // Priority queue / simple relaxation for small topologies
  const visited = new Set();
  while (visited.size < switches.length) {
    let curr = null;
    let minCost = Infinity;

    switches.forEach((s) => {
      if (!visited.has(s.id) && switchRootCosts[s.id] < minCost) {
        minCost = switchRootCosts[s.id];
        curr = s.id;
      }
    });

    if (!curr || minCost === Infinity) break;
    visited.add(curr);

    const neighbors = adj.get(curr) || [];
    for (const edge of neighbors) {
      const newCost = switchRootCosts[curr] + edge.cost;
      if (newCost < switchRootCosts[edge.neighbor]) {
        switchRootCosts[edge.neighbor] = newCost;
      }
    }
  }

  // Determine Root Port for each non-root switch:
  // Port with lowest path cost to root.
  // Tie-breaker 1: lowest neighbor bridge ID.
  // Tie-breaker 2: lowest neighbor port name.
  switches.forEach((s) => {
    if (s.id === rootBridge.id) return;
    const candidates = adj.get(s.id) || [];
    let best = null;

    for (const edge of candidates) {
      const neighborSwitch = switches.find((sw) => sw.id === edge.neighbor);
      if (!neighborSwitch) continue;
      const totalCostToRoot = (switchRootCosts[edge.neighbor] ?? Infinity) + edge.cost;

      if (!best) {
        best = { ...edge, totalCost: totalCostToRoot, neighborSwitch };
      } else {
        if (totalCostToRoot < best.totalCost) {
          best = { ...edge, totalCost: totalCostToRoot, neighborSwitch };
        } else if (totalCostToRoot === best.totalCost) {
          // Tie-break by neighbor bridge ID
          const cmp = compareBridgeId(neighborSwitch, best.neighborSwitch);
          if (cmp < 0) {
            best = { ...edge, totalCost: totalCostToRoot, neighborSwitch };
          } else if (cmp === 0 && edge.theirPort < best.theirPort) {
            best = { ...edge, totalCost: totalCostToRoot, neighborSwitch };
          }
        }
      }
    }

    if (best) {
      rootPortChoice[s.id] = best;
    }
  });

  /** @type {Record<string, EvaluatedPort>} */
  const portAssignments = {};
  const activeLinkIds = new Set();
  const blockedLinkIds = new Set();

  // Root Bridge: all connected active ports are DESIGNATED
  (adj.get(rootBridge.id) || []).forEach((edge) => {
    const key = `${rootBridge.id}:${edge.myPort}`;
    portAssignments[key] = {
      switchId: rootBridge.id,
      portId: edge.myPort,
      role: 'DESIGNATED',
      state: 'FORWARDING',
      costToRoot: 0
    };
  });

  // Assign Root Ports
  Object.entries(rootPortChoice).forEach(([swId, edge]) => {
    const key = `${swId}:${edge.myPort}`;
    portAssignments[key] = {
      switchId: swId,
      portId: edge.myPort,
      role: 'ROOT',
      state: 'FORWARDING',
      costToRoot: edge.totalCost
    };
    activeLinkIds.add(edge.linkId);
  });

  // For every link, determine Designated Port (the port offering lowest cost to root on that segment)
  activeLinks.forEach((link) => {
    const keyA = `${link.switchA}:${link.portA}`;
    const keyB = `${link.switchB}:${link.portB}`;

    const portA = portAssignments[keyA];
    const portB = portAssignments[keyB];

    // If both ports already assigned (e.g. one Root Port, other might be Designated or already set)
    const costA = switchRootCosts[link.switchA];
    const costB = switchRootCosts[link.switchB];

    const swA = switches.find((s) => s.id === link.switchA);
    const swB = switches.find((s) => s.id === link.switchB);

    if (link.switchA === rootBridge.id) {
      // Port A is Designated, Port B must be Root or Alternate
      if (!portB) {
        portAssignments[keyB] = {
          switchId: link.switchB,
          portId: link.portB,
          role: 'ALTERNATE',
          state: mode === 'rstp' ? 'DISCARDING' : 'BLOCKING',
          costToRoot: costB
        };
        blockedLinkIds.add(link.id);
      } else {
        activeLinkIds.add(link.id);
      }
      return;
    }

    if (link.switchB === rootBridge.id) {
      if (!portA) {
        portAssignments[keyA] = {
          switchId: link.switchA,
          portId: link.portA,
          role: 'ALTERNATE',
          state: mode === 'rstp' ? 'DISCARDING' : 'BLOCKING',
          costToRoot: costA
        };
        blockedLinkIds.add(link.id);
      } else {
        activeLinkIds.add(link.id);
      }
      return;
    }

    // Segment between two non-root switches
    let desSwitch = null;
    let desPort = null;
    let otherSwitch = null;
    let otherPort = null;

    if (costA < costB) {
      desSwitch = link.switchA;
      desPort = link.portA;
      otherSwitch = link.switchB;
      otherPort = link.portB;
    } else if (costB < costA) {
      desSwitch = link.switchB;
      desPort = link.portB;
      otherSwitch = link.switchA;
      otherPort = link.portA;
    } else {
      // Tie-breaker: lower Bridge ID wins Designated Port
      if (swA && swB && compareBridgeId(swA, swB) < 0) {
        desSwitch = link.switchA;
        desPort = link.portA;
        otherSwitch = link.switchB;
        otherPort = link.portB;
      } else {
        desSwitch = link.switchB;
        desPort = link.portB;
        otherSwitch = link.switchA;
        otherPort = link.portA;
      }
    }

    const desKey = `${desSwitch}:${desPort}`;
    const otherKey = `${otherSwitch}:${otherPort}`;

    if (!portAssignments[desKey]) {
      portAssignments[desKey] = {
        switchId: desSwitch,
        portId: desPort,
        role: 'DESIGNATED',
        state: 'FORWARDING',
        costToRoot: switchRootCosts[desSwitch]
      };
    }

    if (!portAssignments[otherKey]) {
      portAssignments[otherKey] = {
        switchId: otherSwitch,
        portId: otherPort,
        role: 'ALTERNATE',
        state: mode === 'rstp' ? 'DISCARDING' : 'BLOCKING',
        costToRoot: switchRootCosts[otherSwitch]
      };
      blockedLinkIds.add(link.id);
    } else {
      if (portAssignments[otherKey].role !== 'ALTERNATE') {
        activeLinkIds.add(link.id);
      }
    }
  });

  return {
    rootBridge,
    portAssignments,
    activeLinks: Array.from(activeLinkIds),
    blockedLinks: Array.from(blockedLinkIds),
    switchRootCosts
  };
}

/**
 * Returns detailed convergence metrics for a link failure scenario
 * @param {'stp' | 'rstp'} mode
 * @returns {{
 *   convergenceTimeMs: number;
 *   description: string;
 *   phases: Array<{ name: string; duration: string; state: string }>;
 * }}
 */
export function getConvergenceMetrics(mode) {
  if (mode === 'stp') {
    return {
      convergenceTimeMs: 30000,
      description: 'Klassisches STP (802.1D): Standard-Timer verursachen 30-50s Ausfallzeit.',
      phases: [
        { name: 'MaxAge Timer', duration: '20s', state: 'BLOCKING (Verlust von BPDUs)' },
        { name: 'Listening State', duration: '15s', state: 'LISTENING (Frames verwerfen, keine MAC-Tabelle)' },
        { name: 'Learning State', duration: '15s', state: 'LEARNING (MAC-Adressen lernen, noch kein Forwarding)' },
        { name: 'Forwarding State', duration: '0s', state: 'FORWARDING (Normaler Datenverkehr)' }
      ]
    };
  }

  return {
    convergenceTimeMs: 50,
    description: 'Rapid STP (802.1w): Schneller Handshake via Proposal & Agreement in Millisekunden (< 1s).',
    phases: [
      { name: 'Link Failure Detection', duration: '< 10ms', state: 'Immediate Detection' },
      { name: 'Proposal / Agreement', duration: '< 20ms', state: 'Handshake mit Nachbar-Switch' },
      { name: 'Sync & Cutover', duration: '< 20ms', state: 'Alternate Port wird direkt zum Root Port' },
      { name: 'Forwarding State', duration: 'Sofort', state: 'FORWARDING (< 1s Gesamtdauer)' }
    ]
  };
}

/**
 * Generates Cisco IOS CLI configuration for STP / RSTP
 * @param {StpSwitch[]} switches
 * @param {'rapid-pvst' | 'pvst' | 'mst'} [mode='rapid-pvst']
 * @returns {Record<string, string>}
 */
export function generateCiscoStpConfig(switches, mode = 'rapid-pvst') {
  /** @type {Record<string, string>} */
  const configs = {};
  const root = electRootBridge(switches);

  switches.forEach((sw) => {
    const isRoot = sw.id === root.id;
    configs[sw.id] = [
      `! Switch: ${sw.name} (${sw.mac})`,
      'enable',
      'configure terminal',
      `spanning-tree mode ${mode}`,
      `spanning-tree vlan 1 priority ${sw.priority}`,
      isRoot ? '! DIESER SWITCH IST DIE ROOT BRIDGE FUER VLAN 1' : '! STANDARD ACCESS / DISTRIBUTION SWITCH',
      'spanning-tree portfast default',
      'spanning-tree portfast bpduguard default',
      'end',
      'write memory'
    ].join('\n');
  });

  return configs;
}
