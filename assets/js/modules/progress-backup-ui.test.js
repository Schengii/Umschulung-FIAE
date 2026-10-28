// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resetDocument } from '../../../scripts/test-support/dom-helpers.js';
import {
    BACKUP_APP_ID,
    BACKUP_VERSION,
    createBackup,
    initProgressBackup,
    serializeBackupToPayload,
} from './progress-backup.js';

// The dashboard card of the backup feature: export, file import with confirmation, QR sync
// and the #sync= link. The pure backup logic is covered by progress-backup.test.js.

const PAGE = `
    <section id="progress-backup">
        <button id="backup-export-btn" type="button">Export</button>
        <button id="backup-import-btn" type="button">Import</button>
        <button id="backup-qr-btn" type="button">QR</button>
        <div id="backup-qr-display" hidden><img id="backup-qr-img" alt=""><button id="backup-qr-close" type="button">x</button></div>
        <input id="backup-file-input" type="file">
        <p id="backup-status"></p>
        <p id="backup-reminder" hidden></p>
        <div id="backup-confirm" hidden>
            <p id="backup-confirm-text"></p>
            <button id="backup-confirm-btn" type="button">Ja</button>
            <button id="backup-cancel-btn" type="button">Nein</button>
        </div>
    </section>`;

const $ = (selector) => document.querySelector(selector);
const status = () => $('#backup-status').textContent;
const confirmBox = () => $('#backup-confirm');

const backupText = (data, overrides = {}) =>
    JSON.stringify({
        app: BACKUP_APP_ID,
        version: BACKUP_VERSION,
        exportedAt: '2026-03-10T12:00:00.000Z',
        data,
        ...overrides,
    });

/** Puts a file into the input and fires the change event the browser would send. */
async function chooseFile(content, name = 'backup.json') {
    const file = new File([content], name, { type: 'application/json' });
    const input = $('#backup-file-input');
    Object.defineProperty(input, 'files', { value: [file], configurable: true });
    input.dispatchEvent(new Event('change'));
    // file.text() and the handler's awaits
    for (let i = 0; i < 10; i++) await new Promise((resolve) => setTimeout(resolve, 0));
}

beforeEach(() => {
    window.localStorage.clear();
    resetDocument(PAGE);
    window.location.hash = '';
});
afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    document.documentElement.removeAttribute('lang');
    window.location.hash = '';
});

describe('progress backup card: setup', () => {
    it('does nothing on pages without the card', () => {
        resetDocument('');
        expect(() => initProgressBackup()).not.toThrow();
    });

    it('marks itself ready for the E2E specs', () => {
        initProgressBackup();
        expect($('#progress-backup').getAttribute('data-ready')).toBe('true');
    });
});

describe('progress backup card: export', () => {
    it('says so when there is nothing to back up', () => {
        initProgressBackup();
        $('#backup-export-btn').click();
        expect(status()).toBe('Es gibt noch nichts zu sichern.');
    });

    it('downloads the entries of this site and reports the count', () => {
        window.localStorage.setItem('quiz_best_score', '80');
        window.localStorage.setItem('username', 'Erika');
        window.localStorage.setItem('someone_elses_key', 'ignored');
        const blobs = [];
        URL.createObjectURL = vi.fn((blob) => {
            blobs.push(blob);
            return 'blob:backup';
        });
        URL.revokeObjectURL = vi.fn();
        vi.useFakeTimers();
        const clicked = [];
        const realCreate = document.createElement.bind(document);
        vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            const element = realCreate(tag);
            if (tag === 'a') element.click = () => clicked.push(element.download);
            return element;
        });

        initProgressBackup();
        $('#backup-export-btn').click();

        expect(status()).toBe('2 Einträge exportiert.');
        expect(clicked[0]).toMatch(/^fiae-lernfortschritt-\d{4}-\d{2}-\d{2}\.json$/);
        vi.advanceTimersByTime(1000);
        expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:backup');
        return blobs[0].text().then((text) => {
            const backup = JSON.parse(text);
            expect(Object.keys(backup.data).sort()).toEqual(['quiz_best_score', 'username']);
        });
    });

    it('reports blocked storage instead of throwing', () => {
        const original = Object.getOwnPropertyDescriptor(window, 'localStorage');
        Object.defineProperty(window, 'localStorage', {
            configurable: true,
            get() {
                throw new Error('SecurityError');
            },
        });
        try {
            initProgressBackup();
            $('#backup-export-btn').click();
            expect(status()).toContain('Der Browser erlaubt keinen Zugriff');
            expect($('#backup-status').classList.contains('backup-status-error')).toBe(true);
        } finally {
            if (original) Object.defineProperty(window, 'localStorage', original);
            else delete window.localStorage;
        }
    });

    it('reports in English when the page is English', () => {
        document.documentElement.setAttribute('lang', 'en');
        initProgressBackup();
        $('#backup-export-btn').click();
        expect(status()).toBe('There is nothing to back up yet.');
    });
});

