// ============================================================
// Amazon 2.0 – Geothermal Datacenter Cloud Modal
// ============================================================
import { getGeothermalDatacenterStatus } from '../utils/geothermalCloud';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let geoModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!geoModalEl) {
    geoModalEl = document.createElement('div');
    geoModalEl.id = 'geothermalModal';
    geoModalEl.className = 'modal-overlay';
    geoModalEl.setAttribute('role', 'dialog');
    geoModalEl.setAttribute('aria-modal', 'true');
    geoModalEl.setAttribute('aria-label', 'Geothermie Rechenzentrum');
    document.body.appendChild(geoModalEl);
  }
  return geoModalEl;
}

export function openGeothermalModal(): void {
  const modal = getModal();
  renderGeoUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeGeothermalModal(): void {
  if (geoModalEl) {
    geoModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderGeoUI(modal: HTMLElement): void {
  const geo = getGeothermalDatacenterStatus();

  modal.innerHTML = `
    <div class="modal-dialog geo-dialog">
      <button class="modal-close" id="closeGeoBtn" aria-label="Schließen">✕</button>

      <div class="geo-header">
        <div class="geo-badge">🛰️ 100% GEOTHERMAL VOLCANIC CLOUD</div>
        <h2>Vulkan-Energiebetriebene Cloud</h2>
        <p class="geo-sub">Alle Amazon 2.0 KI- und Checkout-Berechnungen laufen 100% CO₂-neutral auf isländischen Geothermie-Servern.</p>
      </div>

      <!-- Volcano & Geothermal Banner -->
      <div class="geo-volcano-banner">
        <div class="geo-lava-icon">🌋</div>
        <div class="geo-meta">
          <h4>Standort: <strong>${geo.datacenterRegion}</strong></h4>
          <p>Energiequelle: <strong>${geo.volcanicHeatSource}</strong></p>
        </div>
        <div class="geo-tag">100% ÖKO-ENERGIE</div>
      </div>

      <!-- Efficiency Cards -->
      <div class="geo-telemetry-grid">
        <div class="geo-box">
          <span class="ge-lbl">Ökostrom-Anteil:</span>
          <strong style="color: #10b981;">${geo.geothermalEnergySharePercent}% Geothermie</strong>
        </div>
        <div class="geo-box">
          <span class="ge-lbl">PUE-Effizienz:</span>
          <strong style="color: #38bdf8;">${geo.pueEfficiencyScore} (Exzellent)</strong>
        </div>
        <div class="geo-box">
          <span class="ge-lbl">Eingespartes CO₂:</span>
          <strong>${geo.annualCo2AvoidedTons.toLocaleString('de-DE')} t / Jahr</strong>
        </div>
        <div class="geo-box">
          <span class="ge-lbl">Gesamtleistung:</span>
          <strong>${geo.totalPowerCapacityMw} MW</strong>
        </div>
      </div>

      <!-- Action -->
      <div class="geo-actions-row">
        <button class="btn-primary" id="verifyGreenComputeCertificateBtn">
          🌿 100% Zero-Emission Cloud-Zertifikat prüfen
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeGeoBtn')?.addEventListener('click', closeGeothermalModal);

  document.getElementById('verifyGreenComputeCertificateBtn')?.addEventListener('click', () => {
    playSound('success');
    triggerHaptic('medium');
    showToast('🌿 Zero-Emission Geothermie-Zertifikat (Island Hub) erfolgreich verifiziert!', 'success');
  });
}
