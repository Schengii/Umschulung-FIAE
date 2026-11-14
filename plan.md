# Plan: Verbesserungen, Erweiterungen und Optimierungen

Stand: 2026-11-14, Analyse auf `main` (`a1867a6`), Version 1.5.0 plus `[Unreleased]`.

## Ausgangslage

Gemessen am 2026-11-14:

| Bereich | Wert |
| :-- | :-- |
| `npm run check` | grün (alle Check-Skripte, Lint, Prettier, Typecheck) |
| Unit-Tests | 806 in 71 Dateien, alle grün |
| Coverage (`assets/js/modules`) | 81 % Statements, 73 % Branches, 83 % Functions, 82 % Lines |
| E2E | 26 Specs, 4 Browser-Projekte plus Lauf gegen `dist/` (lokal nicht ausgeführt, letzter CI-Lauf grün) |
| Seiten | 26 unter `pages/` plus `index.html` und `404.html` |
| Projekte | 8 (`assets/data/projects.json`) |
| Lerninhalte | 63 Prüfungsfragen (nur Multiple Choice), rund 2 000 Kartei-Karten (nur Deutsch) |
| Repo-Größe | `.git` 281 MB, `Projekte/` 82 MB, `assets/` 33 MB |

Die technische Basis ist in gutem Zustand. Der größte Hebel liegt nicht mehr im Tooling, sondern im Inhalt: Die Umschulung ist seit Juli 2026 abgeschlossen, die Site ist jetzt ein Bewerbungsportfolio, viele Texte und Widgets stammen aber noch aus der Lernphase. Die Reihenfolge unten folgt diesem Befund.

Aufwand: **S** bis 2 Stunden, **M** bis 1 Tag, **L** mehrere Tage.

## Reihenfolge auf einen Blick

| Phase | Thema | Punkte |
| :-- | :-- | :-- |
| 0 | Offene PRs abschließen | 0.1 bis 0.4 |
| 1 | Glaubwürdigkeit und Aktualität | 1.1 bis 1.7 |
| 2 | Auffindbarkeit (SEO) | 2.1 bis 2.6 |
| 3 | Recruiter-Nutzen | 3.1 bis 3.5 |
| 4 | Lerninhalte | 4.1 bis 4.6 |
| 5 | Robustheit (PWA, Sicherheit) | 5.1 bis 5.6 |
| 6 | Tests und Codequalität | 6.1 bis 6.8 |
| 7 | CI, Repo und Abhängigkeiten | 7.1 bis 7.6 |
| 8 | Dokumentation | 8.1 bis 8.4 |

---

## Phase 0: Offene PRs abschließen

Vier PRs sind offen und blockieren zum Teil die Punkte weiter unten.

- [ ] **0.1 PR #67 (Personendaten reduzieren) grün bekommen und mergen.** (S)
  Der Job `quality` schlägt fehl, alle E2E- und Lighthouse-Jobs sind grün. Die Ursache ist nicht untersucht; naheliegend ist ein fehlendes `npm run regen` oder `npm run check-csp:fix` nach der HTML-Änderung. Der PR betrifft auch die Telefonnummer in `components.js` (WhatsApp-Link) und in `datenschutz.html`.
- [x] **0.2 PR #61 (Sync der Unterprojekte) entscheiden.** (S) Erledigt 2026-11-14: Diff geprüft (nur Informatik-lernen, ManuFaktur, EcoChef; keine Secrets, kein Quellcode privater Projekte), gemergt. Die zwei CodeQL-Meldungen liegen in den Unterprojekten (Testdatei und CORS-Lernsimulation) und gehören in deren Repos.
  Offen seit 2026-10-28, 100 geänderte Dateien, mergebar. Die von `pull_request` ausgelösten Läufe stehen auf `action_required`, der per `workflow_dispatch` gestartete CI-Lauf ist grün, der CodeQL-Check rot. Diff durchsehen, dann mergen oder schließen.
