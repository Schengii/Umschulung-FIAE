// --- AI WORKER (Hybrid Architecture) ---
// This worker runs the AI Bot logic in a separate thread to prevent UI stuttering.

self.importScripts('../core/config.js');
// Note: Some configs like WORLD_MAP_CONFIG might not be in config.js but in other files.
// To avoid missing them, we pass them from the main thread during initialization.

let globalState = null;
let aiConfig = {
  personality: 'builder',
  autoAttack: false
};
let externalConfigs = {};

self.onmessage = function(e) {
  const msg = e.data;
  
  if (msg.type === 'INIT') {
    aiConfig = msg.config;
    externalConfigs = msg.externalConfigs || {};
  } else if (msg.type === 'UPDATE_CONFIG') {
    aiConfig = { ...aiConfig, ...msg.config };
  } else if (msg.type === 'TICK') {
    globalState = msg.state;
    performTickLogic();
  }
};

// --- State Manager Mocks for Worker ---

function hasResources(cost) {
  if (!cost) return true;
  for (let key in cost) {
    if ((globalState.resources[key] || 0) < cost[key]) return false;
  }
  return true;
}

function getBuildingLimit(type) {
  const uniques = [
    BUILDING_TYPES.KEEP, BUILDING_TYPES.BLACKSMITH, BUILDING_TYPES.BARRACKS,
    BUILDING_TYPES.STABLES, BUILDING_TYPES.MILL, BUILDING_TYPES.WOODCUTTER,
    BUILDING_TYPES.BAKERY, BUILDING_TYPES.SMELTER, BUILDING_TYPES.TOWNHALL,
    BUILDING_TYPES.FORTRESS, BUILDING_TYPES.SIEGE_WORKSHOP
  ];
  if (uniques.includes(type)) return 1;
  if (type === BUILDING_TYPES.WALL) return 40;
  if ([BUILDING_TYPES.FOUNTAIN, BUILDING_TYPES.STATUE, BUILDING_TYPES.GARDEN, BUILDING_TYPES.BANNER].includes(type)) return 5;
  return 2;
}

function canCompleteDailyQuest(questId) {
  // Simplistic mock: we can't easily replicate full quest logic without QUESTS_CONFIG if it's complex,
  // but we can rely on main thread if we just send a check command.
  // For now, we skip daily quests in worker, or assume they are evaluated correctly in main thread.
  return false; 
}

function isPlacementValid(x, y, w, h) {
  if (x < 0 || x + w > MAP_SIZE || y < 0 || y + h > MAP_SIZE) return false;
  for (const b of globalState.buildings) {
    const cfg = BUILDINGS_CONFIG[b.type];
    if (!cfg) continue;
    const overlapX = Math.max(0, Math.min(x + w, b.x + cfg.baseWidth) - Math.max(x, b.x));
    const overlapY = Math.max(0, Math.min(y + h, b.y + cfg.baseHeight) - Math.max(y, b.y));
    if (overlapX > 0 && overlapY > 0) return false;
  }
  return true;
}

// --- Action Emitters ---

function sendAction(action, args, message) {
  self.postMessage({
    type: 'AI_ACTION',
    action: action,
    args: args,
    message: message
  });
}

// --- AI Logic (Migrated from ai_bot.js) ---

function performTickLogic() {
  let actionTaken = false;

  // 1. Check builder main quests (Simplified for worker, uses config if passed)
  if (!actionTaken && globalState.activeQuestId && externalConfigs.QUESTS_CONFIG) {
    actionTaken = builderMainQuests();
  }

  // 2. Perform main priority actions based on personality
  if (!actionTaken) {
    actionTaken = performActions();
  }
}

