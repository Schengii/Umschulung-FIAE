// --- INTERACTIVE WORLD MAP 2.0 & FOG OF WAR (Infinite Procedural Map) ---

class InteractiveWorldMap {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.viewportX = 0;
    this.viewportY = 0;
    this.noiseGen = null;
  }

  init() {
    if (!stateManager.state.worldMapScouted) {
      // Home is at 0,0 now. Reveal home area
      stateManager.state.worldMapScouted = { 
        '0_0': true, '0_1': true, '1_0': true, '1_1': true,
        '0_-1': true, '-1_0': true, '-1_-1': true, '1_-1': true, '-1_1': true
      };
    }
    
    // Initialize Seed for map generation
    if (!stateManager.state.mapSeed) {
      stateManager.state.mapSeed = Math.random();
    }
    if (!this.noiseGen) {
      this.noiseGen = new PerlinNoise(stateManager.state.mapSeed);
    }
  }

  getTileType(x, y) {
    if (x === 0 && y === 0) return 'HOME';
    
    const noiseVal = this.noiseGen.get(x * 0.1, y * 0.1);
    
    // Procedural biomes based on noise
    if (noiseVal > 0.8) return 'MOUNTAIN';
    if (noiseVal < 0.2) return 'WATER';
    
    // Procedural entities (pseudo-random using a fast hash for x, y)
    const hash = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453);
    const frac = hash - Math.floor(hash);
    
    if (frac < 0.05) return 'RAUBRITTER';
    if (frac > 0.05 && frac < 0.08) return 'RUIN';
    if (frac > 0.08 && frac < 0.12 && noiseVal > 0.6) return 'IRON';
    if (frac > 0.12 && frac < 0.15 && noiseVal < 0.4) return 'LAKE';
    
    return 'FOREST';
  }

  pan(dx, dy) {
    this.viewportX += dx;
    this.viewportY += dy;
    this.showModal();
  }

  showModal() {
    this.init();

    const viewSize = 9; // 9x9 grid view
    const halfView = Math.floor(viewSize / 2);

    let gridHtml = `<div style="display: grid; grid-template-columns: repeat(${viewSize}, 1fr); gap: 4px; background: #111; padding: 8px; border-radius: 8px; max-width: 500px; margin: 0 auto;">`;

    for (let y = this.viewportY - halfView; y <= this.viewportY + halfView; y++) {
      for (let x = this.viewportX - halfView; x <= this.viewportX + halfView; x++) {
        const key = `${x}_${y}`;
        const isScouted = stateManager.state.worldMapScouted[key];
        const tileType = this.getTileType(x, y);

        let icon = '🌲';
        let bg = 'rgba(30,50,30,0.6)';
        let label = 'Unbekannt';

        if (isScouted) {
          switch(tileType) {
            case 'HOME': icon = '🏰'; bg = 'rgba(212,175,55,0.4)'; label = 'Hauptburg'; break;
            case 'MOUNTAIN': icon = '⛰️'; bg = 'rgba(80,80,80,0.6)'; label = 'Gebirge'; break;
            case 'WATER': icon = '🌊'; bg = 'rgba(30,30,80,0.6)'; label = 'Gewässer'; break;
            case 'RAUBRITTER': icon = '🏴‍☠️'; bg = 'rgba(100,30,30,0.6)'; label = 'Raubritterfestung'; break;
            case 'RUIN': icon = '🏛️'; bg = 'rgba(60,60,100,0.6)'; label = 'Alte Ruine'; break;
            case 'IRON': icon = '⛏️'; bg = 'rgba(70,70,70,0.6)'; label = 'Eisenvorkommen'; break;
            case 'LAKE': icon = '🐟'; bg = 'rgba(40,60,90,0.6)'; label = 'Fischteich'; break;
            case 'FOREST': icon = '🌲'; bg = 'rgba(40,70,40,0.6)'; label = 'Freies Land'; break;
          }
        } else {
          icon = '🌫️';
          bg = 'rgba(15,15,20,0.9)';
          label = 'Nebel des Krieges';
        }

        gridHtml += `
          <div onclick="window.interactiveWorldMap.clickTile(${x}, ${y}, ${isScouted ? 'true' : 'false'})"
               title="[${x},${y}] ${label}"
               style="aspect-ratio: 1; background: ${bg}; border: 1px solid rgba(255,255,255,0.1); border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 1.3em; cursor: pointer; transition: transform 0.1s;"
               onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">
            ${icon}
          </div>
        `;
      }
    }
    gridHtml += `</div>`;

    const content = `
      <div style="text-align: center; padding: 5px;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 4px;">🗺️ Interaktive Weltkarte (Unendlich)</h2>
        <p style="font-size: 0.85em; color: #aaa; margin-bottom: 12px;">Sende Kundschafter aus (Kosten: 50 Gold), um unentdecktes Land freizulegen.</p>
        
        <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 10px;">
          <button onclick="window.interactiveWorldMap.pan(0, -3)" style="padding: 5px 15px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer;">⬆️ Hoch</button>
        </div>
        <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 10px;">
          <button onclick="window.interactiveWorldMap.pan(-3, 0)" style="padding: 5px 15px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer;">⬅️ Links</button>
          <button onclick="window.interactiveWorldMap.viewportX=0; window.interactiveWorldMap.viewportY=0; window.interactiveWorldMap.showModal()" style="padding: 5px 15px; background: #d4af37; color: black; border: none; border-radius: 4px; cursor: pointer;">🏰 Hauptburg</button>
          <button onclick="window.interactiveWorldMap.pan(3, 0)" style="padding: 5px 15px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer;">➡️ Rechts</button>
        </div>
        <div style="display: flex; justify-content: center; gap: 10px; margin-bottom: 10px;">
          <button onclick="window.interactiveWorldMap.pan(0, 3)" style="padding: 5px 15px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer;">⬇️ Runter</button>
        </div>

        ${gridHtml}
        <div style="margin-top: 10px; font-size: 0.8em; color: #888;">Koordinaten: [${this.viewportX}, ${this.viewportY}]</div>
      </div>
    `;

    this.gameUI.showModal('Weltkarte 2.0', content);
  }

  clickTile(x, y, isScouted) {
    const key = `${x}_${y}`;
    if (!isScouted) {
      if (stateManager.state.resources.gold < 50) {
        this.gameUI.showFloatingNotification('Nicht genug Gold für Kundschafter! (50 Gold erforderlich)');
        return;
      }
      stateManager.state.resources.gold -= 50;
      stateManager.state.worldMapScouted[key] = true;
      this.gameUI.showFloatingNotification(`🧭 Feld [${x},${y}] erkundet!`);
      this.showModal();
    } else {
      const tileType = this.getTileType(x, y);
      
      if (tileType === 'HOME') {
        this.gameUI.showFloatingNotification('Das ist deine eigene Hauptburg.');
      } else if (tileType === 'RAUBRITTER') {
        // Find if this specific coordinate has a generated NPC ID
        const npcId = `npc_${x}_${y}`;
        this.gameUI.showFloatingNotification('🏴‍☠️ Raubritterfestung lokalisiert! Angriff über Angriffsmenü möglich.');
        // Note: Dynamic NPCs need to be injected into WORLD_MAP_CONFIG.npcCastles for the rest of the game to see them
        if (!WORLD_MAP_CONFIG.npcCastles.find(c => c.id === npcId)) {
           const level = Math.max(1, Math.floor(Math.abs(x) + Math.abs(y)) % 10 + 1);
           WORLD_MAP_CONFIG.npcCastles.push({
             id: npcId,
             name: `Banditenlager [${x},${y}]`,
             level: level,
             travelTime: Math.abs(x) + Math.abs(y) * 5, // further away = longer travel
             defenders: { spearman: level * 2, swordsman: level * 1 },
             loot: { gold: level * 50, wood: level * 10, stone: level * 10, rubies: level > 5 ? 2 : 0 }
           });
        }
      } else if (tileType === 'RUIN') {
        if (!stateManager.state.clearedRuins) stateManager.state.clearedRuins = {};
        if (stateManager.state.clearedRuins[key]) {
          this.gameUI.showFloatingNotification('Diese Ruine wurde bereits vollständig durchsucht.');
        } else {
          stateManager.state.resources.gold += 100;
          stateManager.state.resources.rubies += 2;
          stateManager.state.clearedRuins[key] = true;
          this.gameUI.showFloatingNotification('🏛️ Alte Ruine durchsucht: +100 Gold und +2 Rubine gefunden!');
        }
        this.showModal();
      } else if (tileType === 'IRON') {
        this.gameUI.showFloatingNotification('⛏️ Hier könnte ein Außenposten (Eisenvorkommen) errichtet werden.');
      } else if (tileType === 'LAKE') {
        this.gameUI.showFloatingNotification('🐟 Reiche Fischgründe. Ein guter Ort für Kolonisierung.');
      } else if (tileType === 'MOUNTAIN' || tileType === 'WATER') {
        this.gameUI.showFloatingNotification('Unpassierbares Gelände.');
      } else {
        this.gameUI.showFloatingNotification(`🌲 Erkundetes Land [${x},${y}]: Bereit für Kolonisierung oder Handelswege.`);
      }
    }
  }
}

window.InteractiveWorldMap = InteractiveWorldMap;
