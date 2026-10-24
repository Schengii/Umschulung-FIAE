import fs from 'node:fs';
import vm from 'node:vm';
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
    serializeBackupToPayload,
    deserializeBackupFromPayload,
    getSyncUrl,
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

describe('STORAGE_KEYS synchronization', () => {
    it('covers all non-cache persistent keys from STORAGE_KEYS in the backup allowlist', () => {
        const constantsCode = fs.readFileSync(new URL('../constants.js', import.meta.url), 'utf8');
        const context = {};
        context.window = context;
        vm.createContext(context);
        vm.runInContext(constantsCode, context);
        const STORAGE_KEYS = context.STORAGE_KEYS;

        expect(STORAGE_KEYS, 'STORAGE_KEYS should be exported on global context').toBeDefined();
        const ignoredKeys = new Set(['cookieConsent', 'github_projects_cache', 'github_projects_cache_time']);
        for (const [name, key] of Object.entries(STORAGE_KEYS)) {
            if (ignoredKeys.has(key)) {
                expect(isBackupKey(key), `Transient key ${name} should not be backed up`).toBe(false);
            } else {
                expect(isBackupKey(key), `Persistent key ${name} (${key}) must be accepted by isBackupKey`).toBe(true);
            }
        }
    });
});

describe('QR sync payload encoding and decoding', () => {
    it('serializes and deserializes backup payloads round-trip', () => {
        const backup = {
            app: BACKUP_APP_ID,
            version: BACKUP_VERSION,
            exportedAt: '2026-10-17T12:00:00.000Z',
            data: {
                theme: 'dark',
                quiz_best_score: '9',
                fiae_daily_question_state: JSON.stringify({ streak: 5 }),
            },
        };
        const payload = serializeBackupToPayload(backup);
        expect(typeof payload).toBe('string');
        const restored = deserializeBackupFromPayload(payload);
        expect(restored.entries).toEqual([
            ['theme', 'dark'],
            ['quiz_best_score', '9'],
            ['fiae_daily_question_state', JSON.stringify({ streak: 5 })],
        ]);
    });

    it('builds the sync link with the payload in the hash', () => {
        const backup = {
            app: BACKUP_APP_ID,
            version: BACKUP_VERSION,
            data: { theme: 'light' },
        };
        const url = getSyncUrl(backup, 'https://www.max-schenk.tech/pages/dashboard.html');
        expect(url.startsWith('https://www.max-schenk.tech/pages/dashboard.html#sync=')).toBe(true);
        expect(url).not.toContain('qrserver');
    });
});

describe('storage keys vs. backup allowlist', () => {
    // Keys that are deliberately not part of a backup. A new key has to land either in the
    // allowlist of progress-backup.js or here, with a reason, so it cannot be forgotten.
    const NOT_BACKED_UP = {
        cookieConsent: 'consent is a per-device decision',
        has_visited: 'one-off first-visit flag',
        pwa_dismissed: 'one-off install prompt flag',
        audio_effects_enabled: 'device-specific audio setting',
        game_audio_muted: 'device-specific audio setting',
        recruiter_name: 'personal data, stays on the device',
        recruiter_company: 'personal data, stays on the device',
    };

    function collectSourceFiles(dir) {
        return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
            const full = `${dir}/${entry.name}`;
            if (entry.isDirectory()) return collectSourceFiles(full);
            return /\.js$/.test(entry.name) && !/\.(test|spec)\.js$/.test(entry.name) ? [full] : [];
        });
    }

    it('lists every AppStorage key as backed up or explicitly excluded', () => {
        const usedKeys = new Set();
        const pattern = /AppStorage\.[a-zA-Z]+\(\s*['"]([a-zA-Z_0-9.-]+)['"]/g;
        for (const file of collectSourceFiles('assets/js')) {
            for (const match of fs.readFileSync(file, 'utf8').matchAll(pattern)) usedKeys.add(match[1]);
        }
        expect(usedKeys.size).toBeGreaterThan(10);

        const unclassified = [...usedKeys].filter((key) => !isBackupKey(key) && !(key in NOT_BACKED_UP));
        expect(unclassified).toEqual([]);
    });

    it('does not exclude a key that is also in the allowlist', () => {
        for (const key of Object.keys(NOT_BACKED_UP)) expect(isBackupKey(key), key).toBe(false);
    });
});
