import { test, expect } from '@playwright/test';

test.describe('All 18 Projects 1-Click Launch E2E Verification', () => {

  test('sollte alle 18 Projekte aus projectsData auslesen und jedes einzelne fehlerfrei starten', async ({ page }) => {
    // 1. Open portfolio page
    await page.goto('http://127.0.0.1:8080/pages/portfolio.html');
    await page.waitForSelector('.project-card');

    // 2. Extract window.projectsData
    const projects = await page.evaluate(() => window.projectsData);
    expect(projects.length).toBe(18);

    console.log(`Extracted ${projects.length} projects from projectsData.`);

    // 3. Test every single project link directly
    for (const proj of projects) {
      const rawLink = proj.link;
      expect(rawLink, `Project ${proj.titleDe} has no launch link`).toBeTruthy();

      const resolvedPath = rawLink.startsWith('Projekte/') ? `../${rawLink}` : rawLink;
      const targetUrl = new URL(resolvedPath, 'http://127.0.0.1:8080/pages/portfolio.html').href;

      const projPageErrors = [];
      const projConsoleErrors = [];

      const projPage = await page.context().newPage();

      projPage.on('pageerror', err => projPageErrors.push(err.message));
      projPage.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Filter out network resource 404 warnings & service workers
          if (!text.includes('favicon.ico') && !text.includes('ServiceWorker') && !text.includes('Failed to load resource')) {
            projConsoleErrors.push(`Console Error on ${rawLink}: ${text}`);
          }
        }
      });

      const response = await projPage.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      expect(response.status(), `Launch link ${rawLink} (${targetUrl}) returned status ${response.status()}`).toBe(200);

      // Wait 300ms for initial JS load
      await projPage.waitForTimeout(300);

      expect(projPageErrors, `JS exceptions on launching ${rawLink}`).toEqual([]);
      expect(projConsoleErrors, `Console errors on launching ${rawLink}`).toEqual([]);

      await projPage.close();
    }
  });

});
