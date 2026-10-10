import { describe, it, expect } from 'vitest';
import { auditWeaknesses, generateWeaknessRecommendations } from './ihkWeaknessAuditEngine';

describe('ihkWeaknessAuditEngine', () => {
  it('aggregiert Antworten nach Lernfeldern und berechnet die Fehlerquote', () => {
    const history = [
      { lfId: 'LF4', isCorrect: false },
      { lfId: 'LF4', isCorrect: false },
      { lfId: 'LF4', isCorrect: true },
      { lfId: 'LF9', isCorrect: true },
      { lfId: 'LF9', isCorrect: true }
    ];

    const result = auditWeaknesses(history);
    expect(result.auditedFields.length).toBe(2);

    const lf4 = result.auditedFields.find(f => f.id === 'LF4');
    expect(lf4.errorRatePercent).toBe(67); // 2 von 3 falsch

    expect(result.weakFields.length).toBe(1);
    expect(result.weakFields[0].id).toBe('LF4');
  });

  it('generiert gezielte Lab-Empfehlungen für erkannte Schwachstellen', () => {
    const weak = [{ id: 'LF4', title: 'LF4', correctCount: 1, totalCount: 4, errorRatePercent: 75 }];
    const recs = generateWeaknessRecommendations(weak);
    expect(recs[0].recommendedLab).toBe('bsi_grundschutz_lab');
    expect(recs[0].tip).toContain('BSI IT-Grundschutz');
  });
});
