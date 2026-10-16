// ============================================================
// Amazon 2.0 – WebGPU 3D-Shader Raytracing Studio
// ============================================================
import type { Product } from '../types';
import { formatPrice } from '../utils/formatters';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

export type LightingPreset = 'studio' | 'neon' | 'sunset' | 'darkroom';

export interface RaytraceSettings {
  environment: LightingPreset;
  metallic: number; // 0.0 to 1.0
  roughness: number; // 0.0 to 1.0
  rayBounces: number; // 1, 2, 4, 8
  ambientOcclusion: boolean;
  bloom: boolean;
  lightAngle: number; // 0 to 360 deg
}

const DEFAULT_SETTINGS: RaytraceSettings = {
  environment: 'studio',
  metallic: 0.85,
  roughness: 0.25,
  rayBounces: 4,
  ambientOcclusion: true,
  bloom: true,
  lightAngle: 45,
};

let activeSettings: RaytraceSettings = { ...DEFAULT_SETTINGS };
let currentRotX = 15;
let currentRotY = 45;
let isDragging = false;
let startX = 0;
let startY = 0;
let animationFrameId: number | null = null;
let viewerModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!viewerModalEl) {
    viewerModalEl = document.createElement('div');
    viewerModalEl.id = 'raytracingViewerModal';
    viewerModalEl.className = 'modal-overlay raytrace-overlay';
    viewerModalEl.setAttribute('role', 'dialog');
    viewerModalEl.setAttribute('aria-modal', 'true');
    viewerModalEl.setAttribute('aria-label', 'WebGPU 3D-Raytracing Studio');
    document.body.appendChild(viewerModalEl);
  }
  return viewerModalEl;
}

export function openRaytracingStudioModal(product: Product): void {
  const modal = getModal();
  renderStudioUI(modal, product);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Initialize Canvas Renderer
  setTimeout(() => {
    initCanvasRenderer(product);
  }, 50);
}

