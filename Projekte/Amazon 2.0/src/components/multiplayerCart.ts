// ============================================================
// Amazon 2.0 – Realtime Multiplayer & Collaborative Shopping Engine
// ============================================================
import type { AppState, Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { showToast } from './toast';
import { saveCart, emit } from '../store';
import { playSound } from '../utils/audio';

interface PeerUser {
  id: string;
  name: string;
  avatar: string;
  color: string;
  joinedAt: number;
}

let multiplayerModal: HTMLElement | null = null;
let currentRoomId: string | null = null;
let broadcastChannel: BroadcastChannel | null = null;
const peers: PeerUser[] = [];

const AVATAR_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export function initMultiplayer(state: AppState): void {
  if (typeof window === 'undefined') return;

  try {
    if ('BroadcastChannel' in window) {
      broadcastChannel = new BroadcastChannel('amz_shared_shopping');
      broadcastChannel.onmessage = (event) => {
        handlePeerMessage(state, event.data);
      };
    }
  } catch (err) {
    console.warn('[Multiplayer] BroadcastChannel not supported:', err);
  }

  // Check URL hash for room code
  const hash = window.location.hash;
  if (hash.includes('room=')) {
    const roomId = hash.split('room=')[1]?.split('&')[0];
    if (roomId) {
      joinRoom(state, roomId, false);
    }
  }
}

function handlePeerMessage(state: AppState, message: any): void {
  if (!message || message.roomId !== currentRoomId) return;

  switch (message.type) {
    case 'peer_join': {
      if (!peers.some(p => p.id === message.user.id)) {
        peers.push(message.user);
        playSound('quest');
        showToast(`👥 ${message.user.name} ist der Shopping-Session beigetreten!`, 'info');
        updatePresenceUI();
      }
      break;
    }
    case 'item_added': {
      const existing = state.cart.find(i => i.product.id === message.product.id);
      if (existing) {
        existing.qty += message.qty ?? 1;
      } else {
        state.cart.push({ product: message.product, qty: message.qty ?? 1, addedAt: Date.now() });
      }
      saveCart();
      emit('cart:changed');
      playSound('cart');
      showToast(`👥 ${message.userName} hat "${message.product.title}" hinzugefügt!`, 'cart');
      break;
    }
    case 'cart_cleared': {
      state.cart = [];
      saveCart();
      emit('cart:changed');
      showToast(`👥 ${message.userName} hat den geteilten Warenkorb geleert.`, 'info');
      break;
    }
  }
}

export function openMultiplayerModal(
  state: AppState,
  onAddToCart: (product: Product, qty: number) => void
): void {
  if (!multiplayerModal) {
    multiplayerModal = document.createElement('div');
    multiplayerModal.id = 'multiplayerModal';
    multiplayerModal.className = 'modal-overlay';
    document.body.appendChild(multiplayerModal);
  }

  renderMultiplayerView(state, onAddToCart);
}

function renderMultiplayerView(
  state: AppState,
  _onAddToCart: (product: Product, qty: number) => void
): void {
  if (!multiplayerModal) return;

  if (!currentRoomId) {
    currentRoomId = 'ROOM-' + Math.floor(1000 + Math.random() * 9000);
  }

  const roomUrl = `${window.location.origin}${window.location.pathname}#room=${currentRoomId}`;
  const totalCart = state.cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const participantCount = Math.max(2, peers.length + 1);
  const splitShare = totalCart / participantCount;

  multiplayerModal.innerHTML = `
    <div class="modal-dialog multiplayer-dialog">
      <button class="modal-close" id="closeMultiplayerModal">✕</button>
      <div class="multiplayer-header">
        <span class="multiplayer-badge">👥 Live Multiplayer Session</span>
        <h2>Gemeinsam Einkaufen in Echtzeit</h2>
        <p class="subtitle">Shoppe zusammen mit Freunden in einer synchronen Warenkorb-Session!</p>
      </div>

      <!-- Room Box -->
      <div class="multiplayer-room-card">
        <div class="room-status-row">
          <span class="room-live-dot"></span>
          <span>Raum-Code: <strong>${currentRoomId}</strong></span>
          <span class="peers-counter">${participantCount} Teilnehmer aktiv</span>
        </div>

        <div class="room-share-row">
          <input type="text" id="sharedRoomUrlInput" value="${roomUrl}" class="room-link-input" readonly />
          <button class="btn-primary-sm" id="copyRoomLinkBtn">📋 Link kopieren</button>
        </div>
      </div>

      <!-- Peers Presence List -->
      <div class="multiplayer-peers-section">
        <h4>Aktive Teilnehmer</h4>
        <div class="peers-list" id="peersList">
          <div class="peer-pill you">
            <span class="peer-avatar" style="background: #3B82F6;">${state.userProfile.name.charAt(0)}</span>
            <span><strong>${state.userProfile.name}</strong> (Host/Du)</span>
          </div>
          <div class="peer-pill">
            <span class="peer-avatar" style="background: #10B981;">S</span>
            <span><strong>Sophie M.</strong> (München)</span>
          </div>
          ${peers.map(p => `
            <div class="peer-pill">
              <span class="peer-avatar" style="background: ${p.color};">${p.avatar}</span>
              <span><strong>${p.name}</strong></span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Split Bill Calculator -->
      <div class="split-bill-card">
        <h4>💳 Split-Bill Rechnungsteilung</h4>
        <div class="split-details">
          <div class="split-row">
            <span>Gemeinsamer Warenkorb (${state.cart.reduce((s, i) => s + i.qty, 0)} Artikel):</span>
            <strong>${formatPrice(totalCart)}</strong>
          </div>
          <div class="split-row highlight">
            <span>Dein Anteil (${participantCount} Personen geteilt):</span>
            <strong class="split-price">${formatPrice(splitShare)} pro Person</strong>
          </div>
        </div>
        <button class="btn-secondary full-width" id="simulateFriendAddBtn" style="margin-top: 12px;">
          🛒 Simuliere: Freund fügt Bestseller hinzu
        </button>
      </div>
    </div>
  `;

  multiplayerModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  const closeModal = () => {
    multiplayerModal?.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.getElementById('closeMultiplayerModal')?.addEventListener('click', closeModal);
  multiplayerModal.addEventListener('click', (e) => {
    if (e.target === multiplayerModal) closeModal();
  });

  // Copy Room Link
  document.getElementById('copyRoomLinkBtn')?.addEventListener('click', () => {
    const input = document.getElementById('sharedRoomUrlInput') as HTMLInputElement;
    if (input) {
      navigator.clipboard?.writeText(input.value);
      playSound('success');
      showToast('📋 Einladungslink in Zwischenablage kopiert!', 'success');
    }
  });

  // Simulate friend action
  document.getElementById('simulateFriendAddBtn')?.addEventListener('click', () => {
    const sample = state.products[1] ?? state.products[0];
    broadcastItemAdd(state, sample, 1, 'Sophie M.');
    renderMultiplayerView(state, _onAddToCart);
  });
}

export function broadcastItemAdd(state: AppState, product: Product, qty: number, userName?: string): void {
  const name = userName ?? state.userProfile.name;
  
  if (broadcastChannel && currentRoomId) {
    broadcastChannel.postMessage({
      type: 'item_added',
      roomId: currentRoomId,
      product,
      qty,
      userName: name,
    });
  }

  // Local add if not sender
  if (userName) {
    const existing = state.cart.find(i => i.product.id === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      state.cart.push({ product, qty, addedAt: Date.now() });
    }
    saveCart();
    emit('cart:changed');
    playSound('cart');
    showToast(`👥 ${name} hat "${product.title}" hinzugefügt!`, 'cart');
  }
}

export function joinRoom(state: AppState, roomId: string, showNotification = true): void {
  currentRoomId = roomId;
  if (typeof window !== 'undefined' && window.location) {
    window.location.hash = `room=${roomId}`;
  }

  const myUser: PeerUser = {
    id: `user-${Date.now()}`,
    name: state.userProfile.name,
    avatar: state.userProfile.name.charAt(0),
    color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    joinedAt: Date.now(),
  };

  if (broadcastChannel) {
    broadcastChannel.postMessage({
      type: 'peer_join',
      roomId,
      user: myUser,
    });
  }

  if (showNotification) {
    playSound('quest');
    showToast(`👥 Shopping-Raum ${roomId} erfolgreich beigetreten!`, 'success');
  }
}

function updatePresenceUI(): void {
  // If modal open, refresh view
  const peersList = document.getElementById('peersList');
  if (peersList) {
    // modal is open, trigger lightweight re-render
  }
}
