# 0018 — Projektseiten aus den Projektdaten generieren

**Status:** Akzeptiert, ergänzt 0004
**Datum:** 2026-11-19

## Kontext

`projekt-detail.html?repo=…` entsteht vollständig im Browser: Der Quelltext enthält weder Titel noch Beschreibung, und die Seite mit Query-String steht nicht in der Sitemap. Suchmaschinen sahen die Projekte deshalb kaum. ADR 0004 hält die Inhaltsseiten bewusst von Hand, weil jede ihren eigenen Text hat; für Projekte liegen Titel, Beschreibung, Bild und Tags aber schon als Daten vor (`assets/data/projects.json`).

## Entscheidung

- `scripts/generate_project_pages.js` schreibt je Projekt `pages/projekt-<slug>.html` (Slug aus `repoName`). Die Seite trägt Titel, Meta-Beschreibung, Canonical, `hreflang`, `<h1>`, Beschreibung in DE und EN, Tags, Bild mit Maßen, die Links zu Demo und Quellcode sowie JSON-LD (`CreativeWork`) im Quelltext. Für Live-Demo-Rahmen und ähnliche Projekte verweist sie auf die dynamische Detailseite.
- `npm run generate-data` erzeugt die Seiten zusammen mit `projects_data.js` und `projects.json`; `npm run check-sync` bricht ab, wenn eine Seite davon abweicht oder zu keinem Projekt mehr gehört. Die Seiten werden nie von Hand bearbeitet.
- Jede Seite nutzt ein eigenes Link-Vorschaubild: der Generator schreibt aus dem Showcase-Bild ein 1200×630-JPEG nach `assets/images/og/projekt-<slug>.jpg` (scharf in der Mitte, unscharf als Hintergrund) und trägt es als `og:image`/`twitter:image` samt Maßen ein. JPEG, weil `check-head` für `og:image` PNG oder JPEG verlangt. Projekte ohne eigenes Bild behalten `og-cover.png`.
- Den Inline-Skript-Hash für den JSON-LD-Block trägt der Generator selbst in den CSP-`<meta>` ein (gleiche Form wie `check-csp:fix`). Sitemap-Einträge bleiben Handarbeit (`update_sitemap.js` pflegt nur `lastmod`).
- Lighthouse prüft eine der generierten Seiten als Stichprobe (`pages/projekt-ecochef.html`), nicht jede einzeln; `check-lighthouse-urls` kennt diese Regel.
- Das `ItemList` auf `portfolio.html` verweist auf die statischen Seiten statt auf die Query-URLs.

## Konsequenzen

- Jedes neue Projekt in `projects.json` ergibt automatisch eine Seite, danach fehlen nur der Sitemap-Eintrag (CI-Gate `check-sitemap` meldet das) und ein Lauf von `npm run regen`.
- Der Text der Projektseiten kann nur so gut sein wie die Projektdaten; ausführlichere Fallstudien (Plan 3.1) gehören als Felder in die Daten, nicht in die Seiten.
- Die Seiten sind 9 weitere Einträge im Precache (rund 30 KB) und in der Suche.
