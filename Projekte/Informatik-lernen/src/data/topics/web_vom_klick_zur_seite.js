/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Eine URL in Schema, Host, Port, Pfad, Query und Fragment zerlegen',
    'Die Namensauflösung per DNS und die wichtigsten Record-Typen erklären',
    'Den Ablauf aus TCP-Handshake, TLS-Handshake und HTTP-Anfrage in der richtigen Reihenfolge beschreiben',
    'HTTP-Methoden und Statuscodes zuordnen und Fehler mit nslookup, curl und den Browser-Entwicklertools eingrenzen'
  ],
  content: `
## Was passiert beim Aufruf einer Webseite?

Du gibst \`https://example.org/index.html\` ein und drückst Enter. Wenige hundert Millisekunden später steht die Seite da. Dazwischen laufen mehrere Schritte ab, die jeweils in einer eigenen Schicht des Netzwerks arbeiten. Wer sie kennt, kann bei „Die Seite lädt nicht“ gezielt suchen, statt zu raten.

1. Der Browser **zerlegt die URL**.
2. Ein **DNS**-Server liefert die IP-Adresse zum Namen.
3. Es wird eine **TCP**-Verbindung aufgebaut (Dreiwege-Handshake).
4. Bei \`https\` folgt der **TLS**-Handshake zur Verschlüsselung.
5. Der Browser sendet die **HTTP**-Anfrage, der Server antwortet.
6. Der Browser **baut die Seite auf** und lädt weitere Dateien nach.

![Ablauf einer Webanfrage als Sequenzdiagramm](webanfrage-ablauf.svg "DNS, TCP, TLS und HTTP laufen nacheinander ab, bevor das erste Byte der Seite ankommt")

## Aufbau einer URL

Eine **URL** (*Uniform Resource Locator*) adressiert eine Ressource im Netz:

\`https://shop.example.org:8443/produkte/liste?kat=pc&seite=2#preise\`

| Teil | Beispiel | Bedeutung |
| :--- | :--- | :--- |
| Schema | \`https\` | Protokoll, bestimmt auch den Standardport |
| Host | \`shop.example.org\` | Rechnername, besteht aus Subdomain \`shop\`, Domain \`example\` und Top-Level-Domain \`org\` |
| Port | \`8443\` | wird nur angegeben, wenn er vom Standard abweicht |
| Pfad | \`/produkte/liste\` | welche Ressource auf dem Server |
| Query | \`kat=pc&seite=2\` | Parameter, mit \`?\` eingeleitet, getrennt durch \`&\` |
| Fragment | \`preise\` | Sprungmarke im Dokument, wird **nicht** an den Server gesendet |

Standardports: **HTTP 80**, **HTTPS 443**, **DNS 53**. Sonderzeichen in einer URL werden prozentkodiert (*Percent-Encoding*): Ein Leerzeichen wird \`%20\`, „ä“ in UTF-8 wird \`%C3%A4\`.

## DNS: vom Namen zur IP-Adresse

Rechner finden sich über **IP-Adressen**, Menschen merken sich **Namen**. Das **Domain Name System (DNS)** ist das verteilte Telefonbuch dazwischen. Der Browser fragt zunächst seinen **Cache**, dann den des Betriebssystems und dann den konfigurierten **DNS-Resolver** (meist der Router oder der Provider). Kennt der Resolver die Antwort nicht, fragt er schrittweise nach:

1. einen **Root-Nameserver**: Er kennt die Server der Top-Level-Domain \`.org\`.
2. den **TLD-Nameserver**: Er kennt die zuständigen Server von \`example.org\`.
3. den **autoritativen Nameserver** der Domain: Er liefert die endgültige Antwort.

Der Resolver merkt sich die Antwort für die Dauer der **TTL** (*Time to Live*, in Sekunden). Deshalb dauert eine DNS-Änderung oft Stunden, bis sie überall sichtbar ist. Wer vor einem Umzug die TTL senkt, verkürzt diese Übergangszeit.

| Record | Inhalt | Beispiel |
| :--- | :--- | :--- |
| **A** | IPv4-Adresse | \`example.org → 192.0.2.10\` (Dokumentationsbeispiel) |
| **AAAA** | IPv6-Adresse | \`example.org → 2001:db8::10\` (Dokumentationsbeispiel) |
| **CNAME** | Alias auf einen anderen Namen | \`www → example.org\` |
| **MX** | Mailserver der Domain (mit Priorität) | \`10 mail.example.org\` |
| **TXT** | Freitext, z. B. für SPF und Domain-Bestätigung | \`v=spf1 …\` |
| **NS** | zuständige Nameserver | \`ns1.example.org\` |

## TCP: die Verbindung aufbauen

HTTP braucht eine zuverlässige Verbindung und nutzt dafür **TCP**. Der **Dreiwege-Handshake** läuft so ab:

1. Der Client sendet **SYN** („Ich möchte verbinden, meine Startnummer ist …“).
2. Der Server antwortet **SYN-ACK** („Einverstanden, meine Startnummer ist …“).
3. Der Client bestätigt mit **ACK**. Ab hier können Daten fließen.

Ist der Zielport geschlossen, antwortet der Server mit **RST** („Connection refused“). Kommt gar keine Antwort, weil eine Firewall Pakete stillschweigend verwirft, endet der Versuch mit einem **Timeout**. Diese beiden Fehlerbilder lassen sich also unterscheiden.

## TLS: die Verbindung absichern

Bei \`https\` folgt auf TCP der **TLS-Handshake**. Er erledigt drei Dinge:

- **Authentifizierung**: Der Server beweist mit einem **Zertifikat**, dass er wirklich \`example.org\` ist. Der Browser prüft die Zertifikatskette bis zu einer vertrauenswürdigen Zertifizierungsstelle (CA), den Namen und die Gültigkeitsdauer.
- **Schlüsselaustausch**: Beide Seiten einigen sich auf einen gemeinsamen Sitzungsschlüssel, ohne ihn offen zu übertragen.
- **Verschlüsselung und Integrität**: Alle weiteren Daten sind verschlüsselt und gegen Veränderung geschützt.

TLS 1.3 benötigt dafür nur **eine Round-Trip-Zeit** (TLS 1.2: zwei). Eine Zertifikatswarnung bedeutet meist: abgelaufenes Zertifikat, falscher Hostname oder unbekannte CA.

## HTTP: Anfrage und Antwort

**HTTP** ist ein textbasiertes Anfrage-Antwort-Protokoll. Der Client sendet einen Request, der Server genau eine Response:

\`\`\`http
GET /index.html HTTP/1.1
Host: example.org
Accept: text/html
User-Agent: Mozilla/5.0

HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: max-age=3600

<!doctype html> …
\`\`\`

Eine Anfrage besteht aus **Startzeile** (Methode, Pfad, Version), **Headern** und optionalem **Body**. Eine Antwort enthält **Statuscode**, Header und Body.

| Methode | Zweck | Hat Body | Idempotent |
| :--- | :--- | :---: | :---: |
| GET | Ressource lesen | nein | ja |
| POST | Neue Ressource anlegen, Daten verarbeiten | ja | nein |
| PUT | Ressource vollständig ersetzen | ja | ja |
| PATCH | Ressource teilweise ändern | ja | nein |
| DELETE | Ressource löschen | meist nein | ja |

*Idempotent* heißt: Mehrfaches Senden hat dieselbe Wirkung wie einmaliges. Ein doppelter POST kann dagegen zwei Bestellungen auslösen.

### Statuscodes

| Klasse | Bedeutung | Wichtige Codes |
| :--- | :--- | :--- |
| 1xx | Information | 101 Switching Protocols (WebSocket) |
| 2xx | Erfolg | 200 OK, 201 Created, 204 No Content |
| 3xx | Umleitung | 301 Moved Permanently, 302 Found, 304 Not Modified |
| 4xx | Fehler des Clients | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests |
| 5xx | Fehler des Servers | 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout |

> [!tip] 401 oder 403?
> **401** heißt „nicht angemeldet“ (Anmeldung fehlt oder ist ungültig). **403** heißt „angemeldet, aber nicht berechtigt“. Ein **502** oder **504** entsteht meist hinter einem Reverse Proxy oder Load Balancer, wenn der dahinterliegende Anwendungsserver nicht oder zu langsam antwortet.

## Die Seite entsteht im Browser

Das HTML-Dokument ist erst der Anfang. Der Browser liest es und baut daraus den **DOM-Baum**, lädt das verlinkte **CSS** und **JavaScript** und die Bilder nach und berechnet dann das Layout. Moderne Seiten bestehen aus **dutzenden bis hunderten Anfragen**. Deshalb gibt es Beschleunigungsverfahren:

- **Caching**: Mit \`Cache-Control\` darf der Browser Dateien wiederverwenden. Bei \`304 Not Modified\` spart sich der Server die Übertragung.
- **CDN** (*Content Delivery Network*): Statische Dateien liegen auf Servern nahe beim Nutzer.
- **HTTP/2** bündelt viele Anfragen in einer Verbindung. **HTTP/3** nutzt dafür QUIC über UDP und vermeidet so den Stau, den ein verlorenes TCP-Paket verursacht.
- **Cookies** speichern kleine Datenmengen im Browser und senden sie bei jeder Anfrage mit. Darüber erkennt der Server eine angemeldete Sitzung wieder (\`Set-Cookie\`). Für Sitzungscookies gehören \`Secure\`, \`HttpOnly\` und \`SameSite\` dazu.

## Fehler eingrenzen: Werkzeuge

Gehe von unten nach oben vor, also Netz, Name, Verbindung, Anwendung:

| Frage | Werkzeug | Aufruf |
| :--- | :--- | :--- |
| Wird der Name aufgelöst? | nslookup, dig | \`nslookup example.org\`, \`dig example.org A\` |
| Ist der Host erreichbar? | ping, traceroute | \`ping example.org\`, \`tracert example.org\` (Windows), \`traceroute\` (Linux) |
| Was antwortet der Server? | curl | \`curl -I https://example.org\` (nur Header), \`curl -v\` (Verbindungsdetails) |
| Welche Anfragen lädt die Seite? | Browser-Entwicklertools | Taste F12, Reiter *Netzwerk*: Statuscode, Dauer, Header |

> [!exam] Prüfungstipp
> Typische Aufgabe: „Ein Anwender meldet, die Webseite sei nicht erreichbar. Beschreibe die Fehlersuche.“ Gute Antwort: Fehlermeldung erfragen, \`ping\` auf die IP (Netz?), \`nslookup\` auf den Namen (DNS?), \`curl -v\` oder Browser-Port-Test auf 443 (Firewall, Dienst?), Statuscode beachten (4xx Client, 5xx Server), danach Logdateien des Servers prüfen.
`,
  codeSnippet: `# Header einer Webseite abrufen
curl -I https://example.org

# Ausführlich: DNS, TCP, TLS und HTTP sichtbar machen
curl -v https://example.org -o /dev/null

# DNS-Einträge abfragen
nslookup example.org
dig example.org MX +short

# Nur den Statuscode ausgeben
curl -s -o /dev/null -w "%{http_code}\\n" https://example.org`,
  codeLanguage: 'Shell',
  exercises: [
    {
      id: 'url-zerlegen',
      title: 'URL zerlegen',
      prompt: 'Zerlege `https://shop.example.org:8443/produkte/liste?kat=pc&seite=2#preise` in Schema, Host, Port, Pfad, Query und Fragment. Welcher Teil wird nicht an den Server gesendet, und welcher Port würde ohne Angabe verwendet?',
      solution: 'Schema: `https`. Host: `shop.example.org` (Subdomain `shop`, Domain `example.org`). Port: `8443`. Pfad: `/produkte/liste`. Query: `kat=pc&seite=2`. Fragment: `preise`.\n\nDas **Fragment** bleibt im Browser und wird nicht an den Server gesendet. Ohne Portangabe würde bei `https` der Standardport **443** genutzt.'
    },
    {
      id: 'roundtrips-rechnen',
      title: 'Wartezeit bis zum ersten Byte',
      prompt: 'Die Round-Trip-Zeit (RTT) zum Server beträgt 40 ms, zum DNS-Resolver ebenfalls 40 ms. Berechne vereinfacht die Wartezeit bis zur ersten HTTP-Antwort ohne DNS-Cache bei (a) HTTPS mit TLS 1.3 und (b) HTTPS mit TLS 1.2. Gib die Zahl der Round-Trips an und nenne eine Maßnahme, die Zeit spart.',
      hints: ['Zähle: DNS-Abfrage, TCP-Handshake, TLS-Handshake, HTTP-Anfrage/Antwort. Verarbeitungszeit auf dem Server bleibt unberücksichtigt.'],
      solution: '(a) TLS 1.3: DNS 1 + TCP 1 + TLS 1 + HTTP 1 = **4 Round-Trips**, also 4 · 40 ms = **160 ms**.\n\n(b) TLS 1.2 braucht 2 Round-Trips: 1 + 1 + 2 + 1 = **5 Round-Trips**, also **200 ms**.\n\nZeit sparen: DNS-Caching, bestehende Verbindungen wiederverwenden (Keep-Alive, HTTP/2), TLS 1.3, ein CDN nahe beim Nutzer oder HTTP/3 (verbindet TCP und TLS in einem Schritt).'
    },
    {
      id: 'statuscodes-zuordnen',
      title: 'Statuscodes deuten',
      prompt: 'Welcher Statuscode passt, und wo suchst du zuerst die Ursache?\n\n(a) Ein Nutzer ruft eine Admin-Seite auf, ist angemeldet, hat aber keine Admin-Rechte.\n(b) Hinter dem Load Balancer ist der Anwendungsserver abgestürzt.\n(c) Die Seite wurde dauerhaft auf eine neue Adresse verschoben.\n(d) Die URL enthält einen Tippfehler im Pfad.',
      solution: '(a) **403 Forbidden**: Rechte und Rollen prüfen.\n\n(b) **502 Bad Gateway** (oder 503/504): Zustand und Logs des Anwendungsservers, Health-Check des Load Balancers.\n\n(c) **301 Moved Permanently** mit `Location`-Header auf die neue URL; Suchmaschinen übernehmen die neue Adresse.\n\n(d) **404 Not Found**: Pfad und Routing prüfen. Es liegt ein Clientfehler (4xx) vor, am Server ist nichts defekt.'
    },
    {
      id: 'fehlersuche-webseite',
      title: 'Fehlersuche „Seite nicht erreichbar“',
      prompt: 'Ein Kollege meldet, dass `intranet.firma.example` nicht lädt. Beschreibe die Fehlersuche in fünf Schritten und ordne drei Fehlerbilder der wahrscheinlichen Ursache zu: (1) „Server nicht gefunden“, (2) „Verbindung abgelehnt“, (3) Zertifikatswarnung.',
      solution: 'Vorgehen: (1) Meldung und Zeitpunkt erfragen, andere Seiten testen. (2) `ping` auf die IP des Servers (Netz). (3) `nslookup intranet.firma.example` (DNS). (4) `curl -v https://intranet.firma.example` oder Portprüfung auf 443 (Dienst, Firewall, TLS). (5) Statuscode und Server-Logs auswerten.\n\nFehlerbilder: (1) **Namensauflösung** schlägt fehl, also DNS-Eintrag fehlt oder falscher Resolver. (2) Der Server antwortet mit RST, also **Dienst läuft nicht** oder lauscht auf einem anderen Port. (3) Zertifikat **abgelaufen**, Hostname passt nicht oder die ausstellende CA ist dem Client unbekannt (häufig bei internen CAs).'
    }
  ],
  quiz: [
    {
      question: 'In welcher Reihenfolge läuft der Aufbau einer HTTPS-Verbindung ab?',
      options: [
        'TLS, TCP, DNS, HTTP',
        'DNS, TCP, TLS, HTTP',
        'HTTP, DNS, TCP, TLS',
        'TCP, DNS, HTTP, TLS'
      ],
      correct: 1,
      explanation: 'Erst wird der Name aufgelöst (DNS), dann die TCP-Verbindung aufgebaut, dann TLS ausgehandelt und erst danach die verschlüsselte HTTP-Anfrage gesendet.'
    },
    {
      question: 'Welcher DNS-Record ordnet einem Namen eine IPv4-Adresse zu?',
      options: ['MX', 'CNAME', 'A', 'AAAA'],
      correct: 2,
      explanation: 'Der A-Record liefert IPv4, der AAAA-Record IPv6. Ein CNAME ist ein Alias und MX nennt den Mailserver.'
    },
    {
      question: 'Was bedeutet der Statuscode 404?',
      options: [
        'Der Server hat einen internen Fehler',
        'Die angeforderte Ressource wurde nicht gefunden',
        'Der Zugriff ist ohne Berechtigung verboten',
        'Die Ressource wurde dauerhaft verschoben'
      ],
      correct: 1,
      explanation: '404 Not Found ist ein Fehler der Klasse 4xx, die URL passt zu keiner Ressource. Verboten wäre 403, verschoben 301, interner Fehler 500.'
    },
    {
      question: 'Welche Aussage zum Fragment einer URL (Teil nach #) ist richtig?',
      options: [
        'Es wird als Parameter an den Server gesendet',
        'Es bleibt im Browser und wird nicht an den Server übertragen',
        'Es legt den Port fest',
        'Es enthält das Passwort'
      ],
      correct: 1,
      explanation: 'Das Fragment dient dem Browser als Sprungmarke im geladenen Dokument und ist nicht Teil der HTTP-Anfrage.'
    },
    {
      question: 'Ein Nutzer ist angemeldet, darf eine Seite aber nicht öffnen. Welcher Statuscode passt?',
      options: ['401 Unauthorized', '403 Forbidden', '404 Not Found', '503 Service Unavailable'],
      correct: 1,
      explanation: '403 bedeutet „bekannt, aber nicht berechtigt“. 401 steht für fehlende oder ungültige Anmeldung.'
    },
    {
      question: 'Was passiert im TCP-Dreiwege-Handshake nach dem SYN des Clients?',
      options: [
        'Der Server sendet ein SYN-ACK, danach bestätigt der Client mit ACK',
        'Der Server sendet sofort die Webseite',
        'Der Client sendet ein weiteres SYN',
        'Der Server sendet ein Zertifikat'
      ],
      correct: 0,
      explanation: 'SYN, SYN-ACK, ACK: Danach ist die Verbindung aufgebaut. Das Zertifikat folgt erst im TLS-Handshake.'
    },
    {
      question: 'Welche Port-Nummer nutzt HTTPS standardmäßig?',
      options: ['80', '53', '443', '8080'],
      correct: 2,
      explanation: 'HTTPS nutzt Port 443, HTTP Port 80 und DNS Port 53. Port 8080 ist nur ein häufig genutzter Alternativport.'
    }
  ],
  relatedLabs: [
    { id: 'dns_http_lab', label: 'DNS und HTTP im Zusammenspiel' },
    { id: 'tls_handshake_lab', label: 'TLS-Handshake' }
  ],
  sources: [
    { title: 'MDN Web Docs: Was ist eine URL?', url: 'https://developer.mozilla.org/de/docs/Learn_web_development/Howto/Web_mechanics/What_is_a_URL', note: 'Aufbau einer URL' },
    { title: 'MDN Web Docs: HTTP-Statuscodes', url: 'https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status', note: 'Alle Statuscodes mit Erklärung' },
    { title: 'RFC 9110: HTTP Semantics', url: 'https://www.rfc-editor.org/rfc/rfc9110', note: 'Methoden, Statuscodes, Idempotenz' },
    { title: 'RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.3', url: 'https://www.rfc-editor.org/rfc/rfc8446', note: 'Handshake in einer Round-Trip-Zeit' },
    { title: 'RFC 1034: Domain Names – Concepts and Facilities', url: 'https://www.rfc-editor.org/rfc/rfc1034', note: 'Grundlagen des DNS' }
  ],
  sourcesCheckedOn: '26.11.2026'
};
