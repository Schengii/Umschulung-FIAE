// ============================================================
// Amazon 2.0 – Social Proof Live Activity Component
// ============================================================
import type { AppState, Product } from '../types';
import { readStorage, writeStorage } from '../utils/persist';

const STORAGE_KEY = 'amz_social_proof_enabled';
let isEnabled = readStorage<boolean>(STORAGE_KEY, true);
let popupContainer: HTMLElement | null = null;
let timerId: ReturnType<typeof setTimeout> | null = null;

const CITIES = [
  'Berlin', 'München', 'Hamburg', 'Köln', 'Frankfurt', 'Stuttgart',
  'Düsseldorf', 'Leipzig', 'Dresden', 'Wien', 'Zürich', 'Nürnberg'
];

const NAMES = [
  'Lukas', 'Sophie', 'Maximilian', 'Emma', 'Felix', 'Mia', 'Leon', 'Hannah',
  'David', 'Laura', 'Alexander', 'Marie', 'Jan', 'Elena', 'Tobias'
];

export function initSocialProof(
  state: AppState,
  onProductClick: (product: Product) => void
): void {
  if (typeof document === 'undefined') return;

  popupContainer = document.createElement('div');
  popupContainer.id = 'socialProofContainer';
  popupContainer.className = 'social-proof-container';
  document.body.appendChild(popupContainer);

  scheduleNextPopup(state, onProductClick);
}

function scheduleNextPopup(
  state: AppState,
  onProductClick: (product: Product) => void
): void {
  if (!isEnabled) return;
  
  // Random delay between 12 and 25 seconds
  const delay = Math.floor(Math.random() * 13000) + 12000;
  
  timerId = setTimeout(() => {
    showRandomActivity(state, onProductClick);
    scheduleNextPopup(state, onProductClick);
  }, delay);
}

function showRandomActivity(
  state: AppState,
  onProductClick: (product: Product) => void
): void {
  if (!popupContainer || !isEnabled || state.products.length === 0) return;

  const randomProduct = state.products[Math.floor(Math.random() * state.products.length)];
  const randomCity = CITIES[Math.floor(Math.random() * CITIES.length)];
  const randomName = NAMES[Math.floor(Math.random() * NAMES.length)];
  const timeAgo = Math.floor(Math.random() * 10) + 1;

  const popup = document.createElement('div');
  popup.className = 'social-proof-toast';
  popup.innerHTML = `
    <button class="social-proof-close" aria-label="Schließen">✕</button>
    <img src="${randomProduct.images[0]}" alt="${randomProduct.title}" class="social-proof-img" />
    <div class="social-proof-content">
      <p class="social-proof-user">
        <span class="social-proof-dot"></span> <strong>${randomName}</strong> aus <strong>${randomCity}</strong>
      </p>
      <p class="social-proof-action">hat gerade gekauft:</p>
      <p class="social-proof-title" title="${randomProduct.title}">${randomProduct.title}</p>
      <span class="social-proof-time">Vor ${timeAgo} Minuten • Verifiziert</span>
    </div>
  `;

  // Click on product
  popup.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).classList.contains('social-proof-close')) {
      e.stopPropagation();
      popup.classList.add('hide');
      setTimeout(() => popup.remove(), 400);
      return;
    }
    onProductClick(randomProduct);
  });

  popupContainer.appendChild(popup);

  // Auto-remove after 6 seconds
  setTimeout(() => {
    if (popup.parentElement) {
      popup.classList.add('hide');
      setTimeout(() => popup.remove(), 400);
    }
  }, 6000);
}

export function toggleSocialProof(): boolean {
  isEnabled = !isEnabled;
  writeStorage(STORAGE_KEY, isEnabled);
  if (!isEnabled && timerId) {
    clearTimeout(timerId);
  }
  return isEnabled;
}
