/**
 * @file run_visual.js
 * Startet die visuellen Regressionstests (assets/js/modules/visual.spec.js) betriebssystemunabhängig
 * mit VISUAL=1. `--update` erzeugt die Referenzbilder neu.
 *
 * Referenzbilder gehören aus der CI (Linux) ins Repository, nicht von einem lokalen Lauf: der
 * Workflow `visual.yml` (Eingabe "update") erzeugt sie und stellt sie als Artefakt bereit.
 * Lokale Läufe legen `*-win32.png` bzw. `*-darwin.png` an, die .gitignore ausschließt.
 */
const { spawnSync } = require('child_process');

const args = ['playwright', 'test', 'visual', '--project=chromium'];
if (process.argv.includes('--update')) args.push('--update-snapshots');

const result = spawnSync('npx', args, {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, VISUAL: '1' },
});
process.exit(result.status ?? 1);
