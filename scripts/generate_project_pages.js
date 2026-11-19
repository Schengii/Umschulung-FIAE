/**
 * @file generate_project_pages.js
 * @description Schreibt je Portfolio-Projekt eine statische, indexierbare Seite
 * `pages/projekt-<slug>.html` aus `assets/data/projects.json` (Plan 2.2, ADR 0018).
 *
 * `projekt-detail.html?repo=…` entsteht erst im Browser und steht deshalb nicht in der Sitemap.
 * Die generierten Seiten tragen Titel, Beschreibung, Bild, JSON-LD und die Links im Quelltext und
 * verweisen für Live-Demo und ähnliche Projekte auf die dynamische Detailseite.
 *
 * Die Seiten sind Ausgabe dieses Skripts und werden nie von Hand bearbeitet: `--check` (Teil von
 * `npm run check-sync`) schlägt fehl, wenn sie von `projects.json` abweichen.
 *
 * Usage:
 *   node scripts/generate_project_pages.js          # Seiten schreiben
 *   node scripts/generate_project_pages.js --check  # Abweichung melden (Exit 1)
 */

const fs = require('fs');
const path = require('path');

const { extractInlineScripts, hashOf } = require('./verify_csp_hashes');

const root = path.resolve(__dirname, '..');
const SITE = 'https://www.max-schenk.tech';
const PAGE_PREFIX = 'projekt-';
const check = process.argv.includes('--check');

/** @param {string} repoName */
function slugFor(repoName) {
    return repoName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/** @param {string} repoName */
const pageNameFor = (repoName) => `${PAGE_PREFIX}${slugFor(repoName)}.html`;

/** Datei- und URL-Name einer generierten Seite? (projekt-detail.html gehört nicht dazu) */
const isGeneratedPage = (/** @type {string} */ name) => name.startsWith(PAGE_PREFIX) && name !== 'projekt-detail.html';

/** @param {unknown} value */
function escapeHtml(value) {
    return String(value ?? '').replace(
        /[&<>"']/g,
        (ch) =>
            /** @type {Record<string, string>} */ ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            })[ch]
    );
}

/** Leerzeichen zusammenziehen und Emoji-Präfix für Title/Meta entfernen. */
const plainTitle = (/** @type {string} */ title) =>
    title
        .replace(/^[^\p{L}\p{N}]+/u, '')
        .replace(/\s+/g, ' ')
        .trim();

/**
 * Nur http(s) und relative Pfade; alles andere verwirft die Seite.
 * @param {string} url
 */
