import { describe, it, expect } from 'vitest';
import { buildDemoBackup, DEMO_ACTIVE_KEY, DEMO_SNAPSHOT_KEY, PERSONAL_KEYS } from './demo-progress.js';
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
