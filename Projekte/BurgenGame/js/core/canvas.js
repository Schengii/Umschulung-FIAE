// --- ISOMETRIC CANVAS RENDERER ---

const VIEWS = {
  CASTLE: 'castle',
  WORLD_MAP: 'world_map'
};

class GameCanvas {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.view = VIEWS.CASTLE;

    // Camera
    this.offset = { x: 0, y: 0 };
    this.zoom = 1.0;
    this.minZoom = 0.5;
    this.maxZoom = 2.0;

    // Isometric settings
    this.tileWidth = 120;
    this.tileHeight = 60;
    this.gridSize = MAP_SIZE;

    // Mouse Drag / States
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.hoveredCell = { x: -1, y: -1 };
    this.selectedBuildingId = null;
    this.placementMode = null;
    this.relocationMode = null;
    this.hoveredNpcId = null;
    this.hoveredOutpostId = null;

    this.particles = [];
    this.npcs = [];
    this.floatingTexts = [];
    this.lastProdFloatTime = Date.now();
    this.animationTime = 0;

    // Offscreen Canvas Cache
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');
    this.offscreenCanvas.width = 2000;
    this.offscreenCanvas.height = 1000;
    this.offscreenCacheDirty = true;
    this.cachedSeasonIndex = -1;

    // Sprite loading for 3D buildings
    this.sprites = {};
    const spriteNames = ['keep', 'woodcutter', 'quarry', 'farm', 'barracks', 'tavern'];
    spriteNames.forEach(name => {
      const img = new Image();
      img.src = `assets/buildings/${name}.png`;
      img.onload = () => {
        this.sprites[name] = img;
      };
    });
  }

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');

    this.resize();
    this.centerCamera();
    this.spawnNPCs();

    window.addEventListener('resize', () => this.resize());
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
    this.canvas.addEventListener('mouseleave', () => this.handleMouseLeave());
    this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
    this.canvas.addEventListener('click', (e) => this.handleClick(e));

    // Touch support (Drag-Pan & Pinch-to-Zoom)
    let touchStartDist = 0;
    let touchStartZoom = 1.0;
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.dragStart = { x: e.touches[0].clientX - this.offset.x, y: e.touches[0].clientY - this.offset.y };
      } else if (e.touches.length === 2) {
        this.isDragging = false;
        touchStartDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        touchStartZoom = this.zoom;
      }
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && this.isDragging) {
        this.offset.x = e.touches[0].clientX - this.dragStart.x;
        this.offset.y = e.touches[0].clientY - this.dragStart.y;
      } else if (e.touches.length === 2 && touchStartDist > 0) {
        const dist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
        const scale = dist / touchStartDist;
        this.zoom = Math.min(this.maxZoom, Math.max(this.minZoom, touchStartZoom * scale));
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => {
      this.isDragging = false;
      touchStartDist = 0;
    }, { passive: true });


    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.placementMode) {
          this.exitPlacementMode();
          gameUI.showFloatingNotification('Bauplatzierung abgebrochen.');
        }
        if (this.relocationMode) {
          this.relocationMode = null;
          gameUI.showFloatingNotification('Verschieben abgebrochen.');
        }
      }
    });

    stateManager.addListener((state, changeType) => {
      if (changeType === 'construction_complete' || changeType === 'outpost_construction_complete') {
        this.spawnCompletionSparks();
        if (window.gameSound) window.gameSound.playSFX('upgrade');
      }
      if (changeType === 'taxes_collected') {
        const taxHouse = state.buildings.find(b => b.type === BUILDING_TYPES.TAX_HOUSE);
        if (taxHouse) {
          const screenPos = this.isoToScreen(taxHouse.x + 0.5, taxHouse.y + 0.5);
          this.spawnFloatingText("+ Gold 💰", screenPos.x, screenPos.y - 30 * this.zoom, '#f1c40f');
        }
      }
    });

    this.sparkedBuildings = new Set();
    if (stateManager.state && stateManager.state.buildings) {
      stateManager.state.buildings.forEach(b => {
        if (!b.underConstruction) this.sparkedBuildings.add(b.id);
      });
    }

    this.spawnNPCs();

    // Initialize Minimap
    this.minimapCanvas = document.getElementById('minimap-canvas');
    if (this.minimapCanvas) {
      this.minimapCtx = this.minimapCanvas.getContext('2d');
      this.minimapCanvas.addEventListener('mousedown', (e) => this.handleMinimapClick(e));
      this.minimapCanvas.addEventListener('mousemove', (e) => {
        if (e.buttons === 1) this.handleMinimapClick(e);
      });
    }
  }

  setView(view) {
    this.view = view;
    this.selectedBuildingId = null;
    this.placementMode = null;
    this.relocationMode = null;
    this.centerCamera();
  }

  enterPlacementMode(buildingType) {
    this.placementMode = { type: buildingType };
    this.selectedBuildingId = null;
  }

  exitPlacementMode() {
    this.placementMode = null;
  }

  resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement;
    const rect = parent ? parent.getBoundingClientRect() : null;
    const w = (rect && rect.width > 0) ? rect.width : window.innerWidth;
    const h = (rect && rect.height > 0) ? rect.height : window.innerHeight;
    this.canvas.width = w;
    this.canvas.height = h;
  }


  centerCamera() {
    if (!this.canvas) return;
    if (this.view === VIEWS.CASTLE) {
      this.offset.x = this.canvas.width / 2;
      this.offset.y = this.canvas.height / 4;
      this.zoom = 1.0;
    } else {
      this.offset.x = (this.canvas.width - WORLD_MAP_CONFIG.width) / 2;
      this.offset.y = (this.canvas.height - WORLD_MAP_CONFIG.height) / 2;
      this.zoom = 1.0;
    }
  }

  isoToScreen(gridX, gridY) {
    const screenX = (gridX - gridY) * (this.tileWidth / 2) * this.zoom + this.offset.x;
    const screenY = (gridX + gridY) * (this.tileHeight / 2) * this.zoom + this.offset.y;
    return { x: screenX, y: screenY };
  }

  screenToIso(screenX, screenY) {
    const dx = (screenX - this.offset.x) / this.zoom;
    const dy = (screenY - this.offset.y) / this.zoom;
    const gridX = (dx / (this.tileWidth / 2) + dy / (this.tileHeight / 2)) / 2;
    const gridY = (dy / (this.tileHeight / 2) - dx / (this.tileWidth / 2)) / 2;
    return { x: Math.floor(gridX), y: Math.floor(gridY) };
  }

  handleMouseDown(e) {
    this.isDragging = true;
    this.dragStart.x = e.clientX - this.offset.x;
    this.dragStart.y = e.clientY - this.offset.y;
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    this.mouseX = mouseX;
    this.mouseY = mouseY;

    if (this.isDragging) {
      this.offset.x = e.clientX - this.dragStart.x;
      this.offset.y = e.clientY - this.dragStart.y;
    } else {
      if (this.view === VIEWS.CASTLE) {
        this.hoveredCell = this.screenToIso(mouseX, mouseY);
      } else {
        this.hoveredNpcId = null;
        this.hoveredOutpostId = null;
        const mapX = mouseX - this.offset.x;
        const mapY = mouseY - this.offset.y;
        WORLD_MAP_CONFIG.npcCastles.forEach(npc => {
          if (Math.hypot(npc.x - mapX, npc.y - mapY) < 25) {
            this.hoveredNpcId = npc.id;
          }
        });
        WORLD_MAP_CONFIG.outposts.forEach(op => {
          if (Math.hypot(op.x - mapX, op.y - mapY) < 20) {
            this.hoveredOutpostId = op.id;
          }
        });
      }
    }
  }

  handleMouseUp() {
    this.isDragging = false;
  }

  handleMouseLeave() {
    this.isDragging = false;
    this.hoveredCell = { x: -1, y: -1 };
  }

  handleWheel(e) {
    e.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const nextZoom = Math.min(this.maxZoom, Math.max(this.minZoom, this.zoom * zoomFactor));

    this.offset.x = mouseX - (mouseX - this.offset.x) * (nextZoom / this.zoom);
    this.offset.y = mouseY - (mouseY - this.offset.y) * (nextZoom / this.zoom);
    this.zoom = nextZoom;
  }

  handleClick(e) {
    if (Math.hypot(e.clientX - this.dragStart.x - this.offset.x, e.clientY - this.dragStart.y - this.offset.y) > 5) {
      return;
    }

    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (this.handleUIControlsClick(mouseX, mouseY)) return;

    if (this.view === VIEWS.CASTLE) {
      const cell = this.screenToIso(mouseX, mouseY);

      if (this.placementMode) {
        const type = this.placementMode.type;
        const config = BUILDINGS_CONFIG[type];
        if (this.isPlacementValid(cell.x, cell.y, config.baseWidth, config.baseHeight)) {
          if (stateManager.buildBuilding(type, cell.x, cell.y)) {
            this.placementMode = null;
          }
        }
        return;
      }

      if (this.relocationMode) {
        const bId = this.relocationMode.buildingId;
        const b = stateManager.state.buildings.find(item => item.id === bId);
        if (b) {
          const config = BUILDINGS_CONFIG[b.type];
          if (this.isPlacementValid(cell.x, cell.y, config.baseWidth, config.baseHeight, b.id)) {
            b.x = cell.x;
            b.y = cell.y;
            stateManager.save();
            stateManager.notifyListeners('building_moved');
            this.relocationMode = null;
            gameUI.showFloatingNotification('Gebäude erfolgreich verschoben!');
          }
        }
        return;
      }

      let clickedBuilding = null;
      const sorted = [...stateManager.state.buildings].sort((a, b) => (b.x + b.y) - (a.x + a.y));

      for (const b of sorted) {
        const config = BUILDINGS_CONFIG[b.type];
        if (cell.x >= b.x && cell.x < b.x + config.baseWidth && cell.y >= b.y && cell.y < b.y + config.baseHeight) {
          clickedBuilding = b;
          break;
        }
      }

      if (clickedBuilding) {
        this.selectedBuildingId = clickedBuilding.id;
        window.dispatchEvent(new CustomEvent('building-selected', { detail: clickedBuilding }));
        
        if (window.gameSound) {
          if (clickedBuilding.type === BUILDING_TYPES.WOODCUTTER) {
            window.gameSound.playSFX('wood');
          } else if (clickedBuilding.type === BUILDING_TYPES.QUARRY) {
            window.gameSound.playSFX('stone');
          } else if (clickedBuilding.type === BUILDING_TYPES.BLACKSMITH) {
            window.gameSound.playSFX('blacksmith');
          } else if (clickedBuilding.type === BUILDING_TYPES.TAVERN) {
            window.gameSound.playSFX('tavern');
          } else {
            window.gameSound.playSFX('click');
          }
        }
      } else {
        this.selectedBuildingId = null;
        window.dispatchEvent(new CustomEvent('building-selected', { detail: null }));
        if (window.gameSound) window.gameSound.playSFX('click');
      }
    } else {
      const mapX = mouseX - this.offset.x;
      const mapY = mouseY - this.offset.y;
      let clickedSomething = false;
      WORLD_MAP_CONFIG.npcCastles.forEach(npc => {
        if (Math.hypot(npc.x - mapX, npc.y - mapY) < 25) {
          window.dispatchEvent(new CustomEvent('npc-selected', { detail: npc }));
          clickedSomething = true;
        }
      });
      if (!clickedSomething) {
        WORLD_MAP_CONFIG.outposts.forEach(op => {
          if (Math.hypot(op.x - mapX, op.y - mapY) < 20) {
            window.dispatchEvent(new CustomEvent('outpost-selected', { detail: op }));
          }
        });
      }
    }
  }

  handleUIControlsClick(mouseX, mouseY) {
    const btnW = 32;
    const margin = 10;
    const startX = this.canvas.width - btnW - margin;
    
    if (mouseX >= startX && mouseX <= startX + btnW) {
      if (mouseY >= margin && mouseY <= margin + btnW) {
        this.zoom = Math.min(this.maxZoom, this.zoom * 1.2);
        return true;
      }
      if (mouseY >= margin + btnW + margin && mouseY <= margin + btnW * 2 + margin) {
        this.zoom = Math.max(this.minZoom, this.zoom / 1.2);
        return true;
      }
      if (mouseY >= margin + (btnW + margin) * 2 && mouseY <= margin + (btnW + margin) * 2 + btnW) {
        this.centerCamera();
        return true;
      }
    }
    return false;
  }

  isPlacementValid(x, y, w, h, ignoreBuildingId = null) {
    if (x < 0 || x + w > this.gridSize || y < 0 || y + h > this.gridSize) return false;
    for (const b of stateManager.state.buildings) {
      if (ignoreBuildingId && b.id === ignoreBuildingId) continue;
      const cfg = BUILDINGS_CONFIG[b.type];
      const overlapX = Math.max(0, Math.min(x + w, b.x + cfg.baseWidth) - Math.max(x, b.x));
      const overlapY = Math.max(0, Math.min(y + h, b.y + cfg.baseHeight) - Math.max(y, b.y));
      if (overlapX > 0 && overlapY > 0) return false;
    }
    return true;
  }

  spawnNPCs() {
    for (let i = 0; i < 5; i++) {
      this.npcs.push({
        id: i,
        x: Math.random() * this.gridSize,
        y: Math.random() * this.gridSize,
        targetX: Math.random() * this.gridSize,
        targetY: Math.random() * this.gridSize,
        speed: 0.012,
        type: i % 2 === 0 ? 'peasant' : 'knight',
        bobbing: Math.random() * Math.PI * 2,
        standingTimer: 0
      });
    }
  }

  updateNPCs() {
    this.npcs.forEach(npc => {
      if (npc.standingTimer > 0) {
        npc.standingTimer -= 0.016;
        return;
      }

      npc.bobbing += 0.25;
      const dx = npc.targetX - npc.x;
      const dy = npc.targetY - npc.y;
      const dist = Math.hypot(dx, dy);

      if (dist < 0.15) {
        npc.standingTimer = 2 + Math.random() * 4;
        npc.targetX = Math.random() * this.gridSize;
        npc.targetY = Math.random() * this.gridSize;
      } else {
        npc.x += (dx / dist) * npc.speed;
        npc.y += (dy / dist) * npc.speed;
      }
    });
  }

  drawNPCs() {
    if (this.view !== VIEWS.CASTLE) return;
    const ctx = this.ctx;
    this.npcs.forEach(npc => {
      const pos = this.isoToScreen(npc.x, npc.y);
      const bob = Math.sin(npc.bobbing) * 2 * this.zoom;
      
      ctx.save();
      ctx.translate(pos.x, pos.y - 5 * this.zoom + bob);
      
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(0, 0, 6 * this.zoom, 3 * this.zoom, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Body
      const isKnight = npc.type === 'knight';
      ctx.fillStyle = isKnight ? '#7f8c8d' : '#e67e22';
      ctx.fillRect(-3 * this.zoom, -10 * this.zoom, 6 * this.zoom, 8 * this.zoom);
      
      // Head
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath();
      ctx.arc(0, -12 * this.zoom, 3 * this.zoom, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
    });

    if (window.villagerManager) {
      window.villagerManager.draw(ctx, (gx, gy) => this.isoToScreen(gx, gy), this.zoom);
    }
  }

  spawnSmokeParticle(x, y) {
    this.particles.push({
      type: 'smoke',
      x, y,
      vx: (Math.random() - 0.5) * 0.4,
      vy: -Math.random() * 0.6 - 0.3,
      size: 4 + Math.random() * 4,
      alpha: 1.0,
      decay: 0.018
    });
  }

  spawnRubbleDebris(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2.5 + 1.0;
      this.particles.push({
        type: 'sparkle',
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        gravity: 0.08,
        size: 3 + Math.random() * 4,
        color: '#7f8c8d',
        alpha: 1.0,
        decay: 0.025
      });
      this.spawnSmokeParticle(x + (Math.random() - 0.5) * 15, y + (Math.random() - 0.5) * 15);
    }
  }

  spawnSparkleParticle(x, y) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.6 + 0.6;
      this.particles.push({
        type: 'sparkle',
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.4,
        size: 2.5 + Math.random() * 2.5,
        color: `hsl(${40 + Math.random() * 20}, 100%, 65%)`,
        alpha: 1.0,
        decay: 0.03
      });
    }
  }

  spawnFountainParticle(x, y) {
    const angle = Math.PI * 1.5 + (Math.random() - 0.5) * 0.5;
    const speed = Math.random() * 0.8 + 0.8;
    this.particles.push({
      type: 'water',
      x, y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      gravity: 0.06,
      size: 1.5 + Math.random() * 1.5,
      alpha: 0.8,
      decay: 0.035
    });
  }

  spawnTorchParticle(x, y) {
    this.particles.push({
      type: 'sparkle',
      x, y,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.5 - 0.2,
      size: 2 + Math.random() * 2,
      color: `hsl(${15 + Math.random() * 30}, 100%, 55%)`,
      alpha: 0.9,
      decay: 0.04
    });
  }


  updateParticles() {
    this.particles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) p.vy += p.gravity;
      p.alpha -= p.decay;
      if (p.alpha <= 0) {
        this.particles.splice(idx, 1);
      }
    });
  }

  spawnFloatingText(text, x, y, color = '#ffffff') {
    this.floatingTexts.push({
      text,
      x,
      y,
      vy: -0.8 - Math.random() * 0.4,
      alpha: 1.0,
      decay: 0.015,
      color
    });
  }

  updateFloatingTexts() {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= ft.decay;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  drawFloatingTexts() {
    this.updateFloatingTexts();
    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.font = `bold ${Math.round(14 * this.zoom)}px Arial`;
    this.floatingTexts.forEach(ft => {
      this.ctx.globalAlpha = ft.alpha;
      // Stroke
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 3 * this.zoom;
      this.ctx.strokeText(ft.text, ft.x, ft.y);
      // Fill
      this.ctx.fillStyle = ft.color;
      this.ctx.fillText(ft.text, ft.x, ft.y);
    });
    this.ctx.restore();
  }

  spawnCompletionSparks() {
    if (!stateManager.state) return;
    if (!this.sparkedBuildings) this.sparkedBuildings = new Set();
    stateManager.state.buildings.forEach(b => {
      if (!b.underConstruction && !this.sparkedBuildings.has(b.id)) {
        this.sparkedBuildings.add(b.id);
        const cfg = BUILDINGS_CONFIG[b.type];
        const w = cfg ? cfg.baseWidth : 1;
        const h = cfg ? cfg.baseHeight : 1;
        const screenPos = this.isoToScreen(b.x + w / 2, b.y + h / 2);
        this.spawnSparkleParticle(screenPos.x, screenPos.y - 20 * this.zoom);
        this.spawnFloatingText("Upgrade Fertig! ✨", screenPos.x, screenPos.y - 45 * this.zoom, '#f1c40f');
      }
    });
  }

  getHoveredBuilding() {
    if (this.view !== VIEWS.CASTLE || !this.hoveredCell || this.hoveredCell.x < 0 || this.hoveredCell.y < 0 || !stateManager.state) return null;
    return stateManager.state.buildings.find(b => {
      const config = BUILDINGS_CONFIG[b.type];
      if (!config) return false;
      const w = config.baseWidth;
      const h = config.baseHeight;
      return (this.hoveredCell.x >= b.x && this.hoveredCell.x < b.x + w &&
              this.hoveredCell.y >= b.y && this.hoveredCell.y < b.y + h);
    });
  }

  drawHoverTooltip() {
    if (this.placementMode || this.relocationMode) return;
    const b = this.getHoveredBuilding();
    if (!b) return;

    const config = BUILDINGS_CONFIG[b.type];
    if (!config) return;

    const ctx = this.ctx;
    ctx.save();

    // Box dimensions
    const boxW = 220;
    const boxH = 120;
    
    // Position near mouse
    let bx = this.mouseX + 15;
    let by = this.mouseY + 15;

    // Constrain to canvas
    if (bx + boxW > this.canvas.width) bx = this.mouseX - boxW - 15;
    if (by + boxH > this.canvas.height) by = this.mouseY - boxH - 15;
    if (bx < 10) bx = 10;
    if (by < 10) by = 10;

    // Glassmorphism Box Background
    ctx.fillStyle = 'rgba(25, 27, 36, 0.85)';
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1.5;
    
    // Rounded corner box
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(bx, by, boxW, boxH, 8);
    } else {
      ctx.rect(bx, by, boxW, boxH);
    }
    ctx.fill();
    ctx.stroke();

    // Content
    ctx.fillStyle = '#f1c40f';
    ctx.font = "bold 13px 'Cinzel', serif";
    ctx.textAlign = 'left';
    ctx.fillText(`${config.name} (Lvl ${b.level})`, bx + 12, by + 22);

    ctx.fillStyle = '#bdc3c7';
    ctx.font = '10px Arial';
    // Word wrapping description
    const desc = config.description || '';
    const words = desc.split(' ');
    let line = '';
    let yOffset = by + 36;
    for (let i = 0; i < words.length; i++) {
      let testLine = line + words[i] + ' ';
      let metrics = ctx.measureText(testLine);
      if (metrics.width > boxW - 24 && i > 0) {
        ctx.fillText(line, bx + 12, yOffset);
        line = words[i] + ' ';
        yOffset += 12;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, bx + 12, yOffset);

    // Production info or other stats
    yOffset += 16;
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(bx + 10, yOffset - 8);
    ctx.lineTo(bx + boxW - 10, yOffset - 8);
    ctx.stroke();

    const lvlCfg = config.levels[b.level];
    if (lvlCfg) {
      ctx.fillStyle = '#2ecc71';
      ctx.font = 'bold 10px Arial';
      if (lvlCfg.production) {
        let prodText = 'Prod: ';
        Object.keys(lvlCfg.production).forEach(res => {
          prodText += `+${lvlCfg.production[res]} ${res.toUpperCase()}/Min  `;
        });
        ctx.fillText(prodText, bx + 12, yOffset);
      } else if (lvlCfg.defenseBonus) {
        ctx.fillText(`Mauerbonus: +${Math.round(lvlCfg.defenseBonus * 100)}%`, bx + 12, yOffset);
      } else if (lvlCfg.maxSpies) {
        ctx.fillText(`Max. Spione: ${lvlCfg.maxSpies}`, bx + 12, yOffset);
      } else {
        ctx.fillText('Funktionsbereit', bx + 12, yOffset);
      }

      // Next level upgrade preview
      const nextLvlCfg = config.levels[b.level + 1];
      if (nextLvlCfg) {
        ctx.fillStyle = '#e67e22';
        ctx.font = '9px Arial';
        ctx.fillText('Klicke zum Interagieren/Aufwerten', bx + 12, yOffset + 14);
      } else {
        ctx.fillStyle = '#95a5a6';
        ctx.font = '9px Arial';
        ctx.fillText('Maximale Stufe erreicht', bx + 12, yOffset + 14);
      }
    }

    ctx.restore();
  }

  draw() {
    if (!this.ctx) return;
    this.animationTime += 0.016;

    this.ctx.fillStyle = this.view === VIEWS.CASTLE ? '#0f1115' : '#221e17';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.view === VIEWS.CASTLE) {
      this.drawCastleView();

      // Periodic production floating text
      const now = Date.now();
      if (now - this.lastProdFloatTime > 12000) {
        this.lastProdFloatTime = now;
        if (stateManager.state && stateManager.state.buildings) {
          stateManager.state.buildings.forEach(b => {
            if (b.underConstruction) return;
            const config = BUILDINGS_CONFIG[b.type];
            if (!config) return;
            const lvlCfg = config.levels[b.level];
            if (lvlCfg && lvlCfg.production) {
              const w = config.baseWidth;
              const h = config.baseHeight;
              const screenPos = this.isoToScreen(b.x + w / 2, b.y + h / 2);
              Object.keys(lvlCfg.production).forEach((res, idx) => {
                const val = lvlCfg.production[res];
                const colors = {
                  wood: '#a0522d',
                  stone: '#bdc3c7',
                  food: '#2ecc71',
                  iron_ore: '#e74c3c',
                  iron: '#95a5a6',
                  weapons: '#e74c3c',
                  flour: '#ffffff',
                  bread: '#f5deb3'
                };
                setTimeout(() => {
                  this.spawnFloatingText(`+${val} ${res.toUpperCase()}`, screenPos.x, screenPos.y - 15 * this.zoom - (idx * 14), colors[res] || '#ffffff');
                }, idx * 250);
              });
            }
          });
        }
      }
      this.updateNPCs();
      this.drawNPCs();
    } else {
      this.drawWorldMapView();
    }
    this.drawSeasonalWeather();

    this.drawFloatingTexts();
    this.drawHoverTooltip();

    if (this.view === VIEWS.CASTLE) {
      document.getElementById('minimap-panel')?.classList.remove('hidden');
      this.drawMinimap();
    } else {
      document.getElementById('minimap-panel')?.classList.add('hidden');
    }
  }

  handleMinimapClick(e) {
    if (!this.minimapCanvas) return;
    const rect = this.minimapCanvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    const cellSize = this.minimapCanvas.width / this.gridSize;
    const targetX = Math.floor(mx / cellSize);
    const targetY = Math.floor(my / cellSize);
    
    if (targetX >= 0 && targetX < this.gridSize && targetY >= 0 && targetY < this.gridSize) {
      this.offset.x = this.canvas.width / 2 - (targetX - targetY) * (this.tileWidth / 2) * this.zoom;
      this.offset.y = this.canvas.height / 2 - (targetX + targetY) * (this.tileHeight / 2) * this.zoom;
    }
  }

  drawMinimap() {
    if (!this.minimapCanvas || !this.minimapCtx) return;
    const ctx = this.minimapCtx;
    const cw = this.minimapCanvas.width;
    const ch = this.minimapCanvas.height;
    
    ctx.fillStyle = '#0f1015';
    ctx.fillRect(0, 0, cw, ch);
    
    const cellSize = cw / this.gridSize;
    
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        ctx.fillStyle = (x + y) % 2 === 0 ? '#1b4a2a' : '#1e522e';
        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
    
    if (stateManager.state && stateManager.state.buildings) {
      stateManager.state.buildings.forEach(b => {
        const config = BUILDINGS_CONFIG[b.type];
        if (!config) return;
        
        let color = '#7f8c8d';
        if (b.type === BUILDING_TYPES.KEEP) color = '#d4af37';
        else if (b.type === BUILDING_TYPES.WOODCUTTER) color = '#a0522d';
        else if (b.type === BUILDING_TYPES.QUARRY) color = '#bdc3c7';
        else if (b.type === BUILDING_TYPES.FARM) color = '#f1c40f';
        else if (b.type === BUILDING_TYPES.BARRACKS) color = '#e74c3c';
        else if (b.type === BUILDING_TYPES.WALL) color = '#555';
        else if (b.type === BUILDING_TYPES.TAVERN) color = '#8e2d2d';
        else if (b.type === BUILDING_TYPES.FOUNTAIN) color = '#3498db';
        else if (b.type === BUILDING_TYPES.HOUSE) color = '#e67e22';
        
        ctx.fillStyle = color;
        ctx.fillRect(b.x * cellSize + 0.5, b.y * cellSize + 0.5, config.baseWidth * cellSize - 1, config.baseHeight * cellSize - 1);
      });
    }
    
    const center = this.screenToIso(this.canvas.width / 2, this.canvas.height / 2);
    if (center.x >= 0 && center.x < this.gridSize && center.y >= 0 && center.y < this.gridSize) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      const boxSize = Math.max(2, Math.min(10, 8 / this.zoom));
      ctx.strokeRect((center.x - boxSize/2) * cellSize, (center.y - boxSize/2) * cellSize, boxSize * cellSize, boxSize * cellSize);
      
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(center.x * cellSize + cellSize/2, center.y * cellSize + cellSize/2, 2.5, 0, Math.PI*2);
      ctx.fill();
    }
  }

  drawSeasonalWeather() {
    if (!stateManager.state) return;
    const season = SEASONS_CONFIG[stateManager.state.seasonIndex];
    if (!season) return;

    // Draw season color grading (soft glassmorphism feel)
    this.ctx.fillStyle = season.color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const time = this.animationTime;
    const w = this.canvas.width;
    const h = this.canvas.height;

    if (season.id === 'spring') {
      // Falling pink cherry blossom petals
      this.ctx.fillStyle = 'rgba(255, 182, 193, 0.85)';
      const maxParticles = 40;
      for (let i = 0; i < maxParticles; i++) {
        // Drift rightwards
        const speedX = 1.0 + (i % 3) * 0.5;
        const speedY = 1.5 + (i % 2) * 0.5;
        const px = (i * 37 + time * speedX * 30) % (w + 100) - 50;
        const py = (i * 59 + time * speedY * 30) % h;
        const size = (2 + (i % 3)) * this.zoom;
        const angle = time * (1 + (i % 2)) + i;

        this.ctx.save();
        this.ctx.translate(px, py);
        this.ctx.rotate(angle);
        
        // Draw petal shape
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, size * 1.5, size, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    } else if (season.id === 'summer') {
      // Dynamic diagonal sun rays & summer heat glow
      const gradient = this.ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, 'rgba(255, 235, 150, 0.04)');
      gradient.addColorStop(0.5, 'rgba(255, 220, 100, 0.01)');
      gradient.addColorStop(1, 'rgba(255, 235, 150, 0.04)');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(0, 0, w, h);

      // Sun flares sparkling randomly
      this.ctx.fillStyle = 'rgba(255, 255, 224, 0.2)';
      for (let i = 0; i < 15; i++) {
        const px = (i * 97 + Math.sin(time + i) * 20) % w;
        const py = (i * 43 + Math.cos(time + i) * 20) % h;
        const size = (4 + (i % 4)) * (0.5 + 0.5 * Math.sin(time + i));
        
        this.ctx.beginPath();
        this.ctx.arc(px, py, size * this.zoom, 0, Math.PI * 2);
        this.ctx.fill();
      }
    } else if (season.id === 'autumn') {
      // Falling/wind-blown orange-brown leaves
      const colors = ['rgba(210, 105, 30, 0.8)', 'rgba(184, 134, 11, 0.8)', 'rgba(205, 133, 63, 0.8)', 'rgba(139, 69, 19, 0.8)'];
      const maxParticles = 35;
      for (let i = 0; i < maxParticles; i++) {
        const speedX = 2.0 + (i % 4) * 0.5; // Wind blow!
        const speedY = 1.0 + (i % 3) * 0.3;
        const px = (i * 47 + time * speedX * 30) % (w + 120) - 60;
        const py = (i * 73 + time * speedY * 20) % h;
        const size = (3 + (i % 3)) * this.zoom;
        const angle = time * 0.8 + i;

        this.ctx.save();
        this.ctx.translate(px, py);
        this.ctx.rotate(angle);
        this.ctx.fillStyle = colors[i % colors.length];
        
        // Draw diamond-like leaf shape
        this.ctx.beginPath();
        this.ctx.moveTo(-size, 0);
        this.ctx.quadraticCurveTo(0, -size / 2, size, 0);
        this.ctx.quadraticCurveTo(0, size / 2, -size, 0);
        this.ctx.fill();
        this.ctx.restore();
      }
    } else if (season.id === 'winter') {
      // Fluffy snow particles with sway
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      const maxParticles = 60;
      for (let i = 0; i < maxParticles; i++) {
        const speedY = 1.0 + (i % 3) * 0.4;
        const sway = Math.sin(time + i) * 15;
        const px = (i * 29 + sway + time * 10) % w;
        const py = (i * 53 + time * speedY * 25) % h;
        const size = (1.5 + (i % 3)) * this.zoom;

        this.ctx.beginPath();
        this.ctx.arc(px, py, size, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }
  }

  drawCastleView() {
    this.drawGround();

    if (!stateManager.state || !stateManager.state.buildings) return;

    if (this.placementMode && this.hoveredCell.x >= 0 && this.hoveredCell.x < this.gridSize && this.hoveredCell.y >= 0 && this.hoveredCell.y < this.gridSize) {
      this.drawPlacementHelper();
    }

    if (this.relocationMode && this.hoveredCell.x >= 0 && this.hoveredCell.x < this.gridSize && this.hoveredCell.y >= 0 && this.hoveredCell.y < this.gridSize) {
      this.drawRelocationHelper();
    }

    const sortedBuildings = [...stateManager.state.buildings].sort((a, b) => {
      const aCfg = BUILDINGS_CONFIG[a.type] || { baseWidth: 1, baseHeight: 1 };
      const bCfg = BUILDINGS_CONFIG[b.type] || { baseWidth: 1, baseHeight: 1 };
      return (a.x + aCfg.baseWidth + a.y + aCfg.baseHeight) - (b.x + bCfg.baseWidth + b.y + bCfg.baseHeight);
    });

    this.updateNPCs();
    const drawables = [];

    sortedBuildings.forEach(b => {
      const cfg = BUILDINGS_CONFIG[b.type];
      if (cfg) {
        drawables.push({
          type: 'building',
          depth: b.x + cfg.baseWidth / 2 + b.y + cfg.baseHeight / 2,
          data: b
        });
      }
    });


    this.npcs.forEach(npc => {
      drawables.push({
        type: 'npc',
        depth: npc.x + npc.y,
        data: npc
      });
    });

    drawables.sort((a, b) => a.depth - b.depth);

    drawables.forEach(item => {
      if (item.type === 'building') {
        this.drawBuilding(item.data);
      } else {
        this.drawNPC(item.data);
      }
    });

    this.updateParticles();
    this.particles.forEach(p => {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      if (p.type === 'smoke') {
        this.ctx.fillStyle = 'rgba(150, 150, 150, 0.35)';
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * this.zoom, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.type === 'sparkle') {
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * this.zoom, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.type === 'water') {
        this.ctx.fillStyle = '#3498db';
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size * this.zoom, 0, Math.PI * 2);
        this.ctx.fill();
      }
      this.ctx.restore();
    });

    this.drawUIControls();
  }

  drawGround() {
    for (let x = 0; x < this.gridSize; x++) {
      for (let y = 0; y < this.gridSize; y++) {
        const screen = this.isoToScreen(x, y);

        this.ctx.beginPath();
        this.ctx.moveTo(screen.x, screen.y);
        this.ctx.lineTo(screen.x + (this.tileWidth / 2) * this.zoom, screen.y + (this.tileHeight / 2) * this.zoom);
        this.ctx.lineTo(screen.x, screen.y + this.tileHeight * this.zoom);
        this.ctx.lineTo(screen.x - (this.tileWidth / 2) * this.zoom, screen.y + (this.tileHeight / 2) * this.zoom);
        this.ctx.closePath();

        this.ctx.fillStyle = (x + y) % 2 === 0 ? '#1b4a2a' : '#1e522e';
        this.ctx.fill();

        this.ctx.strokeStyle = '#256538';
        this.ctx.lineWidth = 0.5 * this.zoom;
        this.ctx.stroke();

        if (x === this.hoveredCell.x && y === this.hoveredCell.y && !this.placementMode) {
          this.ctx.fillStyle = 'rgba(212, 175, 55, 0.25)';
          this.ctx.fill();
          this.ctx.strokeStyle = '#d4af37';
          this.ctx.lineWidth = 1.5 * this.zoom;
          this.ctx.stroke();
        }
      }
    }
  }

  drawPlacementHelper() {
    const type = this.placementMode.type;
    const config = BUILDINGS_CONFIG[type];
    const w = config.baseWidth;
    const h = config.baseHeight;
    const startX = this.hoveredCell.x;
    const startY = this.hoveredCell.y;

    const isValid = this.isPlacementValid(startX, startY, w, h);

    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        const x = startX + dx;
        const y = startY + dy;
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
          const screen = this.isoToScreen(x, y);
          this.ctx.beginPath();
          this.ctx.moveTo(screen.x, screen.y);
          this.ctx.lineTo(screen.x + (this.tileWidth / 2) * this.zoom, screen.y + (this.tileHeight / 2) * this.zoom);
          this.ctx.lineTo(screen.x, screen.y + this.tileHeight * this.zoom);
          this.ctx.lineTo(screen.x - (this.tileWidth / 2) * this.zoom, screen.y + (this.tileHeight / 2) * this.zoom);
          this.ctx.closePath();

          this.ctx.fillStyle = isValid ? 'rgba(46, 204, 113, 0.4)' : 'rgba(231, 76, 60, 0.4)';
          this.ctx.fill();
          this.ctx.strokeStyle = isValid ? '#2ecc71' : '#e74c3c';
          this.ctx.lineWidth = 1.5 * this.zoom;
          this.ctx.stroke();
        }
      }
    }
  }

  drawRelocationHelper() {
    const bId = this.relocationMode.buildingId;
    const b = stateManager.state.buildings.find(item => item.id === bId);
    if (!b) return;
    const config = BUILDINGS_CONFIG[b.type];
    const w = config.baseWidth;
    const h = config.baseHeight;
    const startX = this.hoveredCell.x;
    const startY = this.hoveredCell.y;

    const isValid = this.isPlacementValid(startX, startY, w, h, b.id);

    for (let dx = 0; dx < w; dx++) {
      for (let dy = 0; dy < h; dy++) {
        const x = startX + dx;
        const y = startY + dy;
        if (x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize) {
          const screen = this.isoToScreen(x, y);
          this.ctx.beginPath();
          this.ctx.moveTo(screen.x, screen.y);
          this.ctx.lineTo(screen.x + (this.tileWidth / 2) * this.zoom, screen.y + (this.tileHeight / 2) * this.zoom);
          this.ctx.lineTo(screen.x, screen.y + this.tileHeight * this.zoom);
          this.ctx.lineTo(screen.x - (this.tileWidth / 2) * this.zoom, screen.y + (this.tileHeight / 2) * this.zoom);
          this.ctx.closePath();

          this.ctx.fillStyle = isValid ? 'rgba(52, 152, 219, 0.4)' : 'rgba(231, 76, 60, 0.4)';
          this.ctx.fill();
          this.ctx.strokeStyle = isValid ? '#3498db' : '#e74c3c';
          this.ctx.lineWidth = 1.5 * this.zoom;
          this.ctx.stroke();
        }
      }
    }
  }

  getWallNeighbors(x, y) {
    if (!stateManager.state || !stateManager.state.buildings) return { north: false, south: false, west: false, east: false };
    const wallTypes = [BUILDING_TYPES.WALL, BUILDING_TYPES.KEEP];
    const isWallAt = (gx, gy) => {
      if (gx < 0 || gx >= this.gridSize || gy < 0 || gy >= this.gridSize) return false;
      return stateManager.state.buildings.some(b => {
        const cfg = BUILDINGS_CONFIG[b.type];
        const w = cfg ? cfg.baseWidth : 1;
        const h = cfg ? cfg.baseHeight : 1;
        return (gx >= b.x && gx < b.x + w && gy >= b.y && gy < b.y + h && wallTypes.includes(b.type));
      });
    };
    return {
      north: isWallAt(x, y - 1),
      south: isWallAt(x, y + 1),
      west: isWallAt(x - 1, y),
      east: isWallAt(x + 1, y)
    };
  }

  drawBuilding(b) {
    const config = BUILDINGS_CONFIG[b.type];
    const w = config.baseWidth;
    const h = config.baseHeight;

    const pNorth = this.isoToScreen(b.x, b.y);
    const pEast = this.isoToScreen(b.x + w, b.y);
    const pWest = this.isoToScreen(b.x, b.y + h);
    const pSouth = this.isoToScreen(b.x + w, b.y + h);
    const center = this.isoToScreen(b.x + w/2, b.y + h/2);

    this.ctx.save();

    if (b.id === this.selectedBuildingId) {
      this.ctx.beginPath();
      this.ctx.moveTo(pNorth.x, pNorth.y);
      this.ctx.lineTo(pEast.x, pEast.y);
      this.ctx.lineTo(pSouth.x, pSouth.y);
      this.ctx.lineTo(pWest.x, pWest.y);
      this.ctx.closePath();
      this.ctx.strokeStyle = '#d4af37';
      this.ctx.lineWidth = 3 * this.zoom;
      this.ctx.shadowColor = '#d4af37';
      this.ctx.shadowBlur = 8 * this.zoom;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    }

    if (!b.underConstruction) {
      if (b.type === BUILDING_TYPES.WOODCUTTER && Math.random() < 0.05) {
        this.spawnSmokeParticle(center.x + 10 * this.zoom, center.y - 45 * this.zoom);
      }
      if (b.type === BUILDING_TYPES.QUARRY && Math.random() < 0.03) {
        this.spawnSmokeParticle(center.x - 12 * this.zoom, center.y - 12 * this.zoom);
      }
      if (b.type === BUILDING_TYPES.TAVERN && Math.random() < 0.04) {
        this.spawnSmokeParticle(center.x + 6 * this.zoom, center.y - 36 * this.zoom);
      }
      if (b.type === BUILDING_TYPES.FOUNTAIN) {
        for (let i = 0; i < 2; i++) {
          this.spawnFountainParticle(center.x, center.y - 12 * this.zoom);
        }
      }
    }

    const scale = this.zoom;
    const time = this.animationTime;

    switch (b.type) {
      case BUILDING_TYPES.KEEP: {
        this.drawCobbleBase(pNorth, pEast, pSouth, pWest);
        const wallH = (60 + b.level * 15) * scale;
        
        // West side
        this.ctx.fillStyle = '#6e7077';
        this.ctx.strokeStyle = '#393a3f';
        this.ctx.lineWidth = 1.2 * scale;
        this.ctx.beginPath();
        this.ctx.moveTo(pWest.x, pWest.y);
        this.ctx.lineTo(pSouth.x, pSouth.y);
        this.ctx.lineTo(pSouth.x, pSouth.y - wallH);
        this.ctx.lineTo(pWest.x, pWest.y - wallH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // East side (shadow)
        this.ctx.fillStyle = '#55575e';
        this.ctx.beginPath();
        this.ctx.moveTo(pEast.x, pEast.y);
        this.ctx.lineTo(pSouth.x, pSouth.y);
        this.ctx.lineTo(pSouth.x, pSouth.y - wallH);
        this.ctx.lineTo(pEast.x, pEast.y - wallH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.drawBattlements(pWest.x, pWest.y - wallH, pSouth.x, pSouth.y - wallH, pEast.x, pEast.y - wallH, wallH, scale);

        const towerW = 35 * scale;
        const towerH = wallH + 30 * scale;
        this.ctx.fillStyle = '#7a7d85';
        this.ctx.beginPath();
        this.ctx.moveTo(center.x - towerW/2, center.y - wallH);
        this.ctx.lineTo(center.x + towerW/2, center.y - wallH);
        this.ctx.lineTo(center.x + towerW/2, center.y - towerH);
        this.ctx.lineTo(center.x - towerW/2, center.y - towerH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#b23b3b';
        this.ctx.beginPath();
        this.ctx.moveTo(center.x - towerW/2 - 4 * scale, center.y - towerH);
        this.ctx.lineTo(center.x, center.y - towerH - 25 * scale);
        this.ctx.lineTo(center.x + towerW/2 + 4 * scale, center.y - towerH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.drawWavingFlag(center.x, center.y - towerH - 25 * scale, stateManager.state.bannerColor, time, scale);

        const doorW = 20 * scale;
        const doorH = 26 * scale;
        const dx = (pWest.x + pSouth.x) / 2;
        const dy = (pWest.y + pSouth.y) / 2;

        this.ctx.fillStyle = '#5c4033';
        this.ctx.beginPath();
        this.ctx.moveTo(dx - doorW/2, dy);
        this.ctx.lineTo(dx - doorW/2, dy - doorH + 10 * scale);
        this.ctx.quadraticCurveTo(dx, dy - doorH - 4 * scale, dx + doorW/2, dy - doorH + 10 * scale);
        this.ctx.lineTo(dx + doorW/2, dy);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        break;
      }
      case BUILDING_TYPES.WOODCUTTER: {
        const cabinH = 30 * scale;
        this.ctx.fillStyle = '#8e6240';
        this.ctx.strokeStyle = '#4d331f';
        this.ctx.lineWidth = 1 * scale;

        this.ctx.beginPath();
        this.ctx.moveTo(pWest.x, pWest.y);
        this.ctx.lineTo(pSouth.x, pSouth.y);
        this.ctx.lineTo(pSouth.x, pSouth.y - cabinH);
        this.ctx.lineTo(pWest.x, pWest.y - cabinH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#734e32';
        this.ctx.beginPath();
        this.ctx.moveTo(pEast.x, pEast.y);
        this.ctx.lineTo(pSouth.x, pSouth.y);
        this.ctx.lineTo(pSouth.x, pSouth.y - cabinH);
        this.ctx.lineTo(pEast.x, pEast.y - cabinH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#e67e22';
        this.ctx.beginPath();
        this.ctx.moveTo(pWest.x - 4*scale, pWest.y - cabinH);
        this.ctx.lineTo(center.x, center.y - cabinH - 20*scale);
        this.ctx.lineTo(pEast.x + 4*scale, pEast.y - cabinH);
        this.ctx.lineTo(pSouth.x, pSouth.y - cabinH + 4*scale);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#a0522d';
        this.ctx.fillRect(pWest.x + 12*scale, pWest.y - 8*scale, 14*scale, 8*scale);
        this.ctx.strokeRect(pWest.x + 12*scale, pWest.y - 8*scale, 14*scale, 8*scale);
        break;
      }
      case BUILDING_TYPES.QUARRY: {
        this.ctx.fillStyle = '#3a3b3c';
        this.ctx.beginPath();
        this.ctx.moveTo(pNorth.x, pNorth.y);
        this.ctx.lineTo(pEast.x, pEast.y);
        this.ctx.lineTo(pSouth.x, pSouth.y);
        this.ctx.lineTo(pWest.x, pWest.y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.beginPath();
        this.ctx.moveTo(center.x - 14*scale, center.y);
        this.ctx.lineTo(center.x - 4*scale, center.y - 12*scale);
        this.ctx.lineTo(center.x + 6*scale, center.y - 6*scale);
        this.ctx.lineTo(center.x + 14*scale, center.y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.strokeStyle = '#8e6240';
        this.ctx.lineWidth = 3.5 * scale;
        this.ctx.beginPath();
        this.ctx.moveTo(center.x + 10*scale, center.y);
        this.ctx.lineTo(center.x + 10*scale, center.y - 28*scale);
        this.ctx.lineTo(center.x - 8*scale, center.y - 35*scale);
        this.ctx.stroke();

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 0.8 * scale;
        this.ctx.beginPath();
        this.ctx.moveTo(center.x - 8*scale, center.y - 35*scale);
        this.ctx.lineTo(center.x - 8*scale, center.y - 12*scale);
        this.ctx.stroke();
        break;
      }
      case BUILDING_TYPES.FARM: {
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.beginPath();
        this.ctx.moveTo(pNorth.x, pNorth.y);
        this.ctx.lineTo(pEast.x, pEast.y);
        this.ctx.lineTo(pSouth.x, pSouth.y);
        this.ctx.lineTo(pWest.x, pWest.y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        const houseH = 20 * scale;
        const hx = center.x - 15 * scale;
        const hy = center.y + 4 * scale;
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.fillRect(hx, hy - houseH, 18*scale, houseH);
        this.ctx.strokeRect(hx, hy - houseH, 18*scale, houseH);

        this.ctx.fillStyle = '#d35400';
        this.ctx.beginPath();
        this.ctx.moveTo(hx - 2*scale, hy - houseH);
        this.ctx.lineTo(hx + 9*scale, hy - houseH - 10*scale);
        this.ctx.lineTo(hx + 20*scale, hy - houseH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        const wx = center.x + 15 * scale;
        const wy = center.y - 8 * scale;
        const wHeight = 32 * scale;
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.beginPath();
        this.ctx.moveTo(wx - 8*scale, wy);
        this.ctx.lineTo(wx - 4*scale, wy - wHeight);
        this.ctx.lineTo(wx + 4*scale, wy - wHeight);
        this.ctx.lineTo(wx + 8*scale, wy);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1.8 * scale;
        const sailAngleSpeed = time * 1.8;
        const sailLen = 20 * scale;
        for (let i = 0; i < 4; i++) {
          const ang = sailAngleSpeed + (i * Math.PI / 2);
          const ex = wx + Math.cos(ang) * sailLen;
          const ey = wy - wHeight + Math.sin(ang) * sailLen;
          this.ctx.beginPath();
          this.ctx.moveTo(wx, wy - wHeight);
          this.ctx.lineTo(ex, ey);
          this.ctx.stroke();
        }
        break;
      }
      case BUILDING_TYPES.BARRACKS: {
        this.drawCobbleBase(pNorth, pEast, pSouth, pWest);
        const yardH = 26 * scale;

        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.strokeStyle = '#2c3e50';
        this.ctx.lineWidth = 1 * scale;
        this.ctx.beginPath();
        this.ctx.moveTo(pWest.x, pWest.y);
        this.ctx.lineTo(center.x, center.y);
        this.ctx.lineTo(center.x, center.y - yardH);
        this.ctx.lineTo(pWest.x, pWest.y - yardH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#6c7a89';
        this.ctx.beginPath();
        this.ctx.moveTo(pEast.x, pEast.y);
        this.ctx.lineTo(center.x, center.y);
        this.ctx.lineTo(center.x, center.y - yardH);
        this.ctx.lineTo(pEast.x, pEast.y - yardH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#4e5d6c';
        this.ctx.beginPath();
        this.ctx.moveTo(pWest.x - 2*scale, pWest.y - yardH);
        this.ctx.lineTo(center.x, center.y - yardH - 14*scale);
        this.ctx.lineTo(pEast.x + 2*scale, pEast.y - yardH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        const dx = center.x + 10 * scale;
        const dy = center.y + 14 * scale;
        this.ctx.fillStyle = '#d35400';
        this.ctx.fillRect(dx - 1.5*scale, dy - 15*scale, 3*scale, 15*scale);
        this.ctx.fillStyle = '#e67e22';
        this.ctx.beginPath();
        this.ctx.arc(dx, dy - 12*scale, 3.5*scale, 0, Math.PI*2);
        this.ctx.fill();
        this.ctx.stroke();
        break;
      }
      case BUILDING_TYPES.WALL: {
        const wallH = 28 * scale;
        const n = this.getWallNeighbors(b.x, b.y);

        this.ctx.fillStyle = '#808b96';
        this.ctx.strokeStyle = '#4d5656';
        this.ctx.lineWidth = 1 * scale;

        // Base foundation
        this.drawCobbleBase(pNorth, pEast, pSouth, pWest);

        // Center Pillar / Post
        const pillarR = 10 * scale;
        this.ctx.beginPath();
        this.ctx.rect(center.x - pillarR, center.y - wallH, pillarR * 2, wallH);
        this.ctx.fillStyle = '#707b7c';
        this.ctx.fill();
        this.ctx.stroke();

        // Connect West (to pWest)
        if (n.west) {
          this.ctx.fillStyle = '#95a5a6';
          this.ctx.beginPath();
          this.ctx.moveTo(pWest.x, pWest.y);
          this.ctx.lineTo(center.x, center.y);
          this.ctx.lineTo(center.x, center.y - wallH);
          this.ctx.lineTo(pWest.x, pWest.y - wallH);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.stroke();
        }

        // Connect South (to pSouth)
        if (n.south) {
          this.ctx.fillStyle = '#7f8c8d';
          this.ctx.beginPath();
          this.ctx.moveTo(pSouth.x, pSouth.y);
          this.ctx.lineTo(center.x, center.y);
          this.ctx.lineTo(center.x, center.y - wallH);
          this.ctx.lineTo(pSouth.x, pSouth.y - wallH);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.stroke();
        }

        // Connect East (to pEast)
        if (n.east) {
          this.ctx.fillStyle = '#95a5a6';
          this.ctx.beginPath();
          this.ctx.moveTo(pEast.x, pEast.y);
          this.ctx.lineTo(center.x, center.y);
          this.ctx.lineTo(center.x, center.y - wallH);
          this.ctx.lineTo(pEast.x, pEast.y - wallH);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.stroke();
        }

        // Connect North (to pNorth)
        if (n.north) {
          this.ctx.fillStyle = '#7f8c8d';
          this.ctx.beginPath();
          this.ctx.moveTo(pNorth.x, pNorth.y);
          this.ctx.lineTo(center.x, center.y);
          this.ctx.lineTo(center.x, center.y - wallH);
          this.ctx.lineTo(pNorth.x, pNorth.y - wallH);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.stroke();
        }

        // Isolated wall fallback (if no neighbors)
        if (!n.west && !n.east && !n.north && !n.south) {
          this.ctx.fillStyle = '#95a5a6';
          this.ctx.beginPath();
          this.ctx.moveTo(pWest.x, pWest.y);
          this.ctx.lineTo(pSouth.x, pSouth.y);
          this.ctx.lineTo(pSouth.x, pSouth.y - wallH);
          this.ctx.lineTo(pWest.x, pWest.y - wallH);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.stroke();

          this.ctx.fillStyle = '#7f8c8d';
          this.ctx.beginPath();
          this.ctx.moveTo(pEast.x, pEast.y);
          this.ctx.lineTo(pSouth.x, pSouth.y);
          this.ctx.lineTo(pSouth.x, pSouth.y - wallH);
          this.ctx.lineTo(pEast.x, pEast.y - wallH);
          this.ctx.closePath();
          this.ctx.fill();
          this.ctx.stroke();
        }

        // Top Crenellations / Battlements
        this.ctx.fillStyle = '#b2babb';
        this.ctx.fillRect(center.x - 6 * scale, center.y - wallH - 6 * scale, 12 * scale, 6 * scale);
        this.ctx.strokeRect(center.x - 6 * scale, center.y - wallH - 6 * scale, 12 * scale, 6 * scale);

        // Check for mounted siege weapon (Ballista / Oil Cauldron)
        const weaponKey = `${b.x}_${b.y}`;
        const mounted = stateManager.state && stateManager.state.wallDefenses && stateManager.state.wallDefenses[weaponKey];
        if (mounted) {
          // Render Mounted Ballista or Pitch Cauldron
          this.ctx.fillStyle = '#5d4037';
          this.ctx.fillRect(center.x - 5 * scale, center.y - wallH - 12 * scale, 10 * scale, 6 * scale);
          this.ctx.fillStyle = mounted.type === 'ballista' ? '#e74c3c' : '#f39c12';
          this.ctx.beginPath();
          this.ctx.arc(center.x, center.y - wallH - 14 * scale, 4 * scale, 0, Math.PI * 2);
          this.ctx.fill();
        }
        break;
      }
      case BUILDING_TYPES.TAX_HOUSE: {
        const hH = 26 * scale;
        this.ctx.fillStyle = '#966d4f';
        this.ctx.strokeStyle = '#4e331f';
        this.ctx.lineWidth = 1 * scale;

        this.ctx.beginPath();
        this.ctx.moveTo(pWest.x, pWest.y);
        this.ctx.lineTo(pSouth.x, pSouth.y);
        this.ctx.lineTo(pSouth.x, pSouth.y - hH);
        this.ctx.lineTo(pWest.x, pWest.y - hH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#7d563a';
        this.ctx.beginPath();
        this.ctx.moveTo(pEast.x, pEast.y);
        this.ctx.lineTo(pSouth.x, pSouth.y);
        this.ctx.lineTo(pSouth.x, pSouth.y - hH);
        this.ctx.lineTo(pEast.x, pEast.y - hH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#27ae60';
        this.ctx.beginPath();
        this.ctx.moveTo(pWest.x - 2*scale, pWest.y - hH);
        this.ctx.lineTo(center.x, center.y - hH - 12*scale);
        this.ctx.lineTo(pEast.x + 2*scale, pEast.y - hH);
        this.ctx.lineTo(pSouth.x, pSouth.y - hH + 3*scale);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        break;
      }
      case BUILDING_TYPES.MOAT: {
        this.ctx.fillStyle = '#2980b9';
        this.ctx.strokeStyle = '#1b4f72';
        this.ctx.lineWidth = 1 * scale;
        this.ctx.beginPath();
        this.ctx.moveTo(pNorth.x, pNorth.y);
        this.ctx.lineTo(pEast.x, pEast.y);
        this.ctx.lineTo(pSouth.x, pSouth.y);
        this.ctx.lineTo(pWest.x, pWest.y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#5dade2';
        this.ctx.beginPath();
        this.ctx.ellipse(center.x, center.y, 16 * scale, 8 * scale, 0, 0, Math.PI * 2);
        this.ctx.fill();
        break;
      }
      case BUILDING_TYPES.DRAWBRIDGE: {
        this.ctx.fillStyle = '#2980b9';
        this.ctx.beginPath();
        this.ctx.moveTo(pNorth.x, pNorth.y);
        this.ctx.lineTo(pEast.x, pEast.y);
        this.ctx.lineTo(pSouth.x, pSouth.y);
        this.ctx.lineTo(pWest.x, pWest.y);
        this.ctx.closePath();
        this.ctx.fill();

        // Wooden drawbridge planks
        this.ctx.fillStyle = '#6e472b';
        this.ctx.strokeStyle = '#3e2717';
        this.ctx.lineWidth = 1.2 * scale;
        this.ctx.fillRect(center.x - 14 * scale, center.y - 6 * scale, 28 * scale, 12 * scale);
        this.ctx.strokeRect(center.x - 14 * scale, center.y - 6 * scale, 28 * scale, 12 * scale);

        // Iron chains
        this.ctx.strokeStyle = '#bdc3c7';
        this.ctx.lineWidth = 1.5 * scale;
        this.ctx.beginPath();
        this.ctx.moveTo(center.x - 12 * scale, center.y - 6 * scale);
        this.ctx.lineTo(center.x - 12 * scale, center.y - 25 * scale);
        this.ctx.moveTo(center.x + 12 * scale, center.y - 6 * scale);
        this.ctx.lineTo(center.x + 12 * scale, center.y - 25 * scale);
        this.ctx.stroke();
        break;
      }
      case BUILDING_TYPES.FOUNTAIN: {
        this.drawCobbleBase(pNorth, pEast, pSouth, pWest);
        this.ctx.fillStyle = '#95a5a6';
        this.ctx.strokeStyle = '#7f8c8d';
        this.ctx.lineWidth = 1 * scale;

        const fRadius = 24 * scale;
        this.ctx.beginPath();
        this.ctx.ellipse(center.x, center.y, fRadius, fRadius/2, 0, 0, Math.PI*2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#5dade2';
        this.ctx.beginPath();
        this.ctx.ellipse(center.x, center.y, fRadius - 3*scale, (fRadius - 3*scale)/2, 0, 0, Math.PI*2);
        this.ctx.fill();

        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.fillRect(center.x - 3*scale, center.y - 12*scale, 6*scale, 12*scale);
        this.ctx.strokeRect(center.x - 3*scale, center.y - 12*scale, 6*scale, 12*scale);
        break;
      }
      case BUILDING_TYPES.TAVERN: {
        this.drawCobbleBase(pNorth, pEast, pSouth, pWest);
        const houseH = 26 * scale;
        
        // Draw plaster walls
        // West side
        this.ctx.fillStyle = '#f2edd9'; // Cozy plaster color
        this.ctx.strokeStyle = '#4d331f'; // Timber outline
        this.ctx.lineWidth = 1 * scale;
        
        this.ctx.beginPath();
        this.ctx.moveTo(pWest.x, pWest.y);
        this.ctx.lineTo(center.x, center.y);
        this.ctx.lineTo(center.x, center.y - houseH);
        this.ctx.lineTo(pWest.x, pWest.y - houseH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // East side
        this.ctx.fillStyle = '#dfd8c2'; // Shaded plaster
        this.ctx.beginPath();
        this.ctx.moveTo(pEast.x, pEast.y);
        this.ctx.lineTo(center.x, center.y);
        this.ctx.lineTo(center.x, center.y - houseH);
        this.ctx.lineTo(pEast.x, pEast.y - houseH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Draw timber framing lines (Fachwerk style)
        this.ctx.strokeStyle = '#5a3e2b';
        this.ctx.lineWidth = 2 * scale;
        
        // X-braces on west side
        this.ctx.beginPath();
        this.ctx.moveTo(pWest.x, pWest.y - houseH);
        this.ctx.lineTo(center.x, center.y);
        this.ctx.moveTo(center.x, center.y - houseH);
        this.ctx.lineTo(pWest.x, pWest.y);
        // vertical beams
        this.ctx.moveTo(pWest.x, pWest.y);
        this.ctx.lineTo(pWest.x, pWest.y - houseH);
        this.ctx.moveTo(center.x, center.y);
        this.ctx.lineTo(center.x, center.y - houseH);
        this.ctx.stroke();

        // X-braces on east side
        this.ctx.beginPath();
        this.ctx.moveTo(pEast.x, pEast.y - houseH);
        this.ctx.lineTo(center.x, center.y);
        this.ctx.moveTo(center.x, center.y - houseH);
        this.ctx.lineTo(pEast.x, pEast.y);
        // vertical beam
        this.ctx.moveTo(pEast.x, pEast.y);
        this.ctx.lineTo(pEast.x, pEast.y - houseH);
        this.ctx.stroke();

        // Draw tiled roof
        this.ctx.fillStyle = '#8e2d2d'; // Dark medieval red tiles
        this.ctx.strokeStyle = '#4d1e1e';
        this.ctx.lineWidth = 1 * scale;
        
        this.ctx.beginPath();
        this.ctx.moveTo(pWest.x - 3 * scale, pWest.y - houseH);
        this.ctx.lineTo(center.x, center.y - houseH - 16 * scale);
        this.ctx.lineTo(pEast.x + 3 * scale, pEast.y - houseH);
        this.ctx.lineTo(pSouth.x, pSouth.y - houseH + 2 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Chimney on the roof
        this.ctx.fillStyle = '#5c5e62';
        this.ctx.strokeStyle = '#3a3b3c';
        const cx = center.x + 6 * scale;
        const cy = center.y - houseH - 6 * scale;
        this.ctx.beginPath();
        this.ctx.moveTo(cx - 3 * scale, cy);
        this.ctx.lineTo(cx - 3 * scale, cy - 10 * scale);
        this.ctx.lineTo(cx + 3 * scale, cy - 10 * scale);
        this.ctx.lineTo(cx + 3 * scale, cy + 3 * scale);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Tavern door on the west wall
        const doorW = 7 * scale;
        const doorH = 14 * scale;
        const doorX = pWest.x + (center.x - pWest.x) * 0.4;
        const doorY = pWest.y + (center.y - pWest.y) * 0.4;
        
        this.ctx.fillStyle = '#4a2f1b';
        this.ctx.strokeStyle = '#1a0d07';
        this.ctx.fillRect(doorX - doorW/2, doorY - doorH, doorW, doorH);
        this.ctx.strokeRect(doorX - doorW/2, doorY - doorH, doorW, doorH);

        // Glowing yellow windows on the west and east walls
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.shadowColor = '#f1c40f';
        this.ctx.shadowBlur = 5 * scale;
        
        // West window
        const winW = 5 * scale;
        const winH = 5 * scale;
        const winX1 = pWest.x + (center.x - pWest.x) * 0.75;
        const winY1 = pWest.y + (center.y - pWest.y) * 0.75 - 12 * scale;
        this.ctx.fillRect(winX1 - winW/2, winY1 - winH/2, winW, winH);
        this.ctx.strokeRect(winX1 - winW/2, winY1 - winH/2, winW, winH);

        // East window
        const winX2 = center.x + (pEast.x - center.x) * 0.5;
        const winY2 = center.y + (pEast.y - center.y) * 0.5 - 12 * scale;
        this.ctx.fillRect(winX2 - winW/2, winY2 - winH/2, winW, winH);
        this.ctx.strokeRect(winX2 - winW/2, winY2 - winH/2, winW, winH);

        this.ctx.shadowBlur = 0; // Reset shadow

        // Swinging pub sign
        this.ctx.strokeStyle = '#2d1a0e';
        this.ctx.lineWidth = 1.5 * scale;
        const poleX = doorX;
        const poleY = doorY - doorH - 2 * scale;
        
        this.ctx.beginPath();
        this.ctx.moveTo(poleX, poleY);
        this.ctx.lineTo(poleX - 8 * scale, poleY - 2 * scale); // extend leftwards
        this.ctx.stroke();

        // Small wooden sign swinging
        const swingOffset = Math.sin(time * 3) * 1.5 * scale;
        this.ctx.fillStyle = '#b58a5c';
        this.ctx.strokeStyle = '#5a3e2b';
        this.ctx.lineWidth = 0.8 * scale;
        this.ctx.beginPath();
        this.ctx.rect(poleX - 7 * scale + swingOffset, poleY + 1 * scale, 5 * scale, 4 * scale);
        this.ctx.fill();
        this.ctx.stroke();
        break;
      }
      case BUILDING_TYPES.MARKETPLACE: {
        this.drawCobbleBase(pNorth, pEast, pSouth, pWest);
        const tentH = 24 * scale;

        // Draw wooden posts
        this.ctx.strokeStyle = '#5a3e2b';
        this.ctx.lineWidth = 2 * scale;
        this.ctx.beginPath();
        this.ctx.moveTo(pWest.x + 5*scale, pWest.y);
        this.ctx.lineTo(pWest.x + 5*scale, pWest.y - tentH);
        this.ctx.moveTo(pEast.x - 5*scale, pEast.y);
        this.ctx.lineTo(pEast.x - 5*scale, pEast.y - tentH);
        this.ctx.moveTo(pSouth.x, pSouth.y - 3*scale);
        this.ctx.lineTo(pSouth.x, pSouth.y - tentH - 3*scale);
        this.ctx.stroke();

        // Draw table
        this.ctx.fillStyle = '#8e6240';
        this.ctx.beginPath();
        this.ctx.moveTo(pWest.x + 10*scale, pWest.y - 4*scale);
        this.ctx.lineTo(pEast.x - 10*scale, pEast.y - 4*scale);
        this.ctx.lineTo(pSouth.x, pSouth.y - 8*scale);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Draw striped tent roof
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.beginPath();
        this.ctx.moveTo(pWest.x, pWest.y - tentH);
        this.ctx.lineTo(center.x, center.y - tentH - 12*scale);
        this.ctx.lineTo(pSouth.x, pSouth.y - tentH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#f1c40f';
        this.ctx.beginPath();
        this.ctx.moveTo(pEast.x, pEast.y - tentH);
        this.ctx.lineTo(center.x, center.y - tentH - 12*scale);
        this.ctx.lineTo(pSouth.x, pSouth.y - tentH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        break;
      }
      case BUILDING_TYPES.HERO_ALTAR: {
        this.drawCobbleBase(pNorth, pEast, pSouth, pWest);

        // Pedestal
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.strokeStyle = '#555';
        this.ctx.lineWidth = 1.5 * scale;
        this.ctx.beginPath();
        this.ctx.ellipse(center.x, center.y, 22 * scale, 11 * scale, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#95a5a6';
        this.ctx.beginPath();
        this.ctx.ellipse(center.x, center.y - 4*scale, 16 * scale, 8 * scale, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#3498db';
        this.ctx.shadowColor = '#3498db';
        this.ctx.shadowBlur = 8 * scale;
        this.ctx.beginPath();
        this.ctx.ellipse(center.x, center.y - 6*scale, 6 * scale, 3 * scale, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Embedded Sword
        this.ctx.strokeStyle = '#ecf0f1';
        this.ctx.lineWidth = 2.5 * scale;
        this.ctx.beginPath();
        this.ctx.moveTo(center.x, center.y - 6*scale);
        this.ctx.lineTo(center.x, center.y - 25*scale);
        this.ctx.stroke();
        
        this.ctx.strokeStyle = '#d4af37';
        this.ctx.lineWidth = 2 * scale;
        this.ctx.beginPath();
        this.ctx.moveTo(center.x - 4*scale, center.y - 20*scale);
        this.ctx.lineTo(center.x + 4*scale, center.y - 20*scale);
        this.ctx.stroke();

        this.ctx.shadowBlur = 0;

        if (!b.underConstruction && Math.random() < 0.08) {
          this.spawnSparkleParticle(center.x, center.y - 12*scale);
        }
        break;
      }
      case BUILDING_TYPES.MILL: {
        this.drawCobbleBase(pNorth, pEast, pSouth, pWest);
        const houseH = 26 * scale;
        this.ctx.fillStyle = '#8e6240';
        this.ctx.strokeStyle = '#4d331f';
        this.ctx.lineWidth = 1 * scale;

        this.ctx.beginPath();
        this.ctx.moveTo(pWest.x, pWest.y);
        this.ctx.lineTo(pSouth.x, pSouth.y);
        this.ctx.lineTo(pSouth.x, pSouth.y - houseH);
        this.ctx.lineTo(pWest.x, pWest.y - houseH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#7a5230';
        this.ctx.beginPath();
        this.ctx.moveTo(pEast.x, pEast.y);
        this.ctx.lineTo(pSouth.x, pSouth.y);
        this.ctx.lineTo(pSouth.x, pSouth.y - houseH);
        this.ctx.lineTo(pEast.x, pEast.y - houseH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Windmill sails
        const wx = center.x;
        const wy = center.y - houseH + 5 * scale;
        this.ctx.strokeStyle = '#dfc39e';
        this.ctx.lineWidth = 2 * scale;
        const angle = time * 1.5;
        for (let i = 0; i < 4; i++) {
          const ang = angle + (i * Math.PI / 2);
          const sailLen = 22 * scale;
          this.ctx.beginPath();
          this.ctx.moveTo(wx, wy);
          this.ctx.lineTo(wx + Math.cos(ang) * sailLen, wy + Math.sin(ang) * sailLen);
          this.ctx.stroke();
        }
        break;
      }
      case BUILDING_TYPES.BAKERY: {
        this.drawCobbleBase(pNorth, pEast, pSouth, pWest);
        const houseH = 22 * scale;
        this.ctx.fillStyle = '#b05a42'; // warm brick color
        this.ctx.strokeStyle = '#5c2d20';
        this.ctx.lineWidth = 1 * scale;

        this.ctx.beginPath();
        this.ctx.moveTo(pWest.x, pWest.y);
        this.ctx.lineTo(pSouth.x, pSouth.y);
        this.ctx.lineTo(pSouth.x, pSouth.y - houseH);
        this.ctx.lineTo(pWest.x, pWest.y - houseH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#9e4b34';
        this.ctx.beginPath();
        this.ctx.moveTo(pEast.x, pEast.y);
        this.ctx.lineTo(pSouth.x, pSouth.y);
        this.ctx.lineTo(pSouth.x, pSouth.y - houseH);
        this.ctx.lineTo(pEast.x, pEast.y - houseH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Chimney with baking smoke
        const cx = center.x + 8 * scale;
        const cy = center.y - houseH - 2 * scale;
        this.ctx.fillStyle = '#4f271d';
        this.ctx.fillRect(cx - 3 * scale, cy - 8 * scale, 6 * scale, 8 * scale);
        this.ctx.strokeRect(cx - 3 * scale, cy - 8 * scale, 6 * scale, 8 * scale);

        if (!b.underConstruction && Math.random() < 0.08) {
          this.spawnSmokeParticle(cx, cy - 10 * scale);
        }
        break;
      }
      case BUILDING_TYPES.SMELTER: {
        this.drawCobbleBase(pNorth, pEast, pSouth, pWest);
        const furnaceH = 28 * scale;
        this.ctx.fillStyle = '#3a3d40'; // dark metal/stone
        this.ctx.strokeStyle = '#222';
        this.ctx.lineWidth = 1.2 * scale;

        this.ctx.beginPath();
        this.ctx.moveTo(pWest.x, pWest.y);
        this.ctx.lineTo(pSouth.x, pSouth.y);
        this.ctx.lineTo(pSouth.x, pSouth.y - furnaceH);
        this.ctx.lineTo(pWest.x, pWest.y - furnaceH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#2b2d2f';
        this.ctx.beginPath();
        this.ctx.moveTo(pEast.x, pEast.y);
        this.ctx.lineTo(pSouth.x, pSouth.y);
        this.ctx.lineTo(pSouth.x, pSouth.y - furnaceH);
        this.ctx.lineTo(pEast.x, pEast.y - furnaceH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Lava glow door
        const doorW = 10 * scale;
        const doorH = 10 * scale;
        this.ctx.fillStyle = '#e67e22'; // glowing orange
        this.ctx.shadowColor = '#e74c3c';
        this.ctx.shadowBlur = 10 * scale;
        this.ctx.fillRect(center.x - doorW/2, center.y + 4 * scale - doorH, doorW, doorH);
        this.ctx.shadowBlur = 0;

        if (!b.underConstruction && Math.random() < 0.15) {
          this.spawnSmokeParticle(center.x, center.y - furnaceH - 5 * scale);
        }
        break;
      }
      case BUILDING_TYPES.CATTLE_FARM: {
        // Draw green field
        this.ctx.fillStyle = '#27ae60';
        this.ctx.beginPath();
        this.ctx.moveTo(pNorth.x, pNorth.y);
        this.ctx.lineTo(pEast.x, pEast.y);
        this.ctx.lineTo(pSouth.x, pSouth.y);
        this.ctx.lineTo(pWest.x, pWest.y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Draw wooden fence around it
        this.ctx.strokeStyle = '#8e6240';
        this.ctx.lineWidth = 2 * scale;
        this.ctx.beginPath();
        this.ctx.moveTo(pNorth.x, pNorth.y);
        this.ctx.lineTo(pEast.x, pEast.y);
        this.ctx.lineTo(pSouth.x, pSouth.y);
        this.ctx.lineTo(pWest.x, pWest.y);
        this.ctx.closePath();
        this.ctx.stroke();

        // Draw little cows (simplified vector representation: body + head)
        for (let i = 0; i < 2; i++) {
          const cx = center.x + (i === 0 ? -12 : 12) * scale;
          const cy = center.y + (i === 0 ? -4 : 4) * scale;
          
          this.ctx.fillStyle = '#fff';
          this.ctx.beginPath();
          this.ctx.arc(cx, cy, 5 * scale, 0, Math.PI*2);
          this.ctx.fill();
          this.ctx.stroke();
          
          this.ctx.fillStyle = '#000';
          this.ctx.beginPath();
          this.ctx.arc(cx - 2*scale, cy - 1*scale, 1.5*scale, 0, Math.PI*2);
          this.ctx.arc(cx + 2*scale, cy + 2*scale, 1.2*scale, 0, Math.PI*2);
          this.ctx.fill();

          // head
          this.ctx.fillStyle = '#ffd1a9';
          this.ctx.beginPath();
          this.ctx.arc(cx + 4*scale * (i === 0 ? 1 : -1), cy - 2*scale, 2.5*scale, 0, Math.PI*2);
          this.ctx.fill();
          this.ctx.stroke();
        }
        break;
      }
      case BUILDING_TYPES.TANNERY: {
        this.drawCobbleBase(pNorth, pEast, pSouth, pWest);
        const houseH = 22 * scale;
        
        // Plaster cabin
        this.ctx.fillStyle = '#dfd8c2';
        this.ctx.strokeStyle = '#4d331f';
        this.ctx.lineWidth = 1 * scale;

        this.ctx.beginPath();
        this.ctx.moveTo(pWest.x, pWest.y);
        this.ctx.lineTo(center.x, center.y);
        this.ctx.lineTo(center.x, center.y - houseH);
        this.ctx.lineTo(pWest.x, pWest.y - houseH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#bfae90';
        this.ctx.beginPath();
        this.ctx.moveTo(pEast.x, pEast.y);
        this.ctx.lineTo(center.x, center.y);
        this.ctx.lineTo(center.x, center.y - houseH);
        this.ctx.lineTo(pEast.x, pEast.y - houseH);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        // Tannery rack
        const rx = center.x + 12 * scale;
        const ry = center.y + 6 * scale;
        this.ctx.strokeStyle = '#5a3e2b';
        this.ctx.lineWidth = 2.5 * scale;
        this.ctx.beginPath();
        this.ctx.moveTo(rx - 8 * scale, ry);
        this.ctx.lineTo(rx - 8 * scale, ry - 16 * scale);
        this.ctx.lineTo(rx + 8 * scale, ry - 16 * scale);
        this.ctx.lineTo(rx + 8 * scale, ry);
        this.ctx.stroke();

        // Stretched skin on rack
        this.ctx.fillStyle = '#a0522d';
        this.ctx.strokeStyle = '#4d331f';
        this.ctx.lineWidth = 1 * scale;
        this.ctx.beginPath();
        this.ctx.rect(rx - 6 * scale, ry - 14 * scale, 12 * scale, 10 * scale);
        this.ctx.fill();
        this.ctx.stroke();
        break;
      }
    }

    if (b.underConstruction) {
      const barW = 50 * scale;
      const barH = 6 * scale;
      const bx = center.x - barW / 2;
      const by = pNorth.y - 15 * scale;
      const progress = 1 - (b.constructionTimeRemaining / b.constructionTimeTotal);

      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      this.ctx.fillRect(bx, by, barW, barH);
      this.ctx.fillStyle = '#2ecc71';
      this.ctx.fillRect(bx, by, barW * progress, barH);
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 0.5 * scale;
      this.ctx.strokeRect(bx, by, barW, barH);
    } else {
      this.ctx.fillStyle = '#ffffff';
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2 * scale;
      this.ctx.font = `bold ${Math.max(8, Math.round(9 * scale))}px Arial`;
      this.ctx.textAlign = 'center';
      
      let levelText = `Lvl ${b.level}`;
      if (b.type === BUILDING_TYPES.FOUNTAIN) levelText = "Deko";

      this.ctx.strokeText(levelText, center.x, center.y + (b.type === BUILDING_TYPES.KEEP ? -10*scale : 10*scale));
      this.ctx.fillText(levelText, center.x, center.y + (b.type === BUILDING_TYPES.KEEP ? -10*scale : 10*scale));

      if (b.type === BUILDING_TYPES.TAX_HOUSE && stateManager.state.taxState.canCollect) {
        this.drawCollectBubble(center.x, pNorth.y - 20 * scale, scale, time);
      }

      this.drawBuildingNightWindows(b, pNorth, pEast, pSouth, pWest, center, scale);
    }

    this.ctx.restore();
  }

  drawBuildingNightWindows(b, pNorth, pEast, pSouth, pWest, center, scale) {
    if (!window.NightCycle || !window.NightCycle.enabled) return;

    // Calculate current night opacity/intensity
    const progress = ((Date.now() - window.NightCycle.lastTick) % window.NightCycle.cycleDuration) / window.NightCycle.cycleDuration;
    const opacity = Math.max(0, Math.sin(Math.PI * progress)); // peak of sine is midnight
    if (opacity < 0.15) return;

    const ctx = this.ctx;
    ctx.save();
    
    // Draw ambient gold-yellow halo/flare around building center
    const grad = ctx.createRadialGradient(center.x, center.y - 10*scale, 2*scale, center.x, center.y - 10*scale, 24*scale);
    grad.addColorStop(0, `rgba(255, 200, 50, ${opacity * 0.35})`);
    grad.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(center.x, center.y - 10*scale, 24*scale, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = `rgba(255, 220, 80, ${opacity * 0.9})`;
    ctx.shadowColor = 'rgba(255, 200, 50, 0.8)';
    ctx.shadowBlur = 8 * scale * opacity;

    switch (b.type) {
      case BUILDING_TYPES.KEEP: {
        const wallH = (60 + b.level * 15) * scale;
        ctx.fillRect(pWest.x + (center.x - pWest.x)*0.3 - 2*scale, pWest.y - wallH + 20*scale, 4*scale, 8*scale);
        ctx.fillRect(pWest.x + (center.x - pWest.x)*0.7 - 2*scale, pWest.y - wallH + 20*scale, 4*scale, 8*scale);
        ctx.fillRect(center.x + (pEast.x - center.x)*0.3 - 2*scale, pEast.y - wallH + 20*scale, 4*scale, 8*scale);
        ctx.fillRect(center.x + (pEast.x - center.x)*0.7 - 2*scale, pEast.y - wallH + 20*scale, 4*scale, 8*scale);
        break;
      }
      case BUILDING_TYPES.WOODCUTTER: {
        ctx.fillRect(pWest.x + 12*scale, pWest.y - 18*scale, 5*scale, 5*scale);
        break;
      }
      case BUILDING_TYPES.FARM: {
        const hx = center.x - 15 * scale;
        ctx.fillRect(hx + 4*scale, pSouth.y - 12*scale, 4*scale, 4*scale);
        break;
      }
      case BUILDING_TYPES.TAVERN: {
        ctx.fillRect(pWest.x + (center.x - pWest.x)*0.3 - 3*scale, center.y - 16*scale, 5*scale, 7*scale);
        ctx.fillRect(pWest.x + (center.x - pWest.x)*0.7 - 3*scale, center.y - 16*scale, 5*scale, 7*scale);
        ctx.fillRect(center.x + (pEast.x - center.x)*0.4 - 3*scale, center.y - 16*scale, 5*scale, 7*scale);
        break;
      }
      case BUILDING_TYPES.BARRACKS: {
        ctx.fillRect(pWest.x + (center.x - pWest.x)*0.5 - 2*scale, center.y - 14*scale, 4*scale, 6*scale);
        ctx.fillRect(center.x + (pEast.x - center.x)*0.5 - 2*scale, center.y - 14*scale, 4*scale, 6*scale);
        break;
      }
      case BUILDING_TYPES.TAX_HOUSE: {
        ctx.fillRect(pWest.x + (center.x - pWest.x)*0.5 - 2.5*scale, center.y - 14*scale, 5*scale, 6*scale);
        ctx.fillRect(center.x + (pEast.x - center.x)*0.5 - 2.5*scale, center.y - 14*scale, 5*scale, 6*scale);
        break;
      }
      case BUILDING_TYPES.LIBRARY: {
        ctx.fillRect(pWest.x + (center.x - pWest.x)*0.3 - 2*scale, center.y - 15*scale, 4*scale, 7*scale);
        ctx.fillRect(pWest.x + (center.x - pWest.x)*0.7 - 2*scale, center.y - 15*scale, 4*scale, 7*scale);
        break;
      }
      case BUILDING_TYPES.BLACKSMITH: {
        ctx.fillStyle = `rgba(230, 90, 20, ${opacity * 0.95})`;
        ctx.shadowColor = '#e74c3c';
        ctx.fillRect(center.x - 3*scale, center.y - 12*scale, 6*scale, 6*scale);
        break;
      }
    }
    ctx.restore();
  }

  drawCobbleBase(pN, pE, pS, pW) {
    this.ctx.fillStyle = '#7f8c8d';
    this.ctx.beginPath();
    this.ctx.moveTo(pN.x, pN.y);
    this.ctx.lineTo(pE.x, pE.y);
    this.ctx.lineTo(pS.x, pS.y);
    this.ctx.lineTo(pW.x, pW.y);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  drawBattlements(wX, wY, sX, sY, eX, eY, wallH, scale) {
    this.ctx.fillStyle = '#6e7077';
    this.ctx.strokeStyle = '#393a3f';
    const steps = 4;
    const bW = 8 * scale;
    const bH = 6 * scale;

    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = wX + (sX - wX) * t;
      const py = wY + (sY - wY) * t;
      if (i % 2 === 0) {
        this.ctx.fillRect(px - bW/2, py - bH, bW, bH);
        this.ctx.strokeRect(px - bW/2, py - bH, bW, bH);
      }
    }
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = sX + (eX - sX) * t;
      const py = sY + (eY - sY) * t;
      if (i % 2 === 0) {
        this.ctx.fillRect(px - bW/2, py - bH, bW, bH);
        this.ctx.strokeRect(px - bW/2, py - bH, bW, bH);
      }
    }
  }

  drawWavingFlag(tx, ty, color, time, scale) {
    const flagW = 20 * scale;
    const flagH = 10 * scale;
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 1 * scale;
    this.ctx.beginPath();
    this.ctx.moveTo(tx, ty);
    this.ctx.lineTo(tx, ty - 18 * scale);
    this.ctx.stroke();

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(tx, ty - 18 * scale);
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const pct = i / steps;
      const dx = pct * flagW;
      const dy = Math.sin(time * 6.5 + pct * Math.PI * 2) * 1.5 * scale;
      this.ctx.lineTo(tx + dx, ty - 18 * scale + dy);
    }
    for (let i = steps; i >= 0; i--) {
      const pct = i / steps;
      const dx = pct * flagW;
      const dy = Math.sin(time * 6.5 + pct * Math.PI * 2) * 1.5 * scale + flagH;
      this.ctx.lineTo(tx + dx, ty - 18 * scale + dy);
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }

  drawCollectBubble(x, y, scale, time) {
    const bounce = Math.sin(time * 7) * 4 * scale;
    const bx = x;
    const by = y + bounce;
    const bRadius = 13 * scale;

    this.ctx.fillStyle = '#f1c40f';
    this.ctx.strokeStyle = '#d4af37';
    this.ctx.lineWidth = 2 * scale;
    this.ctx.beginPath();
    this.ctx.arc(bx, by, bRadius, 0, Math.PI*2);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#111';
    this.ctx.font = `bold ${Math.max(9, Math.round(11 * scale))}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('$', bx, by);
  }

  drawNPC(npc) {
    const screen = this.isoToScreen(npc.x, npc.y);
    const scale = this.zoom;
    const bob = Math.sin(npc.bobbing) * 1.5 * scale;

    this.ctx.save();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    this.ctx.beginPath();
    this.ctx.ellipse(screen.x, screen.y + 4*scale, 5*scale, 2.5*scale, 0, 0, Math.PI*2);
    this.ctx.fill();

    this.ctx.fillStyle = npc.type === 'knight' ? '#7f8c8d' : '#966d4f';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 0.5 * scale;
    this.ctx.beginPath();
    this.ctx.arc(screen.x, screen.y - 5*scale + bob, 3.2*scale, 0, Math.PI*2);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#ffd1a9';
    this.ctx.beginPath();
    this.ctx.arc(screen.x, screen.y - 8.5*scale + bob, 1.8*scale, 0, Math.PI*2);
    this.ctx.fill();
    this.ctx.stroke();

    if (npc.type === 'knight') {
      this.ctx.fillStyle = '#b23b3b';
      this.ctx.fillRect(screen.x - 1*scale, screen.y - 11.5*scale + bob, 2*scale, 2.5*scale);
    } else {
      this.ctx.fillStyle = '#f1c40f';
      this.ctx.beginPath();
      this.ctx.moveTo(screen.x - 3.5*scale, screen.y - 9*scale + bob);
      this.ctx.lineTo(screen.x, screen.y - 11*scale + bob);
      this.ctx.lineTo(screen.x + 3.5*scale, screen.y - 9*scale + bob);
      this.ctx.closePath();
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  drawUIControls() {
    const btnW = 32;
    const btnH = 32;
    const margin = 10;
    const startX = this.canvas.width - btnW - margin;
    const startY = margin;

    const btns = [
      { id: 'zoom_in', label: '+', y: startY },
      { id: 'zoom_out', label: '-', y: startY + btnH + margin },
      { id: 'recenter', label: '⌖', y: startY + (btnH + margin) * 2 }
    ];

    btns.forEach(btn => {
      this.ctx.fillStyle = 'rgba(25, 27, 36, 0.8)';
      this.ctx.strokeStyle = '#d4af37';
      this.ctx.lineWidth = 1.5;
      this.ctx.fillRect(startX, btn.y, btnW, btnH);
      this.ctx.strokeRect(startX, btn.y, btnW, btnH);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = 'bold 16px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(btn.label, startX + btnW/2, btn.y + btnH/2);
    });
  }

  drawWorldMapView() {
    this.ctx.save();
    this.ctx.fillStyle = '#e8d4b3';
    this.ctx.fillRect(this.offset.x, this.offset.y, WORLD_MAP_CONFIG.width, WORLD_MAP_CONFIG.height);
    this.ctx.strokeStyle = '#8d6e63';
    this.ctx.lineWidth = 4;
    this.ctx.strokeRect(this.offset.x, this.offset.y, WORLD_MAP_CONFIG.width, WORLD_MAP_CONFIG.height);

    this.ctx.strokeStyle = 'rgba(141, 110, 99, 0.16)';
    this.ctx.lineWidth = 1;
    for (let x = 100; x < WORLD_MAP_CONFIG.width; x += 100) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.offset.x + x, this.offset.y);
      this.ctx.lineTo(this.offset.x + x, this.offset.y + WORLD_MAP_CONFIG.height);
      this.ctx.stroke();
    }
    for (let y = 100; y < WORLD_MAP_CONFIG.height; y += 100) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.offset.x, this.offset.y + y);
      this.ctx.lineTo(this.offset.x + WORLD_MAP_CONFIG.width, this.offset.y + y);
      this.ctx.stroke();
    }

    stateManager.state.missions.forEach(m => {
      const isOutpost = m.targetType === 'outpost';
      const target = isOutpost 
        ? WORLD_MAP_CONFIG.outposts.find(o => o.id === m.targetId)
        : WORLD_MAP_CONFIG.npcCastles.find(c => c.id === m.targetId);
      if (!target) return;

      const playerX = this.offset.x + WORLD_MAP_CONFIG.playerCastle.x;
      const playerY = this.offset.y + WORLD_MAP_CONFIG.playerCastle.y;
      const targetX = this.offset.x + target.x;
      const targetY = this.offset.y + target.y;

      if (m.type === 'spy') {
        this.ctx.strokeStyle = '#7f8c8d'; // Grey line for stealth spy
      } else if (m.type === 'counter-attack') {
        this.ctx.strokeStyle = '#e74c3c'; // Bold red line for counter attack
      } else {
        this.ctx.strokeStyle = '#d45c37'; // Orange line for normal attack
      }
      
      const time = Date.now() / 1000;
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([5, 5]);
      // Crawling dashed line animation
      const dashDir = m.status === 'returning' ? 1 : -1;
      this.ctx.lineDashOffset = dashDir * time * 20;
      this.ctx.beginPath();
      this.ctx.moveTo(playerX, playerY);
      this.ctx.lineTo(targetX, targetY);
      this.ctx.stroke();
      this.ctx.setLineDash([]);
      this.ctx.lineDashOffset = 0;

      const now = Date.now();
      const elapsed = (now - m.departureTime) / 1000;
      let pct = Math.min(1.0, elapsed / m.duration);

      if (m.status === 'returning') {
        pct = 1.0 - pct;
      }

      const rx = playerX + (targetX - playerX) * pct;
      let ry = playerY + (targetY - playerY) * pct;

      // Bobbing walking animation
      const bob = Math.abs(Math.sin(time * 12)) * 4;
      ry -= bob;

      // Trail of dust particles behind the army
      const trailFactor = 0.04;
      const trailPct = m.status === 'returning' 
        ? Math.min(1.0, pct + trailFactor) 
        : Math.max(0.0, pct - trailFactor);
      const tx = playerX + (targetX - playerX) * trailPct;
      const ty = playerY + (targetY - playerY) * trailPct;

      this.ctx.fillStyle = 'rgba(180, 160, 140, 0.5)';
      this.ctx.beginPath();
      const dustTime = time * 10;
      this.ctx.arc(tx + Math.sin(dustTime) * 3, ty + 2 + Math.cos(dustTime) * 1, 2.5 + Math.sin(dustTime * 2) * 1, 0, Math.PI * 2);
      this.ctx.arc(tx - 3 + Math.cos(dustTime) * 2, ty + 1 + Math.sin(dustTime) * 0.8, 1.8 + Math.cos(dustTime * 2) * 0.5, 0, Math.PI * 2);
      this.ctx.fill();

      if (m.type === 'spy') {
        // Stealthy hooded spy icon
        this.ctx.fillStyle = '#34495e';
        this.ctx.strokeStyle = '#ecf0f1';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(rx, ry, 9, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Draw a hood / cloak shape inside
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.beginPath();
        this.ctx.moveTo(rx - 4, ry + 4);
        this.ctx.lineTo(rx - 2, ry - 3);
        this.ctx.quadraticCurveTo(rx, ry - 7, rx + 2, ry - 3);
        this.ctx.lineTo(rx + 4, ry + 4);
        this.ctx.closePath();
        this.ctx.fill();

        // Spy eyes glow
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.beginPath();
        this.ctx.arc(rx - 1, ry - 1, 0.8, 0, Math.PI * 2);
        this.ctx.arc(rx + 1, ry - 1, 0.8, 0, Math.PI * 2);
        this.ctx.fill();

      } else if (m.type === 'counter-attack') {
        // Angry warning counter attack icon (exclamation mark)
        this.ctx.fillStyle = '#c0392b';
        this.ctx.strokeStyle = '#f1c40f'; // Gold warning border
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(rx, ry, 10, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        // Draw warning exclamation mark
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 11px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('!', rx, ry);
      } else {
        // Default player attack
        this.ctx.fillStyle = '#3498db';
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(rx, ry, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        
        // Simple soldier icon helper
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(rx, ry - 1, 2.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillRect(rx - 2, ry + 2, 4, 3);
      }

      const remaining = Math.max(0, Math.round(m.duration - elapsed));
      this.ctx.fillStyle = '#000';
      this.ctx.font = 'bold 10px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${remaining}s`, rx, ry - 12 - bob);
    });

    const pCastle = WORLD_MAP_CONFIG.playerCastle;
    const px = this.offset.x + pCastle.x;
    const py = this.offset.y + pCastle.y;

    this.ctx.fillStyle = '#3498db';
    this.ctx.strokeStyle = '#2980b9';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(px, py, 18, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(px - 5, py - 6, 10, 11);
    this.ctx.strokeRect(px - 5, py - 6, 10, 11);

    this.ctx.fillStyle = '#333333';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(stateManager.state.castleName, px, py + 28);

    WORLD_MAP_CONFIG.npcCastles.forEach(npc => {
      const nx = this.offset.x + npc.x;
      const ny = this.offset.y + npc.y;
      const isHovered = this.hoveredNpcId === npc.id;
      const isScouted = stateManager.state.scoutedSites?.[npc.id] || npc.level === 1;

      if (isScouted) {
        this.ctx.fillStyle = '#e74c3c';
        this.ctx.strokeStyle = '#c0392b';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(nx, ny, 16 + (isHovered ? 3 : 0), 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(nx - 4, ny - 5, 8, 10);
        this.ctx.strokeRect(nx - 4, ny - 5, 8, 10);

        this.ctx.fillStyle = '#333';
        this.ctx.font = isHovered ? 'bold 11px Arial' : '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${npc.name} (Lvl ${npc.level})`, nx, ny + 26);
      } else {
        // Fog of War drawing
        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(nx, ny, 16 + (isHovered ? 2 : 0), 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('☁️', nx, ny);
        this.ctx.textBaseline = 'alphabetic';

        this.ctx.fillStyle = '#7f8c8d';
        this.ctx.font = isHovered ? 'bold 11px Arial' : '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Unentdeckt', nx, ny + 26);
      }
    });

    // Draw Outposts on the World Map
    if (WORLD_MAP_CONFIG.outposts) {
      WORLD_MAP_CONFIG.outposts.forEach(op => {
        const ox = this.offset.x + op.x;
        const oy = this.offset.y + op.y;
        const isHovered = this.hoveredOutpostId === op.id;
        const opState = stateManager.state.outposts?.[op.id] || { owner: 'npc', garrison: { spearman: 0, swordsman: 0, bowman: 0, knight: 0 } };
        const isPlayerOwned = opState.owner === 'player';
        const isScouted = stateManager.state.scoutedSites?.[op.id] || isPlayerOwned || op.isControlPoint;

        if (isScouted) {
          // Glow / Outer Ring
          this.ctx.beginPath();
          this.ctx.arc(ox, oy, 14 + (isHovered ? 3 : 0), 0, Math.PI * 2);
          this.ctx.fillStyle = isPlayerOwned ? (stateManager.state.bannerColor || '#3498db') : (op.isControlPoint ? '#d4af37' : '#95a5a6');
          this.ctx.strokeStyle = isPlayerOwned ? '#2980b9' : (op.isControlPoint ? '#aa8000' : '#7f8c8d');
          this.ctx.lineWidth = 2;
          this.ctx.fill();
          this.ctx.stroke();

          // Inner circle
          this.ctx.beginPath();
          this.ctx.arc(ox, oy, 10 + (isHovered ? 2 : 0), 0, Math.PI * 2);
          this.ctx.fillStyle = '#ffffff';
          this.ctx.fill();

          // Draw Icon (axe, pickaxe, chain/iron)
          this.ctx.fillStyle = '#000';
          this.ctx.font = isHovered ? '13px Arial' : '11px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText(op.icon || '⛺', ox, oy);

          // Text Label
          this.ctx.fillStyle = '#333';
          this.ctx.font = isHovered ? 'bold 11px Arial' : '10px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'alphabetic';
          
          const ownerText = isPlayerOwned ? ' (Eigene)' : (op.isControlPoint ? ' (Bündnis-KP)' : ' (Feindlich)');
          this.ctx.fillText(op.name + ownerText, ox, oy + 24);
          
          // Show garrison if player owned
          if (isPlayerOwned) {
            const totalGarrison = Object.values(opState.garrison || {}).reduce((a, b) => a + b, 0);
            this.ctx.fillStyle = totalGarrison >= 1 ? '#27ae60' : '#c0392b';
            this.ctx.font = 'bold 9px Arial';
            this.ctx.fillText(`Garnison: ${totalGarrison}`, ox, oy + 34);
          }
        } else {
          // Fog of War for Outposts
          this.ctx.beginPath();
          this.ctx.arc(ox, oy, 12 + (isHovered ? 2 : 0), 0, Math.PI * 2);
          this.ctx.fillStyle = '#7f8c8d';
          this.ctx.strokeStyle = '#34495e';
          this.ctx.lineWidth = 2;
          this.ctx.fill();
          this.ctx.stroke();

          this.ctx.fillStyle = '#ffffff';
          this.ctx.font = 'bold 12px Arial';
          this.ctx.textAlign = 'center';
          this.ctx.textBaseline = 'middle';
          this.ctx.fillText('☁️', ox, oy);
          this.ctx.textBaseline = 'alphabetic';

          this.ctx.fillStyle = '#7f8c8d';
          this.ctx.font = isHovered ? 'bold 11px Arial' : '10px Arial';
          this.ctx.textAlign = 'center';
        }
      });
    }

    // Draw Trade Carts on the World Map
    if (stateManager.state.tradeRoutes) {
      Object.keys(stateManager.state.tradeRoutes).forEach(opId => {
        const route = stateManager.state.tradeRoutes[opId];
        if (!route || !route.active) return;
        const target = WORLD_MAP_CONFIG.outposts.find(o => o.id === opId);
        if (!target) return;

        const playerX = this.offset.x + WORLD_MAP_CONFIG.playerCastle.x;
        const playerY = this.offset.y + WORLD_MAP_CONFIG.playerCastle.y;
        const targetX = this.offset.x + target.x;
        const targetY = this.offset.y + target.y;

        // Draw dotted path line for trade route
        this.ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
        this.ctx.lineWidth = 1.5;
        this.ctx.setLineDash([4, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(playerX, playerY);
        this.ctx.lineTo(targetX, targetY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Interpolate position based on progress
        let pct = route.progress || 0;
        if (route.direction === 'to_outpost') {
          pct = pct;
        } else {
          pct = 1.0 - pct;
        }

        const cx = playerX + (targetX - playerX) * pct;
        const cy = playerY + (targetY - playerY) * pct;

        // Draw little wooden wagon cart shape
        this.ctx.save();
        this.ctx.translate(cx, cy);

        // Wagon body
        this.ctx.fillStyle = '#8e6240';
        this.ctx.fillRect(-8, -4, 16, 8);
        this.ctx.strokeStyle = '#4d331f';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(-8, -4, 16, 8);

        // Wheels
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(-5, 4, 2.5, 0, Math.PI*2);
        this.ctx.arc(5, 4, 2.5, 0, Math.PI*2);
        this.ctx.fill();

        // Cargo (small chest/gold color dot)
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.beginPath();
        this.ctx.arc(0, -3, 3, 0, Math.PI*2);
        this.ctx.fill();

        this.ctx.restore();
      });
    }

    this.ctx.restore();
  }
}
