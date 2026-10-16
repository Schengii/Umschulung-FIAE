// ============================================================
// Amazon 2.0 – Brain-Computer-Interface (BCI) Mind-Shopping Modal
// ============================================================
import type { AppState } from '../types';
import { getBCITelemetry } from '../utils/bciMindShopping';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';
import { emit } from '../store';

let bciModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!bciModalEl) {
    bciModalEl = document.createElement('div');
    bciModalEl.id = 'bciMindModal';
    bciModalEl.className = 'modal-overlay';
    bciModalEl.setAttribute('role', 'dialog');
    bciModalEl.setAttribute('aria-modal', 'true');
    bciModalEl.setAttribute('aria-label', 'BCI Mind-Shopping Interface');
    document.body.appendChild(bciModalEl);
  }
  return bciModalEl;
}

export function openBCIMindModal(state: AppState): void {
  const modal = getModal();
  renderBCIUI(modal, state);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeBCIMindModal(): void {
  if (bciModalEl) {
    bciModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderBCIUI(modal: HTMLElement, state: AppState): void {
  const bci = getBCITelemetry();
  const sampleProduct = state.products[0];

  modal.innerHTML = `
    <div class="modal-dialog bci-dialog">
      <button class="modal-close" id="closeBCIBtn" aria-label="Schließen">✕</button>

      <div class="bci-header">
        <div class="bci-badge">🧠 BRAIN-COMPUTER INTERFACE (BCI)</div>
        <h2>Gedankengesteuertes Mind-Shopping</h2>
        <p class="bci-sub">Neuronale EEG-Intentionserkennung für mentale Artikelauswahl und blitzschnelles Bestellen durch puren Gedanken-Fokus.</p>
      </div>

      <!-- Brainwave Activity Visualizer -->
      <div class="bci-eeg-viewport">
        <div class="eeg-waves-canvas">
          <div class="eeg-line alpha"></div>
          <div class="eeg-line beta"></div>
          <div class="eeg-line gamma"></div>
        </div>
        <div class="bci-focus-overlay">
          <span>🎯 Mentale Intention: <strong>${bci.mentalWishlistTarget} (${bci.mindIntentConfidencePercent}% Konfidenz)</strong></span>
        </div>
      </div>

      <!-- EEG Bands Stats -->
      <div class="bci-bands-grid">
        <div class="band-box">
          <span class="bb-lbl">Alpha-Wellen (Entspannung):</span>
          <strong>${bci.alphaRelaxationPercent}%</strong>
        </div>
        <div class="band-box">
          <span class="bb-lbl">Beta-Wellen (Fokus/Kaufabsicht):</span>
          <strong style="color: #10b981;">${bci.betaFocusPercent}% (Hoch)</strong>
        </div>
        <div class="band-box">
          <span class="bb-lbl">Gamma-Wellen (Kognition):</span>
          <strong>${bci.gammaCognitiveLoadPercent}%</strong>
        </div>
      </div>

      <!-- Actions -->
      <div class="bci-actions-row">
        <button class="btn-primary" id="executeMindBuyBtn">
          🧠 Mit Gedankenkraft in den Warenkorb beamen
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeBCIBtn')?.addEventListener('click', closeBCIMindModal);

  document.getElementById('executeMindBuyBtn')?.addEventListener('click', () => {
    const existing = state.cart.find(c => c.product.id === sampleProduct.id);
    if (existing) existing.qty += 1;
    else state.cart.push({ product: sampleProduct, qty: 1, addedAt: Date.now() });

    emit('cart:changed');
    playSound('cart');
    triggerHaptic('heavy');
    showToast(`🧠 Gedanken-Trigger erkannt! „${sampleProduct.title}“ mental in den Warenkorb gelegt!`, 'success');
    closeBCIMindModal();
  });
}
