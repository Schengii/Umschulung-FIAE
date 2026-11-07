/**
 * Erzeugt die PNG-Icons für das PWA-Manifest aus public/favicon.svg via Playwright:
 *   public/pwa-192x192.png, public/pwa-512x512.png (any)
 *   public/pwa-maskable-512x512.png (Logo in der Safe-Zone, volle Hintergrundfläche)
 * Run: node scripts/generate-pwa-icons.js
 * Playwright muss installiert sein: npx playwright install chromium
 */

import { chromium } from '@playwright/test';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(projectRoot, 'public');
const svg = fs.readFileSync(path.join(publicDir, 'favicon.svg'), 'utf8');
const svgUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
const BACKGROUND = '#0f172a'; // theme_color aus dem Manifest

// `logoRatio`: Anteil der Icon-Kantenlänge, den das Logo einnimmt.
// Maskable-Icons brauchen die Safe-Zone (inneren 80 % Kreis), daher kleiner.
const ICONS = [
  { file: 'pwa-192x192.png', size: 192, logoRatio: 0.7 },
  { file: 'pwa-512x512.png', size: 512, logoRatio: 0.7 },
  { file: 'pwa-maskable-512x512.png', size: 512, logoRatio: 0.5 }
];

const browser = await chromium.launch();
try {
  for (const { file, size, logoRatio } of ICONS) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(
      `<body style="margin:0;width:${size}px;height:${size}px;background:${BACKGROUND};display:grid;place-items:center">` +
        `<img src="${svgUri}" style="width:${size * logoRatio}px;height:${size * logoRatio}px;object-fit:contain"></body>`
    );
    await page.screenshot({ path: path.join(publicDir, file), clip: { x: 0, y: 0, width: size, height: size } });
    await page.close();
    console.log(`Icon erzeugt: public/${file}`);
  }
} finally {
  await browser.close();
}
