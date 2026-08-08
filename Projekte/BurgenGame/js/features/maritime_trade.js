// --- MARITIME TRADE & PORTS FEATURE ---

// Initialisiert Seehandel-States
GameStateManager.prototype.initMaritimeTrade = function() {
  if (!this.state.maritimeShips) {
    this.state.maritimeShips = [];
  }
  if (!this.state.luxuryGoods) {
    this.state.luxuryGoods = { spices: 0, silk: 0, gemstones: 0 };
  }
};

// Überprüft, ob Hafen gebaut ist
GameStateManager.prototype.hasPort = function() {
  // Wir nehmen an, dass ein Hafengebäude existiert, oder simulieren es, 
  // falls ein Townhall Stufe 2+ oder eine Festung vorhanden ist.
  return this.state.buildings.some(b => 
    (b.type === BUILDING_TYPES.TOWNHALL && b.level >= 2) || 
    b.type === BUILDING_TYPES.FORTRESS
  );
};

// Baut ein Handelsschiff
GameStateManager.prototype.buildTradeShip = function() {
  this.initMaritimeTrade();
  const cost = { gold: 300, wood: 400, iron: 50 };

  if (!this.hasResources(cost)) {
    if (window.gameUI) gameUI.showToast('Zu wenig Ressourcen für den Schiffsbau!', 'error');
    return false;
  }

  this.deductResources(cost);
  this.state.maritimeShips.push({
    id: `ship_${Date.now()}`,
    status: 'idle', // 'idle', 'trading', 'returning'
    destination: null,
    progress: 0,
    cargo: null
  });

  this.save();
  this.notifyListeners('ship_built');
  return true;
};

// Startet eine Seehandelsroute
GameStateManager.prototype.startMaritimeRoute = function(shipId, destinationId) {
  this.initMaritimeTrade();
  const ship = this.state.maritimeShips.find(s => s.id === shipId);
  
  let dest = MARITIME_DESTINATIONS[destinationId];
  if (destinationId && destinationId.startsWith('allied_')) {
    const nationId = destinationId.replace('allied_', '');
    const nation = AI_NATIONS_CONFIG.find(n => n.id === nationId);
    if (nation) {
      dest = {
        name: `Allianzroute: ${nation.name}`,
        travelTime: 90,
        rewardGoods: { gold: 500, gemstones: 1 }
      };
    }
  }

  if (!ship || ship.status !== 'idle' || !dest) return false;

  ship.status = 'trading';
  ship.destination = destinationId;
  ship.progress = 0;

  this.save();
  this.notifyListeners('maritime_route_started');
  return true;
};

// Tick Seehandelsrouten (Fortschritt der Schiffe berechnen)
GameStateManager.prototype.tickMaritimeTrade = function(dt) {
  this.initMaritimeTrade();
  let changed = false;

  this.state.maritimeShips.forEach(ship => {
    if (ship.status === 'idle') return;

    let dest = MARITIME_DESTINATIONS[ship.destination];
    if (ship.destination && ship.destination.startsWith('allied_')) {
      const nationId = ship.destination.replace('allied_', '');
      const nation = AI_NATIONS_CONFIG.find(n => n.id === nationId);
      if (nation) {
        dest = {
          name: `Allianzroute: ${nation.name}`,
          travelTime: 90,
          rewardGoods: { gold: 500, gemstones: 1 }
        };
      }
    }
    if (!dest) return;

    // Fortschritt (Schiff fährt)
    ship.progress += (1.0 / dest.travelTime) * dt;

    if (ship.progress >= 1.0) {
      if (ship.status === 'trading') {
        // Fracht aufnehmen und umkehren
        ship.status = 'returning';
        ship.progress = 0;
        ship.cargo = dest.rewardGoods;
        changed = true;
      } else if (ship.status === 'returning') {
        // Schiff ist zurück im Hafen, entladen
        Object.keys(ship.cargo).forEach(good => {
          if (good === 'gold') {
            this.state.resources.gold = (this.state.resources.gold || 0) + ship.cargo[good];
          } else {
            this.state.luxuryGoods[good] = (this.state.luxuryGoods[good] || 0) + ship.cargo[good];
          }
        });
        
        // Benachrichtigen
        const cargoText = Object.entries(ship.cargo).map(([k, v]) => `${v} ${k.toUpperCase()}`).join(', ');
        gameUI.showFloatingNotification(`🚢 Handelsschiff erfolgreich im Hafen eingelaufen! Fracht entladen: ${cargoText}`);

        if (this.state.statistics) {
          this.state.statistics.expeditionsCount = (this.state.statistics.expeditionsCount || 0) + 1;
        }

        ship.status = 'idle';
        ship.destination = null;
        ship.progress = 0;
        ship.cargo = null;
        changed = true;
      }
    }
  });

  if (changed) {
    this.save();
  }
};

