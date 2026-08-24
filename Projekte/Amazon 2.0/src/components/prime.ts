// ============================================================
// Amazon 2.0 – Prime Modal Component
// ============================================================
import type { AppState } from '../types';
import { formatDate } from '../utils/formatters';
import { writeStorage, KEYS } from '../utils/persist';
import { showToast } from './toast';

let primeModal: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!primeModal) {
    primeModal = document.createElement('div');
    primeModal.id = 'primeModal';
    primeModal.className = 'modal-overlay';
    primeModal.setAttribute('role', 'dialog');
    primeModal.setAttribute('aria-modal', 'true');
    primeModal.setAttribute('aria-label', 'Amazon Prime');
    document.body.appendChild(primeModal);
    primeModal.addEventListener('click', e => {
      if (e.target === primeModal) closePrimeModal();
    });
  }
  return primeModal;
}

export function openPrimeModal(state?: AppState): void {
  const modal = getModal();

  modal.innerHTML = `
    <div class="modal-dialog prime-dialog">
      <button class="modal-close" id="primeClose" aria-label="Schließen">✕</button>
      
      <div class="prime-hero">
        <div class="prime-logo">⭐ <span>prime</span></div>
        <h2>Alles, was du liebst – noch besser.</h2>
        <p>Kostenloser Express-Versand, exklusive Deals, Prime Video & mehr.</p>
      </div>

      <div class="prime-benefits">
        <div class="prime-benefit">
          <div class="prime-benefit-icon">📦</div>
          <h4>Kostenloser Expressversand</h4>
          <p>Millionen Artikel heute oder morgen geliefert, ohne Mindestbestellwert.</p>
        </div>
        <div class="prime-benefit">
          <div class="prime-benefit-icon">⚡</div>
          <h4>Exklusive Blitzangebote</h4>
          <p>30 Minuten früher Zugang zu Lightning Deals und Prime Day Angeboten.</p>
        </div>
        <div class="prime-benefit">
          <div class="prime-benefit-icon">🎬</div>
          <h4>Prime Video</h4>
          <p>Tausende Filme, Serien und Amazon Originals – unbegrenzt streamen.</p>
        </div>
        <div class="prime-benefit">
          <div class="prime-benefit-icon">🎵</div>
          <h4>Prime Music</h4>
          <p>100 Millionen Songs ohne Werbung, offline verfügbar.</p>
        </div>
        <div class="prime-benefit">
          <div class="prime-benefit-icon">📚</div>
          <h4>Prime Reading</h4>
          <p>Über 1.000 eBooks und Magazine inklusive.</p>
        </div>
        <div class="prime-benefit">
          <div class="prime-benefit-icon">🎮</div>
          <h4>Prime Gaming</h4>
          <p>Kostenlose Spiele und In-Game-Inhalte jeden Monat.</p>
        </div>
      </div>

      ${state?.userProfile.isPrime ? `
        <div class="prime-already-member">
          <div class="prime-checkmark">✓</div>
          <h3>Du bist bereits Prime Mitglied!</h3>
          ${state.userProfile.primeExpiry
            ? `<p>Mitgliedschaft gültig bis: <strong>${formatDate(new Date(state.userProfile.primeExpiry))}</strong></p>`
            : ''
          }
          <button class="btn-secondary" id="primeClose2">Schließen</button>
        </div>
      ` : `
        <div class="prime-cta">
          <div class="prime-price">
            <span class="prime-price-amount">8,99€</span>
            <span class="prime-price-period">/ Monat</span>
          </div>
          <p class="prime-trial">30 Tage kostenlos testen – jederzeit kündbar</p>
          <button class="prime-join-btn" id="joinPrimeBtn">Jetzt Prime testen</button>
          <p class="prime-terms">Danach 8,99€/Monat oder 89,90€/Jahr. Jederzeit kündbar.</p>
        </div>
      `}
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  document.getElementById('primeClose')?.addEventListener('click', closePrimeModal);
  document.getElementById('primeClose2')?.addEventListener('click', closePrimeModal);

  document.getElementById('joinPrimeBtn')?.addEventListener('click', () => {
    if (state) {
      state.userProfile.isPrime = true;
      state.userProfile.primeExpiry = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
      writeStorage(KEYS.profile, state.userProfile);
      showToast('🎉 Willkommen bei Prime! Deine 30-tägige Testphase hat begonnen.', 'success');
      closePrimeModal();
    }
  });

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') { closePrimeModal(); document.removeEventListener('keydown', onKeydown); }
  };
  document.addEventListener('keydown', onKeydown);
}

function closePrimeModal(): void {
  primeModal?.classList.remove('open');
  document.body.style.overflow = '';
}
