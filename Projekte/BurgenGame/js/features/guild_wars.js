// --- MULTIPLAYER GUILD WARS & FORTRESS SYSTEM ---

class GuildWarsEngine {
  constructor(stateManager, gameUI) {
    this.stateManager = stateManager;
    this.gameUI = gameUI;
    this.guild = null;
  }

  init() {
    if (!this.stateManager.state.guildData) {
      this.stateManager.state.guildData = null;
    }
    this.guild = this.stateManager.state.guildData;
  }

  foundGuild(guildName) {
    if (!guildName || !guildName.trim()) return;
    if (this.stateManager.state.resources.gold < 500) {
      this.gameUI.showToast("Für die Gründung einer Gilde werden 500 Gold benötigt!", "error");
      return;
    }

    this.stateManager.state.resources.gold -= 500;
    this.guild = {
      name: guildName,
      level: 1,
      vault: { gold: 500, stone: 200, iron: 100 },
      members: [
        { name: this.stateManager.state.rulerTitle || 'Gildenmeister', role: 'Anführer' },
        { name: 'Sir Kay', role: 'Offizier' },
        { name: 'Lady Guinevere', role: 'Mitglied' }
      ],
      fortressHp: 500,
      fortressMaxHp: 500,
      activeSiege: null
    };

    this.stateManager.state.guildData = this.guild;
    this.stateManager.save();
    this.gameUI.showToast(`🛡️ Gilde "${guildName}" erfolgreich gegründet!`, "success");
    this.showGuildModal();
  }

  donateToVault(resType, amount) {
    if (!this.guild) return;
    if ((this.stateManager.state.resources[resType] || 0) < amount) {
      this.gameUI.showToast(`Nicht genug ${resType} für die Spende!`, "error");
      return;
    }

    this.stateManager.state.resources[resType] -= amount;
    this.guild.vault[resType] = (this.guild.vault[resType] || 0) + amount;

    // Level up check
    if (this.guild.vault.gold >= this.guild.level * 1000) {
      this.guild.level += 1;
      this.guild.fortressMaxHp += 250;
      this.guild.fortressHp = this.guild.fortressMaxHp;
      this.gameUI.showToast(`🏰 Gilden-Festung auf Stufe ${this.guild.level} aufgewertet!`, "success");
    } else {
      this.gameUI.showToast(`💰 ${amount}x ${resType} in die Gilden-Kasse gespendet.`, "info");
    }

    this.stateManager.save();
    this.showGuildModal();
  }

  startGuildSiege() {
    if (!this.guild) return;
    if (this.guild.activeSiege) {
      this.gameUI.showToast("Eine Gilden-Belagerung läuft bereits!", "warning");
      return;
    }

    this.guild.activeSiege = {
      target: 'Drachenfestung der Schattengilde',
      targetHp: 800,
      progress: 0,
      rewards: { gold: 1200, rubies: 10 }
    };

    this.gameUI.showToast("⚔️ Gilden-Belagerung auf die Drachenfestung gestartet!", "warning");
    this.stateManager.save();
    this.showGuildModal();
  }

  attackSiegeTarget() {
    if (!this.guild || !this.guild.activeSiege) return;

    const dmg = 80 + Math.floor(Math.random() * 60);
    this.guild.activeSiege.targetHp -= dmg;

    if (this.guild.activeSiege.targetHp <= 0) {
      const r = this.guild.activeSiege.rewards;
      this.stateManager.state.resources.gold += r.gold;
      this.stateManager.state.resources.rubies += r.rubies;
      this.gameUI.showToast(`🎉 Belagerungssieg! Gilde erobert die Festung (+${r.gold} Gold, +${r.rubies} Rubine)!`, "success");
      this.guild.activeSiege = null;
    } else {
      this.gameUI.showToast(`💥 Katapulttreffer! ${dmg} Schaden an der Feindfestung verursacht.`, "info");
    }

    this.stateManager.save();
    this.showGuildModal();
  }

