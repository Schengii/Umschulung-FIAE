import { describe, it, expect } from 'vitest';
import { reviewCard, allMastered, countWrongAnswer } from './flashcard-review.js';
import { MAX_BOX_LEVEL, REVIEW_INTERVAL_DAYS, startOfDay } from './leitner-box.js';

const NOW = new Date(2026, 10, 19, 21, 30).getTime();
const empty = () => ({ boxLevels: {}, dueDates: {}, known: [] });
const days = (timestamp) => Math.round((timestamp - startOfDay(NOW)) / 86400000);

describe('reviewCard: correct', () => {
    it('moves a new card from box 1 to box 2 and schedules it', () => {
        const next = reviewCard(empty(), 7, true, NOW);
        expect(next.boxLevels[7]).toBe(2);
        expect(days(next.dueDates[7])).toBe(REVIEW_INTERVAL_DAYS[2]);
        expect(next.known).toEqual([]);
    });

    it('marks a card as known only when it reaches the highest box', () => {
        let state = { ...empty(), boxLevels: { a: MAX_BOX_LEVEL - 1 } };
        state = reviewCard(state, 'a', true, NOW);
        expect(state.boxLevels.a).toBe(MAX_BOX_LEVEL);
        expect(state.known).toEqual(['a']);
        expect(days(state.dueDates.a)).toBe(REVIEW_INTERVAL_DAYS[MAX_BOX_LEVEL]);

        // Another correct answer keeps the card known once, not twice.
        expect(reviewCard(state, 'a', true, NOW).known).toEqual(['a']);
    });

    it('drops a card from the known list that was in the highest box before (old three-box marks)', () => {
        const next = reviewCard({ ...empty(), boxLevels: { a: 3 }, known: ['a', 'b'] }, 'a', true, NOW);
        expect(next.boxLevels.a).toBe(4);
        expect(next.known).toEqual(['b']);
    });
});

describe('reviewCard: wrong', () => {
    it('resets the box, clears the due date and removes the card from the known list', () => {
        const state = {
            boxLevels: { a: 5, b: 3 },
            dueDates: { a: NOW + 1000, b: NOW + 2000 },
            known: ['a', 'b'],
        };
        const next = reviewCard(state, 'a', false, NOW);
        expect(next.boxLevels).toEqual({ a: 1, b: 3 });
        expect(next.dueDates).toEqual({ b: NOW + 2000 });
        expect(next.known).toEqual(['b']);
    });

    it('puts a card seen for the first time into box 1 without a date', () => {
        const next = reviewCard(empty(), 'new', false, NOW);
        expect(next.boxLevels.new).toBe(1);
        expect('new' in next.dueDates).toBe(false);
    });
});

describe('reviewCard: purity', () => {
    it('does not change the input', () => {
        const state = { boxLevels: { a: 1 }, dueDates: { a: 5 }, known: ['x'] };
        const copy = JSON.parse(JSON.stringify(state));
        reviewCard(state, 'a', true, NOW);
        reviewCard(state, 'a', false, NOW);
        expect(state).toEqual(copy);
    });
});

describe('allMastered', () => {
    it('needs every counting card in the known list and at least one card', () => {
        expect(allMastered([1, 2], [1, 2, 3])).toBe(true);
        expect(allMastered([1, 2], [1])).toBe(false);
        expect(allMastered([], [1])).toBe(false);
    });
});

describe('countWrongAnswer', () => {
    it('counts per category without touching the input', () => {
        const before = { software: 1 };
        const after = countWrongAnswer(before, 'software');
        expect(after).toEqual({ software: 2 });
        expect(countWrongAnswer(after, 'wiso')).toEqual({ software: 2, wiso: 1 });
        expect(before).toEqual({ software: 1 });
    });
});
