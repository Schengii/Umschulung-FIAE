# Entwickler-Dokumentation & Projekt-Leitfaden — Umschulung FIAE

Herzlich willkommen im zentralen Portfolio-Repository zur Umschulung als **Fachinformatiker für Anwendungsentwicklung (FIAE)** von Maximilian Schenk.

Diese Anleitung beschreibt den strukturellen Aufbau des Projekts, die Software-Architektur, die Daten-Pipelines sowie die barrierefreien Kernfunktionen. Sie dient als Einstiegshilfe für Entwickler und Prüfer, um sich schnell im Projekt zurechtzufinden.

---

## 📂 Projektstruktur & Ordneraufteilung

Das Projekt ist als **moderne, statische Web-App (PWA)** ohne schwerfällige Backend-Frameworks konzipiert. Alle Funktionalitäten basieren auf nativem HTML5, CSS3 Custom Tokens und Vanilla JavaScript (ES6+), das als ES-Module (`type="module"`) geladen wird.

```text
Umschulung-FIAE/
│
├── index.html                   # Haupt-Einstiegsseite im Root (Willkommen, Personalisierung & Barrierefreiheit)
├── package.json                 # Projektspezifische Scripte und Entwicklungs-Abhängigkeiten (Playwright, Build)
├── playwright.config.js         # Playwright E2E Testkonfiguration (54 automatisierte Tests)
├── sw.js                        # Service Worker für Offline-Caching (umschulung-fiae-v36) & PWA-Fähigkeit
├── manifest.json                # PWA-Manifest (Metadaten für App-Installationen auf Mobilgeräten)
├── sitemap.xml & robots.txt     # SEO- & Suchmaschinen-Konfigurationen
│
├── pages/                       # Aufgeräumter Ordner für alle 27 Inhaltsseiten
│   ├── home.html                # Hauptseite / Landing-Dashboard & Recruiter-Cockpit
│   ├── portfolio.html           # Projekt-Galerie & Code-Showcase (24 registrierte Projekte, Filter & Schnellsuche)
│   ├── ihk-cockpit.html         # IHK-Abschlussprojekt EcoChef (NWA, 80h Phasenplan, Fachgespräch, Bewertungsmatrix)
│   ├── lebenslauf.html          # Interaktiver Lebenslauf mit Schema.org Person/ProfilePage & 1-Click PDF-Export
│   ├── ueber-mich.html          # Steckbrief, Skill-Radar & Elektroniker-FIAE-Transfermatrix
│   ├── dashboard.html           # IHK-Notensimulation & Notenrechner (AP1 & AP2)
│   ├── links.html               # Quellen-Sammlung & Recruiter QR-Generator
│   ├── projekt-detail.html      # Dynamische Detailseite für Projekte (?repo=RepoName) mit Code-Explorer & Live-Demo
│   ├── architecture.html       # Interaktives C4-Architekturdiagramm & 3D Dependency Graph
│   ├── challenge-lab.html      # Clean Code & RegEx Interactive Challenge Lab
│   ├── flashcards.html         # IHK-Lernkarten mit Leitner-Box-System
│   ├── interview-trainer.html  # Interaktiver Bewerbungs-Trainer für FIAE
│   ├── playground.html         # In-Browser Web Sandbox & WASM Code Runner
│   ├── git-simulator.html      # Retro Hacker CRT Git-Befehlssimulator (6 Level)
│   └── ...                      # Weitere Seiten (impressum.html, datenschutz.html, news.html, games.html, etc.)
│
├── assets/                      # Globale Web-Ressourcen
│   ├── css/                     # Stylesheets (style.css, modal.css, skeletons.css, print.css)
│   │   └── modules/             # Modulare Stylesheets (portfolio_copilot.css, ihk_cockpit.css, etc.)
│   ├── js/                      # Script-Dateien & ES6-Module
│   │   ├── main.js              # Kern-Initialisierung & robuster Modul-Loader
│   │   ├── components.js        # Header, Footer, kategorisierte Navigation, Accessibility Manager & Templating
│   │   ├── constants.js         # Globale App-Konstanten & Pfadauflösung (resolveAssetPath)
│   │   ├── portfolio.js         # Steuerungslogik für das Portfolio-Rendering, Schnellsuche & Highlights
│   │   ├── projects_data.js     # Automatisch generierte JS-Projektdatenbank (24 Projekte)
│   │   └── modules/             # Abgekapselte Feature-Module & E2E-Tests
│   │       ├── portfolio-copilot.js     # Offline-fähiger AI Portfolio Copilot
│   │       ├── ihk-cockpit.js           # Nutzwertanalyse & 80h Phasenplan Steuerung
│   │       ├── executive-dossier.js     # 1-Click Executive Summary Modal
│   │       ├── all_pages.spec.js        # Playwright E2E Test-Suite (Seitenstabilität)
│   │       ├── all_projects_launch.spec.js # E2E Launch-Test aller 24 Projekte
│   │       └── ...                      # Weitere Module
│   │
│   ├── data/                    # JSON-Datenspeicher (projects.json)
│   ├── fonts/                   # Lokale WOFF2 Fonts (Inter & Outfit - 100% DSGVO-konform)
│   └── images/                  # Optimierte WebP-Screenshots, Bilder & Favicons
│
├── Projekte/                    # Unterordner für eigenständige IHK- & Praxis-Übungsprojekte
│   ├── EcoChef/                 # IHK-Abschlussprojekt (Lit/TypeScript PWA mit Gemini KI)
│   ├── ElektroCheck AI/         # Intelligente Prüfberichtsanalyse (React/Vite & OpenAI API)
│   ├── Minecraft/               # 3D Voxel Engine (C++20 & OpenGL 4.5 mit Redstone & Biomen)
│   ├── Minecraft-Pokemon/       # Voxel Crossover RPG (Godot 4.x & C# .NET)
│   ├── Sims/                    # Next-Gen Sims 5 Web Experience (React 2.5D & Audio Synth)
│   ├── BurgenGame/              # Interaktives 2D-Aufbaustrategiespiel (Canvas & JS)
│   ├── CoOpVersusGame/          # Multiplayer Co-Op/Versus Game Prototype (Godot 4.6)
│   ├── finance-ai-bot/          # Finanzplaner & Conversational Chatbot (NLP)
│   ├── Finanzenportfolio/       # Vermögensplaner & Dashboard (React/Recharts)
│   ├── Glücksspiel/             # Casual Mini Games Suite (Slots, Roulette, Plinko)
│   ├── Jobbsuche/               # PWA Stellenportal für Entwickler
│   ├── ManuFaktur/              # Kunst- & Bildergalerie mit Merkliste
│   ├── orbital-scrap/           # Sci-Fi Clicker- & Idle-Game (Godot 4.6)
│   ├── Urlaubsfotos/            # Fotogalerie & Filter-Organizer (React/Vite)
│   ├── VerkaufsVorlagen/        # Rechnungs- & Beleg-Generator (React/PDF)
│   ├── Wohnungssuche KI/        # Automatisiere Wohnungssuche mit Web-Scraper & KI
│   ├── arbeitszeiterfassung/    # PWA Zeiterfassung mit Firebase Cloud-Sync
│   └── java-playground.html     # Java OOP & Spring Boot Übungsprojekte Showcase
│
└── scripts/                     # Automatisierungs- & Build-Skripte (Node.js)
    ├── generate_projects_data.js # Scannt Projekte/ und generiert projects.json & projects_data.js
    └── check_data_sync.js       # Verifiziert 100%ige Synchronisation der Projektdaten
```

