// @ts-check
/**
 * UML Studio Engine (Sequenz- & Aktivitätsdiagramme nach OMG UML 2.5)
 * IHK Standard für Anwendungsentwicklung & Systemintegration (AP1 & AP2)
 */

export const UML_DIAGRAM_TYPES = {
  SEQUENCE: 'sequence',
  ACTIVITY: 'activity'
};

export const DEFAULT_SEQUENCE_PARTICIPANTS = [
  { id: 'user', name: 'Benutzer / Client', type: 'actor' },
  { id: 'auth_service', name: 'Auth Gateway (OAuth)', type: 'service' },
  { id: 'api_backend', name: 'Core Backend API', type: 'service' },
  { id: 'database', name: 'PostgreSQL DB', type: 'database' }
];

export const DEFAULT_SEQUENCE_MESSAGES = [
  { id: 'm1', from: 'user', to: 'auth_service', label: 'POST /auth/login (credentials)', type: 'sync' },
  { id: 'm2', from: 'auth_service', to: 'database', label: 'SELECT user_hash WHERE email=?', type: 'sync' },
  { id: 'm3', from: 'database', to: 'auth_service', label: 'User Record + Salt', type: 'reply' },
  { id: 'm4', from: 'auth_service', to: 'user', label: '200 OK + JWT Bearer Token', type: 'reply' },
  { id: 'm5', from: 'user', to: 'api_backend', label: 'GET /api/v1/orders (Authorization: Bearer)', type: 'sync' },
  { id: 'm6', from: 'api_backend', to: 'database', label: 'Query Orders (CustomerID)', type: 'sync' },
  { id: 'm7', from: 'database', to: 'api_backend', label: 'Order List Data', type: 'reply' },
  { id: 'm8', from: 'api_backend', to: 'user', label: '200 JSON Response', type: 'reply' }
];

export const DEFAULT_ACTIVITY_STEPS = [
  { id: 'start', type: 'initial', label: 'Start: Kunde startet Checkout' },
  { id: 'step_cart', type: 'action', label: 'Warenkorb-Validierung & Bestandsprüfung' },
  { id: 'dec_stock', type: 'decision', label: 'Artikel auf Lager?', yesTarget: 'step_pay', noTarget: 'step_abort' },
  { id: 'step_abort', type: 'action', label: 'Fehlermeldung anzeigen: Artikel ausverkauft' },
  { id: 'end_abort', type: 'final', label: 'Ende: Abbruch' },
  { id: 'step_pay', type: 'action', label: 'Zahlungsanbieter kontaktieren (PSP)' },
  { id: 'dec_pay', type: 'decision', label: 'Zahlung autorisiert?', yesTarget: 'step_order', noTarget: 'step_retry' },
  { id: 'step_retry', type: 'action', label: 'Alternative Zahlungsart wählen' },
  { id: 'step_order', type: 'action', label: 'Bestellung in DB speichern & E-Mail Bestätigung senden' },
  { id: 'end_success', type: 'final', label: 'Ende: Bestellung abgeschlossen' }
];

/**
 * Generiert Mermaid.js Sequenzdiagramm Code
 * @param {{ participants?: any[], messages?: any[], title?: string }} param0
 */
export function generateMermaidSequence({ participants = [], messages = [], title = 'IHK Sequenzdiagramm' }) {
  const lines = ['sequenceDiagram', `  title: ${title}`, `  autonumber`];

  participants.forEach(p => {
    if (p.type === 'actor') {
      lines.push(`  actor ${p.id} as ${p.name}`);
    } else if (p.type === 'database') {
      lines.push(`  database ${p.id} as ${p.name}`);
    } else {
      lines.push(`  participant ${p.id} as ${p.name}`);
    }
  });

  messages.forEach(m => {
    const arrow = m.type === 'reply' ? '-->>' : m.type === 'async' ? '-)' : '->>';
    lines.push(`  ${m.from}${arrow}${m.to}: ${m.label}`);
  });

  return lines.join('\n');
}

/**
 * Validiert Sequenzdiagramm auf Vollständigkeit & IHK-Konformität
 * @param {{ participants?: any[], messages?: any[] }} param0
 */
export function validateSequenceDiagram({ participants = [], messages = [] }) {
  const issues = [];
  const partIds = new Set(participants.map(p => p.id));

  if (participants.length < 2) {
    issues.push({ type: 'warning', message: 'Mindestens zwei Teilnehmer erforderlich.' });
  }

  messages.forEach((m, idx) => {
    if (!partIds.has(m.from)) {
      issues.push({ type: 'error', message: `Nachricht #${idx + 1}: Sender "${m.from}" existiert nicht.` });
    }
    if (!partIds.has(m.to)) {
      issues.push({ type: 'error', message: `Nachricht #${idx + 1}: Empfänger "${m.to}" existiert nicht.` });
    }
  });

  // Prüfe auf synchrone Aufrufe ohne Reply
  const pendingSyncCalls = new Map();
  messages.forEach(m => {
    if (m.type === 'sync') {
      const key = `${m.from}->${m.to}`;
      pendingSyncCalls.set(key, (pendingSyncCalls.get(key) || 0) + 1);
    } else if (m.type === 'reply') {
      const key = `${m.to}->${m.from}`;
      if (pendingSyncCalls.has(key) && pendingSyncCalls.get(key) > 0) {
        pendingSyncCalls.set(key, pendingSyncCalls.get(key) - 1);
      }
    }
  });

  let unrepliedSyncCount = 0;
  pendingSyncCalls.forEach(count => {
    unrepliedSyncCount += count;
  });

  if (unrepliedSyncCount > 0) {
    issues.push({
      type: 'info',
      message: `${unrepliedSyncCount} synchrone Aufrufe haben keine explizite Rückgabe-Nachricht (-->>). In der IHK-Doku empfiehlt sich eine klare Antwort.`
    });
  }

  return {
    isValid: issues.filter(i => i.type === 'error').length === 0,
    issues,
    messageCount: messages.length,
    participantCount: participants.length
  };
}

