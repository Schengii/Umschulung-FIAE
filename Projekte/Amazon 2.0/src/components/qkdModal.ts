// ============================================================
// Amazon 2.0 – Quantum Key Distribution (QKD) Modal
// ============================================================
import { simulateQKDExchange } from '../utils/qkdKeyExchange';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let qkdModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!qkdModalEl) {
    qkdModalEl = document.createElement('div');
    qkdModalEl.id = 'qkdModal';
    qkdModalEl.className = 'modal-overlay';
    qkdModalEl.setAttribute('role', 'dialog');
    qkdModalEl.setAttribute('aria-modal', 'true');
    qkdModalEl.setAttribute('aria-label', 'Quanten-Schlüsselaustausch (QKD)');
    document.body.appendChild(qkdModalEl);
  }
  return qkdModalEl;
}

export function openQKDModal(): void {
  const modal = getModal();
  renderQKDUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeQKDModal(): void {
  if (qkdModalEl) {
    qkdModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderQKDUI(modal: HTMLElement): void {
  const qkd = simulateQKDExchange();

  modal.innerHTML = `
    <div class="modal-dialog qkd-dialog">
      <button class="modal-close" id="closeQKDBtn" aria-label="Schließen">✕</button>

      <div class="qkd-header">
        <div class="qkd-badge">🌌 QUANTUM KEY DISTRIBUTION (QKD) & TELEPORTATION</div>
        <h2>Photonischer Quanten-Schlüsselaustausch</h2>
        <p class="qkd-sub">Physikalisch unknackbare Verschlüsselung basierend auf quantenmechanischer Verschränkung (E91 / Bell-Zustände).</p>
      </div>

      <!-- Photon Stream Visualizer -->
      <div class="qkd-photon-viewport">
        <div class="photon-emitter alice">
          <span>👩 Alice (Client)</span>
          <div class="laser-diode"></div>
        </div>
        <div class="quantum-fiber-channel">
          <span class="photon p1">⚛️</span>
          <span class="photon p2">⚛️</span>
          <span class="photon p3">⚛️</span>
        </div>
        <div class="photon-detector bob">
          <span>🏢 Bob (Amazon Cloud)</span>
          <div class="detector-ring"></div>
        </div>
        <div class="qkd-no-cloning-tag">
          <span>✓ NO-CLONING THEOREM AKTIV: 100% ABHÖRSICHER</span>
        </div>
      </div>

      <!-- QKD Telemetry Dashboard -->
      <div class="qkd-telemetry-grid">
        <div class="qkd-box">
          <span class="qk-lbl">QBER (Quanten-Bit-Fehlerrate):</span>
          <strong style="color: #10b981;">${qkd.qberPercent}% (Schwelle < 11%)</strong>
        </div>
        <div class="qkd-box">
          <span class="qk-lbl">Photonen-Rate:</span>
          <strong>${qkd.photonTransmissionRateKhz.toLocaleString('de-DE')} kHz</strong>
        </div>
        <div class="qkd-box">
          <span class="qk-lbl">Schlüssel-Länge:</span>
          <strong>${qkd.sharedKeyLengthBits} Bit OTP</strong>
        </div>
        <div class="qkd-box">
          <span class="qk-lbl">Kanal-Effizienz:</span>
          <strong style="color: #38bdf8;">${qkd.quantumChannelEfficiencyPercent}%</strong>
        </div>
      </div>

      <!-- Actions -->
      <div class="qkd-actions-row">
        <button class="btn-primary" id="regenerateQKDKeyBtn">
          ⚛️ Neuen quantenverschränkten Einmalschlüssel generieren
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeQKDBtn')?.addEventListener('click', closeQKDModal);

  document.getElementById('regenerateQKDKeyBtn')?.addEventListener('click', () => {
    playSound('success');
    triggerHaptic('heavy');
    showToast('⚛️ Neuer 4096-Bit Quantenschlüssel erfolgreich via QKD-Teleportation ausgetauscht!', 'success');
    renderQKDUI(modal);
  });
}
