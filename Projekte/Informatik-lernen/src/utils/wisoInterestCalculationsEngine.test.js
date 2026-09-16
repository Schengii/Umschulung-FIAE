import { describe, it, expect } from 'vitest';
import {
  calculateSimpleInterest,
  calculateCompoundInterest
} from './wisoInterestCalculationsEngine';

describe('IHK WISO Interest & Compound Interest Engine', () => {
  it('calculates simple German interest (30/360) accurately', () => {
    // K = 50000, p = 6%, t = 90 Tage -> (50000 * 6 * 90) / 36000 = 750 €
    const res = calculateSimpleInterest({
      kapital: 50000,
      zinssatzPercent: 6,
      tage: 90
    });

    expect(res.zinsen).toBe(750);
    expect(res.endkapital).toBe(50750);
  });

  it('calculates compound interest (Zinseszins) and yearly progression', () => {
    const res = calculateCompoundInterest({
      anfangskapital: 10000,
      zinssatzPercent: 10,
      jahre: 3
    });

    // 10000 * (1.1)^3 = 13310
    expect(res.endkapital).toBe(13310);
    expect(res.gesamtzinsen).toBe(3310);
    expect(res.yearlyProgression.length).toBe(3);
    expect(res.yearlyProgression[0].zinsenImJahr).toBe(1000);
    expect(res.yearlyProgression[1].zinsenImJahr).toBe(1100);
  });
});
