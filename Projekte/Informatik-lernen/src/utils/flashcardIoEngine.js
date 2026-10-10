// @ts-check
/**
 * @file flashcardIoEngine.js
 * Import & Export Engine für IHK-Lernkarten (CSV / TSV, Anki-kompatibles Format, JSON)
 */

/**
 * @typedef {object} FlashcardItem
 * @property {number | string} id
 * @property {string} category
 * @property {string} difficulty
 * @property {string} front
 * @property {string} back
 * @property {number} [interval]
 * @property {number} [repetitions]
 * @property {number} [easeFactor]
 */

/**
 * Exportiert Lernkarten in das tabulatorgetrennte Anki-Import-Format (TSV: Front \t Back \t Tags)
 * @param {FlashcardItem[]} cards
 * @returns {string}
 */
export function exportToAnkiTsv(cards) {
  const header = '#separator:tab\n#html:false\n#tags column:3\n';
  const rows = cards.map(c => {
    const cleanFront = c.front.replace(/\t/g, ' ').replace(/\n/g, '<br>');
    const cleanBack = c.back.replace(/\t/g, ' ').replace(/\n/g, '<br>');
    const tags = `${c.category.replace(/\s+/g, '_')}_${c.difficulty.replace(/\s+/g, '_')}`;
    return `${cleanFront}\t${cleanBack}\t${tags}`;
  });
  return header + rows.join('\n');
}

/**
 * Exportiert Lernkarten im standardisierten RFC 4180 CSV-Format
 * @param {FlashcardItem[]} cards
 * @returns {string}
 */
export function exportToCsv(cards) {
  const escapeCsv = (/** @type {string} */ val) => {
    if (val.includes('"') || val.includes(',') || val.includes('\n')) {
      return `"${val.replace(/"/g, '""')}"`;
    }
    return val;
  };

  const header = ['ID', 'Kategorie', 'Schwierigkeit', 'Vorderseite', 'Rueckseite'].join(';');
  const rows = cards.map(c => [
    c.id,
    escapeCsv(c.category),
    escapeCsv(c.difficulty),
    escapeCsv(c.front),
    escapeCsv(c.back)
  ].join(';'));

  return [header, ...rows].join('\n');
}

/**
 * Parst CSV/TSV Text und extrahiert neue Lernkarten
 * @param {string} text
 * @returns {{ cards: FlashcardItem[], errors: string[] }}
 */
export function importFromCsvOrTsv(text) {
  /** @type {FlashcardItem[]} */
  const cards = [];
  /** @type {string[]} */
  const errors = [];

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#'));

  if (lines.length === 0) {
    return { cards, errors: ['Die Datei enthält keine lesbaren Zeilen.'] };
  }

  // Erkennung des Trennzeichens: Tab oder Semikolon oder Komma
  const sampleLine = lines[0];
  let delimiter = '\t';
  if (sampleLine.includes(';') && !sampleLine.includes('\t')) delimiter = ';';
  else if (sampleLine.includes(',') && !sampleLine.includes('\t')) delimiter = ',';

  // Überspringe Header falls vorhanden
  const startIndex = lines[0].toLowerCase().includes('front') || lines[0].toLowerCase().includes('vorderseite') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const rawLine = lines[i];
    const parts = rawLine.split(delimiter).map(p => p.trim().replace(/^"|"$/g, '').replace(/<br>/gi, '\n'));

    if (parts.length >= 2) {
      const front = parts[0];
      const back = parts[1];
      const category = parts[2] || 'Importiert';
      const difficulty = parts[3] || 'Azubi / IHK';

      cards.push({
        id: `import_${Date.now()}_${i}`,
        category,
        difficulty,
        front,
        back
      });
    } else {
      errors.push(`Zeile ${i + 1} konnte nicht geparst werden (mindestens Front und Back benötigt).`);
    }
  }

  return { cards, errors };
}
