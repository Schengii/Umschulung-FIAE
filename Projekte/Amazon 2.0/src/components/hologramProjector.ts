// ============================================================
// Amazon 2.0 – WebXR AR Tabletop Hologram Projector
// ============================================================
import type { Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

export type HologramTheme = 'cyan' | 'emerald' | 'amber' | 'amethyst';

export interface HologramSettings {
  theme: HologramTheme;
  scanlineSpeed: number;
  projectionHeight: number; // 0 to 100
  wireframeDensity: number;
  isGlitchActive: boolean;
}

const DEFAULT_SETTINGS: HologramSettings = {
  theme: 'cyan',
  scanlineSpeed: 1.5,
  projectionHeight: 60,
  wireframeDensity: 20,
  isGlitchActive: false,
};

let activeSettings: HologramSettings = { ...DEFAULT_SETTINGS };
let currentRotY = 0;
let isDragging = false;
let startX = 0;
let animationFrameId: number | null = null;
let hologramModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!hologramModalEl) {
    hologramModalEl = document.createElement('div');
    hologramModalEl.id = 'hologramProjectorModal';
    hologramModalEl.className = 'modal-overlay hologram-overlay';
    hologramModalEl.setAttribute('role', 'dialog');
    hologramModalEl.setAttribute('aria-modal', 'true');
    hologramModalEl.setAttribute('aria-label', 'WebXR AR Hologram Projector');
    document.body.appendChild(hologramModalEl);
  }
  return hologramModalEl;
}

export function openHologramProjectorModal(product: Product): void {
  const modal = getModal();
  renderHologramUI(modal, product);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  setTimeout(() => {
    initHologramCanvas(product);
  }, 50);
}

