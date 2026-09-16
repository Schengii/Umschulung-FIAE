import { describe, it, expect } from 'vitest';
import { parseRegexTokens, testRegexMatch } from './regexParserEngine';

describe('regexParserEngine', () => {
  it('zerlegt E-Mail RegEx in verständliche Token-Nodes', () => {
    const pattern = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$';
    const tokens = parseRegexTokens(pattern);

    expect(tokens.length).toBeGreaterThan(5);
    expect(tokens[0].type).toBe('anchor_start');
    expect(tokens[tokens.length - 1].type).toBe('anchor_end');
    expect(tokens.some(t => t.type === 'char_class')).toBe(true);
    expect(tokens.some(t => t.type === 'quantifier_range')).toBe(true);
  });

  it('führt Regex Match-Tests fehlerfrei aus', () => {
    const res = testRegexMatch('^\\d{5}$', 'g', '12345');
    expect(res.isValid).toBe(true);
    expect(res.isMatch).toBe(true);
    expect(res.matchCount).toBe(1);
    expect(res.matches[0].value).toBe('12345');
  });

  it('fängt fehlerhafte RegEx Syntax sauber ab', () => {
    const badRes = testRegexMatch('[a-z(', 'g', 'test');
    expect(badRes.isValid).toBe(false);
    expect(badRes.error).toBeDefined();
  });
});
