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
├── playwright.config.js         # Playwright E2E Testkonfiguration (50 automatisierte Tests)
├── sw.js                        # Service Worker für Offline-Caching (umschulung-fiae-v35) & PWA-Fähigkeit
├── manifest.json                # PWA-Manifest (Metadaten für App-Installationen auf Mobilgeräten)
├── sitemap.xml & robots.txt     # SEO- & Suchmaschinen-Konfigurationen
│
├── pages/                       # Aufgeräumter Ordner für alle 27 Inhaltsseiten
│   ├── home.html                # Hauptseite / Landing-Dashboard & Recruiter-Cockpit
│   ├── portfolio.html           # Projekt-Galerie & Code-Showcase (21 registrierte Projekte, Filter & Schnellsuche)
│   ├── ihk-cockpit.html         # IHK-Abschlussprojekt EcoChef (NWA, 80h Phasenplan, Fachgespräch, Bewertungsmatrix)
│   ├── lebenslauf.html          # Interaktiver Lebenslauf mit Token-Schutz (fiae2026) & 1-Click PDF-Export
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
│   │   ├── projects_data.js     # Automatisch generierte JS-Projektdatenbank (21 Projekte)
│   │   └── modules/             # Abgekapselte Feature-Module & E2E-Tests
│   │       ├── portfolio-copilot.js     # Offline-fähiger AI Portfolio Copilot
│   │       ├── ihk-cockpit.js           # Nutzwertanalyse & 80h Phasenplan Steuerung
│   │       ├── executive-dossier.js     # 1-Click Executive Summary Modal
│   │       ├── all_pages.spec.js        # Playwright E2E Test-Suite (Seitenstabilität)
│   │       ├── all_projects_launch.spec.js # E2E Launch-Test aller 21 Projekte
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
- Lokaler Service Worker (`umschulung-fiae-v35`) cacht alle 27 Seiten, CSS-Module, Icons und WOFF2-Fonts.
- Keine externen Tracking-Dienste oder Cookies – vollständige DSGVO-Konformität.

### 3b. Sensible Bewerbungsdaten (Gehalt & Zeugnisse)
Gehaltsvorstellung und Arbeitszeugnisse werden bewusst **nicht** öffentlich auf der Seite angezeigt. `lebenslauf.html` verweist stattdessen auf eine formlose Anfrage per E-Mail. Eine frühere Version blendete diese Inhalte hinter einem clientseitigen Token (`fiae2026`) ein — das war lediglich eine XOR-Verschleierung ohne echten Zugriffsschutz (der Schlüssel lag im Klartext im ausgelieferten JavaScript) und wurde entfernt, da für öffentlich verlinkte Bewerbungsunterlagen ein "auf Anfrage"-Hinweis der ehrlichere und sicherere Weg ist.

### 4. Test-Automatisierung & Qualitätskontrolle
Das Projekt verfügt über eine vollständige **Playwright E2E Testsuite**:
```bash
npm test
```
- **54 / 54 Tests grün (100% Pass Rate)**
- Testet Seitenstabilität aller HTML-Dateien, interaktive Module (IHK-Cockpit, Copilot, Challenge Lab, Quick-Sandbox, Dossier) sowie den Launch aller 21 Projekte.

- **Service Worker (`umschulung-fiae-v35`)**: Implementiert eine *Network-First*-Strategie für HTML-Inhalte und *Stale-While-Revalidate* für statische Assets (CSS, JS, Fonts, Images).
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
- **Test-Suite**: 54 automatisierte Playwright-E2E-Tests (`npm test`), welche alle 27 HTML-Seiten, interaktive Sandbox-Modale, Notenrechner, Quiz-Systeme und die Ausführbarkeit aller 21 Projekte validieren.
- **Projekt- & Datenkonsistenz**: Automatische Verifikation durch `node scripts/check_data_sync.js` und `node scripts/check_all_project_links.js`.
- **Bereinigte Projektstruktur**: Automatische Entfernung temporärer Test-Artefakte, veralteter Bildreste und Konsolidierung aller Projektmetadaten.

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
Die Test-Suite verifiziert alle 27 HTML-Seiten, den 1-Click Launch aller **21 registrierten Projekte**, Git-Simulator, IHK-Cockpit, Copilot, Challenge-Lab, Dark-Mode-Toggles und Barrierefreiheit.

### 5. Linting
```bash
npm run lint
```
Prüft `assets/js` und `scripts/` mit ESLint (Flat Config in `eslint.config.js`).

### 6. Deploy-Pipeline (vorbereitet, nicht aktiv)
`.github/workflows/deploy.yml` baut & deployed die Seite nach GitHub Pages, sobald in den Repository-Settings unter *Pages → Source* „GitHub Actions" ausgewählt wird. `.github/workflows/ci.yml` läuft bei jedem Push/PR und führt Data-Sync-Check, Lint, Playwright-Tests sowie einen informativen Lighthouse-Audit (`lighthouserc.json`) aus. Die Datei `CNAME` ist bereits auf `max-schenk.tech` vorkonfiguriert — der DNS-Eintrag beim Domain-Provider muss noch manuell gesetzt werden.

---

## 🌟 Veröffentlichungs-Zusammenfassung (August 2026 Release)

- **21 Vollwertige Projekte**: Von Web-PWAs über AI-Bots bis hin zu 3D C++ Voxel Engines und Godot C# RPGs.
- **WCAG 2.1 AAA Accessibility**: Integrierter Barrierefreiheits-Assistent für Legasthenie, Rot-Grün-Schwäche, Hochkontrast und Schriftvergrößerung.
- **DSGVO-bewusst**: Keine Cookies, kein Tracking, keine externen Schriftart-Verbindungen; Gehalt/Zeugnisse werden nur auf Anfrage per E-Mail geteilt statt öffentlich angezeigt.
- **54 Bestandene E2E-Tests**: Automatisierte Testabdeckung mit Playwright (`npm test`).

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



