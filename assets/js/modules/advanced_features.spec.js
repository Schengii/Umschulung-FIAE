import { test, expect } from '@playwright/test';
import { settle } from '../../../scripts/test-support/e2e-helpers.js';

test.describe('Advanced Features & Tools E2E Verification', () => {
    test('sollte das Quick-Sandbox Modal im Portfolio öffnen und bedienen', async ({ page }) => {
        await page.goto('/pages/portfolio.html');
        await settle(page);

        // Click on ManuFaktur Sandbox Button
        await page.click('button[data-sandbox-project="ManuFaktur"]');
        const modal = page.locator('#quick-sandbox-modal');
        await expect(modal).toBeVisible();
        const iframe = page.locator('#sandbox-iframe');
        await expect(iframe).toHaveAttribute('src', '../Projekte/ManuFaktur/index.html');

        // Close Sandbox
        await page.click('#btn-sandbox-close');
        await expect(modal).toBeHidden();
    });

    test('sollte das Executive Dossier 2.0 öffnen und Profile umschalten', async ({ page }) => {
        await page.goto('/pages/portfolio.html');
        await settle(page);

        // Open Dossier
        await page.click('button[data-open-dossier]');
        const modal = page.locator('#executive-dossier-modal');
        await expect(modal).toBeVisible();

        const roleText = page.locator('#dossier-role-text');
        await expect(roleText).toContainText('Frontend & PWA Specialist');

        // Switch to Backend profile
        await page.click('button.dossier-type-btn[data-type="backend"]');
        await expect(roleText).toContainText('Software Architect & Systems Developer');

        // Close Dossier
        await page.click('#btn-close-dossier');
        await expect(modal).toBeHidden();
    });

    test('sollte den Portfolio-Assistenten öffnen und auf Fragen antworten', async ({ page }) => {
        await page.goto('/pages/home.html');
        await settle(page);

        // Auf dem Handy bleibt der Assistent-Button ausgeblendet, bis der Hinweis bestätigt ist.
        const accept = page.locator('#cookie-accept');
        if (await accept.isVisible()) await accept.click();

        // Open Copilot
        await page.click('#copilot-toggle-btn');
        const chatBox = page.locator('#copilot-chat-box');
        await expect(chatBox).toBeVisible();

        // Click a suggestion chip
        await page.click('button.copilot-chip[data-query="Welche C++ und Godot Projekte gibt es?"]');

        // Verify response
        const lastMsg = page.locator('#copilot-messages .copilot-msg.bot').last();
        await expect(lastMsg).toContainText('C++20');
        await expect(lastMsg).toContainText('OpenGL');
    });
});
