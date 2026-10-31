// Wissensartikel (Tab „Wissen“): Hier stehen nur die Metadaten für Übersicht, Filter und
// Command Palette – sie liegen im Haupt-Bundle. Text, Abbildungen, Übungsaufgaben, Quiz und
// Quellen eines Artikels stehen in `src/data/topics/<id>.js` und werden erst im TopicReader
// nachgeladen (`loadTopicContent`). Die `id` bleibt stabil, weil sie in
// `userState.completedTopics` gespeichert wird.

/** Stufen des Filters (`DifficultyFilterBar`); jeder Artikel hat genau eine davon. */
export const TOPIC_LEVELS = ['Einsteiger', 'Azubi / IHK', 'Senior / Expert'];

/**
 * @typedef {object} TopicMeta
 * @property {string} id
 * @property {string} title
 * @property {string} category
 * @property {string} difficultyLevel - einer der Werte aus TOPIC_LEVELS
 * @property {string[]} targetRoles
 * @property {string} icon
 * @property {string} readTime
 * @property {string} summary
 */

/**
 * @typedef {object} TopicContent
 * @property {string[]} learningGoals
 * @property {string} content - Markdown (siehe utils/markdownEngine.js)
 * @property {string} [codeSnippet]
 * @property {string} [codeLanguage]
 * @property {Array<{ id: string, title: string, prompt: string, hints?: string[], solution: string }>} exercises
 * @property {Array<{ question: string, options: string[], correct: number, explanation: string }>} quiz
 * @property {string[]} [relatedLabs] - Tab-IDs aus labRegistry.js
 * @property {Array<{ title: string, url?: string, note?: string }>} sources
 * @property {string} sourcesCheckedOn - TT.MM.JJJJ
 */

