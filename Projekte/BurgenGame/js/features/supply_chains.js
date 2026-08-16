// --- SUPPLY CHAINS & POPULATION NEEDS FEATURE ---
(function() {
  window.SupplyChains = {
    needs: {
      food: 100,
      beer: 100,
      faith: 100,
      hygiene: 100
    },
    revoltActive: false,
    revoltTimer: 0,

    init() {
      console.log('🌾 SupplyChains Module Initialized.');
    },

    // Executed every tick in GameState
    update(state) {
      if (!state) return;
      if (!state.resources) return;

      const buildings = state.buildings || [];
      
      // Count refinery buildings
      const counts = {
        farm: 0,
        mill: 0,
        bakery: 0,
        iron_mine: 0,
        smelter: 0,
        blacksmith: 0,
        hop_farm: 0,
        brewery: 0,
        church: 0,
        well: 0,
        tavern: 0
      };

      buildings.forEach(b => {
        if (counts[b.type] !== undefined) {
          counts[b.type] += (b.level || 1);
        }
      });

      // 1. Refine Resources
      // Grain / Flour / Bread
      if (state.resources.food > 10 && counts.mill > 0) {
        const processAmount = Math.min(counts.mill * 2, state.resources.food);
        state.resources.food -= processAmount;
        state.resources.flour = (state.resources.flour || 0) + processAmount;
      }
      if ((state.resources.flour || 0) > 0 && counts.bakery > 0) {
        const breadAmount = Math.min(counts.bakery * 3, state.resources.flour);
        state.resources.flour -= breadAmount;
        state.resources.bread = (state.resources.bread || 0) + breadAmount;
        // Bread boosts total food pool extra
        state.resources.food += Math.floor(breadAmount * 1.5);
      }

      // Hops & Beer
      if (counts.hop_farm > 0) {
        state.resources.hops = (state.resources.hops || 0) + counts.hop_farm * 2;
      }
      if ((state.resources.hops || 0) > 0 && counts.brewery > 0) {
        const beerAmount = Math.min(counts.brewery * 2, state.resources.hops);
        state.resources.hops -= beerAmount;
        state.resources.beer = (state.resources.beer || 0) + beerAmount;
      }

      // Iron Ore & Smelting & Weapons
      if (counts.iron_mine > 0) {
        state.resources.iron_ore = (state.resources.iron_ore || 0) + counts.iron_mine * 2;
      }
      if ((state.resources.iron_ore || 0) > 0 && counts.smelter > 0) {
        const smelted = Math.min(counts.smelter * 2, state.resources.iron_ore);
        state.resources.iron_ore -= smelted;
        state.resources.iron = (state.resources.iron || 0) + smelted;
      }
      if ((state.resources.iron || 0) > 0 && (state.resources.wood || 0) > 0 && counts.blacksmith > 0) {
        const crafted = Math.min(counts.blacksmith * 2, state.resources.iron, state.resources.wood);
        state.resources.iron -= crafted;
        state.resources.wood -= crafted;
        state.resources.weapons = (state.resources.weapons || 0) + crafted;
      }

      // 2. Population Needs Calculation
      const pop = state.population || 10;
      
      // Food Need
      const breadSupply = state.resources.bread || 0;
      this.needs.food = Math.min(100, Math.floor((breadSupply + 10) / (pop * 0.2) * 100));

      // Beer / Tavern Need
      const beerSupply = state.resources.beer || 0;
      const tavernCap = counts.tavern * 15;
      this.needs.beer = Math.min(100, Math.floor((beerSupply + tavernCap) / (pop * 0.15) * 100));

      // Faith Need
      this.needs.faith = Math.min(100, Math.floor((counts.church * 25) / (pop * 0.1) * 100));

      // Hygiene Need
      this.needs.hygiene = Math.min(100, Math.floor((counts.well * 20) / (pop * 0.1) * 100));

      // Overall Needs Average
      const avgNeeds = Math.floor((this.needs.food + this.needs.beer + this.needs.faith + this.needs.hygiene) / 4);
      
      // Update global happiness contribution
      if (state.happiness !== undefined) {
        state.needsHappinessBonus = Math.floor((avgNeeds - 50) * 0.3);
      }

      // 3. Peasant Revolt (Bauernaufstand) check if overall satisfaction < 20%
      if (avgNeeds < 20 && !this.revoltActive) {
        if (Math.random() < 0.15) {
          this.triggerRevolt(state);
        }
      }

      if (this.revoltActive) {
        this.revoltTimer--;
        if (this.revoltTimer <= 0) {
          this.revoltActive = false;
          if (window.UI && window.UI.showToast) {
            window.UI.showToast('🕊️ Der Bauernaufstand wurde beigelegt.', 'info');
          }
        }
      }
    },

    triggerRevolt(state) {
      this.revoltActive = true;
      this.revoltTimer = 10; // 10 ticks duration
      
      // Penalize tax and gold
      if (state.resources && state.resources.gold) {
        state.resources.gold = Math.max(0, state.resources.gold - 50);
      }

      if (window.UI && window.UI.showNotification) {
        window.UI.showNotification('⚠️ ACHTUNG: Bauernaufstand!', 'Die Bevölkerung ist unzufrieden (Versorgung mangelhaft). Produktion ist gelähmt!');
      }
    },

    getNeedsSummary() {
      return {
        food: this.needs.food,
        beer: this.needs.beer,
        faith: this.needs.faith,
        hygiene: this.needs.hygiene,
        revolt: this.revoltActive
      };
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.SupplyChains.init();
  });
})();
