# Architecture Decision Records (ADR)

Kurzformat-Log für strukturelle Entscheidungen in diesem Projekt, die sonst nur verstreut in Commit-Messages und `CHANGELOG.md` begründet wären. Jeder Eintrag hält fest: **Kontext** (welches Problem stand an), **Entscheidung** (was wurde gemacht) und **Konsequenzen** (was folgt daraus, inkl. bewusst in Kauf genommener Nachteile).

Neue ADRs werden fortlaufend nummeriert angelegt (`NNNN-kurzer-titel.md`) und nachträglich nicht mehr inhaltlich verändert — eine überholte Entscheidung bekommt einen neuen ADR, der auf den alten verweist, statt die Historie zu überschreiben.

## Index

| # | Titel | Status |
| :-- | :--- | :--- |
| [0001](0001-kein-bundler-minify-build.md) | Kein Bundler, stattdessen Minify-Build | Akzeptiert |
| [0002](0002-vercel-als-alleiniges-deployment-ziel.md) | Vercel als alleiniges Deployment-Ziel | Akzeptiert |
| [0003](0003-zweischichtige-csp-strategie.md) | Zweischichtige CSP-Strategie (Meta-Tag + HTTP-Header) | Akzeptiert |
| [0004](0004-head-konsistenz-guard-statt-templating.md) | `<head>`-Konsistenz-Guard statt Templating-System | Akzeptiert |
| [0005](0005-build-skript-nicht-build-nennen.md) | Lokales Build-Skript nicht `build` nennen (Vercel Zero-Config-Falle) | Akzeptiert |
| [0006](0006-warum-vanilla-js-ohne-framework.md) | Warum Vanilla JS statt SPA-Framework (React/Vue/Angular) | Akzeptiert |

