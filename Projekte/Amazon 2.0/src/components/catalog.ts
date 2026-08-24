// ============================================================
// Amazon 2.0 – Product Catalog & Filter Component
// ============================================================
import type { AppState, Product, Filters } from '../types';
import { formatPrice, renderStars, formatDiscount } from '../utils/formatters';
import { CATEGORIES } from '../data/heroSlides';

interface CatalogCallbacks {
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product, qty?: number) => void;
  onToggleWishlist: (product: Product) => void;
  onToggleCompare: (productId: string) => void;
  onFilterChange: (newFilters: Partial<Filters>) => void;
  onResetFilters: (reset: Partial<Filters>) => void;
}

let callbacks: CatalogCallbacks;

export function initCatalog(state: AppState, cbs: CatalogCallbacks): void {
  callbacks = cbs;

  const catalogSection = document.getElementById('catalogSection');
  if (!catalogSection) return;

  catalogSection.innerHTML = `
    <div class="catalog-layout">
      <!-- Sidebar Filters -->
      <aside class="filter-sidebar" id="filterSidebar" aria-label="Produktfilter">
        <div class="filter-header">
          <h2 class="filter-title">Filter</h2>
          <button id="clearFiltersBtn" class="clear-filters-btn">Zurücksetzen</button>
        </div>

        <div class="filter-group">
          <label class="filter-group-label" for="filterCategory">Kategorie</label>
          <select id="filterCategory" class="filter-select">
            ${CATEGORIES.map(c => `<option value="${c.id}">${c.icon} ${c.label}</option>`).join('')}
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-group-label" for="filterBrand">Marke</label>
          <select id="filterBrand" class="filter-select">
            <option value="all">Alle Marken</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-group-label">Max. Preis: <span id="maxPriceDisplay">${state.filters.maxPrice}€</span></label>
          <input type="range" id="maxPriceRange" class="price-range" min="0" max="2000" step="10" value="${state.filters.maxPrice}" />
          <div class="range-labels"><span>0€</span><span>2.000€</span></div>
        </div>

        <div class="filter-group">
          <label class="filter-group-label">Mindestbewertung</label>
          <div class="rating-filter-btns" id="ratingFilter">
            ${[0, 3, 3.5, 4, 4.5].map(r => `
              <button class="rating-btn ${state.filters.minRating === r ? 'active' : ''}" data-rating="${r}">
                ${r === 0 ? 'Alle' : `${r}★+`}
              </button>
            `).join('')}
          </div>
        </div>

        <div class="filter-group">
          <label class="filter-group-label">Optionen</label>
          <label class="filter-check">
            <input type="checkbox" id="inStockFilter" ${state.filters.inStockOnly ? 'checked' : ''} />
            Nur verfügbare Artikel
          </label>
          <label class="filter-check">
            <input type="checkbox" id="dealsFilter" ${state.filters.dealsOnly ? 'checked' : ''} />
            Nur Angebote
          </label>
          <label class="filter-check">
            <input type="checkbox" id="primeFilter" ${state.filters.primeOnly ? 'checked' : ''} />
            <span class="prime-badge-inline">Prime</span> Artikel
          </label>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="catalog-main" id="catalogMain">
        <div class="catalog-toolbar">
          <div class="result-count" id="resultCount">Lade Produkte…</div>
          <div class="toolbar-actions">
            <button id="filterToggleBtn" class="filter-toggle-btn" aria-label="Filter anzeigen">
              ⚙ Filter
            </button>
            <select id="sortSelect" class="sort-select" aria-label="Sortierung">
              <option value="featured">Empfohlen</option>
              <option value="price-asc">Preis aufsteigend</option>
              <option value="price-desc">Preis absteigend</option>
              <option value="rating-desc">Bewertung</option>
              <option value="newest">Neuheiten</option>
              <option value="bestseller">Bestseller</option>
            </select>
          </div>
        </div>

        <div id="productGrid" class="product-grid" role="list" aria-label="Produktkatalog">
          <!-- Products rendered here -->
        </div>

        <div id="noResults" class="no-results hidden">
          <div class="no-results-icon">🔍</div>
          <h3>Keine Produkte gefunden</h3>
          <p>Versuche andere Filter oder Suchbegriffe.</p>
          <button id="resetSearchBtn" class="btn-primary">Filter zurücksetzen</button>
        </div>
      </main>
    </div>
  `;

  // Populate brands
  populateBrandFilter(state);
  wireFilterEvents();
}

