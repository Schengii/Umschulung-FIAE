import { describe, it, expect } from 'vitest';
import { getInitialLightningState, streamSatsTick } from '../utils/lightningStream';

describe('Bitcoin Lightning Micro-Payment Streaming Engine', () => {
  it('manages channel balance and streams sats per second tick', () => {
    let state = getInitialLightningState();
    expect(state.balanceSats).toBeGreaterThan(0);
    expect(state.streamingRateSatsPerSec).toBe(25);

    state = streamSatsTick(state);
    expect(state.totalStreamedSats).toBe(25);
    expect(state.balanceSats).toBe(250000 - 25);
  });
});
