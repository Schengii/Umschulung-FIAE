// ============================================================
// Amazon 2.0 – Professional PDF Invoice & Packing Slip Generator
// ============================================================
import type { Order, AppState } from '../types';
import { formatPrice, sanitizeHtml } from '../utils/formatters';

let invoiceModalEl: HTMLElement | null = null;

function getInvoiceModal(): HTMLElement {
  if (!invoiceModalEl) {
    invoiceModalEl = document.createElement('div');
    invoiceModalEl.id = 'invoiceModal';
    invoiceModalEl.className = 'modal-overlay invoice-modal-overlay';
    invoiceModalEl.setAttribute('role', 'dialog');
    invoiceModalEl.setAttribute('aria-modal', 'true');
    invoiceModalEl.setAttribute('aria-label', 'Rechnung & Lieferschein');
    document.body.appendChild(invoiceModalEl);

    invoiceModalEl.addEventListener('click', (e) => {
      if (e.target === invoiceModalEl) closeInvoiceModal();
    });
  }
  return invoiceModalEl;
}

export function closeInvoiceModal(): void {
  if (invoiceModalEl) {
    invoiceModalEl.classList.remove('open');
  }
}

export function openInvoiceModal(order: Order, _state: AppState): void {
  const modal = getInvoiceModal();
  const invoiceNum = order.invoiceNumber || `INV-2026-${order.id.slice(-6).toUpperCase()}`;
  const dateStr = new Date(order.placedAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const isGift = order.giftOptions?.isGift;
  const hidePrices = isGift && order.giftOptions?.hidePricesOnSlip;

  // Tax calculations (19% standard VAT)
  const totalGross = order.total;
  const totalNet = totalGross / 1.19;
  const vat19 = totalGross - totalNet;

  modal.innerHTML = `
    <div class="modal-dialog invoice-modal-dialog">
      <div class="invoice-actions no-print">
        <button class="btn btn-primary btn-print-invoice" id="printInvoiceBtn">
          🖨️ Drucken / Als PDF speichern
        </button>
        <button class="modal-close" id="invoiceModalClose" aria-label="Schließen">✕</button>
      </div>

      <div class="invoice-document" id="invoicePrintArea">
        <!-- Invoice Header -->
        <div class="invoice-header">
          <div class="invoice-logo-group">
            <div class="invoice-brand">🛒 amazon<span>2.0</span></div>
            <p class="invoice-company-sub">Amazon 2.0 EU S.à r.l. • Niederlassung Deutschland<br/>Musterdamm 42, 10115 Berlin • USt-ID: DE 392 819 283</p>
          </div>
          <div class="invoice-meta-top">
            <h2 class="invoice-doc-type">${hidePrices ? '📦 LIEFERSCHEIN & GESCHENKBELEG' : '📄 RECHNUNG'}</h2>
            <div class="invoice-meta-row"><strong>Rechnungs-Nr.:</strong> <span>${invoiceNum}</span></div>
            <div class="invoice-meta-row"><strong>Bestell-Nr.:</strong> <span>#${order.id}</span></div>
            <div class="invoice-meta-row"><strong>Datum:</strong> <span>${dateStr}</span></div>
            <div class="invoice-meta-row"><strong>Zahlungsart:</strong> <span>${order.paymentMethod}</span></div>
            ${order.trackingNumber ? `<div class="invoice-meta-row"><strong>Sendungsverfolgung:</strong> <span>${order.trackingNumber}</span></div>` : ''}
          </div>
        </div>

        <hr class="invoice-divider" />

        <!-- Address Grid -->
        <div class="invoice-address-grid">
          <div class="invoice-address-box">
            <h4 class="invoice-box-title">Lieferadresse</h4>
            <p><strong>${sanitizeHtml(order.shippingAddress.name)}</strong></p>
            <p>${sanitizeHtml(order.shippingAddress.street)}</p>
            <p>${sanitizeHtml(order.shippingAddress.zip)} ${sanitizeHtml(order.shippingAddress.city)}</p>
            <p>${sanitizeHtml(order.shippingAddress.country)}</p>
          </div>
          <div class="invoice-address-box">
            <h4 class="invoice-box-title">Rechnungsadresse</h4>
            <p><strong>${sanitizeHtml(order.shippingAddress.name)}</strong></p>
            <p>${sanitizeHtml(order.shippingAddress.street)}</p>
            <p>${sanitizeHtml(order.shippingAddress.zip)} ${sanitizeHtml(order.shippingAddress.city)}</p>
            <p>${sanitizeHtml(order.shippingAddress.country)}</p>
          </div>
        </div>

        ${isGift ? `
          <div class="invoice-gift-message-box">
            <div class="gift-box-header">🎁 Persönliche Grußbotschaft von ${sanitizeHtml(order.giftOptions?.senderName || 'deinem Absender')}:</div>
            <div class="gift-box-content">„${sanitizeHtml(order.giftOptions?.greetingMessage || 'Viel Freude mit deiner Bestellung!')}“</div>
          </div>
        ` : ''}

        <!-- Items Table -->
        <table class="invoice-table">
          <thead>
            <tr>
              <th>Pos.</th>
              <th>Artikelbezeichnung & Details</th>
              <th class="text-center">Menge</th>
              ${!hidePrices ? `
                <th class="text-right">Einzelpreis (Brutto)</th>
                <th class="text-right">Gesamt (Brutto)</th>
              ` : ''}
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>
                  <strong>${sanitizeHtml(item.product.title)}</strong>
                  <div class="invoice-item-sub">Kategorie: ${item.product.category} • ASIN: ${item.product.asin || 'AMZ-' + item.product.id.slice(0, 6)}</div>
                </td>
                <td class="text-center">${item.qty}</td>
                ${!hidePrices ? `
                  <td class="text-right">${formatPrice(item.priceAtPurchase)}</td>
                  <td class="text-right"><strong>${formatPrice(item.priceAtPurchase * item.qty)}</strong></td>
                ` : ''}
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${!hidePrices ? `
          <!-- Summary and Tax Breakdown -->
          <div class="invoice-summary-section">
            <div class="invoice-tax-breakdown">
              <table class="invoice-tax-table">
                <thead>
                  <tr>
                    <th>Steuersatz</th>
                    <th>Nettobetrag</th>
                    <th>MwSt.</th>
                    <th>Bruttobetrag</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>19,00% (Standard)</td>
                    <td>${formatPrice(totalNet)}</td>
                    <td>${formatPrice(vat19)}</td>
                    <td>${formatPrice(totalGross)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="invoice-total-box">
              <div class="invoice-total-row">
                <span>Zwischensumme (Netto):</span>
                <span>${formatPrice(totalNet)}</span>
              </div>
              <div class="invoice-total-row">
                <span>Zzgl. 19% MwSt.:</span>
                <span>${formatPrice(vat19)}</span>
              </div>
              <div class="invoice-total-row">
                <span>Versandkosten (Prime):</span>
                <span class="text-success">0,00 €</span>
              </div>
              <div class="invoice-total-row invoice-grand-total">
                <strong>Gesamtbetrag (Brutto):</strong>
                <strong>${formatPrice(totalGross)}</strong>
              </div>
            </div>
          </div>
        ` : ''}

        <!-- Invoice Footer -->
        <div class="invoice-footer">
          <p>Vielen Dank für deinen Einkauf bei Amazon 2.0! Bei Fragen zur Rechnung steht dir unser 24/7 Support zur Seite.</p>
          <div class="invoice-footer-details">
            Amazon 2.0 EU S.à r.l. • Handelsregister Berlin HRB 991823 • Geschäftsführer: J. Bezos, A. Jassy • Erfüllungsort: Berlin
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach handlers
  modal.querySelector('#invoiceModalClose')?.addEventListener('click', closeInvoiceModal);
  modal.querySelector('#printInvoiceBtn')?.addEventListener('click', () => {
    window.print();
  });

  modal.classList.add('open');
}
