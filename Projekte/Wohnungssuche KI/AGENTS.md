# AGENTS.md – Universeller Multi-Agenten Standard

Dieses Dokument definiert verbindliche Standards für alle KI-Coding-Assistenten (Claude, Gemini, Cursor, Codex, Copilot etc.), die an diesem Repository arbeiten.

---

## 🛡️ 1. Höchste Priorität: Sicherheit & Secrets

- **Zero-Tolerance für Secrets im Code:**
  - Niemals API-Keys, Private Keys, Passwörter oder Tokens in Dateien schreiben, die von Git getrackt werden.
  - Verwende ausschließlich `process.env.VARIABLE_NAME`.
  - Vor jedem Git-Commit stellt der Pre-Commit-Hook (`.githooks/pre-commit` -> `scripts/check-secrets.js`) sicher, dass keine sensiblen Daten oder `.env`-Dateien gestagt sind.
  - **Kein Bypass:** Kein Agent darf den Hook mit `git commit --no-verify` umgehen.
  - Manuelle Prüfung vor Commits: `npm run check-secrets` (oder `npm run check-secrets:all`).
  - Falls Hooks neu registriert werden müssen: `npm run prepare` (setzt `core.hooksPath .githooks`).

---

## 🔄 2. Commit- & Arbeitsablauf-Konventionen

- **Conventional Commits:**
  - `feat: <beschreibung>` – Neue Funktionalität (z. B. `feat: Immowelt Scraper Modul hinzugefügt`)
  - `fix: <beschreibung>` – Fehlerbehebung
  - `docs: <beschreibung>` – Dokumentationsänderungen
  - `chore: <beschreibung>` – Wartung, Abhängigkeiten, CI/CD
  - `refactor: <beschreibung>` – Code-Refactoring ohne Verhaltensänderung
  - `test: <beschreibung>` – Hinzufügen oder Anpassen von Tests
- **Atomare Änderungen:**
  - Ändere nur Dateien, die für die aktuelle Aufgabe notwendig sind.
  - Lösche keine bestehenden Kommentare oder Hilfsfunktionen ohne triftigen Grund.

---

## ⚡ 3. Plattform-Spezifika (Vercel & Cloud)

- **Serverless-Lifecycle:**
  - Funktionen müssen stateless sein.
  - Schreibe keine lokalen Dateien auf die Festplatte im Vertrauen auf dauerhafte Persistenz (nutze stattdessen Datenbank oder Cloud-Speicher).
  - Vermeide lange blockierende Aufrufe; nutze asynchrone Queues oder Vercel Cron-Jobs.
- **Header & Sicherheit:**
  - Anpassungen am Netzwerk- und Caching-Verhalten gehören in `vercel.json`.

---

## 📝 4. Dokumentation & Changelog

- Wesentliche Änderungen müssen zeitnah in [CHANGELOG.md](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/CHANGELOG.md) dokumentiert werden.
- Bei Hinzufügen neuer Umgebungsvariablen ist stets [`.env.example`](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Wohnungssuche%20KI/.env.example) mit einer sicheren Dummy-Definition und Beschreibung zu aktualisieren.
