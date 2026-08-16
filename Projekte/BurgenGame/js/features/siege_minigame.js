// --- ACTIVE CASTLE SIEGE DEFENSE MINIGAME ---

class SiegeMinigame {
  constructor(stateManager, ui, canvasManager) {
    this.stateManager = stateManager;
    this.ui = ui;
    this.canvasManager = canvasManager;

    this.active = false;
    this.wave = 1;
    this.maxWaves = 3;
    this.score = 0;
    this.enemies = [];
    this.traps = []; // { id, type, x, y, readyTime, cooldown }
    this.defenders = [];
    this.lastTick = Date.now();
    this.intervalId = null;
  }

  init() {
    if (!this.stateManager.state.siegeMinigame) {
      this.stateManager.state.siegeMinigame = {
        highScore: 0,
        totalDefended: 0,
        unlockedTraps: ['ballista', 'boiling_oil']
      };
    }
  }

  startSiege(waveCount = 3, enemyStrengthMultiplier = 1.0) {
    this.active = true;
    this.wave = 1;
    this.maxWaves = waveCount;
    this.score = 0;
    this.enemies = [];
    this.traps = [];
    this.spawnWave(enemyStrengthMultiplier);

    if (window.SoundManager) {
      window.SoundManager.playModalOpen();
    }

    this.renderSiegeOverlay();
    
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.updateLoop(), 1000);