/** @type {TopicMeta[]} */
export const TOPICS = [
  {
    id: 'it_basics',
    title: 'Computer-Grundlagen: Zahlensysteme, Datenmengen & Hardware',
    category: 'Grundlagen',
    difficultyLevel: 'Einsteiger',
    targetRoles: ['anfaenger', 'azubi', 'junior', 'pro'],
    icon: '💻',
    readTime: '9 Min',
    summary: 'EVA-Prinzip, Bit und Byte, Dual-, Hexadezimal- und Oktalsystem, KB vs. KiB, Speicherbedarf von Bildern und Audio, Übertragungszeiten und der Aufbau eines PCs.'
  },
  {
    id: 'text_markup_encodings',
    title: 'Zeichenkodierung & Datenformate (ASCII, UTF-8, JSON, XML)',
    category: 'Grundlagen',
    difficultyLevel: 'Einsteiger',
    targetRoles: ['anfaenger', 'azubi', 'junior', 'pro'],
    icon: '📄',
    readTime: '7 Min',
    summary: 'Wie aus Zeichen Bytes werden: ASCII, ISO-8859-1, Unicode und UTF-8 im Detail, Mojibake erkennen sowie die Austauschformate CSV, JSON, XML, YAML und Markdown.'
  },
  {
    id: 'subnetting_ipv4_ipv6',
    title: 'IP-Adressierung & Subnetting (IPv4 und IPv6)',
    category: 'Netzwerke',
    difficultyLevel: 'Azubi / IHK',
    targetRoles: ['azubi', 'junior', 'pro'],
    icon: '🧮',
    readTime: '8 Min',
    summary: 'CIDR, Netz- und Broadcastadresse, Subnetze gleicher Größe und VLSM, private Adressbereiche sowie IPv6-Notation, Präfixe und Adresstypen – mit Rechenweg wie in der Prüfung.'
  },
  {
    id: 'networking_osi',
    title: 'Netzwerke: OSI-Modell, TCP/IP, Protokolle & Geräte',
    category: 'Netzwerke',
    difficultyLevel: 'Azubi / IHK',
    targetRoles: ['azubi', 'junior', 'pro'],
    icon: '📡',
    readTime: '9 Min',
    summary: 'Die 7 OSI-Schichten und das TCP/IP-Modell, Kapselung, Switch vs. Router, TCP vs. UDP, Ports, ARP, DHCP und DNS – das Fundament jeder Netzwerkaufgabe.'
  },
  {
    id: 'raid_backup_speicher',
    title: 'Speicher, RAID & Datensicherung',
    category: 'IT-Systeme',
    difficultyLevel: 'Azubi / IHK',
    targetRoles: ['azubi', 'junior', 'pro'],
    icon: '🛢️',
    readTime: '9 Min',
    summary: 'HDD, SSD und NVMe, RAID 0/1/5/6/10 mit Kapazitätsrechnung, Voll-, inkrementelle und differenzielle Sicherung, Generationenprinzip, 3-2-1-Regel und USV.'
  },
  {
    id: 'virtualisierung_cloud',
    title: 'Virtualisierung, Container & Cloud-Computing',
    category: 'IT-Systeme',
    difficultyLevel: 'Azubi / IHK',
    targetRoles: ['azubi', 'junior', 'pro'],
    icon: '☁️',
    readTime: '8 Min',
    summary: 'Hypervisor Typ 1 und 2, virtuelle Maschinen vs. Container, Docker-Grundbegriffe, IaaS/PaaS/SaaS, Public/Private/Hybrid Cloud und das Shared-Responsibility-Modell.'
  },
  {
    id: 'datenschutz_dsgvo_bsi',
    title: 'Datenschutz & Informationssicherheit (DSGVO, TOM, BSI)',
    category: 'Sicherheit & Recht',
    difficultyLevel: 'Azubi / IHK',
    targetRoles: ['anfaenger', 'azubi', 'junior', 'pro'],
    icon: '🔐',
    readTime: '9 Min',
    summary: 'Datenschutz vs. Datensicherheit vs. Datensicherung, Schutzziele, DSGVO-Grundsätze und Betroffenenrechte, technische und organisatorische Maßnahmen, Schutzbedarf und BSI IT-Grundschutz.'
  },
  {
    id: 'kryptografie_grundlagen',
    title: 'Kryptografie: Verschlüsselung, Hashes & Signaturen',
    category: 'Sicherheit & Recht',
    difficultyLevel: 'Azubi / IHK',
    targetRoles: ['azubi', 'junior', 'pro'],
    icon: '🔑',
    readTime: '8 Min',
    summary: 'Symmetrische, asymmetrische und hybride Verschlüsselung, Hashfunktionen, digitale Signaturen, Zertifikate und PKI sowie der TLS-Handshake im Überblick.'
  },
  {
    id: 'it_security_advanced',
    title: 'Web-Sicherheit: OWASP Top 10, Injection, XSS & Passwort-Hashing',
    category: 'Sicherheit & Recht',
    difficultyLevel: 'Senior / Expert',
    targetRoles: ['azubi', 'junior', 'pro'],
    icon: '🛡️',
    readTime: '8 Min',
    summary: 'Die OWASP Top 10:2025, SQL-Injection und Prepared Statements, Cross-Site Scripting, CSRF, sichere Passwortspeicherung mit Argon2/bcrypt und Security-Header.'
  },
  {
    id: 'algorithmen_datenstrukturen',
    title: 'Algorithmen, Pseudocode & Struktogramme',
    category: 'Programmierung',
    difficultyLevel: 'Azubi / IHK',
    targetRoles: ['azubi', 'junior', 'pro'],
    icon: '🧩',
    readTime: '11 Min',
    summary: 'Kontrollstrukturen in Pseudocode, Struktogramm und PAP, Schreibtischtest, Such- und Sortierverfahren, Rekursion, O-Notation und die wichtigsten Datenstrukturen.'
  },
  {
    id: 'oop_uml',
    title: 'Objektorientierung & UML-Diagramme',
    category: 'Programmierung',
    difficultyLevel: 'Azubi / IHK',
    targetRoles: ['azubi', 'junior', 'pro'],
    icon: '🧱',
    readTime: '9 Min',
    summary: 'Klasse und Objekt, Kapselung, Vererbung, Polymorphie, Interfaces, Assoziation/Aggregation/Komposition sowie Klassen-, Sequenz-, Aktivitäts- und Anwendungsfalldiagramm.'
  },
  {
    id: 'python_master_course',
    title: 'Python-Grundkurs: von Variablen bis Klassen',
    category: 'Programmierung',
    difficultyLevel: 'Einsteiger',
    targetRoles: ['anfaenger', 'azubi', 'junior', 'pro'],
    icon: '🐍',
    readTime: '9 Min',
    summary: 'Datentypen, Strings, Listen, Dictionaries und Sets, Verzweigungen und Schleifen, Funktionen, Fehlerbehandlung, Dateien und Klassen – mit vielen Beispielen zum Ausprobieren.'
  },
  {
    id: 'js_programming',
    title: 'Programmierung mit JavaScript (ES6+)',
    category: 'Programmierung',
    difficultyLevel: 'Azubi / IHK',
    targetRoles: ['azubi', 'junior', 'pro'],
    icon: '⚡',
    readTime: '9 Min',
    summary: 'let/const, Datentypen und Vergleiche, Funktionen und Arrow Functions, Array-Methoden, Objekte und Destructuring, DOM und Events sowie fetch mit async/await.'
  },
  {
    id: 'javascript_event_loop_deep',
    title: 'JavaScript Event Loop, Microtasks & Async Performance',
    category: 'Programmierung',
    difficultyLevel: 'Senior / Expert',
    targetRoles: ['azubi', 'junior', 'pro'],
    icon: '🔁',
    readTime: '6 Min',
    summary: 'Call Stack, Web APIs, Microtask- und Task-Queue, Rendering, typische Ausgabereihenfolgen und wie man lange Aufgaben aufteilt, damit die Oberfläche flüssig bleibt.'
  },
  {
    id: 'web_html_css',
    title: 'Webentwicklung: HTML5 & CSS3',
    category: 'Webentwicklung',
    difficultyLevel: 'Einsteiger',
    targetRoles: ['anfaenger', 'azubi', 'junior', 'pro'],
    icon: '🌐',
    readTime: '9 Min',
    summary: 'Semantisches HTML, Formulare und Barrierefreiheit, CSS-Selektoren und Spezifität, Box-Modell, Flexbox, Grid und Responsive Design mit Media Queries.'
  },
  {
    id: 'rest_graphql_apis',
    title: 'HTTP, REST, GraphQL & gRPC',
    category: 'Webentwicklung',
    difficultyLevel: 'Senior / Expert',
    targetRoles: ['azubi', 'junior', 'pro'],
    icon: '🔌',
    readTime: '8 Min',
    summary: 'Aufbau von HTTP-Anfragen, sichere und idempotente Methoden, Statuscodes, REST-Prinzipien und Ressourcen-Design, Over- und Underfetching mit GraphQL sowie gRPC.'
  },
  {
    id: 'sql_databases',
    title: 'Relationale Datenbanken & SQL',
    category: 'Datenbanken',
    difficultyLevel: 'Azubi / IHK',
    targetRoles: ['azubi', 'junior', 'pro'],
    icon: '🗄️',
    readTime: '9 Min',
    summary: 'ER-Modell und Kardinalitäten, Primär- und Fremdschlüssel, DDL/DML/DQL, JOIN-Arten, Aggregatfunktionen mit GROUP BY und HAVING, Unterabfragen sowie Transaktionen und ACID.'
  },
  {
    id: 'db_normalization_masterclass',
    title: 'Datenbank-Normalisierung (1NF, 2NF, 3NF)',
    category: 'Datenbanken',
    difficultyLevel: 'Azubi / IHK',
    targetRoles: ['azubi', 'junior', 'pro'],
    icon: '📊',
    readTime: '8 Min',
    summary: 'Anomalien, funktionale Abhängigkeit, die drei Normalformen an einem durchgehenden Prüfungsbeispiel, BCNF und wann bewusste Denormalisierung sinnvoll ist.'
  },
  {
    id: 'softwaretest_qualitaet',
    title: 'Softwarequalität & Testen',
    category: 'Softwareentwicklung',
    difficultyLevel: 'Azubi / IHK',
    targetRoles: ['azubi', 'junior', 'pro'],
    icon: '🧪',
    readTime: '8 Min',
    summary: 'Qualitätsmerkmale nach ISO/IEC 25010, Teststufen und Testpyramide, Black-Box- und White-Box-Verfahren, Äquivalenzklassen und Grenzwerte, Unit-Tests und TDD.'
  },
  {
    id: 'git_workflows_mastery',
    title: 'Versionsverwaltung mit Git',
    category: 'Softwareentwicklung',
    difficultyLevel: 'Azubi / IHK',
    targetRoles: ['azubi', 'junior', 'pro'],
    icon: '🌿',
    readTime: '8 Min',
    summary: 'Arbeitsverzeichnis, Staging Area und Repository, die wichtigsten Befehle, Branches, Merge vs. Rebase, Konflikte lösen, Workflows und Conventional Commits.'
  },
  {
    id: 'projektmanagement_vorgehensmodelle',
    title: 'Projektmanagement & Vorgehensmodelle',
    category: 'Projekt & Wirtschaft',
    difficultyLevel: 'Azubi / IHK',
    targetRoles: ['azubi', 'junior', 'pro'],
    icon: '📋',
    readTime: '10 Min',
    summary: 'Magisches Dreieck, Lasten- und Pflichtenheft, Wasserfall, V-Modell und Scrum, Netzplan mit kritischem Pfad, Gantt-Diagramm, Risikoanalyse und SMART-Ziele.'
  },
  {
    id: 'wirtschaftlichkeit_kalkulation',
    title: 'Wirtschaftlichkeit: Kalkulation, Amortisation & Nutzwertanalyse',
    category: 'Projekt & Wirtschaft',
    difficultyLevel: 'Azubi / IHK',
    targetRoles: ['azubi', 'junior', 'pro'],
    icon: '💶',
    readTime: '10 Min',
    summary: 'Fixe und variable Kosten, Deckungsbeitrag und Break-even, Amortisationsrechnung, Make-or-Buy, Angebotsvergleich mit Skonto, Nutzwertanalyse und ABC-Analyse.'
  },
  {
    id: 'wiso_ausbildung_arbeitsrecht',
    title: 'WISO: Ausbildung, Arbeitsrecht & Sozialversicherung',
    category: 'Projekt & Wirtschaft',
    difficultyLevel: 'Azubi / IHK',
    targetRoles: ['anfaenger', 'azubi', 'junior', 'pro'],
    icon: '⚖️',
    readTime: '12 Min',
    summary: 'Berufsausbildungsvertrag und BBiG, Jugendarbeitsschutz, Arbeitszeit und Urlaub, Kündigungsfristen, Mitbestimmung, die fünf Säulen der Sozialversicherung und die Lohnabrechnung (Stand 2026).'
  },
  {
    id: 'deep_learning_coursera',
    title: 'KI-Grundlagen: Machine Learning, neuronale Netze & LLMs',
    category: 'Künstliche Intelligenz',
    difficultyLevel: 'Senior / Expert',
    targetRoles: ['azubi', 'junior', 'pro'],
    icon: '🤖',
    readTime: '10 Min',
    summary: 'KI, Machine Learning und Deep Learning abgegrenzt, Lernarten, Training mit Verlustfunktion und Gradientenabstieg, Overfitting, CNN, Transformer, LLMs, RAG und die Risikoklassen des EU AI Act.'
  }
];

const CONTENT_LOADERS = import.meta.glob('./topics/*.js');

/**
 * Lädt Text, Aufgaben, Quiz und Quellen eines Artikels nach.
 * @param {string} id
 * @returns {Promise<TopicContent | null>} `null`, wenn es den Artikel nicht gibt
 */
export async function loadTopicContent(id) {
  const loader = CONTENT_LOADERS[`./topics/${id}.js`];
  if (!loader) return null;
  const mod = /** @type {{ default: TopicContent }} */ (await loader());
  return mod.default;
}

/** Für Tests: alle Artikel-IDs, zu denen eine Inhaltsdatei existiert. */
export const TOPIC_CONTENT_IDS = Object.keys(CONTENT_LOADERS).map((p) => p.replace('./topics/', '').replace(/\.js$/, ''));
