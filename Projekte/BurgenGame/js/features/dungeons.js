// --- INTERACTIVE DUNGEONS & HERO EQUIPMENT FEATURE ---

const DUNGEON_ENCOUNTERS = [
  {
    id: 'golem',
    title: 'Der Steingolem',
    icon: '🗿',
    desc: 'Ein riesiger Steingolem blockiert den schmalen Gang. Seine Augen glühen bedrohlich rot.',
    choices: [
      {
        text: '⚔️ Frontalangriff starten',
        classBonus: 'warlord',
        successChance: 0.65,
        successText: 'Dein Kriegsherr zerschmettert den Golem mit roher Gewalt! (+150 Gold)',
        successLoot: { gold: 150 },
        failText: 'Der Golem schlägt hart zurück, bevor er zerfällt. (-25 HP)',
        failDamage: 25
      },
      {
        text: '🛡️ Hinter dem Schild verschanzen',
        classBonus: 'paladin',
        successChance: 0.7,
        successText: 'Als göttlicher Paladin blockierst du alle Angriffe perfekt und stärkst dich. (+50 Gold)',
        successLoot: { gold: 50 },
        failText: 'Der Golem durchbricht deine Deckung leicht. (-10 HP)',
        failDamage: 10
      },
      {
        text: '🪙 Schwachstelle suchen und sprengen',
        classBonus: 'treasurer',
        successChance: 0.6,
        successText: 'Du findest eine Schwachstelle voller Edelsteine und sprengst sie auf! (+1 Rubin)',
        successLoot: { rubies: 1 },
        failText: 'Die Sprengung misslingt und umherfliegende Trümmer treffen dich. (-15 HP)',
        failDamage: 15
      }
    ]
  },
  {
    id: 'spear_trap',
    title: 'Die Speerfalle',
    icon: '📐',
    desc: 'Der Boden vor dir ist mit Druckplatten übersät. An den Wänden lauern tödliche Speervorrichtungen.',
    choices: [
      {
        text: '⚔️ Im Sprint durchbrechen',
        classBonus: 'warlord',
        successChance: 0.55,
        successText: 'Mit purer Kraft hebst du Trümmer auf, stürmst durch und findest liegengelassenes Gold. (+80 Gold)',
        successLoot: { gold: 80 },
        failText: 'Ein Speer erwischt dich im Oberschenkel! (-20 HP)',
        failDamage: 20
      },
      {
        text: '🛡️ Schildkröten-Formation nutzen',
        classBonus: 'paladin',
        successChance: 0.8,
        successText: 'Dein schwerer Schild blockt jeden auslösenden Speer mühelos ab.',
        successLoot: {},
        failText: 'Ein Speer findet eine Lücke in deiner Verteidigung. (-8 HP)',
        failDamage: 8
      },
      {
        text: '🪙 Die Mechanik entschärfen',
        classBonus: 'treasurer',
        successChance: 0.75,
        successText: 'Du legst die Fallen meisterhaft lahm und findest vergoldete Zahnräder. (+120 Gold)',
        successLoot: { gold: 120 },
        failText: 'Du löst die Falle versehentlich beim Entschärfen aus! (-15 HP)',
        failDamage: 15
      }
    ]
  },
  {
    id: 'treasure_chest',
    title: 'Die uralte Truhe',
    icon: '📦',
    desc: 'Eine schwere, mit Eisen beschlagene Holztruhe steht in einer staubigen Nische.',
    choices: [
      {
        text: '⚔️ Das Schloss zertrümmern',
        classBonus: 'warlord',
        successChance: 0.65,
        successText: 'Du knackst die Kiste mit deiner Axt und sammelst die Münzen auf. (+150 Gold)',
        successLoot: { gold: 150 },
        failText: 'Die Kiste war mit einer verdeckten Gasfalle gesichert! (-15 HP)',
        failDamage: 15
      },
      {
        text: '🛡️ Truhe auf Fallen überprüfen',
        classBonus: 'paladin',
        successChance: 0.7,
        successText: 'Deine göttliche Aura warnt dich vor einer Giftnadel. Du öffnest sie sicher. (+100 Gold)',
        successLoot: { gold: 100 },
        failText: 'Ein Giftpfeil schießt überraschend heraus! (-10 HP)',
        failDamage: 10
      },
      {
        text: '🪙 Schloss knacken und Beute maximieren',
        classBonus: 'treasurer',
        successChance: 0.85,
        successText: 'Als Schatzmeister öffnest du sie meisterhaft und findest ein wertvolles Geheimfach! (+200 Gold, +2 Rubine)',
        successLoot: { gold: 200, rubies: 2 },
        failText: 'Deine Dietriche brechen ab und der Alarm fügt dir Schaden zu. (-12 HP)',
        failDamage: 12
      }
    ]
  }
];

