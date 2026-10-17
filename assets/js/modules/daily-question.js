/**
 * @file daily-question.js
 * @description Logic for the daily IHK exam question widget on the dashboard.
 * Selects a deterministic question per day and tracks streaks in localStorage.
 */

export const STORAGE_KEY = 'fiae_daily_question_state';

/**
 * Returns YYYY-MM-DD string for a given date in local time.
 * @param {Date} [date]
 * @returns {string}
 */
export function getLocalDateKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

/**
 * Returns deterministic index for a date key and question pool size.
 * @param {string} dateKey
 * @param {number} poolSize
 * @returns {number}
 */
export function getDailyQuestionIndex(dateKey, poolSize) {
    if (!poolSize || poolSize <= 0) return 0;
    let hash = 0;
    for (let i = 0; i < dateKey.length; i++) {
        hash = (hash << 5) - hash + dateKey.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash) % poolSize;
}

/**
 * Calculates new streak based on last answered date and current date.
 * @param {string|null} lastDateKey YYYY-MM-DD
 * @param {string} currentDateKey YYYY-MM-DD
 * @param {number} currentStreak
 * @returns {number}
 */
export function calculateStreak(lastDateKey, currentDateKey, currentStreak) {
    if (!lastDateKey) return 1;
    if (lastDateKey === currentDateKey) return Math.max(1, currentStreak);

    const prev = new Date(`${lastDateKey}T00:00:00`);
    const curr = new Date(`${currentDateKey}T00:00:00`);
    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
        return (currentStreak || 0) + 1;
    } else if (diffDays <= 0) {
        return Math.max(1, currentStreak);
    } else {
        return 1; // streak reset
    }
}

/**
 * Load state from storage.
 * @param {Storage} [storage]
 * @returns {{ streak: number, lastDate: string|null, answered: Record<string, { answeredIndex: number, isCorrect: boolean }> }}
 */
export function loadDailyState(storage = window.localStorage) {
    try {
        const raw = storage.getItem(STORAGE_KEY);
        if (!raw) return { streak: 0, lastDate: null, answered: {} };
        const parsed = JSON.parse(raw);
        return {
            streak: Number(parsed.streak) || 0,
            lastDate: parsed.lastDate || null,
            answered: parsed.answered || {},
        };
    } catch {
        return { streak: 0, lastDate: null, answered: {} };
    }
}

/**
 * Save answer and update streak in storage.
 * @param {string} dateKey
 * @param {number} answeredIndex
 * @param {boolean} isCorrect
 * @param {Storage} [storage]
 * @returns {{ streak: number, lastDate: string, answered: Record<string, { answeredIndex: number, isCorrect: boolean }> }}
 */
export function recordDailyAnswer(dateKey, answeredIndex, isCorrect, storage = window.localStorage) {
    const state = loadDailyState(storage);
    const newStreak = calculateStreak(state.lastDate, dateKey, state.streak);
    state.streak = newStreak;
    state.lastDate = dateKey;
    state.answered[dateKey] = { answeredIndex, isCorrect };

    try {
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
        // quota exceeded or storage disabled
    }
    return state;
}
