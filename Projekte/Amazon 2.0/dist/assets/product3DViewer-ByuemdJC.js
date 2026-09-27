import{t as e}from"./index-Bdwzcci5.js";function t(e){let t=document.getElementById(`viewer3DModal`);t||(t=document.createElement(`div`),t.id=`viewer3DModal`,t.className=`modal-overlay`,document.body.appendChild(t)),t.innerHTML=`
    <div class="modal-dialog viewer3d-dialog">
      <button class="modal-close" id="close3DModal">✕</button>
      <div class="viewer3d-header">
        <h2>📦 3D & AR Studio: ${e.title}</h2>
        <span class="viewer3d-badge">360° Interaktiv</span>
      </div>

      <div class="canvas3d-container">
        <canvas id="product3dCanvas" width="480" height="340"></canvas>
        <div class="canvas3d-controls-overlay">
          <span>🖱️ Ziehen zum Drehen</span>
          <span>🔍 Scrollen zum Zoomen</span>
        </div>
      </div>

      <div class="viewer3d-toolbar">
        <div class="color-picker-3d">
          <label>Farbe:</label>
          <button class="color-swatch active" data-color="#1e293b" style="background:#1e293b;" title="Space Grau"></button>
          <button class="color-swatch" data-color="#cbd5e1" style="background:#cbd5e1;" title="Silber"></button>
          <button class="color-swatch" data-color="#eab308" style="background:#eab308;" title="Gold"></button>
          <button class="color-swatch" data-color="#0284c7" style="background:#0284c7;" title="Pazifikblau"></button>
        </div>

        <div class="action-btns-3d">
          <button class="btn-secondary sm" id="autoRotateBtn">🔄 Auto-Rotate: AN</button>
          <button class="btn-primary sm" id="launchArBtn">📱 Im Raum ansehen (AR)</button>
        </div>
      </div>
    </div>
  `,t.classList.add(`open`);let n=()=>{t?.classList.remove(`open`),f()};document.getElementById(`close3DModal`)?.addEventListener(`click`,n),t.addEventListener(`click`,e=>{e.target===t&&n()});let r=document.getElementById(`product3dCanvas`);r&&p(r);let i=!0,a=document.getElementById(`autoRotateBtn`);a?.addEventListener(`click`,()=>{i=!i,a&&(a.textContent=`🔄 Auto-Rotate: ${i?`AN`:`AUS`}`),d(i)}),document.getElementById(`launchArBtn`)?.addEventListener(`click`,()=>{m(e)}),t.querySelectorAll(`.color-swatch`).forEach(e=>{e.addEventListener(`click`,()=>{t?.querySelectorAll(`.color-swatch`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`),u(e.getAttribute(`data-color`))})})}var n=null,r=.4,i=.6,a=!1,o=0,s=0,c=!0,l=`#1e293b`;function u(e){l=e}function d(e){c=e}function f(){n&&cancelAnimationFrame(n)}function p(e){let t=e.getContext(`2d`);if(!t)return;e.addEventListener(`mousedown`,e=>{a=!0,o=e.clientX,s=e.clientY}),window.addEventListener(`mousemove`,e=>{if(!a)return;let t=e.clientX-o,n=e.clientY-s;i+=t*.01,r+=n*.01,o=e.clientX,s=e.clientY}),window.addEventListener(`mouseup`,()=>{a=!1});let u=[[-70,-70,-70],[70,-70,-70],[70,70,-70],[-70,70,-70],[-70,-70,70],[70,-70,70],[70,70,70],[-70,70,70]],d=[[0,1,2,3],[4,5,6,7],[0,1,5,4],[2,3,7,6],[0,3,7,4],[1,2,6,5]];function f(){t?.clearRect(0,0,e.width,e.height),c&&!a&&(i+=.012);let o=e.width/2,s=e.height/2,p=u.map(([e,t,n])=>{let a=e*Math.cos(i)+n*Math.sin(i),c=-e*Math.sin(i)+n*Math.cos(i),l=t*Math.cos(r)-c*Math.sin(r),u=t*Math.sin(r)+c*Math.cos(r),d=300/(300+u+180);return{x:o+a*d,y:s+l*d,z:u}});d.map(e=>({face:e,avgZ:(p[e[0]].z+p[e[1]].z+p[e[2]].z+p[e[3]].z)/4})).sort((e,t)=>t.avgZ-e.avgZ).forEach(({face:e})=>{t.beginPath(),t.moveTo(p[e[0]].x,p[e[0]].y),t.lineTo(p[e[1]].x,p[e[1]].y),t.lineTo(p[e[2]].x,p[e[2]].y),t.lineTo(p[e[3]].x,p[e[3]].y),t.closePath(),t.fillStyle=l,t.fill(),t.strokeStyle=`#38bdf8`,t.lineWidth=1.5,t.stroke()}),n=requestAnimationFrame(f)}f()}function m(t){let n=document.getElementById(`arSimModal`);n||(n=document.createElement(`div`),n.id=`arSimModal`,n.className=`modal-overlay`,document.body.appendChild(n)),n.innerHTML=`
    <div class="modal-dialog ar-dialog">
      <button class="modal-close" id="closeArModal">✕</button>
      <div class="ar-camera-view">
        <div class="ar-grid-overlay"></div>
        <div class="ar-object-placed">
          <img src="${t.images[0]}" alt="${t.title}" />
          <div class="ar-dimensions-badge">📏 B: 35cm | H: 20cm</div>
        </div>
        <div class="ar-status-badge">📱 AR Live-Kamera Platzierung</div>
      </div>
      <p class="ar-hint">Bewege dein Smartphone, um das Produkt im Raum auszurichten.</p>
    </div>
  `,n.classList.add(`open`),document.getElementById(`closeArModal`)?.addEventListener(`click`,()=>{n?.classList.remove(`open`)}),e(`📱 AR Modus gestartet: Produkt im Raum platziert`,`info`)}export{t as open3DViewerModal};