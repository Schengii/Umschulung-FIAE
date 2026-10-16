// ============================================================
// Amazon 2.0 – Smart DEX Currency Hedging & Auto-Swap Hub
// ============================================================
import type { AppState } from '../types';
import { formatPrice } from '../utils/formatters';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

export type CryptoToken = 'USDC' | 'USDT' | 'ETH' | 'BTC' | 'SOL' | 'AMZ';

interface TokenRate {
  symbol: CryptoToken;
  name: string;
  rateEur: number;
  icon: string;
  network: string;
}

const TOKEN_RATES: Record<CryptoToken, TokenRate> = {
  USDC: { symbol: 'USDC', name: 'USD Coin', rateEur: 0.92, icon: '💵', network: 'Polygon / Arbitrum' },
  USDT: { symbol: 'USDT', name: 'Tether USD', rateEur: 0.92, icon: '💲', network: 'Ethereum / Solana' },
  ETH: { symbol: 'ETH', name: 'Ethereum', rateEur: 3250.0, icon: '⟠', network: 'Ethereum Mainnet' },
  BTC: { symbol: 'BTC', name: 'Bitcoin', rateEur: 58900.0, icon: '₿', network: 'Bitcoin Network' },
  SOL: { symbol: 'SOL', name: 'Solana', rateEur: 145.5, icon: '☀️', network: 'Solana High-Speed' },
  AMZ: { symbol: 'AMZ', name: 'Amazon Web3 Token', rateEur: 2.50, icon: '⚡', network: 'Amazon Layer 2' },
};

let fromToken: CryptoToken = 'USDC';
let toToken: CryptoToken = 'ETH';
let fromAmount = 500;
let slippageTolerance = 0.5; // 0.5%
let isHedgeActive = false;
let hedgeExpiryTimestamp = Date.now() + 30 * 60 * 1000;
let swapModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!swapModalEl) {
    swapModalEl = document.createElement('div');
    swapModalEl.id = 'cryptoSwapModal';
    swapModalEl.className = 'modal-overlay';
    swapModalEl.setAttribute('role', 'dialog');
    swapModalEl.setAttribute('aria-modal', 'true');
    swapModalEl.setAttribute('aria-label', 'DEX Krypto Auto-Swap & Hedging');
    document.body.appendChild(swapModalEl);
  }
  return swapModalEl;
}

