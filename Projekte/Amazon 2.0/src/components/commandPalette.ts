// ============================================================
// Amazon 2.0 – Command Palette (Ctrl+K) Component
// ============================================================
import type { AppState, Product } from '../types';
import { debounce } from '../utils/formatters';

interface CommandPaletteActions {
  openOrders: () => void;
  openWishlist: () => void;
  openCoupons: () => void;
  openProfile: () => void;
  openGiftCards: () => void;
  openCompare: () => void;
  toggleTheme: () => void;
  openProduct: (product: Product) => void;
}

let paletteEl: HTMLElement | null = null;
let overlayEl: HTMLElement | null = null;
let isOpen = false;

const STATIC_COMMANDS = [
  { id: 'orders', label: '📦 Bestellungen', desc: 'Meine Bestellungen anzeigen', key: 'openOrders' },
  { id: 'wishlist', label: '♥ Wunschliste', desc: 'Wunschliste öffnen', key: 'openWishlist' },
  { id: 'coupons', label: '🎟 Gutscheine', desc: 'Gutscheine & Rabatte', key: 'openCoupons' },
  { id: 'profile', label: '👤 Profil', desc: 'Mein Konto bearbeiten', key: 'openProfile' },
  { id: 'gift', label: '🎁 Guthaben', desc: 'Geschenkkarten & Guthaben', key: 'openGiftCards' },
  { id: 'compare', label: '⚖ Vergleich', desc: 'Produktvergleich anzeigen', key: 'openCompare' },
  { id: 'theme', label: '🌙 Design wechseln', desc: 'Hell/Dunkel Modus umschalten', key: 'toggleTheme' },
] as const;

export function initCommandPalette(state: AppState, actions: CommandPaletteActions): void {
  // Create palette element
  paletteEl = document.createElement('div');
  paletteEl.id = 'commandPalette';
  paletteEl.className = 'command-palette hidden';
  paletteEl.setAttribute('role', 'dialog');
  paletteEl.setAttribute('aria-modal', 'true');
  paletteEl.setAttribute('aria-label', 'Schnellsuche');

  overlayEl = document.createElement('div');
  overlayEl.className = 'command-palette-overlay hidden';
  overlayEl.addEventListener('click', closePalette);

  document.body.appendChild(overlayEl);
  document.body.appendChild(paletteEl);

  // Keyboard shortcut
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      isOpen ? closePalette() : openPalette(state, actions);
    }
    if (e.key === 'Escape' && isOpen) closePalette();
  });

  // Nav button
  document.getElementById('commandPaletteBtn')?.addEventListener('click', () => {
    isOpen ? closePalette() : openPalette(state, actions);
  });
}

function openPalette(state: AppState, actions: CommandPaletteActions): void {
  if (!paletteEl || !overlayEl) return;
  isOpen = true;

  paletteEl.innerHTML = `
    <div class="palette-inner">
      <div class="palette-search-wrap">
        <svg class="palette-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input 
          type="text" 
          id="paletteInput" 
          class="palette-input" 
          placeholder="Suche Befehle oder Produkte…"
          autocomplete="off"
          aria-label="Schnellsuche"
        />
        <kbd class="palette-esc-kbd">ESC</kbd>
      </div>
      <div class="palette-results" id="paletteResults" role="listbox">
        <!-- Initial results -->
      </div>
    </div>
  `;

  paletteEl.classList.remove('hidden');
  overlayEl.classList.remove('hidden');

  const input = document.getElementById('paletteInput') as HTMLInputElement;
  input?.focus();

  renderResults('', state, actions);

  const debouncedSearch = debounce((query: string) => renderResults(query, state, actions), 200);
  input?.addEventListener('input', () => debouncedSearch(input.value));

  // Arrow key navigation
  let selectedIdx = -1;
  input?.addEventListener('keydown', (e: KeyboardEvent) => {
    const items = paletteEl!.querySelectorAll('.palette-result-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx = Math.min(selectedIdx + 1, items.length - 1);
      updateSelected(items, selectedIdx);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx = Math.max(selectedIdx - 1, 0);
      updateSelected(items, selectedIdx);
    } else if (e.key === 'Enter' && selectedIdx >= 0) {
      (items[selectedIdx] as HTMLElement).click();
    }
  });
}

function updateSelected(items: NodeListOf<Element>, idx: number): void {
  items.forEach((item, i) => item.classList.toggle('selected', i === idx));
  (items[idx] as HTMLElement)?.scrollIntoView({ block: 'nearest' });
}

function renderResults(query: string, state: AppState, actions: CommandPaletteActions): void {
  const resultsEl = document.getElementById('paletteResults');
  if (!resultsEl) return;

  const q = query.toLowerCase().trim();
  let html = '';

  // Static commands
  const matchedCommands = q
    ? STATIC_COMMANDS.filter(cmd =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.desc.toLowerCase().includes(q)
      )
    : STATIC_COMMANDS;

  if (matchedCommands.length > 0) {
    html += `<div class="palette-group-label">Befehle</div>`;
    html += matchedCommands.map(cmd => `
      <button class="palette-result-item" data-command="${cmd.key}" role="option">
        <span class="result-icon">${cmd.label.split(' ')[0]}</span>
        <span class="result-info">
          <span class="result-label">${cmd.label.split(' ').slice(1).join(' ')}</span>
          <span class="result-desc">${cmd.desc}</span>
        </span>
      </button>
    `).join('');
  }

  // Product search
  if (q.length >= 2) {
    const matchedProducts = state.products
      .filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.tags?.some(t => t.includes(q))
      )
      .slice(0, 5);

    if (matchedProducts.length > 0) {
      html += `<div class="palette-group-label">Produkte</div>`;
      html += matchedProducts.map(p => `
        <button class="palette-result-item" data-product-id="${p.id}" role="option">
          <img src="${p.images[0]}" alt="" class="result-product-img" width="32" height="32" />
          <span class="result-info">
            <span class="result-label">${p.title.slice(0, 60)}</span>
            <span class="result-desc">${p.brand} · ${p.price.toFixed(2).replace('.', ',')}€</span>
          </span>
        </button>
      `).join('');
    }
  }

  if (!html) {
    html = `<div class="palette-no-results">Keine Ergebnisse für "${query}"</div>`;
  }

  resultsEl.innerHTML = html;

  // Wire command clicks
  resultsEl.querySelectorAll('[data-command]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-command') as keyof CommandPaletteActions;
      closePalette();
      (actions[key] as () => void)();
    });
  });

  // Wire product clicks
  resultsEl.querySelectorAll('[data-product-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const productId = btn.getAttribute('data-product-id')!;
      const product = state.products.find(p => p.id === productId);
      if (product) {
        closePalette();
        actions.openProduct(product);
      }
    });
  });
}

function closePalette(): void {
  isOpen = false;
  paletteEl?.classList.add('hidden');
  overlayEl?.classList.add('hidden');
}
