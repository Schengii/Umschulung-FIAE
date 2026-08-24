// ============================================================
// Amazon 2.0 – Social Shopping & Referral Hub Component
// ============================================================
import type { AppState } from '../types';
import { showToast } from './toast';
import { saveWishlist } from '../store';

let shareModal: HTMLElement | null = null;

export function openShareWishlistModal(state: AppState): void {
  if (!shareModal) {
    shareModal = document.createElement('div');
    shareModal.id = 'shareWishlistModal';
    shareModal.className = 'modal-overlay';
    document.body.appendChild(shareModal);
  }

  const shareCode = 'WL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  const shareUrl = `https://amazon2-0.shop/wishlist/share?id=${shareCode}`;
  const referralCode = `${state.userProfile.name.split(' ')[0].toUpperCase()}-2026`;

  shareModal.innerHTML = `
    <div class="modal-dialog share-dialog">
      <button class="modal-close" id="closeShareModal">✕</button>
      <h2>👥 Social Shopping & Wunschliste Teilen</h2>
      <p class="subtitle">Teile deine Lieblingsprodukte mit Freunden oder sammle Bonusguthaben!</p>

      <!-- Section 1: Share Wishlist -->
      <div class="share-box">
        <h3>🔗 Deine Wunschliste teilen (${state.wishlist.length} Artikel)</h3>
        <p class="text-sm">Jeder mit diesem Link kann deine öffentliche Wunschliste ansehen:</p>
        
        <div class="share-link-group">
          <input type="text" id="shareUrlInput" value="${shareUrl}" readonly />
          <button class="btn-primary sm" id="copyShareUrlBtn">📋 Link kopieren</button>
        </div>

        <div class="social-share-btns">
          <button class="social-btn whatsapp" id="shareWhatsapp">💬 WhatsApp</button>
          <button class="social-btn telegram" id="shareTelegram">✈️ Telegram</button>
          <button class="social-btn email" id="shareEmail">✉️ E-Mail</button>
        </div>
      </div>

      <!-- Section 2: Referral Hub -->
      <div class="share-box referral-box">
        <h3>🎁 Freunde werben & 15,00 € Prämie sichern</h3>
        <p class="text-sm">Für jeden geworbenen Freund erhältst du <strong>15,00 € Guthaben</strong> gutgeschrieben!</p>

        <div class="referral-code-badge">
          Dein Empfehlungscode: <strong>${referralCode}</strong>
        </div>

        <div class="referral-progress">
          <div class="progress-bar-fill" style="width: 33%;"></div>
        </div>
        <span class="text-xs">1 von 3 Freunden geworben (15,00 € bereits verdient)</span>

        <button class="btn-primary full-width" id="simulateReferralBtn" style="margin-top: 12px;">
          🎉 Freund jetzt simuliert werben (+15,00 € Guthaben)
        </button>
      </div>
    </div>
  `;

  shareModal.classList.add('open');

  const closeModal = () => shareModal?.classList.remove('open');
  document.getElementById('closeShareModal')?.addEventListener('click', closeModal);
  shareModal.addEventListener('click', e => { if (e.target === shareModal) closeModal(); });

  // Copy Link
  document.getElementById('copyShareUrlBtn')?.addEventListener('click', () => {
    const input = document.getElementById('shareUrlInput') as HTMLInputElement;
    if (input) {
      navigator.clipboard?.writeText(input.value);
      showToast('📋 Wunschlisten-Link in Zwischenablage kopiert!', 'success');
    }
  });

  // Social Buttons
  document.getElementById('shareWhatsapp')?.addEventListener('click', () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent('Schau dir meine Wunschliste bei Amazon 2.0 an: ' + shareUrl)}`, '_blank');
  });

  document.getElementById('shareTelegram')?.addEventListener('click', () => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=Meine%20Amazon%202.0%20Wunschliste`, '_blank');
  });

  document.getElementById('shareEmail')?.addEventListener('click', () => {
    window.open(`mailto:?subject=Meine Wunschliste bei Amazon 2.0&body=${encodeURIComponent(shareUrl)}`, '_blank');
  });

  // Simulate Referral Bonus
  document.getElementById('simulateReferralBtn')?.addEventListener('click', () => {
    state.userBalance.amount += 15.0;
    saveWishlist();
    showToast('🎉 Bravo! +15,00 € Guthaben wurde deinem Konto gutgeschrieben!', 'success');
    closeModal();
    // Emit balance change
    import('../store').then(({ emit }) => emit('balance:changed'));
  });
}
