// --- STORY CAMPAIGN & CHAPTER MODE FEATURE ---

const CAMPAIGN_CHAPTERS = [
  {
    id: 'ch1',
    title: 'Kapitel 1: Das Erbe der Väter',
    speaker: '🏰 Burggraf Edward',
    portrait: '👑',
    desc: 'Seid gegrüßt, neuer Herrscher! Euer Vater hinterließ diese Burg in schweren Zeiten. Wir müssen die Infrastruktur sichern und Vorräte anlegen.',
    objectiveDesc: 'Baue deinen Burgfried auf Stufe 2 und besitze mindestens 200 Holz & Stein.',
    checkComplete: (state) => {
      const keep = state.buildings?.find(b => b.type === 'keep');
      return keep && keep.level >= 2 && (state.resources.wood || 0) >= 200 && (state.resources.stone || 0) >= 200;
    },
    reward: { gold: 300, rubies: 15, wood: 200 },
    rewardText: '🪙 300 Gold | 💎 15 Rubine | 🪵 200 Holz'
  },
  {
    id: 'ch2',
    title: 'Kapitel 2: Die Bedrohung der Raubritter',
    speaker: '⚔️ Hauptmann Marcus',
    portrait: '🛡️',
    desc: 'Gesetzlose Banditen plündern die Dörfer unserer Nachbarn. Wir müssen eine schlagkräftige Truppe ausbilden und eine Räuberburg auf der Weltkarte erobern!',
    objectiveDesc: 'Rekrutiere mindestens 10 Soldaten und besiege mindestens 1 NPC-Burg auf der Weltkarte.',
    checkComplete: (state) => {
      const totalTroops = Object.values(state.troops || {}).reduce((a, b) => a + b, 0);
      const defeated = state.statistics?.npcDefeated || 0;
      return totalTroops >= 10 && defeated >= 1;
    },
    reward: { gold: 500, rubies: 25, weapons: 10 },
    rewardText: '🪙 500 Gold | 💎 25 Rubine | 🗡️ 10 Waffen'
  },
  {
    id: 'ch3',
    title: 'Kapitel 3: Bündnis der Reiche',
    speaker: '📜 Diplomat Valerius',
    portrait: '🤝',
    desc: 'Um gegen größere Bedrohungen zu bestehen, brauchen wir Verbündete. Schließe ein offizielles Bündnis mit einer KI-Nation!',
    objectiveDesc: 'Erreiche den Status "Verbündet" (Allied) mit mindestens einer KI-Nation im Diplomatie-Menü.',
    checkComplete: (state) => {
      if (!state.diplomacy) return false;
      return Object.values(state.diplomacy).some(d => d.status === 'allied');
    },
    reward: { gold: 750, rubies: 40, food: 500 },
    rewardText: '🪙 750 Gold | 💎 40 Rubine | 🌾 500 Nahrung'
  },
  {
    id: 'ch4',
    title: 'Kapitel 4: Der Ruf der Hohen See',
    speaker: '⛵ Kapitän Drake',
    portrait: '⚓',
    desc: 'Jenseits des Horizonts liegen unerforschte Inseln voller Schätze. Baue ein Handelsschiff und starte deine erste Übersee-Expedition!',
    objectiveDesc: 'Besitze mindestens 1 Schiff und führe eine See-Expedition aus.',
    checkComplete: (state) => {
      return (state.maritimeShips && state.maritimeShips.length >= 1) || (state.statistics?.expeditionsCount || 0) >= 1;
    },
    reward: { gold: 1000, rubies: 50, iron: 100 },
    rewardText: '🪙 1000 Gold | 💎 50 Rubine | ⛓️ 100 Eisen'
  },
  {
    id: 'ch5',
    title: 'Kapitel 5: Die Kaiserliche Krone',
    speaker: '👑 Kaiser Aurelius',
    portrait: '🏆',
    desc: 'Ihr habt bewiesen, dass Ihr würdig seid! Erreicht die Imperialzeit und baut euer Königreich zur unanfechtbaren Großmacht aus.',
    objectiveDesc: 'Erreiche die Imperialzeit (Burgfried Level 4).',
    checkComplete: (state) => {
      return state.ageIndex >= 3;
    },
    reward: { gold: 2000, rubies: 100 },
    rewardText: '🪙 2000 Gold | 💎 100 Rubine | 👑 Titel "Kaiserlicher Großherzog"'
  }
];

