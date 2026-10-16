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

        <div class="teardown-control">
          <label for="explosionRange">🔬 Explosionsansicht:</label>
          <input type="range" id="explosionRange" min="0" max="100" value="0" />
        </div>

        <div class="size-checker-control">
          <label for="sizeRefSelect">📏 Größenvergleich (Maßstab):</label>
          <select id="sizeRefSelect" class="size-ref-select">
            <option value="none">Kein Referenzobjekt</option>
            <option value="card">💳 Kreditkarte (8,5 × 5,4 cm)</option>
            <option value="mug">☕ Kaffeetasse (10 cm)</option>
            <option value="phone">📱 Smartphone (15 cm)</option>
            <option value="laptop">💻 13" Laptop (30 cm)</option>
          </select>
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

  // Explosion slider
  const explosionRange = document.getElementById('explosionRange') as HTMLInputElement;
  explosionRange?.addEventListener('input', () => {
    setExplosionLevel(Number(explosionRange.value));
  });

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

  // Reference object selector
  const sizeRefSelect = document.getElementById('sizeRefSelect') as HTMLSelectElement;
  sizeRefSelect?.addEventListener('change', () => {
    selectedReference = sizeRefSelect.value;
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
let selectedReference = 'none';

function setProductColor(hex: string): void {
  currentColor = hex;
}

function toggleAutoRotate(flag: boolean): void {
  autoRotate = flag;
}

let explosionOffset = 0;

export function setExplosionLevel(level: number): void {
  explosionOffset = (level / 100) * 60; // Max 60px layer separation
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

  const size = 65;
  const layers = [
    { name: 'Display-Glas & Touch-Matrix', zOffset: -1.2, color: 'rgba(56, 189, 248, 0.45)', stroke: '#38bdf8' },
    { name: 'OLED Panel & Sensor-Array', zOffset: -0.5, color: '#0f172a', stroke: '#818cf8' },
    { name: 'Hauptplatine & Bionic Chip', zOffset: 0.2, color: '#059669', stroke: '#10b981' },
    { name: 'Lithium-Ionen Akku', zOffset: 0.7, color: '#334155', stroke: '#94a3b8' },
    { name: 'Titan-Gehäuse & Magnete', zOffset: 1.3, color: currentColor, stroke: '#64748b' },
  ];

  function render(): void {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);

    if (autoRotate && !isDragging) {
      rotationY += 0.012;
    }

    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    layers.forEach((layer) => {
      const zShift = explosionOffset * layer.zOffset;
      const vertices = [
        [-size, -size, zShift - 8],
        [size, -size, zShift - 8],
        [size, size, zShift + 8],
        [-size, size, zShift + 8],
      ];

      const projected = vertices.map(([x, y, z]) => {
        const x1 = x * Math.cos(rotationY) + z * Math.sin(rotationY);
        const z1 = -x * Math.sin(rotationY) + z * Math.cos(rotationY);

        const y2 = y * Math.cos(rotationX) - z1 * Math.sin(rotationX);
        const z2 = y * Math.sin(rotationX) + z1 * Math.cos(rotationX);

        const fov = 300;
        const scale = fov / (fov + z2 + 200);
        return {
          x: cx + x1 * scale,
          y: cy + y2 * scale,
          z: z2,
        };
      });

      // Draw layer plate
      ctx!.beginPath();
      ctx!.moveTo(projected[0].x, projected[0].y);
      ctx!.lineTo(projected[1].x, projected[1].y);
      ctx!.lineTo(projected[2].x, projected[2].y);
      ctx!.lineTo(projected[3].x, projected[3].y);
      ctx!.closePath();

      ctx!.fillStyle = layer.zOffset === 1.3 ? currentColor : layer.color;
      ctx!.fill();
      ctx!.strokeStyle = layer.stroke;
      ctx!.lineWidth = 1.5;
      ctx!.stroke();

      // If exploded, draw component labels
      if (explosionOffset > 15) {
        ctx!.fillStyle = '#f8fafc';
        ctx!.font = '10px Inter, sans-serif';
        ctx!.fillText(layer.name, projected[1].x + 10, projected[1].y);
      }
    });

    // Draw Reference Object if active
    if (selectedReference !== 'none') {
      ctx!.save();
      const refX = 60;
      const refY = canvas.height - 90;

      ctx!.strokeStyle = '#38bdf8';
      ctx!.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx!.lineWidth = 2;

      if (selectedReference === 'card') {
        // Credit card 8.5 x 5.4 cm
        ctx!.strokeRect(refX, refY, 70, 45);
        ctx!.fillRect(refX, refY, 70, 45);
        ctx!.fillStyle = '#e2e8f0';
        ctx!.font = '10px Inter, sans-serif';
        ctx!.fillText('💳 Kreditkarte (8,5 × 5,4 cm)', refX, refY - 8);
      } else if (selectedReference === 'mug') {
        // Coffee mug
        ctx!.strokeRect(refX + 10, refY - 20, 50, 65);
        ctx!.fillRect(refX + 10, refY - 20, 50, 65);
        ctx!.fillStyle = '#e2e8f0';
        ctx!.font = '10px Inter, sans-serif';
        ctx!.fillText('☕ Kaffeetasse (10 cm)', refX, refY - 28);
      } else if (selectedReference === 'phone') {
        // Phone 15 cm
        ctx!.strokeRect(refX + 15, refY - 40, 45, 85);
        ctx!.fillRect(refX + 15, refY - 40, 45, 85);
        ctx!.fillStyle = '#e2e8f0';
        ctx!.font = '10px Inter, sans-serif';
        ctx!.fillText('📱 Smartphone (15 cm)', refX, refY - 48);
      } else if (selectedReference === 'laptop') {
        // Laptop 30 cm
        ctx!.strokeRect(refX - 20, refY - 10, 110, 55);
        ctx!.fillRect(refX - 20, refY - 10, 110, 55);
        ctx!.fillStyle = '#e2e8f0';
        ctx!.font = '10px Inter, sans-serif';
        ctx!.fillText('💻 13" Laptop (30 cm)', refX - 20, refY - 18);
      }
      ctx!.restore();
    }

    animFrameId = requestAnimationFrame(render);
  }

  render();
}

// ── AR Camera Room Simulation Modal ───────────────────────────
let cameraStream: MediaStream | null = null;

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
      <div class="ar-camera-view" id="arCameraContainer">
        <video id="arCameraVideo" class="ar-camera-feed" autoplay playsinline muted></video>
        <div class="ar-grid-overlay" id="arGridOverlay"></div>
        <div class="ar-object-placed" id="arObjectPlaced" style="transform: scale(1.0);">
          <img src="${product.images[0]}" alt="${product.title}" id="arProductImg" />
          <div class="ar-dimensions-badge">📏 B: 35cm | H: 20cm | Maßstab 1:1</div>
        </div>
        <div class="ar-status-badge" id="arStatusBadge">📱 AR Kamera-Modus</div>
      </div>

      <div class="ar-controls-bar">
        <div class="ar-scale-btns">
          <button class="btn-secondary-sm" id="arZoomOutBtn">🔍 -</button>
          <button class="btn-secondary-sm" id="arZoomInBtn">🔍 +</button>
          <button class="btn-secondary-sm" id="arCenterBtn">🎯 Zentrieren</button>
        </div>
        <button class="btn-primary-sm" id="arSnapshotBtn">📸 Foto aufnehmen</button>
      </div>
      <p class="ar-hint">Ziehe das Produkt mit der Maus oder dem Finger, um es perfekt im Raum zu platzieren.</p>
    </div>
  `;

  arModal.classList.add('open');

  const videoEl = document.getElementById('arCameraVideo') as HTMLVideoElement;
  const statusBadge = document.getElementById('arStatusBadge');

  // Try accessing real camera
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        cameraStream = stream;
        if (videoEl) {
          videoEl.srcObject = stream;
          videoEl.play().catch(() => {});
        }
        if (statusBadge) statusBadge.textContent = '🟢 Live Kamera-Feed aktiv';
      })
      .catch(() => {
        if (statusBadge) statusBadge.textContent = '📱 AR Simulator (Kamera nicht verfügbar)';
      });
  }

  // Interactive dragging of the 3D placed object
  const arObj = document.getElementById('arObjectPlaced');
  let currentScale = 1.0;
  let isDraggingObj = false;
  let startX = 0, startY = 0;
  let posX = 0, posY = 0;

  arObj?.addEventListener('mousedown', (e) => {
    isDraggingObj = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDraggingObj || !arObj) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    arObj.style.transform = `translate(${posX}px, ${posY}px) scale(${currentScale})`;
  });

  window.addEventListener('mouseup', () => { isDraggingObj = false; });

  // Zoom buttons
  document.getElementById('arZoomInBtn')?.addEventListener('click', () => {
    currentScale = Math.min(2.0, currentScale + 0.15);
    if (arObj) arObj.style.transform = `translate(${posX}px, ${posY}px) scale(${currentScale})`;
  });

  document.getElementById('arZoomOutBtn')?.addEventListener('click', () => {
    currentScale = Math.max(0.5, currentScale - 0.15);
    if (arObj) arObj.style.transform = `translate(${posX}px, ${posY}px) scale(${currentScale})`;
  });

  document.getElementById('arCenterBtn')?.addEventListener('click', () => {
    posX = 0; posY = 0; currentScale = 1.0;
    if (arObj) arObj.style.transform = `translate(0px, 0px) scale(1.0)`;
  });

  // Snapshot photo
  document.getElementById('arSnapshotBtn')?.addEventListener('click', () => {
    showToast('📸 AR Schnappschuss gespeichert!', 'success');
  });

  const closeAr = () => {
    arModal?.classList.remove('open');
    if (cameraStream) {
      cameraStream.getTracks().forEach(t => t.stop());
      cameraStream = null;
    }
  };

  document.getElementById('closeArModal')?.addEventListener('click', closeAr);
  showToast('📱 AR Modus gestartet: Platziere das Produkt in deinem Raum', 'info');
}
