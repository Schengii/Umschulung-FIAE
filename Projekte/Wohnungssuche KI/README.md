# Wohnungssuche KI 🤖🏢

Ein KI-gestütztes System zur automatisierten Wohnungssuche. Das Tool scannt deutsche Immobilienportale und E-Mail-Suchagenten, bewertet Angebote mittels künstlicher Intelligenz (**Google Gemini**) anhand deiner persönlichen Präferenzen, prüft Mietverträge auf Kostenfallen, hilft bei der Kündigung der alten Wohnung und unterstützt dich vollautomatisch beim Bewerbungsprozess.

---

## 📂 Ordnerstruktur

Hier ist die aktuelle Struktur des Projekts:

```
Wohnungssuche KI/
├── backend/                  # Node.js Server & KI-Business-Logik (SQLite)
│   ├── crypto-util.js        # AES-256-CBC Verschlüsselung für sensible Dokumente & Zugangsdaten
│   ├── ai-analyzer.js        # Google Gemini Integration (Bewertung, Anschreiben, Mietvertrag, E-Mail-Parser)
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
├── extension/                # Chrome & Firefox Browser-Erweiterung
│   ├── manifest.json         # Manifest V3 Konfiguration
│   ├── popup.html            # UI-Popup für 1-Klick-Import
│   └── popup.js              # Import-Logik für aktive Browser-Tabs
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
├── start.bat                 # Startet Backend & Frontend parallel
├── stop-all.bat              # Beendet alle Node.js-Prozesse
├── autostart-setup.bat       # Richtet den unsichtbaren Systemstart ein
└── start-silent.vbs          # VBScript für den lautlosen Hintergrundstart
```

---

## 🚀 Alle Features & Erweiterungen

### 1. 🎙️ KI-Besichtigungs-Coach & Vor-Ort Notizen
- **Besichtigungs-Auswertung**: Trage Sprachnotizen oder Eindrücke deiner Wohnungsbesichtigung ein. Gemini extrahiert automatisch neue Vor- und Nachteile sowie einen Fazit-Eindruck.

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

## 🛠️ Starten der Anwendung

### Entwicklungsmodus (Standard)
```bash
double-click start.bat
# Oder manuell:
npm run dev
```
- **Frontend**: `http://localhost:5173`
- **Backend/API**: `http://localhost:5000`
- **RSS Feed**: `http://localhost:5000/api/feed/rss`

### Browser-Erweiterung installieren
1. Öffne im Chrome/Edge Browser `chrome://extensions`.
2. Aktiviere oben rechts den **Entwicklermodus**.
3. Klicke auf **Entpackte Erweiterung laden** und wähle den Ordner `extension/` aus.