- [ ] **0.3 Ursache für `action_required` beheben.** (S) Vorbereitet 2026-11-14: `sync.yml` nutzt das optionale Secret `SYNC_PR_TOKEN`. **Offen beim Eigentümer:** fein begrenzten PAT anlegen (nur dieses Repo, Contents und Pull requests: Read and write) und als Repository-Secret `SYNC_PR_TOKEN` speichern.
  Der Sync-PR entsteht mit `GITHUB_TOKEN`, deshalb verlangt GitHub eine Freigabe der Läufe. Abhilfe: ein fein begrenzter PAT oder eine GitHub App als Token für `peter-evans/create-pull-request`. Dann laufen die PR-Checks von selbst, der Zusatzschritt `gh workflow run ci.yml` und die Berechtigung `actions: write` entfallen.
- [x] **0.4 Dependabot-PRs #65 und #68 mergen.** (S) Erledigt 2026-11-14.
- [x] **0.5 `updatedAt` privater Projekte stabil machen.** (S) Beim Durchsehen von #61 gefunden: Das Datum sprang bei jedem Sync auf die Laufzeit, der Sync-PR änderte sich dadurch täglich. Jetzt gilt das Datum des letzten Commits im Projektordner (`generate_projects_data.js`, mit Unit-Test).
- [ ] **0.6 Fehlalarme des Pre-Commit-Hooks.** (S) Ohne lokal installiertes gitleaks greift ein Shell-Fallback, der drei Dateien aus `Projekte/Informatik-lernen` als Secret meldet (Hook-Kommentar, Changelog-Zeile, Demo-Token eines OAuth-Labors). Das blockiert jeden lokalen Merge-Commit mit Konflikt nach einem Sync. Entscheidung beim Eigentümer: gitleaks lokal installieren (dann gilt `.gitleaks.toml`) oder den Fallback um dieselbe Pfad-Allowlist ergänzen.

---

## Phase 1: Glaubwürdigkeit und Aktualität

Diese Punkte sieht ein Recruiter als Erstes. Sie sind klein, wirken aber am stärksten.

- [ ] **1.1 Startseite ohne Namens-Schranke.** (M)
  `index.html` zeigt unter der Hauptdomain nur ein Formular „Bitte gib deinen Namen ein“. Suchmaschinen und Link-Vorschauen bekommen damit eine fast leere Seite, Besucher brauchen einen Klick mehr.
  Vorschlag: `index.html` wird die eigentliche Landingpage (Hero, drei stärkste Projekte, Kontakt), die Namenseingabe wandert als optionale Personalisierung ins Dashboard oder in den Footer.
  Betroffen: `index.html`, `pages/home.html`, `username-greeting.js`, `landing_page.spec.js`, `manifest.json` (`start_url`), `sitemap.xml`, `lighthouserc.json`.
  Abnahme: Der Aufruf von `/` zeigt Name, Rolle, Projekte und Kontakt ohne Interaktion.
- [ ] **1.2 Simulierte Dashboard-Daten durch echte ersetzen.** (M)
  `dashboard.html` zeigt „Umschulungs-Beiträge (Simuliert)“ (Zufallszahlen mit festem Seed aus `buildContributionData`) und „Code-Qualität & QA-Metriken (Simuliert)“ mit Vorgabewerten 85 / 92 / 80. Erfundene Zahlen schaden in einem Bewerbungsportfolio mehr, als sie nützen, auch wenn sie als simuliert gekennzeichnet sind.
  Vorschlag: Ein neues Skript `scripts/generate_site_stats.js` erzeugt `assets/data/site-stats.json` aus `git log` (Commits je Tag), der Vitest-Coverage, der Testanzahl und den Lighthouse-Werten. Das Raster zeigt die echte Commit-Historie (434 Commits), die Metrik-Karte die echten Messwerte. Der Rechner mit Schiebereglern kann als klar benanntes Rechenbeispiel bleiben. Check-Gate nach dem Muster von `check-search-index`.
- [ ] **1.3 Aussagen an die Messwerte anpassen.** (S)
  - `home.html` nennt „100% WCAG AAA & PWA“, das README „WCAG 2.1 AA“, die CI prüft Lighthouse-A11y ab 0,9. Auf die belegbare Aussage (WCAG 2.1 AA, axe-geprüft) vereinheitlichen.
  - Der „KI-Portfolio-Copilot“ ist ein Schlagwort-Abgleich gegen `KNOWLEDGE_BASE`. Umbenennen in „Portfolio-Assistent“ oder die Arbeitsweise im Widget offen benennen.
  - „100% datenschutzkonform“ am Kontaktformular durch eine konkrete Aussage ersetzen (keine Cookies, Versand über Web3Forms).
