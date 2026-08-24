// ============================================================
// Amazon 2.0 – Returns Modal Component
// ============================================================
import type { AppState, Order } from '../types';
import { formatPrice } from '../utils/formatters';
import { writeStorage, KEYS } from '../utils/persist';
import { showToast } from './toast';
import { addNotification } from './notifications';

let returnsModal: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!returnsModal) {
    returnsModal = document.createElement('div');
    returnsModal.id = 'returnsModal';
    returnsModal.className = 'modal-overlay';
    returnsModal.setAttribute('role', 'dialog');
    returnsModal.setAttribute('aria-modal', 'true');
    returnsModal.setAttribute('aria-label', 'Rückgabe');
    document.body.appendChild(returnsModal);
    returnsModal.addEventListener('click', e => {
      if (e.target === returnsModal) closeReturnsModal();
    });
  }
  return returnsModal;
}

const RETURN_REASONS = [
  'Defekt / beschädigt',
  'Falsch geliefertes Produkt',
  'Entspricht nicht der Beschreibung',
  'Nicht mehr benötigt',
  'Zu spät geliefert',
  'Besseres Produkt gefunden',
  'Sonstiges',
];

export function openReturnModal(state: AppState, order: Order): void {
  const modal = getModal();

  modal.innerHTML = `
    <div class="modal-dialog returns-dialog">
      <button class="modal-close" id="returnClose" aria-label="Schließen">✕</button>
      <h2 class="modal-heading">↩ Rückgabe – ${order.id}</h2>

      <div class="return-steps">
        <div class="return-info-box">
          <p>📦 Du kannst Artikel innerhalb von <strong>30 Tagen</strong> nach Lieferung zurücksenden.</p>
          <p>💳 Erstattung erfolgt auf die ursprüngliche Zahlungsmethode innerhalb von 3-5 Werktagen.</p>
        </div>

        <h3>Welche Artikel möchtest du zurücksenden?</h3>
        <div class="return-items-list">
          ${order.items.map((item, idx) => `
            <label class="return-item-label">
              <input type="checkbox" name="returnItem" value="${idx}" class="return-item-check" />
              <img src="${item.product.images[0]}" alt="${item.product.title}" width="60" height="60" />
              <div class="return-item-info">
                <p>${item.product.title}</p>
                <p class="return-item-meta">×${item.qty} · ${formatPrice(item.priceAtPurchase * item.qty)}</p>
              </div>
            </label>
          `).join('')}
        </div>

        <div class="form-group">
          <label for="returnReason" class="filter-group-label">Rückgabegrund *</label>
          <select id="returnReason" class="filter-select">
            <option value="">Bitte auswählen…</option>
            ${RETURN_REASONS.map(r => `<option value="${r}">${r}</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label for="returnComment" class="filter-group-label">Kommentar (optional)</label>
          <textarea id="returnComment" class="form-textarea" rows="3" placeholder="Weitere Details…"></textarea>
        </div>

        <div class="return-label-preview">
          <h4>📮 Rücksendeetikett</h4>
          <p>Nach Einreichung erhältst du ein kostenloses Rücksendeetikett per E-Mail.</p>
        </div>

        <div class="return-actions">
          <button class="btn-secondary" id="cancelReturnBtn">Abbrechen</button>
          <button class="btn-primary" id="submitReturnBtn">Rückgabe einleiten</button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById('returnClose')?.addEventListener('click', closeReturnsModal);
  document.getElementById('cancelReturnBtn')?.addEventListener('click', closeReturnsModal);

  document.getElementById('submitReturnBtn')?.addEventListener('click', () => {
    const checkedItems = modal.querySelectorAll('input[name="returnItem"]:checked');
    const reason = (document.getElementById('returnReason') as HTMLSelectElement).value;

    if (checkedItems.length === 0) {
      showToast('Bitte wähle mindestens einen Artikel aus.', 'warning');
      return;
    }
    if (!reason) {
      showToast('Bitte wähle einen Rückgabegrund.', 'warning');
      return;
    }

    // Process return
    const orderIdx = state.orders.findIndex(o => o.id === order.id);
    if (orderIdx >= 0) {
      state.orders[orderIdx].status = 'returned';
      state.orders[orderIdx].returnedAt = Date.now();
      state.orders[orderIdx].isReturnable = false;
      writeStorage(KEYS.orders, state.orders);
    }

    // Refund to balance
    const refundTotal = order.total;
    state.userBalance.amount += refundTotal;
    state.userBalance.transactions.unshift({
      id: `refund-${Date.now()}`,
      type: 'credit',
      amount: refundTotal,
      description: `Erstattung für Bestellung ${order.id}`,
      date: Date.now(),
    });
    writeStorage(KEYS.balance, state.userBalance);

    // Add notification
    addNotification(state, {
      type: 'return',
      title: `Rückgabe eingeleitet: ${order.id}`,
      message: `${formatPrice(refundTotal)} werden erstattet. Rücksendeetikett wurde an ${state.userProfile.email} gesendet.`,
      read: false,
      createdAt: Date.now(),
    });

    closeReturnsModal();
    showToast(`Rückgabe eingeleitet! Erstattung: ${formatPrice(refundTotal)}`, 'success');
  });

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { closeReturnsModal(); document.removeEventListener('keydown', onKeydown); }
  };
  document.addEventListener('keydown', onKeydown);
}

function closeReturnsModal(): void {
  returnsModal?.classList.remove('open');
  document.body.style.overflow = '';
}
