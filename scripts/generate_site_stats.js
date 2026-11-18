#!/usr/bin/env node
/**
 * Erzeugt assets/data/site-stats.json mit echten Messwerten dieses Repos:
 *  - Commits je Tag (aus `git log`)
 *  - Anzahl Seiten, ADRs
 *  - Unit-Tests und Coverage (nur mit --measure, sonst bleiben die vorhandenen Werte stehen)
 *
 * Aufruf:
 *   node scripts/generate_site_stats.js            Commits, Seiten, ADRs aktualisieren
 *   node scripts/generate_site_stats.js --measure  zusätzlich vitest mit Coverage laufen lassen
 *   node scripts/generate_site_stats.js --check    nur das Schema der vorhandenen Datei prüfen
 *
 * `--check` prüft bewusst nur das Schema: Der Git-Verlauf ist in flachen CI-Klonen unvollständig,
 * ein Vergleich mit einem frischen Lauf wäre dort immer rot.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT = path.join(ROOT, 'assets', 'data', 'site-stats.json');
const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Zählt Commit-Daten (eine ISO-Zeile je Commit) je Tag.
 * @param {string} log
 * @returns {Record<string, number>} nach Datum sortiert
 */
function countCommitsByDay(log) {
    /** @type {Record<string, number>} */
    const counts = {};
    for (const line of log.split(/\r?\n/)) {
        const day = line.trim();
        if (!DAY_RE.test(day)) continue;
        counts[day] = (counts[day] || 0) + 1;
    }
    return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

/**
 * Prüft die Struktur von site-stats.json.
 * @param {any} stats
 * @returns {string[]} Fehlermeldungen, leer wenn gültig
 */
function validateStats(stats) {
    const errors = [];
    /** @param {any} v */
    const isCount = (v) => Number.isInteger(v) && v >= 0;
    /** @param {any} v */
    const isPercent = (v) => typeof v === 'number' && v >= 0 && v <= 100;
    if (!stats || typeof stats !== 'object') return ['Datei ist kein Objekt'];
    if (!DAY_RE.test(String(stats.generatedAt))) errors.push('generatedAt fehlt oder ist kein ISO-Datum');
    const commits = stats.commits;
    if (!commits || typeof commits.byDay !== 'object' || commits.byDay === null) {
        errors.push('commits.byDay fehlt');
    } else {
        const entries = Object.entries(commits.byDay);
        for (const [day, n] of entries) {
            if (!DAY_RE.test(day) || !isCount(n) || n < 1) errors.push(`commits.byDay: ungültiger Eintrag ${day}`);
        }
        const sum = entries.reduce((s, [, n]) => s + Number(n), 0);
        if (commits.total !== sum) errors.push(`commits.total (${commits.total}) ist nicht die Summe (${sum})`);
    }
    if (!isCount(stats.pages)) errors.push('pages fehlt');
    if (!isCount(stats.adrs)) errors.push('adrs fehlt');
    if (stats.tests !== null) {
        if (!stats.tests || !isCount(stats.tests.unit) || !isCount(stats.tests.files))
            errors.push('tests ist ungültig');
    }
    if (stats.coverage !== null) {
        const c = stats.coverage;
        for (const key of ['statements', 'branches', 'functions', 'lines']) {
            if (!c || !isPercent(c[key])) errors.push(`coverage.${key} ist ungültig`);
        }
    }
    return errors;
}

/**
 * @param {string} dir
 * @param {RegExp} re
 */
function countFiles(dir, re) {
    try {
        return fs.readdirSync(path.join(ROOT, dir)).filter((f) => re.test(f)).length;
    } catch {
        return 0;
    }
}

/** @returns {Record<string, number>} */
function readCommits() {
    const res = spawnSync('git', ['log', '--format=%cs'], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    if (res.status !== 0) throw new Error(`git log fehlgeschlagen: ${res.stderr}`);
    return countCommitsByDay(res.stdout);
}

/** Führt Vitest mit Coverage aus und liest Testanzahl und Coverage. */
function measure() {
    const out = path.join(os.tmpdir(), `vitest-stats-${process.pid}.json`);
    const vitest = path.join(ROOT, 'node_modules', 'vitest', 'vitest.mjs');
    const res = spawnSync(
        process.execPath,
        [vitest, 'run', '--coverage', '--coverage.reporter=json-summary', '--reporter=json', `--outputFile=${out}`],
        { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'ignore', 'inherit'] }
    );
    if (res.status !== 0) throw new Error('Vitest ist fehlgeschlagen, Werte werden nicht übernommen');
    const run = JSON.parse(fs.readFileSync(out, 'utf8'));
    fs.rmSync(out, { force: true });
    const summary = JSON.parse(fs.readFileSync(path.join(ROOT, 'coverage', 'coverage-summary.json'), 'utf8')).total;
    return {
        tests: { unit: run.numPassedTests, files: run.testResults.length },
        coverage: {
            statements: summary.statements.pct,
            branches: summary.branches.pct,
            functions: summary.functions.pct,
            lines: summary.lines.pct,
        },
    };
}

function main() {
    const args = process.argv.slice(2);
    /** @type {any} */
    let previous = null;
    try {
        previous = JSON.parse(fs.readFileSync(OUTPUT, 'utf8'));
    } catch {
        // erste Erzeugung
    }

    if (args.includes('--check')) {
        const errors = previous ? validateStats(previous) : ['assets/data/site-stats.json fehlt'];
        if (errors.length) {
            console.error(`site-stats.json ungültig:\n- ${errors.join('\n- ')}`);
            process.exit(1);
        }
        console.log('site-stats.json: OK');
        return;
    }

    const byDay = readCommits();
    const measured = args.includes('--measure') ? measure() : null;
    const stats = {
        generatedAt: new Date().toISOString().slice(0, 10),
        commits: { total: Object.values(byDay).reduce((s, n) => s + n, 0), byDay },
        pages: countFiles('pages', /\.html$/) + 2, // plus index.html und 404.html
        adrs: countFiles('docs/adr', /^\d{4}-.*\.md$/),
        tests: measured ? measured.tests : (previous && previous.tests) || null,
        coverage: measured ? measured.coverage : (previous && previous.coverage) || null,
    };
    const errors = validateStats(stats);
    if (errors.length) throw new Error(errors.join('\n'));
    fs.writeFileSync(OUTPUT, `${JSON.stringify(stats, null, 2)}\n`);
    console.log(`site-stats.json: ${stats.commits.total} Commits, ${stats.pages} Seiten, ${stats.adrs} ADRs`);
}

if (require.main === module) main();

module.exports = { countCommitsByDay, validateStats };
