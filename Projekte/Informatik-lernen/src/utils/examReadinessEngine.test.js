import { describe, it, expect } from 'vitest';
import { calculateExamCountdown, calculateExamReadiness } from './examReadinessEngine';

describe('examReadinessEngine', () => {
  it('calculates exam countdown correctly for given date', () => {
    // 1. April 2026 -> Sommerprüfung 5. Mai 2026
    const testDate = new Date(2026, 3, 1);
    const countdown = calculateExamCountdown(testDate);

    expect(countdown.daysRemaining).toBe(34);
    expect(countdown.targetSeason).toContain('Sommer 2026');
  });

  it('evaluates readiness score and highlights weak domains', () => {
    const domainStats = {
      ap1: { completed: 15, scoreSum: 1500 }, // 100%
      ap2_1: { completed: 15, scoreSum: 1200 }, // 80%
      ap2_2: { completed: 2, scoreSum: 100 },  // Schwach
      wiso: { completed: 20, scoreSum: 1800 },  // 90%
      project: { completed: 10, scoreSum: 900 } // 90%
    };

    const res = calculateExamReadiness(domainStats);
    expect(res.overallReadinessPercent).toBeGreaterThan(60);
    expect(res.isReady).toBe(true);
    expect(res.recommendedFocus.some(f => f.includes('AP2 Bereich 2'))).toBe(true);
  });
});
