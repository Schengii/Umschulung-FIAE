import React, { useState, useMemo } from 'react';
import { Search, Filter, Sparkles, Play, Award, Layers, Terminal, Shield, Cpu, Cloud, Database, Network } from 'lucide-react';

export const LAB_MODULES = [
  {
    id: 'jwks_rotation_lab',
    title: 'OAuth2 JWKS & Key Rotation Studio',
    category: 'security',
    tags: ['#OAuth2', '#JWKS', '#RS256', '#KeyRotation', '#Security'],
    difficulty: 'Advanced',
    desc: 'Asymmetrische Token-Signierung & Zero-Downtime Key Rotation.',
    icon: Shield,
    badge: 'Neu',
    color: '#a855f7'
  },
  {
    id: 'postgres_mvcc_lab',
    title: 'PostgreSQL MVCC & VACUUM Simulator',
    category: 'databases',
    tags: ['#PostgreSQL', '#MVCC', '#xmin', '#xmax', '#VACUUM', '#Bloat'],
    difficulty: 'Advanced',
    desc: 'Verstehe Zeilenversionierung, Dead Tuples und Table Bloat Bereinigung.',
    icon: Database,
    badge: 'Neu',
    color: '#10b981'
  },
  {
    id: 'http3_quic_lab',
    title: 'HTTP/3 & QUIC Protocol Inspector',
    category: 'cloud',
    tags: ['#HTTP3', '#QUIC', '#UDP', '#HeadOfLineBlocking', '#Networking'],
    difficulty: 'Advanced',
    desc: 'Vergleiche HTTP/1.1, HTTP/2 und HTTP/3 unter Paketverlust.',
    icon: Network,
    badge: 'Neu',
    color: '#0284c7'
  },
  {
    id: 'redis_caching_lab',
    title: 'Redis Caching & Invalidation Lab',
    category: 'databases',
    tags: ['#Redis', '#Caching', '#CacheAside', '#TTL', '#CacheStampede'],
    difficulty: 'Advanced',
    desc: 'Cache-Aside, Write-Through & Schutz vor Cache Stampede mit Mutex.',
    icon: Database,
    badge: 'Neu',
    color: '#ef4444'
  },
  {
    id: 'circuit_breaker_lab',
    title: 'Circuit Breaker & Resilience Lab',
    category: 'cloud',
    tags: ['#Microservices', '#CircuitBreaker', '#OpenTelemetry', '#Resilience'],
    difficulty: 'Advanced',
    desc: 'Closed/Open/Half-Open Zustandsmaschine & Distributed Tracing Spans.',
    icon: Layers,
    badge: 'Neu',
    color: '#10b981'
  },
  {
    id: 'k8s_cni_lab',
    title: 'Kubernetes CNI & VXLAN Overlay Lab',
    category: 'cloud',
    tags: ['#Kubernetes', '#CNI', '#VXLAN', '#Calico', '#Networking'],
    difficulty: 'Advanced',
    desc: 'Cross-Node Pod-to-Pod Paketfluss mit VXLAN UDP Encapsulation (Port 4789).',
    icon: Cloud,
    badge: 'Neu',
    color: '#0284c7'
  },
  {
    id: 'graphql_resolver_lab',
    title: 'GraphQL AST & DataLoader Lab',
    category: 'code',
    tags: ['#GraphQL', '#AST', '#DataLoader', '#NPlus1', '#API'],
    difficulty: 'Advanced',
    desc: 'Visualisiere AST-Parsing & eliminiere N+1 Queries mit DataLoader Batching.',
    icon: Network,
    badge: 'Neu',
    color: '#ec4899'
  },
  {
    id: 'linux_permissions_lab',
    title: 'Linux Permissions & Inode Rechner',
    category: 'devops',
    tags: ['#Linux', '#chmod', '#Inodes', '#SUID', '#FileRights'],
    difficulty: 'Intermediate',
    desc: 'Oktal-/Symbolische Rechte, SUID Bits & Inode Blockbelegung live berechnen.',
    icon: Terminal,
    badge: 'Neu',
    color: '#eab308'
  },
  {
    id: 'crypto_keygen_lab',
    title: 'RSA & Diffie-Hellman Crypto Lab',
    category: 'security',
    tags: ['#Kryptographie', '#RSA', '#PublicKey', '#Modulo', '#DiffieHellman'],
    difficulty: 'Advanced',
    desc: 'Mathematische RSA Primzahl-Schlüsselpaar-Generierung und Chiffrierung.',
    icon: Shield,
    badge: 'Neu',
    color: '#6366f1'
  },
  {
    id: 'cicd_matrix_lab',
    title: 'CI/CD Matrix Linter & Runner Lab',
    category: 'devops',
    tags: ['#GitHubActions', '#YAML', '#Matrix', '#CrossPlatform', '#CI/CD'],
    difficulty: 'Advanced',
    desc: 'Validiere GitHub Actions YAML, Multi-OS Matrix & parallele Testläufe.',
    icon: Layers,
    badge: 'Neu',
    color: '#6366f1'
  },
  {
    id: 'postgres_explain_lab',
    title: 'PostgreSQL Query Tree & Cost Visualizer',
    category: 'databases',
    tags: ['#Postgres', '#ExplainAnalyze', '#QueryPlan', '#IndexScan', '#Cost'],
    difficulty: 'Advanced',
    desc: 'Hierarchischer Ausführungsbaum mit Kosten, Startup Cost & Zeilenschätzungen.',
    icon: Database,
    badge: 'Neu',
    color: '#10b981'
  },
  {
    id: 'webrtc_signaling_lab',
    title: 'WebRTC P2P & SDP Signaling Lab',
    category: 'cloud',
    tags: ['#WebRTC', '#P2P', '#SDP', '#STUN', '#TURN', '#DataChannel'],
    difficulty: 'Advanced',
    desc: 'SDP Offer/Answer Handshake, NAT Traversal & RTCDataChannel Chat.',
    icon: Network,
    badge: 'Neu',
    color: '#ec4899'
  },
  {
    id: 'code_debugger_lab',
    title: 'Code Execution & Memory Debugger',
    category: 'algorithms',
    tags: ['#V8Engine', '#CallStack', '#Heap', '#Closures', '#Rekursion'],
    difficulty: 'Intermediate',
    desc: 'Schritt-für-Schritt Interpreter mit Call Stack, Scope Chains & Heap-Speicher.',
    icon: Cpu,
    badge: 'Neu',
    color: '#6366f1'
  },
  {
    id: 'clean_code_lab',
    title: 'Clean Code & Security Review Arena',
    category: 'security',
    tags: ['#OWASP', '#CleanCode', '#MemoryLeaks', '#SQLi', '#Refactoring'],
    difficulty: 'Intermediate',
    desc: 'Finde kritische Sicherheitslücken, N+1 Queries & Memory Leaks im Code.',
    icon: Shield,
    badge: 'Neu',
    color: '#ef4444'
  },
  {
    id: 'dns_http_lab',
    title: 'DNS & HTTP/TLS Lifecycle Inspector',
    category: 'cloud',
    tags: ['#DNS', '#HTTP2', '#TLS1.3', '#TCP', '#OSI-Modell'],
    difficulty: 'Intermediate',
    desc: 'Verfolge den Web-Request von Resolver & TLD bis zum TLS Handshake.',
    icon: Network,
    badge: 'Neu',
    color: '#0284c7'
  },
  {
    id: 'sql_transaction_lab',
    title: 'SQL Transaktionen, ACID & Deadlocks',
    category: 'databases',
    tags: ['#SQL', '#ACID', '#Isolation', '#Deadlocks', '#Locking'],
    difficulty: 'Advanced',
    desc: '2-Session SQL Simulator für Dirty Reads, Phantom Reads & Sperrkonflikte.',
    icon: Database,
    badge: 'Neu',
    color: '#a855f7'
  },
  {
    id: 'ihk_doc_generator',
    title: 'IHK Projektantrag- & Doku-Generator',
    category: 'ihk',
    tags: ['#IHK', '#AP2', '#Projektantrag', '#Amortisation', '#Gantt'],
    difficulty: 'Intermediate',
    desc: '80h/40h Zeitplanung, Amortisations-ROI Rechner & Markdown Export.',
    icon: Award,
    badge: 'Neu',
    color: '#22c55e'
  },
  {
    id: 'cpu_architecture_lab',
    title: 'Von-Neumann CPU & Register-Simulator',
    category: 'hardware',
    tags: ['#Hardware', '#CPU', '#Register', '#ALU', '#Assembler'],
    difficulty: 'Beginner',
    desc: 'Taktzyklen (Fetch, Decode, Execute), Register (PC, AC, IR, MAR) & RAM-Matrix live simulieren.',
    icon: Cpu,
    badge: 'Top',
    color: '#3b82f6'
  },
  {
    id: 'sql_optimizer_lab',
    title: 'SQL Query Optimizer & EXPLAIN ANALYZE',
    category: 'databases',
    tags: ['#SQL', '#Index', '#BTree', '#ExplainPlan', '#Performance'],
    difficulty: 'Intermediate',
    desc: 'Vergleiche Full Table Scans vs. B-Tree Index Scans und reduziere Abfrage-Kosten.',
    icon: Database,
    badge: 'Neu',
    color: '#10b981'
  },
  {
    id: 'git_graph_lab',
    title: 'Git Branching & Rebase Graph Visualizer',
    category: 'devops',
    tags: ['#Git', '#Branching', '#Rebase', '#VersionControl'],
    difficulty: 'Beginner',
    desc: 'Visueller interaktiver Commit-Graph mit Branch-Pointern, Merges & interaktivem Terminal.',
    icon: Terminal,
    badge: 'Neu',
    color: '#ec4899'
  },
  {
    id: 'oral_exam',
    title: 'IHK AP2 Fachgesprächs-Simulator',
    category: 'ihk',
    tags: ['#IHK', '#Prüfung', '#Fachgespräch', '#Projektarbeit'],
    difficulty: 'Intermediate',
    desc: 'Simuliere 15 Min. Projektpräsentation & 15 Min. Prüfer-Fachgespräch für FIAE & FISI.',
    icon: Award,
    badge: 'Neu',
    color: '#8b5cf6'
  },
  {
    id: 'sql_joins',
    title: 'SQL JOINs & Venn-Diagramm Builder',
    category: 'databases',
    tags: ['#SQL', '#Datenbanken', '#Joins', '#VennDiagramm'],
    difficulty: 'Beginner',
    desc: 'Visuelle In-Memory Simulation von INNER, LEFT, RIGHT & FULL JOINs.',
    icon: Database,
    badge: 'Neu',
    color: '#f59e0b'
  },
  {
    id: 'datastructures',
    title: 'Data Structures Tree & Graph Lab',
    category: 'algorithms',
    tags: ['#Algorithmen', '#BST', '#Dijkstra', '#Graphen'],
    difficulty: 'Intermediate',
    desc: 'Binäre Suchbäume (Inorder, Preorder, Postorder) und Dijkstra-Wegfinder visualisieren.',
    icon: Network,
    badge: 'Neu',
    color: '#10b981'
  },
  {
    id: 'cicd_workflow',
    title: 'CI/CD Workflow Pipeline Builder',
    category: 'devops',
    tags: ['#DevOps', '#GitHubActions', '#CI/CD', '#Pipelines'],
    difficulty: 'Intermediate',
    desc: 'Visueller Stufen- & Job-Builder für automatische Builds, Unit Tests & Kubernetes Deployment.',
    icon: Layers,
    badge: 'Neu',
    color: '#6366f1'
  },
  {
    id: 'k8s',
    title: 'Kubernetes Pods & Ingress Studio',
    category: 'cloud',
    tags: ['#Cloud', '#Kubernetes', '#Cluster', '#DevOps'],
    difficulty: 'Advanced',
    desc: 'Verwalte Deployments, Pod-Replikationen, Services und Ingress Controller.',
    icon: Cloud,
    color: '#3b82f6'
  },
  {
    id: 'ragai',
    title: 'Local RAG Vector AI Simulator',
    category: 'ai',
    tags: ['#KI', '#RAG', '#Vektordatenbank', '#LLM'],
    difficulty: 'Advanced',
    desc: 'Retrieval Augmented Generation mit Cosine Similarity & Chunking interaktiv testen.',
    icon: Cpu,
    color: '#8b5cf6'
  },
  {
    id: 'pkce',
    title: 'OAuth2 PKCE & OIDC Identity Studio',
    category: 'security',
    tags: ['#Security', '#OAuth2', '#PKCE', '#JWT'],
    difficulty: 'Advanced',
    desc: 'Proof Key for Code Exchange Key-Generierung, Code-Austausch & JWT Decoding.',
    icon: Shield,
    color: '#ec4899'
  },
  {
    id: 'sqldungeon',
    title: 'SQL Dungeon Crawler',
    category: 'databases',
    tags: ['#Datenbanken', '#SQL', '#Queries', '#Gamified'],
    difficulty: 'Beginner',
    desc: 'Löse SQL-Rätsel mit echten Queries (SELECT, JOIN, WHERE) um Räume zu durchqueren.',
    icon: Database,
    color: '#f59e0b'
  },
  {
    id: 'gitvisual',
    title: 'Visual Git Branching & Merge Lab',
    category: 'devops',
    tags: ['#DevOps', '#Git', '#Branches', '#Merge'],
    difficulty: 'Beginner',
    desc: 'Echtzeit-Visualisierung von Commits, Branches, Checkouts und Merge-Konflikten.',
    icon: Terminal,
    color: '#10b981'
  },
  {
    id: 'regexmaster',
    title: 'RegEx Master Interactive Lab',
    category: 'algorithms',
    tags: ['#RegEx', '#Validierung', '#PatternMatching'],
    difficulty: 'Intermediate',
    desc: 'Reguläre Ausdrücke live testen, E-Mail- & IPv4-Regex-Quests meistern.',
    icon: Search,
    color: '#06b6d4'
  },
  {
    id: 'pythonwasm',
    title: 'Python WebAssembly (Pyodide) Lab',
    category: 'code',
    tags: ['#Python', '#WASM', '#BrowserExecution'],
    difficulty: 'Beginner',
    desc: 'Führe echten Python-Code ohne Server direkt im Browser über WebAssembly aus.',
    icon: Terminal,
    color: '#3b82f6'
  },
  {
    id: 'bigo',
    title: 'Big-O Algorithm Benchmark Lab',
    category: 'algorithms',
    tags: ['#Algorithmen', '#BigO', '#Laufzeit', '#Performance'],
    difficulty: 'Intermediate',
    desc: 'Vergleiche O(1), O(log n), O(n), O(n²) und O(2^n) mit dynamischen Diagrammen.',
    icon: Cpu,
    color: '#ef4444'
  }
];

