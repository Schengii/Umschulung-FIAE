// ============================================================
// Amazon 2.0 – Interactive 3D / AR Product Visualizer (Canvas 3D Engine)
// ============================================================
import type { Product } from '../types';
import { showToast } from './toast';

export function open3DViewerModal(product: Product): void {
  let modal = document.getElementById('viewer3DModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'viewer3DModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-dialog viewer3d-dialog">
      <button class="modal-close" id="close3DModal">✕</button>
      <div class="viewer3d-header">
        <h2>📦 3D & AR Studio: ${product.title}</h2>
        <span class="viewer3d-badge">360° Interaktiv</span>
      </div>

      <div class="canvas3d-container">
        <canvas id="product3dCanvas" width="480" height="340"></canvas>
        <div class="canvas3d-controls-overlay">
          <span>🖱️ Ziehen zum Drehen</span>
          <span>🔍 Scrollen zum Zoomen</span>
        </div>
      </div>

      <div class="viewer3d-toolbar">
        <div class="color-picker-3d">
          <label>Farbe:</label>
          <button class="color-swatch active" data-color="#1e293b" style="background:#1e293b;" title="Space Grau"></button>
          <button class="color-swatch" data-color="#cbd5e1" style="background:#cbd5e1;" title="Silber"></button>
          <button class="color-swatch" data-color="#eab308" style="background:#eab308;" title="Gold"></button>
          <button class="color-swatch" data-color="#0284c7" style="background:#0284c7;" title="Pazifikblau"></button>
        </div>

        <div class="action-btns-3d">
          <button class="btn-secondary sm" id="autoRotateBtn">🔄 Auto-Rotate: AN</button>
          <button class="btn-primary sm" id="launchArBtn">📱 Im Raum ansehen (AR)</button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('open');

  const closeModal = () => {
    modal?.classList.remove('open');
    stop3DRenderLoop();
  };
  document.getElementById('close3DModal')?.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // Init Canvas 3D Engine
  const canvas = document.getElementById('product3dCanvas') as HTMLCanvasElement;
  if (canvas) init3DRenderer(canvas);

  // Wire buttons
  let isAutoRotating = true;
  const autoRotateBtn = document.getElementById('autoRotateBtn');
  autoRotateBtn?.addEventListener('click', () => {
    isAutoRotating = !isAutoRotating;
    if (autoRotateBtn) autoRotateBtn.textContent = `🔄 Auto-Rotate: ${isAutoRotating ? 'AN' : 'AUS'}`;
    toggleAutoRotate(isAutoRotating);
  });

  document.getElementById('launchArBtn')?.addEventListener('click', () => {
    openARSimModal(product);
  });

  modal.querySelectorAll('.color-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
      modal?.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      const hex = swatch.getAttribute('data-color')!;
      setProductColor(hex);
    });
  });
}

// ── HTML5 Canvas 3D Mesh Engine ────────────────────────────────
let animFrameId: number | null = null;
let rotationX = 0.4;
let rotationY = 0.6;
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;
let autoRotate = true;
let currentColor = '#1e293b';

function setProductColor(hex: string): void {
  currentColor = hex;
}

function toggleAutoRotate(flag: boolean): void {
  autoRotate = flag;
}

function stop3DRenderLoop(): void {
  if (animFrameId) cancelAnimationFrame(animFrameId);
}

function init3DRenderer(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  canvas.addEventListener('mousedown', e => {
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;
    rotationY += deltaX * 0.01;
    rotationX += deltaY * 0.01;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  // 3D Cube/Product Mesh Vertices
  const size = 70;
  const vertices = [
    [-size, -size, -size],
    [size, -size, -size],
    [size, size, -size],
    [-size, size, -size],
    [-size, -size, size],
    [size, -size, size],
    [size, size, size],
    [-size, size, size],
  ];

  const faces = [
    [0, 1, 2, 3], // Back
    [4, 5, 6, 7], // Front
    [0, 1, 5, 4], // Bottom
    [2, 3, 7, 6], // Top
    [0, 3, 7, 4], // Left
    [1, 2, 6, 5], // Right
  ];

  function render(): void {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);

    if (autoRotate && !isDragging) {
      rotationY += 0.012;
    }

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Rotate & Project
    const projected = vertices.map(([x, y, z]) => {
      // Rotate Y
      const x1 = x * Math.cos(rotationY) + z * Math.sin(rotationY);
      const z1 = -x * Math.sin(rotationY) + z * Math.cos(rotationY);

      // Rotate X
      const y2 = y * Math.cos(rotationX) - z1 * Math.sin(rotationX);
      const z2 = y * Math.sin(rotationX) + z1 * Math.cos(rotationX);

      // Perspective Projection
      const fov = 300;
      const scale = fov / (fov + z2 + 180);
      return {
        x: cx + x1 * scale,
        y: cy + y2 * scale,
        z: z2,
      };
    });

    // Sort faces by Z-depth
    const sortedFaces = faces.map(face => {
      const avgZ = (projected[face[0]].z + projected[face[1]].z + projected[face[2]].z + projected[face[3]].z) / 4;
      return { face, avgZ };
    }).sort((a, b) => b.avgZ - a.avgZ);

    // Draw faces
    sortedFaces.forEach(({ face }) => {
      ctx!.beginPath();
      ctx!.moveTo(projected[face[0]].x, projected[face[0]].y);
      ctx!.lineTo(projected[face[1]].x, projected[face[1]].y);
      ctx!.lineTo(projected[face[2]].x, projected[face[2]].y);
      ctx!.lineTo(projected[face[3]].x, projected[face[3]].y);
      ctx!.closePath();

      ctx!.fillStyle = currentColor;
      ctx!.fill();
      ctx!.strokeStyle = '#38bdf8';
      ctx!.lineWidth = 1.5;
      ctx!.stroke();
    });

    animFrameId = requestAnimationFrame(render);
  }

  render();
}

// ── AR Camera Room Simulation Modal ───────────────────────────
function openARSimModal(product: Product): void {
  let arModal = document.getElementById('arSimModal');
  if (!arModal) {
    arModal = document.createElement('div');
    arModal.id = 'arSimModal';
    arModal.className = 'modal-overlay';
    document.body.appendChild(arModal);
  }

  arModal.innerHTML = `
    <div class="modal-dialog ar-dialog">
      <button class="modal-close" id="closeArModal">✕</button>
      <div class="ar-camera-view">
        <div class="ar-grid-overlay"></div>
        <div class="ar-object-placed">
          <img src="${product.images[0]}" alt="${product.title}" />
          <div class="ar-dimensions-badge">📏 B: 35cm | H: 20cm</div>
        </div>
        <div class="ar-status-badge">📱 AR Live-Kamera Platzierung</div>
      </div>
      <p class="ar-hint">Bewege dein Smartphone, um das Produkt im Raum auszurichten.</p>
    </div>
  `;

  arModal.classList.add('open');

  document.getElementById('closeArModal')?.addEventListener('click', () => {
    arModal?.classList.remove('open');
  });

  showToast('📱 AR Modus gestartet: Produkt im Raum platziert', 'info');
}
