// ============================================================
// Amazon 2.0 – Virtual Influencer & AI Avatar Live Stream Engine
// ============================================================
import type { AppState, Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { showToast } from './toast';
import { saveCart, emit } from '../store';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

let influencerModal: HTMLElement | null = null;
let isSpeaking = false;

interface LiveChatMsg {
  sender: string;
  avatar: string;
  text: string;
  isHost?: boolean;
}

const liveChatMessages: LiveChatMsg[] = [
  {
    sender: 'Nova (KI-Host)',
    avatar: '🤖',
    text: 'Herzlich willkommen zum Amazon 2.0 Live Shopping Stream! 🌟 Schreibt mir eure Fragen in den Chat!',
    isHost: true,
  },
  {
    sender: 'Marcus_92',
    avatar: '👨‍💻',
    text: 'Wie lange hält der Akku bei den Sony Kopfhörern?',
  },
];

export function openVirtualInfluencerModal(state: AppState): void {
  if (!influencerModal) {
    influencerModal = document.createElement('div');
    influencerModal.id = 'virtualInfluencerModal';
    influencerModal.className = 'modal-overlay';
    document.body.appendChild(influencerModal);
  }

  const featuredProduct = state.products[0];
  renderInfluencerView(state, featuredProduct);
}

function renderInfluencerView(state: AppState, product: Product): void {
  if (!influencerModal) return;

  const discountedPrice = Math.round(product.price * 0.85);

  influencerModal.innerHTML = `
    <div class="modal-dialog influencer-dialog">
      <button class="modal-close" id="closeInfluencerModal">✕</button>
      
      <!-- Live Video / Avatar Stage -->
      <div class="influencer-stage">
        <div class="avatar-viewbox">
          <div class="avatar-character ${isSpeaking ? 'speaking' : ''}" id="avatarCharacter">
            <div class="avatar-head">
              <div class="avatar-eyes">
                <span class="eye left"></span>
                <span class="eye right"></span>
              </div>
              <div class="avatar-mouth"></div>
            </div>
            <div class="avatar-body"></div>
          </div>
          <div class="live-tag-badge">🔴 LIVE STREAM (1.4k Zuschauer)</div>
          <div class="host-name-badge">🎙️ Nova • Virtuelle KI-Moderatorin</div>
        </div>

        <!-- Featured Stream Product HUD -->
        <div class="stream-product-hud">
          <img src="${product.images[0]}" alt="${product.title}" />
          <div class="hud-info">
            <span class="hud-deal-tag">⚡ Live-Stream Deal: -15%</span>
            <p class="hud-title">${product.title}</p>
            <div class="hud-price-row">
              <span class="hud-old-price">${formatPrice(product.price)}</span>
              <strong class="hud-new-price">${formatPrice(discountedPrice)}</strong>
              <button class="btn-primary-sm" id="streamBuyBtn">🛒 Jetzt sichern</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Chat & Q&A Box -->
      <div class="influencer-chat-section">
        <h4>💬 Live-Chat & Frage an Nova stellen</h4>
        <div class="stream-chat-list" id="streamChatList">
          ${liveChatMessages.map(m => `
            <div class="stream-chat-msg ${m.isHost ? 'host' : ''}">
              <span class="chat-sender-avatar">${m.avatar}</span>
              <div class="chat-content">
                <strong>${m.sender}:</strong> ${m.text}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Question Input -->
        <div class="stream-chat-input-bar">
          <input type="text" id="streamQuestionInput" placeholder="Stelle Nova eine Frage zum Produkt..." autocomplete="off" />
          <button class="btn-primary" id="askNovaBtn">Senden</button>
        </div>
      </div>
    </div>
  `;

  influencerModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  const closeModal = () => {
    influencerModal?.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.getElementById('closeInfluencerModal')?.addEventListener('click', closeModal);
  influencerModal.addEventListener('click', e => { if (e.target === influencerModal) closeModal(); });

  const scrollChat = () => {
    const list = document.getElementById('streamChatList');
    if (list) list.scrollTop = list.scrollHeight;
  };
  scrollChat();

  // Buy Stream Deal
  document.getElementById('streamBuyBtn')?.addEventListener('click', () => {
    state.cart.push({ product: { ...product, price: discountedPrice }, qty: 1, addedAt: Date.now() });
    saveCart();
    emit('cart:changed');
    playSound('cart');
    triggerHaptic('success');
    showToast(`🛒 "${product.title}" mit 15% Live-Rabatt in den Warenkorb gelegt!`, 'cart');
  });

  // Ask question
  const submitQuestion = () => {
    const input = document.getElementById('streamQuestionInput') as HTMLInputElement;
    const text = input?.value.trim();
    if (!text) return;
    input.value = '';

    liveChatMessages.push({
      sender: state.userProfile.name,
      avatar: state.userProfile.name.charAt(0),
      text,
    });

    renderInfluencerView(state, product);

    // AI Avatar Response
    setTimeout(() => {
      const response = generateAvatarResponse(text, product);
      liveChatMessages.push({
        sender: 'Nova (KI-Host)',
        avatar: '🤖',
        text: response,
        isHost: true,
      });

      speakText(response);
      renderInfluencerView(state, product);
    }, 800);
  };

  document.getElementById('askNovaBtn')?.addEventListener('click', submitQuestion);
  document.getElementById('streamQuestionInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') submitQuestion();
  });
}

export function generateAvatarResponse(question: string, product: Product): string {
  const q = question.toLowerCase();
  if (q.includes('akku') || q.includes('laufzeit') || q.includes('batterie')) {
    return `Tolle Frage! Bei ${product.title} hält der Akku bis zu 30 Stunden mit aktiviertem Noise Cancelling – und mit nur 3 Minuten Quick-Charge hast du wieder 3 Stunden Wiedergabe! 🔋`;
  } else if (q.includes('rabatt') || q.includes('preis') || q.includes('günstig')) {
    return `Exklusiv in diesem Live-Stream sparst du heute satte 15% auf die UVP! Einfach direkt auf den 'Jetzt sichern' Button klicken! 🎉`;
  } else if (q.includes('sound') || q.includes('klang') || q.includes('bass')) {
    return `Der Klang ist absolut brillant! Kristallklare Höhen, satter Tiefbass und intelligente Raumakustik. Mein persönlicher Top-Favorit des Tages! 🎧`;
  } else {
    return `Vielen Dank für deine Frage! ${product.title} von ${product.brand} bietet erstklassige Premium-Qualität mit 30 Tagen Geld-zurück-Garantie.`;
  }
}

function speakText(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/<[^>]*>?/gm, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'de-DE';
    utterance.rate = 1.05;
    utterance.pitch = 1.1;

    utterance.onstart = () => {
      isSpeaking = true;
      document.getElementById('avatarCharacter')?.classList.add('speaking');
    };

    utterance.onend = () => {
      isSpeaking = false;
      document.getElementById('avatarCharacter')?.classList.remove('speaking');
    };

    window.speechSynthesis.speak(utterance);
  } catch {
    // Ignore speech errors
  }
}
