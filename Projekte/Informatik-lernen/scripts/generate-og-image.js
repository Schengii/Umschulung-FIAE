/**
 * Generates public/og-image.png (1200x630) via Playwright.
 * Run: node scripts/generate-og-image.js
 * Playwright must be installed: npx playwright install chromium
 */

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const htmlPath = path.join(projectRoot, 'scripts', 'og-image-template.html');
const outPath = path.join(projectRoot, 'public', 'og-image.png');

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1200, height: 630 });
await page.goto(`file://${htmlPath}`);
await page.waitForTimeout(300);
await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();

const size = fs.statSync(outPath).size;
console.log(`OG image generated: ${outPath} (${Math.round(size / 1024)} KB)`);
