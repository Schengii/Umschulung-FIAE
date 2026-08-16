// --- WALL TRAPS & CASTLE GATE DEFENSE MODULE ---
(function() {
  window.WallTraps = {
    traps: {
      boiling_pitch: { name: 'Pechkessel', cost: { wood: 50, gold: 40 }, damage: 45, area: true },
      boiling_oil: { name: 'Siedendes Öl', cost: { gold: 60, iron: 20 }, damage: 60, armorPierce: true },
      portcullis: { name: 'Fallgitter', cost: { iron: 40, stone: 80 }, blockRounds: 2 },
      caltrops: { name: 'Krähenfüße', cost: { iron: 15, gold: 20 }, slowEffect: 0.5 }
    },
    installedTraps: [],

    init() {
      console.log('🏰 WallTraps Module Initialized.');
    },

    installTrap(trapId) {
      const trap = this.traps[trapId];
      if (!trap) return false;
      if (!window.GameState || !window.GameState.hasResources(trap.cost)) {
        if (window.UI && window.UI.showToast) {
          window.UI.showToast('Nicht genügend Ressourcen für diesen Fallenbau!', 'error');
        }
        return false;
      }

      window.GameState.deductResources(trap.cost);
      this.installedTraps.push({ id: trapId, ready: true });
      window.GameState.save();

      if (window.UI && window.UI.showToast) {
        window.UI.showToast(`🛡️ ${trap.name} erfolgreich auf der Burgmauer installiert!`, 'success');
      }
      return true;
    },

    triggerTrapsInCombat(enemyUnits) {
      if (!this.installedTraps.length || !enemyUnits || !enemyUnits.length) return 0;
      let totalDamage = 0;

      this.installedTraps.forEach(t => {
        if (t.ready) {
          const config = this.traps[t.id];
          if (config && config.damage) {
            totalDamage += config.damage;
            t.ready = false; // Used in battle
          }
        }
      });

      return totalDamage;
    },

    resetTraps() {
      this.installedTraps.forEach(t => t.ready = true);
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.WallTraps.init();
  });
})();
