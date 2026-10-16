// ============================================================
// Amazon 2.0 – Cold-Chain & IoT Sensor Telemetry Modal
// ============================================================
import { getColdChainTelemetry } from '../utils/coldChainSensor';

let coldModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!coldModalEl) {
    coldModalEl = document.createElement('div');
    coldModalEl.id = 'coldChainModal';
    coldModalEl.className = 'modal-overlay';
    coldModalEl.setAttribute('role', 'dialog');
    coldModalEl.setAttribute('aria-modal', 'true');
    coldModalEl.setAttribute('aria-label', 'Cold-Chain IoT Telemetrie');
    document.body.appendChild(coldModalEl);
  }
  return coldModalEl;
}

export function openColdChainModal(shipmentId: string = 'COLD-SENSOR-#4819'): void {
  const modal = getModal();
  renderColdUI(modal, shipmentId);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeColdChainModal(): void {
  if (coldModalEl) {
    coldModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderColdUI(modal: HTMLElement, shipmentId: string): void {
  const data = getColdChainTelemetry(shipmentId);

  modal.innerHTML = `
    <div class="modal-dialog cold-dialog">
      <button class="modal-close" id="closeColdBtn" aria-label="Schließen">✕</button>

      <div class="cold-header">
        <div class="cold-badge">🌡️ IOT COLD-CHAIN & FRISCHE-TELEMETRIE</div>
        <h2>Echtzeit-Kühlketten & Erschütterungs-Protokoll</h2>
        <p class="cold-sub">Lückenlose IoT-Temperatur- und Qualitätserfassung für Sendung <strong>${data.shipmentId}</strong>.</p>
      </div>

      <!-- Seal of Quality Banner -->
      <div class="cold-seal-banner">
        <div class="seal-icon">❄️</div>
        <div class="seal-meta">
          <h4>Kühlkette: <strong>LÜCKENLOS EINGEHALTEN</strong></h4>
          <p>Soll-Bereich: ${data.targetTempRange} • Min: ${data.minRecordedTempCelsius}°C / Max: ${data.maxRecordedTempCelsius}°C</p>
        </div>
        <div class="seal-tag">✓ UNVERSEHRT</div>
      </div>

      <!-- Telemetry Metric Cards -->
      <div class="cold-telemetry-grid">
        <div class="cold-metric-box">
          <span class="cm-label">Aktuelle Kerntemperatur:</span>
          <strong class="cm-val" style="color: #38bdf8;">${data.currentTempCelsius}°C</strong>
        </div>
        <div class="cold-metric-box">
          <span class="cm-label">Relative Luftfeuchtigkeit:</span>
          <strong class="cm-val">${data.humidityPercent}%</strong>
        </div>
        <div class="cold-metric-box">
          <span class="cm-label">Max. Erschütterung (G-Kraft):</span>
          <strong class="cm-val">${data.shockImpactG} G (Sanft)</strong>
        </div>
        <div class="cold-metric-box">
          <span class="cm-label">Digitales Frischesiegel:</span>
          <strong class="cm-val" style="color: #10b981;">Aktiv & Intakt</strong>
        </div>
      </div>

      <!-- Temperature History Points -->
      <div class="temp-history-section">
        <h4>Temperaturverlauf während des Transports</h4>
        <div class="temp-timeline-points">
          ${data.tempHistory.map(p => `
            <div class="temp-point-item">
              <span class="tp-time">vor ${p.timeOffsetMinutes} Min.</span>
              <div class="tp-bar-wrap">
                <div class="tp-bar-fill" style="width: ${(p.temp / 6) * 100}%;"></div>
              </div>
              <strong class="tp-temp">${p.temp}°C</strong>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeColdBtn')?.addEventListener('click', closeColdChainModal);
}
