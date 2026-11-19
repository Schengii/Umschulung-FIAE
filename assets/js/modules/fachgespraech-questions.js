/**
 * @file fachgespraech-questions.js
 * @description Fragenkatalog der mündlichen Prüfung (Fachgespräch) im IHK-Cockpit. Je Frage eine
 * Musterantwort und drei Bewertungskriterien, die der Prüfling nach dem Aufdecken als
 * Selbsteinschätzung abhaken kann. Die ersten Fragen beziehen sich auf das Abschlussprojekt, die
 * übrigen sind projektunabhängige FIAE-Standardthemen.
 *
 * @typedef {{id: string, category: string, question: string, answer: string, criteria: string[]}} FachgespraechQuestion
 */

/** @type {FachgespraechQuestion[]} */
export const FACHGESPRAECH_QUESTIONS = [
    {
        id: 'fg-01',
        category: 'Software-Architektur & Patterns',
        question:
            'Warum haben Sie sich in Ihrem Abschlussprojekt für eine Entkopplung über Web Components / Module entschieden und welches Architektur-Muster (z.B. MVC, MVVM, Clean Architecture) liegt zugrunde?',
        answer: 'Web Components bieten native Kapselung (Shadow DOM & Custom Elements) ohne Framework-Lock-in. Durch die Trennung von Präsentationsschicht (Views/Components), State-Management (Services/Stores) und Datenschicht (IndexedDB / REST-API) wird das Prinzip der "Separation of Concerns" (SoC) und Testbarkeit nach Clean Architecture gewährleistet.',
        criteria: [
            'Kapselung über Shadow DOM und Custom Elements nennen',
            'Kein Framework-Lock-in als Argument anführen',
            'Folgen für Wartung und Wiederverwendung erklären',
        ],
    },
    {
        id: 'fg-02',
        category: 'Datenbanken & Datenmodellierung',
        question:
            'Erklären Sie die 1., 2. und 3. Normalform anhand Ihrer Datenbank-Modellierung. Warum ist Denormalisierung im Frontend-Cache dennoch manchmal sinnvoll?',
        answer: '1NF: Atomare Werte, keine Wiederholungsgruppen. 2NF: 1NF + jedes Nicht-Schlüsselattribut ist voll funktional vom Primärschlüssel abhängig. 3NF: 2NF + keine transitiven Abhängigkeiten. Denormalisierung im IndexedDB/Client-Cache reduziert teure JOIN-Operationen und ermöglicht blitzschnelle Lesezugriffe im Offline-Modus.',
        criteria: [
            'Alle drei Normalformen korrekt definieren',
            'Bezug zum eigenen Datenmodell herstellen',
            'Denormalisierung als bewusste Ausnahme begründen',
        ],
    },
    {
        id: 'fg-03',
        category: 'Wirtschaftlichkeit & Make-or-Buy',
        question:
            'Wie haben Sie die wirtschaftliche Sinnhaftigkeit Ihres Projekts nachgewiesen? Erläutern Sie Ihre Amortisationsrechnung und Nutzwertanalyse.',
        answer: 'Über eine Kosten-Nutzen-Analyse und Nutzwertanalyse mit gewichteten Kriterien (Kosten, Wartbarkeit, Datenschutz). Die Einmalkosten der Entwicklung (80h × Stundensatz = 4.800 €) stehen einer monatlichen Zeiteinsparung von 15 Stunden pro Mitarbeiter gegenüber. Bei 50 €/h spart das Unternehmen 750 €/Monat, womit sich das Projekt nach ca. 6,4 Monaten amortisiert (ROI).',
        criteria: [
            'Einmalkosten und laufende Einsparung beziffern',
            'Amortisationszeit nachvollziehbar berechnen',
            'Nutzwertanalyse mit gewichteten Kriterien erwähnen',
        ],
    },
    {
        id: 'fg-04',
        category: 'Datenschutz, DSGVO & IT-Sicherheit',
        question:
            'Welche technischen und organisatorischen Maßnahmen (TOMs) haben Sie zum Schutz personenbezogener Daten und gegen Angriffe wie XSS/SQL-Injection implementiert?',
        answer: 'DSGVO: Privacy by Design, Datensparsamkeit, lokale Speicherung sensibler Daten im IndexedDB/LocalStorage, keine Drittanbieter-Tracker. Sicherheit: Strikte Content Security Policy (CSP), Context-Aware Escaping gegen XSS, Prepared Statements/ORM gegen SQL-Injection, HTTPS-only und SRI-Hashes.',
        criteria: [
            'Datensparsamkeit und Privacy by Design nennen',
            'Mindestens zwei Schutzmaßnahmen gegen Angriffe benennen',
            'Technische und organisatorische Maßnahmen unterscheiden',
        ],
    },
    {
        id: 'fg-05',
        category: 'Qualitätssicherung & Testing',
        question:
            'Welche Teststrategie haben Sie gewählt und warum reichen reine Unit-Tests bei einer modernen Webanwendung nicht aus?',
        answer: 'Pyramiden-Teststrategie: Schnelle Unit-Tests für isolierte Geschäftslogik, Integrationstests für Service-Worker & Caching, und automatisierte Playwright E2E-Tests für reale Nutzerinteraktionen (Navigation, Offline-Verhalten, Rendering). Unit-Tests prüfen isolierte Bausteine, während E2E-Tests das Zusammenspiel der gesamten PWA sicherstellen.',
        criteria: [
            'Testpyramide (Unit, Integration, E2E) beschreiben',
            'Grenzen reiner Unit-Tests begründen',
            'Automatisierung der Tests erwähnen',
        ],
    },
    {
        id: 'fg-06',
        category: 'Design Patterns & Clean Code',
        question:
            'Erläutern Sie das Strategy Pattern und die SOLID-Prinzipien. Wie tragen diese zur Wartbarkeit Ihrer Anwendung bei?',
        answer: 'Das Strategy Pattern kapselt austauschbare Algorithmen (z. B. verschiedene Rabattberechnungen oder Export-Formate) hinter einer gemeinsamen Schnittstelle. Dadurch wird das Open-Closed-Principle (OCP aus SOLID) erfüllt: Neue Strategien können hinzugefügt werden, ohne bestehenden Code modifizieren zu müssen.',
        criteria: [
            'Strategy Pattern mit Beispiel erklären',
            'Open-Closed-Principle benennen',
            'Nutzen für Wartbarkeit herstellen',
        ],
    },
    {
        id: 'fg-07',
        category: 'Asynchrone Programmierung & Web Workers',
        question:
            'Wie verhindert man in JavaScript, dass rechenintensive Operationen den UI-Thread blockieren, und wie funktioniert der Event Loop?',
        answer: 'JavaScript läuft standardmäßig in einem Single-Thread-Event-Loop (Call Stack, Web APIs, Task/Microtask Queue). Rechenintensive Aufgaben (wie KI-Entscheidungen oder Bildverarbeitung) werden in Web Worker ausgelagert. Diese laufen in separaten Hintergrund-Threads und kommunizieren asynchron über Message-Channels via postMessage().',
        criteria: [
            'Single-Thread-Event-Loop erklären',
            'Web Worker als Lösung nennen',
            'Kommunikation per postMessage beschreiben',
        ],
    },
    {
        id: 'fg-08',
        category: 'API-Design & Schnittstellen',
        question:
            'Was unterscheidet eine RESTful API von WebSockets und wann ist welches Kommunikationsprotokoll vorzuziehen?',
        answer: 'REST basiert auf dem zustandslosen HTTP Request-Response-Modell und eignet sich ideal für CRUD-Operationen, Caching und strukturierte Datenaustausche. WebSockets bieten nach dem HTTP 101 Handshake eine persistente, bidirektionale Vollduplex-Verbindung mit minimalem Overhead für Realtime-Events (z. B. Chats, Live-Telemetry oder Multiplayer-Games).',
        criteria: [
            'REST als zustandslos mit Request-Response beschreiben',
            'WebSockets als bidirektional und dauerhaft beschreiben',
            'Einsatzszenarien beider Protokolle abgrenzen',
        ],
    },
    {
        id: 'fg-09',
        category: 'Netzwerke & IT-Systeme',
        question: 'Erklären Sie das OSI-Modell und ordnen Sie HTTP, TCP und IP den passenden Schichten zu.',
        answer: 'Das OSI-Modell gliedert Kommunikation in sieben Schichten (Bitübertragung, Sicherung, Vermittlung, Transport, Sitzung, Darstellung, Anwendung). HTTP liegt auf Schicht 7, TCP auf Schicht 4 (Transport), IP auf Schicht 3 (Vermittlung). Jede Schicht nutzt die Dienste der darunterliegenden und kapselt ihre Daten in eigene Header.',
        criteria: [
            'Sieben Schichten in der richtigen Reihenfolge nennen',
            'HTTP, TCP und IP richtig zuordnen',
            'Prinzip der Kapselung erklären',
        ],
    },
    {
        id: 'fg-10',
        category: 'Netzwerke & IT-Systeme',
        question: 'Ein Netz 192.168.10.0/24 soll in vier gleich große Subnetze geteilt werden. Wie gehen Sie vor?',
        answer: 'Für vier Subnetze werden zwei Bits vom Hostanteil geliehen: aus /24 wird /26 (Maske 255.255.255.192). Jedes Subnetz hat 64 Adressen, davon 62 nutzbare Hosts (Netz- und Broadcastadresse abgezogen). Die Netze beginnen bei .0, .64, .128 und .192.',
        criteria: [
            'Neue Präfixlänge /26 herleiten',
            'Anzahl nutzbarer Hosts korrekt berechnen',
            'Netzadressen der vier Subnetze nennen',
        ],
    },
    {
        id: 'fg-11',
        category: 'Datenbanken & Datenmodellierung',
        question:
            'Was ist der Unterschied zwischen INNER JOIN, LEFT JOIN und einem Subselect? Nennen Sie je ein Beispiel.',
        answer: 'INNER JOIN liefert nur Zeilen mit Treffer in beiden Tabellen, LEFT JOIN zusätzlich alle Zeilen der linken Tabelle (fehlende Werte als NULL). Ein Subselect ist eine eingebettete Abfrage, etwa WHERE id IN (SELECT ...), und eignet sich, wenn kein Spaltenwert der Unterabfrage im Ergebnis gebraucht wird. Joins sind bei großen Mengen oft besser optimierbar.',
        criteria: [
            'INNER und LEFT JOIN korrekt abgrenzen',
            'Verhalten bei fehlenden Treffern (NULL) erklären',
            'Ein sinnvolles Beispiel für den Subselect nennen',
        ],
    },
    {
        id: 'fg-12',
        category: 'Datenbanken & Datenmodellierung',
        question: 'Was bedeutet ACID bei Transaktionen und wann würden Sie eine Transaktion einsetzen?',
        answer: 'ACID steht für Atomicity (alles oder nichts), Consistency (Regeln bleiben erfüllt), Isolation (parallele Transaktionen stören sich nicht) und Durability (bestätigte Änderungen bleiben erhalten). Eine Transaktion braucht man, wenn mehrere Schritte zusammengehören, etwa eine Überweisung mit Abbuchung und Gutschrift.',
        criteria: [
            'Alle vier Eigenschaften nennen',
            'Mit einem Anwendungsfall belegen',
            'Rollback bei Fehler erwähnen',
        ],
    },
    {
        id: 'fg-13',
        category: 'Software-Architektur & Patterns',
        question: 'Erklären Sie das MVC-Muster und wie es sich vom Schichtenmodell unterscheidet.',
        answer: 'MVC trennt Model (Daten und Logik), View (Darstellung) und Controller (Eingaben und Steuerung). Das Schichtenmodell gliedert dagegen nach Abstraktionsebenen (Präsentation, Geschäftslogik, Datenhaltung) mit Aufrufen nur nach unten. MVC beschreibt vor allem die Aufgabenverteilung in der Oberfläche, Schichten die Gesamtarchitektur.',
        criteria: [
            'Drei MVC-Rollen erklären',
            'Schichtenmodell abgrenzen',
            'Nutzen der Trennung (Testbarkeit, Austauschbarkeit) nennen',
        ],
    },
    {
        id: 'fg-14',
        category: 'Software-Architektur & Patterns',
        question: 'Beschreiben Sie UML-Klassendiagramm und Anwendungsfalldiagramm: Wofür setzen Sie welches ein?',
        answer: 'Das Anwendungsfalldiagramm zeigt aus Nutzersicht, welche Akteure welche Funktionen des Systems nutzen, und gehört in die Analyse. Das Klassendiagramm beschreibt die statische Struktur mit Klassen, Attributen, Methoden und Beziehungen (Vererbung, Assoziation, Komposition) und gehört in Entwurf und Implementierung.',
        criteria: [
            'Zweck beider Diagramme unterscheiden',
            'Typische Elemente benennen',
            'Passende Projektphase zuordnen',
        ],
    },
    {
        id: 'fg-15',
        category: 'Projektmanagement & Vorgehensmodelle',
        question: 'Vergleichen Sie Wasserfallmodell und Scrum. Wann ist welches Vorgehen sinnvoll?',
        answer: 'Das Wasserfallmodell arbeitet Phasen nacheinander ab (Analyse, Entwurf, Umsetzung, Test) und passt bei klaren, stabilen Anforderungen. Scrum liefert in Sprints lauffähige Inkremente, mit Product Owner, Scrum Master und Team, und passt bei sich ändernden Anforderungen. Der Preis von Scrum ist weniger Planbarkeit bei Umfang und Termin.',
        criteria: [
            'Ablauf beider Modelle beschreiben',
            'Rollen oder Artefakte von Scrum nennen',
            'Auswahl anhand der Anforderungslage begründen',
        ],
    },
    {
        id: 'fg-16',
        category: 'Projektmanagement & Vorgehensmodelle',
        question:
            'Wie planen Sie ein Projekt mit Zeit-, Kosten- und Qualitätszielen und was tun Sie, wenn ein Ziel gefährdet ist?',
        answer: 'Das magische Dreieck beschreibt, dass Zeit, Kosten und Umfang/Qualität voneinander abhängen. Geplant wird mit Projektstrukturplan, Aufwandsschätzung, Meilensteinen und Puffern. Bei Abweichungen wird früh gegengesteuert: Umfang priorisieren (MoSCoW), Ressourcen anpassen oder Termin neu verhandeln, und das Ergebnis mit dem Auftraggeber abstimmen.',
        criteria: [
            'Magisches Dreieck oder Zielkonflikt erklären',
            'Planungswerkzeuge benennen',
            'Gegenmaßnahmen und Abstimmung beschreiben',
        ],
    },
    {
        id: 'fg-17',
        category: 'Datenschutz, DSGVO & IT-Sicherheit',
        question:
            'Welche Schutzziele der IT-Sicherheit kennen Sie und wie unterscheiden sich Verschlüsselung und Hashing?',
        answer: 'Die Schutzziele sind Vertraulichkeit, Integrität und Verfügbarkeit. Verschlüsselung ist umkehrbar und schützt Vertraulichkeit (symmetrisch mit einem Schlüssel, asymmetrisch mit Schlüsselpaar). Ein Hash ist eine Einwegfunktion zur Integritätsprüfung; Passwörter werden gesalzen mit einem langsamen Verfahren wie bcrypt oder Argon2 gespeichert.',
        criteria: [
            'Drei Schutzziele nennen',
            'Umkehrbarkeit als Unterschied herausstellen',
            'Passwortspeicherung mit Salt erwähnen',
        ],
    },
    {
        id: 'fg-18',
        category: 'Datenschutz, DSGVO & IT-Sicherheit',
        question: 'Wie sichern Sie Daten und was ist beim Backup-Konzept (3-2-1-Regel) zu beachten?',
        answer: 'Die 3-2-1-Regel verlangt drei Kopien auf zwei verschiedenen Medien, davon eine an einem anderen Ort. Dazu kommen regelmäßige Rücksicherungstests, definierte Aufbewahrungsfristen und Verschlüsselung der Sicherungen. Vollsicherung, differenzielle und inkrementelle Sicherung unterscheiden sich in Speicherbedarf und Wiederherstellungszeit.',
        criteria: [
            '3-2-1-Regel richtig wiedergeben',
            'Sicherungsarten unterscheiden',
            'Test der Wiederherstellung erwähnen',
        ],
    },
    {
        id: 'fg-19',
        category: 'Qualitätssicherung & Testing',
        question: 'Was ist testgetriebene Entwicklung (TDD) und welche Vor- und Nachteile hat sie?',
        answer: 'Bei TDD wird zuerst ein fehlschlagender Test geschrieben (Red), dann der minimale Code, der ihn besteht (Green), anschließend wird aufgeräumt (Refactor). Vorteile sind hohe Testabdeckung, kleine Schritte und ein testbares Design. Nachteile sind der Mehraufwand am Anfang und der Pflegeaufwand der Tests bei häufigen Änderungen.',
        criteria: [
            'Red-Green-Refactor beschreiben',
            'Mindestens einen Vorteil nennen',
            'Mindestens einen Nachteil nennen',
        ],
    },
    {
        id: 'fg-20',
        category: 'Qualitätssicherung & Testing',
        question: 'Wie arbeiten Sie mit Git im Team und was ist der Unterschied zwischen Merge und Rebase?',
        answer: 'Änderungen entstehen auf Feature-Branches und werden per Pull Request reviewt und in den Hauptzweig übernommen. Merge verbindet zwei Verläufe mit einem Merge-Commit und erhält die Historie, Rebase setzt die eigenen Commits auf den neuen Stand um und erzeugt eine lineare Historie. Auf bereits geteilte Branches wird nicht rebased.',
        criteria: [
            'Branching und Pull Request beschreiben',
            'Merge und Rebase abgrenzen',
            'Regel zum Umschreiben geteilter Historie nennen',
        ],
    },
    {
        id: 'fg-21',
        category: 'Design Patterns & Clean Code',
        question:
            'Was verstehen Sie unter objektorientierter Programmierung? Erklären Sie Vererbung, Polymorphie und Kapselung.',
        answer: 'Objektorientierung modelliert Software als Objekte mit Zustand und Verhalten. Kapselung verbirgt interne Daten hinter einer Schnittstelle, Vererbung übernimmt Eigenschaften einer Oberklasse, Polymorphie erlaubt, dass gleiche Aufrufe je nach Objekttyp unterschiedlich ausgeführt werden. Komposition ist oft besser als tiefe Vererbungshierarchien.',
        criteria: [
            'Drei Grundprinzipien richtig erklären',
            'Mit einem Beispiel belegen',
            'Komposition gegenüber Vererbung erwähnen',
        ],
    },
    {
        id: 'fg-22',
        category: 'Wirtschaftlichkeit & Make-or-Buy',
        question: 'Was ist der Unterschied zwischen Einzel- und Gemeinkosten und wie berechnen Sie einen Stundensatz?',
        answer: 'Einzelkosten lassen sich einem Projekt direkt zuordnen (Arbeitszeit, Lizenz), Gemeinkosten fallen allgemein an (Miete, Verwaltung) und werden über Zuschlagssätze verteilt. Der Stundensatz ergibt sich aus Lohnkosten plus Gemeinkostenzuschlag geteilt durch die produktiven Stunden pro Jahr, nicht durch alle bezahlten Stunden.',
        criteria: [
            'Einzel- und Gemeinkosten abgrenzen',
            'Zuschlag für Gemeinkosten erwähnen',
            'Produktive statt bezahlter Stunden berücksichtigen',
        ],
    },
    {
        id: 'fg-23',
        category: 'API-Design & Schnittstellen',
        question: 'Welche HTTP-Methoden und Statuscodes verwenden Sie in einer REST-API und wie versionieren Sie sie?',
        answer: 'GET liest, POST legt an, PUT ersetzt, PATCH ändert teilweise, DELETE löscht; GET, PUT und DELETE sind idempotent. Typische Statuscodes sind 200, 201, 204, 400, 401, 403, 404 und 500. Versioniert wird über den Pfad (/v1/) oder einen Header, damit bestehende Clients bei Änderungen weiterlaufen.',
        criteria: [
            'Methoden fachlich richtig zuordnen',
            'Statuscodes sinnvoll auswählen',
            'Versionierungsstrategie nennen',
        ],
    },
    {
        id: 'fg-24',
        category: 'Barrierefreiheit & Usability',
        question: 'Was gehört zur Barrierefreiheit einer Webseite (WCAG) und wie prüfen Sie sie?',
        answer: 'WCAG gliedert sich in wahrnehmbar, bedienbar, verständlich und robust. Umgesetzt werden unter anderem Textalternativen, ausreichende Kontraste, Tastaturbedienung mit sichtbarem Fokus, semantisches HTML und ARIA-Attribute für dynamische Komponenten. Geprüft wird automatisiert (Lighthouse, axe) und manuell mit Tastatur und Screenreader.',
        criteria: [
            'Vier WCAG-Prinzipien oder konkrete Maßnahmen nennen',
            'Tastaturbedienung und Kontraste erwähnen',
            'Automatische und manuelle Prüfung unterscheiden',
        ],
    },
];
