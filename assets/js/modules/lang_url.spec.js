import { test, expect } from '@playwright/test';

// hreflang targets: ?lang=en shows the English variant, the toggle keeps the address bar in step.
test.describe('Sprache über die URL (hreflang)', () => {
    test('?lang=en schaltet die Seite auf Englisch und setzt den kanonischen Link', async ({ page }) => {
        await page.goto('/pages/games.html?lang=en');
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /games\.html\?lang=en$/);
        expect(await page.evaluate(() => localStorage.getItem('lang'))).toBe('en');
    });

    test('der Sprachschalter ergänzt und entfernt den Parameter', async ({ page }) => {
        await page.goto('/pages/games.html');
        await expect(page.locator('html')).toHaveAttribute('lang', 'de');
        await page.locator('#lang-toggle').click();
        await expect(page).toHaveURL(/games\.html\?lang=en$/);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\?lang=en$/);
        await page.locator('#lang-toggle').click();
        await expect(page).toHaveURL(/games\.html$/);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /games\.html$/);
    });

    test('jede Seite nennt beide Sprachvarianten', async ({ page }) => {
        await page.goto('/pages/games.html');
        const hreflangs = await page
            .locator('link[rel="alternate"][hreflang]')
            .evaluateAll((els) => els.map((el) => `${el.getAttribute('hreflang')}=${el.getAttribute('href')}`));
        expect(hreflangs).toEqual([
            'de=https://www.max-schenk.tech/pages/games.html',
            'en=https://www.max-schenk.tech/pages/games.html?lang=en',
            'x-default=https://www.max-schenk.tech/pages/games.html',
        ]);
    });
});
