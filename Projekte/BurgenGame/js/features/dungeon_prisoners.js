// --- DUNGEON PRISONERS & INTERROGATION FEATURE ---

GameStateManager.prototype.initPrisoners = function() {
  if (!this.state.prisoners) {
    this.state.prisoners = [];
  }
};

GameStateManager.prototype.capturePrisoner = function(name, nationId, rank = 'Hauptmann') {
  this.initPrisoners();
  this.state.prisoners.push({
    id: `pris_${Date.now()}`,
    name,
    nationId,
    rank,
    capturedAt: Date.now()
  });
  this.save();
  if (window.gameUI) {
    gameUI.addLog(`⛓️ Gefangener gemacht: ${rank} ${name} wurde im Verlies eingesperrt!`, 'warning');
  }
};

GameStateManager.prototype.interrogatePrisoner = function(prisId) {
  this.initPrisoners();
  const pIdx = this.state.prisoners.findIndex(p => p.id === prisId);
  if (pIdx === -1) return false;

  const prisoner = this.state.prisoners[pIdx];
  this.state.prisoners.splice(pIdx, 1);

  // Intel reward: reveal a hidden outpost or grant free research points
  this.state.resources.gold = (this.state.resources.gold || 0) + 250;
  this.state.resources.rubies = (this.state.resources.rubies || 0) + 10;

  this.save();
  if (window.gameUI) {
    gameUI.showFloatingNotification(`🕵️ Verhör erfolgreich! Geheime Pläne erbeutet: +250 Gold & +10 Rubine!`);
  }
  return true;
};

GameStateManager.prototype.demandRansom = function(prisId) {
  this.initPrisoners();
  const pIdx = this.state.prisoners.findIndex(p => p.id === prisId);
  if (pIdx === -1) return false;

  const prisoner = this.state.prisoners[pIdx];
  this.state.prisoners.splice(pIdx, 1);

  const ransomGold = 500;
  this.state.resources.gold = (this.state.resources.gold || 0) + ransomGold;

  this.save();
  if (window.gameUI) {
    gameUI.showFloatingNotification(`💰 Lösegeld erhalten! 500 Gold für ${prisoner.name} eingenommen.`);
  }
  return true;
};

GameUI.prototype.openPrisonersModal = function() {
  stateManager.initPrisoners();
  const prisoners = stateManager.state.prisoners;

  let html = `
    <h2>⛓️ Burgverlies & Gefängnis</h2>
    <p class="modal-intro">Verwalte gefangene Spione und Generäle. Befrage sie nach geheimen Informationen oder fordere Lösegeld.</p>
    
    <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
  `;

  if (prisoners.length === 0) {
    html += `
      <div style="text-align: center; padding: 20px; color: #bdc3c7; background: rgba(0,0,0,0.3); border-radius: 6px;">
        Das Verlies ist aktuell leer. Besiege Angreifer oder feindliche Burgen, um Gefangene zu machen.
      </div>
    `;
  } else {
    prisoners.forEach(p => {
      html += `
        <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border-left: 4px solid #e74c3c;">
          <div>
            <strong style="color: var(--color-gold-hover);">${p.rank} ${p.name}</strong>
            <div style="font-size: 0.75rem; color: #bdc3c7;">Gefangen genommen: ${new Date(p.capturedAt).toLocaleTimeString()}</div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="primary-btn btn-interrogate" data-id="${p.id}" style="font-size: 0.72rem; padding: 4px 8px;">🕵️ Verhören</button>
            <button class="primary-btn btn-ransom" data-id="${p.id}" style="font-size: 0.72rem; padding: 4px 8px; border-color: #f1c40f;">💰 Lösegeld (500g)</button>
          </div>
        </div>
      `;
    });
  }

  html += `
    </div>
    <button id="btn-close-prisoners" class="primary-btn" style="width: 100%; margin-top: 15px;">Schließen</button>
  `;

  this.openModal(html);

  document.querySelectorAll('.btn-interrogate').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      stateManager.interrogatePrisoner(id);
      this.openPrisonersModal();
    });
  });

  document.querySelectorAll('.btn-ransom').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      stateManager.demandRansom(id);
      this.openPrisonersModal();
    });
  });

  document.getElementById('btn-close-prisoners').addEventListener('click', () => this.closeModal());
};
