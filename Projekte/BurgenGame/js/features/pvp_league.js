// --- PVP DIVISION LEAGUE & ARENA TOURNAMENT ---

class PvPLeagueManager {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.divisions = [
      { id: 'bronze', name: '🥉 Bronze-Liga', reqRating: 0, badge: '🟤' },
      { id: 'silver', name: '🥈 Silber-Liga', reqRating: 500, badge: '⚪' },
      { id: 'gold', name: '🥇 Gold-Liga', reqRating: 1200, badge: '🟡' },
      { id: 'diamond', name: '💎 Diamant-Liga', reqRating: 2500, badge: '🔷' },
      { id: 'master', name: '👑 Meister-Liga', reqRating: 5000, badge: '👑' }
    ];
  }

  init() {
    if (!stateManager.state.pvpRating) stateManager.state.pvpRating = 100;
    if (!stateManager.state.pvpWins) stateManager.state.pvpWins = 0;
  }

  getCurrentDivision() {
    this.init();
    const rating = stateManager.state.pvpRating;
    let current = this.divisions[0];
    for (const d of this.divisions) {
      if (rating >= d.reqRating) current = d;
    }
    return current;
  }

  showModal() {
    this.init();
    const rating = stateManager.state.pvpRating;
    const wins = stateManager.state.pvpWins;
    const div = this.getCurrentDivision();

    let content = `
      <div style="padding: 10px; max-height: 75vh; overflow-y: auto;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">🏆 PvP-Turnierliga & Rangliste</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 12px;">Erkämpfe dir Trophäen in der Arena und steige bis in die Meister-Liga auf!</p>

        <div style="background: rgba(25,30,40,0.85); border: 1px solid #d4af37; border-radius: 6px; padding: 15px; margin-bottom: 15px; text-align: center;">
          <div style="font-size: 1.6rem; font-weight: bold; color: #ffd700;">${div.badge} ${div.name}</div>
          <div style="font-size: 0.9em; color: #aaa; margin-top: 4px;">Wertung: <strong>${rating} Trophäen</strong> | Siege: <strong>${wins}</strong></div>
        </div>

        <button onclick="window.pvpLeagueManager.challengeMatch()" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #d4af37, #aa820a); color: #111; font-weight: bold; font-size: 1rem; border: none; border-radius: 6px; cursor: pointer; margin-bottom: 15px;">
          ⚔️ Liga-Duell Bestreiten
        </button>
      </div>
    `;

    this.gameUI.showModal('PvP Turnierliga', content);
  }

  challengeMatch() {
    this.init();
    const win = Math.random() < 0.65;
    if (win) {
      const gain = 25 + Math.floor(Math.random() * 15);
      stateManager.state.pvpRating += gain;
      stateManager.state.pvpWins += 1;
      stateManager.state.gold += 200;
      this.gameUI.showFloatingNotification(`🏆 DUCK-SIEG! +${gain} Trophäen & +200 Gold verdient!`);
      if (window.gameSound) window.gameSound.playSFX('quest');
    } else {
      const loss = 10 + Math.floor(Math.random() * 8);
      stateManager.state.pvpRating = Math.max(0, stateManager.state.pvpRating - loss);
      this.gameUI.showFloatingNotification(`⚔️ Duell knapp verloren. -${loss} Trophäen.`);
      if (window.gameSound) window.gameSound.playSFX('battle');
    }
    stateManager.save();
    this.showModal();
  }
}

window.PvPLeagueManager = PvPLeagueManager;
