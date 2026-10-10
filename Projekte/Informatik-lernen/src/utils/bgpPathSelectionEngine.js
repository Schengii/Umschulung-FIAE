// @ts-check
/**
 * BGP Path Selection & Multi-Exit Discriminator (MED / Local Pref) Engine
 * Implements the standard RFC 4271 8-step decision process for BGP route selection:
 * 1. Highest Weight (Cisco proprietary / local)
 * 2. Highest Local Preference
 * 3. Locally Originated Routes (network / aggregate)
 * 4. Shortest AS-Path
 * 5. Lowest Origin Code (IGP < EGP < INCOMPLETE)
 * 6. Lowest MED (Multi-Exit Discriminator)
 * 7. eBGP over iBGP
 * 8. Lowest Router-ID (Tie-breaker)
 */

/**
 * @typedef {Object} BgpRouteCandidate
 * @property {string} peerName
 * @property {string} prefix
 * @property {number} weight
 * @property {number} localPref
 * @property {boolean} locallyOriginated
 * @property {number[]} asPath
 * @property {'IGP' | 'EGP' | 'INCOMPLETE'} origin
 * @property {number} med
 * @property {'eBGP' | 'iBGP'} peerType
 * @property {string} routerId (e.g. 192.168.1.1)
 */

export const DEFAULT_BGP_CANDIDATES = [
  {
    peerName: 'Transit-ISP-Alpha',
    prefix: '198.51.100.0/24',
    weight: 100,
    localPref: 100,
    locallyOriginated: false,
    asPath: [64501, 64510],
    origin: /** @type {'IGP'} */ ('IGP'),
    med: 50,
    peerType: /** @type {'eBGP'} */ ('eBGP'),
    routerId: '10.0.0.1'
  },
  {
    peerName: 'Direct-Peer-Beta',
    prefix: '198.51.100.0/24',
    weight: 100,
    localPref: 120, // Higher LocalPref wins!
    locallyOriginated: false,
    asPath: [64502],
    origin: /** @type {'IGP'} */ ('IGP'),
    med: 100,
    peerType: /** @type {'eBGP'} */ ('eBGP'),
    routerId: '10.0.0.2'
  },
  {
    peerName: 'Backup-Transit-Gamma',
    prefix: '198.51.100.0/24',
    weight: 100,
    localPref: 100,
    locallyOriginated: false,
    asPath: [64503, 64520, 64530],
    origin: /** @type {'INCOMPLETE'} */ ('INCOMPLETE'),
    med: 200,
    peerType: /** @type {'eBGP'} */ ('eBGP'),
    routerId: '10.0.0.3'
  }
];

const ORIGIN_ORDER = {
  IGP: 1,
  EGP: 2,
  INCOMPLETE: 3
};

/**
 * Evaluates candidates step-by-step according to RFC 4271
 * @param {BgpRouteCandidate[]} candidates
 */
export function selectBestBgpPath(candidates = DEFAULT_BGP_CANDIDATES) {
  if (!candidates || candidates.length === 0) {
    return { bestRoute: null, decisionSteps: [] };
  }

  /** @type {Array<{ step: number, name: string, description: string, eliminated: string[] }>} */
  const decisionSteps = [];
  let currentPool = [...candidates];

  // Helper function to eliminate losing routes
  /**
   * @param {number} stepNum
   * @param {string} stepName
   * @param {string} desc
   * @param {(candidate: BgpRouteCandidate) => boolean} predicate
   */
  const filterPool = (stepNum, stepName, desc, predicate) => {
    if (currentPool.length <= 1) return;
    const survivors = currentPool.filter(predicate);
    if (survivors.length > 0 && survivors.length < currentPool.length) {
      const eliminated = currentPool.filter((/** @type {BgpRouteCandidate} */ c) => !survivors.includes(c)).map(c => c.peerName);
      decisionSteps.push({
        step: stepNum,
        name: stepName,
        description: desc,
        eliminated
      });
      currentPool = survivors;
    }
  };

  // 1. Highest Weight
  const maxWeight = Math.max(...currentPool.map((/** @type {BgpRouteCandidate} */ c) => c.weight));
  filterPool(1, 'Highest Weight', `Höchster lokaler Weight-Wert (${maxWeight})`, (/** @type {BgpRouteCandidate} */ c) => c.weight === maxWeight);

  // 2. Highest Local Preference
  const maxLocalPref = Math.max(...currentPool.map((/** @type {BgpRouteCandidate} */ c) => c.localPref));
  filterPool(2, 'Highest LocalPref', `Höchste Local Preference (${maxLocalPref})`, (/** @type {BgpRouteCandidate} */ c) => c.localPref === maxLocalPref);

  // 3. Locally Originated
  const anyLocal = currentPool.some((/** @type {BgpRouteCandidate} */ c) => c.locallyOriginated);
  if (anyLocal) {
    filterPool(3, 'Locally Originated', 'Lokal erzeugte Routen bevorzugt', (/** @type {BgpRouteCandidate} */ c) => c.locallyOriginated);
  }

  // 4. Shortest AS-Path
  const minAsPathLen = Math.min(...currentPool.map((/** @type {BgpRouteCandidate} */ c) => c.asPath.length));
  filterPool(4, 'Shortest AS-Path', `Kürzester AS-Pfad (${minAsPathLen} Hops)`, (/** @type {BgpRouteCandidate} */ c) => c.asPath.length === minAsPathLen);

  // 5. Lowest Origin Code
  const minOriginVal = Math.min(...currentPool.map((/** @type {BgpRouteCandidate} */ c) => ORIGIN_ORDER[c.origin] || 3));
  filterPool(5, 'Lowest Origin Code', 'Origin: IGP < EGP < INCOMPLETE', (/** @type {BgpRouteCandidate} */ c) => (ORIGIN_ORDER[c.origin] || 3) === minOriginVal);

  // 6. Lowest MED
  const minMed = Math.min(...currentPool.map((/** @type {BgpRouteCandidate} */ c) => c.med));
  filterPool(6, 'Lowest MED', `Niedrigster Multi-Exit Discriminator (${minMed})`, (/** @type {BgpRouteCandidate} */ c) => c.med === minMed);

  // 7. eBGP over iBGP
  const anyEbgp = currentPool.some((/** @type {BgpRouteCandidate} */ c) => c.peerType === 'eBGP');
  if (anyEbgp) {
    filterPool(7, 'eBGP over iBGP', 'Externes BGP wird internem iBGP vorgezogen', (/** @type {BgpRouteCandidate} */ c) => c.peerType === 'eBGP');
  }

  // 8. Lowest Router ID
  currentPool.sort((a, b) => a.routerId.localeCompare(b.routerId));
  const bestRoute = currentPool[0];

  return {
    bestRoute,
    decisionSteps,
    winningCriteria: decisionSteps.length > 0 ? decisionSteps[0].name : 'Router-ID Tie-breaker'
  };
}
