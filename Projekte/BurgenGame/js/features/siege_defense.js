// --- SIEGE & WALL DEFENSE SYSTEM ---

// Weist Einheiten den Mauerslots zu
GameStateManager.prototype.assignTroopsToWalls = function(type, count) {
  if (!this.state.wallGarrison) {
    this.state.wallGarrison = {};
  }

  const freeCount = this.state.troops[type] || 0;
  if (freeCount < count) return false;

  this.state.troops[type] -= count;
  this.state.wallGarrison[type] = (this.state.wallGarrison[type] || 0) + count;

  this.save();
  this.notifyListeners('wall_garrison_updated');
  return true;
};

// Holt Einheiten von den Mauerslots zurück
GameStateManager.prototype.retrieveTroopsFromWalls = function(type, count) {
  if (!this.state.wallGarrison || !this.state.wallGarrison[type]) return false;
  
  const assigned = this.state.wallGarrison[type];
  if (assigned < count) return false;

  this.state.wallGarrison[type] -= count;
  this.state.troops[type] = (this.state.troops[type] || 0) + count;

  this.save();
  this.notifyListeners('wall_garrison_updated');
  return true;
};

// Gibt den maximalen Mauerslot-Platz zurück (basierend auf gebauten Mauern)
GameStateManager.prototype.getMaxWallSlots = function() {
  const wallsCount = this.state.buildings.filter(b => b.type === BUILDING_TYPES.WALL && !b.underConstruction).length;
  return wallsCount * 4; // 4 Slots pro Kachel Burgmauer
};

// UI: Mauergarnison-Management Modal öffnen
GameUI.prototype.openWallDefenseModal = function() {
  const state = stateManager.state;
  if (!state.wallGarrison) state.wallGarrison = {};

  const maxSlots = stateManager.getMaxWallSlots();
  const currentAssigned = Object.values(state.wallGarrison).reduce((a, b) => a + b, 0);

  let troopsRowsHtml = '';
  const defendableTypes = ['bowman', 'border_guard', 'spearman'];

  defendableTypes.forEach(t => {
    const assigned = state.wallGarrison[t] || 0;
    const available = state.troops[t] || 0;
    const name = TROOPS_CONFIG[t]?.name || t;

    troopsRowsHtml += `
      <div class="glass-card" style="padding: 12px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
        <div>
          <strong>${name}</strong>
          <div style="font-size: 0.75rem; color: var(--color-text-muted);">
            Stationiert: <span style="color: var(--color-gold-hover);">${assigned}</span> | Reserve: ${available}
          </div>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="primary-btn btn-assign-wall" data-type="${t}" ${available > 0 && currentAssigned < maxSlots ? '' : 'disabled'} style="font-size: 0.75rem; padding: 4px 8px;">
            ➕ Stationieren
          </button>
          <button class="primary-btn danger-btn btn-retrieve-wall" data-type="${t}" ${assigned > 0 ? '' : 'disabled'} style="font-size: 0.75rem; padding: 4px 8px;">
            ➖ Abziehen
          </button>
        </div>
      </div>
    `;
  });

  const html = `
    <h2>🧱 Burgmauer-Verteidigung</h2>
    <p class="modal-intro">Stationiere Verteidiger direkt auf den Zinnen deiner Burgmauern. Jede Kachel Burgmauer bietet Platz für 4 Soldaten.</p>

    <div class="glass-card" style="padding: 15px; margin-bottom: 15px; text-align: center;">
      <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-gold-hover);">${currentAssigned} / ${maxSlots}</div>
      <div style="font-size: 0.8rem; color: var(--color-text-muted);">Belegte Mauerslots</div>
      <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-top: 6px; overflow: hidden;">
        <div style="width: ${maxSlots > 0 ? (currentAssigned / maxSlots) * 100 : 0}%; height: 100%; background: #2ecc71;"></div>
      </div>
    </div>

    ${troopsRowsHtml}

    <div class="glass-card" style="padding: 12px; margin-top: 15px; background: rgba(212,175,55,0.08); border-color: rgba(212,175,55,0.3);">
      <h4 style="margin-bottom: 6px; color: var(--color-gold-hover);">💡 Taktischer Vorteil</h4>
      <p style="font-size: 0.75rem; color: var(--color-text-muted); line-height: 1.35; margin: 0;">
        Soldaten auf Mauern erhalten im Falle eines Raubritter-Überfalls einen permanenten <strong>Verteidigungsbonus von +35%</strong>. Fernkämpfer fügen anrückenden Feinden außerdem früher Schaden zu.
      </p>
    </div>

    <button id="btn-wall-close" class="primary-btn gold-btn" style="margin-top: 15px; width: 100%;">Schließen</button>
  `;

  this.openModal(html);
  document.getElementById('btn-wall-close').addEventListener('click', () => this.closeModal());

  document.querySelectorAll('.btn-assign-wall').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.target.getAttribute('data-type');
      if (stateManager.assignTroopsToWalls(type, 1)) {
        this.openWallDefenseModal();
        this.showFloatingNotification('Soldat auf der Burgmauer stationiert.');
      }
    });
  });

  document.querySelectorAll('.btn-retrieve-wall').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.target.getAttribute('data-type');
      if (stateManager.retrieveTroopsFromWalls(type, 1)) {
        this.openWallDefenseModal();
        this.showFloatingNotification('Soldat von der Burgmauer abgezogen.');
      }
    });
  });
};

