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
- Ändert sich ein Inline-Script auf `home.html`, `portfolio.html` oder `ueber-mich.html`, bricht der `sha256`-Hash im Meta-Tag und blockiert das Skript **still** (kein Build-Fehler) — `scripts/check_head_consistency.js` (siehe ADR 0004) prüft nur auf Vorhandensein der CSP, nicht auf Hash-Korrektheit. Ein Hash-Mismatch bleibt ein manuell zu findendes Risiko.
- `playground.html` bleibt mit `'unsafe-inline'` eine größere XSS-Angriffsfläche als der Rest der Seite (Code-Sandbox-Charakter) — eine strengere Isolation (z. B. `<iframe sandbox>`, separate Origin) wurde bewusst nicht umgesetzt und bleibt eine offene Folge-Entscheidung.
