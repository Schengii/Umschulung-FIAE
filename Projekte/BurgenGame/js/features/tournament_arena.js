// --- TOURNAMENT ARENA & JOUSTING SYSTEM (Option 3 Upgrade) ---

class TournamentArenaEngine {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.activeMatch = null;
  }

  startTournament(championType = 'knight') {
    if (this.stateManager.state.resources.gold < 150) {
      this.gameUI.showToast("Das Startgeld für das Turnier beträgt 150 Gold!", "error");
      return;
    }

    this.stateManager.state.resources.gold -= 150;

    const opponents = [
      { name: 'Ritter Lancelot', hp: 100, attack: 25, title: 'Der Unbesiegte' },
      { name: 'Sir Gawain', hp: 120, attack: 20, title: 'Der Grüne Champion' },
      { name: 'Schwarzer Ritter', hp: 150, attack: 30, title: 'Schreckensritter' }
    ];

    const opponent = opponents[Math.floor(Math.random() * opponents.length)];

    this.activeMatch = {
      playerHp: 100,
      playerAttack: championType === 'hero' ? 35 : 22,
      opponent: opponent,
      round: 1,
      log: []
    };

    if (window.gameSound) window.gameSound.playSfx('quest');
    this.showArenaModal();
  }

  executeTurn(actionType) {
    if (!this.activeMatch) return;

    const m = this.activeMatch;
    let playerDmg = Math.floor(m.playerAttack * (0.8 + Math.random() * 0.4));
    let oppDmg = Math.floor(m.opponent.attack * (0.8 + Math.random() * 0.4));

    if (actionType === 'shield') {
      oppDmg = Math.floor(oppDmg * 0.4); // Shield block reduce
      playerDmg = Math.floor(playerDmg * 0.7);
      m.log.unshift(`🛡️ Du hebst den Schild! Gegnerschaden auf ${oppDmg} reduziert.`);
    } else if (actionType === 'charge') {
      playerDmg = Math.floor(playerDmg * 1.5); // Charge boost
      oppDmg = Math.floor(oppDmg * 1.2);
      m.log.unshift(`💥 Ansturm mit der Lanze! Du teilst ${playerDmg} Schaden aus.`);
    } else {
      m.log.unshift(`⚔️ Lanzenschlag! Du verursachst ${playerDmg} Schaden.`);
    }

    m.opponent.hp -= playerDmg;
    m.playerHp -= oppDmg;
    m.round++;

    if (window.magicParticles) {
      window.magicParticles.spawnSpellExplosion(window.innerWidth / 2, window.innerHeight / 2, 'spark');
    }

    // Victory condition
    if (m.opponent.hp <= 0 && m.playerHp > 0) {
      this.stateManager.state.resources.gold += 500;
      this.stateManager.state.resources.rubies += 5;
      this.gameUI.showToast(`🎉 Turniersieg! +500 Gold und +5 Rubine Preisgeld gewonnen!`, "success");
      if (window.gameSound) window.gameSound.playSfx('quest');
      this.activeMatch = null;
      this.stateManager.save();
    } else if (m.playerHp <= 0) {
      this.gameUI.showToast(` Niederlage im Turnier! Dein Lanzenreiter wurde abgeworfen.`, "error");
      this.activeMatch = null;
    }

    this.showArenaModal();
  }

  showArenaModal() {
    if (!this.activeMatch) {
      const content = `
        <div style="padding: 10px; max-width: 550px; margin: 0 auto; text-align: center;">
          <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 4px;">⚔️ Königliches Lanzen-Turnier</h2>
          <p style="font-size: 0.85em; color: #aaa; margin-bottom: 15px;">Schicke deinen Helden oder deinen besten Ritter ins Turnier um Ruhm und Preisgeld!</p>

          <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 15px;">
            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; flex: 1;">
              <div style="font-size: 2.5em;">🏇</div>
              <strong>Reichsritter</strong>
              <div style="font-size: 0.75em; color: #aaa;">Standard Lanzenkämpfer</div>
              <button onclick="window.tournamentArena.startTournament('knight')" style="margin-top: 8px; background: #d4af37; color: black; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer;">Antreten (150 Gold)</button>
            </div>

            <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; flex: 1;">
              <div style="font-size: 2.5em;">🧙‍♂️</div>
              <strong>Königlicher Held</strong>
              <div style="font-size: 0.75em; color: #aaa;">Hoher Schaden & Bonus-HP</div>
              <button onclick="window.tournamentArena.startTournament('hero')" style="margin-top: 8px; background: #2a8; color: white; border: none; padding: 6px 12px; border-radius: 4px; font-weight: bold; cursor: pointer;">Antreten (150 Gold)</button>
            </div>
          </div>
        </div>
      `;
      this.gameUI.showModal('Königliches Turnier', content);
      return;
    }

    const m = this.activeMatch;
    const logText = m.log.slice(0, 4).map(l => `<div style="font-size: 0.8em; color: #eee; margin-bottom: 2px;">${l}</div>`).join('');

    const content = `
      <div style="padding: 10px; max-width: 550px; margin: 0 auto; text-align: center;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 4px;">⚔️ Turnier Arena - Runde ${m.round}</h2>

        <div style="display: flex; justify-content: space-around; align-items: center; margin: 15px 0;">
          <div style="background: rgba(40,100,40,0.3); border: 1px solid #5f5; padding: 10px; border-radius: 8px; min-width: 130px;">
            <div style="font-size: 1.8em;">🏇</div>
            <strong>Dein Champion</strong>
            <div style="color: #5f5; font-weight: bold;">HP: ${Math.max(0, m.playerHp)}</div>
          </div>

          <div style="font-size: 1.8em; color: #d4af37;">VS</div>

          <div style="background: rgba(100,40,40,0.3); border: 1px solid #f55; padding: 10px; border-radius: 8px; min-width: 130px;">
            <div style="font-size: 1.8em;">🛡️</div>
            <strong>${m.opponent.name}</strong>
            <div style="color: #f55; font-weight: bold;">HP: ${Math.max(0, m.opponent.hp)}</div>
          </div>
        </div>

        <div style="height: 70px; background: #111; padding: 6px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #333;">
          ${logText}
        </div>

        <div style="display: flex; gap: 8px; justify-content: center;">
          <button onclick="window.tournamentArena.executeTurn('attack')" style="background: #a44; color: white; border: none; padding: 8px 14px; border-radius: 4px; font-weight: bold; cursor: pointer;">⚔️ Lanzenschlag</button>
          <button onclick="window.tournamentArena.executeTurn('charge')" style="background: #d4af37; color: black; border: none; padding: 8px 14px; border-radius: 4px; font-weight: bold; cursor: pointer;">💥 Ansturm</button>
          <button onclick="window.tournamentArena.executeTurn('shield')" style="background: #446; color: white; border: none; padding: 8px 14px; border-radius: 4px; font-weight: bold; cursor: pointer;">🛡️ Schild heben</button>
        </div>
      </div>
    `;

    this.gameUI.showModal('Königliches Turnier', content);
  }
}

window.TournamentArenaEngine = TournamentArenaEngine;
