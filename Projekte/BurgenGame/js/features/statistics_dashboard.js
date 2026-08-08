// --- STATISTIK-DASHBOARD FEATURE ---

// ================================================================
// Statistik-Tracking: Verlaufsdaten aufzeichnen
// ================================================================
GameStateManager.prototype.initStatHistory = function() {
  if (!this.state.statHistory) {
    this.state.statHistory = {
      gold: [], wood: [], stone: [], food: [],
      troops: [], score: [],
      timestamps: [],
      maxEntries: 60 // Letzten 60 Aufzeichnungen
    };
  }
  if (!this.state.statistics.battleReportCount) this.state.statistics.battleReportCount = 0;
  if (!this.state.statistics.totalTroopsLost) this.state.statistics.totalTroopsLost = 0;
  if (!this.state.statistics.longestStreak) this.state.statistics.longestStreak = 0;
  if (!this.state.statistics.sessionStart) this.state.statistics.sessionStart = Date.now();
};

// ================================================================
// Tick: Statistik-Verlaufsdaten aufzeichnen (alle 30s)
// ================================================================
GameStateManager.prototype.tickStatHistory = function(dt) {
  this.initStatHistory();
  if (!this.state.nextStatRecord) this.state.nextStatRecord = Date.now() + 30000;

  if (Date.now() >= this.state.nextStatRecord) {
    this.state.nextStatRecord = Date.now() + 30000;

    const hist = this.state.statHistory;
    const max = hist.maxEntries;

    hist.gold.push(Math.floor(this.state.resources.gold));
    hist.wood.push(Math.floor(this.state.resources.wood));
    hist.stone.push(Math.floor(this.state.resources.stone));
    hist.food.push(Math.floor(this.state.resources.food));
    hist.troops.push(Object.values(this.state.troops).reduce((a,b) => a+b, 0));
    hist.score.push(this.calculateScore());
    hist.timestamps.push(Date.now());

    // Auf Maxlength begrenzen
    ['gold','wood','stone','food','troops','score','timestamps'].forEach(key => {
      if (hist[key].length > max) hist[key].shift();
    });
  }
};

GameStateManager.prototype.getResourceForecast = function() {
  const state = this.state;
  if (!state) return [];
  const warnings = [];

  // Compute Food burn rate
  const totalTroops = Object.values(state.troops || {}).reduce((a, b) => a + b, 0);
  const foodProd = 15; // Farm baseline prod
  const foodUpkeep = totalTroops * 2;
  const netFood = foodProd - foodUpkeep;

  if (netFood < 0 && state.food > 0) {
    const minsLeft = Math.floor(state.food / Math.abs(netFood));
    if (minsLeft <= 15) {
      warnings.push({ resource: 'Nahrung', minsLeft, type: 'critical' });
    }
  }
  return warnings;
};

