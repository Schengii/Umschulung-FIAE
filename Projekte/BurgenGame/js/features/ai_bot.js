// --- AI BOT FEATURE ---

class AIBot {
  constructor(stateManager, ui) {
    this.stateManager = stateManager;
    this.ui = ui;
    this.enabled = localStorage.getItem('empire_ai_enabled') !== 'false'; // default to true
    this.autoAttack = localStorage.getItem('empire_ai_auto_attack') === 'true'; // default to false (ask permission)
    this.personality = localStorage.getItem('empire_ai_personality') || 'builder';
    this.intervalSpeed = localStorage.getItem('empire_ai_speed') || 'normal';
    this.lastActionTime = 0;
    this.actionInterval = this.getSpeedMs(this.intervalSpeed);
  }

  getSpeedMs(speed) {
    if (speed === 'fast') return 6000;  // 6 seconds
    if (speed === 'slow') return 30000; // 30 seconds
    return 15000; // 15 seconds (normal)
  }

  setSpeed(speed) {
    this.intervalSpeed = speed;
    localStorage.setItem('empire_ai_speed', speed);
    this.actionInterval = this.getSpeedMs(speed);
    if (this.enabled) {
      this.start();
    }
  }

  setPersonality(p) {
    this.personality = p;
    localStorage.setItem('empire_ai_personality', p);
  }

  start() {
    this.enabled = true;
    localStorage.setItem('empire_ai_enabled', 'true');
    this.tick();
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.tick(), this.actionInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.enabled = false;
    localStorage.setItem('empire_ai_enabled', 'false');
  }

  tick() {
    if (!this.enabled) return;

    try {
      // 1. FAST QUEST COMPLETIONS
      let questDone = false;
      const state = this.stateManager.state;
      if (state.dailyQuests) {
        state.dailyQuests.forEach(q => {
          if (!q.completed && this.stateManager.canCompleteDailyQuest(q.id)) {
            if (this.stateManager.completeDailyQuest(q.id)) {
              this.ui.showFloatingNotification(`🤖 AI hat tägliche Aufgabe abgegeben: ${q.title}`);
              questDone = true;
            }
          }
        });
      }
      if (state.activeQuestId) {
        const quest = QUESTS_CONFIG.find(q => q.id === state.activeQuestId);
        if (quest && quest.condition(state)) {
          this.stateManager.notifyListeners('quest_complete_check');
        }
      }

      if (questDone) {
        this.stateManager.save();
        this.stateManager.notifyListeners('ai_action');
      }

      // 2. Perform main priority actions
      this.performActions();
    } catch (error) {
      console.error("Error in AIBot tick:", error);
    }
  }

  builderTaxes() {
    const state = this.stateManager.state;
    const taxHouse = state.buildings.find(b => b.type === BUILDING_TYPES.TAX_HOUSE && !b.underConstruction);
    if (taxHouse) {
      const tax = state.taxState;
      if (tax.canCollect) {
        if (this.stateManager.collectTaxes()) {
          this.ui.showFloatingNotification("🤖 AI hat Steuern eingetrieben.");
          return true;
        }
      } else if (!tax.optionId) {
        const opt = 'medium'; 
        if (this.stateManager.startTaxCollection(opt)) {
          this.ui.showFloatingNotification(`🤖 AI hat Steuereintreibung gestartet (${opt}).`);
          return true;
        }
      }
    }
    return false;
  }

  builderQuests() {
    const state = this.stateManager.state;
    let actionTaken = false;
    if (state.dailyQuests) {
      state.dailyQuests.forEach(q => {
        if (!q.completed && this.stateManager.canCompleteDailyQuest(q.id)) {
          if (this.stateManager.completeDailyQuest(q.id)) {
            this.ui.showFloatingNotification(`🤖 AI hat tägliche Aufgabe abgegeben: ${q.title}`);
            actionTaken = true;
          }
        }
      });
    }
    return actionTaken;
  }