function safeHref(url) {
    if (!url) return '';
    if (/^https?:\/\//i.test(url)) return url;
    if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return '';
    return `../${url.replace(/^\.?\//, '')}`;
}

/**
 * Trägt die Hashes der Inline-Skripte (hier der JSON-LD-Block) in script-src des CSP-<meta> ein, in
 * derselben Form wie `verify_csp_hashes.js --fix`, damit `check-csp` und `--check` übereinstimmen.
 * @param {string} html
 */
function withInlineHashes(html) {
    const hashes = extractInlineScripts(html).map((script) => `'${hashOf(script)}'`);
    if (!hashes.length) return html;
    return html.replace(
        /(<meta http-equiv="Content-Security-Policy" content=")([^"]*)(")/i,
        (_all, open, csp, close) => {
            const match = /script-src([^;]*)/.exec(csp);
            if (!match) return _all;
            const tokens = match[1]
                .trim()
                .split(/\s+/)
                .filter((token) => token && !/^'?sha256-/.test(token));
            const next = ` ${[...tokens.slice(0, 1), ...hashes, ...tokens.slice(1)].join(' ')}`;
            return open + csp.replace(/script-src[^;]*/, `script-src${next}`) + close;
        }
    );
}

/** @param {string} file @returns {Promise<{width: number, height: number} | null>} */
async function imageSize(file) {
    try {
        const sharp = require('sharp');
        const meta = await sharp(path.join(root, file)).metadata();
        return meta.width && meta.height ? { width: meta.width, height: meta.height } : null;
    } catch (_e) {
        return null;
    }
}

/**
 * @param {Record<string, any>} project
 * @param {string} cspMeta
 * @param {{width: number, height: number} | null} size
 */
function renderPage(project, cspMeta, size) {
    const pageName = pageNameFor(project.repoName);
    const url = `${SITE}/pages/${pageName}`;
    const titleDe = plainTitle(project.titleDe);
    const titleEn = plainTitle(project.titleEn);
    const descDe = String(project.descDe || '')
        .replace(/\s+/g, ' ')
        .trim();
    const metaDescription = descDe.length > 160 ? `${descDe.slice(0, 157).replace(/\s+\S*$/, '')} …` : descDe;
    const pageTitle = `${titleDe} – Projekt | Maximilian Schenk`;
    const demo = safeHref(project.link);
    const code = project.githubUrl && /^https?:\/\//i.test(project.githubUrl) ? project.githubUrl : '';
    const image = project.image || project.images?.[0] || '';
    const detail = `projekt-detail.html?repo=${encodeURIComponent(project.repoName)}`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: titleDe,
        alternateName: titleEn,
        description: descDe,
        url,
        inLanguage: ['de', 'en'],
        keywords: (project.tags || []).join(', '),
        dateModified: project.updatedAt,
        author: { '@type': 'Person', name: 'Maximilian Schenk', url: `${SITE}/` },
        ...(image ? { image: `${SITE}/${image}` } : {}),
        ...(code ? { sameAs: [code] } : {}),
    };

    const tags = (project.tags || []).map(
        (/** @type {string} */ tag) => `<span class="tech-tag">${escapeHtml(tag)}</span>`
    );
    const img = image
        ? `<img src="../${escapeHtml(image)}" alt="" class="project-static-image"${
              size ? ` width="${size.width}" height="${size.height}"` : ''
          } loading="lazy">`
        : '';

    const buttons = [
        demo
            ? `<a href="${escapeHtml(demo)}" class="btn-secondary" target="_blank" rel="noopener"><i class="fa fa-external-link" aria-hidden="true"></i> <span lang="de">Live-Demo öffnen</span><span lang="en">Open live demo</span></a>`
            : '',
        code
            ? `<a href="${escapeHtml(code)}" class="btn-secondary" target="_blank" rel="noopener"><i class="fa-brands fa-github" aria-hidden="true"></i> <span lang="de">Quellcode</span><span lang="en">Source code</span></a>`
            : '',
        `<a href="${escapeHtml(detail)}" class="btn-primary"><i class="fa fa-circle-info" aria-hidden="true"></i> <span lang="de">Alle Details und ähnliche Projekte</span><span lang="en">All details and related projects</span></a>`,
    ].filter(Boolean);

    return `<!DOCTYPE html>
<html lang="de">

<head>
    <meta charset="UTF-8">
    ${cspMeta}
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(metaDescription)}">
    <meta name="author" content="Maximilian Schenk">
    <meta property="og:title" content="${escapeHtml(pageTitle)}">
    <meta property="og:description" content="${escapeHtml(metaDescription)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${SITE}/assets/images/og-cover.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}">
    <meta name="twitter:description" content="${escapeHtml(metaDescription)}">
    <meta name="twitter:image" content="${SITE}/assets/images/og-cover.png">
    <link rel="canonical" href="${url}">
    <link rel="alternate" hreflang="de" href="${url}">
    <link rel="alternate" hreflang="en" href="${url}?lang=en">
    <link rel="alternate" hreflang="x-default" href="${url}">
    <link rel="icon" type="image/svg+xml" href="../assets/images/favicon.svg">
    <link rel="preload" href="../assets/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="preload" href="../assets/fonts/outfit-700.woff2" as="font" type="font/woff2" crossorigin>
    <link rel="stylesheet" href="../assets/css/style.css">
    <link rel="stylesheet" href="../assets/vendor/fontawesome/css/all.min.css">
    <link rel="stylesheet" href="../assets/css/projekt-detail.css">
    <link rel="stylesheet" href="../assets/css/print.css" media="print">
    <script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
    </script>
    <script src="../assets/js/constants.js"></script>
    <script src="../assets/js/components.js"></script>
</head>

<body>
    <!-- Generiert von scripts/generate_project_pages.js aus assets/data/projects.json. Nicht von Hand ändern. -->
    <a href="#main-content" class="skip-link">
        <span lang="de">Zum Inhalt springen</span>
        <span lang="en">Skip to content</span>
    </a>

    <div id="site-header"></div>
    <div id="site-nav"></div>

    <main id="main-content" class="main-container">
        <div class="layout-grid">
            <div class="left-col">
                <nav class="breadcrumb" aria-label="Breadcrumb">
                    <ol>
                        <li><a href="portfolio.html"><span lang="de">Portfolio</span><span lang="en">Portfolio</span></a></li>
                        <li aria-current="page"><span lang="de">${escapeHtml(titleDe)}</span><span lang="en">${escapeHtml(titleEn)}</span></li>
                    </ol>
                </nav>
                <article class="card">
                    <h1><span lang="de">${escapeHtml(project.titleDe)}</span><span lang="en">${escapeHtml(project.titleEn)}</span></h1>
                    ${img}
                    <p lang="de">${escapeHtml(project.descDe)}</p>
                    <p lang="en">${escapeHtml(project.descEn)}</p>
                    <p class="project-static-tags">${tags.join(' ')}</p>
                    <div class="project-static-actions">
                        ${buttons.join('\n                        ')}
                    </div>
                </article>
            </div>
        </div>
    </main>

    <div id="site-footer"></div>
</body>
</html>
`;
}

async function main() {
    const projects = JSON.parse(fs.readFileSync(path.join(root, 'assets', 'data', 'projects.json'), 'utf8'));
    const pagesDir = path.join(root, 'pages');

    // Der CSP-<meta> kommt von projekt-detail.html (gleiche Skripte, keine Inline-Skripte); `check-csp:fix`
    // gleicht die Hashes danach für alle Seiten an.
    const detail = fs.readFileSync(path.join(pagesDir, 'projekt-detail.html'), 'utf8');
    const cspMeta = /<meta http-equiv="Content-Security-Policy"[^>]*>/i.exec(detail)?.[0];
    if (!cspMeta) throw new Error('projekt-detail.html hat keinen CSP-<meta>');

    const expected = new Map();
    for (const project of projects) {
        const size = project.image ? await imageSize(project.image) : null;
        expected.set(pageNameFor(project.repoName), withInlineHashes(renderPage(project, cspMeta, size)));
    }

    const existing = fs.readdirSync(pagesDir).filter(isGeneratedPage);
    const stale = existing.filter((name) => !expected.has(name));
    /** @type {string[]} */
    const problems = [];

    for (const [name, html] of expected) {
        const file = path.join(pagesDir, name);
        const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n') : null;
        if (current !== html) {
            if (check) problems.push(`${name} ${current === null ? 'fehlt' : 'weicht von projects.json ab'}`);
            else fs.writeFileSync(file, html);
        }
    }
    for (const name of stale) {
        if (check) problems.push(`${name} gehört zu keinem Projekt mehr`);
        else fs.unlinkSync(path.join(pagesDir, name));
    }

    if (check) {
        if (problems.length) {
            for (const problem of problems) console.error(`✗ ${problem}`);
            console.error('Projektseiten veraltet – `npm run generate-data` ausführen.');
            process.exit(1);
        }
        console.log(`✓ ${expected.size} Projektseiten entsprechen projects.json.`);
    } else {
        console.log(`✓ ${expected.size} Projektseiten geschrieben${stale.length ? `, ${stale.length} entfernt` : ''}.`);
    }
}

if (require.main === module) {
    main().catch((error) => {
        console.error(error);
        process.exit(1);
    });
}

module.exports = { slugFor, pageNameFor, isGeneratedPage, PAGE_PREFIX };
