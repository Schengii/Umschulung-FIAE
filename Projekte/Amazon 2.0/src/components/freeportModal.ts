// ============================================================
// Amazon 2.0 – Autonomous Freeport Customs Vault Modal
// ============================================================
import { getFreeportVaultStatus } from '../utils/freeportVault';
import { formatPrice } from '../utils/formatters';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let freeportModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!freeportModalEl) {
    freeportModalEl = document.createElement('div');
    freeportModalEl.id = 'freeportModal';
    freeportModalEl.className = 'modal-overlay';
    freeportModalEl.setAttribute('role', 'dialog');
    freeportModalEl.setAttribute('aria-modal', 'true');
    freeportModalEl.setAttribute('aria-label', 'Zollfreilager Freeport');
    document.body.appendChild(freeportModalEl);
  }
  return freeportModalEl;
}

export function openFreeportModal(): void {
  const modal = getModal();
  renderFreeportUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeFreeportModal(): void {
  if (freeportModalEl) {
    freeportModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderFreeportUI(modal: HTMLElement): void {
  const status = getFreeportVaultStatus();

  modal.innerHTML = `
    <div class="modal-dialog fp-dialog">
      <button class="modal-close" id="closeFPBtn" aria-label="Schließen">✕</button>

      <div class="fp-header">
        <div class="fp-badge">🤖 AUTONOMOUS FREEPORT CUSTOMS VAULT</div>
        <h2>Zollfreie Hochsicherheits-Verwahrung</h2>
        <p class="fp-sub">Steuer- und zollfreie Einlagerung von Luxusgütern, Kunst und Edelmetallen im Schweizer Zollfreilager.</p>
      </div>

      <!-- Vault Banner -->
      <div class="fp-vault-banner">
        <div class="fp-vault-icon">🏦</div>
        <div class="fp-meta">
          <h4>Standort: <strong>${status.vaultLocation}</strong></h4>
          <p>Sicherheit: <strong>${status.securityRating}</strong> • Versicherung: <strong>${formatPrice(status.insuranceCoverageEur)}</strong></p>
        </div>
        <div class="fp-tag">-${status.vatTaxSavedPercent}% MWST.-VORTEIL</div>
      </div>

      <!-- Climate & Vault Stats -->
      <div class="fp-telemetry-grid">
        <div class="fp-box">
          <span class="fp-lbl">Klima-Regelung:</span>
          <strong>${status.temperatureCelsius}°C / ${status.humidityControlPercent}% Feuchte</strong>
        </div>
        <div class="fp-box">
          <span class="fp-lbl">On-Chain Nachweis:</span>
          <code>${status.vaultCertificateHash}</code>
        </div>
        <div class="fp-box">
          <span class="fp-lbl">Steuerstatus:</span>
          <strong style="color: #10b981;">100% MwSt.-befreit bis Ausfuhr</strong>
        </div>
      </div>

      <!-- Action -->
      <div class="fp-actions-row">
        <button class="btn-primary" id="depositInFreeportBtn">
          🔒 Artikel zollfrei im Schweizer Freeport einlagern (-${status.vatTaxSavedPercent}%)
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeFPBtn')?.addEventListener('click', closeFreeportModal);

  document.getElementById('depositInFreeportBtn')?.addEventListener('click', () => {
    playSound('success');
    triggerHaptic('heavy');
    showToast(`🏦 Artikel im ${status.vaultLocation} zollfrei eingelagert! On-Chain Zertifikat hinterlegt.`, 'success');
    closeFreeportModal();
  });
}
