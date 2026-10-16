// ============================================================
// Amazon 2.0 – DNA & Biomarker Nutrition Configurator Modal
// ============================================================
import type { AppState, Product } from '../types';
import { getSimulatedDNAReport } from '../utils/dnaNutrition';
import { formatPrice } from '../utils/formatters';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';
import { emit } from '../store';

let dnaModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!dnaModalEl) {
    dnaModalEl = document.createElement('div');
    dnaModalEl.id = 'dnaNutritionModal';
    dnaModalEl.className = 'modal-overlay';
    dnaModalEl.setAttribute('role', 'dialog');
    dnaModalEl.setAttribute('aria-modal', 'true');
    dnaModalEl.setAttribute('aria-label', 'DNA Biomarker Ernährungsberater');
    document.body.appendChild(dnaModalEl);
  }
  return dnaModalEl;
}

export function openDNANutritionModal(state: AppState): void {
  const modal = getModal();
  renderDNAUI(modal, state);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeDNANutritionModal(): void {
  if (dnaModalEl) {
    dnaModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderDNAUI(modal: HTMLElement, state: AppState): void {
  const report = getSimulatedDNAReport();

  modal.innerHTML = `
    <div class="modal-dialog dna-dialog">
      <button class="modal-close" id="closeDNABtn" aria-label="Schließen">✕</button>

      <div class="dna-header">
        <div class="dna-badge">🧬 GENOME & BIOMARKER NUTRITION AI</div>
        <h2>Personalisierte DNA-Nährstoff-Formel</h2>
        <p class="dna-sub">Auf Basis deines Genom- und Blut-Biomarker-Profils (<strong>${report.reportId}</strong>) maßgeschneiderte Supplement-Mischung.</p>
      </div>

      <!-- Biomarker Summary Chips -->
      <div class="dna-metrics-grid">
        <div class="dna-metric-card">
          <span class="dm-lbl">Vitamin D3 Status:</span>
          <strong>${report.vitaminD3Status}</strong>
        </div>
        <div class="dna-metric-card">
          <span class="dm-lbl">Omega-3 Index:</span>
          <strong style="color: #f59e0b;">${report.omega3IndexPercent}% (Ziel: > 8%)</strong>
        </div>
        <div class="dna-metric-card">
          <span class="dm-lbl">Koffein-Sensitivität:</span>
          <strong>${report.caffeineMetabolism}</strong>
        </div>
      </div>

      <!-- Custom Formula Ingredients -->
      <div class="dna-formula-box">
        <h4>Maßgeschneiderte Inhaltsstoffe (${report.ingredients.length})</h4>
        <div class="dna-ingredients-list">
          ${report.ingredients.map(ing => `
            <div class="dna-ing-item">
              <div class="dna-ing-main">
                <strong>${ing.name}</strong>
                <span class="dna-dosage">${ing.dosage}</span>
              </div>
              <p class="dna-purpose">💡 ${ing.purpose}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Footer & Add to Cart -->
      <div class="dna-footer-row">
        <div class="dna-price-wrap">
          <span>Individuelle 30-Tage Monats-Kur:</span>
          <strong class="dna-price">${formatPrice(report.priceEur)}</strong>
        </div>
        <button class="btn-primary" id="orderDNABlendBtn">
          🧬 Personalisierte Formel in den Warenkorb
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeDNABtn')?.addEventListener('click', closeDNANutritionModal);

  document.getElementById('orderDNABlendBtn')?.addEventListener('click', () => {
    const customProduct: Product = {
      id: `dna-custom-${Date.now()}`,
      title: report.customFormulaTitle,
      price: report.priceEur,
      originalPrice: +(report.priceEur * 1.3).toFixed(2),
      rating: 5.0,
      reviewCount: 42,
      category: 'grocery',
      brand: 'Amazon BioLabs DNA',
      inStock: true,
      isPrime: true,
      images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500'],
      description: 'Personalisiertes Nährstoff- und Longevity-Supplement-Bundle basierend auf Genom-Biomarkern.',
    };

    state.cart.push({ product: customProduct, qty: 1, addedAt: Date.now() });
    emit('cart:changed');
    playSound('cart');
    triggerHaptic('heavy');
    showToast(`🧬 „${report.customFormulaTitle}“ wurde in deinen Warenkorb gelegt!`, 'success');
    closeDNANutritionModal();
  });
}
