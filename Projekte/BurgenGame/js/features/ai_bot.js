// --- AI BOT FEATURE (Hybrid Worker Proxy) ---

class AIBot {
  constructor(stateManager, ui) {
    this.stateManager = stateManager;
    this.ui = ui;
    this.enabled = localStorage.getItem('empire_ai_enabled') !== 'false';
    this.autoAttack = localStorage.getItem('empire_ai_auto_attack') === 'true';
    this.personality = localStorage.getItem('empire_ai_personality') || 'builder';
    this.intervalSpeed = localStorage.getItem('empire_ai_speed') || 'normal';
    this.actionInterval = this.getSpeedMs(this.intervalSpeed);
    
    this.initWorker();
  }
  
  initWorker() {
    this.worker = new Worker('js/workers/ai_worker.js');
    
    // Initialize config in worker
    this.worker.postMessage({
      type: 'INIT',
      config: {
        personality: this.personality,
        autoAttack: this.autoAttack
      },
      externalConfigs: {
        WORLD_MAP_CONFIG: typeof WORLD_MAP_CONFIG !== 'undefined' ? WORLD_MAP_CONFIG : null,
        QUESTS_CONFIG: typeof QUESTS_CONFIG !== 'undefined' ? QUESTS_CONFIG.map(q => ({ id: q.id, title: q.title })) : null,
        DUNGEONS_CONFIG: typeof DUNGEONS_CONFIG !== 'undefined' ? DUNGEONS_CONFIG : null,
        DUNGEON_ENCOUNTERS: typeof DUNGEON_ENCOUNTERS !== 'undefined' ? DUNGEON_ENCOUNTERS : null
      }
    });

    this.worker.onmessage = (e) => {
      const msg = e.data;
      if (msg.type === 'AI_ACTION') {
        this.executeAction(msg.action, msg.args, msg.message);
      }
    };
  }

  executeAction(action, args, message) {
    let success = false;
    try {
      if (action === 'proposeAttack') {
        const [targetId, army, targetType, targetName] = args;
        this.proposeAttack(targetName, () => {
          if (this.stateManager.dispatchAttack(targetId, army, targetType)) {
            this.ui.showFloatingNotification(`🤖 AI greift ${targetName} an.`);
          }
        });
        return;
      }
      
      // Map action strings to stateManager methods
      if (typeof this.stateManager[action] === 'function') {
        success = this.stateManager[action](...args);
      } else {
        console.warn("AI Worker requested unknown action:", action);
      }
      
      if (success && message) {
        this.ui.showFloatingNotification(message);
        this.stateManager.save();
        this.stateManager.notifyListeners('ai_action');
      }
    } catch(err) {
      console.error("AI action execution failed:", err);
    }
  }

  getSpeedMs(speed) {
    if (speed === 'fast') return 6000;
    if (speed === 'slow') return 30000;
    return 15000;
  }

  setSpeed(speed) {
    this.intervalSpeed = speed;
    localStorage.setItem('empire_ai_speed', speed);
    this.actionInterval = this.getSpeedMs(speed);
    if (this.enabled) {
      this.start();
    }
  }

  setPersonality(p) {
    this.personality = p;
    localStorage.setItem('empire_ai_personality', p);
    if (this.worker) {
      this.worker.postMessage({ type: 'UPDATE_CONFIG', config: { personality: p } });
    }
  }

  start() {
    this.enabled = true;
    localStorage.setItem('empire_ai_enabled', 'true');
    this.tick();
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = setInterval(() => this.tick(), this.actionInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.enabled = false;
    localStorage.setItem('empire_ai_enabled', 'false');
  }

  tick() {
    if (!this.enabled) return;

    try {
      // 1. FAST QUEST COMPLETIONS (Runs on main thread since it involves config callbacks)
      let questDone = false;
      const state = this.stateManager.state;
      if (state.dailyQuests) {
        state.dailyQuests.forEach(q => {
          if (!q.completed && this.stateManager.canCompleteDailyQuest(q.id)) {
            if (this.stateManager.completeDailyQuest(q.id)) {
              this.ui.showFloatingNotification(`🤖 AI hat tägliche Aufgabe abgegeben: ${q.title}`);
              questDone = true;
            }
          }
        });
      }
      if (state.activeQuestId) {
        const quest = QUESTS_CONFIG.find(q => q.id === state.activeQuestId);
        if (quest && quest.condition(state)) {
          this.stateManager.notifyListeners('quest_complete_check');
        }
      }

      if (questDone) {
        this.stateManager.save();
        this.stateManager.notifyListeners('ai_action');
      }

      // 2. Offload heavy decision making to worker
      if (this.worker) {
        // Send a structured clone of the state
        this.worker.postMessage({
          type: 'TICK',
          state: JSON.parse(JSON.stringify(state)) // deep copy to avoid serialization issues
        });
      }
    } catch (error) {
      console.error("Error in AIBot tick:", error);
    }
  }

  proposeAttack(targetName, onApprove) {
    if (this.autoAttack) {
      onApprove();
      return;
    }
    this.ui.showAttackProposal(targetName, onApprove, () => {
      this.ui.showFloatingNotification("🤖 AI-Angriffsvorschlag abgelehnt.");
    });
  }
}

window.AIBot = AIBot; // Keep global for external UI bindings
