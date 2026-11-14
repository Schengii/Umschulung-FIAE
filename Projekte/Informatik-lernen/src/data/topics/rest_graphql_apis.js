/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Den Aufbau von HTTP-Anfrage und -Antwort beschreiben',
    'HTTP-Methoden nach „sicher“ und „idempotent“ einordnen und passende Statuscodes wählen',
    'Eine REST-Schnittstelle mit sinnvollen Ressourcen-URIs entwerfen',
    'REST, GraphQL und gRPC nach Einsatzzweck vergleichen und Authentifizierungsverfahren einordnen'
  ],
  content: `
## HTTP in Kürze

**HTTP** (*Hypertext Transfer Protocol*) ist ein **zustandsloses** Anfrage-Antwort-Protokoll: Der Client schickt eine **Request**, der Server antwortet mit einer **Response**. Jede Anfrage steht für sich; Zustand (z. B. „angemeldet“) wird über Cookies oder Tokens mitgeschickt. HTTP/1.1 und HTTP/2 laufen über TCP, **HTTP/3** über **QUIC** auf UDP. Mit TLS verschlüsselt heißt es **HTTPS**.

![Aufbau einer HTTP-Anfrage und -Antwort](http-anfrage.svg "Startzeile, Header, Leerzeile und Body")

## Methoden

| Methode | Zweck | sicher | idempotent | Body |
| :--- | :--- | :---: | :---: | :---: |
| **GET** | Ressource lesen | ✓ | ✓ | nein |
| **HEAD** | wie GET, nur Header | ✓ | ✓ | nein |
| **POST** | neue Ressource anlegen, Aktion auslösen | ✗ | ✗ | ja |
| **PUT** | Ressource **vollständig** ersetzen (oder unter bekannter URI anlegen) | ✗ | ✓ | ja |
| **PATCH** | Ressource **teilweise** ändern | ✗ | ✗ (meist) | ja |
| **DELETE** | Ressource löschen | ✗ | ✓ | selten |
| **OPTIONS** | erlaubte Methoden abfragen (CORS-Preflight) | ✓ | ✓ | nein |

- **Sicher** (*safe*): ändert nichts auf dem Server. Suchmaschinen und Browser dürfen solche Anfragen jederzeit wiederholen oder vorab laden.
- **Idempotent**: Mehrfaches Ausführen hat **dieselbe Wirkung** wie einmaliges. Ein zweites \`DELETE /kunden/7\` löscht nichts mehr, ein zweites \`POST /kunden\` legt aber einen zweiten Kunden an. Darum darf ein Client nach einem Zeitüberlauf idempotente Anfragen gefahrlos wiederholen.

## Statuscodes

| Klasse | Bedeutung | wichtige Codes |
| :--- | :--- | :--- |
| 1xx | Information | 101 Switching Protocols (z. B. WebSocket) |
| 2xx | Erfolg | **200 OK**, **201 Created** (mit \`Location\`-Header), **204 No Content** |
| 3xx | Umleitung | **301** Moved Permanently, **302** Found, **304 Not Modified** (Cache noch gültig) |
| 4xx | Fehler des **Clients** | **400** Bad Request, **401** Unauthorized, **403** Forbidden, **404** Not Found, **409** Conflict, **422** Unprocessable Content, **429** Too Many Requests |
| 5xx | Fehler des **Servers** | **500** Internal Server Error, **502** Bad Gateway, **503** Service Unavailable, **504** Gateway Timeout |

> [!exam] 401 oder 403?
> **401 Unauthorized** heißt eigentlich „nicht authentifiziert“: Wer du bist, ist unbekannt oder das Token ist abgelaufen – bitte anmelden. **403 Forbidden** heißt: Wir wissen, wer du bist, aber du darfst das nicht.

## REST

**REST** (*Representational State Transfer*, Roy Fielding, 2000) ist ein Architekturstil. Seine wichtigsten Prinzipien:

1. **Ressourcen** werden über eindeutige URIs adressiert (Substantive, keine Verben).
2. **Einheitliche Schnittstelle**: Die HTTP-Methoden bestimmen die Aktion.
3. **Zustandslosigkeit**: Jede Anfrage enthält alle nötigen Informationen.
4. **Repräsentationen**: Dieselbe Ressource kann als JSON, XML oder HTML geliefert werden (\`Accept\`-Header).
5. **Cachebarkeit**: Antworten geben an, ob und wie lange sie zwischengespeichert werden dürfen.
6. **Client-Server-Trennung** und **Schichtenarchitektur** (Proxies, Load Balancer dazwischen sind möglich).

### Gutes Ressourcen-Design

| Aktion | Anfrage | Antwort |
| :--- | :--- | :--- |
| alle Kunden (seitenweise) | \`GET /api/v1/kunden?seite=2&limit=50\` | 200 + Liste |
| ein Kunde | \`GET /api/v1/kunden/815\` | 200 oder 404 |
| Kunde anlegen | \`POST /api/v1/kunden\` | 201 + \`Location: /api/v1/kunden/815\` |
| Adresse ändern | \`PATCH /api/v1/kunden/815\` | 200 oder 204 |
| Kunde löschen | \`DELETE /api/v1/kunden/815\` | 204 |
| Bestellungen eines Kunden | \`GET /api/v1/kunden/815/bestellungen\` | 200 |

Schlecht wäre: \`GET /api/getKunde?id=815\` oder \`POST /api/deleteKunde\` – Verben gehören in die Methode, nicht in den Pfad. Die **Versionsnummer** (\`/v1/\`) erlaubt spätere, inkompatible Änderungen, ohne bestehende Clients zu brechen.

Dokumentiert werden REST-APIs meist mit **OpenAPI** (früher Swagger) – einer maschinenlesbaren Beschreibung, aus der sich Dokumentation, Tests und Client-Code erzeugen lassen.

## Authentifizierung

| Verfahren | Funktionsweise | Hinweis |
| :--- | :--- | :--- |
| API-Key | fester Schlüssel im Header | einfach, für Server-zu-Server; nie im Frontend-Code |
| Session-Cookie | Server merkt sich die Sitzung, Browser schickt Cookie | klassisch für Webseiten, CSRF beachten |
| Bearer-Token (JWT) | signiertes Token im \`Authorization\`-Header | zustandslos prüfbar; kurze Laufzeit, Widerruf schwierig |
| OAuth 2.0 / OpenID Connect | Autorisierung über einen Identity Provider („Mit Google anmelden“) | Authorization Code Flow mit PKCE |

## GraphQL

**GraphQL** (2015 von Facebook veröffentlicht) bietet **einen** Endpunkt, an den der Client eine Abfrage schickt, die **genau** die gewünschten Felder beschreibt:

\`\`\`graphql
query {
  kunde(id: 815) {
    name
    bestellungen(letzte: 3) {
      datum
      summe
    }
  }
}
\`\`\`

Damit löst GraphQL zwei REST-Probleme:

- **Overfetching**: REST liefert oft mehr Felder, als der Client braucht.
- **Underfetching**: Für eine Ansicht sind bei REST mehrere Anfragen nötig (Kunde, dann Bestellungen …).

Nachteile: HTTP-Caching ist schwieriger (meist nur POST an einen Endpunkt), komplexe Abfragen können den Server überlasten (Tiefe und Kosten begrenzen), und schlecht gebaute Resolver erzeugen das **N+1-Problem** (pro Element eine eigene Datenbankabfrage).

## gRPC

**gRPC** (Google) ruft Funktionen auf einem entfernten Server auf, als wären sie lokal (*Remote Procedure Call*). Schnittstellen werden in **Protocol Buffers** (\`.proto\`) beschrieben, übertragen wird **binär über HTTP/2**. Das ist kompakt und schnell, unterstützt Streaming in beide Richtungen und erzeugt typisierten Client-Code. Browser können gRPC nur über einen Proxy (gRPC-Web) nutzen – darum findet man es vor allem **zwischen Microservices**.

| | REST | GraphQL | gRPC |
| :--- | :--- | :--- | :--- |
| Format | meist JSON | JSON | binär (Protobuf) |
| Endpunkte | viele (je Ressource) | einer | Methoden je Service |
| Caching | einfach (HTTP) | aufwendig | eigenes |
| Stärke | einfach, verbreitet | flexible Abfragen für Frontends | Leistung zwischen Diensten |
`,
  codeSnippet: `# REST-API mit curl testen
curl -s https://api.example.com/v1/kunden/815 -H "Accept: application/json"

curl -s -X POST https://api.example.com/v1/kunden \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $TOKEN" \\
  -d '{"name": "Meyer", "plz": "44137"}' \\
  -i            # -i zeigt Statuszeile und Header (201 Created, Location: …)`,
  codeLanguage: 'Bash',
  exercises: [
    {
      id: 'api-entwurf',
      title: 'REST-Schnittstelle entwerfen',
      prompt: 'Entwirf die Endpunkte einer REST-API für eine **Seminarverwaltung**: Seminare auflisten (filterbar nach Monat), ein Seminar anzeigen, anlegen, den Preis ändern, löschen sowie die Teilnehmer eines Seminars auflisten und einen Teilnehmer hinzufügen. Gib Methode, URI und erfolgreichen Statuscode an.',
      solution: '| Aktion | Methode und URI | Status |\n| :--- | :--- | :--- |\n| Seminare auflisten | GET /api/v1/seminare?monat=2026-11 | 200 |\n| Seminar anzeigen | GET /api/v1/seminare/{id} | 200 |\n| Seminar anlegen | POST /api/v1/seminare | 201 + Location |\n| Preis ändern | PATCH /api/v1/seminare/{id} | 200 oder 204 |\n| Seminar löschen | DELETE /api/v1/seminare/{id} | 204 |\n| Teilnehmer auflisten | GET /api/v1/seminare/{id}/teilnehmer | 200 |\n| Teilnehmer hinzufügen | POST /api/v1/seminare/{id}/teilnehmer | 201 |\n\nFehlerfälle: 404 (Seminar unbekannt), 409 (Seminar ausgebucht), 422 (ungültige Daten).'
    },
    {
      id: 'statuscode-waehlen',
      title: 'Den passenden Statuscode wählen',
      prompt: 'Welcher Statuscode passt?\n\n1. Das JSON im Body ist syntaktisch kaputt.\n2. Ein Nutzer ohne Token ruft `/api/profil` auf.\n3. Ein angemeldeter Azubi versucht, einen anderen Nutzer zu löschen.\n4. Ein Kunde wurde erfolgreich gelöscht, es gibt nichts zurückzugeben.\n5. Ein Client schickt 500 Anfragen pro Minute, erlaubt sind 100.\n6. Die Datenbank ist nicht erreichbar.',
      solution: '1. **400** Bad Request\n2. **401** Unauthorized (nicht authentifiziert)\n3. **403** Forbidden (authentifiziert, aber keine Berechtigung)\n4. **204** No Content\n5. **429** Too Many Requests (gern mit `Retry-After`-Header)\n6. **503** Service Unavailable (oder 500)'
    },
    {
      id: 'idempotenz',
      title: 'Idempotenz in der Praxis',
      prompt: 'Eine Zahlungs-App schickt `POST /zahlungen`. Wegen eines Funklochs bekommt sie keine Antwort und wiederholt die Anfrage automatisch. Welches Problem entsteht, und wie lösen es APIs wie die von Zahlungsdienstleistern?',
      solution: '**POST ist nicht idempotent**: Ist die erste Anfrage beim Server angekommen, entsteht durch die Wiederholung eine **doppelte Zahlung**.\n\nLösung: Der Client erzeugt einen eindeutigen **Idempotency-Key** (z. B. eine UUID) und schickt ihn als Header mit. Der Server speichert Schlüssel und Ergebnis und liefert bei einer Wiederholung mit demselben Schlüssel nur das gespeicherte Ergebnis zurück, statt erneut zu buchen.'
    }
  ],
  quiz: [
    {
      question: 'Welche HTTP-Methode ist idempotent, aber nicht sicher?',
      options: ['GET', 'POST', 'PUT', 'HEAD'],
      correct: 2,
      explanation: 'PUT ändert den Server (nicht sicher), aber mehrfaches Ersetzen mit denselben Daten führt zum selben Ergebnis (idempotent).'
    },
    {
      question: 'Welcher Statuscode passt nach dem erfolgreichen Anlegen einer Ressource?',
      options: ['200 OK', '201 Created', '204 No Content', '302 Found'],
      correct: 1,
      explanation: '201 Created, idealerweise mit Location-Header auf die neue Ressource.'
    },
    {
      question: 'Was bedeutet der Statuscode 304?',
      options: ['Die Ressource wurde verschoben', 'Die zwischengespeicherte Version ist noch gültig', 'Der Server ist überlastet', 'Die Anfrage war fehlerhaft'],
      correct: 1,
      explanation: '304 Not Modified: Der Client darf seine Cache-Kopie weiterverwenden, es wird kein Body übertragen.'
    },
    {
      question: 'Welche URI entspricht am besten dem REST-Stil?',
      options: ['GET /getAllOrders', 'POST /orders/delete/42', 'GET /orders/42', 'GET /order?action=show&id=42'],
      correct: 2,
      explanation: 'Ressourcen als Substantive im Pfad, die Aktion ergibt sich aus der HTTP-Methode.'
    },
    {
      question: 'Welches Problem löst GraphQL gegenüber REST?',
      options: ['Verschlüsselung', 'Over- und Underfetching', 'Zustandslosigkeit', 'Paketverlust'],
      correct: 1,
      explanation: 'Der Client fragt genau die benötigten Felder ab und bekommt verschachtelte Daten in einer Anfrage.'
    },
    {
      question: 'Wofür wird gRPC typischerweise eingesetzt?',
      options: ['Für statische Webseiten', 'Für schnelle Kommunikation zwischen Microservices', 'Für E-Mail-Versand', 'Für Datenbank-Backups'],
      correct: 1,
      explanation: 'gRPC nutzt binäres Protobuf über HTTP/2 und eignet sich besonders für Dienst-zu-Dienst-Kommunikation.'
    }
  ],
  relatedLabs: [
    { id: 'api_mock_studio', label: 'API-Mock-Studio' },
    { id: 'openapi_contract_lab', label: 'OpenAPI-Vertrag' },
    { id: 'graphql_explorer', label: 'GraphQL-Explorer' },
    { id: 'grpc_protobuf_lab', label: 'gRPC & Protobuf' },
    { id: 'oauth_pkce_studio', label: 'OAuth 2.0 mit PKCE' }
  ],
  sources: [
    { title: 'RFC 9110: HTTP Semantics', url: 'https://www.rfc-editor.org/rfc/rfc9110', note: 'Methoden, Statuscodes, safe/idempotent' },
    { title: 'Roy T. Fielding (2000): Architectural Styles and the Design of Network-based Software Architectures, Kap. 5 (REST)', url: 'https://ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm' },
    { title: 'MDN: HTTP-Antwortstatuscodes', url: 'https://developer.mozilla.org/de/docs/Web/HTTP/Reference/Status' },
    { title: 'GraphQL: Introduction to GraphQL', url: 'https://graphql.org/learn/' },
    { title: 'gRPC: Introduction to gRPC', url: 'https://grpc.io/docs/what-is-grpc/introduction/' },
    { title: 'OpenAPI Specification', url: 'https://spec.openapis.org/oas/latest.html' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
