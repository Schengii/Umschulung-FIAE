# 0010 — Cache-Name des Service Workers aus einem Inhalts-Hash

**Status:** Akzeptiert
**Datum:** 2026-10-02

## Kontext

`sw.js` hält alle Seiten und Assets in einem Cache, dessen Name (`umschulung-fiae-vNN`) von Hand hochgezählt wurde. Die Dateinamen unter `assets/` tragen keinen Hash, und `/assets/` wurde mit langer Cache-Dauer ausgeliefert. Wer nach einer Änderung an CSS oder JS das Hochzählen vergaß, ließ wiederkehrende Besucher auf dem alten Stand: Der Service Worker blieb byte-identisch, der Browser installierte keinen neuen, und der alte Cache lieferte die alten Dateien weiter. Der Fehler ist auf der eigenen Maschine unsichtbar und mindestens einmal passiert (ADR 0005 beschreibt einen Stand „`v36` statt `v37`").

## Entscheidung

`scripts/generate_sw_assets.js` schreibt neben der Precache-Liste auch `CACHE_NAME` in `sw.js`: `umschulung-fiae-<Hash>`, wobei der Hash (SHA-256, 12 Hex-Zeichen) über Pfad und Inhalt jeder Precache-Datei gebildet wird. Textdateien werden dafür auf LF normalisiert, damit ein Windows-Checkout denselben Namen ergibt wie der Linux-Runner.

`npm run check-sw-assets` (CI-Gate) schlägt fehl, sobald Liste **oder** Name nicht zum aktuellen Stand passen.

Begleitend:

- `vercel.json` liefert `/assets/(css|js|data|vendor)/` mit `max-age=0, must-revalidate` aus (Revalidierung per ETag), nur Fonts bleiben `immutable`, übrige Assets bekommen einen Tag plus `stale-while-revalidate`.
- Übernimmt ein neuer Service Worker eine bereits geöffnete Seite (`controllerchange`), bietet die Seite per Hinweis ein Neuladen an, statt alte und neue Skripte gemischt weiterlaufen zu lassen.
- `sw.js` beantwortet nur noch `GET`-Anfragen und liefert offline die gecachte Seite auch dann, wenn die URL einen Query-String trägt (z. B. `projekt-detail.html?repo=…`).

## Konsequenzen

- **Nach jeder Änderung an einer Precache-Datei muss `npm run generate-sw-assets` laufen**, auch wenn keine Datei hinzugekommen ist. Das ist mehr Routine als früher, dafür kann der Fehler nicht mehr unbemerkt bleiben: Die CI wird rot.
- Die Reihenfolge der lokalen Schritte ist festgelegt: erst alles, was Dateien verändert (`subset-icons`, `check-csp:fix`, `generate-data`), zuletzt `generate-sw-assets`.
- Der Cache-Name sagt nichts mehr über eine Versionsnummer aus. Wer den Stand einer Installation prüfen will, vergleicht den Namen im Dashboard (PWA-Status) mit dem in `sw.js`.
- Jede inhaltliche Änderung invalidiert den gesamten Precache, nicht nur die geänderte Datei. Bei rund 2 MB Precache (inklusive der Kernbilder) ist das vertretbar; eine Aufteilung in mehrere Caches wäre die Folgeentscheidung, falls er deutlich wächst.
