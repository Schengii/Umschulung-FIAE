// --- HEAVY SIEGE ARTILLERY & TREBUCHET TARGETING ---

class SiegeArtilleryManager {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.weapons = [
      { id: 'trebuchet', name: '☄️ Schwerer Tribok', desc: 'Schleudert brennende Felsbrocken auf Burgmauern', cost: { wood: 600, stone: 400, gold: 300 }, power: 150 },
      { id: 'battering_ram', name: '🪵 Gepanzerter Rammbock', desc: 'Durchbricht verriegelte Burgtore im Sturm', cost: { wood: 500, iron: 200, gold: 200 }, power: 100 },
      { id: 'siege_tower', name: '🏰 Belagerungsturm', desc: 'Ermöglicht Soldaten das Überwinden hoher Zinnen', cost: { wood: 800, cloth: 100, gold: 400 }, power: 120 }
    ];
  }

  init() {
    if (!stateManager.state.siegeArsenal) {
      stateManager.state.siegeArsenal = { trebuchets: 0, rams: 0, towers: 0 };
    }
  }

  showModal() {
    this.init();
    const arsenal = stateManager.state.siegeArsenal;

    let content = `
      <div style="padding: 10px;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">☄️ Belagerungs-Artillerie & Triboke</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 16px;">Konstruiere Belagerungsmaschinen zur Zerstörung feindlicher Festungsmauern!</p>

        <div style="background: rgba(20,25,35,0.85); border: 1px solid #d4af37; border-radius: 6px; padding: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #fff;">Dein Arsenal:</strong>
            <div style="font-size: 0.85em; color: #aaa;">☄️ Triboke: ${arsenal.trebuchets} | 🪵 Rammböcke: ${arsenal.rams} | 🏰 Türme: ${arsenal.towers}</div>
          </div>
          <button onclick="window.siegeArtilleryManager.testFire()"
                  style="padding: 8px 16px; background: linear-gradient(135deg, #ff5722, #b22222); color: #fff; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
            🔥 Probeschuss Ausführen
          </button>
        </div>

        <h3 style="color: #e5c158; margin-bottom: 8px;">Belagerungswerkstatt (Bauen):</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
    `;

    this.weapons.forEach(w => {
      content += `
        <div style="background: rgba(15,20,30,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 10px;">
          <h4 style="color: #fff; margin-bottom: 4px;">${w.name}</h4>
          <div style="font-size: 0.8em; color: #aaa; margin-bottom: 8px;">${w.desc}</div>
          <div style="font-size: 0.75em; color: #888; margin-bottom: 8px;">
            Kosten: ${Object.entries(w.cost).map(([k, v]) => `${v} ${k}`).join(', ')}
          </div>
          <button onclick="window.siegeArtilleryManager.constructWeapon('${w.id}')"
                  style="width: 100%; padding: 6px; background: linear-gradient(135deg, #d4af37, #aa820a); color: #111; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
            🔨 Maschine Bauen
          </button>
        </div>
      `;
    });

    content += `</div></div>`;
    this.gameUI.showModal('Belagerungs-Artillerie', content);
  }

  constructWeapon(weaponId) {
    this.init();
    const w = this.weapons.find(x => x.id === weaponId);
    if (!w) return;

    if (stateManager.state.gold < (w.cost.gold || 0) ||
        stateManager.state.wood < (w.cost.wood || 0) ||
        stateManager.state.stone < (w.cost.stone || 0) ||
        stateManager.state.iron < (w.cost.iron || 0)) {
      this.gameUI.showFloatingNotification('Nicht genug Rohstoffe für diese Belagerungswaffe!');
      return;
    }

    stateManager.state.gold -= (w.cost.gold || 0);
    stateManager.state.wood -= (w.cost.wood || 0);
    stateManager.state.stone -= (w.cost.stone || 0);
    stateManager.state.iron -= (w.cost.iron || 0);

    if (weaponId === 'trebuchet') stateManager.state.siegeArsenal.trebuchets++;
    if (weaponId === 'battering_ram') stateManager.state.siegeArsenal.rams++;
    if (weaponId === 'siege_tower') stateManager.state.siegeArsenal.towers++;

    this.gameUI.showFloatingNotification(`☄️ ${w.name} erfolgreich konstruiert!`);
    window.soundManager && window.soundManager.playUpgradeSound();
    this.showModal();
  }

  testFire() {
    this.init();
    const arsenal = stateManager.state.siegeArsenal;
    if (arsenal.trebuchets === 0) {
      this.gameUI.showFloatingNotification('Baue zuerst mindestens 1 Tribok für Probeschüsse!');
      return;
    }

    this.gameUI.showFloatingNotification('☄️ BOOM! Tribok-Felsbrocken schlägt auf dem Übungsfeld ein! (150 Schaden)');
    window.soundManager && window.soundManager.playSFX('stone');
  }
}

window.SiegeArtilleryManager = SiegeArtilleryManager;
