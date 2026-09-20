/**
 * @file grade-calculator.js
 * @description Pure IHK grade & QA-quality-score logic used by dashboard.js.
 * Kept dependency-free (no DOM) so it can be unit-tested directly.
 */

/** Maps a 0-100 exam score to the IHK 1-6 grade scale (1 = best, 6 = failed). */
export function getIhkGrade(score) {
    if (score >= 92) return 1;
    if (score >= 81) return 2;
    if (score >= 67) return 3;
    if (score >= 50) return 4;
    if (score >= 30) return 5;
    return 6;
}

const WEIGHTS = { coverage: 0.4, cleanCode: 0.3, docs: 0.15, security: 0.15 };

function clampPercent(value) {
    return Math.min(100, Math.max(0, Number(value) || 0));
}

/** Weighted overall quality score (0-100) from the four QA metric inputs. */
export function computeQualityScore({ coverage, cleanCode, docs, security }) {
    const c = clampPercent(coverage);
    const cc = clampPercent(cleanCode);
    const d = clampPercent(docs);
    const s = clampPercent(security);
    return (c * WEIGHTS.coverage) + (cc * WEIGHTS.cleanCode) + (d * WEIGHTS.docs) + (s * WEIGHTS.security);
}

/** Classifies an overall quality score into a status tier for the badge/ring color. */
export function getQualityStatus(overallScore) {
    if (overallScore >= 90) return 'success';
    if (overallScore >= 75) return 'warning';
    return 'danger';
}
