import type { AppState, Order } from '../types';
import { formatPrice } from '../utils/formatters';
import { writeStorage, KEYS } from '../utils/persist';
import { showToast } from './toast';
import { addNotification } from './notifications';
import { playSound } from '../utils/audio';
import { emit } from '../store';

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
      <h2 class="modal-heading">↩ Rückgabe & Retourenlabel – ${order.id}</h2>

      <div class="return-steps" id="returnFormContainer">
        <div class="return-info-box">
          <p>📦 Du kannst Artikel innerhalb von <strong>30 Tagen</strong> nach Lieferung kostenlos zurücksenden.</p>
          <p>💳 <strong>Sofort-Gutschrift:</strong> Wähle zwischen Amazon Guthaben (sofort verfügbar) oder Auszahlung auf dein Bankkonto.</p>
        </div>

        <h3>Welche Artikel möchtest du zurücksenden?</h3>
        <div class="return-items-list">
          ${order.items.map((item, idx) => `
            <label class="return-item-label">
              <input type="checkbox" name="returnItem" value="${idx}" class="return-item-check" checked />
              <img src="${item.product.images[0]}" alt="${item.product.title}" width="60" height="60" />
              <div class="return-item-info">
                <p><strong>${item.product.title}</strong></p>
                <p class="return-item-meta">${item.qty}× · ${formatPrice(item.priceAtPurchase * item.qty)}</p>
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
          <label for="refundMethod" class="filter-group-label">Erstattungsmethode *</label>
          <select id="refundMethod" class="filter-select">
            <option value="balance" selected>⚡ Amazon 2.0 Guthaben (Sofortige Gutschrift)</option>
            <option value="original">💳 Ursprüngliche Zahlungsmethode (${order.paymentMethod})</option>
          </select>
        </div>

        <div class="form-group">
          <label for="returnComment" class="filter-group-label">Kommentar / Fehlerbeschreibung (optional)</label>
          <textarea id="returnComment" class="form-textarea" rows="2" placeholder="Beschreibe kurz den Grund…"></textarea>
        </div>

        <div class="return-actions">
          <button class="btn-secondary" id="cancelReturnBtn">Abbrechen</button>
          <button class="btn-primary" id="submitReturnBtn">Retourenlabel generieren & einreichen</button>
        </div>
      </div>

      <div class="return-success-view hidden" id="returnSuccessView">
        <div class="ret-qr-card">
          <div class="qr-header">
            <span>📦 DHL / Hermes Packstation QR-Code</span>
            <span class="qr-badge">Portofrei</span>
          </div>
          <div class="qr-canvas-wrap">
            <canvas id="returnQrCanvas" width="160" height="160"></canvas>
          </div>
          <p class="qr-instructions">Halte diesen Code einfach an der Packstation oder in der Filiale vor – kein Ausdrucken nötig!</p>
          <div class="ret-meta-row">
            <span>Sendungsnummer: <strong>RET-${order.id.slice(-6)}</strong></span>
            <span>Gültig bis: <strong>${new Date(Date.now() + 14 * 86400000).toLocaleDateString('de-DE')}</strong></span>
          </div>
        </div>
        <button class="btn-primary" id="finishReturnBtn" style="width: 100%; margin-top: 16px;">Fertig & Schließen</button>
      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById('returnClose')?.addEventListener('click', closeReturnsModal);
  document.getElementById('cancelReturnBtn')?.addEventListener('click', closeReturnsModal);
  document.getElementById('finishReturnBtn')?.addEventListener('click', closeReturnsModal);

  document.getElementById('submitReturnBtn')?.addEventListener('click', () => {
    const checkedItems = modal.querySelectorAll('input[name="returnItem"]:checked');
    const reason = (document.getElementById('returnReason') as HTMLSelectElement).value;
    const refundMethod = (document.getElementById('refundMethod') as HTMLSelectElement).value;

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

    const refundTotal = order.total;

    if (refundMethod === 'balance') {
      state.userBalance.amount += refundTotal;
      state.userBalance.transactions.unshift({
        id: `refund-${Date.now()}`,
        type: 'credit',
        amount: refundTotal,
        description: `Sofort-Erstattung für Retoure ${order.id}`,
        date: Date.now(),
      });
      writeStorage(KEYS.balance, state.userBalance);
      emit('balance:changed');
    }

    // Add notification
    addNotification(state, {
      type: 'return',
      title: `Rückgabe eingeleitet: ${order.id}`,
      message: `${formatPrice(refundTotal)} werden ${refundMethod === 'balance' ? 'sofort als Guthaben gutgeschrieben' : 'auf die Zahlungsmethode erstattet'}. Packstation-QR-Code ist aktiv.`,
      read: false,
      createdAt: Date.now(),
    });

    playSound('success');
    showToast(`Rückgabe eingeleitet! Erstattung: ${formatPrice(refundTotal)}`, 'success');

    // Switch view to QR Code
    document.getElementById('returnFormContainer')?.classList.add('hidden');
    const successView = document.getElementById('returnSuccessView');
    successView?.classList.remove('hidden');

    drawQrCode('returnQrCanvas', `AMZ2-RETURN-${order.id}`);
  });

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { closeReturnsModal(); document.removeEventListener('keydown', onKeydown); }
  };
  document.addEventListener('keydown', onKeydown);
}

function drawQrCode(canvasId: string, payload: string): void {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const size = 160;
  const grid = 16;
  const cellSize = size / grid;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = '#111827';

  // Corner markers
  const drawCorner = (r: number, c: number) => {
    ctx.fillRect(c * cellSize, r * cellSize, cellSize * 4, cellSize * 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect((c + 1) * cellSize, (r + 1) * cellSize, cellSize * 2, cellSize * 2);
    ctx.fillStyle = '#111827';
    ctx.fillRect((c + 1.25) * cellSize, (r + 1.25) * cellSize, cellSize * 1.5, cellSize * 1.5);
  };

  drawCorner(1, 1);
  drawCorner(1, 11);
  drawCorner(11, 1);

  // Deterministic pseudo-random pattern based on string
  let hash = 0;
  for (let i = 0; i < payload.length; i++) hash = (hash * 31 + payload.charCodeAt(i)) & 0xffffffff;

  for (let r = 0; r < grid; r++) {
    for (let c = 0; c < grid; c++) {
      if ((r < 5 && c < 5) || (r < 5 && c > 10) || (r > 10 && c < 5)) continue;
      const bit = ((hash ^ (r * 17 + c * 37)) & (1 << ((r + c) % 8))) !== 0;
      if (bit) {
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }
}

function closeReturnsModal(): void {
  returnsModal?.classList.remove('open');
  document.body.style.overflow = '';
}
