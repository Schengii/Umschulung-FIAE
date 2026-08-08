// --- DRAGON BREEDING & MYTHICAL MOUNTS SYSTEM ---

class DragonMountsManager {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.beasts = [
      { id: 'fire_dragon', name: '🐉 Uralter Feuerdrache', bonus: '+40% Kampfdamage & Feueratem-AoE', cost: { gold: 1500, gems: 20 } },
      { id: 'griffin', name: '🦅 Goldener Greif', bonus: '+35% Marschgeschwindigkeit & Fernkampf-Abwehr', cost: { gold: 1000, gems: 10 } },
      { id: 'panther', name: '🐆 Schattenpanther', bonus: '+50% Kritische Trefferchance des Helden', cost: { gold: 800, gems: 8 } }
    ];
  }

  init() {
    if (!stateManager.state.dragonMounts) {
      stateManager.state.dragonMounts = { activeMount: null, ownedBeasts: [] };
    }
  }

  showModal() {
    this.init();
    const mounts = stateManager.state.dragonMounts;

    let content = `
      <div style="padding: 10px;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">🐉 Drachennest & Mythische Reittiere</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 16px;">Züchte mächtige Bestien auf und rüste deinen Helden mit legendären Reittieren aus!</p>

        <div style="background: rgba(20,25,35,0.85); border: 1px solid #d4af37; border-radius: 6px; padding: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #fff;">Aktives Reittier:</strong>
            <div style="font-size: 0.9em; color: #4CAF50;">${mounts.activeMount ? mounts.activeMount.name : 'Kein Reittier ausgerüstet'}</div>
          </div>
          ${mounts.activeMount ? `
            <button onclick="window.dragonMountsManager.unequipMount()" style="padding: 6px 12px; background: #b22222; color: #fff; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
              Absatteln
            </button>
          ` : ''}
        </div>

        <h3 style="color: #e5c158; margin-bottom: 8px;">Bestiarium (Aufzucht):</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
    `;

    this.beasts.forEach(beast => {
      const isOwned = mounts.ownedBeasts.some(b => b.id === beast.id);
      const isActive = mounts.activeMount && mounts.activeMount.id === beast.id;

      content += `
        <div style="background: rgba(15,20,30,0.8); border: 1px solid ${isActive ? '#4CAF50' : 'rgba(255,255,255,0.1)'}; border-radius: 6px; padding: 10px;">
          <h4 style="color: #fff; margin-bottom: 4px;">${beast.name}</h4>
          <div style="font-size: 0.8em; color: #aaa; margin-bottom: 8px;">${beast.bonus}</div>
          ${isOwned ? `
            <button onclick="window.dragonMountsManager.equipMount('${beast.id}')"
                    style="width: 100%; padding: 6px; background: ${isActive ? '#4CAF50' : 'linear-gradient(135deg, #d4af37, #aa820a)'}; color: ${isActive ? '#fff' : '#111'}; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
              ${isActive ? '✓ Ausgerüstet' : '🏇 Aufsatteln'}
            </button>
          ` : `
            <div style="font-size: 0.75em; color: #888; margin-bottom: 8px;">
              Kosten: ${Object.entries(beast.cost).map(([k, v]) => `${v} ${k}`).join(', ')}
            </div>
            <button onclick="window.dragonMountsManager.breedBeast('${beast.id}')"
                    style="width: 100%; padding: 6px; background: linear-gradient(135deg, #4CAF50, #2E7D32); color: #fff; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
              🥚 Ausbrüten
            </button>
          `}
        </div>
      `;
    });

    content += `</div></div>`;
    this.gameUI.showModal('Drachennest & Reittiere', content);
  }

  breedBeast(beastId) {
    this.init();
    const beast = this.beasts.find(b => b.id === beastId);
    if (!beast) return;

    if (stateManager.state.gold < (beast.cost.gold || 0) ||
        stateManager.state.gems < (beast.cost.gems || 0)) {
      this.gameUI.showFloatingNotification('Nicht genug Gold oder Edelsteine zum Ausbrüten!');
      return;
    }

    stateManager.state.gold -= (beast.cost.gold || 0);
    stateManager.state.gems -= (beast.cost.gems || 0);

    stateManager.state.dragonMounts.ownedBeasts.push(beast);
    this.gameUI.showFloatingNotification(`🥚 Erzeugung erfolgreich! ${beast.name} schlüpft aus dem Ei!`);
    window.soundManager && window.soundManager.playUpgradeSound();
    this.showModal();
  }

  equipMount(beastId) {
    this.init();
    const beast = stateManager.state.dragonMounts.ownedBeasts.find(b => b.id === beastId);
    if (beast) {
      stateManager.state.dragonMounts.activeMount = beast;
      this.gameUI.showFloatingNotification(`🏇 ${beast.name} als aktives Reittier aufgezäumt!`);
      this.showModal();
    }
  }

  unequipMount() {
    this.init();
    stateManager.state.dragonMounts.activeMount = null;
    this.gameUI.showFloatingNotification('Reittier abgesattelt.');
    this.showModal();
  }
}

window.DragonMountsManager = DragonMountsManager;
