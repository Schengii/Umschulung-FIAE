// Data for new Next-Gen Educational Labs

export const DEBUGGER_SCENARIOS = [
  {
    id: 'recursion-fibonacci',
    title: 'Rekursion & Call Stack: Fibonacci',
    category: 'Algorithmen',
    difficulty: 'Mittel',
    language: 'javascript',
    description: 'Verfolge den Aufruf-Stack (Call Stack), Rückgabewerte und Frame-Pushes bei der rekursiven Berechnung von fib(4).',
    code: `function fib(n) {
  if (n <= 1) {
    return n;
  }
  let a = fib(n - 1);
  let b = fib(n - 2);
  return a + b;
}

const result = fib(4);
console.log("Ergebnis:", result);`,
    steps: [
      { line: 10, explanation: 'Programm startet. Initialisiere Aufruf fib(4).', stack: ['global()'], heap: {}, vars: {} },
      { line: 1, explanation: 'Aufruf von fib(n=4) wird auf den Call Stack gelegt.', stack: ['global()', 'fib(n=4)'], heap: {}, vars: { n: 4 } },
      { line: 2, explanation: 'Bedingungsprüfung: (n <= 1) -> 4 <= 1 ist false.', stack: ['global()', 'fib(n=4)'], heap: {}, vars: { n: 4 } },
      { line: 5, explanation: 'Aufruf des ersten rekursiven Zweigs: fib(3)', stack: ['global()', 'fib(n=4)', 'fib(n=3)'], heap: {}, vars: { n: 3 } },
      { line: 5, explanation: 'Tieferer Aufruf im Stack: fib(2)', stack: ['global()', 'fib(n=4)', 'fib(n=3)', 'fib(n=2)'], heap: {}, vars: { n: 2 } },
      { line: 5, explanation: 'Weiterer Aufruf: fib(1)', stack: ['global()', 'fib(n=4)', 'fib(n=3)', 'fib(n=2)', 'fib(n=1)'], heap: {}, vars: { n: 1 } },
      { line: 3, explanation: 'Basisfall erreicht! 1 <= 1 ist true. fib(1) liefert 1 zurück (Stack Pop).', stack: ['global()', 'fib(n=4)', 'fib(n=3)', 'fib(n=2)'], heap: {}, vars: { n: 2, a: 1 } },
      { line: 6, explanation: 'Zweiter Zweig in fib(2): Aufruf von fib(0)', stack: ['global()', 'fib(n=4)', 'fib(n=3)', 'fib(n=2)', 'fib(n=0)'], heap: {}, vars: { n: 0 } },
      { line: 3, explanation: 'Basisfall fib(0) liefert 0 zurück.', stack: ['global()', 'fib(n=4)', 'fib(n=3)', 'fib(n=2)'], heap: {}, vars: { n: 2, a: 1, b: 0 } },
      { line: 7, explanation: 'fib(2) berechnet a + b = 1 + 0 = 1 und gibt 1 zurück.', stack: ['global()', 'fib(n=4)', 'fib(n=3)'], heap: {}, vars: { n: 3, a: 1 } },
      { line: 6, explanation: 'In fib(3) wird nun fib(1) aufgerufen -> liefert 1.', stack: ['global()', 'fib(n=4)', 'fib(n=3)'], heap: {}, vars: { n: 3, a: 1, b: 1 } },
      { line: 7, explanation: 'fib(3) berechnet 1 + 1 = 2 und kehrt zu fib(4) zurück.', stack: ['global()'], heap: {}, vars: { n: 4, a: 2 } },
      { line: 6, explanation: 'In fib(4) wird der rechte Teilbaum fib(2) abgearbeitet (liefert 1).', stack: ['global()', 'fib(n=4)'], heap: {}, vars: { n: 4, a: 2, b: 1 } },
      { line: 7, explanation: 'fib(4) addiert a + b (2 + 1) = 3 und beendet die Rekursion.', stack: ['global()'], heap: {}, vars: { result: 3 } },
      { line: 11, explanation: 'Ausgabe in der Konsole: Ergebnis = 3.', stack: ['global()'], heap: {}, vars: { result: 3 } }
    ]
  },
  {
    id: 'closure-scope',
    title: 'Closures & Lexikalischer Scope',
    category: 'JavaScript Internals',
    difficulty: 'Fortgeschritten',
    language: 'javascript',
    description: 'Verstehe, wie innere Funktionen Zugriff auf den lexikalischen Scope ihrer Eltern-Funktion im Heap behalten.',
    code: `function createCounter(initialValue) {
  let count = initialValue;
  
  return function() {
    count += 1;
    return count;
  };
}

const counterA = createCounter(10);
const res1 = counterA();
const res2 = counterA();`,
    steps: [
      { line: 10, explanation: 'Aufruf von createCounter(10)', stack: ['global()', 'createCounter(10)'], heap: { 'Scope#1': { count: 10, refCount: 1 } }, vars: { initialValue: 10, count: 10 } },
      { line: 4, explanation: 'Innere Funktion wird erzeugt und bindet Scope#1 als Closure-Umgebung.', stack: ['global()', 'createCounter(10)'], heap: { 'Scope#1': { count: 10, refCount: 1 } }, vars: {} },
      { line: 10, explanation: 'createCounter wird vom Stack genommen. counterA referenziert die Closure.', stack: ['global()'], heap: { 'Scope#1': { count: 10, refCount: 1 } }, vars: { counterA: '[Function (Closure: Scope#1)]' } },
      { line: 11, explanation: 'Erster Aufruf: counterA() -> Springt in den Funktionsrumpf.', stack: ['global()', 'anonymous()'], heap: { 'Scope#1': { count: 10, refCount: 1 } }, vars: {} },
      { line: 5, explanation: 'Variable "count" im Heap-Scope#1 wird von 10 auf 11 inkrementiert.', stack: ['global()', 'anonymous()'], heap: { 'Scope#1': { count: 11, refCount: 1 } }, vars: {} },
      { line: 6, explanation: 'Rückgabe: 11. Wert wird in res1 gespeichert.', stack: ['global()'], heap: { 'Scope#1': { count: 11, refCount: 1 } }, vars: { counterA: '[Function]', res1: 11 } },
      { line: 12, explanation: 'Zweiter Aufruf: counterA()', stack: ['global()', 'anonymous()'], heap: { 'Scope#1': { count: 11, refCount: 1 } }, vars: {} },
      { line: 5, explanation: 'Scope#1.count wird erneut inkrementiert: 11 -> 12.', stack: ['global()', 'anonymous()'], heap: { 'Scope#1': { count: 12, refCount: 1 } }, vars: {} },
      { line: 6, explanation: 'Rückgabe: 12. Gespeichert in res2.', stack: ['global()'], heap: { 'Scope#1': { count: 12, refCount: 1 } }, vars: { counterA: '[Function]', res1: 11, res2: 12 } }
    ]
  },
  {
    id: 'memory-heap-reference',
    title: 'Value vs. Reference Types & Mutation',
    category: 'Memory Management',
    difficulty: 'Basis',
    language: 'javascript',
    description: 'Visualisiere, wie Primitive auf dem Stack und Objekte/Arrays als Zeiger auf den Heap verwaltet werden.',
    code: `let num1 = 42;
let num2 = num1;
num2 = 99;

let userA = { name: "Alice", roles: ["Dev"] };
let userB = userA;
userB.name = "Bob";
userB.roles.push("Admin");`,
    steps: [
      { line: 1, explanation: 'num1 wird als primitiver Wert (42) direkt auf dem Stack zugewiesen.', stack: ['global()'], heap: {}, vars: { num1: 42 } },
      { line: 2, explanation: 'num2 erhält eine unabhängige Wert-Kopie von num1 (42).', stack: ['global()'], heap: {}, vars: { num1: 42, num2: 42 } },
      { line: 3, explanation: 'num2 wird auf 99 geändert. num1 bleibt unverändert bei 42.', stack: ['global()'], heap: {}, vars: { num1: 42, num2: 99 } },
      { line: 5, explanation: 'userA referenziert ein neues Objekt im Heap @0x101 (inkl. Array @0x202).', stack: ['global()'], heap: { '@0x101': { name: 'Alice', roles: '-> @0x202' }, '@0x202': ['Dev'] }, vars: { num1: 42, num2: 99, userA: '-> @0x101' } },
      { line: 6, explanation: 'userB wird userA zugewiesen. userB erhält die selbe Speicheradresse @0x101!', stack: ['global()'], heap: { '@0x101': { name: 'Alice', roles: '-> @0x202' }, '@0x202': ['Dev'] }, vars: { num1: 42, num2: 99, userA: '-> @0x101', userB: '-> @0x101' } },
      { line: 7, explanation: 'userB.name = "Bob" mutiert direkt das Objekt @0x101. Auch userA.name ist jetzt "Bob"!', stack: ['global()'], heap: { '@0x101': { name: 'Bob', roles: '-> @0x202' }, '@0x202': ['Dev'] }, vars: { num1: 42, num2: 99, userA: '-> @0x101', userB: '-> @0x101' } },
      { line: 8, explanation: 'userB.roles.push("Admin") mutiert das Array @0x202 im Heap.', stack: ['global()'], heap: { '@0x101': { name: 'Bob', roles: '-> @0x202' }, '@0x202': ['Dev', 'Admin'] }, vars: { num1: 42, num2: 99, userA: '-> @0x101', userB: '-> @0x101' } }
    ]
  }
];

