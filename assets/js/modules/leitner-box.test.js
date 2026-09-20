import { describe, it, expect } from 'vitest';
import { advanceBoxLevel, resetBoxLevel, computeBoxStats, filterByBox, MAX_BOX_LEVEL, MIN_BOX_LEVEL } from './leitner-box.js';

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
        expect(filterByBox(cards, {}, 'box1').map(c => c.id)).toEqual([1, 2, 3]);
        expect(filterByBox(cards, boxLevels, 'box1').map(c => c.id)).toEqual([1]);
    });

    it('filters box2 and box3 exactly', () => {
        expect(filterByBox(cards, boxLevels, 'box2').map(c => c.id)).toEqual([2]);
        expect(filterByBox(cards, boxLevels, 'box3').map(c => c.id)).toEqual([3]);
    });

    it('returns all cards for an unknown category', () => {
        expect(filterByBox(cards, boxLevels, 'all')).toHaveLength(3);
    });
});
