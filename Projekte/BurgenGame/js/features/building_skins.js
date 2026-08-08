// --- ARCHITECTURE BUILDING SKINS & STYLES FEATURE MODULE ---

const CASTLE_SKINS = {
  classic: {
    id: 'classic',
    name: 'Klassischer Bruchstein',
    icon: '🏰',
    description: 'Traditionelle mittelalterliche Graustein-Architektur.',
    wallColor: '#7f8c8d',
    roofColor: '#c0392b',
    bannerColor: '#3498db',
    requiredAge: 0
  },
  gothic: {
    id: 'gothic',
    name: 'Gotischer Marmor',
    icon: '🏛️',
    description: 'Edler, dunkler Marmor mit violetten Dächern und goldenen Bannern.',
    wallColor: '#34495e',
    roofColor: '#8e44ad',
    bannerColor: '#f1c40f',
    requiredAge: 2
  },
  nordic: {
    id: 'nordic',
    name: 'Nordische Festung',
    icon: '🛡️',
    description: 'Kräftiges Hartholz und verschneite Dächer.',
    wallColor: '#5d4037',
    roofColor: '#2980b9',
    bannerColor: '#e74c3c',
    requiredAge: 1
  },
  desert: {
    id: 'desert',
    name: 'Wüstenpalast',
    icon: '🕌',
    description: 'Sonnengebleichter Sandstein mit türkisfarbenen Kuppeln.',
    wallColor: '#e5c07b',
    roofColor: '#1abc9c',
    bannerColor: '#e67e22',
    requiredAge: 3
  }
};

class BuildingSkinsManager {
  constructor(stateManager, ui) {
    this.stateManager = stateManager;
    this.ui = ui;
  }

  getActiveSkin() {
    const skinId = this.stateManager.state.activeSkinId || 'classic';
    return CASTLE_SKINS[skinId] || CASTLE_SKINS.classic;
  }

  setActiveSkin(skinId) {
    const skin = CASTLE_SKINS[skinId];
    if (!skin) return false;

    const currentAge = this.stateManager.state.ageIndex || 0;
    if (currentAge < skin.requiredAge) {
      if (this.ui) this.ui.showToast(`Dieser Stil erfordert Zeitalter-Stufe ${skin.requiredAge + 1}!`, 'warning');
      return false;
    }

    this.stateManager.state.activeSkinId = skinId;
    this.stateManager.save();
    this.stateManager.notifyListeners('skin_changed');
    if (this.ui) this.ui.showToast(`🎨 Architektur-Stil gewechselt zu: ${skin.name}`, 'success');
    return true;
  }
}

window.CASTLE_SKINS = CASTLE_SKINS;
window.BuildingSkinsManager = BuildingSkinsManager;
