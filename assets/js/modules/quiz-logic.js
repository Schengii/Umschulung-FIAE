/**
 * @file quiz-logic.js
 * @description DOM-free scoring of the site quiz (quiz.html, questions about the retraining):
 * percentage, feedback level, best score and weak categories. quiz.js renders.
 */

/**
 * @param {number} score correct answers
 * @param {number} total questions
 */
export const percentage = (score, total) => (total > 0 ? Math.round((score / total) * 100) : 0);

/**
 * @param {number} percent
 * @returns {'perfect' | 'good' | 'retry'}
 */
export const feedbackLevel = (percent) => (percent === 100 ? 'perfect' : percent >= 60 ? 'good' : 'retry');

/**
 * Stored best score as a number (null when there is none). The value comes from localStorage
 * or a restored backup, so it is never rendered as stored.
 * @param {unknown} stored
 * @returns {number | null}
 */
export function parseBestScore(stored) {
    if (stored === null || stored === undefined || stored === '') return null;
    const value = Number.parseInt(String(stored), 10);
    return Number.isFinite(value) && value >= 0 ? value : null;
}

/**
 * @param {unknown} stored
 * @param {number} score
 */
export function isNewBest(stored, score) {
    const best = parseBestScore(stored);
    return best === null || score > best;
}

/**
 * Categories of the questions answered wrong (questions without a category are skipped).
 * @param {Array<Record<string, any>>} questions
 * @param {boolean[]} correctness
 * @returns {string[]}
 */
export function weakCategories(questions, correctness) {
    const weak = new Set();
    questions.forEach((question, index) => {
        if (!correctness[index] && question.category) weak.add(question.category);
    });
    return [...weak];
}
