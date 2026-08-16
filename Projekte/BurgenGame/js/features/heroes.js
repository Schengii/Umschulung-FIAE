// --- HEROES FEATURE ---

// Extend GameStateManager with hero recruitment
GameStateManager.prototype.recruitHero = function(heroType) {
  if (this.state.hero) {
    if (window.gameUI) gameUI.showToast('Du hast bereits einen Helden rekrutiert!', 'info');
    return false;
  }

  const cost = { gold: 150 };
  if (!this.hasResources(cost)) {
    if (window.gameUI) gameUI.showToast('Nicht genügend Gold!', 'error');
    return false;
  }

  this.deductResources(cost);
  this.state.hero = {
    type: heroType,
    level: 1
  };

  this.save();
  this.notifyListeners('hero_recruited');
  return true;
};

// Extend GameStateManager with hero leveling
GameStateManager.prototype.levelUpHero = function() {
  if (!this.state.hero) return false;

  const currentLvl = this.state.hero.level;
  const goldCost = 150 + currentLvl * 100;
  const rubyCost = 5 + currentLvl * 5;

  if (this.state.resources.gold < goldCost || this.state.resources.rubies < rubyCost) {
    if (window.gameUI) gameUI.showToast('Zu wenig Ressourcen für das Level-Up!', 'error');
    return false;
  }

  this.state.resources.gold -= goldCost;
  this.state.resources.rubies -= rubyCost;
  this.state.hero.level += 1;
  
  // Add talent point
  this.state.hero.skillPoints = (this.state.hero.skillPoints || 0) + 1;
  if (!this.state.hero.skills) this.state.hero.skills = {};

  this.save();
  this.notifyListeners('hero_levelled');
  return true;
};

// Spend hero skill point
GameStateManager.prototype.learnHeroSkill = function(skillId) {
  if (!this.state.hero) return false;
  if (!this.state.hero.skills) this.state.hero.skills = {};

  const skillPoints = this.state.hero.skillPoints || 0;
  if (skillPoints <= 0) {
    if (window.gameUI) gameUI.showToast('Keine Talentpunkte verfügbar!', 'warning');
    return false;
  }

  const skillCfg = HERO_SKILLS_CONFIG[skillId];
  if (!skillCfg) return false;

  const currentLvl = this.state.hero.skills[skillId] || 0;
  if (currentLvl >= skillCfg.maxLevel) {
    if (window.gameUI) gameUI.showToast('Dieses Talent ist bereits voll ausgebaut!', 'info');
    return false;
  }

  this.state.hero.skillPoints = skillPoints - 1;
  this.state.hero.skills[skillId] = currentLvl + 1;

  this.save();
  this.notifyListeners('hero_skill_learned');
  return true;
};

// HERO SKILL TREE BRANCHES
const HERO_SKILL_TREE_BRANCHES = {
  warlord: {
    name: 'Kriegsherr (Warlord)',
    nodes: [
      { id: 'commander_aura', name: 'Kommandanten-Aura', req: null, val: 0.1, bonusType: 'troop_attack', icon: '⚔️' },
      { id: 'furious_strike', name: 'Wutsturm', req: 'commander_aura', val: 0.15, bonusType: 'attack', icon: '💥' },
      { id: 'battle_hardened', name: 'Schlachtenfestung', req: 'furious_strike', val: 0.2, bonusType: 'troop_defense', icon: '🛡️' }
    ]
  },
  explorer: {
    name: 'Erkunder (Explorer)',
    nodes: [
      { id: 'pathfinder', name: 'Pfadfinder', req: null, val: 0.15, bonusType: 'speed', icon: '🧭' },
      { id: 'treasure_hunter', name: 'Schatzsucher', req: 'pathfinder', val: 0.25, bonusType: 'loot', icon: '💰' },
      { id: 'dungeon_master', name: 'Dungeon-Meister', req: 'treasure_hunter', val: 0.3, bonusType: 'xp', icon: '📜' }
    ]
  },
  paladin: {
    name: 'Paladin (Paladin)',
    nodes: [
      { id: 'divine_shield', name: 'Göttlicher Schild', req: null, val: 50, bonusType: 'hero_max_hp', icon: '✨' },
      { id: 'holy_aura', name: 'Heiliges Licht', req: 'divine_shield', val: 0.2, bonusType: 'defense', icon: '🌟' },
      { id: 'bastion_of_hope', name: 'Bastion der Hoffnung', req: 'holy_aura', val: 0.25, bonusType: 'wall_defense', icon: '🏰' }
    ]
  }
};

// Mercenary Captain Contracts Manager
GameStateManager.prototype.generateMercenaryContracts = function() {
  if (!this.state.mercenaries) {
    this.state.mercenaries = [
      { id: 'merc_1', name: 'Kapitän Eisenhand', trait: 'Eiserne Faust', bonus: '+15% Nahkampf-Schaden', cost: 200, durationSec: 3600, active: false },
      { id: 'merc_2', name: 'Meister-Spion Varis', trait: 'Schattenlauf', bonus: '+25% Spionage-Erfolg', cost: 150, durationSec: 3600, active: false },
      { id: 'merc_3', name: 'Alchemist Nicolas', trait: 'Goldelixier', bonus: '+20% Steuereinnahmen', cost: 250, durationSec: 3600, active: false }
    ];
  }
  return this.state.mercenaries;
};

