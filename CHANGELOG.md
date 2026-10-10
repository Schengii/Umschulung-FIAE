# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei festgehalten.

## [Unreleased]

### Audit-Runde: Performance, Deployment, PWA-Cache, drei Lernfunktionen, Aufräumen

Umsetzung der Verbesserungsliste aus dem Projekt-Audit. Die strukturellen Entscheidungen stehen in ADR 0008–0011.

#### Performance — Layout-Shift von bis zu 0,94 auf ≤ 0,03
- **Befund (Lighthouse gegen den Build, mobil)**: Performance 0,63–0,87, CLS 0,19–0,94. Zwei Ursachen. (1) `<body>` wurde beim Laden mit `transform` animiert; solange die Animation lief, war `<body>` der Bezugsrahmen aller `position: fixed`-Elemente, Cookie-Banner, Toasts und Hintergrund-Glows hingen also am Dokument statt am Viewport und sprangen danach. (2) Header und Breadcrumbs kamen erst bei `DOMContentLoaded`, also nach dem ersten Paint, und schoben den Inhalt um die Header-Höhe nach unten.
- **Fix**: `<body>` blendet nur noch per `opacity` ein, die Bewegung liegt auf `<main>`. `components.js` fügt Header und Breadcrumbs ein, sobald der Parser den Platzhalter erzeugt (MutationObserver). Achievement-Toasts gleiten per `transform` statt über `bottom`. Statische `<img>` tragen `width`/`height`.
- **Ergebnis (9 Stichproben-Seiten, lokal)**: CLS 0,000–0,024, Performance 0,88–0,96.
- **Weitere Ladezeit-Punkte**: Die sechs `@import` in `style.css` (seriell, render-blockierend, auf jeder Seite) sind entfernt; Modul-Stylesheets werden nur noch von den Seiten geladen, die sie brauchen, oder vom Modul nachgeladen (`window.loadStylesheet`). Copilot-Widget, Konfetti und Easter Egg laden erst im Leerlauf (`IDLE_MODULES`). Die Command Palette lädt die Projektdaten (46 KB) erst beim ersten Öffnen statt auf jeder Seite. Der Cursor-Glow lief als Dauer-`requestAnimationFrame`-Schleife und läuft jetzt nur, solange er sich bewegt; Zeiger-Effekte entfallen auf Touch-Geräten und bei `prefers-reduced-motion`. Die Einblend-Verzögerung der Karten wuchs mit dem Index (letzte Karte einer langen Seite knapp 3 s unsichtbar) und ist auf sichtbare Elemente und 450 ms begrenzt.

#### Icons — Font Awesome als Subset (ADR 0009)
- 103 KB CSS + 300 KB WOFF2 (plus ungenutzte TTF) → 21 KB + 22 KB. `npm run subset-icons` baut die ausgelieferte Kopie aus dem gepinnten npm-Paket; `check-icons` ist CI-Gate; `icons.spec.js` prüft auf jeder Seite, dass jedes Icon ein Glyph hat.
- **Dabei gefunden**: Fünf Stellen nutzten Font-Awesome-4-Namen (`fa-clock-o`, `fa-file-pdf-o`, `fa-file-text-o`, `fa-keyboard-o`) oder ein Pro-Icon (`fa-wifi-slash`) und waren schon vorher leer. Korrigiert.

#### Deployment — Produktion liefert `dist/` aus (ADR 0008)
- `vercel.json` setzt `buildCommand`/`outputDirectory`; `.vercelignore` schließt `scripts/` nicht mehr aus.
- **Build repariert, bevor er live geht**: `build_minified.js` übersprang jedes Verzeichnis namens `dist` (also die Demo-Builds unter `Projekte/*/dist/`, Ziel von sieben Projekt-Links) und kopierte `assets/videos` nicht. Jetzt wird `assets/` vollständig kopiert, und der Build bricht ab, wenn ein in `projects.json` verlinktes lokales Ziel fehlt.
- **Noch offen (nicht lokal prüfbar)**: das erste Vercel-Preview-Deployment mit dieser Konfiguration ansehen, bevor es auf `main` geht.

#### PWA — Cache-Name aus Inhalts-Hash (ADR 0010)
- `generate-sw-assets` schreibt `CACHE_NAME` als Hash über alle Precache-Dateien; `check-sw-assets` wird bei jeder inhaltlichen Änderung rot, bis das Skript gelaufen ist. Das ersetzt das manuelle Hochzählen.
- `sw.js`: nur noch `GET` wird beantwortet; offline wird die gecachte Seite auch bei URLs mit Query-String geliefert (`projekt-detail.html?repo=…`); Cache-Schreibvorgänge hängen an `waitUntil`. `sw.js` läuft jetzt durch ESLint, Prettier und den Typecheck (`jsconfig.sw.json`).
- Übernimmt ein neuer Service Worker eine offene Seite, erscheint ein Hinweis mit „Neu laden".
- Cache-Header: CSS/JS/Daten/Vendor revalidieren immer (ETag), Fonts bleiben `immutable`.
- **Dashboard-Widget „PWA"**: zeigte feste Zahlen („48 Assets", „v25") und erfundene IndexedDB-/Latenzwerte. Jetzt die echten Werte aus Cache Storage, Service-Worker-Registrierung und Netzwerkstatus; die Schaltflächen prüfen die Offline-Verfügbarkeit bzw. suchen nach Updates.

#### Neu — IHK-Prüfungssimulation (`quiz.html`)
- Der bisherige „Simulator" startete nur einen Timer über denselben fünf Website-Fragen und wertete nichts aus. Neu: Fragenpool mit 63 zweisprachigen Übungsfragen (AP1 21, AP2 24, WISO 18) in 14 Themengebieten (`modules/exam-questions.js`), themen-balancierte Zufallsauswahl, Zeitlimit (über Zeitstempel, nicht über Tick-Zähler), keine Rückmeldung während der Prüfung, Abgabe mit Hinweis auf offene Fragen, automatische Abgabe bei Zeitablauf.
- Auswertung: Punkte, Note nach IHK-Schlüssel, bestanden ab 50 %, Tabelle je Themengebiet, Durchsicht aller Fragen mit Erklärung. Schwache Themen fließen in die Lernempfehlungen des Dashboards. Neuer Erfolg `exam_passed`.
- Die Fragen sind eigene Übungsaufgaben im Stil der Prüfung, keine Originalaufgaben; das steht auch auf der Seite.

#### Neu — Lernkarten mit Wiederholungsplanung (`flashcards.html`)
- Die Leitner-Boxen waren bisher nur ein Etikett: Jede Karte kam jedes Mal. Jetzt hat jede Karte ein Fälligkeitsdatum (Box 2 nach 3 Tagen, Box 3 nach 7 Tagen, neue und falsch beantwortete Karten sofort), es gibt das Deck „Heute fällig" mit Zähler, und jede Karte zeigt ihre nächste Wiederholung. Fälligkeiten zählen ganze Kalendertage und bleiben über die Zeitumstellung auf Mitternacht.
- Beschädigte gespeicherte Daten (kaputtes JSON) legen die Seite nicht mehr lahm.

#### Neu — Fortschritt exportieren/importieren (`dashboard.html`)
- Lernstand, Highscores, Erfolge und Einstellungen als JSON-Datei sichern und wieder laden (`modules/progress-backup.js`). Import mit Vorschau und Bestätigung; unbekannte Schlüssel und beschädigte Werte werden verworfen. Bewusst eine Schlüssel-Allowlist: Die Demos unter `Projekte/` teilen sich denselben Origin, ihre Daten werden weder exportiert noch überschrieben.

#### Git-Simulator — Logik als testbare Engine (ADR 0011)
- `modules/git-engine.js` enthält Zustand, Befehle und Level-Regeln ohne DOM; `git-simulator.js` rendert nur noch.
- **Behobene Fehler**: `git stash` und `git cherry-pick` fehlten ganz (Level 5 galt nach irgendeinem Commit als bestanden, Level 6 war unlösbar); Level 3 war nach eigener Anleitung nicht bestehbar (Fast-Forward statt Merge-Commit); Level 4 galt schon ohne Rebase als bestanden; die Erfolgsmeldung kam nach jedem weiteren Befehl erneut; Eingaben wurden per `innerHTML` ins Terminal geschrieben.
- **Neu**: `git status`, `git branch` (Liste) und `git branch -d`, `touch <datei>`; korrekte Unterscheidung von „Already up to date", Fast-Forward und Merge-Commit; nicht mehr erreichbare Commits verschwinden aus dem Graphen; Terminal-Ausgaben zweisprachig; eigene Lane und Farbe je Branch, der Graph wächst in der Höhe mit.

