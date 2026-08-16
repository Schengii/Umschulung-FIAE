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
├── playwright.config.js         # Playwright E2E Testkonfiguration
├── sw.js                        # Service Worker für Offline-Caching (umschulung-fiae-v25) & PWA-Fähigkeit
├── manifest.json                # PWA-Manifest (Metadaten für App-Installationen auf Mobilgeräten)
├── sitemap.xml & robots.txt     # SEO- & Suchmaschinen-Konfigurationen
│
├── pages/                       # Aufgeräumter Ordner für alle 23 Inhaltsseiten
│   ├── home.html                # Hauptseite / Landing-Dashboard & Recruiter-Cockpit
│   ├── portfolio.html           # Projekt-Galerie & Code-Showcase (21 registrierte Projekte)
│   ├── lebenslauf.html          # Interaktiver Lebenslauf mit Token-geschützten Zeugnissen (Base64/XOR)
│   ├── ueber-mich.html          # Steckbrief & Elektroniker-FIAE-Transfermatrix
│   ├── dashboard.html           # IHK-Notensimulation & Notenrechner (AP1 & AP2)
│   ├── links.html               # Quellen-Sammlung & Recruiter QR-Generator
│   ├── projekt-detail.html      # Dynamische Detailseite für Projekte (?repo=RepoName)
│   ├── architecture.html       # Interaktives C4-Architekturdiagramm
│   ├── flashcards.html         # IHK-Lernkarten mit Leitner-Box-System
│   ├── interview-trainer.html  # Interaktiver Bewerbungs-Trainer für FIAE
│   ├── playground.html         # In-Browser SQL & Code Playground
│   ├── git-simulator.html      # Retro Hacker CRT Git-Befehlssimulator
│   └── ...                      # Weitere Seiten (impressum.html, datenschutz.html, news.html, games.html, etc.)
│
├── assets/                      # Globale Web-Ressourcen
│   ├── css/                     # Stylesheets (style.css, modal.css, skeletons.css, print.css)
│   ├── js/                      # Script-Dateien & ES6-Module
│   │   ├── main.js              # Kern-Initialisierung & dynamischer Modul-Loader
│   │   ├── components.js        # Header, Footer, Accessibility Manager & Templating
│   │   ├── constants.js         # Globale App-Konstanten & Pfadauflösung (resolveAssetPath)
│   │   ├── portfolio.js         # Steuerungslogik für das Portfolio-Rendering & Matchmaker
│   │   ├── projects_data.js     # Automatisch generierte JS-Projektdatenbank (21 Projekte)
│   │   └── modules/             # Abgekapselte JavaScript-Feature-Module & E2E-Tests
│   │       ├── all_pages.spec.js        # Playwright E2E Test-Suite
│   │       ├── all_projects_launch.spec.js # E2E Launch-Test aller 21 Projekte
│   │       └── ...              # Weitere Module (achievements.js, qr-generator.js)
│   │
│   ├── data/                    # JSON-Datenspeicher (projects.json)
│   ├── fonts/                   # Lokale WOFF2 Fonts (Inter & Outfit - 100% DSGVO-konform)
│   └── images/                  # Bilder, Screenshots & Favicons
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
│   ├── arbeitszeiterfassung/    # Enterprise PWA Zeiterfassung mit Firebase Cloud-Sync
│   └── java-playground.html     # Java OOP & Spring Boot Übungsprojekte Showcase
│
└── scripts/                     # Automatisierungs- & Build-Skripte (Node.js)
    ├── generate_projects_data.js # Scannt Projekte/ und generiert projects.json & projects_data.js
    └── check_data_sync.js       # Verifiziert 100%ige Synchronisation der Projektdaten
```

---

## 🛠 Kern-Architektur & Funktionsweise (Modul- & Funktions-Mapping)

### 1. Einstiegspunkt & Bootstrapping (`main.js` & HTML-Integration)
Jede HTML-Seite lädt den zentralen Einstiegspunkt als ES-Modul:
```html
<script type="module" src="assets/js/main.js"></script>
```
Die [main.js](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Umschulung-FIAE/assets/js/main.js) importiert alle Feature-Module und führt sequentiell deren Initialisierungsfunktionen (z. B. `initTheme()`, `initNavigation()`, `initAccessibility()`) beim Laden aus. Dies verhindert Namenskonflikte und sorgt für saubere Kapselung.

### 2. Header, Footer & Barrierefreiheits-Assistent (`components.js`)
- **Header & Footer**: Werden dynamisch in die DOM-Elemente `#site-header` und `#site-footer` geladen, um HTML-Redundanzen zu vermeiden (DRY-Prinzip).
- **Barrierefreiheits-Manager (`initAccessibilityControls`)**:
  - 📖 **Legasthenie-Modus (`data-dyslexia="true"`)**: Aktiviert legasthenie-freundliche Typografie mit erhöhtem Zeilenabstand (`line-height: 1.8`) und Wortabstand.
  - 🎨 **Rot-Grün-Schutz (`data-colorblind="deuteranopia"`)**: Schaltet auf eine farbfehlsichtigkeits-optimierte Palette (Okabe-Ito Palette) um.
  - 🔍 **Schriftgrößen-Skalierung (`data-font-scale="large|xlarge"`)**: Stufenlose Schriftvergrößerung für Sehbeeinträchtigte.
  - 👁️ **Hochkontrast-Modus (`data-contrast="high"`)**: Erfüllt das WCAG 2.1 AAA Kontrastverhältnis (7:1).
  - Persistiert alle Benutzereinstellungen im `localStorage`.

