# 0009 — Font Awesome als generiertes Subset

**Status:** Akzeptiert
**Datum:** 2026-10-02

## Kontext

Die Seite lieferte die vollständige Font-Awesome-Free-Distribution aus `assets/vendor/fontawesome/` aus: 103 KB CSS und rund 300 KB WOFF2 (dazu ungenutzte TTF-Dateien) für etwa 2000 Icons, von denen weniger als 200 verwendet werden. Das CSS ist render-blockierend und wird auf jeder Seite geladen.

Naheliegende Alternativen:

- **Inline-SVG-Sprites**: am sparsamsten, hätten aber jede Icon-Stelle in 29 Seiten und allen JS-Templates umgeschrieben.
- **Handgepflegte Teilmenge**: driftet beim nächsten neuen Icon.

## Entscheidung

`scripts/subset_fontawesome.js` (`npm run subset-icons`) erzeugt die ausgelieferte Kopie aus dem npm-Paket `@fortawesome/fontawesome-free` (exakt gepinnte `devDependency`):

- Es durchsucht Seiten, Skripte und Daten nach `fa-…`-Klassennamen, behält im CSS alle Nicht-Icon-Regeln und von den Icon-Regeln nur die verwendeten Selektoren, reduziert `@font-face` auf WOFF2 und entfernt die Font-Awesome-4-Kompatibilitäts-Faces.
- Die drei Fonts (solid, regular, brands) werden mit `subset-font` auf die Codepoints dieser Icons beschnitten.
- Die ausgelieferten Pfade bleiben unverändert (`css/all.min.css`, `webfonts/fa-*.woff2`). Der Name `all.min.css` ist damit nicht mehr wörtlich zu nehmen; er bleibt, weil auch Seiten unter `Projekte/` auf diesen Pfad verlinken, die der wöchentliche Sync überschreibt.

`npm run check-icons` ist ein CI-Gate und schlägt fehl, wenn das eingecheckte CSS nicht zu den aktuell verwendeten Icons passt. `sync_projects.js` führt `subset-icons` nach jedem Sync aus. Der E2E-Test `icons.spec.js` prüft auf jeder Seite, dass kein Icon-Element ohne Glyph bleibt.

Ergebnis: rund 21 KB CSS und 22 KB Fonts.

## Konsequenzen

- **Ein neues Icon erscheint erst nach `npm run subset-icons`** (danach `npm run generate-sw-assets`). Ohne den Befehl bleibt die Stelle leer; die CI fängt das über `check-icons` ab.
- Icon-Klassennamen müssen **wörtlich** im Quelltext stehen. Zur Laufzeit zusammengesetzte Namen (`` `fa-${name}` ``) kann das Skript nicht erkennen; es bricht in diesem Fall mit einem Hinweis ab. Stattdessen eine Lookup-Tabelle mit vollständigen Klassennamen verwenden.
- Die Suche ist bewusst großzügig (jedes `fa-…`-Wort in den durchsuchten Dateien zählt); einzelne unbenutzte Icons im Subset sind möglich, fehlende nicht.
- Font-Awesome-4-Namen (`fa-clock-o`, `fa-file-pdf-o` …) haben in Font Awesome 6 kein Glyph. Fünf solche Stellen waren schon vor dem Subset leer und wurden beim Einführen des Tests korrigiert.
- Ein Versions-Upgrade ist eine Änderung der gepinnten Version in `package.json` plus `npm run subset-icons`.
