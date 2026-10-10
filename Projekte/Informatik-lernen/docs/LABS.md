# Lab-Übersicht

> Automatisch erzeugt aus `src/data/labModulesData.js` mit `npm run docs:labs` – nicht von Hand bearbeiten.

**229 Labs** in 16 Kategorien.

## ai (7)

| Tab-ID | Titel | Level | Beschreibung |
|---|---|---|---|
| `vector_math_embedding_lab` | Vektor-Mathematik & Embedding-Distanz Studio | Intermediate | Mathematisches Fundament von Vektordatenbanken: Cosine-Similarity, Euklidische L2-Distanz, Manhattan L1-Abstand und Skalarprodukt. |
| `rag_semantic_cache_lab` | RAG Semantic Cache & Vector Similarity Studio | Advanced | Vektor-Ähnlichkeits-Caching mit Cosine-Similarity Schwellenwert. Schnelle Index-Lookups (<10ms) sparen teure LLM-Inferenz und Token-Kosten. |
| `ragai` | Local RAG Vector AI Simulator | Advanced | Retrieval Augmented Generation mit Cosine Similarity & Chunking interaktiv testen. |
| `transformer_attention` | Transformer Attention & LLM Studio | Intermediate | Self-Attention Heatmap, Softmax & ReAct Agent |
| `vector_search` | Vektorsuche (Local RAG) | Intermediate | Ähnlichkeitssuche über Embeddings, die Grundlage von RAG-Pipelines. |
| `ai_business` | AI & Deep Learning Masterclass | Intermediate | CNNs, Transformers, RAG & Prompting |
| `ai` | Advanced Prompt Engineering Lab | Intermediate | Prompts gezielt entwerfen, testen und verbessern. |

## algorithms (10)

| Tab-ID | Titel | Level | Beschreibung |
|---|---|---|---|
| `computation_worker` | Web Worker & Concurrency Studio | Intermediate | Main Thread vs. Worker Thread CPU-Benchmarks ohne UI-Blockaden (60fps Garantie). |
| `wasm_simd_studio_lab` | WebAssembly SIMD & Vector Studio | Expert | 128-Bit Vektor-Register (f32x4), Geschwindigkeits-Benchmark vs. JS Loop & WAT Bytecode. |
| `code_debugger_lab` | Code Execution & Memory Debugger | Intermediate | Schritt-für-Schritt Interpreter mit Call Stack, Scope Chains & Heap-Speicher. |
| `datastructures` | Data Structures Tree & Graph Lab | Intermediate | Binäre Suchbäume (Inorder, Preorder, Postorder) und Dijkstra-Wegfinder visualisieren. |
| `regexmaster` | RegEx Master Interactive Lab | Intermediate | Reguläre Ausdrücke live testen, E-Mail- & IPv4-Regex-Quests meistern. |
| `bigo` | Big-O Algorithm Benchmark Lab | Intermediate | Vergleiche O(1), O(log n), O(n), O(n²) und O(2^n) mit dynamischen Diagrammen. |
| `os_scheduler` | OS Process Scheduler & Deadlock | Intermediate | FCFS, SJF, Round Robin & Bankier-Algorithmus |
| `algo_lab` | Algorithmen Step-Visualisierer | Intermediate | Sortier- & Suchalgorithmen Schritt für Schritt |
| `perf_lab` | Performance Profiling Lab | Intermediate | V8 Garbage Collection & Memory-Leak-Analyse |
| `big_o` | Big-O Komplexitäts-Visualizer | Intermediate | Laufzeitverhalten bei wachsender Eingabegröße |

## architecture (3)

| Tab-ID | Titel | Level | Beschreibung |
|---|---|---|---|
| `llm_rag_chunking_lab` | LLM RAG Chunking & Cross-Encoder Re-Ranking | Advanced | Dokumenten-Chunking (Fixed, Sliding, Paragraph) und Two-Stage Retrieval mit Cross-Attention gegen Halluzinationen. |
| `raid6_galois_lab` | RAID 6 Dual-Parity & Galois Field GF(2^8) Studio | Expert | Mathematische P (XOR) & Q (GF 2^8) Paritätsberechnung und simultane Rekonstruktion zweier Ausfälle. |
| `clean_arch_lab` | Clean Architecture & Hexagonal Ports/Adapters | Advanced | Interaktiver Architektur-Linter nach Robert C. Martin: Dependency Rule, Domänen-Entkopplung & Ports. |

## cloud (26)

