// ============================================================
// Amazon 2.0 – Virtual 3D Store Walkthrough Component
// ============================================================
import type { AppState, Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { showToast } from './toast';

let storeModal: HTMLElement | null = null;
let animFrame: number | null = null;

// Camera position in 3D store space
let posX = 0;
let posZ = 0;

export function openVirtualStoreModal(
  state: AppState,
  onAddToCart: (p: Product) => void,
  onProductClick: (p: Product) => void
): void {
  if (!storeModal) {
    storeModal = document.createElement('div');
    storeModal.id = 'virtualStoreModal';
    storeModal.className = 'modal-overlay';
    document.body.appendChild(storeModal);
  }

  storeModal.innerHTML = `
    <div class="modal-dialog virtual-store-dialog">
      <button class="modal-close" id="closeStoreModal">✕</button>
      <div class="virtual-store-header">
        <h2>🛍️ Virtueller 3D-Showroom & Store Walkthrough</h2>
        <div class="store-controls-hint">⌨️ <strong>W, A, S, D</strong> oder <strong>Pfeiltasten</strong> zum Gehen · Klick auf Regal zum Kaufen</div>
      </div>

      <div class="virtual-store-viewport">
        <canvas id="virtualStoreCanvas" width="720" height="420"></canvas>
        
        <div class="store-hud-overlay" id="storeHud">
          <div class="hud-status">📍 Position: Hauptgang | Blick: Showroom Center</div>
          <div class="hud-selected-product hidden" id="hudProductCard">
            <span id="hudProdTitle">Kopfhörer Pro</span>
            <strong id="hudProdPrice">149,00 €</strong>
            <button class="btn-primary sm" id="hudAddCartBtn">🛒 In den Warenkorb</button>
            <button class="btn-secondary sm" id="hudInspectBtn">🔍 Details</button>
          </div>
        </div>
      </div>

      <div class="store-nav-pad">
        <button class="pad-btn" id="padUp">▲ W</button>
        <div class="pad-row">
          <button class="pad-btn" id="padLeft">◄ A</button>
          <button class="pad-btn" id="padDown">▼ S</button>
          <button class="pad-btn" id="padRight">► D</button>
        </div>
      </div>
    </div>
  `;

  storeModal.classList.add('open');

  const closeModal = () => {
    storeModal?.classList.remove('open');
    if (animFrame) cancelAnimationFrame(animFrame);
  };
  document.getElementById('closeStoreModal')?.addEventListener('click', closeModal);
  storeModal.addEventListener('click', e => { if (e.target === storeModal) closeModal(); });

  const canvas = document.getElementById('virtualStoreCanvas') as HTMLCanvasElement;
  if (canvas) init3DStoreCanvas(canvas, state, onAddToCart, onProductClick);

  // Keyboard navigation
  const onKeyDown = (e: KeyboardEvent) => {
    if (!storeModal?.classList.contains('open')) return;
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp') moveCamera(0, -15);
    if (e.key === 's' || e.key === 'S' || e.key === 'ArrowDown') moveCamera(0, 15);
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') moveCamera(-15, 0);
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') moveCamera(15, 0);
  };
  window.addEventListener('keydown', onKeyDown);

  // Touch/On-screen pad navigation
  document.getElementById('padUp')?.addEventListener('click', () => moveCamera(0, -20));
  document.getElementById('padDown')?.addEventListener('click', () => moveCamera(0, 20));
  document.getElementById('padLeft')?.addEventListener('click', () => moveCamera(-20, 0));
  document.getElementById('padRight')?.addEventListener('click', () => moveCamera(20, 0));
}

function moveCamera(dx: number, dz: number): void {
  posX += dx;
  posZ += dz;
  posX = Math.max(-200, Math.min(200, posX));
  posZ = Math.max(-300, Math.min(100, posZ));
}

function init3DStoreCanvas(
  canvas: HTMLCanvasElement,
  state: AppState,
  onAddToCart: (p: Product) => void,
  onProductClick: (p: Product) => void
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const displayProducts = state.products.slice(0, 6);

  // 3D Shelf positions in store space
  const shelfPositions = [
    { x: -180, z: -200, title: 'Audio & Tech' },
    { x: 0, z: -250, title: 'Bestseller' },
    { x: 180, z: -200, title: 'Smart Home' },
  ];

  canvas.addEventListener('click', () => {
    // Select product on click
    const targetProd = displayProducts[Math.floor(Math.random() * displayProducts.length)];
    if (targetProd) {
      showHudProduct(targetProd);
    }
  });

  function showHudProduct(prod: Product): void {
    const card = document.getElementById('hudProductCard');
    const title = document.getElementById('hudProdTitle');
    const price = document.getElementById('hudProdPrice');
    const addBtn = document.getElementById('hudAddCartBtn');
    const inspectBtn = document.getElementById('hudInspectBtn');

    if (card && title && price) {
      card.classList.remove('hidden');
      title.textContent = prod.title;
      price.textContent = formatPrice(prod.price);

      addBtn?.replaceWith(addBtn.cloneNode(true));
      inspectBtn?.replaceWith(inspectBtn.cloneNode(true));

      document.getElementById('hudAddCartBtn')?.addEventListener('click', () => {
        onAddToCart(prod);
        showToast(`🛒 "${prod.title}" aus dem 3D-Store zum Warenkorb hinzugefügt!`, 'cart');
      });

      document.getElementById('hudInspectBtn')?.addEventListener('click', () => {
        onProductClick(prod);
      });
    }
  }

  function renderStore(): void {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    // Draw 3D Store Background & Ceiling Lights
    const bgGrad = ctx!.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0f172a');
    bgGrad.addColorStop(0.5, '#1e293b');
    bgGrad.addColorStop(1, '#090d16');
    ctx!.fillStyle = bgGrad;
    ctx!.fillRect(0, 0, w, h);

    // Draw 3D Perspective Grid Floor
    ctx!.strokeStyle = 'rgba(56, 189, 248, 0.2)';
    ctx!.lineWidth = 1;

    const horizonY = 160 + posZ * 0.2;
    for (let x = -400; x <= w + 400; x += 40) {
      ctx!.beginPath();
      ctx!.moveTo(w / 2 + (x - w / 2 - posX) * 0.3, horizonY);
      ctx!.lineTo(w / 2 + (x - w / 2 - posX) * 2.5, h);
      ctx!.stroke();
    }

    for (let y = horizonY; y <= h; y += 20) {
      ctx!.beginPath();
      ctx!.moveTo(0, y);
      ctx!.lineTo(w, y);
      ctx!.stroke();
    }

    // Draw 3D Shelves
    shelfPositions.forEach((shelf, idx) => {
      const screenX = w / 2 + (shelf.x - posX) * 1.4;
      const screenY = horizonY + (shelf.z - posZ) * -0.4;
      const scale = Math.max(0.4, 1 - (shelf.z - posZ) * -0.002);

      if (screenY > 60 && screenY < h) {
        // Shelf structure
        ctx!.fillStyle = '#334155';
        ctx!.fillRect(screenX - 80 * scale, screenY - 50 * scale, 160 * scale, 90 * scale);
        ctx!.strokeStyle = '#FF9900';
        ctx!.lineWidth = 2;
        ctx!.strokeRect(screenX - 80 * scale, screenY - 50 * scale, 160 * scale, 90 * scale);

        // Title tag
        ctx!.fillStyle = '#FF9900';
        ctx!.font = `${Math.floor(12 * scale)}px sans-serif`;
        ctx!.textAlign = 'center';
        ctx!.fillText(shelf.title, screenX, screenY - 60 * scale);

        // Product on shelf
        const prod = displayProducts[idx % displayProducts.length];
        if (prod) {
          ctx!.fillStyle = '#38bdf8';
          ctx!.font = `bold ${Math.floor(11 * scale)}px sans-serif`;
          ctx!.fillText(prod.title.slice(0, 14), screenX, screenY - 10 * scale);
          ctx!.fillStyle = '#00FF88';
          ctx!.fillText(formatPrice(prod.price), screenX, screenY + 15 * scale);
        }
      }
    });

    animFrame = requestAnimationFrame(renderStore);
  }

  renderStore();
}