- [ ] **1.4 Veraltete Texte aus der Lernphase.** (S)
  Meta-Description, `og:description` und `twitter:description` von `home.html` werben mit einem „IHK-Prüfungs-Countdown“, den es nicht mehr gibt. Der Banner-Titel in `components.js` lautet „Meine Umschulung zum Fachinformatiker“. Alle Seiten auf Formulierungen aus der Lernphase prüfen und auf den Stand „abgeschlossen, auf Jobsuche“ bringen, ebenso `jobTitle` und `description` im JSON-LD.
- [ ] **1.5 News fortführen.** (S)
  Der neueste Eintrag in `news_data.js` ist vom 2026-07-06. Einträge zu v1.5.0, IHK-Kartei und neuen Projekten ergänzen. Zusätzlich das Datum als ISO-Feld speichern (`date: '2026-07-06'`) und die Anzeige daraus formatieren, statt `date_de` und `date_en` von Hand zu pflegen.
- [ ] **1.6 Datenschutzerklärung mit dem Code abgleichen.** (M)
  Es fehlen:
  - Abrufe der GitHub-API (`recruiter-filter.js`, `projekt-detail.js`), dabei geht die IP-Adresse an GitHub.
  - Die Spracheingabe im Interview-Trainer (`SpeechRecognition`); je nach Browser verarbeitet ein externer Dienst die Aufnahme.
  - Die Liste der `localStorage`-Schlüssel nennt 8 Einträge, `constants.js` kennt 34 (Leitner-Box, Prüfungsergebnisse, eigene Karten, Backup-Zeitpunkt, API-Cache).
  - Der QR- und `#sync=`-Abgleich des Lernstands.

  Dazu ein Test, der die im Text genannten Schlüssel gegen `STORAGE_KEYS` prüft (Muster: `progress-backup.test.js`). Rechtstexte bitte selbst gegenlesen, das ist keine Rechtsberatung.
- [ ] **1.7 Release 1.6.0 schneiden.** (S)
  `[Unreleased]` enthält rund 30 Einträge. Version in `package.json` anheben, Changelog-Abschnitt datieren, Git-Tag setzen.

---

## Phase 2: Auffindbarkeit (SEO)

- [ ] **2.1 Eigene `<h1>` je Seite im HTML.** (M)
  20 von 28 Seiten haben keine `<h1>` im Quelltext. Die einzige `<h1>` kommt per JavaScript aus `components.js` und ist auf allen Seiten gleich. Jede Seite bekommt ihre eigene statische `<h1>` (meist die heutige erste `<h2>`), der Banner-Titel wird ein `<p>`. `check-head` um die Regel „genau eine `<h1>`“ erweitern.
- [ ] **2.2 Projektseiten indexierbar machen.** (L)
  `projekt-detail.html?repo=…` entsteht vollständig im Browser und steht nicht in der Sitemap. Die acht Projekte sind damit für Suchmaschinen kaum sichtbar.
  Vorschlag: `generate_projects_data.js` schreibt je Projekt eine statische Seite `pages/projekte/<slug>.html` mit Titel, Beschreibung, Bild, `og:image` und JSON-LD (`SoftwareSourceCode` oder `CreativeWork`). ADR 0004 (Seiten von Hand) bleibt für die Inhaltsseiten bestehen; für generierte Daten-Seiten ein neues ADR.
- [ ] **2.3 Englische Fassung auffindbar machen.** (M)
  Die Sprache wird nur clientseitig umgeschaltet, es gibt keine eigene URL und kein `hreflang`. Kleinster Schritt: `?lang=en` in `components.js` vor dem ersten Paint auswerten, `<link rel="alternate" hreflang>` auf allen Seiten und in der Sitemap, `check-head` prüft das. Der Sprachschalter setzt den Parameter.
