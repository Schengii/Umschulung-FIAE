// --- NIGHT CYCLE FEATURE ---

class NightCycle {
  constructor(stateManager, ui) {
    this.stateManager = stateManager;
    this.ui = ui;
    this.enabled = true;
    this.cycleDuration = 120000; // 2 minutes full day/night
    this.overlay = null;
    this.lastTick = Date.now();
  }

  init() {
    // Create overlay element
    this.overlay = document.createElement('div');
    this.overlay.style.position = 'absolute';
    this.overlay.style.top = '0';
    this.overlay.style.left = '0';
    this.overlay.style.width = '100%';
    this.overlay.style.height = '100%';
    this.overlay.style.pointerEvents = 'none';
    this.overlay.style.transition = 'background 1s linear';
    this.overlay.style.zIndex = '20';
    document.body.appendChild(this.overlay);
    this.tick();
    this.intervalId = setInterval(() => this.tick(), 1000);
  }

  tick() {
    if (!this.enabled) return;
    const now = Date.now();
    const progress = ((now - this.lastTick) % this.cycleDuration) / this.cycleDuration; // 0..1
    // Map progress to brightness (day at 0-0.5, night at 0.5-1)
    const brightness = progress < 0.5 ? 1 - progress * 2 : (progress - 0.5) * 2;
    // night darker overlay
    const opacity = 0.5 * Math.max(0, Math.sin(Math.PI * progress));
    this.overlay.style.background = `rgba(0,0,50,${opacity})`;
  }

  getNightFactor() {
    if (!this.enabled) return 0;
    const now = Date.now();
    const progress = ((now - this.lastTick) % this.cycleDuration) / this.cycleDuration;
    return Math.max(0, Math.sin(Math.PI * progress));
  }

  toggle() {
    this.enabled = !this.enabled;
    if (!this.enabled && this.overlay) this.overlay.style.background = 'transparent';
  }
}

window.NightCycle = null;

