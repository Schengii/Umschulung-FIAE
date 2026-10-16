// ============================================================
// Amazon 2.0 – Cross-Border Customs & Global Tariffs Modal
// ============================================================
import type { Product } from '../types';
import { formatPrice } from '../utils/formatters';
import {
  CUSTOMS_DESTINATIONS,
  calculateLandedCost,
  type DestinationCountryCode,
} from '../utils/crossBorderCustoms';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let customsModalEl: HTMLElement | null = null;
let activeCountryCode: DestinationCountryCode = 'US';

function getModal(): HTMLElement {
  if (!customsModalEl) {
    customsModalEl = document.createElement('div');
    customsModalEl.id = 'crossBorderCustomsModal';
    customsModalEl.className = 'modal-overlay';
    customsModalEl.setAttribute('role', 'dialog');
    customsModalEl.setAttribute('aria-modal', 'true');
    customsModalEl.setAttribute('aria-label', 'Zoll- & Importgebühren Rechner');
    document.body.appendChild(customsModalEl);
  }
  return customsModalEl;
}

export function openCrossBorderCustomsModal(product: Product): void {
  const modal = getModal();
  renderCustomsUI(modal, product);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeCrossBorderCustomsModal(): void {
  if (customsModalEl) {
    customsModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderCustomsUI(modal: HTMLElement, product: Product): void {
  const calc = calculateLandedCost(product, activeCountryCode);
  const destList = Object.values(CUSTOMS_DESTINATIONS);

  modal.innerHTML = `
    <div class="modal-dialog customs-dialog">
      <button class="modal-close" id="closeCustomsBtn" aria-label="Schließen">✕</button>

      <div class="customs-header">
        <div class="customs-badge">🌍 GLOBAL DDP CUSTOMS ENGINE</div>
        <h2>Zoll-, Steuer- & Landed-Cost Rechner</h2>
        <p class="customs-sub">Garantierte Delivered-Duty-Paid (DDP) Vorabberechnung für „${product.title}“ ohne versteckte Nachzahlungen.</p>
      </div>

      <!-- Country Selector Chips -->
      <div class="customs-country-chips">
        ${destList.map(d => `
          <button class="c-chip ${activeCountryCode === d.code ? 'active' : ''}" data-code="${d.code}">
            ${d.flagEmoji} ${d.countryName}
          </button>
        `).join('')}
      </div>

      <!-- Landed Cost Breakdown Card -->
      <div class="customs-breakdown-card">
        <div class="hs-code-tag">Klassifizierung: <strong>${calc.hsCode}</strong></div>

        <div class="customs-cost-rows">
          <div class="cost-row">
            <span>Artikelpreis:</span>
            <strong>${formatPrice(calc.productPriceEur)}</strong>
          </div>
          <div class="cost-row">
            <span>Internationaler Expressversand:</span>
            <strong>${calc.shippingFeeEur === 0 ? 'Kostenlos (Inland/EU)' : formatPrice(calc.shippingFeeEur)}</strong>
          </div>
          <div class="cost-row">
            <span>Einfuhrzoll (${calc.destination.dutyRatePercent}%):</span>
            <strong>${formatPrice(calc.dutyAmountEur)}</strong>
          </div>
          <div class="cost-row">
            <span>Einfuhr-Umsatzsteuer / MwSt. (${calc.destination.vatRatePercent}%):</span>
            <strong>${formatPrice(calc.vatAmountEur)}</strong>
          </div>
          <div class="cost-row">
            <span>Zollabwicklungs- & Sicherheitsgebühr:</span>
            <strong>${formatPrice(calc.customsFeeEur)}</strong>
          </div>
        </div>

        <div class="customs-total-box">
          <div class="total-left">
            <span>Garantierter DDP-Endpreis:</span>
            <strong class="total-landed-price">${formatPrice(calc.totalLandedCostEur)}</strong>
          </div>
          <div class="total-badge">✓ Keine Nachzahlung bei Zustellung</div>
        </div>
      </div>

      <!-- Delivery Projection Banner -->
      <div class="customs-delivery-banner">
        <span>⏱️ Express-Zustellung nach <strong>${calc.destination.countryName}</strong>: ca. <strong>${calc.destination.deliveryDaysMin}-${calc.destination.deliveryDaysMax} Werktage</strong></span>
      </div>

      <button class="btn-primary btn-customs-confirm" id="confirmDdpBtn">
        ✈️ Mit DDP-Zollgarantie für ${formatPrice(calc.totalLandedCostEur)} bestellen
      </button>
    </div>
  `;

  // Listeners
  document.getElementById('closeCustomsBtn')?.addEventListener('click', closeCrossBorderCustomsModal);

  modal.querySelectorAll('.c-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCountryCode = btn.getAttribute('data-code') as DestinationCountryCode;
      playSound('click');
      triggerHaptic('light');
      renderCustomsUI(modal, product);
    });
  });

  document.getElementById('confirmDdpBtn')?.addEventListener('click', () => {
    playSound('success');
    triggerHaptic('heavy');
    showToast(`✈️ DDP-Zollberechnung für ${calc.destination.countryName} bestätigt! Keine Nachzahlung garantiert.`, 'success');
    closeCrossBorderCustomsModal();
  });
}
