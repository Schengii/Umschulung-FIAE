import { describe, it, expect } from 'vitest';
import { calculateAndlerOptimalOrder } from './wisoAndlerEngine';

describe('IHK WISO Andler Optimal Order Engine', () => {
  it('calculates optimal order quantity, frequency and cost intersection accurately', () => {
    // J=10000, kf=50, p=20, ls=15 -> (200*10000*50)/(20*15) = 100000000 / 300 = 333333.3 -> sqrt ~ 577.35 -> 577
    const res = calculateAndlerOptimalOrder({
      jahresbedarf: 10000,
      bestellfixeKosten: 50,
      einstandspreis: 20,
      lagerkostensatzPercent: 15
    });

    expect(res.xOpt).toBe(577);
    expect(res.nOpt).toBeCloseTo(17.33, 1);
    expect(res.bestellkosten).toBeCloseTo(res.lagerkosten, -1); // Intersection!
  });
});
