// ============================================================
// Amazon 2.0 – Header & Navigation Component
// ============================================================
import type { AppState } from '../types';
import { CATEGORIES } from '../data/heroSlides';
import { debounce } from '../utils/formatters';

interface HeaderCallbacks {
  onSearch: (query: string) => void;
  onCategoryChange: (catId: string) => void;
  onCartClick: () => void;
  onOrdersClick: () => void;
  onWishlistClick: () => void;
  onProfileClick: () => void;
  onCouponsClick: () => void;
  onThemeToggle: () => void;
  onNotificationsClick: () => void;
  onGiftCardsClick: () => void;
}

export function initHeader(state: AppState, callbacks: HeaderCallbacks): void {
  const header = document.getElementById('mainHeader');
  if (!header) return;

  header.innerHTML = `
    <nav class="header-top" role="banner">
      <div class="header-logo">
        <a href="#" id="logoLink" aria-label="Amazon 2.0 Startseite">
          <span class="logo-text">amazon<span class="logo-prime">2.0</span></span>
        </a>
      </div>

      <div class="header-search" role="search">
        <select id="searchCategorySelect" class="search-cat-select" aria-label="Kategorie auswählen">
          ${CATEGORIES.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('')}
        </select>
        <input
          type="search"
          id="searchInput"
          class="search-input"
          placeholder="Suche bei Amazon 2.0..."
          aria-label="Produktsuche"
          autocomplete="off"
        />
        <button id="voiceSearchBtn" class="search-action-btn" aria-label="Sprachsuche" title="🎙️ Sprachsuche starten">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
        <button id="visualSearchBtn" class="search-action-btn" aria-label="Visuelle Bildsuche" title="📷 Foto- / Bildsuche">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>
        <button id="searchBtn" class="search-btn" aria-label="Suchen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
        </button>
      </div>

      <div class="header-actions">
        <select id="langSelect" class="header-select-sm" aria-label="Sprache wählen">
          <option value="de" ${(state.language ?? 'de') === 'de' ? 'selected' : ''}>🇩🇪 DE</option>
          <option value="en" ${state.language === 'en' ? 'selected' : ''}>🇬🇧 EN</option>
          <option value="fr" ${state.language === 'fr' ? 'selected' : ''}>🇫🇷 FR</option>
          <option value="es" ${state.language === 'es' ? 'selected' : ''}>🇪🇸 ES</option>
        </select>
        <select id="currencySelect" class="header-select-sm" aria-label="Währung wählen">
          <option value="EUR" ${(state.currency ?? 'EUR') === 'EUR' ? 'selected' : ''}>€ EUR</option>
          <option value="USD" ${state.currency === 'USD' ? 'selected' : ''}>$ USD</option>
          <option value="GBP" ${state.currency === 'GBP' ? 'selected' : ''}>£ GBP</option>
          <option value="CHF" ${state.currency === 'CHF' ? 'selected' : ''}>CHF</option>
        </select>
        <button id="themeToggleBtn" class="header-btn icon-btn" aria-label="Design wechseln" title="Hell/Dunkel">
          <span class="theme-icon">🌙</span>
        </button>
        <button id="notificationsBtn" class="header-btn icon-btn" aria-label="Benachrichtigungen">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span id="notifBadge" class="badge hidden">0</span>
        </button>
        <button id="giftCardBtn" class="header-btn" aria-label="Guthabenkonto">
          <span class="balance-label" id="balanceDisplay">🎁 0,00€</span>
        </button>
        <button id="profileBtn" class="header-btn" aria-label="Mein Konto">
          <div class="avatar-sm" id="headerAvatar">M</div>
          <span class="header-btn-text" id="profileLabel">Hallo, Anmelden</span>
        </button>
        <button id="ordersBtn" class="header-btn" aria-label="Meine Bestellungen">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="2"/>
            <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
          </svg>
          <span class="header-btn-text">Bestellungen</span>
        </button>
        <button id="wishlistBtn" class="header-btn" aria-label="Wunschliste">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span id="wishlistBadge" class="badge hidden">0</span>
        </button>
        <button id="couponsBtn" class="header-btn" aria-label="Gutscheine">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
          <span class="header-btn-text">Gutscheine</span>
        </button>
        <button id="cartBtn" class="header-btn cart-btn" aria-label="Warenkorb">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <span id="cartBadge" class="badge">0</span>
        </button>
      </div>
    </nav>

    <nav class="header-bottom" aria-label="Kategorienavigation">
      <button id="rewardsNavBtn" class="nav-link highlight-nav">🎮 Quests & Rewards</button>
      <button id="matrixNavBtn" class="nav-link highlight-nav">📊 KI Spec-Matrix</button>
      <button id="store3dNavBtn" class="nav-link highlight-nav">🛍️ 3D-Showroom</button>
      <button id="auctionsNavBtn" class="nav-link highlight-nav">⚡ Live-Auktionen</button>
      <button id="liveCommerceNavBtn" class="nav-link live-nav">🔴 Live-Stream</button>
      <button id="sellerNavBtn" class="nav-link">🏪 Marketplace</button>
      <button id="primeNavBtn" class="nav-link prime-nav">⭐ Prime</button>
      ${CATEGORIES.filter(c => c.id !== 'all').map(c =>
        `<button class="nav-link cat-nav-btn" data-cat="${c.id}">${c.icon} ${c.label}</button>`
      ).join('')}
      <button id="commandPaletteBtn" class="nav-link" aria-keyshortcuts="Control+K">
        🔍 Ctrl+K Schnellsuche
      </button>
    </nav>
  `;

  // ── Wiring ────────────────────────────────────────────────
  // Logo
  document.getElementById('logoLink')?.addEventListener('click', e => {
    e.preventDefault();
    callbacks.onSearch('');
    callbacks.onCategoryChange('all');
    document.getElementById('searchInput')?.setAttribute('value', '');
    (document.getElementById('searchCategorySelect') as HTMLSelectElement).value = 'all';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Search
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  const searchBtn = document.getElementById('searchBtn');
  const catSelect = document.getElementById('searchCategorySelect') as HTMLSelectElement;

  const debouncedSearch = debounce((query: string) => callbacks.onSearch(query), 300);

  searchInput?.addEventListener('input', () => debouncedSearch(searchInput.value.trim()));
  searchBtn?.addEventListener('click', () => callbacks.onSearch(searchInput.value.trim()));
  searchInput?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') callbacks.onSearch(searchInput.value.trim());
  });

  catSelect?.addEventListener('change', () => callbacks.onCategoryChange(catSelect.value));

  // Bottom nav category buttons
  document.querySelectorAll('.cat-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-cat') ?? 'all';
      catSelect.value = cat;
      callbacks.onCategoryChange(cat);
      document.getElementById('catalogSection')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Language & Currency Selectors
  const langSelect = document.getElementById('langSelect') as HTMLSelectElement;
  const currSelect = document.getElementById('currencySelect') as HTMLSelectElement;

  langSelect?.addEventListener('change', () => {
    state.language = langSelect.value as any;
    import('../store').then(({ emit }) => emit('products:render'));
    import('./toast').then(({ showToast }) => showToast(`🌐 Sprache geändert: ${langSelect.value.toUpperCase()}`, 'info'));
  });

  currSelect?.addEventListener('change', () => {
    state.currency = currSelect.value as any;
    import('../store').then(({ emit }) => emit('products:render'));
    import('./toast').then(({ showToast }) => showToast(`💱 Währung geändert: ${currSelect.value}`, 'info'));
  });

  // Action buttons
  document.getElementById('cartBtn')?.addEventListener('click', callbacks.onCartClick);
  document.getElementById('ordersBtn')?.addEventListener('click', callbacks.onOrdersClick);
  document.getElementById('wishlistBtn')?.addEventListener('click', callbacks.onWishlistClick);
  document.getElementById('profileBtn')?.addEventListener('click', callbacks.onProfileClick);
  document.getElementById('couponsBtn')?.addEventListener('click', callbacks.onCouponsClick);
  document.getElementById('themeToggleBtn')?.addEventListener('click', callbacks.onThemeToggle);
  document.getElementById('notificationsBtn')?.addEventListener('click', callbacks.onNotificationsClick);
  document.getElementById('giftCardBtn')?.addEventListener('click', callbacks.onGiftCardsClick);

  // 🎙️ Voice Search Wiring
  const voiceBtn = document.getElementById('voiceSearchBtn');
  voiceBtn?.addEventListener('click', () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = 'de-DE';
        voiceBtn.classList.add('recording');
        import('./toast').then(({ showToast }) => showToast('🎙️ Sprachsuche aktiv: Sprich jetzt...', 'info'));

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (searchInput) searchInput.value = transcript;
          callbacks.onSearch(transcript);
          import('./toast').then(({ showToast }) => showToast(`🔍 Gesucht nach: "${transcript}"`, 'success'));
        };

        recognition.onerror = () => {
          voiceBtn.classList.remove('recording');
          import('./toast').then(({ showToast }) => showToast('Sprachsuche nicht erkannt. Versuche den Simulator!', 'warning'));
          openVoiceSimulatorModal(searchInput, callbacks.onSearch);
        };

        recognition.onend = () => {
          voiceBtn.classList.remove('recording');
        };

        recognition.start();
      } catch {
        openVoiceSimulatorModal(searchInput, callbacks.onSearch);
      }
    } else {
      openVoiceSimulatorModal(searchInput, callbacks.onSearch);
    }
  });

  // 📷 Visual Search Wiring
  document.getElementById('visualSearchBtn')?.addEventListener('click', () => {
    openVisualSearchModal(searchInput, callbacks.onSearch);
  });

  // Initial UI update
  updateHeaderUI(state);
}

