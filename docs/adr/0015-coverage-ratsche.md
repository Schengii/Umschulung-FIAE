# 0015 — Coverage-Ratsche statt fester Zielquote

**Status:** Akzeptiert
**Datum:** 2026-10-24

## Kontext

`npm run test:coverage` meldete die Unit-Coverage von `assets/js/modules`, aber ohne Schwellenwert. Sie lag bei etwa 49 % und konnte unbemerkt sinken, wenn neue Module ohne Test dazukamen. Ein hartes Ziel (z. B. 80 %) hätte viele reine Darstellungsmodule (Effekte, Animationen) zu Pixel-Tests gezwungen, die wenig Nutzen bringen.

## Entscheidung

- `vitest.config.js` setzt `coverage.thresholds` knapp **unter** dem Ist-Wert (aktuell Statements, Functions, Lines 55 %, Branches 50 % bei etwa 60 %). Die Schwelle wirkt als Ratsche: Sie verhindert Rückschritte, ohne Tests um ihrer selbst willen zu erzwingen.
- Die Schwelle wird angehoben, wenn der Ist-Wert dauerhaft deutlich darüber liegt (Ziel schrittweise 60 %), nie gesenkt, um einen roten Lauf zu umgehen.
- Module mit Logik oder Nutzerdaten bekommen echte Tests (Muster: Logik DOM-frei, sonst `happy-dom`); reine Effektmodule nur Smoke-Tests (Modul lädt, Guard-Selektor greift, `prefers-reduced-motion` wird respektiert).
- Ergänzend prüfen Konventions-Tests Dinge, die sonst nur im Review auffallen: `progress-backup.test.js` (jeder `AppStorage`-Schlüssel ist gesichert oder begründet ausgeschlossen) und `scripts/delivery_budget.test.js` (Precache-Budget, keine Medien im Precache, `width`/`height` an Bildern, `preload="none"` bei Videos).

## Konsequenzen

- `test:coverage` schlägt fehl, wenn die Quote unter die Schwelle fällt. Der `quality`-Job der CI führt die Unit-Tests deshalb über diesen Befehl aus; lokal läuft `npm run check` weiter mit `test:unit` (schneller), die Schwelle prüft dort nur `npm run test:coverage`.
- Die Gesamtquote sagt wenig über die Qualität einzelner Module; die Schwelle ersetzt kein Review.
- Neue Persistenz-Schlüssel oder Medien im Precache brechen einen Test und zwingen zu einer bewussten Entscheidung.

## Nachtrag 2026-10-28

Mit den Logik-Modulen der Seiten-Scripts (`flashcard-deck`, `portfolio-logic`, `project-detail-logic`, `snake-logic`, `memory-logic`, `quiz-logic`) und Tests für die bisher ungetesteten Module liegt der Ist-Wert bei 81 % Statements, 73 % Branches, 83 % Functions und 82 % Lines. Die Schwellen stehen jetzt bei 78 / 70 / 80 / 79 %.
