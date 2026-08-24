// ============================================================
// Amazon 2.0 – Coupons Modal Component
// ============================================================
import type { AppState, Coupon } from '../types';
import { formatDate } from '../utils/formatters';
import { writeStorage, KEYS } from '../utils/persist';
import { showToast } from './toast';

type RefreshCallback = () => void;

let couponsModal: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!couponsModal) {
    couponsModal = document.createElement('div');
    couponsModal.id = 'couponsModal';
    couponsModal.className = 'modal-overlay';
    couponsModal.setAttribute('role', 'dialog');
    couponsModal.setAttribute('aria-modal', 'true');
    couponsModal.setAttribute('aria-label', 'Gutscheine');
    document.body.appendChild(couponsModal);
    couponsModal.addEventListener('click', e => {
      if (e.target === couponsModal) closeCouponsModal();
    });
  }
  return couponsModal;
}

export function initCoupons(_state: AppState): void {
  // Any init logic if needed
}

export function openCouponsModal(state: AppState, onRefresh: RefreshCallback): void {
  const modal = getModal();

  modal.innerHTML = `
    <div class="modal-dialog coupons-dialog">
      <button class="modal-close" id="couponsClose" aria-label="Schließen">✕</button>
      <h2 class="modal-heading">🎟 Meine Gutscheine</h2>

      <!-- Coupon input -->
      <div class="coupon-input-section">
        <label for="couponCodeInput" class="coupon-input-label">Gutscheincode einlösen</label>
        <div class="coupon-input-row">
          <input 
            type="text" 
            id="couponCodeInput" 
            class="form-input coupon-code-input" 
            placeholder="z.B. SOMMER25"
            autocomplete="off"
          />
          <button class="btn-primary" id="redeemCouponBtn">Einlösen</button>
        </div>
        <p class="coupon-hint">Hinweis: Gutscheine sind bei deiner nächsten Bestellung gültig.</p>
      </div>

      <!-- Available Coupons -->
      <h3 class="section-subtitle">Verfügbare Gutscheine</h3>
      <div class="coupons-list">
        ${state.activeCoupons.length > 0
          ? state.activeCoupons.map(c => renderCoupon(c)).join('')
          : '<p class="no-content">Keine Gutscheine verfügbar.</p>'
        }
      </div>

      <!-- All known codes reference -->
      <details class="coupon-codes-ref">
        <summary>💡 Testcodes</summary>
        <ul class="coupon-code-list">
          <li><code>SOMMER25</code> – 25% auf alle Bestellungen über 50€</li>
          <li><code>PRIME10</code> – 10€ Rabatt für Prime-Mitglieder</li>
          <li><code>TECH15</code> – 15% auf Elektronik über 100€</li>
          <li><code>NEUKUNDE</code> – 5€ Willkommensrabatt</li>
        </ul>
      </details>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById('couponsClose')?.addEventListener('click', closeCouponsModal);

  const couponInput = document.getElementById('couponCodeInput') as HTMLInputElement;

  document.getElementById('redeemCouponBtn')?.addEventListener('click', () => {
    const code = couponInput.value.trim().toUpperCase();
    redeemCoupon(state, code, onRefresh);
    couponInput.value = '';
    openCouponsModal(state, onRefresh); // Re-render
  });

  couponInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const code = couponInput.value.trim().toUpperCase();
      redeemCoupon(state, code, onRefresh);
      couponInput.value = '';
      openCouponsModal(state, onRefresh);
    }
  });

  // Toggle active coupons
  modal.querySelectorAll('.coupon-toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.getAttribute('data-coupon-code')!;
      const coupon = state.activeCoupons.find(c => c.code === code);
      if (coupon) {
        // Deactivate all others first (only 1 active at a time)
        state.activeCoupons.forEach(c => { c.isActive = c.code === code ? !c.isActive : false; });
        writeStorage(KEYS.activeCoupons, state.activeCoupons);
        onRefresh();
        openCouponsModal(state, onRefresh);
        showToast(
          coupon.isActive
            ? `Gutschein "${code}" aktiviert!`
            : `Gutschein "${code}" deaktiviert`,
          coupon.isActive ? 'success' : 'info'
        );
      }
    });
  });

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { closeCouponsModal(); document.removeEventListener('keydown', onKeydown); }
  };
  document.addEventListener('keydown', onKeydown);
}

function renderCoupon(coupon: Coupon): string {
  const isExpired = coupon.expiresAt && coupon.expiresAt < Date.now();
  const expiresText = coupon.expiresAt ? formatDate(coupon.expiresAt) : 'Kein Ablaufdatum';

  return `
    <div class="coupon-card ${coupon.isActive ? 'coupon-active' : ''} ${isExpired ? 'coupon-expired' : ''}">
      <div class="coupon-left">
        <div class="coupon-code">${coupon.code}</div>
        <div class="coupon-desc">${coupon.description}</div>
        <div class="coupon-meta">
          ${coupon.minOrder ? `Min. Bestellwert: ${coupon.minOrder}€ · ` : ''}
          Gültig bis: ${expiresText}
        </div>
      </div>
      <div class="coupon-right">
        <div class="coupon-value">
          ${coupon.type === 'percentage' ? `${coupon.discount}%` : `${coupon.discount}€`}
        </div>
        ${!isExpired ? `
          <button 
            class="coupon-toggle-btn ${coupon.isActive ? 'coupon-deactivate' : 'coupon-activate'}" 
            data-coupon-code="${coupon.code}"
          >
            ${coupon.isActive ? '✓ Aktiv' : 'Aktivieren'}
          </button>
        ` : '<span class="coupon-expired-label">Abgelaufen</span>'}
      </div>
    </div>
  `;
}

function redeemCoupon(state: AppState, code: string, onRefresh: RefreshCallback): void {
  if (!code) return;

  // Check if already exists
  const existing = state.activeCoupons.find(c => c.code === code);
  if (existing) {
    showToast(`Gutschein "${code}" bereits vorhanden!`, 'info');
    return;
  }

  // Known codes from data
  import('../data/heroSlides').then(({ SAMPLE_COUPONS }) => {
    const knownCoupon = SAMPLE_COUPONS.find(c => c.code === code);
    if (knownCoupon) {
      state.activeCoupons.push({ ...knownCoupon, isActive: true } as Coupon);
      // Deactivate others
      state.activeCoupons.forEach(c => { c.isActive = c.code === code; });
      writeStorage(KEYS.activeCoupons, state.activeCoupons);
      onRefresh();
      showToast(`🎉 Gutschein "${code}" eingelöst!`, 'success');
    } else {
      showToast(`Gutscheincode "${code}" ist ungültig.`, 'error');
    }
  });
}

function closeCouponsModal(): void {
  couponsModal?.classList.remove('open');
  document.body.style.overflow = '';
}
