import { test, expect } from '@playwright/test';
import { settle } from '../../../scripts/test-support/e2e-helpers.js';

// Native alert/confirm/prompt are replaced by the <dialog>-based helpers in assets/js/dialog.js (C03).
function failOnNativeDialogs(page) {
    const shown = [];
    page.on('dialog', async (dialog) => {
        shown.push(dialog.type());
        await dialog.dismiss();
    });
    return shown;
}

test.describe('Eigene Dialoge statt window.alert/confirm/prompt', () => {
    test('Git-Simulator: Quick-Commit fragt per Dialog nach der Nachricht', async ({ page }) => {
        const native = failOnNativeDialogs(page);
        await page.goto('/pages/git-simulator.html');
        await settle(page);

        await page.locator('#btn-quick-commit').click();
        const dialog = page.locator('dialog.app-dialog');
        await expect(dialog).toBeVisible();
        await expect(dialog.locator('input')).toBeFocused();
        await dialog.locator('input').fill('Dialog-Test');
        await dialog.getByRole('button', { name: 'OK' }).click();

        await expect(dialog).toHaveCount(0);
        await expect(page.locator('#terminal-output')).toContainText('Dialog-Test');
        expect(native).toEqual([]);
    });

    test('Git-Simulator: Abbrechen führt keinen Befehl aus, Esc schließt den Dialog', async ({ page }) => {
        const native = failOnNativeDialogs(page);
        await page.goto('/pages/git-simulator.html');
        await settle(page);

        const before = await page.locator('#terminal-output').innerText();
        // Keyboard activation: Safari does not focus a button on mouse click, so the opener would be <body>.
        await page.locator('#btn-quick-branch').focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('dialog.app-dialog')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.locator('dialog.app-dialog')).toHaveCount(0);
        await expect(page.locator('#btn-quick-branch')).toBeFocused();
        expect(await page.locator('#terminal-output').innerText()).toBe(before);
        expect(native).toEqual([]);
    });

    test('Interview-Trainer: ohne Kategorie erscheint ein Hinweis-Dialog', async ({ page }) => {
        const native = failOnNativeDialogs(page);
        await page.goto('/pages/interview-trainer.html');
        await settle(page);

        await page.locator('input[name="category"]:checked').evaluateAll((boxes) =>
            boxes.forEach((box) => {
                /** @type {HTMLInputElement} */ (box).checked = false;
            })
        );
        await page
            .locator('#start-interview-btn, button:has-text("Starten"), button:has-text("Start")')
            .first()
            .click();
        const dialog = page.locator('dialog.app-dialog');
        await expect(dialog).toContainText('Kategorie');
        await dialog.getByRole('button', { name: 'OK' }).click();
        await expect(dialog).toHaveCount(0);
        expect(native).toEqual([]);
    });
});
