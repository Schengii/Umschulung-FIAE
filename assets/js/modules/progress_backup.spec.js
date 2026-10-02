import fs from 'node:fs';
import { test, expect } from '@playwright/test';
import { settle } from '../../../scripts/e2e-helpers.js';

// Export/import of the locally stored progress on the dashboard.
test.describe('Dashboard: Fortschritt sichern', () => {
    test('sollte den Fortschritt exportieren und in einem leeren Browser wieder importieren', async ({ page }) => {
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

        const downloadPromise = page.waitForEvent('download');
        await page.locator('#backup-export-btn').click();
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toMatch(/^fiae-lernfortschritt-\d{4}-\d{2}-\d{2}\.json$/);
        await expect(page.locator('#backup-status')).toContainText('exportiert');

        const backup = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
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
        await page.locator('#backup-cancel-btn').click();

        await expect(page.locator('#backup-confirm')).toBeHidden();
        expect(await page.evaluate(() => localStorage.getItem('quiz_best_score'))).toBe('3');
    });
});
