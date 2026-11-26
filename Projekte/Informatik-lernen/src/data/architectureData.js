// Inhalte der Seite „Systemarchitektur & Microservices“.
// Optionales Feld `source: { label, url }` verweist auf eine Primärquelle.

export const ARCH_NODES = [
  {
    id: 'client',
    name: '🌐 Web & Mobile Clients',
    type: 'Frontend',
    desc: 'Browser, iOS & Android Apps senden HTTPS-Anfragen an das Backend.',
    details: 'Nutzt REST APIs & WebSockets für Echtzeit-Kommunikation.'
  },
  {
    id: 'cdn',
    name: '🚚 CDN (Content Delivery Network)',
    type: 'Auslieferung',
    desc: 'Verteilt statische Dateien (Bilder, Skripte, Styles) auf Server nahe beim Nutzer und senkt so Ladezeit und Last auf dem Ursprungsserver.',
    details: 'Inhalte werden per Cache-Control-Header und TTL zwischengespeichert; bei Änderungen wird der Cache invalidiert oder die Datei erhält einen neuen Namen (Versionierung).'
  },
  {
    id: 'gateway',
    name: '🛡️ API Gateway & Load Balancer',
    type: 'Routing & Security',
    desc: 'Zentraler Eingangspunkt für Anfragen, Rate Limiting, SSL-Terminierung & Lastverteilung.',
    details: 'Routet Anfragen an verfügbare Microservice-Instanzen weiter (NGINX / HAProxy). Typische Verfahren sind Round Robin, Least Connections und gewichtete Verteilung; Health Checks nehmen defekte Instanzen aus der Rotation.'
  },
  {
    id: 'user_service',
    name: '⚙️ User & Auth Microservice',
    type: 'Backend Service',
    desc: 'Verwaltet Benutzerkonten, JWT-Tokens & Rechteverwaltung.',
    details: 'Kommuniziert mit der User-Datenbank und prüft Authentifizierung. Passwörter werden nie im Klartext, sondern mit Salt und langsamem Hashverfahren gespeichert.'
  },
  {
    id: 'payment_service',
    name: '💳 Payment Microservice',
    type: 'Backend Service',
    desc: 'Verarbeitet Zahlungen & Rechnungsstellung entkoppelt vom Hauptsystem.',
    details: 'Nutzt Message Queues zur asynchronen Benachrichtigung. Anfragen sollten idempotent sein, damit eine Wiederholung nicht doppelt abbucht.'
  },
  {
    id: 'queue',
    name: '📨 Message Broker (Queue)',
    type: 'Asynchrone Kommunikation',
    desc: 'Entkoppelt Dienste zeitlich: Der Absender legt eine Nachricht ab, der Empfänger verarbeitet sie, sobald er Kapazität hat (z. B. RabbitMQ, Kafka).',
    details: 'Puffert Lastspitzen, ermöglicht Wiederholungen und verhindert, dass ein langsamer Dienst den Aufrufer blockiert. Nachrichten werden meist "mindestens einmal" zugestellt, daher müssen Empfänger Duplikate vertragen.'
  },
  {
    id: 'cache',
    name: '⚡ Redis In-Memory Cache',
    type: 'Caching',
    desc: 'Speichert häufig abgefragte Daten im Arbeitsspeicher für Antworten im Millisekundenbereich.',
    details: 'Entlastet die Hauptdatenbanken drastisch. Beim Cache-Aside-Muster liest die Anwendung zuerst den Cache und lädt bei einem Fehlschlag (Cache Miss) aus der Datenbank nach; ein TTL begrenzt, wie lange Daten veraltet sein dürfen.'
  },
  {
    id: 'database',
    name: '🗄️ SQL & NoSQL Datenbank Cluster',
    type: 'Persistence',
    desc: 'Hauptspeicherort für strukturierte Anwendungsdaten (PostgreSQL / MongoDB).',
    details: 'Repliziert Daten auf Primary- und Read-Replica Knoten. Lesezugriffe lassen sich auf Replikate verteilen; Schreibzugriffe gehen an den Primary.'
  },
  {
    id: 'object_storage',
    name: '🪣 Object Storage',
    type: 'Persistence',
    desc: 'Speichert große, unstrukturierte Dateien (Bilder, Backups, Logs) als Objekte mit eindeutigem Schlüssel (z. B. S3-kompatible Speicher).',
    details: 'Sehr hohe Haltbarkeit durch Replikation, günstig und praktisch unbegrenzt skalierbar. Ungeeignet für häufige kleine Änderungen oder relationale Abfragen.'
  },
  {
    id: 'observability',
    name: '📈 Monitoring & Logging',
    type: 'Betrieb',
    desc: 'Sammelt Metriken, Logs und Traces, damit Fehler früh erkannt und Ursachen gefunden werden (z. B. Prometheus, Grafana, OpenTelemetry).',
    details: 'Alarme basieren auf Schwellenwerten wie Fehlerrate oder Antwortzeit. Eine Korrelations-ID verfolgt eine Anfrage durch alle Microservices.'
  }
];

