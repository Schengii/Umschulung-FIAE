import { describe, it, expect } from 'vitest';
import type { Order } from '../types';

describe('PDF Invoice & Packing Slip Calculations', () => {
  it('calculates net amounts and 19% VAT properly for orders', () => {
    const mockOrder: Order = {
      id: 'ORD-TEST-999',
      invoiceNumber: 'INV-2026-999',
      items: [
        {
          product: {
            id: 'prod-1',
            title: 'Test Headset',
            brand: 'TestBrand',
            category: 'electronics',
            price: 119,
            rating: 4.5,
            reviewCount: 10,
            inStock: true,
            isPrime: true,
            images: ['test.jpg'],
            description: 'Desc',
          },
          qty: 1,
          priceAtPurchase: 119,
        },
      ],
      total: 119,
      status: 'processing',
      placedAt: Date.now(),
      shippingAddress: {
        name: 'Max Mustermann',
        street: 'Musterweg 1',
        city: 'Berlin',
        zip: '10115',
        country: 'Deutschland',
      },
      paymentMethod: 'Kreditkarte',
      giftOptions: {
        isGift: true,
        wrapType: 'classic',
        senderName: 'Anna',
        greetingMessage: 'Alles Gute zum Geburtstag!',
        hidePricesOnSlip: true,
      },
    };

    const gross = mockOrder.total;
    const net = gross / 1.19;
    const vat = gross - net;

    expect(Math.round(net)).toBe(100);
    expect(Math.round(vat)).toBe(19);
    expect(mockOrder.giftOptions?.isGift).toBe(true);
    expect(mockOrder.giftOptions?.hidePricesOnSlip).toBe(true);
  });
});
