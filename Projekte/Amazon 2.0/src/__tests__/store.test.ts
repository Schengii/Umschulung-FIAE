import { describe, it, expect, beforeEach } from 'vitest';
import { state, on, emit, saveCart } from '../store';

describe('Central State Store Suite', () => {
  beforeEach(() => {
    state.cart = [];
    state.wishlist = [];
  });

  it('initializes default state properties', () => {
    expect(state).toBeDefined();
    expect(Array.isArray(state.products)).toBe(true);
    expect(state.products.length).toBeGreaterThan(0);
    expect(state.theme).toMatch(/light|dark/);
  });

  it('supports event listener subscription and emission', () => {
    let triggered = false;
    const unsubscribe = on('cart:changed', () => {
      triggered = true;
    });

    emit('cart:changed');
    expect(triggered).toBe(true);

    unsubscribe();
  });

  it('allows adding items to cart and mutating state', () => {
    const testProduct = state.products[0];
    state.cart.push({ product: testProduct, qty: 2, addedAt: Date.now() });

    expect(state.cart.length).toBe(1);
    expect(state.cart[0].product.id).toBe(testProduct.id);
    expect(state.cart[0].qty).toBe(2);

    expect(() => saveCart()).not.toThrow();
  });
});
