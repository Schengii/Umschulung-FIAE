// --- NATURAL DISASTERS & CRISIS MANAGEMENT FEATURE ---

const DISASTER_EVENTS = [
  {
    id: 'earthquake',
    title: '🌋 Schweres Erdbeben!',
    desc: 'Ein heftiges Beben erschüttert die Burg! Gebäude drohen einzustürzen.',
    choices: [
      {
        text: '🔨 Notfall-Reparaturen einleiten (-150 Stein, -100 Holz)',
        check: (state) => (state.resources.stone || 0) >= 150 && (state.resources.wood || 0) >= 100,
        apply: (state) => {
          state.resources.stone -= 150;
          state.resources.wood -= 100;
          return '✅ Reparaturen erfolgreich! Die Gebäude blieben unbeschädigt.';
        }
      },
      {
        text: '⚠️ Trümmer ignorieren (Verlust von 20 Zufriedenheit)',
        check: () => true,
        apply: (state) => {
          state.happiness = Math.max(0, (state.happiness || 50) - 20);
          return '❌ Bevölkerung ist verängstigt! Zufriedenheit gesunken.';
        }
      }
    ]
  },
  {
    id: 'drought',
    title: '☀️ Verheerende Dürrewelle!',
    desc: 'Die Felder vertrocknen und das Brunnenwasser wird knapp.',
    choices: [
      {
        text: '🌾 Kornspeicher-Vorratsausgabe (-200 Nahrung)',
        check: (state) => (state.resources.food || 0) >= 200,
        apply: (state) => {
          state.resources.food -= 200;
          return '✅ Notrationen verteilt! Hungersnot abgewendet.';
        }
      },
      {
        text: '⚠️ Nichts unternehmen (Strikter Ernteausfall)',
        check: () => true,
        apply: (state) => {
          state.resources.food = Math.floor((state.resources.food || 0) * 0.5);
          return '❌ Hälfte der Nahrungsvorräte verdorben!';
        }
      }
    ]
  },
  {
    id: 'pestilence',
    title: '☣️ Grippe-Epidemie im Volk!',
    desc: 'Eine seltsame Krankheit schwächt die Bürger und Truppen.',
    choices: [
      {
        text: '🧪 Heilkräuter & Medizin verteilen (-150 Gold)',
        check: (state) => (state.resources.gold || 0) >= 150,
        apply: (state) => {
          state.resources.gold -= 150;
          return '✅ Medizin verteilt! Das Volk ist schnell genesen.';
        }
      },
      {
        text: '⚠️ Quarantäne verhängen (-10% Produktion für 5 Minuten)',
        check: () => true,
        apply: (state) => {
          state.happiness = Math.max(0, (state.happiness || 50) - 10);
          return '⚠️ Quarantäne aktiv! Produktion leicht beeinträchtigt.';
        }
      }
    ]
  }
];

GameStateManager.prototype.initDisasters = function() {
  if (!this.state.nextDisasterTime) {
    this.state.nextDisasterTime = Date.now() + 480000; // 8 minutes
  }
};

GameStateManager.prototype.checkDisasterEvents = function() {
  this.initDisasters();
  if (Date.now() >= this.state.nextDisasterTime) {
    this.state.nextDisasterTime = Date.now() + (480000 + Math.random() * 480000);
    // If player completed Cathedral Wonder, immune!
    if (this.state.wonders && this.state.wonders.cathedral >= 3) {
      if (window.gameUI) gameUI.addLog('⛪ Die Kathedrale des Lichts hat das Reich vor einer Katastrophe beschützt!', 'success');
      return;
    }

    const disaster = DISASTER_EVENTS[Math.floor(Math.random() * DISASTER_EVENTS.length)];
    if (window.gameUI) {
      gameUI.openDisasterModal(disaster);
    }
  }
};

GameUI.prototype.openDisasterModal = function(disaster) {
  let choicesHtml = disaster.choices.map((c, idx) => {
    const canDo = c.check(stateManager.state);
    return `
      <button class="primary-btn btn-disaster-choice" data-idx="${idx}" ${canDo ? '' : 'disabled'} style="width: 100%; margin-bottom: 8px; font-size: 0.82rem;">
        ${c.text}
      </button>
    `;
  }).join('');

  const html = `
    <div class="glass-card" style="padding: 15px; border-color: #e74c3c;">
      <h2 style="color: #e74c3c; margin-top: 0;">${disaster.title}</h2>
      <p style="font-size: 0.9rem; line-height: 1.4;">${disaster.desc}</p>
      <div style="margin-top: 15px;">
        ${choicesHtml}
      </div>
    </div>
  `;

  this.openModal(html);

  document.querySelectorAll('.btn-disaster-choice').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.getAttribute('data-idx'));
      const choice = disaster.choices[idx];
      const msg = choice.apply(stateManager.state);
      stateManager.save();
      this.closeModal();
      this.showFloatingNotification(msg);
    });
  });
};
