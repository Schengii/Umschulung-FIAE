import { describe, it, expect } from 'vitest';
import { DRILL_QUESTIONS } from './drillQuestions';
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
