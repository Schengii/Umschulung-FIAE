import { test, expect } from '@playwright/test';

// Service worker: pages come from the network but fall back to the cache offline, the demo builds
// under /Projekte/ are never cached, and fresh responses go to the bounded runtime cache.
test.describe('Service Worker', () => {
    test.skip(({ browserName }) => browserName !== 'chromium', 'Offline-Emulation nur in Chromium zuverlässig');

    test('cached Seiten offline, Demos nie, Laufzeit-Cache getrennt', async ({ page, context }) => {
        await page.goto('/pages/home.html');
        await page.evaluate(() => navigator.serviceWorker.ready);
        await page.reload();
        await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

        // a demo page and an uncached image pass through the worker
        await page.goto('/Projekte/EcoChef/www/index.html');
        await page.goto('/pages/home.html');

        const state = await page.evaluate(async () => {
            const names = (await caches.keys()).filter((n) => n.startsWith('umschulung-fiae-'));
            const urls = [];
            for (const name of names) for (const r of await (await caches.open(name)).keys()) urls.push(r.url);
            return { names, urls };
        });
        expect(state.names.some((n) => n.endsWith('-runtime'))).toBe(true);
        expect(state.names.filter((n) => !n.endsWith('-runtime'))).toHaveLength(1);
        expect(state.urls.some((u) => u.includes('/Projekte/'))).toBe(false);

        await context.setOffline(true);
        await page.goto('/pages/portfolio.html');
        await expect(page.locator('h1')).toBeVisible();
        await context.setOffline(false);
    });
});
