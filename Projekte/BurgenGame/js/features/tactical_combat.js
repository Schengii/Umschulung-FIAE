// --- INTERACTIVE TACTICAL COMBAT SYSTEM ---

class TacticalCombat {
  constructor(canvas, stateManager, ui, report, isDefense, callback) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.stateManager = stateManager;
    this.ui = ui;
    this.report = report;
    this.isDefense = isDefense;
    this.callback = callback;

    this.gridWidth = 8;
    this.gridHeight = 5;
    this.tileWidth = 64;
    this.tileHeight = 36;

    this.units = [];
    this.obstacles = []; // Array von {x, y, type: 'rock' | 'bush'}
    this.turn = 'player'; // 'player' | 'enemy'
    this.selectedUnit = null;
    this.animationTime = 0;
    this.projectiles = [];
    this.floatingTexts = [];
    this.actionLogs = ['Aufstellungsphase: Platziere deine Einheiten in den hervorgehobenen Feldern.'];
    this.placementPhase = true;
    this.speedMultiplier = 1;

    // Morale & Weather Integration
    this.playerMorale = 100;
    this.enemyMorale = 100;
    this.formation = (this.stateManager && this.stateManager.state && this.stateManager.state.combatFormation) || 'standard';
    this.weatherType = (this.stateManager && this.stateManager.state && this.stateManager.state.weather?.type) || 'sunny';

    this.initBattlefield();

    // Apply Formations & Morale Effects
    this.applyFormationAndWeatherModifiers();

    // Assign initiative to all units
    this.units.forEach(u => {
      let init = 5;
      if (u.isHero) init = 9;
      else if (u.isTower) init = 3;
      else if (u.type === 'knight') init = 8;
      else if (u.type === 'paladin') init = 7;
      else if (u.type === 'bowman') init = 6;
      else if (u.type === 'swordsman') init = 5;
      else if (u.type === 'spearman') init = 4;
      else if (u.type === 'border_guard') init = 3;
      else if (u.type === 'ram') init = 2;
      else if (u.type === 'catapult') init = 1;
      u.initiative = init;
      u.morale = 100;
      u.isRouting = false;
    });
    this.units.sort((a, b) => b.initiative - a.initiative);
    this.activeUnitIndex = 0;