- [ ] **2.4 Saubere URLs.** (M)
  Kanonisch ist heute `https://www.max-schenk.tech/index.html`. `cleanUrls` und eine Weiterleitung von `/index.html` auf `/` in `vercel.json` prüfen, Canonical und Sitemap anpassen. Vorher klären, ob der Service Worker (Abgleich über `.html`) und die relativen Pfade damit zurechtkommen. Ergebnis als Nachtrag in ADR 0008.
- [ ] **2.5 Mehr strukturierte Daten.** (S)
  JSON-LD gibt es auf 6 Seiten. Ergänzen: `FAQPage` für die FAQ-Akkordeons (`ausbildungsablauf`, `kostentraeger`), `ItemList` der Projekte auf `portfolio.html`, `WebSite` auf der Startseite. Danach `npm run check-csp:fix`.
- [ ] **2.6 Vorschaubilder vereinheitlichen.** (S)
  Drei Seiten nutzen WebP als `og:image`, das zeigen nicht alle Plattformen an. Überall PNG oder JPG in 1200 × 630. `generate_og_image.js` kann je Seite ein Bild mit dem Seitentitel erzeugen. `check-head` prüft Format und Existenz der Datei.

---

## Phase 3: Recruiter-Nutzen

- [ ] **3.1 Fallstudien statt Kurzbeschreibungen.** (L)
  Je Projekt ein fester Aufbau: Ausgangslage, eigene Rolle, Architekturentscheidung, Ergebnis, Gelerntes, plus zwei bis drei Bildschirmfotos. Die Felder kommen in `portfolio-metadata.json`, `check-sync` prüft Vollständigkeit (DE und EN). Am ausführlichsten für das Abschlussprojekt EcoChef.
- [ ] **3.2 Diese Site als Projekt zeigen.** (M)
  Das Portfolio ist selbst das technisch stärkste Stück (CSP, PWA, 806 Tests, 15 ADRs), taucht aber in der Projektliste nicht auf. Eintrag in `staticProjects`, mit Verweis auf `architecture.html`. Die ADRs als lesbare Seite ausliefern (`docs/` steht heute in `.vercelignore`).
- [ ] **3.3 Startseite straffen.** (M)
  `home.html` hat 711 Zeilen und rund 15 Abschnitte, darunter „Was ist ein Fachinformatiker?“ und BFW-Informationen. Für Recruiter zählen Profil, Projekte, Skills, Kontakt. Die Erklärtexte zur Umschulung auf ihre eigenen Seiten verschieben und nur verlinken.
- [ ] **3.4 Navigation gruppieren.** (M)
  Die Navigation führt 23 Ziele. Vorschlag: „Profil“ (Über mich, Lebenslauf, Projekte), „Umschulung“ (Ablauf, BFW, Kostenträger, Praktikum), „Lernen“ (Kartei, Simulator, Cockpit, Trainer, Git), „Spielwiese“ (Spiele, Playground, Challenge Lab). Tastaturbedienung und `aria-expanded` mit testen.
- [ ] **3.5 Lebenslauf aus einer Quelle.** (M)
  `Lebenslauf.pdf` und `lebenslauf.html` werden getrennt gepflegt. Die PDF aus der HTML-Seite erzeugen (Playwright `page.pdf()` mit `print.css`) als `npm run generate-cv-pdf`, damit beide Stände gleich sind. Stand-Datum auf der Seite anzeigen.

---

## Phase 4: Lerninhalte

Die Lernwerkzeuge bleiben als Angebot für andere Umschüler und als Arbeitsprobe sinnvoll. Der Fragenpool ist dafür die schwächste Stelle.

- [ ] **4.1 Fragenpool vergrößern.** (L)
  63 Fragen auf 14 Themen, je Thema 3 bis 6. Ein Durchgang wiederholt sich nach wenigen Läufen. Ziel: mindestens 20 je Thema. Die Fragen in eine JSON-Datei auslagern (`assets/data/exam-questions.json`), mit Schema-Check wie `check-flashcards` (eindeutige IDs, gültiger `correct`-Index, DE und EN vorhanden, Erklärung nicht leer).
