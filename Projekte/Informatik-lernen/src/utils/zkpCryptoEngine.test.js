import { describe, it, expect } from 'vitest';
import { EllipticCurve, simulateSchnorrZkp } from './zkpCryptoEngine';

describe('ZKP Crypto Engine (Elliptic Curves)', () => {
  // Simple curve for testing: y^2 = x^3 + 2x + 2 (mod 17)
  const curve = new EllipticCurve(2n, 2n, 17n);

  it('calculates modulo correctly for negative numbers', () => {
    expect(curve.mod(-5n, 17n)).toBe(12n);
    expect(curve.mod(22n, 17n)).toBe(5n);
  });

  it('calculates modular inverse correctly', () => {
    expect(curve.modInverse(3n, 11n)).toBe(4n); // 3 * 4 = 12 = 1 (mod 11)
    expect(curve.modInverse(10n, 17n)).toBe(12n); // 10 * 12 = 120 = 1 (mod 17)
  });

  it('adds two points P and Q on the curve', () => {
    // Points on y^2 = x^3 + 2x + 2 (mod 17)
    const P = [5n, 1n];
    const Q = [10n, 6n]; // Another point on the curve
    
    const R = curve.pointAdd(P, Q);
    // lambda = (6 - 1) / (10 - 5) = 5 / 5 = 1
    // rx = 1^2 - 5 - 10 = 1 - 15 = -14 = 3 (mod 17)
    // ry = 1 * (5 - 3) - 1 = 1 (mod 17)
    expect(R[0]).toBe(3n);
    expect(R[1]).toBe(1n);
  });

  it('doubles a point P', () => {
    const P = [5n, 1n];
    const R = curve.pointAdd(P, P);
    
    // 3x^2 + a = 3(25) + 2 = 77 = 9 (mod 17)
    // 2y = 2
    // lambda = 9 / 2 = 9 * 9 = 81 = 13 (mod 17)
    // rx = 169 - 10 = 159 = 6 (mod 17)
    // ry = 13 * (5 - 6) - 1 = -13 - 1 = -14 = 3 (mod 17)
    expect(R[0]).toBe(6n);
    expect(R[1]).toBe(3n);
  });

  it('performs scalar multiplication k * P', () => {
    const P = [5n, 1n];
    const R2 = curve.scalarMult(2n, P); // Double
    expect(R2[0]).toBe(6n);
    expect(R2[1]).toBe(3n);
    
    const R3 = curve.scalarMult(3n, P); // P + 2P
    // R3 should be P + R2 = (5, 1) + (6, 3)
    // lambda = (3-1) / (6-5) = 2/1 = 2
    // rx = 4 - 5 - 6 = -7 = 10 (mod 17)
    // ry = 2(5 - 10) - 1 = -10 - 1 = -11 = 6 (mod 17)
    expect(R3[0]).toBe(10n);
    expect(R3[1]).toBe(6n);
  });

  it('verifies Schnorr ZKP simulation', () => {
    const G = [5n, 1n];
    const orderN = 19n; // Order of G for this curve is 19
    const privateKeyX = 7n;
    
    const result = simulateSchnorrZkp(curve, G, orderN, privateKeyX);
    expect(result.isValid).toBe(true);
    
    // sG should equal R + cY
    expect(result.sG[0]).toBe(result.checkR[0]);
    expect(result.sG[1]).toBe(result.checkR[1]);
  });
});
