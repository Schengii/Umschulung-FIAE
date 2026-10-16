// ============================================================
// Amazon 2.0 – Video Shorts & Live Unboxing Studio
// ============================================================
import type { AppState } from '../types';
import { formatPrice, sanitizeHtml } from '../utils/formatters';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';
import { emit } from '../store';

export interface VideoShort {
  id: string;
  productId: string;
  productTitle: string;
  productPrice: number;
  productImage: string;
  creatorName: string;
  creatorAvatar: string;
  caption: string;
  tags: string[];
  likes: number;
  isLiked?: boolean;
  commentsCount: number;
  views: string;
  videoDuration: number;
  gradientBackground: string;
  verifiedBuyer: boolean;
}

const DEFAULT_SHORTS: VideoShort[] = [
  {
    id: 'short-1',
    productId: 'prod-1',
    productTitle: 'Apple iPhone 15 Pro Max',
    productPrice: 1299.99,
    productImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
    creatorName: 'TechLover_Alex',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    caption: 'Titan-Gehäuse im echten Härtetest! Die Kamera bei Low-Light ist der Wahnsinn 🔥📱',
    tags: ['#Unboxing', '#Apple', '#iPhone15Pro', '#CameraTest'],
    likes: 1420,
    commentsCount: 89,
    views: '24.5k',
    videoDuration: 18,
    gradientBackground: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
    verifiedBuyer: true,
  },
  {
    id: 'short-2',
    productId: 'prod-2',
    productTitle: 'Sony WH-1000XM5 Noise Cancelling',
    productPrice: 299.99,
    productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    creatorName: 'SoundNinja_Sarah',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    caption: 'ANC im lauten Berliner Café getestet – man hört buchstäblich gar nichts mehr! 🎧✨',
    tags: ['#SonyAudio', '#NoiseCancelling', '#DailyDriver'],
    likes: 980,
    commentsCount: 45,
    views: '18.2k',
    videoDuration: 22,
    gradientBackground: 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)',
    verifiedBuyer: true,
  },
  {
    id: 'short-3',
    productId: 'prod-4',
    productTitle: 'Samsung Odyssey Neo G9 Gaming Monitor',
    productPrice: 1199.99,
    productImage: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80',
    creatorName: 'GamerMax99',
    creatorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    caption: '49 Zoll Curved Setup fertiggestellt! 240Hz fühlen sich wie eine andere Welt an 🚀🎮',
    tags: ['#Battlestation', '#GamingSetup', '#49InchCurved'],
    likes: 2130,
    commentsCount: 162,
    views: '42.8k',
    videoDuration: 25,
    gradientBackground: 'linear-gradient(135deg, #4c0519 0%, #881337 50%, #9f1239 100%)',
    verifiedBuyer: true,
  },
];

let shortsState: VideoShort[] = [...DEFAULT_SHORTS];
let currentIndex = 0;
let shortsModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!shortsModalEl) {
    shortsModalEl = document.createElement('div');
    shortsModalEl.id = 'videoShortsModal';
    shortsModalEl.className = 'modal-overlay shorts-overlay';
    shortsModalEl.setAttribute('role', 'dialog');
    shortsModalEl.setAttribute('aria-modal', 'true');
    shortsModalEl.setAttribute('aria-label', 'Video Shorts & Unboxings');
    document.body.appendChild(shortsModalEl);
  }
  return shortsModalEl;
}

