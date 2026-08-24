// ============================================================
// Amazon 2.0 – Main Application Controller
// ============================================================
import './style.css';
import { state, on, emit, saveCart, saveOrders, saveWishlist, saveCompare, saveFilters, saveTheme, triggerRenderProducts } from './store';
import { HERO_SLIDES } from './data/heroSlides';

// Component imports
import { initHeader, updateHeaderUI, updateNotificationBadge } from './components/header';
import { initCatalog, renderProducts } from './components/catalog';
import { initCart, renderCartDrawer, toggleCartDrawer } from './components/cart';
import { openProductModal } from './components/productModal';
import { openCheckoutModal } from './components/checkout';
import { openOrdersModal } from './components/orders';
import { initWishlist, openWishlistModal } from './components/wishlist';
import { initCompare, toggleCompareProduct } from './components/compare';
import { trackRecentlyViewed, renderRecentlyViewed } from './components/recentlyViewed';
import { initCoupons, openCouponsModal } from './components/coupons';
import { openProfileModal } from './components/profile';
import { showToast } from './components/toast';
import { openNotificationsModal } from './components/notifications';
import { openGiftCardModal, updateGiftBalanceHeaderDisplay } from './components/giftCards';
import { startLightningTimers, renderLightningDealsSection } from './components/lightningDeals';
import { initCommandPalette } from './components/commandPalette';
import { renderRecommendationsSection } from './components/recommendations';
import { openReturnModal } from './components/returns';
import { openSellerModal, injectSellerListings } from './components/seller';
import { openPrimeModal } from './components/prime';
import type { Product, Review, QAItem } from './types';
import { writeStorage, KEYS } from './utils/persist';

