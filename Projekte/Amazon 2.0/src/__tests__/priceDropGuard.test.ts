import { describe, it, expect, beforeEach } from 'vitest';
import { state } from '../store';
import { scanForPriceDrops } from '../components/priceDropGuard';

describe('Price Drop Guard Engine Suite', () => {
  beforeEach(() => {
    state.orders = [];
  });

  it('scans for price drop claims when user has orders with price reductions', () => {
    const product = state.products[0];
    state.orders = [
      {
        id: 'ORD-TEST-1',
        placedAt: Date.now() - 86400000 * 2,
        status: 'delivered',
        total: 100,
        items: [
          {
            product,
            qty: 1,
            priceAtPurchase: product.price + 20, // Paid 20€ more than current price
          },
        ],
        shippingAddress: state.userProfile.addresses[0] ?? { name: 'Test', street: 'St', city: 'City', zip: '12345', country: 'DE' },
        paymentMethod: 'Kreditkarte',
      },
    ];

    const claims = scanForPriceDrops(state);
    expect(claims.length).toBeGreaterThan(0);
    expect(claims[0].difference).toBe(20);
    expect(claims[0].orderId).toBe('ORD-TEST-1');
  });

  it('returns empty array when no orders exist', () => {
    state.orders = [];
    const claims = scanForPriceDrops(state);
    expect(claims.length).toBe(0);
  });
});
