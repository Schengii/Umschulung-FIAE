import { describe, it, expect } from 'vitest';
import { gatherIceCandidates, nominateIcePair } from './webrtcIceGatheringEngine';

describe('webrtcIceGatheringEngine', () => {
  it('gathers host, srflx, and relay candidates in standard full cone environment', () => {
    const candidates = gatherIceCandidates({
      natType: 'FullCone',
      stunReachable: true,
      turnReachable: true,
      firewallBlocksDirectUdp: false
    });

    expect(candidates.length).toBe(3);
    expect(candidates[0].type).toBe('host'); // Highest priority
    expect(candidates[1].type).toBe('srflx');
    expect(candidates[2].type).toBe('relay');
  });

  it('omits srflx candidate in Symmetric NAT environment', () => {
    const candidates = gatherIceCandidates({
      natType: 'Symmetric',
      stunReachable: true,
      turnReachable: true,
      firewallBlocksDirectUdp: false
    });

    expect(candidates.some(c => c.type === 'srflx')).toBe(false);
    expect(candidates.some(c => c.type === 'relay')).toBe(true);
  });

  it('nominates TURN relay when both peers are behind symmetric NAT', () => {
    const local = { natType: 'Symmetric', stunReachable: true, turnReachable: true, firewallBlocksDirectUdp: false };
    const remote = { natType: 'Symmetric', stunReachable: true, turnReachable: true, firewallBlocksDirectUdp: false };
    const candidates = gatherIceCandidates(local);

    const result = nominateIcePair(candidates, local, remote);
    expect(result.connectionType).toBe('RELAY_TURN');
    expect(result.nominatedPair?.type).toBe('relay');
  });
});
