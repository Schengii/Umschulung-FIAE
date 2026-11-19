import { describe, it, expect } from 'vitest';
import {
    DEFAULT_NEW_PER_DAY,
    MAX_NEW_PER_DAY,
    normalizeNewPerDay,
    dayKey,
    readNewToday,
    introduceNewCards,
    startSession,
    recordAnswer,
    sessionProgress,
    nextDueInDays,
} from './study-session.js';

const NOW = new Date(2026, 10, 19, 10, 0).getTime();
const DAY = 86400000;
const vault = (n) => ({ id: `vault_${String(n).padStart(12, '0')}` });
const deck = [{ id: 1 }, { id: 'custom_1' }, ...Array.from({ length: 30 }, (_, i) => vault(i))];

describe('normalizeNewPerDay', () => {
    it('keeps whole numbers in range and falls back otherwise', () => {
        expect(normalizeNewPerDay('15')).toBe(15);
        expect(normalizeNewPerDay(0)).toBe(0);
        expect(normalizeNewPerDay(7.9)).toBe(7);
        expect(normalizeNewPerDay(-4)).toBe(0);
        expect(normalizeNewPerDay(5000)).toBe(MAX_NEW_PER_DAY);
        expect(normalizeNewPerDay('abc')).toBe(DEFAULT_NEW_PER_DAY);
        expect(normalizeNewPerDay(null)).toBe(DEFAULT_NEW_PER_DAY);
        expect(normalizeNewPerDay('')).toBe(DEFAULT_NEW_PER_DAY);
    });
});

describe('readNewToday', () => {
    it('keeps the record of today and drops other days and broken values', () => {
        expect(dayKey(NOW)).toBe('2026-11-19');
        expect(readNewToday({ day: '2026-11-19', ids: ['a', 3, 'b'] }, NOW)).toEqual({
            day: '2026-11-19',
            ids: ['a', 'b'],
        });
        expect(readNewToday({ day: '2026-11-18', ids: ['a'] }, NOW).ids).toEqual([]);
        expect(readNewToday([1, 2], NOW).ids).toEqual([]);
        expect(readNewToday(null, NOW).ids).toEqual([]);
        expect(readNewToday({ day: '2026-11-19', ids: 'x' }, NOW).ids).toEqual([]);
    });
});

describe('introduceNewCards', () => {
    const empty = { day: '2026-11-19', ids: [] };

    it('introduces at most the limit, only unseen Kartei cards', () => {
        const result = introduceNewCards(deck, { 1: 2, [vault(0).id]: 1 }, empty, 5);
        expect(result.ids).toHaveLength(5);
        expect(result.ids).not.toContain(vault(0).id);
        expect(result.ids.every((id) => id.startsWith('vault_'))).toBe(true);
    });

    it('counts cards introduced earlier today against the limit and is stable', () => {
        const first = introduceNewCards(deck, {}, empty, 3);
        expect(introduceNewCards(deck, {}, first, 3)).toBe(first);
        expect(introduceNewCards(deck, {}, first, 5).ids).toHaveLength(5);
        expect(introduceNewCards(deck, {}, first, 5).ids.slice(0, 3)).toEqual(first.ids);
    });

    it('introduces nothing for a limit of 0 or without Kartei cards', () => {
        expect(introduceNewCards(deck, {}, empty, 0).ids).toEqual([]);
        expect(introduceNewCards([{ id: 1 }], {}, empty, 10).ids).toEqual([]);
    });
});

describe('session tally', () => {
    it('counts answers and reports progress', () => {
        let tally = startSession(4);
        expect(sessionProgress(tally)).toBe(0);
        tally = recordAnswer(tally, true);
        tally = recordAnswer(tally, false);
        tally = recordAnswer(tally, true);
        expect(tally).toEqual({ total: 4, correct: 2, wrong: 1 });
        expect(sessionProgress(tally)).toBe(50);
        expect(sessionProgress(startSession(0))).toBe(100);
    });
});

describe('nextDueInDays', () => {
    it('finds the nearest future due date', () => {
        expect(nextDueInDays({ a: NOW + 7 * DAY, b: NOW + 3 * DAY, c: NOW - DAY }, NOW)).toBe(3);
    });
    it('is null without a future date', () => {
        expect(nextDueInDays({}, NOW)).toBeNull();
        expect(nextDueInDays({ a: NOW - DAY }, NOW)).toBeNull();
    });
});
