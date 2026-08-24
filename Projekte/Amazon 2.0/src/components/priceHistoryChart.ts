// ============================================================
// Amazon 2.0 – P2: SVG Price History Chart Component
// ============================================================
import type { PriceHistoryEntry } from '../types';
import { formatPrice } from '../utils/formatters';

export function renderPriceHistoryChart(
  history: PriceHistoryEntry[],
  currentPrice: number,
  containerId: string
): void {
  const container = document.getElementById(containerId);
  if (!container || history.length < 2) {
    if (container) container.innerHTML = '<p>Nicht genügend Daten für einen Preisverlauf.</p>';
    return;
  }

  const W = 600;
  const H = 220;
  const PAD = { top: 20, right: 30, bottom: 40, left: 70 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const prices = history.map(h => h.price);
  const minP = Math.min(...prices) * 0.95;
  const maxP = Math.max(...prices) * 1.05;

  // Scale helpers
  const xScale = (i: number) => PAD.left + (i / (history.length - 1)) * innerW;
  const yScale = (p: number) => PAD.top + innerH - ((p - minP) / (maxP - minP)) * innerH;

  // Build polyline points
  const points = history.map((h, i) => `${xScale(i)},${yScale(h.price)}`).join(' ');

  // Area path (closed shape)
  const areaPath = [
    `M ${xScale(0)} ${yScale(history[0].price)}`,
    ...history.map((h, i) => `L ${xScale(i)} ${yScale(h.price)}`),
    `L ${xScale(history.length - 1)} ${PAD.top + innerH}`,
    `L ${xScale(0)} ${PAD.top + innerH}`,
    'Z',
  ].join(' ');

  // Y-axis ticks (5 steps)
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const price = minP + (i / 4) * (maxP - minP);
    const y = yScale(price);
    return { price, y };
  });

  // Current price line
  const currentY = yScale(currentPrice);

  container.innerHTML = `
    <div class="price-chart-wrapper">
      <h4 class="price-chart-title">📈 Preisverlauf</h4>
      <p class="price-chart-subtitle">
        Aktueller Preis: <strong class="chart-current-price">${formatPrice(currentPrice)}</strong>
        &nbsp;·&nbsp; 
        Tiefstpreis: <strong>${formatPrice(Math.min(...prices))}</strong>
        &nbsp;·&nbsp; 
        Höchstpreis: <strong>${formatPrice(Math.max(...prices))}</strong>
      </p>
      <div class="price-chart-svg-wrap">
        <svg 
          viewBox="0 0 ${W} ${H}" 
          class="price-chart-svg" 
          role="img"
          aria-label="Preisverlauf der letzten ${history.length} Monate"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.35"/>
              <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0.02"/>
            </linearGradient>
            <clipPath id="chartClip">
              <rect x="${PAD.left}" y="${PAD.top}" width="${innerW}" height="${innerH}"/>
            </clipPath>
          </defs>

          <!-- Grid lines -->
          ${yTicks.map(t => `
            <line 
              x1="${PAD.left}" y1="${t.y}" 
              x2="${PAD.left + innerW}" y2="${t.y}"
              stroke="var(--color-border)" stroke-width="1" stroke-dasharray="4 4"
            />
            <text 
              x="${PAD.left - 8}" y="${t.y + 4}" 
              text-anchor="end" 
              font-size="11" 
              fill="var(--color-text-muted)"
            >${formatPrice(t.price)}</text>
          `).join('')}

          <!-- Area fill -->
          <path d="${areaPath}" fill="url(#chartGrad)" clip-path="url(#chartClip)"/>

          <!-- Line -->
          <polyline 
            points="${points}" 
            fill="none" 
            stroke="var(--color-primary)" 
            stroke-width="2.5" 
            stroke-linejoin="round"
            stroke-linecap="round"
            clip-path="url(#chartClip)"
          />

          <!-- Current price reference line -->
          <line 
            x1="${PAD.left}" y1="${currentY}" 
            x2="${PAD.left + innerW}" y2="${currentY}"
            stroke="var(--color-success)" stroke-width="1.5" stroke-dasharray="6 3"
          />
          <text 
            x="${PAD.left + innerW + 5}" y="${currentY + 4}" 
            font-size="10" fill="var(--color-success)"
          >Jetzt</text>

          <!-- Data points -->
          ${history.map((h, i) => `
            <circle 
              cx="${xScale(i)}" cy="${yScale(h.price)}" r="4"
              fill="var(--color-primary)" stroke="var(--color-bg)" stroke-width="2"
            >
              <title>${h.date}: ${formatPrice(h.price)}</title>
            </circle>
          `).join('')}

          <!-- X-axis labels -->
          ${history.map((h, i) => {
            const shortDate = h.date.slice(0, 7); // YYYY-MM
            const [year, month] = shortDate.split('-');
            const monthNames = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
            const label = `${monthNames[parseInt(month, 10) - 1]} ${year.slice(2)}`;
            return `
              <text 
                x="${xScale(i)}" y="${PAD.top + innerH + 20}" 
                text-anchor="middle" 
                font-size="10" 
                fill="var(--color-text-muted)"
              >${label}</text>
            `;
          }).join('')}
        </svg>
      </div>
    </div>
  `;
}
