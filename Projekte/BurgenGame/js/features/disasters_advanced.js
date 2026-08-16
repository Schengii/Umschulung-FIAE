// --- ADVANCED DISASTERS & WEATHER 3.0 SYSTEM (Option 2 Upgrade) ---

class AdvancedDisastersEngine {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.activeDisaster = null;
  }

  init() {
    // Check disaster chance every 60 seconds
    setInterval(() => this.checkRandomDisaster(), 60000);
  }

  checkRandomDisaster() {
    if (this.activeDisaster) return;

    const roll = Math.random();
    if (roll < 0.25) { // 25% chance per minute
      const types = ['lightning', 'heatwave', 'earthquake'];
      const disasterType = types[Math.floor(Math.random() * types.length)];
      this.triggerDisaster(disasterType);
    }
  }

  triggerDisaster(type) {
    const state = this.stateManager.state;
    if (!state.buildings || state.buildings.length === 0) return;

    if (type === 'lightning') {
      const targetB = state.buildings[Math.floor(Math.random() * state.buildings.length)];
      const config = BUILDINGS_CONFIG[targetB.type];
      
      // Fire Station Check
      const fireStation = state.buildings.some(b => b.type === 'fire_station' && !b.underConstruction);

      if (fireStation) {
        this.gameUI.showToast(`⚡ Blitzeinschlag nahe ${config ? config.name : 'Burg'}! Die Feuerwehr hat den Brand sofort gelöscht.`, 'info');
      } else {
        targetB.underConstruction = true;
        targetB.constructionTimeRemaining = 20;
        targetB.constructionTimeTotal = 20;
        this.gameUI.showToast(`🔥 Blitzeinschlag! ${config ? config.name : 'Ein Gebäude'} wurde beschädigt und muss repariert werden!`, 'error');
        if (window.gameSound) window.gameSound.playSfx('battle');
      }
    } else if (type === 'heatwave') {
      this.activeDisaster = { type: 'heatwave', duration: 30 };
      this.gameUI.showToast("☀️ Dürrewelle! Ernteerträge um 50% gesenkt für 30 Sekunden.", "warning");
      
      setTimeout(() => {
        this.activeDisaster = null;
        this.gameUI.showToast("🌾 Die Dürrewelle ist vorüber. Ernten normalisieren sich.", "success");
      }, 30000);
    } else if (type === 'earthquake') {
      state.resources.stone = Math.max(0, (state.resources.stone || 0) - 50);
      this.gameUI.showToast("🌋 Leichtes Erdbeben! -50 Stein durch Einstürze an der Stadtmauer.", "error");
      if (window.gameSound) window.gameSound.playSfx('build');
    }

    this.stateManager.save();
    this.stateManager.notifyListeners('disaster_event');
  }

  issueEvacuationOrder() {
    if (this.stateManager.state.resources.gold < 100) {
      this.gameUI.showToast("Für einen Evakuierungs-Erlass werden 100 Gold benötigt!", "error");
      return;
    }

    this.stateManager.state.resources.gold -= 100;
    this.stateManager.state.happiness = Math.min(100, (this.stateManager.state.happiness || 50) + 20);
    this.gameUI.showToast("📢 Evakuierungs-Erlass verkündet! Bürger sind dankbar (+20 Zufriedenheit).", "success");
    this.stateManager.save();
  }

  showDisasterModal() {
    const fireStationBuilt = this.stateManager.state.buildings?.some(b => b.type === 'fire_station');

    const content = `
      <div style="padding: 10px; max-width: 550px; margin: 0 auto; text-align: center;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 4px;">⚡ Katastrophenschutz & Wetter 3.0</h2>
        <p style="font-size: 0.85em; color: #aaa; margin-bottom: 15px;">Schütze deine Burg vor Blitzeinschlägen, Dürre und Erdbeben.</p>

        <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 8px; margin-bottom: 15px; text-align: left;">
          <h4 style="color: #d4af37; margin-bottom: 5px;">Status des Katastrophenschutzes:</h4>
          <div>🚒 Feuerwehrhaus: ${fireStationBuilt ? '<span style="color: #5f5;">Errichtet (Schutz aktiv)</span>' : '<span style="color: #f55;">Nicht vorhanden (Hohes Brandrisiko)</span>'}</div>
          <div>Aktuelle Wetterbedrohung: ${this.activeDisaster ? `<span style="color: #f82;">${this.activeDisaster.type.toUpperCase()}</span>` : '<span style="color: #aaa;">Keine akute Gefahr</span>'}</div>
        </div>

        <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
          <button onclick="window.advancedDisasters.triggerDisaster('lightning')" style="background: #a44; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">⚡ Blitzschlag testen</button>
          <button onclick="window.advancedDisasters.issueEvacuationOrder()" style="background: #2a8; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">📢 Evakuieren (100 Gold)</button>
        </div>
      </div>
    `;

    this.gameUI.showModal('Katastrophenschutz 3.0', content);
  }
}

window.AdvancedDisastersEngine = AdvancedDisastersEngine;
