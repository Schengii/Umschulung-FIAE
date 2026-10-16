// ============================================================
// Amazon 2.0 – Holographic 3D Lightfield Display Modal
// ============================================================
import type { AppState } from '../types';
import { getLightfieldConfig } from '../utils/lightfieldDisplay';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

let lfModalEl: HTMLElement | null = null;
let currentAngle = 0;

function getModal(): HTMLElement {
  if (!lfModalEl) {
    lfModalEl = document.createElement('div');
    lfModalEl.id = 'lightfieldModal';
    lfModalEl.className = 'modal-overlay';
    lfModalEl.setAttribute('role', 'dialog');
    lfModalEl.setAttribute('aria-modal', 'true');
    lfModalEl.setAttribute('aria-label', '3D Lichtfeld Display');
    document.body.appendChild(lfModalEl);
  }
  return lfModalEl;
}

export function openLightfieldModal(state: AppState): void {
  const modal = getModal();
  renderLightfieldUI(modal, state);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeLightfieldModal(): void {
  if (lfModalEl) {
    lfModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderLightfieldUI(modal: HTMLElement, state: AppState): void {
  const lf = getLightfieldConfig();
  const sampleProduct = state.products[0];

  modal.innerHTML = `
    <div class="modal-dialog lf-dialog">
      <button class="modal-close" id="closeLFBtn" aria-label="Schließen">✕</button>

      <div class="lf-header">
        <div class="lf-badge">🌌 HOLOGRAPHIC 4D LIGHTFIELD DISPLAY</div>
        <h2>Brillenlose räumliche 3D-Projektion</h2>
        <p class="lf-sub">Multiperspektivische 16-Kanal Lichtfeld-Synthese mit echter Parallaxen-Tiefenwirkung bei Kopfbewegung.</p>
      </div>

      <!-- 4D Lightfield Canvas Viewport -->
      <div class="lf-spatial-viewport">
        <div class="lf-depth-plane bg" style="transform: translateX(${currentAngle * -0.5}px);"></div>
        <div class="lf-depth-plane mid" style="transform: translateX(${currentAngle * -0.2}px);"></div>
        <div class="lf-depth-plane fg" style="transform: translateX(${currentAngle * 0.4}px) rotateY(${currentAngle}deg);">
          <img src="${sampleProduct.images[0]}" alt="${sampleProduct.title}" class="lf-holo-product" />
        </div>
        <div class="lf-rays-overlay">
          <span>⚡ <strong>${lf.viewsCount} SYNTHETISCHE BLICKWINKEL</strong> (Glasses-Free 3D)</span>
        </div>
      </div>

      <!-- Angle Parallax Slider -->
      <div class="lf-controls-card">
        <div class="lf-slider-row">
          <label>Virtuelle Kopfposition / Betrachtungswinkel: <strong id="angleLbl">${currentAngle}°</strong></label>
          <input type="range" id="angleSlider" min="-30" max="30" step="1" value="${currentAngle}" />
        </div>
      </div>

      <!-- Telemetry Grid -->
      <div class="lf-telemetry-grid">
        <div class="lf-box">
          <span class="lf-lbl">Fokale Tiefe:</span>
          <strong>${lf.focalDepthMm} mm</strong>
        </div>
        <div class="lf-box">
          <span class="lf-lbl">Winkel-Auflösung:</span>
          <strong>${lf.angularResolution}</strong>
        </div>
        <div class="lf-box">
          <span class="lf-lbl">Echte Tiefenebenen:</span>
          <strong style="color: #10b981;">${lf.depthPlanesCount} Ebenen</strong>
        </div>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeLFBtn')?.addEventListener('click', closeLightfieldModal);

  document.getElementById('angleSlider')?.addEventListener('input', (e) => {
    currentAngle = parseInt((e.target as HTMLInputElement).value, 10);
    playSound('click');
    triggerHaptic('light');
    renderLightfieldUI(modal, state);
  });
}
