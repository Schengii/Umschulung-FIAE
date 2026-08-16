// --- SEASONAL RANKED LEAGUES & KINGDOM RATING 3.0 ---
(function() {
  window.RankedLeagues = {
    leagues: [
      { id: 'bronze', name: 'Bronze-Liga 🥉', minScore: 0 },
      { id: 'silver', name: 'Silber-Liga 🥈', minScore: 500 },
      { id: 'gold', name: 'Gold-Liga 🥇', minScore: 1500 },
      { id: 'platinum', name: 'Platin-Liga 💎', minScore: 3500 },
      { id: 'obsidian', name: 'Obsidian-Königreich 👑', minScore: 7500 }
    ],

    init() {
      console.log('🏆 RankedLeagues Module Initialized.');
    },

    calculateKingdomScore(state) {
      if (!state) return 0;
      let score = 0;

      // Buildings
      if (state.buildings) {
        score += state.buildings.length * 25;
        state.buildings.forEach(b => score += (b.level || 1) * 15);
      }

      // Resources
      if (state.resources) {
        score += Math.floor((state.resources.gold || 0) / 10);
        score += Math.floor((state.resources.rubies || 0) * 10);
      }

      // Troops
      if (state.troops) {
        Object.keys(state.troops).forEach(k => {
          score += (state.troops[k] || 0) * 5;
        });
      }

      return score;
    },

    getCurrentLeague(state) {
      const score = this.calculateKingdomScore(state);
      let current = this.leagues[0];
      this.leagues.forEach(l => {
        if (score >= l.minScore) current = l;
      });
      return { league: current, score: score };
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.RankedLeagues.init();
  });
})();
