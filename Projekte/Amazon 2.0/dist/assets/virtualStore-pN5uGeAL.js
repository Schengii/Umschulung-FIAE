import{r as e,t}from"./index-Bdwzcci5.js";var n=null,r=null,i=0,a=0;function o(e,t,i){n||(n=document.createElement(`div`),n.id=`virtualStoreModal`,n.className=`modal-overlay`,document.body.appendChild(n)),n.innerHTML=`
    <div class="modal-dialog virtual-store-dialog">
      <button class="modal-close" id="closeStoreModal">✕</button>
      <div class="virtual-store-header">
        <h2>🛍️ Virtueller 3D-Showroom & Store Walkthrough</h2>
        <div class="store-controls-hint">⌨️ <strong>W, A, S, D</strong> oder <strong>Pfeiltasten</strong> zum Gehen · Klick auf Regal zum Kaufen</div>
      </div>

      <div class="virtual-store-viewport">
        <canvas id="virtualStoreCanvas" width="720" height="420"></canvas>
        
        <div class="store-hud-overlay" id="storeHud">
          <div class="hud-status">📍 Position: Hauptgang | Blick: Showroom Center</div>
          <div class="hud-selected-product hidden" id="hudProductCard">
            <span id="hudProdTitle">Kopfhörer Pro</span>
            <strong id="hudProdPrice">149,00 €</strong>
            <button class="btn-primary sm" id="hudAddCartBtn">🛒 In den Warenkorb</button>
            <button class="btn-secondary sm" id="hudInspectBtn">🔍 Details</button>
          </div>
        </div>
      </div>

      <div class="store-nav-pad">
        <button class="pad-btn" id="padUp">▲ W</button>
        <div class="pad-row">
          <button class="pad-btn" id="padLeft">◄ A</button>
          <button class="pad-btn" id="padDown">▼ S</button>
          <button class="pad-btn" id="padRight">► D</button>
        </div>
      </div>
    </div>
  `,n.classList.add(`open`);let a=()=>{n?.classList.remove(`open`),r&&cancelAnimationFrame(r)};document.getElementById(`closeStoreModal`)?.addEventListener(`click`,a),n.addEventListener(`click`,e=>{e.target===n&&a()});let o=document.getElementById(`virtualStoreCanvas`);o&&c(o,e,t,i),window.addEventListener(`keydown`,e=>{n?.classList.contains(`open`)&&((e.key===`w`||e.key===`W`||e.key===`ArrowUp`)&&s(0,-15),(e.key===`s`||e.key===`S`||e.key===`ArrowDown`)&&s(0,15),(e.key===`a`||e.key===`A`||e.key===`ArrowLeft`)&&s(-15,0),(e.key===`d`||e.key===`D`||e.key===`ArrowRight`)&&s(15,0))}),document.getElementById(`padUp`)?.addEventListener(`click`,()=>s(0,-20)),document.getElementById(`padDown`)?.addEventListener(`click`,()=>s(0,20)),document.getElementById(`padLeft`)?.addEventListener(`click`,()=>s(-20,0)),document.getElementById(`padRight`)?.addEventListener(`click`,()=>s(20,0))}function s(e,t){i+=e,a+=t,i=Math.max(-200,Math.min(200,i)),a=Math.max(-300,Math.min(100,a))}function c(n,o,s,c){let l=n.getContext(`2d`);if(!l)return;let u=o.products.slice(0,6),d=[{x:-180,z:-200,title:`Audio & Tech`},{x:0,z:-250,title:`Bestseller`},{x:180,z:-200,title:`Smart Home`}];n.addEventListener(`click`,()=>{let e=u[Math.floor(Math.random()*u.length)];e&&f(e)});function f(n){let r=document.getElementById(`hudProductCard`),i=document.getElementById(`hudProdTitle`),a=document.getElementById(`hudProdPrice`),o=document.getElementById(`hudAddCartBtn`),l=document.getElementById(`hudInspectBtn`);r&&i&&a&&(r.classList.remove(`hidden`),i.textContent=n.title,a.textContent=e(n.price),o?.replaceWith(o.cloneNode(!0)),l?.replaceWith(l.cloneNode(!0)),document.getElementById(`hudAddCartBtn`)?.addEventListener(`click`,()=>{s(n),t(`🛒 "${n.title}" aus dem 3D-Store zum Warenkorb hinzugefügt!`,`cart`)}),document.getElementById(`hudInspectBtn`)?.addEventListener(`click`,()=>{c(n)}))}function p(){l?.clearRect(0,0,n.width,n.height);let t=n.width,o=n.height,s=l.createLinearGradient(0,0,0,o);s.addColorStop(0,`#0f172a`),s.addColorStop(.5,`#1e293b`),s.addColorStop(1,`#090d16`),l.fillStyle=s,l.fillRect(0,0,t,o),l.strokeStyle=`rgba(56, 189, 248, 0.2)`,l.lineWidth=1;let c=160+a*.2;for(let e=-400;e<=t+400;e+=40)l.beginPath(),l.moveTo(t/2+(e-t/2-i)*.3,c),l.lineTo(t/2+(e-t/2-i)*2.5,o),l.stroke();for(let e=c;e<=o;e+=20)l.beginPath(),l.moveTo(0,e),l.lineTo(t,e),l.stroke();d.forEach((n,r)=>{let s=t/2+(n.x-i)*1.4,d=c+(n.z-a)*-.4,f=Math.max(.4,1-(n.z-a)*-.002);if(d>60&&d<o){l.fillStyle=`#334155`,l.fillRect(s-80*f,d-50*f,160*f,90*f),l.strokeStyle=`#FF9900`,l.lineWidth=2,l.strokeRect(s-80*f,d-50*f,160*f,90*f),l.fillStyle=`#FF9900`,l.font=`${Math.floor(12*f)}px sans-serif`,l.textAlign=`center`,l.fillText(n.title,s,d-60*f);let t=u[r%u.length];t&&(l.fillStyle=`#38bdf8`,l.font=`bold ${Math.floor(11*f)}px sans-serif`,l.fillText(t.title.slice(0,14),s,d-10*f),l.fillStyle=`#00FF88`,l.fillText(e(t.price),s,d+15*f))}}),r=requestAnimationFrame(p)}p()}export{o as openVirtualStoreModal};