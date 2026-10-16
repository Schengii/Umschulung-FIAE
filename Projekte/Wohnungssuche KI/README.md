# Wohnungssuche KI 🏡🤖

Ein intelligentes, automatisiertes System zur Aggregation, KI-Bewertung und Bewerbung für Mietwohnungen in Deutschland.
Das Tool scannt deutsche Immobilienportale und E-Mail-Suchagenten, bewertet Angebote mittels künstlicher Intelligenz (**Anthropic Claude** & **Google Gemini**) anhand deiner persönlichen Präferenzen, prüft Mietverträge auf Kostenfallen, hilft bei der Kündigung der alten Wohnung und unterstützt dich vollautomatisch beim Bewerbungsprozess.

Entwickelt für reibungslose Zusammenarbeit mit **Claude**, **Gemini**, **GitHub** und **Vercel**.

---

## 📂 Vollständige Projektstruktur

```text
Wohnungssuche KI/
├── backend/                  # Node.js Server & KI-Business-Logik (SQLite)
│   ├── crypto-util.js        # AES-256-CBC Verschlüsselung für sensible Dokumente & Zugangsdaten
│   ├── ai-analyzer.js        # Google Gemini & Claude Integration (Bewertung, Anschreiben, Mietvertrag)
│   ├── poi-fetcher.js        # Overpass API (Supermärkte, ÖPNV, Parks, Schulen/Kitas, Lärmindikatoren)
│   ├── transit-fetcher.js    # ÖPNV Live-Abfahrtsmonitor (Echtzeit-Fahrplan für Haltestellen)
│   ├── rss-generator.js      # RSS 2.0 Feed Generator für Home Assistant & Shortcuts
│   ├── geocoder.js           # OSRM-Routenberechnung & Koordinaten
│   ├── pdf-generator.js      # Bewerbungsmappen-Generator mit Wasserzeichen & Partner-Modus
│   ├── self-disclosure-template.js # Mieterselbstauskunft PDF-Generator
│   ├── imap-scanner.js       # IMAP E-Mail-Suchlauf & automatische Besichtigungstermin-Extraktion
│   ├── listing-processor.js  # Anreicherung, Preishistorie-Tracking & Autopilot-Trigger
│   ├── db.js                 # SQLite-Datenbankverwaltung (Multi-Profil)
│   ├── notifier.js           # Telegram-Bot, WebPush & Webhook Benachrichtigungen
│   ├── server.js             # Express API-Server & Job-Scheduler
│   └── tests/                # System- & Integrationstests
│
├── frontend/                 # React Frontend (Vite) & Mobile App
│   ├── src/
│   │   ├── components/
│   │   │   ├── SwipeView.jsx       # Tinder-Style Mobile Triage Ansicht
│   │   │   ├── CompareView.jsx     # Side-by-Side Wohnungsvergleichs-Matrix
│   │   │   ├── MovingManager.jsx   # Umzugs-Checkliste & Kündigungsschreiben-Generator (§ 573c BGB)
│   │   │   ├── PriceChart.jsx      # Preisanalyse & Mietspiegel-Vergleichsdiagramm
│   │   │   ├── DocumentsView.jsx   # Unterlagen, Mietvertrags-Prüfer & Wasserzeichen-Mappe
│   │   │   ├── CalendarView.jsx    # Besichtigungstermine & Kalender-Sync
│   │   │   ├── PipelineView.jsx    # Kanban-Board für den Bewerbungsstatus
│   │   │   ├── ListingCard.jsx     # Inserats-Karten mit Partner-Voting & Preistrends
│   │   │   └── ListingDetail.jsx   # Detailfenster mit KI-Copilot, Besichtigungs-Coach & Live-ÖPNV
│   │   └── App.jsx                 # Hauptanwendung mit Theme- & Profilsteuerung
│   └── android/              # Capacitor-Projekt für Android-App
│
├── extension/                # Chrome & Firefox Browser-Erweiterung (Manifest V3)
│   ├── manifest.json         # Manifest V3 Konfiguration
│   ├── popup.html            # UI-Popup für 1-Klick-Import
│   └── popup.js              # Import-Logik für aktive Browser-Tabs
│
├── .github/                  # GitHub Actions CI/CD & Issue Templates
│   ├── workflows/ci.yml      # Automatisierte Sicherheits- & Build-Checks
│   ├── ISSUE_TEMPLATE/       # Vorlagen für Bugs & Feature-Requests
│   └── pull_request_template.md
├── .githooks/                # Git Pre-Commit Hook (Secret-Schutz)
├── scripts/                  # Wartungs- & Sicherheits-Skripte
│   ├── check-secrets.js      # Prüft gestagte Dateien auf Leaks / .env
│   └── windows/              # Windows-Dienstprogramme
│       ├── adb-forward.bat   # Portweiterleitung für Android-Smartphone
│       ├── autostart-setup.bat # Richtet den unsichtbaren Systemstart ein
│       └── start-silent.vbs  # VBScript für den lautlosen Hintergrundstart
│
├── .env                      # Lokale Konfiguration (wird NIEMALS committet)
├── .env.example              # Dokumentierte Vorlage für Umgebungsvariablen
├── .claudeignore             # Token-Schutz für Claude
├── .geminiignore             # Index-Schutz für Gemini
├── .editorconfig             # Einheitliche Formatierung über alle Editoren
├── .gitattributes            # Plattformübergreifende LF-Normalisierung
├── .gitignore                # Ausschluss von Secrets, Caches & Builds
├── vercel.json               # Vercel Deployment-, Routing- & Header-Konfiguration
├── package.json              # NPM Manifest & Entwicklungs-Skripte
├── CLAUDE.md                 # Kontext & Arbeitsrichtlinien für Claude
├── GEMINI.md                 # Kontext & Arbeitsrichtlinien für Gemini
├── AGENTS.md                 # Universelle Multi-Agenten Standards
├── CHANGELOG.md              # Revisionshistorie nach SemVer
├── start.bat                 # 1-Klick Start für Backend & Frontend parallel
├── stop-all.bat              # Beendet gezielt Dienste auf Port 5000 & 5222
└── install.bat               # 1-Klick Installation aller Pakete
```

