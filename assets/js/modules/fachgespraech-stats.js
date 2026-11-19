/**
 * @file fachgespraech-stats.js
 * @description Results of the oral exam practice (IHK cockpit) without DOM access: how often each
 * category was practised, how often the answer was rated good and how many of the self-assessment
 * criteria were ticked. Stored as JSON under `fachgespraech_results`.
 *
 * Format: `{ [category]: { total, good, criteriaHit, criteriaTotal } }`
 */

/** @typedef {{total: number, good: number, criteriaHit: number, criteriaTotal: number}} CategoryStats */
/** @typedef {Record<string, CategoryStats>} FachgespraechStats */

/** @param {unknown} value */
const isCount = (value) => typeof value === 'number' && Number.isInteger(value) && value >= 0;

/**
 * Reads the stored results; damaged or foreign data yields an empty result.
 * @param {string | null | undefined} raw
 * @returns {FachgespraechStats}
 */
export function parseFachgespraechStats(raw) {
    /** @type {FachgespraechStats} */
    const stats = {};
    let parsed;
    try {
        parsed = JSON.parse(raw || '{}');
    } catch (_e) {
        return stats;
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return stats;
    for (const [category, entry] of Object.entries(parsed)) {
        const { total, good, criteriaHit, criteriaTotal } = /** @type {Record<string, unknown>} */ (entry || {});
        if (isCount(total) && isCount(good) && isCount(criteriaHit) && isCount(criteriaTotal)) {
            const safeTotal = /** @type {number} */ (total);
            const safeCriteriaTotal = /** @type {number} */ (criteriaTotal);
            stats[category] = {
                total: safeTotal,
                good: Math.min(/** @type {number} */ (good), safeTotal),
                criteriaHit: Math.min(/** @type {number} */ (criteriaHit), safeCriteriaTotal),
                criteriaTotal: safeCriteriaTotal,
            };
        }
    }
    return stats;
}

/**
 * Adds one answered question.
 * @param {FachgespraechStats} stats
 * @param {{category: string, good: boolean, criteriaHit: number, criteriaTotal: number}} answer
 * @returns {FachgespraechStats} a new object, the input stays untouched
 */
export function recordFachgespraechAnswer(stats, { category, good, criteriaHit, criteriaTotal }) {
    const previous = stats[category] || { total: 0, good: 0, criteriaHit: 0, criteriaTotal: 0 };
    const safeTotal = Math.max(0, Math.floor(criteriaTotal));
    return {
        ...stats,
        [category]: {
            total: previous.total + 1,
            good: previous.good + (good ? 1 : 0),
            criteriaHit: previous.criteriaHit + Math.min(Math.max(0, Math.floor(criteriaHit)), safeTotal),
            criteriaTotal: previous.criteriaTotal + safeTotal,
        },
    };
}

/**
 * Categories with their share of good answers and of ticked criteria, weakest first (by good
 * answers, then by ticked criteria).
 * @param {FachgespraechStats} stats
 * @returns {{category: string, total: number, goodPercent: number, criteriaPercent: number | null}[]}
 */
export function summarizeFachgespraech(stats) {
    return Object.entries(stats)
        .filter(([, entry]) => entry.total > 0)
        .map(([category, entry]) => ({
            category,
            total: entry.total,
            goodPercent: Math.round((entry.good / entry.total) * 100),
            criteriaPercent:
                entry.criteriaTotal > 0 ? Math.round((entry.criteriaHit / entry.criteriaTotal) * 100) : null,
        }))
        .sort(
            (a, b) =>
                a.goodPercent - b.goodPercent ||
                (a.criteriaPercent ?? 0) - (b.criteriaPercent ?? 0) ||
                a.category.localeCompare(b.category)
        );
}
