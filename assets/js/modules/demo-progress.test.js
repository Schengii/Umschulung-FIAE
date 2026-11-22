import { describe, it, expect } from 'vitest';
import {
    buildDemoBackup,
    activateDemo,
    deactivateDemo,
    isDemoActive,
    DEMO_ACTIVE_KEY,
    DEMO_SNAPSHOT_KEY,
    PERSONAL_KEYS,
} from './demo-progress.js';
import { parseBackup, isBackupKey } from './progress-backup.js';
import { parseHistory } from './exam-history.js';
import { parseTopicStats, parseWrongQuestions } from './exam-statistics.js';
import { EXAM_QUESTIONS } from './exam-questions.js';
import { startOfDay } from './leitner-box.js';

const NOW = new Date(2026, 10, 22, 14, 30);
const DAY = 24 * 60 * 60 * 1000;

describe('buildDemoBackup', () => {
    const backup = buildDemoBackup(NOW);

    it('liefert ein Backup, das die echte Importprüfung besteht', () => {
        const { entries, skipped } = parseBackup(JSON.stringify(backup));
        expect(entries.length).toBe(Object.keys(backup.data).length);
        expect(skipped).toBe(0);
        for (const key of Object.keys(backup.data)) expect(isBackupKey(key)).toBe(true);
    });

    it('enthält weder persönliche Einstellungen noch Demo-Schlüssel', () => {
        for (const key of [...PERSONAL_KEYS, DEMO_ACTIVE_KEY, DEMO_SNAPSHOT_KEY]) {
            expect(Object.keys(backup.data)).not.toContain(key);
        }
        expect(isBackupKey(DEMO_ACTIVE_KEY)).toBe(false);
        expect(isBackupKey(DEMO_SNAPSHOT_KEY)).toBe(false);
    });

    it('hat einen Prüfungsverlauf mit allen Modi, in der Vergangenheit und mit steigender Tendenz', () => {
        const history = parseHistory(backup.data.exam_history);
        expect(history.length).toBeGreaterThanOrEqual(8);
        expect(new Set(history.map((run) => run.mode))).toEqual(new Set(['ap1', 'ap2', 'wiso']));
        for (const run of history) {
            const age = NOW.getTime() - Date.parse(run.date);
            expect(age).toBeGreaterThan(0);
            expect(age).toBeLessThanOrEqual(60 * DAY);
        }
        expect(history[history.length - 1].percent).toBeGreaterThan(history[0].percent);
    });

    it('hat eine Themenstatistik und falsche Fragen aus dem echten Fragenpool', () => {
        expect(Object.keys(parseTopicStats(backup.data.exam_topic_stats)).length).toBeGreaterThan(3);
        const wrong = parseWrongQuestions(backup.data.exam_wrong_questions);
        const ids = new Set(EXAM_QUESTIONS.map((question) => question.id));
        expect(wrong.length).toBeGreaterThan(0);
        for (const id of wrong) expect(ids.has(id)).toBe(true);
    });

    it('legt Fälligkeiten auf lokale Mitternacht, heute bis eine Woche, mit fälligen und künftigen Karten', () => {
        const due = Object.values(JSON.parse(backup.data.flashcards_due_dates));
        const today = startOfDay(NOW.getTime());
        expect(due.length).toBeGreaterThan(5);
        for (const value of due) {
            expect(value).toBe(startOfDay(value));
            expect(value).toBeGreaterThanOrEqual(today);
            expect(value).toBeLessThanOrEqual(today + 8 * DAY);
        }
        expect(due.some((value) => value === today)).toBe(true);
        expect(due.some((value) => value > today)).toBe(true);
    });

    it('ist bei gleichem Zeitpunkt identisch', () => {
        expect(buildDemoBackup(NOW)).toEqual(backup);
    });

    it('verschiebt die Verlaufsdaten mit dem Zeitpunkt', () => {
        const later = new Date(NOW.getTime() + 30 * DAY);
        const first = parseHistory(backup.data.exam_history);
        const shifted = parseHistory(buildDemoBackup(later).data.exam_history);
        expect(Date.parse(shifted[0].date) - Date.parse(first[0].date)).toBeGreaterThanOrEqual(29 * DAY);
        expect(Date.parse(shifted[0].date) - Date.parse(first[0].date)).toBeLessThanOrEqual(31 * DAY);
    });
});