    this.ui.showToast(`🛡️ BELAGERUNG BEGONNEN! Welle 1 von ${this.maxWaves} greift die Burg an!`, 'warning');
  }

  spawnWave(strengthMult = 1.0) {
    const count = Math.floor((4 + this.wave * 3) * strengthMult);
    this.enemies = [];
    
    const unitTypes = ['raider', 'arsonist', 'ram'];
    for (let i = 0; i < count; i++) {
      const type = unitTypes[Math.floor(Math.random() * (this.wave === 1 ? 1 : this.wave === 2 ? 2 : 3))];
      this.enemies.push({
        id: `enemy_${Date.now()}_${i}`,
        type: type,
        hp: type === 'ram' ? 120 : type === 'arsonist' ? 45 : 60,
        maxHp: type === 'ram' ? 120 : type === 'arsonist' ? 45 : 60,
        speed: type === 'arsonist' ? 1.5 : 1.0,
        damage: type === 'ram' ? 25 : 10,
        progress: 0 // 0 to 100% path towards keep
      });
    }
  }

  triggerTrap(trapType) {
    if (!this.active) return;

    if (trapType === 'boiling_oil') {
      let hitCount = 0;
      this.enemies.forEach(enemy => {
        if (enemy.progress > 20 && enemy.progress < 70) {
          enemy.hp -= 40;
          hitCount++;
        }
      });
      this.enemies = this.enemies.filter(e => e.hp > 0);
      this.score += hitCount * 20;
      this.ui.showToast(`🛢️ Siedendes Öl gegossen! ${hitCount} Feinde getroffen!`, 'success');
      if (window.SoundManager) window.SoundManager.playSuccess();
    } else if (trapType === 'ballista') {
      const target = this.enemies.sort((a, b) => b.progress - a.progress)[0];
      if (target) {
        target.hp -= 80;
        this.enemies = this.enemies.filter(e => e.hp > 0);
        this.score += 50;
        this.ui.showToast(`🎯 Balliste hat ${target.type.toUpperCase()} schwer getroffen!`, 'success');
        if (window.SoundManager) window.SoundManager.playSuccess();
      }
    } else if (trapType === 'garrison_charge') {
      let killed = 0;
      this.enemies.forEach(enemy => {
        enemy.hp -= 25;
        if (enemy.hp <= 0) killed++;
      });
      this.enemies = this.enemies.filter(e => e.hp > 0);
      this.score += killed * 30;
      this.ui.showToast(`⚔️ Mauergarnison hat den Ausfall gewagt!`, 'info');
      if (window.SoundManager) window.SoundManager.playSuccess();
    }

    this.renderSiegeOverlay();
  }

  updateLoop() {
    if (!this.active) return;

    let reachedKeep = 0;
    this.enemies.forEach(enemy => {
      enemy.progress += Math.floor(5 * enemy.speed);
      if (enemy.progress >= 100) {
        reachedKeep += enemy.damage;
      }
    });

    // Remove enemies that breached
    const breachedCount = this.enemies.filter(e => e.progress >= 100).length;
    this.enemies = this.enemies.filter(e => e.progress < 100);

    if (breachedCount > 0) {
      this.ui.showToast(`⚠️ ${breachedCount} Feinde haben das Burgtor durchbrochen! (-${reachedKeep} Burg-Gesundheit)`, 'error');
      if (window.SoundManager) window.SoundManager.playError();
    }

    // Check wave status
    if (this.enemies.length === 0) {
      if (this.wave < this.maxWaves) {
        this.wave++;
        this.spawnWave();
        this.ui.showToast(`🛡️ Welle ${this.wave} von ${this.maxWaves} formiert sich!`, 'warning');
      } else {
        this.endSiege(true);
      }
    }

    this.renderSiegeOverlay();
  }

  endSiege(victory) {
    this.active = false;
    if (this.intervalId) clearInterval(this.intervalId);

    const overlayEl = document.getElementById('siege-defense-modal');
    if (overlayEl) overlayEl.remove();

    if (victory) {
      const rewardGold = 150 + this.score;
      const rewardRubies = 5;
      this.stateManager.state.resources.gold += rewardGold;
      this.stateManager.state.resources.rubies = (this.stateManager.state.resources.rubies || 0) + rewardRubies;

      const siegeStats = this.stateManager.state.siegeMinigame;
      siegeStats.totalDefended = (siegeStats.totalDefended || 0) + 1;
      if (this.score > siegeStats.highScore) siegeStats.highScore = this.score;

      this.ui.showToast(`🎉 SIECKREICH VERTEIDIGT! Belohnung: +${rewardGold} Gold, +${rewardRubies} Rubine!`, 'success');
      if (window.SoundManager) window.SoundManager.playSuccess();
    } else {
      this.ui.showToast(`💥 Die Burgverteidigung ist gescheitert!`, 'error');
      if (window.SoundManager) window.SoundManager.playError();
    }

    this.stateManager.notifyListeners('siege');
  }

  renderSiegeOverlay() {
    let overlayEl = document.getElementById('siege-defense-modal');
    if (!overlayEl) {
      overlayEl = document.createElement('div');
      overlayEl.id = 'siege-defense-modal';
      overlayEl.className = 'modal-backdrop';
      overlayEl.style.zIndex = '9999';
      document.body.appendChild(overlayEl);
    }

    const enemyListHtml = this.enemies.map(e => `
      <div style="margin: 4px 0; background: rgba(0,0,0,0.4); padding: 6px; border-radius: 4px;">
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
          <span><strong>${e.type.toUpperCase()}</strong> (Vormarsch: ${e.progress}%)</span>
          <span>HP: ${e.hp}/${e.maxHp}</span>
        </div>
        <div style="background: #444; height: 6px; border-radius: 3px; overflow: hidden; margin-top: 4px;">
          <div style="background: ${e.hp > e.maxHp*0.5 ? '#2ecc71' : '#e74c3c'}; width: ${(e.hp/e.maxHp)*100}%; height: 100%;"></div>
        </div>
      </div>
    `).join('');

    overlayEl.innerHTML = `
      <div class="modal-content" style="max-width: 550px; background: rgba(20, 24, 35, 0.95); border: 2px solid #d4af37; border-radius: 12px; padding: 20px; color: #fff;">
        <h2 style="font-family: 'Cinzel', serif; color: #e74c3c; margin-top: 0; text-align: center;">
          🛡️ ECHTZEIT-BURGVERTEIDIGUNG
        </h2>
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 8px;">
          <span>Welle: ${this.wave} / ${this.maxWaves}</span>
          <span>Punkte: ${this.score}</span>
          <span>Feinde im Anmarsch: ${this.enemies.length}</span>
        </div>

        <div style="max-height: 200px; overflow-y: auto; margin-bottom: 16px; padding-right: 4px;">
          ${this.enemies.length > 0 ? enemyListHtml : '<div style="text-align: center; color: #2ecc71;">Welle vernichtet!</div>'}
        </div>

        <h3 style="font-size: 1rem; color: #d4af37; margin-bottom: 8px;">Verteidigungs-Aktionen:</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px;">
          <button class="btn btn-action" onclick="window.SiegeMinigame.triggerTrap('boiling_oil')">
            🛢️ Siedendes Öl gießen
          </button>
          <button class="btn btn-action" onclick="window.SiegeMinigame.triggerTrap('ballista')">
            🎯 Ballisten-Schuss
          </button>
          <button class="btn btn-action" onclick="window.SiegeMinigame.triggerTrap('garrison_charge')" style="grid-column: span 2;">
            ⚔️ Mauergarnison-Ausfall
          </button>
        </div>

        <div style="text-align: center;">
          <button class="btn btn-secondary" onclick="window.SiegeMinigame.endSiege(false)">
            🏳️ Rückzug anordnen
          </button>
        </div>
      </div>
    `;
  }
}

window.SiegeMinigame = null;
