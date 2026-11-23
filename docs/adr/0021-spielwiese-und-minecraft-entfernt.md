# 0021 — Spielwiese und Minecraft entfernt

**Status:** Akzeptiert, ergänzt 0003, 0013 und 0014
**Datum:** 2026-11-23

## Kontext

ADR 0003 und 0013 beschreiben eine Ausnahme für `pages/playground.html`: Die Vorschau führte Nutzercode in einem `srcdoc`-iframe aus und brauchte deshalb `'unsafe-inline'` für Skripte und Styles. ADR 0014 erwähnt Klassen, die auch `Projekte/Minecraft` aus `style.css` bezog. Beides gibt es nicht mehr: Das Projekt Minecraft wurde mit PR #99 entfernt, die Spielwiese (Mini-Games-Hub, Snake, Memory, Code Playground, Challenge Lab) mit dem Audio-System und den Spiel-Achievements danach.

## Entscheidung

Die Seiten, Skripte, Module, Stylesheets, Menü-, Sitemap- und Lighthouse-Einträge sind entfernt, ebenso die Header-Regel für `/pages/playground.html` in `vercel.json`. Damit gilt die strenge Seiten-CSP (ADR 0003, 0013) ohne Ausnahme für alle Seiten unter `pages/`. Die älteren ADRs bleiben unverändert und gelten bis auf die Playground-Ausnahme weiter.

## Folgen

- Es gibt keine Seite mehr, die Nutzercode ausführt; die in ADR 0003 offen gelassene Frage nach einer Isolation per `<iframe sandbox>` oder eigener Origin entfällt.
- Nur `Projekte/**` (eingebettete Demo-Builds) wird weiterhin mit der permissiveren Header-CSP ausgeliefert.
- Klassen, die nur Minecraft oder die Spielwiese nutzten, sind aus dem CSS entfernt; Regeln, die auf einer zweiten Seite gebraucht werden, bleiben in `style.css` (ADR 0014).
