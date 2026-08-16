// --- DRAG-TO-BUILD WALL & MOAT LINE EDITOR ---

class WallLineEditor {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.activeLineMode = null; // 'wall', 'moat'
    this.startCell = null;
    this.linePreviewCells = [];
  }

  startLine(type, gridX, gridY) {
    this.activeLineMode = type;
    this.startCell = { x: gridX, y: gridY };
    this.linePreviewCells = [{ x: gridX, y: gridY }];
  }

  updateLine(gridX, gridY) {
    if (!this.startCell) return;
    this.linePreviewCells = [];

    const dx = gridX - this.startCell.x;
    const dy = gridY - this.startCell.y;

    // Draw straight horizontal or vertical line
    if (Math.abs(dx) >= Math.abs(dy)) {
      const step = dx >= 0 ? 1 : -1;
      for (let x = this.startCell.x; step > 0 ? x <= gridX : x >= gridX; x += step) {
        this.linePreviewCells.push({ x: x, y: this.startCell.y });
      }
    } else {
      const step = dy >= 0 ? 1 : -1;
      for (let y = this.startCell.y; step > 0 ? y <= gridY : y >= gridY; y += step) {
        this.linePreviewCells.push({ x: this.startCell.x, y: y });
      }
    }
  }

  confirmLinePlacement() {
    if (!this.activeLineMode || this.linePreviewCells.length === 0) return;

    let placedCount = 0;
    const costPerTile = this.activeLineMode === 'wall' ? { stone: 20, gold: 10 } : { stone: 30, gold: 15 };

    this.linePreviewCells.forEach(cell => {
      if (stateManager.state.stone >= costPerTile.stone && stateManager.state.gold >= costPerTile.gold) {
        stateManager.state.stone -= costPerTile.stone;
        stateManager.state.gold -= costPerTile.gold;

        const buildingType = this.activeLineMode === 'wall' ? BUILDING_TYPES.WALL : BUILDING_TYPES.MOAT;
        stateManager.state.buildings.push({
          id: 'b_' + Math.random().toString(36).substr(2, 9),
          type: buildingType,
          x: cell.x,
          y: cell.y,
          level: 1,
          underConstruction: false
        });
        placedCount++;
      }
    });

    if (placedCount > 0) {
      this.autoConvertCorners();
      this.gameUI.showFloatingNotification(`🧱 ${placedCount} ${this.activeLineMode === 'wall' ? 'Mauerabschnitte' : 'Grabenabschnitte'} platziert!`);
      window.soundManager && window.soundManager.playSFX('stone');
    }

    this.activeLineMode = null;
    this.startCell = null;
    this.linePreviewCells = [];
  }

  autoConvertCorners() {
    const buildings = this.stateManager.state.buildings;
    const walls = buildings.filter(b => b.type === BUILDING_TYPES.WALL);
    
    walls.forEach(w => {
      const neighbors = walls.filter(other => {
        const dx = Math.abs(other.x - w.x);
        const dy = Math.abs(other.y - w.y);
        return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
      });

      // If wall connects orthogonally in 2 perpendicular directions (L-shape corner), upgrade to corner tower
      if (neighbors.length >= 2) {
        const hasHorizontal = neighbors.some(n => n.x !== w.x);
        const hasVertical = neighbors.some(n => n.y !== w.y);
        if (hasHorizontal && hasVertical) {
          w.isCornerTower = true;
          w.cornerSymbol = '🏰';
        }
      }
    });
  }

  placeGatehouse(gridX, gridY) {
    const state = this.stateManager.state;
    const cost = { stone: 100, gold: 80 };
    if ((state.resources.stone || 0) < cost.stone || (state.resources.gold || 0) < cost.gold) {
      this.gameUI.showFloatingNotification('Nicht genug Stein oder Gold für ein Burgtor!');
      return false;
    }

    state.resources.stone -= cost.stone;
    state.resources.gold -= cost.gold;
    state.buildings.push({
      id: 'gate_' + Math.random().toString(36).substr(2, 9),
      type: BUILDING_TYPES.WALL,
      isGatehouse: true,
      isOpen: false,
      x: gridX,
      y: gridY,
      level: 1,
      underConstruction: false
    });

    this.gameUI.showFloatingNotification('🚪 Burgtor mit Zugbrücke platziert!');
    if (window.soundManager) window.soundManager.playSFX('blacksmith');
    return true;
  }
}

window.WallLineEditor = WallLineEditor;