export function openCryptoSwapModal(state: AppState): void {
  const modal = getModal();
  renderSwapUI(state);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeCryptoSwapModal(): void {
  if (swapModalEl) {
    swapModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

export function calculateSwapOutput(amount: number, from: CryptoToken, to: CryptoToken, slippage: number) {
  const fromRate = TOKEN_RATES[from].rateEur;
  const toRate = TOKEN_RATES[to].rateEur;
  const eurValue = amount * fromRate;
  const rawOutput = eurValue / toRate;
  const minOutput = rawOutput * (1 - slippage / 100);
  const gasEur = from === 'SOL' || from === 'AMZ' ? 0.05 : 0.45;
  const priceImpact = amount > 5000 ? 0.15 : 0.02;

  return { eurValue, rawOutput, minOutput, gasEur, priceImpact };
}

function renderSwapUI(state: AppState): void {
  const modal = getModal();
  const res = calculateSwapOutput(fromAmount, fromToken, toToken, slippageTolerance);
  const minutesLeft = Math.max(1, Math.round((hedgeExpiryTimestamp - Date.now()) / 60000));

  modal.innerHTML = `
    <div class="modal-dialog crypto-swap-dialog">
      <button class="modal-close" id="closeSwapBtn" aria-label="Schließen">✕</button>

      <div class="swap-header">
        <div class="swap-shield-badge">🛡️ VOLATILITY HEDGING & DEX AUTO-SWAP</div>
        <h2>Smart DEX Krypto-Tausch & Kurs-Garantie</h2>
        <p class="swap-sub">Tausche Stablecoins und Krypto zum besten Kurs mit automatischem 30-Minuten Kursabsicherungs-Schutz.</p>
      </div>

      <!-- Hedging Protection Banner -->
      <div class="hedge-banner ${isHedgeActive ? 'active' : ''}">
        <div class="hedge-icon">⏱️</div>
        <div class="hedge-text">
          <strong>30-Minuten Kursgarantie (Zero-Slippage Lock)</strong>
          <p>${isHedgeActive ? `🔒 Kurs aktiv gesichert für die nächsten ${minutesLeft} Minuten!` : 'Sichere den aktuellen Wechselkurs für deinen nächsten Einkauf ab.'}</p>
        </div>
        <button class="btn-secondary-sm ${isHedgeActive ? 'btn-hedge-active' : ''}" id="toggleHedgeBtn">
          ${isHedgeActive ? 'Gesperrt ✓' : '🛡️ Kurs sichern'}
        </button>
      </div>

      <!-- Swap Interface Box -->
      <div class="swap-box">
        <!-- From Token Section -->
        <div class="swap-token-card">
          <div class="swap-row-label">
            <span>Du zahlst:</span>
            <span class="swap-balance-hint">Verfügbar: 2,450.00 ${fromToken}</span>
          </div>
          <div class="swap-input-row">
            <input type="number" id="fromAmountInput" class="swap-amount-input" value="${fromAmount}" min="1" step="any" />
            <select id="fromTokenSelect" class="swap-token-select">
              ${Object.keys(TOKEN_RATES).map(k => `<option value="${k}" ${fromToken === k ? 'selected' : ''}>${TOKEN_RATES[k as CryptoToken].icon} ${k}</option>`).join('')}
            </select>
          </div>
          <div class="swap-fiat-sub">≈ ${formatPrice(res.eurValue)}</div>
        </div>

        <!-- Invert Swap Button -->
        <div class="swap-invert-row">
          <button class="btn-swap-invert" id="invertTokensBtn" aria-label="Token tauschen">⇅</button>
        </div>

        <!-- To Token Section -->
        <div class="swap-token-card">
          <div class="swap-row-label">
            <span>Du erhältst (geschätzt):</span>
            <span class="swap-network-tag">${TOKEN_RATES[toToken].network}</span>
          </div>
          <div class="swap-input-row">
            <input type="text" class="swap-amount-input" value="${res.rawOutput.toFixed(6)}" readonly />
            <select id="toTokenSelect" class="swap-token-select">
              ${Object.keys(TOKEN_RATES).map(k => `<option value="${k}" ${toToken === k ? 'selected' : ''}>${TOKEN_RATES[k as CryptoToken].icon} ${k}</option>`).join('')}
            </select>
          </div>
          <div class="swap-fiat-sub">≈ ${formatPrice(res.eurValue)}</div>
        </div>

        <!-- Slippage & Telemetry Options -->
        <div class="swap-telemetry-panel">
          <div class="telemetry-row">
            <span>Max. Slippage Toleranz:</span>
            <div class="slippage-chips">
              <button class="chip ${slippageTolerance === 0.1 ? 'active' : ''}" data-slip="0.1">0.1%</button>
              <button class="chip ${slippageTolerance === 0.5 ? 'active' : ''}" data-slip="0.5">0.5%</button>
              <button class="chip ${slippageTolerance === 1.0 ? 'active' : ''}" data-slip="1.0">1.0%</button>
            </div>
          </div>
          <div class="telemetry-row">
            <span>Mindestempfang (Garantiert):</span>
            <strong>${res.minOutput.toFixed(6)} ${toToken}</strong>
          </div>
          <div class="telemetry-row">
            <span>Geschätzte Netzwerkgebühr:</span>
            <span>⛽ ~${formatPrice(res.gasEur)} (2.1 Gwei)</span>
          </div>
          <div class="telemetry-row">
            <span>DEX Routing & Liquidity Pool:</span>
            <span class="dex-route-badge">🦄 Uniswap v3 / Raydium Deep Liquidity</span>
          </div>
        </div>

        <!-- Action Button -->
        <button class="btn-primary swap-execute-btn" id="executeSwapBtn">
          ⚡ ${fromAmount} ${fromToken} jetzt in ${toToken} tauschen
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeSwapBtn')?.addEventListener('click', closeCryptoSwapModal);

  // Amount input
  document.getElementById('fromAmountInput')?.addEventListener('input', (e) => {
    fromAmount = parseFloat((e.target as HTMLInputElement).value) || 0;
    renderSwapUI(state);
  });

  // Token Selects
  document.getElementById('fromTokenSelect')?.addEventListener('change', (e) => {
    fromToken = (e.target as HTMLSelectElement).value as CryptoToken;
    playSound('click');
    renderSwapUI(state);
  });

  document.getElementById('toTokenSelect')?.addEventListener('change', (e) => {
    toToken = (e.target as HTMLSelectElement).value as CryptoToken;
    playSound('click');
    renderSwapUI(state);
  });

  // Invert Button
  document.getElementById('invertTokensBtn')?.addEventListener('click', () => {
    const temp = fromToken;
    fromToken = toToken;
    toToken = temp;
    playSound('click');
    triggerHaptic('light');
    renderSwapUI(state);
  });

  // Slippage Chips
  modal.querySelectorAll('.slippage-chips .chip').forEach(btn => {
    btn.addEventListener('click', () => {
      slippageTolerance = parseFloat(btn.getAttribute('data-slip') || '0.5');
      playSound('click');
      renderSwapUI(state);
    });
  });

  // Toggle Hedge Rate Lock
  document.getElementById('toggleHedgeBtn')?.addEventListener('click', () => {
    isHedgeActive = !isHedgeActive;
    hedgeExpiryTimestamp = Date.now() + 30 * 60 * 1000;
    playSound('quest');
    triggerHaptic('medium');
    showToast(isHedgeActive ? '🛡️ 30-Minuten Kursabsicherung aktiviert!' : 'Kursabsicherung deaktiviert.', 'info');
    renderSwapUI(state);
  });

  // Execute Swap
  document.getElementById('executeSwapBtn')?.addEventListener('click', () => {
    playSound('checkout');
    triggerHaptic('heavy');
    showToast(`🎉 Tausch von ${fromAmount} ${fromToken} in ${res.rawOutput.toFixed(4)} ${toToken} erfolgreich ausgeführt!`, 'success');
    closeCryptoSwapModal();
  });
}
