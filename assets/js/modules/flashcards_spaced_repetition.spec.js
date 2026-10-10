import { test, expect } from '@playwright/test';

// The Leitner boxes only space reviews out when a known card actually disappears until its
// due date. This spec follows one card through the "due today" deck.
test.describe('Flashcards: Spaced Repetition', () => {
    const dueTab = (page) => page.locator('.category-tab[data-cat="due"]');
    const dueCount = (page) => page.locator('#due-count');

    test('sollte eine gewusste Karte bis zum Fälligkeitstag aus dem Deck nehmen', async ({ page }) => {
        await page.goto('/pages/flashcards.html');

        // Nothing reviewed yet: every card is due.
        const total = Number(await dueCount(page).textContent());
        expect(total).toBeGreaterThan(1);

        await dueTab(page).click();
        await expect(page.locator('#deck-status')).toHaveText(`1 / ${total}`);
        await expect(page.locator('#card-hint')).toContainText('heute fällig');

        // Flip the card and mark it as known.
        await page.locator('#flashcard').click();
        await page.locator('#btn-correct').click();

        await expect(dueCount(page)).toHaveText(String(total - 1));
        await expect(page.locator('#deck-status')).toHaveText(`1 / ${total - 1}`);
        await expect(page.locator('#due-summary')).toContainText(`${total - 1} von ${total}`);

        // The card moved from box 1 to box 2, whose interval is 3 days (at midnight).
        const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('flashcards_due_dates')));
        const [dueAt] = Object.values(stored);
        const dueDay = new Date();
        dueDay.setHours(0, 0, 0, 0);
        dueDay.setDate(dueDay.getDate() + 3);
        expect(dueAt).toBe(dueDay.getTime());

        // It survives a reload ...
        await page.reload();
        await expect(dueCount(page)).toHaveText(String(total - 1));

        // ... and the card is due again once that day has come.
        await page.evaluate(() => {
            const dates = JSON.parse(localStorage.getItem('flashcards_due_dates'));
            for (const id of Object.keys(dates)) dates[id] = Date.now() - 1000;
            localStorage.setItem('flashcards_due_dates', JSON.stringify(dates));
        });
        await page.reload();
        await expect(dueCount(page)).toHaveText(String(total));
    });

    test('sollte eine nicht gewusste Karte im Deck behalten', async ({ page }) => {
        await page.goto('/pages/flashcards.html');
        const total = Number(await dueCount(page).textContent());

        await dueTab(page).click();
        await page.locator('#flashcard').click();
        await page.locator('#btn-wrong').click();

        await expect(page.locator('#btn-wrong')).toBeDisabled();
        await expect(dueCount(page)).toHaveText(String(total));
        await expect(page.locator('#deck-status')).toHaveText(`1 / ${total}`);
    });

    test('sollte mit beschädigten gespeicherten Daten trotzdem laden', async ({ page }) => {
        await page.addInitScript(() => {
            localStorage.setItem('flashcards_due_dates', '{not json');
            localStorage.setItem('flashcards_box_levels', '[1,2,3]');
        });
        await page.goto('/pages/flashcards.html');
        await expect(page.locator('#card-question')).not.toHaveText('Frage...');
        expect(Number(await dueCount(page).textContent())).toBeGreaterThan(1);
    });
});
