// --- BLUEPRINTS & MULTI-UPGRADE FEATURE ---

class BlueprintMultiUpgradeManager {
  constructor(stateManager, ui) {
    this.stateManager = stateManager;
    this.ui = ui;
  }

  init() {
    if (!this.stateManager.state.blueprints) {
      this.stateManager.state.blueprints = [];
    }
  }

  upgradeAllBuildingsOfType(buildingType) {
    this.init();
    const buildings = this.stateManager.state.buildings.filter(b => b.type === buildingType && !b.underConstruction);
    if (buildings.length === 0) {
      return { success: false, msg: 'Keine aufwertbaren Gebäude dieses Typs gefunden!' };
    }

    let upgradedCount = 0;
    let totalCostGold = 0;

    buildings.forEach(b => {
      const costGold = b.level * 50;
      if ((this.stateManager.state.resources.gold || 0) >= costGold) {
        this.stateManager.state.resources.gold -= costGold;
        b.level += 1;
        totalCostGold += costGold;
        upgradedCount++;
      }
    });

    if (upgradedCount > 0) {
      if (window.SoundManager) window.SoundManager.playSuccess();
      this.stateManager.notifyListeners('buildings');
      return { success: true, msg: `⚡ ${upgradedCount} Gebäude vom Typ ${buildingType.toUpperCase()} aufgewertet! (Kosten: ${totalCostGold} Gold)` };
    } else {
      return { success: false, msg: 'Nicht genug Gold für ein Sammel-Upgrade!' };
    }
  }

  saveCurrentLayoutAsBlueprint(name = 'Mein Layout') {
    this.init();
    const layout = this.stateManager.state.buildings.map(b => ({
      type: b.type,
      x: b.x,
      y: b.y,
      level: b.level
    }));

    const bp = {
      id: `bp_${Date.now()}`,
      name: name,
      savedAt: new Date().toLocaleDateString(),
      layout: layout
    };

    this.stateManager.state.blueprints.push(bp);
    if (window.SoundManager) window.SoundManager.playSuccess();
    return { success: true, msg: `📐 Blaupause "${name}" mit ${layout.length} Gebäuden gespeichert!` };
  }

  getSavedBlueprints() {
    this.init();
    return this.stateManager.state.blueprints;
  }

  exportBlueprintHash(bpId) {
    this.init();
    const bp = this.stateManager.state.blueprints.find(b => b.id === bpId);
    if (!bp) return '';
    try {
      const json = JSON.stringify(bp);
      return 'LAYOUT_' + btoa(encodeURIComponent(json));
    } catch (e) {
      console.error("Export layout hash failed", e);
      return '';
    }
  }

  importBlueprintHash(hashString) {
    this.init();
    if (!hashString || typeof hashString !== 'string') {
      return { success: false, msg: 'Ungültiger Blaupausen-Code!' };
    }
    try {
      let clean = hashString.trim();
      if (clean.startsWith('LAYOUT_')) clean = clean.replace('LAYOUT_', '');
      const json = decodeURIComponent(atob(clean));
      const bp = JSON.parse(json);
      if (!bp || !bp.layout || !Array.isArray(bp.layout)) {
        return { success: false, msg: 'Fehlerhaftes Blaupausen-Format!' };
      }
      bp.id = `bp_${Date.now()}`;
      bp.name = (bp.name || 'Importierte Blaupause') + ' (Imported)';
      this.stateManager.state.blueprints.push(bp);
      if (window.SoundManager) window.SoundManager.playSuccess();
      return { success: true, msg: `📐 Blaupause "${bp.name}" erfolgreich importiert!` };
    } catch (e) {
      return { success: false, msg: 'Konnte Blaupausen-Code nicht parsen.' };
    }
  }
}

window.BlueprintMultiUpgradeManager = null;

