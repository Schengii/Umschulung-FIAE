import { test, expect } from '@playwright/test';
import { settle } from '../../../scripts/e2e-helpers.js';

// The backup module is loaded lazily, so a click right after load can precede its listeners.
const backupReady = (page) => expect(page.locator('#progress-backup[data-ready]')).toBeAttached();

// Export/import of the locally stored progress on the dashboard.
test.describe('Dashboard: Fortschritt sichern', () => {
    test('sollte den Fortschritt exportieren und in einem leeren Browser wieder importieren', async ({ page }) => {
        // Records what the page hands to a download link (see the export step below).
        await page.addInitScript(() => {
            window.__exports = [];
            const blobs = new Map();
            const createObjectURL = URL.createObjectURL.bind(URL);
            URL.createObjectURL = (blob) => {
                const url = createObjectURL(blob);
                blobs.set(url, blob);
                return url;
            };
            document.addEventListener(
                'click',
                (e) => {
                    const link = e.target instanceof window.Element ? e.target.closest('a[download]') : null;
                    const blob = link instanceof window.HTMLAnchorElement ? blobs.get(link.href) : null;
                    if (blob) blob.text().then((text) => window.__exports.push({ fileName: link.download, text }));
                },
                true
            );
        });
        // Seed once, not on every load: after the import the page reloads and must show what
        // the import wrote, not a re-seeded state.
        await page.goto('/pages/dashboard.html');
        await page.evaluate(() => {
            localStorage.setItem('quiz_best_score', '4');
            localStorage.setItem('flashcards_box_levels', '{"1":3,"2":2}');
            localStorage.setItem('fiae_progress_phase_1_topic_0', 'true');
            localStorage.setItem('some_other_app', 'not ours');
        });
        await page.reload();
        await settle(page);
        await backupReady(page);

        // A late layout shift can make the click miss the button; repeat it until the export ran.
        await expect(async () => {
            await page.locator('#backup-export-btn').click({ timeout: 2000 });
            await expect(page.locator('#backup-status')).toContainText('exportiert', { timeout: 2000 });
        }).toPass({ timeout: 20000 });

        // Playwright-Firefox sometimes never reports the download of a blob link, although the
        // click handler ran. The file name and content are read from what the page handed to the
        // download instead; the browser's own download pipeline is not what is under test.
        await expect.poll(() => page.evaluate(() => window.__exports.length)).toBeGreaterThan(0);
        const { fileName, text } = await page.evaluate(() => window.__exports[0]);
        expect(fileName).toMatch(/^fiae-lernfortschritt-\d{4}-\d{2}-\d{2}\.json$/);

        const backup = JSON.parse(text);
        expect(backup.app).toBe('umschulung-fiae');
        expect(backup.data).toMatchObject({
            quiz_best_score: '4',
            flashcards_box_levels: '{"1":3,"2":2}',
            fiae_progress_phase_1_topic_0: 'true',
        });
        expect(backup.data.some_other_app).toBeUndefined();

        // A "new browser": the site data is gone, another app's key is still there.
        await page.evaluate(() => {
            localStorage.clear();
            localStorage.setItem('some_other_app', 'not ours');
            localStorage.setItem('quiz_best_score', '1');
        });
        await page.reload();
        await settle(page);
        await backupReady(page);

        await page.locator('#backup-file-input').setInputFiles({
            name: 'backup.json',
            mimeType: 'application/json',
            buffer: Buffer.from(JSON.stringify(backup)),
        });
        await expect(page.locator('#backup-confirm')).toBeVisible();
        await expect(page.locator('#backup-confirm-text')).toContainText('ersetzt');

        await Promise.all([page.waitForEvent('load'), page.locator('#backup-confirm-btn').click()]);

        const restored = await page.evaluate(() => ({
            quiz: localStorage.getItem('quiz_best_score'),
            boxes: localStorage.getItem('flashcards_box_levels'),
            roadmap: localStorage.getItem('fiae_progress_phase_1_topic_0'),
            other: localStorage.getItem('some_other_app'),
        }));
        expect(restored).toEqual({ quiz: '4', boxes: '{"1":3,"2":2}', roadmap: 'true', other: 'not ours' });
    });

    test('sollte eine fremde Datei ablehnen und nichts verändern', async ({ page }) => {
        await page.goto('/pages/dashboard.html');
        await page.evaluate(() => localStorage.setItem('quiz_best_score', '3'));
        await settle(page);
        await backupReady(page);

        await page.locator('#backup-file-input').setInputFiles({
            name: 'something.json',
            mimeType: 'application/json',
            buffer: Buffer.from(JSON.stringify({ hello: 'world' })),
        });

        await expect(page.locator('#backup-status')).toContainText('keine Sicherung dieser Seite');
        await expect(page.locator('#backup-confirm')).toBeHidden();
        expect(await page.evaluate(() => localStorage.getItem('quiz_best_score'))).toBe('3');
    });

    test('sollte den Import abbrechen können', async ({ page }) => {
        await page.goto('/pages/dashboard.html');
        await page.evaluate(() => localStorage.setItem('quiz_best_score', '3'));
        await settle(page);
        await backupReady(page);

        await page.locator('#backup-file-input').setInputFiles({
            name: 'backup.json',
            mimeType: 'application/json',
            buffer: Buffer.from(
                JSON.stringify({
                    app: 'umschulung-fiae',
                    version: 1,
                    exportedAt: '2026-03-10T12:00:00.000Z',
                    data: { quiz_best_score: '5' },
                })
            ),
        });
        await expect(page.locator('#backup-confirm')).toBeVisible();
        // Widgets above the card can still shift the layout after the actionability check, so a
        // click can miss; repeat the click until the box has closed.
        await expect(async () => {
            await page.locator('#backup-cancel-btn').click({ timeout: 2000 });
            await expect(page.locator('#backup-confirm')).toBeHidden({ timeout: 1000 });
        }).toPass({ timeout: 15000 });
        expect(await page.evaluate(() => localStorage.getItem('quiz_best_score'))).toBe('3');
    });
});
