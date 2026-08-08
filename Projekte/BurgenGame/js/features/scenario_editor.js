// --- IN-GAME SCENARIO & CAMPAIGN EDITOR ---

class ScenarioEditor {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.customScenario = {
      title: 'Neues Custom-Szenario',
      startingGold: 1000,
      startingWood: 500,
      objectiveType: 'gold_target', // gold_target, defeat_boss, survive_seasons
      targetValue: 5000
    };
  }

  showModal() {
    let content = `
      <div style="padding: 10px; max-height: 75vh; overflow-y: auto;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">⚒️ Szenario- & Kampagnen-Editor</h2>
        <p style="font-size: 0.85em; color: #ccc; margin-bottom: 16px;">Erstelle eigene Herausforderungen, passe Startbedingungen an und teile deine Szenarien!</p>

        <div style="background: rgba(20,25,35,0.85); border: 1px solid #d4af37; border-radius: 6px; padding: 12px; margin-bottom: 15px;">
          <label style="color: #ffd700; font-size: 0.85em; display: block; margin-bottom: 4px;">Szenario-Titel:</label>
          <input type="text" id="scen-title" value="${this.customScenario.title}" style="width: 100%; padding: 6px; background: #111; color: #fff; border: 1px solid #555; border-radius: 4px; margin-bottom: 10px;" />

          <label style="color: #ffd700; font-size: 0.85em; display: block; margin-bottom: 4px;">Start-Gold:</label>
          <input type="number" id="scen-gold" value="${this.customScenario.startingGold}" style="width: 100%; padding: 6px; background: #111; color: #fff; border: 1px solid #555; border-radius: 4px; margin-bottom: 10px;" />

          <label style="color: #ffd700; font-size: 0.85em; display: block; margin-bottom: 4px;">Siegbedingung:</label>
          <select id="scen-obj" style="width: 100%; padding: 6px; background: #111; color: #fff; border: 1px solid #555; border-radius: 4px; margin-bottom: 15px;">
            <option value="gold_target">Akkumuliere Gold-Ziel</option>
            <option value="defeat_boss">Besiege den Drachen-Weltboss</option>
            <option value="survive_seasons">Überlebe 8 Jahreszeiten</option>
          </select>

          <button onclick="window.scenarioEditor.exportScenario()" style="width: 100%; padding: 8px; background: linear-gradient(135deg, #d4af37, #aa820a); color: #111; font-weight: bold; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 8px;">
            💾 Szenario Exportieren (JSON)
          </button>
          <button onclick="window.scenarioEditor.applyScenario()" style="width: 100%; padding: 8px; background: linear-gradient(135deg, #2ecc71, #27ae60); color: #fff; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
            ▶️ Szenario Jetzt Starten
          </button>
        </div>
      </div>
    `;

    this.gameUI.showModal('Szenario-Editor', content);
  }

  exportScenario() {
    const title = document.getElementById('scen-title')?.value || 'Custom';
    const gold = parseInt(document.getElementById('scen-gold')?.value || '1000');

    const data = JSON.stringify({ title, gold, createdAt: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '_')}_scenario.json`;
    a.click();
    this.gameUI.showFloatingNotification('💾 Szenario-Datei heruntergeladen!');
  }

  applyScenario() {
    const gold = parseInt(document.getElementById('scen-gold')?.value || '1000');
    stateManager.state.gold = gold;
    stateManager.save();
    this.gameUI.showFloatingNotification('▶️ Custom Szenario angewendet!');
    if (window.gameSound) window.gameSound.playSFX('quest');
    this.gameUI.closeModal();
  }
}

window.ScenarioEditor = ScenarioEditor;
