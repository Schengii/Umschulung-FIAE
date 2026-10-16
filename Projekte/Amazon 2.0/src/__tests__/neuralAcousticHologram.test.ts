import { describe, it, expect } from 'vitest';
import { computeAcousticProfile } from '../utils/neuralAcousticHologram';

describe('Neural-Audio Acoustic Hologram Engine', () => {
  it('computes acoustic profiles for cathedral and studio environments', () => {
    const studio = computeAcousticProfile('Abbey Road Studio A');
    expect(studio.reverbDecaySeconds).toBe(0.6);
    expect(studio.frequencyClarityScore).toBeGreaterThan(90);

    const cathedral = computeAcousticProfile('Kölner Dom (Kathedrale)');
    expect(cathedral.reverbDecaySeconds).toBe(4.8);
    expect(cathedral.headTrackingActive).toBe(true);
  });
});
