# 💻 IT-DevGame | Interaktives Informatik-Spiel & Lernplattform für alle Altersgruppen

Ein modernes, gamifiziertes Web-Anwendungs-Framework zum Erlernen von Informatik-Grundlagen für Einsteiger (ohne Vorkenntnisse), IHK Berufsschul-Lernfeldern (ausbildung-in-der-it.de LF 1 - 12b), DNSSEC Cryptographic Chain of Trust & RRSIG Validation Studio (RFC 4035), IHK Agile vs. Waterfall & Burndown Studio (AP2 Teil A), Linux Btrfs / ZFS Copy-on-Write & Snapshot Sandbox, OpenAPI 3.1 & JSON-Schema Contract Testing Studio, TLS 1.3 0-RTT Replay Attack & Anti-Replay Studio (RFC 8446 Early Data), IHK Risikoanalyse & 5x5 Risikomatrix (DIN EN 31010 / FMEA für AP2), eBPF Cilium Service Mesh & L7 Tracing Sandbox, PostgreSQL Index Types Deep Dive (B-Tree, GIN, GiST, BRIN), IHK Wirtschaftlichkeits-, Amortisations- & Make-or-Buy Rechner (AP2 Doku-Modul), Web Crypto API & FIDO2 Passkey Studio (WebAuthn), Linux Systemd Unit Lifecycle & Cgroups v2 Sandbox, WebAssembly 128-Bit SIMD & Sobel Convolution Matrix Studio, IHK Projekt-Gantt & Meilenstein-Editor (AP2 Zeitplanung 80h FIAE / 40h FISI), HTTP/3 & QUIC Protocol Inspector & UDP Packet Loss Recovery Simulator, IndexedDB Store Hydration & Redundanter Persistenz-Layer, IHK Präsentations-Stoppuhr & Folien-Gliederung (15 Min AP2 Teil A), Docker Compose Multi-Container Orchestrator (DAG & Network Isolation), Dynamic CI/CD GitHub Actions Workflow Simulator, Offline IndexedDB Storage Synchronizer, IHK Fachgespräch & Audio-Prüfungssimulator (Web Speech STT/TTS), Ansible Playbook & Idempotenz Studio, Web Worker & Hintergrund-Performance Concurrency Studio, IHK DIN 69900 CPM Netzplantechnik, OMG UML 2.5 Studio, Terraform & OpenTofu IaC Studio, IHK Nutzwertanalyse Studio (NWA), RAID Storage & Paritäts-Rechner, VLSM Subnet Splitter, IHK Projektantrags-Prüfer, OS Prozess-Scheduling & Bankier-Deadlock-Algorithmus, Web-Wireshark Packet Sniffer, Relationalem ERD Designer & 1NF–3NF Linter, Transformer Attention & LLM Sampling Studio, Cloud Architecture SLA & SPOF Canvas, IHK Noten- & MEP-Rechner (AO 2020), 19"-Server-Rack & USV/Klimarechner, ITIL 4 ITSM Service Desk Simulator, SuperMemo SM-2 Spaced Repetition Mastery, Developer Notizbuch & Markdown Vault, Scrum Sprint & Kanban Simulator, GraphQL Schema & Query Explorer, Bluetooth Low Energy (BLE) & GATT Sensor Studio, RegEx Railroad Diagramm Studio, REST API Webhook Inspector & Mock Server, Podcast Voice Quiz Studio, TCO & ROI Wirtschaftlichkeits-Simulator, Git 3-Way Merge Conflict Resolver, Custom Coding Challenge Creator, P2P Multiplayer / LAN Quiz-Duell Arena, SQLite & Relational In-Browser Database Sandbox, Live Coding Challenge Studio, WISO- & Handelskalkulations-Studio, IEEE-754 Gleitkomma & Zahlen-Lab, IPv6 & Routing-Table Simulator, OWASP Top 10 Live-Exploit Sandbox, Neural Network & BPE Tokenizer Studio, druckfertigem IHK Cheat-Sheet PDF-Generator, 365-Tage GitHub-Style Aktivitäts-Heatmap, Pomodoro-Fokus-Timer, Web-Audio SFX-Controller, W3Schools-Style Programmier-Masterclasses, Coursera Deep Learning, Praxis-Projekten, Advanced Prompt Engineering, OAuth2 & OpenID Connect, WebSockets, Performance Profiling, Kubernetes, Local RAG Vector AI, WebAssembly & Rust, Apache Kafka, Docker & Containerisierung, CI/CD, Cybersecurity Red vs Blue Team, 10+ Programmiersprachen, TDD Unit-Testing, i18n Mehrsprachigkeit, Systemarchitektur, Microservices, Design Patterns, Datenbanken, IT-Sicherheit, Logikschaltungen, Netzwerken, Big-O Komplexität, Karriere-Roadmaps, Boss-Battles, Code Typing Speedrun, PWA Offline-Support, Vokabeln und Quizzes – **geeignet für Menschen jeden Alters (ohne Vorwissen) bis hin zu IT-Auszubildenden und erfahrenen Senior-Programmierern**.

---

