import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { settle } from '../../../scripts/test-support/e2e-helpers.js';

// Complements accessibility.spec.js: ongoing animation under prefers-reduced-motion, focus
// hand-back of overlays and colour contrast for every accent colour in both themes.

test.describe('prefers-reduced-motion', () => {
    test.use({ reducedMotion: 'reduce' });

    const pages = ['pages/home.html', 'pages/portfolio.html', 'pages/games.html', 'pages/snake.html'];

    for (const pageName of pages) {
        test(`${pageName}: keine Dauer-Animation und keine Dekoration per Zeiger/Partikel`, async ({ page }) => {
            await page.goto(`/${pageName}`);
            await settle(page);
            await page.mouse.move(200, 200);
            await page.waitForTimeout(300);

            expect(await page.locator('.cursor-glow, .hero-particles-canvas').count()).toBe(0);

            const endless = await page.evaluate(() =>
                document
                    .getAnimations()
                    .filter(
                        (animation) =>
                            animation.playState === 'running' &&
                            animation.effect?.getComputedTiming().iterations === Infinity
                    )
                    .map((animation) => animation.effect?.target?.className || animation.effect?.target?.tagName)
            );
            expect(endless, `Dauer-Animationen: ${JSON.stringify(endless)}`).toEqual([]);
        });
    }

    test('Konfetti startet nicht', async ({ page }) => {
        await page.goto('/pages/home.html');
        await settle(page);
        await page.waitForFunction(() => 'Confetti' in window);
        const canvases = await page.evaluate(() => {
            // @ts-ignore global set by confetti.js
            window.Confetti.start();
            return document.querySelectorAll('body > canvas').length;
        });
        expect(canvases).toBe(0);
    });
});

test.describe('Fokus-Rückgabe von Overlays', () => {
    test('Command Palette gibt den Fokus beim Schließen an das auslösende Element zurück', async ({ page }) => {
        await page.goto('/pages/home.html');
        await settle(page);

        const opener = page.locator('a.skip-link');
        await opener.focus();
        await expect(opener).toBeFocused();

        await page.keyboard.press('Control+KeyK');
        await expect(page.locator('#command-palette-overlay')).toHaveClass(/open/);
        await expect(page.locator('#command-palette-input')).toBeFocused();

        await page.keyboard.press('Escape');
        await expect(page.locator('#command-palette-overlay')).not.toHaveClass(/open/);
        await expect(opener).toBeFocused();
    });

    test('Command Palette: Fokus kehrt auch nach erneutem Umschalten mit Strg+K zurück', async ({ page }) => {
        await page.goto('/pages/home.html');
        await settle(page);

        const opener = page.locator('a.skip-link');
        await opener.focus();
        await page.keyboard.press('Control+KeyK');
        await expect(page.locator('#command-palette-input')).toBeFocused();
        await page.keyboard.press('Control+KeyK');
        await expect(opener).toBeFocused();
    });

    test('showConfirm gibt den Fokus an den Auslöser zurück', async ({ page }) => {
        await page.goto('/pages/home.html');
        await settle(page);

        const opener = page.locator('a.skip-link');
        await opener.focus();
        await page.evaluate(() => {
            // @ts-ignore global from dialog.js
            window.showConfirm({ de: 'Sicher?', en: 'Sure?' });
        });
        await expect(page.locator('dialog[open]')).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(page.locator('dialog[open]')).toHaveCount(0);
        await expect(opener).toBeFocused();
    });
});

test.describe('Kontrast je Akzentfarbe und Theme (axe color-contrast)', () => {
    const accents = ['blue', 'emerald', 'violet', 'orange', 'rose'];
    const pages = ['pages/home.html', 'pages/portfolio.html'];

    for (const colorScheme of /** @type {const} */ (['dark', 'light'])) {
        for (const pageName of pages) {
            for (const accent of accents) {
                test(`${pageName} (${colorScheme}, Akzent ${accent})`, async ({ page }) => {
                    await page.emulateMedia({ reducedMotion: 'reduce', colorScheme });
                    // Start with the accent instead of switching it after load: a switch leaves colour
                    // transitions running, and WebKit then reports the previous text colour.
                    await page.addInitScript((value) => localStorage.setItem('portfolio_accent', value), accent);
                    await page.goto(`/${pageName}`);
                    await settle(page);
                    await expect(page.locator('html')).toHaveAttribute('data-accent', accent);
                    await page.evaluate(() =>
                        Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {})))
                    );
                    await page.waitForTimeout(300);

                    const results = await new AxeBuilder({ page }).withRules(['color-contrast']).analyze();
                    const violations = results.violations.map((v) => ({
                        id: v.id,
                        nodes: v.nodes.map((n) => `${n.target.join(' ')}: ${n.any[0]?.message}`),
                    }));
                    expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
                });
            }
        }
    }
});