export const CLEAN_CODE_CHALLENGES = [
  {
    id: 'sql-injection-fix',
    title: 'SQL Injection Vulnerability (OWASP Top 1)',
    category: 'IT-Sicherheit',
    difficulty: 'Mittel',
    xp: 75,
    badCode: `// Unsicherer Authentifizierungs-Endpunkt
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  // GEFÄHRDER STRING CONCATENATION:
  const query = "SELECT * FROM users WHERE user = '" + username + "' AND pwd = '" + password + "'";
  const user = await db.query(query);
  
  if (user.length > 0) {
    res.json({ token: generateToken(user[0]) });
  } else {
    res.status(401).send("Invalid credentials");
  }
});`,
    vulnExplanation: 'Der Code baut SQL-Statements per String-Verkettung zusammen. Ein Angreifer kann mit `"admin\' --"` oder `"\' OR \'1\'=\'1"` die Authentifizierung komplett umgehen.',
    options: [
      {
        id: 'opt-regex',
        label: 'Verwende eine RegEx-Blacklist gegen Sonderzeichen vor dem String-Concat.',
        correct: false,
        critique: 'Blacklisting ist unzureichend und leicht zu umgehen (z. B. durch Unicode/Hex-Bypasses).'
      },
      {
        id: 'opt-params',
        label: 'Verwende Prepared Statements mit parametrisierten Queries ($1, $2 / ?) und Hash-Vergleich mit bcrypt.',
        correct: true,
        critique: 'Exzellent! Parametrisierte Queries trennen SQL-Kompilierung von Nutzdaten strikt ab. Passwörter müssen immer mit bcrypt/Argon2 gehasht verglichen werden.'
      },
      {
        id: 'opt-escape',
        label: 'Nutze einfache HTML-Entity-Encodings für den Username.',
        correct: false,
        critique: 'HTML-Encoding schützt vor XSS im Browser, schützt die Datenbank jedoch nicht vor SQL-Injection!'
      }
    ],
    refactoredCode: `// Sicherer Endpunkt mit Parametrisierung & Bcrypt
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  // 1. Sichere parametrisierte SQL-Abfrage
  const query = "SELECT id, username, password_hash, role FROM users WHERE username = $1";
  const result = await db.query(query, [username]);
  
  if (result.rows.length === 0) {
    return res.status(401).json({ error: "Ungültige Anmeldedaten" });
  }
  
  // 2. Sicherer Salted Password Hash Vergleich
  const user = result.rows[0];
  const isValid = await bcrypt.compare(password, user.password_hash);
  
  if (!isValid) {
    return res.status(401).json({ error: "Ungültige Anmeldedaten" });
  }
  
  res.json({ token: generateJwt(user) });
});`
  },
  {
    id: 'memory-leak-event-listener',
    title: 'React Memory Leak & Uncleaned Event Listeners',
    category: 'Performance & Frontend',
    difficulty: 'Fortgeschritten',
    xp: 90,
    badCode: `function WindowTracker() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    // BUG: Kein Cleanup & Neuregistrierung bei jedem Render!
    window.addEventListener('resize', () => {
      setWindowWidth(window.innerWidth);
      console.log('Window resized:', window.innerWidth);
    });
  });

  return <div>Fensterbreite: {windowWidth}px</div>;
}`,
    vulnExplanation: 'Ohne Dependency-Array `[]` registriert `useEffect` bei jedem Re-Render einen weiteren Event-Listener. Ohne Cleanup-Funktion (`return () => removeEventListener`) entstehen schwere Memory Leaks und CPU-Last.',
    options: [
      {
        id: 'opt-throttle',
        label: 'Einfach `setTimeout` in den Event-Listener packen.',
        correct: false,
        critique: 'Das drosselt zwar die Ausführungsrate, beseitigt aber nicht die multiplen kumulativen Event-Listener im Speicher.'
      },
      {
        id: 'opt-cleanup',
        label: 'Leeres Dependency Array `[]` und Rückgabe einer Cleanup-Funktion mit Debounce/Throttling.',
        correct: true,
        critique: 'Perfekt! Das leere Array bindet den Listener nur beim Mounten und die Cleanup-Funktion räumt ihn beim Unmounten sauber auf.'
      },
      {
        id: 'opt-global',
        label: 'Den Event-Listener direkt in `window.onload` außerhalb von React definieren.',
        correct: false,
        critique: 'Verletzt React-Komponentenisolation und kann nicht auf Komponenten-State zugreifen.'
      }
    ],
    refactoredCode: `function WindowTracker() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // 1. Listener beim Mounten registrieren
    window.addEventListener('resize', handleResize);

    // 2. ESSENTIELL: Cleanup-Funktion beim Unmounten
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Leeres Array -> Nur 1x beim Mounten ausführen!

  return <div>Fensterbreite: {windowWidth}px</div>;
}`
  },
  {
    id: 'n-plus-one-query',
    title: 'N+1 Query Problem in ORM / Backend APIs',
    category: 'Backend & Datenbanken',
    difficulty: 'Fortgeschritten',
    xp: 85,
    badCode: `// Typisches N+1 Query Antipattern
async function getDepartmentReports() {
  // 1 Query für alle 100 Abteilungen
  const departments = await db.query('SELECT * FROM departments');
  
  const report = [];
  for (const dept of departments) {
    // BUG: 100 zusätzliche Queries in einer Schleife! (N-Queries)
    const employees = await db.query(
      'SELECT * FROM employees WHERE department_id = $1', 
      [dept.id]
    );
    report.push({ ...dept, employees });
  }
  
  return report; // Insgesamt 1 + 100 = 101 Datenbank-Roundtrips!
}`,
    vulnExplanation: 'Bei 100 Abteilungen feuert das Backend 101 einzelne SQL-Queries ab. Bei 5000 Abteilungen bricht die Datenbank durch Latenz und Roundtrips zusammen.',
    options: [
      {
        id: 'opt-parallel',
        label: 'Verwende `Promise.all` für die Schleife, um die 100 Abfragen parallel abzufeuern.',
        correct: false,
        critique: 'Parallelisiert zwar die Wartezeit, überlastet den DB-Connection-Pool jedoch drastisch mit 100 Queries.'
      },
      {
        id: 'opt-join',
        label: 'Führe einen einzigen SQL `JOIN` durch oder verwende `WHERE department_id IN (...)` (Batching) / JSON_AGG.',
        correct: true,
        critique: 'Hervorragend! Ein einzelner SQL JOIN oder `json_agg` reduziert 101 Roundtrips auf genau 1 hochoptimierte Abfrage.'
      },
      {
        id: 'opt-cache',
        label: 'Reduziere das Schleifenlimit mit `LIMIT 10`.',
        correct: false,
        critique: 'Verfälscht die Geschäftslogik und liefert unvollständige Berichte.'
      }
    ],
    refactoredCode: `// Optimierte Lösung: Exakt 1 Query mit SQL JOIN & JSON-Aggregation
async function getDepartmentReports() {
  const query = \`
    SELECT 
      d.id, 
      d.name, 
      d.cost_center,
      COALESCE(
        json_agg(
          json_build_object('id', e.id, 'name', e.name, 'role', e.role)
        ) FILTER (WHERE e.id IS NOT NULL), 
        '[]'
      ) AS employees
    FROM departments d
    LEFT JOIN employees e ON d.id = e.department_id
    GROUP BY d.id;
  \`;
  
  const { rows } = await db.query(query);
  return rows; // Genau 1 extrem schneller Roundtrip!
}`
  }
];

