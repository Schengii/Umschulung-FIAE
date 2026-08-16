// --- VISUAL DESTRUCTION PHYSICS & FIRE SPREAD ENGINE ---
(function() {
  window.DestructionPhysics = {
    debrisParticles: [],
    burningTiles: [],

    init() {
      console.log('💥 DestructionPhysics Module Initialized.');
    },

    triggerWallCrumble(gridX, gridY) {
      for (let i = 0; i < 15; i++) {
        this.debrisParticles.push({
          x: gridX + (Math.random() - 0.5),
          y: gridY + (Math.random() - 0.5),
          vx: (Math.random() - 0.5) * 2,
          vy: -Math.random() * 3,
          life: 30,
          color: Math.random() < 0.5 ? '#7f8c8d' : '#95a5a6'
        });
      }
      if (window.UI && window.UI.showToast) {
        window.UI.showToast('💥 Burgmauer unter Beschuss eingestürzt!', 'warning');
      }
    },

    igniteTile(gridX, gridY) {
      this.burningTiles.push({
        x: gridX,
        y: gridY,
        duration: 10 // 10 ticks
      });
    },

    updateTick(state) {
      // Fire spread logic
      if (!this.burningTiles.length) return;
      const nextBurning = [];

      this.burningTiles.forEach(b => {
        b.duration--;
        if (b.duration > 0) {
          nextBurning.push(b);
          // Chance to spread to adjacent tile
          if (Math.random() < 0.10 && state && state.buildings) {
            const adjX = b.x + (Math.random() < 0.5 ? 1 : -1);
            const adjY = b.y + (Math.random() < 0.5 ? 1 : -1);
            const hasFireStation = state.buildings.some(bg => bg.type === 'fire_station' && !bg.underConstruction);
            if (!hasFireStation) {
              nextBurning.push({ x: adjX, y: adjY, duration: 8 });
            }
          }
        }
      });

      this.burningTiles = nextBurning;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.DestructionPhysics.init();
  });
})();
