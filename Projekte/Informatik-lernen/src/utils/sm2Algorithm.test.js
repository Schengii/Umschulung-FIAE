import { describe, it, expect } from 'vitest';
import { calculateSm2NextReview, calculateEbbinghausCurve } from './sm2Algorithm';

describe('sm2Algorithm', () => {
  it('advances repetitions and interval on successful grade 4/5', () => {
    // First review with perfect score (grade 5)
    const step1 = calculateSm2NextReview({ grade: 5, repetitions: 0, easeFactor: 2.5, interval: 0 });
    expect(step1.repetitions).toBe(1);
    expect(step1.interval).toBe(1);
    expect(step1.easeFactor).toBe(2.6);

    // Second review
    const step2 = calculateSm2NextReview({ grade: 5, repetitions: step1.repetitions, easeFactor: step1.easeFactor, interval: step1.interval });
    expect(step2.repetitions).toBe(2);
    expect(step2.interval).toBe(6);

    // Third review
    const step3 = calculateSm2NextReview({ grade: 4, repetitions: step2.repetitions, easeFactor: step2.easeFactor, interval: step2.interval });
    expect(step3.repetitions).toBe(3);
    expect(step3.interval).toBeGreaterThan(6);
  });

  it('resets repetitions on failed grade < 3', () => {
    const failed = calculateSm2NextReview({ grade: 2, repetitions: 5, easeFactor: 2.5, interval: 30 });
    expect(failed.repetitions).toBe(0);
    expect(failed.interval).toBe(1);
    expect(failed.easeFactor).toBeLessThan(2.5);
  });

  it('calculates decaying Ebbinghaus forgetting curve', () => {
    const curve = calculateEbbinghausCurve(5, 10);
    expect(curve.length).toBe(11);
    expect(curve[0].retentionPercent).toBe(100);
    expect(curve[10].retentionPercent).toBeLessThan(50);
  });
});
