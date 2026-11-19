import { test, expect } from '@playwright/test';

// Tageslimit für neue Karten der IHK-Kartei und Sitzung im Tab "Heute fällig".
test.describe('Lernkarten: Tageslimit und Sitzung', () => {
    test.beforeEach(async ({ page }) => {
        await page.addInitScript(() => {
            if (localStorage.getItem('spec_seeded')) return;
            localStorage.setItem('spec_seeded', '1');
            localStorage.setItem('flashcards_extended_enabled', 'true');
            localStorage.setItem('flashcards_new_per_day', '3');
        });
    });

    test('führt nur so viele neue Kartei-Karten ein, wie das Limit erlaubt', async ({ page }) => {
        await page.goto('/pages/flashcards.html');
        await expect(page.locator('#extended-deck-status')).toContainText(/\d+ Karten aktiv/);
        await expect(page.locator('#new-per-day')).toHaveValue('3');

        const coreDue = await page.evaluate(() => {
            const stored = JSON.parse(localStorage.getItem('flashcards_new_today') || '{}');
            return stored.ids.length;
        });
        expect(coreDue).toBe(3);

        // Das Limit anheben führt weitere Karten ein, am selben Tag bleiben die ersten erhalten.
        const firstIds = await page.evaluate(() => JSON.parse(localStorage.getItem('flashcards_new_today')).ids);
        await page.locator('#new-per-day').fill('5');
        await page.locator('#new-per-day').dispatchEvent('change');
        const ids = await page.evaluate(() => JSON.parse(localStorage.getItem('flashcards_new_today')).ids);
        expect(ids).toHaveLength(5);
        expect(ids.slice(0, 3)).toEqual(firstIds);
        expect(await page.evaluate(() => localStorage.getItem('flashcards_new_per_day'))).toBe('5');
    });

    test('zeigt Fortschritt und Abschlussbild einer Sitzung', async ({ page }) => {
        // Nur die drei neuen Karten sind fällig: Kernkarten bekommen ein Datum in der Zukunft.
        await page.goto('/pages/flashcards.html');
        await expect(page.locator('#extended-deck-status')).toContainText(/\d+ Karten aktiv/);
        await page.evaluate(() => {
            const future = Date.now() + 5 * 86400000;
            const dates = {};
            for (let id = 1; id <= 200; id++) dates[id] = future;
            localStorage.setItem('flashcards_due_dates', JSON.stringify(dates));
        });
        await page.reload();
        await expect(page.locator('#extended-deck-status')).toContainText(/\d+ Karten aktiv/);

        await page.locator('[data-cat="due"]').click();
        await expect(page.locator('#session-box')).toBeVisible();
        await expect(page.locator('#session-text')).toContainText('0 richtig');

        for (let i = 0; i < 3; i++) {
            await page.locator('#flashcard').click();
            await page.locator('#btn-correct').click();
            await expect(page.locator('#session-text')).toContainText(`${i + 1} richtig`);
        }
        await expect(page.locator('#session-summary')).toBeVisible();
        await expect(page.locator('#session-summary')).toContainText('3 richtig, 0 falsch');
        await expect(page.locator('#session-summary')).toContainText('Nächste Fälligkeit');
        await expect(page.locator('#session-box [role="progressbar"]')).toHaveAttribute('aria-valuenow', '100');

        // Außerhalb von "Heute fällig" ist die Sitzungsanzeige weg.
        await page.locator('[data-cat="all"]').click();
        await expect(page.locator('#session-box')).toBeHidden();
    });
});
