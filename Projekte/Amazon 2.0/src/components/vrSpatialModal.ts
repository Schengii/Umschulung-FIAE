// ============================================================
// Amazon 2.0 – Metaverse VR Spatial Commerce Modal
// ============================================================
import type { AppState } from '../types';
import { getVRSpatialSession } from '../utils/vrSpatialCommerce';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';
import { emit } from '../store';

let vrModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!vrModalEl) {
    vrModalEl = document.createElement('div');
    vrModalEl.id = 'vrSpatialModal';
    vrModalEl.className = 'modal-overlay';
    vrModalEl.setAttribute('role', 'dialog');
    vrModalEl.setAttribute('aria-modal', 'true');
    vrModalEl.setAttribute('aria-label', 'Metaverse VR Spatial Shopping');
    document.body.appendChild(vrModalEl);
  }
  return vrModalEl;
}

export function openVRSpatialModal(state: AppState): void {
  const modal = getModal();
  renderVRUI(modal, state);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeVRSpatialModal(): void {
  if (vrModalEl) {
    vrModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderVRUI(modal: HTMLElement, state: AppState): void {
  const session = getVRSpatialSession();
  const sampleProduct = state.products[0];

  modal.innerHTML = `
    <div class="modal-dialog vr-dialog">
      <button class="modal-close" id="closeVRBtn" aria-label="Schließen">✕</button>

      <div class="vr-header">
        <div class="vr-badge">🌌 WEBXR SPATIAL COMMERCE & HAPTIC GLOVES</div>
        <h2>Immersives Metaverse VR Shopping</h2>
        <p class="vr-sub">6DOF Raum-Navigation, Hand-Tracking und haptisches Force-Feedback beim Anfassen virtueller Produkte.</p>
      </div>

      <!-- 3D Spatial Room Viewport -->
      <div class="vr-spatial-viewport">
        <div class="vr-grid-floor"></div>
        <div class="vr-virtual-podium">
          <img src="${sampleProduct.images[0]}" alt="${sampleProduct.title}" class="vr-floating-item" />
          <div class="vr-haptic-hands">
            <span class="vr-hand left">🖐️</span>
            <span class="vr-hand right">✋</span>
          </div>
        </div>
        <div class="vr-telemetry-badge">
          <span>🎮 <strong>${session.frameRateFps} FPS</strong> (90Hz Ultra Low Latency)</span>
          <span>⚡ Force Feedback: <strong>${session.forceFeedbackNewtons} N</strong></span>
        </div>
      </div>

      <!-- VR Device Meta Cards -->
      <div class="vr-devices-grid">
        <div class="vr-dev-box">
          <span class="v-lbl">Headset-Status:</span>
          <strong>${session.headsetModel}</strong>
        </div>
        <div class="vr-dev-box">
          <span class="v-lbl">Haptische Handschuhe:</span>
          <strong style="color: #10b981;">Aktiviert (SenseGlove Nova 2)</strong>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="vr-actions-row">
        <button class="btn-secondary" id="testHapticGripBtn">
          🧤 Haptischen Griff & Textur fühlen (4.8N)
        </button>
        <button class="btn-primary" id="grabToCartVRBtn">
          🛒 Virtuell ins Regal greifen & kaufen
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeVRBtn')?.addEventListener('click', closeVRSpatialModal);

  document.getElementById('testHapticGripBtn')?.addEventListener('click', () => {
    playSound('quest');
    triggerHaptic('heavy');
    showToast('🧤 Haptischer Impuls (4,8N Kraftrückkopplung & Mikro-Vibration) an Handschuhe gesendet!', 'success');
  });

  document.getElementById('grabToCartVRBtn')?.addEventListener('click', () => {
    const existing = state.cart.find(c => c.product.id === sampleProduct.id);
    if (existing) existing.qty += 1;
    else state.cart.push({ product: sampleProduct, qty: 1, addedAt: Date.now() });

    emit('cart:changed');
    playSound('cart');
    triggerHaptic('heavy');
    showToast(`🌌 „${sampleProduct.title}“ wurde im Spatial VR Store gegriffen & in den Warenkorb gelegt!`, 'success');
    closeVRSpatialModal();
  });
}