| Tab-ID | Titel | Level | Beschreibung |
|---|---|---|---|
| `k8s_gateway_api_lab` | Kubernetes Gateway API & Envoy Traffic Splitting Studio | Advanced | Moderne Service-Mesh- und Ingress-Architektur: Gewichtetes Canary-Traffic-Splitting, HTTP-Header-Filter, 1000-Request Live-Simulation und production-ready YAML-Manifeste. |
| `sre_slo_burn_lab` | Prometheus PromQL Alerting & SRE Error-Budget Burn Studio | Advanced | SLO-Verfügbarkeitsberechnung und Multi-Window Multi-Burn-Rate Alerting nach Google SRE Workbook zur Vermeidung von Pager-Müdigkeit inklusive fertiger YAML-Manifeste. |
| `kafka_consumer_lag_lab` | Kafka Consumer Lag & Partition Rebalance Protocol Studio | Advanced | Echtzeit-Tracking von Consumer Lag, Partition-Assignor-Strategien und Gegenüberstellung von Eager (Stop-the-World) vs. Cooperative Sticky Rebalancing. |
| `argocd_gitops_lab` | ArgoCD GitOps & Cluster Sync Studio | Advanced | Deklaratives GitOps mit ArgoCD: Git als Single Source of Truth, Drift-Erkennung (Out-of-Sync), Auto-Prune und Self-Healing. |
| `terraform` | Terraform & OpenTofu IaC Studio | Advanced | Deklaratives State-Management, Execution Plans (Diff) & Directed Acyclic Resource Graph. |
| `ebpf_cilium_lab` | eBPF Cilium Service Mesh & L7 Tracing | Expert | Sidecarless Cloud-Native Architektur: Linux Kernel Socket-Bypass (sockmap) vs. Envoy Sidecars. |
| `webhook_inspector` | REST API Webhook Inspector & Mock Server | Intermediate | Empfange, inspiziere und validiere eingehende HTTP-Webhooks live im Browser. |
| `ipv6_routing_lab` | IPv6 & Routing-Table Simulator | Advanced | Adresskompression, automatische EUI-64 SLAAC & Longest Prefix Match Router. |
| `http3_quic_lab` | HTTP/3 & QUIC Protocol Inspector | Advanced | Vergleiche HTTP/1.1, HTTP/2 und HTTP/3 unter Paketverlust. |
| `circuit_breaker_lab` | Circuit Breaker & Resilience Lab | Advanced | Closed/Open/Half-Open Zustandsmaschine & Distributed Tracing Spans. |
| `k8s_cni_lab` | Kubernetes CNI & VXLAN Overlay Lab | Advanced | Cross-Node Pod-to-Pod Paketfluss mit VXLAN UDP Encapsulation (Port 4789). |
| `webrtc_signaling_lab` | WebRTC P2P & SDP Signaling Lab | Advanced | SDP Offer/Answer Handshake, NAT Traversal & RTCDataChannel Chat. |
| `dns_http_lab` | DNS & HTTP/TLS Lifecycle Inspector | Intermediate | Verfolge den Web-Request von Resolver & TLD bis zum TLS Handshake. |
| `k8s` | Kubernetes Pods & Ingress Studio | Advanced | Verwalte Deployments, Pod-Replikationen, Services und Ingress Controller. |
| `cloud_canvas` | Cloud Architecture SLA & SPOF Canvas | Intermediate | Cloud Architecture SLA & SPOF Canvas |
| `cloud_designer` | Cloud Infrastructure Designer | Intermediate | Architektur-Canvas & Terraform-Code-Export |
| `docker_compose` | Docker Compose Studio | Intermediate | Multi-Container-Anwendungen mit Docker Compose beschreiben und starten. |
| `system_design` | System Design & Load Balancer | Intermediate | Skalierung, Caching & Balancing-Strategien |
| `wasm_rust_studio` | WebAssembly & Rust Compiler | Intermediate | Rust zu Wasm kompilieren & ausführen |
| `kubernetes` | Kubernetes Pods & Cluster | Intermediate | Deployments, ReplicaSets & Ingress |
| `wasm_compiler` | WebAssembly Compiler Playground | Intermediate | C/Rust In-Browser Kompilierung & Hex-Inspektor |
| `linux_memory_lab` | Linux Virtual Memory & Page Fault Studio (TLB & OOM Score) | Intermediate | Linux Virtual Memory & Page Fault Studio (TLB & OOM Score) |
| `service_mesh_lab` | Service Mesh mTLS & Envoy Sidecar Studio (SPIFFE & Canary) | Intermediate | Service Mesh mTLS & Envoy Sidecar Studio (SPIFFE & Canary) |
| `linux_container_lab` | Linux Namespaces & Cgroups v2 | Intermediate | PID/NET Isolation, cpu.max & OOM-Kill |
| `bpftrace_lab` | Linux BPFtrace Dynamic Tracing | Advanced | Kernel Kprobes, Tracepoints & Syscalls |
| `docker` | Docker & Container Lab | Intermediate | Dockerfile, Container & Port-Mapping |

## code (10)

| Tab-ID | Titel | Level | Beschreibung |
|---|---|---|---|
| `openapi_contract_lab` | OpenAPI 3.1 & JSON-Schema Contract Testing | Intermediate | Echtzeit-Payload-Validierung gegen JSON Schema 2020-12, Breaking Change Erkennung und DTO-Export. |
| `graphql_explorer` | GraphQL Schema & Query Explorer | Intermediate | Führe GraphQL Queries live im Browser aus und inspiziere den Syntaxbaum (AST). |
| `regex_railroad` | RegEx Railroad & Diagramm Studio | Intermediate | Visuelle Eisenbahndiagramme & Syntax-Bäume für reguläre Ausdrücke. |
| `git_conflict_lab` | Git 3-Way Merge Conflict Resolver | Intermediate | Löse reale Git Merge-Konflikte (HEAD vs. Incoming vs. Both) visuell auf. |
| `custom_challenges` | Custom Coding Challenge Creator | Intermediate | Erstelle eigene Programmier-Challenges mit Testfällen & JSON Export/Import. |
| `coding_challenges` | Live Coding Challenge Studio | Intermediate | LeetCode-Style Programmieraufgaben mit automatischem Test-Runner im Browser. |
| `ieee754_lab` | IEEE-754 Gleitkomma & Zahlen-Studio | Advanced | 32-Bit Bit-Manipulation, Mantisse/Exponent & KV-Diagramm Minimierer. |
| `neural_net_lab` | Neural Network & BPE Tokenizer Studio | Advanced | Forward-Propagation, Gewichte/Biases & Byte-Pair Encoding für LLMs. |
| `graphql_resolver_lab` | GraphQL AST & DataLoader Lab | Advanced | Visualisiere AST-Parsing & eliminiere N+1 Queries mit DataLoader Batching. |
| `pythonwasm` | Python WebAssembly (Pyodide) Lab | Beginner | Führe echten Python-Code ohne Server direkt im Browser über WebAssembly aus. |

## database (3)

| Tab-ID | Titel | Level | Beschreibung |
|---|---|---|---|
| `sql_isolation_lab` | SQL Transaction Isolation & ACID Studio | Advanced | ANSI SQL:1992 Isolationslevel (Read Committed, Repeatable Read, SSI): Interaktive Simulation von Dirty Reads, Non-Repeatable Reads, Phantom Reads und Write Skew. |
| `sql_window_functions_lab` | SQL Window Functions & Analytics Studio | Advanced | Analytische SQL-Fensterfunktionen nach ANSI SQL:2003: ROW_NUMBER(), RANK(), DENSE_RANK(), NTILE(), LEAD/LAG und kumulierende Summen. |
| `postgres_index_types_lab` | PostgreSQL Index Types Deep Dive | Advanced | Vergleiche B-Tree, GIN, GiST und BRIN Indizes hinsichtlich Speicherbedarf & Abfrage-Speedup. |

## databases (15)

