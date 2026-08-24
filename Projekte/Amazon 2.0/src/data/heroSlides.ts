// ============================================================
// Amazon 2.0 – Hero Carousel Slides
// ============================================================
import type { HeroSlide } from '../types';

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'hero-1',
    title: 'Sommer-Highlights bis zu 40% günstiger',
    subtitle: 'Entdecke Top-Deals in Elektronik, Gaming & mehr – täglich neue Angebote.',
    badge: '🔥 Tagesangebot',
    buttonText: 'Jetzt shoppen',
    bgGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=80',
    category: 'all',
  },
  {
    id: 'hero-2',
    title: 'Gaming-Welt neu erleben',
    subtitle: 'PS5, Xbox Series X, Top-Peripherie – alles für dein perfektes Setup.',
    badge: '🎮 Gaming-Sale',
    buttonText: 'Deals entdecken',
    bgGradient: 'linear-gradient(135deg, #0d0d0d 0%, #1a0533 50%, #2d0a5e 100%)',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&auto=format&fit=crop&q=80',
    category: 'gaming',
  },
  {
    id: 'hero-3',
    title: 'Smart Home – dein Zuhause, intelligent',
    subtitle: 'Echo, Hue, Nest & mehr: Automatisiere dein Zuhause mit Top-Geräten.',
    badge: '🏠 Smart Home',
    buttonText: 'Smarter leben',
    bgGradient: 'linear-gradient(135deg, #0a2a0a 0%, #0d3b0d 50%, #1a5c1a 100%)',
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80',
    category: 'smart-home',
  },
  {
    id: 'hero-4',
    title: 'Prime – Unbegrenztes Einkaufen',
    subtitle: 'Kostenloser Express-Versand, exklusive Deals & Prime Video inklusive.',
    badge: '⭐ Prime',
    buttonText: 'Jetzt Prime testen',
    bgGradient: 'linear-gradient(135deg, #1a0a00 0%, #3d1a00 50%, #7a3800 100%)',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=80',
    category: 'all',
  },
];

export const CATEGORIES = [
  { id: 'all', label: 'Alle Kategorien', icon: '🏪' },
  { id: 'electronics', label: 'Elektronik', icon: '💻' },
  { id: 'gaming', label: 'Gaming', icon: '🎮' },
  { id: 'smart-home', label: 'Smart Home', icon: '🏠' },
  { id: 'home-kitchen', label: 'Küche & Haushalt', icon: '🍳' },
  { id: 'books', label: 'Bücher', icon: '📚' },
  { id: 'fashion', label: 'Mode', icon: '👟' },
  { id: 'sports', label: 'Sport & Outdoor', icon: '⚽' },
  { id: 'beauty', label: 'Beauty & Gesundheit', icon: '💄' },
];

export const SAMPLE_COUPONS = [
  {
    code: 'SOMMER25',
    discount: 25,
    type: 'percentage' as const,
    minOrder: 50,
    description: '25% Rabatt auf alle Bestellungen über 50€',
    isActive: true,
    expiresAt: Date.now() + 7 * 24 * 3600 * 1000,
  },
  {
    code: 'PRIME10',
    discount: 10,
    type: 'fixed' as const,
    minOrder: 25,
    description: '10€ Rabatt für Prime-Mitglieder',
    isActive: true,
    expiresAt: Date.now() + 30 * 24 * 3600 * 1000,
  },
  {
    code: 'TECH15',
    discount: 15,
    type: 'percentage' as const,
    minOrder: 100,
    description: '15% auf Elektronik & Gaming',
    isActive: true,
    expiresAt: Date.now() + 14 * 24 * 3600 * 1000,
  },
  {
    code: 'NEUKUNDE',
    discount: 5,
    type: 'fixed' as const,
    description: '5€ Willkommensrabatt für Neukunden',
    isActive: true,
  },
];

export const GIFT_CARD_CODES: Record<string, number> = {
  'GIFT-2024-XMAS': 25.00,
  'GIFT-2024-BDAY': 50.00,
  'GIFT-100-AMZ': 100.00,
  'WELCOME-GIFT': 10.00,
};
