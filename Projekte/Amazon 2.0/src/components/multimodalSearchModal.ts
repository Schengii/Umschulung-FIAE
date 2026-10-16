// ============================================================
// Amazon 2.0 – Multimodal Visual & Audio Fingerprint Search Modal
// ============================================================
import type { AppState } from '../types';
import { formatPrice } from '../utils/formatters';
import { searchMultimodalHybrid } from '../utils/multimodalSearch';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';
import { emit } from '../store';

let multiModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!multiModalEl) {
    multiModalEl = document.createElement('div');
    multiModalEl.id = 'multimodalSearchModal';
    multiModalEl.className = 'modal-overlay';
    multiModalEl.setAttribute('role', 'dialog');
    multiModalEl.setAttribute('aria-modal', 'true');
    multiModalEl.setAttribute('aria-label', 'Multimodale Bild- & Audio-Suche');
    document.body.appendChild(multiModalEl);
  }
  return multiModalEl;
}

export function openMultimodalSearchModal(state: AppState): void {
  const modal = getModal();
  renderMultiUI(modal, state);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeMultimodalSearchModal(): void {
  if (multiModalEl) {
    multiModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderMultiUI(modal: HTMLElement, state: AppState): void {
  const res = searchMultimodalHybrid(state.products);

  modal.innerHTML = `
    <div class="modal-dialog multimodal-dialog">
      <button class="modal-close" id="closeMultiBtn" aria-label="Schließen">✕</button>

      <div class="multimodal-header">
        <div class="multimodal-badge">🤖 MULTIMODAL VISION & AUDIO AI</div>
        <h2>Multimodale Live-Kamera & Audio-Suche</h2>
        <p class="multimodal-sub">Kombinierte neuronale Bild- und akustische Frequenzerkennung zur perfekten Produktidentifikation.</p>
      </div>

      <div class="multimodal-viewport-grid">
        <!-- Camera Viewport -->
        <div class="multi-cam-card">
          <img src="${res.product.images[0]}" alt="${res.product.title}" class="multi-scan-img" />
          <div class="multi-scan-laser"></div>
          <div class="multi-conf-tag">👁️ Visuelle Konfidenz: ${res.visualConfidencePercent}%</div>
        </div>

        <!-- Audio Spectrogram Viewport -->
        <div class="multi-audio-card">
          <div class="audio-waves-bars">
            <span class="bar b1"></span><span class="bar b2"></span><span class="bar b3"></span>
            <span class="bar b4"></span><span class="bar b5"></span><span class="bar b6"></span>
          </div>
          <div class="audio-scene-label">🎙️ ${res.detectedAcousticScene}</div>
          <div class="multi-conf-tag">🔊 Audio-Konfidenz: ${res.audioConfidencePercent}%</div>
        </div>
      </div>

      <!-- Detected Result Match Card -->
      <div class="multi-result-card">
        <div class="m-res-top">
          <div class="m-res-meta">
            <h4>${res.product.title}</h4>
            <div class="m-tag-chips">
              ${res.detectedVisualTags.map(t => `<span class="m-tag">#${t}</span>`).join('')}
            </div>
          </div>
          <div class="m-res-score">
            <span>Match:</span>
            <strong>${res.combinedMatchPercent}%</strong>
          </div>
        </div>

        <div class="m-res-footer">
          <span class="m-res-price">${formatPrice(res.product.price)}</span>
          <button class="btn-primary" id="openMatchedProductBtn">
            🛒 Artikel direkt in den Warenkorb
          </button>
        </div>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeMultiBtn')?.addEventListener('click', closeMultimodalSearchModal);

  document.getElementById('openMatchedProductBtn')?.addEventListener('click', () => {
    const existing = state.cart.find(c => c.product.id === res.product.id);
    if (existing) existing.qty += 1;
    else state.cart.push({ product: res.product, qty: 1, addedAt: Date.now() });

    emit('cart:changed');
    playSound('cart');
    triggerHaptic('heavy');
    showToast(`🤖 „${res.product.title}“ wurde über multimodale Suche gefunden & in den Warenkorb gelegt!`, 'success');
    closeMultimodalSearchModal();
  });
}
