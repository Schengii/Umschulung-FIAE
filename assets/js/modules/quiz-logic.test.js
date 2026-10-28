import { describe, it, expect } from 'vitest';
import { feedbackLevel, isNewBest, parseBestScore, percentage, weakCategories } from './quiz-logic.js';

describe('quiz scoring', () => {
    it('computes the rounded percentage', () => {
        expect(percentage(3, 5)).toBe(60);
        expect(percentage(2, 3)).toBe(67);
        expect(percentage(0, 0)).toBe(0);
    });

    it('maps the percentage to a feedback level', () => {
        expect(feedbackLevel(100)).toBe('perfect');
        expect(feedbackLevel(60)).toBe('good');
        expect(feedbackLevel(59)).toBe('retry');
    });
});

describe('best score', () => {
    it('reads only non-negative whole numbers', () => {
        expect(parseBestScore('4')).toBe(4);
        expect(parseBestScore(0)).toBe(0);
        expect(parseBestScore(null)).toBeNull();
        expect(parseBestScore('<img src=x onerror=alert(1)>')).toBeNull();
        expect(parseBestScore('-2')).toBeNull();
    });

    it('detects a new best', () => {
        expect(isNewBest(null, 0)).toBe(true);
        expect(isNewBest('3', 4)).toBe(true);
        expect(isNewBest('3', 3)).toBe(false);
    });
});

describe('weakCategories', () => {
    it('collects the categories of wrong answers once', () => {
        const questions = [{ category: 'sql' }, { category: 'sql' }, { category: 'oop' }, {}];
        expect(weakCategories(questions, [false, false, true, false])).toEqual(['sql']);
        expect(weakCategories(questions, [true, true, true, true])).toEqual([]);
    });
});
