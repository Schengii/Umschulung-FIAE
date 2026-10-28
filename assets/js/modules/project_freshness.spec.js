import { test, expect } from '@playwright/test';
import { settle } from '../../../scripts/test-support/e2e-helpers.js';

// The portfolio shows when each project's data was last updated and the newest date overall.
test.describe('Projektdaten-Stand (portfolio.html)', () => {
    test('sollte je Projekt einen Stand und oben das neueste Datum zeigen', async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem('cookieConsent', 'accepted'));
        await page.goto('/pages/portfolio.html');
        await settle(page);

        const note = page.locator('#projects-data-freshness');
        await expect(note).toContainText('Projektdaten zuletzt aktualisiert:');

        const cards = page.locator('#dynamic-projects-container .project-card');
        await expect(cards.first()).toBeVisible();
        const withLine = page.locator('#dynamic-projects-container .project-card .project-updated');
        await expect(withLine.first()).toContainText(/Stand: \d{1,2}\.\d{1,2}\.\d{4}/);
        expect(await withLine.count()).toBe(await cards.count());
    });

    test('sollte nach dem Filtern auch die neu gezeichneten Karten beschriften', async ({ page }) => {
        await page.addInitScript(() => localStorage.setItem('cookieConsent', 'accepted'));
        await page.goto('/pages/portfolio.html');
        await settle(page);
        await expect(page.locator('#dynamic-projects-container .project-updated').first()).toBeVisible();

        await page.locator('.portfolio-filters .btn-filter[data-filter="all"]').first().dispatchEvent('click');
        const cards = page.locator('#dynamic-projects-container .project-card');
        await expect(cards.first()).toBeVisible();
        await expect(async () => {
            const withLine = await page.locator('#dynamic-projects-container .project-card .project-updated').count();
            expect(withLine).toBe(await cards.count());
        }).toPass({ timeout: 10000 });
    });
});
