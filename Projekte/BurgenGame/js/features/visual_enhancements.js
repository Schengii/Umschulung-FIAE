// ================================================================
// VISUAL ENHANCEMENT ENGINE
// Erweitert das Canvas-Rendering um:
//  - Dynamisches Jahreszeiten-Terrain
//  - Detailreichere Gebäude (House, Townhall, Fortress, Siege Workshop)
//  - Verbesserte Weltkarte (Berge, Wälder, Flüsse, Terrain)
//  - Animierte Gebäudedetails (Flaggen, Rauch, Lichter)
// ================================================================

// ================================================================
// TERRAIN: Dynamisches Gras je nach Jahreszeit
// (Überschreibt GameCanvas.prototype.drawGround)
// ================================================================
GameCanvas.prototype.renderGroundCache = function(palette) {
  const ctx = this.offscreenCtx;
  ctx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
  const halfW = 120 / 2;
  const halfH = 60 / 2;
  const offsetX = this.offscreenCanvas.width / 2;
  const offsetY = 50;

  for (let x = 0; x < this.gridSize; x++) {
    for (let y = 0; y < this.gridSize; y++) {
      const screenX = (x - y) * halfW + offsetX;
      const screenY = (x + y) * halfH + offsetY;

      ctx.beginPath();
      ctx.moveTo(screenX, screenY);
      ctx.lineTo(screenX + halfW, screenY + halfH);
      ctx.lineTo(screenX, screenY + 60);
      ctx.lineTo(screenX - halfW, screenY + halfH);
      ctx.closePath();

      ctx.fillStyle = (x + y) % 2 === 0 ? palette.light : palette.dark;
      ctx.fill();

      ctx.strokeStyle = palette.grid;
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  }
  this.offscreenCacheDirty = false;
};

GameCanvas.prototype.drawGround = function() {
  if (!stateManager.state) return;

  const seasonIdx = stateManager.state.seasonIndex || 0;
  const seasons = SEASONS_CONFIG;
  const season = seasons[seasonIdx] || seasons[0];

  const terrainPalette = {
    spring: { light: '#2d6a40', dark: '#255535', grid: '#2a7038' },
    summer: { light: '#1e6b32', dark: '#1a5a2a', grid: '#22753a' },
    autumn: { light: '#7a5230', dark: '#6b4422', grid: '#8a6040' },
    winter: { light: '#d0d8e4', dark: '#b8c4d4', grid: '#c8d0e0' }
  };

  const palette = terrainPalette[season?.id] || terrainPalette.spring;

  if (this.offscreenCacheDirty || this.cachedSeasonIndex !== seasonIdx) {
    this.renderGroundCache(palette);
    this.cachedSeasonIndex = seasonIdx;
  }

  // Draw cached offscreen ground
  this.ctx.save();
  this.ctx.translate(this.offset.x, this.offset.y);
  this.ctx.scale(this.zoom, this.zoom);
  this.ctx.drawImage(this.offscreenCanvas, -1000, -50);
  this.ctx.restore();

  // Dynamic details & hover highlights
  const time = this.animationTime;
  for (let x = 0; x < this.gridSize; x++) {
    for (let y = 0; y < this.gridSize; y++) {
      const screen = this.isoToScreen(x, y);
      const seed = (x * 31 + y * 17) % 100;

      if (season?.id === 'spring' && seed < 10) {
        this.ctx.fillStyle = 'rgba(255, 182, 193, 0.7)';
        for (let i = 0; i < 3; i++) {
          const bx = screen.x + (((seed * (i + 3)) % 20) - 10) * this.zoom * 0.6;
          const by = screen.y + (this.tileHeight / 2 + ((seed * (i + 7)) % 12) - 3) * this.zoom * 0.7;
          this.ctx.beginPath();
          this.ctx.arc(bx, by, 1.5 * this.zoom, 0, Math.PI * 2);
          this.ctx.fill();
        }
      } else if (season?.id === 'summer' && seed < 6) {
        const fx = screen.x + ((seed * 7 % 14) - 7) * this.zoom * 0.5;
        const fy = screen.y + (this.tileHeight / 2 + (seed % 8) - 2) * this.zoom * 0.7;
        const colors = ['#f1c40f', '#e74c3c', '#9b59b6', '#ffffff'];
        this.ctx.fillStyle = colors[seed % colors.length];
        this.ctx.beginPath();
        this.ctx.arc(fx, fy, 2.2 * this.zoom, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (season?.id === 'autumn' && seed < 15) {
        const leafColors = ['#d35400', '#e67e22', '#c0392b', '#d4ac0d'];
        const lx = screen.x + ((seed * 11 % 18) - 9) * this.zoom * 0.5;
        const ly = screen.y + (this.tileHeight / 2 + (seed % 10)) * this.zoom * 0.7;
        const wander = Math.sin(time * 2.5 + seed * 0.8) * 3 * this.zoom;
        this.ctx.fillStyle = leafColors[seed % leafColors.length];
        this.ctx.save();
        this.ctx.translate(lx + wander, ly);
        this.ctx.rotate(time * 1.2 + seed * 0.5);
        this.ctx.fillRect(-2 * this.zoom, -1.2 * this.zoom, 4 * this.zoom, 2.4 * this.zoom);
        this.ctx.restore();
      } else if (season?.id === 'winter' && seed < 20) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + (seed % 30) / 60})`;
        this.ctx.beginPath();
        this.ctx.ellipse(
          screen.x + ((seed * 5 % 16) - 8) * this.zoom * 0.4,
          screen.y + (this.tileHeight / 2 + (seed % 8)) * this.zoom * 0.6,
          (3 + seed % 4) * this.zoom * 0.6,
          (1.5 + seed % 2) * this.zoom * 0.4,
          0, 0, Math.PI * 2
        );
        this.ctx.fill();
      }

      if (x === this.hoveredCell.x && y === this.hoveredCell.y && !this.placementMode) {
        this.ctx.beginPath();
        this.ctx.moveTo(screen.x, screen.y);
        this.ctx.lineTo(screen.x + (this.tileWidth / 2) * this.zoom, screen.y + (this.tileHeight / 2) * this.zoom);
        this.ctx.lineTo(screen.x, screen.y + this.tileHeight * this.zoom);
        this.ctx.lineTo(screen.x - (this.tileWidth / 2) * this.zoom, screen.y + (this.tileHeight / 2) * this.zoom);
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(212, 175, 55, 0.25)';
        this.ctx.fill();
        this.ctx.strokeStyle = '#d4af37';
        this.ctx.lineWidth = 1.5 * this.zoom;
        this.ctx.stroke();
      }
    }
  }
};
// NEUE GEBÄUDE: House, Townhall, Fortress, Siege Workshop
// Ergänzt den switch-case in drawBuilding()
// ================================================================
const _origDrawBuilding = GameCanvas.prototype.drawBuilding;
GameCanvas.prototype.drawBuilding = function(b) {
  const config = BUILDINGS_CONFIG[b.type];
  if (!config) return;

  // Check if 3D sprite is loaded
  const sprite = this.sprites ? this.sprites[b.type] : null;
  if (sprite && sprite.complete && sprite.naturalWidth !== 0) {
    const w = config.baseWidth;
    const h = config.baseHeight;
    const pNorth = this.isoToScreen(b.x, b.y);
    const pEast  = this.isoToScreen(b.x + w, b.y);
    const pWest  = this.isoToScreen(b.x, b.y + h);
    const pSouth = this.isoToScreen(b.x + w, b.y + h);
    const center = this.isoToScreen(b.x + w / 2, b.y + h / 2);
    const scale  = this.zoom;

    this.ctx.save();

    // Draw outline if selected
    if (b.id === this.selectedBuildingId) {
      this.ctx.beginPath();
      this.ctx.moveTo(pNorth.x, pNorth.y);
      this.ctx.lineTo(pEast.x, pEast.y);
      this.ctx.lineTo(pSouth.x, pSouth.y);
      this.ctx.lineTo(pWest.x, pWest.y);
      this.ctx.closePath();
      this.ctx.strokeStyle = '#d4af37';
      this.ctx.lineWidth = 3 * scale;
      this.ctx.shadowColor = '#d4af37';
      this.ctx.shadowBlur = 8 * scale;
      this.ctx.stroke();
      this.ctx.shadowBlur = 0;
    }

    // Particle emissions
    if (!b.underConstruction) {
      if (b.type === BUILDING_TYPES.WOODCUTTER && Math.random() < 0.05) {
        this.spawnSmokeParticle(center.x + 10 * scale, center.y - 45 * scale);
      }
      if (b.type === BUILDING_TYPES.QUARRY && Math.random() < 0.03) {
        this.spawnSmokeParticle(center.x - 12 * scale, center.y - 12 * scale);
      }
      if (b.type === BUILDING_TYPES.TAVERN && Math.random() < 0.04) {
        this.spawnSmokeParticle(center.x + 6 * scale, center.y - 36 * scale);
      }
    }

    // Draw the beautiful 3D sprite!
    const imgW = (w + h) * (this.tileWidth / 2) * scale * 0.95;
    const imgH = imgW * (sprite.naturalHeight / sprite.naturalWidth);
    const drawX = center.x - imgW / 2;
    const drawY = pSouth.y - imgH + (this.tileHeight * 0.25) * scale;

    if (b.underConstruction) {
      this.ctx.save();
      this.ctx.globalAlpha = 0.55;
      this.ctx.drawImage(sprite, drawX, drawY, imgW, imgH);
      this.ctx.restore();
      
      // Draw simple wood scaffolding lines
      this.ctx.strokeStyle = '#8e6240';
      this.ctx.lineWidth = 2 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(pWest.x, pWest.y);
      this.ctx.lineTo(pNorth.x, pNorth.y - 10 * scale);
      this.ctx.lineTo(pEast.x, pEast.y);
      this.ctx.moveTo(pWest.x, pWest.y - 15 * scale);
      this.ctx.lineTo(center.x, center.y - 30 * scale);
      this.ctx.lineTo(pEast.x, pEast.y - 15 * scale);
      this.ctx.stroke();
    } else {
      this.ctx.drawImage(sprite, drawX, drawY, imgW, imgH);
    }

    // Draw Level Text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2 * scale;
    this.ctx.font = `bold ${Math.round(10 * scale)}px Arial`;
    this.ctx.textAlign = 'center';
    this.ctx.strokeText(`Lv. ${b.level}`, center.x, pSouth.y + 12 * scale);
    this.ctx.fillText(`Lv. ${b.level}`, center.x, pSouth.y + 12 * scale);

    // Draw progress bar if under construction
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
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 0.5 * scale;
      this.ctx.strokeRect(bx, by, barW, barH);
    }

    this.ctx.restore();
    return;
  }

  // Neue Gebäudetypen abfangen
  const newTypes = [
    BUILDING_TYPES.HOUSE,
    BUILDING_TYPES.TOWNHALL,
    BUILDING_TYPES.FORTRESS,
    BUILDING_TYPES.SIEGE_WORKSHOP,
    BUILDING_TYPES.STATUE,
    BUILDING_TYPES.GARDEN,
    BUILDING_TYPES.BANNER,
    BUILDING_TYPES.BLACKSMITH,
    BUILDING_TYPES.STABLES,
    BUILDING_TYPES.LIBRARY,
    BUILDING_TYPES.BREWERY
  ];

  if (newTypes.includes(b.type)) {
    this._drawNewBuilding(b);
  } else {
    _origDrawBuilding.call(this, b);
  }
};

GameCanvas.prototype._drawNewBuilding = function(b) {
  const config = BUILDINGS_CONFIG[b.type];
  const w = config.baseWidth;
  const h = config.baseHeight;

  const pNorth = this.isoToScreen(b.x, b.y);
  const pEast  = this.isoToScreen(b.x + w, b.y);
  const pWest  = this.isoToScreen(b.x, b.y + h);
  const pSouth = this.isoToScreen(b.x + w, b.y + h);
  const center = this.isoToScreen(b.x + w / 2, b.y + h / 2);
  const scale  = this.zoom;
  const time   = this.animationTime;

  this.ctx.save();

  // Selektion markieren
  if (b.id === this.selectedBuildingId) {
    this.ctx.beginPath();
    this.ctx.moveTo(pNorth.x, pNorth.y);
    this.ctx.lineTo(pEast.x, pEast.y);
    this.ctx.lineTo(pSouth.x, pSouth.y);
    this.ctx.lineTo(pWest.x, pWest.y);
    this.ctx.closePath();
    this.ctx.strokeStyle = '#d4af37';
    this.ctx.lineWidth = 3 * scale;
    this.ctx.shadowColor = '#d4af37';
    this.ctx.shadowBlur = 8 * scale;
    this.ctx.stroke();
    this.ctx.shadowBlur = 0;
  }

  switch (b.type) {
    // ── WOHNHAUS ──────────────────────────────────────────────────
    case BUILDING_TYPES.HOUSE: {
      const hH = (18 + b.level * 4) * scale;

      // Pflaster-Sockel
      this.drawCobbleBase(pNorth, pEast, pSouth, pWest);

      // Westwand: Warmer Kalkstein
      this.ctx.fillStyle = '#d9c49a';
      this.ctx.strokeStyle = '#7d6040';
      this.ctx.lineWidth = 1 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(pWest.x, pWest.y);
      this.ctx.lineTo(pSouth.x, pSouth.y);
      this.ctx.lineTo(pSouth.x, pSouth.y - hH);
      this.ctx.lineTo(pWest.x, pWest.y - hH);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Ostwand: Schatten
      this.ctx.fillStyle = '#c4af87';
      this.ctx.beginPath();
      this.ctx.moveTo(pEast.x, pEast.y);
      this.ctx.lineTo(pSouth.x, pSouth.y);
      this.ctx.lineTo(pSouth.x, pSouth.y - hH);
      this.ctx.lineTo(pEast.x, pEast.y - hH);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Dach: Rote Ziegel-Raute
      this.ctx.fillStyle = '#a63228';
      this.ctx.strokeStyle = '#6b1e15';
      this.ctx.lineWidth = 1 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(pNorth.x, pNorth.y - hH);
      this.ctx.lineTo(center.x, center.y - hH - 14 * scale);
      this.ctx.lineTo(pSouth.x, pSouth.y - hH);
      this.ctx.lineTo(pEast.x, pEast.y - hH);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Dach West
      this.ctx.fillStyle = '#8a2720';
      this.ctx.beginPath();
      this.ctx.moveTo(pNorth.x, pNorth.y - hH);
      this.ctx.lineTo(center.x, center.y - hH - 14 * scale);
      this.ctx.lineTo(pWest.x, pWest.y - hH);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Fenster (gelblich, nachts glühend)
      const isNight = window.NightCycle?.enabled;
      const winColor = isNight ? 'rgba(255,220,80,0.9)' : 'rgba(180,200,255,0.7)';
      const winGlow = isNight ? '#ffd050' : 'transparent';
      this.ctx.fillStyle = winColor;
      if (isNight) { this.ctx.shadowColor = winGlow; this.ctx.shadowBlur = 8 * scale; }
      const winX1 = pWest.x + (pSouth.x - pWest.x) * 0.35;
      const winY1 = pWest.y + (pSouth.y - pWest.y) * 0.35 - hH * 0.5;
      this.ctx.fillRect(winX1 - 3 * scale, winY1 - 4 * scale, 6 * scale, 5 * scale);
      this.ctx.strokeStyle = '#5a3e28';
      this.ctx.lineWidth = 0.5 * scale;
      this.ctx.strokeRect(winX1 - 3 * scale, winY1 - 4 * scale, 6 * scale, 5 * scale);
      this.ctx.shadowBlur = 0;

      // Tür
      const dX = pWest.x + (pSouth.x - pWest.x) * 0.65;
      const dY = pWest.y + (pSouth.y - pWest.y) * 0.65;
      this.ctx.fillStyle = '#5c3d1e';
      this.ctx.fillRect(dX - 3 * scale, dY - 9 * scale, 6 * scale, 9 * scale);
      this.ctx.strokeStyle = '#3a2310';
      this.ctx.lineWidth = 0.5 * scale;
      this.ctx.strokeRect(dX - 3 * scale, dY - 9 * scale, 6 * scale, 9 * scale);

      // Schornstein mit Rauch
      const chX = center.x + 5 * scale;
      const chY = center.y - hH - 3 * scale;
      this.ctx.fillStyle = '#6b6060';
      this.ctx.fillRect(chX - 2.5 * scale, chY - 7 * scale, 5 * scale, 7 * scale);
      this.ctx.strokeStyle = '#3a3030';
      this.ctx.strokeRect(chX - 2.5 * scale, chY - 7 * scale, 5 * scale, 7 * scale);

      if (!b.underConstruction && Math.random() < 0.06) {
        this.spawnSmokeParticle(chX, chY - 8 * scale);
      }
      break;
    }

    // ── RATHAUS ───────────────────────────────────────────────────
    case BUILDING_TYPES.TOWNHALL: {
      const hH = (38 + b.level * 8) * scale;

      // Breiter Sockel aus Stein
      this.ctx.fillStyle = '#8b9194';
      this.ctx.strokeStyle = '#505558';
      this.ctx.lineWidth = 1.2 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(pNorth.x, pNorth.y);
      this.ctx.lineTo(pEast.x, pEast.y);
      this.ctx.lineTo(pSouth.x, pSouth.y);
      this.ctx.lineTo(pWest.x, pWest.y);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Westwand: Helles Mauerwerk
      this.ctx.fillStyle = '#b0bcc0';
      this.ctx.beginPath();
      this.ctx.moveTo(pWest.x, pWest.y);
      this.ctx.lineTo(pSouth.x, pSouth.y);
      this.ctx.lineTo(pSouth.x, pSouth.y - hH);
      this.ctx.lineTo(pWest.x, pWest.y - hH);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Ostwand: Schatten
      this.ctx.fillStyle = '#8d9ea3';
      this.ctx.beginPath();
      this.ctx.moveTo(pEast.x, pEast.y);
      this.ctx.lineTo(pSouth.x, pSouth.y);
      this.ctx.lineTo(pSouth.x, pSouth.y - hH);
      this.ctx.lineTo(pEast.x, pEast.y - hH);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Steintextur-Linien
      this.ctx.strokeStyle = 'rgba(70,80,85,0.25)';
      this.ctx.lineWidth = 0.8 * scale;
      for (let i = 1; i < 4; i++) {
        const t = i / 4;
        const lx1 = pWest.x + (pSouth.x - pWest.x) * t;
        const ly1 = (pWest.y + (pSouth.y - pWest.y) * t) - hH;
        const lx2 = pWest.x + (pSouth.x - pWest.x) * t;
        const ly2 = pWest.y + (pSouth.y - pWest.y) * t;
        this.ctx.beginPath();
        this.ctx.moveTo(lx1, ly1);
        this.ctx.lineTo(lx2, ly2);
        this.ctx.stroke();
      }

      // Zinnenbewehrter Giebel
      this.ctx.fillStyle = '#9dacb0';
      this.ctx.strokeStyle = '#505558';
      this.ctx.lineWidth = 1 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(pWest.x - 2 * scale, pWest.y - hH);
      this.ctx.lineTo(center.x, center.y - hH - 22 * scale);
      this.ctx.lineTo(pEast.x + 2 * scale, pEast.y - hH);
      this.ctx.lineTo(pSouth.x, pSouth.y - hH + 4 * scale);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Zinnen auf Dach-Grat
      const zCount = 5;
      for (let i = 0; i <= zCount; i++) {
        const t = i / zCount;
        const zx = pWest.x + (pSouth.x - pWest.x) * t;
        const zy = (pWest.y + (pSouth.y - pWest.y) * t) - hH;
        if (i % 2 === 0) {
          this.ctx.fillStyle = '#8d9ea3';
          this.ctx.fillRect(zx - 4 * scale, zy - 8 * scale, 8 * scale, 8 * scale);
          this.ctx.strokeRect(zx - 4 * scale, zy - 8 * scale, 8 * scale, 8 * scale);
        }
      }

      // Uhr-Turm in der Mitte
      const towerW = 20 * scale;
      const towerH = hH + 18 * scale;
      this.ctx.fillStyle = '#a0adb2';
      this.ctx.strokeStyle = '#505558';
      this.ctx.lineWidth = 1 * scale;
      this.ctx.fillRect(center.x - towerW / 2, center.y - towerH, towerW, 22 * scale);
      this.ctx.strokeRect(center.x - towerW / 2, center.y - towerH, towerW, 22 * scale);

      // Uhr-Zifferblatt
      this.ctx.fillStyle = '#eceff1';
      this.ctx.strokeStyle = '#37474f';
      this.ctx.lineWidth = 0.8 * scale;
      this.ctx.beginPath();
      this.ctx.arc(center.x, center.y - towerH + 10 * scale, 7 * scale, 0, Math.PI * 2);
      this.ctx.fill(); this.ctx.stroke();

      // Uhr-Zeiger (animiert)
      const hourAngle = (time * 0.05) % (Math.PI * 2);
      const minAngle = (time * 0.6) % (Math.PI * 2);
      this.ctx.strokeStyle = '#37474f';
      this.ctx.lineWidth = 1 * scale;
      const cx2 = center.x;
      const cy2 = center.y - towerH + 10 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(cx2, cy2);
      this.ctx.lineTo(cx2 + Math.cos(hourAngle - Math.PI/2) * 4 * scale, cy2 + Math.sin(hourAngle - Math.PI/2) * 4 * scale);
      this.ctx.moveTo(cx2, cy2);
      this.ctx.lineTo(cx2 + Math.cos(minAngle - Math.PI/2) * 5.5 * scale, cy2 + Math.sin(minAngle - Math.PI/2) * 5.5 * scale);
      this.ctx.stroke();

      // Turmspitze mit Fahne
      this.ctx.fillStyle = '#37474f';
      this.ctx.beginPath();
      this.ctx.moveTo(center.x - towerW/2 - 2*scale, center.y - towerH);
      this.ctx.lineTo(center.x, center.y - towerH - 14 * scale);
      this.ctx.lineTo(center.x + towerW/2 + 2*scale, center.y - towerH);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();
      this.drawWavingFlag(center.x, center.y - towerH - 14 * scale, stateManager.state.bannerColor, time, scale);

      // Großes Tor
      const gateW = 14 * scale;
      const gateH = 18 * scale;
      const gX = (pWest.x + pSouth.x) / 2;
      const gY = (pWest.y + pSouth.y) / 2;
      this.ctx.fillStyle = '#4a3520';
      this.ctx.beginPath();
      this.ctx.moveTo(gX - gateW/2, gY);
      this.ctx.lineTo(gX - gateW/2, gY - gateH + 8*scale);
      this.ctx.quadraticCurveTo(gX, gY - gateH - 4*scale, gX + gateW/2, gY - gateH + 8*scale);
      this.ctx.lineTo(gX + gateW/2, gY);
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.strokeStyle = '#2a1a0a'; this.ctx.lineWidth = 0.8 * scale;
      this.ctx.stroke();
      break;
    }

    // ── FESTUNG ───────────────────────────────────────────────────
    case BUILDING_TYPES.FORTRESS: {
      const wallH = (55 + b.level * 20) * scale;

      // Massives Fundament
      this.ctx.fillStyle = '#555860';
      this.ctx.strokeStyle = '#2a2b30';
      this.ctx.lineWidth = 1.5 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(pNorth.x, pNorth.y);
      this.ctx.lineTo(pEast.x, pEast.y);
      this.ctx.lineTo(pSouth.x, pSouth.y);
      this.ctx.lineTo(pWest.x, pWest.y);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Westwand: Dunkler Granit
      const westGrad = this.ctx.createLinearGradient(pWest.x, pWest.y - wallH, pSouth.x, pSouth.y - wallH);
      westGrad.addColorStop(0, '#686c76');
      westGrad.addColorStop(1, '#555860');
      this.ctx.fillStyle = westGrad;
      this.ctx.beginPath();
      this.ctx.moveTo(pWest.x, pWest.y);
      this.ctx.lineTo(pSouth.x, pSouth.y);
      this.ctx.lineTo(pSouth.x, pSouth.y - wallH);
      this.ctx.lineTo(pWest.x, pWest.y - wallH);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Ostwand: Tiefer Schatten
      this.ctx.fillStyle = '#404248';
      this.ctx.beginPath();
      this.ctx.moveTo(pEast.x, pEast.y);
      this.ctx.lineTo(pSouth.x, pSouth.y);
      this.ctx.lineTo(pSouth.x, pSouth.y - wallH);
      this.ctx.lineTo(pEast.x, pEast.y - wallH);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Vier Ecktürme
      const towers = [
        { px: pNorth.x, py: pNorth.y },
        { px: pEast.x, py: pEast.y },
        { px: pWest.x, py: pWest.y },
        { px: pSouth.x, py: pSouth.y },
      ];
      towers.forEach(t => {
        const tR = 12 * scale;
        const tH = wallH + 25 * scale;
        // Turmkörper
        this.ctx.fillStyle = '#5f6370';
        this.ctx.strokeStyle = '#2a2b30';
        this.ctx.lineWidth = 1 * scale;
        this.ctx.beginPath();
        this.ctx.ellipse(t.px, t.py, tR, tR * 0.5, 0, 0, Math.PI * 2);
        this.ctx.fill(); this.ctx.stroke();
        // Turm Höhe
        this.ctx.fillStyle = '#6b7080';
        this.ctx.beginPath();
        this.ctx.moveTo(t.px - tR, t.py);
        this.ctx.lineTo(t.px - tR, t.py - tH);
        this.ctx.lineTo(t.px + tR, t.py - tH);
        this.ctx.lineTo(t.px + tR, t.py);
        this.ctx.closePath();
        this.ctx.fill(); this.ctx.stroke();
        // Turmkopf
        this.ctx.fillStyle = '#5f6370';
        this.ctx.beginPath();
        this.ctx.ellipse(t.px, t.py - tH, tR, tR * 0.5, 0, 0, Math.PI * 2);
        this.ctx.fill(); this.ctx.stroke();
        // Turmzinnen
        for (let z = -2; z <= 2; z++) {
          if (z % 2 === 0) {
            this.ctx.fillStyle = '#6b7080';
            this.ctx.fillRect(t.px + z * 4 * scale - 2 * scale, t.py - tH - 6 * scale, 4 * scale, 6 * scale);
            this.ctx.strokeRect(t.px + z * 4 * scale - 2 * scale, t.py - tH - 6 * scale, 4 * scale, 6 * scale);
          }
        }
      });

      // Zinnen oben auf den Wänden
      this.drawBattlements(pWest.x, pWest.y - wallH, pSouth.x, pSouth.y - wallH, pEast.x, pEast.y - wallH, wallH, scale);

      // Zentraler hoher Bergfried
      const keepW = 40 * scale;
      const keepH = wallH + 45 * scale;
      this.ctx.fillStyle = '#707580';
      this.ctx.strokeStyle = '#2a2b30';
      this.ctx.lineWidth = 1.2 * scale;
      this.ctx.fillRect(center.x - keepW/2, center.y - keepH, keepW, keepH - wallH + 5*scale);
      this.ctx.strokeRect(center.x - keepW/2, center.y - keepH, keepW, keepH - wallH + 5*scale);

      // Bergfried-Zinnen
      for (let z = -2; z <= 2; z++) {
        if (z % 2 === 0) {
          this.ctx.fillRect(center.x + z * 8 * scale - 4 * scale, center.y - keepH - 8 * scale, 8 * scale, 8 * scale);
          this.ctx.strokeRect(center.x + z * 8 * scale - 4 * scale, center.y - keepH - 8 * scale, 8 * scale, 8 * scale);
        }
      }

      // Drohende Banner-Fahne
      this.ctx.fillStyle = '#b23b3b';
      this.ctx.beginPath();
      this.ctx.moveTo(center.x - keepW/2 - 5*scale, center.y - keepH);
      this.ctx.lineTo(center.x, center.y - keepH - 38 * scale);
      this.ctx.lineTo(center.x + keepW/2 + 5*scale, center.y - keepH);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();
      this.drawWavingFlag(center.x, center.y - keepH - 38 * scale, '#8b0000', time, scale * 1.4);

      // Schwelende Fackeln an der Festung (animiert)
      const torchOffsets = [
        { x: pWest.x + (pSouth.x - pWest.x) * 0.3, y: pWest.y + (pSouth.y - pWest.y) * 0.3 - wallH + 5 * scale },
        { x: pEast.x + (pSouth.x - pEast.x) * 0.3, y: pEast.y + (pSouth.y - pEast.y) * 0.3 - wallH + 5 * scale },
      ];
      torchOffsets.forEach(t => {
        this.ctx.fillStyle = '#e67e22';
        this.ctx.shadowColor = '#e67e22';
        this.ctx.shadowBlur = 6 * scale * (0.7 + Math.sin(time * 8 + t.x) * 0.3);
        this.ctx.beginPath();
        this.ctx.arc(t.x, t.y, 2.5 * scale, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        if (Math.random() < 0.12) this.spawnSmokeParticle(t.x, t.y - 3 * scale);
      });

      // Toreinfahrt
      const gW = 18 * scale;
      const gH = 24 * scale;
      const gX = (pWest.x + pSouth.x) / 2;
      const gY = (pWest.y + pSouth.y) / 2;
      this.ctx.fillStyle = '#1e1f24';
      this.ctx.beginPath();
      this.ctx.moveTo(gX - gW/2, gY);
      this.ctx.lineTo(gX - gW/2, gY - gH + 10*scale);
      this.ctx.quadraticCurveTo(gX, gY - gH - 5*scale, gX + gW/2, gY - gH + 10*scale);
      this.ctx.lineTo(gX + gW/2, gY);
      this.ctx.closePath();
      this.ctx.fill();
      break;
    }

    // ── BELAGERUNGS-WERKSTATT ──────────────────────────────────────
    case BUILDING_TYPES.SIEGE_WORKSHOP: {
      const hH = 28 * scale;

      // Holz-Schuppen Basis
      this.ctx.fillStyle = '#5a3e2b';
      this.ctx.strokeStyle = '#2d1e10';
      this.ctx.lineWidth = 1 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(pNorth.x, pNorth.y);
      this.ctx.lineTo(pEast.x, pEast.y);
      this.ctx.lineTo(pSouth.x, pSouth.y);
      this.ctx.lineTo(pWest.x, pWest.y);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Westwand
      this.ctx.fillStyle = '#7d5c3e';
      this.ctx.beginPath();
      this.ctx.moveTo(pWest.x, pWest.y);
      this.ctx.lineTo(pSouth.x, pSouth.y);
      this.ctx.lineTo(pSouth.x, pSouth.y - hH);
      this.ctx.lineTo(pWest.x, pWest.y - hH);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Ostwand
      this.ctx.fillStyle = '#6b4e34';
      this.ctx.beginPath();
      this.ctx.moveTo(pEast.x, pEast.y);
      this.ctx.lineTo(pSouth.x, pSouth.y);
      this.ctx.lineTo(pSouth.x, pSouth.y - hH);
      this.ctx.lineTo(pEast.x, pEast.y - hH);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Holz-Balken als Querstreben
      this.ctx.strokeStyle = '#4a2e18';
      this.ctx.lineWidth = 2.5 * scale;
      [0.25, 0.5, 0.75].forEach(t => {
        const x1 = pWest.x + (pSouth.x - pWest.x) * t;
        const y1 = pWest.y + (pSouth.y - pWest.y) * t;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x1, y1 - hH);
        this.ctx.stroke();
      });

      // Schräges Holzdach
      this.ctx.fillStyle = '#4a3020';
      this.ctx.strokeStyle = '#2a1a0a';
      this.ctx.lineWidth = 1 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(pWest.x - 3*scale, pWest.y - hH);
      this.ctx.lineTo(pNorth.x, pNorth.y - hH - 10*scale);
      this.ctx.lineTo(pEast.x + 3*scale, pEast.y - hH);
      this.ctx.lineTo(pSouth.x, pSouth.y - hH + 3*scale);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Katapult auf dem Boden (ikonisch)
      const kx = center.x - 5 * scale;
      const ky = center.y + 2 * scale;
      const kArm = time * 1.8; // rotierende Katapult-Arm
      const kAngle = Math.PI * 0.8 + Math.sin(kArm) * 0.4;

      // Rollen
      this.ctx.fillStyle = '#3d2510';
      this.ctx.strokeStyle = '#1e0f05';
      this.ctx.lineWidth = 1 * scale;
      this.ctx.beginPath();
      this.ctx.arc(kx - 8*scale, ky, 4*scale, 0, Math.PI*2);
      this.ctx.fill(); this.ctx.stroke();
      this.ctx.beginPath();
      this.ctx.arc(kx + 8*scale, ky, 4*scale, 0, Math.PI*2);
      this.ctx.fill(); this.ctx.stroke();

      // Rahmen
      this.ctx.fillStyle = '#6b4a22';
      this.ctx.fillRect(kx - 10*scale, ky - 3*scale, 20*scale, 3*scale);
      this.ctx.strokeRect(kx - 10*scale, ky - 3*scale, 20*scale, 3*scale);

      // Arm
      this.ctx.strokeStyle = '#5a3d1a';
      this.ctx.lineWidth = 2 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(kx, ky - 3*scale);
      this.ctx.lineTo(
        kx + Math.cos(kAngle) * 14 * scale,
        ky - 3*scale + Math.sin(kAngle) * 14 * scale
      );
      this.ctx.stroke();

      // Felsbrocken am Ende
      this.ctx.fillStyle = '#7f8c8d';
      this.ctx.beginPath();
      this.ctx.arc(
        kx + Math.cos(kAngle) * 14 * scale,
        ky - 3*scale + Math.sin(kAngle) * 14 * scale,
        3*scale, 0, Math.PI*2
      );
      this.ctx.fill(); this.ctx.stroke();
      break;
    }

    // ── GOLDSTATUE ────────────────────────────────────────────────
    case BUILDING_TYPES.STATUE: {
      // Pedestal
      this.ctx.fillStyle = '#7f8c8d';
      this.ctx.strokeStyle = '#3a3a3a';
      this.ctx.lineWidth = 1 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(pWest.x, pWest.y);
      this.ctx.lineTo(pSouth.x, pSouth.y);
      this.ctx.lineTo(pEast.x, pEast.y);
      this.ctx.lineTo(pNorth.x, pNorth.y);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Statue
      this.ctx.fillStyle = '#f1c40f';
      this.ctx.strokeStyle = '#d4af37';
      this.ctx.beginPath();
      this.ctx.arc(center.x, center.y - 12*scale, 5*scale, 0, Math.PI * 2);
      this.ctx.fill(); this.ctx.stroke();

      this.ctx.fillRect(center.x - 3*scale, center.y - 12*scale, 6*scale, 12*scale);
      this.ctx.strokeRect(center.x - 3*scale, center.y - 12*scale, 6*scale, 12*scale);
      break;
    }

    // ── SCHLOSSGARTEN ──────────────────────────────────────────────
    case BUILDING_TYPES.GARDEN: {
      this.ctx.fillStyle = '#2ecc71';
      this.ctx.strokeStyle = '#27ae60';
      this.ctx.lineWidth = 1 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(pNorth.x, pNorth.y);
      this.ctx.lineTo(pEast.x, pEast.y);
      this.ctx.lineTo(pSouth.x, pSouth.y);
      this.ctx.lineTo(pWest.x, pWest.y);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      const flowerSeeds = [
        { dx: -10, dy: 2, c: '#e74c3c' },
        { dx: 10, dy: -5, c: '#9b59b6' },
        { dx: -2, dy: -12, c: '#f1c40f' },
        { dx: 5, dy: 8, c: '#e67e22' }
      ];
      flowerSeeds.forEach(f => {
        this.ctx.fillStyle = f.c;
        this.ctx.beginPath();
        this.ctx.arc(center.x + f.dx*scale, center.y + f.dy*scale, 1.8*scale, 0, Math.PI*2);
        this.ctx.fill();
      });
      break;
    }

    // ── KÖNIGLICHES BANNER ──────────────────────────────────────────
    case BUILDING_TYPES.BANNER: {
      this.ctx.strokeStyle = '#5a3e2b';
      this.ctx.lineWidth = 2 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(center.x, center.y);
      this.ctx.lineTo(center.x, center.y - 30*scale);
      this.ctx.stroke();

      const wave = Math.sin(time * 0.005) * 4 * scale;
      this.ctx.fillStyle = '#e74c3c';
      this.ctx.strokeStyle = '#c0392b';
      this.ctx.lineWidth = 1 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(center.x, center.y - 30*scale);
      this.ctx.lineTo(center.x - 14*scale, center.y - 25*scale + wave);
      this.ctx.lineTo(center.x, center.y - 20*scale);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();
      break;
    }
    // ── SCHMIEDE ──────────────────────────────────────────────────
    case BUILDING_TYPES.BLACKSMITH: {
      const hH = 26 * scale;
      this.drawCobbleBase(pNorth, pEast, pSouth, pWest);
      // Westwand (Stein dunkel)
      this.ctx.fillStyle = '#55555d';
      this.ctx.strokeStyle = '#222';
      this.ctx.lineWidth = 1 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(pWest.x, pWest.y);
      this.ctx.lineTo(pSouth.x, pSouth.y);
      this.ctx.lineTo(pSouth.x, pSouth.y - hH);
      this.ctx.lineTo(pWest.x, pWest.y - hH);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Ostwand
      this.ctx.fillStyle = '#444448';
      this.ctx.beginPath();
      this.ctx.moveTo(pEast.x, pEast.y);
      this.ctx.lineTo(pSouth.x, pSouth.y);
      this.ctx.lineTo(pSouth.x, pSouth.y - hH);
      this.ctx.lineTo(pEast.x, pEast.y - hH);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Dach: Rote Ziegel
      this.ctx.fillStyle = '#8a2720';
      this.ctx.beginPath();
      this.ctx.moveTo(pNorth.x, pNorth.y - hH);
      this.ctx.lineTo(center.x, center.y - hH - 12 * scale);
      this.ctx.lineTo(pSouth.x, pSouth.y - hH);
      this.ctx.lineTo(pEast.x, pEast.y - hH);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Essenfeuer
      this.ctx.fillStyle = '#e67e22';
      this.ctx.fillRect(center.x - 4*scale, center.y - 6*scale, 8*scale, 6*scale);

      // Schornstein mit viel Rauch
      const chX = center.x + 6 * scale;
      const chY = center.y - hH - 4 * scale;
      this.ctx.fillStyle = '#444';
      this.ctx.fillRect(chX - 3 * scale, chY - 8 * scale, 6 * scale, 8 * scale);
      this.ctx.strokeRect(chX - 3 * scale, chY - 8 * scale, 6 * scale, 8 * scale);

      if (!b.underConstruction && Math.random() < 0.2) {
        this.spawnSmokeParticle(chX, chY - 9 * scale);
      }
      break;
    }
    // ── STALLUNGEN ────────────────────────────────────────────────
    case BUILDING_TYPES.STABLES: {
      const hH = 20 * scale;
      this.drawCobbleBase(pNorth, pEast, pSouth, pWest);
      // Pfosten
      this.ctx.strokeStyle = '#5a3e2b';
      this.ctx.lineWidth = 2.5 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(pWest.x + 4*scale, pWest.y);
      this.ctx.lineTo(pWest.x + 4*scale, pWest.y - hH);
      this.ctx.moveTo(pEast.x - 4*scale, pEast.y);
      this.ctx.lineTo(pEast.x - 4*scale, pEast.y - hH);
      this.ctx.moveTo(pSouth.x, pSouth.y - 2*scale);
      this.ctx.lineTo(pSouth.x, pSouth.y - hH - 2*scale);
      this.ctx.stroke();

      // Stroh-Dach
      this.ctx.fillStyle = '#f1c40f'; // Straw yellow
      this.ctx.strokeStyle = '#d4af37';
      this.ctx.lineWidth = 1 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(pWest.x, pWest.y - hH);
      this.ctx.lineTo(center.x, center.y - hH - 12 * scale);
      this.ctx.lineTo(pSouth.x, pSouth.y - hH);
      this.ctx.lineTo(pEast.x, pEast.y - hH);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();
      break;
    }
    // ── BIBLIOTHEK ────────────────────────────────────────────────
    case BUILDING_TYPES.LIBRARY: {
      const hH = 34 * scale;
      this.drawCobbleBase(pNorth, pEast, pSouth, pWest);

      // Säulen West
      this.ctx.fillStyle = '#eceff1';
      this.ctx.strokeStyle = '#7f8c8d';
      this.ctx.lineWidth = 1 * scale;
      
      // Westwand (Marmor)
      this.ctx.fillRect(pWest.x + 8*scale, pWest.y - hH, 4*scale, hH);
      this.ctx.fillRect(pSouth.x - 12*scale, pSouth.y - hH, 4*scale, hH);

      // Tempel-Giebel (Dreieckiges Dach)
      this.ctx.fillStyle = '#2980b9'; // Blue roof
      this.ctx.strokeStyle = '#1f618d';
      this.ctx.beginPath();
      this.ctx.moveTo(pWest.x - 2*scale, pWest.y - hH);
      this.ctx.lineTo(center.x, center.y - hH - 16*scale);
      this.ctx.lineTo(pEast.x + 2*scale, pEast.y - hH);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();
      break;
    }
    // ── BRAUEREI ──────────────────────────────────────────────────
    case BUILDING_TYPES.BREWERY: {
      const hH = 24 * scale;
      this.drawCobbleBase(pNorth, pEast, pSouth, pWest);

      // Westwand (Backstein warm)
      this.ctx.fillStyle = '#b03a2e';
      this.ctx.strokeStyle = '#78281f';
      this.ctx.lineWidth = 1 * scale;
      this.ctx.beginPath();
      this.ctx.moveTo(pWest.x, pWest.y);
      this.ctx.lineTo(pSouth.x, pSouth.y);
      this.ctx.lineTo(pSouth.x, pSouth.y - hH);
      this.ctx.lineTo(pWest.x, pWest.y - hH);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Ostwand
      this.ctx.fillStyle = '#943126';
      this.ctx.beginPath();
      this.ctx.moveTo(pEast.x, pEast.y);
      this.ctx.lineTo(pSouth.x, pSouth.y);
      this.ctx.lineTo(pSouth.x, pSouth.y - hH);
      this.ctx.lineTo(pEast.x, pEast.y - hH);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Kupferner Kessel (Halbkreis auf dem Dach)
      this.ctx.fillStyle = '#d35400'; // Copper orange
      this.ctx.strokeStyle = '#a04000';
      this.ctx.beginPath();
      this.ctx.arc(center.x, center.y - hH, 12 * scale, Math.PI, 0);
      this.ctx.closePath();
      this.ctx.fill(); this.ctx.stroke();

      // Dampfwolke
      if (!b.underConstruction && Math.random() < 0.15) {
        this.spawnSmokeParticle(center.x, center.y - hH - 14 * scale);
      }
      break;
    }
  }

  // Baufortschritts-Balken
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
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 0.5 * scale;
    this.ctx.strokeRect(bx, by, barW, barH);
  } else {
    // Level-Text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2 * scale;
    this.ctx.font = `bold ${Math.max(8, Math.round(9 * scale))}px Arial`;
    this.ctx.textAlign = 'center';
    const lvlY = center.y + (b.type === BUILDING_TYPES.FORTRESS ? -20*scale : 10*scale);
    this.ctx.strokeText(`Lvl ${b.level}`, center.x, lvlY);
    this.ctx.fillText(`Lvl ${b.level}`, center.x, lvlY);
  }

  this.ctx.restore();
};

// ================================================================
// VERBESSERTE WELTKARTE
// Überschreibt drawWorldMapView() mit Terrain, Wäldern, Bergen, Flüssen
// ================================================================
const _origDrawWorldMap = GameCanvas.prototype.drawWorldMapView;
GameCanvas.prototype.drawWorldMapView = function() {
  const W = WORLD_MAP_CONFIG.width;
  const H = WORLD_MAP_CONFIG.height;
  const ox = this.offset.x;
  const oy = this.offset.y;
  const ctx = this.ctx;
  const time = this.animationTime;

  ctx.save();

  // ── Hintergrund: Terrain-Gradient ─────────────────────────────
  const bgGrad = ctx.createRadialGradient(ox + W*0.45, oy + H*0.5, 20, ox + W*0.5, oy + H*0.5, W*0.7);
  bgGrad.addColorStop(0.0, '#4a7c4e'); // Zentrum: Grün (Ebene)
  bgGrad.addColorStop(0.45, '#5a7c44');
  bgGrad.addColorStop(0.7, '#8d7950'); // Außen: Braun (Bergig)
  bgGrad.addColorStop(1.0, '#7a6540');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(ox, oy, W, H);

  // ── Hügelketten im Norden ────────────────────────────────────
  ctx.fillStyle = 'rgba(120, 100, 65, 0.55)';
  const hillData = [
    { cx: 0.1, cy: 0.15, rx: 80, ry: 40 },
    { cx: 0.25, cy: 0.08, rx: 100, ry: 55 },
    { cx: 0.7, cy: 0.12, rx: 90, ry: 48 },
    { cx: 0.85, cy: 0.22, rx: 70, ry: 38 },
    { cx: 0.95, cy: 0.85, rx: 60, ry: 35 },
    { cx: 0.05, cy: 0.75, rx: 75, ry: 40 },
  ];
  hillData.forEach(hd => {
    ctx.beginPath();
    ctx.ellipse(ox + W * hd.cx, oy + H * hd.cy, hd.rx, hd.ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Schneebedeckte Bergspitzen
  ctx.fillStyle = 'rgba(240, 245, 255, 0.7)';
  hillData.forEach((hd, i) => {
    if (i % 2 === 0) {
      const px = ox + W * hd.cx;
      const py = oy + H * hd.cy;
      ctx.beginPath();
      ctx.moveTo(px - 18, py - hd.ry * 0.3);
      ctx.lineTo(px, py - hd.ry - 15);
      ctx.lineTo(px + 18, py - hd.ry * 0.3);
      ctx.closePath();
      ctx.fill();
    }
  });

  // ── Wälder (Baumgruppen) ──────────────────────────────────────
  const forests = [
    { x: 0.15, y: 0.35 }, { x: 0.18, y: 0.4 }, { x: 0.13, y: 0.42 },
    { x: 0.8, y: 0.4 }, { x: 0.82, y: 0.45 }, { x: 0.78, y: 0.48 },
    { x: 0.6, y: 0.7 }, { x: 0.62, y: 0.73 }, { x: 0.58, y: 0.75 },
    { x: 0.35, y: 0.75 }, { x: 0.38, y: 0.78 },
  ];
  forests.forEach((f, i) => {
    const fx = ox + W * f.x + Math.sin(time * 0.8 + i * 1.3) * 0.5;
    const fy = oy + H * f.y;
    const r = 12 + (i % 3) * 4;
    // Baumkrone
    ctx.fillStyle = `hsl(${120 + (i * 7 % 20)}, 45%, ${25 + (i % 3) * 5}%)`;
    ctx.beginPath();
    ctx.arc(fx, fy, r, 0, Math.PI * 2);
    ctx.fill();
    // Baumstamm
    ctx.fillStyle = '#5a3e28';
    ctx.fillRect(fx - 2, fy + r * 0.5, 4, r * 0.8);
  });

  // ── Fluss (gewunden) ──────────────────────────────────────────
  ctx.strokeStyle = 'rgba(52, 152, 219, 0.6)';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(ox + W * 0.42, oy);
  ctx.bezierCurveTo(
    ox + W * 0.38, oy + H * 0.2,
    ox + W * 0.45, oy + H * 0.35,
    ox + W * 0.40, oy + H * 0.55
  );
  ctx.bezierCurveTo(
    ox + W * 0.36, oy + H * 0.7,
    ox + W * 0.42, oy + H * 0.85,
    ox + W * 0.38, oy + H
  );
  ctx.stroke();

  // Fluss Highlights
  ctx.strokeStyle = 'rgba(135, 206, 235, 0.35)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ox + W * 0.41, oy);
  ctx.bezierCurveTo(
    ox + W * 0.37, oy + H * 0.2,
    ox + W * 0.44, oy + H * 0.35,
    ox + W * 0.39, oy + H * 0.55
  );
  ctx.stroke();

  // ── Wegenetz ──────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(180, 155, 110, 0.5)';
  ctx.lineWidth = 3;
  ctx.setLineDash([6, 4]);
  // Wege zu den NPCs
  WORLD_MAP_CONFIG.npcCastles.forEach(npc => {
    ctx.beginPath();
    ctx.moveTo(ox + WORLD_MAP_CONFIG.playerCastle.x, oy + WORLD_MAP_CONFIG.playerCastle.y);
    ctx.lineTo(ox + npc.x, oy + npc.y);
    ctx.stroke();
  });
  ctx.setLineDash([]);

  // ── Gitter dezent ─────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(100, 80, 50, 0.08)';
  ctx.lineWidth = 1;
  for (let x = 100; x < W; x += 100) {
    ctx.beginPath();
    ctx.moveTo(ox + x, oy);
    ctx.lineTo(ox + x, oy + H);
    ctx.stroke();
  }
  for (let y = 100; y < H; y += 100) {
    ctx.beginPath();
    ctx.moveTo(ox, oy + y);
    ctx.lineTo(ox + W, oy + y);
    ctx.stroke();
  }

  // ── Rahmen ────────────────────────────────────────────────────
  ctx.strokeStyle = '#8d6e63';
  ctx.lineWidth = 5;
  ctx.strokeRect(ox, oy, W, H);

  ctx.restore();

  // ── Marsch-Linien, Einheiten und NPCs (Original-Logik) ────────
  this._drawWorldMapEntities();
};

GameCanvas.prototype._drawWorldMapEntities = function() {
  const ctx = this.ctx;
  const ox = this.offset.x;
  const oy = this.offset.y;
  const time = Date.now() / 1000;

  // Missions und Einheiten (direkt übernommen, verbessert)
  stateManager.state.missions.forEach(m => {
    const isOutpost = m.targetType === 'outpost';
    const target = isOutpost
      ? WORLD_MAP_CONFIG.outposts.find(o => o.id === m.targetId)
      : WORLD_MAP_CONFIG.npcCastles.find(c => c.id === m.targetId);
    if (!target) return;

    const playerX = ox + WORLD_MAP_CONFIG.playerCastle.x;
    const playerY = oy + WORLD_MAP_CONFIG.playerCastle.y;
    const targetX = ox + target.x;
    const targetY = oy + target.y;

    if (m.type === 'spy') ctx.strokeStyle = '#7f8c8d';
    else if (m.type === 'counter-attack') ctx.strokeStyle = '#e74c3c';
    else ctx.strokeStyle = '#d45c37';

    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    const dashDir = m.status === 'returning' ? 1 : -1;
    ctx.lineDashOffset = dashDir * time * 20;
    ctx.beginPath();
    ctx.moveTo(playerX, playerY);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;

    const now = Date.now();
    const elapsed = (now - m.departureTime) / 1000;
    let pct = Math.min(1.0, elapsed / m.duration);
    if (m.status === 'returning') pct = 1.0 - pct;

    const rx = playerX + (targetX - playerX) * pct;
    let ry = playerY + (targetY - playerY) * pct;
    const bob = Math.abs(Math.sin(time * 12)) * 4;
    ry -= bob;

    if (m.type === 'spy') {
      ctx.fillStyle = '#34495e'; ctx.strokeStyle = '#ecf0f1'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(rx, ry, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f1c40f';
      ctx.beginPath(); ctx.arc(rx - 1, ry - 1, 0.8, 0, Math.PI * 2);
      ctx.arc(rx + 1, ry - 1, 0.8, 0, Math.PI * 2); ctx.fill();
    } else if (m.type === 'counter-attack') {
      ctx.fillStyle = '#c0392b'; ctx.strokeStyle = '#f1c40f'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(rx, ry, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('!', rx, ry);
    } else {
      ctx.fillStyle = '#3498db'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(rx, ry, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.arc(rx, ry - 1, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillRect(rx - 2, ry + 2, 4, 3);
    }

    const remaining = Math.max(0, Math.round(m.duration - elapsed));
    ctx.fillStyle = '#000'; ctx.font = 'bold 10px Arial'; ctx.textAlign = 'center';
    ctx.fillText(`${remaining}s`, rx, ry - 12 - bob);
  });

  // ── Spieler-Burg (verbessert, mit Schild-Icon) ────────────────
  const pCastle = WORLD_MAP_CONFIG.playerCastle;
  const px = ox + pCastle.x;
  const py = oy + pCastle.y;

  // Glühender Halo
  const halo = ctx.createRadialGradient(px, py, 10, px, py, 32);
  halo.addColorStop(0, 'rgba(52, 152, 219, 0.4)');
  halo.addColorStop(1, 'rgba(52, 152, 219, 0)');
  ctx.fillStyle = halo;
  ctx.beginPath(); ctx.arc(px, py, 32, 0, Math.PI * 2); ctx.fill();

  // Schild-Basis
  ctx.fillStyle = '#2980b9';
  ctx.strokeStyle = '#1a5276';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(px, py, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  // Burg-Turm Icon
  ctx.fillStyle = '#ecf0f1';
  ctx.fillRect(px - 6, py - 8, 12, 14);
  ctx.fillRect(px - 8, py - 5, 4, 11);
  ctx.fillRect(px + 4, py - 5, 4, 11);
  ctx.fillStyle = '#2980b9';
  ctx.fillRect(px - 2, py - 2, 4, 8);

  // Zinnen-Muster
  ctx.fillStyle = '#ecf0f1';
  for (let i = -1; i <= 1; i++) {
    ctx.fillRect(px + i * 5 - 1.5, py - 10, 3, 4);
  }

  ctx.fillStyle = '#1a3a5c';
  ctx.font = 'bold 11px Inter, Arial';
  ctx.textAlign = 'center';
  ctx.fillText(stateManager.state.castleName, px, py + 30);
  ctx.fillStyle = '#f1c40f';
  ctx.font = '9px Inter, Arial';
  ctx.fillText('⭐ Meine Burg', px, py + 41);

  // ── NPC-Burgen ────────────────────────────────────────────────
  WORLD_MAP_CONFIG.npcCastles.forEach(npc => {
    const nx = ox + npc.x;
    const ny = oy + npc.y;
    const isHovered = this.hoveredNpcId === npc.id;
    const isScouted = stateManager.state.scoutedSites?.[npc.id] || npc.level === 1;

    if (isScouted) {
      const lvlColor = npc.level <= 3 ? '#e67e22' : npc.level <= 6 ? '#e74c3c' : '#8e44ad';
      const haloR = ctx.createRadialGradient(nx, ny, 8, nx, ny, 26);
      
      // Correctly convert hex to rgba format
      let r = 0, g = 0, b = 0;
      if (lvlColor.startsWith('#')) {
        r = parseInt(lvlColor.slice(1, 3), 16);
        g = parseInt(lvlColor.slice(3, 5), 16);
        b = parseInt(lvlColor.slice(5, 7), 16);
      }
      haloR.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
      haloR.addColorStop(1, 'transparent');

      // Draw the glowing halo behind the castle
      ctx.fillStyle = haloR;
      ctx.beginPath();
      ctx.arc(nx, ny, 26, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = lvlColor;
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(nx, ny, 18 + (isHovered ? 4 : 0), 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Burg-Silhouette
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillRect(nx - 5, ny - 6, 10, 11);
      ctx.fillRect(nx - 7, ny - 3, 3, 9);
      ctx.fillRect(nx + 4, ny - 3, 3, 9);
      // Zinnen
      for (let i = -2; i <= 2; i += 2) {
        ctx.fillRect(nx + i * 2 - 1.5, ny - 8, 3, 3);
      }

      // Level-Abzeichen
      ctx.fillStyle = '#f1c40f';
      ctx.strokeStyle = '#d4ac0d';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(nx + 14, ny - 12, 9, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#222';
      ctx.font = 'bold 9px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(npc.level, nx + 14, ny - 12);

      ctx.fillStyle = '#1a1a1a';
      ctx.font = isHovered ? 'bold 11px Arial' : '10px Arial';
      ctx.textBaseline = 'alphabetic';
      ctx.textAlign = 'center';
      ctx.fillText(`${npc.name}`, nx, ny + 28);
      if (isHovered) {
        ctx.fillStyle = '#e74c3c';
        ctx.fillText(`⚔ Lvl ${npc.level} — Klicken zum Angriff`, nx, ny + 40);
      }
    } else {
      // Nebel des Krieges
      const fogGrad = ctx.createRadialGradient(nx, ny, 5, nx, ny, 22);
      fogGrad.addColorStop(0, 'rgba(50,50,50,0.9)');
      fogGrad.addColorStop(1, 'rgba(30,30,30,0.6)');
      ctx.fillStyle = fogGrad;
      ctx.strokeStyle = '#555';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(nx, ny, 18, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#bdc3c7';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('?', nx, ny);
    }
  });

  // ── Außenposten ───────────────────────────────────────────────
  if (WORLD_MAP_CONFIG.outposts) {
    WORLD_MAP_CONFIG.outposts.forEach(op => {
      const opx = ox + op.x;
      const opy = oy + op.y;
      const opState = stateManager.state.outposts?.[op.id];
      const isPlayer = opState?.owner === 'player';
      const isHov = this.hoveredOutpostId === op.id;
      const isScouted = stateManager.state.scoutedSites?.[op.id] || isPlayer || op.isControlPoint;

      if (isScouted) {
        ctx.fillStyle = isPlayer ? '#27ae60' : '#e67e22';
        ctx.strokeStyle = isPlayer ? '#1e8449' : '#d35400';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(opx, opy, 14 + (isHov ? 3 : 0), 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = '13px Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(isPlayer ? '🏴' : '🚩', opx, opy);
        ctx.fillStyle = '#111';
        ctx.font = '9px Arial'; ctx.textBaseline = 'alphabetic';
        ctx.fillText(op.name, opx, opy + 22);
      } else {
        // Nebel des Krieges für Außenposten
        const fogGrad = ctx.createRadialGradient(opx, opy, 5, opx, opy, 18);
        fogGrad.addColorStop(0, 'rgba(50,50,50,0.9)');
        fogGrad.addColorStop(1, 'rgba(30,30,30,0.6)');
        ctx.fillStyle = fogGrad;
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(opx, opy, 14, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#bdc3c7';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('?', opx, opy);
      }
    });
  }
};
