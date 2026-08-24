// ============================================================
// Amazon 2.0 – Web3 & Crypto Payment Gateway Simulator
// ============================================================
import { formatPrice } from '../utils/formatters';
import { showToast } from './toast';

let cryptoModal: HTMLElement | null = null;

export type CryptoCoin = 'BTC' | 'ETH' | 'SOL' | 'USDC';

export interface CryptoConfig {
  name: string;
  symbol: CryptoCoin;
  icon: string;
  rateToEur: number; // 1 EUR = X Crypto
  address: string;
}

export const CRYPTO_COINS: Record<CryptoCoin, CryptoConfig> = {
  BTC: {
    name: 'Bitcoin',
    symbol: 'BTC',
    icon: '₿',
    rateToEur: 0.000018,
    address: 'bc1q9x3k8z4p7m2n5v6w8y1t3r5e7w9q0z2a4b6c8d',
  },
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    icon: 'Ξ',
    rateToEur: 0.00034,
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
  },
  SOL: {
    name: 'Solana',
    symbol: 'SOL',
    icon: '◎',
    rateToEur: 0.0068,
    address: 'Sol9x3k8z4p7m2n5v6w8y1t3r5e7w9q0z2a4b6c8d',
  },
  USDC: {
    name: 'USD Coin',
    symbol: 'USDC',
    icon: '🪙',
    rateToEur: 1.08,
    address: '0x38bdf86EC7ab88b098defB751B7401B5f6d8976F',
  },
};

export function openCryptoPaymentModal(amountEur: number, onSuccess: () => void): void {
  if (!cryptoModal) {
    cryptoModal = document.createElement('div');
    cryptoModal.id = 'cryptoPaymentModal';
    cryptoModal.className = 'modal-overlay';
    document.body.appendChild(cryptoModal);
  }

  let selectedCoin: CryptoCoin = 'BTC';

  const renderContent = () => {
    const coin = CRYPTO_COINS[selectedCoin];
    const cryptoAmount = (amountEur * coin.rateToEur).toFixed(6);

    cryptoModal!.innerHTML = `
      <div class="modal-dialog crypto-dialog">
        <button class="modal-close" id="closeCryptoModal">✕</button>
        <div class="crypto-header">
          <h2>⚡ Web3 & Krypto Checkout</h2>
          <span class="web3-badge">🔒 Dezentral & Verschlüsselt</span>
        </div>

        <p class="subtitle">Wähle eine Kryptowährung zur Bezahlung von <strong>${formatPrice(amountEur)}</strong>:</p>

        <div class="crypto-coin-selector">
          ${Object.values(CRYPTO_COINS).map(c => `
            <button class="coin-tab ${c.symbol === selectedCoin ? 'active' : ''}" data-symbol="${c.symbol}">
              <span class="coin-icon">${c.icon}</span>
              <span>${c.name}</span>
            </button>
          `).join('')}
        </div>

        <div class="crypto-payment-card">
          <div class="crypto-amount-display">
            <span class="crypto-val">${cryptoAmount} ${coin.symbol}</span>
            <small>≈ ${formatPrice(amountEur)} EUR (Geschätzte Netzwerkgebühr: ~$0.45)</small>
          </div>

          <div class="qr-code-box">
            <div class="qr-placeholder">
              <span class="qr-icon">📱</span>
              <span>QR-Code Scannen</span>
            </div>
          </div>

          <div class="wallet-address-group">
            <label>Einzahlungsadresse (${coin.name}):</label>
            <div class="address-input-wrapper">
              <input type="text" id="walletAddressInput" value="${coin.address}" readonly />
              <button class="btn-secondary sm" id="copyWalletBtn">📋 Kopieren</button>
            </div>
          </div>
        </div>

        <div class="crypto-actions">
          <button class="btn-primary full-width" id="confirmCryptoPayBtn">
            🦊 MetaMask / Web3 Wallet verbinden & Zahlen
          </button>
        </div>
      </div>
    `;

    // Wire close
    document.getElementById('closeCryptoModal')?.addEventListener('click', closeModal);
    
    // Wire coin tabs
    cryptoModal!.querySelectorAll('.coin-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        selectedCoin = tab.getAttribute('data-symbol') as CryptoCoin;
        renderContent();
      });
    });

    // Wire copy
    document.getElementById('copyWalletBtn')?.addEventListener('click', () => {
      const input = document.getElementById('walletAddressInput') as HTMLInputElement;
      if (input) {
        navigator.clipboard?.writeText(input.value);
        showToast('📋 Krypto-Adresse kopiert!', 'success');
      }
    });

    // Confirm payment
    document.getElementById('confirmCryptoPayBtn')?.addEventListener('click', () => {
      showToast(`⚡ Web3 Transaktion gesendet: ${cryptoAmount} ${coin.symbol} (Block #1982031)`, 'info');
      setTimeout(() => {
        closeModal();
        showToast('✓ Blockchain-Bestätigung erhalten! Zahlung erfolgreich!', 'success');
        onSuccess();
      }, 1200);
    });
  };

  const closeModal = () => cryptoModal?.classList.remove('open');
  renderContent();
  cryptoModal.classList.add('open');
}
