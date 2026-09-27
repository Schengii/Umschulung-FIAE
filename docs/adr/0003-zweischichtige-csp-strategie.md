# 0003 — Zweischichtige CSP-Strategie (Meta-Tag + HTTP-Header)

**Status:** Akzeptiert
**Datum:** 2026-09-19

## Kontext

Content-Security-Policy wird an zwei Stellen definiert:

- Jede HTML-Seite trägt einen eigenen `<meta http-equiv="Content-Security-Policy">`-Tag, teils mit seiten-spezifischem `sha256`-Hash für Inline-Scripts (`home.html`, `portfolio.html`, `ueber-mich.html`) und einer dokumentierten `unsafe-inline`-Ausnahme für `playground.html` (Code-Sandbox-Seite).
- `vercel.json` liefert zusätzlich eine eigene, bewusst permissivere CSP als echten HTTP-Header (`'unsafe-inline'` in `script-src`, ohne die Per-Seiten-Hashes).

Vor der Bereinigung (siehe CHANGELOG "Sicherheit — CSP-Vereinheitlichung") unterschied sich zudem die Whitespace-Formatierung der Meta-Tags zwischen Seiten, und die Root-`404.html` hatte gar keinen CSP-Meta-Tag.

## Entscheidung

Beide Policies bleiben bestehen und werden vom Browser kombiniert (UND-verknüpft) durchgesetzt:

- Der HTTP-Header aus `vercel.json` ist eine permissive **Baseline als Sicherheitsnetz**, falls eine Seite künftig den Meta-Tag vergisst oder fehlerhaft pflegt.
- Der seiten-spezifische Meta-Tag ist die eigentliche, strikte Durchsetzung (inkl. Hashes für Inline-Scripts).

Der permissive Header schaltet dadurch nichts frei, was der strengere Meta-Tag nicht bereits erlaubt — er wirkt nur, wenn der Meta-Tag fehlt. Alle 27+ Seiten wurden auf identische Formatierung vereinheitlicht; die fehlende CSP in `404.html` wurde ergänzt.

## Konsequenzen

- Zwei Stellen müssen bei jeder CSP-relevanten Änderung (neue externe Ressource, neues Inline-Script) angefasst werden — das ist der bewusst in Kauf genommene Wartungsaufwand für die Zwei-Schichten-Sicherheit.
- **Update (2026-09-27):** Der zuvor hier dokumentierte Risiko-Hinweis ("Hash-Mismatch bleibt ein manuell zu findendes Risiko") ist behoben. `scripts/verify_csp_hashes.js` berechnet die echten `sha256`-Hashes aller Inline-Scripts und vergleicht sie gegen die Meta-Tag-CSP jeder Seite (`--fix` korrigiert automatisch); `npm run check-csp` ist als Pflicht-Gate in der CI-Pipeline verankert (`.github/workflows/ci.yml`). Ein künftiger Hash-Mismatch lässt den Build jetzt fehlschlagen, statt das Script still zu blockieren. `scripts/check_head_consistency.js` (ADR 0004) prüft weiterhin nur die strukturelle Konsistenz des `<head>`-Boilerplates, nicht die Hash-Korrektheit — das übernimmt seitdem `verify_csp_hashes.js`.
- `playground.html` bleibt mit `'unsafe-inline'` eine größere XSS-Angriffsfläche als der Rest der Seite (Code-Sandbox-Charakter) — eine strengere Isolation (z. B. `<iframe sandbox>`, separate Origin) wurde bewusst nicht umgesetzt und bleibt eine offene Folge-Entscheidung.