| Tab-ID | Titel | Level | Beschreibung |
|---|---|---|---|
| `sqlite_studio` | SQLite & Relational Database Studio | Intermediate | In-Browser relationale Datenbank-Konsole mit Schema-Explorer und CSV-Export. |
| `postgres_mvcc_lab` | PostgreSQL MVCC & VACUUM Simulator | Advanced | Verstehe Zeilenversionierung, Dead Tuples und Table Bloat Bereinigung. |
| `redis_caching_lab` | Redis Caching & Invalidation Lab | Advanced | Cache-Aside, Write-Through & Schutz vor Cache Stampede mit Mutex. |
| `postgres_explain_lab` | PostgreSQL Query Tree & Cost Visualizer | Advanced | Hierarchischer Ausführungsbaum mit Kosten, Startup Cost & Zeilenschätzungen. |
| `sql_transaction_lab` | SQL Transaktionen, ACID & Deadlocks | Advanced | 2-Session SQL Simulator für Dirty Reads, Phantom Reads & Sperrkonflikte. |
| `sql_optimizer_lab` | SQL Query Optimizer & EXPLAIN ANALYZE | Intermediate | Vergleiche Full Table Scans vs. B-Tree Index Scans und reduziere Abfrage-Kosten. |
| `sql_joins` | SQL JOINs & Venn-Diagramm Builder | Beginner | Visuelle In-Memory Simulation von INNER, LEFT, RIGHT & FULL JOINs. |
| `sqldungeon` | SQL Dungeon Crawler | Beginner | Löse SQL-Rätsel mit echten Queries (SELECT, JOIN, WHERE) um Räume zu durchqueren. |
| `erd_designer` | Relational ERD & 3NF Normalform-Linter | Intermediate | Entity Relationships, 1NF-3NF Audit & SQL DDL |
| `postgres_pool_lab` | PostgreSQL Connection Pooling & SQL Isolation Studio (PgBouncer) | Intermediate | PostgreSQL Connection Pooling & SQL Isolation Studio (PgBouncer) |
| `postgres_flamegraph_lab` | PostgreSQL EXPLAIN FlameGraph | Advanced | Buffer Cache Hits, Seq Scan & Tree Latency |
| `postgres_wal_lab` | PostgreSQL WAL & Replication Lag | Advanced | LSN Offsets, Streaming & PITR |
| `postgres_partitioning_lab` | PostgreSQL Partitioning & Pruning | Intermediate | Range, List & Hash Partitioning DDL |
| `postgres_fulltext_lab` | PostgreSQL Full-Text Search | Intermediate | tsvector, tsquery & ts_rank Scoring |
| `data_lineage_etl` | ETL Pipeline & Data Lineage Studio | Intermediate | FIDP/FIAE Datenintegration, DWH & Schema-Drift Audit |

## devops (18)

| Tab-ID | Titel | Level | Beschreibung |
|---|---|---|---|
| `uml_diagram` | UML Studio (Sequenz & Aktivität) | Intermediate | Interaktive Modellierung synchroner/asynchroner Nachrichtenflüsse & Mermaid.js Export. |
| `ansible_playbook` | Ansible Playbook & Idempotenz Studio | Intermediate | Server-Provisionierung mit apt, template & systemd. Beweise das Idempotenz-Prinzip. |
| `github_actions_lab` | GitHub Actions CI/CD Workflow Studio | Intermediate | DAG Job-Stufen, Dependency Caching, Secrets-Maskierung und Live ANSI Runner-Logs. |
| `systemd_service_lab` | Linux Systemd & Cgroups v2 Sandbox | Intermediate | Service Lifecycle, Restart-Policies (on-failure) und Cgroups v2 Memory-Limits unter OOM-Stress. |
| `linux_permissions_lab` | Linux Permissions & Inode Rechner | Intermediate | Oktal-/Symbolische Rechte, SUID Bits & Inode Blockbelegung live berechnen. |
| `cicd_matrix_lab` | CI/CD Matrix Linter & Runner Lab | Advanced | Validiere GitHub Actions YAML, Multi-OS Matrix & parallele Testläufe. |
| `git_graph_lab` | Git Branching & Rebase Graph Visualizer | Beginner | Visueller interaktiver Commit-Graph mit Branch-Pointern, Merges & interaktivem Terminal. |
| `cicd_workflow` | CI/CD Workflow Pipeline Builder | Intermediate | Visueller Stufen- & Job-Builder für automatische Builds, Unit Tests & Kubernetes Deployment. |
| `gitvisual` | Visual Git Branching & Merge Lab | Beginner | Echtzeit-Visualisierung von Commits, Branches, Checkouts und Merge-Konflikten. |
| `git_lab` | Git-Lab | Intermediate | Git-Workflows üben: Commits, Branches, Merge und Rebase. |
| `cicd_pipeline` | CI/CD Pipeline Builder | Intermediate | GitHub-Actions-Stages & YAML-Export |
| `promql_alert_lab` | Prometheus PromQL & Alerting | Intermediate | p95 Latency, Error-Rate & Rule YAMLs |
| `event_sourcing_lab` | Event-Sourcing & CQRS Studio | Intermediate | Append-Only Event Log & Read-Model |
| `opentelemetry_tracing_lab` | OpenTelemetry Distributed Tracing | Intermediate | W3C traceparent & Waterfall Spans |
| `kafka_rebalance_lab` | Kafka Partition Rebalance Studio | Intermediate | Eager vs. Cooperative Sticky Rebalancing |
| `kafka` | Apache Kafka Event-Architektur | Intermediate | Producers, Topics & Consumer Groups |
| `cloud_devops` | Cloud & DevOps Praxis | Intermediate | Cloud- und DevOps-Grundlagen: Pipelines, Deployment und Betrieb. |
| `tooling` | Entwickler-Setup-Guide | Beginner | VS Code, Git & Docker einrichten |

## fiae (14)

