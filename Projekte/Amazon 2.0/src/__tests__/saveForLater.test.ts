import { describe, it, expect } from 'vitest';
import { state, moveToSavedForLater, moveBackToCart } from '../store';

describe('Save For Later (Für später merken)', () => {
  it('moves cart item to saved for later and restores it to cart', () => {
    const prod = state.products[0];
    state.cart = [{ product: prod, qty: 2, addedAt: Date.now() }];
    state.savedForLater = [];

    // Move to saved for later
    moveToSavedForLater(prod.id);
    expect(state.cart.some(c => c.product.id === prod.id)).toBe(false);
    expect(state.savedForLater.some(s => s.product.id === prod.id)).toBe(true);

    // Move back to cart
    moveBackToCart(prod.id);
    expect(state.savedForLater.some(s => s.product.id === prod.id)).toBe(false);
    expect(state.cart.some(c => c.product.id === prod.id)).toBe(true);
  });
});
