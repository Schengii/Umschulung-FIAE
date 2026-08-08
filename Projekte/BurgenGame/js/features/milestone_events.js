// --- MILESTONE DRIVEN REALM EVENTS ---

class MilestoneEvents {
  constructor(stateManager, ui) {
    this.stateManager = stateManager;
    this.ui = ui;
  }

  init() {
    this.stateManager.addListener((state, changeType) => {
      this.checkMilestones(state);
    });
  }

  checkMilestones(state) {
    if (!state.triggeredMilestones) {
      state.triggeredMilestones = {};
    }

    // 1. Keep level 3 milestone
    const keep = state.buildings.find(b => b.type === BUILDING_TYPES.KEEP);
    if (keep && keep.level >= 3 && !state.triggeredMilestones['keep_lvl_3']) {
      state.triggeredMilestones['keep_lvl_3'] = true;
      this.triggerEvent('keep_lvl_3');
    }

    // 2. Troop count >= 10 milestone
    const totalTroops = (state.troops.spearman || 0) + (state.troops.swordsman || 0) + (state.troops.bowman || 0) + (state.troops.knight || 0);
    if (totalTroops >= 10 && !state.triggeredMilestones['recruit_10_troops']) {
      state.triggeredMilestones['recruit_10_troops'] = true;
      this.triggerEvent('recruit_10_troops');
    }

    // 3. First outpost captured
    const ownedOutposts = Object.values(state.outposts || {}).filter(op => op.owner === 'player').length;
    if (ownedOutposts >= 1 && !state.triggeredMilestones['conquer_first_outpost']) {
      state.triggeredMilestones['conquer_first_outpost'] = true;
      this.triggerEvent('conquer_first_outpost');
    }

    // 4. First Prestige Reset
    if (state.prestige && state.prestige.resets >= 1 && !state.triggeredMilestones['prestige_reset_1']) {
      state.triggeredMilestones['prestige_reset_1'] = true;
      this.triggerEvent('prestige_reset_1');
    }
  }

  triggerEvent(eventId) {
    const events = {
      keep_lvl_3: {
        title: "👑 Ein kaiserlicher Abgesandter trifft ein",
        text: "Dein Burgfried hat eine beeindruckende Größe erreicht. Ein Bote des Kaisers fordert Steuern, bietet aber auch diplomatische Privilegien an.",
        choices: [
          {
            text: "Zahle 300 Gold Tribut",
            action: () => {
              this.stateManager.state.resources.gold = Math.max(0, this.stateManager.state.resources.gold - 300);
              this.stateManager.state.happiness = Math.min(100, this.stateManager.state.happiness + 20);
              this.ui.showToast("Zufriedenheit erhöht (+20), 300 Gold gezahlt.", "info");
            }
          },
          {
            text: "Verweigere den Tribut (+500 Holz/Stein geschenkt, aber unzufriedene Bürger)",
            action: () => {
              this.stateManager.state.resources.wood += 500;
              this.stateManager.state.resources.stone += 500;
              this.stateManager.state.happiness = Math.max(0, this.stateManager.state.happiness - 25);
              this.ui.showToast("Ressourcen erhalten (+500 Holz/Stein), Zufriedenheit gesunken (-25).", "warning");
            }
          }
        ]
      },
      recruit_10_troops: {
        title: "⚔️ Die Legionen formieren sich",
        text: "Deine Armee ist herangewachsen. Ein erfahrener Söldnerhauptmann bietet an, deine Truppen für einen Obolus zu trainieren.",
        choices: [
          {
            text: "Zahle 100 Gold für hartes Training (+15 Waffen)",
            action: () => {
              this.stateManager.state.resources.gold = Math.max(0, this.stateManager.state.resources.gold - 100);
              this.stateManager.state.resources.weapons += 15;
              this.ui.showToast("100 Gold gezahlt, +15 Waffen erhalten.", "success");
            }
          },
          {
            text: "Lehne ab und spende Brot an die Soldaten (+100 Brot)",
            action: () => {
              this.stateManager.state.resources.bread += 100;
              this.ui.showToast("+100 Brot erhalten.", "info");
            }
          }
        ]
      },
      conquer_first_outpost: {
        title: "🚩 Ein neuer Horizont",
        text: "Du hast deinen ersten Außenposten erobert! Ein Händlerkartell schlägt einen exklusiven Handelsvertrag vor.",
        choices: [
          {
            text: "Vertrag unterschreiben (+5 Rubine, aber -100 Gold)",
            action: () => {
              this.stateManager.state.resources.rubies += 5;
              this.stateManager.state.resources.gold = Math.max(0, this.stateManager.state.resources.gold - 100);
              this.ui.showToast("+5 Rubine erhalten, 100 Gold verloren.", "success");
            }
          },
          {
            text: "Freien Handel behalten (+150 Nahrung)",
            action: () => {
              this.stateManager.state.resources.food += 150;
              this.ui.showToast("+150 Nahrung erhalten.", "info");
            }
          }
        ]
      },
      prestige_reset_1: {
        title: "🌟 Segen der Ahnen",
        text: "Du hast dein Königreich zurückgesetzt, um ruhmreicher neu zu beginnen. Ein mysteriöser Schamane bietet dir eine Wahl an.",
        choices: [
          {
            text: "Segen des Reichtums (+500 Gold)",
            action: () => {
              this.stateManager.state.resources.gold += 500;
              this.ui.showToast("+500 Gold erhalten.", "success");
            }
          },
          {
            text: "Segen der Götter (+15 Rubine)",
            action: () => {
              this.stateManager.state.resources.rubies += 15;
              this.ui.showToast("+15 Rubine erhalten.", "success");
            }
          }
        ]
      }
    };

    const ev = events[eventId];
    if (!ev) return;

    // Build event modal HTML
    let buttonsHtml = '';
    ev.choices.forEach((c, idx) => {
      buttonsHtml += `
        <button id="me-choice-${idx}" class="primary-btn gold-btn" style="width: 100%; margin-top: 10px; text-align: left;">
          ${c.text}
        </button>
      `;
    });

    const html = `
      <div style="text-align: center;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37;">${ev.title}</h2>
        <p style="margin: 15px 0; font-size: 0.95rem; line-height: 1.5; color: #f0f0f0;">${ev.text}</p>
        <div style="margin-top: 20px; display: flex; flex-direction: column; gap: 8px;">
          ${buttonsHtml}
        </div>
      </div>
    `;

    setTimeout(() => {
      this.ui.openModal(html);
      ev.choices.forEach((c, idx) => {
        const btn = document.getElementById(`me-choice-${idx}`);
        if (btn) {
          btn.addEventListener('click', () => {
            c.action();
            this.stateManager.save();
            this.ui.closeModal();
          });
        }
      });
    }, 1000);
  }
}
