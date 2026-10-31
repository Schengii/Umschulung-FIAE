// Erzeugt src/styles/tailwind-light.css: Die Tailwind-Labs sind für dunkle Flächen gebaut
// (bg-slate-900, text-emerald-400 …). Im Light Mode spiegelt die Datei deshalb die
// Tailwind-Palette (dunkle Stufen → helle, helle Textstufen → dunkle); der Dark Mode bleibt unverändert.
//   npm run gen:tailwind-light   (nach Tailwind-Updates oder neuen Farbtönen erneut ausführen)
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const theme = fs.readFileSync(path.join(root, 'node_modules/tailwindcss/theme.css'), 'utf8');
const value = {};
for (const m of theme.matchAll(/--color-([a-z]+)-(\d+):\s*([^;]+);/g)) value[`${m[1]}-${m[2]}`] = m[3];

// Nur Farbtöne, die im Code vorkommen
const used = new Set();
const walk = (dir) => {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (/\.jsx?$/.test(f.name)) {
      const src = fs.readFileSync(p, 'utf8');
      for (const m of src.matchAll(/\b(?:bg|text|border|from|via|to|ring|fill|stroke|divide|outline|shadow|placeholder|accent|decoration)-([a-z]+)-\d{2,3}\b/g)) used.add(m[1]);
    }
  }
};
walk(path.join(root, 'src'));

const NEUTRAL_HUES = ['slate', 'gray', 'zinc', 'neutral', 'stone'];
// Graustufen: 950/900/800/700 sind Flächen und Rahmen, 100–400 Schrift
const NEUTRAL = { 950: '50', 900: 'white', 800: '100', 700: '200', 400: '600', 300: '700', 200: '800', 100: '900', 50: '950' };
// Farbtöne: 950/900 sind getönte Flächen, 800 Rahmen und Buttons (→ 700, weiße Schrift bleibt lesbar), 100–400 Schrift (mind. Stufe 700 auf Weiß); 500/600 bleiben
const COLOR = { 950: '50', 900: '100', 800: '700', 400: '700', 300: '800', 200: '800', 100: '900', 50: '950' };

const lines = [];
for (const hue of [...used].filter((h) => value[`${h}-500`]).sort()) {
  const map = NEUTRAL_HUES.includes(hue) ? NEUTRAL : COLOR;
  for (const [from, to] of Object.entries(map)) {
    lines.push(`  --color-${hue}-${from}: ${to === 'white' ? '#ffffff' : value[`${hue}-${to}`]};`);
  }
}

const css = `/* Erzeugt von scripts/gen-tailwind-light.js – nicht von Hand bearbeiten. */
/* Light Mode: gespiegelte Tailwind-Palette für die dunkel gestalteten Tailwind-Labs. */
:root:not([data-theme="dark"]) {
${lines.join('\n')}
}

/* Weiße Überschriften auf (jetzt hellen) Grauflächen; weiße Schrift auf Farbflächen bleibt. */
:root:not([data-theme="dark"]) .text-white:not([class*="bg-"]):not([class*="from-"]),
:root:not([data-theme="dark"]) .text-white:is(.bg-slate-700, .bg-slate-800, .bg-slate-900, .bg-slate-950) {
  color: var(--text-main);
}
`;
fs.writeFileSync(path.join(root, 'src/styles/tailwind-light.css'), css);
console.log(`src/styles/tailwind-light.css: ${used.size} Farbtöne, ${lines.length} Variablen`);
