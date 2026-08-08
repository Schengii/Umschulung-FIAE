// --- INTERACTIVE DISASTER MITIGATION & PROTECTION BUILDINGS ---

class DisasterMitigation {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
  }

  checkProtection(disasterType) {
    const buildings = stateManager.state.buildings || [];
    if (disasterType === 'fire' || disasterType === 'lightning') {
      const fireStation = buildings.find(b => b.type === BUILDING_TYPES.FIRE_STATION);
      if (fireStation) {
        this.gameUI.showFloatingNotification('🚒 Feuerwehr hat den Brand sofort gelöscht! Schaden verhindert.');
        return true;
      }
    }
    if (disasterType === 'plague' || disasterType === 'locusts') {
      const granarySeal = buildings.find(b => b.type === BUILDING_TYPES.GRANARY_SEAL);
      if (granarySeal) {
        this.gameUI.showFloatingNotification('🌾 Versiegelter Kornspeicher hat die Ernte vor Schädlingen geschützt!');
        return true;
      }
    }
    return false;
  }

  showModal() {
    const buildings = stateManager.state.buildings || [];
    const hasFireStation = buildings.some(b => b.type === BUILDING_TYPES.FIRE_STATION);
    const hasGranarySeal = buildings.some(b => b.type === BUILDING_TYPES.GRANARY_SEAL);

    const content = `
      <div style="padding: 10px;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">🚒 Katastrophen-Schutzvorsorge</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 16px;">Errichte Schutzgebäude, um dein Königreich vor verheerenden Feuerbränden und Schädlingen zu bewahren.</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px;">
          <div style="background: rgba(20,25,35,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 12px;">
            <h3 style="color: #ff5722; margin-bottom: 4px;">🚒 Feuerwache</h3>
            <div style="font-size: 0.8em; color: #aaa; margin-bottom: 8px;">Löscht spontane Brände und Blitzeinschläge automatisch ab.</div>
            <div style="font-weight: bold; color: ${hasFireStation ? '#4CAF50' : '#ff9800'}; font-size: 0.85em;">
              Status: ${hasFireStation ? '✓ Errichtet (Aktiv)' : '❌ Nicht gebaut'}
            </div>
          </div>

          <div style="background: rgba(20,25,35,0.8); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 12px;">
            <h3 style="color: #4CAF50; margin-bottom: 4px;">🌾 Kornspeicher-Versiegelung</h3>
            <div style="font-size: 0.8em; color: #aaa; margin-bottom: 8px;">Bewahrt deine Nahrungsvorräte vor Heuschrecken-Plagen.</div>
            <div style="font-weight: bold; color: ${hasGranarySeal ? '#4CAF50' : '#ff9800'}; font-size: 0.85em;">
              Status: ${hasGranarySeal ? '✓ Errichtet (Aktiv)' : '❌ Nicht gebaut'}
            </div>
          </div>
        </div>
      </div>
    `;

    this.gameUI.showModal('Katastrophen-Schutz', content);
  }
}

window.DisasterMitigation = DisasterMitigation;
