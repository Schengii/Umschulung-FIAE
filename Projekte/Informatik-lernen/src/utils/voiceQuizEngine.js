/**
 * Voice Quiz Engine
 * Evaluates spoken answers against keywords and manages audio quiz flow.
 */

export const VOICE_QUIZ_QUESTIONS = [
  {
    id: 'vq_1',
    topic: 'Datenschutz vs. Datensicherheit (Podcast Ep. 12)',
    question: 'Was ist der wesentliche Unterschied zwischen Datenschutz und Datensicherheit?',
    expectedKeywords: ['personenbezogen', 'schutz der person', 'integrität', 'vertraulichkeit', 'technisch', 'organisatorisch', 'dsgvo'],
    idealAnswer: 'Datenschutz schützt Personen vor Missbrauch ihrer personenbezogenen Daten (DSGVO). Datensicherheit schützt Daten jeglicher Art technisch vor Verlust, Diebstahl und Manipulation (Vertraulichkeit, Integrität, Verfügbarkeit).',
    minKeywordsToPass: 2
  },
  {
    id: 'vq_2',
    topic: 'UTF-8 & Zeichenkodierung (Podcast Ep. 14)',
    question: 'Wie viele Bytes benötigt ein Zeichen in der UTF-8 Kodierung und warum ist UTF-8 abwärtskompatibel zu ASCII?',
    expectedKeywords: ['1 bis 4', '1-4', 'variabel', 'ascii', 'erstes byte', '7 bit', '128'],
    idealAnswer: 'UTF-8 verwendet eine variable Bytelänge von 1 bis 4 Bytes. Die ersten 128 Zeichen entsprechen exakt der 7-Bit ASCII-Tabelle.',
    minKeywordsToPass: 2
  },
  {
    id: 'vq_3',
    topic: 'IHK Prüfungstipps (Stefan Macke)',
    question: 'Was ist bei der Zeitplanung des IHK-Abschlussprojekts besonders wichtig zu beachten?',
    expectedKeywords: ['pufferzeit', 'wirtschaftlichkeit', 'ist-analyse', 'soll-konzept', 'qualitätssicherung', 'doku', 'zeitplan'],
    idealAnswer: 'Eine realistische Phasenaufteilung (Analyse, Entwurf, Implementierung, Qualitätssicherung, Doku) mit angemessenen Pufferzeiten und Amortisationsrechnung.',
    minKeywordsToPass: 2
  }
];

export function evaluateSpokenAnswer(userText, questionIndex) {
  const q = VOICE_QUIZ_QUESTIONS[questionIndex];
  if (!q || !userText) {
    return {
      passed: false,
      score: 0,
      matchedKeywords: [],
      missingKeywords: q ? q.expectedKeywords : []
    };
  }

  const cleanText = userText.toLowerCase();
  const matchedKeywords = q.expectedKeywords.filter(kw => cleanText.includes(kw.toLowerCase()));
  const missingKeywords = q.expectedKeywords.filter(kw => !cleanText.includes(kw.toLowerCase()));

  const passed = matchedKeywords.length >= q.minKeywordsToPass;
  const score = Math.round((matchedKeywords.length / q.expectedKeywords.length) * 100);

  return {
    passed,
    score,
    matchedKeywords,
    missingKeywords,
    idealAnswer: q.idealAnswer
  };
}
