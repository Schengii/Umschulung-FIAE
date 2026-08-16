// --- CORE GAME STATE MANAGER ---
// Imported Persistence and I18n (assumes globals are available)


class GameStateManager {
  constructor() {
    this.state = null;
    this.autosaveInterval = null;
    this.listeners = [];
    this.historyStack = [];
    this.historyIndex = -1;
    this.maxHistory = 20;
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  notifyListeners(changeType = 'general') {
    this.listeners.forEach(cb => cb(this.state, changeType));
  }

  saveSnapshot(actionLabel = 'action') {
    if (!this.state) return;
    if (this.historyIndex < this.historyStack.length - 1) {
      this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
    }
    const snapshot = JSON.stringify(this.state);
    this.historyStack.push({ label: actionLabel, data: snapshot });
    if (this.historyStack.length > this.maxHistory) {
      this.historyStack.shift();
    } else {
      this.historyIndex++;
    }
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.state = JSON.parse(this.historyStack[this.historyIndex].data);
      this.notifyListeners('undo');
      return true;
    }
    return false;
  }

  redo() {
    if (this.historyIndex < this.historyStack.length - 1) {
      this.historyIndex++;
      this.state = JSON.parse(this.historyStack[this.historyIndex].data);
      this.notifyListeners('redo');
      return true;
    }
    return false;
  }

  dispatch(actionType, payload = {}) {
    if (!this.state) return;
    this.saveSnapshot(actionType);
    switch (actionType) {
      case 'SET_RESOURCE':
        if (payload.key && payload.value !== undefined) {
          this.state.resources[payload.key] = payload.value;
        }
        break;
      case 'ADD_RESOURCES':
        if (payload.resources) {
          Object.keys(payload.resources).forEach(k => {
            this.state.resources[k] = (this.state.resources[k] || 0) + payload.resources[k];
          });
        }
        break;
      case 'SET_COMBAT_FORMATION':
        if (payload.formation) {
          this.state.combatFormation = payload.formation;
        }
        break;
      case 'UPDATE_MORALE':
        if (payload.delta) {
          this.state.happiness = Math.max(0, Math.min(100, (this.state.happiness || 50) + payload.delta));
        }
        break;
      default:
        break;
    }
    this.notifyListeners(actionType);
  }

  async init() {
    const saved = await Persistence.load();
    if (saved) {
      try {
        this.state = saved;
        // Migrations for spy system compatibility
        if (!this.state.troops) this.state.troops = { spearman: 0, swordsman: 0, bowman: 0 };
        if (this.state.troops.spy === undefined) this.state.troops.spy = 0;
        if (this.state.troops.knight === undefined) this.state.troops.knight = 0;
        if (!this.state.resources) this.state.resources = { ...START_RESOURCES };
        if (this.state.resources.iron === undefined) this.state.resources.iron = 0;
        if (this.state.resources.weapons === undefined) this.state.resources.weapons = 0;
        if (!this.state.research) this.state.research = {};
        if (!this.state.spyReports) this.state.spyReports = {};
        if (!this.state.statistics) this.state.statistics = { npcDefeated: 0, maxNpcLevelDefeated: 0, totalGoldCollected: 0, rubiesSpent: 0 };
        if (this.state.statistics.npcSpied === undefined) this.state.statistics.npcSpied = 0;
        if (this.state.nextEventTime === undefined) this.state.nextEventTime = Date.now() + 600000;
        if (this.state.hero === undefined) this.state.hero = null;
        if (this.state.defenseCountdown === undefined) this.state.defenseCountdown = null;
        if (this.state.nextDefenseTime === undefined) this.state.nextDefenseTime = Date.now() + 480000;
        if (!this.state.outposts) {
          this.state.outposts = {
            op1: { owner: 'npc', garrison: { spearman: 0, swordsman: 0, bowman: 0, knight: 0 }, buildings: [], accumulatedResources: 0 },
            op2: { owner: 'npc', garrison: { spearman: 0, swordsman: 0, bowman: 0, knight: 0 }, buildings: [], accumulatedResources: 0 },
            op3: { owner: 'npc', garrison: { spearman: 0, swordsman: 0, bowman: 0, knight: 0 }, buildings: [], accumulatedResources: 0 },
            cp1: { owner: 'npc', garrison: { spearman: 0, swordsman: 0, bowman: 0, knight: 0 }, buildings: [], accumulatedResources: 0 },
            cp2: { owner: 'npc', garrison: { spearman: 0, swordsman: 0, bowman: 0, knight: 0 }, buildings: [], accumulatedResources: 0 },
            cp3: { owner: 'npc', garrison: { spearman: 0, swordsman: 0, bowman: 0, knight: 0 }, buildings: [], accumulatedResources: 0 }
          };
        } else {
          ['op1', 'op2', 'op3', 'cp1', 'cp2', 'cp3'].forEach(opId => {
            if (!this.state.outposts[opId]) {
              this.state.outposts[opId] = { owner: 'npc', garrison: { spearman: 0, swordsman: 0, bowman: 0, knight: 0 }, buildings: [], accumulatedResources: 0 };
            }
          });
          Object.keys(this.state.outposts).forEach(opId => {
            const opState = this.state.outposts[opId];
            if (!opState.buildings) opState.buildings = [];
            if (opState.accumulatedResources === undefined) opState.accumulatedResources = 0;
          });
        }
        
        if (this.state.seasonIndex === undefined) this.state.seasonIndex = 0;
        if (this.state.seasonTimeRemaining === undefined) this.state.seasonTimeRemaining = SEASON_DURATION_SEC;
        if (!this.state.scoutedSites) this.state.scoutedSites = {};
        if (!this.state.dailyQuests) this.state.dailyQuests = [];
        if (!this.state.dailyQuestsProgress) this.state.dailyQuestsProgress = { spyCount: 0, troopCount: 0 };
        if (!this.state.heroInventory) this.state.heroInventory = [];
        if (!this.state.heroEquipment) this.state.heroEquipment = { weapon: null, armor: null, accessory: null };
        if (this.state.heroDungeonMission === undefined) this.state.heroDungeonMission = null;
        if (this.state.resources.iron_ore === undefined) this.state.resources.iron_ore = 0;
        if (this.state.resources.flour === undefined) this.state.resources.flour = 0;
        if (this.state.resources.bread === undefined) this.state.resources.bread = 0;
        if (this.state.resources.beer === undefined) this.state.resources.beer = 0;
        if (this.state.resources.hide === undefined) this.state.resources.hide = 0;
        if (this.state.resources.leather === undefined) this.state.resources.leather = 0;
        if (this.state.taxRate === undefined) this.state.taxRate = 'normal';
        if (this.state.resourceReserves === undefined) this.state.resourceReserves = { wood: 0, stone: 0, food: 0, gold: 0, iron: 0 };
        if (this.state.weather === undefined) this.state.weather = { type: 'sunny', timeRemaining: 30 };
        if (this.state.population === undefined) this.state.population = 10;
        if (this.state.happiness === undefined) this.state.happiness = 50;
        if (!this.state.prestige) this.state.prestige = { totalPoints: 0, resets: 0, rank: 0 };
        if (!this.state.researchProgress) this.state.researchProgress = {};
        if (!this.state.wallGarrison) this.state.wallGarrison = {};
        if (!this.state.maritimeShips) this.state.maritimeShips = [];
        if (!this.state.luxuryGoods) this.state.luxuryGoods = { spices: 0, silk: 0, gemstones: 0 };
        if (!this.state.diplomacy) { /* Will be initialized lazily */ }
        if (!this.state.statHistory) { /* Will be initialized lazily */ }
        if (!this.state.statistics.sessionStart) this.state.statistics.sessionStart = Date.now();
        if (this.state.statistics.coopAttacksLaunched === undefined) this.state.statistics.coopAttacksLaunched = 0;
        if (!this.state.troops.paladin) this.state.troops.paladin = 0;
        if (!this.state.troops.border_guard) this.state.troops.border_guard = 0;
        if (this.state.ageIndex === undefined) {
          const keep = this.state.buildings.find(b => b.type === BUILDING_TYPES.KEEP);
          this.state.ageIndex = keep ? Math.min(AGES.IMPERIAL, Math.max(AGES.DARK, keep.level - 1)) : AGES.DARK;
        }

        this.catchUpOfflineProgress();
      } catch (e) {
        console.error("Failed to load save, resetting state", e);
        this.resetToDefault();
      }
    } else {
      this.resetToDefault();
    }

    this.autosaveInterval = setInterval(() => this.save(), 5000);
  }

