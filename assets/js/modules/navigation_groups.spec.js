import { test, expect } from '@playwright/test';

// Navigation: Home, Profil, Projekte, Umschulung, Spielwiese, News und Kontakt.
test.describe('Navigation: gruppierte Hauptnavigation', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('zeigt sieben Einträge, drei davon als Aufklappmenü', async ({ page }) => {
        await page.goto('/pages/home.html');
        await expect(page.locator('#nav-menu > .nav-item')).toHaveCount(7);
        await expect(page.locator('#nav-menu > .nav-item > a[aria-haspopup="true"]')).toHaveCount(3);
    });

    test('Aufklappmenü per Tastatur: Enter öffnet, Escape schließt, aria-expanded folgt', async ({ page }) => {
        await page.goto('/pages/home.html');
        const spielwiese = page.locator('#nav-menu > .nav-item', { hasText: /Spielwiese/ }).first();
        const trigger = spielwiese.locator('> a');
        await trigger.focus();
        await page.keyboard.press('Enter');
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await expect(spielwiese.locator('.dropdown-link', { hasText: 'Code Playground' })).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    test('markiert die Gruppe der aktuellen Seite als aktiv', async ({ page }) => {
        const cases = [
            ['/index.html', 'Home'],
            ['/pages/home.html', 'Profil'],
            ['/pages/portfolio.html', 'Projekte'],
            ['/pages/ueber-mich.html', 'Profil'],
            ['/pages/kostentraeger.html', 'Umschulung'],
            ['/pages/snake.html', 'Spielwiese'],
        ];
        for (const [url, group] of cases) {
            await page.goto(url);
            await expect(page.locator('#nav-menu > .nav-item.active')).toHaveCount(1);
            await expect(page.locator('#nav-menu > .nav-item.active > a')).toContainText(group);
        }
    });

    test('alle internen Menüziele existieren', async ({ page, request }) => {
        await page.goto('/pages/home.html');
        const hrefs = await page
            .locator('#nav-menu a[href]:not([href="#"]):not([href^="http"])')
            .evaluateAll((els) => [...new Set(els.map((el) => el.href))]);
        expect(hrefs.length).toBeGreaterThan(10);
        for (const href of hrefs) {
            expect((await request.get(href)).status(), href).toBe(200);
        }
    });
});
