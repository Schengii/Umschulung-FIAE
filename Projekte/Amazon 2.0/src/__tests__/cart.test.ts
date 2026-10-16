import { describe, it, expect, beforeEach } from 'vitest';
import { state } from '../store';

describe('Cart Management Suite', () => {
  beforeEach(() => {
    state.cart = [];
  });

  it('adds new items to cart with quantities', () => {
    const product = state.products[0];
    state.cart.push({ product, qty: 1, addedAt: Date.now() });

    expect(state.cart.length).toBe(1);
    expect(state.cart[0].qty).toBe(1);
  });

  it('updates item quantities and calculates total correctly', () => {
    const p1 = { ...state.products[0], price: 50 };
    const p2 = { ...state.products[1], price: 25 };

    state.cart = [
      { product: p1, qty: 2 },
      { product: p2, qty: 3 },
    ];

    const total = state.cart.reduce((s, i) => s + i.product.price * i.qty, 0);
    const count = state.cart.reduce((s, i) => s + i.qty, 0);

    expect(total).toBe(175);
    expect(count).toBe(5);
  });

  it('removes item when quantity is 0', () => {
    const product = state.products[0];
    state.cart = [{ product, qty: 1 }];

    state.cart = state.cart.filter(item => item.product.id !== product.id);
    expect(state.cart.length).toBe(0);
  });
});
