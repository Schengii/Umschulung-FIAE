# 0016 — Laufzeit-Cache begrenzen, Demos nicht cachen

**Status:** Akzeptiert
**Datum:** 2026-11-19

## Kontext

Der Service Worker legte jede erfolgreiche Antwort im Laufzeit-Cache ab, auch die Demo-Builds unter `/Projekte/` (viele Dateien, teils groß). Der Cache wuchs unbegrenzt, bis der Browser ihn verwarf. Außerdem wartete Network-First für HTML ohne Zeitlimit auf das Netz, bei schlechtem Empfang blieb die Seite leer.

## Entscheidung

- Demos unter `/Projekte/` werden **nicht** gecacht und sind offline nicht verfügbar.
- Der Laufzeit-Cache hält höchstens `RUNTIME_CACHE_LIMIT` (120) Einträge; die ältesten fliegen zuerst raus.
- Network-First für HTML bricht nach `NETWORK_TIMEOUT_MS` (3 s) ab und liefert die gecachte Seite bzw. `pages/offline.html`; `navigationPreload` verkürzt den Start.
- Die Entscheidungslogik liegt DOM- und worker-frei in `modules/sw-strategy.js` und ist per Vitest getestet; `sw.js` verdrahtet nur.
- `flashcards-extended.json` bleibt außerhalb des Precache und liegt im begrenzten Laufzeit-Cache.

## Konsequenzen

- Offline funktionieren Seiten, Lernmodule und die IHK-Kartei (nach erstem Laden), nicht aber die eingebetteten Projekt-Demos.
- Grenzwerte stehen an einer Stelle und lassen sich ohne Eingriff in `sw.js` ändern.
