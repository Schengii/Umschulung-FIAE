// --- THRONEROOM DECORATOR & INTERIOR VIEW ---

class ThroneroomDecorator {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.decorations = [
      {
        id: 'throne_gold',
        name: '👑 Goldener Kaiserthron',
        bonus: '+10 Zufriedenheits-Basis & +15% Diplomatie-Ruf',
        cost: { gold: 2000, rubies: 15 },
        happinessBonus: 10,
        diplomaticBonus: 0.15
      },
      {
        id: 'carpet_royal',
        name: '🔴 Purpurner Prunkteppich',
        bonus: '+8 Zufriedenheit der Bevölkerung',
        cost: { gold: 800, wood: 400 },
        happinessBonus: 8
      },
      {
        id: 'chandelier_crystal',
        name: '🕯️ Kristall-Kronleuchter',
        bonus: '+20% Prestige-Punkte & +5 Zufriedenheit',
        cost: { gold: 1200, stone: 600 },
        happinessBonus: 5,
        prestigeBonus: 0.20
      },
      {
        id: 'trophy_dragon_head',
        name: '🐲 Kopf des Uralten Drachen',
        bonus: '+25% Truppen-Moral (+Kampfstärke)',
        cost: { gold: 2500, rubies: 25 },
        combatMoralBonus: 0.25
      }
    ];
  }

  init() {
    if (!stateManager.state.throneroom) {
      stateManager.state.throneroom = { activeItems: [] };
    }
  }

  // ============================================================
  // NEU: Gibt den Happiness-Bonus aller installierten Dekorationen zurück
  // Wird von population.js calculateHappiness() aufgerufen
  // ============================================================
  getTotalHappinessBonus() {
    this.init();
    const activeItems = stateManager.state.throneroom.activeItems || [];
    let bonus = 0;
    for (const decor of this.decorations) {
      if (activeItems.includes(decor.id) && decor.happinessBonus) {
        bonus += decor.happinessBonus;
      }
    }
    return bonus;
  }

  // ============================================================
  // NEU: Gibt den Kampf-Moral-Bonus zurück
  // Wird von tactical_combat.js aufgerufen
  // ============================================================
  getCombatMoralBonus() {
    this.init();
    const activeItems = stateManager.state.throneroom.activeItems || [];
    let bonus = 0;
    for (const decor of this.decorations) {
      if (activeItems.includes(decor.id) && decor.combatMoralBonus) {
        bonus += decor.combatMoralBonus;
      }
    }
    return bonus;
  }

  // ============================================================
  // NEU: Gibt den Prestige-Bonus zurück
  // ============================================================
  getPrestigeBonus() {
    this.init();
    const activeItems = stateManager.state.throneroom.activeItems || [];
    let bonus = 0;
    for (const decor of this.decorations) {
      if (activeItems.includes(decor.id) && decor.prestigeBonus) {
        bonus += decor.prestigeBonus;
      }
    }
    return bonus;
  }

  showModal() {
    this.init();
    const throneroom = stateManager.state.throneroom;

    let content = `
      <div style="padding: 10px;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">🏛️ Thronsaal-Dekorateur & Innenansicht</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 16px;">Richte deinen royalen Thronsaal ein! Alle Dekorationen haben echte Spieleffekte.</p>

        <div style="background: linear-gradient(180deg, #1a1b26, #0f1015); border: 2px solid #d4af37; border-radius: 8px; padding: 15px; margin-bottom: 16px; text-align: center;">
          <h3 style="color: #ffd700; font-family: 'Cinzel', serif; margin-bottom: 8px;">👑 Thronsaal des Reiches</h3>
          <div style="font-size: 2.5em; margin: 10px 0;">
            ${throneroom.activeItems.includes('chandelier_crystal') ? '🕯️ ' : ''}
            ${throneroom.activeItems.includes('carpet_royal') ? '🟥 ' : ''}
            ${throneroom.activeItems.includes('throne_gold') ? '👑' : '🪑'}
            ${throneroom.activeItems.includes('trophy_dragon_head') ? ' 🐲' : ''}
          </div>
          <div style="font-size: 0.85em; color: #4CAF50;">
            Ausgestattete Dekorationen: ${throneroom.activeItems.length} / ${this.decorations.length}
          </div>
          ${this.getTotalHappinessBonus() > 0 ? `
            <div style="font-size: 0.8em; color: #f1c40f; margin-top: 4px;">
              ✨ Aktive Boni: +${this.getTotalHappinessBonus()} Zufriedenheit
              ${this.getCombatMoralBonus() > 0 ? ` | +${Math.round(this.getCombatMoralBonus() * 100)}% Truppen-Moral` : ''}
              ${this.getPrestigeBonus() > 0 ? ` | +${Math.round(this.getPrestigeBonus() * 100)}% Prestige` : ''}
            </div>
          ` : ''}
        </div>

        <h3 style="color: #e5c158; margin-bottom: 8px;">Verfügbare Einrichtung:</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
    `;

    this.decorations.forEach(decor => {
      const isInstalled = throneroom.activeItems.includes(decor.id);
      const costText = Object.entries(decor.cost).map(([k, v]) => `${v} ${k}`).join(', ');

      content += `
        <div style="background: rgba(15,20,30,0.8); border: 1px solid ${isInstalled ? '#4CAF50' : 'rgba(255,255,255,0.1)'}; border-radius: 6px; padding: 10px;">
          <h4 style="color: #fff; margin-bottom: 4px;">${decor.name}</h4>
          <div style="font-size: 0.8em; color: #4CAF50; margin-bottom: 8px;">${decor.bonus}</div>
          ${isInstalled ? `
            <div style="color: #4CAF50; font-weight: bold; font-size: 0.8em; text-align: center;">✓ Im Thronsaal Aufgestellt – Bonus Aktiv!</div>
          ` : `
            <div style="font-size: 0.75em; color: #888; margin-bottom: 8px;">
              Kosten: ${costText}
            </div>
            <button onclick="window.throneroomDecorator.buyDecoration('${decor.id}')"
                    style="width: 100%; padding: 6px; background: linear-gradient(135deg, #d4af37, #aa820a); color: #111; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
              🔨 Einrichten
            </button>
          `}
        </div>
      `;
    });

    content += `</div></div>`;
    this.gameUI.showModal('Thronsaal-Dekorateur', content);
  }

  buyDecoration(decorId) {
    this.init();
    const decor = this.decorations.find(d => d.id === decorId);
    if (!decor) return;

    // BUG FIX: Verwende state.resources.* statt state.gold/wood/stone/gems
    const res = stateManager.state.resources;
    if ((res.gold || 0) < (decor.cost.gold || 0) ||
        (res.wood || 0) < (decor.cost.wood || 0) ||
        (res.stone || 0) < (decor.cost.stone || 0) ||
        (res.rubies || 0) < (decor.cost.rubies || 0)) {
      this.gameUI.showFloatingNotification('Nicht genug Rohstoffe für diese Einrichtung!');
      return;
    }

    res.gold = (res.gold || 0) - (decor.cost.gold || 0);
    res.wood = (res.wood || 0) - (decor.cost.wood || 0);
    res.stone = (res.stone || 0) - (decor.cost.stone || 0);
    res.rubies = (res.rubies || 0) - (decor.cost.rubies || 0);

    stateManager.state.throneroom.activeItems.push(decorId);
    stateManager.save();
    // Neuberechnung der Zufriedenheit anstoßen
    stateManager.notifyListeners('throneroom_updated');
    this.gameUI.showFloatingNotification(`🏛️ "${decor.name}" wurde im Thronsaal aufgestellt! Bonus ist jetzt aktiv.`);
    if (window.gameSound) window.gameSound.playSFX('upgrade');
    this.showModal();
  }

  holdRoyalCourt() {
    this.init();
    const state = this.stateManager.state;
    const petitions = [
      { title: '🥖 Brot-Subvention', desc: 'Die Gilde der Bäcker bittet um 300 Gold Mehl-Subvention.', cost: 300, happiness: 15, gold: 0 },
      { title: '⚒️ Zunft-Privilegien', desc: 'Die Steinmetze wollen Steuerbefreiung für Bauprojekte.', cost: 0, happiness: 10, gold: 500 }
    ];
    const pet = petitions[Math.floor(Math.random() * petitions.length)];
    // state.resources.gold ist korrekt (bereits war dieser Teil in Ordnung)
    if ((state.resources.gold || 0) >= pet.cost) {
      state.resources.gold = (state.resources.gold || 0) - pet.cost + pet.gold;
      state.happiness = Math.min(100, (state.happiness || 50) + pet.happiness);
      this.gameUI.showFloatingNotification(`🏛️ Königliche Audienz: "${pet.title}" stattgegeben! (+${pet.happiness}% Zufriedenheit)`);
      stateManager.save();
      return { success: true, petition: pet };
    }
    return { success: false, msg: 'Nicht genug Gold für dieses Urteil!' };
  }

  enactDecree(decreeId = 'brot_subvention') {
    this.init();
    const state = this.stateManager.state;
    if (!state.activeDecrees) state.activeDecrees = [];
    if (!state.activeDecrees.includes(decreeId)) {
      state.activeDecrees.push(decreeId);
    }
    state.happiness = Math.min(100, (state.happiness || 50) + 10);
    stateManager.save();
    this.gameUI.showFloatingNotification(`📜 Dekret "${decreeId.toUpperCase()}" vom Adelsrat erlassen!`);
    return { success: true, decreeId };
  }
}

window.ThroneroomDecorator = ThroneroomDecorator;
