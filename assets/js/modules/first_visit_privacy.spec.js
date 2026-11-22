import { test, expect } from '@playwright/test';
import { settle } from '../../../scripts/test-support/e2e-helpers.js';

test.describe('Beim Seitenaufruf keine Verbindung zu Drittanbietern', () => {
    for (const url of ['/', '/pages/home.html', '/pages/projekt-detail.html?repo=EcoChef', '/pages/portfolio.html']) {
        test(`${url} fragt weder GitHub noch andere externe Hosts an`, async ({ page }) => {
            /** @type {string[]} */
            const requested = [];
            page.on('request', (request) => {
                if (request.url().startsWith('http')) requested.push(request.url());
            });
            await page.goto(url);
            await settle(page);
            const origin = new URL(page.url()).host;
            const foreign = requested.filter((u) => new URL(u).host !== origin);
            expect(foreign, `externe Anfragen: ${foreign.join(', ')}`).toEqual([]);
        });
    }
});

test.describe('Erster Besuch auf dem Handy', () => {
    test.use({ viewport: { width: 375, height: 800 } });

    test('Hinweis bleibt kompakt, kein Toast, Assistent erst nach Bestätigung', async ({ page }) => {
        await page.goto('/');
        await settle(page);

        const banner = page.locator('#cookie-banner');
        await expect(banner).toBeVisible();
        const box = await banner.boundingBox();
        expect(box?.height ?? 9999, 'Banner höchstens ein Fünftel der Höhe').toBeLessThanOrEqual(800 * 0.2);

        await expect(page.locator('.achievement-toast')).toHaveCount(0);
        await expect(page.locator('#copilot-toggle-btn')).toBeHidden();

        await page.locator('#cookie-accept').click();
        await expect(banner).toHaveCount(0);
        await expect(page.locator('#copilot-toggle-btn')).toBeVisible();
    });
});