/** Minimal Storage double (Map based) with the parts the module uses. */
function makeStorage(initial = {}) {
    const map = new Map(Object.entries(initial));
    return {
        get length() {
            return map.size;
        },
        key: (index) => [...map.keys()][index] ?? null,
        getItem: (key) => (map.has(key) ? map.get(key) : null),
        setItem: (key, value) => void map.set(key, String(value)),
        removeItem: (key) => void map.delete(key),
        snapshot: () => Object.fromEntries(map),
    };
}

describe('activateDemo und deactivateDemo', () => {
    const REAL = {
        exam_history: JSON.stringify([{ date: '2026-11-01T10:00:00.000Z', mode: 'ap1', percent: 70, topics: [] }]),
        flashcards_box_levels: '{"1":2}',
        username: 'Maxi',
        theme: 'light',
        foreign_app: 'bleibt',
    };

    it('ersetzt den Fortschritt durch Demo-Daten, behält persönliche Einstellungen und merkt sich den Zustand', () => {
        const storage = makeStorage(REAL);
        activateDemo(storage, NOW);
        expect(isDemoActive(storage)).toBe(true);
        expect(storage.getItem('exam_history')).toBe(buildDemoBackup(NOW).data.exam_history);
        expect(storage.getItem('username')).toBe('Maxi');
        expect(storage.getItem('theme')).toBe('light');
        expect(storage.getItem('foreign_app')).toBe('bleibt');
    });

    it('stellt den echten Stand beim Zurücksetzen wieder her und räumt die Demo-Schlüssel auf', () => {
        const storage = makeStorage(REAL);
        activateDemo(storage, NOW);
        deactivateDemo(storage);
        expect(isDemoActive(storage)).toBe(false);
        expect(storage.snapshot()).toEqual(REAL);
    });

    it('lässt einen vorher leeren Stand nach dem Zurücksetzen wieder leer', () => {
        const storage = makeStorage({ theme: 'dark' });
        activateDemo(storage, NOW);
        expect(storage.getItem('exam_history')).not.toBeNull();
        deactivateDemo(storage);
        expect(storage.snapshot()).toEqual({ theme: 'dark' });
    });

    it('überschreibt den Snapshot bei erneutem Aktivieren nicht mit Demo-Daten', () => {
        const storage = makeStorage(REAL);
        activateDemo(storage, NOW);
        activateDemo(storage, new Date(NOW.getTime() + DAY));
        deactivateDemo(storage);
        expect(storage.snapshot()).toEqual(REAL);
    });

    it('räumt bei fehlendem Snapshot auf, ohne zu werfen', () => {
        const storage = makeStorage(REAL);
        activateDemo(storage, NOW);
        storage.removeItem(DEMO_SNAPSHOT_KEY);
        expect(() => deactivateDemo(storage)).not.toThrow();
        expect(isDemoActive(storage)).toBe(false);
        expect(storage.getItem('exam_history')).toBeNull();
        expect(storage.getItem('username')).toBe('Maxi');
    });

    it('räumt bei beschädigtem Snapshot auf, ohne zu werfen', () => {
        const storage = makeStorage(REAL);
        activateDemo(storage, NOW);
        storage.setItem(DEMO_SNAPSHOT_KEY, '{kaputt');
        expect(() => deactivateDemo(storage)).not.toThrow();
        expect(isDemoActive(storage)).toBe(false);
        expect(storage.getItem('exam_history')).toBeNull();
    });

    it('behält in der Demo geänderte Einstellungen nach dem Zurücksetzen', () => {
        const storage = makeStorage(REAL);
        activateDemo(storage, NOW);
        storage.setItem('theme', 'dark');
        storage.setItem('lang', 'en');
        deactivateDemo(storage);
        expect(storage.getItem('theme')).toBe('dark');
        expect(storage.getItem('lang')).toBe('en');
        expect(storage.getItem('exam_history')).toBe(REAL.exam_history);
    });

    it('zählt nur persönliche Schlüssel als Einstellungen', () => {
        expect(PERSONAL_KEYS).toContain('theme');
        expect(PERSONAL_KEYS).not.toContain('exam_history');
        expect(DEMO_ACTIVE_KEY).toBe('demo_mode_active');
    });
});
