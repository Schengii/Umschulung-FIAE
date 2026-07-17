import { test, expect } from '@playwright/test';

const pages = [
  'index.html',
  'home.html',
  'dashboard.html',
  'portfolio.html',
  'links.html',
  'ausbildungsablauf.html',
  'ueber-mich.html',
  'praktikumsbetrieb.html',
  'berufsfoerderungswerk.html',
  'impressum.html',
  'datenschutz.html',
  'architecture.html',
  'flashcards.html',
  'games.html',
  'interview-trainer.html',
  'kostentraeger.html',
  'lebenslauf.html',
  'memory.html',
  'news.html',
  'playground.html',
  'projekt-detail.html?repo=EcoChef',
  'quiz.html',
  'snake.html'
];

test.describe('Global Pages Stability Verification', () => {
  for (const pageName of pages) {
    test(`sollte ${pageName} fehlerfrei laden`, async ({ page }) => {
      const consoleErrors = [];
      const pageErrors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(`Console Error: ${msg.text()}`);
        }
      });
      page.on('pageerror', err => {
        pageErrors.push(err.message);
      });
      page.on('response', response => {
        const status = response.status();
        const url = response.url();
        if (status >= 400 && !url.includes('cdnjs.cloudflare.com')) {
          consoleErrors.push(`Failed to load resource: ${url} - status ${status}`);
        }
      });

      // Navigate to page
      const response = await page.goto(`/${pageName}`);
      expect(response.status()).toBe(200);

      // Wait for network idle to let all module scripts run
      await page.waitForLoadState('networkidle');
      // Wait a short moment for DOM bootstrap initialization
      await page.waitForTimeout(500);

      // Verify no JS errors occurred on page load
      expect(pageErrors).toEqual([]);
      expect(consoleErrors).toEqual([]);
    });
  }
});
