const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-Bdwzcci5.js","assets/index-DbqdhET1.css"])))=>i.map(i=>d[i]);
import{a as e,n as t,t as n}from"./index-Bdwzcci5.js";var r=null;function i(i){r||(r=document.createElement(`div`),r.id=`rewardsQuestModal`,r.className=`modal-overlay`,document.body.appendChild(r)),r.innerHTML=`
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
  `,r.classList.add(`open`);let a=()=>r?.classList.remove(`open`);document.getElementById(`closeQuestModal`)?.addEventListener(`click`,a),r.addEventListener(`click`,e=>{e.target===r&&a()}),document.getElementById(`openMysteryBoxBtn`)?.addEventListener(`click`,()=>{let r=document.getElementById(`mysteryBoxDisplay`);r&&(r.classList.add(`spinning`),n(`🔑 Mystery Box wird geöffnet...`,`info`),setTimeout(()=>{r.classList.remove(`spinning`);let a=[{title:`🎁 10,00 € Gratis Guthaben`,type:`balance`,amount:10},{title:`🎟️ 25% Exklusiv-Gutschein`,type:`coupon`,code:`MYSTERY25`}],o=a[Math.floor(Math.random()*a.length)];o.type===`balance`?(i.userBalance.amount+=o.amount??10,e(),t(async()=>{let{emit:e}=await import(`./index-Bdwzcci5.js`).then(e=>e.o);return{emit:e}},__vite__mapDeps([0,1])).then(({emit:e})=>e(`balance:changed`)),n(`🎉 GEWONNEN! ${o.title} auf dein Konto gutgeschrieben!`,`success`)):n(`🎉 GEWONNEN! Gutscheincode ${o.code} freigeschaltet!`,`success`)},1600))})}export{i as openRewardsQuestModal};