// ============================================================
// Amazon 2.0 – Live Commerce & Video-Stream Shopping Hub
// ============================================================
import type { AppState, Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { showToast } from './toast';

let liveModal: HTMLElement | null = null;
let chatInterval: ReturnType<typeof setInterval> | null = null;

export function openLiveCommerceModal(state: AppState, onAddToCart: (p: Product) => void): void {
  if (!liveModal) {
    liveModal = document.createElement('div');
    liveModal.id = 'liveCommerceModal';
    liveModal.className = 'modal-overlay';
    document.body.appendChild(liveModal);
  }

  const featuredProd = state.products[0];

  liveModal.innerHTML = `
    <div class="modal-dialog live-commerce-dialog">
      <button class="modal-close" id="closeLiveModal">✕</button>

      <div class="live-stream-header">
        <div class="live-indicator-badge">🔴 LIVE STUDIO</div>
        <div class="live-stream-title">Bestseller Showdown & Exklusive Streams</div>
        <div class="live-viewers-count">👁️ <span id="viewerCount">1.482</span> Zuschauer</div>
      </div>

      <div class="live-stream-layout">
        <!-- Main Video Screen -->
        <div class="video-screen-container">
          <div class="simulated-video-player">
            <img src="${featuredProd.images[0]}" class="stream-bg-image" alt="Live Stream Host" />
            <div class="stream-video-overlay">
              <div class="presenter-tag">🎙️ Host: Alex & Sarah (Live aus Berlin)</div>
              
              <!-- Floating Reactions Canvas Layer -->
              <div class="reactions-particle-container" id="reactionsContainer"></div>

              <!-- Product Overlay Card -->
              <div class="stream-product-overlay">
                <img src="${featuredProd.images[0]}" alt="${featuredProd.title}" />
                <div class="stream-prod-info">
                  <span class="deal-tag-live">🔥 STREAM-DEAL</span>
                  <h4>${featuredProd.title}</h4>
                  <div class="stream-price">${formatPrice(featuredProd.price)}</div>
                </div>
                <button class="btn-primary sm" id="streamBuyBtn">⚡ Jetzt kaufen</button>
              </div>
            </div>
          </div>

          <!-- Stream Reaction Bar -->
          <div class="stream-reaction-bar">
            <span>Reagiere live:</span>
            <button class="reaction-btn" data-emoji="❤️">❤️</button>
            <button class="reaction-btn" data-emoji="🔥">🔥</button>
            <button class="reaction-btn" data-emoji="👏">👏</button>
            <button class="reaction-btn" data-emoji="😮">😮</button>
          </div>
        </div>

        <!-- Live Chat Sidebar -->
        <div class="live-chat-sidebar">
          <h3>💬 Live-Zuschauer Chat</h3>
          <div class="live-chat-feed" id="liveChatFeed">
            <div class="chat-line"><strong style="color:#38bdf8;">Laura_K:</strong> Mega Deal! 😍</div>
            <div class="chat-line"><strong style="color:#f59e0b;">Markus_B:</strong> Ist der Versand auch kostenlos?</div>
            <div class="chat-line"><strong style="color:#00FF88;">Amazon_Host:</strong> @Markus_B Ja, für Prime Mitglieder kostenlos!</div>
          </div>

          <div class="live-chat-input-row">
            <input type="text" id="liveChatInput" placeholder="Sende einen Live-Kommentar..." />
            <button id="sendLiveChatBtn" class="btn-primary sm">➔</button>
          </div>
        </div>
      </div>
    </div>
  `;

  liveModal.classList.add('open');

  const closeModal = () => {
    liveModal?.classList.remove('open');
    if (chatInterval) clearInterval(chatInterval);
  };
  document.getElementById('closeLiveModal')?.addEventListener('click', closeModal);
  liveModal.addEventListener('click', e => { if (e.target === liveModal) closeModal(); });

  // Wiring Stream Buy
  document.getElementById('streamBuyBtn')?.addEventListener('click', () => {
    onAddToCart(featuredProd);
    showToast(`🛒 "${featuredProd.title}" direkt aus dem Live-Stream gekauft!`, 'cart');
  });

  // Wiring Reactions
  liveModal.querySelectorAll('.reaction-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const emoji = btn.getAttribute('data-emoji')!;
      spawnReactionParticle(emoji);
    });
  });

  // Simulated Live Chat Stream
  const feed = document.getElementById('liveChatFeed');
  const sampleComments = [
    { user: 'Stefan_77', text: 'Gerade bestellt! Danke für den Tipp!' },
    { user: 'Julia_M', text: 'Wie lange geht das Angebot noch?' },
    { user: 'TechFan2026', text: 'Das Gerät ist der Wahnsinn 🔥' },
    { user: 'Christian_P', text: 'Kann ich das auch in Silber kaufen?' },
  ];

  chatInterval = setInterval(() => {
    if (!liveModal?.classList.contains('open')) return;
    const item = sampleComments[Math.floor(Math.random() * sampleComments.length)];
    if (feed && item) {
      const div = document.createElement('div');
      div.className = 'chat-line';
      div.innerHTML = `<strong style="color:#38bdf8;">${item.user}:</strong> ${item.text}`;
      feed.appendChild(div);
      feed.scrollTop = feed.scrollHeight;
    }
  }, 3500);

  // User chat send
  const chatInput = document.getElementById('liveChatInput') as HTMLInputElement;
  const sendBtn = document.getElementById('sendLiveChatBtn');

  const sendComment = () => {
    const val = chatInput?.value.trim();
    if (val && feed) {
      const div = document.createElement('div');
      div.className = 'chat-line';
      div.innerHTML = `<strong style="color:#FF9900;">${state.userProfile.name}:</strong> ${val}`;
      feed.appendChild(div);
      feed.scrollTop = feed.scrollHeight;
      chatInput.value = '';
    }
  };

  sendBtn?.addEventListener('click', sendComment);
  chatInput?.addEventListener('keydown', e => { if (e.key === 'Enter') sendComment(); });
}

function spawnReactionParticle(emoji: string): void {
  const container = document.getElementById('reactionsContainer');
  if (!container) return;

  const particle = document.createElement('span');
  particle.className = 'floating-emoji-particle';
  particle.textContent = emoji;
  particle.style.left = `${Math.random() * 80 + 10}%`;
  container.appendChild(particle);

  setTimeout(() => particle.remove(), 1800);
}
