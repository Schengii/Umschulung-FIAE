/**
 * @file build_minified.js
 * @description Lightweight production build: minifies assets/js and assets/css
 * with esbuild and copies everything else (HTML, images, vendor, Projekte/, etc.)
 * unchanged into dist/. Deliberately does NOT bundle or rewrite <script>/<link>
 * references — every file keeps its original path, so no HTML needs to change
 * and no CSP hash is invalidated. This is a minification step, not a bundler.
 *
 * dist/ is what Vercel deploys (ADR 0008), so a file missing here is a 404 in
 * production. The build therefore copies assets/ as a whole instead of a list
 * of sub-folders, and verifies at the end that every local link the site
 * depends on exists in the output.
 */

const fs = require('fs');
const path = require('path');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');

const COPY_ENTRIES = [
    'index.html',
    '404.html',
    'pages',
    'assets',
    'Projekte',
    'manifest.json',
    'sw.js',
    'robots.txt',
    'sitemap.xml',
    'CNAME',
    '.nojekyll',
];

// Directories that are never part of the site. This mirrors .gitignore (Vercel only ever
// sees tracked files). `dist` is deliberately NOT listed: Projekte/<name>/dist/ holds the
// committed builds the portfolio links to as live demos.
const SKIP_DIR_NAMES = new Set([
    'node_modules',
    '.git',
    '.vite',
    'dev-dist',
    'build',
    '.venv',
    'venv',
    '__pycache__',
    '.vs',
]);

// Sources that live next to the shipped code but are development-only.
const isDevOnlyFile = (name) => /\.(test|spec)\.js$/.test(name) || name.endsWith('.d.ts');

function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        if (SKIP_DIR_NAMES.has(path.basename(src))) return;
        fs.mkdirSync(dest, { recursive: true });
        for (const entry of fs.readdirSync(src)) {
            copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
    } else {
        if (isDevOnlyFile(path.basename(src))) return;
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(src, dest);
    }
}

async function minifyDir(srcDir, extList) {
    const files = [];
    (function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(full);
            } else if (extList.includes(path.extname(entry.name)) && !isDevOnlyFile(entry.name)) {
                files.push(full);
            }
        }
    })(srcDir);

    for (const file of files) {
        const rel = path.relative(root, file);
        const outFile = path.join(distDir, rel);
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        const result = await esbuild.build({
            entryPoints: [file],
            minify: true,
            bundle: false,
            write: false,
            loader: { '.js': 'js', '.css': 'css' },
            target: 'es2018',
            logLevel: 'silent',
        });
        fs.writeFileSync(outFile, result.outputFiles[0].contents);
    }
    return files.length;
}

/**
 * Local targets the site links to from generated data: project demos and media. They are
 * resolved from the site root or from pages/, exactly as the pages do.
 */
function findMissingLinkTargets() {
    const dataFile = path.join(distDir, 'assets', 'data', 'projects.json');
    if (!fs.existsSync(dataFile)) return ['assets/data/projects.json'];

    const targets = new Set();
    (function collect(value, key) {
        if (Array.isArray(value)) {
            value.forEach((item) => collect(item, key));
        } else if (value && typeof value === 'object') {
            for (const [childKey, child] of Object.entries(value)) collect(child, childKey);
        } else if (typeof value === 'string' && (key === 'link' || key === 'url')) {
            if (!/^[a-z][a-z0-9+.-]*:/i.test(value) && !value.startsWith('#')) targets.add(value);
        }
    })(JSON.parse(fs.readFileSync(dataFile, 'utf8')), '');

    const missing = [];
    for (const target of targets) {
        const relative = decodeURI(target.split(/[?#]/)[0]);
        const candidates = [path.join(distDir, relative), path.join(distDir, 'pages', relative)];
        if (!candidates.some((candidate) => fs.existsSync(candidate))) missing.push(target);
    }
    return missing;
}

async function run() {
    if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true, force: true });
    fs.mkdirSync(distDir, { recursive: true });

    for (const entry of COPY_ENTRIES) {
        const src = path.join(root, entry);
        if (fs.existsSync(src)) copyRecursive(src, path.join(distDir, entry));
    }

    // Overwrites the plain copies made above with their minified versions.
    const jsCount = await minifyDir(path.join(root, 'assets', 'js'), ['.js']);
    const cssCount = await minifyDir(path.join(root, 'assets', 'css'), ['.css']);

    const missing = findMissingLinkTargets();
    if (missing.length > 0) {
        console.error('✗ dist/ is missing files the site links to:');
        for (const target of missing) console.error(`    ${target}`);
        process.exit(1);
    }

    console.log(`Minified ${jsCount} JS file(s) and ${cssCount} CSS file(s) into dist/.`);
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
