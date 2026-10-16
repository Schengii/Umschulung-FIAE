// ============================================================
// Amazon 2.0 – Hyperloop Express Tube Logistics Modal
// ============================================================
import { getHyperloopPodTelemetry } from '../utils/hyperloopLogistics';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let hlModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!hlModalEl) {
    hlModalEl = document.createElement('div');
    hlModalEl.id = 'hyperloopModal';
    hlModalEl.className = 'modal-overlay';
    hlModalEl.setAttribute('role', 'dialog');
    hlModalEl.setAttribute('aria-modal', 'true');
    hlModalEl.setAttribute('aria-label', 'Hyperloop Rohrpost Logistik');
    document.body.appendChild(hlModalEl);
  }
  return hlModalEl;
}

export function openHyperloopModal(): void {
  const modal = getModal();
  renderHlUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeHyperloopModal(): void {
  if (hlModalEl) {
    hlModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderHlUI(modal: HTMLElement): void {
  const pod = getHyperloopPodTelemetry();

  modal.innerHTML = `
    <div class="modal-dialog hl-dialog">
      <button class="modal-close" id="closeHLBtn" aria-label="Schließen">✕</button>

      <div class="hl-header">
        <div class="hl-badge">⚡ 1.000 KM/H HYPERLOOP TUBE LOGISTICS</div>
        <h2>Vakuum-Röhren Intercity-Rohrpost</h2>
        <p class="hl-sub">Ultraschneller Kapsel-Transport im Beinahe-Vakuum via Magnetschwebetechnik zwischen Zentral-Hubs.</p>
      </div>

      <!-- Hyperloop Tube Animation Viewport -->
      <div class="hl-tube-viewport">
        <div class="hl-vacuum-tube">
          <div class="hl-capsule-graphic">
            <span class="capsule-body">🚅</span>
            <span class="hyper-speed-trail"></span>
          </div>
        </div>
        <div class="hl-transit-overlay">
          <span>⏱️ Transit-Zeit: <strong>${pod.transitDurationMinutes} Minuten (Frankfurt ➔ Berlin)</strong></span>
        </div>
      </div>

      <!-- Telemetry Cards -->
      <div class="hl-telemetry-grid">
        <div class="hl-box">
          <span class="hl-lbl">Spitzengeschwindigkeit:</span>
          <strong style="color: #38bdf8;">${pod.speedKmh} km/h</strong>
        </div>
        <div class="hl-box">
          <span class="hl-lbl">Röhrendruck (Vakuum):</span>
          <strong>${pod.vacuumPressureAtm} atm</strong>
        </div>
        <div class="hl-box">
          <span class="hl-lbl">Magnetschwebe-Höhe:</span>
          <strong style="color: #10b981;">${pod.maglevLevitationHeightMm} mm</strong>
        </div>
      </div>

      <!-- Route Info -->
      <div class="hl-route-card">
        <span>📍 Röhren-Korridor: <strong>${pod.route}</strong></span>
      </div>

      <!-- Action -->
      <div class="hl-actions-row">
        <button class="btn-primary" id="launchHyperCapsuleBtn">
          🚀 Hyperloop-Express Kapselabschuss simulieren
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeHLBtn')?.addEventListener('click', closeHyperloopModal);

  document.getElementById('launchHyperCapsuleBtn')?.addEventListener('click', () => {
    playSound('quest');
    triggerHaptic('heavy');
    showToast(`🚀 Kapsel ${pod.podId} mit 980 km/h in die Vakuum-Röhre gestartet! Ankunft in 14 Min.`, 'success');
  });
}
