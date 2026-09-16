/**
 * P2P Quiz Engine & Match Simulation
 * Manages multiplayer quiz sessions, scoring, timers and WebRTC signaling payload formats.
 */

export const P2P_QUIZ_QUESTIONS = [
  {
    id: 'p2p_q1',
    question: 'Welches Protokoll arbeitet auf Schicht 4 des OSI-Modells und garantiert eine verlässliche Übertragung per Handshake?',
    options: ['UDP', 'TCP', 'IP', 'ICMP'],
    correct: 1,
    category: 'Netzwerktechnik',
    timeLimit: 15
  },
  {
    id: 'p2p_q2',
    question: 'Was ist die primäre Aufgabe des Befehls "chmod 755 datei.sh" unter Linux?',
    options: [
      'Besitzer: rwx, Gruppe: r-x, Andere: r-x',
      'Besitzer: rw-, Gruppe: r--, Andere: r--',
      'Besitzer: rwx, Gruppe: ---, Andere: ---',
      'Datei löschen und in den Papierkorb verschieben'
    ],
    correct: 0,
    category: 'Linux & OS',
    timeLimit: 15
  },
  {
    id: 'p2p_q3',
    question: 'Welche Normalform (NF) verlangt, dass alle Spalten atomar sind und keine Mehrfachwerte enthalten?',
    options: ['1. Normalform', '2. Normalform', '3. Normalform', 'Boyce-Codd-Normalform'],
    correct: 0,
    category: 'Datenbanken',
    timeLimit: 15
  },
  {
    id: 'p2p_q4',
    question: 'Was bedeutet das "A" im ACID-Prinzip von relationalen Datenbank-Transaktionen?',
    options: ['Availability (Verfügbarkeit)', 'Atomicity (Atomarität / Unteilbarkeit)', 'Asynchrony (Asynchronität)', 'Authentication (Authentifizierung)'],
    correct: 1,
    category: 'Datenbanken',
    timeLimit: 15
  },
  {
    id: 'p2p_q5',
    question: 'Welche Zeitkomplexität (Worst-Case) hat die binäre Suche in einem sortierten Array mit n Elementen?',
    options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
    correct: 2,
    category: 'Algorithmen',
    timeLimit: 15
  },
  {
    id: 'p2p_q6',
    question: 'Welches HTTP-Statuscode-Intervall signalisiert erfolgreiche Anfragen?',
    options: ['1xx', '2xx', '3xx', '4xx'],
    correct: 1,
    category: 'Webentwicklung',
    timeLimit: 15
  },
  {
    id: 'p2p_q7',
    question: 'Welcher Port wird standardmäßig für unverschlüsseltes DNS über UDP verwendet?',
    options: ['Port 22', 'Port 53', 'Port 80', 'Port 443'],
    correct: 1,
    category: 'Netzwerktechnik',
    timeLimit: 15
  },
  {
    id: 'p2p_q8',
    question: 'Was schützt vor Cross-Site Request Forgery (CSRF)?',
    options: ['SameSite=Strict Cookies & Anti-CSRF Tokens', 'Deaktivierung von HTTPS', 'Verwendung von GET für alle Transaktionen', 'Base64 Kodierung der Passwörter'],
    correct: 0,
    category: 'Cybersecurity',
    timeLimit: 15
  }
];

export function calculateRoundScore(isCorrect, timeLeftSeconds, maxTimeSeconds = 15) {
  if (!isCorrect) return 0;
  const baseScore = 100;
  const speedBonus = Math.round((Math.max(0, timeLeftSeconds) / maxTimeSeconds) * 50);
  return baseScore + speedBonus;
}

export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function createBotResponse(questionIndex, botDifficulty = 'medium') {
  const q = P2P_QUIZ_QUESTIONS[questionIndex];
  if (!q) return null;

  // Bot-Trefferwahrscheinlichkeit nach Schwierigkeit
  let accuracy = 0.75; // medium
  let responseDelayRange = [2, 7]; // Sekunden

  if (botDifficulty === 'easy') {
    accuracy = 0.5;
    responseDelayRange = [4, 10];
  } else if (botDifficulty === 'hard') {
    accuracy = 0.95;
    responseDelayRange = [1, 4];
  }

  const isCorrect = Math.random() < accuracy;
  let chosenOption = q.correct;

  if (!isCorrect) {
    const wrongOptions = [0, 1, 2, 3].filter(idx => idx !== q.correct);
    chosenOption = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
  }

  const answerTime = Number((responseDelayRange[0] + Math.random() * (responseDelayRange[1] - responseDelayRange[0])).toFixed(1));
  const remainingTime = Math.max(0, q.timeLimit - answerTime);
  const score = calculateRoundScore(isCorrect, remainingTime, q.timeLimit);

  return {
    chosenOption,
    isCorrect,
    answerTime,
    remainingTime,
    score
  };
}
