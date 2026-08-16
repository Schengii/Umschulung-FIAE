// --- ALLIANCE SHARED WONDERS & GUILD PROJECTS ---

class GuildWonders {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.wonders = [
      {
        id: 'gw1',
        name: '🏛️ Der Sonnenkoloss von Rhodos',
        desc: '+50% Gold-Einnahmen für alle Alliierten',
        targetGold: 5000, targetStone: 3000,
        bonusType: 'gold_income',
        bonusVal: 1.50
      },
      {
        id: 'gw2',
        name: '📚 Die Große Bibliothek',
        desc: '+40% Forschungsgeschwindigkeit',
        targetGold: 4000, targetWood: 4000,
        bonusType: 'research_speed',
        bonusVal: 1.40
      },
      {
        id: 'gw3',
        name: '⚔️ Der Kriegsgerichtshof',
        desc: '+25% Armee-Stärke bei allen Angriffen',
        targetGold: 6000, targetIron: 3500,
        bonusType: 'army_strength',
        bonusVal: 1.25
      }
    ];
  }

  initState() {
    if (!stateManager.state.guildWondersProgress) {
      stateManager.state.guildWondersProgress = { gw1: 0, gw2: 0, gw3: 0 };
    }
  }

  isCompleted(wonderId) {
    this.initState();
    const w = this.wonders.find(x => x.id === wonderId);
    if (!w) return false;
    const totalRequired = (w.targetGold || 0) + (w.targetStone || 0) + (w.targetWood || 0) + (w.targetIron || 0);
    const current = stateManager.state.guildWondersProgress[wonderId] || 0;
    return current >= totalRequired;
  }

  // ============================================================
  // NEU: Gibt den aktiven Bonus eines vollendeten Wunders zurück
  // Wird von state.js (Tick-Loop) und tactical_combat.js aufgerufen
  // ============================================================
  getCompletedBonus(bonusType) {
    this.initState();
    for (const w of this.wonders) {
      if (w.bonusType === bonusType && this.isCompleted(w.id)) {
        return w.bonusVal;
      }
    }
    return bonusType === 'gold_income' || bonusType === 'research_speed' || bonusType === 'army_strength' ? 1.0 : 0;
  }

  showModal() {
    this.initState();

    let content = `
      <div style="padding: 10px;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">🏛️ Allianzwunder & Gilden-Großprojekte</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 16px;">Spende Rohstoffe für legendäre Weltwunder deines Bündnisses, um mächtige Effekte freizuschalten.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px;">
    `;

    this.wonders.forEach(w => {
      const current = stateManager.state.guildWondersProgress[w.id] || 0;
      const totalRequired = (w.targetGold || 0) + (w.targetStone || 0) + (w.targetWood || 0) + (w.targetIron || 0);
      const pct = Math.min(100, Math.floor((current / totalRequired) * 100));
      const completed = pct >= 100;

      content += `
        <div style="background: rgba(20,25,35,0.85); border: 1px solid ${completed ? '#f1c40f' : 'rgba(212,175,55,0.3)'}; border-radius: 6px; padding: 12px;">
          <h3 style="color: #ffd700; margin-bottom: 4px;">${w.name}</h3>
          <div style="font-size: 0.8em; color: #aaa; margin-bottom: 8px;">${w.desc}</div>
          
          <div style="font-size: 0.8em; color: #fff; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>Fortschritt:</span>
            <strong>${pct}% (${Math.floor(current)} / ${totalRequired})</strong>
          </div>
          <div style="width: 100%; background: #222; height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 10px;">
            <div style="width: ${pct}%; background: linear-gradient(90deg, #d4af37, #4CAF50); height: 100%;"></div>
          </div>

          ${completed ? `
            <div style="color: #4CAF50; font-weight: bold; text-align: center; font-size: 0.85em;">✓ Weltwunder Erbaut! Bonus Aktiv 🌟</div>
          ` : `
            <button onclick="window.guildWondersManager.contribute('${w.id}')" style="width: 100%; padding: 6px; background: linear-gradient(135deg, #d4af37, #aa820a); color: #111; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
              🤝 500 Gold spenden
            </button>
          `}
        </div>
      `;
    });

    content += `</div></div>`;
    this.gameUI.showModal('Allianzwunder', content);
  }

  contribute(wonderId) {
    this.initState();
    const w = this.wonders.find(x => x.id === wonderId);
    if (!w) return;

    const donationAmount = 500;
    // BUG FIX: Verwende state.resources.gold statt state.gold
    if ((stateManager.state.resources?.gold || 0) < donationAmount) {
      this.gameUI.showFloatingNotification(`Du benötigst mindestens ${donationAmount} Gold zum Spenden!`);
      return;
    }

    stateManager.state.resources.gold -= donationAmount;
    stateManager.state.guildWondersProgress[wonderId] = (stateManager.state.guildWondersProgress[wonderId] || 0) + donationAmount;

    const isNowComplete = this.isCompleted(wonderId);
    if (isNowComplete) {
      this.gameUI.showFloatingNotification(`🎉 "${w.name}" ist VOLLENDET! Bonus "${w.desc}" ist jetzt permanent aktiv!`);
      if (window.gameSound) window.gameSound.playSFX('quest');
    } else {
      this.gameUI.showFloatingNotification(`🏛️ ${donationAmount} Gold an "${w.name}" gespendet!`);
      if (window.gameSound) window.gameSound.playSFX('upgrade');
    }

    stateManager.save();
    this.showModal();
  }

  challengeWorldBoss() {
    // BUG FIX: Verwende state.resources.gold statt state.gold
    const playerGold = stateManager.state.resources?.gold || 0;
    if (playerGold < 300) {
      this.gameUI.showFloatingNotification('Nicht genug Gold für den Weltboss-Marsch (300 Gold nötig)!');
      return;
    }
    stateManager.state.resources.gold -= 300;

    // Stärke basierend auf Truppen und Allianzwunder
    const armyStrengthBonus = this.getCompletedBonus('army_strength');
    const baseTroops = Object.values(stateManager.state.troops || {}).reduce((a, b) => a + b, 0);
    const effectivePower = baseTroops * armyStrengthBonus;
    const successChance = Math.min(0.85, 0.35 + effectivePower * 0.003); // Stärke beeinflusst Sieg

    const success = Math.random() < successChance;
    if (success) {
      // BUG FIX: Verwende state.resources.rubies statt state.gems
      stateManager.state.resources.rubies = (stateManager.state.resources.rubies || 0) + 15;
      stateManager.state.resources.gold += 1200;
      if (!stateManager.state.statistics) stateManager.state.statistics = {};
      stateManager.state.statistics.maxNpcLevelDefeated = Math.max(
        stateManager.state.statistics.maxNpcLevelDefeated || 0, 10
      );
      this.gameUI.showFloatingNotification('🐲 WELTBOSS BEZWUNGEN! +15 Rubine, +1200 Gold erbeutet!');
      if (window.gameSound) window.gameSound.playSFX('quest');
    } else {
      this.gameUI.showFloatingNotification(`⚔️ Der Weltboss-Angriff schlug fehl (${Math.floor(successChance * 100)}% Erfolgschance). Bilde mehr Truppen aus!`);
      if (window.gameSound) window.gameSound.playSFX('battle');
    }
    stateManager.save();
  }
}

window.GuildWonders = GuildWonders;
window.GuildWondersManager = GuildWonders; // Alias für Konsistenz
