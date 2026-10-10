import { test, expect } from '@playwright/test';

test.describe('Git Simulator Page Tests', () => {
    test.beforeEach(async ({ page }) => {
        page.on('console', (msg) => console.log('PAGE LOG:', msg.text(), msg.location()));
        page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message, err.stack));
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

    /** Types one command into the terminal and submits it. */
    const type = async (page, command) => {
        const input = page.locator('#terminal-input');
        await input.fill(command);
        await input.press('Enter');
    };

    test('sollte Level 3 genau nach Anleitung bestehen lassen', async ({ page }) => {
        await page.locator('#level-select').selectOption('lvl3');
        const badge = page.locator('#level-status-badge');
        await expect(badge).toContainText('Offen');

        // The level provides feature/login; merging its commit into main is a fast-forward.
        for (const command of ['git checkout feature/login', 'git commit', 'git checkout main']) {
            await type(page, command);
        }
        await expect(badge).toContainText('Offen');

        await type(page, 'git merge feature/login');
        await expect(badge).toContainText('Bestanden');
        await expect(page.locator('#terminal-output')).toContainText('Glückwunsch');

        // The success message is announced once, not again after every further command.
        await type(page, 'git log');
        await expect(page.locator('#terminal-output .success-line', { hasText: 'Glückwunsch' })).toHaveCount(1);
    });

    test('sollte Stash und Cherry-Pick unterstützen', async ({ page }) => {
        const output = page.locator('#terminal-output');

        await type(page, 'touch login.js');
        await type(page, 'git stash');
        await expect(output).toContainText('Arbeitsverzeichnis gesichert: WIP on main');
        await type(page, 'git stash pop');
        await expect(output).toContainText('Änderungen aus dem Stash wiederhergestellt');

        for (const command of ['git checkout -b feature/hotfix', 'git commit -m "Hotfix"', 'git checkout main']) {
            await type(page, command);
        }
        await type(page, 'git cherry-pick c2');
        await expect(page.locator('g[data-id="c3"]')).toBeVisible();
        await expect(output).toContainText('Cherry-Pick von c2');
    });

    test('sollte Eingaben als Text und nicht als HTML ausgeben', async ({ page }) => {
        await type(page, 'git commit -m "<img src=x id=injected>"');

        await expect(page.locator('#terminal-output')).toContainText('<img src=x id=injected>');
        await expect(page.locator('#injected')).toHaveCount(0);
    });
});
