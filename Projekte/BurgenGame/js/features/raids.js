// --- RAIDS & COMBAT FEATURE ---

// Extend GameStateManager with defensive battle checks
GameStateManager.prototype.checkDefensiveBattles = function(dt) {
  const keep = this.state.buildings.find(b => b.type === BUILDING_TYPES.KEEP) || { level: 1 };
  const keepLevel = keep.level || 1;

  if (!this.state.nextDefenseTime) {
    // Initial delay scaled by Keep level (20 minutes at Level 1, 8 minutes otherwise)
    const initialDelay = keepLevel === 1 ? 1200000 : 480000;
    this.state.nextDefenseTime = Date.now() + initialDelay;
  }

  if (this.state.defenseCountdown !== null) {
    this.state.defenseCountdown -= dt;
    if (this.state.defenseCountdown <= 0) {
      this.state.defenseCountdown = null;
      if (this.state.isRebelAttackPending) {
        this.state.isRebelAttackPending = false;
        this.triggerRebelRaid();
      } else {
        this.triggerRobberBaronRaid();
      }
    } else {
      this.notifyListeners('defense_countdown_tick');
    }
  } else if (this.state.happiness < 15 && (!this.state.nextRebelTime || Date.now() >= this.state.nextRebelTime)) {
    this.state.defenseCountdown = 45;
    this.state.isRebelAttackPending = true;
    this.state.nextRebelTime = Date.now() + 180000; // 3 mins cooldown
    this.save();
    this.notifyListeners('defense_countdown_started');
  } else if (Date.now() >= this.state.nextDefenseTime) {
    this.state.defenseCountdown = 60;

    // Calculate next interval dynamically based on Keep level
    let baseInterval = 600000; // 10 mins default
    let randomAdd = 300000;    // 5 mins default
    if (keepLevel === 1) {
      baseInterval = 1200000;  // 20 mins
      randomAdd = 600000;      // 10 mins
    } else if (keepLevel === 2) {
      baseInterval = 720000;   // 12 mins
      randomAdd = 240000;      // 4 mins
    } else if (keepLevel === 3) {
      baseInterval = 480000;   // 8 mins
      randomAdd = 240000;      // 4 mins
    } else {
      baseInterval = 300000;   // 5 mins
      randomAdd = 180000;      // 3 mins
    }

    this.state.nextDefenseTime = Date.now() + (baseInterval + Math.random() * randomAdd);
    this.save();
    this.notifyListeners('defense_countdown_started');
  }

  // Outpost defense checks
  if (!this.state.nextOutpostDefenseTime) {
    this.state.nextOutpostDefenseTime = Date.now() + (600000 + Math.random() * 240000); // 10 to 14 mins
  }

  if (this.state.outpostDefenseCountdown !== null && this.state.outpostUnderAttackId) {
    this.state.outpostDefenseCountdown -= dt;
    if (this.state.outpostDefenseCountdown <= 0) {
      const opId = this.state.outpostUnderAttackId;
      this.state.outpostDefenseCountdown = null;
      this.state.outpostUnderAttackId = null;
      this.triggerOutpostRaid(opId);
    } else {
      this.notifyListeners('outpost_defense_countdown_tick');
    }
  } else if (Date.now() >= this.state.nextOutpostDefenseTime) {
    // Check if player owns any outposts
    if (this.state.outposts) {
      const playerOwnedOpIds = Object.keys(this.state.outposts).filter(opId => this.state.outposts[opId].owner === 'player');
      if (playerOwnedOpIds.length > 0) {
        const randomOpId = playerOwnedOpIds[Math.floor(Math.random() * playerOwnedOpIds.length)];
        this.state.outpostDefenseCountdown = 45; // 45 seconds countdown
        this.state.outpostUnderAttackId = randomOpId;
        this.state.nextOutpostDefenseTime = Date.now() + (600000 + Math.random() * 240000);
        this.save();
        this.notifyListeners('outpost_defense_countdown_started');
      } else {
        // Try again in 2 minutes
        this.state.nextOutpostDefenseTime = Date.now() + 120000;
      }
    }
  }
  this.checkDiplomaticAttacks(dt);
};