  resetToDefault() {
    this.state = {
      castleName: 'Hauptburg',
      bannerColor: '#3498db',
      resources: { ...START_RESOURCES },
      buildings: [
        {
          id: 'keep_1',
          type: BUILDING_TYPES.KEEP,
          x: 4,
          y: 4,
          level: 1,
          underConstruction: false,
          constructionTimeRemaining: 0,
          constructionTimeTotal: 0
        }
      ],
      troops: {
        spearman: 0,
        swordsman: 0,
        bowman: 0,
        spy: 0,
        knight: 0
      },
      recruitmentQueue: [],
      missions: [],
      spyReports: {},
      completedQuests: [],
      activeQuestId: QUESTS_CONFIG[0].id,
      taxState: {
        optionId: null,
        timeRemaining: 0,
        timeTotal: 0,
        canCollect: false
      },
      statistics: {
        npcDefeated: 0,
        maxNpcLevelDefeated: 0,
        totalGoldCollected: 0,
        rubiesSpent: 0,
        npcSpied: 0,
        coopAttacksLaunched: 0,
        sessionStart: Date.now()
      },
      population: 10,
      happiness: 50,
      taxRate: 'normal',
      ageIndex: AGES.DARK,
      resourceReserves: { wood: 0, stone: 0, food: 0, gold: 0, iron: 0 },
      weather: { type: 'sunny', timeRemaining: 30 },
      prestige: { totalPoints: 0, resets: 0, rank: 0 },
      researchProgress: {},
      wallGarrison: {},
      maritimeShips: [],
      luxuryGoods: { spices: 0, silk: 0, gemstones: 0 },
      research: {},
      outposts: {
        op1: { owner: 'npc', garrison: { spearman: 0, swordsman: 0, bowman: 0, knight: 0 }, buildings: [], accumulatedResources: 0 },
        op2: { owner: 'npc', garrison: { spearman: 0, swordsman: 0, bowman: 0, knight: 0 }, buildings: [], accumulatedResources: 0 },
        op3: { owner: 'npc', garrison: { spearman: 0, swordsman: 0, bowman: 0, knight: 0 }, buildings: [], accumulatedResources: 0 }
      },
      hero: null,
      heroInventory: [],
      heroEquipment: { weapon: null, armor: null, accessory: null },
      heroDungeonMission: null,
      seasonIndex: 0,
      seasonTimeRemaining: SEASON_DURATION_SEC,
      scoutedSites: {},
      dailyQuests: [],
      dailyQuestsProgress: { spyCount: 0, troopCount: 0 },
      defenseCountdown: null,
      nextDefenseTime: Date.now() + (480000 + Math.random() * 240000),
      nextEventTime: Date.now() + (600000 + Math.random() * 300000),
      lastTickTime: Date.now()
    };
    this.save();
    this.refreshDailyQuests(); // Initialize first batch of daily quests
    this.notifyListeners('reset');
  }

  calculateScore() {
    if (!this.state) return 0;
    const keep = this.state.buildings.find(b => b.type === BUILDING_TYPES.KEEP) || { level: 1 };
    const keepLevel = keep.level || 1;
    const totalBuildings = this.state.buildings.length;
    const totalTroops = Object.values(this.state.troops).reduce((a, b) => a + b, 0);
    const npcDefeated = this.state.statistics?.npcDefeated || 0;
    const dungeonsCleared = this.state.statistics?.dungeonsCleared || 0;

    return keepLevel * 500 + totalBuildings * 100 + totalTroops * 10 + npcDefeated * 50 + dungeonsCleared * 100;
  }

  save() {
    if (!this.state) return;
    this.state.lastTickTime = Date.now();
    Persistence.save(this.state);

    // Update local highscores
    const currentScore = this.calculateScore();
    let highscores = Persistence.loadHighscores();

    let existingIdx = highscores.findIndex(h => h.castleName === this.state.castleName);
    if (existingIdx !== -1) {
      if (currentScore > highscores[existingIdx].score) {
        highscores[existingIdx].score = currentScore;
        highscores[existingIdx].date = new Date().toLocaleDateString('de-DE');
      }
    } else {
      highscores.push({
        castleName: this.state.castleName,
        score: currentScore,
        date: new Date().toLocaleDateString('de-DE')
      });
    }

    highscores.sort((a, b) => b.score - a.score);
    highscores = highscores.slice(0, 5);

    Persistence.saveHighscores(highscores);
  }

  catchUpOfflineProgress() {
    const now = Date.now();
    let elapsedSec = Math.floor((now - this.state.lastTickTime) / 1000);
    if (elapsedSec <= 0) return;

    const stepSize = 5;
    const maxSeconds = 14400; // max 4 hrs
    const simTime = Math.min(elapsedSec, maxSeconds);

    for (let t = 0; t < simTime; t += stepSize) {
      this.tick(stepSize, false);
    }

    this.state.lastTickTime = now;
    this.save();
  }

  tick(dt = 1, notify = true) {
    if (!this.state) return;

    this.updateResources(dt);
    this.updateConstruction(dt);
    this.updateRecruitment(dt);
    this.updateMissions(dt);
    this.updateTaxes(dt);
    this.checkQuests();
    this.checkRandomEvents(dt);
    this.checkDefensiveBattles(dt);
    this.tickSeasons(dt);
    this.tickWeather(dt);
    this.tickDungeons(dt);
    if (this.tickTradeRoutes) this.tickTradeRoutes(dt);
    if (this.tickPopulation) this.tickPopulation(dt);
    if (this.tickDiplomacy) this.tickDiplomacy(dt);
    if (this.tickStatHistory) this.tickStatHistory(dt);
    if (this.tickMaritimeTrade) this.tickMaritimeTrade(dt);
    if (this.checkDisasterEvents) this.checkDisasterEvents(dt);
    this.checkDiplomaticTradeOffers(dt);

    if (notify) {
      this.notifyListeners('tick');
    }
  }

  tickWeather(dt) {
    if (!this.state.weather) {
      this.state.weather = { type: 'sunny', timeRemaining: 30 };
    }
    this.state.weather.timeRemaining -= dt;
    if (this.state.weather.timeRemaining <= 0) {
      const weathers = ['sunny', 'rainy', 'stormy'];
      if (SEASONS_CONFIG[this.state.seasonIndex] && SEASONS_CONFIG[this.state.seasonIndex].id === 'winter') {
        weathers.push('snowy');
      }
      this.state.weather.type = weathers[Math.floor(Math.random() * weathers.length)];
      this.state.weather.timeRemaining = 30 + Math.random() * 30; // 30-60s
      this.save();
      this.notifyListeners('weather_changed');
    }
  }

  checkRandomEvents(dt) {
    if (!this.state.nextEventTime) {
      this.state.nextEventTime = Date.now() + 600000;
    }

    if (Date.now() >= this.state.nextEventTime) {
      this.state.nextEventTime = Date.now() + (600000 + Math.random() * 600000);
      
      const event = RANDOM_EVENTS_CONFIG[Math.floor(Math.random() * RANDOM_EVENTS_CONFIG.length)];
      this.state.activeEvent = event.id;
      
      this.save();
      this.notifyListeners('random_event_triggered');
    }
  }

