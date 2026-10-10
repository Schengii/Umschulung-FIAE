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

  it('erkennt BGP-Routing-Schleifen (Loop Detection via eigene ASN)', () => {
    const sim = new BgpAnycastSimulator();
    const loopedPath = [64512, 65001, 64599]; // Enthält 65001 (eigene ASN)
    const loopResult = sim.detectRoutingLoop(loopedPath);

    expect(loopResult.hasLoop).toBe(true);
    expect(loopResult.reason).toContain('BGP Loop erkannt');

    const cleanPath = [64512, 64513, 64599];
    expect(sim.detectRoutingLoop(cleanPath).hasLoop).toBe(false);
  });

  it('erlaubt AS-Path Prepending zur künstlichen Pfadverlängerung', () => {
    const sim = new BgpAnycastSimulator();
    const initialLen = sim.routes[0].asPath.length;
    sim.prependAsPath(64512, 3);

    expect(sim.routes[0].asPath.length).toBeGreaterThan(initialLen);
  });
});

