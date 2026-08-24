// ============================================================
// Amazon 2.0 – i18n Internationalization & Multi-Currency Engine
// ============================================================

export type Language = 'de' | 'en' | 'fr' | 'es';
export type Currency = 'EUR' | 'USD' | 'GBP' | 'CHF';

export interface CurrencyConfig {
  code: Currency;
  symbol: string;
  rate: number; // base: EUR = 1.0
  format: (amount: number) => string;
}

export const CURRENCIES: Record<Currency, CurrencyConfig> = {
  EUR: {
    code: 'EUR',
    symbol: '€',
    rate: 1.0,
    format: (amt) => `${amt.toFixed(2).replace('.', ',')} €`,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    rate: 1.08,
    format: (amt) => `$${amt.toFixed(2)}`,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    rate: 0.86,
    format: (amt) => `£${amt.toFixed(2)}`,
  },
  CHF: {
    code: 'CHF',
    symbol: 'CHF',
    rate: 0.95,
    format: (amt) => `${amt.toFixed(2)} CHF`,
  },
};

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  de: {
    searchPlaceholder: 'Suche bei Amazon 2.0...',
    allCategories: 'Alle Kategorien',
    cart: 'Warenkorb',
    orders: 'Bestellungen',
    wishlist: 'Wunschliste',
    coupons: 'Gutscheine',
    checkout: 'Kostenpflichtig bestellen',
    addToCart: 'In den Einkaufswagen',
    buyNow: 'Jetzt kaufen',
    delivery: 'Lieferung',
    freeShipping: 'Kostenloser Versand',
    inStock: 'Auf Lager',
    outOfStock: 'Vergriffen',
    bestseller: 'Bestseller',
    newTag: 'Neu',
    primeOnly: 'Nur Prime',
    reviews: 'Kundenbewertungen',
    qa: 'Fragen & Antworten',
    recommendations: 'Für dich empfohlen',
  },
  en: {
    searchPlaceholder: 'Search Amazon 2.0...',
    allCategories: 'All Categories',
    cart: 'Cart',
    orders: 'Orders',
    wishlist: 'Wishlist',
    coupons: 'Coupons',
    checkout: 'Complete Order',
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    delivery: 'Delivery',
    freeShipping: 'Free Shipping',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    bestseller: 'Bestseller',
    newTag: 'New',
    primeOnly: 'Prime Only',
    reviews: 'Customer Reviews',
    qa: 'Q & A',
    recommendations: 'Recommended for You',
  },
  fr: {
    searchPlaceholder: 'Rechercher sur Amazon 2.0...',
    allCategories: 'Toutes les catégories',
    cart: 'Panier',
    orders: 'Commandes',
    wishlist: 'Engebots',
    coupons: 'Coupons',
    checkout: 'Passer la commande',
    addToCart: 'Ajouter au panier',
    buyNow: 'Acheter jetzt',
    delivery: 'Livraison',
    freeShipping: 'Livraison gratuite',
    inStock: 'En stock',
    outOfStock: 'Épuisé',
    bestseller: 'Meilleure vente',
    newTag: 'Nouveau',
    primeOnly: 'Prime uniquement',
    reviews: 'Avis clients',
    qa: 'Questions & Réponses',
    recommendations: 'Recommandé pour vous',
  },
  es: {
    searchPlaceholder: 'Buscar en Amazon 2.0...',
    allCategories: 'Todas las categorías',
    cart: 'Cesta',
    orders: 'Pedidos',
    wishlist: 'Deseos',
    coupons: 'Cupones',
    checkout: 'Realizar pedido',
    addToCart: 'Añadir a la cesta',
    buyNow: 'Comprar ya',
    delivery: 'Envío',
    freeShipping: 'Envío gratis',
    inStock: 'En stock',
    outOfStock: 'Agotado',
    bestseller: 'Más vendido',
    newTag: 'Nuevo',
    primeOnly: 'Solo Prime',
    reviews: 'Opiniones de clientes',
    qa: 'Preguntas y respuestas',
    recommendations: 'Recomendado para ti',
  },
};

export function t(key: string, lang: Language = 'de'): string {
  return TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['de']?.[key] ?? key;
}

export function convertAndFormatPrice(priceInEur: number, currency: Currency = 'EUR'): string {
  const config = CURRENCIES[currency] ?? CURRENCIES.EUR;
  const converted = priceInEur * config.rate;
  return config.format(converted);
}
