# 0004 — `<head>`-Konsistenz-Guard statt Templating-System

**Status:** Akzeptiert
**Datum:** 2026-09-19

## Kontext

Alle 27+ Seiten duplizieren den kompletten `<head>`-Block (Charset, CSP, Viewport, Favicon, Stylesheet-Links, `meta author`, OG-Tags) manuell. Jede globale Änderung erfordert entsprechend viele Handbearbeitungen — genau so ist die in ADR 0003 beschriebene CSP-Formatierungs-Inkonsistenz entstanden.

Die naheliegende Lösung wäre ein Include-/Template-System (z. B. 11ty, oder ein Node-Skript, das `<head>`-Partials injiziert) gewesen. Eine genauere Analyse zeigte jedoch: Die Seiten unterscheiden sich nicht nur inhaltlich, sondern auch in der **Reihenfolge** der Boilerplate-Tags (z. B. `canonical` mal vor, mal nach `description`). Ein automatisches Rewrite-Skript hätte alle Seiten gleichzeitig anfassen müssen, mit realem Risiko, dabei etwas zu zerstören — ohne den eigentlichen Duplizierungs-Schmerz (manuelle Mehrfach-Pflege) grundlegend sicherer zu machen, solange die Architektur (Vanilla HTML, kein Build-Step für HTML) unverändert bleibt.

## Entscheidung

Statt eines Auto-Generators wurde `scripts/check_head_consistency.js` (`npm run check-head`) eingeführt: Es prüft für jede Seite, ob CSP, Viewport, Favicon, Stylesheet-Links, `meta author` und OG-Tags vorhanden sind — genau die Art von Drift, die bei der CSP-Vereinheitlichung manuell in `404.html` gefunden wurde. Der Check ist als Guard-Schritt in `.github/workflows/ci.yml` verankert und blockiert den Merge bei fehlenden Pflicht-Tags.

Beim ersten Lauf wurden dadurch echte, bisher unentdeckte Lücken gefunden und behoben: fehlendes `meta author` auf `challenge-lab.html`, `dashboard.html`, `flashcards.html`, `ihk-cockpit.html`, `praktikumsbetrieb.html`; beide `404.html`-Dateien (Root + `pages/`) hatten weder `meta author` noch OG-Tags.

## Konsequenzen

- Der eigentliche Duplizierungsaufwand (jede globale `<head>`-Änderung erfordert weiterhin N Handbearbeitungen) bleibt bestehen — der Guard verhindert nur, dass Inkonsistenzen unbemerkt bleiben, er beseitigt sie nicht strukturell.
- Kein zusätzlicher Build-Step, keine neue Templating-Abhängigkeit, keine Migration der 27+ Seiten nötig — die Vanilla-HTML-Architektur (siehe `CLAUDE.md`) bleibt unangetastet.
- Sollte die Seitenzahl oder Änderungsfrequenz der Boilerplate deutlich wachsen, bleibt ein echtes Templating-/Include-System eine mögliche Folge-Entscheidung — dieser ADR dokumentiert nur, warum er zum jetzigen Zeitpunkt bewusst nicht gewählt wurde.
