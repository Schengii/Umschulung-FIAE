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
  'snake.html',
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

test.describe('EcoChef Project Detail Page Features', () => {
  test('sollte Code-Explorer, Stepper und Live-Demo steuern können', async ({ page }) => {
    // Navigiere zur EcoChef-Detailseite
    await page.goto('/projekt-detail.html?repo=EcoChef');
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
