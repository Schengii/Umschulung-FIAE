// --- DYNASTY, SUCCESSORS & ROYAL MARRIAGE SYSTEM ---

class DynastyManager {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.traits = [
      { id: 'greedy', name: 'Der Gierige', bonus: '+25% Steuereinnahmen, -10% Bürger-Zufriedenheit' },
      { id: 'builder', name: 'Der Baumeister', bonus: '-25% Gebäudebaukosten' },
      { id: 'warlord', name: 'Der Kriegsfürst', bonus: '+15% Nahkampf-Schaden aller Soldaten' },
      { id: 'diplomat', name: 'Der Diplomat', bonus: '+30% Beziehungsverbesserung bei KI-Nationen' }
    ];
  }

  init() {
    if (!stateManager.state.dynasty) {
      stateManager.state.dynasty = {
        rulerName: 'König Friedrich I.',
        generation: 1,
        activeTrait: 'builder',
        marriages: []
      };
    }
  }

  showModal() {
    this.init();
    const dynasty = stateManager.state.dynasty;
    const currentTrait = this.traits.find(t => t.id === dynasty.activeTrait) || this.traits[1];

    let content = `
      <div style="padding: 10px;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">👑 Dynastie & Thronfolge</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 16px;">Verwalte deine Herrscherfamilie, wähle Charakterzüge für Thronfolger und schließe königliche Ehen!</p>

        <div style="background: rgba(25,30,40,0.85); border: 1px solid #d4af37; border-radius: 6px; padding: 12px; margin-bottom: 16px;">
          <h3 style="color: #ffd700; margin-bottom: 4px;">Aktueller Herrscher: ${dynasty.rulerName} (${dynasty.generation}. Generation)</h3>
          <div style="font-size: 0.85em; color: #4CAF50;">Eigenschaft: <strong>${currentTrait.name}</strong> (${currentTrait.bonus})</div>
        </div>

        <h3 style="color: #e5c158; margin-bottom: 8px;">Thronfolger wählen (Nächste Generation):</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-bottom: 20px;">
    `;

    this.traits.forEach(t => {
      const isActive = dynasty.activeTrait === t.id;
      content += `
        <div style="background: rgba(15,20,30,0.8); border: 1px solid ${isActive ? '#4CAF50' : 'rgba(255,255,255,0.1)'}; border-radius: 6px; padding: 10px;">
          <h4 style="color: #fff; margin-bottom: 4px;">${t.name}</h4>
          <div style="font-size: 0.8em; color: #aaa; margin-bottom: 8px;">${t.bonus}</div>
          ${isActive ? `
            <div style="color: #4CAF50; font-weight: bold; font-size: 0.8em;">✓ Aktive Dynastie-Eigenschaft</div>
          ` : `
            <button onclick="window.dynastyManager.chooseSuccessor('${t.id}')"
                    style="width: 100%; padding: 6px; background: linear-gradient(135deg, #d4af37, #aa820a); color: #111; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
              Als Erbe Einsetzen
            </button>
          `}
        </div>
      `;
    });

    content += `</div></div>`;
    this.gameUI.showModal('Dynastie & Thronfolge', content);
  }

  chooseSuccessor(traitId) {
    this.init();
    stateManager.state.dynasty.generation += 1;
    stateManager.state.dynasty.activeTrait = traitId;
    stateManager.state.dynasty.rulerName = `König Friedrich ${stateManager.state.dynasty.generation}.`;

    const trait = this.traits.find(t => t.id === traitId);
    this.gameUI.showFloatingNotification(`👑 Thronwechsel vollzogen! Neueste Generation regiert mit Eigenschaft "${trait.name}".`);
    if (window.gameSound) window.gameSound.playSFX('upgrade');
    this.showModal();
  }

  marryRoyalFamily(npcName) {
    this.init();
    if (stateManager.state.gold < 500) {
      this.gameUI.showFloatingNotification('Nicht genug Gold (500 Gold benötigt) für die königliche Hochzeit!');
      return;
    }
    stateManager.state.gold -= 500;
    stateManager.state.dynasty.marriages.push({
      partner: npcName,
      date: new Date().toLocaleDateString()
    });

    if (window.diplomacyManager) {
      window.diplomacyManager.improveRelations(npcName, 35);
    }
    this.gameUI.showFloatingNotification(`💍 Königliche Hochzeit gefeiert mit ${npcName}! Diplomatische Beziehungen drastisch gestiegen.`);
    if (window.gameSound) window.gameSound.playSFX('quest');
    this.showModal();
  }
}

window.DynastyManager = DynastyManager;
