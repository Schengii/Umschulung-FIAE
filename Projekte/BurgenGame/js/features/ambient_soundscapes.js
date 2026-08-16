// --- PROCEDURAL AMBIENT SOUNDSCAPES FEATURE ---
(function() {
  window.AmbientSoundscapes = {
    audioCtx: null,
    rainGain: null,
    isPlaying: false,

    init() {
      console.log('🌧️ AmbientSoundscapes Module Initialized.');
    },

    playWeatherAmbient(season) {
      if (!window.AudioContext && !window.webkitAudioContext) return;
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      // Procedural rain/wind white noise generator
      try {
        const bufferSize = this.audioCtx.sampleRate * 2;
        const noiseBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.audioCtx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter = this.audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(season === 'winter' ? 400 : 800, this.audioCtx.currentTime);

        const gainNode = this.audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.02, this.audioCtx.currentTime); // Soft background volume

        whiteNoise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioCtx.destination);

        whiteNoise.start();
        this.isPlaying = true;
      } catch(e) {}
    },

    playWarHorn() {
      if (!this.audioCtx) return;
      try {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.audioCtx.currentTime + 1.5);

        gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 2.0);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start();
        osc.stop(this.audioCtx.currentTime + 2.0);
      } catch(e) {}
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.AmbientSoundscapes.init();
  });
})();
