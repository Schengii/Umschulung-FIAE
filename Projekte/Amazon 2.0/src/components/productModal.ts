// ============================================================
// Amazon 2.0 – Product Modal Component with Variants & Bundles
// ============================================================
import type { AppState, Product, ProductVariant, Review, QAItem } from '../types';
import { formatPrice, renderStars, formatDiscount, sanitizeHtml } from '../utils/formatters';
import { renderPriceHistoryChart } from './priceHistoryChart';
import { playSound } from '../utils/audio';
import { showToast } from './toast';

import { renderDeliveryWidget } from './deliveryWidget';
import { openPriceAlertModal } from './priceAlerts';
import { subscribeToProduct, calculateSubscriptionDiscount } from './subscriptions';

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
  
  let selectedVariant: ProductVariant | undefined = product.variants?.[0];
  let currentPrice = product.price + (selectedVariant?.priceModifier ?? 0);
  let currentImg = 0;
  let selectedQty = 1;
  const subDiscount = calculateSubscriptionDiscount(currentPrice, 1);

  const discount = product.discount ? formatDiscount(product.originalPrice!, currentPrice) : null;

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
            <img id="productModalMainImg" src="${selectedVariant?.image ?? product.images[0]}" alt="${product.title}" class="gallery-main-img" />
            <div class="gallery-launchers-row">
              <button id="launch3DBtn" class="btn-3d-launcher" title="3D Ansicht & AR Modus starten">
                📦 3D & AR
              </button>
              <button id="launchHologramBtn" class="btn-3d-launcher" style="background: linear-gradient(135deg, #0891b2, #06b6d4);" title="WebXR AR Tabletop Hologram Projector">
                🕶️ Hologramm
              </button>
              <button id="launchRaytraceBtn" class="btn-3d-launcher" style="background: linear-gradient(135deg, #4f46e5, #9333ea);" title="WebGPU 3D Raytracing Shader Studio">
                ⚡ Raytracing
              </button>
              <button id="launchSmartFitBtn" class="btn-3d-launcher" style="background: linear-gradient(135deg, #059669, #10b981);" title="Computer-Vision Smart-Fitting Größen-KI">
                📐 Größen-KI
              </button>
            </div>
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
            <a href="#reviews-section" class="review-count-link" id="jumpReviewsLink">${allReviews.length} Bewertungen</a>
            ${product.isPrime ? '<span class="prime-badge">⭐ Prime</span>' : ''}
          </div>

          <div class="modal-price-section">
            ${discount ? `<span class="modal-discount-badge" id="modalDiscountBadge">${discount}</span>` : ''}
            <span class="modal-price" id="modalActivePrice">${formatPrice(currentPrice)}</span>
            ${product.originalPrice ? `
              <span class="modal-original-price">
                UVP: <s>${formatPrice(product.originalPrice)}</s>
              </span>
            ` : ''}
          </div>

          ${product.variants && product.variants.length > 0 ? `
            <div class="product-variants-section">
              <div class="variant-group-header">
                <strong>Ausführung / Variante:</strong>
                <span id="selectedVariantName">${selectedVariant?.name ?? ''}</span>
              </div>
              <div class="variants-picker" id="variantsPicker">
                ${product.variants.map((v, idx) => `
                  <button 
                    class="variant-btn ${idx === 0 ? 'active' : ''} ${v.type === 'color' ? 'variant-color-btn' : ''}" 
                    data-variant-id="${v.id}"
                    data-variant-idx="${idx}"
                    title="${v.name}"
                  >
                    ${v.colorCode ? `<span class="variant-color-dot" style="background-color: ${v.colorCode};"></span>` : ''}
                    <span class="variant-btn-label">${v.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Subscribe & Save / One-time Purchase Selector -->
          <div class="modal-purchase-type-box">
            <label class="purchase-type-option active" id="optionOneTimeLabel">
              <input type="radio" name="modalPurchaseType" id="modalPurchaseOneTime" value="onetime" checked />
              <div class="purchase-type-info">
                <strong>Einmalige Lieferung</strong>
                <span class="purchase-type-price">${formatPrice(currentPrice)}</span>
              </div>
            </label>
            <label class="purchase-type-option" id="optionSubLabel">
              <input type="radio" name="modalPurchaseType" id="modalPurchaseSub" value="subscribe" />
              <div class="purchase-type-info">
                <strong>📦 Spar-Abo (-${subDiscount.discountPercent}%)</strong>
                <span class="purchase-type-price text-success">${formatPrice(subDiscount.discountedPrice)}</span>
              </div>
            </label>

            <div class="sub-schedule-select-wrapper hidden" id="subScheduleWrapper">
              <label for="modalSubInterval" class="sub-schedule-label">Lieferintervall:</label>
              <select id="modalSubInterval" class="modal-sub-interval-select">
                <option value="1">Jeden Monat (-10%)</option>
                <option value="2">Alle 2 Monate (-10%)</option>
                <option value="3">Alle 3 Monate (-12%)</option>
                <option value="6">Alle 6 Monate (-15%)</option>
              </select>
            </div>
          </div>

          <!-- Dynamic Delivery & Live Express Countdown Widget -->
          <div id="productDeliveryWidgetContainer"></div>

          <div class="modal-availability ${product.inStock ? 'in-stock' : 'out-stock'}">
            ${product.inStock
              ? `✓ Auf Lager${product.stockQty && product.stockQty <= 10 ? ` – Nur noch ${product.stockQty} Stück verfügbar!` : ''}`
              : '⚠ Derzeit vergriffen (Ausverkauft)'}
          </div>

          <div class="modal-qty-row" id="modalQtyRow">
            <label class="qty-label" for="modalQtySelect">Menge:</label>
            <select id="modalQtySelect" class="modal-qty-select" aria-label="Menge auswählen" ${!product.inStock ? 'disabled' : ''}>
              ${Array.from({ length: Math.min(10, product.stockQty && product.stockQty > 0 ? product.stockQty : 1) }, (_, i) =>
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
            <button class="modal-haggle-btn" id="modalHaggleBtn" title="Verhandle einen Sonderrabatt mit unserem KI-Verkäufer">
              💬 Verhandeln
            </button>
            <button class="modal-alert-btn" id="modalPriceAlertBtn" title="Preisalarm bei Preissenkung setzen">
              🔔 Preisalarm
            </button>
            <button class="modal-forecast-btn" id="modalForecastBtn" title="30-Tage KI-Preisprognose & Kaufzeitpunkt-Empfehlung">
              📈 KI-Prognose
            </button>
            <button class="modal-carbon-btn" id="modalCarbonBtn" title="CO2-Ökobilanz & Klimakompensation">
              🌿 CO₂-Bilanz
            </button>
            <button class="modal-review-studio-btn" id="modalReviewStudioBtn" title="WASM Video-Review Studio öffnen">
              🎬 Video-Review
            </button>
            <button class="modal-customs-btn" id="modalCustomsBtn" title="Zoll- & Importgebühren Rechner">
              🌍 Zoll-Rechner
            </button>
          </div>

          <div class="modal-description">
            <h3>Produktbeschreibung</h3>
            <p>${product.description}</p>
          </div>

          ${product.features && product.features.length > 0 ? `
            <div class="modal-features">
              <h3>Highlights & Ausstattung</h3>
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
          <button class="tab-btn" role="tab" aria-selected="false" data-tab="shorts">📹 Video-Shorts & Unboxing</button>
          <button class="tab-btn" role="tab" aria-selected="false" data-tab="qa">Fragen & Antworten</button>
          <button class="tab-btn" role="tab" aria-selected="false" data-tab="price-history">Preisverlauf</button>
          ${product.bundleWith && product.bundleWith.length > 0 ? `
            <button class="tab-btn" role="tab" aria-selected="false" data-tab="bundle">🎁 Bundle & Zubehör</button>
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
                <p>${allReviews.length} Kundenbewertungen</p>
              </div>
            </div>
            <div class="reviews-list">
              ${allReviews.length > 0
                ? allReviews.map(r => renderReview(r)).join('')
                : '<p class="no-content">Noch keine Bewertungen vorhanden. Teile als Erster deine Meinung!</p>'
              }
            </div>
            <div class="add-review-section">
              <h4>Eigene Bewertung verfassen</h4>
              <form id="reviewForm" class="review-form" novalidate>
                <div class="form-group">
                  <label for="reviewAuthor">Dein Name *</label>
                  <input type="text" id="reviewAuthor" class="form-input" placeholder="z. B. Alex M." required />
                </div>
                <div class="form-group">
                  <label>Sternebewertung *</label>
                  <div class="star-input" id="starInput" role="group" aria-label="Sternebewertung">
                    ${[1,2,3,4,5].map(n => `
                      <button type="button" class="star-input-btn" data-star="${n}" aria-label="${n} Stern${n > 1 ? 'e' : ''}">★</button>
                    `).join('')}
                  </div>
                  <input type="hidden" id="reviewRating" value="5" />
                </div>
                <div class="form-group">
                  <label for="reviewTitle">Überschrift *</label>
                  <input type="text" id="reviewTitle" class="form-input" placeholder="Was ist das Wichtigste?" required />
                </div>
                <div class="form-group">
                  <label for="reviewBody">Erfahrungsbericht *</label>
                  <textarea id="reviewBody" class="form-textarea" rows="4" placeholder="Beschreibe, was dir gefällt oder nicht gefällt…" required></textarea>
                </div>
                <button type="submit" class="btn-primary" id="reviewSubmitBtn">Bewertung jetzt veröffentlichen</button>
              </form>
            </div>
          </div>
        </div>

        <!-- Video Shorts Tab -->
        <div class="tab-pane" id="tab-shorts">
          <div class="product-shorts-preview-box">
            <div class="shorts-callout-icon">📹</div>
            <h3>Kunden-Unboxings & Video-Reviews</h3>
            <p>Erlebe „${product.title}“ im echten Alltagstest mit interaktiven Unboxing-Reels von verifizierten Käufern.</p>
            <button class="btn-primary" id="launchProductShortsBtn">🎬 Video-Shorts jetzt abspielen</button>
          </div>
        </div>

        <!-- Q&A Tab -->
        <div class="tab-pane" id="tab-qa">
          <div class="qa-list">
            ${(product.qa ?? []).length > 0
              ? (product.qa ?? []).map(q => renderQA(q)).join('')
              : '<p class="no-content">Noch keine Fragen gestellt. Stelle deine Frage direkt an die Community!</p>'
            }
          </div>
          <div class="add-qa-section">
            <h4>Frage stellen</h4>
            <form id="qaForm" class="qa-form" novalidate>
              <div class="form-group">
                <label for="qaAuthor">Dein Name *</label>
                <input type="text" id="qaAuthor" class="form-input" placeholder="Dein Name" required />
              </div>
              <div class="form-group">
                <label for="qaQuestion">Deine Frage *</label>
                <textarea id="qaQuestion" class="form-textarea" rows="3" placeholder="Gibt es offene Fragen zu Maßen, Kompatibilität oder Zubehör?" required></textarea>
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

  // Focus trap & Close
  const closeBtn = document.getElementById('productModalClose');
  closeBtn?.addEventListener('click', () => {
    playSound('click');
    closeProductModal();
  });

  // Gallery
  const mainImg = document.getElementById('productModalMainImg') as HTMLImageElement;
  function showImg(idx: number) {
    currentImg = (idx + product.images.length) % product.images.length;
    if (mainImg) mainImg.src = product.images[currentImg];
    modal.querySelectorAll('.gallery-thumb').forEach((t, i) => t.classList.toggle('active', i === currentImg));
  }

  modal.querySelectorAll('.gallery-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      playSound('click');
      showImg(Number(thumb.getAttribute('data-img-idx')));
    });
  });
  document.getElementById('galleryPrev')?.addEventListener('click', () => showImg(currentImg - 1));
  document.getElementById('galleryNext')?.addEventListener('click', () => showImg(currentImg + 1));

  // Variant selector wiring
  if (product.variants && product.variants.length > 0) {
    const variantBtns = modal.querySelectorAll('.variant-btn');
    variantBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        playSound('click');
        const vIdx = Number(btn.getAttribute('data-variant-idx'));
        selectedVariant = product.variants![vIdx];

        variantBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const varLabel = document.getElementById('selectedVariantName');
        if (varLabel) varLabel.textContent = selectedVariant.name;

        currentPrice = product.price + (selectedVariant.priceModifier ?? 0);
        const priceEl = document.getElementById('modalActivePrice');
        if (priceEl) priceEl.textContent = formatPrice(currentPrice);

        if (selectedVariant.image && mainImg) {
          mainImg.src = selectedVariant.image;
        }
      });
    });
  }

  // Render Delivery Estimator & Live Countdown Widget
  renderDeliveryWidget('productDeliveryWidgetContainer');

  // Purchase Type Toggle (One-Time vs Subscribe & Save)
  let isSubscriptionSelected = false;
  let selectedInterval = 1;

  const oneTimeRadio = document.getElementById('modalPurchaseOneTime') as HTMLInputElement;
  const subRadio = document.getElementById('modalPurchaseSub') as HTMLInputElement;
  const optionOneTimeLabel = document.getElementById('optionOneTimeLabel');
  const optionSubLabel = document.getElementById('optionSubLabel');
  const subScheduleWrapper = document.getElementById('subScheduleWrapper');
  const subIntervalSelect = document.getElementById('modalSubInterval') as HTMLSelectElement;
  const addCartBtn = document.getElementById('modalAddToCart') as HTMLButtonElement;
  const buyNowBtn = document.getElementById('modalBuyNow') as HTMLButtonElement;

  function updatePurchaseTypeUI(isSub: boolean) {
    isSubscriptionSelected = isSub;
    optionOneTimeLabel?.classList.toggle('active', !isSub);
    optionSubLabel?.classList.toggle('active', isSub);
    subScheduleWrapper?.classList.toggle('hidden', !isSub);

    if (isSub) {
      const disc = calculateSubscriptionDiscount(currentPrice, selectedInterval);
      if (addCartBtn) addCartBtn.innerHTML = `📦 Spar-Abo einrichten (${formatPrice(disc.discountedPrice)})`;
      if (buyNowBtn) buyNowBtn.style.display = 'none';
    } else {
      if (addCartBtn) addCartBtn.innerHTML = '🛒 In den Warenkorb';
      if (buyNowBtn) buyNowBtn.style.display = '';
    }
  }

  oneTimeRadio?.addEventListener('change', () => updatePurchaseTypeUI(false));
  subRadio?.addEventListener('change', () => updatePurchaseTypeUI(true));

  subIntervalSelect?.addEventListener('change', () => {
    selectedInterval = parseInt(subIntervalSelect.value, 10);
    updatePurchaseTypeUI(true);
  });

  // Price Alert Button
  document.getElementById('modalPriceAlertBtn')?.addEventListener('click', () => {
    playSound('alert');
    openPriceAlertModal(product, state);
  });

  // 3D Viewer Launch
  document.getElementById('launch3DBtn')?.addEventListener('click', () => {
    playSound('quest');
    import('./product3DViewer').then(({ open3DViewerModal }) => open3DViewerModal(product));
  });

  // WebXR AR Tabletop Hologram Projector Launch
  document.getElementById('launchHologramBtn')?.addEventListener('click', () => {
    playSound('quest');
    import('./hologramProjector').then(({ openHologramProjectorModal }) => openHologramProjectorModal(product));
  });

  // WebGPU Raytracing Studio Launch
  document.getElementById('launchRaytraceBtn')?.addEventListener('click', () => {
    playSound('quest');
    import('./raytracingViewer').then(({ openRaytracingStudioModal }) => openRaytracingStudioModal(product));
  });

  // Smart-Fitting AI Launch
  document.getElementById('launchSmartFitBtn')?.addEventListener('click', () => {
    playSound('quest');
    import('./smartFitting').then(({ openSmartFittingModal }) => openSmartFittingModal(product));
  });

  // AI Price Forecast Launch
  document.getElementById('modalForecastBtn')?.addEventListener('click', () => {
    playSound('quest');
    import('./priceForecastModal').then(({ openPriceForecastModal }) => openPriceForecastModal(product));
  });

  // Carbon Offset Launch
  document.getElementById('modalCarbonBtn')?.addEventListener('click', () => {
    playSound('quest');
    import('./carbonOffsetModal').then(({ openCarbonOffsetModal }) => openCarbonOffsetModal(product));
  });

  // WASM Video Review Studio Launch
  document.getElementById('modalReviewStudioBtn')?.addEventListener('click', () => {
    playSound('quest');
    import('./reviewStudioModal').then(({ openReviewStudioModal }) => openReviewStudioModal(product));
  });

  // Cross-Border Customs Launch
  document.getElementById('modalCustomsBtn')?.addEventListener('click', () => {
    playSound('quest');
    import('./crossBorderCustomsModal').then(({ openCrossBorderCustomsModal }) => openCrossBorderCustomsModal(product));
  });

  // Video Shorts Launch
  document.getElementById('launchProductShortsBtn')?.addEventListener('click', () => {
    playSound('quest');
    import('./videoShorts').then(({ openVideoShortsModal }) => openVideoShortsModal(state, product.id));
  });

  // Price Haggler Launch
  document.getElementById('modalHaggleBtn')?.addEventListener('click', () => {
    playSound('click');
    import('./priceHaggler').then(({ openPriceHagglerModal }) => openPriceHagglerModal(state, product));
  });

  // Jump to reviews link
  document.getElementById('jumpReviewsLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    const reviewsTabBtn = modal.querySelector('.tab-btn[data-tab="reviews"]') as HTMLButtonElement;
    reviewsTabBtn?.click();
  });

  // Qty
  const qtySelect = document.getElementById('modalQtySelect') as HTMLSelectElement;
  qtySelect?.addEventListener('change', () => { selectedQty = Number(qtySelect.value); });

  // Add to cart with variant or Subscribe & Save
  document.getElementById('modalAddToCart')?.addEventListener('click', () => {
    if (isSubscriptionSelected) {
      subscribeToProduct(product, selectedInterval, state);
      closeProductModal();
    } else {
      playSound('cart');
      const productToAdd: Product = {
        ...product,
        price: currentPrice,
        selectedVariant: selectedVariant,
      };
      onAddToCart(productToAdd, selectedQty);
    }
  });

  // Buy now with variant
  document.getElementById('modalBuyNow')?.addEventListener('click', () => {
    playSound('checkout');
    const productToAdd: Product = {
      ...product,
      price: currentPrice,
      selectedVariant: selectedVariant,
    };
    onBuyNow(productToAdd, selectedQty);
    closeProductModal();
  });

  // Tabs
  modal.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      const tab = btn.getAttribute('data-tab')!;
      modal.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      modal.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      document.getElementById(`tab-${tab}`)?.classList.add('active');

      if (tab === 'price-history' && product.priceHistory) {
        renderPriceHistoryChart(product.priceHistory, product.price, 'priceHistoryChart');
      }

      if (tab === 'bundle' && product.bundleWith && state) {
        renderBundleProducts(product, state, onAddToCart);
      }
    });
  });

  // Star rating input
  let selectedRating = 5;
  modal.querySelectorAll('.star-input-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
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

  // Initial star states
  modal.querySelectorAll('.star-input-btn').forEach((b, i) => {
    b.classList.toggle('active', i < 5);
  });

  // Review form
  document.getElementById('reviewForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const author = sanitizeHtml((document.getElementById('reviewAuthor') as HTMLInputElement).value.trim());
    const rating = Number((document.getElementById('reviewRating') as HTMLInputElement).value) || 5;
    const title = sanitizeHtml((document.getElementById('reviewTitle') as HTMLInputElement).value.trim());
    const body = sanitizeHtml((document.getElementById('reviewBody') as HTMLTextAreaElement).value.trim());

    if (!author || !rating || !title || !body) {
      showToast('Bitte fülle alle Pflichtfelder aus!', 'warning');
      return;
    }

    const newReview: Review = {
      author,
      rating,
      title,
      body,
      date: new Date().toISOString().split('T')[0],
      verified: true,
      helpful: 1,
    };

    playSound('success');
    onAddReview(product.id, newReview);
    showToast('Danke für deine Bewertung! ⭐', 'success');
    closeProductModal();
  });

  // Q&A form
  document.getElementById('qaForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const author = sanitizeHtml((document.getElementById('qaAuthor') as HTMLInputElement).value.trim());
    const question = sanitizeHtml((document.getElementById('qaQuestion') as HTMLTextAreaElement).value.trim());

    if (!author || !question) {
      showToast('Bitte Name und Frage eingeben', 'warning');
      return;
    }

    const newQA: QAItem = {
      question,
      answer: 'Vielen Dank für deine Frage! Unser Support-Team prüft diese in Kürze.',
      date: new Date().toISOString().split('T')[0],
      author,
    };

    playSound('success');
    onAddQA(product.id, newQA);
    showToast('Deine Frage wurde erfolgreich übermittelt!', 'success');
    closeProductModal();
  });

  // Escape key
  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeProductModal();
      document.removeEventListener('keydown', onKeydown);
    }
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
      <p class="review-helpful">Hilfreich für ${r.helpful} Kunden</p>
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
    container.innerHTML = '<p class="no-content">Keine Bundle-Produkte verfügbar.</p>';
    return;
  }

  const allItems = [product, ...bundleItems];
  const bundleRawTotal = allItems.reduce((s, p) => s + p.price, 0);
  const bundleDiscount = bundleRawTotal * 0.10; // 10% Bundle Rabatt
  const bundleFinalTotal = bundleRawTotal - bundleDiscount;

  container.innerHTML = `
    <div class="bundle-section">
      <div class="bundle-badge">⚡ 10% Spar-Bundle</div>
      <h4>Wird oft zusammen gekauft</h4>
      <p class="bundle-desc">Kaufe das Komplett-Set und spare 10% auf alle Zubehörartikel:</p>
      
      <div class="bundle-products-grid">
        <div class="bundle-product-card main-card">
          <span class="bundle-role-badge">Hauptartikel</span>
          <img src="${product.images[0]}" alt="${product.title}" width="90" height="90" />
          <p class="bundle-prod-title">${product.title}</p>
          <strong class="bundle-prod-price">${formatPrice(product.price)}</strong>
        </div>

        ${bundleItems.map(bp => `
          <div class="bundle-plus">+</div>
          <div class="bundle-product-card">
            <span class="bundle-role-badge accessory">Zubehör</span>
            <img src="${bp.images[0]}" alt="${bp.title}" width="90" height="90" />
            <p class="bundle-prod-title">${bp.title}</p>
            <strong class="bundle-prod-price">${formatPrice(bp.price)}</strong>
          </div>
        `).join('')}
      </div>

      <div class="bundle-summary-box">
        <div class="bundle-pricing">
          <span class="bundle-total-label">Gesamtpreis für ${allItems.length} Artikel:</span>
          <div class="bundle-price-row">
            <s class="bundle-old-price">${formatPrice(bundleRawTotal)}</s>
            <strong class="bundle-new-price">${formatPrice(bundleFinalTotal)}</strong>
            <span class="bundle-save-tag">Du sparst ${formatPrice(bundleDiscount)}!</span>
          </div>
        </div>
        <button class="btn-primary bundle-add-all-btn" id="bundleAddAll">
          🛒 Alle ${allItems.length} Artikel in den Warenkorb (-10%)
        </button>
      </div>
    </div>
  `;

  document.getElementById('bundleAddAll')?.addEventListener('click', () => {
    playSound('cart');
    allItems.forEach(item => onAddToCart(item, 1));
    showToast(`Alle ${allItems.length} Bundle-Artikel mit 10% Rabatt hinzugefügt! 🎉`, 'success');
    closeProductModal();
  });
}

export function closeProductModal(): void {
  modalEl?.classList.remove('open');
  document.body.style.overflow = '';
}
