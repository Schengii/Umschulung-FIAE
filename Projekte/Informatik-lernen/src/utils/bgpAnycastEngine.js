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

  evaluateBestPath() {
    // Standard BGP Best Path Algorithm:
    // 1. Highest Local Preference
    // 2. Shortest AS-Path
    // 3. Lowest MED
    const sorted = [...this.routes].sort((a, b) => {
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
