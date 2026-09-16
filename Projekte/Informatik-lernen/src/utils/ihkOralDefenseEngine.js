/**
 * IHK Fachgespräch & Mündliche Prüfung Studio Engine
 * Simulation des 15-minütigen Fachgesprächs vor dem IHK-Prüfungsausschuss (AP2)
 */

export const EXAMINER_PERSONAS = [
  {
    id: 'tech_expert',
    role: 'Prüfer 1 (Fachdozent / Technischer Experte)',
    focus: 'Technische Tiefe, Code-Qualität, Architekturmuster & Edge Cases',
    style: 'Präzise, bohrt bei ungenauen Antworten gerne nach',
    voicePitch: 1.0,
    voiceRate: 1.0
  },
  {
    id: 'business_rep',
    role: 'Prüfer 2 (Arbeitgebervertreter / Wirtschaft)',
    focus: 'Wirtschaftlichkeit, Make-or-Buy, Amortisation, Projektrisiken & Datenschutz',
    style: 'Kaufmännisch orientiert, fragt nach Kosten, Nutzen und Alternativen',
    voicePitch: 0.9,
    voiceRate: 1.05
  },
  {
    id: 'committee_chair',
    role: 'Prüfer 3 (IHK Ausschuss-Vorsitzender)',
    focus: 'Methodenkompetenz, QM, Testverfahren & Reflexion des Projektverlaufs',
    style: 'Diplomatisch, achtet auf Zeitmanagement und Gesamteindruck',
    voicePitch: 1.1,
    voiceRate: 0.95
  }
];

export const ORAL_DEFENSE_QUESTIONS = [
  {
    id: 'q1',
    examinerId: 'tech_expert',
    category: 'Architektur & Design',
    questionText: 'Sie haben in Ihrem Projekt eine REST-Schnittstelle implementiert. Warum haben Sie sich gegen GraphQL oder gRPC entschieden, und wie stellen Sie die Abwärtskompatibilität bei Schemaänderungen sicher?',
    keywords: ['versionierung', 'uri', 'header', 'overfetching', 'http-statuscodes', 'aufwand', 'overhead'],
    idealAnswerOutline: 'REST bietet einfache Caching-Mechanismen (HTTP 304, ETags) und geringen Tooling-Overhead. Abwärtskompatibilität wird durch URI-Versionierung (z.B. /api/v1/) oder Custom Request Header (Accept-Version) sowie additive Feld-Updates gewährleistet.',
    maxScore: 10
  },
  {
    id: 'q2',
    examinerId: 'business_rep',
    category: 'Wirtschaftlichkeit & Kosten',
    questionText: 'In Ihrer Projektdokumentation nennen Sie Gesamtkosten von 4.500 €. Wann amortisieren sich diese Investitionskosten (Break-Even), und welche laufenden Betriebskosten (TCO) fallen in den nächsten 3 Jahren an?',
    keywords: ['amortisation', 'break-even', 'roi', 'tco', 'wartung', 'hosting', 'einsparung', 'lizenz'],
    idealAnswerOutline: 'Die Amortisationsdauer berechnet sich aus Anschaffungskosten geteilt durch jährliche Netto-Einsparung (z.B. 1,5 Jahre). In den TCO müssen Hosting/Cloud, Patch-Management, Support-Verträge und Schulungskosten einkalkuliert werden.',
    maxScore: 10
  },
  {
    id: 'q3',
    examinerId: 'committee_chair',
    category: 'Qualitätssicherung & Testen',
    questionText: 'Welche Teststrategie haben Sie verfolgt? Nennen Sie den Unterschied zwischen Unit-Tests, Integrationstests und Systemtests anhand Ihres Projekts.',
    keywords: ['testpyramide', 'unit-test', 'isolation', 'mocking', 'integrationstest', 'systemtest', 'coverage'],
    idealAnswerOutline: 'Unit-Tests testen einzelne isolierte Methoden (mit Mocks für DB/Services), Integrationstests das Zusammenspiel mehrerer Module, und Systemtests das Gesamtsystem gegen funktionale Anforderungen.',
    maxScore: 10
  },
  {
    id: 'q4',
    examinerId: 'tech_expert',
    category: 'Datenbanken & Datenintegrität',
    questionText: 'Wie verhindern Sie in Ihrer Datenbank Race Conditions oder Deadlocks bei gleichzeitigen Schreibzugriffen zweier Benutzer?',
    keywords: ['acid', 'transaktion', 'isolation level', 'locking', 'optimistic locking', 'pessimistic locking', 'mvcc'],
    idealAnswerOutline: 'Einsatz von ACID-Transaktionen mit adäquatem Isolation Level (z.B. Read Committed oder Repeatable Read) sowie Optimistic Locking mit Versionsspalte (@Version) oder SELECT FOR UPDATE bei kritischen Kontingenten.',
    maxScore: 10
  },
  {
    id: 'q5',
    examinerId: 'committee_chair',
    category: 'Projektreflexion',
    questionText: 'Wenn Sie das Projekt heute noch einmal von vorne beginnen würden: Was würden Sie anders machen?',
    keywords: ['reflexion', 'risikomanagement', 'pufferzeit', 'anforderungsanalyse', 'lessons learned', 'kommunikation'],
    idealAnswerOutline: 'Selbstkritische Reflexion: z.B. frühzeitigere Absprache von Schnittstellen-Spezifikationen mit Drittanbietern oder großzügigere Pufferzeiten für unvorhergesehene Bibliotheks-Inkompatibilitäten.',
    maxScore: 10
  }
];

