// --- KEYBOARD SHORTCUTS & INPUT HANDLER ---

class KeyboardInput {
  constructor(canvasRenderer, gameUI) {
    this.canvas = canvasRenderer;
    this.gameUI = gameUI;
    this.keysDown = {};
    this.panSpeed = 12;
  }

  init() {
    window.addEventListener('keydown', (e) => {
      // Ignore inputs if user is typing in a form / textarea / modal input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;

      this.keysDown[e.key.toLowerCase()] = true;
      this.handleSinglePress(e);
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown[e.key.toLowerCase()] = false;
    });

    // Continuous update loop for smooth camera panning via WASD
    requestAnimationFrame(() => this.updateLoop());
  }

  handleSinglePress(e) {
    const key = e.key.toLowerCase();

    // Hotkey bindings
    if (key === 'b') {
      const btnBuild = document.getElementById('btn-build-menu');
      if (btnBuild) btnBuild.click();
    } else if (key === 'm') {
      if (window.interactiveWorldMap) window.interactiveWorldMap.showModal();
    } else if (key === 'h') {
      const btnHero = document.getElementById('btn-hero-menu');
      if (btnHero) btnHero.click();
    } else if (key === 'escape') {
      if (this.gameUI && this.gameUI.closeModal) {
        this.gameUI.closeModal();
      }
    } else if (key === ' ') {
      // Toggle Pause or speed up game
      e.preventDefault();
      if (window.stateManager) {
        const isPaused = window.stateManager.togglePause ? window.stateManager.togglePause() : false;
        if (this.gameUI && this.gameUI.showFloatingNotification) {
          this.gameUI.showFloatingNotification(isPaused ? '⏸️ Spiel pausiert' : '▶️ Spiel läuft');
        }
      }
    } else if (key === 'g') {
      if (window.gamepadInput) window.gamepadInput.toggleVirtualCursor();
    }
  }

  updateLoop() {
    if (this.canvas) {
      if (this.keysDown['w'] || this.keysDown['arrowup']) {
        this.canvas.cameraY -= this.panSpeed;
      }
      if (this.keysDown['s'] || this.keysDown['arrowdown']) {
        this.canvas.cameraY += this.panSpeed;
      }
      if (this.keysDown['a'] || this.keysDown['arrowleft']) {
        this.canvas.cameraX -= this.panSpeed;
      }
      if (this.keysDown['d'] || this.keysDown['arrowright']) {
        this.canvas.cameraX += this.panSpeed;
      }
    }

    requestAnimationFrame(() => this.updateLoop());
  }
}

window.KeyboardInput = KeyboardInput;
