// Scaffold für ein neues Lab (siehe CLAUDE.md, "Checkliste: Neues Lab anlegen").
// Legt Engine + Test + Lab-Komponente an und trägt das Lab am Listenanfang in
// src/data/labRegistry.js und src/data/labModulesData.js ein.
//
// Aufruf: npm run new-lab -- <PascalName> "<Titel>" [category] [difficulty]
//   z. B.: npm run new-lab -- RaidLevel "RAID-Level Studio" hardware Intermediate
//
// Mit --dry-run wird nur ausgegeben, was geschrieben würde.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
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

const camel = name[0].toLowerCase() + name.slice(1);
const snake = name.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
const tabId = `${snake}_lab`;
const badge = `${snake}_master`;

const files = {
  engine: p(`src/utils/${camel}Engine.js`),
  test: p(`src/utils/${camel}Engine.test.js`),
  lab: p(`src/components/Content/${name}Lab.jsx`),
  registry: p('src/data/labRegistry.js'),
  modules: p('src/data/labModulesData.js')
};

for (const key of ['engine', 'test', 'lab']) {
  if (existsSync(files[key])) fail(`${files[key]} existiert bereits.`);
}

const registrySrc = readFileSync(files.registry, 'utf-8');
const modulesSrc = readFileSync(files.modules, 'utf-8');
if (registrySrc.includes(`'${tabId}'`) || modulesSrc.includes(`id: '${tabId}'`)) {
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
const modulesMarker = 'export const LAB_MODULES = [\n';
if (!registrySrc.includes(registryMarker)) fail('Einfügemarke in labRegistry.js nicht gefunden.');
if (!modulesSrc.includes(modulesMarker)) fail('Einfügemarke in labModulesData.js nicht gefunden.');
if (!/\bZap\b/.test(modulesSrc.split('\n')[0])) fail('Icon "Zap" ist in labModulesData.js nicht importiert.');

const newRegistry = registrySrc.replace(registryMarker, registryMarker + registryEntry);
const newModules = modulesSrc.replace(modulesMarker, modulesMarker + moduleEntry);

if (dryRun) {
  console.log(`[dry-run] würde schreiben:\n  ${files.engine}\n  ${files.test}\n  ${files.lab}`);
  console.log(`[dry-run] Registry-Eintrag für Tab "${tabId}", Modul-Eintrag in Kategorie "${category}".`);
  process.exit(0);
}

writeFileSync(files.engine, engineSrc);
writeFileSync(files.test, testSrc);
writeFileSync(files.lab, labSrc);
writeFileSync(files.registry, newRegistry);
writeFileSync(files.modules, newModules);

console.log(`Lab "${title}" angelegt (Tab-ID: ${tabId}).`);
console.log('Noch zu tun: Engine/UI ausarbeiten, desc/tags/Icon in labModulesData.js anpassen,');
console.log('README.md, CHANGELOG.md und _Projektuebersicht.md aktualisieren.');
