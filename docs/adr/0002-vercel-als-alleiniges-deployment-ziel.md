# 0002 — Vercel als alleiniges Deployment-Ziel

**Status:** Akzeptiert
**Datum:** 2026-09-20

## Kontext

Das Repository enthielt zwei parallele Deployment-Konfigurationen für dieselbe Domain (`max-schenk.tech`):

- `vercel.json` (Vercel-Hosting, Security-Header, CSP) — tatsächlich produktiv genutzt.
- `.github/workflows/deploy.yml` (GitHub-Pages-Deploy nach grüner E2E-Suite) — laut eigenem Kommentar im Workflow selbst nie aktiviert, da `Settings → Pages → Source` nie auf "GitHub Actions" gestellt wurde.

Zwei unabhängig gepflegte Deployment-Pfade für dieselbe Domain sind ein reines Risiko: eine versehentliche Aktivierung des zweiten Pfads (z. B. durch eine spätere Einstellungsänderung) könnte zu widersprüchlichen Auslieferungen führen, ohne dass das im Code sichtbar wäre.

## Entscheidung

`.github/workflows/deploy.yml` wurde entfernt. Vercel ist das einzige, autoritative Deployment-Ziel, dokumentiert in `README.md` Abschnitt "7. Deployment". `.github/workflows/ci.yml` gated weiterhin den Merge (Data-Sync-Check, `<head>`-Konsistenz-Check, Lint, Vitest, Playwright, Lighthouse) — das Deployment selbst übernimmt Vercel eigenständig bei jedem Push auf `main`, unabhängig von CI.

Die `CNAME`-Datei (`max-schenk.tech`) im Repo-Root bleibt bestehen: sie ist für Vercel wirkungslos, aber harmlos, falls sie an anderer Stelle noch referenziert wird.

## Konsequenzen

- Ein Merge auf `main` deployed automatisch über Vercel, auch wenn `ci.yml` fehlschlägt (CI gated den Merge selbst, nicht das Deployment danach) — das ist der bestehende, unveränderte Vercel-Workflow und keine neue Einschränkung.
- Offen geblieben: ob GitHub Pages in den Repo-Einstellungen zusätzlich als "Deploy from a branch" aktiv ist, lässt sich nicht aus dem Code heraus prüfen. Sollte einmal manuell in `Settings → Pages` verifiziert werden, um eine dritte, stille Auslieferung derselben Domain über den Branch-Inhalt auszuschließen.
- Zukünftige Deployment-Änderungen (z. B. Umstellung auf `dist/`, siehe ADR 0001) betreffen nur noch eine einzige Konfiguration.
