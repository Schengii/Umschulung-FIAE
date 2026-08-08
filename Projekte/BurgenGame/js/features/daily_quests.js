// --- DAILY QUESTS FEATURE ---

GameStateManager.prototype.initDailyQuests = function() {
  if (!this.state.dailyQuests) {
    this.state.dailyQuests = [];
    this.state.dailyQuestsProgress = { spyCount: 0, troopCount: 0 };
    this.refreshDailyQuests();
  }
};

GameStateManager.prototype.refreshDailyQuests = function() {
  this.state.dailyQuestsProgress = { spyCount: 0, troopCount: 0 };
  
  // Choose 3 random unique quests from the pool
  const pool = [...DAILY_QUESTS_POOL];
  const chosen = [];
  
  for (let i = 0; i < 3; i++) {
    if (pool.length === 0) break;
    const rIdx = Math.floor(Math.random() * pool.length);
    const q = pool.splice(rIdx, 1)[0];
    chosen.push({
      ...q,
      completed: false
    });
  }
  
  this.state.dailyQuests = chosen;
  this.state.nextDailyQuestsRefresh = Date.now() + 86400000; // 24 hours
  this.save();
};

GameStateManager.prototype.trackDailyQuestProgress = function(type, amount = 1) {
  this.initDailyQuests();
  if (type === 'spy') {
    this.state.dailyQuestsProgress.spyCount += amount;
  } else if (type === 'troops') {
    this.state.dailyQuestsProgress.troopCount += amount;
  }
  this.save();
};

GameStateManager.prototype.canCompleteDailyQuest = function(qId) {
  this.initDailyQuests();
  const q = this.state.dailyQuests.find(item => item.id === qId);
  if (!q || q.completed) return false;

  if (q.type === 'deliver') {
    return this.hasResources(q.req);
  } else if (q.type === 'troops') {
    return this.state.dailyQuestsProgress.troopCount >= q.reqCount;
  } else if (q.type === 'spy') {
    return this.state.dailyQuestsProgress.spyCount >= q.reqCount;
  }
  return false;
};

GameStateManager.prototype.completeDailyQuest = function(qId) {
  this.initDailyQuests();
  const q = this.state.dailyQuests.find(item => item.id === qId);
  if (!q || q.completed) return false;

  if (!this.canCompleteDailyQuest(qId)) {
    if (window.gameUI) gameUI.showToast('Bedingungen für diese Aufgabe nicht erfüllt!', 'warning');
    return false;
  }

  // Deduct if delivery
  if (q.type === 'deliver') {
    this.deductResources(q.req);
  }

  // Grant rewards
  Object.keys(q.reward).forEach(resKey => {
    this.state.resources[resKey] = (this.state.resources[resKey] || 0) + q.reward[resKey];
  });

  q.completed = true;
  this.save();
  this.notifyListeners('daily_quest_completed');
  return true;
};

// UI implementation for Tavern Daily Quests Modal
GameUI.prototype.openTavernQuestsModal = function() {
  stateManager.initDailyQuests();
  const state = stateManager.state;

  // Calculate time remaining for refresh
  const now = Date.now();
  const diffMs = Math.max(0, state.nextDailyQuestsRefresh - now);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffMins = Math.floor((diffMs % 3600000) / 60000);

  let html = `
    <h2>📜 Schwarzes Brett - Tägliche Aufgaben</h2>
    <p class="modal-intro" style="font-size: 0.85rem; margin-bottom: 15px;">
      Erfülle tägliche Befehle, um dein Reich zu stärken. Nächster Wechsel in: <strong>${diffHours} Std. ${diffMins} Min.</strong>
    </p>
    <div class="daily-quests-list" style="display: flex; flex-direction: column; gap: 12px;">
  `;

  state.dailyQuests.forEach(q => {
    let reqText = "";
    let progressPct = 100;
    
    if (q.type === 'deliver') {
      const keys = Object.keys(q.req);
      reqText = "Lieferung von: " + keys.map(k => {
        const icon = k === 'gold' ? '🪙' : k === 'wood' ? '🪵' : k === 'stone' ? '🪨' : k === 'food' ? '🌾' : k === 'bread' ? '🍞' : '📦';
        const has = Math.floor(state.resources[k] || 0);
        const req = q.req[k];
        if (has < req) progressPct = Math.min(progressPct, (has / req) * 100);
        return `${icon} ${has}/${req}`;
      }).join(', ');
    } else if (q.type === 'troops') {
      const current = state.dailyQuestsProgress.troopCount || 0;
      progressPct = Math.min(100, (current / q.reqCount) * 100);
      reqText = `Ausgebildete Soldaten: ⚔️ ${current}/${q.reqCount}`;
    } else if (q.type === 'spy') {
      const current = state.dailyQuestsProgress.spyCount || 0;
      progressPct = Math.min(100, (current / q.reqCount) * 100);
      reqText = `Durchgeführte Spionagen: 👤 ${current}/${q.reqCount}`;
    }

    const canComplete = stateManager.canCompleteDailyQuest(q.id);
    const rewardsText = Object.keys(q.reward).map(k => {
      const icon = k === 'gold' ? '🪙' : k === 'rubies' ? '💎' : '🎁';
      return `${icon} ${q.reward[k]}`;
    }).join(' | ');

    html += `
      <div class="glass-card quest-card" style="padding: 15px; border-left: 4px solid ${q.completed ? '#2ecc71' : canComplete ? '#f1c40f' : 'rgba(255,255,255,0.1)'};">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 5px;">
          <h3 style="margin: 0; font-size: 1.05rem; color: ${q.completed ? '#2ecc71' : 'var(--color-gold-hover)'};">${q.title}</h3>
          ${q.completed ? '<span style="color: #2ecc71; font-weight: bold; font-size: 0.9rem;">✅ Erledigt</span>' : ''}
        </div>
        <p style="font-size: 0.8rem; margin: 4px 0; color: var(--color-text-muted);">${q.desc}</p>
        
        <div style="background: rgba(0,0,0,0.15); padding: 8px; border-radius: 4px; margin: 10px 0; font-size: 0.8rem;">
          <div style="margin-bottom: 4px;"><strong>Bedarf:</strong> ${reqText}</div>
          <div class="progress-container" style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
            <div style="width: ${progressPct}%; height: 100%; background: ${q.completed ? '#2ecc71' : '#f1c40f'}; transition: width 0.3s;"></div>
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.8rem; margin-top: 8px;">
          <span>Belohnung: <strong>${rewardsText}</strong></span>
          ${!q.completed ? `
            <button class="primary-btn complete-dq-btn" data-id="${q.id}" ${canComplete ? '' : 'disabled'} style="font-size: 0.75rem; padding: 5px 12px;">
              Aufgabe abgeben
            </button>
          ` : ''}
        </div>
      </div>
    `;
  });

  html += `</div>`;
  this.openModal(html);

  document.querySelectorAll('.complete-dq-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const qId = e.target.getAttribute('data-id');
      if (stateManager.completeDailyQuest(qId)) {
        this.openTavernQuestsModal();
        this.showFloatingNotification('Tägliche Aufgabe abgeschlossen!');
      }
    });
  });
};
