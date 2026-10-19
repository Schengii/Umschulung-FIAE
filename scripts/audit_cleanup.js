const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const EXCLUDED_DIRS = new Set([
    'node_modules',
    '.git',
    '.venv',
    'venv',
    '__pycache__',
    '.godot',
    'platforms',
    'plugins',
    '.gradle',
    'build',
    '.idea',
    '.vs',
    '.vscode',
    '.husky',
    'dev-dist',
    'capacitor-cordova-android-plugins',
    'world_saves',
]);

/** @param {string} dir */
function getDirSummary(dir) {
    let size = 0;
    let fileCount = 0;
    /** @param {string} current */
    function traverse(current) {
        try {
            const list = fs.readdirSync(current);
            list.forEach((f) => {
                if (EXCLUDED_DIRS.has(f)) return;
                const p = path.join(current, f);
                const s = fs.statSync(p);
                if (s.isDirectory()) {
                    traverse(p);
                } else {
                    size += s.size;
                    fileCount++;
                }
            });
        } catch (_e) {
            // ignore unreadable directories
        }
    }
    traverse(dir);
    return { size, fileCount };
}

console.log('=== Projects Breakdown (Tracked & Clean Assets) ===');
fs.readdirSync('Projekte').forEach((item) => {
    const p = path.join('Projekte', item);
    if (fs.statSync(p).isDirectory()) {
        const summary = getDirSummary(p);
        console.log(item.padEnd(30), (summary.size / (1024 * 1024)).toFixed(2) + ' MB', `(${summary.fileCount} files)`);
    }
});

console.log('\n=== Untracked Large Directories Check ===');
try {
    const gitUntracked = execSync('git ls-files --others --exclude-standard Projekte/', { encoding: 'utf8' })
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

    if (gitUntracked.length > 0) {
        console.log(`Found ${gitUntracked.length} untracked file(s) in Projekte/.`);
    } else {
        console.log('✓ Keine ungetrackten Riesenverzeichnisse in Projekte/ gefunden.');
    }
} catch (e) {
    console.log('Git check skipped:', e.message);
}

console.log('\n=== Bewerbungsunterlagen ===');
if (fs.existsSync('Bewerbungsunterlagen')) {
    fs.readdirSync('Bewerbungsunterlagen').forEach((f) => {
        const stat = fs.statSync(path.join('Bewerbungsunterlagen', f));
        console.log(' -', f, `(${(stat.size / 1024).toFixed(1)} KB)`);
    });
}
