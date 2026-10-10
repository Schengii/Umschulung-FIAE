import { describe, it, expect } from 'vitest';
import {
  recordVisit,
  recordCompletion,
  matchesCareer,
  summarizeLabProgress,
  recommendNextLabs
} from './labProgressEngine';

const lab = (id, difficulty, category = 'fiae', tags = ['#x']) => ({ id, difficulty, category, tags });

describe('recordVisit', () => {
  it('legt einen Eintrag an und zählt Besuche hoch', () => {
    const a = recordVisit(undefined, 'a', '2026-10-07');
    expect(a.a).toEqual({ visits: 1, lastVisit: '2026-10-07', completed: false });
    const b = recordVisit(a, 'a', '2026-10-08');
    expect(b.a.visits).toBe(2);
    expect(b.a.lastVisit).toBe('2026-10-08');
  });

  it('verändert den Eingabewert nicht und behält den Abschluss', () => {
    const done = recordCompletion({}, 'a', '2026-10-01');
    const snapshot = JSON.stringify(done);
    const next = recordVisit(done, 'a', '2026-10-02');
    expect(JSON.stringify(done)).toBe(snapshot);
    expect(next.a.completed).toBe(true);
    expect(next.a.completedOn).toBe('2026-10-01');
  });
});

describe('recordCompletion', () => {
  it('markiert ein nie besuchtes Lab als abgeschlossen', () => {
    expect(recordCompletion(null, 'a', '2026-10-07').a).toEqual({
      visits: 1, lastVisit: '2026-10-07', completed: true, completedOn: '2026-10-07'
    });
  });

  it('ist idempotent und gibt dasselbe Objekt zurück', () => {
    const once = recordCompletion({}, 'a', '2026-10-01');
    expect(recordCompletion(once, 'a', '2026-10-09')).toBe(once);
  });
});

describe('matchesCareer', () => {
  it('lässt bei "all" und unbekannten IDs alles durch', () => {
    expect(matchesCareer(lab('x', 'Beginner'), 'all')).toBe(true);
    expect(matchesCareer(lab('x', 'Beginner'), 'unbekannt')).toBe(true);
  });

  it('filtert nach Kategorie oder Tag', () => {
    expect(matchesCareer(lab('x', 'Beginner', 'network'), 'fisi')).toBe(true);
    expect(matchesCareer(lab('x', 'Beginner', 'ai', ['#VLAN']), 'fisi')).toBe(true);
    expect(matchesCareer(lab('x', 'Beginner', 'ai', ['#Foo']), 'fisi')).toBe(false);
    expect(matchesCareer(lab('x', 'Beginner', 'wiso'), 'wiso')).toBe(true);
    expect(matchesCareer(lab('x', 'Beginner', 'hardware'), 'itse')).toBe(true);
  });

  it('erkennt das IHK-Badge für AP1', () => {
    expect(matchesCareer({ ...lab('x', 'Beginner', 'ai'), badge: 'IHK Neu' }, 'ap1')).toBe(true);
    expect(matchesCareer(lab('x', 'Beginner', 'ai'), 'ap1')).toBe(false);
  });
});

describe('summarizeLabProgress', () => {
  it('zählt abgeschlossene Labs und rundet den Prozentwert', () => {
    const mods = [lab('a', 'Beginner'), lab('b', 'Beginner'), lab('c', 'Beginner')];
    const progress = recordCompletion({}, 'a', '2026-10-07');
    expect(summarizeLabProgress(mods, progress)).toEqual({ done: 1, total: 3, percent: 33 });
  });

  it('liefert 0 % bei leerer Liste und nutzt resolveKey', () => {
    expect(summarizeLabProgress([], {})).toEqual({ done: 0, total: 0, percent: 0 });
    const progress = recordCompletion({}, 'canon', '2026-10-07');
    expect(summarizeLabProgress([lab('alias', 'Beginner')], progress, () => 'canon').done).toBe(1);
  });
});

describe('recommendNextLabs', () => {
  const mods = [
    lab('adv', 'Advanced'),
    lab('beg1', 'Beginner'),
    lab('int1', 'Intermediate'),
    lab('beg2', 'Beginner'),
    lab('unk', 'Weird')
  ];

  it('sortiert nach Schwierigkeit, unbekannte zuletzt', () => {
    expect(recommendNextLabs(mods, { limit: 10 }).map((l) => l.id)).toEqual(['beg1', 'beg2', 'int1', 'adv', 'unk']);
  });

  it('überspringt abgeschlossene und bevorzugt begonnene Labs gleicher Stufe', () => {
    let progress = recordCompletion({}, 'beg1', '2026-10-07');
    progress = recordVisit(progress, 'beg2', '2026-10-07');
    expect(recommendNextLabs(mods, { progress, limit: 2 }).map((l) => l.id)).toEqual(['beg2', 'int1']);

    const onlyVisited = recordVisit({}, 'beg2', '2026-10-07');
    expect(recommendNextLabs(mods, { progress: onlyVisited, limit: 2 }).map((l) => l.id)).toEqual(['beg2', 'beg1']);
  });

  it('berücksichtigt Berufsfilter und Limit', () => {
    const m = [lab('n', 'Beginner', 'network'), lab('w', 'Beginner', 'wiso')];
    expect(recommendNextLabs(m, { careerId: 'wiso' }).map((l) => l.id)).toEqual(['w']);
    expect(recommendNextLabs(m, { limit: 0 })).toEqual([]);
  });

  it('liefert eine leere Liste, wenn alles abgeschlossen ist', () => {
    const progress = recordCompletion({}, 'x', '2026-10-07');
    expect(recommendNextLabs([lab('x', 'Beginner')], { progress })).toEqual([]);
  });
});
