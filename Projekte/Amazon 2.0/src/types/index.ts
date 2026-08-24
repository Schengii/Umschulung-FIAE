// ============================================================
// Amazon 2.0 – TypeScript Type Definitions
// ============================================================

// ----- Product -----------------------------------------------
export interface Review {
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpful: number;
}

export interface QAItem {
  question: string;
  answer: string;
  date: string;
  author: string;
}

export interface PriceHistoryEntry {
  date: string;
  price: number;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  discount?: number; // percent
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQty?: number;
  isPrime: boolean;
  isLightningDeal?: boolean;
  lightningDealEndsAt?: number; // timestamp ms
  lightningDealProgress?: number; // 0-100 percent claimed
  isBestseller?: boolean;
  isNew?: boolean;
  images: string[];
  description: string;
  features?: string[];
  specs?: Record<string, string>;
  reviews?: Review[];
  customReviews?: Review[];
  qa?: QAItem[];
  priceHistory?: PriceHistoryEntry[];
  tags?: string[];
  seller?: string;
  weight?: string;
  dimensions?: string;
  bundleWith?: string[]; // product IDs often bought together
  asin?: string;
}

// ----- Cart --------------------------------------------------
export interface CartItem {
  product: Product;
  qty: number;
  addedAt?: number;
}

// ----- Order -------------------------------------------------
export type OrderStatus = 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface OrderItem {
  product: Product;
  qty: number;
  priceAtPurchase: number;
}

export interface ShippingAddress {
  name: string;
  street: string;
  city: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  placedAt: number; // timestamp ms
  estimatedDelivery?: string;
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  trackingNumber?: string;
  isReturnable?: boolean;
  returnedAt?: number;
}

// ----- Coupon ------------------------------------------------
export interface Coupon {
  code: string;
  discount: number; // percent
  type: 'percentage' | 'fixed';
  minOrder?: number;
  maxDiscount?: number;
  expiresAt?: number;
  description: string;
  isActive: boolean;
}

// ----- Notification ------------------------------------------
export type NotificationType = 'order' | 'deal' | 'price_alert' | 'system' | 'return';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: number;
  link?: string;
}

// ----- User Profile ------------------------------------------
export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  isPrime: boolean;
  primeExpiry?: string;
  memberSince: string;
  addresses: ShippingAddress[];
  defaultAddressIdx: number;
  paymentMethods: string[];
}

// ----- Price Alert -------------------------------------------
export interface PriceAlert {
  id: string;
  productId: string;
  targetPrice: number;
  createdAt: number;
  triggered: boolean;
}

// ----- User Balance (Gift Cards) ----------------------------
export interface UserBalance {
  amount: number;
  currency: string;
  transactions: BalanceTransaction[];
}

export interface BalanceTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: number;
}

// ----- Hero Slide --------------------------------------------
export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  buttonText: string;
  bgGradient: string;
  image: string;
  category?: string;
}

// ----- Filters -----------------------------------------------
export interface Filters {
  category: string;
  searchQuery: string;
  brand: string;
  inStockOnly: boolean;
  dealsOnly: boolean;
  primeOnly: boolean;
  minRating: number;
  maxPrice: number;
  sortBy: SortOption;
}

export type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'rating-desc'
  | 'newest'
  | 'bestseller';

// ----- Application State ------------------------------------
export interface AppState {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  wishlist: Product[];
  compareList: Product[];
  recentlyViewed: Product[];
  activeCoupons: Coupon[];
  appliedProductCoupons: Record<string, Coupon>;
  userProfile: UserProfile;
  notifications: Notification[];
  priceAlerts: PriceAlert[];
  userBalance: UserBalance;
  redeemedGiftCodes: string[];
  filters: Filters;
  theme: 'light' | 'dark';
  language?: import('../utils/i18n').Language;
  currency?: import('../utils/i18n').Currency;
}

// ----- Event Bus ---------------------------------------------
export type StoreEvent =
  | 'cart:changed'
  | 'wishlist:changed'
  | 'orders:changed'
  | 'compare:changed'
  | 'filters:changed'
  | 'theme:changed'
  | 'profile:changed'
  | 'notifications:changed'
  | 'balance:changed'
  | 'products:render';

export type EventCallback<T = unknown> = (data?: T) => void;
