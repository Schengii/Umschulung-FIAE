import { test, expect } from '@playwright/test';
import { settle } from '../../../scripts/e2e-helpers.js';

// The ElektroCheck scanner demo draws the detected defects as boxes over the photo. The
// renderer used to live in a script no page loaded, so the boxes never appeared.
test.describe('ElektroCheck-Scanner (praktikumsbetrieb.html)', () => {
    test('sollte die erkannten Mängel als Rahmen über dem Bild zeichnen und wieder entfernen', async ({ page }) => {
        await page.goto('/pages/praktikumsbetrieb.html');
        await settle(page);

        const boxes = page.locator('#bounding-box-overlay .bounding-box');
        await expect(boxes).toHaveCount(0);

        await page.locator('#run-scanner-btn').scrollIntoViewIfNeeded();
        await page.locator('#run-scanner-btn').click();
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