- [ ] **4.2 Neue Aufgabentypen.** (L)
  Heute gibt es nur Multiple Choice mit einer richtigen Antwort, die AP2 fragt überwiegend offen. Erweiterung in `ihk-exam-simulator.js` und `exam-statistics.js`:
  - Mehrfachauswahl mit Teilpunkten
  - Zuordnung und Reihenfolge (zum Beispiel OSI-Schichten, Projektphasen)
  - Rechenaufgaben mit Zahleneingabe und Toleranz (Subnetting, Speicherbedarf, Nutzwert)
  - Lückentext für SQL und Pseudocode mit Abgleich nach Normalisierung

  Ein Feld `type` am Fragenobjekt, die Auswertung je Typ als reine Funktion mit Vitest.
- [ ] **4.3 Leitner-Box auf fünf Stufen.** (M)
  `leitner-box.js` kennt drei Stufen mit 1, 3 und 7 Tagen. Bei 2 000 Karten kommt jede gelernte Karte damit wöchentlich wieder. Fünf Stufen (1, 3, 7, 14, 30 Tage) mit Migration der gespeicherten Stände; das Achievement „flashcard_master“ an die höchste Stufe binden.
- [ ] **4.4 Tageslimit und Sitzungen in der Kartei.** (M)
  Einstellbare Zahl neuer Karten je Tag, Sitzung mit Fortschrittsanzeige und Abschlussbild (richtig, falsch, nächste Fälligkeit).
- [ ] **4.5 Verlauf der Prüfungsergebnisse.** (M)
  Ein Liniendiagramm im Dashboard (SVG, ohne Bibliothek) zeigt die Quote über die Zeit und je Themengebiet. Vorher prüfen, ob die Ergebnisse je Lauf mit Datum gespeichert werden, sonst das Format erweitern.
- [ ] **4.6 Mündliche Prüfung im Cockpit ausbauen.** (M)
  `ihk-cockpit.js` hat mit 60 % die niedrigste Branch-Coverage der getesteten Kernmodule. Fragenkatalog erweitern, Musterantworten und Selbsteinschätzung ergänzen, Ergebnisse speichern (neuer Schlüssel in die Backup-Allowlist).

---

## Phase 5: Robustheit (PWA, Sicherheit)

- [ ] **5.1 Laufzeit-Cache des Service Workers begrenzen.** (M)
  `sw.js` legt jede erfolgreiche Antwort desselben Origins in den einen Cache, auch die Demos unter `Projekte/` (zusammen 82 MB) und `flashcards-extended.json`. Es gibt keine Obergrenze. Vorschlag: eigener Laufzeit-Cache mit Höchstzahl an Einträgen, Demos unter `/Projekte/` vom Caching ausnehmen oder getrennt begrenzen. Dazu `navigator.storage.estimate()` in der Dashboard-Karte „PWA Offline-Cache“ anzeigen.
- [ ] **5.2 Zeitlimit für Network-First.** (S)
  HTML wartet ohne Limit auf das Netz. Bei schlechter Verbindung hängt die Seite, obwohl eine Kopie im Cache liegt. Nach rund 3 Sekunden die Cache-Fassung liefern, zusätzlich `navigationPreload` aktivieren.
- [ ] **5.3 Unit-Tests für `sw.js`.** (M)
  Die Fetch-Logik ist nur über E2E abgedeckt. Die Entscheidungen (welche Strategie für welche Anfrage, Offline-Fallback, Cache-Bereinigung) in reine Funktionen ziehen und mit Vitest testen.
- [ ] **5.4 Header-CSP ohne `script-src 'unsafe-inline'`.** (M)
  Die Meta-CSP der Seiten ist streng, die Header-CSP in `vercel.json` erlaubt Inline-Skripte. Der Header schützt deshalb allein nichts, wo ein Meta-Tag fehlt (zum Beispiel in einer Demo unter `Projekte/`). Vorschlag: `verify_csp_hashes.js` schreibt die Vereinigung aller Hashes in den Header von `vercel.json` (generiert, mit Check), für `/Projekte/*` gilt eine eigene Regel. Nachtrag in ADR 0003.
- [ ] **5.5 Weitere Sicherheits-Header.** (S)
  `Cross-Origin-Opener-Policy: same-origin` ergänzen und gegen die Demos testen. `/.well-known/security.txt` anlegen und in `COPY_ENTRIES` aufnehmen.
