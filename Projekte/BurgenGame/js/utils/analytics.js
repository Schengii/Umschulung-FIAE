// --- ANALYTICS FEATURE ---

class Analytics {
  constructor(stateManager) {
    this.stateManager = stateManager;
    this.events = [];
    this.load();
  }

  // Record an event with optional data
  log(eventName, data = {}) {
    const entry = {
      timestamp: Date.now(),
      event: eventName,
      data,
    };
    this.events.push(entry);
    // Persist in localStorage (or in state if desired)
    try {
      localStorage.setItem('empire_analytics', JSON.stringify(this.events));
    } catch (e) {
      console.warn('Analytics storage failed', e);
    }
  }

  // Load persisted events
  load() {
    try {
      const raw = localStorage.getItem('empire_analytics');
      if (raw) this.events = JSON.parse(raw);
    } catch (e) {
      this.events = [];
    }
  }

  // Export for debugging
  getAll() {
    return this.events;
  }
}

window.Analytics = null;
