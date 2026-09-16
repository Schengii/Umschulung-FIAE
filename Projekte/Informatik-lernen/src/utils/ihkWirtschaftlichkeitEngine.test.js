import { describe, it, expect } from 'vitest';
import {
  calculateAmortisation,
  calculateMakeOrBuy,
  calculateCostComparison,
  exportWirtschaftlichkeitMarkdown
} from './ihkWirtschaftlichkeitEngine';

describe('ihkWirtschaftlichkeitEngine', () => {
  it('should calculate static amortisation duration and ROI correctly', () => {
    const res = calculateAmortisation({
      initialInvestment: 6000,
      yearlyCostSavings: 3500,
      additionalYearlyRunningCosts: 500,
      analysisPeriodYears: 3
    });

    // Net yearly savings = 3500 - 500 = 3000
    // Amortisation = 6000 / 3000 = 2.00 years = 24 months
    // Total gain = 3000 * 3 - 6000 = 3000
    // ROI = (3000 / 6000) * 100 = 50%
    expect(res.netYearlySavings).toBe(3000);
    expect(res.amortisationYears).toBe(2);
    expect(res.amortisationMonths).toBe(24);
    expect(res.roiPercent).toBe(50);
    expect(res.isViable).toBe(true);
  });

  it('should handle zero net savings without crashing', () => {
    const res = calculateAmortisation({
      initialInvestment: 5000,
      yearlyCostSavings: 1000,
      additionalYearlyRunningCosts: 1000,
      analysisPeriodYears: 3
    });

    expect(res.netYearlySavings).toBe(0);
    expect(res.amortisationMonths).toBeNull();
    expect(res.isViable).toBe(false);
  });

  it('should compare Make-or-Buy costs and recommend the cheaper option', () => {
    const res = calculateMakeOrBuy({
      developmentHours: 80,
      hourlyRateInternal: 70, // 5600
      hardwareSoftwareOnce: 1000, // Make initial = 6600
      yearlyMaintenanceInternal: 600, // 3 * 600 = 1800 -> Make total = 8400
      saasSetupCost: 2000,
      yearlySaasLicense: 3000, // 3 * 3000 = 9000 -> Buy total = 11000
      periodYears: 3
    });

    expect(res.make.totalCost).toBe(8400);
    expect(res.buy.totalCost).toBe(11000);
    expect(res.recommendation).toBe('Make');
    expect(res.difference).toBe(2600);
    expect(res.breakEvenYears).toBeDefined();
  });

  it('should calculate cumulative multi-year cost comparison', () => {
    const res = calculateCostComparison({
      oldSystem: { personnelYearly: 10000, licenseYearly: 2000, hostingYearly: 1000 }, // 13000/yr
      newSystem: { investmentOnce: 8000, personnelYearly: 3000, licenseYearly: 1000, hostingYearly: 500 }, // 4500/yr
      years: 3
    });

    expect(res.oldYearlySum).toBe(13000);
    expect(res.newYearlySum).toBe(4500);
    expect(res.yearlySavings).toBe(8500);
    expect(res.yearlyBreakdown.length).toBe(3);
    expect(res.breakEvenYear).toBe(1); // Year 1: old=13000, new=8000+4500=12500 < 13000
    expect(res.isCostEffective).toBe(true);
    expect(res.totalSavings).toBeGreaterThan(0);
  });

  it('should export formatted Markdown with tables and summary', () => {
    const amort = calculateAmortisation({});
    const mob = calculateMakeOrBuy({});
    const comp = calculateCostComparison({});

    const md = exportWirtschaftlichkeitMarkdown(amort, mob, comp, 'Automatisiertes CI/CD Portal');
    expect(md).toContain('Wirtschaftlichkeitsanalyse für Automatisiertes CI/CD Portal');
    expect(md).toContain('Make-or-Buy-Analyse');
    expect(md).toContain('Kostenvergleichsanalyse');
    expect(md).toContain('Amortisationsdauer');
  });
});