/**
 * Generiert Mermaid.js Flussdiagramm für Aktivitätsdiagramme
 * @param {{ steps?: any[] }} param0
 */
export function generateMermaidActivity({ steps = [] }) {
  const lines = ['flowchart TD'];

  steps.forEach(s => {
    if (s.type === 'initial') {
      lines.push(`  ${s.id}([((●)) ${s.label}])`);
    } else if (s.type === 'final') {
      lines.push(`  ${s.id}([((◎)) ${s.label}])`);
    } else if (s.type === 'decision') {
      lines.push(`  ${s.id}{${s.label}}`);
      if (s.yesTarget) lines.push(`  ${s.id} -->|Ja| ${s.yesTarget}`);
      if (s.noTarget) lines.push(`  ${s.id} -->|Nein| ${s.noTarget}`);
    } else {
      lines.push(`  ${s.id}["${s.label}"]`);
    }
  });

  return lines.join('\n');
}

/**
 * IHK Klassendiagramm-Prüfungsfragen & Zuordnungs-Drill
 */
export const IHK_CLASS_DRILL_QUESTIONS = [
  {
    id: 'vis_private',
    concept: 'Sichtbarkeits-Modifikator (Visibility)',
    question: 'Welches Symbol kennzeichnet in einem UML 2.5 Klassendiagramm ein privates Attribut (nur innerhalb der eigenen Klasse sichtbar)?',
    options: [
      { text: '+ (Public)', isCorrect: false },
      { text: '- (Private)', isCorrect: true },
      { text: '# (Protected)', isCorrect: false },
      { text: '~ (Package / Default)', isCorrect: false }
    ],
    explanation: 'Nach OMG UML 2.5: - steht für private, + für public, # für protected (Subklassen) und ~ für package visibility.'
  },
  {
    id: 'rel_composition',
    concept: 'Beziehungstypen: Komposition vs. Aggregation',
    question: 'Ein Gebäude besteht aus Stockwerken. Wird das Gebäude abgerissen, existieren auch die Stockwerke nicht mehr (strenge existenzielle Abhängigkeit / Teil-Ganzes-Beziehung). Welcher Beziehungstyp liegt vor?',
    options: [
      { text: 'Vererbung (Generalisierung) mit leerer Dreiecksspitze', isCorrect: false },
      { text: 'Komposition mit ausgefüllter schwarzer Raute (*--) am Ganzen', isCorrect: true },
      { text: 'Aggregation mit weißer, nicht ausgefüllter Raute (o--) am Ganzen', isCorrect: false },
      { text: 'Reine Assoziation mit offener Pfeilspitze (-->)', isCorrect: false }
    ],
    explanation: 'Die Komposition (gefüllte Raute am Ganzen) drückt eine existenzielle Abhängigkeit aus. Bei der Aggregation (leere Raute) können die Teile auch ohne das Ganze existieren.'
  },
  {
    id: 'card_order',
    concept: 'Multiplizitäten & Kardinalitäten',
    question: 'Eine Kundenverwaltung besagt: "Ein Kunde kann keine, eine oder beliebig viele Bestellungen aufgeben. Jede Bestellung muss genau einem Kunden zugeordnet sein." Wie lauten die Multiplizitäten an den Enden [Kunde] --- [Bestellung]?',
    options: [
      { text: 'Kunde: 1..* | Bestellung: 1', isCorrect: false },
      { text: 'Kunde: 1 | Bestellung: 0..*', isCorrect: true },
      { text: 'Kunde: 0..1 | Bestellung: 1..*', isCorrect: false },
      { text: 'Kunde: * | Bestellung: *', isCorrect: false }
    ],
    explanation: 'Am Ende [Kunde] steht 1 (genau ein Kunde je Bestellung), am Ende [Bestellung] steht 0..* (beliebig viele, auch 0 Bestellungen).'
  }
];

export const DEFAULT_CLASS_DIAGRAM = [
  'classDiagram',
  '  class Kunde {',
  '    -int id',
  '    +String name',
  '    +String email',
  '    +bestellen(Warenkorb w) Bestellung',
  '  }',
  '  class Bestellung {',
  '    -int bestellNr',
  '    -Date datum',
  '    -double gesamtbetrag',
  '    +berechneSumme() double',
  '  }',
  '  class BestellPosition {',
  '    -int menge',
  '    -double einzelpreis',
  '  }',
  '  Kunde "1" --> "0..*" Bestellung : platziert',
  '  Bestellung "1" *-- "1..*" BestellPosition : besteht aus'
].join('\n');
