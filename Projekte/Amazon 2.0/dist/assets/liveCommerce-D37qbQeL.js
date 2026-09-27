import{r as e,t}from"./index-Bdwzcci5.js";var n=null,r=null;function i(i,o){n||(n=document.createElement(`div`),n.id=`liveCommerceModal`,n.className=`modal-overlay`,document.body.appendChild(n));let s=i.products[0];n.innerHTML=`
    <div class="modal-dialog live-commerce-dialog">
      <button class="modal-close" id="closeLiveModal">✕</button>

      <div class="live-stream-header">
        <div class="live-indicator-badge">🔴 LIVE STUDIO</div>
        <div class="live-stream-title">Bestseller Showdown & Exklusive Streams</div>
        <div class="live-viewers-count">👁️ <span id="viewerCount">1.482</span> Zuschauer</div>
      </div>

      <div class="live-stream-layout">
        <!-- Main Video Screen -->
        <div class="video-screen-container">
          <div class="simulated-video-player">
            <img src="${s.images[0]}" class="stream-bg-image" alt="Live Stream Host" />
            <div class="stream-video-overlay">
              <div class="presenter-tag">🎙️ Host: Alex & Sarah (Live aus Berlin)</div>
              
              <!-- Floating Reactions Canvas Layer -->
              <div class="reactions-particle-container" id="reactionsContainer"></div>

              <!-- Product Overlay Card -->
              <div class="stream-product-overlay">
                <img src="${s.images[0]}" alt="${s.title}" />
                <div class="stream-prod-info">
                  <span class="deal-tag-live">🔥 STREAM-DEAL</span>
                  <h4>${s.title}</h4>
                  <div class="stream-price">${e(s.price)}</div>
                </div>
                <button class="btn-primary sm" id="streamBuyBtn">⚡ Jetzt kaufen</button>
              </div>
            </div>
          </div>

          <!-- Stream Reaction Bar -->
          <div class="stream-reaction-bar">
            <span>Reagiere live:</span>
            <button class="reaction-btn" data-emoji="❤️">❤️</button>
            <button class="reaction-btn" data-emoji="🔥">🔥</button>
            <button class="reaction-btn" data-emoji="👏">👏</button>
            <button class="reaction-btn" data-emoji="😮">😮</button>
          </div>
        </div>

        <!-- Live Chat Sidebar -->
        <div class="live-chat-sidebar">
          <h3>💬 Live-Zuschauer Chat</h3>
          <div class="live-chat-feed" id="liveChatFeed">
            <div class="chat-line"><strong style="color:#38bdf8;">Laura_K:</strong> Mega Deal! 😍</div>
            <div class="chat-line"><strong style="color:#f59e0b;">Markus_B:</strong> Ist der Versand auch kostenlos?</div>
            <div class="chat-line"><strong style="color:#00FF88;">Amazon_Host:</strong> @Markus_B Ja, für Prime Mitglieder kostenlos!</div>
          </div>

          <div class="live-chat-input-row">
            <input type="text" id="liveChatInput" placeholder="Sende einen Live-Kommentar..." />
            <button id="sendLiveChatBtn" class="btn-primary sm">➔</button>
          </div>
        </div>
      </div>
    </div>
  `,n.classList.add(`open`);let c=()=>{n?.classList.remove(`open`),r&&clearInterval(r)};document.getElementById(`closeLiveModal`)?.addEventListener(`click`,c),n.addEventListener(`click`,e=>{e.target===n&&c()}),document.getElementById(`streamBuyBtn`)?.addEventListener(`click`,()=>{o(s),t(`🛒 "${s.title}" direkt aus dem Live-Stream gekauft!`,`cart`)}),n.querySelectorAll(`.reaction-btn`).forEach(e=>{e.addEventListener(`click`,()=>{a(e.getAttribute(`data-emoji`))})});let l=document.getElementById(`liveChatFeed`),u=[{user:`Stefan_77`,text:`Gerade bestellt! Danke für den Tipp!`},{user:`Julia_M`,text:`Wie lange geht das Angebot noch?`},{user:`TechFan2026`,text:`Das Gerät ist der Wahnsinn 🔥`},{user:`Christian_P`,text:`Kann ich das auch in Silber kaufen?`}];r=setInterval(()=>{if(!n?.classList.contains(`open`))return;let e=u[Math.floor(Math.random()*u.length)];if(l&&e){let t=document.createElement(`div`);t.className=`chat-line`,t.innerHTML=`<strong style="color:#38bdf8;">${e.user}:</strong> ${e.text}`,l.appendChild(t),l.scrollTop=l.scrollHeight}},3500);let d=document.getElementById(`liveChatInput`),f=document.getElementById(`sendLiveChatBtn`),p=()=>{let e=d?.value.trim();if(e&&l){let t=document.createElement(`div`);t.className=`chat-line`,t.innerHTML=`<strong style="color:#FF9900;">${i.userProfile.name}:</strong> ${e}`,l.appendChild(t),l.scrollTop=l.scrollHeight,d.value=``}};f?.addEventListener(`click`,p),d?.addEventListener(`keydown`,e=>{e.key===`Enter`&&p()})}function a(e){let t=document.getElementById(`reactionsContainer`);if(!t)return;let n=document.createElement(`span`);n.className=`floating-emoji-particle`,n.textContent=e,n.style.left=`${Math.random()*80+10}%`,t.appendChild(n),setTimeout(()=>n.remove(),1800)}export{i as openLiveCommerceModal};