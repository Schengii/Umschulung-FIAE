// --- RULER TITLES & ACHIEVEMENTS 2.0 FEATURE ---

const RULER_TITLES_CATALOG = [
  {
    id: 'builder',
    title: 'Der Großbaumeister',
    icon: '🏰',
    desc: 'Errichte mindestens 15 Gebäude in deiner Burg.',
    req: (state) => (state.buildings || []).length >= 15,
    perk: '+15% Baugeschwindigkeit'
  },
  {
    id: 'merciful',
    title: 'Der Barmherzige Herrscher',
    icon: '🕊️',
    desc: 'Erreiche ein Bündnis (Allianz) mit mindestens 2 K.I.-Nationen.',
    req: (state) => {
      if (!state.diplomacy) return false;
      return Object.values(state.diplomacy).filter(d => d.status === 'allied').length >= 2;
    },
    perk: '+10% Zufriedenheit im Volk'
  },
  {
    id: 'warlord',
    title: 'Der Kriegsfürst',
    icon: '⚔️',
    desc: 'Besiege mindestens 10 Raubritterburgen oder Feindwellen.',
    req: (state) => (state.statistics && state.statistics.npcDefeated >= 10),
    perk: '+10% Angriffskraft aller Einheiten'
  },
  {
    id: 'dragon_slayer',
    title: 'Der Drachenbezwinger',
    icon: '🐉',
    desc: 'Schlage den Uralten Drachenboss auf der Weltkarte zurück.',
    req: (state) => (state.statistics && state.statistics.maxNpcLevelDefeated >= 6),
    perk: '+20% Dungeon-Beute'
  }
];

class RulerTitleManager {
  constructor(stateManager, ui) {
    this.stateManager = stateManager;
    this.ui = ui;
  }

  init() {
    if (!this.stateManager.state.rulerTitles) {
      this.stateManager.state.rulerTitles = {
        unlocked: ['builder'],
        activeTitleId: 'builder'
      };
    }
  }

  checkUnlocks() {
    this.init();
    const state = this.stateManager.state;
    const ruler = state.rulerTitles;

    RULER_TITLES_CATALOG.forEach(t => {
      if (!ruler.unlocked.includes(t.id) && t.req(state)) {
        ruler.unlocked.push(t.id);
        this.ui.showToast(`👑 NEUER TITEL FREIGESCHALTET: ${t.icon} ${t.title}!`, 'success');
        if (window.SoundManager) window.SoundManager.playSuccess();
      }
    });
  }

  getActiveTitle() {
    this.init();
    const activeId = this.stateManager.state.rulerTitles.activeTitleId;
    return RULER_TITLES_CATALOG.find(t => t.id === activeId) || RULER_TITLES_CATALOG[0];
  }

  setActiveTitle(titleId) {
    this.init();
    const ruler = this.stateManager.state.rulerTitles;
    if (ruler.unlocked.includes(titleId)) {
      ruler.activeTitleId = titleId;
      if (window.SoundManager) window.SoundManager.playSuccess();
      return { success: true, msg: `👑 Titel auf "${this.getActiveTitle().title}" geändert!` };
    }
    return { success: false, msg: 'Titel noch nicht freigeschaltet.' };
  }
}

window.RulerTitleManager = null;
