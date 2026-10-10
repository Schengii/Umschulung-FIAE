// @ts-check
/**
 * @file ddosScrubberEngine.js
 * BGP Anycast & DDoS Flow-Scrubber Engine
 * Simuliert Edge-PoPs (Frankfurt, Amsterdam, New York, Tokio),
 * SYN-Cookies, Rate-Limiting, Flow-Spec Rules und BGP Anycast Failover.
 */

/**
 * @typedef {object} EdgePop
 * @property {string} id
 * @property {string} city
 * @property {string} region
 * @property {number} capacityGbps
 * @property {number} currentTrafficGbps
 * @property {boolean} isHealthy
 * @property {boolean} scrubbingActive
 */

/**
 * Standard Edge PoPs für Anycast Ingress
 * @type {EdgePop[]}
 */
export const INITIAL_POPS = [
  { id: 'fra', city: 'Frankfurt (FRA-01)', region: 'EU-Central', capacityGbps: 100, currentTrafficGbps: 15, isHealthy: true, scrubbingActive: false },
  { id: 'ams', city: 'Amsterdam (AMS-01)', region: 'EU-West', capacityGbps: 80, currentTrafficGbps: 12, isHealthy: true, scrubbingActive: false },
  { id: 'nyc', city: 'New York (NYC-01)', region: 'US-East', capacityGbps: 120, currentTrafficGbps: 22, isHealthy: true, scrubbingActive: false },
  { id: 'tyo', city: 'Tokio (TYO-01)', region: 'AP-East', capacityGbps: 90, currentTrafficGbps: 18, isHealthy: true, scrubbingActive: false }
];

/**
 * Bewertet den DDoS-Zustand eines Edge-PoPs und wendet Abwehrmaßnahmen an
 * @param {{
 *   pop: EdgePop,
 *   attackType: 'NONE' | 'SYN_FLOOD' | 'UDP_AMPLIFICATION' | 'HTTP_FLOOD',
 *   attackGbps: number,
 *   enableSynCookies?: boolean,
 *   enableRateLimiting?: boolean,
 *   enableBgpWithdrawal?: boolean
 * }} params
 * @returns {{
 *   scrubbedPop: EdgePop,
 *   mitigationStatus: 'CLEAN' | 'SCRUBBING' | 'OVERWHELMED' | 'WITHDRAWN',
 *   droppedTrafficGbps: number,
 *   passedTrafficGbps: number,
 *   log: string
 * }}
 */
export function processPopTraffic({
  pop,
  attackType,
  attackGbps,
  enableSynCookies = true,
  enableRateLimiting = true,
  enableBgpWithdrawal = false
}) {
  const totalIncomingGbps = pop.currentTrafficGbps + attackGbps;

  // 1. BGP Withdrawal (BGP Route Announce zurückziehen -> Traffic shiften)
  if (enableBgpWithdrawal && totalIncomingGbps > pop.capacityGbps) {
    return {
      scrubbedPop: { ...pop, isHealthy: false, scrubbingActive: false, currentTrafficGbps: 0 },
      mitigationStatus: 'WITHDRAWN',
      droppedTrafficGbps: 0,
      passedTrafficGbps: 0,
      log: `BGP Route für ${pop.city} entzogen! Traffic weicht automatisch auf benachbarte Anycast-PoPs aus.`
    };
  }

  if (attackType === 'NONE' || attackGbps <= 0) {
    return {
      scrubbedPop: { ...pop, isHealthy: true, scrubbingActive: false },
      mitigationStatus: 'CLEAN',
      droppedTrafficGbps: 0,
      passedTrafficGbps: pop.currentTrafficGbps,
      log: `${pop.city}: Normaler Netzwerkverkehr ohne Anomalien.`
    };
  }

  // 2. Abwehrmaßnahmen berechnen
  let droppedGbps = 0;

  if (attackType === 'SYN_FLOOD' && enableSynCookies) {
    // SYN-Cookies blockieren gefälschte SYN-Pakete direkt im Kernel
    droppedGbps += attackGbps * 0.95;
  } else if (attackType === 'UDP_AMPLIFICATION') {
    // FlowSpec / ACL filtert UDP Amplification (z.B. NTP/DNS reflection)
    droppedGbps += attackGbps * 0.92;
  } else if (attackType === 'HTTP_FLOOD' && enableRateLimiting) {
    // L7 Challenge & Token-Bucket Rate Limiter
    droppedGbps += attackGbps * 0.88;
  } else {
    // Ohne aktive Filter gelangt fast der gesamte Angriffsverkehr zum Server
    droppedGbps += attackGbps * 0.1;
  }

  const passedGbps = totalIncomingGbps - droppedGbps;
  const isOverwhelmed = passedGbps > pop.capacityGbps;

  return {
    scrubbedPop: {
      ...pop,
      currentTrafficGbps: Math.round(passedGbps),
      isHealthy: !isOverwhelmed,
      scrubbingActive: droppedGbps > 0
    },
    mitigationStatus: isOverwhelmed ? 'OVERWHELMED' : 'SCRUBBING',
    droppedTrafficGbps: Math.round(droppedGbps),
    passedTrafficGbps: Math.round(passedGbps),
    log: isOverwhelmed
      ? `KRITISCH: ${pop.city} ist mit ${Math.round(passedGbps)} Gbps überlastet (Kapazität: ${pop.capacityGbps} Gbps)!`
      : `${pop.city}: ${Math.round(droppedGbps)} Gbps böswilliger Traffic erfolgreich durch Scrubber herausgefiltert.`
  };
}