### 3. PWA-Offline-Caching (`sw.js`)
Der Service Worker in [sw.js](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Umschulung-FIAE/sw.js) cached alle statischen Dateien (HTML, CSS, JS, Bilder) für die Offline-Nutzung.
- **Cache-Version**: `umschulung-fiae-v25` signalisiert allen Browsern automatisches Aktualisieren statischer Assets.

### 4. Projekt-Registrierung & Build-Script (`generate_projects_data.js`)
Scannt die Unterordner in `Projekte/` nach `portfolio-metadata.json`, zieht Live-Daten aus der GitHub API und generiert die konsolidierten Datenbanken [projects.json](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Umschulung-FIAE/assets/data/projects.json) sowie `assets/js/projects_data.js`.
- Befehl zum Ausführen: `npm run generate-data`
- Prüfbefehl: `npm run check-sync`

### 5. Kryptografischer Token-Schutz & DSGVO (`token-auth.js`)
Schützt vertrauliche Dokumente auf `lebenslauf.html`. Der Zugriff wird über die Eingabe des Passwort-Tokens **fiae2026** freigeschaltet.
- **Client-Kryptografie**: Gehaltswunsch und Zeugnislinks sind im HTML-Code als Base64-verschlüsselter XOR-Payload hinterlegt und werden erst nach Token-Eingabe im DOM entschlüsselt.
- **DSGVO & CSP**: Strenge Content-Security-Policy (CSP) im Header aller HTML-Dateien. Lokale WOFF2 Fonts ohne Google-Server-Verbindungen.

---

## 🚀 Entwicklung & Lokales Testen

### 1. Abhängigkeiten installieren
Installiere die benötigten E2E-Test-Abhängigkeiten (Playwright) lokal im Projektverzeichnis:
```bash
npm install
npx playwright install chromium
```

### 2. Projektdaten generieren & verifizieren
```bash
npm run generate-data
npm run check-sync
```

### 3. Lokalen Entwicklungsserver starten
```bash
npx http-server . -p 8080 -c-1
```
Öffne anschließend **[http://127.0.0.1:8080](http://127.0.0.1:8080)** im Browser.

### 4. Automated E2E Testing (Playwright)
```bash
npm test
```
Die Test-Suite verifiziert alle 23 HTML-Seiten, den 1-Click Launch aller **21 registrierten Projekte**, Git-Simulator-Befehle, Dark-Mode-Toggles und interaktive Features.

---

## 🌟 Veröffentlichungs-Zusammenfassung (August 2026 Release)

- **21 Vollwertige Projekte**: Von Web-PWAs über AI-Bots bis hin zu 3D C++ Voxel Engines und Godot C# RPGs.
- **WCAG 2.1 AAA Accessibility**: Integrierter Barrierefreiheits-Assistent für Legasthenie, Rot-Grün-Schwäche, Hochkontrast und Schriftvergrößerung.
- **100% DSGVO-Konform**: Keine Cookies, keine externen Schriftart-Verbindungen, kryptografischer Dokumentenschutz und lokale Datenspeicherung.
- **39 Bestandene E2E-Tests**: Vollständig automatisierte Testabdeckung mit Playwright.

### ⚙️ Code-Refactoring & Qualitäts-Härtung (August 2026 Code Audit)
- **Tastatursteuerung & Escape-Key Handling (`components.js`)**: Globale Unterstützung der `Esc`-Taste zum sofortigen Schließen geöffneter Barrierefreiheits-Dropdowns, Farb-Customizer und mobiler Hauptmenüs.
- **Sanitizing von URL-Parametern (`portfolio.js`)**: Absicherung aller Deep-Link Such- und Technologie-Filter (`?search=...`, `?tech=...`) gegen Skript-Injektionen durch HTML-Bereinigung.
- **Formularvalidierung (`contact-form.js`)**: Clientseitige Regex-Prüfung von E-Mail-Adressen und Meldungsfeedback vor der Übermittlung.
- **Timer Teardown & Speicherleck-Schutz (`ihk-exam-simulator.js`)**: Automatische Deregistrierung von `setInterval`-Timern bei `beforeunload`-Events zum Schutz der Systemressourcen.
- **Terminal Historie & Auto-Scroll (`git-simulator.js`)**: Befehlshistorie mit Pfeiltasten Rauf/Runter sowie synchronisiertes Auto-Scrollen bei langen Ausgaben im Git-Terminal.
- **Projekt-Highlights & Key Learnings (`modal.js` & `projekt-detail.js`)**: Strukturierte Architektur-Badges sowie detaillierte Abschnitte zu technischen Herausforderungen und Lösungen für Top-Projekte (EcoChef, BurgenGame, Arbeitszeiterfassung).
- **Interaktiver Code-Explorer & Snippets (`portfolio.html` & `projekt-detail.html`)**: Erweiterter Quellcode-Viewer mit Syntax-Highlighting für TypeScript Gemini Services, Web Worker AI Heuristiken, React Custom Hooks und Java Strategy Patterns.


