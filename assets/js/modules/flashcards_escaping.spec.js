import { test, expect } from '@playwright/test';

test.describe('Flashcards: eigene Karten werden als Text gerendert', () => {
    test('HTML in Frage/Antwort/Hinweis wird nicht ausgeführt', async ({ page }) => {
        let dialogShown = false;
        page.on('dialog', async (d) => {
            dialogShown = true;
            await d.dismiss();
        });

        const payload = '<img src=x onerror="alert(1)"><b>fett</b>';
        await page.addInitScript((p) => {
            localStorage.setItem(
                'flashcards_custom',
                JSON.stringify([
                    {
                        id: 'custom_1',
                        category: 'custom',
                        hint_de: p,
                        hint_en: p,
                        question_de: p,
                        question_en: p,
                        answer_de: p,
                        answer_en: p,
                    },
                ])
            );
        }, payload);

        await page.goto('/pages/flashcards.html');

        const list = page.locator('#custom-cards-list');
        await expect(list).toContainText('<img src=x');
        await expect(list.locator('img, b')).toHaveCount(0);

        await expect(page.locator('#card-question img, #card-question b')).toHaveCount(0);
        expect(dialogShown).toBe(false);
    });
});
