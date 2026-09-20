# 0005 — Lokales Build-Skript nicht `build` nennen (Vercel Zero-Config-Falle)

**Status:** Akzeptiert
**Datum:** 2026-09-20

## Kontext

ADR 0001 führte `scripts/build_minified.js` als rein lokales, optionales Minify-Skript ein — Produktion sollte laut Entscheidung explizit **weiterhin unbundled** direkt aus dem Repo-Root ausgeliefert werden. Das Skript wurde dazu als `"build": "node scripts/build_minified.js"` in `package.json` registriert.

Dabei wurde übersehen: Vercel führt bei einem Projekt ohne erkanntes Framework (`framework: null`, wie hier) und ohne explizit gesetzten Build-Command in den Projekteinstellungen **automatisch `npm run build` aus, sobald dieses Skript in `package.json` existiert** — unabhängig davon, ob das im Repo so beabsichtigt war. Das war vorher nie ein Problem, weil schlicht kein `build`-Skript existierte und Vercel dadurch gar keinen Build-Schritt ausführte, sondern direkt den Repo-Root als statische Dateien auslieferte.

Die Folge: Die ersten beiden Produktions-Deployments nach Einführung des Skripts (Commits `4c59241` und `662d7e8`) schlugen bei Vercel mit `errorCode: "module_not_found"` (`Command "npm run build" exited with 1`) fehl. Da Vercel bei einem fehlgeschlagenen Build den zuletzt erfolgreichen Produktions-Deploy weiter ausliefert, blieb die Seite zwar erreichbar, lief aber unbemerkt auf einem veralteten Stand (fehlende Bildoptimierungen, alter Service-Worker `v36` statt `v37`, fehlende ADRs/Doku) — ohne dass das an der Live-Seite selbst sichtbar gewesen wäre.

## Entscheidung

Das Skript wurde von `build` zu `build:dist` umbenannt (`package.json`, referenziert in `README.md` und ADR 0001). Damit findet Vercels Zero-Config-Erkennung kein `build`-Skript mehr und führt — wie vor ADR 0001 und wie in dessen Konsequenzen dokumentiert — keinen Build-Schritt aus; die Produktion liefert wieder unverändert aus dem Repo-Root.

## Konsequenzen

- `npm run build:dist` bleibt als rein lokaler/CI-interner Befehl nutzbar, ohne von Vercels Zero-Config-Heuristik aufgegriffen zu werden.
- Jedes künftige `package.json`-Skript, das *nicht* von Vercel automatisch ausgeführt werden soll, darf nicht `build` heißen (bzw. muss der Build-Command in den Vercel-Projekteinstellungen oder via `vercel.json` explizit gesetzt/deaktiviert werden) — dieser ADR dient als Gedächtnisstütze für diese Falle.
- Nach dem nächsten Push auf `main` sollte der Produktions-Deploy in den Vercel-Deployments einmal auf Status `READY` verifiziert werden, um sicherzugehen, dass die Seite wieder den aktuellen Stand ausliefert.
