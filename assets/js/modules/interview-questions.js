/**
 * @file interview-questions.js
 * @description Fragenpool des Interview-Trainers (interview.html), zweisprachig, mit Musterantworten und Stichwörtern.
 * Reine Daten, damit interview.js nur Ablauf und Darstellung enthält.
 */

export const INTERVIEW_QUESTIONS = [
    // --- FACHFRAGEN ---
    {
        id: 'tech_oop',
        category: 'tech',
        questionDe: 'Können Sie die drei Hauptsäulen der objektorientierten Programmierung (OOP) erklären?',
        questionEn: 'Can you explain the three main pillars of Object-Oriented Programming (OOP)?',
        keywordsDe: ['vererbung', 'polymorphie', 'kapselung', 'abstraktion', 'klassen', 'objekte'],
        keywordsEn: ['inheritance', 'polymorphism', 'encapsulation', 'abstraction', 'classes', 'objects'],
        modelAnswerDe:
            'Die Hauptsäulen sind: 1. Kapselung (Verbergen interner Zustände und Methoden über Sichtbarkeiten wie private/public), 2. Vererbung (Weitergabe von Eigenschaften und Methoden von Basisklassen an abgeleitete Klassen), und 3. Polymorphie (Vielgestaltigkeit, z.B. das Überschreiben von Methoden, sodass Objekte zur Laufzeit unterschiedlich reagieren). Manchmal wird Abstraktion als vierte Säule genannt.',
        modelAnswerEn:
            'The main pillars are: 1. Encapsulation (hiding internal states and exposing them via public methods), 2. Inheritance (passing attributes and methods from base classes to derived classes), and 3. Polymorphism (ability of different classes to respond to the same message, e.g. method overriding).',
    },
    {
        id: 'tech_cleancode',
        category: 'tech',
        questionDe: 'Was bedeutet das DRY-Prinzip und warum ist Clean Code wichtig?',
        questionEn: 'What does the DRY principle mean and why is clean code important?',
        keywordsDe: ['dry', 'do not repeat yourself', 'redundanz', 'wartbarkeit', 'wiederverwendung', 'lesbarkeit'],
        keywordsEn: ['dry', "don't repeat yourself", 'redundancy', 'maintainability', 'reuse', 'readability'],
        modelAnswerDe:
            "DRY steht für 'Don't Repeat Yourself'. Es besagt, dass Code-Duplikate vermieden werden sollten, indem Funktionalitäten in wiederverwendbare Funktionen oder Klassen ausgelagert werden. Clean Code sorgt dafür, dass Software langfristig wartbar, lesbar und erweiterbar bleibt, wodurch Entwicklungskosten und Fehler minimiert werden.",
        modelAnswerEn:
            "DRY stands for 'Don't Repeat Yourself'. It dictates that duplication should be avoided by extracting repeated logic into reusable functions or classes. Clean code ensures software is readable, maintainable, and extensible, minimizing bugs and future development costs.",
    },
    {
        id: 'tech_db',
        category: 'tech',
        questionDe: 'Was versteht man unter den Normalformen in relationalen Datenbanken und wozu dienen sie?',
        questionEn: 'What is database normalization in relational databases and what is its purpose?',
        keywordsDe: ['normalform', 'redundanz', 'anomalie', '1nf', '2nf', '3nf', 'atomar', 'primärschlüssel'],
        keywordsEn: ['normalization', 'redundancy', 'anomaly', '1nf', '2nf', '3nf', 'atomic', 'primary key'],
        modelAnswerDe:
            'Datenbank-Normalisierung strukturiert Tabellen so, dass Redundanzen minimiert und Datenanomalien (Einfüge-, Änderungs-, Lösch-Anomalien) verhindert werden. Die 1. Normalform erfordert atomare Werte. Die 2. Normalform verlangt, dass alle Nicht-Schlüsselattribute voll vom Primärschlüssel abhängen. Die 3. Normalform verbietet transitive Abhängigkeiten zwischen Nicht-Schlüsselattributen.',
        modelAnswerEn:
            'Normalization organizes tables to minimize data redundancy and prevent anomalies. 1NF requires atomic values. 2NF requires all non-key attributes to fully depend on the primary key. 3NF prohibits transitive dependencies between non-key attributes.',
    },
    {
        id: 'tech_git',
        category: 'tech',
        questionDe: 'Wie erklären Sie einen typischen Git-Branching-Workflow (z. B. Git Flow)?',
        questionEn: 'How do you explain a typical Git branching workflow (e.g., Git Flow)?',
        keywordsDe: ['main', 'master', 'develop', 'feature', 'release', 'hotfix', 'merge', 'pull request'],
        keywordsEn: ['main', 'master', 'develop', 'feature', 'release', 'hotfix', 'merge', 'pull request'],
        modelAnswerDe:
            "Bei Git Flow gibt es langlebige Branches wie 'main' (für produktiven, stabilen Code) und 'develop' (für den aktuellen Entwicklungsstand). Neue Features werden auf temporären 'feature/'-Branches entwickelt und per Pull Request in 'develop' gemergt. Für Releases nutzt man 'release/'-Branches, und kritische Fehler im Live-System werden über 'hotfix/'-Branches behoben.",
        modelAnswerEn:
            "In Git Flow, there are long-lived branches: 'main' (stable production release) and 'develop' (integration branch). New features are built on 'feature/' branches and merged via Pull Request. 'release/' branches prepare production builds, and live bugs are patched using 'hotfix/' branches.",
    },

    // --- PROJEKTFRAGEN ---
    {
        id: 'proj_ecochef',
        category: 'project',
        questionDe:
            "Welche Technologien haben Sie bei Ihrem Abschlussprojekt 'EcoChef' eingesetzt und wie funktioniert die CO2-Berechnung?",
        questionEn:
            "What technologies did you use for your capstone project 'EcoChef' and how does the CO2 calculation work?",
        keywordsDe: ['java', 'spring boot', 'postgresql', 'thymeleaf', 'datenbank', 'zutaten', 'ökologisch', 'co2'],
        keywordsEn: ['java', 'spring boot', 'postgresql', 'thymeleaf', 'database', 'ingredients', 'ecological', 'co2'],
        modelAnswerDe:
            'EcoChef basiert im Backend auf Java mit Spring Boot und nutzt PostgreSQL als relationale Datenbank. Das Frontend verwendet Thymeleaf mit modernem CSS3. Die CO₂-Berechnung läuft über eine Datenbanktabelle mit Emissionswerten pro Gramm für verschiedene Lebensmittelkategorien. Bei der Rezeptplanung werden die Zutatenmengen multipliziert und addiert, um den ökologischen Fußabdruck live anzuzeigen.',
        modelAnswerEn:
            'EcoChef uses Java with Spring Boot on the backend, PostgreSQL as a database, and Thymeleaf with CSS3 for the user interface. The CO₂ calculation matches recipe ingredients against a database of emissions factors per gram, aggregating the values to estimate the overall footprint.',
    },
    {
        id: 'proj_elektrocheck',
        category: 'project',
        questionDe: "Wie arbeitet die KI bei Ihrem Projekt 'ElektroCheck AI' und wie läuft das PDF-Parsing ab?",
        questionEn: "How does the AI work in 'ElektroCheck AI' and how is PDF parsing handled?",
        keywordsDe: ['openai', 'pdf', 'parsing', 'extraktion', 'anomalie', 'mängel', 'react', 'vite'],
        keywordsEn: ['openai', 'pdf', 'parsing', 'extraction', 'anomalies', 'defects', 'react', 'vite'],
        modelAnswerDe:
            'Das Frontend ist als React/Vite-Applikation aufgebaut. PDFs von Prüfprotokollen werden clientseitig über PDF-Bibliotheken eingelesen und strukturiert. Der extrahierte Text wird an die OpenAI-API (oder eine Mock-Schnittstelle) gesendet. Die KI analysiert den Inhalt nach kritischen Mängeln und DGUV V3 Fristenüberschreitungen und erzeugt daraus konkrete To-Do-Maßnahmenpläne.',
        modelAnswerEn:
            "Built as a React/Vite app, it parses uploaded PDF inspection sheets client-side. The extracted textual report is sent to OpenAI's API. The AI scans the safety report to pinpoint failures or overdue testing deadlines, automatically compile lists of anomalies, and suggest action items.",
    },

    // --- PERSONALFRAGEN ---
    {
        id: 'pers_reha',
        category: 'personal',
        questionDe:
            'Sie haben eine Umschulung absolviert. Warum haben Sie sich für den Quereinstieg in die Softwareentwicklung entschieden?',
        questionEn: 'You completed a retraining program. Why did you decide to switch to software development?',
        keywordsDe: [
            'umschulung',
            'quereinstieg',
            'leidenschaft',
            'problemlösung',
            'zukunft',
            'motivation',
            'interesse',
        ],
        keywordsEn: ['retraining', 'career change', 'passion', 'problem solving', 'future', 'motivation', 'interest'],
        modelAnswerDe:
            'Die Umschulung bot mir die ideale Chance, meine Affinität zu Technik und strukturiertem Denken zu professionalisieren. An der Softwareentwicklung reizt mich besonders die kreative Problemlösung und die Möglichkeit, nützliche Applikationen von Grund auf selbst zu erschaffen. Mein vorheriges Berufsleben bringt zudem wichtige Soft Skills und Lebenserfahrung mit ein.',
        modelAnswerEn:
            'The retraining program allowed me to channel my affinity for technology and logical analysis into a professional career. I love software development for its creative problem-solving and the ability to build useful products. My previous professional background also provides maturity and team experience.',
    },
    {
        id: 'pers_team',
        category: 'personal',
        questionDe:
            'Wie verhalten Sie sich, wenn es im Entwicklerteam unterschiedliche Meinungen über ein technisches Design gibt?',
        questionEn: 'How do you behave when there are differing opinions about technical design in the dev team?',
        keywordsDe: ['kommunikation', 'diskussion', 'argumente', 'kompromiss', 'team', 'abwägen', 'konstruktiv'],
        keywordsEn: ['communication', 'discussion', 'arguments', 'compromise', 'team', 'evaluate', 'constructive'],
        modelAnswerDe:
            'Ich bleibe stets sachlich und konstruktiv. Zuerst versuche ich, die Perspektive des anderen voll zu verstehen. Dann vergleichen wir die Argumente (z.B. Wartbarkeit, Performance, Zeitaufwand) objektiv. Wenn keine Einigkeit erzielt wird, können wir kleine Prototypen bauen oder im Team abstimmen, wobei ich mich getroffenen Teamentscheidungen stets loyal anschließe.',
        modelAnswerEn:
            'I maintain a constructive, factual approach. I listen to understand their point of view first. Then, we objectively evaluate pros and cons (maintainability, scalability, speed). If stuck, we can create quick prototypes or seek feedback from senior peers, always staying aligned with the final team decision.',
    },

    // --- IHK-FRAGEN ---
    {
        id: 'ihk_presentation',
        category: 'ihk',
        questionDe:
            'Wie war Ihre Abschlusspräsentation aufgebaut und auf welche kritischen Punkte haben Sie fokussiert?',
        questionEn: 'How was your final presentation structured and which critical points did you focus on?',
        keywordsDe: ['projektarbeit', 'struktur', 'ziel', 'umsetzung', 'architektur', 'wirtschaftlichkeit', 'fazit'],
        keywordsEn: ['project work', 'structure', 'goal', 'implementation', 'architecture', 'economic', 'conclusion'],
        modelAnswerDe:
            'Meine Präsentation folgte dem typischen IHK-Muster: 1. Projektumfeld & Zielsetzung, 2. Analyse (Ist/Soll, Use Cases), 3. Entwurf & Systemarchitektur, 4. Implementierung (Highlight-Code), 5. Qualitätssicherung (Testing) und 6. Wirtschaftliche Analyse (Amortisationszeit). Der Fokus lag darauf, zu zeigen, dass ich als FIAE fundierte fachliche Entscheidungen treffen kann.',
        modelAnswerEn:
            'My presentation followed standard IHK guidelines: 1. Project environment & goals, 2. Analysis (Actual vs Target, requirements), 3. System architecture & design, 4. Implementation highlights, 5. Quality assurance (testing), and 6. Economic evaluation (amortization). The focus was on demonstrating sound decision-making as a developer.',
    },
    {
        id: 'ihk_amortisation',
        category: 'ihk',
        questionDe: 'Können Sie erklären, wie eine Amortisationsrechnung für ein Softwareprojekt durchgeführt wird?',
        questionEn: 'Can you explain how an amortization calculation is performed for a software project?',
        keywordsDe: ['kosten', 'einsparung', 'entwicklungskosten', 'zeitraum', 'investition', 'wirtschaftlich'],
        keywordsEn: ['costs', 'savings', 'development costs', 'timeframe', 'investment', 'economic'],
        modelAnswerDe:
            'Die Amortisationsrechnung ermittelt den Zeitpunkt, ab dem die finanziellen Einsparungen oder Erlöse einer Software die Entwicklungskosten übersteigen. Dazu berechnet man die initialen Kosten (Entwicklerstunden, Lizenzen, Hardware) und stellt diese den laufenden Einsparungen (z.B. Zeitersparnis durch Automatisierung, Lizenzkosten-Einsparung) pro Monat/Jahr gegenüber.',
        modelAnswerEn:
            "An amortization calculation determines the break-even point where the project's cumulative savings or revenue exceed its total development costs. You calculate initial expenditures (hours, licenses, infrastructure) and offset them against recurring monthly or annual cost reductions.",
    },

    // --- NEUE IHK-FACHFRAGEN (IT-Sicherheit, Netzwerke, DB-Design, Agile) ---
    {
        id: 'ihk_itsecurity',
        category: 'ihk',
        questionDe:
            'Welche Maßnahmen zur IT-Sicherheit kennen Sie und was ist der Unterschied zwischen symmetrischer und asymmetrischer Verschlüsselung?',
        questionEn:
            'What IT security measures do you know and what is the difference between symmetric and asymmetric encryption?',
        keywordsDe: [
            'verschlüsselung',
            'symmetrisch',
            'asymmetrisch',
            'ssl',
            'tls',
            'https',
            'firewall',
            'authentifizierung',
            'passwort',
            'rsa',
            'aes',
        ],
        keywordsEn: [
            'encryption',
            'symmetric',
            'asymmetric',
            'ssl',
            'tls',
            'https',
            'firewall',
            'authentication',
            'password',
            'rsa',
            'aes',
        ],
        modelAnswerDe:
            'IT-Sicherheitsmaßnahmen umfassen: Firewalls (Netzwerkkontrolle), Verschlüsselung (Datenschutz), starke Authentifizierung (MFA), regelmäßige Updates und Backups sowie Zugriffsrechte-Management. Symmetrische Verschlüsselung (z.B. AES) nutzt denselben Schlüssel zum Ver- und Entschlüsseln – schnell, aber der Schlüsselaustausch ist problematisch. Asymmetrische Verschlüsselung (z.B. RSA) nutzt ein Schlüsselpaar (Public/Private Key) – sicherer für den Schlüsselaustausch, aber langsamer. HTTPS kombiniert beide: asymmetrisch für den Handshake, symmetrisch für die Datenübertragung.',
        modelAnswerEn:
            'IT security measures include: firewalls, encryption, strong authentication (MFA), regular updates, backups, and access rights management. Symmetric encryption (e.g. AES) uses the same key for encryption and decryption — fast but key exchange is a challenge. Asymmetric encryption (e.g. RSA) uses a key pair (public/private) — safer for key exchange but slower. HTTPS combines both: asymmetric for the handshake, symmetric for data transfer.',
    },
    {
        id: 'ihk_osi',
        category: 'ihk',
        questionDe: 'Erklären Sie das OSI-Schichtenmodell und nennen Sie Protokolle für mindestens drei Schichten.',
        questionEn: 'Explain the OSI layer model and name protocols for at least three layers.',
        keywordsDe: [
            'osi',
            'schicht',
            'physical',
            'transport',
            'anwendung',
            'tcp',
            'ip',
            'http',
            'ethernet',
            'protokoll',
        ],
        keywordsEn: [
            'osi',
            'layer',
            'physical',
            'transport',
            'application',
            'tcp',
            'ip',
            'http',
            'ethernet',
            'protocol',
        ],
        modelAnswerDe:
            'Das OSI-Modell beschreibt Netzwerkkommunikation in 7 Schichten: 1. Bitübertragung (Physical) – z.B. Ethernet-Kabel, WLAN-Signal. 2. Sicherung (Data Link) – z.B. Ethernet, MAC-Adressen. 3. Vermittlung (Network) – z.B. IP (IPv4/IPv6). 4. Transport – z.B. TCP (zuverlässig), UDP (schnell, unzuverlässig). 5. Sitzung (Session), 6. Darstellung (Presentation) – z.B. TLS/SSL. 7. Anwendung (Application) – z.B. HTTP, HTTPS, FTP, SMTP.',
        modelAnswerEn:
            'The OSI model breaks network communication into 7 layers: 1. Physical (e.g., Ethernet cables, WLAN). 2. Data Link (e.g., Ethernet, MAC addresses). 3. Network (e.g., IP). 4. Transport (e.g., TCP for reliability, UDP for speed). 5. Session. 6. Presentation (e.g., TLS/SSL). 7. Application (e.g., HTTP, HTTPS, FTP, SMTP).',
    },
    {
        id: 'ihk_erd',
        category: 'ihk',
        questionDe:
            'Was ist ein Entity-Relationship-Diagramm (ERD) und wie modelliert man eine Viele-zu-Viele-Beziehung?',
        questionEn: 'What is an Entity-Relationship Diagram (ERD) and how do you model a many-to-many relationship?',
        keywordsDe: [
            'entity',
            'relation',
            'kardinalität',
            'viele-zu-viele',
            'n:m',
            'zwischentabelle',
            'fremdschlüssel',
            'primärschlüssel',
            'attribut',
        ],
        keywordsEn: [
            'entity',
            'relation',
            'cardinality',
            'many-to-many',
            'n:m',
            'junction table',
            'foreign key',
            'primary key',
            'attribute',
        ],
        modelAnswerDe:
            "Ein ERD modelliert Entitäten (z.B. Student, Kurs) mit ihren Attributen und Beziehungen (Relationen) inkl. Kardinalitäten (1:1, 1:N, N:M). Eine N:M-Beziehung (z.B. Student belegt mehrere Kurse, Kurs hat mehrere Studenten) lässt sich in relationalen Datenbanken nicht direkt abbilden. Sie wird durch eine Zwischentabelle (z.B. 'Belegung') aufgelöst, die die Primärschlüssel beider Entitäten als Fremdschlüssel enthält.",
        modelAnswerEn:
            "An ERD models entities (e.g. Student, Course) with their attributes and relationships (including cardinalities: 1:1, 1:N, N:M). An N:M relationship (e.g. a student takes multiple courses, a course has multiple students) cannot be stored directly in relational databases. It requires a junction/bridge table (e.g. 'Enrollment') containing the primary keys of both entities as foreign keys.",
    },
    {
        id: 'ihk_scrum',
        category: 'ihk',
        questionDe:
            'Wie unterscheidet sich Scrum von klassischem Projektmanagement (Wasserfall) und welche Rollen gibt es im Scrum?',
        questionEn:
            'How does Scrum differ from classical project management (Waterfall) and what roles exist in Scrum?',
        keywordsDe: [
            'scrum',
            'sprint',
            'backlog',
            'waterfall',
            'wasserfall',
            'iterativ',
            'product owner',
            'scrum master',
            'daily',
            'retrospektive',
        ],
        keywordsEn: [
            'scrum',
            'sprint',
            'backlog',
            'waterfall',
            'iterative',
            'product owner',
            'scrum master',
            'daily',
            'retrospective',
        ],
        modelAnswerDe:
            'Wasserfall ist sequenziell: Anforderungen → Design → Implementierung → Test → Abnahme. Änderungen im Nachhinein sind schwer. Scrum ist iterativ: Entwicklung erfolgt in Sprints (1-4 Wochen), am Ende jedes Sprints gibt es ein lauffähiges Inkrement. Rollen: Product Owner (definiert Anforderungen im Backlog), Scrum Master (moderiert, beseitigt Hindernisse), Entwicklungsteam. Zeremonien: Sprint Planning, Daily Stand-up, Sprint Review, Retrospektive.',
        modelAnswerEn:
            'Waterfall is sequential: requirements → design → implementation → testing → delivery. Changes afterwards are costly. Scrum is iterative: development happens in Sprints (1-4 weeks), delivering a working increment each time. Roles: Product Owner (manages backlog), Scrum Master (facilitates, removes blockers), Development Team. Ceremonies: Sprint Planning, Daily Stand-up, Sprint Review, Retrospective.',
    },
];
