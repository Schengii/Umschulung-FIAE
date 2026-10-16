// ============================================================
// Amazon 2.0 – WebRTC Peer-to-Peer AirDrop Modal
// ============================================================
import { getNearbyAirDropDevices, executeAirDropTransfer } from '../utils/p2pAirDrop';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let airdropModalEl: HTMLElement | null = null;
let isSending = false;

function getModal(): HTMLElement {
  if (!airdropModalEl) {
    airdropModalEl = document.createElement('div');
    airdropModalEl.id = 'p2pAirDropModal';
    airdropModalEl.className = 'modal-overlay';
    airdropModalEl.setAttribute('role', 'dialog');
    airdropModalEl.setAttribute('aria-modal', 'true');
    airdropModalEl.setAttribute('aria-label', 'WebRTC P2P AirDrop Hub');
    document.body.appendChild(airdropModalEl);
  }
  return airdropModalEl;
}

export function openP2PAirDropModal(fileName: string = 'Amazon2_Rechnung_Re-8492.pdf'): void {
  const modal = getModal();
  renderAirDropUI(modal, fileName);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeP2PAirDropModal(): void {
  if (airdropModalEl) {
    airdropModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderAirDropUI(modal: HTMLElement, fileName: string): void {
  const devices = getNearbyAirDropDevices();

  modal.innerHTML = `
    <div class="modal-dialog airdrop-dialog">
      <button class="modal-close" id="closeAirDropBtn" aria-label="Schließen">✕</button>

      <div class="airdrop-header">
        <div class="airdrop-badge">⚡ WEBRTC INSTANT AIRDROP</div>
        <h2>Serverloser P2P-Dateitransfer</h2>
        <p class="airdrop-sub">Übertrage Rechnungs-PDFs und Garantiescheine direkt und verschlüsselt an Geräte in der Nähe.</p>
      </div>

      <!-- Radar Pulse Visualization -->
      <div class="airdrop-radar-box">
        <div class="radar-circle circle-1"></div>
        <div class="radar-circle circle-2"></div>
        <div class="radar-circle circle-3"></div>
        <div class="radar-center-icon">📡</div>
        <span class="radar-status-label">Suche nach Geräten in Reichweite...</span>
      </div>

      <!-- Nearby Devices Grid -->
      <div class="nearby-devices-grid">
        ${devices.map(d => `
          <div class="airdrop-device-card" data-dev-id="${d.id}">
            <div class="dev-avatar">${d.avatarIcon}</div>
            <div class="dev-meta">
              <strong>${d.name}</strong>
              <span class="dev-dist">📍 ca. ${d.distanceMeters} m • Signal: ${d.signalStrengthPercent}%</span>
            </div>
            <button class="btn-airdrop-send" data-send-id="${d.id}">Senden</button>
          </div>
        `).join('')}
      </div>

      <!-- Sending File Info & Progress -->
      <div class="airdrop-file-card">
        <span>📄 Dokument: <strong>${fileName}</strong> (124 KB)</span>
        <div class="airdrop-progress-track" id="airdropProgressTrack" style="display: none;">
          <div class="airdrop-progress-fill" id="airdropProgressFill" style="width: 0%;"></div>
        </div>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeAirDropBtn')?.addEventListener('click', closeP2PAirDropModal);

  modal.querySelectorAll('.btn-airdrop-send').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      if (isSending) return;
      isSending = true;

      const id = (e.currentTarget as HTMLElement).getAttribute('data-send-id');
      const targetDevice = devices.find(d => d.id === id) || devices[0];

      const track = document.getElementById('airdropProgressTrack');
      const fill = document.getElementById('airdropProgressFill');
      if (track) track.style.display = 'block';

      playSound('quest');
      triggerHaptic('light');

      await executeAirDropTransfer(targetDevice, fileName, (p) => {
        if (fill) fill.style.width = `${p}%`;
      });

      isSending = false;
      playSound('success');
      triggerHaptic('heavy');
      showToast(`⚡ „${fileName}“ wurde per AirDrop erfolgreich an „${targetDevice.name}“ gesendet!`, 'success');
      closeP2PAirDropModal();
    });
  });
}
