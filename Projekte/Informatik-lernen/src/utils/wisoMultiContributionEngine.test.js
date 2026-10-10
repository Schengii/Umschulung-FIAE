import { describe, it, expect } from 'vitest';
import { calculateMultiContributionMargin, DEFAULT_PRODUCT_LINES } from './wisoMultiContributionEngine';

describe('wisoMultiContributionEngine', () => {
  it('berechnet mehrstufige Deckungsbeiträge DB I bis DB IV und Betriebsergebnis', () => {
    const res = calculateMultiContributionMargin({
      products: DEFAULT_PRODUCT_LINES,
      groupFixCosts: 5000,
      divisionFixCosts: 7000,
      companyFixCosts: 6000
    });

    expect(res.totalRevenue).toBe(1200 * 50 + 400 * 120); // 60.000 + 48.000 = 108.000
    expect(res.totalDb1).toBeGreaterThan(0);
    expect(res.totalDb2).toBeLessThan(res.totalDb1);
    expect(res.db3).toBe(res.totalDb2 - 5000);
    expect(res.operatingProfit).toBeDefined();
    expect(res.isProfitable).toBe(true);
  });

  it('berechnet Break-Even-Umsatz und Sicherheitsmarge', () => {
    const res = calculateMultiContributionMargin({
      products: DEFAULT_PRODUCT_LINES,
      groupFixCosts: 5000,
      divisionFixCosts: 7000,
      companyFixCosts: 6000
    });

    expect(res.breakEvenRevenue).toBeGreaterThan(0);
    expect(res.breakEvenRevenue).toBeLessThan(res.totalRevenue);
    expect(res.safetyMarginPercent).toBeGreaterThan(0);
  });
});
