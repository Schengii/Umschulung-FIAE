// ============================================================
// Amazon 2.0 – Autonomous Ground Rover Swarm Fleet Modal
// ============================================================
import { getGroundRoverTelemetry } from '../utils/groundRoverSwarm';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let roverModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!roverModalEl) {
    roverModalEl = document.createElement('div');
    roverModalEl.id = 'groundRoverModal';
    roverModalEl.className = 'modal-overlay';
    roverModalEl.setAttribute('role', 'dialog');
    roverModalEl.setAttribute('aria-modal', 'true');
    roverModalEl.setAttribute('aria-label', 'Autonome Ground Rover Flotte');
    document.body.appendChild(roverModalEl);
  }
  return roverModalEl;
}

export function openGroundRoverModal(roverId: string = 'SCOUT-ROVER-#07'): void {
  const modal = getModal();
  renderRoverUI(modal, roverId);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeGroundRoverModal(): void {
  if (roverModalEl) {
    roverModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderRoverUI(modal: HTMLElement, roverId: string): void {
  const rover = getGroundRoverTelemetry(roverId);

  modal.innerHTML = `
    <div class="modal-dialog rover-dialog">
      <button class="modal-close" id="closeRoverBtn" aria-label="Schließen">✕</button>

      <div class="rover-header">
        <div class="rover-badge">🤖 AUTONOMOUS GROUND ROVER FLEET</div>
        <h2>Amazon Scout Bordstein-Lieferroboter</h2>
        <p class="rover-sub">Echtzeit-LiDAR-Telemetrie und Fachöffnung für Roboter <strong>${rover.roverId}</strong>.</p>
      </div>

      <!-- Rover Live Map / Graphic Box -->
      <div class="rover-viewport-box">
        <div class="rover-curbside-street">
          <div class="rover-robot-graphic">
            <span class="rover-body">🚐</span>
            <span class="lidar-scanner-cone"></span>
          </div>
          <div class="rover-door-target">
            <span>🏠 Deine Haustür</span>
          </div>
        </div>
        <div class="rover-status-tag">
          <span>● STATUS: <strong>${rover.status.toUpperCase()}</strong></span>
        </div>
      </div>

      <!-- Rover Stats Dashboard -->
      <div class="rover-telemetry-grid">
        <div class="r-box">
          <span class="r-lbl">Geschwindigkeit:</span>
          <strong>${rover.speedKmh} km/h (Gehweg)</strong>
        </div>
        <div class="r-box">
          <span class="r-lbl">LiDAR-Punktwolke:</span>
          <strong>${(rover.lidarPointsPerSec / 1000).toFixed(0)}k Pts/s</strong>
        </div>
        <div class="r-box">
          <span class="r-lbl">Akkukapazität:</span>
          <strong style="color: #10b981;">${rover.batteryPercent}%</strong>
        </div>
        <div class="r-box">
          <span class="r-lbl">Fach-PIN:</span>
          <strong style="color: #f59e0b; letter-spacing: 2px;">${rover.compartmentPin}</strong>
        </div>
      </div>

      <!-- Location Info -->
      <div class="rover-location-card">
        <span>📍 Standort: <strong>${rover.currentStreet}</strong></span>
      </div>

      <!-- Actions -->
      <div class="rover-actions-row">
        <button class="btn-primary" id="unlockRoverLidBtn">
          🔓 Paketfach des Roboters kontaktlos öffnen (PIN: ${rover.compartmentPin})
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeRoverBtn')?.addEventListener('click', closeGroundRoverModal);

  document.getElementById('unlockRoverLidBtn')?.addEventListener('click', () => {
    playSound('success');
    triggerHaptic('heavy');
    showToast(`🔓 Paketfach von ${rover.roverId} geöffnet! Bitte Paket entnehmen.`, 'success');
    closeGroundRoverModal();
  });
}
