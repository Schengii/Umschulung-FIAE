// ============================================================
// Amazon 2.0 – Checkout Modal Component (Stripe & 3DS Interactive Simulator)
// ============================================================
import type { AppState, Order } from '../types';
import { formatPrice, generateOrderId, formatDate } from '../utils/formatters';
import { showToast } from './toast';

type OrderPlacedCallback = (order: Order) => void;

let checkoutModal: HTMLElement | null = null;
let secureModal: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!checkoutModal) {
    checkoutModal = document.createElement('div');
    checkoutModal.id = 'checkoutModal';
    checkoutModal.className = 'modal-overlay';
    checkoutModal.setAttribute('role', 'dialog');
    checkoutModal.setAttribute('aria-modal', 'true');
    checkoutModal.setAttribute('aria-label', 'Checkout');
    document.body.appendChild(checkoutModal);
  }
  return checkoutModal;
}

export function openCheckoutModal(state: AppState, onOrderPlaced: OrderPlacedCallback): void {
  if (state.cart.length === 0) return;

  const modal = getModal();
  const subtotal = state.cart.reduce((s, i) => s + i.product.price * i.qty, 0);
  const shipping = state.userProfile.isPrime || subtotal > 25 ? 0 : 4.99;
  
  // Apply coupon
  let discount = 0;
  const appliedCoupon = state.activeCoupons.find(c => c.isActive && (!c.minOrder || subtotal >= c.minOrder));
  if (appliedCoupon) {
    discount = appliedCoupon.type === 'percentage'
      ? Math.min((subtotal * appliedCoupon.discount) / 100, appliedCoupon.maxDiscount ?? Infinity)
      : appliedCoupon.discount;
  }

  const giftApplied = Math.min(state.userBalance.amount, subtotal - discount);
  const total = Math.max(0, subtotal + shipping - discount - giftApplied);

  const address = state.userProfile.addresses[state.userProfile.defaultAddressIdx] ?? {
    name: state.userProfile.name,
    street: 'Musterstraße 1',
    city: 'Berlin',
    zip: '10115',
    country: 'Deutschland',
  };

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + (state.userProfile.isPrime ? 1 : 3));

  let currentStep = 1;
  let selectedPaymentType = 'card'; // 'card', 'paypal', 'applepay', 'invoice'

  modal.innerHTML = `
    <div class="modal-dialog checkout-dialog">
      <button class="modal-close" id="checkoutClose" aria-label="Schließen">✕</button>
      <h2 class="modal-heading">🛒 Sichere Kasse</h2>

      <!-- Stepper -->
      <div class="checkout-stepper">
        <div class="step ${currentStep >= 1 ? 'active' : ''}" data-step="1">
          <div class="step-num">1</div><span>Lieferung</span>
        </div>
        <div class="step-sep"></div>
        <div class="step ${currentStep >= 2 ? 'active' : ''}" data-step="2">
          <div class="step-num">2</div><span>Zahlung</span>
        </div>
        <div class="step-sep"></div>
        <div class="step ${currentStep >= 3 ? 'active' : ''}" data-step="3">
          <div class="step-num">3</div><span>Bestätigung</span>
        </div>
      </div>

      <!-- Step 1: Delivery -->
      <div class="checkout-step-content" id="step1">
        <h3>Lieferadresse</h3>
        <div class="address-card selected-address">
          <p><strong>${address.name}</strong></p>
          <p>${address.street}</p>
          <p>${address.zip} ${address.city}</p>
          <p>${address.country}</p>
        </div>
        <h3>Liefermethode</h3>
        <div class="delivery-options">
          <label class="delivery-option">
            <input type="radio" name="delivery" value="standard" checked />
            <div>
              <strong>Standardlieferung</strong>
              <span class="delivery-date">${formatDate(deliveryDate)}</span>
              <span class="delivery-price">${shipping === 0 ? 'Kostenlos' : formatPrice(shipping)}</span>
            </div>
          </label>
          ${state.userProfile.isPrime ? `
            <label class="delivery-option">
              <input type="radio" name="delivery" value="prime-express" />
              <div>
                <strong>⭐ Prime Express</strong>
                <span class="delivery-date">Heute bis 22:00 Uhr</span>
                <span class="delivery-price">Kostenlos</span>
              </div>
            </label>
          ` : ''}
        </div>
        <button class="btn-primary" id="step1NextBtn">Weiter zur Zahlung →</button>
      </div>

      <!-- Step 2: Payment (Stripe-Style Interactive Payment System) -->
      <div class="checkout-step-content hidden" id="step2">
        <h3>Zahlungsart wählen</h3>
        <div class="payment-tabs">
          <button class="payment-tab active" data-type="card">💳 Kreditkarte</button>
          <button class="payment-tab" data-type="paypal">🅿️ PayPal</button>
          <button class="payment-tab" data-type="applepay">🍎 Apple Pay</button>
          <button class="payment-tab" data-type="crypto">⚡ Web3 Krypto</button>
          <button class="payment-tab" data-type="invoice">📄 Rechnung / Guthaben</button>
        </div>

        <!-- 💳 Credit Card Form with Live Interactive Preview -->
        <div class="payment-panel" id="panelCard">
          <div class="credit-card-preview" id="cardPreview">
            <div class="card-front">
              <div class="card-top">
                <span class="card-chip"></span>
                <span class="card-brand" id="cardBrandBadge">VISA</span>
              </div>
              <div class="card-number-display" id="cardNumDisplay">•••• •••• •••• ••••</div>
              <div class="card-bottom">
                <div class="card-holder-display">
                  <small>Karteninhaber</small>
                  <span id="cardHolderDisplay">${state.userProfile.name.toUpperCase()}</span>
                </div>
                <div class="card-expiry-display">
                  <small>Gültig bis</small>
                  <span id="cardExpDisplay">12/28</span>
                </div>
              </div>
            </div>
            <div class="card-back hidden" id="cardBack">
              <div class="card-magnetic-stripe"></div>
              <div class="card-cvv-box">
                <small>CVC/CVV</small>
                <div class="card-cvv-display" id="cardCvvDisplay">•••</div>
              </div>
            </div>
          </div>

          <div class="card-input-grid">
            <div class="input-group full">
              <label>Kartennummer</label>
              <input type="text" id="cardNumInput" placeholder="4532 8901 2345 6789" maxlength="19" autocomplete="cc-number" />
            </div>
            <div class="input-group full">
              <label>Name auf der Karte</label>
              <input type="text" id="cardHolderInput" value="${state.userProfile.name}" autocomplete="cc-name" />
            </div>
            <div class="input-group half">
              <label>Ablaufdatum</label>
              <input type="text" id="cardExpInput" placeholder="MM/YY" maxlength="5" autocomplete="cc-exp" />
            </div>
            <div class="input-group half">
              <label>CVC / CVV</label>
              <input type="password" id="cardCvvInput" placeholder="123" maxlength="4" autocomplete="cc-csc" />
            </div>
          </div>
        </div>

        <!-- 🅿️ PayPal Panel -->
        <div class="payment-panel hidden" id="panelPaypal">
          <div class="express-checkout-box">
            <div class="paypal-badge">🅿️ PayPal Express Checkout</div>
            <p>Eingeloggt als: <strong>${state.userProfile.email}</strong></p>
            <p class="text-sm">Der Rechnungsbetrag von <strong>${formatPrice(total)}</strong> wird direkt von deinem PayPal-Konto abgebucht.</p>
          </div>
        </div>

        <!-- 🍎 Apple Pay Panel -->
        <div class="payment-panel hidden" id="panelApplepay">
          <div class="express-checkout-box apple-pay-box">
            <div class="apple-pay-logo"> Pay</div>
            <p>Zahlung autorisieren per <strong>Touch ID / Face ID</strong></p>
            <div class="biometric-sim-ring">
              <span class="biometric-icon">👆</span>
            </div>
          </div>
        </div>

        <!-- 📄 Invoice / Balance Panel -->
        <div class="payment-panel hidden" id="panelInvoice">
          <div class="express-checkout-box">
            <h4>📄 Kauf auf Rechnung & Guthaben</h4>
            <p>Dein verfügbares Guthaben: <strong>${formatPrice(state.userBalance.amount)}</strong></p>
            <p>Zahlungsziel: <strong>14 Tage nach Erhalt der Ware</strong></p>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="checkout-summary">
          <h3>Bestellübersicht</h3>
          ${state.cart.map(item => `
            <div class="checkout-item">
              <span>${item.product.title} ×${item.qty}</span>
              <span>${formatPrice(item.product.price * item.qty)}</span>
            </div>
          `).join('')}
          <hr class="summary-divider" />
          <div class="checkout-item">
            <span>Zwischensumme</span><span>${formatPrice(subtotal)}</span>
          </div>
          <div class="checkout-item">
            <span>Versand</span>
            <span>${shipping === 0 ? '✓ Kostenlos' : formatPrice(shipping)}</span>
          </div>
          ${discount > 0 ? `
            <div class="checkout-item discount-item">
              <span>Rabatt (${appliedCoupon?.code})</span>
              <span>-${formatPrice(discount)}</span>
            </div>
          ` : ''}
          ${giftApplied > 0 ? `
            <div class="checkout-item discount-item">
              <span>🎁 Guthaben</span>
              <span>-${formatPrice(giftApplied)}</span>
            </div>
          ` : ''}
          <div class="checkout-item total-item">
            <strong>Gesamt</strong><strong>${formatPrice(total)}</strong>
          </div>
        </div>

        <div class="checkout-step-actions">
          <button class="btn-secondary" id="step2BackBtn">← Zurück</button>
          <button class="btn-primary" id="step2NextBtn">Bestellung kostenpflichtig aufgeben</button>
        </div>
      </div>

      <!-- Step 3: Confirmation -->
      <div class="checkout-step-content hidden" id="step3">
        <div class="order-success">
          <div class="success-icon">✓</div>
          <h3 id="confirmOrderId"></h3>
          <p>Deine Bestellung wurde erfolgreich aufgegeben!</p>
          <p class="delivery-confirm">📦 Voraussichtliche Lieferung: <strong>${formatDate(deliveryDate)}</strong></p>
          <p class="tracking-info" id="confirmTracking"></p>
        </div>
        <button class="btn-primary" id="confirmCloseBtn">Fertig</button>
      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Wire close
  document.getElementById('checkoutClose')?.addEventListener('click', closeCheckoutModal);

  // Step navigation
  document.getElementById('step1NextBtn')?.addEventListener('click', () => goToStep(2));
  document.getElementById('step2BackBtn')?.addEventListener('click', () => goToStep(1));
  document.getElementById('confirmCloseBtn')?.addEventListener('click', closeCheckoutModal);

  // Payment Tabs Wiring
  const tabs = modal.querySelectorAll('.payment-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      selectedPaymentType = tab.getAttribute('data-type')!;

      ['Card', 'Paypal', 'Applepay', 'Invoice'].forEach(t => {
        document.getElementById(`panel${t}`)?.classList.add('hidden');
      });
      const targetPanel = selectedPaymentType.charAt(0).toUpperCase() + selectedPaymentType.slice(1);
      document.getElementById(`panel${targetPanel}`)?.classList.remove('hidden');
    });
  });

  // Credit Card Live Preview Inputs Wiring
  const cardNumInput = document.getElementById('cardNumInput') as HTMLInputElement;
  const cardHolderInput = document.getElementById('cardHolderInput') as HTMLInputElement;
  const cardExpInput = document.getElementById('cardExpInput') as HTMLInputElement;
  const cardCvvInput = document.getElementById('cardCvvInput') as HTMLInputElement;

  const cardNumDisplay = document.getElementById('cardNumDisplay');
  const cardHolderDisplay = document.getElementById('cardHolderDisplay');
  const cardExpDisplay = document.getElementById('cardExpDisplay');
  const cardCvvDisplay = document.getElementById('cardCvvDisplay');
  const cardBrandBadge = document.getElementById('cardBrandBadge');
  const cardPreview = document.getElementById('cardPreview');

  cardNumInput?.addEventListener('input', () => {
    let val = cardNumInput.value.replace(/\D/g, '');
    let formatted = val.replace(/(.{4})/g, '$1 ').trim();
    cardNumInput.value = formatted;
    if (cardNumDisplay) cardNumDisplay.textContent = formatted || '•••• •••• •••• ••••';

    // Brand detection
    if (cardBrandBadge) {
      if (val.startsWith('4')) cardBrandBadge.textContent = 'VISA';
      else if (val.startsWith('5')) cardBrandBadge.textContent = 'MASTERCARD';
      else if (val.startsWith('3')) cardBrandBadge.textContent = 'AMEX';
      else if (val.startsWith('6')) cardBrandBadge.textContent = 'DISCOVER';
      else cardBrandBadge.textContent = 'CARD';
    }
  });

  cardHolderInput?.addEventListener('input', () => {
    if (cardHolderDisplay) cardHolderDisplay.textContent = cardHolderInput.value.toUpperCase() || 'MAX MUSTERMANN';
  });

  cardExpInput?.addEventListener('input', () => {
    let val = cardExpInput.value.replace(/\D/g, '');
    if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2, 4);
    cardExpInput.value = val;
    if (cardExpDisplay) cardExpDisplay.textContent = val || '12/28';
  });

  cardCvvInput?.addEventListener('focus', () => cardPreview?.classList.add('flipped'));
  cardCvvInput?.addEventListener('blur', () => cardPreview?.classList.remove('flipped'));
  cardCvvInput?.addEventListener('input', () => {
    if (cardCvvDisplay) cardCvvDisplay.textContent = cardCvvInput.value || '•••';
  });

  // Step 2 Next Button -> 3DS Simulator, Crypto Gateway or Instant Order
  document.getElementById('step2NextBtn')?.addEventListener('click', () => {
    if (selectedPaymentType === 'card') {
      open3DSecureModal(() => finalizeOrder());
    } else if (selectedPaymentType === 'crypto') {
      import('./cryptoPayment').then(({ openCryptoPaymentModal }) => {
        openCryptoPaymentModal(total, () => finalizeOrder());
      });
    } else if (selectedPaymentType === 'applepay') {
      showToast('🍏 Biometrische Autorisierung via Face ID...', 'info');
      setTimeout(() => finalizeOrder(), 1200);
    } else {
      finalizeOrder();
    }
  });

  function goToStep(step: number): void {
    currentStep = step;
    document.querySelectorAll('.checkout-step-content').forEach((el, i) => {
      el.classList.toggle('hidden', i + 1 !== step);
    });
    document.querySelectorAll('.step').forEach((el, i) => {
      el.classList.toggle('active', i + 1 <= step);
    });
  }

  function finalizeOrder(): void {
    let paymentMethodName = 'Kreditkarte';
    if (selectedPaymentType === 'paypal') paymentMethodName = 'PayPal Express';
    else if (selectedPaymentType === 'applepay') paymentMethodName = 'Apple Pay';
    else if (selectedPaymentType === 'invoice') paymentMethodName = 'Kauf auf Rechnung';

    const trackingNum = 'TRK-' + Date.now().toString(36).toUpperCase();

    const order: Order = {
      id: generateOrderId(),
      items: state.cart.map(i => ({
        product: i.product,
        qty: i.qty,
        priceAtPurchase: i.product.price,
      })),
      total,
      status: 'processing',
      placedAt: Date.now(),
      estimatedDelivery: formatDate(deliveryDate),
      shippingAddress: address,
      paymentMethod: paymentMethodName,
      trackingNumber: trackingNum,
      isReturnable: true,
    };

    onOrderPlaced(order);

    // Update confirmation step
    const confirmOrderId = document.getElementById('confirmOrderId');
    if (confirmOrderId) confirmOrderId.textContent = `Bestellung ${order.id}`;
    const confirmTracking = document.getElementById('confirmTracking');
    if (confirmTracking) confirmTracking.textContent = `Sendungsnummer: ${trackingNum}`;

    goToStep(3);
  }
}

// ── 3D-Secure 2.0 Verification Modal Simulator ───────────────
function open3DSecureModal(onSuccess: () => void): void {
  if (!secureModal) {
    secureModal = document.createElement('div');
    secureModal.id = 'secure3DModal';
    secureModal.className = 'modal-overlay';
    document.body.appendChild(secureModal);
  }

  const generatedCode = '492815';

  secureModal.innerHTML = `
    <div class="modal-dialog secure-3d-dialog">
      <div class="secure-header">
        <span class="secure-logo">🛡️ Visa / Mastercard 3D-Secure 2.0</span>
        <span class="secure-lock">🔒 Ende-zu-Ende Verschlüsselt</span>
      </div>

      <h2>Zahlung verifizieren</h2>
      <p class="subtitle">Wir haben einen 6-stelligen Sicherheitscode per SMS an <strong>+49 170 ****892</strong> gesendet.</p>

      <div class="otp-input-container">
        <input type="text" id="otpCodeInput" maxlength="6" value="${generatedCode}" placeholder="492815" autocomplete="one-time-code" />
      </div>

      <p class="otp-hint">💡 Demo-Code wurde automatisch ausgefüllt (${generatedCode})</p>

      <div class="secure-actions">
        <button class="btn-primary" id="confirmOtpBtn">Zahlung freigeben & abschließen</button>
      </div>
    </div>
  `;

  secureModal.classList.add('open');

  document.getElementById('confirmOtpBtn')?.addEventListener('click', () => {
    secureModal?.classList.remove('open');
    showToast('✓ 3D-Secure Authentifizierung erfolgreich!', 'success');
    onSuccess();
  });
}

function closeCheckoutModal(): void {
  checkoutModal?.classList.remove('open');
  document.body.style.overflow = '';
}
