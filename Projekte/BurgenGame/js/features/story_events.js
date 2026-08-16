// --- DYNAMIC STORY CHOICE EVENT ENGINE 2.0 ---

class StoryEventsEngine {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.triggeredEvents = new Set(); // Verfolgt bereits ausgelöste Einzel-Events
    this.lastRandomEventTime = 0;
    this.randomEventInterval = 4 * 60 * 1000; // 4 Minuten zwischen zufälligen Events

    this.events = [
      // ============================================================
      // ORIGINALE EVENTS (mit Bug-Fixes)
      // ============================================================
      {
        id: 'refugees',
        title: '📜 Flüchtlingsstrom vor den Burgtoren',
        desc: 'Hunderte vertriebene Bauern bitten um Obdach in deiner Burg. Ihr Anführer bittet mit gesenktem Kopf: "Bitte, edler Herr – unsere Dörfer wurden von Raubrittern geplündert."',
        type: 'random',
        options: [
          {
            text: '🤝 Tore öffnen und aufnehmen',
            effect: '+20 Bevölkerung, -100 Nahrung',
            fn: (state) => {
              state.population = (state.population || 0) + 20;
              // BUG FIX: state.resources.food statt state.food
              state.resources.food = Math.max(0, (state.resources.food || 0) - 100);
              state.happiness = Math.min(100, (state.happiness || 50) + 5);
            }
          },
          {
            text: '🛡️ Abweisen und Tore sichern',
            effect: '+10 Zufriedenheit der Adligen, Flüchtlinge ziehen weiter',
            fn: (state) => {
              state.happiness = Math.min(100, (state.happiness || 50) + 10);
            }
          },
          {
            text: '💰 Gegen Arbeit aufnehmen',
            effect: '+10 Bevölkerung, +5 Werkzeug (Ressource), -50 Nahrung',
            fn: (state) => {
              state.population = (state.population || 0) + 10;
              state.resources.food = Math.max(0, (state.resources.food || 0) - 50);
              state.resources.wood = (state.resources.wood || 0) + 30; // Holzfäller helfen
            }
          }
        ]
      },
      {
        id: 'mine_strike',
        title: '⛏️ Streik in den Eisenminen',
        desc: 'Die Bergarbeiter legen die Arbeit nieder. "Wir riskieren täglich unser Leben in diesen Stollen – und unser Lohn reicht kaum zum Leben!"',
        type: 'random',
        options: [
          {
            text: '💰 Löhne erhöhen (-200 Gold)',
            effect: '+15% Eisenproduktion für 5 Min, +10 Zufriedenheit',
            fn: (state) => {
              // BUG FIX: state.resources.gold statt state.gold
              state.resources.gold = Math.max(0, (state.resources.gold || 0) - 200);
              state.happiness = Math.min(100, (state.happiness || 50) + 10);
              if (!state.productionBoosts) state.productionBoosts = {};
              state.productionBoosts.iron = { mult: 1.15, expiresAt: Date.now() + 5 * 60 * 1000 };
            }
          },
          {
            text: '🗡️ Wachen einschicken',
            effect: '-15 Zufriedenheit, Arbeit wird erzwungen',
            fn: (state) => {
              state.happiness = Math.max(0, (state.happiness || 50) - 15);
            }
          },
          {
            text: '🤝 Kompromiss: Kürzere Schichten',
            effect: '-10% Eisenproduktion dauerhaft, aber +8 Zufriedenheit',
            fn: (state) => {
              state.happiness = Math.min(100, (state.happiness || 50) + 8);
              if (!state.productionPenalties) state.productionPenalties = {};
              state.productionPenalties.iron = 0.9;
            }
          }
        ]
      },

      // ============================================================
      // NEUE EVENTS – NATURKATASTROPHEN
      // ============================================================
      {
        id: 'drought',
        title: '☀️ Verheerende Dürre',
        desc: 'Monatelang kein Regen. Die Felder vertrocknen, Brunnen versiegen. Das Volk hungert, während die Vorräte schwinden.',
        type: 'random',
        options: [
          {
            text: '💰 Nahrung auf dem Markt kaufen (-500 Gold)',
            effect: '+200 Nahrung, Krise abgewendet',
            fn: (state) => {
              state.resources.gold = Math.max(0, (state.resources.gold || 0) - 500);
              state.resources.food = (state.resources.food || 0) + 200;
            }
          },
          {
            text: '🙏 Feierliche Opfergabe (Ressourcen verbrennen)',
            effect: '-100 Holz, -100 Getreide – Regen kommt nach 2 Minuten',
            fn: (state) => {
              state.resources.wood = Math.max(0, (state.resources.wood || 0) - 100);
              state.resources.food = Math.max(0, (state.resources.food || 0) - 100);
              state.happiness = Math.min(100, (state.happiness || 50) + 5);
            }
          },
          {
            text: '⚠️ Rationierung einführen',
            effect: '-20 Zufriedenheit, aber keine Ressourcenkosten',
            fn: (state) => {
              state.happiness = Math.max(0, (state.happiness || 50) - 20);
            }
          }
        ]
      },
      {
        id: 'great_fire',
        title: '🔥 Das Große Stadtfeuer',
        desc: 'Ein verheerende Brand wütet in den Handwerksbezirken! Die Flammen drohen auf die Burg überzugreifen.',
        type: 'random',
        options: [
          {
            text: '💧 Löschtrupp entsenden (-100 Gold, -50 Holz)',
            effect: 'Feuer gelöscht, minimaler Schaden',
            fn: (state) => {
              state.resources.gold = Math.max(0, (state.resources.gold || 0) - 100);
              state.resources.wood = Math.max(0, (state.resources.wood || 0) - 50);
            }
          },
          {
            text: '🏰 Burg sichern und warten',
            effect: '-200 Holz (verbrannt), -15 Zufriedenheit',
            fn: (state) => {
              state.resources.wood = Math.max(0, (state.resources.wood || 0) - 200);
              state.happiness = Math.max(0, (state.happiness || 50) - 15);
            }
          }
        ]
      },
      {
        id: 'plague',
        title: '💀 Die Schwarze Pest',
        desc: 'Eine unbekannte Krankheit grassiert in der Stadt. Händler berichten von sterbenden Familien. Der Stadtarzt ist hilflos.',
        type: 'random',
        options: [
          {
            text: '🏥 Heilkräuter aus dem Markt kaufen (-300 Gold)',
            effect: 'Seuche eingedämmt, -5 Bevölkerung',
            fn: (state) => {
              state.resources.gold = Math.max(0, (state.resources.gold || 0) - 300);
              state.population = Math.max(5, (state.population || 10) - 5);
            }
          },
          {
            text: '🚫 Quarantäne verhängen',
            effect: '-15 Zufriedenheit, -10 Bevölkerung, Seuche gestoppt',
            fn: (state) => {
              state.happiness = Math.max(0, (state.happiness || 50) - 15);
              state.population = Math.max(5, (state.population || 10) - 10);
            }
          },
          {
            text: '🙏 Mönche zur Seelsorge rufen (-50 Gold)',
            effect: '-15 Bevölkerung, aber +10 Zufriedenheit (Glauben stärkt)',
            fn: (state) => {
              state.resources.gold = Math.max(0, (state.resources.gold || 0) - 50);
              state.population = Math.max(5, (state.population || 10) - 15);
              state.happiness = Math.min(100, (state.happiness || 50) + 10);
            }
          }
        ]
      },

      // ============================================================
      // NEUE EVENTS – WIRTSCHAFT & HANDEL
      // ============================================================
      {
        id: 'merchant_caravan',
        title: '🚛 Fliegender Händler am Burgtor',
        desc: 'Ein exotischer Fernhändler aus dem Orient bietet seltene Waren an, die normalerweise nicht auf dem Markt erhältlich sind.',
        type: 'random',
        options: [
          {
            text: '🌶️ Seltene Gewürze kaufen (-400 Gold)',
            effect: '+5 Luxusgüter-Gewürze, +10 Zufriedenheit für 10 Min',
            fn: (state) => {
              state.resources.gold = Math.max(0, (state.resources.gold || 0) - 400);
              if (!state.luxuryGoods) state.luxuryGoods = { spices: 0, silk: 0, gemstones: 0 };
              state.luxuryGoods.spices = (state.luxuryGoods.spices || 0) + 5;
            }
          },
          {
            text: '⚔️ Fremdländische Waffen kaufen (-600 Gold)',
            effect: '+20 Waffen im Zeughaus',
            fn: (state) => {
              state.resources.gold = Math.max(0, (state.resources.gold || 0) - 600);
              state.resources.weapons = (state.resources.weapons || 0) + 20;
            }
          },
          {
            text: '❌ Händler höflich abweisen',
            effect: 'Keine Kosten, keine Boni',
            fn: (state) => {}
          }
        ]
      },
      {
        id: 'gold_mine_discovery',
        title: '⛏️ Goldader entdeckt!',
        desc: 'Ein Bergmann kommt aufgeregt in den Thronsaal: "Edler Herr! Wir haben in den östlichen Stollen eine reiche Goldader entdeckt!"',
        type: 'rare',
        options: [
          {
            text: '⛏️ Sofort abbauen (-200 Holz für Stollen)',
            effect: '+800 Gold Einmalbonus!',
            fn: (state) => {
              state.resources.wood = Math.max(0, (state.resources.wood || 0) - 200);
              state.resources.gold = (state.resources.gold || 0) + 800;
            }
          },
          {
            text: '🏭 Bergwerksinfrastruktur aufbauen (-500 Gold, -300 Stein)',
            effect: '+50% dauerhafte Goldproduktion (Bonus-Multiplier)',
            fn: (state) => {
              state.resources.gold = Math.max(0, (state.resources.gold || 0) - 500);
              state.resources.stone = Math.max(0, (state.resources.stone || 0) - 300);
              state.resources.gold += 200; // Sofortgewinn
              if (!state.productionBoosts) state.productionBoosts = {};
              state.productionBoosts.gold_permanent = { mult: 1.5 };
            }
          }
        ]
      },

      // ============================================================
      // NEUE EVENTS – MILITÄR & POLITIK
      // ============================================================
      {
        id: 'desertion_crisis',
        title: '🏃 Fahnenflucht im Heer',
        desc: 'Ein Viertel deiner Truppen ist in der Nacht desertiert. Die langen Feldzüge und schlechte Versorgung haben die Moral zerstört.',
        type: 'random',
        options: [
          {
            text: '💰 Sold erhöhen (-300 Gold pro 5 Soldaten zurück)',
            effect: '75% der Desertierten kehren zurück',
            fn: (state) => {
              const total = Object.values(state.troops || {}).reduce((a, b) => a + b, 0);
              const lost = Math.floor(total * 0.25);
              state.resources.gold = Math.max(0, (state.resources.gold || 0) - 300);
              // 75% kehren zurück = 25% bleiben weg
              const actualLoss = Math.floor(lost * 0.25);
              const mainType = Object.keys(state.troops || {}).find(t => (state.troops[t] || 0) > actualLoss);
              if (mainType) state.troops[mainType] = Math.max(0, (state.troops[mainType] || 0) - actualLoss);
            }
          },
          {
            text: '⚔️ Beispielhafte Bestrafung der Überläufer',
            effect: '-20 Zufriedenheit, aber keine Truppen verloren',
            fn: (state) => {
              state.happiness = Math.max(0, (state.happiness || 50) - 20);
            }
          },
          {
            text: '🕊️ Amnestie anbieten',
            effect: '-50 Zufriedenheit kurz, aber alle Deserteure kehren zurück',
            fn: (state) => {
              state.happiness = Math.min(100, (state.happiness || 50) + 5); // Volkssympathie
            }
          }
        ]
      },
      {
        id: 'spy_caught',
        title: '🕵️ Fremder Spion aufgedeckt!',
        desc: 'Deine Wachen haben einen Spion des Nachbarreiches gefasst. Er trägt geheime Dokumente über deine Burganlage.',
        type: 'random',
        options: [
          {
            text: '⚔️ Hinrichten und Burg verstärken',
            effect: '-20 diplomatische Beziehungen zum Nachbarn, +5 Zufriedenheit',
            fn: (state) => {
              state.happiness = Math.min(100, (state.happiness || 50) + 5);
              if (state.diplomacy) {
                const firstNation = Object.keys(state.diplomacy)[0];
                if (firstNation && state.diplomacy[firstNation].relations !== undefined) {
                  state.diplomacy[firstNation].relations = Math.max(-100, (state.diplomacy[firstNation].relations || 0) - 20);
                }
              }
            }
          },
          {
            text: '🤝 Als Doppelspion einsetzen',
            effect: '+15 diplomatische Beziehungen, Informationen über den Nachbarn',
            fn: (state) => {
              if (state.diplomacy) {
                const firstNation = Object.keys(state.diplomacy)[0];
                if (firstNation && state.diplomacy[firstNation].relations !== undefined) {
                  state.diplomacy[firstNation].relations = Math.min(100, (state.diplomacy[firstNation].relations || 0) + 15);
                }
              }
              state.resources.rubies = (state.resources.rubies || 0) + 5; // Wertvolle Infos
            }
          }
        ]
      },

      // ============================================================
      // NEUE EVENTS – ENTDECKUNGEN & MYSTERIEN
      // ============================================================
      {
        id: 'ancient_ruins',
        title: '🏛️ Antike Ruinen entdeckt',
        desc: 'Beim Ausheben von Fundamenten für ein neues Gebäude stoßen Arbeiter auf ein antikes Gewölbe. Darin: vergessene Artefakte einer alten Zivilisation.',
        type: 'random',
        options: [
          {
            text: '🔍 Artefakte bergenn und untersuchen',
            effect: '+30 Rubine, Gelehrte begeistert (+5 Forschungs-Momentum)',
            fn: (state) => {
              state.resources.rubies = (state.resources.rubies || 0) + 30;
              state.happiness = Math.min(100, (state.happiness || 50) + 8);
            }
          },
          {
            text: '🏗️ Fundament fortsetzen (Ruinen zuschütten)',
            effect: 'Gebäudebau schneller fertig, aber Schatz verloren',
            fn: (state) => {
              // Bauprojekte könnten hier beschleunigt werden
              const building = (state.buildings || []).find(b => b.underConstruction);
              if (building && building.constructionEndsAt) {
                building.constructionEndsAt = Math.max(Date.now(), building.constructionEndsAt - 60000);
              }
            }
          }
        ]
      },
      {
        id: 'strange_pilgrim',
        title: '🧙 Ein seltsamer Wanderer',
        desc: 'Ein alter, geheimnisvoller Mann mit verwittertem Mantel erscheint am Burgtor. Er behauptet, ein Weiser zu sein, der Prophezeiungen kennt.',
        type: 'random',
        options: [
          {
            text: '🏠 Ihm Unterschlupf gewähren',
            effect: '+1 Helden-XP für 10 Minuten, unbekannte Wirkung',
            fn: (state) => {
              state.happiness = Math.min(100, (state.happiness || 50) + 3);
              if (state.hero) {
                state.hero.xp = (state.hero.xp || 0) + 50;
              }
            }
          },
          {
            text: '💰 Ihn für eine Prophezeiung bezahlen (-100 Gold)',
            effect: 'Prophezeiung enthüllt nächste Bedrohung (Vorwarnung)',
            fn: (state) => {
              state.resources.gold = Math.max(0, (state.resources.gold || 0) - 100);
              state.nextThreatWarned = true;
            }
          },
          {
            text: '❌ Abweisen',
            effect: 'Nichts passiert',
            fn: (state) => {}
          }
        ]
      },

      // ============================================================
      // NEUE EVENTS – JAHRESZEITEN-SPEZIFISCH
      // ============================================================
      {
        id: 'harvest_festival',
        title: '🌾 Erntefest der Bauern',
        desc: 'Die Ernte war reich in diesem Jahr! Die Dorfbewohner bitten darum, ein Fest feiern zu dürfen.',
        type: 'seasonal_autumn',
        options: [
          {
            text: '🎉 Großes Fest ausrichten (-200 Gold)',
            effect: '+25 Zufriedenheit für 5 Minuten, +100 Nahrung',
            fn: (state) => {
              state.resources.gold = Math.max(0, (state.resources.gold || 0) - 200);
              state.resources.food = (state.resources.food || 0) + 100;
              state.happiness = Math.min(100, (state.happiness || 50) + 25);
            }
          },
          {
            text: '🧀 Kleines Dorffest erlauben (kostenlos)',
            effect: '+10 Zufriedenheit',
            fn: (state) => {
              state.happiness = Math.min(100, (state.happiness || 50) + 10);
            }
          }
        ]
      },
      {
        id: 'winter_wolves',
        title: '🐺 Wölfe im harten Winter',
        desc: 'Eine ausgehungerte Wolfmeute greift Bauern an und plündert Vorräte. Die Dorfbewohner flüchten hinter die Burgmauern.',
        type: 'seasonal_winter',
        options: [
          {
            text: '🏹 Jäger entsenden (-50 Gold)',
            effect: 'Wölfe verjagt, +5 Nahrung (Beute)',
            fn: (state) => {
              state.resources.gold = Math.max(0, (state.resources.gold || 0) - 50);
              state.resources.food = (state.resources.food || 0) + 5;
            }
          },
          {
            text: '🏰 Bauern hinter den Mauern schützen',
            effect: '+10 Zufriedenheit (sicher fühlen), -20 Nahrung (mehr Münder)',
            fn: (state) => {
              state.happiness = Math.min(100, (state.happiness || 50) + 10);
              state.resources.food = Math.max(0, (state.resources.food || 0) - 20);
            }
          }
        ]
      },

      // ============================================================
      // NEUE EVENTS – DIPLOMATIE & KRISENSITUATIONEN
      // ============================================================
      {
        id: 'war_declaration',
        title: '⚔️ Kriegserklärung!',
        desc: 'Ein Bote des Nachbarlandes bringt einen roten Brief: "Im Namen meines Herrn erkläre ich Euch den Krieg. Ihr habt 3 Tage, um zu kapitulieren!"',
        type: 'random',
        options: [
          {
            text: '⚔️ Krieg annehmen und kämpfen',
            effect: 'Nächster Angriff kommt mit 50% mehr Truppen',
            fn: (state) => {
              if (!state.statistics) state.statistics = {};
              state.statistics.warsAccepted = (state.statistics.warsAccepted || 0) + 1;
              state.happiness = Math.min(100, (state.happiness || 50) + 5); // Patriotismus
            }
          },
          {
            text: '💰 Tribut zahlen und Frieden kaufen (-1000 Gold)',
            effect: 'Frieden für 5 Minuten garantiert',
            fn: (state) => {
              state.resources.gold = Math.max(0, (state.resources.gold || 0) - 1000);
              state.peaceTreaty = { expiresAt: Date.now() + 5 * 60 * 1000 };
            }
          },
          {
            text: '🤝 Sofortigen Diplomaten schicken',
            effect: '-200 Gold, aber Beziehung verbessert sich',
            fn: (state) => {
              state.resources.gold = Math.max(0, (state.resources.gold || 0) - 200);
              if (state.diplomacy) {
                Object.values(state.diplomacy).forEach(d => {
                  if (d.relations !== undefined) d.relations = Math.min(100, d.relations + 10);
                });
              }
            }
          }
        ]
      },
      {
        id: 'noble_visit',
        title: '🏰 Besuch eines fremden Adeligen',
        desc: 'Graf von Steinfels bittet um Audienz. Er bringt Geschenke und sucht nach einem Abkommen zur gegenseitigen Verteidigung.',
        type: 'random',
        options: [
          {
            text: '🤝 Schutzabkommen schließen',
            effect: '+30 Beziehungen mit allen Nationen, +100 Gold Geschenk',
            fn: (state) => {
              state.resources.gold = (state.resources.gold || 0) + 100;
              if (state.diplomacy) {
                Object.values(state.diplomacy).forEach(d => {
                  if (d.relations !== undefined) d.relations = Math.min(100, d.relations + 30);
                });
              }
            }
          },
          {
            text: '❌ Höflich ablehnen',
            effect: 'Keine Veränderung',
            fn: (state) => {}
          }
        ]
      },

      // ============================================================
      // NEUE EVENTS – BEVÖLKERUNG & GESELLSCHAFT
      // ============================================================
      {
        id: 'architect_arrives',
        title: '🏗️ Berühmter Architekt bietet Dienste an',
        desc: 'Meister Konrad, ein legendärer Baumeister, erscheint am Hof. Er bietet seine Dienste für eine einzige Saison an.',
        type: 'random',
        options: [
          {
            text: '💰 Für großes Projekt engagieren (-500 Gold)',
            effect: 'Nächstes Gebäude wird 50% günstiger und schneller gebaut',
            fn: (state) => {
              state.resources.gold = Math.max(0, (state.resources.gold || 0) - 500);
              state.architectBuff = { nextBuildingDiscount: 0.5, expiresAt: Date.now() + 10 * 60 * 1000 };
            }
          },
          {
            text: '🏠 Für einfache Reparaturen (-100 Gold)',
            effect: '+20 Zufriedenheit (schöne Burg)',
            fn: (state) => {
              state.resources.gold = Math.max(0, (state.resources.gold || 0) - 100);
              state.happiness = Math.min(100, (state.happiness || 50) + 20);
            }
          }
        ]
      },
      {
        id: 'thieves_guild',
        title: '🗡️ Die Diebesgilde meldet sich',
        desc: 'Ein Brief im Schatten: Die städtische Diebesgilde bietet "Schutz" an und verlangt monatliche Zahlungen.',
        type: 'random',
        options: [
          {
            text: '💰 Zahlen (-150 Gold/Minute für 5 Min)',
            effect: 'Keine Überfälle für 5 Minuten',
            fn: (state) => {
              state.resources.gold = Math.max(0, (state.resources.gold || 0) - 150);
              state.thiefProtection = { expiresAt: Date.now() + 5 * 60 * 1000 };
            }
          },
          {
            text: '⚔️ Garde ausschicken (Diebesgilde bekämpfen)',
            effect: '-5 Truppen, aber Diebesgilde aufgelöst',
            fn: (state) => {
              const troops = state.troops || {};
              const mainType = Object.keys(troops).find(t => (troops[t] || 0) > 5);
              if (mainType) state.troops[mainType] = Math.max(0, troops[mainType] - 5);
              state.happiness = Math.min(100, (state.happiness || 50) + 15);
            }
          }
        ]
      },
      {
        id: 'tournament',
        title: '🏆 Ritterturnier-Einladung',
        desc: 'Die Königsstadt veranstaltet ein großes Ritterturnier. Die Teilnahme stärkt den Ruf deines Reiches!',
        type: 'random',
        options: [
          {
            text: '⚔️ Besten Ritter entsenden (-200 Gold für Ausrüstung)',
            effect: 'Gewonnen: +300 Gold, +15 Zufriedenheit, +20 Prestige-Punkte',
            fn: (state) => {
              state.resources.gold = Math.max(0, (state.resources.gold || 0) - 200);
              const heroLevel = state.hero?.level || 1;
              const win = Math.random() < (0.4 + heroLevel * 0.05);
              if (win) {
                state.resources.gold = (state.resources.gold || 0) + 300;
                state.happiness = Math.min(100, (state.happiness || 50) + 15);
                if (!state.statistics) state.statistics = {};
                state.statistics.tournamentsWon = (state.statistics.tournamentsWon || 0) + 1;
              } else {
                state.happiness = Math.min(100, (state.happiness || 50) + 5);
              }
            }
          },
          {
            text: '❌ Nicht teilnehmen',
            effect: 'Keine Kosten, keine Boni',
            fn: (state) => {}
          }
        ]
      },
      {
        id: 'alchemist_workshop',
        title: '⚗️ Alchemist eröffnet Werkstatt',
        desc: 'Ein Alchemist bietet an, eine Werkstatt in deiner Burg einzurichten. Er verspricht, Ressourcen umzuwandeln.',
        type: 'random',
        options: [
          {
            text: '💎 Holz in Eisen transmutieren (200 Holz → 50 Eisen)',
            effect: 'Direkte Ressourcentransformation',
            fn: (state) => {
              if ((state.resources.wood || 0) >= 200) {
                state.resources.wood -= 200;
                state.resources.iron = (state.resources.iron || 0) + 50;
              }
            }
          },
          {
            text: '💰 Steine in Gold schmelzen (200 Stein → 150 Gold)',
            effect: 'Stein zu Gold konvertieren',
            fn: (state) => {
              if ((state.resources.stone || 0) >= 200) {
                state.resources.stone -= 200;
                state.resources.gold = (state.resources.gold || 0) + 150;
              }
            }
          }
        ]
      },

      // ============================================================
      // NEUE EVENTS – RELIGION & KULTUR
      // ============================================================
      {
        id: 'monk_blessing',
        title: '⛪ Mönche bitten um Bau einer Kapelle',
        desc: 'Eine Gruppe Mönche möchte eine kleine Kapelle in der Burg errichten. Sie versprechen Segen und Heilung für die Bevölkerung.',
        type: 'random',
        options: [
          {
            text: '✅ Kapelle erlauben (-100 Stein, -100 Holz)',
            effect: '+15 Zufriedenheit dauerhaft, Heilung für verwundete Truppen',
            fn: (state) => {
              state.resources.stone = Math.max(0, (state.resources.stone || 0) - 100);
              state.resources.wood = Math.max(0, (state.resources.wood || 0) - 100);
              state.happiness = Math.min(100, (state.happiness || 50) + 15);
              state.hasChapel = true;
            }
          },
          {
            text: '❌ Ablehnen',
            effect: '-5 Zufriedenheit (Bevölkerung enttäuscht)',
            fn: (state) => {
              state.happiness = Math.max(0, (state.happiness || 50) - 5);
            }
          }
        ]
      }
    ]; // Ende events Array

