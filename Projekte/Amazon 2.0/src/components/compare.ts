// ============================================================
// Amazon 2.0 – Product Compare Dock Component
// ============================================================
import type { AppState, Product } from '../types';
import { formatPrice, renderStars } from '../utils/formatters';

type AddToCartCallback = (product: Product, qty?: number) => void;

let compareDock: HTMLElement | null = null;
let compareModal: HTMLElement | null = null;

export function initCompare(state: AppState, onAddToCart: AddToCartCallback): void {
  compareDock = document.createElement('div');
  compareDock.id = 'compareDock';
  compareDock.className = 'compare-dock hidden';
  compareDock.setAttribute('role', 'complementary');
  compareDock.setAttribute('aria-label', 'Produktvergleich');
  document.body.appendChild(compareDock);
  renderCompareDock(state, onAddToCart);
}

export function toggleCompareProduct(
  state: AppState,
  productId: string,
  onAddToCart: AddToCartCallback
): void {
  const idx = state.compareList.findIndex(p => p.id === productId);
  if (idx >= 0) {
    state.compareList.splice(idx, 1);
  } else {
    if (state.compareList.length >= 4) {
      import('./toast').then(({ showToast }) => showToast('Maximal 4 Produkte vergleichen', 'warning'));
      return;
    }
    const product = state.products.find(p => p.id === productId);
    if (product) state.compareList.push(product);
  }
  renderCompareDock(state, onAddToCart);
}

function renderCompareDock(state: AppState, onAddToCart: AddToCartCallback): void {
  if (!compareDock) return;

  const count = state.compareList.length;
  compareDock.classList.toggle('hidden', count === 0);
  if (count === 0) return;

  compareDock.innerHTML = `
    <div class="compare-dock-inner">
      <p class="compare-dock-title">⚖ Vergleich (${count}/4)</p>
      <div class="compare-dock-items">
        ${state.compareList.map(p => `
          <div class="compare-dock-item">
            <img src="${p.images[0]}" alt="${p.title}" width="50" height="50" />
            <span class="compare-dock-item-title">${p.brand}</span>
            <button class="compare-remove-btn" data-product-id="${p.id}" aria-label="${p.title} entfernen">✕</button>
          </div>
        `).join('')}
        ${Array.from({ length: 4 - count }, () => `
          <div class="compare-dock-slot">
            <div class="slot-placeholder">+</div>
          </div>
        `).join('')}
      </div>
      <div class="compare-dock-actions">
        <button class="btn-primary compare-open-btn" id="openCompareModalBtn" ${count < 2 ? 'disabled' : ''}>
          Vergleichen (${count})
        </button>
        <button class="btn-secondary-sm compare-clear-btn" id="clearCompareBtn">Leeren</button>
      </div>
    </div>
  `;

  // Wire events
  compareDock.querySelectorAll('.compare-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-product-id')!;
      const idx = state.compareList.findIndex(p => p.id === id);
      if (idx >= 0) state.compareList.splice(idx, 1);
      renderCompareDock(state, onAddToCart);
      // Trigger re-render to update compare buttons in catalog
      import('../store').then(({ triggerRenderProducts }) => triggerRenderProducts());
    });
  });

  document.getElementById('clearCompareBtn')?.addEventListener('click', () => {
    state.compareList.length = 0;
    renderCompareDock(state, onAddToCart);
    import('../store').then(({ triggerRenderProducts }) => triggerRenderProducts());
  });

  document.getElementById('openCompareModalBtn')?.addEventListener('click', () => {
    openCompareModal(state, onAddToCart);
  });
}

function openCompareModal(state: AppState, onAddToCart: AddToCartCallback): void {
  if (!compareModal) {
    compareModal = document.createElement('div');
    compareModal.id = 'compareModal';
    compareModal.className = 'modal-overlay';
    compareModal.setAttribute('role', 'dialog');
    compareModal.setAttribute('aria-modal', 'true');
    compareModal.setAttribute('aria-label', 'Produktvergleich');
    document.body.appendChild(compareModal);
    compareModal.addEventListener('click', e => {
      if (e.target === compareModal) closeCompareModal();
    });
  }

  const products = state.compareList;
  const allSpecs = [...new Set(products.flatMap(p => Object.keys(p.specs ?? {})))];

  compareModal.innerHTML = `
    <div class="modal-dialog compare-dialog">
      <button class="modal-close" id="compareClose" aria-label="Schließen">✕</button>
      <h2 class="modal-heading">⚖ Produkte vergleichen</h2>

      <div class="compare-table-wrap">
        <table class="compare-table" role="table">
          <!-- Header: Product Cards -->
          <thead>
            <tr>
              <th class="compare-attr-col">Merkmal</th>
              ${products.map(p => `
                <th class="compare-product-col">
                  <img src="${p.images[0]}" alt="${p.title}" width="100" height="80" />
                  <p class="compare-product-brand">${p.brand}</p>
                  <p class="compare-product-title">${p.title}</p>
                  <p class="compare-product-price">${formatPrice(p.price)}</p>
                  <button class="add-to-cart-btn compare-add-btn" data-pid="${p.id}">
                    🛒 Kaufen
                  </button>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            <!-- Rating -->
            <tr>
              <td class="attr-name">Bewertung</td>
              ${products.map(p => `<td>${renderStars(p.rating)} ${p.rating}</td>`).join('')}
            </tr>
            <!-- Price -->
            <tr>
              <td class="attr-name">Preis</td>
              ${products.map(p => {
                const minPrice = Math.min(...products.map(x => x.price));
                return `<td class="${p.price === minPrice ? 'best-value' : ''}">${formatPrice(p.price)}</td>`;
              }).join('')}
            </tr>
            <!-- Prime -->
            <tr>
              <td class="attr-name">Prime</td>
              ${products.map(p => `<td>${p.isPrime ? '⭐ Ja' : '–'}</td>`).join('')}
            </tr>
            <!-- In Stock -->
            <tr>
              <td class="attr-name">Verfügbarkeit</td>
              ${products.map(p => `<td>${p.inStock ? '✓ Auf Lager' : '✕ Vergriffen'}</td>`).join('')}
            </tr>
            <!-- Specs -->
            ${allSpecs.map(spec => `
              <tr>
                <td class="attr-name">${spec}</td>
                ${products.map(p => `<td>${p.specs?.[spec] ?? '–'}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  compareModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById('compareClose')?.addEventListener('click', closeCompareModal);

  compareModal.querySelectorAll('.compare-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = btn.getAttribute('data-pid')!;
      const product = products.find(p => p.id === pid);
      if (product) onAddToCart(product, 1);
    });
  });

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { closeCompareModal(); document.removeEventListener('keydown', onKeydown); }
  };
  document.addEventListener('keydown', onKeydown);
}

function closeCompareModal(): void {
  compareModal?.classList.remove('open');
  document.body.style.overflow = '';
}
