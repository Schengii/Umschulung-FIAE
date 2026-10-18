import { test, expect } from '@playwright/test';
import { settle } from '../../../scripts/e2e-helpers.js';

// The daily question reads and writes through the AppStorage wrapper (C04): answering must still
// persist in the existing storage key, and the answer must survive a reload.
test.describe('Dashboard: Frage des Tages', () => {
    test('sollte die Antwort im bekannten Schlüssel speichern und nach Reload gesperrt anzeigen', async ({ page }) => {
        await page.goto('/pages/dashboard.html');
        await settle(page);

        const options = page.locator('#daily-question-card .daily-opt-btn');
        await expect(options.first()).toBeEnabled();
        await options.first().click();

        const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('fiae_daily_question_state')));
        expect(stored.streak).toBe(1);
        expect(Object.keys(stored.answered)).toHaveLength(1);

        await page.reload();
        await settle(page);
        await expect(page.locator('#daily-question-card .daily-opt-btn').first()).toBeDisabled();
    });
});