// ── Voice Search Simulator Modal ──────────────────────────────
function openVoiceSimulatorModal(
  searchInput: HTMLInputElement | null,
  onSearch: (q: string) => void
): void {
  let modal = document.getElementById('voiceSearchModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'voiceSearchModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const voicePresets = ['Wireless Kopfhörer', 'Smartwatch', 'Gaming Laptop', 'Kaffeemaschine', 'Ergonomischer Stuhl'];

  modal.innerHTML = `
    <div class="modal-dialog voice-modal-dialog">
      <button class="modal-close" id="closeVoiceModal">✕</button>
      <div class="voice-wave-container">
        <div class="mic-pulse-ring"></div>
        <div class="mic-icon-lg">🎙️</div>
      </div>
      <h2>Sprachsuche Simulator</h2>
      <p class="subtitle">Wähle einen gesprochenen Befehl oder sprich frei:</p>
      <div class="voice-presets">
        ${voicePresets.map(preset => `<button class="voice-preset-btn" data-query="${preset}">"🔍 ${preset}"</button>`).join('')}
      </div>
    </div>
  `;

  modal.classList.add('open');

  const closeModal = () => modal?.classList.remove('open');
  document.getElementById('closeVoiceModal')?.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  modal.querySelectorAll('.voice-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-query')!;
      if (searchInput) searchInput.value = q;
      onSearch(q);
      closeModal();
      import('./toast').then(({ showToast }) => showToast(`🎙️ Sprachsuche: "${q}"`, 'success'));
    });
  });
}