  updateResources(dt) {
    const res = this.state.resources;
    let woodRate = 0;
    let stoneRate = 0;
    let foodRate = 0;
    let ironRate = 0;
    let iron_oreRate = 0;
    let flourRate = 0;
    let breadRate = 0;
    let hideRate = 0;
    let hasFountain = this.state.buildings.some(b => b.type === BUILDING_TYPES.FOUNTAIN && !b.underConstruction);
    
    let woodMult = 1.0;
    let stoneMult = 1.0;
    let foodMult = 1.0;
    let ironMult = 1.0;
    let ironOreMult = 1.0;

    if (this.state.research) {
      if (this.state.research.forestry) woodMult += 0.15;
      if (this.state.research.masonry) stoneMult += 0.15;
      if (this.state.research.crop_rotation) foodMult += 0.15;
      if (this.state.research.iron_smelting) {
        ironMult += 0.15;
        ironOreMult += 0.15;
      }
    }

    if (this.state.hero && (this.state.hero.type === 'archmage' || this.state.hero.type === 'treasurer')) {
      const heroBonus = 0.15 + (this.state.hero.level - 1) * 0.05;
      woodMult += heroBonus;
      stoneMult += heroBonus;
      foodMult += heroBonus;
      ironMult += heroBonus;
      ironOreMult += heroBonus;
    }

    // Apply Hero Equipment accessory production bonus
    const heroEquipProdBonus = this.getHeroItemBonus('production');
    woodMult += heroEquipProdBonus;
    stoneMult += heroEquipProdBonus;
    foodMult += heroEquipProdBonus;
    ironMult += heroEquipProdBonus;
    ironOreMult += heroEquipProdBonus;

    // Apply Hero Economy (eco_prod) skill bonus
    const heroSkillProdBonus = this.getHeroSkillBonus('production');
    woodMult += heroSkillProdBonus;
    stoneMult += heroSkillProdBonus;
    foodMult += heroSkillProdBonus;
    ironMult += heroSkillProdBonus;
    ironOreMult += heroSkillProdBonus;

    // Apply Weather Multipliers
    let weatherWoodMult = 1.0;
    let weatherStoneMult = 1.0;
    let weatherFoodMult = 1.0;
    let weatherIronMult = 1.0;
    
    if (this.state.weather) {
      if (this.state.weather.type === 'rainy') {
        weatherWoodMult = 0.9;
        weatherStoneMult = 0.9;
        weatherFoodMult = 1.2;
      } else if (this.state.weather.type === 'stormy') {
        weatherWoodMult = 0.8;
        weatherStoneMult = 0.8;
        weatherFoodMult = 0.9;
      } else if (this.state.weather.type === 'snowy') {
        weatherWoodMult = 0.8;
        weatherStoneMult = 0.8;
        weatherFoodMult = 0.7;
        weatherIronMult = 0.9;
      }
    }
    
    woodMult *= weatherWoodMult;
    stoneMult *= weatherStoneMult;
    foodMult *= weatherFoodMult;
    ironMult *= weatherIronMult;
    ironOreMult *= weatherIronMult;

    // Apply advanced research production buffs
    if (this.state.researchProgress) {
      if (this.state.researchProgress.eco_plenty?.completed) foodMult += 0.15;
      if (this.state.researchProgress.eco_lumber_jacking?.completed) woodMult += 0.15;
    }

    // Apply Prestige Production Bonus
    const prestigeProdBonus = this.getPrestigeProductionBonus ? this.getPrestigeProductionBonus() : 0;
    const setProdBonus = this.getGearSetBonus ? this.getGearSetBonus('production') : 0;
    woodMult += prestigeProdBonus + setProdBonus;
    stoneMult += prestigeProdBonus + setProdBonus;
    foodMult += prestigeProdBonus + setProdBonus;
    ironMult += prestigeProdBonus + setProdBonus;
    ironOreMult += prestigeProdBonus + setProdBonus;

    // Apply Happiness Production Bonus (+0.5% per 1% happiness above 50, max +25%)
    const happinessBonus = Math.max(0, (this.state.happiness || 50) - 50) * 0.005;
    woodMult += happinessBonus;
    stoneMult += happinessBonus;
    foodMult += happinessBonus;
    ironMult += happinessBonus;

    // Apply luxury goods happiness boost (each type of luxury good owned increases happiness +2)
    let luxuryHappinessBonus = 0;
    if (this.state.luxuryGoods) {
      if (this.state.luxuryGoods.spices > 0) luxuryHappinessBonus += 5;
      if (this.state.luxuryGoods.silk > 0) luxuryHappinessBonus += 5;
      if (this.state.luxuryGoods.gemstones > 0) luxuryHappinessBonus += 5;
    }
    // (This is added in calculateHappiness in population.js automatically)

    // Apply Fortress Defense Buff (passive - reduces raid damage, implemented in raids.js)
    // (no production change here)

    // Apply Seasons Multipliers
    const seasonWoodMult = this.getSeasonMultiplier('wood');
    const seasonStoneMult = this.getSeasonMultiplier('stone');
    const seasonFoodMult = this.getSeasonMultiplier('food');
    const seasonIronOreMult = this.getSeasonMultiplier('iron_ore') || 1.0;

    woodMult *= seasonWoodMult;
    stoneMult *= seasonStoneMult;
    foodMult *= seasonFoodMult;
    ironOreMult *= seasonIronOreMult;

    // ============================================================
    // NEU: Royal Decrees Produktions-Multiplikatoren (decrees.js)
    // ============================================================
    if (window.royalDecreesManager) {
      ironMult *= window.royalDecreesManager.getDecreeBonus('ironMult');
      woodMult *= window.royalDecreesManager.getDecreeBonus('woodMult');
    }

    // ============================================================
    // NEU: Guild-Wonders Boni (guild_wonders.js)
    // gw1 (Sonnenkoloss): +50% Gold-Einnahmen → wird auf goldRate angewendet
    // ============================================================
    let guildWonderGoldMult = 1.0;
    if (window.guildWondersManager) {
      guildWonderGoldMult = window.guildWondersManager.getCompletedBonus('gold_income');
    }

    const isStriking = (this.state.happiness || 50) < 30;
    const multiplier = isStriking ? 0 : (hasFountain ? 1.10 : 1.0);

    this.state.buildings.forEach(b => {
      if (b.underConstruction) return;
      const cfg = BUILDINGS_CONFIG[b.type]?.levels[b.level];
      if (!cfg?.production) return;

      if (cfg.production.wood) woodRate += cfg.production.wood;
      if (cfg.production.stone) stoneRate += cfg.production.stone;
      if (cfg.production.food) foodRate += cfg.production.food;
      if (cfg.production.iron) ironRate += cfg.production.iron;
      if (cfg.production.iron_ore) iron_oreRate += cfg.production.iron_ore;
      if (cfg.production.hide) hideRate += cfg.production.hide;
    });

    // Factor in occupied Outposts production rates
    if (this.state.outposts) {
      Object.keys(this.state.outposts).forEach(opId => {
        const opState = this.state.outposts[opId];
        if (opState.owner === 'player') {
          const totalGarrison = Object.values(opState.garrison || {}).reduce((a, b) => a + b, 0);
          if (totalGarrison >= 1) {
            const opCfg = WORLD_MAP_CONFIG.outposts.find(o => o.id === opId);
            if (opCfg && opCfg.yield) {
              let opYieldVal = 0;
              let opYieldRes = "";
              if (opCfg.yield.wood) { opYieldVal = opCfg.yield.wood; opYieldRes = "wood"; }
              else if (opCfg.yield.stone) { opYieldVal = opCfg.yield.stone; opYieldRes = "stone"; }
              else if (opCfg.yield.iron) { opYieldVal = opCfg.yield.iron; opYieldRes = "iron"; }
              else if (opCfg.yield.gold) { opYieldVal = opCfg.yield.gold; opYieldRes = "gold"; }

              if (opYieldRes) {
                // Apply production booster
                const opMult = this.getOutpostYieldMultiplier(opId);
                const addedAmt = (opYieldVal / 60) * opMult * dt;
                const capacity = this.getOutpostStorageCapacity(opId);
                opState.accumulatedResources = Math.min(capacity, (opState.accumulatedResources || 0) + addedAmt);
              }
            }
          }
        }
      });
    }

    res.wood += (woodRate / 60) * multiplier * woodMult * dt;
    res.stone += (stoneRate / 60) * multiplier * stoneMult * dt;
    res.food += (foodRate / 60) * multiplier * foodMult * dt;
    res.iron_ore = (res.iron_ore || 0) + (iron_oreRate / 60) * multiplier * ironOreMult * dt;
    res.hide = (res.hide || 0) + (hideRate / 60) * multiplier * dt;

    // 1. Smelter processing (iron_ore -> iron)
    this.state.buildings.forEach(b => {
      if (b.underConstruction || b.type !== BUILDING_TYPES.SMELTER) return;
      const cfg = BUILDINGS_CONFIG[b.type]?.levels[b.level];
      if (!cfg?.production?.iron) return;

      const ironToProduceRate = cfg.production.iron;
      const oreRequiredRate = cfg.consumption.iron_ore;

      const neededOre = (oreRequiredRate / 60) * dt;
      const possibleByOre = neededOre > 0 ? (res.iron_ore || 0) / neededOre : Infinity;
      const actualFactor = Math.min(1.0, possibleByOre);

      if (actualFactor > 0) {
        res.iron_ore -= neededOre * actualFactor;
        res.iron = (res.iron || 0) + (ironToProduceRate / 60) * actualFactor * dt;
      }
    });

    // 2. Blacksmith processing (iron + wood -> weapons)
    this.state.buildings.forEach(b => {
      if (b.underConstruction || b.type !== BUILDING_TYPES.BLACKSMITH) return;
      const cfg = BUILDINGS_CONFIG[b.type]?.levels[b.level];
      if (!cfg?.production?.weapons) return;
      
      const weaponsToProduceRate = cfg.production.weapons;
      const ironRequiredRate = cfg.consumption.iron;
      const woodRequiredRate = cfg.consumption.wood;

      const neededIron = (ironRequiredRate / 60) * dt;
      const neededWood = (woodRequiredRate / 60) * dt;
      const possibleByIron = neededIron > 0 ? (res.iron || 0) / neededIron : Infinity;
      const possibleByWood = neededWood > 0 ? res.wood / neededWood : Infinity;
      const actualFactor = Math.min(1.0, Math.min(possibleByIron, possibleByWood));

      if (actualFactor > 0) {
        res.iron -= neededIron * actualFactor;
        res.wood -= neededWood * actualFactor;
        res.weapons += (weaponsToProduceRate / 60) * actualFactor * dt;
      }
    });

    // 3. Mill processing (food -> flour)
    this.state.buildings.forEach(b => {
      if (b.underConstruction || b.type !== BUILDING_TYPES.MILL) return;
      const cfg = BUILDINGS_CONFIG[b.type]?.levels[b.level];
      if (!cfg?.production?.flour) return;

      const flourToProduceRate = cfg.production.flour;
      const foodRequiredRate = cfg.consumption.food;

      const neededFood = (foodRequiredRate / 60) * dt;
      const possibleByFood = neededFood > 0 ? res.food / neededFood : Infinity;
      const actualFactor = Math.min(1.0, possibleByFood);

      if (actualFactor > 0) {
        res.food -= neededFood * actualFactor;
        res.flour = (res.flour || 0) + (flourToProduceRate / 60) * actualFactor * dt;
      }
    });

    // 4. Bakery processing (flour -> bread)
    this.state.buildings.forEach(b => {
      if (b.underConstruction || b.type !== BUILDING_TYPES.BAKERY) return;
      const cfg = BUILDINGS_CONFIG[b.type]?.levels[b.level];
      if (!cfg?.production?.bread) return;

      const breadToProduceRate = cfg.production.bread;
      const flourRequiredRate = cfg.consumption.flour;

      const neededFlour = (flourRequiredRate / 60) * dt;
      const possibleByFlour = neededFlour > 0 ? (res.flour || 0) / neededFlour : Infinity;
      const actualFactor = Math.min(1.0, possibleByFlour);

      if (actualFactor > 0) {
        res.flour -= neededFlour * actualFactor;
        res.bread = (res.bread || 0) + (breadToProduceRate / 60) * actualFactor * dt;
      }
    });

    // 4.5 Brewery processing (food + wood -> beer)
    this.state.buildings.forEach(b => {
      if (b.underConstruction || b.type !== BUILDING_TYPES.BREWERY) return;
      const cfg = BUILDINGS_CONFIG[b.type]?.levels[b.level];
      if (!cfg?.production?.beer) return;

      const beerToProduceRate = cfg.production.beer;
      const foodRequiredRate = cfg.consumption?.food || 0;
      const woodRequiredRate = cfg.consumption?.wood || 0;

      const neededFood = (foodRequiredRate / 60) * dt;
      const neededWood = (woodRequiredRate / 60) * dt;
      const possibleByFood = neededFood > 0 ? res.food / neededFood : Infinity;
      const possibleByWood = neededWood > 0 ? res.wood / neededWood : Infinity;
      const actualFactor = Math.min(1.0, Math.min(possibleByFood, possibleByWood));

      if (actualFactor > 0) {
        res.food -= neededFood * actualFactor;
        res.wood -= neededWood * actualFactor;
        const prestigeMult = 1.0 + (this.getPrestigeBreweryBonus ? this.getPrestigeBreweryBonus() : 0);
        res.beer = (res.beer || 0) + (beerToProduceRate / 60) * actualFactor * dt * prestigeMult;
      }
    });

    // 4.6 Tannery processing (hide + wood -> leather)
    this.state.buildings.forEach(b => {
      if (b.underConstruction || b.type !== BUILDING_TYPES.TANNERY) return;
      const cfg = BUILDINGS_CONFIG[b.type]?.levels[b.level];
      if (!cfg?.production?.leather) return;

      const leatherToProduceRate = cfg.production.leather;
      const hideRequiredRate = cfg.consumption.hide;
      const woodRequiredRate = cfg.consumption.wood;

      const neededHide = (hideRequiredRate / 60) * dt;
      const neededWood = (woodRequiredRate / 60) * dt;
      const possibleByHide = neededHide > 0 ? (res.hide || 0) / neededHide : Infinity;
      const possibleByWood = neededWood > 0 ? res.wood / neededWood : Infinity;
      const actualFactor = Math.min(1.0, Math.min(possibleByHide, possibleByWood));

      if (actualFactor > 0) {
        res.hide -= neededHide * actualFactor;
        res.wood -= neededWood * actualFactor;
        res.leather = (res.leather || 0) + (leatherToProduceRate / 60) * actualFactor * dt;
      }
    });

    // Troop Food & Bread consumption
    let foodCons = 0;
    Object.keys(this.state.troops).forEach(t => {
      const count = this.state.troops[t];
      const consPerMin = TROOPS_CONFIG[t]?.stats.foodConsumption || 0;
      foodCons += (consPerMin / 60) * count;
    });

    let foodNeeded = foodCons * dt;
    if (foodNeeded > 0) {
      // 1 unit of bread satisfies 2 units of normal food consumption
      let breadToConsume = Math.min(res.bread || 0, foodNeeded / 2);
      res.bread = (res.bread || 0) - breadToConsume;
      foodNeeded -= breadToConsume * 2;

      // Consume normal food for the rest
      res.food -= foodNeeded;
    }

    if (res.food < 0) {
      res.food = 0;
      let totalTroopsCount = this.getTotalTroopsCount();
      if (totalTroopsCount > 0) {
        const desertionRate = 0.005;
        let toDesert = Math.ceil(totalTroopsCount * desertionRate * dt);
        this.desertTroops(toDesert);
      }
    }

    // Apply max storage limits to raw resources
    const maxCap = this.getMaxStorage();
    const cappedKeys = ['wood', 'stone', 'food', 'iron', 'iron_ore', 'flour', 'bread', 'beer', 'hide', 'leather', 'weapons'];
    cappedKeys.forEach(k => {
      if (res[k] !== undefined) {
        res[k] = Math.min(maxCap, Math.max(0, res[k]));
      }
    });
  }

