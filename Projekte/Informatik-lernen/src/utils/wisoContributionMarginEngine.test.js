import { describe, it, expect } from 'vitest';
import {
  calculateContributionMargin,
  calculateMultiStageContribution
} from './wisoContributionMarginEngine';

describe('IHK WISO Contribution Margin & BEP Engine', () => {
  it('calculates unit contribution margin, BEP quantity and profit accurately', () => {
    const res = calculateContributionMargin({
      preis: 100,
      variableStueckkosten: 60,
      fixkosten: 20000,
      menge: 1000
    });

    expect(res.stueckDb).toBe(40); // 100 - 60
    expect(res.dbQuotePercent).toBe(40);
    expect(res.bepMenge).toBe(500); // 20000 / 40 = 500 Stk.
    expect(res.gesamtDb).toBe(40000);
    expect(res.betriebsergebnis).toBe(20000); // 40000 - 20000
    expect(res.isProfit).toBe(true);
  });

  it('calculates multi-stage fixed cost contribution up to net operating income', () => {
    const res = calculateMultiStageContribution({
      erloese: 100000,
      varKosten: 50000,
      erzeugnisFixkosten: 10000,
      gruppenFixkosten: 5000,
      bereichsFixkosten: 10000,
      unternehmensFixkosten: 15000
    });

    expect(res.db1).toBe(50000);
    expect(res.db2).toBe(40000);
    expect(res.db3).toBe(35000);
    expect(res.db4).toBe(25000);
    expect(res.betriebsergebnis).toBe(10000);
  });
});
