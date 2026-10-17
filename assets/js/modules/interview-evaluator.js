/**
 * @file interview-evaluator.js
 * @description Pure evaluation logic for interview trainer questions and answers.
 * Kept dependency-free (no DOM) so it can be unit-tested directly.
 */

/**
 * Matches user's answer against a list of keywords.
 * @param {string} userAnswer
 * @param {string[]} [keywords]
 * @returns {{ matched: string[], missing: string[], scorePercentage: number }}
 */
export function evaluateAnswerKeywords(userAnswer, keywords = []) {
    const cleanedAnswer = (userAnswer || '').toLowerCase();
    const matched = [];
    const missing = [];

    (keywords || []).forEach((kw) => {
        const regex = new RegExp(`\\b${kw}|${kw}\\b`, 'i');
        if (cleanedAnswer.includes(kw.toLowerCase()) || regex.test(cleanedAnswer)) {
            matched.push(kw);
        } else {
            missing.push(kw);
        }
    });

    const total = keywords ? keywords.length : 0;
    const scorePercentage = total > 0 ? Math.round((matched.length / total) * 100) : 100;

    return { matched, missing, scorePercentage };
}

/**
 * Returns rating text (DE/EN) and CSS class based on percentage.
 * @param {number} scorePercentage
 * @returns {{ ratingDe: string, ratingEn: string, bubbleClass: string }}
 */
export function getRatingFeedback(scorePercentage) {
    if (scorePercentage >= 85) {
        return {
            ratingDe: '🏆 Exzellent!',
            ratingEn: '🏆 Excellent!',
            bubbleClass: 'feedback-excellent',
        };
    }
    if (scorePercentage >= 55) {
        return {
            ratingDe: '⭐ Sehr gut!',
            ratingEn: '⭐ Very Good!',
            bubbleClass: 'feedback-good',
        };
    }
    if (scorePercentage >= 25) {
        return {
            ratingDe: '👍 Guter Ansatz!',
            ratingEn: '👍 Good start!',
            bubbleClass: 'feedback-fair',
        };
    }
    return {
        ratingDe: '💡 Ausbaufähig!',
        ratingEn: '💡 Needs work!',
        bubbleClass: 'feedback-poor',
    };
}

export function initInterviewEvaluator() {
    if (typeof window !== 'undefined') {
        window.InterviewEvaluator = {
            evaluateAnswerKeywords,
            getRatingFeedback,
        };
    }
}

if (typeof window !== 'undefined') {
    window.InterviewEvaluator = {
        evaluateAnswerKeywords,
        getRatingFeedback,
    };
}
