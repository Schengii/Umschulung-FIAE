/**
 * Demo progress — a sample learning state for visitors (recruiters, examiners) who would
 * otherwise see only empty widgets. The sample data is built as an ordinary backup object
 * (see progress-backup.js) with dates relative to "now", so charts and the study calendar
 * never look stale. Nothing here touches localStorage directly: the storage is passed in.
 */

import { BACKUP_APP_ID, BACKUP_VERSION, applyBackup, createBackup, isBackupKey } from './progress-backup.js';
import { EXAM_QUESTIONS } from './exam-questions.js';
import { rankTopics } from './exam-statistics.js';
import { startOfDay } from './leitner-box.js';

/** Set while the sample state is loaded. Deliberately not part of the backup allowlist. */
export const DEMO_ACTIVE_KEY = 'demo_mode_active';
/** The visitor's real progress, parked while the sample state is loaded. Not in the allowlist either. */
export const DEMO_SNAPSHOT_KEY = 'demo_mode_snapshot';

/** Settings of the visitor: neither replaced by the sample state nor reverted afterwards. */
export const PERSONAL_KEYS = [
    'username',
    'theme',
    'lang',
    'portfolio_accent',
    'portfolio_dyslexia',
    'portfolio_colorblind',
    'portfolio_font_scale',
    'portfolio_contrast',
    'sound_enabled',
    'interview_tts_enabled',
    'flashcards_extended_enabled',
    'flashcards_new_per_day',
];

/** Days before "now" of the sample exam runs, oldest first. */
const RUN_DAYS_AGO = [54, 47, 40, 33, 26, 19, 12, 8, 5, 2, 1];
const MODES = ['ap1', 'ap2', 'wiso'];

/** [topic, questions per run] per exam. Topics are keys of EXAM_TOPICS. */
const RUN_TOPICS = {
    ap1: [
        ['hardware', 4],
        ['network', 4],
        ['security', 4],
        ['project', 3],
    ],
    ap2: [
        ['basics', 3],
        ['oop', 3],
        ['sql', 3],
        ['algorithms', 3],
        ['quality', 3],
    ],
    wiso: [
        ['labour', 3],
        ['social', 3],
        ['business', 3],
        ['codetermination', 3],
    ],
};

/** How well the visitor "starts" in each topic (share of correct answers in the first run). */
const START_SKILL = {
    hardware: 0.6,
    network: 0.45,
    security: 0.5,
    project: 0.6,
    basics: 0.65,
    oop: 0.55,
    sql: 0.4,
    algorithms: 0.4,
    quality: 0.55,
    labour: 0.5,
    social: 0.45,
    business: 0.6,
    codetermination: 0.4,
};

/** Leitner box of the 18 core flashcards (ids 1 to 18). */
const BOX_LEVELS = [5, 4, 5, 3, 4, 2, 5, 3, 1, 4, 2, 3, 5, 1, 4, 2, 3, 4];

/**
 * @param {Date} now
 * @param {number} daysAgo
 * @returns {Date} 19:00 local time, `daysAgo` days before the day of `now`
 */
function runDate(now, daysAgo) {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(19, 0, 0, 0);
    return date;
}

/** @param {Date} now */
function buildHistory(now) {
    const last = RUN_DAYS_AGO.length - 1;
    return RUN_DAYS_AGO.map((daysAgo, runIndex) => {
        const mode = /** @type {'ap1' | 'ap2' | 'wiso'} */ (MODES[runIndex % MODES.length]);
        const progress = runIndex / last;
        let totalAll = 0;
        let correctAll = 0;
        const topics = RUN_TOPICS[mode].map(([topic, total], topicIndex) => {
            const skill = START_SKILL[/** @type {keyof typeof START_SKILL} */ (topic)] + 0.4 * progress;
            const wiggle = (((runIndex * 7 + topicIndex * 3) % 5) - 2) * 0.04;
            const ratio = Math.min(1, Math.max(0.2, skill + wiggle));
            const correct = Math.min(total, Math.round(total * ratio));
            totalAll += total;
            correctAll += correct;
            return { topic, total, correct };
        });
        return {
            date: runDate(now, daysAgo).toISOString(),
            mode,
            percent: Math.round((correctAll / totalAll) * 100),
            topics,
        };
    });
}

/**
 * Sample progress as a backup object, ready for parseBackup/applyBackup.
 * @param {Date} now
 * @returns {{app: string, version: number, exportedAt: string, data: Record<string, string>}}
 */