| Tab-ID | Titel | Level | Beschreibung |
|---|---|---|---|
| `bpmn_process_lab` | OMG BPMN 2.0 Geschäftsprozessmodellierung & Swimlanes Studio | Intermediate | Standardkonforme Geschäftsprozesse: Startereignisse, Endereignisse, Tasks, Gateways (XOR/AND/OR), Swimlanes, Token-Simulation und IHK-Konformitäts-Linter. |
| `struktogramm_lab` | DIN 66261 Nassi-Shneiderman Struktogramm & Schreibtischtest Studio | Intermediate | Interaktiver DIN 66261 Visualisierer: Sequenz, Verzweigung (IF/CASE), kopf- & fußgesteuerte Schleifen sowie schrittweiser Schreibtischtest (Trace-Tabelle) mit Variablenverfolgung. |
| `database_normalization_lab` | IHK Relationales Datenbank-Normalisierungs-Studio (1. NF, 2. NF, 3. NF) | Intermediate | Schrittweise Überführung unnormalisierter Relationen bis zur 3. NF: Atomarisierung, Beseitigung partieller & transitiver Abhängigkeiten und interaktiver INSERT/UPDATE/DELETE Anomalien-Simulator. |
| `testverfahren_lab` | IHK Software-Testverfahren & Grenzwertanalyse Studio | Intermediate | Black-Box Äquivalenzklassenbildung (GÄK & UÄK), 6-Punkte Grenzwertanalyse (min-1, min, max+1) und McCabe Kontrollfluss-Komplexität (M = E - N + 2P). |
| `personal_notebook` | Developer Notizbuch & Vault | Intermediate | Markdown-Notizen, Code-Snippets & Export |
| `anfaenger_guide` | Einsteiger Kurs ohne Vorwissen | Beginner | EVA-Prinzip, CPU, Binärlogik & Web |
| `monaco_studio` | Monaco Code Studio | Intermediate | VS-Code-Editor direkt im Browser |
| `api_mock_studio` | API Mock Studio | Intermediate | REST-Endpunkte mocken und Anfragen testen. |
| `web_components` | Web Components Masterclass | Intermediate | Custom Elements, Shadow DOM & Lit.dev |
| `tdd` | TDD & Unit-Testing Lab | Intermediate | Test-Driven Development: Tests zuerst schreiben, dann implementieren. |
| `architecture` | Systemarchitektur & Microservices | Intermediate | Clean Architecture, Scalability & Caching |
| `design_patterns` | Design Patterns Lab | Intermediate | Singleton, Observer, Factory & Strategy |
| `languages` | Programmiersprachen Academy | Intermediate | Python, JavaScript, TypeScript, Java, C# |
| `app_workshop` | App-Workshop: Task-Manager | Intermediate | Eigene Web- & Mobile-App von A bis Z bauen |

## hardware (7)

| Tab-ID | Titel | Level | Beschreibung |
|---|---|---|---|
| `backup_strategy_lab` | IHK Backup-Strategien & Disaster Recovery Studio (3-2-1 & GFS) | Intermediate | Voll- vs. Diff- vs. Inkrementelle Sicherung, Großvater-Vater-Sohn 20-Medien-Rotationsrechner, RTO/RPO Ausfallschadenkalkulation und 3-2-1-1-0 Ransomware-Resilienz-Audit. |
| `usv_calculator_lab` | IHK USV-Dimensionierung & Stromversorgungs-Studio | Intermediate | Berechnung von Wirk- & Scheinleistung (W / VA) mit cos φ, Autonomiezeit-Kalkulation im Akkubetrieb, DIN EN 62040-3 USV-Typen (VFD, VI, VFI) und Rechenzentrums-PUE-Metrik. |
| `raid_calculator` | RAID Storage & Paritäts-Rechner | Intermediate | Simuliere RAID 0, 1, 5, 6, 10 & 50. Berechne Kapazitäten, URE-Risiko & Rebuild-Zeiten. |
| `linux_cow_snapshot_lab` | Linux Btrfs/ZFS Copy-on-Write Sandbox | Advanced | Block-Level Refcounts, atomare 0-Byte-Snapshots, Write-Deltas, Rollbacks und Bit-Rot Self-Healing. |
| `ble_sensor` | BLE & GATT Sensor Simulator | Intermediate | Simuliere GATT Server, Bluetooth-Services und Sensor-Telemetriedaten. |
| `cpu_architecture_lab` | Von-Neumann CPU & Register-Simulator | Beginner | Taktzyklen (Fetch, Decode, Execute), Register (PC, AC, IR, MAR) & RAM-Matrix live simulieren. |
| `rack_configurator` | 19" Rack- & USV/Klimarechner | Intermediate | 42HE Schrank, USV-Laufzeit & BTU/h Kühlung |

## ihk (46)

