// ============================================================
// Amazon 2.0 – DeFi Cashback & Smart-Contract Escrow Hub
// ============================================================
import type { AppState } from '../types';
import { formatPrice } from '../utils/formatters';
import { showToast } from './toast';
import { saveBalance, emit } from '../store';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

let defiModal: HTMLElement | null = null;

export const AMZ_TOKEN_RATE_EUR = 1.25;

export interface DeFiVaultState {
  tokenBalance: number;
  stakedBalance: number;
  escrowLockedEur: number;
  stakingApy: number;
}

let vaultState: DeFiVaultState = {
  tokenBalance: 42.5,
  stakedBalance: 120.0,
  escrowLockedEur: 0,
  stakingApy: 7.5,
};

export function calculateCashbackTokens(orderTotalEur: number): number {
  const cashbackEur = orderTotalEur * 0.025; // 2.5% cashback
  return Math.round((cashbackEur / AMZ_TOKEN_RATE_EUR) * 100) / 100;
}

export function openDeFiCashbackModal(state: AppState): void {
  if (!defiModal) {
    defiModal = document.createElement('div');
    defiModal.id = 'defiCashbackModal';
    defiModal.className = 'modal-overlay';
    document.body.appendChild(defiModal);
  }

  // Calculate escrow locked from processing orders
  const pendingOrders = state.orders.filter(o => o.status === 'processing' || o.status === 'shipped');
  vaultState.escrowLockedEur = pendingOrders.reduce((s, o) => s + o.total, 0);

  renderDeFiView(state);
}

function renderDeFiView(state: AppState): void {
  if (!defiModal) return;

  defiModal.innerHTML = `
    <div class="modal-dialog defi-dialog">
      <button class="modal-close" id="closeDeFiModal">✕</button>
      <div class="defi-header">
        <span class="defi-badge">⚡ Web3 Smart-Contract Vault</span>
        <h2>DeFi Cashback & Staking Hub</h2>
        <p class="subtitle">Verdiene 2.5% AMZ-Token Cashback bei jedem Einkauf & sichere deine Zahlungen per Smart-Contract Escrow ab!</p>
      </div>

      <!-- Token Balances Grid -->
      <div class="defi-metrics-grid">
        <div class="defi-metric-card">
          <span class="metric-label">Verfügbare AMZ Tokens</span>
          <strong class="metric-value">${vaultState.tokenBalance.toFixed(2)} AMZ</strong>
          <span class="metric-sub">≈ ${formatPrice(vaultState.tokenBalance * AMZ_TOKEN_RATE_EUR)}</span>
        </div>

        <div class="defi-metric-card highlight">
          <span class="metric-label">Gestakte Tokens (${vaultState.stakingApy}% APY)</span>
          <strong class="metric-value">${vaultState.stakedBalance.toFixed(2)} AMZ</strong>
          <span class="metric-sub">≈ +${((vaultState.stakedBalance * vaultState.stakingApy) / 100).toFixed(2)} AMZ/Jahr</span>
        </div>

        <div class="defi-metric-card">
          <span class="metric-label">Smart-Contract Escrow Schutz</span>
          <strong class="metric-value">${formatPrice(vaultState.escrowLockedEur)}</strong>
          <span class="metric-sub">Gesichert bis Zustellung</span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="defi-actions-box">
        <h4>Token-Aktionen</h4>
        <div class="defi-action-buttons">
          <button class="btn-primary" id="stakeTokensBtn" ${vaultState.tokenBalance <= 0 ? 'disabled' : ''}>
            🔒 Alle ${vaultState.tokenBalance.toFixed(1)} AMZ staken (${vaultState.stakingApy}% APY)
          </button>
          <button class="btn-secondary" id="convertTokensBtn" ${vaultState.tokenBalance <= 0 ? 'disabled' : ''}>
            💶 In ${formatPrice(vaultState.tokenBalance * AMZ_TOKEN_RATE_EUR)} Amazon Guthaben umwandeln
          </button>
        </div>
      </div>
    </div>
  `;

  defiModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  const closeModal = () => {
    defiModal?.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.getElementById('closeDeFiModal')?.addEventListener('click', closeModal);
  defiModal.addEventListener('click', e => { if (e.target === defiModal) closeModal(); });

  // Staking
  document.getElementById('stakeTokensBtn')?.addEventListener('click', () => {
    if (vaultState.tokenBalance > 0) {
      vaultState.stakedBalance += vaultState.tokenBalance;
      const staked = vaultState.tokenBalance;
      vaultState.tokenBalance = 0;
      playSound('quest');
      triggerHaptic('success');
      showToast(`🔒 ${staked.toFixed(2)} AMZ erfolgreich im Staking-Vault hinterlegt (${vaultState.stakingApy}% APY)!`, 'success');
      renderDeFiView(state);
    }
  });

  // Convert to Amazon Balance
  document.getElementById('convertTokensBtn')?.addEventListener('click', () => {
    if (vaultState.tokenBalance > 0) {
      const eurValue = vaultState.tokenBalance * AMZ_TOKEN_RATE_EUR;
      state.userBalance.amount += eurValue;
      vaultState.tokenBalance = 0;
      saveBalance();
      emit('balance:changed');
      playSound('checkout');
      triggerHaptic('success');
      showToast(`🎉 +${formatPrice(eurValue)} Guthaben aus AMZ-Tokens gutgeschrieben!`, 'success');
      renderDeFiView(state);
    }
  });
}
