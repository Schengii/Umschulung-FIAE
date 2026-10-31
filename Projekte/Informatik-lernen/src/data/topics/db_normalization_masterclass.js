/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Einfüge-, Änderungs- und Löschanomalien an Beispielen erkennen',
    'Funktionale, voll funktionale und transitive Abhängigkeiten bestimmen',
    'Eine Tabelle Schritt für Schritt in die 1., 2. und 3. Normalform überführen',
    'BCNF einordnen und begründen, wann bewusste Denormalisierung sinnvoll ist'
  ],
  content: `
## Warum normalisieren?

Speichert man alles in einer großen Tabelle, entstehen **Redundanzen** (dieselbe Information mehrfach) und daraus **Anomalien**:

| Anomalie | Problem | Beispiel |
| :--- | :--- | :--- |
| **Einfügeanomalie** | Daten lassen sich nicht erfassen, ohne andere, noch unbekannte Daten mitzuerfassen | Ein neuer Artikel kann erst angelegt werden, wenn ihn jemand gekauft hat |
| **Änderungsanomalie** | eine Änderung muss an vielen Stellen erfolgen, sonst wird es widersprüchlich | Zieht ein Kunde um, muss seine Adresse in 200 Rechnungszeilen geändert werden |
| **Löschanomalie** | beim Löschen gehen ungewollt weitere Informationen verloren | Wird die einzige Rechnung eines Kunden gelöscht, ist auch der Kunde weg |

**Normalisierung** zerlegt Tabellen schrittweise so, dass jede Information **genau einmal** gespeichert wird – ohne dass Informationen verloren gehen (die Tabellen lassen sich per JOIN wieder zusammensetzen).

## Funktionale Abhängigkeit

Ein Attribut B ist **funktional abhängig** von A (geschrieben **A → B**), wenn zu jedem Wert von A genau ein Wert von B gehört. Beispiel: \`KundenNr → Kundenname\`.

- **Voll funktional abhängig**: B hängt vom **gesamten** zusammengesetzten Schlüssel ab, nicht schon von einem Teil. \`(RechnungsNr, ArtikelNr) → Menge\` ist voll funktional; \`(RechnungsNr, ArtikelNr) → Bezeichnung\` nicht, denn schon \`ArtikelNr → Bezeichnung\`.
- **Transitiv abhängig**: B hängt über ein anderes Nicht-Schlüsselattribut vom Schlüssel ab: \`KundenNr → PLZ → Ort\`.

## Das durchgehende Beispiel

Ein Händler erfasst Rechnungen bisher so (**unnormalisiert**, 0NF):

| RechnungsNr | Datum | Kunde | Artikel |
| :--- | :--- | :--- | :--- |
| R-101 | 03.10.2026 | K-7 Meyer, 44137 Dortmund | A-1 Maus (2 × 20 €), A-5 Kabel (3 × 5 €) |
| R-102 | 05.10.2026 | K-9 Schulz, 45127 Essen | A-1 Maus (1 × 20 €) |
| R-103 | 06.10.2026 | K-7 Meyer, 44137 Dortmund | A-9 Monitor (1 × 189 €) |

### 1. Normalform: atomare Werte

> [!info] Definition 1NF
> Alle Attribute enthalten nur **atomare** (nicht weiter zerlegbare) Werte, und es gibt keine **Wiederholungsgruppen**.

Die Spalten „Kunde“ und „Artikel“ enthalten mehrere Informationen bzw. Listen. Wir zerlegen sie und schreiben **eine Zeile je Rechnungsposition**. Primärschlüssel ist jetzt **(RechnungsNr, ArtikelNr)**.

| RechnungsNr | ArtikelNr | Datum | KundenNr | Name | PLZ | Ort | Bezeichnung | Menge | Preis |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | ---: | ---: |
| R-101 | A-1 | 03.10.2026 | K-7 | Meyer | 44137 | Dortmund | Maus | 2 | 20,00 |
| R-101 | A-5 | 03.10.2026 | K-7 | Meyer | 44137 | Dortmund | Kabel | 3 | 5,00 |
| R-102 | A-1 | 05.10.2026 | K-9 | Schulz | 45127 | Essen | Maus | 1 | 20,00 |
| R-103 | A-9 | 06.10.2026 | K-7 | Meyer | 44137 | Dortmund | Monitor | 1 | 189,00 |

Jetzt sieht man die Redundanz deutlich: „Meyer, 44137 Dortmund“ steht dreimal da.

### 2. Normalform: keine Teilabhängigkeiten

> [!info] Definition 2NF
> Die Tabelle ist in 1NF, und jedes Nicht-Schlüsselattribut ist **voll funktional** vom **gesamten** Primärschlüssel abhängig.

Abhängigkeiten prüfen:

- \`RechnungsNr → Datum, KundenNr, Name, PLZ, Ort\` (nur vom ersten Teil des Schlüssels)
- \`ArtikelNr → Bezeichnung\` (nur vom zweiten Teil)
- \`(RechnungsNr, ArtikelNr) → Menge, Preis\` (vom ganzen Schlüssel)

Jede Teilabhängigkeit wird eine eigene Tabelle:

- **Rechnung**(RechnungsNr, Datum, KundenNr, Name, PLZ, Ort)
- **Artikel**(ArtikelNr, Bezeichnung, Listenpreis)
- **Position**(RechnungsNr, ArtikelNr, Menge, Preis)

> [!tip] Wohin gehört der Preis?
> Der **Verkaufspreis zum Rechnungsdatum** gehört in die Position, sonst würde eine spätere Preisänderung alte Rechnungen verfälschen. Der aktuelle **Listenpreis** gehört zum Artikel. Wer das in der Prüfung begründet, zeigt Verständnis.

Eine Tabelle mit **einspaltigem** Primärschlüssel ist automatisch in 2NF, wenn sie in 1NF ist.

### 3. Normalform: keine transitiven Abhängigkeiten

> [!info] Definition 3NF
> Die Tabelle ist in 2NF, und kein Nicht-Schlüsselattribut hängt **transitiv** (über ein anderes Nicht-Schlüsselattribut) vom Primärschlüssel ab.

In **Rechnung** gilt \`RechnungsNr → KundenNr → Name, PLZ\` und \`PLZ → Ort\`. Wir lagern aus:

- **Rechnung**(RechnungsNr, Datum, KundenNr)
- **Kunde**(KundenNr, Name, PLZ)
- **Ort**(PLZ, Ort)
- **Artikel**(ArtikelNr, Bezeichnung, Listenpreis)
- **Position**(RechnungsNr, ArtikelNr, Menge, Preis)

![Datenmodell nach der 3. Normalform](normalisierung.svg "Fünf Tabellen mit Primär- und Fremdschlüsseln")

> [!warning] PLZ und Ort in der Praxis
> In Deutschland gibt es Postleitzahlen für mehrere Orte und Orte mit vielen Postleitzahlen. Die Abhängigkeit \`PLZ → Ort\` gilt also nicht streng. In Prüfungsaufgaben wird sie meist trotzdem angenommen; in echten Systemen speichert man PLZ und Ort oft gemeinsam in der Adresse.

## Merksatz

> „Jedes Nicht-Schlüsselattribut hängt vom **Schlüssel** ab (1NF), vom **ganzen Schlüssel** (2NF) und von **nichts als dem Schlüssel** (3NF).“

## Boyce-Codd-Normalform (BCNF)

Die **BCNF** verschärft die 3NF: **Jede Determinante** (jedes Attribut, von dem andere funktional abhängen) muss ein **Schlüsselkandidat** sein. Unterschiede zur 3NF treten nur bei mehreren, sich überlappenden zusammengesetzten Schlüsselkandidaten auf – in der IHK-Prüfung spielt sie selten eine Rolle. Darüber hinaus gibt es die 4. und 5. Normalform für mehrwertige Abhängigkeiten.

## Denormalisierung

Normalisierte Datenbanken brauchen viele JOINs. Für **Auswertungen** (Data Warehouse, Berichte) oder sehr häufig gelesene Daten wird manchmal **bewusst** denormalisiert, z. B. eine Spalte \`rechnungssumme\` in der Rechnung, obwohl sie sich aus den Positionen berechnen ließe. Das spart Rechenzeit, verlangt aber, dass die Anwendung (oder ein Trigger) den Wert bei jeder Änderung aktualisiert. Denormalisierung ist eine **dokumentierte Entscheidung**, kein Ersatz für ein sauberes Modell.
`,
  codeSnippet: `-- Das 3NF-Modell als SQL
CREATE TABLE ort      (plz CHAR(5) PRIMARY KEY, ort VARCHAR(80) NOT NULL);
CREATE TABLE kunde    (kunden_nr VARCHAR(10) PRIMARY KEY, name VARCHAR(100) NOT NULL,
                       plz CHAR(5) NOT NULL REFERENCES ort(plz));
CREATE TABLE artikel  (artikel_nr VARCHAR(10) PRIMARY KEY, bezeichnung VARCHAR(100) NOT NULL,
                       listenpreis DECIMAL(10,2) NOT NULL);
CREATE TABLE rechnung (rechnungs_nr VARCHAR(10) PRIMARY KEY, datum DATE NOT NULL,
                       kunden_nr VARCHAR(10) NOT NULL REFERENCES kunde(kunden_nr));
CREATE TABLE position (rechnungs_nr VARCHAR(10) REFERENCES rechnung(rechnungs_nr),
                       artikel_nr   VARCHAR(10) REFERENCES artikel(artikel_nr),
                       menge INTEGER NOT NULL CHECK (menge > 0),
                       preis DECIMAL(10,2) NOT NULL,
                       PRIMARY KEY (rechnungs_nr, artikel_nr));

-- Die ursprüngliche Ansicht lässt sich jederzeit per JOIN zurückgewinnen
SELECT r.rechnungs_nr, r.datum, k.name, o.ort, a.bezeichnung, p.menge, p.preis
FROM rechnung r
JOIN kunde k    ON k.kunden_nr = r.kunden_nr
JOIN ort o      ON o.plz = k.plz
JOIN position p ON p.rechnungs_nr = r.rechnungs_nr
JOIN artikel a  ON a.artikel_nr = p.artikel_nr;`,
  codeLanguage: 'SQL',
  exercises: [
    {
      id: 'anomalien',
      title: 'Anomalien benennen',
      prompt: 'Eine Schule speichert alles in einer Tabelle **Belegung**(SchuelerNr, SchuelerName, Klasse, KursNr, Kursname, LehrerNr, Lehrername, Raum). Nenne je ein konkretes Beispiel für eine Einfüge-, eine Änderungs- und eine Löschanomalie.',
      solution: '- **Einfügeanomalie**: Ein neuer Kurs mit Lehrer und Raum kann nicht angelegt werden, solange kein Schüler ihn belegt (SchuelerNr ist Teil des Schlüssels und darf nicht leer sein).\n- **Änderungsanomalie**: Heiratet eine Lehrerin und ändert ihren Namen, muss er in allen Zeilen aller Schüler ihrer Kurse geändert werden – vergisst man eine, ist die Datenbank widersprüchlich.\n- **Löschanomalie**: Verlässt der letzte Schüler eines Kurses die Schule und wird gelöscht, gehen auch Kursname, Lehrer und Raum dieses Kurses verloren.'
    },
    {
      id: 'normalisieren-werkstatt',
      title: 'Bis zur 3NF normalisieren',
      prompt: 'Eine Kfz-Werkstatt speichert Aufträge so (bereits in 1NF):\n\n**Auftrag**(AuftragsNr, PositionNr, Datum, KennzeichenNr, Fahrzeugtyp, HalterNr, Haltername, LeistungsNr, Leistung, Stundensatz, Stunden)\n\nSchlüssel ist (AuftragsNr, PositionNr). Es gelten: AuftragsNr → Datum, KennzeichenNr; KennzeichenNr → Fahrzeugtyp, HalterNr; HalterNr → Haltername; LeistungsNr → Leistung, Stundensatz; (AuftragsNr, PositionNr) → LeistungsNr, Stunden.\n\nÜberführe die Relation in die 3NF.',
      hints: ['2NF: Was hängt nur von AuftragsNr ab?', '3NF: Folge den Ketten KennzeichenNr → HalterNr → Haltername und LeistungsNr → Stundensatz.'],
      solution: '**2NF** (Teilabhängigkeit von AuftragsNr auflösen):\n- Auftrag(AuftragsNr, Datum, KennzeichenNr, Fahrzeugtyp, HalterNr, Haltername)\n- Position(AuftragsNr, PositionNr, LeistungsNr, Leistung, Stundensatz, Stunden)\n\n**3NF** (transitive Abhängigkeiten auflösen):\n- **Auftrag**(AuftragsNr, Datum, KennzeichenNr → Fahrzeug)\n- **Fahrzeug**(KennzeichenNr, Fahrzeugtyp, HalterNr → Halter)\n- **Halter**(HalterNr, Haltername)\n- **Position**(AuftragsNr, PositionNr, LeistungsNr → Leistung, Stunden)\n- **Leistung**(LeistungsNr, Leistung, Stundensatz)\n\nHinweis: Soll der Stundensatz zum Auftragszeitpunkt erhalten bleiben, speichert man ihn zusätzlich in der Position.'
    },
    {
      id: 'normalform-bestimmen',
      title: 'Normalform bestimmen',
      prompt: 'In welcher (höchsten) Normalform befinden sich die Relationen? Begründe.\n\n1. Mitarbeiter(PersNr, Name, AbteilungsNr, Abteilungsname)\n2. Projektarbeit(PersNr, ProjektNr, Stunden, Projektname)\n3. Kurs(KursNr, Titel, Dozent) – ein Dozent kann mehrere Kurse haben',
      solution: '1. **2NF**, nicht 3NF: einspaltiger Schlüssel, aber PersNr → AbteilungsNr → Abteilungsname ist transitiv.\n2. **1NF**, nicht 2NF: Projektname hängt nur von ProjektNr ab, also nur von einem Teil des Schlüssels (PersNr, ProjektNr).\n3. **3NF**: einspaltiger Schlüssel, Titel und Dozent hängen direkt und nur von KursNr ab. Dass ein Dozent mehrere Kurse hat, ist keine Abhängigkeit Dozent → Titel.'
    }
  ],
  quiz: [
    {
      question: 'Wann ist eine Relation in der 1. Normalform?',
      options: ['Wenn sie einen Fremdschlüssel hat', 'Wenn alle Attribute atomar sind und es keine Wiederholungsgruppen gibt', 'Wenn keine transitiven Abhängigkeiten bestehen', 'Wenn sie weniger als 10 Spalten hat'],
      correct: 1,
      explanation: '1NF verlangt atomare Werte, z. B. Vorname und Nachname in getrennten Spalten und keine Listen in einer Zelle.'
    },
    {
      question: 'Welche Abhängigkeit verletzt die 2. Normalform?',
      options: ['Ein Attribut hängt nur von einem Teil eines zusammengesetzten Schlüssels ab', 'Ein Attribut hängt über ein anderes Nicht-Schlüsselattribut vom Schlüssel ab', 'Ein Attribut ist nicht atomar', 'Ein Attribut ist NULL'],
      correct: 0,
      explanation: 'Teilschlüsselabhängigkeiten verletzen die 2NF. Transitive Abhängigkeiten verletzen die 3NF.'
    },
    {
      question: 'Eine Relation hat einen einspaltigen Primärschlüssel und ist in 1NF. Was gilt dann sicher?',
      options: ['Sie ist in 3NF', 'Sie ist in 2NF', 'Sie ist in BCNF', 'Nichts davon'],
      correct: 1,
      explanation: 'Ohne zusammengesetzten Schlüssel kann es keine Teilabhängigkeit geben, also ist sie in 2NF. 3NF ist damit nicht garantiert.'
    },
    {
      question: 'KundenNr → PLZ → Ort ist ein Beispiel für …',
      options: ['eine voll funktionale Abhängigkeit', 'eine transitive Abhängigkeit', 'eine mehrwertige Abhängigkeit', 'eine Wiederholungsgruppe'],
      correct: 1,
      explanation: 'Ort hängt über PLZ (ein Nicht-Schlüsselattribut) vom Schlüssel ab – das verletzt die 3NF.'
    },
    {
      question: 'Was ist eine Löschanomalie?',
      options: [
        'Ein Datensatz kann nicht gelöscht werden',
        'Beim Löschen eines Datensatzes gehen ungewollt weitere Informationen verloren',
        'Gelöschte Daten tauchen wieder auf',
        'Ein DELETE ohne WHERE'
      ],
      correct: 1,
      explanation: 'Beispiel: Mit der letzten Bestellung verschwindet auch die Kundenadresse, weil sie nur dort gespeichert war.'
    },
    {
      question: 'Warum wird manchmal bewusst denormalisiert?',
      options: ['Um Speicherplatz zu sparen', 'Um Lesezugriffe zu beschleunigen, z. B. für Auswertungen', 'Weil die 3NF verboten ist', 'Um Anomalien zu erzeugen'],
      correct: 1,
      explanation: 'Weniger JOINs bedeuten schnellere Abfragen. Der Preis ist Redundanz, die die Anwendung konsistent halten muss.'
    }
  ],
  relatedLabs: [
    { id: 'database_normalization_lab', label: 'Normalisierungs-Lab' },
    { id: 'erd_designer', label: 'ER-Diagramm-Designer' },
    { id: 'sqlite_studio', label: 'SQLite-Studio' }
  ],
  sources: [
    { title: 'Codd, E. F. (1970): A Relational Model of Data for Large Shared Data Banks', url: 'https://dl.acm.org/doi/10.1145/362384.362685' },
    { title: 'Kent, W. (1983): A Simple Guide to Five Normal Forms in Relational Database Theory', url: 'https://www.bkent.net/Doc/simple5.htm' },
    { title: 'Wikipedia: Normalisierung (Datenbank)', url: 'https://de.wikipedia.org/wiki/Normalisierung_(Datenbank)' },
    { title: 'Microsoft Learn: Beschreibung der Grundlagen der Datenbanknormalisierung', url: 'https://learn.microsoft.com/de-de/office/troubleshoot/access/database-normalization-description' },
    { title: 'Eigene Volltextnotiz „SQL-Grundlagen und Syntax“ (Obsidian-Vault)', note: 'nicht öffentlich' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