// ── Bootstrap ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme
  document.documentElement.setAttribute('data-theme', state.theme);

  // 1. Initialize Header
  initHeader(state, {
    onSearch: (query) => {
      state.filters.searchQuery = query;
      triggerRenderProducts();
    },
    onCategoryChange: (catId) => {
      state.filters.category = catId;
      triggerRenderProducts();
    },
    onCartClick: toggleCartDrawer,
    onOrdersClick: () => openOrdersModal(state),
    onWishlistClick: () => openWishlistModal(state, handleMoveWishlistToCart, handleRemoveFromWishlist),
    onProfileClick: () => openProfileModal(state, () => {
      updateHeaderUI(state);
      renderCartDrawer(state, handleCartUpdate, () => openCheckoutModal(state, handleOrderPlaced));
    }),
    onCouponsClick: () => openCouponsModal(state, () => {
      renderCartDrawer(state, handleCartUpdate, () => openCheckoutModal(state, handleOrderPlaced));
    }),
    onThemeToggle: handleToggleTheme,
    onNotificationsClick: () => openNotificationsModal(state),
    onGiftCardsClick: () => openGiftCardModal(state, () => updateGiftBalanceHeaderDisplay(state)),
  });

  // 2. Initialize Cart
  initCart(
    state,
    handleCartUpdate,
    () => openCheckoutModal(state, handleOrderPlaced)
  );

  // 3. Initialize Catalog
  initCatalog(state, {
    onProductClick: handleProductClick,
    onAddToCart: handleAddToCart,
    onToggleWishlist: handleToggleWishlist,
    onToggleCompare: (productId) => {
      toggleCompareProduct(state, productId, handleAddToCart);
      saveCompare();
      doRenderProducts();
    },
    onFilterChange: (newFilters) => {
      state.filters = { ...state.filters, ...newFilters };
      saveFilters();
      triggerRenderProducts();
    },
    onResetFilters: (reset) => {
      state.filters = { ...state.filters, ...reset };
      saveFilters();
      triggerRenderProducts();
    },
  });

  // 4. Initialize Compare & Coupons
  initCompare(state, handleAddToCart);
  initCoupons(state);

  // 5. Initialize Wishlist
  initWishlist(state, handleMoveWishlistToCart, handleRemoveFromWishlist);

  // 6. Initialize Hero Carousel
  initHeroCarousel();

  // 7. Render Quick Category Cards
  renderQuickCards();

  // 8. Start Lightning Deal Timers
  startLightningTimers(state);
  renderLightningDealsSection(state);

  // 9. Initial Product Render
  doRenderProducts();
  renderRecentlyViewed(state, handleProductClick, handleAddToCart);

  // 10. Initialize Command Palette
  initCommandPalette(state, {
    openOrders: () => openOrdersModal(state),
    openWishlist: () => openWishlistModal(state, handleMoveWishlistToCart, handleRemoveFromWishlist),
    openCoupons: () => openCouponsModal(state, () => renderCartDrawer(state, handleCartUpdate, () => openCheckoutModal(state, handleOrderPlaced))),
    openProfile: () => openProfileModal(state, () => {
      updateHeaderUI(state);
      renderCartDrawer(state, handleCartUpdate, () => openCheckoutModal(state, handleOrderPlaced));
    }),
    openGiftCards: () => openGiftCardModal(state, () => updateGiftBalanceHeaderDisplay(state)),
    openCompare: () => {
      const compareDock = document.getElementById('compareDock');
      if (compareDock) compareDock.scrollIntoView({ behavior: 'smooth' });
    },
    toggleTheme: handleToggleTheme,
    openProduct: (product) => handleProductClick(product),
  });

  // 11. Seller Marketplace
  injectSellerListings(state);

  // 12. AI Recommendations
  renderRecommendationsSection(state, handleProductClick, handleAddToCart);

  // 13. Smart AI Live Support Chat
  import('./components/supportChat').then(({ initSupportChat }) => initSupportChat(state));

  // 14. Return modal event listener
  document.addEventListener('openReturnModal', (e) => {
    const customEvent = e as CustomEvent;
    if (customEvent.detail?.order) openReturnModal(state, customEvent.detail.order);
  });

  // 15. Subscribe to store events
  on('products:render', doRenderProducts);
  on('cart:changed', () => {
    updateHeaderUI(state);
    renderCartDrawer(state, handleCartUpdate, () => openCheckoutModal(state, handleOrderPlaced));
  });
  on('wishlist:changed', () => updateHeaderUI(state));
  on('notifications:changed', () => updateHeaderUI(state));
  on('balance:changed', () => updateGiftBalanceHeaderDisplay(state));
  on('theme:changed', () => {
    document.documentElement.setAttribute('data-theme', state.theme);
    updateHeaderUI(state);
  });

  // 16. Wire Seller, Prime & Advanced feature nav buttons
  document.getElementById('sellerNavBtn')?.addEventListener('click', () => {
    openSellerModal(state, () => {
      doRenderProducts();
      renderRecommendationsSection(state, handleProductClick, handleAddToCart);
    });
  });

  document.getElementById('primeNavBtn')?.addEventListener('click', () => {
    openPrimeModal(state);
  });

  document.getElementById('rewardsNavBtn')?.addEventListener('click', () => {
    import('./components/rewardsQuest').then(({ openRewardsQuestModal }) =>
      openRewardsQuestModal(state)
    );
  });

  document.getElementById('matrixNavBtn')?.addEventListener('click', () => {
    import('./components/specMatrix').then(({ openSpecMatrixModal }) =>
      openSpecMatrixModal(state)
    );
  });

  document.getElementById('store3dNavBtn')?.addEventListener('click', () => {
    import('./components/virtualStore').then(({ openVirtualStoreModal }) =>
      openVirtualStoreModal(state, handleAddToCart, handleProductClick)
    );
  });

  document.getElementById('auctionsNavBtn')?.addEventListener('click', () => {
    import('./components/liveAuctions').then(({ openLiveAuctionsModal }) =>
      openLiveAuctionsModal(state, handleAddToCart)
    );
  });

  document.getElementById('liveCommerceNavBtn')?.addEventListener('click', () => {
    import('./components/liveCommerce').then(({ openLiveCommerceModal }) =>
      openLiveCommerceModal(state, handleAddToCart)
    );
  });

  // Initial UI update
  updateGiftBalanceHeaderDisplay(state);
  updateNotificationBadge(state.notifications.filter(n => !n.read).length);

  console.log('[Amazon 2.0] App initialized ✓');
});

// ── Core Render Function ─────────────────────────────────────
function doRenderProducts(): void {
  renderProducts(state);
}

