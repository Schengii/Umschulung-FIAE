// ============================================================
// Amazon 2.0 – Product Modal Component
// ============================================================
import type { AppState, Product, Review, QAItem } from '../types';
import { formatPrice, renderStars, formatDiscount, sanitizeHtml } from '../utils/formatters';
import { renderPriceHistoryChart } from './priceHistoryChart';

type AddToCartCallback = (product: Product, qty: number) => void;
type BuyNowCallback = (product: Product, qty: number) => void;
type AddReviewCallback = (productId: string, review: Review) => void;
type AddQACallback = (productId: string, qa: QAItem) => void;

let modalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'productModal';
    modalEl.className = 'modal-overlay';
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.setAttribute('aria-label', 'Produktdetails');
    document.body.appendChild(modalEl);
    modalEl.addEventListener('click', e => {
      if (e.target === modalEl) closeProductModal();
    });
  }
  return modalEl;
}

export function openProductModal(
  product: Product,
  onAddToCart: AddToCartCallback,
  onBuyNow: BuyNowCallback,
  onAddReview: AddReviewCallback,
  onAddQA: AddQACallback,
  state: AppState
): void {
  const modal = getModal();
  const allReviews = [...(product.reviews ?? []), ...(product.customReviews ?? [])];
  const discount = product.discount ? formatDiscount(product.originalPrice!, product.price) : null;

  let currentImg = 0;
  let selectedQty = 1;

  modal.innerHTML = `
    <div class="modal-dialog product-modal-dialog">
      <button class="modal-close" id="productModalClose" aria-label="Schließen">✕</button>

      <div class="product-modal-layout">
        <!-- Left: Images -->
        <div class="product-modal-gallery">
          <div class="gallery-thumbs">
            ${product.images.map((img, i) => `
              <button class="gallery-thumb ${i === 0 ? 'active' : ''}" data-img-idx="${i}" aria-label="Bild ${i + 1}">
                <img src="${img}" alt="${product.title} Bild ${i + 1}" width="60" height="60" loading="lazy" />
              </button>
            `).join('')}
          </div>
          <div class="gallery-main">
            <img id="productModalMainImg" src="${product.images[0]}" alt="${product.title}" class="gallery-main-img" />
            <button id="launch3DBtn" class="btn-3d-launcher" title="3D Ansicht & AR Modus starten">
              📦 3D & AR Ansicht
            </button>
            ${product.images.length > 1 ? `
              <button class="gallery-arrow gallery-prev" id="galleryPrev" aria-label="Vorheriges Bild">‹</button>
              <button class="gallery-arrow gallery-next" id="galleryNext" aria-label="Nächstes Bild">›</button>
            ` : ''}
          </div>
        </div>

        <!-- Right: Info -->
        <div class="product-modal-info">
          <p class="modal-brand">${product.brand}</p>
          <h1 class="modal-title">${product.title}</h1>

          <div class="modal-rating-row">
            ${renderStars(product.rating)}
            <a href="#reviews-section" class="review-count-link">${allReviews.length} Bewertungen</a>
            ${product.isPrime ? '<span class="prime-badge">⭐ Prime</span>' : ''}
          </div>

          <div class="modal-price-section">
            ${discount ? `<span class="modal-discount-badge">${discount}</span>` : ''}
            <span class="modal-price">${formatPrice(product.price)}</span>
            ${product.originalPrice ? `
              <span class="modal-original-price">
                UVP: <s>${formatPrice(product.originalPrice)}</s>
              </span>
            ` : ''}
          </div>

          ${product.isLightningDeal ? `
            <div class="modal-lightning-deal">
              ⚡ <strong>Blitzangebot</strong> – ${product.lightningDealProgress}% bereits verkauft
              <div class="deal-progress-bar">
                <div class="deal-progress-fill" style="width: ${product.lightningDealProgress}%"></div>
              </div>
            </div>
          ` : ''}

          <div class="modal-availability ${product.inStock ? 'in-stock' : 'out-stock'}">
            ${product.inStock
              ? `✓ Auf Lager${product.stockQty && product.stockQty <= 10 ? ` – Nur noch ${product.stockQty}!` : ''}`
              : '⚠ Derzeit nicht verfügbar'}
          </div>

          ${product.isPrime ? '<p class="modal-prime-delivery">📦 Kostenlose Prime-Lieferung morgen</p>' : ''}

          <div class="modal-qty-row">
            <label class="qty-label" for="modalQtySelect">Menge:</label>
            <select id="modalQtySelect" class="modal-qty-select" aria-label="Menge auswählen">
              ${Array.from({ length: Math.min(10, product.stockQty ?? 10) }, (_, i) =>
                `<option value="${i + 1}">${i + 1}</option>`
              ).join('')}
            </select>
          </div>

          <div class="modal-actions">
            <button class="modal-add-cart-btn" id="modalAddToCart" ${!product.inStock ? 'disabled' : ''}>
              🛒 In den Warenkorb
            </button>
            <button class="modal-buy-now-btn" id="modalBuyNow" ${!product.inStock ? 'disabled' : ''}>
              ⚡ Sofort kaufen
            </button>
          </div>

          <div class="modal-description">
            <h3>Produktbeschreibung</h3>
            <p>${product.description}</p>
          </div>

          ${product.features && product.features.length > 0 ? `
            <div class="modal-features">
              <h3>Highlights</h3>
              <ul>
                ${product.features.map(f => `<li>✓ ${f}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Tabs -->
      <div class="modal-tabs">
        <div class="tab-nav" role="tablist">
          <button class="tab-btn active" role="tab" aria-selected="true" data-tab="specs">Technische Daten</button>
          <button class="tab-btn" role="tab" aria-selected="false" data-tab="reviews">Bewertungen (${allReviews.length})</button>
          <button class="tab-btn" role="tab" aria-selected="false" data-tab="qa">Fragen & Antworten</button>
          <button class="tab-btn" role="tab" aria-selected="false" data-tab="price-history">Preisverlauf</button>
          ${product.bundleWith && product.bundleWith.length > 0 ? `
            <button class="tab-btn" role="tab" aria-selected="false" data-tab="bundle">Bundle-Deals</button>
          ` : ''}
        </div>

        <!-- Specs Tab -->
        <div class="tab-pane active" id="tab-specs">
          ${product.specs && Object.keys(product.specs).length > 0 ? `
            <table class="specs-table">
              <tbody>
                ${Object.entries(product.specs).map(([k, v]) => `
                  <tr><th>${k}</th><td>${v}</td></tr>
                `).join('')}
              </tbody>
            </table>
          ` : '<p>Keine technischen Daten verfügbar.</p>'}
        </div>

        <!-- Reviews Tab -->
        <div class="tab-pane" id="tab-reviews">
          <div id="reviews-section">
            <div class="reviews-summary">
              <div class="rating-big">${product.rating.toFixed(1)}</div>
              <div>
                ${renderStars(product.rating)}
                <p>${allReviews.length} Bewertungen</p>
              </div>
            </div>
            <div class="reviews-list">
              ${allReviews.length > 0
                ? allReviews.map(r => renderReview(r)).join('')
                : '<p class="no-content">Noch keine Bewertungen. Sei der Erste!</p>'
              }
            </div>
            <div class="add-review-section">
              <h4>Bewertung schreiben</h4>
              <form id="reviewForm" class="review-form" novalidate>
                <div class="form-group">
                  <label for="reviewAuthor">Name *</label>
                  <input type="text" id="reviewAuthor" class="form-input" placeholder="Dein Name" required />
                </div>
                <div class="form-group">
                  <label for="reviewRating">Bewertung *</label>
                  <div class="star-input" id="starInput" role="group" aria-label="Sternebewertung">
                    ${[1,2,3,4,5].map(n => `
                      <button type="button" class="star-input-btn" data-star="${n}" aria-label="${n} Stern${n > 1 ? 'e' : ''}">★</button>
                    `).join('')}
                  </div>
                  <input type="hidden" id="reviewRating" value="0" />
                </div>
                <div class="form-group">
                  <label for="reviewTitle">Titel *</label>
                  <input type="text" id="reviewTitle" class="form-input" placeholder="Kurze Zusammenfassung" required />
                </div>
                <div class="form-group">
                  <label for="reviewBody">Bewertung *</label>
                  <textarea id="reviewBody" class="form-textarea" rows="4" placeholder="Teile deine Erfahrungen…" required></textarea>
                </div>
                <button type="submit" class="btn-primary" id="reviewSubmitBtn">Bewertung absenden</button>
              </form>
            </div>
          </div>
        </div>

        <!-- Q&A Tab -->
        <div class="tab-pane" id="tab-qa">
          <div class="qa-list">
            ${(product.qa ?? []).length > 0
              ? (product.qa ?? []).map(q => renderQA(q)).join('')
              : '<p class="no-content">Noch keine Fragen gestellt.</p>'
            }
          </div>
          <div class="add-qa-section">
            <h4>Frage stellen</h4>
            <form id="qaForm" class="qa-form" novalidate>
              <div class="form-group">
                <label for="qaAuthor">Name *</label>
                <input type="text" id="qaAuthor" class="form-input" placeholder="Dein Name" required />
              </div>
              <div class="form-group">
                <label for="qaQuestion">Frage *</label>
                <textarea id="qaQuestion" class="form-textarea" rows="3" placeholder="Stelle deine Frage zum Produkt…" required></textarea>
              </div>
              <button type="submit" class="btn-primary" id="qaSubmitBtn">Frage absenden</button>
            </form>
          </div>
        </div>

        <!-- Price History Tab -->
        <div class="tab-pane" id="tab-price-history">
          ${product.priceHistory && product.priceHistory.length > 0
            ? `<div id="priceHistoryChart"></div>`
            : '<p class="no-content">Kein Preisverlauf verfügbar.</p>'
          }
        </div>

        <!-- Bundle Tab -->
        ${product.bundleWith && product.bundleWith.length > 0 ? `
          <div class="tab-pane" id="tab-bundle">
            <div id="bundleProducts"></div>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Open modal
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Focus trap
  const closeBtn = document.getElementById('productModalClose');
  closeBtn?.addEventListener('click', closeProductModal);
  closeBtn?.focus();

  // Gallery
  const mainImg = document.getElementById('productModalMainImg') as HTMLImageElement;
  function showImg(idx: number) {
    currentImg = (idx + product.images.length) % product.images.length;
    mainImg.src = product.images[currentImg];
    modal.querySelectorAll('.gallery-thumb').forEach((t, i) => t.classList.toggle('active', i === currentImg));
  }

  modal.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => showImg(Number(thumb.getAttribute('data-img-idx'))));
  });
  document.getElementById('galleryPrev')?.addEventListener('click', () => showImg(currentImg - 1));
  document.getElementById('galleryNext')?.addEventListener('click', () => showImg(currentImg + 1));

  // 3D Viewer Launch
  document.getElementById('launch3DBtn')?.addEventListener('click', () => {
    import('./product3DViewer').then(({ open3DViewerModal }) => open3DViewerModal(product));
  });

  // Qty
  const qtySelect = document.getElementById('modalQtySelect') as HTMLSelectElement;
  qtySelect?.addEventListener('change', () => { selectedQty = Number(qtySelect.value); });

  // Add to cart
  document.getElementById('modalAddToCart')?.addEventListener('click', () => {
    onAddToCart(product, selectedQty);
  });

  // Buy now
  document.getElementById('modalBuyNow')?.addEventListener('click', () => {
    onBuyNow(product, selectedQty);
    closeProductModal();
  });

  // Tabs
  modal.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab')!;
      modal.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      modal.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById(`tab-${tab}`)?.classList.add('active');

      // Render price history chart on demand
      if (tab === 'price-history' && product.priceHistory) {
        renderPriceHistoryChart(product.priceHistory, product.price, 'priceHistoryChart');
      }

      // Render bundle products on demand
      if (tab === 'bundle' && product.bundleWith && state) {
        renderBundleProducts(product, state, onAddToCart);
      }
    });
  });

  // Star rating input
  let selectedRating = 0;
  modal.querySelectorAll('.star-input-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRating = Number(btn.getAttribute('data-star'));
      (document.getElementById('reviewRating') as HTMLInputElement).value = String(selectedRating);
      modal.querySelectorAll('.star-input-btn').forEach((b, i) => {
        b.classList.toggle('active', i < selectedRating);
      });
    });
    btn.addEventListener('mouseenter', () => {
      const hoverStar = Number(btn.getAttribute('data-star'));
      modal.querySelectorAll('.star-input-btn').forEach((b, i) => {
        b.classList.toggle('hover', i < hoverStar);
      });
    });
    btn.addEventListener('mouseleave', () => {
      modal.querySelectorAll('.star-input-btn').forEach(b => b.classList.remove('hover'));
    });
  });

  // Review form
  document.getElementById('reviewForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const author = sanitizeHtml((document.getElementById('reviewAuthor') as HTMLInputElement).value.trim());
    const rating = Number((document.getElementById('reviewRating') as HTMLInputElement).value);
    const title = sanitizeHtml((document.getElementById('reviewTitle') as HTMLInputElement).value.trim());
    const body = sanitizeHtml((document.getElementById('reviewBody') as HTMLTextAreaElement).value.trim());

    if (!author || !rating || !title || !body) {
      // Show error on invalid fields
      return;
    }

    const newReview: Review = {
      author,
      rating,
      title,
      body,
      date: new Date().toISOString().split('T')[0],
      verified: false,
      helpful: 0,
    };

    onAddReview(product.id, newReview);
    closeProductModal();
  });

  // Q&A form
  document.getElementById('qaForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const author = sanitizeHtml((document.getElementById('qaAuthor') as HTMLInputElement).value.trim());
    const question = sanitizeHtml((document.getElementById('qaQuestion') as HTMLTextAreaElement).value.trim());

    if (!author || !question) return;

    const newQA: QAItem = {
      question,
      answer: 'Diese Frage wurde noch nicht beantwortet.',
      date: new Date().toISOString().split('T')[0],
      author,
    };

    onAddQA(product.id, newQA);
    closeProductModal();
  });

  // Escape key
  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { closeProductModal(); document.removeEventListener('keydown', onKeydown); }
  };
  document.addEventListener('keydown', onKeydown);
}

