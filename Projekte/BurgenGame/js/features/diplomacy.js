// --- DIPLOMATIE-SYSTEM FEATURE ---

// ================================================================
// Initialisiere Diplomatie-State
// ================================================================
GameStateManager.prototype.initDiplomacy = function() {
  if (!this.state.diplomacy) {
    this.state.diplomacy = {};
    AI_NATIONS_CONFIG.forEach(nation => {
      this.state.diplomacy[nation.id] = {
        relation: nation.startRelation,
        status: 'neutral', // 'hostile', 'neutral', 'friendly', 'allied'
        lastAction: {},  // { actionType: timestamp }
        pendingRequest: null, // { type, expiresAt }
        tradeLimit: 1000
      };
    });
  }
  // Migration für alte Saves
  AI_NATIONS_CONFIG.forEach(nation => {
    if (!this.state.diplomacy[nation.id]) {
      this.state.diplomacy[nation.id] = {
        relation: nation.startRelation,
        status: 'neutral',
        lastAction: {},
        pendingRequest: null,
        tradeLimit: 1000
      };
    } else if (this.state.diplomacy[nation.id].tradeLimit === undefined) {
      this.state.diplomacy[nation.id].tradeLimit = 1000;
    }
  });
};

// ================================================================
// Beziehungs-Status basierend auf Punkten ermitteln
// ================================================================
GameStateManager.prototype.getDiplomacyStatus = function(relation, status) {
  if (status === 'vassal') return { label: 'Vasall', color: '#9b59b6', icon: '👑' };
  if (status === 'allied') return { label: 'Verbündet', color: '#f1c40f', icon: '🌟' };
  if (relation <= -60) return { label: 'Feindlich', color: '#e74c3c', icon: '⚔️' };
  if (relation <= -20) return { label: 'Angespannt', color: '#e67e22', icon: '😤' };
  if (relation <= 20)  return { label: 'Neutral',    color: '#bdc3c7', icon: '🤝' };
  if (relation <= 60)  return { label: 'Freundlich', color: '#2ecc71', icon: '😊' };
  return                      { label: 'Verbündet',  color: '#f1c40f', icon: '🌟' };
};

