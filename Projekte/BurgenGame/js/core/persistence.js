// persistence.js – wrapper around IndexedDB and localStorage for multi-slot autosave
class Persistence {
  static DEFAULT_SLOT = 'slot_1';
  static HIGHSCORES_KEY = 'empire_classic_highscores';
  static ACTIVE_SLOT_KEY = 'empire_classic_active_slot';

  static getSlotKey(slotId = this.getActiveSlotId()) {
    return `empire_classic_save_${slotId}`;
  }

  static getActiveSlotId() {
    return localStorage.getItem(this.ACTIVE_SLOT_KEY) || this.DEFAULT_SLOT;
  }

  static setActiveSlotId(slotId) {
    localStorage.setItem(this.ACTIVE_SLOT_KEY, slotId);
  }

  static initDb() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('EmpireClassicDB', 2);
      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('saves')) {
          db.createObjectStore('saves');
        }
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(e.target.error);
    });
  }

  static async load(slotId = this.getActiveSlotId()) {
    const key = this.getSlotKey(slotId);
    try {
      const db = await this.initDb();
      const transaction = db.transaction('saves', 'readonly');
      const store = transaction.objectStore('saves');
      const request = store.get(key);
      const result = await new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      if (result) return result;
    } catch (e) {
      console.warn("IndexedDB load failed, falling back to localStorage", e);
    }

    // Fallback/Migration
    let raw = localStorage.getItem(key);
    if (!raw && slotId === 'slot_1') {
      // Migrate from legacy single save
      raw = localStorage.getItem('empire_classic_save');
    }
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw);
      if (parsed) {
        this.save(parsed, slotId);
      }
      return parsed;
    } catch (_) {
      return null;
    }
  }

  static async save(state, slotId = this.getActiveSlotId()) {
    const key = this.getSlotKey(slotId);
    if (state) {
      state.savedAt = Date.now();
      state.slotId = slotId;
    }

    try {
      const db = await this.initDb();
      const transaction = db.transaction('saves', 'readwrite');
      const store = transaction.objectStore('saves');
      store.put(state, key);
    } catch (e) {
      console.error("IndexedDB save failed", e);
    }
    try {
      const serialized = JSON.stringify(state);
      localStorage.setItem(key, serialized);
      // Auto-Backup Snapshot
      localStorage.setItem('empire_classic_backup_auto', serialized);
    } catch (e) {
      console.warn("LocalStorage fallback save failed", e);
    }
  }

  static restoreAutoBackup() {
    try {
      const raw = localStorage.getItem('empire_classic_backup_auto');
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  static async listSlots() {
    const slots = [
      { id: 'slot_1', name: 'Speicherplatz 1' },
      { id: 'slot_2', name: 'Speicherplatz 2' },
      { id: 'slot_3', name: 'Speicherplatz 3' }
    ];

    for (let slot of slots) {
      const data = await this.load(slot.id);
      if (data) {
        const dateStr = data.savedAt ? new Date(data.savedAt).toLocaleString() : 'Vorhanden';
        const keepLvl = data.buildings?.find(b => b.type === 'keep')?.level || 1;
        slot.info = `Burg Level ${keepLvl} (${dateStr})`;
        slot.hasData = true;
      } else {
        slot.info = 'Leer';
        slot.hasData = false;
      }
    }
    return slots;
  }

  static async deleteSlot(slotId) {
    const key = this.getSlotKey(slotId);
    try {
      const db = await this.initDb();
      const transaction = db.transaction('saves', 'readwrite');
      const store = transaction.objectStore('saves');
      store.delete(key);
    } catch (e) {
      console.error("IndexedDB delete failed", e);
    }
    localStorage.removeItem(key);
  }

  static loadHighscores() {
    const raw = localStorage.getItem(this.HIGHSCORES_KEY) || '[]';
    try { return JSON.parse(raw); } catch (_) { return []; }
  }

  static saveHighscores(scores) {
    localStorage.setItem(this.HIGHSCORES_KEY, JSON.stringify(scores));
  }

  static generateCloudBackupCode(state) {
    if (!state) return '';
    try {
      const payload = {
        v: 2,
        ts: Date.now(),
        data: state
      };
      const json = JSON.stringify(payload);
      return 'BURGEN_' + btoa(encodeURIComponent(json));
    } catch (e) {
      console.error("Failed to generate cloud code", e);
      return '';
    }
  }

  static importCloudBackupCode(code) {
    if (!code || typeof code !== 'string') return null;
    try {
      let clean = code.trim();
      if (clean.startsWith('BURGEN_')) {
        clean = clean.replace('BURGEN_', '');
      }
      const json = decodeURIComponent(atob(clean));
      const parsed = JSON.parse(json);
      return parsed.data || parsed;
    } catch (e) {
      console.error("Failed to parse cloud backup code", e);
      return null;
    }
  }

  static async simulateCloudSync(state) {
    if (!state) return { success: false, message: 'Keine Daten zum Synchronisieren' };
    const code = this.generateCloudBackupCode(state);
    state.cloudBackupCode = code;
    await this.save(state);
    return { success: true, code, syncedAt: Date.now() };
  }
}

window.Persistence = Persistence;



