import { test, expect } from '@playwright/test';

// Navigation in four groups (Profil, Umschulung, Lernen, Spielwiese) plus Home, News and Kontakt.
test.describe('Navigation: gruppierte Hauptnavigation', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('zeigt sieben Einträge, vier davon als Aufklappmenü', async ({ page }) => {
        await page.goto('/pages/home.html');
        await expect(page.locator('#nav-menu > .nav-item')).toHaveCount(7);
        await expect(page.locator('#nav-menu > .nav-item > a[aria-haspopup="true"]')).toHaveCount(4);
    });

    test('Aufklappmenü per Tastatur: Enter öffnet, Escape schließt, aria-expanded folgt', async ({ page }) => {
        await page.goto('/pages/home.html');
        const lernen = page.locator('#nav-menu > .nav-item', { hasText: /Lernen/ }).first();
        const trigger = lernen.locator('> a');
        await trigger.focus();
        await page.keyboard.press('Enter');
        await expect(trigger).toHaveAttribute('aria-expanded', 'true');
        await expect(lernen.locator('.dropdown-link', { hasText: 'IHK Lernkarten' })).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });

    test('markiert die Gruppe der aktuellen Seite als aktiv', async ({ page }) => {
        const cases = [
            ['/pages/flashcards.html', 'Lernen'],
            ['/pages/portfolio.html', 'Profil'],
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
        expect(hrefs.length).toBeGreaterThan(15);
        for (const href of hrefs) {
            expect((await request.get(href)).status(), href).toBe(200);
        }
    });
});
