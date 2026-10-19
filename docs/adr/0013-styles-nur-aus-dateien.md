# 0013 — Styles nur aus Dateien: `style-src 'self'` plus `style-src-attr 'unsafe-inline'`

**Status:** Akzeptiert
**Datum:** 2026-10-19
**Ergänzt:** [0003](0003-zweischichtige-csp-strategie.md)

## Kontext

Die seitenspezifische CSP (Meta-Tag, ADR 0003) erlaubte `style-src 'self' 'unsafe-inline'`. Das betrifft zwei Dinge, die sich sicherheitlich unterscheiden:

- **`<style>`-Elemente** (inline im HTML oder per JavaScript eingefügt). Ein eingeschleustes `<style>` kann Inhalte über CSS-Selektoren auslesen oder die Seite überlagern.
- **`style="…"`-Attribute.** In `assets/js` stehen rund 300 davon in Templates, in den Seiten 19. Sie lassen sich nicht kurzfristig entfernen.

Dazu kamen sechs HTML-Seiten (`dashboard`, `flashcards`, `git-simulator`, `news`, `offline`, `404`) mit eigenem `<style>`-Block und vier Module (`faq-accordion`, `news`, `portfolio`, `quick-sandbox`), die beim Start ein `<style>`-Element in den `<head>` schrieben.

## Entscheidung

Jede Seite außer `playground.html` setzt

```
style-src 'self'; style-src-attr 'unsafe-inline'
```

- `<style>`-Elemente sind verboten, Regeln stehen in Dateien unter `assets/css/` (Seitenregeln wie `dashboard.css`, `news.css`, Widgets unter `assets/css/modules/`). Module, die Markup mit eigenem Aussehen einfügen, bekommen ihr Stylesheet per `<link>` auf der Seite oder über `window.loadStylesheet`.
- `style`-Attribute und CSSOM-Zugriffe (`element.style.x = …`) bleiben erlaubt (`style-src-attr`).
- `scripts/check_head_consistency.js` (`npm run check-head`) lässt die CI scheitern, wenn eine Seite ein `<style>`-Element enthält oder `'unsafe-inline'` wieder für `style-src` zulässt.
- `csp_violations.spec.js` besucht alle Seiten, öffnet die Command Palette und prüft per `securitypolicyviolation`-Ereignis, dass nichts blockiert wird. Zwei Kontrolltests belegen, dass Attribute erlaubt und eingeschleuste `<style>`-Elemente blockiert sind.

**Ausnahme `playground.html`:** Die Vorschau führt Nutzercode in einem `srcdoc`-iframe aus, der die CSP der Seite erbt. Dessen `<style>` muss erlaubt bleiben, sonst funktioniert die Vorschau nicht (bestehende Ausnahme aus 0003, dort auch für Skripte).

Der HTTP-Header in `vercel.json` bleibt unverändert permissiv: Er gilt auch für die Demos unter `Projekte/`, die ihre eigenen Inline-Styles mitbringen.

## Konsequenzen

- Neue Inline-`<style>`-Blöcke und JS-injizierte Style-Elemente fallen in CI und E2E sofort auf. Vorgehen: Regeln in eine CSS-Datei, bei Bedarf `<link>` auf der Seite (vor oder nach `style.css`, je nach gewünschter Kaskade).
- `style-src-attr` und `style-src-elem` kennen Browser ab etwa 2022 (Firefox 105, Safari 15.4, Chrome 75). In älteren Browsern greift `style-src 'self'` auch für Attribute, dort würden Inline-Attribute ignoriert.
- Offen bleibt der vollständige Verzicht auf `style`-Attribute. Er würde `style-src-attr` auf `'none'` setzen, erfordert aber den Umbau der Template-Strings in `assets/js`.