| Tab-ID | Titel | Level | Beschreibung |
|---|---|---|---|
| `ihk_proposal_pdf_lab` | IHK Projektantrag PDF- & Dokumentations-Generator | Intermediate | Offizieller Antrag auf Zulassung zur Projektarbeit (AP2 Teil A): Detaillierte Zeit- & Phasenplanung, DSGVO Art. 32 TOMs, Wirtschaftlichkeit & 1-Klick A4-PDF-Export. |
| `wiso_personal_planung_lab` | IHK WISO Personalbedarfsplanung: Brutto & Netto Studio | Intermediate | Kaufmännische Personalbedarfsermittlung: Arbeitszeit- und Kennzahlenmethode, Reservebedarf bei Ausfallquote sowie Netto-Einstellungsbedarf nach IHK-Prüfungsstandard. |
| `wiso_company_forms_lab` | IHK WISO Rechtsformen & Haftungs-Entscheidungsmatrix | Intermediate | Systematischer Vergleich von Einzelunternehmen, Personengesellschaften (GbR, OHG, KG) und Kapitalgesellschaften (UG, GmbH, AG) nach HGB, BGB und GmbHG. |
| `wiso_contract_breach_lab` | IHK WISO Kaufvertragsstörungen & Sachmängelhaftung | Intermediate | Rechtliche Fallsimulation nach BGB §§ 433–441 & HGB § 377: Rügefristen (B2B vs. B2C), Vorrang der Nacherfüllung und Sekundärrechte bei 2 Fehlversuchen. |
| `exam_readiness_lab` | Adaptiver IHK Prüfungspfad & Countdown-Planer | Intermediate | Echtzeit-Prüfungsbereitschaftsanalyse mit Tagen bis zum nächsten IHK-Termin, gewichteter Notenprognose (AP1/AP2/WiSo) und Handlungsempfehlungen. |
| `ihk_mep_simulator_lab` | IHK Mündliche Ergänzungsprüfung (MEP) Simulator | Intermediate | Offizieller IHK Notenretter (2:1 Gewichtung): 15-minütige mündliche Ergänzungsprüfung bei schriftlicher Note 5 (30–49 Punkte) mit Frage-Antwort-Simulator. |
| `wiso_financing_lab` | WISO Finanzierungsvergleich: Kauf vs. Kredit vs. Leasing | Intermediate | Kaufmännische Gegenüberstellung von Barzahlung (mit Skonto), Bankdarlehen (Ratentilgung) und Operating Leasing inklusive AfA § 7 EStG Steuerersparnis. |
| `dguv_v3_lab` | DGUV Vorschrift 3 & VDE Elektro-Prüfstudio | Intermediate | Elektrische Sicherheit nach DIN VDE 0701-0702 & 0100-410: Schutzklassen I–III, Schutzleiterwiderstand R_PE, Isolationswiderstand R_ISO, 30 mA RCD-Abschaltung und RZ-USV. |
| `wiso_liquiditaet_lab` | IHK WISO Liquiditätsgrade & Working Capital Studio | Intermediate | Berechnung von Liquidität 1., 2. und 3. Grades (Cash, Quick, Current Ratio), Net Working Capital (NWC) und IHK-Zahlungsunfähigkeit nach InsO § 17. |
| `nwa_sensitivity_lab` | IHK Nutzwertanalyse (NWA) Sensitivitäts-Studio | Intermediate | DIN/VDI 2225 Entscheidungsmatrix mit 500x Monte-Carlo Stresstest und K.O.-Kriterien Absicherung für AP2. |
| `wiso_rentabilitaet_leverage_lab` | WISO Rentabilitätskennzahlen & Leverage-Effekt | Intermediate | Eigenkapital-, Gesamtkapital- und Umsatzrendite sowie Hebelwirkung von Fremdkapital (Leverage-Effekt). |
| `wiso_maschinenstundensatz_lab` | IHK Maschinenstundensatz-Rechner (MSS) | Intermediate | Kalkulatorische Abschreibung, Zinsen nach Durchschnittsmethode, Raum-, Energie- & Werkzeugkosten pro Stunde. |
| `wiso_zuschlagskalkulation_lab` | IHK Fertigungs- & Zuschlagskalkulation Studio | Intermediate | Staffelrechnung: MGKZ, FGKZ, Herstellkosten, VwGKZ/VtGKZ, Gewinn und Barverkaufspreis. |
| `wiso_multi_contribution_lab` | Mehrstufige Deckungsbeitragsrechnung & Break-Even | Intermediate | DB I bis DB IV (Erzeugnis-, Gruppen-, Bereichs- & Unternehmensfix) und dynamischer Sicherheitskoeffizient. |
| `ihk_weakness_audit_lab` | IHK Schwachstellen-Audit & Adaptiver Assistent | Beginner | Fehlerquoten-Analyse nach IHK-Lernfeldern mit automatischer Generierung gezielter Wiederholungs-Sitzungen. |
| `bsi_grundschutz_lab` | BSI IT-Grundschutz & NIS-2 Risiko-Studio | Intermediate | Schutzbedarfsfeststellung (BSI 200-2), Baustein-Audit (BSI 200-3) & NIS-2 Melde- und Risikoplanung mit IHK-Export. |
| `wiso_payroll_lab` | WISO Brutto-Netto & Lohnabrechnungs-Studio | Beginner | Lohnsteuerklassen I-VI, Sozialabgaben (KV, PV mit Kinderlosenzuschlag, RV, AV) & AG-Gesamtbelastung. |
| `ihk_study_plan_lab` | IHK Prüfungs-Countdown & Adaptiver Lernplaner | Beginner | Prüfungstermine für AP1/AP2, tagesgenauer Countdown und personalisierte wochenbasierte Sprints. |
| `ihk_certificate_pdf_lab` | IHK Lernpass & Zertifikats-Generator | Beginner | Offizieller PDF-Ausbildungsnachweis für das Berichtsheft mit allen absolvierten IHK-Kompetenzen. |
| `ihk_tom_catalog_lab` | IHK DSGVO TOM-Katalog Studio (Art. 32) | Intermediate | Audit aller 8 gesetzlichen TOM-Kategorien nach Art. 32 DSGVO mit Score & IHK-Markdown-Export. |
| `ihk_dpia_lab` | IHK Datenschutz-Folgenabschätzung (DSFA / Art. 35) | Intermediate | Schwellenwertanalyse (DSK-Blacklist), Risikomatrix für Betroffene & Markdown Doku-Export. |
| `wiso_labor_law_lab` | IHK Arbeitsrecht & Kündigungsschutz Studio | Intermediate | Gesetzliche Kündigungsfristen nach BGB § 622, KSchG-Wartezeit & Sonderkündigungsschutz prüfen. |
| `nwa_scoring` | IHK Nutzwertanalyse Studio (NWA) | Intermediate | Offizielle Bewertungsmatrix mit Gewichtung, K.O.-Kriterien & IHK-Projektbericht Export. |
| `ihk_project_proposal` | IHK Projektantrags-Prüfer & Meilenstein-Planer | Advanced | Stundenprüfung (80h/40h), Phasenverteilung und IHK-Genehmigungs-Checkliste. |
| `cpm_network` | IHK Netzplan Studio (CPM / DIN 69900) | Intermediate | Vorwärts- & Rückwärtsrechnung, FAZ/FEZ/SAZ/SEZ, Pufferzeiten GP/FP & Kritischer Pfad. |
| `oral_defense_studio` | IHK Fachgespräch & Audio-Simulator | Advanced | 15-minütiges Prüfungsgespräch mit Sprachausgabe, Persona-Prüfern und Antwort-Scoring. |
| `presentation_timer_lab` | IHK Präsentations-Stoppuhr & Gliederung | Intermediate | 15-Minuten Zeitüberwachung mit Phasengliederung, Akustik-Warnung & IHK-Rubriken. |
| `ihk_project_gantt_lab` | IHK Projekt-Gantt & Meilenstein-Editor | Advanced | Interaktive Zeit- & Phasenplanung für den IHK-Abschlussbericht mit Soll/Ist-Prüfung & Export. |
| `ihk_wirtschaftlichkeit_lab` | IHK Wirtschaftlichkeit & Amortisation | Advanced | Kaufmännische Amortisationsrechnung (Pay-Off), Make-or-Buy Matrix und Kostenvergleich Alt vs. Neu. |
| `ihk_risk_analysis_lab` | IHK Risikoanalyse & 5x5 Risikomatrix | Intermediate | DIN EN 31010 & FMEA Risikomatrix (W × S = RPZ), Gegenmaßnahmen & IHK-Markdown-Export. |
| `ihk_burndown_lab` | IHK Agile vs. Waterfall & Burndown Studio | Intermediate | Sprint-Burndown Chart (Ideal vs. Ist), Scope-Creep, WIP-Bottlenecks und IHK-Begründungsgenerator. |
| `scrum_simulator` | Scrum Sprint & Kanban Simulator | Intermediate | Plane Sprints, bewege Stories auf dem Kanban-Board und analysiere Burndown-Charts. |
| `voice_quiz` | Podcast Voice Quiz Studio | Intermediate | Sprachgesteuertes Audio-Quiz zu IT-Berufe-Podcast-Themen per Mikrofon. |
| `tco_roi_lab` | TCO & ROI Wirtschaftlichkeits-Simulator | Intermediate | Vergleiche Total Cost of Ownership und Amortisationsmonat für IHK-Projekte. |
| `p2p_duell` | IHK Quiz-Duell Arena (1v1 / P2P) | Intermediate | Echtzeit 1-gegen-1 Quiz-Match gegen Azubis oder smarte Bots mit Zeitbonus. |
| `wiso_kalkulation` | WISO & Handelskalkulations-Studio | Intermediate | Vorwärtskalkulation, Deckungsbeiträge, Kritischer Pfad (CPM) & Arbeitsrecht. |
| `cheat_sheets` | IHK Spickzettel & PDF-Generator | Beginner | Druckfertige DIN A4 PDF-Zusammenfassungen für IHK-Klausuren & AP1/AP2. |
| `ihk_doc_generator` | IHK Projektantrag- & Doku-Generator | Intermediate | 80h/40h Zeitplanung, Amortisations-ROI Rechner & Markdown Export. |
| `oral_exam` | IHK AP2 Fachgesprächs-Simulator | Intermediate | Simuliere 15 Min. Projektpräsentation & 15 Min. Prüfer-Fachgespräch für FIAE & FISI. |
| `ihk_grade_calculator` | IHK Noten- & MEP-Rechner (AO 2020) | Intermediate | Exakte Gewichtung AP1/AP2 & Ergänzungsprüfung |
| `itsm_simulator` | ITIL 4 ITSM & Service Desk Studio | Intermediate | Incident Queue, SLA-Matrix & CAB Risk Score |
| `sm2_spaced_repetition` | SuperMemo SM-2 Spaced Repetition | Intermediate | Karteikarten & Ebbinghaus-Vergessenskurven |
| `leitner` | Leitner Karteikarten-System | Intermediate | Spaced Repetition mit 5 Lernboxen |
| `podcast` | IHK Fachinformatiker Podcast | Intermediate | Datenschutz, Encodings & Stefan Macke Tipps |
| `lernfelder` | IHK Lernfelder 1 - 12b | Intermediate | Offizieller Rahmenlehrplan Berufsschule |
| `quiz_arena` | IHK Knowledge Quiz Arena | Intermediate | Schnelligkeits-Quiz & Leaderboard |

