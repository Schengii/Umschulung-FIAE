// ============================================================
// Amazon 2.0 – Decentralized P2P Review Verification Modal
// ============================================================
import { getP2PReviews, voteP2PReview } from '../utils/p2pReviewNetwork';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';
import { formatDate } from '../utils/formatters';

let p2pModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!p2pModalEl) {
    p2pModalEl = document.createElement('div');
    p2pModalEl.id = 'p2pReviewModal';
    p2pModalEl.className = 'modal-overlay';
    p2pModalEl.setAttribute('role', 'dialog');
    p2pModalEl.setAttribute('aria-modal', 'true');
    p2pModalEl.setAttribute('aria-label', 'P2P Verifizierungs-Netzwerk');
    document.body.appendChild(p2pModalEl);
  }
  return p2pModalEl;
}

export function openP2PReviewModal(): void {
  const modal = getModal();
  renderP2PUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeP2PReviewModal(): void {
  if (p2pModalEl) {
    p2pModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderP2PUI(modal: HTMLElement): void {
  const reviews = getP2PReviews();

  modal.innerHTML = `
    <div class="modal-dialog p2p-dialog">
      <button class="modal-close" id="closeP2PBtn" aria-label="Schließen">✕</button>

      <div class="p2p-header">
        <div class="p2p-badge">🛡️ P2P REPUTATIONS- & KONSENS-NETZWERK</div>
        <h2>Kryptografisch verifizierte Käufer-Rezensionen</h2>
        <p class="p2p-sub">Manipulationssicher signierte Bewertungen mit Ed25519-Signatur und Peer-to-Peer Konsens-Validierung.</p>
      </div>

      <div class="p2p-reviews-list">
        ${reviews.map(r => `
          <div class="p2p-review-card">
            <div class="p2p-card-top">
              <div class="p2p-author-info">
                <strong>${r.authorName}</strong>
                <span class="p2p-block-pill">🔗 ${r.verifiedOrderBlockId}</span>
                <span style="font-size: 10px; color: var(--color-text-secondary);">${formatDate(r.timestamp)}</span>
              </div>
              <div class="p2p-consensus-score">
                <span>Konsens-Score:</span>
                <strong>${r.consensusScorePercent}%</strong>
              </div>
            </div>

            <div class="p2p-product-ref">Artikel: <em>${r.productTitle}</em></div>
            <p class="p2p-review-text">„${r.content}“</p>

            <div class="p2p-crypto-proof-box">
              <span>SHA-256: <code>${r.hashSha256.substring(0, 24)}...</code></span>
              <span>Signatur: <code>${r.cryptographicSignature}</code></span>
            </div>

            <div class="p2p-vote-actions">
              <span class="vote-prompt">War diese Signatur authentisch & hilfreich?</span>
              <div class="p2p-vote-btns">
                <button class="btn-p2p-vote" data-vote="up" data-id="${r.id}">
                  👍 Verifizieren (${r.peerVotesHelpful})
                </button>
                <button class="btn-p2p-vote" data-vote="down" data-id="${r.id}">
                  ⚠️ Als Fake melden (${r.peerVotesSuspicious})
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeP2PBtn')?.addEventListener('click', closeP2PReviewModal);

  modal.querySelectorAll('.btn-p2p-vote').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = (e.currentTarget as HTMLElement).getAttribute('data-id');
      const isUp = (e.currentTarget as HTMLElement).getAttribute('data-vote') === 'up';
      if (id) {
        voteP2PReview(id, isUp);
        playSound(isUp ? 'success' : 'alert');
        triggerHaptic('light');
        showToast(isUp ? '✓ Stimme im P2P-Konsens-Netzwerk verbucht!' : 'Meldung an Validierungs-Nodes übertragen.', 'info');
        renderP2PUI(modal);
      }
    });
  });
}
