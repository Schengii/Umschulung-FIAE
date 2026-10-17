# Umsetzungs- & Optimierungsplan Umschulung-FIAE (PLAN.md)

## 1. Ist-Zustand (max. 10 Zeilen)
1. Statische Web-PWA (Vanilla HTML5/CSS3/ES-Module, kein Bundler, Auslieferung von `dist/` via Vercel, 29 HTML-Seiten, 25 Teilprojekte).
2. Quality-Gates & Tests: `npm run check` (Data-Sync, Head, CSP, Icons, Sitemap, SW-Assets, ESLint, Prettier, TypeScript, 193 Unit-Tests) ist 100 % grün.
3. Erfolgreiche Vorstufe: Alle 25 Basis-Maßnahmen (M01–M25 aus Vorversion) sowie Cookie-Datenschutz-Transparenz (P2) sind vollständig umgesetzt und getestet.
4. CI & Git-Hooks: Pre-Commit-Hook aktiv, aber kein Pre-Push-Hook; CI-Checkout (`ci.yml`) klont flach (ohne `fetch-depth: 0`), was Lastmod-Zeitstempel verfälscht.
5. Lighthouse-CI: Audit prüft harte Schwellenwerte, schreibt die Scores (Performance/A11y/SEO) jedoch nicht visuell in die GitHub Step Summary.
6. Print-Optimierung: `assets/css/print.css` ist in `portfolio.html` und `projekt-detail.html` eingebunden, fehlt jedoch auf `pages/lebenslauf.html`.
7. Internationalisierung: Website-Rahmen ist zweisprachig (DE/EN), interaktive Labs (`challenge-lab.js`) und Fragen (`exam-questions.js`) sind rein deutsch.
8. Barrierefreiheit (WCAG 2.2): Hoher Kontrast & Legasthenie-Modus vorhanden, Screenreader-Vorlesefunktion (Web Speech API) für Quiz/Flashcards fehlt noch.
9. Gamification & Lernen: Dashboard zeigt Streak/Noten, bietet aber noch kein tägliches „Frage des Tages“-Widget und keinen QR-Sync für Mobilgeräte.
10. Architektur & Simulation: C4-Architektur (`c4-architecture.js`) ist statisch tab-basiert; Git-Simulator unterstützt lineares, aber kein interaktives Rebase.

## 2. Maßnahmen

### Phase 1: Developer Experience & CI/CD-Härtung
- [x] OPT-01 | Pre-Push Git Hook mit automatisiertem CI-Schnellcheck einrichten | P1 | S | .githooks/pre-push, package.json | .githooks/pre-commit:1, package.json:9 | Fertig wenn: Ein `git push` lokal vorab `npm run check` ausführt und bei Fehlern den Push zuverlässig blockiert.
- [x] OPT-02 | Vollständige Git-Historie im CI-Checkout für exakte Sitemap-Lastmod aktivieren | P1 | S | .github/workflows/ci.yml | .github/workflows/ci.yml:25 | Fertig wenn: `actions/checkout` mit `fetch-depth: 0` konfiguriert ist und `update_sitemap.js --check` echte Commit-Daten prüft.
- [x] OPT-03 | Visuelle Lighthouse-CI Score-Tabelle in GitHub Step Summary schreiben | P2 | S | .github/workflows/ci.yml | .github/workflows/ci.yml:130 | Fertig wenn: Nach dem Lighthouse-Lauf die Ergebnisse (Performance, A11y, Best Practices, SEO) als Markdown-Tabelle in `$GITHUB_STEP_SUMMARY` erscheinen.

