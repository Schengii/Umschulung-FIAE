import { test, expect } from '@playwright/test';

// Several showcase projects call their own optional demo backend on a loopback port
// (finance-ai-bot :8000, Wohnungssuche KI :5000, BurgenGame :3001, ...) that is not started in tests.
// Chromium reports that as "Failed to load resource" (filtered below); Firefox words it
// as a CORS error with reason "CORS request did not succeed". Only that exact
// "backend not reachable" case on a non-test-server loopback port is ignored.
const isUnreachableDemoBackend = (text, testServerPort) =>
    text.includes('CORS request did not succeed') &&
    [...text.matchAll(/https?:\/\/(?:127\.0\.0\.1|localhost):(\d+)\//g)].some((match) => match[1] !== testServerPort);

test.describe('All Projects 1-Click Launch E2E Verification', () => {
    test('sollte alle Projekte aus projectsData auslesen und jedes einzelne fehlerfrei starten', async ({ page }) => {
        test.setTimeout(120000);
        // 1. Open portfolio page (relative to baseURL: the suite also runs against the dist
        //    build, which is served on a different port)
        await page.goto('/pages/portfolio.html');
        await page.waitForSelector('.project-card');
        const portfolioUrl = page.url();
        const testServerPort = new URL(portfolioUrl).port;

        // 2. Extract window.projectsData
        const projects = await page.evaluate(() => window.projectsData);
        expect(projects.length).toBeGreaterThan(0);

        console.log(`Extracted ${projects.length} projects from projectsData.`);

        // 3. Test every single project link directly
        for (const proj of projects) {
            const rawLink = proj.link;
            expect(rawLink, `Project ${proj.titleDe} has no launch link`).toBeTruthy();

            const resolvedPath = rawLink.startsWith('Projekte/') ? `../${rawLink}` : rawLink;
            const targetUrl = new URL(resolvedPath, portfolioUrl).href;

            const projPageErrors = [];
            const projConsoleErrors = [];

            const projPage = await page.context().newPage();

            projPage.on('pageerror', (err) => projPageErrors.push(err.message));
            projPage.on('console', (msg) => {
                if (msg.type() === 'error') {
                    const text = msg.text();
                    // Filter out network resource 404 warnings & service workers.
                    if (
                        !text.includes('favicon.ico') &&
                        !text.includes('ServiceWorker') &&
                        !text.includes('Failed to load resource') &&
                        !isUnreachableDemoBackend(text, testServerPort)
                    ) {
                        projConsoleErrors.push(`Console Error on ${rawLink}: ${text}`);
                    }
                }
            });

            const response = await projPage.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            expect(
                response.status(),
                `Launch link ${rawLink} (${targetUrl}) returned status ${response.status()}`
            ).toBe(200);

            // Wait 300ms for initial JS load
            await projPage.waitForTimeout(300);

            expect(projPageErrors, `JS exceptions on launching ${rawLink}`).toEqual([]);
            expect(projConsoleErrors, `Console errors on launching ${rawLink}`).toEqual([]);

            await projPage.close();
        }
    });
});
