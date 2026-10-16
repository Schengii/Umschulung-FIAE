// ============================================================
// Amazon 2.0 – Merchant DeFi Staking & Liquidity Modal
// ============================================================
import { getMerchantLiquidityTelemetry } from '../utils/merchantLiquidityPool';
import { formatPrice } from '../utils/formatters';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let mlModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!mlModalEl) {
    mlModalEl = document.createElement('div');
    mlModalEl.id = 'merchantLiquidityModal';
    mlModalEl.className = 'modal-overlay';
    mlModalEl.setAttribute('role', 'dialog');
    mlModalEl.setAttribute('aria-modal', 'true');
    mlModalEl.setAttribute('aria-label', 'Händler Liquiditäts-Pool & Staking');
    document.body.appendChild(mlModalEl);
  }
  return mlModalEl;
}

export function openMerchantLiquidityModal(): void {
  const modal = getModal();
  renderMLUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeMerchantLiquidityModal(): void {
  if (mlModalEl) {
    mlModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderMLUI(modal: HTMLElement): void {
  const ml = getMerchantLiquidityTelemetry();

  modal.innerHTML = `
    <div class="modal-dialog ml-dialog">
      <button class="modal-close" id="closeMLBtn" aria-label="Schließen">✕</button>

      <div class="ml-header">
        <div class="ml-badge">⚡ MERCHANT DeFi STAKING & LIQUIDITY MATRIX</div>
        <h2>P2P Händlerkredite & Staking-Zinsen</h2>
        <p class="ml-sub">Stelle Liquidität für geprüfte Marktplatz-Verkäufer bereit und erhalte tägliche Krypto-Zinsausschüttungen.</p>
      </div>

      <!-- APY Banner -->
      <div class="ml-apy-banner">
        <div class="ml-apy-ring">
          <span class="apy-num">${ml.stakingYieldApyPercent}%</span>
          <span class="apy-lbl">APY Zins</span>
        </div>
        <div class="ml-meta">
          <h4>Pool-Volumen: <strong>${formatPrice(ml.totalLiquidityPoolEur)}</strong></h4>
          <p>Besicherung: <strong>${ml.overCollateralizationRatioPercent}%</strong> • Kreditausfall-Quote: <strong>${ml.defaultRatePercent}%</strong></p>
        </div>
        <div class="ml-tag">✓ SAFETY MODULE</div>
      </div>

      <!-- Metrics Grid -->
      <div class="ml-telemetry-grid">
        <div class="ml-box">
          <span class="ml-lbl">Finanzierte Händler:</span>
          <strong style="color: #10b981;">${ml.fundedMerchantLoansCount} Shops</strong>
        </div>
        <div class="ml-box">
          <span class="ml-lbl">Smart Contract:</span>
          <code>${ml.smartContractVaultAddress}</code>
        </div>
        <div class="ml-box">
          <span class="ml-lbl">Zinsausschüttung:</span>
          <strong style="color: #38bdf8;">Sekundengenau</strong>
        </div>
      </div>

      <!-- Action -->
      <div class="ml-actions-row">
        <button class="btn-primary" id="stakeLiquidityBtn">
          💰 500 € in den Händler-Pool staken (8,5% Zinsen p.a.)
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeMLBtn')?.addEventListener('click', closeMerchantLiquidityModal);

  document.getElementById('stakeLiquidityBtn')?.addEventListener('click', () => {
    playSound('success');
    triggerHaptic('heavy');
    showToast('💰 500 € erfolgreich gestakt! Tägliche Zinsgutschrift (8,5% APY) aktiviert.', 'success');
    closeMerchantLiquidityModal();
  });
}
