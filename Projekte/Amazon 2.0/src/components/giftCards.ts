// ============================================================
// Amazon 2.0 – Gift Cards / Balance Modal Component
// ============================================================
import type { AppState } from '../types';
import { formatPrice, generateId } from '../utils/formatters';
import { writeStorage, KEYS } from '../utils/persist';
import { showToast } from './toast';
import { GIFT_CARD_CODES } from '../data/heroSlides';

type RefreshCallback = () => void;

let giftCardModal: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!giftCardModal) {
    giftCardModal = document.createElement('div');
    giftCardModal.id = 'giftCardModal';
    giftCardModal.className = 'modal-overlay';
    giftCardModal.setAttribute('role', 'dialog');
    giftCardModal.setAttribute('aria-modal', 'true');
    giftCardModal.setAttribute('aria-label', 'Guthabenkonto');
    document.body.appendChild(giftCardModal);
    giftCardModal.addEventListener('click', e => {
      if (e.target === giftCardModal) closeGiftCardModal();
    });
  }
  return giftCardModal;
}

export function getStoredBalance(): import('../types').UserBalance {
  try {
    const raw = localStorage.getItem(KEYS.balance);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { amount: 0, currency: 'EUR', transactions: [] };
}

export function openGiftCardModal(state: AppState, onRefresh: RefreshCallback): void {
  const modal = getModal();

  modal.innerHTML = `
    <div class="modal-dialog gift-card-dialog">
      <button class="modal-close" id="giftClose" aria-label="Schließen">✕</button>
      <h2 class="modal-heading">🎁 Guthabenkonto</h2>

      <!-- Balance Display -->
      <div class="gift-balance-card">
        <div class="balance-amount">${formatPrice(state.userBalance.amount)}</div>
        <p class="balance-label">Verfügbares Guthaben</p>
        <p class="balance-note">Wird automatisch bei deiner nächsten Bestellung verrechnet.</p>
      </div>

      <!-- Redeem Section -->
      <div class="gift-redeem-section">
        <h3>Geschenkkarte einlösen</h3>
        <div class="gift-input-row">
          <input 
            type="text" 
            id="giftCodeInput" 
            class="form-input"
            placeholder="z.B. GIFT-2024-XMAS"
            autocomplete="off"
          />
          <button class="btn-primary" id="redeemGiftBtn">Einlösen</button>
        </div>
        <details class="coupon-codes-ref">
          <summary>💡 Testcodes</summary>
          <ul class="coupon-code-list">
            ${Object.entries(GIFT_CARD_CODES).map(([code, amount]) =>
              `<li><code>${code}</code> – ${formatPrice(amount)}</li>`
            ).join('')}
          </ul>
        </details>
      </div>

      <!-- Transaction History -->
      ${state.userBalance.transactions.length > 0 ? `
        <div class="gift-history">
          <h3>Transaktionsverlauf</h3>
          <div class="transaction-list">
            ${state.userBalance.transactions.slice(0, 10).map(tx => `
              <div class="transaction-item">
                <span class="tx-icon">${tx.type === 'credit' ? '💚' : '🔴'}</span>
                <div class="tx-details">
                  <span class="tx-desc">${tx.description}</span>
                  <span class="tx-date">${new Date(tx.date).toLocaleDateString('de-DE')}</span>
                </div>
                <span class="tx-amount ${tx.type === 'credit' ? 'tx-credit' : 'tx-debit'}">
                  ${tx.type === 'credit' ? '+' : '-'}${formatPrice(tx.amount)}
                </span>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById('giftClose')?.addEventListener('click', closeGiftCardModal);

  const codeInput = document.getElementById('giftCodeInput') as HTMLInputElement;

  function redeemCode() {
    const code = codeInput.value.trim().toUpperCase();
    if (!code) return;

    if (state.redeemedGiftCodes.includes(code)) {
      showToast('Dieser Code wurde bereits eingelöst.', 'warning');
      return;
    }

    const amount = GIFT_CARD_CODES[code];
    if (!amount) {
      showToast(`Code "${code}" ist ungültig oder abgelaufen.`, 'error');
      return;
    }

    state.userBalance.amount += amount;
    state.redeemedGiftCodes.push(code);
    state.userBalance.transactions.unshift({
      id: generateId(),
      type: 'credit',
      amount,
      description: `Geschenkkarte eingelöst (${code})`,
      date: Date.now(),
    });

    writeStorage(KEYS.balance, state.userBalance);
    writeStorage(KEYS.redeemedGiftCodes, state.redeemedGiftCodes);
    onRefresh();

    showToast(`🎉 ${formatPrice(amount)} Guthaben gutgeschrieben!`, 'success');
    openGiftCardModal(state, onRefresh); // Re-render
  }

  document.getElementById('redeemGiftBtn')?.addEventListener('click', redeemCode);
  codeInput.addEventListener('keydown', e => { if (e.key === 'Enter') redeemCode(); });

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { closeGiftCardModal(); document.removeEventListener('keydown', onKeydown); }
  };
  document.addEventListener('keydown', onKeydown);
}

export function updateGiftBalanceHeaderDisplay(state: AppState): void {
  const el = document.getElementById('balanceDisplay');
  if (el) el.textContent = `🎁 ${state.userBalance.amount.toFixed(2).replace('.', ',')}€`;
}

function closeGiftCardModal(): void {
  giftCardModal?.classList.remove('open');
  document.body.style.overflow = '';
}
