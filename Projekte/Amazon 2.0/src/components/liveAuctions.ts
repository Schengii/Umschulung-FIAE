// ============================================================
// Amazon 2.0 – Live Auctions & Group Buying Engine
// ============================================================
import type { AppState, Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { showToast } from './toast';

let auctionsModal: HTMLElement | null = null;

export interface AuctionItem {
  id: string;
  product: Product;
  currentBid: number;
  bidCount: number;
  highestBidder: string;
  endsAt: number; // timestamp
}

export interface GroupDeal {
  id: string;
  product: Product;
  discountPrice: number;
  requiredBuyers: number;
  currentBuyers: number;
  expiresInSeconds: number;
}

export function openLiveAuctionsModal(state: AppState, onAddToCart: (p: Product) => void): void {
  if (!auctionsModal) {
    auctionsModal = document.createElement('div');
    auctionsModal.id = 'liveAuctionsModal';
    auctionsModal.className = 'modal-overlay';
    document.body.appendChild(auctionsModal);
  }

  const sampleAuctions: AuctionItem[] = [
    {
      id: 'auc-1',
      product: state.products[0],
      currentBid: Math.round(state.products[0].price * 0.5),
      bidCount: 14,
      highestBidder: 'User_Tech99',
      endsAt: Date.now() + 1800000,
    },
    {
      id: 'auc-2',
      product: state.products[1] ?? state.products[0],
      currentBid: Math.round((state.products[1]?.price ?? 100) * 0.4),
      bidCount: 8,
      highestBidder: 'Sarah_K',
      endsAt: Date.now() + 3600000,
    },
  ];

  const sampleGroupDeals: GroupDeal[] = [
    {
      id: 'grp-1',
      product: state.products[2] ?? state.products[0],
      discountPrice: Math.round((state.products[2]?.price ?? 200) * 0.65),
      requiredBuyers: 5,
      currentBuyers: 4,
      expiresInSeconds: 3450,
    },
  ];

  auctionsModal.innerHTML = `
    <div class="modal-dialog auctions-dialog">
      <button class="modal-close" id="closeAuctionsModal">✕</button>
      <h2>⚡ Live-Auktionen & Group-Buying Hub</h2>

      <!-- Navigation Tabs -->
      <div class="auction-tabs">
        <button class="auction-tab active" data-tab="auctions">🔨 Live-Auktionen (${sampleAuctions.length})</button>
        <button class="auction-tab" data-tab="groupbuying">👥 Group-Buying (-35% Rabatt)</button>
      </div>

      <!-- Tab 1: Live Auctions -->
      <div class="auction-panel" id="tabAuctions">
        <div class="auctions-grid">
          ${sampleAuctions.map(auc => `
            <div class="auction-card" id="card-${auc.id}">
              <div class="auction-badge-live">🔴 LIVE AUKTION</div>
              <img src="${auc.product.images[0]}" alt="${auc.product.title}" />
              <h3>${auc.product.title}</h3>
              <p class="auction-orig-price">UVP: ${formatPrice(auc.product.price)}</p>
              
              <div class="bid-status-box">
                <div class="bid-amount" id="bidAmount-${auc.id}">${formatPrice(auc.currentBid)}</div>
                <small>Höchstbieter: <strong id="bidder-${auc.id}">${auc.highestBidder}</strong> (${auc.bidCount} Gebote)</small>
              </div>

              <button class="btn-primary full-width place-bid-btn" data-id="${auc.id}" data-price="${auc.currentBid}">
                🔨 Gebot abgeben (+5,00 €)
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Tab 2: Group Buying -->
      <div class="auction-panel hidden" id="tabGroupbuying">
        <div class="group-deals-list">
          ${sampleGroupDeals.map(grp => `
            <div class="group-deal-card">
              <div class="group-deal-badge">👥 GRUPPEN-DEAL -35%</div>
              <div class="group-deal-layout">
                <img src="${grp.product.images[0]}" alt="${grp.product.title}" />
                <div>
                  <h3>${grp.product.title}</h3>
                  <div class="group-price-row">
                    <span class="group-disc-price">${formatPrice(grp.discountPrice)}</span>
                    <span class="group-old-price">${formatPrice(grp.product.price)}</span>
                  </div>
                  
                  <div class="group-progress-wrapper">
                    <div class="group-progress-bar">
                      <div class="group-progress-fill" style="width: ${(grp.currentBuyers / grp.requiredBuyers) * 100}%;"></div>
                    </div>
                    <small><strong>${grp.currentBuyers} von ${grp.requiredBuyers}</strong> Käufern beigetreten (Noch 1 Person!)</small>
                  </div>
                </div>
              </div>

              <button class="btn-primary full-width join-group-btn" data-id="${grp.id}">
                ⚡ Gruppe beitreten & -35% Rabatt sichern!
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  auctionsModal.classList.add('open');

  const closeModal = () => auctionsModal?.classList.remove('open');
  document.getElementById('closeAuctionsModal')?.addEventListener('click', closeModal);
  auctionsModal.addEventListener('click', e => { if (e.target === auctionsModal) closeModal(); });

  // Tab switching
  const tabs = auctionsModal.querySelectorAll('.auction-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.getAttribute('data-tab');
      document.getElementById('tabAuctions')?.classList.toggle('hidden', target !== 'auctions');
      document.getElementById('tabGroupbuying')?.classList.toggle('hidden', target !== 'groupbuying');
    });
  });

  // Bidding logic
  auctionsModal.querySelectorAll('.place-bid-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const aucId = btn.getAttribute('data-id')!;
      const auc = sampleAuctions.find(a => a.id === aucId);
      if (auc) {
        auc.currentBid += 5;
        auc.bidCount += 1;
        auc.highestBidder = state.userProfile.name;

        const bidEl = document.getElementById(`bidAmount-${aucId}`);
        const bidderEl = document.getElementById(`bidder-${aucId}`);
        if (bidEl) bidEl.textContent = formatPrice(auc.currentBid);
        if (bidderEl) bidderEl.textContent = state.userProfile.name;

        showToast(`🎉 Gebot über ${formatPrice(auc.currentBid)} abgegeben! Du bist Höchstbietender!`, 'success');
      }
    });
  });

  // Group join logic
  auctionsModal.querySelectorAll('.join-group-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const grp = sampleGroupDeals[0];
      if (grp) {
        onAddToCart({ ...grp.product, price: grp.discountPrice });
        showToast(`🎉 Gruppen-Deal abgeschlossen! "${grp.product.title}" mit -35% Rabatt im Warenkorb!`, 'cart');
        closeModal();
      }
    });
  });
}
