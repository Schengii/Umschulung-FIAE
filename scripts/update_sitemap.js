/**
 * @file update_sitemap.js
 * @description sitemap.xml is maintained by hand (order and priority are editorial
 * decisions), which went wrong in two ways: a new page is easily forgotten, and every
 * entry carried the same blanket <lastmod>, which tells a crawler nothing.
 *
 * This script leaves order and priority alone and only
 *   - sets <lastmod> of each entry to the date its HTML file last changed (the last commit
 *     touching it, or today for a file with uncommitted changes), and
 *   - verifies that sitemap and pages agree: every indexable page is listed, every listed
 *     URL exists on disk.
 *
 * Usage:
 *   node scripts/update_sitemap.js          # refresh the <lastmod> dates
 *   node scripts/update_sitemap.js --check  # coverage only (CI: a shallow clone has no dates)
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const sitemapPath = path.join(root, 'sitemap.xml');
const check = process.argv.includes('--check');

const ORIGIN = 'https://www.max-schenk.tech/';

// Reachable only with a query string (?repo=…); the bare URL has no content of its own.
const PARAMETERISED_PAGES = new Set(['pages/projekt-detail.html']);

const isNoIndex = (html) => /<meta name="robots" content="[^"]*noindex/i.test(html);

function listPages() {
    const pagesDir = path.join(root, 'pages');
    return [
        'index.html',
        '404.html',
        ...fs
            .readdirSync(pagesDir)
            .filter((file) => file.endsWith('.html'))
            .map((file) => `pages/${file}`),
    ];
}

function lastModified(file) {
    const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
    if (git('status', '--porcelain', '--', file)) {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    }
    return git('log', '-1', '--format=%cs', '--', file);
}

const sitemap = fs.readFileSync(sitemapPath, 'utf8');
const listed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

const problems = [];
for (const url of listed) {
    if (!url.startsWith(ORIGIN)) {
        problems.push(`${url} does not start with ${ORIGIN}`);
    } else if (!fs.existsSync(path.join(root, url.slice(ORIGIN.length)))) {
        problems.push(`${url} is listed but the file does not exist`);
    }
}
for (const page of listPages()) {
    const html = fs.readFileSync(path.join(root, page), 'utf8');
    const indexable = !isNoIndex(html) && !PARAMETERISED_PAGES.has(page);
    const isListed = listed.includes(ORIGIN + page);
    if (indexable && !isListed) problems.push(`${page} is indexable but missing from sitemap.xml`);
    if (!indexable && isListed) problems.push(`${page} is listed although it is noindex/parameterised`);
}

if (problems.length > 0) {
    for (const problem of problems) console.error(`✗ ${problem}`);
    console.error('\nsitemap.xml and the pages disagree — fix the entries above.');
    process.exit(1);
}

if (check) {
    console.log(`✓ sitemap.xml lists all ${listed.length} indexable pages.`);
    process.exit(0);
}

let updated = 0;
const next = sitemap.replace(
    /(<loc>([^<]+)<\/loc>\s*<lastmod>)([^<]*)(<\/lastmod>)/g,
    (whole, head, url, oldDate, tail) => {
        const date = lastModified(url.slice(ORIGIN.length)) || oldDate;
        if (date !== oldDate) updated++;
        return head + date + tail;
    }
);

if (next === sitemap) {
    console.log('✓ sitemap.xml already up to date.');
} else {
    fs.writeFileSync(sitemapPath, next, 'utf8');
    console.log(`✓ sitemap.xml: <lastmod> refreshed for ${updated} of ${listed.length} pages.`);
}
