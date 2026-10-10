import { describe, it, expect } from 'vitest';
import {
  calculatePersonalbedarf,
  calculateHrMetrics
} from './wisoPersonalPlanungEngine';

describe('wisoPersonalPlanungEngine', () => {
  it('correctly calculates gross and net workforce demand (Einstellung)', () => {
    const res = calculatePersonalbedarf({
      einsatzbedarf: 20,
      reservebedarfProzent: 10, // 20 * 0.1 = 2
      aktuellerBestand: 22,
      feststehendeAbgaenge: 4,
      feststehendeZugaenge: 1
    });

    // Brutto: 20 + 2 = 22
    expect(res.bruttoPersonalbedarf).toBe(22);
    // Zukünftiger Bestand: 22 - 4 + 1 = 19
    expect(res.zukuenftigerPersonalbestand).toBe(19);
    // Netto: 22 - 19 = 3 (Unterdeckung)
    expect(res.nettoPersonalbedarf).toBe(3);
    expect(res.actionType).toBe('Einstellung');
  });

  it('correctly calculates HR metrics (ZVEI, BDA & Krankenquote)', () => {
    const res = calculateHrMetrics({
      abgaenge: 5,
      anfangsbestand: 50,
      endbestand: 50,
      zugaenge: 5,
      krankheitstageGesamt: 120,
      sollArbeitstageGesamt: 2400
    });

    // Ø Bestand = 50
    expect(res.durchschnittsbestand).toBe(50);
    // ZVEI: (5 / 50) * 100 = 10%
    expect(res.fluktuationZveiPercent).toBe(10);
    // BDA: (5 / (50 + 5)) * 100 = 9.09%
    expect(res.fluktuationBdaPercent).toBe(9.09);
    // Krankenquote: (120 / 2400) * 100 = 5%
    expect(res.krankenquotePercent).toBe(5);
  });
});