export const DNS_LIFECYCLE_STEPS = [
  {
    step: 1,
    phase: 'Browser Cache Check',
    title: '1. Lokaler Browser- & OS-Cache',
    target: 'Client (Dein PC)',
    protocol: 'In-Memory / OS Hosts',
    latency: '0.2 ms',
    icon: 'Laptop',
    description: 'Der Browser prüft seinen internen DNS-Cache (z. B. chrome://net-internals/#dns) und die lokale hosts-Datei (C:\\Windows\\System32\\drivers\\etc\\hosts).',
    detail: 'Kein Treffer vorhanden (Cache Miss oder TTL abgelaufen). Request muss über das Netzwerk aufgelöst werden.'
  },
  {
    step: 2,
    phase: 'Recursive DNS Resolver',
    title: '2. Rekursiver DNS-Resolver (ISP / 1.1.1.1 / 8.8.8.8)',
    target: 'Resolver Server',
    protocol: 'UDP Port 53 / DoH (HTTPS 443)',
    latency: '12 ms',
    icon: 'Server',
    description: 'Dein Router/Rechner sendet eine rekursive DNS-Anfrage an den konfigurierten Resolver (z.B. Cloudflare 1.1.1.1 oder ISP).',
    detail: 'Der Resolver übernimmt die vollständige iterative Suche durch die DNS-Hierarchie für den Client.'
  },
  {
    step: 3,
    phase: 'Root Nameserver',
    title: '3. Root Nameserver Query (.)',
    target: 'Root Server (13 weltweit: a.root-servers.net - m...)',
    protocol: 'DNS Iterativ (UDP)',
    latency: '24 ms',
    icon: 'Globe',
    description: 'Der Resolver fragt die oberste DNS-Ebene (Root-Zone "."): "Wo finde ich die .de oder .com Nameserver?"',
    detail: 'Antwort des Root-Servers: "Ich kenne die IP nicht, aber hier ist die Liste der zuständigen TLD-Server für .de (z.B. a.nic.de)."'
  },
  {
    step: 4,
    phase: 'TLD Nameserver',
    title: '4. Top-Level Domain (TLD) Nameserver (.de)',
    target: 'DENIC / Verisign TLD Server',
    protocol: 'DNS Iterativ (UDP)',
    latency: '18 ms',
    icon: 'Network',
    description: 'Der Resolver kontaktiert den TLD-Server für die Endung (.de / .com): "Wer verwaltet die Domain informatik-lernen.de?"',
    detail: 'Antwort des TLD-Servers: "Verwaltet wird diese Domain durch die autoritativen Nameserver ns1.webhoster.com (Glue Records A/AAAA)."'
  },
  {
    step: 5,
    phase: 'Authoritative Nameserver',
    title: '5. Autoritativer Nameserver (Hosting Provider)',
    target: 'ns1.webhoster.com',
    protocol: 'DNS Final (UDP)',
    latency: '14 ms',
    icon: 'Database',
    description: 'Der autoritative Nameserver hält die Original-Zonendatei (A, AAAA, CNAME, MX, TXT) und liefert den A-Record zurück.',
    detail: 'Antwort: A-Record = 185.199.108.153 (IPv4) & AAAA = 2606:50c0:8000::153 (IPv6), TTL = 3600s.'
  },
  {
    step: 6,
    phase: 'TCP 3-Way Handshake',
    title: '6. TCP Verbindungsaufbau (SYN -> SYN-ACK -> ACK)',
    target: 'Webserver IP: 185.199.108.153:443',
    protocol: 'TCP Layer 4',
    latency: '28 ms (1.5 RTT)',
    icon: 'Shuffle',
    description: 'Nachdem die IP bekannt ist, initiiert der Client den zuverlässigen TCP-Handshake zur Portnummer 443.',
    detail: '1. Client -> Server: SYN (Seq=100) | 2. Server -> Client: SYN-ACK (Seq=500, Ack=101) | 3. Client -> Server: ACK (Ack=501).'
  },
  {
    step: 7,
    phase: 'TLS 1.3 Encryption Handshake',
    title: '7. TLS 1.3 Verschlüsselung & Zertifikatsprüfung',
    target: 'Webserver TLS Stack',
    protocol: 'TLS 1.3 (Elliptic Curve Diffie-Hellman)',
    latency: '18 ms (1-RTT / 0-RTT)',
    icon: 'ShieldCheck',
    description: 'ClientHello mit unterstützten Cipher-Suites (AES-GCM / ChaCha20-Poly1305) & ECDHE Key Share. Server sendet ServerHello, X.509 Zertifikat und Finished.',
    detail: 'Ende-zu-Ende verschlüsselter symmetrischer Sitzungsschlüssel ist etabliert. Perfekte Vorwärtsgeheimhaltung (PFS).'
  },
  {
    step: 8,
    phase: 'HTTP/2 Request & Stream Multiplexing',
    title: '8. HTTP/2 GET Request & DOM Rendering',
    target: 'Reverse Proxy / Web App',
    protocol: 'HTTP/2 over TLS',
    latency: '35 ms (TTFB)',
    icon: 'Layers',
    description: 'Browser sendet HEADERS-Frame `GET /index.html HTTP/2`. Server antwortet mit Status `200 OK`, `Content-Type: text/html` und streamt Bytes.',
    detail: 'Browser-Engine (V8/Blink) parst HTML, lädt verknüpfte CSS/JS-Bundles über parallele HTTP/2 Streams ohne Head-of-Line-Blocking.'
  }
];

