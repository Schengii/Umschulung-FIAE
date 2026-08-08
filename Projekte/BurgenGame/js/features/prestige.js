// --- PRESTIGE-SYSTEM FEATURE ---

// ================================================================
// Berechne aktuelle Prestige-Punkte
// ================================================================
GameStateManager.prototype.calculatePrestigePoints = function() {
  if (!this.state) return 0;

  const keep = this.state.buildings.find(b => b.type === BUILDING_TYPES.KEEP) || { level: 1 };
  const keepLevel = keep.level || 1;
  const totalBuildings = this.state.buildings.length;
  const npcDefeated = this.state.statistics?.npcDefeated || 0;
  const dungeonsCleared = this.state.statistics?.dungeonsCleared || 0;
  const maxNpcLevel = this.state.statistics?.maxNpcLevelDefeated || 0;
  const outpostsOwned = Object.values(this.state.outposts || {}).filter(o => o.owner === 'player').length;
  const heroLevel = this.state.hero?.level || 0;

  return (
    keepLevel * 500 +
    totalBuildings * 100 +
    npcDefeated * 50 +
    dungeonsCleared * 100 +
    maxNpcLevel * 200 +
    outpostsOwned * 300 +
    heroLevel * 80
  );
};

// ================================================================
// Prestige-Rang ermitteln
// ================================================================
GameStateManager.prototype.getCurrentPrestigeRank = function() {
  const totalPrestige = (this.state.prestige?.totalPoints || 0);
  let currentRank = PRESTIGE_RANKS[0];
  for (const rank of PRESTIGE_RANKS) {
    if (totalPrestige >= rank.minPoints) currentRank = rank;
    else break;
  }
  return currentRank;
};

// ================================================================
// Nächsten Prestige-Rang ermitteln
// ================================================================
GameStateManager.prototype.getNextPrestigeRank = function() {
  const totalPrestige = (this.state.prestige?.totalPoints || 0);
  for (const rank of PRESTIGE_RANKS) {
    if (totalPrestige < rank.minPoints) return rank;
  }
  return null; // Maximaler Rang erreicht
};

// ================================================================
// Prestige-Reset durchführen
// ================================================================
GameStateManager.prototype.performPrestigeReset = function() {
  const currentPoints = this.calculatePrestigePoints();
  if (currentPoints < 500) {
    if (window.gameUI) gameUI.showToast('Du benötigst mindestens 500 Prestige-Punkte für einen Reset!', 'warning');
    return false;
  }

  // Prestige-Punkte ansammeln
  const existingPrestige = this.state.prestige || { totalPoints: 0, resets: 0, rank: 0 };
  const newTotal = existingPrestige.totalPoints + currentPoints;
  const newResets = existingPrestige.resets + 1;

  // Rang berechnen
  let newRankObj = PRESTIGE_RANKS[0];
  for (const r of PRESTIGE_RANKS) {
    if (newTotal >= r.minPoints) newRankObj = r;
    else break;
  }

  // Speichere Prestige vor dem Reset
  const prestigeData = {
    totalPoints: newTotal,
    resets: newResets,
    rank: newRankObj.rank
  };

  // Spielstand zurücksetzen
  this.resetToDefault();

  // Prestige wiederherstellen
  this.state.prestige = prestigeData;

  // Prestige-Boni anwenden
  const bonus = newRankObj.bonus;
  if (bonus.startGold) this.state.resources.gold += bonus.startGold;
  if (bonus.startTroops) this.state.troops.spearman += bonus.startTroops;
  if (bonus.startRubies) this.state.resources.rubies += bonus.startRubies;
  // productionMult wird in updateResources() berücksichtigt

  this.save();
  this.notifyListeners('prestige_reset');
  return true;
};

// ================================================================
// Prestige-Produktions-Bonus anwenden (in state.js aufgerufen)
// ================================================================
GameStateManager.prototype.getPrestigeProductionBonus = function() {
  const rank = this.getCurrentPrestigeRank();
  return rank?.bonus?.productionMult || 0;
};