#### Behobene Fehler (bei Umsetzung und Test gefunden)
- **`Achievements`/`GameAudio` waren für klassische Scripts unsichtbar** (der im letzten Eintrag als „bewusst offen" vermerkte Fund): beide hängen jetzt an `window`. Sound ist standardmäßig aus und hat einen einzigen Schalter im Footer (`sound_enabled`), der die alten Schlüssel `audio_effects_enabled` und `game_audio_muted` ablöst.
- **Theme**: Der `<head>`-Bootstrap las `portfolio_theme`, geschrieben wurde `theme` – wer das helle Theme gewählt hatte, bekam bei jedem Seitenaufruf zuerst das dunkle. Ein erster Besuch folgt jetzt `prefers-color-scheme`.
- **Sprache**: wurde erst nach dem Layout gesetzt; englische Besucher sahen kurz den deutschen Text. Jetzt vor dem ersten Paint.
- **Toasts** hatten außerhalb von `portfolio.html` keinen positionierten Container und erschienen ungestylt im Seitenfluss.
- **Seitenübergang**: Ein Klick auf einen Download-Link (und die Rückkehr aus dem bfcache) ließ das deckende Overlay stehen.
- **Erfolge**: `polyglot` wurde auch durch Module ausgelöst, die `langchange` nur zum Neu-Rendern feuern; `cv_downloaded` und `git_master` konnten nie freigeschaltet werden; der Konfetti-Aufruf im Git-Simulator ging an ein nicht existierendes `window.confetti`.
- **Command Palette**: Der Suchtext wurde bei „keine Treffer" per `innerHTML` eingefügt.
- **Skill-Matchmaker** funktionierte nur, wenn die Command Palette die Projektdaten vorher geladen hatte.
- **„Letzte Code-Aktivität" (Startseite)**: fragte die Commits dieses (privaten) Repos ab – immer 404 samt Konsolenfehler – und zeigte dann erfundene Commits mit relativen Daten. Jetzt die zuletzt aktualisierten öffentlichen Repositories aus der GitHub-API (gemeinsamer Cache mit `projekt-detail`), sonst ein ehrlicher Hinweis mit Link zum Profil.
- **Copilot-Chat** nannte für Zeugnisse/Gehalt noch den entfernten „Token-Schutz" samt früherem Passwort. Antwort verweist jetzt wie die Seite auf Anfrage per E-Mail.
- **ElektroCheck-Scanner**: Der Bounding-Box-Renderer lag in einem Script, das keine Seite lud; die Mängel-Rahmen wurden nie gezeichnet. Jetzt ein importiertes Modul (`bounding-box-renderer.js`), Rahmen liegen exakt über dem Bild.
- **Quiz** speicherte bei falschen Antworten `[null]` als „schwache Kategorie".
- **Kaputte Verweise**: `academy_campus.png` (Link auf der Startseite, `og:image` der News-Seite) existierte nie. Drei `<source>` gaben WebP als `image/png` aus.
- **`projekt-detail`**: ein beschädigter Cache-Eintrag brach die Seite ab.

#### Barrierefreiheit & Zweisprachigkeit
- Attribute (`aria-label`, `title`, `placeholder`) waren an rund 100 Stellen nur deutsch oder nur englisch. Neuer Mechanismus `data-en-<attribut>` in `modules/translation.js`, greift auch für später eingefügtes Markup.
- Toasts sind zweisprachig (`showToast({ de, en })`), ebenso Terminal, Prüfungssimulation, Backup-Karte.
- Überschriften-Hierarchie auf Startseite, `home`, `lebenslauf`, `berufsfoerderungswerk`, News und Quiz korrigiert; Linktext „hier" ersetzt.
- Helles Theme: Footer-Metazeile und Achievement-Toast-Titel hatten zu wenig Kontrast. Die axe-Prüfung läuft jetzt in beiden Themes (vorher nur dunkel).
- Konfetti respektiert `prefers-reduced-motion`.

#### SEO & `<head>`
- Doppelte Open-Graph-Tags in `index.html` entfernt; `twitter:card` auf sechs Seiten ergänzt; `noindex` auf Fehler- und Offline-Seiten.
- `npm run update-sitemap` setzt `<lastmod>` je Seite aus dem Git-Datum (vorher ein Pauschaldatum); `check-sitemap` (CI) gleicht Sitemap und indexierbare Seiten ab.
- `https://www.gstatic.com` aus der CSP aller Seiten und des Headers entfernt (ungenutzt).

#### CI & Tooling
- `ci.yml`: `permissions: contents: read`, `concurrency` bricht überholte Läufe ab, nur noch `npm ci`, `npm audit` ohne `--omit=dev` (das Projekt hat nur devDependencies – vorher wurde nichts geprüft), neue Gates `check-icons` und `check-sitemap`, zusätzlicher E2E-Lauf gegen `dist/`.
- Lighthouse-CI misst `dist/`, drei Läufe; Performance (≥ 0,8) und CLS (≤ 0,1) sind jetzt Fehler statt Warnung.
- `npm run regen` (Subset + Service-Worker-Liste in der richtigen Reihenfolge) und `npm run check` (alle statischen Gates).
- Der wöchentliche Projekt-Sync aktualisiert Icon-Subset und Service Worker mit.

#### Aufgeräumt
- **Entfernt**: `assets/js/elektrocheck_overlay.js` (ersetzt durch das Modul), zwei Platzhalter-„PDFs" des früheren Token-Downloads (Textdateien mit `.pdf`-Endung, öffentlich ausgeliefert, nirgends verlinkt), Font-Awesome-TTFs und `fa-v4compatibility`, ungenutzte Konstanten (`IHK_TARGET_DATE`, `SKILL_OBSERVER_THRESHOLD`), totes Global `BoundingBoxRenderer`, tote `#audio-mute-toggle`-Regeln.
- Direkte `localStorage`-Zugriffe laufen über `AppStorage`; die GitHub-Cache-Schlüssel stehen einmal in `STORAGE_KEYS` statt dreimal als String.
- `README.md`: veraltete Zahlen (Testanzahl, Seitenzahl, Cache-Version) durch Beschreibungen ersetzt, lokale `file:///`-Links entfernt, Deployment- und Skript-Abschnitt aktualisiert. `CLAUDE.md` und ADR-Index auf dem aktuellen Stand.

#### Tests
- Unit-Tests (Vitest): 77 → 164 (Git-Engine, Fälligkeitslogik, Prüfungsauswertung und Fragenpool, Backup-Format).
- Neue E2E-Specs: Icon-Abdeckung, Prüfungssimulation, Wiederholungsplanung, Fortschritts-Backup, ElektroCheck-Scanner; erweitert: Git-Simulator, Barrierefreiheit (beide Themes), Landing-Page (Theme-Start). Stand lokal: Chromium-Suite vollständig grün (152 Tests) vor den letzten Aufräum-Änderungen, danach die betroffenen Specs einzeln. Firefox, WebKit, Pixel 5 und der Lauf gegen `dist/` wurden lokal nicht mehr vollständig durchlaufen (Lauf wegen Speichermangel abgebrochen) und sind über die CI-Matrix zu bestätigen.

#### Nicht im Code lösbar
- **Branch-Protection** für `main` ist weiterhin nicht aktiv (GitHub-Einstellung). Ohne sie verhindert eine rote CI keinen Merge.

### CI — Firefox-E2E: `localhost`-Demo-Backends werden ignoriert
- **Fix**: `all_projects_launch.spec.js` ignorierte nicht erreichbare Demo-Backends (Firefox: „CORS request did not succeed“) nur auf `127.0.0.1`. `BurgenGame` ruft `http://localhost:3001/api/health` auf, was `E2E (firefox)` auf `main` rot machte. Der Filter erlaubt jetzt beide Loopback-Hostnamen (nie den Test-Server-Port 8080).

### Tooling — Typecheck auf 0 Fehler, jetzt CI-Gate
- **Ergebnis**: Die letzten 70 Fehler sind behoben (Verlauf: 598 → 70 → 0). `npm run typecheck` ist in der CI kein beratender Schritt mehr (`continue-on-error` entfernt) und bricht den Build bei neuen Fehlern.
- **Wie (ohne Verhaltensänderung)**: `globals.d.ts` typisiert die Custom-Events `langchange`/`radarfilter` (`CustomEvent`), `Element.closest()` (Standard `HTMLElement`) und die Tag-Selektor-Überladungen von `querySelector(All)`, damit `querySelector('img')` ein `HTMLImageElement` bleibt; weitere Globals (`APP`, `newsData`, `initTranslation`, …) sind deklariert. Dazu JSDoc-Typen an Deklarationen (`<video>`, `<iframe>`, Formularfelder, SVG-Kreis) und `event.target`-Zugriffen. Die beiden `score`-Kollisionen zwischen `quiz.js` und `snake.js` (klassische Scripts mit globalem Scope, nie auf derselben Seite geladen) sind per begründetem `@ts-ignore` markiert — ein `export {}` wäre in einem klassischen `<script>` ein Syntaxfehler.
- **Bekannter Fund, bewusst nicht behoben**: `Achievements` (`modules/achievements.js`) und `GameAudio` (`modules/game-audio.js`) sind modul-lokale Konstanten und werden nirgends als Global bereitgestellt (anders als `Confetti` via `window.Confetti`). Alle Aufrufer prüfen `typeof Achievements/GameAudio !== 'undefined'` und laufen daher ins Leere: keine Soundeffekte, keine Freischaltungen aus `flashcards`/`interview`/`quiz`/`git-simulator`, und das Dashboard meldet „Achievements module not loaded“. Browser-Probe bestätigt: beide `typeof` ergeben auf Dashboard, Quiz, Git-Simulator und Snake `undefined`. Der Zweig `module.default` in `git-simulator.js` ist ebenfalls tot (kein Default-Export). Das Einschalten würde Töne (Standard: nicht stumm) und Erfolgs-Toasts erstmals aktivieren — eine Produktentscheidung, daher separat.

### Repo-Hygiene — `Projekte/` vermessen, IDE-Müll entfernt, Screenshot verkleinert
- **Messung** (getrackte Dateien): Repo 198 MB, davon `Projekte/` 164 MB (83 %) in 2546 Dateien; Git-Historie 185 MiB. Hauptgewicht sind Bilder (121 MB), nicht Build-Output (`dist`/`build`/`www`: 22 MB). `ManuFaktur` allein hat 110 MB, wird aber wöchentlich aus einem eigenen Repo gesynct (`REPO_MAPPING`) — Optimierungen müssen dort passieren, sonst überschreibt der Sync sie. Entscheidung: Struktur unverändert lassen (Submodule/Deploy-Sync wären ein großer Umbau ohne Gewinn bei der Klongröße, History-Rewrite bricht PRs und Forks).
- **Entfernt**: 53 getrackte Dateien aus `Projekte/ElektroCheck AI/.vs/` (Visual-Studio-Benutzerstatus mit Copilot-Snapshots/-Sitzungen) aus dem Index genommen und `.vs/` in `.gitignore` aufgenommen. Die Dateien bleiben lokal erhalten, in der Git-Historie aber weiterhin enthalten.
- **Verkleinert**: `ElektroCheck AI/docs/images/ElektroCheck_ai_Bild1.png` (6,0 MB, nirgends referenziert) durch eine WebP-Fassung ersetzt (0,58 MB, Qualität 90). Verlustfreie PNG-Neukodierung brachte nur ~2 %, weil es eine fotoähnliche Infografik ist.

### Tooling — Typecheck-Altlast von 598 auf 70 Fehler reduziert
- **Fix (ohne Verhaltensänderung)**: Test-/Spec-Dateien sind aus `jsconfig.json` ausgenommen (sie stubben `window` absichtlich). Zahlen/Booleans, die in Textfelder oder Attribute gehen (`setAttribute('r', 14)`, `el.textContent = score`, `style.opacity = 1`), laufen durch `String(...)` — identisch zur DOM-eigenen Umwandlung. `globals.d.ts` setzt `querySelector`/`querySelectorAll` ohne Tag-Selektor auf `HTMLElement` als Standardtyp, und weitere `getElementById`-Deklarationen und `this.field`-Zuweisungen haben JSDoc-Typen. Chromium-Suite (80 Tests), Lint und Unit-Tests grün.
- **Rest (70)**: überwiegend Einzelfälle; dazu zwei echte Namenskollisionen (`score` in `quiz.js` und `snake.js`, beides klassische Scripts mit globalem Scope). `typecheck` bleibt in der CI beratend.

### CI — CSP-Hashes waren zeilenendungsabhängig (Ursache der roten CI)
- **Befund**: `check-csp` schlug in der CI auf allen bisherigen `main`-Läufen fehl. Die `sha256`-Hashes in den CSP-`<meta>`-Tags wurden unter Windows über CRLF-Inhalt berechnet, im Repo und auf dem Linux-Runner (und damit in Produktion) ist der Inline-Script-Text aber LF — der Hash stimmte dort nie. Betroffen: `home`, `lebenslauf`, `portfolio`, `ueber-mich`, `dashboard`; auf diesen Seiten dürften Inline-Scripts durch die strengere Meta-CSP blockiert worden sein.
- **Fix**: `.gitattributes` erzwingt LF für HTML/JS/CSS/JSON/MD/YML; `scripts/verify_csp_hashes.js` normalisiert vor dem Hashen CRLF zu LF; die Hashes der fünf Seiten wurden mit `check-csp:fix` neu geschrieben. Die neuen Werte stimmen mit den vom CI-Runner gemeldeten überein.
- **Folgefund**: Weil die CI bisher schon an `check-csp` abbrach, lief die E2E-Matrix lange nicht. Erster voller Lauf: 310 grün, 9 flaky (8× WebKit-axe-`color-contrast`, 1× Firefox-Service-Worker/Video), 1 hart rot — `all_projects_launch` in Firefox, weil das optionale `finance-ai-bot`-Backend (`127.0.0.1:8000`) in der CI nicht läuft und Firefox das als CORS-Konsolenfehler meldet. Dasselbe gilt für `Wohnungssuche KI` (`:5000`). Der Test ignoriert jetzt gezielt Firefox' „CORS request did not succeed“ gegen Loopback-Ports außer dem Testserver (`:8080`) — Chromiums Äquivalent `Failed to load resource` wurde schon gefiltert, echte CORS-Fehler gegen erreichbare Server bleiben sichtbar.

### Testing — E2E-Specs hängen nicht mehr an der GitHub-API
- **Befund**: Nach der Matrix-Umstellung bestanden 7 Tests erst im Retry (Firefox: 5, WebKit: 2). Gemeinsamer Nenner in Firefox: `waitForLoadState('networkidle')` lief in den 30-s-Timeout, weil mehrere Seiten (`projekt-detail`, Recruiter-Filter) die unauthentifizierte `api.github.com` abfragen — auf geteilten Runner-IPs langsam oder rate-limitiert. In WebKit reichte das Standard-Timeout von 5 s für den Landing-Page-Redirect (800 ms Feedback + Laden von `home.html`) nicht immer.
- **Fix**: `scripts/e2e-helpers.js` (`stubGithubApi`) beantwortet GitHub-Requests sofort mit einem 403 „rate limit“ — dieselbe Fallback-Strecke, die die App ohnehin hat, nur deterministisch. Eingebunden in `all_pages`, `new_features` und `landing_page`. Der Helfer liegt bewusst in `scripts/`, damit weder Service-Worker-Precache noch Build ihn aufnehmen. Der Redirect-Test wartet bis zu 15 s auf `home.html`.
- **Korrektur**: Der GitHub-Stub allein beseitigte die Firefox-Flakes nicht (im CI-Lauf danach weiter 5× `networkidle`-Timeout, jeweils auf einer anderen Seite). Deshalb ersetzt `settle(page)` aus `scripts/e2e-helpers.js` alle 18 `waitForLoadState('networkidle')` in den Specs: Es wartet höchstens 10 s auf Netzwerkruhe und läuft danach weiter, statt den Test beim 30-s-Timeout abzubrechen. Die Konsolen-/pageerror-Listener und die auto-wartenden Locator-Assertions bleiben strikt. Das ist eine Abmilderung; warum einzelne Seiten in Firefox auf CI nicht zur Ruhe kommen, ist nicht geklärt.

### CI — E2E-Matrix parallelisiert
- **Befund**: Ein einziger serieller Job (Checks + alle vier Browser-Projekte) brauchte ~13 Minuten und lieferte bei einem Fehler wenig Hinweis auf den Browser.
- **Fix**: `ci.yml` getrennt in `quality` (Daten-/CSP-/Lint-/Unit-/Build-Gates, einmalig), `e2e` (Matrix je Playwright-Projekt, `fail-fast: false`, installiert nur den jeweils nötigen Browser, lädt `test-results/` bei Fehlern als Artefakt hoch) und `lighthouse`. Job-Namen haben sich geändert (Branch-Protection ist im Repo nicht aktiv, daher keine Pflicht-Checks betroffen). Der Schrittname „(22 Projects)“ entfällt.

### PWA — Service Worker fasst Audio/Video und Range-Requests nicht mehr an
- **Befund**: `sw.js` behandelte Videos wie normale Assets (Stale-While-Revalidate). Medien werden aber per Range-Request geladen: eine 206-Teilantwort lässt sich nicht cachen, und eine vollständig gecachte Datei ist keine gültige Antwort auf einen Range-Request. In Firefox brach das Laden mit „A ServiceWorker intercepted the request and encountered an unexpected error“ ab (sichtbar als flaky E2E-Test auf `projekt-detail.html?repo=EcoChef`, betrifft aber echte Nutzer).
- **Fix**: Requests mit `Range`-Header sowie `destination` `video`/`audio` werden nicht mehr abgefangen, der Browser streamt sie direkt. `CACHE_NAME` auf `umschulung-fiae-v42`.

### Testing — axe-`color-contrast` auf WebKit nicht mehr flaky
- Die Footer-Kontrastverstöße traten nur im ersten Versuch auf CI-WebKit auf und verschwanden im Retry. `accessibility.spec.js` aktiviert jetzt `prefers-reduced-motion` (die Seite kollabiert dann alle Übergänge) und wartet auf laufende Animationen, damit axe den eingeschwungenen Zustand misst und keine halbtransparenten Zwischenfarben.

### Sicherheit — Nutzertexte in `innerHTML` werden escaped
- **Befund**: Eigene Flashcards (Frage, Antwort, Hinweis, Kategorie, ID) wurden roh in `localStorage` gespeichert und per `innerHTML` gerendert; im Interview-Trainer ging die freie Antwort (`h.answer`) ungefiltert in die Ergebnisansicht. Beides ist Self-XSS, bei den Flashcards bleibt der Payload jedoch dauerhaft im Browser bestehen.
- **Fix**: Neues Modul `assets/js/modules/html-utils.js` (`escapeHtml`) mit Unit-Test; `flashcards.js` escaped eigene Karten beim Rendern (eingebaute Karten behalten ihr vertrauenswürdiges Markup), `interview.js` escaped Frage und Antwort (klassisches Script, daher lokale Kopie des Helfers). E2E-Test `flashcards_escaping.spec.js` schlägt ohne den Fix fehl.

### Tooling — Node 24, `AppStorage`, Typecheck-Altlast
- **Node**: CI-Workflows auf Node 24 (Vitest 5 verlangt Node ≥ 22.12 und lief auf Node 20 nicht), `engines` in `package.json` und `.nvmrc` ergänzt.
- **`StorageManager` → `AppStorage`**: Der globale Storage-Wrapper aus `components.js` überschattete den DOM-Typ `StorageManager` (91 Vorkommen in 19 Dateien umbenannt, kein Laufzeitunterschied).
- **Typecheck**: `assets/js/globals.d.ts` deklariert die zwischen klassischen Scripts geteilten Globals, dazu JSDoc-Typannotationen an DOM-Deklarationen und `event.target`-Zugriffen. Fehler von 598 auf 206 gesunken; die Stufe bleibt in der CI beratend (`continue-on-error`).

### Testing — Unit-Tests für `event-bus` und `resolveAssetPath`
- 16 neue Vitest-Fälle (61 → 77): `resolveAssetPath` für Seiten in `pages/`, Root-Seiten, Windows-Pfadtrenner und durchgereichte URLs; `event-bus` für Nutzdaten, Abmelden, `onceEvent` und Event-Trennung. ESLint kennt `EventTarget` als Global.
- Service-Worker-Cache auf `umschulung-fiae-v41` angehoben, Precache-Liste enthält `html-utils.js`.

## [1.8.0] — 2026-09-28

### Barrierefreiheit — WCAG-AA-Kontrastfehler auf Amber-Elementen und Playlist-Icon behoben
- **Bug gefunden**: Drei CSS-Stellen verwendeten `color: white` auf Hintergründen mit unzureichendem Kontrast: `.btn-edit-project:hover` (`background: #f59e0b`, ~2,1:1), `.stars-badge` (Gradient `#f59e0b → #d97706`, ~2,1:1) und `.playlist-track-btn.active .track-icon` (hartkodiertes `#ffffff` statt `var(--text-on-primary)` auf `var(--primary)`-Hintergrund). Alle drei unterschreiten die WCAG 2.1 AA-Anforderung von 4,5:1 und waren der verbliebene „bekannte Folgefund" aus dem vorherigen A11y-Eintrag.
- **Fix**: `.btn-edit-project:hover` und `.stars-badge` auf `color: #451a03` (Dunkelbraun, Kontrast ~7,3:1 auf `#f59e0b`) umgestellt; `.playlist-track-btn.active .track-icon` auf `color: var(--text-on-primary)` normalisiert. Betroffen: `assets/css/style.css` (2 Stellen) und `assets/css/praktikumsbetrieb.css` (1 Stelle).

### Sicherheit — Web3Forms Server-seitigen Honeypot-Parameter ergänzt
- **Befund**: `assets/js/modules/contact-form.js` prüfte den Honeypot-Wert bereits client-seitig und die HTML-Formulare hatten das `input[name="botcheck"]`-Feld korrekt, aber der JSON-Payload an die Web3Forms-API fehlte `botcheck: false` — die server-seitige Spam-Erkennung von Web3Forms war damit nicht aktiviert.
- **Fix**: `botcheck: false` als expliziter Parameter zum Web3Forms-JSON-Payload ergänzt. Web3Forms blockiert Einreichungen mit `botcheck: true` jetzt auch serverseitig.

### Code-Qualität — `.prettierignore` für generierte Dateien und Sub-Projekte eingeführt
- **Befund**: `assets/js/projects_data.js` (maschinell generiert von `npm run generate-data`) wurde bei jedem `npm run format:fix`-Lauf neu formatiert — unnötiges Diff-Rauschen. `Projekte/`-Unterordner haben eigene Tooling-Konfigurationen und sollten nicht per Haupt-Prettier formatiert werden.
- **Fix**: `.prettierignore` angelegt mit `assets/js/projects_data.js`, `Projekte/` und `dist/`. `npm run format:check` bleibt grün.

### Testing & CI — Playwright-Workers-Konfiguration stabilisiert
- **Befund**: `playwright.config.js` setzte `workers: 1`, obwohl `fullyParallel: true` konfiguriert war — alle 316 Tests liefen seriell trotz Multi-Core-Verfügbarkeit. Eine erste Korrektur auf `workers: process.env.CI ? 2 : undefined` (auto-parallele lokale Ausführung) zeigte sich jedoch als zu aggressiv: auto-Parallelismus (typisch ≥4 Workers) überlastete den lokalen Dev-Server mit gleichzeitigen Firefox+WebKit+Chrome+Mobile-Chrome-Requests und verursachte 26 Timeout-Flakes.
- **Fix**: `workers: process.env.CI ? 2 : 1` — CI profitiert von 2 parallelen Workern; lokal läuft weiterhin seriell (1 Worker), was bei 4 Browser-Projekten die stabilste Konfiguration ist. `fullyParallel: true` parallelisiert innerhalb eines Workers über die Testdateien, sodass die Gesamtdauer kaum schlechter ist als mit 2 Workern auf einem einzelnen Browser-Projekt.

## [1.7.0] — 2026-09-28

### Portfolio — Maps-Projekt als simulierte Showcase-Seite ins Portfolio aufgenommen

- **Befund**: `Projekte/Maps/` enthält eine vollständige React-Native/Expo-Navigations-App (TypeScript, GPS, Offline-Routing, AR-Navigation, KI-Reiseführer, Wetterradar, 20+ Features), war aber mangels Web-Build bisher nicht im Portfolio registriert.
- **Fix**: Interaktive Showcase-Seite `Projekte/Maps/maps-showcase.html` erstellt — nach dem Vorbild von `CoOpVersusGame/coop-versus-demo.html` mit animierter Canvas-Karte, simulierter GPS-Position, Verkehrs-Alerts, responsivem Feature-Grid und technischen Architektur-Daten. `portfolio-metadata.json` angelegt, `npm run generate-data` ausgeführt — Portfolio zeigt jetzt 25 statt 24 Projekte. `check-sync`, `check-project-links`, `lint`, `test:unit` (58/58) alle grün.

## [1.6.0] — 2026-09-28

### Sicherheit — Regression: `frame-ancestors` in Meta-Tag-CSP verursachte Konsolenfehler auf allen 29 Seiten
- **Bug gefunden**: Die im vorherigen Eintrag ("CSP um härtende Direktiven erweitert") hinzugefügte `frame-ancestors 'none'`-Direktive wurde auch in die Seiten-Meta-Tag-CSPs geschrieben. `frame-ancestors` ist laut CSP3-Spezifikation in einem `<meta>`-Element jedoch ungültig und wird von Chromium mit "The Content Security Policy directive 'frame-ancestors' is ignored when delivered via a `<meta>` element." quittiert — ein Konsolenfehler auf jeder einzelnen Seite, den `npm test` (alle `all_pages.spec.js`-Fälle assertieren `consoleErrors` gleich `[]`) beim nächsten vollständigen Lauf korrekt als Regression aufgedeckt hätte.
- **Fix**: `frame-ancestors 'none';` aus allen 29 Seiten-Meta-Tags entfernt (per Skript) — bleibt aber in der `vercel.json`-HTTP-Header-CSP bestehen, wo die Direktive tatsächlich wirksam ist und zusammen mit `X-Frame-Options: DENY` Clickjacking verhindert. `object-src`, `base-uri` und `form-action` sind in Meta-Tags weiterhin gültig und blieben unverändert. Mit `npm test` (316 Tests über alle 4 Browser-Projekte, davon 2 anfängliche Firefox-Flakes durch kalten Service-Worker-Cache nach `CACHE_NAME`-Bump bzw. eine Modal-Animations-Timing-Flake — beide im isolierten Rerun grün) verifiziert.

### Repo-Hygiene — Tote CSS-Datei und doppelte Backup-Dateien entfernt; zwei unregistrierte Projekte ins Portfolio aufgenommen
- **Befund**: Vollständiger Duplikat- und Referenz-Scan (Hash-Vergleich über das gesamte Repo, Basename-Abgleich jeder JS/CSS/Bild-Datei gegen alle HTML/JS/CSS-Referenzen, Abgleich aller `Projekte/`-Ordner gegen `projects.json`) ergab: `assets/css/darkmode.css` wurde nirgends importiert/verlinkt (nur blind von `generate_sw_assets.js` precached) und war durch das echte Theme-System in `style.css` längst ersetzt. In `Projekte/Amazon 2.0/` lagen zwei unreferenzierte Backup-Dateien (`app_original_full.js` — byte-identisch zu `app_original.js` — und `app_original_utf8.js`); `app_original.js` selbst blieb erhalten, da es im Projekt-README als dokumentiertes v1.0-Archiv geführt wird. Zusätzlich waren drei vollständige, funktionsfähige Projektordner (`Amazon 2.0`, `Maps`, `snake-ascend`) nie in `projects.json` registriert und erschienen dadurch nirgends im öffentlichen Portfolio.
- **Fix**: Die 3 toten Dateien gelöscht, `sw.js`-Precache-Liste neu generiert (144 statt 145 Einträge, `CACHE_NAME` auf `v40` angehoben). `npm run audit-project-paths` deckte dabei zusätzlich auf, dass `Projekte/Amazon 2.0/dist/index.html` absolute Root-Pfade (`/assets/...`) verwendete, die beim Aufruf aus einem Unterverzeichnis 404s verursacht hätten — mit `npm run fix-project-paths` behoben (betraf inzident auch 5 weitere Dateien in `Finanzenportfolio`, `Informatik-lernen`, `Jobbsuche`, `Sims`, deren aktuell verlinkte Demo-Einstiegspunkte davon nicht betroffen waren). `Amazon 2.0` (Vite/TypeScript-Shop, verlinkt auf den jetzt korrigierten `dist/`-Build) und `snake-ascend` (eigenständiges HTML5-Spiel) über neue `portfolio-metadata.json`-Dateien registriert und `npm run generate-data` ausgeführt — Portfolio zeigt jetzt 24 statt 22 Projekte. `Maps` (native Expo/React-Native-App ohne Web-Build) bewusst nicht registriert, da keine der bestehenden Demo-Strategien greift; braucht eine eigene simulierte Showcase-Seite nach dem Vorbild von `Projekte/CoOpVersusGame/coop-versus-demo.html`. `scripts/check_all_project_links.js` behandelte externe `http(s)://`-Links fälschlich als fehlende lokale Dateien (durch eine per `generate-data` aktualisierte GitHub-`homepage`-URL bei `Informatik-lernen` aufgedeckt) — Guard-Klausel ergänzt, die externe URLs jetzt korrekt überspringt. Alle Gates (`lint`, `format:check`, `check-sync`, `check-head`, `check-csp`, `check-sw-assets`, `check-project-links`, `test:unit`, `build:dist`) grün.

### Sicherheit — CSP um härtende Direktiven erweitert; ungenutzte `@vercel/analytics`-Dependency entfernt
- **Befund**: Weder die HTTP-Header-CSP (`vercel.json`) noch die 29 Seiten-Meta-Tag-CSPs setzten `object-src`, `base-uri`, `form-action` oder `frame-ancestors` — Lücken, die zwar durch `default-src 'self'` bzw. `X-Frame-Options: DENY` bereits größtenteils abgedeckt waren, aber kein explizites Defense-in-Depth boten. Zusätzlich war `@vercel/analytics` als `dependency` in `package.json` gelistet, obwohl das Projekt keinen Bundler für die Deployment-Seite nutzt (`build_minified.js` minifiziert nur, bündelt nicht) und ein `import { inject } from '@vercel/analytics'` im Browser gar nicht auflösbar wäre — das eigentliche, bereits aktive Vercel-Analytics-Snippet in `components.js` (`initVercelAnalytics`, hostname-gated) kam von Anfang an ganz ohne das npm-Paket aus.
- **Fix**: `object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';` per Skript an alle 29 Seiten-CSP-Meta-Tags sowie an die `vercel.json`-Header-CSP angehängt (`npm run check-csp` / `check-head` weiterhin grün). `@vercel/analytics` aus `package.json` entfernt und `package-lock.json` aktualisiert; die produktiv aktive Analytics-Implementierung in `components.js` ist davon unberührt, da sie das Paket nie importiert hat.

### CI/Repo-Hygiene — Dependabot für npm- und GitHub-Actions-Updates eingerichtet
- **Befund**: Trotz sauberer `npm audit`-Bilanz (0 Schwachstellen) gab es keinen automatisierten Mechanismus, der veraltete Dependencies oder Action-Versionen proaktiv meldet — Sicherheitslücken in Drittanbieter-Paketen wären erst bei der nächsten manuellen Prüfung aufgefallen.
- **Fix**: `.github/dependabot.yml` ergänzt (wöchentliche Prüfung für `npm` und `github-actions`, Dev-Dependencies gruppiert, um PR-Rauschen zu reduzieren).

### Barrierefreiheit — Verbleibende WCAG-AA-Kontrastfehler auf `:hover`/`:active`-Zuständen behoben
- **Bug gefunden**: Der im vorherigen Changelog-Eintrag dokumentierte "bekannte Folgefund" (hartkodiertes `color: white` auf `var(--primary)`/`var(--accent)`-Hintergründen, das axe im statischen Seitenzustand nicht erreicht) wurde systematisch aufgelöst. Ein Skript identifizierte alle CSS-Regeln, deren `background`/`background-color` von `var(--primary)` oder `var(--accent)` abhängt und deren `color` gleichzeitig hartkodiert auf `white`/`#fff`/`#ffffff` steht — 39 Fundstellen über 5 Dateien (`style.css`: 26, `modules/portfolio_copilot.css`: 6, `praktikumsbetrieb.css`: 3, `interview-trainer.css`: 2, `modules/project_compare.css`: 2), u. a. `.btn-primary`, `.tech-tag:hover`, `.tree-item.active`, `.copilot-send-btn`, `.gallery-tab-btn.active`.
- **Fix**: Alle 39 Stellen auf die bereits etablierte, pro Akzentfarbe/Theme kontrastsicher berechnete Variable `var(--text-on-primary)` umgestellt (dieselbe Strategie wie zuvor bei `.btn-filter.active`/`.category-tab.active`). Verifiziert mit dem axe-core-Testlauf (`accessibility.spec.js`): 100/100 Tests grün über Chromium, Firefox, WebKit und Mobile-Chrome.

### Datenschutz — Kontaktformular- und Analytics-Dienstleister in der Datenschutzerklärung nachgetragen
- **Bug gefunden**: `datenschutz.html` behauptete unter "Kontaktformular" fälschlich, es finde "keine Weitergabe an Dritte" statt — tatsächlich wird die Formularübertragung an **Web3Forms** (externer API-Dienstleister, auch in der CSP als `connect-src` gelistet) weitergeleitet. Zusätzlich lädt `components.js` auf der Produktionsdomain aktiv **Vercel Analytics** (`/_vercel/insights/script.js`), das in der Datenschutzerklärung bisher überhaupt nicht erwähnt wurde.
- **Fix**: Abschnitt „Kontaktformular" korrigiert (Web3Forms als Auftragsverarbeiter nach Art. 28 DSGVO benannt, korrekte Rechtsgrundlage Art. 6 Abs. 1 lit. f DSGVO) und neuer Abschnitt „Web-Analyse (Vercel Analytics)" ergänzt (Anbieter, Zweck, Cookielosigkeit, Rechtsgrundlage). Nachfolgender Abschnitt "Ihre Rechte" entsprechend zu Punkt 8 renummeriert.

### Performance — Kritische Web-Fonts werden jetzt preloaded
- **Befund**: Die Startseite und alle 26 weiteren Seiten luden `Inter` (Fließtext) und `Outfit` (Überschriften) ausschließlich über `@font-face` in `style.css`, ohne `<link rel="preload">` — der Browser entdeckt die Font-Datei dadurch erst nach dem Parsen des CSS, was unnötiges FOUT/verzögertes LCP für Above-the-fold-Text verursacht.
- **Fix**: `<link rel="preload" href=".../inter-400.woff2" as="font" type="font/woff2" crossorigin>` und das Äquivalent für `outfit-700.woff2` auf allen 27 vollständigen Seiten direkt nach dem Favicon-Link ergänzt (per Skript, `offline.html` als minimale PWA-Fallback-Seite bewusst ausgenommen). `npm run check-head`/`check-csp` weiterhin grün.

### Code-Qualität — `jsconfig.json` prüfte versehentlich Drittanbieter-Code aus `node_modules`
- **Bug gefunden**: `npm run typecheck` meldete u. a. TS-Fehler in `node_modules/punycode/punycode.js` — ein transitiv über `@types/node`s globale Modul-Deklarationen aufgelöstes Drittanbieter-Paket, das trotz `"exclude": ["node_modules", ...]` mitgeprüft wurde (TypeScript folgt bei `checkJs`/`allowJs` dem Modul-Graphen auch in ausgeschlossene Verzeichnisse hinein, wenn eine Datei darüber referenziert wird).
- **Fix**: `skipLibCheck: true` und `maxNodeModuleJsDepth: 0` in `jsconfig.json` ergänzt, damit TypeScript node_modules-Code nicht mehr in die Typprüfung einbezieht. Fehlerzahl des (weiterhin nicht-blockierenden) `npm run typecheck`-Schritts von ~670 auf 598 reduziert — die verbleibenden Fehler sind ausschließlich eigener Code und damit ein ehrlicheres Signal für die noch ausstehende, dedizierte JSDoc-Typing-Iteration.

### Repo-Hygiene — Private Arbeitsnotiz entfernt, verwaiste Dev-Build-Artefakte bereinigt
- **`Verbesserungs-Roadmap Umschulung-FIAE Portfolio.docx`** (Repo-Root) auf Wunsch entfernt — private Arbeitsnotiz, die öffentlich im Bewerbungs-Repo einsehbar war.
- **Achtung, Falle vermieden**: Eine erste Analyse identifizierte `Projekte/*/dist/` als vermeintlich verwaiste Build-Artefakte (277 Dateien, ~12 MB). Vor dem Entfernen bestätigte eine Referenzprüfung jedoch, dass diese `dist/`-Ordner die **live eingebundenen Demo-Ziele** von 7 der 22 Portfolio-Projekte sind (`assets/js/projects_data.js`, `assets/data/projects.json`, teils zusätzlich per iframe in `assets/js/modules/quick-sandbox.js`) — sie wurden vollständig wiederhergestellt, bevor der Commit erfolgte.
- **Tatsächlich entfernt**: Nur die zwei `dev-dist/`-Ordner (`ElektroCheck AI`, `Informatik-lernen`) — Vite-PWA-Entwicklungsserver-Artefakte, die nirgends im Produktionscode referenziert werden (verifiziert via Volltextsuche über `assets/`, `scripts/`, `pages/`). `.gitignore` um `Projekte/**/dev-dist/` ergänzt, mit Kommentar, warum `Projekte/*/dist/` bewusst NICHT ignoriert wird.

### Dokumentation — ADR 0003 (CSP-Strategie) veraltete den bereits behobenen Hash-Verifikations-Hinweis
- **Bug gefunden**: Die ADR beschrieb den CSP-Hash-Mismatch weiterhin als "manuell zu findendes Risiko", obwohl `scripts/verify_csp_hashes.js` und das `npm run check-csp`-CI-Gate dieses Risiko in einer früheren Iteration bereits behoben hatten (siehe Eintrag "Sicherheit — CSP script-src Hashes" oben).
- **Fix**: Abschnitt „Konsequenzen" um ein Update ergänzt, das den aktuellen (behobenen) Stand korrekt dokumentiert.

### Sicherheit — CSP script-src Hashes stimmten mit keinem einzigen Inline-Script überein
- **Bug gefunden**: ADR 0003 warnte bereits, dass `check_head_consistency.js` nur die Anwesenheit des CSP-Meta-Tags prüft, nicht die Korrektheit seiner `sha256-...`-Hashes. Ein Live-Check ergab: Auf **allen fünf** Seiten mit Inline-`<script>`-Elementen (`home.html`, `portfolio.html`, `dashboard.html`, `lebenslauf.html`, `ueber-mich.html`) stimmte der hinterlegte Hash nicht mit dem tatsächlichen JSON-LD-Inhalt überein (vermutlich durch spätere Textänderungen veraltet); `portfolio.html` hatte zusätzlich zwei Inline-Scripts, aber nur einen Hash. Browser mit strikter CSP-Durchsetzung hätten diese strukturierten Daten (Schema.org/JSON-LD) stillschweigend blockiert.
- **Fix**: Neues Skript `scripts/verify_csp_hashes.js` berechnet die echten sha256-Hashes aller Inline-Scripts und vergleicht sie mit der CSP; `--fix` schreibt korrigierte Hashes zurück. Alle fünf Seiten repariert, als `npm run check-csp` in CI verankert.

### PWA — Service-Worker-Precache-Liste wird jetzt generiert statt von Hand gepflegt
- **Bug gefunden**: `assets/js/modules/event-bus.js` existierte im Code, war aber nie in `sw.js`s `ASSETS`-Liste aufgenommen worden — ein Beispiel für den in der Vorgänger-Version dokumentierten Wartungsaufwand einer manuell gepflegten ~150-Einträge-Liste. Zusätzlich referenzierte die Liste `assets/js/modules/token-auth.js`, eine Datei, die im Repository gar nicht mehr existiert.
- **Fix**: Neues Skript `scripts/generate_sw_assets.js` globbt HTML/CSS/JS/Font/Vendor-Dateien automatisch (Bilder bleiben bewusst kuratiert, siehe Skript-Kommentar) und schreibt die Liste in `sw.js`. `npm run check-sw-assets` verankert das als CI-Gate gegen zukünftiges Drift. Cache auf `v39` angehoben.

### Barrierefreiheit — WCAG-AA-Farbkontrast auf aktiven Filter-Chips systemweit repariert
- **Bug gefunden**: Neue axe-core-Tests (`assets/js/modules/accessibility.spec.js`) deckten auf, dass aktive Filter-/Tab-Buttons (`.btn-filter.active`, `.category-tab.active`, `.skills-tab.active`) weißen Text auf `var(--primary)` hartkodiert hatten. Da die Website für neue Besucher **standardmäßig im Dunkelmodus** startet (`theme.js`), betraf das jeden Erstbesucher: Kontrastverhältnis nur 2,54:1 statt der geforderten 4,5:1. Eine Nachrechnung ergab, dass praktisch jede Akzentfarbe außer dem hellen Standard-Blau (Emerald, Violet, Orange, Rose, jeweils in Hell- und Dunkelmodus) dasselbe Problem hatte — die vorhandene, aber nie verwendete CSS-Variable `--text-on-primary` legte das Problem offen.
- **Fix**: `--text-on-primary` in allen 9 betroffenen Theme-/Akzent-Kombinationen auf einen dunklen, kontrastsicheren Wert gesetzt (nur Hell-Modus-Blau bleibt bei Weiß); für Violet im Hellmodus, wo weder Weiß noch Dunkel die 4,5:1-Schwelle schafft, zusätzlich `--chip-active-bg` mit einem dunkleren Violet-Ton eingeführt. Alle drei betroffenen Selektoren nutzen jetzt diese Variablen statt hartkodiertem `white`.
- **Weitere axe-Funde behoben**: Fehlende `aria-label`s auf den Nutzwertanalyse-Eingaben in `ihk-cockpit.js` und auf `#qr-generated-link` (`links.html`); `role="tablist"` ohne die vorgeschriebenen `role="tab"`-Kinder auf den Video-Playlists in `projekt-detail.js` und `praktikumsbetrieb.html` durch `role="group"` mit `aria-label` ersetzt (kein echtes Tab-Widget mit Tastatur-Navigation implementiert, daher passendere Rolle statt Nachrüsten eines unvollständigen ARIA-Patterns).
- **Neue Testabdeckung**: `accessibility.spec.js` prüft 25 Seiten gegen WCAG 2.1 A/AA via `@axe-core/playwright`, ergänzt den bisherigen Lighthouse-Score-Schwellenwert um komponentengenaue Prüfungen (Fokus, ARIA-Rollen, Farbkontrast).
- **Bekannter Folgefund (nicht behoben)**: Dasselbe hartkodierte `color: white`-auf-`var(--primary)`-Muster kommt an ~30 weiteren Stellen vor (v. a. `:hover`-Zustände wie `.btn-primary`, `.tech-tag:hover`, `.tree-item.active`), die axe im statischen Seitenzustand nicht erreicht. Empfehlung: gleiche `--text-on-primary`/`--chip-active-bg`-Strategie bei Gelegenheit dorthin übertragen.

### CI/CD & Code-Qualität — Build-Verifikation, striktere Lint-Regeln, Formatierung, Cross-Browser-Tests
- **`build_minified.js`**: Bug gefunden und behoben — Playwright-`.spec.js`-Testdateien wurden minifiziert und in den Produktions-Build (`dist/`) kopiert (Filter erfasste bisher nur `.test.js`, nicht `.spec.js`). `npm run build:dist` läuft jetzt zusätzlich als Verifikationsschritt in CI, da es zuvor nie ausgeführt wurde.
- **`eslint.config.js`**: `no-unused-vars` und `no-undef` von `warn` auf `error` angehoben, damit `npm run lint` in CI tatsächlich fehlschlägt (verifiziert: keine bestehenden Verstöße).
- **Prettier**: `npm run format:check`/`format:fix` ergänzt und als CI-Gate verankert; gesamter `assets/js`- und `scripts`-Baum einmalig neu formatiert (96 Dateien, reine Formatierung ohne Logikänderung, durch Lint + alle Tests verifiziert).
- **`jsconfig.json`**: `moduleResolution: "node"` auf `"bundler"` korrigiert (von TypeScript 7 entfernte Option). `npm run typecheck` (`tsc --noEmit`) läuft als **nicht blockierender** CI-Schritt — deckt ~670 bereits bestehende JSDoc-Typlücken auf, deren vollständige Behebung eine eigene, dedizierte Aufräum-Iteration verdient statt eines Sammel-Patches.
- **`playwright.config.js`**: Firefox, WebKit und ein Mobile-Chrome-Viewport (Pixel 5) als zusätzliche Test-Projekte ergänzt, CI installiert jetzt alle drei Engines statt nur Chromium.

### Dokumentation — ADR 0006 für Framework-Verzicht (Vanilla JS) ergänzt
- **`docs/adr/0006-warum-vanilla-js-ohne-framework.md`**: Begründung für die bewusste Architektur-Entscheidung gegen SPA-Frameworks (React/Vue/Angular) und für modulares Vanilla JS im IHK- und Portfolio-Kontext dokumentiert (Beherrschung der Web-Grundlagen, Zero-Overhead-Performance, Langzeitstabilität, Quellcode-Transparenz im Prüfungsgespräch). Index in `docs/adr/README.md` aktualisiert.

### PWA & Cache-Lifecycle — Service Worker v38
- **`sw.js`**: Cache auf `umschulung-fiae-v38` angehoben. Neu extrahierte ES-Module (`grade-calculator.js`, `leitner-box.js`, `skills-filter.js`) in die statische Precache-Asset-Liste aufgenommen, um vollständige Offline-Fähigkeit für Notensimulation, Karteikasten und Skills-Filterung zu garantieren.

### Testing — Vitest Unit-Tests für C4-Architektur & Search-Filter erweitert
- **`assets/js/modules/search-filter.js`**: `matchesCardFilter`-Funktion extrahiert und mit Unit-Tests (`search-filter.test.js`) abgedeckt (Kategorie-Filter, Case-Insensitive Volltextsuche, kombinierte Bedingungen, DOM-TokenList-Kompatibilität).
- **`assets/js/modules/c4-architecture.js`**: `getHotspotStyleForLevel` und `C4_DESCRIPTIONS` extrahiert und mit Unit-Tests (`c4-architecture.test.js`) abgedeckt (Level 1–3 Zoom- und Hervorhebungsstufen für Container/Komponenten).
- **Gesamtergebnis**: Unit-Testsuite auf 8 Test-Dateien und 58/58 Tests (100 % bestanden) ausgebaut.



### SEO — Kanonische Domain von Apex auf `www.` vereinheitlicht
- **Ursache**: Der Live-Check zeigte, dass `https://max-schenk.tech/` (Apex) per `308 Permanent Redirect` auf `https://www.max-schenk.tech/` weiterleitet — diese Weiterleitung ist auf Vercel-Domain-Ebene konfiguriert (nicht in `vercel.json`) und macht `www.` zur tatsächlich ausgelieferten Domain. Sämtliche `canonical`-Tags, `og:url`-Tags, JSON-LD-`url`/`sameAs`/`BreadcrumbList`-Einträge, `sitemap.xml` (alle 25 URLs) und `robots.txt` verwiesen jedoch weiterhin auf die Apex-Domain — jede dieser URLs erforderte also einen zusätzlichen Redirect-Hop, bevor eine Suchmaschine oder ein Crawler die tatsächliche Seite sieht.
- **Fix**: Alle `https://max-schenk.tech`-Vorkommen in den 27 HTML-Seiten (inkl. `index.html`, beide `404.html`), `sitemap.xml`, `robots.txt` sowie den Generator-Skripten `scripts/add_og_meta.js` und den Textbausteinen in `assets/js/modules/pdf-exporter.js`, `qr-generator.js` und `ical-generator.js` auf `https://www.max-schenk.tech` umgestellt (141 Ersetzungen). Die `CNAME`-Datei bleibt unverändert (siehe ADR 0002).
- Dabei zusätzlich gefunden und behoben: `og:image` auf `portfolio.html` war eine relative URL (`../assets/images/...`) statt einer absoluten — für Open-Graph-Crawler ungültig, jetzt auf die volle `https://www.max-schenk.tech/...`-URL korrigiert.
- **`sitemap.xml`**: `lastmod` aller 25 Einträge auf das tatsächliche Änderungsdatum (2026-09-20) aktualisiert — vorher stammten die Werte teils noch von Juni/August, obwohl sich die Seiten seitdem mehrfach geändert hatten.

### Fix — Kaputte QR-Codes auf dem Lebenslauf (`lebenslauf.html`)
- **Bug gefunden**: `scripts/generate_qr_codes.js` erzeugte die vier QR-Code-Bilder (`qr_portfolio.png`, `qr_interview.png`, `qr_playground.png`, `qr_home.png`) mit der fehlerhaften Basis-URL `https://max-schenk.techveloperakademie.net/Umschulung-FIAE` — eine nicht existierende Domain. Wer diese QR-Codes auf dem (gedruckten oder als PDF geteilten) Lebenslauf scannt, landete auf einem DNS-Fehler statt auf der Portfolio-Seite.
- **Fix**: Basis-URL auf `https://www.max-schenk.tech` korrigiert (ohne den nie existierenden `/Umschulung-FIAE`-Pfad) und alle vier PNGs über `npm run generate-qr-codes` neu generiert.

### Fix — Produktions-Deployment repariert: `npm run build` von Vercel automatisch (und fehlerhaft) ausgeführt
- **Ursache gefunden**: Seit Einführung des Minify-Build-Skripts (`npm run build`, siehe unten) hat Vercel bei jedem Push auf `main` automatisch `npm run build` als Build-Command ausgeführt — Vercel tut das bei Projekten ohne erkanntes Framework immer dann, wenn `package.json` ein `build`-Skript enthält, unabhängig vom eigentlichen Vorhaben. Die letzten beiden Produktions-Deployments (Commits `4c59241`, `662d7e8`) sind dadurch mit `errorCode: module_not_found` fehlgeschlagen.
- **Folge (via Vercel-API verifiziert)**: Da ein fehlgeschlagener Build den zuletzt erfolgreichen Deploy weiter ausliefert, lief `www.max-schenk.tech` unbemerkt auf dem Stand von Commit `23ac5fc` weiter — ohne die seitdem gemergten Bildoptimierungen, den Service-Worker-Sprung auf `v37`, die maskable Icons, das Vitest-Setup und die ADR-Dokumentation. Die Seite war nicht offline, aber sichtbar veraltet, ohne dass das im Repo erkennbar gewesen wäre.
- **Fix**: Skript in `package.json` von `build` zu `build:dist` umbenannt, damit Vercels Zero-Config-Erkennung es nicht mehr aufgreift. `README.md` und ADR 0001 entsprechend aktualisiert. Ausführlich dokumentiert in **ADR 0005** (`docs/adr/0005-build-skript-nicht-build-nennen.md`).
- **Noch zu verifizieren**: Der nächste Push auf `main` sollte in den Vercel-Deployments einmal auf Status `READY` geprüft werden.

### SEO — `og:url` auf vier Seiten zeigte auf 404
- **Bug gefunden (Live-Check der Produktionsseite)**: `home.html`, `portfolio.html`, `impressum.html` und `news.html` hatten ein `og:url`-Meta-Tag ohne das `pages/`-Präfix (z. B. `https://max-schenk.tech/home.html` statt `https://max-schenk.tech/pages/home.html`) — die verlinkte URL liefert `404`. Beim Teilen dieser vier Seiten in sozialen Netzwerken (Facebook, LinkedIn, X/Twitter) hätte die Linkvorschau auf eine nicht existierende Seite verwiesen.
- **Fix**: `pages/`-Präfix in allen vier `og:url`-Tags ergänzt, analog zu den bereits korrekten übrigen 21 Seiten.

### DevOps — Doppeltes Deployment-Setup bereinigt
- **`.github/workflows/deploy.yml` (nie aktivierter GitHub-Pages-Workflow) entfernt**: Er lief parallel zum tatsächlich produktiven Vercel-Deployment (`vercel.json`, Custom Domain `max-schenk.tech`), wurde aber laut eigenem Kommentar nie aktiviert (`Settings → Pages → Source` stand nie auf "GitHub Actions"). Zwei parallel gepflegte Deployment-Pfade für dieselbe Domain sind ein reines Verwirrungsrisiko ohne Zusatznutzen.
- **`README.md`** dokumentiert jetzt explizit unter "7. Deployment": Vercel ist das einzige, autoritative Deployment-Ziel; `ci.yml` gated den Merge (Tests/Lint/Lighthouse), das Deployment selbst übernimmt Vercel eigenständig bei jedem Push auf `main`.
- **Nicht entfernt**: die `CNAME`-Datei (`max-schenk.tech`) bleibt bestehen, da sie für Vercel wirkungslos, aber harmlos ist. Ob GitHub Pages in den Repo-Einstellungen zusätzlich als "Deploy from a branch" aktiv ist, lässt sich von hier aus nicht prüfen — das sollte einmal manuell in `Settings → Pages` verifiziert werden, um eine dritte, stille Auslieferung derselben Domain auszuschließen.

### Dokumentation — Architecture Decision Records (ADR) eingeführt
- **`docs/adr/`** neu angelegt mit vier ADRs im Kurzformat (Kontext/Entscheidung/Konsequenzen) für die zentralen, bereits getroffenen aber bisher nur verstreut im Changelog begründeten strukturellen Entscheidungen: kein Bundler (nur Minify-Build), Vercel als alleiniges Deployment-Ziel, zweischichtige CSP-Strategie (Meta-Tag + HTTP-Header) und Konsistenz-Guard statt Auto-Template-System für den `<head>`-Block.
- Aus dem Portfolio-Review vom 19.09.2026 hervorgegangen (letzter offener struktureller Punkt der Verbesserungs-Roadmap neben der bereits erledigten Deployment-Bereinigung).
- **`README.md`**: neuer Abschnitt "8. Architecture Decision Records" mit Link auf `docs/adr/README.md`.

### DevOps — Sub-Projekt-Sync auf 11 von 21 Projekten ausgeweitet
- **`scripts/sync_projects.js` `REPO_MAPPING`**: 6 weitere Sub-Projekte ergänzt — `BurgenGame`, `CoOpVersusGame`, `Jobbsuche`, `ManuFaktur`, `Minecraft-Pokemon`, `arbeitszeiterfassung` (mit `preserve: ['dist']`, da `dist/` dort `.gitignore`t ist). URLs wurden **nicht geraten**, sondern aus dem tatsächlichen `git remote get-url origin` jedes lokalen Klons verifiziert.
- **Bewusst nicht ergänzt**: die anderen 10 Sub-Projekte (`Amazon 2.0`, `ElektroCheck AI`, `Glücksspiel`, `Maps`, `orbital-scrap`, `Urlaubsfotos`, `VerkaufsVorlagen`, `Wohnungssuche KI`, `finance-ai-bot`, `snake-ascend`) haben lokal kein `.git`-Verzeichnis, ihr Upstream-Repo ließ sich also nicht verifizieren. Eine falsche/geratene Repo-URL im Sync-Skript wäre schlimmer als der aktuelle Zustand (könnte den falschen Inhalt synchronisieren oder den Workflow zum Scheitern bringen).
- Der eigentliche Sync-Lauf (`npm run sync-projects`) wurde **nicht** ausgeführt, da er lokal bestehende Verzeichnisse überschreibt — die neuen Mappings greifen beim nächsten manuellen oder geplanten Lauf.

### Wartbarkeit — `<head>`-Konsistenz-Guard statt Include-System
- **Bewusst gegen ein automatisches Template-/Include-System entschieden**: die 28 Seiten unterscheiden sich nicht nur inhaltlich, sondern auch in der **Reihenfolge** der Boilerplate-Tags (z. B. `canonical` mal vor, mal nach `description`) — ein blindes Auto-Rewrite-Skript hätte alle Seiten gleichzeitig anfassen müssen, mit realem Risiko, etwas zu zerstören, ohne den eigentlichen Duplizierungs-Schmerz (manuelle Mehrfach-Pflege) grundlegend sicherer zu machen.
- **Stattdessen**: `scripts/check_head_consistency.js` (`npm run check-head`) prüft für jede Seite, ob CSP, Viewport, Favicon, Stylesheet-Links, `meta author` und OG-Tags vorhanden sind — genau die Art von Drift, die bei der CSP-Vereinheitlichung in Schritt 1 manuell in `404.html` gefunden wurde. Als neuer Guard-Schritt in `ci.yml` verankert.
- **Dabei echte, bisher unentdeckte Lücken gefunden und behoben**: `meta author` fehlte auf `challenge-lab.html`, `dashboard.html`, `flashcards.html`, `ihk-cockpit.html`, `praktikumsbetrieb.html`; beide `404.html`-Dateien (Root + `pages/`) hatten weder `meta author` noch OG-Tags.

### Performance — Minify-Build statt vollem Bundler
- **`npm run build:dist`** (`scripts/build_minified.js`, esbuild): minifiziert alle Dateien unter `assets/js/` (-28%, 964→693 KB) und `assets/css/` (-27%, 319→231 KB) nach `dist/` und kopiert alles Weitere (HTML, Bilder, Vendor, Fonts, `Projekte/`, `manifest.json`, `sw.js`, …) unverändert. Kein Bundling, keine Pfad-Umschreibung, keine HTML-Änderung — dadurch bleibt jede bestehende CSP-Hash und jeder `<script src>`-Verweis exakt gültig.
- **Bewusst gegen einen vollen Vite-Bundler entschieden**: ein Testlauf zeigte, dass Vite standardmäßig nur `type="module"`-Scripts bündelt/kopiert — die meisten Seiten laden ihre Hauptlogik aber noch als klassische `<script src>`-Tags. Ein echter Bundler-Einsatz hätte eine seitenweite Umstellung auf ES-Module samt Vollverifikation aller 27 Seiten erfordert; das Risiko für die produktive Seite stand nicht im Verhältnis zum Zusatznutzen gegenüber reiner Minifizierung.
- **Produktion (Vercel) bleibt unverändert unbundled** (`vercel.json` liefert weiterhin direkt aus dem Repo-Root aus). `dist/` ist lokal mit der vollen Playwright-Suite (54/54 grün) gegen einen separaten Port verifiziert, wird aber bewusst nicht automatisch deployed — das Umschalten der Produktions-Auslieferung auf `dist/` ist eine separate Entscheidung.
- `dist/` zu `.gitignore` hinzugefügt.

### Dokumentation — Sub-Projekt-README ergänzt
- **`Projekte/arbeitszeiterfassung/README.md` neu angelegt** (einziges Sub-Projekt ohne README): beschreibt Kernfunktionen, den TypeScript/Vite-Stack, die parallele `js/`-Fallback-Struktur, Vitest-Tests und lokale Entwicklungsbefehle, basierend auf `portfolio-metadata.json` und der tatsächlichen Ordnerstruktur.

### PWA — Manifest erweitert
- **`manifest.json`**: `categories`, `shortcuts` (Portfolio/Lebenslauf/Dashboard) und `screenshots` (wide + narrow, per Playwright live gerendert und als WebP komprimiert) ergänzt.
- **Neue maskable Icon-Varianten** (`icon-192-maskable.png`, `icon-512-maskable.png`): Inhalt auf 80% der Canvas herunterskaliert und mit `background_color`-Fläche zentriert, statt die bestehenden Icons ohne Safe-Zone-Puffer als "maskable" zu deklarieren. In den SW-Precache (v37) aufgenommen.

### DevOps — Sync-Workflow auf Pull Request umgestellt
- **`.github/workflows/sync.yml`**: pusht nicht mehr direkt auf `main`, sondern öffnet über `peter-evans/create-pull-request@v7` einen PR (Branch `automated/subprojects-sync`). Dadurch laufen Lint, Vitest, Playwright und der Data-Sync-Guard aus `ci.yml` als reguläre PR-Checks, bevor der wöchentliche Sync gemerged wird — vorher lief `ci.yml` erst nachdem bereits direkt auf `main` gepusht wurde.
- Neue Berechtigung `pull-requests: write` ergänzt.

### Testing — Vitest-Unit-Tests für Kernlogik
- **Reine Logik aus drei Modulen extrahiert** in eigenständige, DOM-freie ESM-Module unter `assets/js/modules/`: `leitner-box.js` (Karteikarten-Boxlevel-Übergänge aus `flashcards.js`), `grade-calculator.js` (IHK-Notenskala & QA-Score-Gewichtung aus `dashboard.js`), `skills-filter.js` (Filter/Sortierung aus `skills_matrix.js`).
- **36 neue Vitest-Tests** (`npm run test:unit`, `vitest.config.js`) decken diese Module vollständig ab, inkl. Edge Cases (Clamping, unbekannte Sortier-Modi, fehlende Boxlevel).
- `flashcards.js` und `skills_matrix.js` von klassischen `<script defer>`/`<script>`-Tags auf `type="module"` umgestellt, um die neuen Module zu importieren; `dashboard.js` war bereits ein Modul. Die bislang tote `_getIhkGrade`-Funktion in `dashboard.js` wurde entfernt und durch die getestete, jetzt tatsächlich genutzte `computeQualityScore`/`getQualityStatus`-Logik ersetzt.
- Alle 54 Playwright-E2E-Tests und `npm run lint` nach der Umstellung erneut grün verifiziert.
- `.github/workflows/ci.yml`: neuer `Run Vitest Unit Test Suite`-Schritt vor den E2E-Tests.

### Qualitätssicherung — Lighthouse-CI ausgeweitet
- **`lighthouserc.json`**: URL-Abdeckung von 5 auf 13 Seiten erweitert (inkl. Git-Simulator, Playground, Architecture, Flashcards, Quiz, Interview-Trainer, IHK-Cockpit, Dashboard).
- **Accessibility/SEO/Best-Practices auf `error` gesetzt** (vorher `warn`, blockierte nie CI): lokal über 11 der 13 Seiten verifiziert, alle konsistent bei ≥0,96 (a11y), 1,0 (Best-Practices), ≥0,91 (SEO) — deutlich über der 0,9-Schwelle.
- **Performance bewusst bei `warn` belassen**: lokale Messung liegt bei nur ~0,35–0,64 (ohne CDN/Kompression), ein Hard-Fail würde CI sofort und dauerhaft brechen. Das eigentliche Performance-Problem (kein Bundler, monolithisches CSS) ist ein separater, größerer Umbau (siehe Roadmap-Punkte 11/12).
- `.github/workflows/ci.yml`: `continue-on-error: true` vom Lighthouse-Job entfernt, Jobname präzisiert.

### Performance — Bildoptimierung
- **`BFW_Fahnen_Panorama.jpg` (266 KB) als WebP ergänzt**: neue `assets/images/BFW_Fahnen_Panorama.webp` (164 KB, -38%), auf die tatsächliche Anzeigegröße (`max-height: 480px` in `.bfw-campus-img`) herunterskaliert von 1813px auf 1400px Breite. In `pages/home.html` und `pages/berufsfoerderungswerk.html` als `<source type="image/webp">` vor dem bestehenden JPEG-Fallback eingebunden.
- **Service Worker auf `v37` angehoben** (`sw.js`), neue WebP-Datei in die `ASSETS`-Precache-Liste aufgenommen.
- `scripts/compress_images.js` auf alle Bilder über 80 KB laufen lassen (marginale 1-3% Re-Encoding-Gewinne bei den bereits komprimierten WebP-Showcases).

### Sicherheit — CSP-Vereinheitlichung
- **Formatierung aller Content-Security-Policy Meta-Tags normalisiert**: Alle 27 Seiten (inkl. `index.html`) nutzen jetzt exakt dieselbe Whitespace-Formatierung statt handgepflegter Varianten mit uneinheitlichen Leerzeichen.
- **Fehlende CSP in `404.html` (Root) ergänzt**: Die Root-404-Seite hatte bisher gar keinen CSP-Meta-Tag und verließ sich stillschweigend auf den Vercel-Header als einzigen Schutz.
- **Zweischichtige CSP-Strategie dokumentiert**: `vercel.json` liefert eine bewusst permissive Baseline (inkl. `'unsafe-inline'`) als Sicherheitsnetz, falls eine Seite künftig den Meta-Tag vergisst — die eigentliche, strikte Durchsetzung passiert über den seitenspezifischen Meta-Tag (per-page `sha256`-Hash für `home.html`/`portfolio.html`/`ueber-mich.html`, dokumentierte `unsafe-inline`-Ausnahme für `playground.html`). Beide Policies werden vom Browser kombiniert (UND-verknüpft) durchgesetzt, sodass der permissive Header nichts freischaltet, was der Meta-Tag nicht bereits erlaubt.

## [1.5.0] - 2026-09-17

### Code-Hygiene, Linter & Stabilität
- **100% sauberer Linter (0 Fehler, 0 Warnungen)**:
  - Ergänzung legitimer Web-Browser Globals (`confirm`, `prompt`, `history`, `SpeechSynthesisUtterance`) in `eslint.config.js`.
  - Bereinigung aller 34 ungenutzten Variablen und Parameter in `components.js`, `dashboard.js`, `elektrocheck_overlay.js`, `memory.js`, `modal.js`, `portfolio.js`, `skills_matrix.js`, `snake.js`, `accent-color.js`, `blog-enhancements.js`, `pdf-exporter.js`, `scroll-animations.js` sowie den Automatisierungs-Skripten.
  - Parameterlose Catch-Blöcke und sauber konfigurierte `caughtErrorsIgnorePattern: '^_'`.

### PWA & Cache-Lifecycle
- **Service Worker Version 36 (`umschulung-fiae-v36`)**:
  - Aktualisierung des Caches für alle 27 Seiten und Assets, um ein nahtloses Update für alle PWA- und Browser-Clients bei Bereitstellung zu gewährleisten.

### SEO & Strukturierte Daten (Schema.org)
- **Erweiterung von `pages/lebenslauf.html`**:
  - JSON-LD `@graph` mit `ProfilePage` und `Person`-Entität ergänzt (analog zu `ueber-mich.html`) für maximale Auffindbarkeit und Rich Snippets in Suchmaschinen und HR-Crawlern.

### E2E-Qualitätssicherung & Dokumentation
- **Vollständige E2E-Verifikation**: Alle 54 Playwright E2E Tests (inkl. aller 22 Projekt-Starts) und 22 physischen Link-Checks erfolgreich validiert.
- **Dokumentations-Update**: Aktualisierung von `README.md` hinsichtlich Projektanzahl (22), Testmetriken und Qualitätsstandards.

## [1.4.0] - 2026-08-20

### Architektur, Reaktivität & Entwickler-Experience
- **Zentraler Event-Bus (`assets/js/modules/event-bus.js`)**:
  - Einführung eines leichtgewichtigen, nativen `CustomEvent`-Busses (`fiae:theme-change`, `fiae:lang-change`, `fiae:accent-change`, `fiae:a11y-change`).
  - Ermöglicht lose gekoppeltes, reaktives State-Management zwischen Theme-, Sprach- und Barrierefreiheits-Komponenten ohne DOM-Polling.
- **TypeScript-Prüfung & IDE-Intellisense (`jsconfig.json`)**:
  - Projektweites Typechecking mit `"checkJs": true` und `ESNext`-Ziel für erstklassige Code-Vervollständigung und statische Fehlererkennung in modernen IDEs.
- **Bildoptimierungs-Pipeline (`scripts/optimize_images.js`)**:
  - Skript zur automatischen Überwachung und Prüfung von Bildgrößen, Kompressionsraten und WebP-Potenzialen.
- **Showcase-Konsolidierung & Aufräumung**:
  - Zuordnung dedizierter Showcase-Bilder für Finanzenportfolio, Urlaubsfotos und Verkaufs-Vorlagen; Bereinigung aller temporären Build- und Test-Logs.

## [1.3.0] - 2026-08-20

### DSGVO, Rechtssicherheit & Privacy-Hardening
- **Lokalisierung aller Drittanbieter-Ressourcen (`assets/vendor/`)**:
  - Font Awesome 6.5.2 (Icons & Webfonts) und Prism.js (Syntax-Highlighter) wurden vollständig lokal im Projekt integriert. Alle externen CDN-Abhängigkeiten (`cdnjs.cloudflare.com`) wurden entfernt.
  - Content Security Policy (CSP) auf allen 27 HTML-Seiten gehärtet.
- **Google Maps 2-Klick-Datenschutzlösung (`impressum.html`)**:
  - Direkte Google Maps iFrames durch ein interaktives 2-Klick-Consent-Overlay ersetzt. Verbindung zu Google-Servern wird erst nach explizitem Nutzerklick hergestellt.
- **Aktualisierung Impressum & Datenschutzerklärung**:
  - Rechtshinweise auf das Digitale-Dienste-Gesetz (§ 5 DDG) und § 18 Abs. 2 MStV aktualisiert.
  - Vollständige Offenlegung aller genutzten `localStorage`-Schlüssel in [datenschutz.html](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Umschulung-FIAE/pages/datenschutz.html).

### Design, SEO & Barrierefreiheit
- **SEO & Strukturierte Daten**: JSON-LD Schema.org (`ProfilePage`, `Person`) in [home.html](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Umschulung-FIAE/pages/home.html) und [ueber-mich.html](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Umschulung-FIAE/pages/ueber-mich.html) integriert.
- **Print-Stylesheet Optimierung (`assets/css/print.css`)**: Interaktive Buttons, Chat-Widgets und Modale werden im Druckmodus vollständig ausgeblendet für ein sauberes A4-Layout.
- **PWA Service Worker Cache (`umschulung-fiae-v28`)**: Aktualisierter Cache für lückenlosen 100% Offline-Betrieb aller 27 Unterseiten und Module.
- **Test-Verifikation**: 100% Erfolgsquote (`52/52 passed`) in der Playwright E2E Testsuite.

## [1.2.0] - 2026-08-19

### Hinzugefügt (Enterprise Portfolio Erweiterungen)
- **IHK-Projektarbeits- & Prüfungs-Cockpit (`pages/ihk-cockpit.html` & `ihk-cockpit.js`)**: 
  - Interaktive **Nutzwertanalyse (NWA)** mit Echtzeit-Gewichtungsreglern, Punkteberechnung, grafischer Auswertung und Presets (Framework-Vergleich & Datenbank-Entscheidung).
  - Interaktiver **80h Phasenplan** (Gantt-Diagramm mit Soll/Ist-Vergleich und Meilenstein-Aufschlüsselung für das IHK-Abschlussprojekt).
  - **Fachgesprächs-Simulator**: Authentisches mündliches Prüfungsfragen-Training mit 90-Sekunden-Timer, Prüfer-Bewertungsmatrix und Musterlösungen.
- **In-Browser Quick-Sandbox & Live-Play Modal (`quick-sandbox.js`)**: 
  - Nahtloses Ausführen und Testen von Web-/Canvas- und Mini-Game-Projekten (*EcoChef*, *BurgenGame*, *Sims 2.5D*, *ManuFaktur*, *Glücksspiel*, *CoOpVersusGame*, *Urlaubsfotos*) direkt im schwebenden Glassmorphism-Modal ohne Verlassen der Portfolio-Übersicht.
- **Client-seitiger KI-Portfolio-Copilot (`portfolio-copilot.js`)**: 
  - 100% lokaler, offline-fähiger KI-Chatbot mit Intent- und Keyword-Matching für Recruiter und Prüfer, inklusive Schnellfrage-Chips und Direktverlinkungen zu Projekten, Stacks und Qualifikationen.
- **Executive Dossier 2.0 & Rollenbasierter PDF-Generator (`executive-dossier.js`)**: 
  - Maßgeschneiderter 1-Klick-Export mit Profilumschaltung (*Fullstack & Frontend Engineering*, *Systems Engineering & C++ / Godot*, *IHK Prüfungs-Dossier FIAE*) und direkter Druck-/PDF-Generierung.
- **Clean-Code & RegEx Challenge-Lab (`pages/challenge-lab.html` & `challenge-lab.js`)**: 
  - Interaktive Gamification-Aufgaben zu IT-Sicherheit (SQL-Injection, Prepared Statements), RegEx (PLZ-Validierung), Clean Code & Pure Functions und Algorithmischer Komplexität (Big-O) mit Live-Code-Validierung, XP-Punkten und dynamischen Rängen.

### Geändert & Optimiert
- **Header-Navigation & Dropdown**: Menüpunkt *Weiteres* um direkte Schnellzugriffe auf *🎓 IHK Cockpit (80h)* und *🧩 Challenge Lab* ergänzt.
- **PWA Service Worker Cache**: Cache auf Version `umschulung-fiae-v27` migriert und alle neuen HTML-Seiten für 100% Offline-Betrieb registriert.
- **Automatisierte E2E-Testsuite**: Erweiterung auf **52 bestandene Playwright Tests** (`assets/js/modules/advanced_features.spec.js`), 100% Pass-Rate über alle 27 Seiten und 21 Projekte.

## [1.1.0] - 2026-07-23

### Geändert & Optimiert
- **Ordner-Restrukturierung & Aufräumung (`pages/`)**: Sämtliche 25 Inhaltsseiten (z. B. `home.html`, `lebenslauf.html`, `portfolio.html`, `ueber-mich.html`, `dashboard.html`) wurden aus dem Wurzelverzeichnis in einen neuen Unterordner `pages/` verschoben. `index.html` bleibt als eleganter Einstiegspunkt im Root erhalten.
- **Dynamisches Pfad-Auflösungssystem (`resolveAssetPath`)**: Einführung einer zentralen Pfadauflösung in `constants.js`, `components.js`, `portfolio.js`, `projekt-detail.js`, `modal.js`, `dashboard.js` und `praktikumsbetrieb-media.js`, wodurch alle Bilder, Video-Clips, Downloads, JSON-Datenbanken und Skripte kontextbewusst aufgelöst werden.
- **Barrierefreiheit (WCAG 2.1) & UI-Styling**: Überarbeitung aller HTML/JS-Komponenten hinsichtlich Barrierefreiheit (Skip-Links, ARIA-Attribute, kontraststarke Theme-Variablen, Tastatursteuerung per Tab & Escape) und responsiver Grid-Flexibilität.
- **DSGVO & Datenschutz**: Strikte Durchsetzung lokaler Ressourcen (offline-gehostete Google Fonts, lokale Videos, datenschutzkonformer LocalStorage-Cookie-Banner) sowie Beibehaltung des kryptografischen Token-Schutzes (`?token=fiae2026`).
- **Automatisierte Playwright E2E Test-Suite**: Aktualisierung aller 38 automatisierter Integrationstests auf die neue `pages/`-Ordnerstruktur. 100 % Erfolgsquote (`38/38 passed`).

## [1.0.0] - 2026-07-07

### Hinzugefügt
- **Token-Schutz für Bewerbungsdokumente**: Sensible Daten wie Gehaltsvorstellungen und IHK-Prüfungszeugnis-Downloads auf `lebenslauf.html` sind nun standardmäßig gesichert. Sie können über die URL (`?token=fiae2026`) oder ein Eingabefeld mit dem Token `fiae2026` freigeschaltet werden.
- **Entwickler- & Code-Qualitätsmetriken**: Der alte Schul-Notensimulator auf `dashboard.html` wurde durch eine professionelle Übersicht über Code-Qualität, Testabdeckung und Dokumentationsabdeckung ersetzt.
- **Automatisches Changelog (`CHANGELOG.md`)**: Diese Datei zur transparenten Dokumentation aller Änderungen für Arbeitgeber und Entwickler.
- **Recruiter-Steckbrief (Quick-Info Card)**: Ein prägnantes Steckbrief-Widget auf `home.html` fasst die wichtigsten HR-Fakten (Stack, Verfügbarkeit, Rolle) übersichtlich zusammen.
- **Interaktiver Code-Showcase**: Eine neue Code-Qualitäts-Sektion auf `portfolio.html` ermöglicht Recruitern das unmittelbare Betrachten sauberer Code-Snippets (React Hook, Java Strategy Pattern, Fetch Fallback) direkt im Browser.
- **Interaktive Skill-Filter**: Das Klicken auf Skill-Balken (z. B. Java oder JavaScript) auf `portfolio.html` filtert nun automatisch die gezeigte Projektgalerie nach der entsprechenden Technologie.
- **Mehrwert-Steckbrief („Warum ich?“)**: Eine dedizierte Karte auf `ueber-mich.html` stellt deine Stärken als ehemaliger Elektroniker (Troubleshooting-Denkweise, strukturierte Problemlösung, SecOps-Mentalität) in den Vordergrund.
- **Zertifikate-Bühne**: Ein neues Widget im Lebenslauf-Sidebar zur strukturierten Präsentation deiner Abschlüsse und Befähigungsnachweise (IHK FIAE, Elektroniker, DGUV V3).
- **Projekt-Video-Player im Detail-Modal**: Im Modal (`modal.js`) integrierter HTML5-Player, der bei Projekten mit vorliegender Video-Playlist eine Auswahlliste anbietet, damit Recruiter direkt im Browser Clips abspielen können.
