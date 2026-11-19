# 0019 — Große Dateien und Repository-Größe

**Status:** Vorgeschlagen (Entscheidung beim Eigentümer, Plan 7.1)
**Datum:** 2026-11-19

## Kontext

Das Verzeichnis `.git` ist rund 280 MB groß. Im Arbeitsbaum liegen fünf Videos (`assets/videos/V1` bis `V5`, zusammen rund 17 MB), zwei Präsentationen (`assets/powerpoint/*.pptx`, rund 8 MB) und die committeten Demo-Builds der Unterprojekte unter `Projekte/`. Der Großteil der Historie stammt aus früheren Ständen dieser Dateien und der Sync-Läufe (ADR 0012). Ein frischer Klon dauert dadurch spürbar länger als nötig; für die Auslieferung spielt es keine Rolle, weil Vercel nur `dist/` ausliefert (ADR 0008) und Medien nicht im Precache liegen.

## Optionen

1. **So lassen.** Kein Aufwand, kein Risiko. Klon und CI-Checkout bleiben groß.
2. **Videos und Präsentationen extern ausliefern und nur verlinken** (zum Beispiel über Release-Assets oder ein Objekt-Hosting). Der Arbeitsbaum wird kleiner, die Historie bleibt unverändert, neue Binärdateien kommen nicht mehr dazu. Die Videos auf `praktikumsbetrieb.html` und die Downloads auf der EcoChef-Detailseite brauchen dann eine externe URL; die CSP (`media-src`, `connect-src`) und der Datenschutztext müssten den Host nennen, und die Seiten funktionieren offline nicht mehr für diese Medien.
3. **Git LFS mit Umschreiben der Historie.** Beseitigt den Platz in `.git` wirklich, verlangt aber einen Force-Push, bricht alle bestehenden Klone und Commit-Verweise (Issues, PRs) und bindet das Projekt an LFS-Kontingente.

## Empfehlung

Option 2, weil sie ohne Eingriff in die Historie auskommt und das Wachstum stoppt. Voraussetzung ist die Wahl des Hosts durch den Eigentümer (Datenschutz: Übermittlung der IP-Adresse an den Host, deshalb nur mit passender Erklärung in der Datenschutzerklärung). Wer die Offline-Verfügbarkeit der Videos behalten will, bleibt bei Option 1.

## Folgen bei Entscheidung für Option 2

- `delivery_budget.test.js` bleibt gültig (keine Medien im Precache).
- `assets/videos/` und `assets/powerpoint/` entfallen aus `COPY_ENTRIES`/dem Repository; Verweise in `praktikumsbetrieb-media.js`, `projects.json` (Download-Karten) und `README.md` werden auf die externen URLs umgestellt.
- `check-csp` und `vercel.json` bekommen den neuen Host in `media-src`/`img-src`; ADR 0003 wird nachgetragen.

## Offene Entscheidung

Bis der Eigentümer entscheidet, gilt Option 1.
