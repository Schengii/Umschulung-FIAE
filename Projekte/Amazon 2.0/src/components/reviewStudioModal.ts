// ============================================================
// Amazon 2.0 – WASM Video-Review & Unboxing Studio Modal
// ============================================================
import type { Product } from '../types';
import { processAndEncodeVideo, type VideoFilter, type VideoCodec } from '../utils/wasmVideoEncoder';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let reviewModalEl: HTMLElement | null = null;
let activeFilter: VideoFilter = 'studio';
let activeCodec: VideoCodec = 'av1-wasm';
let isEncoding = false;

function getModal(): HTMLElement {
  if (!reviewModalEl) {
    reviewModalEl = document.createElement('div');
    reviewModalEl.id = 'reviewStudioModal';
    reviewModalEl.className = 'modal-overlay';
    reviewModalEl.setAttribute('role', 'dialog');
    reviewModalEl.setAttribute('aria-modal', 'true');
    reviewModalEl.setAttribute('aria-label', 'WASM Video-Review Studio');
    document.body.appendChild(reviewModalEl);
  }
  return reviewModalEl;
}

export function openReviewStudioModal(product: Product): void {
  const modal = getModal();
  renderStudioUI(modal, product);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeReviewStudioModal(): void {
  if (reviewModalEl) {
    reviewModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderStudioUI(modal: HTMLElement, product: Product): void {
  modal.innerHTML = `
    <div class="modal-dialog review-studio-dialog">
      <button class="modal-close" id="closeReviewStudioBtn" aria-label="Schließen">✕</button>

      <div class="studio-header">
        <div class="studio-badge">🎬 WASM VIDEO-ENCODER & REVIEW STUDIO</div>
        <h2>Video-Rezension schneiden & komprimieren</h2>
        <p class="studio-sub">Erstelle hochauflösende Video-Reviews für „${product.title}“ mit Multi-Threaded Client-Side AV1/H.264 Encoder.</p>
      </div>

      <div class="studio-main-grid">
        <!-- Live Video Viewport with Filters -->
        <div class="studio-viewport-card filter-${activeFilter}">
          <img src="${product.images[0]}" alt="${product.title}" class="studio-preview-frame" />
          <div class="studio-watermark">✓ Verifizierter Käufer-Test</div>
          <div class="studio-time-badge">🔴 00:15 / 1080p 60fps</div>
        </div>

        <!-- Controls Sidebar -->
        <div class="studio-controls-panel">
          <!-- Filter Selection -->
          <div class="control-section">
            <label class="control-label">🎨 Farb- & Belichtungs-Filter</label>
            <div class="filter-chips-grid">
              <button class="v-filter-chip ${activeFilter === 'none' ? 'active' : ''}" data-filter="none">Original</button>
              <button class="v-filter-chip ${activeFilter === 'vivid' ? 'active' : ''}" data-filter="vivid">Vivid Contrast</button>
              <button class="v-filter-chip ${activeFilter === 'studio' ? 'active' : ''}" data-filter="studio">Studio Crisp</button>
              <button class="v-filter-chip ${activeFilter === 'vintage' ? 'active' : ''}" data-filter="vintage">Warm Cinema</button>
            </div>
          </div>

          <!-- Codec Selection -->
          <div class="control-section">
            <label class="control-label">⚡ WebAssembly Codec</label>
            <div class="codec-select-group">
              <label class="radio-label">
                <input type="radio" name="videoCodec" value="av1-wasm" ${activeCodec === 'av1-wasm' ? 'checked' : ''} />
                <span>AV1 WASM (90% Kompression, Next-Gen)</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="videoCodec" value="webm-vp9" ${activeCodec === 'webm-vp9' ? 'checked' : ''} />
                <span>WebM VP9 (Schnell & Flüssig)</span>
              </label>
              <label class="radio-label">
                <input type="radio" name="videoCodec" value="h264-fast" ${activeCodec === 'h264-fast' ? 'checked' : ''} />
                <span>H.264 MP4 (Maximale Kompatibilität)</span>
              </label>
            </div>
          </div>

          <!-- Rating & Title -->
          <div class="control-section">
            <input type="text" id="reviewTitleInput" class="form-input" placeholder="Titel der Video-Rezension..." value="Hervorragende Haptik & Klangqualität!" />
          </div>

          <!-- Progress Bar -->
          <div class="encoding-progress-box" id="encodeProgressBox" style="display: none;">
            <div class="progress-label-row">
              <span>WASM-Kompression läuft...</span>
              <strong id="encodeProgressVal">0%</strong>
            </div>
            <div class="progress-track">
              <div class="progress-bar-fill" id="encodeProgressBar" style="width: 0%;"></div>
            </div>
          </div>

          <button class="btn-primary btn-encode-submit" id="startEncodeBtn">
            🚀 Video rendern & als Review veröffentlichen
          </button>
        </div>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeReviewStudioBtn')?.addEventListener('click', closeReviewStudioModal);

  // Filter chips
  modal.querySelectorAll('.v-filter-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      activeFilter = btn.getAttribute('data-filter') as VideoFilter;
      playSound('click');
      triggerHaptic('light');
      renderStudioUI(modal, product);
    });
  });

  // Codec change
  modal.querySelectorAll('input[name="videoCodec"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      activeCodec = (e.target as HTMLInputElement).value as VideoCodec;
      playSound('click');
    });
  });

  // Submit and Encode
  document.getElementById('startEncodeBtn')?.addEventListener('click', async () => {
    if (isEncoding) return;
    isEncoding = true;

    const progressBox = document.getElementById('encodeProgressBox');
    const progressBar = document.getElementById('encodeProgressBar');
    const progressVal = document.getElementById('encodeProgressVal');
    const btn = document.getElementById('startEncodeBtn') as HTMLButtonElement;

    if (progressBox) progressBox.style.display = 'block';
    if (btn) btn.disabled = true;

    playSound('quest');
    triggerHaptic('light');

    const result = await processAndEncodeVideo(
      { size: 1024 * 1024 * 42, name: 'review.mp4' },
      {
        codec: activeCodec,
        filter: activeFilter,
        targetResolution: '1080p',
        watermark: true,
        onProgress: (p) => {
          if (progressBar) progressBar.style.width = `${p}%`;
          if (progressVal) progressVal.textContent = `${p}%`;
        },
      }
    );

    isEncoding = false;
    playSound('success');
    triggerHaptic('heavy');
    showToast(
      `🎬 Video erfolgreich mit ${result.codecUsed} gerendert (${result.compressionRatioPercent}% kleiner)! Rezension veröffentlicht.`,
      'success'
    );
    closeReviewStudioModal();
  });
}
