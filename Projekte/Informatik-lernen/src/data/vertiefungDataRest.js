// Fachliche Vertiefungen (Teil 3): Einsteiger-Kapitel 5–12, Architektur-Komponenten,
// Fachthemen für SQL und Bash sowie Zusatzwissen zu den Karteikarten 1–20.
// Format der Vertiefungen wie in vertiefungData.js: { md, sources? }.
const md = (...lines) => lines.join('\n');

// ---------------------------------------------------------------- Einsteiger-Kapitel 5–12
export const GUIDE_DEEPDIVES_REST = {
  betriebssystem: {
    md: md(
      '### Kernel und Benutzerbereich',
      'Der **Kernel** läuft mit höchsten Rechten und verwaltet Hardware, Speicher und Prozesse. Programme laufen im **Benutzerbereich** und bitten den Kernel über **Systemaufrufe** (z. B. Datei öffnen) um Dienste. So kann ein fehlerhaftes Programm nicht das ganze System zum Absturz bringen.',
      '',
      '### Prozesse, Threads und Scheduler',
      '- Ein **Prozess** ist ein laufendes Programm mit eigenem Adressraum, ein **Thread** ist ein Ausführungsstrang innerhalb eines Prozesses und teilt dessen Speicher.',
      '- Der **Scheduler** teilt jedem lauffähigen Thread Zeitscheiben auf den CPU-Kernen zu. Dadurch wirkt es, als liefen viele Programme gleichzeitig.',
      '',
      '### Speicherverwaltung',
      'Jeder Prozess sieht einen eigenen **virtuellen Adressraum**. Das Betriebssystem bildet ihn in Seiten (Paging) auf den physischen RAM ab. Reicht der RAM nicht, lagert es selten genutzte Seiten auf den Datenträger aus (Swap/Auslagerungsdatei). Das ist deutlich langsamer.',
      '',
      '### Dateisysteme',
      '| Dateisystem | Typische Verwendung |',
      '|---|---|',
      '| NTFS | Windows, Rechte (ACL), Journaling |',
      '| ext4 | Linux, Journaling |',
      '| APFS | macOS und iOS |',
      '| FAT32 | USB-Sticks, Kompatibilität, Dateien maximal 4 GiB minus 1 Byte |',
      '',
      '### Startvorgang',
      'Firmware (UEFI) prüft die Hardware, startet den **Bootloader**, dieser lädt den **Kernel**, danach starten Dienste und die Benutzeroberfläche.',
      '',
      '### Berechtigungen',
      'Dateien gehören einem Benutzer und einer Gruppe. Unter Linux steuern die Rechte `r`, `w` und `x` (4, 2, 1) den Zugriff für Besitzer, Gruppe und andere. Arbeite im Alltag ohne Administratorrechte (**Prinzip der minimalen Rechte**).'
    ),
    sources: [{ label: 'Wikipedia: Betriebssystem', url: 'https://de.wikipedia.org/wiki/Betriebssystem' }]
  },
  programme_algorithmen: {
    md: md(
      '### Vom Quelltext zur Ausführung',
      '- **Kompilierte Sprachen** (C, Rust, Go) werden vor der Ausführung in Maschinencode übersetzt: schnell, Fehler zeigen sich früh.',
      '- **Interpretierte Sprachen** (Python, JavaScript) werden zur Laufzeit ausgeführt. Viele nutzen dabei einen Zwischencode oder Just-in-Time-Kompilierung.',
      '',
      '### Algorithmen darstellen',
      'In der Ausbildung und Prüfung üblich sind **Pseudocode**, **Flussdiagramm** und **Struktogramm** (Nassi-Shneiderman) mit den Bausteinen Sequenz, Auswahl und Wiederholung. Mit einem **Schreibtischtest** verfolgst du die Variablenwerte Schritt für Schritt von Hand.',
      '',
      '### Drei Fehlerarten',
      '| Art | Wann sie auftritt | Beispiel |',
      '|---|---|---|',
      '| Syntaxfehler | beim Übersetzen/Start | fehlende Klammer |',
      '| Laufzeitfehler | während der Ausführung | Division durch 0, Datei fehlt |',
      '| Logikfehler | Programm läuft, Ergebnis falsch | Schleife endet einen Schritt zu früh |',
      '',
      '### Funktionen und Rekursion',
      '- Eine **Funktion** bündelt Schritte, bekommt Parameter und liefert einen Rückgabewert. So vermeidest du Wiederholungen.',
      '- **Rekursion**: Eine Funktion ruft sich selbst auf. Sie braucht einen **Basisfall**, sonst entsteht ein Stack Overflow.',
      '',
      '### Wie gut ist ein Algorithmus?',
      'Neben der Korrektheit zählt der Aufwand: Die **Laufzeit** wächst z. B. linear (O(n)) oder logarithmisch (O(log n)) mit der Eingabegröße.',
      '',
      '### Debugging-Vorgehen',
      'Fehler reproduzieren, Ursache eingrenzen (Ausgaben, Haltepunkte), eine Änderung nach der anderen testen und einen Test hinterlassen, der den Fehler künftig abfängt.'
    )
  },
  webseiten: {
    md: md(
      '### Aufbau von Anfrage und Antwort',
      '- **Request**: Methode (GET, POST), URL, Header (z. B. `Accept`, `Cookie`) und optional ein Body.',
      '- **Response**: Statuscode (200 OK, 404 Nicht gefunden, 500 Serverfehler), Header (z. B. `Content-Type`, `Cache-Control`) und Body (HTML, JSON, Bild).',
      '',
      '### Was der Browser mit dem HTML macht',
      'Er baut aus dem HTML den **DOM-Baum**, wendet das CSS an, berechnet das Layout und zeichnet die Seite. JavaScript kann den DOM jederzeit verändern.',
      '',
      '### CSS-Boxmodell',
      'Jedes Element besteht von innen nach außen aus Inhalt, Innenabstand (padding), Rahmen (border) und Außenabstand (margin).',
      '',
      '### Responsive Design und Barrierefreiheit',
      '- Mit `<meta name="viewport">` und **Media Queries** passt sich das Layout an die Bildschirmbreite an.',
      '- **WCAG 2.1** fordert u. a. Textalternativen für Bilder (`alt`), ausreichenden Kontrast (mindestens 4,5:1 für normalen Text auf Stufe AA) und Bedienbarkeit per Tastatur.',
      '',
      '### Sicherheit im Browser',
      '- **HTTPS/TLS** verschlüsselt die Verbindung, ein **Zertifikat** weist die Identität des Servers nach.',
      '- Die **Same-Origin-Policy** verhindert, dass Skripte einer Seite beliebig Daten anderer Herkunft lesen. Ausnahmen regelt **CORS**.',
      '- **Cookies** speichern Sitzungen. Setze sie mit `Secure`, `HttpOnly` und `SameSite`.'
    ),
    sources: [{ label: 'MDN: Web-Lernbereich', url: 'https://developer.mozilla.org/de/docs/Learn' }]
  },
  daten_speichern: {
    md: md(
      '### Relational oder NoSQL?',
      '| Typ | Prinzip | Beispiel |',
      '|---|---|---|',
      '| Relational | Tabellen, feste Struktur, SQL, Transaktionen | PostgreSQL, MySQL |',
      '| Dokument | JSON-ähnliche Dokumente, flexibles Schema | MongoDB |',
      '| Key-Value | Schlüssel zu Wert, sehr schnell | Redis |',
      '| Graph | Knoten und Beziehungen | Neo4j |',
      '',
      'Für stark vernetzte, konsistenzkritische Geschäftsdaten (Bestellungen, Buchungen) ist meist eine relationale Datenbank passend.',
      '',
      '### Indizes',
      'Ein **Index** beschleunigt Suchen wie ein Stichwortverzeichnis. Er kostet Speicher und verlangsamt Schreibzugriffe leicht, deshalb nur dort anlegen, wo häufig gefiltert oder verknüpft wird.',
      '',
      '### Teilsprachen von SQL',
      '| Teil | Zweck | Beispiele |',
      '|---|---|---|',
      '| DDL | Struktur definieren | CREATE, ALTER, DROP |',
      '| DML | Daten lesen und ändern | SELECT, INSERT, UPDATE, DELETE |',
      '| DCL | Rechte | GRANT, REVOKE |',
      '| TCL | Transaktionen | COMMIT, ROLLBACK |',
      '',
      '### Backup-Arten',
      '- **Vollbackup**: alles, größter Speicherbedarf, einfachste Wiederherstellung.',
      '- **Differenziell**: alles seit dem letzten Vollbackup. Zum Wiederherstellen werden Vollbackup und letztes Differenzial gebraucht.',
      '- **Inkrementell**: nur Änderungen seit dem letzten Backup jeder Art. Wenig Speicher, aber zum Wiederherstellen werden Vollbackup und alle Inkremente benötigt.',
      '',
      '### Speichermedien',
      '**SSDs** nutzen Flash-Speicher ohne bewegliche Teile und sind viel schneller als Festplatten. Flash-Zellen verschleißen bei Schreibzugriffen, Hersteller geben deshalb eine Schreibmenge an (TBW).',
      '',
      '### Dateiformate für Daten',
      'CSV (einfach, tabellarisch, ohne Datentypen), JSON (verschachtelt, in Web-APIs üblich), XML (strukturiert, mit Schema prüfbar).'
    )
  },
  sicher_im_netz: {
    md: md(
      '### Häufige Angriffsarten',
      '| Angriff | Idee | Schutz |',
      '|---|---|---|',
      '| Phishing | gefälschte Nachrichten verleiten zur Preisgabe von Daten | Absender und Link prüfen, MFA |',
      '| Ransomware | Schadsoftware verschlüsselt Daten und fordert Lösegeld | Backups (offline), Updates |',
      '| Social Engineering | Täuschung von Menschen am Telefon oder vor Ort | Schulung, Rückruf über bekannte Nummer |',
      '| Man-in-the-Middle | Angreifer liest oder verändert Verkehr | HTTPS, Zertifikatsprüfung |',
      '| DDoS | Überlastung durch viele Anfragen | Filterdienste, Skalierung |',
      '',
      '### Wie Passwörter sicher gespeichert werden',
      'Seriöse Dienste speichern nie das Passwort selbst, sondern einen **Hash mit Salt**, berechnet mit einem bewusst langsamen Verfahren wie Argon2, bcrypt oder scrypt. Für dich gilt: Länge und Einzigartigkeit schlagen Komplexitätsregeln.',
      '',
      '### Mehrfaktor-Authentifizierung',
      'Faktoren sind **Wissen** (Passwort), **Besitz** (App, Sicherheitsschlüssel) und **Inhärenz** (Fingerabdruck). Einmalcodes aus Apps (TOTP) wechseln meist alle 30 Sekunden. **Passkeys** (FIDO2) ersetzen das Passwort durch ein Schlüsselpaar und sind gegen Phishing deutlich widerstandsfähiger.',
      '',
      '### Updates und Verschlüsselung',
      '- **Patch-Management**: Sicherheitslücken werden oft kurz nach Veröffentlichung eines Updates ausgenutzt.',
      '- **Festplattenverschlüsselung** schützt bei Verlust oder Diebstahl, **TLS** schützt die Übertragung.',
      '',
      '### Wenn doch etwas passiert',
      'Gerät vom Netz trennen, Passwörter über ein sauberes Gerät ändern, Vorfall melden (im Unternehmen an die IT-Sicherheit). Bei personenbezogenen Daten gelten Meldefristen.'
    ),
    sources: [{ label: 'BSI für Bürgerinnen und Bürger', url: 'https://www.bsi.bund.de/DE/Themen/Verbraucherinnen-und-Verbraucher/verbraucherinnen-und-verbraucher_node.html' }]
  },
  heimnetz: {
    md: md(
      '### Adressierung im Heimnetz',
      '- Typisch ist ein Netz wie `192.168.178.0/24`: Die Subnetzmaske `255.255.255.0` sagt, dass die ersten 24 Bit das Netz bezeichnen.',
      '- Das **Standardgateway** ist der Router: An ihn gehen alle Pakete, die nicht ins eigene Netz gehören.',
      '- **DHCP** vergibt Adressen nur für eine bestimmte Zeit (Lease) und liefert zugleich Gateway und DNS-Server.',
      '',
      '### NAT',
      'Der Router ersetzt die privaten Absenderadressen durch seine öffentliche Adresse und merkt sich Zuordnung und Ports (PAT). Eingehende Verbindungen von außen werden deshalb standardmäßig nicht an Heimgeräte weitergereicht. Jede **Portweiterleitung** öffnet bewusst ein Tor und ist ein Risiko.',
      '',
      '### WLAN',
      '| Standard | Name | Bänder |',
      '|---|---|---|',
      '| 802.11n | Wi-Fi 4 | 2,4 und 5 GHz |',
      '| 802.11ac | Wi-Fi 5 | 5 GHz |',
      '| 802.11ax | Wi-Fi 6 | 2,4 und 5 GHz |',
      '',
      '- **2,4 GHz**: größere Reichweite, aber störanfälliger und langsamer.',
      '- **5 GHz**: schneller, geringere Reichweite, bessere Entstörung.',
      '- Verschlüsselung: **WPA3** (oder mindestens WPA2) verwenden, WEP ist unsicher. Richte ein **Gastnetz** ein, damit Besucher nicht auf Heimgeräte zugreifen.',
      '',
      '### Fehlersuche mit Bordmitteln',
      '1. `ping 192.168.178.1` prüft die Verbindung zum Router.',
      '2. `ping 8.8.8.8` prüft den Internetzugang ohne DNS.',
      '3. `ping example.org` prüft zusätzlich die Namensauflösung.',
      '4. `ipconfig` (Windows) bzw. `ip a` (Linux) zeigt Adresse, Maske, Gateway, DNS.'
    ),
    sources: [{ label: 'RFC 1918: Private Adressbereiche', url: 'https://www.rfc-editor.org/rfc/rfc1918' }]
  },
  cloud_und_apps: {
    md: md(
      '### Fünf Merkmale nach NIST',
      '1. **On-Demand Self-Service**: Ressourcen werden ohne menschliche Interaktion mit dem Anbieter bereitgestellt.',
      '2. **Broad Network Access**: Zugriff über Standardprotokolle vom Netz aus.',
      '3. **Resource Pooling**: Mehrere Kunden teilen sich gemeinsame Ressourcen.',
      '4. **Rapid Elasticity**: Kapazität lässt sich schnell hoch- und herunterskalieren.',
      '5. **Measured Service**: Nutzung wird gemessen und abgerechnet.',
      '',
      '### Servicemodelle und Bereitstellung',
      '- **Servicemodelle**: IaaS, PaaS, SaaS (je weiter rechts, desto mehr Verantwortung beim Anbieter).',
      '- **Bereitstellungsmodelle**: Public Cloud (für viele Kunden), Private Cloud (für eine Organisation), Hybrid Cloud (Kombination).',
      '',
      '### Geteilte Verantwortung',
      'Der Anbieter sichert Rechenzentrum, Hardware und Basisplattform. **Du bleibst verantwortlich** für Zugangsdaten, Konfiguration, Daten und Berechtigungen. Viele Vorfälle entstehen durch falsch konfigurierte, öffentlich zugängliche Speicher.',
      '',
      '### Risiken und Vertragsfragen',
      '- **Vendor-Lock-in**: Der Wechsel des Anbieters ist aufwendig, wenn proprietäre Dienste genutzt werden.',
      '- **SLA**: Zusagen zu Verfügbarkeit und Reaktionszeit, mit Gutschriften bei Verfehlung.',
      '- **Datenschutz**: Auftragsverarbeitungsvertrag, Speicherort (EU oder Drittland) und Zugriffsrechte klären.',
      '- **Kosten**: Pay-per-Use ist flexibel, kann ohne Überwachung aber teuer werden.'
    ),
    sources: [{ label: 'NIST SP 800-145: Definition of Cloud Computing', url: 'https://csrc.nist.gov/pubs/sp/800/145/final' }]
  },
  it_berufe: {
    md: md(
      '### Aufbau der Ausbildung',
      'Die duale Ausbildung findet im Betrieb und in der Berufsschule statt. Es gibt einen Ausbildungsvertrag und eine Probezeit von **ein bis vier Monaten**. Berufsschule läuft als wöchentlicher Unterricht oder in Blöcken, je nach Schule.',
      '',
      '### Gestreckte Abschlussprüfung',
      'Die Prüfung ist nach der Ausbildungsordnung von 2020 zweigeteilt:',
      '- **Teil 1** findet etwa in der Mitte der Ausbildung statt (z. B. der Teil „Einrichten eines IT-gestützten Arbeitsplatzes“, schriftlich, 90 Minuten) und fließt mit einem festgelegten Anteil in die Gesamtnote ein.',
      '- **Teil 2** am Ende besteht aus schriftlichen Prüfungsbereichen und der **betrieblichen Projektarbeit** mit Dokumentation, Präsentation und Fachgespräch.',
      '',
      'Gewichtung und Dauer unterscheiden sich je nach Fachrichtung. Die verbindlichen Angaben stehen in der Ausbildungsverordnung und im Leitfaden der zuständigen IHK.',
      '',
      '### Fachrichtungen im Überblick',
      '| Beruf | Schwerpunkt |',
      '|---|---|',
      '| Anwendungsentwicklung | Software planen, programmieren, testen |',
      '| Systemintegration | Netzwerke, Server, Arbeitsplätze, Betrieb |',
      '| Daten- und Prozessanalyse | Daten aufbereiten, auswerten, Prozesse verbessern |',
      '| Digitale Vernetzung | vernetzte Geräte und Anlagen (IoT) |',
      '| IT-System-Elektronik | Elektrotechnik und IT-Systeme verbinden |',
      '',
      '### Wie es danach weitergehen kann',
      'Fachkraft mit Spezialisierung, **Weiterbildung** (z. B. zum IT-Spezialisten oder Bachelor Professional), Studium (Informatik, Wirtschaftsinformatik) oder Selbstständigkeit.'
    ),
    sources: [
      { label: 'IHK Ulm: Prüfungsinhalte Fachinformatiker', url: 'https://www.ihk.de/ulm/hauptnavigation/ausbildungsbetriebe-azubis/beratung-und-infos/infos-fuer-ausbildungsbetriebe/pruefungsinhalte-und-ansprechpartner-berufe-a-z-/fachinformatiker-6955832' },
      { label: 'IHK Hagen: Abschlussprüfungen IT-Berufe', url: 'https://www.ihk.de/hagen/bildung/abschlusspruefungen/it-berufe-index-812540' }
    ]
  }
};

