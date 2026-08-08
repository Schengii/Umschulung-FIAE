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
      this.gameUI.showFloatingNotification(`🧱 ${placedCount} ${this.activeLineMode === 'wall' ? 'Mauerabschnitte' : 'Grabenabschnitte'} platziert!`);
      window.soundManager && window.soundManager.playSFX('stone');
    }

    this.activeLineMode = null;
    this.startCell = null;
    this.linePreviewCells = [];
  }
}

window.WallLineEditor = WallLineEditor;