// ================================================================
// Mini-Chart auf einem Canvas zeichnen
// ================================================================
function drawMiniChart(canvasId, data, color, label) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  if (!data || data.length < 2) {
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Noch keine Daten', w/2, h/2);
    return;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  // Hintergrund-Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, 'rgba(255,255,255,0.03)');
  bgGrad.addColorStop(1, 'rgba(0,0,0,0.1)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, w, h);

  // Grid-Linien
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const y = (h / 4) * i;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  // Füllung unter der Kurve
  const fillGrad = ctx.createLinearGradient(0, 0, 0, h);
  fillGrad.addColorStop(0, color.replace('1)', '0.25)'));
  fillGrad.addColorStop(1, color.replace('1)', '0.02)'));

  ctx.beginPath();
  const stepX = w / (data.length - 1);
  data.forEach((val, i) => {
    const x = i * stepX;
    const y = h - ((val - min) / range) * (h - 10) - 5;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fillStyle = fillGrad;
  ctx.fill();

  // Linie zeichnen
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  data.forEach((val, i) => {
    const x = i * stepX;
    const y = h - ((val - min) / range) * (h - 10) - 5;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Letzten Wert anzeigen
  const lastVal = data[data.length - 1];
  const lastX = (data.length - 1) * stepX;
  const lastY = h - ((lastVal - min) / range) * (h - 10) - 5;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
  ctx.fill();

  // Label
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  ctx.font = 'bold 10px Inter, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(label, 5, 14);

  ctx.textAlign = 'right';
  ctx.fillStyle = color;
  ctx.font = 'bold 11px Inter, sans-serif';
  ctx.fillText(lastVal.toLocaleString(), w - 4, 14);
}

// ================================================================
// UI: Statistik-Dashboard Modal
// ================================================================
GameUI.prototype.openStatsDashboardModal = function() {
  stateManager.initStatHistory();
  const state = stateManager.state;
  const stats = state.statistics;
  const hist = state.statHistory;
  const prestige = state.prestige || { totalPoints: 0, resets: 0 };
  const score = stateManager.calculateScore();

  const sessionStart = stats.sessionStart || Date.now();
  const sessionSec = Math.floor((Date.now() - sessionStart) / 1000);
  const sessionMin = Math.floor(sessionSec / 60);
  const sessionHrs = Math.floor(sessionMin / 60);
  const sessionTimeStr = sessionHrs > 0 ? `${sessionHrs}h ${sessionMin % 60}m` : `${sessionMin}m ${sessionSec % 60}s`;

  const totalTroops = Object.values(state.troops).reduce((a,b) => a+b, 0);
  const pop = Math.floor(state.population || 0);
  const happiness = state.happiness || 50;

  const html = `
    <h2>📊 Statistik-Dashboard</h2>
    <p class="modal-intro">Überblick über das Wachstum und die Leistung deines Reiches.</p>

    <!-- Schlüsselkennzahlen -->
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 15px;">
      <div class="glass-card" style="padding: 10px; text-align: center;">
        <div style="font-size: 1.3rem; font-weight: bold; color: #f1c40f;">${score.toLocaleString()}</div>
        <div style="font-size: 0.7rem; color: var(--color-text-muted);">🏆 Gesamtscore</div>
      </div>
      <div class="glass-card" style="padding: 10px; text-align: center;">
        <div style="font-size: 1.3rem; font-weight: bold; color: #9b59b6;">${prestige.totalPoints.toLocaleString()}</div>
        <div style="font-size: 0.7rem; color: var(--color-text-muted);">🌟 Prestige-Pkt.</div>
      </div>
      <div class="glass-card" style="padding: 10px; text-align: center;">
        <div style="font-size: 1.3rem; font-weight: bold; color: #3498db;">${sessionTimeStr}</div>
        <div style="font-size: 0.7rem; color: var(--color-text-muted);">⏱️ Spielzeit</div>
      </div>
    </div>

    <!-- Charts: Ressourcenverlauf -->
    <div class="glass-card" style="padding: 15px; margin-bottom: 12px;">
      <h3 style="margin-bottom: 12px;">📈 Ressourcen-Verlauf (letzte 60 Aufzeichnungen)</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div>
          <canvas id="stat-chart-gold" width="230" height="80" style="border-radius: 4px; width: 100%;"></canvas>
        </div>
        <div>
          <canvas id="stat-chart-wood" width="230" height="80" style="border-radius: 4px; width: 100%;"></canvas>
        </div>
        <div>
          <canvas id="stat-chart-food" width="230" height="80" style="border-radius: 4px; width: 100%;"></canvas>
        </div>
        <div>
          <canvas id="stat-chart-score" width="230" height="80" style="border-radius: 4px; width: 100%;"></canvas>
        </div>
      </div>
    </div>

    <!-- Militär-Statistiken -->
    <div class="glass-card" style="padding: 15px; margin-bottom: 12px;">
      <h3 style="margin-bottom: 10px;">⚔️ Militär-Statistiken</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.82rem;">
        <div>
          <div style="color: var(--color-text-muted);">NPC-Burgen erobert:</div>
          <div style="font-weight: bold; color: #e74c3c; font-size: 1rem;">${stats.npcDefeated || 0}</div>
        </div>
        <div>
          <div style="color: var(--color-text-muted);">Höchste Feind-Stufe:</div>
          <div style="font-weight: bold; color: #e67e22; font-size: 1rem;">Lvl ${stats.maxNpcLevelDefeated || 0}</div>
        </div>
        <div>
          <div style="color: var(--color-text-muted);">Spionageaktionen:</div>
          <div style="font-weight: bold; color: #3498db; font-size: 1rem;">${stats.npcSpied || 0}</div>
        </div>
        <div>
          <div style="color: var(--color-text-muted);">Dungeons erkundet:</div>
          <div style="font-weight: bold; color: #9b59b6; font-size: 1rem;">${stats.dungeonsCleared || 0}</div>
        </div>
        <div>
          <div style="color: var(--color-text-muted);">Aktive Truppen:</div>
          <div style="font-weight: bold; color: #2ecc71; font-size: 1rem;">${totalTroops}</div>
        </div>
        <div>
          <div style="color: var(--color-text-muted);">Rubine ausgegeben:</div>
          <div style="font-weight: bold; color: #e74c3c; font-size: 1rem;">${stats.rubiesSpent || 0}</div>
        </div>
      </div>
    </div>

    <!-- Wirtschafts-Statistiken -->
    <div class="glass-card" style="padding: 15px; margin-bottom: 12px;">
      <h3 style="margin-bottom: 10px;">💰 Wirtschafts-Statistiken</h3>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.82rem;">
        <div>
          <div style="color: var(--color-text-muted);">Gold gesammelt (gesamt):</div>
          <div style="font-weight: bold; color: #f1c40f; font-size: 1rem;">${(stats.totalGoldCollected || 0).toLocaleString()}</div>
        </div>
        <div>
          <div style="color: var(--color-text-muted);">Bevölkerung:</div>
          <div style="font-weight: bold; color: #2ecc71; font-size: 1rem;">${pop} / ${stateManager.getPopulationCap()}</div>
        </div>
        <div>
          <div style="color: var(--color-text-muted);">Zufriedenheit:</div>
          <div style="font-weight: bold; color: ${happiness >= 60 ? '#2ecc71' : happiness >= 35 ? '#f1c40f' : '#e74c3c'}; font-size: 1rem;">${happiness}%</div>
        </div>
        <div>
          <div style="color: var(--color-text-muted);">Prestige-Resets:</div>
          <div style="font-weight: bold; color: #9b59b6; font-size: 1rem;">${prestige.resets}x</div>
        </div>
      </div>
    </div>

    <!-- Gebäude-Breakdown -->
    <div class="glass-card" style="padding: 15px; margin-bottom: 15px;">
      <h3 style="margin-bottom: 10px;">🏰 Gebäude-Übersicht</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 6px; font-size: 0.75rem;">
        ${state.buildings.map(b => {
          const cfg = BUILDINGS_CONFIG[b.type];
          if (!cfg) return '';
          return `<span style="padding: 3px 7px; border-radius: 12px; background: rgba(212,175,55,0.15); border: 1px solid rgba(212,175,55,0.3);">${cfg.name} Lv.${b.level}${b.underConstruction ? ' ⏳' : ''}</span>`;
        }).join('')}
      </div>
    </div>

    <button id="btn-stats-close" class="primary-btn gold-btn" style="width: 100%;">Schließen</button>
  `;

  this.openModal(html);

  // Charts nach dem Rendern zeichnen
  setTimeout(() => {
    drawMiniChart('stat-chart-gold', hist.gold, 'rgba(241, 196, 15, 1)', '🪙 Gold');
    drawMiniChart('stat-chart-wood', hist.wood, 'rgba(101, 198, 117, 1)', '🪵 Holz');
    drawMiniChart('stat-chart-food', hist.food, 'rgba(52, 152, 219, 1)', '🌾 Nahrung');
    drawMiniChart('stat-chart-score', hist.score, 'rgba(155, 89, 182, 1)', '🏆 Score');
  }, 50);

  document.getElementById('btn-stats-close').addEventListener('click', () => this.closeModal());
};
