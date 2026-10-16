import { describe, it, expect, beforeEach } from 'vitest';
import { state } from '../store';
import { broadcastItemAdd, joinRoom } from '../components/multiplayerCart';

describe('Multiplayer & Shared Shopping Suite', () => {
  beforeEach(() => {
    state.cart = [];
  });

  it('safely handles join room initialization', () => {
    expect(() => joinRoom(state, 'ROOM-9999', false)).not.toThrow();
  });

  it('broadcasts item additions and updates local state when received from peer', () => {
    const product = state.products[0];
    broadcastItemAdd(state, product, 2, 'Sophie M.');

    expect(state.cart.length).toBe(1);
    expect(state.cart[0].product.id).toBe(product.id);
    expect(state.cart[0].qty).toBe(2);
  });
});
