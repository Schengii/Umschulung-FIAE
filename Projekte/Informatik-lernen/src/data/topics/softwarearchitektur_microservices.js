/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Softwarearchitektur von Softwaredesign abgrenzen und Qualitätsmerkmale nach ISO 25010 nennen',
    'Schichten-, Client-Server-, MVC- und ereignisgesteuerte Architekturen vergleichen',
    'Monolith, modularen Monolith und Microservices mit Vor- und Nachteilen bewerten',
    'Kopplung, Kohäsion und die SOLID-Prinzipien auf Beispiele anwenden',
    'Resilienzmuster (Timeout, Retry, Circuit Breaker) und Verfügbarkeit verteilter Systeme berechnen'
  ],
  content: `
## Was ist Softwarearchitektur?

Die **Architektur** legt die grundlegende Struktur eines Systems fest: Bausteine, ihre Verantwortung, ihre Beziehungen und die Regeln, nach denen sie zusammenarbeiten. Das **Design** beschäftigt sich dagegen mit dem Inneren der Bausteine (Klassen, Methoden). Die Grenze ist fließend. Architekturentscheidungen sind **teuer zu ändern**, deshalb trifft man sie bewusst und begründet.

Eine Architektur ist keine Technikliste, sondern ein **Kompromiss zwischen Qualitätsanforderungen**. Mehr Sicherheit kostet oft Leistung, mehr Flexibilität erhöht die Komplexität. Es gibt keine „beste“ Architektur, nur eine, die zu den Anforderungen passt.

## Qualitätsmerkmale nach ISO/IEC 25010

Die Ausgabe von 2011 nannte acht Produktqualitätsmerkmale, die Neufassung von 2023 nennt **neun**: Neu ist die Betriebssicherheit (*Safety*), Benutzbarkeit heißt jetzt Interaktionsfähigkeit und Übertragbarkeit heißt Flexibilität. Aus diesen Merkmalen leiten sich die Anforderungen an die Architektur ab:

| Merkmal | Frage | Beispiel für eine Anforderung |
| :--- | :--- | :--- |
| **Funktionale Eignung** | Tut das System das Richtige? | Rechnungen enthalten alle Pflichtangaben |
| **Leistungseffizienz** | Wie schnell und ressourcenschonend? | Antwort auf 95 % der Anfragen unter 300 ms |
| **Kompatibilität** | Arbeitet es mit anderen Systemen zusammen? | Schnittstelle zum ERP über REST |
| **Interaktionsfähigkeit (früher Benutzbarkeit)** | Wie gut ist es bedienbar und barrierefrei? | Neue Nutzer buchen in unter 2 Minuten |
| **Zuverlässigkeit** | Verfügbar, fehlertolerant, wiederherstellbar? | 99,9 % Verfügbarkeit, Wiederanlauf in 15 Minuten |
| **Sicherheit** | Schutz von Daten und Zugriff? | Rollenkonzept, verschlüsselte Übertragung |
| **Wartbarkeit** | Leicht änderbar und testbar? | Neues Zahlungsverfahren in unter 5 Personentagen |
| **Flexibilität (früher Übertragbarkeit)** | Auf andere Umgebungen übertragbar, skalierbar? | Läuft in Container und Cloud |
| **Betriebssicherheit (Safety, neu 2023)** | Gefährdet es Menschen oder Umwelt nicht? | Steuerung fährt bei Fehler in sicheren Zustand |

> [!tip] Praxis
> Formuliere Qualitätsziele **messbar** („Antwortzeit unter 300 ms bei 500 gleichzeitigen Nutzern“) statt vage („soll schnell sein“). Nur dann lassen sie sich testen und gegeneinander abwägen.

## Kopplung, Kohäsion und SOLID

- **Kohäsion** beschreibt, wie eng die Aufgaben innerhalb eines Bausteins zusammengehören. **Hohe Kohäsion ist gut:** Ein Baustein erledigt eine klar abgegrenzte Aufgabe.
- **Kopplung** beschreibt die Abhängigkeit zwischen Bausteinen. **Lose Kopplung ist gut:** Änderungen an einem Baustein ziehen keine Änderungen an vielen anderen nach sich.

Die **SOLID-Prinzipien** für objektorientierten Entwurf (Robert C. Martin) unterstützen genau das:

| Prinzip | Aussage |
| :--- | :--- |
| **S**ingle Responsibility | Eine Klasse hat genau einen Grund, sich zu ändern |
| **O**pen/Closed | offen für Erweiterung, geschlossen für Änderung |
| **L**iskov Substitution | Unterklassen müssen sich wie ihre Basisklasse verwenden lassen |
| **I**nterface Segregation | lieber mehrere kleine, spezifische Schnittstellen als eine große |
| **D**ependency Inversion | High-Level-Code hängt von Abstraktionen ab, nicht von Details |

Weitere Entwurfsregeln: **DRY** (Don't Repeat Yourself), **KISS** (Keep It Simple) und **YAGNI** (You Aren't Gonna Need It: nichts bauen, was nicht gebraucht wird).

## Klassische Architekturmuster

**Schichtenarchitektur:** Präsentation, Anwendungslogik, Datenzugriff und Datenhaltung liegen in getrennten Schichten, jede nutzt nur die darunter. Sie ist übersichtlich und leicht zu verstehen, kann aber zu starren Durchreichen-Aufrufen führen. In der **3-Tier-Architektur** sind die Schichten auf getrennte Server verteilt (Client, Anwendungsserver, Datenbankserver).

**Client-Server:** Clients fordern Dienste an, Server stellen sie bereit. Das ist die Grundlage von Web und Netzwerkdiensten. Die Alternative **Peer-to-Peer** kennt gleichberechtigte Teilnehmer.

**MVC (Model-View-Controller)** trennt Daten und Geschäftslogik (*Model*), Darstellung (*View*) und Steuerung der Eingaben (*Controller*). Ähnliche Muster sind MVVM und MVP. Damit lässt sich die Oberfläche austauschen, ohne die Logik anzufassen, und die Logik getrennt testen.

**Hexagonale (Ports-and-Adapters) und Clean Architecture:** Die Fachlogik liegt im Zentrum und kennt weder Datenbank noch Weboberfläche. Sie spricht nur über **Ports** (Schnittstellen), die **Adapter** außen implementieren (REST-Controller, SQL-Repository). Technologie wird austauschbar, die Fachlogik ist ohne Infrastruktur testbar. Dahinter steht die **Dependency Inversion**: Abhängigkeiten zeigen nach innen.

**Ereignisgesteuerte Architektur (Event-Driven):** Komponenten kommunizieren über **Ereignisse** („Bestellung aufgegeben“) und eine **Nachrichtenwarteschlange** oder einen Event-Broker (z. B. RabbitMQ, Kafka). Der Sender kennt die Empfänger nicht. Das entkoppelt Systeme und ermöglicht Spitzen abzufedern, macht aber den Ablauf schwerer nachvollziehbar und führt zu **eventueller Konsistenz**.

## Monolith, modularer Monolith, Microservices

![Monolith und Microservices im Vergleich](monolith-microservices.svg "Ein Monolith mit gemeinsamer Datenbank gegenüber Microservices mit API-Gateway und je eigener Datenbank")

Ein **Monolith** wird als **eine Einheit** gebaut und ausgeliefert. Das ist für kleine bis mittlere Systeme oft die beste Wahl: einfache Entwicklung, einfache Tests, lokale Aufrufe, eine Datenbanktransaktion. Wächst das System, entstehen lange Build- und Releasezeiten, enge Kopplung und Probleme, einzelne Teile unabhängig zu skalieren.

Ein **modularer Monolith** bleibt eine Einheit, ist aber intern in klar abgegrenzte Module mit definierten Schnittstellen geteilt. Er ist ein guter Zwischenschritt und oft sinnvoller Startpunkt.

**Microservices** zerlegen die Anwendung in viele kleine, **unabhängig deploybare Dienste**, die jeweils eine fachliche Fähigkeit abbilden (Bestellung, Zahlung, Lager) und über das Netzwerk kommunizieren (REST, gRPC, Nachrichten). Typische Merkmale:

- **Eigene Datenhaltung** je Dienst, kein gemeinsamer Datenbankzugriff.
- **Unabhängige Skalierung und Auslieferung**, eigene Teams je Dienst.
- **Technologievielfalt** ist möglich.
- **Automatisierung ist Pflicht:** CI/CD, Container, Monitoring (siehe Artikel zu DevOps).

| Aspekt | Monolith | Microservices |
| :--- | :--- | :--- |
| Entwicklung am Anfang | einfach, schnell | höherer Aufwand für Infrastruktur |
| Skalierung | nur als Ganzes | je Dienst einzeln |
| Fehlerisolation | Fehler kann alles betreffen | Ausfall bleibt eher begrenzt |
| Konsistenz | eine Transaktion | verteilt, eventuelle Konsistenz |
| Betrieb | ein Artefakt | viele Dienste, Netzwerk, Monitoring |
| Teamorganisation | wenige Teams | viele kleine, unabhängige Teams |

> [!warning] Typischer Fehler
> Microservices lösen keine Probleme einer schlechten Struktur, sie verteilen sie nur über das Netzwerk. Ohne klare fachliche Grenzen entsteht ein **verteilter Monolith**: alle Nachteile des Netzes, keine Vorteile der Unabhängigkeit.

## Verteilte Systeme: Daten und Kommunikation

**Synchron** (Anfrage wartet auf Antwort, z. B. REST) ist einfach, koppelt aber zeitlich: Fällt der Zielservice aus, hängt der Aufrufer. **Asynchron** (Nachrichten) entkoppelt, braucht aber Wiederholungs- und Duplikatbehandlung. Verbreitet ist **mindestens einmalige Zustellung**, deshalb müssen Empfänger **idempotent** arbeiten (dieselbe Nachricht zweimal zu verarbeiten ändert nichts).

**CAP-Theorem:** Ein verteilter Datenspeicher kann bei einer Netzwerkpartition nur zwei von drei Eigenschaften gleichzeitig garantieren: **C**onsistency (alle sehen dieselben Daten), **A**vailability (jede Anfrage bekommt eine Antwort) und **P**artition tolerance (läuft bei Netztrennung weiter). Da Partitionen in der Praxis vorkommen, entscheidet man zwischen Konsistenz und Verfügbarkeit.

**Transaktionen über Dienste:** Eine klassische Datenbanktransaktion über mehrere Datenbanken ist nicht üblich. Stattdessen nutzt man das **Saga-Muster**: Eine Folge lokaler Transaktionen, bei Fehler folgen **Kompensationsaktionen** (z. B. „Zahlung erstatten“, wenn die Lagerreservierung scheitert).

**API-Gateway:** zentraler Einstieg, der Anfragen weiterleitet und Querschnittsthemen übernimmt (Authentifizierung, Ratenbegrenzung, TLS). **Service Discovery** hilft Diensten, sich zu finden, wenn Instanzen kommen und gehen.

## Resilienz: Fehler einkalkulieren

In verteilten Systemen **fällt immer irgendwo etwas aus**. Resiliente Architektur rechnet damit:

- **Timeout:** Jeder Fernaufruf bekommt eine Zeitgrenze, sonst blockieren Threads unendlich.
- **Retry mit Backoff:** Fehlgeschlagene Aufrufe werden mit wachsendem Abstand (1 s, 2 s, 4 s, plus Zufallsanteil) wiederholt. Ohne Begrenzung und ohne Backoff verschärft man eine Überlast.
- **Circuit Breaker:** Nach mehreren Fehlern öffnet der „Schutzschalter“ und weist Aufrufe sofort ab (*open*), prüft nach einer Wartezeit testweise (*half-open*) und schließt bei Erfolg wieder (*closed*). Der kranke Dienst bekommt Luft, der Aufrufer wartet nicht.
- **Bulkhead (Schotten):** Ressourcen werden getrennt, damit ein langsamer Dienst nicht alle Threads belegt.
- **Fallback:** Eine sinnvolle Ersatzantwort (Cache, Standardwert) statt Fehlermeldung.
- **Health Checks, Redundanz und Lastverteilung:** mehrere Instanzen hinter einem Load Balancer.

### Verfügbarkeit einer Dienstkette

Müssen mehrere Dienste **nacheinander** funktionieren, multiplizieren sich die Verfügbarkeiten. Fünf Dienste mit je 99,9 % ergeben 0,999 hoch 5 = 0,995, also **99,5 %**. Statt 8,76 Stunden sind dann etwa 43,8 Stunden Ausfall pro Jahr möglich. Mehr Dienste in einer Kette senken also die Gesamtverfügbarkeit, solange man sie nicht durch Redundanz, Caches oder asynchrone Entkopplung abfedert.

## Skalierung

**Vertikal** (Scale-up) bedeutet, einen Server stärker zu machen (mehr CPU und RAM). Das ist einfach, hat aber eine Obergrenze und bleibt ein Ausfallpunkt. **Horizontal** (Scale-out) heißt, mehr Instanzen hinter einem Load Balancer zu betreiben. Dafür sollten Dienste **zustandslos** (*stateless*) sein: Sitzungsdaten liegen in einer gemeinsamen Datenbank oder im Cache, nicht im Prozess. Dann kann jede Instanz jede Anfrage bearbeiten und Instanzen lassen sich beliebig hinzufügen oder entfernen.

## Entscheidungen dokumentieren

Architekturentscheidungen werden als **Architecture Decision Record (ADR)** festgehalten: *Kontext* (Problem und Randbedingungen), *Entscheidung*, *Alternativen*, *Konsequenzen*. So bleibt nachvollziehbar, warum etwas so gebaut wurde. Hilfsmittel für die Darstellung sind UML (Komponenten-, Verteilungs-, Sequenzdiagramm) und das **C4-Modell** (Kontext, Container, Komponenten, Code) mit vier Detailebenen.

> [!exam] Prüfungshinweis
> Gefragt wird häufig: Qualitätsmerkmale einem Szenario zuordnen, Schichten benennen, Vor- und Nachteile von Monolith und Microservices abwägen, Kopplung und Kohäsion bewerten, SOLID-Verstöße erkennen und Verfügbarkeit berechnen. Begründe jede Entscheidung mit dem konkreten Szenario, nicht allgemein.
`,
  exercises: [
    {
      id: 'architektur-auswahl',
      title: 'Architektur für ein Szenario wählen',
      prompt: 'Ein Start-up mit drei Entwicklern baut eine Buchungsplattform. Die Anforderungen sind noch unklar und ändern sich wöchentlich. Soll das Team mit Microservices oder einem Monolithen starten? Begründe und nenne einen Weg, später zu wechseln.',
      hints: ['Teamgröße und Unsicherheit der Anforderungen', 'Betriebsaufwand verteilter Systeme'],
      solution: 'Empfehlung: Mit einem modularen Monolithen starten. Bei drei Personen und unklaren Anforderungen ist der Aufwand für Infrastruktur, Monitoring und verteilte Konsistenz bei Microservices zu hoch, die fachlichen Grenzen sind noch nicht stabil. Ein Monolith ist schneller zu entwickeln, zu testen und zu betreiben. Die Module (Buchung, Zahlung, Nutzer) mit klaren Schnittstellen und je eigener Datenhaltung im Schema trennen. Wenn Teile unabhängig skalieren müssen oder mehrere Teams entstehen, lassen sich einzelne Module schrittweise als Dienste herauslösen.'
    },
    {
      id: 'verfuegbarkeit-kette',
      title: 'Verfügbarkeit einer Dienstkette berechnen',
      prompt: 'Eine Bestellung durchläuft nacheinander Gateway (99,95 %), Bestellservice (99,9 %), Zahlungsservice (99,9 %) und Datenbank (99,99 %). Berechne die Gesamtverfügbarkeit und die erlaubte Ausfallzeit pro Jahr (8760 h). Nenne zwei Maßnahmen, um sie zu erhöhen.',
      hints: ['Verfügbarkeiten in Reihe multiplizieren'],
      solution: 'Gesamt = 0,9995 * 0,999 * 0,999 * 0,9999 = 0,99740, also etwa 99,74 %. Ausfall pro Jahr: 0,0026 * 8760 h = ca. 22,8 h. Maßnahmen: Dienste redundant betreiben (mehrere Instanzen, Standby-Datenbank, parallele Redundanz), Aufrufe asynchron entkoppeln (Warteschlange), Cache oder Fallback für nicht kritische Aufrufe, Circuit Breaker gegen Fehlerfortpflanzung.'
    },
    {
      id: 'solid-erkennen',
      title: 'SOLID-Verstoß erkennen',
      prompt: 'Eine Klasse Rechnung berechnet Beträge, erzeugt das PDF, schreibt in die Datenbank und verschickt die E-Mail. Welches Prinzip wird verletzt? Wie würdest du die Klasse zerlegen, und welchen Vorteil hat das beim Testen?',
      hints: ['Ein Grund zur Änderung pro Klasse'],
      solution: 'Verletzt wird das Single-Responsibility-Prinzip: Die Klasse hat mehrere Gründe, sich zu ändern (Berechnung, Layout, Speicherung, Versand). Zerlegung: Rechnung (Fachlogik), RechnungPdfErzeuger, RechnungRepository, MailVersand, dazu eine koordinierende Anwendungsklasse. Die Abhängigkeiten zeigen auf Schnittstellen (Dependency Inversion). Vorteil: Die Berechnung lässt sich ohne Datenbank und Mailserver testen, indem man Repository und Versand durch Attrappen ersetzt, und Änderungen am PDF-Layout berühren die Fachlogik nicht.'
    },
    {
      id: 'circuit-breaker-erklaeren',
      title: 'Circuit Breaker erklären',
      prompt: 'Der Zahlungsdienst antwortet nicht mehr. Der Bestellservice wiederholt jede Anfrage dreimal ohne Pause und wartet jeweils 30 Sekunden. Was passiert bei hoher Last, und wie helfen Timeout, Backoff und Circuit Breaker?',
      hints: ['Threads werden blockiert, die Überlast wächst'],
      solution: 'Bei hoher Last blockieren die wartenden Aufrufe alle Threads des Bestellservice. Durch die dreifachen Wiederholungen verdreifacht sich zusätzlich die Last auf den ohnehin überlasteten Zahlungsdienst, der Fehler pflanzt sich fort (Kaskadenausfall). Besser: kurzer Timeout (z. B. 2 Sekunden), wenige Wiederholungen mit wachsendem Abstand und Zufallsanteil (Backoff), und ein Circuit Breaker, der nach mehreren Fehlern öffnet und Aufrufe sofort abweist. Der Zahlungsdienst kann sich erholen, der Bestellservice antwortet schnell mit einer sinnvollen Meldung oder einem Fallback und prüft später testweise (half-open), ob der Dienst wieder verfügbar ist.'
    }
  ],
  quiz: [
    {
      question: 'Was bedeutet hohe Kohäsion eines Bausteins?',
      options: [
        'Er hängt von vielen anderen Bausteinen ab',
        'Seine Aufgaben gehören fachlich eng zusammen',
        'Er enthält möglichst viele Funktionen',
        'Er hat keine Schnittstellen'
      ],
      correct: 1,
      explanation: 'Hohe Kohäsion heißt: Ein Baustein hat eine klar abgegrenzte Aufgabe. Zusammen mit loser Kopplung erhöht sie die Wartbarkeit.'
    },
    {
      question: 'Welches Qualitätsmerkmal nach ISO 25010 beschreibt, wie leicht Software geändert und getestet werden kann?',
      options: ['Zuverlässigkeit', 'Wartbarkeit', 'Kompatibilität', 'Übertragbarkeit'],
      correct: 1,
      explanation: 'Wartbarkeit umfasst Modularität, Wiederverwendbarkeit, Analysierbarkeit, Änderbarkeit und Testbarkeit.'
    },
    {
      question: 'Was ist ein typischer Nachteil von Microservices?',
      options: [
        'Sie lassen sich nicht unabhängig deployen',
        'Sie erhöhen den Betriebs- und Abstimmungsaufwand (Netzwerk, Monitoring, Konsistenz)',
        'Sie erlauben nur eine Programmiersprache',
        'Sie können nicht skalieren'
      ],
      correct: 1,
      explanation: 'Microservices bilden ein verteiltes System. Netzwerkfehler, eventuelle Konsistenz und der Betrieb vieler Dienste verursachen zusätzlichen Aufwand.'
    },
    {
      question: 'Wofür steht das D in SOLID?',
      options: ['Data Hiding', 'Dependency Inversion', 'Design Pattern', 'Dynamic Dispatch'],
      correct: 1,
      explanation: 'Dependency Inversion: High-Level-Module hängen von Abstraktionen ab, nicht von konkreten Low-Level-Details.'
    },
    {
      question: 'Wie lässt sich eine fachliche Operation über mehrere Microservices ohne verteilte Datenbanktransaktion konsistent halten?',
      options: ['Saga mit Kompensationsaktionen', 'Gemeinsame Datenbank für alle', 'Mehr Threads', 'Retry ohne Limit'],
      correct: 0,
      explanation: 'Eine Saga ist eine Folge lokaler Transaktionen. Schlägt ein Schritt fehl, machen Kompensationsaktionen die vorherigen Schritte fachlich rückgängig.'
    },
    {
      question: 'Fünf in Reihe geschaltete Dienste haben je 99,9 % Verfügbarkeit. Wie hoch ist die Gesamtverfügbarkeit ungefähr?',
      options: ['99,9 %', '99,5 %', '99,0 %', '100 %'],
      correct: 1,
      explanation: '0,999 hoch 5 ergibt etwa 0,995. In einer Kette multiplizieren sich die Verfügbarkeiten, die Gesamtverfügbarkeit ist kleiner als jede einzelne.'
    },
    {
      question: 'Was passiert bei einem geöffneten Circuit Breaker?',
      options: [
        'Alle Anfragen werden zusätzlich wiederholt',
        'Aufrufe werden sofort abgewiesen, ohne den kranken Dienst zu belasten',
        'Der Dienst wird dauerhaft gelöscht',
        'Die Datenbank wird gesperrt'
      ],
      correct: 1,
      explanation: 'Im Zustand open weist der Schutzschalter Aufrufe sofort ab. Nach einer Wartezeit testet er im Zustand half-open, ob der Dienst wieder antwortet.'
    }
  ],
  relatedLabs: [
    { id: 'architecture', label: 'Systemarchitektur' },
    { id: 'design_patterns', label: 'Entwurfsmuster' },
    { id: 'clean_arch_lab', label: 'Clean Architecture' },
    { id: 'circuit_breaker_lab', label: 'Circuit Breaker' },
    { id: 'event_sourcing_lab', label: 'Event Sourcing' }
  ],
  sources: [
    { title: 'Martin Fowler und James Lewis: Microservices', url: 'https://martinfowler.com/articles/microservices.html' },
    { title: 'arc42: Update on ISO 25010, version 2023', url: 'https://quality.arc42.org/articles/iso-25010-update-2023' },
    { title: 'Wikipedia: ISO/IEC 9126 (Vorgänger von ISO/IEC 25010)', url: 'https://en.wikipedia.org/wiki/ISO/IEC_9126' },
    { title: 'microservices.io: Pattern Language (Chris Richardson)', url: 'https://microservices.io/patterns/index.html' },
    { title: 'Wikipedia: Softwarearchitektur', url: 'https://de.wikipedia.org/wiki/Softwarearchitektur' },
    { title: 'Wikipedia: SOLID (Softwareentwicklung)', url: 'https://de.wikipedia.org/wiki/Prinzipien_objektorientierten_Designs' }
  ],
  sourcesCheckedOn: '25.11.2026'
};
