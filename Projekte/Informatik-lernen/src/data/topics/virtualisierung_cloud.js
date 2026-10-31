/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Hypervisor Typ 1 und Typ 2 unterscheiden und Beispiele nennen',
    'Virtuelle Maschinen und Container nach Isolation, Ressourcenbedarf und Startzeit vergleichen',
    'Die Docker-Grundbegriffe Image, Container, Volume und Registry erklären',
    'IaaS, PaaS und SaaS sowie die Bereitstellungsmodelle einordnen und das Shared-Responsibility-Modell anwenden'
  ],
  content: `
## Was ist Virtualisierung?

Virtualisierung trennt die **logische** Sicht auf Ressourcen von der **physischen** Hardware. Auf einem Server laufen dann mehrere voneinander isolierte **virtuelle Maschinen** (VMs), jede mit eigenem Betriebssystem. Die Software, die das verwaltet, heißt **Hypervisor** (auch *Virtual Machine Monitor*).

Vorteile:

- **Konsolidierung**: Statt zehn schwach ausgelasteter Server genügen zwei gut ausgelastete → weniger Strom, Kühlung und Platz (Green IT).
- **Flexibilität**: VMs lassen sich per Vorlage in Minuten erstellen, klonen und verschieben – sogar im laufenden Betrieb (*Live-Migration*, z. B. vMotion).
- **Snapshots**: Zustand vor einem Update einfrieren und bei Problemen zurückspringen.
- **Isolation**: Ein Absturz in einer VM betrifft die anderen nicht.
- **Hochverfügbarkeit**: Fällt ein Host aus, starten die VMs auf einem anderen Host im Cluster neu.

Nachteile: Der Hypervisor ist ein **Single Point of Failure** (ohne Cluster), es fallen Lizenzkosten an, und Overhead sowie Planung von CPU, RAM und Speicher werden anspruchsvoller.

> [!warning] Snapshot ist kein Backup
> Ein Snapshot speichert nur die Änderungen seit seinem Erstellen, auf demselben Speicher wie die VM. Geht der Speicher kaputt, ist auch der Snapshot weg. Außerdem bremsen lange aufbewahrte Snapshots die VM.

## Hypervisor-Typen

![Typ-1- und Typ-2-Hypervisor im Vergleich zu Containern](hypervisor-container.svg "Schichten der drei Ansätze von der Hardware bis zur Anwendung")

| | Typ 1 (Bare Metal, nativ) | Typ 2 (Hosted) |
| :--- | :--- | :--- |
| läuft auf | direkt auf der Hardware | auf einem Host-Betriebssystem |
| Leistung | hoch, wenig Overhead | geringer, das Host-OS kostet Ressourcen |
| Einsatz | Rechenzentrum, Serverbetrieb | Entwickler- und Testrechner, Schulung |
| Beispiele | VMware ESXi, Microsoft Hyper-V, KVM, Proxmox VE, Xen | Oracle VirtualBox, VMware Workstation, Parallels |

Moderne Prozessoren unterstützen Virtualisierung in Hardware (**Intel VT-x**, **AMD-V**). Sie muss oft erst im BIOS/UEFI aktiviert werden.

### Weitere Formen der Virtualisierung

- **Speichervirtualisierung**: mehrere physische Speicher erscheinen als ein Pool (SAN, vSAN).
- **Netzwerkvirtualisierung**: VLANs, virtuelle Switches, Software-Defined Networking (SDN).
- **Desktopvirtualisierung (VDI)**: Arbeitsplätze laufen als VMs im Rechenzentrum, der Nutzer greift mit einem Thin Client darauf zu.
- **Anwendungsvirtualisierung**: eine Anwendung läuft gekapselt, ohne installiert zu sein.

## Container

Container virtualisieren nicht die Hardware, sondern das **Betriebssystem**: Alle Container teilen sich den **Kernel des Hosts**. Isoliert werden sie über Kernel-Funktionen (unter Linux **Namespaces** für die Sicht auf Prozesse, Netz und Dateisystem sowie **cgroups** für Ressourcenlimits).

| Merkmal | Virtuelle Maschine | Container |
| :--- | :--- | :--- |
| enthält | komplettes Gast-Betriebssystem | nur Anwendung und Bibliotheken |
| Größe | Gigabytes | oft nur Megabytes |
| Startzeit | Minuten | Sekunden oder weniger |
| Isolation | stark (eigener Kernel) | schwächer (gemeinsamer Kernel) |
| Betriebssystem | beliebig (Windows-VM auf Linux-Host möglich) | muss zum Host-Kernel passen |

### Docker-Grundbegriffe

- **Image**: unveränderliche Vorlage aus mehreren Schichten (Layern), beschrieben durch ein **Dockerfile**.
- **Container**: eine laufende Instanz eines Images. Änderungen darin gehen beim Löschen verloren.
- **Volume**: dauerhafter Speicher außerhalb des Containers, z. B. für Datenbankdateien.
- **Registry**: Ablage für Images, z. B. Docker Hub oder eine firmeninterne Registry.
- **Docker Compose**: startet mehrere zusammengehörige Container (z. B. Web-App + Datenbank) aus einer YAML-Datei.
- **Kubernetes**: orchestriert Container auf vielen Hosts – verteilt, skaliert und startet sie bei Ausfällen neu.

\`\`\`dockerfile
# Basis-Image
FROM node:22-alpine
WORKDIR /app
# Abhängigkeiten zuerst kopieren: eigener Layer, der im Cache bleibt,
# solange sich package.json nicht ändert
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 3000
# nicht als root laufen
USER node
CMD ["node", "server.js"]
\`\`\`

## Cloud-Computing

Das US-amerikanische NIST definiert Cloud-Computing über fünf Merkmale: **Selbstbedienung nach Bedarf**, **Zugriff über das Netz**, **Ressourcen-Pooling**, **schnelle Elastizität** (hoch- und runterskalieren) und **gemessene Nutzung** (Abrechnung nach Verbrauch).

### Servicemodelle

| Modell | Kunde verwaltet | Anbieter verwaltet | Beispiele |
| :--- | :--- | :--- | :--- |
| **IaaS** (Infrastructure) | Betriebssystem, Middleware, Anwendung, Daten | Hardware, Netz, Virtualisierung | AWS EC2, Azure VMs, Hetzner Cloud |
| **PaaS** (Platform) | Anwendung und Daten | zusätzlich Betriebssystem, Laufzeit, Datenbank-Engine | Heroku, Google App Engine, Azure App Service |
| **SaaS** (Software) | nur Nutzung, Konfiguration, Daten | alles | Microsoft 365, Salesforce, Gmail |

Eselsbrücke **Pizza as a Service**: Selbst backen (On-Premises), Tiefkühlpizza (IaaS), Lieferdienst (PaaS), im Restaurant essen (SaaS).

### Bereitstellungsmodelle

- **Public Cloud**: Ressourcen eines Anbieters, von vielen Kunden geteilt.
- **Private Cloud**: exklusiv für eine Organisation, im eigenen oder einem gemieteten Rechenzentrum.
- **Hybrid Cloud**: Kombination, z. B. sensible Daten privat, Lastspitzen in der Public Cloud.
- **Community Cloud**: von mehreren Organisationen mit gleichen Anforderungen gemeinsam genutzt (z. B. Behörden).
- **Multi-Cloud**: Dienste mehrerer Anbieter parallel, um Abhängigkeit (*Vendor Lock-in*) zu vermeiden.

### Shared Responsibility

In der Cloud teilen sich Anbieter und Kunde die Verantwortung für Sicherheit. Der Anbieter schützt die Cloud selbst (Rechenzentrum, Hardware, Hypervisor). Der Kunde ist immer verantwortlich für **seine Daten, Benutzerkonten und Zugriffsrechte** – bei IaaS zusätzlich für das Patchen des Betriebssystems und die Firewall-Regeln.

> [!exam] Prüfungstipp: Cloud und DSGVO
> Verarbeitet ein Cloud-Anbieter personenbezogene Daten im Auftrag, braucht es einen **Auftragsverarbeitungsvertrag (AVV)** nach Art. 28 DSGVO. Bei Anbietern außerhalb der EU ist zusätzlich die Rechtsgrundlage für die **Drittlandübermittlung** zu prüfen (z. B. Angemessenheitsbeschluss oder Standardvertragsklauseln).

### Vor- und Nachteile der Cloud

| Vorteile | Nachteile |
| :--- | :--- |
| keine Anfangsinvestition (OPEX statt CAPEX) | laufende Kosten, schwer kalkulierbar bei Wachstum |
| schnell skalierbar | Abhängigkeit vom Anbieter und von der Internetverbindung |
| hohe Verfügbarkeit durch redundante Rechenzentren | Datenschutz und Datenstandort klären |
| Wartung und Updates durch den Anbieter | weniger Kontrolle, Anbieterwechsel aufwendig |
`,
  codeSnippet: `# Docker-Grundbefehle
docker build -t meine-app:1.0 .        # Image aus dem Dockerfile bauen
docker run -d -p 8080:3000 --name app meine-app:1.0
docker ps                               # laufende Container
docker logs -f app                      # Logs verfolgen
docker exec -it app sh                  # Shell im Container
docker volume create db-daten
docker run -d -v db-daten:/var/lib/postgresql/data postgres:17
docker compose up -d                    # mehrere Dienste aus compose.yaml`,
  codeLanguage: 'Bash',
  exercises: [
    {
      id: 'servicemodell-zuordnen',
      title: 'Servicemodelle zuordnen',
      prompt: 'Ordne IaaS, PaaS oder SaaS zu und begründe kurz:\n\n1. Das Unternehmen mietet virtuelle Server und installiert dort selbst Ubuntu und eine Warenwirtschaft.\n2. Die Mitarbeiter nutzen ein webbasiertes CRM per Browser.\n3. Die Entwickler laden ihren Code hoch, die Plattform kümmert sich um Laufzeit, Skalierung und Datenbank.',
      solution: '1. **IaaS** – der Kunde verwaltet Betriebssystem und Anwendung selbst.\n2. **SaaS** – fertige Anwendung, nur Nutzung und Konfiguration.\n3. **PaaS** – der Kunde bringt nur Code und Daten mit.'
    },
    {
      id: 'konsolidierung',
      title: 'Serverkonsolidierung berechnen',
      prompt: 'Ein Betrieb hat 8 physische Server mit je 350 W Leistungsaufnahme, im Schnitt zu 15 % ausgelastet. Sie sollen auf 2 Virtualisierungshosts mit je 600 W zusammengelegt werden. Wie viel Energie (kWh) und Geld spart der Betrieb pro Jahr bei 24/7-Betrieb und 0,30 €/kWh? Kühlung bleibt unberücksichtigt.',
      hints: ['Ein Jahr hat 8.760 Stunden.'],
      solution: 'Vorher: 8 × 350 W = 2.800 W. Nachher: 2 × 600 W = 1.200 W. Ersparnis: **1.600 W**.\n1,6 kW × 8.760 h = **14.016 kWh** pro Jahr.\n14.016 kWh × 0,30 € = **4.204,80 €** pro Jahr (ohne die zusätzlich sinkenden Kühlkosten).'
    },
    {
      id: 'vm-oder-container',
      title: 'VM oder Container?',
      prompt: 'Empfiehl jeweils VM oder Container mit Begründung:\n\n1. Eine alte Windows-Anwendung muss auf einem Linux-Host weiterlaufen.\n2. Ein Webshop soll bei Lastspitzen in Sekunden auf 20 Instanzen skalieren.\n3. Ein Kunde verlangt strikte Trennung seiner Umgebung von anderen Kunden auf demselben Host.',
      solution: '1. **VM** – Container teilen den Host-Kernel, ein Windows-Programm braucht einen Windows-Kernel.\n2. **Container** (z. B. mit Kubernetes) – starten in Sekunden und brauchen wenig Ressourcen.\n3. **VM** – eigener Kernel, stärkere Isolation. (Alternativ Container in getrennten VMs.)'
    }
  ],
  quiz: [
    {
      question: 'Welcher Hypervisor ist ein Typ-1-Hypervisor?',
      options: ['Oracle VirtualBox', 'VMware Workstation', 'VMware ESXi', 'Parallels Desktop'],
      correct: 2,
      explanation: 'ESXi läuft direkt auf der Hardware. Die anderen drei laufen auf einem Host-Betriebssystem (Typ 2).'
    },
    {
      question: 'Was teilen sich alle Container auf einem Host?',
      options: ['Das Dateisystem', 'Den Kernel des Host-Betriebssystems', 'Die IP-Adresse', 'Den Arbeitsspeicher ohne Grenzen'],
      correct: 1,
      explanation: 'Container nutzen den gemeinsamen Host-Kernel. Dateisystem, Netz und Prozesse sind über Namespaces getrennt.'
    },
    {
      question: 'Bei welchem Servicemodell ist der Kunde für das Patchen des Betriebssystems verantwortlich?',
      options: ['SaaS', 'PaaS', 'IaaS', 'Bei keinem'],
      correct: 2,
      explanation: 'Bei IaaS stellt der Anbieter nur die virtualisierte Infrastruktur bereit. Ab dem Betriebssystem ist der Kunde zuständig.'
    },
    {
      question: 'Was ist ein Docker-Image?',
      options: [
        'Ein laufender Prozess',
        'Eine unveränderliche Vorlage, aus der Container gestartet werden',
        'Ein Backup einer VM',
        'Ein virtueller Netzwerkadapter'
      ],
      correct: 1,
      explanation: 'Images sind schreibgeschützte, geschichtete Vorlagen. Ein Container ist eine laufende Instanz davon.'
    },
    {
      question: 'Welche Eigenschaft gehört laut NIST zum Cloud-Computing?',
      options: ['Feste Jahreslizenz', 'Schnelle Elastizität', 'Betrieb nur im eigenen Keller', 'Manuelle Bereitstellung durch den Anbieter'],
      correct: 1,
      explanation: 'Rapid Elasticity – Ressourcen lassen sich schnell hinzufügen und wieder freigeben.'
    },
    {
      question: 'Was wird für die Auftragsverarbeitung personenbezogener Daten durch einen Cloud-Anbieter benötigt?',
      options: ['Ein SLA', 'Ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO', 'Ein Lastenheft', 'Eine ISO-9001-Zertifizierung'],
      correct: 1,
      explanation: 'Art. 28 DSGVO verlangt einen Vertrag, der den Auftragsverarbeiter u. a. an Weisungen und technische und organisatorische Maßnahmen bindet.'
    }
  ],
  relatedLabs: [
    { id: 'docker_compose', label: 'Docker Compose' },
    { id: 'kubernetes', label: 'Kubernetes' },
    { id: 'cloud_designer', label: 'Cloud-Architektur entwerfen' },
    { id: 'linux_container_lab', label: 'Linux-Container von innen' }
  ],
  sources: [
    { title: 'NIST SP 800-145: The NIST Definition of Cloud Computing', url: 'https://csrc.nist.gov/pubs/sp/800/145/final' },
    { title: 'BSI: Cloud Computing Grundlagen', url: 'https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Informationen-und-Empfehlungen/Empfehlungen-nach-Angriffszielen/Cloud-Computing/Grundlagen/grundlagen_node.html' },
    { title: 'Docker Docs: What is a container?', url: 'https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/' },
    { title: 'DSGVO Art. 28 – Auftragsverarbeiter', url: 'https://dsgvo-gesetz.de/art-28-dsgvo/' },
    { title: 'Linux man-pages: namespaces(7)', url: 'https://man7.org/linux/man-pages/man7/namespaces.7.html' },
    { title: 'Eigene Lernkarten zur FIAE-Umschulung: Virtualisierung, Cloud-Servicemodelle', note: 'nicht öffentlich' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
