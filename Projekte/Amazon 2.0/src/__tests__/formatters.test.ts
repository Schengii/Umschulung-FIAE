import { describe, it, expect } from 'vitest';
import { formatPrice, renderStars, formatDiscount, sanitizeHtml, generateId } from '../utils/formatters';

describe('Formatters Utility Suite', () => {
  it('formats prices correctly in German currency format', () => {
    const formatted = formatPrice(19.99).replace(/\s/g, ' ');
    expect(formatted).toBe('19,99 €');
  });

  it('calculates discount percentage correctly', () => {
    expect(formatDiscount(100, 80)).toBe('-20%');
    expect(formatDiscount(50, 25)).toBe('-50%');
    expect(formatDiscount(100, 100)).toBe('-0%');
  });

  it('renders star ratings correctly', () => {
    const starsHtml = renderStars(4.5);
    expect(starsHtml).toContain('★');
    expect(starsHtml).toContain('4.5');
  });

  it('sanitizes HTML strings to prevent XSS', () => {
    const dirty = '<script>alert("xss")</script>Hello <b>World</b>';
    const clean = sanitizeHtml(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('&lt;script&gt;');
  });

  it('generates unique random IDs', () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toBe(id2);
    expect(id1.length).toBeGreaterThan(4);
  });
});
