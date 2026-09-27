import{r as e,t}from"./index-Bdwzcci5.js";var n=null,r=!1,i=[{sender:`bot`,text:`Hallo! 👋 Ich bin dein KI-Kundenservice Assistent von Amazon 2.0. Wie kann ich dir heute helfen?`,timestamp:a()}];function a(){let e=new Date;return e.getHours().toString().padStart(2,`0`)+`:`+e.getMinutes().toString().padStart(2,`0`)}function o(e){n||(n=document.createElement(`div`),n.id=`supportChatWidget`,n.className=`support-chat-widget`,document.body.appendChild(n),s(e))}function s(e){if(!n)return;n.innerHTML=`
    <!-- Floating Trigger Button -->
    <button id="chatToggleBtn" class="chat-toggle-btn" aria-label="Kundenservice Live Chat">
      <span class="chat-icon">💬</span>
      <span class="chat-label">Hilfe & Live-Chat</span>
      <span class="chat-badge-pulse"></span>
    </button>

    <!-- Chat Window Drawer -->
    <div class="chat-window ${r?`open`:``}" id="chatWindow">
      <div class="chat-header">
        <div class="chat-bot-avatar">🤖</div>
        <div class="chat-header-info">
          <h3>Amazon 2.0 Support-Bot</h3>
          <span class="online-indicator">● 24/7 Online</span>
        </div>
        <button id="chatCloseBtn" class="chat-close-btn" aria-label="Schließen">✕</button>
      </div>

      <div class="chat-body" id="chatBody">
        ${i.map(e=>`
          <div class="chat-bubble ${e.sender}">
            <div class="bubble-content">${e.text}</div>
            <span class="bubble-time">${e.timestamp}</span>
          </div>
        `).join(``)}
      </div>

      <!-- Quick Action Chips -->
      <div class="chat-chips">
        <button class="chat-chip" data-query="Wo ist mein Paket?">📦 Paket-Status</button>
        <button class="chat-chip" data-query="Wie funktioniert die Rückgabe?">↩ Retoure</button>
        <button class="chat-chip" data-query="Gibt es aktuelle Gutscheine?">🎟️ Gutscheine</button>
        <button class="chat-chip" data-query="Wie hoch ist mein Guthaben?">💰 Guthaben</button>
      </div>

      <div class="chat-footer">
        <input type="text" id="chatInput" placeholder="Schreibe eine Nachricht..." autocomplete="off" />
        <button id="chatSendBtn" class="chat-send-btn" aria-label="Senden">➔</button>
      </div>
    </div>
  `,document.getElementById(`chatToggleBtn`)?.addEventListener(`click`,c),document.getElementById(`chatCloseBtn`)?.addEventListener(`click`,c);let t=document.getElementById(`chatInput`);document.getElementById(`chatSendBtn`)?.addEventListener(`click`,()=>l(e)),t?.addEventListener(`keydown`,t=>{t.key===`Enter`&&l(e)}),n.querySelectorAll(`.chat-chip`).forEach(t=>{t.addEventListener(`click`,()=>{let n=t.getAttribute(`data-query`);u(n),m(n,e)})})}function c(){r=!r,document.getElementById(`chatWindow`)?.classList.toggle(`open`,r),r&&p()}function l(e){let t=document.getElementById(`chatInput`);if(!t)return;let n=t.value.trim();n&&(t.value=``,u(n),m(n,e))}function u(e){i.push({sender:`user`,text:e,timestamp:a()}),f()}function d(e){i.push({sender:`bot`,text:e,timestamp:a()}),f()}function f(){let e=document.getElementById(`chatBody`);e&&(e.innerHTML=i.map(e=>`
    <div class="chat-bubble ${e.sender}">
      <div class="bubble-content">${e.text}</div>
      <span class="bubble-time">${e.timestamp}</span>
    </div>
  `).join(``),p())}function p(){let e=document.getElementById(`chatBody`);e&&(e.scrollTop=e.scrollHeight)}function m(n,r){let i=n.toLowerCase(),a=document.getElementById(`chatBody`);if(a){let e=document.createElement(`div`);e.className=`chat-bubble bot typing-indicator`,e.id=`typingBubble`,e.innerHTML=`<div class="bubble-content"><span>.</span><span>.</span><span>.</span></div>`,a.appendChild(e),p()}setTimeout(()=>{if(document.getElementById(`typingBubble`)?.remove(),i.includes(`paket`)||i.includes(`wo ist`)||i.includes(`lieferung`)||i.includes(`bestellung`)){if(r.orders.length>0){let e=r.orders[0];d(`Deine letzte Bestellung <strong>${e.id}</strong> ist aktuell im Status: <strong>${e.status}</strong>. Voraussichtliche Lieferung: ${e.estimatedDelivery??`Heute`}.`)}else d(`Du hast noch keine aktiven Bestellungen. Sobald du etwas kaufst, kannst du das Paket in der Bestellübersicht live verfolgen!`)}else i.includes(`retoure`)||i.includes(`rückgabe`)||i.includes(`zurück`)?d(`Bei Amazon 2.0 hast du 30 Tage kostenfreies Rückgaberecht. Gehe einfach auf "Bestellungen", wähle den Artikel aus und klicke auf "↩ Rückgabe", um dein Versandetikett zu drucken!`):i.includes(`gutschein`)||i.includes(`rabatt`)||i.includes(`code`)?d(`Aktuell verfügbare Gutscheincodes findest du oben im Menü unter 🎟️ "Gutscheine". Nutze z.B. <strong>AMZ2026</strong> für 10% Rabatt!`):i.includes(`guthaben`)||i.includes(`geld`)||i.includes(`saldo`)?d(`Dein aktuelles Geschenk-Guthaben beträgt <strong>${e(r.userBalance.amount)}</strong>. Du kannst es direkt im Checkout einlösen!`):i.includes(`hallo`)||i.includes(`hi`)||i.includes(`hey`)?d(`Hallo! Wie kann ich dir heute weiterhelfen? Frage mich nach Bestellungen, Retouren oder Gutscheinen!`):i.includes(`mitarbeiter`)||i.includes(`mensch`)||i.includes(`telefon`)?(d(`Unser Telefon-Support ist erreichbar unter 📞 0800-AMAZON-20. Oder möchtest du eine Rückrufbitte hinterlassen?`),t(`📞 Support-Rückruf wurde simuliert angefordert.`,`info`)):d(`Vielen Dank für deine Anfrage! Ich helfe dir gerne bei Fragen zu Produkten, Bestellungen, Versand oder Gutscheinen weiter.`)},900)}export{o as initSupportChat};