export function closeHologramProjectorModal(): void {
  if (hologramModalEl) {
    hologramModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function renderHologramUI(modal: HTMLElement, product: Product): void {
  modal.innerHTML = `
    <div class="modal-dialog hologram-dialog">
      <button class="modal-close" id="closeHologramBtn" aria-label="Schließen">✕</button>

      <div class="hologram-header">
        <div class="hologram-badge">🕶️ WEBXR AR TABLETOP HOLOGRAM</div>
        <h2>Virtueller 3D-Hologramm Projektor</h2>
        <p class="hologram-sub">Interaktive Lasergitter-Projektion für „${product.title}“ im holografischen Raum.</p>
      </div>

      <div class="hologram-main-grid">
        <!-- Canvas Viewport -->
        <div class="hologram-canvas-box">
          <canvas id="hologramCanvas" width="600" height="460"></canvas>
          <div class="holo-pedestal-label">⚡ QUANTUM HOLO-EMITTER V3</div>
        </div>

        <!-- Controls Sidebar -->
        <div class="hologram-sidebar">
          <div class="holo-product-preview">
            <img src="${product.images[0]}" alt="${product.title}" class="holo-preview-img" />
            <div>
              <h4>${product.title}</h4>
              <span class="holo-price">${formatPrice(product.price)}</span>
            </div>
          </div>

          <!-- Color Themes -->
          <div class="control-section">
            <label class="control-label">🔮 Hologramm-Spektrum</label>
            <div class="holo-theme-chips">
              <button class="holo-chip ${activeSettings.theme === 'cyan' ? 'active' : ''}" data-theme="cyan">Cyan Tron</button>
              <button class="holo-chip ${activeSettings.theme === 'emerald' ? 'active' : ''}" data-theme="emerald">Emerald Matrix</button>
              <button class="holo-chip ${activeSettings.theme === 'amber' ? 'active' : ''}" data-theme="amber">Amber Synth</button>
              <button class="holo-chip ${activeSettings.theme === 'amethyst' ? 'active' : ''}" data-theme="amethyst">Amethyst Void</button>
            </div>
          </div>

          <!-- Height Slider -->
          <div class="control-section">
            <div class="slider-row">
              <label for="sliderHoloHeight">Schwebungshöhe:</label>
              <span id="valHoloHeight">${activeSettings.projectionHeight}%</span>
            </div>
            <input type="range" id="sliderHoloHeight" class="raytrace-slider" min="20" max="100" value="${activeSettings.projectionHeight}" />
          </div>

          <!-- Glitch Trigger -->
          <div class="control-section">
            <button class="btn-secondary" id="triggerGlitchBtn" style="width: 100%;">
              ⚡ Quanten-Glitch Puls simulieren
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeHologramBtn')?.addEventListener('click', closeHologramProjectorModal);

  // Themes
  modal.querySelectorAll('.holo-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSettings.theme = btn.getAttribute('data-theme') as HologramTheme;
      modal.querySelectorAll('.holo-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playSound('click');
      triggerHaptic('light');
    });
  });

  // Height Slider
  const sliderH = document.getElementById('sliderHoloHeight') as HTMLInputElement;
  sliderH?.addEventListener('input', () => {
    activeSettings.projectionHeight = parseInt(sliderH.value, 10);
    const label = document.getElementById('valHoloHeight');
    if (label) label.textContent = `${activeSettings.projectionHeight}%`;
  });

  // Glitch
  document.getElementById('triggerGlitchBtn')?.addEventListener('click', () => {
    activeSettings.isGlitchActive = true;
    playSound('alert');
    triggerHaptic('heavy');
    setTimeout(() => { activeSettings.isGlitchActive = false; }, 600);
  });
}

function initHologramCanvas(product: Product): void {
  const canvas = document.getElementById('hologramCanvas') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = product.images[0] || '';

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    currentRotY += dx * 0.8;
    startX = e.clientX;
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  let scanlineY = 0;

  function renderHologram() {
    if (!canvas || !ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Deep Dark Hologram Studio Background
    ctx.fillStyle = '#040711';
    ctx.fillRect(0, 0, w, h);

    // Hologram Palette
    let mainColor = '0, 240, 255';
    if (activeSettings.theme === 'emerald') mainColor = '16, 185, 129';
    else if (activeSettings.theme === 'amber') mainColor = '245, 158, 11';
    else if (activeSettings.theme === 'amethyst') mainColor = '168, 85, 247';

    // 1. Emitter Pedestal Grid (Base)
    const baseCenterY = h * 0.82;
    ctx.strokeStyle = `rgba(${mainColor}, 0.25)`;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.ellipse(w / 2, baseCenterY, 180, 50, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(w / 2, baseCenterY, 120, 32, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Holographic Projection Beams (Cone of Light)
    const coneGrad = ctx.createLinearGradient(w / 2, baseCenterY, w / 2, 40);
    coneGrad.addColorStop(0, `rgba(${mainColor}, 0.35)`);
    coneGrad.addColorStop(1, `rgba(${mainColor}, 0.02)`);
    ctx.fillStyle = coneGrad;

    ctx.beginPath();
    ctx.moveTo(w / 2 - 180, baseCenterY);
    ctx.lineTo(w / 2 - 90, 60);
    ctx.lineTo(w / 2 + 90, 60);
    ctx.lineTo(w / 2 + 180, baseCenterY);
    ctx.closePath();
    ctx.fill();

    // 3. Render Floating Hologram Object
    ctx.save();
    const floatOffset = Math.sin(Date.now() / 600) * 8;
    const targetY = (baseCenterY - 140 - (activeSettings.projectionHeight * 0.8)) + floatOffset;
    ctx.translate(w / 2, targetY);

    const radY = (currentRotY * Math.PI) / 180;
    const scaleX = Math.cos(radY);

    if (img.complete && img.naturalWidth > 0) {
      const size = 180;
      ctx.save();
      ctx.scale(scaleX, 1);

      if (activeSettings.isGlitchActive) {
        ctx.translate((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 6);
      }

      ctx.drawImage(img, -size / 2, -size / 2, size, size);

      // Cyan Holo Tint Overlay
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = `rgba(${mainColor}, 0.4)`;
      ctx.fillRect(-size / 2, -size / 2, size, size);

      ctx.restore();
    }

    ctx.restore();

    // 4. Moving Laser Scanlines
    scanlineY = (scanlineY + activeSettings.scanlineSpeed * 2) % h;
    ctx.strokeStyle = `rgba(${mainColor}, 0.6)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2 - 140, scanlineY);
    ctx.lineTo(w / 2 + 140, scanlineY);
    ctx.stroke();

    animationFrameId = requestAnimationFrame(renderHologram);
  }

  renderHologram();
}