GameStateManager.prototype.getPrestigeBreweryBonus = function() {
  const rank = this.getCurrentPrestigeRank();
  return rank?.bonus?.breweryBonus || 0;
};

GameStateManager.prototype.getPrestigeGemBonus = function() {
  const rank = this.getCurrentPrestigeRank();
  return rank?.bonus?.gemBonus || 0;
};

// ================================================================
// UI: Prestige-Modal öffnen
// ================================================================
GameUI.prototype.openPrestigeModal = function() {
  const state = stateManager.state;
  const prestige = state.prestige || { totalPoints: 0, resets: 0, rank: 0 };
  const currentPoints = stateManager.calculatePrestigePoints();
  const currentRank = stateManager.getCurrentPrestigeRank();
  const nextRank = stateManager.getNextPrestigeRank();
  const totalPrestige = prestige.totalPoints;

  const progressToNext = nextRank
    ? Math.min(100, Math.round(((totalPrestige - currentRank.minPoints) / (nextRank.minPoints - currentRank.minPoints)) * 100))
    : 100;

  let ranksHtml = '';
  PRESTIGE_RANKS.forEach(rank => {
    const isUnlocked = totalPrestige >= rank.minPoints;
    const isCurrent = rank.rank === currentRank.rank;
    const bonusText = [];
    if (rank.bonus.startGold) bonusText.push(`🪙 +${rank.bonus.startGold} Startgold`);
    if (rank.bonus.productionMult) bonusText.push(`⚡ +${Math.round(rank.bonus.productionMult * 100)}% Produktion`);
    if (rank.bonus.startTroops) bonusText.push(`⚔️ +${rank.bonus.startTroops} Starttruppen`);
    if (rank.bonus.startRubies) bonusText.push(`💎 +${rank.bonus.startRubies} Startrubine`);

    ranksHtml += `
      <div style="display: flex; align-items: center; gap: 10px; padding: 8px; border-radius: 6px;
        background: ${isCurrent ? 'rgba(212,175,55,0.15)' : isUnlocked ? 'rgba(46,204,113,0.08)' : 'rgba(255,255,255,0.03)'};
        border: 1px solid ${isCurrent ? 'rgba(212,175,55,0.5)' : isUnlocked ? 'rgba(46,204,113,0.3)' : 'rgba(255,255,255,0.05)'};
        opacity: ${isUnlocked ? '1' : '0.5'};">
        <span style="font-size: 1.5rem;">${rank.icon}</span>
        <div style="flex: 1;">
          <div style="font-size: 0.85rem; font-weight: bold; color: ${isCurrent ? 'var(--color-gold-hover)' : isUnlocked ? '#2ecc71' : 'var(--color-text-muted)'};">
            ${rank.name} ${isCurrent ? '← Aktuell' : ''}
          </div>
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">
            ${rank.minPoints > 0 ? `Ab ${rank.minPoints.toLocaleString()} Prestige-Pkt.` : 'Startrang'}
          </div>
          ${bonusText.length > 0 ? `<div style="font-size: 0.7rem; color: #2ecc71; margin-top: 2px;">${bonusText.join(' | ')}</div>` : '<div style="font-size: 0.7rem; color: var(--color-text-muted);">Keine Boni</div>'}
        </div>
        ${isUnlocked ? '<span style="color: #2ecc71; font-size: 1rem;">✓</span>' : '<span style="color: var(--color-text-muted);">🔒</span>'}
      </div>
    `;
  });

  const html = `
    <h2>🌟 Prestige-System</h2>
    <p class="modal-intro">Sammle Prestige-Punkte durch Errungenschaften. Starte danach mit dauerhaften Boni neu!</p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px;">
      <div class="glass-card" style="padding: 15px; text-align: center;">
        <div style="font-size: 1.8rem;">${currentRank.icon}</div>
        <div style="font-size: 0.9rem; font-weight: bold; color: var(--color-gold-hover); margin-top: 4px;">${currentRank.name}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-muted);">Aktueller Rang</div>
        <div style="font-size: 0.8rem; margin-top: 4px; color: #f1c40f;">Resets: ${prestige.resets}x</div>
      </div>
      <div class="glass-card" style="padding: 15px; text-align: center;">
        <div style="font-size: 1.5rem; font-weight: bold; color: #9b59b6;">${totalPrestige.toLocaleString()}</div>
        <div style="font-size: 0.75rem; color: var(--color-text-muted);">Gesamt-Prestige</div>
        <div style="font-size: 0.85rem; margin-top: 4px; color: #f1c40f;">Dieser Run: +${currentPoints.toLocaleString()}</div>
      </div>
    </div>

    ${nextRank ? `
    <div class="glass-card" style="padding: 12px; margin-bottom: 12px;">
      <div style="display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 0.8rem;">
        <span>Fortschritt zu: ${nextRank.icon} ${nextRank.name}</span>
        <span style="color: var(--color-gold-hover);">${totalPrestige.toLocaleString()} / ${nextRank.minPoints.toLocaleString()}</span>
      </div>
      <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
        <div style="width: ${progressToNext}%; height: 100%; background: linear-gradient(90deg, #9b59b6, #f1c40f); transition: width 0.4s;"></div>
      </div>
    </div>
    ` : '<div class="glass-card" style="padding: 12px; margin-bottom: 12px; text-align: center; color: #f1c40f;">🌟 Maximaler Prestige-Rang erreicht!</div>'}

    <div class="glass-card" style="padding: 12px; margin-bottom: 15px;">
      <h3 style="margin-bottom: 10px;">🏅 Prestige-Ränge</h3>
      <div style="display: flex; flex-direction: column; gap: 6px;">
        ${ranksHtml}
      </div>
    </div>

    <div class="glass-card" style="padding: 15px; background: rgba(231, 76, 60, 0.1); border-color: rgba(231, 76, 60, 0.3); margin-bottom: 15px;">
      <h3 style="color: #e74c3c; margin-bottom: 8px;">⚠️ Prestige-Reset</h3>
      <p style="font-size: 0.8rem; margin-bottom: 10px; color: var(--color-text-muted);">
        Starte dein Reich von vorne und sammle ${currentPoints.toLocaleString()} Prestige-Punkte (Gesamt: ${(totalPrestige + currentPoints).toLocaleString()}).
        Du behältst alle bisher gesammelten Prestige-Punkte und Boni aus deinem Rang!
      </p>
      <p style="font-size: 0.8rem; margin-bottom: 10px; color: #e74c3c; font-weight: bold;">
        ⚠️ WARNUNG: Alle Gebäude, Truppen und Ressourcen werden zurückgesetzt!
      </p>
      <button id="btn-prestige-reset" class="danger-btn shadow-btn" style="width: 100%;"
        ${currentPoints < 500 ? 'disabled' : ''}>
        🌟 Prestige-Reset starten (${currentPoints.toLocaleString()} Punkte sammeln)
      </button>
      ${currentPoints < 500 ? '<p style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 5px; text-align: center;">Mindestens 500 Punkte benötigt</p>' : ''}
    </div>

    <button id="btn-prestige-close" class="primary-btn" style="width: 100%;">Schließen</button>
  `;

  this.openModal(html);

  document.getElementById('btn-prestige-close').addEventListener('click', () => this.closeModal());

  const resetBtn = document.getElementById('btn-prestige-reset');
  if (resetBtn && currentPoints >= 500) {
    resetBtn.addEventListener('click', () => {
      if (confirm(`⚠️ Bist du sicher? Du sammelst ${currentPoints.toLocaleString()} Prestige-Punkte und startest von vorne. Dies kann nicht rückgängig gemacht werden!`)) {
        if (stateManager.performPrestigeReset()) {
          this.closeModal();
          this.updateUI();
          this.showFloatingNotification(`🌟 Prestige-Reset! +${currentPoints.toLocaleString()} Prestige-Punkte gesammelt!`);
        }
      }
    });
  }
};
