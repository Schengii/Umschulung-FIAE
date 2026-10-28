import { test, expect } from '@playwright/test';

// The optional IHK-Kartei (assets/data/flashcards-extended.json) loads only when switched on.
test.describe('Lernkarten: erweiterte IHK-Kartei', () => {
    test('lädt erst beim Einschalten und blendet den Reiter ein', async ({ page }) => {
        /** @type {string[]} */
        const deckRequests = [];
        page.on('request', (request) => {
            if (request.url().includes('flashcards-extended.json')) deckRequests.push(request.url());
        });

        await page.goto('/pages/flashcards.html');
        const toggle = page.locator('#extended-deck-toggle');
        await expect(toggle).toHaveAttribute('data-ready', 'true');
        await expect(page.locator('[data-cat="extended"]')).toBeHidden();
        expect(deckRequests).toHaveLength(0);

        await toggle.check();
        await expect(page.locator('#extended-deck-status')).toContainText(/\d+ Karten aktiv/);
        expect(deckRequests).toHaveLength(1);

        const tab = page.locator('[data-cat="extended"]');
        await expect(tab).toBeVisible();
        await tab.click();
        await expect(page.locator('#card-hint .flashcard-source-badge')).toHaveText('IHK-Kartei');
        await expect(page.locator('#deck-status')).toHaveText(/^1 \/ \d{3,}$/);

        // Unseen imported cards do not flood "due today".
        const dueBefore = Number(await page.locator('#due-count').textContent());
        expect(dueBefore).toBeLessThan(100);

        // The switch is remembered across reloads.
        await page.reload();
        await expect(page.locator('#extended-deck-toggle')).toBeChecked();
        await expect(page.locator('#extended-deck-status')).toContainText(/\d+ Karten aktiv/);
    });

    test('eine beantwortete Karte der Kartei zählt in der Leitner-Statistik', async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem('flashcards_extended_enabled', 'true'));
        await page.goto('/pages/flashcards.html');
        await expect(page.locator('#extended-deck-status')).toContainText(/\d+ Karten aktiv/);

        await page.locator('[data-cat="extended"]').click();
        const boxTwoBefore = Number(await page.locator('#box2-count').textContent());
        await page.locator('#flashcard').click();
        await page.locator('#btn-correct').click();
        await expect(page.locator('#box2-count')).toHaveText(String(boxTwoBefore + 1));

        const levels = await page.evaluate(() => JSON.parse(localStorage.getItem('flashcards_box_levels') || '{}'));
        expect(Object.keys(levels).some((id) => id.startsWith('vault_'))).toBe(true);
    });

    test('englische Oberfläche zeigt den deutschen Kartentext mit Hinweis', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('flashcards_extended_enabled', 'true');
            localStorage.setItem('lang', 'en');
        });
        await page.goto('/pages/flashcards.html');
        await expect(page.locator('#extended-deck-status')).toContainText(/cards active \(German only\)/);
        await page.locator('[data-cat="extended"]').click();
        await expect(page.locator('#card-hint .flashcard-source-badge')).toHaveText('IHK card index · German');
        await expect(page.locator('#card-question')).not.toBeEmpty();
        await expect(page.locator('#card-question')).toBeVisible();
    });
});
