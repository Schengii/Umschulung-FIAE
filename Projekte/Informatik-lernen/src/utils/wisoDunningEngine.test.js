import { describe, it, expect } from 'vitest';
import {
  calculateSkontoEffektivzins,
  calculateVerzugszinsen,
  IHK_DUNNING_STAGES
} from './wisoDunningEngine';

describe('IHK WISO Skonto & Dunning Engine', () => {
  it('calculates effective annual interest rate for 3% Skonto in 10 days / 30 net', () => {
    const res = calculateSkontoEffektivzins({
      skontoPercent: 3.0,
      zahlungszielTage: 30,
      skontofristTage: 10
    });

    expect(res.kreditTage).toBe(20);
    expect(res.effektivzinsPercent).toBe(54.0); // (3 * 360) / 20 = 54%
    expect(res.recommendation).toContain('Skontonutzung dringend empfohlen');
  });

  it('calculates statutory default interest for B2B transactions with 40 euro compensation', () => {
    const res = calculateVerzugszinsen({
      rechnungsbetrag: 10000,
      verzugstage: 30,
      isB2B: true,
      basiszinssatzPercent: 3.62
    });

    expect(res.verzugszinsSatzPercent).toBe(12.62); // 3.62 + 9%
    expect(res.mahnpauschaleBetrag).toBe(40.0);
    expect(res.zinsenBetrag).toBeCloseTo(105.17, 1);
    expect(res.gesamtForderung).toBeGreaterThan(10100);
  });

  it('contains valid statutory dunning procedure stages', () => {
    expect(IHK_DUNNING_STAGES.length).toBe(4);
    const vb = IHK_DUNNING_STAGES.find(s => s.stage.includes('Vollstreckungsbescheid'));
    expect(vb.type).toContain('Vollstreckungstitel');
  });
});
