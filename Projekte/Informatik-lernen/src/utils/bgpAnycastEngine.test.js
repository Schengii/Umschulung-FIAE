import { describe, it, expect } from 'vitest';
import { BgpAnycastSimulator } from './bgpAnycastEngine';

describe('Linux BGP Anycast Engine', () => {
  it('selects best BGP path based on shortest AS-Path when Local-Pref is tied', () => {
    const sim = new BgpAnycastSimulator();
    const res = sim.evaluateBestPath();

    expect(res.bestRoute.peerName).toContain('Frankfurt');
    expect(res.bestRoute.asPath.length).toBe(2);
    expect(res.allRoutes[0].isBest).toBe(true);
    expect(res.allRoutes[1].isBest).toBe(false);
  });
});
