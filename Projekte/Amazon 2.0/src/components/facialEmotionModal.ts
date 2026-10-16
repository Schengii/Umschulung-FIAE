// ============================================================
// Amazon 2.0 – Facial Emotion & Attention Heatmap Modal
// ============================================================
import { readFacialEmotionTelemetry } from '../utils/facialEmotionTracker';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let emoModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!emoModalEl) {
    emoModalEl = document.createElement('div');
    emoModalEl.id = 'facialEmotionModal';
    emoModalEl.className = 'modal-overlay';
    emoModalEl.setAttribute('role', 'dialog');
    emoModalEl.setAttribute('aria-modal', 'true');
    emoModalEl.setAttribute('aria-label', 'KI Emotion & Heatmap Berater');
    document.body.appendChild(emoModalEl);
  }
  return emoModalEl;
}

export function openFacialEmotionModal(): void {
  const modal = getModal();
  renderEmoUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeFacialEmotionModal(): void {
  if (emoModalEl) {
    emoModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderEmoUI(modal: HTMLElement): void {
  const emo = readFacialEmotionTelemetry();

  modal.innerHTML = `
    <div class="modal-dialog emo-dialog">
      <button class="modal-close" id="closeEmoBtn" aria-label="Schließen">✕</button>

      <div class="emo-header">
        <div class="emo-badge">🤖 FACIAL EMOTION & ATTENTION HEATMAP AI</div>
        <h2>Echtzeit-Emotions- & Aufmerksamkeits-Analyse</h2>
        <p class="emo-sub">100% lokale On-Device WebCam-Erkennung von Mikro-Mimik (Freude, Zögern) für personalisierte Kaufhilfe.</p>
      </div>

      <!-- Face Mesh Box -->
      <div class="emo-mesh-viewport">
        <div class="face-mesh-points">
          <span class="f-point p-eye-l">👁️</span>
          <span class="f-point p-eye-r">👁️</span>
          <span class="f-point p-smile">😊</span>
        </div>
        <div class="heatmap-glow-circle"></div>
        <div class="emo-privacy-tag">
          <span>🔒 100% ON-DEVICE PRIVACY (Keine Videodaten verlassen den Browser)</span>
        </div>
      </div>

      <!-- Emotion Stats Cards -->
      <div class="emo-telemetry-grid">
        <div class="emo-box">
          <span class="em-lbl">Erkannte Emotion:</span>
          <strong style="color: #10b981;">${emo.primaryEmotion}</strong>
        </div>
        <div class="emo-box">
          <span class="em-lbl">Konfidenz:</span>
          <strong>${emo.confidencePercent}%</strong>
        </div>
        <div class="emo-box">
          <span class="em-lbl">Aufmerksamkeits-Hotspot:</span>
          <strong>${emo.focalHotspot}</strong>
        </div>
      </div>

      <!-- Smart Advice Banner -->
      <div class="emo-advice-card">
        <h4>💡 KI-Kaufberater Empfehlung:</h4>
        <p>${emo.smartAdvice}</p>
      </div>

      <!-- Action -->
      <div class="emo-actions-row">
        <button class="btn-primary" id="applyEmotionDiscountBtn">
          🎁 Vorgeschlagenen 10%-Kaufanreiz Gutschein aktivieren
        </button>
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closeEmoBtn')?.addEventListener('click', closeFacialEmotionModal);

  document.getElementById('applyEmotionDiscountBtn')?.addEventListener('click', () => {
    playSound('success');
    triggerHaptic('heavy');
    showToast('🎁 10%-Emotion-Discount erfolgreich im Warenkorb aktiviert!', 'success');
    closeFacialEmotionModal();
  });
}
