// ============================================================
// Amazon 2.0 – Lightning Deals Component
// ============================================================
import type { AppState } from '../types';
import { formatCountdown } from '../utils/formatters';

const timers = new Map<string, ReturnType<typeof setInterval>>();

export function startLightningTimers(state?: AppState): void {
  const products = state?.products ?? [];
  const lightningProducts = products.filter(p =>
    p.isLightningDeal && p.lightningDealEndsAt && p.lightningDealEndsAt > Date.now()
  );

  lightningProducts.forEach(product => {
    // Clear existing timer if any
    if (timers.has(product.id)) {
      clearInterval(timers.get(product.id)!);
    }

    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((product.lightningDealEndsAt! - Date.now()) / 1000));

      // Update any visible countdown elements
      const countdownEl = document.querySelector(`[data-lightning-timer="${product.id}"]`);
      if (countdownEl) {
        countdownEl.textContent = remaining > 0
          ? `⚡ Endet in ${formatCountdown(remaining)}`
          : '⚡ Angebot abgelaufen';
      }

      if (remaining <= 0) {
        clearInterval(timer);
        timers.delete(product.id);
        product.isLightningDeal = false;
      }
    }, 1000);

    timers.set(product.id, timer);
  });
}

export function renderLightningDealsSection(state: AppState): void {
  const section = document.getElementById('lightningDealsSection');
  if (!section) return;

  const deals = state.products.filter(p =>
    p.isLightningDeal && p.lightningDealEndsAt && p.lightningDealEndsAt > Date.now()
  );

  if (deals.length === 0) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  section.innerHTML = `
    <div class="section-header">
      <h2 class="section-title">⚡ Blitzangebote</h2>
      <span class="section-subtitle">Begrenzte Zeit!</span>
    </div>
    <div class="lightning-deals-grid">
      ${deals.map(product => {
        const remaining = Math.max(0, Math.floor((product.lightningDealEndsAt! - Date.now()) / 1000));
        return `
          <div class="lightning-deal-card" data-product-id="${product.id}">
            <img src="${product.images[0]}" alt="${product.title}" class="lightning-deal-img" width="180" height="150" loading="lazy" />
            <div class="lightning-deal-info">
              <p class="lightning-deal-brand">${product.brand}</p>
              <p class="lightning-deal-title">${product.title.slice(0, 50)}${product.title.length > 50 ? '…' : ''}</p>
              <div class="lightning-deal-progress-wrap">
                <div class="lightning-deal-bar">
                  <div class="lightning-deal-fill" style="width: ${product.lightningDealProgress ?? 0}%"></div>
                </div>
                <span class="lightning-deal-claimed">${product.lightningDealProgress}% verkauft</span>
              </div>
              <div class="lightning-deal-footer">
                <span class="lightning-deal-price">${product.price.toFixed(2).replace('.', ',')}€</span>
                ${product.originalPrice ? `<s class="lightning-original">${product.originalPrice.toFixed(2).replace('.', ',')}€</s>` : ''}
                <span class="lightning-timer" data-lightning-timer="${product.id}">
                  ⚡ ${formatCountdown(remaining)}
                </span>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
