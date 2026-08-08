// --- INTERACTIVE JOUSTING TOURNAMENT FEATURE MODULE ---

class JoustingTournament {
  constructor(stateManager, ui) {
    this.stateManager = stateManager;
    this.ui = ui;
    this.active = false;
    this.currentOpponent = null;
    this.lancePosition = 50; // 0 to 100 % center target
    this.targetDirection = 1;
    this.speed = 2.5;
    this.animFrame = null;
    this.round = 1;
    this.playerScore = 0;
    this.opponentScore = 0;
  }

  startTournament(opponentName = 'Graf von Falkenstein', difficulty = 1) {
    this.active = true;
    this.round = 1;
    this.playerScore = 0;
    this.opponentScore = 0;
    this.currentOpponent = {
      name: opponentName,
      difficulty,
      armor: 100 + difficulty * 20
    };
    this.openTournamentModal();
  }

  openTournamentModal() {
    let html = `
      <h2>🛡️ Königliches Ritterturnier (Jousting Arena)</h2>
      <p class="modal-intro">Gegenüber steht dir <strong>${this.currentOpponent.name}</strong> auf seinem Schlachtross! Treffe das Zentrum der Zielscheibe, um den Gegner vom Pferd zu stoßen.</p>
      
      <div style="background: rgba(0,0,0,0.4); border: 2px solid var(--color-gold-hover); border-radius: 8px; padding: 20px; text-align: center; margin: 15px 0; position: relative; overflow: hidden;">
        <div style="font-size: 1.1rem; color: #f1c40f; margin-bottom: 15px;">
          Runde ${this.round} / 3 | Stand: <span style="color: #2ecc71;">Du: ${this.playerScore}</span> - <span style="color: #e74c3c;">Gegner: ${this.opponentScore}</span>
        </div>

        <!-- Jousting Target Gauge -->
        <div style="position: relative; width: 100%; height: 36px; background: #2c3e50; border-radius: 18px; border: 2px solid #ecf0f1; margin: 20px 0;">
          <!-- Bullseye Zone (Center 40% to 60%) -->
          <div style="position: absolute; left: 40%; width: 20%; height: 100%; background: rgba(46, 204, 113, 0.6); border-left: 2px dashed #fff; border-right: 2px dashed #fff;"></div>
          <!-- Exact Center (48% to 52%) -->
          <div style="position: absolute; left: 48%; width: 4%; height: 100%; background: #f1c40f;"></div>

          <!-- Moving Pointer (Lance Cursor) -->
          <div id="joust-cursor" style="position: absolute; left: 50%; top: -6px; width: 8px; height: 48px; background: #e74c3c; border: 1px solid #fff; border-radius: 4px; transform: translateX(-50%); box-shadow: 0 0 10px #e74c3c;"></div>
        </div>

        <div style="margin-top: 25px;">
          <button id="btn-joust-strike" class="primary-btn gold-btn bounce-animation" style="font-size: 1.1rem; padding: 10px 25px;">⚡ LANZE STOSSEN!</button>
        </div>
      </div>
    `;

    this.ui.openModal(html);

    const strikeBtn = document.getElementById('btn-joust-strike');
    if (strikeBtn) {
      strikeBtn.addEventListener('click', () => this.strikeLance());
    }

    this.startGaugeAnimation();
  }

  startGaugeAnimation() {
    this.speed = 2.0 + Math.random() * 1.5;
    const animate = () => {
      if (!this.active) return;
      this.lancePosition += this.speed * this.targetDirection;
      if (this.lancePosition >= 95) {
        this.lancePosition = 95;
        this.targetDirection = -1;
      } else if (this.lancePosition <= 5) {
        this.lancePosition = 5;
        this.targetDirection = 1;
      }

      const cursor = document.getElementById('joust-cursor');
      if (cursor) {
        cursor.style.left = `${this.lancePosition}%`;
        this.animFrame = requestAnimationFrame(animate);
      }
    };
    this.animFrame = requestAnimationFrame(animate);
  }

  strikeLance() {
    cancelAnimationFrame(this.animFrame);
    
    // Calculate hit distance from center (50%)
    const diff = Math.abs(this.lancePosition - 50);
    let hitQuality = 'miss';
    let pts = 0;

    if (diff <= 3) {
      hitQuality = 'bullseye';
      pts = 3; // Unhorsed opponent!
    } else if (diff <= 10) {
      hitQuality = 'good';
      pts = 2; // Shield hit
    } else if (diff <= 20) {
      hitQuality = 'glance';
      pts = 1; // Glancing blow
    }

    // Opponent counter-roll
    const oppRoll = Math.floor(Math.random() * 3);
    this.playerScore += pts;
    this.opponentScore += oppRoll;

    let resultMsg = "";
    if (hitQuality === 'bullseye') {
      resultMsg = "🎯 VOLLES ZENTRUM! Du hast den Gegner spektakulär aus dem Sattel gehoben! (+3 Pkt)";
      if (window.gameSound) window.gameSound.playSFX('upgrade');
    } else if (hitQuality === 'good') {
      resultMsg = "🛡️ Schildtreffer! Lanzer splittert kraftvoll. (+2 Pkt)";
      if (window.gameSound) window.gameSound.playSFX('blacksmith');
    } else if (hitQuality === 'glance') {
      resultMsg = "⚔️ Streifschuss an der Rüstung. (+1 Pkt)";
    } else {
      resultMsg = "❌ Vorbeigestochen! Kein Treffer. (0 Pkt)";
    }

    if (this.round < 3) {
      this.round++;
      this.ui.showToast(resultMsg, hitQuality === 'bullseye' ? 'success' : 'info');
      setTimeout(() => this.openTournamentModal(), 1200);
    } else {
      this.active = false;
      this.finishTournament();
    }
  }

  finishTournament() {
    const isVictory = this.playerScore > this.opponentScore;
    let rewardText = "";

    if (isVictory) {
      const goldReward = 250 + this.currentOpponent.difficulty * 100;
      const rubyReward = 15;
      this.stateManager.state.resources.gold += goldReward;
      this.stateManager.state.resources.rubies = (this.stateManager.state.resources.rubies || 0) + rubyReward;
      this.stateManager.save();

      rewardText = `🏆 **Turniersieg!** Du hast ${this.currentOpponent.name} besiegt!<br><br>` +
        `• 🪙 **+${goldReward} Gold**<br>` +
        `• 💎 **+${rubyReward} Rubine**<br>` +
        `• 👑 **+100 Ruhmespunkte**`;
      if (window.gameSound) window.gameSound.playSFX('quest');
    } else {
      rewardText = `🛡️ **Turnier beendet!** ${this.currentOpponent.name} behielt knapp die Oberhand. Du erhältst 50 Gold als Trostpreis.`;
      this.stateManager.state.resources.gold += 50;
      this.stateManager.save();
    }

    this.ui.showNotificationModal(isVictory ? '🏆 Turniersieger!' : '🛡️ Turnier-Ergebnis', rewardText);
  }
}

window.JoustingTournament = JoustingTournament;
