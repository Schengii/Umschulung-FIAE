import { test, expect } from '@playwright/test';
import { settle } from '../../../scripts/test-support/e2e-helpers.js';

// Beispiel-Lernstand auf dem Dashboard (modules/demo-progress.js).
const backupReady = (page) => expect(page.locator('#progress-backup[data-demo-ready]')).toBeAttached();

test.describe('Dashboard: Beispiel-Lernstand', () => {
    test('sollte den Demo-Stand laden, kennzeichnen und den echten Stand zurückholen', async ({ page }) => {
        await page.goto('/pages/dashboard.html');
        await page.evaluate(() => {
            localStorage.setItem('username', 'Maxi');
            localStorage.setItem('theme', 'light');
            localStorage.setItem('quiz_best_score', '4');
        });
        await page.reload();
        await settle(page);
        await backupReady(page);

        await expect(page.locator('#demo-banner')).toBeHidden();
        await page.locator('#demo-load-btn').click();
        await page.locator('dialog.app-dialog').getByRole('button').last().click();

        // Nach dem Neuladen: Banner, Verlaufsdiagramm und gesperrte Sicherungs-Schaltflächen.
        await expect(page.locator('#demo-banner')).toBeVisible();
        await settle(page);
        await backupReady(page);
        await expect(page.locator('#exam-history-card svg, #exam-history svg').first()).toBeVisible();
        await expect(page.locator('#backup-export-btn')).toBeDisabled();
        await expect(page.locator('#backup-import-btn')).toBeDisabled();
        await expect(page.locator('#backup-qr-btn')).toBeDisabled();
        await expect(page.locator('#backup-reminder')).toBeHidden();
        expect(await page.evaluate(() => localStorage.getItem('exam_history'))).not.toBeNull();

        await page.locator('#demo-reset-btn').click();
        await page.locator('dialog.app-dialog').getByRole('button').last().click();

        await expect(page.locator('#demo-banner')).toBeHidden();
        await settle(page);
        await backupReady(page);
        await expect(page.locator('#backup-export-btn')).toBeEnabled();
        const state = await page.evaluate(() => ({
            history: localStorage.getItem('exam_history'),
            quiz: localStorage.getItem('quiz_best_score'),
            username: localStorage.getItem('username'),
            theme: localStorage.getItem('theme'),
            active: localStorage.getItem('demo_mode_active'),
            snapshot: localStorage.getItem('demo_mode_snapshot'),
        }));
        expect(state).toEqual({
            history: null,
            quiz: '4',
            username: 'Maxi',
            theme: 'light',
            active: null,
            snapshot: null,
        });
    });

    test('sollte unter „Letzte Projekte“ echte Titel und funktionierende Links zeigen', async ({ page }) => {
        await page.goto('/pages/dashboard.html');
        const items = page.locator('.left-col .card', { hasText: 'Letzte Projekte' }).locator('li');
        await expect(items).toHaveCount(3);
        await expect(items.first()).not.toContainText('undefined');
        const href = await items.first().locator('a').getAttribute('href');
        expect(href).not.toContain('pages/pages/');
        expect(href).not.toContain('undefined');
    });
});
