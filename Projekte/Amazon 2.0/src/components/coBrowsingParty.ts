// ============================================================
// Amazon 2.0 – Live Co-Browsing & Shopping Video-Party
// ============================================================
import type { AppState } from '../types';
import { formatPrice } from '../utils/formatters';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';
import { emit } from '../store';

export interface PartyMember {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isMuted: boolean;
  isVideoOn: boolean;
  cursorX: number;
  cursorY: number;
  selectedColor: string;
}

export interface SharedItemVote {
  productId: string;
  productTitle: string;
  price: number;
  image: string;
  addedBy: string;
  votesUp: number;
  votesDown: number;
}

const DEFAULT_MEMBERS: PartyMember[] = [
  {
    id: 'mem-1',
    name: 'Du (Host)',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
    isHost: true,
    isMuted: false,
    isVideoOn: true,
    cursorX: 50,
    cursorY: 50,
    selectedColor: '#3b82f6',
  },
  {
    id: 'mem-2',
    name: 'Lena M.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120',
    isHost: false,
    isMuted: false,
    isVideoOn: true,
    cursorX: 65,
    cursorY: 30,
    selectedColor: '#ec4899',
  },
  {
    id: 'mem-3',
    name: 'Jonas K.',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120',
    isHost: false,
    isMuted: true,
    isVideoOn: true,
    cursorX: 20,
    cursorY: 70,
    selectedColor: '#10b981',
  },
];

let partyMembers: PartyMember[] = [...DEFAULT_MEMBERS];
let sharedWishlist: SharedItemVote[] = [];
let roomId = 'PARTY-9824';
let partyModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!partyModalEl) {
    partyModalEl = document.createElement('div');
    partyModalEl.id = 'coBrowsingPartyModal';
    partyModalEl.className = 'modal-overlay';
    partyModalEl.setAttribute('role', 'dialog');
    partyModalEl.setAttribute('aria-modal', 'true');
    partyModalEl.setAttribute('aria-label', 'Live Co-Browsing Party');
    document.body.appendChild(partyModalEl);
  }
  return partyModalEl;
}

