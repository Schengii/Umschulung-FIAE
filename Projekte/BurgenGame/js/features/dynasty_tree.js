// --- VISUAL DYNASTY FAMILY TREE SYSTEM (Option C) ---

class DynastyTree {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.family = null;
  }

  init() {
    if (!this.stateManager.state.dynastyFamily) {
      this.generateDefaultFamily();
    } else {
      this.family = this.stateManager.state.dynastyFamily;
    }
  }

  generateDefaultFamily() {
    const rulerName = this.stateManager.state.rulerTitle || 'König Friedrich I.';
    this.family = {
      monarch: {
        name: rulerName,
        title: 'König von Burgenland',
        gender: 'male',
        age: 42,
        trait: { name: 'Eiserne Faust', bonus: '+10% Angriff', effect: 'attack' }
      },
      consort: {
        name: 'Königin Eleonore',
        title: 'Königin-Gemahlin',
        gender: 'female',
        age: 39,
        trait: { name: 'Diplomatin', bonus: '+15% Steuern', effect: 'tax' }
      },
      heirIndex: 0,
      children: [
        {
          name: 'Prinz Alexander',
          gender: 'male',
          age: 18,
          trait: { name: 'Kriegerblut', bonus: '+15% Nahkampf', effect: 'attack' },
          married: false
        },
        {
          name: 'Przessin Isabella',
          gender: 'female',
          age: 16,
          trait: { name: 'Midas-Händchen', bonus: '+20% Goldproduktion', effect: 'gold' },
          married: false
        },
        {
          name: 'Prinz Leopold',
          gender: 'male',
          age: 12,
          trait: { name: 'Meisterarchitekt', bonus: '-15% Bauzeit', effect: 'build' },
          married: false
        }
      ]
    };
    this.stateManager.state.dynastyFamily = this.family;
  }

  arrangeMarriage(childIndex) {
    const child = this.family.children[childIndex];
    if (!child || child.married) return;

    if (this.stateManager.state.resources.gold < 300) {
      this.gameUI.showToast("Für eine königliche Hochzeit sind 300 Gold erforderlich!", "error");
      return;
    }

    this.stateManager.state.resources.gold -= 300;
    child.married = true;
    child.spouseName = child.gender === 'male' ? 'Herzogin Beatrice' : 'Graf Heinrich';
    
    // Add dynamic birth chance / bonus
    this.gameUI.showToast(`👑 Hochzeitsfanfaren! ${child.name} hat ${child.spouseName} geheiratet! (+25% Allianz-Tribut)`, "success");
    this.stateManager.save();
    this.showModal();
  }

  setHeir(childIndex) {
    if (this.family.children[childIndex]) {
      this.family.heirIndex = childIndex;
      const heir = this.family.children[childIndex];
      this.gameUI.showToast(`👑 ${heir.name} wurde offiziell zum Thronfolger ernannt!`, "info");
      this.stateManager.save();
      this.showModal();
    }
  }

  showModal() {
    this.init();

    const m = this.family.monarch;
    const c = this.family.consort;

    const childrenCards = this.family.children.map((child, idx) => {
      const isHeir = this.family.heirIndex === idx;
      return `
        <div style="background: ${isHeir ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)'}; border: 1px solid ${isHeir ? '#d4af37' : 'rgba(255,255,255,0.1)'}; padding: 10px; border-radius: 8px; text-align: center; min-width: 140px; position: relative;">
          ${isHeir ? '<div style="position: absolute; top: -10px; right: 5px; background: #d4af37; color: black; font-size: 0.65em; padding: 2px 6px; border-radius: 4px; font-weight: bold;">THRONFOLGER</div>' : ''}
          <div style="font-size: 1.8em; margin-bottom: 2px;">${child.gender === 'male' ? '🤴' : '👸'}</div>
          <strong style="color: #eee; font-size: 0.95em;">${child.name}</strong>
          <div style="font-size: 0.75em; color: #aaa;">Alter: ${child.age} Jahre</div>
          <div style="font-size: 0.75em; color: #5f5; margin: 4px 0;">✨ ${child.trait.name}<br>(${child.trait.bonus})</div>
          
          <div style="font-size: 0.7em; color: #ccc; margin-bottom: 6px;">
            ${child.married ? `💍 Verheiratet mit<br><strong>${child.spouseName}</strong>` : '💍 Ledig'}
          </div>

          <div style="display: flex; flex-direction: column; gap: 4px;">
            ${!isHeir ? `<button onclick="window.dynastyTree.setHeir(${idx})" style="background: #446; color: white; border: none; padding: 3px 6px; font-size: 0.7em; border-radius: 3px; cursor: pointer;">Als Erbe einsetzen</button>` : ''}
            ${!child.married ? `<button onclick="window.dynastyTree.arrangeMarriage(${idx})" style="background: #2a8; color: white; border: none; padding: 3px 6px; font-size: 0.7em; border-radius: 3px; cursor: pointer;">💍 Verheiraten (300 Gold)</button>` : ''}
          </div>
        </div>
      `;
    }).join('');

    const modalContent = `
      <div style="padding: 10px; max-width: 650px; margin: 0 auto; text-align: center;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 4px;">👑 Königsfamilie & Stammbaum</h2>
        <p style="font-size: 0.85em; color: #aaa; margin-bottom: 15px;">Bestimme deine Thronfolge und sichere mächtige Blutlinien-Boni für dein Reich.</p>

        <!-- Generation 1: Monarch & Consort -->
        <div style="display: flex; justify-content: center; gap: 20px; align-items: center; margin-bottom: 15px;">
          <div style="background: rgba(212,175,55,0.15); border: 1px solid #d4af37; padding: 12px; border-radius: 8px; width: 160px;">
            <div style="font-size: 2em;">👑</div>
            <strong style="color: #d4af37;">${m.name}</strong>
            <div style="font-size: 0.75em; color: #aaa;">${m.title}</div>
            <div style="font-size: 0.75em; color: #5f5; margin-top: 4px;">✨ ${m.trait.name}<br>(${m.trait.bonus})</div>
          </div>

          <div style="font-size: 1.5em; color: #d4af37;">💖</div>

          <div style="background: rgba(212,175,55,0.15); border: 1px solid #d4af37; padding: 12px; border-radius: 8px; width: 160px;">
            <div style="font-size: 2em;">👸</div>
            <strong style="color: #d4af37;">${c.name}</strong>
            <div style="font-size: 0.75em; color: #aaa;">${c.title}</div>
            <div style="font-size: 0.75em; color: #5f5; margin-top: 4px;">✨ ${c.trait.name}<br>(${c.trait.bonus})</div>
          </div>
        </div>

        <!-- Connection Line -->
        <div style="width: 2px; height: 20px; background: #d4af37; margin: 0 auto 15px auto;"></div>

        <h4 style="color: #d4af37; margin-bottom: 10px;">Nachkommen & Erblinie:</h4>
        
        <!-- Generation 2: Children -->
        <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
          ${childrenCards}
        </div>
      </div>
    `;

    this.gameUI.showModal('Dynastie-Stammbaum', modalContent);
  }
}

window.DynastyTree = DynastyTree;
