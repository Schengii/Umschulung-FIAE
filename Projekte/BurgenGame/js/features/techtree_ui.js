// --- VISUAL TECHNOLOGY TREE 2.0 MODAL ---

class VisualTechTree {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.trees = {
      military: {
        title: '⚔️ Militär & Taktik',
        nodes: [
          { id: 'm1', name: 'Schwertschmiedekunst', desc: '+15% Nahkampf-Schaden', cost: { gold: 200, iron: 150 }, req: [], level: 0, maxLevel: 3 },
          { id: 'm2', name: 'Verstärkte Bögen', desc: '+20% Fernkampf-Reichweite & Schaden', cost: { gold: 300, wood: 200 }, req: ['m1'], level: 0, maxLevel: 3 },
          { id: 'm3', name: 'Rittercodex', desc: 'Ritter erhalten +30% Rüstung', cost: { gold: 600, gems: 5 }, req: ['m2'], level: 0, maxLevel: 2 }
        ]
      },
      economy: {
        title: '🌾 Wirtschaft & Gilden',
        nodes: [
          { id: 'e1', name: 'Dreinutzungssystem', desc: '+20% Ressourcen-Ertrag', cost: { gold: 150, wood: 100 }, req: [], level: 0, maxLevel: 3 },
          { id: 'e2', name: 'Kaufmannskontore', desc: '+25% Markt-Golderlös', cost: { gold: 350, iron: 100 }, req: ['e1'], level: 0, maxLevel: 3 },
          { id: 'e3', name: 'Königliches Münzrecht', desc: '+30% Steuereinnahmen', cost: { gold: 800, gems: 10 }, req: ['e2'], level: 0, maxLevel: 2 }
        ]
      },
      engineering: {
        title: '🏰 Festungsbau & Architektur',
        nodes: [
          { id: 'eng1', name: 'Zugbrückenkonstruktion', desc: 'Burgtore halten 50% mehr Schaden aus', cost: { wood: 250, stone: 200 }, req: [], level: 0, maxLevel: 3 },
          { id: 'eng2', name: 'Pfeilturmbau', desc: 'Schaltet Pfeiltürme für Verteidigung frei', cost: { stone: 500, gold: 400 }, req: ['eng1'], level: 0, maxLevel: 1 },
          { id: 'eng3', name: 'Burggraben-Aushebung', desc: 'Schaltet Wassergraben-Verteidigung frei', cost: { stone: 800, gold: 600 }, req: ['eng2'], level: 0, maxLevel: 1 }
        ]
      },
      heroism: {
        title: '👑 Heroik & Mystik',
        nodes: [
          { id: 'h1', name: 'Heldenaltar-Riten', desc: '+25% Helden-Erfahrung', cost: { gold: 300, gems: 2 }, req: [], level: 0, maxLevel: 3 },
          { id: 'h2', name: 'Dungeon-Kartografie', desc: '+30% Beutechancen in Dungeons', cost: { gold: 500, gems: 5 }, req: ['h1'], level: 0, maxLevel: 3 },
          { id: 'h3', name: 'Drachentöter-Segen', desc: '+40% Schaden gegen Bossgegner', cost: { gold: 1000, gems: 15 }, req: ['h2'], level: 0, maxLevel: 2 }
        ]
      }
    };
  }

  showModal() {
    let content = `
      <div style="padding: 10px; max-height: 75vh; overflow-y: auto;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 5px;">📜 Technologie- & Forschungsbaum 2.0</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 20px;">Erforsche neue Doktrinen und Schalte epische Festungsbauten frei.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 15px;">
    `;

    for (const [branchKey, branch] of Object.entries(this.trees)) {
      content += `
        <div style="background: rgba(20,25,35,0.7); border: 1px solid rgba(212,175,55,0.3); border-radius: 8px; padding: 12px;">
          <h3 style="font-family: 'Cinzel', serif; color: #e5c158; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px;">${branch.title}</h3>
      `;

      branch.nodes.forEach(node => {
        const learned = (stateManager.state.researchedTechs && stateManager.state.researchedTechs[node.id]) || 0;
        const canAfford = stateManager.state.gold >= (node.cost.gold || 0) &&
                          stateManager.state.wood >= (node.cost.wood || 0) &&
                          stateManager.state.stone >= (node.cost.stone || 0) &&
                          stateManager.state.iron >= (node.cost.iron || 0) &&
                          stateManager.state.gems >= (node.cost.gems || 0);

        content += `
          <div style="margin-top: 10px; padding: 8px; background: rgba(0,0,0,0.3); border-radius: 6px; border-left: 3px solid ${learned >= node.maxLevel ? '#4CAF50' : '#d4af37'};">
            <div style="display: flex; justify-content: space-between; font-weight: bold; color: #fff;">
              <span>${node.name}</span>
              <span style="color: #ffd700;">[${learned}/${node.maxLevel}]</span>
            </div>
            <div style="font-size: 0.8em; color: #aaa; margin: 4px 0;">${node.desc}</div>
            <div style="font-size: 0.75em; color: #888;">
              Kosten: ${Object.entries(node.cost).map(([k, v]) => `${v} ${k}`).join(', ')}
            </div>
            ${learned < node.maxLevel ? `
              <button onclick="window.visualTechTree.researchNode('${node.id}', '${branchKey}')" 
                      style="margin-top: 6px; width: 100%; padding: 4px; background: ${canAfford ? 'linear-gradient(135deg, #d4af37, #aa820a)' : '#555'}; color: #111; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
                Erforschen
              </button>
            ` : `<div style="margin-top: 6px; text-align: center; color: #4CAF50; font-size: 0.8em; font-weight: bold;">✓ Vollständig erforscht</div>`}
          </div>
        `;
      });

      content += `</div>`;
    }

    content += `</div></div>`;
    this.gameUI.showModal('Forschungsbaum', content);
  }

  researchNode(nodeId, branchKey) {
    const branch = this.trees[branchKey];
    const node = branch.nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (!stateManager.state.researchedTechs) stateManager.state.researchedTechs = {};
    const curLevel = stateManager.state.researchedTechs[node.id] || 0;
    if (curLevel >= node.maxLevel) return;

    if (stateManager.state.gold < (node.cost.gold || 0) ||
        stateManager.state.wood < (node.cost.wood || 0) ||
        stateManager.state.stone < (node.cost.stone || 0) ||
        stateManager.state.iron < (node.cost.iron || 0) ||
        stateManager.state.gems < (node.cost.gems || 0)) {
      this.gameUI.showFloatingNotification('Nicht genügend Rohstoffe für diese Forschung!');
      return;
    }

    stateManager.state.gold -= (node.cost.gold || 0);
    stateManager.state.wood -= (node.cost.wood || 0);
    stateManager.state.stone -= (node.cost.stone || 0);
    stateManager.state.iron -= (node.cost.iron || 0);
    stateManager.state.gems -= (node.cost.gems || 0);

    stateManager.state.researchedTechs[node.id] = curLevel + 1;
    stateManager.save();

    if (navigator.vibrate) {
      try { navigator.vibrate(60); } catch(e) {}
    }
    if (window.gameSound) window.gameSound.playSFX('upgrade');

    this.gameUI.showFloatingNotification(`💡 Forschung "${node.name}" Stufe ${curLevel + 1} freigeschaltet!`);
    this.showModal();
  }
}

window.VisualTechTree = VisualTechTree;
