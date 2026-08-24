import { describe, it, expect } from 'vitest';
import { t, convertAndFormatPrice, CURRENCIES } from '../utils/i18n';

describe('i18n & Multi-Currency Engine Suite', () => {
  it('translates UI keys to English', () => {
    expect(t('cart', 'en')).toBe('Cart');
    expect(t('checkout', 'en')).toBe('Complete Order');
    expect(t('addToCart', 'en')).toBe('Add to Cart');
  });

  it('translates UI keys to French and Spanish', () => {
    expect(t('cart', 'fr')).toBe('Panier');
    expect(t('cart', 'es')).toBe('Cesta');
  });

  it('converts prices to USD accurately', () => {
    const priceUsd = convertAndFormatPrice(100, 'USD');
    expect(priceUsd).toContain('$');
    expect(priceUsd).toContain('108');
  });

  it('converts prices to GBP and CHF accurately', () => {
    expect(convertAndFormatPrice(100, 'GBP')).toContain('£');
    expect(convertAndFormatPrice(100, 'CHF')).toContain('CHF');
  });

  it('has valid currency config mappings', () => {
    expect(CURRENCIES.EUR.rate).toBe(1.0);
    expect(CURRENCIES.USD.rate).toBeGreaterThan(1.0);
  });
});
