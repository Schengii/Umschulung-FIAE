import { describe, it, expect } from 'vitest';
import { calculateLoanSchedule } from './wisoLoanCollateralEngine';

describe('IHK WISO Loan & Collateral Engine', () => {
  it('calculates annuity loan with constant capital service', () => {
    const res = calculateLoanSchedule({
      darlehensbetrag: 100000,
      zinssatzPercent: 5,
      laufzeitJahre: 5,
      darlehensTyp: 'ANNUITY'
    });

    expect(res.schedule.length).toBe(5);
    expect(res.schedule[0].kapitaldienst).toBeCloseTo(res.schedule[1].kapitaldienst, 0);
    expect(res.schedule[4].restschuld).toBe(0);
    expect(res.gesamtZinsen).toBeGreaterThan(0);
  });

  it('calculates installment loan with constant principal repayment', () => {
    const res = calculateLoanSchedule({
      darlehensbetrag: 100000,
      zinssatzPercent: 5,
      laufzeitJahre: 5,
      darlehensTyp: 'INSTALLMENT'
    });

    expect(res.schedule[0].tilgung).toBe(20000);
    expect(res.schedule[1].tilgung).toBe(20000);
    expect(res.schedule[0].zinsen).toBe(5000);
    expect(res.schedule[1].zinsen).toBe(4000); // 80000 * 0.05 = 4000
    expect(res.schedule[4].restschuld).toBe(0);
  });
});