// Übersee-Handelsziele
const MARITIME_DESTINATIONS = {
  spice_islands: {
    name: 'Gewürz-Archipel',
    desc: 'Bringe exotische Gewürze, die den Wert deiner Nahrung verdoppeln.',
    travelTime: 60, // 60 Sekunden Reisezeit
    rewardGoods: { spices: 5 }
  },
  silk_road_port: {
    name: 'Seidenhafen',
    desc: 'Kaufe feinste Seide für luxuriöse Gewänder der Oberschicht.',
    travelTime: 120,
    rewardGoods: { silk: 3 }
  },
  gem_coast: {
    name: 'Juwelenküste',
    desc: 'Sammle seltene Schmucksteine für Kronjuwelen und Prestige.',
    travelTime: 180,
    rewardGoods: { gemstones: 2 }
  }
};

// UI: Seehandels-Modal öffnen
GameUI.prototype.openMaritimeTradeModal = function() {
  stateManager.initMaritimeTrade();
  const state = stateManager.state;

  if (!stateManager.hasPort()) {
    const html = `
      <h2>🚢 Seehandel & Hafen</h2>
      <p class="modal-intro">Du hast noch keinen Zugang zum Meer. Errichte ein <strong>Rathaus Stufe 2</strong> oder eine <strong>Festung</strong>, um Hafenaktivitäten freizuschalten.</p>
      <button id="btn-maritime-close" class="primary-btn gold-btn" style="width: 100%;">Schließen</button>
    `;
    this.openModal(html);
    document.getElementById('btn-maritime-close').addEventListener('click', () => this.closeModal());
    return;
  }

  const ships = state.maritimeShips;
  let shipsHtml = '';

  ships.forEach((ship, idx) => {
    let statusText = 'Bereit im Hafen';
    let progressBar = '';
    
    if (ship.status === 'trading') {
      let destName = MARITIME_DESTINATIONS[ship.destination]?.name || '';
      if (ship.destination && ship.destination.startsWith('allied_')) {
        const nationId = ship.destination.replace('allied_', '');
        const nation = AI_NATIONS_CONFIG.find(n => n.id === nationId);
        destName = `Allianzroute: ${nation?.name || 'Alliierter'}`;
      }
      statusText = `Fahrt zum <strong>${destName}</strong>`;
      progressBar = `<div style="height: 6px; background: rgba(255,255,255,0.15); border-radius: 3px; overflow: hidden; margin-top: 6px;"><div style="width: ${Math.round(ship.progress * 100)}%; height:100%; background: #3498db;"></div></div>`;
    } else if (ship.status === 'returning') {
      statusText = `Rückweg mit Fracht (Beladen)`;
      progressBar = `<div style="height: 6px; background: rgba(255,255,255,0.15); border-radius: 3px; overflow: hidden; margin-top: 6px;"><div style="width: ${Math.round(ship.progress * 100)}%; height:100%; background: #2ecc71;"></div></div>`;
    }

    let actionButton = '';
    if (ship.status === 'idle') {
      let alliedButtons = "";
      const alliedNations = AI_NATIONS_CONFIG.filter(n => {
        const dip = state.diplomacy?.[n.id];
        return dip && dip.status === 'allied';
      });
      alliedNations.forEach(n => {
        alliedButtons += `
          <button class="primary-btn btn-send-ship gold-btn" data-ship="${ship.id}" data-dest="allied_${n.id}" style="font-size: 0.72rem; padding: 4px 6px;">${n.icon} Allianz-Handel</button>
        `;
      });

      actionButton = `
        <div style="margin-top: 10px; display: flex; gap: 6px; flex-wrap: wrap;">
          <button class="primary-btn btn-send-ship" data-ship="${ship.id}" data-dest="spice_islands" style="font-size: 0.72rem; padding: 4px 6px;">Archipel</button>
          <button class="primary-btn btn-send-ship" data-ship="${ship.id}" data-dest="silk_road_port" style="font-size: 0.72rem; padding: 4px 6px;">Seidenhafen</button>
          <button class="primary-btn btn-send-ship" data-ship="${ship.id}" data-dest="gem_coast" style="font-size: 0.72rem; padding: 4px 6px;">Juwelenküste</button>
          ${alliedButtons}
        </div>
      `;
    }

    shipsHtml += `
      <div class="glass-card" style="padding: 12px; margin-bottom: 10px;">
        <div style="display: flex; justify-content: space-between;">
          <strong>🚢 Handelsschiff #${idx + 1}</strong>
          <span style="font-size: 0.8rem; color: #f1c40f;">${statusText}</span>
        </div>
        ${progressBar}
        ${actionButton}
      </div>
    `;
  });

  const lux = state.luxuryGoods;
  const html = `
    <h2>🚢 Überseehandel & Hafen</h2>
    <p class="modal-intro">Entsende Schiffe in ferne Gewässer, um Luxusgüter für dein Volk zu erwerben.</p>

    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px;">
      <div class="glass-card" style="padding: 10px; text-align: center;">
        <div style="font-size: 1.5rem;">🌶️</div>
        <strong>${lux.spices || 0}</strong> Gewürze
      </div>
      <div class="glass-card" style="padding: 10px; text-align: center;">
        <div style="font-size: 1.5rem;">🧣</div>
        <strong>${lux.silk || 0}</strong> Seide
      </div>
      <div class="glass-card" style="padding: 10px; text-align: center;">
        <div style="font-size: 1.5rem;">💎</div>
        <strong>${lux.gemstones || 0}</strong> Edelsteine
      </div>
    </div>

    <div class="glass-card" style="padding: 15px; margin-bottom: 15px; border-color: var(--color-gold-primary);">
      <h3 style="color: var(--color-gold-hover);">🔨 Werft</h3>
      <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 8px;">Kosten für neues Handelsschiff: 🪵 400 | 🪙 300 | ⛓️ 50</p>
      <button id="btn-build-ship" class="primary-btn gold-btn" style="width: 100%;">Handelsschiff bauen</button>
    </div>

    <h3>Handelsflotte</h3>
    <div style="max-height: 180px; overflow-y: auto;">
      ${shipsHtml || '<p style="color: var(--color-text-muted); text-align: center;">Keine Schiffe vorhanden. Baue ein Schiff in der Werft!</p>'}
    </div>

    <button id="btn-maritime-close" class="primary-btn" style="width: 100%; margin-top: 15px;">Schließen</button>
  `;

  this.openModal(html);
  document.getElementById('btn-maritime-close').addEventListener('click', () => this.closeModal());

  const buildBtn = document.getElementById('btn-build-ship');
  if (buildBtn) {
    buildBtn.addEventListener('click', () => {
      if (stateManager.buildTradeShip()) {
        this.openMaritimeTradeModal();
        this.showFloatingNotification('🚢 Schiffsbau in der Werft abgeschlossen!');
      }
    });
  }

  document.querySelectorAll('.btn-send-ship').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const shipId = e.target.getAttribute('data-ship');
      const destId = e.target.getAttribute('data-dest');
      if (stateManager.startMaritimeRoute(shipId, destId)) {
        this.openMaritimeTradeModal();
        this.showFloatingNotification('🚢 Route gestartet! Schiff sticht in See.');
      }
    });
  });
};
