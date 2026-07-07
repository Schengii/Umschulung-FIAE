# Changelog

Alle wichtigen Änderungen an diesem Projekt werden in dieser Datei festgehalten.

## [1.0.0] - 2026-07-07

### Hinzugefügt
- **Token-Schutz für Bewerbungsdokumente**: Sensible Daten wie Gehaltsvorstellungen und IHK-Prüfungszeugnis-Downloads auf `lebenslauf.html` sind nun standardmäßig gesichert. Sie können über die URL (`?token=fiae2026`) oder ein Eingabefeld mit dem Token `fiae2026` freigeschaltet werden.
- **Entwickler- & Code-Qualitätsmetriken**: Der alte Schul-Notensimulator auf `dashboard.html` wurde durch eine professionelle Übersicht über Code-Qualität, Testabdeckung und Dokumentationsabdeckung ersetzt.
- **Automatisches Changelog (`CHANGELOG.md`)**: Diese Datei zur transparenten Dokumentation aller Änderungen für Arbeitgeber und Entwickler.
- **Recruiter-Steckbrief (Quick-Info Card)**: Ein prägnantes Steckbrief-Widget auf `home.html` fasst die wichtigsten HR-Fakten (Stack, Verfügbarkeit, Rolle) übersichtlich zusammen.
- **Interaktiver Code-Showcase**: Eine neue Code-Qualitäts-Sektion auf `portfolio.html` ermöglicht Recruitern das unmittelbare Betrachten sauberer Code-Snippets (React Hook, Java Strategy Pattern, Fetch Fallback) direkt im Browser.
- **Interaktive Skill-Filter**: Das Klicken auf Skill-Balken (z. B. Java oder JavaScript) auf `portfolio.html` filtert nun automatisch die gezeigte Projektgalerie nach der entsprechenden Technologie.
- **Mehrwert-Steckbrief („Warum ich?“)**: Eine dedizierte Karte auf `ueber-mich.html` stellt deine Stärken als ehemaliger Elektroniker (Troubleshooting-Denkweise, strukturierte Problemlösung, SecOps-Mentalität) in den Vordergrund.
- **Zertifikate-Bühne**: Ein neues Widget im Lebenslauf-Sidebar zur strukturierten Präsentation deiner Abschlüsse und Befähigungsnachweise (IHK FIAE, Elektroniker, DGUV V3).
- **Projekt-Video-Player im Detail-Modal**: Im Modal (`modal.js`) integrierter HTML5-Player, der bei Projekten mit vorliegender Video-Playlist eine Auswahlliste anbietet, damit Recruiter direkt im Browser Clips abspielen können.
