// ============================================================
// Amazon 2.0 – Automated Price Drop Guard & Refund Engine
// ============================================================
import type { AppState, Order } from '../types';
import { formatPrice, formatDate } from '../utils/formatters';
import { showToast } from './toast';
import { saveBalance, emit } from '../store';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

let guardModal: HTMLElement | null = null;

export interface PriceDropClaim {
  orderId: string;
  productTitle: string;
  productImage: string;
  pricePaid: number;
  currentPrice: number;
  difference: number;
  purchaseDate: string;
}

export function scanForPriceDrops(state: AppState): PriceDropClaim[] {
  const claims: PriceDropClaim[] = [];

  state.orders.forEach((order: Order) => {
    order.items.forEach((item) => {
      const catalogProduct = state.products.find(p => p.id === item.product.id);
      if (catalogProduct) {
        // Check if price dropped
        if (catalogProduct.price < item.priceAtPurchase) {
          const diff = (item.priceAtPurchase - catalogProduct.price) * item.qty;
          claims.push({
            orderId: order.id,
            productTitle: catalogProduct.title,
            productImage: catalogProduct.images[0],
            pricePaid: item.priceAtPurchase,
            currentPrice: catalogProduct.price,
            difference: Math.round(diff * 100) / 100,
            purchaseDate: formatDate(order.placedAt),
          });
        }
      }
    });
  });

  // If no organic drops, provide simulated eligible drop on latest order for demo
  if (claims.length === 0 && state.orders.length > 0) {
    const latest = state.orders[0];
    const firstItem = latest.items[0];
    if (firstItem) {
      claims.push({
        orderId: latest.id,
        productTitle: firstItem.product.title,
        productImage: firstItem.product.images[0],
        pricePaid: firstItem.priceAtPurchase,
        currentPrice: Math.round(firstItem.priceAtPurchase * 0.88),
        difference: Math.round(firstItem.priceAtPurchase * 0.12 * 100) / 100,
        purchaseDate: formatDate(latest.placedAt),
      });
    }
  }

  return claims;
}

export function openPriceDropGuardModal(state: AppState): void {
  if (!guardModal) {
    guardModal = document.createElement('div');
    guardModal.id = 'priceDropGuardModal';
    guardModal.className = 'modal-overlay';
    document.body.appendChild(guardModal);
  }

  const claims = scanForPriceDrops(state);
  const totalRefund = claims.reduce((s, c) => s + c.difference, 0);

  guardModal.innerHTML = `
    <div class="modal-dialog guard-dialog">
      <button class="modal-close" id="closeGuardModal">✕</button>
      <div class="guard-header">
        <span class="guard-badge">🛡️ 30-Tage Preisschutz-Garantie</span>
        <h2>Automatischer Preisschutz-Wächter</h2>
        <p class="subtitle">Wir überwachen deine Einkäufe automatisch. Fällt der Preis, erstatten wir dir die Differenz!</p>
      </div>

      <!-- Summary Card -->
      <div class="guard-summary-card">
        <div class="summary-left">
          <span class="summary-label">Erstattungsfähiges Guthaben:</span>
          <strong class="summary-amount">${formatPrice(totalRefund)}</strong>
        </div>
        <button class="btn-primary" id="claimAllRefundsBtn" ${claims.length === 0 ? 'disabled' : ''}>
          💰 ${claims.length > 0 ? 'Jetzt ' + formatPrice(totalRefund) + ' erstatten' : 'Keine Preissenkung'}
        </button>
      </div>

      <!-- Claims List -->
      <div class="claims-container">
        <h4>Erkannte Preissenkungen (${claims.length})</h4>
        ${claims.length > 0 ? `
          <div class="claims-list">
            ${claims.map(c => `
              <div class="claim-card">
                <img src="${c.productImage}" alt="${c.productTitle}" class="claim-img" />
                <div class="claim-info">
                  <span class="claim-order">Bestellung #${c.orderId}</span>
                  <p class="claim-title">${c.productTitle}</p>
                  <div class="claim-prices">
                    <span class="paid-price">Gezahlt: ${formatPrice(c.pricePaid)}</span>
                    <span class="now-price">Neu: ${formatPrice(c.currentPrice)}</span>
                    <span class="diff-badge">Erstattung: +${formatPrice(c.difference)}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div class="empty-guard-box">
            <p>✓ Alle gekauften Artikel haben aktuell den Bestpreis!</p>
          </div>
        `}
      </div>
    </div>
  `;

  guardModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  const closeModal = () => {
    guardModal?.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.getElementById('closeGuardModal')?.addEventListener('click', closeModal);
  guardModal.addEventListener('click', e => { if (e.target === guardModal) closeModal(); });

  // Claim all refunds
  document.getElementById('claimAllRefundsBtn')?.addEventListener('click', () => {
    if (totalRefund > 0) {
      state.userBalance.amount += totalRefund;
      saveBalance();
      emit('balance:changed');
      playSound('checkout');
      triggerHaptic('success');
      showToast(`🎉 Bravo! +${formatPrice(totalRefund)} Preisschutz-Erstattung deinem Guthaben gutgeschrieben!`, 'success');
      closeModal();
    }
  });
}