  getMaxStorage() {
    if (!this.state || !this.state.buildings) return 2000;
    const keep = this.state.buildings.find(b => b.type === BUILDING_TYPES.KEEP && !b.underConstruction);
    const keepLvl = keep ? keep.level : 1;
    let baseCap = 2000 + keepLvl * 1000;

    const warehouses = this.state.buildings.filter(b => b.type === 'warehouse' && !b.underConstruction);
    warehouses.forEach(w => {
      baseCap += w.level * 2500;
    });

    return baseCap;
  }

  updateConstruction(dt) {
    this.state.buildings.forEach(b => {
      if (!b.underConstruction) return;

      b.constructionTimeRemaining -= dt;
      if (b.constructionTimeRemaining <= 0) {
        b.underConstruction = false;
        b.constructionTimeRemaining = 0;
        
        if (b.type === BUILDING_TYPES.KEEP) {
          const oldAge = this.state.ageIndex;
          this.state.ageIndex = Math.min(AGES.IMPERIAL, Math.max(AGES.DARK, b.level - 1));
          if (this.state.ageIndex !== oldAge && window.gameUI) {
            const ageName = AGES_CONFIG[this.state.ageIndex].name;
            gameUI.addLog(`Dein Königreich hat das neue Zeitalter erreicht: ${ageName}! 🎉`, 'success');
            gameUI.showToast(`Neues Zeitalter: ${ageName}! 🎉`, 'success');
          }
        }
        
        this.notifyListeners('construction_complete');
      }
    });

    // Update Outpost Buildings Construction
    if (this.state.outposts) {
      Object.keys(this.state.outposts).forEach(opId => {
        const opState = this.state.outposts[opId];
        if (opState.buildings) {
          opState.buildings.forEach(b => {
            if (!b.underConstruction) return;

            b.constructionTimeRemaining -= dt;
            if (b.constructionTimeRemaining <= 0) {
              b.underConstruction = false;
              b.constructionTimeRemaining = 0;
              this.notifyListeners('outpost_construction_complete');
            }
          });
        }
      });
    }
  }

  updateRecruitment(dt) {
    if (this.state.recruitmentQueue.length === 0) return;

    let active = this.state.recruitmentQueue[0];
    active.timeRemaining -= dt;

    if (active.timeRemaining <= 0) {
      this.state.troops[active.troopType] = (this.state.troops[active.troopType] || 0) + 1;
      this.trackDailyQuestProgress('troops', 1);
      active.count -= 1;

      if (active.count > 0) {
        const singleTime = TROOPS_CONFIG[active.troopType].time;
        active.timeRemaining = singleTime + active.timeRemaining;
      } else {
        this.state.recruitmentQueue.shift();
      }

      this.notifyListeners('recruitment_complete');
    }
  }

  updateMissions(dt) {
    const now = Date.now();
    const activeMissions = [...this.state.missions];

    activeMissions.forEach((m) => {
      if (m.status === 'traveling') {
        const timeElapsed = (now - m.departureTime) / 1000;
        if (timeElapsed >= m.duration) {
          if (m.type === 'spy') {
            this.resolveSpying(m);
          } else if (m.type === 'counter-attack') {
            this.resolveDefense(m);
          } else if (m.type === 'reinforce') {
            this.resolveReinforcements(m);
          } else {
            this.resolveBattle(m);
          }
        }
      } else if (m.status === 'returning') {
        const timeElapsed = (now - m.departureTime) / 1000;
        if (timeElapsed >= m.duration) {
          this.returnTroopsAndLoot(m);
          this.state.missions = this.state.missions.filter(item => item.id !== m.id);
          this.notifyListeners('mission_returned');
        }
      }
    });
  }

  resolveSpying(mission) {
    const npc = WORLD_MAP_CONFIG.npcCastles.find(c => c.id === mission.targetId);
    if (!npc) return;

    const spiesSent = mission.troopsSent.spy || 0;
    const successChance = Math.min(0.95, Math.max(0.1, 0.55 + (spiesSent * 0.12) - (npc.level * 0.08)));
    const success = Math.random() < successChance;

    let reportText = "";
    let victory = false;

    if (success) {
      victory = true;
      this.state.spyReports[npc.id] = {
        defenders: { ...npc.defenders },
        timestamp: Date.now()
      };
      if (!this.state.scoutedSites) this.state.scoutedSites = {};
      this.state.scoutedSites[npc.id] = true;

      reportText = `Erfolg! Deine Spione haben unentdeckt die Verteidigung von ${npc.name} ausgekundschaftet.`;
      this.state.statistics.npcSpied = (this.state.statistics.npcSpied || 0) + 1;

      // Spies travel back home safely
      mission.status = 'returning';
      mission.departureTime = Date.now();
    } else {
      reportText = `Fehlschlag! Deine Spione wurden auf ${npc.name} gefangen genommen und hingerichtet.`;
      
      const counterAttackTriggered = Math.random() < 0.35;
      if (counterAttackTriggered) {
        this.dispatchCounterAttack(npc);
        reportText += ` Die Raubritter sind wütend und haben Truppen ausgesandt, um deine Burg anzugreifen!`;
      }

      // Spies are lost, mission ends immediately
      this.state.missions = this.state.missions.filter(item => item.id !== mission.id);
    }

    mission.battleReport = {
      victory: victory,
      isSpyReport: true,
      title: victory ? 'Spionage erfolgreich' : 'Spione gefangen',
      text: reportText,
      targetName: npc.name,
      targetLevel: npc.level,
      casualties: { spy: success ? 0 : spiesSent },
      loot: { gold: 0, wood: 0, stone: 0, rubies: 0 },
      time: Date.now()
    };

    if (!this.state.battleReports) this.state.battleReports = [];
    this.state.battleReports.unshift(mission.battleReport);
    this.state.latestUnreadReport = mission.battleReport;

    this.save();
    if (success) {
      this.notifyListeners('spy_resolved');
    } else {
      this.notifyListeners('mission_returned');
    }
  }

