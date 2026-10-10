import { describe, it, expect } from 'vitest';
import { 
  calculateNetPresentValue, 
  calculateInternalRateOfReturn,
  generateIhkEconomicMarkdown
} from './wisoCapitalValueEngine';

describe('IHK WISO Capital Value (NPV) & Investment Appraisal Engine', () => {
  it('calculates discounted cash flows and NPV accurately', () => {
    const res = calculateNetPresentValue({
      anschaffungsauszahlung: 100000,
      kalkulationszinssatzPercent: 10,
      cashflows: [40000, 40000, 40000],
      liquidationserloes: 0
    });

    // 40000/1.1 + 40000/1.21 + 40000/1.331 = 36363.64 + 33057.85 + 30052.59 = 99474.08
    // NPV = 99474.08 - 100000 = -525.92
    expect(res.sumBarwerte).toBeCloseTo(99474, -1);
    expect(res.kapitalwert).toBeLessThan(0);
    expect(res.isProfitable).toBe(false);
    expect(res.profitabilityIndex).toBeCloseTo(0.995, 2);
  });

  it('determines dynamic payback period and profitability index correctly for positive investments', () => {
    const res = calculateNetPresentValue({
      anschaffungsauszahlung: 80000,
      kalkulationszinssatzPercent: 8,
      cashflows: [35000, 40000, 30000],
      liquidationserloes: 5000
    });

    expect(res.kapitalwert).toBeGreaterThan(0);
    expect(res.isProfitable).toBe(true);
    expect(res.profitabilityIndex).toBeGreaterThan(1.0);
    expect(res.dynamicPaybackPeriod).toBeDefined();
    expect(res.dynamicPaybackPeriod).toBeGreaterThan(2);
    expect(res.dynamicPaybackPeriod).toBeLessThan(3);
    expect(res.annuitaet).toBeGreaterThan(0);
  });

  it('calculates Internal Rate of Return (IRR / IZF)', () => {
    // 100k invest, 40k return for 3 years -> IRR should be approx 9.7%
    const irr = calculateInternalRateOfReturn(100000, [40000, 40000, 40000], 0);
    expect(irr).toBeDefined();
    expect(irr).toBeCloseTo(9.7, 0);
  });

  it('generates compliant IHK Markdown export', () => {
    const res = calculateNetPresentValue({
      anschaffungsauszahlung: 50000,
      kalkulationszinssatzPercent: 6,
      cashflows: [20000, 25000, 20000],
      liquidationserloes: 2000
    });

    const md = generateIhkEconomicMarkdown(res, 'ERP Cloud Migration');
    expect(md).toContain('ERP Cloud Migration');
    expect(md).toContain('Kapitalwert');
    expect(md).toContain('Interner Zinsfuß');
    expect(md).toContain('Profitabilitätsindex');
  });
});