export const ARCH_PATTERNS = [
  {
    id: 'monolith',
    name: 'Monolith',
    summary: 'Eine Anwendung, die als Ganzes gebaut, getestet und bereitgestellt wird.',
    pros: ['Einfach zu entwickeln, zu testen und zu betreiben', 'Keine Netzwerkaufrufe zwischen Modulen', 'Gut für kleine Teams und frühe Projektphasen'],
    cons: ['Skalierung nur als Ganzes', 'Ein Fehler kann die ganze Anwendung stören', 'Große Codebasis erschwert unabhängige Releases'],
    useWhen: 'Kleines Team, überschaubare Fachlichkeit, schneller Start.'
  },
  {
    id: 'layered',
    name: 'Schichtenarchitektur',
    summary: 'Die Anwendung ist in Schichten gegliedert, z. B. Präsentation, Geschäftslogik und Datenzugriff. Jede Schicht nutzt nur die darunterliegende.',
    pros: ['Klare Verantwortlichkeiten', 'Schichten lassen sich einzeln austauschen und testen', 'In der Ausbildung und in IHK-Aufgaben sehr verbreitet'],
    cons: ['Änderungen ziehen sich oft durch alle Schichten', 'Kann zu viel Durchreichen von Daten führen'],
    useWhen: 'Klassische Unternehmensanwendungen mit klar getrennter UI, Logik und Datenhaltung.'
  },
  {
    id: 'microservices',
    name: 'Microservices',
    summary: 'Viele kleine, unabhängig bereitstellbare Dienste, die jeweils eine fachliche Aufgabe erfüllen und über APIs oder Nachrichten kommunizieren.',
    pros: ['Dienste skalieren und deployen unabhängig', 'Teams arbeiten weitgehend unabhängig', 'Fehler lassen sich eingrenzen'],
    cons: ['Verteilte Systeme sind komplex (Netzwerk, Konsistenz, Fehlersuche)', 'Mehr Betriebsaufwand (Deployment, Monitoring)', 'Datenkonsistenz über Dienste hinweg ist schwierig'],
    useWhen: 'Große Systeme mit mehreren Teams und stark unterschiedlichen Lastprofilen.',
    source: { label: 'Martin Fowler & James Lewis: Microservices', url: 'https://martinfowler.com/articles/microservices.html' }
  },
  {
    id: 'event_driven',
    name: 'Ereignisgesteuerte Architektur',
    summary: 'Dienste veröffentlichen Ereignisse (z. B. "Bestellung aufgegeben"), andere Dienste reagieren darauf, ohne sich zu kennen.',
    pros: ['Lose Kopplung', 'Gut skalierbar und erweiterbar', 'Natürlich asynchron'],
    cons: ['Ablauf ist schwerer nachzuvollziehen', 'Doppelte oder vertauschte Nachrichten müssen berücksichtigt werden', 'Eventual Consistency statt sofortiger Konsistenz'],
    useWhen: 'Viele Reaktionen auf dasselbe Ereignis, Lastspitzen, Integration mehrerer Systeme.'
  },
  {
    id: 'serverless',
    name: 'Serverless (FaaS)',
    summary: 'Funktionen laufen bei Bedarf in der Cloud; der Anbieter kümmert sich um Server und Skalierung. Abgerechnet wird nach Nutzung.',
    pros: ['Kein Serverbetrieb', 'Automatische Skalierung bis auf null', 'Kosten folgen der Nutzung'],
    cons: ['Kaltstart-Verzögerungen', 'Abhängigkeit vom Anbieter (Vendor-Lock-in)', 'Zeit- und Ressourcenlimits pro Aufruf'],
    useWhen: 'Unregelmäßige Last, kleine Hintergrundaufgaben, Webhooks.'
  }
];

