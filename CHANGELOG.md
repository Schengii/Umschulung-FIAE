# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei festgehalten.

## [Unreleased]

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
