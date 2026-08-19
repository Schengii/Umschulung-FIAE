import { test, expect } from '@playwright/test';

test.describe('Advanced Features & Tools E2E Verification', () => {

  test('sollte das IHK-Cockpit mit Nutzwertanalyse, Phasenplan und Fachgespräch steuern', async ({ page }) => {
    await page.goto('/pages/ihk-cockpit.html');
    await page.waitForLoadState('networkidle');

    // Check Nutzwertanalyse
    const nwaWinner = page.locator('#nwa-winner-text');
    await expect(nwaWinner).toBeVisible();
    await expect(nwaWinner).toContainText('Option A (Lit / TS)');

    // Switch to Database preset
    await page.click('#btn-preset-database');
    await expect(nwaWinner).toContainText('Option A (PostgreSQL / Relational)');

    // Switch to Phasenplan Tab
    await page.click('#tab-phasenplan');
    const phasenTotal = page.locator('#phasen-total-hours');
    await expect(phasenTotal).toHaveText('80');

    // Switch to Fachgesprächs-Simulator Tab
    await page.click('#tab-fachgespraech');
    await page.waitForTimeout(200);
    await page.click('#btn-fg-start', { force: true });
    const questionText = page.locator('#fg-question-text');
    await expect(questionText).toContainText('Frage 1/5');

    // Reveal answer
    await page.click('#btn-fg-reveal', { force: true });
    const answerBox = page.locator('#fg-answer-box');
    await expect(answerBox).toBeVisible();

    // Grade answer
    await page.click('#btn-fg-grade-good', { force: true });
    const scoreDisplay = page.locator('#fg-score-display');
    await expect(scoreDisplay).toContainText('10 Punkte');
  });

  test('sollte das Clean-Code & RegEx Challenge-Lab bedienen und XP sammeln', async ({ page }) => {
    await page.goto('/pages/challenge-lab.html');
    await page.waitForLoadState('networkidle');

    // Solve Lab 1 (SQL Injection -> Option B)
    const lab1OptB = page.locator('button[data-challenge-id="c1"][data-opt-id="b"]');
    await lab1OptB.click();
    const feedback1 = page.locator('#feedback-c1');
    await expect(feedback1).toBeVisible();
    await expect(feedback1).toContainText('Exzellent gelöst');

    // Solve Lab 2 (RegEx PLZ -> Option A)
    const lab2OptA = page.locator('button[data-challenge-id="c2"][data-opt-id="a"]');
    await lab2OptA.click();

    // Verify Score & Rank update
    const scoreDisplay = page.locator('#lab-score-display');
    await expect(scoreDisplay).toHaveText('100 XP');
    const progressDisplay = page.locator('#lab-progress-display');
    await expect(progressDisplay).toHaveText('2 / 4 Labs');
  });

  test('sollte das Quick-Sandbox Modal im Portfolio öffnen und bedienen', async ({ page }) => {
    await page.goto('/pages/portfolio.html');
    await page.waitForLoadState('networkidle');

    // Click on BurgenGame Sandbox Button
    await page.click('button[data-sandbox-project="BurgenGame"]');
    const modal = page.locator('#quick-sandbox-modal');
    await expect(modal).toBeVisible();
    const iframe = page.locator('#sandbox-iframe');
    await expect(iframe).toHaveAttribute('src', '../Projekte/BurgenGame/index.html');

    // Close Sandbox
    await page.click('#btn-sandbox-close');
    await expect(modal).toBeHidden();
  });

  test('sollte das Executive Dossier 2.0 öffnen und Profile umschalten', async ({ page }) => {
    await page.goto('/pages/portfolio.html');
    await page.waitForLoadState('networkidle');

    // Open Dossier
    await page.click('button[data-open-dossier]');
    const modal = page.locator('#executive-dossier-modal');
    await expect(modal).toBeVisible();

    const roleText = page.locator('#dossier-role-text');
    await expect(roleText).toContainText('Frontend & PWA Specialist');

    // Switch to Backend profile
    await page.click('button.dossier-type-btn[data-type="backend"]');
    await expect(roleText).toContainText('Game Engine Developer');

    // Close Dossier
    await page.click('#btn-close-dossier');
    await expect(modal).toBeHidden();
  });

  test('sollte den FIAE AI Copilot öffnen und auf Fragen antworten', async ({ page }) => {
    await page.goto('/pages/home.html');
    await page.waitForLoadState('networkidle');

    // Open Copilot
    await page.click('#copilot-toggle-btn');
    const chatBox = page.locator('#copilot-chat-box');
    await expect(chatBox).toBeVisible();

    // Click a suggestion chip
    await page.click('button.copilot-chip[data-query="Welche C++ und Godot Projekte gibt es?"]');

    // Verify response
    const lastMsg = page.locator('#copilot-messages .copilot-msg.bot').last();
    await expect(lastMsg).toContainText('C++20');
    await expect(lastMsg).toContainText('OpenGL');
  });

});
