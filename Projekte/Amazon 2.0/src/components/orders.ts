// ============================================================
// Amazon 2.0 – Orders Modal & Live Tracking Component
// ============================================================
import type { AppState, Order, OrderStatus } from '../types';
import { formatPrice, formatDate, formatRelativeTime } from '../utils/formatters';
import { showToast } from './toast';

let ordersModal: HTMLElement | null = null;
let trackingModal: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!ordersModal) {
    ordersModal = document.createElement('div');
    ordersModal.id = 'ordersModal';
    ordersModal.className = 'modal-overlay';
    ordersModal.setAttribute('role', 'dialog');
    ordersModal.setAttribute('aria-modal', 'true');
    ordersModal.setAttribute('aria-label', 'Meine Bestellungen');
    document.body.appendChild(ordersModal);
    ordersModal.addEventListener('click', e => {
      if (e.target === ordersModal) closeOrdersModal();
    });
  }
  return ordersModal;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  processing: '⏳ In Bearbeitung',
  shipped: '🚚 Versendet',
  delivered: '✅ Geliefert',
  cancelled: '❌ Storniert',
  returned: '↩ Zurückgegeben',
};

const STATUS_CLASSES: Record<OrderStatus, string> = {
  processing: 'status-processing',
  shipped: 'status-shipped',
  delivered: 'status-delivered',
  cancelled: 'status-cancelled',
  returned: 'status-returned',
};

