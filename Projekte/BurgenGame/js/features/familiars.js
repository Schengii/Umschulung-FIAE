// --- HERO FAMILIARS & PETS SYSTEM ---

const FAMILIARS_CATALOG = {
  warhound: {
    id: 'warhound',
    name: 'Kriegshund',
    icon: '🐕',
    desc: 'Erhöht den Nahkampf-Schaden im Kampf um +15%.',
    cost: { gold: 200, food: 150 },
    buff: { meleeDamage: 0.15 }
  },
  falcon: {
    id: 'falcon',
    name: 'Späh-Falke',
    icon: '🦅',
    desc: 'Spürt Spione auf und erhöht Dungeon-Beute um +20%.',
    cost: { gold: 250, food: 100 },
    buff: { dungeonLoot: 0.20, spyDetection: 0.25 }
  },
  bear: {
    id: 'bear',
    name: 'Panzerbär',
    icon: '🐻',
    desc: 'Gewährt allen Verteidigungseinheiten +25 HP.',
    cost: { gold: 400, food: 300 },
    buff: { defenseHp: 25 }
  },
  phoenix: {
    id: 'phoenix',
    name: 'Sonnenseelen-Phönix',
    icon: '🦅🔥',
    desc: 'Heilt den Helden im Kampf jede Runde um 5 HP.',
    cost: { gold: 600, rubies: 10 },
    buff: { heroRegen: 5 }
  }
};

class FamiliarManager {
  constructor(stateManager, ui) {
    this.stateManager = stateManager;
    this.ui = ui;
  }

  init() {
    if (!this.stateManager.state.familiars) {
      this.stateManager.state.familiars = {
        unlocked: ['warhound'],
        activeId: 'warhound',
        levels: { warhound: 1, falcon: 1, bear: 1, phoenix: 1 }
      };
    }
  }

  getActiveFamiliar() {
    this.init();
    const activeId = this.stateManager.state.familiars.activeId;
    if (!activeId || !FAMILIARS_CATALOG[activeId]) return null;
    return FAMILIARS_CATALOG[activeId];
  }

  // ============================================================
  // NEU: Gibt den aktiven Familiar-Buff zurück
  // Wird von tactical_combat.js und dungeons.js aufgerufen
  // ============================================================
  getActiveBuff(buffType) {
    const familiar = this.getActiveFamiliar();
    if (!familiar || !familiar.buff) return 0;
    const famState = this.stateManager.state.familiars;
    const level = (famState.levels[familiar.id] || 1);
    const levelMult = 1 + (level - 1) * 0.1; // +10% Bonus pro Level

    switch (buffType) {
      case 'meleeDamage':
        return (familiar.buff.meleeDamage || 0) * levelMult;
      case 'dungeonLoot':
        return (familiar.buff.dungeonLoot || 0) * levelMult;
      case 'spyDetection':
        return (familiar.buff.spyDetection || 0) * levelMult;
      case 'defenseHp':
        return (familiar.buff.defenseHp || 0) * level;
      case 'heroRegen':
        return (familiar.buff.heroRegen || 0) * level;
      default:
        return 0;
    }
  }

  adoptFamiliar(petId) {
    this.init();
    const pet = FAMILIARS_CATALOG[petId];
    if (!pet) return { success: false, msg: 'Ungültiger Begleiter.' };

    const famState = this.stateManager.state.familiars;
    if (famState.unlocked.includes(petId)) {
      famState.activeId = petId;
      this.stateManager.save();
      if (window.gameSound) window.gameSound.playSFX('upgrade');
      return { success: true, msg: `🐾 ${pet.name} wurde als aktiver Begleiter ausgewählt!` };
    }

    if (!this.stateManager.hasResources(pet.cost)) {
      return { success: false, msg: 'Nicht genug Ressourcen für diese Adoption!' };
    }

    this.stateManager.deductResources(pet.cost);
    famState.unlocked.push(petId);
    famState.activeId = petId;
    this.stateManager.save();
    if (window.gameSound) window.gameSound.playSFX('quest');
    this.stateManager.notifyListeners('familiars');
    return { success: true, msg: `🎉 ${pet.name} wurde adoptiert und steht an deiner Seite!` };
  }

