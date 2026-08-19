/**
 * @file challenge-lab.js
 * @description Interaktives Clean-Code, RegEx und Security Challenge Lab mit Sofort-Feedback
 */

const CHALLENGES = [
  {
    id: 'c1',
    title: 'Lab 1: SQL-Injection Sicherheitslücke aufspüren',
    category: 'IT-Sicherheit & DBs',
    xp: 50,
    desc: 'Welche Zeile in folgendem Node.js/Express Backend-Ausschnitt ermöglicht einen SQL-Injection-Angriff über String-Konkatenation?',
    code: `1: app.post('/api/login', async (req, res) => {
2:   const { username, password } = req.body;
3:   // Authentifizierungs-Query
4:   const query = "SELECT * FROM users WHERE user = '" + username + "' AND pass = '" + password + "'";
5:   const user = await db.raw(query);
6:   res.json({ success: !!user });
7: });`,
    options: [
      { id: 'a', text: 'Zeile 2: Destructuring von req.body', correct: false },
      { id: 'b', text: 'Zeile 4: Direkte Verkettung von Benutzereingaben im SQL-String', correct: true },
      { id: 'c', text: 'Zeile 6: Doppelte Verneinung (!!user)', correct: false },
      { id: 'd', text: 'Zeile 1: Async-Deklaration der Route', correct: false }
    ],
    explanation: 'Richtig! In Zeile 4 wird der SQL-Query per String-Konkatenation zusammengesetzt. Angreifer können mit `admin\' --` das Passwort umgehen. Lösung: Parameterized Queries / Prepared Statements verwenden.'
  },
  {
    id: 'c2',
    title: 'Lab 2: RegEx für deutsche Postleitzahlen (PLZ)',
    category: 'Reguläre Ausdrücke',
    xp: 50,
    desc: 'Welcher Regular Expression validiert eine exakt 5-stellige deutsche Postleitzahl (nur Ziffern 0-9)?',
    code: `// Erwartet z.B. "04109", "10115", "80331"
// Ungültig: "1234", "123456", "D-12345", "1234a"
const isValidPLZ = (plz) => regex.test(plz);`,
    options: [
      { id: 'a', text: `/^[0-9]{5}$/`, correct: true },
      { id: 'b', text: `/[0-9]{5}/`, correct: false },
      { id: 'c', text: `/^\\d{4,5}$/`, correct: false },
      { id: 'd', text: `/[a-zA-Z0-9]{5}/`, correct: false }
    ],
    explanation: 'Richtig! `^[0-9]{5}$` (oder `^\\d{5}$`) prüft vom Anfang (`^`) bis zum Ende (`$`) exakt 5 numerische Zeichen ab. Ohne Anker würden auch 6-stellige Zahlen matchen.'
  },
  {
    id: 'c3',
    title: 'Lab 3: Clean Code & Pure Functions',
    category: 'Software-Architektur',
    xp: 50,
    desc: 'Warum ist die folgende Funktion KEINE "Pure Function" (Reine Funktion)?',
    code: `let discountMultiplier = 0.9;

function calculateFinalPrice(cartItems) {
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  console.log("Calculated total:", total);
  return total * discountMultiplier;
}`,
    options: [
      { id: 'a', text: 'Weil `Array.prototype.reduce` verwendet wird', correct: false },
      { id: 'b', text: 'Weil sie auf den externen State `discountMultiplier` zugreift und einen Nebeneffekt (`console.log`) hat', correct: true },
      { id: 'c', text: 'Weil sie keinen Default-Parameter besitzt', correct: false },
      { id: 'd', text: 'Weil Multiplikation mit Float-Werten unpräzise ist', correct: false }
    ],
    explanation: 'Richtig! Eine Pure Function darf nur von ihren Eingabeparametern abhängen (kein Zugriff auf veränderliche externe Variablen wie `discountMultiplier`) und darf keine Nebeneffekte (wie I/O oder Logging) auslösen.'
  },
  {
    id: 'c4',
    title: 'Lab 4: Algorithmus-Komplexität (Big-O Notation)',
    category: 'Algorithmen & Datenstrukturen',
    xp: 50,
    desc: 'Welche Zeitkomplexität im Worst Case besitzt die binäre Suche (Binary Search) auf einem sortierten Array mit n Elementen?',
    code: `function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    options: [
      { id: 'a', text: 'O(1) — Konstante Laufzeit', correct: false },
      { id: 'b', text: 'O(log n) — Logarithmische Laufzeit', correct: true },
      { id: 'c', text: 'O(n) — Lineare Laufzeit', correct: false },
      { id: 'd', text: 'O(n²) — Quadratische Laufzeit', correct: false }
    ],
    explanation: 'Richtig! In jedem Schritt halbiert die binäre Suche den Suchbereich (`n / 2 / 2 / ...`). Dadurch beträgt die maximale Schrittanzahl `log2(n)`.'
  }
];

let solvedChallenges = new Set();
let totalXp = 0;

export function initChallengeLab() {
  const isLabPage = document.querySelector('.page-challenge-lab') || document.getElementById('lab-challenges-list');
  if (!isLabPage) return;

  renderChallenges();
  updateProgressHeader();
}

function renderChallenges() {
  const container = document.getElementById('lab-challenges-list');
  if (!container) return;

  container.innerHTML = '';

  CHALLENGES.forEach((challenge, index) => {
    const isSolved = solvedChallenges.has(challenge.id);

    const card = document.createElement('div');
    card.className = 'card';
    card.id = `card-${challenge.id}`;
    card.style.border = isSolved ? '1px solid #10b981' : '1px solid var(--border-color)';
    card.style.position = 'relative';

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="background: rgba(14, 165, 233, 0.15); color: var(--accent-color); font-size: 0.8rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px;">
            ${challenge.category}
          </span>
          <h3 style="margin: 0; font-size: 1.2rem;">${challenge.title}</h3>
        </div>
        <span style="font-weight: 700; color: #10b981; font-size: 0.9rem;">+${challenge.xp} XP</span>
      </div>

      <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.95rem;">${challenge.desc}</p>

      <pre style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: 6px; padding: 1rem; overflow-x: auto; font-family: monospace; font-size: 0.88rem; margin-bottom: 1.25rem; line-height: 1.5;"><code style="color: #38bdf8;">${escapeHtml(challenge.code)}</code></pre>

      <!-- Options -->
      <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
        ${challenge.options.map(opt => `
          <button class="btn btn-outline challenge-opt-btn" data-challenge-id="${challenge.id}" data-opt-id="${opt.id}" style="text-align: left; justify-content: flex-start; padding: 0.6rem 1rem; font-size: 0.9rem; border-color: var(--border-color);">
            <strong style="margin-right: 0.5rem;">${opt.id.toUpperCase()}:</strong> ${opt.text}
          </button>
        `).join('')}
      </div>

      <!-- Feedback Area -->
      <div id="feedback-${challenge.id}" style="display: none; padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.9rem; margin-top: 0.5rem;"></div>
    `;

    container.appendChild(card);
  });

  // Attach button clicks
  container.querySelectorAll('.challenge-opt-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const chId = btn.dataset.challengeId;
      const optId = btn.dataset.optId;
      handleAnswer(chId, optId);
    });
  });
}

