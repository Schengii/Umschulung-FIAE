import { describe, it, expect } from 'vitest';
import { FACHGESPRAECH_QUESTIONS } from './fachgespraech-questions.js';
import { parseFachgespraechStats, recordFachgespraechAnswer, summarizeFachgespraech } from './fachgespraech-stats.js';

describe('Fragenkatalog', () => {
    it('hat eindeutige Ids und vollständige Einträge mit je drei Kriterien', () => {
        const ids = FACHGESPRAECH_QUESTIONS.map((q) => q.id);
        expect(new Set(ids).size).toBe(ids.length);
        expect(FACHGESPRAECH_QUESTIONS.length).toBeGreaterThanOrEqual(20);
        for (const q of FACHGESPRAECH_QUESTIONS) {
            expect(q.category.length).toBeGreaterThan(0);
            expect(q.answer.length).toBeGreaterThan(40);
            expect(q.criteria).toHaveLength(3);
            expect(q.criteria.every((c) => c.length > 5)).toBe(true);
        }
    });

    it('deckt mindestens acht Themengebiete ab', () => {
        expect(new Set(FACHGESPRAECH_QUESTIONS.map((q) => q.category)).size).toBeGreaterThanOrEqual(8);
    });
});

describe('parseFachgespraechStats', () => {
    it('liest gültige Daten und begrenzt Werte', () => {
        const raw = JSON.stringify({ A: { total: 2, good: 5, criteriaHit: 9, criteriaTotal: 6 } });
        expect(parseFachgespraechStats(raw)).toEqual({ A: { total: 2, good: 2, criteriaHit: 6, criteriaTotal: 6 } });
    });

    it('ignoriert beschädigte Daten und kaputte Einträge', () => {
        expect(parseFachgespraechStats('{kaputt')).toEqual({});
        expect(parseFachgespraechStats('[1]')).toEqual({});
        expect(parseFachgespraechStats(null)).toEqual({});
        expect(parseFachgespraechStats(JSON.stringify({ A: { total: -1 }, B: 'x' }))).toEqual({});
    });
});

describe('recordFachgespraechAnswer', () => {
    it('zählt Antworten je Kategorie, ohne die Eingabe zu verändern', () => {
        const start = {};
        const one = recordFachgespraechAnswer(start, { category: 'A', good: true, criteriaHit: 2, criteriaTotal: 3 });
        const two = recordFachgespraechAnswer(one, { category: 'A', good: false, criteriaHit: 5, criteriaTotal: 3 });
        expect(start).toEqual({});
        expect(two.A).toEqual({ total: 2, good: 1, criteriaHit: 5, criteriaTotal: 6 });
    });
});

describe('summarizeFachgespraech', () => {
    it('sortiert die schwächste Kategorie nach vorn', () => {
        let stats = {};
        stats = recordFachgespraechAnswer(stats, { category: 'Stark', good: true, criteriaHit: 3, criteriaTotal: 3 });
        stats = recordFachgespraechAnswer(stats, {
            category: 'Schwach',
            good: false,
            criteriaHit: 1,
            criteriaTotal: 3,
        });
        const summary = summarizeFachgespraech(stats);
        expect(summary.map((s) => s.category)).toEqual(['Schwach', 'Stark']);
        expect(summary[0]).toMatchObject({ goodPercent: 0, criteriaPercent: 33, total: 1 });
        expect(summarizeFachgespraech({})).toEqual([]);
    });

    it('meldet keine Kriterienquote ohne Kriterien', () => {
        const stats = recordFachgespraechAnswer({}, { category: 'A', good: true, criteriaHit: 0, criteriaTotal: 0 });
        expect(summarizeFachgespraech(stats)[0].criteriaPercent).toBeNull();
    });
});