    this.setupMouseListeners();
  }

  applyFormationAndWeatherModifiers() {
    this.units.forEach(u => {
      if (u.side === 'player') {
        if (this.formation === 'phalanx') {
          if (u.type === 'spearman' || u.type === 'swordsman') {
            u.meleeDef = Math.round(u.meleeDef * 1.35);
          }
        } else if (this.formation === 'wedge') {
          if (u.type === 'knight' || u.type === 'paladin') {
            u.meleeAtk = Math.round(u.meleeAtk * 1.25);
          }
        } else if (this.formation === 'shield_wall') {
          u.meleeDef = Math.round(u.meleeDef * 1.3);
          u.rangeDef = Math.round(u.rangeDef * 1.3);
        }
      }

      // Weather effects
      if (this.weatherType === 'rain' || this.weatherType === 'storm') {
        if (u.rangeAtk > 0) {
          u.rangeAtk = Math.max(1, Math.round(u.rangeAtk * 0.75));
        }
      } else if (this.weatherType === 'snow') {
        if (u.type === 'knight') {
          u.meleeAtk = Math.max(1, Math.round(u.meleeAtk * 0.85));
        }
      }
    });

    if (this.formation && this.formation !== 'standard') {
      this.actionLogs.push(`Taktische Formation aktiv: ${this.formation.toUpperCase()}`);
    }
    if (this.weatherType && this.weatherType !== 'sunny') {
      this.actionLogs.push(`Wetterbedingungen auf dem Schlachtfeld: ${this.weatherType.toUpperCase()}`);
    }
  }

  updateMoraleOnLoss(side, damageDealt) {
    const moraleLoss = Math.min(25, Math.ceil(damageDealt / 8));
    if (side === 'player') {
      this.playerMorale = Math.max(0, this.playerMorale - moraleLoss);
      if (this.playerMorale < 30) {
        this.actionLogs.push('⚠️ WARNUNG: Die Moral deiner Truppen ist kritisch niedrig!');
      }
    } else {
      this.enemyMorale = Math.max(0, this.enemyMorale - moraleLoss);
      if (this.enemyMorale < 30) {
        this.actionLogs.push('⚡ Die gegnerische Moral wankt!');
      }
    }
  }

  startBattleFromPlacement() {
    this.placementPhase = false;
    this.actionLogs.push('Schlacht gestartet! Initiative-Reihenfolge bestimmt.');
    this.startNextUnitTurn();
  }

  setSpeed(mult) {
    this.speedMultiplier = mult;
    this.actionLogs.push(`Kampfgeschwindigkeit auf ${mult}x gesetzt.`);
  }

  autoResolve() {
    if (!this.active) return;
    this.placementPhase = false;
    this.actionLogs.push('⚡ Schnellkampf gestartet... Kampf wird automatisch simuliert.');

    let safety = 0;
    while (this.active && safety < 100) {
      safety++;
      const currentUnit = this.units[this.activeUnitIndex];
      if (!currentUnit || currentUnit.hp <= 0) {
        this.activeUnitIndex = (this.activeUnitIndex + 1) % this.units.length;
        continue;
      }

      if (currentUnit.side === 'player') {
        const enemies = this.units.filter(u => u.side === 'enemy' && u.hp > 0);
        if (enemies.length > 0) {
          const target = enemies[0];
          this.attackUnit(currentUnit, target);
        }
      } else {
        const players = this.units.filter(u => u.side === 'player' && u.hp > 0);
        if (players.length > 0) {
          const target = players[0];
          this.attackUnit(currentUnit, target);
        }
      }

      this.checkVictoryConditionsSync();
      this.activeUnitIndex = (this.activeUnitIndex + 1) % this.units.length;
    }
    this.draw();
  }

  checkVictoryConditionsSync() {
    const playerAlive = this.units.some(u => u.side === 'player' && u.hp > 0);
    const enemyAlive = this.units.some(u => u.side === 'enemy' && u.hp > 0);

    if (!playerAlive) {
      this.actionLogs.push('Schlacht verloren!');
      this.active = false;
      this.report.victory = false;
      setTimeout(() => this.callback(), 500);
    } else if (!enemyAlive) {
      this.actionLogs.push('Sieg! Alle Feinde vernichtet.');
      this.active = false;
      this.report.victory = true;
      setTimeout(() => this.callback(), 500);
    }
  }

  initBattlefield() {
    // Generiere zufällige Hindernisse (Steine und Gebüsche für Deckung)
    for (let i = 0; i < 4; i++) {
      this.obstacles.push({
        x: Math.floor(3 + Math.random() * 3),
        y: Math.floor(Math.random() * this.gridHeight),
        type: Math.random() < 0.5 ? 'rock' : 'bush'
      });
    }

    // Spawn wall obstacles in siege defense
    if (this.report.isSiegeDefense) {
      const wallCount = this.stateManager.state.buildings.filter(b => b.type === BUILDING_TYPES.WALL && !b.underConstruction).length;
      const wallsToSpawn = Math.min(this.gridHeight, Math.max(1, Math.ceil(wallCount / 5)));
      for (let y = 0; y < wallsToSpawn; y++) {
        this.obstacles.push({
          x: 2,
          y: y,
          type: 'wall',
          hp: 120,
          maxHp: 120
        });
      }
    }

    // Spawn friendly towers in defense
    if (this.isDefense) {
      const wallCount = this.stateManager.state.buildings.filter(b => b.type === BUILDING_TYPES.WALL && !b.underConstruction).length;
      const towerCount = Math.min(3, Math.ceil(wallCount / 8));
      for (let t = 0; t < towerCount; t++) {
        this.units.push({
          id: `player_tower_${t}`,
          type: 'tower',
          side: 'player',
          x: 0,
          y: t * 2,
          hp: 150,
          maxHp: 150,
          meleeAtk: 0,
          rangeAtk: 25,
          meleeDef: 30,
          rangeDef: 30,
          movedThisTurn: true,
          actedThisTurn: false,
          isTower: true
        });
      }
    }

    // Spieler-Einheiten aufstellen (Links, Spalten 0-1)
    let playerIdx = 0;

    // In Dungeon Boss fights, add the special Hero unit!
    if (this.report.isDungeonBoss && this.stateManager.state.hero) {
      const heroState = this.stateManager.state.hero;
      
      const skillMaxHp = this.stateManager.getHeroSkillBonus ? this.stateManager.getHeroSkillBonus('hero_max_hp') : 0;
      const gemMaxHp = this.stateManager.getGemBonus ? this.stateManager.getGemBonus('hp') : 0;
      const totalHeroMaxHp = 150 + skillMaxHp + gemMaxHp;

      const skillAtk = this.stateManager.getHeroSkillBonus ? this.stateManager.getHeroSkillBonus('attack') : 0;
      const gemAtk = this.stateManager.getGemBonus ? this.stateManager.getGemBonus('attack') : 0;
      const totalHeroAtk = Math.round(25 * (1 + skillAtk + gemAtk));

      const skillDef = this.stateManager.getHeroSkillBonus ? this.stateManager.getHeroSkillBonus('troop_defense') : 0;
      const gemDef = this.stateManager.getGemBonus ? this.stateManager.getGemBonus('defense') : 0;
      const totalHeroDef = Math.round(20 * (1 + skillDef + gemDef));

      this.units.push({
        id: `player_hero`,
        type: 'hero',
        side: 'player',
        x: 0,
        y: 2,
        hp: totalHeroMaxHp,
        maxHp: totalHeroMaxHp,
        meleeAtk: totalHeroAtk,
        rangeAtk: 0,
        meleeDef: totalHeroDef,
        rangeDef: totalHeroDef,
        movedThisTurn: false,
        actedThisTurn: false,
        shieldWallActive: false,
        fireArrowCooldown: 0,
        chargeCooldown: 0,
        hasBurnEffect: 0,
        isHero: true,
        skills: heroState.skills || {},
        healCooldown: 0,
        whirlwindCooldown: 0,
        tauntCooldown: 0
      });
    }

    const playerTroops = this.isDefense ? (this.stateManager.state.troops) : this.report.troopsSent;
    Object.keys(playerTroops).forEach(type => {
      if (type === 'spy') return;
      const count = playerTroops[type] || 0;
      for (let c = 0; c < Math.min(count, 5); c++) {
        const stats = TROOPS_CONFIG[type]?.stats || {};
        let troopAttackMult = 1.0;
        if (this.stateManager.getGearSetBonus) {
          troopAttackMult += this.stateManager.getGearSetBonus('troop_attack');
          if (type === 'spearman') {
            troopAttackMult += this.stateManager.getGearSetBonus('spearman_power');
          }
        }

        this.units.push({
          id: `player_${type}_${playerIdx++}`,
          type: type,
          side: 'player',
          x: Math.floor(playerIdx % 2),
          y: Math.floor(playerIdx % this.gridHeight),
          hp: 100,
          maxHp: 100,
          meleeAtk: Math.round((stats.attackMelee || 10) * troopAttackMult),
          rangeAtk: Math.round((stats.attackRanged || 0) * troopAttackMult),
          meleeDef: stats.defenseMelee || 10,
          rangeDef: stats.defenseRanged || 10,
          movedThisTurn: false,
          actedThisTurn: false,
          shieldWallActive: false,
          fireArrowCooldown: 0,
          chargeCooldown: 0,
          hasBurnEffect: 0
        });
      }
    });

    // Gegner-Einheiten aufstellen (Rechts, Spalten 6-7)
    let enemyIdx = 0;
    const enemyTroops = this.isDefense ? (this.report.troopsSent) : (this.report.defenders || { spearman: 4, bowman: 2 });
    Object.keys(enemyTroops).forEach(type => {
      const count = enemyTroops[type] || 0;
      for (let c = 0; c < Math.min(count, 5); c++) {
        const stats = TROOPS_CONFIG[type]?.stats || {};
        this.units.push({
          id: `enemy_${type}_${enemyIdx++}`,
          type: type,
          side: 'enemy',
          x: Math.floor(7 - (enemyIdx % 2)),
          y: Math.floor(enemyIdx % this.gridHeight),
          hp: 100,
          maxHp: 100,
          meleeAtk: stats.attackMelee || 10,
          rangeAtk: stats.attackRanged || 0,
          meleeDef: stats.defenseMelee || 10,
          rangeDef: stats.defenseRanged || 10,
          movedThisTurn: false,
          actedThisTurn: false,
          shieldWallActive: false,
          fireArrowCooldown: 0,
          chargeCooldown: 0,
          hasBurnEffect: 0
        });
      }
    });

    // Fallback falls keine Einheiten da sind
    if (this.units.filter(u => u.side === 'player').length === 0) {
      this.units.push({ id: 'player_fallback', type: 'spearman', side: 'player', x: 0, y: 2, hp: 100, maxHp: 100, meleeAtk: 10, rangeAtk: 0, meleeDef: 15, rangeDef: 15, movedThisTurn: false, actedThisTurn: false, shieldWallActive: false, fireArrowCooldown: 0, chargeCooldown: 0, hasBurnEffect: 0 });
    }
    if (this.units.filter(u => u.side === 'enemy').length === 0) {
      this.units.push({ id: 'enemy_fallback', type: 'spearman', side: 'enemy', x: 7, y: 2, hp: 100, maxHp: 100, meleeAtk: 10, rangeAtk: 0, meleeDef: 15, rangeDef: 15, movedThisTurn: false, actedThisTurn: false, shieldWallActive: false, fireArrowCooldown: 0, chargeCooldown: 0, hasBurnEffect: 0 });
    }
  }

  update() {
    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      const dx = p.targetX - p.x;
      const dy = p.targetY - p.y;
      const dist = Math.hypot(dx, dy);
      if (dist < 4) {
        p.onHit();
        this.projectiles.splice(i, 1);
      } else {
        p.x += (dx / dist) * p.speed;
        p.y += (dy / dist) * p.speed;
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= ft.decay;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  spawnFloatingText(text, x, y, color = '#ffffff') {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -0.6 - Math.random() * 0.3,
      alpha: 1.0,
      decay: 0.02,
      color
    });
  }

  gridToScreenCoords(gx, gy) {
    const startX = this.canvas.width / 2;
    const startY = 60;
    return {
      x: startX + (gx - gy) * (this.tileWidth / 2),
      y: startY + (gx + gy) * (this.tileHeight / 2) + this.tileHeight / 2
    };
  }

  // Zeichnet das isometrische Runden-Spielfeld
  draw() {
    this.update();
    this.animationTime += 0.016;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Hintergrund-Gras
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const startX = this.canvas.width / 2;
    const startY = 60;

    // Hilfsfunktion: Grid-Koordinaten zu Bildschirm-Koordinaten
    const gridToScreen = (gx, gy) => {
      const rx = startX + (gx - gy) * (this.tileWidth / 2);
      const ry = startY + (gx + gy) * (this.tileHeight / 2);
      return { x: rx, y: ry };
    };

    // Zeichne Grid-Kacheln
    for (let gx = 0; gx < this.gridWidth; gx++) {
      for (let gy = 0; gy < this.gridHeight; gy++) {
        const pos = gridToScreen(gx, gy);

        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(pos.x + this.tileWidth / 2, pos.y + this.tileHeight / 2);
        ctx.lineTo(pos.x, pos.y + this.tileHeight);
        ctx.lineTo(pos.x - this.tileWidth / 2, pos.y + this.tileHeight / 2);
        ctx.closePath();

        // Färbe Kachel, wenn Einheit ausgewählt ist
        let isReachable = false;
        if (this.selectedUnit && this.turn === 'player' && this.selectedUnit.side === 'player') {
          const dist = Math.abs(this.selectedUnit.x - gx) + Math.abs(this.selectedUnit.y - gy);
          if (dist === 1 && !this.selectedUnit.movedThisTurn) {
            isReachable = true;
          }
        }

        ctx.fillStyle = isReachable ? 'rgba(241, 196, 15, 0.4)' : ((gx + gy) % 2 === 0 ? '#2ecc71' : '#27ae60');
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.stroke();
      }
    }

    // Zeichne Hindernisse
    this.obstacles.forEach(o => {
      const pos = gridToScreen(o.x, o.y);
      if (o.type === 'rock') {
        ctx.fillStyle = '#7f8c8d';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y + this.tileHeight / 2, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (o.type === 'wall') {
        // Draw stone wall block isometrically
        ctx.fillStyle = '#95a5a6';
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y + this.tileHeight / 4);
        ctx.lineTo(pos.x + this.tileWidth / 2, pos.y + this.tileHeight / 2);
        ctx.lineTo(pos.x, pos.y + (3 * this.tileHeight) / 4);
        ctx.lineTo(pos.x - this.tileWidth / 2, pos.y + this.tileHeight / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.lineWidth = 1;
      } else {
        ctx.fillStyle = '#1e824c';
        ctx.beginPath();
        ctx.arc(pos.x - 3, pos.y + this.tileHeight / 2, 9, 0, Math.PI * 2);
        ctx.arc(pos.x + 3, pos.y + this.tileHeight / 2, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Zeichne Einheiten
    this.units.forEach(u => {
      if (u.hp <= 0) return;
      const pos = gridToScreen(u.x, u.y);

      // Auswahl-Ring
      if (this.selectedUnit && this.selectedUnit.id === u.id) {
        ctx.strokeStyle = '#f1c40f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y + this.tileHeight / 2, 12, 6, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Körper darstellen
      ctx.fillStyle = u.side === 'player' ? '#3498db' : '#e74c3c';
      if (u.isHero) {
        ctx.fillStyle = '#9b59b6';
      }
      ctx.beginPath();
      ctx.arc(pos.x, pos.y + this.tileHeight / 2 - 10, u.isHero ? 8 : 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = u.isHero ? '#d4af37' : '#000';
      ctx.lineWidth = u.isHero ? 2 : 1;
      ctx.stroke();
      ctx.lineWidth = 1; // Reset

      // Effect markers
      if (u.shieldWallActive) {
        ctx.strokeStyle = '#3498db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y + this.tileHeight / 2 - 10, u.isHero ? 11 : 9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
      }
      if (u.hasBurnEffect > 0) {
        ctx.fillStyle = '#e67e22';
        ctx.font = '10px Arial';
        ctx.fillText('🔥', pos.x + 8, pos.y - 8);
      }

      // HP-Balken
      const hpWidth = 20;
      ctx.fillStyle = '#c0392b';
      ctx.fillRect(pos.x - hpWidth / 2, pos.y - 12, hpWidth, 3);
      ctx.fillStyle = '#2ecc71';
      ctx.fillRect(pos.x - hpWidth / 2, pos.y - 12, hpWidth * (u.hp / u.maxHp), 3);

      // Label (Klasse)
      ctx.fillStyle = '#fff';
      ctx.font = '8px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(u.isHero ? 'HELD' : u.type.toUpperCase(), pos.x, pos.y - 4);
    });

    // Zeichne Projektile
    this.projectiles.forEach(p => {
      ctx.save();
      ctx.fillStyle = p.type === 'rock' ? '#7f8c8d' : '#e67e22';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.type === 'rock' ? 4 : 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Zeichne Floating Texts
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 11px Arial';
    this.floatingTexts.forEach(ft => {
      ctx.globalAlpha = ft.alpha;
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2.5;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
    });
    ctx.restore();

    this.drawInterface();
  }

  drawInterface() {
    const ctx = this.ctx;
    // Log-Leiste unten zeichnen
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, this.canvas.height - 70, this.canvas.width, 70);

    ctx.fillStyle = '#fff';
    ctx.font = '10px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Logs:', 10, this.canvas.height - 55);

    const showLogs = this.actionLogs.slice(-3);
    showLogs.forEach((log, idx) => {
      ctx.fillText(log, 15, this.canvas.height - 40 + idx * 12);
    });

    // Draw Selected Unit Ability button
    if (this.selectedUnit && this.selectedUnit.side === 'player' && !this.selectedUnit.actedThisTurn && this.selectedUnit.hp > 0) {
      if (this.selectedUnit.isHero) {
        // Draw up to 3 hero abilities if learned!
        const skills = this.selectedUnit.skills || {};
        this.heroAbilities = [];
        let index = 0;

        if (skills.combat_heal > 0) {
          this.heroAbilities.push({
            id: 'heal',
            name: 'Heilung',
            isReady: this.selectedUnit.healCooldown === 0,
            x: 120 + index * 95,
            y: this.canvas.height - 45,
            w: 90,
            h: 22
          });
          index++;
        }
        if (skills.combat_whirlwind > 0) {
          this.heroAbilities.push({
            id: 'whirlwind',
            name: 'Wirbelwind',
            isReady: this.selectedUnit.whirlwindCooldown === 0,
            x: 120 + index * 95,
            y: this.canvas.height - 45,
            w: 90,
            h: 22
          });
          index++;
        }
        if (skills.combat_taunt > 0) {
          this.heroAbilities.push({
            id: 'taunt',
            name: 'Göttl. Schild',
            isReady: this.selectedUnit.tauntCooldown === 0,
            x: 120 + index * 95,
            y: this.canvas.height - 45,
            w: 90,
            h: 22
          });
          index++;
        }

        this.heroAbilities.forEach(ab => {
          ctx.fillStyle = ab.isReady ? '#8e44ad' : '#7f8c8d';
          ctx.strokeStyle = '#d4af37';
          ctx.lineWidth = 1;
          ctx.fillRect(ab.x, ab.y, ab.w, ab.h);
          ctx.strokeRect(ab.x, ab.y, ab.w, ab.h);

          ctx.fillStyle = '#fff';
          ctx.font = 'bold 9px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ab.name, ab.x + ab.w / 2, ab.y + ab.h / 2);
          ctx.textBaseline = 'alphabetic';
        });
      } else {
        // Normal unit abilities
        let abilityName = "";
        let isReady = false;

        if (this.selectedUnit.type === 'spearman') {
          abilityName = "Schildwall";
          isReady = !this.selectedUnit.shieldWallActive;
        } else if (this.selectedUnit.type === 'bowman') {
          abilityName = "Brandpfeil";
          isReady = this.selectedUnit.fireArrowCooldown === 0;
        } else if (this.selectedUnit.type === 'knight') {
          abilityName = "Ansturm";
          isReady = this.selectedUnit.chargeCooldown === 0;
        }

        if (abilityName) {
          this.abilityBtnArea = { x: 120, y: this.canvas.height - 45, w: 90, h: 22 };
          ctx.fillStyle = isReady ? '#2e7d32' : '#7f8c8d';
          ctx.strokeStyle = '#d4af37';
          ctx.lineWidth = 1;
          ctx.fillRect(this.abilityBtnArea.x, this.abilityBtnArea.y, this.abilityBtnArea.w, this.abilityBtnArea.h);
          ctx.strokeRect(this.abilityBtnArea.x, this.abilityBtnArea.y, this.abilityBtnArea.w, this.abilityBtnArea.h);

          ctx.fillStyle = '#fff';
          ctx.font = 'bold 9px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(abilityName, this.abilityBtnArea.x + this.abilityBtnArea.w / 2, this.abilityBtnArea.y + this.abilityBtnArea.h / 2);
          ctx.textBaseline = 'alphabetic';
        }
      }
    } else {
      this.abilityBtnArea = null;
      this.heroAbilities = null;
    }

    // Runden-Anzeige & Button
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(this.turn === 'player' ? 'Deine Runde' : 'Gegner-Runde...', this.canvas.width - 20, this.canvas.height - 45);
  }

  setupMouseListeners() {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Click on Ability Button
      if (this.turn === 'player' && this.abilityBtnArea &&
          clickX >= this.abilityBtnArea.x && clickX < this.abilityBtnArea.x + this.abilityBtnArea.w &&
          clickY >= this.abilityBtnArea.y && clickY < this.abilityBtnArea.y + this.abilityBtnArea.h) {
        this.useSelectedUnitAbility();
        return;
      }

      // Click on Hero Ability Buttons
      if (this.turn === 'player' && this.selectedUnit && this.selectedUnit.isHero && this.heroAbilities) {
        const abClicked = this.heroAbilities.find(ab => 
          clickX >= ab.x && clickX < ab.x + ab.w &&
          clickY >= ab.y && clickY < ab.y + ab.h
        );
        if (abClicked) {
          this.useHeroAbility(abClicked.id);
          return;
        }
      }

      if (this.turn !== 'player') return;

      const startX = this.canvas.width / 2;
      const startY = 60;

      // Finde die angeklickte Grid-Kachel
      let selectedTile = null;
      let minDist = 9999;

      for (let gx = 0; gx < this.gridWidth; gx++) {
        for (let gy = 0; gy < this.gridHeight; gy++) {
          const rx = startX + (gx - gy) * (this.tileWidth / 2);
          const ry = startY + (gx + gy) * (this.tileHeight / 2) + this.tileHeight / 2;

          const dist = Math.hypot(clickX - rx, clickY - ry);
          if (dist < minDist && dist < 24) {
            minDist = dist;
            selectedTile = { x: gx, y: gy };
          }
        }
      }

      if (selectedTile) {
        this.handleTileClick(selectedTile.x, selectedTile.y);
      }
    });
  }

  useSelectedUnitAbility() {
    const u = this.selectedUnit;
    if (!u || u.actedThisTurn || u.side !== 'player' || u.hp <= 0) return;

    if (u.type === 'spearman') {
      u.shieldWallActive = true;
      u.meleeDef = Math.round(u.meleeDef * 1.5);
      u.rangeDef = Math.round(u.rangeDef * 1.5);
      u.actedThisTurn = true;
      u.movedThisTurn = true;
      const pos = this.gridToScreenCoords(u.x, u.y);
      this.spawnFloatingText("Schildwall! 🛡️", pos.x, pos.y - 25, '#3498db');
      this.actionLogs.push("Speerwerfer aktiviert Schildwall (+50% Abwehr).");
    } else if (u.type === 'bowman' && u.fireArrowCooldown === 0) {
      u.fireArrowCooldown = 3;
      u.nextAttackIsFire = true;
      const pos = this.gridToScreenCoords(u.x, u.y);
      this.spawnFloatingText("Brandpfeil! 🔥", pos.x, pos.y - 25, '#e67e22');
      this.actionLogs.push("Bogenschütze bereitet Brandpfeil vor.");
    } else if (u.type === 'knight' && u.chargeCooldown === 0) {
      u.chargeCooldown = 3;
      u.nextAttackIsCharge = true;
      const pos = this.gridToScreenCoords(u.x, u.y);
      this.spawnFloatingText("Ansturm! ⚡", pos.x, pos.y - 25, '#f1c40f');
      this.actionLogs.push("Ritter bereitet Ansturm vor (+50% Schaden).");
    }
    this.draw();
  }

  useHeroAbility(abilityId) {
    const u = this.selectedUnit;
    if (!u || u.actedThisTurn || !u.isHero || u.hp <= 0) return;

    if (abilityId === 'heal') {
      u.healCooldown = 3;
      u.actedThisTurn = true;
      u.movedThisTurn = true;
      // Heal self and adjacent allies
      this.units.forEach(all => {
        if (all.side === 'player' && all.hp > 0 && Math.abs(all.x - u.x) + Math.abs(all.y - u.y) <= 1) {
          all.hp = Math.min(all.maxHp, all.hp + 40);
          const pos = this.gridToScreenCoords(all.x, all.y);
          this.spawnFloatingText("+40 HP 💚", pos.x, pos.y - 15, '#2ecc71');
        }
      });
      this.actionLogs.push("Held wirkt Heiliges Licht (+40 HP).");
    } else if (abilityId === 'whirlwind') {
      u.whirlwindCooldown = 3;
      u.actedThisTurn = true;
      u.movedThisTurn = true;
      // Deal 20 AoE damage to all adjacent enemies
      this.units.forEach(enemy => {
        if (enemy.side === 'enemy' && enemy.hp > 0 && Math.abs(enemy.x - u.x) + Math.abs(enemy.y - u.y) <= 1) {
          enemy.hp = Math.max(0, enemy.hp - 20);
          const pos = this.gridToScreenCoords(enemy.x, enemy.y);
          this.spawnFloatingText("-20 HP ⚔️", pos.x, pos.y - 15, '#e74c3c');
          if (enemy.hp <= 0) {
            this.actionLogs.push(`${enemy.type} besiegt!`);
          }
        }
      });
      this.actionLogs.push("Held entfesselt Klingensturm! AoE-Schaden.");
    } else if (abilityId === 'taunt') {
      u.tauntCooldown = 3;
      u.shieldWallActive = true;
      u.meleeDef += 30;
      u.rangeDef += 30;
      u.actedThisTurn = true;
      u.movedThisTurn = true;
      const pos = this.gridToScreenCoords(u.x, u.y);
      this.spawnFloatingText("Göttlicher Schild! 🛡️", pos.x, pos.y - 25, '#9b59b6');
      this.actionLogs.push("Held zündet Göttlichen Schild (+30 Def).");
    }
    this.draw();
  }

  handleTileClick(x, y) {
    const obstacle = this.obstacles.find(o => o.x === x && o.y === y);
    if (obstacle && (obstacle.type === 'rock' || obstacle.type === 'wall')) {
      if (this.selectedUnit && this.selectedUnit.type === 'ram' && !this.selectedUnit.actedThisTurn) {
        const dist = Math.abs(this.selectedUnit.x - x) + Math.abs(this.selectedUnit.y - y);
        if (dist === 1) {
          const idx = this.obstacles.indexOf(obstacle);
          if (idx !== -1) {
            this.obstacles.splice(idx, 1);
            this.selectedUnit.actedThisTurn = true;
            this.selectedUnit.movedThisTurn = true;
            const pos = this.gridToScreenCoords(x, y);
            this.spawnFloatingText("💥 Zerstört!", pos.x, pos.y - 15, '#e67e22');
            this.actionLogs.push(`Rammbock zerstört Hindernis bei (${x}, ${y})!`);
            this.draw();
          }
          return;
        }
      }
      return;
    }

    const unitOnTile = this.units.find(u => u.x === x && u.y === y && u.hp > 0);

    if (unitOnTile) {
      if (unitOnTile.side === 'player') {
        const activeUnit = this.units[this.activeUnitIndex];
        if (activeUnit && unitOnTile.id === activeUnit.id) {
          this.selectedUnit = unitOnTile;
          this.actionLogs.push(`Einheit ausgewählt: ${unitOnTile.type}`);
        } else {
          this.actionLogs.push(`Nicht am Zug! Aktiv: ${activeUnit ? activeUnit.type.toUpperCase() : 'Niemand'}`);
        }
      } else if (this.selectedUnit && !this.selectedUnit.actedThisTurn && this.selectedUnit.id === this.units[this.activeUnitIndex]?.id) {
        // Angriff auf gegnerische Einheit
        this.attackUnit(this.selectedUnit, unitOnTile);
      }
    } else if (this.selectedUnit && !this.selectedUnit.movedThisTurn) {
      // Bewegung auf leere Kachel
      const dist = Math.abs(this.selectedUnit.x - x) + Math.abs(this.selectedUnit.y - y);
      const maxMoveDist = this.selectedUnit.nextAttackIsCharge ? 2 : 1;
      if (dist <= maxMoveDist) {
        this.selectedUnit.x = x;
        this.selectedUnit.y = y;
        this.selectedUnit.movedThisTurn = true;
        this.actionLogs.push(`${this.selectedUnit.type} bewegt.`);
      }
    }
    this.checkVictoryConditions();
    this.draw();
  }

  attackUnit(attacker, defender) {
    const dist = Math.abs(attacker.x - defender.x) + Math.abs(attacker.y - defender.y);

    let isRangeAttack = attacker.rangeAtk > 0;
    const maxRange = attacker.type === 'catapult' ? 4 : 3;
    if (isRangeAttack && dist > maxRange) {
      this.actionLogs.push('Ziel außer Reichweite für Fernkampf!');
      return;
    }
    if (!isRangeAttack && dist > 1) {
      this.actionLogs.push('Ziel zu weit weg für Nahkampf!');
      return;
    }

    attacker.actedThisTurn = true;

    // Schaden berechnen
    let damage = isRangeAttack ? attacker.rangeAtk : attacker.meleeAtk;
    if (attacker.nextAttackIsCharge) {
      damage = Math.round(damage * 1.5);
      attacker.nextAttackIsCharge = false;
    }

    const defense = isRangeAttack ? defender.rangeDef : defender.meleeDef;

    // Deckung durch Gebüsch?
    const hasCover = this.obstacles.some(o => o.x === defender.x && o.y === defender.y && o.type === 'bush');
    let finalDamageMult = 1.0;
    if (hasCover && isRangeAttack) {
      finalDamageMult *= 0.6;
      this.actionLogs.push('Ziel im Gebüsch! Schadensreduktion.');
    }

    // Fels-Adjazenzverteidigung (+20% Defense) oder Mauer-Adjazenzverteidigung (+35% Defense)
    const isNearRock = this.obstacles.some(o => o.type === 'rock' && Math.abs(o.x - defender.x) + Math.abs(o.y - defender.y) === 1);
    const isNearWall = this.obstacles.some(o => o.type === 'wall' && Math.abs(o.x - defender.x) + Math.abs(o.y - defender.y) === 1);
    
    let finalDefense = defense;
    if (isNearWall) {
      finalDefense = Math.round(defense * 1.35);
    } else if (isNearRock) {
      finalDefense = Math.round(defense * 1.2);
    }

    let netDamage = Math.max(5, Math.round((damage - finalDefense * 0.2) * finalDamageMult));

    const applyDamage = () => {
      defender.hp -= netDamage;
      const defPos = this.gridToScreenCoords(defender.x, defender.y);
      this.spawnFloatingText(`-${netDamage}`, defPos.x, defPos.y - 15, '#e74c3c');

      this.actionLogs.push(`${attacker.type} trifft ${defender.type} für -${netDamage} HP.`);

      if (attacker.type === 'catapult') {
        this.units.forEach(u => {
          if (u !== defender && u.side === defender.side && u.hp > 0) {
            const adjDist = Math.abs(u.x - defender.x) + Math.abs(u.y - defender.y);
            if (adjDist === 1) {
              const aoeDmg = Math.round(netDamage * 0.4);
              u.hp = Math.max(0, u.hp - aoeDmg);
              const uPos = this.gridToScreenCoords(u.x, u.y);
              this.spawnFloatingText(`-${aoeDmg}`, uPos.x, uPos.y - 15, '#e74c3c');
              this.actionLogs.push(`Katapult-AoE trifft ${u.type} für -${aoeDmg} HP.`);
              if (u.hp <= 0) {
                u.hp = 0;
                this.actionLogs.push(`${u.type} besiegt!`);
              }
            }
          }
        });
      }

      if (attacker.nextAttackIsFire) {
        defender.hasBurnEffect = 2;
        attacker.nextAttackIsFire = false;
        this.actionLogs.push(`${defender.type} wurde in Brand gesteckt! 🔥`);
      }

      if (defender.hp <= 0) {
        defender.hp = 0;
        this.actionLogs.push(`${defender.type} besiegt!`);
      }

      // Speer-Konter-Mechanik
      if (!isRangeAttack && defender.type === 'spearman' && defender.hp > 0) {
        const counterDmg = Math.round(defender.meleeAtk * 0.4);
        attacker.hp -= counterDmg;
        const attPos = this.gridToScreenCoords(attacker.x, attacker.y);
        this.spawnFloatingText(`-${counterDmg}`, attPos.x, attPos.y - 15, '#e74c3c');
        this.actionLogs.push(`Speer-Konter! Angreifer erleidet -${counterDmg} HP.`);
        if (attacker.hp <= 0) {
          attacker.hp = 0;
          this.actionLogs.push(`${attacker.type} durch Konter gestorben!`);
        }
      }
      this.checkVictoryConditions();
    };

    if (isRangeAttack) {
      // Ranged projectile travel animation
      const startPos = this.gridToScreenCoords(attacker.x, attacker.y);
      const endPos = this.gridToScreenCoords(defender.x, defender.y);
      this.projectiles.push({
        type: attacker.type === 'catapult' ? 'rock' : 'arrow',
        x: startPos.x,
        y: startPos.y - 10,
        targetX: endPos.x,
        targetY: endPos.y - 10,
        speed: 5.0,
        onHit: applyDamage
      });
      this.actionLogs.push(`${attacker.type} feuert Projektil ab...`);
    } else {
      applyDamage();
    }
  }

  endTurn() {
    this.actionLogs.push(`Zug von ${this.selectedUnit?.type.toUpperCase()} beendet.`);
    this.nextTurn();
  }

  nextTurn() {
    const u = this.units[this.activeUnitIndex];
    if (u) {
      if (u.fireArrowCooldown > 0) u.fireArrowCooldown--;
      if (u.chargeCooldown > 0) u.chargeCooldown--;
      if (u.isHero) {
        if (u.healCooldown > 0) u.healCooldown--;
        if (u.whirlwindCooldown > 0) u.whirlwindCooldown--;
        if (u.tauntCooldown > 0) u.tauntCooldown--;
      }
      if (u.shieldWallActive) {
        u.shieldWallActive = false;
        if (u.isHero) {
          u.meleeDef -= 30;
          u.rangeDef -= 30;
        } else {
          u.meleeDef = Math.round(u.meleeDef / 1.5);
          u.rangeDef = Math.round(u.rangeDef / 1.5);
        }
      }
    }

    this.activeUnitIndex = (this.activeUnitIndex + 1) % this.units.length;
    this.checkVictoryConditions();
    if (this.active) {
      this.startNextUnitTurn();
    }
  }

  startNextUnitTurn() {
    let loops = 0;
    while (loops < this.units.length) {
      const u = this.units[this.activeUnitIndex];
      if (u && u.hp > 0) {
        this.selectedUnit = u;
        if (u.side === 'player') {
          this.turn = 'player';
          this.actionLogs.push(`Deine Runde! Steuere: ${u.type.toUpperCase()} (Init: ${u.initiative})`);
          u.movedThisTurn = false;
          u.actedThisTurn = false;

          // Wachtürme schießen sofort bei Rundenbeginn
          if (u.isTower) {
            this.runTowerAI(u);
            return;
          }

          if (u.hasBurnEffect > 0) {
            u.hp = Math.max(0, u.hp - 10);
            const pos = this.gridToScreenCoords(u.x, u.y);
            this.spawnFloatingText("-10 Burn 🔥", pos.x, pos.y - 15, '#e67e22');
            u.hasBurnEffect--;
            this.actionLogs.push(`${u.type} erleidet ${u.hasBurnEffect > 0 ? 'weiteren ' : ''}Brandschaden.`);
            if (u.hp <= 0) {
              u.hp = 0;
              this.actionLogs.push(`${u.type} durch Feuer gestorben!`);
              setTimeout(() => this.nextTurn(), 800);
              return;
            }
          }
        } else {
          this.turn = 'enemy';
          this.actionLogs.push(`Gegner am Zug: ${u.type.toUpperCase()} (Init: ${u.initiative})`);
          u.movedThisTurn = false;
          u.actedThisTurn = false;

          if (u.hasBurnEffect > 0) {
            u.hp = Math.max(0, u.hp - 10);
            const pos = this.gridToScreenCoords(u.x, u.y);
            this.spawnFloatingText("-10 Burn 🔥", pos.x, pos.y - 15, '#e67e22');
            u.hasBurnEffect--;
            this.actionLogs.push(`Feindlicher ${u.type} erleidet Brandschaden.`);
            if (u.hp <= 0) {
              u.hp = 0;
              this.actionLogs.push(`Feindlicher ${u.type} durch Feuer gestorben!`);
              setTimeout(() => this.nextTurn(), 800);
              return;
            }
          }
          setTimeout(() => this.runSingleEnemyAI(u), 1000);
        }
        this.draw();
        return;
      }
      this.activeUnitIndex = (this.activeUnitIndex + 1) % this.units.length;
      loops++;
    }
  }

  runTowerAI(u) {
    let target = null;
    let minDist = 99;
    this.units.forEach(enemy => {
      if (enemy.side === 'enemy' && enemy.hp > 0) {
        const d = Math.abs(u.x - enemy.x) + Math.abs(u.y - enemy.y);
        if (d < minDist) {
          minDist = d;
          target = enemy;
        }
      }
    });

    if (target && minDist <= 4) {
      const dmg = u.rangeAtk;
      target.hp = Math.max(0, target.hp - dmg);
      const startPos = this.gridToScreenCoords(u.x, u.y);
      const endPos = this.gridToScreenCoords(target.x, target.y);

      this.projectiles.push({
        type: 'arrow',
        x: startPos.x,
        y: startPos.y - 10,
        targetX: endPos.x,
        targetY: endPos.y - 10,
        speed: 5.0,
        onHit: () => {
          const pos = this.gridToScreenCoords(target.x, target.y);
          this.spawnFloatingText(`-${dmg}`, pos.x, pos.y - 15, '#e74c3c');
          this.actionLogs.push(`Wachturm schießt auf ${target.type} für -${dmg} HP.`);
          if (target.hp <= 0) {
            target.hp = 0;
            this.actionLogs.push(`${target.type} besiegt!`);
          }
          setTimeout(() => this.nextTurn(), 800);
        }
      });
    } else {
      this.actionLogs.push('Keine Gegner in Turmreichweite.');
      setTimeout(() => this.nextTurn(), 500);
    }
  }

  runSingleEnemyAI(e) {
    if (e.hp <= 0) {
      this.nextTurn();
      return;
    }
    const players = this.units.filter(u => u.side === 'player' && u.hp > 0);
    if (players.length === 0) return;

    // Finde nächsten Spieler
    let target = null;
    let minDist = 99;
    players.forEach(p => {
      const d = Math.abs(e.x - p.x) + Math.abs(e.y - p.y);
      if (d < minDist) {
        minDist = d;
        target = p;
      }
    });

    if (target) {
      if (minDist === 1) {
        this.attackUnit(e, target);
      } else {
        const dx = Math.sign(target.x - e.x);
        const dy = Math.sign(target.y - e.y);

        if (dx !== 0 && !this.obstacles.some(o => o.x === e.x + dx && o.y === e.y && o.type === 'rock')) {
          e.x += dx;
        } else if (dy !== 0 && !this.obstacles.some(o => o.x === e.x && o.y === e.y + dy && o.type === 'rock')) {
          e.y += dy;
        }

        const newDist = Math.abs(e.x - target.x) + Math.abs(e.y - target.y);
        if (newDist === 1) {
          this.attackUnit(e, target);
        }
      }
    }
    setTimeout(() => this.nextTurn(), 800);
  }

  checkVictoryConditions() {
    const playerAlive = this.units.some(u => u.side === 'player' && u.hp > 0);
    const enemyAlive = this.units.some(u => u.side === 'enemy' && u.hp > 0);

    if (!playerAlive) {
      this.actionLogs.push('Schlacht verloren!');
      this.active = false;
      setTimeout(() => {
        this.report.victory = false;
        this.callback();
      }, 1500);
    } else if (!enemyAlive) {
      this.actionLogs.push('Sieg! Alle Feinde vernichtet.');
      this.active = false;
      setTimeout(() => {
        this.report.victory = true;
        this.callback();
      }, 1500);
    }
  }

  useCard(cardId) {
    if (this.turn !== 'player') return false;
    
    const cards = this.stateManager.state.battleCards;
    if (!cards || !cards[cardId] || cards[cardId] <= 0) return false;

    if (cardId === 'heal') {
      let healedCount = 0;
      this.units.forEach(u => {
        if (u.side === 'player' && u.hp > 0) {
          const healAmount = Math.min(25, u.maxHp - u.hp);
          if (healAmount > 0) {
            u.hp += healAmount;
            healedCount++;
            const pos = this.gridToScreenCoords(u.x, u.y);
            this.spawnFloatingText("+25 HP 💚", pos.x, pos.y - 15, '#2ecc71');
          }
        }
      });
      this.actionLogs.push(`💚 Heilungs-Karte ausgespielt! ${healedCount} Einheiten um +25 HP geheilt.`);
    } else if (cardId === 'shield') {
      this.units.forEach(u => {
        if (u.side === 'player' && u.hp > 0) {
          u.meleeDef += 10;
          u.rangeDef += 10;
          const pos = this.gridToScreenCoords(u.x, u.y);
          this.spawnFloatingText("+10 Def 🛡️", pos.x, pos.y - 15, '#3498db');
        }
      });
      this.actionLogs.push(`🛡️ Schildwall-Karte ausgespielt! +10 Abwehr für alle eigenen Einheiten.`);
    } else if (cardId === 'arrow') {
      let hitCount = 0;
      this.units.forEach(u => {
        if (u.side === 'enemy' && u.hp > 0) {
          u.hp = Math.max(0, u.hp - 30);
          hitCount++;
          const pos = this.gridToScreenCoords(u.x, u.y);
          this.spawnFloatingText("-30 HP 🏹", pos.x, pos.y - 15, '#e74c3c');
        }
      });
      this.units = this.units.filter(u => u.hp > 0);
      this.actionLogs.push(`🏹 Pfeilhagel-Karte ausgespielt! Dealte 30 Schaden an ${hitCount} feindlichen Einheiten.`);
    } else if (cardId === 'sp_meteor') {
      let hitCount = 0;
      this.units.forEach(u => {
        if (u.side === 'enemy' && u.hp > 0) {
          u.hp = Math.max(0, u.hp - 45);
          hitCount++;
          const pos = this.gridToScreenCoords(u.x, u.y);
          this.spawnFloatingText("-45 HP ☄️", pos.x, pos.y - 15, '#e67e22');
        }
      });
      this.units = this.units.filter(u => u.hp > 0);
      this.actionLogs.push(`☄️ Meteorregen-Zauber gewirkt! 🔥 45 Flächenschaden an ${hitCount} Feinden.`);
    } else if (cardId === 'sp_blessing') {
      this.units.forEach(u => {
        if (u.side === 'player' && u.hp > 0) {
          u.hp = Math.min(u.maxHp, u.hp + 40);
          u.meleeAtk = Math.round(u.meleeAtk * 1.15);
          const pos = this.gridToScreenCoords(u.x, u.y);
          this.spawnFloatingText("+40 HP 🌟", pos.x, pos.y - 15, '#f1c40f');
        }
      });
      this.actionLogs.push(`🌟 Königlicher Segen gewirkt! +40 HP & +15% Angriff für alle Truppen.`);
    } else if (cardId === 'sp_mist') {
      this.units.forEach(u => {
        if (u.side === 'player' && u.hp > 0) {
          u.meleeDef += 15;
          u.rangeDef += 15;
          const pos = this.gridToScreenCoords(u.x, u.y);
          this.spawnFloatingText("+15 Def 🌫️", pos.x, pos.y - 15, '#95a5a6');
        }
      });
      this.actionLogs.push(`🌫️ Nebelhülle gewirkt! +15 Abwehr auf alle eigenen Soldaten.`);
    }

    this.stateManager.state.battleCards[cardId]--;
    this.stateManager.save();
    
    this.draw();
    this.checkVictoryConditions();
    return true;
  }
}

// Global hook in raids.js
window.TacticalCombat = TacticalCombat;
