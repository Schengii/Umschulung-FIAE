// --- Empire Classic Initialization & Bootstrap ---

const stateManager = new GameStateManager();
const gameCanvas = new GameCanvas();
const gameUI = new GameUI();

async function init() {
  console.log("Initializing Empire Classic Game...");

  try {
    // 1. Initialize Core State Manager
    await stateManager.init();

    // 2. Initialize UI (Populates DOM elements including minimap-canvas and HUD)
    gameUI.init();

    // 3. Initialize Canvas Renderer
    gameCanvas.init('game-canvas');

    // 4. Safe Feature Modules Instantiation
    if (typeof GameAchievements === 'function' && typeof window.gameAchievements === 'undefined') {
      window.gameAchievements = new GameAchievements(stateManager, gameUI);
      window.GameAchievements = window.gameAchievements;
    }
    if (typeof AIBot === 'function' && typeof window.aiBot === 'undefined') {
      window.aiBot = new AIBot(stateManager, gameUI);
      window.AIBot = window.aiBot;
      window.aiBot.start();
    }
    if (typeof Leaderboard === 'function' && typeof window.leaderboard === 'undefined') {
      window.leaderboard = new Leaderboard(stateManager, gameUI);
      window.Leaderboard = window.leaderboard;
      window.leaderboard.loadScores();
    }
    if (typeof NightCycle === 'function' && typeof window.nightCycle === 'undefined') {
      window.nightCycle = new NightCycle(stateManager, gameUI);
      window.NightCycle = window.nightCycle;
      window.nightCycle.init();
    }
    if (typeof MilestoneEvents === 'function' && typeof window.milestoneEvents === 'undefined') {
      window.milestoneEvents = new MilestoneEvents(stateManager, gameUI);
      window.MilestoneEvents = window.milestoneEvents;
      window.milestoneEvents.init();
    }
    if (typeof VillagerManager === 'function' && typeof window.villagerManager === 'undefined') {
      window.villagerManager = new VillagerManager(stateManager);
      window.villagerManager.init();
    }
    if (typeof VisualTechTree === 'function' && typeof window.visualTechTree === 'undefined') {
      window.visualTechTree = new VisualTechTree(stateManager, gameUI);
    }
    if (typeof InteractiveWorldMap === 'function' && typeof window.interactiveWorldMap === 'undefined') {
      window.interactiveWorldMap = new InteractiveWorldMap(stateManager, gameUI);
    }
    if (typeof SecondaryCastles === 'function' && typeof window.secondaryCastles === 'undefined') {
      window.secondaryCastles = new SecondaryCastles(stateManager, gameUI);
    }
    if (typeof AsyncPvP === 'function' && typeof window.asyncPvP === 'undefined') {
      window.asyncPvP = new AsyncPvP(stateManager, gameUI);
    }
    if (typeof GuildWonders === 'function' && typeof window.guildWonders === 'undefined') {
      window.guildWonders = new GuildWonders(stateManager, gameUI);
    }
    if (typeof HeroTransmutator === 'function' && typeof window.heroTransmutator === 'undefined') {
      window.heroTransmutator = new HeroTransmutator(stateManager, gameUI);
    }
    if (typeof WallLineEditor === 'function' && typeof window.wallLineEditor === 'undefined') {
      window.wallLineEditor = new WallLineEditor(stateManager, gameUI);
    }
    if (typeof DisasterMitigation === 'function' && typeof window.disasterMitigation === 'undefined') {
      window.disasterMitigation = new DisasterMitigation(stateManager, gameUI);
    }
    if (typeof DynastyManager === 'function' && typeof window.dynastyManager === 'undefined') {
      window.dynastyManager = new DynastyManager(stateManager, gameUI);
      window.dynastyManager.init();
    }
    if (typeof TradeFleetManager === 'function' && typeof window.tradeFleetManager === 'undefined') {
      window.tradeFleetManager = new TradeFleetManager(stateManager, gameUI);
      window.tradeFleetManager.init();
    }
    if (typeof DragonMountsManager === 'function' && typeof window.dragonMountsManager === 'undefined') {
      window.dragonMountsManager = new DragonMountsManager(stateManager, gameUI);
      window.dragonMountsManager.init();
    }
    if (typeof ThroneroomDecorator === 'function' && typeof window.throneroomDecorator === 'undefined') {
      window.throneroomDecorator = new ThroneroomDecorator(stateManager, gameUI);
      window.throneroomDecorator.init();
    }
    if (typeof SiegeArtilleryManager === 'function' && typeof window.siegeArtilleryManager === 'undefined') {
      window.siegeArtilleryManager = new SiegeArtilleryManager(stateManager, gameUI);
      window.siegeArtilleryManager.init();
    }
    if (typeof StoryEventsEngine === 'function' && typeof window.storyEventsEngine === 'undefined') {
      window.storyEventsEngine = new StoryEventsEngine(stateManager, gameUI);
    }
    if (typeof JoustingArena === 'function' && typeof window.joustingArena === 'undefined') {
      window.joustingArena = new JoustingArena(stateManager, gameUI);
    }
    if (typeof ScenarioEditor === 'function' && typeof window.scenarioEditor === 'undefined') {
      window.scenarioEditor = new ScenarioEditor(stateManager, gameUI);
    }
    if (typeof RoyalDecreesManager === 'function' && typeof window.royalDecreesManager === 'undefined') {
      window.royalDecreesManager = new RoyalDecreesManager(stateManager, gameUI);
    }
    if (typeof ShipyardManager === 'function' && typeof window.shipyardManager === 'undefined') {
      window.shipyardManager = new ShipyardManager(stateManager, gameUI);
    }
    if (typeof WizardTowerManager === 'function' && typeof window.wizardTowerManager === 'undefined') {
      window.wizardTowerManager = new WizardTowerManager(stateManager, gameUI);
    }
    if (typeof PvPLeagueManager === 'function' && typeof window.pvpLeagueManager === 'undefined') {
      window.pvpLeagueManager = new PvPLeagueManager(stateManager, gameUI);
    }
    if (typeof FogOfWarManager === 'function' && typeof window.fogOfWarManager === 'undefined') {
      window.fogOfWarManager = new FogOfWarManager(stateManager, gameUI);
    }
    if (typeof StoryCampaignManager === 'function' && typeof window.storyCampaignManager === 'undefined') {
      window.storyCampaignManager = new StoryCampaignManager(stateManager, gameUI);
    }

    // 5. Tick loop every second
    setInterval(() => {
      stateManager.tick(1);
    }, 1000);

    // 6. Render loop
    function drawFrame() {
      gameCanvas.draw();
      requestAnimationFrame(drawFrame);
    }
    requestAnimationFrame(drawFrame);

    // 7. Initialize i18n and theme manager
    if (window.i18n && typeof window.i18n.init === 'function') {
      window.i18n.init();
    }
    if (window.ThemeManager && typeof window.ThemeManager.init === 'function') {
      window.ThemeManager.init();
    }

    // 8. Start tutorial if not completed
    if (!localStorage.getItem('empire_tutorial_done')) {
      window.tutorial && window.tutorial.start();
    }

    // 9. Register service worker for PWA
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('service-worker.js')
        .then(() => console.log('Service Worker registered'))
        .catch(err => console.error('SW registration failed', err));
    }
  } catch (err) {
    console.error("Game initialization warning/error:", err);
  } finally {
    // Always remove the loader view smoothly
    const loader = document.querySelector('.initial-loading');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 400);
    }
  }

  console.log("Empire Classic Game successfully running!");
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