### Phase 2: Internationalisierung & Barrierefreiheit
- [x] OPT-04 | Zweisprachige (DE/EN) Datenstruktur & Umschaltung im Challenge-Lab implementieren | P2 | M | assets/js/modules/challenge-lab.js, pages/challenge-lab.html | assets/js/modules/challenge-lab.js:8 | Fertig wenn: Alle 3 Code-Challenges Titel, Beschreibung, Optionen und Erklärung bei Klick auf den Sprachschalter dynamisch auf Englisch übersetzen.
- [x] OPT-05 | Print-Stylesheet `print.css` auf `pages/lebenslauf.html` einbinden | P2 | S | pages/lebenslauf.html | pages/lebenslauf.html:65 | Fertig wenn: `<link rel="stylesheet" href="../assets/css/print.css" media="print">` eingebunden ist und Druckansichten ohne Buttons formatiert werden.
- [x] OPT-06 | Native Screenreader Web Speech API Sprachausgabe für Flashcards ergänzen | P3 | M | assets/js/flashcards.js, pages/flashcards.html | assets/js/flashcards.js:210 | Fertig wenn: Ein Audio-Button auf der Karte Frage und Antwort über `window.speechSynthesis` barrierefrei und datenschutzfreundlich (ohne externe API) vorliest.
- [ ] OPT-07 | Native Screenreader Sprachausgabe für IHK-Prüfungsfragen im Exam-Simulator bereitstellen | P3 | M | assets/js/modules/ihk-exam-simulator.js, pages/quiz.html | assets/js/modules/ihk-exam-simulator.js:350 | Fertig wenn: Prüfungsfrage und Antwortoptionen per Klick auditiv ausgegeben werden können.

### Phase 3: Lern-Features, PWA & Architektur-Vertiefung
- [ ] OPT-08 | „Prüfungsfrage des Tages“-Widget auf dem Dashboard mit Streak-Bonus integrieren | P2 | M | pages/dashboard.html, assets/js/dashboard.js | pages/dashboard.html:115, assets/js/dashboard.js:320 | Fertig wenn: Auf dem Dashboard täglich eine zufällige, tagespersistierte IHK-Frage gelöst werden kann und Sofort-Feedback anzeigt.
- [ ] OPT-09 | Lernstands- & Backup-Transfer via QR-Code (Device-to-Device Sync) umsetzen | P3 | M | assets/js/modules/progress-backup.js, pages/dashboard.html | assets/js/modules/progress-backup.js:75 | Fertig wenn: Der Backup-State als kompakter QR-Code gerendert wird, der mobil gescannt und importiert werden kann.
- [ ] OPT-10 | Interaktive Quellcode- & Komponenten-Verknüpfung im C4-Architektur-Modul ausbauen | P3 | M | assets/js/modules/c4-architecture.js, pages/architecture.html | assets/js/modules/c4-architecture.js:45 | Fertig wenn: Klick auf C4-Container Detail-Panels mit Modul-Verantwortlichkeiten und direkten GitHub-Verlinkungen öffnet.

### Phase 4: Vertiefte Simulation & Fragen-Bilingualität
- [ ] OPT-11 | Git-Simulator Rebase-Erweiterung (`git rebase -i` Simulation) in Engine ergänzen | P3 | M | assets/js/modules/git-engine.js, assets/js/modules/git-engine.test.js | assets/js/modules/git-engine.js:180 | Fertig wenn: Interaktives Rebase (Pick/Squash) in der Engine simuliert und durch mindestens 5 neue Vitest-Tests abgesichert ist.
- [ ] OPT-12 | Zweisprachigkeit (DE/EN) für Kern-IHK-Prüfungsfragen (AP1 & WISO) ausrollen | P3 | L | assets/js/modules/exam-questions.js, assets/js/modules/ihk-exam-simulator.js | assets/js/modules/exam-questions.js:16 | Fertig wenn: Kernfragen bei aktivem englischen Modus in verständlicher englischer Übersetzung gerendert werden.

### Abgeschlossene Basis-Maßnahmen (Referenz)
- [x] M01–M25 | Alle Basis-Optimierungen (Iframe-Permissions, QR-Download, Paths, Hotkeys, Testing, Typings, CNAME) erfolgreich abgeschlossen und freigegeben.

## 3. Vorgehen je Phase