// ── Hero Carousel ─────────────────────────────────────────────
function initHeroCarousel(): void {
  const container = document.getElementById('heroCarousel');
  if (!container) return;

  let currentSlide = 0;
  let autoplayTimer: ReturnType<typeof setInterval>;

  container.innerHTML = `
    ${HERO_SLIDES.map((slide, idx) => `
      <div 
        class="carousel-slide ${idx === 0 ? 'active' : ''}" 
        style="background: ${slide.bgGradient};"
        aria-hidden="${idx !== 0}"
      >
        <div class="slide-content">
          ${slide.badge ? `<span class="slide-badge">${slide.badge}</span>` : ''}
          <h2 class="slide-title">${slide.title}</h2>
          <p class="slide-subtitle">${slide.subtitle}</p>
          <button class="slide-btn" data-slide-cat="${slide.category ?? 'all'}">${slide.buttonText}</button>
        </div>
        <div class="slide-img-wrap">
          <img 
            src="${slide.image}" 
            class="carousel-img" 
            alt="${slide.title}"
            ${idx !== 0 ? 'loading="lazy"' : ''}
            width="400" height="280"
          />
        </div>
      </div>
    `).join('')}

    <button class="carousel-arrow carousel-prev" id="heroPrevBtn" aria-label="Vorheriger Slide">‹</button>
    <button class="carousel-arrow carousel-next" id="heroNextBtn" aria-label="Nächster Slide">›</button>

    <div class="carousel-dots" role="tablist" aria-label="Carousel Navigation">
      ${HERO_SLIDES.map((_, idx) => `
        <button 
          class="carousel-dot ${idx === 0 ? 'active' : ''}" 
          role="tab" 
          data-slide="${idx}"
          aria-label="Slide ${idx + 1}"
          aria-selected="${idx === 0}"
        ></button>
      `).join('')}
    </div>
  `;

  const slides = container.querySelectorAll('.carousel-slide');
  const dots = container.querySelectorAll('.carousel-dot');

  function showSlide(index: number): void {
    slides[currentSlide]?.classList.remove('active');
    slides[currentSlide]?.setAttribute('aria-hidden', 'true');
    dots[currentSlide]?.classList.remove('active');
    dots[currentSlide]?.setAttribute('aria-selected', 'false');

    currentSlide = ((index % slides.length) + slides.length) % slides.length;

    slides[currentSlide]?.classList.add('active');
    slides[currentSlide]?.setAttribute('aria-hidden', 'false');
    dots[currentSlide]?.classList.add('active');
    dots[currentSlide]?.setAttribute('aria-selected', 'true');
  }

  function startAutoplay(): void {
    autoplayTimer = setInterval(() => showSlide(currentSlide + 1), 6000);
  }

  function stopAutoplay(): void {
    clearInterval(autoplayTimer);
  }

  document.getElementById('heroNextBtn')?.addEventListener('click', () => {
    stopAutoplay();
    showSlide(currentSlide + 1);
    startAutoplay();
  });

  document.getElementById('heroPrevBtn')?.addEventListener('click', () => {
    stopAutoplay();
    showSlide(currentSlide - 1);
    startAutoplay();
  });

  dots.forEach((dot, idx) => {
    dot.addEventListener('click', () => {
      stopAutoplay();
      showSlide(idx);
      startAutoplay();
    });
  });

  // Slide CTA buttons
  container.querySelectorAll('.slide-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.getAttribute('data-slide-cat') ?? 'all';
      state.filters.category = cat;
      triggerRenderProducts();
      document.getElementById('catalogSection')?.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Touch/swipe support
  let touchStartX = 0;
  container.addEventListener('touchstart', (e: TouchEvent) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });
  container.addEventListener('touchend', (e: TouchEvent) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      stopAutoplay();
      showSlide(currentSlide + (diff > 0 ? 1 : -1));
      startAutoplay();
    }
  }, { passive: true });

  // Pause on hover
  container.addEventListener('mouseenter', stopAutoplay);
  container.addEventListener('mouseleave', startAutoplay);

  startAutoplay();
}

