# 0008 — Produktion liefert den Minify-Build (`dist/`) aus

**Status:** Akzeptiert (ersetzt die Auslieferungs-Aussagen in ADR 0001 und ADR 0005)
**Datum:** 2026-10-02

## Kontext

ADR 0001 führte `npm run build:dist` als lokalen Minify-Schritt ein, ließ die Produktion aber bewusst weiter den unminifizierten Repo-Root ausliefern; das Umschalten war dort als „separate, noch offene Entscheidung" vermerkt. ADR 0005 hielt fest, dass das Skript nicht `build` heißen darf, damit Vercels Zero-Config-Erkennung es nicht versehentlich ausführt.

Damit lief der Build in der CI nur als Selbstzweck: Er wurde gebaut, aber weder getestet noch ausgeliefert. Besucher bekamen rund 1,4 MB unminifiziertes CSS/JS, obwohl die minifizierte Fassung existierte, und Lighthouse-CI maß mit dem Repo-Root ebenfalls nicht das, was mit einem Build erreichbar wäre.

## Entscheidung

`vercel.json` setzt `buildCommand: "npm run build:dist"` und `outputDirectory: "dist"` explizit (`framework: null`). Vercel baut also bei jedem Deploy und liefert ausschließlich `dist/` aus.

Dazu gehören drei Absicherungen:

- **Der Build ist vollständig.** `scripts/build_minified.js` kopiert `assets/` als Ganzes (statt einer Liste von Unterordnern) und überspringt nur noch Verzeichnisse, die auch `.gitignore` ausschließt. Vorher fehlten im Ergebnis `assets/videos` und jedes Verzeichnis namens `dist` — also genau die committeten Builds unter `Projekte/<name>/dist/`, auf die sieben Projekt-Demos verlinken. Der Build bricht jetzt ab, wenn ein in `projects.json` verlinktes lokales Ziel im Ergebnis fehlt.
- **Der Build wird getestet.** Die E2E-Matrix hat einen zusätzlichen Chromium-Lauf gegen `dist/` (`E2E_ROOT=dist`, eigener Port), und Lighthouse-CI misst `dist/` (`staticDistDir`).
- **`.vercelignore` schließt `scripts/` nicht mehr aus**, weil der Build dort liegt.

Der Name `build:dist` bleibt. Da der Build-Befehl jetzt ausdrücklich in `vercel.json` steht, hängt nichts mehr von der Zero-Config-Heuristik ab, vor der ADR 0005 warnt.

## Konsequenzen

- Ausgeliefert wird nur noch, was der Build nach `dist/` legt. Eine neue Datei oder ein neuer Ordner im Repo-Root, der öffentlich erreichbar sein soll, muss in `COPY_ENTRIES` von `build_minified.js` aufgenommen werden; alles unter `assets/`, `pages/` und `Projekte/` ist automatisch dabei.
- Interne Dateien (Doku, Konfiguration, Tests, `scripts/`) sind nicht mehr öffentlich abrufbar — vorher nur, soweit `.vercelignore` sie einzeln nannte.
- Der Build darf weiterhin keine HTML- oder Script-Referenzen umschreiben, sonst werden die CSP-Hashes ungültig (ADR 0003). Das gilt unverändert.
- Ein fehlschlagender Build blockiert das Deployment; Vercel liefert dann den letzten erfolgreichen Stand weiter aus (das Verhalten, das in ADR 0005 unbemerkt blieb). Nach Änderungen an Build oder `vercel.json` den Status des Deployments prüfen.
- Vercel installiert für den Build die `devDependencies` (esbuild). Das Projekt hat ausschließlich `devDependencies`; sie dürfen deshalb nicht per Installations-Flag ausgeschlossen werden.
- Die erste Auslieferung nach dieser Umstellung sollte als Preview-Deployment geprüft werden (Startseite, eine Seite unter `pages/`, ein Projekt-Demo unter `Projekte/*/dist/`, ein Video), bevor sie auf `main` landet: Der Build ist lokal und in der CI getestet, die Vercel-Konfiguration selbst aber erst dort.
