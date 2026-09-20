/**
 * @file generate_sw_assets.js
 * @description sw.js used to hand-maintain its ~150-entry precache ASSETS
 * list. That already drifted in practice (assets/js/modules/event-bus.js
 * was added to the codebase but never added to the list, so it was never
 * precached and would only load online). This script generates the list by
 * globbing the actual HTML/CSS/JS/font/vendor files, so a new file is
 * precached automatically the next time this runs. Images are the one
 * deliberate exception: assets/images/ holds ~3.6MB of screenshots that
 * should NOT all be precached, so that subset stays a curated constant.
 *
 * Usage:
 *   node scripts/generate_sw_assets.js          # writes the regenerated list into sw.js
 *   node scripts/generate_sw_assets.js --check  # exits 1 if sw.js's list is out of date
 */

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const swPath = path.join(root, 'sw.js');
const check = process.argv.includes('--check');

function toPosix(p) {
    return p.split(path.sep).join('/');
}

function listFiles(dir, { recursive = false, extensions = [] } = {}) {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) return [];
    const entries = fs.readdirSync(abs, { withFileTypes: true });
    let out = [];
    for (const entry of entries) {
        const rel = toPosix(path.join(dir, entry.name));
        if (entry.isDirectory()) {
            if (recursive) out = out.concat(listFiles(rel, { recursive, extensions }));
            continue;
        }
        if (extensions.length && !extensions.some((ext) => entry.name.endsWith(ext))) continue;
        out.push(rel);
    }
    return out;
}

// Test/spec files live alongside their modules but must never ship to production.
const isTestFile = (f) => /\.(test|spec)\.js$/.test(f);

const pages = listFiles('pages', { extensions: ['.html'] }).sort();

const css = listFiles('assets/css', { recursive: true, extensions: ['.css'] }).sort();

const coreJs = listFiles('assets/js', { extensions: ['.js'] }).sort();

const modulesJs = listFiles('assets/js/modules', { extensions: ['.js'] })
    .filter((f) => !isTestFile(f))
    .sort();

const fonts = listFiles('assets/fonts', { extensions: ['.woff2'] }).sort();

const vendorFontawesome = [
    'assets/vendor/fontawesome/css/all.min.css',
    ...listFiles('assets/vendor/fontawesome/webfonts', { extensions: ['.woff2'] }).sort(),
];

// Curated on purpose: assets/images/ contains ~50 large project screenshots
// that should stay lazy-loaded, not precached. Only these are essential for
// the app shell (favicon, portrait, PWA icons, hero images used on load).
const ESSENTIAL_IMAGES = [
    'assets/images/favicon.svg',
    'assets/images/maximilian_schenk_portrait.jpg',
    'assets/images/BFW_Fahnen_Panorama.jpg',
    'assets/images/BFW_Fahnen_Panorama.webp',
    'assets/images/it_workspace.webp',
    'assets/images/icon-192.png',
    'assets/images/icon-512.png',
    'assets/images/icon-192-maskable.png',
    'assets/images/icon-512-maskable.png',
];

function buildAssetsBlock(eol) {
    const lines = [];
    lines.push("    './',");
    lines.push("    'index.html',");
    lines.push("    '404.html',");
    for (const p of pages) lines.push(`    '${p}',`);
    lines.push('    // CSS');
    for (const c of css) lines.push(`    '${c}',`);
    lines.push('    // Core JS');
    for (const j of coreJs) lines.push(`    '${j}',`);
    lines.push('    // Modules');
    for (const j of modulesJs) lines.push(`    '${j}',`);
    lines.push('    // Local Fonts & Vendor');
    for (const f of fonts) lines.push(`    '${f}',`);
    for (const v of vendorFontawesome) lines.push(`    '${v}',`);
    lines.push('    // Essential Images');
    ESSENTIAL_IMAGES.forEach((img, i) => {
        lines.push(`    '${img}'${i === ESSENTIAL_IMAGES.length - 1 ? '' : ','}`);
    });
    return lines.join(eol);
}

const swSource = fs.readFileSync(swPath, 'utf8');
const eol = swSource.includes('\r\n') ? '\r\n' : '\n';
const arrayRe = /(const ASSETS = \[\r?\n)([\s\S]*?)(\r?\n\];)/;
const match = swSource.match(arrayRe);

if (!match) {
    console.error('✗ Could not locate `const ASSETS = [...]` block in sw.js');
    process.exit(1);
}

const newBlock = buildAssetsBlock(eol);

if (check) {
    if (match[2] === newBlock) {
        console.log(
            `✓ sw.js precache list is up to date (${pages.length + css.length + coreJs.length + modulesJs.length + fonts.length + vendorFontawesome.length + ESSENTIAL_IMAGES.length + 3} entries).`
        );
        process.exit(0);
    }
    console.error('✗ sw.js precache list is out of date — run `npm run generate-sw-assets` and bump CACHE_NAME.');
    process.exit(1);
}

const newSource = swSource.replace(arrayRe, `$1${newBlock}$3`);
if (newSource === swSource) {
    console.log('✓ sw.js precache list already up to date, nothing to write.');
} else {
    fs.writeFileSync(swPath, newSource, 'utf8');
    console.log('✓ sw.js precache list regenerated. Remember to bump CACHE_NAME before shipping.');
}
