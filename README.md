# Entwickler-Dokumentation & Projekt-Leitfaden

Herzlich willkommen im Portfolio-Repository zur Umschulung als **Fachinformatiker für Anwendungsentwicklung (FIAE)** von Maximilian Schenk.

Diese Anleitung beschreibt den strukturellen Aufbau des Projekts, die Software-Architektur sowie die Kernfunktionen. Sie dient als Einstiegshilfe für andere Entwickler, um sich schnell im Projekt zurechtzufinden.

---

## 📂 Projektstruktur & Ordneraufteilung

Das Projekt ist als **moderne, statische Web-App (PWA)** ohne schwerfällige Backend-Frameworks konzipiert. Alle Funktionalitäten basieren auf nativem HTML5, CSS3 und Vanilla JavaScript (ES6+), das als ES-Module (`type="module"`) geladen wird.

```text
Umschulung-FIAE/
│
├── index.html                   # Einstiegsseite (Namenseingabe für Personalisierung)
├── home.html                    # Hauptseite / Landing-Dashboard
├── dashboard.html               # Notenrechner & IHK-Notensimulation
├── portfolio.html               # Projekt-Galerie (EcoChef, ElektroCheck AI, etc.)
├── links.html                   # Quellen-Sammlung & QR-Code-Generator für Recruiter
├── ...                          # Weitere Inhaltsseiten (ausbildungsablauf.html, ueber-mich.html, etc.)
│
├── package.json                 # Projektspezifische Scripte und Entwicklungs-Abhängigkeiten
├── playwright.config.js         # Playwright E2E Testkonfiguration
├── sw.js                        # Service Worker für Offline-Caching & PWA-Fähigkeit
├── manifest.json                # PWA-Manifest (Metadaten für App-Installationen)
├── sitemap.xml & robots.txt     # SEO- & Suchmaschinen-Konfigurationen
│
├── assets/                      # Globale Web-Ressourcen
│   ├── css/                     # Stylesheets (Kombiniertes style.css, modal.css, skeletons.css)
│   ├── js/                      # Script-Dateien
│   │   ├── main.js              # Kern-Initialisierung & dynamischer Modul-Loader
│   │   ├── components.js        # Header- und Footer-Komponenten (Templating)
│   │   ├── dashboard.js         # Steuerungslogik für den IHK-Notenrechner
│   │   ├── portfolio.js         # Steuerungslogik für das Portfolio-Rendering
│   │   └── modules/             # Abgekapselte JavaScript-Feature-Module
│   │       ├── achievements.js  # Erfolge-Widget (Widget & Toast-Benachrichtigung)
│   │       ├── qr-generator.js  # Interaktiver Recruiter QR-Code-Generator
│   │       ├── username-greeting.js # URL-Parsing & Recruiter-Begrüßungsbanner
│   │       └── ...              # Weitere Hilfs-Module (learning-progress.js, easter-eggs.js)
│   │
│   ├── data/                    # JSON-Datenspeicher
│   │   └── projects.json        # Generierte Datenbank aller Projekte (wird per Script befüllt)
│   └── images/                  # Bilder und Favicons
│
├── Projekte/                    # Unterordner für eigenständige IHK-Übungsprojekte
│   ├── EcoChef/                 # IHK-Abschlussprojekt (HTML/JS/JSON)
│   ├── ElektroCheck AI/         # Bounding-Box Objekterkennung (AI)
│   └── ...                      # Weitere Übungen (Glücksspiel, Jobbsuche, etc.)
│
└── scripts/                     # Automatisierungs- & Build-Skripte (Node.js)
    ├── generate_projects_data.js # Scannt Projekte und generiert assets/js/projects_data.js
    └── generate_qr_codes.js     # Hilfsskript zum Vorab-Rendern statischer QR-Codes
```

---

## 🛠 Kern-Architektur & Funktionsweise (Modul- & Funktions-Mapping)

### 1. Einstiegspunkt & Bootstrapping (`main.js` & HTML-Integration)
Jede HTML-Seite lädt den zentralen Einstiegspunkt als ES-Modul:
```html
<script type="module" src="assets/js/main.js"></script>
```
Die [main.js](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Umschulung-FIAE/assets/js/main.js) importiert alle Feature-Module und führt sequentiell deren Initialisierungsfunktionen (z. B. `initTheme()`, `initNavigation()`) beim Laden aus. Dies verhindert Namenskonflikte und sorgt für saubere Kapselung.