// ── Quick Category Cards ──────────────────────────────────────
function renderQuickCards(): void {
  const container = document.getElementById('quickCardsGrid');
  if (!container) return;

  const quickDeals = [
    {
      title: 'Tagesangebote in Elektronik',
      cat: 'electronics',
      img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80',
      badge: '🔥 Hot Deals',
    },
    {
      title: 'Smart Home & Alexa Neuheiten',
      cat: 'smart-home',
      img: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=400&auto=format&fit=crop&q=80',
      badge: '🆕 Neuheiten',
    },
    {
      title: 'Küche & Haushalts-Highlights',
      cat: 'home-kitchen',
      img: 'https://images.unsplash.com/photo-1517668808822-9eaa03afd2af?w=400&auto=format&fit=crop&q=80',
      badge: '⭐ Bestseller',
    },
    {
      title: 'Bestseller in Gaming',
      cat: 'gaming',
      img: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=400&auto=format&fit=crop&q=80',
      badge: '🎮 Gaming',
    },
  ];

  container.innerHTML = quickDeals.map(card => `
    <div class="quick-card" role="article">
      <div class="quick-card-badge">${card.badge}</div>
      <img 
        src="${card.img}" 
        class="quick-card-img" 
        alt="${card.title}" 
        loading="lazy"
        width="280" height="200"
      />
      <div class="quick-card-content">
        <h3 class="quick-card-title">${card.title}</h3>
        <button class="quick-card-link" data-cat="${card.cat}" aria-label="${card.title} ansehen">
          Jetzt stöbern →
        </button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.quick-card-link').forEach(link => {
    link.addEventListener('click', () => {
      const cat = link.getAttribute('data-cat')!;
      state.filters.category = cat;
      const catSelect = document.getElementById('searchCategorySelect') as HTMLSelectElement;
      if (catSelect) catSelect.value = cat;
      triggerRenderProducts();
      document.getElementById('catalogSection')?.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

// ── Event Handlers ────────────────────────────────────────────
function handleProductClick(product: Product): void {
  trackRecentlyViewed(state, product.id);
  renderRecentlyViewed(state, handleProductClick, handleAddToCart);
  renderRecommendationsSection(state, handleProductClick, handleAddToCart);

  openProductModal(
    product,
    handleAddToCart,
    (prod, qty) => {
      handleAddToCart(prod, qty);
      openCheckoutModal(state, handleOrderPlaced);
    },
    (productId, newReview: Review) => {
      const prod = state.products.find(p => p.id === productId);
      if (prod) {
        prod.customReviews = prod.customReviews ?? [];
        prod.customReviews.unshift(newReview);
        const customObj = JSON.parse(localStorage.getItem(KEYS.customReviews) ?? '{}') as Record<string, Review[]>;
        customObj[productId] = prod.customReviews;
        writeStorage(KEYS.customReviews, customObj);
        doRenderProducts();
      }
    },
    (productId, newQA: QAItem) => {
      const prod = state.products.find(p => p.id === productId);
      if (prod) {
        prod.qa = prod.qa ?? [];
        prod.qa.unshift(newQA);
        const qaObj = JSON.parse(localStorage.getItem(KEYS.qa) ?? '{}') as Record<string, QAItem[]>;
        qaObj[productId] = prod.qa;
        writeStorage(KEYS.qa, qaObj);
        doRenderProducts();
      }
    },
    state
  );
}

function handleAddToCart(product: Product, qty = 1): void {
  const existingIndex = state.cart.findIndex(item => item.product.id === product.id);
  if (existingIndex >= 0) {
    state.cart[existingIndex].qty += qty;
  } else {
    state.cart.push({ product, qty, addedAt: Date.now() });
  }

  saveCart();
  renderCartDrawer(state, handleCartUpdate, () => openCheckoutModal(state, handleOrderPlaced));
  toggleCartDrawer();
  showToast(`"${product.title}" zum Warenkorb hinzugefügt (${qty}×)`, 'cart');
}

function handleCartUpdate(productId: string, qty: number): void {
  if (qty <= 0) {
    state.cart = state.cart.filter(item => item.product.id !== productId);
    showToast('Artikel aus dem Warenkorb entfernt', 'info');
  } else {
    const item = state.cart.find(item => item.product.id === productId);
    if (item) item.qty = qty;
  }
  saveCart();
  renderCartDrawer(state, handleCartUpdate, () => openCheckoutModal(state, handleOrderPlaced));
}

function handleOrderPlaced(order: import('./types').Order): void {
  state.orders.unshift(order);
  state.cart = [];
  saveCart();
  saveOrders();
  renderCartDrawer(state, handleCartUpdate, () => openCheckoutModal(state, handleOrderPlaced));
  showToast(`Bestellung #${order.id} erfolgreich aufgegeben! 🎉`, 'success');

  // Add notification
  import('./components/notifications').then(({ addNotification }) => {
    addNotification(state, {
      type: 'order',
      title: `Bestellung ${order.id} eingegangen`,
      message: `Deine Bestellung über ${order.total.toFixed(2).replace('.', ',')}€ wird bearbeitet.`,
      read: false,
      createdAt: Date.now(),
    });
    updateNotificationBadge(state.notifications.filter(n => !n.read).length);
  });
}

function handleToggleTheme(): void {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', state.theme);
  saveTheme();
  emit('theme:changed');
  showToast(`${state.theme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'} aktiviert`, 'info');
}

function handleToggleWishlist(product: Product): void {
  const index = state.wishlist.findIndex(item => item.id === product.id);
  if (index >= 0) {
    state.wishlist.splice(index, 1);
    showToast(`"${product.title}" von Wunschliste entfernt`, 'info');
  } else {
    state.wishlist.push(product);
    showToast(`"${product.title}" zur Wunschliste hinzugefügt! ♥`, 'wishlist');
  }
  saveWishlist();
  updateHeaderUI(state);
  doRenderProducts();
}

function handleMoveWishlistToCart(product: Product): void {
  handleAddToCart(product, 1);
  handleRemoveFromWishlist(product.id);
}

function handleRemoveFromWishlist(productId: string): void {
  const item = state.wishlist.find(i => i.id === productId);
  state.wishlist = state.wishlist.filter(i => i.id !== productId);
  saveWishlist();
  updateHeaderUI(state);
  doRenderProducts();
  if (item) showToast(`"${item.title}" von Wunschliste entfernt`, 'info');
}