// Extend GameStateManager with outpost raid trigger
GameStateManager.prototype.triggerOutpostRaid = function(opId) {
  const op = WORLD_MAP_CONFIG.outposts.find(o => o.id === opId);
  if (!op) return;

  // Verify player still owns it
  const opState = this.state.outposts?.[opId];
  if (!opState || opState.owner !== 'player') return;

  // Attacker strength scaled by level
  let attackers = { spearman: 0, swordsman: 0, bowman: 0, knight: 0 };
  if (op.level === 1) {
    attackers = { spearman: 5, swordsman: 2, bowman: 0, knight: 0 };
  } else if (op.level === 2) {
    attackers = { spearman: 6, swordsman: 4, bowman: 2, knight: 0 };
  } else {
    attackers = { spearman: 8, swordsman: 6, bowman: 4, knight: 2 };
  }

  this.resolveOutpostDefense(opId, attackers);
};

// Extend GameStateManager with outpost defense resolution
GameStateManager.prototype.resolveOutpostDefense = function(opId, attackers) {
  const op = WORLD_MAP_CONFIG.outposts.find(o => o.id === opId);
  const opState = this.state.outposts?.[opId];
  if (!op || !opState) return;

  let attackerMelee = 0;
  let attackerRanged = 0;
  let attackerHealth = 0;

  Object.keys(attackers).forEach(t => {
    const qty = attackers[t] || 0;
    const cfg = TROOPS_CONFIG[t]?.stats || { attackMelee: 8, attackRanged: 0 };
    attackerMelee += cfg.attackMelee * qty;
    attackerRanged += cfg.attackRanged * qty;
    attackerHealth += 100 * qty;
  });

  let defenderMeleeDefense = 0;
  let defenderRangedDefense = 0;
  let defenderHealth = 0;

  const garrison = opState.garrison || { spearman: 0, swordsman: 0, bowman: 0, knight: 0 };

  Object.keys(garrison).forEach(t => {
    const qty = garrison[t] || 0;
    const cfg = TROOPS_CONFIG[t]?.stats || { defenseMelee: 10, defenseRanged: 10 };
    
    let defBonus = 1.0;
    if (this.state.research && this.state.research.reinforced_armor) {
      defBonus += 0.10;
    }
    if (this.state.hero && this.state.hero.type === 'paladin') {
      defBonus += 0.20 + (this.state.hero.level - 1) * 0.05;
    }
    // Apply Hero garrison defense skill bonus (def_garrison)
    const heroGarrisonBonus = this.getHeroSkillBonus('garrison_defense');
    defBonus += heroGarrisonBonus;

    defenderMeleeDefense += cfg.defenseMelee * qty * defBonus;
    defenderRangedDefense += cfg.defenseRanged * qty * defBonus;
    defenderHealth += 100 * qty;
  });

  const totalAttack = attackerMelee + attackerRanged;
  const totalDefense = defenderMeleeDefense + defenderRangedDefense;

  let isPlayerVictory = totalDefense > totalAttack;
  let playerCasualties = { spearman: 0, swordsman: 0, bowman: 0, knight: 0 };
  let reportText = "";

  if (isPlayerVictory) {
    const lossRatio = Math.min(0.8, totalAttack / (totalDefense * 1.5));
    let healthLost = defenderHealth * lossRatio;
    let soldiersKilled = Math.floor(healthLost / 100);

    let totalSent = Object.values(garrison).reduce((a, b) => a + b, 0);
    if (totalSent > 0) {
      Object.keys(garrison).forEach(t => {
        let count = garrison[t];
        if (count > 0) {
          let portion = count / totalSent;
          let killed = Math.min(count, Math.round(soldiersKilled * portion));
          playerCasualties[t] = killed;
          garrison[t] -= killed;
        }
      });
    }

    reportText = `Außenposten erfolgreich verteidigt! Deine Garnison auf dem Außenposten ${op.name} hat den Angriff der Raubritter zurückgeschlagen.`;
  } else {
    // Garrison wiped out
    Object.keys(garrison).forEach(t => {
      playerCasualties[t] = garrison[t];
      garrison[t] = 0;
    });

    opState.owner = 'npc';
    reportText = `Außenposten verloren! Die Truppen der Raubritter haben deine Garnison auf dem Außenposten ${op.name} überrannt und den Außenposten zurückerobert.`;
  }

  const survivorsCopy = { ...garrison };

  const defenseReport = {
    victory: isPlayerVictory,
    isDefenseReport: true,
    isOutpostDefense: true,
    title: isPlayerVictory ? 'Außenposten verteidigt' : 'Außenposten verloren',
    text: reportText,
    targetName: op.name,
    targetLevel: op.level,
    troopsSent: { ...attackers }, // Draw attackers on the right
    casualties: playerCasualties,
    survivors: survivorsCopy,
    loot: { gold: 0, wood: 0, stone: 0, rubies: 0 },
    time: Date.now()
  };

  if (!this.state.battleReports) this.state.battleReports = [];
  this.state.battleReports.unshift(defenseReport);
  this.state.latestUnreadReport = defenseReport;

  this.save();
  this.notifyListeners('defense_resolved');
};

