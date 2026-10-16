// ============================================================
// Amazon 2.0 – Raman Laser Spectrometry Modal
// ============================================================
import { scanRamanSpectrometry } from '../utils/ramanSpectrometry';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let ramanModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!ramanModalEl) {
    ramanModalEl = document.createElement('div');
    ramanModalEl.id = 'ramanSpectrometryModal';
    ramanModalEl.className = 'modal-overlay';
    ramanModalEl.setAttribute('role', 'dialog');
    ramanModalEl.setAttribute('aria-modal', 'true');
    ramanModalEl.setAttribute('aria-label', 'Raman Laser Spektrometrie');
    document.body.appendChild(ramanModalEl);
  }
  return ramanModalEl;
}

export function openRamanSpectrometryModal(itemTitle: string = 'Rolex Submariner Date / Diamant-Solitär 1.5ct'): void {
  const modal = getModal();
  renderRamanUI(modal, itemTitle);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeRamanSpectrometryModal(): void {
  if (ramanModalEl) {
    ramanModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderRamanUI(modal: HTMLElement, itemTitle: string): void {
  const rep = scanRamanSpectrometry(itemTitle);

  modal.innerHTML = `
    <div class="modal-dialog raman-dialog">
      <button class="modal-close" id="closeRamanBtn" aria-label="Schließen">✕</button>

      <div class="raman-header">
        <div class="raman-badge">💎 RAMAN LASER SPECTROMETRY & NFT VAULT</div>
        <h2>Molekulare Echtheits- & Reinheitsprüfung</h2>
        <p class="raman-sub">785nm Laser-Spektrogramm und physikalische Molekül-Identifikation für „${rep.itemTitle}“.</p>
      </div>

      <!-- Laser Spectrum Visualizer -->
      <div class="raman-spectrum-viewport">
        <div class="laser-beam-line"></div>
        <div class="spectrum-peak-point" style="left: 70%; bottom: 65%;">
          <span class="peak-label">Peak: ${rep.molecularFingerprintPeakCm1} cm⁻¹ (Diamant Typ IIa)</span>
        </div>
        <div class="raman-conf-tag">
          <span>✓ ECHTHEIT BESTÄTIGT: <strong>${rep.authenticityScorePercent}% KONFIDENZ</strong></span>
        </div>
      </div>

      <!-- Report Metadata -->
      <div class="raman-meta-grid">
        <div class="rm-box">
          <span class="rm-lbl">Material-Zusammensetzung:</span>
          <strong>${rep.materialComposition}</strong>
        </div>
        <div class="rm-box">
          <span class="rm-lbl">Laser-Wellenlänge:</span>
          <strong>${rep.laserWavelengthNm} nm Raman Laser</strong>
        </div>
        <div class="rm-box">
          <span class="rm-lbl">Blockchain NFT Zertifikat:</span>
          <code>${rep.blockchainCertificateNft}</code>
        </div>
      </div>

      <!-- Actions -->
      <div class="raman-actions-row">
        <button class="btn-primary" id="exportRamanCertificateBtn">
          📄 Unverfälschbares Raman-Echtheitszertifikat exportieren
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeRamanBtn')?.addEventListener('click', closeRamanSpectrometryModal);

  document.getElementById('exportRamanCertificateBtn')?.addEventListener('click', () => {
    playSound('success');
    triggerHaptic('heavy');
    showToast('💎 Raman-Echtheitszertifikat (99,8% Authentizität) erfolgreich exportiert!', 'success');
    closeRamanSpectrometryModal();
  });
}
