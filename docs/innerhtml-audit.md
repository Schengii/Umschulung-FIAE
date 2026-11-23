# Audit: `innerHTML` und `insertAdjacentHTML`

Stand: 2026-11-23 (PLAN 2.2). Geprüft wurden alle Skripte unter `assets/js/` (ohne Tests und `projects_data.js`). Die Prüfung läuft seit PLAN 2.3 automatisch über `npm run check-innerhtml`.

## Ergebnis

- **115 Stellen** mit `innerHTML =`, `+=`, `outerHTML =` oder `insertAdjacentHTML(`.
- **82** ohne `${…}`: statisches Markup.
- **6** mit `${…}`, bei denen jeder Ausdruck durch `escapeHtml` (bzw. die lokale Kopie `esc`/`escUrl`) läuft.
- **27** mit mindestens einem Ausdruck ohne Escape. Jede wurde einzeln nach der Herkunft der Werte eingestuft; **keine ist von Besuchern steuerbar**, daher kein Handlungsbedarf außer `modal.js` (in PLAN 2.1 behoben, danach alle Ausdrücke escaped).

Nutzergesteuerte Quellen (URL-Parameter `?n=`/`?c=`/`?name=`/`?company=`, `?lang=`, `?repo=`, Suchfeld, Kontaktformular, `localStorage`/`sessionStorage`) laufen vor `innerHTML` durch `escapeHtml` (`username-greeting.js`, `pdf-exporter.js`, `contact-form.js`) oder werden als `textContent` gesetzt.

## Die 27 Stellen ohne Escape

| Datei | Herkunft der Werte | Einstufung |
| :-- | :-- | :-- |
| `modal.js` | Ausdrücke sind bereits fertig escapte Teil-Strings (`mediaHTML` usw.) | statisch (seit 2.1 escaped) |
| `about-me-enhancements.js`, `achievements.js`, `blog-enhancements.js`, `roadmap.js`, `skill-matchmaker.js`, `skills_matrix.js`, `executive-dossier.js`, `document-preview.js`, `praktikumsbetrieb-media.js`, `c4-architecture.js`, `portfolio-copilot.js`, `command_palette.js`, `contact-form.js`, `ical-generator.js` | feste Konstanten und Daten im Repo (Sprachtexte, Icon-Klassen, Datenobjekte, Zahlen, Datumsteile aus `Date`) | statisch |
| `news.js` | `news_data.js` (Repo-Daten); `highlightText` markiert die Suchtreffer innerhalb des Titeltextes, der Suchbegriff wird nur per `escapeRegex` im Muster verwendet, nie als HTML eingefügt | statisch |
| `projekt-detail.js` | Projektdaten aus `projects.json`; `?repo=` wählt nur einen Eintrag, Werte laufen durch `escapeHtml`/`safeUrl`, Rest sind aus escapten Teilen gebaute Strings | statisch/escaped |
| `pdf-exporter.js` | Name und Firma aus dem Speicher laufen durch `escapeHtml` | escaped |

## Folgen

- Regel (`CLAUDE.md`, „Konventionen“): nutzerkontrollierte Werte nie roh in `innerHTML`; `escapeHtml` aus `modules/html-utils.js`, in klassischen Scripts eine lokale Kopie.
- Neue Stellen mit nicht escapten `${…}`-Ausdrücken fallen in `npm run check-innerhtml` auf (Baseline `scripts/innerhtml-baseline.json`, Ratsche wie bei `strictNullChecks`).
