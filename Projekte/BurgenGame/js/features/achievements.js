// --- ACHIEVEMENTS SYSTEM ---

// Global GameAchievements object will be instantiated in main.js

class GameAchievements {
  constructor(stateManager, ui) {
    this.stateManager = stateManager;
    this.ui = ui;
    // Define achievements catalog
    this.catalog = [
      { id: 'first_build', title: 'Erster Bau', description: 'Baue dein erstes Gebäude.', icon: '🏗️', condition: () => this.stateManager.state.buildings.length > 1 },
      { id: 'rich', title: 'Reich', description: 'Erreiche 10.000 Gold.', icon: '💰', condition: () => (this.stateManager.state.resources.gold || 0) >= 10000 },
      { id: 'hero_level_5', title: 'Heldenmeister', description: 'Dein Held erreicht Level 5.', icon: '🛡️', condition: () => this.stateManager.state.hero && this.stateManager.state.hero.level >= 5 },
      { id: 'dungeon_cleared', title: 'Dungeonspezialist', description: 'Schließe einen Dungeon ab.', icon: '⚔️', condition: () => (this.stateManager.state.statistics?.dungeonsCleared || 0) > 0 },
      { id: 'ai_defeated', title: 'Botschläger', description: 'Besiege den KI-Gegner.', icon: '🤖', condition: () => (this.stateManager.state.statistics?.aiDefeated || 0) > 0 }
    ];
    // Load unlocked achievements from persisted state
    if (!this.stateManager.state.achievements) this.stateManager.state.achievements = [];
    this.unlocked = new Set(this.stateManager.state.achievements);
  }

  // Check and unlock achievements based on conditions
  evaluate() {
    let changed = false;
    for (const ach of this.catalog) {
      if (!this.unlocked.has(ach.id) && ach.condition()) {
        this.unlocked.add(ach.id);
        this.stateManager.state.achievements.push(ach.id);
        changed = true;
        // Notify UI
        this.ui.showFloatingNotification(`🏆 ${ach.title} freigeschaltet!`);
      }
    }
    if (changed) this.stateManager.save();
  }

  // Open achievements modal UI
  open() {
    const state = this.stateManager.state;
    let html = `<h2>🏆 Erfolge</h2>`;
    html += `<div class="achievements-grid" style="display: flex; flex-direction: column; gap: 12px;">`;
    for (const ach of this.catalog) {
      const unlocked = this.unlocked.has(ach.id);
      html += `<div class="glass-card" style="padding: 10px; border-left: 4px solid ${unlocked ? '#2ecc71' : '#555'}; opacity: ${unlocked ? '1' : '0.6'};">
        <span style="font-size: 1.4rem;">${ach.icon}</span>
        <strong style="margin-left: 8px;">${ach.title}</strong>
        <p style="margin: 4px 0; font-size: 0.9rem; color: var(--color-text-muted);">${ach.description}</p>
        ${!unlocked ? `<p style="font-size: 0.8rem; color: #e74c3c;">Noch nicht erreicht</p>` : ''}
      </div>`;
    }
    html += `</div>`;
    html += `<button class="primary-btn" id="btn-ach-close" style="margin-top: 15px; width: 100%;">Schließen</button>`;
    this.ui.openModal(html);
    document.getElementById('btn-ach-close').addEventListener('click', () => this.ui.closeModal());
  }
}

// Export to global scope (will be instantiated in main.js)
window.GameAchievements = null;
