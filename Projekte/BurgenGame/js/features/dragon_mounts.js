// --- DRAGON BREEDING & MYTHICAL MOUNTS SYSTEM ---

class DragonMountsManager {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.beasts = [
      { id: 'fire_dragon', name: '🐉 Uralter Feuerdrache', bonus: '+40% Kampfdamage & Feueratem-AoE', cost: { gold: 1500, rubies: 20 }, combatBonus: { type: 'damage_mult', val: 1.40 } },
      { id: 'griffin', name: '🦅 Goldener Greif', bonus: '+35% Marschgeschwindigkeit & Fernkampf-Abwehr', cost: { gold: 1000, rubies: 10 }, combatBonus: { type: 'range_defense', val: 1.35 } },
      { id: 'panther', name: '🐆 Schattenpanther', bonus: '+50% Kritische Trefferchance des Helden', cost: { gold: 800, rubies: 8 }, combatBonus: { type: 'crit_chance', val: 0.50 } }
    ];
    // XP-Schwellen für Level-Ups
    this.xpThresholds = [0, 100, 300, 600, 1000, 1500];
  }

  init() {
    if (!stateManager.state.dragonMounts) {
      stateManager.state.dragonMounts = {
        activeMount: null,
        ownedBeasts: [],
        xp: 0,
        level: 1
      };
    }
    // Migrationsfix: Alte States ohne level/xp erhalten Standardwerte
    if (stateManager.state.dragonMounts.xp === undefined) {
      stateManager.state.dragonMounts.xp = 0;
    }
    if (stateManager.state.dragonMounts.level === undefined) {
      stateManager.state.dragonMounts.level = 1;
    }
  }

  getMountLevel() {
    this.init();
    const xp = stateManager.state.dragonMounts.xp || 0;
    let level = 1;
    for (let i = this.xpThresholds.length - 1; i >= 0; i--) {
      if (xp >= this.xpThresholds[i]) { level = i + 1; break; }
    }
    stateManager.state.dragonMounts.level = level;
    return level;
  }

  showModal() {
    this.init();
    const mounts = stateManager.state.dragonMounts;
    const level = this.getMountLevel();
    const xp = mounts.xp || 0;
    const nextLevelXP = this.xpThresholds[level] || 9999;
    const xpPct = level >= this.xpThresholds.length ? 100 : Math.floor((xp / nextLevelXP) * 100);

    let content = `
      <div style="padding: 10px;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">🐉 Drachennest & Mythische Reittiere</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 16px;">Züchte mächtige Bestien auf und rüste deinen Helden mit legendären Reittieren aus!</p>

        <div style="background: rgba(20,25,35,0.85); border: 1px solid #d4af37; border-radius: 6px; padding: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #fff;">Aktives Reittier:</strong>
            <div style="font-size: 0.9em; color: #4CAF50;">${mounts.activeMount ? mounts.activeMount.name : 'Kein Reittier ausgerüstet'}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 0.8em; color: #ffd700;">Level ${level} | XP: ${Math.floor(xp)} / ${nextLevelXP}</div>
            <div style="width: 120px; background: #222; height: 6px; border-radius: 3px; margin-top: 4px; overflow: hidden;">
              <div style="width: ${xpPct}%; background: linear-gradient(90deg, #ff6b35, #d4af37); height: 100%;"></div>
            </div>
          </div>
          ${mounts.activeMount ? `
            <button onclick="window.dragonMountsManager.unequipMount()" style="padding: 6px 12px; background: #b22222; color: #fff; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
              Absatteln
            </button>
          ` : ''}
        </div>

        <div style="display: flex; gap: 8px; margin-bottom: 16px;">
          <button onclick="window.dragonMountsManager.feedDragonUI()" style="flex: 1; padding: 8px; background: linear-gradient(135deg, #2ecc71, #27ae60); color: #fff; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
            🥩 Drachen füttern (-100 Nahrung, +100 XP)
          </button>
        </div>

        <h3 style="color: #e5c158; margin-bottom: 8px;">Bestiarium (Aufzucht):</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
    `;

    this.beasts.forEach(beast => {
      const isOwned = mounts.ownedBeasts.some(b => b.id === beast.id);
      const isActive = mounts.activeMount && mounts.activeMount.id === beast.id;
      // BUG FIX: Lese korrekte Ressourcenfelder
      const playerGold = stateManager.state.resources?.gold || 0;
      const playerRubies = stateManager.state.resources?.rubies || 0;
      const canAfford = playerGold >= (beast.cost.gold || 0) && playerRubies >= (beast.cost.rubies || 0);

      content += `
        <div style="background: rgba(15,20,30,0.8); border: 1px solid ${isActive ? '#4CAF50' : 'rgba(255,255,255,0.1)'}; border-radius: 6px; padding: 10px;">
          <h4 style="color: #fff; margin-bottom: 4px;">${beast.name}</h4>
          <div style="font-size: 0.8em; color: #aaa; margin-bottom: 8px;">${beast.bonus}</div>
          ${isOwned ? `
            <button onclick="window.dragonMountsManager.equipMount('${beast.id}')"
                    style="width: 100%; padding: 6px; background: ${isActive ? '#4CAF50' : 'linear-gradient(135deg, #d4af37, #aa820a)'}; color: ${isActive ? '#fff' : '#111'}; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
              ${isActive ? '✓ Ausgerüstet' : '🏇 Aufsatteln'}
            </button>
          ` : `
            <div style="font-size: 0.75em; color: #888; margin-bottom: 8px;">
              Kosten: ${beast.cost.gold} Gold, ${beast.cost.rubies} Rubine
            </div>
            <button onclick="window.dragonMountsManager.breedBeast('${beast.id}')"
                    ${canAfford ? '' : 'disabled'}
                    style="width: 100%; padding: 6px; background: ${canAfford ? 'linear-gradient(135deg, #4CAF50, #2E7D32)' : '#555'}; color: #fff; font-weight: bold; border: none; border-radius: 4px; cursor: ${canAfford ? 'pointer' : 'not-allowed'};">
              🥚 Ausbrüten
            </button>
          `}
        </div>
      `;
    });

    content += `</div></div>`;
    this.gameUI.showModal('Drachennest & Reittiere', content);
  }

  breedBeast(beastId) {
    this.init();
    const beast = this.beasts.find(b => b.id === beastId);
    if (!beast) return;

    // BUG FIX: Verwende state.resources.gold und state.resources.rubies statt state.gold/gems
    const playerGold = stateManager.state.resources?.gold || 0;
    const playerRubies = stateManager.state.resources?.rubies || 0;

    if (playerGold < (beast.cost.gold || 0) || playerRubies < (beast.cost.rubies || 0)) {
      this.gameUI.showFloatingNotification(`Nicht genug Gold oder Rubine! Benötigt: ${beast.cost.gold} Gold, ${beast.cost.rubies} Rubine`);
      return;
    }

    stateManager.state.resources.gold -= (beast.cost.gold || 0);
    stateManager.state.resources.rubies = (stateManager.state.resources.rubies || 0) - (beast.cost.rubies || 0);

    stateManager.state.dragonMounts.ownedBeasts.push(beast);
    stateManager.save();
    this.gameUI.showFloatingNotification(`🥚 Erzeugung erfolgreich! ${beast.name} schlüpft aus dem Ei!`);
    if (window.gameSound) window.gameSound.playSFX('upgrade');
    this.showModal();
  }

  equipMount(beastId) {
    this.init();
    const beast = stateManager.state.dragonMounts.ownedBeasts.find(b => b.id === beastId);
    if (beast) {
      stateManager.state.dragonMounts.activeMount = beast;
      stateManager.save();
      this.gameUI.showFloatingNotification(`🏇 ${beast.name} als aktives Reittier aufgezäumt!`);
      this.showModal();
    }
  }

  unequipMount() {
    this.init();
    stateManager.state.dragonMounts.activeMount = null;
    stateManager.save();
    this.gameUI.showFloatingNotification('Absatteln erfolgreich.');
    this.showModal();
  }

  hatchDragonEgg() {
    this.breedBeast('fire_dragon');
    return stateManager.state.dragonMounts.ownedBeasts;
  }

  feedDragonUI() {
    const result = this.feedDragon(100);
    this.gameUI.showFloatingNotification(result.msg);
    if (result.success) {
      stateManager.save();
      this.showModal();
    }
  }

  feedDragon(foodAmount = 100) {
    this.init();
    const state = stateManager.state;
    // state.resources.food ist korrekt (kein Bug hier)
    if ((state.resources.food || 0) < foodAmount) {
      return { success: false, msg: 'Nicht genug Nahrung im Speicher!' };
    }
    state.resources.food -= foodAmount;
    state.dragonMounts.xp = (state.dragonMounts.xp || 0) + foodAmount;
    const newLevel = this.getMountLevel();
    return { success: true, msg: `🥩 Drache gefüttert! (+${foodAmount} XP | Level ${newLevel})` };
  }

  // ============================================================
  // NEU: Gibt den Kampfbonus des aktiven Reittieres zurück
  // Wird von tactical_combat.js aufgerufen
  // ============================================================
  getDragonMountBonus(type) {
    this.init();
    const mounts = stateManager.state.dragonMounts;
    if (!mounts.activeMount) return type === 'damage_mult' ? 1.0 : 0;

    const mountId = mounts.activeMount.id;
    const level = mounts.level || 1;
    const levelMult = 1 + (level - 1) * 0.05; // +5% pro Level

    if (type === 'damage_mult' && mountId === 'fire_dragon') {
      return 1.40 * levelMult;
    }
    if (type === 'crit_chance' && mountId === 'panther') {
      return 0.50 * levelMult;
    }
    if (type === 'range_defense' && mountId === 'griffin') {
      return 1.35 * levelMult;
    }
    return type === 'damage_mult' ? 1.0 : 0;
  }

  deployDragonRider() {
    this.init();
    const mounts = stateManager.state.dragonMounts;
    const level = mounts.level || 1;
    const hasFireDragon = mounts.ownedBeasts.some(b => b.id === 'fire_dragon');

    if (!hasFireDragon) {
      return null; // Kein Feuerdrache vorhanden
    }

    return {
      type: 'dragon_rider',
      name: '🐉 Drachenreiter',
      hp: 200 + level * 20,
      meleeAtk: 35 + level * 3,
      rangeAtk: 50 + level * 4,
      isAerial: true,
      aoeBreath: true,
      breathDamage: 25 + level * 5
    };
  }
}

window.DragonMountsManager = DragonMountsManager;
