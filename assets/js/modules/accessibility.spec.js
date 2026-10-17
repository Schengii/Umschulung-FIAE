import { test, expect } from '@playwright/test';
import { settle } from '../../../scripts/e2e-helpers.js';
import AxeBuilder from '@axe-core/playwright';

// Complements the Lighthouse a11y score gate (page-level, category threshold)
// with component-level WCAG 2.1 AA checks: focus order, ARIA roles/labels,
// color contrast, and other rules axe-core can verify statically per page.
const pages = [
    'index.html',
    'pages/home.html',
    'pages/dashboard.html',
    'pages/portfolio.html',
    'pages/ihk-cockpit.html',
    'pages/challenge-lab.html',
    'pages/git-simulator.html',
    'pages/links.html',
    'pages/ausbildungsablauf.html',
    'pages/ueber-mich.html',
    'pages/praktikumsbetrieb.html',
    'pages/berufsfoerderungswerk.html',
    'pages/impressum.html',
    'pages/datenschutz.html',
    'pages/architecture.html',
    'pages/flashcards.html',
    'pages/games.html',
    'pages/interview-trainer.html',
    'pages/kostentraeger.html',
    'pages/lebenslauf.html',
    'pages/memory.html',
    'pages/news.html',
    'pages/playground.html',
    'pages/projekt-detail.html?repo=EcoChef',
    'pages/quiz.html',
    'pages/snake.html',
];

// A first visit follows the system colour scheme, so both themes are real entry states and
// both get checked (the light theme had contrast failures nobody saw while tests only ever
// ran in the dark default).
const colorSchemes = /** @type {const} */ (['dark', 'light']);

for (const colorScheme of colorSchemes) {
    test.describe(`Accessibility (axe-core, WCAG 2.1 AA, ${colorScheme} theme)`, () => {
        for (const pageName of pages) {
            test(`sollte auf ${pageName} keine WCAG 2.1 AA Verstöße haben`, async ({ page }) => {
                // Measure the settled state: the site collapses transitions under
                // prefers-reduced-motion, and finishing running animations first keeps axe from
                // sampling half-transparent colours mid fade-in (flaky color-contrast on CI WebKit).
                await page.emulateMedia({ reducedMotion: 'reduce', colorScheme });
                await page.goto(`/${pageName}`);
                await settle(page);
                await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))));
                await page.waitForTimeout(500);

                const results = await new AxeBuilder({ page })
                    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
                    .analyze();

                const violations = results.violations.map((v) => ({
                    id: v.id,
                    impact: v.impact,
                    help: v.help,
                    nodes: v.nodes.map((n) => n.target.join(' ')),
                }));

                expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
            });
        }
    });
}

test.describe('Mobile Navigation Drawer A11y & Focus Management', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('sollte aria-expanded beim Klick auf menu-toggle korrekt umschalten', async ({ page }) => {
        await page.goto('/pages/home.html');
        await settle(page);

        const toggle = page.locator('#menu-toggle');
        const menu = page.locator('#nav-menu');

        await expect(toggle).toBeVisible();
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(menu).not.toHaveClass(/open/);

        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await expect(menu).toHaveClass(/open/);

        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(menu).not.toHaveClass(/open/);
    });

    test('sollte bei Escape das geöffnete mobile Menü schließen und den Fokus zurückgeben', async ({ page }) => {
        await page.goto('/pages/home.html');
        await settle(page);

        const toggle = page.locator('#menu-toggle');
        const menu = page.locator('#nav-menu');

        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-expanded', 'true');
        await expect(menu).toHaveClass(/open/);

        await page.keyboard.press('Escape');
        await expect(toggle).toHaveAttribute('aria-expanded', 'false');
        await expect(menu).not.toHaveClass(/open/);
        await expect(toggle).toBeFocused();
    });
});

test.describe('Accent Colors & High-Contrast WCAG 2.1 AA Contrast Audit', () => {
    const accents = ['blue', 'emerald', 'violet', 'orange', 'rose'];

    for (const accent of accents) {
        test(`sollte mit Akzentfarbe "${accent}" WCAG 2.1 AA (4.5:1) Kontrastkriterien einhalten`, async ({ page }) => {
            await page.emulateMedia({ reducedMotion: 'reduce' });
            await page.goto('/pages/home.html');
            await settle(page);
            await page.evaluate((acc) => {
                document.documentElement.setAttribute('data-accent', acc);
            }, accent);
            await page.waitForTimeout(300);

            const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();

            const contrastViolations = results.violations.filter((v) => v.id === 'color-contrast');
            expect(
                contrastViolations,
                `Kontrast-Verstoß bei Akzent ${accent}: ${JSON.stringify(contrastViolations, null, 2)}`
            ).toEqual([]);
        });
    }

    test('sollte im High-Contrast-Modus (data-contrast="high") WCAG 2.1 AA Kontrastkriterien einhalten', async ({
        page,
    }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/pages/home.html');
        await settle(page);
        await page.evaluate(() => {
            document.documentElement.setAttribute('data-contrast', 'high');
        });
        await page.waitForTimeout(300);

        const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();

        const contrastViolations = results.violations.filter((v) => v.id === 'color-contrast');
        expect(
            contrastViolations,
            `Kontrast-Verstoß im High-Contrast-Modus: ${JSON.stringify(contrastViolations, null, 2)}`
        ).toEqual([]);
    });
});