// ---------------------------------------------------------------- Architektur-Komponenten
export const ARCH_NODE_DEEPDIVES = {
  client: {
    md: md(
      '### Kommunikationsarten',
      '| Art | Eignung |',
      '|---|---|',
      '| REST über HTTP | Standard für Ressourcen und CRUD |',
      '| GraphQL | Client wählt die Felder, weniger Over- und Underfetching |',
      '| WebSocket | dauerhafte, bidirektionale Verbindung (Chat, Live-Daten) |',
      '',
      '### Rendering-Strategien',
      '**Single-Page-App (SPA)** lädt einmal und rendert im Browser, **Server-Side Rendering (SSR)** liefert fertiges HTML (schneller erster Eindruck, besser für Suchmaschinen).',
      '',
      '### Sicherheit und Performance',
      '- Tokens bevorzugt in **HttpOnly-Cookies** speichern, nicht in `localStorage` (dort für Skripte lesbar).',
      '- Fremde Herkunft braucht **CORS**-Freigaben auf dem Server.',
      '- Core Web Vitals messen die Nutzererfahrung: **LCP** (Ladezeit des größten Inhalts), **INP** (Reaktionszeit auf Eingaben) und **CLS** (Layoutsprünge).'
    ),
    sources: [{ label: 'web.dev: Core Web Vitals', url: 'https://web.dev/articles/vitals' }]
  },
  cdn: {
    md: md(
      '### Funktionsweise',
      'Ein CDN betreibt viele **Edge-Standorte** (Points of Presence). Eine Anfrage wird zum nächstgelegenen Standort geleitet. Hat dieser die Datei im Cache (**Cache-Hit**), antwortet er sofort, sonst holt er sie vom Ursprungsserver.',
      '',
      '### Steuerung über Header',
      '| Direktive | Wirkung |',
      '|---|---|',
      '| `max-age=3600` | Browser darf 1 Stunde ohne Nachfrage nutzen |',
      '| `s-maxage` | gilt für gemeinsame Caches wie das CDN |',
      '| `immutable` | Datei ändert sich nie, nicht erneut prüfen |',
      '| `no-store` | nicht zwischenspeichern |',
      '',
      '### Cache-Busting',
      'Statische Dateien erhalten einen Hash im Namen (`app.3f9a1c.js`). Bei Änderung entsteht ein neuer Name, alte Caches sind damit unproblematisch und können sehr lange gelten.',
      '',
      '### Weitere Vorteile und Risiken',
      '- Entlastung des Ursprungsservers, Schutz vor Lastspitzen und teils DDoS-Filter, TLS wird am Edge terminiert.',
      '- Kennzahl: **Cache-Hit-Ratio**.',
      '- Datenschutz beachten: Das CDN verarbeitet IP-Adressen der Besucher (Auftragsverarbeitung, Standort).'
    ),
    sources: [{ label: 'MDN: HTTP-Caching', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching' }]
  },
  gateway: {
    md: md(
      '### Aufgaben',
      'Routing, Authentifizierung, **Rate Limiting**, TLS-Terminierung, Protokollierung und Anfrage-Umformung gebündelt an einer Stelle. Ein reiner **Reverse Proxy** leitet nur weiter, ein **API Gateway** bietet zusätzlich API-spezifische Funktionen.',
      '',
      '### Lastverteilung',
      '- **Schicht 4** (TCP/UDP) verteilt nach IP und Port, sehr schnell. **Schicht 7** (HTTP) kann nach URL, Header oder Cookie entscheiden.',
      '- Verfahren: Round Robin, Least Connections, gewichtet, IP-Hash.',
      '- **Health Checks** entfernen defekte Instanzen. **Sticky Sessions** binden einen Nutzer an eine Instanz, behindern aber die Skalierung.',
      '',
      '### Rate Limiting',
      'Beim **Token-Bucket**-Verfahren füllt sich ein Eimer mit Tokens in fester Rate, jede Anfrage verbraucht eines, kurze Spitzen sind möglich. Bei Überschreitung antwortet der Server mit **HTTP 429**.',
      '',
      '### Typische Fehlercodes',
      '| Code | Bedeutung |',
      '|---|---|',
      '| 502 | Gateway bekam eine ungültige Antwort vom Dienst |',
      '| 503 | Dienst nicht verfügbar oder überlastet |',
      '| 504 | Dienst antwortete nicht rechtzeitig |',
      '',
      '### Hochverfügbarkeit',
      'Das Gateway selbst darf kein Single Point of Failure sein: mehrere Instanzen (Active-Active), gemeinsame virtuelle Adresse oder DNS-Verteilung.'
    ),
    sources: [{ label: 'NGINX Dokumentation: Load Balancing', url: 'https://nginx.org/en/docs/http/load_balancing.html' }]
  },
  user_service: {
    md: md(
      '### JSON Web Token (JWT)',
      'Ein JWT besteht aus `Header.Payload.Signature`, jeweils Base64URL-kodiert. Er ist **signiert, aber nicht verschlüsselt**: Jeder kann die Nutzdaten lesen. Lege deshalb keine Geheimnisse hinein. Der Server prüft die Signatur und die Gültigkeit (`exp`).',
      '',
      '### Tokens im Betrieb',
      '- **Access Token** mit kurzer Lebensdauer (Minuten), **Refresh Token** zum Erneuern, am besten mit **Rotation** (jedes Token nur einmal nutzbar).',
      '- Sitzungen mit serverseitigem Zustand lassen sich leicht widerrufen, rein zustandslose Tokens nur über Sperrlisten oder kurze Laufzeit.',
      '',
      '### Passwörter',
      'Speichere nur Hashes mit Salt, berechnet mit **Argon2id**, **bcrypt** oder **scrypt**. Ein zusätzliches serverseitiges Geheimnis (**Pepper**) erschwert Angriffe nach einem Datenbankdiebstahl.',
      '',
      '### Schutz vor Missbrauch',
      '- **Brute-Force**: Rate Limiting je Konto und IP, Verzögerung, Warnung bei Auffälligkeiten.',
      '- **MFA** für Administratoren und sensible Aktionen.',
      '- **RBAC**: Rechte hängen an Rollen, jede Rolle erhält nur das Nötigste (Least Privilege).'
    ),
    sources: [{ label: 'RFC 7519: JSON Web Token', url: 'https://www.rfc-editor.org/rfc/rfc7519' }]
  },
  payment_service: {
    md: md(
      '### Idempotenz',
      'Netzwerkfehler führen zu Wiederholungen. Jede Zahlungsanfrage trägt daher einen eindeutigen **Idempotenz-Schlüssel**. Kommt dieselbe Anfrage erneut, liefert der Dienst das gespeicherte Ergebnis, statt doppelt abzubuchen.',
      '',
      '### Konsistenz über mehrere Dienste',
      '- Verteilte ACID-Transaktionen über Dienste sind teuer und fehleranfällig.',
      '- Das **Saga-Muster** zerlegt den Ablauf in lokale Schritte mit **Kompensationen** (z. B. Zahlung erstatten, wenn der Versand scheitert).',
      '- Das **Outbox-Muster** schreibt Ereignis und Datenänderung in dieselbe lokale Transaktion und verschickt das Ereignis danach zuverlässig.',
      '',
      '### Sicherheit und Regeln',
      '- Kartendaten möglichst gar nicht selbst speichern, sondern über einen **Zahlungsdienstleister** mit **Tokenisierung** abwickeln. Das senkt den Aufwand nach dem Standard **PCI DSS** erheblich.',
      '- Jede Änderung wird nachvollziehbar protokolliert (Audit-Log, unveränderlich).',
      '- Gesetzliche Aufbewahrungsfristen für Belege (HGB, AO) und Datenschutz (Löschkonzept) müssen zusammenpassen.'
    ),
    sources: [{ label: 'PCI Security Standards Council', url: 'https://www.pcisecuritystandards.org/' }]
  },
  queue: {
    md: md(
      '### Queue oder Topic?',
      '- **Queue** (Punkt-zu-Punkt): Jede Nachricht wird von **einem** Konsumenten verarbeitet. Passend für Arbeitsaufträge.',
      '- **Topic** (Publish/Subscribe): Jede Nachricht erreicht **alle** Abonnenten. Passend für Ereignisse.',
      '',
      '### Zustellgarantien',
      '| Garantie | Bedeutung | Risiko |',
      '|---|---|---|',
      '| At-most-once | höchstens einmal | Nachrichten können verloren gehen |',
      '| At-least-once | mindestens einmal | Duplikate möglich |',
      '| Exactly-once | genau einmal | aufwendig, praktisch oft durch Idempotenz erreicht |',
      '',
      '### Fehlerbehandlung',
      '- **Retries** mit wachsender Wartezeit (Backoff).',
      '- **Dead-Letter-Queue**: Nachrichten, die wiederholt scheitern, landen dort zur Analyse, statt die Verarbeitung zu blockieren.',
      '- **Backpressure**: Ist der Konsument überlastet, muss der Fluss gedrosselt oder gepuffert werden.',
      '',
      '### Reihenfolge und Skalierung',
      'Eine globale Reihenfolge ist teuer. Systeme wie Kafka garantieren sie nur **innerhalb einer Partition**. **Consumer Groups** verteilen Partitionen auf mehrere Konsumenten.',
      '',
      '### Auswahl',
      '**RabbitMQ** ist ein klassischer Message Broker mit flexiblem Routing, **Kafka** ein verteiltes Log für hohe Datenmengen mit erneutem Lesen alter Ereignisse.'
    ),
    sources: [
      { label: 'RabbitMQ Dokumentation', url: 'https://www.rabbitmq.com/docs' },
      { label: 'Apache Kafka Dokumentation', url: 'https://kafka.apache.org/documentation/' }
    ]
  },
  cache: {
    md: md(
      '### Verdrängung und Ablauf',
      '- **TTL**: Einträge verfallen nach fester Zeit.',
      '- **LRU** (Least Recently Used) entfernt den am längsten ungenutzten Eintrag, **LFU** den am seltensten genutzten.',
      '',
      '### Typische Probleme',
      '| Problem | Ursache | Gegenmaßnahme |',
      '|---|---|---|',
      '| Cache Stampede | viele Anfragen laden nach Ablauf gleichzeitig denselben Wert | Sperre beim Nachladen, zufällige TTL-Streuung |',
      '| Cache Penetration | Anfragen nach nicht vorhandenen Schlüsseln umgehen den Cache | auch "nicht gefunden" kurz zwischenspeichern |',
      '| Veraltete Daten | Quelle ändert sich, Cache nicht | Invalidierung beim Schreiben, kurze TTL |',
      '',
      '### Redis',
      '- Datenstrukturen: String, Hash, Liste, Menge, sortierte Menge. Damit lassen sich auch Ranglisten, Zähler und Sitzungen abbilden.',
      '- Persistenz optional per Snapshot (**RDB**) oder Protokoll (**AOF**). Ein Cache darf trotzdem Daten verlieren, die Quelle bleibt die Datenbank.',
      '',
      '### Kennzahl und Sicherheit',
      'Die **Hit-Rate** zeigt den Nutzen. Ein Cache gehört nicht ins offene Netz: Zugriff nur aus dem internen Netz, mit Passwort oder ACL und TLS.'
    ),
    sources: [{ label: 'Redis Dokumentation', url: 'https://redis.io/docs/' }]
  },
  database: {
    md: md(
      '### Replikation',
      '- **Synchron**: Schreiben wird erst bestätigt, wenn auch das Replikat es hat. Sicher, aber langsamer.',
      '- **Asynchron**: Bestätigung sofort, das Replikat folgt mit Verzögerung. Schnell, bei Ausfall des Primary sind die letzten Änderungen gefährdet (Beitrag zum RPO).',
      '- Wegen der Replikationsverzögerung kann ein Nutzer direkt nach dem Schreiben auf einem Replikat noch den alten Stand sehen. Für solche Lesezugriffe nutzt man den Primary.',
      '',
      '### Skalierung der Datenbank',
      '- **Lesen**: Read-Replicas und Caching.',
      '- **Schreiben**: **Sharding** verteilt Daten nach einem Shard-Key auf mehrere Server. Das erschwert Joins und Transaktionen über Shards und verlangt eine gute Schlüsselwahl.',
      '- **Connection Pooling** begrenzt und verwendet Verbindungen wieder, weil viele offene Verbindungen den Server überlasten.',
      '',
      '### Ausfallsicherheit',
      '- **Failover**: automatischer Wechsel auf ein Replikat, mit Prüfung auf Split-Brain (zwei Server halten sich für den Primary).',
      '- **Backup** mit **Point-in-Time-Recovery** (Wiederherstellung auf einen Zeitpunkt über das Transaktionsprotokoll). Ein nie getestetes Backup ist kein Backup.',
      '',
      '### Betrieb',
      'Schemaänderungen als versionierte **Migrationen** durchführen, Zugriffe mit minimalen Rechten pro Dienst und Daten im Ruhezustand verschlüsseln.'
    ),
    sources: [{ label: 'PostgreSQL Dokumentation: Hochverfügbarkeit und Replikation', url: 'https://www.postgresql.org/docs/current/high-availability.html' }]
  },
  object_storage: {
    md: md(
      '### Datenmodell',
      'Ein Objekt besteht aus **Daten**, **Metadaten** und einem eindeutigen **Schlüssel** in einem **Bucket**. Der Namensraum ist flach, Ordner sind nur Namenspräfixe. Objekte werden komplett geschrieben, nicht in Teilen verändert.',
      '',
      '### Funktionen im Betrieb',
      '- **Versionierung** schützt vor versehentlichem Überschreiben und Löschen.',
      '- **Lifecycle-Regeln** verschieben ältere Objekte in günstigere Speicherklassen oder löschen sie nach Frist.',
      '- **Pre-signed URLs** geben zeitlich begrenzten Zugriff auf ein einzelnes Objekt, ohne es öffentlich zu machen.',
      '',
      '### Haltbarkeit ist nicht Verfügbarkeit',
      'Anbieter werben mit sehr hoher **Haltbarkeit** (z. B. elf Neunen), das beschreibt die Wahrscheinlichkeit, dass ein Objekt nicht verloren geht. Die **Verfügbarkeit** (Abrufbarkeit) ist niedriger und separat zugesichert.',
      '',
      '### Sicherheit',
      '- **Öffentlich lesbare Buckets** sind eine häufige Ursache von Datenlecks. Blockiere öffentlichen Zugriff standardmäßig.',
      '- Verschlüsselung **im Ruhezustand** und **bei der Übertragung**, Zugriffsrechte nach Least Privilege.',
      '',
      '### Wann nicht geeignet?',
      'Für häufige kleine Änderungen, Dateisystem-Semantik oder relationale Abfragen sind Blockspeicher, Dateisysteme oder Datenbanken besser.'
    ),
    sources: [{ label: 'Amazon S3 Dokumentation: Konzepte', url: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/Welcome.html' }]
  },
  observability: {
    md: md(
      '### Drei Säulen',
      '| Säule | Frage | Beispiel |',
      '|---|---|---|',
      '| **Metriken** | Wie gesund ist das System im Zeitverlauf? | Anfragen pro Sekunde, Fehlerrate |',
      '| **Logs** | Was ist genau passiert? | Fehlermeldung mit Zeitstempel |',
      '| **Traces** | Wohin ging eine Anfrage und wo dauerte es? | Weg durch mehrere Microservices |',
      '',
      '### Vier goldene Signale',
      'Latenz, Traffic, Fehler und Sättigung (Auslastung knapper Ressourcen) decken die wichtigsten Probleme eines Dienstes ab.',
      '',
      '### SLI, SLO, SLA',
      '- **SLI**: gemessener Wert, z. B. Anteil erfolgreicher Anfragen.',
      '- **SLO**: interne Zielvorgabe, z. B. 99,9 % in 30 Tagen.',
      '- **SLA**: vertragliche Zusage an Kunden, meist mit Folgen bei Verfehlung.',
      '- Das **Fehlerbudget** ist 100 % minus SLO. Bei 99,9 % sind das etwa 43 Minuten Ausfall in 30 Tagen.',
      '',
      '### Gute Praxis',
      '- **Strukturierte Logs** (z. B. JSON) mit Korrelations-ID erleichtern die Suche.',
      '- Alarme nur bei Auswirkungen auf Nutzer auslösen, sonst entsteht Alarmmüdigkeit.',
      '- **Keine personenbezogenen Daten oder Passwörter** in Logs, Aufbewahrungsdauer festlegen.'
    ),
    sources: [{ label: 'Google SRE Book: Monitoring Distributed Systems', url: 'https://sre.google/sre-book/monitoring-distributed-systems/' }]
  }
};

// ---------------------------------------------------------------- Fachthemen für SQL und Bash
export const LANGUAGE_EXTRA_TOPICS_REST = {
  sql: [
    {
      title: '6. Indizes & Ausführungsplan',
      desc: 'Ein Index beschleunigt Suche und Verknüpfung, kostet aber Speicher und Schreibleistung. Mit EXPLAIN prüfst du, ob die Datenbank ihn nutzt. Eine Funktion auf der Spalte in der WHERE-Bedingung verhindert meist die Indexnutzung.',
      code: md(
        'CREATE INDEX idx_kunde_stadt ON kunde (stadt);',
        '',
        '-- Ausführungsplan anzeigen (Syntax je nach System)',
        "EXPLAIN SELECT * FROM kunde WHERE stadt = 'Köln';",
        '',
        '-- Index wird oft NICHT genutzt, weil die Spalte in eine Funktion gepackt ist:',
        "SELECT * FROM kunde WHERE UPPER(stadt) = 'KÖLN';"
      )
    },
    {
      title: '7. Unterabfragen & Common Table Expressions (CTE)',
      desc: 'Mit WITH benennst du Zwischenergebnisse und machst komplexe Abfragen lesbar. Eine CTE ersetzt tief verschachtelte Unterabfragen.',
      code: md(
        'WITH umsatz AS (',
        '  SELECT kunde_id, SUM(summe) AS gesamt',
        '  FROM bestellung',
        '  GROUP BY kunde_id',
        ')',
        'SELECT k.name, u.gesamt',
        'FROM kunde k',
        'JOIN umsatz u ON u.kunde_id = k.kunde_id',
        'WHERE u.gesamt > 1000;'
      )
    },
    {
      title: '8. Rechte vergeben (DCL) & SQL-Injection verhindern',
      desc: 'Mit GRANT und REVOKE vergibst du Rechte nach dem Prinzip der minimalen Rechte. SQL-Injection entsteht, wenn Eingaben in den SQL-Text verkettet werden. Platzhalter (Prepared Statements) trennen Code und Daten.',
      code: md(
        '-- Rechte (PostgreSQL-Syntax)',
        'GRANT SELECT ON kunde TO lese_rolle;',
        'REVOKE DELETE ON kunde FROM lese_rolle;',
        '',
        '-- UNSICHER: Eingabe wird zu SQL-Text zusammengesetzt (Anwendungscode)',
        "--   \"SELECT * FROM nutzer WHERE name = '\" + eingabe + \"'\"",
        "--   Eingabe  ' OR '1'='1  liefert alle Zeilen",
        '',
        '-- SICHER: Platzhalter, Wert wird getrennt übergeben',
        'SELECT * FROM nutzer WHERE name = ?;'
      )
    }
  ],
  bash: [
    {
      title: '5. Funktionen, Argumente & Rückgabecodes',
      desc: "Skripte erhalten Argumente über $1, $2 und die Anzahl über $#. Jeder Befehl liefert einen Rückgabecode, 0 bedeutet Erfolg. Er steht in $? und steuert if und &&.",
      code: md(
        '#!/usr/bin/env bash',
        'set -euo pipefail',
        '',
        'pruefe_datei() {',
        '  local pfad="$1"',
        '  [ -r "$pfad" ]            # Rückgabecode 0, wenn lesbar',
        '}',
        '',
        'if [ "$#" -lt 1 ]; then',
        '  echo "Aufruf: $0 <datei>" >&2',
        '  exit 2',
        'fi',
        '',
        'if pruefe_datei "$1"; then echo "ok"; else echo "nicht lesbar"; exit 1; fi'
      )
    },
    {
      title: '6. Textverarbeitung: cut, sort, uniq, awk & sed',
      desc: 'Die klassischen Werkzeuge lesen Zeilen aus Dateien oder Pipes und lassen sich kombinieren. awk wertet Spalten aus, sed ersetzt Text.',
      code: md(
        '# Anzahl Anfragen je HTTP-Statuscode (Spalte 9 im Zugriffslog)',
        "awk '{print $9}' access.log | sort | uniq -c | sort -nr",
        '',
        '# Summe der 3. Spalte einer CSV-Datei',
        "awk -F, '{summe += $3} END {print summe}' umsatz.csv",
        '',
        '# Text in einer Datei ersetzen (Sicherung als .bak)',
        "sed -i.bak 's/alt/neu/g' config.txt"
      )
    },
    {
      title: '7. Aufräumen und Fehler melden mit trap',
      desc: 'Mit trap führst du bei Abbruch oder Fehler Aufräumcode aus, etwa das Löschen temporärer Dateien. Meldungen über Fehler gehören in die Standardfehlerausgabe (stderr).',
      code: md(
        '#!/usr/bin/env bash',
        'set -euo pipefail',
        '',
        'tmp="$(mktemp)"',
        'trap \'rm -f "$tmp"\' EXIT          # läuft immer beim Beenden',
        'trap \'echo "Fehler in Zeile $LINENO" >&2\' ERR',
        '',
        'curl -fsS https://example.org -o "$tmp"',
        'wc -c "$tmp"'
      )
    }
  ]
};

// ---------------------------------------------------------------- Karteikarten 1–20
export const FLASHCARD_MORE = {
  1: 'n Bits können 2^n Zustände darstellen. Ein Byte lässt sich mit zwei Hex-Ziffern schreiben (z. B. 0x41). Achtung bei Einheiten: 1 KiB = 1024 Byte, 1 kB = 1000 Byte; Netzraten werden in Bit pro Sekunde angegeben (100 Mbit/s = 12,5 MB/s).',
  2: 'Ein Primärschlüssel ist eindeutig und nie NULL, oft ein künstlicher Schlüssel (Auto-Increment oder UUID). Der Fremdschlüssel sichert die referenzielle Integrität; bei Löschung steuert ON DELETE (CASCADE, RESTRICT, SET NULL) das Verhalten. In n:m-Beziehungen besteht der Primärschlüssel der Zwischentabelle meist aus beiden Fremdschlüsseln.',
  3: 'Man unterscheidet reflektiertes, gespeichertes (persistentes) und DOM-basiertes XSS. Schutz: Ausgabe passend zum Kontext kodieren (Escaping), Content-Security-Policy setzen, Cookies mit HttpOnly markieren und Eingaben zusätzlich validieren. Nicht verwechseln mit CSRF, das Aktionen im Namen des Nutzers auslöst.',
  4: 'TCP nutzt Sequenznummern, Bestätigungen, Wiederholungen, Fluss- und Überlastkontrolle; der Header ist mindestens 20 Byte groß, der UDP-Header nur 8 Byte. HTTP/3 (QUIC) baut zuverlässige Übertragung auf UDP selbst auf.',
  5: 'Beispiele: 0 == "0" ist true, 0 === "0" ist false; null == undefined ist true, null === undefined ist false. NaN ist nie gleich sich selbst (Object.is(NaN, NaN) ist true). Empfehlung: immer === verwenden, ESLint prüft das mit der Regel eqeqeq.',
  6: 'Beteiligte Register: Befehlszähler (PC, zeigt auf den nächsten Befehl), Befehlsregister (IR) und Akkumulator. Durch Pipelining überlappen die Phasen mehrerer Befehle. Interrupts werden nach Abschluss des laufenden Befehls bearbeitet.',
  7: 'Entscheidend ist die Selektivität, dazu nutzt der Optimizer Statistiken (z. B. ANALYZE). Eine Funktion auf der Spalte (UPPER(name) = ...) verhindert die Indexnutzung. Bei zusammengesetzten Indizes zählt die Reihenfolge der Spalten (Präfixregel). Indizes kosten Speicher und Schreibleistung; mit EXPLAIN prüfst du den Plan.',
  8: 'Im HTTP-Kontext steht 401 für fehlende oder ungültige Authentifizierung, 403 für fehlende Berechtigung. Autorisierung geschieht rollenbasiert (RBAC) oder attributbasiert (ABAC). Die Faktoren der Authentifizierung sind Wissen, Besitz und Inhärenz; Rechte folgen dem Prinzip der minimalen Rechte.',
  9: 'Ein Image besteht aus schreibgeschützten Schichten (Layers); der Container ergänzt eine beschreibbare Schicht, die beim Löschen des Containers verschwindet. Dauerhafte Daten gehören in Volumes. Aus einem Image können beliebig viele Container starten; Tags können sich ändern, ein Digest identifiziert ein Image exakt.',
  10: 'Das RPO bestimmt das Sicherungsintervall (stündliche Snapshots ergeben ein RPO von höchstens einer Stunde). Das RTO bestimmt die Architektur: Cold-, Warm- oder Hot-Standby. Je kleiner beide Werte, desto höher die Kosten. Grundlage ist die Business-Impact-Analyse (BIA).',
  11: 'Vorgehen: Kriterien festlegen, Gewichte vergeben (Summe 100 %), Bewertungsskala wählen (z. B. 0 bis 10), Nutzwert = Summe aus Gewicht mal Punkte, danach Sensitivitätsanalyse. Die Gewichtung ist subjektiv und muss begründet und dokumentiert werden, etwa im Projektantrag.',
  12: 'Der kleinste Datenträger bestimmt die nutzbare Größe je Platte. Schreibzugriffe kosten bei RAID 5 etwa 4, bei RAID 6 etwa 6 E/A-Operationen (Write Penalty). Bei großen Platten ist die Rebuild-Zeit lang und das Risiko eines zweiten Fehlers hoch, daher ist RAID 6 dort verbreitet. Hot-Spare-Platten verkürzen die Reaktionszeit. RAID ersetzt kein Backup.',
  13: 'Vorgehen: Subnetze nach Größe absteigend sortieren, jedes mit dem kleinsten passenden Präfix versehen und die Adressblöcke lückenlos aneinanderreihen. Beispiel für 192.168.1.0/24: 100 Hosts ergeben /25 (…0), 50 Hosts /26 (…128), 10 Hosts /28 (…192), eine Router-Verbindung /30 (…208).',
  14: 'Die Isolation wird in Stufen angeboten: Read Uncommitted, Read Committed, Repeatable Read und Serializable. Sie verhindern schrittweise Anomalien wie Dirty Read, Non-Repeatable Read und Phantom Read. Das Write-Ahead-Log sichert die Dauerhaftigkeit. NoSQL-Systeme setzen oft auf BASE statt ACID.',
  15: 'In der Praxis nutzt man Hybridverfahren: TLS tauscht den Schlüssel asymmetrisch aus und verschlüsselt die Daten symmetrisch (schneller). Vergleichbare Sicherheit: RSA mit 3072 Bit entspricht etwa AES-128; elliptische Kurven (ECC) erreichen sie mit kürzeren Schlüsseln. Digitale Signaturen nutzen den privaten Schlüssel des Absenders.',
  16: 'Berechnung mit Vorwärts- (FAZ, FEZ) und Rückwärtsrechnung (SAZ, SEZ). Der freie Puffer ist höchstens so groß wie der Gesamtpuffer. Es kann mehrere kritische Pfade geben. Zur Verkürzung dienen Crashing (mehr Ressourcen) und Fast Tracking (Vorgänge parallelisieren).',
  17: 'Höherrangiges Recht geht niederrangigem vor; abgewichen werden darf nur zugunsten des Arbeitnehmers (Günstigkeitsprinzip). Regelungen, die üblicherweise durch Tarifvertrag getroffen werden, können grundsätzlich nicht Gegenstand einer Betriebsvereinbarung sein (Tarifvorrang nach § 77 Abs. 3 BetrVG).',
  18: 'Die Anfrage geht als Broadcast ("Wer hat 192.168.1.1?"), die Antwort als Unicast. Die Zuordnungen stehen im ARP-Cache (arp -a). ARP-Spoofing täuscht falsche Zuordnungen vor (Man-in-the-Middle); Gegenmittel sind Dynamic ARP Inspection und Port Security. IPv6 nutzt stattdessen das Neighbor Discovery Protocol (NDP).',
  19: 'Horizontale Skalierung setzt zustandslose Dienste voraus (Sitzungen in Cache oder Datenbank). Datenbanken skalieren das Lesen über Replikate, das Schreiben über Sharding. Vertikale Skalierung hat eine Obergrenze und bleibt ein einzelner Ausfallpunkt. Cloud-Dienste bieten Auto-Scaling.',
  20: 'Bei einer Million sortierter Elemente braucht die binäre Suche höchstens etwa 20 Schritte (log2 von 10^6 ist rund 19,9). Quicksort ist im Mittel O(n log n), im ungünstigsten Fall O(n²); Bubblesort ist O(n²). Eine Hashtabelle liefert im Mittel O(1). Big-O beschreibt das Wachstum, nicht die absolute Zeit.'
};
