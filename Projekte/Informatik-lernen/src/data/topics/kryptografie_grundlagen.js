/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Symmetrische, asymmetrische und hybride Verschlüsselung erklären und Verfahren zuordnen',
    'Die Zahl der benötigten Schlüssel für n Teilnehmer berechnen',
    'Eigenschaften von Hashfunktionen nennen und ihren Einsatz von Verschlüsselung abgrenzen',
    'Beschreiben, wie digitale Signatur, Zertifikat und PKI zusammenspielen'
  ],
  content: `
## Grundbegriffe

**Kryptografie** schützt Informationen durch mathematische Verfahren. Aus dem **Klartext** wird mit einem **Schlüssel** der **Geheimtext** (Chiffrat). Wer den passenden Schlüssel hat, kann ihn wieder **entschlüsseln**.

Seit dem 19. Jahrhundert gilt das **Kerckhoffs-Prinzip**: Die Sicherheit darf nur von der Geheimhaltung des **Schlüssels** abhängen, nicht von der Geheimhaltung des **Verfahrens**. Deshalb sind AES und RSA öffentlich dokumentiert und trotzdem sicher – „Security through Obscurity“ ist dagegen keine Sicherheit.

> [!example] Ein historisches Beispiel: die Caesar-Verschiebung
> Jeder Buchstabe wird um *k* Stellen im Alphabet verschoben. Mit k = 3 wird aus \`HALLO\` → \`KDOOR\`. Es gibt nur 25 sinnvolle Schlüssel – ein Computer probiert alle in Mikrosekunden durch (**Brute Force**). Moderne Verfahren haben 2¹²⁸ oder mehr mögliche Schlüssel.

## Symmetrische Verschlüsselung

Sender und Empfänger nutzen **denselben geheimen Schlüssel** zum Ver- und Entschlüsseln.

- **Verfahren**: **AES** (128, 192 oder 256 Bit Schlüssellänge, Standard), **ChaCha20**. Veraltet und unsicher: DES (56 Bit), RC4.
- **Vorteil**: sehr schnell, auch für große Datenmengen; AES wird von modernen CPUs in Hardware beschleunigt.
- **Nachteil**: das **Schlüsselverteilungsproblem** – wie kommt der Schlüssel sicher zum Partner? Und jedes Paar braucht einen eigenen Schlüssel.

**Anzahl Schlüssel für n Teilnehmer: n × (n − 1) ÷ 2.** Bei 10 Teilnehmern sind das 45, bei 100 schon 4.950.

## Asymmetrische Verschlüsselung

Jeder Teilnehmer hat ein **Schlüsselpaar**: einen **öffentlichen Schlüssel** (*Public Key*), den jeder kennen darf, und einen **privaten Schlüssel** (*Private Key*), der geheim bleibt. Was mit dem einen verschlüsselt wurde, lässt sich nur mit dem anderen entschlüsseln.

- **Verfahren**: **RSA** (beruht auf der Schwierigkeit, große Zahlen in Primfaktoren zu zerlegen), Verfahren auf **elliptischen Kurven** (ECC, z. B. ECDH, ECDSA, Ed25519), Diffie-Hellman für den Schlüsselaustausch.
- **Vorteil**: kein geheimer Schlüsselaustausch nötig. Für n Teilnehmer reichen **2 × n** Schlüssel (n Paare).
- **Nachteil**: um Größenordnungen **langsamer** als symmetrische Verfahren, und man muss sicher sein, dass ein öffentlicher Schlüssel wirklich zur richtigen Person gehört.

> [!exam] Welcher Schlüssel wofür?
> - **Vertraulich an Bob schicken**: mit **Bobs öffentlichem** Schlüssel verschlüsseln – nur Bobs privater Schlüssel entschlüsselt.
> - **Signieren**: mit dem **eigenen privaten** Schlüssel – jeder prüft mit dem öffentlichen Schlüssel des Absenders.

## Hybride Verschlüsselung

In der Praxis kombiniert man beide Welten: Die Nachricht wird mit einem zufälligen **Sitzungsschlüssel** symmetrisch verschlüsselt (schnell). Nur dieser kurze Sitzungsschlüssel wird asymmetrisch geschützt bzw. per Diffie-Hellman vereinbart (löst das Verteilungsproblem). So arbeiten TLS (HTTPS), S/MIME, PGP und SSH.

![Ablauf der hybriden Verschlüsselung](hybride-verschluesselung.svg "Die Nachricht wird symmetrisch verschlüsselt, der Sitzungsschlüssel asymmetrisch")

## Hashfunktionen

Eine **kryptografische Hashfunktion** bildet beliebig lange Eingaben auf einen **Hashwert fester Länge** ab (SHA-256: immer 256 Bit = 64 Hex-Zeichen). Sie ist **keine Verschlüsselung**, denn es gibt keinen Schlüssel und kein Zurück.

Eigenschaften:

1. **Einwegfunktion**: Aus dem Hashwert lässt sich die Eingabe nicht berechnen.
2. **Kollisionsresistenz**: Es ist praktisch unmöglich, zwei Eingaben mit gleichem Hash zu finden.
3. **Lawineneffekt**: Eine winzige Änderung (ein Bit) ändert etwa die Hälfte der Bits des Hashwerts.
4. **Deterministisch**: Gleiche Eingabe ergibt immer denselben Hash.

| Verfahren | Länge | Status |
| :--- | :--- | :--- |
| MD5 | 128 Bit | **gebrochen** (Kollisionen), nur noch als Prüfsumme gegen Übertragungsfehler |
| SHA-1 | 160 Bit | **gebrochen** (seit 2017 praktische Kollision) |
| SHA-256 / SHA-512 (SHA-2) | 256 / 512 Bit | sicher, Standard |
| SHA-3 | variabel | sicher, andere Bauweise als SHA-2 |

Einsatz: Integritätsprüfung von Downloads, digitale Signaturen, Git-Commits, Blockchains, **HMAC** (Hash mit geheimem Schlüssel für die Nachrichtenauthentifizierung). Für **Passwörter** nimmt man dagegen absichtlich langsame Verfahren mit Salt wie **Argon2** oder **bcrypt** (siehe Artikel Web-Sicherheit).

## Digitale Signatur

Eine digitale Signatur sichert **Integrität**, **Authentizität** und **Nichtabstreitbarkeit**:

1. Alice berechnet den **Hashwert** des Dokuments.
2. Sie signiert den Hashwert mit ihrem **privaten Schlüssel** → Signatur.
3. Sie schickt Dokument und Signatur an Bob.
4. Bob berechnet selbst den Hash des Dokuments und prüft die Signatur mit **Alices öffentlichem Schlüssel**.
5. Stimmen beide überein, ist das Dokument unverändert und stammt von Alice.

Eine Signatur macht das Dokument **nicht vertraulich**. Dafür muss man es zusätzlich verschlüsseln.

## Zertifikate und PKI

Wie weiß Bob, dass der öffentliche Schlüssel wirklich Alice gehört und nicht einem Angreifer (*Man-in-the-Middle*)? Dafür gibt es **digitale Zertifikate** nach dem Standard **X.509**. Ein Zertifikat enthält u. a. Inhaber (z. B. Domain), öffentlichen Schlüssel, Gültigkeitszeitraum, Aussteller und die **Signatur der Zertifizierungsstelle (CA)**.

Eine **Public-Key-Infrastruktur (PKI)** organisiert das Ausstellen, Verteilen, Prüfen und Widerrufen:

- **Root-CA**: oberste Vertrauensinstanz. Ihre Zertifikate sind in Browser und Betriebssystem vorinstalliert.
- **Intermediate-CA**: wird von der Root-CA signiert und stellt die Endzertifikate aus (die Root bleibt offline und geschützt).
- **Endzertifikat** (*Leaf*): z. B. für \`www.example.com\`.
- **Vertrauenskette** (*Chain of Trust*): Der Browser prüft Leaf → Intermediate → Root.
- **Widerruf** (Revocation): über Sperrlisten (CRL) oder OCSP.
- **Registrierungsstelle (RA)**: prüft die Identität des Antragstellers.

Kostenlose, automatisch erneuerte TLS-Zertifikate stellt z. B. **Let's Encrypt** über das ACME-Protokoll aus.

## Der TLS-Handshake (vereinfacht, TLS 1.3)

1. **ClientHello**: Der Browser nennt unterstützte Verfahren und schickt seinen Diffie-Hellman-Anteil.
2. **ServerHello**: Der Server wählt die Verfahren und schickt seinen DH-Anteil. Beide berechnen daraus denselben Sitzungsschlüssel.
3. Der Server schickt sein **Zertifikat** und eine Signatur über den Handshake – so beweist er, dass er den privaten Schlüssel besitzt.
4. Der Browser prüft die Zertifikatskette und den Domainnamen.
5. Ab jetzt läuft alles **symmetrisch** verschlüsselt (z. B. AES-GCM oder ChaCha20-Poly1305).

Weil für jede Sitzung ein neuer Schlüssel ausgehandelt wird (**ECDHE**), bleiben alte Sitzungen sicher, selbst wenn der private Schlüssel des Servers später gestohlen wird – das nennt man **Perfect Forward Secrecy**.
`,
  codeSnippet: `// Hash berechnen mit der Web Crypto API (Browser und Node.js)
async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

console.log(await sha256('Hallo'));  // 753692ec36adb4c794c973945eb2a99c1649703ea6f76bf259abb4fb838e013e
console.log(await sha256('hallo'));  // komplett anderer Wert (Lawineneffekt)`,
  codeLanguage: 'JavaScript',
  exercises: [
    {
      id: 'schluessel-zaehlen',
      title: 'Schlüssel zählen',
      prompt: 'In einem Projektteam sollen **25 Personen** paarweise vertraulich kommunizieren können. Wie viele Schlüssel werden symmetrisch und wie viele asymmetrisch benötigt?',
      solution: 'Symmetrisch: n × (n − 1) ÷ 2 = 25 × 24 ÷ 2 = **300 Schlüssel**.\nAsymmetrisch: 2 × n = **50 Schlüssel** (25 Schlüsselpaare).'
    },
    {
      id: 'schluessel-wahl',
      title: 'Den richtigen Schlüssel wählen',
      prompt: 'Alice will Bob einen Vertrag schicken. (1) Niemand außer Bob soll ihn lesen können, und (2) Bob soll sicher sein, dass er von Alice stammt und nicht verändert wurde. Welche Schlüssel werden in welchem Schritt verwendet – beim Senden und beim Empfangen?',
      hints: ['Für die Vertraulichkeit braucht man einen Schlüssel des Empfängers, für die Signatur einen des Absenders.'],
      solution: '**Alice (Senden)**:\n1. Hash des Vertrags bilden und mit **Alices privatem Schlüssel** signieren.\n2. Vertrag (und Signatur) mit **Bobs öffentlichem Schlüssel** verschlüsseln – in der Praxis hybrid: mit einem Sitzungsschlüssel, der wiederum mit Bobs öffentlichem Schlüssel verschlüsselt wird.\n\n**Bob (Empfangen)**:\n1. Mit **Bobs privatem Schlüssel** entschlüsseln.\n2. Signatur mit **Alices öffentlichem Schlüssel** prüfen und mit dem selbst berechneten Hash vergleichen.'
    },
    {
      id: 'caesar',
      title: 'Caesar knacken',
      prompt: 'Der Geheimtext `SUXHIXQJ` wurde mit einer Caesar-Verschiebung erzeugt. Finde Schlüssel und Klartext und erkläre, warum das Verfahren unsicher ist.',
      hints: ['Probiere die Verschiebung, die Verschlüsselungsbeispiele oft nutzen: 3.'],
      solution: 'Mit k = 3 zurückverschoben: S→P, U→R, X→U, H→E, I→F, X→U, Q→N, J→G → **PRUEFUNG**.\nUnsicher, weil es nur 25 Schlüssel gibt (Brute Force) und die Buchstabenhäufigkeit erhalten bleibt (Häufigkeitsanalyse).'
    },
    {
      id: 'hash-download',
      title: 'Download prüfen',
      prompt: 'Auf der Website einer Linux-Distribution stehen neben der ISO-Datei ein SHA-256-Wert und eine Datei `SHA256SUMS.gpg`. Wozu dient der Hash, und wozu zusätzlich die Signatur? Welches Schutzziel deckt was ab?',
      solution: 'Der **SHA-256-Wert** prüft die **Integrität**: Stimmt der selbst berechnete Hash überein, ist die Datei vollständig und unverändert.\n\nDie **Signatur** über die Prüfsummendatei prüft die **Authentizität**: Ein Angreifer, der die Website kapert, könnte ISO und Hash gemeinsam austauschen. Die Signatur mit dem privaten Schlüssel der Distribution kann er aber nicht fälschen.'
    }
  ],
  quiz: [
    {
      question: 'Welches Verfahren ist symmetrisch?',
      options: ['RSA', 'AES', 'ECDSA', 'Diffie-Hellman'],
      correct: 1,
      explanation: 'AES nutzt einen gemeinsamen geheimen Schlüssel. RSA und ECDSA sind asymmetrisch, Diffie-Hellman ist ein Schlüsselaustauschverfahren.'
    },
    {
      question: 'Mit welchem Schlüssel verschlüsselt Alice eine Nachricht, die nur Bob lesen soll?',
      options: ['Alices privatem Schlüssel', 'Alices öffentlichem Schlüssel', 'Bobs öffentlichem Schlüssel', 'Bobs privatem Schlüssel'],
      correct: 2,
      explanation: 'Nur Bob besitzt den passenden privaten Schlüssel zum Entschlüsseln.'
    },
    {
      question: 'Wie viele Schlüssel braucht man symmetrisch für 6 Teilnehmer, die paarweise kommunizieren?',
      options: ['6', '12', '15', '36'],
      correct: 2,
      explanation: 'n × (n − 1) ÷ 2 = 6 × 5 ÷ 2 = 15.'
    },
    {
      question: 'Welche Aussage über Hashfunktionen ist richtig?',
      options: [
        'Mit dem richtigen Schlüssel kann man den Hash entschlüsseln',
        'Der Hashwert hat unabhängig von der Eingabe immer dieselbe Länge',
        'MD5 eignet sich gut für digitale Signaturen',
        'Ähnliche Eingaben ergeben ähnliche Hashwerte'
      ],
      correct: 1,
      explanation: 'Hashwerte haben feste Länge. Es gibt keinen Schlüssel, MD5 ist gebrochen, und wegen des Lawineneffekts unterscheiden sich die Hashes ähnlicher Eingaben stark.'
    },
    {
      question: 'Welche Schutzziele erfüllt eine digitale Signatur?',
      options: [
        'Vertraulichkeit und Verfügbarkeit',
        'Integrität, Authentizität und Nichtabstreitbarkeit',
        'Nur Vertraulichkeit',
        'Nur Verfügbarkeit'
      ],
      correct: 1,
      explanation: 'Die Signatur beweist Herkunft und Unverändertheit. Vertraulich wird das Dokument dadurch nicht.'
    },
    {
      question: 'Wozu dient bei TLS das Serverzertifikat?',
      options: [
        'Es verschlüsselt alle übertragenen Daten',
        'Es bestätigt, dass der öffentliche Schlüssel zum Server bzw. zur Domain gehört',
        'Es ersetzt das Passwort des Nutzers',
        'Es beschleunigt die Verbindung'
      ],
      correct: 1,
      explanation: 'Eine CA bestätigt mit ihrer Signatur die Zuordnung von Domain und öffentlichem Schlüssel. So werden Man-in-the-Middle-Angriffe verhindert.'
    },
    {
      question: 'Warum wird in der Praxis hybrid verschlüsselt?',
      options: [
        'Weil asymmetrische Verfahren unsicher sind',
        'Weil symmetrische Verfahren schnell sind und asymmetrische das Schlüsselverteilungsproblem lösen',
        'Weil das gesetzlich vorgeschrieben ist',
        'Weil Hashfunktionen nicht schnell genug sind'
      ],
      correct: 1,
      explanation: 'Man kombiniert die Geschwindigkeit symmetrischer Verfahren mit dem sicheren Schlüsselaustausch asymmetrischer Verfahren.'
    }
  ],
  relatedLabs: [
    { id: 'crypto_keygen_lab', label: 'RSA-Schlüssel erzeugen' },
    { id: 'pki_certificate_lab', label: 'PKI & Zertifikatskette' },
    { id: 'tls_handshake_lab', label: 'TLS-Handshake' },
    { id: 'zkp_crypto', label: 'Zero-Knowledge-Beweise' }
  ],
  sources: [
    { title: 'BSI TR-02102-1: Kryptographische Verfahren – Empfehlungen und Schlüssellängen', url: 'https://www.bsi.bund.de/DE/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/Technische-Richtlinien/TR-nach-Thema-sortiert/tr02102/tr02102_node.html' },
    { title: 'RFC 8446: The Transport Layer Security (TLS) Protocol Version 1.3', url: 'https://www.rfc-editor.org/rfc/rfc8446' },
    { title: 'RFC 5280: Internet X.509 Public Key Infrastructure Certificate and CRL Profile', url: 'https://www.rfc-editor.org/rfc/rfc5280' },
    { title: 'NIST FIPS 197: Advanced Encryption Standard (AES)', url: 'https://csrc.nist.gov/pubs/fips/197/final' },
    { title: 'SHAttered – die erste praktische SHA-1-Kollision (2017)', url: 'https://shattered.io/' },
    { title: 'MDN: SubtleCrypto.digest()', url: 'https://developer.mozilla.org/de/docs/Web/API/SubtleCrypto/digest' },
    { title: 'Eigene Lernkarten zur FIAE-Umschulung: Kryptografie, Digitale Signatur', note: 'nicht öffentlich' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
