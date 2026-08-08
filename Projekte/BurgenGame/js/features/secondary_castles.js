// --- SECONDARY CASTLES & BIOME COLONIZATION ---

class SecondaryCastles {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.biomes = [
      { id: 'snow', name: '❄️ Schneebedeckte Berge', bonus: '+30% Eisenerz-Produktion, -10% Marschtempo', cost: { gold: 1000, stone: 500, iron: 300 } },
      { id: 'desert', name: '🏜️ Wüstenoase', bonus: '+40% Goldgewinn aus Handel, -15% Nahrung', cost: { gold: 1200, wood: 400, stone: 400 } },
      { id: 'volcano', name: '🌋 Vulkaninsel', bonus: '+50% Schmiede-Schaden & Kristalle', cost: { gold: 2000, gems: 20 } }
    ];
  }

  showModal() {
    if (!stateManager.state.colonies) {
      stateManager.state.colonies = [];
    }

    let content = `
      <div style="padding: 10px;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">🏰 Zweitburgen & Biome-Kolonisierung</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 16px;">Gründe Außenfestungen in entlegenen Regionen der Welt für globale Reichesboni.</p>
        
        <h3 style="color: #e5c158; font-size: 1.1em; margin-bottom: 8px;">Deine Kolonien (${stateManager.state.colonies.length}/3):</h3>
        <div style="margin-bottom: 20px;">
          ${stateManager.state.colonies.length === 0 ? '<p style="color: #888; font-style: italic;">Noch keine Zweitburgen gegründet.</p>' : ''}
          ${stateManager.state.colonies.map(c => `
            <div style="background: rgba(30,40,50,0.7); border: 1px solid #d4af37; border-radius: 6px; padding: 10px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <strong style="color: #fff;">${c.name}</strong>
                <div style="font-size: 0.8em; color: #4CAF50;">Effekt: ${c.bonus}</div>
              </div>
              <span style="font-size: 0.8em; background: #222; padding: 4px 8px; border-radius: 4px; color: #ffd700;">Aktiv</span>
            </div>
          `).join('')}
        </div>

        <h3 style="color: #e5c158; font-size: 1.1em; margin-bottom: 8px;">Verfügbare Biome für Kolonisierung:</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
    `;

    this.biomes.forEach(b => {
      const alreadyFounded = stateManager.state.colonies.some(c => c.id === b.id);
      content += `
        <div style="background: rgba(15,20,30,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 10px;">
          <h4 style="color: #fff; margin-bottom: 4px;">${b.name}</h4>
          <div style="font-size: 0.8em; color: #aaa; margin-bottom: 8px;">${b.bonus}</div>
          <div style="font-size: 0.75em; color: #888; margin-bottom: 8px;">
            Kosten: ${Object.entries(b.cost).map(([k, v]) => `${v} ${k}`).join(', ')}
          </div>
          ${alreadyFounded ? `
            <div style="color: #4CAF50; font-size: 0.8em; font-weight: bold; text-align: center;">✓ Besiedelt</div>
          ` : `
            <button onclick="window.secondaryCastles.foundColony('${b.id}')"
                    style="width: 100%; padding: 6px; background: linear-gradient(135deg, #d4af37, #aa820a); color: #111; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
              Kolonie Gründen
            </button>
          `}
        </div>
      `;
    });

    content += `</div></div>`;
    this.gameUI.showModal('Zweitburgen & Biome', content);
  }

  foundColony(biomeId) {
    const biome = this.biomes.find(b => b.id === biomeId);
    if (!biome) return;

    if (!stateManager.state.colonies) stateManager.state.colonies = [];

    if (stateManager.state.gold < (biome.cost.gold || 0) ||
        stateManager.state.wood < (biome.cost.wood || 0) ||
        stateManager.state.stone < (biome.cost.stone || 0) ||
        stateManager.state.iron < (biome.cost.iron || 0) ||
        stateManager.state.gems < (biome.cost.gems || 0)) {
      this.gameUI.showFloatingNotification('Nicht genug Rohstoffe zur Gründung der Kolonie!');
      return;
    }

    stateManager.state.gold -= (biome.cost.gold || 0);
    stateManager.state.wood -= (biome.cost.wood || 0);
    stateManager.state.stone -= (biome.cost.stone || 0);
    stateManager.state.iron -= (biome.cost.iron || 0);
    stateManager.state.gems -= (biome.cost.gems || 0);

    stateManager.state.colonies.push({
      ...biome,
      specialization: 'agrar', // agrar, mine, trade
      level: 1
    });
    this.gameUI.showFloatingNotification(`🏰 Die Kolonie "${biome.name}" wurde erfolgreich gegründet!`);
    if (window.gameSound) window.gameSound.playSFX('upgrade');
    this.showModal();
  }

  setSpecialization(colonyId, spec) {
    if (!stateManager.state.colonies) return;
    const col = stateManager.state.colonies.find(c => c.id === colonyId);
    if (col) {
      col.specialization = spec;
      stateManager.save();
      this.gameUI.showFloatingNotification(`Spezialisierung geändert zu: ${spec.toUpperCase()}`);
      this.showModal();
    }
  }

  tick() {
    if (!stateManager.state || !stateManager.state.colonies) return;
    stateManager.state.colonies.forEach(c => {
      const spec = c.specialization || 'agrar';
      if (spec === 'agrar') {
        stateManager.state.food += 5;
      } else if (spec === 'mine') {
        stateManager.state.stone += 3;
        stateManager.state.iron += 2;
      } else if (spec === 'trade') {
        stateManager.state.gold += 8;
      }
    });
  }
}

window.SecondaryCastles = SecondaryCastles;
