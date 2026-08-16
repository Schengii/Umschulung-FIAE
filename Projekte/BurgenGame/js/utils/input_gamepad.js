// --- GAMEPAD & CONTROLLER API HANDLER ---

class GamepadInput {
  constructor(canvasRenderer, gameUI) {
    this.canvas = canvasRenderer;
    this.gameUI = gameUI;
    this.gamepadIndex = null;
    this.cursorX = window.innerWidth / 2;
    this.cursorY = window.innerHeight / 2;
    this.virtualCursorActive = false;
    this.lastButtonStates = {};
    this.cursorElem = null;
  }

  init() {
    window.addEventListener('gamepadconnected', (e) => {
      console.log(`🎮 Gamepad verbunden: ${e.gamepad.id} auf Index ${e.gamepad.index}`);
      this.gamepadIndex = e.gamepad.index;
      this.enableVirtualCursor();
      if (this.gameUI && this.gameUI.showToast) {
        this.gameUI.showToast(`🎮 Controller verbunden: ${e.gamepad.id}`, 'info');
      }
    });

    window.addEventListener('gamepaddisconnected', (e) => {
      console.log(`🎮 Gamepad getrennt von Index ${e.gamepad.index}`);
      if (this.gamepadIndex === e.gamepad.index) {
        this.gamepadIndex = null;
        this.disableVirtualCursor();
      }
    });

    requestAnimationFrame(() => this.pollLoop());
  }

  enableVirtualCursor() {
    if (!this.cursorElem) {
      this.cursorElem = document.createElement('div');
      this.cursorElem.id = 'gamepad-virtual-cursor';
      this.cursorElem.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid #d4af37;
        background: rgba(212, 175, 55, 0.4);
        border-radius: 50%;
        pointer-events: none;
        z-index: 999999;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 10px rgba(212,175,55,0.8);
        transition: transform 0.05s ease-out;
      `;
      document.body.appendChild(this.cursorElem);
    }
    this.cursorElem.style.display = 'block';
    this.virtualCursorActive = true;
  }

  disableVirtualCursor() {
    if (this.cursorElem) {
      this.cursorElem.style.display = 'none';
    }
    this.virtualCursorActive = false;
  }

  toggleVirtualCursor() {
    if (this.virtualCursorActive) this.disableVirtualCursor();
    else this.enableVirtualCursor();
  }

  pollLoop() {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    let gp = null;

    if (this.gamepadIndex !== null && gamepads[this.gamepadIndex]) {
      gp = gamepads[this.gamepadIndex];
    } else {
      // Find first available gamepad
      for (let i = 0; i < gamepads.length; i++) {
        if (gamepads[i]) {
          gp = gamepads[i];
          this.gamepadIndex = i;
          if (!this.virtualCursorActive) this.enableVirtualCursor();
          break;
        }
      }
    }

    if (gp) {
      this.processGamepad(gp);
    }

    requestAnimationFrame(() => this.pollLoop());
  }

  processGamepad(gp) {
    const deadzone = 0.15;
    
    // Left Stick (Axes 0, 1): Camera Panning
    const axisLX = gp.axes[0];
    const axisLY = gp.axes[1];

    if (Math.abs(axisLX) > deadzone && this.canvas) {
      this.canvas.cameraX += axisLX * 15;
    }
    if (Math.abs(axisLY) > deadzone && this.canvas) {
      this.canvas.cameraY += axisLY * 15;
    }

    // Right Stick (Axes 2, 3): Move Virtual Cursor
    const axisRX = gp.axes[2] !== undefined ? gp.axes[2] : axisLX;
    const axisRY = gp.axes[3] !== undefined ? gp.axes[3] : axisLY;

    if (Math.abs(axisRX) > deadzone) {
      this.cursorX = Math.max(0, Math.min(window.innerWidth, this.cursorX + axisRX * 12));
    }
    if (Math.abs(axisRY) > deadzone) {
      this.cursorY = Math.max(0, Math.min(window.innerHeight, this.cursorY + axisRY * 12));
    }

    if (this.cursorElem) {
      this.cursorElem.style.left = `${this.cursorX}px`;
      this.cursorElem.style.top = `${this.cursorY}px`;
    }

    // Buttons
    // 0: A / Cross -> Click element at cursor
    // 1: B / Circle -> Close Modal / Esc
    // 2: X / Square -> Open Build Menu
    // 3: Y / Triangle -> Open World Map
    
    this.handleButton(gp, 0, () => this.simulateClickAtCursor());
    this.handleButton(gp, 1, () => {
      if (this.gameUI && this.gameUI.closeModal) this.gameUI.closeModal();
    });
    this.handleButton(gp, 2, () => {
      const btn = document.getElementById('btn-build-menu');
      if (btn) btn.click();
    });
    this.handleButton(gp, 3, () => {
      if (window.interactiveWorldMap) window.interactiveWorldMap.showModal();
    });

    // D-Pad navigation
    if (gp.buttons[12] && gp.buttons[12].pressed && this.canvas) this.canvas.cameraY -= 10; // Up
    if (gp.buttons[13] && gp.buttons[13].pressed && this.canvas) this.canvas.cameraY += 10; // Down
    if (gp.buttons[14] && gp.buttons[14].pressed && this.canvas) this.canvas.cameraX -= 10; // Left
    if (gp.buttons[15] && gp.buttons[15].pressed && this.canvas) this.canvas.cameraX += 10; // Right
  }

  handleButton(gp, buttonIdx, callback) {
    const isPressed = gp.buttons[buttonIdx] && gp.buttons[buttonIdx].pressed;
    const wasPressed = this.lastButtonStates[buttonIdx] || false;

    if (isPressed && !wasPressed) {
      callback();
    }
    this.lastButtonStates[buttonIdx] = isPressed;
  }

  simulateClickAtCursor() {
    const elem = document.elementFromPoint(this.cursorX, this.cursorY);
    if (elem) {
      elem.click();
      
      // Pulse visual effect on click
      if (this.cursorElem) {
        this.cursorElem.style.transform = 'translate(-50%, -50%) scale(1.5)';
        setTimeout(() => {
          if (this.cursorElem) this.cursorElem.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 150);
      }
    }
  }
}

window.GamepadInput = GamepadInput;