export function openOrdersModal(state: AppState): void {
  const modal = getModal();

  modal.innerHTML = `
    <div class="modal-dialog orders-dialog">
      <button class="modal-close" id="ordersClose" aria-label="Schließen">✕</button>
      <h2 class="modal-heading">📦 Meine Bestellungen (${state.orders.length})</h2>
      
      ${state.orders.length === 0 ? `
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <h3>Noch keine Bestellungen</h3>
          <p>Bestelle Produkte, um sie hier zu sehen.</p>
        </div>
      ` : `
        <div class="orders-list">
          ${state.orders.map(order => renderOrder(order, state)).join('')}
        </div>
      `}
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById('ordersClose')?.addEventListener('click', closeOrdersModal);

  // Wire return buttons
  modal.querySelectorAll('.return-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-order-id')!;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        closeOrdersModal();
        document.dispatchEvent(new CustomEvent('openReturnModal', { detail: { order } }));
      }
    });
  });

  // Wire track buttons (Live Tracking Simulator)
  modal.querySelectorAll('.track-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-order-id')!;
      const order = state.orders.find(o => o.id === orderId);
      if (order) {
        openTrackingModal(order);
      }
    });
  });

  // Wire invoice print buttons
  modal.querySelectorAll('.invoice-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const orderId = btn.getAttribute('data-order-id')!;
      const order = state.orders.find(o => o.id === orderId);
      if (order) printInvoice(order);
    });
  });

  // Escape key
  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { closeOrdersModal(); document.removeEventListener('keydown', onKeydown); }
  };
  document.addEventListener('keydown', onKeydown);
}

function renderOrder(order: Order, _state: AppState): string {
  const statusLabel = STATUS_LABELS[order.status] ?? order.status;
  const statusClass = STATUS_CLASSES[order.status] ?? '';

  return `
    <div class="order-card">
      <div class="order-card-header">
        <div>
          <h3 class="order-id">${order.id}</h3>
          <p class="order-date">${formatRelativeTime(order.placedAt)} · ${formatDate(order.placedAt)}</p>
        </div>
        <span class="order-status-badge ${statusClass}">${statusLabel}</span>
      </div>

      <div class="order-items-preview">
        ${order.items.slice(0, 3).map(item => `
          <div class="order-item-preview">
            <img src="${item.product.images[0]}" alt="${item.product.title}" width="50" height="50" />
            <div>
              <p class="order-item-title">${item.product.title}</p>
              <p class="order-item-meta">×${item.qty} · ${formatPrice(item.priceAtPurchase * item.qty)}</p>
            </div>
          </div>
        `).join('')}
        ${order.items.length > 3 ? `<p class="more-items">+${order.items.length - 3} weitere Artikel</p>` : ''}
      </div>

      <div class="order-card-footer">
        <div class="order-total">
          <strong>Gesamt: ${formatPrice(order.total)}</strong>
          <span class="order-payment">${order.paymentMethod}</span>
        </div>
        <div class="order-actions">
          <button class="invoice-btn btn-secondary-sm" data-order-id="${order.id}">
            📄 Rechnung (PDF)
          </button>
          <button class="track-btn btn-primary-sm" data-order-id="${order.id}">
            🚚 Live-Karte & Tracking
          </button>
          ${order.isReturnable && order.status === 'delivered' ? `
            <button class="return-btn btn-secondary-sm" data-order-id="${order.id}">
              ↩ Rückgabe
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// ── Live GPS Package Tracking Modal Simulator ────────────────
export function openTrackingModal(order: Order): void {
  if (!trackingModal) {
    trackingModal = document.createElement('div');
    trackingModal.id = 'trackingModal';
    trackingModal.className = 'modal-overlay';
    document.body.appendChild(trackingModal);
  }

  trackingModal.innerHTML = `
    <div class="modal-dialog tracking-dialog">
      <button class="modal-close" id="closeTrackingModal">✕</button>
      <h2>🗺️ Live GPS Paketverfolgung</h2>
      <p class="subtitle">Bestellung <strong>${order.id}</strong> · Sendungsnr: <code>${order.trackingNumber ?? 'TRK-889012'}</code></p>

      <!-- Simulated GPS Map -->
      <div class="gps-map-container">
        <div class="gps-map-route">
          <svg viewBox="0 0 500 200" class="map-svg">
            <!-- Road Path -->
            <path d="M 40 160 Q 150 40 250 120 T 460 60" fill="none" stroke="#94a3b8" stroke-width="6" stroke-dasharray="8 8" />
            <path d="M 40 160 Q 150 40 250 120 T 460 60" fill="none" stroke="#FF9900" stroke-width="4" id="routeProgress" />

            <!-- Origin Marker -->
            <circle cx="40" cy="160" r="10" fill="#37475A" />
            <text x="40" y="190" text-anchor="middle" fill="currentColor" font-size="11" font-weight="600">Zentrallager</text>

            <!-- Destination Marker -->
            <circle cx="460" cy="60" r="10" fill="#067D62" />
            <text x="460" y="90" text-anchor="middle" fill="currentColor" font-size="11" font-weight="600">Zieladresse</text>

            <!-- Delivery Truck Pin -->
            <g class="truck-animated-pin">
              <circle cx="280" cy="105" r="18" fill="#FF9900" class="pulse-ring-pin" />
              <text x="280" y="111" text-anchor="middle" font-size="14">🚚</text>
            </g>
          </svg>
        </div>

        <div class="gps-telemetry-card">
          <div class="telemetry-badge">LIVE GPS VERBINDUNG</div>
          <div class="telemetry-grid">
            <div>
              <small>Fahrzeug</small>
              <strong>AMZ-Delivery #802</strong>
            </div>
            <div>
              <small>Zusteller</small>
              <strong>Thomas M. (⭐ 4.9)</strong>
            </div>
            <div>
              <small>Entfernung</small>
              <strong id="liveDistance">1.4 km (3 Stopps)</strong>
            </div>
            <div>
              <small>Ankunft ca.</small>
              <strong>Heute, 14:25 Uhr</strong>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="tracking-timeline">
        <div class="timeline-step done">
          <div class="step-icon">✓</div>
          <div class="step-info">
            <strong>Bestellung eingegangen</strong>
            <small>${formatDate(order.placedAt)}</small>
          </div>
        </div>
        <div class="timeline-step done">
          <div class="step-icon">✓</div>
          <div class="step-info">
            <strong>Im Logistikzentrum verpackt</strong>
            <small>Bad Hersfeld Logistics Hub</small>
          </div>
        </div>
        <div class="timeline-step active">
          <div class="step-icon">🚚</div>
          <div class="step-info">
            <strong>In Zustellung (Fahrzeug unterwegs)</strong>
            <small>Fahrer ist in deiner Nachbarschaft</small>
          </div>
        </div>
        <div class="timeline-step pending">
          <div class="step-icon">📦</div>
          <div class="step-info">
            <strong>Zustellung an der Haustür</strong>
            <small>Voraussichtlich ${order.estimatedDelivery ?? 'Heute'}</small>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="tracking-actions">
        <button class="btn-secondary" id="callDriverBtn">📞 Fahrer anrufen</button>
        <button class="btn-secondary" id="dropLocationBtn">🚪 Abstellort wählen</button>
        <button class="btn-primary" id="trackInvoiceBtn">📄 Rechnung drucken</button>
      </div>
    </div>
  `;

  trackingModal.classList.add('open');

  const closeModal = () => trackingModal?.classList.remove('open');
  document.getElementById('closeTrackingModal')?.addEventListener('click', closeModal);
  trackingModal.addEventListener('click', e => { if (e.target === trackingModal) closeModal(); });

  document.getElementById('callDriverBtn')?.addEventListener('click', () => {
    showToast('📞 Verbindung zu Thomas M. (Zusteller) hergestellt...', 'info');
  });

  document.getElementById('dropLocationBtn')?.addEventListener('click', () => {
    showToast('🚪 Abstellort hinterlegt: "Vor der Wohnungstür"', 'success');
  });

  document.getElementById('trackInvoiceBtn')?.addEventListener('click', () => {
    printInvoice(order);
  });
}

// ── Printable PDF-Style Invoice Generator ────────────────────
function printInvoice(order: Order): void {
  const printWin = window.open('', '_blank', 'width=800,height=900');
  if (!printWin) {
    showToast('Pop-up geblockt! Bitte erlaube Pop-ups zum Drucken.', 'warning');
    return;
  }

  const itemsHtml = order.items.map(i => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #ddd;">${i.product.title}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${i.qty}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatPrice(i.priceAtPurchase)}</td>
      <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">${formatPrice(i.priceAtPurchase * i.qty)}</td>
    </tr>
  `).join('');

  printWin.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Rechnung_${order.id}</title>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #FF9900; padding-bottom: 20px; }
          .logo { font-size: 28px; font-weight: 800; color: #232F3E; }
          .logo span { color: #FF9900; }
          table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          th { background: #f4f4f4; text-align: left; padding: 10px; border-bottom: 2px solid #ccc; }
          .total-box { margin-top: 30px; text-align: right; font-size: 18px; }
          .footer { margin-top: 60px; font-size: 11px; color: #777; border-top: 1px solid #ddd; padding-top: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">amazon<span>2.0</span></div>
            <p>Amazon 2.0 Europe S.à r.l.<br/>Musterstraße 42, 10115 Berlin</p>
          </div>
          <div style="text-align: right;">
            <h2>RECHNUNG</h2>
            <p><strong>Rechnungs-Nr:</strong> INV-${order.id}<br/><strong>Datum:</strong> ${formatDate(order.placedAt)}</p>
          </div>
        </div>

        <div style="margin-top: 30px;">
          <h3>Empfänger:</h3>
          <p><strong>${order.shippingAddress.name}</strong><br/>${order.shippingAddress.street}<br/>${order.shippingAddress.zip} ${order.shippingAddress.city}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Artikel</th>
              <th style="text-align: center;">Menge</th>
              <th style="text-align: right;">Einzelpreis</th>
              <th style="text-align: right;">Gesamt</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total-box">
          <p>Zahlungsart: <strong>${order.paymentMethod}</strong></p>
          <p><strong>Gesamtbetrag (inkl. MwSt.): ${formatPrice(order.total)}</strong></p>
        </div>

        <div class="footer">
          <p>Vielen Dank für deinen Einkauf bei Amazon 2.0! Dies ist eine automatisch generierte Rechnung.</p>
        </div>

        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `);
  printWin.document.close();
}

function closeOrdersModal(): void {
  ordersModal?.classList.remove('open');
  document.body.style.overflow = '';
}
