export const CAREER_ROADMAPS = [
  {
    id: 'fullstack',
    title: '🚀 Fullstack Web Developer Roadmap',
    subtitle: 'Vom ersten HTML-Tag bis zum skalierbaren Cloud-Deployment',
    color: 'var(--accent-primary)',
    steps: [
      { id: 'web_html_css', label: '1. HTML5 & CSS3 Grundlagen', category: 'Frontend' },
      { id: 'js_programming', label: '2. JavaScript (ES6+) & DOM', category: 'Frontend' },
      { id: 'sql_databases', label: '3. Relationale Datenbanken & SQL', category: 'Backend' },
      { id: 'react_node', label: '4. React.js & Node.js REST APIs', category: 'Fullstack' },
      { id: 'cloud_deploy', label: '5. Docker & CI/CD Deployment', category: 'DevOps' }
    ]
  },
  {
    id: 'cybersecurity',
    title: '🛡️ Cybersecurity & Pentesting Roadmap',
    subtitle: 'Schütze Systeme vor OWASP Top 10 Angriffsvektoren',
    color: 'var(--accent-rose)',
    steps: [
      { id: 'it_basics', label: '1. Binärsystem & Hardware-Basics', category: 'Grundlagen' },
      { id: 'networking_osi', label: '2. Netzwerke & OSI 7-Schichten', category: 'Infrastruktur' },
      { id: 'cli_linux', label: '3. Linux Terminal & Scripting', category: 'System' },
      { id: 'it_security_advanced', label: '4. OWASP, SQLi & XSS Defense', category: 'Security' },
      { id: 'crypto_hashes', label: '5. Kryptographie & Zero Trust', category: 'Expert' }
    ]
  },
  {
    id: 'ai_data',
    title: '🤖 AI & Data Science Roadmap',
    subtitle: 'Entwickle intelligente KI-Agenten & RAG-Systeme',
    color: 'var(--accent-teal)',
    steps: [
      { id: 'python_basics', label: '1. Python 3 Syntax & Listen', category: 'Programming' },
      { id: 'sql_data', label: '2. SQL & Vekordatenbanken', category: 'Data' },
      { id: 'ai_prompting', label: '3. Prompt Engineering & LLMs', category: 'AI' },
      { id: 'rag_architectures', label: '4. RAG-Systeme mit Vektor-Search', category: 'AI Architecture' }
    ]
  }
];
