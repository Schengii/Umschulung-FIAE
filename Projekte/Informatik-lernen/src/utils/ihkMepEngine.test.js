import { describe, it, expect } from 'vitest';
import { 
  MEP_QUESTION_CATALOG,
  calculateMepCombinedScore,
  calculateRequiredMepScore
} from './ihkMepEngine';

describe('ihkMepEngine', () => {
  it('enthält Fragen für WiSo, AP2 Bereich 1 und Bereich 2', () => {
    expect(MEP_QUESTION_CATALOG.wiso.length).toBeGreaterThanOrEqual(2);
    expect(MEP_QUESTION_CATALOG.ap2_b1.length).toBeGreaterThanOrEqual(2);
    expect(MEP_QUESTION_CATALOG.ap2_b2.length).toBeGreaterThanOrEqual(2);
  });

  it('berechnet Gesamtergebnis mit 2:1 Gewichtung korrekt', () => {
    // Schriftlich: 40 Punkte, MEP: 70 Punkte => (2*40 + 70) / 3 = 150 / 3 = 50 Punkte (Bestanden)
    const res1 = calculateMepCombinedScore(40, 70);
    expect(res1.combinedPoints).toBe(50);
    expect(res1.isPassed).toBe(true);
    expect(res1.gradeLabel).toContain('Ausreichend');

    // Schriftlich: 35 Punkte, MEP: 60 Punkte => (70 + 60) / 3 = 130 / 3 = 43.33 => 43 Punkte (Nicht bestanden)
    const res2 = calculateMepCombinedScore(35, 60);
    expect(res2.combinedPoints).toBe(43);
    expect(res2.isPassed).toBe(false);
  });

  it('ermittelt benötigte MEP Punkte für 50 Punkte Bestehensgrenze', () => {
    // Bei 40 schriftlichen Punkten werden 70 MEP-Punkte benötigt
    const req1 = calculateRequiredMepScore(40, 50);
    expect(req1.minRequiredMep).toBe(70);
    expect(req1.isAchievable).toBe(true);

    // Bei 20 Punkten (Ungenügend / Note 6) werden 110 Punkte benötigt -> nicht machbar!
    const req2 = calculateRequiredMepScore(20, 50);
    expect(req2.minRequiredMep).toBe(110);
    expect(req2.isAchievable).toBe(false);
  });
});