---

## 🚀 Alle Features & Erweiterungen

### 1. 🎙️ KI-Besichtigungs-Coach & Vor-Ort Notizen
- **Besichtigungs-Auswertung**: Trage Sprachnotizen oder Eindrücke deiner Wohnungsbesichtigung ein. Die KI extrahiert automatisch neue Vor- und Nachteile sowie einen Fazit-Eindruck.

### 2. 📦 Kündigungs- & Umzugs-Assistent ([MovingManager.jsx](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/frontend/src/components/MovingManager.jsx))
- **Alte Wohnung kündigen**: Erstellung eines rechtssicheren Kündigungsschreibens für deine alte Mietwohnung (§ 573c BGB).
- **Umzugs-Checkliste**: Verwalte alle wichtigen Schritte (Bürgeramt, Strom/Gas, Post-Nachsendeauftrag, Kaution).

### 3. ⚖️ Side-by-Side Wohnungsvergleichs-Matrix ([CompareView.jsx](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/frontend/src/components/CompareView.jsx))
- Vergleiche 2 bis 4 Favoriten-Wohnungen nebeneinander bezüglich Warmmiete, €/m², Pendelzeiten, Pros/Cons und KI-Matchscore.

### 4. 📻 Webhook & RSS-Feed Engine ([rss-generator.js](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/backend/rss-generator.js))
- RSS 2.0 XML-Feed unter `/api/feed/rss` für Home Assistant, Apple Shortcuts und RSS-Reader.
- Webhook POST-Benachrichtigungen bei neuen High-Score Angeboten.

### 5. 🌐 Browser-Erweiterung (1-Klick Import)
- **Chrome / Firefox Extension** (`extension/`): Importiere Wohnungsanzeigen von ImmoScout24, Immowelt, Kleinanzeigen oder WG-Gesucht mit einem Klick.

### 6. 📲 Smart Telegram Action Buttons
- **Interaktive Buttons**: Direct Action Buttons `[🚀 Bewerben]`, `[⭐ Favorit]`, `[📄 Mappe senden]`.

### 7. 📊 Mietspiegel- & Preistrend-Diagramm
- **Preisanalyse** ([PriceChart.jsx](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/frontend/src/components/PriceChart.jsx)): Visueller Abgleich der Kaltmiete pro m² mit dem städtischen Mietspiegel-Richtwert (§ 556d BGB).

### 8. 🚌 ÖPNV Live-Abfahrtsmonitor
- Echtzeit-Fahrplan für nahegelegene Haltestellen ([transit-fetcher.js](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/backend/transit-fetcher.js)).

---

## 🛠️ Starten & Entwickeln

### 1. Installation & Hook-Aktivierung
```bash
# Alle Abhängigkeiten (Root, Backend, Frontend) installieren:
npm run install-all

# Git Pre-Commit Hook aktivieren (schützt vor versehentlichen Secret-Commits)
npm run prepare
```

### 2. Konfiguration einrichten
Kopiere `.env.example` nach `.env` (oder passe die vorhandene `.env` an) und trage deine API-Keys ein:
```bash
# In .env:
GEMINI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
TELEGRAM_BOT_TOKEN=...
```

### 3. Starten
```bash
# Parallel-Start (Backend + Frontend):
npm run dev

# Oder unter Windows per Doppelklick:
start.bat
```
- **Frontend Dashboard:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`
- **RSS Feed:** `http://localhost:5000/api/feed/rss`

### 4. Browser-Erweiterung installieren
1. Öffne im Chrome/Edge Browser `chrome://extensions`.
2. Aktiviere oben rechts den **Entwicklermodus**.
3. Klicke auf **Entpackte Erweiterung laden** und wähle den Ordner `extension/` aus.

---

## 🔒 Sicherheit & Secret-Management

- **Keine Secrets in Git:** Echte API-Keys dürfen **niemals** in Git committet werden.
- **Pre-Commit Schutz:** Der integrierte Hook (`scripts/check-secrets.js`) scannt jeden Commit automatisch auf API-Keys und blockiert ungesicherte `.env`-Dateien.
- **Vercel Environment Variables:** Trage Produktions-Keys direkt im Vercel Dashboard unter *Settings > Environment Variables* ein.

---

## ☁️ Vercel Deployment

1. Verknüpfe das GitHub-Repository mit deinem [Vercel Dashboard](https://vercel.com).
2. Hinterlege alle Umgebungsvariablen aus `.env.example` in den Vercel Project Settings.
3. Vercel verwendet automatisch die optimierten Sicherheits-Header und Cron-Einstellungen aus [vercel.json](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/vercel.json).

---

## 🤖 KI-Zusammenarbeit (Claude & Gemini)

- **Für Claude Code / Claude Desktop:** Lies [CLAUDE.md](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/CLAUDE.md)
- **Für Gemini / Antigravity:** Lies [GEMINI.md](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/GEMINI.md)
- **Multi-Agenten Leitfaden:** Lies [AGENTS.md](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/AGENTS.md)
- Token-Sparend: `.claudeignore` und `.geminiignore` schützen vor übermäßigem Token-Verbrauch durch Build-Artefakte.