  builderMainQuests() {
    const state = this.stateManager.state;
    if (state.activeQuestId) {
      const quest = QUESTS_CONFIG.find(q => q.id === state.activeQuestId);
      if (quest && !quest.condition(state)) {
        if (quest.id === 'quest_woodcutter') {
          return this.tryBuildBuilding(BUILDING_TYPES.WOODCUTTER);
        } else if (quest.id === 'quest_quarry') {
          return this.tryBuildBuilding(BUILDING_TYPES.QUARRY);
        } else if (quest.id === 'quest_farm') {
          return this.tryBuildBuilding(BUILDING_TYPES.FARM);
        } else if (quest.id === 'quest_tax') {
          return this.tryBuildBuilding(BUILDING_TYPES.TAX_HOUSE);
        } else if (quest.id === 'quest_barracks') {
          return this.tryBuildBuilding(BUILDING_TYPES.BARRACKS);
        } else if (quest.id === 'quest_recruit') {
          const spearmanCount = state.troops.spearman || 0;
          if (spearmanCount < 5) {
            return this.tryRecruitTroops('spearman', 5 - spearmanCount);
          }
        } else if (quest.id === 'quest_upgrade_keep') {
          const keep = state.buildings.find(b => b.type === BUILDING_TYPES.KEEP);
          if (keep && keep.level < 2) {
            return this.tryUpgradeBuilding(keep.id);
          }
        } else if (quest.id === 'quest_spring') {
          return this.tryBuildBuilding(BUILDING_TYPES.FOUNTAIN);
        } else if (quest.id === 'quest_tavern') {
          return this.tryBuildBuilding(BUILDING_TYPES.TAVERN);
        } else if (quest.id === 'quest_spy') {
          const currentSpies = state.troops.spy || 0;
          if (currentSpies < 1) {
            return this.tryRecruitTroops('spy', 1);
          } else {
            const targetNpc = WORLD_MAP_CONFIG.npcCastles.find(c => c.level === 1);
            if (targetNpc) {
              this.stateManager.dispatchSpy(targetNpc.id, 1);
              this.ui.showFloatingNotification(`🤖 AI hat Spion zu ${targetNpc.name} geschickt.`);
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  builderUpgrade() {
    const state = this.stateManager.state;
    const keep = state.buildings.find(b => b.type === BUILDING_TYPES.KEEP);
    
    // Upgrade Keep if possible
    if (keep && !keep.underConstruction) {
      const nextKeepLvl = keep.level + 1;
      const keepCfg = BUILDINGS_CONFIG[BUILDING_TYPES.KEEP].levels[nextKeepLvl];
      if (keepCfg && this.stateManager.hasResources(keepCfg.cost)) {
        return this.tryUpgradeBuilding(keep.id);
      }
    }

    // Upgrade other random buildings
    if (state.buildings.length > 0) {
      const upgradeable = state.buildings.filter(b => {
        if (b.underConstruction) return false;
        const nextLvl = b.level + 1;
        const cfg = BUILDINGS_CONFIG[b.type].levels[nextLvl];
        if (!cfg) return false;
        if (b.type !== BUILDING_TYPES.KEEP && keep && nextLvl > keep.level) return false;
        return this.stateManager.hasResources(cfg.cost);
      });
      if (upgradeable.length > 0) {
        const targetB = upgradeable[Math.floor(Math.random() * upgradeable.length)];
        return this.tryUpgradeBuilding(targetB.id);
      }
    }

    // Build resource structures (Only build new if existing are fully upgraded to Keep level to avoid clutter)
    const buildOptions = Object.keys(BUILDINGS_CONFIG).filter(type => {
      if (type === BUILDING_TYPES.KEEP) return false;
      const count = state.buildings.filter(b => b.type === type).length;
      const limit = this.stateManager.getBuildingLimit(type);
      if (count >= limit) return false;

      // Prioritize upgrading existing ones first!
      const existing = state.buildings.filter(b => b.type === type);
      const keepLvl = keep ? keep.level : 1;
      const hasUnderleveled = existing.some(b => b.level < keepLvl && !b.underConstruction);
      if (hasUnderleveled) return false; // Do not build a new one if we have an underleveled existing one!

      const levelCfg = BUILDINGS_CONFIG[type].levels[1];
      return levelCfg && this.stateManager.hasResources(levelCfg.cost);
    });
    if (buildOptions.length > 0) {
      const typeToBuild = buildOptions[Math.floor(Math.random() * buildOptions.length)];
      return this.tryBuildBuilding(typeToBuild);
    }
    return false;
  }

  warlordRecruit() {
    const state = this.stateManager.state;
    const troopTypes = Object.keys(TROOPS_CONFIG);
    const recruitableTroops = troopTypes.filter(t => {
      if (t === 'spy') {
        const currentSpies = state.troops.spy || 0;
        if (currentSpies >= 2) return false;
      }
      const barracks = state.buildings.find(b => b.type === BUILDING_TYPES.BARRACKS && !b.underConstruction);
      if (!barracks) return false;
      const unlocked = BUILDINGS_CONFIG[BUILDING_TYPES.BARRACKS].levels[barracks.level]?.unlocks || [];
      if (t !== 'spy' && t !== 'knight' && !unlocked.includes(t)) return false;
      if (t === 'knight') {
        const stables = state.buildings.find(b => b.type === BUILDING_TYPES.STABLES && !b.underConstruction);
        if (!stables) return false;
        const stUnlocked = BUILDINGS_CONFIG[BUILDING_TYPES.STABLES].levels[stables.level]?.unlocks || [];
        if (!stUnlocked.includes(t)) return false;
      }
      const cost = TROOPS_CONFIG[t].cost;
      return this.stateManager.hasResources(cost);
    });

    if (recruitableTroops.length > 0) {
      const troopToRecruit = recruitableTroops[Math.floor(Math.random() * recruitableTroops.length)];
      return this.tryRecruitTroops(troopToRecruit, 1);
    }
    return false;
  }

  warlordAttack() {
    const state = this.stateManager.state;
    const attackTroops = {
      spearman: state.troops.spearman || 0,
      swordsman: state.troops.swordsman || 0,
      bowman: state.troops.bowman || 0,
      knight: state.troops.knight || 0
    };
    const totalAttackPower = Object.values(attackTroops).reduce((a, b) => a + b, 0);

    if (totalAttackPower >= 6) {
      let target = null;
      let targetType = 'npc';

      // Conquests outposts
      if (state.outposts) {
        const unownedOp = WORLD_MAP_CONFIG.outposts.find(op => {
          const opState = state.outposts[op.id];
          return !opState || opState.owner !== 'player';
        });
        if (unownedOp) {
          target = unownedOp;
          targetType = 'outpost';
        }
      }

      // Attack Robber Barons
      if (!target) {
        const suitableNpcs = WORLD_MAP_CONFIG.npcCastles.filter(npc => {
          const defCount = Object.values(npc.defenders).reduce((a, b) => a + b, 0);
          return totalAttackPower >= defCount * 1.1;
        });
        if (suitableNpcs.length > 0) {
          target = suitableNpcs[Math.floor(Math.random() * suitableNpcs.length)];
        }
      }

      if (target) {
        const attackTarget = target;
        const type = targetType;
        const isPlayerOwnedOutpost = type === 'outpost' && state.outposts?.[attackTarget.id]?.owner === 'player';
        const isScouted = state.scoutedSites?.[attackTarget.id] || attackTarget.level === 1 || isPlayerOwnedOutpost;

        if (!isScouted && type === 'npc') {
          const spyCount = state.troops.spy || 0;
          if (spyCount > 0) {
            this.stateManager.dispatchSpy(attackTarget.id, 1);
            this.ui.showFloatingNotification(`🤖 AI hat Spion zu ${attackTarget.name} geschickt.`);
            return true;
          } else {
            return this.tryRecruitTroops('spy', 1);
          }
        } else {
          const army = {};
          let troopsLeftToSend = Math.min(totalAttackPower - 1, 8);
          Object.keys(attackTroops).forEach(t => {
            const toSend = Math.min(attackTroops[t], troopsLeftToSend);
            if (toSend > 0) {
              army[t] = toSend;
              troopsLeftToSend -= toSend;
            }
          });

          if (Object.keys(army).length > 0) {
            const onApprove = () => {
              if (this.stateManager.dispatchAttack(attackTarget.id, army, type)) {
                this.ui.showFloatingNotification(`🤖 AI greift ${attackTarget.name} an.`);
              }
            };
            this.proposeAttack(attackTarget.name, onApprove);
            return true;
          }
        }
      }
    }
    return false;
  }

  warlordUpgrade() {
    const state = this.stateManager.state;
    // Upgrade Barracks, Stables, Blacksmith, or Walls specifically
    const milBuildings = state.buildings.filter(b => 
      [BUILDING_TYPES.BARRACKS, BUILDING_TYPES.STABLES, BUILDING_TYPES.BLACKSMITH, BUILDING_TYPES.WALL].includes(b.type)
    );
    if (milBuildings.length > 0) {
      const keep = state.buildings.find(b => b.type === BUILDING_TYPES.KEEP);
      const upgradeable = milBuildings.filter(b => {
        if (b.underConstruction) return false;
        const nextLvl = b.level + 1;
        const cfg = BUILDINGS_CONFIG[b.type].levels[nextLvl];
        if (!cfg) return false;
        if (keep && nextLvl > keep.level) return false;
        return this.stateManager.hasResources(cfg.cost);
      });
      if (upgradeable.length > 0) {
        const targetB = upgradeable[Math.floor(Math.random() * upgradeable.length)];
        return this.tryUpgradeBuilding(targetB.id);
      }
    }
    return false;
  }

  crawlerHero() {
    const state = this.stateManager.state;
    if (state.hero) {
      if (state.heroDungeonMission) {
        const mission = state.heroDungeonMission;
        if (!mission.choiceMade) {
          const encId = mission.encounterIds[mission.currentStep - 1];
          const enc = DUNGEON_ENCOUNTERS.find(e => e.id === encId);
          if (enc) {
            let bestChoiceIdx = 0;
            enc.choices.forEach((c, idx) => {
              if (c.classBonus === state.hero.type) {
                bestChoiceIdx = idx;
              }
            });
            if (this.stateManager.resolveDungeonChoice(bestChoiceIdx)) {
              this.ui.showFloatingNotification(`🤖 AI hat Entscheidung im Dungeon getroffen (${enc.title}).`);
              return true;
            }
          }
        } else {
          if (this.stateManager.nextDungeonStep()) {
            this.ui.showFloatingNotification(`🤖 AI ist im Dungeon vorangeschritten.`);
            return true;
          }
        }
      } else {
        const playableDungeons = DUNGEONS_CONFIG.filter(d => state.hero.level >= d.levelReq);
        if (playableDungeons.length > 0) {
          const bestDungeon = playableDungeons.reduce((max, d) => d.levelReq > max.levelReq ? d : max, playableDungeons[0]);
          if (this.stateManager.startDungeon(bestDungeon.id)) {
            this.ui.showFloatingNotification(`🤖 AI hat Held in Dungeon ${bestDungeon.name} geschickt.`);
            return true;
          }
        }
      }
    } else if (state.resources.gold >= 150) {
      if (this.stateManager.recruitHero('paladin')) {
        this.ui.showFloatingNotification("🤖 AI hat einen Helden (Paladin) beschworen!");
        return true;
      }
    }
    return false;
  }

  crawlerUpgrade() {
    const state = this.stateManager.state;
    // Upgrade Altar / Blacksmith
    const crawlerBuildings = state.buildings.filter(b => 
      [BUILDING_TYPES.HERO_ALTAR, BUILDING_TYPES.BLACKSMITH].includes(b.type)
    );
    if (crawlerBuildings.length > 0) {
      const keep = state.buildings.find(b => b.type === BUILDING_TYPES.KEEP);
      const upgradeable = crawlerBuildings.filter(b => {
        if (b.underConstruction) return false;
        const nextLvl = b.level + 1;
        const cfg = BUILDINGS_CONFIG[b.type].levels[nextLvl];
        if (!cfg) return false;
        if (keep && nextLvl > keep.level) return false;
        return this.stateManager.hasResources(cfg.cost);
      });
      if (upgradeable.length > 0) {
        const targetB = upgradeable[Math.floor(Math.random() * upgradeable.length)];
        return this.tryUpgradeBuilding(targetB.id);
      }
    }
    return false;
  }

  performActions() {
    const state = this.stateManager.state;
    let actionTaken = false;

    // Dynamic taxes adjustment based on happiness
    if (state.happiness !== undefined) {
      if (state.happiness > 70 && state.taxRate !== 'high') {
        this.stateManager.setTaxRate('high');
        this.ui.showFloatingNotification("🤖 AI hat Steuersatz auf HOCH gesetzt (Volk ist glücklich).");
      } else if (state.happiness < 40 && state.taxRate !== 'low') {
        this.stateManager.setTaxRate('low');
        this.ui.showFloatingNotification("🤖 AI hat Steuersatz auf NIEDRIG gesetzt (Volk ist unzufrieden).");
      } else if (state.happiness >= 40 && state.happiness <= 70 && state.taxRate !== 'normal') {
        this.stateManager.setTaxRate('normal');
        this.ui.showFloatingNotification("🤖 AI hat Steuersatz auf NORMAL gesetzt.");
      }
    }

    // Auto Gem socketing on hero
    if (state.hero && state.resources.rubies >= 15 && state.resources.gold >= 1000) {
      const eq = state.heroEquipment || { weapon: null, armor: null, accessory: null };
      const gems = state.heroEquipmentGems || { weapon: null, armor: null, accessory: null };
      if (eq.weapon && !gems.weapon) {
        if (this.stateManager.socketGem('weapon', 'ruby')) {
          this.ui.showFloatingNotification("🤖 AI hat einen Rubin in die Waffe gesockelt.");
        }
      } else if (eq.armor && !gems.armor) {
        if (this.stateManager.socketGem('armor', 'emerald')) {
          this.ui.showFloatingNotification("🤖 AI hat einen Smaragd in die Rüstung gesockelt.");
        }
      } else if (eq.accessory && !gems.accessory) {
        if (this.stateManager.socketGem('accessory', 'sapphire')) {
          this.ui.showFloatingNotification("🤖 AI hat einen Saphir in das Amulett gesockelt.");
        }
      }
    }

    // Build brewery if resources are high
    if (state.resources.wood > 500 && state.resources.food > 500 && !state.buildings.some(b => b.type === BUILDING_TYPES.BREWERY)) {
      actionTaken = this.tryBuildBuilding(BUILDING_TYPES.BREWERY);
    }

    if (this.personality === 'warlord') {
      if (!actionTaken) actionTaken = this.warlordRecruit();
      if (!actionTaken) actionTaken = this.warlordAttack();
      if (!actionTaken) actionTaken = this.warlordUpgrade();
      if (!actionTaken) actionTaken = this.builderQuests();
      if (!actionTaken) actionTaken = this.builderTaxes();
    } else if (this.personality === 'crawler') {
      if (!actionTaken) actionTaken = this.crawlerHero();
      if (!actionTaken) actionTaken = this.crawlerUpgrade();
      if (!actionTaken) actionTaken = this.builderQuests();
      if (!actionTaken) actionTaken = this.builderTaxes();
      if (!actionTaken) actionTaken = this.warlordRecruit() || this.warlordAttack();
    } else {
      // builder (default)
      if (!actionTaken) actionTaken = this.builderTaxes();
      if (!actionTaken) actionTaken = this.builderQuests() || this.builderMainQuests();
      if (!actionTaken) actionTaken = this.builderUpgrade();
      if (!actionTaken) actionTaken = this.crawlerHero() || this.warlordRecruit();
    }

    if (actionTaken) {
      this.stateManager.save();
      this.stateManager.notifyListeners('ai_action');
    }
  }

  proposeAttack(targetName, onApprove) {
    if (this.autoAttack) {
      onApprove();
      return;
    }
    this.ui.showAttackProposal(targetName, onApprove, () => {
      this.ui.showFloatingNotification("🤖 AI-Angriffsvorschlag abgelehnt.");
    });
  }

  tryBuildBuilding(type) {
    const config = BUILDINGS_CONFIG[type];
    if (!config) return false;
    const levelCfg = config.levels[1];
    if (!levelCfg || !this.stateManager.hasResources(levelCfg.cost)) return false;

    const w = config.baseWidth;
    const h = config.baseHeight;
    for (let x = 0; x <= MAP_SIZE - w; x++) {
      for (let y = 0; y <= MAP_SIZE - h; y++) {
        if (this.isPlacementValid(x, y, w, h)) {
          if (this.stateManager.buildBuilding(type, x, y)) {
            this.ui.showFloatingNotification(`🤖 AI hat ein ${config.name} gebaut.`);
            return true;
          }
        }
      }
    }
    return false;
  }

  tryUpgradeBuilding(id) {
    const b = this.stateManager.state.buildings.find(item => item.id === id);
    if (!b || b.underConstruction) return false;
    const nextLevel = b.level + 1;
    const config = BUILDINGS_CONFIG[b.type];
    const levelCfg = config?.levels[nextLevel];
    if (!levelCfg || !this.stateManager.hasResources(levelCfg.cost)) return false;

    if (this.stateManager.upgradeBuilding(id)) {
      this.ui.showFloatingNotification(`🤖 AI hat ${config.name} auf Stufe ${nextLevel} ausgebaut.`);
      return true;
    }
    return false;
  }

  tryRecruitTroops(type, count) {
    if (count <= 0) return false;
    const cfg = TROOPS_CONFIG[type];
    if (!cfg) return false;

    if (this.stateManager.recruitTroops(type, count)) {
      this.ui.showFloatingNotification(`🤖 AI rekrutiert ${count}x ${cfg.name}.`);
      return true;
    }
    return false;
  }

  isPlacementValid(x, y, w, h) {
    if (x < 0 || x + w > MAP_SIZE || y < 0 || y + h > MAP_SIZE) return false;
    for (const b of this.stateManager.state.buildings) {
      const cfg = BUILDINGS_CONFIG[b.type];
      if (!cfg) continue;
      const overlapX = Math.max(0, Math.min(x + w, b.x + cfg.baseWidth) - Math.max(x, b.x));
      const overlapY = Math.max(0, Math.min(y + h, b.y + cfg.baseHeight) - Math.max(y, b.y));
      if (overlapX > 0 && overlapY > 0) return false;
    }
    return true;
  }
}

window.AIBot = null;
