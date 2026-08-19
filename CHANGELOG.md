# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei festgehalten.

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
