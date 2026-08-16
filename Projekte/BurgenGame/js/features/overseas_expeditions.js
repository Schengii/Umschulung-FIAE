// --- OVERSEAS TRADE EXPEDITIONS & NAVAL EVENTS ---
(function() {
  window.OverseasExpeditions = {
    destinations: [
      { id: 'orient', name: 'Kalifat von Al-Zahra', distance: 120, resource: 'Gewürze 🌶️', reward: { gold: 500, rubies: 30 } },
      { id: 'silk_road', name: 'Kaiserreich des Ostens', distance: 180, resource: 'Seide 🧵', reward: { gold: 800, rubies: 50 } },
      { id: 'nordic_isles', name: 'Eisige Nordinseln', distance: 90, resource: 'Bernstein 💎', reward: { gold: 350, iron: 150 } }
    ],
    activeExpedition: null,

    init() {
      console.log('⛵ OverseasExpeditions Module Initialized.');
    },

    launchExpedition(destId) {
      const dest = this.destinations.find(d => d.id === destId);
      if (!dest) return false;

      const cost = { gold: 200, food: 150 };
      if (!window.GameState || !window.GameState.hasResources(cost)) {
        if (window.UI && window.UI.showToast) {
          window.UI.showToast('Nicht genügend Proviant & Gold für die Seereise!', 'error');
        }
        return false;
      }

      window.GameState.deductResources(cost);
      this.activeExpedition = {
        dest: dest,
        progress: 0,
        targetProgress: dest.distance
      };

      if (window.UI && window.UI.showToast) {
        window.UI.showToast(`⛵ Handelsflotte sticht in See in Richtung "${dest.name}"!`, 'success');
      }
      return true;
    },

    updateTick() {
      if (!this.activeExpedition) return;
      this.activeExpedition.progress += 10;

      // 10% Chance for Pirate Encounter
      if (Math.random() < 0.10) {
        if (window.UI && window.UI.showNotification) {
          window.UI.showNotification('🏴‍☠️ Piratenangriff auf See!', 'Deine Handelsflotte wehrte den Angriff erfolgreich ab!');
        }
      }

      if (this.activeExpedition.progress >= this.activeExpedition.targetProgress) {
        const reward = this.activeExpedition.dest.reward;
        if (window.GameState && window.GameState.state && window.GameState.state.resources) {
          if (reward.gold) window.GameState.state.resources.gold += reward.gold;
          if (reward.rubies) window.GameState.state.resources.rubies = (window.GameState.state.resources.rubies || 0) + reward.rubies;
          if (reward.iron) window.GameState.state.resources.iron = (window.GameState.state.resources.iron || 0) + reward.iron;
        }

        if (window.KingdomChronicle) {
          window.KingdomChronicle.logEvent('Übersee-Flotte Heimgekehrt', `Erfolgreicher Handelszug von ${this.activeExpedition.dest.name} mit ${this.activeExpedition.dest.resource}.`);
        }

        if (window.UI && window.UI.showToast) {
          window.UI.showToast(`⚓ Flotte zurückgekehrt! Beute: +${reward.gold} Gold & Boni!`, 'success');
        }

        this.activeExpedition = null;
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.OverseasExpeditions.init();
  });
})();
