# JobMatch - Dein Bewerbungs-Companion (PWA)

JobMatch ist eine moderne, progressive Webanwendung (PWA) zur effizienten Organisation, Analyse und Optimierung deines Bewerbungsprozesses. Die Anwendung läuft vollständig im Browser, speichert Daten lokal im `localStorage` und in `IndexedDB`, bietet optionale Cloud-Synchronisation über Supabase und nutzt die Gemini API für intelligente Textanalysen, Anschreiben-Generierung und Interview-Training.

---

## 🚀 Features & Funktionen

- **Dashboard (Statistiken, Analytics & Markt-Gehalt)**
  - Auswertung von Bewerbungsraten und Konvertierungs-Trichtern (Saved ➔ Applied ➔ Interview ➔ Offer).
  - Interaktive Chart.js Diagramme (Status-Doughnut, Brutto/Netto Bar Chart, 6-Monats-Trendline).
  - Netto-Gehalts-Schätzung auf Basis deutscher Steuerklassen und Kinderfreibeträge + KI Marktgehalt-Benchmark.
  - Heatmap & Wochenziel-Tracker (Aktivitäts-Streak).
  - Fristen-Erinnerungen und anstehende Termine.
- **Kanban-Board (Bewerbungs-Tracker & Tags)**
  - Übersichtliche Phasen: Gespeichert, Unterlagen bereit, Beworben, Gespräch, Angebot erhalten, Absage.
  - Drag-and-Drop Unterstützung für das schnelle Verschieben von Job-Karten.
  - Tagging-System (z. B. `Remote`, `React`, `Prio1`) & globale Echtzeit-Suche.
  - Direktes Eintragen von Terminen in den Google-Kalender oder Herunterladen als `.ics` Datei.
- **Interaktiver Kalender**
  - Visueller Monatskalender mit Übersicht aller Bewerbungsfristen und Interview-Termine.
- **Job-Suche & Aggregator**
  - Live-Durchsuchung öffentlicher Job-APIs (z. B. Remotive API) mit 1-Klick-Übernahme in das Kanban-Board.
- **Job-Vergleicher (Entscheidungsmatrix)**
  - Gewichtete Kriterien-Matrix (Gehalt, Pendelzeit, Homeoffice, Kultur, Tech-Stack) zur Ermittlung des besten Jobangebots.
  - Schieberegler zur Echtzeit-Anpassung der Gewichtung mit direkter Neuberechnung.
- **Bewerbungs-Copilot (AI-Integration)**
  - Automatischer Skill-Abgleich (Match-Score in %).
  - Parser für Stellenanzeigen per Text/URL und E-Mail-Import für Zu-/Absagen und Termine.
  - Anschreiben-Generator mit Tonalitäts-Auswahl (*Klassisch*, *Kreativ & Modern*, *Kurzer Pitch*).
  - **Interview-Simulator**: 5-Fragen Simulation inkl. Text-to-Speech (Vorlesen), Speech-to-Text (Antwort sprechen) und STAR-Feedback.
  - **Interview-Spickzettel (1-Pager)**: Druckfertiger Spickzettel mit Top-Argumenten und eigenen Fragen vor dem Gespräch.
  - **Lebenslauf-Optimizer**: Abgleich des Lebenslauf-Texts mit der Stelle und Formulierungsvorschlägen.
- **Dokumenten-Tresor & Kosten-Tracker**
  - Lokale Speicherung von Bewerbungsunterlagen (PDF, Word, Bilder) via IndexedDB.
  - Erfassung steuerlich absetzbarer Ausgaben (Fahrtkosten, Fotos, Kurse).
- **Multi-Profil-Manager & Design-Presets**
  - Beliebig viele Profile (z. B. "Frontend Entwickler" vs. "Fullstack Entwickler").
  - Fertige Farb-Presets (*Indigo Violet*, *Emerald Ocean*, *Cyber Neon*, *Warm Sunset*) und HSL-Farbregler.
- **Barrierefreiheit & PWA**
  - **LRS-Modus** (Dyslexie-Schriftart) & **RGS-Modus** (Rot-Grün-Kontrast).
  - Desktop Push-Notifications bei Fristablauf.
  - Offline-fähig dank Service Worker & Webmanifest.

---

## 📁 Ordnerstruktur

```text
Jobbsuche/
├── css/                      # CSS-Stylesheets für die Benutzeroberfläche
│   ├── comparer.css          # Styles für den Job-Vergleicher
│   ├── copilot.css           # Styles für den AI-Copilot
│   ├── dashboard.css         # Styles für das Dashboard
│   ├── kanban.css            # Styles für das Kanban-Board
│   └── main.css              # Globale Layouts, Variablen und Themes
├── js/                       # Anwendungslogik (JavaScript)
│   ├── app.js                # Haupteintrittspunkt, App-Initialisierung & Navigation
│   ├── mockAi.js             # Clientseitiger Parser und Fallback für AI-Funktionen
│   ├── storage.js            # Datenverwaltung (localStorage, Im-/Export, Supabase-Trigger)
│   ├── utils/                # Hilfsfunktionen
│   │   ├── cvExport.js       # Exportiert das Benutzerprofil / CV
│   │   ├── db.js             # IndexedDB Dateispeicher (Dokumenten-Tresor)
│   │   ├── ics.js            # Generierung von Kalenderdateien (.ics)
│   │   ├── pdfExport.js      # PDF-Generierung für Anschreiben (mit Designvorlagen)
│   │   ├── supabaseSync.js   # Cloud-Synchronisation mit Supabase
│   │   └── taxCalculator.js  # Brutto-Netto-Gehaltsrechner (Deutschland)
│   └── views/                # Benutzeroberflächen-Views
│       ├── calendarView.js   # Interaktiver Monatskalender
│       ├── comparerView.js   # Logik und UI für den Job-Vergleicher
│       ├── copilotView.js    # Logik und UI für den Bewerbungs-Copilot & Interview-Simulator
│       ├── dashboardView.js  # Logik und UI für das Dashboard & Analytics Charts
│       ├── finderView.js     # Job-Suche & Aggregator Integration
│       └── kanbanView.js     # Logik und UI für das Kanban-Board
├── index.html                # Haupt-HTML-Dokument (Single-Page-Application)
├── manifest.webmanifest      # PWA-Konfiguration für mobile Endgeräte/Desktop-Installation
├── package.json              # Abhängigkeiten und Skripte (Vite-Setup)
└── sw.js                     # PWA Service Worker (Caching und Offline-Support)
```

---

## 🛠️ Installationsanleitung

### Voraussetzungen
Stelle sicher, dass du [Node.js](https://nodejs.org/) installiert hast.

### Schritte zur Ausführung
1. Öffne ein Terminal im Projektverzeichnis.
2. Installiere die Entwicklungsumgebung (Vite):
   ```bash
   npm install
   ```
3. Starte den lokalen Entwicklungsserver:
   ```bash
   npm run dev
   ```
4. Öffne die in der Konsole angezeigte Adresse (z. B. `http://localhost:5173`) im Webbrowser.
5. Um ein Production-Build zu erstellen:
   ```bash
   npm run build
   ```
