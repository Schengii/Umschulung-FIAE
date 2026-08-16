import { OfficeLocation, WorkSession, HistoryEntry, AppSettings } from "./types";

const KEYS = {
  OFFICE_LOCATION: "officetrack_location",
  ACTIVE_SESSION: "officetrack_active_session",
  HISTORY: "officetrack_history",
  SETTINGS: "officetrack_settings",
};

const DEFAULT_LOCATION: OfficeLocation = {
  name: "Büro",
  lat: 52.5162,
  lng: 13.3777,
  radius: 100,
};

const DEFAULT_SETTINGS: AppSettings = {
  dailyTarget: 8,
  weeklyTarget: 40,
  arbzgBreaksEnabled: true,
  theme: "dark",
};

export const storageService = {
  // --- CLOUD SYNC HELPERS ---
  async syncToCloud(): Promise<void> {
    const win = window as any;
    if (win.firebaseMock && win.firebaseMock.auth?.currentUser) {
      const data = {
        history: this.getHistory(),
        settings: this.getSettings(),
        location: this.getLocation(),
      };
      await win.firebaseMock.firestore.syncData(data);
    }
  },

  async loadFromCloud(): Promise<void> {
    const win = window as any;
    if (win.firebaseMock && win.firebaseMock.auth?.currentUser) {
      const data = await win.firebaseMock.firestore.loadData();
      if (data) {
        if (data.history) localStorage.setItem(KEYS.HISTORY, JSON.stringify(data.history));
        if (data.settings) localStorage.setItem(KEYS.SETTINGS, JSON.stringify(data.settings));
        if (data.location)
          localStorage.setItem(KEYS.OFFICE_LOCATION, JSON.stringify(data.location));

        console.log("Cloud data loaded and applied.");
      }
    }
  },

  // --- LOCATION STORAGE ---
  getLocation(): OfficeLocation {
    const loc = localStorage.getItem(KEYS.OFFICE_LOCATION);
    return loc ? JSON.parse(loc) : DEFAULT_LOCATION;
  },

  saveLocation(location: OfficeLocation): void {
    localStorage.setItem(KEYS.OFFICE_LOCATION, JSON.stringify(location));
    this.syncToCloud();
  },

  // --- ACTIVE SESSION STORAGE ---
  getActiveSession(): WorkSession | null {
    const session = localStorage.getItem(KEYS.ACTIVE_SESSION);
    return session ? JSON.parse(session) : null;
  },

  saveActiveSession(session: WorkSession): void {
    localStorage.setItem(KEYS.ACTIVE_SESSION, JSON.stringify(session));
  },

  clearActiveSession(): void {
    localStorage.removeItem(KEYS.ACTIVE_SESSION);
  },

  // --- TRACKING HISTORY STORAGE ---
  getHistory(): HistoryEntry[] {
    const history = localStorage.getItem(KEYS.HISTORY);
    return history ? JSON.parse(history) : [];
  },

  saveHistory(history: HistoryEntry[]): void {
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
    this.syncToCloud();
  },

  addHistoryEntry(entry: Omit<HistoryEntry, "id"> & { id?: string }): HistoryEntry {
    const history = this.getHistory();
    const newEntry: HistoryEntry = {
      id: entry.id || Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      ...entry,
    } as HistoryEntry;
    history.unshift(newEntry);
    this.saveHistory(history);
    return newEntry;
  },

  deleteHistoryEntry(id: string): void {
    let history = this.getHistory();
    history = history.filter(entry => entry.id !== id);
    this.saveHistory(history);
  },

  clearHistory(): void {
    localStorage.removeItem(KEYS.HISTORY);
    this.syncToCloud();
  },

  // --- SETTINGS STORAGE ---
  getSettings(): AppSettings {
    const settings = localStorage.getItem(KEYS.SETTINGS);
    return settings ? JSON.parse(settings) : DEFAULT_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    this.syncToCloud();
  },
};

// Global attachment for legacy window access if needed
if (typeof window !== "undefined") {
  (window as any).storageService = storageService;
}
(globalThis as any).storageService = storageService;
