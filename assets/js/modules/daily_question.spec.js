import { test, expect } from '@playwright/test';
import { settle } from '../../../scripts/test-support/e2e-helpers.js';

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
    // Nach dem Reload beantwortet der Service Worker site-stats.json selbst; page.route sieht diese
    // Anfrage in Firefox und WebKit dann nicht mehr und das Raster zeigt die echten Daten.
    test.use({ serviceWorkers: 'block' });

    test('sollte 371 Tage, Summen und Empfehlungen aus den gespeicherten Schwächen rendern', async ({ page }) => {
        // Raster aus festen Messwerten: heute 5 Commits (Stufe 3), gestern 1
        const key = (offset) => {
            const d = new Date();
            d.setDate(d.getDate() - offset);
            return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        };
        const stats = {
            generatedAt: key(0),
            commits: { total: 6, byDay: { [key(0)]: 5, [key(1)]: 1 } },
            pages: 28,
            adrs: 15,
            tests: null,
            coverage: null,
        };
        await page.route('**/assets/data/site-stats.json', (route) => route.fulfill({ json: stats }));
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
        await expect(page.locator('#commit-grid-total')).toContainText('6 Commits');
        await expect(page.locator('#commit-grid-live')).toContainText('5');
        await expect(page.locator('#site-stats-list')).toContainText('Seiten');

        const links = page.locator('.card[aria-labelledby="recommendations-title"] a');
        await expect(links).toHaveCount(2);
        await expect(links.first()).toHaveAttribute('href', 'flashcards.html');
        await expect(links.first()).toHaveText('Datenbanken');
    });
});