describe('progress backup card: import', () => {
    it('opens the file picker from the import button', () => {
        initProgressBackup();
        const picker = vi.fn();
        $('#backup-file-input').click = picker;
        $('#backup-import-btn').click();
        expect(picker).toHaveBeenCalledTimes(1);
    });

    it('asks for confirmation with the number of entries and the date', async () => {
        initProgressBackup();
        await chooseFile(backupText({ quiz_best_score: '80', unknown_key: 'x' }));

        expect(confirmBox().hidden).toBe(false);
        expect($('#backup-confirm-text').textContent).toContain('1 Einträgen');
        expect($('#backup-confirm-text').textContent).toContain('1 unbekannte Einträge werden ignoriert');
        expect(window.localStorage.getItem('quiz_best_score')).toBeNull();
    });

    it('replaces the stored progress after the confirmation and reloads the page', async () => {
        window.localStorage.setItem('quiz_best_score', '10');
        window.localStorage.setItem('snake_highscore', '99');
        window.localStorage.setItem('someone_elses_key', 'keep');
        initProgressBackup();
        await chooseFile(backupText({ quiz_best_score: '80' }));

        vi.useFakeTimers();
        $('#backup-confirm-btn').click();

        expect(window.localStorage.getItem('quiz_best_score')).toBe('80');
        expect(window.localStorage.getItem('snake_highscore')).toBeNull();
        expect(window.localStorage.getItem('someone_elses_key')).toBe('keep');
        expect(confirmBox().hidden).toBe(true);
        expect(status()).toContain('Import abgeschlossen');
    });

    it('can be cancelled without touching the storage', async () => {
        window.localStorage.setItem('quiz_best_score', '10');
        initProgressBackup();
        await chooseFile(backupText({ quiz_best_score: '80' }));
        $('#backup-cancel-btn').click();

        expect(confirmBox().hidden).toBe(true);
        expect(status()).toBe('Import abgebrochen.');
        expect(window.localStorage.getItem('quiz_best_score')).toBe('10');

        // confirming after the cancel has nothing left to apply
        $('#backup-confirm-btn').click();
        expect(window.localStorage.getItem('quiz_best_score')).toBe('10');
    });

    it.each([
        ['kein JSON', 'das ist kein json', 'kein gültiges JSON'],
        ['fremde Datei', JSON.stringify({ app: 'other', version: 1, data: {} }), 'keine Sicherung dieser Seite'],
        ['neuere Version', backupText({ quiz_best_score: '1' }, { version: 99 }), 'neueren Version'],
        ['ohne verwertbare Daten', backupText({ unknown_key: 'x' }), 'keine verwertbaren Daten'],
    ])('rejects a file with %s', async (_label, content, message) => {
        initProgressBackup();
        await chooseFile(content);
        expect(status()).toContain(message);
        expect($('#backup-status').classList.contains('backup-status-error')).toBe(true);
        expect(confirmBox().hidden).toBe(true);
    });

    it('rejects a file that is too large without reading it', async () => {
        initProgressBackup();
        const file = new File(['{}'], 'big.json');
        Object.defineProperty(file, 'size', { value: 3 * 1024 * 1024 });
        Object.defineProperty($('#backup-file-input'), 'files', { value: [file], configurable: true });
        $('#backup-file-input').dispatchEvent(new Event('change'));
        for (let i = 0; i < 5; i++) await new Promise((resolve) => setTimeout(resolve, 0));

        expect(status()).toContain('zu groß');
    });

    it('does nothing when the file dialog is dismissed', async () => {
        initProgressBackup();
        Object.defineProperty($('#backup-file-input'), 'files', { value: [], configurable: true });
        $('#backup-file-input').dispatchEvent(new Event('change'));
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(confirmBox().hidden).toBe(true);
        expect(status()).toBe('');
    });
});

describe('progress backup card: QR sync', () => {
    it('says so when there is nothing to transfer', async () => {
        initProgressBackup();
        $('#backup-qr-btn').click();
        await new Promise((resolve) => setTimeout(resolve, 0));
        expect(status()).toBe('Es gibt noch nichts zu sichern.');
        expect($('#backup-qr-display').hidden).toBe(true);
    });

    it('renders a local QR code image and can hide it again', async () => {
        window.localStorage.setItem('quiz_best_score', '80');
        initProgressBackup();
        $('#backup-qr-btn').click();
        for (let i = 0; i < 20 && $('#backup-qr-display').hidden; i++) await new Promise((r) => setTimeout(r, 5));

        expect($('#backup-qr-display').hidden).toBe(false);
        expect($('#backup-qr-img').getAttribute('src')).toMatch(/^data:image\/svg\+xml/);

        $('#backup-qr-close').click();
        expect($('#backup-qr-display').hidden).toBe(true);
    });

    it('points to the export when the progress is too large for one QR code', async () => {
        window.localStorage.setItem('flashcards_custom', JSON.stringify(['x'.repeat(5000)]));
        initProgressBackup();
        $('#backup-qr-btn').click();
        for (let i = 0; i < 20 && !status(); i++) await new Promise((r) => setTimeout(r, 5));

        expect(status()).toContain('zu groß für einen QR-Code');
        expect($('#backup-qr-display').hidden).toBe(true);
    });
});