---

## 🛠 Kern-Architektur & Funktionsweise

### 1. Einstiegspunkt & Bootstrapping (`main.js` & HTML-Integration)
Jede HTML-Seite lädt den zentralen Einstiegspunkt als ES-Modul:
```html
<script type="module" src="../assets/js/main.js"></script>
```
Die [main.js](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Umschulung-FIAE/assets/js/main.js) wartet auf die DOM-Bereitschaft (`document.readyState !== 'loading'`) und führt sequentiell alle Modul-Initialisierungen aus.

### 2. Header, Footer & Barrierefreiheits-Assistent (`components.js`)
- **Strukturierte Navigation**: Das Menü *„Weiteres“* ist in logische Abschnitte unterteilt (*IHK & Abschluss*, *Deep Tech & Sandbox*, *Karriere & Hubs*).
- **Mobile Drawer**: Schließt sich bei Klick auf einen Navigationslink automatisch.
- **Barrierefreiheits-Manager (`initAccessibilityControls`)**:
  - 📖 **Legasthenie-Modus (`data-dyslexia="true"`)**: Erhöhter Zeilen- und Wortabstand.
  - 🎨 **Rot-Grün-Schutz (`data-colorblind="deuteranopia"`)**: Farbfehlsichtigkeits-optimierte Palette (Okabe-Ito).
  - 🔍 **Schriftgrößen-Skalierung**: Stufenlose Schriftvergrößerung.
  - 👁️ **Hochkontrast-Modus**: WCAG 2.1 AAA (7:1).