export function openVideoShortsModal(state: AppState, targetProductId?: string): void {
  const modal = getModal();
  if (targetProductId) {
    const idx = shortsState.findIndex(s => s.productId === targetProductId);
    if (idx !== -1) currentIndex = idx;
  }

  renderShortsViewer(state);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeVideoShortsModal(): void {
  if (shortsModalEl) {
    shortsModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderShortsViewer(state: AppState): void {
  const modal = getModal();
  const short = shortsState[currentIndex];

  modal.innerHTML = `
    <div class="shorts-container">
      <button class="shorts-close-btn" id="closeShortsBtn" aria-label="Schließen">✕</button>

      <!-- Main Video Simulation Area -->
      <div class="shorts-video-viewport" style="background: ${short.gradientBackground};">
        <div class="shorts-animated-backdrop">
          <div class="shorts-product-hero-preview">
            <img src="${short.productImage}" alt="${short.productTitle}" class="shorts-hero-img" />
          </div>
          <div class="shorts-audio-wave">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
        </div>

        <!-- Video Header -->
        <div class="shorts-top-bar">
          <div class="shorts-live-pill">🔴 UNBOXING REEL</div>
          <div class="shorts-view-count">👁️ ${short.views} Aufrufe</div>
        </div>

        <!-- Right Side Action Rail (Likes, Comments, Share, Cart) -->
        <div class="shorts-actions-rail">
          <button class="rail-btn ${short.isLiked ? 'liked' : ''}" id="shortLikeBtn" aria-label="Gefällt mir">
            <span class="rail-icon">${short.isLiked ? '❤️' : '🤍'}</span>
            <span class="rail-count" id="shortLikeCount">${short.likes}</span>
          </button>
          <button class="rail-btn" id="shortCommentBtn" aria-label="Kommentare">
            <span class="rail-icon">💬</span>
            <span class="rail-count">${short.commentsCount}</span>
          </button>
          <button class="rail-btn" id="shortShareBtn" aria-label="Teilen">
            <span class="rail-icon">↗️</span>
            <span class="rail-count">Teilen</span>
          </button>
          <button class="rail-btn upload-new-short-btn" id="openUploadShortBtn" title="Eigenes Video posten">
            <span class="rail-icon">➕</span>
            <span class="rail-count">Neu</span>
          </button>
        </div>

        <!-- Navigation Controls (Up / Down Reels) -->
        <div class="shorts-nav-arrows">
          <button class="shorts-arrow-btn" id="shortPrevBtn" ${currentIndex === 0 ? 'disabled' : ''} aria-label="Vorheriges Video">▲</button>
          <button class="shorts-arrow-btn" id="shortNextBtn" ${currentIndex === shortsState.length - 1 ? 'disabled' : ''} aria-label="Nächstes Video">▼</button>
        </div>

        <!-- Bottom Overlay: Creator info, caption & Pinned Buy Card -->
        <div class="shorts-bottom-overlay">
          <div class="shorts-creator-row">
            <img src="${short.creatorAvatar}" alt="${short.creatorName}" class="shorts-avatar" />
            <div class="shorts-creator-meta">
              <span class="creator-name">${short.creatorName}</span>
              ${short.verifiedBuyer ? '<span class="verified-badge">✓ Verifizierter Kauf</span>' : ''}
            </div>
            <button class="btn-follow-creator" id="followCreatorBtn">Folgen</button>
          </div>

          <p class="shorts-caption-text">${sanitizeHtml(short.caption)}</p>
          <div class="shorts-tags-row">
            ${short.tags.map(t => `<span class="shorts-tag-pill">${t}</span>`).join('')}
          </div>

          <!-- Pinned Product Purchase Card -->
          <div class="shorts-pinned-product-card">
            <img src="${short.productImage}" alt="${short.productTitle}" class="pinned-prod-img" />
            <div class="pinned-prod-info">
              <h4 class="pinned-prod-title">${short.productTitle}</h4>
              <div class="pinned-prod-price">${formatPrice(short.productPrice)}</div>
            </div>
            <button class="btn-primary-sm btn-shorts-buy" id="shortsBuyNowBtn" data-prod-id="${short.productId}">
              🛒 In den Warenkorb
            </button>
          </div>

          <!-- Progress Bar -->
          <div class="shorts-progress-track">
            <div class="shorts-progress-fill" style="animation-duration: ${short.videoDuration}s;"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Event Listeners
  document.getElementById('closeShortsBtn')?.addEventListener('click', closeVideoShortsModal);

  // Like Button
  document.getElementById('shortLikeBtn')?.addEventListener('click', () => {
    short.isLiked = !short.isLiked;
    short.likes += short.isLiked ? 1 : -1;
    triggerHaptic('light');
    playSound('success');
    renderShortsViewer(state);
  });

  // Prev / Next Shorts
  document.getElementById('shortPrevBtn')?.addEventListener('click', () => {
    if (currentIndex > 0) {
      currentIndex--;
      playSound('click');
      renderShortsViewer(state);
    }
  });

  document.getElementById('shortNextBtn')?.addEventListener('click', () => {
    if (currentIndex < shortsState.length - 1) {
      currentIndex++;
      playSound('click');
      renderShortsViewer(state);
    }
  });

  // Share
  document.getElementById('shortShareBtn')?.addEventListener('click', () => {
    playSound('click');
    navigator.clipboard?.writeText(window.location.href);
    showToast('🔗 Link zum Unboxing-Short in die Zwischenablage kopiert!', 'success');
  });

  // Follow
  document.getElementById('followCreatorBtn')?.addEventListener('click', (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    btn.textContent = 'Gefolgt ✓';
    btn.classList.add('followed');
    playSound('quest');
    showToast(`⭐ Du folgst jetzt ${short.creatorName}!`, 'info');
  });

  // Add Product to Cart from Short
  document.getElementById('shortsBuyNowBtn')?.addEventListener('click', () => {
    const prod = state.products.find(p => p.id === short.productId);
    if (prod) {
      const existing = state.cart.find(c => c.product.id === prod.id);
      if (existing) existing.qty += 1;
      else state.cart.push({ product: prod, qty: 1, addedAt: Date.now() });
      emit('cart:changed');
      triggerHaptic('medium');
      playSound('cart');
      showToast(`🛒 „${prod.title}“ aus dem Video in den Warenkorb gelegt!`, 'success');
    }
  });

  // Upload new Short modal launcher
  document.getElementById('openUploadShortBtn')?.addEventListener('click', () => {
    openUploadShortDialog(state);
  });
}

function openUploadShortDialog(state: AppState): void {
  const dialog = document.createElement('div');
  dialog.className = 'modal-overlay';
  dialog.innerHTML = `
    <div class="modal-dialog upload-short-dialog">
      <button class="modal-close" id="closeUploadDialog">✕</button>
      <div class="upload-header">
        <span class="upload-icon">📹</span>
        <h2>Neues Unboxing / Review-Short erstellen</h2>
        <p class="upload-sub">Lade ein kurzes Produktvideo hoch oder simuliere eine Aufnahme mit deiner Kamera.</p>
      </div>

      <form id="uploadShortForm" class="upload-short-form">
        <div class="form-group">
          <label for="shortProductSelect">Zugehöriges Produkt wählen *</label>
          <select id="shortProductSelect" class="filter-select" required>
            ${state.products.map(p => `<option value="${p.id}">${p.title} (${formatPrice(p.price)})</option>`).join('')}
          </select>
        </div>

        <div class="form-group">
          <label for="shortCaption">Deine Video-Beschreibung / Fazit *</label>
          <textarea id="shortCaption" class="form-input" rows="3" placeholder="Wie war dein Unboxing? Was sind die Highlights?" required></textarea>
        </div>

        <div class="form-group">
          <label for="shortTags">Hashtags (mit Komma getrennt)</label>
          <input type="text" id="shortTags" class="form-input" placeholder="#Unboxing, #Review, #MustHave" />
        </div>

        <div class="camera-preview-box">
          <div class="camera-lens-sim">🔴 Kamera-Aufnahme Simulation bereit (HD 1080p)</div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn-primary" id="publishShortBtn">🚀 Video-Short veröffentlichen</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(dialog);
  dialog.classList.add('open');

  const close = () => { dialog.remove(); };
  dialog.querySelector('#closeUploadDialog')?.addEventListener('click', close);

  dialog.querySelector('#uploadShortForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const prodId = (dialog.querySelector('#shortProductSelect') as HTMLSelectElement).value;
    const caption = (dialog.querySelector('#shortCaption') as HTMLTextAreaElement).value.trim();
    const rawTags = (dialog.querySelector('#shortTags') as HTMLInputElement).value.trim();
    const prod = state.products.find(p => p.id === prodId)!;

    const newShort: VideoShort = {
      id: `short-user-${Date.now()}`,
      productId: prod.id,
      productTitle: prod.title,
      productPrice: prod.price,
      productImage: prod.images[0] || 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600',
      creatorName: state.userProfile.name || 'Amazon Kunde',
      creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120',
      caption,
      tags: rawTags ? rawTags.split(',').map(t => t.trim().startsWith('#') ? t.trim() : `#${t.trim()}`) : ['#Unboxing', '#CommunityReview'],
      likes: 1,
      isLiked: true,
      commentsCount: 0,
      views: '1',
      videoDuration: 20,
      gradientBackground: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)',
      verifiedBuyer: true,
    };

    shortsState.unshift(newShort);
    currentIndex = 0;
    close();
    playSound('quest');
    showToast('🎉 Dein Unboxing-Short wurde erfolgreich veröffentlicht!', 'success');
    renderShortsViewer(state);
  });
}