// Extend GameStateManager with Robber Baron raid trigger
GameStateManager.prototype.triggerRobberBaronRaid = function() {
  const keep = this.state.buildings.find(b => b.type === BUILDING_TYPES.KEEP) || { level: 1 };
  const keepLvl = keep.level;

  const attackers = {
    spearman: Math.max(2, keepLvl * 2),
    swordsman: Math.max(0, (keepLvl - 1) * 2),
    bowman: Math.max(0, (keepLvl - 2) * 2),
    knight: keepLvl >= 3 ? Math.max(0, (keepLvl - 2) * 2) : 0,
    ram: keepLvl >= 3 ? Math.floor(keepLvl / 2) : 0,
    catapult: keepLvl >= 4 ? Math.floor(keepLvl / 3) : 0
  };

  const raidMission = {
    id: `raid_${Date.now()}`,
    type: 'counter-attack',
    targetId: 1, // Raubritter L1
    status: 'traveling',
    departureTime: Date.now(),
    duration: 0,
    troopsSent: attackers,
    loot: { gold: 0, wood: 0, stone: 0, rubies: 0 }
  };

  this.resolveDefense(raidMission);
};

// Extend GameStateManager with counter-attack dispatching
GameStateManager.prototype.dispatchCounterAttack = function(npc) {
  const missionId = `counter_${Date.now()}`;
  const newMission = {
    id: missionId,
    type: 'counter-attack',
    targetId: npc.id,
    status: 'traveling',
    departureTime: Date.now(),
    duration: npc.travelTime,
    troopsSent: { ...npc.defenders },
    loot: { gold: 0, wood: 0, stone: 0, rubies: 0 }
  };
  this.state.missions.push(newMission);
};

