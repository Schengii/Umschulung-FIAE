// ============================================================
// Amazon 2.0 – Wishlist Modal Component
// ============================================================
import type { AppState, Product } from '../types';
import { formatPrice, renderStars } from '../utils/formatters';

type MoveToCartCallback = (product: Product) => void;
type RemoveCallback = (productId: string) => void;

let wishlistModal: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!wishlistModal) {
    wishlistModal = document.createElement('div');
    wishlistModal.id = 'wishlistModal';
    wishlistModal.className = 'modal-overlay';
    wishlistModal.setAttribute('role', 'dialog');
    wishlistModal.setAttribute('aria-modal', 'true');
    wishlistModal.setAttribute('aria-label', 'Wunschliste');
    document.body.appendChild(wishlistModal);
    wishlistModal.addEventListener('click', e => {
      if (e.target === wishlistModal) closeWishlistModal();
    });
  }
  return wishlistModal;
}

export function initWishlist(
  state: AppState,
  _onMoveToCart: MoveToCartCallback,
  _onRemove: RemoveCallback
): void {
  updateWishlistBadge(state.wishlist.length);
}

export function openWishlistModal(
  state: AppState,
  onMoveToCart: MoveToCartCallback,
  onRemove: RemoveCallback
): void {
  const modal = getModal();

  modal.innerHTML = `
    <div class="modal-dialog wishlist-dialog">
      <button class="modal-close" id="wishlistClose" aria-label="Schließen">✕</button>
      <h2 class="modal-heading">♥ Wunschliste (${state.wishlist.length})</h2>
      
      ${state.wishlist.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">♡</div>
          <h3>Deine Wunschliste ist leer</h3>
          <p>Füge Produkte zur Wunschliste hinzu, um sie hier zu sehen.</p>
        </div>
      ` : `
        <div class="wishlist-grid">
          ${state.wishlist.map(product => renderWishlistItem(product)).join('')}
        </div>
        <div class="wishlist-footer">
          <button class="btn-secondary" id="shareWishlistBtn">👥 Wunschliste teilen & Prämie</button>
          <button class="btn-primary" id="moveAllToCart">🛒 Alle in den Warenkorb</button>
        </div>
      `}
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById('wishlistClose')?.addEventListener('click', closeWishlistModal);

  modal.querySelectorAll('.wishlist-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-product-id')!;
      onRemove(id);
      openWishlistModal(state, onMoveToCart, onRemove); // Re-render
    });
  });

  modal.querySelectorAll('.wishlist-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-product-id')!;
      const product = state.wishlist.find(p => p.id === id);
      if (product) onMoveToCart(product);
    });
  });

  document.getElementById('moveAllToCart')?.addEventListener('click', () => {
    [...state.wishlist].forEach(p => onMoveToCart(p));
    closeWishlistModal();
  });

  document.getElementById('shareWishlistBtn')?.addEventListener('click', () => {
    import('./shareWishlist').then(({ openShareWishlistModal }) => openShareWishlistModal(state));
  });

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { closeWishlistModal(); document.removeEventListener('keydown', onKeydown); }
  };
  document.addEventListener('keydown', onKeydown);
}

function renderWishlistItem(product: Product): string {
  return `
    <div class="wishlist-item" data-product-id="${product.id}">
      <img src="${product.images[0]}" alt="${product.title}" class="wishlist-item-img" width="100" height="100" />
      <div class="wishlist-item-info">
        <p class="wishlist-item-brand">${product.brand}</p>
        <h3 class="wishlist-item-title">${product.title}</h3>
        ${renderStars(product.rating)}
        <p class="wishlist-item-price">${formatPrice(product.price)}</p>
        ${!product.inStock ? '<p class="out-of-stock-label">Nicht verfügbar</p>' : ''}
      </div>
      <div class="wishlist-item-actions">
        <button class="wishlist-cart-btn btn-primary-sm" data-product-id="${product.id}" ${!product.inStock ? 'disabled' : ''}>
          🛒 In Warenkorb
        </button>
        <button class="wishlist-remove-btn btn-ghost-sm" data-product-id="${product.id}" aria-label="Von Wunschliste entfernen">
          ✕ Entfernen
        </button>
      </div>
    </div>
  `;
}

export function updateWishlistBadge(count: number): void {
  const badge = document.getElementById('wishlistBadge');
  if (badge) {
    badge.textContent = String(count);
    badge.classList.toggle('hidden', count === 0);
  }
}

function closeWishlistModal(): void {
  wishlistModal?.classList.remove('open');
  document.body.style.overflow = '';
}