GameStateManager.prototype.hireMercenary = function(mercId) {
  this.generateMercenaryContracts();
  const merc = this.state.mercenaries.find(m => m.id === mercId);
  if (!merc) return { success: false, msg: 'Söldner nicht gefunden!' };
  if (merc.active) return { success: false, msg: 'Söldner ist bereits angeworben!' };

  if ((this.state.resources.gold || 0) < merc.cost) {
    return { success: false, msg: 'Nicht genügend Gold!' };
  }

  this.state.resources.gold -= merc.cost;
  merc.active = true;
  merc.expiresAt = Date.now() + merc.durationSec * 1000;
  this.save();
  this.notifyListeners('mercenary_hired');
  return { success: true, msg: `🍻 ${merc.name} (${merc.trait}) für 1 Stunde angeworben!` };
};

// Calculate active hero skill bonus
GameStateManager.prototype.getHeroSkillBonus = function(bonusType) {
  if (!this.state.hero || !this.state.hero.skills) return 0;
  let total = 0;
  Object.keys(this.state.hero.skills).forEach(skillId => {
    const lvl = this.state.hero.skills[skillId] || 0;
    const cfg = HERO_SKILLS_CONFIG[skillId];
    if (cfg && cfg.bonusType === bonusType) {
      total += lvl * cfg.valuePerLevel;
    }
  });
  return total;
};

GameStateManager.prototype.getGearSetBonus = function(bonusType) {
  if (!this.state.hero || !this.state.heroEquipment) return 0;
  
  const equipped = [];
  const eq = this.state.heroEquipment;
  if (eq.weapon) equipped.push(eq.weapon);
  if (eq.armor) equipped.push(eq.armor);
  if (eq.accessory) equipped.push(eq.accessory);
  
  let totalBonus = 0;
  
  Object.keys(GEAR_SETS).forEach(setId => {
    const set = GEAR_SETS[setId];
    const count = set.items.filter(itemId => equipped.includes(itemId)).length;
    
    Object.keys(set.bonuses).forEach(reqCount => {
      if (count >= Number(reqCount)) {
        const bonus = set.bonuses[reqCount];
        if (bonus.type === bonusType) {
          totalBonus += bonus.value;
        }
      }
    });
  });
  
  return totalBonus;
};