  showGuildModal() {
    this.init();

    if (!this.guild) {
      const content = `
        <div style="padding: 10px; max-width: 500px; margin: 0 auto; text-align: center;">
          <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 4px;">🛡️ Gilden & Allianz-System</h2>
          <p style="font-size: 0.85em; color: #aaa; margin-bottom: 15px;">Schließe dich mit anderen Herrschern zusammen oder gründe deine eigene Gilde.</p>

          <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h4 style="color: #d4af37; margin-bottom: 8px;">Gilde gründen:</h4>
            <input type="text" id="guild-name-input" placeholder="Name deiner Gilde..." style="width: 80%; padding: 8px; background: #222; color: white; border: 1px solid #444; border-radius: 4px; margin-bottom: 10px;">
            <br>
            <button onclick="window.guildWars.foundGuild(document.getElementById('guild-name-input').value)" style="background: #d4af37; color: black; border: none; padding: 8px 16px; border-radius: 4px; font-weight: bold; cursor: pointer;">Gilde Gründen (500 Gold)</button>
          </div>
        </div>
      `;
      this.gameUI.showModal('Gilden-System', content);
      return;
    }

    const g = this.guild;
    const membersHtml = g.members.map(m => `
      <div style="display: flex; justify-content: space-between; font-size: 0.85em; background: rgba(255,255,255,0.05); padding: 5px 8px; border-radius: 4px; margin-bottom: 4px;">
        <span style="color: #eee;">${m.name}</span>
        <span style="color: #d4af37; font-weight: bold;">${m.role}</span>
      </div>
    `).join('');

    const content = `
      <div style="padding: 10px; max-width: 580px; margin: 0 auto;">
        <h2 style="font-family: 'Cinzel', serif; color: #d4af37; margin-bottom: 4px; text-align: center;">🛡️ Gilde: ${g.name} (Stufe ${g.level})</h2>
        
        <div style="display: flex; gap: 15px; margin-bottom: 15px;">
          <!-- Vault Info -->
          <div style="flex: 1; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 6px;">
            <h4 style="color: #d4af37; margin-bottom: 5px;">🏛️ Gilden-Kasse:</h4>
            <div style="font-size: 0.85em; color: #ccc;">💰 Gold: ${g.vault.gold}</div>
            <div style="font-size: 0.85em; color: #ccc;">🪨 Stein: ${g.vault.stone}</div>
            <div style="font-size: 0.85em; color: #ccc;">⛏️ Eisen: ${g.vault.iron}</div>
            <div style="margin-top: 8px;">
              <button onclick="window.guildWars.donateToVault('gold', 100)" style="background: #2a8; color: white; border: none; padding: 4px 8px; font-size: 0.75em; border-radius: 3px; cursor: pointer;">100 Gold Spenden</button>
            </div>
          </div>

          <!-- Members List -->
          <div style="flex: 1; background: rgba(255,255,255,0.05); padding: 10px; border-radius: 6px;">
            <h4 style="color: #d4af37; margin-bottom: 5px;">👥 Mitglieder:</h4>
            ${membersHtml}
          </div>
        </div>

        <!-- Siege Area -->
        <div style="background: rgba(100,30,30,0.3); border: 1px solid #a44; padding: 12px; border-radius: 8px; text-align: center;">
          <h4 style="color: #f55; margin-bottom: 5px;">⚔️ Gilden-Belagerung & Kriege:</h4>
          ${g.activeSiege ? `
            <div style="font-size: 0.9em; color: #eee; margin-bottom: 6px;">Ziel: <strong>${g.activeSiege.target}</strong></div>
            <div style="font-size: 0.85em; color: #f55; margin-bottom: 10px;">Festung-HP: ${g.activeSiege.targetHp} / 800</div>
            <button onclick="window.guildWars.attackSiegeTarget()" style="background: #e74c3c; color: white; border: none; padding: 8px 15px; border-radius: 4px; font-weight: bold; cursor: pointer;">🚀 Belagerungs-Angriff durchführen</button>
          ` : `
            <p style="font-size: 0.85em; color: #aaa; margin-bottom: 8px;">Starte eine Belagerung auf feindliche Festungen für Beute.</p>
            <button onclick="window.guildWars.startGuildSiege()" style="background: #d4af37; color: black; border: none; padding: 6px 14px; border-radius: 4px; font-weight: bold; cursor: pointer;">⚔️ Neue Belagerung starten</button>
          `}
        </div>
      </div>
    `;

    this.gameUI.showModal('Gilden-Verwaltung', content);
  }
}

window.GuildWarsEngine = GuildWarsEngine;