function builderTaxes() {
  const taxHouse = globalState.buildings.find(b => b.type === BUILDING_TYPES.TAX_HOUSE && !b.underConstruction);
  if (taxHouse) {
    const tax = globalState.taxState;
    if (tax.canCollect) {
      sendAction('collectTaxes', [], "🤖 AI hat Steuern eingetrieben.");
      return true;
    } else if (!tax.optionId) {
      sendAction('startTaxCollection', ['medium'], "🤖 AI hat Steuereintreibung gestartet (medium).");
      return true;
    }
  }
  return false;
}

function builderMainQuests() {
  const state = globalState;
  const questId = state.activeQuestId;
  // We don't have the full condition functions here, so we rely on quest IDs.
  if (questId === 'quest_woodcutter') return tryBuildBuilding(BUILDING_TYPES.WOODCUTTER);
  if (questId === 'quest_quarry') return tryBuildBuilding(BUILDING_TYPES.QUARRY);
  if (questId === 'quest_farm') return tryBuildBuilding(BUILDING_TYPES.FARM);
  if (questId === 'quest_tax') return tryBuildBuilding(BUILDING_TYPES.TAX_HOUSE);
  if (questId === 'quest_barracks') return tryBuildBuilding(BUILDING_TYPES.BARRACKS);
  if (questId === 'quest_recruit') {
    const count = state.troops.spearman || 0;
    if (count < 5) return tryRecruitTroops('spearman', 5 - count);
  }
  if (questId === 'quest_upgrade_keep') {
    const keep = state.buildings.find(b => b.type === BUILDING_TYPES.KEEP);
    if (keep && keep.level < 2) return tryUpgradeBuilding(keep.id);
  }
  if (questId === 'quest_spring') return tryBuildBuilding(BUILDING_TYPES.FOUNTAIN);
  if (questId === 'quest_tavern') return tryBuildBuilding(BUILDING_TYPES.TAVERN);
  if (questId === 'quest_spy' && externalConfigs.WORLD_MAP_CONFIG) {
    const count = state.troops.spy || 0;
    if (count < 1) return tryRecruitTroops('spy', 1);
    const targetNpc = externalConfigs.WORLD_MAP_CONFIG.npcCastles.find(c => c.level === 1);
    if (targetNpc) {
      sendAction('dispatchSpy', [targetNpc.id, 1], `🤖 AI hat Spion zu ${targetNpc.name} geschickt.`);
      return true;
    }
  }
  return false;
}

function builderUpgrade() {
  const keep = globalState.buildings.find(b => b.type === BUILDING_TYPES.KEEP);
  
  if (keep && !keep.underConstruction) {
    const nextKeepLvl = keep.level + 1;
    const keepCfg = BUILDINGS_CONFIG[BUILDING_TYPES.KEEP].levels[nextKeepLvl];
    if (keepCfg && hasResources(keepCfg.cost)) {
      return tryUpgradeBuilding(keep.id);
    }
  }

  if (globalState.buildings.length > 0) {
    const upgradeable = globalState.buildings.filter(b => {
      if (b.underConstruction) return false;
      const nextLvl = b.level + 1;
      const cfg = BUILDINGS_CONFIG[b.type].levels[nextLvl];
      if (!cfg) return false;
      if (b.type !== BUILDING_TYPES.KEEP && keep && nextLvl > keep.level) return false;
      return hasResources(cfg.cost);
    });
    if (upgradeable.length > 0) {
      const targetB = upgradeable[Math.floor(Math.random() * upgradeable.length)];
      return tryUpgradeBuilding(targetB.id);
    }
  }

  const buildOptions = Object.keys(BUILDINGS_CONFIG).filter(type => {
    if (type === BUILDING_TYPES.KEEP) return false;
    const count = globalState.buildings.filter(b => b.type === type).length;
    if (count >= getBuildingLimit(type)) return false;
    const existing = globalState.buildings.filter(b => b.type === type);
    const keepLvl = keep ? keep.level : 1;
    if (existing.some(b => b.level < keepLvl && !b.underConstruction)) return false;
    const levelCfg = BUILDINGS_CONFIG[type].levels[1];
    return levelCfg && hasResources(levelCfg.cost);
  });

  if (buildOptions.length > 0) {
    const typeToBuild = buildOptions[Math.floor(Math.random() * buildOptions.length)];
    return tryBuildBuilding(typeToBuild);
  }
  return false;
}