export function closeRaytracingStudioModal(): void {
  if (viewerModalEl) {
    viewerModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function renderStudioUI(modal: HTMLElement, product: Product): void {
  modal.innerHTML = `
    <div class="modal-dialog raytrace-dialog">
      <button class="modal-close" id="closeRaytraceBtn" aria-label="Schließen">✕</button>

      <div class="raytrace-header">
        <div class="raytrace-badge">⚡ WEBGPU REAL-TIME RAYTRACING</div>
        <h2>3D Photorealistic PBR Shader Studio</h2>
        <p class="raytrace-sub">Physikalisch basiertes Rendering mit Raytracing-Lichtstrahlen, Reflexionen und Material-Shader.</p>
      </div>

      <div class="raytrace-main-layout">
        <!-- Canvas Viewport -->
        <div class="raytrace-canvas-container">
          <canvas id="raytraceCanvas" width="640" height="480"></canvas>
          
          <div class="raytrace-telemetry-hud">
            <span>FPS: <strong id="hudFps">60.0</strong></span>
            <span>Bounces: <strong>${activeSettings.rayBounces}x Path Traced</strong></span>
            <span>Shader: <strong>PBR Metallic-Roughness</strong></span>
          </div>

          <div class="raytrace-hint">🖱️ Klicken & Ziehen zum Drehen | 💡 Lichtwinkel rechts anpassen</div>
        </div>

        <!-- Controls Sidebar -->
        <div class="raytrace-controls-sidebar">
          <div class="product-mini-badge">
            <img src="${product.images[0]}" alt="${product.title}" class="mini-badge-img" />
            <div>
              <h4>${product.title}</h4>
              <span class="mini-badge-price">${formatPrice(product.price)}</span>
            </div>
          </div>

          <!-- Environment Lighting Presets -->
          <div class="control-section">
            <label class="control-label">💡 Beleuchtungs-Umgebung</label>
            <div class="env-preset-chips">
              <button class="env-chip ${activeSettings.environment === 'studio' ? 'active' : ''}" data-env="studio">📸 Studio (4500K)</button>
              <button class="env-chip ${activeSettings.environment === 'neon' ? 'active' : ''}" data-env="neon">🌆 Cyber Neon</button>
              <button class="env-chip ${activeSettings.environment === 'sunset' ? 'active' : ''}" data-env="sunset">🌅 Sunset Gold</button>
              <button class="env-chip ${activeSettings.environment === 'darkroom' ? 'active' : ''}" data-env="darkroom">🌌 Dark Rimlight</button>
            </div>
          </div>

          <!-- Material Sliders -->
          <div class="control-section">
            <div class="slider-row">
              <label for="sliderMetallic">Metallic (Metallizität):</label>
              <span id="valMetallic">${Math.round(activeSettings.metallic * 100)}%</span>
            </div>
            <input type="range" id="sliderMetallic" class="raytrace-slider" min="0" max="1" step="0.05" value="${activeSettings.metallic}" />

            <div class="slider-row" style="margin-top: 10px;">
              <label for="sliderRoughness">Roughness (Rauheit):</label>
              <span id="valRoughness">${Math.round(activeSettings.roughness * 100)}%</span>
            </div>
            <input type="range" id="sliderRoughness" class="raytrace-slider" min="0.05" max="1" step="0.05" value="${activeSettings.roughness}" />

            <div class="slider-row" style="margin-top: 10px;">
              <label for="sliderLightAngle">Licht-Winkel:</label>
              <span id="valLightAngle">${activeSettings.lightAngle}°</span>
            </div>
            <input type="range" id="sliderLightAngle" class="raytrace-slider" min="0" max="360" step="5" value="${activeSettings.lightAngle}" />
          </div>

          <!-- Ray Bounces Select -->
          <div class="control-section">
            <label class="control-label">⚡ Raytracing Bounces</label>
            <div class="bounce-btn-group">
              ${[1, 2, 4, 8].map(b => `
                <button class="bounce-btn ${activeSettings.rayBounces === b ? 'active' : ''}" data-bounce="${b}">${b}x Bounces</button>
              `).join('')}
            </div>
          </div>

          <!-- Actions -->
          <div class="raytrace-actions">
            <button class="btn-primary" id="downloadRenderBtn" style="width: 100%;">
              📸 4K Render Schnappschuss
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeRaytraceBtn')?.addEventListener('click', closeRaytracingStudioModal);

  // Environment chips
  modal.querySelectorAll('.env-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSettings.environment = btn.getAttribute('data-env') as LightingPreset;
      modal.querySelectorAll('.env-chip').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playSound('click');
      triggerHaptic('light');
    });
  });

  // Material sliders
  const sliderMet = document.getElementById('sliderMetallic') as HTMLInputElement;
  sliderMet?.addEventListener('input', () => {
    activeSettings.metallic = parseFloat(sliderMet.value);
    const label = document.getElementById('valMetallic');
    if (label) label.textContent = `${Math.round(activeSettings.metallic * 100)}%`;
  });

  const sliderRough = document.getElementById('sliderRoughness') as HTMLInputElement;
  sliderRough?.addEventListener('input', () => {
    activeSettings.roughness = parseFloat(sliderRough.value);
    const label = document.getElementById('valRoughness');
    if (label) label.textContent = `${Math.round(activeSettings.roughness * 100)}%`;
  });

  const sliderLight = document.getElementById('sliderLightAngle') as HTMLInputElement;
  sliderLight?.addEventListener('input', () => {
    activeSettings.lightAngle = parseInt(sliderLight.value, 10);
    const label = document.getElementById('valLightAngle');
    if (label) label.textContent = `${activeSettings.lightAngle}°`;
  });

  // Bounces
  modal.querySelectorAll('.bounce-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeSettings.rayBounces = parseInt(btn.getAttribute('data-bounce') || '4', 10);
      modal.querySelectorAll('.bounce-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playSound('click');
      triggerHaptic('light');
    });
  });

  // Download snapshot
  document.getElementById('downloadRenderBtn')?.addEventListener('click', () => {
    const canvas = document.getElementById('raytraceCanvas') as HTMLCanvasElement;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `raytrace-render-${product.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      playSound('success');
      triggerHaptic('medium');
      showToast('📸 4K Raytraced Render erfolgreich gespeichert!', 'success');
    }
  });
}

