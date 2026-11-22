import { test, expect } from '@playwright/test';

// The page scripts of these pages became ES modules with their rules in modules/*-logic.js.
// These specs play each page once, with the stored data the old scripts rendered unescaped.
test.describe('Seiten-Module: Spiele', () => {
    /** @param {import('@playwright/test').Page} page */
    const collectErrors = (page) => {
        /** @type {string[]} */
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        return errors;
    };

    test('Snake: startet, reagiert auf Tasten und zeigt gespeicherte Highscores als Text', async ({ page }) => {
        const errors = collectErrors(page);
        await page.addInitScript(() => {
            localStorage.setItem(
                'snake_highscore_list',
                JSON.stringify([{ score: 40, date: '<img src=x id="pwn-snake">' }, { score: 'kaputt' }])
            );
        });
        await page.goto('/pages/snake.html');

        const rows = page.locator('#highscore-list-body tr');
        await expect(rows).toHaveCount(5);
        await expect(rows.first()).toContainText('<img src=x');
        await expect(page.locator('#pwn-snake')).toHaveCount(0);

        await page.locator('#start-btn').click();
        await expect(page.locator('#pause-btn')).toBeEnabled();
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press(' ');
        await expect(page.locator('#pause-btn')).toContainText(/Fortsetzen|Resume/);
        expect(errors).toEqual([]);
    });

    test('Memory: Karten sind per Tastatur bedienbar und beschriftet', async ({ page }) => {
        const errors = collectErrors(page);
        await page.addInitScript(() => {
            localStorage.setItem(
                'memory_highscore_list',
                JSON.stringify([{ moves: '<b id="pwn-memory">x</b>', time: 3 }])
            );
        });
        await page.goto('/pages/memory.html');

        const cards = page.locator('#memory-grid .memory-card');
        await expect(cards).toHaveCount(16);
        await expect(page.locator('#pwn-memory')).toHaveCount(0);

        const first = cards.first();
        await expect(first).toHaveAttribute('role', 'button');
        await expect(first).toHaveAttribute('aria-label', 'Karte 1, verdeckt');
        await first.focus();
        await page.keyboard.press('Enter');
        await expect(first).toHaveClass(/flipped/);
        await expect(first).toHaveAttribute('aria-label', /^Karte 1: \w+/);
        expect(errors).toEqual([]);
    });

    test('Memory: eine komplette Runde endet mit Ergebnis und Bestenliste', async ({ page }) => {
        await page.goto('/pages/memory.html');
        const cards = page.locator('#memory-grid .memory-card');
        await expect(cards).toHaveCount(16);

        const symbols = await cards.evaluateAll((els) =>
            els.map((el) => /** @type {HTMLElement} */ (el).dataset.symbol)
        );
        /** @type {Record<string, number[]>} */
        const pairs = {};
        symbols.forEach((symbol, index) => (pairs[symbol] = [...(pairs[symbol] || []), index]));
        for (const [a, b] of Object.values(pairs)) {
            await cards.nth(a).click();
            await cards.nth(b).click();
        }
        await expect(page.locator('#memory-result')).toBeVisible();
        await expect(page.locator('#memory-result')).toContainText(/8 Züge|8 moves/);
        await expect(page.locator('#memory-highscore-list-body tr').first()).toContainText('8');
    });
});
