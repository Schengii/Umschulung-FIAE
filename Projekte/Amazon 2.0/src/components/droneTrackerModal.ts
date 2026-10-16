// ============================================================
// Amazon 2.0 – Smart Logistics Drone Delivery 3D Tracker Modal
// ============================================================
import { getInitialDroneTelemetry, updateDroneTelemetryTick, type DroneTelemetry } from '../utils/droneLogistics';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let droneModalEl: HTMLElement | null = null;
let currentTelemetry: DroneTelemetry = getInitialDroneTelemetry();
let isSimulating = false;

function getModal(): HTMLElement {
  if (!droneModalEl) {
    droneModalEl = document.createElement('div');
    droneModalEl.id = 'droneTrackerModal';
    droneModalEl.className = 'modal-overlay';
    droneModalEl.setAttribute('role', 'dialog');
    droneModalEl.setAttribute('aria-modal', 'true');
    droneModalEl.setAttribute('aria-label', 'Prime Air Drohnen 3D Flight-Tracker');
    document.body.appendChild(droneModalEl);
  }
  return droneModalEl;
}

export function openDroneTrackerModal(): void {
  const modal = getModal();
  currentTelemetry = getInitialDroneTelemetry();
  renderDroneUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeDroneTrackerModal(): void {
  if (droneModalEl) {
    droneModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderDroneUI(modal: HTMLElement): void {
  modal.innerHTML = `
    <div class="modal-dialog drone-dialog">
      <button class="modal-close" id="closeDroneBtn" aria-label="Schließen">✕</button>

      <div class="drone-header">
        <div class="drone-badge">🚁 PRIME AIR 3D DRONE RADAR</div>
        <h2>Autonome 30-Minuten Express-Drohnenlieferung</h2>
        <p class="drone-sub">Live-Telemetrie und Flugkorridor-Überwachung für Drohne <strong>${currentTelemetry.droneId}</strong>.</p>
      </div>

      <!-- 3D Flight Corridor Viewport -->
      <div class="drone-flight-viewport">
        <div class="flight-grid-sky"></div>
        <div class="drone-model-graphic" style="left: ${currentTelemetry.flightProgressPercent}%;">
          <div class="drone-rotors">
            <span class="rotor r1"></span><span class="rotor r2"></span>
          </div>
          <div class="drone-chassis">🛸</div>
          <div class="drone-cargo-box">📦</div>
          <div class="drone-beacon-laser"></div>
        </div>

        <div class="landing-zone-marker">
          <div class="lz-bullseye">🎯</div>
          <span>Landezone Garten/Balkon</span>
        </div>

        <div class="flight-status-overlay">
          <span class="status-indicator">● ${currentTelemetry.status.toUpperCase()}</span>
          <span>ETA: <strong>${currentTelemetry.etaMinutes} Min.</strong></span>
        </div>
      </div>

      <!-- Telemetry Dashboard Cards -->
      <div class="drone-telemetry-grid">
        <div class="tele-box">
          <span class="t-label">Flughöhe:</span>
          <strong>${currentTelemetry.altitudeMeters} m AGL</strong>
        </div>
        <div class="tele-box">
          <span class="t-label">Geschwindigkeit:</span>
          <strong>${currentTelemetry.speedKmh} km/h</strong>
        </div>
        <div class="tele-box">
          <span class="t-label">Akku-Ladung:</span>
          <strong style="color: ${currentTelemetry.batteryPercent > 40 ? '#10b981' : '#f59e0b'};">
            ${currentTelemetry.batteryPercent}%
          </strong>
        </div>
        <div class="tele-box">
          <span class="t-label">Gegenwind:</span>
          <strong>${currentTelemetry.windSpeedKmh} km/h (Stabil)</strong>
        </div>
      </div>

      <!-- Flight Progress Bar & Action -->
      <div class="drone-progress-section">
        <div class="d-progress-labels">
          <span>Logistik-Hub</span>
          <span>Flugfortschritt: <strong>${currentTelemetry.flightProgressPercent}%</strong></span>
          <span>Deine Landezone</span>
        </div>
        <div class="d-progress-track">
          <div class="d-progress-bar" style="width: ${currentTelemetry.flightProgressPercent}%;"></div>
        </div>
      </div>

      <div class="drone-actions-row">
        <button class="btn-primary" id="advanceFlightTickBtn">
          ⚡ Flug-Simulation vorantreiben (+10%)
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeDroneBtn')?.addEventListener('click', closeDroneTrackerModal);

  document.getElementById('advanceFlightTickBtn')?.addEventListener('click', () => {
    if (isSimulating) return;
    currentTelemetry = updateDroneTelemetryTick(currentTelemetry);
    playSound(currentTelemetry.status === 'delivered' ? 'success' : 'quest');
    triggerHaptic('light');

    if (currentTelemetry.status === 'delivered') {
      showToast('📦 Prime Air Drohne hat dein Paket sicher in der Landezone abgesetzt!', 'success');
    }

    renderDroneUI(modal);
  });
}