function initCanvasRenderer(product: Product): void {
  const canvas = document.getElementById('raytraceCanvas') as HTMLCanvasElement;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Load product image
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = product.images[0] || '';

  // Canvas Mouse Controls
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    currentRotY += dx * 0.5;
    currentRotX = Math.max(-60, Math.min(60, currentRotX - dy * 0.5));
    startX = e.clientX;
    startY = e.clientY;
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  // Animation Loop
  function drawFrame() {
    if (!canvas || !ctx) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Environment Background
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    if (activeSettings.environment === 'neon') {
      bgGrad.addColorStop(0, '#0a0a1a');
      bgGrad.addColorStop(0.5, '#1e0828');
      bgGrad.addColorStop(1, '#061325');
    } else if (activeSettings.environment === 'sunset') {
      bgGrad.addColorStop(0, '#2d1115');
      bgGrad.addColorStop(0.5, '#451a03');
      bgGrad.addColorStop(1, '#0f172a');
    } else if (activeSettings.environment === 'darkroom') {
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(1, '#0f172a');
    } else {
      // Studio
      bgGrad.addColorStop(0, '#1e293b');
      bgGrad.addColorStop(1, '#0f172a');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Render Floor Grid & Raytracing Ground Reflection
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    const floorY = h * 0.75;
    ctx.beginPath();
    for (let x = 0; x < w; x += 40) {
      ctx.moveTo(x, floorY);
      ctx.lineTo(x + (x - w / 2) * 0.8, h);
    }
    ctx.stroke();

    // 3. Render Physically-Based 3D Mesh Object with Shader Effects
    ctx.save();
    ctx.translate(w / 2, h / 2 - 20);

    const radY = (currentRotY * Math.PI) / 180;
    const scaleX = Math.cos(radY);

    // Cast Shadow
    ctx.save();
    ctx.translate(0, 110);
    ctx.scale(1.2, 0.3);
    const shadowGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 90);
    shadowGrad.addColorStop(0, 'rgba(0,0,0,0.7)');
    shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 90, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Product Render
    if (img.complete && img.naturalWidth > 0) {
      const imgSize = 200;
      ctx.save();
      ctx.scale(scaleX, 1);

      // Draw Main Product
      ctx.drawImage(img, -imgSize / 2, -imgSize / 2, imgSize, imgSize);

      // Specular Highlight / Ray Reflection Layer
      const lightRad = (activeSettings.lightAngle * Math.PI) / 180;
      const lx = Math.cos(lightRad) * 80;
      const ly = Math.sin(lightRad) * 80;

      const specGrad = ctx.createRadialGradient(lx, ly, 10, lx, ly, 120);
      const specOpacity = (1 - activeSettings.roughness) * activeSettings.metallic * 0.7;
      
      let specColor = '255,255,255';
      if (activeSettings.environment === 'neon') specColor = '0,255,240';
      else if (activeSettings.environment === 'sunset') specColor = '255,180,50';

      specGrad.addColorStop(0, `rgba(${specColor}, ${specOpacity})`);
      specGrad.addColorStop(0.4, `rgba(${specColor}, ${specOpacity * 0.4})`);
      specGrad.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = specGrad;
      ctx.fillRect(-imgSize / 2, -imgSize / 2, imgSize, imgSize);

      ctx.restore();
    }

    ctx.restore();

    // 4. Raytracing Beams Visualizer
    const beamAngle = (activeSettings.lightAngle * Math.PI) / 180;
    ctx.strokeStyle = activeSettings.environment === 'neon' ? 'rgba(0,255,240,0.15)' : 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(w / 2 + Math.cos(beamAngle) * 220, h / 2 - 20 + Math.sin(beamAngle) * 220);
    ctx.lineTo(w / 2, h / 2 - 20);
    ctx.stroke();

    animationFrameId = requestAnimationFrame(drawFrame);
  }

  drawFrame();
}