// Extend GameUI with hero altar modal
GameUI.prototype.openHeroAltarModal = function() {
  const state = stateManager.state;
  const hero = state.hero;

  let html = `
    <h2>🛡️ Heldenaltar - Held verwalten</h2>
  `;

  if (!hero) {
    html += `
      <p class="modal-intro">Wähle einen Helden aus einer der drei Klassen, um dein Königreich anzuführen. Die Rekrutierung kostet 🪙 150 Gold.</p>
      <div class="hero-selection-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
        <div class="glass-card" style="text-align: center; padding: 15px;">
          <h3>🛡️ Paladin</h3>
          <p style="font-size: 0.75rem; color: var(--color-text-muted); margin: 8px 0; min-height: 45px;">
            Göttlicher Beschützer. Gewährt permanent einen Bonus auf die Truppen- & Mauer-Verteidigung (+20%).
          </p>
          <button class="primary-btn recruit-hero-btn" data-type="paladin" ${state.resources.gold < 150 ? 'disabled' : ''}>Beschwören (🪙 150)</button>
        </div>
        <div class="glass-card" style="text-align: center; padding: 15px;">
          <h3>🏹 Waldläufer (Ranger)</h3>
          <p style="font-size: 0.75rem; color: var(--color-text-muted); margin: 8px 0; min-height: 45px;">
            Meisterhafter Fernkämpfer. Erhöht permanent das Truppenangriffstempo (+25% Marschgeschwindigkeit) und die Angriffskraft (+20%).
          </p>
          <button class="primary-btn recruit-hero-btn" data-type="ranger" ${state.resources.gold < 150 ? 'disabled' : ''}>Beschwören (🪙 150)</button>
        </div>
        <div class="glass-card" style="text-align: center; padding: 15px;">
          <h3>🔮 Erzmagier (Archmage)</h3>
          <p style="font-size: 0.75rem; color: var(--color-text-muted); margin: 8px 0; min-height: 45px;">
            Meister der arkanen Künste. Steigert die Effizienz der Wirtschaft und erhöht die Ressourcenproduktion (+15%) sowie passive Steuern (+20%).
          </p>
          <button class="primary-btn recruit-hero-btn" data-type="archmage" ${state.resources.gold < 150 ? 'disabled' : ''}>Beschwören (🪙 150)</button>
        </div>
      </div>
    `;
  } else {
    stateManager.initHeroDungeonState();
    const heroNames = { paladin: 'Paladin', ranger: 'Waldläufer', archmage: 'Erzmagier', warlord: 'Kriegsherr', treasurer: 'Schatzmeister' };
    const heroIcons = { paladin: '🛡️', ranger: '🏹', archmage: '🔮', warlord: '⚔️', treasurer: '🪙' };
    const name = heroNames[hero.type] || hero.type;
    const icon = heroIcons[hero.type] || '👤';
    const level = hero.level;

    let bonusDesc = "";
    if (hero.type === 'paladin') {
      bonusDesc = `Truppen- & Mauer-Verteidigung: <strong>+${20 + (level - 1) * 5}%</strong>`;
    } else if (hero.type === 'ranger' || hero.type === 'warlord') {
      bonusDesc = `Truppen-Angriff & Marschzeit: <strong>+${20 + (level - 1) * 5}%</strong> Angriff, <strong>+25%</strong> Tempo`;
    } else {
      bonusDesc = `Ressourcenprod. & Steuern: <strong>+${15 + (level - 1) * 5}%</strong> Produktion, <strong>+20%</strong> Steuern`;
    }

    const goldCost = 150 + level * 100;
    const rubyCost = 5 + level * 5;
    const canLevel = state.resources.gold >= goldCost && state.resources.rubies >= rubyCost;

    // Build equipment HTML
    const eq = state.heroEquipment || { weapon: null, armor: null, accessory: null };
    const rarityColors = {
      common: '#bdc3c7',
      rare: '#3498db',
      epic: '#9b59b6',
      legendary: '#f1c40f'
    };
    const getItemColoredName = (itemId, fallback) => {
      if (!itemId) return fallback;
      const itemCfg = ITEMS_CONFIG[itemId];
      if (!itemCfg) return fallback;
      const color = rarityColors[itemCfg.rarity || 'common'];
      return `<span style="color: ${color}; font-weight: bold;">${itemCfg.name}</span>`;
    };
    const weaponName = getItemColoredName(eq.weapon, 'Keine Waffe');
    const armorName = getItemColoredName(eq.armor, 'Keine Rüstung');
    const accName = getItemColoredName(eq.accessory, 'Kein Amulett');

    // Calculate set bonuses to display
    let activeSetBonusHtml = '';
    const equippedItemsList = [];
    if (eq.weapon) equippedItemsList.push(eq.weapon);
    if (eq.armor) equippedItemsList.push(eq.armor);
    if (eq.accessory) equippedItemsList.push(eq.accessory);

    Object.keys(GEAR_SETS).forEach(setId => {
      const set = GEAR_SETS[setId];
      const count = set.items.filter(itemId => equippedItemsList.includes(itemId)).length;
      if (count > 0) {
        let bonusesListHtml = '';
        Object.keys(set.bonuses).forEach(reqCount => {
          const bonus = set.bonuses[reqCount];
          const isActive = count >= Number(reqCount);
          bonusesListHtml += `<div style="color: ${isActive ? '#2ecc71' : '#7f8c8d'}; margin-left: 10px; font-size: 0.72rem;">
            ${isActive ? '●' : '○'} (${reqCount} Teile): ${bonus.desc}
          </div>`;
        });
        activeSetBonusHtml += `
          <div style="margin-top: 10px; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 8px;">
            <strong style="color: #d4af37; font-size: 0.78rem;">${set.name} (${count}/${set.items.length})</strong>
            ${bonusesListHtml}
          </div>
        `;
      }
    });

    let inventoryHtml = "";
    if (state.heroInventory && state.heroInventory.length > 0) {
      state.heroInventory.forEach(itemId => {
        const itemCfg = ITEMS_CONFIG[itemId];
        if (itemCfg) {
          const color = rarityColors[itemCfg.rarity || 'common'];
          inventoryHtml += `
            <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.25); border-left: 3px solid ${color}; padding: 6px 10px; border-radius: 4px; margin-bottom: 5px; font-size: 0.8rem;">
              <span><strong style="color: ${color}; text-transform: uppercase; font-size: 0.7rem; margin-right: 4px;">[${itemCfg.rarity || 'common'}]</strong> ${itemCfg.name} <span style="font-size: 0.7rem; color: var(--color-text-muted);">(${itemCfg.desc})</span></span>
              <button class="primary-btn equip-item-btn" data-id="${itemId}" style="padding: 2px 8px; font-size: 0.75rem;">Ausrüsten</button>
            </div>
          `;
        }
      });
    } else {
      inventoryHtml = '<p style="font-size: 0.75rem; color: var(--color-text-muted);">Dein Inventar ist leer. Bestreite Dungeons, um Beute zu finden!</p>';
    }

    // Build Dungeons HTML
    let dungeonMissionHtml = "";
    if (state.heroDungeonMission) {
      const mission = state.heroDungeonMission;
      const dCfg = DUNGEONS_CONFIG.find(d => d.id === mission.dungeonId);
      const encId = mission.encounterIds[mission.currentStep - 1];
      const enc = DUNGEON_ENCOUNTERS.find(e => e.id === encId);

      let choicesHtml = "";
      if (!mission.choiceMade) {
        if (mission.currentStep === 3) {
          choicesHtml = `
            <button id="btn-dungeon-fight-boss" class="primary-btn gold-btn" style="width: 100%; font-weight: bold; font-size: 0.85rem; padding: 8px 12px;">
              👹 Boss bekämpfen (Taktischer Kampf)
            </button>
          `;
        } else {
          choicesHtml = enc.choices.map((c, idx) => {
            const isClassMatch = hero.type === c.classBonus;
            const style = isClassMatch ? 'border-color: var(--color-gold-hover); background: rgba(212,175,55,0.15);' : '';
            return `
              <button class="primary-btn btn-dungeon-choice" data-idx="${idx}" style="width: 100%; text-align: left; margin-bottom: 6px; font-size: 0.75rem; padding: 6px 10px; ${style}">
                ${c.text} ${isClassMatch ? ' <span style="color: var(--color-gold-hover); font-weight: bold;">(Klassen-Bonus!)</span>' : ''}
              </button>
            `;
          }).join('');
        }
      } else {
        choicesHtml = `
          <p style="font-size: 0.8rem; background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px; border-left: 3px solid var(--color-gold-hover); margin-bottom: 10px; font-style: italic;">
            ${mission.latestResultText}
          </p>
          <button id="btn-dungeon-next" class="primary-btn gold-btn" style="width: 100%;">
            ${mission.currentStep >= mission.totalSteps ? 'Expedition abschließen' : 'Nächste Ebene'}
          </button>
        `;
      }

      const progressNodesHtml = `
        <div style="display: flex; justify-content: space-around; align-items: center; margin: 5px 0 15px 0; background: rgba(0,0,0,0.25); padding: 8px; border-radius: 6px; position: relative;">
          <div style="position: absolute; top: 50%; left: 10%; right: 10%; height: 2px; background: rgba(255,255,255,0.15); z-index: 1; transform: translateY(-50%);"></div>
          <div style="z-index: 2; text-align: center;">
            <div style="width: 22px; height: 22px; border-radius: 50%; background: ${mission.currentStep >= 1 ? 'var(--color-gold-hover)' : 'rgba(255,255,255,0.2)'}; border: 1.5px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold; color: #111;">1</div>
            <div style="font-size: 0.65rem; color: ${mission.currentStep === 1 ? '#fff' : 'var(--color-text-muted)'}; margin-top: 3px;">Eingang</div>
          </div>
          <div style="z-index: 2; text-align: center;">
            <div style="width: 22px; height: 22px; border-radius: 50%; background: ${mission.currentStep >= 2 ? 'var(--color-gold-hover)' : 'rgba(255,255,255,0.2)'}; border: 1.5px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold; color: #111;">2</div>
            <div style="font-size: 0.65rem; color: ${mission.currentStep === 2 ? '#fff' : 'var(--color-text-muted)'}; margin-top: 3px;">Kammer</div>
          </div>
          <div style="z-index: 2; text-align: center;">
            <div style="width: 22px; height: 22px; border-radius: 50%; background: ${mission.currentStep >= 3 ? '#e74c3c' : 'rgba(255,255,255,0.2)'}; border: 1.5px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: bold; color: ${mission.currentStep >= 3 ? '#fff' : '#111'};">😈</div>
            <div style="font-size: 0.65rem; color: ${mission.currentStep === 3 ? '#fff' : 'var(--color-text-muted)'}; margin-top: 3px;">Boss</div>
          </div>
        </div>
      `;

      dungeonMissionHtml = `
        <div class="glass-card" style="padding: 15px; margin-top: 15px; border-color: var(--color-gold-hover);">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px; margin-bottom: 10px;">
            <h4 style="margin: 0; font-size: 0.95rem; color: var(--color-gold-hover);">⚔️ Dungeon: ${dCfg.name}</h4>
            <span style="font-size: 0.75rem; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">Ebene ${mission.currentStep}/${mission.totalSteps}</span>
          </div>

          ${progressNodesHtml}

          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 3px;">
              <span>Helden-HP</span>
              <span style="font-weight: bold; color: ${mission.hp > 30 ? '#2ecc71' : '#e74c3c'};">${mission.hp}/100</span>
            </div>
            <div style="height: 6px; background: rgba(0,0,0,0.3); border-radius: 3px; overflow: hidden;">
              <div style="width: ${mission.hp}%; height: 100%; background: ${mission.hp > 30 ? '#2ecc71' : '#e74c3c'}; transition: width 0.3s;"></div>
            </div>
          </div>

          <div style="display: flex; gap: 10px; margin-bottom: 15px; background: rgba(0,0,0,0.15); padding: 10px; border-radius: 6px;">
            <div style="font-size: 2.2rem; display: flex; align-items: center;">${enc.icon}</div>
            <div>
              <strong style="font-size: 0.85rem; color: var(--color-gold-hover);">${enc.title}</strong>
              <p style="font-size: 0.75rem; margin: 4px 0 0 0; line-height: 1.3; color: var(--color-text-muted);">${enc.desc}</p>
            </div>
          </div>

          <div class="dungeon-choices">
            ${choicesHtml}
          </div>
        </div>
      `;
    } else {
      dungeonMissionHtml = `
        <h4 style="margin: 15px 0 8px 0; font-size: 1rem;">⚔️ Verfügbare Dungeons</h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${DUNGEONS_CONFIG.map(d => {
            const hasLevel = level >= d.levelReq;
            return `
              <div class="glass-card" style="padding: 10px; font-size: 0.8rem; border-color: ${hasLevel ? 'rgba(255,255,255,0.15)' : 'rgba(231,76,60,0.2)'};">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <strong style="color: ${hasLevel ? '#fff' : '#c0392b'};">${d.name}</strong>
                  <span>⌛ Interaktiv</span>
                </div>
                <p style="margin: 4px 0; font-size: 0.75rem; color: var(--color-text-muted);">${d.desc}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                  <span>Benötigt Level ${d.levelReq}</span>
                  <button class="primary-btn start-dungeon-btn" data-id="${d.id}" ${hasLevel ? '' : 'disabled'} style="padding: 3px 10px; font-size: 0.75rem;">
                    Erkunden
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    this.activeAltarTab = this.activeAltarTab || 'dungeons';

    let rightSideHtml = "";
    if (this.activeAltarTab === 'dungeons') {
      rightSideHtml = dungeonMissionHtml;
    } else if (this.activeAltarTab === 'crafting') {
      let latestCraftedText = "";
      if (state.latestCraftedItem) {
        const itemCfg = ITEMS_CONFIG[state.latestCraftedItem];
        if (itemCfg) {
          const color = rarityColors[itemCfg.rarity || 'common'];
          latestCraftedText = `<div style="background: rgba(46, 204, 113, 0.15); border: 1px solid #2ecc71; padding: 10px; border-radius: 6px; margin-bottom: 12px; font-size: 0.8rem; text-align: center;">
            Erfolgreich geschmiedet: <strong style="color: ${color};">${itemCfg.name}</strong> (${itemCfg.desc})
          </div>`;
        }
      }

      rightSideHtml = `
        <h4 style="margin: 15px 0 8px 0; font-size: 1rem; color: var(--color-gold-hover);">⚒️ Ausrüstungsschmiede</h4>
        <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 12px;">Schmiede mächtige Ausrüstung für deinen Helden.</p>
        
        ${latestCraftedText}

        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="glass-card" style="padding: 10px; font-size: 0.8rem;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong>Bronze-Schmiedearbeit (Gewöhnlich/Selten)</strong>
              <button class="primary-btn craft-item-btn" data-tier="standard" style="padding: 3px 10px;">Schmieden</button>
            </div>
            <p style="margin: 4px 0; font-size: 0.72rem; color: var(--color-text-muted);">Kosten: ⛓️ 100 Eisen | 🪵 100 Holz | 🪙 100 Gold</p>
          </div>

          <div class="glass-card" style="padding: 10px; font-size: 0.8rem; border-color: var(--color-blue-primary);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="color: #3498db;">Eisen-Schmiedearbeit (Selten/Episch)</strong>
              <button class="primary-btn craft-item-btn" data-tier="epic" style="padding: 3px 10px;">Schmieden</button>
            </div>
            <p style="margin: 4px 0; font-size: 0.72rem; color: var(--color-text-muted);">Kosten: ⛓️ 200 Eisen | 🪙 200 Gold | 💎 10 Rubine</p>
          </div>

          <div class="glass-card" style="padding: 10px; font-size: 0.8rem; border-color: var(--color-gold-primary);">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <strong style="color: #f1c40f;">Stahl-Schmiedearbeit (Episch/Legendär)</strong>
              <button class="primary-btn craft-item-btn" data-tier="legendary" style="padding: 3px 10px;">Schmieden</button>
            </div>
            <p style="margin: 4px 0; font-size: 0.72rem; color: var(--color-text-muted);">Kosten: ⛓️ 400 Eisen | 🪙 500 Gold | 💎 25 Rubine</p>
          </div>
        </div>
      `;
    } else {
      let talentPoints = hero.skillPoints || 0;
      let skillsState = hero.skills || {};

      let branchesHtml = "";
      const branches = {
        'Wirtschaft': ['eco_prod', 'eco_build'],
        'Angriff': ['off_attack', 'off_speed', 'combat_whirlwind'],
        'Verteidigung': ['def_wall', 'def_garrison', 'combat_heal', 'combat_taunt']
      };

      Object.keys(branches).forEach(branchName => {
        branchesHtml += `
          <div style="margin-bottom: 12px; background: rgba(0,0,0,0.15); border: 1px solid rgba(255,255,255,0.05); padding: 10px; border-radius: 6px;">
            <h4 style="margin: 0 0 8px 0; font-size: 0.95rem; color: var(--color-gold-hover);">${branchName}</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
        `;

        branches[branchName].forEach(skillId => {
          const cfg = HERO_SKILLS_CONFIG[skillId];
          const currentLvl = skillsState[skillId] || 0;
          const isMax = currentLvl >= cfg.maxLevel;
          const canImprove = talentPoints > 0 && !isMax;

          branchesHtml += `
              <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; background: rgba(255,255,255,0.03); padding: 6px 8px; border-radius: 4px;">
                <div style="flex-grow: 1; margin-right: 10px;">
                  <strong style="color: #fff;">${cfg.name}</strong> 
                  <span style="color: var(--color-gold-hover); font-weight: bold; margin-left: 5px;">(${currentLvl}/${cfg.maxLevel})</span>
                  <div style="font-size: 0.72rem; color: var(--color-text-muted); margin-top: 2px;">${cfg.desc}</div>
                </div>
                <button class="primary-btn learn-skill-btn" data-id="${skillId}" ${canImprove ? '' : 'disabled'} style="padding: 3px 8px; font-size: 0.75rem; white-space: nowrap;">
                  ${isMax ? 'MAX' : '+'}
                </button>
              </div>
          `;
        });

        branchesHtml += `
            </div>
          </div>
        `;
      });

      rightSideHtml = `
        <h4 style="margin: 15px 0 8px 0; font-size: 1rem; color: var(--color-gold-hover); display: flex; justify-content: space-between;">
          <span>📜 Heldentalente</span>
          <span style="font-size: 0.8rem; background: var(--color-gold-hover); color: #000; padding: 2px 6px; border-radius: 4px; font-weight: bold;">
            Punkte: ${talentPoints}
          </span>
        </h4>
        <div style="display: flex; flex-direction: column; gap: 10px; max-height: 380px; overflow-y: auto; padding-right: 5px;">
          ${branchesHtml}
        </div>
      `;
    }

    const tabHeaderHtml = `
      <div class="tabs-container" style="display: flex; gap: 10px; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;">
        <button class="tab-btn" id="tab-dungeons" style="background: none; border: none; color: ${this.activeAltarTab === 'dungeons' ? 'var(--color-gold-hover)' : 'var(--color-text-muted)'}; border-bottom: ${this.activeAltarTab === 'dungeons' ? '2px solid var(--color-gold-hover)' : 'none'}; padding: 4px 12px; cursor: pointer; font-weight: bold; font-family: var(--font-header);">
          ⚔️ Expeditionen
        </button>
        <button class="tab-btn" id="tab-talents" style="background: none; border: none; color: ${this.activeAltarTab === 'talents' ? 'var(--color-gold-hover)' : 'var(--color-text-muted)'}; border-bottom: ${this.activeAltarTab === 'talents' ? '2px solid var(--color-gold-hover)' : 'none'}; padding: 4px 12px; cursor: pointer; font-weight: bold; font-family: var(--font-header);">
          📜 Talente (${hero.skillPoints || 0})
        </button>
        <button class="tab-btn" id="tab-crafting" style="background: none; border: none; color: ${this.activeAltarTab === 'crafting' ? 'var(--color-gold-hover)' : 'var(--color-text-muted)'}; border-bottom: ${this.activeAltarTab === 'crafting' ? '2px solid var(--color-gold-hover)' : 'none'}; padding: 4px 12px; cursor: pointer; font-weight: bold; font-family: var(--font-header);">
          ⚒️ Schmiede
        </button>
      </div>
      <div>
        ${rightSideHtml}
      </div>
    `;

    const gems = state.heroEquipmentGems || { weapon: null, armor: null, accessory: null };
    const gemNames = { ruby: '🔴 Rubin (+10% Atk)', emerald: '🟢 Smaragd (+15% Def)', sapphire: '🔵 Saphir (+25 HP)' };
    const weaponGem = gemNames[gems.weapon] || 'Leer';
    const armorGem = gemNames[gems.armor] || 'Leer';
    const accGem = gemNames[gems.accessory] || 'Leer';

    const gemsHtml = `
      <h4 style="margin: 10px 0 6px 0; font-size: 0.95rem;">💎 Edelstein-Sockel</h4>
      <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.75rem; margin-bottom: 10px; background: rgba(0,0,0,0.15); padding: 8px; border-radius: 4px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>🗡️ Waffe: <strong>${weaponGem}</strong></span>
          ${eq.weapon ? `
            <select class="gem-select" data-slot="weapon" style="font-size: 0.7rem; padding: 2px; background: #222; color: #fff; border: 1px solid #444;">
              <option value="">Edelstein...</option>
              <option value="ruby">Rubin (💎 5)</option>
              <option value="emerald">Smaragd (🪨200 🪙100)</option>
              <option value="sapphire">Saphir (🪵200 🪙100)</option>
            </select>
          ` : ''}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>🛡️ Rüstung: <strong>${armorGem}</strong></span>
          ${eq.armor ? `
            <select class="gem-select" data-slot="armor" style="font-size: 0.7rem; padding: 2px; background: #222; color: #fff; border: 1px solid #444;">
              <option value="">Edelstein...</option>
              <option value="ruby">Rubin (💎 5)</option>
              <option value="emerald">Smaragd (🪨200 🪙100)</option>
              <option value="sapphire">Saphir (🪵200 🪙100)</option>
            </select>
          ` : ''}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>💎 Amulett: <strong>${accGem}</strong></span>
          ${eq.accessory ? `
            <select class="gem-select" data-slot="accessory" style="font-size: 0.7rem; padding: 2px; background: #222; color: #fff; border: 1px solid #444;">
              <option value="">Edelstein...</option>
              <option value="ruby">Rubin (💎 5)</option>
              <option value="emerald">Smaragd (🪨200 🪙100)</option>
              <option value="sapphire">Saphir (🪵200 🪙100)</option>
            </select>
          ` : ''}
        </div>
      </div>
    `;

    html += `
      <p class="modal-intro">Dein Held führt deine Armeen an und kann in Dungeons nach Schätzen suchen.</p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
        <!-- Left Side: Hero Info & Equipment -->
        <div>
          <div class="glass-card" style="text-align: center; padding: 15px; margin-bottom: 12px;">
            <div style="font-size: 3rem; margin-bottom: 5px;">${icon}</div>
            <h3 style="font-size: 1.25rem; color: var(--color-gold-hover); margin: 5px 0;">${name}</h3>
            <p style="font-size: 0.85rem; margin: 4px 0;">Stufe / Level: <strong>${level}</strong></p>
            <div style="background: rgba(0,0,0,0.25); padding: 8px; border-radius: 4px; margin: 10px 0; font-size: 0.75rem;">
              Bonus: ${bonusDesc}
            </div>
            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 8px;">
              Upgrade-Kosten: 🪙 ${goldCost} Gold | 💎 ${rubyCost}
            </div>
            <button id="btn-level-hero" class="primary-btn gold-btn" style="width: 100%; font-size: 0.8rem; padding: 6px;" ${canLevel ? '' : 'disabled'}>
              Aufstufen (Level Up)
            </button>
          </div>

          <div class="glass-card" style="padding: 12px;">
            <h4 style="margin: 0 0 8px 0; font-size: 0.95rem;">🛡️ Ausrüstung</h4>
            <div style="display: flex; flex-direction: column; gap: 6px; font-size: 0.8rem; margin-bottom: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.15); padding: 5px 8px; border-radius: 4px;">
                <span>🗡️ Waffe: ${weaponName}</span>
                ${eq.weapon ? `<button class="primary-btn danger-btn unequip-btn" data-slot="weapon" style="padding: 2px 6px; font-size: 0.7rem;">Ablegen</button>` : ''}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.15); padding: 5px 8px; border-radius: 4px;">
                <span>🛡️ Rüstung: ${armorName}</span>
                ${eq.armor ? `<button class="primary-btn danger-btn unequip-btn" data-slot="armor" style="padding: 2px 6px; font-size: 0.7rem;">Ablegen</button>` : ''}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.15); padding: 5px 8px; border-radius: 4px;">
                <span>💎 Amulett: ${accName}</span>
                ${eq.accessory ? `<button class="primary-btn danger-btn unequip-btn" data-slot="accessory" style="padding: 2px 6px; font-size: 0.7rem;">Ablegen</button>` : ''}
              </div>
            </div>

            ${activeSetBonusHtml}
            ${gemsHtml}

            <h4 style="margin: 10px 0 6px 0; font-size: 0.95rem;">🎒 Inventar</h4>
            <div style="max-height: 120px; overflow-y: auto;">
              ${inventoryHtml}
            </div>
          </div>
        </div>

        <!-- Right Side: Dungeons / Talents -->
        <div>
          ${tabHeaderHtml}
        </div>
      </div>
    `;
  }

  this.openModal(html);

  // Bind gem selection
  document.querySelectorAll('.gem-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const slot = e.target.getAttribute('data-slot');
      const gem = e.target.value;
      if (gem) {
        if (stateManager.socketGem(slot, gem)) {
          this.openHeroAltarModal();
          this.showFloatingNotification('Edelstein erfolgreich gesockelt!');
        }
      }
    });
  });

  // Bind hero recruitment
  document.querySelectorAll('.recruit-hero-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const type = e.target.getAttribute('data-type');
      if (stateManager.recruitHero(type)) {
        this.openHeroAltarModal();
        this.showFloatingNotification('Held erfolgreich beschworen!');
      }
    });
  });

  // Bind hero level up
  const lvlBtn = document.getElementById('btn-level-hero');
  if (lvlBtn) {
    lvlBtn.addEventListener('click', () => {
      if (stateManager.levelUpHero()) {
        this.openHeroAltarModal();
        this.showFloatingNotification('Held erfolgreich aufgestuft!');
      }
    });
  }

  // Bind tabs
  const tabDungeons = document.getElementById('tab-dungeons');
  const tabTalents = document.getElementById('tab-talents');
  const tabCrafting = document.getElementById('tab-crafting');
  if (tabDungeons) {
    tabDungeons.addEventListener('click', () => {
      this.activeAltarTab = 'dungeons';
      stateManager.state.latestCraftedItem = null;
      this.openHeroAltarModal();
    });
  }
  if (tabTalents) {
    tabTalents.addEventListener('click', () => {
      this.activeAltarTab = 'talents';
      stateManager.state.latestCraftedItem = null;
      this.openHeroAltarModal();
    });
  }
  if (tabCrafting) {
    tabCrafting.addEventListener('click', () => {
      this.activeAltarTab = 'crafting';
      this.openHeroAltarModal();
    });
  }

  // Bind learn skill
  document.querySelectorAll('.learn-skill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const skillId = e.target.closest('.learn-skill-btn').getAttribute('data-id');
      if (stateManager.learnHeroSkill(skillId)) {
        this.openHeroAltarModal();
        this.showFloatingNotification('Talent gelernt!');
      }
    });
  });

  // Bind equip item
  document.querySelectorAll('.equip-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const itemId = e.target.getAttribute('data-id');
      if (stateManager.equipHeroItem(itemId)) {
        this.openHeroAltarModal();
        this.showFloatingNotification('Ausrüstung angelegt!');
      }
    });
  });

  // Bind unequip item
  document.querySelectorAll('.unequip-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const slot = e.target.getAttribute('data-slot');
      if (stateManager.unequipHeroItem(slot)) {
        this.openHeroAltarModal();
        this.showFloatingNotification('Ausrüstung abgelegt!');
      }
    });
  });

  // Bind start dungeon
  document.querySelectorAll('.start-dungeon-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dungeonId = e.target.getAttribute('data-id');
      if (stateManager.startDungeon(dungeonId)) {
        this.openHeroAltarModal();
        this.showFloatingNotification('Heldenexpedition gestartet!');
      }
    });
  });

  // Bind craft item
  document.querySelectorAll('.craft-item-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tier = e.target.getAttribute('data-tier');
      if (stateManager.craftHeroItem(tier)) {
        this.openHeroAltarModal();
        this.showFloatingNotification('Gegenstand erfolgreich geschmiedet!');
      }
    });
  });

  // Bind interactive dungeon choices
  document.querySelectorAll('.btn-dungeon-choice').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.closest('.btn-dungeon-choice').getAttribute('data-idx'));
      if (stateManager.resolveDungeonChoice(idx)) {
        this.openHeroAltarModal();
      }
    });
  });

  // Bind interactive dungeon next step
  const nextBtn = document.getElementById('btn-dungeon-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (stateManager.nextDungeonStep()) {
        this.openHeroAltarModal();
      }
    });
  }

  // Bind boss fight button click
  const bossFightBtn = document.getElementById('btn-dungeon-fight-boss');
  if (bossFightBtn) {
    bossFightBtn.addEventListener('click', () => {
      this.startDungeonBossBattle(state.heroDungeonMission);
    });
  }
};