GameStateManager.prototype.initHeroDungeonState = function() {
  if (!this.state.heroInventory) this.state.heroInventory = [];
  if (!this.state.heroEquipment) {
    this.state.heroEquipment = { weapon: null, armor: null, accessory: null };
  }
  if (this.state.heroDungeonMission === undefined) {
    this.state.heroDungeonMission = null;
  }
};

GameStateManager.prototype.equipHeroItem = function(itemId) {
  this.initHeroDungeonState();
  if (!this.state.hero) return false;

  const itemIdx = this.state.heroInventory.indexOf(itemId);
  if (itemIdx === -1) return false;

  const cfg = ITEMS_CONFIG[itemId];
  if (!cfg) return false;

  // Unequip current item in that slot if exists
  const currentEquipped = this.state.heroEquipment[cfg.slot];
  if (currentEquipped) {
    this.state.heroInventory.push(currentEquipped);
  }

  // Remove new item from inventory and equip it
  this.state.heroInventory.splice(itemIdx, 1);
  this.state.heroEquipment[cfg.slot] = itemId;

  this.save();
  this.notifyListeners('hero_equipped');
  return true;
};

GameStateManager.prototype.unequipHeroItem = function(slot) {
  this.initHeroDungeonState();
  if (!this.state.hero) return false;

  const currentEquipped = this.state.heroEquipment[slot];
  if (!currentEquipped) return false;

  this.state.heroEquipment[slot] = null;
  this.state.heroInventory.push(currentEquipped);

  this.save();
  this.notifyListeners('hero_unequipped');
  return true;
};

GameStateManager.prototype.startDungeon = function(dungeonId) {
  this.initHeroDungeonState();
  if (!this.state.hero) {
    if (window.gameUI) gameUI.showToast('Du brauchst einen Helden, um Dungeons zu betreten!', 'warning');
    return false;
  }

  if (this.state.heroDungeonMission) {
    if (window.gameUI) gameUI.showToast('Dein Held ist bereits in einem Dungeon unterwegs!', 'info');
    return false;
  }

  const cfg = DUNGEONS_CONFIG.find(d => d.id === dungeonId);
  if (!cfg) return false;

  if (this.state.hero.level < cfg.levelReq) {
    if (window.gameUI) gameUI.showToast(`Dein Held benötigt mindestens Level ${cfg.levelReq} für diesen Dungeon!`, 'warning');
    return false;
  }

  // Initialize interactive Choose-Your-Own-Adventure Dungeon State
  const shuffled = [...DUNGEON_ENCOUNTERS].sort(() => 0.5 - Math.random());
  const selectedEncounters = shuffled.slice(0, 3).map(e => e.id);

  this.state.heroDungeonMission = {
    dungeonId: dungeonId,
    hp: 100,
    maxHp: 100,
    currentStep: 1,
    totalSteps: 3,
    accumulatedLoot: { gold: 0, rubies: 0 },
    encounterIds: selectedEncounters,
    choiceMade: false,
    latestResultText: null
  };

  this.save();
  this.notifyListeners('dungeon_started');
  return true;
};

// Dungeons no longer run on passive tick-countdown
GameStateManager.prototype.tickDungeons = function(dt) {
  if (this.state.passiveExpedition) {
    this.state.passiveExpedition.timeRemaining -= dt;
    if (this.state.passiveExpedition.timeRemaining <= 0) {
      const exp = this.state.passiveExpedition;
      this.state.passiveExpedition = null;

      // Add rewards
      if (exp.reward.gold) this.state.resources.gold += exp.reward.gold;
      if (exp.reward.rubies) this.state.resources.rubies += exp.reward.rubies;
      if (exp.reward.item) {
        if (!this.state.heroInventory) this.state.heroInventory = [];
        this.state.heroInventory.push(exp.reward.item);
      }

      // Report
      this.state.latestDungeonReport = {
        dungeonName: exp.label,
        gold: exp.reward.gold || 0,
        rubies: exp.reward.rubies || 0,
        item: exp.reward.item || null,
        victory: true,
        time: Date.now()
      };

      this.save();
      this.notifyListeners('dungeon_complete');
    }
  }
};

