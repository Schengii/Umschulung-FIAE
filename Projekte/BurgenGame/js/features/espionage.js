// --- ESPIONAGE & SABOTAGE FEATURE MODULE ---

class EspionageManager {
  constructor(stateManager, ui) {
    this.stateManager = stateManager;
    this.ui = ui;
  }

  getAvailableSpies() {
    return this.stateManager.state.troops.spy || 0;
  }

  getMaxSpies() {
    const tavern = this.stateManager.state.buildings.find(b => b.type === BUILDING_TYPES.TAVERN && !b.underConstruction);
    if (!tavern) return 0;
    const level = tavern.level || 1;
    return level * 4;
  }

  recruitSpy() {
    const current = this.getAvailableSpies();
    const max = this.getMaxSpies();
    if (current >= max) {
      if (this.ui) this.ui.showToast(`Spionage-Limit erreicht (${current}/${max})! Baue oder erweitere die Taverne.`, 'warning');
      return false;
    }

    const cost = { gold: 60, food: 30 };
    if (!this.stateManager.hasResources(cost)) {
      if (this.ui) this.ui.showToast('Nicht genügend Ressourcen für Spion! (60 Gold, 30 Nahrung)', 'error');
      return false;
    }

    this.stateManager.deductResources(cost);
    this.stateManager.state.troops.spy = current + 1;
    this.stateManager.save();
    this.stateManager.notifyListeners('spy_recruited');
    if (this.ui) this.ui.showToast('🕵️ Spion erfolgreich rekrutiert!', 'success');
    return true;
  }

  executeMission(targetType, targetId, missionType) {
    const spies = this.getAvailableSpies();
    if (spies <= 0) {
      if (this.ui) this.ui.showToast('Keine Spione verfügbar! Rekrutiere Spione in der Taverne.', 'error');
      return false;
    }

    // Deduct 1 spy
    this.stateManager.state.troops.spy -= 1;
    
    // Calculate success chance (70% base + 5% per tavern level)
    const tavern = this.stateManager.state.buildings.find(b => b.type === BUILDING_TYPES.TAVERN && !b.underConstruction);
    const tavernLevel = tavern ? tavern.level : 1;
    const successChance = Math.min(0.95, 0.70 + (tavernLevel * 0.05));
    const isSuccess = Math.random() < successChance;

    if (!isSuccess) {
      this.stateManager.save();
      if (this.ui) {
        this.ui.showToast('💥 Spion wurde vom Feind aufgedeckt und gefangen genommen!', 'error');
        this.ui.showNotificationModal('🕵️ Mission gescheitert', 'Dein Spion wurde entdeckt und hingerichtet. Der Feind hat seine Wachen verstärkt.');
      }
      return false;
    }

    let reportTitle = '';
    let reportText = '';

    if (missionType === 'scout') {
      reportTitle = '📜 Auskundschaftungs-Bericht';
      reportText = `Dein Spion kehrte erfolgreich zurück! Target: ${targetId}.<br><br>` +
        `• <b>Geschätzte Truppen:</b> ~${15 + Math.floor(Math.random() * 20)} Nahkämpfer, ~${10 + Math.floor(Math.random() * 15)} Fernkämpfer.<br>` +
        `• <b>Mauerverteidigung:</b> Stufe ${Math.floor(1 + Math.random() * 3)} (+25% Def).<br>` +
        `• <b>Schatzkammer-Beute:</b> ~${150 + Math.floor(Math.random() * 250)} Gold, ~${100 + Math.floor(Math.random() * 150)} Rohstoffe.`;
    } else if (missionType === 'poison') {
      reportTitle = '🧪 Brunnen-Sabotage';
      reportText = `Dein Spion hat heimlich Gift in die Wasserversorgung geschüttet! Die Truppen der Festung sind geschwächt (-25% Gesundheit beim nächsten Kampf).`;
      if (!this.stateManager.state.activePoisonTarget) this.stateManager.state.activePoisonTarget = {};
      this.stateManager.state.activePoisonTarget[targetId] = true;
    } else if (missionType === 'steal_tech') {
      reportTitle = '💎 Technologieraub';
      const gainedRubies = 20 + Math.floor(Math.random() * 30);
      this.stateManager.state.resources.rubies = (this.stateManager.state.resources.rubies || 0) + gainedRubies;
      reportText = `Dein Spion hat gegnerische Baupläne entwendet und wertvolle Rubine erbeutet! 💎 +${gainedRubies} Rubine erhalten.`;
    } else {
      reportTitle = '💥 Sabotage-Akt';
      reportText = `Dein Spion hat Sprengsätze an der gegnerischen Befestigung gezündet! Die Außenposten-Befestigung wurde beschädigt.`;
    }

    this.stateManager.save();
    if (this.ui) {
      this.ui.showToast('🕵️ Spionage-Mission erfolgreich!', 'success');
      this.ui.showNotificationModal(reportTitle, reportText);
    }
    return true;
  }
}

window.EspionageManager = EspionageManager;
