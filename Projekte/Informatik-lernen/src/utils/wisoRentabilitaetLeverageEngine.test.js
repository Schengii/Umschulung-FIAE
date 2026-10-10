import { describe, it, expect } from 'vitest';
import { calculateRentabilitaetAndLeverage } from './wisoRentabilitaetLeverageEngine';

describe('wisoRentabilitaetLeverageEngine', () => {
  it('correctly calculates rentability metrics with positive leverage effect', () => {
    // EK: 200,000 €, FK: 300,000 €, i = 5%, Gewinn = 40,000 €, Umsatz = 1,000,000 €
    const res = calculateRentabilitaetAndLeverage({
      eigenkapital: 200000,
      fremdkapital: 300000,
      fremdkapitalZinssatz: 5,
      jahresueberschuss: 40000,
      umsatzerloese: 1000000
    });

    // FK-Zinsen = 300,000 * 5% = 15,000 €
    expect(res.fremdkapitalzinsen).toBe(15000);

    // r_EK = 40,000 / 200,000 * 100 = 20%
    expect(res.eigenkapitalrentabilitaet).toBe(20);

    // r_GK = (40,000 + 15,000) / 500,000 * 100 = 11%
    expect(res.gesamtkapitalrentabilitaet).toBe(11);

    // r_U = 40,000 / 1,000,000 * 100 = 4%
    expect(res.umsatzrentabilitaet).toBe(4);

    // Verschuldungsgrad = 300k / 200k = 1.5
    expect(res.verschuldungsgrad).toBe(1.5);

    // Spread = 11% - 5% = 6% > 0 -> positiver Leverage-Effekt!
    expect(res.spread).toBe(6);
    expect(res.isPositiveLeverage).toBe(true);
  });

  it('detects negative leverage effect when borrowing interest exceeds total return', () => {
    const res = calculateRentabilitaetAndLeverage({
      eigenkapital: 200000,
      fremdkapital: 300000,
      fremdkapitalZinssatz: 12, // Hohe Zinsen
      jahresueberschuss: 10000,
      umsatzerloese: 500000
    });

    expect(res.isNegativeLeverage).toBe(true);
    expect(res.spread).toBeLessThan(0);
  });
});
