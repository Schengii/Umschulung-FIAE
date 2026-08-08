// --- ROYAL DECREES & KINGDOM LEGISLATION SYSTEM ---

class RoyalDecreesManager {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.decrees = [
      { id: 'tax_raise', name: '💰 Großes Steuer-Edikt', desc: '+50% Steuereinnahmen, aber -15% Zufriedenheit', goldMult: 1.5, happinessMod: -15 },
      { id: 'conscription', name: '⚔️ Zwangsaushebung', desc: '-30% Rekrutierungsdauer, aber -10% Nahrung', recruitSpeed: 0.7, foodMod: -10 },
      { id: 'merchant_freedom', name: '⚖️ Handelsfreiheiten', desc: '+30% Markt-Handelsgewinne, aber -10% Steuern', tradeMult: 1.3, goldMult: 0.9 },
      { id: 'festival_bounty', name: '🎪 Königsfest-Erlass', desc: '+25% Volkszufriedenheit, kostet 50 Gold/Min', happinessMod: 25, goldCostPerMin: 50 }
    ];
  }

  init() {
    if (!stateManager.state.activeDecrees) {
      stateManager.state.activeDecrees = [];
    }
  }

  showModal() {
    this.init();
    const active = stateManager.state.activeDecrees;

    let content = `
      <div style="padding: 10px; max-height: 75vh; overflow-y: auto;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">📜 Königliche Erlasse & Gesetze</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 16px;">Setze königliche Edikte in Kraft, um Produktion, Armee und Zufriedenheit im Reich zu steuern.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
    `;

    this.decrees.forEach(d => {
      const isActive = active.includes(d.id);
      content += `
        <div style="background: rgba(20,25,35,0.85); border: 1px solid ${isActive ? '#4CAF50' : 'rgba(212,175,55,0.3)'}; border-radius: 6px; padding: 12px;">
          <h3 style="color: #ffd700; margin-bottom: 4px;">${d.name}</h3>
          <div style="font-size: 0.8em; color: #aaa; margin-bottom: 10px;">${d.desc}</div>
          ${isActive ? `
            <button onclick="window.royalDecreesManager.toggleDecree('${d.id}')" style="width: 100%; padding: 6px; background: #e74c3c; color: #fff; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
              ✖️ Erlass Aufheben
            </button>
          ` : `
            <button onclick="window.royalDecreesManager.toggleDecree('${d.id}')" style="width: 100%; padding: 6px; background: linear-gradient(135deg, #d4af37, #aa820a); color: #111; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
              ⚖️ In Kraft Setzen
            </button>
          `}
        </div>
      `;
    });

    content += `</div></div>`;
    this.gameUI.showModal('Königliche Erlasse', content);
  }

  toggleDecree(decreeId) {
    this.init();
    const active = stateManager.state.activeDecrees;
    const idx = active.indexOf(decreeId);
    if (idx >= 0) {
      active.splice(idx, 1);
      this.gameUI.showFloatingNotification('⚖️ Erlass aufgehoben.');
    } else {
      if (active.length >= 2) {
        this.gameUI.showFloatingNotification('Maximal 2 Erlasse gleichzeitig aktivierbar!');
        return;
      }
      active.push(decreeId);
      this.gameUI.showFloatingNotification('📜 Neuer Erlass in Kraft gesetzt!');
      if (window.gameSound) window.gameSound.playSFX('quest');
    }
    stateManager.save();
    this.showModal();
  }
}

window.RoyalDecreesManager = RoyalDecreesManager;
