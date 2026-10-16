# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt hält sich an [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Bereinigt & Optimiert (Deep Cleanup)
- **Git-Repository drastisch verschlankt:** Über 8.300 irrtümlich getrackte Artefakte (`node_modules/` in Backend & Frontend, `frontend/dist/`, `.idea/`-Ordner, `db.sqlite`) vollständig aus der Git-Historie entfernt. Git-Tracking von über 8.460 Dateien auf 150 saubere Quelldateien reduziert.
- **Syntaxfehler in `backend/ai-analyzer.js` behoben:**
  - Fehlende Zeichenmaskierung und Schließung von `poiText` Template-Strings korrigiert.
  - Doppelte schließende Klammern bei `generateContentWithRetry` / `analyzeLeaseText` entfernt.
- **CSS-Syntaxbereinigung:** Verwaiste Selektor-Eigenschaften in `frontend/src/App.css` bereinigt.
- **Windows-Skripte konsolidiert:**
  - Hilfsskripte nach `scripts/windows/` verschoben (`adb-forward.bat`, `autostart-setup.bat`, `start-silent.vbs`).
  - `start.bat` robuster gemacht (dynamische Pfadnutzung für Node.js/NPM).
  - `stop-all.bat` schließt nun gezielt Ports 5000 & 5222, anstatt globale `node.exe`-Prozesse unkontrolliert zu beenden.
  - `install.bat` bereinigt und an `npm run install-all` angebunden.
- **Tests & Build validiert:** Backend-Testsuite (`npm test`) und Frontend-Produktionsbuild (`npm run build`) laufen fehlerfrei durch.

### Geplant
- Scraper-Module für gängige Immobilienportale (ImmoScout24, Immowelt, WG-Gesucht, Kleinanzeigen).
- KI-Matching-Engine: Automatisierte Bewertung von Wohnungen basierend auf individuellen Nutzerprofilen und Kriterien.
- Automatischer Anschreiben-Generator via Claude / Gemini API (maßgeschneidert auf das spezifische Inserat).
- Vercel Cron-Jobs für regelmäßige Hintergrund-Scrapes.
- Telegram- & Discord-Bot für Push-Benachrichtigungen bei neuen Treffern.
- Capacitor Android App Synchronisation.

---

## [0.1.0] - 2026-10-11

### Hinzugefügt
- **Projekt-Grundkonfiguration**:
  - `.env` und `.env.example` mit Konfigurationsparametern für KI-APIs, Filterkriterien, Datenbank und Benachrichtigungen.
  - `.gitignore` zum Schutz vertraulicher Daten, Caches, Android-Builds und Node-Modulen.
  - `.gitattributes` für automatische LF-Zeilenendennormalisierung (plattformübergreifend Windows, Linux, Vercel).
  - `.editorconfig` für einheitliche Codeformatierung (2 Leerzeichen, UTF-8, LF).
- **KI-Zusammenarbeit (Claude & Gemini)**:
  - `CLAUDE.md`: Umfassende Richtlinien und Projektkontext für Claude Code und Anthropic Modelle.
  - `GEMINI.md`: Architektur- und Entwicklungsleitfaden für Google Gemini und Antigravity IDE.
  - `AGENTS.md`: Einheitliche Standards für Multi-Agenten-Pair-Programming.
  - `.claudeignore` & `.geminiignore`: Ausschluss von temporären Dateien, Binaries und Caches zur Reduzierung des Token-Verbrauchs.
- **Vercel & Cloud Deployment**:
  - `vercel.json` mit Sicherheits-Headern (CSP, X-Frame-Options, X-Content-Type-Options), Clean URLs und Routing-Regeln.
- **GitHub & CI/CD**:
  - GitHub Actions Workflow (`.github/workflows/ci.yml`) für automatisierte Validierung und Secret-Scanning.
  - GitHub Issue Templates (`bug_report.md`, `feature_request.md`) und PR-Template (`pull_request_template.md`).
- **Sicherheits-Schutz & Pre-Commit Hook**:
  - `scripts/check-secrets.js`: Automatischer Secret-Scanner zum Verhindern des versehentlichen Eincheckens von `.env`-Dateien und API-Schlüsseln (inkl. `--all`-Modus für CI).
  - `.githooks/pre-commit` & `.git/hooks/pre-commit`: In Git aktivierter Pre-Commit Hook (via `git config core.hooksPath .githooks`).
  - Umfassende Anbindung des Hooks in `CLAUDE.md`, `GEMINI.md`, `AGENTS.md`, `README.md` und GitHub Actions CI.
  - `package.json`: Skripte `npm run check-secrets`, `npm run check-secrets:all` und `npm run prepare`.