// Extend GameStateManager with defense resolution
GameStateManager.prototype.resolveDefense = function(mission) {
  const npc = mission.isDiplomaticRaid ? null : WORLD_MAP_CONFIG.npcCastles.find(c => c.id === mission.targetId);
  if (!npc && !mission.isDiplomaticRaid) return;

  let attackerMelee = 0;
  let attackerRanged = 0;
  let attackerHealth = 0;

  Object.keys(mission.troopsSent).forEach(t => {
    const qty = mission.troopsSent[t] || 0;
    const cfg = TROOPS_CONFIG[t]?.stats || { attackMelee: 8, attackRanged: 0 };
    attackerMelee += cfg.attackMelee * qty;
    attackerRanged += cfg.attackRanged * qty;
    attackerHealth += 100 * qty;
  });

  let defenderMeleeDefense = 0;
  let defenderRangedDefense = 0;
  let defenderHealth = 0;

  Object.keys(this.state.troops).forEach(t => {
    const qty = this.state.troops[t] || 0;
    if (t === 'spy') return;
    const cfg = TROOPS_CONFIG[t]?.stats || { defenseMelee: 10, defenseRanged: 10 };
    
    let defBonus = 1.0;
    if (this.state.research && this.state.research.reinforced_armor) {
      defBonus += 0.10;
    }
    if (this.state.hero && this.state.hero.type === 'paladin') {
      defBonus += 0.20 + (this.state.hero.level - 1) * 0.05;
    }
    // Apply Hero garrison defense skill bonus (def_garrison)
    const heroGarrisonBonus = this.getHeroSkillBonus('garrison_defense');
    defBonus += heroGarrisonBonus;

    defenderMeleeDefense += cfg.defenseMelee * qty * defBonus;
    defenderRangedDefense += cfg.defenseRanged * qty * defBonus;
    defenderHealth += 100 * qty;
  });

  let wallBonus = 0;
  this.state.buildings.forEach(b => {
    if (b.type === BUILDING_TYPES.WALL && !b.underConstruction) {
      const cfg = BUILDINGS_CONFIG[BUILDING_TYPES.WALL].levels[b.level];
      if (cfg?.defenseBonus) wallBonus += cfg.defenseBonus;
    }
  });

  // Apply Hero wall defense skill bonus (def_wall)
  const heroWallBonus = this.getHeroSkillBonus('wall_defense');
  wallBonus += heroWallBonus;

  // Calculate total wallKonter from attacking troops (NPCs)
  let totalWallKonter = 0;
  Object.keys(mission.troopsSent).forEach(t => {
    const qty = mission.troopsSent[t] || 0;
    const cfg = TROOPS_CONFIG[t]?.stats;
    if (cfg && cfg.wallKonter) {
      totalWallKonter += cfg.wallKonter * qty;
    }
  });

  const activeWallBonus = Math.max(0, wallBonus - totalWallKonter);

  const totalAttack = attackerMelee + attackerRanged;
  let totalDefense = defenderMeleeDefense + defenderRangedDefense;
  totalDefense *= (1 + activeWallBonus);

  let isPlayerVictory = totalDefense > totalAttack;
  let playerCasualties = { spearman: 0, swordsman: 0, bowman: 0, knight: 0, spy: 0, ram: 0, catapult: 0 };
  let reportText = "";
  const plundered = { gold: 0, wood: 0, stone: 0 };

  const attackerName = mission.isDiplomaticRaid ? mission.customAttackerName : (npc ? npc.name : 'Unbekannter Angreifer');
  const attackerLevel = mission.isDiplomaticRaid ? 5 : (npc ? npc.level : 1);

  if (isPlayerVictory) {
    const lossRatio = Math.min(0.8, totalAttack / (totalDefense * 1.5));
    let healthLost = defenderHealth * lossRatio;
    let soldiersKilled = Math.floor(healthLost / 100);

    let totalSent = Object.keys(this.state.troops).reduce((a, b) => b === 'spy' ? a : a + this.state.troops[b], 0);
    if (totalSent > 0) {
      Object.keys(this.state.troops).forEach(t => {
        if (t === 'spy') return;
        let count = this.state.troops[t];
        if (count > 0) {
          let portion = count / totalSent;
          let killed = Math.min(count, Math.round(soldiersKilled * portion));
          playerCasualties[t] = killed;
          this.state.troops[t] -= killed;
        }
      });
    }

    reportText = `Erfolgreiche Verteidigung! Deine Garnison hat den Angriff von ${attackerName} an deinen Burgmauern zurückgeschlagen.`;
  } else {
    Object.keys(this.state.troops).forEach(t => {
      if (t === 'spy') return;
      playerCasualties[t] = this.state.troops[t];
      this.state.troops[t] = 0;
    });

    plundered.gold = Math.min(Math.floor(this.state.resources.gold * 0.3), 150);
    plundered.wood = Math.min(Math.floor(this.state.resources.wood * 0.25), 250);
    plundered.stone = Math.min(Math.floor(this.state.resources.stone * 0.25), 200);

    this.state.resources.gold -= plundered.gold;
    this.state.resources.wood -= plundered.wood;
    this.state.resources.stone -= plundered.stone;

    reportText = `Niederlage bei der Verteidigung! Die Truppen von ${attackerName} haben deine Verteidigung durchbrochen und deine Vorräte geplündert: -🪙 ${plundered.gold}, -🪵 ${plundered.wood}, -🪨 ${plundered.stone}.`;
  }

  let lootAwarded = { gold: 0, wood: 0, stone: 0 };
  if (isPlayerVictory) {
    lootAwarded = { gold: 50, wood: 100, stone: 100 };
    this.state.resources.gold += lootAwarded.gold;
    this.state.resources.wood += lootAwarded.wood;
    this.state.resources.stone += lootAwarded.stone;
    reportText += ` Beute geborgen: +🪙 ${lootAwarded.gold}, +🪵 ${lootAwarded.wood}, +🪨 ${lootAwarded.stone}!`;
  }

  const defenseReport = {
    victory: isPlayerVictory,
    isDefenseReport: true,
    title: isPlayerVictory ? 'Angriff abgewehrt' : 'Burg geplündert',
    text: reportText,
    targetName: attackerName,
    targetLevel: attackerLevel,
    troopsSent: { ...mission.troopsSent },
    casualties: playerCasualties,
    loot: isPlayerVictory ? lootAwarded : { gold: -plundered.gold, wood: -plundered.wood, stone: -plundered.stone, rubies: 0 },
    time: Date.now()
  };

  if (!this.state.battleReports) this.state.battleReports = [];
  this.state.battleReports.unshift(defenseReport);
  this.state.latestUnreadReport = defenseReport;

  // Counter attack mission finishes, remove it
  this.state.missions = this.state.missions.filter(item => item.id !== mission.id);

  this.save();
  this.notifyListeners('defense_resolved');
};

