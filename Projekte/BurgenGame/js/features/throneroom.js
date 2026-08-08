// --- THRONEROOM DECORATOR & INTERIOR VIEW ---

class ThroneroomDecorator {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.decorations = [
      { id: 'throne_gold', name: '👑 Goldener Kaiserthron', bonus: '+30% Diplomatie-Ruf & Gold', cost: { gold: 2000, gems: 15 } },
      { id: 'carpet_royal', name: '🔴 Purpurner Prunkteppich', bonus: '+15% Bürger-Zufriedenheit', cost: { gold: 800, wood: 400 } },
      { id: 'chandelier_crystal', name: '🕯️ Kristall-Kronleuchter', bonus: '+20% Prestige-Punkte', cost: { gold: 1200, stone: 600 } },
      { id: 'trophy_dragon_head', name: '🐲 Kopf des Uralten Drachen', bonus: '+25% Truppen-Moral', cost: { gold: 2500, gems: 25 } }
    ];
  }

  init() {
    if (!stateManager.state.throneroom) {
      stateManager.state.throneroom = { activeItems: [] };
    }
  }

  showModal() {
    this.init();
    const throneroom = stateManager.state.throneroom;

    let content = `
      <div style="padding: 10px;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">🏛️ Thronsaal-Dekorateur & Innenansicht</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 16px;">Richte deinen royalen Thronsaal mit Teppichen, Kronleuchtern und Drachenkopf-Trophäen ein!</p>

        <div style="background: linear-gradient(180deg, #1a1b26, #0f1015); border: 2px solid #d4af37; border-radius: 8px; padding: 15px; margin-bottom: 16px; text-align: center;">
          <h3 style="color: #ffd700; font-family: 'Cinzel', serif; margin-bottom: 8px;">👑 Thronsaal des Reiches</h3>
          <div style="font-size: 2.5em; margin: 10px 0;">
            ${throneroom.activeItems.includes('chandelier_crystal') ? '🕯️ ' : ''}
            ${throneroom.activeItems.includes('throne_gold') ? '👑' : '🪑'}
            ${throneroom.activeItems.includes('trophy_dragon_head') ? ' 🐲' : ''}
          </div>
          <div style="font-size: 0.85em; color: #4CAF50;">
            Ausgestattete Dekorationen: ${throneroom.activeItems.length} / ${this.decorations.length}
          </div>
        </div>

        <h3 style="color: #e5c158; margin-bottom: 8px;">Verfügbare Einrichtung:</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
    `;

    this.decorations.forEach(decor => {
      const isInstalled = throneroom.activeItems.includes(decor.id);

      content += `
        <div style="background: rgba(15,20,30,0.8); border: 1px solid ${isInstalled ? '#4CAF50' : 'rgba(255,255,255,0.1)'}; border-radius: 6px; padding: 10px;">
          <h4 style="color: #fff; margin-bottom: 4px;">${decor.name}</h4>
          <div style="font-size: 0.8em; color: #aaa; margin-bottom: 8px;">${decor.bonus}</div>
          ${isInstalled ? `
            <div style="color: #4CAF50; font-weight: bold; font-size: 0.8em; text-align: center;">✓ Im Thronsaal Aufgestellt</div>
          ` : `
            <div style="font-size: 0.75em; color: #888; margin-bottom: 8px;">
              Kosten: ${Object.entries(decor.cost).map(([k, v]) => `${v} ${k}`).join(', ')}
            </div>
            <button onclick="window.throneroomDecorator.buyDecoration('${decor.id}')"
                    style="width: 100%; padding: 6px; background: linear-gradient(135deg, #d4af37, #aa820a); color: #111; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
              🔨 Einrichten
            </button>
          `}
        </div>
      `;
    });

    content += `</div></div>`;
    this.gameUI.showModal('Thronsaal-Dekorateur', content);
  }

  buyDecoration(decorId) {
    this.init();
    const decor = this.decorations.find(d => d.id === decorId);
    if (!decor) return;

    if (stateManager.state.gold < (decor.cost.gold || 0) ||
        stateManager.state.wood < (decor.cost.wood || 0) ||
        stateManager.state.stone < (decor.cost.stone || 0) ||
        stateManager.state.gems < (decor.cost.gems || 0)) {
      this.gameUI.showFloatingNotification('Nicht genug Rohstoffe für diese Einrichtung!');
      return;
    }

    stateManager.state.gold -= (decor.cost.gold || 0);
    stateManager.state.wood -= (decor.cost.wood || 0);
    stateManager.state.stone -= (decor.cost.stone || 0);
    stateManager.state.gems -= (decor.cost.gems || 0);

    stateManager.state.throneroom.activeItems.push(decorId);
    this.gameUI.showFloatingNotification(`🏛️ "${decor.name}" wurde im Thronsaal aufgestellt!`);
    window.soundManager && window.soundManager.playUpgradeSound();
    this.showModal();
  }
}

window.ThroneroomDecorator = ThroneroomDecorator;
