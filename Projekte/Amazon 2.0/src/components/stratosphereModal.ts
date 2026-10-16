// ============================================================
// Amazon 2.0 – Stratosphere Balloon IoT Mesh Relay Modal
// ============================================================
import { getStratosphereBalloonTelemetry } from '../utils/stratosphereBalloon';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let stratoModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!stratoModalEl) {
    stratoModalEl = document.createElement('div');
    stratoModalEl.id = 'stratosphereModal';
    stratoModalEl.className = 'modal-overlay';
    stratoModalEl.setAttribute('role', 'dialog');
    stratoModalEl.setAttribute('aria-modal', 'true');
    stratoModalEl.setAttribute('aria-label', 'Stratosphären-Ballon Relais');
    document.body.appendChild(stratoModalEl);
  }
  return stratoModalEl;
}

export function openStratosphereModal(): void {
  const modal = getModal();
  renderStratoUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeStratosphereModal(): void {
  if (stratoModalEl) {
    stratoModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderStratoUI(modal: HTMLElement): void {
  const balloon = getStratosphereBalloonTelemetry();

  modal.innerHTML = `
    <div class="modal-dialog strato-dialog">
      <button class="modal-close" id="closeStratoBtn" aria-label="Schließen">✕</button>

      <div class="strato-header">
        <div class="strato-badge">🛰️ STRATOSPHERE HAPS IoT MESH RELAY</div>
        <h2>Höhenplattform-Telemetrie (20.000m)</h2>
        <p class="strato-sub">Solarbetriebene Höhenballone zur 100% lückenlosen Ausleuchtung entlegener Alpen- und Polar-Lieferrouten.</p>
      </div>

      <!-- Stratosphere Viewport -->
      <div class="strato-sky-viewport">
        <div class="strato-balloon-graphic">
          <span class="balloon-icon">🎈</span>
          <span class="solar-panel-wings">☀️</span>
        </div>
        <div class="strato-alt-overlay">
          <span>🌍 Flughöhe: <strong>${(balloon.altitudeMeters / 1000).toFixed(1)} km (Stratosphäre)</strong></span>
        </div>
      </div>

      <!-- Telemetry Grid -->
      <div class="strato-telemetry-grid">
        <div class="st-box">
          <span class="st-lbl">Abdeckungs-Radius:</span>
          <strong style="color: #38bdf8;">${balloon.coverageRadiusKm} km Radius</strong>
        </div>
        <div class="st-box">
          <span class="st-lbl">Solar-Leistung:</span>
          <strong>${balloon.solarPowerWatts} W (Aktiv)</strong>
        </div>
        <div class="st-box">
          <span class="st-lbl">Außentemperatur:</span>
          <strong style="color: #60a5fa;">${balloon.temperatureCelsius}°C</strong>
        </div>
        <div class="st-box">
          <span class="st-lbl">Mesh-Relais Status:</span>
          <strong style="color: #10b981;">Online & Verbunden</strong>
        </div>
      </div>

      <!-- Action -->
      <div class="strato-actions-row">
        <button class="btn-primary" id="pingStratoRelayBtn">
          📡 Stratosphären-Ping an Frachtpaket senden
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeStratoBtn')?.addEventListener('click', closeStratosphereModal);

  document.getElementById('pingStratoRelayBtn')?.addEventListener('click', () => {
    playSound('success');
    triggerHaptic('medium');
    showToast(`📡 Stratosphären-Mesh Ping über ${balloon.balloonId} in 20,4km Höhe bestätigt!`, 'success');
  });
}
