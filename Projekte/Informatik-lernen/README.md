# 💻 IT-DevGame | Interaktives Informatik-Spiel & Lernplattform für alle Altersgruppen

Ein modernes, gamifiziertes Web-Anwendungs-Framework zum Erlernen von Informatik-Grundlagen für Einsteiger (ohne Vorkenntnisse), IHK Berufsschul-Lernfeldern (ausbildung-in-der-it.de LF 1 - 12b), W3Schools-Style Programmier-Masterclasses (Python Complete Guide, JS ES6+, TS, Java, C#), Coursera Deep Learning (CNNs, RNNs, Transformers), IT-Berufe Podcast Specials (Datenschutz vs. Datensicherheit vs. Datensicherung, Encodings UTF-8/ASCII), interaktiven Video-Tutorials, Schritt-für-Schritt Praxis-Projekten, Advanced Prompt Engineering (Chain-of-Thought, Few-Shot), OAuth2 & OpenID Connect (OIDC), WebSockets Realtime Communication, Performance Profiling & Memory Leak Handling, Kubernetes Orchestrierung, Local RAG Vector AI Pipelines, WebAssembly & Rust Compilation, Apache Kafka Event-Driven Architecture, Docker & Containerisierung, Cloud Infrastructure (AWS/GitHub Actions CI/CD), Cybersecurity Red vs Blue Team, GraphQL & REST API Testing, Web Components (Lit.dev, Vaadin), 10+ Programmiersprachen (JS, TS, Java, C#, Angular, PHP, React, Vite, C++), TDD Unit-Testing, i18n Mehrsprachigkeit, Systemarchitektur, Microservices, Design Patterns, Cloud Native, Datenbanken, IT-Sicherheit, Logikschaltungen, Netzwerken, RegEx, Terminal-Commands, Big-O Komplexität, Karriere-Roadmaps, Boss-Battles, Code Typing Speedrun, PWA Offline-Support, Vokabeln, Quizzes und App-Entwicklung – **geeignet für Menschen jeden Alters (ohne Vorwissen) bis hin zu IT-Auszubildenden und erfahrenen Senior-Programmierern**.

---

## 📋 Inhaltsverzeichnis
- [Übersicht & Zielgruppen](#-übersicht--zielgruppen)
- [Hauptfunktionen & Neue Features](#-hauptfunktionen--neue-features)
- [Barrierefreiheit & Inklusion](#-barrierefreiheit--inklusion)
- [Ordnerstruktur](#-ordnerstruktur)
- [Dateiinhalt & Komponentenübersicht](#-dateiinhalt--komponentenübersicht)
- [Funktionsweise](#-funktionsweise)
- [DSGVO & Datenschutz](#-dsgvo--datenschutz)
- [Anleitung (Installation & Ausführung)](#-anleitung-installation--ausführung)
- [Änderungshistorie & Entwicklungsdokumentation](#-änderungshistorie--entwicklungsdokumentation)

---

## 🎯 Übersicht & Zielgruppen

**IT-DevGame** ist so konzipiert, dass **jeder Mensch – unabhängig von Alter oder Vorkenntnissen** – spielerisch in die Welt der Informatik einsteigen oder bestehendes Wissen gezielt vertiefen kann:

1. **🌱 Einsteiger & Neugierige (Kinder, Senioren, Quereinsteiger)**:
   - **Einsteiger-Kurs (`AnfaengerGuideHub.jsx`)**: Lernen ohne jegliche Vorkenntnisse.
   - Grundlagen leicht verständlich erklärt: **EVA-Prinzip**, **CPU-Gehirn** (ALU, Steuerwerk, Register), **Binärsystem & Bytes**, **Internet & DNS**.
2. **⚡ IT-Auszubildende (Fachinformatiker AE/SI, IT-Systemelektroniker)**:
   - Detaillierte IHK-Berufsschul Lernfelder (`ausbildung-in-der-it.de` LF 1 bis LF 12b), prüfungsrelevante Tipps für AP Teil 1 & AP Teil 2, Amortisationsrechnungen, Handelskalkulationen, RTO/RPO Definitionen & Stefan Macke Podcast-Tipps.
3. **🚀 Junior Developer**:
   - Clean Code Prinzipien, REST & GraphQL APIs, Docker, CI/CD Pipelines, JavaScript, TypeScript, React, Angular, Node.js, Vite, RegEx, TDD Unit-Testing & Git-Workflows.
4. **🔥 Erfahrene Senior Developer & IT-Architekten**:
   - Coursera Deep Learning (CNNs, RNNs, Transformers), Advanced Prompt Engineering (Chain-of-Thought, Few-Shot), OAuth2 PKCE & JWT Claims Decoding, WebSockets HTTP 101 Handshake, V8 Performance & Memory Leak Profiling, Kubernetes Deployments & RAG Vector AI Pipelines.

---

## 🔥 Hauptfunktionen & Neue Features (v3.2.0 Full Web Sources Integration)

* **🎓 Ausbildung-in-der-IT Lernfelder Master Integration (`lernfelderData.js`)**:
  * Detaillierte Themen & Prüfungsfokus für alle 12 Lernfelder aus `ausbildung-in-der-it.de`.
* **📄 IT-Berufe Podcast & Coursera AI Integration (`topicsData.js`)**:
  * Datenschutz vs. Datensicherheit vs. Datensicherung, Encodings UTF-8/ASCII & Deep Learning CNN/RNN/Transformer Architekturen.
* **📚 W3Schools Python Complete Guide & IT-Lexikon Expansion**.

---

## ♿ Barrierefreiheit & Inklusion

* **Lese-Rechtschreib-Hilfe (Dyslexie-Modus)**: Spezialschriftart (*Atkinson Hyperlegible*), erweiterter Zeichen- & Zeilenabstand.
* **Rot-Grün-Sehhilfe (Farbenblindheits-Modus)**: Zusätzliche Icon-Indikatoren (✓ / ✗) und barrierefreie Farbwelten.
* **Vorlesefunktion (Text-to-Speech)**: Audio-Steuerung (Play/Pause/Stopp) zum Vorlesen aller Lerneinheiten.
* **Schriftgrößen-Skalierung**: Stufenlose Anpassung (A- / 100% / A+).
* **100% DSGVO-konform**: Keine Tracking-Cookies, alle Daten verbleiben rein lokal im `localStorage`.

---

## 📁 Ordnerstruktur

```
Informatik-lernen/
├── .agents/
│   └── AGENTS.md
├── .gitignore
├── .oxlintrc.json
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── vite.config.js
├── public/
│   ├── manifest.json
│   └── sw.js
└── src/
    ├── App.css
    ├── App.jsx
    ├── main.jsx
    ├── components/
    │   ├── Content/
    │   │   ├── AiBusinessMasterclass.jsx
    │   │   ├── AiPromptLab.jsx
    │   │   ├── AlgoPlaygroundLab.jsx
    │   │   ├── AnfaengerGuideHub.jsx
    │   │   ├── ApiBenchStudio.jsx
    │   │   ├── ApiMockStudioLab.jsx
    │   │   ├── AppWorkshop.jsx
    │   │   ├── ArchitectureVisualizer.jsx
    │   │   ├── BigOBenchmarkLab.jsx
    │   │   ├── BigOVisualizer.jsx
    │   │   ├── CampaignQuestHub.jsx
    │   │   ├── CareerRoadmap.jsx
    │   │   ├── CiCdMatrixLinterLab.jsx
    │   │   ├── CiCdPipelineLab.jsx
    │   │   ├── CiCdWorkflowLab.jsx
    │   │   ├── CircuitBreakerLab.jsx
    │   │   ├── CleanCodeReviewLab.jsx
    │   │   ├── CloudDesignerLab.jsx
    │   │   ├── CloudDevOpsLab.jsx
    │   │   ├── ClozeTester.jsx
    │   │   ├── CodeExecutionDebuggerLab.jsx
    │   │   ├── CommandPaletteModal.jsx
    │   │   ├── CpuArchitectureLab.jsx
    │   │   ├── CryptoKeygenLab.jsx
    │   │   ├── CtfChallengeLab.jsx
    │   │   ├── DataStructuresLab.jsx
    │   │   ├── DeploymentGuideModal.jsx
    │   │   ├── DesignPatternsLab.jsx
    │   │   ├── DnsHttpLifecycleLab.jsx
    │   │   ├── DockerComposeLab.jsx
    │   │   ├── DockerLab.jsx
    │   │   ├── ExamSimulator.jsx
    │   │   ├── FisiLernfelderHub.jsx
    │   │   ├── GitBranchGraphLab.jsx
    │   │   ├── GitLab.jsx
    │   │   ├── GlossaryModal.jsx
    │   │   ├── GraphqlResolverLab.jsx
    │   │   ├── Http3QuicLab.jsx
    │   │   ├── IhkOralExamSimulator.jsx
    │   │   ├── IhkProjectDocumentationGenerator.jsx
    │   │   ├── ItPodcastHub.jsx
    │   │   ├── JwksRotationLab.jsx
    │   │   ├── K8sCniOverlayLab.jsx
    │   │   ├── KafkaEventLab.jsx
    │   │   ├── KnowledgeQuizArena.jsx
    │   │   ├── KubernetesLab.jsx
    │   │   ├── LabsDashboard.jsx
    │   │   ├── LanguageAcademy.jsx
    │   │   ├── LeitnerFlashcardLab.jsx
    │   │   ├── LinuxPermissionsLab.jsx
    │   │   ├── MonacoStudioLab.jsx
    │   │   ├── OauthOidcLab.jsx
    │   │   ├── OauthPkceStudio.jsx
    │   │   ├── PacketTracerLab.jsx
    │   │   ├── PerformanceProfilingLab.jsx
    │   │   ├── PostgresExplainVisualizerLab.jsx
    │   │   ├── PostgresMvccLab.jsx
    │   │   ├── PythonWasmLab.jsx
    │   │   ├── RagAiSimulator.jsx
    │   │   ├── RedBlueTeamLab.jsx
    │   │   ├── RedisCachingLab.jsx
    │   │   ├── RegexMasterLab.jsx
    │   │   ├── SqlJoinVisualizerLab.jsx
    │   │   ├── SqlQueryOptimizerLab.jsx
    │   │   ├── SqlTransactionLab.jsx
    │   │   ├── SubnettingLab.jsx
    │   │   ├── SystemDesignLab.jsx
    │   │   ├── TddUnitTestLab.jsx
    │   │   ├── TopicReader.jsx
    │   │   ├── ToolingSetupGuide.jsx
    │   │   ├── VectorSearchLab.jsx
    │   │   ├── VideoHub.jsx
    │   │   ├── VocabularyTrainerModal.jsx
    │   │   ├── WasmRustLab.jsx
    │   │   ├── WasmRustStudio.jsx
    │   │   ├── WebComponentsHub.jsx
    │   │   ├── WebRtcSignalingLab.jsx
    │   │   ├── WebSocketProtocolLab.jsx
    │   │   └── WebSocketsLab.jsx
    │   ├── Footer/
    │   │   └── DsgvoFooterModal.jsx
    │   ├── Games/
    │   │   ├── BossBattleGame.jsx
    │   │   ├── CliTerminalLab.jsx
    │   │   ├── CodePuzzle.jsx
    │   │   ├── CodeTypingSpeedrun.jsx
    │   │   ├── LogicGatesGame.jsx
    │   │   ├── RegexLab.jsx
    │   │   ├── SecurityLab.jsx
    │   │   ├── SqlDungeon.jsx
    │   │   └── WebSandbox.jsx
    │   ├── Gamification/
    │   │   ├── BadgesModal.jsx
    │   │   ├── BackupModal.jsx
    │   │   ├── CertificateModal.jsx
    │   │   ├── DailyChallengeWidget.jsx
    │   │   ├── FlashcardsModal.jsx
    │   │   └── SkillMatrixWidget.jsx
    │   ├── Navigation/
    │   │   ├── AccessibilityToolbar.jsx
    │   │   ├── DifficultyFilterBar.jsx
    │   │   ├── MobileNav.jsx
    │   │   └── Navbar.jsx
    │   ├── Onboarding/
    │   │   └── RoleSelectionModal.jsx
    │   └── Projects/
    │       └── ProjectViewer.jsx
    ├── data/
    │   ├── advancedLabsData.js
    │   ├── aiBusinessData.js
    │   ├── apiStudioData.js
    │   ├── clozeData.js
    │   ├── cloudArchLabsData.js
    │   ├── cloudData.js
    │   ├── dockerData.js
    │   ├── enterpriseLabsData.js
    │   ├── examData.js
    │   ├── expertLabsData.js
    │   ├── flashcardsData.js
    │   ├── gamesData.js
    │   ├── glossaryData.js
    │   ├── k8sData.js
    │   ├── kafkaData.js
    │   ├── languageData.js
    │   ├── lernfelderData.js
    │   ├── nextGenLabsData.js
    │   ├── oauthData.js
    │   ├── perfData.js
    │   ├── podcastData.js
    │   ├── projectsData.js
    │   ├── quizArenaData.js
    │   ├── ragAiData.js
    │   ├── roadmapData.js
    │   ├── securityTeamData.js
    │   ├── topicsData.js
    │   ├── userProfiles.js
    │   ├── vocabularyData.js
    │   ├── wasmRustData.js
    │   ├── webComponentsData.js
    │   ├── websocketData.js
    │   └── videosData.js
    ├── styles/
    │   └── global.css
    └── utils/
        ├── i18n.js
        ├── srsAlgorithm.js
        └── storage.js
```

---

## 🛠️ Anleitung (Installation & Ausführung)

```bash
# 1. Klonen des Repositories
git clone https://github.com/Schengii/Informatik-lernen.git
cd Informatik-lernen

# 2. Abhängigkeiten installieren
npm install

# 3. Entwicklungsserver starten
npm run dev

# 4. Produktions-Build erstellen & testen
npm run build
npm run lint
```

---

## 📝 Änderungshistorie & Entwicklungsdokumentation

### Versionsverlauf

#### [v19.0.0] - Cloud Architecture: OAuth2 JWKS Key Rotation, Postgres MVCC & HTTP/3 QUIC Protocol
* **OAuth2 JWKS Key Rotation & RS256 Studio (`JwksRotationLab.jsx`)**:
  * OpenID Connect Discovery (`/.well-known/jwks.json`) mit dynamischem Key Matching über den `kid`-Header für Zero-Downtime Key Rotations.
  * Vollständige Entschlüsselung und Signatur-Prüfung von RS256 Bearer JWTs gegen aktive und archivierte Public RSA-Schlüssel.
* **PostgreSQL MVCC & VACUUM Storage Simulator (`PostgresMvccLab.jsx`)**:
  * 4-stufiger interaktiver Lebenszyklus von 8 KB Disk Pages: `xmin`, `xmax`, Dead Tuples nach Updates und Rückgewinnung von freiem Speicherplatz durch `VACUUM`.
* **HTTP/3 & QUIC Protocol Inspector (`Http3QuicLab.jsx`)**:
  * Direkter Performance- und Latenzvergleich zwischen HTTP/1.1 (TCP), HTTP/2 (Single TCP Stream) und HTTP/3 (QUIC over UDP).
  * Simulation von 10% Packet Loss zur Veranschaulichung der Head-of-Line-Blocking Eliminierung unter QUIC.
* **Test Suite & Framework Erweiterung**:
  * 3 neue Unit-Tests (`src/data/cloudArchLabs.test.js`) zur Verifikation von JWKS Key-IDs, MVCC-Zuständen und QUIC-Protokolleigenschaften (**30/30 Vitest-Tests erfolgreich**).
  * Vollständige Anbindung an alle Megamenüs, die Command Palette (`Ctrl+K`) und das responsive Labs-Dashboard.

#### [v18.0.0] - Enterprise Architecture: Redis Caching, Circuit Breaker & Kubernetes CNI Overlay
* **Redis Caching & Invalidation Strategies Lab (`RedisCachingLab.jsx`)**:
  * Visualisierung von Caching-Mustern (**Cache-Aside / Lazy Loading**, **Write-Through**, **Write-Back**) und Schutzmechanismen gegen **Cache Stampede / Thundering Herd** mittels Mutex-Locks (`SETNX`).
  * Live In-Memory Keyspace Tabelle mit Key-TTL und LRU/LFU Eviction Policy Simulation.
* **Circuit Breaker & Service Mesh Resilience Lab (`CircuitBreakerLab.jsx`)**:
  * Fehlertoleranz-Zustandsmaschine (**CLOSED**, **OPEN**, **HALF-OPEN**) mit dynamischen Fehlerraten-Schwellenwerten.
  * OpenTelemetry Distributed Tracing Visualizer mit Waterfall-Spans (API Gateway -> Order Service -> Payment Service -> Kafka Event Bus).
* **Kubernetes CNI & VXLAN Overlay Network Visualizer (`K8sCniOverlayLab.jsx`)**:
  * 5-stufiger Cross-Node Paketfluss: Von Pod A über veth0, Host CNI Daemon, **VXLAN UDP Kapselung (UDP Port 4789, VNI 1)** über das physische Underlay bis zu Pod B.
* **Test Suite & Integration**:
  * 4 neue Vitest Unit-Tests (`src/data/enterpriseLabs.test.js`) zur Verifikation von Cache-Hit-Ratios, State-Transitions und VXLAN-Paketstrukturen (**27/27 Vitest-Tests erfolgreich**).
  * Vollständige Anbindung an alle Megamenüs, die Command Palette (`Ctrl+K`) und das responsive Labs-Dashboard.

#### [v17.0.0] - Masterclass GraphQL AST Resolver, Linux Inodes & RSA Cryptography Labs
* **GraphQL AST & DataLoader Resolver Lab (`GraphqlResolverLab.jsx`)**:
  * Visualisierung von Query Lexing & Abstract Syntax Tree (AST) Parsing sowie Vergleich von naiver N+1 Ausführung vs. DataLoader In-Memory Request Batching (`batchLoadFn`).
* **Linux Permissions, Inodes & chmod Rechner (`LinuxPermissionsLab.jsx`)**:
  * Interaktiver Rechner für Oktal- (`755`, `644`, `700`) und Symbolische Notation (`rwxr-xr-x`), Special Bits (SUID / 4000) und Inode-Blockbelegungsanalysen.
* **RSA & Diffie-Hellman Cryptography Sandbox (`CryptoKeygenLab.jsx`)**:
  * 5-stufige mathematische Public-Key Verschlüsselungs-Pipeline (Primzahlenwahl $p, q$, RSA Modulus $n$, Eulersche Totientenfunktion $\phi(n)$, modularer Inverser $d \equiv e^{-1} \pmod{\phi(n)}$ und Chiffrierung).
* **Test Suite & Framework Erweiterung**:
  * 3 neue Unit-Tests (`src/data/expertLabs.test.js`) zur Verifikation von AST-Bäumen, Oktal-Berechnungen und BigInt Modulo-Potenzierungs-Mathematik (**23/23 Vitest-Tests erfolgreich**).
  * Vollständige Anbindung an alle Megamenüs, die Command Palette (`Ctrl+K`) und das responsive Labs-Dashboard.

#### [v16.0.0] - Advanced CI/CD Matrix Linter, Postgres Execution Tree & WebRTC Signaling Lab
* **GitHub Actions CI/CD Matrix Linter & Runner Lab (`CiCdMatrixLinterLab.jsx`)**:
  * Interaktiver Workflow-YAML Editor mit Linter für Trigger, Jobs, Steps und Multi-OS Matrix-Builds (`ubuntu-latest`, `windows-latest`, `macos-latest` mit Node 18, 20 & 22) inklusive paralleler Live-Job-Ausführungssimulation.
* **PostgreSQL Query Execution Tree & Cost Visualizer (`PostgresExplainVisualizerLab.jsx`)**:
  * Hierarchischer JSON EXPLAIN ANALYZE Baum mit interaktivem Node-Inspector (Startup & Total Cost, Actual Rows, Sort Methods und Bitmap Index/Heap Scan Detailanalysen).
* **WebRTC P2P & SDP Signaling Lab (`WebRtcSignalingLab.jsx`)**:
  * 7-Stufen Realtime-Signaling Simulator mit MediaStream Erfassung, SDP Offer/Answer Handshake, STUN NAT-Traversal (srflx Candidates), DTLS/SRTP Verschlüsselung und interaktivem RTCDataChannel Live-Chat.
* **Test Suite & Navigation Expansion**:
  * 3 neue Vitest Unit-Tests (`src/data/advancedLabs.test.js`) zur Absicherung der YAML-Parser, JSON Execution Trees und WebRTC Signaling-Sequenzen (**20/20 Tests erfolgreich**).
  * Vollständige Verknüpfung aller neuen Module im Megamenü der Navbar, im Labs Dashboard und in der Command Palette (`Ctrl+K`).

#### [v15.0.0] - Next-Gen Educational Labs, Runtime Debugger, IHK Doku-Generator & Concurrency Engine
* **Interaktiver Code Execution & Memory Debugger (`CodeExecutionDebuggerLab.jsx`)**:
  * Step-by-Step V8 Engine Code-Interpreter: Call Stack (Pushes & Pops), lexikalischer Scope, Closures und dynamische Heap-Referenzen/Pointer-Visualisierung für Rekursion (Fibonacci) und Werte- vs. Referenztypen.
* **IHK Projektantrags- & Projektdokumentations-Generator (`IhkProjectDocumentationGenerator.jsx`)**:
  * Vollständig geführter Assistent für FIAE (80h) und FISI (40h) Abschlussprojekte mit Gantt-Phasen-Stundenbudget-Validierung, dynamischer Amortisations- und Wirtschaftlichkeitsberechnung (Break-Even in Monaten/Jahren) sowie direktem Markdown-Export (`.md`).
* **Clean Code & Security Review Arena (`CleanCodeReviewLab.jsx`)**:
  * Code-Auditing-Simulator für OWASP Top 10 (SQL Injection via Prepared Statements), Frontend Memory Leaks (React `useEffect` Event-Listener Cleanup) und Backend N+1 Query Antipatterns (SQL `JOIN` / `json_agg`).
* **DNS & HTTP/TLS Request-Lifecycle Inspector (`DnsHttpLifecycleLab.jsx`)**:
  * 8-Stufen End-to-End Netzwerk-Visualizer von Browser-Cache, rekursivem DNS-Resolver, Root/TLD Nameservern über TCP 3-Way Handshake bis hin zu TLS 1.3 ECDHE und HTTP/2 Stream Multiplexing.
* **SQL Transaktions- & ACID Concurrency Simulator (`SqlTransactionLab.jsx`)**:
  * 2 parallele interaktive SQL-Konsolen (Session A & Session B) zur Veranschaulichung von Transaktions-Isolationsstufen (`READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`), Dirty Reads, Phantom Reads und Deadlock-Erkennung.
* **Navigation, Command Palette & Test Suite Expansion**:
  * Vollständige Integration aller neuen Module in die Navbar-Megamenüs, das Labs-Dashboard und die globale Command Palette (`Ctrl+K`).
  * 5 neue automatisierte Unit-Tests in Vitest zur Verifikation von Scenariodaten, Berechnungsformeln und ACID-Logik (17/17 Tests erfolgreich).

#### [v14.0.0] - Massive Educational Content & Technical Knowledge Expansion (W3Schools & IHK Standard)
* **Masterclass Datenbank-Normalisierung & JavaScript Event Loop (`topicsData.js`)**:
  * Vollständiger Leitfaden zur 1NF, 2NF, 3NF und BCNF mit relationalen Anomalien (Einfüge-, Änderungs-, Lösch-Anomalien), DDL-Schemata und IHK-Prüfungsquizzes.
  * Deep Dive zur JavaScript Event Loop: Call Stack, Web APIs, Microtask Queue (Promises, `queueMicrotask`), Macrotask Queue (`setTimeout`) und Render-Zyklen mit Mermaid-Diagramm.
* **Vollständiger IHK-Rahmenlehrplan FIAE & FISI (`lernfelderData.js`)**:
  * Ergänzung der FIAE-Spezifischen Lernfelder **LF 10a** (UI/UX, ISO 9241-110, WCAG AAA Barrierefreiheit, SPA/SSR), **LF 11a** (Clean Architecture, GoF Design Patterns, DDD, OWASP Top 10, TDD) und **LF 12a** (80-Stunden IHK-Abschlussprojekt, Amortisation, Nutzwertanalyse, Testprotokolle).
* **Programmiersprachen-Academy Ausbau (`languageData.js`)**:
  * Erweiterung auf 6 Kernsprachen: Python (OOP & Dunder-Methods), JavaScript ES6+, TypeScript (Interfaces, Generics, Utility Types), Java 17+ (Records, Streams API), C# (.NET LINQ, Async/Await), Go (Goroutines, Channels) und Rust (Ownership & Borrowing).
* **IHK Mündliches Fachgespräch Simulation (`oralExamData.js`)**:
  * Neue technische Szenarien zu CORS/CSRF-Sicherheitsarchitektur mit JWT-Tokens sowie Standortvernetzung mit WireGuard (ChaCha20) vs. IPsec (IKEv2).
* **Fachwortschatz- & Docker-Erweiterung (`vocabularyData.js`, `dockerData.js`)**:
  * Neue Fachbegriffe zu Idempotency, Infrastructure as Code (IaC), Event Sourcing & CQRS, Race Conditions/Deadlocks und MVC.
  * Docker User-Defined Bridge-Netzwerke, DNS Service Discovery und Non-Root Security Best Practices.

#### [v13.4.0] - Unified Profile & Settings Header Dropdown, 480px Megamenu & Responsive Drawer
* **Konsolidiertes All-in-One Profil- & Einstellungsmenü (`Navbar.jsx`)**:
  * Alle Steuerungselemente rechts von "Tools" (XP/Level, Theme Switcher, WCAG-Barrierefreiheit, Rollenwechsler, Zertifikate und Badges) wurden in ein einziges, elegantes Dropdown-Panel integriert.
  * Dadurch haben die Hauptnavigations-Buttons deutlich mehr Platz und wirken aufgeräumt und aufgeräumt.
* **Großzügige Megamenu-Dropdowns (480px)**:
  * Erweiterung aller Dropdowns auf 480px mit automatischer Anpassung an kleine Bildschirme (`width: min(480px, calc(100vw - 32px))`).
  * Zweizeilige Beschreibungen und farbige Badges (`Hub`, `Neu`, `Top`, `SQL`, `Algo`, `DevOps`, `Cloud`, `Sec`, `Net`, `Voice`, `IHK`) sind nun maximal lesbar und übersichtlich.
* **Responsiver Hamburger-Drawer für Mobilgeräte**:
  * Automatisches Hamburger-Menü auf kleinen Bildschirmen mit vertikalem Drawer für bequeme Einhand-Bedienung.

#### [v13.3.0] - Modern Footer Redesign, Advanced Knowledge Base & Unified Header Polish
* **Moderner 4-Spaltiger Footer & FAQ (`DsgvoFooterModal.jsx`)**:
  * Vollständig neu gestalteter Footerbereich mit Markendarstellung, Schnellzugriff auf Kurse & Simulatoren, DSGVO-Konformitätshinweis, Quellverweisen (IHK, W3Schools, MDN), interaktivem FAQ-Modal und GitHub-Repository-Link.
* **Erweiterung des Fachwissens & Lerninhalte**:
  * **Neue Fachthemen (`topicsData.js`)**: Detaillierte Module zu *RESTful APIs vs. GraphQL vs. gRPC* (HTTP-Verben, Statuscodes 1xx-5xx, Over-/Underfetching) und *Git Workflows & Rebase Mastery* (Cherry-Pick, Stashing, Conventional Commits) inklusive Code-Beispielen und Quizzes.
  * **Erweitertes IT-Glossar (`glossaryData.js`)**: Neue Definitionen für *Von-Neumann-Architektur*, *B-Tree Indizes*, *SuperMemo-2 (SM-2)* und *Zero Trust Security*.
  * **Erweiterte Karteikarten (`flashcardsData.js`)**: Neue prüfungsrelevante IHK-Karten zu Taktzyklen, Index Scans, Auth vs. Authz, Docker Blueprints und RTO/RPO-Kennzahlen.
* **Header Polish & Dropdown UX (`Navbar.jsx`)**:
  * Sub-Labels, Kategorien-Badges (`Neu`, `Top`, `SQL`, `DevOps`), optimierte Menübreiten und ESC-Key-Schließlogik.

#### [v13.2.0] - Universal Quality Audit, WCAG AAA Accessibility, Colorblind & Dyslexia Perfection
* **Barrierefreiheit & Inklusion (WCAG AAA / Rot-Grün / Dyslexie)**:
  * Erweiterung des Rot-Grün-Schwäche-Modus (`.colorblind-mode`): Automatische geometrische Voransteller (`✓ ` bei Erfolg, `✗ ` bei Fehler/Gefahr) und Umstellung ambivalenter Farben auf blaue/orange Kontrasttöne.
  * Dyslexie-Modus (`.dyslexia-mode`): Spezialschriftart *Atkinson Hyperlegible* mit optimiertem Zeichenabstand (`0.06em`), Wortabstand (`0.15em`) und Zeilenhöhe (`1.9`) für ermüdungsfreies Lesen.
  * High-Contrast-Modus (`.high-contrast-mode`): Sattes Schwarz/Weiß mit Cyan- und Gelb-Akzenten für maximale Sehschärfe.
* **Responsive Layout & Overflow-Schutz**:
  * Vollständige Vermeidung horizontaler Scrollbalken (`max-width: 100%`, `overflow-x: hidden`, `word-break: break-word`).
  * Automatisches `padding-bottom: 70px` auf Mobilgeräten zur Vermeidung von Überlappungen mit der festen `MobileNav`.
* **Projektbereinigung & Dead-Code-Entfernung**:
  * Entfernung der redundanten, ungenutzten Datei `src/index.css`.
  * Bereinigung unbenutzter Imports & React-Hook-Warnungen in `CpuArchitectureLab.jsx`, `ExamSimulator.jsx`, `DsgvoFooterModal.jsx` und `MobileNav.jsx`.
  * Alle 12 Unit-Tests und der Vite-Production-Build laufen 100% fehlerfrei durch.

#### [v13.1.0] - Modern Header Redesign & Responsive Dropdown Navigation
* **Strukturierte Dropdown-Menü-Navigation (`Navbar.jsx`)**:
  * Vollständige Bereinigung der zuvor unübersichtlichen Button-Flut im Header.
  * 4 sauber gruppierte Dropdown-Menüs:
    * **🧪 Labs & Tools:** Schnellzugriff auf alle 25+ Simulatoren (Von-Neumann CPU, SQL Optimizer, Git Graph, Docker, K8s).
    * **🎓 IHK Prüfung:** Abschlussprüfung (AP1/AP2), Mündliches Fachgespräch, Lernfelder 1-12b, Podcast & Quiz Arena.
    * **📚 Kurse & Wissen:** Einsteiger-Kurs, Story-Kampagne, Sprachen-Academy, Web Components, AI Masterclass & Architektur.
    * **🔧 Tools:** IT-Karteikarten (SM-2), IT-Lexikon, Vokabeltrainer, Live Deployment, Backup & Sprache.
  * Perfekt abgestimmte Farbkontraste, Glassmorphism-Dropdown-Panels, Klick-Outside-Handling und flüssige Hover-Animationen.

#### [v13.0.0] - Von-Neumann CPU Simulator, SQL Query Optimizer, IHK Voice Recognition & SM-2 Spaced Repetition
* **Von-Neumann CPU & Register-Simulator (`CpuArchitectureLab.jsx`)**:
  * Visuelle Hardware-Simulation von Steuerwerk (Control Unit), ALU (Addition/Subtraktion), Registern (`PC`, `AC`, `IR`, `MAR`) und 8-Byte RAM-Matrix.
  * Schrittweiser Taktzyklus (Fetch -> Decode -> Execute -> Writeback) mit Datenbus-Leuchtpfaden, Assembler-Interpreter (`LOAD`, `ADD`, `SUB`, `STORE`, `HLT`) und Auto-Run Modus.
* **SQL Query Optimizer & EXPLAIN ANALYZE Lab (`SqlQueryOptimizerLab.jsx`)**:
  * Didaktischer Vergleich von Abfrageplänen: **Full Table Scan (Seq Scan)** vs. **B-Tree Index Scan / Seek** bei großen Tabellen (500k bis 1.2M Rows).
  * Interaktives Anlegen von Indizes (`CREATE INDEX`), Gegenüberstellung von geschätzten I/O-Kosten (Cost-Units) und realer Ausführungszeit (ms).
* **IHK Fachgespräch mit Web Speech API Spracherkennung (`IhkOralExamSimulator.jsx`)**:
  * Echtzeit-Spracheingabe per Mikrofon für Prüflinge mit Live-Audiotranskription und automatischer Keyword-Erkennung.
* **SuperMemo-2 (SM-2) Spaced Repetition & Streak-Freeze Gamification (`srsAlgorithm.js` / `useStore.js` / `DailyChallengeWidget.jsx` / `FlashcardsModal.jsx`)**:
  * Adaptiver SM-2 Spaced Repetition Algorithmus mit dynamischem Ease Factor, Qualitätsbewertung (0 - 5) und Intervallberechnung.
  * Kaufbarer Streak-Freeze Schutzschild im Tages-Challenge-Widget zur Absicherung von Lern-Streaks mit verdienten XP.

#### [v12.0.0] - Global Command Palette (Ctrl+K), IHK AP1 & AP2 Simulator & Git Graph Visualizer
* **Global Command Palette & Schnellsuche (`CommandPaletteModal.jsx`)**:
  * Schnelle Tastatur-Navigation mit `Ctrl + K` / `Cmd + K` über alle Lerneinheiten, Labs, Quests, Glossareinträge und Modale.
  * Live-Filterung, Tastaturnavigation (`↑`, `↓`, `Enter`, `ESC`), Kategoriengruppierung und Icon-Integration.
* **Erweiterter IHK Abschlussprüfungssimulator (`ExamSimulator.jsx` / `examData.js`)**:
  * Offizielle IHK-Prüfungsmodi für **AP1 ("Einrichten eines IT-gestützten Arbeitsplatzes")** sowie **AP2 (FIAE & FISI)**.
  * Realtime 90-Minuten-Prüfungsuhr mit Pause-/Fortsetzen-Funktion, IHK-Standard-Punkteschlüssel (100 Punkte -> Note 1 bis 6) und detaillierten Musterlösungs-Erklärungen.
* **Interaktiver Git Branching & Rebase Graph Visualizer (`GitBranchGraphLab.jsx`)**:
  * Visuelle Darstellung des Git Commit-Baums (SVG-Graph) mit dynamischen Branch-Pointern, HEAD-Indikator und animierten Knoten.
  * Interaktive Git-CLI-Konsole (`git commit`, `git checkout/switch`, `git merge`, `git branch`, `git log`) sowie Schnellauswahl-Buttons und geführte Stufen-Tutorials.
* **Code-Refactoring & Linter-Bereinigung**:
  * Bereinigung unbenutzter Variablen und Imports in `RegexMasterLab.jsx`, `PacketTracerLab.jsx`, `PythonWasmLab.jsx` und `ExamSimulator.jsx`.
  * Nahtlose Integration aller neuen Module in den zentralen `LabsDashboard`-Explorer.

#### [v11.0.0] - WebSockets Protocol, RAG Vector Search, Big-O Arena, OAuth2 PKCE & WASM Rust Playground
* **WebSockets & Real-Time Protocol Lab (`WebSocketProtocolLab.jsx`)**:
  * Simulation des HTTP 101 Switching Protocols Handshakes (`Sec-WebSocket-Key` / `Sec-WebSocket-Accept`).
  * Live-Frame-Inspektor für Text-, Binary- & Ping/Pong-Frames mit Latenz-Messung (ms).
* **Local RAG Vector Database & Embedding Explorer (`VectorSearchLab.jsx`)**:
  * Vektor-Einbettungen (Embeddings) & Berechnung von Kosinus-Ähnlichkeit ($\cos \theta$).
  * Top-K Dokumenten-Retrieval-Ranking für KI-Systeme.
* **Big-O Time & Space Complexity Benchmark Arena (`BigOBenchmarkLab.jsx`)**:
  * Algorithmen-Laufzeit-Benchmark für $O(1)$, $O(\log N)$, $O(N)$, $O(N \log N)$ und $O(N^2)$ bei Skalierung von $N$.
* **OAuth2 PKCE & OIDC Identity Flow Studio (`OauthPkceStudio.jsx`)**:
  * Visueller 4-Schritte PKCE Wizard (`code_verifier`, `code_challenge`, Code Exchange & JWT Claims Decoding).
* **WebAssembly (WASM) & Rust Compilation Playground (`WasmRustStudio.jsx`)**:
  * Rust Quellcode-Editor (`lib.rs`), In-Browser WASM-Bytecode-Compiler (`module.wasm`) & Performance-Benchmark (WASM vs. JS).

#### [v11.0.0] - IHK AP2 Fachgesprächs-Simulator, SQL JOIN Venn Visualizer & Story Kampagnen-Modus
* **IHK AP2 Fachgesprächs- & Projektpräsentations-Simulator (`IhkOralExamSimulator.jsx` / `oralExamData.js`)**:
  * Vollständige 30-Minuten Prüfungssimulation (15 Min. Präsentations-Checkliste mit Phasen-Tracking & 15 Min. Prüfer-Fachgespräch) für Anwendungsentwickler (FIAE) und Systemintegratoren (FISI).
  * Prüfer-Persönlichkeiten (Dr. Architekt, Frau Wirtschaft, Herr Security), fundierte Multiple-Choice-Begründungen und IHK-Notenberechnung (1-6).
* **Visueller SQL JOINs & Venn-Diagramm Builder (`SqlJoinVisualizerLab.jsx`)**:
  * Didaktische Visualisierung von `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, `FULL OUTER JOIN` und `LEFT EXCLUDING JOIN` mit interaktiven Venn-Kreisen.
  * Live In-Memory AlaSQL Ausführung über verknüpfte Tabellen (`Users` & `Orders`), dynamische Ergebnistabelle und Quests.
* **Globaler Story-Kampagnen-Modus ("Vom Noob zum Lead Architect") (`CampaignQuestHub.jsx` / `campaignData.js`)**:
  * 5 aufeinander aufbauende Entwicklungsstufen (Grundlagen, Azubi, Junior Dev, DevOps Engineer, Lead Architect) mit geführten Praxis-Quests und XP-Belohnungen.
* **Erweiterte Testabdeckung (`campaignAndExam.test.js`)**:
  * 100% Validierung aller Prüfungsfragen-Strukturen, Antwortmöglichkeiten und Kampagnen-Kapitel.

#### [v10.0.0] - Code-Splitting, Trees & Graphs Lab, CI/CD Builder & Interactive Labs Hub
* **Performance & Lazy Loading**:
  * Vollständige Umstellung von über 40 Lab- und Spielekomponenten in `App.jsx` auf `React.lazy` und `Suspense` für extrem schnelle Ladezeiten.
  * Bereinigung aller Linter-Fehler (Escape-Sequenzen, ungenutzte Imports) in `ApiMockStudioLab.jsx`, `OauthPkceStudio.jsx`, `GitLab.jsx`, `topicsData.js` und `CtfChallengeLab.jsx`.
* **Data Structures Tree & Graph Lab (`DataStructuresLab.jsx`)**:
  * Interaktive Simulation von Binären Suchbäumen (BST) mit Visualisierung von Inorder-, Preorder- und Postorder-Traversierungen.
  * Dijkstra Kürzeste-Wege-Algorithmus Visualizer mit Adjazenzmatrix, Schritt-für-Schritt Trace und animiertem Pfad.
* **CI/CD Workflow Pipeline Builder (`CiCdWorkflowLab.jsx`)**:
  * Visueller Multi-Stage Pipeline Designer (Checkout, Lint, Unit Tests, Security Scan, Docker Build, Kubernetes Deploy) mit Terminal-Runner und GitHub Actions YAML Export.
* **Interactive Labs & Simulatoren Explorer (`LabsDashboard.jsx`)**:
  * Zentraler Such- und Filter-Hub für alle 25+ Simulatoren nach Kategorien, Tags (#DevOps, #KI, #Security) und Schwierigkeit mit Direktstart.
* **Erweiterte Unit Tests (`useStore.test.js`)**:
  * 100% Testabdeckung für Zustand Store Logik (XP Vergabe, Level Up, Theme & Barrierefreiheits-Toggles, Role Switching).

#### [v9.1.0] - Visual Regex Master, Big-O Benchmark Arena & WebSockets Protocol Studio
* **Visual RegEx Master Quests (`RegexMasterLab.jsx`)**:
  * In-Browser Live Pattern Matcher für Reguläre Ausdrücke (RegEx) mit dynamischem Syntax Highlighting.
  * Gamifizierte Quests (E-Mail Validierung, IPv4 Erkennung, Telefonnummern & Hex-Farbcodes) mit Lösungs-Tipps & Punktebelohnungen.

#### [v9.0.0] - CI/CD GitHub Actions Builder & Docker Compose Multi-Container Studio
* **CI/CD Pipeline & GitHub Actions Builder (`CiCdPipelineLab.jsx`)**:
  * Visueller Workflow-Designer für Linting, Unit Tests, Security Scan, Build, Docker Push & Kubernetes Deployments.
  * Interaktiver Log-Runner und automatische Generierung von `.github/workflows/deploy.yml` Code.
* **Docker Compose Multi-Container Studio (`DockerComposeLab.jsx`)**:
  * Visueller Stack Builder für Frontend, Node API, PostgreSQL & Redis Cache.
  * Simulation von `docker compose up / down` mit Container-Status-LEDs, Log-Streams und Generierung von `docker-compose.yml`.

#### [v8.0.0] - REST API Tester Studio & Cybersecurity CTF Quest Lab
* **REST API Mock Studio (`ApiMockStudioLab.jsx`)**:
  * Postman-Lite API-Testing für HTTP GET, POST, PUT & DELETE mit Headers & JSON-Response Formatting.
* **Cybersecurity CTF Quest Lab (`CtfChallengeLab.jsx`)**:
  * Gamifizierte Hacking-Challenges (Reflected XSS, SQL Injection) mit Flagge-Einreichung (`CTF{...}`) und Punktebelohnungen.

#### [v7.0.0] - VS Code Monaco Studio & Cloud IaC Designer Integration
* **Monaco VS Code Studio (`MonacoStudioLab.jsx`)**:
  * Echter VS Code Editor (`@monaco-editor/react`) im Browser mit Syntax Highlighting & Auto-Completion (IntelliSense) für JS, Python, JSON & HTML.
* **Cloud Infrastructure & Terraform Designer (`CloudDesignerLab.jsx`)**:
  * Visueller Cloud-Architektur Designer (AWS VPC, EC2, RDS) mit automatischer Generierung von Terraform HCL-Code (`main.tf`).

#### [v6.0.0] - Python WASM Sandbox, Packet Tracer & Spaced Repetition Engine
* **Python 3 WASM Execution Sandbox (`PythonWasmLab.jsx`)**:
  * In-Browser Ausführung von Python 3 Skripten (Fibonacci, Algorithmen, Math & Console Logs).
* **Network Packet Tracer & Route Visualizer (`PacketTracerLab.jsx`)**:
  * Interaktive Simulation von ICMP Pings, Gateway Hops (PC ➔ Router ➔ Server) & Paketstatistiken.
* **Leitner Spaced Repetition Flashcard Engine (`LeitnerFlashcardLab.jsx`)**:
  * Karteikasten-Lernsystem mit dynamischer Box-Verschiebung (Box 1 - 5) für schwere IHK-Prüfungsfragen.

#### [v5.0.0] - Enterprise In-Memory SQL Engine, PDF Export & Skill Tree
* **AlaSQL Engine Integration (`SqlDungeon.jsx`)**:
  * Vollständige In-Memory SQL Execution Engine für echte `SELECT`, `JOIN`, `WHERE` und `GROUP BY` Abfragen.
* **jsPDF Zertifikat-Export Engine (`CertificateModal.jsx`)**:
  * Generierung und Download von hochauflösenden, druckfähigen PDF-Zertifikaten im Querformat.
* **RPG Skill Tree Widget (`SkillTreeWidget.jsx`)**:
  * Interaktiver Stufen-Fähigkeitenbaum von IT-Grundlagen bis Cloud Native & Vector AI.

#### [v4.2.0] - Algorithms & Data Structures Visualizer Integration
* **Interaktiver Algorithmen-Visualisierer (`AlgoPlaygroundLab.jsx` / `algorithmData.js`)**:
  * Step-by-Step Animationen für QuickSort, MergeSort & Binäre Suche.
  * Dynamischer Geschwindigkeitsregler, Vergleiche & Zeit-/Speicherkomplexitäts-Übersichten.

#### [v4.1.0] - High-Level IT-Features & Subnetting / Git Lab Integration
* **CIDR Subnetting & Network Calculator Lab (`SubnettingLab.jsx` / `subnettingData.js`)**:
  * Interaktive Subnetz-Berechnung (Netz-ID, Broadcast, erste/letzte nutzbare IP, Binärmasken).
  * IHK-prüfungsrelevantes Übungs-Quiz & Subnetz-Spickzettel.
* **Visual Git Branching & Merging Lab (`GitLab.jsx`)**:
  * Live Commit-Graph-Visualisierer für `git commit`, `branch`, `checkout` und `merge`.
  * Interaktive Terminal-Konsole und geführte Aufgabenstellungen (Quests).

#### [v4.0.0] - Architecture & Gamification Upgrade
* **React Router Integration** für sauberere URL-Navigation.
* **Zustand State Management** als Ersatz für lokale React-States (inklusive Persistenz und SFX-Sound Engine via Web Audio API).
* **Framer Motion** für animierte Page-Transitions und flüssigere UI-Übergänge.
* **Recharts Skill-Matrix** als neues visuelles Radar-Dashboard.
* **PWA (Progressive Web App)** Support mit `vite-plugin-pwa` für echte Offline-Nutzbarkeit.
* **Vitest Testing Framework** Setup für grundlegende Logik-Tests.

#### [v3.2.0] - Full Web Sources Integration (`ausbildung-in-der-it.de`, `it-berufe-podcast.de`, `w3schools.com`, `coursera.org`)
* Complete Content Fetching & Integration von allen angegebenen Web-Quellen.

#### [v3.1.0] - Web Knowledge Integration (IT-Berufe Podcast & Coursera AI)
* IT-Berufe Podcast Module & Coursera AI Module.

#### [v3.0.0] - Ultimate W3Schools Content & Knowledge Upgrade
* Python Complete Guide & Lexikonerweiterung.

#### [v1.0.0] - Initiales Release
* Initiales Setup des IT-DevGame Repositories.
