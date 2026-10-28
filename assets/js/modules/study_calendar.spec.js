import { test, expect } from '@playwright/test';
import { settle } from '../../../scripts/test-support/e2e-helpers.js';

// The flashcards page exports the Leitner due dates as a calendar file, created in the browser.
test.describe('Lernplan als Kalenderdatei (flashcards.html)', () => {
    test('sollte die fälligen Tage als .ics-Datei herunterladen', async ({ page }) => {
        const day = 86_400_000;
        await page.addInitScript((tomorrow) => {
            localStorage.setItem('cookieConsent', 'accepted');
            localStorage.setItem(
                'flashcards_due_dates',
                JSON.stringify({ a: tomorrow, b: tomorrow, c: tomorrow + 2 * 86_400_000 })
            );
        }, Date.now() + day);
        await page.goto('/pages/flashcards.html');
        await settle(page);

        const button = page.locator('#study-calendar-btn');
        await expect(button).toHaveAttribute('data-ready', 'true');

        const downloadPromise = page.waitForEvent('download');
        await button.focus();
        await page.keyboard.press('Enter');
        const download = await downloadPromise;
        expect(download.suggestedFilename()).toBe('lernplan-karteikarten.ics');

        const path = await download.path();
        const content = (await import('node:fs')).readFileSync(path, 'utf8');
        expect(content).toContain('BEGIN:VCALENDAR');
        expect(content.match(/BEGIN:VEVENT/g)).toHaveLength(2);
        expect(content).toContain('SUMMARY:📚 2 Lernkarten fällig');
    });

    test('sollte ohne Fälligkeiten nichts herunterladen und einen Hinweis zeigen', async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem('cookieConsent', 'accepted'));
        await page.goto('/pages/flashcards.html');
        await settle(page);
        await expect(page.locator('#study-calendar-btn')).toHaveAttribute('data-ready', 'true');

        let downloaded = false;
        page.on('download', () => (downloaded = true));
        await page.locator('#study-calendar-btn').focus();
        await page.keyboard.press('Enter');
        await expect(page.getByText('Noch keine Fälligkeiten geplant')).toBeVisible();
        expect(downloaded).toBe(false);
    });
});
