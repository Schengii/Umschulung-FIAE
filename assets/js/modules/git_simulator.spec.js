import { test, expect } from '@playwright/test';

test.describe('Git Simulator Page Tests', () => {

    test.beforeEach(async ({ page }) => {
        page.on('console', msg => console.log('PAGE LOG:', msg.text(), msg.location()));
        page.on('pageerror', err => console.log('PAGE ERROR:', err.message, err.stack));
        // Goto git-simulator.html
        await page.goto('/pages/git-simulator.html');
    });

    test('sollte initialisiert werden und ein Terminal anzeigen', async ({ page }) => {
        // Verify terminal input and initial terminal prompt is loaded
        const input = page.locator('#terminal-input');
        await expect(input).toBeVisible();

        const terminalOutput = page.locator('#terminal-output');
        await expect(terminalOutput).toContainText('Git Branching Simulator Sandbox');
    });

    test('sollte einen Commit über die Befehlseingabe erstellen', async ({ page }) => {
        const input = page.locator('#terminal-input');
        
        // Focus and type git commit command
        await input.focus();
        await input.fill('git commit -m "Test commit"');
        await input.press('Enter');

        // Check if output contains the success message with commit hash
        const terminalOutput = page.locator('#terminal-output');
        await expect(terminalOutput).toContainText('c2');
        await expect(terminalOutput).toContainText('Test commit');

        // Verify that c2 node exists in the SVG
        const commitNode = page.locator('g[data-id="c2"]');
        await expect(commitNode).toBeVisible();
    });

    test('sollte einen neuen Branch erstellen', async ({ page }) => {
        const input = page.locator('#terminal-input');
        
        await input.focus();
        await input.fill('git branch feature/test');
        await input.press('Enter');

        const terminalOutput = page.locator('#terminal-output');
        await expect(terminalOutput).toContainText("Branch 'feature/test' erstellt");

        // Verify that the branch tag exists in the SVG labels
        const branchLabel = page.locator('g#git-labels');
        await expect(branchLabel).toContainText('feature/test');
    });
});
