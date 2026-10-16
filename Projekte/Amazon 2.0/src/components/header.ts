// ============================================================
// Amazon 2.0 – Header & Navigation Component
// ============================================================
import type { AppState, Product } from '../types';
import { CATEGORIES } from '../data/heroSlides';
import { debounce, formatPrice } from '../utils/formatters';
import { readStorage, writeStorage, KEYS } from '../utils/persist';
import { showToast } from './toast';
import { emit } from '../store';
import { playSound, isAudioMuted, toggleAudioMute } from '../utils/audio';

interface HeaderCallbacks {
  onSearch: (query: string) => void;
  onCategoryChange: (catId: string) => void;
  onProductClick?: (product: Product) => void;
  onCartClick: () => void;
  onOrdersClick: () => void;
  onWishlistClick: () => void;
  onProfileClick: () => void;
  onCouponsClick: () => void;
  onThemeToggle: () => void;
  onNotificationsClick: () => void;
  onGiftCardsClick: () => void;
}

function saveSearchQuery(q: string): void {
  const clean = q.trim();
  if (!clean) return;
  const history = readStorage<string[]>(KEYS.searchHistory, []);
  if (!history.includes(clean)) {
    history.unshift(clean);
    writeStorage(KEYS.searchHistory, history.slice(0, 10));
  }
}

