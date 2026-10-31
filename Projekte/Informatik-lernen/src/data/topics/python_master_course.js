/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Variablen, Datentypen, Operatoren und f-Strings sicher verwenden',
    'Listen, Tupel, Dictionaries und Sets passend auswählen und bearbeiten',
    'Verzweigungen, Schleifen und eigene Funktionen schreiben',
    'Fehler mit try/except behandeln, Dateien lesen und eine erste Klasse entwerfen'
  ],
  content: `
## Warum Python?

Python ist eine **interpretierte**, **dynamisch typisierte** Sprache mit sehr lesbarer Syntax. Sie wird für Automatisierung, Datenanalyse, Webentwicklung (Django, FastAPI), KI (PyTorch) und Systemadministration eingesetzt. Besonderheit: **Einrückung ist Syntax** – Blöcke werden nicht mit geschweiften Klammern, sondern mit (üblicherweise 4) Leerzeichen gebildet.

Ausprobieren kannst du alle Beispiele direkt im Browser im Lab [Python im Browser](/python_wasm).

## Variablen und Datentypen

Eine Variable entsteht durch Zuweisung. Den Typ bestimmt Python zur Laufzeit selbst:

\`\`\`python
name = "Ada"          # str  (Zeichenkette)
alter = 36            # int  (Ganzzahl, beliebig groß)
preis = 19.99         # float (Gleitkommazahl)
aktiv = True          # bool (True/False, groß geschrieben)
nichts = None         # NoneType (kein Wert)

print(type(alter))    # <class 'int'>
\`\`\`

### Operatoren

| Operator | Bedeutung | Beispiel | Ergebnis |
| :--- | :--- | :--- | :--- |
| \`/\` | Division (immer float) | \`7 / 2\` | \`3.5\` |
| \`//\` | ganzzahlige Division | \`7 // 2\` | \`3\` |
| \`%\` | Rest (Modulo) | \`7 % 2\` | \`1\` |
| \`**\` | Potenz | \`2 ** 10\` | \`1024\` |
| \`==\`, \`!=\` | Vergleich | \`3 == 3.0\` | \`True\` |
| \`and\`, \`or\`, \`not\` | Logik | \`True and not False\` | \`True\` |
| \`in\` | enthalten in | \`"a" in "Haus"\` | \`True\` |

> [!warning] Gleitkomma-Falle
> \`0.1 + 0.2 == 0.3\` ergibt \`False\`, weil sich 0,1 im Binärsystem nicht exakt darstellen lässt. Für Geldbeträge nimmt man \`decimal.Decimal\` oder rechnet in Cent als \`int\`.

### Zeichenketten

\`\`\`python
s = "Fachinformatiker"
print(len(s))          # 16
print(s[0], s[-1])     # F r   (negativer Index zählt von hinten)
print(s[0:4])          # Fach  (Slicing: Start inklusive, Ende exklusive)
print(s.upper(), s.lower())
print("a,b,c".split(","))       # ['a', 'b', 'c']
print("-".join(["2026", "10", "29"]))  # 2026-10-29
note = 1.7
print(f"Note: {note:.1f}")      # f-String mit Formatierung
\`\`\`

Strings sind **unveränderlich**: \`s.upper()\` liefert einen neuen String, \`s\` bleibt gleich.

Eingaben liest man mit \`input()\`. Das Ergebnis ist immer ein String und muss bei Bedarf umgewandelt werden: \`alter = int(input("Alter: "))\`.

## Sammlungen

![Vergleich von list, tuple, dict und set](python-sammlungen.svg "Welche Sammlung ist geordnet, veränderbar und erlaubt Duplikate?")

\`\`\`python
zahlen = [3, 1, 4, 1, 5]        # list
zahlen.append(9)                # hinten anhängen
zahlen.sort()                   # sortiert die Liste selbst: [1, 1, 3, 4, 5, 9]
print(zahlen[1:3])              # [1, 3]

punkt = (4, 7)                  # tuple – unveränderlich
x, y = punkt                    # Entpacken

kunde = {"name": "Meyer", "plz": "44137"}   # dict
kunde["ort"] = "Dortmund"                    # hinzufügen/ändern
print(kunde.get("telefon", "unbekannt"))     # Standardwert statt KeyError
for schluessel, wert in kunde.items():
    print(schluessel, wert)

tags = {"python", "sql", "python"}           # set – Duplikate fallen weg
print(tags)                                  # {'python', 'sql'}
print({1, 2, 3} & {2, 3, 4})                 # Schnittmenge {2, 3}
\`\`\`

### List Comprehensions

Eine kompakte Schreibweise, um aus einer Sammlung eine neue zu bilden:

\`\`\`python
quadrate = [n * n for n in range(1, 6)]            # [1, 4, 9, 16, 25]
gerade = [n for n in range(10) if n % 2 == 0]      # [0, 2, 4, 6, 8]
preise_brutto = {art: p * 1.19 for art, p in {"Maus": 20, "Kabel": 5}.items()}
\`\`\`

## Kontrollstrukturen

\`\`\`python
punkte = 78
if punkte >= 92:
    note = 1
elif punkte >= 81:
    note = 2
elif punkte >= 67:
    note = 3
elif punkte >= 50:
    note = 4
else:
    note = 5
print(note)  # 3

for i in range(3):          # 0, 1, 2
    print(i)

for i, name in enumerate(["Ada", "Linus"], start=1):
    print(i, name)          # 1 Ada / 2 Linus

versuche = 0
while versuche < 3:
    versuche += 1
\`\`\`

\`break\` beendet eine Schleife sofort, \`continue\` springt zum nächsten Durchlauf. Seit Python 3.10 gibt es zusätzlich \`match\`/\`case\` für Mehrfachauswahl.

> [!info] Notenschlüssel
> Die Grenzen im Beispiel entsprechen dem IHK-Punkteschlüssel (100–92 sehr gut, 91–81 gut, 80–67 befriedigend, 66–50 ausreichend, 49–30 mangelhaft, 29–0 ungenügend). Zur Vereinfachung fasst das Beispiel alles unter 50 als 5 zusammen.

## Funktionen

\`\`\`python
def brutto(netto: float, steuersatz: float = 0.19) -> float:
    """Berechnet den Bruttopreis. Der Steuersatz hat einen Standardwert."""
    return round(netto * (1 + steuersatz), 2)

print(brutto(100))                  # 119.0
print(brutto(100, steuersatz=0.07)) # 107.0
\`\`\`

- **Parameter mit Standardwert** stehen hinten.
- **Type Hints** (\`: float\`, \`-> float\`) sind Dokumentation – Python prüft sie zur Laufzeit nicht, Werkzeuge wie mypy schon.
- Der Text in dreifachen Anführungszeichen ist der **Docstring** (\`help(brutto)\` zeigt ihn an).
- Variablen innerhalb einer Funktion sind **lokal**.

> [!warning] Veränderliche Standardwerte
> \`def f(liste=[])\` ist ein klassischer Fehler: Die leere Liste wird nur **einmal** erzeugt und bei jedem Aufruf wiederverwendet. Richtig: \`def f(liste=None)\` und in der Funktion \`if liste is None: liste = []\`.

## Fehlerbehandlung

\`\`\`python
def teile(a, b):
    try:
        return a / b
    except ZeroDivisionError:
        print("Division durch 0 ist nicht erlaubt.")
        return None
    finally:
        print("wird immer ausgeführt")

try:
    zahl = int("abc")
except ValueError as fehler:
    print(f"Ungültige Eingabe: {fehler}")
\`\`\`

Fange nur die Ausnahmen ab, die du sinnvoll behandeln kannst – ein nacktes \`except:\` versteckt auch echte Programmierfehler. Eigene Fehler wirft man mit \`raise ValueError("…")\`.

## Dateien lesen und schreiben

\`\`\`python
from pathlib import Path
import csv

with open("noten.csv", encoding="utf-8", newline="") as datei:   # with schließt die Datei automatisch
    for zeile in csv.DictReader(datei, delimiter=";"):
        print(zeile["name"], zeile["note"])

Path("log.txt").write_text("Fertig\\n", encoding="utf-8")
\`\`\`

Gib beim Öffnen von Textdateien immer \`encoding="utf-8"\` an, sonst hängt das Ergebnis vom Betriebssystem ab.

## Klassen

\`\`\`python
class Konto:
    zinssatz = 0.01                       # Klassenattribut (für alle Konten gleich)

    def __init__(self, inhaber: str, saldo: float = 0.0):
        self.inhaber = inhaber            # Instanzattribut
        self._saldo = saldo               # _ = Konvention für "intern"

    def einzahlen(self, betrag: float) -> None:
        if betrag <= 0:
            raise ValueError("Betrag muss positiv sein")
        self._saldo += betrag

    @property
    def saldo(self) -> float:             # nur lesbar von außen
        return self._saldo

    def __str__(self) -> str:
        return f"{self.inhaber}: {self._saldo:.2f} €"

k = Konto("Ada")
k.einzahlen(50)
print(k)          # Ada: 50.00 €
\`\`\`

\`self\` ist das Objekt selbst und wird bei jeder Methode als erster Parameter angegeben. Vererbung schreibt man \`class Sparkonto(Konto):\`, den Konstruktor der Oberklasse ruft man mit \`super().__init__(…)\` auf.

## Module und Pakete

\`import math\`, \`from datetime import date\` – die Standardbibliothek ist groß („Batteries included“). Fremdpakete installiert man mit **pip** in eine **virtuelle Umgebung**, damit Projekte sich nicht gegenseitig stören:

\`\`\`bash
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\\Scripts\\activate
pip install requests
\`\`\`
`,
  codeSnippet: `# Kleines Komplettbeispiel: Notenauswertung
noten = {"Ada": [1.3, 2.0, 1.7], "Linus": [2.7, 3.0], "Grace": []}

def durchschnitt(werte: list[float]) -> float | None:
    return round(sum(werte) / len(werte), 2) if werte else None

for name, werte in noten.items():
    schnitt = durchschnitt(werte)
    text = f"{schnitt:.2f}" if schnitt is not None else "keine Noten"
    print(f"{name:<6} {text}")

# Ada    1.67
# Linus  2.85
# Grace  keine Noten`,
  codeLanguage: 'Python',
  exercises: [
    {
      id: 'ausgabe-vorhersagen',
      title: 'Ausgabe vorhersagen',
      prompt: 'Was gibt dieses Programm aus?\n\n```python\nwerte = [4, 8, 15, 16, 23, 42]\nprint(werte[-2])\nprint(werte[1:4])\nprint(len([w for w in werte if w % 2 == 0]))\nprint(17 // 5, 17 % 5, 2 ** 5)\n```',
      solution: '```text\n23\n[8, 15, 16]\n4\n3 2 32\n```\n\n- `werte[-2]` ist das vorletzte Element.\n- Slicing `[1:4]` liefert Index 1, 2, 3.\n- Gerade sind 4, 8, 16, 42 → 4 Stück.\n- 17 // 5 = 3, 17 % 5 = 2, 2⁵ = 32.'
    },
    {
      id: 'woerter-zaehlen',
      title: 'Wörter zählen',
      prompt: 'Schreibe eine Funktion `haeufigkeit(text)`, die ein Dictionary zurückgibt, wie oft jedes Wort vorkommt. Groß- und Kleinschreibung sowie Satzzeichen (.,!?) sollen keine Rolle spielen. Beispiel: `haeufigkeit("Der Hund. der Ball!")` → `{"der": 2, "hund": 1, "ball": 1}`.',
      hints: ['Mit str.lower() und str.replace() oder einer Schleife über ".,!?" bereinigen.', 'dict.get(wort, 0) + 1 vermeidet einen KeyError.'],
      solution: '```python\ndef haeufigkeit(text: str) -> dict[str, int]:\n    for zeichen in ".,!?":\n        text = text.replace(zeichen, "")\n    ergebnis = {}\n    for wort in text.lower().split():\n        ergebnis[wort] = ergebnis.get(wort, 0) + 1\n    return ergebnis\n```\n\nAlternative aus der Standardbibliothek: `collections.Counter(text.lower().split())`.'
    },
    {
      id: 'eingabe-pruefen',
      title: 'Robuste Eingabe',
      prompt: 'Schreibe ein Programm, das so lange nach einer Zahl zwischen 1 und 6 fragt, bis der Nutzer eine gültige Ganzzahl eingibt. Ungültige Eingaben (Buchstaben, 0, 7) sollen eine Fehlermeldung erzeugen, aber das Programm nicht abbrechen.',
      solution: '```python\nwhile True:\n    eingabe = input("Note (1-6): ")\n    try:\n        note = int(eingabe)\n    except ValueError:\n        print("Bitte eine ganze Zahl eingeben.")\n        continue\n    if 1 <= note <= 6:\n        break\n    print("Die Note muss zwischen 1 und 6 liegen.")\nprint(f"Gespeichert: {note}")\n```'
    },
    {
      id: 'klasse-artikel',
      title: 'Eine Klasse entwerfen',
      prompt: 'Entwirf eine Klasse `Artikel` mit Bezeichnung, Nettopreis und Bestand. Methoden: `brutto()` (19 % MwSt., auf 2 Stellen gerundet) und `verkaufen(menge)`, die den Bestand verringert und bei zu geringem Bestand einen `ValueError` wirft.',
      solution: '```python\nclass Artikel:\n    def __init__(self, bezeichnung: str, netto: float, bestand: int = 0):\n        self.bezeichnung = bezeichnung\n        self.netto = netto\n        self.bestand = bestand\n\n    def brutto(self) -> float:\n        return round(self.netto * 1.19, 2)\n\n    def verkaufen(self, menge: int) -> None:\n        if menge <= 0:\n            raise ValueError("Menge muss positiv sein")\n        if menge > self.bestand:\n            raise ValueError("Nicht genug auf Lager")\n        self.bestand -= menge\n\nmaus = Artikel("Maus", 20.0, 5)\nmaus.verkaufen(2)\nprint(maus.brutto(), maus.bestand)  # 23.8 3\n```'
    }
  ],
  quiz: [
    {
      question: 'Was ergibt 7 // 2 in Python?',
      options: ['3.5', '3', '4', '1'],
      correct: 1,
      explanation: '// ist die ganzzahlige Division (abgerundet). 7 / 2 ergäbe 3.5, 7 % 2 den Rest 1.'
    },
    {
      question: 'Welcher Datentyp ist unveränderlich?',
      options: ['list', 'dict', 'set', 'tuple'],
      correct: 3,
      explanation: 'Tupel können nach dem Erzeugen nicht verändert werden. Listen, Dictionaries und Sets schon.'
    },
    {
      question: 'Was gibt print([1, 2, 3, 4][1:3]) aus?',
      options: ['[1, 2, 3]', '[2, 3]', '[2, 3, 4]', '[1, 2]'],
      correct: 1,
      explanation: 'Slicing liefert Index 1 bis ausschließlich 3, also die Elemente 2 und 3.'
    },
    {
      question: 'Wie greift man auf einen Dictionary-Wert zu, ohne dass bei fehlendem Schlüssel ein Fehler entsteht?',
      options: ['d["schluessel"]', 'd.get("schluessel")', 'd.find("schluessel")', 'd->schluessel'],
      correct: 1,
      explanation: 'get() liefert None oder einen angegebenen Standardwert. d["x"] wirft einen KeyError.'
    },
    {
      question: 'Wozu dient das with-Statement beim Öffnen von Dateien?',
      options: [
        'Es öffnet die Datei schneller',
        'Es schließt die Datei automatisch, auch wenn ein Fehler auftritt',
        'Es verschlüsselt die Datei',
        'Es liest die Datei in ein Dictionary'
      ],
      correct: 1,
      explanation: 'with nutzt einen Kontextmanager, der die Datei beim Verlassen des Blocks zuverlässig schließt.'
    },
    {
      question: 'Was bewirkt self in einer Methode?',
      options: [
        'Es verweist auf die Klasse selbst',
        'Es verweist auf das aktuelle Objekt (die Instanz)',
        'Es ist ein reserviertes Schlüsselwort ohne Funktion',
        'Es importiert das Modul'
      ],
      correct: 1,
      explanation: 'self ist das Objekt, auf dem die Methode aufgerufen wurde. Über self.attribut greift man auf seine Daten zu.'
    }
  ],
  relatedLabs: [
    { id: 'python_wasm', label: 'Python im Browser' },
    { id: 'coding_challenges', label: 'Coding Challenges' },
    { id: 'code_debugger_lab', label: 'Code-Debugger' }
  ],
  sources: [
    { title: 'Python-Dokumentation: Das Python-Tutorial (deutsch)', url: 'https://docs.python.org/de/3/tutorial/index.html' },
    { title: 'Python-Dokumentation: Built-in Types', url: 'https://docs.python.org/3/library/stdtypes.html' },
    { title: 'Python-Dokumentation: Errors and Exceptions', url: 'https://docs.python.org/3/tutorial/errors.html' },
    { title: 'PEP 8 – Style Guide for Python Code', url: 'https://peps.python.org/pep-0008/' },
    { title: 'Python-Dokumentation: venv – Virtuelle Umgebungen', url: 'https://docs.python.org/3/library/venv.html' },
    { title: 'Python-Dokumentation: Floating-Point Arithmetic – Issues and Limitations', url: 'https://docs.python.org/3/tutorial/floatingpoint.html' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
