import { describe, it, expect } from 'vitest';
import { evaluateAnswerKeywords, getRatingFeedback } from './interview-evaluator.js';

describe('evaluateAnswerKeywords', () => {
    it('returns score 0 and all missing when answer is empty', () => {
        const keywords = ['Polymorphie', 'Vererbung', 'Kapselung'];
        const result = evaluateAnswerKeywords('', keywords);
        expect(result.scorePercentage).toBe(0);
        expect(result.matched).toEqual([]);
        expect(result.missing).toEqual(keywords);
    });

    it('matches keywords case-insensitively', () => {
        const keywords = ['Clean Code', 'SOLID', 'DRY'];
        const answer = 'Ich achte immer auf clean code und solid prinzipien sowie dry.';
        const result = evaluateAnswerKeywords(answer, keywords);
        expect(result.scorePercentage).toBe(100);
        expect(result.matched).toEqual(keywords);
        expect(result.missing).toEqual([]);
    });

    it('computes partial match percentages accurately', () => {
        const keywords = ['Git', 'Branch', 'Merge', 'Rebase']; // 4 keywords
        const answer = 'Ich nutze Git mit Feature Branches und Merge.'; // 3 of 4 match
        const result = evaluateAnswerKeywords(answer, keywords);
        expect(result.scorePercentage).toBe(75);
        expect(result.matched).toEqual(['Git', 'Branch', 'Merge']);
        expect(result.missing).toEqual(['Rebase']);
    });

    it('handles empty keywords list gracefully', () => {
        const result = evaluateAnswerKeywords('Eine Antwort ohne Kriterien', []);
        expect(result.scorePercentage).toBe(100);
        expect(result.matched).toEqual([]);
        expect(result.missing).toEqual([]);
    });
});

describe('getRatingFeedback', () => {
    it('returns excellent tier for score >= 85', () => {
        const feedback = getRatingFeedback(90);
        expect(feedback.bubbleClass).toBe('feedback-excellent');
        expect(feedback.ratingDe).toContain('Exzellent');
        expect(feedback.ratingEn).toContain('Excellent');
    });

    it('returns good tier for 55 <= score < 85', () => {
        const feedback = getRatingFeedback(65);
        expect(feedback.bubbleClass).toBe('feedback-good');
        expect(feedback.ratingDe).toContain('Sehr gut');
        expect(feedback.ratingEn).toContain('Very Good');
    });

    it('returns fair tier for 25 <= score < 55', () => {
        const feedback = getRatingFeedback(35);
        expect(feedback.bubbleClass).toBe('feedback-fair');
        expect(feedback.ratingDe).toContain('Guter Ansatz');
        expect(feedback.ratingEn).toContain('Good start');
    });

    it('returns poor tier for score < 25', () => {
        const feedback = getRatingFeedback(10);
        expect(feedback.bubbleClass).toBe('feedback-poor');
        expect(feedback.ratingDe).toContain('Ausbaufähig');
        expect(feedback.ratingEn).toContain('Needs work');
    });
});

describe('evaluateAnswerKeywords with regex characters', () => {
    it('matches keywords such as C++ and Node.js without throwing', () => {
        const result = evaluateAnswerKeywords('Ich nutze C++ und Node.js', ['C++', 'Node.js', '(Java)']);
        expect(result.matched).toEqual(['C++', 'Node.js']);
        expect(result.missing).toEqual(['(Java)']);
    });
});
