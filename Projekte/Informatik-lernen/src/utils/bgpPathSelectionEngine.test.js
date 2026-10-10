import { describe, it, expect } from 'vitest';
import { 
  selectBestBgpPath, 
  DEFAULT_BGP_CANDIDATES 
} from './bgpPathSelectionEngine';

describe('BGP Path Selection Engine (RFC 4271)', () => {
  it('selects route with highest Local Preference first', () => {
    const res = selectBestBgpPath(DEFAULT_BGP_CANDIDATES);
    expect(res.bestRoute.peerName).toBe('Direct-Peer-Beta');
    expect(res.winningCriteria).toBe('Highest LocalPref');
  });

  it('falls back to Shortest AS-Path when LocalPref is equal', () => {
    const candidates = [
      {
        peerName: 'Route-A',
        prefix: '10.0.0.0/8',
        weight: 100,
        localPref: 100,
        locallyOriginated: false,
        asPath: [65001, 65002],
        origin: 'IGP',
        med: 100,
        peerType: 'eBGP',
        routerId: '1.1.1.1'
      },
      {
        peerName: 'Route-B',
        prefix: '10.0.0.0/8',
        weight: 100,
        localPref: 100,
        locallyOriginated: false,
        asPath: [65003], // 1 hop vs 2 hops
        origin: 'IGP',
        med: 100,
        peerType: 'eBGP',
        routerId: '2.2.2.2'
      }
    ];

    const res = selectBestBgpPath(candidates);
    expect(res.bestRoute.peerName).toBe('Route-B');
    expect(res.decisionSteps[0].name).toBe('Shortest AS-Path');
  });

  it('selects lowest MED when attributes are otherwise identical', () => {
    const candidates = [
      {
        peerName: 'ISP-High-MED',
        prefix: '10.0.0.0/8',
        weight: 100,
        localPref: 100,
        locallyOriginated: false,
        asPath: [65001],
        origin: 'IGP',
        med: 250,
        peerType: 'eBGP',
        routerId: '1.1.1.1'
      },
      {
        peerName: 'ISP-Low-MED',
        prefix: '10.0.0.0/8',
        weight: 100,
        localPref: 100,
        locallyOriginated: false,
        asPath: [65001],
        origin: 'IGP',
        med: 50, // lower MED wins
        peerType: 'eBGP',
        routerId: '2.2.2.2'
      }
    ];

    const res = selectBestBgpPath(candidates);
    expect(res.bestRoute.peerName).toBe('ISP-Low-MED');
  });
});
