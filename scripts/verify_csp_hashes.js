/**
 * @file verify_csp_hashes.js
 * @description Closes the gap flagged in docs/adr/0003-zweischichtige-csp-strategie.md:
 * check_head_consistency.js only verifies that a page-level CSP meta tag is
 * PRESENT, never that its 'sha256-...' script-src hashes actually match the
 * current inline <script> content. A stale hash silently blocks that script
 * at runtime with no CI failure. This script recomputes the real hash of
 * every inline (src-less) <script> element and compares it against the
 * hashes listed in that page's CSP meta tag.
 *
 * Pages whose CSP declares 'unsafe-inline' for script-src are skipped, since
 * inline scripts there are allowed regardless of hash (see playground.html).
 *
 * Usage:
 *   node scripts/verify_csp_hashes.js          # check only, exits 1 on drift
 *   node scripts/verify_csp_hashes.js --fix    # rewrites stale hashes in place
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const pagesDir = path.join(root, 'pages');
const fix = process.argv.includes('--fix');

const files = [
    path.join(root, 'index.html'),
    path.join(root, '404.html'),
    ...fs
        .readdirSync(pagesDir)
        .filter((f) => f.endsWith('.html'))
        .map((f) => path.join(pagesDir, f)),
];

/** @param {string} html */
function extractInlineScripts(html) {
    const scripts = [];
    const re = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = re.exec(html))) {
        const attrs = m[1] || '';
        if (/\bsrc\s*=/i.test(attrs)) continue;
        scripts.push(m[2]);
    }
    return scripts;
}

// Hash the LF form: the deployed files (Vercel/CI checkout) use LF line endings,
// so a CRLF working copy on Windows must not produce a different hash.
/** @param {string} content */
function hashOf(content) {
    const normalized = content.replace(/\r\n/g, '\n');
    return 'sha256-' + crypto.createHash('sha256').update(normalized, 'utf8').digest('base64');
}

function verifyCspHashes({ files: targetFiles = files, fix: shouldFix = fix } = {}) {
    let hadFailure = false;
    let fixedCount = 0;

    for (const file of targetFiles) {
        const html = fs.readFileSync(file, 'utf8');
        const rel = path.relative(root, file);

        const cspMatch = html.match(/(<meta http-equiv="Content-Security-Policy" content=")([^"]*)(")/i);
        if (!cspMatch) continue; // absence is already caught by check_head_consistency.js

        const cspContent = cspMatch[2];
        if (/'unsafe-inline'/.test(cspContent) && /script-src[^;]*'unsafe-inline'/.test(cspContent)) {
            continue; // inline scripts allowed unconditionally here
        }

        const inlineScripts = extractInlineScripts(html);
        if (inlineScripts.length === 0) continue;

        const requiredHashes = inlineScripts.map(hashOf);
        // Must match the QUOTED form ('sha256-...') — CSP requires the quotes to
        // treat this as a hash-source at all; an unquoted sha256-... token is
        // silently rejected as invalid by the browser, so matching the bare
        // digest here would wrongly report a fix as complete.
        const presentHashes = [...cspContent.matchAll(/'(sha256-[A-Za-z0-9+/=]+)'/g)].map((m) => m[1]);

        const missing = requiredHashes.filter((h) => !presentHashes.includes(h));
        const stale = presentHashes.filter((h) => !requiredHashes.includes(h));

        if (missing.length === 0 && stale.length === 0) continue;

        hadFailure = true;
        console.error(`✗ ${rel}: CSP script-src hash drift`);
        if (missing.length) console.error(`    missing (needed by current inline scripts): ${missing.join(', ')}`);
        if (stale.length) console.error(`    stale (no longer matches any inline script): ${stale.join(', ')}`);

        if (shouldFix) {
            const scriptSrcMatch = cspContent.match(/script-src([^;]*)/);
            if (!scriptSrcMatch) {
                console.error(`    cannot auto-fix ${rel}: no script-src directive found`);
                continue;
            }
            const tokens = scriptSrcMatch[1].trim().split(/\s+/).filter(Boolean);
            const nonHashTokens = tokens.filter((t) => !/^'?sha256-/.test(t));
            const quotedHashes = requiredHashes.map((h) => `'${h}'`);
            const newScriptSrc = ` ${[...nonHashTokens.slice(0, 1), ...quotedHashes, ...nonHashTokens.slice(1)].join(' ')}`;
            const newCspContent = cspContent.replace(/script-src[^;]*/, `script-src${newScriptSrc}`);
            const newHtml = html.replace(cspMatch[0], cspMatch[1] + newCspContent + cspMatch[3]);
            fs.writeFileSync(file, newHtml, 'utf8');
            fixedCount++;
            console.error(`    fixed: wrote ${requiredHashes.length} current hash(es)`);
        }
    }

    return { hadFailure, fixedCount, pageCount: targetFiles.length };
}

const vercelPath = path.join(root, 'vercel.json');
// Header rule for the site itself: everything except the playground and the demo builds.
const SITE_HEADER_SOURCE = '/((?!pages/playground\\.html|Projekte/).*)';

/**
 * Union of the script hashes of all pages whose meta CSP does not allow inline scripts anyway.
 * The HTTP header carries exactly this set, so it allows every inline script the pages
 * legitimately contain and nothing else (ADR 0003, update 2026-11-18).
 * @param {string[]} [targetFiles]
 * @returns {string[]} sorted, unique `sha256-...` values
 */
function collectSiteHashes(targetFiles = files) {
    const hashes = new Set();
    for (const file of targetFiles) {
        const html = fs.readFileSync(file, 'utf8');
        const csp = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]*)"/i);
        if (csp && /script-src[^;]*'unsafe-inline'/.test(csp[1])) continue;
        for (const script of extractInlineScripts(html)) hashes.add(hashOf(script));
    }
    return [...hashes].sort();
}