function handleAnswer(challengeId, optionId) {
  const challenge = CHALLENGES.find(c => c.id === challengeId);
  if (!challenge) return;

  const selectedOpt = challenge.options.find(o => o.id === optionId);
  const feedbackEl = document.getElementById(`feedback-${challengeId}`);
  const cardEl = document.getElementById(`card-${challengeId}`);
  if (!feedbackEl) return;

  feedbackEl.style.display = 'block';

  if (selectedOpt.correct) {
    feedbackEl.style.background = 'rgba(16, 185, 129, 0.1)';
    feedbackEl.style.border = '1px solid #10b981';
    feedbackEl.style.color = '#10b981';
    feedbackEl.innerHTML = `✅ <strong>Exzellent gelöst!</strong> ${challenge.explanation}`;

    if (!solvedChallenges.has(challengeId)) {
      solvedChallenges.add(challengeId);
      totalXp += challenge.xp;
      updateProgressHeader();
    }
    if (cardEl) cardEl.style.border = '1px solid #10b981';
  } else {
    feedbackEl.style.background = 'rgba(239, 68, 68, 0.1)';
    feedbackEl.style.border = '1px solid #ef4444';
    feedbackEl.style.color = '#ef4444';
    feedbackEl.innerHTML = `❌ <strong>Nicht ganz richtig.</strong> Überprüfe den Code und versuche es erneut!`;
  }
}

function updateProgressHeader() {
  const scoreEl = document.getElementById('lab-score-display');
  const progressEl = document.getElementById('lab-progress-display');
  const rankEl = document.getElementById('lab-rank-display');

  if (scoreEl) scoreEl.textContent = `${totalXp} XP`;
  if (progressEl) progressEl.textContent = `${solvedChallenges.size} / ${CHALLENGES.length} Labs`;

  if (rankEl) {
    if (solvedChallenges.size === 0) rankEl.textContent = 'Novize';
    else if (solvedChallenges.size <= 2) rankEl.textContent = 'Junior Refactorer';
    else if (solvedChallenges.size < CHALLENGES.length) rankEl.textContent = 'Clean Code Craftsman';
    else rankEl.textContent = '🏆 Lead Architect';
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
