// --- TAVERN JUKEBOX & CASTLE ANTHEM EDITOR FEATURE ---

const ANTHEM_NOTES = [
  { note: 'C4', freq: 261.63, label: 'C' },
  { note: 'D4', freq: 293.66, label: 'D' },
  { note: 'E4', freq: 329.63, label: 'E' },
  { note: 'F4', freq: 349.23, label: 'F' },
  { note: 'G4', freq: 392.00, label: 'G' },
  { note: 'A4', freq: 440.00, label: 'A' },
  { note: 'B4', freq: 493.88, label: 'B' },
  { note: 'C5', freq: 523.25, label: 'C5' }
];

GameStateManager.prototype.initJukebox = function() {
  if (!this.state.castleAnthem) {
    this.state.castleAnthem = [220.00, 329.63, 261.63, 440.00, 392.00, 329.63, 349.23, 261.63];
  }
};

GameStateManager.prototype.saveCastleAnthem = function(freqSequence) {
  this.initJukebox();
  this.state.castleAnthem = freqSequence;
  this.save();

  if (window.gameSound) {
    window.gameSound.musicSequence = freqSequence;
    window.gameSound.startMusic(window.gameSound.currentTempo || 450);
  }

  this.notifyListeners('anthem_changed');
  return true;
};

GameUI.prototype.openJukeboxModal = function() {
  stateManager.initJukebox();
  let currentSeq = [...stateManager.state.castleAnthem];

  let html = `
    <h2>🎻 Tavernen-Jukebox - Burgen-Hymne Komponieren</h2>
    <p class="modal-intro">Erstelle eine eigene Hymne aus 8 Tönen. Deine Hymne wird als Hintergrundmusik im Königreich abgespielt!</p>
    
    <div style="margin: 20px 0;">
      <h3 style="color: var(--color-gold-hover); font-size: 0.9rem;">Aktuelle Notensequenz (8 Taktpunkte):</h3>
      <div id="anthem-notes-row" style="display: flex; gap: 6px; justify-content: center; margin-top: 10px;">
  `;

  for (let i = 0; i < 8; i++) {
    const currentFreq = currentSeq[i] || 261.63;
    const noteObj = ANTHEM_NOTES.find(n => Math.abs(n.freq - currentFreq) < 5) || ANTHEM_NOTES[0];
    html += `
      <button class="primary-btn btn-note-slot" data-slot="${i}" style="width: 38px; height: 38px; font-weight: bold; padding: 0;">
        ${noteObj.label}
      </button>
    `;
  }

  html += `
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="color: var(--color-gold-hover); font-size: 0.9rem;">Verfügbare Noten zum Zuweisen:</h3>
      <div style="display: flex; gap: 8px; justify-content: center; margin-top: 8px;">
  `;

  ANTHEM_NOTES.forEach(n => {
    html += `
      <button class="primary-btn btn-pick-note" data-freq="${n.freq}" data-label="${n.label}" style="width: 36px; height: 36px; padding: 0; border-color: #3498db;">
        ${n.label}
      </button>
    `;
  });

  html += `
      </div>
    </div>

    <div style="display: flex; gap: 10px; margin-top: 20px;">
      <button id="btn-play-anthem" class="primary-btn" style="flex: 1; border-color: #2ecc71;">▶️ Hymne Probehören</button>
      <button id="btn-save-anthem" class="primary-btn" style="flex: 1; border-color: #f1c40f;">💾 Als Hymne Speichern</button>
      <button id="btn-close-jukebox" class="primary-btn" style="flex: 1; border-color: #7f8c8d;">Schließen</button>
    </div>
  `;

  this.openModal(html);

  let selectedSlot = 0;

  const updateSlotsUI = () => {
    document.querySelectorAll('.btn-note-slot').forEach((btn, idx) => {
      const f = currentSeq[idx];
      const nObj = ANTHEM_NOTES.find(n => Math.abs(n.freq - f) < 5) || ANTHEM_NOTES[0];
      btn.textContent = nObj.label;
      btn.style.borderColor = idx === selectedSlot ? '#f1c40f' : 'rgba(212,175,55,0.4)';
    });
  };

  document.querySelectorAll('.btn-note-slot').forEach(btn => {
    btn.addEventListener('click', (e) => {
      selectedSlot = parseInt(e.target.getAttribute('data-slot'));
      updateSlotsUI();
    });
  });

  document.querySelectorAll('.btn-pick-note').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const freq = parseFloat(e.target.getAttribute('data-freq'));
      currentSeq[selectedSlot] = freq;
      selectedSlot = (selectedSlot + 1) % 8;
      updateSlotsUI();
      if (window.gameSound && window.gameSound.audioCtx) {
        // Play quick preview note
        const ctx = window.gameSound.audioCtx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      }
    });
  });

  document.getElementById('btn-play-anthem').addEventListener('click', () => {
    if (window.gameSound) {
      window.gameSound.musicSequence = currentSeq;
      window.gameSound.startMusic(350);
    }
  });

  document.getElementById('btn-save-anthem').addEventListener('click', () => {
    stateManager.saveCastleAnthem(currentSeq);
    this.showFloatingNotification('Neue Burgen-Hymne gespeichert! 🎵');
    this.closeModal();
  });

  document.getElementById('btn-close-jukebox').addEventListener('click', () => this.closeModal());
  updateSlotsUI();
};
