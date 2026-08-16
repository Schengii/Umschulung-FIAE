import { test, expect } from '@playwright/test';

const pages = [
  'index.html',
  'pages/home.html',
  'pages/dashboard.html',
  'pages/portfolio.html',
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
  'pages/playground.html',
  'pages/projekt-detail.html?repo=EcoChef',
  'pages/quiz.html',
  'pages/snake.html',
  'Projekte/CoOpVersusGame/coop-versus-demo.html',
  'Projekte/java-playground.html'
];

test.describe('Global Pages Stability Verification', () => {
  for (const pageName of pages) {
    test(`sollte ${pageName} fehlerfrei laden`, async ({ page }) => {
      const consoleErrors = [];
      const pageErrors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          const txt = msg.text();
          if (!txt.includes('403') && !txt.includes('api.github.com') && !txt.includes('Failed to load resource')) {
            consoleErrors.push(`Console Error: ${txt}`);
          }
        }
      });
      page.on('pageerror', err => {
        pageErrors.push(err.message);
      });
      page.on('response', response => {
        const status = response.status();
        const url = response.url();
        if (status >= 400 && !url.includes('cdnjs.cloudflare.com') && !url.includes('api.github.com')) {
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

test.describe('EcoChef Project Detail Page Features', () => {
  test('sollte Code-Explorer, Stepper und Live-Demo steuern können', async ({ page }) => {
    // Navigiere zur EcoChef-Detailseite
    await page.goto('/pages/projekt-detail.html?repo=EcoChef');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // 1. Live-Demo Modal testen
    const demoButton = page.locator('#start-live-demo');
    await expect(demoButton).toBeVisible();
    await demoButton.click();

    const modal = page.locator('#live-demo-modal');
    await expect(modal).toBeVisible();

    const closeButton = page.locator('#demo-close-btn');
    await closeButton.click();
    await expect(modal).toBeHidden();

    // 2. IHK Stepper testen
    const stepperContainer = page.locator('#ihk-stepper');
    await expect(stepperContainer).toBeVisible();

    const nextBtn = page.locator('#stepper-next-btn');
    const prevBtn = page.locator('#stepper-prev-btn');
    const indicator = page.locator('#stepper-indicator');

    await expect(indicator).toContainText('1');
    await expect(prevBtn).toBeDisabled();

    await nextBtn.click();
    await expect(indicator).toContainText('2');
    await expect(prevBtn).not.toBeDisabled();

    // 3. Code-Explorer testen
    const explorer = page.locator('.code-explorer-widget');
    await expect(explorer).toBeVisible();

    const treeItem = page.locator('.tree-item').first();
    await expect(treeItem).toBeVisible();

    const activeFile = page.locator('#explorer-active-file');
    await expect(activeFile).not.toBeEmpty();
  });
});
