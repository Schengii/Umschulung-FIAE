/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Schutzbedarf feststellen und Risiken nach Eintrittswahrscheinlichkeit und Schaden bewerten',
    'Maßnahmen der Risikobehandlung auswählen und wirtschaftlich begründen',
    'Härtung, Patch-Management, Netzsegmentierung, Zugriffsschutz und Logging umsetzen',
    'Einen Sicherheitsvorfall strukturiert bearbeiten und das Notfallmanagement einordnen'
  ],
  content: `
## Begriffe

| Begriff | Bedeutung | Beispiel |
| :--- | :--- | :--- |
| Wert (Asset) | schützenswertes Objekt | Kundendatenbank, Server |
| Bedrohung | mögliches schädigendes Ereignis | Ransomware, Stromausfall |
| Schwachstelle | Schwäche, die eine Bedrohung ausnutzt | ungepatchte Software |
| Risiko | Kombination aus Wahrscheinlichkeit und Schaden | Ausfall des Servers durch Angriff |

Die **Schutzziele** sind Vertraulichkeit, Integrität und Verfügbarkeit. Häufig ergänzt man **Authentizität** (Echtheit der Herkunft) und **Nichtabstreitbarkeit**.

## Schutzbedarf feststellen

Nach dem BSI-Vorgehen wird der Schutzbedarf je Schutzziel in drei Stufen festgelegt: **normal**, **hoch**, **sehr hoch**. Man fragt: Welcher Schaden entsteht, wenn das Ziel verletzt wird (finanziell, Gesetzesverstoß, Ruf, Gesundheit)?

- **Maximumprinzip**: Der höchste Einzelwert bestimmt den Schutzbedarf eines Objekts.
- **Kumulationseffekt**: Viele Anwendungen auf einem System erhöhen dessen Schutzbedarf.
- **Verteilungseffekt**: Redundanz kann den Schutzbedarf senken.
- **Vererbung**: Systeme erben den Bedarf der Anwendungen, die auf ihnen laufen.

## Risikoanalyse

Ein Risiko bewertet man mit zwei Größen: **Eintrittswahrscheinlichkeit** und **Schadenshöhe**. Eine **Risikomatrix** hilft bei der Einordnung.

![Risikomatrix aus Wahrscheinlichkeit und Schadenshöhe mit Stufen niedrig, mittel, hoch](risikomatrix.svg "Je höher Wahrscheinlichkeit und Schaden, desto höher das Risiko")

### Quantitative Betrachtung

- **SLE** (Single Loss Expectancy): erwarteter Schaden je Ereignis.
- **ARO** (Annual Rate of Occurrence): erwartete Häufigkeit pro Jahr.
- **ALE** (Annual Loss Expectancy) = **SLE · ARO**: erwarteter Jahresschaden.

> [!example] Beispiel Wirtschaftlichkeit einer Maßnahme
> Ein Serverausfall verursacht 20.000 € Schaden (SLE) und tritt alle vier Jahre auf (ARO = 0,25). ALE = 5.000 € pro Jahr. Eine Maßnahme (Cluster) kostet 3.000 € pro Jahr und senkt ARO auf 0,05, also ALE auf 1.000 €. Nutzen: 5.000 € − 1.000 € = 4.000 € Risikominderung. Nach Abzug der Kosten bleibt ein Nettonutzen von 1.000 € pro Jahr: Die Maßnahme ist wirtschaftlich.

## Risikobehandlung

| Strategie | Bedeutung | Beispiel |
| :--- | :--- | :--- |
| Vermeiden | Ursache beseitigen | Dienst abschalten |
| Vermindern | Wahrscheinlichkeit oder Schaden senken | Patch, Backup, Firewall |
| Übertragen | Risiko teilen oder abgeben | Cyber-Versicherung, Outsourcing |
| Akzeptieren | bewusst tragen | geringes Risiko, Restrisiko dokumentieren |

Nach der Behandlung bleibt ein **Restrisiko**, das von der Leitung bewusst akzeptiert und dokumentiert wird.

## Maßnahmen strukturieren

Maßnahmen lassen sich nach **Art** und **Wirkung** einordnen:

- **Art**: technisch (Firewall, Verschlüsselung), organisatorisch (Richtlinien, Prozesse), personell (Schulung), baulich/physisch (Zutritt, Brandschutz).
- **Wirkung**: **präventiv** (verhindern), **detektiv** (erkennen), **reaktiv** (reagieren und wiederherstellen).

## Härtung und Konfiguration

**Systemhärtung** verringert die Angriffsfläche:

- Nicht benötigte Dienste, Konten und Software entfernen.
- **Standardpasswörter** ändern, Administratorrechte nach dem Prinzip der minimalen Rechte vergeben.
- **Sichere Konfigurationsvorgaben** (Baselines, zum Beispiel CIS Benchmarks) einsetzen und Abweichungen prüfen.
- Datenträger verschlüsseln, Secure Boot und aktuelle Firmware verwenden.

## Patch-Management

Sicherheitslücken werden oft kurz nach Veröffentlichung eines Updates ausgenutzt. Der Prozess:

1. **Inventar** aller Systeme und Software führen.
2. Schwachstellen **bewerten** (Schweregrad nach CVSS 0 bis 10: niedrig 0,1–3,9, mittel 4,0–6,9, hoch 7,0–8,9, kritisch 9,0–10,0).
3. Updates in einer **Testumgebung** prüfen.
4. **Ausrollen** nach Priorität mit Wartungsfenster und Rückfallplan.
5. **Nachweisen** (Berichte) und Ausnahmen begründen.

## Netzwerk- und Zugriffsschutz

- **Segmentierung**: Netze nach Schutzbedarf trennen (Verwaltung, Server, Gäste, Produktion), Übergänge mit Firewall.
- **IDS** erkennt Angriffe und meldet sie, **IPS** blockiert sie zusätzlich. Eine **WAF** schützt Webanwendungen.
- **NAC/802.1X** lässt nur authentifizierte Geräte ins Netz.
- **Identitäts- und Rechtemanagement**: Rollenmodelle, **Mehrfaktor-Authentifizierung** für Administratoren und Fernzugriffe, getrennte Admin-Konten, regelmäßige Rechteprüfung.
- **Zero Trust**: Kein Gerät und kein Nutzer ist allein wegen seines Standorts vertrauenswürdig, jeder Zugriff wird geprüft.

## Protokollierung und Überwachung

Ohne Protokolle bleiben Angriffe unentdeckt. Ein **SIEM** sammelt Logs zentral und korreliert Ereignisse. Voraussetzungen: einheitliche **Zeit** (NTP), geschützte Speicherung, festgelegte Aufbewahrungsdauer. Da Logs personenbezogene Daten enthalten können, gelten **Datenschutzregeln** (Zweckbindung, Löschfristen, Zugriffsbeschränkung).

## Sicherheitsvorfälle bearbeiten (Incident Response)

Das NIST-Modell unterscheidet vier Phasen:

1. **Vorbereitung**: Notfallplan, Rollen, Kontaktliste, Werkzeuge, Übungen.
2. **Erkennung und Analyse**: Meldung bewerten, Umfang und Schwere bestimmen, Beweise sichern.
3. **Eindämmung, Beseitigung, Wiederherstellung**: betroffene Systeme isolieren, Ursache entfernen, aus sauberen Backups wiederherstellen.
4. **Nachbereitung**: Erkenntnisse (Lessons Learned) dokumentieren, Maßnahmen verbessern.

Beachte **Meldepflichten**: Bei Verletzung des Schutzes personenbezogener Daten ist die Aufsichtsbehörde unverzüglich, möglichst binnen **72 Stunden**, zu informieren (DSGVO Art. 33). Für Einrichtungen nach der NIS-2-Richtlinie gilt eine **Frühwarnung binnen 24 Stunden**.

## Notfallmanagement und Datensicherung

Das **Business Continuity Management (BCM)** sorgt dafür, dass kritische Geschäftsprozesse weiterlaufen.

- Die **Business-Impact-Analyse (BIA)** ermittelt, welche Prozesse wie lange ausfallen dürfen.
- **RTO** (Recovery Time Objective): maximale Wiederanlaufzeit. **RPO** (Recovery Point Objective): maximal tolerierbarer Datenverlust.
- Das **Notfallhandbuch** beschreibt Verantwortliche, Abläufe und Kontaktdaten und wird geübt.
- **Backups** nach der 3-2-1-Regel, mindestens eine Kopie **offline oder unveränderlich** (Schutz vor Ransomware). Ein Backup ist erst dann ein Backup, wenn die **Wiederherstellung getestet** wurde.

## Management der Informationssicherheit (ISMS)

Ein **ISMS** steuert Sicherheit als fortlaufenden Prozess (Plan, Do, Check, Act). Grundlagen sind die Norm **ISO/IEC 27001** und der **BSI-Standard 200-2** (IT-Grundschutz mit den Vorgehensweisen Basis-, Standard- und Kern-Absicherung). Menschen sind Teil der Sicherheit: **Awareness-Schulungen** und Phishing-Übungen senken das Risiko deutlich.

## Angriffsarten und passende Gegenmaßnahmen

Kenne zu jedem Angriff die Schutzziele, die er verletzt, und eine passende Gegenmaßnahme.

| Angriff | Funktionsweise | Verletztes Schutzziel | Gegenmaßnahmen |
| :--- | :--- | :--- | :--- |
| Phishing / Spear-Phishing | gefälschte Mails oder Seiten locken Zugangsdaten oder Klicks heraus | Vertraulichkeit | Schulung, Mehr-Faktor-Authentifizierung, Mailfilter, Meldeweg für Verdachtsfälle |
| Ransomware | verschlüsselt Daten und fordert Lösegeld | Verfügbarkeit, Integrität | Offline-Backups, Patchen, Rechte begrenzen, Netzsegmentierung |
| Brute Force / Passwort-Spraying | Passwörter durchprobieren, oder wenige gängige Passwörter bei vielen Konten | Vertraulichkeit | Kontosperre, Rate Limiting, MFA, lange Passwörter |
| Credential Stuffing | gestohlene Zugangsdaten aus Leaks bei anderen Diensten testen | Vertraulichkeit | einmalige Passwörter, Passwortmanager, MFA |
| Man-in-the-Middle | Angreifer schaltet sich in die Kommunikation | Vertraulichkeit, Integrität | TLS mit Zertifikatsprüfung, VPN, geschützte Switch-Ports |
| (D)DoS | Überlastung durch Anfragen | Verfügbarkeit | Rate Limiting, Filter beim Provider, Skalierung, DDoS-Schutzdienst |
| SQL-Injection | Eingabe wird als SQL-Befehl ausgeführt | Vertraulichkeit, Integrität | parametrisierte Abfragen, Eingabevalidierung, minimale DB-Rechte |
| Cross-Site-Scripting (XSS) | Schadskript wird in eine Webseite eingeschleust | Vertraulichkeit, Integrität | Ausgabe kodieren, Content-Security-Policy |
| Social Engineering (z. B. CEO-Fraud, Vishing) | Mensch wird manipuliert (Autorität, Zeitdruck) | alle | Vier-Augen-Prinzip bei Zahlungen, Rückruf über bekannte Nummer, Schulung |

**Malware-Begriffe:** Ein *Virus* braucht einen Wirt und die Mithilfe des Nutzers, ein *Wurm* verbreitet sich selbstständig über das Netz, ein *Trojaner* tarnt sich als nützliches Programm, *Spyware* späht aus, ein *Rootkit* versteckt sich tief im System, ein *Botnet* ist ein Verbund ferngesteuerter Rechner.

## Zugriffskontrolle und Authentifizierung im Betrieb

- **Prinzip der minimalen Rechte (Least Privilege):** Nutzer und Dienste erhalten nur die Rechte, die sie für ihre Aufgabe brauchen. Administratorkonten werden nur für administrative Tätigkeiten benutzt, nicht fürs Surfen oder Mailen.
- **Rollenbasierte Zugriffskontrolle (RBAC):** Rechte hängen an Rollen (Buchhaltung, Vertrieb), nicht an Personen. Bei Eintritt, Wechsel und Austritt wird die Rollenzuordnung geändert (*Joiner-Mover-Leaver*).
- **Mehr-Faktor-Authentifizierung (MFA):** kombiniert mindestens zwei Faktoren aus Wissen (Passwort), Besitz (Token, Smartphone-App, Sicherheitsschlüssel) und Sein (Biometrie). Am robustesten sind phishingresistente Verfahren wie FIDO2-Sicherheitsschlüssel.
- **Passwortrichtlinien:** Das BSI und das US-amerikanische NIST empfehlen heute eher lange Passwörter oder Passphrasen und einen Passwortmanager als häufige erzwungene Wechsel. Ein Wechsel ist nötig bei Verdacht auf Kompromittierung.
- **Vier-Augen-Prinzip und Funktionstrennung:** Kritische Vorgänge (Freigabe von Zahlungen, Änderung an Firewallregeln) erfordern zwei Personen.
- **Privilegierte Zugänge:** getrennte Admin-Konten, Protokollierung der Sitzungen, zeitlich befristete Rechte.

## Verschlüsselung im Betrieb anwenden

Welche Verfahren es gibt, steht im Artikel zur Kryptografie. Im Betrieb zählt, **wo** man sie einsetzt:

- **Daten im Ruhezustand:** Laufwerksverschlüsselung (BitLocker, LUKS), verschlüsselte Backups, Verschlüsselung in Datenbanken.
- **Daten in Bewegung:** TLS für Web, Mail und Datenbankzugriffe, SSH, VPN (IPsec, WireGuard, OpenVPN).
- **Mail:** S/MIME oder OpenPGP für Ende-zu-Ende-Schutz der Inhalte, TLS schützt nur den Transportweg zwischen Servern.
- **Schlüsselverwaltung:** Schlüssel und Zertifikate haben ein Ablaufdatum und einen Lebenszyklus (erzeugen, verteilen, erneuern, widerrufen). Abgelaufene Zertifikate sind ein häufiger Ausfallgrund und sollten überwacht werden. Wiederherstellungsschlüssel gesondert und sicher aufbewahren.

## Schwachstellenmanagement im Detail

1. **Bestand kennen:** Ohne Inventar (Hardware, Software, Versionen) lässt sich nichts bewerten.
2. **Schwachstellen erkennen:** Hersteller- und BSI-Warnmeldungen, Schwachstellenscanner (z. B. OpenVAS/Greenbone oder kommerzielle Scanner), Penetrationstests.
3. **Bewerten:** Der **CVSS-Basiswert** (0,0 bis 10,0) bewertet die technische Schwere: 0,1 bis 3,9 niedrig, 4,0 bis 6,9 mittel, 7,0 bis 8,9 hoch, 9,0 bis 10,0 kritisch. Zusätzlich zählen Ausnutzbarkeit im Umfeld (aus dem Internet erreichbar? Exploit verfügbar?) und Schutzbedarf des Systems.
4. **Beheben oder mindern:** Patch, Konfigurationsänderung, Abschalten des Dienstes, Isolieren als Zwischenlösung.
5. **Nachweisen:** Erneut scannen und im Ticket dokumentieren.

Ein **Penetrationstest** ist ein autorisierter, vereinbarter Angriffsversuch. Ohne schriftliche Erlaubnis der Betreiber ist das Scannen und Angreifen fremder Systeme strafbar (§ 202c StGB, „Hackerparagraf“, und weitere).

## Rechnen mit Verfügbarkeit

Verfügbarkeit in Prozent = (Betriebszeit / Gesamtzeit) * 100. Ein Jahr hat 8760 Stunden.

| Verfügbarkeit | Erlaubte Ausfallzeit pro Jahr |
| :--- | :--- |
| 99 % | 87,6 Stunden (ca. 3,65 Tage) |
| 99,9 % | 8,76 Stunden |
| 99,99 % | 52,6 Minuten |
| 99,999 % | 5,3 Minuten |

Hängen Komponenten in **Reihe** (alle müssen laufen), multiplizieren sich die Verfügbarkeiten: Zwei Systeme mit je 99,9 % ergeben 99,9 % * 99,9 % = 99,8 %. **Parallele Redundanz** (eine reicht) verbessert den Wert: 1 - (1 - 0,99) * (1 - 0,99) = 99,99 %, vorausgesetzt der Ausfall ist unabhängig und die Umschaltung funktioniert.

## IT-Forensik und Beweissicherung

Nach einem Vorfall kann es nötig sein, Beweise zu sichern, etwa für eine Anzeige oder eine arbeitsrechtliche Maßnahme.

- **Reihenfolge der Flüchtigkeit:** Zuerst sichern, was am schnellsten verloren geht: Arbeitsspeicher und laufende Prozesse, dann Netzwerkverbindungen, danach Datenträger, zuletzt Backups und Archive. Ein verdächtiges System deshalb nicht vorschnell ausschalten, sondern vom Netz trennen, wenn der Schaden begrenzt werden muss.
- **Originale schützen:** Mit Schreibschutz ein bitgenaues Abbild (Image) erstellen und mit dem Abbild arbeiten. Einen **Hashwert** (z. B. SHA-256) vom Original und von der Kopie bilden, um die Unverändertheit nachzuweisen.
- **Beweiskette (Chain of Custody):** Lückenlos dokumentieren, wer wann welches Medium in Händen hatte, mit Datum, Uhrzeit und Unterschrift.
- **Rechtliche Rahmenbedingungen:** Datenschutz und Mitbestimmung beachten. Bei Verdacht auf Straftaten die Geschäftsleitung und den Datenschutzbeauftragten einbeziehen, bei Personenbezug gilt die Meldepflicht von 72 Stunden an die Aufsichtsbehörde.

## Staffelung der Verteidigung (Defense in Depth) und Zero Trust

**Defense in Depth** setzt auf mehrere unabhängige Schutzschichten: physisch (Zutritt), Netzwerk (Firewall, Segmentierung), System (Härtung, Patches), Anwendung (sichere Entwicklung), Daten (Verschlüsselung, Backup) und Mensch (Schulung, Richtlinien). Fällt eine Schicht aus, fängt die nächste auf. **Zero Trust** geht noch weiter: Kein Gerät und kein Nutzer wird allein wegen seiner Position im internen Netz vertraut. Jeder Zugriff wird geprüft (Identität, Gerätezustand, Kontext) und auf das Nötige begrenzt.

> [!exam] Prüfungshinweis
> Gefragt werden häufig die Schutzbedarfsfeststellung mit Maximumprinzip, eine Risikomatrix mit Begründung, die ALE-Rechnung zur Wirtschaftlichkeit, Maßnahmen nach TOM-Kategorien sowie die Reihenfolge der Schritte bei einem Sicherheitsvorfall.
`,
  exercises: [
    {
      id: 'schutzbedarf-maximum',
      title: 'Schutzbedarf eines Servers bestimmen',
      prompt: 'Auf einem Server laufen die Lohnabrechnung (Vertraulichkeit sehr hoch, Integrität hoch, Verfügbarkeit normal) und ein internes Wiki (Vertraulichkeit normal, Integrität normal, Verfügbarkeit hoch). Bestimme den Schutzbedarf des Servers je Schutzziel und begründe.',
      hints: ['Maximumprinzip je Schutzziel', 'Der Server erbt den Bedarf seiner Anwendungen'],
      solution: 'Vertraulichkeit: sehr hoch (Maximum aus sehr hoch und normal). Integrität: hoch (Maximum aus hoch und normal). Verfügbarkeit: hoch (Maximum aus normal und hoch). Der Server erbt den jeweils höchsten Bedarf seiner Anwendungen (Maximumprinzip und Vererbung). Zusätzlich kann der Kumulationseffekt den Bedarf weiter erhöhen, weil beide Anwendungen betroffen sind, wenn der Server ausfällt.'
    },
    {
      id: 'ale-wirtschaftlichkeit',
      title: 'Wirtschaftlichkeit einer Sicherheitsmaßnahme',
      prompt: 'Ein Ausfall der Produktionssteuerung verursacht 40.000 € Schaden (SLE) und tritt im Mittel einmal in zwei Jahren auf. Eine redundante Steuerung kostet 8.000 € pro Jahr und senkt die Häufigkeit auf einmal in zehn Jahren. Berechne ALE vorher und nachher sowie den Nettonutzen pro Jahr. Ist die Maßnahme wirtschaftlich?',
      hints: ['ARO = 1 : Jahre zwischen den Ereignissen', 'Nettonutzen = Minderung des ALE minus Maßnahmenkosten'],
      solution: 'Vorher: ARO = 0,5, ALE = 40.000 € · 0,5 = 20.000 €. Nachher: ARO = 0,1, ALE = 40.000 € · 0,1 = 4.000 €. Minderung: 16.000 €. Abzüglich Kosten von 8.000 € bleibt ein Nettonutzen von 8.000 € pro Jahr. Die Maßnahme ist wirtschaftlich.'
    },
    {
      id: 'patch-priorisierung',
      title: 'Schwachstellen priorisieren',
      prompt: 'Es liegen drei Meldungen vor: A) CVSS 9,8, Schwachstelle in einem aus dem Internet erreichbaren Webserver. B) CVSS 7,5, Schwachstelle in einem internen Testserver ohne echte Daten. C) CVSS 5,0, Schwachstelle in einem Drucker im Büro. Lege eine Reihenfolge fest und begründe.',
      hints: ['CVSS und Erreichbarkeit beachten', 'Schutzbedarf des Systems einbeziehen'],
      solution: 'Reihenfolge A, B, C. A ist kritisch (9,8) und aus dem Internet erreichbar, also sofort handeln. B hat hohen Schweregrad, aber nur internen Zugriff und geringen Schutzbedarf, daher zeitnah im nächsten Wartungsfenster. C hat mittleren Schweregrad und geringen Schaden, wird im regulären Zyklus behoben. Die Priorität ergibt sich aus Schweregrad, Erreichbarkeit und Schutzbedarf. Bei A kann zusätzlich eine Übergangsmaßnahme (Zugriff sperren) nötig sein, wenn der Patch nicht sofort verfügbar ist.'
    },
    {
      id: 'ransomware-ablauf',
      title: 'Reaktion auf einen Ransomware-Verdacht',
      prompt: 'Ein Mitarbeiter meldet, dass viele Dateien auf einem Dateiserver umbenannt wurden und eine Lösegeldforderung erscheint. Beschreibe die Schritte in sinnvoller Reihenfolge nach den vier Phasen des Incident Response und nenne zwei Meldepflichten.',
      hints: ['Zuerst Ausbreitung stoppen', 'Wiederherstellung aus sauberem Backup'],
      solution: 'Erkennung und Analyse: Vorfall aufnehmen, Zeitpunkt und betroffene Systeme feststellen, Beweise (Logs, Speicherabbild) sichern. Eindämmung: betroffene Systeme vom Netz trennen (nicht ausschalten, wenn Beweise im Speicher nötig sind), Konten sperren, Netzwerkfreigaben schließen. Beseitigung: Ursache (Einfallstor, Schadsoftware) finden und entfernen, Zugangsdaten ändern. Wiederherstellung: Systeme neu aufsetzen und Daten aus einem sauberen, getesteten Backup einspielen, Betrieb überwachen. Nachbereitung: Lessons Learned, Maßnahmen verbessern. Meldepflichten: Aufsichtsbehörde bei Datenschutzverletzung innerhalb von 72 Stunden (DSGVO Art. 33), bei Einrichtungen nach NIS-2 Frühwarnung binnen 24 Stunden.'
    }
  ],
  quiz: [
    {
      question: 'Wie lautet die Formel für den erwarteten Jahresschaden (ALE)?',
      options: ['SLE + ARO', 'SLE · ARO', 'SLE : ARO', 'ARO − SLE'],
      correct: 1,
      explanation: 'ALE = SLE · ARO, also Schaden je Ereignis mal Häufigkeit pro Jahr.'
    },
    {
      question: 'Ein Objekt hat Vertraulichkeit normal, Integrität hoch und Verfügbarkeit sehr hoch. Welchen Gesamtschutzbedarf liefert das Maximumprinzip?',
      options: ['Normal', 'Hoch', 'Sehr hoch', 'Durchschnitt: hoch'],
      correct: 2,
      explanation: 'Der höchste Einzelwert bestimmt den Gesamtschutzbedarf.'
    },
    {
      question: 'Welche Risikostrategie beschreibt den Abschluss einer Cyber-Versicherung?',
      options: ['Vermeiden', 'Vermindern', 'Übertragen', 'Akzeptieren'],
      correct: 2,
      explanation: 'Das Risiko wird (teilweise) auf einen Versicherer übertragen. Die Eintrittswahrscheinlichkeit bleibt unverändert.'
    },
    {
      question: 'Was unterscheidet ein IPS von einem IDS?',
      options: [
        'Ein IPS blockiert Angriffe zusätzlich, ein IDS erkennt und meldet',
        'Ein IPS ist nur für WLAN',
        'Ein IDS verschlüsselt Verkehr',
        'Es gibt keinen Unterschied'
      ],
      correct: 0,
      explanation: 'IDS = Intrusion Detection System (erkennt). IPS = Intrusion Prevention System (erkennt und blockiert).'
    },
    {
      question: 'Welche Reihenfolge der Phasen passt zum Incident Response?',
      options: [
        'Nachbereitung, Vorbereitung, Erkennung, Eindämmung',
        'Vorbereitung, Erkennung und Analyse, Eindämmung/Beseitigung/Wiederherstellung, Nachbereitung',
        'Wiederherstellung, Erkennung, Vorbereitung, Nachbereitung',
        'Erkennung, Nachbereitung, Eindämmung, Vorbereitung'
      ],
      correct: 1,
      explanation: 'Das Modell lautet: Vorbereitung, Erkennung und Analyse, Eindämmung, Beseitigung und Wiederherstellung, Nachbereitung.'
    },
    {
      question: 'Eine Schwachstelle hat einen CVSS-Wert von 9,1. Wie wird sie eingestuft?',
      options: ['Niedrig', 'Mittel', 'Hoch', 'Kritisch'],
      correct: 3,
      explanation: 'CVSS 9,0 bis 10,0 gilt als kritisch.'
    },
    {
      question: 'Was gibt das RPO an?',
      options: [
        'Die maximale Wiederanlaufzeit',
        'Den maximal tolerierbaren Datenverlust, gemessen in Zeit',
        'Die Kosten der Wiederherstellung',
        'Die Anzahl der Backups'
      ],
      correct: 1,
      explanation: 'RPO = Recovery Point Objective. Das RTO beschreibt dagegen die Wiederanlaufzeit.'
    }
  ],
  relatedLabs: [
    { id: 'bsi_grundschutz_lab', label: 'BSI IT-Grundschutz' },
    { id: 'ihk_risk_analysis_lab', label: 'Risikoanalyse' },
    { id: 'ihk_tom_catalog_lab', label: 'TOM-Katalog' },
    { id: 'ihk_dpia_lab', label: 'Datenschutz-Folgenabschätzung' }
  ],
  sources: [
    { title: 'BSI: IT-Grundschutz', url: 'https://www.bsi.bund.de/EN/Themen/Unternehmen-und-Organisationen/Standards-und-Zertifizierung/IT-Grundschutz/it-grundschutz_node.html', note: 'Standards 200-1, 200-2, 200-3 und Kompendium' },
    { title: 'NIST SP 800-61 Rev. 2: Computer Security Incident Handling Guide', url: 'https://csrc.nist.gov/pubs/sp/800/61/r2/final' },
    { title: 'FIRST: CVSS (Common Vulnerability Scoring System)', url: 'https://www.first.org/cvss/' },
    { title: 'DSGVO Art. 33: Meldung von Datenschutzverletzungen', url: 'https://dejure.org/gesetze/DSGVO/33.html' },
    { title: 'Richtlinie (EU) 2022/2555 (NIS-2), Art. 23', url: 'https://eur-lex.europa.eu/eli/dir/2022/2555/oj' }
  ],
  sourcesCheckedOn: '25.11.2026'
};