// Start a passive expedition for the hero
GameStateManager.prototype.startPassiveExpedition = function(hours) {
  if (this.state.heroDungeonMission || this.state.passiveExpedition) {
    if (window.gameUI) window.gameUI.showToast('Dein Held ist bereits auf Expedition!', 'warning');
    return false;
  }
  if (!this.state.hero) {
    if (window.gameUI) window.gameUI.showToast('Du benötigst zuerst einen Helden!', 'warning');
    return false;
  }

  let duration = hours * 3600;
  // Test/Quick modes: 1h -> 60s, 4h -> 180s, 8h -> 360s
  if (hours === 1) duration = 60;
  else if (hours === 4) duration = 180;
  else if (hours === 8) duration = 360;

  const reward = {
    gold: hours * 100 + Math.floor(Math.random() * 100),
    rubies: hours * 2 + Math.floor(Math.random() * 4)
  };

  if (Math.random() < 0.4) {
    const itemPool = ['wooden_staff', 'leather_armor', 'bronze_sword', 'iron_shield', 'mythril_blade'];
    reward.item = itemPool[Math.floor(Math.random() * itemPool.length)];
  }

  this.state.passiveExpedition = {
    label: `${hours}h Passive Expedition`,
    duration: duration,
    timeRemaining: duration,
    reward: reward
  };

  this.save();
  this.notifyListeners('passive_expedition_started');
  return true;
};

// Handle interactive choice in Dungeon
GameStateManager.prototype.resolveDungeonChoice = function(choiceIndex) {
  this.initHeroDungeonState();
  const mission = this.state.heroDungeonMission;
  if (!mission || mission.choiceMade) return false;

  const encounterId = mission.encounterIds[mission.currentStep - 1];
  const encounter = DUNGEON_ENCOUNTERS.find(e => e.id === encounterId);
  if (!encounter) return false;

  const choice = encounter.choices[choiceIndex];
  if (!choice) return false;

  let successChance = choice.successChance;
  // Apply class bonus
  const matchesClass = this.state.hero.type === choice.classBonus ||
    (choice.classBonus === 'warlord' && this.state.hero.type === 'ranger') ||
    (choice.classBonus === 'treasurer' && this.state.hero.type === 'archmage');
  if (matchesClass) {
    successChance += 0.25;
  }

  // Apply equipment bonuses
  if (choice.classBonus === 'warlord' || choice.classBonus === 'ranger') {
    successChance += this.getHeroItemBonus('attack');
  } else if (choice.classBonus === 'paladin') {
    successChance += this.getHeroItemBonus('defense');
  }
  successChance = Math.min(0.95, successChance);

  const success = Math.random() < successChance;
  let logText = "";
  if (success) {
    logText = choice.successText;
    const loot = choice.successLoot || {};
    if (loot.gold) mission.accumulatedLoot.gold += loot.gold;
    if (loot.rubies) mission.accumulatedLoot.rubies += loot.rubies;
  } else {
    logText = choice.failText;
    const dmg = choice.failDamage || 10;
    mission.hp = Math.max(0, mission.hp - dmg);
  }

  mission.latestResultText = logText;
  mission.choiceMade = true;

  this.save();
  this.notifyListeners('dungeon_choice_resolved');
  return true;
};

