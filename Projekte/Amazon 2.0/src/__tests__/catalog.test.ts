import { describe, it, expect } from 'vitest';
import { filterProducts } from '../components/catalog';
import { PRODUCTS } from '../data/products';
import type { AppState } from '../types';

describe('Catalog Filtering Engine Suite', () => {
  const mockState: AppState = {
    products: PRODUCTS,
    cart: [],
    wishlist: [],
    compareList: [],
    orders: [],
    recentlyViewed: [],
    userProfile: {
      name: 'Max Mustermann',
      email: 'max@example.com',
      memberSince: '2023-01-01',
      defaultAddressIdx: 0,
      addresses: [],
      paymentMethods: [],
      isPrime: true,
    },
    userBalance: { amount: 50, currency: 'EUR', transactions: [] },
    notifications: [],
    priceAlerts: [],
    redeemedGiftCodes: [],
    appliedProductCoupons: {},
    activeCoupons: [],
    filters: {
      searchQuery: '',
      category: 'all',
      brand: 'all',
      inStockOnly: false,
      dealsOnly: false,
      primeOnly: false,
      minRating: 0,
      maxPrice: 2000,
      sortBy: 'featured',
    },
    theme: 'light',
  };

  it('returns all products when no filters are set', () => {
    const results = filterProducts(mockState);
    expect(results.length).toBe(PRODUCTS.length);
  });

  it('filters products by text search query', () => {
    const state = { ...mockState, filters: { ...mockState.filters, searchQuery: 'Kopfhörer' } };
    const results = filterProducts(state);
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(p => p.title.toLowerCase().includes('kopfhörer') || p.description.toLowerCase().includes('kopfhörer') || p.category.toLowerCase().includes('kopfhörer'))).toBe(true);
  });

  it('filters products by category', () => {
    const state = { ...mockState, filters: { ...mockState.filters, category: 'audio' } };
    const results = filterProducts(state);
    expect(results.every(p => p.category === 'audio')).toBe(true);
  });

  it('filters products by Prime status', () => {
    const state = { ...mockState, filters: { ...mockState.filters, primeOnly: true } };
    const results = filterProducts(state);
    expect(results.every(p => p.isPrime)).toBe(true);
  });

  it('filters products by minimum rating', () => {
    const state = { ...mockState, filters: { ...mockState.filters, minRating: 4.5 } };
    const results = filterProducts(state);
    expect(results.every(p => p.rating >= 4.5)).toBe(true);
  });
});
