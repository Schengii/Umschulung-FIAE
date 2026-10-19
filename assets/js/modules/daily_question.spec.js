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

// dashboard.js delegates its calculations to modules/dashboard-logic.js (D01); the rendered result
// must stay the same.
test.describe('Dashboard: Aktivitätsraster und Lernempfehlungen', () => {
    test('sollte 371 Tage, Summen und Empfehlungen aus den gespeicherten Schwächen rendern', async ({ page }) => {
        await page.goto('/pages/dashboard.html');
        await page.evaluate(() => {
            localStorage.setItem('github_live_commits_today', '5');
            localStorage.setItem('learning_recommendations_quiz_weak_categories', '["wiso"]');
            localStorage.setItem('learning_recommendations_flashcards_wrong_counts', '{"database": 4}');
        });
        await page.reload();
        await settle(page);

        await expect(page.locator('#commit-grid .commit-cell')).toHaveCount(371);
        await expect(page.locator('#commit-grid .commit-cell').last()).toHaveClass(/level-3/);
        await expect(page.locator('#commit-grid-streak')).toContainText('Beste Strähne');

        const links = page.locator('.card[aria-labelledby="recommendations-title"] a');
        await expect(links).toHaveCount(2);
        await expect(links.first()).toHaveAttribute('href', 'flashcards.html');
        await expect(links.first()).toHaveText('Datenbanken');
    });
});
