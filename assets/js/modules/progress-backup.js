/**
 * Progress backup — export and import of everything this site stores in the browser.
 *
 * The site has no backend: learning progress, highscores, achievements and settings live in
 * localStorage and are gone with a new browser, a new device or cleared site data. The
 * dashboard card lets a visitor download them as a JSON file and load that file again.
 *
 * The first half is pure logic (no DOM, storage passed in) and covered by unit tests.
 */

export const BACKUP_APP_ID = 'umschulung-fiae';
export const BACKUP_VERSION = 1;
/** Far above any real backup (a few KB); rejects files that are clearly something else. */
export const MAX_BACKUP_BYTES = 2 * 1024 * 1024;

/**
 * Keys that belong to this site. An allowlist on purpose: the demo projects under Projekte/
 * run on the same origin and share localStorage, so "all keys" would export and overwrite
 * their data too. Caches and one-off UI flags are left out.
 */
const EXACT_KEYS = new Set([
    // learning progress
    'flashcards_box_levels',
    'flashcards_due_dates',
    'flashcards_starred',
    'flashcards_custom',
    'known_flashcards',
    'flashcard_total_count',
    'flashcard_correct_count',
    'quiz_best_score',
    'exam_results',
    'interview_best_score',
    'learning_recommendations_quiz_weak_categories',
    'learning_recommendations_flashcards_wrong_counts',
    'github_live_commits_today',
    // games and achievements
    'snake_highscore',
    'snake_highscore_list',
    'memoryBestMoves',
    'memoryBestTime',
    'memory_highscore_list',
    'achievements',
    'visited_pages',
    // personal content and settings
    'portfolio_custom_projects',
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
]);

const KEY_PREFIXES = ['fiae_progress_phase_', 'news_likes_'];

/** Keys whose value is JSON. A value that does not parse would break the page reading it. */
const JSON_KEYS = new Set([
    'flashcards_box_levels',
    'flashcards_due_dates',
    'flashcards_starred',
    'flashcards_custom',
    'known_flashcards',
    'exam_results',
    'learning_recommendations_quiz_weak_categories',
    'learning_recommendations_flashcards_wrong_counts',
    'snake_highscore_list',
    'memory_highscore_list',
    'achievements',
    'visited_pages',
    'portfolio_custom_projects',
]);

/** @param {string} key */
export function isBackupKey(key) {
    return EXACT_KEYS.has(key) || KEY_PREFIXES.some((prefix) => key.startsWith(prefix));
}

function isValidValue(key, value) {
    if (typeof value !== 'string') return false;
    if (!JSON_KEYS.has(key)) return true;
    try {
        JSON.parse(value);
        return true;
    } catch (_e) {
        return false;
    }
}

/**
 * @param {Pick<Storage, 'length' | 'key' | 'getItem'>} storage
 * @param {Date} [now]
 */
export function createBackup(storage, now = new Date()) {
    /** @type {Record<string, string>} */
    const data = {};
    for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key !== null && isBackupKey(key)) data[key] = storage.getItem(key);
    }
    return { app: BACKUP_APP_ID, version: BACKUP_VERSION, exportedAt: now.toISOString(), data };
}

/** Thrown by parseBackup; `code` selects the message shown to the visitor. */
export class BackupError extends Error {
    /** @param {'too-large' | 'not-json' | 'wrong-file' | 'newer-version' | 'empty'} code */
    constructor(code) {
        super(`Invalid backup: ${code}`);
        this.name = 'BackupError';
        this.code = code;
    }
}

/**
 * Validates the text of a backup file. Unknown keys and damaged values are dropped, not
 * imported: the file comes from outside and its content ends up in localStorage.
 * @param {string} text
 * @returns {{ entries: [string, string][], skipped: number, exportedAt: string | null }}
 */
export function parseBackup(text) {
    if (text.length > MAX_BACKUP_BYTES) throw new BackupError('too-large');

    let parsed;
    try {
        parsed = JSON.parse(text);
    } catch (_e) {
        throw new BackupError('not-json');
    }
    const data = parsed && typeof parsed === 'object' ? parsed.data : null;
    if (!parsed || parsed.app !== BACKUP_APP_ID || !data || typeof data !== 'object' || Array.isArray(data)) {
        throw new BackupError('wrong-file');
    }
    if (typeof parsed.version !== 'number' || parsed.version > BACKUP_VERSION) {
        throw new BackupError('newer-version');
    }

    /** @type {[string, string][]} */
    const entries = [];
    let skipped = 0;
    for (const [key, value] of Object.entries(data)) {
        if (isBackupKey(key) && isValidValue(key, value)) entries.push([key, value]);
        else skipped++;
    }
    if (entries.length === 0) throw new BackupError('empty');

    const exportedAt =
        typeof parsed.exportedAt === 'string' && !isNaN(Date.parse(parsed.exportedAt)) ? parsed.exportedAt : null;
    return { entries, skipped, exportedAt };
}

/**
 * Replaces the site's stored data with the entries of a backup. Keys of other applications
 * on the same origin are not touched.
 * @param {Pick<Storage, 'length' | 'key' | 'removeItem' | 'setItem'>} storage
 * @param {[string, string][]} entries
 */
