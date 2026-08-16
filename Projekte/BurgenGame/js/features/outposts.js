// --- OUTPOSTS & FEUDAL VASSALS FEATURE ---

GameStateManager.prototype.subjugateVassal = function(outpostId = 'op1') {
  if (!this.state.vassals) this.state.vassals = [];
  const existing = this.state.vassals.find(v => v.id === outpostId);
  if (existing) return { success: false, msg: 'Dieser Außenposten ist bereits dein Vasall!' };

  this.state.vassals.push({
    id: outpostId,
    subjugatedAt: Date.now(),
    dailyTributeGold: 250,
    dailyTributeStone: 100
  });
  this.save();
  this.notifyListeners('vassal_subjugated');
  return { success: true, msg: `🏰 Außenposten ${outpostId.toUpperCase()} wurde als Vasall unterworfen!` };
};

GameStateManager.prototype.collectVassalTribute = function() {
  if (!this.state.vassals || this.state.vassals.length === 0) {
    return { success: false, msg: 'Keine Vasallen vorhanden.' };
  }
  let totalGold = 0;
  let totalStone = 0;
  this.state.vassals.forEach(v => {
    totalGold += v.dailyTributeGold || 250;
    totalStone += v.dailyTributeStone || 100;
  });

  this.state.resources.gold = (this.state.resources.gold || 0) + totalGold;
  this.state.resources.stone = (this.state.resources.stone || 0) + totalStone;
  this.save();
  this.notifyListeners('vassal_tribute');
  return { success: true, msg: `👑 Vasallen-Tribut eingetrieben! (+${totalGold} Gold, +${totalStone} Stein)` };
};

GameStateManager.prototype.callVassalReinforcements = function() {
  if (!this.state.vassals || this.state.vassals.length === 0) {
    return { success: false, msg: 'Keine Vasallen vorhanden.' };
  }
  const reinforceTroops = { spearman: 5 * this.state.vassals.length, bowman: 3 * this.state.vassals.length };
  Object.keys(reinforceTroops).forEach(t => {
    this.state.troops[t] = (this.state.troops[t] || 0) + reinforceTroops[t];
  });
  this.save();
  this.notifyListeners('vassal_reinforcements');
  return { success: true, msg: `🛡️ Vasallen-Hilfstruppen eingetroffen! (+${reinforceTroops.spearman} Speerkämpfer, +${reinforceTroops.bowman} Bogenschützen)` };
};

// Extend GameStateManager with garrison withdrawal
GameStateManager.prototype.withdrawGarrison = function(outpostId) {
  const opState = this.state.outposts?.[outpostId];
  if (!opState || opState.owner !== 'player') return false;

  // Return troops to main castle
  Object.keys(opState.garrison).forEach(t => {
    this.state.troops[t] = (this.state.troops[t] || 0) + (opState.garrison[t] || 0);
    opState.garrison[t] = 0;
  });

  opState.owner = 'npc';
  this.save();
  this.notifyListeners('garrison_withdrawn');
  return true;
};

// Extend GameStateManager with reinforcements dispatching
GameStateManager.prototype.dispatchReinforcements = function(outpostId, troopsSent) {
  const op = WORLD_MAP_CONFIG.outposts.find(o => o.id === outpostId);
  if (!op) return false;

  let totalSent = 0;
  const validTroops = {};
  for (const t of Object.keys(troopsSent)) {
    const qty = troopsSent[t];
    if (qty < 0) return false;
    if (qty > 0) {
      if ((this.state.troops[t] || 0) < qty) {
        if (window.gameUI) gameUI.showToast(`Nicht genügend ${TROOPS_CONFIG[t].name}!`, 'error');
        return false;
      }
      validTroops[t] = qty;
      totalSent += qty;
    }
  }

  if (totalSent === 0) return false;

  for (const t of Object.keys(validTroops)) {
    this.state.troops[t] -= validTroops[t];
  }

  let speedMult = 1.0;
  if (this.state.research && this.state.research.logistics) {
    speedMult -= 0.20;
  }
  const heroSpeedBonus = this.getHeroSkillBonus('march_time');
  speedMult += heroSpeedBonus;
  if (this.getCurrentSeason && this.getCurrentSeason()) {
    const seasonSpeed = this.getCurrentSeason().speedMult || 1.0;
    speedMult /= seasonSpeed;
  }
  speedMult = Math.max(0.2, speedMult);
  const duration = Math.max(5, Math.round(op.travelTime * speedMult));

  const missionId = `reinforce_${Date.now()}`;
  const newMission = {
    id: missionId,
    type: 'reinforce',
    targetId: outpostId,
    targetType: 'outpost',
    status: 'traveling',
    departureTime: Date.now(),
    duration: duration,
    troopsSent: validTroops,
    loot: { gold: 0, wood: 0, stone: 0, rubies: 0 },
    battleReport: null
  };

  this.state.missions.push(newMission);
  this.save();
  this.notifyListeners('reinforce_dispatched');
  return true;
};

