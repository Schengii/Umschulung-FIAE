// --- MYTHIC MOUNT BREEDING & ELEMENTAL DRAKES 2.0 ---
(function() {
  window.MythicBreeding = {
    species: {
      fire_drake: { name: 'Feuerdrache 🔥', bonus: '+35% AoE-Schaden', cost: { rubies: 40, food: 200 } },
      frost_wyvern: { name: 'Frostwyvern ❄️', bonus: 'Friert Feinde 1 Runden lang ein', cost: { rubies: 50, gold: 300 } },
      storm_gryphon: { name: 'Sturmgreif ⚡', bonus: '+50% Armeegeschwindigkeit', cost: { gold: 500, food: 300 } }
    },
    stable: [],

    init() {
      console.log('🐉 MythicBreeding Module Initialized.');
    },

    breedMount(speciesId) {
      const spec = this.species[speciesId];
      if (!spec) return false;

      if (!window.GameState || !window.GameState.hasResources(spec.cost)) {
        if (window.UI && window.UI.showToast) {
          window.UI.showToast('Nicht genügend Ressourcen im Drachenhort!', 'error');
        }
        return false;
      }

      window.GameState.deductResources(spec.cost);
      this.stable.push({ id: speciesId, level: 1 });
      window.GameState.save();

      if (window.UI && window.UI.showToast) {
        window.UI.showToast(`🐉 ${spec.name} erfolgreich im Drachenhort gezüchtet!`, 'success');
      }
      return true;
    },

    getCombinedCombatBonus() {
      let dmg = 0;
      let speed = 0;
      this.stable.forEach(m => {
        if (m.id === 'fire_drake') dmg += 0.35;
        if (m.id === 'storm_gryphon') speed += 0.50;
      });
      return { dmg, speed };
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.MythicBreeding.init();
  });
})();