function warlordRecruit() {
  const troopTypes = Object.keys(TROOPS_CONFIG);
  const recruitableTroops = troopTypes.filter(t => {
    if (t === 'spy') {
      if ((globalState.troops.spy || 0) >= 2) return false;
    }
    const barracks = globalState.buildings.find(b => b.type === BUILDING_TYPES.BARRACKS && !b.underConstruction);
    if (!barracks) return false;
    const unlocked = BUILDINGS_CONFIG[BUILDING_TYPES.BARRACKS].levels[barracks.level]?.unlocks || [];
    if (t !== 'spy' && t !== 'knight' && !unlocked.includes(t)) return false;
    if (t === 'knight') {
      const stables = globalState.buildings.find(b => b.type === BUILDING_TYPES.STABLES && !b.underConstruction);
      if (!stables) return false;
      const stUnlocked = BUILDINGS_CONFIG[BUILDING_TYPES.STABLES].levels[stables.level]?.unlocks || [];
      if (!stUnlocked.includes(t)) return false;
    }
    return hasResources(TROOPS_CONFIG[t].cost);
  });

  if (recruitableTroops.length > 0) {
    const troopToRecruit = recruitableTroops[Math.floor(Math.random() * recruitableTroops.length)];
    return tryRecruitTroops(troopToRecruit, 1);
  }
  return false;
}

function warlordAttack() {
  if (!externalConfigs.WORLD_MAP_CONFIG) return false;
  
  const attackTroops = {
    spearman: globalState.troops.spearman || 0,
    swordsman: globalState.troops.swordsman || 0,
    bowman: globalState.troops.bowman || 0,
    knight: globalState.troops.knight || 0
  };
  const totalAttackPower = Object.values(attackTroops).reduce((a, b) => a + b, 0);

  if (totalAttackPower >= 6) {
    let target = null;
    let targetType = 'npc';

    if (globalState.outposts) {
      const unownedOp = externalConfigs.WORLD_MAP_CONFIG.outposts.find(op => {
        const opState = globalState.outposts[op.id];
        return !opState || opState.owner !== 'player';
      });
      if (unownedOp) {
        target = unownedOp;
        targetType = 'outpost';
      }
    }

    if (!target) {
      const suitableNpcs = externalConfigs.WORLD_MAP_CONFIG.npcCastles.filter(npc => {
        const defCount = Object.values(npc.defenders).reduce((a, b) => a + b, 0);
        return totalAttackPower >= defCount * 1.1;
      });
      if (suitableNpcs.length > 0) {
        target = suitableNpcs[Math.floor(Math.random() * suitableNpcs.length)];
      }
    }

    if (target) {
      const isPlayerOwnedOutpost = targetType === 'outpost' && globalState.outposts?.[target.id]?.owner === 'player';
      const isScouted = globalState.scoutedSites?.[target.id] || target.level === 1 || isPlayerOwnedOutpost;

      if (!isScouted && targetType === 'npc') {
        const spyCount = globalState.troops.spy || 0;
        if (spyCount > 0) {
          sendAction('dispatchSpy', [target.id, 1], `🤖 AI hat Spion zu ${target.name} geschickt.`);
          return true;
        } else {
          return tryRecruitTroops('spy', 1);
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
          if (aiConfig.autoAttack) {
            sendAction('dispatchAttack', [target.id, army, targetType], `🤖 AI greift ${target.name} an.`);
            return true;
          } else {
            // Need to ask permission via main thread
            sendAction('proposeAttack', [target.id, army, targetType, target.name], null);
            return true;
          }
        }
      }
    }
  }
  return false;
}

