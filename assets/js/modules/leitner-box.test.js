import { describe, it, expect } from 'vitest';
import {
    advanceBoxLevel,
    resetBoxLevel,
    computeBoxStats,
    filterByBox,
    filterDue,
    isDue,
    nextDueDate,
    daysUntilDue,
    startOfDay,
    REVIEW_INTERVAL_DAYS,
    MAX_BOX_LEVEL,
    MIN_BOX_LEVEL,
} from './leitner-box.js';

describe('advanceBoxLevel', () => {
    it('advances one level', () => {
        expect(advanceBoxLevel(1)).toBe(2);
        expect(advanceBoxLevel(2)).toBe(3);
    });

    it('caps at MAX_BOX_LEVEL', () => {
        expect(advanceBoxLevel(3)).toBe(MAX_BOX_LEVEL);
    });

    it('treats a missing/undefined level as MIN_BOX_LEVEL before advancing', () => {
        expect(advanceBoxLevel(undefined)).toBe(2);
    });
});

describe('resetBoxLevel', () => {
    it('always resets to MIN_BOX_LEVEL', () => {
        expect(resetBoxLevel()).toBe(MIN_BOX_LEVEL);
    });
});

describe('computeBoxStats', () => {
    const cards = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

    it('defaults cards with no recorded level to box 1', () => {
        const stats = computeBoxStats(cards, {});
        expect(stats).toEqual({ 1: 4, 2: 0, 3: 0 });
    });

    it('counts cards per box based on boxLevels', () => {
        // card1->box2, card2->box3, card3->box2, card4->box1
        const stats = computeBoxStats(cards, { 1: 2, 2: 3, 3: 2, 4: 1 });
        expect(stats).toEqual({ 1: 1, 2: 2, 3: 1 });
    });
});

describe('filterByBox', () => {
    const cards = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const boxLevels = { 1: 1, 2: 2, 3: 3 };

    it('filters box1 including cards with no recorded level', () => {
        expect(filterByBox(cards, {}, 'box1').map((c) => c.id)).toEqual([1, 2, 3]);
        expect(filterByBox(cards, boxLevels, 'box1').map((c) => c.id)).toEqual([1]);
    });

    it('filters box2 and box3 exactly', () => {
        expect(filterByBox(cards, boxLevels, 'box2').map((c) => c.id)).toEqual([2]);
        expect(filterByBox(cards, boxLevels, 'box3').map((c) => c.id)).toEqual([3]);
    });

    it('returns all cards for an unknown category', () => {
        expect(filterByBox(cards, boxLevels, 'all')).toHaveLength(3);
    });
});

describe('review scheduling', () => {
    // A review in the evening: due dates must count calendar days, not 24-hour blocks.
    const reviewedAt = new Date(2026, 2, 10, 21, 30).getTime();
    const dayOffset = (timestamp) => Math.round((timestamp - startOfDay(reviewedAt)) / 86400000);

    it('grows the interval with the box', () => {
        expect(REVIEW_INTERVAL_DAYS).toEqual({ 1: 1, 2: 3, 3: 7 });
        expect(dayOffset(nextDueDate(1, reviewedAt))).toBe(1);
        expect(dayOffset(nextDueDate(2, reviewedAt))).toBe(3);
        expect(dayOffset(nextDueDate(3, reviewedAt))).toBe(7);
    });

    it('makes a card due from midnight of the due day', () => {
        const due = nextDueDate(1, reviewedAt);
        expect(new Date(due).getHours()).toBe(0);
        expect(isDue(due, new Date(2026, 2, 10, 23, 59).getTime())).toBe(false);
        expect(isDue(due, new Date(2026, 2, 11, 0, 0).getTime())).toBe(true);
    });

    it('stays on midnight across a daylight saving change', () => {
        // 29 March 2026 is the European switch to summer time (a 23-hour day).
        const due = nextDueDate(2, new Date(2026, 2, 28, 12, 0).getTime());
        expect(new Date(due).getDate()).toBe(31);
        expect(new Date(due).getHours()).toBe(0);
    });

    it('falls back to the shortest interval for an unknown box', () => {
        expect(dayOffset(nextDueDate(99, reviewedAt))).toBe(1);
    });

    it('treats cards without a due date as due', () => {
        expect(isDue(undefined, reviewedAt)).toBe(true);
        expect(isDue(0, reviewedAt)).toBe(true);
    });

    it('filters a deck down to the cards that are due', () => {
        const cards = [{ id: 'new' }, { id: 'tomorrow' }, { id: 'overdue' }];
        const dueDates = { tomorrow: nextDueDate(1, reviewedAt), overdue: reviewedAt - 1000 };
        expect(filterDue(cards, dueDates, reviewedAt).map((card) => card.id)).toEqual(['new', 'overdue']);
    });

    it('reports the whole days until a card is due', () => {
        expect(daysUntilDue(undefined, reviewedAt)).toBe(0);
        expect(daysUntilDue(nextDueDate(1, reviewedAt), reviewedAt)).toBe(1);
        expect(daysUntilDue(nextDueDate(3, reviewedAt), reviewedAt)).toBe(7);
    });
});
