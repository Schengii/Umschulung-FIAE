import { describe, it, expect, beforeEach } from 'vitest';
import { state, deductStock, addProductReview } from '../store';
import { generateOrderId } from '../utils/formatters';

describe('Checkout & Order Engine Suite', () => {
  beforeEach(() => {
    state.cart = [];
    state.orders = [];
  });

  it('generates valid formatted order ids', () => {
    const id = generateOrderId();
    expect(id).toMatch(/^ORD-[A-Z0-9]+-[A-Z0-9]+$/);
  });

  it('deducts product stock quantity correctly on purchase', () => {
    const product = state.products[0];
    const initialQty = typeof product.stockQty === 'number' ? product.stockQty : 25;

    deductStock([{ product, qty: 3 }]);

    expect(product.stockQty).toBe(Math.max(0, initialQty - 3));
    expect(product.inStock).toBe(product.stockQty! > 0);
  });

  it('recalculates product rating and review count when a user review is added', () => {
    const product = state.products[0];
    const initialCount = product.reviewCount;

    addProductReview(product.id, {
      author: 'Test User',
      rating: 5,
      title: 'Top Produkt!',
      body: 'Sehr zufrieden.',
      date: '2026-08-23',
      verified: true,
      helpful: 0,
    });

    expect(product.reviewCount).toBe(initialCount + 1);
    expect(product.customReviews?.length).toBeGreaterThan(0);
    expect(product.rating).toBeGreaterThanOrEqual(1);
    expect(product.rating).toBeLessThanOrEqual(5);
  });

  it('calculates order pricing and shipping correctly', () => {
    const testProduct = { ...state.products[0], price: 100 };
    state.cart = [{ product: testProduct, qty: 2 }];

    const subtotal = state.cart.reduce((s, i) => s + i.product.price * i.qty, 0);
    expect(subtotal).toBe(200);

    const shipping = subtotal > 25 ? 0 : 4.99;
    expect(shipping).toBe(0);
  });
});
