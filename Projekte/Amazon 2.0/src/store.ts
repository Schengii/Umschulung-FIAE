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
const storedStockOverrides = readStorage<Record<string, { inStock: boolean; stockQty: number }>>(KEYS.stockOverrides, {});

PRODUCTS.forEach(p => {
  if (storedCustomReviews[p.id]) p.customReviews = storedCustomReviews[p.id];
  if (storedQa[p.id]) p.qa = storedQa[p.id];
  if (storedStockOverrides[p.id]) {
    p.inStock = storedStockOverrides[p.id].inStock;
    p.stockQty = storedStockOverrides[p.id].stockQty;
  }
});

// ── Initial State ─────────────────────────────────────────────
const initialWishlist = readStorage(KEYS.wishlist, []);
const initialWishlistGroups: import('./types').WishlistGroup[] = readStorage(KEYS.wishlistGroups, [
  {
    id: 'default',
    title: 'Meine Wunschliste',
    isDefault: true,
    items: initialWishlist,
    createdAt: Date.now(),
  },
]);

export const state: AppState = {
  products: PRODUCTS,
  cart: readStorage(KEYS.cart, []),
  orders: readStorage(KEYS.orders, []),
  wishlist: initialWishlist,
  wishlistGroups: initialWishlistGroups,
  savedForLater: readStorage(KEYS.savedForLater, []),
  subscriptions: readStorage(KEYS.subscriptions, []),
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
  if (state.wishlistGroups && state.wishlistGroups.length > 0) {
    const defaultGroup = state.wishlistGroups.find(g => g.isDefault) || state.wishlistGroups[0];
    defaultGroup.items = [...state.wishlist];
    writeStorage(KEYS.wishlistGroups, state.wishlistGroups);
  }
  emit('wishlist:changed');
}

export function saveWishlistGroups(): void {
  writeStorage(KEYS.wishlistGroups, state.wishlistGroups || []);
  const defaultGroup = state.wishlistGroups?.find(g => g.isDefault) || state.wishlistGroups?.[0];
  if (defaultGroup) {
    state.wishlist = [...defaultGroup.items];
    writeStorage(KEYS.wishlist, state.wishlist);
  }
  emit('wishlistGroups:changed');
  emit('wishlist:changed');
}

export function createWishlistGroup(title: string): import('./types').WishlistGroup {
  const newGroup: import('./types').WishlistGroup = {
    id: `list-${Date.now()}`,
    title: title.trim() || 'Neue Wunschliste',
    isDefault: false,
    items: [],
    createdAt: Date.now(),
  };
  state.wishlistGroups = state.wishlistGroups || [];
  state.wishlistGroups.push(newGroup);
  saveWishlistGroups();
  return newGroup;
}

export function deleteWishlistGroup(groupId: string): void {
  if (!state.wishlistGroups) return;
  state.wishlistGroups = state.wishlistGroups.filter(g => g.id !== groupId && !g.isDefault);
  saveWishlistGroups();
}

export function saveSavedForLater(): void {
  writeStorage(KEYS.savedForLater, state.savedForLater || []);
  emit('savedForLater:changed');
}

export function moveToSavedForLater(productId: string): void {
  state.savedForLater = state.savedForLater || [];
  const cartIdx = state.cart.findIndex(i => i.product.id === productId);
  if (cartIdx !== -1) {
    const item = state.cart[cartIdx];
    state.cart.splice(cartIdx, 1);
    saveCart();
    
    // Add to saved for later if not already present
    if (!state.savedForLater.some(s => s.product.id === productId)) {
      state.savedForLater.unshift({
        product: item.product,
        savedAt: Date.now(),
      });
    }
    saveSavedForLater();
  }
}

export function moveBackToCart(productId: string): void {
  state.savedForLater = state.savedForLater || [];
  const idx = state.savedForLater.findIndex(s => s.product.id === productId);
  if (idx !== -1) {
    const item = state.savedForLater[idx];
    state.savedForLater.splice(idx, 1);
    saveSavedForLater();

    // Add to cart
    const existing = state.cart.find(c => c.product.id === productId);
    if (existing) {
      existing.qty += 1;
    } else {
      state.cart.push({ product: item.product, qty: 1, addedAt: Date.now() });
    }
    saveCart();
  }
}

export function saveSubscriptions(): void {
  writeStorage(KEYS.subscriptions, state.subscriptions || []);
  emit('subscriptions:changed');
}