export function initHeader(state: AppState, callbacks: HeaderCallbacks): void {
  const header = document.getElementById('mainHeader');
  if (!header) return;

  const audioMuted = isAudioMuted();

  header.innerHTML = `
    <nav class="header-top" role="banner">
      <div class="header-logo">
        <a href="#" id="logoLink" aria-label="Amazon 2.0 Startseite">
          <span class="logo-text">amazon<span class="logo-prime">2.0</span></span>
        </a>
      </div>

      <div class="header-search" role="search" id="headerSearchWrapper">
        <select id="searchCategorySelect" class="search-cat-select" aria-label="Kategorie auswählen">
          ${CATEGORIES.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('')}
        </select>
        <div class="search-input-wrap">
          <input
            type="search"
            id="searchInput"
            class="search-input"
            placeholder="Suche bei Amazon 2.0..."
            aria-label="Produktsuche"
            autocomplete="off"
          />
          <div id="searchSuggestions" class="search-suggestions hidden" role="listbox"></div>
        </div>
        <button id="semanticSearchBtn" class="search-action-btn" aria-label="KI-Vektorsuche" title="🧠 On-Device KI-Semantiksuche (NLP)">
          <span style="font-size: 16px;">🧠</span>
        </button>
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
        <button id="audioToggleBtn" class="header-btn icon-btn" aria-label="Audio Effekte" title="${audioMuted ? 'Ton aktivieren' : 'Ton stummschalten'}">
          <span id="audioIcon">${audioMuted ? '🔇' : '🔊'}</span>
        </button>
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
      <button id="shortsNavBtn" class="nav-link live-nav">📹 Shorts & Unboxing</button>
      <button id="partyNavBtn" class="nav-link live-nav">🎉 Video-Party</button>
      <button id="agentNavBtn" class="nav-link highlight-nav">🤖 KI-Agent</button>
      <button id="rocketNavBtn" class="nav-link highlight-nav">🌌 Sub-Orbit Rakete</button>
      <button id="sleepNavBtn" class="nav-link highlight-nav">🛏️ Schlaf-Architekt</button>
      <button id="merchantStakeNavBtn" class="nav-link highlight-nav">⚡ Händler-Staking</button>
      <button id="geoNavBtn" class="nav-link highlight-nav">🌋 Geothermie-Cloud</button>
      <button id="audioHoloNavBtn" class="nav-link highlight-nav">🌌 Akustik-Hologramm</button>
      <button id="freeportNavBtn" class="nav-link highlight-nav">🏦 Freeport-Zollfreilager</button>
      <button id="hyperloopNavBtn" class="nav-link highlight-nav">⚡ Hyperloop-Express</button>
      <button id="stratoNavBtn" class="nav-link highlight-nav">🎈 Stratosphären-Mesh</button>
      <button id="lightfieldNavBtn" class="nav-link highlight-nav">🌌 3D-Lichtfeld</button>
      <button id="emotionNavBtn" class="nav-link highlight-nav">🤖 Emotion-KI</button>
      <button id="rollupNavBtn" class="nav-link highlight-nav">⚡ Layer-3 Rollup</button>
      <button id="maritimeNavBtn" class="nav-link highlight-nav">🚢 Frachtschiff-Radar</button>
      <button id="qkdNavBtn" class="nav-link highlight-nav">🌌 QKD Teleport</button>
      <button id="roverNavBtn" class="nav-link highlight-nav">🤖 Ground Rover</button>
      <button id="exoNavBtn" class="nav-link highlight-nav">🦾 Exoskelett</button>
      <button id="ramanNavBtn" class="nav-link highlight-nav">💎 Raman-Spektrometrie</button>
      <button id="solarNavBtn" class="nav-link highlight-nav">⚡ Solar-Logistik</button>
      <button id="healNavBtn" class="nav-link highlight-nav">🤖 Web3-Garantie</button>
      <button id="scentNavBtn" class="nav-link highlight-nav">🧬 Digital Olfaction</button>
      <button id="bciNavBtn" class="nav-link highlight-nav">🧠 BCI Mind-Shopping</button>
      <button id="vrNavBtn" class="nav-link highlight-nav">🌌 VR Spatial</button>
      <button id="lightningNavBtn" class="nav-link highlight-nav">⚡ Lightning Stream</button>
      <button id="dnaNavBtn" class="nav-link highlight-nav">🧬 DNA Nutrition</button>
      <button id="satNavBtn" class="nav-link highlight-nav">🛰️ Satelliten-Tracker</button>
      <button id="eyeNavBtn" class="nav-link highlight-nav">🧠 Eye-Tracking</button>
      <button id="zkNavBtn" class="nav-link highlight-nav">🪙 ZK-Proofs</button>
      <button id="multimodalNavBtn" class="nav-link highlight-nav">🤖 Multimodal-Suche</button>
      <button id="pqcNavBtn" class="nav-link highlight-nav">🛡️ Post-Quantum</button>
      <button id="healthNavBtn" class="nav-link highlight-nav">🩺 Health & Ergo</button>
      <button id="droneNavBtn" class="nav-link highlight-nav">🚁 Drohnen-Radar</button>
      <button id="pricingNavBtn" class="nav-link highlight-nav">💼 Dynamic Pricing</button>
      <button id="mirrorNavBtn" class="nav-link highlight-nav">🪞 Smart-Mirror</button>
      <button id="crdtNavBtn" class="nav-link highlight-nav">🔄 Offline-Sync</button>
      <button id="barcodeNavBtn" class="nav-link highlight-nav">📱 Barcode-Scanner</button>
      <button id="passkeyNavBtn" class="nav-link highlight-nav">🔐 Passkeys</button>
      <button id="voicePersonasNavBtn" class="nav-link highlight-nav">🎙️ KI-Stimmen</button>
      <button id="p2pNavBtn" class="nav-link highlight-nav">🛡️ P2P-Reviews</button>
      <button id="smartHomeNavBtn" class="nav-link highlight-nav">🏠 Smart-Home Planer</button>
      <button id="cryptoSwapNavBtn" class="nav-link highlight-nav">💱 Krypto DEX Swap</button>
      <button id="influencerNavBtn" class="nav-link live-nav">🎙️ KI-Live Show</button>
      <button id="guardNavBtn" class="nav-link highlight-nav">🛡️ Preisschutz</button>
      <button id="defiNavBtn" class="nav-link highlight-nav">⚡ DeFi Vault</button>
      <button id="roomAdvisorNavBtn" class="nav-link highlight-nav">✨ KI-Raumberater</button>
      <button id="multiplayerNavBtn" class="nav-link highlight-nav">👥 Zusammen shoppen</button>
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
    playSound('click');
    callbacks.onSearch('');
    callbacks.onCategoryChange('all');
    if (searchInput) searchInput.value = '';
    (document.getElementById('searchCategorySelect') as HTMLSelectElement).value = 'all';
    hideSuggestions();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Search input & Suggestions Dropdown
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  const searchBtn = document.getElementById('searchBtn');
  const catSelect = document.getElementById('searchCategorySelect') as HTMLSelectElement;
  const suggestionsBox = document.getElementById('searchSuggestions');

  function saveSearchQuery(q: string): void {
    if (!q || q.length < 2) return;
    const history = readStorage<string[]>(KEYS.searchHistory, []);
    const filtered = history.filter(item => item.toLowerCase() !== q.toLowerCase());
    filtered.unshift(q);
    writeStorage(KEYS.searchHistory, filtered.slice(0, 8));
  }

  function hideSuggestions(): void {
    if (suggestionsBox) {
      suggestionsBox.classList.add('hidden');
      suggestionsBox.innerHTML = '';
    }
  }

  function renderSuggestions(query: string): void {
    if (!suggestionsBox) return;
    const cleanQuery = query.toLowerCase().trim();

    if (!cleanQuery) {
      const history = readStorage<string[]>(KEYS.searchHistory, []);
      if (history.length === 0) {
        hideSuggestions();
        return;
      }

      suggestionsBox.innerHTML = `
        <div class="suggestions-header">
          <span>🕒 Zuletzt gesucht</span>
          <button id="clearSearchHistoryBtn" class="clear-history-btn">Löschen</button>
        </div>
        <div class="search-history-chips">
          ${history.map(item => `<button class="history-chip" data-query="${item}">${item}</button>`).join('')}
        </div>
      `;

      suggestionsBox.querySelectorAll('.history-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const q = chip.getAttribute('data-query') ?? '';
          if (searchInput) searchInput.value = q;
          callbacks.onSearch(q);
          hideSuggestions();
        });
      });

      document.getElementById('clearSearchHistoryBtn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        writeStorage(KEYS.searchHistory, []);
        hideSuggestions();
      });

      suggestionsBox.classList.remove('hidden');
      return;
    }

    // Matching products
    const matchingProducts = state.products.filter(p =>
      p.title.toLowerCase().includes(cleanQuery) ||
      p.brand.toLowerCase().includes(cleanQuery) ||
      p.tags?.some(t => t.toLowerCase().includes(cleanQuery))
    ).slice(0, 5);

    // Matching categories
    const matchingCategories = CATEGORIES.filter(c =>
      c.id !== 'all' && (c.label.toLowerCase().includes(cleanQuery) || c.id.toLowerCase().includes(cleanQuery))
    ).slice(0, 3);

    if (matchingProducts.length === 0 && matchingCategories.length === 0) {
      suggestionsBox.innerHTML = `
        <div class="suggestions-empty">Keine Sofortergebnisse für "<strong>${query}</strong>"</div>
      `;
      suggestionsBox.classList.remove('hidden');
      return;
    }

    suggestionsBox.innerHTML = `
      ${matchingCategories.length > 0 ? `
        <div class="suggestions-section">
          <div class="suggestions-title">Kategorien</div>
          ${matchingCategories.map(c => `
            <div class="category-suggestion-item" data-cat="${c.id}">
              <span class="cat-icon">${c.icon}</span>
              <span class="cat-name">${c.label}</span>
              <span class="cat-action">in Kategorie stöbern →</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${matchingProducts.length > 0 ? `
        <div class="suggestions-section">
          <div class="suggestions-title">Produkte (${matchingProducts.length})</div>
          ${matchingProducts.map(p => `
            <div class="product-suggestion-item" data-prod-id="${p.id}">
              <img src="${p.images[0]}" alt="${p.title}" class="sugg-img" />
              <div class="sugg-info">
                <span class="sugg-title">${p.title}</span>
                <span class="sugg-meta">${p.brand} • <strong class="sugg-price">${formatPrice(p.price)}</strong></span>
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}
    `;

    suggestionsBox.querySelectorAll('.category-suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const cat = item.getAttribute('data-cat') ?? 'all';
        catSelect.value = cat;
        callbacks.onCategoryChange(cat);
        hideSuggestions();
      });
    });

    suggestionsBox.querySelectorAll('.product-suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        const prodId = item.getAttribute('data-prod-id');
        const prod = state.products.find(p => p.id === prodId);
        if (prod) {
          if (callbacks.onProductClick) {
            callbacks.onProductClick(prod);
          } else {
            callbacks.onSearch(prod.title);
          }
          saveSearchQuery(prod.title);
        }
        hideSuggestions();
      });
    });

    suggestionsBox.classList.remove('hidden');
  }

  const debouncedSearch = debounce((query: string) => {
    callbacks.onSearch(query);
    renderSuggestions(query);
  }, 250);

  searchInput?.addEventListener('input', () => {
    debouncedSearch(searchInput.value.trim());
  });

  searchInput?.addEventListener('focus', () => {
    renderSuggestions(searchInput.value.trim());
  });

  searchBtn?.addEventListener('click', () => {
    const q = searchInput.value.trim();
    saveSearchQuery(q);
    callbacks.onSearch(q);
    hideSuggestions();
    playSound('click');
  });

  searchInput?.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      saveSearchQuery(q);
      callbacks.onSearch(q);
      hideSuggestions();
      playSound('click');
    } else if (e.key === 'Escape') {
      hideSuggestions();
    }
  });

  // Click outside to close suggestions
  document.addEventListener('click', (e) => {
    const searchWrap = document.getElementById('headerSearchWrapper');
    if (searchWrap && !searchWrap.contains(e.target as Node)) {
      hideSuggestions();
    }
  });

  catSelect?.addEventListener('change', () => callbacks.onCategoryChange(catSelect.value));

  // Audio Mute Button
  const audioBtn = document.getElementById('audioToggleBtn');
  const audioIcon = document.getElementById('audioIcon');
  audioBtn?.addEventListener('click', () => {
    const muted = toggleAudioMute();
    if (audioIcon) audioIcon.textContent = muted ? '🔇' : '🔊';
    if (audioBtn) audioBtn.setAttribute('title', muted ? 'Ton aktivieren' : 'Ton stummschalten');
    if (!muted) playSound('success');
    showToast(muted ? '🔇 Audio-Effekte stummgeschaltet' : '🔊 Audio-Effekte aktiviert', 'info');
  });

  // Bottom nav category buttons
  document.querySelectorAll('.cat-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
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
    emit('products:render');
    showToast(`🌐 Sprache geändert: ${langSelect.value.toUpperCase()}`, 'info');
  });

  currSelect?.addEventListener('change', () => {
    state.currency = currSelect.value as any;
    emit('products:render');
    showToast(`💱 Währung geändert: ${currSelect.value}`, 'info');
  });

  // Action buttons
  document.getElementById('cartBtn')?.addEventListener('click', () => {
    playSound('click');
    callbacks.onCartClick();
  });
  document.getElementById('ordersBtn')?.addEventListener('click', () => {
    playSound('click');
    callbacks.onOrdersClick();
  });
  document.getElementById('wishlistBtn')?.addEventListener('click', () => {
    playSound('click');
    callbacks.onWishlistClick();
  });
  document.getElementById('profileBtn')?.addEventListener('click', () => {
    playSound('click');
    callbacks.onProfileClick();
  });
  document.getElementById('couponsBtn')?.addEventListener('click', () => {
    playSound('click');
    callbacks.onCouponsClick();
  });
  document.getElementById('themeToggleBtn')?.addEventListener('click', () => {
    playSound('click');
    callbacks.onThemeToggle();
  });
  document.getElementById('notificationsBtn')?.addEventListener('click', () => {
    playSound('click');
    callbacks.onNotificationsClick();
  });
  document.getElementById('giftCardBtn')?.addEventListener('click', () => {
    playSound('click');
    callbacks.onGiftCardsClick();
  });

  // 🎙️ Voice Search & Commander Wiring
  const voiceBtn = document.getElementById('voiceSearchBtn');
  voiceBtn?.addEventListener('click', () => {
    playSound('click');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.lang = state.language === 'en' ? 'en-US' : 'de-DE';
        voiceBtn.classList.add('recording');
        showToast('🎙️ Sprachsteuerung aktiv: Sprich jetzt...', 'info');

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          handleVoiceExecution(transcript, searchInput, callbacks, state);
        };

        recognition.onerror = () => {
          voiceBtn.classList.remove('recording');
          showToast('Sprachsuche nicht erkannt. Versuche den Simulator!', 'warning');
          openVoiceSimulatorModal(searchInput, callbacks, state);
        };

        recognition.onend = () => {
          voiceBtn.classList.remove('recording');
        };

        recognition.start();
      } catch {
        openVoiceSimulatorModal(searchInput, callbacks, state);
      }
    } else {
      openVoiceSimulatorModal(searchInput, callbacks, state);
    }
  });

  // 🧠 On-Device Semantic Vector Search Wiring
  document.getElementById('semanticSearchBtn')?.addEventListener('click', () => {
    playSound('quest');
    openSemanticSearchModal(searchInput, callbacks, state);
  });

  // 📷 Visual Search Wiring
  document.getElementById('visualSearchBtn')?.addEventListener('click', () => {
    playSound('click');
    openVisualSearchModal(searchInput, (query) => {
      saveSearchQuery(query);
      callbacks.onSearch(query);
    });
  });

  // Initial UI update
  updateHeaderUI(state);
}

function handleVoiceExecution(
  transcript: string,
  searchInput: HTMLInputElement | null,
  callbacks: HeaderCallbacks,
  state: AppState
): void {
  import('../utils/voiceCommander').then(({ parseVoiceCommand }) => {
    const res = parseVoiceCommand(transcript, state.products);
    playSound('success');

    if (res.action === 'open_cart') {
      showToast('🛒 ' + res.message, 'success');
      callbacks.onCartClick();
    } else if (res.action === 'open_orders') {
      showToast('📦 ' + res.message, 'success');
      callbacks.onOrdersClick();
    } else if (res.action === 'open_wishlist') {
      showToast('♥ ' + res.message, 'success');
      callbacks.onWishlistClick();
    } else if (res.action === 'open_coupons') {
      showToast('🎟️ ' + res.message, 'success');
      callbacks.onCouponsClick();
    } else if (res.action === 'toggle_theme') {
      showToast('🌙 ' + res.message, 'success');
      callbacks.onThemeToggle();
    } else if (res.action === 'clear_filters') {
      showToast('🔄 Filter zurückgesetzt', 'info');
      callbacks.onSearch('');
      if (searchInput) searchInput.value = '';
    } else if (res.action === 'add_to_cart' && res.matchedProduct) {
      showToast(`🛒 „${res.matchedProduct.title}“ hinzugefügt!`, 'success');
      const existing = state.cart.find(i => i.product.id === res.matchedProduct!.id);
      if (existing) existing.qty += 1;
      else state.cart.push({ product: res.matchedProduct, qty: 1, addedAt: Date.now() });
      emit('cart:changed');
      callbacks.onCartClick();
    } else {
      const q = res.query || transcript;
      if (searchInput) searchInput.value = q;
      saveSearchQuery(q);
      callbacks.onSearch(q);
      showToast(`🔍 ${res.message}`, 'success');
    }
  });
}

// ── Voice Simulator Modal ─────────────────────────────────────
function openVoiceSimulatorModal(
  searchInput: HTMLInputElement | null,
  callbacks: HeaderCallbacks,
  state: AppState
): void {
  let modal = document.getElementById('voiceModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'voiceModal';
    modal.className = 'modal-overlay voice-modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog voice-dialog">
      <button class="modal-close" id="closeVoiceModal" aria-label="Schließen">✕</button>
      <div class="voice-icon-pulse">🎙️</div>
      <h2>Smarter Sprach-Assistent Simulator</h2>
      <p class="voice-sub">Wähle einen Sprachbefehl aus oder tippe einen Sprach-Suchbegriff:</p>
      
      <div class="voice-samples">
        <button class="voice-sample-btn" data-q="Öffne meinen Warenkorb">🛒 "Öffne meinen Warenkorb"</button>
        <button class="voice-sample-btn" data-q="Zeige meine Bestellungen">📦 "Zeige meine Bestellungen"</button>
        <button class="voice-sample-btn" data-q="Füge iPhone 15 Pro zum Warenkorb hinzu">⚡ "Füge iPhone zum Warenkorb hinzu"</button>
        <button class="voice-sample-btn" data-q="Suche nach Sony Kopfhörer">🔍 "Suche nach Sony Kopfhörer"</button>
        <button class="voice-sample-btn" data-q="Dunkler Modus">🌙 "Dunkler Modus"</button>
      </div>

      <div class="voice-input-row">
        <input type="text" id="manualVoiceInput" class="voice-text-input" placeholder="Oder Sprachbefehl eingeben..." />
        <button id="sendVoiceBtn" class="voice-send-btn">Ausführen</button>
      </div>
    </div>
  `;

  modal.classList.add('open');

  const closeModal = () => modal?.classList.remove('open');
  document.getElementById('closeVoiceModal')?.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  modal.querySelectorAll('.voice-sample-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-q')!;
      handleVoiceExecution(q, searchInput, callbacks, state);
      closeModal();
    });
  });

  const sendManual = () => {
    const val = (document.getElementById('manualVoiceInput') as HTMLInputElement)?.value.trim();
    if (val) {
      handleVoiceExecution(val, searchInput, callbacks, state);
      closeModal();
    }
  };

  document.getElementById('sendVoiceBtn')?.addEventListener('click', sendManual);
  document.getElementById('manualVoiceInput')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendManual();
  });
}

