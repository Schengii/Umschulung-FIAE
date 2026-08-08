class GameAudio {
  constructor() {
    this.ctx = null;
    this.muted = false;
    
    // BGM properties
    this.bgmInterval = null;
    this.bgmStep = 0;
    this.bgmTempo = 130; // BPM
    this.bgmScale = [110.00, 130.81, 146.83, 164.81, 196.00]; // A2, C3, D3, E3, G3
    this.bgmPlaying = false;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      this.ctx = new AudioContext();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.muted) {
      this.stopBGM();
    } else {
      if (this.bgmPlaying) {
        this.startBGM();
      }
    }
    return this.muted;
  }

  playPlace() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playJump() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  playEat() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'square';
    osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
    osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.08); // E5

    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playCoin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime); // B5
    osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.08); // E6

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.22);
  }

  playHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(40, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  playTowerDestroyed() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25];

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.08 + 0.4);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.4);
    });
  }

  playLaser() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  // PROCEDURAL BGM SEQUENCER
  startBGM() {
    this.bgmPlaying = true;
    if (this.muted) return;
    
    this.init();
    if (!this.ctx) return;

    // Clear any active sequencer interval
    if (this.bgmInterval) clearInterval(this.bgmInterval);

    // Sequence step rate in ms
    const stepDuration = 60000 / this.bgmTempo / 2; // 8th notes

    this.bgmInterval = setInterval(() => {
      this.playSequencerStep();
    }, stepDuration);
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  setBGMParams(tempo, scaleMode) {
    this.bgmTempo = tempo;
    // Scale transitions (Pentatonic scales relative to world themes)
    if (scaleMode === 'neon') {
      this.bgmScale = [110.00, 130.81, 146.83, 164.81, 196.00]; // A2 pentatonic
    } else if (scaleMode === 'jungle') {
      this.bgmScale = [98.00, 116.54, 130.81, 146.83, 174.61]; // G2 minor pentatonic
    } else if (scaleMode === 'lava') {
      this.bgmScale = [82.41, 98.00, 110.00, 123.47, 146.83]; // E2 Phrygian/Minor
    }

    if (this.bgmPlaying && !this.muted) {
      // restart to apply new tempo
      this.startBGM();
    }
  }

  playSequencerStep() {
    if (!this.ctx) return;

    // Bass note selection
    // simple chiptune bass pattern
    const bassPatterns = [0, 0, 2, 0, 1, 1, 3, 4];
    const scaleIndex = bassPatterns[this.bgmStep % bassPatterns.length];
    const baseFreq = this.bgmScale[scaleIndex] / 2; // bass octave

    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();

    bassOsc.connect(bassGain);
    bassGain.connect(this.ctx.destination);

    bassOsc.type = 'triangle';
    bassOsc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    
    bassGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    bassGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

    bassOsc.start();
    bassOsc.stop(this.ctx.currentTime + 0.22);

    // Melody note selection (random high notes on beats 0 and 4)
    if (this.bgmStep % 4 === 0 && Math.random() > 0.3) {
      const melodyOsc = this.ctx.createOscillator();
      const melodyGain = this.ctx.createGain();

      melodyOsc.connect(melodyGain);
      melodyGain.connect(this.ctx.destination);

      melodyOsc.type = 'sine';
      
      const randomFreqIndex = Math.floor(Math.random() * this.bgmScale.length);
      const melodyFreq = this.bgmScale[randomFreqIndex] * 2; // 1 octave higher
      
      melodyOsc.frequency.setValueAtTime(melodyFreq, this.ctx.currentTime);
      
      melodyGain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      melodyGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      melodyOsc.start();
      melodyOsc.stop(this.ctx.currentTime + 0.35);
    }

    this.bgmStep = (this.bgmStep + 1) % 16;
  }
}

window.gameAudio = new GameAudio();
