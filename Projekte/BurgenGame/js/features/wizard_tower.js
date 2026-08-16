// --- WIZARD TOWER & ARCANE SPELLS SYSTEM ---

class WizardTowerManager {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.spells = [
      { id: 'firestorm', name: '🔥 Feuerregen', desc: 'Fügt allen feindlichen Einheiten im Kampf 40 Schaden zu', costMana: 30 },
      { id: 'harvest_blessing', name: '🌾 Segen der Fruchtbarkeit', desc: 'Verdoppelt die Ernte- und Holzproduktion für 5 Minuten', costMana: 25 },
      { id: 'stone_shield', name: '🛡️ Steinpanzer', desc: '+50% Verteidigung für alle Mauern & Truppen', costMana: 20 }
    ];
  }

  init() {
    if (!stateManager.state.mana) stateManager.state.mana = 50;
    if (!stateManager.state.maxMana) stateManager.state.maxMana = 100;
  }

  showModal() {
    this.init();
    const mana = stateManager.state.mana || 50;
    const maxMana = stateManager.state.maxMana || 100;

    let content = `
      <div style="padding: 10px; max-height: 75vh; overflow-y: auto;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">🧙 Magieturm & Arkanzauber</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 12px;">Wirke mächtige Reichsmagie zur Unterstützung deiner Wirtschaft und Armee.</p>

        <div style="background: rgba(20,25,35,0.85); border: 1px solid #9b59b6; border-radius: 6px; padding: 12px; margin-bottom: 15px; text-align: center;">
          <div style="font-size: 1.3rem; font-weight: bold; color: #af7ac5;">🔮 Mana: ${mana} / ${maxMana}</div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
    `;

    this.spells.forEach(sp => {
      const canCast = mana >= sp.costMana;
      content += `
        <div style="background: rgba(15,20,30,0.8); border: 1px solid rgba(155,89,182,0.3); border-radius: 6px; padding: 12px;">
          <h3 style="color: #da70d6; margin-bottom: 4px;">${sp.name}</h3>
          <div style="font-size: 0.8em; color: #aaa; margin-bottom: 8px;">${sp.desc}</div>
          <div style="font-size: 0.75em; color: #bdc3c7; margin-bottom: 10px;">Mana-Kosten: ${sp.costMana}</div>
          <button onclick="window.wizardTowerManager.castSpell('${sp.id}')" style="width: 100%; padding: 6px; background: ${canCast ? 'linear-gradient(135deg, #8e44ad, #5e3370)' : '#555'}; color: #fff; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
            🔮 Zauber Wirken
          </button>
        </div>
      `;
    });

    content += `</div></div>`;
    this.gameUI.showModal('Magieturm', content);
  }

  castSpell(spellId) {
    this.init();
    const spell = this.spells.find(s => s.id === spellId);
    if (!spell) return;

    if ((stateManager.state.mana || 0) < spell.costMana) {
      this.gameUI.showFloatingNotification('Nicht genug Mana für diesen Arkanzauber!');
      return;
    }

    stateManager.state.mana -= spell.costMana;
    stateManager.save();

    this.gameUI.showFloatingNotification(`✨ Arkanzauber "${spell.name}" gewirkt!`);
    if (window.gameSound) window.gameSound.playSFX('quest');
    this.showModal();
  }

  tick() {
    this.init();
    if (stateManager.state.mana < stateManager.state.maxMana) {
      stateManager.state.mana = Math.min(stateManager.state.maxMana, stateManager.state.mana + 1);
    }
  }

  craftElementalRune(element = 'fire') {
    this.init();
    const state = stateManager.state;
    const costGems = 5;
    if ((state.resources.gems || 0) < costGems) {
      return { success: false, msg: 'Nicht genug Edelsteine zum Runenschmieden!' };
    }
    state.resources.gems -= costGems;
    if (!state.runes) state.runes = [];
    const rune = { id: `rune_${element}_${Date.now()}`, element, power: 25 };
    state.runes.push(rune);
    stateManager.save();
    return { success: true, rune, msg: `🔮 Elementar-Rune (${element.toUpperCase()}) geschmiedet!` };
  }

  enchantWalls(runeId) {
    this.init();
    const state = stateManager.state;
    if (!state.wallEnchantment) state.wallEnchantment = null;
    state.wallEnchantment = { runeId, enchantedAt: Date.now() };
    stateManager.save();
    return { success: true, msg: '✨ Burgmauern mit Elementarrune verzaubert!' };
  }

  socketRuneToEquipment(itemId = 'weapon', runeId = 'fire') {
    this.init();
    const state = stateManager.state;
    if (!state.socketedRunes) state.socketedRunes = {};
    state.socketedRunes[itemId] = runeId;
    stateManager.save();
    return { success: true, msg: `💎 Rune in Ausrüstung ${itemId.toUpperCase()} eingesetzt!` };
  }
}

window.WizardTowerManager = WizardTowerManager;

