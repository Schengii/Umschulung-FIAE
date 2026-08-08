// --- ROYAL SHIPYARD & NAVAL EXPEDITIONS ---

class ShipyardManager {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.ships = [
      { id: 'caravel', name: '⛵ Karavelle', cost: { wood: 400, gold: 300 }, speed: 'Schnell', cargo: 500 },
      { id: 'galleon', name: '⚓ Kriegsgalleone', cost: { wood: 800, iron: 400, gold: 600 }, speed: 'Mittel', atk: 120 },
      { id: 'corsair', name: '🏴‍☠️ Kaperboot', cost: { wood: 600, gold: 500 }, speed: 'Sehr Schnell', lootMult: 1.5 }
    ];
  }

  init() {
    if (!stateManager.state.fleet) {
      stateManager.state.fleet = [];
    }
  }

  showModal() {
    this.init();
    const fleet = stateManager.state.fleet;

    let content = `
      <div style="padding: 10px; max-height: 75vh; overflow-y: auto;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">⚓ Werft & Flottenbau</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 16px;">Baue Schiffe für Handels-Expeditionen und Überfälle auf Pirateninseln!</p>

        <h3 style="color: #ffd700; font-size: 1em; margin-bottom: 8px;">Deine Flotte (${fleet.length} Schiffe):</h3>
        <div style="margin-bottom: 15px;">
          ${fleet.length === 0 ? '<p style="color: #888; font-style: italic;">Noch keine Schiffe erbaut.</p>' : ''}
          ${fleet.map((s, idx) => `
            <div style="background: rgba(30,40,50,0.7); border: 1px solid #d4af37; border-radius: 6px; padding: 8px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: center;">
              <span><strong>${s.name}</strong></span>
              <button onclick="window.shipyardManager.startExpedition(${idx})" style="padding: 4px 8px; background: #2ecc71; color: #fff; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
                ⚓ See-Expedition Starten
              </button>
            </div>
          `).join('')}
        </div>

        <h3 style="color: #e5c158; font-size: 1em; margin-bottom: 8px;">Schiff Bauen:</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
    `;

    this.ships.forEach(s => {
      content += `
        <div style="background: rgba(15,20,30,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 10px;">
          <h4 style="color: #fff; margin-bottom: 4px;">${s.name}</h4>
          <div style="font-size: 0.75em; color: #aaa; margin-bottom: 6px;">Kosten: ${Object.entries(s.cost).map(([k, v]) => `${v} ${k}`).join(', ')}</div>
          <button onclick="window.shipyardManager.buildShip('${s.id}')" style="width: 100%; padding: 6px; background: linear-gradient(135deg, #d4af37, #aa820a); color: #111; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
            🛠️ Bauen
          </button>
        </div>
      `;
    });

    content += `</div></div>`;
    this.gameUI.showModal('Werft & Seefahrt', content);
  }

  buildShip(shipId) {
    this.init();
    const ship = this.ships.find(s => s.id === shipId);
    if (!ship) return;

    if (stateManager.state.wood < (ship.cost.wood || 0) ||
        stateManager.state.iron < (ship.cost.iron || 0) ||
        stateManager.state.gold < (ship.cost.gold || 0)) {
      this.gameUI.showFloatingNotification('Nicht genug Rohstoffe für diesen Schiffsbau!');
      return;
    }

    stateManager.state.wood -= (ship.cost.wood || 0);
    stateManager.state.iron -= (ship.cost.iron || 0);
    stateManager.state.gold -= (ship.cost.gold || 0);

    stateManager.state.fleet.push({ id: ship.id, name: ship.name, builtAt: Date.now() });
    stateManager.save();
    this.gameUI.showFloatingNotification(`⚓ "${ship.name}" wurde vom Stapel gelassen!`);
    if (window.gameSound) window.gameSound.playSFX('upgrade');
    this.showModal();
  }

  startExpedition(index) {
    this.init();
    const ship = stateManager.state.fleet[index];
    if (!ship) return;

    const lootGold = 300 + Math.floor(Math.random() * 500);
    const lootGems = Math.random() < 0.4 ? 3 : 0;

    stateManager.state.gold += lootGold;
    if (lootGems > 0) stateManager.state.gems = (stateManager.state.gems || 0) + lootGems;
    stateManager.save();

    this.gameUI.showFloatingNotification(`⛵ Expedition erfolgreich! Beute: +${lootGold} Gold ${lootGems > 0 ? `+${lootGems} Edelsteine` : ''}`);
    if (window.gameSound) window.gameSound.playSFX('coin');
  }
}

window.ShipyardManager = ShipyardManager;
