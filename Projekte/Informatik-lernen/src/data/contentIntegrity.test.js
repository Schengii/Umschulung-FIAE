import { describe, it, expect } from 'vitest';
import { EXAM_QUESTIONS, IHK_EXAM_MODES } from './examData';
import { QUIZ_ARENA_CATEGORIES } from './quizArenaData';
import { FLASHCARDS_DATA } from './flashcardsData';
import { GLOSSARY_TERMS } from './glossaryData';

// Schutz der Lerninhalte: Eine falsche `correct`-Zahl oder doppelte ID wäre ein
// stiller Fachfehler (falsche Musterlösung bzw. verfälschtes Fehlerjournal).
// Sie wird hier beim Hinzufügen neuer Fragen sofort sichtbar.

const duplicates = (arr) => arr.filter((x, i) => arr.indexOf(x) !== i);

function checkQuestion(label, q, text) {
  expect(typeof text, `${label}: Fragetext`).toBe('string');
  expect(text.trim().length, `${label}: Fragetext leer`).toBeGreaterThan(5);
  expect(Array.isArray(q.options), `${label}: options`).toBe(true);
  expect(q.options.length, `${label}: mind. 2 Optionen`).toBeGreaterThanOrEqual(2);
  expect(q.options.every((o) => typeof o === 'string' && o.trim().length > 0), `${label}: leere Option`).toBe(true);
  expect(new Set(q.options).size, `${label}: doppelte Optionen`).toBe(q.options.length);
  expect(Number.isInteger(q.correct), `${label}: correct ist Integer`).toBe(true);
  expect(q.correct >= 0 && q.correct < q.options.length, `${label}: correct (${q.correct}) außerhalb der Optionen`).toBe(true);
}

describe('Prüfungsfragen (examData)', () => {
  it('haben eindeutige IDs (Voraussetzung für das Fehlerjournal)', () => {
    expect(duplicates(EXAM_QUESTIONS.map((q) => String(q.id)))).toEqual([]);
  });

  it('sind formal gültig (Optionen, correct-Index)', () => {
    for (const q of EXAM_QUESTIONS) checkQuestion(`Exam #${q.id}`, q, q.question);
  });

  it('gehören zu einem bekannten Prüfungsmodus', () => {
    const modeIds = new Set(IHK_EXAM_MODES.map((m) => m.id));
    for (const q of EXAM_QUESTIONS) {
      expect(modeIds.has(q.examType) || q.examType === 'ap1', `Exam #${q.id}: examType ${q.examType}`).toBe(true);
    }
  });

  it('Prüfungsmodi haben gültige Dauer und Bestehensgrenze', () => {
    for (const m of IHK_EXAM_MODES) {
      expect(m.durationMinutes, m.id).toBeGreaterThan(0);
      expect(m.passingScore, m.id).toBeGreaterThan(0);
      expect(m.passingScore, m.id).toBeLessThanOrEqual(m.totalPoints);
    }
  });
});

describe('Quiz Arena (quizArenaData)', () => {
  it('Kategorien haben eindeutige IDs und mindestens eine Frage', () => {
    expect(duplicates(QUIZ_ARENA_CATEGORIES.map((c) => c.id))).toEqual([]);
    for (const c of QUIZ_ARENA_CATEGORIES) expect(c.questions.length, c.id).toBeGreaterThan(0);
  });

  it('Fragen sind formal gültig und haben eine Erklärung', () => {
    for (const c of QUIZ_ARENA_CATEGORIES) {
      c.questions.forEach((q, i) => {
        checkQuestion(`Quiz ${c.id}[${i}]`, q, q.q);
        expect(q.explanation?.trim().length > 0, `Quiz ${c.id}[${i}]: explanation`).toBe(true);
      });
    }
  });
});

describe('Flashcards & Glossar', () => {
  it('Flashcards: eindeutige IDs (SRS-Schlüssel), Vorder- und Rückseite gefüllt', () => {
    expect(duplicates(FLASHCARDS_DATA.map((c) => String(c.id)))).toEqual([]);
    for (const c of FLASHCARDS_DATA) {
      expect(c.front?.trim().length, `Card ${c.id}: front`).toBeGreaterThan(0);
      expect(c.back?.trim().length, `Card ${c.id}: back`).toBeGreaterThan(0);
    }
  });

  it('Glossar: eindeutige IDs und Pflichtfelder', () => {
    expect(duplicates(GLOSSARY_TERMS.map((t) => t.id))).toEqual([]);
    for (const t of GLOSSARY_TERMS) {
      expect(t.term?.trim().length, `Glossar ${t.id}: term`).toBeGreaterThan(0);
      expect(t.simpleExplanation?.trim().length, `Glossar ${t.id}: simpleExplanation`).toBeGreaterThan(0);
    }
  });
});
