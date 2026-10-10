import{r as e,t}from"./index-Bdwzcci5.js";var n=null;function r(r,i){n||(n=document.createElement(`div`),n.id=`liveAuctionsModal`,n.className=`modal-overlay`,document.body.appendChild(n));let a=[{id:`auc-1`,product:r.products[0],currentBid:Math.round(r.products[0].price*.5),bidCount:14,highestBidder:`User_Tech99`,endsAt:Date.now()+18e5},{id:`auc-2`,product:r.products[1]??r.products[0],currentBid:Math.round((r.products[1]?.price??100)*.4),bidCount:8,highestBidder:`Sarah_K`,endsAt:Date.now()+36e5}],o=[{id:`grp-1`,product:r.products[2]??r.products[0],discountPrice:Math.round((r.products[2]?.price??200)*.65),requiredBuyers:5,currentBuyers:4,expiresInSeconds:3450}];n.innerHTML=`
    <div class="modal-dialog auctions-dialog">
      <button class="modal-close" id="closeAuctionsModal">✕</button>
      <h2>⚡ Live-Auktionen & Group-Buying Hub</h2>

      <!-- Navigation Tabs -->
      <div class="auction-tabs">
        <button class="auction-tab active" data-tab="auctions">🔨 Live-Auktionen (${a.length})</button>
        <button class="auction-tab" data-tab="groupbuying">👥 Group-Buying (-35% Rabatt)</button>
      </div>

      <!-- Tab 1: Live Auctions -->
      <div class="auction-panel" id="tabAuctions">
        <div class="auctions-grid">
          ${a.map(t=>`
            <div class="auction-card" id="card-${t.id}">
              <div class="auction-badge-live">🔴 LIVE AUKTION</div>
              <img src="${t.product.images[0]}" alt="${t.product.title}" />
              <h3>${t.product.title}</h3>
              <p class="auction-orig-price">UVP: ${e(t.product.price)}</p>
              
              <div class="bid-status-box">
                <div class="bid-amount" id="bidAmount-${t.id}">${e(t.currentBid)}</div>
                <small>Höchstbieter: <strong id="bidder-${t.id}">${t.highestBidder}</strong> (${t.bidCount} Gebote)</small>
              </div>

              <button class="btn-primary full-width place-bid-btn" data-id="${t.id}" data-price="${t.currentBid}">
                🔨 Gebot abgeben (+5,00 €)
              </button>
            </div>
          `).join(``)}
        </div>
      </div>

      <!-- Tab 2: Group Buying -->
      <div class="auction-panel hidden" id="tabGroupbuying">
        <div class="group-deals-list">
          ${o.map(t=>`
            <div class="group-deal-card">
              <div class="group-deal-badge">👥 GRUPPEN-DEAL -35%</div>
              <div class="group-deal-layout">
                <img src="${t.product.images[0]}" alt="${t.product.title}" />
                <div>
                  <h3>${t.product.title}</h3>
                  <div class="group-price-row">
                    <span class="group-disc-price">${e(t.discountPrice)}</span>
                    <span class="group-old-price">${e(t.product.price)}</span>
                  </div>
                  
                  <div class="group-progress-wrapper">
                    <div class="group-progress-bar">
                      <div class="group-progress-fill" style="width: ${t.currentBuyers/t.requiredBuyers*100}%;"></div>
                    </div>
                    <small><strong>${t.currentBuyers} von ${t.requiredBuyers}</strong> Käufern beigetreten (Noch 1 Person!)</small>
                  </div>
                </div>
              </div>

              <button class="btn-primary full-width join-group-btn" data-id="${t.id}">
                ⚡ Gruppe beitreten & -35% Rabatt sichern!
              </button>
            </div>
          `).join(``)}
        </div>
      </div>
    </div>
  `,n.classList.add(`open`);let s=()=>n?.classList.remove(`open`);document.getElementById(`closeAuctionsModal`)?.addEventListener(`click`,s),n.addEventListener(`click`,e=>{e.target===n&&s()});let c=n.querySelectorAll(`.auction-tab`);c.forEach(e=>{e.addEventListener(`click`,()=>{c.forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`);let t=e.getAttribute(`data-tab`);document.getElementById(`tabAuctions`)?.classList.toggle(`hidden`,t!==`auctions`),document.getElementById(`tabGroupbuying`)?.classList.toggle(`hidden`,t!==`groupbuying`)})}),n.querySelectorAll(`.place-bid-btn`).forEach(n=>{n.addEventListener(`click`,()=>{let i=n.getAttribute(`data-id`),o=a.find(e=>e.id===i);if(o){o.currentBid+=5,o.bidCount+=1,o.highestBidder=r.userProfile.name;let n=document.getElementById(`bidAmount-${i}`),a=document.getElementById(`bidder-${i}`);n&&(n.textContent=e(o.currentBid)),a&&(a.textContent=r.userProfile.name),t(`🎉 Gebot über ${e(o.currentBid)} abgegeben! Du bist Höchstbietender!`,`success`)}})}),n.querySelectorAll(`.join-group-btn`).forEach(e=>{e.addEventListener(`click`,()=>{let e=o[0];e&&(i({...e.product,price:e.discountPrice}),t(`🎉 Gruppen-Deal abgeschlossen! "${e.product.title}" mit -35% Rabatt im Warenkorb!`,`cart`),s())})})}export{r as openLiveAuctionsModal};