// ============================================================
// Amazon 2.0 – Neural-Audio Acoustic Hologram Modal
// ============================================================
import { computeAcousticProfile, type AcousticRoom } from '../utils/neuralAcousticHologram';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

let nahModalEl: HTMLElement | null = null;
let currentEnv: AcousticRoom = 'Abbey Road Studio A';

function getModal(): HTMLElement {
  if (!nahModalEl) {
    nahModalEl = document.createElement('div');
    nahModalEl.id = 'neuralAcousticModal';
    nahModalEl.className = 'modal-overlay';
    nahModalEl.setAttribute('role', 'dialog');
    nahModalEl.setAttribute('aria-modal', 'true');
    nahModalEl.setAttribute('aria-label', 'Neural-Audio Akustik-Hologramm');
    document.body.appendChild(nahModalEl);
  }
  return nahModalEl;
}

export function openNeuralAcousticModal(): void {
  const modal = getModal();
  renderNahUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeNeuralAcousticModal(): void {
  if (nahModalEl) {
    nahModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderNahUI(modal: HTMLElement): void {
  const profile = computeAcousticProfile(currentEnv);

  modal.innerHTML = `
    <div class="modal-dialog nah-dialog">
      <button class="modal-close" id="closeNahBtn" aria-label="Schließen">✕</button>

      <div class="nah-header">
        <div class="nah-badge">🌌 NEURAL-AUDIO ACOUSTIC HOLOGRAM</div>
        <h2>Binaurales 3D HRTF Raumklang-Studio</h2>
        <p class="nah-sub">Echtzeit-Faltungshall-Synthese zur akustischen Raum-Simulation für High-End Kopfhörer und Lautsprecher.</p>
      </div>

      <!-- Environment Selector Buttons -->
      <div class="nah-env-selector">
        <button class="env-pill ${currentEnv === 'Abbey Road Studio A' ? 'active' : ''}" data-env="Abbey Road Studio A">
          🎙️ Studio A (Trocken)
        </button>
        <button class="env-pill ${currentEnv === 'Kölner Dom (Kathedrale)' ? 'active' : ''}" data-env="Kölner Dom (Kathedrale)">
          ⛪ Kathedrale (4,8s Hall)
        </button>
        <button class="env-pill ${currentEnv === 'Open-Air Arena (Live)' ? 'active' : ''}" data-env="Open-Air Arena (Live)">
          🏟️ Stadion (Open-Air)
        </button>
      </div>

      <!-- Soundwave Visualizer Box -->
      <div class="nah-soundwave-viewport">
        <div class="soundwave-rings">
          <div class="s-ring r1"></div>
          <div class="s-ring r2"></div>
          <div class="s-ring r3"></div>
        </div>
        <div class="nah-hrtf-tag">
          <span>🎧 BINAURALES 3D HRTF HEAD-TRACKING: <strong>${profile.environment}</strong></span>
        </div>
      </div>

      <!-- Audio Telemetry Grid -->
      <div class="nah-telemetry-grid">
        <div class="nah-box">
          <span class="nh-lbl">Nachhallzeit (RT60):</span>
          <strong style="color: #38bdf8;">${profile.reverbDecaySeconds} Sekunden</strong>
        </div>
        <div class="nah-box">
          <span class="nh-lbl">Virtuelle Distanz:</span>
          <strong>${profile.spatialDistanceMeters} m</strong>
        </div>
        <div class="nah-box">
          <span class="nh-lbl">Akustische Klarheit:</span>
          <strong style="color: #10b981;">${profile.frequencyClarityScore}%</strong>
        </div>
      </div>

      <!-- Action -->
      <div class="nah-actions-row">
        <button class="btn-primary" id="playHoloAudioSampleBtn">
          🎵 3D-Hologramm-Audio Sample abspielen
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeNahBtn')?.addEventListener('click', closeNeuralAcousticModal);

  modal.querySelectorAll('.env-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentEnv = (e.currentTarget as HTMLElement).dataset.env as AcousticRoom;
      playSound('click');
      triggerHaptic('light');
      renderNahUI(modal);
    });
  });

  document.getElementById('playHoloAudioSampleBtn')?.addEventListener('click', () => {
    playSound('quest');
    triggerHaptic('heavy');
  });
}
