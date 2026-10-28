/**
 * @file build_search_index.js
 * @description Builds assets/data/search-index.json: the headings of every content page with
 * their German and English text and, where there is one, the anchor of the section. The command
 * palette (Ctrl+K) searches it, so learning content is found by its heading and not only by the
 * page title. The index is generated, never edited by hand; `--check` fails when it is stale.
 *
 * Usage: node scripts/build_search_index.js [--check]
 */

const fs = require('fs');
const path = require('path');
const { Window } = require('happy-dom');

const root = path.resolve(__dirname, '..');
const OUTPUT = path.join(root, 'assets', 'data', 'search-index.json');

/** Pages without searchable content: fallbacks and pages whose content comes from data. */
const SKIPPED_PAGES = new Set(['offline.html', '404.html', 'projekt-detail.html']);

/** Headings inside these are navigation or overlays, not page content. */
const IGNORED_ANCESTORS = 'nav, header, footer, dialog, [hidden], .modal, [role="dialog"], #site-header, #site-footer';

const MAX_HEADINGS_PER_PAGE = 40;

/** Ids that wrap the whole page and say nothing about a section. */
const GENERIC_IDS = new Set(['main-content', 'main', 'content', 'app']);

/** @param {string} text */
const clean = (text) => text.replace(/\s+/g, ' ').trim();

/**
 * Text of an element in one language: the lang-tagged parts if there are any, else everything.
 * @param {import('happy-dom').Element} element
 * @param {'de' | 'en'} lang
 */
function textInLanguage(element, lang) {
    if (element.getAttribute('lang') === lang) return clean(element.textContent || '');
    const tagged = [...element.querySelectorAll(`[lang="${lang}"]`)];
    if (tagged.length > 0) return clean(tagged.map((part) => part.textContent || '').join(' '));
    // Only the other language is tagged: nothing to show in this one.
    if (element.querySelector('[lang]')) return '';
    return clean(element.textContent || '');
}

/**
 * German and English text of an element. A `lang="de"` element takes the text of its `lang="en"`
 * sibling of the same tag as the English version; otherwise the lang-tagged parts are used.
 * @param {import('happy-dom').Element} element
 * @returns {{de: string, en: string}}
 */
function bilingualText(element) {
    let de = textInLanguage(element, 'de');
    let en = textInLanguage(element, 'en');
    if (element.getAttribute('lang') === 'de') {
        const twin = [...(element.parentElement?.children ?? [])].find(
            (sibling) => sibling.tagName === element.tagName && sibling.getAttribute('lang') === 'en'
        );
        en = twin ? clean(twin.textContent || '') : de;
    }
    de = de || en;
    en = en || de;
    return { de, en };
}

/**
 * @param {import('happy-dom').Element} heading
 * @returns {string} id of the heading or of the section around it, '' if there is none
 */
function anchorOf(heading) {
    if (heading.id) return heading.id;
    for (let node = heading.parentElement; node; node = node.parentElement) {
        if (node.id && !GENERIC_IDS.has(node.id)) return node.id;
        if (node.tagName === 'MAIN' || node.tagName === 'BODY') break;
    }
    return '';
}

/**
 * Headings of one page.
 * @param {string} html
 * @returns {{title: {de: string, en: string}, headings: {id: string, de: string, en: string}[]}}
 */
function extractPage(html) {
    const window = new Window();
    window.document.write(html);
    const document = window.document;

    // "Seitentitel | Maximilian Schenk": the site name is the same on every page and no help in a search.
    const titleText = clean(document.querySelector('title')?.textContent || '').replace(
        /\s*\|\s*Maximilian Schenk$/,
        ''
    );
    const h1 = document.querySelector('main h1, h1');
    const h1Text = h1 ? bilingualText(h1) : { de: '', en: '' };
    const title = { de: h1Text.de || titleText, en: h1Text.en || titleText };

    const root = document.querySelector('main') || document.body;
    const seen = new Set();
    /** @type {{id: string, de: string, en: string}[]} */
    const headings = [];
    for (const heading of root.querySelectorAll('h2, h3')) {
        if (heading.closest(IGNORED_ANCESTORS)) continue;
        // The English twin of a `<h2 lang="de">` is read together with it.
        if (heading.getAttribute('lang') === 'en') {
            const hasGerman = [...(heading.parentElement?.children ?? [])].some(
                (sibling) => sibling.tagName === heading.tagName && sibling.getAttribute('lang') === 'de'
            );
            if (hasGerman) continue;
        }
        const { de, en } = bilingualText(heading);
        if (!de && !en) continue;
        const key = `${de}|${en}`;
        if (seen.has(key)) continue;
        seen.add(key);
        headings.push({ id: anchorOf(heading), de, en });
        if (headings.length >= MAX_HEADINGS_PER_PAGE) break;
    }
    window.close();
    return { title, headings };
}

/**
 * The whole index for a set of pages.
 * @param {Record<string, string>} pages file name -> html
 */
function buildIndex(pages) {
    /** @type {{p: string, t: {de: string, en: string}, h: {id: string, de: string, en: string}[]}[]} */
    const entries = [];
    for (const name of Object.keys(pages).sort()) {
        if (SKIPPED_PAGES.has(name)) continue;
        const { title, headings } = extractPage(pages[name]);
        if (headings.length === 0) continue;
        entries.push({ p: name, t: title, h: headings });
    }
    return entries;
}

function readPages() {
    const dir = path.join(root, 'pages');
    /** @type {Record<string, string>} */
    const pages = {};
    for (const name of fs.readdirSync(dir)) {
        if (name.endsWith('.html')) pages[name] = fs.readFileSync(path.join(dir, name), 'utf8');
    }
    return pages;
}

function main() {
    const json = JSON.stringify(buildIndex(readPages())) + '\n';
    if (process.argv.includes('--check')) {
        const current = fs.existsSync(OUTPUT) ? fs.readFileSync(OUTPUT, 'utf8') : '';
        if (current !== json) {
            console.error('✗ assets/data/search-index.json is out of date. Run: npm run build-search-index');
            process.exit(1);
        }
        console.log('✅ Search index is up to date.');
        return;
    }
    fs.writeFileSync(OUTPUT, json);
    console.log(`✓ Wrote ${path.relative(root, OUTPUT)} (${(json.length / 1024).toFixed(1)} KB).`);
}

if (require.main === module) main();

module.exports = { extractPage, buildIndex };
