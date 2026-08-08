// --- DYNAMIC STORY CHOICE EVENT ENGINE 2.0 ---

class StoryEventsEngine {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.events = [
      {
        id: 'refugees',
        title: '📜 Flüchtlingsstrom vor den Burgtoren',
        desc: 'Hunderte vertriebene Bauern bitten um Obdach in deiner Burg.',
        options: [
          { text: '🤝 Tore öffnen und aufnehmen', effect: '+20 Bevölkerung, -50 Nahrung', fn: () => { stateManager.state.population += 20; stateManager.state.food = Math.max(0, stateManager.state.food - 50); } },
          { text: '🛡️ Abweisen und Tore sichern', effect: '+10 Zufriedenheit der Adligen', fn: () => { stateManager.state.happiness = Math.min(100, (stateManager.state.happiness || 50) + 10); } }
        ]
      },
      {
        id: 'mine_strike',
        title: '⛏️ Streik in den Eisenminen',
        desc: 'Die Bergarbeiter fordern höhere Löhne wegen gefährlicher Stollen.',
        options: [
          { text: '💰 Löhne erhöhen (100 Gold)', effect: '+15% Eisenproduktion für 5 Min.', fn: () => { stateManager.state.gold = Math.max(0, stateManager.state.gold - 100); } },
          { text: '🗡️ Wachen einschicken', effect: '-10% Zufriedenheit, Arbeitsaufnahme', fn: () => { stateManager.state.happiness = Math.max(0, (stateManager.state.happiness || 50) - 10); } }
        ]
      }
    ];
  }

  triggerRandomEvent() {
    const ev = this.events[Math.floor(Math.random() * this.events.length)];
    this.showEventModal(ev);
  }

  showEventModal(ev) {
    let content = `
      <div style="padding: 10px; text-align: center;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">${ev.title}</h2>
        <p style="font-size: 0.95em; color: #ccc; margin-bottom: 20px;">${ev.desc}</p>
        <div style="display: flex; flex-direction: column; gap: 10px; max-width: 400px; margin: 0 auto;">
    `;

    ev.options.forEach((opt, idx) => {
      content += `
        <button onclick="window.storyEventsEngine.makeChoice('${ev.id}', ${idx})"
                style="padding: 10px; background: rgba(30,40,55,0.9); border: 1px solid #d4af37; border-radius: 6px; color: #fff; cursor: pointer; text-align: left;"
                onmouseover="this.style.background='rgba(50,65,90,0.9)'" onmouseout="this.style.background='rgba(30,40,55,0.9)'">
          <div style="font-weight: bold; color: #ffd700;">${opt.text}</div>
          <div style="font-size: 0.8em; color: #aaa; margin-top: 4px;">Auswirkung: ${opt.effect}</div>
        </button>
      `;
    });

    content += `</div></div>`;
    this.gameUI.showModal('Reichsereignis', content);
  }

  makeChoice(eventId, optionIdx) {
    const ev = this.events.find(e => e.id === eventId);
    if (!ev || !ev.options[optionIdx]) return;

    const opt = ev.options[optionIdx];
    opt.fn();

    this.gameUI.showFloatingNotification(`📜 Entscheidung getroffen: ${opt.text}`);
    this.gameUI.closeModal();
  }
}

window.StoryEventsEngine = StoryEventsEngine;
