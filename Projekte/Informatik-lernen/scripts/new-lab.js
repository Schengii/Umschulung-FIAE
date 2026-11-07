// Scaffold für ein neues Lab (siehe CLAUDE.md, "Checkliste: Neues Lab anlegen").
// Legt Engine + Test + Lab-Komponente an und trägt das Lab am Listenanfang in
// src/data/labRegistry.js und in der passenden Themendatei unter
// src/data/labModules/ ein (die Datei, die die Kategorie bereits führt).
//
// Aufruf: npm run new-lab -- <PascalName> "<Titel>" [category] [difficulty]
//   z. B.: npm run new-lab -- RaidLevel "RAID-Level Studio" hardware Intermediate
//
// Mit --dry-run wird nur ausgegeben, was geschrieben würde.
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const p = (rel) => fileURLToPath(new URL(rel, root));

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const dryRun = process.argv.includes('--dry-run');
const [name, title, category = 'fiae', difficulty = 'Intermediate'] = args;

function fail(msg) {
  console.error(`Fehler: ${msg}`);
  process.exit(1);
}

if (!name || !title) fail('Aufruf: npm run new-lab -- <PascalName> "<Titel>" [category] [difficulty]');
if (!/^[A-Z][A-Za-z0-9]+$/.test(name)) fail('Name muss PascalCase sein (z. B. RaidLevel).');
if (!DIFFICULTIES.includes(difficulty)) fail(`difficulty muss eines von ${DIFFICULTIES.join(', ')} sein.`);
if (!/^[a-z][a-z0-9_]*$/.test(category)) fail('category darf nur Kleinbuchstaben, Ziffern und _ enthalten (z. B. network).');

const camel = name[0].toLowerCase() + name.slice(1);
const snake = name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
const tabId = `${snake}_lab`;
const badge = `${snake}_master`;

// Themendateien der Lab-Metadaten (LAB_MODULES setzt sich daraus zusammen,
// siehe src/data/labModulesData.js). Ziel ist die Datei, die die Kategorie
// am häufigsten führt; unbekannte Kategorien landen in softwareDataModules.
const MODULES_DIR = 'src/data/labModules/';
const FALLBACK_MODULES = 'softwareDataModules.js';
const topicFiles = readdirSync(p(MODULES_DIR)).filter((f) => f.endsWith('.js'));
const topicSources = Object.fromEntries(topicFiles.map((f) => [f, readFileSync(p(MODULES_DIR + f), 'utf-8')]));
// Wörtlich zählen statt per RegExp: category kommt von der Kommandozeile
const countCategory = (src) => src.split(`category: '${category}'`).length - 1;
const targetModules = topicFiles
  .map((f) => [f, countCategory(topicSources[f])])
  .filter(([, n]) => n > 0)
  .sort((a, b) => b[1] - a[1])[0]?.[0] || FALLBACK_MODULES;

const files = {
  engine: p(`src/utils/${camel}Engine.js`),
  test: p(`src/utils/${camel}Engine.test.js`),
  lab: p(`src/components/Content/${name}Lab.jsx`),
  registry: p('src/data/labRegistry.js'),
  modules: p(MODULES_DIR + targetModules)
};

for (const key of ['engine', 'test', 'lab']) {
  if (existsSync(files[key])) fail(`${files[key]} existiert bereits.`);
}

const registrySrc = readFileSync(files.registry, 'utf-8');
const modulesSrc = topicSources[targetModules];
if (registrySrc.includes(`'${tabId}'`) || Object.values(topicSources).some((src) => src.includes(`id: '${tabId}'`))) {
  fail(`Tab-ID ${tabId} ist bereits vergeben.`);
}

const engineSrc = `// @ts-check
/**
 * Reine Logik für: ${title}
 * TODO: Berechnung nach IHK-Vorgabe implementieren und Quelle angeben.
 * @param {number} value
 * @returns {number}
 */
export function calculate(value) {
  return value;
}
`;

const testSrc = `import { describe, it, expect } from 'vitest';
import { calculate } from './${camel}Engine';

describe('${camel}Engine', () => {
  it('berechnet einen Wert', () => {
    expect(calculate(1)).toBe(1);
  });
});
`;

const labSrc = `import React, { useState } from 'react';
import { calculate } from '../../utils/${camel}Engine';

export default function ${name}Lab({ onRewardXP }) {
  const [value, setValue] = useState(1);
  const [claimed, setClaimed] = useState(false);

  const handleCheck = () => {
    if (!claimed) {
      setClaimed(true);
      onRewardXP?.(55, '${badge}');
    }
  };

  return (
    <section className="glass-card" aria-labelledby="${tabId}-title">
      <h2 id="${tabId}-title">${title}</h2>
      <label htmlFor="${tabId}-input">Eingabewert</label>
      <input
        id="${tabId}-input"
        type="number"
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
      />
      <p>Ergebnis: {calculate(value)}</p>
      <button type="button" onClick={handleCheck}>Prüfen</button>
    </section>
  );
}
`;

const registryEntry = `  {
    tabs: ['${tabId}'],
    load: () => import('../components/Content/${name}Lab'),
    xp: { prop: 'onRewardXP', badge: '${badge}' }
  },
`;

const moduleEntry = `  {
    id: '${tabId}',
    title: '${title.replace(/'/g, "\\'")}',
    category: '${category}',
    tags: ['#${name}', '#IHKPrüfung'],
    difficulty: '${difficulty}',
    desc: 'TODO: Kurzbeschreibung des Labs.',
    icon: Zap,
    badge: 'IHK Neu',
    color: '#4338ca'
  },
`;

const registryMarker = 'export const LAB_REGISTRY = [\n';
const modulesExport = targetModules.replace(/\.js$/, '');
const modulesMarker = `export const ${modulesExport} = [\n`;
if (!registrySrc.includes(registryMarker)) fail('Einfügemarke in labRegistry.js nicht gefunden.');
if (!modulesSrc.includes(modulesMarker)) fail(`Einfügemarke "${modulesMarker.trim()}" in ${targetModules} nicht gefunden.`);

const newRegistry = registrySrc.replace(registryMarker, registryMarker + registryEntry);
let newModules = modulesSrc.replace(modulesMarker, modulesMarker + moduleEntry);
// Zap als Platzhalter-Icon importieren, falls die Themendatei es noch nicht tut
const lucideImport = newModules.match(/import \{([^}]*)\} from 'lucide-react';/);
if (!lucideImport) {
  newModules = "import { Zap } from 'lucide-react';\n" + newModules;
} else if (!/\bZap\b/.test(lucideImport[1])) {
  newModules = newModules.replace(lucideImport[0], `import {${lucideImport[1].trimEnd()}, Zap } from 'lucide-react';`);
}

if (dryRun) {
  console.log(`[dry-run] würde schreiben:\n  ${files.engine}\n  ${files.test}\n  ${files.lab}`);
  console.log(`[dry-run] Registry-Eintrag für Tab "${tabId}", Modul-Eintrag in Kategorie "${category}" → ${MODULES_DIR}${targetModules}.`);
  process.exit(0);
}

writeFileSync(files.engine, engineSrc);
writeFileSync(files.test, testSrc);
writeFileSync(files.lab, labSrc);
writeFileSync(files.registry, newRegistry);
writeFileSync(files.modules, newModules);

console.log(`Lab "${title}" angelegt (Tab-ID: ${tabId}).`);
console.log(`Noch zu tun: Engine/UI ausarbeiten, desc/tags/Icon in ${MODULES_DIR}${targetModules} anpassen,`);
console.log('README.md, CHANGELOG.md und _Projektuebersicht.md aktualisieren.');
