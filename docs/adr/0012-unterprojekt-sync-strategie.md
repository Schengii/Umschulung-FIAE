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

Die Synchronisation erfolgt automatisiert und selektiv über das Skript `scripts/sync_projects.js` (lokal via `npm run sync-projects` und wöchentlich per GitHub Action `.github/workflows/sync.yml`):

1. **Deklaratives `REPO_MAPPING`:**
   In `scripts/sync_projects.js` ist für jedes angebundene Projekt die Upstream-URL (`https://github.com/Schengii/...`), das Zielverzeichnis unter `Projekte/` und eine optionale `preserve`-Liste definiert.

2. **Schutz lokaler Artefakte via `preserve`:**
   Vor dem Klonen des aktuellen Upstream-Stands in ein temporäres Verzeichnis werden alle in `preserve` deklarierten Ordner und Dateien (z. B. `dist`, `www`, `index.html`) in das OS-Temp-Verzeichnis gesichert. Das Zielverzeichnis wird bereinigt und mit dem neuen Upstream-Code befüllt. Fehlende geschützte Artefakte (wie z. B. im Portfolio-Repo erstellte Web-Builds) werden anschließend transparent wiederhergestellt.

3. **Strikter Ausschluss von Entwicklungs-Ballast:**
   Beim Kopieren werden `.git`, `node_modules` und versionsspezifische Lockfiles strikt gefiltert. Die Dateirechte und Pfade bleiben intakt.

4. **Archiv-Projekte ohne Remote:**
   Unterprojekte ohne eigenes Git-Remote (reine lokale Archiv-Demos) sind bewusst nicht in `REPO_MAPPING` aufgeführt und verbleiben statisch im Repository.

## Konsequenzen

- **Demos bleiben dauerhaft lauffähig:** Ein Upstream-Sync überschreibt vorkompilierte `dist/`-Ordner nicht, wodurch die Web-Demos im Portfolio auch nach Code-Updates im Original-Repo sofort einsatzbereit bleiben.
- **Keine Bloat-Gefahr:** Das Monorepo bleibt frei von verschachtelten `.git`-Objektdatenbanken und `node_modules`.
- **Klare Single Source of Truth:** Änderungen am Quellcode eines gemappten Projekts müssen im Upstream-Repository vorgenommen werden. Lokale Edits in nicht in `preserve` gelisteten Dateien würden beim nächsten Sync überschrieben.