  resolveBattle(mission) {
    const isOutpost = mission.targetType === 'outpost';
    const target = isOutpost 
      ? WORLD_MAP_CONFIG.outposts.find(o => o.id === mission.targetId)
      : WORLD_MAP_CONFIG.npcCastles.find(c => c.id === mission.targetId);
    if (!target) return;

    let attackerMelee = 0;
    let attackerRanged = 0;
    let attackerHealth = 0;
    let attackerLootCapacity = 0;

    Object.keys(mission.troopsSent).forEach(t => {
      const qty = mission.troopsSent[t];
      const cfg = TROOPS_CONFIG[t].stats;
      
      let attBonus = 1.0;
      if (this.state.research && this.state.research.sharp_blades) {
        attBonus += 0.10;
      }
      if (this.state.hero && (this.state.hero.type === 'ranger' || this.state.hero.type === 'warlord')) {
        attBonus += 0.20 + (this.state.hero.level - 1) * 0.05;
      }
      // Apply Hero Offense skill bonus (off_attack)
      const heroOffenseBonus = this.getHeroSkillBonus('attack');
      attBonus += heroOffenseBonus;

      attackerMelee += cfg.attackMelee * qty * attBonus;
      attackerRanged += cfg.attackRanged * qty * attBonus;
      attackerHealth += 100 * qty;
      attackerLootCapacity += cfg.lootCapacity * qty;
    });

    let defenderMeleeDefense = 0;
    let defenderRangedDefense = 0;
    let defenderHealth = 0;

    const defendersSource = isOutpost 
      ? (this.state.outposts[target.id].owner === 'player' ? this.state.outposts[target.id].garrison : target.defenders)
      : target.defenders;

    Object.keys(defendersSource).forEach(t => {
      const qty = defendersSource[t] || 0;
      const cfg = TROOPS_CONFIG[t]?.stats || { defenseMelee: 10, defenseRanged: 10 };
      defenderMeleeDefense += cfg.defenseMelee * qty;
      defenderRangedDefense += cfg.defenseRanged * qty;
      defenderHealth += 100 * qty;
    });

    // Calculate total wallKonter from player's sent troops
    let totalWallKonter = 0;
    Object.keys(mission.troopsSent).forEach(t => {
      const qty = mission.troopsSent[t] || 0;
      const cfg = TROOPS_CONFIG[t]?.stats;
      if (cfg && cfg.wallKonter) {
        totalWallKonter += cfg.wallKonter * qty;
      }
    });

    // Calculate target base wall defense bonus based on level
    let wallBonus = 0;
    if (!isOutpost) {
      wallBonus = (target.level - 1) * 0.15;
    } else if (this.state.outposts[target.id].owner !== 'player') {
      wallBonus = (target.level - 1) * 0.10;
    }

    const activeWallBonus = Math.max(0, wallBonus - totalWallKonter);

    const totalAttack = attackerMelee + attackerRanged;
    let totalDefense = defenderMeleeDefense + defenderRangedDefense;
    totalDefense *= (1 + activeWallBonus);

    let isAttackerVictory = totalAttack > totalDefense;
    let attackerCasualties = { spearman: 0, swordsman: 0, bowman: 0, knight: 0, ram: 0, catapult: 0 };
    let reportText = "";

    if (isAttackerVictory) {
      const lossRatio = Math.min(0.8, totalDefense / (totalAttack * 1.5));
      let healthLost = attackerHealth * lossRatio;
      let soldiersKilled = Math.floor(healthLost / 100);

      let totalSent = Object.values(mission.troopsSent).reduce((a, b) => a + b, 0);
      if (totalSent > 0) {
        Object.keys(mission.troopsSent).forEach(t => {
          let count = mission.troopsSent[t];
          if (count > 0) {
            let portion = count / totalSent;
            let killed = Math.min(count, Math.round(soldiersKilled * portion));
            attackerCasualties[t] = killed;
            mission.troopsSent[t] -= killed;
          }
        });
      }

      if (isOutpost) {
        this.state.outposts[target.id].owner = 'player';
        // Garrison the surviving troops at the outpost
        this.state.outposts[target.id].garrison = {
          spearman: mission.troopsSent.spearman || 0,
          swordsman: mission.troopsSent.swordsman || 0,
          bowman: mission.troopsSent.bowman || 0,
          knight: mission.troopsSent.knight || 0,
          ram: mission.troopsSent.ram || 0,
          catapult: mission.troopsSent.catapult || 0
        };
        // Clear troops from returning mission
        Object.keys(mission.troopsSent).forEach(t => {
          mission.troopsSent[t] = 0;
        });
        mission.loot = { gold: 0, wood: 0, stone: 0, rubies: 0 };
        reportText = `Sieg! Deine Truppen haben den Außenposten ${target.name} eingenommen und eine Garnison von ${Object.values(this.state.outposts[target.id].garrison).reduce((a,b)=>a+b, 0)} Soldaten errichtet.`;
      } else {
        let lootFactor = 1.0;
        let totalLootRequired = target.loot.gold + target.loot.wood + target.loot.stone;
        if (attackerLootCapacity < totalLootRequired) {
          lootFactor = attackerLootCapacity / totalLootRequired;
        }

        mission.loot = {
          gold: Math.round(target.loot.gold * lootFactor),
          wood: Math.round(target.loot.wood * lootFactor),
          stone: Math.round(target.loot.stone * lootFactor),
          rubies: target.loot.rubies
        };

        reportText = `Sieg! Deine Truppen haben ${target.name} überrannt.`;
        this.state.statistics.npcDefeated += 1;
        this.state.statistics.maxNpcLevelDefeated = Math.max(this.state.statistics.maxNpcLevelDefeated, target.level);
      }
    } else {
      Object.keys(mission.troopsSent).forEach(t => {
        attackerCasualties[t] = mission.troopsSent[t];
        mission.troopsSent[t] = 0;
      });

      mission.loot = { gold: 0, wood: 0, stone: 0, rubies: 0 };
      reportText = `Niederlage! Deine Truppen wurden von den Verteidigern auf ${target.name} vernichtet.`;
    }

    mission.status = 'returning';
    mission.departureTime = Date.now();
    
    // Remove spy report on attack
    delete this.state.spyReports[target.id];
    
    mission.battleReport = {
      victory: isAttackerVictory,
      title: isAttackerVictory ? 'Schlacht gewonnen' : 'Schlacht verloren',
      text: reportText,
      targetName: target.name,
      targetLevel: target.level,
      troopsSent: { ...mission.troopsSent, ...attackerCasualties },
      casualties: attackerCasualties,
      loot: mission.loot,
      time: Date.now()
    };

    this.state.latestBattleResolved = mission.battleReport;
    this.notifyListeners('battle_resolved');
  }

  returnTroopsAndLoot(mission) {
    const res = this.state.resources;
    Object.keys(mission.troopsSent).forEach(t => {
      this.state.troops[t] = (this.state.troops[t] || 0) + mission.troopsSent[t];
    });

    res.gold += mission.loot.gold;
    res.wood += mission.loot.wood;
    res.stone += mission.loot.stone;
    res.rubies += mission.loot.rubies;
    this.state.statistics.totalGoldCollected += mission.loot.gold;

    if (!this.state.battleReports) {
      this.state.battleReports = [];
    }
    this.state.battleReports.unshift(mission.battleReport);
    if (this.state.battleReports.length > 15) {
      this.state.battleReports.pop();
    }
    this.state.latestUnreadReport = mission.battleReport;
  }

  updateTaxes(dt) {
    const tax = this.state.taxState;
    if (!tax.optionId || tax.canCollect) return;

    tax.timeRemaining -= dt;
    if (tax.timeRemaining <= 0) {
      tax.timeRemaining = 0;
      tax.canCollect = true;
      this.notifyListeners('tax_ready');
    }
  }

