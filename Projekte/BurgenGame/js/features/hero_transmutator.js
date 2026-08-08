// --- HERO EQUIPMENT VISUALIZER & RELIC TRANSMUTATOR 2.0 ---

class HeroTransmutator {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.rarities = ['common', 'rare', 'epic', 'legendary'];
  }

  showModal() {
    if (!stateManager.state.heroInventory) {
      stateManager.state.heroInventory = [];
    }

    const inventory = stateManager.state.heroInventory;

    let content = `
      <div style="padding: 10px;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">🔮 Relikt-Transmutator & Schmelze</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 16px;">Verschmelze 3 Gegenstände derselben Seltenheitsstufe zu einem mächtigeren Artefakt der nächsthöheren Stufe!</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 20px;">
    `;

    this.rarities.slice(0, 3).forEach(rarity => {
      const matchingItems = inventory.filter(item => item.rarity === rarity);
      const count = matchingItems.length;
      const canTransmute = count >= 3;

      content += `
        <div style="background: rgba(20,25,35,0.85); border: 1px solid ${this.getRarityColor(rarity)}; border-radius: 6px; padding: 12px; text-align: center;">
          <h3 style="color: ${this.getRarityColor(rarity)}; text-transform: capitalize; margin-bottom: 4px;">${rarity} Artefakte</h3>
          <div style="font-size: 0.85em; color: #aaa; margin-bottom: 10px;">Vorhanden: <strong>${count}</strong> Stk.</div>
          <button onclick="window.heroTransmutator.transmuteRarity('${rarity}')"
                  style="width: 100%; padding: 6px; background: ${canTransmute ? 'linear-gradient(135deg, #d4af37, #aa820a)' : '#444'}; color: ${canTransmute ? '#111' : '#888'}; font-weight: bold; border: none; border-radius: 4px; cursor: ${canTransmute ? 'pointer' : 'not-allowed'};"
                  ${canTransmute ? '' : 'disabled'}>
            ✨ 3x Verschmelzen (${rarity.toUpperCase()})
          </button>
        </div>
      `;
    });

    content += `
        </div>
        <h3 style="color: #e5c158; margin-bottom: 8px;">Dein Inventar (${inventory.length} Gegenstände):</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 8px; max-height: 250px; overflow-y: auto; background: #111; padding: 8px; border-radius: 6px;">
          ${inventory.length === 0 ? '<p style="color: #666; font-style: italic; grid-column: 1/-1;">Inventar ist leer. Erkunde Dungeons für Beute!</p>' : ''}
          ${inventory.map(item => `
            <div style="background: rgba(30,35,45,0.8); border: 1px solid ${this.getRarityColor(item.rarity)}; border-radius: 4px; padding: 6px; font-size: 0.8em;">
              <div style="font-weight: bold; color: ${this.getRarityColor(item.rarity)}; truncate;">${item.name || 'Artefakt'}</div>
              <div style="color: #888; font-size: 0.75em;">${item.rarity || 'common'}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    this.gameUI.showModal('Relikt-Transmutator', content);
  }

  getRarityColor(rarity) {
    switch (rarity) {
      case 'common': return '#9e9e9e';
      case 'rare': return '#2196F3';
      case 'epic': return '#9C27B0';
      case 'legendary': return '#FFD700';
      default: return '#ccc';
    }
  }

  transmuteRarity(rarity) {
    const inventory = stateManager.state.heroInventory || [];
    const matchingIndices = [];

    inventory.forEach((item, index) => {
      if (item.rarity === rarity && matchingIndices.length < 3) {
        matchingIndices.push(index);
      }
    });

    if (matchingIndices.length < 3) {
      this.gameUI.showFloatingNotification('Du benötigst 3 Gegenstände derselben Seltenheit zum Verschmelzen!');
      return;
    }

    // Remove 3 items (backwards to preserve index alignment)
    matchingIndices.sort((a, b) => b - a).forEach(i => inventory.splice(i, 1));

    const nextRarityIndex = this.rarities.indexOf(rarity) + 1;
    const nextRarity = this.rarities[nextRarityIndex] || 'legendary';

    const newItem = {
      id: 'art_' + Math.random().toString(36).substr(2, 9),
      name: `Verschmolzenes ${nextRarity.toUpperCase()}-Relikt`,
      rarity: nextRarity,
      statBonus: { attack: 15, defense: 15 }
    };

    inventory.push(newItem);
    this.gameUI.showFloatingNotification(`✨ Erstellung erfolgreich! Neus Relikt: ${newItem.name}`);
    window.soundManager && window.soundManager.playUpgradeSound();
    this.showModal();
  }
}

window.HeroTransmutator = HeroTransmutator;