export default function LabsDashboard({ onSelectLab }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Alle Labs' },
    { id: 'ihk', name: '🎓 IHK Prüfung & Karriere' },
    { id: 'algorithms', name: 'Algorithmen & Datenstrukturen' },
    { id: 'devops', name: 'DevOps & Git' },
    { id: 'cloud', name: 'Cloud & Container' },
    { id: 'security', name: 'Security & Auth' },
    { id: 'ai', name: 'Künstliche Intelligenz' },
    { id: 'databases', name: 'Datenbanken & SQL' }
  ];

  const filteredLabs = useMemo(() => {
    return LAB_MODULES.filter(lab => {
      const matchesSearch = 
        lab.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.desc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lab.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCat = selectedCategory === 'all' || lab.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <div style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <span className="badge badge-indigo" style={{ marginBottom: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} /> Praxisorientiertes Lernen
        </span>
        <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '4px 0', color: 'var(--text-main)' }}>
          🧪 Interaktive Laboratorien & Simulatoren Hub
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Erkunde über 25 spezialisierte IT-Simulatoren – von Datenstrukturen und Kubernetes bis hin zu RAG Vector AI und Git-Branching.
        </p>
      </div>

      {/* Search & Filter Toolbar */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Suche nach Tags (#DevOps, #KI), Themen oder Labs..."
            style={{
              width: '100%',
              padding: '12px 12px 12px 38px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-primary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              fontSize: '0.92rem'
            }}
          />
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`btn ${selectedCategory === c.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.82rem', padding: '6px 14px', whiteSpace: 'nowrap' }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Lab Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
        {filteredLabs.map((lab) => {
          const Icon = lab.icon;
          return (
            <div
              key={lab.id}
              style={{
                background: 'var(--bg-primary)',
                borderRadius: 'var(--radius-lg)',
                padding: '22px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: `${lab.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={22} color={lab.color} />
                  </div>
                  {lab.badge && (
                    <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>
                      {lab.badge}
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text-main)' }}>
                  {lab.title}
                </h3>

                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  {lab.desc}
                </p>

                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {lab.tags.map(t => (
                    <span key={t} style={{ background: '#0f172a', color: '#94a3b8', fontSize: '0.72rem', padding: '3px 8px', borderRadius: '4px', fontFamily: 'monospace' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={() => onSelectLab(lab.id)}
                style={{ width: '100%', gap: '8px', justifyContent: 'center' }}
              >
                <Play size={16} /> Laboratorium Starten
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
