/**
 * @file subset_fontawesome.js
 * @description The site shipped the complete Font Awesome Free distribution (103 KB CSS and
 * ~300 KB WOFF2 for ~2000 icons) although it uses roughly a tenth of them. This script
 * builds the deployed copy under assets/vendor/fontawesome/ from the pinned npm package
 * (@fortawesome/fontawesome-free, a devDependency) and keeps only what is referenced:
 *
 *   - CSS: every non-icon rule is kept as is (sizing, animation, utility classes); of the
 *     `.fa-name:before{content:"…"}` rules only the selectors that occur in the scanned
 *     sources survive. `@font-face` is reduced to WOFF2, the Font Awesome 4 compatibility
 *     faces are dropped.
 *   - Fonts: solid, regular and brands are subset to the code points of those icons.
 *
 * The deployed paths stay the same as before (css/all.min.css, webfonts/fa-*.woff2): pages
 * under Projekte/ that are overwritten by the weekly sync link to them as well.
 *
 * An icon that is used but not part of the subset simply renders as an empty box, so
 * `--check` is a CI gate: it fails when the committed CSS no longer matches the sources.
 *
 * Usage:
 *   node scripts/subset_fontawesome.js          # regenerate CSS + fonts
 *   node scripts/subset_fontawesome.js --check  # exits 1 if the committed subset is stale
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'node_modules', '@fortawesome', 'fontawesome-free');
const targetDir = path.join(root, 'assets', 'vendor', 'fontawesome');
const targetCss = path.join(targetDir, 'css', 'all.min.css');
const check = process.argv.includes('--check');

const FONT_FILES = ['fa-solid-900.woff2', 'fa-regular-400.woff2', 'fa-brands-400.woff2'];
const SKIP_DIR_NAMES = new Set(['node_modules', '.git', 'dist', '.vite']);
const isTestFile = (f) => /\.(test|spec)\.js$/.test(f);

function walk(dir, extensions, out = []) {
    if (!fs.existsSync(dir)) return out;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (!SKIP_DIR_NAMES.has(entry.name)) walk(full, extensions, out);
        } else if (extensions.includes(path.extname(entry.name))) {
            out.push(full);
        }
    }
    return out;
}

/**
 * Everything that can put an icon class on a page that loads the root vendor copy: the
 * pages themselves, the scripts and data they render from, and the stand-alone pages under
 * Projekte/ that link to ../assets/vendor/fontawesome/ instead of bringing their own copy.
 */
function collectSourceFiles() {
    const files = [
        path.join(root, 'index.html'),
        path.join(root, '404.html'),
        ...walk(path.join(root, 'pages'), ['.html']),
        ...walk(path.join(root, 'assets', 'js'), ['.js']).filter((f) => !isTestFile(f)),
        ...walk(path.join(root, 'assets', 'data'), ['.json']),
    ];
    const linksRootVendor = /(\.\.\/)+assets\/vendor\/fontawesome\//;
    for (const file of walk(path.join(root, 'Projekte'), ['.html'])) {
        if (linksRootVendor.test(fs.readFileSync(file, 'utf8'))) files.push(file);
    }
    return files.sort();
}

/** Splits a stylesheet into its top-level comments and rules (at-rules stay one block). */
function splitTopLevel(css) {
    const blocks = [];
    let i = 0;
    while (i < css.length) {
        if (/\s/.test(css[i])) {
            i++;
            continue;
        }
        if (css.startsWith('/*', i)) {
            const end = css.indexOf('*/', i + 2) + 2;
            blocks.push({ type: 'comment', text: css.slice(i, end) });
            i = end;
            continue;
        }
        const start = i;
        let depth = 0;
        let quote = '';
        for (; i < css.length; i++) {
            const ch = css[i];
            if (quote) {
                if (ch === '\\') i++;
                else if (ch === quote) quote = '';
            } else if (ch === '"' || ch === "'") {
                quote = ch;
            } else if (ch === '{') {
                depth++;
            } else if (ch === '}' && --depth === 0) {
                i++;
                break;
            }
        }
        const text = css.slice(start, i);
        const brace = text.indexOf('{');
        blocks.push({ type: 'rule', prelude: text.slice(0, brace).trim(), body: text.slice(brace + 1, -1), text });
    }
    return blocks;
}

/** Resolves CSS escapes (`\f015`, `\30 `) in the value of a `content` string. */
function decodeCssString(value) {
    let out = '';
    for (let i = 0; i < value.length; i++) {
        if (value[i] !== '\\') {
            out += value[i];
            continue;
        }
        const hex = /^[0-9a-fA-F]{1,6}/.exec(value.slice(i + 1));
        if (hex) {
            out += String.fromCodePoint(parseInt(hex[0], 16));
            i += hex[0].length;
            if (value[i + 1] === ' ') i++;
        } else {
            out += value[i + 1];
            i++;
        }
    }
    return out;
}

const ICON_SELECTOR = /^\.(fa-[a-z0-9-]+):{1,2}before$/;
const ICON_BODY = /^content:"((?:[^"\\]|\\.)*)";?$/;

/** @returns {{names: string[], glyph: string} | null} the icon names a rule defines, if it is an icon rule */
function parseIconRule(block) {
    if (block.type !== 'rule') return null;
    const body = ICON_BODY.exec(block.body.trim());
    if (!body) return null;
    const names = [];
    for (const selector of block.prelude.split(',')) {
        const match = ICON_SELECTOR.exec(selector.trim());
        if (!match) return null;
        names.push(match[1]);
    }
    return { names, glyph: decodeCssString(body[1]) };
}