  checkQuests() {
    if (!this.state.activeQuestId) return;

    const quest = QUESTS_CONFIG.find(q => q.id === this.state.activeQuestId);
    if (!quest) return;

    if (quest.condition(this.state)) {
      const res = this.state.resources;
      const rewards = quest.reward;

      if (rewards.gold) res.gold += rewards.gold;
      if (rewards.wood) res.wood += rewards.wood;
      if (rewards.stone) res.stone += rewards.stone;
      if (rewards.food) res.food += rewards.food;
      if (rewards.rubies) res.rubies += rewards.rubies;

      this.state.completedQuests.push(quest.id);

      const currentIdx = QUESTS_CONFIG.findIndex(q => q.id === quest.id);
      if (currentIdx !== -1 && currentIdx < QUESTS_CONFIG.length - 1) {
        this.state.activeQuestId = QUESTS_CONFIG[currentIdx + 1].id;
      } else {
        this.state.activeQuestId = null;
      }

      this.state.latestQuestRewardClaimed = {
        title: quest.title,
        reward: rewards
      };
      this.notifyListeners('quest_complete');
    }
  }

  getBuildingLimit(type) {
    const uniques = [
      BUILDING_TYPES.KEEP,
      BUILDING_TYPES.BLACKSMITH,
      BUILDING_TYPES.BARRACKS,
      BUILDING_TYPES.STABLES,
      BUILDING_TYPES.MILL,
      BUILDING_TYPES.WOODCUTTER,
      BUILDING_TYPES.BAKERY,
      BUILDING_TYPES.SMELTER,
      BUILDING_TYPES.TOWNHALL,
      BUILDING_TYPES.FORTRESS,
      BUILDING_TYPES.SIEGE_WORKSHOP
    ];

    if (uniques.includes(type)) {
      return 1;
    }

    if (type === BUILDING_TYPES.WALL) {
      return 40;
    }
    if ([BUILDING_TYPES.FOUNTAIN, BUILDING_TYPES.STATUE, BUILDING_TYPES.GARDEN, BUILDING_TYPES.BANNER].includes(type)) {
      return 5;
    }

    return 2;
  }

  getBuildingCount(type) {
    if (!this.state.buildings) return 0;
    return this.state.buildings.filter(b => b.type === type).length;
  }

  demolishBuilding(id) {
    const b = this.state.buildings.find(item => item.id === id);
    if (!b || b.type === BUILDING_TYPES.KEEP) return false;

    this.state.buildings = this.state.buildings.filter(item => item.id !== id);
    this.save();
    this.notifyListeners('building_demolished');
    return true;
  }

  buildBuilding(type, x, y) {
    const config = BUILDINGS_CONFIG[type];
    if (!config) return false;

    // Check Age requirement
    const requiredAge = BUILDING_AGE_REQUIREMENTS[type] || AGES.DARK;
    if (this.state.ageIndex < requiredAge) {
      const ageName = AGES_CONFIG[requiredAge].name;
      if (window.gameUI) gameUI.showToast(`Gesperrt: Dieses Gebäude erfordert das Zeitalter ${ageName}!`, 'error');
      return false;
    }

    const limit = this.getBuildingLimit(type);
    const count = this.getBuildingCount(type);
    if (count >= limit) {
      if (window.gameUI) gameUI.showToast(`Baugrenze erreicht! Du kannst maximal ${limit} von diesem Gebäudetyp errichten.`, 'error');
      return false;
    }

    const levelCfg = config.levels[1];
    if (!levelCfg) return false;

    if (!this.hasResources(levelCfg.cost)) return false;

    this.deductResources(levelCfg.cost);

    let buildTimeMult = 1.0;
    const heroBuildTimeBonus = this.getHeroSkillBonus('build_time');
    buildTimeMult += heroBuildTimeBonus;
    if (this.hasControlPointBonus && this.hasControlPointBonus('build_speed')) {
      buildTimeMult -= 0.15;
    }
    if (this.getGearSetBonus && this.getGearSetBonus('build_speed')) {
      buildTimeMult -= this.getGearSetBonus('build_speed');
    }
    buildTimeMult = Math.max(0.1, buildTimeMult);
    const buildTime = Math.round(levelCfg.time * buildTimeMult);

    const newId = `${type}_${Date.now()}`;
    const newBuilding = {
      id: newId,
      type: type,
      x: x,
      y: y,
      level: 1,
      underConstruction: buildTime > 0,
      constructionTimeRemaining: buildTime,
      constructionTimeTotal: buildTime
    };

    this.state.buildings.push(newBuilding);
    this.save();
    this.notifyListeners('build_started');
    return true;
  }

  upgradeBuilding(id) {
    const b = this.state.buildings.find(item => item.id === id);
    if (!b || b.underConstruction) return false;

    const nextLevel = b.level + 1;
    const config = BUILDINGS_CONFIG[b.type];
    const levelCfg = config?.levels[nextLevel];

    if (!levelCfg) return false;

    if (b.type !== BUILDING_TYPES.KEEP) {
      const keep = this.state.buildings.find(item => item.type === BUILDING_TYPES.KEEP);
      if (keep && nextLevel > keep.level) {
        if (window.gameUI) gameUI.showToast(`Ausbau verweigert: Du musst zuerst deinen Burgfried auf Stufe ${nextLevel} bringen!`, 'warning');
        return false;
      }
    }

    if (!this.hasResources(levelCfg.cost)) return false;

    this.deductResources(levelCfg.cost);

    let buildTimeMult = 1.0;
    const heroBuildTimeBonus = this.getHeroSkillBonus('build_time');
    buildTimeMult += heroBuildTimeBonus;
    if (this.hasControlPointBonus && this.hasControlPointBonus('build_speed')) {
      buildTimeMult -= 0.15;
    }
    if (this.getGearSetBonus && this.getGearSetBonus('build_speed')) {
      buildTimeMult -= this.getGearSetBonus('build_speed');
    }
    buildTimeMult = Math.max(0.1, buildTimeMult);
    const buildTime = Math.round(levelCfg.time * buildTimeMult);

    b.level = nextLevel;
    b.underConstruction = buildTime > 0;
    b.constructionTimeRemaining = buildTime;
    b.constructionTimeTotal = buildTime;

    this.save();
    this.notifyListeners('upgrade_started');
    return true;
  }

  speedUpBuilding(id) {
    const b = this.state.buildings.find(item => item.id === id);
    if (!b || !b.underConstruction) return false;

    const rubyCost = Math.max(1, Math.ceil(b.constructionTimeRemaining / 10));

    if (this.state.resources.rubies < rubyCost) {
      if (window.gameUI) gameUI.showToast('Zu wenig Rubine!', 'error');
      return false;
    }

    this.state.resources.rubies -= rubyCost;
    this.state.statistics.rubiesSpent += rubyCost;
    b.underConstruction = false;
    b.constructionTimeRemaining = 0;

    if (b.type === BUILDING_TYPES.KEEP) {
      const oldAge = this.state.ageIndex;
      this.state.ageIndex = Math.min(AGES.IMPERIAL, Math.max(AGES.DARK, b.level - 1));
      if (this.state.ageIndex !== oldAge && window.gameUI) {
        const ageName = AGES_CONFIG[this.state.ageIndex].name;
        gameUI.addLog(`Dein Königreich hat das neue Zeitalter erreicht: ${ageName}! 🎉`, 'success');
        gameUI.showToast(`Neues Zeitalter: ${ageName}! 🎉`, 'success');
      }
    }

    this.save();
    this.notifyListeners('speedup');
    return true;
  }

  recruitTroops(type, count) {
    if (count <= 0) return false;

    const cfg = TROOPS_CONFIG[type];
    if (!cfg) return false;

    const totalCost = {};
    Object.keys(cfg.cost).forEach(key => {
      totalCost[key] = (cfg.cost[key] || 0) * count;
    });

    if (!this.hasResources(totalCost)) {
      if (window.gameUI) gameUI.showToast('Zu wenig Rohstoffe zum Rekrutieren!', 'error');
      return false;
    }

    // Branch by recruitment type
    if (type === 'spy') {
      const tavern = this.state.buildings.find(b => b.type === BUILDING_TYPES.TAVERN && !b.underConstruction);
      if (!tavern) {
        if (window.gameUI) gameUI.showToast('Du benötigst eine Taverne, um Spione anzuwerben!', 'warning');
        return false;
      }
      const maxSpies = BUILDINGS_CONFIG[BUILDING_TYPES.TAVERN].levels[tavern.level].maxSpies;
      const currentSpies = this.state.troops.spy || 0;
      const trainingSpies = this.state.recruitmentQueue.filter(q => q.troopType === 'spy').reduce((acc, q) => acc + q.count, 0);

      if (currentSpies + trainingSpies + count > maxSpies) {
        if (window.gameUI) gameUI.showToast(`Tavernen-Kapazitätsgrenze erreicht! Maximal ${maxSpies} Spione möglich.`, 'warning');
        return false;
      }
    } else if (type === 'knight') {
      const stables = this.state.buildings.find(b => b.type === BUILDING_TYPES.STABLES && !b.underConstruction);
      if (!stables) {
        if (window.gameUI) gameUI.showToast('Du benötigst Stallungen, um Ritter auszubilden!', 'warning');
        return false;
      }
      const unlocked = BUILDINGS_CONFIG[BUILDING_TYPES.STABLES].levels[stables.level]?.unlocks || [];
      if (!unlocked.includes(type)) {
        if (window.gameUI) gameUI.showToast('Ritter noch gesperrt! Upgradte deine Stallungen.', 'warning');
        return false;
      }
    } else {
      const barracks = this.state.buildings.find(b => b.type === BUILDING_TYPES.BARRACKS && !b.underConstruction);
      if (!barracks) {
        if (window.gameUI) gameUI.showToast('Du benötigst eine Kaserne!', 'warning');
        return false;
      }
      const unlocked = BUILDINGS_CONFIG[BUILDING_TYPES.BARRACKS].levels[barracks.level]?.unlocks || [];
      if (!unlocked.includes(type)) {
        if (window.gameUI) gameUI.showToast('Truppentyp gesperrt! Upgrade die Kaserne.', 'warning');
        return false;
      }
    }

    this.deductResources(totalCost);

    const singleTime = cfg.time;
    for (let i = 0; i < count; i++) {
      this.state.recruitmentQueue.push({
        troopType: type,
        count: 1,
        timeRemaining: singleTime,
        timeTotal: singleTime
      });
    }

    this.save();
    this.notifyListeners('recruitment_started');
    return true;
  }

