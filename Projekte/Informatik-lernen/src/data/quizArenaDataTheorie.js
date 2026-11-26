/**
 * Zusätzliche Quiz-Arena-Kategorien zu den Theorieartikeln im Wissen-Tab.
 * Format wie in quizArenaData.js: { q, options, correct, explanation }.
 * Die Fakten stehen in den Artikeln unter src/data/topics/ (dort auch die Quellen).
 */
export const QUIZ_ARENA_THEORIE = [
  {
    id: 'hardware_elektro',
    title: '🖥️ Hardware, USV & Elektrotechnik',
    difficulty: 'Azubi / IHK',
    questions: [
      {
        q: 'Ein Netzteil gibt 300 W ab und hat 85 % Wirkungsgrad. Wie viel nimmt es aus der Steckdose auf?',
        options: ['255 W', 'ca. 353 W', '300 W', '385 W'],
        correct: 1,
        explanation: '300 W : 0,85 = 352,9 W. Die Differenz von etwa 53 W ist Verlustleistung und wird zu Wärme.'
      },
      {
        q: 'Welche Datenrate in MB/s entspricht 1 Gbit/s brutto?',
        options: ['1000 MB/s', '8 MB/s', '125 MB/s', '1024 MB/s'],
        correct: 2,
        explanation: '1 Gbit/s = 1000 Mbit/s, geteilt durch 8 Bit je Byte ergibt 125 MB/s (ohne Protokoll-Overhead).'
      },
      {
        q: 'Welche Eigenschaft hat Online-USV (VFI) gegenüber einer Offline-USV (VFD)?',
        options: [
          'Sie schaltet bei Ausfall in 2 bis 10 ms um.',
          'Sie versorgt die Last dauerhaft über Gleichrichter und Wechselrichter, es gibt keine Umschaltzeit.',
          'Sie braucht keine Batterie.',
          'Sie ist die günstigste Bauart.'
        ],
        correct: 1,
        explanation: 'Bei der Online-Bauart läuft die Last ständig über den Wechselrichter. Dafür ist sie teurer und hat höhere Verluste.'
      },
      {
        q: 'Eine USV hat 1000 VA und einen Leistungsfaktor von 0,9. Welche Wirkleistung kann sie liefern?',
        options: ['1111 W', '1000 W', '900 W', '100 W'],
        correct: 2,
        explanation: 'Wirkleistung P = Scheinleistung S · cos φ = 1000 VA · 0,9 = 900 W. Im Datenblatt zählt die Angabe in Watt.'
      },
      {
        q: 'Welche Reihenfolge nennt die Fünf Sicherheitsregeln beim Arbeiten an elektrischen Anlagen richtig?',
        options: [
          'Gegen Wiedereinschalten sichern, freischalten, Spannungsfreiheit feststellen, erden und kurzschließen, benachbarte Teile abdecken',
          'Freischalten, gegen Wiedereinschalten sichern, Spannungsfreiheit feststellen, erden und kurzschließen, benachbarte Teile abdecken',
          'Spannungsfreiheit feststellen, freischalten, erden, abdecken, sichern',
          'Abdecken, erden, freischalten, sichern, prüfen'
        ],
        correct: 1,
        explanation: 'Reihenfolge: freischalten, gegen Wiedereinschalten sichern, Spannungsfreiheit feststellen, erden und kurzschließen, benachbarte unter Spannung stehende Teile abdecken oder abschranken.'
      },
      {
        q: 'Wie wird ein Elektrobrand in einem Serverraum zuerst bekämpft, wenn es gefahrlos möglich ist?',
        options: [
          'Mit Wasser aus dem Vollstrahl',
          'Mit Schaumlöscher auf die Geräte',
          'Zuerst Strom abschalten, dann mit Kohlendioxid- oder Pulverlöscher löschen',
          'Abwarten, bis die Feuerwehr eintrifft'
        ],
        correct: 2,
        explanation: 'Bei Spannung sind Wasser und Schaum gefährlich. Kohlendioxid löscht rückstandsfrei, Pulver verschmutzt die Technik stark.'
      },
      {
        q: 'Was bedeutet MBR gegenüber GPT bei Partitionstabellen?',
        options: [
          'MBR unterstützt nur 4 primäre Partitionen und Datenträger bis 2 TiB, GPT deutlich mehr und ist bei UEFI üblich.',
          'MBR ist neuer und schneller als GPT.',
          'GPT funktioniert nur auf USB-Sticks.',
          'Beide haben identische Grenzen.'
        ],
        correct: 0,
        explanation: 'GPT gehört zu UEFI, erlaubt sehr große Datenträger und viele Partitionen und speichert die Tabelle redundant.'
      },
      {
        q: 'Welche Einheit hat die Höhe von Geräten im 19-Zoll-Rack?',
        options: ['Zoll', 'Höheneinheit (HE, 1 HE = 44,45 mm)', 'Millimeter nach DIN', 'Rack-Faktor'],
        correct: 1,
        explanation: 'Ein Standard-Rack hat meist 42 HE. Die Breite der Einbauebene beträgt 19 Zoll (482,6 mm).'
      }
    ]
  },
  {
    id: 'os_netzwerk',
    title: '🐧 Betriebssysteme & Netzwerkdienste',
    difficulty: 'Azubi / IHK',
    questions: [
      {
        q: 'Welche Rechte hat eine neue Datei bei umask 022?',
        options: ['600', '664', '644', '755'],
        correct: 2,
        explanation: 'Dateien starten mit 666, die umask zieht 022 ab: 644 (rw-r--r--). Verzeichnisse starten mit 777 und erhalten 755.'
      },
      {
        q: 'Was bedeutet der cron-Eintrag 30 2 * * 1-5 ?',
        options: [
          'Jeden Tag um 2:30 Uhr',
          'Montags bis freitags um 2:30 Uhr',
          'Alle 30 Minuten an 2 Tagen',
          'Am 30. des Monats um 2 Uhr'
        ],
        correct: 1,
        explanation: 'Die Felder lauten Minute, Stunde, Tag des Monats, Monat, Wochentag. 1-5 steht für Montag bis Freitag.'
      },
      {
        q: 'Welches Ergebnis gilt, wenn die Freigabe „Lesen“ und NTFS „Ändern“ erlaubt?',
        options: [
          'Ändern beim Zugriff über das Netzwerk',
          'Lesen beim Zugriff über das Netzwerk (das restriktivere Recht)',
          'Vollzugriff',
          'Kein Zugriff'
        ],
        correct: 1,
        explanation: 'Über das Netzwerk wirken Freigabe- und NTFS-Rechte zusammen, es gilt das restriktivere Ergebnis. Lokal am Server zählt nur NTFS.'
      },
      {
        q: 'Wie lautet die Reihenfolge nach AGDLP?',
        options: [
          'Konten in globale Gruppen, diese in domänenlokale Gruppen, diese erhalten die Berechtigung',
          'Konten erhalten direkt die Berechtigung',
          'Domänenlokale Gruppen in globale Gruppen, danach Konten',
          'Berechtigungen in Konten, diese in Gruppen'
        ],
        correct: 0,
        explanation: 'Accounts, Global groups, Domain Local groups, Permissions: So bleiben Rechte pflegbar, weil man nur Gruppenmitgliedschaften ändert.'
      },
      {
        q: 'Warum können Kerberos-Anmeldungen scheitern, obwohl das Passwort stimmt?',
        options: [
          'Die Uhren von Client und Domänencontroller weichen um mehr als etwa 5 Minuten ab.',
          'Die Festplatte ist zu klein.',
          'Das Kabel ist zu lang.',
          'DHCP ist deaktiviert.'
        ],
        correct: 0,
        explanation: 'Kerberos arbeitet mit Zeitstempeln. Zeit ist deshalb ein Dienst: NTP gehört zur Grundausstattung.'
      },
      {
        q: 'Was bedeutet eine IP-Adresse 169.254.x.x am Client?',
        options: [
          'Der Client hat eine öffentliche Adresse.',
          'Der DHCP-Server wurde nicht erreicht (APIPA/Link-Local).',
          'Der Client ist im VLAN 169.',
          'Die Adresse wurde manuell gesetzt.'
        ],
        correct: 1,
        explanation: 'Findet ein Client keinen DHCP-Server, vergibt er sich selbst eine Adresse aus 169.254.0.0/16. Das ist ein Hinweis für die Fehlersuche.'
      },
      {
        q: 'Wofür dient Spanning Tree (STP/RSTP)?',
        options: [
          'Es verschlüsselt Switch-Verkehr.',
          'Es verhindert Schleifen bei redundanten Switch-Verbindungen und Broadcast-Stürme.',
          'Es verteilt IP-Adressen.',
          'Es erhöht die Bandbreite eines Links.'
        ],
        correct: 1,
        explanation: 'STP wählt eine Root Bridge und sperrt redundante Ports logisch. Bei Ausfall schaltet es einen Ersatzweg frei.'
      },
      {
        q: 'Welche Ports verwendet E-Mail-Abruf per IMAP mit TLS und SMTP-Einreichung durch Clients üblicherweise?',
        options: ['IMAP 143, SMTP 25', 'IMAP 993, SMTP 587', 'IMAP 110, SMTP 465', 'IMAP 995, SMTP 25'],
        correct: 1,
        explanation: 'IMAP mit TLS nutzt 993, die Einreichung von Clients 587 (oder 465 mit implizitem TLS). 995 ist POP3 mit TLS, 25 der Serververkehr.'
      }
    ]
  },
  {
    id: 'sicherheit_betrieb',
    title: '🛡️ IT-Sicherheit im Betrieb',
    difficulty: 'Azubi / IHK',
    questions: [
      {
        q: 'Zwei Systeme mit je 99,9 % Verfügbarkeit müssen nacheinander funktionieren. Wie hoch ist die Gesamtverfügbarkeit?',
        options: ['99,9 %', 'ca. 99,8 %', '99,99 %', '100 %'],
        correct: 1,
        explanation: 'In Reihe multiplizieren sich die Verfügbarkeiten: 0,999 · 0,999 = 0,998. Parallele Redundanz erhöht den Wert dagegen.'
      },
      {
        q: 'Welcher CVSS-Basiswert gilt als kritisch?',
        options: ['ab 4,0', 'ab 7,0', '9,0 bis 10,0', 'nur genau 10,0'],
        correct: 2,
        explanation: 'Niedrig 0,1 bis 3,9, mittel 4,0 bis 6,9, hoch 7,0 bis 8,9, kritisch 9,0 bis 10,0.'
      },
      {
        q: 'Welche Gegenmaßnahme schützt am besten vor SQL-Injection?',
        options: [
          'Längere Passwörter',
          'Parametrisierte Abfragen und Eingabevalidierung',
          'Ein stärkeres WLAN-Passwort',
          'Mehr Arbeitsspeicher'
        ],
        correct: 1,
        explanation: 'Parametrisierte Abfragen trennen Befehl und Daten. Zusätzlich helfen minimale Datenbankrechte.'
      },
      {
        q: 'Warum soll ein verdächtiges System nach einem Vorfall nicht vorschnell ausgeschaltet werden?',
        options: [
          'Weil es dann teurer wird.',
          'Weil flüchtige Daten wie Arbeitsspeicher und laufende Prozesse als Beweis verloren gehen.',
          'Weil es sich selbst repariert.',
          'Weil das gesetzlich verboten ist.'
        ],
        correct: 1,
        explanation: 'Nach der Reihenfolge der Flüchtigkeit sichert man zuerst, was am schnellsten verloren geht. Das System wird zum Schutz vom Netz getrennt.'
      },
      {
        q: 'Bis wann muss eine Datenpanne mit Risiko für Betroffene nach DSGVO der Aufsichtsbehörde gemeldet werden?',
        options: ['Innerhalb von 24 Stunden', 'Möglichst binnen 72 Stunden', 'Innerhalb von 14 Tagen', 'Es gibt keine Frist'],
        correct: 1,
        explanation: 'Art. 33 DSGVO verlangt die Meldung unverzüglich und möglichst binnen 72 Stunden nach Bekanntwerden.'
      },
      {
        q: 'Was zeichnet Zero Trust aus?',
        options: [
          'Das interne Netz gilt als vertrauenswürdig.',
          'Kein Gerät und kein Nutzer wird allein wegen seiner Netzposition vertraut, jeder Zugriff wird geprüft.',
          'Es werden keine Passwörter verwendet.',
          'Es wird nur eine Firewall am Rand betrieben.'
        ],
        correct: 1,
        explanation: 'Zero Trust prüft Identität, Gerätezustand und Kontext bei jedem Zugriff und begrenzt Rechte auf das Nötige.'
      },
      {
        q: 'Was empfehlen BSI und NIST heute zu Passwortwechseln?',
        options: [
          'Alle 30 Tage wechseln',
          'Kein regelmäßiger Zwangswechsel ohne Anlass, dafür lange Passwörter, Einmaligkeit und MFA',
          'Passwörter nie ändern, auch nicht bei Verdacht',
          'Kurze, komplexe Passwörter bevorzugen'
        ],
        correct: 1,
        explanation: 'Ein Wechsel ist bei Verdacht auf Kompromittierung nötig. Pauschale zeitgesteuerte Wechsel sollen vermieden werden.'
      },
      {
        q: 'Welcher Angriff nutzt Zugangsdaten aus Datenlecks bei anderen Diensten?',
        options: ['Credential Stuffing', 'DDoS', 'Man-in-the-Middle', 'Cross-Site-Scripting'],
        correct: 0,
        explanation: 'Credential Stuffing probiert geleakte Kombinationen bei vielen Diensten. Hilfreich sind einmalige Passwörter, Passwortmanager und MFA.'
      }
    ]
  },
  {
    id: 'itsm_projekt',
    title: '🎧 ITSM, Qualität & Projektabschluss',
    difficulty: 'Azubi / IHK',
    questions: [
      {
        q: 'Ein Service ist montags bis freitags von 7 bis 19 Uhr vereinbart (240 h pro Monat), es gab 3 h Ausfall. Wie hoch ist die Verfügbarkeit?',
        options: ['98,75 %', '99,00 %', '97,50 %', '99,60 %'],
        correct: 0,
        explanation: '(240 − 3) : 240 = 98,75 %. Bei 99 % Zusage wären nur 2,4 h Ausfall erlaubt gewesen.'
      },
      {
        q: 'Was ist der Unterschied zwischen funktionaler und hierarchischer Eskalation?',
        options: [
          'Funktional: Übergabe an eine höhere Support-Stufe. Hierarchisch: Information von Vorgesetzten.',
          'Beide sind identisch.',
          'Funktional betrifft nur Hardware.',
          'Hierarchisch ist die Übergabe an den Hersteller.'
        ],
        correct: 0,
        explanation: 'Funktional heißt Ticket an 2nd oder 3rd Level. Hierarchisch heißt, dass Vorgesetzte informiert werden, etwa bei drohender Verletzung eines SLA.'
      },
      {
        q: 'Was ist ein Underpinning Contract (UC)?',
        options: [
          'Vertrag mit einem externen Lieferanten, der ein SLA trägt',
          'Interne Vereinbarung zwischen Teams',
          'Lizenzvertrag für Software',
          'Arbeitsvertrag'
        ],
        correct: 0,
        explanation: 'Ein SLA darf nur zugesagt werden, wenn OLA (intern) und UC (extern) es tragen.'
      },
      {
        q: 'Wofür steht SMART bei Qualitätszielen?',
        options: [
          'Spezifisch, messbar, attraktiv, realistisch, terminiert',
          'Sicher, modern, agil, robust, transparent',
          'Schnell, minimal, automatisch, redundant, testbar',
          'Strukturiert, messbar, abgestimmt, redundant, technisch'
        ],
        correct: 0,
        explanation: 'Messbare Ziele lassen sich bei der Abnahme nachweisen, etwa „mindestens 800 Mbit/s, gemessen mit iPerf bis 30.06.“.'
      },
      {
        q: 'Was passiert mit der Abnahme eines Werkes rechtlich?',
        options: [
          'Die Gewährleistungsfrist beginnt und die Vergütung wird fällig.',
          'Die Gewährleistung endet.',
          'Der Vertrag wird nichtig.',
          'Nichts ändert sich.'
        ],
        correct: 0,
        explanation: 'Mit der Abnahme geht die Gefahr auf den Auftraggeber über. Unwesentliche Mängel hindern sie nicht, sie werden im Protokoll mit Frist festgehalten.'
      },
      {
        q: 'Geplant waren 80 h, benötigt wurden 92 h. Wie hoch ist die Zeitabweichung?',
        options: ['+12 %', '+15 %', '+13 %', '+8 %'],
        correct: 1,
        explanation: '(92 − 80) : 80 = 15 %. Wichtig ist, die Ursachen zu dokumentieren und daraus Lehren zu ziehen.'
      },
      {
        q: 'Wie lange dauern Präsentation und Fachgespräch in der IHK-Projektarbeit höchstens zusammen?',
        options: ['15 Minuten', '30 Minuten', '45 Minuten', '60 Minuten'],
        correct: 1,
        explanation: 'Die Präsentation dauert höchstens etwa 15 Minuten, das Fachgespräch mindestens 15. Zusammen sind es höchstens 30 Minuten (Details der zuständigen IHK beachten).'
      },
      {
        q: 'Wie beantwortest du im Fachgespräch eine Frage zu einer Entscheidung am besten?',
        options: [
          'Mit Entscheidung, Begründung, Alternative und Ergebnis',
          'Mit einer möglichst kurzen Antwort ohne Begründung',
          'Mit einem Verweis auf den Ausbilder',
          'Mit einer Gegenfrage'
        ],
        correct: 0,
        explanation: 'Dieses Muster zeigt, dass du das Projekt selbst durchdacht hast. Bei Unbekanntem ehrlich bleiben und den Denkweg zeigen.'
      }
    ]
  },
  {
    id: 'devops_architektur',
    title: '🐳 DevOps & Softwarearchitektur',
    difficulty: 'Azubi & Senior',
    questions: [
      {
        q: 'Welcher Begriff beschreibt: Jede bestandene Version geht ohne manuelle Freigabe live?',
        options: ['Continuous Integration', 'Continuous Delivery', 'Continuous Deployment', 'Blue-Green'],
        correct: 2,
        explanation: 'Bei Continuous Delivery löst ein Mensch die Produktion aus. Beim Deployment entfällt diese Freigabe, das erfordert sehr gute Tests und Monitoring.'
      },
      {
        q: 'Welche Linux-Funktion begrenzt CPU und Speicher eines Containers?',
        options: ['Namespaces', 'cgroups', 'chroot', 'systemd'],
        correct: 1,
        explanation: 'Control Groups begrenzen Ressourcen. Namespaces trennen die Sicht auf Prozesse, Netzwerk und Dateisysteme.'
      },
      {
        q: 'Welche Deployment-Strategie lässt die neue Version erst für einen kleinen Teil der Nutzer laufen?',
        options: ['Recreate', 'Rolling Update', 'Canary', 'Big Bang'],
        correct: 2,
        explanation: 'Beim Canary-Release steigert man den Anteil schrittweise und beobachtet Fehlerrate und Latenz. Dafür braucht man gutes Monitoring.'
      },
      {
        q: 'Was bewirkt eine Readiness-Probe in Kubernetes?',
        options: [
          'Sie startet den Container neu.',
          'Sie entscheidet, ob der Pod Verkehr über den Service bekommen darf.',
          'Sie baut das Image neu.',
          'Sie löscht Pods.'
        ],
        correct: 1,
        explanation: 'Neustarts löst die Liveness-Probe aus. Die Readiness-Probe schützt vor Anfragen an Pods, die noch hochfahren.'
      },
      {
        q: 'Was bedeutet hohe Kohäsion und lose Kopplung?',
        options: [
          'Bausteine hängen stark voneinander ab und tun vieles.',
          'Ein Baustein hat eine klare Aufgabe, und Bausteine sind wenig voneinander abhängig.',
          'Alle Klassen sind in einer Datei.',
          'Es gibt keine Schnittstellen.'
        ],
        correct: 1,
        explanation: 'Das erhöht die Wartbarkeit: Änderungen bleiben lokal und Bausteine lassen sich getrennt testen.'
      },
      {
        q: 'Fünf Dienste in Reihe haben je 99,9 % Verfügbarkeit. Wie hoch ist die Gesamtverfügbarkeit etwa?',
        options: ['99,9 %', 'ca. 99,5 %', 'ca. 99,0 %', 'ca. 98 %'],
        correct: 1,
        explanation: '0,999 hoch 5 ≈ 0,995. Das sind rund 43,8 Stunden Ausfall pro Jahr statt 8,76 Stunden.'
      },
      {
        q: 'Wie hält man eine fachliche Operation über mehrere Microservices ohne verteilte Datenbanktransaktion konsistent?',
        options: ['Saga mit Kompensationsaktionen', 'Gemeinsame Tabelle', 'Mehr Threads', 'Endlose Wiederholung'],
        correct: 0,
        explanation: 'Eine Saga ist eine Folge lokaler Transaktionen. Bei einem Fehler machen Kompensationsaktionen frühere Schritte fachlich rückgängig.'
      },
      {
        q: 'Was passiert bei einem geöffneten Circuit Breaker?',
        options: [
          'Alle Aufrufe werden zusätzlich wiederholt.',
          'Aufrufe werden sofort abgewiesen, der kranke Dienst wird entlastet.',
          'Der Dienst wird gelöscht.',
          'Die Datenbank wird gesperrt.'
        ],
        correct: 1,
        explanation: 'Nach einer Wartezeit prüft er im Zustand half-open, ob der Dienst wieder antwortet, und schließt bei Erfolg wieder.'
      }
    ]
  },
  {
    id: 'daten_ml',
    title: '📊 Datenanalyse, Statistik & ML',
    difficulty: 'Azubi / IHK (FIDP)',
    questions: [
      {
        q: 'Daten: 2, 4, 4, 5, 7, 9. Wie lauten Median und Modus?',
        options: ['Median 4,5 und Modus 4', 'Median 5 und Modus 4', 'Median 4 und Modus 9', 'Median 5,17 und Modus 5'],
        correct: 0,
        explanation: 'Median = (4 + 5) : 2 = 4,5. Der Modus ist der häufigste Wert, also 4. Der Mittelwert wäre 5,17.'
      },
      {
        q: 'Welche Regel markiert einen Wert in der Faustregel als Ausreißer?',
        options: [
          'Wert über dem Mittelwert',
          'Wert unter Q1 − 1,5·IQR oder über Q3 + 1,5·IQR',
          'Jeder Wert über 100',
          'Jeder Wert, der doppelt vorkommt'
        ],
        correct: 1,
        explanation: 'IQR = Q3 − Q1. Ein Ausreißer ist nicht automatisch ein Fehler und muss fachlich geprüft werden.'
      },
      {
        q: 'Was sagt eine Korrelation von r = 0,95 aus?',
        options: [
          'A verursacht B',
          'Es besteht ein starker gleichläufiger linearer Zusammenhang, aber nicht zwingend ein ursächlicher',
          'Es gibt keinen Zusammenhang',
          'Die Daten sind fehlerhaft'
        ],
        correct: 1,
        explanation: 'Korrelation ist keine Kausalität. Störfaktoren (Confounder) können beide Größen beeinflussen.'
      },
      {
        q: 'Worauf weist hohe Güte im Training, aber deutlich schlechtere im Test hin?',
        options: ['Underfitting', 'Overfitting', 'Datenmangel bei Testdaten ist unmöglich', 'Gutes Modell'],
        correct: 1,
        explanation: 'Das Modell hat sich an das Rauschen der Trainingsdaten angepasst. Abhilfe: mehr Daten, einfacheres Modell, Regularisierung.'
      },
      {
        q: 'TP = 40, FN = 20, FP = 10, TN = 130. Wie hoch ist die Trefferquote (Recall)?',
        options: ['80 %', '85 %', 'ca. 66,7 %', 'ca. 72,7 %'],
        correct: 2,
        explanation: 'Recall = TP : (TP + FN) = 40 : 60. Die Präzision wäre 40 : 50 = 80 %, die Genauigkeit 85 %, F1 ca. 72,7 %.'
      },
      {
        q: 'Warum täuscht die Genauigkeit bei seltenem Betrug?',
        options: [
          'Weil sie immer zu niedrig ist.',
          'Ein Modell, das stets „kein Betrug“ sagt, erreicht trotzdem sehr hohe Genauigkeit.',
          'Weil sie nur für Regression gilt.',
          'Weil sie von der Spaltenanzahl abhängt.'
        ],
        correct: 1,
        explanation: 'Bei unausgewogenen Klassen sind Präzision, Trefferquote und F1 aussagekräftiger.'
      },
      {
        q: 'Welche Lernart gehört zum Clustern von Kunden ohne vorgegebene Gruppen?',
        options: ['Überwachtes Lernen', 'Unüberwachtes Lernen', 'Bestärkendes Lernen', 'Klassifikation'],
        correct: 1,
        explanation: 'Ohne Labels sucht das Verfahren selbst nach Strukturen, etwa mit k-Means.'
      },
      {
        q: 'Min-Max-Normalisierung von 30 bei Minimum 10 und Maximum 50 ergibt:',
        options: ['0,25', '0,5', '0,6', '0,75'],
        correct: 1,
        explanation: '(30 − 10) : (50 − 10) = 20 : 40 = 0,5.'
      }
    ]
  },
  {
    id: 'iiot_industrie40',
    title: '🏭 IIoT, SPS & Industrie 4.0',
    difficulty: 'Azubi / IHK (FIDV)',
    questions: [
      {
        q: 'In welcher Ebene der Automatisierungspyramide arbeitet die SPS?',
        options: ['Feldebene', 'Steuerungsebene', 'Betriebsleitebene', 'Unternehmensebene'],
        correct: 1,
        explanation: 'Darunter liegen Sensoren und Aktoren, darüber SCADA/HMI, MES und ERP.'
      },
      {
        q: 'Wie arbeitet eine SPS ihr Programm ab?',
        options: [
          'Zyklisch: Eingänge lesen, Programm abarbeiten, Ausgänge schreiben',
          'Nur bei Tastendruck',
          'Einmalig beim Einschalten',
          'Zufällig'
        ],
        correct: 0,
        explanation: 'Das Prozessabbild sorgt für konsistente Eingangswerte im Zyklus. Ein Watchdog überwacht die Zykluszeit.'
      },
      {
        q: 'Ein Drucksensor misst 0 bis 10 bar und liefert 4 bis 20 mA. Welcher Druck gehört zu 12 mA?',
        options: ['3 bar', '4 bar', '5 bar', '6 bar'],
        correct: 2,
        explanation: '(12 − 4) : 16 = 0,5, also 0,5 · 10 bar = 5 bar. Bei unter 4 mA liegt ein Fehler wie Leitungsbruch vor.'
      },
      {
        q: 'Warum werden Not-Halt und Stopptaster als Öffner ausgeführt?',
        options: [
          'Weil Öffner billiger sind.',
          'Bei Drahtbruch oder Spannungsausfall fällt der Stromkreis ab und die Anlage geht in den sicheren Zustand.',
          'Weil Schließer nicht für 24 V geeignet sind.',
          'Weil die SPS nur Öffner liest.'
        ],
        correct: 1,
        explanation: 'Das ist das Ruhestromprinzip. Ein Schließer würde einen Leitungsbruch nicht bemerken.'
      },
      {
        q: 'Welches Protokoll arbeitet mit Broker, Topics und Publish-Subscribe?',
        options: ['Modbus RTU', 'PROFIBUS', 'MQTT', 'IO-Link'],
        correct: 2,
        explanation: 'MQTT nutzt Port 1883 (8883 mit TLS) und kennt QoS 0, 1 und 2, Retained Messages und Last Will.'
      },
      {
        q: 'Welche Eigenschaft hat Modbus TCP aus Sicherheitssicht?',
        options: [
          'Es verschlüsselt immer mit TLS.',
          'Es kennt keine Authentifizierung und gehört ins abgesicherte lokale Netz.',
          'Es nutzt Zertifikate.',
          'Es ist nur für das Internet gedacht.'
        ],
        correct: 1,
        explanation: 'Modbus TCP nutzt Port 502. OPC UA bietet dagegen Zertifikate, Signatur und Verschlüsselung.'
      },
      {
        q: 'Eine Anlage läuft 432 von 480 Minuten (Verfügbarkeit 90 %), Leistung 83,3 %, Qualität 95 %. Wie hoch ist die OEE?',
        options: ['ca. 71 %', 'ca. 90 %', 'ca. 89 %', 'ca. 95 %'],
        correct: 0,
        explanation: 'OEE = Verfügbarkeit · Leistung · Qualität = 0,9 · 0,833 · 0,95 ≈ 71,3 %. Es ist ein Produkt, keine Summe.'
      },
      {
        q: 'Was ist eine Maßnahme nach IEC 62443 für vernetzte Anlagen?',
        options: [
          'Alles in ein flaches Netz legen',
          'Netzwerk in Zonen mit kontrollierten Übergängen (Conduits) und DMZ trennen',
          'Herstellerpasswörter beibehalten',
          'Fernzugriff ohne Protokollierung erlauben'
        ],
        correct: 1,
        explanation: 'In der OT haben Verfügbarkeit und Anlagensicherheit Vorrang. Patchen ist oft nur im Wartungsfenster möglich.'
      }
    ]
  },
  {
    id: 'wirtschaft_bilanz',
    title: '🧾 Beschaffung, Bilanz & Zahlungsverkehr',
    difficulty: 'Azubi / IHK',
    questions: [
      {
        q: 'Listenpreis 1.000 Euro, 10 % Rabatt, 2 % Skonto, 30 Euro Bezugskosten. Wie hoch ist der Einstandspreis?',
        options: ['912,00 Euro', '930,00 Euro', '882,00 Euro', '960,00 Euro'],
        correct: 0,
        explanation: '1.000 − 100 = 900 (Ziel), − 18 Skonto = 882 (bar), + 30 = 912 Euro Einstandspreis.'
      },
      {
        q: 'Welche Rechtswirkung hat eine Anfrage?',
        options: ['Sie ist bindend.', 'Sie ist unverbindlich.', 'Sie ist ein Kaufvertrag.', 'Sie verpflichtet zur Lieferung.'],
        correct: 1,
        explanation: 'Erst ein bindendes Angebot und die Bestellung (Antrag und Annahme) führen zum Kaufvertrag.'
      },
      {
        q: 'Was muss ein Kaufmann beim Handelskauf bei der Warenlieferung tun?',
        options: [
          'Die Ware unverzüglich prüfen und offene Mängel unverzüglich rügen',
          'Nach zwei Jahren prüfen',
          'Nichts, denn Mängel verjähren nie',
          'Nur die Stückzahl zählen'
        ],
        correct: 0,
        explanation: 'Das regelt § 377 HGB. Ohne rechtzeitige Rüge gilt die Ware als genehmigt.'
      },
      {
        q: '2 % Skonto bei 10 Tagen, sonst netto in 30 Tagen. Wie hoch ist der Jahreszinssatz des Lieferantenkredits etwa?',
        options: ['ca. 2 %', 'ca. 18 %', 'ca. 36,7 %', 'ca. 72 %'],
        correct: 2,
        explanation: 'p = 2 : 98 · 360 : 20 ≈ 36,7 %. Skonto ziehen und einen günstigeren Kredit nutzen lohnt sich.'
      },
      {
        q: 'Welcher Geschäftsfall ist ein Aktivtausch?',
        options: [
          'Kauf eines Servers auf Rechnung',
          'Kauf eines Servers gegen Banküberweisung',
          'Bezahlung einer Lieferantenrechnung per Bank',
          'Aufnahme eines Darlehens'
        ],
        correct: 1,
        explanation: 'Bank sinkt, Betriebs- und Geschäftsausstattung steigt, die Bilanzsumme bleibt gleich.'
      },
      {
        q: 'Anlagevermögen 400.000, Umlaufvermögen 300.000, Eigenkapital 280.000 Euro. Wie hoch ist die Eigenkapitalquote?',
        options: ['70 %', '40 %', '28 %', '60 %'],
        correct: 1,
        explanation: 'Eigenkapital : Gesamtkapital = 280.000 : 700.000 = 40 %.'
      },
      {
        q: 'Wie lange müssen Buchungsbelege wie Rechnungen nach aktuellem Recht aufbewahrt werden?',
        options: ['3 Jahre', '6 Jahre', '8 Jahre', '10 Jahre'],
        correct: 2,
        explanation: 'Buchungsbelege 8 Jahre (seit 2025), Handelsbriefe 6 Jahre, Bücher, Inventare und Jahresabschlüsse 10 Jahre.'
      },
      {
        q: 'Was gilt für die SEPA-Basislastschrift?',
        options: [
          'Der Zahler kann sie 8 Wochen ohne Angabe von Gründen zurückgeben.',
          'Sie kann nie zurückgegeben werden.',
          'Sie ist nur zwischen Unternehmen möglich.',
          'Sie braucht kein Mandat.'
        ],
        correct: 0,
        explanation: 'Bei nicht autorisiertem Einzug gilt eine längere Frist von 13 Monaten. Die Firmenlastschrift ist nur im B2B-Verkehr möglich.'
      }
    ]
  }
];
