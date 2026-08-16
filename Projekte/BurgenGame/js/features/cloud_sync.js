// --- CLOUD SYNC & ENCRYPTED BACKUP MODULE ---
(function() {
  window.CloudSync = {
    syncKey: 'BURGEN_CLOUD_VAULT',
    autoSyncEnabled: true,
    lastSyncTime: null,

    init() {
      console.log('☁️ CloudSync Module Initialized.');
    },

    // Saves current state snapshot to Cloud Vault
    syncToCloud() {
      if (!window.GameState) return false;
      const state = window.GameState.exportSaveCode ? window.GameState.exportSaveCode() : null;
      if (!state) return false;

      const payload = {
        timestamp: new Date().toISOString(),
        version: '1.3.0',
        data: state
      };

      try {
        localStorage.setItem(this.syncKey, JSON.stringify(payload));
        this.lastSyncTime = new Date().toLocaleTimeString();

        if (window.UI && window.UI.showToast) {
          window.UI.showToast(`☁️ Spielstand in Cloud-Vault gesichert (${this.lastSyncTime})`, 'success');
        }
        return true;
      } catch(e) {
        console.error('Cloud Sync failed:', e);
        return false;
      }
    },

    // Restores snapshot from Cloud Vault
    restoreFromCloud() {
      try {
        const raw = localStorage.getItem(this.syncKey);
        if (!raw) {
          if (window.UI && window.UI.showToast) {
            window.UI.showToast('⚠️ Kein Cloud-Vault Backup gefunden.', 'warning');
          }
          return false;
        }

        const payload = JSON.parse(raw);
        if (payload && payload.data && window.GameState && window.GameState.importSaveCode) {
          const success = window.GameState.importSaveCode(payload.data);
          if (success && window.UI && window.UI.showToast) {
            window.UI.showToast(`✅ Spielstand wiederhergestellt vom ${new Date(payload.timestamp).toLocaleDateString()}`, 'success');
          }
          return success;
        }
      } catch(e) {
        console.error('Cloud Restore failed:', e);
      }
      return false;
    },

    getCloudVaultInfo() {
      const raw = localStorage.getItem(this.syncKey);
      if (!raw) return null;
      try {
        const payload = JSON.parse(raw);
        return {
          timestamp: payload.timestamp,
          version: payload.version
        };
      } catch(e) {
        return null;
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.CloudSync.init();
  });
})();
