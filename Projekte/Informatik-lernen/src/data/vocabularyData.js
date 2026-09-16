export const VOCABULARY_LIST = [
  {
    id: 1,
    term: 'Retrieval-Augmented Generation (RAG)',
    german: 'Erweiterte Generierung durch Datenabruf',
    category: 'KI & Trend 2026',
    difficulty: 'Senior / Expert',
    definition: 'Kombination aus Dokumentensuche in Vektordatenbanken und LLM-Textgenerierung zur Vermeidung von Halluzinationen.',
    example: 'RAG ermöglicht es der KI, Antworten auf Basis interner Unternehmensdaten zu geben.'
  },
  {
    id: 2,
    term: 'Zero Trust Architecture',
    german: 'Null-Vertrauen Sicherheitsarchitektur',
    category: 'Cybersecurity',
    difficulty: 'Azubi & Senior',
    definition: 'Sicherheitskonzept: "Niemals vertrauen, immer verifizieren". Jede Anfrage muss authentifiziert und autorisiert werden.',
    example: 'Zero Trust fordert Multi-Faktor-Authentifizierung (MFA) für alle Netzwerkzugriffe.'
  },
  {
    id: 3,
    term: 'Microservices & Serverless',
    german: 'Entkoppelte Kleinanwendungen & Serverlosigkeit',
    category: 'Cloud & Architecture',
    difficulty: 'Senior / Expert',
    definition: 'Architekturstil, bei dem Software in unabhängige Services aufgeteilt wird, die über APIs kommunizieren.',
    example: 'Serverless-Dienste wie AWS Lambda skalieren automatisch nach Bedarf.'
  },
  {
    id: 4,
    term: 'Object-Relational Mapping (ORM)',
    german: 'Objekt-Relationale Abbildung',
    category: 'Datenbanken',
    difficulty: 'Azubi / IHK',
    definition: 'Technik zur Abbildung von Datenbanktabellen in objektorientierte Klassen der Programmiersprache.',
    example: 'Prisma oder Hibernate sind ORM-Frameworks für TypeScript und Java.'
  },
  {
    id: 5,
    term: 'Continuous Integration / Continuous Deployment (CI/CD)',
    german: 'Kontinuierliche Integration & Bereitstellung',
    category: 'DevOps & Tools',
    difficulty: 'Junior & Senior',
    definition: 'Automatisierte Pipelines zum Testen, Bauen und Veröffentlichen von Software-Updates.',
    example: 'GitHub Actions führt bei jedem Git Push automatisch Unit-Tests aus.'
  },
  {
    id: 6,
    term: 'Idempotency',
    german: 'Idempotenz (Wiederholungsstabilität)',
    category: 'Web & APIs',
    difficulty: 'Senior / Expert',
    definition: 'Eigenschaft einer Operation, bei mehrfacher Ausführung mit denselben Parametern stets denselben Systemzustand zu erzeugen (z. B. HTTP GET, PUT, DELETE).',
    example: 'Wiederholte Bezahl-Requests mit demselben Idempotency-Key verhindern doppelte Kreditkarten-Abbuchungen.'
  },
  {
    id: 7,
    term: 'Infrastructure as Code (IaC)',
    german: 'Infrastruktur als Code',
    category: 'DevOps & Cloud',
    difficulty: 'Azubi & Senior',
    definition: 'Verwaltung und Bereitstellung von Rechenzentren, Netzwerken und VMs über maschinenlesbare Definitionsdateien (z. B. Terraform, Ansible) statt manueller Konfiguration.',
    example: 'Terraform ermöglicht das versionierte Ausrollen von Cloud-Infrastruktur per git push.'
  },
  {
    id: 8,
    term: 'Event Sourcing & CQRS',
    german: 'Ereignisbasierte Zustandsspeicherung & Befehls-/Abfrage-Trennung',
    category: 'Cloud & Architecture',
    difficulty: 'Senior / Expert',
    definition: 'CQRS trennt Lese- (Query) und Schreibmodelle (Command). Event Sourcing speichert Zustandsänderungen als lückenlose Kette unveränderlicher Ereignisse.',
    example: 'Bankkonten nutzen Event Sourcing: Der Kontostand ist die Summe aller historischen Überweisungs-Events.'
  },
  {
    id: 9,
    term: 'Race Condition & Deadlock',
    german: 'Wettlaufsituation & Verklemmung',
    category: 'Systemprogrammierung',
    difficulty: 'Senior / Expert',
    definition: 'Race Condition: Unerwartetes Verhalten durch unkontrollierten gleichzeitigen Datenzugriff. Deadlock: Zwei Threads blockieren sich gegenseitig beim Warten auf Ressourcen.',
    example: 'Mutex-Locks und Semaphoren verhindern Race Conditions in Multithreading-Programmen.'
  },
  {
    id: 10,
    term: 'Model-View-Controller (MVC)',
    german: 'Architekturmuster zur Trennung von Daten, Logik & Präsentation',
    category: 'Software Engineering',
    difficulty: 'Azubi / IHK',
    definition: 'Klassisches Entwurfsmuster: Model verwaltet Daten, View rendert die Benutzeroberfläche, Controller vermittelt Eingaben.',
    example: 'Spring Boot, ASP.NET MVC und Django setzen auf das MVC-Muster.'
  },
  {
    id: 11,
    term: 'Nutzwertanalyse (NWA)',
    german: 'Punktwertverfahren / Scoring-Modell',
    category: 'Projektmanagement & IHK',
    difficulty: 'Azubi / IHK',
    definition: 'Strukturierte Methode zur rationalen Entscheidungsfindung bei mehreren Handlungsalternativen anhand gewichteter Kriterien und K.O.-Schwellen.',
    example: 'In der Projektdokumentation begründet die Nutzwertanalyse die Auswahl des Frameworks oder Cloud-Anbieters.'
  },
  {
    id: 12,
    term: 'RAID (Redundant Array of Independent Disks)',
    german: 'Redundante Anordnung unabhängiger Festplatten',
    category: 'Hardware & Storage',
    difficulty: 'Azubi / IHK',
    definition: 'Verbund mehrerer physischer Massenspeicher zu einem logischen Laufwerk zur Steigerung der Ausfallsicherheit (Redundanz) oder des Datendurchsatzes (Performance).',
    example: 'RAID 5 kombiniert Striping mit verteilter Parität und übersteht den Ausfall einer beliebigen Festplatte.'
  },
  {
    id: 13,
    term: 'Variable Length Subnet Masking (VLSM)',
    german: 'Subnetzmaskierung mit variabler Länge',
    category: 'Netzwerke',
    difficulty: 'Azubi / IHK',
    definition: 'Verfahren zur effizienten Aufteilung eines IP-Netzwerks in Subnetze unterschiedlicher Größe basierend auf dem exakten Host-Bedarf jeder Abteilung.',
    example: 'Mit VLSM erhält eine Entwicklungsabteilung ein /26 Netz (62 Hosts), während der Router-Uplink nur ein /30 Netz (2 Hosts) belegt.'
  },
  {
    id: 14,
    term: 'Maximum Transmission Unit (MTU)',
    german: 'Maximale Übertragungseinheit',
    category: 'Netzwerke',
    difficulty: 'Junior / Professional',
    definition: 'Die maximale Paketgröße in Bytes, die auf Schicht 2 (Data Link) ohne IP-Fragmentierung übertragen werden kann (Standard-Ethernet = 1500 Bytes).',
    example: 'VPN-Tunnel (z. B. WireGuard oder IPsec) verringern die effektive MTU durch zusätzliche Verschlüsselungs-Header.'
  },
  {
    id: 15,
    term: 'JSON Web Token (JWT)',
    german: 'Kompaktes, URL-sicheres Token-Format',
    category: 'Security & Auth',
    difficulty: 'Junior / Professional',
    definition: 'Offener Standard (RFC 7519) zur sicheren Übertragung von Claims zwischen Parteien, bestehend aus Header, Payload und kryptografischer Signatur.',
    example: 'Nach erfolgreichem OAuth2 Login sendet der Client das JWT im Authorization: Bearer Header mit.'
  }
];
