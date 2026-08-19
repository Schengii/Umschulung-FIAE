/**
 * @file ihk-cockpit.js
 * @description Interaktive Nutzwertanalyse, 80h Phasenplan und Fachgesprächs-Simulator
 */

export function initIhkCockpit() {
  const isCockpitPage = document.querySelector('.page-ihk-cockpit') || document.getElementById('panel-nwa');
  if (!isCockpitPage) return;

  initTabs();
  initNwa();
  initPhasenplan();
  initFachgespraech();
}

function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.cockpit-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('active', 'btn-primary');
        t.classList.add('btn-secondary');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(p => (p.style.display = 'none'));

      tab.classList.add('active', 'btn-primary');
      tab.classList.remove('btn-secondary');
      tab.setAttribute('aria-selected', 'true');

      const targetId = tab.dataset.target;
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.style.display = 'block';
      }
    });
  });
}

/* -------------------------------------------------------------
 * 1. Nutzwertanalyse (NWA)
 * ------------------------------------------------------------- */
const NWA_PRESETS = {
  framework: {
    titleA: 'Option A (Lit 3.x / Web Components)',
    titleB: 'Option B (React 19 / Vite)',
    criteria: [
      { name: 'Native Standardkonformität & Bundle-Größe', weight: 25, scoreA: 9, scoreB: 6 },
      { name: 'PWA-Integration & Offline-Performance', weight: 25, scoreA: 9, scoreB: 8 },
      { name: 'Entwicklungsgeschwindigkeit & Ökosystem', weight: 20, scoreA: 7, scoreB: 9 },
      { name: 'TypeScript-Typensicherheit & Wartbarkeit', weight: 15, scoreA: 9, scoreB: 9 },
      { name: 'Lernkurve & Einarbeitungszeit', weight: 15, scoreA: 8, scoreB: 8 }
    ]
  },
  database: {
    titleA: 'Option A (PostgreSQL / Relational)',
    titleB: 'Option B (MongoDB / Document-Store)',
    criteria: [
      { name: 'ACID-Transaktionssicherheit', weight: 30, scoreA: 10, scoreB: 6 },
      { name: 'Tabellen-Relationen & Normalisierung (3NF)', weight: 30, scoreA: 10, scoreB: 5 },
      { name: 'Schema-Flexibilität für JSON-Daten', weight: 20, scoreA: 8, scoreB: 10 },
      { name: 'Tooling, Backups & IHK-Relevanz', weight: 20, scoreA: 9, scoreB: 7 }
    ]
  }
};

let currentCriteria = JSON.parse(JSON.stringify(NWA_PRESETS.framework.criteria));

function initNwa() {
  const nwaBody = document.getElementById('nwa-body');
  if (!nwaBody) return;

  const btnFramework = document.getElementById('btn-preset-framework');
  const btnDatabase = document.getElementById('btn-preset-database');
  const btnReset = document.getElementById('btn-reset-nwa');

  if (btnFramework) {
    btnFramework.addEventListener('click', () => applyPreset('framework'));
  }
  if (btnDatabase) {
    btnDatabase.addEventListener('click', () => applyPreset('database'));
  }
  if (btnReset) {
    btnReset.addEventListener('click', () => applyPreset('framework'));
  }

  renderNwaTable();
}

function applyPreset(presetKey) {
  const preset = NWA_PRESETS[presetKey];
  if (!preset) return;

  const thA = document.getElementById('th-option-a');
  const thB = document.getElementById('th-option-b');
  if (thA) thA.textContent = preset.titleA;
  if (thB) thB.textContent = preset.titleB;

  currentCriteria = JSON.parse(JSON.stringify(preset.criteria));
  renderNwaTable();
}

