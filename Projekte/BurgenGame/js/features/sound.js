// --- SOUND MANAGER FEATURE (Web Audio API Synthesizer) ---

class GameSoundManager {
  constructor() {
    this.audioCtx = null;
    this.musicInterval = null;
    this.activeTheme = 'castle';
    this.musicSequence = [
      220.00, 329.63, 261.63, 440.00, 329.63, 261.63, 392.00, 329.63,
      220.00, 329.63, 261.63, 440.00, 329.63, 261.63, 349.23, 329.63
    ];
    this.musicStep = 0;
    this.currentTempo = 450;
    
    // Load settings from localStorage
    this.musicEnabled = localStorage.getItem('ec_music_enabled') !== 'false';
    this.sfxEnabled = localStorage.getItem('ec_sfx_enabled') !== 'false';
    this.musicVolume = localStorage.getItem('ec_music_volume') !== null ? parseFloat(localStorage.getItem('ec_music_volume')) : 0.5;
    this.sfxVolume = localStorage.getItem('ec_sfx_volume') !== null ? parseFloat(localStorage.getItem('ec_sfx_volume')) : 0.5;
  }

  init() {
    if (this.audioCtx) return;
    
    // Initialize audio context on user interaction to comply with browser policy
    const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
    if (AudioCtxClass) {
      this.audioCtx = new AudioCtxClass();
      
      // Start background music loop if enabled
      if (this.musicEnabled) {
        this.startMusic(this.currentTempo);
      }
    }
  }

  resume() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setMusicEnabled(enabled) {
    this.musicEnabled = enabled;
    localStorage.setItem('ec_music_enabled', enabled ? 'true' : 'false');
    if (enabled) {
      this.startMusic(this.currentTempo);
    } else {
      this.stopMusic();
    }
  }

  setSfxEnabled(enabled) {
    this.sfxEnabled = enabled;
    localStorage.setItem('ec_sfx_enabled', enabled ? 'true' : 'false');
  }

  setMusicVolume(vol) {
    this.musicVolume = parseFloat(vol);
    localStorage.setItem('ec_music_volume', vol);
  }

  setSfxVolume(vol) {
    this.sfxVolume = parseFloat(vol);
    localStorage.setItem('ec_sfx_volume', vol);
  }

  setTheme(themeName) {
    if (this.activeTheme === themeName) return;
    this.activeTheme = themeName;
    
    const sequences = {
      castle: [
        220.00, 329.63, 261.63, 440.00, 329.63, 261.63, 392.00, 329.63,
        220.00, 329.63, 261.63, 440.00, 329.63, 261.63, 349.23, 329.63
      ],
      world_map: [
        146.83, 220.00, 196.00, 146.83, 220.00, 196.00, 164.81, 220.00,
        146.83, 220.00, 196.00, 146.83, 220.00, 196.00, 130.81, 146.83
      ],
      battle: [
        220.00, 233.08, 220.00, 233.08, 329.63, 293.66, 329.63, 349.23,
        220.00, 233.08, 220.00, 233.08, 261.63, 246.94, 261.63, 220.00
      ],
      victory: [
        261.63, 329.63, 392.00, 523.25, 392.00, 523.25, 659.25, 523.25
      ],
      night: [
        164.81, 196.00, 220.00, 196.00, 164.81, 146.83, 164.81, 130.81
      ],
      dungeon: [
        110.00, 116.54, 110.00, 98.00, 110.00, 123.47, 110.00, 87.31
      ]
    };
    const tempos = {
      castle: 450,
      world_map: 550,
      battle: 300,
      victory: 350,
      night: 600,
      dungeon: 500
    };


    this.musicSequence = sequences[themeName] || sequences.castle;
    this.musicStep = 0;
    this.currentTempo = tempos[themeName] || 450;

    if (this.musicEnabled) {
      this.startMusic(this.currentTempo);
    }
  }

  playSFX(type) {
    this.init();
    this.resume();
    if (!this.sfxEnabled || !this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;

    switch (type) {
      case 'click': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        gain.gain.setValueAtTime(0.08 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        osc.start(now);
        osc.stop(now + 0.05);
        break;
      }
      case 'coin': {
        [900, 1350].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.02);
          gain.gain.setValueAtTime(0.12 * this.sfxVolume, now + idx * 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4 + idx * 0.02);

          osc.start(now + idx * 0.02);
          osc.stop(now + 0.4 + idx * 0.02);
        });
        break;
      }
      case 'build': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
        gain.gain.setValueAtTime(0.25 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.start(now);
        osc.stop(now + 0.18);
        break;
      }
      case 'recruit': {
        const osc = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(540, now);
        osc2.frequency.linearRampToValueAtTime(120, now + 0.2);

        gain.gain.setValueAtTime(0.15 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.start(now);
        osc.stop(now + 0.25);
        osc2.start(now);
        osc2.stop(now + 0.25);
        break;
      }
      case 'battle': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.2);
        osc.frequency.linearRampToValueAtTime(130, now + 0.7);

