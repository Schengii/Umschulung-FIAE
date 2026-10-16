// ============================================================
// Amazon 2.0 – Self-Healing Web3 Warranty Modal
// ============================================================
import { executeSelfHealingWarrantyClaim } from '../utils/selfHealingWarranty';
import { formatPrice } from '../utils/formatters';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let healModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!healModalEl) {
    healModalEl = document.createElement('div');
    healModalEl.id = 'selfHealingWarrantyModal';
    healModalEl.className = 'modal-overlay';
    healModalEl.setAttribute('role', 'dialog');
    healModalEl.setAttribute('aria-modal', 'true');
    healModalEl.setAttribute('aria-label', 'Self-Healing Web3 Garantie');
    document.body.appendChild(healModalEl);
  }
  return healModalEl;
}

export function openSelfHealingWarrantyModal(orderId: string = 'ORD-2026-9912', amountEur: number = 149.99): void {
  const modal = getModal();
  renderHealUI(modal, orderId, amountEur);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeSelfHealingWarrantyModal(): void {
  if (healModalEl) {
    healModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderHealUI(modal: HTMLElement, orderId: string, amountEur: number): void {
  const result = executeSelfHealingWarrantyClaim(orderId, amountEur);

  modal.innerHTML = `
    <div class="modal-dialog heal-dialog">
      <button class="modal-close" id="closeHealBtn" aria-label="Schließen">✕</button>

      <div class="heal-header">
        <div class="heal-badge">🤖 SELF-HEALING WEB3 SMART WARRANTY</div>
        <h2>Autonome Garantie- & Schadensregulierung</h2>
        <p class="heal-sub">Dezentrales IoT-Orakel erstattet Ansprüche vollautomatisch in Sekundenbruchteilen ohne manuelle Support-Prüfung.</p>
      </div>

      <!-- Oracle Status Banner -->
      <div class="heal-oracle-banner">
        <div class="heal-icon">⚡</div>
        <div class="heal-meta">
          <h4>Orakel-Status: <strong>SCHADENSFALL VERIFIZIERT</strong></h4>
          <p>Quelle: ${result.oracleValidationSource} • Ausführungszeit: <strong>${result.executionSeconds}s</strong></p>
        </div>
        <div class="heal-tag">✓ SOFORT-ERSTATTUNG</div>
      </div>

      <!-- Transaction Info Box -->
      <div class="heal-tx-card">
        <div class="tx-row">
          <span>Smart Contract:</span>
          <code>${result.contractAddress}</code>
        </div>
        <div class="tx-row">
          <span>Transaktions-Hash (On-Chain):</span>
          <code>${result.transactionHashHex}</code>
        </div>
        <div class="tx-row">
          <span>Erstattungsbetrag:</span>
          <strong class="heal-amount">${formatPrice(result.refundAmountEur)}</strong>
        </div>
      </div>

      <!-- Action -->
      <div class="heal-actions-row">
        <button class="btn-primary" id="confirmHealPayoutBtn">
          💰 Erstattungs-Gutschrift über ${formatPrice(result.refundAmountEur)} bestätigen
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeHealBtn')?.addEventListener('click', closeSelfHealingWarrantyModal);

  document.getElementById('confirmHealPayoutBtn')?.addEventListener('click', () => {
    playSound('success');
    triggerHaptic('heavy');
    showToast(`💰 ${formatPrice(result.refundAmountEur)} Sofort-Gutschrift erfolgreich via Self-Healing Smart Contract gebucht!`, 'success');
    closeSelfHealingWarrantyModal();
  });
}