### 3. PWA-Offline-Caching (`sw.js`) & 100% DSGVO-Konformität
- Lokaler Service Worker (`umschulung-fiae-v36`) cacht alle 27 Seiten, CSS-Module, Icons und WOFF2-Fonts.
- Keine externen Tracking-Dienste oder Cookies – vollständige DSGVO-Konformität.

### 3b. Sensible Bewerbungsdaten (Gehalt & Zeugnisse)
Gehaltsvorstellung und Arbeitszeugnisse werden bewusst **nicht** öffentlich auf der Seite angezeigt. `lebenslauf.html` verweist stattdessen auf eine formlose Anfrage per E-Mail. Eine frühere Version blendete diese Inhalte hinter einem clientseitigen Token (`fiae2026`) ein — das war lediglich eine XOR-Verschleierung ohne echten Zugriffsschutz (der Schlüssel lag im Klartext im ausgelieferten JavaScript) und wurde entfernt, da für öffentlich verlinkte Bewerbungsunterlagen ein "auf Anfrage"-Hinweis der ehrlichere und sicherere Weg ist.

### 4. Test-Automatisierung & Qualitätskontrolle
Das Projekt verfügt über eine vollständige **Playwright E2E Testsuite**:
```bash
npm test
```
- **54 / 54 Tests grün (100% Pass Rate)**
- Testet Seitenstabilität aller HTML-Dateien, interaktive Module (IHK-Cockpit, Copilot, Challenge Lab, Quick-Sandbox, Dossier) sowie den Launch aller 24 Projekte.

- **Service Worker (`umschulung-fiae-v36`)**: Implementiert eine *Network-First*-Strategie für HTML-Inhalte und *Stale-While-Revalidate* für statische Assets (CSS, JS, Fonts, Images).
- **Lokale Drittanbieter-Ressourcen (`assets/vendor/`)**:
  - Alle Icon-Fonts (Font Awesome 6.5.2) und Syntax-Highlighter (Prism.js) sind **100 % lokal gehostet**.
  - Sämtliche externen CDN-Abhängigkeiten (z. B. `cdnjs.cloudflare.com`) wurden entfernt.
  - Die Content-Security-Policy (CSP) ist strikt gehärtet.
- **Google Maps 2-Klick-Datenschutzlösung**: Karten im Impressum werden standardmäßig blockiert und erst nach aktiver Nutzereinwilligung dynamisch geladen.
- **Digitale-Dienste-Gesetz (DDG)**: Das Impressum und die Datenschutzerklärung sind auf dem aktuellen Stand nach § 5 DDG und Art. 13/14 DSGVO.

### 4. Projekt-Registrierung & Build-Script (`generate_projects_data.js`)
Scannt die Unterordner in `Projekte/` nach `portfolio-metadata.json`, zieht Live-Daten aus der GitHub API und generiert die konsolidierten Datenbanken [projects.json](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Umschulung-FIAE/assets/data/projects.json) sowie `assets/js/projects_data.js`.
- Befehl zum Ausführen: `npm run generate-data`
- Prüfbefehl: `npm run check-sync`

### 5. Qualitätssicherung, Bereinigung & E2E-Testing
- **Test-Suite**: 54 automatisierte Playwright-E2E-Tests (`npm test`), welche alle 27 HTML-Seiten, interaktive Sandbox-Modale, Notenrechner, Quiz-Systeme und die Ausführbarkeit aller 24 Projekte validieren.
- **Unit-Tests**: 36 Vitest-Tests (`npm run test:unit`) für die reine Kernlogik in `assets/js/modules/` — Leitner-Box-Algorithmus (`leitner-box.js`), IHK-Notenrechner & QA-Score-Gewichtung (`grade-calculator.js`), Skills-Matrix-Filter/-Sortierung (`skills-filter.js`).
- **Projekt- & Datenkonsistenz**: Automatische Verifikation durch `node scripts/check_data_sync.js` und `node scripts/check_all_project_links.js` (22/22 Links fehlerfrei).
- **Bereinigte Codebasis & Linter**: 0 Fehler und 0 Warnungen in ESLint (`npm run lint`), 0 Sicherheitslücken in Abhängigkeiten (`npm audit`).

### 6. Wartungsskripte (`scripts/`)
Alle Skripte sind als npm-Scripts registriert und einzeln über `npm run <name>` ausführbar. Keines läuft automatisiert in CI — bei Bedarf manuell aufrufen:

| Befehl | Skript | Zweck |
|---|---|---|
| `npm run generate-data` | `generate_projects_data.js` | Sub-Projekte scannen, `projects.json`/`projects_data.js` generieren |
| `npm run check-sync` | `check_data_sync.js` | Prüft, ob generierte Projektdaten aktuell sind |
| `npm run sync-projects` | `sync_projects.js` | Zieht die 5 gemappten Sub-Projekte von ihren Upstream-Repos |
| `npm run check-project-links` | `check_all_project_links.js` | Verifiziert, dass alle Projekt-Links tatsächlich erreichbar sind |
| `npm run check-head` | `check_head_consistency.js` | Prüft, ob jede Seite die gemeinsamen `<head>`-Boilerplate-Tags (CSP, Viewport, Favicon, Stylesheets, `meta author`, OG-Tags) enthält — verhindert stillen Drift wie die zunächst fehlende CSP in Root-`404.html` |
| `npm run optimize-images` | `optimize_images.js` | Audit-Report über Bildgrößen (read-only, keine Änderungen) |
| `npm run compress-images` | `compress_images.js` | Verlustbehaftetes Re-Encoding aller Bilder > 80 KB (in-place) |
| `npm run build:dist` | `build_minified.js` | Minifiziert `assets/js`/`assets/css` per esbuild nach `dist/`, kopiert alles andere unverändert (keine Pfad-/HTML-Änderungen, keine CSP-Auswirkung). **Bewusst nicht `build` genannt**: Vercel führt bei einem Zero-Config-Projekt automatisch `npm run build` aus, falls dieses Skript existiert — das hätte die Produktion versehentlich auf den Minify-Build umgestellt (siehe ADR 0001) |
| `npm run audit-cleanup` | `audit_cleanup.js` | Verzeichnisgrößen-/Dateianzahl-Report je Ordner |
| `npm run audit-project-paths` | `audit_project_html_paths.js` | Findet fehlerhafte relative Pfade in Sub-Projekt-HTML |
| `npm run fix-project-paths` | `fix_project_html_paths.js` | Korrigiert die von `audit-project-paths` gefundenen Pfade |
| `npm run localize-vendor-assets` | `localize_vendor_assets.js` | Prüft, ob noch externe CDN-Referenzen statt lokaler `assets/vendor/`-Kopien genutzt werden |
| `npm run add-og-meta` | `add_og_meta.js` | Ergänzt fehlende OpenGraph/Twitter-Meta-Tags (idempotent) |
| `npm run generate-og-image` | `generate_og_image.js` | Erzeugt das geteilte Social-Preview-Bild `og-cover.png` |
| `npm run generate-qr-codes` | `generate_qr_codes.js` | Erzeugt QR-Codes für Kernseiten (Lebenslauf/PDF-Export) |

---

## 🚀 Lokale Entwicklung & Start

### 1. Abhängigkeiten installieren
```bash
npm install
npx playwright install chromium
```

### 2. Projektdaten generieren & prüfen
```bash
npm run generate-data
npm run check-sync
```