function warlordUpgrade() {
  const milBuildings = globalState.buildings.filter(b => 
    [BUILDING_TYPES.BARRACKS, BUILDING_TYPES.STABLES, BUILDING_TYPES.BLACKSMITH, BUILDING_TYPES.WALL].includes(b.type)
  );
  if (milBuildings.length > 0) {
    const keep = globalState.buildings.find(b => b.type === BUILDING_TYPES.KEEP);
    const upgradeable = milBuildings.filter(b => {
      if (b.underConstruction) return false;
      const nextLvl = b.level + 1;
      const cfg = BUILDINGS_CONFIG[b.type].levels[nextLvl];
      if (!cfg) return false;
      if (keep && nextLvl > keep.level) return false;
      return hasResources(cfg.cost);
    });
    if (upgradeable.length > 0) {
      const targetB = upgradeable[Math.floor(Math.random() * upgradeable.length)];
      return tryUpgradeBuilding(targetB.id);
    }
  }
  return false;
}

function crawlerHero() {
  if (globalState.hero) {
    if (globalState.heroDungeonMission) {
      const mission = globalState.heroDungeonMission;
      if (!mission.choiceMade) {
        if (externalConfigs.DUNGEON_ENCOUNTERS) {
          const encId = mission.encounterIds[mission.currentStep - 1];
          const enc = externalConfigs.DUNGEON_ENCOUNTERS.find(e => e.id === encId);
          if (enc) {
            let bestChoiceIdx = 0;
            enc.choices.forEach((c, idx) => {
              if (c.classBonus === globalState.hero.type) bestChoiceIdx = idx;
            });
            sendAction('resolveDungeonChoice', [bestChoiceIdx], `🤖 AI hat Entscheidung im Dungeon getroffen.`);
            return true;
          }
        }
      } else {
        sendAction('nextDungeonStep', [], `🤖 AI ist im Dungeon vorangeschritten.`);
        return true;
      }
    } else if (externalConfigs.DUNGEONS_CONFIG) {
      const playableDungeons = externalConfigs.DUNGEONS_CONFIG.filter(d => globalState.hero.level >= d.levelReq);
      if (playableDungeons.length > 0) {
        const bestDungeon = playableDungeons.reduce((max, d) => d.levelReq > max.levelReq ? d : max, playableDungeons[0]);
        sendAction('startDungeon', [bestDungeon.id], `🤖 AI hat Held in Dungeon ${bestDungeon.name} geschickt.`);
        return true;
      }
    }
  } else if (globalState.resources.gold >= 150) {
    sendAction('recruitHero', ['paladin'], "🤖 AI hat einen Helden (Paladin) beschworen!");
    return true;
  }
  return false;
}

function crawlerUpgrade() {
  const crawlerBuildings = globalState.buildings.filter(b => 
    [BUILDING_TYPES.HERO_ALTAR, BUILDING_TYPES.BLACKSMITH].includes(b.type)
  );
  if (crawlerBuildings.length > 0) {
    const keep = globalState.buildings.find(b => b.type === BUILDING_TYPES.KEEP);
    const upgradeable = crawlerBuildings.filter(b => {
      if (b.underConstruction) return false;
      const nextLvl = b.level + 1;
      const cfg = BUILDINGS_CONFIG[b.type].levels[nextLvl];
      if (!cfg) return false;
      if (keep && nextLvl > keep.level) return false;
      return hasResources(cfg.cost);
    });
    if (upgradeable.length > 0) {
      const targetB = upgradeable[Math.floor(Math.random() * upgradeable.length)];
      return tryUpgradeBuilding(targetB.id);
    }
  }
  return false;
}

