import { test, expect } from '@playwright/test';

test.describe('Landing Page Tests', () => {

    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log('PAGE LOG:', msg.text(), msg.location()));
        page.on('pageerror', err => console.log('PAGE ERROR:', err.message, err.stack));
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

    test('sollte den Benutzernamen speichern und zur home.html weiterleiten', async ({ page }) => {
        const nameInput = page.locator('#myText');
        const submitButton = page.locator('#mySubmit');

        // Namen eingeben und auf "Eintreten" klicken
        await nameInput.fill('Tester');
        await submitButton.click();

        // Überprüfen, ob zur home.html weitergeleitet wurde
        await expect(page).toHaveURL(/.*home.html/);

        // Überprüfen, ob der Name im Local Storage gespeichert wurde
        const storedName = await page.evaluate(() => localStorage.getItem('username'));
        expect(storedName).toBe('Tester');
    });
});