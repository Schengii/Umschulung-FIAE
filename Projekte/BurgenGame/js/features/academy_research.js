// --- ACADEMY & RESEARCH TREE FEATURE ---

// Initialisiert das fortgeschrittene Forschungssystem im State
GameStateManager.prototype.initAdvancedResearch = function() {
  if (!this.state.researchProgress) {
    this.state.researchProgress = {};
  }
};

// Überprüft, ob eine Technologie erforscht werden kann
GameStateManager.prototype.canResearchTech = function(techId) {
  this.initAdvancedResearch();
  const config = ADVANCED_RESEARCH_CONFIG[techId];
  if (!config) return false;

  // Bereits erforscht?
  if (this.state.researchProgress[techId] && this.state.researchProgress[techId].completed) {
    return false;
  }

  // Voraussetzung erfüllt?
  if (config.requires) {
    const parentTech = this.state.researchProgress[config.requires];
    if (!parentTech || !parentTech.completed) {
      return false;
    }
  }

  // Ressourcen vorhanden?
  return this.hasResources(config.cost);
};

// Startet oder schließt eine Forschung ab
GameStateManager.prototype.researchTech = function(techId) {
  if (!this.canResearchTech(techId)) {
    return false;
  }

  const config = ADVANCED_RESEARCH_CONFIG[techId];
  this.deductResources(config.cost);

  // Forschung abschließen
  this.state.researchProgress[techId] = {
    completed: true,
    unlockedAt: Date.now()
  };

  // Legacy state für Kompatibilität mit dem alten System aktualisieren
  if (!this.state.research) this.state.research = {};
  this.state.research[techId] = true;

  // Statistiken aktualisieren
  if (this.state.statistics) {
    this.state.statistics.techsResearched = (this.state.statistics.techsResearched || 0) + 1;
  }

  this.save();
  this.notifyListeners('research_completed');
  return true;
};

// Technologiebaum-Konfiguration
const ADVANCED_RESEARCH_CONFIG = {
  // --- ÖKONOMIE ---
  eco_plenty: {
    name: 'Füllhorn-Ernte',
    desc: '+15% Nahrungsproduktion durch modernisierte Feldwirtschaft.',
    cost: { gold: 150, wood: 100 },
    category: 'economy',
    requires: null
  },
  eco_lumber_jacking: {
    name: 'Dampf-Sägewerk',
    desc: '+15% Holzproduktion durch optimierte Holzfällerei.',
    cost: { gold: 200, wood: 200 },
    category: 'economy',
    requires: 'eco_plenty'
  },
  eco_gold_standard: {
    name: 'Goldwährung',
    desc: '+20% Steuereinnahmen und höhere Hauserträge.',
    cost: { gold: 400, stone: 300 },
    category: 'economy',
    requires: 'eco_lumber_jacking'
  },

  // --- MILITÄR ---
  mil_weaponry: {
    name: 'Gehärtete Klingen',
    desc: '+12% Nahkampfangriffskraft für alle Soldaten.',
    cost: { gold: 150, iron: 50 },
    category: 'military',
    requires: null
  },
  mil_ballistics: {
    name: 'Zahnrad-Ballistik',
    desc: '+15% Fernkampfangriffskraft für Bogenschützen.',
    cost: { gold: 250, wood: 150 },
    category: 'military',
    requires: 'mil_weaponry'
  },
  mil_siege_tactics: {
    name: 'Belagerungs-Ingenieure',
    desc: '+20% Konterschaden gegen feindliche Mauern.',
    cost: { gold: 450, iron: 150, weapons: 10 },
    category: 'military',
    requires: 'mil_ballistics'
  },
  mil_card_heal: {
    name: 'Heilungs-Runen',
    desc: 'Schaltet die Herstellung von Heilungs-Kampfkarten frei.',
    cost: { gold: 200, wood: 100 },
    category: 'military',
    requires: 'mil_weaponry'
  },
  mil_card_shield: {
    name: 'Taktischer Schildwall',
    desc: 'Schaltet die Herstellung von Schildwall-Kampfkarten frei.',
    cost: { gold: 250, stone: 150 },
    category: 'military',
    requires: 'mil_card_heal'
  },
  mil_card_arrow: {
    name: 'Pfeilregen-Fokus',
    desc: 'Schaltet die Herstellung von Pfeilhagel-Kampfkarten frei.',
    cost: { gold: 300, iron: 100 },
    category: 'military',
    requires: 'mil_card_shield'
  },

  // --- DIPLOMATIE ---
  dip_ambassadors: {
    name: 'Diplomatische Vertretung',
    desc: 'Reduziert die Abklingzeit von Diplomatie-Aktionen um 20%.',
    cost: { gold: 200, food: 150 },
    category: 'diplomacy',
    requires: null
  },
  dip_tribute_masters: {
    name: 'Einschüchterung',
    desc: 'Erhöht die Erfolgschance für Tributforderungen um 15% absolut.',
    cost: { gold: 300, stone: 200 },
    category: 'diplomacy',
    requires: 'dip_ambassadors'
  },
  dip_world_trade: {
    name: 'Kaiserliche Freihandelszone',
    desc: 'Ermöglicht lukrativere Handelskarren-Lieferungen (+25% Ertrag).',
    cost: { gold: 500, iron: 100, rubies: 10 },
    category: 'diplomacy',
    requires: 'dip_tribute_masters'
  }
};

