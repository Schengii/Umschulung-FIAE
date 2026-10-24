import { test, expect } from '@playwright/test';
import { settle } from '../../../scripts/e2e-helpers.js';

// The command palette also searches the headings of the content pages (assets/data/search-index.json).
test.describe('Command Palette: Seiteninhalte', () => {
    test('sollte eine Überschrift einer Lernseite finden und zum Abschnitt springen', async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem('cookieConsent', 'accepted'));
        await page.goto('/pages/home.html');
        await settle(page);

        await page.keyboard.press('Control+KeyK');
        await expect(page.locator('#command-palette-overlay')).toHaveClass(/open/);
        await page.locator('#command-palette-input').fill('Leitner');

        const hit = page.locator('.command-palette-item', { hasText: 'Leitner' }).first();
        await expect(hit).toBeVisible({ timeout: 10000 });
        await expect(hit.locator('.item-category')).toContainText('Lernkarten');

        await hit.click();
        await expect(page).toHaveURL(/pages\/flashcards\.html#leitner-stats-title$/);
    });
});
