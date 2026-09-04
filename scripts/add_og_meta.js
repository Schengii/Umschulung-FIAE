/**
 * @file add_og_meta.js
 * @description Adds missing og:title/og:description/og:image/og:url and
 * twitter:card meta tags to every HTML page that doesn't already declare
 * og:image, deriving title/description from the page's existing <title>
 * and <meta name="description"> tags. Idempotent — running it again on an
 * already-patched file is a no-op.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const targets = [
  path.join(root, 'index.html'),
  ...fs
    .readdirSync(path.join(root, 'pages'))
    .filter((f) => f.endsWith('.html'))
    .map((f) => path.join(root, 'pages', f)),
];

const SITE = 'https://max-schenk.tech';
const DEFAULT_IMAGE = `${SITE}/assets/images/og-cover.png`;

let patched = 0;
let skipped = 0;

for (const file of targets) {
  let html = fs.readFileSync(file, 'utf8');

  if (/property="og:image"/.test(html)) {
    skipped++;
    continue;
  }

  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  const descMatch = html.match(/<meta name="description"\s+content="([^"]*)"/);
  const authorMatch = html.match(/<meta name="author"[^>]*>/);

  if (!titleMatch || !authorMatch) {
    console.warn(`Skipping ${path.relative(root, file)}: missing <title> or author meta anchor`);
    continue;
  }

  const isPagesDir = file.includes(`${path.sep}pages${path.sep}`);
  const rel = isPagesDir ? `pages/${path.basename(file)}` : path.basename(file);
  const ogTitle = titleMatch[1].split(' | ')[0].trim();
  const ogDesc = (descMatch ? descMatch[1] : 'Portfolio von Maximilian Schenk – Fachinformatiker für Anwendungsentwicklung.').replace(
    /"/g,
    '&quot;'
  );

  const ogBlock = `
    <meta property="og:title" content="${ogTitle} — Maximilian Schenk">
    <meta property="og:description" content="${ogDesc}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${SITE}/${rel}">
    <meta property="og:image" content="${DEFAULT_IMAGE}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${ogTitle} — Maximilian Schenk">
    <meta name="twitter:description" content="${ogDesc}">
    <meta name="twitter:image" content="${DEFAULT_IMAGE}">`;

  html = html.replace(authorMatch[0], `${authorMatch[0]}${ogBlock}`);
  fs.writeFileSync(file, html, 'utf8');
  patched++;
  console.log(`Patched ${path.relative(root, file)}`);
}

console.log(`\nDone. Patched ${patched}, already had og:image: ${skipped}.`);