- [ ] **5.6 Kontaktformular gegen Missbrauch härten.** (S)
  Der Web3Forms-Schlüssel ist öffentlich und nicht an die Domain gebunden (nur im Pro-Tarif möglich). Der Honeypot ist vorhanden. Ergänzen: Mindestzeit zwischen Seitenaufruf und Absenden, Sperre nach dem Absenden, Längenbegrenzung der Felder.

---

## Phase 6: Tests und Codequalität

- [ ] **6.1 Coverage auch für die Seiten-Scripts messen.** (M)
  `vitest.config.js` misst nur `assets/js/modules`. `assets/js/*.js` (rund 9 000 Zeilen, darunter `flashcards.js` 870, `interview.js` 822, `components.js` 807, `dashboard.js` 741) bleibt ungemessen. In die Messung aufnehmen, eigene niedrige Schwelle setzen und nach ADR 0015 hochziehen.
- [ ] **6.2 Module ohne oder mit wenig Tests.** (M)
  0 %: `praktikumsbetrieb-media.js` (449 Zeilen), `about-me-enhancements.js`, `blog-enhancements.js`, `impressum-enhancements.js`, `project-slideshow.js`. Unter 40 %: `timeline-scroll.js` (8 %), `portfolio-copilot.js` (18 %), `scroll-animations.js` (24 %), `c4-architecture.js` (24 %), `hero-section.js` (33 %), `premium-effects.js` (36 %).
  Reihenfolge nach Nutzen: Copilot (Antwortlogik), C4-Diagramm, Praktikums-Medien.
- [ ] **6.3 Große Seiten-Scripts weiter zerlegen.** (L)
  `flashcards.js`, `interview.js`, `dashboard.js` und `components.js` mischen Rendering, Zustand und Ereignisse. Nach dem Muster der Git-Engine (ADR 0011): Zustand und Regeln als reine Module, das Seiten-Script nur noch als Verdrahtung.
- [ ] **6.4 `strictNullChecks` als nächste Typ-Ratsche.** (L)
  `jsconfig.json` hat `strict: false`. Nach `noImplicitAny` ist `strictNullChecks` der Schritt mit dem größten Nutzen (viele `querySelector`-Ergebnisse). Vorgehen wie zuvor: Fehler zählen, Zahl als Obergrenze festschreiben, schrittweise auf 0.
- [ ] **6.5 Visuelle Regressionstests.** (M)
  Es gibt keinen `toHaveScreenshot`-Test, obwohl zwei Themes, mehrere Akzentfarben und vier A11y-Modi bestehen. Ein Spec für fünf Kernseiten in hell und dunkel, nur Chromium, mit eingefrorenen Animationen. Referenzbilder in der CI erzeugen (Linux), nicht lokal unter Windows.
- [ ] **6.6 ESLint-Globals aus dem Paket `globals`.** (S)
  `eslint.config.js` pflegt rund 45 Browser- und Node-Globals von Hand, deshalb der Umweg über `window.HTMLCanvasElement` (siehe CLAUDE.md). `globals.browser` für `assets/js`, `globals.node` für `scripts`, `globals.serviceworker` für `sw.js`. Danach die Sonderregel in CLAUDE.md streichen.
- [ ] **6.7 Rauschen in der Testausgabe entfernen.** (S)
  Die Unit-Tests schreiben mehrfach `DOMException: Failed to load iframe page` (happy-dom). In den betroffenen Tests die iframe-Navigation abschalten, damit echte Fehler auffallen.
- [ ] **6.8 Links nach außen prüfen.** (S)
  Die Quellenabschnitte verweisen auf DRV, Arbeitsagentur, DGUV und weitere. Ein wöchentlicher Workflow prüft externe Links und öffnet bei toten Links ein Issue (kein CI-Gate, weil fremde Server schwanken).

---

## Phase 7: CI, Repo und Abhängigkeiten

- [ ] **7.1 Repo-Größe entscheiden.** (M, Entscheidung beim Eigentümer)
  `.git` 281 MB. Im Arbeitsbaum liegen fünf Videos (17 MB), eine Präsentation (8 MB) und die Demo-Builds. Optionen: (a) so lassen, (b) Videos und Präsentation extern ausliefern und nur verlinken, (c) Git-LFS mit Umschreiben der Historie und Force-Push. Empfehlung: (b), weil ohne Eingriff in die Historie. Ergebnis als ADR.
