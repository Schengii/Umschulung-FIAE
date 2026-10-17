/**
 * @file challenge-lab.js
 * @description Interaktives Clean-Code, RegEx und Security Challenge Lab mit Sofort-Feedback
 */

const CHALLENGES = [
    {
        id: 'c1',
        title_de: 'Lab 1: SQL-Injection Sicherheitslücke aufspüren',
        title_en: 'Lab 1: Detect SQL Injection Vulnerability',
        category_de: 'IT-Sicherheit & DBs',
        category_en: 'IT Security & DBs',
        xp: 50,
        desc_de:
            'Welche Zeile in folgendem Node.js/Express Backend-Ausschnitt ermöglicht einen SQL-Injection-Angriff über String-Konkatenation?',
        desc_en:
            'Which line in the following Node.js/Express backend snippet enables a SQL injection vulnerability via string concatenation?',
        code: `1: app.post('/api/login', async (req, res) => {
2:   const { username, password } = req.body;
3:   // Authentifizierungs-Query
4:   const query = "SELECT * FROM users WHERE user = '" + username + "' AND pass = '" + password + "'";
5:   const user = await db.raw(query);
6:   res.json({ success: !!user });
7: });`,
        options: [
            {
                id: 'a',
                text_de: 'Zeile 2: Destructuring von req.body',
                text_en: 'Line 2: Destructuring of req.body',
                correct: false,
            },
            {
                id: 'b',
                text_de: 'Zeile 4: Direkte Verkettung von Benutzereingaben im SQL-String',
                text_en: 'Line 4: Direct concatenation of user input in the SQL query string',
                correct: true,
            },
            {
                id: 'c',
                text_de: 'Zeile 6: Doppelte Verneinung (!!user)',
                text_en: 'Line 6: Double negation (!!user)',
                correct: false,
            },
            {
                id: 'd',
                text_de: 'Zeile 1: Async-Deklaration der Route',
                text_en: 'Line 1: Async route declaration',
                correct: false,
            },
        ],
        explanation_de:
            "Richtig! In Zeile 4 wird der SQL-Query per String-Konkatenation zusammengesetzt. Angreifer können mit `admin' --` das Passwort umgehen. Lösung: Parameterized Queries / Prepared Statements verwenden.",
        explanation_en:
            "Correct! In line 4, the SQL query is assembled via string concatenation. Attackers could bypass authentication with `admin' --`. Solution: Use parameterized queries / prepared statements.",
    },
    {
        id: 'c2',
        title_de: 'Lab 2: RegEx für deutsche Postleitzahlen (PLZ)',
        title_en: 'Lab 2: Regular Expression for German Postal Codes (PLZ)',
        category_de: 'Reguläre Ausdrücke',
        category_en: 'Regular Expressions',
        xp: 50,
        desc_de: 'Welcher Regular Expression validiert eine exakt 5-stellige deutsche Postleitzahl (nur Ziffern 0-9)?',
        desc_en: 'Which regular expression validates an exact 5-digit German postal code (digits 0-9 only)?',
        code: `// Erwartet z.B. "04109", "10115", "80331"
// Ungültig: "1234", "123456", "D-12345", "1234a"
const isValidPLZ = (plz) => regex.test(plz);`,
        options: [
            { id: 'a', text_de: `/^[0-9]{5}$/`, text_en: `/^[0-9]{5}$/`, correct: true },
            { id: 'b', text_de: `/[0-9]{5}/`, text_en: `/[0-9]{5}/`, correct: false },
            { id: 'c', text_de: `/^\\d{4,5}$/`, text_en: `/^\\d{4,5}$/`, correct: false },
            { id: 'd', text_de: `/[a-zA-Z0-9]{5}/`, text_en: `/[a-zA-Z0-9]{5}/`, correct: false },
        ],
        explanation_de:
            'Richtig! `^[0-9]{5}$` (oder `^\\d{5}$`) prüft vom Anfang (`^`) bis zum Ende (`$`) exakt 5 numerische Zeichen ab. Ohne Anker würden auch 6-stellige Zahlen matchen.',
        explanation_en:
            'Correct! `^[0-9]{5}$` (or `^\\d{5}$`) validates exactly 5 numeric digits from start (`^`) to end (`$`). Without anchors, 6-digit inputs would match too.',
    },
    {
        id: 'c3',
        title_de: 'Lab 3: Clean Code & Pure Functions',
        title_en: 'Lab 3: Clean Code & Pure Functions',
        category_de: 'Software-Architektur',
        category_en: 'Software Architecture',
        xp: 50,
        desc_de: 'Warum ist die folgende Funktion KEINE "Pure Function" (Reine Funktion)?',
        desc_en: 'Why is the following function NOT a pure function?',
        code: `let discountMultiplier = 0.9;

function calculateFinalPrice(cartItems) {
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  console.log("Calculated total:", total);
  return total * discountMultiplier;
}`,
        options: [
            {
                id: 'a',
                text_de: 'Weil `Array.prototype.reduce` verwendet wird',
                text_en: 'Because `Array.prototype.reduce` is being used',
                correct: false,
            },
            {
                id: 'b',
                text_de: 'Weil sie auf den externen State `discountMultiplier` zugreift und einen Nebeneffekt (`console.log`) hat',
                text_en: 'Because it accesses mutable external state `discountMultiplier` and produces a side effect (`console.log`)',
                correct: true,
            },
            {
                id: 'c',
                text_de: 'Weil sie keinen Default-Parameter besitzt',
                text_en: 'Because it lacks a default parameter',
                correct: false,
            },
            {
                id: 'd',
                text_de: 'Weil Multiplikation mit Float-Werten unpräzise ist',
                text_en: 'Because floating-point multiplication can be imprecise',
                correct: false,
            },
        ],
        explanation_de:
            'Richtig! Eine Pure Function darf nur von ihren Eingabeparametern abhängen (kein Zugriff auf veränderliche externe Variablen wie `discountMultiplier`) und darf keine Nebeneffekte (wie I/O oder Logging) auslösen.',
        explanation_en:
            'Correct! A pure function must depend solely on its arguments (no accessing mutable external variables like `discountMultiplier`) and must not produce side effects (such as I/O or console logging).',
    },
    {
        id: 'c4',
        title_de: 'Lab 4: Algorithmus-Komplexität (Big-O Notation)',
        title_en: 'Lab 4: Algorithm Complexity (Big-O Notation)',
        category_de: 'Algorithmen & Datenstrukturen',
        category_en: 'Algorithms & Data Structures',
        xp: 50,
        desc_de:
            'Welche Zeitkomplexität im Worst Case besitzt die binäre Suche (Binary Search) auf einem sortierten Array mit n Elementen?',
        desc_en:
            'What is the worst-case time complexity of binary search on a sorted array with n elements?',
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
            { id: 'a', text_de: 'O(1) — Konstante Laufzeit', text_en: 'O(1) — Constant time', correct: false },
            { id: 'b', text_de: 'O(log n) — Logarithmische Laufzeit', text_en: 'O(log n) — Logarithmic time', correct: true },
            { id: 'c', text_de: 'O(n) — Lineare Laufzeit', text_en: 'O(n) — Linear time', correct: false },
            { id: 'd', text_de: 'O(n²) — Quadratische Laufzeit', text_en: 'O(n²) — Quadratic time', correct: false },
        ],
        explanation_de:
            'Richtig! In jedem Schritt halbiert die binäre Suche den Suchbereich (`n / 2 / 2 / ...`). Dadurch beträgt die maximale Schrittanzahl `log2(n)`.',
        explanation_en:
            'Correct! With each step, binary search cuts the search space in half (`n / 2 / 2 / ...`), leading to a maximum of `log2(n)` comparisons.',
    },
];

