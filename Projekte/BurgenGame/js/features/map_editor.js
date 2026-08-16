// --- VISUAL MAP & SCENARIO EDITOR (Option 2 Upgrade) ---

class VisualMapEditor {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.editorGrid = [];
    this.selectedTool = 'keep';
    this.gridSize = 10;
  }

  initEditor() {
    this.editorGrid = Array(this.gridSize).fill(null).map(() => Array(this.gridSize).fill('grass'));
    this.editorGrid[4][4] = 'keep';
  }

  setTile(x, y) {
    if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
      this.editorGrid[y][x] = this.selectedTool;
      this.showEditorModal();
    }
  }

  exportScenario() {
    const scenarioData = {
      name: "Benutzerdefiniertes Szenario",
      author: this.stateManager.state.rulerTitle || "Herrscher",
      version: "1.0",
      gridSize: this.gridSize,
      tiles: this.editorGrid
    };

    const jsonStr = JSON.stringify(scenarioData, null, 2);
    
    // Copy to clipboard or show in textarea
    if (navigator.clipboard) {
      navigator.clipboard.writeText(jsonStr);
      this.gameUI.showToast("📋 Szenario-JSON in Zwischenablage kopiert!", "success");
    } else {
      alert("Szenario-JSON:\n" + jsonStr);
    }
  }

  importScenario(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      if (data && data.tiles) {
        this.editorGrid = data.tiles;
        this.gridSize = data.gridSize || 10;
        this.gameUI.showToast("📥 Szenario erfolgreich geladen!", "success");
        this.showEditorModal();
      }
    } catch (e) {
      this.gameUI.showToast("Fehlerhaftes JSON-Format!", "error");
    }
  }

  showEditorModal() {
    if (this.editorGrid.length === 0) this.initEditor();

    let gridHtml = `<div style="display: grid; grid-template-columns: repeat(${this.gridSize}, 1fr); gap: 2px; background: #222; padding: 6px; border-radius: 6px; max-width: 420px; margin: 0 auto;">`;

    const iconMap = {
      grass: '🌱',
      keep: '🏰',
      woodcutter: '🪓',
      quarry: '⛏️',
      farm: '🌾',
      raubritter: '🏴‍☠️',
      water: '🌊',
      mountain: '⛰️'
    };

    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        const type = this.editorGrid[y][x];
        gridHtml += `
          <div onclick="window.mapEditor.setTile(${x}, ${y})"
               title="[${x},${y}] ${type}"
               style="aspect-ratio: 1; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 3px; display: flex; align-items: center; justify-content: center; font-size: 1.1em; cursor: pointer;">
            ${iconMap[type] || '🌱'}
          </div>
        `;
      }
    }
    gridHtml += `</div>`;

    const tools = [
      { id: 'grass', name: 'Wiese', icon: '🌱' },
      { id: 'keep', name: 'Burgfried', icon: '🏰' },
      { id: 'woodcutter', name: 'Holzfäller', icon: '🪓' },
      { id: 'quarry', name: 'Steinbruch', icon: '⛏️' },
      { id: 'farm', name: 'Farm', icon: '🌾' },
      { id: 'raubritter', name: 'Banditen', icon: '🏴‍☠️' },
      { id: 'water', name: 'Wasser', icon: '🌊' },
      { id: 'mountain', name: 'Berg', icon: '⛰️' }
    ];

    const toolButtons = tools.map(t => `
      <button onclick="window.mapEditor.selectedTool='${t.id}'; window.mapEditor.showEditorModal();"
              style="background: ${this.selectedTool === t.id ? '#d4af37' : '#333'}; color: ${this.selectedTool === t.id ? 'black' : 'white'}; border: none; padding: 4px 8px; border-radius: 4px; font-size: 0.8em; cursor: pointer;">
        ${t.icon} ${t.name}
      </button>
    `).join('');

    const content = `
      <div style="padding: 10px; max-width: 550px; margin: 0 auto; text-align: center;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 4px;">🗺️ Karten- & Szenario-Editor</h2>
        <p style="font-size: 0.85em; color: #aaa; margin-bottom: 10px;">Gestalte eigene Karten und teile sie als Mod-Szenarien.</p>

        <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: center; margin-bottom: 12px;">
          ${toolButtons}
        </div>

        ${gridHtml}

        <div style="display: flex; justify-content: space-between; margin-top: 15px;">
          <button onclick="window.mapEditor.exportScenario()" style="background: #2a8; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">📋 Szenario Exportieren (JSON)</button>
          <button onclick="window.mapEditor.promptImport()" style="background: #468; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">📥 Szenario Importieren</button>
        </div>
      </div>
    `;

    this.gameUI.showModal('Karten-Editor', content);
  }

  promptImport() {
    const val = prompt("Füge den Szenario-JSON Code hier ein:");
    if (val) this.importScenario(val);
  }
}

window.VisualMapEditor = VisualMapEditor;
