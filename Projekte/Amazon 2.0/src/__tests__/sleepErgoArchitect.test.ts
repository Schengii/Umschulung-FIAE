import { describe, it, expect } from 'vitest';
import { computeSleepArchitecture } from '../utils/sleepErgoArchitect';

describe('Sleep & Regeneration Neuro-Architecture Engine', () => {
  it('computes wearable sleep metrics and recommends mattress firmness', () => {
    const sleep = computeSleepArchitecture();
    expect(sleep.sleepQualityScore).toBeGreaterThan(70);
    expect(sleep.deepSleepSharePercent).toBeGreaterThan(15);
    expect(sleep.recommendedFirmness).toContain('H2');
    expect(sleep.sleepErgoRecommendation).toBeDefined();
  });
});
