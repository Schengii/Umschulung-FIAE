class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');

    // Safe localStorage wrapper to prevent crashes in private mode or if blocked
    this.storage = {
      getItem: (key) => {
        try {
          return localStorage.getItem(key);
        } catch (e) {
          return null;
        }
      },
      setItem: (key, val) => {
        try {
          localStorage.setItem(key, val);
        } catch (e) { }
      }
    };

    this.cellSize = 32;
    this.blocks = [];
    this.foodItems = [];
    this.coins = [];
    this.enemies = [];
    this.projectiles = [];
    this.bossProjectiles = [];
    this.particles = [];
    this.stars = [];

    // Camera
    this.viewY = 0;
    this.targetViewY = 0;
    this.metersClimbed = 0;
    this.score = 0;

    // Screen Shake
    this.shakeIntensity = 0;
    this.shakeDecay = 0.9;
    this.shakeX = 0;
    this.shakeY = 0;

    // Gold & Highscore
    this.goldCollected = parseInt(this.storage.getItem('snake_ascend_gold') || '0');
    this.highscore = parseInt(this.storage.getItem('snake_ascend_highscore') || '0');

    this.gameState = 'MENU';

    // World Theme states
    this.currentTheme = 'neon';
    this.gridColor = 'rgba(189, 0, 255, 0.04)';
    this.starColor = 'hsl(280, 100%, 70%)';

    // Boss battle states
    this.currentLevel = 1;
    this.bossTower = null;
    this.bossMaxHP = 100;
    this.bossHP = 100;
    this.bossFireCooldown = 0;

    // Input pointer
    this.mouseX = 0;
    this.mouseY = 0;
    this.showPreview = false;

    this.cols = 12;

    // Skins & Shop data
    let parsedSkins = ['default'];
    try {
      const stored = this.storage.getItem('snake_ascend_skins');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) parsedSkins = parsed;
      }
    } catch (e) { }
    this.ownedSkins = parsedSkins;
    this.equippedSkin = this.storage.getItem('snake_ascend_equipped_skin') || 'default';
    this.shopItems = [
      { id: 'default', name: 'Neon Grün', cost: 0, color: '#39ff14' },
      { id: 'ruby', name: 'Cyber Rubin', cost: 50, color: '#ff0055' },
      { id: 'gold', name: 'Goldrausch', cost: 100, color: '#ff9d00' },
      { id: 'rainbow', name: 'Regenbogen', cost: 250, color: 'linear-gradient(90deg, red, yellow, green, blue)' }
    ];

    // Pre-game deck editor
    this.selectedDeckCardIds = ['i_block', 'o_block', 't_block', 'spring', 'food'];

    // Session Quests Pool
    this.questsPool = [
      { id: 'meters_80', desc: 'Klettere 80m in einem Run', target: 80, current: 0, reward: 25, type: 'meters', completed: false },
      { id: 'coins_10', desc: 'Sammle 10 Münzen in einem Run', target: 10, current: 0, reward: 20, type: 'coins', completed: false },
      { id: 'boss_1', desc: 'Zerstöre 1 Boss-Turm', target: 1, current: 0, reward: 50, type: 'boss', completed: false },
      { id: 'blocks_8', desc: 'Platziere 8 Blöcke in einem Run', target: 8, current: 0, reward: 15, type: 'blocks', completed: false },
      { id: 'max_len_8', desc: 'Erreiche Schlangenlänge 8', target: 8, current: 0, reward: 30, type: 'length', completed: false }
    ];
    this.activeQuests = [];

    // Guided Tutorial States
    this.isTutorialMode = false;
    this.tutorialStep = 0;

    this.initStars();
    this.generateQuests();
    this.initEvents();
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    // Fix: Pass virtual dimensions to Snake, not High-DPI scaled dimensions
    const virtualWidth = this.canvas.width / (window.devicePixelRatio || 1);
    const virtualHeight = this.canvas.height / (window.devicePixelRatio || 1);
    this.snake = new Snake(virtualWidth, virtualHeight, this.cellSize);
    this.snake.skin = this.equippedSkin;

    this.lastTime = 0;
    this.cannonCooldown = 0;
    requestAnimationFrame((t) => this.loop(t));
  }

  initStars() {
    this.stars = [];
    const w = 480;
    for (let i = 0; i < 40; i++) {
      this.stars.push({
        x: Math.random() * w,
        y: Math.random() * 850,
        radius: Math.random() * 1.5 + 0.5,
        speedFactor: Math.random() * 0.4 + 0.1
      });
    }
  }

  resizeCanvas() {
    const container = document.getElementById('app-container');
    const width = container.clientWidth;
    const height = container.clientHeight;

    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.scale(dpr, dpr);

    this.cellSize = Math.floor(width / this.cols);

    // Fix: Snake receives virtual width and height
    if (this.snake) {
      this.snake.canvasWidth = width;
      this.snake.canvasHeight = height;
      this.snake.cellSize = this.cellSize;
    }
  }

  initEvents() {
    document.getElementById('play-btn').addEventListener('click', () => {
      if (window.gameAudio) {
        window.gameAudio.init();
        if (window.gameAudio.ctx && window.gameAudio.ctx.state === 'suspended') {
          window.gameAudio.ctx.resume();
        }
      }
      const played = this.storage.getItem('snake_ascend_tutorial_played');
      if (played !== 'true') {
        this.startGame(true); // Start in tutorial mode
      } else {
        this.startGame(false);
      }
    });

    document.getElementById('restart-btn').addEventListener('click', () => {
      if (window.gameAudio) {
        window.gameAudio.init();
        if (window.gameAudio.ctx && window.gameAudio.ctx.state === 'suspended') {
          window.gameAudio.ctx.resume();
        }
      }
      this.startGame(false);
    });

    document.getElementById('tutorial-btn').addEventListener('click', () => {
      if (window.gameAudio) {
        window.gameAudio.init();
        if (window.gameAudio.ctx && window.gameAudio.ctx.state === 'suspended') {
          window.gameAudio.ctx.resume();
        }
      }
      this.startGame(true); // Force start in tutorial mode
    });

    // NEU: Event-Listener für den Redraw-Button und Rotate-Button
    const rotateBtn = document.getElementById('rotate-btn');
    if (rotateBtn) {
      rotateBtn.addEventListener('click', () => {
        if (this.gameState === 'PLAYING' || this.gameState === 'BOSS_BATTLE') {
          window.cardSystem.rotateSelectedCard();
        }
      });
    }

    const redrawBtn = document.getElementById('redraw-btn');
    if (redrawBtn) {
      redrawBtn.addEventListener('click', () => {
        window.cardSystem.redrawHand();
        // Optional: Kurzen Sound abspielen, wenn er funktioniert
        if (window.gameAudio && window.cardSystem.redrawCooldown <= 0) {
          window.gameAudio.playPlace();
        }
      });
    }

    // Pause Controls
    const pauseBtn = document.getElementById('pause-btn');
    if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());

    const resumeBtn = document.getElementById('resume-btn');
    if (resumeBtn) resumeBtn.addEventListener('click', () => this.togglePause());

    // Spiel auch mit der Escape-Taste pausieren können, R / Leertaste zum Rotieren
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        this.togglePause();
      } else if ((e.key === 'r' || e.key === 'R' || e.key === ' ' || e.key === 'Spacebar') && (this.gameState === 'PLAYING' || this.gameState === 'BOSS_BATTLE')) {
        if (e.key === ' ') e.preventDefault();
        window.cardSystem.rotateSelectedCard();
      }
    });

    const soundBtn = document.getElementById('sound-btn');
    soundBtn.addEventListener('click', () => {
      if (window.gameAudio) {
        window.gameAudio.init();
        if (window.gameAudio.ctx && window.gameAudio.ctx.state === 'suspended') {
          window.gameAudio.ctx.resume();
        }
      }
      const isMuted = window.gameAudio.toggleMute();
      soundBtn.textContent = isMuted ? '🔇' : '🔊';
    });

    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.getAttribute('data-tab');
        document.getElementById(targetId).classList.add('active');

        if (window.gameAudio) window.gameAudio.playPlace();
      });
    });

    this.renderDeckEditor();
    this.renderShop();
    this.updateGoldIndicator();

    this.canvas.addEventListener('mousemove', (e) => this.updatePointer(e));
    this.canvas.addEventListener('mouseenter', () => this.showPreview = true);
    this.canvas.addEventListener('mouseleave', () => this.showPreview = false);

    this.canvas.addEventListener('mousedown', (e) => {
      this.updatePointer(e);
      this.handlePlacement();
    });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.updatePointer(e.touches[0]);
        this.showPreview = true;
      }
    });
    this.canvas.addEventListener('touchend', (e) => {
      this.handlePlacement();
      this.showPreview = false;
    });
  }

  updatePointer(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
  }

  generateQuests() {
    this.activeQuests = [];
    const poolCopy = JSON.parse(JSON.stringify(this.questsPool));
    for (let i = 0; i < 3; i++) {
      if (poolCopy.length === 0) break;
      const idx = Math.floor(Math.random() * poolCopy.length);
      this.activeQuests.push(poolCopy.splice(idx, 1)[0]);
    }
    this.renderQuestsMenu();
  }

  renderQuestsMenu() {
    const container = document.getElementById('quests-list-container');
    if (!container) return;
    container.innerHTML = '';

    this.activeQuests.forEach(quest => {
      const qEl = document.createElement('div');
      qEl.style.cssText = 'background: rgba(255,255,255,0.05); border: 1px solid var(--border-color); border-radius: 8px; padding: 10px; font-size: 0.85rem;';
      qEl.innerHTML = `
        <div style="font-weight:600; display:flex; justify-content:space-between;">
          <span>${quest.desc}</span>
          <span style="color: var(--neon-orange);">🪙 +${quest.reward}</span>
        </div>
        <div style="font-size:0.75rem; color: var(--text-secondary); margin-top: 4px;">Fortschritt: ${quest.current} / ${quest.target}</div>
      `;
      container.appendChild(qEl);
    });
  }

  updateQuestsHUD() {
    const hudContainer = document.getElementById('quest-hud-list');
    if (!hudContainer) return;
    hudContainer.innerHTML = '';

    this.activeQuests.forEach(quest => {
      const item = document.createElement('div');
      item.style.cssText = 'display:flex; justify-content:space-between; width:100%;';
      const check = quest.completed ? '✅' : `${quest.current}/${quest.target}`;
      item.innerHTML = `
        <span>• ${quest.desc}</span>
        <span style="font-weight:800; color: ${quest.completed ? 'var(--neon-green)' : 'white'};">${check}</span>
      `;
      hudContainer.appendChild(item);
    });
  }

  trackQuestProgress(type, value) {
    this.activeQuests.forEach(quest => {
      if (quest.completed) return;

      if (quest.type === type) {
        if (type === 'meters' || type === 'length') {
          quest.current = Math.max(quest.current, Math.floor(value));
        } else {
          quest.current += value;
        }

        if (quest.current >= quest.target) {
          quest.current = quest.target;
          quest.completed = true;
        }
      }
    });
    this.updateQuestsHUD();
  }

  renderDeckEditor() {
    const grid = document.getElementById('deck-editor-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const allCards = Object.values(window.cardSystem.deckPool);
    allCards.forEach(card => {
      const cardEl = document.createElement('div');
      const isSelected = this.selectedDeckCardIds.includes(card.id);
      cardEl.className = `deck-editor-card ${isSelected ? 'selected' : ''}`;
      cardEl.innerHTML = `
        <span class="card-check">✓</span>
        <div style="font-size: 1.5rem; margin-bottom: 4px;">${card.icon}</div>
        <div style="font-size: 0.6rem; text-align: center; color: var(--text-secondary); text-transform: uppercase;">${card.name}</div>
        <div style="font-size: 0.55rem; color: var(--neon-cyan); margin-top: 2px;">Elixier: ${card.cost}</div>
      `;

      cardEl.addEventListener('click', () => {
        if (isSelected) {
          if (this.selectedDeckCardIds.length > 5) {
            this.selectedDeckCardIds = this.selectedDeckCardIds.filter(id => id !== card.id);
          }
        } else {
          if (this.selectedDeckCardIds.length < 5) {
            this.selectedDeckCardIds.push(card.id);
          } else {
            this.selectedDeckCardIds.shift();
            this.selectedDeckCardIds.push(card.id);
          }
        }
        if (window.gameAudio) window.gameAudio.playPlace();
        this.renderDeckEditor();
      });

      grid.appendChild(cardEl);
    });
  }

  renderShop() {
    const grid = document.getElementById('shop-grid');
    if (!grid) return;
    grid.innerHTML = '';

    this.shopItems.forEach(item => {
      const container = document.createElement('div');
      const isOwned = this.ownedSkins.includes(item.id);
      const isEquipped = this.equippedSkin === item.id;

      container.className = `shop-item ${isEquipped ? 'equipped' : ''}`;

      let buttonHtml = '';
      if (isEquipped) {
        buttonHtml = `<button class="shop-item-btn equipped-btn">AKTIV</button>`;
      } else if (isOwned) {
        buttonHtml = `<button class="shop-item-btn select-btn">AUSWÄHLEN</button>`;
      } else {
        buttonHtml = `<button class="shop-item-btn buy-btn">🪙 ${item.cost}</button>`;
      }

      let bgStyle = `background: ${item.color}`;
      if (item.id === 'rainbow') {
        bgStyle = `background: linear-gradient(135deg, red, yellow, green, blue)`;
      }

      container.innerHTML = `
        <div class="shop-item-preview" style="${bgStyle}"></div>
        <div class="shop-item-name">${item.name}</div>
        ${buttonHtml}
      `;

      const btn = container.querySelector('.shop-item-btn');
      if (btn && !isEquipped) {
        btn.addEventListener('click', () => {
          if (isOwned) {
            this.equippedSkin = item.id;
            this.storage.setItem('snake_ascend_equipped_skin', item.id);
            this.snake.skin = item.id;
            if (window.gameAudio) window.gameAudio.playPlace();
          } else {
            if (this.goldCollected >= item.cost) {
              this.goldCollected -= item.cost;
              this.storage.setItem('snake_ascend_gold', this.goldCollected);
              this.ownedSkins.push(item.id);
              this.storage.setItem('snake_ascend_skins', JSON.stringify(this.ownedSkins));
              this.equippedSkin = item.id;
              this.storage.setItem('snake_ascend_equipped_skin', item.id);
              this.snake.skin = item.id;

              if (window.gameAudio) window.gameAudio.playTowerDestroyed();
            } else {
              if (window.gameAudio) window.gameAudio.playHit();
            }
          }
          this.updateGoldIndicator();
          this.renderShop();
        });
      }

      grid.appendChild(container);
    });
  }

  updateGoldIndicator() {
    const els = document.querySelectorAll('.gold-val');
    els.forEach(el => {
      el.textContent = this.goldCollected;
    });
  }

  triggerScreenShake(intensity) {
    this.shakeIntensity = intensity;
  }

  startGame(isTutorial = false) {
    this.gameState = 'PLAYING';
    this.score = 0;
    this.currentLevel = 1;
    this.metersClimbed = 0;
    this.viewY = 0;
    this.targetViewY = 0;
    this.blocks = [];
    this.foodItems = [];
    this.coins = [];
    this.enemies = [];
    this.projectiles = [];
    this.bossProjectiles = [];
    this.particles = [];
    this.bossTower = null;
    this.cannonCooldown = 0;
    this.bossFireCooldown = 0;

    this.isTutorialMode = isTutorial;
    this.tutorialStep = 0;

    // Reset themes
    this.currentTheme = 'neon';
    this.gridColor = 'rgba(189, 0, 255, 0.04)';
    this.starColor = 'hsl(280, 100%, 70%)';
    if (window.gameAudio) {
      window.gameAudio.setBGMParams(130, 'neon');
      window.gameAudio.startBGM();
    }

    // Reset Quests state
    this.activeQuests.forEach(q => {
      q.current = 0;
      q.completed = false;
    });
    this.updateQuestsHUD();

    window.cardSystem.setPlayerDeck(this.selectedDeckCardIds);

    // Set virtual screen heights correctly
    const virtualHeight = this.canvas.height / (window.devicePixelRatio || 1);
    const virtualWidth = this.canvas.width / (window.devicePixelRatio || 1);

    const groundY = virtualHeight - 200;

    this.blocks.push({
      x: 0,
      y: groundY,
      width: virtualWidth,
      height: 100,
      color: '#2a1a4a'
    });

    this.generateWorldSegment(groundY - 600, groundY);

    this.snake.reset();
    this.snake.skin = this.equippedSkin;
    window.cardSystem.reset();

    // Start menu hide
    const startMenu = document.getElementById('start-menu');
    if (startMenu) {
      startMenu.classList.remove('active');
      startMenu.classList.add('hidden');
    }

    // Game over menu hide
    const gameOverMenu = document.getElementById('game-over-menu');
    if (gameOverMenu) {
      gameOverMenu.classList.remove('active');
      gameOverMenu.classList.add('hidden');
    }

    // HUD overlays show
    const hud = document.getElementById('hud');
    if (hud) {
      hud.classList.remove('hidden');
      hud.classList.add('active');
    }

    const questHud = document.getElementById('quest-hud');
    if (questHud) {
      questHud.classList.remove('hidden');
      questHud.classList.add('active');
    }

    const actionBar = document.getElementById('action-bar');
    if (actionBar) {
      actionBar.classList.remove('hidden');
      actionBar.classList.add('active');
    }

    const bossHud = document.getElementById('boss-hud');
    if (bossHud) {
      bossHud.classList.add('hidden');
      bossHud.classList.remove('active');
    }

    this.updateGoldIndicator();

    const tutBanner = document.getElementById('tutorial-banner');
    if (this.isTutorialMode) {
      this.snake.vx = 0; // Freeze snake
      if (tutBanner) {
        tutBanner.classList.remove('hidden');
        tutBanner.classList.add('active');
        document.getElementById('tutorial-banner-text').textContent = "👉 Klicke zuerst auf eine deiner Block-Karten unten (z.B. den I-Block)!";
      }
    } else {
      if (tutBanner) {
        tutBanner.classList.add('hidden');
        tutBanner.classList.remove('active');
      }
    }
  }

  gameOver() {
    this.gameState = 'GAMEOVER';
    if (window.gameAudio) window.gameAudio.stopBGM();

    // Quest Reward processing
    let questGoldEarned = 0;
    this.activeQuests.forEach(q => {
      if (q.completed) {
        questGoldEarned += q.reward;
      }
    });

    this.goldCollected += questGoldEarned;
    this.storage.setItem('snake_ascend_gold', this.goldCollected);

    if (this.score > this.highscore) {
      this.highscore = this.score;
      this.storage.setItem('snake_ascend_highscore', this.highscore);
    }

    document.getElementById('final-meters').textContent = `${Math.floor(this.metersClimbed)}m`;
    document.getElementById('final-score').textContent = this.score;
    document.getElementById('highscore-val').textContent = this.highscore;

    const hud = document.getElementById('hud');
    if (hud) {
      hud.classList.add('hidden');
      hud.classList.remove('active');
    }

    const questHud = document.getElementById('quest-hud');
    if (questHud) {
      questHud.classList.add('hidden');
      questHud.classList.remove('active');
    }

    const actionBar = document.getElementById('action-bar');
    if (actionBar) {
      actionBar.classList.add('hidden');
      actionBar.classList.remove('active');
    }

    const gameOverMenu = document.getElementById('game-over-menu');
    if (gameOverMenu) {
      gameOverMenu.classList.add('active');
      gameOverMenu.classList.remove('hidden');
    }

    this.generateQuests();
    this.updateGoldIndicator();
  }

  togglePause() {
    // Nur pausieren, wenn wir auch wirklich gerade spielen
    if (this.gameState === 'PLAYING' || this.gameState === 'BOSS_BATTLE') {
      this.previousState = this.gameState; // Merken, wo wir waren!
      this.gameState = 'PAUSED';

      document.getElementById('pause-menu').classList.remove('hidden');
      document.getElementById('pause-menu').classList.add('active');

      // Musik anhalten, falls sie läuft
      if (window.gameAudio) window.gameAudio.stopBGM();

    } else if (this.gameState === 'PAUSED') {
      // Entpausieren
      this.gameState = this.previousState;

      // WICHTIG: Die Zeit zurücksetzen, um Physik-Glitches zu verhindern!
      this.lastTime = performance.now();

      document.getElementById('pause-menu').classList.add('hidden');
      document.getElementById('pause-menu').classList.remove('active');

      // Musik wieder starten, falls sie nicht stummgeschaltet ist
      if (window.gameAudio && !window.gameAudio.muted) window.gameAudio.startBGM();
    }
  }

  generateWorldSegment(fromY, toY) {
    const step = 150;
    const width = this.canvas.width / (window.devicePixelRatio || 1);

    for (let y = toY - step; y > fromY; y -= step) {
      const nextBossY = -this.currentLevel * 3000;
      if (Math.abs(y - nextBossY) < 400) continue;

      const count = Math.random() > 0.6 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const platWidth = this.cellSize * (2 + Math.floor(Math.random() * 3));
        const platHeight = this.cellSize;
        const platX = Math.random() * (width - platWidth);

        const platform = {
          x: platX,
          y: y,
          width: platWidth,
          height: platHeight,
          color: this.currentTheme === 'jungle' ? '#143817' : (this.currentTheme === 'lava' ? '#471407' : '#2a1b4e')
        };
        this.blocks.push(platform);

        const itemRand = Math.random();
        if (itemRand > 0.75) {
          this.foodItems.push({
            x: platX + platWidth / 2,
            y: y - 20,
            radius: 8,
            type: 'apple'
          });
        } else if (itemRand > 0.4) {
          this.coins.push({
            x: platX + platWidth / 2,
            y: y - 20,
            radius: 7,
            collected: false
          });
        }

        // Höhe des Canvas berechnen, um die Meter-Höhe dieser Plattform zu bestimmen
        const h = this.canvas.height / (window.devicePixelRatio || 1);
        const segmentMeters = (h - y) / 30;

        // Spawn Enemies (erst ab einer Höhe von 20 Metern)
        if (segmentMeters > 20 && Math.random() > 0.7) {
          const type = Math.random() > 0.5 ? 'spider' : 'beetle';
          this.enemies.push({
            x: platX + platWidth / 2,
            y: type === 'spider' ? y - 16 : y - 100, // Beetles fly high above
            width: 24,
            height: 24,
            platLeft: platX,
            platRight: platX + platWidth,
            vx: (Math.random() > 0.5 ? 1 : -1) * (type === 'beetle' ? 1.8 : 1.2),
            type: type,
            icon: type === 'spider' ? '🕷️' : '🦟'
          });
        }
      }
    }
  }

  handlePlacement() {
    if (this.gameState !== 'PLAYING' && this.gameState !== 'BOSS_BATTLE') return;

    const selectedCard = window.cardSystem.getSelectedCard();
    if (!selectedCard) return;

    if (window.cardSystem.elixir < selectedCard.cost) return;

    if (selectedCard.specialType === 'freeze') {
      this.freezeSpellEffect();
      window.cardSystem.useSelectedCard();
      this.trackQuestProgress('blocks', 1);
      if (window.gameAudio) window.gameAudio.playPlace();
      return;
    }

    if (selectedCard.specialType === 'shield') {
      this.snake.shieldTimer = 6000;
      window.cardSystem.useSelectedCard();
      this.trackQuestProgress('blocks', 1);
      if (window.gameAudio) window.gameAudio.playPlace();
      this.createParticles(this.snake.x, this.snake.y, '#00f3ff', 12);
      return;
    }

    if (selectedCard.specialType === 'magnet') {
      this.snake.magnetTimer = 6000;
      window.cardSystem.useSelectedCard();
      this.trackQuestProgress('blocks', 1);
      if (window.gameAudio) window.gameAudio.playPlace();
      this.createParticles(this.snake.x, this.snake.y, '#ff9d00', 12);
      return;
    }

    const gridX = Math.floor(this.mouseX / this.cellSize) * this.cellSize;
    const gridY = Math.floor((this.mouseY + this.viewY) / this.cellSize) * this.cellSize;

    const shape = selectedCard.shape;
    const rows = shape.length;
    const cols = shape[0].length;

    const blockWidth = cols * this.cellSize;
    const blockHeight = rows * this.cellSize;

    // Check overlap with Boss Tower
    if (this.bossTower) {
      const boss = this.bossTower;
      if (gridX < boss.x + boss.width &&
          gridX + blockWidth > boss.x &&
          gridY < boss.y + boss.height &&
          gridY + blockHeight > boss.y) {
        return; // Cannot place on boss
      }
    }

    // Check overlap with Snake Head
    const dx = this.snake.x - (gridX + blockWidth / 2);
    const dy = this.snake.y - (gridY + blockHeight / 2);
    if (Math.abs(dx) < blockWidth / 2 + this.snake.radius &&
        Math.abs(dy) < blockHeight / 2 + this.snake.radius) {
      return; // Cannot place directly on snake head
    }

    // Place sub-blocks for each solid cell in the shape
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (shape[r][c] !== 0) {
          const newBlock = {
            x: gridX + c * this.cellSize,
            y: gridY + r * this.cellSize,
            width: this.cellSize,
            height: this.cellSize,
            color: selectedCard.specialType === 'cannon' ? '#ff9d00' : (selectedCard.specialType === 'bomb' ? '#ff2200' : (selectedCard.specialType === 'accel' ? '#00ffcc' : (selectedCard.type === 'special' ? '#ff0055' : '#8800ff'))),
            specialType: selectedCard.specialType || null,
            fuse: selectedCard.specialType === 'bomb' ? 2500 : null
          };
          this.blocks.push(newBlock);
        }
      }
    }

    window.cardSystem.useSelectedCard();
    this.trackQuestProgress('blocks', 1);
    if (window.gameAudio) window.gameAudio.playPlace();

    this.createParticles(gridX + blockWidth / 2, gridY + blockHeight / 2, '#bd00ff', 8);

    if (this.isTutorialMode && this.tutorialStep === 1) {
      this.tutorialStep = 2;
      this.snake.vx = 2.5; // Unfreeze snake!
      const tutText = document.getElementById('tutorial-banner-text');
      if (tutText) tutText.textContent = "🔥 Perfekt! Die Schlange klettert jetzt los. Baue weitere Plattformen, um nach oben zu klettern!";

      this.storage.setItem('snake_ascend_tutorial_played', 'true');

      setTimeout(() => {
        this.isTutorialMode = false;
        const tutBanner = document.getElementById('tutorial-banner');
        if (tutBanner) {
          tutBanner.classList.add('hidden');
          tutBanner.classList.remove('active');
        }
      }, 5000);
    }
  }

  freezeSpellEffect() {
    this.createParticles(this.canvas.width / 2 / (window.devicePixelRatio || 1), (this.canvas.height / 2 + this.viewY) / (window.devicePixelRatio || 1), '#00f3ff', 30);
    this.triggerScreenShake(5);

    this.enemies.forEach(e => e.vx *= 0.2);
    const originalSpeed = this.snake.vx;
    this.snake.vx *= 0.3;

    setTimeout(() => {
      this.enemies.forEach(e => e.vx = Math.sign(e.vx) * (e.type === 'beetle' ? 1.8 : 1.2));
      this.snake.vx = Math.sign(this.snake.vx) * Math.abs(originalSpeed);
    }, 4000);
  }

  explodeBomb(x, y) {
    this.triggerScreenShake(12);
    if (window.gameAudio) window.gameAudio.playTowerDestroyed();
    
    // Create fire/explosion particles
    for (let i = 0; i < 25; i++) {
      const color = Math.random() > 0.5 ? '#ff3300' : (Math.random() > 0.5 ? '#ff9900' : '#ffff00');
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        radius: Math.random() * 5 + 3,
        color: color,
        alpha: 1.0,
        life: 0.8 + Math.random() * 0.4
      });
    }

    // Damage enemies in 150px range
    this.enemies.forEach(e => {
      const dx = e.x - x;
      const dy = e.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        e.defeated = true;
        this.score += 50;
        this.createParticles(e.x, e.y, '#ff0055', 10);
      }
    });

    // Damage boss tower if in 150px range
    if (this.bossTower) {
      const boss = this.bossTower;
      const bossCenterX = boss.x + boss.width / 2;
      const bossCenterY = boss.y + boss.height / 2;
      const dx = bossCenterX - x;
      const dy = bossCenterY - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        this.bossHP = Math.max(0, this.bossHP - 25); // Substantial bomb damage!
        const hpBar = document.getElementById('boss-hp-bar-inner');
        if (hpBar) hpBar.style.width = `${(this.bossHP / this.bossMaxHP) * 100}%`;
      }
    }
  }

  createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: Math.random() * 4 + 2,
        color: color,
        alpha: 1,
        life: 1.0
      });
    }
  }

  spawnBossTower() {
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const bossY = -this.currentLevel * 3000;

    this.bossMaxHP = 50 + this.currentLevel * 50;
    this.bossHP = this.bossMaxHP;

    this.bossTower = {
      x: w / 2 - 80,
      y: bossY - 180,
      width: 160,
      height: 200,
      hp: this.bossHP,
      maxHp: this.bossMaxHP
    };

    this.blocks.push({
      x: w / 2 - 120,
      y: bossY,
      width: 240,
      height: 32,
      color: '#ff0055'
    });

    document.getElementById('boss-hud').classList.remove('hidden');
    this.triggerScreenShake(10);
  }

  loop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const dt = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(dt);
    this.draw();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    if (this.gameState !== 'PLAYING' && this.gameState !== 'BOSS_BATTLE') return;

    // Tutorial step 0: waiting for card selection
    if (this.isTutorialMode && this.tutorialStep === 0) {
      if (window.cardSystem.getSelectedCard() !== null) {
        this.tutorialStep = 1;
        const tutText = document.getElementById('tutorial-banner-text');
        if (tutText) tutText.textContent = "👉 Klicke nun auf das leuchtende Feld im Gitter über der Schlange, um den Block zu platzieren!";
      }
    }

    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);

    // Apply Screen Shake
    if (this.shakeIntensity > 0.1) {
      this.shakeX = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeY = (Math.random() - 0.5) * this.shakeIntensity;
      this.shakeIntensity *= this.shakeDecay;
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
      this.shakeIntensity = 0;
    }

    // Update Snake
    this.snake.update(this.blocks, dt);

    // Particle Trail on movement (Juice!)
    if (Math.abs(this.snake.vy) > 2 || Math.random() > 0.7) {
      this.particles.push({
        x: this.snake.x,
        y: this.snake.y + 6,
        vx: (Math.random() - 0.5) * 1,
        vy: Math.random() * 0.5,
        radius: Math.random() * 2 + 1,
        color: this.snake.getSkinColor(0, this.snake.maxLength),
        alpha: 0.8,
        life: 0.6
      });
    }

    // Update Card Elixir
    window.cardSystem.updateElixir(dt, this.snake.maxLength);

    // Meters Climbed
    const currentMeters = Math.max(0, (h - 120 - this.snake.y) / 30);
    if (currentMeters > this.metersClimbed) {
      this.metersClimbed = currentMeters;
      this.score = Math.floor(this.metersClimbed * 10);
      document.getElementById('meters-val').textContent = `${Math.floor(this.metersClimbed)}m`;
      document.getElementById('score-val').textContent = this.score;
      document.getElementById('length-val').textContent = `🐍 x${this.snake.maxLength}`;

      this.trackQuestProgress('meters', this.metersClimbed);
      this.trackQuestProgress('length', this.snake.maxLength);
    }

    // Startgeschwindigkeit auf sehr langsame 0.6 setzen
    let targetSpeed = Math.min(0.6 + (this.metersClimbed * 0.01), 3.5);
    if (this.snake.speedBoostTimer > 0) {
      targetSpeed *= 2.5;
    }

    if (this.snake.vx !== 0) {
      this.snake.vx = Math.sign(this.snake.vx) * targetSpeed;
    }

    // Update Theme
    let oldTheme = this.currentTheme;
    if (this.metersClimbed < 100) {
      this.currentTheme = 'neon';
      this.gridColor = 'rgba(189, 0, 255, 0.04)';
      this.starColor = 'hsl(280, 100%, 70%)';
    } else if (this.metersClimbed >= 100 && this.metersClimbed < 200) {
      this.currentTheme = 'jungle';
      this.gridColor = 'rgba(57, 255, 20, 0.06)';
      this.starColor = 'hsl(60, 100%, 60%)';
    } else {
      this.currentTheme = 'lava';
      this.gridColor = 'rgba(255, 68, 0, 0.08)';
      this.starColor = 'hsl(15, 100%, 60%)';
    }

    if (oldTheme !== this.currentTheme && window.gameAudio) {
      if (this.currentTheme === 'neon') {
        window.gameAudio.setBGMParams(130, 'neon');
      } else if (this.currentTheme === 'jungle') {
        window.gameAudio.setBGMParams(110, 'jungle');
      } else if (this.currentTheme === 'lava') {
        window.gameAudio.setBGMParams(155, 'lava');
      }
      this.triggerScreenShake(6);
    }

    // Camera follow
    const targetCamY = this.snake.y - h * 0.6;
    this.viewY += (targetCamY - this.viewY) * 0.1;
    if (this.viewY > 0) this.viewY = 0;

    // Fall out of bounds (Sicherheitsnetz)
    if (this.snake.y > this.viewY + h) {
      // Zieht 1 Segment ab (aktiviert standardmäßig 1.5s Unverwundbarkeit)
      this.snake.takeDamage(1);

      // NEU: Wir überschreiben den Timer direkt mit 3000 Millisekunden (3 Sekunden)
      this.snake.invulnerableTimer = 3000;

      this.snake.vy = -15; // Rettungs-Sprung
      this.triggerScreenShake(5);
      this.createParticles(this.snake.x, this.viewY + h, '#00f3ff', 20);
    }

    if (this.snake.maxLength <= 0) {
      this.gameOver();
      return;
    }

    // Spawner top check
    const viewTop = this.viewY;
    if (viewTop - 1000 < this.targetViewY) {
      this.generateWorldSegment(viewTop - 1500, viewTop - 500);
      this.targetViewY = viewTop - 1000;
    }

    // Update block fuse timers (Bombs)
    this.blocks.forEach(block => {
      if (block.fuse !== null && block.fuse !== undefined) {
        block.fuse -= dt;
        if (block.fuse <= 0) {
          block.markedForDeletion = true;
          this.explodeBomb(block.x + block.width / 2, block.y + block.height / 2);
        }
      }
    });

    this.blocks = this.blocks.filter(b => b.y < this.viewY + h + 200 && !b.markedForDeletion);
    this.foodItems = this.foodItems.filter(f => f.y < this.viewY + h + 200 && !f.markedForDeletion);
    this.coins = this.coins.filter(c => c.y < this.viewY + h + 200 && !c.collected);
    this.enemies = this.enemies.filter(e => e.y < this.viewY + h + 200 && !e.defeated);
    this.projectiles = this.projectiles.filter(p => p.y > this.viewY - 100 && !p.hit);
    this.bossProjectiles = this.bossProjectiles.filter(bp => bp.y < this.viewY + h + 100 && !bp.hit);

    // Update Enemies
    this.enemies.forEach(e => {
      e.x += e.vx;
      if (e.x < e.platLeft || e.x > e.platRight) {
        e.vx = -e.vx;
      }
      const dx = this.snake.x - e.x;
      const dy = this.snake.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.snake.radius + 12) {
        this.snake.takeDamage(1);
        this.triggerScreenShake(8);
      }
    });

    // Update Coins
    this.coins.forEach(coin => {
      const dx = this.snake.x - coin.x;
      const dy = this.snake.y - coin.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (this.snake.magnetTimer > 0) {
        coin.x += (this.snake.x - coin.x) * 0.22;
        coin.y += (this.snake.y - coin.y) * 0.22;
      } else if (dist < 100) {
        coin.x += (this.snake.x - coin.x) * 0.15;
        coin.y += (this.snake.y - coin.y) * 0.15;
      }

      if (dist < this.snake.radius + coin.radius) {
        this.goldCollected++;
        coin.collected = true;
        this.updateGoldIndicator();
        this.trackQuestProgress('coins', 1);
        if (window.gameAudio) window.gameAudio.playCoin();
      }
    });

    // Update Food
    this.foodItems.forEach(food => {
      const dx = this.snake.x - food.x;
      const dy = this.snake.y - food.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.snake.radius + food.radius) {
        this.snake.maxLength++;
        food.markedForDeletion = true;
        this.trackQuestProgress('length', this.snake.maxLength);
        if (window.gameAudio) window.gameAudio.playEat();
      }
    });

    // Cannon shooting
    this.cannonCooldown += dt;
    if (this.cannonCooldown >= 1500) {
      this.cannonCooldown = 0;
      this.blocks.forEach(block => {
        if (block.specialType === 'cannon') {
          this.projectiles.push({
            x: block.x + block.width / 2,
            y: block.y,
            vy: -8,
            radius: 4,
            hit: false
          });
          if (window.gameAudio) window.gameAudio.playLaser();
        }
      });
    }

    // Update lasers
    this.projectiles.forEach(p => {
      p.y += p.vy;
      if (this.bossTower) {
        const boss = this.bossTower;
        if (p.x > boss.x && p.x < boss.x + boss.width && p.y > boss.y && p.y < boss.y + boss.height) {
          this.bossHP = Math.max(0, this.bossHP - 4);
          p.hit = true;
          this.createParticles(p.x, p.y, '#ff007f', 6);
          const hpBar = document.getElementById('boss-hp-bar-inner');
          if (hpBar) hpBar.style.width = `${(this.bossHP / this.bossMaxHP) * 100}%`;
        }
      }
      this.enemies.forEach(e => {
        const dx = p.x - e.x;
        const dy = p.y - e.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < e.width / 2) {
          e.defeated = true;
          p.hit = true;
          this.score += 50;
          this.createParticles(e.x, e.y, '#ff0055', 10);
          if (window.gameAudio) window.gameAudio.playHit();
        }
      });
    });

    // Boss Spawn Check
    const nextBossY = -this.currentLevel * 3000;
    if (!this.bossTower && this.snake.y < nextBossY + 600) {
      this.spawnBossTower();
      this.gameState = 'BOSS_BATTLE';
    }

    // Boss Battle update
    if (this.gameState === 'BOSS_BATTLE' && this.bossTower) {
      const boss = this.bossTower;

      this.bossFireCooldown += dt;
      if (this.bossFireCooldown >= 2000) {
        this.bossFireCooldown = 0;

        const startX = boss.x + boss.width / 2;
        const startY = boss.y + boss.height / 2;
        const dx = this.snake.x - startX;
        const dy = this.snake.y - startY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const speed = 3.2;
        this.bossProjectiles.push({
          x: startX,
          y: startY,
          vx: (dx / dist) * speed,
          vy: (dy / dist) * speed,
          radius: 8,
          hit: false
        });
        if (window.gameAudio) window.gameAudio.playLaser();
      }

      // Update Boss Projectiles
      this.bossProjectiles.forEach(bp => {
        bp.x += bp.vx;
        bp.y += bp.vy;

        // Collide with Snake
        const dx = this.snake.x - bp.x;
        const dy = this.snake.y - bp.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.snake.radius + bp.radius) {
          this.snake.takeDamage(1);
          bp.hit = true;
          this.triggerScreenShake(8);
        }

        // Collide with placed blocks
        this.blocks.forEach(block => {
          if (bp.x > block.x && bp.x < block.x + block.width && bp.y > block.y && bp.y < block.y + block.height) {
            bp.hit = true;
            this.createParticles(bp.x, bp.y, '#ff9d00', 8);
            if (window.gameAudio) window.gameAudio.playHit();
          }
        });
      });

      // Passive melee attack
      const dx = this.snake.x - (boss.x + boss.width / 2);
      const dy = this.snake.y - (boss.y + boss.height / 2);
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 180) {
        if (Math.random() > 0.85) {
          this.bossHP = Math.max(0, this.bossHP - 2);
          this.createParticles(boss.x + Math.random() * boss.width, boss.y + Math.random() * boss.height, '#ff9d00', 4);
          this.lastMeleeAttackTime = Date.now();
          const hpBar = document.getElementById('boss-hp-bar-inner');
          if (hpBar) hpBar.style.width = `${(this.bossHP / this.bossMaxHP) * 100}%`;
          if (window.gameAudio) window.gameAudio.playHit();
        }
      }

      if (this.bossHP <= 0) {
        if (window.gameAudio) window.gameAudio.playTowerDestroyed();
        this.createParticles(boss.x + boss.width / 2, boss.y + boss.height / 2, '#ff007f', 40);
        this.triggerScreenShake(15);
        this.bossTower = null;
        this.currentLevel++;
        this.gameState = 'PLAYING';
        document.getElementById('boss-hud').classList.add('hidden');
        this.score += 500;
        this.trackQuestProgress('boss', 1);
      }
    }

    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;
      p.life -= 0.02;
    });
    this.particles = this.particles.filter(p => p.life > 0);
  }

  draw() {
    const w = this.canvas.width / (window.devicePixelRatio || 1);
    const h = this.canvas.height / (window.devicePixelRatio || 1);

    this.ctx.clearRect(0, 0, w, h);

    this.ctx.save();
    this.ctx.translate(this.shakeX, this.shakeY);

    // Stars
    this.ctx.fillStyle = this.starColor;
    this.stars.forEach(star => {
      const starY = (star.y - this.viewY * star.speedFactor) % h;
      this.ctx.globalAlpha = 0.5;
      this.ctx.beginPath();
      this.ctx.arc(star.x, starY, star.radius, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalAlpha = 1.0;

    // Grid lines
    this.ctx.strokeStyle = this.gridColor;
    this.ctx.lineWidth = 1;
    for (let x = 0; x < w; x += this.cellSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, h);
      this.ctx.stroke();
    }
    const offsetGridY = -this.viewY % this.cellSize;
    for (let y = offsetGridY; y < h; y += this.cellSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(w, y);
      this.ctx.stroke();
    }

    // Coins
    this.coins.forEach(coin => {
      this.ctx.beginPath();
      this.ctx.arc(coin.x, coin.y - this.viewY, coin.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ff9d00';
      this.ctx.shadowColor = '#ff9d00';
      this.ctx.shadowBlur = 8;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });

    // Food
    this.foodItems.forEach(food => {
      this.ctx.beginPath();
      this.ctx.arc(food.x, food.y - this.viewY, food.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ff0055';
      this.ctx.shadowColor = '#ff0055';
      this.ctx.shadowBlur = 10;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });

    // Blocks
    this.blocks.forEach(block => {
      let color = block.color;
      if (block.specialType === 'bomb' && block.fuse !== null && block.fuse !== undefined) {
        const blinkRate = block.fuse > 1000 ? 300 : 100;
        if (Math.floor(block.fuse / blinkRate) % 2 === 0) {
          color = '#ff9d00';
        } else {
          color = '#ff0033';
        }
      }
      this.ctx.fillStyle = color;
      this.ctx.fillRect(block.x, block.y - this.viewY, block.width, block.height);

      this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(block.x, block.y - this.viewY, block.width, block.height);

      if (block.specialType === 'spring') {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Outfit';
        this.ctx.fillText('🌀', block.x + block.width / 2 - 8, block.y - this.viewY + 22);
      } else if (block.specialType === 'food') {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Outfit';
        this.ctx.fillText('🍎', block.x + block.width / 2 - 8, block.y - this.viewY + 22);
      } else if (block.specialType === 'cannon') {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Outfit';
        this.ctx.fillText('🔫', block.x + block.width / 2 - 8, block.y - this.viewY + 22);
      } else if (block.specialType === 'bomb') {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Outfit';
        this.ctx.fillText('💣', block.x + block.width / 2 - 8, block.y - this.viewY + 22);
      } else if (block.specialType === 'accel') {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Outfit';
        this.ctx.fillText('⚡', block.x + block.width / 2 - 8, block.y - this.viewY + 22);
      }
    });

    // Projectiles
    this.projectiles.forEach(p => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y - this.viewY, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = '#00f3ff';
      this.ctx.shadowColor = '#00f3ff';
      this.ctx.shadowBlur = 10;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });

    // Boss Fireballs
    this.bossProjectiles.forEach(bp => {
      this.ctx.beginPath();
      this.ctx.arc(bp.x, bp.y - this.viewY, bp.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ff6c00';
      this.ctx.shadowColor = '#ff3300';
      this.ctx.shadowBlur = 12;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });

    // Enemies
    this.enemies.forEach(e => {
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '20px Outfit';
      this.ctx.fillText(e.icon, e.x - 10, e.y - this.viewY + 8);
    });

    // Boss Tower
    if (this.bossTower) {
      const boss = this.bossTower;
      const screenY = boss.y - this.viewY;

      this.ctx.fillStyle = '#1e0524';
      this.ctx.fillRect(boss.x, screenY, boss.width, boss.height);

      this.ctx.strokeStyle = '#ff007f';
      this.ctx.lineWidth = 4;
      this.ctx.strokeRect(boss.x, screenY, boss.width, boss.height);

      this.ctx.fillStyle = '#3a0c45';
      this.ctx.fillRect(boss.x - 10, screenY - 20, boss.width + 20, 30);
      this.ctx.strokeRect(boss.x - 10, screenY - 20, boss.width + 20, 30);

      this.ctx.fillStyle = '#ff007f';
      this.ctx.shadowColor = '#ff007f';
      this.ctx.shadowBlur = 20;
      this.ctx.beginPath();
      this.ctx.arc(boss.x + boss.width / 2, screenY + boss.height / 2, 30, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    }

    // Snake
    if (this.snake) {
      this.snake.draw(this.ctx, this.viewY);

      // Magnet ring effect
      if (this.snake.magnetTimer > 0) {
        this.ctx.save();
        this.ctx.beginPath();
        const headIdx = 0;
        const pos = this.snake.segments[headIdx];
        if (pos) {
          const pulseRadius = this.snake.radius + 15 + Math.sin(Date.now() / 80) * 5;
          this.ctx.arc(pos.x, pos.y - this.viewY, pulseRadius, 0, Math.PI * 2);
          this.ctx.strokeStyle = 'rgba(255, 157, 0, 0.5)';
          this.ctx.lineWidth = 2.5;
          this.ctx.shadowColor = '#ff9d00';
          this.ctx.shadowBlur = 12;
          this.ctx.stroke();
        }
        this.ctx.restore();
      }
    }

    // Boss melee lightning attack visual
    if (this.bossTower && this.lastMeleeAttackTime && Date.now() - this.lastMeleeAttackTime < 150) {
      const boss = this.bossTower;
      const head = this.snake.segments[0];
      if (head) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.moveTo(head.x, head.y - this.viewY);
        
        // Draw a jagged lightning line
        const startX = head.x;
        const startY = head.y - this.viewY;
        const targetX = boss.x + boss.width / 2;
        const targetY = boss.y + boss.height / 2 - this.viewY;
        
        const steps = 5;
        for (let i = 1; i <= steps; i++) {
          const t = i / steps;
          const px = startX + (targetX - startX) * t + (Math.random() - 0.5) * 20;
          const py = startY + (targetY - startY) * t + (Math.random() - 0.5) * 20;
          this.ctx.lineTo(px, py);
        }
        
        this.ctx.strokeStyle = '#00f3ff';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = '#00f3ff';
        this.ctx.shadowBlur = 15;
        this.ctx.stroke();
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        this.ctx.restore();
      }
    }

    // Particles
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y - this.viewY, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.fill();
      this.ctx.restore();
    });

    // Placement Preview
    const selectedCard = window.cardSystem.getSelectedCard();
    if (this.showPreview && selectedCard && (this.gameState === 'PLAYING' || this.gameState === 'BOSS_BATTLE')) {
      const shape = selectedCard.shape;
      if (shape) {
        const rows = shape.length;
        const cols = shape[0].length;

        const gridX = Math.floor(this.mouseX / this.cellSize) * this.cellSize;
        const gridY = Math.floor((this.mouseY + this.viewY) / this.cellSize) * this.cellSize;

        this.ctx.fillStyle = 'rgba(57, 255, 20, 0.3)';
        this.ctx.strokeStyle = '#39ff14';
        this.ctx.lineWidth = 2;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (shape[r][c] !== 0) {
              const x = gridX + c * this.cellSize;
              const y = gridY + r * this.cellSize - this.viewY;
              this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
              this.ctx.strokeRect(x, y, this.cellSize, this.cellSize);
            }
          }
        }
      }
    }

    this.ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.gameEngine = new Game();
});
