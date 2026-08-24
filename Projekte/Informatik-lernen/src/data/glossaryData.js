export const GLOSSARY_TERMS = [
  {
    id: 'api',
    term: 'API (Application Programming Interface)',
    category: 'Programmierung',
    difficulty: 'Azubi / IHK',
    simpleExplanation: 'Eine Schnittstelle, über die verschiedene Software-Programme gegenseitig Daten austauschen können – wie ein Kellner im Restaurant, der deine Bestellung zur Küche bringt.',
    expertExplanation: 'Ein definiertes Set von Endpunkten (z. B. REST, GraphQL, gRPC), Protokollen und Datenformaten (JSON, XML), über das Softwaremodule miteinander kommunizieren.',
    example: 'const response = await fetch("https://api.example.com/wetter");'
  },
  {
    id: 'binaer',
    term: 'Binärsystem (Zweiersystem)',
    category: 'Grundlagen',
    difficulty: 'Einsteiger',
    simpleExplanation: 'Die Sprache des Computers, die nur aus zwei Ziffern besteht: 0 (Strom aus) und 1 (Strom an).',
    expertExplanation: 'Stellenwertsystem zur Basis 2. Jedes Bit repräsentiert eine Zweierpotenz (2^0, 2^1, 2^2, ...). 8 Bits bilden 1 Byte.',
    example: '1010 im Binärsystem entspricht der Zahl 10 im Dezimalsystem.'
  },
  {
    id: 'cpu',
    term: 'CPU (Central Processing Unit)',
    category: 'Hardware',
    difficulty: 'Einsteiger',
    simpleExplanation: 'Das Haupt-Gehirn des Computers. Die CPU verarbeitet Befehle und führt Berechnungen durch.',
    expertExplanation: 'Hardware-Komponente bestehend aus Rechenwerk (ALU), Steuerwerk (CU) und Registern. Taktfrequenz wird in Gigahertz (GHz) gemessen.',
    example: 'Intel Core i9 oder AMD Ryzen 9 führen Milliarden Befehle pro Sekunde aus.'
  },
  {
    id: 'deadlock',
    term: 'Deadlock (Verklemmung)',
    category: 'Programmierung',
    difficulty: 'Senior / Expert',
    simpleExplanation: 'Ein Zustand, bei dem zwei Programme gegenseitig auf Ressourcen des anderen warten und dadurch beide dauerhaft blockiert sind.',
    expertExplanation: 'Systemzustand in der Nebenläufigkeit (Concurrency), bei dem vier Bedingungen erfüllt sind: Mutual Exclusion, Hold and Wait, No Preemption und Circular Wait.',
    example: 'Prozess A sperrt Ressource 1 und wartet auf 2. Prozess B sperrt Ressource 2 und wartet auf 1.'
  },
  {
    id: 'dns',
    term: 'DNS (Domain Name System)',
    category: 'Netzwerke',
    difficulty: 'Azubi / IHK',
    simpleExplanation: 'Das Telefonbuch des Internets. Es übersetzt verständliche Namen (wie google.com) in IP-Adressen (wie 142.250.180.36).',
    expertExplanation: 'Hierarchisch verteiltes Domaennamensystem auf OSI-Schicht 7, das FQDNs mittels rekursiver und iterativer Nameserver-Abfragen in IP-Adressen auflöst.',
    example: 'nslookup google.com gibt die zugehörige IP-Adresse zurück.'
  },
  {
    id: 'git',
    term: 'Git & Versionskontrolle',
    category: 'Tools & DevOps',
    difficulty: 'Einsteiger',
    simpleExplanation: 'Ein Zeitreise-Werkzeug für Code. Es speichert jeden Zwischenstand deines Projekts, damit du Änderungen nachvollziehen und im Team arbeiten kannst.',
    expertExplanation: 'Verteiltes Versionskontrollsystem (DVCS), das Repositories als gerichtete azyklische Graphen (DAG) von Commits speichert.',
    example: 'git add . && git commit -m "feat: neues Feature" && git push'
  },
  {
    id: 'hash',
    term: 'Hashing & Hashfunktionen',
    category: 'Security',
    difficulty: 'Azubi / IHK',
    simpleExplanation: 'Ein Einweg-Verfahren, das einen beliebig langen Text in eine feste Zeichenkette verwandelt. Aus dem Hash kann das Original nicht zurückgerechnet werden.',
    expertExplanation: 'Kryptographische Einwegfunktion (z. B. SHA-256, bcrypt) mit Kollisionssicherheit und Lawineneffekt (Avalanche Effect).',
    example: 'bcrypt.hash("MeinPasswort", 10) erzeugt einen sicheren Hash für die Datenbank.'
  },
  {
    id: 'ihk_gap1',
    term: 'IHK GAP 1 (Gestreckte Abschlussprüfung Teil 1)',
    category: 'Ausbildung & IHK',
    difficulty: 'Azubi / IHK',
    simpleExplanation: 'Die erste große Teilprüfung der IHK für IT-Ausbildungen nach ca. 1,5 Jahren (zählt 20% zur Gesamtnote).',
    expertExplanation: 'Prüfungsbereich "Einrichten eines IT-gestützten Arbeitsplatzes" mit Schwerpunkten Hardware, Betriebssysteme, Netzwerke, Kundenbedarf und Arbeitssicherheit.',
    example: 'Prüfungsfragen zu Subnetting, Kaufverträgen, Stromverbrauch und Ergonomie.'
  },
  {
    id: 'json',
    term: 'JSON (JavaScript Object Notation)',
    category: 'Webentwicklung',
    difficulty: 'Einsteiger',
    simpleExplanation: 'Ein einfaches Textformat zum Speichern und Austauschen von Daten zwischen Webseiten und Servern.',
    expertExplanation: 'Leichtgewichtiges, sprachunabhängiges Datenaustauschformat basierend auf Schlüssel-Wert-Paaren und geordneten Listen.',
    example: '{ "user": "Alex", "level": 5, "active": true }'
  },
  {
    id: 'owasp',
    term: 'OWASP Top 10',
    category: 'Security',
    difficulty: 'Senior / Expert',
    simpleExplanation: 'Eine Liste der 10 gefährlichsten Sicherheitslücken in Webanwendungen, die jeder Programmierer kennen sollte.',
    expertExplanation: 'Regelmäßig aktualisierter Standardbericht des Open Web Application Security Project zu kritischen Sicherheitsrisiken (z. B. Broken Access Control, Injection, Cryptographic Failures).',
    example: 'Vermeidung von SQL Injection durch Verwendung von Prepared Statements.'
  },
  {
    id: 'ram',
    term: 'RAM (Random Access Memory)',
    category: 'Hardware',
    difficulty: 'Einsteiger',
    simpleExplanation: 'Der flüchtige Arbeitsspeicher des Computers. Hier liegen alle Programme, die aktuell geöffnet sind. Beim Ausschalten wird er geleert.',
    expertExplanation: 'Direkt adressierbarer, valatiler Hauptspeicher mit sehr hohen Lese- und Schreibgeschwindigkeiten im Vergleich zu SSDs.',
    example: '16 GB DDR5-RAM ermöglichen das flüssige Ausführen mehrerer Entwickler-Tools zeitgleich.'
  },
  {
    id: 'sql',
    term: 'SQL (Structured Query Language)',
    category: 'Datenbanken',
    difficulty: 'Azubi / IHK',
    simpleExplanation: 'Die Standard-Abfragesprache für relationale Datenbanken.',
    expertExplanation: 'Deklarative Abfragesprache für Relationale Datenbankmanagementsysteme (RDBMS) unterteilt in DDL, DML und DCL.',
    example: 'SELECT * FROM users WHERE active = 1;'
  },
  {
    id: 'docker',
    term: 'Docker & Containerisierung',
    category: 'DevOps & Cloud',
    difficulty: 'Senior / Expert',
    simpleExplanation: 'Ein Container verpackt eine Anwendung zusammen mit all ihren Abhängigkeiten, sodass sie auf jedem Betriebssystem identisch läuft.',
    expertExplanation: 'OS-Level Virtualisierungstechnologie, die Linux Namespaces und Cgroups nutzt, um Prozesse isoliert auszuführen.',
    example: 'docker run -p 80:80 nginx'
  },
  {
    id: 'k8s',
    term: 'Kubernetes (K8s)',
    category: 'DevOps & Cloud',
    difficulty: 'Senior / Expert',
    simpleExplanation: 'Ein System zur automatischen Verwaltung von hunderten Docker-Containern (Orchestrierung).',
    expertExplanation: 'Open-Source Orchestrierungsplattform zur automatisierten Skalierung, Bereitstellung und Verwaltung von containerisierten Anwendungen.',
    example: 'kubectl apply -f deployment.yaml'
  },
  {
    id: 'von_neumann',
    term: 'Von-Neumann-Architektur',
    category: 'Hardware & Rechnerarchitektur',
    difficulty: 'Azubi / IHK',
    simpleExplanation: 'Der Grundaufbau fast aller modernen Computer: Steuerwerk, Rechenwerk (ALU), Speicher (RAM) und Ein-/Ausgabe teilen sich denselben Bus.',
    expertExplanation: 'Rechnerarchitektur-Referenzmodell von John von Neumann (1945), bei dem Programmcode und Nutzdaten im selben gemeinsamen Speicher adressiert werden (Von-Neumann-Flaschenhals).',
    example: 'Taktzyklus: Fetch (Befehl holen), Decode (Befehl entschlüsseln), Execute (ALU-Berechnung).'
  },
  {
    id: 'btree_index',
    term: 'B-Tree Index (Datenbanken)',
    category: 'Datenbanken',
    difficulty: 'Senior / Expert',
    simpleExplanation: 'Ein Inhaltsverzeichnis in einem dicken Buch, das der Datenbank hilft, Datensätze in Millisekunden statt Minuten zu finden.',
    expertExplanation: 'Selbstbalancierender Suchbaum (Balanced Tree), der Such-, Einfüge- und Löschoperationen in logarithmischer Zeit O(log n) garantiert.',
    example: 'CREATE INDEX idx_user_email ON users(email);'
  },
  {
    id: 'sm2_spaced_repetition',
    term: 'SuperMemo-2 (SM-2 Algorithmus)',
    category: 'Gamification & Psychologie',
    difficulty: 'Junior / Professional',
    simpleExplanation: 'Ein wissenschaftlicher Lern-Algorithmus, der berechnet, wann du einen Begriff kurz vor dem Vergessen wiederholen musst.',
    expertExplanation: 'Adaptiver Spaced-Repetition-Algorithmus von Piotr Wozniak basierend auf Wiederholungsintervallen und dynamischem Schwierigkeitsfaktor (Ease Factor EF >= 1.3).',
    example: 'Karten mit hoher Bewertung (5) werden erst in Wochen wieder vorgelegt, schwere Karten (1) am nächsten Tag.'
  },
  {
    id: 'zero_trust',
    term: 'Zero Trust Security Model',
    category: 'Security',
    difficulty: 'Senior / Expert',
    simpleExplanation: 'Sicherheits-Grundsatz: Traue niemandem blind – weder außerhalb noch innerhalb des Firmennetzwerks. Jede einzelne Anfrage muss sich ausweisen.',
    expertExplanation: 'Sicherheitsarchitektur nach dem Paradigma "Never Trust, Always Verify" mit Prinzipien wie Least Privilege Access, kontinuierlicher Authentifizierung (MFA) und Mikrosegmentierung.',
    example: 'Jeder API-Call erfordert ein gültiges, kurzlebiges JWT-Token mit rollenbasierten Scopes.'
  }
];
