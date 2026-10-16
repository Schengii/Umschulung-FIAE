// ============================================================
// Amazon 2.0 – Digital Olfaction & Scent Protocol Modal
// ============================================================
import { getScentPyramid } from '../utils/digitalOlfaction';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let scentModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!scentModalEl) {
    scentModalEl = document.createElement('div');
    scentModalEl.id = 'digitalOlfactionModal';
    scentModalEl.className = 'modal-overlay';
    scentModalEl.setAttribute('role', 'dialog');
    scentModalEl.setAttribute('aria-modal', 'true');
    scentModalEl.setAttribute('aria-label', 'Digital Olfaction Duft-Protokoll');
    document.body.appendChild(scentModalEl);
  }
  return scentModalEl;
}

export function openDigitalOlfactionModal(): void {
  const modal = getModal();
  renderScentUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeDigitalOlfactionModal(): void {
  if (scentModalEl) {
    scentModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderScentUI(modal: HTMLElement): void {
  const scent = getScentPyramid();

  modal.innerHTML = `
    <div class="modal-dialog scent-dialog">
      <button class="modal-close" id="closeScentBtn" aria-label="Schließen">✕</button>

      <div class="scent-header">
        <div class="scent-badge">🧬 DIGITAL OLFACTION PROTOCOL</div>
        <h2>Digitale Duft-Vorschau & Aromapyramide</h2>
        <p class="scent-sub">Aroma-Synthese und Molekül-Spektrogramm für „${scent.scentTitle}“.</p>
      </div>

      <!-- Scent Pyramid Visual -->
      <div class="scent-pyramid-card">
        <div class="pyramid-level top-level">
          <div class="level-badge">1. KOPFNOTE (0 – 15 Min.)</div>
          <div class="note-chips">
            ${scent.topNotes.map(n => `<span class="note-chip">🍋 ${n}</span>`).join('')}
          </div>
        </div>

        <div class="pyramid-level heart-level">
          <div class="level-badge">2. HERZNOTE (15 Min. – 4 Std.)</div>
          <div class="note-chips">
            ${scent.heartNotes.map(n => `<span class="note-chip">🪵 ${n}</span>`).join('')}
          </div>
        </div>

        <div class="pyramid-level base-level">
          <div class="level-badge">3. BASISNOTE (4 – 24 Std.)</div>
          <div class="note-chips">
            ${scent.baseNotes.map(n => `<span class="note-chip">🌿 ${n}</span>`).join('')}
          </div>
        </div>
      </div>

      <!-- Scent Metadata -->
      <div class="scent-meta-grid">
        <div class="sm-card">
          <span class="sm-lbl">Duftfamilie:</span>
          <strong>${scent.fragranceFamily}</strong>
        </div>
        <div class="sm-card">
          <span class="sm-lbl">Duft-Intensität:</span>
          <strong>${scent.intensityScorePercent}% (${scent.sillageRating})</strong>
        </div>
      </div>

      <!-- Actions -->
      <div class="scent-actions-row">
        <button class="btn-primary" id="triggerDiffuserBtn">
          💨 Duft-Impuls an Bluetooth-Diffusor senden
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeScentBtn')?.addEventListener('click', closeDigitalOlfactionModal);

  document.getElementById('triggerDiffuserBtn')?.addEventListener('click', () => {
    playSound('quest');
    triggerHaptic('medium');
    showToast('💨 Digitaler Duft-Impuls (Bergamotte & Zedernholz) an gekoppelten Diffusor übertragen!', 'success');
  });
}
