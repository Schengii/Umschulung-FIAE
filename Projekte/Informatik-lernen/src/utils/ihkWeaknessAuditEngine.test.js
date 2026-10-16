import { describe, it, expect } from 'vitest';
import { 
  auditWeaknesses, 
  generateWeaknessRecommendations, 
  mapQuestionToLernfeld,
  IHK_LEARN_FIELDS 
} from './ihkWeaknessAuditEngine';

describe('ihkWeaknessAuditEngine', () => {
  it('liefert Standardwerte bei leerer oder ungültiger Historie', () => {
    const emptyResult = auditWeaknesses([]);
    expect(emptyResult.auditedFields).toEqual([]);
    expect(emptyResult.weakFields).toEqual([]);
    expect(emptyResult.overallScore).toBe(100);

    const nullResult = auditWeaknesses(null);
    expect(nullResult.overallScore).toBe(100);
  });

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
    expect(result.overallScore).toBe(60); // 3 von 5 richtig = 60%
  });

  it('erkennt keine Schwachstellen, wenn die Fehlerquote unter 30% liegt oder zu wenige Fragen beantwortet wurden', () => {
    const history = [
      { lfId: 'LF1', isCorrect: false }, // nur 1 Frage
      { lfId: 'LF2', isCorrect: true },
      { lfId: 'LF2', isCorrect: true },
      { lfId: 'LF2', isCorrect: true },
      { lfId: 'LF2', isCorrect: false } // 1 von 4 falsch = 25% (< 30%)
    ];

    const result = auditWeaknesses(history);
    expect(result.weakFields.length).toBe(0);
  });

  it('generiert gezielte Lab-Empfehlungen für erkannte Schwachstellen über alle Lernfelder', () => {
    IHK_LEARN_FIELDS.forEach(lf => {
      const weak = [{ id: lf.id, title: lf.title, correctCount: 0, totalCount: 2, errorRatePercent: 100 }];
      const recs = generateWeaknessRecommendations(weak);
      expect(recs.length).toBe(1);
      expect(recs[0].recommendedLab).toBeTruthy();
      expect(recs[0].tip).toBeTruthy();
    });

    const specificWeak = [
      { id: 'LF4', title: 'LF4', correctCount: 1, totalCount: 4, errorRatePercent: 75 },
      { id: 'LF10', title: 'LF10', correctCount: 0, totalCount: 3, errorRatePercent: 100 }
    ];
    const recs = generateWeaknessRecommendations(specificWeak);
    expect(recs[0].recommendedLab).toBe('bsi_grundschutz_lab');
    expect(recs[1].recommendedLab).toBe('clean_arch_lab');
  });

  describe('mapQuestionToLernfeld', () => {
    it('behandelt ungültige oder leere Eingaben mit Fallback-Werten', () => {
      expect(mapQuestionToLernfeld(null)).toBe('LF1');
      expect(mapQuestionToLernfeld(undefined)).toBe('LF1');
      expect(mapQuestionToLernfeld({})).toBe('LF4');
      expect(mapQuestionToLernfeld({ category: 'unbekannt_xyz' })).toBe('LF4');
    });

    it('mappt alle 12 Lernfelder anhand typischer Kategorien korrekt', () => {
      expect(mapQuestionToLernfeld({ category: 'WiSo' })).toBe('LF1');
      expect(mapQuestionToLernfeld({ category: 'Hardware-Komponenten' })).toBe('LF2');
      expect(mapQuestionToLernfeld({ category: 'DHCP-Konfiguration' })).toBe('LF3');
      expect(mapQuestionToLernfeld({ category: 'IT-Security' })).toBe('LF4');
      expect(mapQuestionToLernfeld({ category: 'Datenbanken' })).toBe('LF5');
      expect(mapQuestionToLernfeld({ category: 'ITIL Service Management' })).toBe('LF6');
      expect(mapQuestionToLernfeld({ category: 'IoT Sensoren' })).toBe('LF7');
      expect(mapQuestionToLernfeld({ category: 'REST API' })).toBe('LF8');
      expect(mapQuestionToLernfeld({ category: 'Netzwerk Routing' })).toBe('LF9');
      expect(mapQuestionToLernfeld({ category: 'Clean Architektur' })).toBe('LF10');
      expect(mapQuestionToLernfeld({ category: 'TDD Programmierung' })).toBe('LF11');
      expect(mapQuestionToLernfeld({ category: 'Algorithmus Struktogramm' })).toBe('LF12');
    });

    it('unterstützt Drill-Format mit frage und kategorie Attributen', () => {
      // kategorie statt category
      expect(mapQuestionToLernfeld({ kategorie: 'Wirtschaft' })).toBe('LF1');
      expect(mapQuestionToLernfeld({ kategorie: 'USV Anlagen' })).toBe('LF2');
      // frage statt question
      expect(mapQuestionToLernfeld({ frage: 'Welcher Schritt gehört zum DHCP DORA Ablauf?' })).toBe('LF3');
    });
  });
});
