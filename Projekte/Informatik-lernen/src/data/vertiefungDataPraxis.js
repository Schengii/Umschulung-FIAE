import { LANGUAGE_EXTRA_TOPICS_REST } from './vertiefungDataRest';
// Fachliche Vertiefungen (Teil 2): Praxisprojekte, Kampagnenkapitel und zusätzliche Fachthemen
// innerhalb der bestehenden Programmiersprachen. Schlüssel = ID des vorhandenen Eintrags.
const md = (...lines) => lines.join('\n');

// ---------------------------------------------------------------- Praxisprojekte
export const PROJECT_DEEPDIVES = {
  proj_react_todo: {
    md: md(
      '### Warum der Code so aufgebaut ist',
      '- **Lazy Initializer** (`useState(() => ...)`): Der Wert aus `localStorage` wird nur beim ersten Rendern gelesen, nicht bei jedem Update.',
      '- **`useEffect` mit Abhängigkeit `[todos]`**: Das Speichern läuft nur, wenn sich die Liste ändert.',
      '- **Unveränderlichkeit**: `setTodos([...todos, neu])` erzeugt ein neues Array. React erkennt Änderungen über den Referenzvergleich, ein `push` auf das alte Array würde kein Neurendern auslösen.',
      '- **Keys** in Listen (`key={todo.id}`) brauchen stabile, eindeutige Werte, keine Array-Indizes, wenn Einträge gelöscht werden.',
      '',
      '### Robustheit',
      '- `JSON.parse` kann bei beschädigten Daten werfen. Fange den Fehler mit `try/catch` ab und starte dann mit einer leeren Liste.',
      '- `localStorage` ist synchron, auf ca. 5 MB begrenzt und für Skripte der Seite lesbar. **Keine Passwörter oder Tokens** dort speichern (XSS-Risiko).',
      '',
      '### Barrierefreiheit',
      'Jedes Eingabefeld braucht ein `<label>`, Buttons echte `<button>`-Elemente. Gelöschte Einträge sollten den Fokus sinnvoll an eine Stelle zurückgeben.',
      '',
      '### Erweiterungen mit Prüfungsbezug',
      '- Filter (alle, offen, erledigt) und Bearbeiten von Einträgen.',
      '- Komponententest mit Testing Library: Aufgabe hinzufügen, abhaken, löschen.',
      '- Dokumentation der Anforderungen als User Stories mit Akzeptanzkriterien.',
      '',
      '### Bewertungskriterien (Selbstcheck)',
      '- Funktioniert nach Neuladen, ohne Fehlermeldung in der Konsole.',
      '- Leere Eingaben werden abgelehnt.',
      '- Bedienung per Tastatur möglich.'
    ),
    sources: [
      { label: 'React Dokumentation: State', url: 'https://react.dev/learn/state-a-components-memory' },
      { label: 'MDN: Window.localStorage', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage' }
    ]
  },
  proj_py_scraper: {
    md: md(
      '### Rechtliche und technische Rahmenbedingungen',
      '- Prüfe die **Nutzungsbedingungen** der Seite und die Datei `robots.txt`. Sie legt fest, welche Bereiche Automaten nicht abrufen sollen.',
      '- Bevorzuge, wenn vorhanden, eine **API oder einen RSS-Feed** statt HTML-Scraping. Das ist stabiler und erwünscht.',
      '- Abgerufene Inhalte sind meist urheberrechtlich geschützt. Speichere und veröffentliche nur, was erlaubt ist. Personenbezogene Daten unterliegen der DSGVO.',
      '',
      '### Sauberer Abruf',
      '- Setze einen **User-Agent**, der dich identifiziert, und ein **Timeout** (z. B. `requests.get(url, timeout=10)`).',
      '- Warte zwischen Abrufen (Rate Limiting), um den Server nicht zu überlasten.',
      '- Prüfe den **Statuscode** (`response.raise_for_status()`) und behandle 404, 429 (zu viele Anfragen) und 5xx.',
      '',
      '### Robustes Parsen',
      '- Wähle Elemente über stabile Merkmale (Attribute, semantische Tags), nicht über die Position im Dokument.',
      '- Rechne damit, dass Felder fehlen: `element.get_text(strip=True) if element else None`.',
      '- Lege Ergebnisse strukturiert ab (CSV, JSON oder SQLite) und speichere das Abrufdatum mit.',
      '',
      '### Qualitätssicherung',
      'Speichere eine **Beispiel-HTML-Datei** und teste den Parser dagegen. So prüfst du ihn ohne Netzwerkzugriff und bemerkst Layoutänderungen früh.'
    ),
    sources: [
      { label: 'RFC 9309: Robots Exclusion Protocol', url: 'https://www.rfc-editor.org/rfc/rfc9309' },
      { label: 'Beautiful Soup Dokumentation', url: 'https://www.crummy.com/software/BeautifulSoup/bs4/doc/' }
    ]
  },
  proj_docker_api: {
    md: md(
      '### Multi-Stage-Build',
      'In der ersten Stufe (`builder`) werden Abhängigkeiten installiert und gebaut, in die zweite Stufe kommt nur das Ergebnis. Das Image wird **kleiner**, enthält **keine Build-Werkzeuge** und bietet weniger Angriffsfläche.',
      '',
      '### Layer-Caching nutzen',
      'Docker legt jeden Befehl als Schicht ab und verwendet unveränderte Schichten erneut. Kopiere daher **zuerst** nur `package.json` und `package-lock.json`, führe `npm ci` aus und kopiere **danach** den Quellcode. So wird die Installation nur bei geänderten Abhängigkeiten wiederholt.',
      '',
      '### Sicherheit im Image',
      '- **Nicht als root laufen**: Lege einen Benutzer an und wechsle mit `USER node` (das Node-Image bringt den Benutzer `node` mit).',
      '- **Keine Geheimnisse ins Image** (Passwörter, Schlüssel). Übergib sie zur Laufzeit als Umgebungsvariablen oder über Secrets.',
      '- Eine `.dockerignore` hält `node_modules`, `.git` und `.env` aus dem Build-Kontext.',
      '- Pinne Basis-Images auf eine feste Version statt `latest`.',
      '',
      '### Betrieb',
      '- `EXPOSE 3000` **dokumentiert** nur den Port, veröffentlicht wird er erst mit `-p 8080:3000` oder in Compose.',
      '- Ein **HEALTHCHECK** (z. B. Aufruf von `/health`) hilft Orchestrierern, defekte Container zu erkennen und neu zu starten.',
      '- Logs gehören auf **stdout/stderr**, damit sie `docker logs` einsammelt.',
      '',
      '### Selbstcheck',
      '- Image kleiner als 200 MB?',
      '- `docker run --rm -p 8080:3000 …` liefert eine Antwort der API?',
      '- Container läuft nicht als root (`docker exec … id`)?'
    ),
    sources: [
      { label: 'Docker Doku: Best Practices für Dockerfiles', url: 'https://docs.docker.com/build/building/best-practices/' },
      { label: 'Docker Doku: Multi-Stage Builds', url: 'https://docs.docker.com/build/building/multi-stage/' }
    ]
  }
};

// ---------------------------------------------------------------- Kampagnenkapitel
export const CAMPAIGN_DEEPDIVES = {
  ch1: {
    md: md(
      '### Fachlicher Hintergrund',
      '- **Logikgatter** und ihre Wahrheitstabellen: AND (beide 1), OR (mindestens eine 1), XOR (genau eine 1), NOT (Umkehrung), NAND und NOR (negiertes AND/OR).',
      '- **Halbaddierer**: Die Summe entsteht mit **XOR**, der Übertrag mit **AND**. Aus mehreren Addierern entsteht das Rechenwerk der CPU.',
      '- Zahlendarstellung: Binär, Hexadezimal und Zweierkomplement sind Grundlage für Speicher, Adressen und Netzmasken.',
      '',
      '### Prüfungsbezug',
      'AP1: Hardware, Speicherhierarchie, Einheiten (kB gegen KiB) und Zahlensysteme werden mit Rechenaufgaben abgefragt.'
    )
  },
  ch2: {
    md: md(
      '### Fachlicher Hintergrund',
      '- **Relationale Datenbanken**: Primär- und Fremdschlüssel, Normalformen (1NF bis 3NF), Joins (INNER, LEFT) und Aggregation mit `GROUP BY` und `HAVING`.',
      '- **Git**: Der Commit ist ein Schnappschuss, ein Branch ein beweglicher Zeiger darauf. `merge` führt Verläufe zusammen, `rebase` schreibt Commits auf eine neue Basis um (nicht auf bereits geteilte Branches anwenden).',
      '- **Datenschutz** im Projekt: Datensparsamkeit, Zweckbindung und Rechenschaftspflicht gelten schon beim Datenmodell.',
      '',
      '### Prüfungsbezug',
      'AP1 und AP2: ER-Modell, Normalisierung und SQL-Abfragen sowie Versionsverwaltung gehören zu den festen Prüfungsthemen.'
    ),
    sources: [{ label: 'Pro Git (Buch, deutsch)', url: 'https://git-scm.com/book/de/v2' }]
  },
  ch3: {
    md: md(
      '### Fachlicher Hintergrund',
      '- **REST**: Ressourcen werden über URLs adressiert, die HTTP-Methoden bestimmen die Aktion. GET, PUT und DELETE sind idempotent, POST nicht. Statuscodes: 2xx Erfolg, 4xx Clientfehler, 5xx Serverfehler.',
      '- **Test-Driven Development**: Zyklus aus **Rot** (Test schreiben, scheitert), **Grün** (minimaler Code), **Refactor** (aufräumen, Tests bleiben grün).',
      '- **Testpyramide**: viele schnelle Unit-Tests, weniger Integrationstests, wenige End-to-End-Tests.',
      '- **Reguläre Ausdrücke**: Anker (`^`, `$`), Quantifizierer (`*`, `+`, `?`, `{n,m}`), Gruppen und der Unterschied zwischen **gierig** und **faul** (`.*` gegen `.*?`).',
      '',
      '### Prüfungsbezug',
      'AP2 FIAE: Testkonzepte, Testarten (Black-Box, White-Box) und Schnittstellenentwurf werden im Fachgespräch und in der Dokumentation verlangt.'
    ),
    sources: [{ label: 'MDN: HTTP-Methoden', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods' }]
  },
  ch4: {
    md: md(
      '### Fachlicher Hintergrund',
      '- **CI/CD**: Bauen, Testen und Ausliefern laufen automatisiert in einer Pipeline. Continuous Delivery hält jede Version auslieferbar, Continuous Deployment liefert jede bestandene Änderung automatisch aus.',
      '- **Container**: Ein Image ist der unveränderliche Bauplan, ein Container die laufende Instanz. Mehrere Container teilen sich den Kernel des Hosts.',
      '- **Kubernetes**: Der **Pod** ist die kleinste Einheit, ein **Deployment** hält die gewünschte Zahl Replikate, ein **Service** bietet eine stabile Adresse, ein **Ingress** leitet externen HTTP-Verkehr zu Services.',
      '- **Messgrößen für DevOps (DORA)**: Deployment-Häufigkeit, Durchlaufzeit für Änderungen, Fehlerrate von Änderungen und Wiederherstellungszeit.',
      '',
      '### Prüfungsbezug',
      'AP2 FISI und FIAE: Virtualisierung und Container, Automatisierung und Betriebskonzepte tauchen in Planungsaufgaben und Projektdokumentationen auf.'
    ),
    sources: [{ label: 'DORA: Forschung zu DevOps-Kennzahlen', url: 'https://dora.dev/' }]
  },
  ch5: {
    md: md(
      '### Fachlicher Hintergrund',
      '- **OAuth 2.0 Authorization Code mit PKCE**: Der Client erzeugt einen zufälligen `code_verifier` und sendet nur dessen Hash `code_challenge = BASE64URL(SHA256(code_verifier))` (Methode `S256`). Beim Einlösen des Codes beweist er mit dem `code_verifier`, dass er die Anfrage gestellt hat. Das schützt öffentliche Clients (Single-Page-Apps, Mobile-Apps) vor dem Abfangen des Codes.',
      '- **Tokens**: Access Token (kurze Laufzeit, für APIs), Refresh Token (neue Access Tokens holen), ID Token (OpenID Connect, Identität des Nutzers).',
      '- **RAG-Pipeline**: Dokumente in **Abschnitte (Chunks)** teilen, jeden Abschnitt als **Embedding** (Vektor) speichern, bei einer Frage die ähnlichsten Abschnitte per Vektorsuche finden und dem Sprachmodell als Kontext mitgeben.',
      '',
      '### Fachgespräch',
      'Bereite pro Projektentscheidung drei Punkte vor: **Alternativen**, **Kriterien** der Entscheidung und **Risiken** samt Gegenmaßnahmen. Das ist die Struktur, nach der im Fachgespräch nachgefragt wird.'
    ),
    sources: [
      { label: 'RFC 7636: Proof Key for Code Exchange (PKCE)', url: 'https://www.rfc-editor.org/rfc/rfc7636' },
      { label: 'RFC 6749: OAuth 2.0', url: 'https://www.rfc-editor.org/rfc/rfc6749' }
    ]
  }
};

// ---------------------------------------------------------------- Zusätzliche Fachthemen je Sprache
const LANGUAGE_EXTRA_TOPICS_BASE = {
  python: [
    {
      title: '5. Comprehensions & Generatoren',
      desc: 'List- und Dict-Comprehensions formen Daten kompakt um. Generatoren liefern Werte bei Bedarf mit yield und sparen Speicher bei großen Datenmengen.',
      code: md(
        'quadrate = [x ** 2 for x in range(10) if x % 2 == 0]',
        'laengen = {name: len(name) for name in ["Anna", "Ben"]}',
        '',
        'def zahlen(n):',
        '    for i in range(n):',
        '        yield i * i          # Wert wird erst bei Bedarf erzeugt',
        '',
        'print(sum(zahlen(1_000_000)))  # speicherschonend, keine Liste im RAM'
      )
    },
    {
      title: '6. Dateien, Pfade & Context Manager',
      desc: 'Mit with wird eine Ressource auch bei einem Fehler zuverlässig freigegeben. pathlib behandelt Pfade plattformunabhängig, die Kodierung sollte immer angegeben werden.',
      code: md(
        'from pathlib import Path',
        '',
        'pfad = Path("daten") / "kunden.csv"',
        'with pfad.open(encoding="utf-8") as datei:',
        '    for zeile in datei:',
        '        print(zeile.strip())',
        '# Die Datei wird am Ende des with-Blocks geschlossen, auch bei Ausnahmen'
      )
    },
    {
      title: '7. Typ-Hinweise, Dataclasses & virtuelle Umgebungen',
      desc: 'Typ-Hinweise machen Code lesbar und prüfbar (z. B. mit mypy). Dataclasses erzeugen Konstruktor und Vergleich automatisch. Jedes Projekt bekommt eine eigene virtuelle Umgebung.',
      code: md(
        'from dataclasses import dataclass',
        '',
        '@dataclass(frozen=True)',
        'class Punkt:',
        '    x: float',
        '    y: float',
        '',
        'def abstand(a: Punkt, b: Punkt) -> float:',
        '    return ((a.x - b.x) ** 2 + (a.y - b.y) ** 2) ** 0.5',
        '',
        '# Terminal: python -m venv .venv   |   pip install -r requirements.txt'
      )
    }
  ],
  javascript: [
    {
      title: '4. Closures & Gültigkeitsbereich (Scope)',
      desc: 'Eine Closure ist eine Funktion, die sich Variablen ihres äußeren Bereichs merkt, auch nachdem dieser beendet ist. Damit lassen sich private Zustände kapseln.',
      code: md(
        'function zaehler() {',
        '  let stand = 0;',
        '  return () => ++stand;   // merkt sich stand (Closure)',
        '}',
        'const naechster = zaehler();',
        'console.log(naechster(), naechster()); // 1 2'
      )
    },
    {
      title: '5. Event Loop: Microtasks vor Macrotasks',
      desc: 'JavaScript führt Code in einem Thread aus. Promise-Callbacks (Microtasks) laufen vor Timer-Callbacks (Macrotasks), sobald der aktuelle Code beendet ist.',
      code: md(
        'console.log("A");',
        'setTimeout(() => console.log("B"), 0);            // Macrotask',
        'Promise.resolve().then(() => console.log("C"));   // Microtask',
        'console.log("D");',
        '// Ausgabe: A D C B'
      )
    },
    {
      title: '6. Module, Destructuring & Optional Chaining',
      desc: 'ES-Module teilen Code über import und export. Destructuring entpackt Werte, ?. verhindert Fehler bei fehlenden Zwischenobjekten und ?? setzt einen Standardwert nur bei null oder undefined.',
      code: md(
        '// mathe.js',
        'export const quadrat = (x) => x * x;',
        '',
        '// app.js',
        'import { quadrat } from "./mathe.js";',
        'const nutzer = { name: "Mia", adresse: null };',
        'const { name } = nutzer;                              // Destructuring',
        'const stadt = nutzer.adresse?.stadt ?? "unbekannt";   // ?. und ??',
        'console.log(name, stadt, quadrat(4));                 // Mia unbekannt 16'
      )
    }
  ],
  typescript: [
    {
      title: '4. Diskriminierte Unions & Vollständigkeitsprüfung',
      desc: 'Ein gemeinsames Feld (hier art) unterscheidet die Varianten. Mit never erkennt der Compiler, wenn ein Fall im switch fehlt.',
      code: md(
        'type Form =',
        '  | { art: "kreis"; radius: number }',
        '  | { art: "rechteck"; breite: number; hoehe: number };',
        '',
        'function flaeche(f: Form): number {',
        '  switch (f.art) {',
        '    case "kreis": return Math.PI * f.radius ** 2;',
        '    case "rechteck": return f.breite * f.hoehe;',
        '    default: {',
        '      const unmoeglich: never = f; // Compilerfehler, sobald ein Fall fehlt',
        '      return unmoeglich;',
        '    }',
        '  }',
        '}'
      )
    },
    {
      title: '5. unknown statt any & strikter Modus',
      desc: 'any schaltet die Typprüfung aus, unknown erzwingt eine Prüfung vor der Verwendung. Mit "strict": true in der tsconfig.json aktivierst du die wichtigsten Prüfungen gemeinsam.',
      code: md(
        'function lies(eingabe: string): number | null {',
        '  const wert: unknown = JSON.parse(eingabe);',
        '  if (typeof wert === "object" && wert !== null && "id" in wert) {',
        '    return Number((wert as { id: unknown }).id);',
        '  }',
        '  return null;',
        '}',
        '',
        '// tsconfig.json: { "compilerOptions": { "strict": true } }'
      )
    }
  ],
  java: [
    {
      title: '3. Optional statt null',
      desc: 'Optional macht den "kein Ergebnis"-Fall im Typ sichtbar. Der Aufrufer muss ihn behandeln, NullPointerExceptions werden seltener.',
      code: md(
        'Optional<String> name = findeName(42);',
        'String anzeige = name.map(String::toUpperCase).orElse("unbekannt");',
        '// Optional eignet sich als Rückgabetyp, nicht für Felder oder Parameter'
      )
    },
    {
      title: '4. Ausnahmen & try-with-resources',
      desc: 'Geprüfte Ausnahmen (z. B. IOException) müssen behandelt oder deklariert werden. Mit try-with-resources werden AutoCloseable-Ressourcen automatisch geschlossen.',
      code: md(
        'try (BufferedReader reader = Files.newBufferedReader(Path.of("daten.txt"))) {',
        '    String zeile;',
        '    while ((zeile = reader.readLine()) != null) {',
        '        System.out.println(zeile);',
        '    }',
        '} catch (IOException e) {',
        '    System.err.println("Lesefehler: " + e.getMessage());',
        '}',
        '// reader wird automatisch geschlossen, auch bei einer Ausnahme'
      )
    },
    {
      title: '5. Spring Boot: REST-Controller & Dependency Injection',
      desc: 'Abhängigkeiten werden per Konstruktor übergeben (Dependency Injection), Spring erzeugt und verdrahtet die Objekte. Der Controller bildet HTTP-Anfragen auf Methoden ab.',
      code: md(
        '@RestController',
        '@RequestMapping("/api/kunden")',
        'public class KundeController {',
        '    private final KundeService service;      // per Konstruktor injiziert',
        '',
        '    public KundeController(KundeService service) {',
        '        this.service = service;',
        '    }',
        '',
        '    @GetMapping("/{id}")',
        '    public ResponseEntity<Kunde> lesen(@PathVariable long id) {',
        '        return service.finde(id)               // liefert Optional<Kunde>',
        '                .map(ResponseEntity::ok)',
        '                .orElse(ResponseEntity.notFound().build());',
        '    }',
        '}'
      )
    }
  ],
  csharp: [
    {
      title: '3. Records & Pattern Matching',
      desc: 'Records sind unveränderliche Datenträger mit Wertgleichheit. Switch-Ausdrücke mit Mustern ersetzen verschachtelte if-Ketten.',
      code: md(
        'public record Bestellung(int Id, decimal Summe, string Status);',
        '',
        'string Beschreibe(Bestellung b) => b switch',
        '{',
        '    { Status: "offen", Summe: > 1000 } => "Offen, Freigabe nötig",',
        '    { Status: "offen" }                => "Offen",',
        '    { Status: "versandt" }             => "Unterwegs",',
        '    _                                  => "Unbekannt"',
        '};'
      )
    },
    {
      title: '4. ASP.NET Core: Minimal API & Dependency Injection',
      desc: 'Dienste werden im Container registriert (Lebensdauer: Singleton, Scoped oder Transient) und per Parameter in Endpunkte injiziert.',
      code: md(
        'var builder = WebApplication.CreateBuilder(args);',
        'builder.Services.AddScoped<IKundeService, KundeService>();',
        'var app = builder.Build();',
        '',
        'app.MapGet("/kunden/{id:int}", (int id, IKundeService service) =>',
        '    service.Finde(id) is { } kunde ? Results.Ok(kunde) : Results.NotFound());',
        '',
        'app.Run();'
      )
    },
    {
      title: '5. using, IDisposable & Nullable Reference Types',
      desc: 'using gibt Ressourcen am Blockende frei. Mit aktivierten Nullable Reference Types kennzeichnet ein ? Variablen, die null sein können, und der Compiler warnt vor unsicheren Zugriffen.',
      code: md(
        'using var reader = new StreamReader("daten.txt");   // wird am Ende des Blocks geschlossen',
        'string? zeile = reader.ReadLine();                    // ? = null ist möglich',
        'Console.WriteLine(zeile ?? "leer");'
      )
    }
  ],
  golang: [
    {
      title: '2. Slices & Maps',
      desc: 'Ein Slice ist eine Sicht auf ein Array mit Länge und Kapazität, append vergrößert es bei Bedarf. Der Zugriff auf eine Map liefert mit dem zweiten Rückgabewert, ob der Schlüssel existiert.',
      code: md(
        'zahlen := []int{1, 2, 3}',
        'zahlen = append(zahlen, 4)',
        'fmt.Println(len(zahlen), cap(zahlen))   // Länge 4, Kapazität wächst bei Bedarf',
        '',
        'alter := map[string]int{"Mia": 30}',
        'if wert, ok := alter["Ben"]; !ok {',
        '    fmt.Println("Ben nicht gefunden", wert)',
        '}'
      )
    },
    {
      title: '3. Fehlerbehandlung mit error-Werten',
      desc: 'Go kennt keine Exceptions. Funktionen geben einen error zurück, der mit %w verpackt und mit errors.Is oder errors.As geprüft wird.',
      code: md(
        'var ErrNichtGefunden = errors.New("nicht gefunden")',
        '',
        'func lade(id int) error {',
        '    return fmt.Errorf("lade %d: %w", id, ErrNichtGefunden) // %w verpackt den Fehler',
        '}',
        '',
        'func main() {',
        '    if err := lade(7); errors.Is(err, ErrNichtGefunden) {',
        '        fmt.Println("Fehler:", err)',
        '    }',
        '}'
      )
    },
    {
      title: '4. Interfaces & context',
      desc: 'Interfaces werden in Go implizit erfüllt: Ein Typ implementiert sie allein durch passende Methoden. Mit context lassen sich Abbruch und Zeitlimits durch Aufrufketten reichen.',
      code: md(
        'type Speicher interface {',
        '    Lade(id int) (string, error)',
        '}',
        '',
        'ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)',
        'defer cancel()',
        'req, _ := http.NewRequestWithContext(ctx, http.MethodGet, "https://example.org", nil)',
        'antwort, err := http.DefaultClient.Do(req)   // bricht nach 2 Sekunden mit Fehler ab'
      )
    }
  ],
  rust: [
    {
      title: '2. Result, Option & der ?-Operator',
      desc: 'Rust hat keine null-Werte und keine Exceptions: Option beschreibt "vorhanden oder nicht", Result "Erfolg oder Fehler". Der ?-Operator reicht Fehler an den Aufrufer weiter.',
      code: md(
        'use std::fs;',
        'use std::io;',
        '',
        'fn lese(pfad: &str) -> Result<String, io::Error> {',
        '    let text = fs::read_to_string(pfad)?;   // ? gibt den Fehler an den Aufrufer weiter',
        '    Ok(text.trim().to_string())',
        '}',
        '',
        'fn main() {',
        '    match lese("daten.txt") {',
        '        Ok(text) => println!("{text}"),',
        '        Err(fehler) => eprintln!("Fehler: {fehler}"),',
        '    }',
        '}'
      )
    },
    {
      title: '3. Enums & vollständiges match',
      desc: 'Rust-Enums können Daten pro Variante tragen. match muss alle Varianten behandeln, der Compiler meldet fehlende Fälle.',
      code: md(
        'enum Zahlung {',
        '    Bar,',
        '    Karte { nummer: String },',
        '    Rechnung(u32),                 // Zahlungsziel in Tagen',
        '}',
        '',
        'fn beschreibe(z: &Zahlung) -> String {',
        '    match z {',
        '        Zahlung::Bar => "bar".to_string(),',
        '        Zahlung::Karte { nummer } => format!("Karte {nummer}"),',
        '        Zahlung::Rechnung(tage) => format!("Rechnung, {tage} Tage"),',
        '    }',
        '}'
      )
    },
    {
      title: '4. Traits & Generics',
      desc: 'Traits beschreiben gemeinsames Verhalten. Generische Funktionen mit Trait-Schranke werden zur Compilezeit für jeden Typ erzeugt (Monomorphisierung), ohne Laufzeitkosten.',
      code: md(
        'trait Flaeche {',
        '    fn flaeche(&self) -> f64;',
        '}',
        '',
        'struct Kreis(f64);',
        'impl Flaeche for Kreis {',
        '    fn flaeche(&self) -> f64 { std::f64::consts::PI * self.0 * self.0 }',
        '}',
        '',
        'fn ausgeben<T: Flaeche>(form: &T) {',
        '    println!("{:.2}", form.flaeche());',
        '}'
      )
    }
  ]
};

export const LANGUAGE_EXTRA_TOPICS = { ...LANGUAGE_EXTRA_TOPICS_BASE, ...LANGUAGE_EXTRA_TOPICS_REST };
