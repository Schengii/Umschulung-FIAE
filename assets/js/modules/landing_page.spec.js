import { test, expect } from '@playwright/test';
import { stubGithubApi } from '../../../scripts/test-support/e2e-helpers.js';

test.describe('Landing Page Tests', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', (msg) => console.log('PAGE LOG:', msg.text(), msg.location()));
        page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message, err.stack));
        await stubGithubApi(page);
        // Gehe vor jedem Test zur Startseite
        await page.goto('/index.html');
    });

    test('sollte den Dark Mode korrekt umschalten', async ({ page }) => {
        const themeToggleButton = page.locator('#theme-toggle');
        const html = page.locator('html');

        // Überprüfen, ob der Dark-Mode der Standard ist
        await expect(html).toHaveAttribute('data-theme', 'dark');

        // Klicke auf den Schalter und überprüfe, ob der Light-Mode aktiv ist
        await themeToggleButton.click();
        await expect(html).not.toHaveAttribute('data-theme', 'dark');

        // Klicke erneut und überprüfe, ob der Dark-Mode wiederhergestellt ist
        await themeToggleButton.click();
        await expect(html).toHaveAttribute('data-theme', 'dark');
    });

    test('sollte beim ersten Besuch dem hellen System-Farbschema folgen', async ({ page }) => {
        await page.emulateMedia({ colorScheme: 'light' });
        await page.goto('/index.html');
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
        // Nothing is stored until the visitor chooses a theme themselves.
        expect(await page.evaluate(() => localStorage.getItem('theme'))).toBeNull();
    });

    test('sollte ein gewähltes Theme ohne Umweg über das Standard-Theme laden', async ({ page }) => {
        await page.goto('/index.html');
        await page.locator('#theme-toggle').click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

        // components.js runs in <head>: the stored choice must be applied before first paint,
        // i.e. already when the document starts loading.
        await page.goto('/pages/home.html', { waitUntil: 'commit' });
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    });

    test('zeigt Name, Rolle, Projekte und Kontakt ohne Interaktion', async ({ page }) => {
        await expect(page.locator('#hero-section h1')).toHaveText('Maximilian Schenk');
        await expect(page.locator('.hero-subtitle')).toContainText('Fachinformatiker für Anwendungsentwicklung');
        // Keine Namens-Schranke mehr auf der Startseite (Plan 1.1).
        await expect(page.locator('main input')).toHaveCount(0);

        const projects = page.locator('.landing-project');
        await expect(projects).toHaveCount(3);
        for (const link of await projects.locator('a.landing-project-link').all()) {
            await expect(link).toHaveAttribute('href', /projekt-detail\.html\?repo=/);
        }
        await expect(page.locator('.landing-contact a[href^="mailto:"]')).toBeVisible();
        await expect(page.locator('.hero-cta a[href="pages/lebenslauf.html"]')).toBeVisible();
    });

    test('speichert den Namen optional im Dashboard und bleibt auf der Seite', async ({ page }) => {
        await page.goto('/pages/dashboard.html');
        const input = page.locator('#username-input');
        await input.fill('Tester');
        await input.press('Enter');

        await expect(page.locator('#username-status')).toContainText('Gespeichert.');
        await expect(page.locator('#welcome-text')).toContainText('Hallo, Tester!');
        await expect(page).toHaveURL(/dashboard\.html$/);
        expect(await page.evaluate(() => localStorage.getItem('username'))).toBe('Tester');
    });
});
