import{r as e,t}from"./index-Bdwzcci5.js";var n=null,r={BTC:{name:`Bitcoin`,symbol:`BTC`,icon:`₿`,rateToEur:18e-6,address:`bc1q9x3k8z4p7m2n5v6w8y1t3r5e7w9q0z2a4b6c8d`},ETH:{name:`Ethereum`,symbol:`ETH`,icon:`Ξ`,rateToEur:34e-5,address:`0x71C7656EC7ab88b098defB751B7401B5f6d8976F`},SOL:{name:`Solana`,symbol:`SOL`,icon:`◎`,rateToEur:.0068,address:`Sol9x3k8z4p7m2n5v6w8y1t3r5e7w9q0z2a4b6c8d`},USDC:{name:`USD Coin`,symbol:`USDC`,icon:`🪙`,rateToEur:1.08,address:`0x38bdf86EC7ab88b098defB751B7401B5f6d8976F`}};function i(i,a){n||(n=document.createElement(`div`),n.id=`cryptoPaymentModal`,n.className=`modal-overlay`,document.body.appendChild(n));let o=`BTC`,s=()=>{let l=r[o],u=(i*l.rateToEur).toFixed(6);n.innerHTML=`
      <div class="modal-dialog crypto-dialog">
        <button class="modal-close" id="closeCryptoModal">✕</button>
        <div class="crypto-header">
          <h2>⚡ Web3 & Krypto Checkout</h2>
          <span class="web3-badge">🔒 Dezentral & Verschlüsselt</span>
        </div>

        <p class="subtitle">Wähle eine Kryptowährung zur Bezahlung von <strong>${e(i)}</strong>:</p>

        <div class="crypto-coin-selector">
          ${Object.values(r).map(e=>`
            <button class="coin-tab ${e.symbol===o?`active`:``}" data-symbol="${e.symbol}">
              <span class="coin-icon">${e.icon}</span>
              <span>${e.name}</span>
            </button>
          `).join(``)}
        </div>

        <div class="crypto-payment-card">
          <div class="crypto-amount-display">
            <span class="crypto-val">${u} ${l.symbol}</span>
            <small>≈ ${e(i)} EUR (Geschätzte Netzwerkgebühr: ~$0.45)</small>
          </div>

          <div class="qr-code-box">
            <div class="qr-placeholder">
              <span class="qr-icon">📱</span>
              <span>QR-Code Scannen</span>
            </div>
          </div>

          <div class="wallet-address-group">
            <label>Einzahlungsadresse (${l.name}):</label>
            <div class="address-input-wrapper">
              <input type="text" id="walletAddressInput" value="${l.address}" readonly />
              <button class="btn-secondary sm" id="copyWalletBtn">📋 Kopieren</button>
            </div>
          </div>
        </div>

        <div class="crypto-actions">
          <button class="btn-primary full-width" id="confirmCryptoPayBtn">
            🦊 MetaMask / Web3 Wallet verbinden & Zahlen
          </button>
        </div>
      </div>
    `,document.getElementById(`closeCryptoModal`)?.addEventListener(`click`,c),n.querySelectorAll(`.coin-tab`).forEach(e=>{e.addEventListener(`click`,()=>{o=e.getAttribute(`data-symbol`),s()})}),document.getElementById(`copyWalletBtn`)?.addEventListener(`click`,()=>{let e=document.getElementById(`walletAddressInput`);e&&(navigator.clipboard?.writeText(e.value),t(`📋 Krypto-Adresse kopiert!`,`success`))}),document.getElementById(`confirmCryptoPayBtn`)?.addEventListener(`click`,()=>{t(`⚡ Web3 Transaktion gesendet: ${u} ${l.symbol} (Block #1982031)`,`info`),setTimeout(()=>{c(),t(`✓ Blockchain-Bestätigung erhalten! Zahlung erfolgreich!`,`success`),a()},1200)})},c=()=>n?.classList.remove(`open`);s(),n.classList.add(`open`)}export{i as openCryptoPaymentModal};