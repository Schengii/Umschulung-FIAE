// --- RITTERTURNIERE & LANZENSTECHEN (JOUSTING ARENA) ---

class JoustingArena {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.champions = [
      { id: 'champ1', name: 'Ritter Heinrich von Nordmark', power: 40, reward: { gold: 300, gems: 2 } },
      { id: 'champ2', name: 'Graf Baldwin der Schwarze', power: 75, reward: { gold: 700, gems: 5 } },
      { id: 'champ3', name: 'Prinz Albrecht von Südgold', power: 120, reward: { gold: 1500, gems: 12 } }
    ];
  }

  showModal() {
    let content = `
      <div style="padding: 10px;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">🏇 Ritterturnier & Lanzenstechen</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 16px;">Tritt in der Arena im Lanzenstechen gegen edle Champions an und erringe Ruhm & Beute!</p>

        <h3 style="color: #e5c158; margin-bottom: 8px;">Aktuelle Turnier-Herausforderer:</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
    `;

    this.champions.forEach(champ => {
      content += `
        <div style="background: rgba(15,20,30,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 10px;">
          <h4 style="color: #fff; margin-bottom: 4px;">${champ.name}</h4>
          <div style="font-size: 0.8em; color: #aaa; margin-bottom: 4px;">Kampfkraft: ⚔️ ${champ.power}</div>
          <div style="font-size: 0.75em; color: #ffd700; margin-bottom: 8px;">Siegesprämie: ${champ.reward.gold} Gold, ${champ.reward.gems} Edelsteine</div>
          <button onclick="window.joustingArena.startJoust('${champ.id}')"
                  style="width: 100%; padding: 6px; background: linear-gradient(135deg, #d4af37, #aa820a); color: #111; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
            🏇 Lanzenstechen Starten
          </button>
        </div>
      `;
    });

    content += `</div></div>`;
    this.gameUI.showModal('Ritterturnier', content);
  }

  startJoust(champId) {
    const champ = this.champions.find(c => c.id === champId);
    if (!champ) return;

    const heroPower = (stateManager.state.heroLevel || 1) * 20 + 25;
    const playerRoll = Math.random() * heroPower;
    const champRoll = Math.random() * champ.power;

    if (playerRoll >= champRoll) {
      stateManager.state.gold += champ.reward.gold;
      stateManager.state.gems += champ.reward.gems;
      this.gameUI.showFloatingNotification(`🏇 SIEG! Du hast ${champ.name} aus dem Sattel gehoben! Beute: +${champ.reward.gold} Gold!`);
      window.soundManager && window.soundManager.playUpgradeSound();
    } else {
      this.gameUI.showFloatingNotification(`💥 NIEDERLAGE! ${champ.name} hat deine Lanze zerbrochen.`);
    }

    this.showModal();
  }

  startSandboxBattle(playerTroops = { spearman: 5, bowman: 3 }, enemyTroops = { spearman: 4, bowman: 2 }) {
    const report = {
      troopsSent: playerTroops,
      defenders: enemyTroops,
      isSandbox: true,
      victory: false
    };

    let pPower = 0;
    Object.keys(playerTroops).forEach(k => pPower += (playerTroops[k] || 0) * 15);
    let ePower = 0;
    Object.keys(enemyTroops).forEach(k => ePower += (enemyTroops[k] || 0) * 15);

    report.victory = pPower >= ePower;
    if (this.gameUI) {
      this.gameUI.showFloatingNotification(report.victory ? '🎯 Sandbox-Schlacht Gewonnen!' : '💥 Sandbox-Schlacht Verloren!');
    }
    return report;
  }
}

window.JoustingArena = JoustingArena;

