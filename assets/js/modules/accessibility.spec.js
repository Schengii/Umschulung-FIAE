import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Complements the Lighthouse a11y score gate (page-level, category threshold)
// with component-level WCAG 2.1 AA checks: focus order, ARIA roles/labels,
// color contrast, and other rules axe-core can verify statically per page.
const pages = [
    'index.html',
    'pages/home.html',
    'pages/dashboard.html',
    'pages/portfolio.html',
    'pages/ihk-cockpit.html',
    'pages/challenge-lab.html',
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
];

test.describe('Accessibility (axe-core, WCAG 2.1 AA)', () => {
    for (const pageName of pages) {
        test(`sollte auf ${pageName} keine WCAG 2.1 AA Verstöße haben`, async ({ page }) => {
            await page.goto(`/${pageName}`);
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(500);

            const results = await new AxeBuilder({ page })
                .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
                .analyze();

            const violations = results.violations.map((v) => ({
                id: v.id,
                impact: v.impact,
                help: v.help,
                nodes: v.nodes.map((n) => n.target.join(' ')),
            }));

            expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
        });
    }
});
