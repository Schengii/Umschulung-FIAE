import { describe, it, expect } from 'vitest';
import { matchBarcodeToProduct } from '../utils/barcodeScanner';
import { state } from '../store';

describe('Barcode & NFC Store Scanner Engine', () => {
  it('matches barcode or EAN to product and calculates retail price savings', () => {
    const res = matchBarcodeToProduct('e001', state.products);

    expect(res.product).toBeDefined();
    expect(res.amazonPrice).toBe(res.product.price);
    expect(res.retailStorePrice).toBeGreaterThan(res.amazonPrice);
    expect(res.savingsEur).toBeGreaterThan(0);
    expect(res.savingsPercent).toBeGreaterThan(0);
  });
});