// ── Visual Image Search Modal ─────────────────────────────────
function openVisualSearchModal(
  searchInput: HTMLInputElement | null,
  onSearch: (q: string) => void
): void {
  let modal = document.getElementById('visualSearchModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'visualSearchModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  const samples = [
    { title: 'Kopfhörer', query: 'Kopfhörer', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&auto=format&fit=crop' },
    { title: 'Smartwatch', query: 'Smartwatch', img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format&fit=crop' },
    { title: 'Laptop', query: 'Laptop', img: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200&auto=format&fit=crop' },
    { title: 'Kamera', query: 'Kamera', img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=200&auto=format&fit=crop' },
  ];

  modal.innerHTML = `
    <div class="modal-dialog visual-search-dialog">
      <button class="modal-close" id="closeVisualModal">✕</button>
      <h2>📷 KI-Bildsuche & Foto-Scanner</h2>
      <p class="subtitle">Ziehe ein Produktfoto hierher oder wähle ein Beispielprodukt zur Analyse:</p>

      <div class="visual-dropzone" id="visualDropzone">
        <div class="dropzone-icon">📸</div>
        <p><strong>Bild hier ablegen</strong> oder Datei hochladen</p>
        <input type="file" id="visualFileInput" accept="image/*" class="hidden" />
        <button class="btn-secondary sm" id="browseImageBtn">Datei wählen</button>
      </div>

      <div class="visual-scanner-preview hidden" id="scannerPreview">
        <div class="scanner-image-wrapper">
          <img id="scannedImg" src="" alt="Scanner Vorschau" />
          <div class="laser-scanner-line"></div>
          <div class="scanner-badge">🤖 KI analysiert Objekte...</div>
        </div>
      </div>

      <h3>Oder mit Beispiel-Fotos testen:</h3>
      <div class="visual-samples-grid">
        ${samples.map(s => `
          <div class="visual-sample-card" data-query="${s.query}" data-img="${s.img}">
            <img src="${s.img}" alt="${s.title}" />
            <span>${s.title}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  modal.classList.add('open');

  const closeModal = () => modal?.classList.remove('open');
  document.getElementById('closeVisualModal')?.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  const dropzone = document.getElementById('visualDropzone');
  const fileInput = document.getElementById('visualFileInput') as HTMLInputElement;
  const browseBtn = document.getElementById('browseImageBtn');
  const preview = document.getElementById('scannerPreview');
  const scannedImg = document.getElementById('scannedImg') as HTMLImageElement;

  browseBtn?.addEventListener('click', () => fileInput.click());

  fileInput?.addEventListener('change', () => {
    if (fileInput.files?.[0]) {
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        runScannerAnimation(e.target?.result as string, 'Elektronik');
      };
      reader.readAsDataURL(file);
    }
  });

  modal.querySelectorAll('.visual-sample-card').forEach(card => {
    card.addEventListener('click', () => {
      const q = card.getAttribute('data-query')!;
      const img = card.getAttribute('data-img')!;
      runScannerAnimation(img, q);
    });
  });

  function runScannerAnimation(imgSrc: string, query: string): void {
    if (dropzone) dropzone.classList.add('hidden');
    if (preview) preview.classList.remove('hidden');
    if (scannedImg) scannedImg.src = imgSrc;

    setTimeout(() => {
      if (searchInput) searchInput.value = query;
      onSearch(query);
      closeModal();
      import('./toast').then(({ showToast }) => showToast(`📸 Bildsuche Treffer: "${query}"`, 'success'));
    }, 1400);
  }
}

export function updateHeaderUI(state: AppState): void {
  // Cart badge
  const cartTotal = state.cart.reduce((sum, i) => sum + i.qty, 0);
  const cartBadge = document.getElementById('cartBadge');
  if (cartBadge) cartBadge.textContent = String(cartTotal);

  // Wishlist badge
  const wlBadge = document.getElementById('wishlistBadge');
  if (wlBadge) {
    const count = state.wishlist.length;
    wlBadge.textContent = String(count);
    wlBadge.classList.toggle('hidden', count === 0);
  }

  // Notifications badge
  const notifBadge = document.getElementById('notifBadge');
  if (notifBadge) {
    const unread = state.notifications.filter(n => !n.read).length;
    notifBadge.textContent = String(unread);
    notifBadge.classList.toggle('hidden', unread === 0);
  }

  // Profile label
  const profileLabel = document.getElementById('profileLabel');
  const avatarEl = document.getElementById('headerAvatar');
  if (profileLabel) {
    profileLabel.textContent = `Hallo, ${state.userProfile.name.split(' ')[0]}`;
  }
  if (avatarEl) {
    avatarEl.textContent = state.userProfile.name.charAt(0).toUpperCase();
  }

  // Balance display
  const balanceDisplay = document.getElementById('balanceDisplay');
  if (balanceDisplay) {
    balanceDisplay.textContent = `🎁 ${state.userBalance.amount.toFixed(2).replace('.', ',')}€`;
  }

  // Theme icon
  const themeIcon = document.querySelector('.theme-icon');
  if (themeIcon) {
    themeIcon.textContent = state.theme === 'dark' ? '☀️' : '🌙';
  }
}

export function updateWishlistBadge(count: number): void {
  const badge = document.getElementById('wishlistBadge');
  if (badge) {
    badge.textContent = String(count);
    badge.classList.toggle('hidden', count === 0);
  }
}

export function updateCartBadge(total: number): void {
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = String(total);
}

export function updateNotificationBadge(count: number): void {
  const badge = document.getElementById('notifBadge');
  if (badge) {
    badge.textContent = String(count);
    badge.classList.toggle('hidden', count === 0);
  }
}

export function updateGiftBalanceHeaderDisplay(state: AppState): void {
  const el = document.getElementById('balanceDisplay');
  if (el) el.textContent = `🎁 ${state.userBalance.amount.toFixed(2).replace('.', ',')}€`;
}
