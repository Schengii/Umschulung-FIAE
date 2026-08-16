// --- MODDING ENGINE & PLUGIN SYSTEM ---

class ModManager {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.loadedMods = [];
    this.eventListeners = {};
  }

  init() {
    this.loadSavedMods();
  }

  loadSavedMods() {
    try {
      const saved = localStorage.getItem('burgen_game_mods');
      if (saved) {
        const mods = JSON.parse(saved);
        mods.forEach(modData => {
          this.applyMod(modData, false);
        });
      }
    } catch (e) {
      console.error("Fehler beim Laden der Mods:", e);
    }
  }

  saveMods() {
    const data = this.loadedMods.map(m => ({
      id: m.id,
      name: m.name,
      version: m.version,
      author: m.author,
      description: m.description,
      code: m.code,
      json: m.json,
      enabled: m.enabled
    }));
    localStorage.setItem('burgen_game_mods', JSON.stringify(data));
  }

  registerBuilding(buildingConfig) {
    if (!buildingConfig || !buildingConfig.id) {
      console.error("Ungültige Gebäude-Mod-Konfiguration!");
      return false;
    }
    const typeId = buildingConfig.id.toUpperCase();
    BUILDING_TYPES[typeId] = typeId;
    BUILDINGS_CONFIG[typeId] = buildingConfig;
    if (this.gameUI && this.gameUI.showToast) {
      this.gameUI.showToast(`Mod-Gebäude registriert: ${buildingConfig.name}`, 'success');
    }
    return true;
  }

  registerTroop(troopConfig) {
    if (!troopConfig || !troopConfig.id) {
      console.error("Ungültige Truppen-Mod-Konfiguration!");
      return false;
    }
    TROOPS_CONFIG[troopConfig.id] = troopConfig;
    if (this.gameUI && this.gameUI.showToast) {
      this.gameUI.showToast(`Mod-Einheit registriert: ${troopConfig.name}`, 'success');
    }
    return true;
  }

  on(eventName, callback) {
    if (!this.eventListeners[eventName]) {
      this.eventListeners[eventName] = [];
    }
    this.eventListeners[eventName].push(callback);
  }

  trigger(eventName, data) {
    if (this.eventListeners[eventName]) {
      this.eventListeners[eventName].forEach(fn => {
        try {
          fn(data, this.stateManager);
        } catch (e) {
          console.error(`Mod-Event-Fehler [${eventName}]:`, e);
        }
      });
    }
  }

  applyMod(modData, shouldSave = true) {
    if (!modData || !modData.id) return false;
    
    // Check if already loaded
    if (this.loadedMods.some(m => m.id === modData.id)) {
      console.warn(`Mod ${modData.id} ist bereits geladen.`);
      return false;
    }

    try {
      // 1. JSON-based Mod declarations
      if (modData.json) {
        const parsed = typeof modData.json === 'string' ? JSON.parse(modData.json) : modData.json;
        if (parsed.buildings) {
          parsed.buildings.forEach(b => this.registerBuilding(b));
        }
        if (parsed.troops) {
          parsed.troops.forEach(t => this.registerTroop(t));
        }
      }

      // 2. JS-based Mod code execution
      if (modData.code) {
        const modFunction = new Function('modAPI', 'stateManager', 'gameUI', modData.code);
        modFunction(this, this.stateManager, this.gameUI);
      }

      modData.enabled = true;
      this.loadedMods.push(modData);

      if (shouldSave) {
        this.saveMods();
      }

      return true;
    } catch (e) {
      console.error(`Fehler beim Aktivieren der Mod [${modData.name}]:`, e);
      if (this.gameUI && this.gameUI.showToast) {
        this.gameUI.showToast(`Fehler in Mod ${modData.name}: ${e.message}`, 'error');
      }
      return false;
    }
  }

  removeMod(modId) {
    this.loadedMods = this.loadedMods.filter(m => m.id !== modId);
    this.saveMods();
    if (this.gameUI && this.gameUI.showToast) {
      this.gameUI.showToast(`Mod entfernt. Lade das Spiel neu!`, 'info');
    }
  }

  showModManagerModal() {
    const modListHtml = this.loadedMods.length === 0 
      ? `<p style="color: #888; font-style: italic;">Keine Mods installiert.</p>`
      : this.loadedMods.map(m => `
        <div style="background: rgba(255,255,255,0.05); padding: 10px; margin-bottom: 8px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #d4af37;">${m.name} v${m.version || '1.0'}</strong> <span style="font-size: 0.8em; color: #aaa;">von ${m.author || 'Unbekannt'}</span>
            <div style="font-size: 0.85em; color: #ccc; margin-top: 2px;">${m.description || 'Keine Beschreibung'}</div>
          </div>
          <button onclick="window.modManager.removeMod('${m.id}'); window.modManager.showModManagerModal();" style="background: #a22; color: white; border: none; padding: 4px 8px; border-radius: 4px; cursor: pointer;">Löschen</button>
        </div>
      `).join('');

    const modalContent = `
      <div style="padding: 10px; max-width: 600px; margin: 0 auto; color: #eee;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 10px;">🧩 Modding & Plugin Manager</h2>
        <p style="font-size: 0.9em; color: #aaa; margin-bottom: 15px;">Füge neue Gebäude, Einheiten oder Skripte über JSON- oder JS-Mods hinzu.</p>
        
        <h4 style="color: #d4af37; margin-bottom: 5px;">Installierte Mods:</h4>
        <div style="max-height: 200px; overflow-y: auto; margin-bottom: 20px;">
          ${modListHtml}
        </div>

        <h4 style="color: #d4af37; margin-bottom: 5px;">Neue Mod hinzufügen (JSON / JS):</h4>
        <textarea id="mod-input-code" placeholder='Beispiel JSON Mod:\n{\n  "id": "magic_tower",\n  "name": "Magieturm",\n  "buildings": [{\n    "id": "magic_tower",\n    "name": "Magieturm",\n    "baseWidth": 2,\n    "baseHeight": 2,\n    "levels": {\n      "1": { "cost": { "gold": 100, "stone": 50 }, "time": 10, "production": { "rubies": 0.1 } }\n    }\n  }]\n}' style="width: 100%; height: 120px; background: #222; color: #5f5; font-family: monospace; border: 1px solid #444; border-radius: 6px; padding: 8px; font-size: 0.85em; margin-bottom: 10px;"></textarea>
        
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button onclick="window.modManager.installSampleMod(); window.modManager.showModManagerModal();" style="background: #446; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">Beispiel-Mod laden</button>
          <button onclick="window.modManager.handleUserModSubmit()" style="background: #2a8; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">Mod Installieren</button>
        </div>
      </div>
    `;

    this.gameUI.showModal('Mod Manager', modalContent);
  }

  handleUserModSubmit() {
    const val = document.getElementById('mod-input-code').value.trim();
    if (!val) return;

    try {
      if (val.startsWith('{')) {
        const json = JSON.parse(val);
        this.applyMod({
          id: json.id || `mod_${Date.now()}`,
          name: json.name || 'Custom JSON Mod',
          version: json.version || '1.0',
          author: json.author || 'Spieler',
          description: json.description || 'Über JSON importierte Mod.',
          json: json
        });
      } else {
        this.applyMod({
          id: `js_mod_${Date.now()}`,
          name: 'Custom Script Mod',
          version: '1.0',
          author: 'Spieler',
          description: 'Benutzerdefiniertes JavaScript Skript.',
          code: val
        });
      }
      this.showModManagerModal();
    } catch (e) {
      alert("Fehler beim Parsen der Mod: " + e.message);
    }
  }

  installSampleMod() {
    const sampleMod = {
      id: "sample_dragon_lair",
      name: "Drachenhort & Zauberer Mod",
      version: "1.2",
      author: "BurgenGame Team",
      description: "Fügt den Zauberer als Spezialeinheit und den Drachenhort als Gebäude hinzu.",
      json: {
        buildings: [{
          id: "dragon_lair",
          name: "Drachenhort",
          baseWidth: 3,
          baseHeight: 3,
          levels: {
            "1": { cost: { gold: 500, stone: 300, rubies: 10 }, time: 20, production: { gold: 50 } },
            "2": { cost: { gold: 1000, stone: 600, rubies: 25 }, time: 40, production: { gold: 120 } }
          }
        }],
        troops: [{
          id: "wizard",
          name: "Erzmagier",
          time: 15,
          cost: { gold: 150, rubies: 1 },
          stats: { attackMelee: 10, attackRanged: 80, defenseMelee: 20, defenseRanged: 40, lootCapacity: 30 }
        }]
      }
    };
    this.applyMod(sampleMod);
  }
}

window.ModManager = ModManager;
