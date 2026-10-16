// ============================================================
// Amazon 2.0 – Layer-3 zk-STARK Privacy Rollups Modal
// ============================================================
import { executeLayer3AnonymousCheckout } from '../utils/layer3Rollup';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let l3ModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!l3ModalEl) {
    l3ModalEl = document.createElement('div');
    l3ModalEl.id = 'layer3RollupModal';
    l3ModalEl.className = 'modal-overlay';
    l3ModalEl.setAttribute('role', 'dialog');
    l3ModalEl.setAttribute('aria-modal', 'true');
    l3ModalEl.setAttribute('aria-label', 'Layer-3 Privacy Rollup');
    document.body.appendChild(l3ModalEl);
  }
  return l3ModalEl;
}

export function openLayer3RollupModal(): void {
  const modal = getModal();
  renderL3UI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeLayer3RollupModal(): void {
  if (l3ModalEl) {
    l3ModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderL3UI(modal: HTMLElement): void {
  const l3 = executeLayer3AnonymousCheckout();

  modal.innerHTML = `
    <div class="modal-dialog l3-dialog">
      <button class="modal-close" id="closeL3Btn" aria-label="Schließen">✕</button>

      <div class="l3-header">
        <div class="l3-badge">⚡ LAYER-3 RECURSIVE zk-STARK ROLLUP</div>
        <h2>Anonyme 10k TPS Blitz-Checkouts</h2>
        <p class="l3-sub">Zero-Knowledge Rollup Settlement für 100% private Transaktionen ohne Gas-Gebühren.</p>
      </div>

      <!-- Rollup Metrics Banner -->
      <div class="l3-metrics-banner">
        <div class="l3-shield-icon">🛡️</div>
        <div class="l3-meta">
          <h4>Durchsatz: <strong>10.000 Transaktionen / Sekunde</strong></h4>
          <p>Latenz: <strong>${l3.settlementLatencyMs} ms</strong> • Netzwerk-Gebühr: <strong>0,00 € (Kostenlos)</strong></p>
        </div>
        <div class="l3-tag">✓ ZERO-KNOWLEDGE</div>
      </div>

      <!-- Batch Info Card -->
      <div class="l3-batch-card">
        <div class="l3-row">
          <span>Rollup Network:</span>
          <strong>${l3.networkName}</strong>
        </div>
        <div class="l3-row">
          <span>Batch Merkle Root Hash:</span>
          <code>${l3.batchRootHashHex}</code>
        </div>
      </div>

      <!-- Action -->
      <div class="l3-actions-row">
        <button class="btn-primary" id="testL3PaymentBtn">
          ⚡ Anonyme Test-Zahlung in 42ms ausführen
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeL3Btn')?.addEventListener('click', closeLayer3RollupModal);

  document.getElementById('testL3PaymentBtn')?.addEventListener('click', () => {
    playSound('success');
    triggerHaptic('heavy');
    showToast(`⚡ Layer-3 zk-STARK Checkout in ${l3.settlementLatencyMs}ms bestätigt! Absolut anonym & 0€ Gebühren.`, 'success');
    closeLayer3RollupModal();
  });
}
