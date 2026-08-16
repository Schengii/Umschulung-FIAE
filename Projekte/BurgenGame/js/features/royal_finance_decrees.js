// --- ROYAL FINANCE DECREES & POLICY SYSTEM 2.0 ---
(function() {
  window.RoyalFinanceDecrees = {
    activeDecrees: {
      bread_subsidies: false,
      war_tax: false,
      silk_tariff: false
    },

    init() {
      console.log('👑 RoyalFinanceDecrees Module Initialized.');
    },

    toggleDecree(decreeId) {
      if (this.activeDecrees[decreeId] === undefined) return false;
      this.activeDecrees[decreeId] = !this.activeDecrees[decreeId];

      const status = this.activeDecrees[decreeId] ? 'Aktiviert 📜' : 'Deaktiviert ❌';
      const name = decreeId === 'bread_subsidies' ? 'Brot-Subvention' : (decreeId === 'war_tax' ? 'Kriegs-Steuer' : 'Seidenzoll');

      if (window.KingdomChronicle) {
        window.KingdomChronicle.logEvent('Königlicher Erlass Erlassen', `${name} wurde ${status}.`);
      }

      if (window.UI && window.UI.showToast) {
        window.UI.showToast(`👑 Erlass "${name}" ${status}!`, 'info');
      }
      return true;
    },

    getModifiers() {
      let goldMult = 1.0;
      let happinessMod = 0;
      let costMult = 1.0;

      if (this.activeDecrees.bread_subsidies) {
        happinessMod += 25;
        goldMult -= 0.15;
      }
      if (this.activeDecrees.war_tax) {
        goldMult += 0.45;
        happinessMod -= 20;
      }
      if (this.activeDecrees.silk_tariff) {
        goldMult += 0.20;
      }

      return { goldMult, happinessMod, costMult };
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.RoyalFinanceDecrees.init();
  });
})();
