// Kleiner, sicherer Markdown-Parser für die Notizen-Vorschau. Er erzeugt nur Datenstrukturen,
// die die Oberfläche als React-Elemente rendert (kein HTML, kein dangerouslySetInnerHTML).
// Unterstützt: Überschriften (#–####), Codeblöcke (```), Listen (-, *, 1.), Tabellen (|), Zitate (>),
// Absätze, **fett** und `Code` im Fließtext.

/**
 * @typedef {{ type: 'text' | 'bold' | 'code', text: string }} InlineToken
 * @typedef {{ type: 'heading', level: number, tokens: InlineToken[] }
 *   | { type: 'code', text: string, lang: string }
 *   | { type: 'list', ordered: boolean, items: InlineToken[][] }
 *   | { type: 'table', header: InlineToken[][], rows: InlineToken[][][] }
 *   | { type: 'quote', tokens: InlineToken[] }
 *   | { type: 'paragraph', tokens: InlineToken[] }} MdBlock
 */

/**
 * Zerlegt Fließtext in Text-, Fett- und Code-Abschnitte.
 * @param {string} text
 * @returns {InlineToken[]}
 */
export function parseInline(text) {
  /** @type {InlineToken[]} */
  const tokens = [];
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let match;
  const source = String(text ?? '');
  while ((match = pattern.exec(source)) !== null) {
    if (match.index > last) tokens.push({ type: 'text', text: source.slice(last, match.index) });
    const raw = match[0];
    if (raw.startsWith('**')) tokens.push({ type: 'bold', text: raw.slice(2, -2) });
    else tokens.push({ type: 'code', text: raw.slice(1, -1) });
    last = match.index + raw.length;
  }
  if (last < source.length) tokens.push({ type: 'text', text: source.slice(last) });
  return tokens;
}

/** @param {string} line */
const splitRow = (line) =>
  line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());

/** @param {string} line */
const isSeparatorRow = (line) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line);

/**
 * Zerlegt Markdown in Blöcke.
 * @param {string} markdown
 * @returns {MdBlock[]}
 */
export function parseMarkdown(markdown) {
  const lines = String(markdown ?? '').replace(/\r\n/g, '\n').split('\n');
  /** @type {MdBlock[]} */
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    // Codeblock
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      const codeLines = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // schließende Zeile (oder Dateiende)
      blocks.push({ type: 'code', text: codeLines.join('\n'), lang: fence[1] || '' });
      continue;
    }

    // Überschrift
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, tokens: parseInline(heading[2]) });
      i++;
      continue;
    }

    // Tabelle: Kopfzeile + Trennzeile
    if (line.trim().startsWith('|') && i + 1 < lines.length && isSeparatorRow(lines[i + 1])) {
      const header = splitRow(line).map(parseInline);
      const rows = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitRow(lines[i]).map(parseInline));
        i++;
      }
      blocks.push({ type: 'table', header, rows });
      continue;
    }

    // Liste
    const bullet = /^\s*[-*]\s+/;
    const numbered = /^\s*\d+\.\s+/;
    if (bullet.test(line) || numbered.test(line)) {
      const ordered = numbered.test(line);
      const marker = ordered ? numbered : bullet;
      const items = [];
      while (i < lines.length && marker.test(lines[i])) {
        items.push(parseInline(lines[i].replace(marker, '')));
        i++;
      }
      blocks.push({ type: 'list', ordered, items });
      continue;
    }

    // Zitat
    if (/^>\s?/.test(line)) {
      const quoteLines = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i++;
      }
      blocks.push({ type: 'quote', tokens: parseInline(quoteLines.join(' ')) });
      continue;
    }

    // Absatz: bis zur nächsten Leerzeile oder einem anderen Blockanfang
    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^```/.test(lines[i]) &&
      !/^#{1,4}\s/.test(lines[i]) &&
      !bullet.test(lines[i]) &&
      !numbered.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !(lines[i].trim().startsWith('|') && i + 1 < lines.length && isSeparatorRow(lines[i + 1]))
    ) {
      para.push(lines[i]);
      i++;
    }
    blocks.push({ type: 'paragraph', tokens: parseInline(para.join(' ')) });
  }

  return blocks;
}