## linux (3)

| Tab-ID | Titel | Level | Beschreibung |
|---|---|---|---|
| `linux_mac_selinux_lab` | Linux SELinux & AppArmor MAC Security Studio | Advanced | Mandatory Access Control vs. DAC (chmod/chown), Type Enforcement (httpd_t -> shadow_t), AVC Denials und Root-Privilege Escalation Abwehr. |
| `linux_psi_cgroup_lab` | Linux Cgroups v2 & PSI Pressure Stall Studio | Advanced | CPU, Memory & I/O Pressure Stalls (some vs. full), CFS-Throttling und OOM-Killer Vermeidung für Kubernetes Pods. |
| `linux_cap_seccomp_lab` | Linux Capabilities & Seccomp BPF Sandbox | Advanced | Principle of Least Privilege: CAP_NET_BIND_SERVICE, CAP_SYS_ADMIN, Syscall-Filtering & SECCOMP_RET_KILL. |

## network (27)

| Tab-ID | Titel | Level | Beschreibung |
|---|---|---|---|
| `stp_protocol_lab` | IEEE 802.1D / 802.1w Spanning Tree Protocol (STP & RSTP) Studio | Intermediate | Root-Bridge-Wahl (Priority + MAC), Pfadkosten (10G/1G/100M), Port-Rollen (Root, Designated, Alternate), Loop-Auflösung und STP (30-50s) vs. RSTP (<1s) Konvergenzvergleich. |
| `nat_pat_lab` | RFC 3022 / RFC 2663 NAT, PAT & Port-Forwarding Studio | Intermediate | Header-Transformation im Router: Inside Local zu Inside Global, dynamische PAT-Portvergabe, Live NAT Translation Table und RFC 1918 Adressraum-Prüfung. |
| `vlan_trunking_lab` | IEEE 802.1Q VLAN, Trunking & Router-on-a-Stick Studio | Intermediate | 4-Byte 802.1Q Tag-Bitfeldrechner (TPID 0x8100, PCP QoS, DEI, 12-Bit VID), Access- vs. Trunk-Port-Simulation und Cisco Router-on-a-Stick CLI-Konfigurationsgenerator. |
| `dhcp_dora_lab` | RFC 2131 DHCP DORA & Relay-Agent Studio | Intermediate | 4-Way DORA Handshake (Discover -> Offer -> Request -> Ack), Lease-Time Lifecycle (T1 50% Renewal & T2 87.5% Rebind) und GIADDR Relay Agent Routing. |
| `tcp_state_machine_lab` | TCP Connection State Machine & 3-Way Handshake Studio | Intermediate | Interaktiver RFC 793 Zustandsautomat: 3-Way Handshake (SYN -> SYN-ACK -> ACK), Datenfluss mit PSH/ACK, 4-Way Teardown (FIN -> ACK -> FIN -> ACK) und TIME_WAIT 2MSL Timer. |
| `bgp_anycast_ddos_lab` | BGP Anycast & DDoS Flow-Scrubber Studio | Advanced | Weltweite Ingress-Verkehrsverteilung über Edge-PoPs (Frankfurt, Amsterdam, New York, Tokio), SYN-Cookies, FlowSpec-Filterung und BGP Anycast Route-Withdrawal. |
| `routing_dijkstra_lab` | Routing-Algorithmen: Dijkstra (SPF) & Spanning Tree (STP) | Advanced | Interaktive Simulation von OSPF Shortest Path First (Dijkstra) und Spanning Tree Protocol (STP) zur Verhinderung von Switching-Loops und Broadcast-Storms. |
| `http_caching_lab` | HTTP Caching Studio (RFC 9111): Cache-Control & ETag 304 | Intermediate | Browser- und Reverse-Proxy Caching nach RFC 9111: max-age, no-cache vs. no-store, bedingte Anfragen mit If-None-Match und 0-Byte 304 Revalidierung. |
| `dns_privacy_lab` | DNS Privacy Inspector: DoH & DoT vs. Port 53 | Intermediate | RFC 8484 DNS-over-HTTPS & RFC 7858 DNS-over-TLS Wire-Format-Analyse, ISP-Eavesdropping Abwehr und TLS-Verschlüsselung im Vergleich. |
| `webrtc_ice_gathering_lab` | WebRTC STUN/TURN & ICE Candidate Gathering | Advanced | RFC 8445 Candidate Gathering (Host, Server Reflexive, Relay), NAT-Traversal & automatischer TURN Fallback. |
| `bgp_path_selection_lab` | BGP Path Selection & Decision Studio | Advanced | RFC 4271 8-Stufen-Entscheidungsprozess: Weight, Local Preference, AS-Path-Länge, Origin, MED, eBGP/iBGP & Router-ID. |
| `linux_netns_lab` | Linux Network Namespaces, veth & Bridge Studio | Advanced | Container-Netzwerkgrundlagen: Virtual Ethernet Pairs, br0 Switching & iptables MASQUERADE. |
| `ipv6_ndp_lab` | IPv6 SLAAC, DHCPv6 & NDP Inspector | Advanced | RFC 4861 Neighbor Discovery Protocol, invertiertes EUI-64 u/l Bit & RFC 8981 Privacy Extensions Simulation. |
| `vlsm_subnet` | VLSM Subnet Splitter & IP-Planer | Intermediate | Hierarchische IPv4-Subnetzaufteilung nach Host-Bedarf ohne Adressraum-Verschwendung. |
| `transfer_time_lab` | IHK Übertragungszeit- & Bandbreiten-Rechner | Intermediate | Dateigröße, Bandbreite und Übertragungsdauer berechnen (Bit/Byte, Protokoll-Overhead). |
| `packet_sniffer` | Web-Wireshark Packet Sniffer | Intermediate | Frame Dissection, Hex Dump & Display Filter |
| `subnetting` | Subnetting-Trainer (IPv4) | Intermediate | Subnetzmasken, Netz-/Broadcast-Adressen und Hostbereiche berechnen und üben. |
| `packet_tracer` | Network Packet Tracer | Intermediate | Route Visualizer & Ping-Simulation |
| `websocket_protocol` | WebSockets & Real-Time Protokoll | Intermediate | Handshake, Frames & Ping/Pong |
| `websockets` | WebSockets Grundlagen | Beginner | HTTP-101-Handshake & TCP-Duplex-Verbindung |
| `webrtc_peer_studio` | WebRTC P2P & DataChannel Studio | Intermediate | SDP Offer/Answer, STUN/TURN & Live Impairment Chat |
| `ebpf_xdp_lab` | Linux eBPF & XDP Packet Filter | Advanced | Kernel Verifier, XDP_DROP & JIT Engine |
| `webrtc_sfu_lab` | WebRTC Media Server (SFU/MCU) | Intermediate | Simulcast Routing vs. P2P-Mesh |
| `linux_bridge_vxlan_lab` | Linux Bridge & VXLAN Overlay | Intermediate | veth-Paare, br0 FDB & UDP 4789 Tunnel |
| `bgp_anycast_lab` | Linux BGP Routing & Anycast | Advanced | eBGP/iBGP Peering, AS-Path & Anycast IP |
| `grpc_protobuf_lab` | gRPC Protocol Buffers Studio | Intermediate | Proto3 Schema, Wire Varints & HTTP/2 |
| `api_studio` | REST vs GraphQL API Studio | Intermediate | Endpunkte testen & HTTP-Status-Codes live |

