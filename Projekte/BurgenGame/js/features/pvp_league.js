// --- PVP DIVISION LEAGUE & ARENA TOURNAMENT ---

class PvPLeagueManager {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.divisions = [
      { id: 'bronze', name: '🥉 Bronze-Liga', reqRating: 0, badge: '🟤', seasonReward: { gold: 200, rubies: 5 } },
      { id: 'silver', name: '🥈 Silber-Liga', reqRating: 500, badge: '⚪', seasonReward: { gold: 500, rubies: 15 } },
      { id: 'gold', name: '🥇 Gold-Liga', reqRating: 1200, badge: '🟡', seasonReward: { gold: 1000, rubies: 30 } },
      { id: 'diamond', name: '💎 Diamant-Liga', reqRating: 2500, badge: '🔷', seasonReward: { gold: 2000, rubies: 60 } },
      { id: 'master', name: '👑 Meister-Liga', reqRating: 5000, badge: '👑', seasonReward: { gold: 5000, rubies: 100 } }
    ];

    // Saisonale Gegner-Profile – jede Liga hat typische Gegner
    this.opponentProfiles = {
      bronze: [
        { name: 'Räuber Konrad', troops: 8, keepLevel: 1, wallCount: 0, heroLevel: 0 },
        { name: 'Bauer Hermanns Burg', troops: 12, keepLevel: 1, wallCount: 1, heroLevel: 1 }
      ],
      silver: [
        { name: 'Graf von Eisenfaust', troops: 25, keepLevel: 2, wallCount: 2, heroLevel: 2 },
        { name: 'Ritter des Schwarzen Ordens', troops: 35, keepLevel: 2, wallCount: 3, heroLevel: 3 }
      ],
      gold: [
        { name: 'Herzog Maximilian', troops: 60, keepLevel: 3, wallCount: 4, heroLevel: 4 },
        { name: 'Kriegsfürst Ragnar', troops: 80, keepLevel: 3, wallCount: 5, heroLevel: 5 }
      ],
      diamond: [
        { name: 'Kaisermarschall Voss', troops: 120, keepLevel: 4, wallCount: 6, heroLevel: 7 },
        { name: 'Großduke Alderian', troops: 150, keepLevel: 4, wallCount: 8, heroLevel: 8 }
      ],
      master: [
        { name: 'Der Eiserne Thronhalter', troops: 250, keepLevel: 5, wallCount: 10, heroLevel: 10 },
        { name: 'Legende: Schwarzer Drache', troops: 400, keepLevel: 5, wallCount: 12, heroLevel: 12 }
      ]
    };
  }

  init() {
    if (!stateManager.state.pvpRating) stateManager.state.pvpRating = 100;
    if (!stateManager.state.pvpWins) stateManager.state.pvpWins = 0;
    if (!stateManager.state.pvpLosses) stateManager.state.pvpLosses = 0;
    if (!stateManager.state.pvpSeasonStart) {
      stateManager.state.pvpSeasonStart = Date.now();
    }
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

  // ============================================================
  // Berechnet die Kampfkraft des Spielers (strategisch!)
  // ============================================================
  calculatePlayerPower() {
    const state = stateManager.state;
    let power = 0;

    // Truppen-Beitrag
    const totalTroops = Object.values(state.troops || {}).reduce((a, b) => a + b, 0);
    power += totalTroops * 3;

    // Keep-Level
    const keep = (state.buildings || []).find(b => b.type === 'keep' || b.type === 'KEEP');
    power += (keep?.level || 1) * 20;

    // Mauer-Beitrag
    const wallCount = (state.buildings || []).filter(b => (b.type === 'wall' || b.type === 'WALL') && !b.underConstruction).length;
    power += wallCount * 10;

    // Held-Beitrag
    const heroLevel = state.hero?.level || 0;
    power += heroLevel * 15;

    // Dragon Mount Bonus
    if (window.dragonMountsManager) {
      const mountBonus = window.dragonMountsManager.getDragonMountBonus('damage_mult');
      power = Math.floor(power * mountBonus);
    }

    // Throneroom Moral-Bonus
    if (window.throneroomDecorator) {
      const moralBonus = 1 + window.throneroomDecorator.getCombatMoralBonus();
      power = Math.floor(power * moralBonus);
    }

    // Guild-Wonder Army-Stärke
    if (window.guildWondersManager) {
      const armyBonus = window.guildWondersManager.getCompletedBonus('army_strength');
      power = Math.floor(power * armyBonus);
    }

    // Dynasty Warlord-Bonus
    if (window.dynastyManager) {
      const dynastyBonus = window.dynastyManager.getDynastyBonus('melee_damage_mult');
      power = Math.floor(power * dynastyBonus);
    }

    return power;
  }

  // Berechnet Kampfkraft des Gegners
  calculateOpponentPower(opponent) {
    let power = opponent.troops * 3;
    power += opponent.keepLevel * 20;
    power += opponent.wallCount * 10;
    power += opponent.heroLevel * 15;
    return power;
  }

  getNextDivision() {
    const div = this.getCurrentDivision();
    const idx = this.divisions.findIndex(d => d.id === div.id);
    return this.divisions[idx + 1] || null;
  }

  showModal() {
    this.init();
    const rating = stateManager.state.pvpRating;
    const wins = stateManager.state.pvpWins || 0;
    const losses = stateManager.state.pvpLosses || 0;
    const div = this.getCurrentDivision();
    const nextDiv = this.getNextDivision();
    const playerPower = this.calculatePlayerPower();

    // Saisonzeit berechnen
    const seasonAge = Date.now() - (stateManager.state.pvpSeasonStart || Date.now());
    const seasonDays = Math.floor(seasonAge / (1000 * 60 * 60 * 24));

    // Zufälliger Gegner aus aktueller Liga
    const currentOpponents = this.opponentProfiles[div.id] || this.opponentProfiles.bronze;
    const randomOpponent = currentOpponents[Math.floor(Math.random() * currentOpponents.length)];
    const opponentPower = this.calculateOpponentPower(randomOpponent);
    const successChance = Math.min(0.90, Math.max(0.10, 0.5 + (playerPower - opponentPower) / (playerPower + opponentPower + 1)));

    let html = `
      <div style="padding: 10px; max-height: 75vh; overflow-y: auto;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">🏆 PvP-Turnierliga & Rangliste</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 12px;">Erkämpfe dir Trophäen und steige bis in die Meister-Liga auf! Deine Kampfkraft bestimmt die Siegchance.</p>

        <div style="background: rgba(25,30,40,0.85); border: 1px solid #d4af37; border-radius: 6px; padding: 15px; margin-bottom: 15px; text-align: center;">
          <div style="font-size: 1.6rem; font-weight: bold; color: #ffd700;">${div.badge} ${div.name}</div>
          <div style="font-size: 0.9em; color: #aaa; margin-top: 6px;">
            🏆 <strong>${rating} Trophäen</strong> | W/L: <strong>${wins}/${losses}</strong>
          </div>
          ${nextDiv ? `
            <div style="margin-top: 8px; font-size: 0.8em; color: #4CAF50;">
              Nächste Liga: ${nextDiv.name} bei ${nextDiv.reqRating} Trophäen
              (noch ${nextDiv.reqRating - rating} benötigt)
            </div>
          ` : `<div style="color: #f1c40f; margin-top: 4px; font-size: 0.85em;">👑 HÖCHSTE LIGA ERREICHT!</div>`}
          <div style="margin-top: 4px; font-size: 0.75em; color: #888;">Saison läuft seit ${seasonDays} Tagen</div>
        </div>

        <div style="background: rgba(20,30,40,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 12px; margin-bottom: 12px;">
          <h3 style="color: #e5c158; margin-bottom: 8px; font-size: 0.95em;">⚔️ Nächster Gegner: ${randomOpponent.name}</h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.8em;">
            <div>🗡️ Truppen: ${randomOpponent.troops}</div>
            <div>🏰 Burg-Level: ${randomOpponent.keepLevel}</div>
            <div>🧱 Mauern: ${randomOpponent.wallCount}</div>
            <div>🦸 Held-Level: ${randomOpponent.heroLevel}</div>
          </div>
          <div style="margin-top: 8px; display: flex; justify-content: space-between; font-size: 0.85em;">
            <span>Deine Kampfkraft: <strong style="color: #4CAF50;">${playerPower}</strong></span>
            <span>Gegner-Stärke: <strong style="color: #e74c3c;">${opponentPower}</strong></span>
          </div>
          <div style="margin-top: 6px; font-size: 0.85em; color: ${successChance >= 0.5 ? '#2ecc71' : '#e74c3c'};">
            Siegchance: <strong>${Math.round(successChance * 100)}%</strong>
          </div>
        </div>

        <button onclick="window.pvpLeagueManager.challengeMatch()" 
                style="width: 100%; padding: 12px; background: linear-gradient(135deg, #d4af37, #aa820a); color: #111; font-weight: bold; font-size: 1rem; border: none; border-radius: 6px; cursor: pointer; margin-bottom: 12px;">
          ⚔️ Liga-Duell gegen ${randomOpponent.name} bestreiten
        </button>

        <div style="background: rgba(25,30,40,0.7); border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; padding: 12px; margin-bottom: 12px;">
          <h3 style="color: #e5c158; margin-bottom: 8px; font-size: 0.9em;">🏆 Liga-Belohnungen (End-Saison)</h3>
          ${this.divisions.map(d => `
            <div style="display: flex; justify-content: space-between; font-size: 0.8em; padding: 3px 0; ${d.id === div.id ? 'color: #ffd700; font-weight: bold;' : 'color: #bdc3c7;'}">
              <span>${d.badge} ${d.name}</span>
              <span>+${d.seasonReward.gold} Gold | +${d.seasonReward.rubies} Rubine</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.gameUI.showModal('PvP Turnierliga', html);
  }

  challengeMatch() {
    this.init();
    const div = this.getCurrentDivision();
    const playerPower = this.calculatePlayerPower();
    const currentOpponents = this.opponentProfiles[div.id] || this.opponentProfiles.bronze;
    const opponent = currentOpponents[Math.floor(Math.random() * currentOpponents.length)];
    const opponentPower = this.calculateOpponentPower(opponent);

    // Siegchance basierend auf echter Kampfstärke (nicht mehr reiner Zufall!)
    const successChance = Math.min(0.90, Math.max(0.10, 0.5 + (playerPower - opponentPower) / (playerPower + opponentPower + 1)));
    const win = Math.random() < successChance;

    if (win) {
      const gain = 20 + Math.floor(Math.random() * 20);
      const goldReward = 150 + Math.floor(Math.random() * 100);
      stateManager.state.pvpRating += gain;
      stateManager.state.pvpWins = (stateManager.state.pvpWins || 0) + 1;
      // BUG FIX: state.resources.gold statt state.gold
      stateManager.state.resources.gold = (stateManager.state.resources.gold || 0) + goldReward;
      if (!stateManager.state.statistics) stateManager.state.statistics = {};
      stateManager.state.statistics.aiDefeated = (stateManager.state.statistics.aiDefeated || 0) + 1;
      this.gameUI.showFloatingNotification(`🏆 SIEG gegen ${opponent.name}! +${gain} Trophäen & +${goldReward} Gold!`);
      if (window.gameSound) window.gameSound.playSFX('quest');
    } else {
      const loss = 8 + Math.floor(Math.random() * 10);
      stateManager.state.pvpRating = Math.max(0, stateManager.state.pvpRating - loss);
      stateManager.state.pvpLosses = (stateManager.state.pvpLosses || 0) + 1;
      this.gameUI.showFloatingNotification(`⚔️ Niederlage gegen ${opponent.name} (-${loss} Trophäen). Stärke deine Armee!`);
      if (window.gameSound) window.gameSound.playSFX('battle');
    }
    stateManager.save();
    this.showModal();
  }

  // Saisonbelohnungen auszahlen (kann manuell aufgerufen werden)
  claimSeasonReward() {
    this.init();
    const div = this.getCurrentDivision();
    const reward = div.seasonReward;
    stateManager.state.resources.gold = (stateManager.state.resources.gold || 0) + reward.gold;
    stateManager.state.resources.rubies = (stateManager.state.resources.rubies || 0) + reward.rubies;
    // Reset Saison
    stateManager.state.pvpSeasonStart = Date.now();
    stateManager.state.pvpRating = Math.max(0, stateManager.state.pvpRating - 500); // Teilweiser Reset
    stateManager.save();
    this.gameUI.showFloatingNotification(`🏆 Saison-Belohnung erhalten: +${reward.gold} Gold, +${reward.rubies} Rubine!`);
  }
}

window.PvPLeagueManager = PvPLeagueManager;
