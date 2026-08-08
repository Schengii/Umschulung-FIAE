// --- ASYNCHRONOUS PVP CASTLE DEFENSE CHALLENGES ---

class AsyncPvP {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
  }

  exportDefenseCode() {
    const defenseData = {
      level: stateManager.state.keepLevel || 1,
      name: stateManager.state.kingdomName || 'Königreich',
      army: stateManager.state.army || { spearman: 20, swordsman: 10, archer: 15, knight: 5 }
    };
    const code = btoa(JSON.stringify(defenseData));
    return code;
  }

  showModal() {
    const code = this.exportDefenseCode();

    const content = `
      <div style="padding: 10px;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">⚔️ Asynchroner PvP-Herausforderungsmodus</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 16px;">Exportiere deinen Verteidigungs-Code oder fordere die Festung eines anderen Spielers heraus!</p>

        <div style="background: rgba(20,25,35,0.8); border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; padding: 12px; margin-bottom: 16px;">
          <h3 style="color: #e5c158; margin-bottom: 6px;">Dein Burg-Verteidigungscode:</h3>
          <input type="text" readonly value="${code}" style="width: 100%; padding: 8px; background: #111; color: #ffd700; border: 1px solid #444; border-radius: 4px; font-family: monospace;" onclick="this.select()" />
          <p style="font-size: 0.75em; color: #888; margin-top: 4px;">Kopiere diesen Code und teile ihn mit Freunden.</p>
        </div>

        <div style="background: rgba(20,25,35,0.8); border: 1px solid rgba(212,175,55,0.3); border-radius: 6px; padding: 12px;">
          <h3 style="color: #e5c158; margin-bottom: 6px;">Gegnerischen Burg-Code herausfordern:</h3>
          <input type="text" id="pvp-code-input" placeholder="Füge den gegnerischen Code hier ein..." style="width: 100%; padding: 8px; background: #111; color: #fff; border: 1px solid #444; border-radius: 4px; margin-bottom: 10px;" />
          <button onclick="window.asyncPvP.challengeCode()" style="width: 100%; padding: 8px; background: linear-gradient(135deg, #b22222, #8b0000); color: #fff; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
            ⚔️ Angriff auf fremde Burg starten
          </button>
        </div>
      </div>
    `;

    this.gameUI.showModal('PvP Herausforderungen', content);
  }

  challengeCode() {
    const input = document.getElementById('pvp-code-input');
    if (!input || !input.value.trim()) {
      this.gameUI.showFloatingNotification('Bitte gib einen gültigen Burg-Code ein!');
      return;
    }

    try {
      const decoded = JSON.parse(atob(input.value.trim()));
      this.gameUI.showFloatingNotification(`⚔️ Schlachtenaufstellung gegen "${decoded.name}" vorbereitet!`);

      if (window.tacticalCombat) {
        window.tacticalCombat.startBattle({
          title: `PvP Duell vs. ${decoded.name}`,
          enemyName: decoded.name,
          enemyArmy: decoded.army || { spearman: 15, archer: 10 }
        });
      }
    } catch (e) {
      this.gameUI.showFloatingNotification('Fehlerhafter Burg-Code!');
    }
  }
}

window.AsyncPvP = AsyncPvP;
