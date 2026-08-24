/**
 * Amazon 2.0 Main Application Controller & State Bus
 */
import { PRODUCTS, HERO_SLIDES } from './data.js';
import { initHeader } from './components/header.js';
import { initCatalog, renderProducts } from './components/catalog.js';
import { openProductModal } from './components/productModal.js';
import { initCart, toggleCartDrawer, renderCartDrawer } from './components/cart.js';
import { openCheckoutModal } from './components/checkout.js';
import { openOrdersModal } from './components/orders.js';
import { initWishlist, openWishlistModal, updateWishlistBadge } from './components/wishlist.js';
import { initCompare, toggleCompareProduct } from './components/compare.js';
import { trackRecentlyViewed, renderRecentlyViewed } from './components/recentlyViewed.js';
import { initCoupons, openCouponsModal } from './components/coupons.js';
import { getStoredProfile, openProfileModal } from './components/profile.js';
import { showToast } from './components/toast.js';
import { openNotificationsModal, getStoredNotifications, updateNotificationBadge } from './components/notifications.js';
import { openGiftCardModal, getStoredBalance, updateGiftBalanceHeaderDisplay } from './components/giftCards.js';
import { startLightningTimers } from './components/lightningDeals.js';
import { initCommandPalette } from './components/commandPalette.js';
import { renderRecommendationsSection } from './components/recommendations.js';
import { openReturnModal } from './components/returns.js';
import { openSellerModal, injectSellerListings } from './components/seller.js';
import { openPrimeModal } from './components/prime.js';

// Load stored custom reviews & Q&A
const storedCustomReviews = JSON.parse(localStorage.getItem('amz_custom_reviews')) || {};
const storedQa = JSON.parse(localStorage.getItem('amz_qa')) || {};

PRODUCTS.forEach(p => {
  if (storedCustomReviews[p.id]) {
    p.customReviews = storedCustomReviews[p.id];
  }
  if (storedQa[p.id]) {
    p.qa = storedQa[p.id];
  }
});

// Application State
const state = {
  products: PRODUCTS,
  cart: JSON.parse(localStorage.getItem('amz_cart')) || [],
  orders: JSON.parse(localStorage.getItem('amz_orders')) || [],
  wishlist: JSON.parse(localStorage.getItem('amz_wishlist')) || [],
  compareList: JSON.parse(localStorage.getItem('amz_compare')) || [],
  recentlyViewed: JSON.parse(localStorage.getItem('amz_recently_viewed')) || [],
  activeCoupons: JSON.parse(localStorage.getItem('amz_active_coupons')) || [],
  appliedProductCoupons: JSON.parse(localStorage.getItem('amz_product_coupons')) || {},
  userProfile: getStoredProfile(),
  notifications: getStoredNotifications(),
  priceAlerts: JSON.parse(localStorage.getItem('amz_price_alerts')) || [],
  userBalance: getStoredBalance(),
  redeemedGiftCodes: JSON.parse(localStorage.getItem('amz_redeemed_gift_codes')) || [],
  filters: {
    category: 'all',
    searchQuery: '',
    brand: 'all',
    inStockOnly: false,
    dealsOnly: false,
    primeOnly: false,
    minRating: 0,
    maxPrice: 2000,
    sortBy: 'featured'
  },
  theme: localStorage.getItem('amz_theme') || 'light'
};

