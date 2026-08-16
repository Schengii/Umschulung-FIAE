// --- STOCK MARKET & COMMODITY EXCHANGE (Option 3 Upgrade) ---

class StockMarketEngine {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.stocks = [
      { id: 'wood_inc', name: 'Nordholz AG', price: 12.5, history: [10, 11, 12, 12.5], owned: 0 },
      { id: 'stone_corp', name: 'Eisenbergbau Gmbh', price: 25.0, history: [22, 24, 23, 25], owned: 0 },
      { id: 'grain_ltd', name: 'Königliches Kornhaus', price: 8.0, history: [9, 8.5, 7.8, 8], owned: 0 },
      { id: 'gold_vault', name: 'Südgold Bankverein', price: 50.0, history: [45, 48, 49, 50], owned: 0 }
    ];
  }

  init() {
    if (this.stateManager.state.stockPortfolio) {
      const saved = this.stateManager.state.stockPortfolio;
      this.stocks.forEach(s => {
        if (saved[s.id] !== undefined) s.owned = saved[s.id];
      });
    }

    // Price fluctuation tick every 30 seconds
    setInterval(() => this.updatePrices(), 30000);
  }

  updatePrices() {
    this.stocks.forEach(s => {
      const change = (Math.random() - 0.48) * 2.5; // Slight upward bias
      s.price = Math.max(2.0, parseFloat((s.price + change).toFixed(2)));
      s.history.push(s.price);
      if (s.history.length > 10) s.history.shift();
    });

    // Pay passive dividends for owned shares
    let totalDividends = 0;
    this.stocks.forEach(s => {
      if (s.owned > 0) {
        totalDividends += Math.floor(s.owned * (s.price * 0.05));
      }
    });

    if (totalDividends > 0) {
      this.stateManager.state.resources.gold += totalDividends;
      this.gameUI.showToast(`📈 Aktien-Dividende ausgezahlt: +${totalDividends} Gold!`, "success");
    }

    this.savePortfolio();
  }

  buyShare(stockId) {
    const s = this.stocks.find(item => item.id === stockId);
    if (!s) return;

    if (this.stateManager.state.resources.gold < s.price) {
      this.gameUI.showToast(`Nicht genug Gold zum Kauf von 1x ${s.name} (${s.price} Gold)!`, "error");
      return;
    }

    this.stateManager.state.resources.gold -= s.price;
    s.owned += 1;
    this.gameUI.showToast(`📈 1x Aktie ${s.name} für ${s.price} Gold gekauft.`, "success");
    this.savePortfolio();
    this.showStockModal();
  }

  sellShare(stockId) {
    const s = this.stocks.find(item => item.id === stockId);
    if (!s || s.owned <= 0) return;

    this.stateManager.state.resources.gold += s.price;
    s.owned -= 1;
    this.gameUI.showToast(`📉 1x Aktie ${s.name} für ${s.price} Gold verkauft.`, "info");
    this.savePortfolio();
    this.showStockModal();
  }

  savePortfolio() {
    const portfolio = {};
    this.stocks.forEach(s => portfolio[s.id] = s.owned);
    this.stateManager.state.stockPortfolio = portfolio;
    this.stateManager.save();
  }

  showStockModal() {
    this.init();

    const stockRows = this.stocks.map(s => {
      const prevPrice = s.history[s.history.length - 2] || s.price;
      const diff = parseFloat((s.price - prevPrice).toFixed(2));
      const diffText = diff >= 0 ? `<span style="color: #5f5;">+${diff}▲</span>` : `<span style="color: #f55;">${diff}▼</span>`;

      return `
        <div style="background: rgba(255,255,255,0.05); padding: 10px; margin-bottom: 8px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #d4af37;">${s.name}</strong>
            <div style="font-size: 0.8em; color: #aaa;">Im Besitz: <strong style="color: #eee;">${s.owned} Anteile</strong></div>
          </div>

          <div style="text-align: right; margin-right: 15px;">
            <div style="font-size: 1.1em; font-weight: bold; color: white;">${s.price} Gold</div>
            <div style="font-size: 0.75em;">${diffText}</div>
          </div>

          <div style="display: flex; gap: 5px;">
            <button onclick="window.stockMarket.buyShare('${s.id}')" style="background: #2a8; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-weight: bold;">Kaufen</button>
            <button onclick="window.stockMarket.sellShare('${s.id}')" style="background: #a44; color: white; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer;" ${s.owned <= 0 ? 'disabled style="opacity:0.4;"' : ''}>Verkaufen</button>
          </div>
        </div>
      `;
    }).join('');

    const content = `
      <div style="padding: 10px; max-width: 600px; margin: 0 auto;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 4px; text-align: center;">📈 Rohstoff-Börse & Aktienmarkt</h2>
        <p style="font-size: 0.85em; color: #aaa; margin-bottom: 15px; text-align: center;">Investiere in Rohstoff-Aktien der Handelsgesellschaften für regelmäßige Dividenden.</p>

        <div style="max-height: 300px; overflow-y: auto;">
          ${stockRows}
        </div>
      </div>
    `;

    this.gameUI.showModal('Rohstoff-Börse 2.0', content);
  }
}

window.StockMarketEngine = StockMarketEngine;
