import { test, expect } from '@playwright/test';

const PAGES = [
  'index.html',
  'pages/home.html',
  'pages/ueber-mich.html',
  'pages/ausbildungsablauf.html',
  'pages/berufsfoerderungswerk.html',
  'pages/praktikumsbetrieb.html',
  'pages/kostentraeger.html',
  'pages/portfolio.html',
  'pages/ihk-cockpit.html',
  'pages/flashcards.html',
  'pages/quiz.html',
  'pages/architecture.html',
  'pages/playground.html',
  'pages/challenge-lab.html',
  'pages/git-simulator.html',
  'pages/dashboard.html',
  'pages/interview-trainer.html',
  'pages/games.html',
  'pages/snake.html',
  'pages/memory.html',
  'pages/news.html',
  'pages/links.html',
  'pages/impressum.html',
  'pages/datenschutz.html',
  'pages/lebenslauf.html'
];

const VIEWPORTS = [
  { width: 250, height: 600, name: '250px (Ultra Narrow / Micro)' },
  { width: 320, height: 568, name: '320px (iPhone SE)' },
  { width: 375, height: 667, name: '375px (Standard Mobile)' },
  { width: 768, height: 1024, name: '768px (Tablet)' }
];

test.describe('Responsive Viewport Stability & Overflow Check', () => {
  for (const vp of VIEWPORTS) {
    test(`sollte auf allen Hauptseiten bei ${vp.name} kein horizontales Scrollen/Überlaufen verursachen`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      for (const pagePath of PAGES) {
        await page.goto(`/${pagePath}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(100);

        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const innerWidth = await page.evaluate(() => window.innerWidth);

        const overflow = scrollWidth - innerWidth;
        if (overflow > 2) {
          console.warn(`[OVERFLOW] ${pagePath} at ${vp.name}: scrollWidth=${scrollWidth}, innerWidth=${innerWidth} (diff: ${overflow}px)`);
        }
        expect(overflow).toBeLessThanOrEqual(5);
      }
    });
  }
});