// ── Visual Image Search Modal ─────────────────────────────────
function openVisualSearchModal(searchInput: HTMLInputElement | null, onSearch: (q: string) => void): void {
  let modal = document.getElementById('visualSearchModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'visualSearchModal';
    modal.className = 'modal-overlay visual-search-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog visual-dialog">
      <button class="modal-close" id="closeVisualModal" aria-label="Schließen">✕</button>
      <div class="visual-header">
        <span class="visual-badge">📸 KI-Bilderkennung</span>
        <h2>Visuelle Produktsuche</h2>
        <p>Lade ein Foto hoch oder wähle ein Beispielprodukt zum Scannen:</p>
      </div>

      <div class="visual-dropzone" id="visualDropzone">
        <div class="dropzone-icon">📷</div>
        <p><strong>Foto hier ablegen</strong> oder Datei auswählen</p>
        <span class="dropzone-sub">Unterstützt JPG, PNG, WebP</span>
        <input type="file" id="visualFileInput" accept="image/*" class="hidden-file-input" />
        <button id="browseImageBtn" class="browse-btn">Foto auswählen</button>
      </div>

      <div class="scanner-preview hidden" id="scannerPreview">
        <div class="scanner-laser"></div>
        <img id="scannedImg" class="scanned-image" alt="Vorschau" />
        <div class="scanner-status">
          <span class="spinner-sm"></span> Analysiere Produktmerkmale...
        </div>
      </div>

      <div class="visual-samples">
        <p class="samples-title">Oder Beispielbild testen:</p>
        <div class="samples-grid">
          <div class="visual-sample-card" data-query="Sony WH-1000XM5" data-img="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300">
            <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120" alt="Kopfhörer" />
            <span>Kopfhörer</span>
          </div>
          <div class="visual-sample-card" data-query="Apple AirPods Pro" data-img="https://images.unsplash.com/photo-1588423771073-b8903fead85b?w=300">
            <img src="https://images.unsplash.com/photo-1588423771073-b8903fead85b?w=120" alt="Earbuds" />
            <span>Earbuds</span>
          </div>
          <div class="visual-sample-card" data-query="Gaming Monitor" data-img="https://images.unsplash.com/photo-1593640408182-31c228aeb0e0?w=300">
            <img src="https://images.unsplash.com/photo-1593640408182-31c228aeb0e0?w=120" alt="Monitor" />
            <span>Monitor</span>
          </div>
          <div class="visual-sample-card" data-query="Maus" data-img="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=300">
            <img src="https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=120" alt="Maus" />
            <span>Maus</span>
          </div>
        </div>
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
      playSound('success');
      showToast(`📸 Bildsuche Treffer: "${query}"`, 'success');
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

  // Audio icon
  const audioIcon = document.getElementById('audioIcon');
  if (audioIcon) {
    audioIcon.textContent = isAudioMuted() ? '🔇' : '🔊';
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

// ── On-Device Semantic Vector Search Modal ────────────────────
function openSemanticSearchModal(
  searchInput: HTMLInputElement | null,
  callbacks: HeaderCallbacks,
  state: AppState
): void {
  let modal = document.getElementById('semanticSearchModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'semanticSearchModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog semantic-search-dialog">
      <button class="modal-close" id="closeSemanticModal" aria-label="Schließen">✕</button>
      <div class="semantic-header">
        <div class="semantic-badge">🧠 ON-DEVICE NLP & VEKTORSUCHE</div>
        <h2>Semantische KI-Produktsuche</h2>
        <p class="semantic-sub">Beschreibe deine Wünsche in natürlicher Sprache. Unser clientseitiges Embedding-Modell findet passende Treffer ohne exakte Stichwörter.</p>
      </div>

      <div class="semantic-input-box">
        <input
          type="text"
          id="semanticQueryInput"
          class="semantic-input"
          placeholder="z.B. Etwas Elegantes für mein Home Office zum Arbeiten..."
          value="${searchInput?.value || ''}"
          autofocus
        />
        <button id="runSemanticSearchBtn" class="btn-primary">🧠 Suchen</button>
      </div>

      <div class="semantic-quick-prompts">
        <span class="prompts-label">Vorschläge:</span>
        <button class="prompt-chip" data-q="Kopfhörer mit starkem Bass für lange Reisen">🎧 "Kopfhörer für Reisen"</button>
        <button class="prompt-chip" data-q="Gaming Setup Zubehör mit hoher Bildwiederholrate">🎮 "Gaming Zubehör 240Hz"</button>
        <button class="prompt-chip" data-q="Hochwertige Kaffeebohnen für morgens">☕ "Premium Kaffeebohnen"</button>
      </div>

      <div id="semanticResultsContainer" class="semantic-results-grid">
        <div class="semantic-empty-state">Tippe oben eine Beschreibung ein oder wähle einen Vorschlag.</div>
      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  const closeModal = () => {
    modal?.classList.remove('open');
    document.body.style.overflow = '';
  };
  document.getElementById('closeSemanticModal')?.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  const queryInput = document.getElementById('semanticQueryInput') as HTMLInputElement;
  const resultsContainer = document.getElementById('semanticResultsContainer') as HTMLElement;

  function doSearch(q: string) {
    if (!q.trim()) return;
    import('../utils/vectorSearch').then(({ performSemanticSearch }) => {
      const results = performSemanticSearch(q, state.products);
      playSound('success');

      if (results.length === 0) {
        resultsContainer.innerHTML = `
          <div class="semantic-empty-state">
            <p>Keine passenden Produkte mit ausreichend hoher semantischer Ähnlichkeit gefunden.</p>
          </div>
        `;
        return;
      }

      resultsContainer.innerHTML = results.map(res => `
        <div class="semantic-result-card" data-prod-id="${res.product.id}">
          <img src="${res.product.images[0]}" alt="${res.product.title}" class="sem-img" />
          <div class="sem-info">
            <div class="sem-score-row">
              <span class="sem-score-pill score-${res.matchQuality}">🧠 ${res.matchPercentage}% Übereinstimmung</span>
              <span class="sem-price">${formatPrice(res.product.price)}</span>
            </div>
            <h4 class="sem-title">${res.product.title}</h4>
            <p class="sem-desc">${res.product.description.slice(0, 100)}...</p>
            <div class="sem-concepts">
              ${res.matchedConcepts.map(c => `<span class="sem-concept-tag">#${c}</span>`).join('')}
            </div>
          </div>
          <button class="btn-primary-sm sem-open-btn" data-prod-id="${res.product.id}">Ansehen ➔</button>
        </div>
      `).join('');

      // Click card or open button
      resultsContainer.querySelectorAll('.semantic-result-card, .sem-open-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const prodId = (e.currentTarget as HTMLElement).getAttribute('data-prod-id');
          const prod = state.products.find(p => p.id === prodId);
          if (prod && callbacks.onProductClick) {
            closeModal();
            callbacks.onProductClick(prod);
          }
        });
      });
    });
  }

  document.getElementById('runSemanticSearchBtn')?.addEventListener('click', () => {
    doSearch(queryInput.value);
  });

  queryInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch(queryInput.value);
  });

  modal.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-q')!;
      queryInput.value = q;
      doSearch(q);
    });
  });
}
