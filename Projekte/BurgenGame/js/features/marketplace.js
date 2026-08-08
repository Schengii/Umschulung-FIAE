// --- MARKETPLACE FEATURE ---

// Extend GameStateManager with trading rates based on season
GameStateManager.prototype.getTradeRates = function(resource) {
  // Base rates: buy 80 gold, sell 40 gold (for 100 units)
  let sell = 40;
  let buy = 80;

  if (this.state && this.state.seasonIndex !== undefined) {
    const season = SEASONS_CONFIG[this.state.seasonIndex];
    if (season) {
      if (season.id === 'winter') {
        // Food is extremely scarce and valuable in winter!
        if (resource === 'food') {
          sell = 65; // High selling value
          buy = 110; // High buying cost
        }
        // Wood is heavily needed for heating!
        if (resource === 'wood') {
          sell = 50;
          buy = 95;
        }
      } else if (season.id === 'summer') {
        // Food is plentiful in summer!
        if (resource === 'food') {
          sell = 25; // Cheap selling value
          buy = 55;  // Cheap buying cost
        }
        // Iron is cheap
        if (resource === 'iron') {
          sell = 30;
          buy = 65;
        }
      } else if (season.id === 'autumn') {
        if (resource === 'stone') {
          sell = 30;
          buy = 60;
        }
      } else if (season.id === 'spring') {
        if (resource === 'wood') {
          sell = 35;
          buy = 75;
        }
      }
    }
  }
  return { sell, buy };
};

// Extend GameStateManager with trading logic
GameStateManager.prototype.tradeResources = function(actionType, resource, amount) {
  const rates = this.getTradeRates(resource);
  const rateSell = rates.sell;
  const rateBuy = rates.buy;

  if (actionType === 'sell') {
    const reserve = (this.state.resourceReserves && this.state.resourceReserves[resource]) || 0;
    if ((this.state.resources[resource] || 0) - amount < reserve) {
      if (window.gameUI) gameUI.showToast(`Verkauf blockiert! Mindestbestand von ${reserve} ${resource.toUpperCase()} darf nicht unterschritten werden!`, 'warning');
      return false;
    }
    this.state.resources[resource] -= amount;
    this.state.resources.gold += rateSell;
  } else if (actionType === 'buy') {
    if (this.state.resources.gold < rateBuy) {
      if (window.gameUI) gameUI.showToast('Nicht genügend Gold zum Kaufen!', 'error');
      return false;
    }
    this.state.resources.gold -= rateBuy;
    this.state.resources[resource] = (this.state.resources[resource] || 0) + amount;
  }

  this.save();
  this.notifyListeners('trade_completed');
  return true;
};

