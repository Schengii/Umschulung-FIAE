// --- BEVÖLKERUNGS-MECHANIK FEATURE ---

// ================================================================
// Berechne die Bevölkerungsobergrenze basierend auf Gebäuden
// ================================================================
GameStateManager.prototype.getPopulationCap = function() {
  let cap = 20; // Basis-Kapazität
  this.state.buildings.forEach(b => {
    if (b.underConstruction) return;
    if (b.type === BUILDING_TYPES.TOWNHALL) {
      cap += BUILDINGS_CONFIG[b.type]?.levels[b.level]?.populationCap || 0;
    }
  });
  return cap;
};

// ================================================================
// Berechne natürliches Bevölkerungswachstum
// ================================================================
GameStateManager.prototype.getPopulationGrowthRate = function() {
  const state = this.state;
  const pop = state.population || 0;
  const cap = this.getPopulationCap();
  const happiness = state.happiness || 50;

  if (pop >= cap) return 0;

  // Basiswachstum: proportional zur Lücke bis zur Kapazitätsgrenze
  const gap = cap - pop;
  let baseRate = 0.5 + (gap / cap) * 1.5; // 0.5 bis 2.0 Bürger/min

  // Zufriedenheits-Modifikator
  const happinessMult = 0.5 + (happiness / 100); // 0.5x bei 0% → 1.5x bei 100%
  baseRate *= happinessMult;

  // Steuersatz-Einfluss
  if (state.taxRate === 'low') baseRate *= 1.2;
  else if (state.taxRate === 'high') baseRate *= 0.85;

  // Nahrungsverfügbarkeit
  if (state.resources.food < 50) baseRate *= 0.3;
  else if (state.resources.food < 150) baseRate *= 0.6;

  return baseRate;
};

// ================================================================
// Berechne Zufriedenheits-Faktoren
// ================================================================
GameStateManager.prototype.calculateHappiness = function() {
  const state = this.state;
  let happiness = 50; // Basiswert

  // Nahrungsversorgung (+/-)
  const pop = state.population || 1;
  const food = state.resources.food || 0;
  if (food > pop * 5) happiness += 15;
  else if (food > pop * 2) happiness += 8;
  else if (food < pop) happiness -= 20;
  else if (food < pop * 0.5) happiness -= 35;

  // Brot erhöht Zufriedenheit
  if ((state.resources.bread || 0) > 20) happiness += 10;

  // Bier erhöht Zufriedenheit
  if ((state.resources.beer || 0) > 0) happiness += 12;

  // Steuersatz-Einfluss
  if (state.taxRate === 'low') happiness += 15;
  else if (state.taxRate === 'high') happiness -= 20;

  // Gebäude-Boni
  state.buildings.forEach(b => {
    if (b.underConstruction) return;
    if (b.type === BUILDING_TYPES.FOUNTAIN) happiness += 8;
    if (b.type === BUILDING_TYPES.TAVERN) happiness += 6;
    if (b.type === BUILDING_TYPES.STATUE) happiness += 10;
    if (b.type === BUILDING_TYPES.GARDEN) happiness += 8;
    if (b.type === BUILDING_TYPES.BANNER) happiness += 5;
    if (b.type === BUILDING_TYPES.TOWNHALL) {
      happiness += BUILDINGS_CONFIG[b.type]?.levels[b.level]?.happinessBonus || 0;
    }
  });

  // Sicherheit: Mauern
  const walls = state.buildings.filter(b => b.type === BUILDING_TYPES.WALL && !b.underConstruction).length;
  happiness += Math.min(15, walls * 3);

  // Überbevölkerung senkt Zufriedenheit
  const cap = this.getPopulationCap();
  if (pop > cap * 0.9) happiness -= 10;
  if (pop > cap) happiness -= 20;

  // Festung gibt Sicherheitsgefühl
  const hasFortress = state.buildings.some(b => b.type === BUILDING_TYPES.FORTRESS && !b.underConstruction);
  if (hasFortress) happiness += 12;

  // Diplomatie-Boni
  if (state.diplomacy) {
    Object.values(state.diplomacy).forEach(rel => {
      if (rel.status === 'allied') happiness += 5;
    });
  }

  // Luxusgüter-Boni
  if (state.luxuryGoods) {
    if (state.luxuryGoods.spices > 0) happiness += 5;
    if (state.luxuryGoods.silk > 0) happiness += 5;
    if (state.luxuryGoods.gemstones > 0) happiness += 5;
  }

  return Math.max(0, Math.min(100, Math.round(happiness)));
};

