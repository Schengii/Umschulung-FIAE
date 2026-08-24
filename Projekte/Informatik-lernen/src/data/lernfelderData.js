export const IHK_LERNFELDER = [
  {
    id: 'lf1',
    number: 'Lernfeld 1',
    year: '1. Lehrjahr',
    title: 'Das Unternehmen und die eigene Rolle im Betrieb beschreiben',
    summary: 'Überblick über die Wertschöpfungskette des Unternehmens, ökonomische & ökologische Ziele, Rechte & Pflichten in der Ausbildung, Arbeitsrecht, Unternehmensrechtsformen & Wirtschaftskreisläufe.',
    topics: [
      'Rechte & Pflichten nach BBiG (Berufsbildungsgesetz) & JArbSchG',
      'Arbeitsrecht: Kündigungsschutz, Arbeitsvertrag, Betriebsrat & Mitbestimmung',
      'Aufbauorganisation (Einlinien-, Mehrlinien-, Matrixsystem) & Ablauforganisation',
      'Unternehmensrechtsformen: Einzelunternehmen, GmbH, AG, Kommanditgesellschaft (KG), UG',
      'Wertschöpfungs- & Geschäftsprozesse: Primäre vs. Sekundäre Aktivitäten',
      'Produktionsfaktoren, Marktsituationen (Monopol, Oligopol, Polypol) & Wirtschaftskreislauf'
    ],
    examTip: 'Für AP Teil 1 häufig gefragt: Unterscheidung zwischen Handelsregister A (Einzelkaufmann, Personengesellschaften) und B (Kapitalgesellschaften wie GmbH/AG) sowie Pflichten des Auszubildenden nach BBiG.'
  },
  {
    id: 'lf2',
    number: 'Lernfeld 2',
    year: '1. Lehrjahr',
    title: 'Arbeitsplätze nach Kundenwunsch ausstatten',
    summary: 'Bedarfs- & Anforderungsanalysen durchführen, Hardware-Komponenten (CPU, RAM, Mainboard, Netzteile, Grafikkarten, SSDs) auswählen, Ergonomie, Nachhaltigkeit, Angebote kalkulieren & Pflichtenhefte erstellen.',
    topics: [
      'Hardware-Komponenten: CPU (Taktfrequenz, Cores, Cache), Mainboard (Sockel, Chipset), DDR4/DDR5 RAM, NVMe M.2 SSDs, Netzteile (80-Plus)',
      'Bedarfs- & Anforderungsanalyse beim Kunden durchführen',
      'Lastenheft (Was der Kunde will) vs. Pflichtenheft (Wie der Entwickler es umsetzt)',
      'Angebotsvergleich & Stundensatz-Kalkulation (Handlungskostenzuschlag, Gewinnzuschlag, Skonto, Rabatt)',
      'Ergonomie & Ökologie am IT-Arbeitsplatz (Bildschirmarbeitsverordnung, Energy Star, 80-Plus Netzteile)'
    ],
    examTip: 'Berechnung von Handelskalkulationen (Vorwärts- und Rückwärtskalkulation) sowie der rechtliche Unterschied zwischen Angebot und Kaufvertrag.'
  },
  {
    id: 'lf3',
    number: 'Lernfeld 3',
    year: '1. Lehrjahr',
    title: 'Clients in Netzwerke einbinden',
    summary: 'Netzwerkinfrastruktur, TCP/IP-Protokollfamilie, ISO/OSI-7-Schichtenmodell, Switch-/Router-Konfiguration, RAID-Level, Backup-Strategien & USV Stromversorgung.',
    topics: [
      'Netzwerktopologien: Stern, Ring, Bus, Mesh (Vorteile/Nachteile & Redundanz)',
      'ISO/OSI-Schichtenmodell (7 Schichten: Physical, Data Link, Network, Transport, Session, Presentation, Application)',
      'IP-Adressierung: IPv4 Subnetting (CIDR-Notation, Netz-ID, Broadcast-ID, Host-ID) & IPv6 (Global Unicast, Link-Local)',
      'Routing (Statisch vs. Dynamisch OSPF/BGP) & Switching (VLANs, Trunking 802.1Q)',
      'RAID-Level: RAID 0 (Striping), RAID 1 (Mirroring), RAID 5 (Parity), RAID 10 (Striped Mirror)',
      'Stromversorgung, USV-Konzepte (Offline, Line-Interactive, Online/Double-Conversion) & Backup-Strategien (Grandfather-Father-Son)'
    ],
    examTip: 'Subnetting ist Kernbestandteil jeder IHK-Prüfung! Übe die Berechnung von verfügbaren Hosts und Netzmasken.'
  },
  {
    id: 'lf4',
    number: 'Lernfeld 4',
    year: '1. Lehrjahr',
    title: 'Schutzbedarfsanalyse im eigenen Arbeitsbereich durchführen',
    summary: 'BSI IT-Grundschutz Standards, Schutzziele (Vertraulichkeit, Integrität, Verfügbarkeit, Authentizität), Risikobewertung, Schadensszenarien & Technisch-Organisatorische Maßnahmen (TOM).',
    topics: [
      'BSI IT-Grundschutz Standards (200-1, 200-2, 200-3)',
      'Schutzziele der Informationssicherheit (CIA-Triade: Confidentiality, Integrity, Availability)',
      'Gefährdungs- & Schadensszenarien (Höhere Gewalt, Menschliches Versagen, Technisches Versagen, Kriminelle Handlungen)',
      'Technisch-Organisatorische Maßnahmen (TOM nach DSGVO Art. 32): Zutrittskontrolle, Zugangskontrolle, Zugriffskontrolle, Trennungskontrolle',
      'Datenschutz & DSGVO Grundregeln (Zweckbindung, Datenminimierung, Speicherbegrenzung)'
    ],
    examTip: 'Kenne den Unterschied zwischen Datenschutz (Schutz von personenbezogenen Daten) und Datensicherheit (Schutz von Daten vor Verlust/Diebstahl).'
  },
  {
    id: 'lf5',
    number: 'Lernfeld 5',
    year: '1. Lehrjahr',
    title: 'Software zur Verwaltung von Daten anpassen',
    summary: 'Softwareentwicklungs-Modelle (Wasserfall, V-Modell, Scrum, Kanban), Zahlensysteme, ER-Modellierung (1:1, 1:n, m:n), SQL-Datenbanken & Testprozesse.',
    topics: [
      'Vorgehensmodelle: Klassisch (Wasserfall, V-Modell) vs. Agil (Scrum, Kanban)',
      'Zahlensysteme: Umrechnung zwischen Binär, Oktal, Dezimal und Hexadezimal & Zweierkomplement',
      'Relationaler Datenbankentwurf: Entity-Relationship-Modell (ERM) & Chen-Notation',
      'Normalisierung (1. NF, 2. NF, 3. NF) zur Vermeidung von Redundanzen & Anomalien',
      'SQL Abfragen (SELECT, INSERT, UPDATE, DELETE, JOINs, GROUP BY) & DDL (CREATE TABLE)',
      'Softwaredokumentation & Testverfahren (Unit-Tests, Integrationstests, Systemtests)'
    ],
    examTip: 'Normalisiere Tabellen bis zur 3. Normalform und beherrsche SQL JOINs (INNER JOIN, LEFT JOIN, RIGHT JOIN).'
  },
  {
    id: 'lf6',
    number: 'Lernfeld 6',
    year: '2. Lehrjahr',
    title: 'Serviceanfragen bearbeiten',
    summary: 'IT-Service-Management (ITIL v4), Ticket-Systeme, SLA (Service Level Agreements), First/Second/Third Level Support & System-Monitoring.',
    topics: [
      'ITIL v4 Service Management Grundlagen (Service Value System, Incident Management, Problem Management)',
      'Ticket-Systeme & Incident Handling Workflow',
      'SLA (Service Level Agreement), OLA (Operational Level Agreement) & UC (Underpinning Contract)',
      'Kundenkommunikation & Eskalationspfade (Verfahren bei Nichteinhaltung von SLAs)',
      'System-Monitoring (Nagios, Zabbix, Prometheus, Grafana) & Log-Analyse'
    ],
    examTip: 'Verstehe den Unterschied zwischen einem Incident (ungeplante Störung) und einem Problem (Ursache mehrerer Störungen).'
  },
  {
    id: 'lf7',
    number: 'Lernfeld 7',
    year: '2. Lehrjahr',
    title: 'Cyber-physische Systeme ergänzen',
    summary: 'Internet of Things (IoT), Sensoren & Aktoren, MQTT-Protokoll, CoAP, Edge Computing & Industrie 4.0 Netzwerke.',
    topics: [
      'Internet of Things (IoT) Architektur & Industrie 4.0 Integration',
      'IoT Protokolle: MQTT (Publish/Subscribe, Broker, Topics), CoAP, Modbus',
      'Sensoren (Temperatur, Druck, Licht) & Aktoren (Motoren, Relais, Ventile)',
      'Microcontroller (ESP32, Raspberry Pi, Arduino) & Sensor-Datenverarbeitung',
      'Betriebs- & Datensicherheit in vernetzten IoT-Systemen'
    ],
    examTip: 'MQTT Publish/Subscribe Prinzip mit Broker, Publisher und Subscriber erklären können.'
  },
  {
    id: 'lf8',
    number: 'Lernfeld 8',
    year: '2. Lehrjahr',
    title: 'Daten systemübergreifend bereitstellen',
    summary: 'Dezentrale Datenquellen zusammenführen, Objektorientierte Programmierung (OOP Java/C#), UML-Diagramme & NoSQL Datenbanken.',
    topics: [
      'Objektorientierte Programmierung (OOP): Kapselung, Vererbung, Polymorphie, Abstraktion',
      'UML-Diagramme: Klassendiagramm, Anwendungsfalldiagramm (Use Case), Sequenzdiagramm',
      'NoSQL Datenbanken (Document Stores MongoDB, Key-Value Redis, Graph DB Neo4j)',
      'REST APIs & Datenformate (JSON, XML, YAML) & Middleware Integration',
      'Software-Testing & Automatisierte Pipeline Integration'
    ],
    examTip: 'Zeichne und interpretiere UML-Klassendiagramme (Vererbung, Aggregation, Komposition).'
  },
  {
    id: 'lf9',
    number: 'Lernfeld 9',
    year: '2. Lehrjahr',
    title: 'Netzwerke und Dienste bereitstellen',
    summary: 'Server-Hardware vs. Client-Hardware, Virtualisierung (Proxmox, VMware ESXi, Hyper-V), Container & Netzwerkdienste.',
    topics: [
      'Server-Hardware & Redundanz (Redundantes Netzteil, ECC RAM, Hot-Swap Laufwerke)',
      'Virtualisierungskonzepte: Typ-1 Hypervisor (Bare-Metal: ESXi, Proxmox) vs. Typ-2 Hypervisor (Hosted: VirtualBox)',
      'Containerisierung (Docker, Podman) vs. Vollvirtuelle Maschinen (VMs)',
      'Netzwerkdienste: DNS, DHCP, Active Directory, Webserver (Nginx/Apache), Mailserver (PostfiX/Dovecot)',
      'High Availability (HA), Load Balancing & Failover Cluster'
    ],
    examTip: 'Vor- und Nachteile von Containerisierung gegenüber vollständiger Hardware-Virtualisierung nennen können.'
  },
  {
    id: 'lf10b',
    number: 'Lernfeld 10b (FISI)',
    year: '3. Lehrjahr',
    title: 'Serverdienste bereitstellen und Administrationsaufgaben automatisieren',
    summary: 'DNS, DHCP, Active Directory Domänendienste, Skripting (PowerShell, Bash) & Automatisierungstools (Ansible, Terraform).',
    topics: [
      'DNS & DHCP Serverkonfiguration (A-Records, CNAME, MX, Reverse Lookup, Scope, Reservations)',
      'Active Directory Domain Services (AD DS): FSMO Rollen, Gruppenrichtlinien (GPOs), Kerberos',
      'Skriptautomatisierung mit PowerShell (Windows) & Bash (Linux/Unix)',
      'Infrastructure as Code (IaC): Ansible Playbooks, Terraform Provider & Configuration Management',
      'Backup- & Disaster Recovery Konzepte (RTO: Recovery Time Objective, RPO: Recovery Point Objective)'
    ],
    examTip: 'Unterschied zwischen RTO (maximale Ausfallzeit) und RPO (maximaler Datenverlustzeitraum) erklären.'
  },
  {
    id: 'lf11b',
    number: 'Lernfeld 11b (FISI)',
    year: '3. Lehrjahr',
    title: 'Betrieb und Sicherheit vernetzter Systeme gewährleisten',
    summary: 'Firewall-Regelwerke, VPN (OpenVPN, WireGuard, IPsec), IDS/IPS Systeme, Zero Trust Architecture & Security Audits.',
    topics: [
      'Next-Generation Firewalls (NGFW): Stateful Packet Inspection (SPI) vs. Deep Packet Inspection (DPI)',
      'VPN-Technologien: IPsec (AH/ESP, IKEv2), WireGuard, OpenVPN (SSL/TLS)',
      'Intrusion Detection (IDS) & Intrusion Prevention Systems (IPS) (Snort, Suricata)',
      'Netzwerk-Security Audits, Portscanning (Nmap) & Penetration Testing',
      'Zero Trust Security Model: "Never Trust, Always Verify" & Mikrosegmentierung'
    ],
    examTip: 'Vergleich der VPN-Protokolle IPsec (Schicht 3) und OpenVPN/SSL (Schicht 7).'
  },
  {
    id: 'lf10a',
    number: 'Lernfeld 10a (FIAE)',
    year: '3. Lehrjahr',
    title: 'Benutzerschnittstellen gestalten und anpassen (UI/UX & Frontend)',
    summary: 'Mensch-Maschine-Interaktion (HMI), Usability-Normen (ISO 9241-110, DIN EN 301 549 Barrierefreiheit / WCAG AAA), Web-Technologien, Responsive Grid Systeme & State Management.',
    topics: [
      'ISO 9241-110 Grundsätze der Dialoggestaltung: Aufgabenangemessenheit, Selbstbeschreibungsfähigkeit, Erwartungskonformität, Fehlertoleranz',
      'Barrierefreiheit nach WCAG 2.1 (AAA) & BITV 2.0 (Kontrastverhältnisse, Screenreader-Kompatibilität, ARIA)',
      'Frontend-Architekturen: SPA (Single Page Applications), SSR (Server-Side Rendering), Hydration & Micro-Frontends',
      'Modernes CSS: CSS Grid, Flexbox, Custom Properties, Responsive Breakpoints & Container Queries',
      'State Management: Unidirektionaler Datenfluss, Immutability & Reaktivität'
    ],
    examTip: 'Die 7 Dialoggrundsätze der ISO 9241-110 und Kontrastanforderungen der WCAG sind feste IHK-Prüfungsfragen.'
  },
  {
    id: 'lf11a',
    number: 'Lernfeld 11a (FIAE)',
    year: '3. Lehrjahr',
    title: 'Ganzheitliche Softwarearchitekturen & Sicherheitskonzepte entwickeln',
    summary: 'Design Patterns (GoF: Singleton, Factory, Strategy, Observer), Clean Architecture, Domain-Driven Design (DDD), OWASP Top 10 Defense, TDD & CI/CD Pipelines.',
    topics: [
      'Entwurfsmuster (Design Patterns): Creational (Factory, Singleton), Structural (Adapter, Decorator), Behavioral (Observer, Strategy)',
      'Architekturmuster: Clean Architecture (Onion Architecture), Ports & Adapters (Hexagonal Architecture), Event-Driven Architecture',
      'Domain-Driven Design (DDD): Entities, Value Objects, Aggregates, Repositories, Bounded Contexts',
      'Sichere Softwareentwicklung: OWASP Top 10 (XSS, SQLi, CSRF, Insecure Deserialization), Secure Coding Guidelines',
      'Test-Driven Development (TDD): Red-Green-Refactor Zyklus, Unit-, Integrations- & End-to-End Tests (Cypress/Playwright)'
    ],
    examTip: 'Observer Pattern, Strategy Pattern und Clean Code Prinzipien (SOLID) kommen regelmäßig in AP2 Programmieraufgaben vor.'
  },
  {
    id: 'lf12a',
    number: 'Lernfeld 12a (FIAE)',
    year: '3. Lehrjahr',
    title: 'Kundenspezifische Anwendungsentwicklung & IHK-Abschlussprojekt',
    summary: 'Vollständige Durchführung des 80-Stunden-Entwicklerprojekts (FIAE): Lasten-/Pflichtenheft, Datenmodellierung (ERD/UML), Implementierung, Testprotokoll, Code-Review & Wirtschaftlichkeitsanalyse.',
    topics: [
      'IHK Projektantrag (FIAE - 80 Stunden): Problemstellung, Zielformulierung, Meilenstein- & Ressourcenplanung',
      'Wirtschaftlichkeitsanalyse: Amortisationsrechnung (statisch/dynamisch), Deckungsbeitrag, Nutzwertanalyse, TCO (Total Cost of Ownership)',
      'Entwicklungsdokumentation: UML-Klassendiagramme, Sequenzdiagramme, Datenbank-ERD, API-Dokumentation (OpenAPI/Swagger)',
      'Testdokumentation: Testfälle mit Eingabe-, Soll- & Ist-Werten, Code-Coverage Metriken',
      'IHK Fachgespräch & Projektpräsentation: Storytelling, Live-Demo Vorbereitung & Verteidigung technischer Architekturentscheidungen'
    ],
    examTip: 'Wirtschaftlichkeitsberechnung (z. B. "Wann amortisiert sich die neue Software durch Zeiteinsparung?") und Nutzwertanalyse genauestens begründen.'
  },
  {
    id: 'lf12b',
    number: 'Lernfeld 12b (FISI)',
    year: '3. Lehrjahr',
    title: 'Kundenspezifische Systemintegration durchführen',
    summary: 'Vollständiges IHK-Abschlussprojekt durchführen, Projektantrag, Projektdokumentation, Amortisationsrechnung & Kundenschulung.',
    topics: [
      'IHK Projektantrag Erstellung: Zielkonzept, Zeitplanung (35 Std. FISI / 80 Std. FIAE)',
      'Projektdokumentation Structure: Ist-Analyse, Soll-Konzept, Wirtschaftlichkeitsanalyse (Amortisation, Nutzwertanalyse)',
      'Kundenschulung, Übergabeprotokoll & Abnahme durch den Kunden',
      'Präsentation & Fachgespräch Vorbereitung (15 Min Präsentation + 15 Min Fragen des Prüfungsausschusses)'
    ],
    examTip: 'Nutzwertanalyse und Amortisationsrechnung sauber in der Projektdokumentation ausweisen.'
  }
];