  feedFamiliar(petId) {
    this.init();
    const famState = this.stateManager.state.familiars;
    if (!famState.unlocked.includes(petId)) {
      return { success: false, msg: 'Begleiter ist noch nicht freigeschaltet.' };
    }

    const foodCost = { food: 100 };
    if (!this.stateManager.hasResources(foodCost)) {
      return { success: false, msg: 'Nicht genug Nahrung im Lager!' };
    }

    this.stateManager.deductResources(foodCost);
    famState.levels[petId] = (famState.levels[petId] || 1) + 1;
    this.stateManager.save();
    if (window.gameSound) window.gameSound.playSFX('upgrade');
    this.stateManager.notifyListeners('familiars');
    return { success: true, msg: `🍖 ${FAMILIARS_CATALOG[petId].name} gefüttert! Level: ${famState.levels[petId]}` };
  }

  openModal() {
    this.init();
    const famState = this.stateManager.state.familiars;

    let html = `
      <h2>🐾 Helden-Begleiter & Familiars</h2>
      <p class="modal-intro">Adoptiere treue Begleiter, die deinem Helden im Kampf zur Seite stehen und spezielle Boni gewähren.</p>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 15px;">
    `;

    Object.values(FAMILIARS_CATALOG).forEach(pet => {
      const isUnlocked = famState.unlocked.includes(pet.id);
      const isActive = famState.activeId === pet.id;
      const level = famState.levels[pet.id] || 1;
      const costText = Object.entries(pet.cost).map(([k, v]) => `${v} ${k}`).join(', ');

      html += `
        <div class="glass-card" style="padding: 12px; border-left: 4px solid ${isActive ? '#f1c40f' : isUnlocked ? '#2ecc71' : '#555'};">
          <div style="font-size: 2rem; text-align: center;">${pet.icon}</div>
          <h3 style="text-align: center; font-size: 0.9rem; color: var(--color-gold-hover); margin: 6px 0;">${pet.name}</h3>
          ${isUnlocked ? `<div style="font-size: 0.7rem; color: #4CAF50; text-align: center;">Level ${level}</div>` : ''}
          <p style="font-size: 0.75rem; color: #bdc3c7; margin: 6px 0;">${pet.desc}</p>
          ${isUnlocked ? `
            <button onclick="window.familiarManager.adoptFamiliar('${pet.id}')" 
                    style="width: 100%; padding: 4px; background: ${isActive ? '#f1c40f' : 'linear-gradient(135deg,#2ecc71,#27ae60)'}; color: #111; font-weight: bold; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; margin-bottom: 4px;">
              ${isActive ? '⭐ Aktiv' : '✓ Auswählen'}
            </button>
            <button onclick="window.familiarManager.feedAndNotify('${pet.id}')"
                    style="width: 100%; padding: 4px; background: rgba(212,175,55,0.2); color: #ffd700; font-weight: bold; border: 1px solid #d4af37; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
              🍖 Füttern (-100 Nahrung)
            </button>
          ` : `
            <div style="font-size: 0.72rem; color: #888; margin-bottom: 6px;">Kosten: ${costText}</div>
            <button onclick="window.familiarManager.adoptAndNotify('${pet.id}')"
                    style="width: 100%; padding: 4px; background: linear-gradient(135deg,#d4af37,#aa820a); color: #111; font-weight: bold; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem;">
              🐾 Adoptieren
            </button>
          `}
        </div>
      `;
    });

    html += `
      </div>
      <button id="btn-close-familiars" class="primary-btn" style="width: 100%; margin-top: 15px;">Schließen</button>
    `;

    if (window.gameUI) {
      gameUI.openModal(html);
      document.getElementById('btn-close-familiars')?.addEventListener('click', () => gameUI.closeModal());
    }
  }

  adoptAndNotify(petId) {
    const result = this.adoptFamiliar(petId);
    if (window.gameUI) gameUI.showFloatingNotification(result.msg);
    this.openModal();
  }

  feedAndNotify(petId) {
    const result = this.feedFamiliar(petId);
    if (window.gameUI) gameUI.showFloatingNotification(result.msg);
    this.openModal();
  }
}

// BUG FIX: window.FamiliarManager war auf null gesetzt – jetzt korrekt auf die Klasse gesetzt
window.FamiliarManager = FamiliarManager;
