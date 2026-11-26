/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'DevOps als Kultur und Vorgehen erklären und die vier DORA-Kennzahlen berechnen',
    'Continuous Integration, Continuous Delivery und Continuous Deployment unterscheiden und eine Pipeline planen',
    'Container von virtuellen Maschinen abgrenzen und Image, Container, Registry und Dockerfile einordnen',
    'Die Grundbausteine von Kubernetes (Pod, Deployment, Service) und gängige Deployment-Strategien beschreiben',
    'Infrastructure as Code, Secrets-Handling und Monitoring als Teil eines sicheren Betriebs begründen'
  ],
  content: `
## Warum DevOps?

Klassisch arbeiten **Entwicklung** (Dev) und **Betrieb** (Ops) getrennt: Entwickler wollen schnell neue Funktionen liefern, der Betrieb will Stabilität. Das führt zu seltenen, großen Releases, langen Übergaben und Streit bei Störungen. **DevOps** verbindet beide Seiten durch gemeinsame Verantwortung, Automatisierung und kurze Rückkopplung. Ein bekanntes Modell dafür ist **CALMS**: *Culture* (Zusammenarbeit), *Automation*, *Lean* (Verschwendung vermeiden, kleine Schritte), *Measurement* (messen) und *Sharing* (Wissen teilen).

Der Kern lautet: **kleine Änderungen, häufig, automatisiert getestet und ausgeliefert**. Ein kleiner Change hat ein kleines Risiko und lässt sich leicht zurücknehmen. Das widerspricht nicht dem Change Management aus dem ITSM-Artikel, sondern ergänzt es: Standard-Changes werden hier vollständig automatisiert.

## DORA-Kennzahlen: Wie gut liefern wir?

Die Forschungsgruppe DORA hat vier Kennzahlen („Four Keys“) für die Leistungsfähigkeit von Softwareteams etabliert. Die letzte heißt in neueren DORA-Berichten *Failed Deployment Recovery Time* (Wiederherstellungszeit nach fehlgeschlagenem Deployment), und seit dem Bericht 2024 kommt als fünfte Größe die **Rework-Rate** (Anteil ungeplanter Deployments) hinzu:

| Kennzahl | Frage | Beispiel |
| :--- | :--- | :--- |
| **Deployment-Frequenz** | Wie oft gehen wir in Produktion? | 12 Deployments pro Woche |
| **Durchlaufzeit für Änderungen** (Lead Time for Changes) | Wie lange vom Commit bis zur Produktion? | im Mittel 2 Tage |
| **Änderungsfehlerrate** (Change Failure Rate) | Welcher Anteil der Deployments verursacht eine Störung? | 3 von 60 = 5 % |
| **Wiederherstellungszeit** (Time to Restore) | Wie schnell sind wir nach einer Störung wieder gesund? | im Mittel 45 Minuten |

Die ersten beiden messen die **Geschwindigkeit**, die letzten beiden die **Stabilität** (neuere Berichte ordnen die Wiederherstellungszeit teils der Geschwindigkeit zu, die Einteilung dient hier nur der Orientierung). Gute Teams sind bei beiden stark. Wer nur die Geschwindigkeit erhöht und die Fehlerrate ignoriert, verbessert nichts.

## Continuous Integration, Delivery und Deployment

- **Continuous Integration (CI):** Alle Entwickler führen ihre Änderungen **mehrmals täglich** in einem gemeinsamen Repository zusammen. Bei jedem Push baut ein Server das Projekt und führt die automatischen Tests aus. Ein roter Build wird sofort repariert.
- **Continuous Delivery (CD):** Jede Version, die die Pipeline besteht, ist **jederzeit auslieferbar**. Das Ausrollen in die Produktion löst aber ein Mensch per Freigabe aus.
- **Continuous Deployment:** Wie Delivery, aber **ohne manuelle Freigabe**. Jede erfolgreiche Änderung geht automatisch live. Das setzt sehr gute Tests und Monitoring voraus.

![CI/CD-Pipeline im Überblick](ci-cd-pipeline.svg "Von Commit über Build, Tests, Image und Staging bis zur Produktion, mit Rückmeldung durch das Monitoring")

### Typische Stufen einer Pipeline

1. **Quellcode** liegt im Git-Repository (siehe Artikel zu Git-Workflows), meist mit Pull-Requests und Code-Review.
2. **Build:** Abhängigkeiten laden, kompilieren oder bündeln. Das Ergebnis heißt **Artefakt** (z. B. JAR, Paket, Container-Image) und wird **nur einmal gebaut**. Dasselbe Artefakt läuft durch alle Umgebungen, damit nicht im Test etwas anderes geprüft wird als in der Produktion.
3. **Tests:** schnell zuerst (Unit-Tests, Linter), danach langsame (Integration, End-to-End). Siehe Testpyramide im Artikel zu Softwaretests.
4. **Statische Sicherheitsprüfung:** Code-Analyse (SAST), Prüfung der Abhängigkeiten auf bekannte Schwachstellen, Suche nach versehentlich eingecheckten Geheimnissen.
5. **Paketieren und Ablegen** in einer **Registry** oder einem Artefakt-Repository mit eindeutiger Version.
6. **Deployment** zuerst auf eine **Staging-Umgebung**, die der Produktion möglichst gleicht.
7. **Abnahme und Produktion**, danach **Smoke-Test** und Beobachtung.

> [!tip] Faustregel
> Eine Pipeline sollte schnell Feedback geben. Dauert der Lauf eine Stunde, sammeln Entwickler Änderungen an und die Vorteile gehen verloren. Aufteilen, parallelisieren, Tests priorisieren.

## Container: Grundlagen

Eine **virtuelle Maschine** bringt ein vollständiges Betriebssystem mit eigenem Kernel mit. Ein **Container** teilt sich dagegen den **Kernel des Hosts** und isoliert nur die Prozesse. Linux nutzt dafür zwei Funktionen: **Namespaces** (jeder Container sieht nur eigene Prozesse, Netzwerke und Dateisysteme) und **Control Groups (cgroups)** (begrenzen CPU, Speicher und I/O). Deshalb startet ein Container in Sekunden, braucht wenig Speicher und lässt sich dicht packen. Die Isolation ist dafür schwächer als bei einer VM: Eine Kernel-Schwachstelle betrifft alle Container auf dem Host.

![Hypervisor-VMs und Container im Vergleich](hypervisor-container.svg "Virtuelle Maschinen mit eigenem Gast-Betriebssystem im Vergleich zu Containern auf dem gemeinsamen Host-Kernel")

| Begriff | Bedeutung |
| :--- | :--- |
| **Image** | unveränderliche Vorlage aus Schichten (Layern): Basissystem, Laufzeit, Anwendung |
| **Container** | laufende Instanz eines Images mit beschreibbarer oberster Schicht |
| **Dockerfile** | Textdatei mit den Bauanweisungen für ein Image |
| **Registry** | Server, der Images speichert und verteilt (Docker Hub, GitHub Container Registry, eigene Registry) |
| **Tag und Digest** | Tag ist ein veränderbarer Name (\`nginx:1.27\`), der **Digest** (\`sha256:...\`) ein unveränderlicher Fingerabdruck |
| **Volume** | persistenter Speicher außerhalb der Container-Schicht |

### Dockerfile und wichtige Befehle

Ein Dockerfile besteht aus Anweisungen wie \`FROM\` (Basisimage), \`WORKDIR\`, \`COPY\`, \`RUN\` (beim Bauen ausführen), \`EXPOSE\` (dokumentiert den Port), \`USER\` und \`CMD\` oder \`ENTRYPOINT\` (Startbefehl). Jede Anweisung erzeugt eine **Schicht**, die zwischengespeichert wird. Deshalb stehen selten geänderte Schritte (Abhängigkeiten installieren) **vor** dem Kopieren des Quellcodes.

- \`docker build -t meine-app:1.0 .\` baut ein Image.
- \`docker run -d -p 8080:80 --name web meine-app:1.0\` startet einen Container und leitet Host-Port 8080 auf Container-Port 80.
- \`docker ps\`, \`docker logs web\`, \`docker exec -it web sh\` zeigen Container, Logs und öffnen eine Shell.
- \`docker compose up -d\` startet mehrere zusammengehörige Container, die in einer \`compose.yaml\` beschrieben sind (z. B. Web-App plus Datenbank).

Daten im Container gehen mit dem Container verloren, wenn sie nicht in einem **Volume** liegen. Container sind **austauschbar** gedacht (*cattle, not pets*): Statt einen Container zu reparieren, ersetzt man ihn durch einen neuen aus dem Image.

### Sichere Images

- **Kleines, vertrauenswürdiges Basisimage** wählen (offizielle oder schlanke Varianten), feste Version statt \`latest\`.
- **Als normaler Benutzer** laufen lassen (\`USER\`), nicht als root.
- **Multi-Stage-Build:** In einer ersten Stufe bauen, in einer zweiten nur das Ergebnis in ein schlankes Image kopieren. Das verkleinert die Angriffsfläche.
- **Keine Geheimnisse** (Passwörter, Schlüssel) ins Image oder Repository schreiben. Sie kommen zur Laufzeit aus einem Secret-Speicher oder aus Umgebungsvariablen.
- **Images regelmäßig scannen** (z. B. mit Trivy) und neu bauen, wenn das Basisimage Sicherheitsupdates erhält.
- \`.dockerignore\` verhindert, dass \`.git\`, lokale Konfigurationen oder \`.env\`-Dateien im Image landen.

## Orchestrierung mit Kubernetes

Wer viele Container auf mehreren Servern betreibt, braucht eine **Orchestrierung**, die Container platziert, überwacht, skaliert und ersetzt. Der Standard ist **Kubernetes**. Die Steuerung ist **deklarativ**: Man beschreibt den **Sollzustand** in YAML („drei Instanzen dieser Anwendung“), und Kubernetes gleicht den Istzustand dauerhaft daran an (*Reconciliation*).

| Baustein | Aufgabe |
| :--- | :--- |
| **Pod** | kleinste Einheit, ein oder mehrere Container mit gemeinsamer IP |
| **Deployment** | hält die gewünschte Zahl gleicher Pods, regelt Updates und Rollbacks |
| **Service** | stabile Adresse und Lastverteilung vor wechselnden Pods |
| **Ingress** | Regeln für HTTP(S)-Zugriff von außen (Host, Pfad, TLS) |
| **ConfigMap / Secret** | Konfiguration und vertrauliche Werte getrennt vom Image |
| **Namespace** | logische Trennung von Teams oder Umgebungen |
| **Node** | Arbeitsknoten (physischer oder virtueller Server) |

Die **Control Plane** besteht aus dem **API-Server** (zentrale Schnittstelle), **etcd** (Datenspeicher des Clusterzustands), **Scheduler** (wählt den Node für neue Pods) und **Controller-Managern** (halten den Sollzustand). Auf jedem Node läuft der **kubelet**, der die Pods startet und überwacht.

**Health Probes:** Eine *Liveness-Probe* prüft, ob der Container noch lebt, andernfalls wird er neu gestartet. Eine *Readiness-Probe* entscheidet, ob er Verkehr bekommen darf. Ein Pod, der noch hochfährt, erhält so keine Anfragen.

**Ressourcen:** Jeder Container kann *Requests* (garantierte Mindestmenge, Grundlage der Platzierung) und *Limits* (Obergrenze) für CPU und Speicher angeben. Beispiel: Ein Deployment mit 3 Replikas und je 250 m CPU (0,25 Kern) Request reserviert zusammen 750 m, also 0,75 Kerne im Cluster.

## Deployment-Strategien

| Strategie | Ablauf | Vorteil | Nachteil |
| :--- | :--- | :--- | :--- |
| **Recreate** | alte Version stoppen, neue starten | einfach | Ausfallzeit |
| **Rolling Update** | Instanzen nacheinander ersetzen | keine Ausfallzeit, wenig Zusatzbedarf | zeitweise zwei Versionen parallel |
| **Blue-Green** | zweite komplette Umgebung (grün) aufbauen, dann Umschalten | sofortiger Rollback durch Zurückschalten | doppelte Ressourcen |
| **Canary** | neue Version erst für kleinen Nutzeranteil (z. B. 5 %), dann steigern | Risiko klein, echte Last | aufwendig, braucht Monitoring |

Ergänzend trennen **Feature Flags** das Ausliefern von Code vom Aktivieren einer Funktion. So kann man Code früh ausrollen und die Funktion später ein- oder ausschalten, ohne neu zu deployen. Datenbankänderungen müssen dabei **abwärtskompatibel** sein (erst Spalte ergänzen, später entfernen), damit alte und neue Version gleichzeitig laufen können.

## Infrastructure as Code und GitOps

**Infrastructure as Code (IaC)** beschreibt Server, Netze und Dienste in Dateien statt per Klick. Das macht Infrastruktur **wiederholbar, versioniert, prüfbar und dokumentiert**. Zwei Ansätze:

- **Deklarativ** (Terraform/OpenTofu, CloudFormation, Kubernetes-YAML): Man beschreibt das Ziel, das Werkzeug bestimmt die Schritte.
- **Konfigurationsmanagement** (Ansible, Puppet, Chef): Man beschreibt, wie Systeme konfiguriert sein sollen. **Idempotenz** bedeutet, dass mehrmaliges Ausführen dasselbe Ergebnis liefert.

Bei **GitOps** ist das Git-Repository die einzige Quelle der Wahrheit für den Sollzustand. Ein Agent im Cluster (z. B. Argo CD oder Flux) gleicht laufend ab und rollt Änderungen aus. Rückgängig machen heißt dann: Commit zurücknehmen. Ein manuell am Cluster geänderter Wert (*Drift*) wird automatisch zurückgesetzt.

## Beobachtbarkeit und Betrieb

Wer häufig ausliefert, muss schnell erkennen, ob etwas schiefgeht. **Observability** stützt sich auf drei Säulen: **Logs** (Ereignisse), **Metriken** (Zahlen im Zeitverlauf, z. B. Anfragen pro Sekunde, Fehlerrate, Latenz) und **Traces** (der Weg einer Anfrage durch mehrere Dienste). Zusätzlich gibt es **Alarmierung** mit Schwellwerten und **Health-Check-Endpunkte**. Nach einem Vorfall folgt eine **Nachbetrachtung ohne Schuldzuweisung** (*Blameless Postmortem*), die Ursachen und Verbesserungen festhält (siehe Problem Management).

**Sicherheit in der Pipeline (DevSecOps):** Zugangsdaten gehören in den Secret-Speicher der Pipeline, nicht ins Repository. Pipeline-Rechte folgen dem Prinzip der minimalen Rechte. Zusätzlich verlangt man signierte Artefakte, geprüfte Abhängigkeiten und eine **Software-Stückliste (SBOM)**, die alle verwendeten Bibliotheken auflistet.

> [!exam] Prüfungshinweis
> Typisch sind: Unterschied CI, Continuous Delivery und Continuous Deployment, Unterschied Container und VM, Vor- und Nachteile von Blue-Green und Canary, Aufgaben einer Pipeline sowie die Begründung für Rollback, Tests und Monitoring. In FIAE-Aufgaben ist oft eine Pipeline-Beschreibung (z. B. YAML) zu lesen und zu ergänzen.
`,
  codeSnippet: `# GitHub Actions: CI-Pipeline für eine Node.js-Anwendung
name: ci
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci          # exakt die Versionen aus package-lock.json
      - run: npm run lint
      - run: npm test
      - run: npm run build
`,
  codeLanguage: 'YAML',
  exercises: [
    {
      id: 'dora-berechnen',
      title: 'DORA-Kennzahlen berechnen',
      prompt: 'Ein Team hat in 4 Wochen 48 Deployments durchgeführt. Bei 6 davon gab es danach eine Störung, die im Mittel 90 Minuten bis zur Wiederherstellung dauerte. Berechne Deployment-Frequenz pro Woche, Änderungsfehlerrate und gib die Wiederherstellungszeit an. Wie beurteilst du das Ergebnis?',
      hints: ['Frequenz = Deployments : Wochen', 'Fehlerrate = Fehlerhafte : alle Deployments'],
      solution: 'Frequenz: 48 : 4 = 12 Deployments pro Woche. Änderungsfehlerrate: 6 : 48 = 12,5 %. Wiederherstellungszeit: 90 Minuten. Die Auslieferung ist schnell, aber jede achte Änderung führt zu einer Störung. Das ist für ein reifes Team hoch. Verbesserungen: mehr automatisierte Tests, kleinere Änderungen, Canary-Rollouts, bessere Alarmierung und ein Rollback, das die Wiederherstellung verkürzt.'
    },
    {
      id: 'ci-cd-unterscheiden',
      title: 'CI, Delivery und Deployment unterscheiden',
      prompt: 'Ein Unternehmen führt bei jedem Push automatisch Build und Tests aus. Nach bestandenen Tests wird die Version automatisch auf Staging installiert. Die Produktion wird erst nach Klick des Produktverantwortlichen aktualisiert. Welche Begriffe treffen zu, und was müsste sich ändern, damit Continuous Deployment vorliegt?',
      hints: ['Wo steht die manuelle Freigabe?'],
      solution: 'Continuous Integration liegt vor (automatischer Build und Test bei jedem Push) und Continuous Delivery (jede bestandene Version ist auslieferbar, die Produktion wird per Freigabe ausgelöst). Für Continuous Deployment müsste die manuelle Freigabe entfallen, sodass jede Version nach den automatischen Prüfungen selbstständig live geht. Voraussetzungen: sehr gute Testabdeckung, Monitoring mit automatischem Rollback und kleine Änderungen.'
    },
    {
      id: 'dockerfile-verbessern',
      title: 'Dockerfile bewerten',
      prompt: 'Ein Dockerfile beginnt mit FROM ubuntu:latest, kopiert zuerst den gesamten Quellcode (COPY . .), führt danach npm install aus, legt ein Admin-Passwort mit ENV ADMIN_PW=geheim fest und startet die Anwendung als root. Nenne mindestens vier Verbesserungen.',
      hints: ['Schichten-Cache, Basisimage, Geheimnisse, Benutzer'],
      solution: '1) Feste, kleine Basisversion statt ubuntu:latest (z. B. node:22-slim), damit Builds reproduzierbar und kleiner sind. 2) Zuerst nur package.json und package-lock.json kopieren, Abhängigkeiten installieren (npm ci), danach erst den Quellcode, damit der Schichten-Cache greift. 3) Kein Passwort im Image: Secret zur Laufzeit übergeben oder aus einem Secret-Speicher laden. 4) Mit USER einen unprivilegierten Benutzer verwenden. 5) .dockerignore für .git, node_modules und .env anlegen. 6) Multi-Stage-Build, damit Build-Werkzeuge nicht im Endimage landen.'
    },
    {
      id: 'deployment-strategie-waehlen',
      title: 'Deployment-Strategie auswählen',
      prompt: 'Ein Onlineshop mit starkem Umsatz am Wochenende soll eine neue Version der Bestellstrecke ausrollen. Ausfallzeit ist nicht akzeptabel und das Risiko für Fehler soll möglichst klein sein. Welche Strategie empfiehlst du und warum? Nenne einen Nachteil.',
      hints: ['Wenige Nutzer zuerst, danach steigern'],
      solution: 'Empfehlung: Canary-Release (alternativ Blue-Green). Die neue Version bekommt zunächst z. B. 5 % des Verkehrs. Fehlerrate, Latenz und Bestellabschlüsse werden überwacht. Bei Auffälligkeiten wird der Anteil auf null gesetzt (schneller Rollback), sonst schrittweise erhöht. Es entsteht keine Ausfallzeit, und das Risiko trifft nur wenige Kunden. Nachteile: zwei Versionen laufen parallel (Datenbank muss kompatibel sein), und es braucht gutes Monitoring und eine Routing-Möglichkeit. Blue-Green wäre schneller umzuschalten, braucht aber doppelte Ressourcen.'
    }
  ],
  quiz: [
    {
      question: 'Was unterscheidet Continuous Delivery von Continuous Deployment?',
      options: [
        'Delivery liefert nie aus, Deployment immer',
        'Bei Delivery löst ein Mensch die Produktion aus, bei Deployment geht jede bestandene Version automatisch live',
        'Delivery gilt nur für Datenbanken',
        'Es gibt keinen Unterschied'
      ],
      correct: 1,
      explanation: 'Beide halten jede Version auslieferbar. Nur Continuous Deployment verzichtet auf die manuelle Freigabe vor der Produktion.'
    },
    {
      question: 'Warum soll das Artefakt in einer Pipeline nur einmal gebaut werden?',
      options: [
        'Weil Builds sehr teuer sind und nicht wiederholt werden dürfen',
        'Damit in allen Umgebungen exakt dasselbe getestete Artefakt läuft',
        'Weil Registries nur ein Image erlauben',
        'Damit keine Tests nötig sind'
      ],
      correct: 1,
      explanation: 'Was getestet wurde, soll auch in die Produktion gehen. Ein erneuter Build könnte andere Abhängigkeiten oder Ergebnisse liefern.'
    },
    {
      question: 'Welche Technik begrenzt unter Linux den CPU- und Speicherverbrauch eines Containers?',
      options: ['Namespaces', 'cgroups', 'Hypervisor', 'Dockerfile'],
      correct: 1,
      explanation: 'Control Groups (cgroups) begrenzen Ressourcen. Namespaces sorgen dagegen für die getrennte Sicht auf Prozesse, Netzwerk und Dateisysteme.'
    },
    {
      question: 'Was bewirkt eine Readiness-Probe in Kubernetes?',
      options: [
        'Sie startet den Container neu, wenn er hängt',
        'Sie entscheidet, ob ein Pod Verkehr über den Service erhalten darf',
        'Sie baut das Image neu',
        'Sie löscht alte Pods'
      ],
      correct: 1,
      explanation: 'Die Readiness-Probe meldet, ob der Pod bereit ist. Solange sie fehlschlägt, erhält er keine Anfragen. Neustarts löst die Liveness-Probe aus.'
    },
    {
      question: 'Welche Deployment-Strategie braucht zeitweise doppelte Ressourcen, erlaubt aber sofortigen Rollback durch Umschalten?',
      options: ['Recreate', 'Rolling Update', 'Blue-Green', 'Canary'],
      correct: 2,
      explanation: 'Bei Blue-Green laufen zwei komplette Umgebungen. Der Rollback besteht aus dem Zurückschalten des Verkehrs.'
    },
    {
      question: 'Wofür steht Idempotenz bei Konfigurationsmanagement-Werkzeugen?',
      options: [
        'Mehrmaliges Ausführen führt zum selben Zielzustand',
        'Jede Ausführung löscht den vorigen Zustand',
        'Das Werkzeug läuft nur einmal',
        'Alle Server werden gleichzeitig neu gestartet'
      ],
      correct: 0,
      explanation: 'Ein idempotentes Skript darf beliebig oft laufen und bringt das System immer in denselben Sollzustand, ohne unerwünschte Nebenwirkungen.'
    },
    {
      question: 'Wie wird ein Geheimnis wie ein Datenbankpasswort sicher in einer Pipeline behandelt?',
      options: [
        'Im Dockerfile mit ENV festlegen',
        'In der Konfigurationsdatei im Repository speichern',
        'In einem Secret-Speicher ablegen und zur Laufzeit injizieren',
        'Per E-Mail an das Team verteilen'
      ],
      correct: 2,
      explanation: 'Geheimnisse gehören nicht in Images oder Repositories, da sie dort dauerhaft einsehbar bleiben. Sie werden zur Laufzeit aus einem Secret-Speicher bereitgestellt.'
    }
  ],
  relatedLabs: [
    { id: 'docker', label: 'Docker-Lab' },
    { id: 'docker_compose', label: 'Docker Compose' },
    { id: 'kubernetes', label: 'Kubernetes' },
    { id: 'github_actions_lab', label: 'GitHub Actions' },
    { id: 'cicd_pipeline', label: 'CI/CD-Pipeline' }
  ],
  sources: [
    { title: 'Docker Docs: What is a container?', url: 'https://docs.docker.com/get-started/docker-concepts/the-basics/what-is-a-container/' },
    { title: 'Kubernetes Docs: Overview', url: 'https://kubernetes.io/docs/concepts/overview/' },
    { title: 'DORA: Software delivery performance metrics', url: 'https://dora.dev/guides/dora-metrics-four-keys/' },
    { title: 'GitHub Docs: Understanding GitHub Actions', url: 'https://docs.github.com/en/actions/get-started/understand-github-actions' },
    { title: 'Wikipedia: DevOps', url: 'https://de.wikipedia.org/wiki/DevOps' }
  ],
  sourcesCheckedOn: '25.11.2026'
};
