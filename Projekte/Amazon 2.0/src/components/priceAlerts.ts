// ============================================================
// Amazon 2.0 – Custom Price Alerts (Zielpreis-Wächter)
// ============================================================
import type { AppState, Product } from '../types';
import { formatPrice, sanitizeHtml } from '../utils/formatters';
import { addPriceAlert, removePriceAlert, savePriceAlerts, saveNotifications } from '../store';
import { showToast } from './toast';
import { playSound } from '../utils/audio';

let alertModalEl: HTMLElement | null = null;

function getAlertModal(): HTMLElement {
  if (!alertModalEl) {
    alertModalEl = document.createElement('div');
    alertModalEl.id = 'priceAlertModal';
    alertModalEl.className = 'modal-overlay';
    alertModalEl.setAttribute('role', 'dialog');
    alertModalEl.setAttribute('aria-modal', 'true');
    alertModalEl.setAttribute('aria-label', 'Preisalarm einrichten');
    document.body.appendChild(alertModalEl);

    alertModalEl.addEventListener('click', (e) => {
      if (e.target === alertModalEl) closePriceAlertModal();
    });
  }
  return alertModalEl;
}

export function closePriceAlertModal(): void {
  if (alertModalEl) alertModalEl.classList.remove('open');
}

export function openPriceAlertModal(product: Product, state: AppState): void {
  const modal = getAlertModal();
  const existingAlert = state.priceAlerts.find(a => a.productId === product.id);
  const suggestedTarget5 = Math.round(product.price * 0.95 * 100) / 100;
  const suggestedTarget10 = Math.round(product.price * 0.90 * 100) / 100;
  const suggestedTarget15 = Math.round(product.price * 0.85 * 100) / 100;

  modal.innerHTML = `
    <div class="modal-dialog price-alert-dialog">
      <button class="modal-close" id="priceAlertClose" aria-label="Schließen">✕</button>

      <div class="price-alert-header">
        <span class="alert-bell-icon">🔔</span>
        <h3>Preis-Wecker stellen</h3>
        <p class="alert-subtitle">Wir benachrichtigen dich sofort, wenn der Preis von <strong>${sanitizeHtml(product.title)}</strong> fällt!</p>
      </div>

      <div class="alert-product-summary">
        <img src="${product.images[0]}" alt="${sanitizeHtml(product.title)}" class="alert-thumb" />
        <div class="alert-prod-info">
          <div class="alert-curr-price">Aktueller Preis: <strong>${formatPrice(product.price)}</strong></div>
          <div class="alert-stock-badge">${product.inStock ? '✓ Auf Lager' : 'Momentan vergriffen'}</div>
        </div>
      </div>

      <div class="alert-input-section">
        <label for="targetPriceInput" class="alert-input-label">Dein Wunschpreis (€):</label>
        <div class="alert-input-wrapper">
          <input
            type="number"
            id="targetPriceInput"
            class="target-price-input"
            step="0.50"
            min="1"
            max="${product.price - 0.5}"
            value="${existingAlert ? existingAlert.targetPrice : suggestedTarget10}"
          />
          <span class="currency-symbol">€</span>
        </div>

        <div class="quick-target-chips">
          <button class="chip-btn" data-val="${suggestedTarget5}">-5% (${formatPrice(suggestedTarget5)})</button>
          <button class="chip-btn active" data-val="${suggestedTarget10}">-10% (${formatPrice(suggestedTarget10)})</button>
          <button class="chip-btn" data-val="${suggestedTarget15}">-15% (${formatPrice(suggestedTarget15)})</button>
        </div>
      </div>

      <div class="alert-actions">
        <button class="btn btn-primary btn-save-alert" id="savePriceAlertBtn">
          🔔 Preisalarm aktivieren
        </button>
        ${existingAlert ? `
          <button class="btn btn-outline btn-delete-alert" id="deletePriceAlertBtn">
            ✕ Alarm löschen
          </button>
        ` : ''}
      </div>
    </div>
  `;

  const inputEl = modal.querySelector<HTMLInputElement>('#targetPriceInput')!;
  
  modal.querySelectorAll<HTMLButtonElement>('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      inputEl.value = btn.getAttribute('data-val') || '';
    });
  });

  modal.querySelector('#priceAlertClose')?.addEventListener('click', closePriceAlertModal);

  modal.querySelector('#savePriceAlertBtn')?.addEventListener('click', () => {
    const val = parseFloat(inputEl.value);
    if (!val || val <= 0 || val >= product.price) {
      showToast('Bitte gib einen gültigen Wunschpreis ein, der unter dem aktuellen Preis liegt.', 'warning');
      return;
    }

    addPriceAlert(product.id, val);
    playSound('alert');
    showToast(`🔔 Preisalarm für ${formatPrice(val)} erfolgreich gesetzt!`, 'success');
    closePriceAlertModal();
  });

  modal.querySelector('#deletePriceAlertBtn')?.addEventListener('click', () => {
    if (existingAlert) {
      removePriceAlert(existingAlert.id);
      showToast('Preisalarm entfernt.', 'info');
      closePriceAlertModal();
    }
  });

  modal.classList.add('open');
}

