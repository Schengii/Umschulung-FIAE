// ============================================================
// Amazon 2.0 – Barcode & NFC Store Scanner Engine
// ============================================================
import type { Product } from '../types';

export interface BarcodeMatchResult {
  barcode: string;
  barcodeType: 'EAN-13' | 'UPC-A' | 'QR-Code' | 'NFC-Tag';
  product: Product;
  retailStorePrice: number;
  amazonPrice: number;
  savingsEur: number;
  savingsPercent: number;
}

export function matchBarcodeToProduct(barcode: string, allProducts: Product[]): BarcodeMatchResult {
  // Pick matching or default product
  const product = allProducts.find(p => p.asin === barcode || p.id === barcode) || allProducts[0];
  const amazonPrice = product.price;
  const retailStorePrice = +(amazonPrice * 1.22).toFixed(2);
  const savingsEur = +(retailStorePrice - amazonPrice).toFixed(2);
  const savingsPercent = Math.round((savingsEur / retailStorePrice) * 100);

  return {
    barcode: barcode || '4006381333931',
    barcodeType: 'EAN-13',
    product,
    retailStorePrice,
    amazonPrice,
    savingsEur,
    savingsPercent,
  };
}
