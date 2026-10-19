/**
 * @file check_strict_types.js
 * @description Ratchet for `noImplicitAny`. jsconfig.json stays at `strict: false` (the codebase has
 * hundreds of untyped parameters), but the number of implicit-any errors per file may only go down:
 * scripts/strict-types-baseline.json holds the allowed count per file. A file that is not listed must
 * have 0 errors, a file that got better has to lower its entry (`--update`), so the gain cannot be
 * lost again.
 *
 * Usage: node scripts/check_strict_types.js           # compare against the baseline
 *        node scripts/check_strict_types.js --update  # rewrite the baseline from the current state
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const baselinePath = path.join(__dirname, 'strict-types-baseline.json');

/** @param {string} output tsc `--pretty false` output @returns {Record<string, number>} errors per file */
function countErrorsPerFile(output) {
    /** @type {Record<string, number>} */
    const counts = {};
    for (const match of output.matchAll(/^(.+?)\(\d+,\d+\): error TS\d+:/gm)) {
        const file = match[1].replace(/\\/g, '/');
        counts[file] = (counts[file] || 0) + 1;
    }
    return counts;
}

/**
 * @param {Record<string, number>} current
 * @param {Record<string, number>} baseline
 * @returns {{worse: string[], better: string[]}} human-readable differences
 */
function compare(current, baseline) {
    const worse = [];
    const better = [];
    for (const file of new Set([...Object.keys(current), ...Object.keys(baseline)])) {
        const now = current[file] || 0;
        const allowed = baseline[file] || 0;
        if (now > allowed) worse.push(`${file}: ${now} errors, ${allowed} allowed`);
        else if (now < allowed) better.push(`${file}: ${now} errors, baseline still says ${allowed}`);
    }
    return { worse, better };
}

function sortKeys(counts) {
    return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

function main() {
    const tsc = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc');
    const run = spawnSync(
        process.execPath,
        [tsc, '--noEmit', '-p', 'jsconfig.json', '--noImplicitAny', '--pretty', 'false'],
        { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
    );
    const current = countErrorsPerFile(run.stdout);
    const total = Object.values(current).reduce((sum, n) => sum + n, 0);

    if (process.argv.includes('--update')) {
        fs.writeFileSync(baselinePath, JSON.stringify(sortKeys(current), null, 4) + '\n');
        console.log(`✓ strict-types-baseline.json written (${total} errors in ${Object.keys(current).length} files).`);
        return;
    }

    const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    const { worse, better } = compare(current, baseline);
    if (worse.length) {
        console.error('✗ New implicit-any errors (add types, do not raise the baseline):');
        worse.forEach((line) => console.error(`  ${line}`));
    }
    if (better.length) {
        console.error(
            '✗ Fewer errors than the baseline - lock the gain in with `node scripts/check_strict_types.js --update`:'
        );
        better.forEach((line) => console.error(`  ${line}`));
    }
    if (worse.length || better.length) process.exit(1);

    console.log(`✓ noImplicitAny: ${total} known errors in ${Object.keys(current).length} files, none new.`);
}

if (require.main === module) main();

module.exports = { countErrorsPerFile, compare };
