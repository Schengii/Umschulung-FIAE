// Interactive Cloze Tests (Lückentexte) for IT basics, SQL, Web Dev & Security

export const CLOZE_TESTS = [
  {
    id: 'cloze_it_basics',
    title: 'Lückentext: Informatik-Grundlagen & Binärsystem',
    category: 'Grundlagen',
    targetRoles: ['anfaenger', 'azubi'],
    description: 'Teste dein Wissen über Bits, Bytes, Betriebssysteme und Netzwerke.',
    text: `Ein Computer verarbeitet Informationen in kleinsten Einheiten, den sogenannten {{blank1}}. Acht dieser Einheiten ergeben zusammen ein {{blank2}}. Der {{blank3}} ist das zentrale Rechenwerk des Computers, während der {{blank4}} als flüchtiger Arbeitsspeicher dient.`,
    blanks: {
      blank1: { correct: 'Bits', options: ['Bits', 'Bytes', 'Hertz', 'Pixels'] },
      blank2: { correct: 'Byte', options: ['KiloBit', 'Byte', 'MegaByte', 'Word'] },
      blank3: { correct: 'Prozessor (CPU)', options: ['Prozessor (CPU)', 'Grafikkarte (GPU)', 'Festplatte (SSD)', 'Kühler'] },
      blank4: { correct: 'RAM', options: ['ROM', 'RAM', 'BIOS', 'Cache'] }
    },
    xpReward: 60
  },
  {
    id: 'cloze_sql',
    title: 'Lückentext: SQL & Datenbanksprache',
    category: 'Datenbanken',
    targetRoles: ['azubi', 'pro'],
    description: 'Befülle die Lücken in diesen SQL-Abfragen für die IHK-Prüfung.',
    text: `Um Daten aus einer Datenbanktabelle abzufragen, verwendet man das Schlüsselwort {{blank1}}. Möchte man bestimmte Zeilen filtern, nutzt man die {{blank2}}-Klausel. Wenn zwei Tabellen anhand ihres Fremdschlüssels verknüpft werden, kommt {{blank3}} zum Einsatz. Ergebnisse können mit {{blank4}} sortiert werden.`,
    blanks: {
      blank1: { correct: 'SELECT', options: ['FETCH', 'GET', 'SELECT', 'EXTRACT'] },
      blank2: { correct: 'WHERE', options: ['WHERE', 'FILTER', 'HAVING', 'WHEN'] },
      blank3: { correct: 'INNER JOIN', options: ['UNION', 'INNER JOIN', 'CONNECT', 'ATTACH'] },
      blank4: { correct: 'ORDER BY', options: ['SORT BY', 'ARRANGE', 'ORDER BY', 'GROUP BY'] }
    },
    xpReward: 70
  },
  {
    id: 'cloze_security',
    title: 'Lückentext: IT-Sicherheit & Angriffsvektoren',
    category: 'IT-Sicherheit',
    targetRoles: ['azubi', 'pro'],
    description: 'Identifiziere Sicherheitsbegriffe wie Hashing, SQLi, XSS und Phishing.',
    text: `Bei einer {{blank1}} schleicht ein Angreifer bösartigen SQL-Code über ein Eingabefeld ein. Um sich davor zu schützen, nutzt man {{blank2}} Queries. Passwörter sollten in Datenbanken niemals im Klartext, sondern als {{blank3}} mit einem zufälligen {{blank4}} gespeichert werden.`,
    blanks: {
      blank1: { correct: 'SQL Injection', options: ['Buffer Overflow', 'SQL Injection', 'Cross-Site Scripting', 'Man-in-the-Middle'] },
      blank2: { correct: 'Parametrisierte', options: ['Verschlüsselte', 'Parametrisierte', 'Kompilierte', 'Gestreamte'] },
      blank3: { correct: 'Hash', options: ['Token', 'Cookie', 'Hash', 'String'] },
      blank4: { correct: 'Salt', options: ['Salt', 'Key', 'Pepper', 'Nonce'] }
    },
    xpReward: 80
  }
];
