import { describe, it, expect } from 'vitest';
import { calculateSM2 } from './srsAlgorithm';

describe('calculateSM2 Algorithm', () => {
  it('should reset interval to 1 on quality < 3', () => {
    const result = calculateSM2({ quality: 2, repetitions: 3, interval: 15, easeFactor: 2.5 });
    expect(result.repetitions).toBe(0);
    expect(result.interval).toBe(1);
    expect(result.easeFactor).toBeLessThan(2.5);
  });

  it('should increase interval to 6 on second successful repetition', () => {
    const result = calculateSM2({ quality: 4, repetitions: 1, interval: 1, easeFactor: 2.5 });
    expect(result.repetitions).toBe(2);
    expect(result.interval).toBe(6);
  });

  it('should multiply by ease factor on subsequent successful repetitions', () => {
    const result = calculateSM2({ quality: 5, repetitions: 2, interval: 6, easeFactor: 2.5 });
    expect(result.repetitions).toBe(3);
    expect(result.interval).toBe(15);
    expect(result.easeFactor).toBeGreaterThan(2.5);
  });
});
