import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

// Generierte, statische Projektseiten (scripts/generate_project_pages.js): indexierbar im Quelltext.
const pagesDir = path.resolve(__dirname, '..', '..', '..', 'pages');
const generated = fs
    .readdirSync(pagesDir)
    .filter((name) => name.startsWith('projekt-') && name !== 'projekt-detail.html');

test.describe('Projektseiten', () => {
    test('gibt es für jedes Projekt', () => {
        expect(generated.length).toBeGreaterThanOrEqual(8);
    });

    for (const name of generated) {
        test(`${name}: Inhalt im Quelltext, JSON-LD, Canonical, genau eine h1`, async ({ page, request }) => {
            // Der Quelltext, den ein Crawler ohne JavaScript sieht.
            const source = await (await request.get(`/pages/${name}`)).text();
            expect(source).toContain('<h1>');
            expect(source).toMatch(/<meta name="description" content="[^"]{40,}"/);
            expect(source).toContain(`<link rel="canonical" href="https://www.max-schenk.tech/pages/${name}">`);

            await page.goto(`/pages/${name}`);
            await expect(page.locator('h1')).toHaveCount(1);
            await expect(page.locator('main .card p[lang="de"]')).toHaveCount(1);
            await expect(page.locator('a[href^="projekt-detail.html?repo="]')).toHaveCount(1);

            const ld = JSON.parse(await page.locator('script[type="application/ld+json"]').first().textContent());
            expect(ld['@type']).toBe('CreativeWork');
            expect(ld.url).toBe(`https://www.max-schenk.tech/pages/${name}`);
            expect(ld.description.length).toBeGreaterThan(40);
        });
    }

    test('Sprachschalter zeigt den englischen Text', async ({ page }) => {
        await page.goto(`/pages/${generated[0]}?lang=en`);
        await expect(page.locator('main .card p[lang="en"]')).toBeVisible();
        await expect(page.locator('main .card p[lang="de"]')).toBeHidden();
    });

    test('externe Links öffnen sicher und Bilder tragen Maße', async ({ page }) => {
        for (const name of generated) {
            await page.goto(`/pages/${name}`);
            for (const link of await page.locator('main a[target="_blank"]').all()) {
                expect(await link.getAttribute('rel')).toContain('noopener');
            }
            for (const img of await page.locator('main img').all()) {
                expect(await img.getAttribute('width')).toBeTruthy();
                expect(await img.getAttribute('height')).toBeTruthy();
            }
        }
    });

    test('portfolio.html verweist im ItemList auf die statischen Seiten', async ({ page }) => {
        await page.goto('/pages/portfolio.html');
        const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
        const list = blocks.map((text) => JSON.parse(text)).find((data) => data['@type'] === 'ItemList');
        expect(list.itemListElement.length).toBeGreaterThanOrEqual(8);
        for (const item of list.itemListElement) {
            expect(item.url).toMatch(/\/pages\/projekt-[a-z0-9-]+\.html$/);
            expect(generated).toContain(item.url.split('/').pop());
        }
    });
});
