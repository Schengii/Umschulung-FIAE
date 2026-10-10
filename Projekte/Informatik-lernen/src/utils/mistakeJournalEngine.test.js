import { describe, it, expect } from 'vitest';
import { applyAnswerResults, getDueMistakeIds, summarizeJournal, toDateKey, MASTERY_STREAK } from './mistakeJournalEngine';

const d = (s) => new Date(`${s}T12:00:00`);

describe('mistakeJournalEngine', () => {
  it('toDateKey nutzt lokale Zeit mit Nullauffüllung', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('nimmt falsche Antworten mit 1 Tag Intervall auf, richtige unbekannte ignoriert es', () => {
    const j = applyAnswerResults({}, [{ id: 1, correct: false }, { id: 2, correct: true }], d('2026-03-10'));
    expect(Object.keys(j)).toEqual(['1']);
    expect(j['1']).toMatchObject({ wrongCount: 1, streak: 0, interval: 1, dueDate: '2026-03-11' });
  });

  it('zählt wiederholte Fehler hoch und setzt den Streak zurück', () => {
    let j = applyAnswerResults({}, [{ id: 1, correct: false }], d('2026-03-10'));
    j = applyAnswerResults(j, [{ id: 1, correct: true }], d('2026-03-11'));
    expect(j['1'].streak).toBe(1);
    j = applyAnswerResults(j, [{ id: 1, correct: false }], d('2026-03-12'));
    expect(j['1']).toMatchObject({ wrongCount: 2, streak: 0, interval: 1 });
  });

  it('steigert das Intervall bei richtigen Antworten und entfernt gemeisterte Fragen', () => {
    let j = applyAnswerResults({}, [{ id: 7, correct: false }], d('2026-03-10'));
    j = applyAnswerResults(j, [{ id: 7, correct: true }], d('2026-03-11'));
    expect(j['7']).toMatchObject({ streak: 1, interval: 3, dueDate: '2026-03-14' });
    j = applyAnswerResults(j, [{ id: 7, correct: true }], d('2026-03-14'));
    expect(j['7']).toMatchObject({ streak: 2, interval: 7, dueDate: '2026-03-21' });
    j = applyAnswerResults(j, [{ id: 7, correct: true }], d('2026-03-21'));
    expect(MASTERY_STREAK).toBe(3);
    expect(j['7']).toBeUndefined();
  });

  it('verändert das übergebene Journal nicht (immutabel) und toleriert null', () => {
    const base = { 1: { wrongCount: 1, streak: 0, interval: 1, dueDate: '2026-03-11', lastSeen: '2026-03-10' } };
    const frozen = JSON.stringify(base);
    applyAnswerResults(base, [{ id: 1, correct: true }], d('2026-03-11'));
    expect(JSON.stringify(base)).toBe(frozen);
    expect(applyAnswerResults(null, [], d('2026-03-11'))).toEqual({});
  });

  it('liefert nur fällige IDs, älteste zuerst', () => {
    const j = {
      a: { wrongCount: 1, streak: 0, interval: 1, dueDate: '2026-03-12', lastSeen: '' },
      b: { wrongCount: 1, streak: 0, interval: 1, dueDate: '2026-03-10', lastSeen: '' },
      c: { wrongCount: 1, streak: 0, interval: 1, dueDate: '2026-04-01', lastSeen: '' }
    };
    expect(getDueMistakeIds(j, d('2026-03-12'))).toEqual(['b', 'a']);
    expect(summarizeJournal(j, d('2026-03-12'))).toEqual({ total: 3, due: 2 });
    expect(getDueMistakeIds(undefined)).toEqual([]);
  });

  it('rechnet Monatsgrenzen korrekt (Schaltjahr)', () => {
    const j = applyAnswerResults({}, [{ id: 1, correct: false }], d('2028-02-28'));
    expect(j['1'].dueDate).toBe('2028-02-29');
  });
});
