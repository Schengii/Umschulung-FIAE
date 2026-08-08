// --- MULTI-KINGDOM REGIONS & BIOMES FEATURE MODULE ---

const REGIONS_CONFIG = {
  greendale: {
    id: 'greendale',
    name: 'Grüntal-Provinz',
    icon: '🌱',
    color: '#27ae60',
    description: 'Das fruchtbare Stammland deines Reiches. Ausgewogene Produktion für alle Ressourcen.',
    bonuses: { wood: 1.0, stone: 1.0, food: 1.0, iron: 1.0, rubies: 1.0, speed: 1.0 },
    unlockCost: { gold: 0 }
  },
  frostpeaks: {
    id: 'frostpeaks',
    name: 'Frostgipfel-Mark',
    icon: '❄️',
    color: '#3498db',
    description: 'Verschneite Gebirgszüge bergen uralte Edelsteinadern. (+50% Rubine, aber -20% Marschtempo).',
    bonuses: { wood: 0.8, stone: 1.2, food: 0.7, iron: 1.1, rubies: 1.5, speed: 0.8 },
    unlockCost: { gold: 500, stone: 300 }
  },
  volcanic_wastes: {
    id: 'volcanic_wastes',
    name: 'Vulkan-Ödland',
    icon: '🌋',
    color: '#e67e22',
    description: 'Glühende Schluchten reich an Erzen. (+100% Eisenerz & Eisen, aber -30% Nahrung).',
    bonuses: { wood: 0.6, stone: 1.5, food: 0.7, iron: 2.0, rubies: 1.2, speed: 0.9 },
    unlockCost: { gold: 1200, iron: 500 }
  },
  coastal_realm: {
    id: 'coastal_realm',
    name: 'Küstenebene & Seeport',
    icon: '⛵',
    color: '#1abc9c',
    description: 'Reiche Handelsrouten über den Ozean. (+75% Seehandelserträge & Gold).',
    bonuses: { wood: 1.1, stone: 0.9, food: 1.2, iron: 0.8, rubies: 1.3, speed: 1.2 },
    unlockCost: { gold: 2000, wood: 1000 }
  }
};

class RegionsManager {
  constructor(stateManager, ui) {
    this.stateManager = stateManager;
    this.ui = ui;
  }

  getActiveRegion() {
    const activeId = this.stateManager.state.activeRegionId || 'greendale';
    return REGIONS_CONFIG[activeId] || REGIONS_CONFIG.greendale;
  }

  getUnlockedRegions() {
    if (!this.stateManager.state.unlockedRegions) {
      this.stateManager.state.unlockedRegions = ['greendale'];
    }
    return this.stateManager.state.unlockedRegions;
  }

  unlockRegion(regionId) {
    const cfg = REGIONS_CONFIG[regionId];
    if (!cfg) return false;

    const unlocked = this.getUnlockedRegions();
    if (unlocked.includes(regionId)) {
      if (this.ui) this.ui.showToast('Diese Region ist bereits freigeschaltet!', 'info');
      return false;
    }

    if (!this.stateManager.hasResources(cfg.unlockCost)) {
      if (this.ui) this.ui.showToast('Nicht genügend Ressourcen zur Freischaltung!', 'error');
      return false;
    }

    this.stateManager.deductResources(cfg.unlockCost);
    this.stateManager.state.unlockedRegions.push(regionId);
    this.stateManager.save();
    this.stateManager.notifyListeners('region_unlocked');
    if (this.ui) this.ui.showToast(`🗺️ Region "${cfg.name}" erfolgreich freigeschaltet!`, 'success');
    return true;
  }

  switchRegion(regionId) {
    const unlocked = this.getUnlockedRegions();
    if (!unlocked.includes(regionId)) {
      if (this.ui) this.ui.showToast('Schalte diese Region zuerst frei!', 'warning');
      return false;
    }

    this.stateManager.state.activeRegionId = regionId;
    this.stateManager.save();
    this.stateManager.notifyListeners('region_changed');
    if (this.ui) this.ui.showToast(`🏰 Region gewechselt zu: ${REGIONS_CONFIG[regionId].name}`, 'info');
    return true;
  }

  getRegionProductionBonus(resourceType) {
    const active = this.getActiveRegion();
    return active.bonuses[resourceType] || 1.0;
  }
}

window.REGIONS_CONFIG = REGIONS_CONFIG;
window.RegionsManager = RegionsManager;