// Extend GameStateManager with reinforcements resolving
GameStateManager.prototype.resolveReinforcements = function(mission) {
  const opState = this.state.outposts?.[mission.targetId];
  if (opState && opState.owner === 'player') {
    Object.keys(mission.troopsSent).forEach(t => {
      opState.garrison[t] = (opState.garrison[t] || 0) + mission.troopsSent[t];
    });
  } else {
    // Send them back since outpost isn't player's anymore
    mission.status = 'returning';
    mission.departureTime = Date.now();
    mission.battleReport = {
      victory: false,
      title: 'Verstärkung gescheitert',
      text: 'Der Außenposten gehört nicht mehr dir. Deine Truppen kehren zurück.',
      targetName: 'Außenposten',
      targetLevel: 1,
      troopsSent: { ...mission.troopsSent },
      casualties: { spearman: 0, swordsman: 0, bowman: 0, knight: 0 },
      loot: { gold: 0, wood: 0, stone: 0, rubies: 0 },
      time: Date.now()
    };
    this.save();
    this.notifyListeners('reinforce_returned');
    return;
  }

  this.state.missions = this.state.missions.filter(item => item.id !== mission.id);
  this.save();
  this.notifyListeners('reinforce_arrived');
};

// Extend GameUI with outpost modal
GameUI.prototype.openOutpostModal = function(op) {
  const state = stateManager.state;
  const opState = state.outposts?.[op.id] || { owner: 'npc', garrison: { spearman: 0, swordsman: 0, bowman: 0, knight: 0 } };
  const isPlayerOwned = opState.owner === 'player';

  let defenderHtml = "";
  let actionPanelHtml = "";

  // Yield preview
  const resourceIcons = { woodcutter: '🪵 Holz', quarry: '🪨 Stein', iron_mine: '⛓️ Eisen', control_point: '🏆 Bündnis-Einfluss' };
  const yieldText = op.isControlPoint 
    ? `Allianz-Bonus: ⚡ <strong>${op.bonusDesc}</strong>`
    : `+${op.yield ? op.yield[Object.keys(op.yield)[0]] : 0} ${resourceIcons[op.type] || 'Rohstoffe'}/Min`;

  if (!isPlayerOwned) {
    // NPC owned
    defenderHtml = `
      <h3>Wachposten (Verteidiger):</h3>
      <div class="defenders-list" style="margin-top: 10px; margin-bottom: 15px;">
        ${Object.keys(op.defenders).map(t => {
          const count = op.defenders[t] || 0;
          return count > 0 ? `<p>⚔️ ${TROOPS_CONFIG[t].name}: <strong>${count}</strong></p>` : '';
        }).join('') || '<p>Keine Verteidiger</p>'}
      </div>
    `;

    let totalGarrison = 0;
    Object.keys(state.troops).forEach(t => { if (t !== 'spy') totalGarrison += state.troops[t] || 0; });

    actionPanelHtml = `
      <div class="combat-section glass-card" style="padding: 15px;">
        <h3>Angriffstruppen entsenden</h3>
        <div class="send-troops-sliders" style="margin-top: 15px;">
          ${Object.keys(state.troops).map(t => {
            if (t === 'spy') return '';
            const qty = state.troops[t] || 0;
            return `
              <div class="troop-send-row" style="margin-bottom: 10px;">
                <label style="display: block; font-size: 0.8rem; margin-bottom: 4px;"><strong>${TROOPS_CONFIG[t].name}</strong> (Burg: ${qty})</label>
                <div class="slider-container" style="display: flex; align-items: center; gap: 10px;">
                  <input type="range" class="dispatch-slider" id="send-op-${t}" min="0" max="${qty}" value="0" ${qty === 0 ? 'disabled' : ''} style="flex: 1;">
                  <span id="send-val-op-${t}" class="dispatch-val" style="min-width: 24px; text-align: right;">0</span>
                </div>
              </div>
            `;
          }).join('')}
        ${totalGarrison === 0 
          ? '<p class="warning-text" style="color: var(--color-red-hover); margin-top: 10px;">⚠️ Keine wehrfähigen Soldaten in der Hauptburg!</p>'
          : `<p style="font-size: 0.75rem; margin-top: 8px; color: var(--color-text-muted);">Reisezeit: ⌛ <strong>${op.travelTime}s</strong></p>
             <button id="btn-dispatch-op-attack" class="primary-btn danger-btn" style="margin-top: 15px; width: 100%; padding: 10px; cursor: pointer;">Angriff starten</button>`
        }
      </div>
    `;
  } else {
    // Player owned
    const totalGarrison = Object.values(opState.garrison || {}).reduce((a, b) => a + b, 0);

    // Build Trade HTML
    if (!state.tradeRoutes) state.tradeRoutes = {};
    const activeRoute = state.tradeRoutes[op.id];
    let tradeHtml = "";
    if (activeRoute) {
      tradeHtml = `
        <div style="margin-top: 15px; background: rgba(212,175,55,0.08); border: 1px solid var(--color-gold-primary); padding: 10px; border-radius: 6px;">
          <h4 style="margin: 0 0 6px 0; font-size: 0.9rem; color: var(--color-gold-hover);">⛵ Aktive Handelsroute</h4>
          <p style="font-size: 0.75rem; margin: 4px 0;">Ein Karren transportiert Ressourcen. Status: <strong>${activeRoute.direction === 'to_castle' ? 'Lieferung zur Hauptburg' : 'Rückweg zum Posten'}</strong></p>
          <button id="btn-stop-trade-route" class="primary-btn danger-btn" style="margin-top: 8px; width: 100%; padding: 4px; font-size: 0.8rem; cursor: pointer;">Handelsroute beenden</button>
        </div>
      `;
    } else {
      const freeCarts = state.tradeCarts || 0;
      tradeHtml = `
        <div style="margin-top: 15px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 10px; border-radius: 6px;">
          <h4 style="margin: 0 0 6px 0; font-size: 0.9rem;">⛵ Handelsroute einrichten</h4>
          <p style="font-size: 0.75rem; margin: 4px 0; color: var(--color-text-muted);">Nutze einen Handelskarren, um Ressourcen automatisch einzufahren.</p>
          <p style="font-size: 0.75rem; margin-bottom: 8px;">Freie Karren: <strong>${freeCarts}</strong></p>
          <button id="btn-start-trade-route" class="primary-btn gold-btn" style="width: 100%; padding: 6px; font-size: 0.8rem; cursor: pointer;" ${freeCarts > 0 ? '' : 'disabled'}>Handelsroute starten</button>
        </div>
      `;
    }

    defenderHtml = `
      <h3>Eigene Garnison:</h3>
      <div class="defenders-list" style="margin-top: 10px; margin-bottom: 15px;">
        ${Object.keys(opState.garrison || {}).map(t => {
          const count = opState.garrison[t] || 0;
          return count > 0 ? `<p>🛡️ ${TROOPS_CONFIG[t].name}: <strong>${count}</strong></p>` : '';
        }).join('') || '<p class="warning-text" style="color: var(--color-red-hover);">⚠️ Keine Soldaten stationiert! Die Produktion ruht.</p>'}
      </div>
      ${totalGarrison > 0 
        ? `<button id="btn-withdraw-garrison" class="primary-btn danger-btn" style="margin-top: 12px; width: 100%; padding: 10px; cursor: pointer;">Garnison in Hauptburg zurückrufen</button>`
        : `<button id="btn-revert-npc" class="primary-btn" style="margin-top: 12px; width: 100%; padding: 10px; cursor: pointer;">Aufgeben (wird wieder feindlich)</button>`
      }
      ${tradeHtml}
    `;

    let totalGarrisonAvailable = 0;
    Object.keys(state.troops).forEach(t => { if (t !== 'spy') totalGarrisonAvailable += state.troops[t] || 0; });
    
    actionPanelHtml = `
      <div class="combat-section glass-card" style="padding: 15px;">
        <h3>Verstärkung entsenden</h3>
        <div class="send-troops-sliders" style="margin-top: 15px;">
          ${Object.keys(state.troops).map(t => {
            if (t === 'spy') return '';
            const qty = state.troops[t] || 0;
            return `
              <div class="troop-send-row" style="margin-bottom: 10px;">
                <label style="display: block; font-size: 0.8rem; margin-bottom: 4px;"><strong>${TROOPS_CONFIG[t].name}</strong> (Burg: ${qty})</label>
                <div class="slider-container" style="display: flex; align-items: center; gap: 10px;">
                  <input type="range" class="dispatch-slider" id="reinforce-op-${t}" min="0" max="${qty}" value="0" ${qty === 0 ? 'disabled' : ''} style="flex: 1;">
                  <span id="reinforce-val-op-${t}" class="dispatch-val" style="min-width: 24px; text-align: right;">0</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        ${totalGarrisonAvailable === 0
          ? '<p class="warning-text" style="color: var(--color-text-muted); margin-top: 10px;">⚠️ Keine freien Soldaten in der Hauptburg.</p>'
          : `<p style="font-size: 0.75rem; margin-top: 8px; color: var(--color-text-muted);">Reisezeit: ⌛ <strong>${op.travelTime}s</strong></p>
             <button id="btn-dispatch-op-reinforce" class="primary-btn gold-btn" style="margin-top: 15px; width: 100%; padding: 10px; cursor: pointer;">Verstärkung losschicken</button>`
        }
      </div>
    `;
  }

  const html = `
    <h2>${op.name} (Außenposten)</h2>
    <div class="combat-dispatch-panels" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 15px;">
      <div class="combat-section glass-card" style="padding: 15px;">
        <h3>Besitzverhältnisse</h3>
        <p style="margin-top: 10px;">Besitzer: <strong style="color: ${isPlayerOwned ? 'var(--color-green-success)' : 'var(--color-red-danger)'}">${isPlayerOwned ? 'Deine Herrschaft' : 'Raubritter'}</strong></p>
        <p style="margin-top: 8px;">Ertrag: <strong style="color: var(--color-gold-hover);">${yieldText}</strong></p>
        <div style="margin-top: 20px; border-top: 1px solid rgba(212,175,55,0.2); padding-top: 15px;">
          ${defenderHtml}
        </div>
      </div>
      ${actionPanelHtml}
    </div>
  `;

  this.openModal(html);

  // Bind sliders listeners
  Object.keys(state.troops).forEach(t => {
    if (t === 'spy') return;
    const dispatchSlider = document.getElementById(`send-op-${t}`);
    const dispatchVal = document.getElementById(`send-val-op-${t}`);
    if (dispatchSlider) {
      dispatchSlider.addEventListener('input', () => { dispatchVal.innerText = dispatchSlider.value; });
    }

    const reinforceSlider = document.getElementById(`reinforce-op-${t}`);
    const reinforceVal = document.getElementById(`reinforce-val-op-${t}`);
    if (reinforceSlider) {
      reinforceSlider.addEventListener('input', () => { reinforceVal.innerText = reinforceSlider.value; });
    }
  });

  // Dispatch Attack Listener
  const attackBtn = document.getElementById('btn-dispatch-op-attack');
  if (attackBtn) {
    attackBtn.addEventListener('click', () => {
      const troopsToSend = {};
      Object.keys(state.troops).forEach(t => {
        if (t === 'spy') return;
        const val = parseInt(document.getElementById(`send-op-${t}`).value) || 0;
        if (val > 0) troopsToSend[t] = val;
      });

      if (stateManager.dispatchAttack(op.id, troopsToSend, 'outpost')) {
        this.closeModal();
        this.showFloatingNotification(`Angriffszug zum Außenposten ausgesandt! Reisezeit: ⌛ ${op.travelTime}s.`);
      }
    });
  }

  // Dispatch Reinforce Listener
  const reinforceBtn = document.getElementById('btn-dispatch-op-reinforce');
  if (reinforceBtn) {
    reinforceBtn.addEventListener('click', () => {
      const troopsToSend = {};
      Object.keys(state.troops).forEach(t => {
        if (t === 'spy') return;
        const val = parseInt(document.getElementById(`reinforce-op-${t}`).value) || 0;
        if (val > 0) troopsToSend[t] = val;
      });

      if (stateManager.dispatchReinforcements(op.id, troopsToSend)) {
        this.closeModal();
        this.showFloatingNotification(`Verstärkung zum Außenposten gesendet! Reisezeit: ⌛ ${op.travelTime}s.`);
      }
    });
  }

  // Withdraw Garrison Listener
  const withdrawBtn = document.getElementById('btn-withdraw-garrison');
  if (withdrawBtn) {
    withdrawBtn.addEventListener('click', () => {
      if (stateManager.withdrawGarrison(op.id)) {
        this.closeModal();
        this.showFloatingNotification('Garnison wurde in die Hauptburg zurückgerufen!');
      }
    });
  }

  // Revert NPC / Free
  const revertBtn = document.getElementById('btn-revert-npc');
  if (revertBtn) {
    revertBtn.addEventListener('click', () => {
      if (stateManager.withdrawGarrison(op.id)) {
        this.closeModal();
        this.showFloatingNotification('Außenposten freigegeben.');
      }
    });
  }

  // Start trade route
  const startTradeBtn = document.getElementById('btn-start-trade-route');
  if (startTradeBtn) {
    startTradeBtn.addEventListener('click', () => {
      if (stateManager.startTradeRoute(op.id)) {
        this.openOutpostModal(op);
        this.showFloatingNotification('Handelsroute erfolgreich eingerichtet!');
      }
    });
  }

  // Stop trade route
  const stopTradeBtn = document.getElementById('btn-stop-trade-route');
  if (stopTradeBtn) {
    stopTradeBtn.addEventListener('click', () => {
      if (stateManager.stopTradeRoute(op.id)) {
        this.openOutpostModal(op);
        this.showFloatingNotification('Handelsroute beendet. Karren ist wieder frei.');
      }
    });
  }
};

// Start trade route method
GameStateManager.prototype.startTradeRoute = function(opId) {
  this.state.tradeCarts = this.state.tradeCarts || 0;
  if (this.state.tradeCarts <= 0) {
    if (window.gameUI) gameUI.showToast('Keine freien Handelskarren verfügbar!', 'warning');
    return false;
  }
  if (!this.state.tradeRoutes) this.state.tradeRoutes = {};
  this.state.tradeCarts -= 1;
  this.state.tradeRoutes[opId] = {
    active: true,
    progress: 0,
    direction: 'to_outpost'
  };
  this.save();
  this.notifyListeners('trade_route_started');
  return true;
};

// Stop trade route method
GameStateManager.prototype.stopTradeRoute = function(opId) {
  if (!this.state.tradeRoutes || !this.state.tradeRoutes[opId]) return false;
  delete this.state.tradeRoutes[opId];
  this.state.tradeCarts = (this.state.tradeCarts || 0) + 1;
  this.save();
  this.notifyListeners('trade_route_stopped');
  return true;
};

// Tick trade routes method
GameStateManager.prototype.tickTradeRoutes = function(dt) {
  if (!this.state.tradeRoutes) return;
  Object.keys(this.state.tradeRoutes).forEach(opId => {
    const route = this.state.tradeRoutes[opId];
    if (!route || !route.active) return;

    route.progress = (route.progress || 0) + 0.04 * dt;
    if (route.progress >= 1.0) {
      route.progress = 0;
      if (route.direction === 'to_castle') {
        const op = WORLD_MAP_CONFIG.outposts.find(o => o.id === opId);
        const opState = this.state.outposts[opId];
        if (op && opState && opState.owner === 'player') {
          const yieldRes = Object.keys(op.yield)[0];
          const yieldVal = op.yield[yieldRes] * 12; // Deliver 12x yield per delivery cycle
          const actualResMap = { woodcutter: 'wood', quarry: 'stone', iron_mine: 'iron', control_point: 'gold' };
          const targetRes = actualResMap[op.type] || yieldRes;
          this.state.resources[targetRes] = (this.state.resources[targetRes] || 0) + yieldVal;
          gameUI.showFloatingNotification(`⛵ Handelskarren aus ${op.name} eingetroffen: +${yieldVal} ${targetRes.toUpperCase()} geliefert!`);
        }
        route.direction = 'to_outpost';
      } else {
        route.direction = 'to_castle';
      }
      this.save();
    }
  });
};
