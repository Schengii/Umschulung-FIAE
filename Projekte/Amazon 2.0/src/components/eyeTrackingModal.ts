// ============================================================
// Amazon 2.0 – Neuro-Adaptive Eye-Tracking & Hands-Free Modal
// ============================================================
import {
  getEyeTrackingConfig,
  saveEyeTrackingConfig,
  simulateGazeCalibration,
} from '../utils/eyeTracking';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let eyeModalEl: HTMLElement | null = null;
let isCalibrating = false;

function getModal(): HTMLElement {
  if (!eyeModalEl) {
    eyeModalEl = document.createElement('div');
    eyeModalEl.id = 'eyeTrackingModal';
    eyeModalEl.className = 'modal-overlay';
    eyeModalEl.setAttribute('role', 'dialog');
    eyeModalEl.setAttribute('aria-modal', 'true');
    eyeModalEl.setAttribute('aria-label', 'Neuro-Adaptives Eye-Tracking');
    document.body.appendChild(eyeModalEl);
  }
  return eyeModalEl;
}

export function openEyeTrackingModal(): void {
  const modal = getModal();
  renderEyeUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeEyeTrackingModal(): void {
  if (eyeModalEl) {
    eyeModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderEyeUI(modal: HTMLElement): void {
  const cfg = getEyeTrackingConfig();

  modal.innerHTML = `
    <div class="modal-dialog eye-dialog">
      <button class="modal-close" id="closeEyeBtn" aria-label="Schließen">✕</button>

      <div class="eye-header">
        <div class="eye-badge">🧠 NEURO-ADAPTIVE HANDS-FREE SUITE</div>
        <h2>Blickerfassung & Berührungslose Navigation</h2>
        <p class="eye-sub">Steuere Amazon 2.0 rein mit deinen Augen: Dwell-Time Clicking (1,2s Fokus = Klick) und intelligentes Auto-Scrolling.</p>
      </div>

      <!-- Live Calibration Box -->
      <div class="gaze-calibration-box ${isCalibrating ? 'calibrating' : ''}">
        <div class="gaze-target-point p-center">
          <div class="gaze-laser-ring"></div>
        </div>
        <div class="gaze-info-overlay">
          <span>${isCalibrating ? '⚡ 9-Punkt Kalibrierung läuft... Bitte Zielpunkt fixieren' : cfg.isEnabled ? `✓ Aktiviert (${cfg.calibratedAccuracyPercent}% Präzision)` : 'Bereit für Kalibrierung'}</span>
        </div>
      </div>

      <!-- Settings Controls -->
      <div class="eye-controls-card">
        <div class="eye-switch-row">
          <div>
            <strong>Eye-Tracking Navigation aktivieren</strong>
            <p>Blendet den neuronalen Blickpunkt-Cursor ein.</p>
          </div>
          <input type="checkbox" id="toggleEyeTrackingCheck" ${cfg.isEnabled ? 'checked' : ''} />
        </div>

        <div class="slider-control-row">
          <label>Dwell-Klick Haltezeit: <strong id="dwellTimeVal">${cfg.dwellTimeMs} ms</strong></label>
          <input type="range" id="dwellTimeSlider" min="600" max="2500" step="100" value="${cfg.dwellTimeMs}" />
        </div>

        <div class="slider-control-row">
          <label>Gaze-Glättung (Jitter-Filter): <strong>${cfg.gazeSmoothingPercent}%</strong></label>
          <input type="range" id="smoothingSlider" min="20" max="100" step="5" value="${cfg.gazeSmoothingPercent}" />
        </div>
      </div>

      <!-- Actions -->
      <div class="eye-actions-row">
        <button class="btn-primary" id="startCalibrationBtn">
          🎯 9-Punkt Blick-Kalibrierung starten
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeEyeBtn')?.addEventListener('click', closeEyeTrackingModal);

  document.getElementById('toggleEyeTrackingCheck')?.addEventListener('change', (e) => {
    cfg.isEnabled = (e.target as HTMLInputElement).checked;
    saveEyeTrackingConfig(cfg);
    playSound(cfg.isEnabled ? 'success' : 'alert');
    triggerHaptic('light');
    showToast(cfg.isEnabled ? '👁️ Eye-Tracking aktiviert!' : 'Eye-Tracking deaktiviert.', 'info');
  });

  document.getElementById('dwellTimeSlider')?.addEventListener('input', (e) => {
    const val = parseInt((e.target as HTMLInputElement).value, 10);
    cfg.dwellTimeMs = val;
    saveEyeTrackingConfig(cfg);
    const label = document.getElementById('dwellTimeVal');
    if (label) label.textContent = `${val} ms`;
  });

  document.getElementById('startCalibrationBtn')?.addEventListener('click', async () => {
    if (isCalibrating) return;
    isCalibrating = true;
    playSound('quest');
    triggerHaptic('medium');
    renderEyeUI(modal);

    const accuracy = await simulateGazeCalibration();
    isCalibrating = false;
    playSound('success');
    triggerHaptic('heavy');
    showToast(`🎯 Kalibrierung abgeschlossen! Blickgenauigkeit: ${accuracy}%`, 'success');
    renderEyeUI(modal);
  });
}