// ================================================================
// Diplomatische Aktion ausführen
// ================================================================
GameStateManager.prototype.performDiplomacyAction = function(nationId, actionType) {
  this.initDiplomacy();
  const nation = AI_NATIONS_CONFIG.find(n => n.id === nationId);
  if (!nation) return { success: false, msg: 'Nation nicht gefunden.' };

  const dipState = this.state.diplomacy[nationId];
  const now = Date.now();
  const actionCfg = DIPLOMACY_ACTIONS[actionType];
  if (!actionCfg) return { success: false, msg: 'Unbekannte Aktion.' };

  // Cooldown prüfen
  const lastActionTime = dipState.lastAction[actionType] || 0;
  const cooldownMs = (actionCfg.cooldown || 0) * 1000;
  if (now - lastActionTime < cooldownMs) {
    const remaining = Math.ceil((cooldownMs - (now - lastActionTime)) / 1000);
    return { success: false, msg: `Aktion auf Abklingzeit! Noch ${remaining}s warten.` };
  }

  let result = { success: true, msg: '', relationChange: 0 };

  switch (actionType) {
    case 'send_gift': {
      const gifts = nation.gifts;
      if (!this.hasResources(gifts)) {
        return { success: false, msg: `Nicht genug Ressourcen für ein Geschenk! Benötigt: ${Object.entries(gifts).map(([k,v]) => `${v} ${k}`).join(', ')}` };
      }
      this.deductResources(gifts);
      const gain = actionCfg.relationGain;
      dipState.relation = Math.min(100, dipState.relation + gain);
      result.msg = `🎁 Geschenk an ${nation.name} gesendet! Beziehung +${gain}`;
      result.relationChange = gain;
      break;
    }
    case 'propose_alliance': {
      if (dipState.relation < actionCfg.relationReq) {
        return { success: false, msg: `Beziehung zu niedrig! Benötigt: ${actionCfg.relationReq}+` };
      }
      dipState.status = 'allied';
      result.msg = `🤝 ${nation.name} hat dein Bündnisangebot angenommen! Ihr seid jetzt Verbündete.`;
      break;
    }
    case 'demand_tribute': {
      const tributeItems = nation.tributes;
      if (Math.random() < actionCfg.successChance) {
        Object.keys(tributeItems).forEach(res => {
          this.state.resources[res] = (this.state.resources[res] || 0) + tributeItems[res];
        });
        const loss = actionCfg.relationLoss;
        dipState.relation = Math.max(-100, dipState.relation - loss);
        result.msg = `💰 Tribut von ${nation.name} eingefordert! Erhalten: ${Object.entries(tributeItems).map(([k,v]) => `${v} ${k}`).join(', ')}. Beziehung -${loss}`;
        result.relationChange = -loss;
      } else {
        const bigLoss = actionCfg.relationLoss * 2;
        dipState.relation = Math.max(-100, dipState.relation - bigLoss);
        result.msg = `😠 ${nation.name} weigert sich, Tribut zu zahlen! Beziehung -${bigLoss}`;
        result.relationChange = -bigLoss;
      }
      break;
    }
    case 'demand_vassalage': {
      if (dipState.relation > actionCfg.relationReq) {
        return { success: false, msg: `Beziehung zu gut für Vasallentum! Benötigt: ${actionCfg.relationReq} oder niedriger.` };
      }
      if (Math.random() < actionCfg.successChance) {
        dipState.status = 'vassal';
        result.msg = `👑 ${nation.name} hat kapituliert und sich dir als Vasall unterworfen! Sie zahlen nun regelmäßigen Tribut.`;
      } else {
        dipState.relation = Math.max(-100, dipState.relation - 30);
        result.msg = `😠 ${nation.name} lehnt deine Unterwerfung brüsk ab! Beziehung -30.`;
        result.relationChange = -30;
      }
      break;
    }
    case 'peace_treaty': {
      if (dipState.relation > actionCfg.relationReq) {
        return { success: false, msg: `Friedensvertrag nur bei feindlicher Lage sinnvoll (Beziehung < ${actionCfg.relationReq}).` };
      }
      const cost = actionCfg.cost || {};
      if (!this.hasResources(cost)) {
        return { success: false, msg: 'Nicht genug Gold für einen Friedensvertrag!' };
      }
      this.deductResources(cost);
      const gain = actionCfg.relationGain;
      dipState.relation = Math.min(100, dipState.relation + gain);
      dipState.status = 'neutral';
      result.msg = `🕊️ Friedensvertrag mit ${nation.name} geschlossen! Beziehung +${gain}`;
      result.relationChange = gain;
      break;
    }
    case 'request_military_aid': {
      if (dipState.relation < actionCfg.relationReq) {
        return { success: false, msg: `Beziehung zu niedrig! Benötigt: ${actionCfg.relationReq}+` };
      }
      const troopsGranted = actionCfg.troopsGranted;
      this.state.troops.spearman = (this.state.troops.spearman || 0) + troopsGranted;
      result.msg = `⚔️ ${nation.name} sendet ${troopsGranted} Speerkämpfer als Militärhilfe!`;
      break;
    }
    default:
      return { success: false, msg: 'Unbekannte Aktion.' };
  }

  // Cooldown setzen
  dipState.lastAction[actionType] = now;

  // Status aktualisieren
  const rel = dipState.relation;
  if (rel > 60 && dipState.status !== 'allied') dipState.status = 'friendly';
  else if (rel > 20) dipState.status = 'neutral';
  else if (rel > -20) dipState.status = 'neutral';
  else if (rel > -60) dipState.status = 'hostile';
  else dipState.status = 'hostile';

  this.save();
  this.notifyListeners('diplomacy_action');
  return result;
};

