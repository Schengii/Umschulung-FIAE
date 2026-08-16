# JobMatch - Dein Bewerbungs-Companion (PWA)

JobMatch ist eine moderne, progressive Webanwendung (PWA) zur effizienten Organisation, Analyse, finanziellen Steuerung und KI-gestützten Optimierung deines gesamten Bewerbungsprozesses. Die Anwendung läuft vollständig im Browser, speichert Daten lokal im `localStorage` und in `IndexedDB`, bietet optionale Cloud-Synchronisation über Supabase und nutzt die **Google Gemini API** (mit nahtlosem Offline-Fallback) für intelligente Textanalysen, Anschreiben- und Lebenslauf-Generierung, PDF-Parsing, STAR-Interview-Training, KI-Mentoring, Zeugnis- und Vertragsprüfung, Portfolio-Showcases sowie Kündigungs- und Onboarding-Planung.

---

## 🚀 Neuheiten in Version 5.0 (Career Transition & Tax Compliance Suite)

### 📂 1. Portfolio- & Projekt-Showcase Builder
- **Modul**: `js/views/copilot/showcaseBuilder.js`
- **Funktion**:
  - Interaktives Anlegen technischer Case Studies nach dem STAR-Prinzip (*Problem*, *Lösung & Architektur*, *Erreichte Metriken / Impact*).
  - 1-Klick-Druck- und PDF-Export als professionelles Projekt-Beiblatt zur Bewerbung.

### 📝 2. Rechtskonformer Kündigungsschreiben-Generator
- **Modul**: `js/views/copilot/resignationGen.js`
- **Funktion**:
  - Erstellung formell einwandfreier Kündigungsschreiben nach DIN 5008 (BGB § 622).
  - Automatische Fristberechnung (Monatsende, 15. des Monats, Probezeitende).
  - Rechtssichere Klauseln: Anforderung eines qualifizierten Arbeitszeugnisses, Bestätigung des Austrittsdatums & Resturlaubsregelung.

---

## 🚀 Kernfunktionen (Version 4.5, 4.0, 3.5 & 3.0)

- **30-60-90 Tage Onboarding- & Probezeit-Planer**: Phasen-Checklisten & 1:1 Gesprächsleitfäden.
- **Regionales & Branchenweites Gehaltsbänder-Radar**: Benchmarks nach Bundesland, KMU vs. Großkonzern und Erfahrungsstufe.
- **Bewerbungs-Inbox Simulator & Auto-Status-Sync**: Automatische Statuserkennung aus E-Mails mit 1-Klick-Kanban-Update.
- **Audio-Interview-Trainer & Podcast-Drill**: Hands-Free Vorbereitung mit TTS und Antwort-Timer.
- **1-Page Bewerber-Flyer & Mini-Pitch-Deck**: Kompakter visueller Snapshot mit PDF-Druck.
- **KI-Arbeitsvertrags- & Klausel-Checker**: Prüfung auf unwirksame Klauseln (§ 307 BGB) und Karenzentschädigung (§ 74 HGB).
- **KI-Arbeitszeugnis-Prüfer & HR-Code Entschlüssler**: Schulnoten-Berechnung (1-5) und Fallstrick-Erkennung.
- **LinkedIn & Xing Recruiter-Pitch-Generator**: Konvertierende Kurzanschreiben mit Live-Zeichenzähler.
- **Google Calendar & Outlook Web Live-Sync**: 1-Klick-Übertragung von Vorstellungsgesprächen und Fristen.
- **Live-Jobsuche & Aggregator**: Anbindung an offene Job-APIs (**Arbeitnow API & Feeds**) mit 1-Klick-Übernahme ins Kanban-Board.
- **Interaktiver Lebenslauf-Builder (CV-Builder)**: Formular-Editor mit **3 A4-Design-Layouts**, KI-Zuschnitt und Druck/PDF-Export.
- **KI-Mentor & Verhandlungs-Sparringspartner**: Interaktives Vorstellungsgesprächs-Training und Gehaltsverhandlungs-Rollenspiel.
- **Intelligente E-Mail-Suite**: Dankschreiben, Follow-up, Gegenangebote und Absageschreiben mit 1-Klick `mailto:`-Dispatch.
- **Ghosting-Detektor & Follow-up Monitor**: Erkennt Bewerbungen ohne Rückmeldung nach > 21 Tagen.
- **Steuer-Reisekosten & Verpflegungsmehraufwand (Anlage N)**: Berechnung der gesetzlichen Pauschalen.
- **Chrome / Edge Extension Companion (Manifest V3)**: Installierbare Browser-Erweiterung (`extension/`) zum 1-Klick-Clippen von Stellen.
- **STAR-Interview-Simulator mit Voice Coach**: Echtzeit-Spracherkennung, Sprechtempo-Messer (WPM) und Füllwort-Detektor.


