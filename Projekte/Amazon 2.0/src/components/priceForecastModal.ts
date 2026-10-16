// ============================================================
// Amazon 2.0 – AI Price Forecast Modal Component
// ============================================================
import type { Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { generatePriceForecast } from '../utils/priceForecaster';
import { playSound } from '../utils/audio';

let forecastModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!forecastModalEl) {
    forecastModalEl = document.createElement('div');
    forecastModalEl.id = 'priceForecastModal';
    forecastModalEl.className = 'modal-overlay';
    forecastModalEl.setAttribute('role', 'dialog');
    forecastModalEl.setAttribute('aria-modal', 'true');
    forecastModalEl.setAttribute('aria-label', 'KI-Preisprognose');
    document.body.appendChild(forecastModalEl);
  }
  return forecastModalEl;
}

export function openPriceForecastModal(product: Product): void {
  const modal = getModal();
  const res = generatePriceForecast(product);
  playSound('quest');

  modal.innerHTML = `
    <div class="modal-dialog forecast-dialog">
      <button class="modal-close" id="closeForecastBtn" aria-label="Schließen">✕</button>

      <div class="forecast-header">
        <div class="forecast-badge">📈 DYNAMIC AI PRICE FORECASTING</div>
        <h2>30-Tage KI-Preisprognose & Kaufempfehlung</h2>
        <p class="forecast-sub">Maschinelle Zeitreihen-Analyse für „${product.title}“</p>
      </div>

      <!-- Recommendation Card -->
      <div class="forecast-verdict-card verdict-${res.recommendedAction}">
        <div class="verdict-icon">
          ${res.recommendedAction === 'BUY_NOW' ? '🟢' : res.recommendedAction === 'WAIT_FEW_DAYS' ? '🟡' : '🔵'}
        </div>
        <div class="verdict-content">
          <div class="verdict-title-row">
            <h3>
              ${res.recommendedAction === 'BUY_NOW' ? 'Empfehlung: Jetzt kaufen' : res.recommendedAction === 'WAIT_FEW_DAYS' ? 'Empfehlung: Einige Tage warten' : 'Guter Deal: Kaufen lohnt sich'}
            </h3>
            <span class="confidence-pill">KI-Konfidenz: ${res.confidenceScore}%</span>
          </div>
          <p class="verdict-reason">${res.actionReason}</p>
        </div>
      </div>

      <!-- Key Metrics Row -->
      <div class="forecast-metrics-grid">
        <div class="f-metric">
          <span class="f-label">Aktueller Preis:</span>
          <strong>${formatPrice(res.currentPrice)}</strong>
        </div>
        <div class="f-metric">
          <span class="f-label">Erwarteter Preis (in 30T):</span>
          <strong style="color: ${res.changePercent < 0 ? '#10b981' : '#f59e0b'}">
            ${formatPrice(res.expectedPrice30d)} (${res.changePercent > 0 ? '+' : ''}${res.changePercent}%)
          </strong>
        </div>
        <div class="f-metric">
          <span class="f-label">Preissenkungs-Chance:</span>
          <strong>${res.dropProbability}%</strong>
        </div>
      </div>

      <!-- Trajectory Points Table -->
      <div class="forecast-trajectory-section">
        <h4>30-Tage Prognose-Verlauf</h4>
        <div class="trajectory-bars">
          ${res.projectedTrajectory.map(pt => `
            <div class="traj-bar-item">
              <span class="traj-day">${pt.label}</span>
              <div class="traj-bar-track">
                <div class="traj-bar-fill" style="height: ${Math.max(20, Math.min(100, (pt.predictedPrice / res.currentPrice) * 60))}%;"></div>
              </div>
              <span class="traj-price">${formatPrice(pt.predictedPrice)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  const close = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };
  document.getElementById('closeForecastBtn')?.addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });
}