document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme
  document.documentElement.setAttribute('data-theme', state.theme);

  // 1. Initialize Hero Carousel
  initHeroCarousel();

  // 2. Initialize Header & Search
  initHeader(
    state,
    (query) => { // Search Callback
      state.filters.searchQuery = query;
      triggerRenderProducts();
    },
    (catId) => { // Category Change Callback
      state.filters.category = catId;
      triggerRenderProducts();
    },
    toggleCartDrawer,
    () => openOrdersModal(state),
    () => openWishlistModal(state, handleMoveWishlistToCart, handleRemoveFromWishlist),
    () => openProfileModal(state, () => {
      renderCartDrawer(state, handleCartUpdate);
    }),
    () => openCouponsModal(state, () => {
      renderCartDrawer(state, handleCartUpdate);
    }),
    toggleTheme,
    () => openNotificationsModal(state),
    () => openGiftCardModal(state, () => updateGiftBalanceHeaderDisplay(state))
  );

  // Initialize balance display
  updateGiftBalanceHeaderDisplay(state);
  updateNotificationBadge(state);

  // 3. Initialize Catalog & Filters
  initCatalog(
    state,
    handleProductClick,
    handleAddToCart,
    (newFilters) => { // Filter Change Callback
      state.filters = { ...state.filters, ...newFilters };
      triggerRenderProducts();
    }
  );

  // 4. Initialize Compare Dock & Coupons
  initCompare(state, handleAddToCart);
  initCoupons(state);

  // 5. Initial Render of Products & Recently Viewed
  triggerRenderProducts();
  renderRecentlyViewed(state, handleProductClick, handleAddToCart);

  // 6. Initialize Wishlist Badge
  initWishlist(state, handleMoveWishlistToCart, handleRemoveFromWishlist);

  // 7. Initialize Cart Drawer
  initCart(
    state,
    handleCartUpdate,
    () => openCheckoutModal(state, handleOrderPlaced)
  );

  // 8. Initialize Quick Category Cards
  renderQuickCards();

  // 9. Start Lightning Deal Timers
  startLightningTimers();

  // 10. Initialize Command Palette (Ctrl+K)
  initCommandPalette(state, {
    openOrders: () => openOrdersModal(state),
    openWishlist: () => openWishlistModal(state, handleMoveWishlistToCart, handleRemoveFromWishlist),
    openCoupons: () => openCouponsModal(state, () => renderCartDrawer(state, handleCartUpdate)),
    openProfile: () => openProfileModal(state, () => renderCartDrawer(state, handleCartUpdate)),
    openGiftCards: () => openGiftCardModal(state, () => updateGiftBalanceHeaderDisplay(state)),
    openCompare: () => {
      const compareSection = document.getElementById('compareDockedBar');
      if (compareSection) compareSection.scrollIntoView({ behavior: 'smooth' });
    },
    toggleTheme: toggleTheme,
    openProduct: (product) => handleProductClick(product)
  });

  // 11. Inject seller listings into product catalog
  injectSellerListings(state);
  triggerRenderProducts();

  // 12. Render AI Recommendations
  renderRecommendationsSection(state, handleProductClick, handleAddToCart);

  // 13. Wire up Seller Marketplace & Prime nav buttons
  const sellerNavBtn = document.getElementById('sellerNavBtn');
  if (sellerNavBtn) {
    sellerNavBtn.addEventListener('click', () =>
      openSellerModal(state, () => {
        triggerRenderProducts();
        renderRecommendationsSection(state, handleProductClick, handleAddToCart);
      })
    );
  }

  const primeNavBtn = document.getElementById('primeNavBtn');
  if (primeNavBtn) {
    primeNavBtn.addEventListener('click', () => openPrimeModal());
  }

  // 14. Wire up Return button (delegated in orders.js)
  document.addEventListener('openReturnModal', (e) => {
    if (e.detail && e.detail.order) openReturnModal(state, e.detail.order);
  });
});

function triggerRenderProducts() {
  renderProducts(
    state,
    handleProductClick,
    handleAddToCart,
    handleToggleWishlist,
    (productId) => {
      toggleCompareProduct(state, productId, handleAddToCart);
      triggerRenderProducts();
    },
    (resetObj) => {
      state.filters = { ...state.filters, ...resetObj };
      triggerRenderProducts();
    }
  );
}

/* Hero Carousel */
function initHeroCarousel() {
  const container = document.getElementById('heroCarousel');
  if (!container) return;

  let currentSlide = 0;

  container.innerHTML = `
    ${HERO_SLIDES.map((slide, idx) => `
      <div class="carousel-slide ${idx === 0 ? 'active' : ''}" style="background: ${slide.bgGradient};">
        <div class="slide-content">
          ${slide.badge ? `<span class="slide-badge">${slide.badge}</span>` : ''}
          <h1 class="slide-title">${slide.title}</h1>
          <p class="slide-subtitle">${slide.subtitle}</p>
          <button class="slide-btn">${slide.buttonText}</button>
        </div>
        <img src="${slide.image}" class="carousel-img-preview" alt="${slide.title}" />
      </div>
    `).join('')}

    <button class="carousel-arrow prev" id="heroPrevBtn"><i class="fas fa-chevron-left"></i></button>
    <button class="carousel-arrow next" id="heroNextBtn"><i class="fas fa-chevron-right"></i></button>
  `;

  const slides = container.querySelectorAll('.carousel-slide');

  function showSlide(index) {
    slides.forEach((s, i) => s.classList.toggle('active', i === index));
    currentSlide = index;
  }

  container.querySelector('#heroNextBtn').addEventListener('click', () => {
    showSlide((currentSlide + 1) % slides.length);
  });

  container.querySelector('#heroPrevBtn').addEventListener('click', () => {
    showSlide((currentSlide - 1 + slides.length) % slides.length);
  });

  // Auto-play timer (every 6 seconds)
  setInterval(() => {
    showSlide((currentSlide + 1) % slides.length);
  }, 6000);
}

