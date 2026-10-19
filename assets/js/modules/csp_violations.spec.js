import { test, expect } from '@playwright/test';
import { stubGithubApi, settle } from '../../../scripts/e2e-helpers.js';

// Every page carries its own strict CSP in a <meta> tag: styles come from files ('self'),
// only style="" attributes are still allowed (style-src-attr). This spec visits all pages,
// opens the command palette (loads a stylesheet on demand) and fails on any CSP violation or
// injected <style> element, so a new inline <style> block cannot slip in unnoticed.

const pages = [
    'index.html',
    '404.html',
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
    'pages/offline.html',
    'pages/projekt-detail.html?repo=EcoChef',
    'pages/quiz.html',
    'pages/snake.html',
];

// playground.html runs user code in a srcdoc iframe that inherits its CSP, so it keeps
// 'unsafe-inline' for styles (ADR 0003); it is covered by the script-level specs.

test.beforeEach(async ({ page }) => {
    await stubGithubApi(page);
    await page.addInitScript(() => {
        // @ts-ignore test hook
        window.__cspViolations = [];
        document.addEventListener('securitypolicyviolation', (event) => {
            // @ts-ignore test hook
            window.__cspViolations.push(`${event.violatedDirective}: ${event.blockedURI} ${event.sample || ''}`.trim());
        });
    });
});

test.describe('CSP: styles only from files', () => {
    for (const pageName of pages) {
        test(`${pageName} verletzt die CSP nicht und enthält keine <style>-Elemente`, async ({ page }) => {
            const consoleCsp = [];
            page.on('console', (msg) => {
                if (msg.type() === 'error' && /content security policy/i.test(msg.text())) consoleCsp.push(msg.text());
            });

            await page.goto(`/${pageName}`);
            await settle(page);
            // Opens the palette on pages that have it; it loads its stylesheet lazily.
            await page.keyboard.press('Control+k');
            await settle(page, 1500);

            // @ts-ignore test hook
            expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
            expect(consoleCsp).toEqual([]);
            expect(await page.locator('style').count()).toBe(0);
        });
    }

    test('Style-Attribute und CSSOM bleiben erlaubt (style-src-attr)', async ({ page }) => {
        await page.goto('/pages/home.html');
        await settle(page);
        const color = await page.evaluate(() => {
            const probe = document.createElement('div');
            probe.setAttribute('style', 'color: rgb(1, 2, 3)');
            document.body.appendChild(probe);
            return getComputedStyle(probe).color;
        });
        expect(color).toBe('rgb(1, 2, 3)');
        // @ts-ignore test hook
        expect(await page.evaluate(() => window.__cspViolations)).toEqual([]);
    });

    test('ein eingeschleustes <style>-Element wird von der CSP blockiert', async ({ page }) => {
        await page.goto('/pages/home.html');
        await settle(page);
        const background = await page.evaluate(() => {
            const style = document.createElement('style');
            style.textContent = 'body { outline: 7px solid rgb(9, 8, 7) !important; }';
            document.head.appendChild(style);
            return getComputedStyle(document.body).outlineColor;
        });
        expect(background).not.toBe('rgb(9, 8, 7)');
        // @ts-ignore test hook
        const violations = await page.evaluate(() => window.__cspViolations);
        expect(violations.some((entry) => entry.startsWith('style-src-elem'))).toBe(true);
    });
});
