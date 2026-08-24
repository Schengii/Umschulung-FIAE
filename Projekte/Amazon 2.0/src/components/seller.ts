// ============================================================
// Amazon 2.0 – Seller Marketplace Modal Component
// ============================================================
import type { AppState, Product } from '../types';
import { formatPrice, generateId } from '../utils/formatters';
import { showToast } from './toast';

type RefreshCallback = () => void;

let sellerModal: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!sellerModal) {
    sellerModal = document.createElement('div');
    sellerModal.id = 'sellerModal';
    sellerModal.className = 'modal-overlay';
    sellerModal.setAttribute('role', 'dialog');
    sellerModal.setAttribute('aria-modal', 'true');
    sellerModal.setAttribute('aria-label', 'Marketplace');
    document.body.appendChild(sellerModal);
    sellerModal.addEventListener('click', e => {
      if (e.target === sellerModal) closeSellerModal();
    });
  }
  return sellerModal;
}

const CATEGORIES_FOR_LISTING = [
  { id: 'electronics', label: 'Elektronik' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'smart-home', label: 'Smart Home' },
  { id: 'home-kitchen', label: 'Küche & Haushalt' },
  { id: 'books', label: 'Bücher' },
  { id: 'fashion', label: 'Mode' },
  { id: 'sports', label: 'Sport & Outdoor' },
  { id: 'beauty', label: 'Beauty & Gesundheit' },
];

