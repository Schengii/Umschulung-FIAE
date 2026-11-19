import { test, expect } from '@playwright/test';

// Visuelle Regression (Plan 6.5): fünf Kernseiten in hellem und dunklem Thema, nur Chromium.
// Läuft nur mit VISUAL=1 (npm run test:visual), weil die Referenzbilder aus der CI (Linux) stammen:
// Schrift-Rendering unterscheidet sich je Betriebssystem. Referenzbilder erzeugt der Workflow
// `visual.yml` (Eingabe "update"), das Ergebnis wird als Artefakt geladen und eingecheckt.
const PAGES = [
    ['home', '/pages/home.html'],
    ['portfolio', '/pages/portfolio.html'],
    ['flashcards', '/pages/flashcards.html'],
    ['quiz', '/pages/quiz.html'],
    ['dashboard', '/pages/dashboard.html'],
];

test.describe('Visuelle Regression', () => {
    test.skip(!process.env.VISUAL, 'nur mit VISUAL=1 (Referenzbilder stammen aus der CI)');

    for (const scheme of /** @type {const} */ (['dark', 'light'])) {
        for (const [name, url] of PAGES) {
            test(`${name} im ${scheme === 'dark' ? 'dunklen' : 'hellen'} Thema`, async ({ page }, testInfo) => {
                test.skip(testInfo.project.name !== 'chromium', 'nur Chromium');

                await page.setViewportSize({ width: 1280, height: 900 });
                // Bewegung einfrieren und einen festen Zustand herstellen.
                await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
                await page.addInitScript((theme) => {
                    localStorage.setItem('cookieConsent', 'accepted');
                    localStorage.setItem('theme', theme);
                    localStorage.setItem('lang', 'de');
                    localStorage.setItem('username', 'Test');
                }, scheme);
                await page.goto(url);
                await page.evaluate(() => document.fonts.ready);
                await page.waitForLoadState('networkidle');

                await expect(page).toHaveScreenshot(`${name}-${scheme}.png`, {
                    fullPage: false,
                    animations: 'disabled',
                    caret: 'hide',
                    maxDiffPixelRatio: 0.015,
                    // Inhalte, die sich von selbst ändern, bleiben außen vor.
                    mask: [
                        page.locator('#portfolio-copilot-container'),
                        page.locator('.toast-container, #toast-container'),
                        page.locator('#commit-grid, #daily-question-card, #site-stats-list'),
                        page.locator('time'),
                    ],
                });
            });
        }
    }
});