// ================================================================
// Diplomatischen Ressourcenhandel ausführen
// ================================================================
GameStateManager.prototype.executeDiplomaticTrade = function(nationId, sellRes, buyRes, sellQty) {
  this.initDiplomacy();
  const nation = AI_NATIONS_CONFIG.find(n => n.id === nationId);
  const dipState = this.state.diplomacy[nationId];
  if (!nation || !dipState) return { success: false, msg: 'Nation nicht gefunden.' };

  if (dipState.relation <= -60) {
    return { success: false, msg: 'Mit feindlichen Nationen kann nicht gehandelt werden!' };
  }

  const reserve = (this.state.resourceReserves && this.state.resourceReserves[sellRes]) || 0;
  if ((this.state.resources[sellRes] || 0) - sellQty < reserve) {
    return { success: false, msg: `Handel blockiert! Mindestbestand von ${reserve} ${sellRes.toUpperCase()} darf nicht unterschritten werden.` };
  }

  const isAllied = dipState.status === 'allied';
  const rate = isAllied ? 1.0 : 1.5;
  const buyQty = Math.floor(sellQty / rate);

  if (buyQty <= 0) {
    return { success: false, msg: 'Die Tauschmenge ist zu gering!' };
  }

  if (buyQty > dipState.tradeLimit) {
    return { success: false, msg: `Das Handelslimit reicht nicht aus (Verbleibend: ${Math.floor(dipState.tradeLimit)}).` };
  }

  // Ressourcen verbuchen
  this.state.resources[sellRes] -= sellQty;
  this.state.resources[buyRes] = (this.state.resources[buyRes] || 0) + buyQty;
  dipState.tradeLimit -= buyQty;

  this.save();
  this.notifyListeners('diplomatic_trade');
  return { success: true, msg: `Handel durchgeführt: -${sellQty} ${sellRes.toUpperCase()} gegen +${buyQty} ${buyRes.toUpperCase()}` };
};

// ================================================================
// Tick: Zufällige diplomatische Ereignisse & Limit-Regeneration
// ================================================================
GameStateManager.prototype.tickDiplomacy = function(dt) {
  this.initDiplomacy();

  // Vassal tribute collection timer
  if (this.state.vassalTributeTimer === undefined) this.state.vassalTributeTimer = 60;
  this.state.vassalTributeTimer -= dt;
  if (this.state.vassalTributeTimer <= 0) {
    this.state.vassalTributeTimer = 60; // reset
    Object.keys(this.state.diplomacy).forEach(nationId => {
      const dip = this.state.diplomacy[nationId];
      if (dip && dip.status === 'vassal') {
        const goldTribute = 200;
        const resTribute = 100;
        const resourcesList = ['wood', 'stone', 'food', 'iron'];
        const rolledRes = resourcesList[Math.floor(Math.random() * resourcesList.length)];
        
        this.state.resources.gold += goldTribute;
        this.state.resources[rolledRes] = (this.state.resources[rolledRes] || 0) + resTribute;
        
        const nation = AI_NATIONS_CONFIG.find(n => n.id === nationId);
        const name = nation ? nation.name : nationId;
        if (window.gameUI) {
          gameUI.showToast(`👑 Vassallentribut erhalten von ${name}: +🪙 200 Gold und +100 ${rolledRes.toUpperCase()}`, 'info');
        }
      }
    });
  }

  // Regenerate trade limits over time
  AI_NATIONS_CONFIG.forEach(nation => {
    const dip = this.state.diplomacy[nation.id];
    if (dip) {
      if (dip.tradeLimit === undefined) dip.tradeLimit = 1000;
      dip.tradeLimit = Math.min(1000, dip.tradeLimit + dt * 2.5); // +150 per minute
    }
  });

  if (!this.state.nextDiplomacyEvent) {
    this.state.nextDiplomacyEvent = Date.now() + 300000 + Math.random() * 300000; // 5-10 Min
  }

  if (Date.now() >= this.state.nextDiplomacyEvent) {
    this.state.nextDiplomacyEvent = Date.now() + 300000 + Math.random() * 300000;

    // Wähle eine zufällige Nation
    const nation = AI_NATIONS_CONFIG[Math.floor(Math.random() * AI_NATIONS_CONFIG.length)];
    const dipState = this.state.diplomacy[nation.id];

    // Beziehungsdrift: Neutrale tendieren zu langsam besser werdenden Beziehungen
    if (nation.personality === 'peaceful' && dipState.relation < 30) {
      dipState.relation = Math.min(100, dipState.relation + 3);
    } else if (nation.personality === 'aggressive' && dipState.relation > 0) {
      dipState.relation = Math.max(-100, dipState.relation - 2);
    }

    // Hostile Nation Attack Trigger (relation <= -60)
    if (dipState.relation <= -60 && Math.random() < 0.25) {
      setTimeout(() => {
        if (window.gameUI && gameUI.triggerDefensiveSiegeFromNation) {
          gameUI.triggerDefensiveSiegeFromNation(nation.id);
        }
      }, 2000);
    }

    // Zufällige diplomatische Anfrage
    if (Math.random() < 0.3 && !this.state.pendingDiplomaticRequest) {
      const requests = ['trade_request', 'tribute_demand', 'alliance_offer'];
      const reqType = requests[Math.floor(Math.random() * requests.length)];
      this.state.pendingDiplomaticRequest = {
        nationId: nation.id,
        type: reqType,
        expiresAt: Date.now() + 120000 // 2 Minuten Zeit zum Reagieren
      };
      this.notifyListeners('diplomatic_request');
    }

    this.save();
  }
};

