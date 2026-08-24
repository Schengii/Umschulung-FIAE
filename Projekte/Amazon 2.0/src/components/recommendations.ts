// ============================================================
// Amazon 2.0 – AI Recommendations Component (P2)
// ============================================================
import type { AppState, Product } from '../types';
import { formatPrice, renderStars } from '../utils/formatters';

type ProductClickCallback = (product: Product) => void;
type AddToCartCallback = (product: Product, qty?: number) => void;

export function renderRecommendationsSection(
  state: AppState,
  onProductClick: ProductClickCallback,
  onAddToCart: AddToCartCallback
): void {
  const section = document.getElementById('recommendationsSection');
  if (!section) return;

  const recommendations = getRecommendations(state);

  if (recommendations.length === 0) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  section.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">🤖 Empfehlungen für dich</h2>
      <p class="section-subtitle">Basierend auf deinem Browsing-Verlauf</p>
    </div>
    <div class="recommendations-grid">
      ${recommendations.map(product => renderRecommendationCard(product)).join('')}
    </div>
  `;

  // Wire events
  section.querySelectorAll('[data-rec-product-id]').forEach(card => {
    const productId = card.getAttribute('data-rec-product-id')!;
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    card.querySelector('.rec-card-img')?.addEventListener('click', () => onProductClick(product));
    card.querySelector('.rec-title')?.addEventListener('click', () => onProductClick(product));
    card.querySelector('.rec-add-cart')?.addEventListener('click', e => {
      e.stopPropagation();
      onAddToCart(product, 1);
    });
  });
}

function getRecommendations(state: AppState): Product[] {
  // Score products based on user behavior
  const viewedCategories = state.recentlyViewed.map(p => p.category);
  const cartCategories = state.cart.map(i => i.product.category);
  const wishlistCategories = state.wishlist.map(p => p.category);

  const categoryCounts: Record<string, number> = {};
  [...viewedCategories, ...cartCategories, ...wishlistCategories].forEach(cat => {
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
  });

  // Get IDs to exclude
  const excludeIds = new Set([
    ...state.recentlyViewed.map(p => p.id),
    ...state.cart.map(i => i.product.id),
    ...state.wishlist.map(p => p.id),
  ]);

  let scored = state.products
    .filter(p => !excludeIds.has(p.id) && p.inStock)
    .map(p => ({
      product: p,
      score:
        (categoryCounts[p.category] ?? 0) * 3 +
        p.rating * 2 +
        (p.isBestseller ? 5 : 0) +
        (p.isLightningDeal ? 4 : 0) +
        (p.discount ? 2 : 0),
    }))
    .sort((a, b) => b.score - a.score);

  // If no history, show top rated
  if (scored.length === 0 || !viewedCategories.length) {
    scored = state.products
      .filter(p => p.inStock)
      .map(p => ({ product: p, score: p.rating }))
      .sort((a, b) => b.score - a.score);
  }

  return scored.slice(0, 6).map(s => s.product);
}

function renderRecommendationCard(product: Product): string {
  return `
    <div class="rec-card" data-rec-product-id="${product.id}">
      ${product.isLightningDeal ? '<span class="rec-badge badge-lightning">⚡ Deal</span>' : ''}
      ${product.isBestseller ? '<span class="rec-badge badge-bestseller">Bestseller</span>' : ''}
      <img 
        src="${product.images[0]}" 
        alt="${product.title}" 
        class="rec-card-img" 
        width="160" height="130"
        loading="lazy"
        role="button"
        tabindex="0"
      />
      <div class="rec-card-info">
        <p class="rec-brand">${product.brand}</p>
        <button class="rec-title">${product.title.slice(0, 55)}${product.title.length > 55 ? '…' : ''}</button>
        <div class="rec-rating">${renderStars(product.rating)}</div>
        <div class="rec-price-row">
          <span class="rec-price">${formatPrice(product.price)}</span>
          ${product.originalPrice ? `<s class="rec-original">${formatPrice(product.originalPrice)}</s>` : ''}
        </div>
        <button class="rec-add-cart btn-primary-sm" ${!product.inStock ? 'disabled' : ''}>
          ${product.inStock ? '🛒 In Warenkorb' : 'Vergriffen'}
        </button>
      </div>
    </div>
  `;
}
