/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'let, const und var unterscheiden und die Datentypen von JavaScript nennen',
    '== und === sowie Wert- und Referenztypen sicher auseinanderhalten',
    'Funktionen, Arrow Functions und die Array-Methoden map, filter, reduce und find einsetzen',
    'Das DOM per JavaScript ändern, auf Ereignisse reagieren und Daten per fetch mit async/await laden'
  ],
  content: `
## JavaScript im Überblick

JavaScript ist die Programmiersprache des Webs: Sie läuft in jedem Browser und mit **Node.js** auch auf dem Server. Sie ist **dynamisch typisiert**, **interpretiert bzw. just-in-time kompiliert** und unterstützt objektorientierte wie funktionale Programmierung. Der Sprachstandard heißt **ECMAScript**; seit ES2015 („ES6“) erscheint jedes Jahr eine neue Version.

In eine Seite eingebunden wird es mit \`<script type="module" src="app.js"></script>\`. Module werden automatisch erst nach dem Aufbau des HTML ausgeführt und haben einen eigenen Gültigkeitsbereich.

## Variablen: let, const, var

| | \`const\` | \`let\` | \`var\` (veraltet) |
| :--- | :--- | :--- | :--- |
| neu zuweisbar | nein | ja | ja |
| Gültigkeit | Block \`{ }\` | Block \`{ }\` | ganze Funktion |
| vor der Deklaration nutzbar | nein (Fehler) | nein (Fehler) | ja, Wert \`undefined\` (Hoisting) |

Faustregel: **Standardmäßig \`const\`**, \`let\` nur, wenn sich der Wert wirklich ändert, \`var\` gar nicht.

\`const\` macht nur die **Bindung** unveränderlich, nicht den Inhalt: \`const liste = []; liste.push(1);\` ist erlaubt.

## Datentypen

Es gibt sieben **primitive** Typen – \`string\`, \`number\` (Ganz- und Gleitkommazahlen), \`bigint\`, \`boolean\`, \`undefined\`, \`null\`, \`symbol\` – und den Typ **object** (dazu gehören auch Arrays und Funktionen).

\`\`\`javascript
typeof "Hallo"      // "string"
typeof 42           // "number"
typeof undefined    // "undefined"
typeof null         // "object"  ← historischer Fehler der Sprache
typeof [1, 2]       // "object"  → Array.isArray([1, 2]) === true
\`\`\`

![Primitive Werte werden kopiert, Objekte referenziert](js-wert-referenz.svg "Zuweisung kopiert bei Primitiven den Wert, bei Objekten nur den Verweis")

Will man ein Objekt wirklich kopieren: flach mit \`{ ...obj }\` bzw. \`[...arr]\`, tief mit \`structuredClone(obj)\`.

### Vergleiche: == vs. ===

\`===\` vergleicht **Wert und Typ**, \`==\` wandelt vorher Typen um – mit überraschenden Ergebnissen:

| Ausdruck | Ergebnis |
| :--- | :--- |
| \`5 === "5"\` | \`false\` |
| \`5 == "5"\` | \`true\` |
| \`0 == ""\` | \`true\` |
| \`null == undefined\` | \`true\` |
| \`NaN === NaN\` | \`false\` (prüfen mit \`Number.isNaN\`) |

Darum **immer \`===\` und \`!==\`** verwenden.

**Falsy** sind: \`false\`, \`0\`, \`-0\`, \`0n\`, \`""\`, \`null\`, \`undefined\`, \`NaN\`. Alles andere ist **truthy** – auch \`"0"\`, \`[]\` und \`{}\`.

Für Standardwerte gibt es \`??\` (nur bei \`null\`/\`undefined\`) und optionale Verkettung \`?.\`:

\`\`\`javascript
const anzahl = eingabe ?? 10;          // 0 bleibt 0, anders als bei ||
const ort = kunde?.adresse?.ort;       // undefined statt Fehler, wenn adresse fehlt
\`\`\`

## Funktionen

\`\`\`javascript
// Funktionsdeklaration (wird "gehoistet", ist vorher nutzbar)
function brutto(netto, satz = 0.19) {
  return netto * (1 + satz);
}

// Arrow Function: kurz, ohne eigenes this
const quadrat = (x) => x * x;
const summe = (...zahlen) => zahlen.reduce((acc, z) => acc + z, 0);  // Rest-Parameter

// Template Literals
const gruss = (name) => \`Hallo \${name}, du hast \${quadrat(3)} XP\`;
\`\`\`

Funktionen sind Werte: Man kann sie Variablen zuweisen, als Argument übergeben (**Callback**) und zurückgeben. Eine Funktion, die sich Variablen ihrer Umgebung „merkt“, heißt **Closure**.

## Arrays und ihre Methoden

\`\`\`javascript
const artikel = [
  { name: 'Maus', preis: 20, lager: 14 },
  { name: 'Tastatur', preis: 45, lager: 0 },
  { name: 'Monitor', preis: 189, lager: 3 }
];

artikel.map((a) => a.name);                       // ['Maus', 'Tastatur', 'Monitor']
artikel.filter((a) => a.lager > 0);               // Maus und Monitor
artikel.find((a) => a.preis > 40);                // { name: 'Tastatur', … }
artikel.some((a) => a.lager === 0);               // true
artikel.reduce((summe, a) => summe + a.preis * a.lager, 0);  // 20*14 + 0 + 189*3 = 847
\`\`\`

| Methode | liefert | verändert das Original? |
| :--- | :--- | :--- |
| \`map\` | neues Array gleicher Länge | nein |
| \`filter\` | neues Array mit passenden Elementen | nein |
| \`find\` / \`findIndex\` | erstes passendes Element / dessen Index | nein |
| \`reduce\` | einen einzelnen Wert | nein |
| \`includes\` / \`some\` / \`every\` | \`true\` oder \`false\` | nein |
| \`push\` / \`pop\` / \`splice\` / \`sort\` | – | **ja** |

> [!warning] sort() sortiert als Text
> \`[10, 9, 100].sort()\` ergibt \`[10, 100, 9]\`, weil standardmäßig als Zeichenketten verglichen wird. Für Zahlen: \`.sort((a, b) => a - b)\`. Ohne das Original zu ändern: \`.toSorted((a, b) => a - b)\`.

## Objekte und Destructuring

\`\`\`javascript
const spieler = { name: 'Ada', level: 5, skills: ['SQL', 'JS'] };

const { name, level = 1 } = spieler;          // Destructuring mit Standardwert
const [ersterSkill] = spieler.skills;          // 'SQL'
const aufgestiegen = { ...spieler, level: spieler.level + 1 };  // Kopie mit Änderung

Object.keys(spieler);     // ['name', 'level', 'skills']
JSON.stringify(spieler);  // '{"name":"Ada","level":5,"skills":["SQL","JS"]}'
\`\`\`

## DOM und Ereignisse

Das **DOM** (*Document Object Model*) ist die Baumdarstellung der HTML-Seite, die JavaScript lesen und ändern kann.

\`\`\`javascript
const button = document.querySelector('#speichern');
const ausgabe = document.querySelector('.status');

button.addEventListener('click', (event) => {
  ausgabe.textContent = 'Gespeichert!';       // sicher: Text, kein HTML
  ausgabe.classList.add('erfolg');
});

// Ereignisdelegation: ein Listener für viele Einträge
document.querySelector('#liste').addEventListener('click', (e) => {
  const eintrag = e.target.closest('li');
  if (eintrag) eintrag.classList.toggle('erledigt');
});
\`\`\`

> [!warning] innerHTML und Nutzereingaben
> \`element.innerHTML = eingabe\` führt eingeschleustes HTML und JavaScript aus (XSS). Für Text immer \`textContent\` verwenden.

## Asynchronität: Promises und async/await

Netzwerkzugriffe dauern. Damit die Seite nicht einfriert, liefern sie ein **Promise** – ein Versprechen auf ein späteres Ergebnis. Mit \`async\`/\`await\` schreibt man das fast wie synchronen Code:

\`\`\`javascript
async function ladeBenutzer(id) {
  try {
    const antwort = await fetch(\`/api/users/\${id}\`);
    if (!antwort.ok) throw new Error(\`HTTP \${antwort.status}\`);   // fetch wirft bei 404 NICHT von selbst
    return await antwort.json();
  } catch (fehler) {
    console.error('Laden fehlgeschlagen:', fehler.message);
    return null;
  }
}

// Mehrere Anfragen parallel statt nacheinander
const [user, orders] = await Promise.all([ladeBenutzer(1), fetch('/api/orders').then((r) => r.json())]);
\`\`\`

Wie der Browser diese Aufgaben im Hintergrund einplant, erklärt der Artikel [JavaScript Event Loop](/wissen/javascript_event_loop_deep).

## Daten im Browser speichern

\`localStorage.setItem('theme', 'dark')\` speichert Zeichenketten dauerhaft pro Domain (etwa 5 MB). Objekte vorher mit \`JSON.stringify\` umwandeln. Keine Passwörter oder Tokens dort ablegen – jedes Skript der Seite kann sie lesen.
`,
  codeSnippet: `// Mini-App: Aufgabenliste mit DOM, Events und localStorage
const liste = document.querySelector('#aufgaben');
const formular = document.querySelector('#neu');
let aufgaben = JSON.parse(localStorage.getItem('aufgaben') ?? '[]');

function zeichnen() {
  liste.replaceChildren(...aufgaben.map((a, i) => {
    const li = document.createElement('li');
    li.textContent = a.text;
    li.classList.toggle('erledigt', a.erledigt);
    li.dataset.index = i;
    return li;
  }));
  localStorage.setItem('aufgaben', JSON.stringify(aufgaben));
}

formular.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = new FormData(formular).get('text').trim();
  if (text) aufgaben = [...aufgaben, { text, erledigt: false }];
  formular.reset();
  zeichnen();
});

liste.addEventListener('click', (e) => {
  const i = Number(e.target.closest('li')?.dataset.index);
  if (!Number.isNaN(i)) aufgaben = aufgaben.map((a, j) => (j === i ? { ...a, erledigt: !a.erledigt } : a));
  zeichnen();
});

zeichnen();`,
  codeLanguage: 'JavaScript',
  exercises: [
    {
      id: 'ausgabe-js',
      title: 'Ausgabe vorhersagen',
      prompt: 'Was gibt jede Zeile aus?\n\n```javascript\nconsole.log(1 + "2");\nconsole.log("5" - 2);\nconsole.log([1, 2, 3].map((n) => n * 2).filter((n) => n > 2));\nconsole.log(Boolean("0"), Boolean(0));\nconsole.log(null ?? "leer", 0 || "leer", 0 ?? "leer");\n```',
      solution: '```text\n12\n3\n[4, 6]\ntrue false\nleer leer 0\n```\n\n- `+` mit einem String verkettet → "12".\n- `-` gibt es nur für Zahlen → "5" wird zu 5.\n- "0" ist ein nicht leerer String und damit truthy.\n- `||` greift bei jedem falsy-Wert, `??` nur bei null/undefined.'
    },
    {
      id: 'array-methoden',
      title: 'Bestellungen auswerten',
      prompt: 'Gegeben ist `const bestellungen = [{ kunde: "A", betrag: 120 }, { kunde: "B", betrag: 35 }, { kunde: "A", betrag: 80 }, { kunde: "C", betrag: 300 }];`\n\nBerechne ohne Schleifen: (1) die Gesamtsumme, (2) die Liste der Beträge über 50 €, (3) den Umsatz je Kunde als Objekt `{ A: 200, B: 35, C: 300 }`.',
      hints: ['Für (3) eignet sich reduce mit einem Objekt als Startwert.'],
      solution: '```javascript\nconst summe = bestellungen.reduce((s, b) => s + b.betrag, 0);            // 535\nconst ueber50 = bestellungen.filter((b) => b.betrag > 50).map((b) => b.betrag); // [120, 80, 300]\nconst jeKunde = bestellungen.reduce((acc, b) => {\n  acc[b.kunde] = (acc[b.kunde] ?? 0) + b.betrag;\n  return acc;\n}, {});                                                                    // { A: 200, B: 35, C: 300 }\n```\n\nAlternativ für (3): `Object.groupBy` und anschließend summieren.'
    },
    {
      id: 'referenz-falle',
      title: 'Die Referenz-Falle',
      prompt: 'Warum ändert sich hier auch `standard`? Wie behebst du es?\n\n```javascript\nconst standard = { theme: "hell", sprache: "de" };\nconst nutzer = standard;\nnutzer.theme = "dunkel";\nconsole.log(standard.theme); // "dunkel"\n```',
      solution: 'Objekte werden per **Referenz** zugewiesen: `nutzer` und `standard` zeigen auf **dasselbe** Objekt. Lösung: eine Kopie anlegen.\n\n```javascript\nconst nutzer = { ...standard, theme: "dunkel" };   // flache Kopie\n// oder bei verschachtelten Objekten:\nconst nutzer2 = structuredClone(standard);\n```'
    },
    {
      id: 'fetch-fehler',
      title: 'fetch korrekt absichern',
      prompt: 'Ein Kollege wundert sich, dass sein `catch` bei einer 404-Antwort nie greift:\n\n```javascript\ntry {\n  const r = await fetch("/api/produkte/999");\n  const daten = await r.json();\n  zeigeProdukt(daten);\n} catch (e) {\n  zeigeFehler("Produkt nicht gefunden");\n}\n```\n\nErkläre das Verhalten und korrigiere den Code.',
      solution: '`fetch` lehnt das Promise nur bei **Netzwerkfehlern** ab (keine Verbindung, CORS-Fehler). Eine HTTP-Antwort mit 404 oder 500 gilt als erfolgreich zugestellt – man muss `r.ok` bzw. `r.status` selbst prüfen.\n\n```javascript\ntry {\n  const r = await fetch("/api/produkte/999");\n  if (!r.ok) throw new Error(`HTTP ${r.status}`);\n  zeigeProdukt(await r.json());\n} catch (e) {\n  zeigeFehler(e.message.includes("404") ? "Produkt nicht gefunden" : "Fehler beim Laden");\n}\n```'
    }
  ],
  quiz: [
    {
      question: 'Welche Deklaration verwendet man standardmäßig für Werte, die nicht neu zugewiesen werden?',
      options: ['var', 'let', 'const', 'static'],
      correct: 2,
      explanation: 'const verhindert Neuzuweisung und macht die Absicht klar. let nur, wenn sich der Wert ändert.'
    },
    {
      question: 'Was ergibt 5 === "5"?',
      options: ['true', 'false', 'undefined', 'Fehler'],
      correct: 1,
      explanation: '=== vergleicht ohne Typumwandlung: number und string sind verschieden.'
    },
    {
      question: 'Welche Array-Methode liefert ein neues Array mit nur den Elementen, die eine Bedingung erfüllen?',
      options: ['map', 'filter', 'reduce', 'forEach'],
      correct: 1,
      explanation: 'filter behält die Elemente, für die der Callback true liefert.'
    },
    {
      question: 'Was ergibt [10, 9, 100].sort()?',
      options: ['[9, 10, 100]', '[10, 100, 9]', '[100, 10, 9]', 'Fehler'],
      correct: 1,
      explanation: 'Ohne Vergleichsfunktion wird als Text sortiert: "10" < "100" < "9".'
    },
    {
      question: 'Welcher Wert ist truthy?',
      options: ['0', '""', '"0"', 'null'],
      correct: 2,
      explanation: '"0" ist ein nicht leerer String und damit truthy. 0, "" und null sind falsy.'
    },
    {
      question: 'Warum ist element.textContent = eingabe sicherer als element.innerHTML = eingabe?',
      options: [
        'textContent ist schneller',
        'textContent fügt nur Text ein, HTML und Skripte werden nicht interpretiert',
        'innerHTML funktioniert nur in alten Browsern',
        'Es gibt keinen Unterschied'
      ],
      correct: 1,
      explanation: 'Mit innerHTML würden eingeschleuste Tags interpretiert – ein Einfallstor für XSS.'
    },
    {
      question: 'Wann lehnt fetch() das Promise ab (reject)?',
      options: ['Bei jedem Statuscode ab 400', 'Nur bei Netzwerkfehlern', 'Bei Statuscode 500', 'Nie'],
      correct: 1,
      explanation: 'HTTP-Fehlerstatus gelten als erfolgreiche Antwort; man prüft response.ok selbst.'
    }
  ],
  relatedLabs: [
    { id: 'monaco_studio', label: 'Code-Editor (Monaco)' },
    { id: 'coding_challenges', label: 'Coding Challenges' },
    { id: 'code_debugger_lab', label: 'Code-Debugger' }
  ],
  sources: [
    { title: 'MDN: JavaScript-Leitfaden', url: 'https://developer.mozilla.org/de/docs/Web/JavaScript/Guide' },
    { title: 'MDN: Gleichheitsvergleiche und Gleichheit', url: 'https://developer.mozilla.org/de/docs/Web/JavaScript/Guide/Equality_comparisons_and_sameness' },
    { title: 'MDN: Array', url: 'https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Global_Objects/Array' },
    { title: 'MDN: Fetch API verwenden', url: 'https://developer.mozilla.org/de/docs/Web/API/Fetch_API/Using_Fetch' },
    { title: 'ECMAScript Language Specification (ECMA-262)', url: 'https://tc39.es/ecma262/' },
    { title: 'Eigene Lernkarten zur FIAE-Umschulung: Webprogrammierung HTML, CSS & JavaScript', note: 'nicht öffentlich' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
