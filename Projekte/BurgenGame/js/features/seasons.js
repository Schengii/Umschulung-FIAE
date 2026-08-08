// --- SEASONS FEATURE ---

// Get current active season config
GameStateManager.prototype.getCurrentSeason = function() {
  if (this.state.seasonIndex === undefined) {
    this.state.seasonIndex = 0; // spring
  }
  return SEASONS_CONFIG[this.state.seasonIndex];
};

// Tick seasons duration
GameStateManager.prototype.tickSeasons = function(dt) {
  if (this.state.seasonIndex === undefined) this.state.seasonIndex = 0;
  if (this.state.seasonTimeRemaining === undefined) this.state.seasonTimeRemaining = SEASON_DURATION_SEC;

  this.state.seasonTimeRemaining -= dt;
  if (this.state.seasonTimeRemaining <= 0) {
    // Transition to next season
    this.state.seasonIndex = (this.state.seasonIndex + 1) % SEASONS_CONFIG.length;
    this.state.seasonTimeRemaining = SEASON_DURATION_SEC;
    
    this.save();
    this.notifyListeners('season_changed');

    // Trigger seasonal festival notification
    const festivalNames = {
      spring: '🌸 Frühlings-Kirschblütenfest (+20% Zufriedenheit)',
      summer: '☀️ Sonnenwend-Ritterturnier (+25% Soldaten-Tempo)',
      autumn: '🌾 Erntedankfest (+35% Nahrungs- & Holzertrag)',
      winter: '❄️ Könglicher Wintermarkt (+30% Steuereinnahmen)'
    };
    const fest = festivalNames[nextSeason.id];
    if (window.gameUI) {
      gameUI.showFloatingNotification(`🎪 KALENDER-EVENT: ${fest}`);
    }
    if (window.gameSound) {
      gameSound.playAmbientSoundscape(nextSeason.id);
    }

    // Trigger random bandit siege in autumn or winter (35% chance)
    if (nextSeason && (nextSeason.id === 'autumn' || nextSeason.id === 'winter')) {
      if (Math.random() < 0.35) {
        setTimeout(() => {
          if (window.gameUI && gameUI.triggerDefensiveSiege) {
            gameUI.triggerDefensiveSiege();
          }
        }, 1500);
      }
    }
  }
};

// Get current season resource yield multiplier
GameStateManager.prototype.getSeasonMultiplier = function(resourceType) {
  const current = this.getCurrentSeason();
  if (current && current.prodMult && current.prodMult[resourceType] !== undefined) {
    return current.prodMult[resourceType];
  }
  return 1.0;
};