export function openCoBrowsingPartyModal(state: AppState): void {
  const modal = getModal();
  // Init sample items if empty
  if (sharedWishlist.length === 0 && state.products.length >= 2) {
    sharedWishlist.push({
      productId: state.products[0].id,
      productTitle: state.products[0].title,
      price: state.products[0].price,
      image: state.products[0].images[0],
      addedBy: 'Lena M.',
      votesUp: 2,
      votesDown: 0,
    });
    sharedWishlist.push({
      productId: state.products[1].id,
      productTitle: state.products[1].title,
      price: state.products[1].price,
      image: state.products[1].images[0],
      addedBy: 'Du (Host)',
      votesUp: 1,
      votesDown: 0,
    });
  }

  renderPartyUI(state);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeCoBrowsingPartyModal(): void {
  if (partyModalEl) {
    partyModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderPartyUI(state: AppState): void {
  const modal = getModal();
  const partyTotal = sharedWishlist.reduce((sum, item) => sum + item.price, 0);
  const splitPerPerson = partyTotal / Math.max(1, partyMembers.length);

  modal.innerHTML = `
    <div class="modal-dialog party-dialog">
      <button class="modal-close" id="closePartyBtn" aria-label="Schließen">✕</button>

      <div class="party-header">
        <div class="party-badge">🔴 LIVE WEBRTC CO-BROWSING</div>
        <h2>Shopping Video-Party & Shared Screen</h2>
        <div class="party-code-box">
          <span>Raum-Code: <strong>${roomId}</strong></span>
          <button class="btn-copy-code" id="copyPartyCodeBtn">📋 Link kopieren</button>
        </div>
      </div>

      <!-- WebRTC Video Avatars Bar -->
      <div class="party-video-grid">
        ${partyMembers.map(m => `
          <div class="member-video-card" style="border-color: ${m.selectedColor}">
            <img src="${m.avatar}" alt="${m.name}" class="member-video-avatar" />
            <div class="member-audio-pulse ${!m.isMuted ? 'speaking' : ''}"></div>
            <div class="member-tag">
              <span>${m.name}</span>
              <span>${m.isMuted ? '🔇' : '🎙️'}</span>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="party-content-split">
        <!-- Left: Shared Voting Wishlist -->
        <div class="party-wishlist-panel">
          <h3>Gemeinsamer Abstimmungs-Warenkorb (${sharedWishlist.length})</h3>
          
          <div class="shared-items-list">
            ${sharedWishlist.map(item => `
              <div class="shared-item-card">
                <img src="${item.image}" alt="${item.productTitle}" class="shared-item-img" />
                <div class="shared-item-info">
                  <h4>${item.productTitle}</h4>
                  <div class="shared-item-price">${formatPrice(item.price)}</div>
                  <span class="shared-added-by">Vorgeschlagen von ${item.addedBy}</span>
                </div>
                
                <!-- Voting Controls -->
                <div class="shared-voting-box">
                  <button class="btn-vote-up" data-prod-id="${item.productId}">👍 ${item.votesUp}</button>
                  <button class="btn-vote-down" data-prod-id="${item.productId}">👎 ${item.votesDown}</button>
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Add Product to Party Form -->
          <div class="add-party-item-row">
            <select id="partyProductSelect" class="filter-select" style="flex: 1;">
              ${state.products.map(p => `<option value="${p.id}">${p.title} (${formatPrice(p.price)})</option>`).join('')}
            </select>
            <button class="btn-secondary" id="addProdToPartyBtn">+ Vorschlagen</button>
          </div>
        </div>

        <!-- Right: Split Checkout & Party Controls -->
        <div class="party-checkout-panel">
          <h3>Party-Abrechnung (Split-Pay)</h3>
          
          <div class="split-bill-card">
            <div class="split-row">
              <span>Gesamtsumme:</span>
              <strong>${formatPrice(partyTotal)}</strong>
            </div>
            <div class="split-row">
              <span>Teilnehmer:</span>
              <span>${partyMembers.length} Freunde</span>
            </div>
            <div class="split-row highlight">
              <span>Dein Anteil:</span>
              <strong style="color: #10b981; font-size: 16px;">${formatPrice(splitPerPerson)}</strong>
            </div>
          </div>

          <div class="party-chat-mini">
            <div class="chat-bubbles-feed">
              <div class="chat-msg"><strong>Lena:</strong> Das Headset sieht mega aus! 😍</div>
              <div class="chat-msg"><strong>Jonas:</strong> Ich stimme mit Ja ab 👍</div>
            </div>
            <div class="chat-input-row">
              <input type="text" id="partyChatInput" class="form-input" placeholder="Nachricht an Freunde..." />
              <button id="sendPartyMsgBtn" class="btn-primary-sm">Senden</button>
            </div>
          </div>

          <button class="btn-primary party-checkout-btn" id="executePartyCheckoutBtn">
            🛒 Meinen Anteil (${formatPrice(splitPerPerson)}) jetzt zahlen
          </button>
        </div>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closePartyBtn')?.addEventListener('click', closeCoBrowsingPartyModal);

  // Copy Code
  document.getElementById('copyPartyCodeBtn')?.addEventListener('click', () => {
    navigator.clipboard?.writeText(window.location.origin + window.location.pathname + `#party=${roomId}`);
    playSound('click');
    triggerHaptic('light');
    showToast(`📋 Einladungslink für ${roomId} kopiert!`, 'success');
  });

  // Vote Up / Down
  modal.querySelectorAll('.btn-vote-up').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const prodId = (e.currentTarget as HTMLElement).getAttribute('data-prod-id');
      const item = sharedWishlist.find(i => i.productId === prodId);
      if (item) {
        item.votesUp++;
        playSound('quest');
        triggerHaptic('light');
        renderPartyUI(state);
      }
    });
  });

  modal.querySelectorAll('.btn-vote-down').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const prodId = (e.currentTarget as HTMLElement).getAttribute('data-prod-id');
      const item = sharedWishlist.find(i => i.productId === prodId);
      if (item) {
        item.votesDown++;
        playSound('click');
        triggerHaptic('light');
        renderPartyUI(state);
      }
    });
  });

  // Suggest product
  document.getElementById('addProdToPartyBtn')?.addEventListener('click', () => {
    const prodId = (document.getElementById('partyProductSelect') as HTMLSelectElement).value;
    const prod = state.products.find(p => p.id === prodId);
    if (prod) {
      sharedWishlist.push({
        productId: prod.id,
        productTitle: prod.title,
        price: prod.price,
        image: prod.images[0],
        addedBy: 'Du (Host)',
        votesUp: 1,
        votesDown: 0,
      });
      playSound('success');
      triggerHaptic('medium');
      showToast(`🎉 „${prod.title}“ zur Party-Liste hinzugefügt!`, 'success');
      renderPartyUI(state);
    }
  });

  // Party Checkout
  document.getElementById('executePartyCheckoutBtn')?.addEventListener('click', () => {
    // Add all upvoted items to real cart
    sharedWishlist.forEach(item => {
      const prod = state.products.find(p => p.id === item.productId) || state.products[0];
      const existing = state.cart.find(c => c.product.id === prod.id);
      if (existing) existing.qty += 1;
      else state.cart.push({ product: prod, qty: 1, addedAt: Date.now() });
    });

    emit('cart:changed');
    playSound('checkout');
    triggerHaptic('heavy');
    showToast(`🎉 Party-Bestellung aufgegeben! Dein Anteil von ${formatPrice(splitPerPerson)} wurde verbucht.`, 'success');
    closeCoBrowsingPartyModal();
  });
}