function renderNwaTable() {
  const nwaBody = document.getElementById('nwa-body');
  if (!nwaBody) return;

  nwaBody.innerHTML = '';
  let sumWeight = 0;
  let totalScoreA = 0;
  let totalScoreB = 0;

  currentCriteria.forEach((item, index) => {
    sumWeight += item.weight;
    const nutzwertA = (item.weight * item.scoreA) / 10;
    const nutzwertB = (item.weight * item.scoreB) / 10;
    totalScoreA += nutzwertA;
    totalScoreB += nutzwertB;

    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid var(--border-color)';
    tr.innerHTML = `
      <td style="padding: 0.75rem; font-weight: 500;">${item.name}</td>
      <td style="padding: 0.75rem; text-align: center;">
        <input type="number" min="0" max="100" class="nwa-weight-input" data-index="${index}" value="${item.weight}" style="width: 60px; text-align: center; background: rgba(0,0,0,0.2); border: 1px solid var(--border-color); border-radius: 4px; color: inherit; padding: 0.2rem;"> %
      </td>
      <td style="padding: 0.75rem; text-align: center;">
        <input type="range" min="1" max="10" value="${item.scoreA}" class="nwa-range-a" data-index="${index}" style="vertical-align: middle; width: 80px;">
        <span style="font-weight: bold; margin-left: 0.5rem;">${item.scoreA}</span>
        <span style="font-size: 0.8rem; color: var(--text-secondary);">(${nutzwertA.toFixed(1)} Pkt)</span>
      </td>
      <td style="padding: 0.75rem; text-align: center;">
        <input type="range" min="1" max="10" value="${item.scoreB}" class="nwa-range-b" data-index="${index}" style="vertical-align: middle; width: 80px;">
        <span style="font-weight: bold; margin-left: 0.5rem;">${item.scoreB}</span>
        <span style="font-size: 0.8rem; color: var(--text-secondary);">(${nutzwertB.toFixed(1)} Pkt)</span>
      </td>
    `;
    nwaBody.appendChild(tr);
  });

  const sumWeightEl = document.getElementById('nwa-sum-weight');
  const scoreAEl = document.getElementById('nwa-score-a');
  const scoreBEl = document.getElementById('nwa-score-b');
  const winnerEl = document.getElementById('nwa-winner-text');

  if (sumWeightEl) sumWeightEl.textContent = `${sumWeight}%`;
  if (scoreAEl) scoreAEl.textContent = `${totalScoreA.toFixed(1)} Pkt`;
  if (scoreBEl) scoreBEl.textContent = `${totalScoreB.toFixed(1)} Pkt`;

  if (winnerEl) {
    const diff = Math.abs(totalScoreA - totalScoreB).toFixed(1);
    const thA = document.getElementById('th-option-a')?.textContent || 'Option A';
    const thB = document.getElementById('th-option-b')?.textContent || 'Option B';
    if (totalScoreA > totalScoreB) {
      winnerEl.innerHTML = `🏆 <strong>Eindeutiger Sieger: ${thA}</strong> mit ${totalScoreA.toFixed(1)} Punkten (+${diff} Pkt Vorsprung). Erfüllt die IHK-Projektanforderungen optimal.`;
    } else if (totalScoreB > totalScoreA) {
      winnerEl.innerHTML = `🏆 <strong>Eindeutiger Sieger: ${thB}</strong> mit ${totalScoreB.toFixed(1)} Punkten (+${diff} Pkt Vorsprung).`;
    } else {
      winnerEl.innerHTML = `⚖️ <strong>Gleichstand</strong> (${totalScoreA.toFixed(1)} Pkt). Bitte Kriterien-Gewichtung anpassen.`;
    }
  }

  // Bind Input Listeners
  nwaBody.querySelectorAll('.nwa-weight-input').forEach(input => {
    input.addEventListener('change', e => {
      const idx = parseInt(e.target.dataset.index, 10);
      currentCriteria[idx].weight = parseFloat(e.target.value) || 0;
      renderNwaTable();
    });
  });

  nwaBody.querySelectorAll('.nwa-range-a').forEach(input => {
    input.addEventListener('input', e => {
      const idx = parseInt(e.target.dataset.index, 10);
      currentCriteria[idx].scoreA = parseInt(e.target.value, 10);
      renderNwaTable();
    });
  });

  nwaBody.querySelectorAll('.nwa-range-b').forEach(input => {
    input.addEventListener('input', e => {
      const idx = parseInt(e.target.dataset.index, 10);
      currentCriteria[idx].scoreB = parseInt(e.target.value, 10);
      renderNwaTable();
    });
  });
}

/* -------------------------------------------------------------
 * 2. 80h Phasenplan
 * ------------------------------------------------------------- */
const IHK_PHASEN = [
  {
    nr: 1,
    name: '1. Analysephase',
    color: '#0ea5e9',
    soll: 10,
    ist: 9.5,
    tasks: 'Ist-Analyse, Stakeholder-Interviews, Wirtschaftlichkeitsanalyse (Amortisation & Make-or-Buy), Lastenheft-Erstellung.'
  },
  {
    nr: 2,
    name: '2. Entwurfsphase',
    color: '#6366f1',
    soll: 16,
    ist: 15.5,
    tasks: 'System-Architektur (C4 Component Model), UI/UX Wireframing & Design-System, ER-Modellierung (3NF), API-Schnittstellendefinition.'
  },
  {
    nr: 3,
    name: '3. Implementierungsphase',
    color: '#10b981',
    soll: 32,
    ist: 33.0,
    tasks: 'Frontend PWA Entwicklung (Lit / TS), Offline Storage (IndexedDB), Service Worker Caching, Gemini KI-API Integration.'
  },
  {
    nr: 4,
    name: '4. Qualitätssicherung & Testen',
    color: '#f59e0b',
    soll: 10,
    ist: 10.0,
    tasks: 'Unit-Tests, E2E-Testing (Playwright Suite), Lighthouse Performance & WCAG 2.1 AAA Accessibility-Audit.'
  },
  {
    nr: 5,
    name: '5. Dokumentation & Einführung',
    color: '#ec4899',
    soll: 12,
    ist: 12.0,
    tasks: 'Projektdokumentation nach IHK-Standard, Entwickler-Handbuch, Benutzerhandbuch, Fazit & Soll/Ist-Vergleich.'
  }
];

