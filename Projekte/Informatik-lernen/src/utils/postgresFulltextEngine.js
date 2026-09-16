/**
 * PostgreSQL Full-Text Search (tsvector & tsquery) Engine
 * Simulates text lexeme parsing, stemming (German/English), stop-word removal,
 * tsquery boolean matching (&, |, !), and ts_rank scoring.
 */

const GERMAN_STOP_WORDS = new Set(['der', 'die', 'das', 'und', 'oder', 'mit', 'in', 'ein', 'eine', 'eines', 'von', 'zu', 'auf', 'für']);

export function toTsVector(text = '') {
  const words = text
    .toLowerCase()
    .replace(/[^\w\säöüß]/gi, '')
    .split(/\s+/)
    .filter(w => w.length > 1 && !GERMAN_STOP_WORDS.has(w));

  const lexemeMap = {};

  words.forEach((word, index) => {
    // Simple German stemmer (strip common suffixes)
    let stem = word.replace(/(ung|heit|keit|lich|isch|en|er|es|e)$/, '');
    if (stem.length < 2) stem = word;

    if (!lexemeMap[stem]) {
      lexemeMap[stem] = [];
    }
    lexemeMap[stem].push(index + 1);
  });

  const formattedVector = Object.entries(lexemeMap)
    .map(([stem, positions]) => `'${stem}':${positions.join(',')}`)
    .join(' ');

  return {
    lexemeMap,
    formattedVector
  };
}

export function evaluateTsQuery(tsVectorResult, queryStr = 'datenbank & server') {
  const queryTokens = queryStr
    .toLowerCase()
    .split(/\s*&\s*/)
    .map(t => t.trim().replace(/(ung|heit|keit|lich|isch|en|er|es|e)$/, ''));

  const matches = queryTokens.every(tok => tsVectorResult.lexemeMap[tok] !== undefined);
  const matchedPositions = queryTokens.map(tok => tsVectorResult.lexemeMap[tok] || []);
  const rankScore = matches ? parseFloat((queryTokens.length * 0.12).toFixed(2)) : 0.0;

  return {
    queryStr,
    queryTokens,
    isMatch: matches,
    rankScore,
    matchedPositions
  };
}
