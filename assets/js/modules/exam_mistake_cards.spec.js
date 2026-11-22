import { test, expect } from '@playwright/test';
import { settle } from '../../../scripts/test-support/e2e-helpers.js';

// "Fehler als Karteikarten merken" im Ergebnis der IHK-Prüfungssimulation (modules/exam-to-flashcards.js).
test.describe('Prüfungsfehler als Karteikarten', () => {
    // Same setup as exam_simulator.spec.js: reduced motion keeps clicks stable, the result page is long.
    test.use({ reducedMotion: 'reduce' });
    test.setTimeout(90_000);

    async function runEmptyWisoExam(page) {
        await page.goto('/pages/quiz.html');
        await settle(page);
        await page.locator('button[data-mode="wiso"]').click();
        const question = page.locator('.exam-panel .exam-question');
        await expect(async () => {
            if (!(await question.isVisible())) await page.locator('#exam-start-btn').click({ timeout: 2000 });
            await expect(question).toBeVisible({ timeout: 1500 });
        }).toPass({ timeout: 20000 });
        await page.locator('#exam-submit-btn').click();
        await page.locator('#exam-submit-btn').click();
        await expect(page.locator('#exam-score')).toContainText('0 von 12 richtig');
    }

    // Keyboard activation: the result page is several screens long and its smooth scroll makes pointer clicks miss.
    async function pressMistakesButton(page) {
        await page.locator('#exam-mistakes-to-cards-btn').focus();
        await page.keyboard.press('Enter');
    }

    test('sollte falsche Fragen einmal als eigene Karten in Box 1 anlegen und in der Kartei zeigen', async ({
        page,
    }) => {
        await page.addInitScript(() => {
            if (!sessionStorage.getItem('seeded')) {
                sessionStorage.setItem('seeded', '1');
                localStorage.setItem('cookieConsent', 'accepted');
                localStorage.setItem(
                    'flashcards_custom',
                    JSON.stringify([{ id: 'custom_1', category: 'software', hint_de: 'Eigene', hint_en: 'Own' }])
                );
                localStorage.setItem('flashcards_box_levels', JSON.stringify({ custom_1: 3 }));
            }
        });
        await runEmptyWisoExam(page);
        await pressMistakesButton(page);

        await expect(page.locator('#exam-cards-status')).toContainText('12 Karte(n) angelegt');
        await expect(page.locator('#exam-mistakes-to-cards-btn')).toBeDisabled();
        const stored = await page.evaluate(() => ({
            cards: JSON.parse(localStorage.getItem('flashcards_custom')),
            boxes: JSON.parse(localStorage.getItem('flashcards_box_levels')),
        }));
        expect(stored.cards).toHaveLength(13);
        expect(stored.cards[0].id).toBe('custom_1');
        const created = stored.cards.slice(1);
        expect(created.every((card) => card.id.startsWith('custom_exam_'))).toBe(true);
        expect(created.every((card) => stored.boxes[card.id] === 1)).toBe(true);
        expect(stored.boxes.custom_1).toBe(3);

        // A second run draws other questions: new cards come in, none is duplicated (the exact
        // overlap is covered by the unit tests, the pool is drawn at random).
        await runEmptyWisoExam(page);
        await pressMistakesButton(page);
        await expect(page.locator('#exam-cards-status')).toContainText('Karte(n) angelegt');
        const ids = await page.evaluate(() =>
            JSON.parse(localStorage.getItem('flashcards_custom')).map((card) => card.id)
        );
        expect(new Set(ids).size).toBe(ids.length);
        expect(ids.length).toBeGreaterThanOrEqual(13);

        // The deck shows them.
        await page.goto('/pages/flashcards.html');
        await settle(page);
        await expect(page.locator('#custom-cards-list [data-delete-card-id]')).toHaveCount(ids.length);
    });
});
