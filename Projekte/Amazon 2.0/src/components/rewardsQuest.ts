// ============================================================
// Amazon 2.0 – Gamified Quests & Mystery Box Rewards Engine
// ============================================================
import type { AppState } from '../types';
import { showToast } from './toast';
import { saveWishlist } from '../store';

let questModal: HTMLElement | null = null;

export function openRewardsQuestModal(state: AppState): void {
  if (!questModal) {
    questModal = document.createElement('div');
    questModal.id = 'rewardsQuestModal';
    questModal.className = 'modal-overlay';
    document.body.appendChild(questModal);
  }

  questModal.innerHTML = `
    <div class="modal-dialog quest-dialog">
      <button class="modal-close" id="closeQuestModal">✕</button>
      <h2>🎮 Shopping Quests & Mystery Box Hub</h2>
      <p class="subtitle">Erfülle tägliche Aufgaben, um exklusive Mystery Boxes & Guthaben freizuschalten!</p>

      <!-- Daily Quests List -->
      <div class="quests-container">
        <h3>🎯 Tägliche Quests</h3>
        
        <div class="quest-card done">
          <div class="quest-icon">✓</div>
          <div class="quest-details">
            <strong>Täglicher Login</strong>
            <small>Logge dich täglich bei Amazon 2.0 ein</small>
          </div>
          <span class="quest-reward">+50 Münzen</span>
        </div>

        <div class="quest-card done">
          <div class="quest-icon">✓</div>
          <div class="quest-details">
            <strong>Wunschliste erweitern</strong>
            <small>Speichere ein Produkt auf deiner Wunschliste</small>
          </div>
          <span class="quest-reward">+100 Münzen</span>
        </div>

        <div class="quest-card active">
          <div class="quest-icon">🎯</div>
          <div class="quest-details">
            <strong>3D-Showroom erkunden</strong>
            <small>Öffne den 3D-Showroom oder AR-Studio</small>
          </div>
          <span class="quest-reward">+1 Mystery Key</span>
        </div>
      </div>

      <!-- Mystery Box Loot Simulator -->
      <div class="mystery-box-section">
        <h3>🎁 Mystery Box Öffner</h3>
        <p class="text-sm">Du hast <strong>1 Schlüssel</strong> verfügbar!</p>

        <div class="mystery-box-display" id="mysteryBoxDisplay">
          <div class="box-icon-animated">🎁</div>
          <div class="box-glow"></div>
        </div>

        <button class="btn-primary full-width" id="openMysteryBoxBtn">
          🔑 Mystery Box jetzt öffnen!
        </button>
      </div>
    </div>
  `;

  questModal.classList.add('open');

  const closeModal = () => questModal?.classList.remove('open');
  document.getElementById('closeQuestModal')?.addEventListener('click', closeModal);
  questModal.addEventListener('click', e => { if (e.target === questModal) closeModal(); });

  // Open Mystery Box Logic
  document.getElementById('openMysteryBoxBtn')?.addEventListener('click', () => {
    const box = document.getElementById('mysteryBoxDisplay');
    if (box) {
      box.classList.add('spinning');
      showToast('🔑 Mystery Box wird geöffnet...', 'info');

      setTimeout(() => {
        box.classList.remove('spinning');
        const rewards = [
          { title: '🎁 10,00 € Gratis Guthaben', type: 'balance', amount: 10 },
          { title: '🎟️ 25% Exklusiv-Gutschein', type: 'coupon', code: 'MYSTERY25' },
        ];
        const win = rewards[Math.floor(Math.random() * rewards.length)];

        if (win.type === 'balance') {
          state.userBalance.amount += win.amount ?? 10;
          saveWishlist();
          import('../store').then(({ emit }) => emit('balance:changed'));
          showToast(`🎉 GEWONNEN! ${win.title} auf dein Konto gutgeschrieben!`, 'success');
        } else {
          showToast(`🎉 GEWONNEN! Gutscheincode ${win.code} freigeschaltet!`, 'success');
        }
      }, 1600);
    }
  });
}
