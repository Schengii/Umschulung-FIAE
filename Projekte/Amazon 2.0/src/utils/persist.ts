// ============================================================
// Amazon 2.0 – localStorage Persistence Service
// ============================================================
import type { AppState } from '../types';

const PREFIX = 'amz_';

export const KEYS = {
  cart: `${PREFIX}cart`,
  orders: `${PREFIX}orders`,
  wishlist: `${PREFIX}wishlist`,
  wishlistGroups: `${PREFIX}wishlist_groups`,
  savedForLater: `${PREFIX}saved_for_later`,
  subscriptions: `${PREFIX}subscriptions`,
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
  stockOverrides: `${PREFIX}stock_overrides`,
  searchHistory: `${PREFIX}search_history`,
} as const;

export type StorageKey = (typeof KEYS)[keyof typeof KEYS];

function getLocalStorage(): Storage | null {
  try {
    if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
      return window.localStorage;
    }
  } catch {
    // In restricted iframe or node environment
  }
  return null;
}

export function readStorage<T>(key: string, fallback: T): T {
  const storage = getLocalStorage();
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('[Amazon 2.0] localStorage write failed:', key, e);
  }
}

export function removeStorage(key: string): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    storage.removeItem(key);
  } catch {
    // ignore
  }
}

export function clearAllStorage(): void {
  const storage = getLocalStorage();
  if (!storage) return;
  try {
    Object.values(KEYS).forEach(k => storage.removeItem(k));
  } catch {
    // ignore
  }
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
