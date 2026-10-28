import { test, expect } from '@playwright/test';
import { settle } from '../../../scripts/e2e-helpers.js';

// "Print / save as PDF" of the executive dossier must put the dossier on paper, not the page
// behind the dialog. window.print() cannot be driven in a test, so the print layout is checked
// by emulating the print media with the class the button sets.
// Infinite header/footer animations starve requestAnimationFrame in WebKit and every click waits on
// animation frames for its stability check; reduced motion (which the site honours) removes that load.
test.use({ reducedMotion: 'reduce' });

for (const pageName of ['pages/home.html', 'pages/portfolio.html']) {
    test.describe(`Dossier-Druck (${pageName})`, () => {
        test('sollte beim Drucken nur das Dossier zeigen', async ({ page }) => {
            await page.addInitScript(() => localStorage.setItem('cookieConsent', 'accepted'));
            await page.goto(`/${pageName}`);
            await settle(page);

            await expect(page.locator('[data-open-dossier]').first()).toBeVisible();
            await expect(async () => {
                // The button sits inside a card that keeps animating on WebKit; the page logic, not the pointer, is under test.
                await page.locator('[data-open-dossier]').first().dispatchEvent('click');
                await expect(page.locator('#executive-dossier-modal')).toBeVisible({ timeout: 1500 });
            }).toPass({ timeout: 20000 });

            await page.evaluate(() => document.body.classList.add('printing-dossier'));
            await page.emulateMedia({ media: 'print' });

            await expect(page.locator('#dossier-preview-box')).toBeVisible();
            await expect(page.locator('#dossier-name')).toContainText('Maximilian Schenk');
            await expect(page.locator('#btn-print-dossier')).toBeHidden();
            await expect(page.locator('#btn-close-dossier')).toBeHidden();
            await expect(page.locator('main')).toBeHidden();
            await expect(page.locator('.dossier-type-btn').first()).toBeHidden();
        });
    });
}
