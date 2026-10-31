/** @type {import('../topicsData').TopicContent} */
export default {
  learningGoals: [
    'Call Stack, Web APIs, Task-Queue und Microtask-Queue beschreiben',
    'Die Ausgabereihenfolge von Code mit setTimeout, Promises und async/await sicher vorhersagen',
    'Erkennen, wann lange Aufgaben die Oberfläche blockieren, und sie aufteilen',
    'Web Worker als Lösung für rechenintensive Aufgaben einordnen'
  ],
  content: `
## Ein Thread, viele Aufgaben

JavaScript im Browser läuft im **Hauptthread** – demselben Thread, der auch Klicks verarbeitet, Layout berechnet und die Seite zeichnet. Es gibt nur **einen Call Stack**: Solange dort Code läuft, kann nichts anderes passieren. Trotzdem können Timer laufen und Netzwerkanfragen parallel auf Antwort warten. Das ermöglicht der **Event Loop** zusammen mit den Web APIs des Browsers.

![Aufbau des Event Loop](event-loop.svg "Call Stack, Web APIs und die beiden Warteschlangen")

## Die Bausteine

- **Call Stack**: Jeder Funktionsaufruf legt einen Rahmen auf den Stapel, jedes \`return\` nimmt ihn wieder herunter.
- **Web APIs**: \`setTimeout\`, \`fetch\`, Ereignis-Listener usw. werden vom Browser **außerhalb** des JavaScript-Threads erledigt. Ist der Timer abgelaufen oder die Antwort da, wird der Callback in eine Warteschlange gestellt.
- **Task-Queue** (oft „Macrotask-Queue“ genannt): Callbacks von \`setTimeout\`, \`setInterval\`, Benutzerereignissen, \`MessageChannel\`.
- **Microtask-Queue**: Fortsetzungen von Promises (\`.then\`, \`.catch\`, \`.finally\`), der Code nach einem \`await\`, \`queueMicrotask\` und \`MutationObserver\`.

## Die Regel

1. Führe **eine** Aufgabe aus (am Anfang: das ganze Skript).
2. Ist der Stack leer, arbeite die **komplette Microtask-Queue** ab – auch Microtasks, die währenddessen neu hinzukommen.
3. Wenn es Zeit für ein neues Bild ist: \`requestAnimationFrame\`-Callbacks, Stil, Layout, Zeichnen.
4. Nimm die nächste Aufgabe aus der Task-Queue → weiter bei 2.

> [!exam] Merksatz
> **Synchron → alle Microtasks → eine Task → alle Microtasks → eine Task …** Ein \`setTimeout(fn, 0)\` läuft also nie vor einem bereits erfüllten Promise.

## Reihenfolge vorhersagen

\`\`\`javascript
console.log('A');
setTimeout(() => console.log('B'), 0);
Promise.resolve()
  .then(() => console.log('C'))
  .then(() => console.log('D'));
queueMicrotask(() => console.log('E'));
console.log('F');
\`\`\`

| Schritt | Ausgabe | Microtask-Queue danach | Task-Queue |
| :--- | :--- | :--- | :--- |
| synchroner Code | A, F | [C, E] | [B] |
| Microtask C | C | [E, D] (C plant D ein) | [B] |
| Microtask E | E | [D] | [B] |
| Microtask D | D | [] | [B] |
| nächste Task | B | [] | [] |

Ausgabe: **A F C E D B**.

### async/await

\`await\` pausiert nur die **eigene** Funktion. Alles nach dem \`await\` wird als Microtask fortgesetzt; der aufrufende Code läuft sofort weiter:

\`\`\`javascript
async function laden() {
  console.log('1');
  await null;          // ab hier: Fortsetzung als Microtask
  console.log('2');
}
console.log('3');
laden();
console.log('4');
// Ausgabe: 3 1 4 2
\`\`\`

## Wenn die Seite einfriert

Rechnet ein Skript 2 Sekunden am Stück, kann der Browser in dieser Zeit **weder Klicks verarbeiten noch neu zeichnen** – die Seite wirkt eingefroren. Aufgaben über **50 ms** gelten als **Long Tasks**. Die Kennzahl **INP** (*Interaction to Next Paint*) der Core Web Vitals misst, wie schnell eine Seite auf Eingaben reagiert, und gilt bis 200 ms als gut.

> [!warning] Endlose Microtasks
> Weil der Browser erst rendert, wenn die Microtask-Queue leer ist, blockiert eine Promise-Kette, die sich ständig selbst neue Microtasks einplant, die Seite genauso wie eine Endlosschleife.

### Lösungen

1. **Arbeit aufteilen**: in Stücke von wenigen Millisekunden und dazwischen dem Browser die Kontrolle zurückgeben – mit \`await scheduler.yield()\` (in Chromium-Browsern) oder ersatzweise \`await new Promise((r) => setTimeout(r, 0))\`.
2. **Web Worker**: Rechenintensives in einen eigenen Thread verlagern. Worker haben keinen Zugriff auf das DOM und kommunizieren per \`postMessage\`. Diese App nutzt Worker z. B., um Nutzercode in einer Sandbox auszuführen.
3. **requestAnimationFrame** für Animationen statt \`setInterval\`, damit Änderungen genau vor dem nächsten Bild passieren.
4. **Debounce/Throttle** für häufige Ereignisse wie \`scroll\`, \`resize\` oder Tastatureingaben in einem Suchfeld.

\`\`\`javascript
// Große Liste verarbeiten, ohne die Oberfläche zu blockieren
async function verarbeiteAlle(eintraege, verarbeite) {
  const pause = () => (globalThis.scheduler?.yield ? scheduler.yield() : new Promise((r) => setTimeout(r, 0)));
  let start = performance.now();
  for (const eintrag of eintraege) {
    verarbeite(eintrag);
    if (performance.now() - start > 10) {   // spätestens alle 10 ms
      await pause();
      start = performance.now();
    }
  }
}
\`\`\`

## Node.js

Node.js hat ebenfalls einen Event Loop (über die Bibliothek **libuv**) mit mehreren Phasen (Timer, I/O-Callbacks, \`setImmediate\`, Close-Callbacks). Zusätzlich gibt es \`process.nextTick\`, dessen Warteschlange **noch vor** den Promise-Microtasks abgearbeitet wird. Das Grundprinzip bleibt gleich: Ein Thread führt JavaScript aus, I/O läuft im Hintergrund, Callbacks kommen über Warteschlangen zurück.
`,
  codeSnippet: `// Ein Timer mit 0 ms wartet trotzdem, bis Stack und Microtasks leer sind
const t0 = performance.now();
setTimeout(() => console.log('Timer nach', Math.round(performance.now() - t0), 'ms'), 0);

// 200 ms blockierende Schleife
while (performance.now() - t0 < 200) { /* rechnen */ }
console.log('Schleife fertig');

// Ausgabe:
// Schleife fertig
// Timer nach 200 ms   ← nicht nach 0 ms!`,
  codeLanguage: 'JavaScript',
  exercises: [
    {
      id: 'reihenfolge-1',
      title: 'Timer und Microtasks',
      prompt: 'In welcher Reihenfolge erscheinen die Ausgaben?\n\n```javascript\nsetTimeout(() => {\n  console.log("T1");\n  Promise.resolve().then(() => console.log("M1"));\n}, 0);\nsetTimeout(() => console.log("T2"), 0);\nPromise.resolve().then(() => console.log("M0"));\nconsole.log("S");\n```',
      hints: ['Nach jeder einzelnen Task wird die Microtask-Queue komplett geleert.'],
      solution: '**S, M0, T1, M1, T2**\n\nErst der synchrone Code (S), dann alle Microtasks (M0). Dann die erste Task T1 – sie plant M1 ein, das **vor** der nächsten Task T2 läuft.'
    },
    {
      id: 'reihenfolge-async',
      title: 'async/await verfolgen',
      prompt: 'Was wird ausgegeben?\n\n```javascript\nasync function a() {\n  console.log("a1");\n  await b();\n  console.log("a2");\n}\nasync function b() {\n  console.log("b1");\n}\nconsole.log("start");\na();\nPromise.resolve().then(() => console.log("p"));\nconsole.log("ende");\n```',
      solution: '**start, a1, b1, ende, a2, p**\n\n- `a()` läuft synchron bis zum `await`: a1, dann wird `b()` sofort ausgeführt: b1.\n- Die Fortsetzung von `a` (a2) kommt als erste Microtask in die Warteschlange, danach das `.then` mit p.\n- Nach „ende“ werden die Microtasks in dieser Reihenfolge abgearbeitet.'
    },
    {
      id: 'ui-blockiert',
      title: 'Einfrierende Suche',
      prompt: 'Eine Seite filtert bei **jedem Tastendruck** in einem Suchfeld 50.000 Einträge und baut die Ergebnisliste neu auf. Beim Tippen ruckelt die Eingabe. Nenne zwei Ursachen und drei Gegenmaßnahmen.',
      solution: 'Ursachen: (1) Jede Taste startet eine lange, synchrone Aufgabe, die den Hauptthread blockiert – Eingaben und Rendern müssen warten. (2) Der DOM-Neuaufbau mit Tausenden Elementen kostet viel Layout-Zeit.\n\nGegenmaßnahmen:\n- **Debounce**: erst filtern, wenn 200–300 ms keine Taste mehr gedrückt wurde.\n- **Filterung in einen Web Worker** auslagern oder in kleinen Stücken mit `scheduler.yield()` ausführen.\n- **Nur sichtbare Einträge rendern** (Virtualisierung/Paginierung) und Ergebnisse begrenzen.'
    }
  ],
  quiz: [
    {
      question: 'Was wird zuerst ausgeführt, wenn der Call Stack leer ist?',
      options: ['Die nächste setTimeout-Aufgabe', 'Alle Microtasks (z. B. Promise.then)', 'Das Rendern der Seite', 'Ein zufälliger Callback'],
      correct: 1,
      explanation: 'Die Microtask-Queue wird vollständig geleert, bevor die nächste Task drankommt oder gerendert wird.'
    },
    {
      question: 'Wohin kommt der Code nach einem await?',
      options: ['In die Task-Queue', 'In die Microtask-Queue', 'Er läuft sofort synchron weiter', 'In einen Web Worker'],
      correct: 1,
      explanation: 'Die Fortsetzung einer async-Funktion wird wie ein Promise-Callback als Microtask eingeplant.'
    },
    {
      question: 'Was gibt aus: setTimeout(() => console.log(1), 0); Promise.resolve().then(() => console.log(2)); console.log(3);',
      options: ['1 2 3', '3 1 2', '3 2 1', '2 3 1'],
      correct: 2,
      explanation: 'Erst synchron 3, dann die Microtask 2, dann die Task 1.'
    },
    {
      question: 'Ab welcher Dauer spricht man im Browser von einer Long Task?',
      options: ['5 ms', '50 ms', '500 ms', '5 s'],
      correct: 1,
      explanation: 'Aufgaben über 50 ms blockieren Eingaben spürbar und werden als Long Tasks gemeldet.'
    },
    {
      question: 'Welche Aussage zu Web Workern ist richtig?',
      options: [
        'Sie können das DOM direkt verändern',
        'Sie laufen in einem eigenen Thread und kommunizieren per postMessage',
        'Sie sind schneller als der Hauptthread, weil sie keinen Event Loop haben',
        'Sie werden nur in Node.js unterstützt'
      ],
      correct: 1,
      explanation: 'Worker haben eigenen Thread und eigenen Event Loop, aber keinen DOM-Zugriff.'
    },
    {
      question: 'Warum ist setTimeout(fn, 0) nicht wirklich „sofort“?',
      options: [
        'Weil Browser mindestens 1 Sekunde warten',
        'Weil fn erst läuft, wenn Stack und Microtask-Queue leer sind und die Task an der Reihe ist',
        'Weil 0 als unendlich interpretiert wird',
        'Weil setTimeout nur in Workern funktioniert'
      ],
      correct: 1,
      explanation: 'Die 0 ist nur eine Mindestwartezeit. Ausgeführt wird erst, wenn der Event Loop die Task aus der Queue holt.'
    }
  ],
  relatedLabs: [
    { id: 'computation_worker_lab', label: 'Web Worker für Berechnungen' },
    { id: 'perf_lab', label: 'Performance-Profiling' },
    { id: 'websockets', label: 'WebSockets' }
  ],
  sources: [
    { title: 'HTML Living Standard: Event loops', url: 'https://html.spec.whatwg.org/multipage/webappapis.html#event-loops' },
    { title: 'MDN: Microtasks in JavaScript mit queueMicrotask()', url: 'https://developer.mozilla.org/de/docs/Web/API/HTML_DOM_API/Microtask_guide' },
    { title: 'MDN: Web Workers verwenden', url: 'https://developer.mozilla.org/de/docs/Web/API/Web_Workers_API/Using_web_workers' },
    { title: 'web.dev: Interaction to Next Paint (INP)', url: 'https://web.dev/articles/inp' },
    { title: 'web.dev: Optimize long tasks', url: 'https://web.dev/articles/optimize-long-tasks' },
    { title: 'Node.js: The Node.js Event Loop', url: 'https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick' }
  ],
  sourcesCheckedOn: '29.10.2026'
};
