import { describe, it, expect } from 'vitest';
import { formatMarkdown } from './markdown';

describe('formatMarkdown', () => {
  it('formatiert fetten Text und Aufzählungen', () => {
    expect(formatMarkdown('**Wichtig** beachten')).toBe('<strong>Wichtig</strong> beachten');
    expect(formatMarkdown('* Punkt eins\n* Punkt zwei')).toBe('• Punkt eins\n• Punkt zwei');
  });

  it('escaped HTML, damit keine Skripte eingeschleust werden können', () => {
    const out = formatMarkdown('<img src=x onerror="alert(1)"> **ok**');
    expect(out).not.toContain('<img');
    expect(out).toContain('&lt;img');
    expect(out).toContain('<strong>ok</strong>');
  });

  it('liefert bei leerem Text einen leeren String', () => {
    expect(formatMarkdown('')).toBe('');
  });
});