export function addSubscription(sub: Omit<import('./types').Subscription, 'id' | 'createdAt' | 'status'>): import('./types').Subscription {
  state.subscriptions = state.subscriptions || [];
  const newSub: import('./types').Subscription = {
    ...sub,
    id: `sub-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAt: Date.now(),
    status: 'active',
  };
  state.subscriptions.unshift(newSub);
  saveSubscriptions();

  // Create notification
  const notif: Notification = {
    id: `notif-sub-${Date.now()}`,
    type: 'subscription',
    title: `📦 Spar-Abo aktiviert: ${sub.productTitle}`,
    message: `Dein Spar-Abo (alle ${sub.intervalMonths} Monate, ${sub.discountPercent}% Rabatt) wurde erfolgreich eingerichtet. Erste Lieferung: ${sub.nextDeliveryDate}.`,
    read: false,
    createdAt: Date.now(),
  };
  state.notifications.unshift(notif);
  saveNotifications();

  return newSub;
}

export function updateSubscriptionStatus(subId: string, status: 'active' | 'paused' | 'cancelled'): void {
  state.subscriptions = state.subscriptions || [];
  const sub = state.subscriptions.find(s => s.id === subId);
  if (sub) {
    sub.status = status;
    saveSubscriptions();
  }
}

export function savePriceAlerts(): void {
  writeStorage(KEYS.priceAlerts, state.priceAlerts);
  emit('priceAlerts:changed');
}

export function addPriceAlert(productId: string, targetPrice: number): import('./types').PriceAlert | null {
  const prod = state.products.find(p => p.id === productId);
  if (!prod) return null;

  // Remove existing alert for this product if any
  state.priceAlerts = state.priceAlerts.filter(a => a.productId !== productId);
  
  const alert: import('./types').PriceAlert = {
    id: `alert-${Date.now()}`,
    productId,
    productTitle: prod.title,
    productImage: prod.images[0],
    originalPrice: prod.price,
    targetPrice,
    createdAt: Date.now(),
    triggered: false,
  };
  state.priceAlerts.unshift(alert);
  savePriceAlerts();
  return alert;
}

export function removePriceAlert(alertId: string): void {
  state.priceAlerts = state.priceAlerts.filter(a => a.id !== alertId);
  savePriceAlerts();
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
 * Deducts stock from products when an order is completed.
 */
export function deductStock(items: { product: { id: string }; qty: number }[]): void {
  const overrides = readStorage<Record<string, { inStock: boolean; stockQty: number }>>(KEYS.stockOverrides, {});

  items.forEach(item => {
    const prod = state.products.find(p => p.id === item.product.id);
    if (prod) {
      const currentQty = typeof prod.stockQty === 'number' ? prod.stockQty : 25;
      const newQty = Math.max(0, currentQty - item.qty);
      prod.stockQty = newQty;
      prod.inStock = newQty > 0;

      overrides[prod.id] = { inStock: prod.inStock, stockQty: newQty };
    }
  });

  writeStorage(KEYS.stockOverrides, overrides);
  triggerRenderProducts();
}

/**
 * Adds a custom user review and dynamically recalculates product rating & review count.
 */
export function addProductReview(productId: string, newReview: import('./types').Review): void {
  const prod = state.products.find(p => p.id === productId);
  if (!prod) return;

  prod.customReviews = prod.customReviews ?? [];
  prod.customReviews.unshift(newReview);

  const customObj = readStorage<Record<string, import('./types').Review[]>>(KEYS.customReviews, {});
  customObj[productId] = prod.customReviews;
  writeStorage(KEYS.customReviews, customObj);

  // Recalculate average rating & review count
  const allReviews = [...(prod.reviews ?? []), ...prod.customReviews];
  if (allReviews.length > 0) {
    const totalScore = allReviews.reduce((sum, r) => sum + r.rating, 0);
    prod.rating = parseFloat((totalScore / allReviews.length).toFixed(1));
    prod.reviewCount = (prod.reviewCount || 0) + 1;
  }

  triggerRenderProducts();
}

/**
 * Checks price alerts for a product against user price alerts.
 */
export function checkPriceAlerts(product: { id: string; title: string; price: number }): void {
  state.priceAlerts.forEach(alert => {
    if (alert.productId === product.id && !alert.triggered && product.price <= alert.targetPrice) {
      alert.triggered = true;
      writeStorage(KEYS.priceAlerts, state.priceAlerts);

      // Create notification
      const notif: Notification = {
        id: `notif-price-${Date.now()}`,
        type: 'price_alert',
        title: `🎯 Preisalarm ausgelöst: ${product.title}`,
        message: `Dein Wunschpreis von ${alert.targetPrice.toFixed(2).replace('.', ',')}€ wurde erreicht! Jetzt für nur ${product.price.toFixed(2).replace('.', ',')}€ sichern.`,
        read: false,
        createdAt: Date.now(),
      };
      state.notifications.unshift(notif);
      saveNotifications();
    }
  });
}

/**
 * Triggers a full product grid re-render.
 * Components subscribe to 'products:render'.
 */
export function triggerRenderProducts(): void {
  emit('products:render');
}

export default state;
