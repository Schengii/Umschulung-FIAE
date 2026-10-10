const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-Bdwzcci5.js","assets/index-DbqdhET1.css"])))=>i.map(i=>d[i]);
import{i as e,n as t,r as n,t as r}from"./index-Bdwzcci5.js";var i=null;function a(a,o,s){i||(i=document.createElement(`div`),i.id=`specMatrixModal`,i.className=`modal-overlay`,document.body.appendChild(i));let c=o??a.products[0],l=s??a.products[1]??a.products[0],u=Math.round(c.rating*20+(c.isPrime?5:0))>=Math.round(l.rating*20+(l.isPrime?5:0))?c:l;i.innerHTML=`
    <div class="modal-dialog spec-matrix-dialog">
      <button class="modal-close" id="closeMatrixModal">✕</button>
      <h2>📊 KI-Produktdatenblatt & Analyse Matrix</h2>
      <p class="subtitle">Detaillierter technischer Vergleich mit automatischer KI-Empfehlung</p>

      <!-- AI Winner Banner -->
      <div class="ai-winner-banner">
        <div class="winner-trophy">🏆</div>
        <div>
          <strong>KI-Empfehlung: ${u.title}</strong>
          <p class="text-xs">Besseres Preis-Leistungs-Verhältnis (${u.rating}★ Rating, ${u.reviewCount} Rezensionen)</p>
        </div>
      </div>

      <!-- Spec Comparison Table -->
      <div class="spec-matrix-table-wrapper">
        <table class="spec-matrix-table">
          <thead>
            <tr>
              <th>Eigenschaft</th>
              <th class="prod-col-header">
                <img src="${c.images[0]}" alt="${c.title}" />
                <span>${c.title}</span>
              </th>
              <th class="prod-col-header">
                <img src="${l.images[0]}" alt="${l.title}" />
                <span>${l.title}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Preis</strong></td>
              <td class="price-cell">${n(c.price)}</td>
              <td class="price-cell">${n(l.price)}</td>
            </tr>
            <tr>
              <td><strong>Bewertung</strong></td>
              <td>${e(c.rating)} (${c.rating})</td>
              <td>${e(l.rating)} (${l.rating})</td>
            </tr>
            <tr>
              <td><strong>Marke</strong></td>
              <td>${c.brand}</td>
              <td>${l.brand}</td>
            </tr>
            <tr>
              <td><strong>Versand</strong></td>
              <td>${c.isPrime?`⭐ Prime Express`:`Standard`}</td>
              <td>${l.isPrime?`⭐ Prime Express`:`Standard`}</td>
            </tr>
            <tr>
              <td><strong>Verfügbarkeit</strong></td>
              <td>${c.inStock?`✓ Auf Lager`:`❌ Vergriffen`}</td>
              <td>${l.inStock?`✓ Auf Lager`:`❌ Vergriffen`}</td>
            </tr>
            <tr>
              <td><strong>KI-Vorteile</strong></td>
              <td>
                <ul class="pros-list">
                  <li>+ Erstklassige Verarbeitung</li>
                  <li>+ Hohe Kundenzufriedenheit</li>
                </ul>
              </td>
              <td>
                <ul class="pros-list">
                  <li>+ Attraktiver Preis</li>
                  <li>+ Vielseitig einsetzbar</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="matrix-actions">
        <button class="btn-primary" id="buyP1Btn">🛒 ${c.title} kaufen</button>
        <button class="btn-primary" id="buyP2Btn">🛒 ${l.title} kaufen</button>
      </div>
    </div>
  `,i.classList.add(`open`);let d=()=>i?.classList.remove(`open`);document.getElementById(`closeMatrixModal`)?.addEventListener(`click`,d),i.addEventListener(`click`,e=>{e.target===i&&d()}),document.getElementById(`buyP1Btn`)?.addEventListener(`click`,()=>{t(async()=>{let{saveCart:e}=await import(`./index-Bdwzcci5.js`).then(e=>e.o);return{saveCart:e}},__vite__mapDeps([0,1])).then(({saveCart:e})=>{a.cart.push({product:c,qty:1,addedAt:Date.now()}),e(),r(`🛒 "${c.title}" zum Warenkorb hinzugefügt!`,`cart`),d()})}),document.getElementById(`buyP2Btn`)?.addEventListener(`click`,()=>{t(async()=>{let{saveCart:e}=await import(`./index-Bdwzcci5.js`).then(e=>e.o);return{saveCart:e}},__vite__mapDeps([0,1])).then(({saveCart:e})=>{a.cart.push({product:l,qty:1,addedAt:Date.now()}),e(),r(`🛒 "${l.title}" zum Warenkorb hinzugefügt!`,`cart`),d()})})}export{a as openSpecMatrixModal};