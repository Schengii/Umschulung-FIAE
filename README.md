# Entwickler-Dokumentation & Projekt-Leitfaden — Umschulung FIAE

[![CI](https://github.com/Schengii/Umschulung-FIAE/actions/workflows/ci.yml/badge.svg)](https://github.com/Schengii/Umschulung-FIAE/actions/workflows/ci.yml)
[![Live](https://img.shields.io/badge/Live-www.max--schenk.tech-2ea44f)](https://www.max-schenk.tech)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-blue)](#)
[![PWA](https://img.shields.io/badge/PWA-offline--f%C3%A4hig-5a0fc8)](https://www.max-schenk.tech)

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
├── playwright.config.js         # Playwright E2E Testkonfiguration (Specs liegen neben den Modulen)
├── sw.js                        # Service Worker für Offline-Caching & PWA-Fähigkeit (Precache-Liste und Cache-Name generiert)
├── manifest.json                # PWA-Manifest (Metadaten für App-Installationen auf Mobilgeräten)
├── sitemap.xml & robots.txt     # SEO- & Suchmaschinen-Konfigurationen
│
├── pages/                       # Alle Inhaltsseiten
│   ├── home.html                # Werdegang & Kontakt (Profil)
│   ├── portfolio.html           # Projekt-Galerie & Code-Showcase (Filter & Schnellsuche)
│   ├── lebenslauf.html          # Interaktiver Lebenslauf mit Schema.org Person/ProfilePage & 1-Click PDF-Export
│   ├── ueber-mich.html          # Steckbrief, Skill-Radar & Elektroniker-FIAE-Transfermatrix
│   ├── links.html               # Quellen-Sammlung & Recruiter QR-Generator
│   ├── projekt-detail.html      # Dynamische Detailseite für Projekte (?repo=RepoName) mit Code-Explorer & Live-Demo
│   ├── architecture.html       # Interaktives C4-Architekturdiagramm & 3D Dependency Graph
│   ├── challenge-lab.html      # Clean Code & RegEx Interactive Challenge Lab
│   ├── playground.html         # In-Browser Web Sandbox & WASM Code Runner
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
│   │   ├── projects_data.js     # Automatisch generierte JS-Projektdatenbank
│   │   └── modules/             # Abgekapselte Feature-Module & E2E-Tests
│   │       ├── portfolio-copilot.js     # Portfolio-Assistent (Stichwortsuche, offline)
│   │       ├── executive-dossier.js     # 1-Click Executive Summary Modal
│   │       ├── all_pages.spec.js        # Playwright E2E Test-Suite (Seitenstabilität)
│   │       ├── all_projects_launch.spec.js # E2E Launch-Test aller Projekte
│   │       ├── c4-architecture.js       # Interaktives C4-Modell mit Komponenten-Drilldown & Code-Links
│   │       ├── qr-local.js              # Lokaler QR-Renderer (SVG) auf Basis von assets/vendor/qrcode, ohne Drittanbieter
│   │       └── ...                      # Weitere Module
│   │
│   ├── data/                    # JSON-Datenspeicher (projects.json)
│   ├── fonts/                   # Lokale WOFF2 Fonts (Inter & Outfit - 100% DSGVO-konform)
│   ├── vendor/                  # Lokale Drittbibliotheken (Font-Awesome-Subset, Prism, qrcode-generator)
│   └── images/                  # Optimierte WebP-Screenshots, Bilder & Favicons
│
├── Projekte/                    # Unterordner für eigenständige Flaggschiff-Projekte
│   ├── Amazon 2.0/              # E-Commerce Plattform (TypeScript, Vite, PWA, Design System)
│   ├── EcoChef/                 # IHK-Abschlussprojekt (Lit/TypeScript PWA mit Gemini KI)
│   ├── ElektroCheck AI/         # Intelligente Prüfberichtsanalyse (React/Vite & OpenAI API)
│   ├── Finanzenportfolio/       # Vermögensplaner & Analytics Dashboard (React/Recharts)
│   ├── Informatik-lernen/       # Interaktive FIAE-Lernplattform (TypeScript & Vite)
│   ├── ManuFaktur/              # Kunst- & Bildergalerie mit Merkliste (Responsive Vanilla JS)
│   ├── Minecraft/               # 3D Voxel Engine (C++20 & OpenGL 4.5 mit Redstone & Biomen)
│   └── Wohnungssuche KI/        # Automatisierte Wohnungssuche mit KI-Exposé-Bewertung
│
└── scripts/                     # Automatisierungs- & Build-Skripte (Node.js)
    ├── generate_projects_data.js # Scannt Projekte/ und generiert projects.json & projects_data.js
    ├── check_data_sync.js       # Verifiziert 100%ige Synchronisation der Projektdaten
    ├── build_minified.js        # Produktions-Build nach dist/ (das, was Vercel ausliefert)
    └── ...                      # Weitere Prüf- und Generator-Skripte, siehe Abschnitt 6
```

---

## 🛠 Kern-Architektur & Funktionsweise

### 1. Einstiegspunkt & Bootstrapping (`main.js` & HTML-Integration)
Jede HTML-Seite lädt den zentralen Einstiegspunkt als ES-Modul:
```html
<script type="module" src="../assets/js/main.js"></script>
```
Die [main.js](assets/js/main.js) wartet auf das Event `fiae:layout-ready` (Header/Navigation/Footer sind dann eingefügt) und startet die Module in drei Stufen: immer benötigte Module per statischem Import, seitenspezifische nur, wenn ihr Selektor auf der Seite existiert (`LAZY_MODULES`), und reine Komfort-Module (Chat-Widget, Konfetti, Easter Egg) erst, wenn der Browser Leerlauf hat (`IDLE_MODULES`).

### 2. Header, Footer & Barrierefreiheits-Assistent (`components.js`)
- **Strukturierte Navigation**: Das Menü *„Weiteres“* ist in logische Abschnitte unterteilt (*IHK & Abschluss*, *Deep Tech & Sandbox*, *Karriere & Hubs*).
- **Mobile Drawer**: Schließt sich bei Klick auf einen Navigationslink automatisch.
- **Früh eingefügt**: Header und Breadcrumbs werden schon beim Parsen des Platzhalters eingefügt (nicht erst bei `DOMContentLoaded`), damit der Seiteninhalt nach dem ersten Paint nicht mehr springt.
- **Sprache, Theme, Akzentfarbe**: werden im `<head>` vor dem ersten Paint gesetzt. Ein erster Besuch folgt dem Farbschema des Systems.
- **Zweisprachige Attribute**: `aria-label`, `title` und `placeholder` tragen den deutschen Text und zusätzlich `data-en-<attribut>`; `modules/translation.js` schaltet sie mit der Seitensprache um.
- **Barrierefreiheits-Manager (`initAccessibilityControls`)**:
  - 📖 **Legasthenie-Modus (`data-dyslexia="true"`)**: Erhöhter Zeilen- und Wortabstand.
  - 🎨 **Rot-Grün-Schutz (`data-colorblind="deuteranopia"`)**: Farbfehlsichtigkeits-optimierte Palette (Okabe-Ito).
  - 🔍 **Schriftgrößen-Skalierung**: Stufenlose Schriftvergrößerung.
  - 👁️ **Hochkontrast-Modus**: WCAG 2.1 AAA (7:1).

### 3. PWA-Offline-Caching (`sw.js`) & 100% DSGVO-Konformität
- Der Service Worker cacht alle Seiten, CSS-Module, Icons und WOFF2-Fonts: *Network-First* für HTML, *Stale-While-Revalidate* für statische Assets, `pages/offline.html` als Fallback.
- Precache-Liste **und Cache-Name** werden von `npm run generate-sw-assets` erzeugt. Der Name enthält einen Hash über den Inhalt aller Precache-Dateien, ein vergessenes manuelles Hochzählen kann also keine veralteten Dateien mehr ausliefern (ADR 0010). Aktiviert sich eine neue Version, bietet die Seite ein Neuladen an.
- Keine externen Tracking-Dienste oder Cookies – vollständige DSGVO-Konformität.

### 3b. Sensible Bewerbungsdaten (Gehalt & Zeugnisse)
Gehaltsvorstellung und Arbeitszeugnisse werden bewusst **nicht** öffentlich auf der Seite angezeigt. `lebenslauf.html` verweist stattdessen auf eine formlose Anfrage per E-Mail. Eine frühere Version blendete diese Inhalte hinter einem clientseitigen Token ein — das war lediglich eine XOR-Verschleierung ohne echten Zugriffsschutz (der Schlüssel lag im Klartext im ausgelieferten JavaScript) und wurde entfernt, da für öffentlich verlinkte Bewerbungsunterlagen ein "auf Anfrage"-Hinweis der ehrlichere und sicherere Weg ist.

### 3c. Lokale Drittanbieter-Ressourcen & Datenschutz
- **Lokale Drittanbieter-Ressourcen (`assets/vendor/`)**:
  - Icon-Font (Font Awesome 7.3.1) und Syntax-Highlighter (Prism.js) sind **100 % lokal gehostet**.
  - Font Awesome wird als **generiertes Subset** ausgeliefert: `npm run subset-icons` baut CSS und WOFF2 aus dem npm-Paket und behält nur die tatsächlich verwendeten Icons (ca. 21 KB CSS + 22 KB Fonts statt 103 KB + 300 KB). Ein neues Icon erscheint erst nach diesem Befehl; `check-icons` prüft das in der CI (ADR 0009).
  - **QR-Codes** (Recruiter-Link-Generator) werden lokal im Browser erzeugt (`qrcode-generator`, MIT, `assets/vendor/qrcode/`). Es geht kein Link an einen QR-Webdienst; `api.qrserver.com` ist aus den CSPs entfernt.
  - Sämtliche externen CDN-Abhängigkeiten (z. B. `cdnjs.cloudflare.com`) wurden entfernt.
  - Die Content-Security-Policy (CSP) ist strikt gehärtet.
- **Google Maps 2-Klick-Datenschutzlösung**: Karten im Impressum werden standardmäßig blockiert und erst nach aktiver Nutzereinwilligung dynamisch geladen.
- **Digitale-Dienste-Gesetz (DDG)**: Das Impressum und die Datenschutzerklärung sind auf dem aktuellen Stand nach § 5 DDG und Art. 13/14 DSGVO.

### 4. Projekt-Registrierung & Build-Script (`generate_projects_data.js`)
Scannt die Unterordner in `Projekte/` nach `portfolio-metadata.json`, zieht Live-Daten aus der GitHub API und generiert die konsolidierten Datenbanken [projects.json](assets/data/projects.json) sowie `assets/js/projects_data.js`.
- Befehl zum Ausführen: `npm run generate-data`
- Prüfbefehl: `npm run check-sync`

### 5. Qualitätssicherung & Tests
- **E2E-Tests (Playwright, `npm test`)**: Seitenstabilität aller HTML-Seiten, axe-core-Prüfung (WCAG 2.1 AA) im dunklen **und** hellen Theme, Icon-Abdeckung des Font-Awesome-Subsets, Start aller Projekt-Demos sowie die interaktiven Module (Challenge-Lab, Quick-Sandbox, Projektvergleich, Command Palette …). Läuft in Chromium, Firefox, WebKit und Pixel 5; in der CI zusätzlich gegen den minifizierten `dist`-Build.
- **Unit-Tests (Vitest, `npm run test:unit`)**: reine Kernlogik in `assets/js/modules/` — u. a. Skills-Filter, Portfolio-Filter/-Sortierung, Projektdetail (URL-Prüfung), Snake und Memory — sowie die Generator-Skripte unter `scripts/`.
- **Statische Gates**: ESLint, Prettier, Typecheck (`tsc` über JSDoc), dazu die Konsistenz-Checks aus Abschnitt 6.
- **Lighthouse-CI** (`lighthouserc.json`): misst den `dist`-Build; Performance (≥ 0,8), Accessibility, SEO, Best Practices (je ≥ 0,9) und CLS (≤ 0,1) sind harte Schwellen.
- Konkrete Testzahlen stehen bewusst nicht hier, sie veralten sofort — `npm test` und `npm run test:unit` geben den aktuellen Stand aus.

### 6. Wartungsskripte (`scripts/`)
Alle Skripte sind als npm-Scripts registriert und einzeln über `npm run <name>` ausführbar. Die `check-*`-Skripte, `lint`, `format:check`, `typecheck`, `test:unit` und `build:dist` laufen als Gates in der CI (`.github/workflows/ci.yml`), der Rest wird bei Bedarf manuell aufgerufen:

| Befehl | Skript | Zweck |
|---|---|---|
| `npm run generate-data` | `generate_projects_data.js` | Sub-Projekte scannen, `projects.json`/`projects_data.js` generieren |
| `npm run check-sync` | `check_data_sync.js` | Prüft, ob generierte Projektdaten aktuell sind |
| `npm run generate-sw-assets` / `check-sw-assets` | `generate_sw_assets.js` | Schreibt Precache-Liste und inhaltsbasierten Cache-Namen in `sw.js` bzw. prüft, ob beides aktuell ist. **Nach jeder Änderung an HTML/CSS/JS/Fonts ausführen.** |
| `npm run subset-icons` / `check-icons` | `subset_fontawesome.js` | Baut das Font-Awesome-Subset (CSS + WOFF2) aus den tatsächlich verwendeten Icons bzw. prüft, ob es aktuell ist |
| `npm run check-csp` / `check-csp:fix` | `verify_csp_hashes.js` | Prüft bzw. aktualisiert die `sha256`-Hashes der Inline-Scripts in den CSP-`<meta>`-Tags |
| `npm run update-sitemap` / `check-sitemap` | `update_sitemap.js` | Setzt `<lastmod>` je Seite aus dem Git-Datum bzw. prüft, ob Sitemap und indexierbare Seiten übereinstimmen |
| `npm run sync-projects` | `sync_projects.js` | Zieht die 5 gemappten Sub-Projekte von ihren Upstream-Repos |
| `npm run check-project-links` | `check_all_project_links.js` | Verifiziert, dass alle Projekt-Links tatsächlich erreichbar sind |
| `npm run check-head` | `check_head_consistency.js` | Prüft, ob jede Seite die gemeinsamen `<head>`-Boilerplate-Tags (CSP, Viewport, Favicon, Stylesheets, `meta author`, OG-Tags) enthält — verhindert stillen Drift wie die zunächst fehlende CSP in Root-`404.html` |
| `npm run optimize-images` | `optimize_images.js` | Audit-Report über Bildgrößen (read-only, keine Änderungen) |
| `npm run compress-images` | `optimize_images.js --compress` | Verlustbehaftetes Re-Encoding aller Bilder > 80 KB (in-place) |
| `npm run build:dist` | `build_minified.js` | Produktions-Build: minifiziert `assets/js`/`assets/css` per esbuild nach `dist/`, kopiert alles andere unverändert (keine Pfad-/HTML-Änderungen, keine CSP-Auswirkung) und bricht ab, wenn ein verlinktes Projekt-Demo oder Medium im Ergebnis fehlt. Vercel führt genau diesen Befehl aus und liefert `dist/` aus (`vercel.json`, ADR 0008). Der Name bleibt `build:dist`, damit weiterhin nichts von Vercels Zero-Config-Erkennung abhängt (ADR 0005) |
| `npm run audit-project-paths` | `audit_project_html_paths.js` | Findet fehlerhafte relative Pfade in Sub-Projekt-HTML |
| `npm run generate-og-image` | `generate_og_image.js` | Erzeugt das geteilte Social-Preview-Bild `og-cover.png` |
| `npm run check-lighthouse-urls` | `check_lighthouse_urls.js` | Prüft, dass `lighthouserc.json` jede Seite der `sitemap.xml` abdeckt |
| `npm run test:coverage` | `vitest --coverage` | Coverage-Bericht der Unit-Tests für `assets/js/modules/` mit Schwellenwert (Ratsche, ADR 0015); die CI führt die Unit-Tests über diesen Befehl aus |
| `npm run generate-qr-codes` | `generate_qr_codes.js` | Erzeugt QR-Codes für Kernseiten (Lebenslauf/PDF-Export) |

---

## 🚀 Lokale Entwicklung & Start

### Voraussetzungen
- **Node.js**: `Node >= 22.12` lokal (siehe `.nvmrc` / `package.json#engines`, Vitest 5 verlangt Node >= 22.12; CI nutzt Node 24).
- **npm**: Passendes npm (wird mit Node.js ausgeliefert).

### 1. Abhängigkeiten installieren & Git-Hooks aktivieren
```bash
npm install
# Aktiviert die Hooks (.githooks/pre-commit & pre-push) via prepare-Script.
# pre-push führt `npm run check` plus einen kurzen E2E-Smoke aus (überspringen: SKIP_E2E=1 git push):
npm run prepare
# Alternativ manuell:
git config core.hooksPath .githooks

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
Die Test-Suite verifiziert alle HTML-Seiten, den 1-Click Launch aller registrierten Projekte, Portfolio-Assistent, Challenge-Lab, Theme-Umschaltung und Barrierefreiheit. Für schnelle Iteration: `npx playwright test --project=chromium`; gegen den Produktions-Build: `npm run build:dist` und danach `E2E_ROOT=dist npx playwright test --project=chromium`.

### 5. Unit-Tests ausführen (Vitest)
```bash
npm run test:unit
```
Testet die reine Kernlogik (Skills-Matrix-Filter, Portfolio-Logik, Snake, Memory) isoliert ohne Browser — Konfiguration in `vitest.config.js`. `npm run test:coverage` erzeugt zusätzlich einen Coverage-Bericht.

### 6. Linting
```bash
npm run lint
```
Prüft `assets/js`, `scripts/` und `sw.js` mit ESLint (Flat Config in `eslint.config.js`) – 0 Fehler, 0 Warnungen. Formatierung: `npm run format:check` (Prettier), Typen: `npm run typecheck`.

### 7. Deployment
**Vercel ist das einzige, autoritative Deployment-Ziel** (`vercel.json`, Custom Domain `max-schenk.tech`, Auto-Deploy bei Push auf `main`). Vercel baut das Projekt mit `npm run build:dist` und liefert den minifizierten Ordner `dist/` aus (`buildCommand`/`outputDirectory` in `vercel.json`, ADR 0008); `.vercelignore` darf `scripts/` deshalb nicht ausschließen. `.github/workflows/ci.yml` läuft bei jedem Push/PR mit den Qualitäts-Gates, der Playwright-Matrix (inklusive eines Laufs gegen `dist/`) und einem Lighthouse-Audit — diese Checks gaten den Merge, nicht das Deployment selbst (das übernimmt Vercel eigenständig bei jedem Push auf `main`). Damit ein roter Lauf den Merge tatsächlich verhindert, muss in den GitHub-Einstellungen eine Branch-Protection-Regel für `main` mit den CI-Jobs als Pflicht-Checks aktiv sein.

### 8. Architecture Decision Records
Strukturelle Entscheidungen (Bundler-Verzicht, Hosting-Wahl, CSP-Strategie, `<head>`-Konsistenz statt Templating, Auslieferung von `dist/`, Icon-Subset, inhaltsbasierter Cache-Name, Git-Engine) sind als kurze ADRs unter [`docs/adr/`](docs/adr/README.md) festgehalten — jeweils mit Kontext, Entscheidung und bewusst in Kauf genommenen Konsequenzen.

---

## 🌟 Veröffentlichungs-Zusammenfassung (Release 2026)

- **Vielfältige Projekte**: Von Web-PWAs über AI-Bots bis hin zu 3D C++ Voxel Engines und Godot C# RPGs.
- **WCAG 2.1 AA Accessibility** (axe-core in der CI; Hochkontrast-Modus mit 7:1): Integrierter Barrierefreiheits-Assistent für Legasthenie, Rot-Grün-Schwäche, Hochkontrast und Schriftvergrößerung.
- **DSGVO-bewusst**: Keine Cookies, kein Tracking, keine externen Schriftart-Verbindungen; Gehalt/Zeugnisse werden nur auf Anfrage per E-Mail geteilt statt öffentlich angezeigt.
- **Automatisierte Tests**: Playwright-E2E-Suite in vier Browser-Profilen plus Vitest-Unit-Tests für die Kernlogik (`npm test`, `npm run test:unit`).

### ⚙️ Code-Refactoring & neue Module (August 2026)
- **In-Browser Quick-Sandbox & Live-Play (`quick-sandbox.js`)**: Schwebendes Modal zur direkten Ausführung von Web- & Canvas-Projekten (*EcoChef*, *Amazon 2.0*, *ElektroCheck AI*, *ManuFaktur*) ohne Verlassen des Portfolios.
- **Portfolio-Assistent (`portfolio-copilot.js`)**: Chat-Widget ohne Sprachmodell, das Fragen mit Stichwörtern einer festen Wissensbasis abgleicht und vollständig im Browser läuft, für Recruiter & Prüfer mit Intent-Matching und Deep-Links.
- **Executive Dossier 2.0 & Rollenbasierter PDF-Generator (`executive-dossier.js`)**: Maßgeschneiderter 1-Klick-Export für Fullstack-, Backend- oder IHK-Prüfer-Profile.
- **Clean-Code & RegEx Challenge-Lab (`challenge-lab.html` & `challenge-lab.js`)**: Interaktives Coding-Lab zu IT-Sicherheit (SQL-Injection), RegEx, Pure Functions und Big-O mit XP-Gamification.
- **In-Browser Java 21 & C++23 WASM Runner (`playground.html` & `playground.js`)**: Interaktiver Bytecode-Compiler & WebAssembly-Runner mit Syntax-Tabs und Live-Ausführung im Browser.
- **Interaktiver 3D Systemarchitektur-Graph (`architecture.html` & `architecture.js`)**: 3D-Knotengraph mit Orbit-Kamerasteuerung, dynamischer Projektion und Komponenten-Telemetrie.
- **Global Command Palette (`Strg + K` / `Cmd + K`) (`command_palette.js`)**: Fuzzy-Schnellsuche quer über alle Seiten, Projekte und IHK-Lernressourcen mit Tastaturnavigation.
- **Side-by-Side Projekt-Vergleichsmatrix (`project_compare.js`)**: Interaktive Gegenüberstellung von 2 bis 3 Projekten hinsichtlich Architektur-Badges, Tech-Stack, Key Learnings und Live-Demo Links im Bottom-Drawer.



