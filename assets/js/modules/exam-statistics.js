/**
 * @file exam-statistics.js
 * @description Statistics over all exam runs, without DOM access: how often each topic was
 * answered correctly and which questions are still answered wrongly. The simulator stores both
 * and uses them for the "repeat weaknesses" run; the dashboard can read the same data.
 *
 * Storage format (both values are JSON):
 *  - topic stats: `{ [topic]: { total: number, correct: number } }`
 *  - wrong questions: `string[]` of question ids, most recently missed last
 */

/** @typedef {import('./exam-questions.js').ExamQuestion} ExamQuestion */
/** @typedef {Record<string, {total: number, correct: number}>} TopicStats */

/** Wrong questions that are remembered at most; older ones drop out first. */
export const MAX_WRONG_QUESTIONS = 150;

/** A topic needs at least this many answered questions before its rate counts as a weakness. */
export const MIN_ANSWERS_FOR_RANKING = 3;

/** Topics below this rate count as weaknesses (the IHK pass mark is 50 points). */
export const WEAK_TOPIC_PERCENT = 60;

/**
 * Reads the stored topic statistics; damaged or foreign data yields an empty result.
 * @param {string | null | undefined} raw
 * @returns {TopicStats}
 */
export function parseTopicStats(raw) {
    /** @type {TopicStats} */
    const stats = {};
    let parsed;
    try {
        parsed = JSON.parse(raw || '{}');
    } catch (_e) {
        return stats;
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return stats;
    for (const [topic, entry] of Object.entries(parsed)) {
        const { total, correct } = /** @type {Record<string, unknown>} */ (entry || {});
        if (Number.isInteger(total) && Number.isInteger(correct)) {
            const safeTotal = Math.max(0, /** @type {number} */ (total));
            stats[topic] = {
                total: safeTotal,
                correct: Math.min(Math.max(0, /** @type {number} */ (correct)), safeTotal),
            };
        }
    }
    return stats;
}

/**
 * Reads the stored list of wrongly answered question ids.
 * @param {string | null | undefined} raw
 * @returns {string[]}
 */
export function parseWrongQuestions(raw) {
    let parsed;
    try {
        parsed = JSON.parse(raw || '[]');
    } catch (_e) {
        return [];
    }
    if (!Array.isArray(parsed)) return [];
    return [...new Set(parsed.filter((id) => typeof id === 'string'))].slice(-MAX_WRONG_QUESTIONS);
}

/**
 * Adds one finished run to the topic statistics. A question left unanswered counts as wrong,
 * like in the exam itself.
 * @param {TopicStats} stats
 * @param {ExamQuestion[]} questions
 * @param {(number | null | undefined)[]} answers
 * @returns {TopicStats} a new object, the input stays untouched
 */
export function addRunToTopicStats(stats, questions, answers) {
    /** @type {TopicStats} */
    const next = {};
    for (const [topic, entry] of Object.entries(stats)) next[topic] = { ...entry };
    questions.forEach((question, index) => {
        const entry = next[question.topic] || { total: 0, correct: 0 };
        entry.total++;
        if (answers[index] === question.correct) entry.correct++;
        next[question.topic] = entry;
    });
    return next;
}

/**
 * Updates the list of wrongly answered questions after a run: new mistakes are appended, a
 * question answered correctly now is removed.
 * @param {string[]} wrongIds
 * @param {ExamQuestion[]} questions
 * @param {(number | null | undefined)[]} answers
 * @returns {string[]}
 */
export function updateWrongQuestions(wrongIds, questions, answers) {
    const missed = new Set(
        questions.filter((question, index) => answers[index] !== question.correct).map((question) => question.id)
    );
    const solved = new Set(
        questions.filter((question, index) => answers[index] === question.correct).map((question) => question.id)
    );
    const kept = wrongIds.filter((id) => !solved.has(id) && !missed.has(id));
    return [...kept, ...missed].slice(-MAX_WRONG_QUESTIONS);
}

/**
 * Topics with their rate over all runs, weakest first. Topics with fewer than
 * `MIN_ANSWERS_FOR_RANKING` answers are left out: a single wrong answer is no trend.
 * @param {TopicStats} stats
 * @returns {{topic: string, total: number, correct: number, percent: number}[]}
 */
export function rankTopics(stats) {
    return Object.entries(stats)
        .filter(([, entry]) => entry.total >= MIN_ANSWERS_FOR_RANKING)
        .map(([topic, entry]) => ({
            topic,
            total: entry.total,
            correct: entry.correct,
            percent: Math.round((entry.correct / entry.total) * 100),
        }))
        .sort((a, b) => a.percent - b.percent || b.total - a.total);
}

/**
 * Picks the questions for a "repeat weaknesses" run: first the ones still answered wrongly,
 * then fresh questions of the weakest topics, then of the stronger ones. Returns fewer than `count` if there is not
 * enough material; an empty list if nothing is known yet.
 * @param {ExamQuestion[]} pool
 * @param {string[]} wrongIds
 * @param {TopicStats} stats
 * @param {number} count
 * @param {(items: ExamQuestion[]) => ExamQuestion[]} shuffleItems
 * @returns {ExamQuestion[]}
 */
export function pickWeaknessQuestions(pool, wrongIds, stats, count, shuffleItems) {
    const byId = new Map(pool.map((question) => [question.id, question]));
    // Most recent mistakes first; ids that no longer exist in the pool are skipped.
    const missed = [...wrongIds]
        .reverse()
        .map((id) => byId.get(id))
        .filter((question) => question !== undefined);
    const picked = /** @type {ExamQuestion[]} */ (shuffleItems(missed.slice(0, count)));

    // Without a single mistake or ranked topic there is nothing to repeat.
    if (picked.length === 0 && rankTopics(stats).length === 0) return [];

    if (picked.length < count) {
        const taken = new Set(picked.map((question) => question.id));
        const ranked = rankTopics(stats);
        // Weak topics first; strong ones only fill up what is still missing.
        const topics = [
            ...ranked.filter((entry) => entry.percent < WEAK_TOPIC_PERCENT),
            ...ranked.filter((entry) => entry.percent >= WEAK_TOPIC_PERCENT),
        ].map((entry) => entry.topic);
        // Topics without enough data come last: new material rather than nothing.
        for (const question of pool) if (!topics.includes(question.topic)) topics.push(question.topic);
        for (const topic of topics) {
            if (picked.length >= count) break;
            const fresh = shuffleItems(pool.filter((question) => question.topic === topic && !taken.has(question.id)));
            for (const question of fresh) {
                if (picked.length >= count) break;
                picked.push(question);
                taken.add(question.id);
            }
        }
    }
    return picked;
}