function initPhasenplan() {
  const barsContainer = document.getElementById('phasen-bars-container');
  const detailBody = document.getElementById('phasen-detail-body');
  if (!barsContainer || !detailBody) return;

  barsContainer.innerHTML = '';
  detailBody.innerHTML = '';

  IHK_PHASEN.forEach(phase => {
    const percentage = ((phase.soll / 80) * 100).toFixed(1);

    // Bar item
    const barEl = document.createElement('div');
    barEl.innerHTML = `
      <div style="display: flex; justify-content: space-between; font-size: 0.95rem; margin-bottom: 0.35rem;">
        <span style="font-weight: 600;">${phase.name}</span>
        <span style="font-weight: 700; color: ${phase.color};">${phase.soll}h (${percentage}%)</span>
      </div>
      <div style="background: rgba(255,255,255,0.05); height: 12px; border-radius: 6px; overflow: hidden; position: relative;">
        <div style="background: ${phase.color}; width: ${percentage}%; height: 100%; border-radius: 6px; transition: width 0.6s ease;"></div>
      </div>
    `;
    barsContainer.appendChild(barEl);

    // Detail row
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid var(--border-color)';
    row.innerHTML = `
      <td style="padding: 0.75rem; font-weight: 600; color: ${phase.color};">${phase.name}</td>
      <td style="padding: 0.75rem; font-size: 0.9rem; color: var(--text-secondary);">${phase.tasks}</td>
      <td style="padding: 0.75rem; text-align: center; font-weight: 700;">${phase.soll}h</td>
      <td style="padding: 0.75rem; text-align: center; color: var(--text-secondary);">${phase.ist}h</td>
      <td style="padding: 0.75rem; text-align: center;"><span style="background: rgba(16, 185, 129, 0.15); color: #10b981; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">Abgeschlossen</span></td>
    `;
    detailBody.appendChild(row);
  });
}

/* -------------------------------------------------------------
 * 3. Fachgesprächs-Simulator
 * ------------------------------------------------------------- */
const FACHGESPRAECH_QUESTIONS = [
  {
    category: 'Software-Architektur & Patterns',
    question: 'Warum haben Sie sich in Ihrem Abschlussprojekt für eine Entkopplung über Web Components / Module entschieden und welches Architektur-Muster (z.B. MVC, MVVM, Clean Architecture) liegt zugrunde?',
    answer: 'Web Components bieten native Kapselung (Shadow DOM & Custom Elements) ohne Framework-Lock-in. Durch die Trennung von Präsentationsschicht (Views/Components), State-Management (Services/Stores) und Datenschicht (IndexedDB / REST-API) wird das Prinzip der "Separation of Concerns" (SoC) und Testbarkeit nach Clean Architecture gewährleistet.'
  },
  {
    category: 'Datenbanken & Datenmodellierung',
    question: 'Erklären Sie die 1., 2. und 3. Normalform anhand Ihrer Datenbank-Modellierung. Warum ist Denormalisierung im Frontend-Cache dennoch manchmal sinnvoll?',
    answer: '1NF: Atomare Werte, keine Wiederholungsgruppen. 2NF: 1NF + jedes Nicht-Schlüsselattribut ist voll funktional vom Primärschlüssel abhängig. 3NF: 2NF + keine transitiven Abhängigkeiten. Denormalisierung im IndexedDB/Client-Cache reduziert teure JOIN-Operationen und ermöglicht blitzschnelle Lesezugriffe im Offline-Modus.'
  },
  {
    category: 'Wirtschaftlichkeit & Make-or-Buy',
    question: 'Wie haben Sie die wirtschaftliche Sinnhaftigkeit Ihres Projekts nachgewiesen? Erläutern Sie Ihre Amortisationsrechnung.',
    answer: 'Über eine Kosten-Nutzen-Analyse und Amortisationsrechnung: Die Einmalkosten der Entwicklung (80h × Stundensatz = z. B. 4.800 €) stehen einer monatlichen Zeiteinsparung von 15 Stunden pro Mitarbeiter gegenüber. Bei 50 €/h spart das Unternehmen 750 €/Monat, womit sich das Projekt nach ca. 6,4 Monaten vollständig amortisiert (ROI).'
  },
  {
    category: 'Datenschutz, DSGVO & IT-Sicherheit',
    question: 'Welche technischen und organisatorischen Maßnahmen (TOMs) haben Sie zum Schutz personenbezogener Daten und gegen Angriffe wie XSS/SQL-Injection implementiert?',
    answer: 'DSGVO: Privacy by Design, Datensparsamkeit, lokale Speicherung sensibler Daten im IndexedDB/LocalStorage, keine Drittanbieter-Tracker. Sicherheit: Strikte Content Security Policy (CSP), Context-Aware Escaping gegen XSS, Prepared Statements/ORM gegen SQL-Injection, HTTPS-only und SRI-Hashes.'
  },
  {
    category: 'Qualitätssicherung & Testing',
    question: 'Welche Teststrategie haben Sie gewählt und warum reichen reine Unit-Tests bei einer modernen Webanwendung nicht aus?',
    answer: 'Pyramiden-Teststrategie: Schnelle Unit-Tests für Geschäftslogik, Integrationstests für Service-Worker & Caching, und automatisierte Playwright E2E-Tests für reale Nutzerinteraktionen (Navigation, Offline-Verhalten, Rendering). Unit-Tests prüfen isolierte Bausteine, während E2E-Tests das Zusammenspiel der gesamten PWA sicherstellen.'
  }
];