export const SQL_ISOLATION_SCENARIOS = [
  {
    id: 'dirty-read',
    title: 'Dirty Read Phänomen (READ UNCOMMITTED vs. READ COMMITTED)',
    difficulty: 'Mittel',
    description: 'Session A modifiziert ein Konto von 100€ auf 500€, bricht die Transaktion jedoch mit ROLLBACK ab. Session B liest unbestätigte Dirty Data.',
    initialTable: [
      { id: 1, name: 'Konto Alice', balance: 100 },
      { id: 2, name: 'Konto Bob', balance: 250 }
    ],
    isolationLevels: ['READ UNCOMMITTED', 'READ COMMITTED'],
    sessionA: [
      { step: 1, cmd: 'BEGIN TRANSACTION;', desc: 'Session A startet Transaktion.' },
      { step: 2, cmd: 'UPDATE accounts SET balance = 500 WHERE id = 1;', desc: 'Session A setzt Alice auf 500€ (noch nicht committet!).' },
      { step: 4, cmd: 'ROLLBACK;', desc: 'Fehler in Session A! Transaktion wird rückgängig gemacht (Rollback auf 100€).' }
    ],
    sessionB: [
      { step: 3, cmd: 'SELECT balance FROM accounts WHERE id = 1;', desc: 'Session B liest den Kontostand von Alice während Session A uncommittet ist.' }
    ],
    explanation: 'Unter **READ UNCOMMITTED** sieht Session B 500€ (Dirty Read), obwohl das Geld nie existierte! Unter **READ COMMITTED** blockiert oder liefert die DB strikt den letzten committeten Stand (100€).'
  },
  {
    id: 'deadlock-conflict',
    title: 'Deadlock Erkennung & Lock-Hierarchie',
    difficulty: 'Fortgeschritten',
    description: 'Session A sperrt Zeile 1 und will Zeile 2. Gleichzeitig sperrt Session B Zeile 2 und will Zeile 1. Klassischer zirkulärer Deadlock.',
    initialTable: [
      { id: 1, name: 'Artikel Laptop (Bestand: 5)', stock: 5 },
      { id: 2, name: 'Artikel Monitor (Bestand: 10)', stock: 10 }
    ],
    isolationLevels: ['REPEATABLE READ', 'SERIALIZABLE'],
    sessionA: [
      { step: 1, cmd: 'BEGIN; UPDATE articles SET stock = stock - 1 WHERE id = 1;', desc: 'Session A erhält Exclusive Row Lock auf ID 1 (Laptop).' },
      { step: 3, cmd: 'UPDATE articles SET stock = stock - 1 WHERE id = 2;', desc: 'Session A wartet auf Row Lock für ID 2 (gehalten von B)...' }
    ],
    sessionB: [
      { step: 2, cmd: 'BEGIN; UPDATE articles SET stock = stock - 1 WHERE id = 2;', desc: 'Session B erhält Exclusive Row Lock auf ID 2 (Monitor).' },
      { step: 4, cmd: 'UPDATE articles SET stock = stock - 1 WHERE id = 1;', desc: 'Session B fordert Lock auf ID 1 -> ZYKLISCHE BLOCKADE (DEADLOCK)!' }
    ],
    explanation: 'Das RDBMS (z. B. PostgreSQL/InnoDB) erkennt den zyklischen Lock-Graphen und wirft in einer Session einen Fehler: `ERROR: deadlock detected. Process was chosen as deadlock victim.` Lösung: Sperren immer in derselben Reihenfolge anfordern (Sortierung nach Primärschlüssel)!'
  }
];

