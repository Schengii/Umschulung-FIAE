// ============================================================
// Amazon 2.0 – Marketplace Dynamic Pricing ML Modal
// ============================================================
import type { AppState, Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { simulateDynamicPricing, type PricingStrategy } from '../utils/dynamicPricing';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let pricingModalEl: HTMLElement | null = null;
let activeStrategy: PricingStrategy = 'balanced';
let selectedProductIndex = 0;

function getModal(): HTMLElement {
  if (!pricingModalEl) {
    pricingModalEl = document.createElement('div');
    pricingModalEl.id = 'dynamicPricingModal';
    pricingModalEl.className = 'modal-overlay';
    pricingModalEl.setAttribute('role', 'dialog');
    pricingModalEl.setAttribute('aria-modal', 'true');
    pricingModalEl.setAttribute('aria-label', 'Marketplace Dynamic Pricing ML');
    document.body.appendChild(pricingModalEl);
  }
  return pricingModalEl;
}

export function openDynamicPricingModal(state: AppState): void {
  const modal = getModal();
  renderPricingUI(modal, state);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeDynamicPricingModal(): void {
  if (pricingModalEl) {
    pricingModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderPricingUI(modal: HTMLElement, state: AppState): void {
  const product: Product = state.products[selectedProductIndex] || state.products[0];
  const sim = simulateDynamicPricing(product, activeStrategy);

  modal.innerHTML = `
    <div class="modal-dialog pricing-sim-dialog">
      <button class="modal-close" id="closePricingBtn" aria-label="Schließen">✕</button>

      <div class="pricing-header">
        <div class="pricing-badge">💼 SELLER SUITE • DYNAMIC ML PRICING</div>
        <h2>KI-gestützte Preiselastizitäts- & Margen-Simulation</h2>
        <p class="pricing-sub">Optimiere automatisch deine Buy-Box Gewinnchance und maximiere deinen Deckungsbeitrag in Echtzeit.</p>
      </div>

      <!-- Product Selector -->
      <div class="pricing-prod-selector">
        <label for="pricingProdSelect">Zu optimierendes Marketplace-Produkt:</label>
        <select id="pricingProdSelect" class="form-select">
          ${state.products.map((p, i) => `
            <option value="${i}" ${i === selectedProductIndex ? 'selected' : ''}>${p.title} (${formatPrice(p.price)})</option>
          `).join('')}
        </select>
      </div>

      <!-- Strategy Chips -->
      <div class="strategy-chips-row">
        <button class="strat-chip ${activeStrategy === 'buybox' ? 'active' : ''}" data-strat="buybox">
          ⚔️ Buy-Box Jäger (Aggressiv 94%)
        </button>
        <button class="strat-chip ${activeStrategy === 'balanced' ? 'active' : ''}" data-strat="balanced">
          ⚖️ Smart Balanced (Optimaler Profit)
        </button>
        <button class="strat-chip ${activeStrategy === 'margin' ? 'active' : ''}" data-strat="margin">
          💎 Margen-Maximierer (Premium)
        </button>
      </div>

      <!-- Simulation Results KPI Grid -->
      <div class="pricing-kpi-grid">
        <div class="kpi-card">
          <span class="kpi-label">Empfohlener Preis:</span>
          <strong class="kpi-val" style="color: var(--color-primary);">${formatPrice(sim.suggestedPrice)}</strong>
          <span class="kpi-sub">Einkaufspreis: ${formatPrice(sim.costBasis)}</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-label">Buy-Box Gewinnchance:</span>
          <strong class="kpi-val" style="color: ${sim.buyBoxWinProbabilityPercent > 70 ? '#10b981' : '#f59e0b'};">
            ${sim.buyBoxWinProbabilityPercent}%
          </strong>
          <span class="kpi-sub">Konkurrenzpreis: ${formatPrice(sim.competitorPrice)}</span>
        </div>

        <div class="kpi-card">
          <span class="kpi-label">Prognostizierter Absatz:</span>
          <strong class="kpi-val">${sim.projectedMonthlySalesUnits} Stk. / Monat</strong>
          <span class="kpi-sub">Marge: ${sim.profitMarginPercent}%</span>
        </div>

        <div class="kpi-card highlight">
          <span class="kpi-label">Erwarteter Monats-Gewinn:</span>
          <strong class="kpi-val" style="color: #10b981;">${formatPrice(sim.projectedMonthlyProfitEur)}</strong>
          <span class="kpi-sub">Umsatz: ${formatPrice(sim.projectedMonthlyRevenueEur)}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="pricing-actions">
        <button class="btn-primary btn-apply-price" id="applyDynamicPriceBtn" style="width: 100%;">
          ✨ Empfohlenen Preis von ${formatPrice(sim.suggestedPrice)} im Shop aktivieren
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closePricingBtn')?.addEventListener('click', closeDynamicPricingModal);

  // Product select
  document.getElementById('pricingProdSelect')?.addEventListener('change', (e) => {
    selectedProductIndex = parseInt((e.target as HTMLSelectElement).value, 10);
    renderPricingUI(modal, state);
  });

  // Strategy change
  modal.querySelectorAll('.strat-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeStrategy = btn.getAttribute('data-strat') as PricingStrategy;
      playSound('click');
      triggerHaptic('light');
      renderPricingUI(modal, state);
    });
  });

  // Apply Price
  document.getElementById('applyDynamicPriceBtn')?.addEventListener('click', () => {
    product.price = sim.suggestedPrice;
    playSound('success');
    triggerHaptic('heavy');
    showToast(`💼 Dynamischer Preis von ${formatPrice(sim.suggestedPrice)} für „${product.title}“ übernommen!`, 'success');
    closeDynamicPricingModal();
  });
}