// Extend GameUI with visual battle modal
GameUI.prototype.openVisualBattleModal = function(report) {
  const isDefense = !!report.isDefenseReport;
  const npc = !isDefense ? (WORLD_MAP_CONFIG.npcCastles.find(c => c.name === report.targetName) || { defenders: { spearman: 5 } }) : null;
  const defenders = npc ? npc.defenders : null;

  if (window.gameSound) {
    gameSound.setTheme('battle');
  }

  const html = `
    <div class="battle-arena-modal" style="display: flex; flex-direction: column; max-width: 850px; width: 100%;">
      <h2>${isDefense ? (report.isOutpostDefense ? 'Verteidigung von ' + report.targetName : 'Burgverteidigung!') : 'Schlacht um ' + report.targetName}</h2>
      <div class="battle-layout" style="display: flex; gap: 15px; margin-top: 10px;">
        <div class="battle-canvas-container" style="flex-grow: 1;">
          <canvas id="battle-anim-canvas" width="550" height="300" style="border: 2px solid var(--color-gold-primary); display: block; margin: 0 auto;"></canvas>
        </div>
        <div class="battle-log-side-panel glass-card" style="width: 240px; height: 300px; display: flex; flex-direction: column; padding: 12px; box-sizing: border-box; background: rgba(0,0,0,0.5);">
          <h4 style="margin: 0 0 8px 0; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 4px; font-family: var(--font-header); color: var(--color-gold-hover);">📜 Schlachtverlauf</h4>
          <div id="battle-logs-list" style="flex-grow: 1; overflow-y: auto; font-size: 0.72rem; text-align: left; line-height: 1.4; max-height: 240px;">
            <div style="color: #2ecc71;">Schlacht begonnen! Deine Runde.</div>
          </div>
        </div>
      </div>
      <div class="battle-controls" style="display: flex; justify-content: space-between; margin-top: 15px;">
        <button id="btn-battle-end-turn" class="primary-btn" style="padding: 8px 16px;">Runde beenden</button>
        <button id="btn-battle-skip" class="primary-btn" style="padding: 8px 16px; border-color: #7f8c8d;">Schlacht überspringen</button>
      </div>
    </div>
  `;

  stateManager.initBattleCards();
  const cards = stateManager.state.battleCards;
  const cardsHtml = `
    <div class="battle-cards-panel" style="display: flex; justify-content: center; gap: 10px; margin-top: 10px; padding: 6px; background: rgba(0,0,0,0.3); border-radius: 4px;">
      <span style="font-size: 0.8rem; align-self: center; font-weight: bold; color: var(--color-gold-hover);">🎴 Kampfkarten:</span>
      <button id="btn-combat-card-heal" class="primary-btn" style="font-size: 0.72rem; padding: 4px 8px; border-color: #2ecc71;" ${cards.heal > 0 ? '' : 'disabled'}>💚 Heilung (x<span id="cc-count-heal">${cards.heal}</span>)</button>
      <button id="btn-combat-card-shield" class="primary-btn" style="font-size: 0.72rem; padding: 4px 8px; border-color: #3498db;" ${cards.shield > 0 ? '' : 'disabled'}>🛡️ Schildwall (x<span id="cc-count-shield">${cards.shield}</span>)</button>
      <button id="btn-combat-card-arrow" class="primary-btn" style="font-size: 0.72rem; padding: 4px 8px; border-color: #e74c3c;" ${cards.arrow > 0 ? '' : 'disabled'}>🏹 Pfeilhagel (x<span id="cc-count-arrow">${cards.arrow}</span>)</button>
    </div>
  `;

  const finalHtml = html.replace('</div>\n      <div class="battle-controls"', `${cardsHtml}</div>\n      <div class="battle-controls"`);

  this.openModal(finalHtml);

  const canvas = document.getElementById('battle-anim-canvas');
  if (!canvas) return;

  const onBattleComplete = () => {
    report.actionLogs = [...tacticalBattle.actionLogs];
    if (window.gameSound) {
      gameSound.setTheme(gameCanvas.view === VIEWS.CASTLE ? 'castle' : 'world_map');
    }
    this.closeModal();
    this.openBattleReportModal(report);
  };

  const tacticalBattle = new TacticalCombat(canvas, stateManager, this, report, isDefense, onBattleComplete);

  const updateCardsUI = () => {
    const curCards = stateManager.state.battleCards;
    ['heal', 'shield', 'arrow'].forEach(cardId => {
      const btn = document.getElementById(`btn-combat-card-${cardId}`);
      const countEl = document.getElementById(`cc-count-${cardId}`);
      if (btn && countEl) {
        countEl.textContent = curCards[cardId] || 0;
        if ((curCards[cardId] || 0) <= 0) {
          btn.disabled = true;
        }
      }
    });
  };

  ['heal', 'shield', 'arrow'].forEach(cardId => {
    const btn = document.getElementById(`btn-combat-card-${cardId}`);
    if (btn) {
      btn.addEventListener('click', () => {
        if (tacticalBattle.useCard(cardId)) {
          updateCardsUI();
        }
      });
    }
  });

  // Hook into actionLogs.push to update side panel in real-time
  if (tacticalBattle.actionLogs) {
    const updateLogsUI = () => {
      const listEl = document.getElementById('battle-logs-list');
      if (listEl) {
        listEl.innerHTML = tacticalBattle.actionLogs.map(log => {
          let color = '#fff';
          if (log.includes('besiegt') || log.includes('verloren') || log.includes('Niederlage')) color = '#e74c3c';
          else if (log.includes('Sieg') || log.includes('bereit') || log.includes('erfolgreich') || log.includes('gewonnen')) color = '#2ecc71';
          else if (log.includes('greift') || log.includes('HP') || log.includes('Schaden')) color = '#f1c40f';
          return `<div style="color: ${color}; margin-bottom: 5px; border-bottom: 1px dashed rgba(255,255,255,0.06); padding-bottom: 3px;">${log}</div>`;
        }).join('');
        listEl.scrollTop = listEl.scrollHeight;
      }
    };
    const originalPush = tacticalBattle.actionLogs.push;
    tacticalBattle.actionLogs.push = function(...args) {
      const ret = originalPush.apply(this, args);
      updateLogsUI();
      return ret;
    };
    updateLogsUI();
  }

  // Gameloop für Rendering
  const loop = () => {
    tacticalBattle.draw();
    if (tacticalBattle.turn === 'player' || tacticalBattle.turn === 'enemy') {
      requestAnimationFrame(loop);
    }
  };
  requestAnimationFrame(loop);

  document.getElementById('btn-battle-end-turn').addEventListener('click', () => {
    if (tacticalBattle.turn === 'player') {
      tacticalBattle.endTurn();
    }
  });

  document.getElementById('btn-battle-skip').addEventListener('click', onBattleComplete);
  return;
};

