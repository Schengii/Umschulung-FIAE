// --- MARITIME TRADE FLEET & PIRATE EXPEDITIONS ---

class TradeFleetManager {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.shipTypes = [
      { id: 'cog', name: '⛵ Handelskogge', cost: { wood: 400, gold: 200 }, capacity: 500, desc: 'Transportiert große Rohstoffmengen' },
      { id: 'galleon', name: '🚢 Kriegsgalleone', cost: { wood: 800, iron: 300, gold: 500 }, capacity: 200, desc: 'Schützt Handelsreisen vor Piratenangriffen' }
    ];
  }

  init() {
    if (!stateManager.state.fleet) {
      stateManager.state.fleet = { cogs: 1, galleons: 0, activeExpedition: false };
    }
  }

  showModal() {
    this.init();
    const fleet = stateManager.state.fleet;

    let content = `
      <div style="padding: 10px;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">🚢 Handelsflotte & Piraten-Expeditionen</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 16px;">Baue Handelsschiffe und Kriegsgalleonen für einträgliche Übersee-Reisen.</p>

        <div style="background: rgba(20,25,35,0.85); border: 1px solid #d4af37; border-radius: 6px; padding: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #fff;">Deine Aktiv-Flotte:</strong>
            <div style="font-size: 0.85em; color: #aaa;">⛵ Handelskoggen: ${fleet.cogs} | 🚢 Kriegsgalleonen: ${fleet.galleons}</div>
          </div>
          <button onclick="window.tradeFleetManager.launchExpedition()"
                  style="padding: 8px 16px; background: linear-gradient(135deg, #d4af37, #aa820a); color: #111; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
            ⚓ Expedition Starten
          </button>
        </div>

        <h3 style="color: #e5c158; margin-bottom: 8px;">Werft (Schiffe Bauen):</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
    `;

    this.shipTypes.forEach(ship => {
      content += `
        <div style="background: rgba(15,20,30,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 10px;">
          <h4 style="color: #fff; margin-bottom: 4px;">${ship.name}</h4>
          <div style="font-size: 0.8em; color: #aaa; margin-bottom: 8px;">${ship.desc}</div>
          <div style="font-size: 0.75em; color: #888; margin-bottom: 8px;">
            Kosten: ${Object.entries(ship.cost).map(([k, v]) => `${v} ${k}`).join(', ')}
          </div>
          <button onclick="window.tradeFleetManager.buildShip('${ship.id}')"
                  style="width: 100%; padding: 6px; background: linear-gradient(135deg, #4CAF50, #2E7D32); color: #fff; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
            🔨 Schiff Bauen
          </button>
        </div>
      `;
    });

    content += `</div></div>`;
    this.gameUI.showModal('Handelsflotte', content);
  }

  buildShip(shipId) {
    this.init();
    const ship = this.shipTypes.find(s => s.id === shipId);
    if (!ship) return;

    if (stateManager.state.gold < (ship.cost.gold || 0) ||
        stateManager.state.wood < (ship.cost.wood || 0) ||
        stateManager.state.iron < (ship.cost.iron || 0)) {
      this.gameUI.showFloatingNotification('Nicht genug Rohstoffe für diesen Schiffsbau!');
      return;
    }

    stateManager.state.gold -= (ship.cost.gold || 0);
    stateManager.state.wood -= (ship.cost.wood || 0);
    stateManager.state.iron -= (ship.cost.iron || 0);

    if (shipId === 'cog') stateManager.state.fleet.cogs++;
    if (shipId === 'galleon') stateManager.state.fleet.galleons++;

    this.gameUI.showFloatingNotification(`⛵ ${ship.name} in der Werft fertiggestellt!`);
    window.soundManager && window.soundManager.playUpgradeSound();
    this.showModal();
  }

  launchExpedition() {
    this.init();
    const fleet = stateManager.state.fleet;
    if (fleet.cogs === 0) {
      this.gameUI.showFloatingNotification('Du benötigst mindestens 1 Handelskogge für eine Expedition!');
      return;
    }

    // Pirate attack chance reduced by galleons
    const pirateAttackChance = Math.max(0.05, 0.4 - fleet.galleons * 0.15);
    const isAttacked = Math.random() < pirateAttackChance;

    if (isAttacked && fleet.galleons === 0) {
      this.gameUI.showFloatingNotification('🏴‍☠️ Piraten haben deine Handelsflotte überfallen! Beute verloren.');
    } else {
      const rewardGold = fleet.cogs * 350 + fleet.galleons * 150;
      const rewardGems = Math.floor(fleet.cogs * 1.5);
      stateManager.state.gold += rewardGold;
      stateManager.state.gems += rewardGems;
      this.gameUI.showFloatingNotification(`⚓ Übersee-Expedition erfolgreich! Beute: +${rewardGold} Gold und +${rewardGems} Edelsteine.`);
    }
  }
}

window.TradeFleetManager = TradeFleetManager;