        gain.gain.setValueAtTime(0.2 * this.sfxVolume, now);
        gain.gain.linearRampToValueAtTime(0.25 * this.sfxVolume, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

        osc.start(now);
        osc.stop(now + 0.85);
        break;
      }
      case 'quest': {
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.15 * this.sfxVolume, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.35);
        });
        break;
      }
      case 'wood': {
        [0, 0.15].forEach((delay) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(150, now + delay);
          osc.frequency.exponentialRampToValueAtTime(10, now + delay + 0.08);
          
          gain.gain.setValueAtTime(0.2 * this.sfxVolume, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);
          
          osc.start(now + delay);
          osc.stop(now + delay + 0.08);
        });
        break;
      }
      case 'stone': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);
        
        gain.gain.setValueAtTime(0.15 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        
        osc.start(now);
        osc.stop(now + 0.12);
        break;
      }
      case 'blacksmith': {
        const ping = ctx.createOscillator();
        const rumble = ctx.createOscillator();
        const gainPing = ctx.createGain();
        const gainRumble = ctx.createGain();
        
        ping.connect(gainPing);
        gainPing.connect(ctx.destination);
        rumble.connect(gainRumble);
        gainRumble.connect(ctx.destination);
        
        ping.type = 'sine';
        ping.frequency.setValueAtTime(2500, now);
        ping.frequency.exponentialRampToValueAtTime(1500, now + 0.15);
        gainPing.gain.setValueAtTime(0.12 * this.sfxVolume, now);
        gainPing.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        
        rumble.type = 'triangle';
        rumble.frequency.setValueAtTime(220, now);
        rumble.frequency.linearRampToValueAtTime(80, now + 0.25);
        gainRumble.gain.setValueAtTime(0.2 * this.sfxVolume, now);
        gainRumble.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        
        ping.start(now);
        ping.stop(now + 0.15);
        rumble.start(now);
        rumble.stop(now + 0.25);
        break;
      }
      case 'tavern': {
        const notes = [220.00, 277.18, 329.63, 440.00];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.1 * this.sfxVolume, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.4);
          
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.4);
        });
        break;
      }
      case 'upgrade': {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);
          gain.gain.setValueAtTime(0.15 * this.sfxVolume, now + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.6);
          
          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 0.6);
        });
        break;
      }
      case 'birds': {
        [1800, 2400, 2100].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.04 * this.sfxVolume, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.06);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.06);
        });
        break;
      }
      case 'wind': {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.5);
        osc.frequency.linearRampToValueAtTime(120, now + 1.0);
        gain.gain.setValueAtTime(0.06 * this.sfxVolume, now);
        gain.gain.linearRampToValueAtTime(0.1 * this.sfxVolume, now + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.start(now);
        osc.stop(now + 1.2);
        break;
      }
      case 'rain': {
        for (let r = 0; r < 5; r++) {
          const delay = r * 0.06;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(800 + Math.random() * 400, now + delay);
          gain.gain.setValueAtTime(0.03 * this.sfxVolume, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.03);
          osc.start(now + delay);
          osc.stop(now + delay + 0.03);
        }
        break;
      }

    }
  }

  startMusic(tempo = 450) {
    this.stopMusic();
    this.init();
    if (!this.musicEnabled || !this.audioCtx) return;

    this.musicInterval = setInterval(() => {
      this.resume();
      if (!this.audioCtx || this.audioCtx.state === 'suspended') return;

      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const freq = this.musicSequence[this.musicStep];
      this.musicStep = (this.musicStep + 1) % this.musicSequence.length;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (this.activeTheme === 'battle') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq / 2, now);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08 * this.musicVolume, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12 * this.musicVolume, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
      }

      osc.start(now);
      osc.stop(now + 0.8);
    }, tempo);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  playAmbientSoundscape(seasonId = 'spring') {
    if (!this.sfxEnabled || !this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      if (seasonId === 'spring' || seasonId === 'summer') {
        this.playAmbientChirp();
      } else if (seasonId === 'winter') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.linearRampToValueAtTime(90, now + 1.2);
        gain.gain.setValueAtTime(0.04 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 1.2);
      } else if (seasonId === 'autumn') {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.8);
        gain.gain.setValueAtTime(0.03 * this.sfxVolume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
      }
    } catch (e) {}
  }

  playAmbientChirp() {
    if (!this.sfxEnabled || !this.audioCtx) return;
    try {
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200 + Math.random() * 800, now);
      osc.frequency.exponentialRampToValueAtTime(2400 + Math.random() * 600, now + 0.1);
      gain.gain.setValueAtTime(0.05 * this.sfxVolume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch(e) {}
  }
}

// Global Sound Instance
const gameSound = new GameSoundManager();

// Automatically init/resume AudioContext on first page click
window.addEventListener('click', () => {
  gameSound.init();
  gameSound.resume();
}, { once: false });
