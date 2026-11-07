// Kleiner Markdown-Parser für die Wissensartikel (TopicReader).
// Erzeugt einen Syntaxbaum aus einfachen Objekten; gerendert wird er von
// `Shared/MarkdownContent.jsx` als React-Elemente – ohne `dangerouslySetInnerHTML`,
// damit Artikeltext nie als HTML ausgeführt wird.
//
// Unterstützt: Überschriften (## bis ####), Absätze, **fett**, *kursiv*, `Code`,
// [Links](https://…), Listen (auch nummeriert und eine Ebene verschachtelt),
// Tabellen mit Ausrichtung, Code-Blöcke (```sprache), Zitate, Callouts
// (> [!tip] Titel), Trennlinien (---) und Abbildungen (![Alt](datei.svg "Bildunterschrift")).

/**
 * @typedef {{ type: 'text', value: string }
 *   | { type: 'strong' | 'em', children: InlineNode[] }
 *   | { type: 'code', value: string }
 *   | { type: 'link', href: string, children: InlineNode[] }} InlineNode
 */

/**
 * @typedef {{ type: 'heading', level: number, id: string, children: InlineNode[] }
 *   | { type: 'paragraph', children: InlineNode[] }
 *   | { type: 'list', ordered: boolean, start: number, items: Array<{ children: InlineNode[], sublist: Block | null }> }
 *   | { type: 'table', align: Array<'left' | 'center' | 'right' | null>, header: InlineNode[][], rows: InlineNode[][][] }
 *   | { type: 'code', lang: string, value: string }
 *   | { type: 'blockquote', children: Block[] }
 *   | { type: 'callout', kind: string, title: string, children: Block[] }
 *   | { type: 'image', src: string, alt: string, caption: string }
 *   | { type: 'hr' }} Block
 */

/** Callout-Arten, die der Renderer farbig darstellt; unbekannte werden zu `info`. */
export const CALLOUT_KINDS = ['info', 'tip', 'warning', 'exam', 'example'];