describe('progress backup card: #sync= link', () => {
    it('offers to import the data of a scanned QR code and cleans the address bar', () => {
        const backup = createBackup({ length: 1, key: () => 'quiz_best_score', getItem: () => '70' });
        window.location.hash = `#sync=${serializeBackupToPayload(backup)}`;
        initProgressBackup();

        expect(confirmBox().hidden).toBe(false);
        expect($('#backup-confirm-text').textContent).toContain('QR-Sync empfangen');
        expect(window.location.hash).toBe('');
    });

    it('reports an invalid sync code', () => {
        window.location.hash = '#sync=%%%nicht-base64';
        initProgressBackup();
        expect(status()).toBe('Ungültiger QR-Sync-Code empfangen.');
        expect(confirmBox().hidden).toBe(true);
    });
});

describe('progress backup card: reminder', () => {
    const reminder = () => $('#backup-reminder');
    const daysAgo = (days) => new Date(Date.now() - days * 86_400_000).toISOString();

    it('stays hidden while there is nothing to back up', () => {
        initProgressBackup();
        expect(reminder().hidden).toBe(true);
    });

    it('asks for a first backup when data exists but no export was made', () => {
        window.localStorage.setItem('quiz_best_score', '80');
        initProgressBackup();
        expect(reminder().hidden).toBe(false);
        expect(reminder().textContent).toContain('Noch keine Sicherung');
        expect(reminder().classList.contains('backup-reminder-due')).toBe(true);
    });

    it('names the age of a recent backup without nagging', () => {
        window.localStorage.setItem('quiz_best_score', '80');
        window.localStorage.setItem('last_backup_at', daysAgo(2));
        initProgressBackup();
        expect(reminder().textContent).toBe('Letzte Sicherung: vor 2 Tagen.');
        expect(reminder().classList.contains('backup-reminder-due')).toBe(false);
    });

    it('speaks of today and yesterday', () => {
        window.localStorage.setItem('quiz_best_score', '80');
        window.localStorage.setItem('last_backup_at', daysAgo(0));
        initProgressBackup();
        expect(reminder().textContent).toBe('Letzte Sicherung: heute.');
        window.localStorage.setItem('last_backup_at', daysAgo(1));
        window.dispatchEvent(new Event('fiae:lang-change'));
        expect(reminder().textContent).toBe('Letzte Sicherung: gestern.');
    });

    it('nudges after two weeks', () => {
        window.localStorage.setItem('quiz_best_score', '80');
        window.localStorage.setItem('last_backup_at', daysAgo(20));
        initProgressBackup();
        expect(reminder().textContent).toBe('Letzte Sicherung vor 20 Tagen. Zeit für eine neue.');
        expect(reminder().classList.contains('backup-reminder-due')).toBe(true);
    });

    it('follows the page language', () => {
        window.localStorage.setItem('quiz_best_score', '80');
        window.localStorage.setItem('last_backup_at', daysAgo(20));
        initProgressBackup();
        document.documentElement.setAttribute('lang', 'en');
        window.dispatchEvent(new Event('fiae:lang-change'));
        expect(reminder().textContent).toBe('Last backup 20 days ago. Time for a new one.');
    });

    it('records an export and shows it right away', () => {
        window.localStorage.setItem('quiz_best_score', '80');
        URL.createObjectURL = vi.fn(() => 'blob:backup');
        URL.revokeObjectURL = vi.fn();
        const realCreate = document.createElement.bind(document);
        vi.spyOn(document, 'createElement').mockImplementation((tag) => {
            const element = realCreate(tag);
            if (tag === 'a') element.click = () => {};
            return element;
        });
        initProgressBackup();
        expect(reminder().textContent).toContain('Noch keine Sicherung');
        $('#backup-export-btn').click();
        expect(window.localStorage.getItem('last_backup_at')).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        expect(reminder().textContent).toBe('Letzte Sicherung: heute.');
        expect(reminder().classList.contains('backup-reminder-due')).toBe(false);
    });

    it('does not take the reminder timestamp into the backup file', () => {
        window.localStorage.setItem('quiz_best_score', '80');
        window.localStorage.setItem('last_backup_at', daysAgo(1));
        expect(Object.keys(createBackup(window.localStorage).data)).toEqual(['quiz_best_score']);
    });
});
