// ============================================================
// Amazon 2.0 – Recently Viewed Component
// ============================================================
import type { AppState, Product } from '../types';
import { formatPrice, renderStars } from '../utils/formatters';

type ProductClickCallback = (product: Product) => void;
type AddToCartCallback = (product: Product, qty?: number) => void;

const MAX_RECENTLY_VIEWED = 8;

export function trackRecentlyViewed(state: AppState, productId: string): void {
  const product = state.products.find(p => p.id === productId);
  if (!product) return;

  // Remove if already in list
  state.recentlyViewed = state.recentlyViewed.filter(p => p.id !== productId);
  // Add to front
  state.recentlyViewed.unshift(product);
  // Trim to max
  state.recentlyViewed = state.recentlyViewed.slice(0, MAX_RECENTLY_VIEWED);

  import('../utils/persist').then(({ writeStorage, KEYS }) => {
    writeStorage(KEYS.recentlyViewed, state.recentlyViewed);
  });
}

export function renderRecentlyViewed(
  state: AppState,
  onProductClick: ProductClickCallback,
  onAddToCart: AddToCartCallback
): void {
  const section = document.getElementById('recentlyViewedSection');
  if (!section) return;

  if (state.recentlyViewed.length === 0) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  section.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">🕓 Zuletzt angesehen</h2>
      <button class="section-clear-btn" id="clearRecentlyViewedBtn">Verlauf löschen</button>
    </div>
    <div class="recently-viewed-grid">
      ${state.recentlyViewed.map(product => `
        <div class="rv-card" data-product-id="${product.id}">
          <button class="rv-img-btn" aria-label="${product.title} ansehen">
            <img src="${product.images[0]}" alt="${product.title}" class="rv-img" width="120" height="100" loading="lazy" />
          </button>
          <div class="rv-info">
            <p class="rv-brand">${product.brand}</p>
            <p class="rv-title">${product.title.slice(0, 50)}${product.title.length > 50 ? '…' : ''}</p>
            <div class="rv-rating">${renderStars(product.rating)}</div>
            <p class="rv-price">${formatPrice(product.price)}</p>
            <button class="rv-cart-btn btn-primary-sm" data-product-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
              ${product.inStock ? '🛒' : '✕'}
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Wire events
  section.querySelectorAll('.rv-img-btn').forEach(btn => {
    const card = btn.closest('[data-product-id]') as HTMLElement;
    const productId = card?.getAttribute('data-product-id')!;
    const product = state.products.find(p => p.id === productId);
    if (product) btn.addEventListener('click', () => onProductClick(product));
  });

  section.querySelectorAll('.rv-cart-btn').forEach(btn => {
    const productId = btn.getAttribute('data-product-id')!;
    const product = state.products.find(p => p.id === productId);
    if (product) btn.addEventListener('click', () => onAddToCart(product, 1));
  });

  document.getElementById('clearRecentlyViewedBtn')?.addEventListener('click', () => {
    state.recentlyViewed = [];
    import('../utils/persist').then(({ writeStorage, KEYS }) => {
      writeStorage(KEYS.recentlyViewed, []);
    });
    renderRecentlyViewed(state, onProductClick, onAddToCart);
  });
}