// Trigger defensive siege battle in main castle
GameUI.prototype.triggerDefensiveSiege = function() {
  const state = stateManager.state;
  if (window.gameSound) {
    gameSound.setTheme('battle');
  }

  // Determine attack troops (bandits)
  const enemyTroops = {
    swordsman: 3,
    bowman: 2,
    knight: 1
  };

  // Determine player defenders (garrison on walls, if empty, take some default or city guards)
  const wallGarrison = state.wallGarrison || {};
  const hasGarrison = Object.values(wallGarrison).reduce((a, b) => a + b, 0) > 0;

  let troopsSent = {};
  if (hasGarrison) {
    troopsSent = { ...wallGarrison };
  } else {
    // Fallback: spawn 3 spearmen as default town guard if no garrison is stationed
    troopsSent = { spearman: 3 };
  }

  const report = {
    targetName: 'Hauptburg (Verteidigung)',
    isSiegeDefense: true,
    isDefenseReport: true,
    troopsSent: troopsSent, // player units (defenders)
    defenders: enemyTroops,  // enemy units (attackers)
    victory: false,
    actionLogs: []
  };

  const html = `
    <div class="battle-arena-modal" style="display: flex; flex-direction: column; max-width: 850px; width: 100%;">
      <h2 style="color: #e74c3c; animation: pulse 1.5s infinite;">🚨 Warnung! Banditen belagern deine Hauptburg!</h2>
      <p class="modal-intro">Eine Horde Banditen greift die Mauern deiner Burg an. Deine stationierten Soldaten verteidigen die Festung!</p>
      <div class="battle-layout" style="display: flex; gap: 15px; margin-top: 10px;">
        <div class="battle-canvas-container" style="flex-grow: 1;">
          <canvas id="battle-anim-canvas" width="550" height="300" style="border: 2px solid #e74c3c; display: block; margin: 0 auto;"></canvas>
        </div>
        <div class="battle-log-side-panel glass-card" style="width: 240px; height: 300px; display: flex; flex-direction: column; padding: 12px; box-sizing: border-box; background: rgba(0,0,0,0.5);">
          <h4 style="margin: 0 0 8px 0; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 4px; font-family: var(--font-header); color: #e74c3c;">📜 Kampfverlauf</h4>
          <div id="battle-logs-list" style="flex-grow: 1; overflow-y: auto; font-size: 0.72rem; text-align: left; line-height: 1.4; max-height: 240px;">
            <div style="color: #e74c3c;">Die Banditen stürmen an!</div>
          </div>
        </div>
      </div>
      <div class="battle-controls" style="display: flex; justify-content: space-between; margin-top: 15px;">
        <button id="btn-battle-end-turn" class="primary-btn" style="padding: 8px 16px;">Runde beenden</button>
        <button id="btn-battle-skip" class="primary-btn" style="padding: 8px 16px; border-color: #7f8c8d;">Automatisch auflösen</button>
      </div>
    </div>
  `;

  this.openModal(html);

  const canvas = document.getElementById('battle-anim-canvas');
  if (!canvas) return;

  const onBattleComplete = () => {
    if (window.gameSound) {
      gameSound.setTheme('castle');
    }
    this.closeModal();

    if (report.victory) {
      state.resources.gold += 150;
      state.resources.stone += 100;
      stateManager.save();
      this.showToast('Erfolgreich verteidigt! Belohnung erhalten: 🪙 150 Gold, 🪨 100 Stein', 'success');
    } else {
      state.resources.gold = Math.max(0, state.resources.gold - 200);
      state.resources.food = Math.max(0, state.resources.food - 300);
      stateManager.save();
      this.showToast('Niederlage! Die Banditen haben deine Lager geplündert: -200 Gold, -300 Nahrung', 'error');
    }
  };

  const tacticalBattle = new TacticalCombat(canvas, stateManager, this, report, true, onBattleComplete);

  // Hook side logs
  if (tacticalBattle.actionLogs) {
    const updateLogsUI = () => {
      const listEl = document.getElementById('battle-logs-list');
      if (listEl) {
        listEl.innerHTML = tacticalBattle.actionLogs.map(log => {
          let color = '#fff';
          if (log.includes('besiegt') || log.includes('verloren') || log.includes('Niederlage')) color = '#e74c3c';
          else if (log.includes('Sieg') || log.includes('bereit') || log.includes('erfolgreich') || log.includes('gewonnen')) color = '#2ecc71';
          else if (log.includes('greift') || log.includes('HP') || log.includes('Schaden') || log.includes('trifft')) color = '#f1c40f';
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

  // Loop
  const loop = () => {
    if (tacticalBattle.active) {
      tacticalBattle.draw();
      requestAnimationFrame(loop);
    }
  };
  tacticalBattle.active = true;
  requestAnimationFrame(loop);

  document.getElementById('btn-battle-end-turn').addEventListener('click', () => {
    if (tacticalBattle.turn === 'player') {
      tacticalBattle.endTurn();
    }
  });

  document.getElementById('btn-battle-skip').addEventListener('click', () => {
    report.victory = Math.random() < 0.5; // simple roll
    onBattleComplete();
  });
};

// Trigger defensive siege battle from a hostile AI Nation
GameUI.prototype.triggerDefensiveSiegeFromNation = function(nationId) {
  const nation = AI_NATIONS_CONFIG.find(n => n.id === nationId);
  if (!nation) return;

  const state = stateManager.state;
  if (window.gameSound) {
    gameSound.setTheme('battle');
  }

  // Determine attack troops based on nation strength
  let enemyTroops = { swordsman: 2, bowman: 2 };
  if (nation.strength === 'military') {
    enemyTroops = { swordsman: 3, bowman: 2, knight: 2 };
  } else if (nation.strength === 'economy') {
    enemyTroops = { swordsman: 4, bowman: 2, catapult: 1 };
  }

  // Determine player defenders (garrison on walls, if empty, take some default or city guards)
  const wallGarrison = state.wallGarrison || {};
  const hasGarrison = Object.values(wallGarrison).reduce((a, b) => a + b, 0) > 0;

  let troopsSent = {};
  if (hasGarrison) {
    troopsSent = { ...wallGarrison };
  } else {
    troopsSent = { spearman: 4 }; // fallback guard
  }

  const report = {
    targetName: `Invasion von ${nation.name}`,
    isSiegeDefense: true,
    isDefenseReport: true,
    troopsSent: troopsSent,
    defenders: enemyTroops,
    victory: false,
    actionLogs: []
  };

  const html = `
    <div class="battle-arena-modal" style="display: flex; flex-direction: column; max-width: 850px; width: 100%;">
      <h2 style="color: #e74c3c; animation: pulse 1.5s infinite;">🚨 Kriegserklärung! ${nation.name} greift deine Hauptburg an!</h2>
      <p class="modal-intro">Wegen extrem schlechter diplomatischer Beziehungen stürmen Truppen von ${nation.name} deine Mauern!</p>
      <div class="battle-layout" style="display: flex; gap: 15px; margin-top: 10px;">
        <div class="battle-canvas-container" style="flex-grow: 1;">
          <canvas id="battle-anim-canvas" width="550" height="300" style="border: 2px solid #e74c3c; display: block; margin: 0 auto;"></canvas>
        </div>
        <div class="battle-log-side-panel glass-card" style="width: 240px; height: 300px; display: flex; flex-direction: column; padding: 12px; box-sizing: border-box; background: rgba(0,0,0,0.5);">
          <h4 style="margin: 0 0 8px 0; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 4px; font-family: var(--font-header); color: #e74c3c;">📜 Kampfverlauf</h4>
          <div id="battle-logs-list" style="flex-grow: 1; overflow-y: auto; font-size: 0.72rem; text-align: left; line-height: 1.4; max-height: 240px;">
            <div style="color: #e74c3c;">Die Truppen formieren sich...</div>
          </div>
        </div>
      </div>
      <div class="battle-controls" style="display: flex; justify-content: space-between; margin-top: 15px;">
        <button id="btn-battle-end-turn" class="primary-btn" style="padding: 8px 16px;">Runde beenden</button>
        <button id="btn-battle-skip" class="primary-btn" style="padding: 8px 16px; border-color: #7f8c8d;">Automatisch auflösen</button>
      </div>
    </div>
  `;

  this.openModal(html);

  const canvas = document.getElementById('battle-anim-canvas');
  if (!canvas) return;

  const onBattleComplete = () => {
    if (window.gameSound) {
      gameSound.setTheme('castle');
    }
    this.closeModal();

    if (report.victory) {
      state.resources.gold += 300;
      state.resources.rubies += 10;
      // Respekt-Beziehungsplus
      state.diplomacy[nation.id].relation = Math.min(100, state.diplomacy[nation.id].relation + 15);
      stateManager.save();
      this.showToast(`Erfolgreich verteidigt! Sie respektieren deine Stärke (+15 Beziehung). Beute: 🪙 300 Gold, 💎 10 Rubine`, 'success');
    } else {
      state.resources.gold = Math.max(0, state.resources.gold - 400);
      state.resources.iron = Math.max(0, state.resources.iron - 100);
      stateManager.save();
      this.showToast(`Belagerung verloren! Die Truppen von ${nation.name} haben Tribut erpresst: -400 Gold, -100 Eisen`, 'error');
    }
  };

  const tacticalBattle = new TacticalCombat(canvas, stateManager, this, report, true, onBattleComplete);

  // Hook side logs
  if (tacticalBattle.actionLogs) {
    const updateLogsUI = () => {
      const listEl = document.getElementById('battle-logs-list');
      if (listEl) {
        listEl.innerHTML = tacticalBattle.actionLogs.map(log => {
          let color = '#fff';
          if (log.includes('besiegt') || log.includes('verloren') || log.includes('Niederlage')) color = '#e74c3c';
          else if (log.includes('Sieg') || log.includes('bereit') || log.includes('erfolgreich') || log.includes('gewonnen')) color = '#2ecc71';
          else if (log.includes('greift') || log.includes('HP') || log.includes('Schaden') || log.includes('trifft')) color = '#f1c40f';
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

  // Loop
  const loop = () => {
    if (tacticalBattle.active) {
      tacticalBattle.draw();
      requestAnimationFrame(loop);
    }
  };
  tacticalBattle.active = true;
  requestAnimationFrame(loop);

  document.getElementById('btn-battle-end-turn').addEventListener('click', () => {
    if (tacticalBattle.turn === 'player') {
      tacticalBattle.endTurn();
    }
  });

  document.getElementById('btn-battle-skip').addEventListener('click', () => {
    report.victory = Math.random() < 0.5; // simple roll
    onBattleComplete();
  });
};
