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
| [0007](0007-git-simulator-in-memory-state.md) | Git-Simulator: In-Memory-State, SVG-Visualisierung, Custom-Parser | Akzeptiert, ergänzt durch 0011 |
| [0008](0008-produktion-liefert-dist-aus.md) | Produktion liefert den Minify-Build (`dist/`) aus | Akzeptiert |
| [0009](0009-font-awesome-als-generiertes-subset.md) | Font Awesome als generiertes Subset | Akzeptiert |
| [0010](0010-cache-name-aus-inhalts-hash.md) | Cache-Name des Service Workers aus einem Inhalts-Hash | Akzeptiert |
| [0011](0011-git-simulator-engine-als-eigenes-modul.md) | Git-Simulator: Logik als DOM-freie Engine | Akzeptiert |

Hinweis zu 0001 und 0005: Beide beschreiben einen Stand, in dem die Produktion den unminifizierten Repo-Root auslieferte. Das gilt seit 0008 nicht mehr; die übrigen Aussagen (kein Bundler, keine Pfad-Umschreibung, Skriptname `build:dist`) bleiben gültig.