/**
 * Bewertet eine Antwort des Prüflings auf Basis von Keyword-Matching & Struktur
 */
export function evaluateOralAnswer(question, userResponse = '') {
  if (!question || typeof userResponse !== 'string') {
    return {
      score: 0,
      percentage: 0,
      matchedKeywords: [],
      missingKeywords: [],
      feedback: 'Keine Antwort übermittelt.'
    };
  }

  const normalized = userResponse.toLowerCase();
  const matched = [];
  const missing = [];

  (question.keywords || []).forEach(kw => {
    if (normalized.includes(kw.toLowerCase())) {
      matched.push(kw);
    } else {
      missing.push(kw);
    }
  });

  const matchRatio = question.keywords && question.keywords.length > 0 
    ? matched.length / question.keywords.length 
    : 0;

  // Längen-Bonus (mindestens 20 Wörter für eine fundierte IHK-Antwort)
  const wordCount = userResponse.trim().split(/\s+/).filter(Boolean).length;
  let score = Math.round(matchRatio * (question.maxScore || 10));

  if (wordCount < 10) {
    score = Math.min(score, 3); // Zu knappe Antwort
  } else if (wordCount >= 25 && score < 10 && matched.length >= 2) {
    score = Math.min((question.maxScore || 10), score + 1); // Ausführlicher Antwort-Bonus
  }

  let feedback = '';
  if (score >= 8) {
    feedback = 'Hervorragende Antwort! Fachlich präzise formuliert mit allen relevanten Kernbegriffen.';
  } else if (score >= 5) {
    feedback = 'Gute Antwort. Die Grundlagen sind vorhanden, es fehlten jedoch Details zu: ' + missing.slice(0, 3).join(', ') + '.';
  } else {
    feedback = 'Ausbaufähig. Die Antwort war zu oberflächlich. Der Prüfungsausschuss erwartet konkrete Fachtermini wie: ' + missing.slice(0, 3).join(', ') + '.';
  }

  return {
    score,
    maxScore: question.maxScore || 10,
    percentage: Math.round((score / (question.maxScore || 10)) * 100),
    matchedKeywords: matched,
    missingKeywords: missing,
    wordCount,
    feedback
  };
}

/**
 * Berechnet das Gesamtergebnis des Fachgesprächs (Note & Bestehensstatus)
 */
export function calculateOralDefenseResult(answers = []) {
  if (!Array.isArray(answers) || answers.length === 0) {
    return {
      totalScore: 0,
      maxPossibleScore: 0,
      percentage: 0,
      grade: 6,
      passed: false,
      ihkPoints: 0,
      summary: 'Das Fachgespräch wurde noch nicht begonnen.'
    };
  }

  const totalScore = answers.reduce((sum, a) => sum + (a.score || 0), 0);
  const maxPossibleScore = answers.reduce((sum, a) => sum + (a.maxScore || 10), 0);
  const percentage = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;

  let grade = 6;
  let summary = '';

  if (percentage >= 92) {
    grade = 1;
    summary = 'Sehr Gut (Note 1) – Souveräner Auftritt, hohe Methodenkompetenz und exzellente Fachargumentation!';
  } else if (percentage >= 81) {
    grade = 2;
    summary = 'Gut (Note 2) – Solide Fachkenntnisse und überzeugende Antworten auf Rückfragen.';
  } else if (percentage >= 67) {
    grade = 3;
    summary = 'Befriedigend (Note 3) – Grundsätzliches Verständnis vorhanden, vereinzelt leichte Unsicherheiten.';
  } else if (percentage >= 50) {
    grade = 4;
    summary = 'Ausreichend (Note 4) – Bestanden, jedoch knappe Begründungen bei vertiefenden Fragen.';
  } else if (percentage >= 30) {
    grade = 5;
    summary = 'Mangelhaft (Note 5) – Nicht bestanden. Erhebliche Lücken in Grundlagen und Projektreflexion.';
  } else {
    grade = 6;
    summary = 'Ungenügend (Note 6) – Nicht bestanden. Fachliche Anforderungen wurden verfehlt.';
  }

  return {
    totalScore,
    maxPossibleScore,
    percentage,
    grade,
    passed: percentage >= 50,
    ihkPoints: percentage,
    summary
  };
}
