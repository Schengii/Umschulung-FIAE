# GEMINI.md

Hinweise für Gemini / Antigravity in diesem Repository.

**Maßgeblich ist [`CLAUDE.md`](CLAUDE.md)** (Befehle, CI-Gates, Architektur, Konventionen). Lies sie vollständig, bevor du Code änderst. Diese Datei wiederholt ihren Inhalt bewusst nicht, damit es nur eine gepflegte Quelle gibt.

Kurzfassung der Eckpunkte:

- Portfolio- und IHK-Prüfungsvorbereitungs-Site (PWA), reines statisches Vanilla HTML/CSS/JS, kein Bundler. Texte zweisprachig (DE/EN).
- Nutzerwerte nie roh in `innerHTML`: `escapeHtml` verwenden; `npm run check-innerhtml` hält die Zahl ungeschützter Stellen fest. Klassische Scripts testest du über `scripts/test-support/classic-script.js`.
- Vor jedem Push: `npm run check`; nach Änderungen an Seiten/Assets zuletzt `npm run regen`.
- `Projekte/**` nicht anfassen (wird vom Sync überschrieben); generierte Dateien nie von Hand editieren.