// ================================================================
// UI: Diplomatie Modal öffnen
// ================================================================
GameUI.prototype.openDiplomacyModal = function() {
  stateManager.initDiplomacy();
  const state = stateManager.state;

  let nationsHtml = '';
  AI_NATIONS_CONFIG.forEach(nation => {
    const dipState = state.diplomacy[nation.id];
    const relation = dipState.relation;
    const statusInfo = stateManager.getDiplomacyStatus(relation, dipState.status);
    const cooldowns = dipState.lastAction || {};
    const now = Date.now();

    const canSendGift = !cooldowns.send_gift || now - cooldowns.send_gift >= DIPLOMACY_ACTIONS.send_gift.cooldown * 1000;
    const canProposeAlliance = relation >= DIPLOMACY_ACTIONS.propose_alliance.relationReq;
    const canDemandTribute = !cooldowns.demand_tribute || now - cooldowns.demand_tribute >= DIPLOMACY_ACTIONS.demand_tribute.cooldown * 1000;
    const canRequestAid = relation >= DIPLOMACY_ACTIONS.request_military_aid.relationReq;
    const canPeaceTreaty = relation < DIPLOMACY_ACTIONS.peace_treaty.relationReq;
    const canDemandVassalage = relation <= -60 && dipState.status !== 'vassal';
    const canTrade = relation > -60;

    const relPct = Math.round(((relation + 100) / 200) * 100);
    const barColor = relation > 30 ? '#2ecc71' : relation > -30 ? '#f1c40f' : '#e74c3c';

    nationsHtml += `
      <div class="glass-card" style="padding: 15px; margin-bottom: 12px; border-left: 4px solid ${nation.color};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <h3 style="margin: 0; font-size: 1rem;">${nation.icon} ${nation.name}</h3>
          <span style="color: ${statusInfo.color}; font-weight: bold; font-size: 0.85rem;">${statusInfo.icon} ${statusInfo.label}</span>
        </div>
        <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 8px;">${nation.desc}</p>

        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 3px;">
            <span>Beziehung</span>
            <span style="color: ${barColor}; font-weight: bold;">${relation > 0 ? '+' : ''}${relation}</span>
          </div>
          <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
            <div style="width: ${relPct}%; height: 100%; background: ${barColor}; transition: width 0.4s;"></div>
          </div>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          <button class="diplo-action-btn primary-btn" data-nation="${nation.id}" data-action="send_gift"
            ${canSendGift ? '' : 'disabled'} style="font-size: 0.72rem; padding: 4px 8px;">
            🎁 Geschenk senden
          </button>
          <button class="diplo-action-btn primary-btn gold-btn" data-nation="${nation.id}" data-action="propose_alliance"
            ${canProposeAlliance && dipState.status !== 'allied' ? '' : 'disabled'} style="font-size: 0.72rem; padding: 4px 8px;">
            🤝 Bündnis anbieten
          </button>
          <button class="diplo-trade-btn primary-btn gold-btn" data-nation="${nation.id}"
            ${canTrade ? '' : 'disabled'} style="font-size: 0.72rem; padding: 4px 8px; background: rgba(212,175,55,0.3);">
            🤝 Handeln
          </button>
          <button class="diplo-action-btn primary-btn danger-btn" data-nation="${nation.id}" data-action="demand_tribute"
            ${canDemandTribute ? '' : 'disabled'} style="font-size: 0.72rem; padding: 4px 8px;">
            💰 Tribut fordern
          </button>
          <button class="diplo-action-btn primary-btn" data-nation="${nation.id}" data-action="request_military_aid"
            ${canRequestAid ? '' : 'disabled'} style="font-size: 0.72rem; padding: 4px 8px; background: rgba(52, 152, 219, 0.3);">
            ⚔️ Militärhilfe anfragen
          </button>
          ${canDemandVassalage ? `
          <button class="diplo-action-btn primary-btn" data-nation="${nation.id}" data-action="demand_vassalage"
            style="font-size: 0.72rem; padding: 4px 8px; background: rgba(155, 89, 182, 0.3);">
            👑 Vasallentum fordern
          </button>` : ''}
          ${canPeaceTreaty ? `
          <button class="diplo-action-btn primary-btn" data-nation="${nation.id}" data-action="peace_treaty"
            style="font-size: 0.72rem; padding: 4px 8px; background: rgba(46, 204, 113, 0.3);">
            🕊️ Friedensvertrag
          </button>` : ''}
        </div>
      </div>
    `;
  });

  const html = `
    <h2>🤝 Diplomatie</h2>
    <p class="modal-intro">Manage deine Beziehungen zu den Nationen der bekannten Welt. Bündnisse bringen Boni, Feindschaft birgt Gefahren.</p>
    ${nationsHtml}
    <button id="btn-diplo-close" class="primary-btn" style="width: 100%; margin-top: 5px;">Schließen</button>
  `;

  this.openModal(html);

  document.getElementById('btn-diplo-close').addEventListener('click', () => this.closeModal());

  document.querySelectorAll('.diplo-action-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const nationId = e.target.getAttribute('data-nation');
      const action = e.target.getAttribute('data-action');
      const result = stateManager.performDiplomacyAction(nationId, action);
      if (result.success) {
        this.openDiplomacyModal();
        this.showFloatingNotification(result.msg);
      } else {
        this.showFloatingNotification('⚠️ ' + result.msg);
      }
    });
  });

  document.querySelectorAll('.diplo-trade-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const nationId = e.target.getAttribute('data-nation');
      this.openDiplomaticTradeModal(nationId);
    });
  });
};