function populateBrandFilter(state: AppState): void {
  const select = document.getElementById('filterBrand') as HTMLSelectElement;
  if (!select) return;
  const brands = [...new Set(state.products.map(p => p.brand))].sort();
  brands.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b;
    opt.textContent = b;
    select.appendChild(opt);
  });
}

function wireFilterEvents(): void {
  document.getElementById('filterCategory')?.addEventListener('change', e => {
    const cat = (e.target as HTMLSelectElement).value;
    callbacks.onFilterChange({ category: cat });
    // Also sync header search select
    const headerCatSelect = document.getElementById('searchCategorySelect') as HTMLSelectElement;
    if (headerCatSelect) headerCatSelect.value = cat;
  });

  document.getElementById('filterBrand')?.addEventListener('change', e => {
    callbacks.onFilterChange({ brand: (e.target as HTMLSelectElement).value });
  });

  const priceRange = document.getElementById('maxPriceRange') as HTMLInputElement;
  priceRange?.addEventListener('input', () => {
    const val = Number(priceRange.value);
    const display = document.getElementById('maxPriceDisplay');
    if (display) display.textContent = `${val}€`;
    callbacks.onFilterChange({ maxPrice: val });
  });

  document.getElementById('inStockFilter')?.addEventListener('change', e => {
    callbacks.onFilterChange({ inStockOnly: (e.target as HTMLInputElement).checked });
  });

  document.getElementById('dealsFilter')?.addEventListener('change', e => {
    callbacks.onFilterChange({ dealsOnly: (e.target as HTMLInputElement).checked });
  });

  document.getElementById('primeFilter')?.addEventListener('change', e => {
    callbacks.onFilterChange({ primeOnly: (e.target as HTMLInputElement).checked });
  });

  document.getElementById('sortSelect')?.addEventListener('change', e => {
    callbacks.onFilterChange({ sortBy: (e.target as HTMLSelectElement).value as Filters['sortBy'] });
  });

  document.querySelectorAll('.rating-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.rating-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      callbacks.onFilterChange({ minRating: Number(btn.getAttribute('data-rating')) });
    });
  });

  document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
    callbacks.onResetFilters({
      category: 'all', searchQuery: '', brand: 'all',
      inStockOnly: false, dealsOnly: false, primeOnly: false,
      minRating: 0, maxPrice: 2000, sortBy: 'featured',
    });
    syncFilterUI({ category: 'all', brand: 'all', inStockOnly: false, dealsOnly: false, primeOnly: false, minRating: 0, maxPrice: 2000, sortBy: 'featured' });
  });

  document.getElementById('resetSearchBtn')?.addEventListener('click', () => {
    callbacks.onResetFilters({
      category: 'all', searchQuery: '', brand: 'all',
      inStockOnly: false, dealsOnly: false, primeOnly: false,
      minRating: 0, maxPrice: 2000, sortBy: 'featured',
    });
    syncFilterUI({ category: 'all', brand: 'all', inStockOnly: false, dealsOnly: false, primeOnly: false, minRating: 0, maxPrice: 2000, sortBy: 'featured' });
  });

  // Mobile filter toggle
  document.getElementById('filterToggleBtn')?.addEventListener('click', () => {
    const sidebar = document.getElementById('filterSidebar');
    sidebar?.classList.toggle('open');
  });
}

