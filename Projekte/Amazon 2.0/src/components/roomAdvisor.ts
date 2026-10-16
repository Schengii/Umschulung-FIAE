// ============================================================
// Amazon 2.0 – Multimodal AI Room & Decor Advisor Component
// ============================================================
import type { AppState, Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { showToast } from './toast';
import { saveCart, emit } from '../store';
import { playSound } from '../utils/audio';

let roomAdvisorModal: HTMLElement | null = null;

interface RoomPreset {
  id: string;
  name: string;
  style: string;
  icon: string;
  palette: string[];
  recommendedCategories: string[];
  description: string;
}

const PRESETS: RoomPreset[] = [
  {
    id: 'office',
    name: 'Modernes Home-Office',
    style: 'Minimalistisch & Produktiv',
    icon: '💻',
    palette: ['#1e293b', '#64748b', '#38bdf8', '#f8fafc'],
    recommendedCategories: ['electronics', 'audio'],
    description: 'Klare Linien, blendfreie Beleuchtung und ergonomische High-End Technik.',
  },
  {
    id: 'living',
    name: 'Gemütliches Wohnzimmer',
    style: 'Warm & Skandinavisch',
    icon: '🛋️',
    palette: ['#78350f', '#d97706', '#fef3c7', '#451a03'],
    recommendedCategories: ['home', 'electronics'],
    description: 'Warme Holztöne, smarte Ambient-Beleuchtung und smarter Sound.',
  },
  {
    id: 'gaming',
    name: 'Cyberpunk Gaming Battle-Station',
    style: 'RGB & Performance',
    icon: '🎮',
    palette: ['#0f172a', '#ec4899', '#8b5cf6', '#06b6d4'],
    recommendedCategories: ['electronics', 'audio'],
    description: 'High-Refresh Displays, mechanische RGB-Tastaturen und immersive Akustik.',
  },
];

export function openRoomAdvisorModal(state: AppState): void {
  if (!roomAdvisorModal) {
    roomAdvisorModal = document.createElement('div');
    roomAdvisorModal.id = 'roomAdvisorModal';
    roomAdvisorModal.className = 'modal-overlay';
    document.body.appendChild(roomAdvisorModal);
  }

  renderAdvisorView(state, PRESETS[0]);
}

function renderAdvisorView(state: AppState, selectedPreset: RoomPreset): void {
  if (!roomAdvisorModal) return;

  const recommendations = getMatchingProducts(state, selectedPreset);
  const bundleTotal = recommendations.reduce((sum, p) => sum + p.price, 0);
  const discountTotal = bundleTotal * 0.90; // 10% Room makeover discount

  roomAdvisorModal.innerHTML = `
    <div class="modal-dialog room-advisor-dialog">
      <button class="modal-close" id="closeAdvisorModal">✕</button>
      <div class="advisor-header">
        <span class="advisor-badge">✨ Multimodale KI-Raumberatung</span>
        <h2>KI-Raum- & Einrichtungs-Berater</h2>
        <p class="subtitle">Wähle deinen Raumtyp oder lade ein Foto hoch für maßgeschneiderte Deko- & Technikempfehlungen!</p>
      </div>

      <!-- Presets Selector -->
      <div class="room-presets-grid">
        ${PRESETS.map(preset => `
          <button class="room-preset-card ${preset.id === selectedPreset.id ? 'active' : ''}" data-preset-id="${preset.id}">
            <span class="preset-icon">${preset.icon}</span>
            <div class="preset-info">
              <strong>${preset.name}</strong>
              <span class="preset-style">${preset.style}</span>
            </div>
          </button>
        `).join('')}
      </div>

      <!-- Room Analysis Card -->
      <div class="room-analysis-card">
        <div class="analysis-meta">
          <h4>🎨 Erkannte Farbpalette & Stil: <em>${selectedPreset.style}</em></h4>
          <p class="text-xs text-muted">${selectedPreset.description}</p>
        </div>
        <div class="palette-swatches">
          ${selectedPreset.palette.map(color => `
            <div class="palette-swatch" style="background: ${color};" title="${color}"></div>
          `).join('')}
        </div>
      </div>

      <!-- Recommended Match Products -->
      <div class="advisor-matches-section">
        <div class="matches-header">
          <h4>📦 Perfekt abgestimmte Produkte (${recommendations.length} Artikel)</h4>
          <span class="bundle-discount-tag">🔥 10% Raum-Paket-Rabatt</span>
        </div>

        <div class="advisor-matches-grid">
          ${recommendations.map(p => `
            <div class="advisor-product-card">
              <img src="${p.images[0]}" alt="${p.title}" class="advisor-prod-img" />
              <div class="advisor-prod-info">
                <span class="advisor-prod-brand">${p.brand}</span>
                <p class="advisor-prod-title">${p.title}</p>
                <div class="advisor-prod-price-row">
                  <strong>${formatPrice(p.price)}</strong>
                  <button class="btn-primary-sm single-add-btn" data-pid="${p.id}">+ Cart</button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <!-- 1-Click Buy Whole Room -->
        <div class="room-bundle-action">
          <div class="room-pricing">
            <span class="text-xs">Gesamtes Raum-Paket:</span>
            <span class="old-price">${formatPrice(bundleTotal)}</span>
            <strong class="new-price">${formatPrice(discountTotal)}</strong>
          </div>
          <button class="btn-primary" id="addRoomBundleBtn">
            🛍️ Komplettes Raum-Paket in den Warenkorb (-10%)
          </button>
        </div>
      </div>
    </div>
  `;

  roomAdvisorModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  const closeModal = () => {
    roomAdvisorModal?.classList.remove('open');
    document.body.style.overflow = '';
  };

  document.getElementById('closeAdvisorModal')?.addEventListener('click', closeModal);
  roomAdvisorModal.addEventListener('click', e => { if (e.target === roomAdvisorModal) closeModal(); });

  // Preset clicks
  roomAdvisorModal.querySelectorAll('.room-preset-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = btn.getAttribute('data-preset-id');
      const found = PRESETS.find(p => p.id === pid);
      if (found) {
        playSound('click');
        renderAdvisorView(state, found);
      }
    });
  });

  // Single add
  roomAdvisorModal.querySelectorAll('.single-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pid = btn.getAttribute('data-pid');
      const prod = state.products.find(p => p.id === pid);
      if (prod) {
        state.cart.push({ product: prod, qty: 1, addedAt: Date.now() });
        saveCart();
        emit('cart:changed');
        playSound('cart');
        showToast(`🛒 "${prod.title}" zum Warenkorb hinzugefügt!`, 'cart');
      }
    });
  });

  // Bundle add
  document.getElementById('addRoomBundleBtn')?.addEventListener('click', () => {
    recommendations.forEach(prod => {
      state.cart.push({ product: prod, qty: 1, addedAt: Date.now() });
    });
    saveCart();
    emit('cart:changed');
    playSound('success');
    showToast(`🎉 ${recommendations.length} Raum-Produkte mit 10% Rabatt im Warenkorb!`, 'success');
    closeModal();
  });
}

export function getMatchingProducts(state: AppState, preset: RoomPreset): Product[] {
  const matches: Product[] = [];
  
  preset.recommendedCategories.forEach(cat => {
    const found = state.products.filter(p => p.category === cat && p.inStock);
    if (found.length > 0) {
      matches.push(...found.slice(0, 2));
    }
  });

  return matches.slice(0, 4);
}
