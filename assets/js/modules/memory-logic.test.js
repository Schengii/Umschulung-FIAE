import { describe, it, expect } from 'vitest';
import {
    LEADERBOARD_LIMIT,
    addScore,
    buildDeck,
    formatTime,
    isNewBest,
    parseLeaderboard,
    shuffle,
} from './memory-logic.js';

describe('deck', () => {
    it('shuffles without losing or changing items', () => {
        const items = [1, 2, 3, 4, 5];
        const shuffled = shuffle(items, () => 0);
        expect([...shuffled].sort()).toEqual(items);
        expect(shuffled).not.toEqual(items);
        expect(items).toEqual([1, 2, 3, 4, 5]);
    });

    it('holds every symbol exactly twice', () => {
        const deck = buildDeck(['a', 'b', 'c']);
        expect(deck).toHaveLength(6);
        for (const symbol of ['a', 'b', 'c']) expect(deck.filter((s) => s === symbol)).toHaveLength(2);
    });
});

describe('formatTime', () => {
    it('formats m:ss', () => {
        expect(formatTime(0)).toBe('0:00');
        expect(formatTime(65)).toBe('1:05');
        expect(formatTime(-3)).toBe('0:00');
    });
});

describe('leaderboard', () => {
    it('ranks fewer moves first, then the faster time', () => {
        const list = [
            { moves: 10, time: 40 },
            { moves: 12, time: 30 },
        ];
        const result = addScore(list, 10, 35);
        expect(result.rank).toBe(0);
        expect(result.list).toEqual([
            { moves: 10, time: 35 },
            { moves: 10, time: 40 },
            { moves: 12, time: 30 },
        ]);
    });

    it('keeps five entries and reports -1 for a round that did not make it', () => {
        const full = Array.from({ length: LEADERBOARD_LIMIT }, (_, i) => ({ moves: 8 + i, time: 20 }));
        const result = addScore(full, 30, 99);
        expect(result.rank).toBe(-1);
        expect(result.list).toHaveLength(LEADERBOARD_LIMIT);
    });

    it('parses stored lists and drops damaged or injected entries', () => {
        expect(parseLeaderboard('[{"moves":"<img>","time":3},{"moves":9,"time":20}]')).toEqual([
            { moves: 9, time: 20 },
        ]);
        expect(parseLeaderboard('{kaputt')).toEqual([]);
        expect(parseLeaderboard(null)).toEqual([]);
    });

    it('detects a new best by moves', () => {
        expect(isNewBest(null, 20)).toBe(true);
        expect(isNewBest('12', 11)).toBe(true);
        expect(isNewBest('12', 12)).toBe(false);
        expect(isNewBest('kaputt', 30)).toBe(true);
    });
});