function renderReview(r: Review): string {
  return `
    <div class="review-item">
      <div class="review-header">
        <div class="review-avatar">${r.author.charAt(0).toUpperCase()}</div>
        <div>
          <strong class="review-author">${r.author}</strong>
          ${r.verified ? '<span class="verified-badge">✓ Verifizierter Kauf</span>' : ''}
          <span class="review-date">${r.date}</span>
        </div>
        <div class="review-stars">${renderStars(r.rating)}</div>
      </div>
      <h4 class="review-title">${r.title}</h4>
      <p class="review-body">${r.body}</p>
      <p class="review-helpful">Hilfreich: ${r.helpful}</p>
    </div>
  `;
}

function renderQA(qa: QAItem): string {
  return `
    <div class="qa-item">
      <div class="qa-question">
        <span class="qa-q-label">F:</span>
        <strong>${qa.question}</strong>
      </div>
      <div class="qa-answer">
        <span class="qa-a-label">A:</span>
        <p>${qa.answer}</p>
      </div>
      <p class="qa-meta">${qa.author} · ${qa.date}</p>
    </div>
  `;
}

function renderBundleProducts(product: Product, state: AppState, onAddToCart: AddToCartCallback): void {
  const container = document.getElementById('bundleProducts');
  if (!container) return;

  const bundleItems = (product.bundleWith ?? [])
    .map(id => state.products.find(p => p.id === id))
    .filter(Boolean) as Product[];

  if (bundleItems.length === 0) {
    container.innerHTML = '<p>Keine Bundle-Produkte verfügbar.</p>';
    return;
  }

  const bundleTotal = product.price + bundleItems.reduce((s, p) => s + p.price, 0);
  const bundleDiscount = bundleTotal * 0.05; // 5% bundle discount

  container.innerHTML = `
    <div class="bundle-section">
      <h4>Wird oft zusammen gekauft</h4>
      <div class="bundle-products">
        <div class="bundle-main-product">
          <img src="${product.images[0]}" alt="${product.title}" width="80" height="80" />
          <p>${product.title}</p>
          <strong>${formatPrice(product.price)}</strong>
        </div>
        ${bundleItems.map(bp => `
          <div class="bundle-sep">+</div>
          <div class="bundle-side-product" data-bundle-product="${bp.id}">
            <img src="${bp.images[0]}" alt="${bp.title}" width="80" height="80" />
            <p>${bp.title}</p>
            <strong>${formatPrice(bp.price)}</strong>
          </div>
        `).join('')}
      </div>
      <div class="bundle-total">
        <p>Zusammen: <s>${formatPrice(bundleTotal)}</s> → <strong>${formatPrice(bundleTotal - bundleDiscount)}</strong></p>
        <small>5% Bundle-Rabatt</small>
        <button class="btn-primary bundle-add-all-btn" id="bundleAddAll">Alle in den Warenkorb</button>
      </div>
    </div>
  `;

  document.getElementById('bundleAddAll')?.addEventListener('click', () => {
    bundleItems.forEach(bp => onAddToCart(bp, 1));
    onAddToCart(product, 1);
    closeProductModal();
  });
}

export function closeProductModal(): void {
  modalEl?.classList.remove('open');
  document.body.style.overflow = '';
}