function rewriteFontFace(block) {
    const family = /font-family:"([^"]+)"/.exec(block.body)?.[1];
    // "FontAwesome" is the Font Awesome 4 family name; nothing here uses the v4 class names.
    if (family === 'FontAwesome') return null;
    const body = block.body.replace(/src:[^;}]+/, (src) => {
        const woff2 = /url\([^)]+\.woff2\) format\("woff2"\)/.exec(src);
        if (!woff2) throw new Error(`@font-face for "${family}" has no WOFF2 source`);
        return `src:${woff2[0]}`;
    });
    return `@font-face{${body}}`;
}

function buildSubset() {
    if (!fs.existsSync(sourceDir)) {
        throw new Error('@fortawesome/fontawesome-free is not installed — run `npm ci` first.');
    }
    const version = require(path.join(sourceDir, 'package.json')).version;
    const blocks = splitTopLevel(fs.readFileSync(path.join(sourceDir, 'css', 'all.min.css'), 'utf8'));

    const defined = new Set();
    for (const block of blocks) parseIconRule(block)?.names.forEach((name) => defined.add(name));

    // An icon name assembled at runtime (`fa-${name}`) never appears literally in the
    // sources, so it would silently fall out of the subset.
    const dynamicName = /fa-\$\{|(['"`])fa-\1\s*\+/;
    const used = new Set();
    const dynamic = [];
    const sourceFiles = collectSourceFiles();
    for (const file of sourceFiles) {
        const text = fs.readFileSync(file, 'utf8');
        for (const token of text.match(/fa-[a-z0-9]+(?:-[a-z0-9]+)*/g) || []) {
            if (defined.has(token)) used.add(token);
        }
        if (dynamicName.test(text)) dynamic.push(path.relative(root, file));
    }

    const out = [];
    let glyphs = '';
    for (const block of blocks) {
        if (block.type === 'comment') continue;
        if (block.prelude === '@font-face') {
            const fontFace = rewriteFontFace(block);
            if (fontFace) out.push(fontFace);
            continue;
        }
        const icon = parseIconRule(block);
        if (!icon) {
            out.push(block.text);
            continue;
        }
        const kept = icon.names.filter((name) => used.has(name));
        if (kept.length === 0) continue;
        out.push(`${kept.map((name) => `.${name}:before`).join(',')}{${block.body}}`);
        glyphs += icon.glyph;
    }

    const header = [
        '/*!',
        ` * Font Awesome Free ${version} by @fontawesome - https://fontawesome.com`,
        ' * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)',
        ' * Copyright 2024 Fonticons, Inc.',
        ' *',
        ` * GENERATED SUBSET (${used.size} of ${defined.size} icon names) - do not edit.`,
        ' * Built by scripts/subset_fontawesome.js from the npm package; a new icon only shows up',
        ' * after `npm run subset-icons`.',
        ' */',
    ].join('\n');

    return {
        css: `${header}\n${out.join('')}\n`,
        glyphs: [...new Set(glyphs)].sort().join(''),
        used,
        defined,
        dynamic,
        sourceFiles,
    };
}

const normalise = (text) => text.replace(/\r\n/g, '\n');

async function run() {
    const subset = buildSubset();

    if (subset.dynamic.length > 0) {
        console.error('✗ Icon names are composed at runtime and cannot be subset safely:');
        for (const file of subset.dynamic) console.error(`    ${file}`);
        console.error('  Write the complete class names (e.g. a lookup table) instead.');
        process.exit(1);
    }

    if (check) {
        const problems = [];
        if (!fs.existsSync(targetCss) || normalise(fs.readFileSync(targetCss, 'utf8')) !== subset.css) {
            problems.push('assets/vendor/fontawesome/css/all.min.css does not match the icons in use');
        }
        for (const font of FONT_FILES) {
            if (!fs.existsSync(path.join(targetDir, 'webfonts', font))) problems.push(`webfonts/${font} is missing`);
        }
        if (problems.length > 0) {
            for (const problem of problems) console.error(`✗ ${problem}`);
            console.error('\nFont Awesome subset is out of date — run `npm run subset-icons`.');
            process.exit(1);
        }
        console.log(`✓ Font Awesome subset is up to date (${subset.used.size} icon names).`);
        return;
    }

    const subsetFont = require('subset-font');
    fs.mkdirSync(path.join(targetDir, 'css'), { recursive: true });
    fs.mkdirSync(path.join(targetDir, 'webfonts'), { recursive: true });
    fs.writeFileSync(targetCss, subset.css, 'utf8');

    let fontBytes = 0;
    for (const font of FONT_FILES) {
        const source = fs.readFileSync(path.join(sourceDir, 'webfonts', font));
        const result = await subsetFont(source, subset.glyphs, { targetFormat: 'woff2' });
        const target = path.join(targetDir, 'webfonts', font);
        // Leave an unchanged font alone, so regenerating does not touch files for nothing.
        if (!fs.existsSync(target) || !fs.readFileSync(target).equals(result)) fs.writeFileSync(target, result);
        fontBytes += result.length;
    }

    const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
    console.log(
        `✓ Font Awesome subset written: ${subset.used.size} of ${subset.defined.size} icon names ` +
            `from ${subset.sourceFiles.length} files, CSS ${kb(Buffer.byteLength(subset.css))}, fonts ${kb(fontBytes)}.`
    );
}

run().catch((error) => {
    console.error(`✗ ${error.message}`);
    process.exit(1);
});