let currentQuestionIndex = -1;
let answeredCount = 0;
let score = 0;
let timerInterval = null;
let timeLeft = 90;

function initFachgespraech() {
  const btnStart = document.getElementById('btn-fg-start');
  const btnReveal = document.getElementById('btn-fg-reveal');
  const btnGood = document.getElementById('btn-fg-grade-good');
  const btnBad = document.getElementById('btn-fg-grade-bad');

  if (!btnStart) return;

  btnStart.addEventListener('click', loadNextQuestion);
  btnReveal.addEventListener('click', revealAnswer);
  btnGood.addEventListener('click', () => gradeAnswer(true));
  btnBad.addEventListener('click', () => gradeAnswer(false));
}

function loadNextQuestion() {
  currentQuestionIndex = (currentQuestionIndex + 1) % FACHGESPRAECH_QUESTIONS.length;
  const q = FACHGESPRAECH_QUESTIONS[currentQuestionIndex];

  const catBadge = document.getElementById('fg-category-badge');
  const questionEl = document.getElementById('fg-question-text');
  const answerBox = document.getElementById('fg-answer-box');
  const answerEl = document.getElementById('fg-answer-text');

  const btnStart = document.getElementById('btn-fg-start');
  const btnReveal = document.getElementById('btn-fg-reveal');
  const btnGood = document.getElementById('btn-fg-grade-good');
  const btnBad = document.getElementById('btn-fg-grade-bad');

  if (catBadge) catBadge.textContent = q.category;
  if (questionEl) questionEl.textContent = `Frage ${currentQuestionIndex + 1}/${FACHGESPRAECH_QUESTIONS.length}: ${q.question}`;
  if (answerEl) answerEl.textContent = q.answer;
  if (answerBox) answerBox.style.display = 'none';

  btnStart.textContent = '⏭️ Nächste Frage';
  btnReveal.style.display = 'inline-block';
  btnGood.style.display = 'none';
  btnBad.style.display = 'none';

  startTimer();
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 90;
  updateTimerDisplay();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      const timerEl = document.getElementById('fg-timer');
      if (timerEl) timerEl.textContent = '⏰ Zeit abgelaufen!';
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerEl = document.getElementById('fg-timer');
  if (!timerEl) return;
  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  timerEl.textContent = `⏱️ ${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function revealAnswer() {
  clearInterval(timerInterval);
  const answerBox = document.getElementById('fg-answer-box');
  const btnReveal = document.getElementById('btn-fg-reveal');
  const btnGood = document.getElementById('btn-fg-grade-good');
  const btnBad = document.getElementById('btn-fg-grade-bad');

  if (answerBox) answerBox.style.display = 'block';
  if (btnReveal) btnReveal.style.display = 'none';
  if (btnGood) btnGood.style.display = 'inline-block';
  if (btnBad) btnBad.style.display = 'inline-block';
}

function gradeAnswer(isGood) {
  answeredCount++;
  if (isGood) score += 10;

  const scoreDisplay = document.getElementById('fg-score-display');
  if (scoreDisplay) {
    scoreDisplay.textContent = `${answeredCount} Fragen geübt (${score} Punkte)`;
  }

  loadNextQuestion();
}
