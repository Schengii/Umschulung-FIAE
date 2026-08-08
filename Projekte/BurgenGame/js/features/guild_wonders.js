// --- ALLIANCE SHARED WONDERS & GUILD PROJECTS ---

class GuildWonders {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.wonders = [
      { id: 'gw1', name: '🏛️ Der Sonnenkoloss von Rhodos', desc: '+50% Gold-Einnahmen für alle Alliierten', targetGold: 5000, targetStone: 3000 },
      { id: 'gw2', name: '📚 Die Große Bibliothek', desc: '+40% Forschungsgeschwindigkeit', targetGold: 4000, targetWood: 4000 },
      { id: 'gw3', name: '⚔️ Der Kriegsgerichtshof', desc: '+25% Armee-Stärke bei allen Angriffen', targetGold: 6000, targetIron: 3500 }
    ];
  }

  showModal() {
    if (!stateManager.state.guildWondersProgress) {
      stateManager.state.guildWondersProgress = { gw1: 0, gw2: 0, gw3: 0 };
    }

    let content = `
      <div style="padding: 10px;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">🏛️ Allianzwunder & Gilden-Großprojekte</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 16px;">Spende Rohstoffe für legendäre Weltwunder deines Bündnisses, um mächtige Effekte freizuschalten.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;">
    `;

    this.wonders.forEach(w => {
      const current = stateManager.state.guildWondersProgress[w.id] || 0;
      const totalRequired = w.targetGold + (w.targetStone || 0) + (w.targetWood || 0) + (w.targetIron || 0);
      const pct = Math.min(100, Math.floor((current / totalRequired) * 100));

      content += `
        <div style="background: rgba(20,25,35,0.85); border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; padding: 12px;">
          <h3 style="color: #ffd700; margin-bottom: 4px;">${w.name}</h3>
          <div style="font-size: 0.8em; color: #aaa; margin-bottom: 8px;">${w.desc}</div>
          
          <div style="font-size: 0.8em; color: #fff; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>Fortschritt:</span>
            <strong>${pct}% (${current} / ${totalRequired})</strong>
          </div>
          <div style="width: 100%; background: #222; height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 10px;">
            <div style="width: ${pct}%; background: linear-gradient(90deg, #d4af37, #4CAF50); height: 100%;"></div>
          </div>

          ${pct >= 100 ? `
            <div style="color: #4CAF50; font-weight: bold; text-align: center; font-size: 0.85em;">✓ Weltwunder Erbaut! Bonus Aktiv</div>
          ` : `
            <button onclick="window.guildWonders.contribute('${w.id}')" style="width: 100%; padding: 6px; background: linear-gradient(135deg, #d4af37, #aa820a); color: #111; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
              🤝 500 Gold & Rohstoffe Spenden
            </button>
          `}
        </div>
      `;
    });

    content += `</div></div>`;
    this.gameUI.showModal('Allianzwunder', content);
  }

  contribute(wonderId) {
    const w = this.wonders.find(x => x.id === wonderId);
    if (!w) return;

    if (stateManager.state.gold < 500) {
      this.gameUI.showFloatingNotification('Du benötigst mindestens 500 Gold zum Spenden!');
      return;
    }

    stateManager.state.gold -= 500;
    if (!stateManager.state.guildWondersProgress) stateManager.state.guildWondersProgress = {};
    stateManager.state.guildWondersProgress[wonderId] = (stateManager.state.guildWondersProgress[wonderId] || 0) + 500;

    this.gameUI.showFloatingNotification(`🏛️ 500 Gold an "${w.name}" gespendet!`);
    if (window.gameSound) window.gameSound.playSFX('upgrade');
    this.showModal();
  }

  challengeWorldBoss() {
    if (stateManager.state.gold < 300) {
      this.gameUI.showFloatingNotification('Nicht genug Gold für den Weltboss-Marsch (300 Gold nötig)!');
      return;
    }
    stateManager.state.gold -= 300;
    
    // Simulate raid against Ancient Shadow Dragon (Lvl 10)
    const success = Math.random() < 0.65;
    if (success) {
      stateManager.state.gems = (stateManager.state.gems || 0) + 15;
      stateManager.state.gold += 1200;
      this.gameUI.showFloatingNotification('🐲 WELTBOSS BEZWUNGEN! +15 Edelsteine, +1200 Gold beute gemacht!');
      if (window.gameSound) window.gameSound.playSFX('quest');
    } else {
      this.gameUI.showFloatingNotification('⚔️ Der Weltboss-Angriff war hart umkämpft, aber der Drache hat standgehalten.');
      if (window.gameSound) window.gameSound.playSFX('battle');
    }
    stateManager.save();
  }
}

window.GuildWonders = GuildWonders;