### 2. Globale Konstanten & scope-übergreifender Zugriff (`constants.js`)
Die Datei [constants.js](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Umschulung-FIAE/assets/js/constants.js) definiert die globalen Key-Konstanten (`STORAGE_KEYS`, `APP`) und macht sie über das `window`-Objekt sowohl für ES6-Module als auch für klassische Scripts (wie `playground.js`, `quiz.js`) global zugänglich.

### 3. Header, Footer & Speicherverwaltung (`components.js`)
- **Header & Footer**: Werden dynamisch in die DOM-Elemente `#site-header` und `#site-footer` geladen, um HTML-Redundanzen zu vermeiden (DRY-Prinzip).
- **StorageManager**: Bietet eine sichere Schnittstelle für den Zugriff auf den `localStorage` mit automatischem Fallback bei blockiertem Speicher.

### 4. PWA-Offline-Caching (`sw.js`)
Der Service Worker in [sw.js](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Umschulung-FIAE/sw.js) cached alle statischen Dateien (HTML, CSS, JS, Bilder) für die Offline-Nutzung.
- **Wichtig**: Bei Änderungen an Assets muss der `CACHE_NAME` erhöht werden (z. B. von `umschulung-fiae-v16` auf `umschulung-fiae-v17`), um Browsern die Aktualisierung zu signalisieren.

### 5. Recruiter-Personalisierung (`username-greeting.js`)
Wertet URL-Parameter (z. B. `?c=Company` und `?n=Name`) aus, speichert sie in der Session und generiert auf der Startseite ein personalisiertes Begrüßungsbanner.

### 6. Projekt-Registrierung & Build-Script (`generate_projects_data.js`)
Scannt die Ordner unter `Projekte/` nach `portfolio-metadata.json`, zieht Live-Daten aus der GitHub API und generiert die konsolidierten Datenbanken [projects.json](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Umschulung-FIAE/assets/data/projects.json) sowie `assets/js/projects_data.js`.
- Befehl zum Ausführen: `npm run generate-data`

### 7. Token-Schutz für sensible Bewerbungsdaten (`token-auth.js`)
Schützt vertrauliche Dokumente auf `lebenslauf.html`. Der Zugriff wird über die Eingabe des Passwort-Tokens **fiae2026** im Seitenmenü oder per Parameter `?token=fiae2026` freigeschaltet.

---

## 🚀 Entwicklung & Lokales Testen

### 1. Abhängigkeiten installieren
Installiere die benötigten E2E-Test-Abhängigkeiten (Playwright) lokal im Projektverzeichnis:
```bash
npm install
npx playwright install chromium
```

### 2. Lokalen Server starten
Da das Projekt ES-Module verwendet, muss es über einen Server ausgeführt werden:
```bash
# Startet einen cachingfreien Entwicklungsserver auf Port 8080
npx http-server . -p 8080 -c-1
```

### 3. Tests ausführen
Verifiziere die Funktionalität aller 23 Einzelseiten und Kernfeatures automatisch:
```bash
npm test
```
Die Tests prüfen die Seiten auf Fehlerfreiheit beim Laden, fehlende 404-Ressourcen sowie korrekte Funktionalität von Dark Mode und Formularweiterleitungen.

---

## 🚀 Neuheiten & Interaktive Erweiterungen (Juli 2026)

Folgende interaktive Features wurden hinzugefügt:

1. **Recruiter-Cockpit (Home)**:
   - **Rollen-Filter**: Recruiter können Profile für *Frontend*, *Backend* oder *Alle* filtern, um Schwerpunkte und Stellenbezeichnungen dynamisch anzupassen.
   - **Live GitHub-Aktivität**: Integrierter Feed zeigt die echten neuesten Commits des GitHub-Repositories an (mit automatischem Fallback-Mock).
