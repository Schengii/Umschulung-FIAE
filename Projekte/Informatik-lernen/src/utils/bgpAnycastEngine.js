// @ts-check
/**
 * Linux BGP Routing & Anycast Engine (FRRouting / BIRD)
 * Simulates Autonomous Systems (AS), eBGP/iBGP peerings, BGP path selection attributes
 * (Weight, Local Preference, AS-Path Length, MED), and Anycast routing.
 */

export class BgpAnycastSimulator {
  constructor() {
    this.localAsn = 65001;
    this.anycastIp = '198.51.100.1/32'; // Anycast Service IP
    this.routes = [
      {
        peerAsn: 64512,
        peerName: 'Tier-1 ISP Alpha (Frankfurt)',
        asPath: [64512, 65001],
        localPref: 100,
        med: 0,
        latencyMs: 12
      },
      {
        peerAsn: 64513,
        peerName: 'Tier-1 ISP Bravo (Amsterdam)',
        asPath: [64513, 64599, 65001], // Longer AS-Path
        localPref: 100,
        med: 10,
        latencyMs: 28
      }
    ];
  }

  /**
   * Fügt AS-Path Prepending für einen bestimmten Peer hinzu (z. B. um Traffic zu de-priorisieren)
   * @param {number} peerAsn
   * @param {number} times
   */
  prependAsPath(peerAsn, times = 2) {
    const route = this.routes.find(r => r.peerAsn === peerAsn);
    if (route) {
      const prependList = Array(times).fill(this.localAsn);
      route.asPath = [...route.asPath.slice(0, -1), ...prependList, this.localAsn];
    }
  }

  /**
   * Prüft eingehende BGP Routing-Updates auf Routing-Schleifen (Loop Detection via ASN)
   * RFC 4271: Enthält der AS_PATH die eigene ASN, wird die Route verworfen.
   * @param {number[]} asPath
   * @returns {{ hasLoop: boolean, reason?: string }}
   */
  detectRoutingLoop(asPath = []) {
    if (asPath.includes(this.localAsn)) {
      return {
        hasLoop: true,
        reason: `BGP Loop erkannt: Lokale ASN ${this.localAsn} ist bereits im AS_PATH [${asPath.join(' -> ')}] vorhanden. Route wird gedroppt!`
      };
    }
    return { hasLoop: false };
  }

  evaluateBestPath() {
    // Standard BGP Best Path Algorithm:
    // 1. Filter: Loop Detection (eigene ASN im Path)
    // 2. Highest Local Preference
    // 3. Shortest AS-Path
    // 4. Lowest MED
    const validRoutes = this.routes.filter(r => !this.detectRoutingLoop(r.asPath.slice(0, -1)).hasLoop);

    const sorted = [...(validRoutes.length > 0 ? validRoutes : this.routes)].sort((a, b) => {
      if (b.localPref !== a.localPref) return b.localPref - a.localPref;
      if (a.asPath.length !== b.asPath.length) return a.asPath.length - b.asPath.length;
      return a.med - b.med;
    });

    const bestRoute = sorted[0];

    return {
      localAsn: this.localAsn,
      anycastIp: this.anycastIp,
      bestRoute,
      allRoutes: sorted.map((r, idx) => ({
        ...r,
        isBest: idx === 0,
        status: idx === 0 ? 'ACTIVE / BEST' : 'BACKUP / SUPPRESSED'
      }))
    };
  }
}

