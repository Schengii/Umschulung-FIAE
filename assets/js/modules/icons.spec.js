import fs from 'node:fs';
import { test, expect } from '@playwright/test';
import { settle } from '../../../scripts/e2e-helpers.js';

// Font Awesome is shipped as a generated subset (scripts/subset_fontawesome.js). An icon
// that fell out of it does not throw anywhere, it just renders as nothing, so every page
// is checked for icon elements that end up without a glyph.
const pages = [
    'index.html',
    '404.html',
    ...fs
        .readdirSync('pages')
        .filter((file) => file.endsWith('.html'))
        .map((file) => `pages/${file}`),
    // Stand-alone project pages that link to the root vendor copy instead of their own.
    'Projekte/java-playground.html',
    'Projekte/CoOpVersusGame/coop-versus-demo.html',
    'Projekte/Maps/maps-showcase.html',
];

test.describe('Font Awesome Subset', () => {
    for (const pageName of pages) {
        test(`sollte auf ${pageName} für jedes Icon ein Glyph haben`, async ({ page }) => {
            const failedFontRequests = [];
            page.on('response', (response) => {
                if (response.url().includes('/vendor/fontawesome/') && response.status() >= 400) {
                    failedFontRequests.push(`${response.status()} ${response.url()}`);
                }
            });

            await page.goto(`/${pageName}`);
            await settle(page);

            const iconsWithoutGlyph = await page.evaluate(() => {
                const styleClass = /(^|\s)(fa|fas|far|fab|fa-solid|fa-regular|fa-brands)(\s|$)/;
                return Array.from(document.querySelectorAll('[class*="fa-"]'))
                    .filter((el) => styleClass.test(el.getAttribute('class') || ''))
                    .filter((el) => ['none', 'normal', '""'].includes(window.getComputedStyle(el, '::before').content))
                    .map((el) => el.getAttribute('class'));
            });

            expect(iconsWithoutGlyph).toEqual([]);
            expect(failedFontRequests).toEqual([]);
        });
    }
});
