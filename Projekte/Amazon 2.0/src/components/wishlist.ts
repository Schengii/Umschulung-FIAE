// ============================================================
// Amazon 2.0 – Multi-Wishlist Modal Component with Groups & Undo
// ============================================================
import type { AppState, Product, WishlistGroup } from '../types';
import { formatPrice, renderStars, sanitizeHtml } from '../utils/formatters';
import { showToast } from './toast';
import { createWishlistGroup, deleteWishlistGroup, saveWishlistGroups, saveWishlist } from '../store';

type MoveToCartCallback = (product: Product) => void;
type RemoveCallback = (productId: string) => void;

let wishlistModal: HTMLElement | null = null;
let activeGroupId = 'default';

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

  // Ensure wishlist groups exist
  if (!state.wishlistGroups || state.wishlistGroups.length === 0) {
    state.wishlistGroups = [
      { id: 'default', title: 'Meine Wunschliste', isDefault: true, items: state.wishlist, createdAt: Date.now() },
    ];
  }

  let activeGroup = state.wishlistGroups.find(g => g.id === activeGroupId) || state.wishlistGroups[0];
  activeGroupId = activeGroup.id;

  // Sync default list if active
  if (activeGroup.isDefault) {
    activeGroup.items = [...state.wishlist];
  }

  const items = activeGroup.items;

  modal.innerHTML = `
    <div class="modal-dialog wishlist-dialog">
      <button class="modal-close" id="wishlistClose" aria-label="Schließen">✕</button>
      
      <div class="wishlist-header-group">
        <h2 class="modal-heading">♥ Wunschlisten-Center</h2>
        <button class="btn btn-sm btn-outline" id="createNewWishlistBtn">➕ Neue Liste anlegen</button>
      </div>

      <!-- Wishlist Group Tabs -->
      <div class="wishlist-group-tabs">
        ${state.wishlistGroups.map(group => `
          <button class="wishlist-tab ${group.id === activeGroupId ? 'active' : ''}" data-group-id="${group.id}">
            ${group.isDefault ? '⭐ ' : '📋 '} ${sanitizeHtml(group.title)} (${group.items.length})
          </button>
        `).join('')}
      </div>

      <div class="wishlist-active-info">
        <h3>${sanitizeHtml(activeGroup.title)} <span class="text-sm font-normal">(${items.length} Artikel)</span></h3>
        ${!activeGroup.isDefault ? `
          <button class="btn-ghost-sm btn-del-group" data-group-id="${activeGroup.id}">🗑️ Diese Liste löschen</button>
        ` : ''}
      </div>
      
      ${items.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">♡</div>
          <h3>Diese Liste ist leer</h3>
          <p>Füge Produkte zur Wunschliste hinzu oder verschiebe Artikel aus anderen Listen.</p>
        </div>
      ` : `
        <div class="wishlist-grid">
          ${items.map(product => renderWishlistItem(product, state.wishlistGroups!)).join('')}
        </div>
        <div class="wishlist-footer">
          <button class="btn-secondary" id="shareWishlistBtn">👥 Liste teilen & Prämie</button>
          <button class="btn-primary" id="moveAllToCart">🛒 Alle in den Warenkorb</button>
        </div>
      `}
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById('wishlistClose')?.addEventListener('click', closeWishlistModal);

  // Switch tabs
  modal.querySelectorAll('.wishlist-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      activeGroupId = tab.getAttribute('data-group-id') || 'default';
      openWishlistModal(state, onMoveToCart, onRemove);
    });
  });

  // Create new list
  document.getElementById('createNewWishlistBtn')?.addEventListener('click', () => {
    const title = prompt('Name für die neue Wunschliste (z. B. „Geburtstag“, „Büro-Setup“):');
    if (title && title.trim()) {
      const created = createWishlistGroup(title.trim());
      activeGroupId = created.id;
      showToast(`Wunschliste „${created.title}“ erstellt!`, 'success');
      openWishlistModal(state, onMoveToCart, onRemove);
    }
  });

  // Delete group
  modal.querySelectorAll('.btn-del-group').forEach(btn => {
    btn.addEventListener('click', () => {
      const gid = btn.getAttribute('data-group-id');
      if (gid && confirm('Möchtest du diese Wunschliste wirklich löschen?')) {
        deleteWishlistGroup(gid);
        activeGroupId = 'default';
        showToast('Wunschliste gelöscht.', 'info');
        openWishlistModal(state, onMoveToCart, onRemove);
      }
    });
  });

  // Move between lists
  modal.querySelectorAll<HTMLSelectElement>('.wishlist-move-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const targetGid = (e.target as HTMLSelectElement).value;
      const pid = (e.target as HTMLSelectElement).getAttribute('data-product-id');
      if (!targetGid || !pid) return;

      const currentG = state.wishlistGroups?.find(g => g.id === activeGroupId);
      const targetG = state.wishlistGroups?.find(g => g.id === targetGid);

      if (currentG && targetG) {
        const pIdx = currentG.items.findIndex(p => p.id === pid);
        if (pIdx !== -1) {
          const [movedP] = currentG.items.splice(pIdx, 1);
          if (!targetG.items.some(p => p.id === pid)) {
            targetG.items.push(movedP);
          }
          saveWishlistGroups();
          showToast(`Artikel in „${targetG.title}“ verschoben!`, 'success');
          openWishlistModal(state, onMoveToCart, onRemove);
        }
      }
    });
  });

  // Remove buttons with undo toast
  modal.querySelectorAll('.wishlist-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-product-id')!;
      const currentG = state.wishlistGroups?.find(g => g.id === activeGroupId);
      if (currentG) {
        const pIdx = currentG.items.findIndex(p => p.id === id);
        if (pIdx !== -1) {
          const [removedP] = currentG.items.splice(pIdx, 1);
          saveWishlistGroups();
          if (currentG.isDefault) {
            onRemove(id);
          }
          openWishlistModal(state, onMoveToCart, onRemove);
          showToast(`„${removedP.title}“ von Wunschliste entfernt.`, 'info', {
            action: {
              text: 'Rückgängig',
              onClick: () => {
                currentG.items.splice(pIdx, 0, removedP);
                if (currentG.isDefault) {
                  state.wishlist.push(removedP);
                  saveWishlist();
                }
                saveWishlistGroups();
                openWishlistModal(state, onMoveToCart, onRemove);
                showToast('Artikel wieder auf der Wunschliste!', 'success');
              },
            },
          });
        }
      }
    });
  });

  modal.querySelectorAll('.wishlist-cart-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-product-id')!;
      const currentG = state.wishlistGroups?.find(g => g.id === activeGroupId);
      const product = currentG?.items.find(p => p.id === id);
      if (product) onMoveToCart(product);
    });
  });

  document.getElementById('moveAllToCart')?.addEventListener('click', () => {
    const currentG = state.wishlistGroups?.find(g => g.id === activeGroupId);
    currentG?.items.forEach(p => onMoveToCart(p));
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

function renderWishlistItem(product: Product, groups: WishlistGroup[]): string {
  return `
    <div class="wishlist-item" data-product-id="${product.id}">
      <img src="${product.images[0]}" alt="${sanitizeHtml(product.title)}" class="wishlist-item-img" width="100" height="100" />
      <div class="wishlist-item-info">
        <p class="wishlist-item-brand">${sanitizeHtml(product.brand)}</p>
        <h3 class="wishlist-item-title">${sanitizeHtml(product.title)}</h3>
        ${renderStars(product.rating)}
        <p class="wishlist-item-price">${formatPrice(product.price)}</p>
        ${!product.inStock ? '<p class="out-of-stock-label">Nicht verfügbar</p>' : ''}
        
        <div class="wishlist-move-group">
          <label class="text-xs">In andere Liste verschieben:</label>
          <select class="wishlist-move-select" data-product-id="${product.id}">
            <option value="" disabled selected>Liste wählen...</option>
            ${groups.map(g => `
              <option value="${g.id}">${sanitizeHtml(g.title)}</option>
            `).join('')}
          </select>
        </div>
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

