import { describe, it, expect } from 'vitest';
import { calculateLiquiditaetAndWorkingCapital } from './wisoLiquiditaetEngine';

describe('wisoLiquiditaetEngine', () => {
  it('correctly calculates liquidity ratios and working capital for standard company', () => {
    // Flüssige Mittel = 50k, Forderungen = 120k, Vorräte = 180k (UV = 350k), Verb = 150k
    const res = calculateLiquiditaetAndWorkingCapital({
      fluessigeMittel: 50000,
      kurzfristigeForderungen: 120000,
      vorraete: 180000,
      kurzfristigeVerbindlichkeiten: 150000,
      umlaufvermoegen: 350000
    });

    // L1 = 50,000 / 150,000 = 33.33%
    expect(res.liquiditaet1).toBe(33.33);
    expect(res.statusL1).toBe('OPTIMAL');

    // L2 = (50,000 + 120,000) / 150,000 = 170,000 / 150,000 = 113.33%
    expect(res.liquiditaet2).toBe(113.33);
    expect(res.statusL2).toBe('OPTIMAL');

    // L3 = 350,000 / 150,000 = 233.33%
    expect(res.liquiditaet3).toBe(233.33);
    expect(res.statusL3).toBe('OPTIMAL');

    // Net Working Capital = 350,000 - 150,000 = 200,000 €
    expect(res.netWorkingCapital).toBe(200000);
  });

  it('detects liquidity bottleneck when short term liabilities exceed liquid assets', () => {
    const res = calculateLiquiditaetAndWorkingCapital({
      fluessigeMittel: 10000,
      kurzfristigeForderungen: 30000,
      vorraete: 50000,
      kurzfristigeVerbindlichkeiten: 100000,
      umlaufvermoegen: 90000
    });

    // L1 = 10% (< 20%) -> KRITISCH
    expect(res.liquiditaet1).toBe(10);
    expect(res.statusL1).toBe('KRITISCH');

    // L2 = 40% (< 100%) -> UNTERDECKUNG
    expect(res.liquiditaet2).toBe(40);
    expect(res.statusL2).toBe('UNTERDECKUNG');

    // NWC = 90k - 100k = -10k
    expect(res.netWorkingCapital).toBe(-10000);
  });
});