const SAFE_LINK = /^(https?:\/\/|\/|#)/i;

/**
 * Wandelt Überschriftentext in eine HTML-ID um (Umlaute ausgeschrieben).
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'abschnitt';
}

/**
 * Zerlegt Inline-Text in Knoten (fett, kursiv, Code, Links).
 * @param {string} text
 * @returns {InlineNode[]}
 */
export function parseInline(text) {
  /** @type {InlineNode[]} */
  const nodes = [];
  let buffer = '';
  let i = 0;

  const flush = () => {
    if (buffer) {
      nodes.push({ type: 'text', value: buffer });
      buffer = '';
    }
  };

  while (i < text.length) {
    const ch = text[i];

    // Escape: \* \` \[ usw. werden wörtlich übernommen
    if (ch === '\\' && i + 1 < text.length && /[\\`*_[\]()!#|>-]/.test(text[i + 1])) {
      buffer += text[i + 1];
      i += 2;
      continue;
    }

    if (ch === '`') {
      const end = text.indexOf('`', i + 1);
      if (end > i) {
        flush();
        nodes.push({ type: 'code', value: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (ch === '*' && text[i + 1] === '*') {
      const end = text.indexOf('**', i + 2);
      if (end > i + 2) {
        flush();
        nodes.push({ type: 'strong', children: parseInline(text.slice(i + 2, end)) });
        i = end + 2;
        continue;
      }
    }

    // *kursiv* – nur mit Nicht-Leerzeichen direkt hinter/vor dem Stern (sonst ist es ein Malzeichen)
    if (ch === '*' && text[i + 1] && text[i + 1] !== ' ' && text[i + 1] !== '*') {
      let end = i + 1;
      while (end < text.length && !(text[end] === '*' && text[end - 1] !== ' ' && text[end + 1] !== '*')) end += 1;
      if (end < text.length) {
        flush();
        nodes.push({ type: 'em', children: parseInline(text.slice(i + 1, end)) });
        i = end + 1;
        continue;
      }
    }

    if (ch === '[') {
      const close = text.indexOf('](', i + 1);
      // Klammern im Ziel paarweise zählen (z. B. https://de.wikipedia.org/wiki/RAID_(Informatik))
      let end = -1;
      if (close > -1) {
        let depth = 0;
        for (let j = close + 2; j < text.length; j += 1) {
          if (text[j] === '(') depth += 1;
          else if (text[j] === ')') {
            if (depth === 0) {
              end = j;
              break;
            }
            depth -= 1;
          }
        }
      }
      if (close > -1 && end > -1) {
        const href = text.slice(close + 2, end).trim();
        const label = text.slice(i + 1, close);
        flush();
        if (SAFE_LINK.test(href)) {
          nodes.push({ type: 'link', href, children: parseInline(label) });
        } else {
          // Unsichere Ziele (javascript:, data: …) nur als Text
          nodes.push(...parseInline(label));
        }
        i = end + 1;
        continue;
      }
    }

    buffer += ch;
    i += 1;
  }
  flush();
  return nodes;
}

const HEADING = /^(#{2,4})\s+(.+?)\s*#*$/;
const FENCE = /^```\s*([\w+-]*)\s*$/;
const HR = /^(-{3,}|\*{3,})\s*$/;
const UL_ITEM = /^(\s*)[-*+]\s+(.*)$/;
const OL_ITEM = /^(\s*)(\d+)[.)]\s+(.*)$/;
const IMAGE = /^!\[([^\]]*)\]\(\s*([^\s)]+)(?:\s+"([^"]*)")?\s*\)\s*$/;
const TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;
const CALLOUT = /^\[!(\w+)\]\s*(.*)$/;

/**
 * @param {string} line
 * @returns {string[]}
 */
function splitRow(line) {
  let row = line.trim();
  if (row.startsWith('|')) row = row.slice(1);
  if (row.endsWith('|') && !row.endsWith('\\|')) row = row.slice(0, -1);
  /** @type {string[]} */
  const cells = [];
  let cell = '';
  for (let i = 0; i < row.length; i += 1) {
    if (row[i] === '\\' && row[i + 1] === '|') {
      cell += '|';
      i += 1;
    } else if (row[i] === '|') {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += row[i];
    }
  }
  cells.push(cell.trim());
  return cells;
}

/**
 * @param {string} sep
 * @returns {Array<'left' | 'center' | 'right' | null>}
 */
function parseAlign(sep) {
  return splitRow(sep).map((c) => {
    const left = c.startsWith(':');
    const right = c.endsWith(':');
    if (left && right) return 'center';
    if (right) return 'right';
    if (left) return 'left';
    return null;
  });
}

/**
 * Ein Zeilenanfang, der einen neuen Block beginnt (beendet einen laufenden Absatz).
 * @param {string} line
 * @param {string | undefined} next
 */
function startsBlock(line, next) {
  return (
    HEADING.test(line) ||
    FENCE.test(line) ||
    HR.test(line) ||
    UL_ITEM.test(line) ||
    OL_ITEM.test(line) ||
    IMAGE.test(line.trim()) ||
    line.trimStart().startsWith('>') ||
    (line.trim().startsWith('|') && next !== undefined && TABLE_SEP.test(next))
  );
}

/**
 * Parst Markdown in eine Blockliste.
 * @param {string} markdown
 * @param {{ usedIds?: Map<string, number> }} [state] - interne Zählung für eindeutige Überschriften-IDs
 * @returns {Block[]}
 */
export function parseMarkdown(markdown, state = { usedIds: new Map() }) {
  const usedIds = state.usedIds || new Map();
  const lines = String(markdown || '').replace(/\r\n?/g, '\n').split('\n');
  /** @type {Block[]} */
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    const fence = line.match(FENCE);
    if (fence) {
      const body = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1; // schließende Fence
      blocks.push({ type: 'code', lang: fence[1] || '', value: body.join('\n') });
      continue;
    }

    const heading = line.match(HEADING);
    if (heading) {
      const text = heading[2];
      const base = slugify(text);
      const count = usedIds.get(base) || 0;
      usedIds.set(base, count + 1);
      blocks.push({
        type: 'heading',
        level: heading[1].length,
        id: count ? `${base}-${count + 1}` : base,
        children: parseInline(text)
      });
      i += 1;
      continue;
    }

    if (HR.test(line)) {
      blocks.push({ type: 'hr' });
      i += 1;
      continue;
    }

    const image = line.trim().match(IMAGE);
    if (image) {
      blocks.push({ type: 'image', alt: image[1], src: image[2], caption: image[3] || '' });
      i += 1;
      continue;
    }

    if (line.trimStart().startsWith('>')) {
      const inner = [];
      while (i < lines.length && lines[i].trimStart().startsWith('>')) {
        inner.push(lines[i].trimStart().replace(/^>\s?/, ''));
        i += 1;
      }
      const callout = inner[0]?.match(CALLOUT);
      if (callout) {
        const kind = callout[1].toLowerCase();
        blocks.push({
          type: 'callout',
          kind: CALLOUT_KINDS.includes(kind) ? kind : 'info',
          title: callout[2].trim(),
          children: parseMarkdown(inner.slice(1).join('\n'), { usedIds })
        });
      } else {
        blocks.push({ type: 'blockquote', children: parseMarkdown(inner.join('\n'), { usedIds }) });
      }
      continue;
    }

    if (line.trim().startsWith('|') && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1])) {
      const header = splitRow(line);
      const align = parseAlign(lines[i + 1]);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = splitRow(lines[i]);
        while (cells.length < header.length) cells.push('');
        rows.push(cells.slice(0, header.length).map(parseInline));
        i += 1;
      }
      blocks.push({
        type: 'table',
        align: header.map((_, idx) => align[idx] ?? null),
        header: header.map(parseInline),
        rows
      });
      continue;
    }

    const ul = line.match(UL_ITEM);
    const ol = line.match(OL_ITEM);
    if (ul || ol) {
      const result = parseList(lines, i);
      blocks.push(result.block);
      i = result.next;
      continue;
    }

    // Absatz: Folgezeilen bis Leerzeile oder Blockanfang
    const para = [line.trim()];
    i += 1;
    while (i < lines.length && lines[i].trim() && !startsBlock(lines[i], lines[i + 1])) {
      para.push(lines[i].trim());
      i += 1;
    }
    blocks.push({ type: 'paragraph', children: parseInline(para.join(' ')) });
  }

  return blocks;
}

/**
 * Liest eine Liste ab Zeile `start`. Einträge mit mehr Einrückung als die Liste bilden eine Unterliste.
 * @param {string[]} lines
 * @param {number} start
 * @returns {{ block: Block, next: number }}
 */
function parseList(lines, start) {
  const first = lines[start].match(OL_ITEM) || lines[start].match(UL_ITEM);
  const ordered = Boolean(lines[start].match(OL_ITEM));
  const indent = first ? first[1].length : 0;
  /** @type {Array<{ children: InlineNode[], sublist: Block | null }>} */
  const items = [];
  let i = start;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      // Leerzeile beendet die Liste, außer es folgt direkt ein weiterer Eintrag
      const nextLine = lines[i + 1];
      if (nextLine !== undefined && (OL_ITEM.test(nextLine) || UL_ITEM.test(nextLine))) {
        i += 1;
        continue;
      }
      break;
    }
    const m = ordered ? line.match(OL_ITEM) : line.match(UL_ITEM);
    const other = ordered ? line.match(UL_ITEM) : line.match(OL_ITEM);
    const itemIndent = (m || other)?.[1].length ?? -1;

    if (itemIndent > indent && items.length) {
      const sub = parseList(lines, i);
      items[items.length - 1].sublist = sub.block;
      i = sub.next;
      continue;
    }
    if (!m || itemIndent < indent) break;

    const text = ordered ? m[3] : m[2];
    const continuation = [text];
    i += 1;
    // Fortsetzungszeilen (eingerückt, kein neuer Eintrag)
    while (
      i < lines.length &&
      lines[i].trim() &&
      /^\s{2,}/.test(lines[i]) &&
      !UL_ITEM.test(lines[i]) &&
      !OL_ITEM.test(lines[i])
    ) {
      continuation.push(lines[i].trim());
      i += 1;
    }
    items.push({ children: parseInline(continuation.join(' ')), sublist: null });
  }

  return {
    block: { type: 'list', ordered, start: ordered && first ? Number(first[2]) : 1, items },
    next: i
  };
}

/**
 * @param {InlineNode[]} nodes
 * @returns {string}
 */
export function inlineToText(nodes) {
  return nodes.map((n) => (n.type === 'text' || n.type === 'code' ? n.value : inlineToText(n.children))).join('');
}

/**
 * Klartext für die Vorlesefunktion: Code-Blöcke und Abbildungen werden ausgelassen.
 * @param {Block[]} blocks
 * @returns {string}
 */
export function blocksToPlainText(blocks) {
  /** @type {string[]} */
  const parts = [];
  for (const b of blocks) {
    switch (b.type) {
      case 'heading':
      case 'paragraph':
        parts.push(inlineToText(b.children));
        break;
      case 'list':
        for (const item of b.items) {
          parts.push(inlineToText(item.children));
          if (item.sublist) parts.push(blocksToPlainText([item.sublist]));
        }
        break;
      case 'table':
        parts.push(b.header.map(inlineToText).join(', '));
        for (const row of b.rows) parts.push(row.map(inlineToText).join(', '));
        break;
      case 'callout':
        if (b.title) parts.push(b.title);
        parts.push(blocksToPlainText(b.children));
        break;
      case 'blockquote':
        parts.push(blocksToPlainText(b.children));
        break;
      case 'image':
        if (b.caption) parts.push(`Abbildung: ${b.caption}`);
        break;
      default:
        break;
    }
  }
  return parts.filter(Boolean).join('. ').replace(/\.\s*\./g, '.');
}

/**
 * Überschriften der Ebene 2 für das Inhaltsverzeichnis.
 * @param {Block[]} blocks
 * @returns {Array<{ id: string, text: string }>}
 */
export function extractToc(blocks) {
  return blocks
    .filter((b) => b.type === 'heading' && b.level === 2)
    .map((b) => ({ id: /** @type {any} */ (b).id, text: inlineToText(/** @type {any} */ (b).children) }));
}

/**
 * Alle Bildquellen (für den Integritätstest der Artikel).
 * @param {Block[]} blocks
 * @returns {string[]}
 */
export function collectImageSources(blocks) {
  /** @type {string[]} */
  const out = [];
  for (const b of blocks) {
    if (b.type === 'image') out.push(b.src);
    if (b.type === 'callout' || b.type === 'blockquote') out.push(...collectImageSources(b.children));
  }
  return out;
}

/**
 * Geschätzte Lernzeit in Minuten (ca. 130 Wörter pro Minute: Fachtext mit Tabellen und Rechenwegen).
 * @param {string} text
 * @returns {number}
 */
export function estimateReadMinutes(text) {
  const words = String(text || '').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 130));
}