function syncFilterUI(filters: Partial<Filters>): void {
  if (filters.category !== undefined) {
    const el = document.getElementById('filterCategory') as HTMLSelectElement;
    if (el) el.value = filters.category;
  }
  if (filters.brand !== undefined) {
    const el = document.getElementById('filterBrand') as HTMLSelectElement;
    if (el) el.value = filters.brand;
  }
  if (filters.inStockOnly !== undefined) {
    (document.getElementById('inStockFilter') as HTMLInputElement).checked = filters.inStockOnly;
  }
  if (filters.dealsOnly !== undefined) {
    (document.getElementById('dealsFilter') as HTMLInputElement).checked = filters.dealsOnly;
  }
  if (filters.primeOnly !== undefined) {
    (document.getElementById('primeFilter') as HTMLInputElement).checked = filters.primeOnly;
  }
  if (filters.maxPrice !== undefined) {
    const el = document.getElementById('maxPriceRange') as HTMLInputElement;
    if (el) el.value = String(filters.maxPrice);
    const display = document.getElementById('maxPriceDisplay');
    if (display) display.textContent = `${filters.maxPrice}€`;
  }
  if (filters.minRating !== undefined) {
    document.querySelectorAll('.rating-btn').forEach(btn => {
      btn.classList.toggle('active', Number(btn.getAttribute('data-rating')) === filters.minRating);
    });
  }
}

export function renderProducts(state: AppState): void {
  const grid = document.getElementById('productGrid');
  const noResults = document.getElementById('noResults');
  const resultCount = document.getElementById('resultCount');
  if (!grid) return;

  const filtered = filterProducts(state);

  // Show/hide no results
  if (noResults) noResults.classList.toggle('hidden', filtered.length > 0);
  grid.classList.toggle('hidden', filtered.length === 0);

  if (resultCount) {
    resultCount.textContent = `${filtered.length} Produkt${filtered.length !== 1 ? 'e' : ''} gefunden`;
  }

  grid.innerHTML = filtered.map(p => renderProductCard(p, state)).join('');

  // Wire card events
  grid.querySelectorAll('[data-product-id]').forEach(card => {
    const productId = card.getAttribute('data-product-id')!;
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    card.querySelector('.product-card-img-wrap')?.addEventListener('click', () =>
      callbacks.onProductClick(product)
    );
    card.querySelector('.product-title-link')?.addEventListener('click', () =>
      callbacks.onProductClick(product)
    );
    card.querySelector('.add-to-cart-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      callbacks.onAddToCart(product, 1);
    });
    card.querySelector('.wishlist-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      callbacks.onToggleWishlist(product);
    });
    card.querySelector('.compare-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      callbacks.onToggleCompare(product.id);
    });
  });

  // Sync filter sidebar values
  syncFilterUI(state.filters);
}

