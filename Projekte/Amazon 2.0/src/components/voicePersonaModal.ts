// ============================================================
// Amazon 2.0 – Custom AI Voice Personas Hub Modal
// ============================================================
import { VOICE_PERSONAS, getActiveVoicePersona, setActiveVoicePersona, speakWithActivePersona } from '../utils/voicePersonas';
import { playSound } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';
import { showToast } from './toast';

let personaModalEl: HTMLElement | null = null;

function getModal(): HTMLElement {
  if (!personaModalEl) {
    personaModalEl = document.createElement('div');
    personaModalEl.id = 'voicePersonaModal';
    personaModalEl.className = 'modal-overlay';
    personaModalEl.setAttribute('role', 'dialog');
    personaModalEl.setAttribute('aria-modal', 'true');
    personaModalEl.setAttribute('aria-label', 'KI-Stimmen-Assistenten Hub');
    document.body.appendChild(personaModalEl);
  }
  return personaModalEl;
}

export function openVoicePersonaModal(): void {
  const modal = getModal();
  renderPersonaUI(modal);
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

export function closeVoicePersonaModal(): void {
  if (personaModalEl) {
    personaModalEl.classList.remove('open');
    document.body.style.overflow = '';
  }
}

function renderPersonaUI(modal: HTMLElement): void {
  const active = getActiveVoicePersona();

  modal.innerHTML = `
    <div class="modal-dialog persona-dialog">
      <button class="modal-close" id="closePersonaBtn" aria-label="Schließen">✕</button>

      <div class="persona-header">
        <div class="persona-badge">🎙️ CUSTOM SYNTHETIC AI VOICES</div>
        <h2>KI-Stimmen-Assistenten & Persönlichkeiten</h2>
        <p class="persona-sub">Wähle deinen persönlichen Einkaufsberater mit individueller Stimme, Charakter und Fachwissen.</p>
      </div>

      <!-- Personas Selection Grid -->
      <div class="persona-grid">
        ${VOICE_PERSONAS.map(p => `
          <div class="persona-card ${p.id === active.id ? 'active' : ''}" data-persona-id="${p.id}" style="--persona-color: ${p.accentColor}">
            <div class="persona-card-header">
              <img src="${p.avatar}" alt="${p.name}" class="persona-avatar" />
              <div class="persona-meta">
                <h4>${p.name}</h4>
                <span class="persona-role">${p.role}</span>
              </div>
              <span class="persona-active-indicator">${p.id === active.id ? 'Aktiv ✓' : ''}</span>
            </div>

            <p class="persona-greeting">„${p.greeting}“</p>

            <div class="persona-actions">
              <button class="btn-preview-voice" data-test-id="${p.id}">🔊 Stimme testen</button>
              <button class="btn-select-persona ${p.id === active.id ? 'btn-primary' : 'btn-secondary'}" data-select-id="${p.id}">
                ${p.id === active.id ? 'Ausgewählt' : 'Auswählen'}
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Listeners
  document.getElementById('closePersonaBtn')?.addEventListener('click', closeVoicePersonaModal);

  // Test voice
  modal.querySelectorAll('.btn-preview-voice').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (e.currentTarget as HTMLElement).getAttribute('data-test-id');
      const p = VOICE_PERSONAS.find(item => item.id === id);
      if (p) {
        setActiveVoicePersona(p.id);
        speakWithActivePersona(p.sampleCatchphrase);
        triggerHaptic('light');
        showToast(`🔊 Sprachprobe von ${p.name} wird abgespielt...`, 'info');
      }
    });
  });

  // Select persona
  modal.querySelectorAll('.btn-select-persona').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = (e.currentTarget as HTMLElement).getAttribute('data-select-id');
      const p = VOICE_PERSONAS.find(item => item.id === id);
      if (p) {
        setActiveVoicePersona(p.id);
        playSound('quest');
        triggerHaptic('medium');
        showToast(`🎙️ „${p.name}“ ist jetzt dein aktiver Einkaufsberater!`, 'success');
        speakWithActivePersona(`Perfekt! Ich bin ${p.name} und berate dich ab sofort bei all deinen Einkäufen!`);
        renderPersonaUI(modal);
      }
    });
  });
}