export function buildDemoBackup(now) {
    const history = buildHistory(now);

    /** @type {Record<string, {total: number, correct: number}>} */
    const topicStats = {};
    for (const run of history) {
        for (const { topic, total, correct } of run.topics) {
            const entry = topicStats[topic] || (topicStats[topic] = { total: 0, correct: 0 });
            entry.total += total;
            entry.correct += correct;
        }
    }

    // The three weakest topics contribute the questions still answered wrongly.
    const weakTopics = rankTopics(topicStats)
        .slice(0, 3)
        .map((entry) => entry.topic);
    const wrongQuestions = weakTopics
        .flatMap((topic) => EXAM_QUESTIONS.filter((question) => question.topic === topic).slice(0, 3))
        .map((question) => question.id)
        .slice(0, 8);

    const today = startOfDay(now.getTime());
    /** @type {Record<string, number>} */
    const boxLevels = {};
    /** @type {Record<string, number>} */
    const dueDates = {};
    BOX_LEVELS.forEach((level, index) => {
        const id = String(index + 1);
        boxLevels[id] = level;
        const due = new Date(today);
        due.setDate(due.getDate() + (((index + 1) * 3) % 8));
        dueDates[id] = due.getTime();
    });
    const known = BOX_LEVELS.flatMap((level, index) => (level >= 4 ? [index + 1] : []));

    return {
        app: BACKUP_APP_ID,
        version: BACKUP_VERSION,
        exportedAt: now.toISOString(),
        data: {
            flashcards_box_levels: JSON.stringify(boxLevels),
            flashcards_due_dates: JSON.stringify(dueDates),
            known_flashcards: JSON.stringify(known),
            flashcards_starred: JSON.stringify([2, 9, 14]),
            flashcard_total_count: String(BOX_LEVELS.length),
            flashcard_correct_count: String(BOX_LEVELS.filter((level) => level === 5).length),
            exam_history: JSON.stringify(history),
            exam_topic_stats: JSON.stringify(topicStats),
            exam_wrong_questions: JSON.stringify(wrongQuestions),
            quiz_best_score: '9',
            interview_best_score: '85',
            learning_recommendations_quiz_weak_categories: JSON.stringify(['database', 'wiso']),
            learning_recommendations_flashcards_wrong_counts: JSON.stringify({ database: 4, network: 2 }),
        },
    };
}

/** @typedef {Pick<Storage, 'length' | 'key' | 'getItem' | 'setItem' | 'removeItem'>} DemoStorage */

/** @param {DemoStorage} storage */
export function isDemoActive(storage) {
    return storage.getItem(DEMO_ACTIVE_KEY) === '1';
}

/**
 * The visitor's settings as backup entries, so they survive both directions of the switch.
 * @param {DemoStorage} storage
 * @returns {[string, string][]}
 */
function personalEntries(storage) {
    /** @type {[string, string][]} */
    const entries = [];
    for (const key of PERSONAL_KEYS) {
        const value = storage.getItem(key);
        if (value !== null) entries.push([key, value]);
    }
    return entries;
}

/**
 * Loads the sample state. The real progress is parked under DEMO_SNAPSHOT_KEY first. Calling it
 * while the sample state is already loaded does nothing, so the parked state is never overwritten.
 * @param {DemoStorage} storage
 * @param {Date} now
 */
export function activateDemo(storage, now) {
    if (isDemoActive(storage)) return;
    const progress = Object.fromEntries(
        Object.entries(createBackup(storage).data).filter(([key]) => !PERSONAL_KEYS.includes(key))
    );
    storage.setItem(DEMO_SNAPSHOT_KEY, JSON.stringify(progress));
    try {
        applyBackup(storage, [...Object.entries(buildDemoBackup(now).data), ...personalEntries(storage)]);
        storage.setItem(DEMO_ACTIVE_KEY, '1');
    } catch (error) {
        // Storage full or blocked halfway: put the real progress back before reporting the failure.
        try {
            deactivateDemo(storage);
        } catch (_e) {
            /* nothing more to do */
        }
        throw error;
    }
}

/**
 * Brings the real progress back and removes the sample state. A missing or damaged snapshot
 * leaves only the visitor's settings behind; it never throws because of the snapshot's content.
 * @param {DemoStorage} storage
 */
export function deactivateDemo(storage) {
    /** @type {[string, string][]} */
    let progress = [];
    try {
        const parsed = JSON.parse(storage.getItem(DEMO_SNAPSHOT_KEY) || 'null');
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            progress = Object.entries(parsed).filter(
                (/** @type {[string, unknown]} */ [key, value]) =>
                    typeof value === 'string' && isBackupKey(key) && !PERSONAL_KEYS.includes(key)
            );
        }
    } catch (_e) {
        progress = [];
    }
    applyBackup(storage, [...progress, ...personalEntries(storage)]);
    storage.removeItem(DEMO_SNAPSHOT_KEY);
    storage.removeItem(DEMO_ACTIVE_KEY);
}