export function renderPriceAlertsList(state: AppState, containerEl: HTMLElement): void {
  const alerts = state.priceAlerts || [];

  if (alerts.length === 0) {
    containerEl.innerHTML = `
      <div class="alerts-empty">
        <div class="alerts-empty-icon">🔔</div>
        <h3>Keine aktiven Preisalarme</h3>
        <p>Stelle bei jedem beliebigen Produkt einen Preisalarm ein, um automatisch informiert zu werden, sobald der Preis fällt.</p>
      </div>
    `;
    return;
  }

  containerEl.innerHTML = `
    <div class="alerts-container">
      <div class="alerts-grid">
        ${alerts.map(alert => {
          const prod = state.products.find(p => p.id === alert.productId);
          const currentPrice = prod ? prod.price : alert.originalPrice;
          const diff = Math.round((currentPrice - alert.targetPrice) * 100) / 100;
          return `
            <div class="alert-card ${alert.triggered ? 'alert-triggered' : ''}" data-alert-id="${alert.id}">
              <img src="${alert.productImage || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30'}" alt="${sanitizeHtml(alert.productTitle || '')}" class="alert-card-thumb" />
              <div class="alert-card-info">
                <h4 class="alert-card-title">${sanitizeHtml(alert.productTitle || 'Produkt')}</h4>
                <div class="alert-card-prices">
                  <span>Aktuell: <strong>${formatPrice(currentPrice)}</strong></span>
                  <span class="target-badge">Ziel: <strong>${formatPrice(alert.targetPrice)}</strong></span>
                </div>
                <div class="alert-card-status">
                  ${alert.triggered ? `
                    <span class="status-triggered">🎉 Zielpreis erreicht!</span>
                  ` : `
                    <span class="status-waiting">Noch ${formatPrice(diff)} bis zum Zielpreis</span>
                  `}
                </div>
              </div>
              <div class="alert-card-actions">
                <button class="btn btn-sm btn-outline btn-test-trigger-alert" data-alert-id="${alert.id}" title="Preisabfall simulieren">⚡ Test-Auslösung</button>
                <button class="btn btn-sm btn-danger-outline btn-del-alert" data-alert-id="${alert.id}">✕</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Attach handlers
  containerEl.querySelectorAll('.btn-del-alert').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const alertId = (e.currentTarget as HTMLElement).getAttribute('data-alert-id');
      if (alertId) {
        removePriceAlert(alertId);
        showToast('Preisalarm gelöscht.', 'info');
        renderPriceAlertsList(state, containerEl);
      }
    });
  });

  containerEl.querySelectorAll('.btn-test-trigger-alert').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const alertId = (e.currentTarget as HTMLElement).getAttribute('data-alert-id');
      const alert = state.priceAlerts.find(a => a.id === alertId);
      if (alert) {
        alert.triggered = true;
        savePriceAlerts();
        playSound('alert');
        showToast(`🎉 Preisalarm ausgelöst für „${alert.productTitle}“!`, 'success');
        
        // Add to notifications
        state.notifications.unshift({
          id: `notif-alert-trig-${Date.now()}`,
          type: 'price_alert',
          title: `🎯 Preisalarm: ${alert.productTitle}`,
          message: `Der Wunschpreis von ${formatPrice(alert.targetPrice)} wurde erreicht!`,
          read: false,
          createdAt: Date.now(),
        });
        saveNotifications();
        renderPriceAlertsList(state, containerEl);
      }
    });
  });
}