// Extend GameUI with trade menu modal
GameUI.prototype.openTradeModal = function() {
  const state = stateManager.state;
  const resourcesList = ['wood', 'stone', 'food', 'iron'];
  const resourceNames = { wood: 'Holz', stone: 'Stein', food: 'Nahrung', iron: 'Eisen' };
  const resourceIcons = { wood: '🪵', stone: '🪨', food: '🌾', iron: '⛓️' };

  let currentSeasonName = 'Frühling';
  if (state.seasonIndex !== undefined) {
    const s = SEASONS_CONFIG[state.seasonIndex];
    if (s) {
      if (s.id === 'spring') currentSeasonName = '🌸 Frühling';
      else if (s.id === 'summer') currentSeasonName = '☀️ Sommer';
      else if (s.id === 'autumn') currentSeasonName = '🍂 Herbst';
      else if (s.id === 'winter') currentSeasonName = '❄️ Winter';
    }
  }

  let html = `
    <h2>⚖️ Marktplatz - Ressourcen handeln</h2>
    <p class="modal-intro">Tausche Rohstoffe gegen Gold (Verkaufen) oder erhalte Rohstoffe für Gold (Kaufen).</p>
    <div style="display: flex; gap: 15px; margin-bottom: 15px;">
      <div class="glass-card" style="flex: 1; padding: 12px; text-align: center;">
        <span style="font-size: 0.8rem; color: var(--color-text-muted);">Schatzkammer</span>
        <div style="font-size: 1.1rem; font-weight: bold; color: var(--color-gold-hover); margin-top: 4px;">🪙 ${Math.floor(state.resources.gold)} Gold</div>
      </div>
      <div class="glass-card" style="flex: 1; padding: 12px; text-align: center;">
        <span style="font-size: 0.8rem; color: var(--color-text-muted);">Aktuelle Jahreszeit</span>
        <div style="font-size: 1.1rem; font-weight: bold; color: #fff; margin-top: 4px;">${currentSeasonName}</div>
      </div>
    </div>
    <div class="trade-grid" style="display: flex; flex-direction: column; gap: 12px;">
  `;

  resourcesList.forEach(res => {
    const currentAmount = Math.floor(state.resources[res] || 0);
    const icon = resourceIcons[res];
    const name = resourceNames[res];
    const rates = stateManager.getTradeRates(res);

    html += `
      <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 20px;">
        <div style="text-align: left;">
          <span style="font-size: 1.2rem; margin-right: 5px;">${icon}</span>
          <strong>${name}</strong>
          <div style="font-size: 0.8rem; color: var(--color-text-muted);">Lagerbestand: ${currentAmount}</div>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="primary-btn trade-action-btn" data-action="buy" data-res="${res}" ${state.resources.gold < rates.buy ? 'disabled' : ''}>
            Kaufen (+100 für 🪙 ${rates.buy})
          </button>
          <button class="primary-btn danger-btn trade-action-btn" data-action="sell" data-res="${res}" ${currentAmount < 100 ? 'disabled' : ''}>
            Verkaufen (-100 für 🪙 ${rates.sell})
          </button>
        </div>
      </div>
    `;
  });

  const reserves = state.resourceReserves || { wood: 0, stone: 0, food: 0, gold: 0, iron: 0 };

  html += `
    <!-- Resource reserves section -->
    <div class="glass-card" style="padding: 15px; margin-top: 15px;">
      <h3 style="color: var(--color-gold-hover);">🛡️ Mindestlagerbestände (Reserve)</h3>
      <p style="font-size: 0.8rem; margin: 5px 0; color: var(--color-text-muted);">
        Lege fest, wie viele Einheiten jeder Ressource geschützt vor automatischen Verbräuchen/Verkäufen im Lager verbleiben sollen.
      </p>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 10px;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
          <span>🪵 Holz Reserve:</span>
          <input type="number" class="reserve-input" data-res="wood" value="${reserves.wood || 0}" style="width: 75px; background: #111; color: #fff; border: 1px solid #444; padding: 3px; text-align: center; border-radius: 4px;">
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
          <span>🪨 Stein Reserve:</span>
          <input type="number" class="reserve-input" data-res="stone" value="${reserves.stone || 0}" style="width: 75px; background: #111; color: #fff; border: 1px solid #444; padding: 3px; text-align: center; border-radius: 4px;">
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
          <span>🌾 Nahrung Reserve:</span>
          <input type="number" class="reserve-input" data-res="food" value="${reserves.food || 0}" style="width: 75px; background: #111; color: #fff; border: 1px solid #444; padding: 3px; text-align: center; border-radius: 4px;">
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem;">
          <span>⛓️ Eisen Reserve:</span>
          <input type="number" class="reserve-input" data-res="iron" value="${reserves.iron || 0}" style="width: 75px; background: #111; color: #fff; border: 1px solid #444; padding: 3px; text-align: center; border-radius: 4px;">
        </div>
      </div>
    </div>

    <!-- Build Cart workshop section -->
    <div class="glass-card" style="padding: 15px; margin-top: 15px; border-color: var(--color-gold-primary);">
      <h3 style="color: var(--color-gold-hover);">⛵ Karrenwerkstatt</h3>
      <p style="font-size: 0.8rem; margin: 5px 0; color: var(--color-text-muted);">Handelskarren werden benötigt, um Handelsrouten zu deinen Außenposten aufzubauen.</p>
      <p style="font-size: 0.8rem; font-weight: bold; margin-bottom: 10px;">
        Freie Karren: <span style="color: var(--color-gold-hover);">${state.tradeCarts || 0}</span> | 
        Kosten: 🪵 150 | ⛓️ 20 | 🪙 100
      </p>
      <button id="btn-build-trade-cart" class="primary-btn gold-btn" style="width: 100%;" 
        ${(state.resources.wood >= 150 && state.resources.iron >= 20 && state.resources.gold >= 100) ? '' : 'disabled'}>
        Handelskarren bauen
      </button>
    </div>
  `;

  this.openModal(html);

  // Bind reserve inputs
  document.querySelectorAll('.reserve-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const res = e.target.getAttribute('data-res');
      const val = Math.max(0, parseInt(e.target.value) || 0);
      if (!stateManager.state.resourceReserves) {
        stateManager.state.resourceReserves = { wood: 0, stone: 0, food: 0, gold: 0, iron: 0 };
      }
      stateManager.state.resourceReserves[res] = val;
      stateManager.save();
      this.showFloatingNotification(`Mindestbestand für ${res.toUpperCase()} auf ${val} gesetzt.`);
    });
  });

  document.querySelectorAll('.trade-action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = e.target.getAttribute('data-action');
      const res = e.target.getAttribute('data-res');
      if (stateManager.tradeResources(action, res, 100)) {
        this.openTradeModal();
        this.showFloatingNotification('Handel erfolgreich abgeschlossen!');
      }
    });
  });

  const buildCartBtn = document.getElementById('btn-build-trade-cart');
  if (buildCartBtn) {
    buildCartBtn.addEventListener('click', () => {
      if (stateManager.buildTradeCart()) {
        this.openTradeModal();
        this.showFloatingNotification('Handelskarren erfolgreich gebaut!');
      }
    });
  }
};

// Implement buildTradeCart
GameStateManager.prototype.buildTradeCart = function() {
  const cost = { wood: 150, iron: 20, gold: 100 };
  if (!this.hasResources(cost)) {
    if (window.gameUI) gameUI.showToast('Zu wenig Ressourcen, um einen Handelskarren zu bauen!', 'error');
    return false;
  }
  this.deductResources(cost);
  this.state.tradeCarts = (this.state.tradeCarts || 0) + 1;
  this.save();
  this.notifyListeners('trade_cart_built');
  return true;
};
