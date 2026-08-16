// --- ONLINE MULTIPLAYER & SERVER SYNC FEATURE ---

class OnlineMultiplayer {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.serverUrl = 'http://localhost:3001/api';
    this.isOnline = false;
    this.chatMessages = [];
  }

  async init() {
    await this.checkServerStatus();
    if (this.isOnline) {
      this.syncLeaderboard();
    }
  }

  async checkServerStatus() {
    try {
      const res = await fetch(`${this.serverUrl}/health`);
      if (res.ok) {
        this.isOnline = true;
        console.log("🌐 Serververbindung hergestellt!");
      }
    } catch (e) {
      this.isOnline = false;
      console.log("ℹ️ Server Offline - Spiel läuft im Einzelspieler-Modus.");
    }
  }

  async saveToServer() {
    if (!this.isOnline) {
      await this.checkServerStatus();
      if (!this.isOnline) {
        this.gameUI.showToast("Server offline. Spielstand wurde lokal gespeichert.", "warning");
        return false;
      }
    }

    try {
      const username = this.stateManager.state.rulerTitle || 'Spieler';
      const res = await fetch(`${this.serverUrl}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          state: this.stateManager.state
        })
      });
      const data = await res.json();
      if (data.success) {
        this.gameUI.showToast("☁️ Spielstand auf Server gespeichert!", "success");
        return true;
      }
    } catch (e) {
      console.error("Server Save Error:", e);
      this.gameUI.showToast("Fehler beim Cloud-Speichern.", "error");
    }
    return false;
  }

  async loadFromServer() {
    const username = this.stateManager.state.rulerTitle || 'Spieler';
    try {
      const res = await fetch(`${this.serverUrl}/load/${encodeURIComponent(username)}`);
      const data = await res.json();
      if (data.success && data.state) {
        this.stateManager.state = data.state;
        this.stateManager.save();
        this.gameUI.showToast("☁️ Server-Spielstand erfolgreich geladen!", "success");
        location.reload();
        return true;
      } else {
        this.gameUI.showToast("Kein Server-Spielstand für diesen Namen gefunden.", "warning");
      }
    } catch (e) {
      this.gameUI.showToast("Fehler beim Laden vom Server.", "error");
    }
    return false;
  }

  async fetchChat() {
    try {
      const res = await fetch(`${this.serverUrl}/chat`);
      const data = await res.json();
      if (data.messages) {
        this.chatMessages = data.messages;
      }
    } catch (e) {
      console.error("Chat Fetch Error:", e);
    }
  }

  async sendChatMessage(text) {
    if (!text.trim()) return;
    const sender = this.stateManager.state.rulerTitle || 'König';

    try {
      const res = await fetch(`${this.serverUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender, text })
      });
      const data = await res.json();
      if (data.success) {
        await this.fetchChat();
        this.showChatModal();
      }
    } catch (e) {
      this.gameUI.showToast("Nachricht konnte nicht gesendet werden (Server Offline).", "error");
    }
  }

  async syncLeaderboard() {
    try {
      const score = (this.stateManager.state.resources.gold || 0) + (this.stateManager.state.buildings ? this.stateManager.state.buildings.length * 100 : 0);
      const name = this.stateManager.state.rulerTitle || 'Herrscher';
      await fetch(`${this.serverUrl}/leaderboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score, age: 'Königreich' })
      });
    } catch (e) {
      console.warn("Leaderboard sync skipped.");
    }
  }

  async showChatModal() {
    await this.fetchChat();

    const msgList = this.chatMessages.map(m => `
      <div style="margin-bottom: 8px; background: rgba(255,255,255,0.05); padding: 6px 10px; border-radius: 6px;">
        <strong style="color: #d4af37;">${m.sender}:</strong>
        <span style="color: #eee;">${m.text}</span>
        <span style="font-size: 0.7em; color: #888; float: right;">${new Date(m.time).toLocaleTimeString()}</span>
      </div>
    `).join('');

    const statusBadge = this.isOnline 
      ? `<span style="color: #5f5; font-weight: bold;">🟢 Server Online</span>` 
      : `<span style="color: #f55; font-weight: bold;">🔴 Server Offline (Starte node server/server.js)</span>`;

    const content = `
      <div style="padding: 10px; max-width: 550px; margin: 0 auto;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 5px;">💬 Weltchat & Server-Verbindung</h2>
        <div style="margin-bottom: 15px; font-size: 0.85em;">Status: ${statusBadge}</div>

        <div id="chat-messages-container" style="height: 220px; overflow-y: auto; background: #111; padding: 10px; border-radius: 6px; margin-bottom: 12px; border: 1px solid #333;">
          ${msgList || '<p style="color: #777;">Keine Nachrichten.</p>'}
        </div>

        <div style="display: flex; gap: 8px; margin-bottom: 15px;">
          <input type="text" id="chat-input-text" placeholder="Deine Nachricht an alle Herrscher..." style="flex: 1; background: #222; color: white; border: 1px solid #444; border-radius: 4px; padding: 8px;" onkeypress="if(event.key==='Enter') window.onlineMultiplayer.handleChatSend()">
          <button onclick="window.onlineMultiplayer.handleChatSend()" style="background: #d4af37; color: black; border: none; padding: 8px 15px; border-radius: 4px; font-weight: bold; cursor: pointer;">Senden</button>
        </div>

        <div style="display: flex; justify-content: space-between; border-top: 1px solid #333; padding-top: 10px;">
          <button onclick="window.onlineMultiplayer.saveToServer()" style="background: #2a8; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">☁️ Auf Server Speichern</button>
          <button onclick="window.onlineMultiplayer.loadFromServer()" style="background: #468; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">☁️ Vom Server Laden</button>
        </div>
      </div>
    `;

    this.gameUI.showModal('Server Chat & Sync', content);
    const container = document.getElementById('chat-messages-container');
    if (container) container.scrollTop = container.scrollHeight;
  }

  handleChatSend() {
    const input = document.getElementById('chat-input-text');
    if (input) {
      this.sendChatMessage(input.value);
      input.value = '';
    }
  }
}

window.OnlineMultiplayer = OnlineMultiplayer;