export const ARCH_PRINCIPLES = [
  {
    id: 'scaling',
    title: 'Skalierung: vertikal oder horizontal',
    text: 'Vertikal (Scale-up) heißt: mehr CPU, RAM oder Speicher in denselben Server. Das ist einfach, hat aber eine Obergrenze und bleibt ein einzelner Ausfallpunkt. Horizontal (Scale-out) heißt: mehr Server parallel betreiben und die Last verteilen. Dazu müssen Anwendungen möglichst zustandslos (stateless) sein, Sitzungsdaten liegen dann z. B. im Cache.'
  },
  {
    id: 'cap',
    title: 'CAP-Theorem',
    text: 'In einem verteilten System können bei einer Netzwerkpartition nicht gleichzeitig Konsistenz (alle sehen dieselben Daten) und Verfügbarkeit (jede Anfrage bekommt eine Antwort) garantiert werden. Systeme entscheiden sich daher für CP (konsistent, notfalls nicht verfügbar) oder AP (verfügbar, notfalls vorübergehend inkonsistent, "Eventual Consistency"). Relationale Datenbanken mit einem Primary sind meist auf Konsistenz ausgelegt, viele NoSQL-Systeme auf Verfügbarkeit.'
  },
  {
    id: 'caching',
    title: 'Caching-Strategien',
    text: 'Cache-Aside: Die Anwendung liest zuerst den Cache und lädt bei einem Miss aus der Datenbank nach. Write-Through: Schreibzugriffe gehen in Cache und Datenbank gleichzeitig. Write-Back: Zuerst nur in den Cache, später verzögert in die Datenbank (schneller, aber Datenverlust bei Ausfall möglich). Ein TTL (Time to Live) begrenzt die Veralterung; die schwierigste Aufgabe ist das rechtzeitige Ungültigmachen veralteter Einträge.'
  },
  {
    id: 'circuit_breaker',
    title: 'Resilienz: Timeout, Retry und Circuit Breaker',
    text: 'Aufrufe zwischen Diensten brauchen ein Timeout, damit ein hängender Dienst nicht alle Threads blockiert. Retries wiederholen fehlgeschlagene Aufrufe, am besten mit exponentiell wachsender Wartezeit (Backoff) und nur bei idempotenten Operationen. Ein Circuit Breaker unterbricht Aufrufe zu einem dauerhaft fehlerhaften Dienst für kurze Zeit (Zustände: geschlossen, offen, halb offen), damit sich dieser erholen kann und Fehler nicht durch das System kaskadieren.',
    source: { label: 'Microsoft Azure Architecture Center: Circuit Breaker Pattern', url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/circuit-breaker' }
  },
  {
    id: 'bulkhead',
    title: 'Resilienz: Bulkhead und Graceful Degradation',
    text: 'Das Bulkhead-Muster trennt Ressourcen (z. B. Thread-Pools oder Instanzen) pro Funktion, so dass ein überlasteter Teil nicht alles mitreißt, wie die Schotten eines Schiffs. Graceful Degradation bedeutet, bei Teilausfällen eingeschränkt weiterzuarbeiten, etwa Empfehlungen auszublenden, wenn der Empfehlungsdienst nicht antwortet, aber den Kauf weiter zu ermöglichen.'
  },
  {
    id: 'ha',
    title: 'Hochverfügbarkeit und Redundanz',
    text: 'Hochverfügbarkeit entsteht durch Redundanz: kein Single Point of Failure bei Servern, Netzteilen, Netzwerkpfaden, Datenbanken und Standorten. Komponenten in Reihe verschlechtern die Gesamtverfügbarkeit (Produkt der Einzelwerte), parallele Komponenten verbessern sie. Praktisch ist zusätzlich ein getestetes Backup und ein Wiederanlaufplan (RTO: Zeit bis zum Wiederanlauf, RPO: tolerierbarer Datenverlust) nötig.',
    source: { label: 'Google SRE Book: Embracing Risk', url: 'https://sre.google/sre-book/embracing-risk/' }
  }
];

export const ARCH_QUIZ = [
  {
    frage: 'Wozu dient ein Load Balancer?',
    optionen: ['Er verteilt Anfragen auf mehrere Server und nimmt defekte Instanzen aus der Rotation', 'Er speichert Passwörter im Klartext', 'Er verschlüsselt die Festplatten', 'Er ersetzt die Datenbank'],
    korrekt: 0,
    erklaerung: 'Ein Load Balancer verteilt die Last (z. B. Round Robin oder Least Connections) und erkennt über Health Checks ausgefallene Instanzen.'
  },
  {
    frage: 'Eine Anwendung hängt von zwei Diensten in Reihe ab, beide mit 99,9 % Verfügbarkeit. Wie hoch ist die Gesamtverfügbarkeit?',
    optionen: ['Etwa 99,8 %', '99,9 %', '100 %', 'Etwa 99,99 %'],
    korrekt: 0,
    erklaerung: 'In Reihe multiplizieren sich die Verfügbarkeiten: 0,999 · 0,999 = 0,998001, also rund 99,8 %.'
  },
  {
    frage: 'Zwei redundante Server mit je 99 % laufen parallel (einer reicht). Wie hoch ist die Gesamtverfügbarkeit?',
    optionen: ['99 %', '99,9 %', '99,99 %', '98 %'],
    korrekt: 2,
    erklaerung: 'Bei Parallelschaltung multiplizieren sich die Ausfallwahrscheinlichkeiten: 1 − 0,01 · 0,01 = 0,9999, also 99,99 %.'
  },
  {
    frage: 'Wie viel Ausfallzeit pro Jahr erlaubt eine Verfügbarkeit von 99,9 %?',
    optionen: ['Etwa 8,8 Stunden', 'Etwa 52 Minuten', 'Etwa 3,7 Tage', 'Etwa 5 Minuten'],
    korrekt: 0,
    erklaerung: '0,1 % von 525.600 Minuten sind 525,6 Minuten, also rund 8,76 Stunden.'
  },
  {
    frage: 'Was ist ein typischer Nachteil von Microservices gegenüber einem Monolithen?',
    optionen: ['Höhere Komplexität bei Betrieb, Netzwerk und Datenkonsistenz', 'Sie lassen sich nicht skalieren', 'Sie können nur eine Programmiersprache nutzen', 'Sie benötigen keine Tests'],
    korrekt: 0,
    erklaerung: 'Microservices sind verteilte Systeme: Netzwerkfehler, Monitoring, Deployment und Konsistenz über Dienste hinweg sind aufwendiger.'
  },
  {
    frage: 'Was bewirkt ein Circuit Breaker?',
    optionen: ['Er unterbricht Aufrufe zu einem dauerhaft fehlerhaften Dienst, damit sich Fehler nicht ausbreiten', 'Er trennt die Stromversorgung im Rechenzentrum', 'Er verschlüsselt den Netzwerkverkehr', 'Er sichert die Datenbank'],
    korrekt: 0,
    erklaerung: 'Nach mehreren Fehlschlägen öffnet der Circuit Breaker und lässt Aufrufe kurzzeitig scheitern, bevor er in den Zustand "halb offen" testet, ob der Dienst wieder antwortet.'
  },
  {
    frage: 'Was beschreibt horizontale Skalierung?',
    optionen: ['Mehr Server parallel betreiben und die Last verteilen', 'Mehr RAM in einen einzelnen Server einbauen', 'Den Server ausschalten', 'Die Datenbank löschen'],
    korrekt: 0,
    erklaerung: 'Scale-out verteilt die Last auf mehrere Instanzen. Mehr Ressourcen in einen einzelnen Server wären vertikale Skalierung.'
  },
  {
    frage: 'Warum sollten Empfänger von Nachrichten aus einer Queue idempotent arbeiten?',
    optionen: ['Weil Nachrichten bei "mindestens einmal"-Zustellung doppelt ankommen können', 'Weil Queues nie Nachrichten verlieren', 'Weil Idempotenz die Nachrichten verschlüsselt', 'Weil sonst die Queue gelöscht wird'],
    korrekt: 0,
    erklaerung: 'Bei Wiederholungen kann dieselbe Nachricht mehrfach eintreffen. Idempotente Verarbeitung stellt sicher, dass das Ergebnis dasselbe bleibt.'
  }
];
