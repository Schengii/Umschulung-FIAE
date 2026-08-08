// tutorial.js - Simple step-by-step overlay tutorial
// Usage: window.tutorial = new GameTutorial(); window.tutorial.start();
class GameTutorial {
  constructor() {
    this.steps = [
      { selector: '#resource-bar', text: 'Hier siehst du deine Ressourcen. Sie aktualisieren sich automatisch.' },
      { selector: '#sidebar', text: 'Wechsle zwischen Burg- und Kartenansicht über diese Buttons.' },
      { selector: '#bottom-menu', text: 'Baue und rekrutiere über das Aktionsmenü.' },
      { selector: '#quest-panel', text: 'Erledige tägliche Quests für Belohnungen.' },
    ];
    this.current = 0;
    this.overlay = null;
  }

  createOverlay(step) {
    const overlay = document.createElement('div');
    overlay.className = 'tutorial-overlay';
    overlay.style.position = 'absolute';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0,0,0,0.7)';
    overlay.style.backdropFilter = 'blur(4px)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = 30;
    overlay.style.color = '#fff';
    overlay.style.fontFamily = 'var(--font-body)';
    overlay.style.padding = '20px';
    overlay.style.textAlign = 'center';

    const box = document.createElement('div');
    box.style.background = 'rgba(30,31,38,0.9)';
    box.style.padding = '20px';
    box.style.borderRadius = '8px';
    box.style.maxWidth = '400px';
    box.innerHTML = `<p>${step.text}</p><button id="tutorial-next" style="margin-top:12px;">Weiter</button>`;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    this.overlay = overlay;
    document.getElementById('tutorial-next').onclick = () => this.next();
  }

  start() {
    this.current = 0;
    this.showCurrent();
  }

  showCurrent() {
    if (this.current >= this.steps.length) { this.end(); return; }
    const step = this.steps[this.current];
    this.createOverlay(step);
  }

  next() {
    if (this.overlay) this.overlay.remove();
    this.current++;
    this.showCurrent();
  }

  end() {
    if (this.overlay) this.overlay.remove();
    localStorage.setItem('empire_tutorial_done', 'true');
  }
}

// Export singleton
window.tutorial = new GameTutorial();