// ================================================================
// UI: Diplomatischen Ressourcenhandel Modal öffnen
// ================================================================
GameUI.prototype.openDiplomaticTradeModal = function(nationId) {
  const state = stateManager.state;
  const nation = AI_NATIONS_CONFIG.find(n => n.id === nationId);
  const dipState = state.diplomacy[nationId];
  const isAllied = dipState.status === 'allied';
  const rate = isAllied ? 1.0 : 1.5;

  const html = `
    <h2>🤝 Ressourcenhandel: ${nation.name}</h2>
    <p class="modal-intro">Tausche Ressourcen mit deinem Nachbarn. Kurs für diese Nation: <strong>${isAllied ? '1:1 (Allianz-Bonus!)' : '1.5:1 (Neutral/Freundlich)'}</strong>.</p>
    
    <div class="glass-card" style="padding: 15px; margin-bottom: 12px; text-align: left;">
      <div style="font-size: 0.8rem; margin-bottom: 8px; display: flex; justify-content: space-between;">
        <span>Verfügbares Handelslimit der Nation:</span>
        <strong style="color: var(--color-gold-hover);">${Math.floor(dipState.tradeLimit)} / 1000</strong>
      </div>
      <div class="progress-container" style="height: 6px; background: rgba(0,0,0,0.3); border-radius: 3px; overflow: hidden; margin-bottom: 15px;">
        <div style="width: ${dipState.tradeLimit / 10}%; height: 100%; background: var(--color-gold-primary);"></div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
        <div>
          <label style="font-size: 0.8rem; display: block; margin-bottom: 4px;">Ressource anbieten:</label>
          <select id="sel-trade-sell" style="width: 100%; padding: 5px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;">
            <option value="wood" selected>🪵 Holz</option>
            <option value="stone">🪨 Stein</option>
            <option value="iron">⛓️ Eisen</option>
            <option value="gold">🪙 Gold</option>
          </select>
        </div>
        <div>
          <label style="font-size: 0.8rem; display: block; margin-bottom: 4px;">Ressource erwerben:</label>
          <select id="sel-trade-buy" style="width: 100%; padding: 5px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;">
            <option value="wood">🪵 Holz</option>
            <option value="stone" selected>🪨 Stein</option>
            <option value="iron">⛓️ Eisen</option>
            <option value="gold">🪙 Gold</option>
          </select>
        </div>
      </div>

      <div class="slider-container" style="margin-bottom: 15px;">
        <label style="font-size: 0.8rem; display: block; margin-bottom: 4px;">Menge zum Verkauf:</label>
        <div style="display: flex; gap: 10px; align-items: center;">
          <input type="range" id="slider-trade-amount" min="0" max="600" value="0" style="flex-grow: 1;">
          <span id="lbl-trade-amount" style="font-size: 0.85rem; font-weight: bold; width: 45px; text-align: right;">0</span>
        </div>
      </div>

      <div style="background: rgba(0,0,0,0.2); padding: 10px; border-radius: 6px; font-size: 0.8rem; text-align: center; border: 1px dashed rgba(255,255,255,0.1);">
        Du verkaufst: <strong id="lbl-trade-summary-sell">0 WOOD</strong><br>
        Du erhältst: <strong id="lbl-trade-summary-buy" style="color: var(--color-gold-hover);">0 STONE</strong>
      </div>
    </div>

    <div style="display: flex; gap: 10px;">
      <button id="btn-trade-execute" class="primary-btn gold-btn" style="flex-grow: 1;" disabled>Tausch abschließen</button>
      <button id="btn-trade-cancel" class="primary-btn" style="width: 100px;">Zurück</button>
    </div>
  `;

  this.openModal(html);

  const sellSelect = document.getElementById('sel-trade-sell');
  const buySelect = document.getElementById('sel-trade-buy');
  const slider = document.getElementById('slider-trade-amount');
  const lblAmount = document.getElementById('lbl-trade-amount');
  const summarySell = document.getElementById('lbl-trade-summary-sell');
  const summaryBuy = document.getElementById('lbl-trade-summary-buy');
  const executeBtn = document.getElementById('btn-trade-execute');
  const cancelBtn = document.getElementById('btn-trade-cancel');

  const updateTradeLabels = () => {
    const sellRes = sellSelect.value;
    const buyRes = buySelect.value;
    const playerMax = state.resources[sellRes] || 0;

    slider.max = Math.min(playerMax, Math.floor(dipState.tradeLimit * rate));

    const sellQty = parseInt(slider.value);
    lblAmount.innerText = sellQty;

    const buyQty = Math.floor(sellQty / rate);

    summarySell.innerText = `${sellQty} ${sellRes.toUpperCase()}`;
    summaryBuy.innerText = `${buyQty} ${buyRes.toUpperCase()}`;

    executeBtn.disabled = buyQty <= 0 || sellRes === buyRes;
  };

  sellSelect.addEventListener('change', () => { slider.value = 0; updateTradeLabels(); });
  buySelect.addEventListener('change', updateTradeLabels);
  slider.addEventListener('input', updateTradeLabels);

  updateTradeLabels();

  cancelBtn.addEventListener('click', () => this.openDiplomacyModal());
  executeBtn.addEventListener('click', () => {
    const sellRes = sellSelect.value;
    const buyRes = buySelect.value;
    const sellQty = parseInt(slider.value);

    const result = stateManager.executeDiplomaticTrade(nationId, sellRes, buyRes, sellQty);
    if (result.success) {
      if (window.gameSound) gameSound.playSFX('coin');
      this.openDiplomacyModal();
      this.showFloatingNotification(result.msg);
    } else {
      this.showFloatingNotification('⚠️ ' + result.msg);
    }
  });
};

