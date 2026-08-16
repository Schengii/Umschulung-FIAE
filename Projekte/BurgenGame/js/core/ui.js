// --- CORE HTML USER INTERFACE ---

class GameUI {
  constructor() {
    this.selectedNpc = null;
    this.selectedBuilding = null;
    this.selectedOutpost = null;
  }

  init() {
    this.createUIElements();
    this.setupListeners();
    this.updateUI();
  }

  addLog(message, type = 'info') {
    const body = document.getElementById('log-panel-body');
    if (!body) return;
    const colors = {
      info: 'var(--color-text-muted)',
      success: '#2ecc71',
      warning: 'var(--color-gold-hover)',
      danger: '#e74c3c'
    };
    const div = document.createElement('div');
    div.style.color = colors[type] || colors.info;
    div.style.borderBottom = '1px solid rgba(255,255,255,0.03)';
    div.style.paddingBottom = '3px';
    div.style.lineHeight = '1.3';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    div.innerHTML = `<span style="opacity:0.4; margin-right:5px; font-family: monospace;">[${time}]</span> ${message}`;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;

    while (body.children.length > 50) {
      body.removeChild(body.firstChild);
    }
  }

  createUIElements() {
    const uiLayer = document.getElementById('ui-layer');
    if (!uiLayer) return;

    uiLayer.innerHTML = `
      <!-- Top Resource HUD -->
      <div id="resource-bar" class="glass-panel" style="flex-wrap: wrap; gap: 8px; justify-content: center;">
        <div class="res-item" title="Jahreszeit" style="background: rgba(212,175,55,0.15); border-color: #d4af37;">
          <span id="res-season-icon">🌱</span>
          <span id="res-season-name" style="font-weight: bold; color: var(--color-gold-hover);">Frühling</span>
        </div>
        <div class="res-item" id="hud-age" title="Zeitalter des Königreichs" style="background: rgba(142,68,173,0.15); border-color: #8e44ad;">
          <span id="res-age-icon">🪵</span>
          <span id="res-age-name" style="font-weight: bold; color: #af7ac5;">Dunkles Zeitalter</span>
        </div>
        <div class="res-item" id="hud-weather" title="Wetter (Klicken für Details)" style="cursor: pointer; background: rgba(52,152,219,0.15); border-color: #3498db;">
          <span id="res-weather-icon">☀️</span>
          <span id="res-weather-name" style="font-weight: bold; color: #3498db;">Sonnig</span>
        </div>
        <div class="res-item" title="Holz (Produktion/Min)">
          <span class="res-icon">🪵</span>
          <span id="res-wood" class="res-val">0</span>
          <span id="res-wood-rate" class="res-rate positive">(+0)</span>
        </div>
        <div class="res-item" title="Stein (Produktion/Min)">
          <span class="res-icon">🪨</span>
          <span id="res-stone" class="res-val">0</span>
          <span id="res-stone-rate" class="res-rate positive">(+0)</span>
        </div>
        <div class="res-item" title="Nahrung (Netto/Min)">
          <span class="res-icon">🌾</span>
          <span id="res-food" class="res-val">0</span>
          <span id="res-food-rate" class="res-rate positive">(+0)</span>
        </div>
        <div class="res-item" title="Brot (Vorrätig)">
          <span class="res-icon">🍞</span>
          <span id="res-bread" class="res-val">0</span>
        </div>
        <div class="res-item" title="Mehl (Vorrätig)">
          <span class="res-icon">🍚</span>
          <span id="res-flour" class="res-val">0</span>
        </div>
        <div class="res-item" title="Bier (Vorrätig)">
          <span class="res-icon">🍺</span>
          <span id="res-beer" class="res-val">0</span>
        </div>
        <div class="res-item" title="Tierhäute (Vorrätig)">
          <span class="res-icon">🐂</span>
          <span id="res-hide" class="res-val">0</span>
        </div>
        <div class="res-item" title="Leder (Vorrätig)">
          <span class="res-icon">💼</span>
          <span id="res-leather" class="res-val">0</span>
        </div>
        <div class="res-item" title="Eisenerz (Vorrätig)">
          <span class="res-icon">⛏️</span>
          <span id="res-iron-ore" class="res-val">0</span>
        </div>
        <div class="res-item" title="Eisen (Produktion/Min)">
          <span class="res-icon">⛓️</span>
          <span id="res-iron" class="res-val">0</span>
          <span id="res-iron-rate" class="res-rate positive">(+0)</span>
        </div>
        <div class="res-item" title="Waffen (Menge)">
          <span class="res-icon">🗡️</span>
          <span id="res-weapons" class="res-val">0</span>
        </div>
        <div class="res-item" title="Gold (Gesamt)">
          <span class="res-icon">🪙</span>
          <span id="res-gold" class="res-val">0</span>
        </div>
        <div class="res-item ruby-item" title="Rubine">
          <span class="res-icon">💎</span>
          <span id="res-rubies" class="res-val">0</span>
        </div>
        <div class="res-item garrison-item" title="Truppenstärke">
          <span class="res-icon">⚔️</span>
          <span id="res-troops" class="res-val">0</span>
        </div>
        <div class="res-item" title="Bevölkerung & Zufriedenheit" id="res-pop-item" style="cursor: pointer;">
          <span class="res-icon">👥</span>
          <span id="res-population" class="res-val">0</span>
          <span id="res-happiness" class="res-rate" style="font-size: 0.7rem;">😊</span>
        </div>
      </div>

      <!-- Quick-Access Top Navigation Bar -->
      <div id="quick-nav-bar" class="glass-panel" style="position: absolute; top: 75px; left: 50%; transform: translateX(-50%); z-index: 12; display: flex; gap: 8px; padding: 6px 14px;">
        <button onclick="window.shipyardManager && window.shipyardManager.showModal()" title="Werft & Seefahrt" class="primary-btn" style="padding: 4px 10px; font-size: 0.8rem;">⚓ Werft</button>
        <button onclick="window.wizardTowerManager && window.wizardTowerManager.showModal()" title="Magieturm & Arkanzauber" class="primary-btn" style="padding: 4px 10px; font-size: 0.8rem;">🧙 Magieturm</button>
        <button onclick="window.royalDecreesManager && window.royalDecreesManager.showModal()" title="Königliche Erlasse" class="primary-btn" style="padding: 4px 10px; font-size: 0.8rem;">📜 Erlasse</button>
        <button onclick="window.pvpLeagueManager && window.pvpLeagueManager.showModal()" title="PvP Turnierliga" class="primary-btn" style="padding: 4px 10px; font-size: 0.8rem;">🏆 Turnierliga</button>
        <button onclick="window.fogOfWarManager && window.fogOfWarManager.showModal()" title="Nebel des Krieges" class="primary-btn" style="padding: 4px 10px; font-size: 0.8rem;">🌫️ Erkundung</button>
        <button onclick="window.storyCampaignManager && window.storyCampaignManager.showModal()" title="Story-Kampagne" class="primary-btn" style="padding: 4px 10px; font-size: 0.8rem;">📖 Story</button>
        <button onclick="window.scenarioEditor && window.scenarioEditor.showModal()" title="Szenario-Editor" class="primary-btn gold-btn" style="padding: 4px 10px; font-size: 0.8rem;">⚒️ Editor</button>
      </div>

      <!-- Defensive Battle Warning Banner -->
      <div id="raid-warning-banner" class="glass-panel hidden" style="position: absolute; top: 90px; left: 50%; transform: translateX(-50%); padding: 12px 25px; border-color: var(--color-red-hover); background: rgba(139, 37, 26, 0.9); font-weight: bold; text-align: center; z-index: 15; color: #fff; text-shadow: 0 0 5px rgba(0,0,0,0.5); box-shadow: 0 0 15px rgba(231, 76, 60, 0.5); font-family: var(--font-header);">
        ⚠️ RAUBRITTER-ANGRIFF IN <span id="raid-countdown-timer">60</span>s!
      </div>

      <!-- Quest panels tracker -->
      <div id="quest-panel" class="glass-panel slide-in-left">
        <h3>Aktuelle Quest</h3>
        <h4 id="quest-title">Keine Quest</h4>
        <p id="quest-desc">Lade...</p>
        <div class="quest-rewards">
          Belohnung: <span id="quest-reward-span"></span>
      </div>

      <!-- Collapsible Log Panel -->
      <div id="log-panel" class="glass-panel" style="position: absolute; bottom: 100px; left: 15px; width: 290px; height: 160px; z-index: 11; display: flex; flex-direction: column; overflow: hidden; transition: height 0.3s ease;">
        <div id="log-panel-header" style="background: rgba(0,0,0,0.35); padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; border-bottom: 1px solid rgba(212,175,55,0.15); pointer-events: auto;">
          <span style="font-family: var(--font-header); font-size: 0.82rem; color: var(--color-gold-hover); font-weight: bold; letter-spacing: 0.5px;">📜 EREIGNIS-LOG</span>
          <span id="log-panel-toggle" style="font-size: 0.7rem; color: var(--color-text-muted);">▲ Minimiere</span>
        </div>
        <div id="log-panel-body" style="flex-grow: 1; padding: 8px 12px; font-size: 0.72rem; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; color: var(--color-text-muted); pointer-events: auto;">
          <div>Willkommen im Königreich! Baue deine Burg auf.</div>
        </div>
      </div>

      <!-- Sidebar View Selectors -->
      <div id="sidebar" class="glass-panel">
        <button id="btn-view-castle" class="sidebar-btn active" title="Burg-Ansicht">🏰 Burg</button>
        <button id="btn-view-map" class="sidebar-btn" title="Weltkarte">🗺️ Karte</button>
      </div>

      <!-- Clickable Castle Minimap -->
      <div id="minimap-panel" class="glass-panel" style="position: absolute; bottom: 100px; right: 15px; width: 140px; height: 140px; z-index: 11; display: flex; flex-direction: column; overflow: hidden; pointer-events: auto; padding: 5px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); cursor: crosshair;">
        <canvas id="minimap-canvas" width="130" height="130" style="display: block; width: 100%; height: 100%; background: #0f1015; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05);"></canvas>
      </div>

      <!-- Actions Buttons -->
      <div id="bottom-menu" class="glass-panel" style="flex-wrap: wrap;">
        <button id="btn-menu-campaign" class="menu-btn" title="Story-Kampagne">📜 Story</button>
        <button id="btn-menu-build" class="menu-btn" title="Gebäude errichten">🔨 Bauen</button>
        <button id="btn-menu-recruit" class="menu-btn" title="Soldaten ausbilden">⚔️ Kaserne</button>
        <button id="btn-menu-tax" class="menu-btn" title="Steuern eintreiben">🪙 Steuern</button>
        <button id="btn-menu-population" class="menu-btn" title="Bevölkerung & Zufriedenheit">👥 Volk</button>
        <button id="btn-menu-diplomacy" class="menu-btn" title="Diplomatie">🤝 Diplomatie</button>
        <button id="btn-menu-techtree" class="menu-btn" title="Visual Forschungsbaum 2.0">📜 Techtree</button>
        <button id="btn-menu-worldmap" class="menu-btn" title="Interaktive Weltkarte 2.0">🗺️ Nebelkarte</button>
        <button id="btn-menu-colonies" class="menu-btn" title="Zweitburgen & Biome">🏰 Zweitburg</button>
        <button id="btn-menu-pvp" class="menu-btn" title="Asynchroner PvP Modus">⚔️ PvP Duell</button>
        <button id="btn-menu-guildwonders" class="menu-btn" title="Allianzwunder & Gilden">🏛️ Gildenwunder</button>
        <button id="btn-menu-transmutator" class="menu-btn" title="Relikt-Transmutator & Schmelze">🔮 Schmelze</button>
        <button id="btn-menu-dynasty" class="menu-btn" title="Dynastie & Thronfolge">👑 Dynastie</button>
        <button id="btn-menu-disaster" class="menu-btn" title="Katastrophen-Schutz">🚒 Schutz</button>
        <button id="btn-menu-fleet" class="menu-btn" title="Handelsflotte & Werft">🚢 Flotte</button>
        <button id="btn-menu-dragons" class="menu-btn" title="Drachennest & Reittiere">🐉 Drachen</button>
        <button id="btn-menu-throneroom" class="menu-btn" title="Thronsaal-Dekorateur">🏛️ Thronsaal</button>
        <button id="btn-menu-artillery" class="menu-btn" title="Belagerungs-Artillerie & Tribok">☄️ Tribok</button>
        <button id="btn-menu-story" class="menu-btn" title="Reichsereignisse & Story">📜 Reichsstory</button>
        <button id="btn-menu-jousting" class="menu-btn" title="Ritterturnier & Lanzenstechen">🏇 Turnier</button>
        <button id="btn-menu-settings" class="menu-btn" title="Einstellungen">⚙️ Einstellungen</button>
      </div>

      <!-- Popup notifications -->
      <div id="notification-area"></div>

      <!-- Quick Settings / Controls Bar -->
      <div id="settings-dropdown-wrapper" style="position: absolute; top: 15px; right: 15px; z-index: 100; display: inline-block;">
        <button id="btn-settings-toggle" class="control-btn" style="padding: 8px 12px; font-size: 0.85rem; font-weight: bold; background: rgba(25, 26, 33, 0.9); border: 1px solid rgba(212, 175, 55, 0.3);">⚙️ Einstellungen ▾</button>
        <div id="quick-controls" class="glass-panel hidden" style="position: absolute; top: calc(100% + 5px); right: 0; display: flex; flex-direction: column; gap: 6px; padding: 8px; min-width: 160px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
          <button id="control-theme" class="control-btn" title="Theme wechseln">🌓 Theme</button>
          <button id="control-lang" class="control-btn" title="Sprache ändern">🌐 DE</button>
          <button id="control-sound" class="control-btn" title="Sound ein/aus">🔊 Sound</button>
          <button id="control-achievements" class="control-btn" title="Erfolge">🏆 Erfolge</button>
          <button id="control-ai" class="control-btn" title="AI Bot">🤖 AI (An)</button>
          <button id="control-ai-attack" class="control-btn" title="KI-Angriffe automatisch erlauben">⚔️ Auto-Angriff (Aus)</button>
          <button id="control-night" class="control-btn" title="Tag/Nacht-Zyklus">🌙 Nacht (An)</button>
          <button id="control-leaderboard" class="control-btn" title="Bestenliste">📊 Bestenliste</button>
          <button id="control-stats" class="control-btn" title="Statistik-Dashboard">📈 Statistiken</button>
          <button id="control-prestige" class="control-btn" title="Prestige">🌟 Prestige</button>
          <button id="control-mods" class="control-btn" title="Mods & Plugins">🧩 Modding</button>
          <button id="control-chat" class="control-btn" title="Weltchat & Server Sync">💬 Weltchat</button>
          <button id="control-dynasty" class="control-btn" title="Königsfamilie & Stammbaum">👑 Stammbaum</button>
          <button id="control-3d" class="control-btn" title="3D WebGL Umschalten">🎲 3D-Ansicht</button>
          <button id="control-disasters" class="control-btn" title="Katastrophenschutz">⚡ Katastrophen</button>
          <button id="control-tournament" class="control-btn" title="Lanzen-Turnier">⚔️ Turnier-Arena</button>
          <button id="control-guild" class="control-btn" title="Gilden & Kriege">🛡️ Gilden-System</button>
          <button id="control-mapeditor" class="control-btn" title="Karten-Editor">🗺️ Karten-Editor</button>
          <button id="control-stocks" class="control-btn" title="Rohstoff-Börse & Aktien">📈 Rohstoff-Börse</button>
        </div>
      </div>

      <!-- Dynamic Modals Container -->
      <div id="modal-container" class="hidden">
        <div id="modal-content" class="glass-panel scale-up">
          <button id="modal-close" class="modal-close-btn">&times;</button>
          <div id="modal-body"></div>
        </div>
      </div>
    `;
  }

