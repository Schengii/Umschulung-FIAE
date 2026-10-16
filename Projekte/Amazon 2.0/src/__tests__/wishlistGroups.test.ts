import { describe, it, expect } from 'vitest';
import { state, createWishlistGroup, deleteWishlistGroup } from '../store';

describe('Multi-Wishlists (Wishlist Groups)', () => {
  it('creates and deletes custom wishlist groups', () => {
    const group = createWishlistGroup('Geburtstags-Liste');
    expect(group.id).toBeDefined();
    expect(group.title).toBe('Geburtstags-Liste');
    expect(state.wishlistGroups?.some(g => g.id === group.id)).toBe(true);

    // Delete group
    deleteWishlistGroup(group.id);
    expect(state.wishlistGroups?.some(g => g.id === group.id)).toBe(false);
  });

  it('prevents deletion of default wishlist group', () => {
    const defaultGroup = state.wishlistGroups?.find(g => g.isDefault);
    if (defaultGroup) {
      deleteWishlistGroup(defaultGroup.id);
      expect(state.wishlistGroups?.some(g => g.id === defaultGroup.id)).toBe(true);
    }
  });
});
