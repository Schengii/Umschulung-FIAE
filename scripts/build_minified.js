/**
 * @file build_minified.js
 * @description Lightweight production build: minifies assets/js and assets/css
 * with esbuild and copies everything else (HTML, images, vendor, Projekte/, etc.)
 * unchanged into dist/. Deliberately does NOT bundle or rewrite <script>/<link>
 * references — every file keeps its original path, so no HTML needs to change
 * and no CSP hash is invalidated. This is a minification step, not a bundler.
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
    'assets/images',
    'assets/vendor',
    'assets/fonts',
    'assets/data',
    'assets/pdf',
    'assets/powerpoint',
    'Projekte',
    'manifest.json',
    'sw.js',
    'robots.txt',
    'sitemap.xml',
    'CNAME',
    '.nojekyll',
];

const SKIP_DIR_NAMES = new Set(['node_modules', '.git', 'dist', '.vite']);

function copyRecursive(src, dest) {
    const stat = fs.statSync(src);
    if (stat.isDirectory()) {
        if (SKIP_DIR_NAMES.has(path.basename(src))) return;
        fs.mkdirSync(dest, { recursive: true });
        for (const entry of fs.readdirSync(src)) {
            copyRecursive(path.join(src, entry), path.join(dest, entry));
        }
    } else {
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
            } else if (extList.includes(path.extname(entry.name)) && !/\.(test|spec)\.js$/.test(entry.name)) {
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

async function run() {
    if (fs.existsSync(distDir)) fs.rmSync(distDir, { recursive: true, force: true });
    fs.mkdirSync(distDir, { recursive: true });

    for (const entry of COPY_ENTRIES) {
        const src = path.join(root, entry);
        if (fs.existsSync(src)) copyRecursive(src, path.join(distDir, entry));
    }

    const jsCount = await minifyDir(path.join(root, 'assets', 'js'), ['.js']);
    const cssCount = await minifyDir(path.join(root, 'assets', 'css'), ['.css']);

    console.log(`Minified ${jsCount} JS file(s) and ${cssCount} CSS file(s) into dist/.`);
}

run();
