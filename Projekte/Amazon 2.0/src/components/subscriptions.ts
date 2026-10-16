// ============================================================
// Amazon 2.0 – Subscribe & Save (Spar-Abo) Manager Component
// ============================================================
import type { AppState, Subscription, Product } from '../types';
import { formatPrice, sanitizeHtml } from '../utils/formatters';
import { addSubscription, updateSubscriptionStatus, saveSubscriptions } from '../store';
import { showToast } from './toast';
import { playSound } from '../utils/audio';

export function calculateSubscriptionDiscount(price: number, intervalMonths: number): {
  discountPercent: number;
  discountedPrice: number;
  savingsPerDelivery: number;
} {
  // 1 month: 10% off, 2 months: 10% off, 3 months: 12% off, 6 months: 15% off
  let discountPercent = 10;
  if (intervalMonths >= 6) discountPercent = 15;
  else if (intervalMonths >= 3) discountPercent = 12;

  const discountedPrice = Math.round(price * (1 - discountPercent / 100) * 100) / 100;
  const savingsPerDelivery = Math.round((price - discountedPrice) * 100) / 100;

  return { discountPercent, discountedPrice, savingsPerDelivery };
}

export function subscribeToProduct(
  product: Product,
  intervalMonths: number,
  state: AppState
): Subscription {
  const { discountPercent, discountedPrice } = calculateSubscriptionDiscount(product.price, intervalMonths);
  
  const nextDate = new Date();
  nextDate.setMonth(nextDate.getMonth() + intervalMonths);
  const nextDeliveryDate = nextDate.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const defaultAddr = state.userProfile.addresses[state.userProfile.defaultAddressIdx] || {
    name: state.userProfile.name,
    street: 'Musterstraße 1',
    city: 'Berlin',
    zip: '10115',
    country: 'Deutschland',
  };

  const newSub = addSubscription({
    productId: product.id,
    productTitle: product.title,
    productImage: product.images[0],
    originalPrice: product.price,
    discountedPrice,
    discountPercent,
    intervalMonths,
    nextDeliveryDate,
    shippingAddress: defaultAddr,
    paymentMethod: state.userProfile.paymentMethods[0] || 'Kreditkarte (****4242)',
  });

  playSound('checkout');
  showToast(`🎉 Spar-Abo für „${product.title}“ (${discountPercent}% Rabatt) erfolgreich aktiviert!`, 'success');
  return newSub;
}

