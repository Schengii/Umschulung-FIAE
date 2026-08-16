// --- ROYAL DECREES & KINGDOM LEGISLATION SYSTEM ---

class RoyalDecreesManager {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.decrees = [
      {
        id: 'tax_raise',
        name: '💰 Großes Steuer-Edikt',
        desc: '+50% Steuereinnahmen, aber -15% Bürger-Zufriedenheit',
        icon: '💰',
        goldMult: 1.5,
        happinessMod: -15
      },
      {
        id: 'conscription',
        name: '⚔️ Zwangsaushebung',
        desc: '-30% Rekrutierungsdauer, aber -5 Nahrung/Min',
        icon: '⚔️',
        recruitSpeed: 0.7,
        foodCostPerMin: 5
      },
      {
        id: 'merchant_freedom',
        name: '⚖️ Handelsfreiheiten',
        desc: '+30% Markt-Handelsgewinne, aber -10% Steuern',
        icon: '⚖️',
        tradeMult: 1.3,
        goldMult: 0.9
      },
      {
        id: 'festival_bounty',
        name: '🎪 Königsfest-Erlass',
        desc: '+25 Zufriedenheit, kostet 50 Gold/Min',
        icon: '🎪',
        happinessMod: 25,
        goldCostPerMin: 50
      },
      {
        id: 'iron_production',
        name: '⛏️ Bergbau-Dekret',
        desc: '+50% Eisenproduktion, -20% Holzproduktion',
        icon: '⛏️',
        ironMult: 1.5,
        woodMult: 0.8
      },
      {
        id: 'fortress_defense',
        name: '🛡️ Festungs-Edikt',
        desc: '+30% Verteidigungsstärke aller Mauern, +10 Truppen-Moral',
        icon: '🛡️',
        defenseMult: 1.3,
        moralBonus: 10
      }
    ];
  }

  init() {
    if (!stateManager.state.activeDecrees) {
      stateManager.state.activeDecrees = [];
    }
  }

  // ============================================================
  // NEU: Gibt den kombinierten Bonus aller aktiven Erlasse zurück
  // Wird von state.js, population.js, marketplace.js aufgerufen
  // ============================================================
  getDecreeBonus(bonusType) {
    this.init();
    const activeIds = stateManager.state.activeDecrees || [];
    let totalBonus = bonusType.endsWith('Mult') ? 1.0 : 0;

    for (const decreeId of activeIds) {
      const decree = this.decrees.find(d => d.id === decreeId);
      if (!decree) continue;

      switch (bonusType) {
        case 'goldMult':
          if (decree.goldMult !== undefined) totalBonus *= decree.goldMult;
          break;
        case 'tradeMult':
          if (decree.tradeMult !== undefined) totalBonus *= decree.tradeMult;
          break;
        case 'recruitSpeedMult':
          if (decree.recruitSpeed !== undefined) totalBonus *= decree.recruitSpeed;
          break;
        case 'happinessMod':
          if (decree.happinessMod !== undefined) totalBonus += decree.happinessMod;
          break;
        case 'ironMult':
          if (decree.ironMult !== undefined) totalBonus *= decree.ironMult;
          break;
        case 'woodMult':
          if (decree.woodMult !== undefined) totalBonus *= (decree.woodMult || 1.0);
          break;
        case 'defenseMult':
          if (decree.defenseMult !== undefined) totalBonus *= decree.defenseMult;
          break;
        case 'moralBonus':
          if (decree.moralBonus !== undefined) totalBonus += decree.moralBonus;
          break;
      }
    }
    return totalBonus;
  }

  // ============================================================
  // NEU: Tick-Kosten für aktive Erlasse (goldCostPerMin, foodCostPerMin)
  // Wird von state.js tick() aufgerufen
  // ============================================================
  tickDecreeCosts(dt) {
    this.init();
    const activeIds = stateManager.state.activeDecrees || [];
    const res = stateManager.state.resources;

    for (const decreeId of activeIds) {
      const decree = this.decrees.find(d => d.id === decreeId);
      if (!decree) continue;

      // festival_bounty: Kostet Gold pro Minute
      if (decree.goldCostPerMin) {
        const goldCost = (decree.goldCostPerMin / 60) * dt;
        if ((res.gold || 0) >= goldCost) {
          res.gold -= goldCost;
        } else {
          // Kein Gold mehr → Erlass automatisch aufheben
          const idx = stateManager.state.activeDecrees.indexOf(decreeId);
          if (idx >= 0) stateManager.state.activeDecrees.splice(idx, 1);
          if (window.gameUI) gameUI.showFloatingNotification(`💸 Kein Gold für "${decree.name}"! Erlass aufgehoben.`);
        }
      }

      // conscription: Verbraucht Nahrung pro Minute
      if (decree.foodCostPerMin) {
        const foodCost = (decree.foodCostPerMin / 60) * dt;
        res.food = Math.max(0, (res.food || 0) - foodCost);
      }
    }
  }

  showModal() {
    this.init();
    const active = stateManager.state.activeDecrees;

    // Zeige aktive Boni zusammengefasst
    const goldBonus = this.getDecreeBonus('goldMult');
    const happinessBonus = this.getDecreeBonus('happinessMod');
    const tradeBonus = this.getDecreeBonus('tradeMult');

    let activeBonusText = '';
    if (active.length > 0) {
      const parts = [];
      if (goldBonus !== 1.0) parts.push(`💰 Gold x${goldBonus.toFixed(2)}`);
      if (happinessBonus !== 0) parts.push(`😊 Zufriedenheit ${happinessBonus > 0 ? '+' : ''}${happinessBonus}`);
      if (tradeBonus !== 1.0) parts.push(`⚖️ Handel x${tradeBonus.toFixed(2)}`);
      activeBonusText = parts.join(' | ');
    }

    let content = `
      <div style="padding: 10px; max-height: 75vh; overflow-y: auto;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">📜 Königliche Erlasse & Gesetze</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 8px;">Setze königliche Edikte in Kraft – max. 2 gleichzeitig. Alle Effekte wirken sofort!</p>
        ${activeBonusText ? `<div style="background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.4); border-radius: 6px; padding: 8px; margin-bottom: 12px; font-size: 0.82em; color: #ffd700;">✨ Aktive Boni: ${activeBonusText}</div>` : ''}
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
    `;

    this.decrees.forEach(d => {
      const isActive = active.includes(d.id);
      content += `
        <div style="background: rgba(20,25,35,0.85); border: 1px solid ${isActive ? '#4CAF50' : 'rgba(212,175,55,0.3)'}; border-radius: 6px; padding: 12px;">
          <h3 style="color: #ffd700; margin-bottom: 4px;">${d.name}</h3>
          <div style="font-size: 0.8em; color: ${isActive ? '#4CAF50' : '#aaa'}; margin-bottom: 10px;">${d.desc}</div>
          ${isActive ? `
            <div style="font-size: 0.75em; color: #4CAF50; margin-bottom: 6px;">✓ Aktiv – Effekte werden angewendet</div>
            <button onclick="window.royalDecreesManager.toggleDecree('${d.id}')" style="width: 100%; padding: 6px; background: #e74c3c; color: #fff; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
              ✖️ Erlass Aufheben
            </button>
          ` : `
            <button onclick="window.royalDecreesManager.toggleDecree('${d.id}')" style="width: 100%; padding: 6px; background: linear-gradient(135deg, #d4af37, #aa820a); color: #111; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
              ⚖️ In Kraft Setzen
            </button>
          `}
        </div>
      `;
    });

    content += `</div></div>`;
    this.gameUI.showModal('Königliche Erlasse', content);
  }

  toggleDecree(decreeId) {
    this.init();
    const active = stateManager.state.activeDecrees;
    const idx = active.indexOf(decreeId);
    if (idx >= 0) {
      active.splice(idx, 1);
      const decree = this.decrees.find(d => d.id === decreeId);
      this.gameUI.showFloatingNotification(`⚖️ Erlass "${decree?.name}" aufgehoben.`);
    } else {
      if (active.length >= 2) {
        this.gameUI.showFloatingNotification('Maximal 2 Erlasse gleichzeitig aktivierbar!');
        return;
      }
      active.push(decreeId);
      const decree = this.decrees.find(d => d.id === decreeId);
      this.gameUI.showFloatingNotification(`📜 Neuer Erlass "${decree?.name}" in Kraft gesetzt! Effekte wirken sofort.`);
      if (window.gameSound) window.gameSound.playSFX('quest');
    }
    stateManager.save();
    this.showModal();
  }
}

window.RoyalDecreesManager = RoyalDecreesManager;
