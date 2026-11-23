import { test, expect } from '@playwright/test';

// Detail-Modal auf der Portfolio-Seite (assets/js/modal.js): öffnet, zeigt Titel und schließt per Escape.
test.describe('Projekt-Modal', () => {
    test('öffnet über „Details“, zeigt den Titel und schließt mit Escape', async ({ page }) => {
        await page.goto('/pages/portfolio.html');
        const card = page.locator('.project-card').first();
        await expect(card).toBeVisible();
        await card.locator('.btn-details').first().click();

        const modal = page.locator('#project-modal');
        await expect(modal).toHaveClass(/show/);
        await expect(modal.locator('#modal-title')).not.toBeEmpty();
        await expect(modal.locator('.modal-buttons')).toBeVisible();

        await page.keyboard.press('Escape');
        await expect(modal).not.toHaveClass(/show/);
    });
});