export function renderSubscriptionsList(state: AppState, containerEl: HTMLElement): void {
  const subs = state.subscriptions || [];

  if (subs.length === 0) {
    containerEl.innerHTML = `
      <div class="subs-empty">
        <div class="subs-empty-icon">📦</div>
        <h3>Keine aktiven Spar-Abos</h3>
        <p>Nutze bei deinen Lieblingsprodukten die Option „Spar-Abo“, um dauerhaft bis zu 15% zu sparen und automatische Lieferungen zu erhalten.</p>
      </div>
    `;
    return;
  }

  containerEl.innerHTML = `
    <div class="subs-container">
      <div class="subs-header-info">
        <div class="subs-badge">✨ ${subs.filter(s => s.status === 'active').length} aktive Abos</div>
        <p class="subs-desc">Pausiere, ändere das Lieferintervall oder kündige deine Spar-Abos jederzeit kostenlos mit nur einem Klick.</p>
      </div>

      <div class="subs-grid">
        ${subs.map(sub => `
          <div class="sub-card ${sub.status === 'paused' ? 'sub-card-paused' : sub.status === 'cancelled' ? 'sub-card-cancelled' : ''}" data-sub-id="${sub.id}">
            <div class="sub-card-header">
              <img src="${sub.productImage}" alt="${sanitizeHtml(sub.productTitle)}" class="sub-product-thumb" />
              <div class="sub-info-main">
                <h4 class="sub-title">${sanitizeHtml(sub.productTitle)}</h4>
                <div class="sub-price-row">
                  <span class="sub-price-disc">${formatPrice(sub.discountedPrice)}</span>
                  <span class="sub-price-orig">${formatPrice(sub.originalPrice)}</span>
                  <span class="sub-discount-badge">-${sub.discountPercent}% Spar-Abo</span>
                </div>
              </div>
              <span class="sub-status-pill ${sub.status}">${sub.status === 'active' ? '● Aktiv' : sub.status === 'paused' ? '⏸ Pausiert' : '✕ Gekündigt'}</span>
            </div>

            <div class="sub-details-grid">
              <div class="sub-detail-item">
                <span class="sub-label">Lieferintervall:</span>
                <select class="sub-interval-select" data-sub-id="${sub.id}" ${sub.status === 'cancelled' ? 'disabled' : ''}>
                  <option value="1" ${sub.intervalMonths === 1 ? 'selected' : ''}>Jeden Monat (-10%)</option>
                  <option value="2" ${sub.intervalMonths === 2 ? 'selected' : ''}>Alle 2 Monate (-10%)</option>
                  <option value="3" ${sub.intervalMonths === 3 ? 'selected' : ''}>Alle 3 Monate (-12%)</option>
                  <option value="6" ${sub.intervalMonths === 6 ? 'selected' : ''}>Alle 6 Monate (-15%)</option>
                </select>
              </div>
              <div class="sub-detail-item">
                <span class="sub-label">Nächste Lieferung:</span>
                <strong>${sub.nextDeliveryDate}</strong>
              </div>
            </div>

            ${sub.status !== 'cancelled' ? `
              <div class="sub-actions">
                ${sub.status === 'active' ? `
                  <button class="btn btn-sm btn-outline btn-pause-sub" data-sub-id="${sub.id}">⏸ Pausieren</button>
                  <button class="btn btn-sm btn-primary btn-deliver-now" data-sub-id="${sub.id}">⚡ Jetzt liefern</button>
                ` : `
                  <button class="btn btn-sm btn-primary btn-resume-sub" data-sub-id="${sub.id}">▶ Reaktivieren</button>
                `}
                <button class="btn btn-sm btn-danger-outline btn-cancel-sub" data-sub-id="${sub.id}">✕ Kündigen</button>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Attach event handlers
  containerEl.querySelectorAll<HTMLSelectElement>('.sub-interval-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const subId = (e.target as HTMLElement).getAttribute('data-sub-id');
      const newInterval = parseInt((e.target as HTMLSelectElement).value, 10);
      const sub = state.subscriptions?.find(s => s.id === subId);
      if (sub) {
        sub.intervalMonths = newInterval;
        const disc = calculateSubscriptionDiscount(sub.originalPrice, newInterval);
        sub.discountPercent = disc.discountPercent;
        sub.discountedPrice = disc.discountedPrice;
        saveSubscriptions();
        showToast('Lieferintervall & Rabatt aktualisiert!', 'info');
        renderSubscriptionsList(state, containerEl);
      }
    });
  });

  containerEl.querySelectorAll('.btn-pause-sub').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const subId = (e.currentTarget as HTMLElement).getAttribute('data-sub-id');
      if (subId) {
        updateSubscriptionStatus(subId, 'paused');
        showToast('Spar-Abo pausiert.', 'info');
        renderSubscriptionsList(state, containerEl);
      }
    });
  });

  containerEl.querySelectorAll('.btn-resume-sub').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const subId = (e.currentTarget as HTMLElement).getAttribute('data-sub-id');
      if (subId) {
        updateSubscriptionStatus(subId, 'active');
        showToast('Spar-Abo wieder aktiviert!', 'success');
        renderSubscriptionsList(state, containerEl);
      }
    });
  });

  containerEl.querySelectorAll('.btn-deliver-now').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const subId = (e.currentTarget as HTMLElement).getAttribute('data-sub-id');
      const sub = state.subscriptions?.find(s => s.id === subId);
      if (sub) {
        playSound('checkout');
        showToast(`⚡ Sofortlieferung für „${sub.productTitle}“ ausgelöst! Zustellung morgen.`, 'success');
      }
    });
  });

  containerEl.querySelectorAll('.btn-cancel-sub').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const subId = (e.currentTarget as HTMLElement).getAttribute('data-sub-id');
      if (subId && confirm('Möchtest du dieses Spar-Abo wirklich kündigen? Du kannst es jederzeit neu anlegen.')) {
        updateSubscriptionStatus(subId, 'cancelled');
        showToast('Spar-Abo gekündigt.', 'warning');
        renderSubscriptionsList(state, containerEl);
      }
    });
  });
}
