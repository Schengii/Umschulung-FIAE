// --- FOG OF WAR & WORLD MAP EXPLORATION ---

class FogOfWarManager {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.sectors = [
      { id: 'sec_1', name: 'Flachland', revealed: true },
      { id: 'sec_2', name: 'Dunkler Forst', revealed: false, reqScoutGold: 150 },
      { id: 'sec_3', name: 'Drachenfels-Gebirge', revealed: false, reqScoutGold: 300 },
      { id: 'sec_4', name: 'Piratenküste', revealed: false, reqScoutGold: 500 }
    ];
  }

  init() {
    if (!stateManager.state.revealedSectors) {
      stateManager.state.revealedSectors = ['sec_1'];
    }
  }

  showModal() {
    this.init();
    const revealed = stateManager.state.revealedSectors;

    let content = `
      <div style="padding: 10px; max-height: 75vh; overflow-y: auto;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">🌫️ Nebel des Krieges & Erkundung</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 16px;">Entsende Späher, um verhülltes Land aufzuklären und schaue vergebene Schätze frei!</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
    `;

    this.sectors.forEach(s => {
      const isRev = revealed.includes(s.id);
      content += `
        <div style="background: rgba(20,25,35,0.85); border: 1px solid ${isRev ? '#4CAF50' : 'rgba(255,255,255,0.15)'}; border-radius: 6px; padding: 12px;">
          <h3 style="color: #ffd700; margin-bottom: 4px;">${s.name}</h3>
          ${isRev ? `
            <div style="color: #4CAF50; font-size: 0.8em; font-weight: bold;">✓ Sektor Erforscht</div>
          ` : `
            <div style="font-size: 0.75em; color: #aaa; margin-bottom: 8px;">Kosten: ${s.reqScoutGold} Gold</div>
            <button onclick="window.fogOfWarManager.scoutSector('${s.id}')" style="width: 100%; padding: 6px; background: linear-gradient(135deg, #d4af37, #aa820a); color: #111; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
              🧭 Späher Entsenden
            </button>
          `}
        </div>
      `;
    });

    content += `</div></div>`;
    this.gameUI.showModal('Nebel des Krieges', content);
  }

  scoutSector(secId) {
    this.init();
    const sec = this.sectors.find(s => s.id === secId);
    if (!sec) return;

    if (stateManager.state.gold < sec.reqScoutGold) {
      this.gameUI.showFloatingNotification('Nicht genug Gold für diese Späher-Expedition!');
      return;
    }

    stateManager.state.gold -= sec.reqScoutGold;
    stateManager.state.revealedSectors.push(secId);
    stateManager.save();

    this.gameUI.showFloatingNotification(`🧭 Sektor "${sec.name}" wurde erfolgreich aufgeklärt!`);
    if (window.gameSound) window.gameSound.playSFX('quest');
    this.showModal();
  }
}

window.FogOfWarManager = FogOfWarManager;