/**
 * script-src of the site header: 'self' plus the hashes, without 'unsafe-inline'.
 * @param {string} headerValue current CSP header value
 * @param {string[]} hashes
 * @returns {string}
 */
function withScriptHashes(headerValue, hashes) {
    const scriptSrc = `script-src 'self' ${hashes.map((h) => `'${h}'`).join(' ')}`;
    return headerValue.replace(/script-src[^;]*/, scriptSrc);
}

/**
 * Checks (and with fix rewrites) the CSP header of the site rule in vercel.json.
 * @param {{ fix?: boolean, targetFiles?: string[] }} [options]
 * @returns {{ ok: boolean, message: string }}
 */
function verifyHeaderCsp({ fix: shouldFix = false, targetFiles = files } = {}) {
    const config = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
    const rule = config.headers.find((/** @type {any} */ r) => r.source === SITE_HEADER_SOURCE);
    const header = rule && rule.headers.find((/** @type {any} */ h) => h.key === 'Content-Security-Policy');
    if (!header) return { ok: false, message: `vercel.json: no CSP header rule for ${SITE_HEADER_SOURCE}` };
    const expected = withScriptHashes(header.value, collectSiteHashes(targetFiles));
    if (header.value === expected) return { ok: true, message: 'vercel.json header CSP matches the page hashes.' };
    if (!shouldFix) return { ok: false, message: 'vercel.json header CSP is out of date (run check-csp:fix).' };
    header.value = expected;
    fs.writeFileSync(vercelPath, JSON.stringify(config, null, 2) + '\n');
    return { ok: true, message: 'vercel.json header CSP updated.' };
}

module.exports = {
    extractInlineScripts,
    collectSiteHashes,
    withScriptHashes,
    verifyHeaderCsp,
    hashOf,
    verifyCspHashes,
};

if (require.main === module) {
    const { hadFailure, fixedCount, pageCount } = verifyCspHashes();
    const header = verifyHeaderCsp({ fix });

    if (fix) {
        console.log(`\n${fixedCount} file(s) updated. ${header.message}`);
        process.exit(0);
    }

    if (!header.ok) {
        console.error(`✗ ${header.message}`);
        process.exit(1);
    }

    if (hadFailure) {
        console.error('\nCSP hash verification failed — run `node scripts/verify_csp_hashes.js --fix` to repair.');
        process.exit(1);
    } else {
        console.log(`✓ CSP script-src hashes match current inline scripts across ${pageCount} pages.`);
    }
}
