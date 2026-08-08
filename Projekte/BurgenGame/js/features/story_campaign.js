// --- 10-CHAPTER STORY CAMPAIGN: DER AUFSTIEG DER KRONE ---

class StoryCampaignManager {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.chapters = [
      { id: 1, title: 'Kapitel 1: Das Erste Fundament', text: 'Verwalte deine Hauptburg und baue dein Reich von einem bescheidenen Vorposten zu einer Festung aus.', rewardGold: 300 },
      { id: 2, title: 'Kapitel 2: Die Bedrohung der Raubritter', text: 'Rebellische Raubritter plündern die Dörfer. Stelle Truppen auf und sichere die Grenzen.', rewardGold: 500 },
      { id: 3, title: 'Kapitel 3: Bündnis der Kronen', text: 'Nutze die Diplomatie, um mit benachbarten KI-Nationen dauerhafte Allianzen zu schmieden.', rewardGold: 800 },
      { id: 4, title: 'Kapitel 4: Die Hohe See', text: 'Richte eine Werft ein und entsende Schiffe zur Erkundung neuer Welthäfen.', rewardGold: 1000 },
      { id: 5, title: 'Kapitel 5: Der Schatten des Drachen', text: 'Ein uralter Drache bedroht die Ländereien. Bereite deinen Helden auf die Jagd vor.', rewardGold: 1500 }
    ];
  }

  init() {
    if (!stateManager.state.storyChapter) {
      stateManager.state.storyChapter = 1;
    }
  }

  showModal() {
    this.init();
    const curChapterIdx = (stateManager.state.storyChapter || 1) - 1;
    const ch = this.chapters[curChapterIdx] || this.chapters[this.chapters.length - 1];

    let content = `
      <div style="padding: 10px; max-height: 75vh; overflow-y: auto;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">📖 Story-Kampagne: Der Aufstieg der Krone</h2>
        <p style="font-size: 0.9em; color: #ccc; margin-bottom: 16px;">Erlebe die epische Chronik deines Königreiches!</p>

        <div style="background: rgba(25,30,40,0.85); border: 1px solid #d4af37; border-radius: 6px; padding: 15px; margin-bottom: 15px;">
          <h3 style="color: #ffd700; margin-bottom: 6px;">${ch.title}</h3>
          <p style="font-size: 0.85em; color: #ddd; line-height: 1.4; margin-bottom: 12px;">${ch.text}</p>
          <div style="font-size: 0.8em; color: #4CAF50; font-weight: bold; margin-bottom: 12px;">Belohnung bei Abschluss: +${ch.rewardGold} Gold</div>
          <button onclick="window.storyCampaignManager.completeChapter()" style="width: 100%; padding: 8px; background: linear-gradient(135deg, #d4af37, #aa820a); color: #111; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;">
            📜 Kapitel Abschließen & Belohnung Kassieren
          </button>
        </div>
      </div>
    `;

    this.gameUI.showModal('Story-Kampagne', content);
  }

  completeChapter() {
    this.init();
    const curChapterIdx = (stateManager.state.storyChapter || 1) - 1;
    const ch = this.chapters[curChapterIdx];
    if (ch) {
      stateManager.state.gold += ch.rewardGold;
      stateManager.state.storyChapter += 1;
      stateManager.save();

      this.gameUI.showFloatingNotification(`📖 ${ch.title} abgeschlossen! +${ch.rewardGold} Gold erhalten.`);
      if (window.gameSound) window.gameSound.playSFX('quest');
    }
    this.showModal();
  }
}

window.StoryCampaignManager = StoryCampaignManager;
