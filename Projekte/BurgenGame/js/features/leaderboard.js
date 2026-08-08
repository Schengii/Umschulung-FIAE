// --- LEADERBOARD FEATURE ---

class Leaderboard {
  constructor(stateManager, ui) {
    this.stateManager = stateManager;
    this.ui = ui;
    this.scores = [];
    this.localKey = 'empire_leaderboard'; // fallback storage
  }

  // Load scores from remote JSON (static) or fallback to localStorage
  async loadScores() {
    try {
      const resp = await fetch('js/features/leaderboard.json');
      if (resp.ok) {
        this.scores = await resp.json();
        // also sync to localStorage for offline
        localStorage.setItem(this.localKey, JSON.stringify(this.scores));
        return;
      }
    } catch (e) {
      // ignore, fallback below
    }
    // fallback: load from localStorage if exists
    const stored = localStorage.getItem(this.localKey);
    this.scores = stored ? JSON.parse(stored) : [
      { name: "Alice", score: 1200, date: 1670000000000 },
      { name: "Bob", score: 950, date: 1670100000000 },
      { name: "Charlie", score: 800, date: 1670200000000 }
    ];
  }

  // Save scores to localStorage (cannot write to static JSON on client)
  saveScores() {
    localStorage.setItem(this.localKey, JSON.stringify(this.scores));
  }

  // Submit a new score (name, value)
  async submitScore(name, value) {
    // Ensure scores are loaded
    await this.loadScores();
    const entry = { name, score: Number(value), date: Date.now() };
    this.scores.push(entry);
    // Keep top 10 sorted descending by score
    this.scores.sort((a, b) => b.score - a.score);
    this.scores = this.scores.slice(0, 10);
    this.saveScores();
  }

  // Open the leaderboard modal UI
  async open() {
    await this.loadScores();
    let rows = '';
    this.scores.forEach((entry, idx) => {
      rows += `<tr><td>${idx + 1}</td><td>${entry.name}</td><td>${entry.score}</td></tr>`;
    });
    const html = `
      <h2>🏆 High Scores</h2>
      <table class="glass-card" style="width:100%; text-align:center; border-collapse: collapse;">
        <thead><tr><th>#</th><th>Name</th><th>Score</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:15px;">
        <input id="lb-name" type="text" placeholder="Your Name" class="primary-btn" style="width:40%; margin-right:5px;" />
        <button id="lb-submit" class="primary-btn gold-btn">Submit Score</button>
      </div>
      <button class="primary-btn" id="lb-close" style="margin-top:15px; width:100%;">Close</button>
    `;
    this.ui.openModal(html);
    // Attach listeners
    document.getElementById('lb-close').addEventListener('click', () => this.ui.closeModal());
    document.getElementById('lb-submit').addEventListener('click', async () => {
      const name = document.getElementById('lb-name').value.trim() || 'Anonymous';
      // Use current gold as the score (could be any metric)
      const score = this.stateManager.state.resources.gold || 0;
      await this.submitScore(name, score);
      // Refresh view
      this.open();
    });
  }
}

window.Leaderboard = null;
