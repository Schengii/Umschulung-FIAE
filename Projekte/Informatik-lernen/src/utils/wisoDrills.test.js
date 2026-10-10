import { describe, it, expect } from 'vitest';
import { calculateAndlerOptimalOrder, ANDLER_DRILL_QUESTIONS } from './wisoAndlerEngine';
import {
  calculateContributionMargin,
  calculateMultiStageContribution,
  CONTRIBUTION_MARGIN_DRILL_QUESTIONS
} from './wisoContributionMarginEngine';

const correct = (list, id) => {
  const q = list.find((x) => x.id === id);
  return q.optionen[q.korrektIndex];
};

describe('ANDLER_DRILL_QUESTIONS gegen die Engine', () => {
  const r = calculateAndlerOptimalOrder({ jahresbedarf: 1000, bestellfixeKosten: 50, einstandspreis: 50, lagerkostensatzPercent: 20 });

  it('andler_1/2: x_opt = 100, 10 Bestellungen, alle 36 Tage', () => {
    expect(r.xOpt).toBe(100);
    expect(r.nOpt).toBe(10);
    expect(r.tOptDays).toBe(36);
    expect(correct(ANDLER_DRILL_QUESTIONS, 'andler_1')).toBe('100 Stück');
    expect(correct(ANDLER_DRILL_QUESTIONS, 'andler_2')).toBe('10 Bestellungen, alle 36 Tage');
  });

  it('andler_3: im Optimum sind Bestell- und Lagerkosten gleich', () => {
    expect(r.bestellkosten).toBe(500);
    expect(r.lagerkosten).toBe(500);
    expect(correct(ANDLER_DRILL_QUESTIONS, 'andler_3')).toMatch(/gleich hoch/);
  });

  it('andler_4: höhere bestellfixe Kosten erhöhen die optimale Menge', () => {
    const higher = calculateAndlerOptimalOrder({ jahresbedarf: 1000, bestellfixeKosten: 200, einstandspreis: 50, lagerkostensatzPercent: 20 });
    expect(higher.xOpt).toBeGreaterThan(r.xOpt);
    expect(correct(ANDLER_DRILL_QUESTIONS, 'andler_4')).toMatch(/steigt/);
  });
});

describe('CONTRIBUTION_MARGIN_DRILL_QUESTIONS gegen die Engine', () => {
  const r = calculateContributionMargin({ preis: 120, variableStueckkosten: 70, fixkosten: 50000, menge: 1200 });

  it('db_1..db_4: Stück-DB 50 €, BEP 1.000, Gewinn 10.000 €, DB-Quote 41,7 %', () => {
    expect(r.stueckDb).toBe(50);
    expect(r.bepMenge).toBe(1000);
    expect(r.betriebsergebnis).toBe(10000);
    expect(r.dbQuotePercent).toBeCloseTo(41.67, 2);
    expect(correct(CONTRIBUTION_MARGIN_DRILL_QUESTIONS, 'db_1')).toBe('50 €');
    expect(correct(CONTRIBUTION_MARGIN_DRILL_QUESTIONS, 'db_2')).toBe('1.000 Stück');
    expect(correct(CONTRIBUTION_MARGIN_DRILL_QUESTIONS, 'db_3')).toBe('10.000 € Gewinn');
    expect(correct(CONTRIBUTION_MARGIN_DRILL_QUESTIONS, 'db_4')).toBe('ca. 41,7 %');
  });

  it('db_5: Unternehmensfixkosten werden zuletzt abgezogen (DB IV → Betriebsergebnis)', () => {
    const m = calculateMultiStageContribution({ erloese: 1000, varKosten: 400, erzeugnisFixkosten: 100, gruppenFixkosten: 100, bereichsFixkosten: 100, unternehmensFixkosten: 100 });
    expect(m.db4 - 100).toBe(m.betriebsergebnis);
    expect(correct(CONTRIBUTION_MARGIN_DRILL_QUESTIONS, 'db_5')).toBe('Unternehmensfixkosten');
  });
});
