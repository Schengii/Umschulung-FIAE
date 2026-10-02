import { test, expect } from '@playwright/test';
import { settle } from '../../../scripts/e2e-helpers.js';

// The IHK exam simulation on quiz.html: timed run, hand-in, grade and breakdown per topic.
test.describe('IHK-Prüfungssimulation', () => {
    const panel = (page) => page.locator('.exam-panel');

    async function startExam(page, mode) {
        await page.goto('/pages/quiz.html');
        await settle(page);
        await page.locator(`button[data-mode="${mode}"]`).click();
        await expect(page.locator('#exam-timer-display')).toBeVisible();
        await page.locator('#exam-start-btn').click();
        await expect(panel(page).locator('.exam-question')).toBeVisible();
    }

    /** Question text -> text of the right answer, read from the module the page itself uses. */
    async function loadSolutions(page) {
        return page.evaluate(async () => {
            const { EXAM_QUESTIONS } = await import('/assets/js/modules/exam-questions.js');
            return Object.fromEntries(EXAM_QUESTIONS.map((q) => [q.question.de, q.answers[q.correct].de]));
        });
    }

    test('sollte eine fehlerfreie AP1-Prüfung mit Note 1 auswerten', async ({ page }) => {
        await startExam(page, 'ap1');
        const solutions = await loadSolutions(page);

        const steps = page.locator('.exam-step');
        await expect(steps).toHaveCount(15);

        for (let i = 0; i < 15; i++) {
            await expect(panel(page).locator('.exam-question-meta')).toContainText(`Frage ${i + 1} von 15`);
            const question = await panel(page).locator('.exam-question').textContent();
            await panel(page).getByRole('radio', { name: solutions[question], exact: true }).click();
            await expect(steps.nth(i)).toHaveClass(/answered/);
            if (i < 14) await page.getByRole('button', { name: 'Weiter', exact: true }).click();
        }

        // No feedback while the exam is running.
        await expect(panel(page).locator('.correct, .incorrect')).toHaveCount(0);

        await page.locator('#exam-submit-btn').click();

        await expect(page.locator('#exam-score')).toContainText('15 von 15 richtig (100 %)');
        await expect(page.locator('#exam-score')).toContainText('Note 1 (sehr gut)');
        await expect(page.locator('#exam-score')).toContainText('bestanden');
        await expect(panel(page).locator('.exam-topic-table tbody tr')).toHaveCount(5);
        await expect(panel(page).locator('.exam-review li')).toHaveCount(15);

        const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('exam_results')));
        expect(stored.ap1).toMatchObject({ attempts: 1, best: 100, last: 100 });
        const achievements = await page.evaluate(() => localStorage.getItem('achievements') || '');
        expect(achievements).toContain('exam_passed');
    });

    test('sollte vor der Abgabe auf offene Fragen hinweisen und leere Abgaben als nicht bestanden werten', async ({
        page,
    }) => {
        await startExam(page, 'wiso');

        const submit = page.locator('#exam-submit-btn');
        await submit.click();
        await expect(panel(page).locator('.exam-warning')).toContainText('12 Frage(n) unbeantwortet');
        await expect(submit).toHaveText('Trotzdem abgeben');

        await submit.click();
        await expect(page.locator('#exam-score')).toContainText('0 von 12 richtig (0 %)');
        await expect(page.locator('#exam-score')).toContainText('nicht bestanden');
        await expect(panel(page).locator('.exam-recommendation')).toBeVisible();

        // Weak topics feed the dashboard recommendations as flashcard categories.
        const weak = await page.evaluate(() =>
            JSON.parse(localStorage.getItem('learning_recommendations_quiz_weak_categories'))
        );
        expect(weak).toEqual(['wiso']);
    });

    test('sollte die Prüfung nach Ablauf der Zeit automatisch abgeben', async ({ page }) => {
        await page.clock.install();
        await startExam(page, 'ap2');
        await expect(page.locator('#timer-countdown')).toHaveText(/^(20:00|19:5\d)$/);

        await panel(page).getByRole('radio').first().click();
        await page.clock.fastForward('20:01');

        await expect(panel(page).locator('.exam-warning')).toContainText('Die Zeit ist abgelaufen');
        await expect(page.locator('#exam-score')).toContainText('von 15 richtig');
        await expect(page.locator('#timer-countdown')).toHaveText('00:00');
    });

    test('sollte zum normalen Quiz zurückwechseln und die Sprache der Prüfung umschalten', async ({ page }) => {
        await startExam(page, 'ap1');
        await expect(page.locator('#answer-buttons')).toBeHidden();

        await page.locator('#lang-toggle').click();
        await expect(panel(page).locator('.exam-question-meta')).toContainText('Question 1 of 15');
        await expect(page.locator('#exam-submit-btn')).toHaveText('Hand in exam');

        await page.locator('button[data-mode="standard"]').click();
        await expect(panel(page)).toBeHidden();
        await expect(page.locator('#exam-timer-display')).toBeHidden();
        await expect(page.locator('#answer-buttons')).toBeVisible();
    });
});
