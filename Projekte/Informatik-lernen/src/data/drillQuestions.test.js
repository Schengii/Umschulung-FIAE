import { describe, it, expect } from 'vitest';
import { DRILL_QUESTIONS, DRILL_LAB_BY_QUESTION_ID } from './drillQuestions';
import { LAB_MODULES } from './labModulesData';
import { EXAM_QUESTIONS } from './examData';

describe('DRILL_QUESTIONS', () => {
  it('enthält die Fragen aller 8 Panel-Labs (4 je Lab)', () => {
    expect(DRILL_QUESTIONS.length).toBeGreaterThanOrEqual(32);
  });

  it('hat eindeutige IDs, auch gegenüber den Prüfungsfragen (Fehlerjournal-Schlüssel)', () => {
    const ids = DRILL_QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    const examIds = new Set(EXAM_QUESTIONS.map((q) => String(q.id)));
    expect(ids.filter((id) => examIds.has(id))).toEqual([]);
  });

  it('hat vollständige, gültige Fragen', () => {
    for (const q of DRILL_QUESTIONS) {
      expect(q.question?.length, `${q.id}: question`).toBeGreaterThan(0);
      expect(q.options.length, `${q.id}: options`).toBeGreaterThanOrEqual(2);
      expect(q.options.every((o) => typeof o === 'string' && o.length > 0), `${q.id}: Optionstexte`).toBe(true);
      expect(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length, `${q.id}: correct`).toBe(true);
      expect(q.explanation?.length, `${q.id}: explanation`).toBeGreaterThan(0);
    }
  });
});

describe('DRILL_LAB_BY_QUESTION_ID', () => {
  it('ordnet jede Drill-Frage einem existierenden Lab zu', () => {
    const labIds = new Set(LAB_MODULES.map((m) => m.id));
    for (const q of DRILL_QUESTIONS) {
      const lab = DRILL_LAB_BY_QUESTION_ID[q.id];
      expect(lab, `${q.id}: Lab`).toBeTruthy();
      expect(labIds.has(lab), `${q.id}: Lab-ID ${lab} fehlt in LAB_MODULES`).toBe(true);
    }
    expect(Object.keys(DRILL_LAB_BY_QUESTION_ID)).toHaveLength(DRILL_QUESTIONS.length);
  });
});