// Advance step or complete
GameStateManager.prototype.nextDungeonStep = function() {
  const mission = this.state.heroDungeonMission;
  if (!mission) return false;

  if (mission.hp <= 0) {
    // Defeat: Hero retreats and loses loot
    const dungeon = DUNGEONS_CONFIG.find(d => d.id === mission.dungeonId);
    this.state.heroDungeonMission = null;

    this.state.latestDungeonReport = {
      dungeonName: dungeon.name,
      gold: 0,
      rubies: 0,
      item: null,
      victory: false,
      time: Date.now()
    };

    this.save();
    this.notifyListeners('dungeon_complete');
    return true;
  }

  if (mission.currentStep >= mission.totalSteps) {
    // Victory! Claim accumulated loot + final dungeon roll
    const dungeon = DUNGEONS_CONFIG.find(d => d.id === mission.dungeonId);
    this.state.heroDungeonMission = null;

    let lootItem = null;
    if (Math.random() < dungeon.rewardChance && dungeon.items.length > 0) {
      lootItem = dungeon.items[Math.floor(Math.random() * dungeon.items.length)];
      this.state.heroInventory.push(lootItem);
    }

    const finalGold = mission.accumulatedLoot.gold + 100 * dungeon.levelReq;
    const finalRubies = mission.accumulatedLoot.rubies + dungeon.levelReq;

    this.state.resources.gold += finalGold;
    this.state.resources.rubies += finalRubies;

    if (!this.state.statistics) this.state.statistics = {};
    this.state.statistics.dungeonsCleared = (this.state.statistics.dungeonsCleared || 0) + 1;

    this.state.latestDungeonReport = {
      dungeonName: dungeon.name,
      gold: finalGold,
      rubies: finalRubies,
      item: lootItem,
      victory: true,
      time: Date.now()
    };

    this.save();
    this.notifyListeners('dungeon_complete');
    return true;
  } else {
    mission.currentStep += 1;
    mission.choiceMade = false;
    mission.latestResultText = null;

    this.save();
    this.notifyListeners('dungeon_next_step');
    return true;
  }
};

// Helper to get total bonus from equipped items
GameStateManager.prototype.getHeroItemBonus = function(type) {
  this.initHeroDungeonState();
  if (!this.state.hero) return 0;

  let totalBonus = 0;
  Object.keys(this.state.heroEquipment).forEach(slot => {
    const itemId = this.state.heroEquipment[slot];
    if (itemId) {
      const cfg = ITEMS_CONFIG[itemId];
      if (cfg && cfg.bonus && cfg.bonus[type] !== undefined) {
        totalBonus += cfg.bonus[type];
      }
    }
  });
  return totalBonus;
};

// UI implementation for Dungeon Report Modal
GameUI.prototype.openDungeonReportModal = function(report) {
  let html = "";
  if (report.victory) {
    let itemHtml = report.item 
      ? `<p style="font-size: 1.1rem; color: #f1c40f; margin: 15px 0;">🎉 Gegenstand gefunden: <strong>${ITEMS_CONFIG[report.item].name}</strong>!</p>`
      : '<p style="color: var(--color-text-muted); margin: 15px 0;">Kein Gegenstand gefunden.</p>';

    html = `
      <h2>🏆 Expeditions-Sieg - ${report.dungeonName}</h2>
      <p class="modal-intro">Dein Held ist wohlbehalten und siegreich zurückgekehrt!</p>
      <div class="glass-card" style="text-align: center; padding: 20px;">
        <div style="font-size: 3.5rem; margin-bottom: 10px;">👑</div>
        <p style="font-size: 1rem; margin: 5px 0;">Beute geborgen:</p>
        <p style="font-size: 1.2rem; font-weight: bold; margin: 8px 0; color: var(--color-gold-hover);">🪙 ${report.gold} Gold | 💎 ${report.rubies} Rubine</p>
        ${itemHtml}
      </div>
      <button id="btn-dungeon-report-ok" class="primary-btn gold-btn" style="margin-top: 15px; width: 100%;">Schließen</button>
    `;
  } else {
    html = `
      <h2>💀 Expeditions-Niederlage - ${report.dungeonName}</h2>
      <p class="modal-intro">Dein Held wurde im Dungeon überwältigt und musste fliehen!</p>
      <div class="glass-card" style="text-align: center; padding: 20px; border-color: var(--color-red-hover);">
        <div style="font-size: 3.5rem; margin-bottom: 10px;">💀</div>
        <p style="font-size: 1.1rem; font-weight: bold; margin: 8px 0; color: #e74c3c;">Held wurde besiegt!</p>
        <p style="font-size: 0.8rem; color: var(--color-text-muted);">Er konnte entkommen, verlor jedoch die im Dungeon angesammelte Beute.</p>
      </div>
      <button id="btn-dungeon-report-ok" class="primary-btn danger-btn" style="margin-top: 15px; width: 100%;">Schließen</button>
    `;
  }

  this.openModal(html);
  document.getElementById('btn-dungeon-report-ok').addEventListener('click', () => this.closeModal());
};
