// ============================================================
// Amazon 2.0 – AI Smart Energy Grid & Solar Logistics Modal
// ============================================================
import { getRegionalSolarGridStatus } from '../utils/solarGridLogistics';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let solarModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!solarModalEl) {
    solarModalEl = document.createElement('div');
    solarModalEl.id = 'solarGridModal';
    solarModalEl.className = 'modal-overlay';
    solarModalEl.setAttribute('role', 'dialog');
    solarModalEl.setAttribute('aria-modal', 'true');
    solarModalEl.setAttribute('aria-label', 'Solar Energy Grid Logistics');
    document.body.appendChild(solarModalEl);
  }
  return solarModalEl;
}

export function openSolarGridModal(): void {
  const modal = getModal();
  renderSolarUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeSolarGridModal(): void {
  if (solarModalEl) {
    solarModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderSolarUI(modal: HTMLElement): void {
  const status = getRegionalSolarGridStatus();

  modal.innerHTML = `
    <div class="modal-dialog solar-dialog">
      <button class="modal-close" id="closeSolarBtn" aria-label="Schließen">✕</button>

      <div class="solar-header">
        <div class="solar-badge">⚡ AI SMART ENERGY GRID LOGISTICS</div>
        <h2>Solar- & Ökostrom-optimierte Zustellung</h2>
        <p class="solar-sub">Liefere deine Bestellungen genau dann aus, wenn regionale Solaranlagen maximalen Überschussstrom ins Netz speisen.</p>
      </div>

      <!-- Live Grid Card -->
      <div class="solar-grid-banner">
        <div class="solar-sun-icon">☀️</div>
        <div class="solar-meta">
          <h4>Netz-Status: <strong>SOLAR-PEAK AKTIV (${status.greenEnergySharePercent}% Ökostrom)</strong></h4>
          <p>Aktueller lokaler Solarüberschuss: <strong>+${status.solarSurplusMegawatts} MW</strong> im Stromnetz.</p>
        </div>
        <div class="solar-tag">-${status.ecoDiscountPercent}% ÖKO-BONUS</div>
      </div>

      <!-- Recommended Slot Card -->
      <div class="solar-slot-card">
        <div class="slot-top">
          <span class="slot-lbl">Empfohlenes grünes Lieferfenster:</span>
          <strong class="slot-time">${status.bestEcoDeliverySlot}</strong>
        </div>
        <div class="slot-impact">
          <span>🌿 Ersparnis: <strong>${status.co2SavingsKg} kg CO₂</strong> (100% solargeladener E-Transporter)</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="solar-actions-row">
        <button class="btn-primary" id="bookSolarSlotBtn">
          ☀️ Grünes Solar-Lieferfenster verbindlich wählen (-${status.ecoDiscountPercent}%)
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeSolarBtn')?.addEventListener('click', closeSolarGridModal);

  document.getElementById('bookSolarSlotBtn')?.addEventListener('click', () => {
    playSound('success');
    triggerHaptic('heavy');
    showToast(`☀️ Solar-Lieferfenster gebucht! ${status.co2SavingsKg}kg CO₂ gespart & ${status.ecoDiscountPercent}% Rabatt aktiviert.`, 'success');
    closeSolarGridModal();
  });
}
