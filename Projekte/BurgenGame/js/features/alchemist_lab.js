// --- ALCHEMIST LABORATORY & POTION BREWING FEATURE ---
(function() {
  window.AlchemistLab = {
    recipes: {
      march_potion: { name: 'Marsch-Elixier 🧪', cost: { food: 50, gold: 30 }, durationTicks: 5, effect: 'Erhöht Marschgeschwindigkeit um +50%' },
      healing_salve: { name: 'Heilbalsam 🌿', cost: { food: 80, gold: 50 }, effect: 'Regeneriert +100 HP für den Helden' },
      greek_fire: { name: 'Griechisches Feuer 🔥', cost: { iron: 30, gold: 100 }, effect: 'Verleiht Katapulten flächendeckenden Brand-Schaden' }
    },
    inventory: {
      march_potion: 0,
      healing_salve: 0,
      greek_fire: 0
    },

    init() {
      console.log('🧪 AlchemistLab Module Initialized.');
    },

    brewPotion(recipeId) {
      const recipe = this.recipes[recipeId];
      if (!recipe) return false;

      if (!window.GameState || !window.GameState.hasResources(recipe.cost)) {
        if (window.UI && window.UI.showToast) {
          window.UI.showToast('Nicht genügend Rohstoffe im Alchemistenlabor!', 'error');
        }
        return false;
      }

      window.GameState.deductResources(recipe.cost);
      this.inventory[recipeId] = (this.inventory[recipeId] || 0) + 1;
      window.GameState.save();

      if (window.UI && window.UI.showToast) {
        window.UI.showToast(`🧪 ${recipe.name} erfolgreich gebraut!`, 'success');
      }
      return true;
    },

    usePotion(recipeId) {
      if (!this.inventory[recipeId] || this.inventory[recipeId] <= 0) {
        if (window.UI && window.UI.showToast) {
          window.UI.showToast('Keine Tränke dieser Art im Vorrat!', 'warning');
        }
        return false;
      }

      this.inventory[recipeId]--;
      const recipe = this.recipes[recipeId];

      if (recipeId === 'healing_salve' && window.HeroManager && window.HeroManager.hero) {
        window.HeroManager.hero.hp = Math.min(window.HeroManager.hero.maxHp || 200, (window.HeroManager.hero.hp || 100) + 100);
      }

      if (window.UI && window.UI.showToast) {
        window.UI.showToast(`✨ ${recipe.name} angewendet! (${recipe.effect})`, 'success');
      }
      return true;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.AlchemistLab.init();
  });
})();