## 📋 Inhaltsverzeichnis
- [Übersicht & Zielgruppen](#-übersicht--zielgruppen)
- [Hauptfunktionen & Neue Features (v3.36.0)](#-hauptfunktionen--neue-features-v3360-dnssec-ihk-burndown-linux-btrfs-cow--openapi-contract-edition)
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
2. **⚡ IT-Auszubildende (Fachinformatiker AE/SI/DP/DVS, IT-Systemelektroniker, Kaufleute IT-Systemmanagement)**:
   - **IHK Agile vs. Waterfall & Burndown Studio (`IhkAgileBurndownLab.jsx` & `ihkAgileBurndownEngine.js`)**: Praxisorientierter Vorgehensmodell-Entscheider für den IHK-Projektantrag und die Dokumentation (AP2 Teil A). Dynamische Sprint-Burndown-Kurve (Ideal-Linie vs. Ist-Verlauf), Story-Point-Velocity-Berechnung, Scope-Creep-Simulation, Kanban WIP-Bottleneck-Prüfung und 1-Klick IHK-Begründungstext-Generator für hybride Entwicklung nach AO 2020.
   - **IHK Risikoanalyse & 5x5 Risikomatrix Studio (`IhkRiskAnalysisLab.jsx` & `ihkRiskAnalysisEngine.js`)**: DIN EN 31010 / FMEA Standard für die IHK-Abschlussarbeit (AP2 Teil A Pflichtkapitel). Quantifizierung von Eintrittswahrscheinlichkeit ($W \in [1, 5]$) und Schadensausmaß ($S \in [1, 5]$) zur Risikoprioritätszahl ($RPZ \in [1, 25]$), 5x5 Ampel-Matrix, Handlungsstrategien (Vermeidung, Minderung, Übertragung, Akzeptanz) und 1-Klick Markdown-Export für den Projektbericht.
   - **IHK Wirtschaftlichkeits-, Amortisations- & Make-or-Buy Rechner (`IhkWirtschaftlichkeitLab.jsx` & `ihkWirtschaftlichkeitEngine.js`)**: Praxisorientiertes Pflicht-Kalkulationsmodul für die IHK-Projektdokumentation (AP2 Teil A) mit statischer & dynamischer Amortisationsrechnung (Break-Even in Monaten), vollständiger Make-or-Buy Gegenüberstellung (interne Entwicklungskosten vs. SaaS-Lizenzierung über $N$ Jahre), Kostenvergleichs-Matrix (Alt vs. Neu) und 1-Klick IHK-Dokumentations-Markdown-Export.
   - **IHK Projekt-Gantt & Meilenstein-Editor (`IhkProjectGanttLab.jsx` & `ihkProjectGanttEngine.js`)**: Offizielles Zeit- und Phasenplanungs-Studio für den IHK-Abschlussbericht und Projektantrag (AP2 Teil A) mit Profilen für FIAE (80h) und FISI (40h), Kalender-Gantt-Berechnung ohne Wochenenden, Realisierungs- & Dokumentations-Grenzwertprüfungen und Markdown-Export.
   - **IHK Präsentations-Stoppuhr & Folien-Gliederung (`IhkPresentationTimerLab.jsx` & `ihkPresentationTimerEngine.js`)**: Exakt 15-minütige Countdown-Stoppuhr für AP2 Teil A, 4 Phasen-Gliederung mit Zeitbudgets (Einleitung 2 Min, Analyse 4 Min, Entwurf/Realisierung 6 Min, Fazit 3 Min), Web Audio Gong-Warnsignale und Rubriken-Bewertung.
   - **IHK Fachgespräch & Audio-Simulator (`IhkOralDefenseStudioLab.jsx` & `ihkOralDefenseEngine.js`)**: Realistisches 15-Minuten Prüfungs-Fachgespräch vor dem 3-köpfigen IHK-Prüfungsausschuss mit Web Speech Sprachausgabe (TTS) und Einsprechen (STT), Persona-Prüfern, Keyword-Rubrik-Scoring und IHK-Notenvergabe.
   - **Ansible Playbook & Idempotenz Studio (`AnsiblePlaybookLab.jsx` & `ansiblePlaybookEngine.js`)**: Automatisierte Server-Provisionierung für heterogene Host-Inventories, Task-Module (`apt`, `template`, `systemd`) und interaktiver Beweis der Idempotenz (Lauf 1: changed=2, Lauf 2: changed=0).
   - **Web Worker & Concurrency Studio (`ComputationWorkerLab.jsx` & `computationWorkerEngine.js`)**: Vergleichender CPU-Benchmark zwischen Single-Thread Main-Thread (UI friert ein) und Dedicated Web Worker mit 60 FPS Herzschlag-Anzeige und Zero UI-Jank.
   - **IHK Netzplan Studio (`CpmNetworkLab.jsx` & `cpmEngine.js`)**: DIN 69900 Vorgangsknotennetzplan mit Vorwärts-/Rückwärtsrechnung (FAZ, FEZ, SAZ, SEZ), Gesamt- und Freiem Puffer (GP, FP) und automatischem Kritischem Pfad.
   - **UML Studio (`UmlDiagramLab.jsx` & `umlEngine.js`)**: OMG UML 2.5 Sequenz- und Aktivitätsdiagramme mit Live-Mermaid.js-Export und IHK-Konformitäts-Linter.
   - **Terraform & OpenTofu IaC Studio (`TerraformLab.jsx` & `terraformEngine.js`)**: Deklaratives State-Management, Execution Plans (`terraform plan`), DAG-Ressourcenbaum und Cloud State Drift-Erkennung.
   - **IHK Nutzwertanalyse Studio (`NwaScoringLab.jsx` & `nwaEngine.js`)**: Bewertungsmatrix nach DIN/VDI 2225 mit K.O.-Kriterien, Wichtungssummenvalidierung und Sensitivitätsanalyse.
   - **RAID Storage & Paritäts-Rechner (`RaidCalculatorLab.jsx` & `raidEngine.js`)**: RAID 0, 1, 5, 6, 10, 50, Write-Penalty-Faktoren, Rebuild-Zeiten und URE-Wahrscheinlichkeiten.
   - **VLSM Subnet Splitter (`VlsmSubnetLab.jsx` & `vlsmEngine.js`)**: IP-Netzwerk-Segmentierung nach absteigendem Host-Bedarf, Subnetzmasken, Wildcards und Binär-Oktette.
   - **IHK Projektantrags-Prüfer (`IhkProjectProposalLab.jsx` & `ihkProjectProposalEngine.js`)**: Regelprüfer für FIAE (80h), FISI (40h), FIDP (40h), FIDV (40h) mit Qualitäts-Score und Anti-Pattern-Erkennung.
   - **IHK Noten- & MEP-Rechner (`IhkGradeCalculatorLab.jsx` & `ihkGradeCalculations.js`)**: Offizielle AO 2020 Prüfungsordnung, Gewichtungen (AP1 20%, AP2 30%, Projekt 50%) und automatischer Rechner für die **Mündliche Ergänzungsprüfung (MEP)**.
   - **19"-Rack Konfigurator & USV/Klimarechner (`RackConfiguratorLab.jsx` & `rackCalculations.js`)**: 42HE Serverschrank, Schein- & Wirkleistung ($VA, W$), USV-Akkulaufzeit und BTU/h Kühlungslast.
   - **ITIL 4 ITSM & Service Desk Studio (`ItsmSimulatorLab.jsx` & `itsmEngine.js`)**: Incident Queue mit SLA-Timern, Impact $\times$ Urgency Priorisierung und Change Advisory Board (CAB) Risiko-Scoring.
   - **OS Process Scheduler & Deadlock Studio (`OsProcessSchedulerLab.jsx` & `osSchedulerEngine.js`)**: CPU-Scheduling (FCFS, SJF, Round Robin mit Quantum, Priority), animierter Gantt-Chart und Bankier-Algorithmus zur Deadlock-Vermeidung.
   - **Web-Wireshark Packet Sniffer (`PacketSnifferLab.jsx` & `packetSnifferEngine.js`)**: Schichten 2–7 Paket-Dissektion (Ethernet, IP, TCP/UDP, DNS, HTTP), Hex-Dump Synchronisation und Display-Filter.
   - **Relational ERD Designer & 3NF Linter (`ErdDesignerLab.jsx` & `erdDesignerEngine.js`)**: Visuelle Entity-Relationship Modelle, 1NF–3NF Normalisierungs-Audit und produktionsreifer SQL DDL Export.
   - **SuperMemo SM-2 Spaced Repetition Mastery (`Sm2SpacedRepetitionLab.jsx` & `sm2Algorithm.js`)**: Wissenschaftliches Karteikarten-Lernen mit dynamischen Ease-Faktoren ($EF$) und Ebbinghaus-Vergessenskurven.
   - **Developer Notizbuch & Vault (`PersonalNotebookLab.jsx` & `indexedDbStorage.js`)**: Persönliches Markdown-Notizbuch mit asynchroner IndexedDB-Synchronisation, Tag-Suche, LocalStorage Auto-Save und `.md`-Export.
   - Detaillierte IHK-Berufsschul Lernfelder (LF 1 bis LF 12b), **Handelskalkulationen**, **Deckungsbeitragsrechnung & Break-Even-Point**, **Netzplantechnik (CPM)**, **WISO-Arbeitsrecht** und druckfertige **A4 PDF-Spickzettel**.
3. **🚀 Junior Developer & Systemintegratoren**:
   - **OpenAPI 3.1 & JSON-Schema Contract Testing Studio (`OpenApiContractLab.jsx` & `openApiContractEngine.js`)**: Moderne REST-API Vertragsspezifikation und Validierung. Echtzeit-Validierung gegen JSON Schema 2020-12, Erkennung von Breaking Changes (entfernte Endpunkte/Felder, geänderte Typen), automatischer TypeScript DTO Interface Generator und Test-Mock-Payloads.
   - **eBPF Cilium Service Mesh & L7 Tracing Sandbox (`EbpfCiliumLab.jsx` & `ebpfCiliumEngine.js`)**: Sidecarless Cloud-Native Service-to-Service Kommunikation. Linux Kernel Socket-Bypass via `sock_ops` und `sk_msg` Sockmap Redirection, Umgehung von TCP/IP & iptables, Latenz-Speedup von $\sim 4\times$ gegenüber Envoy Sidecars, Einsparung von 65MB RAM pro Pod und L7 HTTP/gRPC Tracing direkt im Kernel.
   - **Linux Systemd Unit Lifecycle & Cgroups v2 Sandbox (`SystemdServiceLab.jsx` & `systemdServiceEngine.js`)**: Vollständiger Linux Service Daemon Simulator mit Unit-Lifecycle (`active`, `activating`, `deactivating`, `failed`), Restart-Policies (`always`, `on-failure`), Cgroups v2 Ressourcen-Limitierung (`CPUQuota=50%`, `MemoryMax=512M`), OOM-Killer Trigger und interaktivem `systemctl` & `journalctl` Terminal-Log-Viewer.
   - **Docker Compose Multi-Container Orchestrator (`DockerComposeLab.jsx` & `dockerComposeEngine.js`)**: Topologische DAG-Startreihenfolge (`depends_on`), Bridge-Netzwerk-Isolation mit Ping-Simulator, persistente Docker-Volumes und Compose 3.8 YAML Generator.
   - **Dynamic CI/CD GitHub Actions Workflow Simulator (`GithubActionsWorkflowLab.jsx` & `githubActionsEngine.js`)**: Mehrstufige Pipelines (`needs`), Dependency Caching (`actions/cache@v4`), Secrets-Maskierung (`***`) und Live ANSI Runner-Logs.
   - **Cloud Architecture SLA & SPOF Canvas (`CloudArchitectureCanvasLab.jsx` & `cloudArchitectureEngine.js`)**: Multi-Tier Topologie-Planung, Compound Availability ($A_{\text{ges}}$), Ausfallzeiten-Rechner und Single-Point-of-Failure Audit.
   - **Transformer Attention & LLM Playground (`TransformerAttentionLab.jsx` & `transformerAttentionEngine.js`)**: Scaled Dot-Product Self-Attention Heatmap, Temperature / Top-P / Top-K Token Sampling und autonome AI-Agenten ReAct-Loops.
   - **GraphQL Schema & Query Explorer (`GraphqlExplorerStudioLab.jsx`)**, **RegEx Railroad Visualizer**, **Webhook Inspector**, **Git 3-Way Merge Conflict Resolver**, **Custom Challenge Creator**, **SQLite WASM Studio** und **Live Coding Challenge Studio**.
4. **🔥 Erfahrene Senior Developer & IT-Architekten**:
   - **DNSSEC Cryptographic Chain of Trust & RRSIG Validation Studio (`DnssecValidationLab.jsx` & `dnssecValidationEngine.js`)**: End-to-End Vertrauenskette von der ICANN Root Zone (`.`) über TLDs (`.de`) bis zur Domain (`example.de`). KSK/ZSK Schlüsseltrennung, SHA-256 DS-Record Hashing, RRSIG Signaturprüfung, NSEC3 Authenticated Denial of Existence gegen Zone Walking und Simulation der Kaminsky DNS Cache Poisoning Abwehr.
   - **Linux Btrfs / ZFS Copy-on-Write (CoW) & Snapshot Sandbox (`LinuxCowSnapshotLab.jsx` & `linuxCowSnapshotEngine.js`)**: Extent-B-Trees, geteilte physische Disk-Blöcke (Refcounts), atomare 0-Byte-Snapshots in Millisekunden, Write-Delta-Allokationen, Instant Rollbacks und Bit-Rot Self-Healing Scrubbing via CRC32C/Blake2b Prüfsummen.
   - **TLS 1.3 0-RTT Replay Attack & Anti-Replay Studio (`TlsReplayLab.jsx` & `tlsReplayEngine.js`)**: RFC 8446 Early Data Sicherheit. Interaktive Demonstration von Replay-Angriffen auf abgefangene 0-RTT HTTP-Requests (Geldüberweisung / POST), Gegenüberstellung idempotenter vs. nicht-idempotenter APIs sowie 3 serverseitige Abwehrmechanismen: Single-Use Ticket-Invalidierung, Client Timestamp Drift-Fenster und Server Strike-Register (Bloom-Filter Hash-Set) inklusive Audit-Linter.
   - **PostgreSQL Index Types Deep Dive (B-Tree, GIN, GiST, BRIN) (`PostgresIndexTypesLab.jsx` & `postgresIndexTypesEngine.js`)**: Interaktiver Performance- und Speicher-Vergleich relationaler Indexstrukturen. B-Tree (Allrounder $O(\log N)$), GIN (Invertierter Index für Volltext und JSONB `@>`), GiST (Mehrdimensionale Geodaten & Ranges `&&`) und BRIN (Block Range Index für Millionen zeitbasierter Datensätze mit $<1\%$ Speicherbedarf eines B-Trees) inklusive automatischem Index-Advisor.
   - **Web Crypto API & Hardware Token Studio (FIDO2 / WebAuthn & Passkeys) (`WebAuthnPasskeyLab.jsx` & `webAuthnEngine.js`)**: Passwortlose Authentifizierung nach W3C WebAuthn Level 3 und FIDO2 Standard mit Hardware-Sicherheitsschlüsseln (YubiKey / Touch ID / Windows Hello), Public-Key Kryptographie (ES256 / RS256), Authenticator Data Flag-Dekodierung (UP, UV, BE, BS) und Replay-Schutz via kryptografischen Challenges.
   - **WebAssembly 128-Bit SIMD & Sobel Convolution Matrix Studio (`WasmSimdStudioLab.jsx` & `wasmSimdEngine.js`)**: 128-Bit Vektor-Register (`v128`, `f32x4`, `i32x4`, `u8x16`), Parallelisierung von 4 Floats in einem CPU-Takt, MFLOPS-Durchsatzmessung gegen skalaren JS-Code, 3x3 Faltungsmatrix-Kerne (Sobel-Edge-Detection, Gaussian-Blur, Sharpen) und WAT Bytecode-Generierung.
   - **Next-Gen Transport: HTTP/3 & QUIC Protocol Inspector (`Http3QuicLab.jsx` & `http3QuicEngine.js`)**: Head-of-Line Blocking Eliminierung bei Paketverlust, Multi-Stream Übertragung über UDP, 0-RTT TLS 1.3 Session Resumption und Connection-ID (CID) Migration.
   - **OWASP Top 10 Live-Exploit Sandbox** (XSS, SQLi, CSRF, IDOR), **Deep Learning Neural Network Forward-Propagation**, **Byte-Pair Encoding (BPE) Tokenizer**, OAuth2 PKCE & JWT Claims Decoding, WebSockets HTTP 101 Handshake, V8 Performance & Memory Leak Profiling, Kubernetes Deployments & RAG Vector AI Pipelines.

---

## ✨ Hauptfunktionen & Neue Features (v3.36.0: DNSSEC, IHK Burndown, Linux Btrfs CoW & OpenAPI Contract Edition)

* **🌐 DNSSEC Cryptographic Chain of Trust & RRSIG Validation Studio (`DnssecValidationLab.jsx` & `src/utils/dnssecValidationEngine.js`)**:
  * Vollständige Validierung der hierarchischen Vertrauenskette nach RFC 4033, 4034 und 4035:
    * **Root Zone (.)**: KSK (Key Signing Key) als lokaler Trust Anchor des Resolvers.
    * **TLD Zone (.de)**: DS-Record (Delegation Signer) mit kryptografischem SHA-256 Digest-Match auf den Root-Schlüssel.
    * **Domain Zone (example.de)**: Parent DS verifiziert Domain-KSK, KSK signiert den Zone Signing Key (ZSK), und ZSK signiert die Nutzdaten-RRsets (A-Records) mittels `RRSIG`.
  * **Interaktive Fehler- & Angriffs-Injektion**:
    * Manipulierter DS-Hash im Parent -> Kette bricht ab, Status wechselt sofort auf `BOGUS` (`SERVFAIL`).
    * Kompromittierte ZSK-Signatur oder abgelaufene RRSIG-Gültigkeitsdauer (`expiration`) -> Replay-Angriffe und gefälschte IP-Adressen werden blockiert.
  * **NSEC3 Authenticated Denial of Existence Simulator (RFC 5155)**:
    * Beweist kryptografisch Nichtexistenz (`NXDOMAIN`), indem angefragte Subdomains in gehashte, gesalzene Intervalle eingeordnet werden – ohne Namen im Klartext preiszugeben (Schutz vor Dictionary- und Zone-Walking-Angriffen).
  * **Dan Kaminsky DNS Cache Poisoning Sandbox (2008)**:
    * Interaktiver Direktvergleich: Ohne DNSSEC führt das Erraten der 16-Bit Transaction ID zur Cache-Vergiftung und Nutzerumleitung; mit DNSSEC verwirft der Resolver unsignierte Spoofing-Pakete automatisch inklusive 65 XP Belohnung.
* **📈 IHK Agile vs. Waterfall & Burndown Studio (`IhkAgileBurndownLab.jsx` & `src/utils/ihkAgileBurndownEngine.js`)**:
  * Offizielles Methoden- und Controlling-Studio für die IHK-Abschlussprüfung Teil 2 (AP2 Teil A Pflichtthema).
  * **Sprint Burndown Chart (Ideal vs. Ist)**:
    * Dynamisches SVG-Diagramm mit linearer Ideallinie und tatsächlicher Punkteentwicklung über 5 bis 15 Arbeitstage.
    * **Velocity-Messung**: Ermittelt die Team-Geschwindigkeit (Story Points / Tag) und prognostiziert die Erreichbarkeit des Sprint-Ziels.
    * **Scope-Creep Simulation**: Injektion ungeplanter Anforderungen zur Laufzeit und deren visuelle Auswirkung auf den Restaufwand.
  * **IHK-Vorgehensmodell-Entscheider & Vergleichsmatrix**:
    * Systematische Gegenüberstellung von Wasserfall (klassisch), Scrum (agil) und dem **hybriden Vorgehensmodell** (IHK-Best-Practice nach AO 2020: starre Phasen für Analyse/Doku, agile Sprints im Entwicklungskern).
  * **1-Klick IHK-Begründungstext-Generator**:
    * Erzeugt prüfungskonforme Markdown-Begründungen für Projektantrag und Dokumentation (differenziert nach FIAE 80h und FISI 40h).
  * **Kanban WIP Bottleneck Inspector**:
    * Visuelle Spaltenüberwachung mit Work-in-Progress Limits nach Little's Law, Warnung bei Überlastung und Handlungsempfehlungen inklusive 60 XP Belohnung.
* **💾 Linux Btrfs / ZFS Copy-on-Write & Snapshot Sandbox (`LinuxCowSnapshotLab.jsx` & `src/utils/linuxCowSnapshotEngine.js`)**:
  * Tiefgehende Simulation moderner CoW-Dateisysteme auf Block- und Extent-Ebene.
  * **Geteilte physische Blöcke & Refcounts**:
    * Atomare Snapshot-Erstellung (`btrfs subvolume snapshot -r @root @snap-1`) in Millisekunden mit **0 zusätzlichen physischen Bytes** auf der SSD.
  * **Copy-on-Write Write-Deltas**:
    * Beim Ändern einer Datei (`/etc/systemd.conf`) wird der physische Sektor nicht überschrieben, sondern ein neuer Block alloziert.
    * Der aktive Subvolume-Pointer wechselt auf den neuen Block, während der Snapshot unverändert auf den alten Block zeigt.
  * **Instant Snapshot Rollback**:
    * Blitzschnelle Wiederherstellung von Systemzuständen ohne Gigabyte-Kopiervorgänge.
  * **Bit-Rot & Self-Healing Scrubbing**:
    * Simulation stiller Datenkorruption (Hardware Bit-Flips).
    * `btrfs scrub start`: Erkennt Checksummen-Fehler (CRC32C / Blake2b) und repariert beschädigte Blöcke automatisch aus intakten DUP/Mirror-Kopien inklusive 70 XP Belohnung.
* **📑 OpenAPI 3.1 & JSON-Schema Contract Testing Studio (`OpenApiContractLab.jsx` & `src/utils/openApiContractEngine.js`)**:
  * Vollständiges REST-API Spezifikations- und Validierungs-Studio nach OpenAPI 3.1 und JSON Schema 2020-12.
  * **Live Contract Validator**:
    * Interaktiver JSON-Payload-Editor zur Echtzeitprüfung gegen OpenAPI Schemas (`type`, `required`, `minimum`, `minLength`, `format: 'email'`, `enum`).
    * Detaillierte Fehleraufschlüsselung bei Schnittstellenverletzungen (HTTP 422).
  * **Breaking Change Detector (v1.0 vs. v2.0)**:
    * Automatisierte Erkennung abwärtsinkompatibler Änderungen (neue Pflichtfelder im Request, entfernte Response-Felder, geänderte Datentypen, gelöschte Endpunkte) vs. sichere Erweiterungen (optionale Felder).
  * **Code- & Mock-Generator**:
    * 1-Klick Export von typsicheren **TypeScript DTO Interfaces** und realistischen JSON Test-Mocks inklusive 65 XP Belohnung.

* **🔒 TLS 1.3 0-RTT Replay Attack & Anti-Replay Studio (`TlsReplayLab.jsx` & `src/utils/tlsReplayEngine.js`)**:
  * Vollständige Simulation von **0-RTT Early Data** nach RFC 8446 zur Latenz-Optimierung bei wiederholten Verbindungen.
  * **Replay-Angriffsszenario**: Veranschaulicht, wie ein Netzwerk-Sniffer abgefangene 0-RTT Pakete replizieren kann und warum nicht-idempotente Requests (`POST /transfers`) katastrophale Doppelausführungen nach sich ziehen.
  * **3 serverseitige Abwehrmechanismen**:
    * **Single-Use Session Tickets**: Automatische Invalidierung des PSKs nach einmaliger Nutzung.
    * **Client Hello Timestamps**: Abweisung von Paketen mit Zeitabweichung außerhalb des 5-Sekunden-Fensters.
    * **Server Strike-Register**: In-Memory Hash-Set / Bloom-Filter zur Erkennung bereits gesehener Ticket-Hashes.
  * **Server Security Audit Engine**: Bewertet die Serverkonfiguration (Note A+ bis F) und warnt vor RFC 8446 Sicherheitsverstößen inklusive 50 XP Belohnung.
* **🏢 IHK Risikoanalyse & 5x5 Risikomatrix Studio (`IhkRiskAnalysisLab.jsx` & `src/utils/ihkRiskAnalysisEngine.js`)**:
  * Offizielles Risikomanagement-Studio nach **DIN EN 31010** und **FMEA** für das Pflichtkapitel in der IHK-Projektdokumentation (AP2 Teil A).
  * **Quantifizierung & Bewertung**: Berechnung der Risikoprioritätszahl ($RPZ = W \times S$) aus Eintrittswahrscheinlichkeit ($W \in [1, 5]$) und Schadensausmaß ($S \in [1, 5]$).
  * **Interaktive 5x5 Ampel-Matrix**: Visualisiert Risiken in Grün (1–6, akzeptabel), Gelb (7–14, Überwachung) und Rot (15–25, kritisch).
  * **Handlungsstrategien**: Zuordnung von Vermeidung (Avoidance), Verminderung (Mitigation), Übertragung (Transfer) und Akzeptanz (Retention) mit Erfassung konkreter Präventivmaßnahmen und Notfallplänen (Contingency Plans).
  * **1-Klick IHK-Markdown-Export**: Erzeugt eine druckfertige Risikotabelle zur direkten Einbindung in die Fachdokumentation inklusive 60 XP Belohnung.
* **📦 eBPF Cilium Service Mesh & L7 Tracing Sandbox (`EbpfCiliumLab.jsx` & `src/utils/ebpfCiliumEngine.js`)**:
  * Next-Gen Cloud-Native Architektur: Gegenüberstellung von traditionellem **Envoy Sidecar Proxy** vs. **Cilium eBPF Socket-Bypass**.
  * **Kernel Socket Redirection**: Demonstration von `sock_ops` und `sk_msg` zur direkten Verbindung von Sockets im Kernel-Speicher unter Umgehung des TCP/IP-Stacks, veth-Paaren und iptables.
  * **Performance & Benchmark**: Misst Latenzvorteile ($\sim 4\times$ Speedup von 2.65ms auf 0.35ms) und zeigt die RAM-Einsparung (0 MB vs. 65 MB pro Pod-Sidecar).
  * **Integrierter eBPF C-Code Viewer**: Zeigt den nativen C-Code mit `BPF_MAP_TYPE_SOCKHASH` und `bpf_msg_redirect_hash` inklusive 55 XP Belohnung.
* **📊 PostgreSQL Index Types Deep Dive (B-Tree, GIN, GiST, BRIN) (`PostgresIndexTypesLab.jsx` & `src/utils/postgresIndexTypesEngine.js`)**:
  * Tiefgreifender Vergleich der 4 Kern-Indexstrukturen moderner Datenbanksysteme.
  * **B-Tree**: Balanced Tree für Gleichheits- und Bereichsabfragen (`=`, `<`, `>`, `BETWEEN`, `ORDER BY`).
  * **GIN**: Generalized Inverted Index für JSONB (`@>`), Text-Arrays und PostgreSQL Volltextsuche (`to_tsvector @@ to_tsquery`).
  * **GiST**: Generalized Search Tree für mehrdimensionale Geodaten (PostGIS), Polygone und Bounding-Box Überlappungen (`&&`).
  * **BRIN**: Block Range Index für riesige, chronologisch wachsende Tabellen (10M+ Zeilen), der über 98% Speicherplatz gegenüber B-Tree einspart.
  * **Intelligenter Index Advisor**: Ermittelt anhand von Datentyp, Abfragemuster und Tabellengröße den optimalen Indextyp und generiert produktionsreife SQL DDL Statements inklusive 50 XP Belohnung.

* **💰 IHK Wirtschaftlichkeits-, Amortisations- & Make-or-Buy Rechner (`IhkWirtschaftlichkeitLab.jsx` & `src/utils/ihkWirtschaftlichkeitEngine.js`)**:
  * Offizielles Wirtschaftlichkeits- und Kostenkalkulations-Tool für die IHK-Abschlussarbeit (AP2 Teil A für FIAE & FISI).
  * **Amortisationsrechnung (Break-Even)**: Statische und dynamische Berechnung der Amortisationsdauer in Monaten, Netto-Einsparungen über den Analysezeitraum und kumulierter ROI-Gewinnverlauf.
  * **Make-or-Buy Analyse**: Quantitative Gegenüberstellung von Eigenentwicklung (Entwicklerstunden $\times$ Stundensatz + Hardware/Software + Wartung) vs. Fremdbezug / SaaS-Lösung über $N$ Jahre mit klarer Handlungsempfehlung.
  * **Kostenvergleich Alt vs. Neu**: Detaillierte Gegenüberstellung laufender Personal-, Lizenz- und Hostingkosten vor und nach Einführung des Projekts.
  * 1-Klick **IHK-Markdown-Export** mit formatierten Tabellen und Zusammenfassung zur direkten Übernahme in Kapitel "Wirtschaftlichkeitsanalyse" der Projektdokumentation inklusive 65 XP Belohnung.
* **🔑 Web Crypto API & Hardware Token Studio: FIDO2, WebAuthn & Passkeys (`WebAuthnPasskeyLab.jsx` & `src/utils/webAuthnEngine.js`)**:
  * Passwortlose Authentifizierung nach W3C WebAuthn Level 3 und FIDO2 Standard.
  * **Registrierungs-Flow**: Erstellung von Public/Private Keypaaren (`navigator.credentials.create`), Dekodierung von `clientDataJSON` und `attestationObject`.
  * **Login-Flow**: Kryptografische Signaturprüfung von Server-Challenges mit dem privaten Schlüssel des Authenticators (`navigator.credentials.get`).
  * **Authenticator Data Flag-Inspektor**: Visuelle Dekodierung des 1-Byte Flag-Registers (User Present `UP`, User Verified `UV`, Backup Eligibility `BE`, Backup State `BS`).
  * Schutz vor Phishing und Man-in-the-Middle durch Origin-Bindung und Replay-Prävention via kryptografischer Challenge mit 55 XP Belohnung.
* **🐧 Linux Systemd Unit Lifecycle & Cgroups v2 Service Sandbox (`SystemdServiceLab.jsx` & `src/utils/systemdServiceEngine.js`)**:
  * Interaktive Simulation von Linux Service Daemons (`.service` Unit-Dateien) und Cgroups v2 Ressourcen-Limitierung.
  * **Unit Lifecycle**: Visualisierung der internen Systemd-Zustände (`inactive`, `activating`, `active (running)`, `deactivating`, `failed`) inklusive `systemctl start / stop / restart / reload`.
  * **Restart-Policies**: Simulation von `Restart=always`, `Restart=on-failure` und `RestartSec=2s` mit Crash-Injektor und automatischem Restart-Counter.
  * **Cgroups v2 Ressourcen-Limits**: Konfiguration von `CPUQuota=50%` und `MemoryMax=512M` mit OOM-Killer-Auslösung bei Speicherüberschreitung.
  * Dynamischer **Systemd Unit File Generator** (`[Unit]`, `[Service]`, `[Install]`) und Live `journalctl -u service -f` Terminal-Log-Stream mit 50 XP Belohnung.
* **⚡ WebAssembly SIMD 3x3 Faltungsmatrix & Sobel-Filter Upgrade (`WasmSimdStudioLab.jsx` & `src/utils/wasmSimdEngine.js`)**:
  * Erweiterung des WASM SIMD Studios um 2D-Bildfaltungs-Algorithmen (Image Convolutions).
  * Vordefinierte 3x3 Faltungskerne: **Sobel X/Y** (Kantenerkennung / Gradienten-Operator), **Gaußscher Weichzeichner** (3x3 Gaussian Blur Smoothing) und **Scharfzeichnen** (Sharpening Kernel).
  * Parallele Vektorberechnung: Parallele Berechnung von 4 Float-Nachbarpixeln bzw. 16 Farb-Bytes in einem CPU-Takt via `v128` Vektormultiplikation und Fused Multiply-Add (FMA) mit gemessenem Hardware-Speedup von bis zu $\sim 3.9\times$.
  * Interaktiver Live-Test-Matrix-Inspektor mit direkter Auswertung über `applySimdConvolutionFilter`.

* **📅 IHK Projekt-Gantt & Meilenstein-Editor (`IhkProjectGanttLab.jsx` & `src/utils/ihkProjectGanttEngine.js`)**:
  * Offizielles Zeitplanungs- und Phasen-Tool für den IHK-Abschlussbericht und Projektantrag (AP2 Teil A).
  * Vordefinierte Standardphasen nach IHK-Prüfungsvorschriften für **FIAE (80 Stunden)** und **FISI (40 Stunden)**.
  * Interaktiver Gantt-Zeitstrahl mit Kalenderberechnung (Ausschluss von Wochenenden), konfigurierbarem Startdatum und visuellen Meilenstein-Flags (🚩).
  * Regelprüfungs-Engine: Validiert exakte Soll-Stundenvorgaben (80h/40h), prüft den Realisierungsanteil ($\le 50\%$) und fordert eine angemessene Dokumentationsphase ($\ge 10-15\%$).
  * 1-Klick **Markdown-Export** zur direkten Übernahme in den IHK-Projektantrag mit XP-Belohnung.
* **⚡ WebAssembly 128-Bit SIMD & Vector Processing Studio (`WasmSimdStudioLab.jsx` & `src/utils/wasmSimdEngine.js`)**:
  * Parallele Datenverarbeitung mit 128-Bit Vektor-Registern (`v128`) und 4-Lane Float32 (`f32x4`), Integer (`i32x4`) sowie 16-Lane Byte-Verarbeitung (`u8x16`).
  * Interaktive Register-Visualisierung: Lane-by-Lane Input für Vektoren A & B mit gleichzeitiger Berechnung in 1 CPU-Taktzyklus.
  * Live Benchmark-Runner: Vergleicht traditionellen skalaren JavaScript-Schleifencode mit unrolled SIMD-Vektorbefehlen auf bis zu 500.000 Float-Elementen und misst Speedup ($\sim 3.8\times$) und Durchsatz in **MFLOPS**.
  * Integrierter **WebAssembly Text Format (WAT)** Bytecode-Inspektor mit `v128.load`, `f32x4.add/mul` und `v128.store`.
* **🌐 HTTP/3 & QUIC Protocol Inspector & UDP Packet Loss Simulator (`Http3QuicLab.jsx` & `src/utils/http3QuicEngine.js`)**:
  * Vollwertiger Protokoll-Simulator zum praxisnahen Vergleich von **HTTP/1.1** (6 parallele TCP-Sockets), **HTTP/2** (Single-TCP Multiplexing) und **HTTP/3** (QUIC über UDP).
  * Paketverlust-Simulator (0–35% Packet Loss): Veranschaulicht eindrucksvoll das Problem des **TCP Head-of-Line Blockings** in HTTP/2 (1 verloren gegangenes Paket stoppt alle parallelen Streams) vs. unabhängige QUIC-Streams in HTTP/3.
  * Handshake-Latenz-Inspektor: Visualisiert 2–3 RTTs bei TCP + TLS gegenüber 1-RTT Initial-Handshake und **0-RTT Session Resumption** (Early Data) bei QUIC.
  * Connection Migration Simulation: Nahtloser unterbrechungsfreier Netzwerkwechsel (WLAN $\leftrightarrow$ 5G Mobilfunk) dank 64-Bit Connection-ID (CID) im QUIC-Header ohne Socket-Teardown.
* **💾 IndexedDB Store Hydration & Redundante Persistenz-Middleware (`src/utils/indexedDbStoreMiddleware.js`)**:
  * Dual-Persistence Synchronisation: Spiegelung aller Benutzerdaten und Lernfortschritte asynchron in den NoSQL-ObjectStore (`it_devgame_db.keyvalue`).
  * Notfall-Hydration: Stellt den vollständigen Zustand wieder her, falls `localStorage` gelöscht wird oder das 5-MB-Browser-Quota überschreitet.
  * Snapshot-Management: Erstellung, Auflistung und Löschung benannter System-Checkpoints mit Zeitstempel.

* **⏱️ IHK Präsentations-Stoppuhr & Folien-Gliederungs Studio (`IhkPresentationTimerLab.jsx` & `src/utils/ihkPresentationTimerEngine.js`)**:
  * 15-Minuten Zeitmanagement- und Countdown-Studio für die IHK-Abschlussprüfung Teil 2 (AP2 Teil A).
  * 4 strukturierte Phasen nach offiziellem IHK-Standard: Einleitung & Problemstellung (2 Min), Analyse & Wirtschaftlichkeit (4 Min), Entwurf & Realisierung (6 Min), QS, Fazit & Ausblick (3 Min).
  * Web Audio Synthesizer: Akustisches Gong-Signal bei Phasenwechseln sowie Warnsignal 1 Minute vor Ablauf des 15-Minuten-Limits.
  * Interaktive IHK-Bewertungsmatrix (Rubriken: Struktur, Fachliche Tiefe, Medieneinsatz, Vortrag, Timing) mit Notenberechnung (1–6) und XP-Belohnung.
* **🐳 Docker Compose Multi-Container Orchestrator (`DockerComposeLab.jsx` & `src/utils/dockerComposeEngine.js`)**:
  * Vollständige DAG-Auflösung von Service-Startreihenfolgen via Kahn-Topologie anhand von `depends_on` (z. B. `postgres` & `redis` vor `api`, danach `web`).
  * Interaktiver Netzwerk-Isolations- und Ping-Simulator: Visualisiert, warum Frontend-Container aus Sicherheitsgründen die interne Datenbank im Backend-Netzwerk nicht direkt erreichen können.
  * Named Volumes und Bind-Mounts Inspektion sowie dynamischer Export von produktionsreifem `docker-compose.yml` (Version 3.8).
* **⚡ Dynamic CI/CD GitHub Actions Workflow Simulator (`GithubActionsWorkflowLab.jsx` & `src/utils/githubActionsEngine.js`)**:
  * Parallele und sequentielle Job-Ausführung anhand von `needs`-Abhängigkeiten.
  * Dependency-Caching-Simulation via `actions/cache@v4`: Misst Geschwindigkeitsvorteile durch Cache-Hits vs. Remote-Downloads bei Cache-Misses.
  * Secrets-Maskierung im Runner-Log (automatischer Ersatz von sensiblen Tokens durch `***`) und Live ANSI-Farb-Ausgabe.
* **💾 Offline IndexedDB Storage Synchronizer & Database Layer (`PersonalNotebookLab.jsx` & `src/utils/indexedDbStorage.js`)**:
  * Asynchrone, unbegrenzte Offline-Persistenz über das 5-MB-LocalStorage-Limit hinaus.
  * Dual-Save-Architektur im Entwickler-Notizbuch (`PersonalNotebookLab.jsx`) mit automatischer Synchronisation und "IndexedDB Offline-Sync: Aktiv"-Statusanzeige.

* **🎙️ IHK Fachgespräch & Audio-Prüfungssimulator (`IhkOralDefenseStudioLab.jsx` & `src/utils/ihkOralDefenseEngine.js`)**:
  * 15-Minuten mündliche Prüfungssimulation für die IHK Abschlussprüfung Teil 2 (Fachinformatiker FIAE / FISI).
  * Web Speech API Integration: Audiowiedergabe der Prüferfragen via Sprachausgabe (TTS) sowie freiwilliges Diktieren der Antworten via Spracheingabe (STT) mit stufenlosem Textarea-Fallback.
  * 3 authentische IHK-Prüfer-Personas (Dr. Weber für Architektur & Fachtiefe, Fr. Sommer für Projektphasen & QS, Hr. Becker für WISO & Wirtschaftlichkeit).
  * Ausführliche Keyword-Rubrik-Bewertung mit individueller Punkteverteilung, qualitativen Feedbacktexten und offizieller IHK-Notenberechnung (Schlüssel 1–6) inklusive XP-Belohnung.
* **⚙️ Ansible Playbook & Idempotenz Studio (`AnsiblePlaybookLab.jsx` & `src/utils/ansiblePlaybookEngine.js`)**:
  * Vollständige Simulation deklarativer Konfigurationsverwaltung (Infrastructure as Code) für Webserver- und Datenbank-Cluster.
  * Simulation heterogener Host-Inventories (`inventory.ini`) und YAML Playbook Tasks (`apt`, `template`, `systemd`).
  * Interaktiver Nachweis des Kernprinzips der **Idempotenz**: Beim 1. Durchlauf werden Pakete installiert und Konfigurationen geändert (`changed=2`). Bei wiederholter Ausführung bleibt der Systemzustand identisch (`changed=0`, `ok=3`), wodurch XP für den bewiesenen Idempotenz-Nachweis vergeben werden.
* **⚡ Web Worker & Hintergrund-Performance Studio (`ComputationWorkerLab.jsx` & `src/utils/computationWorkerEngine.js`)**:
  * Direkter Performance-Vergleich rechenintensiver CPU-Tasks (Eratosthenes Primzahl-Sieb, Monte-Carlo URE-Ausfallszenarien) zwischen Single-Thread Main-Thread und nebenläufigem Dedicated Web Worker.
  * Animierte 60-FPS Herzschlag-Gauges zur Visualisierung von Frame-Drops und UI-Blockaden auf dem Haupt-Thread vs. flüssiger Benutzeroberfläche bei Auslagerung in Web Worker.
* **🔀 IHK Netzplan Studio (CPM / DIN 69900) (`CpmNetworkLab.jsx` & `src/utils/cpmEngine.js`)**:
  * Vollständige Berechnung nach DIN 69900: Vorwärtsrechnung (FAZ, FEZ) und Rückwärtsrechnung (SAZ, SEZ).
  * Berechnung des Gesamtpuffers ($GP = SAZ - FAZ$) und Freien Puffers ($FP = \min(FAZ_{\text{Nachfolger}}) - FEZ$).
  * Automatische Identifizierung des **Kritischen Pfads** (Vorgänge mit $GP = 0$) mit visuellem Signal-Highlight und Zyklen-Erkennung via Kahn-Topologie.
* **📐 UML Studio: Sequenz- & Aktivitätsdiagramme (`UmlDiagramLab.jsx` & `src/utils/umlEngine.js`)**:
  * Modellierung von Interaktionen (Synchron `->>`, Asynchron `-))`, Rückgabe `-->>`) und Geschäftsprozessen (Entscheidungs-Guards, Forks, Joins).
  * 1-Klick **Mermaid.js Export** für Projektdokumentationen und automatische IHK-Konformitätsprüfung (fehlende Antworten, unaufgelöste Aufrufe).
* **☁️ Terraform & OpenTofu IaC Studio (`TerraformLab.jsx` & `src/utils/terraformEngine.js`)**:
  * Directed Acyclic Graph (DAG) Ressourcenbaum zur Ermittlung paralleler/sequenzieller Bereitstellungsstufen.
  * Interaktiver Terminal-Diff-Simulator für `terraform plan` (`+ create`, `~ update in-place`, `- destroy`) und Cloud State Drift-Erkennung.
* **📊 IHK Nutzwertanalyse Studio (NWA) (`NwaScoringLab.jsx` & `src/utils/nwaEngine.js`)**:
  * Offizielle IHK-Entscheidungsmatrix nach DIN / VDI 2225: Gewichtete Punktbewertung (Wichtungen $\sum w_i = 100\%$), Ausschlusskriterien (K.O.-Kriterien), Sensitivitätsanalyse bei Wichtungsverschiebungen und tabellarischer CSV/Text-Export.
* **💾 RAID Storage & Paritäts-Rechner (`RaidCalculatorLab.jsx` & `src/utils/raidEngine.js`)**:
  * Simulation von RAID 0, 1, 5, 6, 10 und 50. Berechnung von Netto-Nutzdaten, Paritäts-Overhead, tolerierten Plattenausfällen, Write-Penalty ($4\times$ bei RAID 5, $6\times$ bei RAID 6), Rebuild-Dauer und Unrecoverable Read Error (URE) Wahrscheinlichkeiten ($1 - (1 - 10^{-14})^{\text{Bits}}$) mit visueller Disk-Block-Striping-Matrix.
* **🌐 VLSM Subnet Splitter & IP-Rechner (`VlsmSubnetLab.jsx` & `src/utils/vlsmEngine.js`)**:
  * Variable Length Subnet Masking nach IHK FISI / AP1 Standard. Automatische absteigende Host-Sortierung zur kollisionsfreien Vergabe, Berechnung von CIDR-Präfixen, Subnetzmasken, Wildcards, Broadcast-Adressen und Nutzhost-Bereichen mit Binär-Oktett-Darstellung.
* **📝 IHK Projektantrags-Prüfer (`IhkProjectProposalLab.jsx` & `src/utils/ihkProjectProposalEngine.js`)**:
  * Automatisierter IHK-Konformitätsprüfer für Abschlussarbeiten nach Berufsordnung (FIAE 80h, FISI 40h, FIDP 40h, FIDV 40h). Phasen- und Zeitbudgets-Validierung (Analyse, Entwurf, Implementierung, QS, Dokumentation), Anti-Pattern-Detektor (z. B. "Installationsarbeiten", fehlende Wirtschaftlichkeitsanalyse) und IHK-Qualitäts-Score (0–100 Punkte).
* **⏱️ OS Process Scheduler & Deadlock Studio (`OsProcessSchedulerLab.jsx` & `osSchedulerEngine.js`)**:
  * Vollwertige Simulation von FCFS, Shortest Job First (SJF), Round Robin (mit dynamischem Time-Quantum-Slider) und Priority Scheduling.
  * Animiertes Echtzeit-**Gantt-Diagramm** mit automatischer Berechnung von $T_{WT}$ (Wartezeit), $T_{TAT}$ (Turnaround) und CPU-Auslastung.
  * **Bankier-Algorithmus (Banker's Algorithm)** zur Deadlock-Vermeidung mit Allokations-, Maximal- und Bedarfs-Matrizen sowie Safe-Sequence-Ermittlung.
* **📡 Web-Wireshark Packet Sniffer & Frame Analyzer (`PacketSnifferLab.jsx` & `packetSnifferEngine.js`)**:
  * Packet Dissection für Ethernet II, IPv4/IPv6, TCP/UDP, DNS und HTTP.
  * Synchroner **Hex-Dump & ASCII-Viewer**: Klick auf ein Header-Feld hebt im Hex-Dump die exakte Byte-Range farblich hervor.
  * Wireshark-Style Display-Filter (z. B. `tcp`, `http`, `ip.src == 192.168.1.45`, `tcp.port == 443`).
* **🗄️ Relational ERD Designer & Normalform-Linter (`ErdDesignerLab.jsx` & `erdDesignerEngine.js`)**:
  * Interaktiver Visualisierer für relationale Datenbank-Tabellen (PK, FK, Typen, Not Null) und Beziehungen (1:1, 1:N, N:M / Crow's Foot).
  * **Normalisierungs-Linter (1NF, 2NF, 3NF)**: Erkennt fehlende Primärschlüssel, nicht-atomare Werte und transitive Abhängigkeiten.
  * 1-Klick **SQL DDL Generator** für PostgreSQL, MySQL und SQLite.
* **🧠 Transformer Self-Attention & LLM Playground (`TransformerAttentionLab.jsx` & `transformerAttentionEngine.js`)**:
  * Interaktive **Self-Attention Heatmap** ($QK^T / \sqrt{d_k}$) zur Visualisierung semantischer Wort-Aufmerksamkeiten.
  * **Next-Token Sampling Simulator** mit Schiebereglern für Temperature ($T$), Top-K und Top-P (Nucleus).
  * Autonomer **AI-Agent ReAct-Loop** (Thought $\rightarrow$ Action $\rightarrow$ Observation $\rightarrow$ Final Answer).
* **☁️ Cloud Architecture SLA & SPOF Canvas (`CloudArchitectureCanvasLab.jsx` & `cloudArchitectureEngine.js`)**:
  * Multi-Tier Cloud-Topologie-Planung (WAF, CDN, ALB, ASG Clusters, Redis, RDS Multi-AZ, S3).
  * Compound SLA-Berechnung (Seriell vs. Parallel) und exakte jährliche Ausfallzeit (Minuten / Stunden / Tage).
  * Automatischer **Single Point of Failure (SPOF) Audit** und monatliche TCO-Kostenschätzung.
* **🎓 IHK Noten- & MEP-Rechner (`IhkGradeCalculatorLab.jsx` & `ihkGradeCalculations.js`)**:
  * Konform mit der aktuellen Prüfungsordnung **AO 2020** für alle IT-Berufe (FIAE, FISI, FIDP, FIDV, ITSE, Kaufleute).
  * Gewichtung: AP1 (20%), AP2 Teil 1 (10%), AP2 Teil 2 (10%), AP2 WiSo (10%), Dokumentation & Fachgespräch (50%).
  * Prüfung der Bestehensregeln und automatischer **Mündliche Ergänzungsprüfung (MEP) Rechner** zur Ermittlung der benötigten Mindestpunkte.
* **🗄️ 19"-Server-Rack Konfigurator & USV/Klimarechner (`RackConfiguratorLab.jsx` & `rackCalculations.js`)**:
  * Visueller 42HE Serverschrank mit Bestückung (Storage Server, GPU Server, Managed PoE Switches, Patchfelder, USV).
  * Berechnung von Scheinleistung (VA), Wirkleistung (Watt), Leistungsfaktor ($\cos \phi$), USV-Akkulaufzeit und RZ-Klimatisierung (BTU/h & kW).
* **🎧 ITIL 4 ITSM & Service Desk Management Studio (`ItsmSimulatorLab.jsx` & `itsmEngine.js`)**:
  * Service Desk Ticket-Warteschlange (Incidents, Service Requests, Problems, Change Requests) mit SLA-Countdowns.
  * Priorisierungs-Matrix (Impact $\times$ Urgency) und Change Advisory Board (CAB) Risiko-Scoring.
* **💡 SuperMemo SM-2 Spaced Repetition Mastery (`Sm2SpacedRepetitionLab.jsx` & `sm2Algorithm.js`)**:
  * Wissenschaftlicher SM-2 Algorithmus mit Repetitionen, Intervallen und Ease-Faktoren ($EF \ge 1.3$).
  * Interaktive **Ebbinghaus-Vergessenskurven-Diagramme** mit Recharts.
* **📓 Developer Notizbuch & Markdown Vault (`PersonalNotebookLab.jsx`)**:
  * In-App Markdown-Editor mit Live-Vorschau, Tag-Organisation, Volltextsuche, LocalStorage Auto-Save und `.md`-Export.
* **🔐 OAuth 2.0 PKCE & OIDC Flow Studio (`OauthPkceStudioLab.jsx` & `oauthPkceEngine.js`)**:
  * Vollständige RFC 7636 Authorization Code Flow mit PKCE Simulation ($S256$ SHA-256 Code Challenge).
  * JWT Payload Dekodierung (Header, Claims, Signature) und geschützter API-Aufruf (`GET /userinfo` mit Bearer Token).
* **☸️ Kubernetes Cluster & Topology Studio (`KubernetesClusterStudioLab.jsx` & `k8sClusterEngine.js`)**:
  * Interaktive Cluster-Architektur (Control Plane: API-Server, etcd, Scheduler, Controller Manager & Worker Nodes).
  * Dynamic Pod Scheduling, Self-Healing Pod-Eviction bei Node-Crashes, Replicas-Skalierung und Ingress-to-Service Load Balancing.
* **📡 WebRTC P2P DataChannel & Signaling Studio (`WebRtcPeerStudioLab.jsx` & `webrtcPeerEngine.js`)**:
  * RFC 8829 JSEP SDP Offer/Answer Handshake über Signaling-Server & STUN/TURN ICE-Candidate Discovery.
  * Live P2P DataChannel Chat mit einstellbaren Netzwerk-Impairments (Latenz & Paketverlust-Simulation).
* **📋 Scrum Sprint & Kanban Simulator (`AgileScrumSimulatorLab.jsx`)**:
  * Kanban-Board mit 5 Phasen, Story Point Estimation und Recharts Burndown-Charts.
* **🧬 GraphQL Schema & Query Explorer (`GraphqlExplorerStudioLab.jsx`)**:
  * In-Browser GraphQL Query Runner und AST-Inspektor.
* **📡 BLE & GATT Sensor Simulator (`BleSensorSimulatorLab.jsx`)**:
  * Bluetooth Low Energy Telemetrie, GATT Services und Byte-Dekodierung.

---

## ♿ Barrierefreiheit & Inklusion

* **Lese-Rechtschreib-Hilfe (Dyslexie-Modus)**: Spezialschriftart (*Atkinson Hyperlegible*), erweiterter Zeichen- & Zeilenabstand.
* **Rot-Grün-Sehhilfe (Farbenblindheits-Modus)**: Zusätzliche Icon-Indikatoren (✓ / ✗) und barrierefreie Farbwelten.
* **Bewegungsreduzierung (Reduced Motion)**: Schnelle Deaktivierung rechenintensiver CSS-Animationen & Transitions für Nutzer mit vestibulären Störungen (`body.reduced-motion` & `@media (prefers-reduced-motion: reduce)`).
* **WCAG 2.1 Mobile Zoom Compliance**: Volle Barrierefreiheit auf Mobilgeräten ohne blockierende Viewport-Skalierungsbegrenzungen.
* **Vorlesefunktion (Text-to-Speech)**: Audio-Steuerung zum Vorlesen aller Lerneinheiten.
* **Schriftgrößen-Skalierung**: Stufenlose Anpassung (A- / 100% / A+).
* **100% DSGVO-konform**: Keine Tracking-Cookies, alle Daten verbleiben rein lokal im `localStorage`.

---

## 📁 Ordnerstruktur

```
Informatik-lernen/
├── .agents/
│   └── AGENTS.md
├── .claudeignore
├── .gitignore
├── .oxlintrc.json
├── CLAUDE.md
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
    │   ├── componentsIntegrity.test.jsx
    │   ├── Content/
    │   │   ├── AgileScrumSimulatorLab.jsx
    │   │   ├── AiBusinessMasterclass.jsx
    │   │   ├── AiPromptLab.jsx
    │   │   ├── AlgoPlaygroundLab.jsx
    │   │   ├── AnfaengerGuideHub.jsx
    │   │   ├── AnsiblePlaybookLab.jsx
    │   │   ├── ApiBenchStudio.jsx
    │   │   ├── ApiMockStudioLab.jsx
    │   │   ├── AppWorkshop.jsx
    │   │   ├── ArchitectureVisualizer.jsx
    │   │   ├── BigOBenchmarkLab.jsx
    │   │   ├── BigOVisualizer.jsx
    │   │   ├── BleSensorSimulatorLab.jsx
    │   │   ├── BgpAnycastLab.jsx
    │   │   ├── BpftraceLab.jsx
    │   │   ├── CampaignQuestHub.jsx
    │   │   ├── CareerRoadmap.jsx
    │   │   ├── CiCdMatrixLinterLab.jsx
    │   │   ├── CiCdPipelineLab.jsx
    │   │   ├── CiCdWorkflowLab.jsx
    │   │   ├── CircuitBreakerLab.jsx
    │   │   ├── CleanCodeReviewLab.jsx
    │   │   ├── CloudArchitectureCanvasLab.jsx
    │   │   ├── CloudDesignerLab.jsx
    │   │   ├── CloudDevOpsLab.jsx
    │   │   ├── ClozeTester.jsx
    │   │   ├── CodeExecutionDebuggerLab.jsx
    │   │   ├── ComputationWorkerLab.jsx
    │   │   ├── CpuArchitectureLab.jsx
    │   │   ├── CpmNetworkLab.jsx
    │   │   ├── CryptoKeygenLab.jsx
    │   │   ├── CtfChallengeLab.jsx
    │   │   ├── CustomChallengeCreatorLab.jsx
    │   │   ├── DashboardQuickAccessGrid.jsx
    │   │   ├── DataStructuresLab.jsx
    │   │   ├── DeploymentGuideModal.jsx
    │   │   ├── DesignPatternsLab.jsx
    │   │   ├── DnsHttpLifecycleLab.jsx
    │   │   ├── DnssecValidationLab.jsx
    │   │   ├── DockerComposeLab.jsx
    │   │   ├── DockerLab.jsx
    │   │   ├── EbpfCiliumLab.jsx
    │   │   ├── EbpfXdpLab.jsx
    │   │   ├── ErdDesignerLab.jsx
    │   │   ├── EventSourcingLab.jsx
    │   │   ├── ExamSimulator.jsx
    │   │   ├── FisiLernfelderHub.jsx
    │   │   ├── GitBranchGraphLab.jsx
    │   │   ├── GitLab.jsx
    │   │   ├── GitMergeConflictLab.jsx
    │   │   ├── GithubActionsWorkflowLab.jsx
    │   │   ├── GlossaryModal.jsx
    │   │   ├── GraphqlExplorerStudioLab.jsx
    │   │   ├── GraphqlResolverLab.jsx
    │   │   ├── GrpcProtobufLab.jsx
    │   │   ├── Http3QuicLab.jsx
    │   │   ├── Ieee754FloatingPointLab.jsx
    │   │   ├── IhkAgileBurndownLab.jsx
    │   │   ├── IhkCheatSheetPdfGenerator.jsx
    │   │   ├── IhkGradeCalculatorLab.jsx
    │   │   ├── IhkOralDefenseStudioLab.jsx
    │   │   ├── IhkOralExamSimulator.jsx
    │   │   ├── IhkPresentationTimerLab.jsx
    │   │   ├── IhkProjectDocumentationGenerator.jsx
    │   │   ├── IhkProjectGanttLab.jsx
    │   │   ├── IhkProjectProposalLab.jsx
    │   │   ├── IhkRiskAnalysisLab.jsx
    │   │   ├── IhkWirtschaftlichkeitLab.jsx
    │   │   ├── Ipv6RoutingLab.jsx
    │   │   ├── ItPodcastHub.jsx
    │   │   ├── ItsmSimulatorLab.jsx
    │   │   ├── JwksRotationLab.jsx
    │   │   ├── K8sCniOverlayLab.jsx
    │   │   ├── KafkaEventLab.jsx
    │   │   ├── KafkaRebalanceLab.jsx
    │   │   ├── KnowledgeQuizArena.jsx
    │   │   ├── KubernetesClusterStudioLab.jsx
    │   │   ├── KubernetesLab.jsx
    │   │   ├── LabsDashboard.jsx
    │   │   ├── LanguageAcademy.jsx
    │   │   ├── LeitnerFlashcardLab.jsx
    │   │   ├── LinuxPermissionsLab.jsx
    │   │   ├── LinuxBridgeVxlanLab.jsx
    │   │   ├── LinuxContainerLab.jsx
    │   │   ├── LinuxCowSnapshotLab.jsx
    │   │   ├── LinuxMemoryLab.jsx
    │   │   ├── LiveCodingChallengeStudio.jsx
    │   │   ├── MonacoStudioLab.jsx
    │   │   ├── NeuralNetVisualizerLab.jsx
    │   │   ├── NwaScoringLab.jsx
    │   │   ├── OauthOidcLab.jsx
    │   │   ├── OauthPkceStudio.jsx
    │   │   ├── OauthTokenExchangeLab.jsx
    │   │   ├── OpenApiContractLab.jsx
    │   │   ├── OpentelemetryTracingLab.jsx
    │   │   ├── OsProcessSchedulerLab.jsx
    │   │   ├── OwaspExploitLab.jsx
    │   │   ├── P2pQuizDuellLab.jsx
    │   │   ├── PacketSnifferLab.jsx
    │   │   ├── PacketTracerLab.jsx
    │   │   ├── PerformanceProfilingLab.jsx
    │   │   ├── PersonalNotebookLab.jsx
    │   │   ├── PostgresExplainVisualizerLab.jsx
    │   │   ├── PostgresFlamegraphLab.jsx
    │   │   ├── PostgresFulltextLab.jsx
    │   │   ├── PostgresIndexTypesLab.jsx
    │   │   ├── PostgresMvccLab.jsx
    │   │   ├── PostgresPartitioningLab.jsx
    │   │   ├── PostgresPoolLab.jsx
    │   │   ├── PostgresWalLab.jsx
    │   │   ├── PromqlAlertLab.jsx
    │   │   ├── PythonWasmLab.jsx
    │   │   ├── RackConfiguratorLab.jsx
    │   │   ├── RaidCalculatorLab.jsx
    │   │   ├── RagAiSimulator.jsx
    │   │   ├── RedBlueTeamLab.jsx
    │   │   ├── RedisCachingLab.jsx
    │   │   ├── RegexMasterLab.jsx
    │   │   ├── RegexRailroadVisualizerLab.jsx
    │   │   ├── ServiceMeshLab.jsx
    │   │   ├── Sm2SpacedRepetitionLab.jsx
    │   │   ├── SqlJoinVisualizerLab.jsx
    │   │   ├── SqlQueryOptimizerLab.jsx
    │   │   ├── SqlTransactionLab.jsx
    │   │   ├── SqliteWasmStudioLab.jsx
    │   │   ├── SubnettingLab.jsx
    │   │   ├── SystemDesignLab.jsx
    │   │   ├── SystemdServiceLab.jsx
    │   │   ├── TcoRoiCalculatorLab.jsx
    │   │   ├── TddUnitTestLab.jsx
    │   │   ├── TlsReplayLab.jsx
    │   │   ├── TerraformLab.jsx
    │   │   ├── ToolingSetupGuide.jsx
    │   │   ├── TopicReader.jsx
    │   │   ├── UmlDiagramLab.jsx
    │   │   ├── TransformerAttentionLab.jsx
    │   │   ├── VectorSearchLab.jsx
    │   │   ├── VlsmSubnetLab.jsx
    │   │   ├── VideoHub.jsx
    │   │   ├── VocabularyTrainerModal.jsx
    │   │   ├── VoiceQuizStudioLab.jsx
    │   │   ├── WasmCompilerPlaygroundLab.jsx
    │   │   ├── WasmRustLab.jsx
    │   │   ├── WasmRustStudio.jsx
    │   │   ├── WasmSimdStudioLab.jsx
    │   │   ├── WebAuthnPasskeyLab.jsx
    │   │   ├── WebComponentsHub.jsx
    │   │   ├── WebRtcPeerStudioLab.jsx
    │   │   ├── WebRtcSfuLab.jsx
    │   │   ├── WebRtcSignalingLab.jsx
    │   │   ├── WebSocketProtocolLab.jsx
    │   │   ├── WebSocketsLab.jsx
    │   │   ├── WebhookInspectorLab.jsx
    │   │   ├── WireguardZtnaLab.jsx
    │   │   ├── WisoAbcXyzLab.jsx
    │   │   ├── WisoAndlerLab.jsx
    │   │   ├── WisoCapitalValueLab.jsx
    │   │   ├── WisoContributionMarginLab.jsx
    │   │   ├── WisoDunningLab.jsx
    │   │   ├── WisoInterestCalculationsLab.jsx
    │   │   ├── WisoLoanCollateralLab.jsx
    │   │   └── WisoKalkulationLab.jsx
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
    │   │   ├── ActivityHeatmapWidget.jsx
    │   │   ├── BackupModal.jsx
    │   │   ├── BadgesModal.jsx
    │   │   ├── CertificateModal.jsx
    │   │   ├── DailyChallengeWidget.jsx
    │   │   ├── FlashcardsModal.jsx
    │   │   ├── SkillMatrixWidget.jsx
    │   │   └── SkillTreeWidget.jsx
    │   ├── Navigation/
    │   │   ├── AccessibilityToolbar.jsx
    │   │   ├── AudioSettingsModal.jsx
    │   │   ├── CommandPaletteModal.jsx
    │   │   ├── DifficultyFilterBar.jsx
    │   │   ├── MobileNav.jsx
    │   │   ├── ModalContainer.jsx
    │   │   ├── Navbar.jsx
    │   │   └── PomodoroTimerWidget.jsx
    │   ├── Onboarding/
    │   │   └── RoleSelectionModal.jsx
    │   └── Projects/
    │       └── ProjectViewer.jsx
    ├── data/
    │   ├── advancedLabs.test.js
    │   ├── advancedLabsData.js
    │   ├── aiBusinessData.js
    │   ├── algorithmData.js
    │   ├── apiStudioData.js
    │   ├── campaignData.js
    │   ├── cloudArchLabs.test.js
    │   ├── cloudArchLabsData.js
    │   ├── cloudData.js
    │   ├── clozeData.js
    │   ├── dockerData.js
    │   ├── enterpriseLabs.test.js
    │   ├── enterpriseLabsData.js
    │   ├── examData.js
    │   ├── expertLabs.test.js
    │   ├── expertLabsData.js
    │   ├── flashcardsData.js
    │   ├── gamesData.js
    │   ├── glossaryData.js
    │   ├── k8sData.js
    │   ├── kafkaData.js
    │   ├── languageData.js
    │   ├── lernfelderData.js
    │   ├── nextGenLabs.test.js
    │   ├── nextGenLabsData.js
    │   ├── oauthData.js
    │   ├── oralExamData.js
    │   ├── perfData.js
    │   ├── podcastData.js
    │   ├── projectsData.js
    │   ├── quizArenaData.js
    │   ├── ragAiData.js
    │   ├── roadmapData.js
    │   ├── securityTeamData.js
    │   ├── subnettingData.js
    │   ├── topicsData.js
    │   ├── userProfiles.js
    │   ├── videosData.js
    │   ├── vocabularyData.js
    │   ├── wasmRustData.js
    │   ├── webComponentsData.js
    │   └── websocketData.js
    ├── store/
    │   ├── useStore.js
    │   └── useStore.test.js
    ├── styles/
    │   └── global.css
    └── utils/
        ├── audioSystem.js
        ├── ansiblePlaybookEngine.js
        ├── ansiblePlaybookEngine.test.js
        ├── bleSensorEngine.js
        ├── bleSensorEngine.test.js
        ├── bpftraceEngine.js
        ├── bpftraceEngine.test.js
        ├── campaignAndExam.test.js
        ├── cloudArchitectureEngine.js
        ├── cloudArchitectureEngine.test.js
        ├── codingChallengesEngine.js
        ├── codingChallengesEngine.test.js
        ├── computationWorkerEngine.js
        ├── computationWorkerEngine.test.js
        ├── cpmEngine.js
        ├── cpmEngine.test.js
        ├── customChallengesManager.js
        ├── customChallengesManager.test.js
        ├── dockerComposeEngine.js
        ├── dockerComposeEngine.test.js
        ├── dnssecValidationEngine.js
        ├── dnssecValidationEngine.test.js
        ├── ebpfCiliumEngine.js
        ├── ebpfCiliumEngine.test.js
        ├── ebpfXdpEngine.js
        ├── ebpfXdpEngine.test.js
        ├── erdDesignerEngine.js
        ├── erdDesignerEngine.test.js
        ├── eventSourcingEngine.js
        ├── eventSourcingEngine.test.js
        ├── gitConflictEngine.js
        ├── gitConflictEngine.test.js
        ├── githubActionsEngine.js
        ├── githubActionsEngine.test.js
        ├── graphqlSandboxEngine.js
        ├── graphqlSandboxEngine.test.js
        ├── haptics.js
        ├── haptics.test.js
        ├── http3QuicEngine.js
        ├── http3QuicEngine.test.js
        ├── i18n.js
        ├── ieee754.js
        ├── ieee754.test.js
        ├── ihkAgileBurndownEngine.js
        ├── ihkAgileBurndownEngine.test.js
        ├── ihkGradeCalculations.js
        ├── ihkGradeCalculations.test.js
        ├── ihkOralDefenseEngine.js
        ├── ihkOralDefenseEngine.test.js
        ├── ihkPresentationTimerEngine.js
        ├── ihkPresentationTimerEngine.test.js
        ├── ihkProjectGanttEngine.js
        ├── ihkProjectGanttEngine.test.js
        ├── ihkProjectProposalEngine.js
        ├── ihkProjectProposalEngine.test.js
        ├── ihkRiskAnalysisEngine.js
        ├── ihkRiskAnalysisEngine.test.js
        ├── ihkWirtschaftlichkeitEngine.js
        ├── ihkWirtschaftlichkeitEngine.test.js
        ├── indexedDbStorage.js
        ├── indexedDbStorage.test.js
        ├── indexedDbStoreMiddleware.js
        ├── indexedDbStoreMiddleware.test.js
        ├── ipv6Routing.js
        ├── ipv6Routing.test.js
        ├── itsmEngine.js
        ├── itsmEngine.test.js
        ├── kafkaRebalanceEngine.js
        ├── kafkaRebalanceEngine.test.js
        ├── linuxBridgeVxlanEngine.js
        ├── linuxBridgeVxlanEngine.test.js
        ├── linuxContainerEngine.js
        ├── linuxContainerEngine.test.js
        ├── linuxCowSnapshotEngine.js
        ├── linuxCowSnapshotEngine.test.js
        ├── linuxMemoryEngine.js
        ├── linuxMemoryEngine.test.js
        ├── nwaEngine.js
        ├── nwaEngine.test.js
        ├── oauthTokenExchangeEngine.js
        ├── oauthTokenExchangeEngine.test.js
        ├── openApiContractEngine.js
        ├── openApiContractEngine.test.js
        ├── opentelemetryTracingEngine.js
        ├── opentelemetryTracingEngine.test.js
        ├── osSchedulerEngine.js
        ├── osSchedulerEngine.test.js
        ├── p2pQuizEngine.js
        ├── p2pQuizEngine.test.js
        ├── packetSnifferEngine.js
        ├── packetSnifferEngine.test.js
        ├── postgresFlamegraphEngine.js
        ├── postgresFlamegraphEngine.test.js
        ├── postgresIndexTypesEngine.js
        ├── postgresIndexTypesEngine.test.js
        ├── postgresMvccEngine.js
        ├── postgresMvccEngine.test.js
        ├── postgresPartitioningEngine.js
        ├── postgresPartitioningEngine.test.js
        ├── postgresPoolEngine.js
        ├── postgresPoolEngine.test.js
        ├── postgresWalEngine.js
        ├── postgresWalEngine.test.js
        ├── promqlAlertEngine.js
        ├── promqlAlertEngine.test.js
        ├── rackCalculations.js
        ├── rackCalculations.test.js
        ├── raidEngine.js
        ├── raidEngine.test.js
        ├── regexParserEngine.js
        ├── regexParserEngine.test.js
        ├── scrumEngine.js
        ├── scrumEngine.test.js
        ├── serviceMeshEngine.js
        ├── serviceMeshEngine.test.js
        ├── sm2Algorithm.js
        ├── sm2Algorithm.test.js
        ├── sqlSandboxEngine.js
        ├── sqlSandboxEngine.test.js
        ├── srsAlgorithm.js
        ├── srsAlgorithm.test.js
        ├── storage.js
        ├── storage.test.js
        ├── systemdServiceEngine.js
        ├── systemdServiceEngine.test.js
        ├── tcoCalculations.js
        ├── tcoCalculations.test.js
        ├── terraformEngine.js
        ├── terraformEngine.test.js
        ├── tlsReplayEngine.js
        ├── tlsReplayEngine.test.js
        ├── transformerAttentionEngine.js
        ├── transformerAttentionEngine.test.js
        ├── umlEngine.js
        ├── umlEngine.test.js
        ├── voiceQuizEngine.js
        ├── voiceQuizEngine.test.js
        ├── wasmSimdEngine.js
        ├── wasmSimdEngine.test.js
        ├── webAuthnEngine.js
        ├── webAuthnEngine.test.js
        ├── webhookSimulator.js
        ├── webhookSimulator.test.js
        ├── webrtcSfuEngine.js
        ├── webrtcSfuEngine.test.js
        ├── vlsmEngine.js
        ├── vlsmEngine.test.js
        ├── wireguardZtnaEngine.js
        ├── wireguardZtnaEngine.test.js
        ├── wisoAbcXyzEngine.js
        ├── wisoAbcXyzEngine.test.js
        ├── wisoAndlerEngine.js
        ├── wisoAndlerEngine.test.js
        ├── wisoCalculations.js
        ├── wisoCalculations.test.js
        ├── wisoContributionMarginEngine.js
        ├── wisoContributionMarginEngine.test.js
        ├── wisoDunningEngine.js
        ├── wisoDunningEngine.test.js
        ├── wisoInterestCalculationsEngine.js
        ├── wisoInterestCalculationsEngine.test.js
        ├── wisoLoanCollateralEngine.js
        └── wisoLoanCollateralEngine.test.js
```

---

## ⚙️ Funktionsweise

1. **State-Management (`zustand`, `localStorage` & redundanter `IndexedDB` Sync Layer)**:
   * Sämtliche Fortschritte (XP, Level, Badges, erledigte Module, Spaced-Repetition-Karten, 365-Tage-Aktivitätshistorie, Custom Challenges, persönliche Notizen) werden rein lokal im Browser gespeichert und über `indexedDbStoreMiddleware.js` redundant und asynchron in IndexedDB gesichert. Dies verhindert Datenverluste bei gelöschtem LocalStorage oder Überschreitung des 5-MB-Quotas.
2. **Audio-Synthesizer (`audioSystem.js`)**:
   * Keine schweren Audio-Dateien: Alle Soundeffekte (Erfolg, LevelUp, Fehler, Timer-Glocke) werden in Echtzeit über die Web Audio API synthetisiert und lassen sich stufenlos regulieren oder stummschalten.
3. **PWA & Offline-Fähigkeit (`vite-plugin-pwa`)**:
   * Vollständiger Service-Worker-Precache aller 126 Anwendungs-Chunks für 100% Offline-Nutzung.
4. **Vite 8 & Rolldown Bundle Splitting**:
   * Aufteilung in logische Chunks (`vendor-react`, `vendor-ui`, `vendor-charts-pdf`) für Ladezeiten unter 1 Sekunde.

---

## 🔒 DSGVO & Datenschutz

* **Kein Tracking, keine Analyse-Tools, keine Werbe-Cookies**.
* Alle Daten bleiben auf dem Endgerät des Nutzers.
* Export- und Importfunktion zur einfachen Datensicherung als JSON.

---

## 🚀 Anleitung (Installation & Ausführung)

```bash
# Repository klonen & Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev

# Unit-Tests ausführen (Vitest)
npm test

# Linter ausführen (Oxlint)
npm run lint

# Für Produktion kompilieren
npm run build
```

---

## 📝 Änderungshistorie & Entwicklungsdokumentation

### Version 3.36.0 (DNSSEC Chain of Trust, IHK Burndown, Linux Btrfs CoW & OpenAPI Contract Edition)

- **Neu**: `DnssecValidationLab.jsx` & `src/utils/dnssecValidationEngine.js` — DNSSEC Cryptographic Chain of Trust & RRSIG Validation Studio (RFC 4033, 4034, 4035): End-to-End Vertrauenskette von der ICANN Root Zone (`.`) über TLDs (`.de`) bis zur Domain (`example.de`). KSK/ZSK Schlüsseltrennung (Flags 257/256), SHA-256 DS-Record Hashing im Parent, RRSIG Signaturprüfung über RRsets (A-Records), interaktive Fehlersimulation (korrupter DS-Digest, abgelaufene RRSIG, Spoofing), NSEC3 Authenticated Denial of Existence Simulator (RFC 5155 gehashte & gesalzene Intervalle gegen Zone Walking) und Dan Kaminsky DNS Cache Poisoning Angriffsabwehr mit 65 XP Belohnung.
- **Neu**: `IhkAgileBurndownLab.jsx` & `src/utils/ihkAgileBurndownEngine.js` — IHK Agile vs. Waterfall & Burndown Studio (AP2 Teil A Projektarbeit & Dokumentation): Offizieller Vorgehensmodell-Entscheider und Controlling-Simulator für IT-Abschlussprojekte nach AO 2020. Dynamisches SVG Sprint Burndown Diagramm (Ideal-Linie vs. Ist-Verlauf über 5–15 Tage), Velocity-Messung (Story Points pro Tag), interaktive Scope-Creep Simulation, Kanban WIP (Work-in-Progress) Bottleneck Analyzer nach Little's Law, Vergleichsmatrix (Wasserfall vs. Scrum vs. Hybrides Modell) und 1-Klick IHK-Begründungstext-Generator für den Projektantrag mit 60 XP Belohnung.
- **Neu**: `LinuxCowSnapshotLab.jsx` & `src/utils/linuxCowSnapshotEngine.js` — Linux Btrfs / ZFS Copy-on-Write (CoW) & Snapshot Sandbox: Extent-B-Tree und Block-Level Storage Simulator für moderne Linux-Dateisysteme. Geteilte physische Disk-Blöcke (Refcounts), atomare 0-Byte-Snapshots (`btrfs subvolume snapshot -r @root @snap`) in Millisekunden ohne zusätzliche SSD-Belegung, Write-Delta-Allokationen (Änderungen schreiben immer auf neue freie Blöcke), Instant Snapshot Rollbacks, Terminal CLI Emulator und Bit-Rot Self-Healing Scrubbing (`btrfs scrub start`) zur Reparatur stiller Datenkorruption via Prüfsummen mit 70 XP Belohnung.
- **Neu**: `OpenApiContractLab.jsx` & `src/utils/openApiContractEngine.js` — OpenAPI 3.1 & JSON-Schema Contract Testing Studio: REST-API Vertragsspezifikation und Validierungs-Studio nach OpenAPI 3.1 und JSON Schema 2020-12. Interaktiver Live Contract Validator mit Schema-Fehler-Audit (HTTP 422), semantischer Breaking Change Detector (v1 vs. v2) zur Warnung vor rückwärtsinkompatiblen Schnittstellenänderungen, 1-Klick TypeScript DTO Interface Generator und automatischer Test-Mock Payload Generator mit 65 XP Belohnung.
- **Routing & Navigation**: Vollständige Integration aller neuen Labs in `App.jsx` (inklusive Lazy-Routen `dnssec_validation_lab`, `ihk_burndown_lab`, `linux_cow_snapshot_lab`, `openapi_contract_lab`), `CommandPaletteModal.jsx` (neue Shortcuts mit `Globe`, `TrendingDown`, `HardDrive` und `FileCode` Icons) und `LabsDashboard.jsx`.
- **Smoke Tests & Komponenten-Integrität**: `src/components/componentsIntegrity.test.jsx` um Smoke-Tests für alle 4 neuen Module erweitert (29/29 Komponenten-Integrations-Tests grün).
- **Test-Suite & Qualität**: **349 bestandene Unit-Tests** in **100 Test-Dateien** mit 100% Erfolgsquote (vorher 328/96). **0 Linter-Fehler / 0 Warnungen** in Oxlint über 428 Dateien und blitzschneller PWA Produktions-Build in 776ms.

### Version 3.35.0 (TLS 1.3 0-RTT Replay, IHK Risikoanalyse, eBPF Cilium & Postgres Index Types Edition)

- **Neu**: `TlsReplayLab.jsx` & `src/utils/tlsReplayEngine.js` — TLS 1.3 0-RTT Early Data Replay Attack & Anti-Replay Defense Studio: Tiefgehende Simulation des TLS 1.3 Handshake-Ablaufs (1-RTT Full Handshake vs. 0-RTT Pre-Shared Key Early Data). Demonstration von Man-in-the-Middle Replay-Angriffen auf nicht-idempotente Zahlungs- und Transfer-Requests (`POST /api/transfer`) bei Wiederverwendung von Session-Tickets (`ticket_age_add`). Interaktive Gegenmaßnahmen: Server Single-Use Ticket Cache, Freshness Checks via ClientHello Timestamp-Validierung, Strict Idempotency Filter (Erlaubnis nur für `GET` Requests im 0-RTT Fenster) und Client-seitige Nonce-Diversifikation mit 65 XP Belohnung.
- **Neu**: `IhkRiskAnalysisLab.jsx` & `src/utils/ihkRiskAnalysisEngine.js` — IHK Risikoanalyse & 5x5 Risikomatrix Studio (DIN EN 31010 / FMEA für AP2 Teil A & B): Prüfungsrelevantes Risikomanagement für IT-Projekte nach offiziellem IHK-Standard. 5x5 Risikomatrix nach Schadensausmaß und Eintrittswahrscheinlichkeit ($RPZ = A \times E$ bzw. FMEA $RPZ = A \times E \times D$), farbcodierte Risikoklassen (Niedrig, Mittel, Hoch, Kritisch), 4 IHK-Standardstrategien (Vermeiden, Vermindern/Mitigieren, Übertragen/Versichern, Akzeptieren/Tragen), vordefinierte Projektszenarien (DSGVO Data-Breach, Cloud-Vendor Lock-in, Ausfall Lead-Developer, Scope-Creep), Restrisiko-Neuberechnung nach Maßnahmenumsetzung und 1-Klick IHK-Dokumentations-Markdown-Export mit 60 XP Belohnung.
- **Neu**: `EbpfCiliumLab.jsx` & `src/utils/ebpfCiliumEngine.js` — eBPF Cilium Service Mesh & L7 Tracing Sandbox: Hochperformante Kernel-basierte Netzwerk- und Security-Beobachtbarkeit für Cloud-Native Kubernetes-Cluster. Simulation von eBPF TC (Traffic Control) und XDP (eXpress Data Path) Hook-Points im Linux-Kernel, Cilium Network Policies (L3/L4 Pod-Isolation und L7 HTTP Header/Path Filter), Kernel-Map-Inspektor (`BPF_MAP_TYPE_HASH` & `BPF_MAP_TYPE_LRU_HASH`), L7 Hubble Live-Flow-Stream mit Latenzmetriken und interaktiver XDP Fast-Path DDoS SYN-Flood-Drop-Filter (bis zu 100k pps verworfen direkt im Netzwerkkartentreiber ohne Kernel-TCP-Stack Overhead) mit 70 XP Belohnung.
- **Neu**: `PostgresIndexTypesLab.jsx` & `src/utils/postgresIndexTypesEngine.js` — PostgreSQL Index Types Deep Dive Studio (B-Tree, GIN, GiST, BRIN): Tiefgehende Datenbank-Performance-Analyse und Index-Auswahl für relationale SQL-Workloads. Interaktiver Kosten- und Laufzeitvergleich (`EXPLAIN ANALYZE`) zwischen Sequential Scan, B-Tree Index (B-Baum Seitenstruktur für Skalare, Bereichsabfragen und Sortierungen), GIN (Generalized Inverted Index für JSONB Arrays und Volltextsuche `to_tsvector`), GiST (Generalized Search Tree mit R-Tree Bounding Boxes für 2D Geodaten `geometry(Point)`) und BRIN (Block Range Index für zeitlich sortierte Append-Only Big-Data Zeitreihen mit 99% Speicherplatzersparnis) sowie automatischer Index-Empfehlungs-Assistent mit 65 XP Belohnung.
- **Routing & Navigation**: Vollständige Integration aller neuen Labs in `App.jsx` (inklusive Lazy-Routen `tls_replay_lab`, `ihk_risk_analysis_lab`, `ebpf_cilium_lab`, `postgres_index_types_lab`), `CommandPaletteModal.jsx` (neue Shortcuts mit `ShieldAlert`, `AlertTriangle`, `Network` und `Database` Icons) und `LabsDashboard.jsx`.
- **Smoke Tests & Komponenten-Integrität**: `src/components/componentsIntegrity.test.jsx` um Smoke-Tests für alle 4 neuen Module erweitert (25/25 Komponenten-Integrations-Tests grün).
- **Test-Suite & Qualität**: **328 bestandene Unit-Tests** in **96 Test-Dateien** mit 100% Erfolgsquote (vorher 309/92). **0 Linter-Fehler / 0 Warnungen** in Oxlint über 416 Dateien und blitzschneller PWA Produktions-Build in 1.01s.

### Version 3.34.0 (IHK Wirtschaftlichkeitsrechner, WebAuthn Passkeys, Systemd Cgroups & WASM Sobel Edition)

- **Neu**: `IhkWirtschaftlichkeitLab.jsx` & `src/utils/ihkWirtschaftlichkeitEngine.js` — IHK Wirtschaftlichkeits-, Amortisations- & Make-or-Buy Rechner (AP2 Teil A Pflichtmodul): Praxisorientierte Kostenkalkulation für IHK-Abschlussprojekte. Statische & dynamische Amortisationsdauer (Break-Even in Monaten, Netto-Ersparnis, ROI), vollständige Make-or-Buy Analyse (interne Entwicklungskosten vs. SaaS-Lizenzierung über $N$ Jahre mit Handlungsempfehlung), Kostenvergleichs-Matrix (Alt vs. Neu) und 1-Klick IHK-Dokumentations-Markdown-Export mit 65 XP Belohnung.
- **Neu**: `WebAuthnPasskeyLab.jsx` & `src/utils/webAuthnEngine.js` — Web Crypto API & Hardware Token Studio (FIDO2 / WebAuthn & Passkeys): Passwortlose Authentifizierung nach W3C WebAuthn Level 3 und FIDO2 Standard. Registrierungs- und Anmelde-Flows mit asymmetrischen Schlüsselpaaren (`ES256` / `RS256`), ClientDataJSON- und AttestationObject-Dekodierung, Authenticator Data Flag-Inspektor (UP, UV, BE, BS) und Replay-Schutz via kryptografischen Challenges mit 55 XP Belohnung.
- **Neu**: `SystemdServiceLab.jsx` & `src/utils/systemdServiceEngine.js` — Linux Systemd Unit Lifecycle & Cgroups v2 Service Sandbox: Vollständige Simulation von Linux Service Daemons (`.service` Unit-Dateien) und Cgroups v2 Ressourcen-Limitierung. Unit-Lifecycle-Zustände (`inactive`, `activating`, `active`, `deactivating`, `failed`), Restart-Policies (`always`, `on-failure`), Cgroups v2 Limits (`CPUQuota=50%`, `MemoryMax=512M`), OOM-Killer Auslösung, interaktives `systemctl` Terminal, dynamischer Unit-File-Generator und Live `journalctl -u service -f` Logging mit 50 XP Belohnung.
- **Neu**: `WasmSimdStudioLab.jsx` & `src/utils/wasmSimdEngine.js` (Upgrade) — WebAssembly SIMD 3x3 Faltungsmatrix & Sobel-Filter: Parallele 2D-Bildfaltungsberechnungen mit 128-Bit Vektor-Registern (`v128`). Vordefinierte 3x3 Faltungskerne (Sobel X/Y Kantenerkennung, Gaußscher Weichzeichner, Scharfzeichnen), Vektorisierung von 4 Float-Nachbarpixeln in einem CPU-Takt via FMA und Live-Faltungsmatrix-Inspektor mit direkter Auswertung über `applySimdConvolutionFilter`.
- **Routing & Navigation**: Vollständige Integration aller neuen Labs in `App.jsx` (inklusive Routen `ihk_wirtschaftlichkeit_lab`, `webauthn_passkey_lab`, `systemd_service_lab`), `CommandPaletteModal.jsx` (neue Aktionen mit `Calculator`, `Key` und `Cpu` Icons) und `LabsDashboard.jsx`.
- **Smoke Tests & Komponenten-Integrität**: `src/components/componentsIntegrity.test.jsx` um Smoke-Tests für alle neuen Module erweitert (21/21 Komponenten-Integrations-Tests grün).
- **Test-Suite & Qualität**: **309 bestandene Unit-Tests** in **92 Test-Dateien** mit 100% Erfolgsquote (vorher 290/89). **0 Linter-Fehler / 0 Warnungen** in Oxlint über 404 Dateien und blitzschneller PWA Produktions-Build in 686ms.

### Version 3.33.0 (IHK Projekt-Gantt, WebAssembly SIMD, HTTP/3 QUIC & IndexedDB Store Edition)

- **Neu**: `IhkProjectGanttLab.jsx` & `src/utils/ihkProjectGanttEngine.js` — IHK Projekt-Gantt & Meilenstein-Editor (AP2 Teil A): Offizielles Zeit- und Phasenplanungstool für den IHK-Abschlussbericht und Projektantrag. Standardisierte Profile für Fachinformatiker Anwendungsentwicklung (80h Richtwert) und Systemintegration (40h Richtwert), Kalender-Gantt-Berechnung ohne Wochenenden, Phasen- und Meilensteineditor, automatische IHK-Konformitätsprüfung (Realisierungsanteil $\le 50\%$, Dokumentation $\ge 10-15\%$, exakte Stundenvorgabe) und direkter Markdown-Export für den Projektantrag mit 60 XP Belohnung.
- **Neu**: `WasmSimdStudioLab.jsx` & `src/utils/wasmSimdEngine.js` — WebAssembly 128-Bit SIMD & Vector Processing Studio: Parallele Datenverarbeitung auf SIMD-Hardware-Registern (`v128`, `f32x4`, `i32x4`, `u8x16`). Interaktiver Vektor-Register-Inspektor für 4 parallele Float-Lanes in einem CPU-Takt, Live-Geschwindigkeitsbenchmark gegen skalare JavaScript-Schleifen mit Durchsatzmessung in MFLOPS ($\sim 3.8\times$ Hardware-Speedup) und interaktivem WebAssembly Text Format (WAT) Bytecode-Viewer mit 70 XP Belohnung.
- **Neu**: `Http3QuicLab.jsx` (Upgrade) & `src/utils/http3QuicEngine.js` — Next-Gen Transport: HTTP/3 & QUIC Protocol Inspector & UDP Packet Loss Recovery Simulator: Interaktiver Multi-Stream-Simulator zum direkten Vergleich von HTTP/1.1 (6 TCP-Sockets), HTTP/2 (Single-TCP Multiplexing) und HTTP/3 (unabhängige QUIC-Streams über UDP). Live-Demonstration des TCP Head-of-Line Blockings bei 0–35% simuliertem Paketverlust, Handshake-Latenz-Inspektor mit 0-RTT Session Resumption (Early Data) und Connection-ID (CID) Migration bei Netzwerkwechsel von WLAN zu 5G ohne Socket-Teardown mit 75 XP Belohnung.
- **Neu**: `src/utils/indexedDbStoreMiddleware.js` & `storage.js` Integration — Zustand Store IndexedDB Hydration & Redundante Persistenz: Asynchrone Spiegelung aller Benutzerfortschritte in IndexedDB (`it_devgame_db.keyvalue`), automatische Notfall-Hydration bei gelöschtem `localStorage` und Snapshot-Verwaltung für System-Checkpoints.
- **Routing & Navigation**: Vollständige Integration aller Module in `App.jsx` (mit Alias-Routen `ihk_project_gantt_lab`, `wasm_simd_studio_lab`), `CommandPaletteModal.jsx` (neue Shortcuts mit `Calendar` und `Cpu` Icons) und `LabsDashboard.jsx`.
- **Smoke Tests & Komponenten-Integrität**: `src/components/componentsIntegrity.test.jsx` um Smoke-Tests für `IhkProjectGanttLab`, `WasmSimdStudioLab` und `Http3QuicLab` erweitert (18/18 Tests bestanden).
- **Test-Suite & Qualität**: **290 bestandene Unit-Tests** in **89 Test-Dateien** mit 100% Erfolgsquote (vorher 268/85). **0 Linter-Fehler / 0 Warnungen** in Oxlint über 395 Dateien und fehlerfreier PWA Produktions-Build in 725ms.

### Version 3.32.0 (IHK Präsentations-Timer, Docker Compose Orchestrator, GitHub Actions CI/CD & Offline IndexedDB Edition)

- **Neu**: `IhkPresentationTimerLab.jsx` & `src/utils/ihkPresentationTimerEngine.js` — IHK Präsentations-Stoppuhr & Folien-Gliederung (AP2 Teil A): Offizieller 15-Minuten Zeitmanagement-Timer mit 4 Phasen-Gliederung (Einleitung 2 Min, Analyse & Wirtschaftlichkeit 4 Min, Entwurf & Realisierung 6 Min, QS & Fazit 3 Min), Web Audio Gong-Signalen bei Phasenübergängen, 1-Minuten-Warnung vor Überzeit und offizieller IHK-Rubriken-Matrix (Struktur, Fachliche Tiefe, Medieneinsatz, Vortrag, Zeitmanagement) mit automatischer Notenberechnung (1–6) und 45 XP Belohnung.
- **Neu**: `DockerComposeLab.jsx` (Upgrade) & `src/utils/dockerComposeEngine.js` — Docker Compose Multi-Container Orchestrator: Topologische DAG-Startreihenfolge von Services via Kahn-Algorithmus basierend auf `depends_on`, Multi-Network Bridge-Isolation mit Ping-Erreichbarkeitstest (Sicherheits-Isolation zwischen Frontend und interner Datenbank), persistente Named Volumes & Bind-Mounts, interaktiver `docker compose up -d` Terminal-Simulator mit Healthcheck-Polling und Compose 3.8 YAML Export.
- **Neu**: `GithubActionsWorkflowLab.jsx` & `src/utils/githubActionsEngine.js` — Dynamic CI/CD GitHub Actions Workflow Simulator: Visueller DAG-Workflow-Graph mit parallelen und sequentiellen Ausführungsstufen (`needs`), Dependency Caching via `actions/cache@v4` (Cache Hit/Miss Simulation), Secrets-Maskierung (`***`) und Live ANSI-Runner-Konsolenausgabe mit 50 XP Belohnung.
- **Neu**: `src/utils/indexedDbStorage.js` & Integration in `PersonalNotebookLab.jsx` — Asynchroner IndexedDB NoSQL-Speicher-Layer: Unbegrenzte Offline-Persistenz über das 5-MB-LocalStorage-Limit hinaus, automatischer Fallback für Testumgebungen, Dual-Save-Architektur im Entwickler-Notizbuch und "IndexedDB Offline-Sync: Aktiv"-Statusanzeige.
- **Routing & Navigation**: Vollständige Integration aller neuen Labs in `App.jsx` (inklusive Alias-Routen wie `presentation_timer_lab`, `github_actions_lab`, `docker_compose_lab`), `CommandPaletteModal.jsx` (neue Shortcuts mit `Clock` und `GitPullRequest` Icons) und `LabsDashboard.jsx`.
- **Smoke Tests & Komponenten-Integrität**: `src/components/componentsIntegrity.test.jsx` um Smoke-Tests für `IhkPresentationTimerLab` und `GithubActionsWorkflowLab` erweitert (15/15 Tests bestanden).
- **Test-Suite & Qualität**: **268 bestandene Unit-Tests** in **85 Test-Dateien** mit 100% Erfolgsquote (vorher 249/81). **0 Linter-Fehler / 0 Warnungen** in Oxlint über 385 Dateien und blitzschneller PWA Produktions-Build in ~1.2s.

### Version 3.31.0 (IHK Fachgespräch Audio-Simulator, Ansible Playbook & Web Worker Concurrency Edition)

- **Neu**: `IhkOralDefenseStudioLab.jsx` & `src/utils/ihkOralDefenseEngine.js` — IHK Fachgespräch & Audio-Prüfungssimulator (Abschlussprüfung Teil 2): Vollständige Simulation des 15-Minuten Prüfungsgesprächs vor dem 3-köpfigen Prüfungsausschuss (Architektur/Fachtiefe, Projektphasen/QS, WISO/Wirtschaftlichkeit). Web Speech API Integration mit Sprachausgabe der Prüferfragen (TTS), Spracheingabe für Kandidaten (STT), automatischer Keyword-Rubrik-Auswertung mit individueller Punktvergabe und Notenberechnung nach offiziellem IHK-Schlüssel (1–6) sowie XP-Freischaltung bei Bestehen.
- **Neu**: `AnsiblePlaybookLab.jsx` & `src/utils/ansiblePlaybookEngine.js` — Ansible Playbook & Idempotenz Studio: Deklarative Server-Provisionierung und Konfigurationsverwaltung für Web- & DB-Cluster. Simulation von Host-Inventories (`inventory.ini`), YAML Playbook Tasks (`apt`, `template`, `systemd`) und interaktiver Beweis der Idempotenz (Lauf 1: changed=2, Lauf 2: changed=0, ok=3) mit XP-Belohnung.
- **Neu**: `ComputationWorkerLab.jsx` & `src/utils/computationWorkerEngine.js` — Web Worker & Hintergrund-Performance Studio: Vergleichender CPU-Benchmark zwischen synchroner Ausführung auf dem Haupt-Thread (UI friert ein, Framedrops) und nebenläufigem Dedicated Web Worker. 60 FPS Herzschlag-Gauges demonstrieren die unterbrechungsfreie Responsiveness von Benutzeroberflächen bei rechenintensiven Aufgaben (Eratosthenes Primzahl-Sieb & Monte-Carlo RAID URE Simulation).
- **Routing & Navigation**: Vollständige Integration aller 3 Flaggschiff-Module in `App.jsx` (mit Alias-Routing wie `oral_defense_studio`, `ansible_playbook_lab`, `computation_worker_lab`), `CommandPaletteModal.jsx`, `LabsDashboard.jsx` und `DashboardQuickAccessGrid.jsx`.
- **Smoke Tests & Komponenten-Integrität**: `src/components/componentsIntegrity.test.jsx` um Smoke-Tests für alle 3 neuen Labs erweitert (13/13 Komponenten-Integrations-Tests grün).
- **Test-Suite & Qualität**: **249 bestandene Unit-Tests** in **81 Test-Dateien** mit 100% Erfolgsquote (vorher 236/78). **0 Linter-Fehler / 0 Warnungen** in Oxlint über 375 Dateien und blitzschneller PWA Produktions-Build in ~1.1s.

### Version 3.30.0 (IHK CPM Netzplantechnik, UML Studio & Terraform IaC Edition)

- **Neu**: `CpmNetworkLab.jsx` & `src/utils/cpmEngine.js` — IHK Netzplan Studio (CPM / DIN 69900): Vollständige Vorwärts- & Rückwärtsrechnung (FAZ, FEZ, SAZ, SEZ), Gesamtpuffer ($GP$), Freier Puffer ($FP$), Identifikation des Kritischen Pfads, Zyklen-Detektion via Kahn-Algorithmus, DIN 69900 6-Felder-Vorgangsknoten-Matrix und Vorlagen für FIAE (80h) und FISI (40h) Abschlussprojekte.
- **Neu**: `UmlDiagramLab.jsx` & `src/utils/umlEngine.js` — UML Studio (Sequenz- & Aktivitätsdiagramme nach OMG UML 2.5): Synchrone Aufrufe, asynchrone Nachrichten, Rückgaben, Verzweigungs-Guards, IHK-Konformitäts-Linter und 1-Klick Mermaid.js Export für Projektdokumentationen.
- **Neu**: `TerraformLab.jsx` & `src/utils/terraformEngine.js` — Terraform & OpenTofu IaC Studio: Deklarative Infrastruktur, Directed Acyclic Graph (DAG) Ressourcenstufen, interaktiver Diff-Simulator für `terraform plan` (`+ create`, `~ update`, `- destroy`) und Cloud State Drift-Erkennung.
- **Routing & Navigation**: Vollständige Verknüpfung in `Navbar.jsx`, `CommandPaletteModal.jsx`, `LabsDashboard.jsx`, `DashboardQuickAccessGrid.jsx` und `App.jsx` (robuste Alias-Unterstützung mit/ohne `_lab` Suffix).
- **Test-Suite & Qualität**: **236 bestandene Unit-Tests** in **78 Test-Dateien** mit 100% Erfolgsquote (vorher 224/75). 0 Linter-Fehler in Oxlint und optimierter PWA Produktions-Build.

### Version 3.29.0 (IHK Flagship Edition: Nutzwertanalyse Studio, RAID Storage Rechner, VLSM Subnet Splitter & Projektantrags-Prüfer)

- **Neu**: `NwaScoringLab.jsx` & `src/utils/nwaEngine.js` — IHK Nutzwertanalyse Studio (NWA): Vollständiges Entscheidungsmatrix-Tool nach DIN/VDI 2225 mit dynamischer Kriterien- und Alternativen-Verwaltung, 100%-Wichtungssummenvalidierung, K.O.-Kriterien-Erkennung, Sensitivitätsanalyse und Markdown/CSV-Zusammenfassung.
- **Neu**: `RaidCalculatorLab.jsx` & `src/utils/raidEngine.js` — RAID Storage & Paritäts-Rechner: Simulation aller praxisrelevanten RAID-Level (0, 1, 5, 6, 10, 50). Berechnung von Bruttokapazität, Nettodaten, Redundanz-Overhead, tolerierten Festplattenausfällen, Write-Penalty-Faktoren ($4\times$ bei RAID 5, $6\times$ bei RAID 6), Rebuild-Laufzeiten in Stunden und URE-Risikowahrscheinlichkeiten ($1 - (1 - 10^{-14})^{\text{Bits}}$) mit visueller Disk-Block-Matrix.
- **Neu**: `VlsmSubnetLab.jsx` & `src/utils/vlsmEngine.js` — VLSM Subnet Splitter & IP-Netzwerk-Rechner: Variable Length Subnet Masking nach IHK FISI/AP1 Standard mit automatischer Sortierung nach absteigendem Host-Bedarf, Berechnung von Netzadresse, Subnetzmaske, Wildcard, erstem/letztem Host, Broadcast, Effizienzquoten und detaillierter Binär-Oktett-Darstellung.
- **Neu**: `IhkProjectProposalLab.jsx` & `src/utils/ihkProjectProposalEngine.js` — IHK Projektantrags-Prüfer: Vollautomatische Prüfung von Anträgen für FIAE (80h), FISI (40h), FIDP (40h) und FIDV (40h). Phasenzeit-Checks (Analyse, Entwurf, Implementierung, QS, Doku), IHK-Qualitäts-Score (0–100), Erkennung typischer IHK-Anti-Patterns (z. B. "Installationsarbeiten", fehlende Wirtschaftlichkeitsbetrachtung) und interaktive Checkliste.
- **Neu**: `DashboardQuickAccessGrid.jsx` — Modularisierung des Haupt-Dashboards (`App.jsx`), Entkopplung von über 450 Zeilen Code in eine wiederverwendbare Grid-Komponente.
- **Neu**: Barrierefreiheit & UX: Umschaltbarer `reduced-motion` Modus (`body.reduced-motion` & `@media (prefers-reduced-motion: reduce)`) in `global.css` & `Navbar.jsx`, Behebung mobiler Viewport-Zoom-Blocker in `index.html` nach WCAG 2.1.
- **Neu**: Algorithmus-Konsolidierung: `src/utils/srsAlgorithm.js` als kanonischer Wrapper auf `src/utils/sm2Algorithm.js` konsolidiert, um Code-Duplikate zu beseitigen.
- **Neu**: Inhalts-Erweiterung: 15 neue authentische IHK-Prüfungsfragen in `src/data/examData.js`, 10 neue Spaced-Repetition-Karteikarten in `src/data/flashcardsData.js`, 5 neue IT-Fachbegriffe in `src/data/vocabularyData.js`.
- **Neu**: `CLAUDE.md` & `.claudeignore` Entwickler- und KI-Leitfaden im Projekt-Root.
- **Routing & Navigation**: Vollständige Verknüpfung in `Navbar.jsx`, `CommandPaletteModal.jsx`, `LabsDashboard.jsx` und `App.jsx`.
- **Test-Suite & Qualität**: **224 bestandene Unit-Tests** in **75 Test-Dateien** mit 100% Erfolgsquote (vorher 177/63). 0 Linter-Fehler in Oxlint und optimierter Produktions-Build.

### Version 3.28.0 (Linux Bridge/VXLAN, Postgres Partitioning, IHK Zinsrechnung & Kafka Rebalance Edition)

- **Neu**: `LinuxBridgeVxlanLab.jsx` & `src/utils/linuxBridgeVxlanEngine.js` — Linux Bridge & VXLAN Overlay Studio: `veth`-Paare, Bridge Forwarding Database (`br0` FDB) und L2-over-L3 VXLAN-Kapselung (UDP Port 4789, 24-Bit VNI & MTU-Overhead).
- **Neu**: `PostgresPartitioningLab.jsx` & `src/utils/postgresPartitioningEngine.js` — PostgreSQL Declarative Partitioning & Pruning Studio: Tabellen-Partitionierung (`PARTITION BY RANGE / LIST / HASH`), DDL-Generierung und Partition Pruning im EXPLAIN Query Plan zur Eliminierung unnötiger Scans.
- **Neu**: `WisoInterestCalculationsLab.jsx` & `src/utils/wisoInterestCalculationsEngine.js` — IHK WISO Zins- & Zinseszinsrechnung Studio: Deutsche Zinsmethode (30/360 Tage: $Z = \frac{K \times p \times t}{100 \times 360}$), Zinseszins-Aufzinsung ($K_n = K_0 \times (1+i)^n$) und Abzinsung (Diskontierung / Barwert).
- **Neu**: `KafkaRebalanceLab.jsx` & `src/utils/kafkaRebalanceEngine.js` — Apache Kafka Partition Rebalance & Consumer Group Protocol Studio: Gegenüberstellung von klassischem Eager Rebalancing (Stop-the-World mit 3.5s Downtime) und modernem Cooperative Sticky Rebalancing (inkrementelle Übergabe mit 45ms Latenz).
- **Routing & Navigation**: Vollständige Verknüpfung in `Navbar.jsx`, `CommandPaletteModal.jsx` und `App.jsx`.
- **Test-Suite**: **177 bestandene Unit-Tests** in **63 Test-Dateien** mit 100% Erfolgsquote (vorher 171/59).

### Version 3.27.0 (Linux BPFtrace, Postgres WAL Replication, IHK Andler & OpenTelemetry Edition)

- **Neu**: `BpftraceLab.jsx` & `src/utils/bpftraceEngine.js` — Linux BPFtrace Dynamic Tracing Studio: Kernel Kprobes (`kprobe:vfs_read`), Tracepoints (`sys_enter_openat`) und Uprobes (`uprobe:/bin/bash:readline`) mit Auswertung von Latenz-Histogrammen (`hist()`).
- **Neu**: `PostgresWalLab.jsx` & `src/utils/postgresWalEngine.js` — PostgreSQL WAL & Streaming Replication Studio: Berechnung von Log Sequence Number (LSN) Byte-Offsets (`0/16B3748`), Replikations-Verzögerungen (`replay_lag`) und Point-In-Time-Recovery (PITR).
- **Neu**: `WisoAndlerLab.jsx` & `src/utils/wisoAndlerEngine.js` — IHK WISO Optimale Bestellmenge (Andler) Studio: Klassische Losgrößenformel ($x_{\text{opt}} = \sqrt{\frac{200 \times J \times k_f}{p \times l_s}}$), Bestellintervall $t_{\text{opt}}$, Bestellhäufigkeit $n_{\text{opt}}$ und Kostenoptimum (Schnittpunkt von Bestellfixkosten und Lagerhaltungskosten).
- **Neu**: `OpentelemetryTracingLab.jsx` & `src/utils/opentelemetryTracingEngine.js` — OpenTelemetry Distributed Tracing Studio: W3C `traceparent` Header-Generierung (`00-traceId-spanId-01`), Baggage-Propagation und interaktive Waterfall Trace Spans (Jaeger/Zipkin-Stil).
- **Routing & Navigation**: Vollständige Verknüpfung in `Navbar.jsx`, `CommandPaletteModal.jsx` und `App.jsx`.
- **Test-Suite**: **171 bestandene Unit-Tests** in **59 Test-Dateien** mit 100% Erfolgsquote (vorher 164/55).

### Version 3.26.0 (Prometheus PromQL, Event-Sourcing CQRS, IHK Darlehen/Tilgung & WebRTC SFU Edition)

- **Neu**: `PromqlAlertLab.jsx` & `src/utils/promqlAlertEngine.js` — Prometheus PromQL & Alerting Studio: Histogramm-Quantile (`histogram_quantile(0.95, ...)`), Fehlerraten-Berechnungen und automatische Generierung von Prometheus Alerting Rule YAML Manifesten.
- **Neu**: `EventSourcingLab.jsx` & `src/utils/eventSourcingEngine.js` — Event-Sourcing & CQRS Read-Model Studio: Unveränderliche Append-Only Event Logs, deterministischer Event-Replay zur Zustandswiederherstellung und Snapshotting.
- **Neu**: `WisoLoanCollateralLab.jsx` & `src/utils/wisoLoanCollateralEngine.js` — IHK WISO Darlehensarten & Kreditsicherheiten Studio: Jährliche Tilgungspläne für Annuitäten-, Raten- und Fälligkeitsdarlehen sowie IHK-Klassifizierung von Personal- (Bürgschaft, Zession) und Realsicherheiten (Grundschuld, Sicherungsübereignung).
- **Neu**: `WebrtcSfuLab.jsx` & `src/utils/webrtcSfuEngine.js` — WebRTC Media Server Architecture Studio: Vergleich von $O(N^2)$ Full Mesh P2P, MCU Transcoding und modernem SFU Simulcast Dynamic Layer-Routing.
- **Routing & Navigation**: Nahtlose Integration in `Navbar.jsx`, `CommandPaletteModal.jsx` und `App.jsx`.
- **Test-Suite**: **164 bestandene Unit-Tests** in **55 Test-Dateien** mit 100% Erfolgsquote (vorher 158/51).

### Version 3.25.0 (Linux eBPF/XDP, Postgres FlameGraph, IHK ABC/XYZ & WireGuard ZTNA Edition)

- **Neu**: `EbpfXdpLab.jsx` & `src/utils/ebpfXdpEngine.js` — Linux eBPF & XDP (eXpress Data Path) Sandbox: High-Speed Paketfilterung auf NIC-Treiberebene (`XDP_DROP`, `XDP_PASS`, `XDP_TX`) und C-Code-Verifikation im virtuellen eBPF Kernel-Verifier (Bounds-Checking, Loop-Safety) in unter 50 Nanosekunden.
- **Neu**: `PostgresFlamegraphLab.jsx` & `src/utils/postgresFlamegraphEngine.js` — PostgreSQL EXPLAIN FlameGraph & Buffer Cache Studio: Hierarchische Zeitverteilung komplexer Abfragen, Shared Buffer Cache Hit Ratios und Erkennung von Seq-Scan-Bottlenecks.
- **Neu**: `WisoAbcXyzLab.jsx` & `src/utils/wisoAbcXyzEngine.js` — IHK WISO ABC- und XYZ-Materialanalyse Studio: Kumulative Wertanteils-Klassifizierung (Lorenz-Kurve: A $\le$ 80%, B $\le$ 95%, C $>$ 95%) und Bedarfsverbrauchs-Vorhersagbarkeit (X/Y/Z Matrix) mit 3x3-Beschaffungsstrategien (Just-in-Time, Vorrat, Einzelbeschaffung).
- **Neu**: `WireguardZtnaLab.jsx` & `src/utils/wireguardZtnaEngine.js` — WireGuard VPN & Zero-Trust Architecture Studio: 1-RTT NoiseIK Handshakes (Curve25519), AllowedIPs Cryptokey Routing und dynamische Zero-Trust Policy Validierung anhand von Device Health Scores.
- **Routing & Navigation**: Vollständige Verknüpfung in `Navbar.jsx`, `CommandPaletteModal.jsx` und `App.jsx`.
- **Test-Suite**: **158 bestandene Unit-Tests** in **51 Test-Dateien** mit 100% Erfolgsquote (vorher 152/47).

### Version 3.24.0 (Linux Container Isolation, Postgres MVCC/Autovacuum, IHK Deckungsbeitrag & OAuth Token Exchange Edition)

- **Neu**: `LinuxContainerLab.jsx` & `src/utils/linuxContainerEngine.js` — Linux Container Isolation & Cgroups v2 Studio: 6 Kern-Namespaces (PID, NET, MNT, UTS, IPC, USER), Cgroups v2 Bandbreiten-Drosselung (`cpu.max`) und OOM-Killer Auslösung bei Überschreitung von `memory.max`.
- **Neu**: `PostgresMvccLab.jsx` & `src/utils/postgresMvccEngine.js` — PostgreSQL MVCC Tuple Headers & Autovacuum Engine: Simulation von `xmin`, `xmax`, `t_ctid`, Dead Tuple Anhäufung bei DML-Operationen, Schwellwertberechnung für Autovacuum ($\text{Threshold} = 50 + 0.2 \times \text{reltuples}$) und Vergleich von `VACUUM` (FSM) vs. `VACUUM FULL` (`AccessExclusiveLock`).
- **Neu**: `WisoContributionMarginLab.jsx` & `src/utils/wisoContributionMarginEngine.js` — IHK WISO Deckungsbeitrags- & Break-Even-Point Studio: Stückdeckungsbeitrag ($db = p - k_v$), Gewinnschwelle ($x_{\text{BEP}} = \frac{K_f}{db}$) und mehrstufige Fixkostenspaltung (Erzeugnis-, Gruppen-, Bereichs- und Unternehmensfixkosten).
- **Neu**: `OauthTokenExchangeLab.jsx` & `src/utils/oauthTokenExchangeEngine.js` — OAuth 2.0 Token Exchange Studio (RFC 8693): Token Delegation mit Actor-Claim (`act: { sub: "gateway" }`) vs. Impersonation und Live RFC 8693 POST-Request / JWT-Payload Inspector.
- **Routing & Navigation**: Vollständige Integration in `Navbar.jsx`, `CommandPaletteModal.jsx` und `App.jsx`.
- **Test-Suite**: **152 bestandene Unit-Tests** in **47 Test-Dateien** mit 100% Erfolgsquote (vorher 142/43).

### Version 3.23.0 (Linux Virtual Memory, Postgres Connection Pool, IHK Skonto/Mahnwesen & Service Mesh mTLS Edition)

- **Neu**: `LinuxMemoryLab.jsx` & `src/utils/linuxMemoryEngine.js` — Linux Virtual Memory & Page Fault Studio: MMU Adressübersetzung via TLB (L1/L2 Cache), Minor Page Faults (OS Page Cache) vs. Major Page Faults (Disk Swap I/O) und dynamischer Linux OOM-Score-Rechner (`/proc/[pid]/oom_score`).
- **Neu**: `PostgresPoolLab.jsx` & `src/utils/postgresPoolEngine.js` — PostgreSQL Connection Pooling & SQL Isolation Studio: Vergleich von Session-, Transaction- und Statement-Pooling mit PgBouncer zur Reduzierung des RAM-Footprints um über 90% sowie interaktive SQL Isolation Anomaly Matrix (Dirty Reads, Non-Repeatable Reads, Phantoms, Serialization Anomalies).
- **Neu**: `WisoDunningLab.jsx` & `src/utils/wisoDunningEngine.js` — IHK WISO Skonto-Effektivzins, Verzugszinsen & Mahnwesen Studio: Berechnung des effektiven Jahreszinses bei Skontonutzung ($p_{\text{eff}} = \frac{\text{Skonto\%} \times 360}{\text{Zahlungsziel} - \text{Skontofrist}}$), BGB § 288 Verzugszinsen (B2B vs. B2C) und 3-stufiges gerichtliches Mahnverfahren.
- **Neu**: `ServiceMeshLab.jsx` & `src/utils/serviceMeshEngine.js` — Service Mesh mTLS & Envoy Sidecar Studio: Envoy Proxy Traffic Interception (iptables `15001`), SPIFFE/SPIRE X.509 mTLS Identitäten, dynamisches Canary Traffic Shifting (z. B. 90/10 Split) und Validierung von Istio `VirtualService` / `PeerAuthentication` YAML Manifesten.
- **Neu**: `src/utils/haptics.js` — Web Vibration API Integration mit haptischem Feedback (`SUCCESS`, `WARNING`, `LEVEL_UP`).
- **Routing & Navigation**: Nahtlose Integration aller neuen Labs in `Navbar.jsx`, `CommandPaletteModal.jsx` und `App.jsx`.
- **Test-Suite**: **142 bestandene Unit-Tests** in **43 Test-Dateien** mit 100% Erfolgsquote (vorher 129/38).

### Version 3.10.0 (OAuth PKCE, K8s Topology & WebRTC Mesh Edition)
- **Neu**: `OauthPkceStudioLab.jsx` & `oauthPkceEngine.js` mit RFC 7636 PKCE ($S256$ SHA-256 Code Challenge), Consent Screen, Token Exchange, JWT Decoder und Bearer Token API Access.
- **Neu**: `KubernetesClusterStudioLab.jsx` & `k8sClusterEngine.js` mit visueller Control Plane, Worker Node Kapazitäten, automatischer Pod-Eviction / Self-Healing bei Node-Ausfällen und Ingress-to-Service Round-Robin Load Balancing.
- **Neu**: `WebRtcPeerStudioLab.jsx` & `webrtcPeerEngine.js` mit Dual-Peer Visualisierung (Caller & Callee), SDP Offer/Answer Handshake über Signaling Server, STUN/TURN ICE Candidates und Live DataChannel Chat mit Latenz- & Paketverlust-Simulation.
- **Aktualisiert**: `Navbar.jsx`, `CommandPaletteModal.jsx` und `App.jsx` für nahtloses Routing und Schnellzugriff.
- **Test-Suite**: Erweiterung auf **129 bestandene Unit-Tests** in **38 Test-Dateien** mit 100% Erfolgsquote.

### Version 3.9.0 (WASM, Crypto & PWA Push Edition)
- **Neu**: `WasmCompilerPlaygroundLab.jsx` & `wasmParserEngine.js` mit direktem In-Browser C/Rust Kompiler-Playground und WebAssembly Hex-Sektionsinspektor.
- **Neu**: `ZkpCryptoVisualizerLab.jsx` & `zkpCryptoEngine.js` mit interaktivem Elliptische-Kurven Visualisierer und Zero-Knowledge Proof (Schnorr) Simulation für Prover (Alice) & Verifier (Bob).
- **Neu**: `pushNotificationManager.js` zur lokalen PWA Push-Notification Planung, direkt integriert in `Sm2SpacedRepetitionLab.jsx` für tägliche Lern-Erinnerungen.
- **Aktualisiert**: `Navbar.jsx`, `CommandPaletteModal.jsx` und `App.jsx` für vollständiges Routing.
- **Test-Suite**: Weitere Erhöhung der Test-Abdeckung (**114 bestandene Unit-Tests** in **35 Test-Dateien**).

### Version 3.8.0 (Next-Gen Engineering, Architecture & IHK Power Edition)
- **Neu**: `OsProcessSchedulerLab.jsx` & `osSchedulerEngine.js` mit CPU-Scheduling (FCFS, SJF, Round Robin, Priority), animiertem Gantt-Chart und Bankier-Algorithmus zur Deadlock-Vermeidung.
- **Neu**: `PacketSnifferLab.jsx` & `packetSnifferEngine.js` mit Schichten 2–7 Paket-Dissektion, synchronem Hex-Dump/ASCII-Viewer und Wireshark-Display-Filtern.
- **Neu**: `ErdDesignerLab.jsx` & `erdDesignerEngine.js` mit relationalem ERD-Designer, 1NF–3NF Normalform-Audit und Multi-Dialekt SQL DDL Generator.
- **Neu**: `TransformerAttentionLab.jsx` & `transformerAttentionEngine.js` mit Scaled Dot-Product Self-Attention Heatmap ($QK^T / \sqrt{d_k}$), Temperature / Top-P Sampling und autonomem ReAct AI Agenten-Trace.
- **Neu**: `CloudArchitectureCanvasLab.jsx` & `cloudArchitectureEngine.js` mit Cloud-Topologie-Planung, Compound SLA-Berechnung ($A_{\text{ges}}$), Ausfallzeit-Kalkulation und SPOF-Linter.
- **Neu**: `IhkGradeCalculatorLab.jsx` & `ihkGradeCalculations.js` mit offizieller AO 2020 IHK-Gewichtung (AP1/AP2/Projekt) und Mündliche Ergänzungsprüfung (MEP) Rechner.
- **Neu**: `RackConfiguratorLab.jsx` & `rackCalculations.js` mit 42HE Serverschrank, Schein-/Wirkleistungsberechnung ($VA, W$), USV-Akkulaufzeit und BTU/h Klimakühlung.
- **Neu**: `ItsmSimulatorLab.jsx` & `itsmEngine.js` mit ITIL 4 Incident/Problem/Change Warteschlange, SLA-Countdowns und Change Advisory Board (CAB) Risikobewertung.
- **Neu**: `Sm2SpacedRepetitionLab.jsx` & `sm2Algorithm.js` mit wissenschaftlichem SuperMemo SM-2 Algorithmus und interaktiver Ebbinghaus-Vergessenskurve.
- **Neu**: `PersonalNotebookLab.jsx` mit Markdown-Editor, Tag-Suche, LocalStorage Auto-Save und `.md`-Export.
- **Aktualisiert**: `Navbar.jsx`, `CommandPaletteModal.jsx` und `App.jsx` mit vollständiger Integration aller neuen Flaggschiff-Module und Dashboard-Schnellzugriffen.
- **Test-Suite**: Erfolgreich erweitert auf **102 bestandene Unit-Tests** in **33 Test-Dateien** mit 100% Erfolgsquote.

### Version 3.7.0 (Agile, GraphQL & IoT Edition)
- **Neu**: `AgileScrumSimulatorLab.jsx` & `scrumEngine.js` mit Kanban-Board, Story Point Estimation und Recharts Burndown-Charts.
- **Neu**: `GraphqlExplorerStudioLab.jsx` & `graphqlSandboxEngine.js` mit In-Browser GraphQL Query-Engine und Abstract Syntax Tree (AST) Visualizer.
- **Neu**: `BleSensorSimulatorLab.jsx` & `bleSensorEngine.js` mit Bluetooth Low Energy GATT-Server Simulation, Sensor-Telemetrie und Byte-Dekodierung.
- **Aktualisiert**: Navigation in `Navbar.jsx`, `LabsDashboard.jsx`, `CommandPaletteModal.jsx` und `App.jsx`.

### Version 3.6.0 (Event-Driven & Speech Edition)
- **Neu**: `RegexRailroadVisualizerLab.jsx` & `regexParserEngine.js` mit visuellen Eisenbahndiagrammen, Syntax-Bäumen und Live-Matching.
- **Neu**: `WebhookInspectorLab.jsx` & `webhookSimulator.js` mit simuliertem HTTP-Webhook-Server, Request-Logs und Header-Signaturen.
- **Neu**: `VoiceQuizStudioLab.jsx` & `voiceQuizEngine.js` mit sprachgesteuertem Audio-Quiz zu Podcast-Themen via Web Speech API.
