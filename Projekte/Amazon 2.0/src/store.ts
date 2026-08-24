// ============================================================
// Amazon 2.0 – Reactive Application Store with Pub/Sub
// ============================================================
import type {
  AppState,
  StoreEvent,
  EventCallback,
  UserProfile,
  UserBalance,
  Notification,
  Coupon,
} from './types';
import { PRODUCTS } from './data/products';
import { SAMPLE_COUPONS } from './data/heroSlides';
import { readStorage, writeStorage, KEYS } from './utils/persist';

// ── Default Values ────────────────────────────────────────────
function defaultProfile(): UserProfile {
  return readStorage<UserProfile>(KEYS.profile, {
    name: 'Max Mustermann',
    email: 'max.mustermann@example.de',
    isPrime: false,
    memberSince: '2024-01-15',
    addresses: [
      {
        name: 'Max Mustermann',
        street: 'Musterstraße 1',
        city: 'Berlin',
        zip: '10115',
        country: 'Deutschland',
      },
    ],
    defaultAddressIdx: 0,
    paymentMethods: ['Kreditkarte (****4242)', 'PayPal'],
  });
}

function defaultNotifications(): Notification[] {
  const stored = readStorage<Notification[]>(KEYS.notifications, []);
  if (stored.length > 0) return stored;
  // Seed with welcome notification
  return [
    {
      id: 'notif-welcome',
      type: 'system',
      title: 'Willkommen bei Amazon 2.0!',
      message: 'Entdecke Tausende Produkte zu Top-Preisen. Viel Spaß beim Shoppen!',
      read: false,
      createdAt: Date.now(),
    },
    {
      id: 'notif-deal-1',
      type: 'deal',
      title: '🔥 Blitzangebot: Sony WH-1000XM5',
      message: 'Nur noch 4 Stunden! Sichere dir die Kopfhörer für nur 279,99€.',
      read: false,
      createdAt: Date.now() - 30 * 60 * 1000,
    },
  ];
}

function defaultBalance(): UserBalance {
  return readStorage<UserBalance>(KEYS.balance, {
    amount: 0,
    currency: 'EUR',
    transactions: [],
  });
}

// ── Load stored custom reviews & Q&A into products ──────────
const storedCustomReviews = readStorage<Record<string, typeof PRODUCTS[0]['customReviews']>>(KEYS.customReviews, {});
const storedQa = readStorage<Record<string, typeof PRODUCTS[0]['qa']>>(KEYS.qa, {});
PRODUCTS.forEach(p => {
  if (storedCustomReviews[p.id]) p.customReviews = storedCustomReviews[p.id];
  if (storedQa[p.id]) p.qa = storedQa[p.id];
});

// ── Initial State ─────────────────────────────────────────────
export const state: AppState = {
  products: PRODUCTS,
  cart: readStorage(KEYS.cart, []),
  orders: readStorage(KEYS.orders, []),
  wishlist: readStorage(KEYS.wishlist, []),
  compareList: readStorage(KEYS.compare, []),
  recentlyViewed: readStorage(KEYS.recentlyViewed, []),
  activeCoupons: readStorage<Coupon[]>(KEYS.activeCoupons, SAMPLE_COUPONS as Coupon[]),
  appliedProductCoupons: readStorage(KEYS.productCoupons, {}),
  userProfile: defaultProfile(),
  notifications: defaultNotifications(),
  priceAlerts: readStorage(KEYS.priceAlerts, []),
  userBalance: defaultBalance(),
  redeemedGiftCodes: readStorage(KEYS.redeemedGiftCodes, []),
  filters: {
    category: 'all',
    searchQuery: '',
    brand: 'all',
    inStockOnly: false,
    dealsOnly: false,
    primeOnly: false,
    minRating: 0,
    maxPrice: 2000,
    sortBy: 'featured',
  },
  theme: (readStorage<string>(KEYS.theme, 'light') as 'light' | 'dark'),
};

// ── Pub/Sub Event Bus ─────────────────────────────────────────
type ListenerMap = Map<EventCallback, boolean>;
const listeners = new Map<StoreEvent, ListenerMap>();

export function on<T = unknown>(event: StoreEvent, cb: EventCallback<T>): () => void {
  if (!listeners.has(event)) listeners.set(event, new Map());
  listeners.get(event)!.set(cb as EventCallback, true);
  // Return unsubscribe function
  return () => off(event, cb);
}

export function off<T = unknown>(event: StoreEvent, cb: EventCallback<T>): void {
  listeners.get(event)?.delete(cb as EventCallback);
}

export function emit<T = unknown>(event: StoreEvent, data?: T): void {
  listeners.get(event)?.forEach((_, cb) => {
    try { cb(data); } catch (err) { console.error('[Store] Event error:', event, err); }
  });
}

// ── Persistence Helpers ───────────────────────────────────────
export function saveCart(): void {
  writeStorage(KEYS.cart, state.cart);
  emit('cart:changed');
}

export function saveOrders(): void {
  writeStorage(KEYS.orders, state.orders);
  emit('orders:changed');
}

export function saveWishlist(): void {
  writeStorage(KEYS.wishlist, state.wishlist);
  emit('wishlist:changed');
}

export function saveCompare(): void {
  writeStorage(KEYS.compare, state.compareList);
  emit('compare:changed');
}

export function saveFilters(): void {
  emit('filters:changed');
}

export function saveTheme(): void {
  writeStorage(KEYS.theme, state.theme);
  emit('theme:changed');
}

export function saveProfile(): void {
  writeStorage(KEYS.profile, state.userProfile);
  emit('profile:changed');
}

export function saveNotifications(): void {
  writeStorage(KEYS.notifications, state.notifications);
  emit('notifications:changed');
}

export function saveBalance(): void {
  writeStorage(KEYS.balance, state.userBalance);
  emit('balance:changed');
}

/**
 * Triggers a full product grid re-render.
 * Components subscribe to 'products:render'.
 */
export function triggerRenderProducts(): void {
  emit('products:render');
}

export default state;
