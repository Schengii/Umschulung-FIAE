/**
 * @file check_lighthouse_urls.js
 * @description lighthouserc.json lists the pages Lighthouse CI audits. A page missing there is
 * never measured against the score thresholds, so every URL in sitemap.xml must be listed (or
 * named in EXCLUDED with a reason).
 *
 * Usage: node scripts/check_lighthouse_urls.js
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

// Page path (as in the sitemap) -> why Lighthouse skips it. Keep empty unless there is a reason.
const EXCLUDED = new Map();

const ORIGIN = 'https://www.max-schenk.tech/';

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapPages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(ORIGIN, ''));

const config = JSON.parse(fs.readFileSync(path.join(root, 'lighthouserc.json'), 'utf8'));
const audited = new Set(config.ci.collect.url.map((/** @type {string} */ url) => url.replace('http://localhost/', '')));

// Die Projektseiten (scripts/generate_project_pages.js) sind alle aus demselben Template erzeugt:
// Lighthouse prüft eine davon als Stichprobe, nicht jede einzeln.
const GENERATED = /^pages\/projekt-(?!detail\.html)[a-z0-9-]+\.html$/;
const generatedPages = sitemapPages.filter((page) => GENERATED.test(page));
const generatedSample = generatedPages.some((page) => audited.has(page));

const missing = sitemapPages.filter((page) => !audited.has(page) && !EXCLUDED.has(page) && !GENERATED.test(page));
if (generatedPages.length && !generatedSample) {
    console.error('✗ keine der generierten Projektseiten steht als Stichprobe in lighthouserc.json');
    process.exit(1);
}
const unknown = [...audited].filter((page) => !sitemapPages.includes(page));

if (missing.length || unknown.length) {
    for (const page of missing) console.error(`✗ ${page} is in sitemap.xml but not in lighthouserc.json`);
    for (const page of unknown) console.error(`✗ ${page} is in lighthouserc.json but not in sitemap.xml`);
    process.exit(1);
}

console.log(`✓ lighthouserc.json audits all ${sitemapPages.length} sitemap pages.`);
