// --- MYTHIC BESTIARY & MONSTER TAMING FEATURE ---

const BESTIARY_BEASTS = [
  {
    id: 'war_bear',
    name: 'Kriegsbär Grom',
    icon: '🐻',
    desc: 'Ein riesiger gepanzerter Bär. Erhöht die Truppen-Verteidigung um +15% und absorbiert Schaden im Kampf.',
    cost: { gold: 500, food: 300, leather: 20 },
    bonus: { type: 'defense', val: 0.15 },
    minHeroLvl: 2
  },
  {
    id: 'shadow_wolf',
    name: 'Schattenwolf Fenrir',
    icon: '🐺',
    desc: 'Ein pfeilschneller Raubwolf. Erhöht die Marschgeschwindigkeit um +25% und verleiht Erstschlag im Kampf.',
    cost: { gold: 600, food: 400, hide: 30 },
    bonus: { type: 'speed', val: 0.25 },
    minHeroLvl: 3
  },
  {
    id: 'dragon_hatchling',
    name: 'Drachenbaby Ignis',
    icon: '🐉',
    desc: 'Spuckt feurige Flammen im Kampf (+20% Angriffskraft für den Helden und Chance auf Verbrennung).',
    cost: { gold: 1200, rubies: 30, iron: 100 },
    bonus: { type: 'attack', val: 0.20 },
    minHeroLvl: 5
  },
  {
    id: 'griffin',
    name: 'Königlicher Greif',
    icon: '🦅',
    desc: 'Ein erhabenes Fabelwesen. Gewährt +25% Kundschafter-Tempo und +10 Zufriedenheit im Reich.',
    cost: { gold: 1500, rubies: 50 },  // BUG FIX: Doppelter gold-Key entfernt (war gold:1500, rubies:50, gold:1000)
    bonus: { type: 'happiness', val: 10 },
    minHeroLvl: 6
  }
];


GameStateManager.prototype.initBestiary = function() {
  if (!this.state.bestiary) {
    this.state.bestiary = {
      tamedBeasts: [],
      activeCompanion: null
    };
  }
};

GameStateManager.prototype.tameBeast = function(beastId) {
  this.initBestiary();
  const beast = BESTIARY_BEASTS.find(b => b.id === beastId);
  if (!beast) return false;

  if (this.state.bestiary.tamedBeasts.includes(beastId)) {
    if (window.gameUI) gameUI.showToast('Diese Bestie ist bereits gezähmt!', 'info');
    return false;
  }

  if (!this.hasResources(beast.cost)) {
    if (window.gameUI) gameUI.showToast('Nicht genügend Ressourcen zur Zähmung!', 'error');
    return false;
  }

  this.deductResources(beast.cost);
  this.state.bestiary.tamedBeasts.push(beastId);
  if (!this.state.bestiary.activeCompanion) {
    this.state.bestiary.activeCompanion = beastId;
  }

  this.save();
  this.notifyListeners('beast_tamed');
  return true;
};

GameStateManager.prototype.setActiveCompanion = function(beastId) {
  this.initBestiary();
  if (beastId && !this.state.bestiary.tamedBeasts.includes(beastId)) return false;
  this.state.bestiary.activeCompanion = beastId;
  this.save();
  this.notifyListeners('companion_changed');
  return true;
};

GameUI.prototype.openBestiaryModal = function() {
  stateManager.initBestiary();
  const state = stateManager.state;
  const bestiary = state.bestiary;

  let html = `
    <h2>🐉 Königliches Bestiarium - Monster Zähmung</h2>
    <p class="modal-intro">Zähme mythische Kreaturen in deiner Menagerie und weise sie deinem Helden als Kampfbegleiter zu.</p>
    
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-top: 15px;">
  `;

  BESTIARY_BEASTS.forEach(b => {
    const isTamed = bestiary.tamedBeasts.includes(b.id);
    const isActive = bestiary.activeCompanion === b.id;
    const canTame = stateManager.hasResources(b.cost);

    const costText = Object.entries(b.cost)
      .map(([res, val]) => `${val} ${res.toUpperCase()}`)
      .join(' | ');

    html += `
      <div class="glass-card" style="padding: 12px; border-left: 4px solid ${isActive ? '#f1c40f' : isTamed ? '#2ecc71' : '#7f8c8d'};">
        <div style="font-size: 2rem; text-align: center; margin-bottom: 5px;">${b.icon}</div>
        <h3 style="margin: 0; text-align: center; font-size: 0.95rem; color: var(--color-gold-hover);">${b.name}</h3>
        <p style="font-size: 0.78rem; color: #bdc3c7; margin: 6px 0; min-height: 40px;">${b.desc}</p>
        <div style="font-size: 0.72rem; color: #95a5a6; margin-bottom: 8px;">Kosten: ${costText}</div>
        
        ${isTamed ? `
          <button class="primary-btn btn-select-companion" data-id="${b.id}" style="width: 100%; font-size: 0.75rem; padding: 4px; border-color: ${isActive ? '#f1c40f' : '#2ecc71'};">
            ${isActive ? '⭐ Aktiver Begleiter' : 'Als Begleiter festlegen'}
          </button>
        ` : `
          <button class="primary-btn btn-tame-beast" data-id="${b.id}" ${canTame ? '' : 'disabled'} style="width: 100%; font-size: 0.75rem; padding: 4px;">
            Zähmen & Aufziehen
          </button>
        `}
      </div>
    `;
  });

  html += `
    </div>
    <button id="btn-close-bestiary" class="primary-btn" style="width: 100%; margin-top: 15px;">Schließen</button>
  `;

  this.openModal(html);

  document.querySelectorAll('.btn-tame-beast').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      if (stateManager.tameBeast(id)) {
        this.showFloatingNotification('Bestie erfolgreich gezähmt! 🐾');
        if (window.gameSound) window.gameSound.playSFX('upgrade');
        this.openBestiaryModal();
      }
    });
  });

  document.querySelectorAll('.btn-select-companion').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      stateManager.setActiveCompanion(id);
      this.showFloatingNotification('Neuer Begleiter zugewiesen! 🌟');
      this.openBestiaryModal();
    });
  });

  document.getElementById('btn-close-bestiary').addEventListener('click', () => this.closeModal());
};
