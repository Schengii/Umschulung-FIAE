#!/usr/bin/env node
/**
 * Hält zwei generierte JSON-LD-Blöcke aktuell, damit sie nicht vom sichtbaren Inhalt abweichen:
 *  - `#ld-faq` auf pages/ausbildungsablauf.html (FAQPage, aus den `.faq-item`-Einträgen, nur Deutsch)
 *  - `#ld-projects` auf pages/portfolio.html (ItemList, aus assets/data/projects.json)
 *
 * Aufruf: node scripts/sync_structured_data.js [--check]
 * Danach `npm run check-csp:fix`, weil die Inline-Skripte per CSP-Hash freigegeben sind.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SITE = 'https://www.max-schenk.tech';

/** @param {string} html */
function textOf(html) {
    return html
        .replace(/<[^>]+>/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Liest die FAQ-Einträge (deutscher Text) aus dem Seitenquelltext.
 * @param {string} html
 * @returns {{ question: string, answer: string }[]}
 */
function extractFaq(html) {
    const items = [];
    const re =
        /<div class="faq-item">([\s\S]*?)<div class="faq-panel"([\s\S]*?)(?=<div class="faq-item">|<\/div>\s*<\/div>\s*<\/section>)/g;
    let m;
    while ((m = re.exec(html))) {
        const q = m[1].match(/<span lang="de">([\s\S]*?)<\/span>/);
        const answers = [...m[2].matchAll(/<p lang="de">([\s\S]*?)<\/p>/g)].map((a) => textOf(a[1]));
        if (q && answers.length) items.push({ question: textOf(q[1]), answer: answers.join(' ') });
    }
    return items;
}

/** @param {{ question: string, answer: string }[]} items */
function buildFaqJsonLd(items) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        inLanguage: 'de',
        mainEntity: items.map((i) => ({
            '@type': 'Question',
            name: i.question,
            acceptedAnswer: { '@type': 'Answer', text: i.answer },
        })),
    };
}

/** @param {{ repoName: string, titleDe: string, descDe?: string }[]} projects */
function buildProjectsJsonLd(projects) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Projekte von Maximilian Schenk',
        numberOfItems: projects.length,
        itemListElement: projects.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.titleDe,
            url: `${SITE}/pages/projekt-detail.html?repo=${encodeURIComponent(p.repoName)}`,
        })),
    };
}

/**
 * Setzt den Block mit der gegebenen id (legt ihn nach dem letzten JSON-LD-Block an, falls er fehlt).
 * @param {string} html
 * @param {string} id
 * @param {object} data
 * @returns {string}
 */
function upsertJsonLd(html, id, data) {
    const crlf = html.includes('\r\n');
    const lf = html.replace(/\r\n/g, '\n');
    const body = JSON.stringify(data, null, 4)
        .split('\n')
        .map((l) => `    ${l}`)
        .join('\n');
    const block = `<script type="application/ld+json" id="${id}">\n${body}\n    </script>`;
    const existing = new RegExp(`<script type="application/ld\\+json" id="${id}">[\\s\\S]*?</script>`);
    let out;
    if (existing.test(lf)) {
        out = lf.replace(existing, () => block);
    } else {
        const all = [...lf.matchAll(/<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g)];
        if (all.length) {
            const last = all[all.length - 1];
            const end = last.index + last[0].length;
            out = `${lf.slice(0, end)}\n    ${block}${lf.slice(end)}`;
        } else {
            const headEnd = lf.indexOf('</head>');
            if (headEnd < 0) throw new Error(`Kein <head> zum Einfügen von ${id} gefunden`);
            out = `${lf.slice(0, headEnd)}    ${block}\n${lf.slice(headEnd)}`;
        }
    }
    return crlf ? out.replace(/\n/g, '\r\n') : out;
}

function main() {
    const check = process.argv.includes('--check');
    const faqFile = path.join(ROOT, 'pages', 'ausbildungsablauf.html');
    const portfolioFile = path.join(ROOT, 'pages', 'portfolio.html');
    const projects = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'data', 'projects.json'), 'utf8'));

    const faqHtml = fs.readFileSync(faqFile, 'utf8');
    const faq = extractFaq(faqHtml);
    if (!faq.length) throw new Error('Keine FAQ-Einträge in ausbildungsablauf.html gefunden');

    /** @type {{ file: string, html: string, id: string, data: object }[]} */
    const jobs = [
        { file: faqFile, html: faqHtml, id: 'ld-faq', data: buildFaqJsonLd(faq) },
        {
            file: portfolioFile,
            html: fs.readFileSync(portfolioFile, 'utf8'),
            id: 'ld-projects',
            data: buildProjectsJsonLd(projects),
        },
    ];
    let stale = 0;
    for (const { file, html, id, data } of jobs) {
        const next = upsertJsonLd(html, id, data);
        if (next === html) continue;
        stale++;
        if (check) console.error(`✗ ${path.relative(ROOT, file)}: #${id} ist veraltet (npm run sync-structured-data)`);
        else fs.writeFileSync(file, next);
    }
    if (check && stale) process.exit(1);
    console.log(check ? 'Strukturierte Daten: aktuell' : `Strukturierte Daten: ${stale} Datei(en) aktualisiert`);
}

if (require.main === module) main();

module.exports = { extractFaq, buildFaqJsonLd, buildProjectsJsonLd, upsertJsonLd };
