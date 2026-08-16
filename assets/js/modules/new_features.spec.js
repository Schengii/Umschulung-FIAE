import { test, expect } from '@playwright/test';

test.describe('New Interactive Features E2E Verification', () => {

  test('sollte den Recruiter Skill-Matchmaker auf portfolio.html initialisieren und filtern', async ({ page }) => {
    await page.goto('/pages/portfolio.html', { waitUntil: 'domcontentloaded' });

    const widget = page.locator('#skill-matchmaker-widget');
    await expect(widget).toBeVisible();

    const badge = page.locator('#match-score-badge');
    await expect(badge).toContainText('Match');

    const filterBtn = page.locator('#btn-filter-matched');
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();
  });

  test('sollte den In-Browser SQL Playground auf playground.html ausführen', async ({ page }) => {
    await page.goto('/pages/playground.html');
    await page.waitForLoadState('networkidle');

    const sqlSection = page.locator('#sql-playground-section');
    await expect(sqlSection).toBeVisible();

    const runBtn = page.locator('#btn-run-sql');
    await expect(runBtn).toBeVisible();
    await runBtn.click();

    const results = page.locator('#sql-results-container');
    await expect(results).toContainText('Müller GmbH');
  });

  test('sollte den IHK Prüfungs-Simulator Modus auf quiz.html schalten', async ({ page }) => {
    await page.goto('/pages/quiz.html');
    await page.waitForLoadState('networkidle');

    const modeSelector = page.locator('.ihk-mode-selector');
    await expect(modeSelector).toBeVisible();

    const ap1Btn = page.locator('button[data-mode="ap1"]');
    await ap1Btn.click();

    const timer = page.locator('#exam-timer-display');
    await expect(timer).toBeVisible();
  });

  test('sollte den iCal Event-Generator auf impressum.html auslösen', async ({ page }) => {
    await page.goto('/pages/impressum.html');
    await page.waitForLoadState('networkidle');

    const slotBtn = page.locator('.btn-slot').first();
    await slotBtn.click();

    const confirmBtn = page.locator('#confirm-booking-btn');
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    const success = page.locator('#booking-success');
    await expect(success).toBeVisible();
    await expect(success).toContainText('Google Calendar');
  });

  test('sollte den C4 Architektur-Level Switcher auf architecture.html bedienen', async ({ page }) => {
    await page.goto('/pages/architecture.html');
    await page.waitForLoadState('networkidle');

    const c4Switcher = page.locator('#c4-level-switcher');
    await expect(c4Switcher).toBeVisible();

    const lvl2Btn = page.locator('button[data-level="2"]');
    await lvl2Btn.click();

    const info = page.locator('#c4-level-info');
    await expect(info).toContainText('Container Diagramm');
  });

  test('sollte den Audio Pitch Player auf home.html anzeigen', async ({ page }) => {
    await page.goto('/pages/home.html');
    await page.waitForLoadState('networkidle');

    const audioCard = page.locator('#audio-pitch-card');
    await expect(audioCard).toBeVisible();

    const playBtn = page.locator('#btn-play-pitch');
    await expect(playBtn).toBeVisible();
  });

  test('sollte den Git-Simulator mit neuen Levels 5 & 6 laden', async ({ page }) => {
    await page.goto('/pages/git-simulator.html');
    await page.waitForLoadState('networkidle');

    const dropdown = page.locator('#level-select');
    await expect(dropdown).toBeVisible();
    await dropdown.selectOption('lvl5');

    const badge = page.locator('#level-status-badge');
    await expect(badge).toBeVisible();
  });

  test('sollte die Command Palette (Strg+K) öffnen, suchen und navigieren', async ({ page }) => {
    await page.goto('/pages/home.html');
    await page.waitForLoadState('networkidle');

    // Trigger via keyboard shortcut
    await page.keyboard.press('Control+KeyK');
    const overlay = page.locator('#command-palette-overlay');
    await expect(overlay).toHaveClass(/open/);

    const input = page.locator('#command-palette-input');
    await input.fill('EcoChef');

    const results = page.locator('.command-palette-item');
    await expect(results.first()).toBeVisible();
    await expect(results.first()).toContainText('EcoChef');

    // Close via ESC
    await page.keyboard.press('Escape');
    await expect(overlay).not.toHaveClass(/open/);
  });

  test('sollte den Side-by-Side Projektvergleich auf portfolio.html bedienen können', async ({ page }) => {
    await page.goto('/pages/portfolio.html');
    await page.waitForLoadState('networkidle');

    // Select first project to compare
    const compareBtns = page.locator('.btn-compare-select');
    await expect(compareBtns.first()).toBeVisible();
    await compareBtns.nth(0).click();

    // Floating bar appears
    const floatingBar = page.locator('#compare-floating-bar');
    await expect(floatingBar).toBeVisible();
    await expect(floatingBar).toContainText('1 Projekt');

    // Select second project
    await compareBtns.nth(1).click();
    await expect(floatingBar).toContainText('2 Projekte');

    // Open drawer
    await floatingBar.click();
    const drawer = page.locator('#project-compare-drawer');
    await expect(drawer).toHaveClass(/open/);

    const columns = page.locator('.compare-column');
    await expect(columns).toHaveCount(2);
  });

  test('sollte im Skill-Radar auf ueber-mich.html interaktive Filter-Links bereitstellen', async ({ page }) => {
    await page.goto('/pages/ueber-mich.html');
    await page.waitForLoadState('networkidle');

    const radarDots = page.locator('.radar-dot');
    await expect(radarDots.first()).toBeVisible();
    await expect(radarDots.first()).toHaveAttribute('style', /cursor:\s*pointer/);
  });

});
