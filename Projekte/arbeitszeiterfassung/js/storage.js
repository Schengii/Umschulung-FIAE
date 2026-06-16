// Key names for localStorage
const KEYS = {
  OFFICE_LOCATION: 'officetrack_location',
  ACTIVE_SESSION: 'officetrack_active_session',
  HISTORY: 'officetrack_history',
  SETTINGS: 'officetrack_settings'
};

// Default location (e.g. Developer Akademie or Brandenburger Tor Berlin)
const DEFAULT_LOCATION = {
  name: 'Büro',
  lat: 52.5162,
  lng: 13.3777,
  radius: 100 // in meters
};

// Default Settings
const DEFAULT_SETTINGS = {
  dailyTarget: 8 // in hours
};

window.storageService = {
  // --- LOCATION STORAGE ---
  getLocation() {
    const loc = localStorage.getItem(KEYS.OFFICE_LOCATION);
    return loc ? JSON.parse(loc) : DEFAULT_LOCATION;
  },

  saveLocation(location) {
    localStorage.setItem(KEYS.OFFICE_LOCATION, JSON.stringify(location));
  },

  // --- ACTIVE SESSION STORAGE ---
  getActiveSession() {
    const session = localStorage.getItem(KEYS.ACTIVE_SESSION);
    return session ? JSON.parse(session) : null;
  },

  saveActiveSession(session) {
    localStorage.setItem(KEYS.ACTIVE_SESSION, JSON.stringify(session));
  },

  clearActiveSession() {
    localStorage.removeItem(KEYS.ACTIVE_SESSION);
  },

  // --- TRACKING HISTORY STORAGE ---
  getHistory() {
    const history = localStorage.getItem(KEYS.HISTORY);
    return history ? JSON.parse(history) : [];
  },

  saveHistory(history) {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
  },

  addHistoryEntry(entry) {
    const history = this.getHistory();
    // Ensure unique ID
    const newEntry = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      ...entry
    };
    history.unshift(newEntry); // Add to beginning
    this.saveHistory(history);
    return newEntry;
  },

  deleteHistoryEntry(id) {
    let history = this.getHistory();
    history = history.filter(entry => entry.id !== id);
    this.saveHistory(history);
  },

  clearHistory() {
    localStorage.removeItem(KEYS.HISTORY);
  },

  // --- SETTINGS STORAGE ---
  getSettings() {
    const settings = localStorage.getItem(KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
  },

  saveSettings(settings) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }
};
