// ============================================================
// Amazon 2.0 – AI Spec Sheet Matrix & Comparison Engine
// ============================================================
import type { AppState, Product } from '../types';
import { formatPrice, renderStars } from '../utils/formatters';
import { showToast } from './toast';

let matrixModal: HTMLElement | null = null;

export function openSpecMatrixModal(state: AppState, p1?: Product, p2?: Product): void {
  if (!matrixModal) {
    matrixModal = document.createElement('div');
    matrixModal.id = 'specMatrixModal';
    matrixModal.className = 'modal-overlay';
    document.body.appendChild(matrixModal);
  }

  const prod1 = p1 ?? state.products[0];
  const prod2 = p2 ?? state.products[1] ?? state.products[0];

  const p1Score = Math.round(prod1.rating * 20 + (prod1.isPrime ? 5 : 0));
  const p2Score = Math.round(prod2.rating * 20 + (prod2.isPrime ? 5 : 0));
  const winner = p1Score >= p2Score ? prod1 : prod2;

  matrixModal.innerHTML = `
    <div class="modal-dialog spec-matrix-dialog">
      <button class="modal-close" id="closeMatrixModal">✕</button>
      <h2>📊 KI-Produktdatenblatt & Analyse Matrix</h2>
      <p class="subtitle">Detaillierter technischer Vergleich mit automatischer KI-Empfehlung</p>

      <!-- AI Winner Banner -->
      <div class="ai-winner-banner">
        <div class="winner-trophy">🏆</div>
        <div>
          <strong>KI-Empfehlung: ${winner.title}</strong>
          <p class="text-xs">Besseres Preis-Leistungs-Verhältnis (${winner.rating}★ Rating, ${winner.reviewCount} Rezensionen)</p>
        </div>
      </div>

      <!-- Spec Comparison Table -->
      <div class="spec-matrix-table-wrapper">
        <table class="spec-matrix-table">
          <thead>
            <tr>
              <th>Eigenschaft</th>
              <th class="prod-col-header">
                <img src="${prod1.images[0]}" alt="${prod1.title}" />
                <span>${prod1.title}</span>
              </th>
              <th class="prod-col-header">
                <img src="${prod2.images[0]}" alt="${prod2.title}" />
                <span>${prod2.title}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Preis</strong></td>
              <td class="price-cell">${formatPrice(prod1.price)}</td>
              <td class="price-cell">${formatPrice(prod2.price)}</td>
            </tr>
            <tr>
              <td><strong>Bewertung</strong></td>
              <td>${renderStars(prod1.rating)} (${prod1.rating})</td>
              <td>${renderStars(prod2.rating)} (${prod2.rating})</td>
            </tr>
            <tr>
              <td><strong>Marke</strong></td>
              <td>${prod1.brand}</td>
              <td>${prod2.brand}</td>
            </tr>
            <tr>
              <td><strong>Versand</strong></td>
              <td>${prod1.isPrime ? '⭐ Prime Express' : 'Standard'}</td>
              <td>${prod2.isPrime ? '⭐ Prime Express' : 'Standard'}</td>
            </tr>
            <tr>
              <td><strong>Verfügbarkeit</strong></td>
              <td>${prod1.inStock ? '✓ Auf Lager' : '❌ Vergriffen'}</td>
              <td>${prod2.inStock ? '✓ Auf Lager' : '❌ Vergriffen'}</td>
            </tr>
            <tr>
              <td><strong>KI-Vorteile</strong></td>
              <td>
                <ul class="pros-list">
                  <li>+ Erstklassige Verarbeitung</li>
                  <li>+ Hohe Kundenzufriedenheit</li>
                </ul>
              </td>
              <td>
                <ul class="pros-list">
                  <li>+ Attraktiver Preis</li>
                  <li>+ Vielseitig einsetzbar</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="matrix-actions">
        <button class="btn-primary" id="buyP1Btn">🛒 ${prod1.title} kaufen</button>
        <button class="btn-primary" id="buyP2Btn">🛒 ${prod2.title} kaufen</button>
      </div>
    </div>
  `;

  matrixModal.classList.add('open');

  const closeModal = () => matrixModal?.classList.remove('open');
  document.getElementById('closeMatrixModal')?.addEventListener('click', closeModal);
  matrixModal.addEventListener('click', e => { if (e.target === matrixModal) closeModal(); });

  document.getElementById('buyP1Btn')?.addEventListener('click', () => {
    import('../store').then(({ saveCart }) => {
      state.cart.push({ product: prod1, qty: 1, addedAt: Date.now() });
      saveCart();
      showToast(`🛒 "${prod1.title}" zum Warenkorb hinzugefügt!`, 'cart');
      closeModal();
    });
  });

  document.getElementById('buyP2Btn')?.addEventListener('click', () => {
    import('../store').then(({ saveCart }) => {
      state.cart.push({ product: prod2, qty: 1, addedAt: Date.now() });
      saveCart();
      showToast(`🛒 "${prod2.title}" zum Warenkorb hinzugefügt!`, 'cart');
      closeModal();
    });
  });
}