### Phase 1: Developer Experience & CI/CD-Härtung (OPT-01 – OPT-03)
- **Reihenfolge**: Zuerst OPT-01 (`.githooks/pre-push` Hook), danach OPT-02 (`ci.yml` fetch-depth), anschließend OPT-03 (`ci.yml` Lighthouse Step Summary).
- **Test nach Phase 1**: Lokaler Testlauf von `git push` mit Test-Fehlern; CI-Trigger prüfen.
- **Rollback**: `git checkout -- .githooks/pre-push .github/workflows/ci.yml package.json`.

### Phase 2: Internationalisierung & Barrierefreiheit (OPT-04 – OPT-07)
- **Reihenfolge**: OPT-04 (`challenge-lab.js` DE/EN), OPT-05 (`lebenslauf.html` print.css), OPT-06 (`flashcards.js` SpeechSynthesis), OPT-07 (`ihk-exam-simulator.js` SpeechSynthesis).
- **Test nach Phase 2**: `npm run check-head`, `npm run check-csp`, `npm run test:unit`, Browser-Test von Audio & Druckvorschau.
- **Rollback**: `git checkout -- assets/js/modules/challenge-lab.js pages/lebenslauf.html assets/js/flashcards.js assets/js/modules/ihk-exam-simulator.js`.

### Phase 3: Lern-Features, PWA & Architektur-Vertiefung (OPT-08 – OPT-10)
- **Reihenfolge**: OPT-08 (`dashboard.html`/`dashboard.js` Frage des Tages), OPT-09 (`progress-backup.js` QR-Sync), OPT-10 (`c4-architecture.js` Drilldown).
- **Test nach Phase 3**: `npm run test:unit`, Dashboard-Funktionstests im Browser, Service-Worker-Aktualisierung (`npm run regen`).
- **Rollback**: `git checkout -- pages/dashboard.html assets/js/dashboard.js assets/js/modules/progress-backup.js assets/js/modules/c4-architecture.js`.

### Phase 4: Vertiefte Simulation & Fragen-Bilingualität (OPT-11 – OPT-12)
- **Reihenfolge**: OPT-11 (`git-engine.js` Rebase & Unit-Tests), OPT-12 (`exam-questions.js` englische Übersetzungen).
- **Test nach Phase 4**: `npm run test:unit` (alle Engine-Tests grün), `npm run check`.
- **Rollback**: `git checkout -- assets/js/modules/git-engine.js assets/js/modules/git-engine.test.js assets/js/modules/exam-questions.js`.

## 4. Risiken und offene Fragen
- **Risiko 1 (Web Speech API Browser-Kompatibilität)**: Nicht jeder Browser (z. B. manche ältere Mobile-Browser) unterstützt die native Web Speech API fehlerfrei. Gegenmaßnahme: Vor Initialisierung stets Feature-Detection (`'speechSynthesis' in window`) durchführen und Buttons bei fehlendem Support dezent ausblenden (`display: none`).
- **Risiko 2 (QR-Code Datenlimit bei Device-to-Device Sync)**: Ein vollständiger Backup-State kann bei hunderten beantworteten Flashcards zu viele Zeichen für einen Standard-QR-Code der Version 4/5 enthalten. Gegenmaßnahme: Vor dem QR-Code-Rendern die Payload per Base64/Lz-String komprimieren oder nur den Hash/Schlüsselstand transferieren.
- **Risiko 3 (Service Worker Precache & CSP-Hashes)**: Änderungen an HTML-Seiten oder neuen Modulen erfordern Precache- und Hash-Aktualisierungen. Gegenmaßnahme: Nach jeder Phase strikt `npm run regen` und `npm run check-csp:fix` ausführen.
- **Offene Frage 1**: Sollen die Sprachausgaben (Web Speech API) standardmäßig auf Deutsch sprechen oder der aktuell aktiven Site-Sprache (`document.documentElement.lang`) folgen? (Empfehlung: Dynamisch nach aktiver Sprache wählen).
