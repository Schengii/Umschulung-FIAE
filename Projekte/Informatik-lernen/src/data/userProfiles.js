export const USER_ROLES = {
  anfaenger: {
    id: 'anfaenger',
    title: '🌱 IT-Einsteiger & Neugierige (Für jedes Alter & ohne Vorwissen)',
    subtitle: 'Perfekt für Kinder, Senioren & alle, die IT & Code spielerisch von Null an verstehen wollen.',
    icon: '🌱',
    color: '#0d9488',
    badge: 'Einsteiger Roadmap',
    difficultyLevel: 'Einsteiger',
    description: 'Du lernst spielerisch und ohne Vorkenntnisse wie Computer denken, schreibst deine ersten Codezeilen, verstehst das Internet und baust einfache HTML/CSS-Seiten.',
    recommendedModules: ['it_basics', 'web_html_css', 'binary_logic'],
    recommendedGames: ['logic_runner', 'web_sandbox', 'code_puzzle'],
    skills: ['Binärsystem & Logik', 'HTML5 & CSS3 Grundlagen', 'Algorithmen verstehen', 'Cyber-Sicherheit Hygiene']
  },
  azubi: {
    id: 'azubi',
    title: '⚡ IT-Auszubildender (Fachinformatiker AE / SI / IT-Systeme)',
    subtitle: 'Optimal für Fachinformatiker Anwendungsentwicklung, Systemintegration & IT-Berufe.',
    icon: '⚡',
    color: '#4f46e5',
    badge: 'IHK Praxis Roadmap',
    difficultyLevel: 'Azubi / IHK',
    description: 'Vertiefe dein Wissen für Berufsschule und IHK-Prüfung: SQL-Verknüpfungen, Objektorientierung, Netzwerke (OSI), Pseudocode & Lückentexte.',
    recommendedModules: ['sql_databases', 'js_programming', 'networking_osi', 'cloze_ihk'],
    recommendedGames: ['sql_dungeon', 'code_puzzle', 'cloze_lab'],
    skills: ['SQL Queries & Relationale DBs', 'JavaScript & OOP', 'OSI-Modell & IP-Subnetting', 'Pseudocode & Prüfungs-Lückentexte']
  },
  junior: {
    id: 'junior',
    title: '🚀 Junior Developer & Quereinsteiger',
    subtitle: 'Für Entwickler am Anfang ihrer Karriere, die Praxis-Projekte & Clean Code vertiefen wollen.',
    icon: '🚀',
    color: '#7c3aed',
    badge: 'Junior Dev Roadmap',
    difficultyLevel: 'Junior / Professional',
    description: 'Festige dein Know-how in moderner Webentwicklung, Git-Workflows, REST-APIs, Datenbank-Design und effektiver Fehlersuche.',
    recommendedModules: ['js_programming', 'sql_databases', 'web_html_css'],
    recommendedGames: ['web_sandbox', 'code_puzzle', 'sql_dungeon'],
    skills: ['Clean Code Principles', 'Git & Branching', 'RESTful API Design', 'Relational DB Normalization']
  },
  pro: {
    id: 'pro',
    title: '🔥 Erfahrener Senior Developer & IT-Architekt',
    subtitle: 'Für erfahrene Devs, die Spezialbereiche wie OWASP Cyber-Security, DB-Tuning & RegEx meistern.',
    icon: '🔥',
    color: '#d97706',
    badge: 'Senior Expert Lab',
    difficultyLevel: 'Senior / Expert',
    description: 'Fokussiere dich auf fortgeschrittene Cybersecurity-Hacks (OWASP, SQLi, XSS), Datenbank-Performance, komplexe Algorithmen und System-Architektur.',
    recommendedModules: ['it_security_advanced', 'sql_advanced', 'regex_mastery'],
    recommendedGames: ['cyber_security_lab', 'sql_dungeon', 'bug_hunter_pro'],
    skills: ['OWASP Top 10 Vulnerabilities', 'Complex SQL & Indexing', 'Regex & Parser Logic', 'Secure Code Architecture']
  }
};
