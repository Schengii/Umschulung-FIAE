# Entwickler-Dokumentation & Projekt-Leitfaden

Herzlich willkommen im Portfolio-Repository zur Umschulung als **Fachinformatiker für Anwendungsentwicklung (FIAE)** von Maximilian Schenk.

Diese Anleitung beschreibt den strukturellen Aufbau des Projekts, die Software-Architektur sowie die Kernfunktionen. Sie dient als Einstiegshilfe für andere Entwickler, um sich schnell im Projekt zurechtzufinden.

---

## 📂 Projektstruktur & Ordneraufteilung

Das Projekt ist als **moderne, statische Web-App (PWA)** ohne schwerfällige Backend-Frameworks konzipiert. Alle Funktionalitäten basieren auf nativem HTML5, CSS3 und Vanilla JavaScript (ES6+).

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

## 🛠 Kern-Architektur & Funktionsweise

### 1. Dynamischer JavaScript Modul-Loader (`main.js`)
Anstelle von dutzenden `<script>`-Tags in jeder HTML-Datei verwendet das Projekt ein modulares Ladesystem. In der [main.js](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Umschulung-FIAE/assets/js/main.js) ist das globale Array `__MODULE_SCRIPTS` definiert:
- Die registrierten JavaScript-Module (z. B. `qr-generator.js`, `achievements.js`) werden sequentiell nachgeladen.
- Nach erfolgreichem Laden führt das System die jeweiligen Initialisierungsfunktionen (z. B. `initQrGenerator()`, `initAchievements()`) aus.
- Dies verhindert Namenskonflikte und sorgt für minimale Ladezeiten auf Mobilgeräten.

### 2. Header & Footer Komponenten (`components.js`)
Um HTML-Redundanzen zu vermeiden, werden der globale Header (mit Navigation und Sprach-/Farbumschaltung) und der Footer über die [components.js](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Umschulung-FIAE/assets/js/components.js) dynamisch in die DOM-Elemente `<div id="site-header">` und `<div id="site-footer">` geladen.

### 3. PWA-Offline-Caching (`sw.js`)
Die Datei [sw.js](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Umschulung-FIAE/sw.js) implementiert einen Service Worker.
- **Wichtig bei Änderungen**: Wird an JavaScript-Dateien oder Stylesheets gearbeitet, muss in der `sw.js` der `CACHE_NAME` erhöht werden (z. B. von `umschulung-fiae-v10` auf `umschulung-fiae-v11`), da der Browser sonst alte Versionen aus dem Cache lädt.

### 4. Recruiter-Personalisierung (`username-greeting.js`)
Das System personalisiert das Dashboard automatisch, wenn Recruiter die Seite über einen QR-Code oder benutzerdefinierten Link aufrufen:
- **Parameter**: `?c=Company` (Firmenname) und/oder `?n=RecruiterName` (Name des Ansprechpartners).
- Die Parameter werden im `sessionStorage` persistiert.
- Bei Vorhandensein beider Parameter wird auf der Startseite eine kombinierte Begrüßungskarte generiert (*„Herzlich willkommen, [Name] vom Team [Firma]!“*).

### 5. Projekt-Registrierung & Build-Script (`generate_projects_data.js`)
Das Portfolio lädt seine Projektkarten dynamisch.
- Lokale Ordner unter `Projekte/` müssen eine `portfolio-metadata.json` enthalten.
- Durch Ausführen des Befehls `node scripts/generate_projects_data.js` scannt das Skript alle Unterordner, reichert diese mit GitHub-API-Daten (Stars, Update-Zeitpunkte) an und exportiert sie konsolidiert nach [projects.json](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Umschulung-FIAE/assets/data/projects.json) und `assets/js/projects_data.js` (als globaler Fallback).