    // Prüft: Welche Events können jetzt ausgelöst werden?
    this.seasonalEventMap = {
      'autumn': ['harvest_festival'],
      'winter': ['winter_wolves'],
      'spring': [],
      'summer': []
    };
  }

  triggerRandomEvent() {
    // Wähle zufälliges Event aus den 'random' Events
    const randomEvents = this.events.filter(e => e.type === 'random' || !e.type);
    if (randomEvents.length === 0) return;
    const ev = randomEvents[Math.floor(Math.random() * randomEvents.length)];
    this.showEventModal(ev);
  }

  // Versucht einen saisonalen Event auszulösen
  triggerSeasonalEvent(seasonId) {
    const seasonalIds = this.seasonalEventMap[seasonId] || [];
    for (const evId of seasonalIds) {
      if (!this.triggeredEvents.has(`season_${evId}_${seasonId}`)) {
        const ev = this.events.find(e => e.id === evId);
        if (ev) {
          this.triggeredEvents.add(`season_${evId}_${seasonId}`);
          setTimeout(() => this.showEventModal(ev), 3000); // Kurze Verzögerung
          return;
        }
      }
    }
  }

  showEventModal(ev) {
    let content = `
      <div style="padding: 10px; text-align: center;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 6px;">${ev.title}</h2>
        <p style="font-size: 0.95em; color: #ccc; margin-bottom: 20px; text-align: left; font-style: italic;">"${ev.desc}"</p>
        <div style="display: flex; flex-direction: column; gap: 10px; max-width: 500px; margin: 0 auto;">
    `;

    ev.options.forEach((opt, idx) => {
      content += `
        <button onclick="window.storyEventsEngine.makeChoice('${ev.id}', ${idx})"
                style="padding: 12px; background: rgba(30,40,55,0.9); border: 1px solid #d4af37; border-radius: 6px; color: #fff; cursor: pointer; text-align: left; transition: background 0.2s;"
                onmouseover="this.style.background='rgba(60,75,100,0.9)'" onmouseout="this.style.background='rgba(30,40,55,0.9)'">
          <div style="font-weight: bold; color: #ffd700;">${opt.text}</div>
          <div style="font-size: 0.8em; color: #aaa; margin-top: 4px;">⟹ ${opt.effect}</div>
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
    const state = this.stateManager.state;

    try {
      opt.fn(state);
    } catch (err) {
      console.error('Story Event Fehler:', err);
    }

    this.stateManager.save();
    this.gameUI.showFloatingNotification(`📜 Entscheidung: "${opt.text.replace(/^[^\s]+\s/, '')}"`);
    this.gameUI.closeModal();
  }

  // Periodisch aufgerufen aus dem Tick-Loop
  tick() {
    const now = Date.now();
    if (now - this.lastRandomEventTime > this.randomEventInterval) {
      this.lastRandomEventTime = now;
      // 25% Chance das ein Event ausgelöst wird
      if (Math.random() < 0.25) {
        this.triggerRandomEvent();
      }
    }
  }
}

window.StoryEventsEngine = StoryEventsEngine;