## security (26)

| Tab-ID | Titel | Level | Beschreibung |
|---|---|---|---|
| `dnssec_rollover_lab` | DNSSEC KSK & ZSK Key Rollover & Chain-of-Trust Simulator | Advanced | Simuliere ZSK Pre-Publish und KSK Double-DS Rollover Schritt für Schritt: TTL-Caches, Parent-Zone DS-Publikation und lückenlose Validierung der Vertrauenskette. |
| `cloud_iam_policy_lab` | Cloud IAM Policy Evaluator & Least-Privilege Linter | Advanced | Auswertung von Organization SCPs, Identity- und Resource-Policies mit striktem Explicit Deny Vorrang sowie automatischem Linter für überprivilegierte Administrator-Rechte. |
| `linux_auditd_ebpf_lab` | Linux Auditd & eBPF Syscall Tracepoint Security Studio | Advanced | Kernel-Level Threat Hunting: Erkennung von RCE-Reverse-Shells, Privilege Escalation und Passwort-Tampering via Auditd-Regeln und eBPF Syscall-Filtern. |
| `oauth21_dpop_lab` | OAuth 2.1 & RFC 9449 DPoP Sender-Constrained Security Studio | Advanced | Modernste Token-Sicherheit: Wegfall unsicherer Legacy-Flows (Implicit, Password), strikter PKCE-Zwang (S256) und kryptographische Tokenbindung mit Replay-Schutz. |
| `mtls_ztna_lab` | Mutual TLS (mTLS) & Zero-Trust Service-Mesh Studio | Advanced | Gegenseitige Zertifikatsprüfung auf Transportschicht, CRL-Zertifikatssperren und feingranulare Zero-Trust RBAC-Zugriffskontrolle im Microservice-Mesh. |
| `srp_zero_knowledge_lab` | SRP-6a Zero-Knowledge Authentication Studio (RFC 5054) | Advanced | Kryptographische Authentifizierung ohne Passwortübertragung: Ephemere Schlüssel (a/b), Public Keys (A/B), Password Verifier (v) und beidseitiger Schlüsseltausch (S). |
| `pki_certificate_lab` | X.509 PKI & Certificate Chain Validator Studio | Advanced | Kryptographische Vertrauensketten (Root CA -> Intermediate -> Leaf), Hostname-Matching (SAN), Gültigkeitszeiträume und OCSP/CRL Revocation-Prüfung. |
| `jwt_confusion_lab` | JWT Algorithm Confusion & Security Studio | Advanced | RFC 7519 / 7518: Asymmetrische RS256 vs. symmetrische HS256 Key-Confusion, None-Algorithmus Exploit (CVE-2015-9235) und Signature Verification Defense. |
| `oauth_revocation_lab` | OAuth 2.0 Token Revocation & Introspection Studio | Advanced | RFC 7009 Token Revocation & RFC 7662 Introspection am API Gateway mit Kaskadierungslogik. |
| `webauthn_passkey_lab` | FIDO2 WebAuthn & Passkey Studio | Advanced | Passwortlose Anmeldung via Hardware-Tokens & Biometrie mit interaktivem Phishing-Schutz-Beweis. |
| `tls_replay_lab` | TLS 1.3 0-RTT Replay Attack Studio | Advanced | RFC 8446 Early Data Sicherheit, Replay-Angriffe auf Zahlungen und Single-Use Ticket Abwehr. |
| `dnssec_validation_lab` | DNSSEC Chain of Trust & RRSIG Studio | Advanced | Hierarchische Validierung vom Root-Anker über TLDs, NSEC3 Denial-of-Existence und Kaminsky-Abwehr. |
| `owasp_exploit_lab` | OWASP Top 10 Live-Exploit Sandbox | Advanced | Interaktive Sicherheitslücken-Analyse & wirksame Gegenmaßnahmen im Code. |
| `jwks_rotation_lab` | OAuth2 JWKS & Key Rotation Studio | Advanced | Asymmetrische Token-Signierung & Zero-Downtime Key Rotation. |
| `crypto_keygen_lab` | RSA & Diffie-Hellman Crypto Lab | Advanced | Mathematische RSA Primzahl-Schlüsselpaar-Generierung und Chiffrierung. |
| `clean_code_lab` | Clean Code & Security Review Arena | Intermediate | Finde kritische Sicherheitslücken, N+1 Queries & Memory Leaks im Code. |
| `pkce` | OAuth2 PKCE & OIDC Identity Studio | Advanced | Proof Key for Code Exchange Key-Generierung, Code-Austausch & JWT Decoding. |
| `ctf_lab` | Cybersecurity CTF Quest | Intermediate | XSS, SQL-Injection & Command Injection |
| `oauth_oidc` | OAuth2 & OpenID Connect | Intermediate | Authorization Code Flow mit PKCE & JWT |
| `zkp_crypto` | ZKP & Kryptographie Visualizer | Advanced | Elliptische Kurven & Zero-Knowledge Proofs |
| `oauth_token_exchange_lab` | OAuth 2.0 Token Exchange Studio | Intermediate | RFC 8693 Delegation, Actor Claim & JWT |
| `wireguard_ztna_lab` | WireGuard VPN & Zero-Trust ZTNA | Intermediate | 1-RTT NoiseIK & Cryptokey Routing |
| `tls_handshake_lab` | TLS 1.3 Handshake Studio | Intermediate | 1-RTT Full Handshake & 0-RTT Session Resumption |
| `jwt_attack_lab` | JWT Sicherheitslücken Studio | Intermediate | alg:none Fälschung, Secret-Bruteforce & kid-Injection |
| `cors_pitfalls_lab` | CORS Fehlkonfigurationen Studio | Intermediate | Origin-Reflection, Regex-Bypass & Wildcard-Konflikt |
| `security_lab_v2` | Red vs Blue Team Simulator | Intermediate | Angriffs- & Verteidigungsszenarien |

