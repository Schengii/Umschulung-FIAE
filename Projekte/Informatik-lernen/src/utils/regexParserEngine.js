/**
 * RegEx Parser Engine & Visual Railroad Diagram Tokenizer
 * Parses regular expressions into abstract node trees for visualization and explanation.
 */

export function parseRegexTokens(pattern) {
  if (!pattern) return [];

  const tokens = [];
  let i = 0;

  while (i < pattern.length) {
    const char = pattern[i];

    if (char === '^') {
      tokens.push({ type: 'anchor_start', label: 'Start der Zeile (^)', raw: '^' });
      i++;
    } else if (char === '$') {
      tokens.push({ type: 'anchor_end', label: 'Ende der Zeile ($)', raw: '$' });
      i++;
    } else if (char === '\\') {
      const nextChar = pattern[i + 1] || '';
      let label = `Escape (${char}${nextChar})`;
      if (nextChar === 'd') label = 'Ziffer [0-9] (\\d)';
      else if (nextChar === 'w') label = 'Wortzeichen [a-zA-Z0-9_] (\\w)';
      else if (nextChar === 's') label = 'Whitespace Leerzeichen (\\s)';
      else if (nextChar === '.') label = 'Punkt Literal (.)';

      tokens.push({ type: 'escaped', label, raw: `\\${nextChar}` });
      i += 2;
    } else if (char === '[') {
      const endIdx = pattern.indexOf(']', i);
      if (endIdx !== -1) {
        const cls = pattern.substring(i, endIdx + 1);
        tokens.push({ type: 'char_class', label: `Zeichenklasse ${cls}`, raw: cls });
        i = endIdx + 1;
      } else {
        tokens.push({ type: 'literal', label: `Literal '['`, raw: '[' });
        i++;
      }
    } else if (char === '(') {
      tokens.push({ type: 'group_start', label: 'Gruppe Start (', raw: '(' });
      i++;
    } else if (char === ')') {
      tokens.push({ type: 'group_end', label: 'Gruppe Ende )', raw: ')' });
      i++;
    } else if (char === '|') {
      tokens.push({ type: 'or_branch', label: 'ODER Verzweigung (|)', raw: '|' });
      i++;
    } else if (char === '*' || char === '+' || char === '?') {
      let qLabel = '0 oder mehrmals (*)';
      if (char === '+') qLabel = '1 oder mehrmals (+)';
      if (char === '?') qLabel = '0 oder 1 mal (optional ?)';
      tokens.push({ type: 'quantifier', label: qLabel, raw: char });
      i++;
    } else if (char === '{') {
      const endIdx = pattern.indexOf('}', i);
      if (endIdx !== -1) {
        const qRange = pattern.substring(i, endIdx + 1);
        tokens.push({ type: 'quantifier_range', label: `Anzahlbereich ${qRange}`, raw: qRange });
        i = endIdx + 1;
      } else {
        tokens.push({ type: 'literal', label: `Literal '{'`, raw: '{' });
        i++;
      }
    } else {
      tokens.push({ type: 'literal', label: `Literal '${char}'`, raw: char });
      i++;
    }
  }

  return tokens;
}

export function testRegexMatch(pattern, flags = 'g', testString = '') {
  try {
    const reg = new RegExp(pattern, flags);
    const matches = [];
    let match;

    if (!flags.includes('g')) {
      match = reg.exec(testString);
      if (match) {
        matches.push({
          index: match.index,
          value: match[0],
          groups: match.slice(1)
        });
      }
    } else {
      while ((match = reg.exec(testString)) !== null) {
        matches.push({
          index: match.index,
          value: match[0],
          groups: match.slice(1)
        });
        if (match.index === reg.lastIndex) reg.lastIndex++;
      }
    }

    return {
      isValid: true,
      matchCount: matches.length,
      matches,
      isMatch: matches.length > 0
    };
  } catch (err) {
    return {
      isValid: false,
      error: err.message,
      matches: [],
      matchCount: 0,
      isMatch: false
    };
  }
}
