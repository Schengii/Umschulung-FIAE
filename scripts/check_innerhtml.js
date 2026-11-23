/**
 * @file check_innerhtml.js
 * Ratsche gegen rohe Interpolation in `innerHTML` (Plan 2.3, Audit in docs/innerhtml-audit.md): zählt je Datei
 * die Stellen (`innerHTML =`, `+=`, `outerHTML =`, `insertAdjacentHTML(`), in deren Vorlage mindestens ein
 * `${…}`-Ausdruck nicht durch `escapeHtml`/`esc`/`escUrl`/`safeUrl`/`encodeURIComponent` läuft, und schlägt
 * fehl, sobald eine Datei mehr davon hat als in `scripts/innerhtml-baseline.json`. Weniger ist erlaubt;
 * `--update` schreibt die neue Baseline. Neue Stellen: Werte escapen (siehe CLAUDE.md, „Konventionen“).
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BASELINE = path.join(__dirname, 'innerhtml-baseline.json');
const SAFE = /^(escapeHtml|esc|escAttr|escUrl|safeUrl|encodeURIComponent)\(/;
const SINK = /(innerHTML\s*\+?=|insertAdjacentHTML\s*\(|outerHTML\s*=)/;

/**
 * @param {string} source
 * @returns {{ line: number, expressions: string[] }[]} Stellen mit mindestens einem nicht geschützten Ausdruck
 */
function findUnescaped(source) {
    const lines = source.split('\n');
    /** @type {{ line: number, expressions: string[] }[]} */
    const found = [];
    lines.forEach((line, i) => {
        if (!SINK.test(line)) return;
        let statement = line;
        let end = i;
        while (!/;\s*$/.test(lines[end]) && end < i + 120 && end + 1 < lines.length) {
            end++;
            statement += '\n' + lines[end];
        }
        /** @type {string[]} */
        const unsafe = [];
        const open = /\$\{/g;
        let match;
        while ((match = open.exec(statement))) {
            let depth = 1;
            let k = match.index + 2;
            while (k < statement.length && depth > 0) {
                if (statement[k] === '{') depth++;
                else if (statement[k] === '}') depth--;
                k++;
            }
            const expression = statement
                .slice(match.index + 2, k - 1)
                .trim()
                .replace(/\s+/g, ' ');
            if (!SAFE.test(expression) && !/^\d+$/.test(expression)) unsafe.push(expression);
        }
        if (unsafe.length) found.push({ line: i + 1, expressions: unsafe });
    });
    return found;
}

/**
 * @param {string} dir
 * @param {string[]} [out]
 * @returns {string[]}
 */
function listScripts(dir, out = []) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) listScripts(full, out);
        else if (
            /\.js$/.test(entry.name) &&
            !/\.(test|spec)\.js$/.test(entry.name) &&
            entry.name !== 'projects_data.js'
        )
            out.push(full);
    }
    return out;
}

/** @returns {Record<string, number>} */
function countPerFile() {
    /** @type {Record<string, number>} */
    const counts = {};
    for (const file of listScripts(path.join(ROOT, 'assets', 'js'))) {
        const n = findUnescaped(fs.readFileSync(file, 'utf8')).length;
        if (n) counts[path.relative(ROOT, file).split(path.sep).join('/')] = n;
    }
    return counts;
}

function main() {
    const current = countPerFile();
    if (process.argv.includes('--update')) {
        const sorted = Object.fromEntries(Object.entries(current).sort(([a], [b]) => a.localeCompare(b)));
        fs.writeFileSync(BASELINE, JSON.stringify(sorted, null, 2) + '\n');
        console.log(`innerHTML: Baseline geschrieben (${Object.keys(sorted).length} Dateien).`);
        return;
    }
    /** @type {Record<string, number>} */
    const limit = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));
    const worse = Object.entries(current).filter(([file, n]) => n > (limit[file] || 0));
    if (worse.length) {
        for (const [file, n] of worse) {
            console.error(
                `innerHTML: ${file} hat ${n} Stelle(n) mit ungeschütztem \${…}, erlaubt sind ${limit[file] || 0}.`
            );
            const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
            for (const hit of findUnescaped(source)) {
                console.error(`  Zeile ${hit.line}: ${hit.expressions.slice(0, 4).join(' ; ')}`);
            }
        }
        console.error(
            'Werte mit escapeHtml (modules/html-utils.js) bzw. lokaler Kopie escapen, siehe docs/innerhtml-audit.md.'
        );
        process.exit(1);
    }
    const total = Object.values(current).reduce((a, b) => a + b, 0);
    const better = Object.keys(limit).some((file) => (current[file] || 0) < limit[file]);
    console.log(
        `innerHTML: ${total} Stellen ohne Escape, Baseline eingehalten${better ? ' – bitte mit --update absenken' : ''}.`
    );
}

module.exports = { findUnescaped };
if (require.main === module) main();
