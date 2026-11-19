# 0017 — Header-CSP aus den Inline-Script-Hashes erzeugen

**Status:** Akzeptiert, ergänzt 0003
**Datum:** 2026-11-19

## Kontext

Die Header-CSP in `vercel.json` war als Sicherheitsnetz bewusst permissiv und erlaubte `script-src 'unsafe-inline'`. Damit schützte sie bei Inline-Scripts nicht, nur der `<meta>`-Tag jeder Seite mit Hashes tat es.

## Entscheidung

- `scripts/verify_csp_hashes.js` sammelt die `sha256`-Hashes aller Inline-Scripts und schreibt sie als Liste in die Header-CSP; `'unsafe-inline'` entfällt in `script-src`.
- `check-csp` schlägt fehl, wenn Seiten und Header auseinanderlaufen, `check-csp:fix` erzeugt beides neu.
- Ergänzend setzt `vercel.json` COOP und weitere Sicherheits-Header; `/.well-known/security.txt` nennt den Meldeweg.

## Konsequenzen

- Jedes geänderte Inline-Script verlangt `npm run check-csp:fix`; ohne Lauf blockiert der Browser das Script.
- Die Header-CSP ist jetzt ein echtes zweites Netz statt einer Attrappe, ihre Hash-Liste wächst mit der Zahl verschiedener Inline-Scripts.