// UI: Akademie/Forschungsbaum Modal öffnen
GameUI.prototype.openAcademyResearchModal = function() {
  stateManager.initAdvancedResearch();
  const state = stateManager.state;

  let economyHtml = '';
  let militaryHtml = '';
  let diplomacyHtml = '';

  const renderTechCard = (techId, config) => {
    const progress = state.researchProgress[techId] || {};
    const isCompleted = !!progress.completed;
    const canResearch = stateManager.canResearchTech(techId);

    // Voraussetzungen beschreiben
    let reqText = '';
    if (config.requires) {
      const parentCompleted = state.researchProgress[config.requires]?.completed;
      if (!parentCompleted) {
        const parentCfg = ADVANCED_RESEARCH_CONFIG[config.requires];
        reqText = `<div style="color: #e74c3c; font-size: 0.72rem; margin-top: 3px;">🔒 Benötigt: ${parentCfg.name}</div>`;
      }
    }

    const costText = Object.entries(config.cost)
      .map(([res, val]) => `${val} ${res === 'gold' ? '🪙' : res === 'wood' ? '🪵' : res === 'stone' ? '🪨' : res === 'iron' ? '⛓️' : res === 'rubies' ? '💎' : '📦'}`)
      .join(' | ');

    return `
      <div class="glass-card research-node-card" style="padding: 12px; margin-bottom: 10px; border-left: 4px solid ${isCompleted ? '#2ecc71' : canResearch ? '#f1c40f' : '#7f8c8d'}; opacity: ${isCompleted ? '1' : canResearch ? '1' : '0.6'};">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <h4 style="margin: 0; font-size: 0.9rem; color: var(--color-gold-hover);">${config.name}</h4>
          ${isCompleted ? '<span style="color: #2ecc71; font-weight: bold; font-size: 0.75rem;">✓ Erforscht</span>' : ''}
        </div>
        <p style="font-size: 0.75rem; color: var(--color-text-muted); margin: 6px 0;">${config.desc}</p>
        <div style="font-size: 0.72rem; color: #bdc3c7;">Kosten: ${costText}</div>
        ${reqText}
        ${!isCompleted ? `
          <button class="primary-btn btn-research-start" data-tech="${techId}" ${canResearch ? '' : 'disabled'} style="margin-top: 8px; font-size: 0.72rem; padding: 4px 8px; width: 100%;">
            Forschung starten
          </button>
        ` : ''}
      </div>
    `;
  };

  Object.entries(ADVANCED_RESEARCH_CONFIG).forEach(([techId, config]) => {
    const cardHtml = renderTechCard(techId, config);
    if (config.category === 'economy') economyHtml += cardHtml;
    if (config.category === 'military') militaryHtml += cardHtml;
    if (config.category === 'diplomacy') diplomacyHtml += cardHtml;
  });

  // Kampfkarten Herstellung
  stateManager.initBattleCards();
  const cards = stateManager.state.battleCards;
  const healResearched = state.researchProgress?.['mil_card_heal']?.completed;
  const shieldResearched = state.researchProgress?.['mil_card_shield']?.completed;
  const arrowResearched = state.researchProgress?.['mil_card_arrow']?.completed;

  let craftingHtml = `
    <div class="glass-panel" style="margin-top: 20px; padding: 15px; border-color: rgba(212,175,55,0.4);">
      <h3 style="color: #d4af37; margin-top: 0; margin-bottom: 10px; font-family: 'Cinzel', serif;">🎴 Kampfkarten-Werkstatt</h3>
      <p style="font-size: 0.8rem; margin: 0 0 12px 0; color: #bdc3c7;">Stelle magische und taktische Karten her, um sie live in Schlachten einzusetzen.</p>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
        <!-- Heal -->
        <div class="glass-card" style="padding: 10px; text-align: center; opacity: ${healResearched ? 1 : 0.5};">
          <h4 style="margin: 0 0 5px 0; color: #2ecc71;">💚 Heilung (x${cards.heal})</h4>
          <span style="font-size: 0.7rem; color: #aaa;">Kosten: 100 🪙 | 50 🪵</span>
          <button class="primary-btn btn-craft-card" data-card="heal" ${stateManager.canCraftCard('heal') ? '' : 'disabled'} style="margin-top: 8px; font-size: 0.7rem; padding: 3px 6px; width: 100%;">
            ${healResearched ? 'Herstellen' : '🔒 Gesperrt'}
          </button>
        </div>
        <!-- Shield -->
        <div class="glass-card" style="padding: 10px; text-align: center; opacity: ${shieldResearched ? 1 : 0.5};">
          <h4 style="margin: 0 0 5px 0; color: #3498db;">🛡️ Schildwall (x${cards.shield})</h4>
          <span style="font-size: 0.7rem; color: #aaa;">Kosten: 120 🪙 | 60 🪨</span>
          <button class="primary-btn btn-craft-card" data-card="shield" ${stateManager.canCraftCard('shield') ? '' : 'disabled'} style="margin-top: 8px; font-size: 0.7rem; padding: 3px 6px; width: 100%;">
            ${shieldResearched ? 'Herstellen' : '🔒 Gesperrt'}
          </button>
        </div>
        <!-- Arrow -->
        <div class="glass-card" style="padding: 10px; text-align: center; opacity: ${arrowResearched ? 1 : 0.5};">
          <h4 style="margin: 0 0 5px 0; color: #e74c3c;">🏹 Pfeilhagel (x${cards.arrow})</h4>
          <span style="font-size: 0.7rem; color: #aaa;">Kosten: 150 🪙 | 50 ⛓️</span>
          <button class="primary-btn btn-craft-card" data-card="arrow" ${stateManager.canCraftCard('arrow') ? '' : 'disabled'} style="margin-top: 8px; font-size: 0.7rem; padding: 3px 6px; width: 100%;">
            ${arrowResearched ? 'Herstellen' : '🔒 Gesperrt'}
          </button>
        </div>
      </div>
    </div>
  `;

  const html = `
    <h2>🧪 Akademie & Technologiebaum</h2>
    <p class="modal-intro">Erforsche neue Errungenschaften, um Wirtschaft, Militär und Diplomatie deines Reiches dauerhaft zu verbessern.</p>
    
    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-top: 15px;">
      <div>
        <h3 style="color: #2ecc71; border-bottom: 2px solid rgba(46, 204, 113, 0.3); padding-bottom: 6px; margin-bottom: 12px;">🌾 Ökonomie</h3>
        ${economyHtml}
      </div>
      <div>
        <h3 style="color: #e74c3c; border-bottom: 2px solid rgba(231, 76, 60, 0.3); padding-bottom: 6px; margin-bottom: 12px;">⚔️ Militär</h3>
        ${militaryHtml}
      </div>
      <div>
        <h3 style="color: #3498db; border-bottom: 2px solid rgba(52, 152, 219, 0.3); padding-bottom: 6px; margin-bottom: 12px;">🤝 Diplomatie</h3>
        ${diplomacyHtml}
      </div>
    </div>

    ${craftingHtml}

    <button id="btn-academy-close" class="primary-btn gold-btn" style="margin-top: 20px; width: 100%;">Schließen</button>
  `;

  this.openModal(html);
  document.getElementById('btn-academy-close').addEventListener('click', () => this.closeModal());

  document.querySelectorAll('.btn-research-start').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const techId = e.target.getAttribute('data-tech');
      if (stateManager.researchTech(techId)) {
        this.openAcademyResearchModal();
        this.showFloatingNotification('🧪 Forschung erfolgreich abgeschlossen!');
      } else {
        this.showFloatingNotification('⚠️ Forschung fehlgeschlagen.');
      }
    });
  });

  document.querySelectorAll('.btn-craft-card').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cardId = e.target.getAttribute('data-card');
      if (stateManager.craftCard(cardId)) {
        this.openAcademyResearchModal();
        this.showFloatingNotification('🎴 Karte erfolgreich hergestellt!');
      } else {
        this.showFloatingNotification('⚠️ Herstellung fehlgeschlagen.');
      }
    });
  });
};

