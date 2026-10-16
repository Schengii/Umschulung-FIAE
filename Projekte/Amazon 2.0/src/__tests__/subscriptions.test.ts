import { describe, it, expect } from 'vitest';
import { calculateSubscriptionDiscount } from '../components/subscriptions';
import { state, addSubscription, updateSubscriptionStatus } from '../store';

describe('Subscribe & Save (Spar-Abo)', () => {
  it('calculates discount tiers correctly for different frequencies', () => {
    const disc1 = calculateSubscriptionDiscount(100, 1);
    expect(disc1.discountPercent).toBe(10);
    expect(disc1.discountedPrice).toBe(90);

    const disc3 = calculateSubscriptionDiscount(100, 3);
    expect(disc3.discountPercent).toBe(12);
    expect(disc3.discountedPrice).toBe(88);

    const disc6 = calculateSubscriptionDiscount(100, 6);
    expect(disc6.discountPercent).toBe(15);
    expect(disc6.discountedPrice).toBe(85);
  });

  it('adds and updates subscription status in state', () => {
    const sub = addSubscription({
      productId: 'prod-test-1',
      productTitle: 'Premium Kaffee Bohnen 1kg',
      productImage: 'https://example.com/img.jpg',
      originalPrice: 24.99,
      discountedPrice: 22.49,
      discountPercent: 10,
      intervalMonths: 1,
      nextDeliveryDate: '01.10.2026',
      shippingAddress: state.userProfile.addresses[0],
      paymentMethod: 'PayPal',
    });

    expect(sub.id).toBeDefined();
    expect(sub.status).toBe('active');
    expect(state.subscriptions?.some(s => s.id === sub.id)).toBe(true);

    // Pause subscription
    updateSubscriptionStatus(sub.id, 'paused');
    const updated = state.subscriptions?.find(s => s.id === sub.id);
    expect(updated?.status).toBe('paused');

    // Cancel subscription
    updateSubscriptionStatus(sub.id, 'cancelled');
    expect(state.subscriptions?.find(s => s.id === sub.id)?.status).toBe('cancelled');
  });
});