// Extend GameUI with battle report modal
GameUI.prototype.openBattleReportModal = function(report) {
  let subTitle = `Kampf gegen: <strong>${report.targetName}</strong> (Stufe ${report.targetLevel})`;
  if (report.isSpyReport) {
    subTitle = `Spionagebericht für: <strong>${report.targetName}</strong>`;
  } else if (report.isDefenseReport) {
    subTitle = `Garnisons-Verteidigungsbericht gegen: <strong>${report.targetName}</strong>`;
  }

  let columnsHtml = "";

  if (report.isSpyReport) {
    columnsHtml = `
      <div class="report-flex">
        <div class="report-col">
          <h3>Spion-Verluste</h3>
          <ul class="loss-list">
            <li>Spion: <strong class="negative">${report.casualties.spy || 0}</strong></li>
          </ul>
        </div>
        <div class="report-col">
          <h3>Ergebnis</h3>
          <p style="font-size: 0.8rem; line-height: 1.4;">
            ${report.victory 
              ? `Die genaue Stärke von <strong>${report.targetName}</strong> ist nun für 5 Minuten auf der Weltkarte sichtbar.`
              : 'Alle entsandten Spione wurden gefasst.'
            }
          </p>
        </div>
      </div>
    `;
  } else if (report.isDefenseReport) {
    const isOutpost = !!report.isOutpostDefense;
    columnsHtml = `
      <div class="report-flex">
        <div class="report-col">
          <h3>Deine Verluste</h3>
          <ul class="loss-list">
            ${Object.keys(report.casualties).map(t => {
              const count = report.casualties[t] || 0;
              return count > 0 ? `<li>${TROOPS_CONFIG[t].name}: <strong class="negative">${count}</strong></li>` : '';
            }).join('') || '<li>Keine Verluste</li>'}
          </ul>
        </div>
        <div class="report-col">
          <h3>${isOutpost ? 'Auswirkung' : 'Plünderungen'}</h3>
          <p style="font-size: 0.8rem; line-height: 1.4; color: var(--color-text-muted);">
            ${isOutpost
              ? (report.victory 
                 ? `Die Garnison konnte den Außenposten verteidigen. Er verbleibt in deinem Besitz.`
                 : `Der Außenposten wurde von den Raubrittern überrannt. Die Kontrolle ging verloren.`)
              : (report.loot && (report.loot.gold < 0 || report.loot.wood < 0 || report.loot.stone < 0)
                 ? `Gold: <strong class="negative">${report.loot.gold}</strong><br>Holz: <strong class="negative">${report.loot.wood}</strong><br>Stein: <strong class="negative">${report.loot.stone}</strong>`
                 : 'Keine Ressourcen geplündert.')
            }
          </p>
        </div>
      </div>
    `;
  } else {
    columnsHtml = `
      <div class="report-flex">
        <div class="report-col">
          <h3>Deine Verluste</h3>
          <ul class="loss-list">
            ${Object.keys(report.casualties).map(t => {
              const count = report.casualties[t] || 0;
              return count > 0 ? `<li>${TROOPS_CONFIG[t].name}: <strong class="negative">${count}</strong></li>` : '';
            }).join('') || '<li>Keine Verluste</li>'}
          </ul>
        </div>
        <div class="report-col">
          <h3>Beute</h3>
          <ul class="loot-list">
            <li>🪙 Gold: <strong class="positive">+${report.loot.gold || 0}</strong></li>
            <li>🪵 Holz: <strong class="positive">+${report.loot.wood || 0}</strong></li>
            <li>🪨 Stein: <strong class="positive">+${report.loot.stone || 0}</strong></li>
            <li>💎 Rubine: <strong class="positive">+${report.loot.rubies || 0}</strong></li>
          </ul>
        </div>
      </div>
    `;
  }

  let combatLogsHtml = "";
  if (report.actionLogs && report.actionLogs.length > 0) {
    combatLogsHtml = `
      <div style="margin-top: 15px; text-align: left;">
        <h4 style="margin: 0 0 6px 0; color: var(--color-gold-hover);">📜 Runden-Protokoll</h4>
        <div class="glass-card" style="max-height: 100px; overflow-y: auto; font-size: 0.72rem; padding: 10px; line-height: 1.4; background: rgba(0,0,0,0.3);">
          ${report.actionLogs.map(log => `<div>${log}</div>`).join('')}
        </div>
      </div>
    `;
  }

  const playerCasualties = report.casualties || {};
  const totalPlayerLosses = Object.values(playerCasualties).reduce((sum, count) => sum + count, 0);

  let chartHtml = "";
  if (!report.isSpyReport) {
    chartHtml = `
      <div style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
        <h4 style="margin: 0 0 6px 0; color: var(--color-gold-hover); font-size: 0.85rem;">📊 Verlust-Gegenüberstellung</h4>
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 0.75rem;">
          <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span>Verlorene Truppen</span>
              <strong>${totalPlayerLosses} Einheiten</strong>
            </div>
            <div style="height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; overflow: hidden;">
              <div style="width: ${Math.min(100, Math.max(5, (totalPlayerLosses / 20) * 100))}%; height: 100%; background: #e74c3c;"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  let html = `
    <h2 class="${report.victory ? 'victory-title' : 'defeat-title'}">${report.title}</h2>
    <p class="combat-report-sub">${subTitle}</p>
    <div class="report-box glass-card">
      <p class="battle-text-summary">${report.text}</p>
      ${columnsHtml}
      ${chartHtml}
      ${combatLogsHtml}
    </div>
    <button id="btn-report-ok" class="primary-btn gold-btn" style="margin-top: 15px; width: 100%;">Schließen</button>
  `;

  this.openModal(html);
  document.getElementById('btn-report-ok').addEventListener('click', () => this.closeModal());
};

// Check for diplomatic hostile nation attacks
GameStateManager.prototype.checkDiplomaticAttacks = function(dt) {
  if (!this.state.diplomacy) return;

  const hostileNations = Object.keys(this.state.diplomacy).filter(nid => {
    return this.state.diplomacy[nid].relation <= -60;
  });

  if (hostileNations.length === 0) {
    this.state.diplomaticRaidCountdown = null;
    this.state.diplomaticAttackingNationId = null;
    return;
  }

  if (!this.state.nextDiplomaticRaidTime) {
    this.state.nextDiplomaticRaidTime = Date.now() + 300000 + Math.random() * 300000;
  }

  if (this.state.diplomaticRaidCountdown !== null && this.state.diplomaticAttackingNationId) {
    this.state.diplomaticRaidCountdown -= dt;
    if (this.state.diplomaticRaidCountdown <= 0) {
      const nid = this.state.diplomaticAttackingNationId;
      this.state.diplomaticRaidCountdown = null;
      this.state.diplomaticAttackingNationId = null;
      this.triggerDiplomaticRaid(nid);
    } else {
      this.notifyListeners('diplomatic_raid_tick');
    }
  } else if (Date.now() >= this.state.nextDiplomaticRaidTime) {
    const randomNid = hostileNations[Math.floor(Math.random() * hostileNations.length)];
    this.state.diplomaticRaidCountdown = 45;
    this.state.diplomaticAttackingNationId = randomNid;
    this.state.nextDiplomaticRaidTime = Date.now() + 600000 + Math.random() * 300000;
    this.save();
    this.notifyListeners('diplomatic_raid_started');
  }
};

// Trigger a diplomatic attack
GameStateManager.prototype.triggerDiplomaticRaid = function(nationId) {
  const nation = AI_NATIONS_CONFIG.find(n => n.id === nationId);
  if (!nation) return;

  let attackers = {};
  if (nation.id === 'kingdom_north') {
    attackers = { swordsman: 12, bowman: 8, knight: 4, ram: 1 };
  } else if (nation.id === 'republic_south') {
    attackers = { spearman: 10, swordsman: 6, bowman: 4, knight: 2 };
  } else {
    attackers = { spearman: 8, swordsman: 4, bowman: 6, knight: 1 };
  }

  const raidMission = {
    id: `dip_raid_${Date.now()}`,
    type: 'counter-attack',
    targetId: 100,
    status: 'traveling',
    departureTime: Date.now(),
    duration: 0,
    troopsSent: attackers,
    loot: { gold: 0, wood: 0, stone: 0, rubies: 0 },
    customAttackerName: nation.name,
    isDiplomaticRaid: true
  };

  this.resolveDefense(raidMission);
};

// Trigger a Rebel Raid
GameStateManager.prototype.triggerRebelRaid = function() {
  const pop = Math.floor(this.state.population || 10);
  const attackers = {
    spearman: Math.max(2, Math.floor(pop / 10)),
    swordsman: Math.max(1, Math.floor(pop / 15)),
    bowman: Math.max(0, Math.floor(pop / 20))
  };

  const raidMission = {
    id: `rebel_${Date.now()}`,
    type: 'counter-attack',
    isRebelAttack: true,
    customAttackerName: 'Rebellen-Bauern',
    targetId: 99,
    status: 'traveling',
    departureTime: Date.now(),
    duration: 0,
    troopsSent: attackers,
    loot: { gold: 0, wood: 0, stone: 0, rubies: 0 },
    isDiplomaticRaid: true
  };

  this.resolveDefense(raidMission);
};

GameStateManager.prototype.spawnTitanRaid = function() {
  if (!this.state.activeTitan) {
    this.state.activeTitan = {
      id: `titan_${Date.now()}`,
      name: '🌋 Uralter Erdtitan Level 100',
      hp: 5000,
      maxHp: 5000,
      rewardGold: 5000,
      rewardGems: 50
    };
  }
  this.save();
  this.notifyListeners('titan_spawned');
  return this.state.activeTitan;
};

GameStateManager.prototype.attackTitanWorldBoss = function(troopsSent = { spearman: 10, knight: 5 }) {
  if (!this.state.activeTitan) this.spawnTitanRaid();
  const titan = this.state.activeTitan;

  let playerPower = 0;
  Object.keys(troopsSent).forEach(t => {
    playerPower += (troopsSent[t] || 0) * 20;
  });

  titan.hp = Math.max(0, titan.hp - playerPower);
  let defeated = titan.hp === 0;

  if (defeated) {
    this.state.resources.gold = (this.state.resources.gold || 0) + titan.rewardGold;
    this.state.resources.gems = (this.state.resources.gems || 0) + titan.rewardGems;
    this.state.activeTitan = null;
  }
  this.save();
  this.notifyListeners('titan_attacked');

  return {
    success: true,
    damageDealt: playerPower,
    remainingHp: titan ? titan.hp : 0,
    defeated,
    msg: defeated ? `🌋 Titan VERNICHTET! Belohnung: +${titan.rewardGold} Gold & +${titan.rewardGems} Edelsteine!` : `💥 Titan attackiert! ${playerPower} Schaden zugefügt!`
  };
};