GameStateManager.prototype.initBattleCards = function() {
  if (!this.state.battleCards) {
    this.state.battleCards = { heal: 0, shield: 0, arrow: 0 };
  }
};

GameStateManager.prototype.canCraftCard = function(cardId) {
  this.initBattleCards();
  const costs = {
    heal: { gold: 100, wood: 50 },
    shield: { gold: 120, stone: 60 },
    arrow: { gold: 150, iron: 50 }
  };
  const cost = costs[cardId];
  if (!cost) return false;

  const techIds = {
    heal: 'mil_card_heal',
    shield: 'mil_card_shield',
    arrow: 'mil_card_arrow'
  };
  const techId = techIds[cardId];
  if (!this.state.researchProgress || !this.state.researchProgress[techId] || !this.state.researchProgress[techId].completed) {
    return false;
  }

  return this.hasResources(cost);
};

GameStateManager.prototype.craftCard = function(cardId) {
  if (!this.canCraftCard(cardId)) return false;

  const costs = {
    heal: { gold: 100, wood: 50 },
    shield: { gold: 120, stone: 60 },
    arrow: { gold: 150, iron: 50 }
  };
  this.deductResources(costs[cardId]);
  this.state.battleCards[cardId] = (this.state.battleCards[cardId] || 0) + 1;
  this.save();
  this.notifyListeners('card_crafted');
  return true;
};