export function applyBackup(storage, entries) {
    const existing = [];
    for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key !== null && isBackupKey(key)) existing.push(key);
    }
    existing.forEach((key) => storage.removeItem(key));
    entries.forEach(([key, value]) => storage.setItem(key, value));
}

/** fiae-lernfortschritt-2026-03-10.json */
export function backupFileName(now = new Date()) {
    const pad = (value) => String(value).padStart(2, '0');
    return `fiae-lernfortschritt-${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.json`;
}

/* ------------------------------------------------------------------------------------ */
/* Dashboard card                                                                        */
/* ------------------------------------------------------------------------------------ */

const ERROR_MESSAGES = {
    'too-large': {
        de: 'Die Datei ist zu groß für eine Sicherung dieser Seite.',
        en: 'The file is too large to be a backup of this site.',
    },
    'not-json': { de: 'Die Datei enthält kein gültiges JSON.', en: 'The file does not contain valid JSON.' },
    'wrong-file': { de: 'Das ist keine Sicherung dieser Seite.', en: 'This is not a backup of this site.' },
    'newer-version': {
        de: 'Die Sicherung stammt aus einer neueren Version der Seite.',
        en: 'The backup was created by a newer version of this site.',
    },
    empty: { de: 'Die Sicherung enthält keine verwertbaren Daten.', en: 'The backup contains no usable data.' },
};

export function initProgressBackup() {
    const card = document.getElementById('progress-backup');
    if (!card) return;

    const exportButton = card.querySelector('#backup-export-btn');
    const importButton = card.querySelector('#backup-import-btn');
    const fileInput = /** @type {HTMLInputElement} */ (card.querySelector('#backup-file-input'));
    const status = card.querySelector('#backup-status');
    const confirmBox = /** @type {HTMLElement} */ (card.querySelector('#backup-confirm'));
    const confirmText = card.querySelector('#backup-confirm-text');
    const confirmButton = card.querySelector('#backup-confirm-btn');
    const cancelButton = card.querySelector('#backup-cancel-btn');
    if (!exportButton || !importButton || !fileInput || !status || !confirmBox || !confirmText) return;

    const lang = () => (document.documentElement.getAttribute('lang') === 'en' ? 'en' : 'de');
    const say = (de, en, isError = false) => {
        status.textContent = lang() === 'en' ? en : de;
        status.classList.toggle('backup-status-error', isError);
    };

    /** @type {[string, string][] | null} */
    let pending = null;

    exportButton.addEventListener('click', () => {
        let backup;
        try {
            backup = createBackup(window.localStorage);
        } catch (_e) {
            say(
                'Der Browser erlaubt keinen Zugriff auf die gespeicherten Daten.',
                'The browser does not allow access to the stored data.',
                true
            );
            return;
        }
        const count = Object.keys(backup.data).length;
        if (count === 0) {
            say('Es gibt noch nichts zu sichern.', 'There is nothing to back up yet.');
            return;
        }
        const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = backupFileName();
        document.body.appendChild(link);
        link.click();
        link.remove();
        // Give the download a moment to start before the URL goes away.
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        say(`${count} Einträge exportiert.`, `Exported ${count} entries.`);
    });

    importButton.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async () => {
        const file = fileInput.files && fileInput.files[0];
        // Allow choosing the same file again later.
        fileInput.value = '';
        pending = null;
        confirmBox.hidden = true;
        if (!file) return;

        try {
            if (file.size > MAX_BACKUP_BYTES) throw new BackupError('too-large');
            const backup = parseBackup(await file.text());
            pending = backup.entries;
            const date = backup.exportedAt
                ? new Date(backup.exportedAt).toLocaleDateString(lang() === 'en' ? 'en-GB' : 'de-DE')
                : '?';
            const skipped = backup.skipped;
            confirmText.textContent =
                lang() === 'en'
                    ? `Backup from ${date} with ${pending.length} entries${skipped ? ` (${skipped} unknown entries are ignored)` : ''}. Importing replaces the progress stored in this browser.`
                    : `Sicherung vom ${date} mit ${pending.length} Einträgen${skipped ? ` (${skipped} unbekannte Einträge werden ignoriert)` : ''}. Der Import ersetzt den in diesem Browser gespeicherten Fortschritt.`;
            status.textContent = '';
            confirmBox.hidden = false;
            /** @type {HTMLElement} */ (confirmButton)?.focus();
        } catch (error) {
            const message = ERROR_MESSAGES[error instanceof BackupError ? error.code : 'not-json'];
            say(message.de, message.en, true);
        }
    });

    cancelButton?.addEventListener('click', () => {
        pending = null;
        confirmBox.hidden = true;
        say('Import abgebrochen.', 'Import cancelled.');
    });

    confirmButton?.addEventListener('click', () => {
        if (!pending) return;
        try {
            applyBackup(window.localStorage, pending);
        } catch (_e) {
            say(
                'Der Import ist fehlgeschlagen (Speicher voll oder blockiert).',
                'The import failed (storage full or blocked).',
                true
            );
            return;
        }
        pending = null;
        confirmBox.hidden = true;
        say('Import abgeschlossen. Die Seite wird neu geladen …', 'Import complete. Reloading the page …');
        // Every widget on the page read its data at load time.
        setTimeout(() => window.location.reload(), 800);
    });
}
