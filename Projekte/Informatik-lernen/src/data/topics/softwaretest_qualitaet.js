/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Fehlerhandlung, Fehlerzustand und Fehlerwirkung unterscheiden und Qualitätsmerkmale nach ISO/IEC 25010 nennen',
    'Teststufen, Testarten und die Testpyramide einordnen',
    'Testfälle mit Äquivalenzklassen und Grenzwertanalyse ableiten',
    'Anweisungs- und Zweigüberdeckung bestimmen sowie Unit-Tests und TDD erklären'
  ],
  content: `
## Warum testen?

Testen kann die **Anwesenheit** von Fehlern zeigen, nie ihre Abwesenheit beweisen. Ziel ist, Fehler **möglichst früh** zu finden: Ein Fehler in der Anforderung, der erst beim Kunden auffällt, kostet ein Vielfaches dessen, was er in der Analyse gekostet hätte.

Das ISTQB unterscheidet drei Begriffe:

| Begriff | Bedeutung | Beispiel |
| :--- | :--- | :--- |
| **Fehlhandlung** (*error, mistake*) | menschlicher Irrtum | Entwickler verwechselt \`<\` und \`<=\` |
| **Fehlerzustand** (*defect, bug*) | der fehlerhafte Code oder das fehlerhafte Dokument | \`if (alter < 18)\` statt \`if (alter <= 18)\` |
| **Fehlerwirkung** (*failure*) | sichtbares Fehlverhalten bei der Ausführung | 18-Jährige bekommen den Jugendtarif nicht |

**Debugging** (Fehlerzustand finden und beheben) ist nicht dasselbe wie **Testen** (Fehlerwirkungen aufdecken).

## Qualitätsmerkmale nach ISO/IEC 25010

Die Norm (aktuelle Fassung 2023) beschreibt die **Produktqualität** mit neun Merkmalen:

| Merkmal | Frage |
| :--- | :--- |
| Funktionale Eignung | Tut die Software, was sie soll – vollständig und korrekt? |
| Leistungseffizienz | Antwortzeit, Ressourcenverbrauch, Kapazität |
| Kompatibilität | Arbeitet sie mit anderen Systemen zusammen? |
| Interaktionsfähigkeit (früher Benutzbarkeit) | Ist sie leicht erlernbar, bedienbar, barrierefrei? |
| Zuverlässigkeit | Verfügbarkeit, Fehlertoleranz, Wiederherstellbarkeit |
| Sicherheit (*Security*) | Vertraulichkeit, Integrität, Nachweisbarkeit |
| Wartbarkeit | Ist sie verständlich, änderbar, testbar? |
| Flexibilität (früher Übertragbarkeit) | Läuft sie in anderen Umgebungen, ist sie skalierbar? |
| Betriebssicherheit (*Safety*) | Gefährdet sie Menschen oder Umwelt nicht? |

**Funktionale** Anforderungen beschreiben, **was** das System tut; **nicht-funktionale** Anforderungen, **wie gut** (z. B. „Suche antwortet in unter 1 Sekunde“).

## Teststufen

Die Teststufen entsprechen dem rechten Ast des **V-Modells**:

1. **Komponententest** (Unit-Test): einzelne Funktionen, Methoden oder Klassen isoliert – meist vom Entwickler, automatisiert.
2. **Integrationstest**: das Zusammenspiel mehrerer Komponenten oder mit externen Systemen (Datenbank, API).
3. **Systemtest**: das Gesamtsystem gegen die Anforderungen (Pflichtenheft), in einer produktionsnahen Umgebung.
4. **Abnahmetest**: der Kunde prüft gegen seine Anforderungen (Lastenheft) und nimmt formal ab – oft mit Abnahmeprotokoll.

![Die Testpyramide](testpyramide.svg "Viele Unit-Tests, weniger Integrationstests, wenige End-to-End-Tests")

## Statische und dynamische Tests

- **Statisch** (ohne Ausführung): **Reviews** und Code-Inspektionen, Walkthroughs, **statische Analyse** durch Werkzeuge (Linter, Typprüfung). Finden Fehler, bevor Code läuft – auch in Anforderungen und Dokumenten.
- **Dynamisch** (mit Ausführung): Der Code wird mit Testdaten ausgeführt und das Ergebnis mit dem **erwarteten Ergebnis** verglichen.

### Black-Box und White-Box

| | Black-Box | White-Box |
| :--- | :--- | :--- |
| Grundlage | Spezifikation, Anforderungen | Quellcode, Kontrollfluss |
| Wissen über Interna | keines | vollständig |
| Verfahren | Äquivalenzklassen, Grenzwerte, Entscheidungstabellen, Zustandsübergänge, Anwendungsfälle | Anweisungs-, Zweig-, Bedingungsüberdeckung |
| findet | fehlende oder falsch umgesetzte Funktionen | nicht durchlaufenen, toten Code, Logikfehler |

**Gray-Box**: Kombination, z. B. Black-Box-Tests, die mit Kenntnis der Architektur entworfen werden.

## Äquivalenzklassen und Grenzwerte

Alle möglichen Eingaben zu testen ist unmöglich. Man teilt sie deshalb in **Äquivalenzklassen** auf – Bereiche, in denen sich das Programm gleich verhält. Aus jeder Klasse genügt **ein Repräsentant**, zusätzlich testet man die **Grenzen**, weil dort die meisten Fehler stecken (\`<\` statt \`<=\`).

> [!example] Rabattberechnung
> Spezifikation: Bestellwert unter 100 € → 0 % Rabatt, ab 100 € → 5 %, ab 500 € → 10 %. Negative Werte sind ungültig.
>
> | Klasse | Bereich | Repräsentant | Grenzwerte | erwartet |
> | :--- | :--- | ---: | :--- | :--- |
> | uÄK1 (ungültig) | < 0 | −20 | −0,01 | Fehlermeldung |
> | gÄK1 | 0 bis 99,99 | 50 | 0 und 99,99 | 0 % |
> | gÄK2 | 100 bis 499,99 | 250 | 100 und 499,99 | 5 % |
> | gÄK3 | ab 500 | 800 | 500 | 10 % |
>
> Dazu kommen ungültige Eingaben anderer Art: Text („abc“), leeres Feld.

## Überdeckungsmaße (White-Box)

\`\`\`javascript
function versandkosten(gewicht, express) {
  let kosten = 4.99;                // A
  if (gewicht > 10) kosten += 5;    // B
  if (express) kosten *= 2;         // C
  return kosten;
}
\`\`\`

- **Anweisungsüberdeckung (C0)**: Jede Anweisung wird mindestens einmal ausgeführt. **Ein** Testfall genügt: \`versandkosten(12, true)\` durchläuft alle Anweisungen.
- **Zweigüberdeckung (C1)**: Jeder Zweig jeder Verzweigung (wahr **und** falsch) wird durchlaufen. Mindestens **zwei** Testfälle: \`(12, true)\` und \`(5, false)\`. C1 schließt C0 ein.
- **Pfadüberdeckung**: alle Kombinationen – hier 2 × 2 = **4** Pfade. Bei Schleifen schnell unendlich viele, daher in der Praxis selten vollständig.

## Weitere Testarten

- **Regressionstest**: Nach einer Änderung prüfen, ob bisher Funktionierendes noch funktioniert – der Hauptgrund für **automatisierte** Tests.
- **Smoke-Test**: kurzer Grundcheck, ob das System überhaupt startet.
- **Last- und Performancetest**: Verhalten unter vielen gleichzeitigen Nutzern.
- **Usability-Test**: echte Nutzer lösen Aufgaben, man beobachtet Probleme.
- **Penetrationstest**: gezielte Angriffe, um Sicherheitslücken zu finden.
- **Akzeptanztest/UAT**: Fachanwender prüfen in ihrer Arbeitsweise.

## Unit-Tests und TDD

Ein guter Unit-Test folgt dem **AAA-Muster** – *Arrange* (vorbereiten), *Act* (ausführen), *Assert* (prüfen) – und ist **schnell, unabhängig, wiederholbar**. Abhängigkeiten wie Datenbanken ersetzt man durch **Mocks** oder **Stubs**.

**Test-Driven Development (TDD)** dreht die Reihenfolge um:

1. **Rot**: Einen Test schreiben, der fehlschlägt (die Funktion gibt es noch nicht).
2. **Grün**: Gerade so viel Code schreiben, dass der Test besteht.
3. **Refactor**: Den Code aufräumen – die Tests sichern ab, dass sich nichts ändert.

In einer **CI-Pipeline** laufen alle Tests bei jedem Push automatisch. Diese App hat z. B. über 2.000 automatisierte Tests, die vor jedem Merge laufen.
`,
  codeSnippet: `// Vitest: Unit-Tests für die Rabattberechnung mit Grenzwerten
import { describe, it, expect } from 'vitest';

function rabatt(wert) {
  if (typeof wert !== 'number' || Number.isNaN(wert) || wert < 0) throw new Error('ungültiger Bestellwert');
  if (wert >= 500) return 0.10;
  if (wert >= 100) return 0.05;
  return 0;
}

describe('rabatt', () => {
  it.each([
    [0, 0], [99.99, 0],          // gÄK1 und Grenzen
    [100, 0.05], [499.99, 0.05], // gÄK2
    [500, 0.10], [800, 0.10]     // gÄK3
  ])('Bestellwert %s → Rabatt %s', (wert, erwartet) => {
    expect(rabatt(wert)).toBe(erwartet);
  });

  it('lehnt negative Werte ab', () => {
    expect(() => rabatt(-0.01)).toThrow();
  });
});`,
  codeLanguage: 'JavaScript',
  exercises: [
    {
      id: 'aequivalenzklassen-ticket',
      title: 'Äquivalenzklassen bilden',
      prompt: 'Ein Kino berechnet den Eintritt nach Alter: unter 6 Jahre frei, 6 bis 17 Jahre 7 €, 18 bis 64 Jahre 12 €, ab 65 Jahre 9 €. Gültig sind ganze Zahlen von 0 bis 120. Bilde alle Äquivalenzklassen und gib die Testwerte der Grenzwertanalyse an.',
      solution: '| Klasse | Bereich | Repräsentant | Grenzwerte | erwartet |\n| :--- | :--- | ---: | :--- | :--- |\n| uÄK1 | < 0 | −5 | −1 | Fehler |\n| gÄK1 | 0–5 | 3 | 0, 5 | 0 € |\n| gÄK2 | 6–17 | 12 | 6, 17 | 7 € |\n| gÄK3 | 18–64 | 40 | 18, 64 | 12 € |\n| gÄK4 | 65–120 | 80 | 65, 120 | 9 € |\n| uÄK2 | > 120 | 150 | 121 | Fehler |\n| uÄK3 | keine ganze Zahl | „abc“, 17,5 | – | Fehler |\n\nGrenzwert-Testwerte: −1, 0, 5, 6, 17, 18, 64, 65, 120, 121.'
    },
    {
      id: 'ueberdeckung',
      title: 'Überdeckung bestimmen',
      prompt: 'Wie viele Testfälle braucht man mindestens für 100 % Anweisungs- (C0) und 100 % Zweigüberdeckung (C1)? Gib passende Testfälle an.\n\n```javascript\nfunction note(punkte) {\n  let ergebnis = "nicht bestanden";\n  if (punkte >= 50) {\n    ergebnis = "bestanden";\n    if (punkte >= 92) ergebnis = "sehr gut";\n  }\n  return ergebnis;\n}\n```',
      solution: '**C0: 1 Testfall** – `note(95)` führt alle Anweisungen aus (beide if-Bedingungen wahr).\n\n**C1: 3 Testfälle** – jeder Zweig muss einmal wahr und einmal falsch sein:\n- `note(30)` → äußeres if falsch → „nicht bestanden“\n- `note(70)` → äußeres wahr, inneres falsch → „bestanden“\n- `note(95)` → beide wahr → „sehr gut“\n\nDas innere if wird nur erreicht, wenn das äußere wahr ist, deshalb reichen zwei Testfälle nicht.'
    },
    {
      id: 'teststufe-zuordnen',
      title: 'Teststufen zuordnen',
      prompt: 'Ordne die Situationen der Teststufe bzw. Testart zu:\n\n1. Die Entwicklerin prüft, ob ihre Methode `berechneZinsen()` für 0 % Zins korrekt 0 liefert.\n2. Der Kunde arbeitet eine Woche mit dem neuen Ticketsystem und unterschreibt danach das Protokoll.\n3. Nach einem Bugfix im Warenkorb laufen alle 800 automatischen Tests erneut.\n4. Es wird geprüft, ob die Bestell-API korrekt in die Datenbank schreibt.\n5. Ein Kollege liest den Code eines Pull Requests und kommentiert.',
      solution: '1. **Komponententest** (Unit-Test, White-/Black-Box)\n2. **Abnahmetest**\n3. **Regressionstest**\n4. **Integrationstest**\n5. **Statischer Test** (Review)'
    }
  ],
  quiz: [
    {
      question: 'Was ist eine Fehlerwirkung (Failure)?',
      options: ['Der Irrtum des Entwicklers', 'Die fehlerhafte Stelle im Code', 'Das sichtbare Fehlverhalten bei der Ausführung', 'Ein fehlgeschlagener Build'],
      correct: 2,
      explanation: 'Fehlhandlung → Fehlerzustand im Code → Fehlerwirkung, wenn der Code ausgeführt wird.'
    },
    {
      question: 'Welches Verfahren ist ein Black-Box-Verfahren?',
      options: ['Zweigüberdeckung', 'Grenzwertanalyse', 'Anweisungsüberdeckung', 'Pfadüberdeckung'],
      correct: 1,
      explanation: 'Grenzwertanalyse arbeitet nur mit der Spezifikation. Die Überdeckungsmaße brauchen den Quellcode.'
    },
    {
      question: 'Welche Teststufe prüft das Zusammenspiel mehrerer Komponenten?',
      options: ['Komponententest', 'Integrationstest', 'Abnahmetest', 'Review'],
      correct: 1,
      explanation: 'Der Integrationstest prüft Schnittstellen und Zusammenarbeit, z. B. zwischen Anwendung und Datenbank.'
    },
    {
      question: 'Was gilt für Zweigüberdeckung (C1)?',
      options: [
        'Jede Anweisung wird mindestens einmal ausgeführt',
        'Jede Verzweigung wird mindestens einmal wahr und einmal falsch durchlaufen',
        'Alle möglichen Pfade werden durchlaufen',
        'Jede Klasse hat einen Test'
      ],
      correct: 1,
      explanation: 'C1 verlangt beide Ausgänge jeder Entscheidung und schließt damit C0 ein.'
    },
    {
      question: 'In welcher Reihenfolge läuft TDD ab?',
      options: ['Code – Test – Refactor', 'Rot (Test schlägt fehl) – Grün (Code) – Refactor', 'Refactor – Test – Code', 'Test – Release – Code'],
      correct: 1,
      explanation: 'Erst ein fehlschlagender Test, dann minimaler Code bis er grün ist, dann aufräumen.'
    },
    {
      question: 'Wozu dienen automatisierte Regressionstests?',
      options: [
        'Um neue Anforderungen zu erheben',
        'Um nach Änderungen sicherzustellen, dass Bestehendes weiter funktioniert',
        'Um die Performance zu messen',
        'Um Code zu formatieren'
      ],
      correct: 1,
      explanation: 'Regressionstests decken ungewollte Seiteneffekte von Änderungen auf.'
    },
    {
      question: 'Welche Anforderung ist nicht-funktional?',
      options: [
        'Der Nutzer kann eine Rechnung als PDF herunterladen',
        'Die Suche liefert Ergebnisse in unter 500 ms',
        'Administratoren können Benutzer sperren',
        'Das System berechnet die Mehrwertsteuer'
      ],
      correct: 1,
      explanation: 'Antwortzeit beschreibt, wie gut das System arbeitet (Leistungseffizienz), nicht was es tut.'
    }
  ],
  relatedLabs: [
    { id: 'testverfahren_lab', label: 'Testverfahren (ÄK & Grenzwerte)' },
    { id: 'clean_code_lab', label: 'Clean-Code-Review' },
    { id: 'cicd_pipeline', label: 'CI/CD-Pipeline' }
  ],
  sources: [
    { title: 'ISTQB/GTB: Certified Tester Foundation Level – Lehrplan (deutsch)', url: 'https://www.german-testing-board.info/lehrplaene/istqbr-certified-tester-foundation-level/' },
    { title: 'GTB: ISTQB/GTB Standardglossar der Testbegriffe', url: 'https://glossary.istqb.org/de_DE/search' },
    { title: 'ISO/IEC 25010:2023 – Product quality model', url: 'https://www.iso.org/standard/78176.html' },
    { title: 'Martin Fowler: The Practical Test Pyramid', url: 'https://martinfowler.com/articles/practical-test-pyramid.html' },
    { title: 'Vitest-Dokumentation', url: 'https://vitest.dev/guide/' },
    { title: 'Eigene Lernkarten zur FIAE-Umschulung: AP2-Prüfungsvorbereitung', note: 'nicht öffentlich' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