  researchTechnology(techId) {
    const cfg = RESEARCH_CONFIG[techId];
    if (!cfg) return false;

    const library = this.state.buildings.some(b => b.type === BUILDING_TYPES.LIBRARY && !b.underConstruction);
    if (!library) {
      if (window.gameUI) gameUI.showToast('Du benötigst erst eine Bibliothek!', 'warning');
      return false;
    }

    if (cfg.requires && !this.state.research[cfg.requires]) {
      if (window.gameUI) gameUI.showToast(`Voraussetzung: Erforsche zuerst "${RESEARCH_CONFIG[cfg.requires].name}"!`, 'warning');
      return false;
    }

    if (this.state.research[techId]) {
      if (window.gameUI) gameUI.showToast('Diese Technologie ist bereits erforscht!', 'info');
      return false;
    }

    if (!this.hasResources(cfg.cost)) {
      if (window.gameUI) gameUI.showToast('Zu wenig Ressourcen für diese Forschung!', 'error');
      return false;
    }

    this.deductResources(cfg.cost);
    this.state.research[techId] = true;
    this.save();
    this.notifyListeners('research_complete');
    return true;
  }

  dispatchAttack(targetId, troopsSent, targetType = 'npc', alliedAid = false) {
    const target = targetType === 'outpost'
      ? WORLD_MAP_CONFIG.outposts.find(o => o.id === targetId)
      : WORLD_MAP_CONFIG.npcCastles.find(c => c.id === targetId);
    if (!target) return false;

    if (alliedAid) {
      this.state.statistics.coopAttacksLaunched = (this.state.statistics.coopAttacksLaunched || 0) + 1;
      
      if (alliedAid === 'kingdom_north') {
        const cost = { gold: 200, iron: 100 };
        if (!this.hasResources(cost)) {
          if (window.gameUI) gameUI.showToast('Nicht genügend Rohstoffe für Hilfe von Nordmark (200 Gold + 100 Eisen benötigt)!', 'error');
          return false;
        }
        this.deductResources(cost);
        troopsSent.knight = (troopsSent.knight || 0) + 6;
      } else if (alliedAid === 'republic_south') {
        const cost = { gold: 150, food: 150 };
        if (!this.hasResources(cost)) {
          if (window.gameUI) gameUI.showToast('Nicht genügend Rohstoffe für Hilfe von Südgold (150 Gold + 150 Nahrung benötigt)!', 'error');
          return false;
        }
        this.deductResources(cost);
        troopsSent.spearman = (troopsSent.spearman || 0) + 15;
      } else if (alliedAid === 'empire_east') {
        const cost = { gold: 150, stone: 100 };
        if (!this.hasResources(cost)) {
          if (window.gameUI) gameUI.showToast('Nicht genügend Rohstoffe für Hilfe vom Ostkaiserreich (150 Gold + 100 Stein benötigt)!', 'error');
          return false;
        }
        this.deductResources(cost);
        troopsSent.swordsman = (troopsSent.swordsman || 0) + 10;
      } else if (alliedAid === true) {
        // Legacy fallback
        if (this.state.resources.gold < 250) {
          if (window.gameUI) gameUI.showToast('Nicht genügend Gold für Alliierten-Unterstützung (250 Gold benötigt)!', 'error');
          return false;
        }
        this.state.resources.gold -= 250;
        troopsSent.spearman = (troopsSent.spearman || 0) + 10;
      }
    }

    // Fog of War Check
    const isPlayerOwnedOutpost = targetType === 'outpost' && this.state.outposts?.[targetId]?.owner === 'player';
    const isScouted = this.state.scoutedSites?.[targetId] || target.level === 1 || isPlayerOwnedOutpost;
    if (!isScouted) {
      if (window.gameUI) gameUI.showToast('Dieses Ziel ist von Nebel des Krieges verdeckt! Sende zuerst Spione aus.', 'warning');
      return false;
    }

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

    if (totalSent === 0) {
      if (window.gameUI) gameUI.showToast('Wähle mindestens einen Soldaten zum Schicken!', 'warning');
      return false;
    }

    for (const t of Object.keys(validTroops)) {
      this.state.troops[t] -= validTroops[t];
    }

    let speedMult = 1.0;
    if (this.state.research && this.state.research.logistics) {
      speedMult -= 0.20;
    }
    const heroSpeedBonus = this.getHeroSkillBonus('march_time');
    speedMult += heroSpeedBonus;
    if (this.hasControlPointBonus && this.hasControlPointBonus('movement_speed')) {
      speedMult -= 0.15;
    }
    if (this.state.hero && (this.state.hero.type === 'ranger' || this.state.hero.type === 'warlord')) {
      speedMult -= 0.25;
    }
    if (this.getCurrentSeason && this.getCurrentSeason()) {
      const seasonSpeed = this.getCurrentSeason().speedMult || 1.0;
      speedMult /= seasonSpeed;
    }
    if (this.state.weather) {
      if (this.state.weather.type === 'stormy') {
        speedMult += 0.25;
      } else if (this.state.weather.type === 'snowy') {
        speedMult += 0.50;
      }
    }
    speedMult = Math.max(0.2, speedMult);
    const duration = Math.max(5, Math.round(target.travelTime * speedMult));

    const missionId = `mission_${Date.now()}`;
    const newMission = {
      id: missionId,
      targetId: targetId,
      targetType: targetType,
      status: 'traveling',
      departureTime: Date.now(),
      duration: duration,
      troopsSent: validTroops,
      loot: { gold: 0, wood: 0, stone: 0, rubies: 0 },
      battleReport: null
    };

    this.state.missions.push(newMission);
    this.save();
    this.notifyListeners('attack_dispatched');
    return true;
  }

  dispatchSpy(targetId, count) {
    if (count <= 0) return false;
    
    const npc = WORLD_MAP_CONFIG.npcCastles.find(c => c.id === targetId);
    if (!npc) return false;

    if ((this.state.troops.spy || 0) < count) {
      if (window.gameUI) gameUI.showToast('Nicht genügend Spione vorhanden!', 'error');
      return false;
    }

    this.state.troops.spy -= count;

    let spySpeedMult = 0.5;
    if (this.state.research && this.state.research.logistics) {
      spySpeedMult *= 0.8;
    }
    const heroSpeedBonus = this.getHeroSkillBonus('march_time');
    spySpeedMult *= (1 + heroSpeedBonus);
    if (this.state.hero && (this.state.hero.type === 'ranger' || this.state.hero.type === 'warlord')) {
      spySpeedMult *= 0.75;
    }
    if (this.getCurrentSeason && this.getCurrentSeason()) {
      const seasonSpeed = this.getCurrentSeason().speedMult || 1.0;
      spySpeedMult /= seasonSpeed;
    }
    if (this.state.weather) {
      if (this.state.weather.type === 'stormy') {
        spySpeedMult *= 1.25;
      } else if (this.state.weather.type === 'snowy') {
        spySpeedMult *= 1.50;
      }
    }
    spySpeedMult = Math.max(0.1, spySpeedMult);
    const spyDuration = Math.max(5, Math.round(npc.travelTime * spySpeedMult));

    const missionId = `spy_${Date.now()}`;
    const newMission = {
      id: missionId,
      type: 'spy',
      targetId: targetId,
      status: 'traveling',
      departureTime: Date.now(),
      duration: spyDuration,
      troopsSent: { spy: count },
      loot: { gold: 0, wood: 0, stone: 0, rubies: 0 },
      battleReport: null
    };

    this.state.missions.push(newMission);
    this.trackDailyQuestProgress('spy', count);
    this.save();
    this.notifyListeners('spy_dispatched');
    return true;
  }

  hasControlPointBonus(bonusId) {
    if (!this.state.outposts) return false;
    const cpConfig = WORLD_MAP_CONFIG.outposts.find(op => op.isControlPoint && op.bonus === bonusId);
    if (!cpConfig) return false;
    const opState = this.state.outposts[cpConfig.id];
    return opState && opState.owner === 'player';
  }

  startTaxCollection(optionId) {
    const opt = TAX_OPTIONS.find(o => o.id === optionId);
    if (!opt) return false;

    const taxHouse = this.state.buildings.some(b => b.type === BUILDING_TYPES.TAX_HOUSE && !b.underConstruction);
    if (!taxHouse) {
      if (window.gameUI) gameUI.showToast('Du benötigst erst ein Steuerhaus!', 'warning');
      return false;
    }

    this.state.taxState = {
      optionId: optionId,
      timeRemaining: opt.duration,
      timeTotal: opt.duration,
      canCollect: false
    };

    this.save();
    this.notifyListeners('taxes_started');
    return true;
  }