2. **Brücken-Transfer & Zertifikate (Über mich)**:
   - **Elektroniker-Entwickler-Brücke**: Interaktiver Vergleich, der zeigt, wie elektrotechnische Fertigkeiten auf die Softwareentwicklung übertragen werden.
   - **Zertifikate-Slider**: Visuelles Karussell für Zeugnisse und Leistungsnachweise.
3. **Lernpfad-Checkliste & DFG-Praxis (Ausbildung)**:
   - **Interaktiver Lernpfad**: Im Drawer jeder Phase können Themen nun abgehakt werden. Der Fortschritt wird im `localStorage` gespeichert.
   - **DFG-Praxis-Card**: Detaillierte Statistiken und Highlights aus der zweijährigen Phase bei der Deutschen Forschungsgemeinschaft.
4. **Projekt-Matchmaker & Iframe-Demos (Projekte)**:
   - **Matchmaker-Wizard**: Hilft Recruitern, passende Projekte basierend auf deren Kriterien zu finden.
   - **Live-Demos**: Direktes Testen einfacher Webprojekte in einem schicken In-Page Iframe-Modal ohne Tabwechsel.
5. **Download-Center & Terminplaner (Impressum)**:
   - **Terminplaner-Mock**: Interaktive Zeitschlitz-Auswahl zur Anfrage von Kennenlerngesprächen.
   - **Modernisiertes Download-Zentrum**: Download-Präsentationen werden in einem sauberen Raster aus Info-Karten dargestellt.
6. **Suchhervorhebung & Likes (News)**:
   - **Such-Markierung**: Gefundene Suchbegriffe werden in Titeln und Texten gelb markiert (`<mark>`).
   - **Likes-Button**: News-Beiträge können geliked werden, wobei die Zähler persistiert werden.
7. **Premium Styling, PWA, Lernboxen & SVG-Grafiken**:
   - **Maus-Spotlight & Glassmorphismus**: Cards besitzen ein satteres Glasdesign. Ein dynamischer Mouse-Glow-Effekt folgt der Maus auf allen Cards.
   - **Offline-Modus (`offline.html`)**: Fallback-Seite mit animierten WiFi-Icons und Toast-Warnungen, sobald die Verbindung getrennt wird.
   - **Leitner-Box-Filterung (Flashcards)**: Lernkarten können direkt nach Boxen (Box 1, 2 und 3) gefiltert studiert werden.
   - **Git-Level-Statusanzeige**: Level-Dropdown im Simulator zeigt nun ein interaktives Bestanden-Abzeichen (Status-Badge).
   - **SVG-Qualitätsdiagramm**: Der Notenrechner rendert jetzt ein dynamisches Balkendiagramm im SVG-Format.
8. **3er-Reihen Portfolio, Simulator-Launcher & Screenshot-Karussell (Juli 2026 Part II)**:
   - **Responsive 3er-Reihen**: Das Projekt-Raster passt sich auf Desktop-Monitoren fest in 3er-Reihen an (3 Spalten) und skaliert geschmeidig auf Mobilgeräten.
   - **Priorisierte Highlights**: `EcoChef` (IHK-Abschlussprojekt) und `ManuFaktur` sind dauerhaft als Top-Highlights an Position 1 und 2 gepinnt.
   - **100% Launch-Abdeckung**: Jedes Projekt im Portfolio ist direkt startfähig. Für Godot-Spiele (`CoOpVersusGame`) und Java-Backends (`Java OOP & Spring Boot`) wurden interaktive Web-Simulatoren / Sandboxes erstellt.
   - **Screenshot-Karussell**: Das Projektdetail-Modal verfügt über ein integriertes Bildkarussell mit Vor-/Zurück-Tasten und Navigationspunkten für Projekte mit mehreren Bildern.
9. **Dynamischer Lebenslauf-Timeline-Pfad (Scroll-Linked SVG)**:
   - **Interaktiver Scroll-Pfad**: Auf der Lebenslauf-Seite werden die statischen Ränder der Timeline-Container durch dynamische SVG-Pfad-Linien ersetzt, die sich beim Herunterscrollen flüssig einfärben.
   - **Pulsierende Meilensteine**: Sobald eine berufliche oder schulische Station im Viewport erreicht wird, vergrößert sich die jeweilige Timeline-Kugel (Marker) und erhält einen weichen, pulsierenden Farb-Glow.
