// --- GUILD TERRITORY & FORTRESS CONTROL MODULE ---
(function() {
  window.GuildTerritory = {
    nodes: [
      { id: 'dragon_pass', name: 'Drachenpass 🏔️', controlledBy: 'Freie Ritter', bonus: '+20% Drachenangriff', tributeGold: 100 },
      { id: 'iron_fortress', name: 'Eiserne Festung 🛡️', controlledBy: 'Eisengarde Gilde', bonus: '+15% Mauer-Rüstung', tributeGold: 150 },
      { id: 'gold_coast', name: 'Goldküste ⚓', controlledBy: 'Spieler-Gilde', bonus: '+25% Handelsflotten-Ertrag', tributeGold: 250 }
    ],

    init() {
      console.log('🗺️ GuildTerritory Module Initialized.');
    },

    captureNode(nodeId) {
      const node = this.nodes.find(n => n.id === nodeId);
      if (!node) return false;

      const cost = { gold: 300, iron: 100 };
      if (!window.GameState || !window.GameState.hasResources(cost)) {
        if (window.UI && window.UI.showToast) {
          window.UI.showToast('Nicht genügend Ressourcen zur Eroberung der Megafestung!', 'error');
        }
        return false;
      }

      window.GameState.deductResources(cost);
      node.controlledBy = 'Deine Gilde';

      if (window.KingdomChronicle) {
        window.KingdomChronicle.logEvent('Gilden-Festung Erobert', `Deine Gilde hat die Kontrolle über "${node.name}" übernommen!`);
      }

      if (window.UI && window.UI.showToast) {
        window.UI.showToast(`🏰 Megafestung "${node.name}" erfolgreich für die Gilde besetzt!`, 'success');
      }
      return true;
    },

    collectDailyTribute() {
      let total = 0;
      this.nodes.forEach(n => {
        if (n.controlledBy === 'Deine Gilde') total += n.tributeGold;
      });

      if (total > 0 && window.GameState && window.GameState.state && window.GameState.state.resources) {
        window.GameState.state.resources.gold += total;
        if (window.UI && window.UI.showToast) {
          window.UI.showToast(`💰 Gilden-Tribut kassiert: +${total} Gold!`, 'success');
        }
      }
      return total;
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.GuildTerritory.init();
  });
})();
