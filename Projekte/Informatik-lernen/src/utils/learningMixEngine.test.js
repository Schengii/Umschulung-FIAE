import { describe, it, expect } from 'vitest';
import {
  domainOfQuestion, seededRandom, buildPlacementTest, scorePlacement,
  placementToDomainStats, mergeDomainStats, weakestDomains, buildDailyMix, pickMixCards
} from './learningMixEngine';
import { EXAM_QUESTIONS } from '../data/examData';

const NOW = new Date(2026, 5, 10);
const q = (id, examType, category) => ({ id, examType, category, correct: 0 });

describe('domainOfQuestion', () => {
  it('ordnet WiSo, AP1, AP2 Entwicklung und AP2 Planung zu', () => {
    expect(domainOfQuestion(q(1, 'ap2_fiae', 'WiSo & KLR'))).toBe('wiso');
    expect(domainOfQuestion(q(2, 'ap1', 'Netzwerke'))).toBe('ap1');
    expect(domainOfQuestion(q(3, 'ap2_fiae', 'Datenbanken & SQL'))).toBe('ap2_2');
    expect(domainOfQuestion(q(4, 'ap2_fisi', 'Virtualisierung & Cloud'))).toBe('ap2_1');
  });
});

describe('Einstufungstest', () => {
  it('wählt eindeutige Fragen aus dem echten Katalog', () => {
    const ids = buildPlacementTest(EXAM_QUESTIONS, seededRandom('x'));
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeLessThanOrEqual(12);
    expect(ids.length).toBeGreaterThanOrEqual(8);
  });

  it('wertet je Bereich aus und liefert Statistik für den Readiness-Score', () => {
    const qs = [q(1, 'ap1', 'x'), q(2, 'ap1', 'x'), q(3, 'ap2_fiae', 'WiSo')];
    const res = scorePlacement(qs, [true, false, true], NOW);
    expect(res.date).toBe('2026-06-10');
    expect(res.domains.ap1).toEqual({ correct: 1, total: 2 });
    expect(placementToDomainStats(res).ap1).toEqual({ completed: 2, scoreSum: 100 });
    expect(placementToDomainStats(null)).toEqual({});
  });

  it('mergeDomainStats addiert, weakestDomains sortiert schwächste zuerst', () => {
    expect(
      mergeDomainStats({ ap1: { completed: 1, scoreSum: 80 } }, { ap1: { completed: 2, scoreSum: 100 }, wiso: { completed: 1, scoreSum: 0 } })
    ).toEqual({ ap1: { completed: 3, scoreSum: 180 }, wiso: { completed: 1, scoreSum: 0 } });
    const placement = { date: '', domains: { ap1: { correct: 3, total: 3 }, wiso: { correct: 0, total: 3 }, ap2_1: { correct: 1, total: 3 } } };
    const order = weakestDomains(placement);
    expect(order[0]).toBe('ap2_2');
    expect(order[1]).toBe('wiso');
    expect(order[3]).toBe('ap1');
  });
});

describe('buildDailyMix', () => {
  const pool = EXAM_QUESTIONS;
  const dueEntry = { wrongCount: 1, streak: 0, interval: 1, dueDate: '2026-06-09', lastSeen: '' };

  it('stellt fällige Fehler voran, füllt auf 10 auf, ohne Duplikate', () => {
    const journal = { [pool[0].id]: dueEntry, [pool[1].id]: dueEntry };
    const mix = buildDailyMix({ journal, questions: pool, now: NOW });
    expect(mix.ids.slice(0, 2).sort()).toEqual([String(pool[0].id), String(pool[1].id)].sort());
    expect(mix.dueCount).toBe(2);
    expect(mix.ids).toHaveLength(10);
    expect(new Set(mix.ids).size).toBe(10);
  });

  it('ist am selben Tag stabil und nimmt keine Journal-Fragen als neue Fragen', () => {
    const journal = { [pool[0].id]: { ...dueEntry, dueDate: '2026-07-01' } };
    const a = buildDailyMix({ journal, questions: pool, now: NOW });
    const b = buildDailyMix({ journal, questions: pool, now: NOW });
    expect(a.ids).toEqual(b.ids);
    expect(a.ids).not.toContain(String(pool[0].id));
  });

  it('begrenzt fällige Fehler auf 6 und ignoriert unbekannte IDs', () => {
    const journal = Object.fromEntries(pool.slice(0, 9).map((x) => [x.id, dueEntry]));
    journal.unbekannt = dueEntry;
    const mix = buildDailyMix({ journal, questions: pool, now: NOW });
    expect(mix.dueCount).toBe(6);
    expect(mix.ids).not.toContain('unbekannt');
  });
});

describe('Karteikarten im Lernmix', () => {
  const cards = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];

  it('wählt fällige Karten zuerst (älteste zuerst), dann neue, max. 3', () => {
    const srs = { 1: { dueDate: '2026-06-09' }, 2: { dueDate: '2026-06-01' }, 3: { dueDate: '2026-07-01' } };
    const res = pickMixCards(srs, cards, NOW);
    expect(res.ids).toEqual(['2', '1', '4']);
    expect(res.dueCount).toBe(2);
  });

  it('reduziert die Fragenzahl, sodass der Mix insgesamt 10 Aufgaben hat', () => {
    const mix = buildDailyMix({ journal: {}, questions: EXAM_QUESTIONS, cards, srsData: {}, now: NOW });
    expect(mix.cardIds).toHaveLength(3);
    expect(mix.ids).toHaveLength(7);
  });
});