## tools (1)

| Tab-ID | Titel | Level | Beschreibung |
|---|---|---|---|
| `sqlite_worker_lab` | SQLite Web Worker Sandbox (Zero-Jank Query Engine) | Intermediate | Asynchrone Auslagerung rechenintensiver SQL-Abfragen und Aggregationen in einen Hintergrund-Thread. |

## wiso (13)

| Tab-ID | Titel | Level | Beschreibung |
|---|---|---|---|
| `wiso_sachmaengel_lab` | IHK WISO Sachmängelhaftung & Gewährleistung Studio | Intermediate | Mangelarten nach BGB § 434 (Beschaffenheit, Montage, Aliud, Mindermenge), vorrangige Nacherfüllung (§ 439) vs. Rücktritt/Minderung und kaufmännische Rügepflicht nach HGB § 377. |
| `wiso_angebotsvergleich_lab` | IHK WISO Angebotsvergleich & Skontorechner Studio | Intermediate | Kaufmännischer Angebotsvergleich (LEP -> Rabatt -> ZEP -> Skonto -> BEP -> Bezugskosten -> Bezugspreis), effektiver Lieferantenzins (p_eff) vs. Kontokorrentkredit und Nutzwert-Matrix. |
| `wiso_break_even_lab` | IHK WISO Deckungsbeitrag Stufe 2 & Break-Even-Point Solver | Intermediate | Mehrstufige Deckungsbeitragsrechnung (DB I & DB II), Erzeugnis- und Unternehmensfixkosten, optimales Produktionsprogramm bei Engpässen und interaktive Break-Even-Kalkulation. |
| `wiso_payment_lab` | IHK WISO Zahlungsverkehr (SEPA-Überweisung, SEPA-Lastschrift, Wechsel & Skonto-Effektivzins) | Intermediate | Zahlungsverkehr: SEPA-Überweisung, SEPA-Lastschrift, Wechsel und Skonto-Effektivzins. |
| `wiso_dunning_lab` | IHK Skonto-Effektivzins & Mahnwesen Studio (BGB § 288) | Intermediate | Skonto-Effektivzins und Mahnwesen nach BGB § 288. |
| `wiso_contribution_margin` | IHK Deckungsbeitrag & BEP Studio | Intermediate | Stück-DB, Break-Even & mehrstufige Fixkosten |
| `wiso_abc_xyz` | IHK ABC- & XYZ-Materialanalyse | Intermediate | Kumulativ-Werte & 3x3 Beschaffungsmatrix |
| `wiso_loan_collateral` | IHK Darlehensarten & Kredite | Intermediate | Annuität vs. Rate & Realsicherheiten |
| `wiso_andler` | IHK Optimale Bestellmenge (Andler) | Intermediate | Losgröße x_opt, Intervalle & Kostenkurve |
| `wiso_interest` | IHK Zinsrechnung & Zinseszins | Intermediate | Deutsche Methode 30/360 & Aufzinsung |
| `wiso_capital_value` | IHK Kapitalwertmethode (NPV) | Intermediate | Dynamische Investitionsrechnung & Barwert |
| `wiso_bookkeeping_lab` | IHK WISO Doppelte Buchführung (T-Konten, Buchungssätze SKR03, GuV & Bilanz) | Intermediate | Doppelte Buchführung: T-Konten, Buchungssätze (SKR03), GuV und Bilanz. |
| `wiso_bab_lab` | IHK WISO Betriebsabrechnungsbogen BAB (Kostenstellenrechnung, Zuschlagssätze & Kalkulation) | Intermediate | Betriebsabrechnungsbogen: Kostenstellenrechnung, Zuschlagssätze und Kalkulation. |
