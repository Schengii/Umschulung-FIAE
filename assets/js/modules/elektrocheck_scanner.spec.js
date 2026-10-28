import { test, expect } from '@playwright/test';
import { settle } from '../../../scripts/test-support/e2e-helpers.js';

// The ElektroCheck scanner demo draws the detected defects as boxes over the photo. The
// renderer used to live in a script no page loaded, so the boxes never appeared.
test.describe('ElektroCheck-Scanner (praktikumsbetrieb.html)', () => {
    test('sollte die erkannten Mängel als Rahmen über dem Bild zeichnen und wieder entfernen', async ({ page }) => {
        // The cookie banner appears late and, being fixed at the bottom, can cover the button and swallow
        // the click (seen on Firefox and WebKit), so start with the consent already given.
        await page.addInitScript(() => localStorage.setItem('cookieConsent', 'accepted'));
        await page.goto('/pages/praktikumsbetrieb.html');
        await settle(page);

        const boxes = page.locator('#bounding-box-overlay .bounding-box');
        await expect(boxes).toHaveCount(0);

        // praktikumsbetrieb-media.js is a lazy module; its video setup (which sets the player's src) runs
        // synchronously right before the scanner setup, so this marks the scanner button as wired.
        // A click before that would silently do nothing.
        await expect(page.locator('#ecochef-video-player')).toHaveAttribute('src', /.+/);
        // The boxes are placed from the rendered image rectangle, so the image has to be decoded and laid out first.
        await expect
            .poll(() => page.locator('#uploaded-image').evaluate((el) => el.complete && el.naturalWidth > 0))
            .toBe(true);
        await page.locator('#run-scanner-btn').scrollIntoViewIfNeeded();
        // Lazy-loaded content above can still move the page while the click is dispatched (Firefox); a lost
        // click leaves the button enabled, so click again until the scan has really started.
        await expect(async () => {
            await page.locator('#run-scanner-btn').click({ timeout: 6000 });
            await expect(page.locator('#run-scanner-btn')).toBeDisabled({ timeout: 1000 });
        }).toPass({ timeout: 25000 });
        await expect(boxes).toHaveCount(2, { timeout: 10000 });
        await expect(page.locator('#scanner-results-list .scanner-result-item')).toHaveCount(2);
        await expect(boxes.first().locator('.bounding-box-label')).toContainText('Isolationsfehler');

        // Every box lies within the rendered image, not somewhere in the letterbox around it.
        const image = await page.locator('#uploaded-image').boundingBox();
        for (const box of await boxes.all()) {
            const rect = await box.boundingBox();
            expect(rect.x).toBeGreaterThanOrEqual(image.x - 1);
            expect(rect.y).toBeGreaterThanOrEqual(image.y - 1);
            expect(rect.x + rect.width).toBeLessThanOrEqual(image.x + image.width + 1);
            expect(rect.y + rect.height).toBeLessThanOrEqual(image.y + image.height + 1);
        }

        await page.locator('#clear-scanner-btn').click();
        await expect(boxes).toHaveCount(0);
    });
});
