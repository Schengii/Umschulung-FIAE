// --- REACTIVE STATE PROXY ENGINE (Option B) ---

class ReactiveState {
  constructor(initialState = {}) {
    this.listeners = new Map(); // key -> Array of callbacks
    this.state = this.createProxy(initialState, '');
  }

  createProxy(target, path) {
    const self = this;
    return new Proxy(target, {
      get(obj, prop) {
        if (typeof prop === 'symbol') return obj[prop];
        const value = obj[prop];
        // Recursively wrap nested objects
        if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
          const currentPath = path ? `${path}.${prop}` : prop;
          return self.createProxy(value, currentPath);
        }
        return value;
      },
      set(obj, prop, value) {
        const oldVal = obj[prop];
        if (oldVal === value) return true;

        obj[prop] = value;
        const currentPath = path ? `${path}.${prop}` : prop;
        
        // Notify subscribers
        self.notify(currentPath, value, oldVal);
        return true;
      }
    });
  }

  subscribe(path, callback) {
    if (!this.listeners.has(path)) {
      this.listeners.set(path, []);
    }
    this.listeners.get(path).push(callback);
    return () => this.unsubscribe(path, callback);
  }

  unsubscribe(path, callback) {
    if (this.listeners.has(path)) {
      const list = this.listeners.get(path).filter(fn => fn !== callback);
      this.listeners.set(path, list);
    }
  }

  notify(path, newVal, oldVal) {
    // 1. Notify exact path listeners
    if (this.listeners.has(path)) {
      this.listeners.get(path).forEach(fn => fn(newVal, oldVal, path));
    }

    // 2. Notify wildcard/root listeners
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(fn => fn(newVal, oldVal, path));
    }

    // 3. Auto-update bound DOM elements
    this.updateDomBindings(path, newVal);
  }

  bindDom() {
    const boundElements = document.querySelectorAll('[data-bind]');
    boundElements.forEach(elem => {
      const path = elem.getAttribute('data-bind');
      const val = this.getValueByPath(path);
      if (val !== undefined) {
        this.setElementValue(elem, val);
      }
    });
  }

  updateDomBindings(path, val) {
    const boundElements = document.querySelectorAll(`[data-bind="${path}"]`);
    boundElements.forEach(elem => {
      this.setElementValue(elem, val);
    });
  }

  setElementValue(elem, val) {
    if (elem.tagName === 'INPUT' || elem.tagName === 'TEXTAREA' || elem.tagName === 'SELECT') {
      elem.value = val;
    } else {
      elem.textContent = typeof val === 'number' && !Number.isInteger(val) ? val.toFixed(1) : val;
    }
  }

  getValueByPath(path) {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined) ? acc[part] : undefined, this.state);
  }
}

window.ReactiveState = ReactiveState;
