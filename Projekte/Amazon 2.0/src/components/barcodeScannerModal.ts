// ============================================================
// Amazon 2.0 – Barcode & NFC Store Scanner Modal
// ============================================================
import type { AppState } from '../types';
import { formatPrice } from '../utils/formatters';
import { matchBarcodeToProduct } from '../utils/barcodeScanner';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';
import { emit } from '../store';

let barcodeModalEl: HTMLElement | null = null;
let currentBarcode = '4006381333931';

function getModal(): HTMLElement {
  if (!barcodeModalEl) {
    barcodeModalEl = document.createElement('div');
    barcodeModalEl.id = 'barcodeScannerModal';
    barcodeModalEl.className = 'modal-overlay';
    barcodeModalEl.setAttribute('role', 'dialog');
    barcodeModalEl.setAttribute('aria-modal', 'true');
    barcodeModalEl.setAttribute('aria-label', 'Barcode & NFC Scanner');
    document.body.appendChild(barcodeModalEl);
  }
  return barcodeModalEl;
}

export function openBarcodeScannerModal(state: AppState): void {
  const modal = getModal();
  renderBarcodeUI(modal, state);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeBarcodeScannerModal(): void {
  if (barcodeModalEl) {
    barcodeModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderBarcodeUI(modal: HTMLElement, state: AppState): void {
  const res = matchBarcodeToProduct(currentBarcode, state.products);

  modal.innerHTML = `
    <div class="modal-dialog barcode-dialog">
      <button class="modal-close" id="closeBarcodeBtn" aria-label="Schließen">✕</button>

      <div class="barcode-header">
        <div class="barcode-badge">📱 REAL-TIME STORE SCANNER</div>
        <h2>Barcode, EAN & NFC Laden-Scanner</h2>
        <p class="barcode-sub">Scanne Produkte im Supermarkt & vergleiche sofort den Filialpreis mit Amazon 2.0.</p>
      </div>

      <!-- Laser Scanner Simulation Viewport -->
      <div class="scanner-viewport-box">
        <div class="scanner-laser-line"></div>
        <div class="barcode-lines-graphic">
          <span>||| | |||| || | ||| |||| | ||</span>
          <strong>EAN-13: ${res.barcode}</strong>
        </div>
        <div class="scanner-nfc-tag">⚡ NFC Ready</div>
      </div>

      <!-- Demo Barcode Switcher -->
      <div class="barcode-switcher-chips">
        <button class="barcode-chip ${currentBarcode === '4006381333931' ? 'active' : ''}" data-code="4006381333931">🏷️ Kopfhörer (EAN)</button>
        <button class="barcode-chip ${currentBarcode === 'e002' ? 'active' : ''}" data-code="e002">🏷️ AirPods (EAN)</button>
        <button class="barcode-chip ${currentBarcode === 'nfc-tag-1' ? 'active' : ''}" data-code="nfc-tag-1">⚡ Smart Hub (NFC)</button>
      </div>

      <!-- Price Comparison Card -->
      <div class="price-comparison-card">
        <div class="comp-product-row">
          <img src="${res.product.images[0]}" alt="${res.product.title}" class="comp-img" />
          <div class="comp-info">
            <h4>${res.product.title}</h4>
            <span class="comp-asin">ASIN: ${res.product.asin || res.product.id}</span>
          </div>
        </div>

        <div class="prices-comparison-grid">
          <div class="price-box retail">
            <span class="p-label">Geschäftspreis vor Ort:</span>
            <strong>${formatPrice(res.retailStorePrice)}</strong>
          </div>
          <div class="price-box amazon">
            <span class="p-label">Amazon 2.0 Bestpreis:</span>
            <strong style="color: #10b981;">${formatPrice(res.amazonPrice)}</strong>
          </div>
        </div>

        <div class="savings-alert-badge">
          🎉 Du sparst <strong>${formatPrice(res.savingsEur)} (${res.savingsPercent}%)</strong> bei Amazon 2.0!
        </div>

        <button class="btn-primary btn-reorder-instant" id="instantReorderBtn">
          🛒 Für ${formatPrice(res.amazonPrice)} in den Warenkorb
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeBarcodeBtn')?.addEventListener('click', closeBarcodeScannerModal);

  // Switch demo barcodes
  modal.querySelectorAll('.barcode-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      currentBarcode = btn.getAttribute('data-code') || '4006381333931';
      playSound('click');
      triggerHaptic('light');
      renderBarcodeUI(modal, state);
    });
  });

  // Reorder
  document.getElementById('instantReorderBtn')?.addEventListener('click', () => {
    const existing = state.cart.find(c => c.product.id === res.product.id);
    if (existing) existing.qty += 1;
    else state.cart.push({ product: res.product, qty: 1, addedAt: Date.now() });

    emit('cart:changed');
    playSound('cart');
    triggerHaptic('heavy');
    showToast(`🛒 „${res.product.title}“ wurde zum Bestpreis von ${formatPrice(res.amazonPrice)} in den Warenkorb gelegt!`, 'success');
    closeBarcodeScannerModal();
  });
}
