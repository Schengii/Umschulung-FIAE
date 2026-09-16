import { describe, it, expect } from 'vitest';
import {
  float32ToBits,
  bitsToFloat32,
  intToTwosComplement,
  solveKarnaughMap2Var
} from './ieee754';

describe('ieee754', () => {
  it('konvertiert Float32 nach Bits und zurück', () => {
    const res = float32ToBits(1.0);
    expect(res.signBit).toBe('0');
    expect(res.exponentBits).toBe('01111111'); // 127
    expect(res.unbiasedExponent).toBe(0);
    expect(res.mantissaBits).toBe('00000000000000000000000');

    const back = bitsToFloat32(res.rawBits);
    expect(back.decimalValue).toBe(1.0);
  });

  it('erkennt Sonderfälle wie ±0, Infinity und NaN', () => {
    const zero = float32ToBits(0);
    expect(zero.classification).toContain('+0');

    const inf = float32ToBits(Infinity);
    expect(inf.classification).toBe('+Infinity');

    const nan = float32ToBits(NaN);
    expect(nan.classification).toBe('NaN (Not a Number)');
  });

  it('berechnet Zweierkomplement 8-Bit', () => {
    const pos = intToTwosComplement(5, 8);
    expect(pos.bitString).toBe('00000101');

    const neg = intToTwosComplement(-5, 8);
    expect(neg.bitString).toBe('11111011');
    expect(neg.isOverflow).toBe(false);

    const overflow = intToTwosComplement(200, 8);
    expect(overflow.isOverflow).toBe(true);
  });

  it('minimiert 2-Variablen Karnaugh-Map', () => {
    // Alles 1
    expect(solveKarnaughMap2Var([1, 1, 1, 1])).toBe('1');
    // Alles 0
    expect(solveKarnaughMap2Var([0, 0, 0, 0])).toBe('0');
    // Nur f(1,0) und f(1,1) -> A=1
    expect(solveKarnaughMap2Var([0, 0, 1, 1])).toBe('A');
  });
});
