import { test, expect } from '@playwright/test';
import { stubGithubApi } from '../../../scripts/e2e-helpers.js';

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

    test('sollte den Benutzernamen speichern und zur home.html weiterleiten', async ({ page }) => {
        const nameInput = page.locator('#myText');
        const submitButton = page.locator('#mySubmit');

        // Namen eingeben und auf "Eintreten" klicken
        await nameInput.fill('Tester');
        await submitButton.click();

        // Überprüfen, ob zur home.html weitergeleitet wurde
        // 800 ms Erfolgs-Feedback vor dem Redirect + Laden von home.html: auf langsamem CI-WebKit
        // reichen die Standard-5 s nicht immer.
        await expect(page).toHaveURL(/.*home.html/, { timeout: 15000 });

        // Überprüfen, ob der Name im Local Storage gespeichert wurde
        const storedName = await page.evaluate(() => localStorage.getItem('username'));
        expect(storedName).toBe('Tester');
    });
});