### 6. Token-Schutz für sensible Bewerbungsdaten (`token-auth.js`)
Zum Schutz vertraulicher Daten (z. B. Gehaltsvorstellung, Arbeitszeugnis-Downloads) besitzt die Website auf `lebenslauf.html` einen passwortgeschützten Bereich.
- **Freischaltung**: Erfolgt durch Eingabe des Tokens **fiae2026** im Seitenmenü oder durch Anhängen des URL-Parameters `?token=fiae2026`.
- **Speicherung**: Nach erfolgreicher Eingabe wird der Zugriff über `sessionStorage` für die Dauer des Browser-Tabs persistiert.

### 7. Code-Qualitätsmetriken & QA-Dashboard (`dashboard.js`)
Das Dashboard auf `dashboard.html` bietet einen interaktiven QA-Simulator:
- Zeigt simulated Metriken wie Testabdeckung, Clean Code Compliance, Dokumentation und Security.
- Der Gesamtwert beeinflusst dynamisch die berechnete Release-Bereitschaft (Production Ready / Release Candidate / Refactoring Recommended).

### 8. Änderungshistorie (`CHANGELOG.md`)
Alle Verbesserungen, Anpassungen und behobenen Fehler werden chronologisch in der [CHANGELOG.md](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Umschulung-FIAE/CHANGELOG.md) im Hauptverzeichnis festgehalten.

### 9. Recruiter-Steckbrief (`home.html`)
Ein kompaktes Info-Widget auf der Startseite fasst für Personalabteilungen die Kernfakten zusammen (Zielposition, Stack, Verfügbarkeit, Highlights), um Zeit beim Screening zu sparen.

### 10. Code-Showcase-Sektion (`portfolio.html` & `portfolio.js`)
Ein interaktiver Quelltext-Betrachter ermöglicht es technischen Entscheidern, repräsentative Code-Snippets (wie React Hooks, Java Entwurfsmuster und robuste Fetch-Wrapper) mit integriertem Syntax-Highlighting und Designkommentaren direkt im Browser zu bewerten.

### 11. Interaktive Skill-Filter (`skill-bars.js` & `portfolio.js`)
Die Skill-Balken auf der Portfolio-Seite reagieren interaktiv auf Klicks. Der Klick filtert die Projektgalerie automatisch nach Projekten, die diesen Skill verwenden (z. B. "Java" oder "SQL").

### 12. Mehrwert-Steckbrief („Warum ich?“) (`ueber-mich.html`)
Ein interdisziplinäres Kärtchen beschreibt den Brückenschlag zwischen deiner Elektroniker-Vergangenheit und deiner neuen Entwickler-Tätigkeit (Troubleshooting, SPS-Zustände, SecOps/Vorschriften).

### 13. Zertifikate-Bühne (`lebenslauf.html`)
Eine kompakte Badgeliste im Lebenslauf-Sidebar zeigt deine Abschlüsse (IHK Fachinformatiker, Elektroniker, DGUV V3 Prüfer) auf einen Blick.

### 14. Video-Playlist-Player im Detail-Modal (`modal.js`)
Das Projekt-Modal scannt `window.projectsData`. Wenn eine Playlist vorliegt (wie bei EcoChef), bettet es einen Videoplayer mit Clip-Auswahl-Menü ein, damit Recruiter Democlips (Kochmodus, TTS etc.) direkt im Browser abspielen können.

---

## 🚀 Entwicklung & Lokales Testen

1. **Lokalen Server starten**:
   Da die PWA Module nachlädt und AJAX-Anfragen (`fetch`) nutzt, können die Dateien nicht per Doppelklick (`file://`) im Browser geöffnet werden. Starte stattdessen einen lokalen Server im Hauptverzeichnis:
   ```bash
   # Mit Python (Standard auf Windows/Mac)
   python -m http.server 8000
   
   # Alternativ mit Node.js (falls http-server global installiert ist)
   npx http-server -p 8000
   ```
2. **Aufrufen**: Öffne anschließend [http://localhost:8000](http://localhost:8000) im Browser.
3. **Erfolge freischalten (Entwickler-Tipp)**:
   In der Konsole des Browsers lässt sich das Achievement-System über `window.unlockAchievement('achievement_id')` testen. Alle verfügbaren IDs sind in [achievements.js](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Umschulung-FIAE/assets/js/modules/achievements.js) aufgelistet.
