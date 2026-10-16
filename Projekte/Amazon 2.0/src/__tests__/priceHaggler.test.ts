import { describe, it, expect } from 'vitest';
import { evaluateHaggleOffer } from '../components/priceHaggler';

describe('AI Price Haggler Negotiation Engine Suite', () => {
  it('accepts fair 5-8% discount offer', () => {
    const outcome = evaluateHaggleOffer(100, 94); // 6% discount
    expect(outcome.accepted).toBe(true);
    expect(outcome.discountPercent).toBe(6);
    expect(outcome.reply).toContain('Einverstanden');
  });

  it('provides counter-offer for moderate 15% discount request', () => {
    const outcome = evaluateHaggleOffer(100, 85); // 15% discount
    expect(outcome.accepted).toBe(false);
    expect(outcome.reply).toContain('Wie wäre es mit');
  });

  it('rejects extreme low-ball offers below 80%', () => {
    const outcome = evaluateHaggleOffer(100, 50); // 50% discount
    expect(outcome.accepted).toBe(false);
    expect(outcome.discountPercent).toBe(0);
    expect(outcome.reply).toContain('deutlich unter');
  });
});
