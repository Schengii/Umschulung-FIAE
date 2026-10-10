const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-Bdwzcci5.js","assets/index-DbqdhET1.css"])))=>i.map(i=>d[i]);
import{a as e,n as t,t as n}from"./index-Bdwzcci5.js";var r=null;function i(i){r||(r=document.createElement(`div`),r.id=`shareWishlistModal`,r.className=`modal-overlay`,document.body.appendChild(r));let a=`https://amazon2-0.shop/wishlist/share?id=${`WL-`+Math.random().toString(36).substring(2,8).toUpperCase()}`,o=`${i.userProfile.name.split(` `)[0].toUpperCase()}-2026`;r.innerHTML=`
    <div class="modal-dialog share-dialog">
      <button class="modal-close" id="closeShareModal">✕</button>
      <h2>👥 Social Shopping & Wunschliste Teilen</h2>
      <p class="subtitle">Teile deine Lieblingsprodukte mit Freunden oder sammle Bonusguthaben!</p>

      <!-- Section 1: Share Wishlist -->
      <div class="share-box">
        <h3>🔗 Deine Wunschliste teilen (${i.wishlist.length} Artikel)</h3>
        <p class="text-sm">Jeder mit diesem Link kann deine öffentliche Wunschliste ansehen:</p>
        
        <div class="share-link-group">
          <input type="text" id="shareUrlInput" value="${a}" readonly />
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
          Dein Empfehlungscode: <strong>${o}</strong>
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
  `,r.classList.add(`open`);let s=()=>r?.classList.remove(`open`);document.getElementById(`closeShareModal`)?.addEventListener(`click`,s),r.addEventListener(`click`,e=>{e.target===r&&s()}),document.getElementById(`copyShareUrlBtn`)?.addEventListener(`click`,()=>{let e=document.getElementById(`shareUrlInput`);e&&(navigator.clipboard?.writeText(e.value),n(`📋 Wunschlisten-Link in Zwischenablage kopiert!`,`success`))}),document.getElementById(`shareWhatsapp`)?.addEventListener(`click`,()=>{window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Schau dir meine Wunschliste bei Amazon 2.0 an: `+a)}`,`_blank`)}),document.getElementById(`shareTelegram`)?.addEventListener(`click`,()=>{window.open(`https://t.me/share/url?url=${encodeURIComponent(a)}&text=Meine%20Amazon%202.0%20Wunschliste`,`_blank`)}),document.getElementById(`shareEmail`)?.addEventListener(`click`,()=>{window.open(`mailto:?subject=Meine Wunschliste bei Amazon 2.0&body=${encodeURIComponent(a)}`,`_blank`)}),document.getElementById(`simulateReferralBtn`)?.addEventListener(`click`,()=>{i.userBalance.amount+=15,e(),n(`🎉 Bravo! +15,00 € Guthaben wurde deinem Konto gutgeschrieben!`,`success`),s(),t(async()=>{let{emit:e}=await import(`./index-Bdwzcci5.js`).then(e=>e.o);return{emit:e}},__vite__mapDeps([0,1])).then(({emit:e})=>e(`balance:changed`))})}export{i as openShareWishlistModal};