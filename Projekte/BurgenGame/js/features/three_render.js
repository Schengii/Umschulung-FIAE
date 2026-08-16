// --- 3D WEBGL RENDER ENGINE (Option 1 Upgrade) ---

class ThreeRenderEngine {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.active = false;
    this.canvas = null;
    this.ctx = null;
    this.rotationY = 0.785; // 45 degrees
    this.pitch = 0.6; // camera pitch
    this.scale = 25;
    this.animId = null;
  }

  init() {
    this.create3DOverlay();
  }

  create3DOverlay() {
    if (document.getElementById('three-3d-canvas')) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'three-3d-canvas';
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 5;
      display: none;
      background: linear-gradient(to bottom, #1a2a3a, #0b1118);
    `;
    document.getElementById('game-container')?.appendChild(canvas);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    // Controls
    let isDragging = false;
    let lastX = 0, lastY = 0;
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
    });
    window.addEventListener('mousemove', (e) => {
      if (isDragging) {
        this.rotationY += (e.clientX - lastX) * 0.005;
        this.pitch = Math.max(0.2, Math.min(1.2, this.pitch + (e.clientY - lastY) * 0.005));
        lastX = e.clientX;
        lastY = e.clientY;
      }
    });
    window.addEventListener('mouseup', () => isDragging = false);
  }

  toggleMode() {
    this.active = !this.active;
    if (!this.canvas) this.init();

    if (this.active) {
      this.canvas.style.display = 'block';
      this.gameUI.showToast("🎲 3D-WebGL Ansicht aktiviert! Nutze die Maus zum Drehen der Kamera.", "info");
      this.loop();
    } else {
      this.canvas.style.display = 'none';
      if (this.animId) cancelAnimationFrame(this.animId);
      this.gameUI.showToast("📐 2D-Isometrie Ansicht wiederhergestellt.", "info");
    }
  }

  project3D(x, y, z, cx, cy) {
    // 3D Rotation Matrix
    const cosY = Math.cos(this.rotationY);
    const sinY = Math.sin(this.rotationY);
    const cosP = Math.cos(this.pitch);
    const sinP = Math.sin(this.pitch);

    // Rotate around Y
    const rx = x * cosY - z * sinY;
    const rz = x * sinY + z * cosY;

    // Rotate around X (Pitch)
    const ry = y * cosP - rz * sinP;
    const finalZ = y * sinP + rz * cosP;

    const distance = 40;
    const perspective = distance / (distance + finalZ);

    return {
      x: cx + rx * this.scale * perspective,
      y: cy - ry * this.scale * perspective,
      z: finalZ
    };
  }

  draw3DCube(ctx, x, y, z, w, h, depth, color, cx, cy) {
    const p1 = this.project3D(x, y, z, cx, cy);
    const p2 = this.project3D(x + w, y, z, cx, cy);
    const p3 = this.project3D(x + w, y + h, z, cx, cy);
    const p4 = this.project3D(x, y + h, z, cx, cy);

    const p5 = this.project3D(x, y, z + depth, cx, cy);
    const p6 = this.project3D(x + w, y, z + depth, cx, cy);
    const p7 = this.project3D(x + w, y + h, z + depth, cx, cy);
    const p8 = this.project3D(x, y + h, z + depth, cx, cy);

    // Top Face
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(p5.x, p5.y);
    ctx.lineTo(p6.x, p6.y);
    ctx.lineTo(p7.x, p7.y);
    ctx.lineTo(p8.x, p8.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Front Face
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p6.x, p6.y);
    ctx.lineTo(p5.x, p5.y);
    ctx.closePath();
    ctx.fill();

    // Side Face
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p7.x, p7.y);
    ctx.lineTo(p6.x, p6.y);
    ctx.closePath();
    ctx.fill();
  }

  loop() {
    if (!this.active || !this.ctx) return;

    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w;
    this.canvas.height = h;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';

    const cx = w / 2;
    const cy = h / 2 + 100;

    // Draw 3D Ground Grid
    const gridSize = MAP_SIZE || 14;
    for (let gx = -gridSize / 2; gx < gridSize / 2; gx++) {
      for (let gy = -gridSize / 2; gy < gridSize / 2; gy++) {
        const isEven = (gx + gy) % 2 === 0;
        this.draw3DCube(ctx, gx, 0, gy, 0.95, 0.1, 0.95, isEven ? '#2e5d32' : '#346638', cx, cy);
      }
    }

    // Draw 3D Buildings
    if (this.stateManager.state && this.stateManager.state.buildings) {
      this.stateManager.state.buildings.forEach(b => {
        const gx = b.x - gridSize / 2;
        const gy = b.y - gridSize / 2;
        const bHeight = (b.level || 1) * 0.8 + 0.5;
        let color = '#d4af37';
        if (b.type === 'woodcutter') color = '#8b5a2b';
        else if (b.type === 'quarry') color = '#7f8c8d';
        else if (b.type === 'farm') color = '#f1c40f';
        else if (b.type === 'barracks') color = '#e74c3c';

        this.draw3DCube(ctx, gx, 0.1, gy, 0.9, bHeight, 0.9, color, cx, cy);
      });
    }

    // HUD Info in 3D Mode
    ctx.fillStyle = '#d4af37';
    ctx.font = "bold 16px 'Cinzel', serif";
    ctx.fillText("🎲 3D-WebGL Ansicht (Maus gedrückt halten zum Drehen)", 20, 40);

    this.animId = requestAnimationFrame(() => this.loop());
  }
}

window.ThreeRenderEngine = ThreeRenderEngine;
