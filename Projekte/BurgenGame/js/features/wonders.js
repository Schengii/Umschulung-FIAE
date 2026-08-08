// --- GREAT WONDERS & MONUMENTS FEATURE ---

const GREAT_WONDERS = [
  {
    id: 'colossus',
    name: 'Der Koloss von Südgold',
    icon: '🗿',
    desc: 'Ein gigantisches Monument aus Gold und Stein. Gewährt permanent +25% Steuereinnahmen und verdoppelt den Handelserfolg.',
    stages: [
      { stage: 1, name: 'Fundament legen', cost: { stone: 2000, gold: 1000 } },
      { stage: 2, name: 'Statue meißeln', cost: { stone: 3000, iron: 500, gold: 2000 } },
      { stage: 3, name: 'Vergoldung & Einweihung', cost: { gold: 5000, rubies: 50 } }
    ],
    bonusText: '💰 +25% Steuern & verdoppelter Handelsertrag'
  },
  {
    id: 'lighthouse',
    name: 'Der Große Leuchtturm von Pharos',
    icon: '🏮',
    desc: 'Ein strahlender Turm am Meer. Halbiert die Reisezeit aller Seehandelskarren & Expeditionsflotten.',
    stages: [
      { stage: 1, name: 'Klippenfundament', cost: { stone: 1500, wood: 1000 } },
      { stage: 2, name: 'Turmbau', cost: { stone: 2500, iron: 400 } },
      { stage: 3, name: 'Magisches Kristallfeuer', cost: { gold: 3000, rubies: 40 } }
    ],
    bonusText: '🚢 -50% Reisezeit für See-Expeditionen'
  },
  {
    id: 'cathedral',
    name: 'Die Kathedrale des Lichts',
    icon: '⛪',
    desc: 'Ein prachtvolles Heiligtum. Gewährt permanent 100% Zufriedenheit im Volk und schützt vor Naturkatastrophen.',
    stages: [
      { stage: 1, name: 'Marmor-Fundament', cost: { stone: 3000, wood: 1500 } },
      { stage: 2, name: 'Gewölbe & Buntglas', cost: { stone: 4000, gold: 2500 } },
      { stage: 3, name: 'Heilige Glockenweihe', cost: { gold: 6000, rubies: 75 } }
    ],
    bonusText: '✨ Maximales Glück (100%) & Katastrophen-Immunität'
  }
];

GameStateManager.prototype.initWonders = function() {
  if (!this.state.wonders) {
    this.state.wonders = {}; // { wonderId: currentStage (0 to 3) }
  }
};

GameStateManager.prototype.buildWonderStage = function(wonderId) {
  this.initWonders();
  const wonder = GREAT_WONDERS.find(w => w.id === wonderId);
  if (!wonder) return false;

  const currentStage = this.state.wonders[wonderId] || 0;
  if (currentStage >= 3) {
    if (window.gameUI) gameUI.showToast('Dieses Weltwunder ist bereits vollendet!', 'info');
    return false;
  }

  const nextStageCfg = wonder.stages[currentStage];
  if (!this.hasResources(nextStageCfg.cost)) {
    if (window.gameUI) gameUI.showToast('Zu wenig Ressourcen für diesen Bauabschnitt!', 'error');
    return false;
  }

  this.deductResources(nextStageCfg.cost);
  this.state.wonders[wonderId] = currentStage + 1;

  if (this.state.wonders[wonderId] === 3 && window.gameUI) {
    gameUI.addLog(`🎉 Das Weltwunder "${wonder.name}" wurde glorreich vollendet!`, 'success');
  }

  this.save();
  this.notifyListeners('wonder_built');
  return true;
};

GameUI.prototype.openWondersModal = function() {
  stateManager.initWonders();
  const state = stateManager.state;
  const wondersState = state.wonders;

  let html = `
    <h2>⚡ Weltwunder & Monumentalbauten</h2>
    <p class="modal-intro">Errichte gewaltige Monumente über mehrere Bauphasen, um deinem Reich ewige Boni zu sichern.</p>
    
    <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
  `;

  GREAT_WONDERS.forEach(w => {
    const stage = wondersState[w.id] || 0;
    const isFinished = stage >= 3;
    const nextCfg = !isFinished ? w.stages[stage] : null;
    const canBuild = nextCfg ? stateManager.hasResources(nextCfg.cost) : false;

    const costText = nextCfg ? Object.entries(nextCfg.cost).map(([k, v]) => `${v} ${k.toUpperCase()}`).join(' | ') : 'Vollendet!';

    html += `
      <div class="glass-card" style="padding: 12px; border-left: 4px solid ${isFinished ? '#f1c40f' : '#3498db'};">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <h3 style="margin: 0; font-size: 0.95rem; color: var(--color-gold-hover);">${w.icon} ${w.name}</h3>
          <span style="font-size: 0.75rem; font-weight: bold; color: ${isFinished ? '#f1c40f' : '#3498db'};">
            ${isFinished ? '🏆 VOLLENDET' : `Bauphase ${stage + 1} / 3`}
          </span>
        </div>
        <p style="font-size: 0.78rem; color: #bdc3c7; margin: 6px 0;">${w.desc}</p>
        <div style="font-size: 0.75rem; color: #2ecc71; margin-bottom: 6px;"><strong>Permanent-Bonus:</strong> ${w.bonusText}</div>
        
        ${!isFinished ? `
          <div style="font-size: 0.72rem; color: #95a5a6; background: rgba(0,0,0,0.3); padding: 6px; border-radius: 4px; margin-bottom: 8px;">
            🏗️ <strong>Nächste Phase (${nextCfg.name}):</strong> ${costText}
          </div>
          <button class="primary-btn btn-build-wonder-stage" data-id="${w.id}" ${canBuild ? '' : 'disabled'} style="width: 100%; font-size: 0.75rem; padding: 4px;">
            Bauphase ${stage + 1} finanzieren
          </button>
        ` : ''}
      </div>
    `;
  });

  html += `
    </div>
    <button id="btn-close-wonders" class="primary-btn" style="width: 100%; margin-top: 15px;">Schließen</button>
  `;

  this.openModal(html);

  document.querySelectorAll('.btn-build-wonder-stage').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      if (stateManager.buildWonderStage(id)) {
        this.showFloatingNotification('Bauabschnitt des Weltwunders erfolgreich abgeschlossen! 🔨');
        if (window.gameSound) window.gameSound.playSFX('upgrade');
        this.openWondersModal();
      }
    });
  });

  document.getElementById('btn-close-wonders').addEventListener('click', () => this.closeModal());
};
