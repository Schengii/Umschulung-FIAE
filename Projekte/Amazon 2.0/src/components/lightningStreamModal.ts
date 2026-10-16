// ============================================================
// Amazon 2.0 – Bitcoin Lightning Micro-Payment Streaming Modal
// ============================================================
import { getInitialLightningState, streamSatsTick, type LightningChannelState } from '../utils/lightningStream';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let lgtModalEl: HTMLElement | null = null;
let channelState: LightningChannelState = getInitialLightningState();
let streamInterval: ReturnType<typeof setInterval> | null = null;

function getModal(): HTMLElement {
  if (!lgtModalEl) {
    lgtModalEl = document.createElement('div');
    lgtModalEl.id = 'lightningStreamModal';
    lgtModalEl.className = 'modal-overlay';
    lgtModalEl.setAttribute('role', 'dialog');
    lgtModalEl.setAttribute('aria-modal', 'true');
    lgtModalEl.setAttribute('aria-label', 'Bitcoin Lightning Streaming Hub');
    document.body.appendChild(lgtModalEl);
  }
  return lgtModalEl;
}

export function openLightningStreamModal(): void {
  const modal = getModal();
  renderLightningUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeLightningStreamModal(): void {
  if (streamInterval) {
    clearInterval(streamInterval);
    streamInterval = null;
    channelState.isStreaming = false;
  }
  if (lgtModalEl) {
    lgtModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderLightningUI(modal: HTMLElement): void {
  modal.innerHTML = `
    <div class="modal-dialog lightning-dialog">
      <button class="modal-close" id="closeLgtBtn" aria-label="Schließen">✕</button>

      <div class="lightning-header">
        <div class="lightning-badge">⚡ BITCOIN LIGHTNING NETWORK</div>
        <h2>Echtzeit-Sats Streaming & Micro-Payments</h2>
        <p class="lightning-sub">Sub-Sekunden Abrechnung für Live-Streams, Auktionen und Pay-per-Second Services.</p>
      </div>

      <!-- Live Channel Stats -->
      <div class="lightning-balance-card">
        <div class="l-stat-left">
          <span>Kanal-Guthaben (Local Balance):</span>
          <strong class="sats-val">${channelState.balanceSats.toLocaleString('de-DE')} SATS</strong>
          <small>≈ ${(channelState.balanceSats * 0.0006).toFixed(2)} €</small>
        </div>
        <div class="l-stat-right">
          <span class="l-node-tag">⚡ ${channelState.nodeAlias}</span>
        </div>
      </div>

      <!-- Streaming Indicator Box -->
      <div class="streaming-monitor-box ${channelState.isStreaming ? 'active' : ''}">
        <div class="stream-pulse-ring"></div>
        <div class="stream-meta">
          <h4>${channelState.isStreaming ? '🔴 LIVE STREAMING AKTIV' : '⏸️ STREAMING PAUSIERT'}</h4>
          <p>Übertragungsrate: <strong>${channelState.streamingRateSatsPerSec} Sats / Sekunde</strong></p>
        </div>
        <div class="stream-total">
          <span>Gesendet:</span>
          <strong>${channelState.totalStreamedSats} SATS</strong>
        </div>
      </div>

      <!-- Actions -->
      <div class="lightning-actions-row">
        <button class="btn-primary" id="toggleStreamBtn">
          ${channelState.isStreaming ? '⏹️ Sats-Streaming stoppen' : '▶️ Sats-Streaming starten (25 Sats/s)'}
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeLgtBtn')?.addEventListener('click', closeLightningStreamModal);

  document.getElementById('toggleStreamBtn')?.addEventListener('click', () => {
    if (channelState.isStreaming) {
      if (streamInterval) clearInterval(streamInterval);
      streamInterval = null;
      channelState.isStreaming = false;
      playSound('alert');
      triggerHaptic('light');
      showToast('⏸️ Lightning Micro-Payment Stream gestoppt.', 'info');
      renderLightningUI(modal);
    } else {
      channelState.isStreaming = true;
      playSound('success');
      triggerHaptic('heavy');
      showToast('⚡ Lightning Streaming aktiviert! 25 Sats/s fließen in Echtzeit.', 'success');
      renderLightningUI(modal);

      streamInterval = setInterval(() => {
        channelState = streamSatsTick(channelState);
        renderLightningUI(modal);
      }, 1000);
    }
  });
}
