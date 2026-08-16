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
    if (typeof SiegeMinigame === 'function' && typeof window.siegeMinigame === 'undefined') {
      window.siegeMinigame = new SiegeMinigame(stateManager, gameUI, gameCanvas);
      window.SiegeMinigame = window.siegeMinigame;
      window.siegeMinigame.init();
    }
    if (typeof FamiliarManager === 'function' && typeof window.familiarManager === 'undefined') {
      window.familiarManager = new FamiliarManager(stateManager, gameUI);
      window.FamiliarManager = window.familiarManager;
      window.familiarManager.init();
    }
    if (typeof BlueprintMultiUpgradeManager === 'function' && typeof window.blueprintMultiUpgradeManager === 'undefined') {
      window.blueprintMultiUpgradeManager = new BlueprintMultiUpgradeManager(stateManager, gameUI);
      window.BlueprintMultiUpgradeManager = window.blueprintMultiUpgradeManager;
      window.blueprintMultiUpgradeManager.init();
    }
    if (typeof RulerTitleManager === 'function' && typeof window.rulerTitleManager === 'undefined') {
      window.rulerTitleManager = new RulerTitleManager(stateManager, gameUI);
      window.RulerTitleManager = window.rulerTitleManager;
      window.rulerTitleManager.init();
    }
    if (typeof ModManager === 'function' && typeof window.modManager === 'undefined') {
      window.modManager = new ModManager(stateManager, gameUI);
      window.modManager.init();
    }
    if (typeof KeyboardInput === 'function' && typeof window.keyboardInput === 'undefined') {
      window.keyboardInput = new KeyboardInput(gameCanvas, gameUI);
      window.keyboardInput.init();
    }
    if (typeof GamepadInput === 'function' && typeof window.gamepadInput === 'undefined') {
      window.gamepadInput = new GamepadInput(gameCanvas, gameUI);
      window.gamepadInput.init();
    }
    if (typeof OnlineMultiplayer === 'function' && typeof window.onlineMultiplayer === 'undefined') {
      window.onlineMultiplayer = new OnlineMultiplayer(stateManager, gameUI);
      window.onlineMultiplayer.init();
    }
    if (typeof DynastyTree === 'function' && typeof window.dynastyTree === 'undefined') {
      window.dynastyTree = new DynastyTree(stateManager, gameUI);
      window.dynastyTree.init();
    }
    if (typeof MagicParticlesEngine === 'function' && typeof window.magicParticles === 'undefined') {
      window.magicParticles = new MagicParticlesEngine(gameCanvas);
    }
    if (typeof ThreeRenderEngine === 'function' && typeof window.threeRender === 'undefined') {
      window.threeRender = new ThreeRenderEngine(stateManager, gameUI);
      window.threeRender.init();
    }
    if (typeof AdvancedDisastersEngine === 'function' && typeof window.advancedDisasters === 'undefined') {
      window.advancedDisasters = new AdvancedDisastersEngine(stateManager, gameUI);
      window.advancedDisasters.init();
    }
    if (typeof TournamentArenaEngine === 'function' && typeof window.tournamentArena === 'undefined') {
      window.tournamentArena = new TournamentArenaEngine(stateManager, gameUI);
    }
    if (typeof GuildWarsEngine === 'function' && typeof window.guildWars === 'undefined') {
      window.guildWars = new GuildWarsEngine(stateManager, gameUI);
      window.guildWars.init();
    }
    if (typeof VisualMapEditor === 'function' && typeof window.mapEditor === 'undefined') {
      window.mapEditor = new VisualMapEditor(stateManager, gameUI);
    }
    if (typeof StockMarketEngine === 'function' && typeof window.stockMarket === 'undefined') {
      window.stockMarket = new StockMarketEngine(stateManager, gameUI);
      window.stockMarket.init();
    }

    // Initialize Reactive State Proxy
    if (typeof ReactiveState === 'function') {
      window.reactiveState = new ReactiveState(stateManager.state);
      window.reactiveState.bindDom();
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


