/**
 * @file exam-history.js
 * @description History of the exam runs without DOM access: every finished run is stored with its
 * date, mode, overall rate and the rate per topic. The dashboard draws the course over time as an
 * SVG line chart built here, without a charting library.
 *
 * Storage format (JSON, key `exam_history`): `HistoryEntry[]`, oldest first, at most MAX_HISTORY.
 */

/** @typedef {{topic: string, total: number, correct: number}} TopicResult */
/** @typedef {{date: string, mode: string, percent: number, topics: TopicResult[]}} HistoryEntry */
/** @typedef {{x: number, y: number, label: string}} ChartPoint */

/** Runs that are kept; older ones drop out first. */
export const MAX_HISTORY = 100;

/** @param {unknown} value */
const isCount = (value) => typeof value === 'number' && Number.isInteger(value) && value >= 0;

/**
 * Reads the stored history; damaged or foreign data yields an empty list, single broken entries
 * are skipped.
 * @param {string | null | undefined} raw
 * @returns {HistoryEntry[]}
 */
export function parseHistory(raw) {
    let parsed;
    try {
        parsed = JSON.parse(raw || '[]');
    } catch (_e) {
        return [];
    }
    if (!Array.isArray(parsed)) return [];
    /** @type {HistoryEntry[]} */
    const entries = [];
    for (const item of parsed) {
        if (!item || typeof item !== 'object') continue;
        const { date, mode, percent, topics } = /** @type {Record<string, unknown>} */ (item);
        if (typeof date !== 'string' || Number.isNaN(Date.parse(date))) continue;
        if (typeof mode !== 'string' || typeof percent !== 'number' || !Number.isFinite(percent)) continue;
        /** @type {TopicResult[]} */
        const safeTopics = [];
        if (Array.isArray(topics)) {
            for (const entry of topics) {
                const { topic, total, correct } = /** @type {Record<string, unknown>} */ (entry || {});
                if (typeof topic === 'string' && isCount(total) && isCount(correct)) {
                    const safeTotal = /** @type {number} */ (total);
                    safeTopics.push({
                        topic,
                        total: safeTotal,
                        correct: Math.min(/** @type {number} */ (correct), safeTotal),
                    });
                }
            }
        }
        entries.push({ date, mode, percent: Math.min(100, Math.max(0, Math.round(percent))), topics: safeTopics });
    }
    return entries.slice(-MAX_HISTORY);
}

/**
 * Appends a finished run.
 * @param {HistoryEntry[]} history
 * @param {{mode: string, percent: number, topics: TopicResult[]}} run
 * @param {Date} [now]
 * @returns {HistoryEntry[]} a new list, the input stays untouched
 */
export function addRunToHistory(history, run, now = new Date()) {
    const entry = {
        date: now.toISOString(),
        mode: run.mode,
        percent: run.percent,
        topics: run.topics.map(({ topic, total, correct }) => ({ topic, total, correct })),
    };
    return [...history, entry].slice(-MAX_HISTORY);
}

/**
 * Topics that appear in the history, most often answered first.
 * @param {HistoryEntry[]} history
 * @returns {string[]}
 */
export function historyTopics(history) {
    /** @type {Map<string, number>} */
    const counts = new Map();
    for (const entry of history)
        for (const t of entry.topics) counts.set(t.topic, (counts.get(t.topic) || 0) + t.total);
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([topic]) => topic);
}

/**
 * Rate in percent per run, oldest first. With a topic only runs that asked that topic count.
 * @param {HistoryEntry[]} history
 * @param {string} [topic] omit for the overall rate
 * @returns {{date: string, percent: number}[]}
 */
export function rateSeries(history, topic) {
    if (!topic) return history.map((entry) => ({ date: entry.date, percent: entry.percent }));
    /** @type {{date: string, percent: number}[]} */
    const series = [];
    for (const entry of history) {
        const result = entry.topics.find((t) => t.topic === topic);
        if (result && result.total > 0) {
            series.push({ date: entry.date, percent: Math.round((result.correct / result.total) * 100) });
        }
    }
    return series;
}

/**
 * Maps a series to chart coordinates inside a width x height box with the given padding. Runs are
 * spaced evenly (the order matters, the gaps between days do not); 0 % sits at the bottom, 100 %
 * at the top.
 * @param {{date: string, percent: number}[]} series
 * @param {{width: number, height: number, padding: number}} box
 * @returns {ChartPoint[]}
 */
export function chartPoints(series, { width, height, padding }) {
    const innerWidth = width - 2 * padding;
    const innerHeight = height - 2 * padding;
    return series.map((point, index) => ({
        x: padding + (series.length === 1 ? innerWidth / 2 : (index / (series.length - 1)) * innerWidth),
        y: padding + (1 - point.percent / 100) * innerHeight,
        label: `${point.date.slice(0, 10)}: ${point.percent} %`,
    }));
}

/** @param {number} value */
const round = (value) => Math.round(value * 10) / 10;

/**
 * SVG markup of the line chart (no external input reaches it except numbers and ISO dates).
 * @param {{date: string, percent: number}[]} series
 * @param {{width?: number, height?: number, passMark?: number, title?: string}} [options]
 * @returns {string} empty string for an empty series
 */
export function buildLineChartSvg(series, { width = 480, height = 200, passMark = 50, title = '' } = {}) {
    if (series.length === 0) return '';
    const padding = 28;
    const points = chartPoints(series, { width, height, padding });
    const yFor = (/** @type {number} */ percent) => round(padding + (1 - percent / 100) * (height - 2 * padding));
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${round(p.x)} ${round(p.y)}`).join(' ');
    const grid = [0, 50, 100]
        .map(
            (percent) =>
                `<line class="history-grid" x1="${padding}" x2="${width - padding}" y1="${yFor(percent)}" y2="${yFor(percent)}"/>` +
                `<text class="history-axis" x="${padding - 6}" y="${yFor(percent) + 4}" text-anchor="end">${percent}</text>`
        )
        .join('');
    const pass = `<line class="history-pass" x1="${padding}" x2="${width - padding}" y1="${yFor(passMark)}" y2="${yFor(passMark)}"/>`;
    const dots = points
        .map(
            (p) =>
                `<circle class="history-dot" cx="${round(p.x)}" cy="${round(p.y)}" r="4"><title>${p.label}</title></circle>`
        )
        .join('');
    const heading = title ? `<title>${title.replace(/[&<>"]/g, '')}</title>` : '';
    return (
        `<svg class="history-chart" viewBox="0 0 ${width} ${height}" role="img" xmlns="http://www.w3.org/2000/svg">` +
        `${heading}${grid}${pass}<path class="history-line" d="${path}" fill="none"/>${dots}</svg>`
    );
}
