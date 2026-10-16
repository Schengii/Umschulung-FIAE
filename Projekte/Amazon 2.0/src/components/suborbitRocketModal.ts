// ============================================================
// Amazon 2.0 – Sub-Orbital Cargo Rocket Logistics Modal
// ============================================================
import { getRocketFlightTelemetry } from '../utils/suborbitRocket';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let srokModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!srokModalEl) {
    srokModalEl = document.createElement('div');
    srokModalEl.id = 'suborbitRocketModal';
    srokModalEl.className = 'modal-overlay';
    srokModalEl.setAttribute('role', 'dialog');
    srokModalEl.setAttribute('aria-modal', 'true');
    srokModalEl.setAttribute('aria-label', 'Sub-Orbit Frachtrakete');
    document.body.appendChild(srokModalEl);
  }
  return srokModalEl;
}

export function openSuborbitRocketModal(): void {
  const modal = getModal();
  renderRocketUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeSuborbitRocketModal(): void {
  if (srokModalEl) {
    srokModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderRocketUI(modal: HTMLElement): void {
  const rocket = getRocketFlightTelemetry();

  modal.innerHTML = `
    <div class="modal-dialog srok-dialog">
      <button class="modal-close" id="closeSRokBtn" aria-label="Schließen">✕</button>

      <div class="srok-header">
        <div class="srok-badge">🌌 45-MIN SUB-ORBITAL CARGO ROCKET</div>
        <h2>Weltweiter Hyperschall-Frachtraketen Transit</h2>
        <p class="srok-sub">Ballistische Punkt-zu-Punkt Expresszustellungen (Mach 18,2) via <strong>${rocket.rocketId}</strong> für Notfall- und Katastrophengüter.</p>
      </div>

      <!-- Space Trajectory Viewport -->
      <div class="srok-space-viewport">
        <div class="srok-stars-bg"></div>
        <div class="srok-earth-curve"></div>
        <div class="srok-rocket-flight">
          <span class="rocket-glyph">🚀</span>
          <span class="rocket-plasma-trail"></span>
        </div>
        <div class="srok-mach-tag">
          <span>🔥 HYPERSCHALL-FLUG: <strong>MACH ${rocket.speedMach} (${(rocket.speedMach * 1225).toFixed(0)} km/h)</strong></span>
        </div>
      </div>

      <!-- Rocket Telemetry Grid -->
      <div class="srok-telemetry-grid">
        <div class="sr-box">
          <span class="sr-lbl">Flughöhe (Apogäum):</span>
          <strong style="color: #38bdf8;">${rocket.apogeeAltitudeKm} km (Weltraum)</strong>
        </div>
        <div class="sr-box">
          <span class="sr-lbl">Wärmeschild-Hitze:</span>
          <strong style="color: #f97316;">${rocket.heatShieldTemperatureCelsius}°C (MHD-Schutz)</strong>
        </div>
        <div class="sr-box">
          <span class="sr-lbl">Flugzeit (Global):</span>
          <strong style="color: #10b981;">${rocket.flightDurationMinutes} Minuten</strong>
        </div>
        <div class="sr-box">
          <span class="sr-lbl">Nutzlast-Kapazität:</span>
          <strong>${rocket.payloadCapacityTons} Tonnen</strong>
        </div>
      </div>

      <!-- Route Card -->
      <div class="srok-route-card">
        <span>📍 Flug-Trajektorie: <strong>${rocket.trajectoryRoute}</strong></span>
      </div>

      <!-- Action -->
      <div class="srok-actions-row">
        <button class="btn-primary" id="trackRocketBurnBtn">
          🚀 Raketen-Wiedereintritts-Zündung & Landemanöver simulieren
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeSRokBtn')?.addEventListener('click', closeSuborbitRocketModal);

  document.getElementById('trackRocketBurnBtn')?.addEventListener('click', () => {
    playSound('quest');
    triggerHaptic('heavy');
    showToast(`🚀 Landemanöver von ${rocket.rocketId} eingeleitet! Landung in 6 Minuten auf dem Rotterdam Drone-Pad.`, 'success');
  });
}
