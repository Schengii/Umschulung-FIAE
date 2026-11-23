# PLAN.md

Stand: 2026-11-23, `main` auf `a3897be` (nach Merge #100). Analyse ohne Code-Änderung. **Dieses Dokument ist die einzige Arbeitsgrundlage für Umsetzung und Tests.** Abhaken (`[x]`) erst, wenn das Kriterium unter „Fertig wenn“ nachweislich erfüllt ist.

## 1. Ist-Zustand

- Läufe auf `main`: `npm run lint`, `typecheck`, `build:dist` (65 JS, 26 CSS minifiziert) und `npm audit` (0 Schwachstellen) sind ohne Fehler; 524 Unit-Tests in 67 Dateien grün, `strictNullChecks`-Baseline 0.
- Coverage `assets/js/modules`: 96,5 % Statements, 81,3 % Branches, 97,5 % Functions, 98,2 % Lines (Schwellen `vitest.config.js:19`: 92/80/94/94).
- Seiten-Scripts `assets/js/*.js` (12 Dateien, rund 1 500 Zeilen) haben 0 % Unit-Coverage; Schwelle dort nur 0,5 % (`vitest.config.js:22`).
- 23 Playwright-Specs (axe-core in `package.json:55`, `accessibility.spec.js`), CI mit Quality, E2E-Matrix und Lighthouse (`.github/workflows/ci.yml`); CI auf `main` für `a3897be` lief beim Erstellen noch.
- Offene PRs: #102 (LinkedIn-Link), #101 (automatischer Projekt-Sync).
- Veraltet: `HANDOFF.md:3` nennt `main` auf `8c236d6`; ADR 0003, 0013 und 0014 verweisen auf entfernte Seiten/Projekte (`playground.html`, Minecraft).
- Offene Inhaltspunkte laut `HANDOFF.md:22`: Fallstudien (`case-studies.json` enthält nur EcoChef), Lebenslauf-PDF, Skill-Stufen, PowerPoint-Prüfung.
- Größen: `style.css` 4 844 Zeilen, 207 Zeilen mit `!important`; 16 verschiedene Media-Query-Breiten (u. a. 1100/1101 und 1023/1024).
- Werkzeug-Updates verfügbar: vitest/@vitest/coverage-v8 5.1.1, eslint 10.15.0, Playwright 1.65.1 (bewusst gepinnt).

## 2. Maßnahmen (Abhängigkeiten zuerst)

### Phase 1 – Basis und Doku

- [ ] 1.1 | Offene PRs abschließen (#102 mergen, #101 prüfen) und CI-Ergebnis von `a3897be` bestätigen | P1 | S | – | `gh pr list` (#101, #102), `ci.yml`-Lauf auf `main` unvollständig | Fertig wenn: `gh pr list` leer, letzter `ci.yml`-Lauf auf `main` grün
- [ ] 1.2 | `HANDOFF.md` auf aktuellen Stand bringen | P2 | S | `HANDOFF.md` | `HANDOFF.md:3` (`8c236d6`), Minecraft/Spielwiese/Doku-Umbau (`docs/archiv/`, `.github/`) fehlen | Fertig wenn: Stand-Zeile nennt aktuellen `main`-Commit, Erledigt-Liste enthält #98–#102, Offene Punkte entsprechen diesem Plan
- [x] 1.3 | Patch-Updates einspielen (vitest, @vitest/coverage-v8, eslint) | P3 | S | `package.json`, `package-lock.json` | `npm outdated`: vitest 5.1.0→5.1.1, eslint 10.14.0→10.15.0 | Fertig wenn: `npm outdated` zeigt diese drei nicht mehr, `npm run check` grün **Erledigt: package.json hatte die Versionen bereits, nur node_modules war veraltet; npm update, npm outdated zeigt nur noch Playwright (gepinnt).**
- [ ] 1.4 | ADR-Nachzug für entfernte Seiten/Projekte (neuer ADR 0021, Index in `docs/adr/README.md`) | P3 | S | `docs/adr/0021-*.md`, `docs/adr/README.md` | `docs/adr/0003-…md:30`, `0013-…md:18,29` (playground.html), `0014-…md:20` (Minecraft) | Fertig wenn: ADR 0021 erklärt Wegfall der `playground.html`-CSP-Ausnahme und verweist auf 0003/0013, Index enthält 0021; alte ADRs bleiben unverändert
- [ ] 1.5 | Coverage-Schwellen der Module auf Ist-Werte nachziehen (Freigabe des Eigentümers nötig) | P2 | S | `vitest.config.js` | `vitest.config.js:19-22` (92/80/94/94) gegen Ist 96,5/81,3/97,5/98,2; `HANDOFF.md:23` | Fertig wenn: Modul-Schwellen höchstens 1 Punkt unter Ist (z. B. 95/80/96/97), `npm run test:coverage` grün, Kommentar mit Datum aktualisiert (ADR 0015)

### Phase 2 – Sicherheit (vor Tests, weil Code-Änderung an Seiten-Scripts)

- [ ] 2.1 | `modal.js`: Projektdaten aus `dataset` per `escapeHtml` in `innerHTML` einsetzen | P2 | S | `assets/js/modal.js` | `modal.js:49-51` (`card.dataset.titleDe`/`descDe`), `modal.js:230-236` (ungeschützt interpoliert); CLAUDE.md-Regel zu `escapeHtml` | Fertig wenn: alle `${…}` aus `dataset` in `modalBody.innerHTML` laufen durch `escapeHtml` (lokale Kopie, klassisches Script), E2E `portfolio`/Modal-Specs grün, neuer Test mit `<img onerror>`-Wert besteht
- [ ] 2.2 | Audit aller `innerHTML`/`insertAdjacentHTML`-Stellen mit dynamischen Werten | P2 | M | `assets/js/**/*.js` | 113 Fundstellen (`grep innerHTML|insertAdjacentHTML`), u. a. `architecture.js:537`, `achievements.js:99`, `about-me-enhancements.js:44`, `blog-enhancements.js:28` | Fertig wenn: Liste in diesem Plan oder `docs/` mit Einstufung je Stelle (statisch / escaped / zu beheben), alle „zu beheben“ erledigt
- [ ] 2.3 | Automatische Prüfung gegen rohe Interpolation in `innerHTML` (Check-Skript oder ESLint-Regel) | P3 | M | `scripts/check_*.js` oder `eslint.config.js`, `package.json` (`check`) | Folgt aus 2.2; heute nur Konvention in `CLAUDE.md` („Konventionen“) | Fertig wenn: Prüfung läuft in `npm run check` und `ci.yml`, schlägt bei einem Testfall mit `${userInput}` ohne `escapeHtml` fehl

### Phase 3 – Tests der Seiten-Scripts (nach Phase 2)

- [ ] 3.1 | `components.js`: reine Logik (Navigation-Daten, Breadcrumbs, Storage-Wrapper) nach `modules/` auslagern und testen | P2 | L | `assets/js/components.js`, `assets/js/modules/*` | `components.js` 764 Zeilen, 269 ausführbare Zeilen mit 0 % Unit-Coverage | Fertig wenn: ausgelagerte Module ≥ 90 % Lines, `components.js` verhält sich unverändert (E2E `all_pages`, `navigation_groups`), Precache/CSP über `regen` und `check-csp:fix` aktualisiert
- [ ] 3.2 | `modal.js`, `news.js`, `toast.js`: Logik auslagern bzw. mit happy-dom testen | P3 | M | `assets/js/modal.js`, `news.js`, `toast.js` | 0 % Coverage (146 / 112 / 34 Zeilen) | Fertig wenn: je Datei ≥ 70 % Lines oder Logik in getestetem Modul, E2E-Specs zu Modal/News grün
- [ ] 3.3 | `portfolio.js`, `projekt-detail.js`, `architecture.js`, `skills_matrix.js`: Rest-Logik nach `modules/` (Muster `portfolio-logic`, `project-detail-logic`) | P3 | L | `assets/js/portfolio.js` u. a. | 0 % Coverage (271 / 230 / 212 / 112 Zeilen); `CLAUDE.md` („Zustand & Daten“: Seiten-Code dünn halten) | Fertig wenn: je Datei ≥ 50 % Lines über Unit-Tests, keine Verhaltensänderung in E2E
- [ ] 3.4 | Schwelle für Seiten-Scripts anheben | P3 | S | `vitest.config.js` | `vitest.config.js:22` (0,5 / 0,5 / 0,1 / 0,5) | Fertig wenn: Schwelle ≥ Ist minus 1 Punkt nach 3.1–3.3, `npm run test:coverage` grün

### Phase 4 – Performance, CSS, CI

- [ ] 4.1 | Lighthouse-Reserve aus CI-Läufen auswerten und Schwellen ggf. anheben | P2 | S | `lighthouserc.json` | `lighthouserc.json:26-30` (Performance 0,8; a11y/SEO/Best Practices 0,9); `HANDOFF.md:23` | Fertig wenn: Median-Scores der letzten 3 CI-Läufe dokumentiert, Schwelle höchstens 0,05 unter dem schlechtesten Median, CI grün
- [ ] 4.2 | Lighthouse-URL-Liste um die weiteren Projektseiten erweitern (heute nur `projekt-ecochef`) | P3 | S | `lighthouserc.json` | `lighthouserc.json:9-23` (1 von 8 `projekt-*.html`) | Fertig wenn: mindestens `projekt-detail` und eine zweite generierte Projektseite enthalten, `check-lighthouse-urls` und Lighthouse-Job grün
- [ ] 4.3 | Media-Query-Breiten vereinheitlichen (nahe Duplikate 1100/1101, 1023/1024, 850/900) | P3 | M | `assets/css/*.css`, `assets/css/modules/*.css` | 16 verschiedene Breiten per `grep @media`; `HANDOFF.md:18` (bewusst zurückgestellt, Layout-Risiko) | Fertig wenn: höchstens 8 Breiten, jede in `style.css`-Kopfkommentar dokumentiert, Workflow `visual.yml` ohne Abweichung und `E2E_ROOT=dist`-Lauf grün; Umsetzung in eigenem Branch
- [ ] 4.4 | Playwright-Pin prüfen (1.65.1 verfügbar) | P3 | M | `package.json`, `.github/dependabot.yml` | `dependabot.yml:13-17` (Pin `>=1.64.0` ignoriert, Wiedervorlage bis 2027-01-31); `npm outdated` | Fertig wenn: Test-PR mit neuer Version, WebKit-Specs auf `portfolio.html` in CI grün, Regel entfernt – oder Entscheidung „Pin bleibt“ mit Datum im Kommentar

### Phase 5 – Inhalte (brauchen den Eigentümer)

- [ ] 5.1 | Fallstudien für die übrigen Projekte ergänzen | P2 | M | `assets/data/case-studies.json` | `case-studies.json` enthält nur den Schlüssel `EcoChef`, es gibt 8 `pages/projekt-*.html` | Fertig wenn: je Projekt Situation/Aufgabe/Ergebnis in DE und EN, `check-bilingual` und `npm run check` grün
- [ ] 5.2 | Skill-Stufen und Java/Spring-Aussage mit Belegen bestätigen | P2 | S | `assets/js/skills_matrix.js`, `assets/js/modules/skill-radar.js` | `HANDOFF.md:22` | Fertig wenn: Eigentümer hat Stufen bestätigt, Werte in beiden Dateien identisch, `npm run regen && npm run check` grün
- [ ] 5.3 | Lebenslauf-PDF und PowerPoint prüfen | P3 | S | `assets/pdf/Lebenslauf.pdf`, `assets/powerpoint/Max PPT Version3.pptx` | `HANDOFF.md:22`; `assets/pdf/README.md` beschreibt den Pfad | Fertig wenn: Inhalte vom Eigentümer freigegeben, `generate-sw-assets` und `check-sw-assets` grün

## 3. Vorgehen je Phase

- **Reihenfolge:** 1 → 2 → 3 → 4; Phase 5 unabhängig, sobald Inhalte vorliegen. Je Phase ein Branch `plan/phase-N`, je Maßnahme ein Commit mit ID im Titel (`fix(plan 2.1): …`), ein PR je Phase.
- **Test nach jeder Phase:** `npm run regen` (zuletzt), `npm run check`, `npm run test:coverage`, `npm run build:dist`, `npx playwright test --project=chromium` (volle Matrix in der CI); bei CSS (4.3) zusätzlich Workflow `visual.yml` und `E2E_ROOT=dist`. Lokal Port 8081 nutzen (`E2E_ROOT=./`, wegen fremdem Server auf 8080).
- **Rollback:** pro Phase ein Merge-Commit auf `main` → bei Fehler `git revert -m 1 <merge>`; nichts wird vor grünem CI gemergt. Generierte Dateien (`sw.js`, CSP-Hashes) nach Revert mit `regen` und `check-csp:fix` neu erzeugen.
- **Abhängigkeiten:** 2.3 braucht 2.2; 3.4 braucht 3.1–3.3; 1.5 und 3.4 brauchen Freigabe des Eigentümers; 4.3 erst nach 4.1, damit die Lighthouse-Basis bekannt ist.

## 4. Risiken und offene Fragen

- Auslagern aus klassischen Scripts (3.1–3.3) berührt Ladereihenfolge und globale Variablen; Fehler zeigen sich nur in E2E, nicht im Unit-Test. Gegenmittel: kleine Schritte, E2E nach jedem Commit.
- Änderungen an Inline-Scripts oder Seiten erzeugen neue CSP-Hashes und eine neue Cache-Version; `check-csp:fix` und `regen` gehören immer ans Ende.
- Breakpoint-Umbau (4.3) ist lokal nicht visuell prüfbar (Referenzbilder nur unter Linux); Fehler fallen erst in `visual.yml` auf.
- Die volle E2E-Matrix ist lokal speicherhungrig; Browser-Abstürze nicht mit Testfehlern verwechseln.
- Offen: Soll die Seiten-Script-Coverage (Phase 3) Ziel sein oder reichen E2E-Tests? Offen: Freigabe, die Schwellen anzuheben (1.5)? Offen: Inhalte aus Phase 5 und Zeitpunkt.
- `HANDOFF.md` (Root) und dieses `PLAN.md` (Root) widersprechen der Regel „neue Dokumente nach `docs/`“ in `CLAUDE.md`; Ausnahme ausdrücklich so gewünscht.

## Optional (ohne belastbaren Beleg oder bewusst zurückgestellt)

- `!important` in `style.css` (207 Zeilen) einzeln prüfen; bisher als Nutzer-Overrides/Reduced-Motion/Fokus/Druck eingestuft (`HANDOFF.md:17`).
- Einheitliche Dateinamen in `assets/js/modules/` (Mischung aus `project-freshness.test.js` und `project_freshness.spec.js`, `command_palette.test.js` und `qr-generator.test.js`).
- ADR-Nummern 0007 und 0011 fehlen in `docs/adr/`; Hinweis im Index ergänzen, falls gewollt.
- `style.css` (4 844 Zeilen) weiter nach Seiten aufteilen (ADR 0014), sobald Nutzung je Klasse belegt ist.
