import { describe, it, expect } from 'vitest';
import { calculateFinancingComparison } from './wisoFinancingEngine';

describe('wisoFinancingEngine', () => {
  it('berechnet 3 Finanzierungsoptionen und ermittelt Empfehlung', () => {
    const res = calculateFinancingComparison({
      investmentAmount: 10000,
      usefulLifeYears: 3,
      skontoPercent: 2.0,
      creditInterestRatePercent: 6.0,
      monthlyLeasingRate: 320,
      corporateTaxRatePercent: 30.0
    });

    expect(res.options.length).toBe(3);
    const [cash, _loan, lease] = res.options;

    // Sofortkauf: 10.000 € - 2% = 9.800 €. Steuerersparnis (30%) = 2.940 €. Netto = 6.860 €
    expect(cash.totalCashOutflow).toBe(9800);
    expect(cash.taxShieldSavings).toBe(2940);
    expect(cash.netEffectiveCost).toBe(6860);

    // Leasing: 36 Monate * 320 € = 11.520 €. Steuerersparnis (30%) = 3.456 €. Netto = 8.064 €
    expect(lease.totalCashOutflow).toBe(11520);
    expect(lease.taxShieldSavings).toBe(3456);
    expect(lease.netEffectiveCost).toBe(8064);

    expect(res.recommendation).toContain('Sofortkauf');
  });
});
