import { describe, it, expect } from 'vitest';
import { 
  gfMultiply, 
  calculateRaid6Parity, 
  simulateRaid6Recovery 
} from './raid6GaloisEngine';

describe('RAID 6 Galois Field GF(2^8) & Dual Parity Engine', () => {
  it('correctly calculates GF(2^8) multiplication', () => {
    // In GF(2^8) with poly 0x11d: 2 * 1 = 2
    expect(gfMultiply(1, 2)).toBe(2);
    // Commutativity
    expect(gfMultiply(25, 4)).toBe(gfMultiply(4, 25));
    // Zero property
    expect(gfMultiply(0, 150)).toBe(0);
  });

  it('calculates P (XOR) and Q (Galois) parity bytes for a data stripe', () => {
    const data = [0x41, 0x42, 0x43, 0x44]; // 'A', 'B', 'C', 'D'
    const res = calculateRaid6Parity(data);

    // P must equal XOR sum of all bytes
    const expectedP = 0x41 ^ 0x42 ^ 0x43 ^ 0x44;
    expect(res.pParity).toBe(expectedP);
    expect(res.qParity).toBeGreaterThanOrEqual(0);
    expect(res.qParity).toBeLessThanOrEqual(255);
  });

  it('simulates recovery from 0, 1, 2 and 3 disk failures', () => {
    const data = [10, 20, 30, 40];

    // 0 failures
    const rec0 = simulateRaid6Recovery(data, []);
    expect(rec0.canRecover).toBe(true);
    expect(rec0.status).toBe('OPTIMAL');

    // 1 failure
    const rec1 = simulateRaid6Recovery(data, [1]);
    expect(rec1.canRecover).toBe(true);
    expect(rec1.status).toBe('DEGRADED_SINGLE');

    // 2 failures
    const rec2 = simulateRaid6Recovery(data, [0, 2]);
    expect(rec2.canRecover).toBe(true);
    expect(rec2.status).toBe('DEGRADED_DUAL');

    // 3 failures (exceeds fault tolerance)
    const rec3 = simulateRaid6Recovery(data, [0, 1, 2]);
    expect(rec3.canRecover).toBe(false);
    expect(rec3.status).toBe('FAILED');
  });
});