export const IHK_PROJECT_TEMPLATES = {
  fiae: {
    title: 'Fachinformatiker für Anwendungsentwicklung (FIAE) - 80 Stunden Projekt',
    budgetHours: 80,
    phases: [
      { name: '1. Projektinitialisierung & Analyse', defaultHours: 12, tasks: ['Ist-Analyse & Geschäftsprozessmodellierung (BPMN)', 'Soll-Konzept & Anforderungsanalyse (Lasten-/Pflichtenheft)', 'Wirtschaftlichkeitsanalyse (Make-or-Buy, Amortisation, ROI)'] },
      { name: '2. Entwurf & Systemarchitektur', defaultHours: 16, tasks: ['Datenbankmodellierung (ERD / 3NF Relationen)', 'Architekturdesign (Clean Architecture, REST API OpenAPI Spezifikation)', 'UI/UX Wireframes & Barrierefreiheit (WCAG 2.1)'] },
      { name: '3. Implementierungsphase', defaultHours: 28, tasks: ['Entwicklung der Kernmodule & Services (TDD Test-Driven Development)', 'Datenbankmigration & Schnittstellenanbindung', 'Authentifizierung & Autorisierung (OAuth2 / JWT)'] },
      { name: '4. Qualitätssicherung & Tests', defaultHours: 12, tasks: ['Unit-Tests & Integrations-Tests (>80% Code Coverage)', 'Sicherheitsaudit (OWASP Top 10) & Performance-Profiling', 'User Acceptance Testing (UAT) & Bugfixing'] },
      { name: '5. Bereitstellung & Projektdokumentation', defaultHours: 12, tasks: ['CI/CD Deployment & Docker Containerisierung', 'Erstellung der Projektdokumentation & Entwicklerhandbuch', 'Kundenschulung & Projektabnahme'] }
    ]
  },
  fisi: {
    title: 'Fachinformatiker für Systemintegration (FISI) - 40 Stunden Projekt',
    budgetHours: 40,
    phases: [
      { name: '1. Projektplanung & Analyse', defaultHours: 6, tasks: ['Ist-Zustands-Analyse der Netzwerk- & Serverinfrastruktur', 'Soll-Konzeption & Nutzwertanalyse alternativer Lösungen', 'Kosten- und Wirtschaftlichkeitsberechnung'] },
      { name: '2. Konzeption & Beschaffung', defaultHours: 8, tasks: ['Sicherheits- & Backup-Konzept (3-2-1 Regel, RPO/RTO)', 'IP-Subnetz- & VLAN-Segmentierungsplanung', 'Hard- & Softwarebeschaffung / Lizenzen'] },
      { name: '3. Installation & Konfiguration', defaultHours: 14, tasks: ['Aufbau & Konfiguration der Server/VMs (Hypervisor/Proxmox/ESXi)', 'Netzwerkkonfiguration (Firewall, VLANs, VPN)', 'Automatisierung via Ansible / PowerShell Scripting'] },
      { name: '4. Testphase & Abnahme', defaultHours: 6, tasks: ['Funktions- & Performance-Tests (Lasttests, Bandbreite)', 'Disaster-Recovery & Failover-Tests', 'Sicherheits-Scan (Vulnerability Scanner / Portscan)'] },
      { name: '5. Dokumentation & Übergabe', defaultHours: 6, tasks: ['Erstellung der technischen Projektdokumentation', 'Benutzer- & Administratorhandbuch', 'Projektübergabe & Einweisung des Betriebsteams'] }
    ]
  }
};