let solvedChallenges = new Set();
let totalXp = 0;

function getCurrentLang() {
    return document.documentElement.getAttribute('lang') || 'de';
}

export function initChallengeLab() {
    const isLabPage = document.querySelector('.page-challenge-lab') || document.getElementById('lab-challenges-list');
    if (!isLabPage) return;

    renderChallenges();
    updateProgressHeader();

    window.addEventListener('fiae:lang-change', () => {
        renderChallenges();
        updateProgressHeader();
    });
    document.addEventListener('langchange', () => {
        renderChallenges();
        updateProgressHeader();
    });
}

function renderChallenges() {
    const container = document.getElementById('lab-challenges-list');
    if (!container) return;

    const lang = getCurrentLang();
    container.innerHTML = '';

    CHALLENGES.forEach((challenge) => {
        const isSolved = solvedChallenges.has(challenge.id);
        const title = lang === 'en' ? challenge.title_en : challenge.title_de;
        const category = lang === 'en' ? challenge.category_en : challenge.category_de;
        const desc = lang === 'en' ? challenge.desc_en : challenge.desc_de;

        const card = document.createElement('div');
        card.className = 'card';
        card.id = `card-${challenge.id}`;
        card.style.border = isSolved ? '1px solid #10b981' : '1px solid var(--border-color)';
        card.style.position = 'relative';

        card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="background: rgba(14, 165, 233, 0.15); color: var(--accent-color); font-size: 0.8rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px;">
            ${category}
          </span>
          <h3 style="margin: 0; font-size: 1.2rem;">${title}</h3>
        </div>
        <span style="font-weight: 700; color: #10b981; font-size: 0.9rem;">+${challenge.xp} XP</span>
      </div>

      <p style="color: var(--text-secondary); margin-bottom: 1rem; font-size: 0.95rem;">${desc}</p>

      <pre tabindex="0" role="region" aria-label="Code-Ausschnitt" data-en-aria-label="Code snippet" style="background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: 6px; padding: 1rem; overflow-x: auto; font-family: monospace; font-size: 0.88rem; margin-bottom: 1.25rem; line-height: 1.5;"><code style="color: #38bdf8;">${escapeHtml(challenge.code)}</code></pre>

      <!-- Options -->
      <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem;">
        ${challenge.options
            .map(
                (opt) => `
          <button class="btn btn-outline challenge-opt-btn" data-challenge-id="${challenge.id}" data-opt-id="${opt.id}" style="text-align: left; justify-content: flex-start; padding: 0.6rem 1rem; font-size: 0.9rem; border-color: var(--border-color);">
            <strong style="margin-right: 0.5rem;">${opt.id.toUpperCase()}:</strong> ${lang === 'en' ? opt.text_en : opt.text_de}
          </button>
        `
            )
            .join('')}
      </div>

      <!-- Feedback Area -->
      <div id="feedback-${challenge.id}" style="display: none; padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.9rem; margin-top: 0.5rem;"></div>
    `;

        container.appendChild(card);
    });

    // Attach button clicks
    container.querySelectorAll('.challenge-opt-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const chId = btn.dataset.challengeId;
            const optId = btn.dataset.optId;
            handleAnswer(chId, optId);
        });
    });
}

function handleAnswer(challengeId, optionId) {
    const challenge = CHALLENGES.find((c) => c.id === challengeId);
    if (!challenge) return;

    const selectedOpt = challenge.options.find((o) => o.id === optionId);
    const feedbackEl = document.getElementById(`feedback-${challengeId}`);
    const cardEl = document.getElementById(`card-${challengeId}`);
    if (!feedbackEl) return;

    const lang = getCurrentLang();
    feedbackEl.style.display = 'block';

    if (selectedOpt.correct) {
        const explanation = lang === 'en' ? challenge.explanation_en : challenge.explanation_de;
        const msg = lang === 'en' ? 'Solved excellently!' : 'Exzellent gelöst!';
        feedbackEl.style.background = 'rgba(16, 185, 129, 0.1)';
        feedbackEl.style.border = '1px solid #10b981';
        feedbackEl.style.color = '#10b981';
        feedbackEl.innerHTML = `✅ <strong>${msg}</strong> ${explanation}`;

        if (!solvedChallenges.has(challengeId)) {
            solvedChallenges.add(challengeId);
            totalXp += challenge.xp;
            updateProgressHeader();
        }
        if (cardEl) cardEl.style.border = '1px solid #10b981';
    } else {
        const msg =
            lang === 'en'
                ? 'Not quite right. Check the code and try again!'
                : 'Nicht ganz richtig. Überprüfe den Code und versuche es erneut!';
        feedbackEl.style.background = 'rgba(239, 68, 68, 0.1)';
        feedbackEl.style.border = '1px solid #ef4444';
        feedbackEl.style.color = '#ef4444';
        feedbackEl.innerHTML = `❌ <strong>${msg}</strong>`;
    }
}

function updateProgressHeader() {
    const scoreEl = document.getElementById('lab-score-display');
    const progressEl = document.getElementById('lab-progress-display');
    const rankEl = document.getElementById('lab-rank-display');
    const lang = getCurrentLang();

    if (scoreEl) scoreEl.textContent = `${totalXp} XP`;
    if (progressEl) progressEl.textContent = `${solvedChallenges.size} / ${CHALLENGES.length} Labs`;

    if (rankEl) {
        if (solvedChallenges.size === 0) rankEl.textContent = lang === 'en' ? 'Novice' : 'Novize';
        else if (solvedChallenges.size <= 2) rankEl.textContent = 'Junior Refactorer';
        else if (solvedChallenges.size < CHALLENGES.length) rankEl.textContent = 'Clean Code Craftsman';
        else rankEl.textContent = '🏆 Lead Architect';
    }
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