// ================================================================
// Pending diplomatic request handler
// ================================================================
GameUI.prototype.openDiplomaticRequestModal = function(request) {
  stateManager.initDiplomacy();
  const nation = AI_NATIONS_CONFIG.find(n => n.id === request.nationId);
  if (!nation) return;

  let title = '', desc = '', choices = [];

  if (request.type === 'trade_request') {
    title = `${nation.icon} Handelsanfrage von ${nation.name}`;
    desc = `${nation.name} möchte einen einmaligen Handel abschließen: Sie bieten 200 Gold für 150 Holz.`;
    choices = [
      {
        text: '✅ Handel annehmen (+200 Gold, -150 Holz)',
        action: () => {
          if (stateManager.hasResources({ wood: 150 })) {
            stateManager.deductResources({ wood: 150 });
            stateManager.state.resources.gold += 200;
            stateManager.state.diplomacy[request.nationId].relation = Math.min(100, stateManager.state.diplomacy[request.nationId].relation + 8);
            stateManager.save();
            return '✅ Handel abgeschlossen! +200 Gold, -150 Holz. Beziehung +8';
          }
          return '❌ Zu wenig Holz!';
        }
      },
      { text: '❌ Ablehnen', action: () => { stateManager.state.diplomacy[request.nationId].relation = Math.max(-100, stateManager.state.diplomacy[request.nationId].relation - 5); stateManager.save(); return '❌ Handel abgelehnt. Beziehung -5'; } }
    ];
  } else if (request.type === 'alliance_offer') {
    title = `${nation.icon} Bündnisangebot von ${nation.name}`;
    desc = `${nation.name} bietet ein offizielles Bündnis an! Als Verbündete helfen sich beide Seiten in Zeiten der Not.`;
    choices = [
      {
        text: '🤝 Bündnis annehmen',
        action: () => { stateManager.state.diplomacy[request.nationId].status = 'allied'; stateManager.state.diplomacy[request.nationId].relation = Math.min(100, stateManager.state.diplomacy[request.nationId].relation + 20); stateManager.save(); return `🤝 Bündnis mit ${nation.name} geschlossen! Beziehung +20`; }
      },
      { text: '❌ Ablehnen', action: () => { stateManager.state.diplomacy[request.nationId].relation = Math.max(-100, stateManager.state.diplomacy[request.nationId].relation - 10); stateManager.save(); return '❌ Das Bündnisangebot wurde abgelehnt. Beziehung -10'; } }
    ];
  } else { // tribute_demand
    title = `${nation.icon} Tributforderung von ${nation.name}`;
    desc = `${nation.name} fordert 150 Gold als Tribut! Zahle oder riskiere verschlechterte Beziehungen.`;
    choices = [
      {
        text: '💰 Tribut zahlen (-150 Gold)',
        action: () => {
          if (stateManager.hasResources({ gold: 150 })) {
            stateManager.deductResources({ gold: 150 });
            stateManager.state.diplomacy[request.nationId].relation = Math.min(100, stateManager.state.diplomacy[request.nationId].relation + 10);
            stateManager.save();
            return '💰 Tribut bezahlt. Beziehung +10';
          }
          return '❌ Zu wenig Gold!';
        }
      },
      { text: '⚔️ Verweigern', action: () => { stateManager.state.diplomacy[request.nationId].relation = Math.max(-100, stateManager.state.diplomacy[request.nationId].relation - 20); stateManager.save(); return '⚔️ Forderung verweigert! Beziehung -20'; } }
    ];
  }

  let choicesHtml = choices.map((c, i) => `
    <button class="diplomatic-req-btn primary-btn" data-idx="${i}" style="width: 100%; margin-bottom: 8px;">${c.text}</button>
  `).join('');

  const html = `
    <div class="event-card">
      <h2>${title}</h2>
      <p style="margin: 15px 0; font-size: 0.9rem; line-height: 1.4;">${desc}</p>
      <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 15px;">
        ${choicesHtml}
      </div>
    </div>
  `;

  this.openModal(html);

  document.querySelectorAll('.diplomatic-req-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-idx'));
      const msg = choices[idx].action();
      stateManager.state.pendingDiplomaticRequest = null;
    });
  });
};

