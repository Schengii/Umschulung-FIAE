---
tags:
  - project/informatik-lernen
  - type/software
  - tech/react
  - domain/ihk-ausbildung
  - status/active
version: v3.36.0
date: 2026-09-04
---

# 💻 Informatik-lernen (IT-DevGame) - Projektübersicht

> Interaktive IHK-Prüfungsvorbereitung, Gamification & IT-Simulatoren-Hub für Fachinformatiker (FIAE, FISI, FIDP, FIDV, IT-SE).

## 📂 Verlinkte Hauptdateien im Vault
- [[README|📖 Projektdokumentation & Feature-Guide]]
- [[CLAUDE|🛠️ Entwickler- & KI-Leitfaden (CLAUDE.md)]]
- `.gitignore` & `.claudeignore`

---

## 🎯 Wichtige Meilensteine (Version 3.36.0)
1. **DNSSEC Cryptographic Chain of Trust & RRSIG Validation Studio (`DnssecValidationLab.jsx` & `dnssecValidationEngine.js`)**: End-to-End Vertrauenskette von der ICANN Root Zone (`.`) über TLDs (`.de`) bis zur Domain (`example.de`). KSK/ZSK Schlüsseltrennung (Flags 257/256), SHA-256 DS-Record Hashing im Parent, RRSIG Signaturprüfung über RRsets, NSEC3 Authenticated Denial of Existence gegen Zone Walking und Simulation der Dan Kaminsky DNS Cache Poisoning Abwehr.
2. **IHK Agile vs. Waterfall & Burndown Studio (AP2 Teil A) (`IhkAgileBurndownLab.jsx` & `ihkAgileBurndownEngine.js`)**: Vorgehensmodell-Entscheider und Controlling-Simulator für IT-Abschlussprojekte nach AO 2020. Dynamisches SVG Sprint-Burndown-Diagramm (Ideal-Linie vs. Ist-Verlauf über 5–15 Tage), Velocity-Messung (Story Points pro Tag), Scope-Creep-Simulation, Kanban WIP-Bottleneck-Prüfung nach Little's Law und 1-Klick IHK-Begründungstext-Generator für den Projektantrag.
3. **Linux Btrfs / ZFS Copy-on-Write (CoW) & Snapshot Sandbox (`LinuxCowSnapshotLab.jsx` & `linuxCowSnapshotEngine.js`)**: Extent-B-Trees und Block-Level Storage Simulator für moderne Linux-Dateisysteme. Geteilte physische Disk-Blöcke (Refcounts), atomare 0-Byte-Snapshots (`btrfs subvolume snapshot -r @root @snap`) in Millisekunden ohne zusätzliche SSD-Belegung, Write-Delta-Allokationen, Instant Snapshot Rollbacks und Bit-Rot Self-Healing Scrubbing (`btrfs scrub start`) via Prüfsummen.
4. **OpenAPI 3.1 & JSON-Schema Contract Testing Studio (`OpenApiContractLab.jsx` & `openApiContractEngine.js`)**: REST-API Vertragsspezifikation und Validierungs-Studio nach OpenAPI 3.1 und JSON Schema 2020-12. Interaktiver Live Contract Validator mit Schema-Fehler-Audit (HTTP 422), semantischer Breaking Change Detector (v1 vs. v2) zur Warnung vor rückwärtsinkompatiblen Schnittstellenänderungen, 1-Klick TypeScript DTO Interface Generator und automatischer Test-Mock Payload Generator.
5. **TLS 1.3 0-RTT Early Data Replay Attack & Anti-Replay Defense Studio (`TlsReplayLab.jsx` & `tlsReplayEngine.js`)**: Simulation des TLS 1.3 Handshake-Ablaufs (1-RTT vs. 0-RTT PSK Early Data), Replay-Angriffe auf nicht-idempotente Zahlungs- und Transfer-Requests (`POST /api/transfer`) bei Session-Ticket-Wiederverwendung und Verteidigungsmechanismen (Single-Use Ticket Cache, Freshness-Checks, Idempotency-Filter).
6. **IHK Risikoanalyse & 5x5 Risikomatrix Studio (DIN EN 31010 / FMEA für AP2 Teil A & B) (`IhkRiskAnalysisLab.jsx` & `ihkRiskAnalysisEngine.js`)**: Praxisorientiertes Risikomanagement für IT-Projekte nach offiziellem IHK-Standard mit 5x5 Risikomatrix ($RPZ = A \times E$ bzw. FMEA $RPZ = A \times E \times D$), farbcodierten Risikoklassen, 4 Standard-Strategien (Vermeiden, Vermindern, Übertragen, Akzeptieren), Restrisiko-Neuberechnung und 1-Klick IHK-Dokumentations-Markdown-Export.
7. **eBPF Cilium Service Mesh & L7 Tracing Sandbox (`EbpfCiliumLab.jsx` & `ebpfCiliumEngine.js`)**: Kernel-basierte Netzwerk- und Security-Beobachtbarkeit für Kubernetes-Cluster mit eBPF TC & XDP Hooks, Cilium L3/L4 & L7 Network Policies, Kernel-Map-Inspektor (`BPF_MAP_TYPE_HASH`), Hubble L7 Live-Flow-Stream und interaktivem XDP SYN-Flood-Drop-Filter.
8. **PostgreSQL Index Types Deep Dive Studio (B-Tree, GIN, GiST, BRIN) (`PostgresIndexTypesLab.jsx` & `postgresIndexTypesEngine.js`)**: Datenbank-Performance-Analyse und Index-Auswahl für relationale SQL-Workloads mit Laufzeit- und Kostenvergleich (`EXPLAIN ANALYZE`) zwischen Sequential Scan, B-Tree, GIN (JSONB / Volltext), GiST (2D Geodaten) und BRIN (zeitlich sortierte Zeitreihen) sowie automatischem Index-Empfehlungs-Assistenten.
9. **IHK Wirtschaftlichkeits-, Amortisations- & Make-or-Buy Rechner (`IhkWirtschaftlichkeitLab.jsx` & `ihkWirtschaftlichkeitEngine.js`)**: Praxisorientiertes Pflicht-Kalkulationsmodul für die IHK-Projektdokumentation (AP2 Teil A) mit statischer & dynamischer Amortisationsrechnung (Break-Even in Monaten), vollständiger Make-or-Buy Gegenüberstellung (interne Entwicklungskosten vs. SaaS-Lizenzierung über $N$ Jahre mit Handlungsempfehlung), Kostenvergleichs-Matrix (Alt vs. Neu) und 1-Klick IHK-Dokumentations-Markdown-Export.
10. **Web Crypto API & Hardware Token Studio (FIDO2 / WebAuthn & Passkeys) (`WebAuthnPasskeyLab.jsx` & `webAuthnEngine.js`)**: Passwortlose Authentifizierung nach W3C WebAuthn Level 3 und FIDO2 Standard mit Hardware-Sicherheitsschlüsseln (YubiKey / Touch ID / Windows Hello), Public-Key Kryptographie (ES256 / RS256), Authenticator Data Flag-Dekodierung (UP, UV, BE, BS) und Replay-Schutz via kryptografischen Challenges.
11. **Linux Systemd Unit Lifecycle & Cgroups v2 Service Sandbox (`SystemdServiceLab.jsx` & `systemdServiceEngine.js`)**: Vollständiger Linux Service Daemon Simulator mit Unit-Lifecycle (`active`, `activating`, `deactivating`, `failed`), Restart-Policies (`always`, `on-failure`), Cgroups v2 Ressourcen-Limitierung (`CPUQuota=50%`, `MemoryMax=512M`), OOM-Killer Trigger und interaktivem `systemctl` & `journalctl` Terminal-Log-Viewer.
12. **WebAssembly SIMD 3x3 Faltungsmatrix & Sobel-Filter Upgrade (`WasmSimdStudioLab.jsx` & `wasmSimdEngine.js`)**: Parallele 2D-Bildfaltungsberechnungen mit 128-Bit Vektor-Registern (`v128`). Vordefinierte 3x3 Faltungskerne (Sobel X/Y Kantenerkennung, Gaußscher Weichzeichner, Scharfzeichnen), Vektorisierung von 4 Float-Nachbarpixeln in einem CPU-Takt via FMA und Live-Faltungsmatrix-Inspektor mit direkter Auswertung über `applySimdConvolutionFilter`.
13. **IHK Projekt-Gantt & Meilenstein-Editor**: Offizielles Zeitplanungs- und Phasen-Tool für den IHK-Abschlussbericht und Projektantrag (FIAE 80h / FISI 40h), Kalender-Gantt ohne Wochenenden, Realisierungs-/Dokumentations-Grenzwertprüfung und Markdown-Export.
14. **WebAssembly 128-Bit SIMD & Vector Studio**: 128-Bit Vektor-Register (`v128`, `f32x4`, `i32x4`, `u8x16`), Parallelisierung von 4 Floats in einem CPU-Takt, MFLOPS-Durchsatzmessung gegen skalaren JS-Code (~3.8x Hardware-Speedup) und WAT Bytecode-Generierung.
15. **HTTP/3 & QUIC Protocol Inspector**: Multi-Stream UDP-Multiplexing Simulator, Head-of-Line Blocking Eliminierung bei Paketverlust (0-35%), 0-RTT TLS 1.3 Handshake & Connection-ID (CID) Migration bei Netzwerkwechsel (WLAN zu 5G).
16. **Zustand Store IndexedDB Hydration & Redundanter Persistenz-Layer**: Asynchrone Dual-Persistence Spiegelung aller Benutzer- und Lernzustände in IndexedDB, Notfall-Hydration bei gelöschtem LocalStorage und Checkpoint-Snapshotting.
17. **IHK Präsentations-Stoppuhr & Folien-Gliederung**: 15-Minuten Countdown für AP2 Teil A, 4 Phasen-Gliederung mit Zeitbudgets, Web Audio Gong-Signale & Rubriken-Bewertung (1-6).
18. **Docker Compose Multi-Container Orchestrator**: Topologische DAG-Startreihenfolge (`depends_on`), Bridge-Netzwerk-Isolation mit Ping-Simulator, persistente Docker-Volumes & Compose 3.8 YAML Export.
19. **Dynamic CI/CD GitHub Actions Workflow Simulator**: Mehrstufige Pipelines (`needs`), Dependency Caching (`actions/cache@v4`), Secrets-Maskierung (`***`) & Live ANSI Runner-Logs.
20. **Offline IndexedDB Storage Synchronizer**: Asynchrone NoSQL-Persistenz über das 5-MB-LocalStorage-Limit hinaus, Dual-Save-Architektur im Notizbuch (`PersonalNotebookLab.jsx`).
21. **IHK Fachgespräch & Audio-Prüfungssimulator**: 15-Minuten Fachgespräch mit Web Speech API (TTS-Fragen & STT-Einsprechen), 3 Persona-Prüfer & Notenschlüssel (1-6).
22. **Ansible Playbook & Idempotenz Studio**: Deklarative Server-Provisionierung (`inventory.ini`, `playbook.yml`) mit interaktivem Beweis der Idempotenz.
23. **Web Worker & Concurrency Studio**: Benchmark rechenintensiver CPU-Tasks (Eratosthenes Primzahl-Sieb & Monte-Carlo RAID URE Simulation) mit 60 FPS Herzschlag-Anzeige.
24. **IHK Netzplan Studio (CPM / DIN 69900)**: Vorwärts- & Rückwärtsrechnung (FAZ, FEZ, SAZ, SEZ), Gesamt- & Freier Puffer (GP, FP) und Kritischer Pfad.
25. **UML Studio (Sequenz- & Aktivitätsdiagramme)**: Interaktive OMG UML 2.5 Modellierung mit IHK-Linter und 1-Klick Mermaid.js Export.

---

## 📊 Aktuelle Test- & Qualitätsmetriken (v3.36.0)
- **Unit-Tests**: 349 bestandene Tests in 100 Test-Dateien (100% Erfolgsquote)
- **Code-Qualität**: 0 Oxlint Fehler / 0 Warnungen über 428 Quelldateien
- **Build**: Vite 7 / PWA Offline Service Worker (~776ms Build-Dauer)
- **A11y**: WCAG 2.1 Konformität (Reduced Motion Support, keine Zoom-Blocker)