// ================================================================
// Passive Gold-Einnahmen aus Wohnhäusern
// ================================================================
GameStateManager.prototype.getHouseGoldIncome = function() {
  let goldPerMin = 0;
  this.state.buildings.forEach(b => {
    if (b.underConstruction || b.type !== BUILDING_TYPES.HOUSE) return;
    goldPerMin += BUILDINGS_CONFIG[b.type]?.levels[b.level]?.goldPerMin || 0;
  });
  // Zufriedenheits-Multiplikator
  const happiness = this.state.happiness || 50;
  const mult = 0.5 + (happiness / 100); // 0.5x bis 1.5x
  return goldPerMin * mult;
};

// ================================================================
// Tick: Bevölkerung und Zufriedenheit aktualisieren
// ================================================================
GameStateManager.prototype.tickPopulation = function(dt) {
  if (!this.state) return;

  // Initialisierung
  if (this.state.population === undefined) this.state.population = 10;
  if (this.state.happiness === undefined) this.state.happiness = 50;

  // Bier-Konsum
  if ((this.state.resources.beer || 0) > 0) {
    const beerConsRate = (this.state.population || 10) / 10; // 1 Bier pro 10 Bürger pro Min
    const consumed = (beerConsRate / 60) * dt;
    this.state.resources.beer = Math.max(0, this.state.resources.beer - consumed);
  }

  // Zufriedenheit berechnen (jede Sekunde neu)
  const targetHappiness = this.calculateHappiness();
  // Sanfter Übergang (gleicht sich langsam an)
  const diff = targetHappiness - this.state.happiness;
  this.state.happiness = Math.round(this.state.happiness + diff * 0.02 * dt);
  this.state.happiness = Math.max(0, Math.min(100, this.state.happiness));

  // Bevölkerungswachstum
  const growthRate = this.getPopulationGrowthRate();
  const cap = this.getPopulationCap();

  if (growthRate > 0) {
    this.state.population = Math.min(cap, this.state.population + (growthRate / 60) * dt);
  } else if (this.state.happiness < 20) {
    // Bevölkerungsschwund bei sehr niedriger Zufriedenheit
    const shrinkRate = 0.1 / 60;
    this.state.population = Math.max(0, this.state.population - shrinkRate * dt);
  }

  // Passive Gold-Einnahmen aus Häusern
  const goldIncome = this.getHouseGoldIncome();
  if (goldIncome > 0) {
    this.state.resources.gold += (goldIncome / 60) * dt;
  }
};

