import { describe, it, expect } from 'vitest';
import {
  calculateSwissWealthTax,
  simulateWealthLevy,
  SWISS_CANTON_WEALTH_TAX_DATA
} from '../wealthTaxUtils';

describe('wealthTaxUtils', () => {
  it('has comprehensive data for all 26 Swiss cantons', () => {
    expect(Object.keys(SWISS_CANTON_WEALTH_TAX_DATA).length).toBe(26);
    expect(SWISS_CANTON_WEALTH_TAX_DATA['ZH'].cantonName).toBe('Zürich');
    expect(SWISS_CANTON_WEALTH_TAX_DATA['ZG'].cantonName).toBe('Zug');
  });

  it('calculates Swiss cantonal wealth tax accurately with allowances', () => {
    // 500,000 CHF in Zug (ZG): Allowance Single = 175,000 CHF -> Taxable: 325,000 CHF
    // Tax rate: 1.5 ‰ = 0.0015 -> Due = 487.50 CHF
    const zgTax = calculateSwissWealthTax({
      totalAssetsChf: 500000,
      canton: 'ZG',
      isMarried: false
    });

    expect(zgTax.taxableAssetsChf).toBe(325000);
    expect(zgTax.effectiveTaxDueChf).toBe(487.5);
    expect(zgTax.effectiveTaxDueEur).toBeGreaterThan(500);

    // Married in Zurich (ZH): Allowance Married = 154,000 CHF
    const zhTax = calculateSwissWealthTax({
      totalAssetsChf: 100000,
      canton: 'ZH',
      isMarried: true
    });
    // 100,000 is under 154,000 allowance -> 0 CHF
    expect(zhTax.taxableAssetsChf).toBe(0);
    expect(zhTax.effectiveTaxDueChf).toBe(0);
  });

  it('simulates wealth levy scenarios for high-net-worth portfolios', () => {
    // 1,500,000 € net worth with 1,000,000 € threshold and 1.5% levy
    // Taxable: 500,000 € -> Annual: 7,500 € -> 10 Years: 75,000 €
    const levy = simulateWealthLevy({
      netWorthEur: 1500000,
      thresholdEur: 1000000,
      annualLevyRatePercent: 1.5,
      durationYears: 10
    });

    expect(levy.isAboveThreshold).toBe(true);
    expect(levy.taxableNetWorthEur).toBe(500000);
    expect(levy.annualLevyDueEur).toBe(7500);
    expect(levy.totalLevyDueEur).toBe(75000);
  });
});
