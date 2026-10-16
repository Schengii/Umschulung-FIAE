// ============================================================
// Amazon 2.0 – Sleep & Regeneration Neuro-Architecture Modal
// ============================================================
import type { AppState } from '../types';
import { computeSleepArchitecture } from '../utils/sleepErgoArchitect';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';
import { emit } from '../store';

let sleepModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!sleepModalEl) {
    sleepModalEl = document.createElement('div');
    sleepModalEl.id = 'sleepErgoModal';
    sleepModalEl.className = 'modal-overlay';
    sleepModalEl.setAttribute('role', 'dialog');
    sleepModalEl.setAttribute('aria-modal', 'true');
    sleepModalEl.setAttribute('aria-label', 'Schlaf- & Regenerations-Architekt');
    document.body.appendChild(sleepModalEl);
  }
  return sleepModalEl;
}

export function openSleepErgoModal(state: AppState): void {
  const modal = getModal();
  renderSleepUI(modal, state);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeSleepErgoModal(): void {
  if (sleepModalEl) {
    sleepModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderSleepUI(modal: HTMLElement, state: AppState): void {
  const rep = computeSleepArchitecture();
  const sampleProduct = state.products[0];

  modal.innerHTML = `
    <div class="modal-dialog sleep-dialog">
      <button class="modal-close" id="closeSleepBtn" aria-label="Schließen">✕</button>

      <div class="sleep-header">
        <div class="sleep-badge">🤖 SLEEP & REGENERATION NEURO-ARCHITECTURE</div>
        <h2>Wearable- & Schlafphasen-Konfigurator</h2>
        <p class="sleep-sub">Automatische Ermittlung optimaler Matratzen-Härtegrade, Kissenhöhen und Raumklima-Setups aus deinen Biometriedaten.</p>
      </div>

      <!-- Sleep Score Banner -->
      <div class="sleep-score-banner">
        <div class="sleep-score-ring">
          <span class="score-val">${rep.sleepQualityScore}</span>
          <span class="score-lbl">Schlaf-Index</span>
        </div>
        <div class="sleep-meta">
          <h4>Status: <strong>Tiefschlaf-Optimierung empfohlen</strong></h4>
          <p>Tiefschlaf: <strong>${rep.deepSleepSharePercent}%</strong> • REM: <strong>${rep.remSleepSharePercent}%</strong> • HRV: <strong>${rep.hrvVariabilityMs} ms</strong></p>
        </div>
        <div class="sleep-tag">✓ SYNC AKTIV</div>
      </div>

      <!-- Config Recommendation Cards -->
      <div class="sleep-telemetry-grid">
        <div class="sl-box">
          <span class="sl-lbl">Empfohlener Härtegrad:</span>
          <strong style="color: #38bdf8;">${rep.recommendedFirmness}</strong>
        </div>
        <div class="sl-box">
          <span class="sl-lbl">Orthopädische Kissenhöhe:</span>
          <strong>${rep.recommendedPillowHeightCm} cm</strong>
        </div>
        <div class="sl-box">
          <span class="sl-lbl">Optimale Schlaftemperatur:</span>
          <strong style="color: #10b981;">${rep.smartBedTemperatureCelsius}°C</strong>
        </div>
      </div>

      <!-- Advice Box -->
      <div class="sleep-advice-card">
        <h4>💡 KI-Ergonomie Empfehlung:</h4>
        <p>${rep.sleepErgoRecommendation}</p>
      </div>

      <!-- Action -->
      <div class="sleep-actions-row">
        <button class="btn-primary" id="applySleepSetupBtn">
          🛏️ Passendes orthopädisches Schlafpaket konfigurieren & in den Warenkorb
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeSleepBtn')?.addEventListener('click', closeSleepErgoModal);

  document.getElementById('applySleepSetupBtn')?.addEventListener('click', () => {
    const existing = state.cart.find(c => c.product.id === sampleProduct.id);
    if (existing) existing.qty += 1;
    else state.cart.push({ product: sampleProduct, qty: 1, addedAt: Date.now() });

    emit('cart:changed');
    playSound('cart');
    triggerHaptic('heavy');
    showToast(`🛏️ Orthopädisches Schlafpaket (${rep.recommendedFirmness}) konfiguriert & in den Warenkorb gelegt!`, 'success');
    closeSleepErgoModal();
  });
}
