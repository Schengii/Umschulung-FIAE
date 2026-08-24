// ============================================================
// Amazon 2.0 – Cart Drawer Component
// ============================================================
import type { AppState, CartItem } from '../types';
import { formatPrice } from '../utils/formatters';
import { showToast } from './toast';

type CartUpdateCallback = (productId: string, qty: number) => void;
type CheckoutCallback = () => void;

let drawerEl: HTMLElement | null = null;
let overlayEl: HTMLElement | null = null;
let isOpen = false;

export function initCart(
  state: AppState,
  onUpdate: CartUpdateCallback,
  onCheckout: CheckoutCallback
): void {
  // Create drawer
  drawerEl = document.createElement('div');
  drawerEl.id = 'cartDrawer';
  drawerEl.className = 'cart-drawer';
  drawerEl.setAttribute('role', 'dialog');
  drawerEl.setAttribute('aria-label', 'Warenkorb');
  drawerEl.setAttribute('aria-modal', 'true');

  overlayEl = document.createElement('div');
  overlayEl.id = 'cartOverlay';
  overlayEl.className = 'drawer-overlay';
  overlayEl.addEventListener('click', closeCartDrawer);

  document.body.appendChild(overlayEl);
  document.body.appendChild(drawerEl);

  renderCartDrawer(state, onUpdate, onCheckout);
}

export function renderCartDrawer(
  state: AppState,
  onUpdate: CartUpdateCallback,
  onCheckout: CheckoutCallback
): void {
  if (!drawerEl) return;

  const total = state.cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);

  // Coupon discount
  let discountAmount = 0;
  let activeCouponCode = '';
  if (state.activeCoupons.length > 0) {
    const appliedCoupon = state.activeCoupons.find(c => c.isActive);
    if (appliedCoupon && (!appliedCoupon.minOrder || total >= appliedCoupon.minOrder)) {
      if (appliedCoupon.type === 'percentage') {
        discountAmount = Math.min(
          (total * appliedCoupon.discount) / 100,
          appliedCoupon.maxDiscount ?? Infinity
        );
      } else {
        discountAmount = appliedCoupon.discount;
      }
      activeCouponCode = appliedCoupon.code;
    }
  }

  // Gift card balance applied
  const giftApplied = Math.min(state.userBalance.amount, total - discountAmount);
  const finalTotal = Math.max(0, total - discountAmount - giftApplied);

  drawerEl.innerHTML = `
    <div class="cart-drawer-inner">
      <div class="cart-header">
        <h2 class="cart-title">🛒 Warenkorb <span class="cart-count">(${count})</span></h2>
        <button class="cart-close-btn" id="cartCloseBtn" aria-label="Warenkorb schließen">✕</button>
      </div>

      ${state.cart.length === 0 ? `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛒</div>
          <p>Dein Warenkorb ist leer.</p>
          <p class="cart-empty-sub">Füge Produkte hinzu, um loszulegen!</p>
        </div>
      ` : `
        <div class="cart-items" role="list">
          ${state.cart.map(item => renderCartItem(item)).join('')}
        </div>

        <div class="cart-summary">
          ${activeCouponCode ? `
            <div class="cart-summary-row discount-row">
              <span>Gutschein (${activeCouponCode})</span>
              <span class="discount-amount">-${formatPrice(discountAmount)}</span>
            </div>
          ` : ''}
          ${giftApplied > 0 ? `
            <div class="cart-summary-row gift-row">
              <span>🎁 Guthaben</span>
              <span class="discount-amount">-${formatPrice(giftApplied)}</span>
            </div>
          ` : ''}
          <div class="cart-summary-row subtotal-row">
            <span>Zwischensumme (${count} Artikel)</span>
            <span>${formatPrice(total)}</span>
          </div>
          <div class="cart-summary-row total-row">
            <strong>Gesamt</strong>
            <strong class="total-amount">${formatPrice(finalTotal)}</strong>
          </div>
          <p class="cart-shipping-note">✓ Kostenloser Versand mit Prime</p>
          <button class="checkout-btn" id="cartCheckoutBtn">
            Zur Kasse (${formatPrice(finalTotal)})
          </button>
          <button class="continue-shopping-btn" id="continueShoppingBtn">
            Weiter einkaufen
          </button>
        </div>
      `}
    </div>
  `;

  // Wire events
  document.getElementById('cartCloseBtn')?.addEventListener('click', closeCartDrawer);
  document.getElementById('continueShoppingBtn')?.addEventListener('click', closeCartDrawer);
  document.getElementById('cartCheckoutBtn')?.addEventListener('click', () => {
    if (state.cart.length === 0) {
      showToast('Dein Warenkorb ist leer!', 'warning');
      return;
    }
    onCheckout();
  });

  // Quantity controls
  drawerEl.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.getAttribute('data-product-id')!;
      const delta = Number(btn.getAttribute('data-delta'));
      const currentItem = state.cart.find(i => i.product.id === productId);
      if (currentItem) onUpdate(productId, currentItem.qty + delta);
    });
  });

  // Remove buttons
  drawerEl.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.getAttribute('data-product-id')!;
      onUpdate(productId, 0);
      showToast('Artikel entfernt', 'info');
    });
  });
}

function renderCartItem(item: CartItem): string {
  return `
    <div class="cart-item" role="listitem" data-cart-item="${item.product.id}">
      <img src="${item.product.images[0]}" alt="${item.product.title}" class="cart-item-img" width="70" height="70" />
      <div class="cart-item-details">
        <p class="cart-item-title">${item.product.title}</p>
        <p class="cart-item-brand">${item.product.brand}</p>
        <div class="cart-item-price-row">
          <span class="cart-item-price">${formatPrice(item.product.price * item.qty)}</span>
          ${item.qty > 1 ? `<span class="cart-item-unit">${formatPrice(item.product.price)}/Stk.</span>` : ''}
        </div>
        <div class="qty-controls">
          <button class="qty-btn" data-product-id="${item.product.id}" data-delta="-1" aria-label="Menge verringern">−</button>
          <span class="qty-display" aria-label="Menge: ${item.qty}">${item.qty}</span>
          <button class="qty-btn" data-product-id="${item.product.id}" data-delta="1" aria-label="Menge erhöhen">+</button>
        </div>
      </div>
      <button class="cart-item-remove" data-product-id="${item.product.id}" aria-label="Aus Warenkorb entfernen">✕</button>
    </div>
  `;
}

export function toggleCartDrawer(): void {
  isOpen ? closeCartDrawer() : openCartDrawer();
}

function openCartDrawer(): void {
  isOpen = true;
  drawerEl?.classList.add('open');
  overlayEl?.classList.add('open');
  document.body.style.overflow = 'hidden';
  drawerEl?.querySelector<HTMLElement>('.cart-close-btn')?.focus();
}

function closeCartDrawer(): void {
  isOpen = false;
  drawerEl?.classList.remove('open');
  overlayEl?.classList.remove('open');
  document.body.style.overflow = '';
}