// Implement visual boss combat using TacticalCombat
GameUI.prototype.startDungeonBossBattle = function(mission) {
  const dCfg = DUNGEONS_CONFIG.find(d => d.id === mission.dungeonId);
  if (!dCfg) return;

  if (window.gameSound) {
    gameSound.setTheme('battle');
  }

  // Create temporary battle report object
  const report = {
    targetName: dCfg.name,
    isDungeonBoss: true,
    troopsSent: {
      knight: 1, // Hero representation
      spearman: 2
    },
    defenders: {
      swordsman: 2,
      knight: 1
    },
    victory: false,
    actionLogs: []
  };

  // Scale boss troops based on dungeon level requirement
  if (dCfg.levelReq >= 3) {
    report.defenders = { swordsman: 3, bowman: 2, knight: 1 };
  }
  if (dCfg.levelReq >= 5) {
    report.defenders = { swordsman: 4, bowman: 3, knight: 2 };
  }

  const html = `
    <div class="battle-arena-modal" style="display: flex; flex-direction: column; max-width: 850px; width: 100%;">
      <h2>⚔️ Bosskampf: Wächter von ${dCfg.name}</h2>
      <div class="battle-layout" style="display: flex; gap: 15px; margin-top: 10px;">
        <div class="battle-canvas-container" style="flex-grow: 1;">
          <canvas id="battle-anim-canvas" width="550" height="300" style="border: 2px solid var(--color-gold-primary); display: block; margin: 0 auto;"></canvas>
        </div>
        <div class="battle-log-side-panel glass-card" style="width: 240px; height: 300px; display: flex; flex-direction: column; padding: 12px; box-sizing: border-box; background: rgba(0,0,0,0.5);">
          <h4 style="margin: 0 0 8px 0; border-bottom: 1px solid rgba(255,255,255,0.15); padding-bottom: 4px; font-family: var(--font-header); color: var(--color-gold-hover);">📜 Kampfverlauf</h4>
          <div id="battle-logs-list" style="flex-grow: 1; overflow-y: auto; font-size: 0.72rem; text-align: left; line-height: 1.4; max-height: 240px;">
            <div style="color: #2ecc71;">Bosskampf begonnen! Besiege die Wächter!</div>
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
      mission.choiceMade = true;
      mission.latestResultText = `Du hast den Dungeon-Wächter besiegt! Die Schätze gehören dir.`;
      stateManager.save();
      this.openHeroAltarModal();
      this.showFloatingNotification('Sieg im Bosskampf! Expedition bereit zum Abschließen.');
    } else {
      mission.hp = 0;
      stateManager.nextDungeonStep();
      this.openHeroAltarModal();
      this.showToast('Dein Held wurde besiegt!', 'error');
    }
  };

  const tacticalBattle = new TacticalCombat(canvas, stateManager, this, report, false, onBattleComplete);

  // Hook into actionLogs.push to update side panel in real-time
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

  // Gameloop for rendering
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
    // skip battle automatically
    report.victory = Math.random() < 0.65; // simple roll on skip
    onBattleComplete();
  });
};

// Craft Hero Item
GameStateManager.prototype.craftHeroItem = function(tier) {
  if (!this.state.hero) {
    if (window.gameUI) gameUI.showToast('Du brauchst zuerst einen Helden!', 'warning');
    return false;
  }

  const costs = {
    standard: { iron: 100, wood: 100, gold: 100 },
    epic: { iron: 200, gold: 200, rubies: 10 },
    legendary: { iron: 400, gold: 500, rubies: 25 }
  };
  const cost = costs[tier];
  if (!cost) return false;

  if (!this.hasResources(cost)) {
    if (window.gameUI) gameUI.showToast('Nicht genügend Ressourcen zum Schmieden!', 'error');
    return false;
  }

  this.deductResources(cost);

  // Determine reward item
  let itemPool = [];
  if (tier === 'standard') {
    itemPool = ['rusty_sword', 'leather_armor', 'iron_shield', 'steel_sword', 'chain_mail', 'gold_ring'];
  } else if (tier === 'epic') {
    itemPool = ['steel_sword', 'chain_mail', 'gold_ring', 'plate_armor', 'ruby_amulet', 'mythril_blade'];
  } else { // legendary
    itemPool = ['plate_armor', 'ruby_amulet', 'mythril_blade', 'dragon_slayer'];
  }

  const rolledItem = itemPool[Math.floor(Math.random() * itemPool.length)];
  if (!this.state.heroInventory) {
    this.state.heroInventory = [];
  }
  this.state.heroInventory.push(rolledItem);
  this.state.latestCraftedItem = rolledItem;

  this.save();
  this.notifyListeners('hero_item_crafted');
  return true;
};

// Socket Gem in Equipment Slot
GameStateManager.prototype.socketGem = function(slot, gemType) {
  if (!this.state.hero) return false;
  if (!this.state.heroEquipmentGems) {
    this.state.heroEquipmentGems = { weapon: null, armor: null, accessory: null };
  }

  const costs = {
    ruby: { rubies: 5 },
    emerald: { stone: 200, gold: 100 },
    sapphire: { wood: 200, gold: 100 }
  };
  const cost = costs[gemType];
  if (!cost) return false;

  if (!this.hasResources(cost)) {
    if (window.gameUI) gameUI.showToast('Nicht genügend Ressourcen für diesen Edelstein!', 'error');
    return false;
  }

  this.deductResources(cost);
  this.state.heroEquipmentGems[slot] = gemType;

  this.save();
  this.notifyListeners('hero_gem_socketed');
  return true;
};

// Calculate Active Gem Bonuses
GameStateManager.prototype.getGemBonus = function(stat) {
  if (!this.state.heroEquipmentGems) return 0;
  let bonus = 0;
  Object.keys(this.state.heroEquipmentGems).forEach(slot => {
    const gem = this.state.heroEquipmentGems[slot];
    if (!gem) return;
    if (stat === 'attack' && gem === 'ruby') bonus += 0.10;
    if (stat === 'defense' && gem === 'emerald') bonus += 0.15;
    if (stat === 'hp' && gem === 'sapphire') bonus += 25;
  });
  
  const prestigeMult = 1.0 + (this.getPrestigeGemBonus ? this.getPrestigeGemBonus() : 0);
  return bonus * prestigeMult;
};