  collectTaxes() {
    const tax = this.state.taxState;
    if (!tax.canCollect || !tax.optionId) return false;

    const opt = TAX_OPTIONS.find(o => o.id === tax.optionId);
    if (!opt) return false;

    let taxYield = opt.yield;
    if (this.hasControlPointBonus && this.hasControlPointBonus('tax_gold')) {
      taxYield = Math.round(taxYield * 1.15);
    }

    // Scale tax yield based on Houses (Wohnhäuser)
    const houses = this.state.buildings.filter(b => b.type === BUILDING_TYPES.HOUSE && !b.underConstruction);
    const houseCount = houses.length;
    const houseLevelSum = houses.reduce((sum, h) => sum + h.level, 0);
    const houseMultiplier = 1.0 + (houseCount * 0.15) + (houseLevelSum * 0.10);
    taxYield = Math.round(taxYield * houseMultiplier);

    // Scale by tax rate
    let taxRateMult = 1.0;
    if (this.state.taxRate === 'low') taxRateMult = 0.7;
    else if (this.state.taxRate === 'high') taxRateMult = 1.5;
    taxYield = Math.round(taxYield * taxRateMult);

    this.state.resources.gold += taxYield;
    this.state.statistics.totalGoldCollected += taxYield;

    this.state.taxState = {
      optionId: null,
      timeRemaining: 0,
      timeTotal: 0,
      canCollect: false
    };

    this.save();
    this.notifyListeners('taxes_collected');
    return true;
  }

  instantCollectTaxes() {
    const tax = this.state.taxState;
    if (!tax.optionId || tax.canCollect) return false;

    const opt = TAX_OPTIONS.find(o => o.id === tax.optionId);
    if (!opt) return false;

    if (this.state.resources.rubies < opt.rubyCost) {
      if (window.gameUI) gameUI.showToast('Nicht genügend Rubine!', 'error');
      return false;
    }

    this.state.resources.rubies -= opt.rubyCost;
    this.state.statistics.rubiesSpent += opt.rubyCost;

    let taxYield = opt.yield;
    if (this.hasControlPointBonus && this.hasControlPointBonus('tax_gold')) {
      taxYield = Math.round(taxYield * 1.15);
    }

    // Scale tax yield based on Houses (Wohnhäuser)
    const houses = this.state.buildings.filter(b => b.type === BUILDING_TYPES.HOUSE && !b.underConstruction);
    const houseCount = houses.length;
    const houseLevelSum = houses.reduce((sum, h) => sum + h.level, 0);
    const houseMultiplier = 1.0 + (houseCount * 0.15) + (houseLevelSum * 0.10);
    taxYield = Math.round(taxYield * houseMultiplier);

    // Scale by tax rate
    let taxRateMult = 1.0;
    if (this.state.taxRate === 'low') taxRateMult = 0.7;
    else if (this.state.taxRate === 'high') taxRateMult = 1.5;
    taxYield = Math.round(taxYield * taxRateMult);

    this.state.resources.gold += taxYield;
    this.state.statistics.totalGoldCollected += taxYield;

    this.state.taxState = {
      optionId: null,
      timeRemaining: 0,
      timeTotal: 0,
      canCollect: false
    };

    this.save();
    this.notifyListeners('taxes_collected');
    return true;
  }

  setTaxRate(rate) {
    if (['low', 'normal', 'high'].includes(rate)) {
      this.state.taxRate = rate;
      this.save();
      this.notifyListeners('tax_rate_changed');
      return true;
    }
    return false;
  }

  hasResources(cost) {
    if (!cost) return true;
    const res = this.state.resources;
    for (const key of Object.keys(cost)) {
      if ((res[key] || 0) < cost[key]) return false;
    }
    return true;
  }

  deductResources(cost) {
    if (!cost) return;
    const res = this.state.resources;
    for (const key of Object.keys(cost)) {
      res[key] -= cost[key];
    }
  }

  getTotalTroopsCount() {
    return Object.values(this.state.troops).reduce((a, b) => a + b, 0);
  }

  desertTroops(count) {
    let deserted = 0;
    while (deserted < count) {
      const types = Object.keys(this.state.troops).filter(t => this.state.troops[t] > 0);
      if (types.length === 0) break;

      const randomType = types[Math.floor(Math.random() * types.length)];
      this.state.troops[randomType] -= 1;
      deserted++;
    }

    if (deserted > 0) {
      if (window.gameUI) gameUI.showToast(`☠️ Hungersnot! ${deserted} Soldaten sind desertiert!`, 'error');
      this.notifyListeners('desertion');
    }
  }

  getOutpostStorageCapacity(opId) {
    const opState = this.state.outposts?.[opId];
    if (!opState) return 500;
    let capacity = 500;
    if (opState.buildings) {
      opState.buildings.forEach(b => {
        if (b.type === OUTPOST_BUILDING_TYPES.DEPOT && !b.underConstruction) {
          capacity += OUTPOST_BUILDINGS_CONFIG[OUTPOST_BUILDING_TYPES.DEPOT].levels[b.level]?.capacity || 0;
        }
      });
    }
    return capacity;
  }

  getOutpostYieldMultiplier(opId) {
    const opState = this.state.outposts?.[opId];
    if (!opState) return 1.0;
    let mult = 1.0;
    if (opState.buildings) {
      opState.buildings.forEach(b => {
        if (b.type === OUTPOST_BUILDING_TYPES.BOOSTER && !b.underConstruction) {
          mult += OUTPOST_BUILDINGS_CONFIG[OUTPOST_BUILDING_TYPES.BOOSTER].levels[b.level]?.yieldMultiplier || 0;
        }
      });
    }
    return mult;
  }

  getOutpostGarrisonCap(opId) {
    const opState = this.state.outposts?.[opId];
    if (!opState) return 10;
    let cap = 10;
    if (opState.buildings) {
      opState.buildings.forEach(b => {
        if (b.type === OUTPOST_BUILDING_TYPES.BARRACKS && !b.underConstruction) {
          cap += OUTPOST_BUILDINGS_CONFIG[OUTPOST_BUILDING_TYPES.BARRACKS].levels[b.level]?.garrisonMax || 0;
        }
      });
    }
    return cap;
  }

  checkDiplomaticTradeOffers(dt) {
    if (!this.state.nextTradeOfferTime) {
      this.state.nextTradeOfferTime = Date.now() + 180000;
    }

    if (this.state.activeTradeOffer) {
      this.state.activeTradeOffer.timeRemaining -= dt;
      if (this.state.activeTradeOffer.timeRemaining <= 0) {
        this.state.activeTradeOffer = null;
        this.save();
        this.notifyListeners('trade_offer_expired');
      }
    } else if (Date.now() >= this.state.nextTradeOfferTime) {
      this.state.nextTradeOfferTime = Date.now() + (180000 + Math.random() * 120000); // 3-5 mins

      const nations = [
        { name: 'Königreich Nordmark', id: 'kingdom_north' },
        { name: 'Republik Südgold', id: 'republic_south' },
        { name: 'Ostkaiserreich', id: 'empire_east' }
      ];
      const nation = nations[Math.floor(Math.random() * nations.length)];

      const demands = [
        { resource: 'wood', amount: 200 + Math.floor(Math.random() * 300) },
        { resource: 'stone', amount: 150 + Math.floor(Math.random() * 200) },
        { resource: 'food', amount: 250 + Math.floor(Math.random() * 250) },
        { resource: 'iron', amount: 40 + Math.floor(Math.random() * 60) }
      ];
      const demand = demands[Math.floor(Math.random() * demands.length)];

      const rewards = [
        { resource: 'gold', amount: 150 + Math.floor(Math.random() * 250) },
        { resource: 'rubies', amount: 8 + Math.floor(Math.random() * 12) },
        { resource: 'leather', amount: 5 + Math.floor(Math.random() * 10) }
      ];
      const reward = rewards[Math.floor(Math.random() * rewards.length)];

      this.state.activeTradeOffer = {
        nationName: nation.name,
        nationId: nation.id,
        demandResource: demand.resource,
        demandAmount: demand.amount,
        rewardResource: reward.resource,
        rewardAmount: reward.amount,
        timeRemaining: 120 // 2 minutes
      };

      this.save();
      this.notifyListeners('trade_offer_received');
    }
  }

  acceptTradeOffer() {
    if (!this.state.activeTradeOffer) return false;
    const offer = this.state.activeTradeOffer;
    const res = this.state.resources;

    if ((res[offer.demandResource] || 0) >= offer.demandAmount) {
      res[offer.demandResource] -= offer.demandAmount;
      res[offer.rewardResource] = (res[offer.rewardResource] || 0) + offer.rewardAmount;
      this.state.activeTradeOffer = null;
      this.save();
      this.notifyListeners('trade_offer_accepted');
      return true;
    }
    return false;
  }

  rejectTradeOffer() {
    this.state.activeTradeOffer = null;
    this.save();
    this.notifyListeners('trade_offer_rejected');
  }
}
