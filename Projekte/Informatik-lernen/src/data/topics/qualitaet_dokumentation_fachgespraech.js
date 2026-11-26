/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Qualitätsmanagement, Qualitätssicherung und den PDCA-Zyklus erklären und Qualitätsziele messbar formulieren',
    'Ein Projekt formal abschließen: Abnahme, Übergabe, Soll-Ist-Vergleich und Lessons Learned',
    'Dokumentationsarten unterscheiden und eine adressatengerechte Projektdokumentation aufbauen',
    'Den Ablauf der betrieblichen Projektarbeit mit Antrag, Dokumentation, Präsentation und Fachgespräch einordnen',
    'Präsentation und Fachgespräch vorbereiten und typische Fragen sachlich beantworten'
  ],
  content: `
## Qualität und Qualitätsmanagement

Nach ISO 9000 ist **Qualität** der Grad, in dem ein Satz inhärenter Merkmale **Anforderungen erfüllt**. Qualität ist also nicht „möglichst gut“, sondern **Erfüllung vereinbarter Anforderungen**. Ein Netzwerk, das alle Vorgaben aus dem Lastenheft erfüllt, hat die geforderte Qualität. Ein überdimensioniertes System kann dagegen unwirtschaftlich sein.

- **Qualitätsmanagement (QM)** umfasst alle Tätigkeiten zur Lenkung einer Organisation hinsichtlich Qualität: Politik, Ziele, Planung, Lenkung, Sicherung und Verbesserung.
- **Qualitätssicherung (QS)** ist ein Teil davon und schafft Vertrauen, dass Anforderungen erfüllt werden: **vorbeugend** (Standards, Schulung, Reviews) und **prüfend** (Tests, Abnahme).
- Die Norm **ISO 9001** beschreibt Anforderungen an ein QM-System, nach dem sich Unternehmen **zertifizieren** lassen können. Grundsätze sind Kundenorientierung, Verantwortung der Führung, Einbeziehung der Mitarbeiter, prozessorientierter Ansatz, Verbesserung, faktengestützte Entscheidungen und Beziehungsmanagement.

### Qualitätsziele formulieren

Gute Ziele sind **SMART**: spezifisch, messbar, attraktiv (akzeptiert), realistisch und terminiert. Statt „Das Netzwerk soll schnell sein“ also: „Der Dateizugriff im Büro erreicht bis 30.06. mindestens 800 Mbit/s im Mittel, gemessen mit iPerf zwischen Client und Server.“ Messbare Ziele lassen sich bei der Abnahme **nachweisen**.

### Der PDCA-Zyklus

![PDCA-Zyklus](pdca-zyklus.svg "Plan, Do, Check, Act als Kreislauf der kontinuierlichen Verbesserung")

Der **PDCA-Zyklus** (Deming-Kreis) beschreibt Verbesserung als Wiederholung von vier Schritten: **Plan** (Ziel und Maßnahmen planen), **Do** (umsetzen), **Check** (Ergebnis mit dem Ziel vergleichen) und **Act** (wirksame Lösungen als Standard einführen oder nachsteuern). Er steckt in ISO 9001, im **kontinuierlichen Verbesserungsprozess (KVP, Kaizen)**, in ITIL und in agilen Retrospektiven. Hilfsmittel für die Ursachenanalyse sind das **Ishikawa-Diagramm** (Fischgräten), die **5-Why-Methode** und das **Pareto-Diagramm** (wenige Ursachen verursachen den Großteil der Fehler).

### Qualitätskosten

**Fehler früh zu finden ist billiger als spät.** Die „Zehnerregel“ besagt grob, dass sich die Kosten der Fehlerbehebung mit jeder Phase etwa verzehnfachen (Entwurf, Umsetzung, Test, Betrieb). Man unterscheidet **Fehlerverhütungskosten** (Schulung, Standards), **Prüfkosten** (Tests, Reviews, Audits) und **Fehlerkosten** (Nacharbeit, Ausfall, Garantie, Imageschaden). Mehr Aufwand in Vorbeugung und Prüfung senkt meist die Gesamtkosten.

### Prüfen und überprüfen

- **Review und Inspektion:** Kollegen lesen Code, Konzepte oder Konfigurationen gegen. Das findet Fehler, die Tests nicht finden (Verständlichkeit, Sicherheit, Architektur).
- **Checklisten** und **Definition of Done** (z. B. Tests grün, Dokumentation aktualisiert, Review erfolgt) machen Qualität wiederholbar.
- **Tests** auf mehreren Ebenen (siehe Artikel zu Softwaretest und Qualität) und **Abnahmetests** nach vereinbarten Kriterien.
- **Audit:** systematische, unabhängige Prüfung, ob Vorgaben eingehalten werden (intern oder durch Dritte).

## Projektabschluss

Ein Projekt endet nicht mit dem letzten Test, sondern mit dem **formalen Abschluss**:

1. **Abnahme:** Der Auftraggeber prüft das Ergebnis anhand der vereinbarten Kriterien. Im **Werkvertrag** ist er zur Abnahme verpflichtet, wenn das Werk im Wesentlichen vertragsgemäß ist (§ 640 BGB). Mit der Abnahme geht die Gefahr auf ihn über, die **Gewährleistungsfrist beginnt**, und die Vergütung wird fällig. Unwesentliche Mängel hindern die Abnahme nicht, sie werden mit Frist zur Behebung festgehalten.
2. **Abnahmeprotokoll:** Datum, Teilnehmer, Prüfgegenstand und Kriterien, Ergebnis je Kriterium, **festgestellte Mängel** mit Frist und Verantwortlichem, Unterschriften beider Seiten. Es ist ein wichtiger Nachweis.
3. **Übergabe an den Betrieb:** Betriebs- und Administrationshandbuch, Benutzerdokumentation, Zugangsdaten und Rechte (gesondert und sicher), **Schulung** und Einweisung, Übergabe der Backup- und Wiederherstellungsverfahren, Klärung von Support und Wartung, Eintrag in CMDB und Monitoring.
4. **Nachkalkulation (Soll-Ist-Vergleich):** Geplante gegen tatsächliche Zeit, Kosten, Umfang und Qualität.
5. **Lessons Learned:** Was lief gut, was nicht, was ändern wir? Sachlich, ohne Schuldzuweisung, mit konkreten Maßnahmen.
6. **Abschlussbericht und Archivierung:** Ergebnisse, Abweichungen, offene Punkte, Projektakte ablegen. Ressourcen freigeben.

### Soll-Ist-Vergleich rechnen

**Beispiel:** Geplant waren 80 Arbeitsstunden bei einem internen Stundensatz von 45 Euro, also 3.600 Euro Personalkosten. Tatsächlich wurden 92 Stunden gebraucht (4.140 Euro).

- Zeitabweichung: 92 − 80 = +12 h, das sind +15 %.
- Kostenabweichung: 4.140 − 3.600 = +540 Euro (+15 %).
- Ursachen benennen (z. B. unerwartete Treiberprobleme, zusätzlicher Test) und die Lehre für künftige Schätzungen ziehen (Puffer einplanen).

**Amortisation** (aus dem Artikel zur Wirtschaftlichkeit): Spart die neue Lösung 200 Euro pro Monat bei Projektkosten von 6.000 Euro, amortisiert sie sich nach 6.000 : 200 = **30 Monaten**. Auch Soll-Ist: Prüfe nach einiger Zeit, ob der geplante Nutzen tatsächlich eintritt.

> [!tip] Praxis
> Dokumentiere Abweichungen und ihre Gründe **während** des Projekts (Projekttagebuch). Rückblickend lässt sich vieles nicht mehr rekonstruieren.

## Dokumentation

Dokumentation ist **Teil der Leistung**, nicht Zusatzaufgabe. Eine Lösung ohne Dokumentation ist nicht betreibbar, nicht wartbar und nicht abnahmefähig.

| Art | Adressat | Inhalt |
| :--- | :--- | :--- |
| **Projektdokumentation** | Auftraggeber, Prüfer | Ziel, Planung, Durchführung, Ergebnis, Bewertung |
| **Betriebs- und Administrationshandbuch** | IT-Betrieb | Aufbau, Konfiguration, Sicherung, Wiederherstellung, Wartung, Fehlerbehebung |
| **Benutzerhandbuch, Kurzanleitung** | Anwender | Bedienung in Alltagssprache mit Bildern |
| **Technische Dokumentation** | Entwickler, Administratoren | Netzplan, Konfigurationsstände, Schnittstellen, Architektur, Datenmodell |
| **Code-Dokumentation** | Entwickler | Kommentare, README, API-Dokumentation, Installationsanleitung |
| **Entscheidungsdokumentation** | Team, Management | Warum wurde so entschieden (z. B. Nutzwertanalyse, ADR) |
| **Protokolle** | alle Beteiligten | Besprechungen, Abnahme, Tests, Änderungen |

**Grundsätze guter Dokumentation:** **adressatengerecht** (Wer liest es, was weiß er schon?), **vollständig, aber knapp**, **aktuell** (veraltete Dokumentation schadet), **versioniert** (Datum, Version, Autor, Änderungshistorie), **auffindbar** (zentraler Ablageort, Wissensdatenbank), **nachvollziehbar** (Schritte, Befehle, Screenshots) und **einheitlich** (Vorlagen, Begriffe). Diagramme (Netzplan, UML, Ablaufdiagramm) sagen oft mehr als ein Absatz, brauchen aber Legende und Erläuterung. Zugangsdaten gehören nicht in Dokumente, sondern in einen Passwortspeicher.

## Die betriebliche Projektarbeit (IHK)

Die Abschlussprüfung Teil 2 der IT-Berufe (Fachinformatiker/-in, Ausbildungsordnung 2020) enthält eine **betriebliche Projektarbeit**. Die Rahmenbedingungen nach den IHK-Hinweisen (Details und Umfang legt die zuständige IHK fest, deshalb vor Beginn deren Handreichung für den eigenen Beruf lesen):

- **Projektantrag:** Beschreibt Thema, Projektumfeld, Ziel, geplante Durchführung und Zeitplan. Der **Prüfungsausschuss genehmigt** ihn. Erst danach beginnt die Durchführung. Der Antrag muss realistisch und im Stundenrahmen machbar sein.
- **Durchführung** im Ausbildungsbetrieb **in eigener Verantwortung** und im vorgegebenen Zeitrahmen (nach den IHK-Hinweisen bis zu 80 Stunden in der Anwendungsentwicklung und höchstens 40 Stunden bei Systemintegration, Daten- und Prozessanalyse und Digitaler Vernetzung, jeweils als Arbeitszeit einschließlich Dokumentation).
- **Dokumentation:** Schriftliche Darstellung des Projekts mit praxisbezogenen Unterlagen, im vorgegebenen Umfang.
- **Präsentation** (höchstens etwa 15 Minuten) und **Fachgespräch** (mindestens 15 Minuten). Zusammen dauern beide höchstens 30 Minuten.
- **Gewichtung:** Innerhalb dieses Prüfungsbereichs zählen die Projektarbeit mit Dokumentation und die Präsentation mit Fachgespräch jeweils etwa zur Hälfte (Quelle: IHK-Hinweise, verbindlich ist die Prüfungsordnung der zuständigen Stelle).

### Aufbau der Projektdokumentation

Typische Gliederung:

1. **Titelblatt, Eigenständigkeitserklärung, Inhaltsverzeichnis.**
2. **Einleitung:** Projektumfeld (Unternehmen, Abteilung, Anonymisierung), Ausgangslage und Problem, Projektziel, Abgrenzung (was gehört nicht dazu), Begriffe.
3. **Projektplanung:** Ist-Analyse, Anforderungen (Muss und Kann), **Soll-Konzept** mit Alternativen und **Entscheidungsbegründung** (z. B. Nutzwertanalyse), **Wirtschaftlichkeit** (Kosten, Nutzen, Amortisation), Zeit- und Ressourcenplanung, Risiken, Datenschutz und IT-Sicherheit.
4. **Durchführung:** Schritte, Konfigurationen und Besonderheiten, abweichende Entscheidungen mit Begründung, aufgetretene Probleme und ihre Lösung.
5. **Test und Abnahme:** Testfälle mit Soll- und Ist-Ergebnis, Abnahmeprotokoll.
6. **Fazit:** **Soll-Ist-Vergleich** (Ziele, Zeit, Kosten), Reflexion, Ausblick.
7. **Anhang:** Quellenverzeichnis, Glossar, Pläne, Konfigurationsauszüge, Kundendokumentation.

> [!warning] Häufige Fehler
> Zu viel Theorie und zu wenig eigene Leistung; Entscheidungen ohne Alternativen und Begründung; fehlende Wirtschaftlichkeit; Tests ohne Soll-Werte; nicht anonymisierte Firmen- und Kundendaten (Betriebsgeheimnisse, personenbezogene Daten); übernommene Texte ohne Quellenangabe (**Täuschungsversuch**); Zeitplan, der nicht zum tatsächlichen Verlauf passt. Rechtschreibung und einheitliches Layout gehören zur Qualität.

### Eigene Leistung und Quellen

Bewertet wird, **was du selbst geplant, entschieden und umgesetzt hast**. Übernommene Inhalte (Zitate, Abbildungen, Herstelleranleitungen) werden gekennzeichnet und im Quellenverzeichnis aufgeführt. Die Eigenständigkeitserklärung bestätigt, dass du das Projekt selbstständig durchgeführt hast. Kooperationen mit Kollegen sind zu benennen.

## Präsentation

Die Präsentation fasst das Projekt in rund 15 Minuten zusammen und soll **nicht die Dokumentation vorlesen**.

**Aufbau:**

1. **Einstieg** (1 Minute): Problem und Nutzen für den Betrieb, kurz und anschaulich.
2. **Ziel und Rahmen** (1 bis 2 Minuten): Ausgangslage, Anforderungen, Zeitrahmen.
3. **Planung und Entscheidung** (3 Minuten): Alternativen, Auswahl mit Begründung, Wirtschaftlichkeit.
4. **Durchführung** (4 bis 5 Minuten): zentrale Schritte, **Kernstück zeigen** (Architekturbild, Demo, Screenshot), Probleme und Lösungen.
5. **Ergebnis** (2 Minuten): Test und Abnahme, Soll-Ist, Nutzen.
6. **Fazit und Ausblick** (1 Minute): Was würde ich anders machen? Wie geht es weiter?

**Gestaltung:** etwa 10 bis 12 Folien (rund eine Minute pro Folie), **eine Kernaussage pro Folie**, wenig Text, große Schrift, Bilder und Diagramme, einheitliche Vorlage. Kein Folientext, den du Wort für Wort vorliest. Die Zeit **üben und mit Stoppuhr prüfen**, Reserve einplanen. Eine Live-Demo ist riskant: Immer ein Ersatz (Screenshots oder Video) bereithalten und die Technik vorher prüfen.

**Auftreten:** Freundlich, Blickkontakt zur Prüfungskommission, langsam und deutlich sprechen, Fachbegriffe verständlich erklären, Pausen setzen.

## Das Fachgespräch

Im Fachgespräch stellt der Prüfungsausschuss Fragen zum Projekt und zum fachlichen Hintergrund. Es soll prüfen, ob du das Projekt **selbst durchgeführt hast** und die Zusammenhänge verstehst. Typische Frageblöcke:

| Block | Beispielfragen |
| :--- | :--- |
| Entscheidung | Warum diese Lösung? Welche Alternativen gab es und warum haben Sie sie verworfen? |
| Technik | Wie funktioniert die Technik im Detail (z. B. VLAN, RAID, Authentifizierung, Datenbankmodell)? |
| Wirtschaftlichkeit | Wie haben Sie Kosten und Nutzen berechnet? Wann amortisiert sich das Projekt? |
| Sicherheit und Datenschutz | Wie sichern Sie die Daten? Welche personenbezogenen Daten sind betroffen? Wie sieht das Backup aus? |
| Planung und Abweichungen | Warum weicht der Ist-Zeitaufwand vom Plan ab? Was würden Sie anders machen? |
| Qualität und Test | Wie haben Sie getestet? Welche Fehler wurden gefunden? |
| Übertragbarkeit | Was ändert sich bei 10-fach größerem Umfang? Wie würden Sie es erweitern? |
| Betrieb | Wer wartet das System, wie wird es überwacht, wie ist die Wiederherstellung? |

**Antwortmuster:** Antworte strukturiert in der Reihenfolge **Entscheidung, Begründung, Alternative, Ergebnis**: „Ich habe mich für X entschieden, weil Y. Z wäre die Alternative gewesen, hat aber den Nachteil W. Im Test hat sich bestätigt, dass …“

**Vorbereitung:** Lies deine Dokumentation vollständig und markiere Stellen, bei denen Fragen kommen könnten. **Verstehe jede Zahl, jeden Befehl und jede Abbildung**, die du verwendest. Notiere Fragen und übe die Antworten laut (mit Ausbilder oder Kollegen). Wiederhole die Grundlagen aus dem Projektumfeld, zum Beispiel Netzwerkgrundlagen, Datenbanken, Sicherheit, Datenschutz.

**Wenn du etwas nicht weißt:** Ehrlich bleiben und den Denkweg zeigen („Das habe ich im Projekt nicht umgesetzt. Ich würde zuerst … prüfen und in der Dokumentation des Herstellers nachsehen.“). Raten und Ausweichen wirken schwächer als offene, strukturierte Antworten. Auf Fehler im Projekt sachlich eingehen: **Was ist passiert, was habe ich daraus gelernt?** Fehlerkultur wird positiv bewertet.

> [!exam] Prüfungshinweis
> In schriftlichen Prüfungsteilen kommen Qualitätssicherung (Test, Review, Abnahme), PDCA, SMART-Ziele, Abnahmeprotokoll, Soll-Ist-Vergleich, Dokumentationsarten und Projektabschluss als Fragen vor. Für die Projektarbeit gilt: Halte dich an die Handreichung deiner IHK, plane Puffer ein und bereite Präsentation und Fachgespräch gesondert vor.
`,
  exercises: [
    {
      id: 'ziel-smart',
      title: 'Qualitätsziel SMART formulieren',
      prompt: 'Formuliere aus „Das neue WLAN soll gut funktionieren und sicher sein“ zwei SMARTe Qualitätsziele, die bei der Abnahme überprüfbar sind.',
      hints: ['Messgröße, Zielwert, Prüfmethode, Termin'],
      solution: 'Beispiele: 1) Leistung: „In allen Büroräumen erreicht ein Client bis zum Abnahmetermin am 30.06. im Mittel mindestens 100 Mbit/s Durchsatz und eine Signalstärke von mindestens −65 dBm, gemessen an 20 festgelegten Messpunkten mit iPerf und einem WLAN-Analyzer.“ 2) Sicherheit: „Das WLAN wird bis zum Abnahmetermin mit WPA3-Enterprise (802.1X) betrieben, Gäste nutzen ein getrenntes VLAN ohne Zugriff auf interne Systeme, nachgewiesen durch Konfigurationsauszug und Zugriffstest.“ Die Ziele sind spezifisch, messbar, mit Prüfmethode und Termin versehen.'
    },
    {
      id: 'soll-ist',
      title: 'Soll-Ist-Vergleich auswerten',
      prompt: 'Ein Projekt wurde mit 60 Stunden und 2.700 Euro (45 Euro/Stunde) geplant. Verbraucht wurden 69 Stunden. Zusätzlich fielen 150 Euro für ein nicht eingeplantes Zubehörteil an. Berechne die Abweichungen in Zeit und Kosten (absolut und in Prozent) und schlage zwei Lehren für künftige Projekte vor.',
      hints: ['Kosten Ist = 69 · 45 + 150'],
      solution: 'Zeit: 69 − 60 = +9 h, das sind +15 %. Personalkosten Ist = 69 · 45 = 3.105 Euro, plus 150 Euro Zubehör = 3.255 Euro. Kostenabweichung = 3.255 − 2.700 = +555 Euro, das entspricht +20,6 %. Lehren: Zeitpuffer von etwa 15 bis 20 % bei Schätzungen einplanen und Risiken sowie Material (Zubehör, Kabel, Lizenzen) vollständig in der Kostenplanung berücksichtigen. Außerdem Abweichungen laufend dokumentieren, um die Ursachen genau zu kennen.'
    },
    {
      id: 'abnahmeprotokoll',
      title: 'Abnahmeprotokoll aufbauen',
      prompt: 'Nenne die Bestandteile eines Abnahmeprotokolls und erkläre, was geschieht, wenn bei der Abnahme ein kleiner, nicht funktionsrelevanter Mangel auffällt.',
      hints: ['Mängel mit Frist festhalten', 'Gewährleistung beginnt mit der Abnahme'],
      solution: 'Bestandteile: Projekt- und Auftragsbezeichnung, Datum und Ort, Teilnehmer, abgenommene Leistung, Prüfkriterien mit Soll- und Ist-Ergebnis, festgestellte Mängel mit Beschreibung, Frist und Verantwortlichem, Aussage zur Abnahme (erfolgt, unter Vorbehalt oder verweigert), Unterschriften beider Seiten. Ein unwesentlicher Mangel berechtigt nicht, die Abnahme zu verweigern. Das Werk wird abgenommen, der Mangel wird im Protokoll mit Frist zur Beseitigung festgehalten. Mit der Abnahme beginnt die Gewährleistungsfrist und die Vergütung wird fällig. Die Nachbesserung wird später erneut bestätigt.'
    },
    {
      id: 'fachgespraech-vorbereiten',
      title: 'Fachgespräch üben',
      prompt: 'Du hast im Projekt eine Dateiablage auf einem NAS mit RAID 5 eingerichtet. Der Prüfer fragt: „Warum RAID 5 und nicht RAID 1 oder RAID 6? Ist damit ein Backup nötig?“ Formuliere eine strukturierte Antwort mit Entscheidung, Begründung, Alternative und Ergebnis.',
      hints: ['RAID ist kein Backup', 'Kapazität, Ausfallsicherheit und Kosten abwägen'],
      solution: 'Beispielantwort: „Ich habe RAID 5 gewählt, weil es bei vier Platten 75 % der Bruttokapazität nutzbar macht und den Ausfall einer Platte verkraftet. RAID 1 hätte nur 50 % Nutzkapazität gebracht und damit den Kostenrahmen gesprengt. RAID 6 verträgt zwei Ausfälle, kostet aber eine weitere Platte an Kapazität und ist bei vier Platten unwirtschaftlich. Bei den eingesetzten Platten (Größe) sehe ich das Risiko eines zweiten Ausfalls während des Rebuilds, daher haben wir Ersatzplatten vorgehalten. Ein Backup bleibt trotzdem nötig, denn RAID schützt nur vor einem Plattenausfall, nicht vor versehentlichem Löschen, Ransomware oder Controllerfehlern. Deshalb gibt es ein tägliches Backup auf ein zweites System und eine Offline-Kopie, deren Wiederherstellung getestet wurde.“'
    }
  ],
  quiz: [
    {
      question: 'Was bedeutet Qualität nach ISO 9000?',
      options: [
        'Möglichst hohe Leistung ohne Rücksicht auf Kosten',
        'Der Grad, in dem Anforderungen erfüllt werden',
        'Das Fehlen jeglicher Fehler',
        'Die Zertifizierung des Unternehmens'
      ],
      correct: 1,
      explanation: 'Qualität ist die Erfüllung festgelegter Anforderungen. Deshalb müssen Anforderungen vorab messbar vereinbart werden.'
    },
    {
      question: 'Welche Phase des PDCA-Zyklus vergleicht das Ergebnis mit dem Ziel?',
      options: ['Plan', 'Do', 'Check', 'Act'],
      correct: 2,
      explanation: 'Im Schritt Check wird geprüft, ob die Maßnahmen das Ziel erreicht haben. In Act folgt Standardisierung oder Nachsteuerung.'
    },
    {
      question: 'Was passiert bei der Abnahme eines Werkes rechtlich?',
      options: [
        'Die Gewährleistungsfrist endet',
        'Die Gewährleistungsfrist beginnt, die Vergütung wird fällig',
        'Der Vertrag erlischt',
        'Nichts, die Abnahme ist nur eine Formalität'
      ],
      correct: 1,
      explanation: 'Mit der Abnahme beginnt die Gewährleistung, die Gefahr geht auf den Auftraggeber über und die Vergütung wird fällig.'
    },
    {
      question: 'Welche Angabe gehört NICHT in ein Abnahmeprotokoll?',
      options: [
        'Festgestellte Mängel mit Frist',
        'Prüfkriterien mit Ergebnis',
        'Unterschriften beider Parteien',
        'Passwörter der Administratorkonten im Klartext'
      ],
      correct: 3,
      explanation: 'Zugangsdaten gehören nicht in Dokumente, sondern gesondert in einen Passwortspeicher oder eine geschützte Übergabe.'
    },
    {
      question: 'Wofür steht SMART bei Zielen?',
      options: [
        'Spezifisch, messbar, attraktiv, realistisch, terminiert',
        'Sicher, modern, agil, robust, transparent',
        'Schnell, minimal, automatisch, reproduzierbar, testbar',
        'Strukturiert, messbar, abgestimmt, redundant, technisch'
      ],
      correct: 0,
      explanation: 'SMART beschreibt Kriterien für überprüfbare Ziele: spezifisch, messbar, attraktiv bzw. akzeptiert, realistisch und terminiert.'
    },
    {
      question: 'Wie sollte die Präsentation im IHK-Projekt gestaltet sein?',
      options: [
        'Die Dokumentation wird Wort für Wort vorgelesen',
        'Rund 15 Minuten, eine Kernaussage pro Folie, mit Fokus auf Entscheidungen und Ergebnis',
        'Möglichst viele technische Details auf jeder Folie',
        'Ohne Probelauf, um spontan zu wirken'
      ],
      correct: 1,
      explanation: 'Die Präsentation fasst das Projekt zusammen, zeigt Entscheidungen und Ergebnis anschaulich und wird mit Zeitmessung geübt.'
    },
    {
      question: 'Wie reagierst du im Fachgespräch am besten auf eine Frage, deren Antwort du nicht kennst?',
      options: [
        'Raten und hoffen',
        'Das Thema wechseln',
        'Ehrlich sagen, was du nicht weißt, und zeigen, wie du die Antwort herleiten oder nachschlagen würdest',
        'Schweigen'
      ],
      correct: 2,
      explanation: 'Offenheit und ein nachvollziehbarer Denkweg wirken überzeugender als Raten. Der Ausschuss bewertet auch Fachlichkeit und Reflexionsfähigkeit.'
    }
  ],
  relatedLabs: [
    { id: 'oral_defense_studio', label: 'Fachgespräch-Studio' },
    { id: 'oral_exam', label: 'Mündliche Prüfung' },
    { id: 'testverfahren_lab', label: 'Testverfahren' }
  ],
  sources: [
    { title: 'IHK Rheinhessen: Hinweise zur Abschlussprüfung in den IT-Berufen (VO 2020)', url: 'https://www.ihk.de/rheinhessen/aus-und-weiterbildung/berufe-a-z/pruefungshinweise-it-berufe-6637558' },
    { title: 'Gesetze im Internet: § 640 BGB (Abnahme)', url: 'https://www.gesetze-im-internet.de/bgb/__640.html' },
    { title: 'Wikipedia: Qualitätsmanagement', url: 'https://de.wikipedia.org/wiki/Qualit%C3%A4tsmanagement' },
    { title: 'Wikipedia: PDCA-Zyklus', url: 'https://de.wikipedia.org/wiki/PDCA-Zyklus' },
    { title: 'ISO 9001:2015', note: 'Norm für Qualitätsmanagementsysteme, kostenpflichtig' }
  ],
  sourcesCheckedOn: '25.11.2026'
};
