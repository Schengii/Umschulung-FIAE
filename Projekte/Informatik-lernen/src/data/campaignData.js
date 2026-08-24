export const CAMPAIGN_CHAPTERS = [
  {
    id: 'ch1',
    title: 'Kapitel 1: Der Start (Grundlagen & Hardware)',
    badge: 'Level 1-2',
    icon: '🌱',
    desc: 'Lerne wie Computer denken: EVA-Prinzip, Binär- & Hexadezimal-Arithmetik sowie CPU-Register.',
    quests: [
      { id: 'q1_1', title: 'Einsteiger-Kurs Grundlagen lesen', actionTab: 'anfaenger_guide', xp: 30 },
      { id: 'q1_2', title: 'Binärzahlen & Bytes verstehen', actionTab: 'wissen', topicId: 'binary_basics', xp: 40 },
      { id: 'q1_3', title: 'Logikgatter Simulator meistern', actionTab: 'games', gameId: 'logic', xp: 50 }
    ]
  },
  {
    id: 'ch2',
    title: 'Kapitel 2: Der Azubi (IHK-Wissen & Relationale DBs)',
    badge: 'Level 3-4',
    icon: '🎓',
    desc: 'Tauche in die IHK-Lernfelder ein, beherrsche SQL-Queries und Version Control mit Git.',
    quests: [
      { id: 'q2_1', title: 'IHK Lernfeld 1-4 erkunden', actionTab: 'lernfelder', xp: 35 },
      { id: 'q2_2', title: 'SQL Dungeon Crawler bestehen', actionTab: 'games', gameId: 'sql', xp: 50 },
      { id: 'q2_3', title: 'Visual Git Branching & Merge Quest', actionTab: 'git_lab', xp: 45 },
      { id: 'q2_4', title: 'SQL JOIN Venn-Diagramm Builder testen', actionTab: 'sql_joins', xp: 40 }
    ]
  },
  {
    id: 'ch3',
    title: 'Kapitel 3: Der Junior Dev (Code, APIs & TDD)',
    badge: 'Level 5-6',
    icon: '🚀',
    desc: 'Entwickle moderne APIs, schreibe sauberen Code und teste nach Test-Driven-Development.',
    quests: [
      { id: 'q3_1', title: 'REST API Mock Studio ausführen', actionTab: 'api_mock_studio', xp: 40 },
      { id: 'q3_2', title: 'TDD Unit Testing Lab absolvieren', actionTab: 'tdd', xp: 50 },
      { id: 'q3_3', title: 'RegEx Master Quests lösen', actionTab: 'regex_master', xp: 45 }
    ]
  },
  {
    id: 'ch4',
    title: 'Kapitel 4: Der DevOps Engineer (Cloud & Container)',
    badge: 'Level 7-8',
    icon: '🐳',
    desc: 'Automatisiere Pipelines mit CI/CD, orchestriere Docker Container und Kubernetes Pods.',
    quests: [
      { id: 'q4_1', title: 'CI/CD Pipeline Builder konfigurieren', actionTab: 'cicd_workflow', xp: 50 },
      { id: 'q4_2', title: 'Docker Compose Multi-Container Stack', actionTab: 'docker_compose', xp: 50 },
      { id: 'q4_3', title: 'Kubernetes Pods & Ingress Studio', actionTab: 'kubernetes', xp: 60 }
    ]
  },
  {
    id: 'ch5',
    title: 'Kapitel 5: Der Lead Architect (Security & KI Pipelines)',
    badge: 'Level 9-10',
    icon: '👑',
    desc: 'Meistere OAuth2 PKCE Security, Deep Learning Transformer Architekturen und RAG Vector AI.',
    quests: [
      { id: 'q5_1', title: 'OAuth2 PKCE Identity Flow durchlaufen', actionTab: 'oauth_pkce_studio', xp: 55 },
      { id: 'q5_2', title: 'Local RAG Vector AI Simulator testen', actionTab: 'vector_search', xp: 60 },
      { id: 'q5_3', title: 'IHK AP2 Fachgesprächs-Simulator mit Bestnote', actionTab: 'oral_exam', xp: 75 }
    ]
  }
];