function renderProductCard(product: Product, state: AppState): string {
  const inWishlist = state.wishlist.some(w => w.id === product.id);
  const inCompare = state.compareList.some(c => c.id === product.id);
  const discount = product.discount
    ? formatDiscount(product.originalPrice!, product.price)
    : null;

  return `
    <article class="product-card ${!product.inStock ? 'out-of-stock' : ''}" 
             data-product-id="${product.id}" 
             role="listitem"
             aria-label="${product.title}">
      
      <!-- Badges -->
      <div class="card-badges">
        ${product.isBestseller ? '<span class="badge-tag badge-bestseller">Bestseller</span>' : ''}
        ${product.isNew ? '<span class="badge-tag badge-new">Neu</span>' : ''}
        ${product.isLightningDeal ? '<span class="badge-tag badge-lightning">⚡ Blitz</span>' : ''}
        ${discount ? `<span class="badge-tag badge-discount">${discount}</span>` : ''}
        ${product.isPrime ? '<span class="badge-tag badge-prime">⭐ Prime</span>' : ''}
        ${!product.inStock ? '<span class="badge-tag badge-out">Vergriffen</span>' : ''}
      </div>

      <!-- Wishlist button -->
      <button class="wishlist-btn ${inWishlist ? 'active' : ''}" 
              aria-label="${inWishlist ? 'Von Wunschliste entfernen' : 'Zur Wunschliste hinzufügen'}"
              aria-pressed="${inWishlist}">
        ${inWishlist ? '♥' : '♡'}
      </button>

      <!-- Image -->
      <div class="product-card-img-wrap" role="button" tabindex="0" aria-label="Produkt ansehen">
        <img 
          src="${product.images[0]}" 
          alt="${product.title}" 
          class="product-card-img"
          loading="lazy"
          width="280" height="200"
        />
      </div>

      <!-- Info -->
      <div class="product-card-info">
        <p class="product-brand">${product.brand}</p>
        <h3 class="product-title">
          <button class="product-title-link">${product.title}</button>
        </h3>
        
        <div class="product-rating">
          ${renderStars(product.rating)}
          <span class="review-count">(${product.reviewCount.toLocaleString('de-DE')})</span>
        </div>

        <div class="product-price-row">
          <span class="product-price">${formatPrice(product.price)}</span>
          ${product.originalPrice ? `<span class="product-original-price">${formatPrice(product.originalPrice)}</span>` : ''}
        </div>

        ${!product.inStock
          ? '<p class="stock-warning">⚠ Derzeit nicht verfügbar</p>'
          : product.stockQty && product.stockQty <= 10
            ? `<p class="stock-low">Nur noch ${product.stockQty} auf Lager!</p>`
            : ''
        }
      </div>

      <!-- Actions -->
      <div class="product-card-actions">
        <button 
          class="add-to-cart-btn ${!product.inStock ? 'disabled' : ''}" 
          ${!product.inStock ? 'disabled aria-disabled="true"' : ''}
          aria-label="${product.inStock ? `${product.title} in den Warenkorb` : 'Nicht verfügbar'}"
        >
          ${product.inStock ? '🛒 In den Warenkorb' : 'Vergriffen'}
        </button>
        <button class="compare-btn ${inCompare ? 'active' : ''}" 
                aria-label="${inCompare ? 'Aus Vergleich entfernen' : 'Zum Vergleich hinzufügen'}"
                title="Vergleichen">
          ⚖
        </button>
      </div>
    </article>
  `;
}

export function filterProducts(state: AppState): Product[] {
  let { products, filters } = state;

  // Search
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    products = products.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q))
    );
  }

  // Category
  if (filters.category && filters.category !== 'all') {
    products = products.filter(p => p.category === filters.category);
  }

  // Brand
  if (filters.brand && filters.brand !== 'all') {
    products = products.filter(p => p.brand === filters.brand);
  }

  // In Stock
  if (filters.inStockOnly) {
    products = products.filter(p => p.inStock);
  }

  // Deals only
  if (filters.dealsOnly) {
    products = products.filter(p => !!p.discount || p.isLightningDeal);
  }

  // Prime only
  if (filters.primeOnly) {
    products = products.filter(p => p.isPrime);
  }

  // Min rating
  if (filters.minRating > 0) {
    products = products.filter(p => p.rating >= filters.minRating);
  }

  // Max price
  if (filters.maxPrice < 2000) {
    products = products.filter(p => p.price <= filters.maxPrice);
  }

  // Sort
  switch (filters.sortBy) {
    case 'price-asc':
      products = [...products].sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      products = [...products].sort((a, b) => b.price - a.price);
      break;
    case 'rating-desc':
      products = [...products].sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      products = [...products].filter(p => p.isNew).concat(products.filter(p => !p.isNew));
      break;
    case 'bestseller':
      products = [...products].filter(p => p.isBestseller).concat(products.filter(p => !p.isBestseller));
      break;
    default:
      break;
  }

  return products;
}
