// ============================================================
// Amazon 2.0 – Smart-Fitting & Größen-KI Studio
// ============================================================
import type { Product } from '../types';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

export type FitCategory = 'wrist' | 'headset' | 'room';

export interface FitRecommendation {
  category: FitCategory;
  detectedMeasurement: string;
  recommendedSize: string;
  matchAccuracyPercent: number;
  fitVerdict: string;
}

let fittingModalEl: HTMLElement | null = null;
let activeCategory: FitCategory = 'wrist';

function getModal(): HTMLElement {
  if (!fittingModalEl) {
    fittingModalEl = document.createElement('div');
    fittingModalEl.id = 'smartFittingModal';
    fittingModalEl.className = 'modal-overlay';
    fittingModalEl.setAttribute('role', 'dialog');
    fittingModalEl.setAttribute('aria-modal', 'true');
    fittingModalEl.setAttribute('aria-label', 'Smart-Fitting Größen-KI');
    document.body.appendChild(fittingModalEl);
  }
  return fittingModalEl;
}

export function openSmartFittingModal(product: Product): void {
  const modal = getModal();
  renderFittingUI(modal, product);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeSmartFittingModal(): void {
  if (fittingModalEl) {
    fittingModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

export function calculateFitRecommendation(category: FitCategory): FitRecommendation {
  if (category === 'wrist') {
    return {
      category: 'wrist',
      detectedMeasurement: '16.8 cm Umfang (Standard M/L)',
      recommendedSize: '45 mm Gehäuse & M/L Armband',
      matchAccuracyPercent: 98.4,
      fitVerdict: 'Perfekte Balance für gute Ablesbarkeit und festen Sitz beim Sport.',
    };
  } else if (category === 'headset') {
    return {
      category: 'headset',
      detectedMeasurement: 'Ohrkanal-Größe: Medium (11.2 mm)',
      recommendedSize: 'Silikon-Passstück Größe M (Standard)',
      matchAccuracyPercent: 96.8,
      fitVerdict: 'Optimale passive Abdichtung für maximale Bass-Performance und Noise-Cancelling.',
    };
  } else {
    return {
      category: 'room',
      detectedMeasurement: 'Sitzabstand: 2.20 m • Schreibtisch-Tiefe: 80 cm',
      recommendedSize: '34" UltraWide oder 49" Curved Monitor',
      matchAccuracyPercent: 97.2,
      fitVerdict: 'Optimales Blickfeld ohne Nackenbelastung im 1000R Krümmungsradius.',
    };
  }
}

function renderFittingUI(modal: HTMLElement, product: Product): void {
  const rec = calculateFitRecommendation(activeCategory);

  modal.innerHTML = `
    <div class="modal-dialog fitting-dialog">
      <button class="modal-close" id="closeFittingBtn" aria-label="Schließen">✕</button>

      <div class="fitting-header">
        <div class="fitting-badge">📐 COMPUTER-VISION GRÖSSEN-KI</div>
        <h2>Smart-Fitting Studio & Digitale Maßanalyse</h2>
        <p class="fitting-sub">Optische Vermessung für „${product.title}“ zur Ermittlung der idealen Passform.</p>
      </div>

      <!-- Mode Selector -->
      <div class="fitting-modes-tabs">
        <button class="fit-mode-tab ${activeCategory === 'wrist' ? 'active' : ''}" data-cat="wrist">⌚ Handgelenk (Uhren)</button>
        <button class="fit-mode-tab ${activeCategory === 'headset' ? 'active' : ''}" data-cat="headset">🎧 Kopf & Ohren (Audio)</button>
        <button class="fit-mode-tab ${activeCategory === 'room' ? 'active' : ''}" data-cat="room">🖥️ Raum & Sehabstand</button>
      </div>

      <!-- Camera Scanner Simulation Viewport -->
      <div class="fitting-scanner-box">
        <div class="scanner-grid-crosshair">
          <div class="crosshair-laser"></div>
          <div class="scanner-status-tag">🔴 AI LIVE COMPUTER-VISION SCAN</div>
          <div class="scanner-accuracy-pill">Genauigkeit: ${rec.matchAccuracyPercent}%</div>
        </div>
      </div>

      <!-- Result Card -->
      <div class="fitting-result-card">
        <div class="f-res-header">
          <span class="f-res-icon">✓</span>
          <div>
            <h4>Empfehlung: <strong>${rec.recommendedSize}</strong></h4>
            <span class="f-res-sub">Gemessene Dimension: ${rec.detectedMeasurement}</span>
          </div>
        </div>
        <p class="f-res-verdict">${rec.fitVerdict}</p>
      </div>

      <div class="fitting-actions">
        <button class="btn-primary" id="applyFitVariantBtn" style="width: 100%;">
          ✨ Empfohlene Größe (${rec.recommendedSize.split(' ')[0]}) anwenden
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeFittingBtn')?.addEventListener('click', closeSmartFittingModal);

  // Tabs
  modal.querySelectorAll('.fit-mode-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.getAttribute('data-cat') as FitCategory;
      playSound('click');
      triggerHaptic('light');
      renderFittingUI(modal, product);
    });
  });

  // Apply
  document.getElementById('applyFitVariantBtn')?.addEventListener('click', () => {
    playSound('quest');
    triggerHaptic('medium');
    showToast(`📐 Passform-Empfehlung „${rec.recommendedSize}“ für das Produkt übernommen!`, 'success');
    closeSmartFittingModal();
  });
}
