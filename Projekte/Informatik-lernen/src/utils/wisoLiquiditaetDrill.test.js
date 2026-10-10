import { describe, it, expect } from 'vitest';
import { calculateLiquiditaetAndWorkingCapital, LIQUIDITAET_DRILL_QUESTIONS } from './wisoLiquiditaetEngine';

const correct = (id) => {
  const q = LIQUIDITAET_DRILL_QUESTIONS.find((x) => x.id === id);
  return q.optionen[q.korrektIndex];
};

describe('LIQUIDITAET_DRILL_QUESTIONS gegen die Engine', () => {
  it('liq_2: 40.000 / 160.000 → 25 % (Liquidität 1. Grades)', () => {
    const r = calculateLiquiditaetAndWorkingCapital({ fluessigeMittel: 40000, kurzfristigeVerbindlichkeiten: 160000 });
    expect(r.liquiditaet1).toBeCloseTo(25, 5);
    expect(r.statusL1).toBe('OPTIMAL');
    expect(correct('liq_2')).toBe('25 %');
  });

  it('liq_3: Umlaufvermögen 300.000 / 200.000 → 150 % (Liquidität 3. Grades)', () => {
    const r = calculateLiquiditaetAndWorkingCapital({
      fluessigeMittel: 50000,
      kurzfristigeForderungen: 100000,
      vorraete: 150000,
      kurzfristigeVerbindlichkeiten: 200000
    });
    expect(r.liquiditaet3).toBeCloseTo(150, 5);
    expect(r.statusL3).toBe('OPTIMAL');
    expect(correct('liq_3')).toBe('150 %');
  });

  it('liq_1/liq_4: Liquidität 2. Grades ohne Vorräte, unter 100 % ist Unterdeckung', () => {
    const r = calculateLiquiditaetAndWorkingCapital({
      fluessigeMittel: 20000,
      kurzfristigeForderungen: 60000,
      vorraete: 500000,
      kurzfristigeVerbindlichkeiten: 100000
    });
    expect(r.liquiditaet2).toBeCloseTo(80, 5);
    expect(r.statusL2).toBe('UNTERDECKUNG');
    expect(correct('liq_1')).toMatch(/Flüssige Mittel und kurzfristige Forderungen/);
    expect(correct('liq_4')).toMatch(/Richtwert von 100 % ist unterschritten/);
  });
});