export function openSellerModal(state: AppState, onRefresh: RefreshCallback): void {
  const modal = getModal();
  const sellerListings = state.products.filter(p => p.seller);

  modal.innerHTML = `
    <div class="modal-dialog seller-dialog">
      <button class="modal-close" id="sellerClose" aria-label="Schließen">✕</button>
      <h2 class="modal-heading">🏪 Marketplace</h2>
      
      <div class="seller-tabs">
        <button class="seller-tab-btn active" data-seller-tab="browse">Produkte entdecken</button>
        <button class="seller-tab-btn" data-seller-tab="list">Artikel verkaufen</button>
        ${sellerListings.length > 0 ? `<button class="seller-tab-btn" data-seller-tab="my-listings">Meine Angebote (${sellerListings.length})</button>` : ''}
      </div>

      <!-- Browse Tab -->
      <div class="seller-tab-pane active" id="seller-tab-browse">
        <p class="seller-intro">Entdecke Angebote von unabhängigen Händlern auf Amazon 2.0.</p>
        ${sellerListings.length > 0 ? `
          <div class="seller-listings-grid">
            ${sellerListings.map(p => `
              <div class="seller-listing-card">
                <img src="${p.images[0]}" alt="${p.title}" width="80" height="80" />
                <div class="seller-listing-info">
                  <p class="seller-listing-title">${p.title}</p>
                  <p class="seller-listing-seller">Verkäufer: ${p.seller}</p>
                  <p class="seller-listing-price">${formatPrice(p.price)}</p>
                  <span class="seller-badge">Marketplace</span>
                </div>
              </div>
            `).join('')}
          </div>
        ` : '<p class="no-content">Noch keine Marketplace-Angebote. Sei der Erste!</p>'}
      </div>

      <!-- List Tab -->
      <div class="seller-tab-pane hidden" id="seller-tab-list">
        <p class="seller-intro">Verkaufe deine Artikel direkt über Amazon 2.0. Einfach, schnell und sicher.</p>
        <form id="sellerListingForm" class="seller-form" novalidate>
          <div class="form-row">
            <div class="form-group">
              <label for="sellerProductTitle">Produkttitel *</label>
              <input type="text" id="sellerProductTitle" class="form-input" placeholder="z.B. iPhone 14 Pro 256GB" required />
            </div>
            <div class="form-group">
              <label for="sellerProductBrand">Marke *</label>
              <input type="text" id="sellerProductBrand" class="form-input" placeholder="z.B. Apple" required />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="sellerProductCategory">Kategorie *</label>
              <select id="sellerProductCategory" class="filter-select" required>
                <option value="">Kategorie wählen…</option>
                ${CATEGORIES_FOR_LISTING.map(c => `<option value="${c.id}">${c.label}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label for="sellerProductPrice">Preis (€) *</label>
              <input type="number" id="sellerProductPrice" class="form-input" placeholder="0.00" min="0.01" step="0.01" required />
            </div>
          </div>
          <div class="form-group">
            <label for="sellerProductDesc">Beschreibung *</label>
            <textarea id="sellerProductDesc" class="form-textarea" rows="4" placeholder="Beschreibe deinen Artikel…" required></textarea>
          </div>
          <div class="form-group">
            <label for="sellerProductImage">Bild-URL</label>
            <input type="url" id="sellerProductImage" class="form-input" placeholder="https://…" />
          </div>
          <div class="form-group">
            <label for="sellerName">Dein Verkäufername *</label>
            <input type="text" id="sellerName" class="form-input" value="${state.userProfile.name}" required />
          </div>
          <button type="submit" class="btn-primary">✓ Jetzt einstellen</button>
        </form>
      </div>

      <!-- My Listings Tab -->
      ${sellerListings.length > 0 ? `
        <div class="seller-tab-pane hidden" id="seller-tab-my-listings">
          <p class="seller-intro">Deine aktiven Marketplace-Angebote.</p>
          <div class="my-listings-list">
            ${sellerListings.map(p => `
              <div class="my-listing-card">
                <img src="${p.images[0]}" alt="${p.title}" width="60" height="60" />
                <div class="my-listing-info">
                  <p>${p.title}</p>
                  <p class="my-listing-price">${formatPrice(p.price)}</p>
                </div>
                <button class="btn-ghost-sm remove-listing-btn" data-product-id="${p.id}">Löschen</button>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById('sellerClose')?.addEventListener('click', closeSellerModal);

  // Tab switching
  modal.querySelectorAll('.seller-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-seller-tab')!;
      modal.querySelectorAll('.seller-tab-btn').forEach(b => b.classList.remove('active'));
      modal.querySelectorAll('.seller-tab-pane').forEach(p => p.classList.add('hidden'));
      btn.classList.add('active');
      document.getElementById(`seller-tab-${tab}`)?.classList.remove('hidden');
    });
  });

  // Listing form
  document.getElementById('sellerListingForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const title = (document.getElementById('sellerProductTitle') as HTMLInputElement).value.trim();
    const brand = (document.getElementById('sellerProductBrand') as HTMLInputElement).value.trim();
    const category = (document.getElementById('sellerProductCategory') as HTMLSelectElement).value;
    const price = parseFloat((document.getElementById('sellerProductPrice') as HTMLInputElement).value);
    const description = (document.getElementById('sellerProductDesc') as HTMLTextAreaElement).value.trim();
    const imageUrl = (document.getElementById('sellerProductImage') as HTMLInputElement).value.trim();
    const sellerName = (document.getElementById('sellerName') as HTMLInputElement).value.trim();

    if (!title || !brand || !category || !price || !description || !sellerName) {
      showToast('Bitte alle Pflichtfelder ausfüllen.', 'warning');
      return;
    }

    const newProduct: Product = {
      id: `seller-${generateId()}`,
      title,
      brand,
      category,
      price,
      rating: 0,
      reviewCount: 0,
      inStock: true,
      isPrime: false,
      images: [imageUrl || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&auto=format&fit=crop'],
      description,
      seller: sellerName,
    };

    state.products.unshift(newProduct);
    onRefresh();
    closeSellerModal();
    showToast(`"${title}" wurde eingestellt!`, 'success');
  });

  // Remove listings
  modal.querySelectorAll('.remove-listing-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-product-id')!;
      const idx = state.products.findIndex(p => p.id === id);
      if (idx >= 0) state.products.splice(idx, 1);
      onRefresh();
      closeSellerModal();
      openSellerModal(state, onRefresh);
    });
  });

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { closeSellerModal(); document.removeEventListener('keydown', onKeydown); }
  };
  document.addEventListener('keydown', onKeydown);
}

export function injectSellerListings(_state: AppState): void {
  // Seller listings are loaded from state.products (already filtered)
  // This function is kept for compatibility
}

function closeSellerModal(): void {
  sellerModal?.classList.remove('open');
  document.body.style.overflow = '';
}
