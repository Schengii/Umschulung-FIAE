// ============================================================
// Amazon 2.0 – Maritime Deep-Sea Cargo Radar Modal
// ============================================================
import { getMaritimeVesselTelemetry } from '../utils/maritimeLogistics';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let marModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!marModalEl) {
    marModalEl = document.createElement('div');
    marModalEl.id = 'maritimeModal';
    marModalEl.className = 'modal-overlay';
    marModalEl.setAttribute('role', 'dialog');
    marModalEl.setAttribute('aria-modal', 'true');
    marModalEl.setAttribute('aria-label', 'Tiefsee Frachtschiff Radar');
    document.body.appendChild(marModalEl);
  }
  return marModalEl;
}

export function openMaritimeModal(): void {
  const modal = getModal();
  renderMarUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeMaritimeModal(): void {
  if (marModalEl) {
    marModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderMarUI(modal: HTMLElement): void {
  const mar = getMaritimeVesselTelemetry();

  modal.innerHTML = `
    <div class="modal-dialog mar-dialog">
      <button class="modal-close" id="closeMarBtn" aria-label="Schließen">✕</button>

      <div class="mar-header">
        <div class="mar-badge">🛰️ AIS MARITIME DEEP-SEA CARGO RADAR</div>
        <h2>Globales Frachtschiff- & Tiefsee-Tracking</h2>
        <p class="mar-sub">Live-Satelliten-AIS Tracking für Container-Schiff <strong>${mar.vesselName}</strong> (24.000 TEU).</p>
      </div>

      <!-- Ocean Viewport -->
      <div class="mar-ocean-viewport">
        <div class="ocean-waves-water"></div>
        <div class="cargo-ship-graphic">
          <span class="ship-icon">🚢</span>
          <span class="ship-radar-ping"></span>
        </div>
        <div class="mar-eta-overlay">
          <span>⚓ Hafen-Ankunft Rotterdam: <strong>${mar.portArrivalEta}</strong></span>
        </div>
      </div>

      <!-- Telemetry Grid -->
      <div class="mar-telemetry-grid">
        <div class="m-box">
          <span class="mb-lbl">Reisegeschwindigkeit:</span>
          <strong>${mar.speedKnots} Knoten (${(mar.speedKnots * 1.852).toFixed(1)} km/h)</strong>
        </div>
        <div class="m-box">
          <span class="mb-lbl">Wellenhöhe:</span>
          <strong style="color: #38bdf8;">${mar.waveHeightMeters} m (Ruhig)</strong>
        </div>
        <div class="m-box">
          <span class="mb-lbl">Container-Kapazität:</span>
          <strong>${mar.containerCapacityTeu.toLocaleString('de-DE')} TEU</strong>
        </div>
        <div class="m-box">
          <span class="mb-lbl">AIS Status:</span>
          <strong style="color: #10b981;">Aktiv via Satellit</strong>
        </div>
      </div>

      <!-- Route Card -->
      <div class="mar-route-card">
        <span>🧭 Route: <strong>${mar.route}</strong></span>
      </div>

      <!-- Action -->
      <div class="mar-actions-row">
        <button class="btn-primary" id="pingShipSonarBtn">
          📡 Satelliten-Sonar & Strömungsdaten aktualisieren
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeMarBtn')?.addEventListener('click', closeMaritimeModal);

  document.getElementById('pingShipSonarBtn')?.addEventListener('click', () => {
    playSound('quest');
    triggerHaptic('heavy');
    showToast(`📡 Live-AIS-Signal von ${mar.vesselName} synchronisiert! ETA: ${mar.portArrivalEta}.`, 'success');
  });
}
