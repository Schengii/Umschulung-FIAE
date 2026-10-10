// Erzeugt docs/LABS.md aus src/data/labModulesData.js (Single Source of Truth).
// Aufruf: npm run docs:labs   |   Prüfen ohne Schreiben: npm run docs:labs -- --check
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const out = fileURLToPath(new URL('../docs/LABS.md', import.meta.url));
const { LAB_MODULES } = await import(pathToFileURL(fileURLToPath(new URL('../src/data/labModulesData.js', import.meta.url))).href);

const byCategory = new Map();
for (const lab of LAB_MODULES) {
  if (!byCategory.has(lab.category)) byCategory.set(lab.category, []);
  byCategory.get(lab.category).push(lab);
}

const esc = (s) => String(s).replace(/\|/g, '\|').replace(/\s+/g, ' ').trim();
const lines = [
  '# Lab-Übersicht',
  '',
  '> Automatisch erzeugt aus `src/data/labModulesData.js` mit `npm run docs:labs` – nicht von Hand bearbeiten.',
  '',
  `**${LAB_MODULES.length} Labs** in ${byCategory.size} Kategorien.`,
  ''
];
for (const [category, labs] of [...byCategory].sort(([a], [b]) => a.localeCompare(b))) {
  lines.push(`## ${category} (${labs.length})`, '', '| Tab-ID | Titel | Level | Beschreibung |', '|---|---|---|---|');
  for (const l of labs) lines.push(`| \`${l.id}\` | ${esc(l.title)} | ${l.difficulty} | ${esc(l.desc)} |`);
  lines.push('');
}
const content = lines.join('\n');

if (process.argv.includes('--check')) {
  let current = '';
  try { current = readFileSync(out, 'utf-8'); } catch { /* fehlt */ }
  if (current !== content) {
    console.error('docs/LABS.md ist veraltet – bitte `npm run docs:labs` ausführen.');
    process.exit(1);
  }
  console.log('docs/LABS.md ist aktuell.');
} else {
  writeFileSync(out, content);
  console.log(`docs/LABS.md geschrieben (${LAB_MODULES.length} Labs).`);
}
