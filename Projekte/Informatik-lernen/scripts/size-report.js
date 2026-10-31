// Bundle-Size-Trend für Pull Requests (CI-Job "bundle-size-report"):
// vergleicht zwei `size-limit --json`-Ausgaben (Ziel-Branch und PR) und gibt
// eine Markdown-Tabelle aus. Ersetzt andresz1/size-limit-action, die nur für
// Node 20 gebaut ist und auf GitHub-Runnern nicht mehr läuft.
//
// Aufruf: node scripts/size-report.js <basis.json> <pr.json>
import { readFileSync } from 'node:fs';

const [baseFile, headFile] = process.argv.slice(2);
if (!baseFile || !headFile) {
  console.error('Aufruf: node scripts/size-report.js <basis.json> <pr.json>');
  process.exit(1);
}

const read = (file) => {
  try {
    const data = JSON.parse(readFileSync(file, 'utf-8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return []; // z. B. Basis-Build fehlgeschlagen: dann nur PR-Werte zeigen
  }
};

const kb = (bytes) => `${(bytes / 1000).toFixed(2)} kB`;
const base = new Map(read(baseFile).map((entry) => [entry.name, entry]));
const head = read(headFile);

const rows = head.map((entry) => {
  const before = base.get(entry.name);
  let change = 'neu';
  if (before) {
    const diff = entry.size - before.size;
    const pct = before.size ? (diff / before.size) * 100 : 0;
    change = diff === 0 ? '±0' : `${diff > 0 ? '+' : ''}${kb(diff)} (${pct > 0 ? '+' : ''}${pct.toFixed(1)} %)`;
  }
  const status = entry.passed ? '✅' : '❌';
  return `| ${status} ${entry.name} | ${before ? kb(before.size) : '–'} | ${kb(entry.size)} | ${change} | ${kb(entry.sizeLimit)} |`;
});

console.log([
  '### Bundle-Größen (gzip, size-limit)',
  '',
  '| Chunk | Ziel-Branch | PR | Änderung | Limit |',
  '| --- | ---: | ---: | ---: | ---: |',
  ...rows,
  '',
  '_Erzeugt von `scripts/size-report.js`; der harte Grenzwert-Check ist der Schritt `npm run size` im test-Job._'
].join('\n'));
