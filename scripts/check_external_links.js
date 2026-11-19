/**
 * @file check_external_links.js
 * Prüft alle externen http(s)-Links der Seiten (index.html, pages/*.html). Kein CI-Gate, weil
 * fremde Server schwanken: Der wöchentliche Workflow `links.yml` öffnet bei toten Links ein Issue.
 * Aufruf: `node scripts/check_external_links.js [--json <datei>]`. Exit 1 bei toten Links.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TIMEOUT_MS = 15000;
const CONCURRENCY = 6;
// Schließt Seiten aus, die automatisierte Abfragen grundsätzlich ablehnen (liefern 403/999).
const SKIP_HOSTS = ['linkedin.com', 'www.linkedin.com', 'xing.com', 'www.xing.com', 'instagram.com'];

/** @returns {string[]} */
function htmlFiles() {
    const pagesDir = path.join(ROOT, 'pages');
    return [
        path.join(ROOT, 'index.html'),
        ...fs
            .readdirSync(pagesDir)
            .filter((f) => f.endsWith('.html'))
            .map((f) => path.join(pagesDir, f)),
    ];
}

/** @param {string} html @returns {string[]} */
function extractLinks(html) {
    const found = new Set();
    for (const match of html.matchAll(/<a\b[^>]*\bhref="(https?:\/\/[^"#]+)/gi)) found.add(match[1]);
    return [...found];
}

/** @param {string} url @returns {Promise<{ url: string, ok: boolean, status: string }>} */
async function check(url) {
    for (const method of ['HEAD', 'GET']) {
        try {
            const res = await fetch(url, {
                method,
                redirect: 'follow',
                signal: AbortSignal.timeout(TIMEOUT_MS),
                headers: { 'user-agent': 'Mozilla/5.0 (link-check)' },
            });
            if (res.ok) return { url, ok: true, status: String(res.status) };
            if (method === 'GET' || res.status === 404 || res.status === 410)
                return { url, ok: false, status: String(res.status) };
        } catch (error) {
            if (method === 'GET') return { url, ok: false, status: error instanceof Error ? error.name : 'Fehler' };
        }
    }
    return { url, ok: false, status: 'unbekannt' };
}

async function main() {
    /** @type {Map<string, string[]>} */
    const usedIn = new Map();
    for (const file of htmlFiles()) {
        for (const url of extractLinks(fs.readFileSync(file, 'utf8'))) {
            if (SKIP_HOSTS.includes(new URL(url).hostname)) continue;
            usedIn.set(url, [...(usedIn.get(url) || []), path.relative(ROOT, file).split(path.sep).join('/')]);
        }
    }
    const urls = [...usedIn.keys()];
    /** @type {Awaited<ReturnType<typeof check>>[]} */
    const results = [];
    for (let i = 0; i < urls.length; i += CONCURRENCY) {
        results.push(...(await Promise.all(urls.slice(i, i + CONCURRENCY).map(check))));
    }
    const dead = results.filter((r) => !r.ok);
    console.log(`${urls.length} externe Links geprüft, ${dead.length} nicht erreichbar.`);
    const lines = dead.map((r) => `- ${r.url} (${r.status}) in ${usedIn.get(r.url)?.join(', ')}`);
    for (const line of lines) console.log(line);
    const jsonIndex = process.argv.indexOf('--json');
    if (jsonIndex !== -1) fs.writeFileSync(process.argv[jsonIndex + 1], lines.join('\n'));
    process.exit(dead.length ? 1 : 0);
}

main();
