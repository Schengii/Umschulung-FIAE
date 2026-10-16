// ============================================================
// Amazon 2.0 – Smart-Mirror Virtual Dressing Room Studio
// ============================================================
import type { AppState, Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';
import { emit } from '../store';

export type MirrorMode = 'sunglasses' | 'lipstick' | 'earrings';

let mirrorModalEl: HTMLElement | null = null;
let activeMirrorMode: MirrorMode = 'sunglasses';
let activeColor = '#d97706'; // gold

function getModal(): HTMLElement {
  if (!mirrorModalEl) {
    mirrorModalEl = document.createElement('div');
    mirrorModalEl.id = 'smartMirrorModal';
    mirrorModalEl.className = 'modal-overlay';
    mirrorModalEl.setAttribute('role', 'dialog');
    mirrorModalEl.setAttribute('aria-modal', 'true');
    mirrorModalEl.setAttribute('aria-label', 'Smart-Mirror Virtual Dressing Room');
    document.body.appendChild(mirrorModalEl);
  }
  return mirrorModalEl;
}

export function openSmartMirrorModal(state: AppState): void {
  const modal = getModal();
  renderMirrorUI(modal, state);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeSmartMirrorModal(): void {
  if (mirrorModalEl) {
    mirrorModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderMirrorUI(modal: HTMLElement, state: AppState): void {
  modal.innerHTML = `
    <div class="modal-dialog mirror-dialog">
      <button class="modal-close" id="closeMirrorBtn" aria-label="Schließen">✕</button>

      <div class="mirror-header">
        <div class="mirror-badge">🪞 SMART-MIRROR VIRTUAL DRESSING ROOM</div>
        <h2>Virtuelle Brillen- & Make-up Anprobe</h2>
        <p class="mirror-sub">Echtzeit-Kamera Face-Tracking & Canvas Mesh Overlay für Accessoires und Kosmetik.</p>
      </div>

      <div class="mirror-main-grid">
        <!-- Live Face Viewport -->
        <div class="mirror-viewport-card mode-${activeMirrorMode}">
          <div class="mirror-face-silhouette">
            <div class="face-oval">
              <div class="face-eyes-row">
                <div class="virtual-eyewear" style="border-color: ${activeColor}; display: ${activeMirrorMode === 'sunglasses' ? 'flex' : 'none'};">
                  <div class="lens left"></div>
                  <div class="bridge"></div>
                  <div class="lens right"></div>
                </div>
              </div>
              <div class="face-mouth-row">
                <div class="virtual-lips" style="background: ${activeColor}; display: ${activeMirrorMode === 'lipstick' ? 'block' : 'none'};"></div>
              </div>
            </div>
            <div class="face-tracking-dots">
              <span class="dot d1"></span><span class="dot d2"></span><span class="dot d3"></span>
            </div>
          </div>

          <div class="mirror-cam-status">
            <span>🔴 Live Web-Cam Tracking (60 FPS)</span>
          </div>
        </div>

        <!-- Controls Sidebar -->
        <div class="mirror-controls-panel">
          <div class="mirror-mode-tabs">
            <button class="m-tab-btn ${activeMirrorMode === 'sunglasses' ? 'active' : ''}" data-mode="sunglasses">🕶️ Brillen</button>
            <button class="m-tab-btn ${activeMirrorMode === 'lipstick' ? 'active' : ''}" data-mode="lipstick">💄 Lippenstift</button>
          </div>

          <div class="color-palette-section">
            <label class="palette-label">🎨 Farbvariante & Finish:</label>
            <div class="color-swatches-row">
              <button class="swatch ${activeColor === '#d97706' ? 'active' : ''}" style="background: #d97706;" data-color="#d97706" title="Gold"></button>
              <button class="swatch ${activeColor === '#000000' ? 'active' : ''}" style="background: #000000;" data-color="#000000" title="Matte Black"></button>
              <button class="swatch ${activeColor === '#ef4444' ? 'active' : ''}" style="background: #ef4444;" data-color="#ef4444" title="Ruby Red"></button>
              <button class="swatch ${activeColor === '#ec4899' ? 'active' : ''}" style="background: #ec4899;" data-color="#ec4899" title="Berry Pink"></button>
              <button class="swatch ${activeColor === '#06b6d4' ? 'active' : ''}" style="background: #06b6d4;" data-color="#06b6d4" title="Neon Cyan"></button>
            </div>
          </div>

          <div class="mirror-product-summary">
            <h4>${activeMirrorMode === 'sunglasses' ? 'Ray-Ban Aviator Classic' : 'Velvet Matte Long-Stay Lipstick'}</h4>
            <span class="m-price">${formatPrice(activeMirrorMode === 'sunglasses' ? 149.00 : 28.50)}</span>
          </div>

          <button class="btn-primary btn-add-mirror-item" id="addMirrorProductBtn">
            🛒 Ausgewählte Variante in den Warenkorb
          </button>
        </div>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeMirrorBtn')?.addEventListener('click', closeSmartMirrorModal);

  modal.querySelectorAll('.m-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeMirrorMode = btn.getAttribute('data-mode') as MirrorMode;
      playSound('click');
      triggerHaptic('light');
      renderMirrorUI(modal, state);
    });
  });

  modal.querySelectorAll('.swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      activeColor = btn.getAttribute('data-color') || '#d97706';
      playSound('click');
      triggerHaptic('light');
      renderMirrorUI(modal, state);
    });
  });

  document.getElementById('addMirrorProductBtn')?.addEventListener('click', () => {
    const isSun = activeMirrorMode === 'sunglasses';
    const dummyProduct: Product = {
      id: isSun ? 'mirror-sun-1' : 'mirror-lip-1',
      title: isSun ? 'Ray-Ban Aviator Classic Sunglasses' : 'Velvet Matte Long-Stay Lipstick',
      price: isSun ? 149.00 : 28.50,
      originalPrice: isSun ? 179.00 : 34.00,
      rating: 4.8,
      reviewCount: 312,
      category: 'fashion',
      brand: isSun ? 'Ray-Ban' : 'L’Oréal Luxe',
      inStock: true,
      isPrime: true,
      images: [
        isSun
          ? 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500'
          : 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=500',
      ],
      description: 'Virtuell anprobiertes Premium-Accessoire mit perfektem Sitz.',
    };

    const existing = state.cart.find(c => c.product.id === dummyProduct.id);
    if (existing) existing.qty += 1;
    else state.cart.push({ product: dummyProduct, qty: 1, addedAt: Date.now() });

    emit('cart:changed');
    playSound('cart');
    triggerHaptic('heavy');
    showToast(`🪞 „${dummyProduct.title}“ wurde in den Warenkorb gelegt!`, 'success');
    closeSmartMirrorModal();
  });
}