---

## 📁 Ordnerstruktur

```text
Jobbsuche/
├── css/                      # CSS-Stylesheets
├── extension/                # Chrome / Edge Extension (Manifest V3)
├── js/                       # JavaScript ES Modules
│   ├── app.js                # Main Controller & Route Handler
│   ├── mockAi.js             # Offline AI Parser & Evaluator
│   ├── storage.js            # Storage Manager (LocalStorage, IndexedDB, Custom Cols)
│   ├── utils/                # Utility Modules
│   │   ├── backup.js         # Snapshots & Rollbacks
│   │   ├── cvExport.js       # PDF / Print CV Engine
│   │   ├── cvParser.js       # PDF.js Text & Skill Extractor
│   │   ├── db.js             # IndexedDB Document Vault
│   │   ├── emailParser.js    # Email & Date Auto-Parser
│   │   ├── geminiApi.js      # Google Gemini REST API Connector
│   │   ├── ics.js            # ICS, Google & Outlook Calendar Sync
│   │   ├── jobApi.js         # Live Job API Connector (Arbeitnow & Feeds)
│   │   ├── pdfExport.js      # PDF Cover Letter Generator
│   │   ├── taxCalculator.js  # Tax & Travel Allowance Calculator
│   │   ├── taxExport.js      # Tax Report (Anlage N / CSV & PDF)
│   │   └── webClipper.js     # Bookmarklet & Web Clipper Engine
│   └── views/                # Application Views & Copilot Submodules
│       ├── calendarView.js   # Calendar (ICS, Google, Outlook & Email Import)
│       ├── comparerView.js   # Decision Matrix & Job Showdown (Radar Chart)
│       ├── copilotView.js    # AI Copilot Suite Main View
│       ├── copilot/          # Copilot Submodules
│       │   ├── aiMentor.js           # Interactive AI Mentor & Negotiation
│       │   ├── audioDrill.js         # Hands-Free Audio Interview Podcast Drill
│       │   ├── cheatSheet.js         # 1-Pager Cheat Sheet
│       │   ├── contractChecker.js    # Employment Contract Clause Checker
│       │   ├── coverLetterGen.js     # Cover Letter AI
│       │   ├── cvBuilder.js          # Interactive CV Builder & Templates
│       │   ├── cvOptimizer.js        # CV Optimizer & PDF Import
│       │   ├── emailSuite.js         # Professional Email Generator & Mailto
│       │   ├── inboxSimulator.js     # Email Inbox & Auto-Status Sync
│       │   ├── interviewSimulator.js # STAR Simulator & Voice Coach
│       │   ├── learningRoadmap.js    # Skill-Gap Roadmap
│       │   ├── negotiatorView.js     # Salary Negotiator
│       │   ├── onboardingPlanner.js  # 30-60-90 Days Onboarding Roadmap
│       │   ├── outreachGen.js        # LinkedIn & Xing Pitch Generator
│       │   ├── pitchFlyer.js         # 1-Page Candidate Snapshot & Pitch Deck
│       │   ├── referenceChecker.js   # Reference / Arbeitszeugnis Checker
│       │   └── salaryRadar.js        # Regional & Industry Salary Radar
│       ├── dashboardView.js  # Dashboard Analytics, Ghosting Detector & Charts
│       ├── finderView.js     # Live Job Finder & Web Clipper
│       └── kanbanView.js     # Kanban Board (Batch, Custom Columns & Tags)
├── index.html                # Single Page Application HTML
├── manifest.webmanifest      # PWA Manifest
├── package.json              # Vite dependencies & build scripts
└── sw.js                     # Service Worker
```

---

## 🛠️ Ausführung & Build

### Entwicklungs-Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```




