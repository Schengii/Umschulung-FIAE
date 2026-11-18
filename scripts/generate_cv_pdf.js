#!/usr/bin/env node
/**
 * Erzeugt die Lebenslauf-PDF aus pages/lebenslauf.html (Druckansicht, print.css), damit PDF und
 * Seite denselben Stand zeigen. Setzt vorher das Stand-Datum auf der Seite auf heute.
 *
 * Aufruf: node scripts/generate_cv_pdf.js [--out <datei>]   (Standard: assets/pdf/Lebenslauf.pdf)
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const PAGE = path.join(ROOT, 'pages', 'lebenslauf.html');

/**
 * Ersetzt das Datum der beiden `.cv-stand-date`-Elemente.
 * @param {string} html
 * @param {Date} date
 * @returns {string}
 */
function setStandDate(html, date) {
    const iso = date.toISOString().slice(0, 10);
    const [y, m, d] = iso.split('-');
    /** @type {Record<string, string>} */
    const text = { de: `${d}.${m}.${y}`, en: `${m}/${d}/${y}` };
    return html.replace(
        /(<time class="cv-stand-date" data-format="(de|en)" datetime=")[^"]*(">)[^<]*(<\/time>)/g,
        (_, head, lang, mid, tail) => `${head}${iso}${mid}${text[lang]}${tail}`
    );
}

async function main() {
    const outIndex = process.argv.indexOf('--out');
    const out = path.resolve(
        outIndex > -1 ? process.argv[outIndex + 1] : path.join(ROOT, 'assets', 'pdf', 'Lebenslauf.pdf')
    );

    const html = fs.readFileSync(PAGE, 'utf8');
    const updated = setStandDate(html, new Date());
    if (updated !== html) fs.writeFileSync(PAGE, updated);

    // The page needs its ES modules, which browsers do not load from file://: serve the repo locally.
    /** @type {Record<string, string>} */
    const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' };
    const server = http.createServer((req, res) => {
        const file = path.join(ROOT, decodeURIComponent(new URL(req.url || '/', 'http://x').pathname));
        if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
            res.writeHead(404).end();
            return;
        }
        res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
        fs.createReadStream(file).pipe(res);
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(undefined)));
    const { port } = /** @type {import('net').AddressInfo} */ (server.address());

    const { chromium } = require('@playwright/test');
    const browser = await chromium.launch();
    try {
        const page = await browser.newPage({ colorScheme: 'light' });
        await page.goto(`http://127.0.0.1:${port}/pages/lebenslauf.html`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.emulateMedia({ media: 'print' });
        await page.pdf({ path: out, format: 'A4', printBackground: true, preferCSSPageSize: true });
    } finally {
        await browser.close();
        server.close();
    }
    console.log(`Lebenslauf-PDF geschrieben: ${path.relative(ROOT, out)}`);
}

if (require.main === module) {
    main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}

module.exports = { setStandDate };
