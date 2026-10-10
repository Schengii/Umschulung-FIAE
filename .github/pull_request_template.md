# Pull Request Template

## Beschreibung
<!-- Fasse kurz zusammen, welche Änderungen vorgenommen wurden und warum. -->

## Art der Änderung
- [ ] 🐛 Bugfix (nicht-brechende Änderung, die ein Problem behebt)
- [ ] ✨ Neues Feature / Lernmodul (nicht-brechende Änderung, die Funktionalität erweitert)
- [ ] ⚡ Performance / A11y / SEO Optimierung
- [ ] 📝 Dokumentation / ADR / Changelog-Update
- [ ] 🛠️ Refactoring / CI & Tooling Pflege

## Betroffene Bereiche
- [ ] `pages/` oder Haupt-HTML
- [ ] `assets/js/` (Module / Scripts)
- [ ] `assets/css/` (Design / Responsive)
- [ ] `scripts/` (Build- & Generierungs-Pipelines)
- [ ] `docs/` oder `CLAUDE.md`

## Checklist vor dem Merge
<!-- Bitte vor dem PR oder Merge lokal prüfen -->
- [ ] `npm run check` läuft fehlerfrei durch (Sync, CSP, Head, Icons, Sitemap, SW-Assets, Lint, Format, Types, Unit-Tests)
- [ ] Falls Assets/Seiten geändert: `npm run regen` ausgeführt (Icons & SW-Cache aktualisiert)
- [ ] Falls CSP oder Inline-Scripts geändert: `npm run check-csp:fix` ausgeführt
- [ ] Tests geschrieben oder bestehende Specs angepasst (`npm run test:unit` / `npm test`)
- [ ] `CHANGELOG.md` unter `[Unreleased]` aktualisiert
