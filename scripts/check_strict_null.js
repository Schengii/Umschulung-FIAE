/**
 * @file check_strict_null.js
 * Ratsche für `strictNullChecks` (Plan 6.4): zählt die Fehler von `tsc -p jsconfig.strict.json` und
 * schlägt fehl, sobald es mehr werden als in `scripts/strict-null-baseline.json`. Weniger ist erlaubt;
 * `--update` schreibt die neue, niedrigere Obergrenze. Ziel ist 0, danach wandert die Option in
 * `jsconfig.json` und diese Prüfung entfällt.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const BASELINE = path.join(__dirname, 'strict-null-baseline.json');

/** @returns {number} */
function countErrors() {
    const result = spawnSync('npx tsc --noEmit -p jsconfig.strict.json', {
        shell: true,
        cwd: path.join(__dirname, '..'),
        encoding: 'utf8',
        maxBuffer: 64 * 1024 * 1024,
    });
    return (result.stdout.match(/error TS\d+/g) || []).length;
}

const current = countErrors();
const limit = JSON.parse(fs.readFileSync(BASELINE, 'utf8')).maxErrors;

if (process.argv.includes('--update')) {
    fs.writeFileSync(BASELINE, JSON.stringify({ maxErrors: current }, null, 2) + '\n');
    console.log(`strictNullChecks: Obergrenze auf ${current} gesetzt.`);
} else if (current > limit) {
    console.error(
        `strictNullChecks: ${current} Fehler, erlaubt sind ${limit}. Neue Null-Fehler beheben (npx tsc --noEmit -p jsconfig.strict.json).`
    );
    process.exit(1);
} else {
    console.log(
        `strictNullChecks: ${current} Fehler (Obergrenze ${limit})${current < limit ? ' – bitte mit --update absenken' : ''}.`
    );
}
