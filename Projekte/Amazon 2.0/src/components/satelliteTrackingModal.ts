// ============================================================
// Amazon 2.0 – Starlink LEO Satellite Tracking Modal
// ============================================================
import { getSatelliteTelemetry } from '../utils/satelliteTracking';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let satModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!satModalEl) {
    satModalEl = document.createElement('div');
    satModalEl.id = 'satelliteTrackingModal';
    satModalEl.className = 'modal-overlay';
    satModalEl.setAttribute('role', 'dialog');
    satModalEl.setAttribute('aria-modal', 'true');
    satModalEl.setAttribute('aria-label', 'Satelliten-Notfall-Tracking');
    document.body.appendChild(satModalEl);
  }
  return satModalEl;
}

export function openSatelliteTrackingModal(): void {
  const modal = getModal();
  renderSatUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeSatelliteTrackingModal(): void {
  if (satModalEl) {
    satModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderSatUI(modal: HTMLElement): void {
  const sat = getSatelliteTelemetry();

  modal.innerHTML = `
    <div class="modal-dialog sat-dialog">
      <button class="modal-close" id="closeSatBtn" aria-label="Schließen">✕</button>

      <div class="sat-header">
        <div class="sat-badge">🛰️ STARLINK DIRECT-TO-CELL LEO MESH</div>
        <h2>Globales Satelliten- & Notfall-Tracking</h2>
        <p class="sat-sub">Lückenlose Ortung für Off-Grid-Zustellungen und Expeditionen außerhalb des terrestrischen Mobilfunknetzes.</p>
      </div>

      <!-- Orbit Viewport Visual -->
      <div class="sat-orbit-viewport">
        <div class="sat-globe-earth">🌍</div>
        <div class="sat-orbit-ring">
          <span class="satellite s1">🛰️</span>
          <span class="satellite s2">🛰️</span>
          <span class="satellite s3">🛰️</span>
        </div>
        <div class="sat-signal-beam"></div>
        <div class="sat-live-indicator">
          <span>● LEO SAT LINK: <strong>${sat.connectedSatsCount} SATELLITEN GELOCKT</strong></span>
        </div>
      </div>

      <!-- Telemetry Cards -->
      <div class="sat-telemetry-grid">
        <div class="sat-card">
          <span class="sc-lbl">Konstellation:</span>
          <strong>${sat.constellation}</strong>
        </div>
        <div class="sat-card">
          <span class="sc-lbl">Orbit-Flughöhe:</span>
          <strong>${sat.orbitAltitudeKm} km LEO</strong>
        </div>
        <div class="sat-card">
          <span class="sc-lbl">Uplink-Latenz:</span>
          <strong>${sat.latencyMs} ms</strong>
        </div>
        <div class="sat-card">
          <span class="sc-lbl">Signalstärke:</span>
          <strong style="color: #10b981;">${sat.signalStrengthDbm} dBm (Exzellent)</strong>
        </div>
      </div>

      <!-- Location Pin -->
      <div class="sat-location-box">
        <span>📍 Lokalisierter Off-Grid Standort: <strong>${sat.terrainLocation}</strong></span>
      </div>

      <!-- Actions -->
      <div class="sat-actions-row">
        <button class="btn-primary" id="pingSatelliteBeaconBtn">
          📡 Satelliten-Notfall-Beacon pingen (SOS / Status)
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeSatBtn')?.addEventListener('click', closeSatelliteTrackingModal);

  document.getElementById('pingSatelliteBeaconBtn')?.addEventListener('click', () => {
    playSound('quest');
    triggerHaptic('heavy');
    showToast(`📡 Satelliten-Ping erfolgreich über ${sat.connectedSatsCount} LEO-Knoten geroutet (Latenz: ${sat.latencyMs}ms)!`, 'success');
  });
}
