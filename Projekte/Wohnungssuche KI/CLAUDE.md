# CLAUDE.md – Leitfaden für Anthropic Claude

Dieses Dokument dient als zentrale Wissensbasis und verbindliche Arbeitsrichtlinie für Claude Code, Claude Desktop und AI-Pair-Programming im Projekt **Wohnungssuche KI**.

---

## 🛡️ Pre-Commit Hook & Secret-Schutz (Verbindliche Regeln für Claude)

Im Projekt ist ein strikter **Git Pre-Commit Hook** eingerichtet und in Git aktiviert, der das versehentliche Committen von vertraulichen Daten und `.env`-Dateien zuverlässig blockiert.

### 1. Wie der Hook funktioniert
- **Speicherort Hook:** [`.githooks/pre-commit`](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/.githooks/pre-commit) und [`.git/hooks/pre-commit`](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/.git/hooks/pre-commit)
- **Scanner-Skript:** [`scripts/check-secrets.js`](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/scripts/check-secrets.js)
- **Aktivierung:** Git nutzt die versionierten Hooks über `git config core.hooksPath .githooks` (automatisch via `npm run prepare`).
- Bei jedem `git commit` führt Git automatisch das Scanner-Skript aus. Wenn sensible Dateien oder Keys gefunden werden, bricht der Commit mit **Exit Code 1** ab.

### 2. Was der Hook blockiert
- **Umgebungsdateien:** Alle `.env`-Dateien (`.env`, `.env.local`, `.env.production`, `backend/.env` etc.).  
  *Einzige Ausnahme:* Vorlagen wie [`.env.example`](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/.env.example).
- **API-Schlüssel & Tokens:**
  - Anthropic API-Keys (`sk-ant-...`)
  - Google Gemini / Cloud Keys (`AIza...`)
  - OpenAI API-Keys (`sk-...` / `sk-proj-...`)
  - Telegram Bot Tokens (`[0-9]{8,11}:[a-zA-Z0-9_-]{35}`)
  - Private SSH / TLS Keys (`BEGIN ... PRIVATE KEY` Blöcke)
  - GitHub Personal Access Tokens (`ghp_...`, `gho_...`)
  - AWS Access Keys (`AKIA...`, `ASIA...`)

### 3. Was Claude IMMER beachten MUSS:
1. **Niemals `--no-verify` verwenden:** Claude darf Commits unter keinen Umständen mit `--no-verify` erzwingen, um den Hook zu umgehen.
2. **Vor jedem Commit prüfen:** Führe vor dem Committen stets den Check aus:
   ```bash
   npm run check-secrets
   ```
3. **Nur Umgebungsvariablen nutzen:** Verwende im Code ausschließlich `process.env.VARIABLE_NAME`.
4. **Neue Konfigurationen dokumentieren:** Neue Variablen gehören mit Dummy-Werten in [`.env.example`](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/.env.example), niemals mit echten Werten.
5. **Versehentlich gestagte Secrets entstagen:** Falls eine Datei blockiert wird:
   ```bash
   git reset HEAD <datei>
   # bzw. falls aus Index entfernen:
   git rm --cached <datei>
   ```

---

## 🏢 Projektübersicht

**Wohnungssuche KI** ist ein intelligentes System zur automatisierten Suche, Bewertung und Bewerbung für Mietwohnungen in Deutschland (ImmoScout24, Immowelt, WG-Gesucht, Kleinanzeigen etc.).

### Kernfunktionen:
1. **Automatisierte Inseratsüberwachung:** Periodisches Abrufen neuer Wohnungsangebote über Scraper / APIs & E-Mail-Scanner.
2. **KI-Matching & Scoring:** Bewertung von Inseraten anhand persönlicher Kriterien via LLM (Warmmiete, Schnitt, Lage, Haustiere).
3. **Multimodale Bildanalyse:** Analyse von Wohnungsfotos und Grundrissen via Google Gemini.
4. **KI-Anschreiben-Generator:** Generierung maßgeschneiderter Bewerbungsanschreiben für Vermieter.
5. **Sofortige Push-Alarme:** Benachrichtigungen via Telegram-Bot mit interaktiven Buttons, Discord oder E-Mail.
6. **Cross-Platform:** Express Backend (`backend/`), React Vite Frontend (`frontend/`), Browser-Erweiterung (`extension/`) und Android-Support via Capacitor.

---

## 🛠️ Tech-Stack & Architektur

- **Backend:** Node.js, Express, SQLite, OSRM Geocoding, Overpass API, PDF-Generator
- **Frontend:** React 18, Vite, Lucide Icons, Capacitor Android (`frontend/android`)
- **Browser-Extension:** Manifest V3 1-Klick-Import (`extension/`)
- **Deployment:** Vercel (Serverless Functions, Cron-Jobs via [vercel.json](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/vercel.json))
- **KI-Integration:**
  - **Claude (Anthropic API):** Analyse von Texten, Mietverträgen & Formulierung von Bewerbungsschreiben.
  - **Gemini (Google AI):** Bild- und Grundrissanalysen, semantische Filter.

---

## ⚙️ Wichtige Befehle für Claude

```bash
# Git Hooks aktivieren
npm run prepare

# Gestagte Dateien auf Secrets prüfen
npm run check-secrets

# Gesamtes Repository auf Secrets prüfen
npm run check-secrets:all

# Abhängigkeiten installieren
npm run install-all

# Entwicklungsserver starten (Backend :5000 + Frontend :5173 parallel)
npm run dev

# Frontend bauen
npm run build

# Tests ausführen
npm test
```

---

## 📐 Code- & Formatierungs-Konventionen

- **Zeilenumbrüche:** Immer LF verwenden ([`.editorconfig`](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/.editorconfig) und [`.gitattributes`](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/.gitattributes) beachten).
- **Token-Schutz:** Beachte [`.claudeignore`](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/.claudeignore); lade keine riesigen Build-Verzeichnisse (`node_modules/`, `android/build/`, `dist/`) in den Prompt.
- **Fehlerbehandlung:** Robuste Fehlerbehandlung mit Graceful Degradation beim Scraping und bei externen API-Aufrufen.
- **Conventional Commits:** Aussagekräftige Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).
