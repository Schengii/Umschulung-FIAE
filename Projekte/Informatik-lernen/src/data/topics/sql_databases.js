/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Primär-, Fremd- und zusammengesetzte Schlüssel erklären und Beziehungen (1:1, 1:n, n:m) im ER-Modell darstellen',
    'Tabellen mit CREATE TABLE und Constraints anlegen sowie Daten einfügen, ändern und löschen',
    'Abfragen mit WHERE, JOIN, GROUP BY, HAVING, ORDER BY und Unterabfragen schreiben',
    'Transaktionen und die ACID-Eigenschaften erklären'
  ],
  content: `
## Grundbegriffe

Eine **Datenbank** speichert Daten dauerhaft, strukturiert und widerspruchsfrei. Verwaltet wird sie vom **Datenbankmanagementsystem (DBMS)**, z. B. PostgreSQL, MySQL/MariaDB, Microsoft SQL Server, Oracle oder SQLite. Im **relationalen Modell** liegen die Daten in **Tabellen** (Relationen):

- **Zeile** = Datensatz (Tupel)
- **Spalte** = Attribut mit festem Datentyp
- **Primärschlüssel (PK)**: identifiziert jede Zeile eindeutig, darf nicht NULL sein
- **Fremdschlüssel (FK)**: verweist auf den Primärschlüssel einer anderen Tabelle und stellt so die Beziehung her
- **Zusammengesetzter Schlüssel**: mehrere Spalten bilden gemeinsam den Primärschlüssel
- **Surrogatschlüssel**: künstliche ID ohne fachliche Bedeutung (z. B. fortlaufende Nummer), im Gegensatz zum **natürlichen Schlüssel** (z. B. ISBN)

**Referenzielle Integrität** bedeutet: Jeder Fremdschlüsselwert verweist auf einen existierenden Datensatz. Das DBMS verhindert z. B., dass eine Bestellung auf einen nicht vorhandenen Kunden zeigt.

## Das Entity-Relationship-Modell

Vor dem Anlegen der Tabellen modelliert man im **ER-Modell**: **Entitäten** (Kunde, Artikel), ihre **Attribute** und die **Beziehungen** mit ihren **Kardinalitäten**.

| Kardinalität | Beispiel | Umsetzung in Tabellen |
| :--- | :--- | :--- |
| **1:1** | Mitarbeiter – Dienstwagen | Fremdschlüssel mit UNIQUE in einer der beiden Tabellen |
| **1:n** | Kunde – Bestellungen | Fremdschlüssel auf der **n-Seite** (\`bestellungen.kunden_id\`) |
| **n:m** | Bestellungen – Artikel | eigene **Zwischentabelle** (\`bestellpositionen\`) mit beiden Fremdschlüsseln |

In der **Min-Max-Notation** schreibt man z. B. (0,n): Ein Kunde hat null bis viele Bestellungen; (1,1): Eine Bestellung gehört zu genau einem Kunden.

## SQL-Sprachbereiche

| Bereich | Bedeutung | Befehle |
| :--- | :--- | :--- |
| **DDL** (Data Definition) | Struktur festlegen | \`CREATE\`, \`ALTER\`, \`DROP\`, \`TRUNCATE\` |
| **DML** (Data Manipulation) | Daten ändern | \`INSERT\`, \`UPDATE\`, \`DELETE\` |
| **DQL** (Data Query) | Daten abfragen | \`SELECT\` |
| **DCL** (Data Control) | Rechte vergeben | \`GRANT\`, \`REVOKE\` |
| **TCL** (Transaction Control) | Transaktionen steuern | \`BEGIN\`, \`COMMIT\`, \`ROLLBACK\` |

## Tabellen anlegen

\`\`\`sql
CREATE TABLE kunden (
  kunden_id  INTEGER PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(255) UNIQUE,
  ort        VARCHAR(80)
);

CREATE TABLE bestellungen (
  bestell_id INTEGER PRIMARY KEY,
  kunden_id  INTEGER NOT NULL REFERENCES kunden(kunden_id) ON DELETE RESTRICT,
  datum      DATE NOT NULL DEFAULT CURRENT_DATE,
  betrag     DECIMAL(10, 2) CHECK (betrag >= 0)
);
\`\`\`

Wichtige **Constraints**: \`PRIMARY KEY\`, \`FOREIGN KEY\`/\`REFERENCES\`, \`NOT NULL\`, \`UNIQUE\`, \`CHECK\`, \`DEFAULT\`. Mit \`ON DELETE CASCADE\` würden beim Löschen eines Kunden seine Bestellungen mitgelöscht, \`RESTRICT\` verbietet das Löschen, solange noch Bestellungen existieren.

> [!tip] Geldbeträge
> Für Geld immer \`DECIMAL\`/\`NUMERIC\` verwenden, nie \`FLOAT\` – Gleitkommazahlen runden (0,1 + 0,2 ≠ 0,3).

## Daten ändern

\`\`\`sql
INSERT INTO kunden (kunden_id, name, ort) VALUES (1, 'Meyer', 'Dortmund'), (2, 'Schulz', 'Essen');

UPDATE kunden SET ort = 'Bochum' WHERE kunden_id = 2;

DELETE FROM kunden WHERE kunden_id = 3;
\`\`\`

> [!warning] Ohne WHERE trifft es alle
> \`UPDATE kunden SET ort = 'Bochum';\` ändert **jede** Zeile der Tabelle. Vor kritischen Änderungen die Bedingung erst mit \`SELECT\` testen und in einer Transaktion arbeiten.

## Abfragen mit SELECT

\`\`\`sql
SELECT   ort, COUNT(*) AS anzahl
FROM     kunden
WHERE    name LIKE 'M%'
GROUP BY ort
HAVING   COUNT(*) >= 2
ORDER BY anzahl DESC
LIMIT    10;
\`\`\`

Die **logische Ausführungsreihenfolge** unterscheidet sich von der Schreibweise: **FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT**. Deshalb kann man in \`WHERE\` keinen Spaltenalias aus dem SELECT verwenden und keine Aggregatfunktion – dafür gibt es \`HAVING\`.

| Operator | Beispiel |
| :--- | :--- |
| Vergleich | \`betrag > 100\`, \`ort <> 'Essen'\` |
| Bereich | \`datum BETWEEN '2026-01-01' AND '2026-03-31'\` |
| Liste | \`ort IN ('Dortmund', 'Essen')\` |
| Muster | \`name LIKE 'M%'\` (% = beliebig viele Zeichen, _ = genau eins) |
| NULL | \`email IS NULL\` (nie \`= NULL\`!) |

### Aggregatfunktionen

\`COUNT\`, \`SUM\`, \`AVG\`, \`MIN\`, \`MAX\`. \`COUNT(*)\` zählt alle Zeilen, \`COUNT(email)\` nur die, in denen \`email\` nicht NULL ist. Jede Spalte im SELECT, die nicht in einer Aggregatfunktion steckt, muss im \`GROUP BY\` stehen.

## JOINs

![Mengendiagramme der JOIN-Arten](sql-joins.svg "INNER, LEFT, RIGHT und FULL OUTER JOIN im Vergleich")

\`\`\`sql
-- Kunden mit ihren Bestellungen (nur Kunden, die bestellt haben)
SELECT k.name, b.datum, b.betrag
FROM kunden k
INNER JOIN bestellungen b ON b.kunden_id = k.kunden_id;

-- Alle Kunden, auch ohne Bestellung, mit Umsatz
SELECT k.name, COALESCE(SUM(b.betrag), 0) AS umsatz
FROM kunden k
LEFT JOIN bestellungen b ON b.kunden_id = k.kunden_id
GROUP BY k.kunden_id, k.name;

-- Kunden ohne jede Bestellung
SELECT k.name
FROM kunden k
LEFT JOIN bestellungen b ON b.kunden_id = k.kunden_id
WHERE b.bestell_id IS NULL;
\`\`\`

Ein **CROSS JOIN** (oder ein vergessenes \`ON\`) bildet das kartesische Produkt: 1.000 Kunden × 10.000 Bestellungen = 10 Millionen Zeilen. Ein **Self Join** verknüpft eine Tabelle mit sich selbst, z. B. Mitarbeiter mit ihren Vorgesetzten.

## Unterabfragen und Views

\`\`\`sql
-- Bestellungen über dem Durchschnitt
SELECT bestell_id, betrag
FROM bestellungen
WHERE betrag > (SELECT AVG(betrag) FROM bestellungen);

-- Kunden, die schon einmal bestellt haben
SELECT name FROM kunden k
WHERE EXISTS (SELECT 1 FROM bestellungen b WHERE b.kunden_id = k.kunden_id);

-- Gespeicherte Abfrage als View
CREATE VIEW umsatz_je_kunde AS
SELECT kunden_id, SUM(betrag) AS umsatz FROM bestellungen GROUP BY kunden_id;
\`\`\`

## Indizes

Ein **Index** (meist ein B-Baum) beschleunigt die Suche nach Werten einer Spalte – wie das Stichwortverzeichnis eines Buches. Primärschlüssel sind automatisch indiziert; Fremdschlüssel und häufig gefilterte Spalten sollte man selbst indizieren (\`CREATE INDEX idx_best_kunde ON bestellungen(kunden_id);\`). Jeder Index kostet Speicher und verlangsamt Schreibvorgänge.

## Transaktionen und ACID

Eine **Transaktion** fasst mehrere Befehle zu einer Einheit zusammen – entweder alles oder nichts:

\`\`\`sql
BEGIN;
UPDATE konten SET saldo = saldo - 100 WHERE konto_id = 1;
UPDATE konten SET saldo = saldo + 100 WHERE konto_id = 2;
COMMIT;      -- bei einem Fehler stattdessen: ROLLBACK;
\`\`\`

| Eigenschaft | Bedeutung |
| :--- | :--- |
| **A**tomicity (Atomarität) | alles oder nichts |
| **C**onsistency (Konsistenz) | nach der Transaktion sind alle Regeln (Constraints) erfüllt |
| **I**solation | parallele Transaktionen beeinflussen sich nicht (je nach Isolationsstufe) |
| **D**urability (Dauerhaftigkeit) | nach dem COMMIT überleben die Daten auch einen Absturz |

## Und NoSQL?

Nicht-relationale Datenbanken verzichten auf feste Tabellenschemata: **Dokumentendatenbanken** (MongoDB, JSON-Dokumente), **Key-Value-Stores** (Redis, schneller Cache), **Spaltenfamilien** (Cassandra, riesige Datenmengen) und **Graphdatenbanken** (Neo4j, Beziehungsnetze). Sie skalieren oft leichter horizontal, verzichten dafür teilweise auf Joins und strenge Konsistenz.
`,
  codeSnippet: `-- Auswertung: Umsatz je Ort im 3. Quartal 2026, nur Orte über 500 €
SELECT   k.ort,
         COUNT(DISTINCT k.kunden_id) AS kunden,
         SUM(b.betrag)              AS umsatz,
         ROUND(AVG(b.betrag), 2)    AS schnitt_je_bestellung
FROM     kunden k
JOIN     bestellungen b ON b.kunden_id = k.kunden_id
WHERE    b.datum BETWEEN '2026-07-01' AND '2026-09-30'
GROUP BY k.ort
HAVING   SUM(b.betrag) > 500
ORDER BY umsatz DESC;`,
  codeLanguage: 'SQL',
  exercises: [
    {
      id: 'abfragen-schreiben',
      title: 'Abfragen schreiben',
      prompt: 'Gegeben sind die Tabellen `kunden(kunden_id, name, ort)` und `bestellungen(bestell_id, kunden_id, datum, betrag)`. Schreibe SQL für:\n\n1. Alle Kunden aus Dortmund, alphabetisch sortiert.\n2. Anzahl und Summe der Bestellungen je Kunde (Name ausgeben), nur Kunden mit mehr als 2 Bestellungen.\n3. Alle Kunden, die noch nie bestellt haben.\n4. Die teuerste Bestellung mit dem Namen des Kunden.',
      hints: ['Für 3. eignet sich ein LEFT JOIN mit IS NULL oder NOT EXISTS.', 'Für 4. eine Unterabfrage mit MAX oder ORDER BY … LIMIT 1.'],
      solution: '```sql\n-- 1\nSELECT * FROM kunden WHERE ort = \'Dortmund\' ORDER BY name;\n\n-- 2\nSELECT k.name, COUNT(*) AS anzahl, SUM(b.betrag) AS summe\nFROM kunden k JOIN bestellungen b ON b.kunden_id = k.kunden_id\nGROUP BY k.kunden_id, k.name\nHAVING COUNT(*) > 2;\n\n-- 3\nSELECT k.name FROM kunden k\nWHERE NOT EXISTS (SELECT 1 FROM bestellungen b WHERE b.kunden_id = k.kunden_id);\n\n-- 4\nSELECT k.name, b.betrag FROM bestellungen b\nJOIN kunden k ON k.kunden_id = b.kunden_id\nWHERE b.betrag = (SELECT MAX(betrag) FROM bestellungen);\n```\n\nVariante 4 liefert bei Gleichstand mehrere Zeilen – das ist meist gewollt.'
    },
    {
      id: 'join-ergebnis',
      title: 'Ergebnis eines JOINs bestimmen',
      prompt: 'kunden: (1, Meyer, Dortmund), (2, Schulz, Essen), (3, Yilmaz, Dortmund)\nbestellungen: (10, 1, 120.00), (11, 1, 80.00), (12, 2, 35.00)\n\nWie viele Zeilen liefern (a) `kunden INNER JOIN bestellungen`, (b) `kunden LEFT JOIN bestellungen`? Wie lautet das Ergebnis von `SELECT ort, SUM(betrag) FROM kunden LEFT JOIN bestellungen USING (kunden_id) GROUP BY ort`?',
      solution: '(a) **3 Zeilen**: Meyer (10), Meyer (11), Schulz (12).\n(b) **4 Zeilen**: zusätzlich Yilmaz mit NULL-Werten für die Bestellung.\n\nSumme je Ort:\n\n| ort | SUM(betrag) |\n| :--- | ---: |\n| Dortmund | 200.00 |\n| Essen | 35.00 |\n\nYilmaz trägt NULL bei; SUM ignoriert NULL-Werte.'
    },
    {
      id: 'er-modell',
      title: 'ER-Modell in Tabellen überführen',
      prompt: 'Ein Kursanbieter verwaltet **Kurse** (Nummer, Titel, Preis), **Teilnehmer** (Nummer, Name, E-Mail) und **Dozenten** (Nummer, Name). Ein Kurs hat genau einen Dozenten, ein Dozent leitet mehrere Kurse. Teilnehmer buchen beliebig viele Kurse, jede Buchung hat ein Buchungsdatum. Gib die Tabellen mit Primär- und Fremdschlüsseln an.',
      solution: '- **dozenten**(dozent_id PK, name)\n- **kurse**(kurs_id PK, titel, preis, dozent_id FK → dozenten) – 1:n, der Fremdschlüssel steht auf der n-Seite\n- **teilnehmer**(teilnehmer_id PK, name, email UNIQUE)\n- **buchungen**(teilnehmer_id FK, kurs_id FK, buchungsdatum) mit zusammengesetztem Primärschlüssel (teilnehmer_id, kurs_id) – löst die n:m-Beziehung auf; das Buchungsdatum ist ein Attribut der Beziehung.'
    },
    {
      id: 'transaktion',
      title: 'Transaktion begründen',
      prompt: 'Beim Verbuchen einer Bestellung werden drei Befehle ausgeführt: Bestellung anlegen, Lagerbestand verringern, Rechnung erzeugen. Nach dem zweiten Befehl stürzt der Server ab. Was passiert ohne und mit Transaktion? Welche ACID-Eigenschaft ist hier entscheidend?',
      solution: '**Ohne Transaktion**: Bestellung existiert und der Lagerbestand ist verringert, aber es gibt keine Rechnung – die Daten sind **inkonsistent**.\n\n**Mit Transaktion** (BEGIN … COMMIT): Weil kein COMMIT erfolgt ist, werden beim Neustart alle Änderungen zurückgerollt – als wäre nichts passiert.\n\nEntscheidend ist die **Atomarität** (alles oder nichts); sie sichert die **Konsistenz**.'
    }
  ],
  quiz: [
    {
      question: 'Wie wird eine n:m-Beziehung im relationalen Modell umgesetzt?',
      options: ['Mit einem Fremdschlüssel in einer der Tabellen', 'Mit einer Zwischentabelle, die beide Fremdschlüssel enthält', 'Mit einem gemeinsamen Primärschlüssel', 'Gar nicht, sie ist verboten'],
      correct: 1,
      explanation: 'Die Zwischentabelle zerlegt n:m in zwei 1:n-Beziehungen.'
    },
    {
      question: 'Welche Klausel filtert Gruppen nach einer Aggregatfunktion?',
      options: ['WHERE', 'HAVING', 'ORDER BY', 'GROUP BY'],
      correct: 1,
      explanation: 'WHERE filtert Zeilen vor dem Gruppieren, HAVING filtert die Gruppen danach.'
    },
    {
      question: 'Welcher JOIN liefert alle Zeilen der linken Tabelle, auch ohne passenden Partner?',
      options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'CROSS JOIN'],
      correct: 1,
      explanation: 'LEFT (OUTER) JOIN behält alle Zeilen der linken Tabelle; fehlende Werte rechts sind NULL.'
    },
    {
      question: 'Wie prüft man in SQL korrekt auf einen fehlenden Wert?',
      options: ['spalte = NULL', 'spalte == NULL', 'spalte IS NULL', 'spalte = \'\''],
      correct: 2,
      explanation: 'NULL ist „unbekannt“; ein Vergleich mit = ergibt nie wahr. Man verwendet IS NULL bzw. IS NOT NULL.'
    },
    {
      question: 'Zu welchem SQL-Bereich gehört CREATE TABLE?',
      options: ['DML', 'DQL', 'DDL', 'DCL'],
      correct: 2,
      explanation: 'Data Definition Language – sie legt die Struktur fest.'
    },
    {
      question: 'Was bedeutet das „A“ in ACID?',
      options: ['Availability', 'Atomarität (alles oder nichts)', 'Authentifizierung', 'Aggregation'],
      correct: 1,
      explanation: 'Atomicity: Eine Transaktion wird vollständig oder gar nicht ausgeführt.'
    },
    {
      question: 'Was zählt COUNT(email)?',
      options: ['Alle Zeilen der Tabelle', 'Nur Zeilen, in denen email nicht NULL ist', 'Die Anzahl verschiedener E-Mail-Adressen', 'Die Länge der E-Mail-Adressen'],
      correct: 1,
      explanation: 'COUNT(spalte) ignoriert NULL-Werte. Verschiedene Werte zählt COUNT(DISTINCT email).'
    }
  ],
  relatedLabs: [
    { id: 'sql_joins', label: 'SQL-JOIN-Visualizer' },
    { id: 'sqlite_studio', label: 'SQLite-Studio' },
    { id: 'erd_designer', label: 'ER-Diagramm-Designer' },
    { id: 'sql_transaction_lab', label: 'Transaktionen' },
    { id: 'sql_window_functions_lab', label: 'Window Functions' }
  ],
  sources: [
    { title: 'PostgreSQL-Dokumentation: The SQL Language', url: 'https://www.postgresql.org/docs/current/sql.html' },
    { title: 'PostgreSQL-Dokumentation: Constraints', url: 'https://www.postgresql.org/docs/current/ddl-constraints.html' },
    { title: 'SQLite: SQL As Understood By SQLite', url: 'https://www.sqlite.org/lang.html' },
    { title: 'Chen, P. (1976): The Entity-Relationship Model – Toward a Unified View of Data', url: 'https://dl.acm.org/doi/10.1145/320434.320440' },
    { title: 'Wikipedia: ACID', url: 'https://de.wikipedia.org/wiki/ACID' },
    { title: 'Eigene Volltextnotiz „SQL-Grundlagen und Syntax“ (Obsidian-Vault)', note: 'nicht öffentlich' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
