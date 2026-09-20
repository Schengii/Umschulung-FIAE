/**
 * @file check_head_consistency.js
 * @description Guards against exactly the kind of <head> drift found manually
 * during the CSP unification pass (pages/pages/404.html was missing its CSP
 * meta tag entirely). A byte-identical shared <head> "include" is not safe to
 * auto-generate here: existing pages already differ in tag ORDER, not just
 * content, so a blind template rewrite risks corrupting all 28 pages at once.
 * Instead, this checks that every page-level boilerplate tag we can safely
 * assert on is PRESENT (not necessarily byte-identical), and fails CI loudly
 * if a future manual edit silently drops one.
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const pagesDir = path.join(root, 'pages');

const files = [
    path.join(root, 'index.html'),
    path.join(root, '404.html'),
    ...fs.readdirSync(pagesDir).filter(f => f.endsWith('.html')).map(f => path.join(pagesDir, f)),
];

// offline.html is an intentionally minimal PWA fallback page (no header/nav,
// no SEO tags) — everything else is expected to carry the full boilerplate.
const MINIMAL_PAGES = new Set(['offline.html']);

const CHECKS = [
    { name: 'charset', re: /<meta charset="UTF-8">/i, requiredFor: 'all' },
    { name: 'viewport', re: /<meta name="viewport" content="width=device-width, initial-scale=1\.0">/i, requiredFor: 'all' },
    { name: 'CSP meta', re: /<meta http-equiv="Content-Security-Policy"/i, requiredFor: 'all' },
    { name: 'style.css link', re: /<link rel="stylesheet" href="(\.\.\/)?assets\/css\/style\.css">/i, requiredFor: 'all' },
    { name: 'Font Awesome link', re: /<link rel="stylesheet" href="(\.\.\/)?assets\/vendor\/fontawesome\/css\/all\.min\.css">/i, requiredFor: 'all' },
    { name: 'favicon link', re: /<link rel="icon" type="image\/svg\+xml" href="(\.\.\/)?assets\/images\/favicon\.svg">/i, requiredFor: 'full' },
    { name: 'components.js script', re: /<script[^>]*src="(\.\.\/)?assets\/js\/components\.js"[^>]*>/i, requiredFor: 'full' },
    { name: 'meta author', re: /<meta name="author" content="Maximilian Schenk">/i, requiredFor: 'full' },
    { name: 'og:title', re: /<meta property="og:title"/i, requiredFor: 'full' },
    { name: 'og:description', re: /<meta property="og:description"/i, requiredFor: 'full' },
    { name: 'og:image', re: /<meta property="og:image"/i, requiredFor: 'full' },
];

let hadFailure = false;

for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(root, file);
    const isMinimal = MINIMAL_PAGES.has(path.basename(file));

    const missing = CHECKS
        .filter(check => check.requiredFor === 'all' || !isMinimal)
        .filter(check => !check.re.test(html))
        .map(check => check.name);

    if (missing.length > 0) {
        hadFailure = true;
        console.error(`✗ ${rel}: missing ${missing.join(', ')}`);
    }
}

if (hadFailure) {
    console.error('\nHead consistency check failed — see missing tags above.');
    process.exit(1);
} else {
    console.log(`✓ Head boilerplate consistent across ${files.length} pages.`);
}
