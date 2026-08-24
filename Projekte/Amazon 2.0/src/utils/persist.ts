// ============================================================
// Amazon 2.0 – localStorage Persistence Service
// ============================================================
import type { AppState } from '../types';

const PREFIX = 'amz_';

export const KEYS = {
  cart: `${PREFIX}cart`,
  orders: `${PREFIX}orders`,
  wishlist: `${PREFIX}wishlist`,
  compare: `${PREFIX}compare`,
  recentlyViewed: `${PREFIX}recently_viewed`,
  activeCoupons: `${PREFIX}active_coupons`,
  productCoupons: `${PREFIX}product_coupons`,
  priceAlerts: `${PREFIX}price_alerts`,
  redeemedGiftCodes: `${PREFIX}redeemed_gift_codes`,
  customReviews: `${PREFIX}custom_reviews`,
  qa: `${PREFIX}qa`,
  profile: `${PREFIX}profile`,
  notifications: `${PREFIX}notifications`,
  balance: `${PREFIX}balance`,
  theme: `${PREFIX}theme`,
  filters: `${PREFIX}filters`,
} as const;

export type StorageKey = (typeof KEYS)[keyof typeof KEYS];

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('[Amazon 2.0] localStorage write failed:', key, e);
  }
}

export function removeStorage(key: string): void {
  localStorage.removeItem(key);
}

export function clearAllStorage(): void {
  Object.values(KEYS).forEach(k => localStorage.removeItem(k));
}

/**
 * Persists the relevant slices of AppState to localStorage.
 */
export function persistState(state: AppState): void {
  writeStorage(KEYS.cart, state.cart);
  writeStorage(KEYS.orders, state.orders);
  writeStorage(KEYS.wishlist, state.wishlist);
  writeStorage(KEYS.compare, state.compareList);
  writeStorage(KEYS.recentlyViewed, state.recentlyViewed);
  writeStorage(KEYS.activeCoupons, state.activeCoupons);
  writeStorage(KEYS.productCoupons, state.appliedProductCoupons);
  writeStorage(KEYS.priceAlerts, state.priceAlerts);
  writeStorage(KEYS.redeemedGiftCodes, state.redeemedGiftCodes);
  writeStorage(KEYS.profile, state.userProfile);
  writeStorage(KEYS.notifications, state.notifications);
  writeStorage(KEYS.balance, state.userBalance);
  writeStorage(KEYS.theme, state.theme);
}
