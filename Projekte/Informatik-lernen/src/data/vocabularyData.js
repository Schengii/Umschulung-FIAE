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
  }
];
