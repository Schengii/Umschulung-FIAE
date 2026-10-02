import { describe, it, expect } from 'vitest';
import { escapeHtml } from './html-utils.js';

describe('escapeHtml', () => {
    it('escapes all HTML-significant characters', () => {
        expect(escapeHtml(`<img src=x onerror="alert('1')">&`)).toBe(
            '&lt;img src=x onerror=&quot;alert(&#039;1&#039;)&quot;&gt;&amp;'
        );
    });

    it('returns an empty string for null and undefined', () => {
        expect(escapeHtml(null)).toBe('');
        expect(escapeHtml(undefined)).toBe('');
    });

    it('coerces non-strings and keeps plain text unchanged', () => {
        expect(escapeHtml(42)).toBe('42');
        expect(escapeHtml('Hallo Welt')).toBe('Hallo Welt');
    });
});
