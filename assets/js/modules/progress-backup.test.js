import { describe, it, expect } from 'vitest';
import {
    BACKUP_APP_ID,
    BACKUP_VERSION,
    BackupError,
    MAX_BACKUP_BYTES,
    applyBackup,
    backupFileName,
    createBackup,
    isBackupKey,
    parseBackup,
} from './progress-backup.js';

/** Minimal in-memory stand-in for window.localStorage. */
function fakeStorage(initial = {}) {
    const map = new Map(Object.entries(initial));
    return {
        get length() {
            return map.size;
        },
        key: (index) => [...map.keys()][index] ?? null,
        getItem: (key) => (map.has(key) ? map.get(key) : null),
        setItem: (key, value) => void map.set(key, String(value)),
        removeItem: (key) => void map.delete(key),
        dump: () => Object.fromEntries(map),
    };
}

const errorCode = (text) => {
    try {
        parseBackup(text);
    } catch (error) {
        return error instanceof BackupError ? error.code : `unexpected: ${error}`;
    }
    return 'no error';
};

const validFile = (data, extra = {}) =>
    JSON.stringify({
        app: BACKUP_APP_ID,
        version: BACKUP_VERSION,
        exportedAt: '2026-03-10T12:00:00.000Z',
        data,
        ...extra,
    });

describe('isBackupKey', () => {
    it('accepts the site keys and its key families', () => {
        for (const key of ['flashcards_box_levels', 'exam_results', 'achievements', 'theme', 'lang']) {
            expect(isBackupKey(key), key).toBe(true);
        }
        expect(isBackupKey('fiae_progress_phase_2_topic_3')).toBe(true);
        expect(isBackupKey('news_likes_42_count')).toBe(true);
    });

    it('rejects caches, consent flags and keys of other apps on the same origin', () => {
        for (const key of ['github_projects_cache', 'cookieConsent', 'pwa_dismissed', 'finanzen_portfolio', '']) {
            expect(isBackupKey(key), key).toBe(false);
        }
    });
});

describe('createBackup', () => {
    it('exports only the site keys, with metadata', () => {
        const storage = fakeStorage({
            quiz_best_score: '4',
            flashcards_box_levels: '{"1":2}',
            github_projects_cache: '[]',
            some_other_app: 'x',
        });
        const backup = createBackup(storage, new Date('2026-03-10T12:00:00Z'));
        expect(backup).toEqual({
            app: BACKUP_APP_ID,
            version: BACKUP_VERSION,
            exportedAt: '2026-03-10T12:00:00.000Z',
            data: { quiz_best_score: '4', flashcards_box_levels: '{"1":2}' },
        });
    });

    it('round-trips through parseBackup', () => {
        const storage = fakeStorage({ quiz_best_score: '4', achievements: '["first_visit"]' });
        const parsed = parseBackup(JSON.stringify(createBackup(storage)));
        expect(Object.fromEntries(parsed.entries)).toEqual({ quiz_best_score: '4', achievements: '["first_visit"]' });
        expect(parsed.skipped).toBe(0);
    });
});

describe('parseBackup', () => {
    it('rejects files that are not a backup of this site', () => {
        expect(errorCode('not json at all')).toBe('not-json');
        expect(errorCode('[]')).toBe('wrong-file');
        expect(errorCode('null')).toBe('wrong-file');
        expect(errorCode(JSON.stringify({ app: 'something-else', version: 1, data: {} }))).toBe('wrong-file');
        expect(errorCode(JSON.stringify({ app: BACKUP_APP_ID, version: 1, data: [] }))).toBe('wrong-file');
    });

    it('rejects backups of a newer format version', () => {
        expect(errorCode(validFile({ theme: 'dark' }, { version: BACKUP_VERSION + 1 }))).toBe('newer-version');
        expect(errorCode(validFile({ theme: 'dark' }, { version: 'one' }))).toBe('newer-version');
    });

    it('rejects oversized input before parsing it', () => {
        expect(errorCode('x'.repeat(MAX_BACKUP_BYTES + 1))).toBe('too-large');
    });

    it('drops unknown keys and non-string values', () => {
        const parsed = parseBackup(validFile({ theme: 'dark', evil_key: 'x', quiz_best_score: 5, lang: 'en' }));
        expect(parsed.entries).toEqual([
            ['theme', 'dark'],
            ['lang', 'en'],
        ]);
        expect(parsed.skipped).toBe(2);
    });

    it('drops values that should be JSON but are damaged', () => {
        const parsed = parseBackup(validFile({ flashcards_box_levels: '{broken', achievements: '["a"]' }));
        expect(parsed.entries).toEqual([['achievements', '["a"]']]);
        expect(parsed.skipped).toBe(1);
    });

    it('rejects a backup without any usable entry', () => {
        expect(errorCode(validFile({}))).toBe('empty');
        expect(errorCode(validFile({ evil_key: 'x' }))).toBe('empty');
    });

    it('tolerates a missing or invalid export date', () => {
        expect(parseBackup(validFile({ theme: 'dark' }, { exportedAt: 'yesterday' })).exportedAt).toBeNull();
        expect(parseBackup(validFile({ theme: 'dark' })).exportedAt).toBe('2026-03-10T12:00:00.000Z');
    });
});

describe('applyBackup', () => {
    it('replaces the site data and leaves foreign keys alone', () => {
        const storage = fakeStorage({
            quiz_best_score: '2',
            known_flashcards: '[1,2]',
            fiae_progress_phase_1_topic_0: 'true',
            some_other_app: 'keep me',
            github_projects_cache: '[]',
        });
        applyBackup(storage, [
            ['quiz_best_score', '5'],
            ['theme', 'light'],
        ]);
        expect(storage.dump()).toEqual({
            quiz_best_score: '5',
            theme: 'light',
            some_other_app: 'keep me',
            github_projects_cache: '[]',
        });
    });
});

describe('backupFileName', () => {
    it('contains the local date', () => {
        expect(backupFileName(new Date(2026, 2, 5))).toBe('fiae-lernfortschritt-2026-03-05.json');
    });
});
