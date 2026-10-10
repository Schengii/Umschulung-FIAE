import { describe, it, expect } from 'vitest';
import { 
  DEFAULT_NWA_CRITERIA, 
  DEFAULT_NWA_OPTIONS, 
  calculateNwaScores, 
  runNwaMonteCarloStressTest 
} from './nwaSensitivityEngine';

describe('nwaSensitivityEngine', () => {
  it('calculates deterministic baseline scores correctly', () => {
    const scores = calculateNwaScores(DEFAULT_NWA_CRITERIA, DEFAULT_NWA_OPTIONS);
    expect(scores.length).toBe(3);
    expect(scores[0].totalWeightedScore).toBeGreaterThan(0);
    expect(scores[0].koFailed).toBe(false);
  });

  it('correctly eliminates options failing K.O. criteria', () => {
    const optionsWithKoFailure = [
      {
        id: 'unsafe_cloud',
        name: 'Unsafe Cloud',
        scores: { kosten: 10, sicherheit: 2, skalierbarkeit: 10, wartbarkeit: 10, vendor_lockin: 10 }
      }
    ];

    const scores = calculateNwaScores(DEFAULT_NWA_CRITERIA, optionsWithKoFailure);
    expect(scores[0].koFailed).toBe(true);
    expect(scores[0].koReason).toContain('K.O. Kriterium');
  });

  it('runs Monte-Carlo sensitivity stress test and outputs win percentages', () => {
    const testRes = runNwaMonteCarloStressTest(DEFAULT_NWA_CRITERIA, DEFAULT_NWA_OPTIONS, 200, 20);
    expect(testRes.iterations).toBe(200);
    expect(testRes.robustnessPercentages.length).toBe(3);
    const sumWinRate = testRes.robustnessPercentages.reduce((a, b) => a + b.winRatePercent, 0);
    expect(sumWinRate).toBeGreaterThan(95); // Account for float rounding
  });
});