GameStateManager.prototype.tickDiplomacy = function(dt) {
  this.initDiplomacy();
  if (!this.state.diplomacy) return;

  // 1. Vassal Tributes & Trade Limit Recovery
  Object.keys(this.state.diplomacy).forEach(nationId => {
    const dip = this.state.diplomacy[nationId];
    if (dip.status === 'vassal') {
      this.state.resources.gold = (this.state.resources.gold || 0) + 0.1 * dt;
      this.state.resources.food = (this.state.resources.food || 0) + 0.1 * dt;
    }
    dip.tradeLimit = Math.min(1000, (dip.tradeLimit || 1000) + 0.5 * dt);
  });

  // 2. AI vs AI World Politics Simulation
  if (!this.state.nextWorldPoliticsTime) {
    this.state.nextWorldPoliticsTime = Date.now() + 300000; // 5 min
  }

  if (Date.now() >= this.state.nextWorldPoliticsTime) {
    this.state.nextWorldPoliticsTime = Date.now() + 300000 + Math.random() * 300000;
    const nations = AI_NATIONS_CONFIG;
    if (nations.length >= 2) {
      const n1 = nations[Math.floor(Math.random() * nations.length)];
      let n2 = nations[Math.floor(Math.random() * nations.length)];
      if (n1.id !== n2.id) {
        const events = [
          `📜 Weltkarte: ${n1.name} und ${n2.name} haben einen Handelsvertrag geschlossen.`,
          `⚔️ Weltkarte: Grenzscharmützel zwischen ${n1.name} und ${n2.name} gemeldet!`,
          `🕊️ Weltkarte: ${n1.name} hat Friedensverhandlungen mit ${n2.name} aufgenommen.`
        ];
        const logMsg = events[Math.floor(Math.random() * events.length)];
        if (window.gameUI) gameUI.addLog(logMsg, 'info');
      }
    }
    this.save();
  }
};