- [ ] **7.2 E2E-Laufzeit senken.** (S)
  Ein CI-Lauf dauert rund 15 Minuten. Die Playwright-Browser über `actions/cache` (Schlüssel: Playwright-Version) zwischenspeichern.
- [ ] **7.3 Playwright-Sperre auflösen.** (M)
  `@playwright/test` ist auf 1.63.0 festgelegt, aktuell ist 1.65.1. Die Ursache der hängenden WebKit-Klicks auf `portfolio.html` in einem Test-PR eingrenzen. Wiedervorlage laut `dependabot.yml`: 2027-01-31.
- [ ] **7.4 Font Awesome 7 bewerten.** (M)
  6.7.2 ist installiert, 7.3.1 aktuell. Prüfen, ob das Subset-Skript die neuen Familien lesen kann, sonst die Sperre mit neuer Wiedervorlage verlängern.
- [ ] **7.5 Sync-Zeitplan und Doku angleichen.** (S)
  `sync.yml` läuft täglich (`0 4 * * *`), CLAUDE.md spricht von wöchentlich. Eines von beiden anpassen.
- [ ] **7.6 Einmal-Skripte aufräumen.** (S)
  `add_og_meta.js`, `fix_project_html_paths.js`, `localize_vendor_assets.js`, `audit_cleanup.js` und `install_sync_triggers.js` sehen nach Migrationshilfen aus. Prüfen, welche noch gebraucht werden, den Rest samt npm-Script und README-Zeile löschen. `compress_images.js` und `optimize_images.js` zusammenführen.

---

## Phase 8: Dokumentation

- [ ] **8.1 README an den Stand angleichen.** (S)
  „Über 20 Projekte“ (es sind 8), „Font Awesome 6.5.2“ (es ist 6.7.2), „KI-Portfolio-Copilot“ (siehe 1.3). Zahlen möglichst aus `site-stats.json` (Punkt 1.2) ableiten oder weglassen.
- [ ] **8.2 Changelog teilen.** (S)
  `CHANGELOG.md` hat 101 KB. Versionen vor 1.5.0 nach `docs/changelog-archiv.md` verschieben.
- [ ] **8.3 Neue ADRs.** (S je ADR)
  Für 2.2 (generierte Projektseiten), 5.1 (Cache-Grenzen), 5.4 (generierte Header-CSP) und 7.1 (große Dateien). Die Vault-Notiz „Umschulung-FIAE Portfolio – Übersicht“ nennt noch 12 ADRs, es sind 15.
- [ ] **8.4 `CONTRIBUTING.md` und `GEMINI.md`.** (S)
  `CONTRIBUTING.md` um den Ablauf „Änderung, `npm run regen`, `npm run check`, Changelog“ ergänzen. `GEMINI.md` auf CLAUDE.md verweisen lassen, statt Regeln doppelt zu führen.

---

## Bewusst nicht aufgenommen

- **Framework oder Bundler einführen.** ADR 0001 und 0006 begründen den Verzicht, die Messwerte (Lighthouse-Performance ab 0,8 als hartes Gate) geben keinen Anlass.
- **Datei-Hashes in Asset-Namen.** Das würde HTML-Referenzen umschreiben und die CSP-Hashes brechen (ADR 0001, 0003). Der Inhalts-Hash im Cache-Namen (ADR 0010) löst das Problem bereits.
- **Backend für Lernstände.** Der QR- und `#sync=`-Abgleich reicht, ein Server brächte Datenschutz- und Betriebsaufwand.
- **Englische Übersetzung der 2 000 Kartei-Karten.** Die IHK-Prüfung ist deutsch, der Nutzen ist gering.

## Arbeitsweise für die Umsetzung

Je Punkt ein eigener Branch und PR. Nach jeder Änderung an HTML, CSS oder JS: `npm run regen`, dann `npm run check`, zuletzt ein Eintrag in `CHANGELOG.md`. Neue `localStorage`-Schlüssel in die Backup-Allowlist, neue Texte in DE und EN.
