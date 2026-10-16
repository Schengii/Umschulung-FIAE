// ============================================================
// Amazon 2.0 – Biometric Health & Ergonomics Sync Modal
// ============================================================
import type { AppState, Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { getSimulatedHealthMetrics, ERGO_RECOMMENDATIONS } from '../utils/healthErgoSync';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';
import { emit } from '../store';

let healthModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!healthModalEl) {
    healthModalEl = document.createElement('div');
    healthModalEl.id = 'healthErgoModal';
    healthModalEl.className = 'modal-overlay';
    healthModalEl.setAttribute('role', 'dialog');
    healthModalEl.setAttribute('aria-modal', 'true');
    healthModalEl.setAttribute('aria-label', 'Health & Ergonomie Hub');
    document.body.appendChild(healthModalEl);
  }
  return healthModalEl;
}

export function openHealthErgoModal(state: AppState): void {
  const modal = getModal();
  renderHealthUI(modal, state);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeHealthErgoModal(): void {
  if (healthModalEl) {
    healthModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderHealthUI(modal: HTMLElement, state: AppState): void {
  const metrics = getSimulatedHealthMetrics();

  modal.innerHTML = `
    <div class="modal-dialog health-dialog">
      <button class="modal-close" id="closeHealthBtn" aria-label="Schließen">✕</button>

      <div class="health-header">
        <div class="health-badge">🩺 WEARABLE & HEALTHKIT ERGO-SYNC</div>
        <h2>Biometrischer Ergonomie- & Health-Berater</h2>
        <p class="health-sub">Automatische Haltungs- & Bildschirmzeit-Analyse mit personalisierten ergonomischen Produkt-Upgrades.</p>
      </div>

      <!-- Health Score Card -->
      <div class="health-telemetry-banner">
        <div class="health-grade-circle grade-${metrics.ergoGrade}">
          <span>SCORE</span>
          <strong>${metrics.overallErgoScore}/100</strong>
        </div>
        <div class="health-metrics-summary">
          <h4>Ergonomie-Index: <strong>Note ${metrics.ergoGrade} (Optimierungsbedarf)</strong></h4>
          <div class="mini-metrics-row">
            <span>⏱️ Bildschirmzeit: <strong>${metrics.screenTimeHours}h / Tag</strong></span>
            <span>📐 Haltungsscore: <strong>${metrics.postureScorePercent}%</strong></span>
            <span>💙 Blaulicht: <strong>${metrics.blueLightExposureHours}h</strong></span>
          </div>
        </div>
      </div>

      <!-- Personalized Recommendations -->
      <div class="ergo-recs-section">
        <h3>Empfohlene Ergonomie-Upgrades (${ERGO_RECOMMENDATIONS.length})</h3>
        <div class="ergo-recs-list">
          ${ERGO_RECOMMENDATIONS.map(r => `
            <div class="ergo-rec-card">
              <div class="rec-header">
                <div>
                  <strong>${r.title}</strong>
                  <p class="rec-reason">💡 ${r.reason}</p>
                </div>
                <span class="rec-discount">-${r.discountPercent}% Rabatt</span>
              </div>

              <div class="rec-product-row">
                <div class="rec-item-info">
                  <span>🛍️ ${r.productSuggestion}</span>
                  <strong class="rec-price">${formatPrice(r.priceEur)}</strong>
                </div>
                <button class="btn-primary-sm btn-add-ergo-item" data-rec-id="${r.id}" data-rec-title="${r.productSuggestion}" data-rec-price="${r.priceEur}">
                  + In den Warenkorb
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeHealthBtn')?.addEventListener('click', closeHealthErgoModal);

  modal.querySelectorAll('.btn-add-ergo-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const title = target.getAttribute('data-rec-title') || 'Ergonomisches Produkt';
      const price = parseFloat(target.getAttribute('data-rec-price') || '39.99');

      const dummyProduct: Product = {
        id: `ergo-${Date.now()}`,
        title,
        price,
        originalPrice: +(price * 1.25).toFixed(2),
        rating: 4.9,
        reviewCount: 184,
        category: 'electronics',
        brand: 'ErgoHealth Pro',
        inStock: true,
        isPrime: true,
        images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500'],
        description: 'Biometrisch optimiertes Ergonomie-Upgrade für einen gesunden Arbeitsplatz.',
      };

      state.cart.push({ product: dummyProduct, qty: 1, addedAt: Date.now() });
      emit('cart:changed');
      playSound('cart');
      triggerHaptic('heavy');
      showToast(`🩺 „${title}“ wurde in den Warenkorb gelegt!`, 'success');
      closeHealthErgoModal();
    });
  });
}
