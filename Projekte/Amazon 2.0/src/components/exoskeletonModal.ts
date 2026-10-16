// ============================================================
// Amazon 2.0 – Bionic Exoskeleton Ergonomics Modal
// ============================================================
import { getExoskeletonProfile } from '../utils/exoskeletonErgo';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let exoModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!exoModalEl) {
    exoModalEl = document.createElement('div');
    exoModalEl.id = 'exoskeletonModal';
    exoModalEl.className = 'modal-overlay';
    exoModalEl.setAttribute('role', 'dialog');
    exoModalEl.setAttribute('aria-modal', 'true');
    exoModalEl.setAttribute('aria-label', 'Bionisches Exoskelett');
    document.body.appendChild(exoModalEl);
  }
  return exoModalEl;
}

export function openExoskeletonModal(): void {
  const modal = getModal();
  renderExoUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeExoskeletonModal(): void {
  if (exoModalEl) {
    exoModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderExoUI(modal: HTMLElement): void {
  const exo = getExoskeletonProfile();

  modal.innerHTML = `
    <div class="modal-dialog exo-dialog">
      <button class="modal-close" id="closeExoBtn" aria-label="Schließen">✕</button>

      <div class="exo-header">
        <div class="exo-badge">🦾 BIONIC EXOSKELETON POWER ASSIST</div>
        <h2>Ergonomie- & Hebekraftverstärker</h2>
        <p class="exo-sub">Aktives Carbon-Exoskelett (<strong>${exo.suitModel}</strong>) zur Wirbelsäulen-Entlastung bei schweren Paketen.</p>
      </div>

      <!-- Exo Stats Banner -->
      <div class="exo-banner-card">
        <div class="exo-icon">🦾</div>
        <div class="exo-meta">
          <h4>Hebekraft-Unterstützung: <strong>+${exo.maxLiftAssistKg} kg pro Hebevorgang</strong></h4>
          <p>Reduziert Lendenwirbel-Kompression um <strong>${exo.spineCompressionReliefPercent}%</strong> bei jeder Kniebeuge.</p>
        </div>
        <div class="exo-tag">✓ ERGO-ZERTIFIZIERT</div>
      </div>

      <!-- Telemetry Cards -->
      <div class="exo-telemetry-grid">
        <div class="exo-box">
          <span class="ex-lbl">Wirbelsäulen-Entlastung:</span>
          <strong style="color: #10b981;">-${exo.spineCompressionReliefPercent}% Druck</strong>
        </div>
        <div class="exo-box">
          <span class="ex-lbl">Ermüdungs-Prävention:</span>
          <strong>${exo.fatiguePreventionPercent}%</strong>
        </div>
        <div class="exo-box">
          <span class="ex-lbl">Akku-Laufzeit:</span>
          <strong>${exo.batteryLifeHours} Std. Schicht</strong>
        </div>
        <div class="exo-box">
          <span class="ex-lbl">Unterstützte Hubs:</span>
          <strong>${exo.totalDailyLiftsAssisted.toLocaleString('de-DE')} / Tag</strong>
        </div>
      </div>

      <!-- Actions -->
      <div class="exo-actions-row">
        <button class="btn-primary" id="triggerPowerBoostBtn">
          ⚡ 35kg Hebeunterstützungs-Impuls aktivieren
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeExoBtn')?.addEventListener('click', closeExoskeletonModal);

  document.getElementById('triggerPowerBoostBtn')?.addEventListener('click', () => {
    playSound('success');
    triggerHaptic('heavy');
    showToast('🦾 Exoskelett Power-Assist aktiviert (+35kg Kraftunterstützung)!', 'success');
  });
}
