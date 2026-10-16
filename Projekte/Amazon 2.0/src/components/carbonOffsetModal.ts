// ============================================================
// Amazon 2.0 – Carbon Footprint & Offset Modal
// ============================================================
import type { Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { calculateProductCarbonFootprint, OFFSET_PROJECTS } from '../utils/carbonCalculator';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let carbonModalEl: HTMLElement | null = null;
let selectedProjectId = 'proj-forest';

function getModal(): HTMLElement {
  if (!carbonModalEl) {
    carbonModalEl = document.createElement('div');
    carbonModalEl.id = 'carbonOffsetModal';
    carbonModalEl.className = 'modal-overlay';
    carbonModalEl.setAttribute('role', 'dialog');
    carbonModalEl.setAttribute('aria-modal', 'true');
    carbonModalEl.setAttribute('aria-label', 'CO2-Ökobilanz & Klimakompensation');
    document.body.appendChild(carbonModalEl);
  }
  return carbonModalEl;
}

export function openCarbonOffsetModal(product: Product): void {
  const modal = getModal();
  renderCarbonUI(modal, product);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeCarbonOffsetModal(): void {
  if (carbonModalEl) {
    carbonModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderCarbonUI(modal: HTMLElement, product: Product): void {
  const c = calculateProductCarbonFootprint(product);

  modal.innerHTML = `
    <div class="modal-dialog carbon-dialog">
      <button class="modal-close" id="closeCarbonBtn" aria-label="Schließen">✕</button>

      <div class="carbon-header">
        <div class="carbon-badge">🌿 100% TRANSPARENTE ÖKOBILANZ</div>
        <h2>CO₂-Fußabdruck & Klimakompensation</h2>
        <p class="carbon-sub">Lebenszyklus-Analyse der Emissionen für „${product.title}“</p>
      </div>

      <!-- Eco Score & Total Banner -->
      <div class="eco-score-banner">
        <div class="eco-grade-badge grade-${c.ecoScoreGrade}">
          <span>Öko-Index</span>
          <strong>${c.ecoScoreGrade}</strong>
        </div>
        <div class="eco-totals">
          <div class="total-co2-number">${c.totalKgCO2} kg <span>CO₂e</span></div>
          <p class="eco-equivalency">Entspricht <strong>${c.treesEquivalent} gepflanzten Bäumen</strong> oder <strong>${c.carKmEquivalent} km Autofahrt</strong>.</p>
        </div>
      </div>

      <!-- Emission Breakdown Bars -->
      <div class="carbon-breakdown-card">
        <h4>Emissions-Aufschlüsselung</h4>
        <div class="co2-bar-row">
          <span>🏭 Produktion & Rohstoffe</span>
          <strong>${c.manufacturingKg} kg</strong>
        </div>
        <div class="co2-bar-row">
          <span>📦 Nachhaltige Verpackung</span>
          <strong>${c.packagingKg} kg</strong>
        </div>
        <div class="co2-bar-row">
          <span>🚚 Transport & Zustellung</span>
          <strong>${c.logisticsKg} kg</strong>
        </div>
      </div>

      <!-- Projects Selection -->
      <div class="offset-projects-section">
        <h4>Wähle dein zertifiziertes Klimaprojekt</h4>
        <div class="projects-list">
          ${OFFSET_PROJECTS.map(p => `
            <div class="project-card ${p.id === selectedProjectId ? 'active' : ''}" data-proj-id="${p.id}">
              <div class="proj-icon">${p.icon}</div>
              <div class="proj-meta">
                <strong>${p.name}</strong>
                <span class="proj-loc">📍 ${p.location}</span>
                <span class="proj-standard">✓ ${p.certifiedStandard}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="carbon-actions">
        <button class="btn-primary btn-offset-now" id="executeOffsetBtn">
          🌱 CO₂ für diesen Artikel kompensieren (${formatPrice(c.offsetCostEur)})
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeCarbonBtn')?.addEventListener('click', closeCarbonOffsetModal);

  // Switch project
  modal.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('click', () => {
      selectedProjectId = card.getAttribute('data-proj-id') || 'proj-forest';
      playSound('click');
      triggerHaptic('light');
      renderCarbonUI(modal, product);
    });
  });

  // Execute Offset
  document.getElementById('executeOffsetBtn')?.addEventListener('click', () => {
    const proj = OFFSET_PROJECTS.find(p => p.id === selectedProjectId) || OFFSET_PROJECTS[0];
    playSound('success');
    triggerHaptic('medium');
    showToast(`🌱 ${c.totalKgCO2} kg CO₂ über „${proj.name}“ erfolgreich kompensiert! Zertifikat ausgestellt.`, 'success');
    closeCarbonOffsetModal();
  });
}
