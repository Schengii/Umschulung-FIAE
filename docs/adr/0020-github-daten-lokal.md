# 0020 — GitHub-Repositorydaten lokal statt Laufzeitabruf

**Status:** Akzeptiert
**Datum:** 2026-11-22

## Kontext

Die Startseite (Recruiter-Filter, „Aktuelle Aktivität“) und die Projekt-Detailseiten riefen die Liste der öffentlichen Repositories zur Laufzeit bei `api.github.com` ab. Das übertrug die IP-Adresse jedes Besuchers an GitHub, brauchte einen Eintrag in `connect-src` und in der Datenschutzerklärung, unterlag dem anonymen Rate-Limit (60 Anfragen pro Stunde und IP, in der CI ein Dauerproblem für die E2E-Tests) und funktionierte offline nicht.

## Entscheidung

`scripts/fetch_github_repos.js` schreibt die benötigten Felder (Name, URL, Homepage, Topics, Sterne, `pushed_at`, `updated_at`, `fork`) nach `assets/data/github-repos.json`. Der tägliche Sync (`.github/workflows/sync.yml`) aktualisiert die Datei mit dem Workflow-Token; schlägt der Abruf fehl, bleibt die vorhandene Datei bestehen. Die Seiten lesen nur noch diese Datei (`loadLocalRepos` in `modules/project-detail-logic.js`). `api.github.com` ist aus `connect-src` (Seiten-Meta und `vercel.json`) entfernt, die Datenschutzerklärung (Abschnitt 8) beschreibt den neuen Ablauf.

## Folgen

- Beim Seitenaufruf gibt es keine Verbindung zu GitHub mehr; Links zu GitHub bleiben normale ausgehende Links.
- Sterne und „zuletzt aktiv“ sind höchstens einen Tag alt statt live. Für ein Portfolio reicht das.
- Der Browser-Cache `github_projects_cache` entfällt.
- Die Datei ist Teil des Precache und wird mit `npm run regen` berücksichtigt.