  setupListeners() {
    document.getElementById('btn-view-castle').addEventListener('click', () => this.toggleView(VIEWS.CASTLE));
    document.getElementById('btn-view-map').addEventListener('click', () => this.toggleView(VIEWS.WORLD_MAP));

    document.getElementById('btn-menu-campaign').addEventListener('click', () => {
      if (this.openCampaignModal) this.openCampaignModal();
    });
    document.getElementById('btn-menu-build').addEventListener('click', () => this.openBuildModal());
    document.getElementById('btn-menu-recruit').addEventListener('click', () => this.openRecruitModal());
    document.getElementById('btn-menu-tax').addEventListener('click', () => this.openTaxModal());
    document.getElementById('btn-menu-settings').addEventListener('click', () => this.openSettingsModal());
    document.getElementById('btn-menu-population').addEventListener('click', () => {
      if (this.openPopulationModal) this.openPopulationModal();
    });
    document.getElementById('btn-menu-diplomacy').addEventListener('click', () => {
      if (this.openDiplomacyModal) this.openDiplomacyModal();
    });
    const btnTechtree = document.getElementById('btn-menu-techtree');
    if (btnTechtree) btnTechtree.addEventListener('click', () => window.visualTechTree && window.visualTechTree.showModal());

    const btnWorldmap = document.getElementById('btn-menu-worldmap');
    if (btnWorldmap) btnWorldmap.addEventListener('click', () => window.interactiveWorldMap && window.interactiveWorldMap.showModal());

    const btnColonies = document.getElementById('btn-menu-colonies');
    if (btnColonies) btnColonies.addEventListener('click', () => window.secondaryCastles && window.secondaryCastles.showModal());

    const btnPvp = document.getElementById('btn-menu-pvp');
    if (btnPvp) btnPvp.addEventListener('click', () => window.asyncPvP && window.asyncPvP.showModal());

    const btnGuildwonders = document.getElementById('btn-menu-guildwonders');
    if (btnGuildwonders) btnGuildwonders.addEventListener('click', () => window.guildWonders && window.guildWonders.showModal());

    const btnTransmutator = document.getElementById('btn-menu-transmutator');
    if (btnTransmutator) btnTransmutator.addEventListener('click', () => window.heroTransmutator && window.heroTransmutator.showModal());

    const btnDynasty = document.getElementById('btn-menu-dynasty');
    if (btnDynasty) btnDynasty.addEventListener('click', () => window.dynastyManager && window.dynastyManager.showModal());

    const btnDisaster = document.getElementById('btn-menu-disaster');
    if (btnDisaster) btnDisaster.addEventListener('click', () => window.disasterMitigation && window.disasterMitigation.showModal());

    const btnFleet = document.getElementById('btn-menu-fleet');
    if (btnFleet) btnFleet.addEventListener('click', () => window.tradeFleetManager && window.tradeFleetManager.showModal());

    const btnDragons = document.getElementById('btn-menu-dragons');
    if (btnDragons) btnDragons.addEventListener('click', () => window.dragonMountsManager && window.dragonMountsManager.showModal());

    const btnThroneroom = document.getElementById('btn-menu-throneroom');
    if (btnThroneroom) btnThroneroom.addEventListener('click', () => window.throneroomDecorator && window.throneroomDecorator.showModal());

    const btnArtillery = document.getElementById('btn-menu-artillery');
    if (btnArtillery) btnArtillery.addEventListener('click', () => window.siegeArtilleryManager && window.siegeArtilleryManager.showModal());

    const btnStory = document.getElementById('btn-menu-story');
    if (btnStory) btnStory.addEventListener('click', () => window.storyEventsEngine && window.storyEventsEngine.triggerRandomEvent());

    const btnJousting = document.getElementById('btn-menu-jousting');
    if (btnJousting) btnJousting.addEventListener('click', () => window.joustingArena && window.joustingArena.showModal());

    // Population HUD click
    const popItem = document.getElementById('res-pop-item');
    if (popItem) {
      popItem.addEventListener('click', () => {
        if (this.openPopulationModal) this.openPopulationModal();
      });
    }

    // Weather HUD click
    const weatherHudItem = document.getElementById('hud-weather');
    if (weatherHudItem) {
      weatherHudItem.addEventListener('click', () => {
        this.openWeatherModal();
      });
    }

    // Collapsible Log Panel Toggle
    const logHeader = document.getElementById('log-panel-header');
    const logPanel = document.getElementById('log-panel');
    const logToggle = document.getElementById('log-panel-toggle');
    if (logHeader && logPanel && logToggle) {
      let collapsed = false;
      logHeader.addEventListener('click', () => {
        collapsed = !collapsed;
        if (collapsed) {
          logPanel.style.height = '35px';
          logToggle.textContent = '▼ Maximiere';
        } else {
          logPanel.style.height = '160px';
          logToggle.textContent = '▲ Minimiere';
        }
      });
    }

    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('modal-container').addEventListener('click', (e) => {
      if (e.target.id === 'modal-container') this.closeModal();
    });

    // Settings Dropdown Toggler
    const toggleBtn = document.getElementById('btn-settings-toggle');
    const dropdownPanel = document.getElementById('quick-controls');
    if (toggleBtn && dropdownPanel) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownPanel.classList.toggle('hidden');
      });
      document.addEventListener('click', (e) => {
        if (!dropdownPanel.contains(e.target) && e.target !== toggleBtn) {
          dropdownPanel.classList.add('hidden');
        }
      });
    }

    // Theme Toggle
    const themeCtrl = document.getElementById('control-theme');
    if (themeCtrl) {
      themeCtrl.addEventListener('click', () => {
        if (window.ThemeManager) {
          window.ThemeManager.toggle();
        }
      });
    }

    // Language Toggle
    const langCtrl = document.getElementById('control-lang');
    if (langCtrl) {
      const updateLangBtn = () => {
        if (window.i18n) {
          langCtrl.innerText = window.i18n.lang === 'de' ? '🌐 DE' : '🌐 EN';
        }
      };
      // Short timeout to let i18n load if needed
      setTimeout(updateLangBtn, 100);
      langCtrl.addEventListener('click', () => {
        if (window.i18n) {
          const newLang = window.i18n.lang === 'de' ? 'en' : 'de';
          window.i18n.setLang(newLang);
          langCtrl.innerText = newLang === 'de' ? '🌐 DE' : '🌐 EN';
        }
      });
    }

    // Sound Toggle
    const soundCtrl = document.getElementById('control-sound');
    if (soundCtrl) {
      const updateSoundBtn = () => {
        const enabled = window.gameSound ? window.gameSound.musicEnabled : true;
        soundCtrl.innerText = enabled ? '🔊 Sound' : '🔇 Mute';
      };
      setTimeout(updateSoundBtn, 100);
      soundCtrl.addEventListener('click', () => {
        if (window.gameSound) {
          const enabled = !window.gameSound.musicEnabled;
          window.gameSound.setMusicEnabled(enabled);
          window.gameSound.setSfxEnabled(enabled);
          updateSoundBtn();
        }
      });
    }

    // Achievements Toggle
    const achCtrl = document.getElementById('control-achievements');
    if (achCtrl) {
      achCtrl.addEventListener('click', () => {
        if (window.GameAchievements) {
          window.GameAchievements.open();
        }
      });
    }

    // AI Bot Toggle
    const aiCtrl = document.getElementById('control-ai');
    if (aiCtrl) {
      const updateAIBtn = () => {
        const enabled = window.AIBot ? window.AIBot.enabled : false;
        aiCtrl.innerText = enabled ? '🤖 AI (An)' : '🤖 AI (Aus)';
      };
      setTimeout(updateAIBtn, 100);
      aiCtrl.addEventListener('click', () => {
        if (window.AIBot) {
          if (window.AIBot.enabled) {
            window.AIBot.stop();
            window.AIBot.enabled = false;
          } else {
            window.AIBot.start();
            window.AIBot.enabled = true;
          }
          updateAIBtn();
        }
      });
    }

    // AI Auto-Attack Toggle
    const aiAttackCtrl = document.getElementById('control-ai-attack');
    if (aiAttackCtrl) {
      const updateAIAttackBtn = () => {
        const auto = window.AIBot ? window.AIBot.autoAttack : false;
        aiAttackCtrl.innerText = auto ? '⚔️ Auto-Angriff (An)' : '⚔️ Auto-Angriff (Aus)';
      };
      setTimeout(updateAIAttackBtn, 100);
      aiAttackCtrl.addEventListener('click', () => {
        if (window.AIBot) {
          window.AIBot.autoAttack = !window.AIBot.autoAttack;
          localStorage.setItem('empire_ai_auto_attack', window.AIBot.autoAttack);
          updateAIAttackBtn();
        }
      });
    }

    // Night Cycle Toggle
    const nightCtrl = document.getElementById('control-night');
    if (nightCtrl) {
      const updateNightBtn = () => {
        const enabled = window.NightCycle ? window.NightCycle.enabled : true;
        nightCtrl.innerText = enabled ? '🌙 Nacht (An)' : '☀️ Nacht (Aus)';
      };
      setTimeout(updateNightBtn, 100);
      nightCtrl.addEventListener('click', () => {
        if (window.NightCycle) {
          window.NightCycle.toggle();
          updateNightBtn();
        }
      });
    }

    // Leaderboard Toggle
    const lbCtrl = document.getElementById('control-leaderboard');
    if (lbCtrl) {
      lbCtrl.addEventListener('click', () => {
        if (window.Leaderboard) {
          window.Leaderboard.open();
        }
      });
    }

    // Statistics Dashboard
    const statsCtrl = document.getElementById('control-stats');
    if (statsCtrl) {
      statsCtrl.addEventListener('click', () => {
        if (this.openStatsDashboardModal) this.openStatsDashboardModal();
      });
    }

    // Mod Manager Modal
    const modsCtrl = document.getElementById('control-mods');
    if (modsCtrl) {
      modsCtrl.addEventListener('click', () => {
        if (window.modManager) window.modManager.showModManagerModal();
      });
    }

    // Global Chat & Server Sync Modal
    const chatCtrl = document.getElementById('control-chat');
    if (chatCtrl) {
      chatCtrl.addEventListener('click', () => {
        if (window.onlineMultiplayer) window.onlineMultiplayer.showChatModal();
      });
    }

    // Dynasty Tree Modal
    const dynastyCtrl = document.getElementById('control-dynasty');
    if (dynastyCtrl) {
      dynastyCtrl.addEventListener('click', () => {
        if (window.dynastyTree) window.dynastyTree.showModal();
      });
    }

    // 3D WebGL Toggle
    const threeCtrl = document.getElementById('control-3d');
    if (threeCtrl) {
      threeCtrl.addEventListener('click', () => {
        if (window.threeRender) window.threeRender.toggleMode();
      });
    }

    // Advanced Disasters Modal
    const disasterCtrl = document.getElementById('control-disasters');
    if (disasterCtrl) {
      disasterCtrl.addEventListener('click', () => {
        if (window.advancedDisasters) window.advancedDisasters.showDisasterModal();
      });
    }

    // Tournament Arena Modal
    const tourneyCtrl = document.getElementById('control-tournament');
    if (tourneyCtrl) {
      tourneyCtrl.addEventListener('click', () => {
        if (window.tournamentArena) window.tournamentArena.showArenaModal();
      });
    }

    // Guild Wars Modal
    const guildCtrl = document.getElementById('control-guild');
    if (guildCtrl) {
      guildCtrl.addEventListener('click', () => {
        if (window.guildWars) window.guildWars.showGuildModal();
      });
    }

    // Visual Map Editor Modal
    const editorCtrl = document.getElementById('control-mapeditor');
    if (editorCtrl) {
      editorCtrl.addEventListener('click', () => {
        if (window.mapEditor) window.mapEditor.showEditorModal();
      });
    }

    // Stock Market Modal
    const stockCtrl = document.getElementById('control-stocks');
    if (stockCtrl) {
      stockCtrl.addEventListener('click', () => {
        if (window.stockMarket) window.stockMarket.showStockModal();
      });
    }

    // Prestige
    const prestigeCtrl = document.getElementById('control-prestige');
    if (prestigeCtrl) {
      prestigeCtrl.addEventListener('click', () => {
        if (this.openPrestigeModal) this.openPrestigeModal();
      });
    }

    window.addEventListener('building-selected', (e) => {
      this.selectedBuilding = e.detail;
      if (this.selectedBuilding) {
        this.openBuildingUpgradeModal(this.selectedBuilding);
      }
    });

    window.addEventListener('npc-selected', (e) => {
      this.selectedNpc = e.detail;
      if (this.selectedNpc) {
        this.openAttackModal(this.selectedNpc);
      }
    });

    window.addEventListener('outpost-selected', (e) => {
      this.selectedOutpost = e.detail;
      if (this.selectedOutpost) {
        this.openOutpostModal(this.selectedOutpost);
      }
    });

    stateManager.addListener((state, changeType) => {
      this.updateUI(changeType);

      // Log important events to Collapsible Log Panel
      if (changeType === 'taxes_collected') {
        this.addLog('Steuereinnahmen eingetrieben. Gold erhalten! 🪙', 'success');
      } else if (changeType === 'quest_complete') {
        this.addLog(`Quest abgeschlossen! Belohnung erhalten. ✨`, 'success');
      } else if (changeType === 'daily_quest_completed') {
        this.addLog(`Tägliche Quest abgeschlossen! ⭐`, 'success');
      } else if (changeType === 'build_started') {
        this.addLog(`Bau eines neuen Gebäudes begonnen. 🔨`, 'info');
      } else if (changeType === 'upgrade_started') {
        this.addLog(`Gebäude-Upgrade gestartet. 🔺`, 'info');
      } else if (changeType === 'construction_complete') {
        this.addLog(`Bauarbeiten fertiggestellt! 🎉`, 'success');
      } else if (changeType === 'recruitment_complete') {
        this.addLog(`Ausbildung von Rekruten abgeschlossen. ⚔️`, 'success');
      } else if (changeType === 'attack_dispatched') {
        this.addLog(`Angriffsarmee auf den Weg geschickt! 🏹`, 'warning');
      } else if (changeType === 'spy_dispatched') {
        this.addLog(`Spion ausgesendet, um feindliche Stärken aufzuspüren. 👤`, 'info');
      } else if (changeType === 'hero_gem_socketed') {
        this.addLog(`Edelstein erfolgreich in Ausrüstung gesockelt. 💎`, 'success');
      } else if (changeType === 'hero_levelled') {
        this.addLog(`Dein Held hat ein neues Level erreicht! (+1 Talentpunkt) 👑`, 'success');
      } else if (changeType === 'achievement_unlocked') {
        this.addLog(`🏆 Neuer Erfolg freigeschaltet!`, 'warning');
      }
      
      // Dynamic Sound Effects Triggering
      if (changeType === 'taxes_collected') {
        gameSound.playSFX('coin');
      } else if (changeType === 'quest_complete' || changeType === 'daily_quest_completed' || changeType === 'dungeon_complete' || changeType === 'hero_levelled') {
        gameSound.playSFX('quest');
      } else if (changeType === 'build_started' || changeType === 'upgrade_started' || changeType === 'construction_complete' || changeType === 'outpost_construction_complete') {
        gameSound.playSFX('build');
      } else if (changeType === 'recruitment_started') {
        gameSound.playSFX('click');
      } else if (changeType === 'recruitment_complete') {
        gameSound.playSFX('recruit');
      } else if (changeType === 'attack_dispatched' || changeType === 'spy_dispatched' || changeType === 'defense_countdown_started' || changeType === 'outpost_defense_countdown_started') {
        gameSound.playSFX('battle');
      } else if (changeType === 'hero_skill_learned') {
        gameSound.playSFX('coin');
      }
      
      if (changeType === 'battle_resolved' && state.latestBattleResolved) {
        const report = state.latestBattleResolved;
        state.latestBattleResolved = null;
        this.openVisualBattleModal(report);
      }

      if (changeType === 'random_event_triggered' && state.activeEvent) {
        this.openRandomEventModal(state.activeEvent);
      }

      if (changeType === 'mission_returned' && state.latestUnreadReport) {
        const report = state.latestUnreadReport;
        state.latestUnreadReport = null;
        this.openBattleReportModal(report);
      }

      if (changeType === 'quest_complete' && state.latestQuestRewardClaimed) {
        const claim = state.latestQuestRewardClaimed;
        state.latestQuestRewardClaimed = null;
        this.showQuestRewardNotification(claim);
      }

      if (changeType === 'defense_resolved' && state.latestUnreadReport) {
        const report = state.latestUnreadReport;
        state.latestUnreadReport = null;
        this.openVisualBattleModal(report);
      }

      if (changeType === 'dungeon_complete' && state.latestDungeonReport) {
        const report = state.latestDungeonReport;
        state.latestDungeonReport = null;
        this.openDungeonReportModal(report);
      }

      if (changeType === 'daily_quest_completed') {
        this.showFloatingNotification('Tägliche Aufgabe abgeschlossen!');
      }

      if (changeType === 'defense_countdown_started') {
        this.showFloatingNotification('⚠️ Warnung! Ein Raubritter-Überfall steht bevor!');
      }

      if (changeType === 'outpost_defense_countdown_started') {
        this.showFloatingNotification('⚠️ Warnung! Ein Außenposten wird von Raubrittern angegriffen!');
      }

      if (changeType === 'season_changed') {
        const season = stateManager.getCurrentSeason();
        const seasonIcons = { spring: '🌱', summer: '☀️', autumn: '🍂', winter: '❄️' };
        this.showFloatingNotification(`${seasonIcons[season.id] || '🌱'} Jahreszeit wechselt zu: ${season.name}!`);
      }

      if (changeType === 'diplomatic_request' && state.pendingDiplomaticRequest) {
        const req = state.pendingDiplomaticRequest;
        if (Date.now() < req.expiresAt) {
          setTimeout(() => {
            if (this.openDiplomaticRequestModal) this.openDiplomaticRequestModal(req);
          }, 500);
        }
      }

      if (changeType === 'trade_offer_received' && state.activeTradeOffer) {
        this.openTradeOfferModal(state.activeTradeOffer);
      }
    });

    // Play sound on button click
    window.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
        gameSound.playSFX('click');
      }
    });
  }

  toggleView(view) {
    gameCanvas.setView(view);
    document.getElementById('btn-view-castle').classList.toggle('active', view === VIEWS.CASTLE);
    document.getElementById('btn-view-map').classList.toggle('active', view === VIEWS.WORLD_MAP);
    
    const isCastle = view === VIEWS.CASTLE;
    document.getElementById('btn-menu-build').style.display = isCastle ? 'block' : 'none';
    document.getElementById('btn-menu-recruit').style.display = isCastle ? 'block' : 'none';
    
    if (window.gameSound) {
      gameSound.setTheme(isCastle ? 'castle' : 'world_map');
    }

    this.closeModal();
  }

  closeModal() {
    document.getElementById('modal-container').classList.add('hidden');
    if (this.selectedBuilding) {
      this.selectedBuilding = null;
      gameCanvas.selectedBuildingId = null;
    }
    this.selectedNpc = null;
    this.selectedOutpost = null;
  }

  openModal(htmlContent) {
    const body = document.getElementById('modal-body');
    body.innerHTML = htmlContent;
    document.getElementById('modal-container').classList.remove('hidden');
  }

  updateUI(changeType) {
    if (!stateManager.state) return;
    const state = stateManager.state;

    // Seasons HUD update
    const currentSeason = stateManager.getCurrentSeason();
    const seasonIcons = { spring: '🌱', summer: '☀️', autumn: '🍂', winter: '❄️' };
    document.getElementById('res-season-icon').innerText = seasonIcons[currentSeason.id] || '🌱';
    document.getElementById('res-season-name').innerText = currentSeason.name;

    // Age HUD update
    const currentAge = AGES_CONFIG[state.ageIndex || 0];
    const ageIconEl = document.getElementById('res-age-icon');
    const ageNameEl = document.getElementById('res-age-name');
    if (ageIconEl && currentAge) ageIconEl.innerText = currentAge.icon;
    if (ageNameEl && currentAge) ageNameEl.innerText = currentAge.name;

    // Weather HUD update
    const weather = state.weather || { type: 'sunny', timeRemaining: 30 };
    const weatherIcons = { sunny: '☀️', rainy: '🌧️', stormy: '⛈️', snowy: '❄️' };
    const weatherNames = { sunny: 'Sonnig', rainy: 'Regnerisch', stormy: 'Stürmisch', snowy: 'Schneefall' };
    const weatherColors = { sunny: '#f1c40f', rainy: '#3498db', stormy: '#9b59b6', snowy: '#ecf0f1' };
    
    const weatherIconEl = document.getElementById('res-weather-icon');
    const weatherNameEl = document.getElementById('res-weather-name');
    const weatherHud = document.getElementById('hud-weather');
    
    if (weatherIconEl) weatherIconEl.innerText = weatherIcons[weather.type] || '☀️';
    if (weatherNameEl) {
      weatherNameEl.innerText = weatherNames[weather.type] || 'Sonnig';
      weatherNameEl.style.color = weatherColors[weather.type] || '#3498db';
    }
    if (weatherHud) {
      weatherHud.style.borderColor = weatherColors[weather.type] || '#3498db';
      weatherHud.style.background = `rgba(${weather.type === 'sunny' ? '241,196,15' : weather.type === 'rainy' ? '52,152,219' : weather.type === 'stormy' ? '155,89,182' : '236,240,241'}, 0.15)`;
    }

    document.getElementById('res-wood').innerText = Math.floor(state.resources.wood);
    document.getElementById('res-stone').innerText = Math.floor(state.resources.stone);
    document.getElementById('res-food').innerText = Math.floor(state.resources.food);
    document.getElementById('res-bread').innerText = Math.floor(state.resources.bread || 0);
    document.getElementById('res-flour').innerText = Math.floor(state.resources.flour || 0);
    document.getElementById('res-beer').innerText = Math.floor(state.resources.beer || 0);
    document.getElementById('res-hide').innerText = Math.floor(state.resources.hide || 0);
    document.getElementById('res-leather').innerText = Math.floor(state.resources.leather || 0);
    document.getElementById('res-iron-ore').innerText = Math.floor(state.resources.iron_ore || 0);
    document.getElementById('res-iron').innerText = Math.floor(state.resources.iron || 0);
    document.getElementById('res-weapons').innerText = Math.floor(state.resources.weapons || 0);
    document.getElementById('res-gold').innerText = Math.floor(state.resources.gold);
    document.getElementById('res-rubies').innerText = Math.floor(state.resources.rubies);
    
    const totalGarrison = Object.values(state.troops).reduce((a, b) => a + b, 0);
    document.getElementById('res-troops').innerText = totalGarrison;

    // Bevölkerung und Zufriedenheit
    const popEl = document.getElementById('res-population');
    const happinessEl = document.getElementById('res-happiness');
    if (popEl && happinessEl) {
      const pop = Math.floor(state.population || 0);
      const cap = stateManager.getPopulationCap ? stateManager.getPopulationCap() : 20;
      const happiness = state.happiness || 50;
      popEl.innerText = `${pop}/${cap}`;
      happinessEl.innerText = happiness >= 70 ? '😊' : happiness >= 40 ? '😐' : '😡';
      happinessEl.title = `Zufriedenheit: ${happiness}%`;
    }
    let woodRate = 0;
    let stoneRate = 0;
    let foodRate = 0;
    let ironRate = 0;
    let hasFountain = state.buildings.some(b => b.type === BUILDING_TYPES.FOUNTAIN && !b.underConstruction);
    
    let woodMult = 1.0;
    let stoneMult = 1.0;
    let foodMult = 1.0;
    let ironMult = 1.0;
    if (state.research) {
      if (state.research.forestry) woodMult += 0.15;
      if (state.research.masonry) stoneMult += 0.15;
      if (state.research.crop_rotation) foodMult += 0.15;
      if (state.research.iron_smelting) ironMult += 0.15;
    }

    if (state.hero && state.hero.type === 'treasurer') {
      const heroBonus = 0.15 + (state.hero.level - 1) * 0.05;
      woodMult += heroBonus;
      stoneMult += heroBonus;
      foodMult += heroBonus;
      ironMult += heroBonus;
    }

    // Apply Hero Equipment accessory production bonus
    const heroEquipProdBonus = stateManager.getHeroItemBonus('production');
    woodMult += heroEquipProdBonus;
    stoneMult += heroEquipProdBonus;
    foodMult += heroEquipProdBonus;
    ironMult += heroEquipProdBonus;

    // Apply Seasons Multipliers
    const seasonWoodMult = stateManager.getSeasonMultiplier('wood');
    const seasonStoneMult = stateManager.getSeasonMultiplier('stone');
    const seasonFoodMult = stateManager.getSeasonMultiplier('food');

    woodMult *= seasonWoodMult;
    stoneMult *= seasonStoneMult;
    foodMult *= seasonFoodMult;

    const isStriking = state.happiness < 30;
    const mult = isStriking ? 0 : (hasFountain ? 1.10 : 1.0);

    state.buildings.forEach(b => {
      if (b.underConstruction) return;
      const cfg = BUILDINGS_CONFIG[b.type]?.levels[b.level];
      if (!cfg?.production) return;
      if (cfg.production.wood) woodRate += cfg.production.wood;
      if (cfg.production.stone) stoneRate += cfg.production.stone;
      if (cfg.production.food) foodRate += cfg.production.food;
      if (cfg.production.iron) ironRate += cfg.production.iron;
    });

    // Factor in occupied Outposts production rates for the HUD
    if (state.outposts) {
      Object.keys(state.outposts).forEach(opId => {
        const opState = state.outposts[opId];
        if (opState.owner === 'player') {
          const totalGarrison = Object.values(opState.garrison || {}).reduce((a, b) => a + b, 0);
          if (totalGarrison >= 1) {
            const opCfg = WORLD_MAP_CONFIG.outposts.find(o => o.id === opId);
            if (opCfg && opCfg.yield) {
              if (opCfg.yield.wood) woodRate += opCfg.yield.wood;
              if (opCfg.yield.stone) stoneRate += opCfg.yield.stone;
              if (opCfg.yield.iron) ironRate += opCfg.yield.iron;
            }
          }
        }
      });
    }

    let foodCons = 0;
    Object.keys(state.troops).forEach(t => {
      const count = state.troops[t];
      foodCons += (TROOPS_CONFIG[t]?.stats.foodConsumption || 0) * count;
    });

    const netFoodRate = foodRate * mult * foodMult - foodCons;

    document.getElementById('res-wood-rate').innerText = `(+${Math.round(woodRate * mult * woodMult)})`;
    document.getElementById('res-stone-rate').innerText = `(+${Math.round(stoneRate * mult * stoneMult)})`;
    document.getElementById('res-iron-rate').innerText = `(+${Math.round(ironRate * mult * ironMult)})`;
    
    const foodRateEl = document.getElementById('res-food-rate');
    if (netFoodRate >= 0) {
      foodRateEl.innerText = `(+${Math.round(netFoodRate)})`;
      foodRateEl.className = 'res-rate positive';
    } else {
      foodRateEl.innerText = `(${Math.round(netFoodRate)})`;
      foodRateEl.className = 'res-rate negative';
    }

    const questPanel = document.getElementById('quest-panel');
    if (state.activeQuestId) {
      const q = QUESTS_CONFIG.find(item => item.id === state.activeQuestId);
      if (q) {
        document.getElementById('quest-title').innerText = q.title;
        document.getElementById('quest-desc').innerText = q.description;
        
        let rewardText = [];
        if (q.reward.gold) rewardText.push(`🪙 ${q.reward.gold}`);
        if (q.reward.wood) rewardText.push(`🪵 ${q.reward.wood}`);
        if (q.reward.stone) rewardText.push(`🪨 ${q.reward.stone}`);
        if (q.reward.rubies) rewardText.push(`💎 ${q.reward.rubies}`);
        
        document.getElementById('quest-reward-span').innerText = rewardText.join(', ');
        questPanel.style.display = 'block';
      } else {
        document.getElementById('quest-title').innerText = 'Quest aktiv';
        document.getElementById('quest-desc').innerText = 'Fortschritt wird geladen...';
        document.getElementById('quest-reward-span').innerText = '-';
      }
    } else {
      document.getElementById('quest-title').innerText = 'Alle Quests beendet!';
      document.getElementById('quest-desc').innerText = 'Dein Reich floriert hervorragend.';
      document.getElementById('quest-reward-span').innerText = '-';
    }

    if (changeType === 'tick' && this.selectedBuilding) {
      const b = state.buildings.find(item => item.id === this.selectedBuilding.id);
      if (b) {
        this.updateBuildingUpgradeInfo(b);
      }
    }

    const warningBanner = document.getElementById('raid-warning-banner');
    if (warningBanner) {
       if (state.defenseCountdown !== null) {
         warningBanner.classList.remove('hidden');
         warningBanner.innerHTML = `⚠️ RAUBRITTER-ANGRIFF IN <span id="raid-countdown-timer">${Math.ceil(state.defenseCountdown)}</span>s!`;
       } else if (state.diplomaticRaidCountdown !== null && state.diplomaticAttackingNationId) {
         const nation = AI_NATIONS_CONFIG.find(n => n.id === state.diplomaticAttackingNationId) || { name: 'K.I. Nation' };
         warningBanner.classList.remove('hidden');
         warningBanner.innerHTML = `⚠️ DIPLOMATISCHER KRIEG! ANGRIFF VON ${nation.name.toUpperCase()} IN <span id="raid-countdown-timer">${Math.ceil(state.diplomaticRaidCountdown)}</span>s!`;
       } else if (state.outpostDefenseCountdown !== null && state.outpostUnderAttackId) {
         const op = WORLD_MAP_CONFIG.outposts.find(o => o.id === state.outpostUnderAttackId) || { name: 'Außenposten' };
         warningBanner.classList.remove('hidden');
         warningBanner.innerHTML = `⚠️ ANGRIFF AUF ${op.name.toUpperCase()} IN <span id="raid-countdown-timer">${Math.ceil(state.outpostDefenseCountdown)}</span>s!`;
       } else {
         warningBanner.classList.add('hidden');
       }
    }
  }

  openBuildModal() {
    let html = `
      <h2>Gebäude errichten</h2>
      <p class="modal-intro">Erweitere deine Burg mit neuen Wirtschafts- und Militärgebäuden.</p>
      <div class="build-grid">
    `;

    Object.keys(BUILDINGS_CONFIG).forEach(type => {
      if (type === BUILDING_TYPES.KEEP) return;

      const cfg = BUILDINGS_CONFIG[type];
      const cost = cfg.levels[1].cost;
      const rubiesCost = cfg.levels[1].cost.rubies || 0;
      const buildTime = cfg.levels[1].time;
      const limit = stateManager.getBuildingLimit(type);
      const currentCount = stateManager.getBuildingCount(type);
      const limitReached = currentCount >= limit;
      
      const requiredAge = BUILDING_AGE_REQUIREMENTS[type] || AGES.DARK;
      const ageLocked = stateManager.state.ageIndex < requiredAge;
      const ageName = AGES_CONFIG[requiredAge].name;
      const canAfford = stateManager.hasResources(cost) && (!rubiesCost || stateManager.state.resources.rubies >= rubiesCost) && !limitReached && !ageLocked;

      html += `
        <div class="build-card glass-card ${canAfford ? '' : 'disabled'} ${ageLocked ? 'age-locked' : ''}">
          <div class="build-card-header">
            <h3>${cfg.name}</h3>
            ${rubiesCost > 0 ? `<span class="build-cost-ruby">💎 ${rubiesCost}</span>` : ''}
          </div>
          <p class="build-desc">${cfg.description}</p>
          ${ageLocked ? `<div style="font-size: 0.72rem; margin: 4px 0 8px 0; color: #e74c3c;">🔑 Erfordert: <strong>${ageName}</strong></div>` : `
          <div style="font-size: 0.72rem; margin: 4px 0 8px 0; color: ${limitReached ? '#e74c3c' : 'var(--color-gold-hover)'};">
            Limit: <strong>${currentCount} / ${limit}</strong>
          </div>
          `}
          <div class="build-stats" style="${ageLocked ? 'opacity: 0.4;' : ''}">
            <span>⌛ ${buildTime}s</span>
            ${cost.wood > 0 ? `<span>🪵 ${cost.wood}</span>` : ''}
            ${cost.stone > 0 ? `<span>🪨 ${cost.stone}</span>` : ''}
            ${cost.gold > 0 ? `<span>🪙 ${cost.gold}</span>` : ''}
          </div>
          <button class="build-start-btn primary-btn" ${canAfford ? '' : 'disabled'} data-type="${type}">
            ${ageLocked ? 'Gesperrt' : (limitReached ? 'Limit erreicht' : (canAfford ? 'Errichten' : 'Zu teuer'))}
          </button>
        </div>
      `;
    });

    html += `</div>`;
    this.openModal(html);

    document.querySelectorAll('.build-start-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.target.getAttribute('data-type');
        this.closeModal();
        gameCanvas.enterPlacementMode(type);
        this.showFloatingNotification('Klicke auf eine grüne Kachel des Spielfelds zum Bauen!');
      });
    });
  }

  openBuildingUpgradeModal(b) {
    let html = `<div id="building-modal-inner"></div>`;
    this.openModal(html);
    this.updateBuildingUpgradeInfo(b);
  }

  updateBuildingUpgradeInfo(b) {
    const container = document.getElementById('building-modal-inner');
    if (!container) return;

    const config = BUILDINGS_CONFIG[b.type];
    const nextLevel = b.level + 1;
    const nextCfg = config.levels[nextLevel];
    const hasNext = !!nextCfg;
    const keep = stateManager.state.buildings.find(item => item.type === BUILDING_TYPES.KEEP);

    let detailsHtml = "";

    if (b.underConstruction) {
      const speedCost = Math.max(1, Math.ceil(b.constructionTimeRemaining / 10));
      detailsHtml = `
        <h2>Ausbau im Gange...</h2>
        <div class="upgrade-status glass-card">
          <p><strong>${config.name} (Stufe ${b.level})</strong> wird ausgebaut.</p>
          <div class="progress-container">
            <div class="progress-bar-fill" style="width: ${(1 - b.constructionTimeRemaining / b.constructionTimeTotal) * 100}%"></div>
          </div>
          <p class="timer-text">Restliche Zeit: <strong>${Math.ceil(b.constructionTimeRemaining)}s</strong></p>
          <button id="btn-speedup" class="primary-btn gold-btn" style="width: 100%;">⚡ Beschleunigen (💎 ${speedCost} Rubine)</button>
        </div>
      `;
    } else {
      const currCfg = config.levels[b.level];
      let prodText = "";
      if (currCfg.production) {
        if (currCfg.production.wood) prodText = `<p>Produktion: <strong>+${currCfg.production.wood}/Min</strong></p>`;
        else if (currCfg.production.stone) prodText = `<p>Produktion: <strong>+${currCfg.production.stone}/Min</strong></p>`;
        else if (currCfg.production.food) prodText = `<p>Produktion: <strong>+${currCfg.production.food}/Min</strong></p>`;
        else if (currCfg.production.iron) prodText = `<p>Produktion: <strong>+${currCfg.production.iron}/Min</strong></p>`;
        else if (currCfg.production.weapons) {
          prodText = `<p>Waffenproduktion: <strong>+${currCfg.production.weapons}/Min</strong><br><span style="font-size:0.75rem; color:var(--color-text-muted);">Verbraucht: ⛓️ ${currCfg.consumption.iron}/Min, 🪵 ${currCfg.consumption.wood}/Min</span></p>`;
        }
      } else if (currCfg.defenseBonus) {
        prodText = `<p>Verteidigungsbonus: <strong>+${currCfg.defenseBonus * 100}%</strong></p>`;
      } else if (currCfg.maxSpies) {
        prodText = `<p>Spionagekapazität: <strong>${currCfg.maxSpies} Spione</strong></p>`;
      } else if (b.type === BUILDING_TYPES.STABLES) {
        prodText = `<p>Ermöglicht die Ausbildung schwerer Kavallerie (Ritter).</p>`;
      } else if (b.type === BUILDING_TYPES.LIBRARY) {
        prodText = `<p>Ermöglicht die Durchführung von Reichs-Forschungen in der Bibliothek.</p>`;
      }

      let upgradeActionHtml = "";

      if (hasNext) {
        const canAfford = stateManager.hasResources(nextCfg.cost);
        const meetsKeepReq = b.type === BUILDING_TYPES.KEEP || nextLevel <= keep.level;

        let costText = [];
        if (nextCfg.cost.wood) costText.push(`🪵 ${nextCfg.cost.wood}`);
        if (nextCfg.cost.stone) costText.push(`🪨 ${nextCfg.cost.stone}`);
        if (nextCfg.cost.gold) costText.push(`🪙 ${nextCfg.cost.gold}`);

        let benefitText = "";
        if (nextCfg.production) {
          if (nextCfg.production.wood) benefitText = `Produktion steigt auf: <strong>+${nextCfg.production.wood}/Min</strong>`;
          else if (nextCfg.production.stone) benefitText = `Produktion steigt auf: <strong>+${nextCfg.production.stone}/Min</strong>`;
          else if (nextCfg.production.food) benefitText = `Produktion steigt auf: <strong>+${nextCfg.production.food}/Min</strong>`;
          else if (nextCfg.production.iron) benefitText = `Produktion steigt auf: <strong>+${nextCfg.production.iron}/Min</strong>`;
          else if (nextCfg.production.weapons) {
            benefitText = `Produktion steigt auf: <strong>+${nextCfg.production.weapons}/Min</strong> (Verbraucht: ⛓️ ${nextCfg.consumption.iron}, 🪵 ${nextCfg.consumption.wood})`;
          }
        } else if (nextCfg.defenseBonus) {
          benefitText = `Verteidigung steigt auf: <strong>+${nextCfg.defenseBonus * 100}%</strong>`;
        } else if (nextCfg.unlocks) {
          benefitText = `Schaltet frei: <strong>${nextCfg.unlocks.map(u => TROOPS_CONFIG[u].name).join(', ')}</strong>`;
        } else if (nextCfg.maxSpies) {
          benefitText = `Spionagekapazität steigt auf: <strong>${nextCfg.maxSpies} Spione</strong>`;
        } else {
          benefitText = `Erhöht die Effizienz der Einrichtung.`;
        }

        upgradeActionHtml = `
          <div class="upgrade-requirements glass-card">
            <h3>Nächste Stufe (Stufe ${nextLevel})</h3>
            <p>${benefitText}</p>
            <p>Kosten: <strong>${costText.join(', ')}</strong></p>
            <p>Bauzeit: <strong>⌛ ${nextCfg.time}s</strong></p>
            ${meetsKeepReq 
              ? `<button id="btn-start-upgrade" class="primary-btn" ${canAfford ? '' : 'disabled'}>
                   ${canAfford ? 'Ausbau starten' : 'Nicht genügend Ressourcen'}
                 </button>`
              : `<p class="warning-text">⚠️ Upgrade blockiert: Der Burgfried (Keep) muss zuerst Stufe ${nextLevel} erreichen!</p>`
            }
          </div>
        `;
      } else {
        upgradeActionHtml = `<p class="max-level-text">🏆 Gebäude auf Höchststufe!</p>`;
      }

      if (b.type === BUILDING_TYPES.TAVERN) {
        upgradeActionHtml = `
          <div class="glass-card" style="margin-bottom: 12px; text-align: center; display: flex; gap: 8px;">
            <button id="btn-tavern-recruit" class="primary-btn gold-btn" style="flex: 1;">👤 Spione anwerben</button>
            <button id="btn-tavern-quests" class="primary-btn gold-btn" style="flex: 1;">📜 Schwarzes Brett</button>
          </div>
        ` + upgradeActionHtml;
      } else if (b.type === BUILDING_TYPES.LIBRARY) {
        upgradeActionHtml = `
          <div class="glass-card" style="margin-bottom: 12px; text-align: center;">
            <button id="btn-library-research" class="primary-btn gold-btn" style="width: 100%;">📚 Forschung betreiben</button>
          </div>
        ` + upgradeActionHtml;
      } else if (b.type === BUILDING_TYPES.MARKETPLACE) {
        upgradeActionHtml = `
          <div class="glass-card" style="margin-bottom: 12px; text-align: center;">
            <button id="btn-marketplace-trade" class="primary-btn gold-btn" style="width: 100%;">⚖️ Ressourcen handeln</button>
          </div>
        ` + upgradeActionHtml;
      } else if (b.type === BUILDING_TYPES.HERO_ALTAR) {
        upgradeActionHtml = `
          <div class="glass-card" style="margin-bottom: 12px; text-align: center;">
            <button id="btn-hero-manage" class="primary-btn gold-btn" style="width: 100%;">🛡️ Held verwalten</button>
          </div>
        ` + upgradeActionHtml;
      }

      detailsHtml = `
        <h2>${config.name}</h2>
        <div class="building-details">
          <p>Aktuelle Stufe: <strong>Stufe ${b.level}</strong></p>
          ${prodText}
          <p>${config.description}</p>
          <button id="btn-move-building" class="primary-btn gold-btn" style="width: 100%; margin-top: 10px;">🔄 Gebäude verschieben</button>
          ${b.type !== BUILDING_TYPES.KEEP ? `<button id="btn-demolish-building" class="primary-btn danger-btn" style="width: 100%; margin-top: 10px;">💥 Gebäude abreißen</button>` : ''}
        </div>
        ${upgradeActionHtml}
      `;
    }

    container.innerHTML = detailsHtml;

    const moveBtn = document.getElementById('btn-move-building');
    const demolishBtn = document.getElementById('btn-demolish-building');
    if (demolishBtn) {
      demolishBtn.addEventListener('click', () => {
        if (confirm('Möchtest du dieses Gebäude wirklich abreißen? Alle Ausbaustufen gehen verloren.')) {
          if (stateManager.demolishBuilding(b.id)) {
            this.closeModal();
            this.showFloatingNotification('Gebäude erfolgreich abgerissen.');
          }
        }
      });
    }
    if (moveBtn) {
      moveBtn.addEventListener('click', () => {
        this.closeModal();
        gameCanvas.relocationMode = { buildingId: b.id };
        this.showFloatingNotification('Klicke auf ein freies grünes Feld zum Verschieben (ESC zum Abbrechen).');
      });
    }

    const tavernRecruitBtn = document.getElementById('btn-tavern-recruit');
    if (tavernRecruitBtn) {
      tavernRecruitBtn.addEventListener('click', () => {
        this.openRecruitModal();
      });
    }

    const tavernQuestsBtn = document.getElementById('btn-tavern-quests');
    if (tavernQuestsBtn) {
      tavernQuestsBtn.addEventListener('click', () => {
        this.openTavernQuestsModal();
      });
    }

    const libraryResearchBtn = document.getElementById('btn-library-research');
    if (libraryResearchBtn) {
      libraryResearchBtn.addEventListener('click', () => {
        this.openResearchModal();
      });
    }

    const marketTradeBtn = document.getElementById('btn-marketplace-trade');
    if (marketTradeBtn) {
      marketTradeBtn.addEventListener('click', () => {
        this.openTradeModal();
      });
    }

    const heroManageBtn = document.getElementById('btn-hero-manage');
    if (heroManageBtn) {
      heroManageBtn.addEventListener('click', () => {
        this.openHeroAltarModal();
      });
    }

    const speedBtn = document.getElementById('btn-speedup');
    if (speedBtn) {
      speedBtn.addEventListener('click', () => {
        if (stateManager.speedUpBuilding(b.id)) {
          gameCanvas.spawnSparkleParticle(gameCanvas.canvas.width / 2, gameCanvas.canvas.height / 3);
          this.closeModal();
        }
      });
    }

    const upgradeBtn = document.getElementById('btn-start-upgrade');
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', () => {
        if (stateManager.upgradeBuilding(b.id)) {
          this.closeModal();
          this.showFloatingNotification('Ausbauarbeiten gestartet!');
        }
      });
    }
  }

  openRecruitModal() {
    const barracks = stateManager.state.buildings.find(b => b.type === BUILDING_TYPES.BARRACKS && !b.underConstruction);
    const tavern = stateManager.state.buildings.find(b => b.type === BUILDING_TYPES.TAVERN && !b.underConstruction);
    const stables = stateManager.state.buildings.find(b => b.type === BUILDING_TYPES.STABLES && !b.underConstruction);
    
    if (!barracks && !tavern && !stables) {
      this.openModal(`
        <h2>Ausbildung geschlossen</h2>
        <p class="warning-text">⚠️ Du musst zuerst eine Kaserne, eine Taverne oder Stallungen im Baumenü errichten!</p>
      `);
      return;
    }

    const unlocked = barracks ? (BUILDINGS_CONFIG[BUILDING_TYPES.BARRACKS].levels[barracks.level]?.unlocks || []) : [];
    const stablesUnlocked = stables ? (BUILDINGS_CONFIG[BUILDING_TYPES.STABLES].levels[stables.level]?.unlocks || []) : [];

    let html = `
      <h2>Militär & Agenten anwerben</h2>
      <p class="modal-intro">Bilde Soldaten für deine Armee aus oder heuere Spione in der Taverne an.</p>
      <div class="recruit-grid">
    `;

    const getCostIcon = (key) => {
      switch(key) {
        case 'gold': return '🪙';
        case 'food': return '🌾';
        case 'wood': return '🪵';
        case 'stone': return '🪨';
        case 'weapons': return '🗡️';
        default: return '🗡️';
      }
    };

    Object.keys(TROOPS_CONFIG).forEach(type => {
      const cfg = TROOPS_CONFIG[type];
      let isUnlocked = false;
      let lockText = "";

      if (type === 'spy') {
        isUnlocked = !!tavern;
        if (!isUnlocked) {
          lockText = `<div class="lock-overlay">🔒 Gesperrt (Taverne benötigt)</div>`;
        }
      } else if (type === 'knight') {
        isUnlocked = !!stables;
        if (!isUnlocked) {
          lockText = `<div class="lock-overlay">🔒 Gesperrt (Stallungen benötigt)</div>`;
        }
      } else {
        isUnlocked = unlocked.includes(type);
        if (!isUnlocked) {
          let reqLvl = 1;
          if (type === 'swordsman' || type === 'ram') reqLvl = 2;
          if (type === 'bowman' || type === 'catapult') reqLvl = 3;
          lockText = `<div class="lock-overlay">🔒 Gesperrt (Kaserne Stufe ${reqLvl} benötigt)</div>`;
        }
      }

      const costTextStr = Object.keys(cfg.cost).map(key => `${getCostIcon(key)} ${cfg.cost[key]}`).join(', ');

      html += `
        <div class="recruit-card glass-card ${isUnlocked ? '' : 'locked'}">
          ${lockText}
          <h3>${cfg.name}</h3>
          <p class="recruit-desc">${cfg.description}</p>
          <div class="troop-stats">
            <span>🗡️ Nahkampf-Angriff: ${cfg.stats.attackMelee}</span>
            <span>🏹 Fernkampf-Angriff: ${cfg.stats.attackRanged}</span>
            <span>🛡️ Nahkampf-Def: ${cfg.stats.defenseMelee}</span>
            <span>🛡️ Fernkampf-Def: ${cfg.stats.defenseRanged}</span>
            <span>🪵 Lootkapazität: ${cfg.stats.lootCapacity}</span>
            <span>🌾 Unterhalt: ${cfg.stats.foodConsumption}/Min</span>
          </div>
          <div class="recruit-action" ${isUnlocked ? '' : 'style="opacity: 0.3; pointer-events: none;"'}>
            <p>Kosten pro Einheit: <strong>${costTextStr}</strong> | Zeit: ⌛ ${cfg.time}s</p>
            <div class="slider-container">
              <input type="range" class="troop-slider" id="slider-${type}" min="0" max="50" value="0">
              <span id="slider-val-${type}" class="slider-value">0</span>
            </div>
            <p class="total-rec-cost">Gesamtkosten: <span id="total-cost-${type}">Kosten: -</span></p>
            <button class="recruit-btn primary-btn gold-btn" id="btn-rec-${type}" disabled>Ausbildung starten</button>
          </div>
        </div>
      `;
    });

    html += `
      </div>
      <div class="queue-status glass-card" style="margin-top: 20px;">
        <h3>Ausbildungs-Warteschlange</h3>
        <div id="recruit-queue-list">Lade...</div>
      </div>
    `;

    this.openModal(html);
    this.updateRecruitQueueDisplay();

    Object.keys(TROOPS_CONFIG).forEach(type => {
      const isUnlocked = type === 'spy' ? !!tavern : type === 'knight' ? !!stables : unlocked.includes(type);
      if (!isUnlocked) return;

      const slider = document.getElementById(`slider-${type}`);
      const valLabel = document.getElementById(`slider-val-${type}`);
      const costLabel = document.getElementById(`total-cost-${type}`);
      const btn = document.getElementById(`btn-rec-${type}`);
      const cfg = TROOPS_CONFIG[type];

      let maxUnits = 50;
      Object.keys(cfg.cost).forEach(key => {
        const currentAmt = stateManager.state.resources[key] || 0;
        const costPerUnit = cfg.cost[key] || 0;
        if (costPerUnit > 0) {
          maxUnits = Math.min(maxUnits, Math.floor(currentAmt / costPerUnit));
        }
      });
      maxUnits = Math.max(0, maxUnits);

      if (type === 'spy') {
        const maxSpies = BUILDINGS_CONFIG[BUILDING_TYPES.TAVERN].levels[tavern.level].maxSpies;
        const currentSpies = stateManager.state.troops.spy || 0;
        const trainingSpies = stateManager.state.recruitmentQueue.filter(q => q.troopType === 'spy').reduce((acc, q) => acc + q.count, 0);
        const remainingCapacity = Math.max(0, maxSpies - (currentSpies + trainingSpies));
        maxUnits = Math.min(maxUnits, remainingCapacity);
      }
      
      slider.max = maxUnits;

      slider.addEventListener('input', () => {
        const qty = parseInt(slider.value);
        valLabel.innerText = qty;
        costLabel.innerText = Object.keys(cfg.cost).map(key => `${getCostIcon(key)} ${qty * cfg.cost[key]}`).join(', ');
        btn.disabled = qty <= 0;
      });

      btn.addEventListener('click', () => {
        const qty = parseInt(slider.value);
        if (stateManager.recruitTroops(type, qty)) {
          this.closeModal();
          this.showFloatingNotification(`${qty}x ${cfg.name} rekrutiert!`);
        }
      });
    });

    this.queueUpdateInterval = setInterval(() => {
      this.updateRecruitQueueDisplay();
    }, 1000);

    window.addEventListener('click', (e) => {
      if (e.target.id === 'modal-container' || e.target.id === 'modal-close') {
        clearInterval(this.queueUpdateInterval);
      }
    });
  }

  updateRecruitQueueDisplay() {
    const list = document.getElementById('recruit-queue-list');
    if (!list) {
      clearInterval(this.queueUpdateInterval);
      return;
    }

    const queue = stateManager.state.recruitmentQueue;
    if (queue.length === 0) {
      list.innerHTML = `<p class="empty-text">Keine Einheiten in Ausbildung.</p>`;
      return;
    }

    let html = `<ul class="queue-list-ul">`;
    let currentItem = null;
    let items = [];

    queue.forEach(q => {
      if (!currentItem) {
        currentItem = { ...q };
      } else if (currentItem.troopType === q.troopType) {
        currentItem.count += q.count;
        currentItem.timeRemaining += q.timeRemaining;
        currentItem.timeTotal += q.timeTotal;
      } else {
        items.push(currentItem);
        currentItem = { ...q };
      }
    });
    if (currentItem) items.push(currentItem);

    items.forEach((item, idx) => {
      const name = TROOPS_CONFIG[item.troopType].name;
      const progress = idx === 0 
        ? (1 - item.timeRemaining / TROOPS_CONFIG[item.troopType].time) 
        : 0;

      html += `
        <li>
          <div class="queue-unit-info">
            <span><strong>${item.count}x ${name}</strong></span>
            <span>⌛ ${Math.ceil(item.timeRemaining)}s</span>
          </div>
          ${idx === 0 
            ? `<div class="queue-progress-bar">
                <div class="queue-progress-fill" style="width: ${progress * 100}%"></div>
               </div>`
            : ''
          }
        </li>
      `;
    });

    html += `</ul>`;
    list.innerHTML = html;
  }

  openResearchModal() {
    const state = stateManager.state;
    const tiers = {
      tier1: ['forestry', 'masonry'],
      tier2: ['crop_rotation', 'iron_smelting'],
      tier3: ['logistics', 'sharp_blades', 'reinforced_armor']
    };

    let html = `
      <h2>Bibliothek - Forschungsbaum</h2>
      <p class="modal-intro">Erforsche neue Technologien, um dein Reich permanent zu stärken. Höhere Stufen setzen Basis-Technologien voraus.</p>
      <div id="tech-tree-modal" style="position: relative; overflow: visible; padding: 15px 0;">
        <svg id="tech-tree-connections" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0;"></svg>
        
        <div class="tech-tree-cols" style="position: relative; z-index: 1; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; align-items: start;">
    `;

    const getResourceIcon = key => {
      const icons = { gold: '🪙', wood: '🪵', stone: '🪨', iron: '⛓️', weapons: '🗡️' };
      return icons[key] || '📦';
    };

    const renderColumn = (colId, title, techIds) => {
      let colHtml = `
        <div class="tech-tier-col" style="display: flex; flex-direction: column; gap: 20px;">
          <h4 style="text-align: center; margin: 0 0 10px 0; color: var(--color-gold-hover); font-size: 0.95rem; font-family: var(--font-header); letter-spacing: 1px;">${title}</h4>
      `;

      techIds.forEach(techId => {
        const cfg = RESEARCH_CONFIG[techId];
        const isResearched = !!state.research[techId];
        const isLocked = cfg.requires && !state.research[cfg.requires];
        const canAfford = stateManager.hasResources(cfg.cost);
        
        const costTextStr = Object.keys(cfg.cost)
          .map(key => `${getResourceIcon(key)} ${cfg.cost[key]}`)
          .join(', ');

        colHtml += `
          <div id="tech-card-${techId}" class="research-card glass-card ${isResearched ? 'researched' : ''} ${isLocked ? 'locked' : ''}" 
            style="position: relative; padding: 12px; font-size: 0.8rem; border-color: ${isResearched ? 'var(--color-green-success)' : isLocked ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.1)'}; background: ${isResearched ? 'rgba(39, 174, 96, 0.06)' : isLocked ? 'rgba(0,0,0,0.3)' : 'rgba(25, 27, 36, 0.65)'};">
            
            ${isLocked ? `
              <div style="position: absolute; top: 8px; right: 8px; font-size: 1rem;" title="Gesperrt - Benötigt ${RESEARCH_CONFIG[cfg.requires].name}">🔒</div>
            ` : ''}
            
            <h3 style="margin: 0 0 6px 0; font-size: 0.95rem; color: ${isResearched ? 'var(--color-green-success)' : isLocked ? 'var(--color-text-muted)' : '#fff'};">${cfg.name}</h3>
            <p class="build-desc" style="font-size: 0.75rem; color: var(--color-text-muted); margin: 4px 0 8px 0;">${cfg.desc}</p>
            
            <div class="build-stats" style="font-size: 0.72rem; color: var(--color-text-muted); margin-bottom: 8px;">
              Kosten: ${costTextStr}
            </div>
            
            <button class="research-start-btn primary-btn ${isLocked ? 'disabled-btn' : ''}" 
              ${isResearched || isLocked || !canAfford ? 'disabled' : ''} 
              data-tech="${techId}" 
              style="width: 100%; padding: 4px; font-size: 0.75rem;">
              ${isResearched ? 'Erforscht' : isLocked ? 'Gesperrt' : canAfford ? 'Erforschen' : 'Zu teuer'}
            </button>
          </div>
        `;
      });

      colHtml += `</div>`;
      return colHtml;
    };

    html += renderColumn('tier1', 'T1: Basis', tiers.tier1);
    html += renderColumn('tier2', 'T2: Spezial', tiers.tier2);
    html += renderColumn('tier3', 'T3: Elite', tiers.tier3);

    html += `
        </div>
      </div>
    `;

    this.openModal(html);

    document.querySelectorAll('.research-start-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const techId = e.target.getAttribute('data-tech');
        if (stateManager.researchTechnology(techId)) {
          this.closeModal();
          this.showFloatingNotification('Technologie erfolgreich erforscht!');
        }
      });
    });

    // Draw tech tree connection lines dynamically
    setTimeout(() => {
      this.drawTechTreeConnections(tiers);
    }, 50);
  }

  drawTechTreeConnections(tiers) {
    const container = document.getElementById('tech-tree-modal');
    const svg = document.getElementById('tech-tree-connections');
    if (!container || !svg) return;

    // Set SVG size to match container
    const rect = container.getBoundingClientRect();
    svg.setAttribute('width', rect.width);
    svg.setAttribute('height', rect.height);
    svg.style.width = `${rect.width}px`;
    svg.style.height = `${rect.height}px`;

    // Clear existing connections
    svg.innerHTML = '';

    // Draw connections from parents to children
    Object.keys(RESEARCH_CONFIG).forEach(techId => {
      const cfg = RESEARCH_CONFIG[techId];
      if (!cfg.requires) return;

      const parentEl = document.getElementById(`tech-card-${cfg.requires}`);
      const childEl = document.getElementById(`tech-card-${techId}`);
      if (!parentEl || !childEl) return;

      const pRect = parentEl.getBoundingClientRect();
      const cRect = childEl.getBoundingClientRect();
      const contRect = container.getBoundingClientRect();

      // Parent right middle
      const x1 = (pRect.left + pRect.width) - contRect.left;
      const y1 = (pRect.top + pRect.height / 2) - contRect.top;

      // Child left middle
      const x2 = cRect.left - contRect.left;
      const y2 = (cRect.top + cRect.height / 2) - contRect.top;

      // Determine active/researched state
      const isParentResearched = !!stateManager.state.research[cfg.requires];
      const isChildResearched = !!stateManager.state.research[techId];
      
      let lineColor = 'rgba(255, 255, 255, 0.1)';
      let glow = '';
      if (isChildResearched) {
        lineColor = '#27ae60'; // green line for completed path
        glow = 'filter="url(#glow-green)"';
      } else if (isParentResearched) {
        lineColor = '#d4af37'; // gold line for unlocked/available path
        glow = 'filter="url(#glow-gold)"';
      }

      // Add SVG Glow Filter definition if not exists
      if (!svg.querySelector('defs')) {
        svg.insertAdjacentHTML('afterbegin', `
          <defs>
            <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        `);
      }

      // Draw horizontal S-curve bezier path
      const dx = (x2 - x1) * 0.4;
      const dPath = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

      const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathElement.setAttribute('d', dPath);
      pathElement.setAttribute('stroke', lineColor);
      pathElement.setAttribute('stroke-width', isChildResearched ? '2.5' : isParentResearched ? '2' : '1.5');
      pathElement.setAttribute('fill', 'none');
      if (isParentResearched && !isChildResearched) {
        // Dashed marching path animation for active but unresearched route
        pathElement.setAttribute('stroke-dasharray', '5, 5');
        pathElement.setAttribute('class', 'tech-tree-active-path');
      }
      if (glow) {
        const filterId = isChildResearched ? 'glow-green' : 'glow-gold';
        pathElement.setAttribute('filter', `url(#${filterId})`);
      }
      svg.appendChild(pathElement);
    });
  }

  openTaxModal() {
    const taxHouse = stateManager.state.buildings.some(b => b.type === BUILDING_TYPES.TAX_HOUSE && !b.underConstruction);
    if (!taxHouse) {
      this.openModal(`
        <h2>Steuereintreiber geschlossen</h2>
        <p class="warning-text">⚠️ Du musst zuerst ein Steuerhaus errichten, um Steuern einzutreiben!</p>
      `);
      return;
    }

    const tax = stateManager.state.taxState;
    let html = "";

    if (tax.optionId) {
      const opt = TAX_OPTIONS.find(o => o.id === tax.optionId);
      if (tax.canCollect) {
        html = `
          <h2>Steuern einsammeln!</h2>
          <div class="tax-collect-panel glass-card">
            <p>Die Bürger haben ihre Abgaben bezahlt. Die Schatzkammer wartet!</p>
            <div class="tax-yield-large">🪙 ${opt.yield} Gold</div>
            <button id="btn-collect-taxes" class="primary-btn gold-btn bounce-animation">Gold einsammeln</button>
          </div>
        `;
      } else {
        html = `
          <h2>Steuereintreiber unterwegs...</h2>
          <div class="tax-collect-panel glass-card">
            <p><strong>${opt.name}</strong> wird gerade eingetrieben.</p>
            <div class="progress-container">
              <div class="progress-bar-fill" style="width: ${(1 - tax.timeRemaining / tax.timeTotal) * 100}%"></div>
            </div>
            <p class="timer-text">Ausstehend in: <strong>${Math.ceil(tax.timeRemaining)}s</strong></p>
            <button id="btn-tax-instant" class="primary-btn gold-btn">⚡ Sofort eintreiben (💎 ${opt.rubyCost} Rubine)</button>
          </div>
        `;
      }
    } else {
      const taxRate = state.taxRate || 'normal';
      html = `
        <h2>Steuern eintreiben</h2>
        <p class="modal-intro">Wähle eine Besteuerungs-Dauer. Kürzere Perioden ergeben mehr Ertrag pro Minute, erfordern jedoch manuelles Einsammeln.</p>
        
        <div class="glass-card" style="padding: 12px; margin-bottom: 15px; display: flex; align-items: center; justify-content: space-between; gap: 15px;">
          <span><strong>Königlicher Steuersatz:</strong></span>
          <select id="sel-tax-rate" style="background: #111; color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 5px 10px; border-radius: 4px; font-size: 0.85rem;">
            <option value="low" ${taxRate === 'low' ? 'selected' : ''}>Niedrig (70% Goldertrag | 😊 Zufriedenheit +10%)</option>
            <option value="normal" ${taxRate === 'normal' ? 'selected' : ''}>Normal (100% Goldertrag | Standard)</option>
            <option value="high" ${taxRate === 'high' ? 'selected' : ''}>Hoch (150% Goldertrag | 😞 Zufriedenheit -15%)</option>
          </select>
        </div>

        <div class="tax-grid">
      `;

      TAX_OPTIONS.forEach(opt => {
        let taxYield = opt.yield;
        const houses = state.buildings.filter(b => b.type === BUILDING_TYPES.HOUSE && !b.underConstruction);
        const houseCount = houses.length;
        const houseLevelSum = houses.reduce((sum, h) => sum + h.level, 0);
        const houseMultiplier = 1.0 + (houseCount * 0.15) + (houseLevelSum * 0.10);
        taxYield = Math.round(taxYield * houseMultiplier);

        let taxRateMult = 1.0;
        if (taxRate === 'low') taxRateMult = 0.7;
        else if (taxRate === 'high') taxRateMult = 1.5;
        taxYield = Math.round(taxYield * taxRateMult);

        html += `
          <div class="tax-card glass-card">
            <h3>${opt.name}</h3>
            <p class="tax-desc">${opt.desc}</p>
            <div class="tax-yield">Ertrag: <strong>🪙 ${taxYield} Gold</strong></div>
            <button class="tax-start-btn primary-btn" data-id="${opt.id}">Eintreiben starten</button>
          </div>
        `;
      });

      html += `</div>`;
    }

    this.openModal(html);

    const collectBtn = document.getElementById('btn-collect-taxes');
    if (collectBtn) {
      collectBtn.addEventListener('click', () => {
        stateManager.collectTaxes();
        this.closeModal();
        this.showFloatingNotification('Steuern erfolgreich eingesammelt!');
      });
    }

    const instantBtn = document.getElementById('btn-tax-instant');
    if (instantBtn) {
      instantBtn.addEventListener('click', () => {
        if (stateManager.instantCollectTaxes()) {
          this.closeModal();
          this.showFloatingNotification('Steuern sofort per Bote eingetrieben!');
        }
      });
    }

    const taxRateSel = document.getElementById('sel-tax-rate');
    if (taxRateSel) {
      taxRateSel.addEventListener('change', (e) => {
        stateManager.setTaxRate(e.target.value);
        this.openTaxModal();
        this.showFloatingNotification(`Steuersatz auf ${e.target.value.toUpperCase()} geändert.`);
      });
    }

    document.querySelectorAll('.tax-start-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        stateManager.startTaxCollection(id);
        this.closeModal();
        this.showFloatingNotification('Steuereintreiber losgeschickt!');
      });
    });
  }

  openAttackModal(npc) {
    const state = stateManager.state;
    const report = state.spyReports[npc.id];
    const reportAgeMs = report ? Date.now() - report.timestamp : Infinity;
    const isReportValid = report && reportAgeMs < 300000; // 5 minutes

    // Format defender list (exact vs estimate)
    let defenderHtml = "";
    if (isReportValid) {
      const ageSec = Math.round(reportAgeMs / 1000);
      const ageMin = Math.floor(ageSec / 60);
      const ageSecRem = ageSec % 60;
      const ageStr = ageMin > 0 ? `${ageMin}m ${ageSecRem}s` : `${ageSecRem}s`;
      
      defenderHtml = `
        <div style="margin-bottom: 8px; color: var(--color-green-success); font-size: 0.85rem; font-weight: 600;">
          🟢 Spionagebericht (vor ${ageStr} erstellt)
        </div>
        <div class="defenders-list">
      `;
      Object.keys(report.defenders).forEach(t => {
        const count = report.defenders[t] || 0;
        if (count > 0) {
          defenderHtml += `<p>⚔️ ${TROOPS_CONFIG[t].name}: <strong>${count}</strong></p>`;
        }
      });
      if (defenderHtml === "") defenderHtml += `<p>Keine Truppen stationiert.</p>`;
      defenderHtml += `</div>`;
    } else {
      defenderHtml = `
        <div style="margin-bottom: 8px; color: var(--color-gold-primary); font-size: 0.85rem; font-weight: 600;">
          ⚠️ Schätzung (Keine aktuellen Berichte)
        </div>
        <div class="defenders-list">
      `;
      Object.keys(npc.defenders).forEach(t => {
        const count = npc.defenders[t] || 0;
        // Generate estimated range: actual count +/- 3 (min 0)
        const minEst = Math.max(0, count - 3);
        const maxEst = count + 3;
        defenderHtml += `<p>⚔️ ${TROOPS_CONFIG[t].name}: <strong>${minEst} - ${maxEst}</strong></p>`;
      });
      defenderHtml += `</div>`;
    }

    const totalSpies = state.troops.spy || 0;
    const spyTravelTime = Math.max(5, Math.round(npc.travelTime * 0.5));

    let html = `
      <h2>Militäraktion gegen ${npc.name}</h2>
      <p class="modal-intro">Burgstufe: ${npc.level}</p>
      <div class="combat-dispatch-panels">
        <!-- Left panel: NPC Intel and Spying option -->
        <div class="combat-section glass-card">
          <h3>Burg-Informationen</h3>
          ${defenderHtml}
          <div class="loot-preview" style="margin-bottom: 15px;">
            <h4>Mögliche Beute:</h4>
            <p>🪙 ${npc.loot.gold} | 🪵 ${npc.loot.wood} | 🪨 ${npc.loot.stone} | 💎 ${npc.loot.rubies}</p>
          </div>

          <!-- Spying dispatch section -->
          <h3 style="margin-top: 15px;">Spione entsenden</h3>
          <div class="spy-dispatch-section">
            ${totalSpies > 0 
              ? `
                <div class="troop-send-row">
                  <label><strong>Spione entsenden</strong> (Garnison: ${totalSpies})</label>
                  <div class="slider-container">
                    <input type="range" class="dispatch-slider" id="send-spy" min="1" max="${totalSpies}" value="1">
                    <span id="send-val-spy" class="dispatch-val">1</span>
                  </div>
                </div>
                <p style="font-size: 0.75rem; margin-bottom: 5px;">Reisezeit: ⌛ <strong>${spyTravelTime}s</strong> (50% schneller)</p>
                <p style="font-size: 0.75rem; margin-bottom: 12px;">Erfolgschance: <strong id="spy-chance-pct">0%</strong></p>
                <button id="btn-dispatch-spy" class="primary-btn gold-btn" style="width: 100%;">Spionage starten</button>
                `
              : `
                <p class="warning-text">⚠️ Keine Spione in der Burg. Baue eine Taverne und bilde Spione aus, um die genaue Truppenstärke zu erfahren.</p>
                <button class="primary-btn" disabled style="width: 100%;">Spionage starten</button>
                `
            }
          </div>
        </div>

        <!-- Right panel: Soldier dispatch for attack -->
        <div class="combat-section glass-card">
          <h3>Angriffstruppen entsenden</h3>
          <div class="send-troops-sliders">
    `;

    let totalGarrison = 0;
    Object.keys(state.troops).forEach(t => {
      if (t === 'spy') return; // Spies can't attack
      const qty = state.troops[t] || 0;
      totalGarrison += qty;
      html += `
        <div class="troop-send-row">
          <label><strong>${TROOPS_CONFIG[t].name}</strong> (Garnison: ${qty})</label>
          <div class="slider-container">
            <input type="range" class="dispatch-slider" id="send-${t}" min="0" max="${qty}" value="0" ${qty === 0 ? 'disabled' : ''}>
            <span id="send-val-${t}" class="dispatch-val">0</span>
          </div>
        </div>
      `;
    });

    let alliedAidHtml = "";
    const alliedNations = [];
    if (state.diplomacy) {
      Object.keys(state.diplomacy).forEach(nationId => {
        if (state.diplomacy[nationId].status === 'allied') {
          const nationCfg = AI_NATIONS_CONFIG.find(n => n.id === nationId);
          if (nationCfg) {
            alliedNations.push(nationCfg);
          }
        }
      });
    }

    if (alliedNations.length > 0) {
      alliedAidHtml = `
        <div style="margin-top: 10px; margin-bottom: 10px; background: rgba(46, 204, 113, 0.15); border: 1px solid #2ecc71; padding: 10px; border-radius: 4px; font-size: 0.75rem; text-align: left;">
          <label style="font-weight: bold; display: block; margin-bottom: 6px; color: var(--color-green-success); display: flex; align-items: center; gap: 5px;">🤝 Alliierten-Militärhilfe anfordern:</label>
          <select id="sel-allied-aid" style="background: #111; color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 5px; border-radius: 4px; font-size: 0.8rem; width: 100%;">
            <option value="">-- Keine Hilfe anfordern --</option>
            ${alliedNations.map(n => {
              let details = "";
              if (n.id === 'kingdom_north') details = "⚔️ 6 Ritter (Kosten: 🪙 200 Gold + ⛓️ 100 Eisen)";
              else if (n.id === 'republic_south') details = "🏹 15 Speerkämpfer (Kosten: 🪙 150 Gold + 🌾 150 Nahrung)";
              else if (n.id === 'empire_east') details = "🛡️ 10 Schwertkämpfer (Kosten: 🪙 150 Gold + 🪨 100 Stein)";
              return `<option value="${n.id}">${n.name}: ${details}</option>`;
            }).join('')}
          </select>
        </div>
      `;
    } else {
      alliedAidHtml = `
        <div style="margin-top: 10px; margin-bottom: 10px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255,255,255,0.1); padding: 8px; border-radius: 4px; font-size: 0.75rem; text-align: left; color: var(--color-text-muted);">
          <span>🤝 <strong>Alliierten-Hilfe nicht verfügbar</strong><br>Verbünde dich erst über Diplomatie, um Unterstützung anzufordern.</span>
        </div>
      `;
    }

    html += `
          </div>
          <p style="font-size: 0.75rem; margin-top: 8px;">Reisezeit: ⌛ <strong>${npc.travelTime}s</strong></p>
          ${alliedAidHtml}
          <button id="btn-dispatch-attack" class="primary-btn danger-btn" style="margin-top: 15px; width: 100%;" ${totalGarrison === 0 ? 'disabled' : ''}>Angriff starten</button>
        </div>
      </div>
    `;

    this.openModal(html);

    // Slider listeners for soldiers
    Object.keys(state.troops).forEach(t => {
      if (t === 'spy') return;
      const slider = document.getElementById(`send-${t}`);
      const valLabel = document.getElementById(`send-val-${t}`);
      if (slider) {
        slider.addEventListener('input', () => {
          valLabel.innerText = slider.value;
        });
      }
    });

    // Spying success chance calculator & slider listener
    if (totalSpies > 0) {
      const spySlider = document.getElementById('send-spy');
      const spyValLabel = document.getElementById('send-val-spy');
      const spyChanceLabel = document.getElementById('spy-chance-pct');

      const updateSpyChance = () => {
        const count = parseInt(spySlider.value);
        spyValLabel.innerText = count;
        const successChance = Math.min(0.95, Math.max(0.1, 0.55 + (count * 0.12) - (npc.level * 0.08)));
        spyChanceLabel.innerText = `${Math.round(successChance * 100)}%`;
      };

      spySlider.addEventListener('input', updateSpyChance);
      updateSpyChance(); // Initial calculation

      // Dispatch Spy listener
      document.getElementById('btn-dispatch-spy').addEventListener('click', () => {
        const count = parseInt(spySlider.value);
        if (stateManager.dispatchSpy(npc.id, count)) {
          this.closeModal();
          this.showFloatingNotification(`Spionagemission gestartet! Reisezeit: ⌛ ${spyTravelTime}s.`);
        }
      });
    }

    // Dispatch Attack listener
    const dispatchBtn = document.getElementById('btn-dispatch-attack');
    if (dispatchBtn) {
      dispatchBtn.addEventListener('click', () => {
        const troopsToSend = {};
        Object.keys(state.troops).forEach(t => {
          if (t === 'spy') return;
          const val = parseInt(document.getElementById(`send-${t}`).value) || 0;
          if (val > 0) troopsToSend[t] = val;
        });

        const selAllied = document.getElementById('sel-allied-aid');
        const alliedAid = selAllied ? selAllied.value : "";

        if (stateManager.dispatchAttack(npc.id, troopsToSend, 'npc', alliedAid)) {
          this.closeModal();
          this.showFloatingNotification(`Angriffszug ausgesandt! Reisezeit: ⌛ ${npc.travelTime}s.`);
        }
      });
    }
  }

  openRandomEventModal(eventId) {
    const event = RANDOM_EVENTS_CONFIG.find(e => e.id === eventId);
    if (!event) return;

    let choicesHtml = '';
    event.choices.forEach((choice, idx) => {
      const hasCondition = !choice.condition || choice.condition(stateManager.state);
      choicesHtml += `
        <button class="choice-btn" id="btn-choice-${idx}" ${hasCondition ? '' : 'disabled'}>
          ${choice.text}
        </button>
      `;
    });

    const html = `
      <div class="event-card">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <span style="font-size: 2.5rem;">${event.icon || '⚡'}</span>
          <div>
            <h2 style="margin: 0; font-size: 1.2rem;">Zufälliges Ereignis</h2>
            <div style="color: var(--color-gold-hover); font-size: 1rem; font-weight: bold;">${event.title}</div>
          </div>
        </div>
        <p style="margin: 0 0 15px 0; font-size: 0.88rem; line-height: 1.5; color: var(--color-text-muted);">${event.desc}</p>
        <div class="event-choices">
          ${choicesHtml}
        </div>
      </div>
    `;

    this.openModal(html);

    event.choices.forEach((choice, idx) => {
      const btn = document.getElementById(`btn-choice-${idx}`);
      if (btn) {
        btn.addEventListener('click', () => {
          const outcomeMsg = choice.action(stateManager.state);
          stateManager.state.activeEvent = null;
          stateManager.save();
          stateManager.notifyListeners('tick');
          this.closeModal();
          this.showFloatingNotification(outcomeMsg || 'Ereignis abgeschlossen!');
        });
      }
    });
  }

  openSettingsModal() {
    const state = stateManager.state;
    let html = `
      <h2>Reichsverwaltung & Einstellungen</h2>
      <div class="settings-panel glass-card">
        <div class="setting-row">
          <label><strong>Name deines Schlosses:</strong></label>
          <input type="text" id="input-castle-name" value="${state.castleName}" placeholder="Burgname">
        </div>
        <div class="setting-row">
          <label><strong>Farbe deines Banners:</strong></label>
          <div class="banner-color-picks">
            <button class="color-dot ${state.bannerColor === '#3498db' ? 'active' : ''}" style="background-color: #3498db" data-color="#3498db"></button>
            <button class="color-dot ${state.bannerColor === '#e74c3c' ? 'active' : ''}" style="background-color: #e74c3c" data-color="#e74c3c"></button>
            <button class="color-dot ${state.bannerColor === '#2ecc71' ? 'active' : ''}" style="background-color: #2ecc71" data-color="#2ecc71"></button>
            <button class="color-dot ${state.bannerColor === '#9b59b6' ? 'active' : ''}" style="background-color: #9b59b6" data-color="#9b59b6"></button>
            <button class="color-dot ${state.bannerColor === '#f1c40f' ? 'active' : ''}" style="background-color: #f1c40f" data-color="#f1c40f"></button>
          </div>
        </div>
        <div class="setting-row stat-summary">
          <h3>Statistiken deiner Herrschaft:</h3>
          <p>Robber Baron Siege: <strong>${state.statistics.npcDefeated}</strong></p>
          <p>Höchste besiegte Stufe: <strong>${state.statistics.maxNpcLevelDefeated}</strong></p>
          <p>Eingenommenes Steuergold: <strong>${state.statistics.totalGoldCollected}</strong></p>
          <p>Ausgegebene Rubine: <strong>${state.statistics.rubiesSpent}</strong></p>
        </div>
        
        <div class="setting-row" style="margin-top: 15px;">
          <h3>Audio-Einstellungen:</h3>
          <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85rem;">
                <input type="checkbox" id="chk-toggle-music" ${gameSound.musicEnabled ? 'checked' : ''}>
                🔊 Hintergrundmusik
              </label>
              <input type="range" id="rng-music-volume" min="0" max="1" step="0.05" value="${gameSound.musicVolume !== undefined ? gameSound.musicVolume : 0.5}" style="width: 100px;">
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; font-size: 0.85rem;">
                <input type="checkbox" id="chk-toggle-sfx" ${gameSound.sfxEnabled ? 'checked' : ''}>
                🔊 Soundeffekte (SFX)
              </label>
              <input type="range" id="rng-sfx-volume" min="0" max="1" step="0.05" value="${gameSound.sfxVolume !== undefined ? gameSound.sfxVolume : 0.5}" style="width: 100px;">
            </div>
          </div>
        </div>

        <div class="setting-row" style="margin-top: 15px;">
          <h3>KI-Helfer (Bot) Einstellungen:</h3>
          <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label style="font-size: 0.85rem;"><strong>KI-Helfer aktiv:</strong></label>
              <input type="checkbox" id="chk-toggle-ai-active" ${window.AIBot && window.AIBot.enabled ? 'checked' : ''}>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label style="font-size: 0.85rem;"><strong>KI-Persönlichkeit:</strong></label>
              <select id="sel-ai-personality" style="background: #111; color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 4px; border-radius: 4px; font-size: 0.85rem;">
                <option value="builder" ${window.AIBot && window.AIBot.personality === 'builder' ? 'selected' : ''}>Baumeister (Ressourcen & Quests)</option>
                <option value="warlord" ${window.AIBot && window.AIBot.personality === 'warlord' ? 'selected' : ''}>Kriegsherr (Truppen & Angriffe)</option>
                <option value="crawler" ${window.AIBot && window.AIBot.personality === 'crawler' ? 'selected' : ''}>Erkunder (Dungeons & Held)</option>
              </select>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label style="font-size: 0.85rem;"><strong>Arbeitstempo:</strong></label>
              <select id="sel-ai-speed" style="background: #111; color: #fff; border: 1px solid rgba(255,255,255,0.2); padding: 4px; border-radius: 4px; font-size: 0.85rem;">
                <option value="fast" ${window.AIBot && window.AIBot.intervalSpeed === 'fast' ? 'selected' : ''}>Schnell (6s)</option>
                <option value="normal" ${window.AIBot && window.AIBot.intervalSpeed === 'normal' ? 'selected' : ''}>Normal (15s)</option>
                <option value="slow" ${window.AIBot && window.AIBot.intervalSpeed === 'slow' ? 'selected' : ''}>Langsam (30s)</option>
              </select>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label style="font-size: 0.85rem;"><strong>Automatischer Angriff:</strong></label>
              <input type="checkbox" id="chk-toggle-ai-autoattack" ${window.AIBot && window.AIBot.autoAttack ? 'checked' : ''}>
            </div>
          </div>
        </div>

        <div class="setting-row" style="margin-top: 15px;">
          <h3>Bestenliste:</h3>
          <button id="btn-open-leaderboard" class="primary-btn gold-btn" style="width: 100%; margin-top: 5px;">🏆 Lokale Bestenliste anzeigen</button>
        </div>

        <div class="setting-row" style="margin-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px;">
          <h3>Spielstand Im- / Export:</h3>
          <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 6px;">Kopiere den Textcode zum Sichern oder füge einen Code ein, um zu laden.</p>
          <div style="display: flex; gap: 8px;">
            <input type="text" id="txt-savegame-code" readonly style="flex-grow: 1; font-size: 0.72rem; padding: 4px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;" value="${btoa(unescape(encodeURIComponent(JSON.stringify(state))))}">
            <button id="btn-copy-savecode" class="primary-btn" style="font-size: 0.72rem; padding: 4px 8px;">Kopieren</button>
          </div>
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <input type="text" id="txt-import-code" placeholder="Sicherungscode hier einfügen..." style="flex-grow: 1; font-size: 0.72rem; padding: 4px; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.2); color: #fff; border-radius: 4px;">
            <button id="btn-import-savecode" class="primary-btn gold-btn" style="font-size: 0.72rem; padding: 4px 8px;">Importieren</button>
          </div>
        </div>

        <button id="btn-reset-game" class="danger-btn shadow-btn" style="margin-top: 15px; width: 100%;">Spielstand komplett löschen</button>
      </div>
    `;

    this.openModal(html);

    const nameInput = document.getElementById('input-castle-name');
    nameInput.addEventListener('input', () => {
      state.castleName = nameInput.value || 'Hauptburg';
      stateManager.save();
    });

    document.querySelectorAll('.color-dot').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const color = e.target.getAttribute('data-color');
        state.bannerColor = color;
        stateManager.save();
        document.querySelectorAll('.color-dot').forEach(el => el.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // Toggle Music
    const musicChk = document.getElementById('chk-toggle-music');
    if (musicChk) {
      musicChk.addEventListener('change', (e) => {
        gameSound.setMusicEnabled(e.target.checked);
      });
    }

    const musicVolRng = document.getElementById('rng-music-volume');
    if (musicVolRng) {
      musicVolRng.addEventListener('input', (e) => {
        gameSound.setMusicVolume(e.target.value);
      });
    }

    // Toggle SFX
    const sfxChk = document.getElementById('chk-toggle-sfx');
    if (sfxChk) {
      sfxChk.addEventListener('change', (e) => {
        gameSound.setSfxEnabled(e.target.checked);
      });
    }

    const sfxVolRng = document.getElementById('rng-sfx-volume');
    if (sfxVolRng) {
      sfxVolRng.addEventListener('input', (e) => {
        gameSound.setSfxVolume(e.target.value);
      });
    }

    // Toggle AI Bot Active
    const aiActiveChk = document.getElementById('chk-toggle-ai-active');
    if (aiActiveChk) {
      aiActiveChk.addEventListener('change', (e) => {
        if (e.target.checked) {
          window.AIBot && window.AIBot.start();
          this.showFloatingNotification("🤖 KI-Helfer gestartet.");
        } else {
          window.AIBot && window.AIBot.stop();
          this.showFloatingNotification("🤖 KI-Helfer deaktiviert.");
        }
      });
    }

    // Toggle AI Auto Attack
    const aiAutoAttackChk = document.getElementById('chk-toggle-ai-autoattack');
    if (aiAutoAttackChk) {
      aiAutoAttackChk.addEventListener('change', (e) => {
        if (window.AIBot) {
          window.AIBot.autoAttack = e.target.checked;
          localStorage.setItem('empire_ai_auto_attack', e.target.checked ? 'true' : 'false');
        }
      });
    }

    // Change AI Personality
    const aiPersSel = document.getElementById('sel-ai-personality');
    if (aiPersSel) {
      aiPersSel.addEventListener('change', (e) => {
        window.AIBot && window.AIBot.setPersonality(e.target.value);
        this.showFloatingNotification(`🤖 KI-Strategie geändert auf: ${e.target.options[e.target.selectedIndex].text}`);
      });
    }

    // Change AI Speed
    const aiSpeedSel = document.getElementById('sel-ai-speed');
    if (aiSpeedSel) {
      aiSpeedSel.addEventListener('change', (e) => {
        window.AIBot && window.AIBot.setSpeed(e.target.value);
        this.showFloatingNotification(`🤖 KI-Arbeitstempo geändert auf: ${e.target.options[e.target.selectedIndex].text}`);
      });
    }

    // Open Leaderboard
    const leaderboardBtn = document.getElementById('btn-open-leaderboard');
    if (leaderboardBtn) {
      leaderboardBtn.addEventListener('click', () => {
        this.openLeaderboardModal();
      });
    }

    // Copy Savegame Code
    const copyBtn = document.getElementById('btn-copy-savecode');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const txt = document.getElementById('txt-savegame-code');
        txt.select();
        navigator.clipboard.writeText(txt.value);
        this.showFloatingNotification("Sicherungscode in Zwischenablage kopiert!");
      });
    }

    // Import Savegame Code
    const importBtn = document.getElementById('btn-import-savecode');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        const code = document.getElementById('txt-import-code').value.trim();
        if (!code) {
          this.showToast('Bitte gib einen gültigen Sicherungscode ein!', 'warning');
          return;
        }
        try {
          const decoded = JSON.parse(decodeURIComponent(escape(atob(code))));
          if (decoded && decoded.resources && decoded.buildings) {
            stateManager.state = decoded;
            stateManager.save();
            this.closeModal();
            this.showFloatingNotification("Spielstand erfolgreich geladen! Lade neu...");
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          } else {
            this.showToast('Ungültiges Speicherdaten-Format!', 'error');
          }
        } catch (e) {
          this.showToast('Fehler beim Dekodieren! Stelle sicher, dass der Code vollständig kopiert wurde.', 'error');
        }
      });
    }

    document.getElementById('btn-reset-game').addEventListener('click', () => {
      if (confirm('Bist du sicher, dass du deinen gesamten Fortschritt löschen möchtest?')) {
        stateManager.resetToDefault();
        this.closeModal();
        this.toggleView(VIEWS.CASTLE);
        this.showFloatingNotification('Fortschritt zurückgesetzt!');
      }
    });
  }

  openLeaderboardModal() {
    const highscoresStr = localStorage.getItem('empire_classic_highscores') || '[]';
    let highscores = [];
    try {
      highscores = JSON.parse(highscoresStr);
    } catch(e) {
      highscores = [];
    }

    let rowsHtml = "";
    if (highscores.length > 0) {
      highscores.forEach((entry, idx) => {
        const medals = ['🥇', '🥈', '🥉', '🎖️', '🎖️'];
        const medal = medals[idx] || '🎖️';
        const isCurrent = entry.castleName === stateManager.state.castleName;
        rowsHtml += `
          <tr style="background: ${isCurrent ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.03)'}; font-weight: ${isCurrent ? 'bold' : 'normal'}; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <td style="padding: 10px; text-align: center; font-size: 1.1rem;">${medal} ${idx + 1}</td>
            <td style="padding: 10px; color: ${isCurrent ? 'var(--color-gold-hover)' : '#fff'};">${entry.castleName}</td>
            <td style="padding: 10px; text-align: right; font-weight: bold; color: var(--color-gold-hover);">${entry.score.toLocaleString()}</td>
            <td style="padding: 10px; text-align: right; color: var(--color-text-muted); font-size: 0.8rem;">${entry.date}</td>
          </tr>
        `;
      });
    } else {
      rowsHtml = `
        <tr>
          <td colspan="4" style="padding: 20px; text-align: center; color: var(--color-text-muted);">Noch keine Einträge vorhanden. Erreiche neue Höhen im Spiel!</td>
        </tr>
      `;
    }

    const currentScore = stateManager.calculateScore();

    const html = `
      <h2>🏆 Ruhmeshalle (Leaderboard)</h2>
      <p class="modal-intro">Die legendärsten Herrscher und ihre prachtvollsten Schlösser.</p>
      <div class="glass-card" style="padding: 15px; margin-bottom: 15px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
          <thead>
            <tr style="border-bottom: 2px solid rgba(212,175,55,0.3); font-family: var(--font-header); color: var(--color-gold-hover);">
              <th style="padding: 8px; text-align: center;">Rang</th>
              <th style="padding: 8px;">Königreich</th>
              <th style="padding: 8px; text-align: right;">Punkte</th>
              <th style="padding: 8px; text-align: right;">Datum</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      </div>
      <div style="background: rgba(0,0,0,0.2); padding: 10px 15px; border-radius: 6px; font-size: 0.85rem; display: flex; justify-content: space-between; align-items: center;">
        <span>Dein aktueller Punktestand:</span>
        <strong style="color: var(--color-gold-hover); font-size: 1rem;">${currentScore.toLocaleString()} Punkte</strong>
      </div>
      <button id="btn-leaderboard-back" class="primary-btn" style="margin-top: 15px; width: 100%;">Zurück zu den Einstellungen</button>
    `;

    this.openModal(html);

    document.getElementById('btn-leaderboard-back').addEventListener('click', () => {
      this.openSettingsModal();
    });
  }

  showFloatingNotification(text, type = 'info') {
    const area = document.getElementById('notification-area');
    if (!area) return;

    // Limit to 5 concurrent notifications
    const existing = area.querySelectorAll('.floating-notification');
    if (existing.length >= 5) {
      existing[0].remove();
    }

    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const el = document.createElement('div');
    el.className = `floating-notification glass-panel bounce-animation toast-${type}`;
    el.innerHTML = `<span class="toast-icon">${icons[type] || ''}</span><span>${text}</span>`;
    area.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-20px)';
      setTimeout(() => el.remove(), 500);
    }, 3500);
  }

  // Typed toast shortcut - alias for showFloatingNotification
  showToast(text, type = 'info') {
    this.showFloatingNotification(text, type);
  }



  showQuestRewardNotification(claim) {
    const area = document.getElementById('notification-area');
    if (!area) return;

    const el = document.createElement('div');
    el.className = 'floating-notification quest-reward-notification glass-panel bounce-animation';
    
    let rewardText = [];
    if (claim.reward.gold) rewardText.push(`🪙 ${claim.reward.gold}`);
    if (claim.reward.wood) rewardText.push(`🪵 ${claim.reward.wood}`);
    if (claim.reward.stone) rewardText.push(`🪨 ${claim.reward.stone}`);
    if (claim.reward.rubies) rewardText.push(`💎 ${claim.reward.rubies}`);
    
    el.innerHTML = `
      <h4 style="margin: 0 0 5px 0; color: #d4af37;">🏆 Quest gelöst!</h4>
      <p style="margin: 0; font-size: 11px;">"${claim.title}" abgeschlossen.</p>
      <p style="margin: 3px 0 0 0; font-weight: bold;">+ ${rewardText.join(', ')}</p>
    `;
    area.appendChild(el);

    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-20px)';
      setTimeout(() => el.remove(), 600);
    }, 4500);
  }

  showAttackProposal(targetName, onApprove, onDeny) {
    const area = document.getElementById('notification-area');
    if (!area) return;

    const el = document.createElement('div');
    el.className = 'floating-notification glass-panel bounce-animation';
    el.style.display = 'flex';
    el.style.flexDirection = 'column';
    el.style.gap = '8px';
    el.style.padding = '15px';
    el.style.background = 'rgba(20, 22, 30, 0.98)';
    el.style.borderColor = '#d4af37';
    el.style.minWidth = '220px';
    el.style.pointerEvents = 'auto';

    el.innerHTML = `
      <div style="font-weight: bold; color: #d4af37; font-size: 0.85rem; font-family: var(--font-header);">🤖 KI-Angriffsvorschlag</div>
      <div style="font-size: 0.75rem; color: #fff;">Soll die KI <strong>${targetName}</strong> angreifen?</div>
      <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 5px;">
        <button id="ai-proposal-yes" class="control-btn" style="background: var(--color-green-success); border: none; padding: 6px 12px; font-size: 0.75rem; width: auto; color: white;">Ja</button>
        <button id="ai-proposal-no" class="control-btn" style="background: var(--color-red-danger); border: none; padding: 6px 12px; font-size: 0.75rem; width: auto; color: white;">Nein</button>
      </div>
    `;
    area.appendChild(el);

    el.querySelector('#ai-proposal-yes').addEventListener('click', (e) => {
      e.stopPropagation();
      onApprove();
      el.remove();
    });

    el.querySelector('#ai-proposal-no').addEventListener('click', (e) => {
      e.stopPropagation();
      onDeny();
      el.remove();
    });

    // Auto-remove after 25 seconds
    setTimeout(() => {
      if (el.parentNode) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-20px)';
        setTimeout(() => el.remove(), 500);
      }
    }, 25000);
  }

  openWeatherModal() {
    const state = stateManager.state;
    const weather = state.weather || { type: 'sunny', timeRemaining: 30 };
    const weatherNames = { sunny: 'Sonnig', rainy: 'Regnerisch', stormy: 'Stürmisch', snowy: 'Schneefall' };
    const weatherEffects = {
      sunny: '☀️ Keine Beeinträchtigungen. Normale Produktionsraten.',
      rainy: '🌧️ Nahrungsproduktion +20% | Holz- und Steinproduktion -10%.',
      stormy: '⛈️ Holz- und Steinproduktion -20% | Marschgeschwindigkeit der Truppen verringert (+25% Reisezeit).',
      snowy: '❄️ Nahrungsproduktion -30% | Eisenproduktion -10% | Marschgeschwindigkeit extrem verlangsamt (+50% Reisezeit).'
    };
    const currentSeason = stateManager.getCurrentSeason();
    
    const html = `
      <h2>🌦️ Wetterbericht & Jahreszeiten</h2>
      <p class="modal-intro">Das Wetter und die Jahreszeit beeinflussen deine Ressourcenproduktion und Truppenbewegungen maßgeblich.</p>
      
      <div style="display: flex; flex-direction: column; gap: 12px; margin-top: 15px;">
        <div class="glass-card" style="padding: 15px; border-color: #3498db;">
          <h3 style="color: #3498db; margin: 0 0 8px 0;">Aktuelles Wetter: ${weatherNames[weather.type]}</h3>
          <p style="font-size: 0.85rem; line-height: 1.4;">${weatherEffects[weather.type]}</p>
          <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 10px;">
            Wetterwechsel in ca. <strong>${Math.ceil(weather.timeRemaining)} Sekunden</strong>.
          </div>
        </div>

        <div class="glass-card" style="padding: 15px; border-color: var(--color-gold-primary);">
          <h3 style="color: var(--color-gold-hover); margin: 0 0 8px 0;">Jahreszeit: ${currentSeason.name}</h3>
          <p style="font-size: 0.85rem; line-height: 1.4;">
            ${currentSeason.desc || 'Die Jahreszeiten bringen verschiedene Vor- und Nachteile.'}
          </p>
          <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 10px;">
            Jahreszeitenwechsel in ca. <strong>${Math.ceil(state.seasonTimeRemaining || 120)} Sekunden</strong>.
          </div>
        </div>
      </div>
      
      <button id="btn-weather-close" class="primary-btn" style="width: 100%; margin-top: 15px;">Schließen</button>
    `;
    
    this.openModal(html);
    document.getElementById('btn-weather-close').addEventListener('click', () => this.closeModal());
  }

  openTradeOfferModal(offer) {
    const resourceNames = { wood: 'Holz 🪵', stone: 'Stein 🪨', food: 'Nahrung 🌾', iron: 'Eisen ⛓️', gold: 'Gold 🪙', rubies: 'Rubine 💎', leather: 'Leder 💼' };
    
    const demandText = `${offer.demandAmount} ${resourceNames[offer.demandResource] || offer.demandResource}`;
    const rewardText = `${offer.rewardAmount} ${resourceNames[offer.rewardResource] || offer.rewardResource}`;

    const html = `
      <h2>🤝 Dringendes Handelsangebot!</h2>
      <p class="modal-intro">Ein Gesandter von <strong>${offer.nationName}</strong> ist eingetroffen und schlägt ein Tauschgeschäft vor:</p>
      <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(212,175,55,0.2); padding: 15px; border-radius: 6px; margin: 15px 0; text-align: center;">
        <div style="font-size: 1.1rem; color: #e74c3c; margin-bottom: 8px;"><strong>Gefordert:</strong> ${demandText}</div>
        <div style="font-size: 1.1rem; color: #2ecc71;"><strong>Gegenleistung:</strong> ${rewardText}</div>
        <div style="margin-top: 12px; font-size: 0.8rem; opacity: 0.6;">Dieses Angebot verfällt in 120 Sekunden.</div>
      </div>
      <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
        <button id="btn-accept-trade-offer" class="primary-btn" style="border-color: #2ecc71;">Akzeptieren</button>
        <button id="btn-reject-trade-offer" class="primary-btn" style="border-color: #e74c3c;">Ablehnen</button>
      </div>
    `;

    this.openModal(html);

    document.getElementById('btn-accept-trade-offer').addEventListener('click', () => {
      const success = stateManager.acceptTradeOffer();
      if (success) {
        this.showFloatingNotification('Handel erfolgreich abgeschlossen! 🤝');
        this.closeModal();
      } else {
        this.showFloatingNotification('Nicht genügend Ressourcen für diesen Handel! ❌');
      }
    });

    document.getElementById('btn-reject-trade-offer').addEventListener('click', () => {
      stateManager.rejectTradeOffer();
      this.closeModal();
    });
  }

  async openSettingsModal() {
    const sound = window.gameSound || {};
    const musicVol = Math.round((sound.musicVolume || 0.5) * 100);
    const sfxVol = Math.round((sound.sfxVolume || 0.5) * 100);

    const slots = await Persistence.listSlots();
    const activeSlot = Persistence.getActiveSlotId();

    let slotsHtml = slots.map(slot => `
      <div class="glass-card" style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin-bottom: 8px; border-left: 4px solid ${slot.id === activeSlot ? '#2ecc71' : '#7f8c8d'};">
        <div>
          <strong style="color: var(--color-gold-hover);">${slot.name} ${slot.id === activeSlot ? ' (Aktiv)' : ''}</strong>
          <div style="font-size: 0.75rem; color: #bdc3c7;">${slot.info}</div>
        </div>
        <div style="display: flex; gap: 6px;">
          <button class="primary-btn btn-slot-load" data-slot="${slot.id}" style="font-size: 0.72rem; padding: 4px 8px;">Laden</button>
          <button class="primary-btn btn-slot-save" data-slot="${slot.id}" style="font-size: 0.72rem; padding: 4px 8px;">Speichern</button>
          ${slot.hasData ? `<button class="primary-btn btn-slot-delete" data-slot="${slot.id}" style="font-size: 0.72rem; padding: 4px 8px; border-color: #e74c3c;">Löschen</button>` : ''}
        </div>
      </div>
    `).join('');

    const html = `
      <h2>⚙️ Einstellungen & Speicherstände</h2>
      
      <div style="margin-bottom: 20px;">
        <h3 style="color: var(--color-gold-hover); font-size: 0.95rem;">🔊 Sound & Musik-Lautstärke</h3>
        <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
          <div>
            <label style="font-size: 0.8rem; color: #bdc3c7;">Hintergrundmusik: <span id="val-music-vol">${musicVol}%</span></label>
            <input type="range" id="slider-music-vol" min="0" max="100" value="${musicVol}" style="width: 100%; margin-top: 4px;">
          </div>
          <div>
            <label style="font-size: 0.8rem; color: #bdc3c7;">Sound-Effekte (SFX): <span id="val-sfx-vol">${sfxVol}%</span></label>
            <input type="range" id="slider-sfx-vol" min="0" max="100" value="${sfxVol}" style="width: 100%; margin-top: 4px;">
          </div>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="color: var(--color-gold-hover); font-size: 0.95rem;">💾 Speicherstände (Multi-Slot)</h3>
        ${slotsHtml}
      </div>

      <div style="display: flex; gap: 10px; margin-top: 15px;">
        <button id="btn-open-crest" class="primary-btn" style="flex: 1;">👑 Wappen anpassen</button>
        <button id="btn-settings-close" class="primary-btn" style="flex: 1;">Schließen</button>
      </div>
    `;

    this.openModal(html);

    document.getElementById('slider-music-vol').addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      document.getElementById('val-music-vol').textContent = `${val}%`;
      if (window.gameSound) window.gameSound.setMusicVolume(val / 100);
    });

    document.getElementById('slider-sfx-vol').addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      document.getElementById('val-sfx-vol').textContent = `${val}%`;
      if (window.gameSound) window.gameSound.setSfxVolume(val / 100);
    });

    document.querySelectorAll('.btn-slot-load').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const slotId = e.target.getAttribute('data-slot');
        Persistence.setActiveSlotId(slotId);
        window.location.reload();
      });
    });

    document.querySelectorAll('.btn-slot-save').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const slotId = e.target.getAttribute('data-slot');
        await Persistence.save(stateManager.state, slotId);
        this.showFloatingNotification(`Spielstand auf ${slotId} gespeichert!`);
        this.openSettingsModal();
      });
    });

    document.querySelectorAll('.btn-slot-delete').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const slotId = e.target.getAttribute('data-slot');
        await Persistence.deleteSlot(slotId);
        this.showFloatingNotification(`Speicherplatz ${slotId} gelöscht.`);
        this.openSettingsModal();
      });
    });

    document.getElementById('btn-open-crest').addEventListener('click', () => {
      this.openCrestCustomizerModal();
    });

    document.getElementById('btn-settings-close').addEventListener('click', () => this.closeModal());
  }

  openCrestCustomizerModal() {
    if (!stateManager.state.crest) {
      stateManager.state.crest = { shape: 'shield', color: '#c0392b', emblem: '👑' };
    }
    const current = { ...stateManager.state.crest };

    const html = `
      <h2>👑 Wappen des Königreichs gestalten</h2>
      <p class="modal-intro">Gestalte das offizielle Wappen deiner Herrschaft, das auf Banner und Gebäuden präsentiert wird.</p>
      
      <div style="text-align: center; margin: 20px 0;">
        <div id="crest-preview" style="width: 80px; height: 80px; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 2.2rem; background: ${current.color}; border: 3px solid #f1c40f; border-radius: ${current.shape === 'circle' ? '50%' : '12px'}; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
          ${current.emblem}
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div>
          <label style="font-size: 0.8rem; color: #bdc3c7;">Form des Schildes:</label>
          <select id="select-crest-shape" style="width: 100%; padding: 6px; margin-top: 4px; background: rgba(0,0,0,0.4); color: white; border: 1px solid rgba(212,175,55,0.4); border-radius: 4px;">
            <option value="shield" ${current.shape === 'shield' ? 'selected' : ''}>Klassischer Schild 🛡️</option>
            <option value="circle" ${current.shape === 'circle' ? 'selected' : ''}>Runder Schild 🔴</option>
            <option value="square" ${current.shape === 'square' ? 'selected' : ''}>Königlicher Banner 🚩</option>
          </select>
        </div>

        <div>
          <label style="font-size: 0.8rem; color: #bdc3c7;">Hauptfarbe:</label>
          <div style="display: flex; gap: 8px; margin-top: 6px;">
            <button class="color-pick-btn" data-color="#c0392b" style="background: #c0392b; width: 36px; height: 36px; border-radius: 4px; border: 2px solid white; cursor: pointer;"></button>
            <button class="color-pick-btn" data-color="#2980b9" style="background: #2980b9; width: 36px; height: 36px; border-radius: 4px; border: 2px solid white; cursor: pointer;"></button>
            <button class="color-pick-btn" data-color="#27ae60" style="background: #27ae60; width: 36px; height: 36px; border-radius: 4px; border: 2px solid white; cursor: pointer;"></button>
            <button class="color-pick-btn" data-color="#8e44ad" style="background: #8e44ad; width: 36px; height: 36px; border-radius: 4px; border: 2px solid white; cursor: pointer;"></button>
            <button class="color-pick-btn" data-color="#d4af37" style="background: #d4af37; width: 36px; height: 36px; border-radius: 4px; border: 2px solid white; cursor: pointer;"></button>
          </div>
        </div>

        <div>
          <label style="font-size: 0.8rem; color: #bdc3c7;">Symbol / Emblem:</label>
          <div style="display: flex; gap: 8px; margin-top: 6px;">
            ${['👑', '🦁', '⚔️', '🦅', '🏰', '🐉'].map(e => `
              <button class="emblem-pick-btn" data-emblem="${e}" style="width: 36px; height: 36px; border-radius: 4px; background: rgba(255,255,255,0.1); border: 1px solid #d4af37; color: white; font-size: 1.2rem; cursor: pointer;">${e}</button>
            `).join('')}
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button id="btn-save-crest" class="primary-btn" style="flex: 1;">Wappen Speichern</button>
        <button id="btn-close-crest" class="primary-btn" style="flex: 1; border-color: #7f8c8d;">Abbrechen</button>
      </div>
    `;

    this.openModal(html);

    const updatePreview = () => {
      const preview = document.getElementById('crest-preview');
      if (preview) {
        preview.style.background = current.color;
        preview.style.borderRadius = current.shape === 'circle' ? '50%' : '12px';
        preview.textContent = current.emblem;
      }
    };

    document.getElementById('select-crest-shape').addEventListener('change', (e) => {
      current.shape = e.target.value;
      updatePreview();
    });

    document.querySelectorAll('.color-pick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        current.color = e.target.getAttribute('data-color');
        updatePreview();
      });
    });

    document.querySelectorAll('.emblem-pick-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        current.emblem = e.target.getAttribute('data-emblem');
        updatePreview();
      });
    });

    document.getElementById('btn-save-crest').addEventListener('click', () => {
      stateManager.state.crest = current;
      stateManager.save();
      this.showFloatingNotification('Wappen erfolgreich aktualisiert! 👑');
      this.closeModal();
    });

    document.getElementById('btn-close-crest').addEventListener('click', () => this.closeModal());
  }

  openTrophyRoomModal() {
    if (window.gameAchievements && typeof window.gameAchievements.open === 'function') {
      window.gameAchievements.open();
    } else {
      const achievements = [
        { id: 'first_build', title: 'Erster Bau 🏗️', desc: 'Baue dein erstes Gebäude.' },
        { id: 'rich', title: 'Reich 💰', desc: 'Erreiche 10.000 Gold.' },
        { id: 'hero_level_5', title: 'Heldenmeister 🛡️', desc: 'Dein Held erreicht Level 5.' },
        { id: 'dungeon_cleared', title: 'Dungeonspezialist ⚔️', desc: 'Schließe einen Dungeon ab.' },
        { id: 'ai_defeated', title: 'Botschläger 🤖', desc: 'Besiege den KI-Gegner.' }
      ];
      const unlocked = new Set(stateManager.state.achievements || []);

      let html = `
        <h2>🏆 Trophäenraum des Königreichs</h2>
        <p class="modal-intro">Präsentiere deine errungenen Trophäen und ruhmreichen Monumente.</p>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; margin-top: 15px;">
      `;

      achievements.forEach(ach => {
        const isDone = unlocked.has(ach.id);
        html += `
          <div class="glass-card" style="text-align: center; padding: 15px; border-color: ${isDone ? '#f1c40f' : 'rgba(255,255,255,0.1)'}; opacity: ${isDone ? '1' : '0.45'};">
            <div style="font-size: 2.5rem; margin-bottom: 8px;">${isDone ? '🏆' : '🔒'}</div>
            <strong style="font-size: 0.85rem; color: ${isDone ? '#f1c40f' : '#bdc3c7'};">${ach.title}</strong>
            <p style="font-size: 0.72rem; color: #bdc3c7; margin-top: 4px;">${ach.desc}</p>
          </div>
        `;
      });

      html += `
        </div>
        <button id="btn-close-trophies" class="primary-btn" style="width: 100%; margin-top: 15px;">Schließen</button>
      `;

      this.openModal(html);
      document.getElementById('btn-close-trophies').addEventListener('click', () => this.closeModal());
    }
  }
}
