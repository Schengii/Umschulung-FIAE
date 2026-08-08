// --- INTERACTIVE WORLD MAP 2.0 & FOG OF WAR ---

class InteractiveWorldMap {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.gridWidth = 10;
    this.gridHeight = 10;
    this.scoutedTiles = {}; // key: "x_y" -> boolean
  }

  init() {
    if (!stateManager.state.worldMapScouted) {
      stateManager.state.worldMapScouted = { '4_4': true, '4_5': true, '5_4': true, '5_5': true };
    }
  }

  showModal() {
    this.init();

    let gridHtml = `<div style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 4px; background: #111; padding: 8px; border-radius: 8px; max-width: 500px; margin: 0 auto;">`;

    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const key = `${x}_${y}`;
        const isScouted = stateManager.state.worldMapScouted[key];
        const isHome = (x === 4 && y === 4);

        let icon = '🌲';
        let bg = 'rgba(30,50,30,0.6)';
        let label = 'Unbekannt';

        if (isHome) {
          icon = '🏰';
          bg = 'rgba(212,175,55,0.4)';
          label = 'Hauptburg';
        } else if (isScouted) {
          if ((x + y) % 3 === 0) { icon = '🏴‍☠️'; label = 'Raubritterfestung'; bg = 'rgba(100,30,30,0.6)'; }
          else if ((x + y) % 5 === 0) { icon = '🏛️'; label = 'Alte Ruine'; bg = 'rgba(60,60,100,0.6)'; }
          else if ((x + y) % 2 === 0) { icon = '⛏️'; label = 'Eisenvorkommen'; bg = 'rgba(70,70,70,0.6)'; }
          else { icon = '🏡'; label = 'Freies Land'; bg = 'rgba(40,70,40,0.6)'; }
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
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 4px;">🗺️ Interaktive Weltkarte & Nebel des Krieges</h2>
        <p style="font-size: 0.85em; color: #aaa; margin-bottom: 12px;">Sende Kundschafter aus (Kosten: 50 Gold), um unentdecktes Land freizulegen.</p>
        ${gridHtml}
      </div>
    `;

    this.gameUI.showModal('Weltkarte 2.0', content);
  }

  clickTile(x, y, isScouted) {
    const key = `${x}_${y}`;
    if (!isScouted) {
      if (stateManager.state.gold < 50) {
        this.gameUI.showFloatingNotification('Nicht genug Gold für Kundschafter! (50 Gold erforderlich)');
        return;
      }
      stateManager.state.gold -= 50;
      stateManager.state.worldMapScouted[key] = true;
      this.gameUI.showFloatingNotification(`🧭 Feld [${x},${y}] erkundet!`);
      this.showModal();
    } else {
      if (x === 4 && y === 4) {
        this.gameUI.showFloatingNotification('Das ist deine eigene Hauptburg.');
      } else if ((x + y) % 3 === 0) {
        this.gameUI.showFloatingNotification('🏴‍☠️ Raubritterfestung lokalisiert! Öffne das Raubritter-Panel für Angriff.');
      } else if ((x + y) % 5 === 0) {
        stateManager.state.gold += 100;
        stateManager.state.gems += 2;
        this.gameUI.showFloatingNotification('🏛️ Alte Ruine durchsucht: +100 Gold und +2 Edelsteine gefunden!');
        this.showModal();
      } else {
        this.gameUI.showFloatingNotification(`🌲 Erkundetes Land [${x},${y}]: Bereit für Kolonisierung oder Handelswege.`);
      }
    }
  }
}

window.InteractiveWorldMap = InteractiveWorldMap;