/* Quick Category Cards */
function renderQuickCards() {
  const container = document.getElementById('quickCardsGrid');
  if (!container) return;

  const quickDeals = [
    { title: 'Tagesangebote in Elektronik', cat: 'electronics', img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80' },
    { title: 'Smart Home & Alexa Neuheiten', cat: 'smart-home', img: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=500&auto=format&fit=crop&q=80' },
    { title: 'K├╝che & Haushalts-Highlights', cat: 'home-kitchen', img: 'https://images.unsplash.com/photo-1517668808822-9eaa03afd2af?w=500&auto=format&fit=crop&q=80' },
    { title: 'Bestseller in Gaming', cat: 'gaming', img: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=80' }
  ];

  container.innerHTML = quickDeals.map(card => `
    <div class="quick-card">
      <h3 class="quick-card-title">${card.title}</h3>
      <img src="${card.img}" class="quick-card-img" alt="${card.title}" />
      <a href="#" class="quick-card-link" data-cat="${card.cat}">Jetzt st├Âbern <i class="fas fa-arrow-right"></i></a>
    </div>
  `).join('');

  container.querySelectorAll('.quick-card-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const cat = link.getAttribute('data-cat');
      state.filters.category = cat;
      const catSelect = document.getElementById('searchCategorySelect');
      if (catSelect) catSelect.value = cat;
      triggerRenderProducts();
      document.getElementById('catalogSection').scrollIntoView({ behavior: 'smooth' });
    });
  });
}

/* Event Handlers */
function handleProductClick(product) {
  trackRecentlyViewed(state, product.id);
  renderRecentlyViewed(state, handleProductClick, handleAddToCart);
  // Update AI recommendations after viewing a product
  renderRecommendationsSection(state, handleProductClick, handleAddToCart);

  openProductModal(
    product,
    handleAddToCart,
    (prod, qty) => {
      handleAddToCart(prod, qty);
      openCheckoutModal(state, handleOrderPlaced);
    },
    (productId, newReview) => {
      const prod = state.products.find(p => p.id === productId);
      if (prod) {
        prod.customReviews = prod.customReviews || [];
        prod.customReviews.unshift(newReview);

        const customObj = JSON.parse(localStorage.getItem('amz_custom_reviews')) || {};
        customObj[productId] = prod.customReviews;
        localStorage.setItem('amz_custom_reviews', JSON.stringify(customObj));

        triggerRenderProducts();
      }
    },
    (productId, newQa) => {
      const prod = state.products.find(p => p.id === productId);
      if (prod) {
        prod.qa = prod.qa || [];
        prod.qa.unshift(newQa);

        const qaObj = JSON.parse(localStorage.getItem('amz_qa')) || {};
        qaObj[productId] = prod.qa;
        localStorage.setItem('amz_qa', JSON.stringify(qaObj));

        triggerRenderProducts();
      }
    }
  );
}

function handleAddToCart(product, qty = 1) {
  const existingIndex = state.cart.findIndex(item => item.product.id === product.id);
  if (existingIndex >= 0) {
    state.cart[existingIndex].qty += qty;
  } else {
    state.cart.push({ product, qty });
  }

  saveCartState();
  renderCartDrawer(state, handleCartUpdate);
  toggleCartDrawer();

  showToast(`"${product.title}" zum Warenkorb hinzugef├╝gt (${qty}x)`, 'cart');
}

function handleCartUpdate(productId, qty) {
  if (qty <= 0) {
    state.cart = state.cart.filter(item => item.product.id !== productId || item.product.id != productId);
    showToast('Artikel aus dem Warenkorb entfernt', 'info');
  } else {
    const item = state.cart.find(item => item.product.id === productId || item.product.id == productId);
    if (item) item.qty = qty;
  }

  saveCartState();
  renderCartDrawer(state, handleCartUpdate);
}

function handleOrderPlaced(order) {
  state.orders.unshift(order);
  state.cart = []; // Empty cart after order
  saveCartState();
  saveOrdersState();
  renderCartDrawer(state, handleCartUpdate);
  showToast(`Bestellung #${order.id} erfolgreich aufgegeben!`, 'success');
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', state.theme);
  localStorage.setItem('amz_theme', state.theme);
  showToast(`Design-Modus: ${state.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}`, 'info');
}

function handleToggleWishlist(product) {
  const index = state.wishlist.findIndex(item => item.id === product.id);
  if (index >= 0) {
    state.wishlist.splice(index, 1);
    showToast(`"${product.title}" aus Wunschliste entfernt`, 'info', 'fa-heart-broken');
  } else {
    state.wishlist.push(product);
    showToast(`"${product.title}" zur Wunschliste hinzugef├╝gt!`, 'wishlist');
  }

  saveWishlistState();
  updateWishlistBadge(state.wishlist.length);
  triggerRenderProducts();
}

function handleMoveWishlistToCart(product) {
  handleAddToCart(product, 1);
  handleRemoveFromWishlist(product.id);
}

function handleRemoveFromWishlist(productId) {
  const item = state.wishlist.find(i => i.id === productId);
  state.wishlist = state.wishlist.filter(item => item.id !== productId);
  saveWishlistState();
  updateWishlistBadge(state.wishlist.length);
  triggerRenderProducts();

  if (item) {
    showToast(`"${item.title}" aus der Wunschliste entfernt`, 'info');
  }
}

function saveCartState() {
  localStorage.setItem('amz_cart', JSON.stringify(state.cart));
}

function saveOrdersState() {
  localStorage.setItem('amz_orders', JSON.stringify(state.orders));
}

function saveWishlistState() {
  localStorage.setItem('amz_wishlist', JSON.stringify(state.wishlist));
}
