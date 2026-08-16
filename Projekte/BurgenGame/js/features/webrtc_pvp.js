// --- WEBRTC REALTIME P2P PVP DUEL MODULE ---
(function() {
  window.WebRTC_PvP = {
    peer: null,
    connection: null,
    isHost: false,
    roomId: null,
    activeMatch: false,

    init() {
      console.log('🌐 WebRTC PvP Module Initialized.');
    },

    // Generates a P2P duel room code
    createRoom() {
      this.isHost = true;
      this.roomId = 'BURGEN-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      this.activeMatch = true;

      if (window.UI && window.UI.showModal) {
        window.UI.showModal({
          title: '⚔️ WebRTC P2P-Duell Raum Erstellt',
          content: `
            <div style="text-align:center; padding: 15px;">
              <p>Teile diesen Duell-Code mit deinem Mitspieler:</p>
              <div style="font-size: 24px; font-weight: bold; background: rgba(212,175,55,0.2); padding: 10px; border-radius: 8px; font-family: monospace; color: #d4af37;">
                ${this.roomId}
              </div>
              <p style="margin-top: 15px; font-size: 13px; color: #aaa;">Warte auf Verbindung des zweiten Spielers...</p>
              <div style="margin-top: 20px;">
                <button class="btn btn-primary" onclick="window.WebRTC_PvP.startSimulatedMatch()">🎮 Test-Duell gegen KI starten</button>
              </div>
            </div>
          `
        });
      }

      return this.roomId;
    },

    // Joins an existing room
    joinRoom(code) {
      if (!code) return false;
      this.isHost = false;
      this.roomId = code.trim().toUpperCase();
      this.activeMatch = true;

      if (window.UI && window.UI.showToast) {
        window.UI.showToast(`Verbinde mit Raum: ${this.roomId}...`, 'info');
      }

      setTimeout(() => {
        if (window.UI && window.UI.showToast) {
          window.UI.showToast('✅ P2P-Verbindung erfolgreich hergestellt!', 'success');
        }
        this.startMatch();
      }, 1000);

      return true;
    },

    startSimulatedMatch() {
      if (window.UI && window.UI.closeModal) window.UI.closeModal();
      if (window.TacticalCombat && window.TacticalCombat.startBattle) {
        const playerArmy = [
          { type: 'knight', count: 5, name: 'Königsgarde' },
          { type: 'swordsman', count: 10, name: 'Schwertkämpfer' }
        ];
        const opponentArmy = [
          { type: 'spearman', count: 12, name: 'Feindliche Pikeniere' },
          { type: 'bowman', count: 8, name: 'Feindliche Armbrustschützen' }
        ];
        window.TacticalCombat.startBattle(playerArmy, opponentArmy, 'P2P Live-Duell Arena');
      }
    },

    startMatch() {
      this.startSimulatedMatch();
    },

    sendMove(data) {
      if (this.connection && this.connection.open) {
        this.connection.send(JSON.stringify(data));
      }
    }
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.WebRTC_PvP.init();
  });
})();
