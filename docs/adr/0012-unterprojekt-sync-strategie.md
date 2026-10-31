# 0012 — Synchronisations-Strategie für Unterprojekte (REPO_MAPPING und preserve-Listen)

**Status:** Akzeptiert
**Datum:** 2026-10-16

## Kontext

Das Monorepo bündelt unter `Projekte/` über 20 eigenständige Software-, Web- und Spiele-Projekte, die während der Umschulung und in Praxisphasen entstanden sind. Viele davon besitzen ein eigenes GitHub-Repository (`github.com/Schengii/<Projekt>`).

Für das Portfolio und die PWA-Bereitstellung auf Vercel bestehen drei gegensätzliche Anforderungen:
1. **Lauffähige Demos:** Die Projekte müssen im Browser direkt aufrufbar sein (z. B. über vorkompilierte Web-Builds unter `Projekte/<Name>/dist/` oder statische `index.html`).
2. **Repository-Größe & CI-Stabilität:** Weder Gigabyte-schwere `node_modules`-Ordner, Python-Environments (`.venv`) noch Git-Verläufe (`.git`) aus den Einzelprojekten dürfen das Portfolio aufblähen oder CI-Builds verlangsamen.
3. **Aktualität:** Weiterentwicklungen in den Einzel-Repositories sollen regelmäßig in das Portfolio einfließen, ohne mühsamen manuellen Export.

Ein klassischer Einsatz von Git-Submodules schied aus, da Submodules den gesamten Repo-Verlauf und alle ungetrackten Arbeitskopie-Artefakte mitführen und bei Vercel-Zero-Config-Builds oft Berechtigungsprobleme erzeugen.

## Entscheidung

Die Synchronisation erfolgt über ein 3-stufiges, ausfallsicheres Multi-Tier-System mit automatischer Kaskadierung:

1. **Stufe 1 — Event-getriebener Push-Sync (Sofort-Aktualisierung bei Git-Pushes):**
   In allen 8 aktiven Flaggschiff-Repositories ist ein GitHub Actions Workflow `.github/workflows/notify-portfolio.yml` hinterlegt. Sobald in einem Einzelprojekt auf `main`/`master` gepusht wird, sendet der Workflow ein `repository_dispatch`-Event an das Portfolio-Monorepo (`Schengii/Umschulung-FIAE`). Falls ein `PORTFOLIO_SYNC_PAT`-Secret hinterlegt ist, startet der Portfolio-Sync sofort in Echtzeit.

2. **Stufe 2 — Automatischer Cron-Zeitplan & 1-Klick-Trigger (Automatisches Sicherheitsnetz):**
   Sollte Stufe 1 fehlschlagen (z. B. fehlendes PAT, Rate Limits oder Branch-Merge ohne Webhook), greift das tägliche Sicherheitsnetz in `.github/workflows/sync.yml` (`cron: '0 4 * * *'`). Zusätzlich kann der Sync jederzeit manuell mit einem Klick in der GitHub Actions Web-Oberfläche (`workflow_dispatch`) ausgelöst werden.

3. **Stufe 3 — Lokaler 1-Befehl-Sync (`npm run sync-projects`):**
   Für maximale Unabhängigkeit von externen CI-Servern oder vor größeren Releases kann die Synchronisation lokal per `npm run sync-projects` mit einem einzigen Befehl ausgeführt werden. Das Skript klont alle Repositories, sichert geschützte Demos, regeneriert `projects_data.js` und aktualisiert den Service-Worker-Precache.

### Technische Absicherung im Detail:

- **Deklaratives `REPO_MAPPING`:**
  In `scripts/sync_projects.js` ist für jedes angebundene Projekt die Upstream-URL (`https://github.com/Schengii/...`), das Zielverzeichnis unter `Projekte/` und eine optionale `preserve`-Liste definiert.

- **Schutz lokaler Artefakte via `preserve`:**
  Vor dem Klonen des aktuellen Upstream-Stands in ein temporäres Verzeichnis werden alle in `preserve` deklarierten Ordner und Dateien (z. B. `dist`, `www`, `index.html`) gesichert. Das Zielverzeichnis wird bereinigt und mit dem neuen Upstream-Code befüllt. Web-Builds bleiben dadurch 100 % lauffähig.

- **Strikter Ausschluss von Entwicklungs-Ballast:**
  Beim Kopieren werden `.git`, `node_modules` und versionsspezifische Lockfiles strikt gefiltert. Windows-spezifische Dateisperren (`EPERM`) werden fehlertolerant behandelt.

## Konsequenzen

- **Dauerhafte Aktualität ohne manuellen Aufwand:** Änderungen an Einzelprojekten fließen durch die 3 Stufen garantiert zeitnah in das Portfolio ein.
- **Maximale Ausfallsicherheit:** Versagt eine Methode (z. B. Webhook/PAT), greift binnen 24 Stunden der Cron-Job, oder lokal der 1-Klick-Befehl.
- **Stabilität & QA-Schutz:** Automatische Syncs in GitHub Actions erstellen einen PR mit vollständigen CI-Checks (Playwright E2E, Vitest, Lighthouse), sodass fehlerhafter Subprojekt-Code niemals unbemerkt die Portfolio-Hauptseite bricht.
- **Demos bleiben dauerhaft lauffähig:** Vorkompilierte `dist/`-Ordner werden durch `preserve` niemals überschrieben.

## Nachtrag 2026-10-31 — Private Quell-Repos

Für Projekte mit **privatem** Quell-Repo (Amazon 2.0, ElektroCheck AI, Wohnungssuche KI, Minecraft) übernimmt der Sync nur den Demo-Build und `portfolio-metadata.json` (`DEMO_ONLY` in `scripts/project_visibility.js`). Der Quellcode bleibt im privaten Repo; auf der Website entfallen Code-Link und `codeFiles` für diese Projekte. Alte Commits in der Git-History enthalten die früheren Quellstände weiterhin.