function performActions() {
  let actionTaken = false;

  if (globalState.happiness !== undefined) {
    if (globalState.happiness > 70 && globalState.taxRate !== 'high') {
      sendAction('setTaxRate', ['high'], "🤖 AI hat Steuersatz auf HOCH gesetzt (Volk ist glücklich).");
    } else if (globalState.happiness < 40 && globalState.taxRate !== 'low') {
      sendAction('setTaxRate', ['low'], "🤖 AI hat Steuersatz auf NIEDRIG gesetzt (Volk ist unzufrieden).");
    } else if (globalState.happiness >= 40 && globalState.happiness <= 70 && globalState.taxRate !== 'normal') {
      sendAction('setTaxRate', ['normal'], "🤖 AI hat Steuersatz auf NORMAL gesetzt.");
    }
  }

  if (globalState.hero && globalState.resources.rubies >= 15 && globalState.resources.gold >= 1000) {
    const eq = globalState.heroEquipment || { weapon: null, armor: null, accessory: null };
    const gems = globalState.heroEquipmentGems || { weapon: null, armor: null, accessory: null };
    if (eq.weapon && !gems.weapon) {
      sendAction('socketGem', ['weapon', 'ruby'], "🤖 AI hat einen Rubin in die Waffe gesockelt.");
    } else if (eq.armor && !gems.armor) {
      sendAction('socketGem', ['armor', 'emerald'], "🤖 AI hat einen Smaragd in die Rüstung gesockelt.");
    } else if (eq.accessory && !gems.accessory) {
      sendAction('socketGem', ['accessory', 'sapphire'], "🤖 AI hat einen Saphir in das Amulett gesockelt.");
    }
  }

  if (globalState.resources.wood > 500 && globalState.resources.food > 500 && !globalState.buildings.some(b => b.type === BUILDING_TYPES.BREWERY)) {
    actionTaken = tryBuildBuilding(BUILDING_TYPES.BREWERY);
  }

  if (aiConfig.personality === 'warlord') {
    if (!actionTaken) actionTaken = warlordRecruit();
    if (!actionTaken) actionTaken = warlordAttack();
    if (!actionTaken) actionTaken = warlordUpgrade();
    if (!actionTaken) actionTaken = builderTaxes();
  } else if (aiConfig.personality === 'crawler') {
    if (!actionTaken) actionTaken = crawlerHero();
    if (!actionTaken) actionTaken = crawlerUpgrade();
    if (!actionTaken) actionTaken = builderTaxes();
    if (!actionTaken) actionTaken = warlordRecruit() || warlordAttack();
  } else {
    // builder
    if (!actionTaken) actionTaken = builderTaxes();
    if (!actionTaken) actionTaken = builderUpgrade();
    if (!actionTaken) actionTaken = crawlerHero() || warlordRecruit();
  }

  return actionTaken;
}

function tryBuildBuilding(type) {
  const config = BUILDINGS_CONFIG[type];
  if (!config) return false;
  const levelCfg = config.levels[1];
  if (!levelCfg || !hasResources(levelCfg.cost)) return false;

  const w = config.baseWidth;
  const h = config.baseHeight;
  for (let x = 0; x <= MAP_SIZE - w; x++) {
    for (let y = 0; y <= MAP_SIZE - h; y++) {
      if (isPlacementValid(x, y, w, h)) {
        sendAction('buildBuilding', [type, x, y], `🤖 AI hat ein ${config.name} gebaut.`);
        return true;
      }
    }
  }
  return false;
}

function tryUpgradeBuilding(id) {
  const b = globalState.buildings.find(item => item.id === id);
  if (!b || b.underConstruction) return false;
  const nextLevel = b.level + 1;
  const config = BUILDINGS_CONFIG[b.type];
  const levelCfg = config?.levels[nextLevel];
  if (!levelCfg || !hasResources(levelCfg.cost)) return false;

  sendAction('upgradeBuilding', [id], `🤖 AI hat ${config.name} auf Stufe ${nextLevel} ausgebaut.`);
  return true;
}

function tryRecruitTroops(type, count) {
  if (count <= 0) return false;
  const cfg = TROOPS_CONFIG[type];
  if (!cfg) return false;

  sendAction('recruitTroops', [type, count], `🤖 AI rekrutiert ${count}x ${cfg.name}.`);
  return true;
}