// ================================================================
// UI: Bevölkerungs-Panel Modal öffnen
// ================================================================
GameUI.prototype.openPopulationModal = function() {
  const state = stateManager.state;
  const pop = Math.floor(state.population || 0);
  const cap = stateManager.getPopulationCap();
  const happiness = state.happiness || 50;
  const goldIncome = stateManager.getHouseGoldIncome().toFixed(1);
  const growthRate = stateManager.getPopulationGrowthRate().toFixed(2);

  const happinessColor = happiness >= 70 ? '#2ecc71' : happiness >= 40 ? '#f1c40f' : '#e74c3c';
  const happinessEmoji = happiness >= 70 ? '😊' : happiness >= 40 ? '😐' : '😡';
  const happinessPct = happiness;

  // Faktoren auflisten
  const food = Math.floor(state.resources.food);
  const bread = Math.floor(state.resources.bread || 0);
  const walls = state.buildings.filter(b => b.type === BUILDING_TYPES.WALL && !b.underConstruction).length;
  const hasFountain = state.buildings.some(b => b.type === BUILDING_TYPES.FOUNTAIN && !b.underConstruction);
  const hasTavern = state.buildings.some(b => b.type === BUILDING_TYPES.TAVERN && !b.underConstruction);
  const hasFortress = state.buildings.some(b => b.type === BUILDING_TYPES.FORTRESS && !b.underConstruction);
  const hasTownhall = state.buildings.some(b => b.type === BUILDING_TYPES.TOWNHALL && !b.underConstruction);

  const html = `
    <h2>👥 Bevölkerung & Zufriedenheit</h2>
    <p class="modal-intro">Zufriedene Bürger zahlen höhere Steuern, wachsen schneller und stärken dein Reich.</p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px;">
      <div class="glass-card" style="padding: 15px; text-align: center;">
        <div style="font-size: 2rem;">👥</div>
        <div style="font-size: 1.5rem; font-weight: bold; color: var(--color-gold-hover);">${pop} / ${cap}</div>
        <div style="font-size: 0.8rem; color: var(--color-text-muted);">Bevölkerung</div>
        <div style="font-size: 0.75rem; color: #2ecc71; margin-top: 4px;">Wachstum: +${growthRate}/min</div>
      </div>
      <div class="glass-card" style="padding: 15px; text-align: center;">
        <div style="font-size: 2rem;">${happinessEmoji}</div>
        <div style="font-size: 1.5rem; font-weight: bold; color: ${happinessColor};">${happiness}%</div>
        <div style="font-size: 0.8rem; color: var(--color-text-muted);">Zufriedenheit</div>
        <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; margin-top: 6px; overflow: hidden;">
          <div style="width: ${happinessPct}%; height: 100%; background: ${happinessColor}; transition: width 0.4s;"></div>
        </div>
      </div>
    </div>

    <div class="glass-card" style="padding: 15px; margin-bottom: 12px;">
      <h3 style="margin-bottom: 10px;">💰 Einkommensquellen</h3>
      <div style="display: flex; justify-content: space-between; font-size: 0.85rem; padding: 5px 0;">
        <span>🏠 Wohnhaus-Einnahmen:</span>
        <strong style="color: var(--color-gold-hover);">+${goldIncome} Gold/Min</strong>
      </div>
      <div style="font-size: 0.75rem; color: var(--color-text-muted);">Bonus durch Zufriedenheit: x${(0.5 + happiness / 100).toFixed(2)}</div>
    </div>

    <div class="glass-card" style="padding: 15px; margin-bottom: 12px;">
      <h3 style="margin-bottom: 10px;">📊 Zufriedenheits-Faktoren</h3>
      <div style="display: flex; flex-direction: column; gap: 5px; font-size: 0.8rem;">
        <div style="display: flex; justify-content: space-between;">
          <span>🌾 Nahrungsversorgung (${food}):</span>
          <span style="color: ${food > pop * 2 ? '#2ecc71' : food < pop ? '#e74c3c' : '#f1c40f'};">${food > pop * 5 ? '+15' : food > pop * 2 ? '+8' : food < pop ? '-20' : '0'}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>🍞 Brotversorgung (${bread}):</span>
          <span style="color: ${bread > 20 ? '#2ecc71' : '#bdc3c7'};">${bread > 20 ? '+10' : '0'}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>💦 Springbrunnen:</span>
          <span style="color: ${hasFountain ? '#2ecc71' : '#bdc3c7'};">${hasFountain ? '+8' : '0'}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>🍺 Taverne:</span>
          <span style="color: ${hasTavern ? '#2ecc71' : '#bdc3c7'};">${hasTavern ? '+6' : '0'}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>🧱 Burgmauern (${walls}):</span>
          <span style="color: ${walls > 0 ? '#2ecc71' : '#bdc3c7'};">+${Math.min(15, walls * 3)}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>🏛️ Rathaus:</span>
          <span style="color: ${hasTownhall ? '#2ecc71' : '#bdc3c7'};">${hasTownhall ? '+Bonus' : '0'}</span>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span>🏰 Festung (Sicherheit):</span>
          <span style="color: ${hasFortress ? '#2ecc71' : '#bdc3c7'};">${hasFortress ? '+12' : '0'}</span>
        </div>
      </div>
    </div>

    <div class="glass-card" style="padding: 12px; background: rgba(212,175,55,0.08); border-color: rgba(212,175,55,0.3);">
      <h4 style="margin-bottom: 8px; color: var(--color-gold-hover);">💡 Tipps zur Verbesserung</h4>
      <ul style="font-size: 0.78rem; color: var(--color-text-muted); list-style: none; display: flex; flex-direction: column; gap: 3px;">
        ${!hasTownhall ? '<li>🏛️ Baue ein <strong>Rathaus</strong>, um die Bevölkerungsgrenze zu erhöhen.</li>' : ''}
        ${walls < 3 ? '<li>🧱 Baue mehr <strong>Burgmauern</strong> für Sicherheit.</li>' : ''}
        ${!hasFountain ? '<li>💦 Ein <strong>Springbrunnen</strong> hebt die Stimmung merklich.</li>' : ''}
        ${food < pop * 2 ? '<li>🌾 Deine <strong>Nahrungsversorgung</strong> ist zu niedrig!</li>' : ''}
        ${happiness < 50 ? '<li>😊 Versuche Zufriedenheitsgebäude zu bauen.</li>' : ''}
        <li>🏠 Jedes Wohnhaus generiert passives Gold.</li>
      </ul>
    </div>

    <button id="btn-pop-close" class="primary-btn gold-btn" style="margin-top: 15px; width: 100%;">Schließen</button>
  `;

  this.openModal(html);
  document.getElementById('btn-pop-close').addEventListener('click', () => this.closeModal());
};
