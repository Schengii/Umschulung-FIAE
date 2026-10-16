// ============================================================
// Amazon 2.0 – Interactive AI Price Haggler Component
// ============================================================
import type { AppState, Product, Coupon } from '../types';
import { formatPrice } from '../utils/formatters';
import { showToast } from './toast';
import { writeStorage, KEYS } from '../utils/persist';
import { playSound } from '../utils/audio';

let haggleModal: HTMLElement | null = null;

interface ChatMsg {
  sender: 'bot' | 'user';
  text: string;
}

export function openPriceHagglerModal(state: AppState, product: Product): void {
  if (!haggleModal) {
    haggleModal = document.createElement('div');
    haggleModal.id = 'priceHagglerModal';
    haggleModal.className = 'modal-overlay';
    document.body.appendChild(haggleModal);
  }

  const initialMsgs: ChatMsg[] = [
    {
      sender: 'bot',
      text: `Hallo! 👋 Ich bin Herr Richter vom Händler-Vertrieb. Du interessierst dich für **${product.title}** (UVP ${formatPrice(product.price)}). Welchen fairen Preisvorschlag möchtest du mir machen?`,
    },
  ];

  renderHagglerView(state, product, initialMsgs);
}

function renderHagglerView(state: AppState, product: Product, messages: ChatMsg[]): void {
  if (!haggleModal) return;

  const minSuggested = Math.round(product.price * 0.92);

  haggleModal.innerHTML = `
    <div class="modal-dialog haggle-dialog">
      <button class="modal-close" id="closeHaggleModal">✕</button>
      <div class="haggle-header">
        <div class="vendor-avatar">👨‍💼</div>
        <div class="vendor-info">
          <h3>Händler-Preisverhandlung</h3>
          <span class="vendor-status">🟢 Herr Richter (Autorisierter Händler)</span>
        </div>
      </div>

      <!-- Target Product Mini Card -->
      <div class="haggle-product-bar">
        <img src="${product.images[0]}" alt="${product.title}" />
        <div class="bar-info">
          <p class="bar-title">${product.title}</p>
          <span class="bar-uvp">Aktueller Preis: <strong>${formatPrice(product.price)}</strong></span>
        </div>
      </div>

      <!-- Chat History -->
      <div class="haggle-chat-body" id="haggleChatBody">
        ${messages.map(m => `
          <div class="chat-bubble ${m.sender}">
            <div class="bubble-content">${m.text}</div>
          </div>
        `).join('')}
      </div>

      <!-- Quick Offer Buttons -->
      <div class="quick-offer-chips">
        <button class="quick-offer-btn" data-discount="5">-5% Rabatt (${formatPrice(product.price * 0.95)})</button>
        <button class="quick-offer-btn" data-discount="8">-8% Spar-Angebot (${formatPrice(product.price * 0.92)})</button>
        <button class="quick-offer-btn" data-discount="12">-12% Rabatt (${formatPrice(product.price * 0.88)})</button>
      </div>

      <!-- Input Bar -->
      <div class="haggle-input-bar">
        <input type="number" id="offerPriceInput" placeholder="Dein Wunschpreis in € (z.B. ${minSuggested})" min="1" max="${product.price}" />
        <button class="btn-primary" id="submitOfferBtn">🤝 Angebot abgeben</button>
      </div>
    </div>
  `;

  haggleModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  const closeModal = () => {
    haggleModal?.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.getElementById('closeHaggleModal')?.addEventListener('click', closeModal);
  haggleModal.addEventListener('click', e => { if (e.target === haggleModal) closeModal(); });

  const scrollBottom = () => {
    const body = document.getElementById('haggleChatBody');
    if (body) body.scrollTop = body.scrollHeight;
  };
  scrollBottom();

  // Quick buttons
  haggleModal.querySelectorAll('.quick-offer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const disc = Number(btn.getAttribute('data-discount'));
      const targetPrice = Math.round(product.price * (1 - disc / 100));
      const input = document.getElementById('offerPriceInput') as HTMLInputElement;
      if (input) input.value = String(targetPrice);
      handleOfferSubmit(state, product, targetPrice, messages, closeModal);
    });
  });

  // Custom submit
  document.getElementById('submitOfferBtn')?.addEventListener('click', () => {
    const input = document.getElementById('offerPriceInput') as HTMLInputElement;
    const price = Number(input?.value);
    if (!price || price <= 0) {
      showToast('Bitte gib einen gültigen Preis ein.', 'warning');
      return;
    }
    handleOfferSubmit(state, product, price, messages, closeModal);
  });
}

export function evaluateHaggleOffer(originalPrice: number, offeredPrice: number): {
  accepted: boolean;
  discountPercent: number;
  reply: string;
} {
  const ratio = offeredPrice / originalPrice;
  const discount = Math.round((1 - ratio) * 100);

  if (ratio >= 0.90) {
    // 0 - 10% discount: Accepted!
    return {
      accepted: true,
      discountPercent: Math.max(3, discount),
      reply: `Einverstanden! 🤝 Das ist ein faires Angebot. Ich gebe dir **${discount}% Rabatt** auf dieses Produkt! Der Rabattcode wurde direkt in deinem Konto hinterlegt.`,
    };
  } else if (ratio >= 0.80) {
    // 10 - 20% discount: Counter offer
    const counter = Math.round(originalPrice * 0.92);
    return {
      accepted: false,
      discountPercent: 8,
      reply: `Hmm, das ist mir etwas zu viel Nachlass bei unserer aktuellen Marge. Aber weil du es bist: Wie wäre es mit **${formatPrice(counter)}** (-8% Rabatt)? Klicke unten, um das anzunehmen!`,
    };
  } else {
    // < 80%: Too low
    return {
      accepted: false,
      discountPercent: 0,
      reply: `Puh, ${formatPrice(offeredPrice)} ist leider deutlich unter unserem Einkaufspreis. Ein fairer Rabatt von bis zu 8% ist aber gerne drin!`,
    };
  }
}

function handleOfferSubmit(
  state: AppState,
  product: Product,
  offeredPrice: number,
  messages: ChatMsg[],
  closeModal: () => void
): void {
  messages.push({
    sender: 'user',
    text: `Ich biete ${formatPrice(offeredPrice)} für diesen Artikel.`,
  });

  const outcome = evaluateHaggleOffer(product.price, offeredPrice);

  setTimeout(() => {
    messages.push({
      sender: 'bot',
      text: outcome.reply,
    });

    if (outcome.accepted) {
      const code = `DEAL-${outcome.discountPercent}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      const newCoupon: Coupon = {
        code,
        discount: outcome.discountPercent,
        type: 'percentage',
        description: `${outcome.discountPercent}% Verhandlungs-Rabatt für ${product.title}`,
        expiresAt: Date.now() + 86400000 * 7,
        isActive: true,
      };

      state.activeCoupons.push(newCoupon);
      writeStorage(KEYS.activeCoupons, state.activeCoupons);

      playSound('success');
      showToast(`🎉 Gutschein "${code}" über ${outcome.discountPercent}% Rabatt aktiviert!`, 'success');
      setTimeout(() => closeModal(), 2200);
    } else {
      playSound('alert');
    }

    renderHagglerView(state, product, messages);
  }, 600);
}