GameStateManager.prototype.initCampaign = function() {
  if (!this.state.campaign) {
    this.state.campaign = {
      completedChapters: [],
      claimedRewards: []
    };
  }
};

GameStateManager.prototype.getCampaignProgress = function() {
  this.initCampaign();
  const c = this.state.campaign;
  return CAMPAIGN_CHAPTERS.map(ch => {
    const isCompleted = ch.checkComplete(this.state);
    const isClaimed = c.claimedRewards.includes(ch.id);
    return { ...ch, isCompleted, isClaimed };
  });
};

GameStateManager.prototype.claimCampaignReward = function(chapterId) {
  this.initCampaign();
  const progress = this.getCampaignProgress();
  const ch = progress.find(item => item.id === chapterId);
  if (!ch || !ch.isCompleted || ch.isClaimed) return false;

  Object.keys(ch.reward).forEach(res => {
    this.state.resources[res] = (this.state.resources[res] || 0) + ch.reward[res];
  });

  this.state.campaign.claimedRewards.push(chapterId);
  this.save();
  this.notifyListeners('campaign_reward_claimed');
  return true;
};

GameUI.prototype.openCampaignModal = function() {
  const chapters = stateManager.getCampaignProgress();

  let html = `
    <h2>📜 Story-Kampagne - Pfad des Herrschers</h2>
    <p class="modal-intro">Erfülle die Kapitel-Aufgaben deiner Berater, um das Königreich zur Blüte zu führen und legendäre Belohnungen zu kassieren.</p>
    
    <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
  `;

  chapters.forEach((ch, idx) => {
    html += `
      <div class="glass-card" style="padding: 12px; border-left: 4px solid ${ch.isClaimed ? '#2ecc71' : ch.isCompleted ? '#f1c40f' : '#7f8c8d'}; opacity: ${ch.isClaimed ? '0.7' : '1'};">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 0.95rem; color: var(--color-gold-hover);">${ch.portrait} ${ch.title}</h3>
          <span style="font-size: 0.75rem; font-weight: bold; color: ${ch.isClaimed ? '#2ecc71' : ch.isCompleted ? '#f1c40f' : '#bdc3c7'};">
            ${ch.isClaimed ? '✓ Abgeschlossen' : ch.isCompleted ? '⭐ Bereit zur Abgabe!' : 'In Arbeit'}
          </span>
        </div>
        <p style="font-size: 0.8rem; margin: 6px 0; color: #ecf0f1; font-style: italic;">"${ch.desc}"</p>
        <div style="font-size: 0.78rem; color: #bdc3c7; background: rgba(0,0,0,0.3); padding: 6px; border-radius: 4px; margin: 6px 0;">
          🎯 <strong>Ziel:</strong> ${ch.objectiveDesc}
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
          <span style="font-size: 0.75rem; color: var(--color-gold-primary);">🎁 Belohnung: ${ch.rewardText}</span>
          ${ch.isCompleted && !ch.isClaimed ? `
            <button class="primary-btn btn-claim-campaign" data-id="${ch.id}" style="font-size: 0.75rem; padding: 4px 10px; border-color: #f1c40f;">Belohnung abholen</button>
          ` : ''}
        </div>
      </div>
    `;
  });

  html += `
    </div>
    <button id="btn-close-campaign" class="primary-btn" style="width: 100%; margin-top: 15px;">Schließen</button>
  `;

  this.openModal(html);

  document.querySelectorAll('.btn-claim-campaign').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.getAttribute('data-id');
      if (stateManager.claimCampaignReward(id)) {
        this.showFloatingNotification('Kapitel-Belohnung erfolgreich erhalten! 🎉');
        if (window.gameSound) window.gameSound.playSFX('upgrade');
        this.openCampaignModal();
      }
    });
  });

  document.getElementById('btn-close-campaign').addEventListener('click', () => this.closeModal());
};