### 3. Lokalen Entwicklungsserver starten
```bash
npm run dev
```
Öffne anschließend **[http://127.0.0.1:8080](http://127.0.0.1:8080)** im Browser.

### 4. Automatisierte E2E-Tests ausführen (Playwright)
```bash
npm test
```
Die Test-Suite verifiziert alle 27 HTML-Seiten, den 1-Click Launch aller **24 registrierten Projekte**, Git-Simulator, IHK-Cockpit, Copilot, Challenge-Lab, Dark-Mode-Toggles und Barrierefreiheit.

### 5. Unit-Tests ausführen (Vitest)
```bash
npm run test:unit
```
Testet die reine Kernlogik (Leitner-Box, Notenrechner/QA-Score, Skills-Matrix-Filter) isoliert ohne Browser — Konfiguration in `vitest.config.js`.

### 6. Linting
```bash
npm run lint
```
Prüft `assets/js` und `scripts/` mit ESLint (Flat Config in `eslint.config.js`) – 0 Fehler, 0 Warnungen.

### 7. Deployment
**Vercel ist das einzige, autoritative Deployment-Ziel** (`vercel.json`, Custom Domain `max-schenk.tech`, Auto-Deploy bei Push auf `main`). Der zuvor parallel vorhandene, nie aktivierte GitHub-Pages-Workflow (`.github/workflows/deploy.yml`) wurde entfernt, um Verwirrung über das tatsächliche Deployment-Ziel zu vermeiden. `.github/workflows/ci.yml` läuft bei jedem Push/PR und führt Data-Sync-Check, `<head>`-Konsistenz-Check, Lint, Vitest, Playwright-Tests sowie einen Lighthouse-Audit (`lighthouserc.json`) aus — diese Checks gaten den Merge, nicht das Deployment selbst (das übernimmt Vercel eigenständig bei jedem Push auf `main`).

### 8. Architecture Decision Records
Strukturelle Entscheidungen (Bundler-Verzicht, Hosting-Wahl, CSP-Strategie, `<head>`-Konsistenz statt Templating) sind als kurze ADRs unter [`docs/adr/`](docs/adr/README.md) festgehalten — jeweils mit Kontext, Entscheidung und bewusst in Kauf genommenen Konsequenzen.

---

## 🌟 Veröffentlichungs-Zusammenfassung (Release 2026)

- **22 Vollwertige Projekte**: Von Web-PWAs über AI-Bots bis hin zu 3D C++ Voxel Engines und Godot C# RPGs.
- **WCAG 2.1 AAA Accessibility**: Integrierter Barrierefreiheits-Assistent für Legasthenie, Rot-Grün-Schwäche, Hochkontrast und Schriftvergrößerung.
- **DSGVO-bewusst**: Keine Cookies, kein Tracking, keine externen Schriftart-Verbindungen; Gehalt/Zeugnisse werden nur auf Anfrage per E-Mail geteilt statt öffentlich angezeigt.
- **54 Bestandene E2E-Tests**: Automatisierte Testabdeckung mit Playwright (`npm test`) bei 100% Erfolgsquote.

### ⚙️ Code-Refactoring & neue Module (August 2026)
- **IHK Projektarbeits- & Prüfungs-Cockpit (`ihk-cockpit.html` & `ihk-cockpit.js`)**: Interaktive Nutzwertanalyse (NWA) mit Presets, 80h-Phasenplan (Gantt) und Timer-gestützter Fachgesprächs-Simulator.
- **In-Browser Quick-Sandbox & Live-Play (`quick-sandbox.js`)**: Schwebendes Modal zur direkten Ausführung von Web- & Canvas-Projekten (*BurgenGame*, *EcoChef*, *Sims 2.5D*, *ManuFaktur*) ohne Verlassen des Portfolios.
- **Lokaler Client-seitiger KI-Portfolio-Copilot (`portfolio-copilot.js`)**: 100% offline-fähiges Chat-Widget für Recruiter & Prüfer mit Intent-Matching und Deep-Links.
- **Executive Dossier 2.0 & Rollenbasierter PDF-Generator (`executive-dossier.js`)**: Maßgeschneiderter 1-Klick-Export für Fullstack-, Backend- oder IHK-Prüfer-Profile.
- **Clean-Code & RegEx Challenge-Lab (`challenge-lab.html` & `challenge-lab.js`)**: Interaktives Coding-Lab zu IT-Sicherheit (SQL-Injection), RegEx, Pure Functions und Big-O mit XP-Gamification.
- **In-Browser Java 21 & C++23 WASM Runner (`playground.html` & `playground.js`)**: Interaktiver Bytecode-Compiler & WebAssembly-Runner mit Syntax-Tabs und Live-Ausführung im Browser.
- **Interaktiver 3D Systemarchitektur-Graph (`architecture.html` & `architecture.js`)**: 3D-Knotengraph mit Orbit-Kamerasteuerung, dynamischer Projektion und Komponenten-Telemetrie.
- **Voice-Assisted AI Interview Simulator (`interview.js` & `interview-trainer.html`)**: Sprachausgabe (SpeechSynthesis) und Spracheingabe per Mikrofon (SpeechRecognition) für realistische IHK-Fachgespräche.
- **PWA Offline-Sync & Cache Telemetrie (`dashboard.html` & `dashboard.js`)**: Live-Inspector für Service-Worker Cache Storage, Netzwerkzustand und IndexedDB-Synchronisation.
- **Global Command Palette (`Strg + K` / `Cmd + K`) (`command_palette.js`)**: Fuzzy-Schnellsuche quer über alle Seiten, Projekte und IHK-Lernressourcen mit Tastaturnavigation.
- **Side-by-Side Projekt-Vergleichsmatrix (`project_compare.js`)**: Interaktive Gegenüberstellung von 2 bis 3 Projekten hinsichtlich Architektur-Badges, Tech-Stack, Key Learnings und Live-Demo Links im Bottom-Drawer.



