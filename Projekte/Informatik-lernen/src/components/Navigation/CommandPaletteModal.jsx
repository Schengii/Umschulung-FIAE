import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Terminal, BookOpen, Sparkles, Trophy, Cpu, Code2, 
  Layers, Award, FileText, ArrowRight, X, Command, Database, ShieldCheck,
  Calculator, Globe, ShieldAlert, Brain, GitMerge,
  Lock, Activity, GitCommit, Network, Server, Code, Radio, Mic, Zap,
  Clock, GitPullRequest, Calendar, Key, HardDrive, FileCode, TrendingDown
} from 'lucide-react';
import { TOPICS } from '../../data/topicsData';
import { GLOSSARY_TERMS } from '../../data/glossaryData';

export default function CommandPaletteModal({ isOpen, onClose, onNavigate, onOpenModal }) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Schnell-Befehle & Navigationselemente
  const staticActions = [
    { id: 'view-home', title: 'Übersicht / Startseite', category: 'Navigation', icon: BookOpen, action: () => onNavigate('dashboard') },
    { id: 'view-nwa-scoring', title: 'IHK Nutzwertanalyse Studio (NWA Entscheidungsmatrix & K.O.-Kriterien)', category: 'Prüfung', icon: Calculator, action: () => onNavigate('nwa_scoring') },
    { id: 'view-raid-calculator', title: 'RAID Storage & Paritäts-Rechner (RAID 0, 1, 5, 6, 10, 50 & URE Risiko)', category: 'Labs & Tools', icon: Database, action: () => onNavigate('raid_calculator') },
    { id: 'view-vlsm-subnet', title: 'VLSM Subnet Splitter & IP-Planer (Hierarchische Host-Berechnung)', category: 'Labs & Tools', icon: Network, action: () => onNavigate('vlsm_subnet') },
    { id: 'view-ihk-proposal', title: 'IHK Projektantrags-Prüfer & Meilenstein-Gantt (AO 2020 80h/40h)', category: 'Prüfung', icon: Award, action: () => onNavigate('ihk_project_proposal') },
    { id: 'view-cpm-network', title: 'IHK Netzplan Studio (CPM / Critical Path Method DIN 69900)', category: 'Prüfung', icon: GitCommit, action: () => onNavigate('cpm_network') },
    { id: 'view-uml-diagram', title: 'UML Studio (Sequenz- & Aktivitätsdiagramme mit Mermaid.js)', category: 'Labs & Tools', icon: Layers, action: () => onNavigate('uml_diagram') },
    { id: 'view-terraform', title: 'Terraform & OpenTofu IaC Studio (State Management & DAG)', category: 'Labs & Tools', icon: Server, action: () => onNavigate('terraform') },
    { id: 'view-oral-defense', title: 'IHK Fachgespräch & Audio-Simulator (15-Minuten Prüfungsgespräch)', category: 'Prüfung', icon: Mic, action: () => onNavigate('oral_defense_studio') },
    { id: 'view-ansible-playbook', title: 'Ansible Playbook & Idempotenz Studio (Server Automation)', category: 'Labs & Tools', icon: Server, action: () => onNavigate('ansible_playbook_lab') },
    { id: 'view-computation-worker', title: 'Web Worker & Hintergrund-Performance Studio (Concurrency)', category: 'Labs & Tools', icon: Zap, action: () => onNavigate('computation_worker_lab') },
    { id: 'view-presentation-timer', title: 'IHK Präsentations-Stoppuhr & Folien-Gliederung (15 Min AP2 Teil A)', category: 'Prüfung', icon: Clock, action: () => onNavigate('presentation_timer_lab') },
    { id: 'view-github-actions', title: 'GitHub Actions CI/CD Workflow Simulator (DAG & Cache)', category: 'Labs & Tools', icon: GitPullRequest, action: () => onNavigate('github_actions_lab') },
    { id: 'view-ihk-gantt', title: 'IHK Projekt-Gantt & Meilenstein-Editor (AP2 Zeitplanung 80h/40h)', category: 'Prüfung', icon: Calendar, action: () => onNavigate('ihk_project_gantt_lab') },
    { id: 'view-wasm-simd', title: 'WebAssembly SIMD & 128-Bit Vector Processing Studio (v128)', category: 'Labs & Tools', icon: Cpu, action: () => onNavigate('wasm_simd_studio_lab') },
    { id: 'view-ihk-wirtschaftlichkeit', title: 'IHK Wirtschaftlichkeits- & Amortisations-Studio (Make-or-Buy AP2)', category: 'Prüfung', icon: Calculator, action: () => onNavigate('ihk_wirtschaftlichkeit_lab') },
    { id: 'view-webauthn-passkey', title: 'FIDO2 WebAuthn & Passkey Studio (Asymmetrische Auth & Phishing-Schutz)', category: 'Labs & Tools', icon: Key, action: () => onNavigate('webauthn_passkey_lab') },
    { id: 'view-systemd-service', title: 'Linux Systemd Unit & Cgroups v2 Sandbox (Lifecycle & Limits)', category: 'Labs & Tools', icon: Server, action: () => onNavigate('systemd_service_lab') },
    { id: 'view-tls-replay', title: 'TLS 1.3 0-RTT Replay Attack & Anti-Replay Studio (RFC 8446 Early Data)', category: 'Labs & Tools', icon: Lock, action: () => onNavigate('tls_replay_lab') },
    { id: 'view-ihk-risk-analysis', title: 'IHK Risikoanalyse & 5x5 Risikomatrix (DIN EN 31010 / FMEA für AP2)', category: 'Prüfung', icon: ShieldAlert, action: () => onNavigate('ihk_risk_analysis_lab') },
    { id: 'view-ebpf-cilium', title: 'eBPF Cilium Service Mesh & L7 Tracing Sandbox (Sidecarless Kernel Bypass)', category: 'Labs & Tools', icon: Network, action: () => onNavigate('ebpf_cilium_lab') },
    { id: 'view-postgres-index-types', title: 'PostgreSQL Index Types Deep Dive (B-Tree, GIN, GiST & BRIN Tuning)', category: 'Labs & Tools', icon: Database, action: () => onNavigate('postgres_index_types_lab') },
    { id: 'view-dnssec-validation', title: 'DNSSEC Cryptographic Chain of Trust & RRSIG Validation Studio (RFC 4035)', category: 'Labs & Tools', icon: Globe, action: () => onNavigate('dnssec_validation_lab') },
    { id: 'view-ihk-burndown', title: 'IHK Agile vs. Waterfall & Burndown Studio (AP2 Teil A Projektarbeit)', category: 'Prüfung', icon: TrendingDown, action: () => onNavigate('ihk_burndown_lab') },
    { id: 'view-linux-cow-snapshot', title: 'Linux Btrfs / ZFS Copy-on-Write & Snapshot Sandbox (Extents & Scrub)', category: 'Labs & Tools', icon: HardDrive, action: () => onNavigate('linux_cow_snapshot_lab') },
    { id: 'view-openapi-contract', title: 'OpenAPI 3.1 & JSON-Schema Contract Testing Studio (Breaking Changes)', category: 'Labs & Tools', icon: FileCode, action: () => onNavigate('openapi_contract_lab') },
    { id: 'view-docker-orchestrator', title: 'Docker Compose Multi-Container Orchestrator (DAG & Network Isolation)', category: 'Labs & Tools', icon: Layers, action: () => onNavigate('docker_compose_lab') },
    { id: 'view-linux-memory', title: 'Linux Virtual Memory & Page Fault Studio (TLB & OOM Score)', category: 'Labs & Tools', icon: Cpu, action: () => onNavigate('linux_memory_lab') },
    { id: 'view-postgres-pool', title: 'PostgreSQL Connection Pooling & SQL Isolation Studio (PgBouncer)', category: 'Labs & Tools', icon: Database, action: () => onNavigate('postgres_pool_lab') },
    { id: 'view-wiso-dunning', title: 'IHK Skonto-Effektivzins & Mahnwesen Studio (BGB § 288)', category: 'Prüfung', icon: Calculator, action: () => onNavigate('wiso_dunning_lab') },
    { id: 'view-service-mesh', title: 'Service Mesh mTLS & Envoy Sidecar Studio (SPIFFE & Canary)', category: 'Labs & Tools', icon: ShieldCheck, action: () => onNavigate('service_mesh_lab') },
    { id: 'view-linux-container', title: 'Linux Namespaces & Cgroups v2 Container Studio (PID/NET & cpu.max)', category: 'Labs & Tools', icon: Cpu, action: () => onNavigate('linux_container_lab') },
    { id: 'view-wiso-cm', title: 'IHK Deckungsbeitrags- & Break-Even-Point Studio (KLR & mehrstufig)', category: 'Prüfung', icon: Calculator, action: () => onNavigate('wiso_contribution_margin') },
    { id: 'view-oauth-exchange', title: 'OAuth 2.0 Token Exchange Studio (RFC 8693 & Actor Claim)', category: 'Labs & Tools', icon: Lock, action: () => onNavigate('oauth_token_exchange_lab') },
    { id: 'view-ebpf-xdp', title: 'Linux eBPF & XDP Packet Filter Studio (Kernel Verifier & XDP_DROP)', category: 'Labs & Tools', icon: Terminal, action: () => onNavigate('ebpf_xdp_lab') },
    { id: 'view-postgres-flamegraph', title: 'PostgreSQL EXPLAIN FlameGraph Studio (Buffer Cache & Latency)', category: 'Labs & Tools', icon: Database, action: () => onNavigate('postgres_flamegraph_lab') },
    { id: 'view-wiso-abc-xyz', title: 'IHK ABC- & XYZ-Materialanalyse Studio (Logistik & Beschaffung)', category: 'Prüfung', icon: Calculator, action: () => onNavigate('wiso_abc_xyz') },
    { id: 'view-wireguard-ztna', title: 'WireGuard VPN & Zero-Trust Studio (NoiseIK & Cryptokey Routing)', category: 'Labs & Tools', icon: ShieldCheck, action: () => onNavigate('wireguard_ztna_lab') },
    { id: 'view-promql-alert', title: 'Prometheus PromQL & Alerting Studio (p95 & Rule YAMLs)', category: 'Labs & Tools', icon: Activity, action: () => onNavigate('promql_alert_lab') },
    { id: 'view-event-sourcing', title: 'Event-Sourcing & CQRS Read-Model Studio (Event Store & Replay)', category: 'Labs & Tools', icon: Database, action: () => onNavigate('event_sourcing_lab') },
    { id: 'view-wiso-loan', title: 'IHK Darlehensarten & Tilgungsplan Studio (Annuität vs. Rate)', category: 'Prüfung', icon: Calculator, action: () => onNavigate('wiso_loan_collateral') },
    { id: 'view-webrtc-sfu', title: 'WebRTC Media Server Studio (Mesh vs. MCU vs. SFU Simulcast)', category: 'Labs & Tools', icon: Terminal, action: () => onNavigate('webrtc_sfu_lab') },
    { id: 'view-bpftrace', title: 'Linux BPFtrace Dynamic Tracing Studio (Kprobes & Syscalls)', category: 'Labs & Tools', icon: Activity, action: () => onNavigate('bpftrace_lab') },
    { id: 'view-postgres-wal', title: 'PostgreSQL WAL & Streaming Replication Studio (LSN Offsets)', category: 'Labs & Tools', icon: Database, action: () => onNavigate('postgres_wal_lab') },
    { id: 'view-wiso-andler', title: 'IHK Optimale Bestellmenge Studio (Andler-Formel & Losgröße)', category: 'Prüfung', icon: Calculator, action: () => onNavigate('wiso_andler') },
    { id: 'view-opentelemetry', title: 'OpenTelemetry Distributed Tracing Studio (W3C traceparent)', category: 'Labs & Tools', icon: GitCommit, action: () => onNavigate('opentelemetry_tracing_lab') },
    { id: 'view-linux-bridge-vxlan', title: 'Linux Bridge & VXLAN Overlay Studio (br0 & UDP 4789)', category: 'Labs & Tools', icon: Network, action: () => onNavigate('linux_bridge_vxlan_lab') },
    { id: 'view-postgres-partitioning', title: 'PostgreSQL Partitioning & Pruning Studio (Range, List, Hash)', category: 'Labs & Tools', icon: Database, action: () => onNavigate('postgres_partitioning_lab') },
    { id: 'view-wiso-interest', title: 'IHK Zinsrechnung & Zinseszins Studio (30/360 & Aufzinsung)', category: 'Prüfung', icon: Calculator, action: () => onNavigate('wiso_interest') },
    { id: 'view-kafka-rebalance', title: 'Kafka Partition Rebalance Studio (Cooperative Sticky)', category: 'Labs & Tools', icon: Server, action: () => onNavigate('kafka_rebalance_lab') },
    { id: 'view-bgp-anycast', title: 'Linux BGP Routing & Anycast Studio (AS-Path & Anycast IP)', category: 'Labs & Tools', icon: Globe, action: () => onNavigate('bgp_anycast_lab') },
    { id: 'view-tls-handshake', title: 'TLS 1.3 Handshake Studio (1-RTT Full & 0-RTT Resumption)', category: 'Labs & Tools', icon: ShieldCheck, action: () => onNavigate('tls_handshake_lab') },
    { id: 'view-jwt-attack', title: 'JWT Sicherheitslücken Studio (alg:none, Secret-Bruteforce, kid-Injection)', category: 'Labs & Tools', icon: ShieldAlert, action: () => onNavigate('jwt_attack_lab') },
    { id: 'view-cors-pitfalls', title: 'CORS Fehlkonfigurationen Studio (Origin-Reflection & Regex-Bypass)', category: 'Labs & Tools', icon: Globe, action: () => onNavigate('cors_pitfalls_lab') },
    { id: 'view-algo-lab', title: 'Algorithmen Step-Visualisierer (Sortier- & Suchalgorithmen)', category: 'Labs & Tools', icon: Code2, action: () => onNavigate('algo_lab') },
    { id: 'view-python-wasm', title: 'Python 3 WASM Sandbox (im Browser)', category: 'Labs & Tools', icon: Terminal, action: () => onNavigate('python_wasm') },
    { id: 'view-packet-tracer', title: 'Network Packet Tracer & Route Visualizer', category: 'Labs & Tools', icon: Globe, action: () => onNavigate('packet_tracer') },
    { id: 'view-leitner', title: 'Leitner Karteikarten-System (Spaced Repetition)', category: 'Labs & Tools', icon: Brain, action: () => onNavigate('leitner') },
    { id: 'view-monaco-studio', title: 'Monaco Code Studio (VS Code im Browser)', category: 'Labs & Tools', icon: Code2, action: () => onNavigate('monaco_studio') },
    { id: 'view-cloud-designer', title: 'Cloud Infrastructure & Terraform IaC Designer', category: 'Labs & Tools', icon: Layers, action: () => onNavigate('cloud_designer') },
    { id: 'view-ctf-lab', title: 'Cybersecurity CTF Quest (XSS, SQLi & Command Injection)', category: 'Labs & Tools', icon: ShieldAlert, action: () => onNavigate('ctf_lab') },
    { id: 'view-cicd-pipeline', title: 'CI/CD Pipeline & GitHub Actions Builder', category: 'Labs & Tools', icon: GitMerge, action: () => onNavigate('cicd_pipeline') },
    { id: 'view-system-design', title: 'System Design & Load Balancer Simulator', category: 'Labs & Tools', icon: Layers, action: () => onNavigate('system_design') },
    { id: 'view-websocket-protocol', title: 'WebSockets & Real-Time Protokoll Lab', category: 'Labs & Tools', icon: Globe, action: () => onNavigate('websocket_protocol') },
    { id: 'view-bigo-benchmark', title: 'Big-O Time & Space Complexity Benchmark Arena', category: 'Labs & Tools', icon: Calculator, action: () => onNavigate('bigo_benchmark') },
    { id: 'view-wasm-rust', title: 'WebAssembly & Rust Compiler Lab', category: 'Labs & Tools', icon: Cpu, action: () => onNavigate('wasm_rust_studio') },
    { id: 'view-oauth-oidc', title: 'OAuth2 & OpenID Connect Studio (PKCE & JWT)', category: 'Labs & Tools', icon: ShieldCheck, action: () => onNavigate('oauth_oidc') },
    { id: 'view-websockets', title: 'WebSockets Grundlagen (HTTP-101-Handshake)', category: 'Labs & Tools', icon: Globe, action: () => onNavigate('websockets') },
    { id: 'view-perf-lab', title: 'Performance Profiling Lab (V8 GC & Memory Leaks)', category: 'Labs & Tools', icon: Cpu, action: () => onNavigate('perf_lab') },
    { id: 'view-kafka', title: 'Apache Kafka Event-Architektur (Producers & Consumer Groups)', category: 'Labs & Tools', icon: Database, action: () => onNavigate('kafka') },
    { id: 'view-security-v2', title: 'Red vs Blue Team Cybersecurity Simulator', category: 'Labs & Tools', icon: ShieldAlert, action: () => onNavigate('security_lab_v2') },
    { id: 'view-api-studio', title: 'REST vs GraphQL API Studio', category: 'Labs & Tools', icon: Database, action: () => onNavigate('api_studio') },
    { id: 'view-design-patterns', title: 'Design Patterns Lab (Singleton, Observer, Factory, Strategy)', category: 'Labs & Tools', icon: Layers, action: () => onNavigate('design_patterns') },
    { id: 'view-roadmaps', title: 'Karriere-Lernpfade (Fullstack, Security, AI)', category: 'Prüfung', icon: Trophy, action: () => onNavigate('roadmaps') },
    { id: 'view-big-o', title: 'Big-O Komplexitäts-Visualizer', category: 'Labs & Tools', icon: Calculator, action: () => onNavigate('big_o') },
    { id: 'view-tooling', title: 'Entwickler-Setup-Guide (VS Code, Git, Docker)', category: 'Grundlagen', icon: Terminal, action: () => onNavigate('tooling') },
    { id: 'view-app-workshop', title: 'App-Workshop: Eigenen Task-Manager bauen', category: 'Grundlagen', icon: Sparkles, action: () => onNavigate('app_workshop') },
    { id: 'view-postgres-fulltext', title: 'PostgreSQL Full-Text Search Studio (tsvector & tsquery)', category: 'Labs & Tools', icon: Database, action: () => onNavigate('postgres_fulltext_lab') },
    { id: 'view-wiso-capital-value', title: 'IHK Kapitalwertmethode Studio (NPV & Barwert-Diskontierung)', category: 'Prüfung', icon: Calculator, action: () => onNavigate('wiso_capital_value') },
    { id: 'view-grpc-protobuf', title: 'gRPC Protocol Buffers Studio (Proto3 & Wire Varints)', category: 'Labs & Tools', icon: Code, action: () => onNavigate('grpc_protobuf_lab') },
    { id: 'view-os-scheduler', title: 'OS Process Scheduler & Deadlock Studio (Gantt & Bankier)', category: 'Labs & Tools', icon: Cpu, action: () => onNavigate('os_scheduler') },
    { id: 'view-packet-sniffer', title: 'Web-Wireshark Packet Sniffer & Hex Analyzer', category: 'Labs & Tools', icon: Terminal, action: () => onNavigate('packet_sniffer') },
    { id: 'view-erd-designer', title: 'Relational ERD Designer & 3NF Normalform-Linter', category: 'Labs & Tools', icon: Database, action: () => onNavigate('erd_designer') },
    { id: 'view-transformer-attention', title: 'Transformer Self-Attention & LLM Sampling Studio', category: 'Labs & Tools', icon: Brain, action: () => onNavigate('transformer_attention') },
    { id: 'view-cloud-canvas', title: 'Cloud Architecture SLA & SPOF Canvas', category: 'Labs & Tools', icon: Globe, action: () => onNavigate('cloud_canvas') },
    { id: 'view-ihk-grade-calc', title: 'IHK Notenrechner & Mündliche Ergänzungsprüfung (AO 2020)', category: 'Prüfung', icon: Award, action: () => onNavigate('ihk_grade_calculator') },
    { id: 'view-rack-configurator', title: '19"-Server-Rack Konfigurator & USV/Klimarechner', category: 'Hardware', icon: Cpu, action: () => onNavigate('rack_configurator') },
    { id: 'view-itsm-simulator', title: 'ITIL 4 ITSM & Service Desk Management Studio', category: 'Prüfung', icon: Award, action: () => onNavigate('itsm_simulator') },
    { id: 'view-sm2-repetition', title: 'SuperMemo SM-2 Spaced Repetition Mastery & Ebbinghaus', category: 'Lernen', icon: Brain, action: () => onNavigate('sm2_spaced_repetition') },
    { id: 'view-personal-notebook', title: 'Developer Notizen- & Wissens-Archiv (Markdown Vault)', category: 'Tools', icon: FileText, action: () => onNavigate('personal_notebook') },
    { id: 'view-wasm-compiler', title: 'WebAssembly Compiler Playground & Hex-Inspector', category: 'Labs & Tools', icon: Terminal, action: () => onNavigate('wasm_compiler') },
    { id: 'view-zkp-crypto', title: 'ZKP & Kryptographie Visualizer (Elliptische Kurven)', category: 'Labs & Tools', icon: ShieldCheck, action: () => onNavigate('zkp_crypto') },
    { id: 'view-oauth-pkce', title: 'OAuth 2.0 PKCE & OIDC Flow Studio (S256 & JWT Claims)', category: 'Labs & Tools', icon: Lock, action: () => onNavigate('oauth_pkce_studio') },
    { id: 'view-k8s-cluster', title: 'Kubernetes Cluster & Topology Visualizer (Pods & Ingress)', category: 'Labs & Tools', icon: Cpu, action: () => onNavigate('k8s_cluster_studio') },
    { id: 'view-webrtc-peer', title: 'WebRTC P2P DataChannel & Signaling Studio (SDP & STUN)', category: 'Labs & Tools', icon: Radio, action: () => onNavigate('webrtc_peer_studio') },
    { id: 'view-scrum-simulator', title: 'Scrum Sprint & Kanban Simulator', category: 'Prüfung', icon: Award, action: () => onNavigate('scrum_simulator') },
    { id: 'view-graphql-explorer', title: 'GraphQL Schema & Query Explorer', category: 'Labs & Tools', icon: Layers, action: () => onNavigate('graphql_explorer') },
    { id: 'view-ble-sensor', title: 'BLE & GATT Sensor Simulator', category: 'Hardware', icon: Cpu, action: () => onNavigate('ble_sensor') },
    { id: 'view-regex-railroad', title: 'RegEx Railroad & Diagramm Studio', category: 'Labs & Tools', icon: Code2, action: () => onNavigate('regex_railroad') },
    { id: 'view-webhook-inspector', title: 'REST API Webhook Inspector & Mock Server', category: 'Labs & Tools', icon: Terminal, action: () => onNavigate('webhook_inspector') },
    { id: 'view-voice-quiz', title: 'Podcast Voice Quiz Studio', category: 'Prüfung', icon: Award, action: () => onNavigate('voice_quiz') },
    { id: 'view-tco-roi', title: 'TCO & ROI Wirtschaftlichkeits-Simulator', category: 'Prüfung', icon: Calculator, action: () => onNavigate('tco_roi_lab') },
    { id: 'view-git-conflict', title: 'Git 3-Way Merge Conflict Resolver', category: 'Labs & Tools', icon: GitMerge, action: () => onNavigate('git_conflict_lab') },
    { id: 'view-custom-challenges', title: 'Custom Coding Challenge Creator', category: 'Labs & Tools', icon: Code2, action: () => onNavigate('custom_challenges') },
    { id: 'view-p2p-duell', title: 'IHK Quiz-Duell Arena (1v1 / P2P)', category: 'Prüfung', icon: Award, action: () => onNavigate('p2p_duell') },
    { id: 'view-sqlite-studio', title: 'SQLite & Relational DB Sandbox', category: 'Labs & Tools', icon: Database, action: () => onNavigate('sqlite_studio') },
    { id: 'view-coding-challenges', title: 'Live Coding Challenge Studio', category: 'Labs & Tools', icon: Code2, action: () => onNavigate('coding_challenges') },
    { id: 'view-wiso-kalkulation', title: 'WISO & Handelskalkulations-Studio', category: 'Labs & Tools', icon: Calculator, action: () => onNavigate('wiso_kalkulation') },
    { id: 'view-ieee754-lab', title: 'IEEE-754 Float & Zahlen-Studio', category: 'Labs & Tools', icon: Cpu, action: () => onNavigate('ieee754_lab') },
    { id: 'view-ipv6-routing', title: 'IPv6 & Routing-Table Simulator', category: 'Labs & Tools', icon: Globe, action: () => onNavigate('ipv6_routing_lab') },
    { id: 'view-owasp-exploit', title: 'OWASP Top 10 Live-Exploit Sandbox', category: 'Labs & Tools', icon: ShieldAlert, action: () => onNavigate('owasp_exploit_lab') },
    { id: 'view-neural-net', title: 'Neural Network & BPE Tokenizer Studio', category: 'Labs & Tools', icon: Brain, action: () => onNavigate('neural_net_lab') },
    { id: 'view-cheat-sheets', title: 'IHK Spickzettel & PDF-Generator', category: 'Prüfung', icon: FileText, action: () => onNavigate('cheat_sheets') },
    { id: 'view-topics', title: 'Alle Informatik-Themen', category: 'Themen & Content', icon: Layers, action: () => onNavigate('wissen') },
    { id: 'view-labs', title: 'Interaktive Labs & Simulatoren', category: 'Labs & Tools', icon: Terminal, action: () => onNavigate('labs') },
    { id: 'view-jwks-rotation', title: 'OAuth2 JWKS Key Rotation Lab', category: 'Labs & Tools', icon: ShieldCheck, action: () => onNavigate('jwks_rotation_lab') },
    { id: 'view-postgres-mvcc', title: 'PostgreSQL MVCC & VACUUM Lab', category: 'Labs & Tools', icon: Database, action: () => onNavigate('postgres_mvcc_lab') },
    { id: 'view-http3-quic', title: 'HTTP/3 & QUIC Protocol Inspector', category: 'Labs & Tools', icon: Layers, action: () => onNavigate('http3_quic_lab') },
    { id: 'view-redis-caching', title: 'Redis Caching & Invalidation Lab', category: 'Labs & Tools', icon: Database, action: () => onNavigate('redis_caching_lab') },
    { id: 'view-circuit-breaker', title: 'Circuit Breaker & Resilience Lab', category: 'Labs & Tools', icon: Layers, action: () => onNavigate('circuit_breaker_lab') },
    { id: 'view-k8s-cni', title: 'Kubernetes CNI & VXLAN Overlay Lab', category: 'Labs & Tools', icon: Terminal, action: () => onNavigate('k8s_cni_lab') },
    { id: 'view-graphql-resolver', title: 'GraphQL AST & DataLoader Lab', category: 'Labs & Tools', icon: Layers, action: () => onNavigate('graphql_resolver_lab') },
    { id: 'view-linux-permissions', title: 'Linux Permissions & Inode Rechner', category: 'Labs & Tools', icon: Terminal, action: () => onNavigate('linux_permissions_lab') },
    { id: 'view-crypto-keygen', title: 'RSA & Diffie-Hellman Crypto Lab', category: 'Labs & Tools', icon: ShieldCheck, action: () => onNavigate('crypto_keygen_lab') },
    { id: 'view-cicd-matrix', title: 'CI/CD Matrix Linter & Runner Lab', category: 'Labs & Tools', icon: Layers, action: () => onNavigate('cicd_matrix_lab') },
    { id: 'view-postgres-explain', title: 'PostgreSQL Query Tree & Cost Visualizer', category: 'Labs & Tools', icon: Database, action: () => onNavigate('postgres_explain_lab') },
    { id: 'view-webrtc-signaling', title: 'WebRTC P2P & SDP Signaling Lab', category: 'Labs & Tools', icon: Terminal, action: () => onNavigate('webrtc_signaling_lab') },
    { id: 'view-code-debugger', title: 'Code Execution & Memory Debugger Lab', category: 'Labs & Tools', icon: Cpu, action: () => onNavigate('code_debugger_lab') },
    { id: 'view-clean-code', title: 'Clean Code & Security Review Arena', category: 'Labs & Tools', icon: ShieldCheck, action: () => onNavigate('clean_code_lab') },
    { id: 'view-dns-http', title: 'DNS & HTTP/TLS Request Inspector', category: 'Labs & Tools', icon: Layers, action: () => onNavigate('dns_http_lab') },
    { id: 'view-sql-transaction', title: 'SQL Transaktionen & ACID Simulator', category: 'Labs & Tools', icon: Database, action: () => onNavigate('sql_transaction_lab') },
    { id: 'view-ihk-doku', title: 'IHK Projektantrags- & Doku-Generator', category: 'Prüfung', icon: FileText, action: () => onNavigate('ihk_doc_generator') },
    { id: 'view-games', title: 'Coding Games & SQL Dungeon', category: 'Spiele', icon: Trophy, action: () => onNavigate('games') },
    { id: 'view-exam', title: 'IHK Prüfungssimulator (AP1 & AP2)', category: 'Prüfung', icon: FileText, action: () => onNavigate('exam') },
    { id: 'view-oral-exam', title: 'IHK Mündliches Fachgespräch Simulation', category: 'Prüfung', icon: Award, action: () => onNavigate('oral-exam') },
    { id: 'view-campaign', title: 'Story-Kampagne: Der IT-Aufstieg', category: 'Quests', icon: Sparkles, action: () => onNavigate('campaign') },
    { id: 'view-cpu-arch', title: 'Von-Neumann CPU & Register-Simulator', category: 'Labs & Tools', icon: Cpu, action: () => onNavigate('cpu_architecture_lab') },
    { id: 'view-sql-optimizer', title: 'SQL Query Optimizer & EXPLAIN Lab', category: 'Labs & Tools', icon: Database, action: () => onNavigate('sql_optimizer_lab') },
    { id: 'view-git-graph', title: 'Git Branch & Rebase Graph Visualizer', category: 'Labs & Tools', icon: Code2, action: () => onNavigate('git_graph_lab') },
    { id: 'view-sql-join', title: 'SQL JOIN Visualizer Lab', category: 'Labs & Tools', icon: Terminal, action: () => onNavigate('sql_joins') },
    { id: 'modal-badges', title: 'Erfolge & Abzeichen ansehen', category: 'Profil & Gamification', icon: Trophy, action: () => onOpenModal('badges') },
    { id: 'modal-glossary', title: 'IT-Glossar & Fachbegriffe durchsuchen', category: 'Wissen', icon: BookOpen, action: () => onOpenModal('glossary') },
    { id: 'modal-flashcards', title: 'Karteikarten-Trainer öffnen', category: 'Lernen', icon: Layers, action: () => onOpenModal('flashcards') },
    { id: 'modal-role', title: 'Rolle / Fachrichtung wechseln (FIAE, FISI...)', category: 'Einstellungen', icon: Cpu, action: () => onOpenModal('role') }
  ];

  // Themen aus topicsData matchen
  const topicItems = TOPICS.map(t => ({
    id: `topic-${t.id}`,
    title: `${t.title} (${t.category})`,
    category: 'Lerneinheiten & Module',
    icon: BookOpen,
    description: t.description || '',
    action: () => onNavigate('topic-detail', t)
  }));

  // Glossarbegriffe matchen
  const glossaryMatches = GLOSSARY_TERMS.map(g => ({
    id: `glossary-${g.id}`,
    title: `${g.term}: ${(g.simpleExplanation || '').slice(0, 75)}...`,
    category: 'Glossar & Begriffe',
    icon: FileText,
    action: () => onOpenModal('glossary', g.term)
  }));

  const allItems = [...staticActions, ...topicItems, ...glossaryMatches];

  const filteredItems = search.trim() === '' 
    ? staticActions 
    : allItems.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(search.toLowerCase()))
      ).slice(0, 10);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: '12vh',
          zIndex: 9999,
          paddingLeft: '16px',
          paddingRight: '16px'
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '640px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Header Search Input */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border-color)', gap: '12px' }}>
            <Search size={20} color="var(--accent-primary)" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Suche Themen, Labs, IHK-Prüfungen, Glossar... (↑↓ navigieren, Enter wählen)"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '1.05rem',
                color: 'var(--text-main)',
                fontFamily: 'inherit'
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <kbd style={{ background: 'var(--bg-secondary)', padding: '3px 7px', borderRadius: '6px', fontSize: '0.75rem', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>ESC</kbd>
              <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Results List */}
          <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '8px' }}>
            {filteredItems.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ margin: 0, fontWeight: '600' }}>Keine passenden Ergebnisse für "{search}"</p>
                <span style={{ fontSize: '0.85rem' }}>Versuche es mit Begriffen wie 'SQL', 'Git', 'IHK', 'Docker' oder 'Netzwerk'</span>
              </div>
            ) : (
              filteredItems.map((item, index) => {
                const isSelected = index === selectedIndex;
                const IconComponent = item.icon || Terminal;
                return (
                  <div
                    key={item.id || index}
                    onClick={() => {
                      item.action();
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                      border: isSelected ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                      transition: 'all 0.1s ease',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                      <div style={{ 
                        width: '34px', 
                        height: '34px', 
                        borderRadius: '8px', 
                        background: isSelected ? 'var(--accent-primary)' : 'var(--bg-secondary)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: isSelected ? '#ffffff' : 'var(--accent-primary)',
                        flexShrink: 0
                      }}>
                        <IconComponent size={18} />
                      </div>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.95rem', fontWeight: isSelected ? '700' : '600', color: isSelected ? 'var(--accent-primary)' : 'var(--text-main)' }}>
                          {item.title}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.category}
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <ArrowRight size={16} color="var(--accent-primary)" style={{ flexShrink: 0 }} />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Shortcuts */}
          <div style={{ 
            padding: '10px 16px', 
            borderTop: '1px solid var(--border-color)', 
            background: 'var(--bg-secondary)',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span><kbd style={{ background: 'var(--bg-card)', padding: '2px 5px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>↑↓</kbd> Navigieren</span>
              <span><kbd style={{ background: 'var(--bg-card)', padding: '2px 5px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>↵</kbd> Auswählen</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Command size={12} />
              <span>Informatik Power Search</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