GameStateManager.prototype.hireMercenaries = function(nationId) {
  this.initDiplomacy();
  const dip = this.state.diplomacy[nationId];
  if (!dip || dip.relation < 10) {
    return { success: false, msg: 'Beziehung zu dieser Nation muss mindestens neutral (10+) sein!' };
  }
  const costGold = 300;
  if ((this.state.resources.gold || 0) < costGold) {
    return { success: false, msg: `Nicht genug Gold! Benötigt: ${costGold} Gold.` };
  }

  this.state.resources.gold -= costGold;
  this.state.troops.swordsman = (this.state.troops.swordsman || 0) + 10;
  this.state.troops.spearman = (this.state.troops.spearman || 0) + 10;
  
  if (window.SoundManager) window.SoundManager.playSuccess();
  this.notifyListeners('troops');
  return { success: true, msg: `⚔️ Söldner von ${nationId} angeworben! (+10 Schwertkämpfer, +10 Speerkämpfer)` };
};

GameStateManager.prototype.sendAidPackage = function(nationId) {
  this.initDiplomacy();
  const dip = this.state.diplomacy[nationId];
  if (!dip) return { success: false, msg: 'Ungültige Nation.' };

  const aid = { food: 200, wood: 200 };
  if (!this.hasResources(aid)) {
    return { success: false, msg: 'Nicht genug Nahrung und Holz für ein Hilfspaket!' };
  }

  this.deductResources(aid);
  dip.relation = Math.min(100, (dip.relation || 0) + 15);
  if (window.SoundManager) window.SoundManager.playSuccess();
  this.notifyListeners('diplomacy');
  return { success: true, msg: `📦 Hilfspaket an ${nationId} gesendet! Beziehung +15` };
};


