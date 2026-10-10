# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/)
und dieses Projekt hält sich an [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unveröffentlicht]

### Hinzugefügt (Added)
- Screenshots (Dashboard, DNS-Privacy-Lab) in `docs/screenshots/` und im README.
- `LICENSE` (MIT) und Feld `license` in `package.json`; Hinweis im README.

### Geändert (Changed)
- Schriften (Inter, Outfit, Fira Code, Atkinson Hyperlegible) werden lokal über `@fontsource/*` ausgeliefert (`src/styles/fonts.css`) statt per `@import` von Google Fonts – keine Drittanbieter-Anfrage mehr, passend zur DSGVO-Aussage im README.

### Behoben (Fixed)
- 43 Komponenten (u. a. `ActivityHeatmapWidget`, `PomodoroTimerWidget`, `AudioSettingsModal` und viele Labs) nutzen Tailwind-Utility-Klassen, für die es kein CSS gab und die daher ungestylt dargestellt wurden. `tailwindcss` + `@tailwindcss/vite` liefern jetzt nur Theme und Utilities (`src/styles/tailwind.css`, ohne Preflight-Reset und ohne `@layer`, damit der Reset in `global.css` die Abstands-Utilities nicht überschreibt); `global.css` bleibt unverändert und wird danach geladen.

## [3.75.0] - 2026-10-07

### Hinzugefügt (Added)
- Lab-Fortschritt: `labProgressEngine.js` (+ Tests) und Store-Aktionen `recordLabVisit`/`recordLabCompletion`. Besuche und Abschlüsse je Lab werden im Spielstand (`labProgress`) gespeichert.
- `LabsDashboard`: Fortschrittsbalken, „Empfohlene nächste Schritte“ (je Berufsfilter, einfach → schwer, begonnene zuerst) und „Abgeschlossen“-Marker auf den Lab-Karten. Der Berufsfilter nutzt jetzt `matchesCareer` aus der Engine.
- `npm run new-lab`: Scaffold für neue Labs (Engine, Test, Komponente und Einträge in `labRegistry.js`/`labModulesData.js`).
- `npm run docs:labs`: erzeugt `docs/LABS.md` automatisch aus `labModulesData.js`.

### Geändert (Changed)
- Lab-Dashboard listet jetzt alle 229 Labs (vorher 143): 86 Labs, die nur über Navbar/Command-Palette erreichbar waren, haben Einträge in `LAB_MODULES` (Titel/Beschreibung aus der Navbar, Kategorie per Schlüsselwort – bei Gelegenheit nachschärfen). Neuer Test in `labModulesData.test.js`: Jedes Registry-Lab muss im Dashboard gelistet sein.
- Coverage-Schwellen in `vite.config.js` auf den Ist-Stand angehoben (Statements 56→60, Branches 48→52, Functions 39→45, Lines 58→62 %).
- Lab-Prüfungsdrills (`IhkDrillPanel`) schreiben ihre Auswertung ins Fehlerjournal. Die Drill-Fragen sind in `src/data/drillQuestions.js` registriert, sodass das Dashboard-Widget sie wiederholen kann (inkl. Erklärung); Journal-Einträge ohne auffindbare Frage werden nicht mehr mitgezählt. Neues optionales Prop `xpAmount` (`null` = keine XP-Hinweise).
- Neue geteilte Komponente `Shared/LabDrillSection` (einklappbarer Drill ohne XP-Hinweise, rendert die Fragen erst beim Aufklappen).
- Weitere Drills für `WisoAndlerLab` (Optimale Bestellmenge) und `WisoContributionMarginLab` (Deckungsbeitrag/BEP), je 5 Fragen, per Test gegen die Engines abgesichert.
- Neue Drills für `RaidCalculatorLab` (5 Fragen) und `WisoLiquiditaetLab` (4 Fragen); die Rechenbeispiele sind per Test gegen die jeweilige Engine abgesichert.
- Backup-Import robuster: `sanitizeImportedState` prüft Typen je Feld, berechnet das Level aus den XP neu und lehnt fremde JSON-Dateien, Arrays und leere Objekte ab, statt den Fortschritt mit Standardwerten zu überschreiben. Der Export und das Kopieren in die Zwischenablage sichern vorher ein ausstehendes, gebündeltes Schreiben (Tests: `storageImport.test.js`, `BackupModal.test.jsx`).
- `README.md` von ca. 2100 auf wenige Dutzend Zeilen verschlankt; die bisherige Fassung liegt unverändert in `docs/README-Archiv.md`.
- `package.json`-Version von `0.0.0` auf `3.75.0` synchronisiert.

## [3.74.0] - 2026-10-07

### Hinzugefügt (Added)
- **4 Neue IHK-Kern-Labs & Simulatoren**:
  - `src/components/Content/StpProtocolLab.jsx` & `src/utils/stpProtocolEngine.js`: IEEE 802.1D / 802.1w Spanning Tree Protocol (STP & RSTP) Studio mit Root-Bridge-Wahl (Priority + MAC), Pfadkosten (10G=2, 1G=4, 100M=19, 10M=100), Port-Rollen (Root Port, Designated Port, Alternate/Blocking Port), Loop-Erkennung, Link-Failure & Konvergenzzeitvergleich (STP 30-50s vs. RSTP <1s Proposal/Agreement), Cisco IOS CLI-Konfigurationsgenerator und IHK-Prüfungsdrill (+55 XP).
  - `src/components/Content/BpmnProcessLab.jsx` & `src/utils/bpmnProcessEngine.js`: OMG BPMN 2.0 Geschäftsprozessmodellierung & Swimlanes Studio für FIDP, Kaufleute IT-Systemmanagement und FIAE mit Startereignissen, Endereignissen, Tasks, Gateways (Exklusiv XOR, Parallel AND, Inklusiv OR), Pools & Swimlanes, interaktivem Token-Simulations-Tracer und IHK-Konformitäts-Linter (+55 XP).
  - `src/components/Content/BackupStrategyLab.jsx` & `src/utils/backupStrategyEngine.js`: IHK Backup-Strategien & Disaster Recovery Studio mit interaktivem Speicherbedarfs- & Restore-Ketten-Kalkulator (Voll- vs. Differenzielle vs. Inkrementelle Sicherung), Großvater-Vater-Sohn 20-Medien-Rotationsrechner, BSI 200-4 RTO/RPO Business Impact Ausfallkostenrechner und 3-2-1-1-0 Ransomware-Resilienz-Audit (+55 XP).
  - `src/components/Content/WisoSachmaengelLab.jsx` & `src/utils/wisoSachmaengelEngine.js`: IHK WISO Sachmängelhaftung & Gewährleistung Studio mit interaktivem Mangelarten-Katalog (§ 434/435 BGB: Beschaffenheit, Montage, IKEA-Klausel, Aliud, Mindermenge, Rechtsmangel), vorrangigem Nacherfüllungs-Prüfer (§ 439), nachrangigen Rechten (Rücktritt, Minderung, Schadensersatz), beiderseitigem Handelskauf (HGB § 377 unverzügliche Rügepflicht & Genehmigungsfiktion) vs. Verbrauchsgüterkauf (BGB § 477 Beweislastumkehr 1 Jahr) und IHK-Prüfungsdrill (+55 XP).
- **Registrierung & Routing**:
  - Alle 4 neuen Labs nahtlos in `src/data/labRegistry.js` und `src/data/labModulesData.js` mit Tags, Beschreibungen, Icons und Direkt-Tabs (`stp_protocol_lab`, `bpmn_process_lab`, `backup_strategy_lab`, `wiso_sachmaengel_lab`) registriert.
- **Test-Suite & Entwicklungs-Qualität**:
  - 4 neue isolierte Unit-Test-Suiten (`stpProtocolEngine.test.js`, `bpmnProcessEngine.test.js`, `backupStrategyEngine.test.js`, `wisoSachmaengelEngine.test.js`) mit 18 neuen Tests.
  - Vollständige Test-Suite auf 196 Test-Dateien und 1135 Tests erweitert (100% bestanden).
  - Alle 235 Lab-Komponenten in `allLabsSmoke.test.jsx` und 234 axe-core Accessibility-Tests (WCAG 2.1 AA) erfolgreich validiert.
  - `npm run lint:ci` (oxlint) 0 Warnungen und 0 Fehler.
  - `npm run typecheck` (tsc --noEmit) 0 Fehler.
  - `npm run size` (size-limit) alle Bundles innerhalb der Grenzwerte (< 105 KB App Shell).

## [3.73.0] - 2026-10-06

### Hinzugefügt (Added)
- **5 Neue IHK-Kern-Labs & Simulatoren**:
  - `src/components/Content/StruktogrammLab.jsx` & `src/utils/struktogrammEngine.js`: DIN 66261 Nassi-Shneiderman Struktogramm Studio mit interaktiver Symboldarstellung (Sequenz, IF-THEN-ELSE, WHILE, FOR), Variablen-Tracing-Player und IHK-Prüfungsdrill.
  - `src/components/Content/DatabaseNormalizationLab.jsx` & `src/utils/databaseNormalizationEngine.js`: Relationale Datenbank-Normalisierung & Anomalien Studio mit stufenweiser Dekomposition (1NF, 2NF, 3NF), Live-Demonstration von Insert-, Update- und Delete-Anomalien und Prüfungsdrill.
  - `src/components/Content/NatPatSimulatorLab.jsx` & `src/utils/natPatEngine.js`: IPv4 NAT/PAT Simulator mit RFC 1918 Analyzer, dynamischer Port Address Translation, Connection Tracking Table Inspection und animiertem Paketfluss.
  - `src/components/Content/VlanTrunkingLab.jsx` & `src/utils/vlanTrunkingEngine.js`: IEEE 802.1Q VLAN Trunking Studio mit Bit-genauer 4-Byte Tag Dissektion (TPID, PCP, DEI, VID), Access/Trunk Switching Simulation und Router-on-a-Stick Cisco IOS Konfigurationsgenerator.
  - `src/components/Content/UsvCalculatorLab.jsx` & `src/utils/usvCalculationsEngine.js`: USV-Dimensionierung & Rechenzentrums-Energie Studio mit Wirk-/Schein-/Blindleistungs-Berechnung ($\cos\varphi$), Autonomiezeit-Rechner mit Peukert-/Wirkungsgrad-Modell, PUE-Metriken und USV-Topologien (VFD, VI, VFI).
- **Registrierung & Routing**:
  - Alle 5 neuen Module nahtlos in `src/data/labRegistry.js` und `src/data/labModulesData.js` mit Tags, Beschreibungen und Icons registriert.
  - Alle 5 Labs über direkte URLs/Tabs (`struktogramm_lab`, `db_normalization_lab`, `nat_pat_lab`, `vlan_trunking_lab`, `usv_calculator_lab`) erreichbar.
- **IHK Prüfungs-Simulator Erweiterung**:
  - 20 neue praxisorientierte IHK-Prüfungsfragen zu Kerninhalten (Struktogramme, Normalformen, NAT/PAT, VLAN, USV/PUE) in `src/data/examData.js` hinzugefügt (Pool von 31 auf 51 Fragen erweitert).
  - Lesezeichen-Funktion ("Bookmark/Merken") zum Markieren kniffliger Fragen für spätere Durchsicht.
  - Filter-Buttons im Simulator (Alle, Markiert, Offen).
  - Detaillierte Ergebnis-Aufschlüsselung nach IHK-Wissensgebieten und Themenbereichen.
- **Labs-Dashboard & Berichtsheft-Generator**:
  - Berufsfeld-Filterbar in `src/components/Content/LabsDashboard.jsx` (Alle, AP1 Kern, FIAE, FISI, IT-SE, WISO).
  - Integrierter 1-Klick IHK-Berichtsheft Wochennachweis Generator für Azubis mit formatiertem Text-Export.
- **Entwicklungs-Tooling**:
  - Neuer npm-Befehl `"test:fast": "vitest run --isolate=false"` für ultraschnelle (~14s) lokale Testläufe von 191+ Testdateien.
  - 10 neue isolierte Unit- und UI-Testdateien (`struktogrammEngine.test.js`, `StruktogrammLab.test.jsx`, `databaseNormalizationEngine.test.js`, `DatabaseNormalizationLab.test.jsx`, `natPatEngine.test.js`, `NatPatSimulatorLab.test.jsx`, `vlanTrunkingEngine.test.js`, `VlanTrunkingLab.test.jsx`, `usvCalculationsEngine.test.js`, `UsvCalculatorLab.test.jsx`, `ExamSimulator.test.jsx`).

### Behoben (Fixed)
- Behebung ungenutzter Importe und Parameter zur Einhaltung strenger `oxlint` CI-Regeln (`npm run lint:ci` mit 0 Fehlern und 0 Warnungen).

### Hinzugefügt (Added)
- **Interaktionstests für die vier größten IHK-Rechenlabs** (44 Tests): `WisoAngebotsvergleichLab`, `WisoKalkulationLab`, `TestverfahrenLab` und `DhcpDoraLab` prüfen jetzt Bedienung, angezeigte Rechenergebnisse (Skonto-Effektivzins, Kalkulationsschema, Nutzwert, Netzplan, Äquivalenzklassen, McCabe, DORA-Zustände) und einmalige XP-Vergabe. Bisher wurden diese Labs nur gerendert (Smoke/axe).
- **`src/components/Shared/IhkDrillPanel.jsx`**: gemeinsamer IHK-Prüfungsdrill (Multiple Choice, Auswertung, Wiederholen) für DHCP-, Testverfahren- und Angebotsvergleich-Lab; ersetzt drei identische Kopien.

### Geändert (Changed)
- **Lab-Routing vollständig auf `src/data/labRegistry.js` umgestellt**: 210 Labs aus der `activeLabElement`-Switch-Tabelle in die Registry migriert; `App.jsx` schrumpft von 1222 auf 592 Zeilen (210 `lazy`-Imports entfallen). In `App.jsx` bleiben nur Tabs, die App-Zustand brauchen (Labs-Übersicht, Kampagne, Lernplan, Schwachstellen-Audit, Roadmap, Prüfungssimulator).
- `App.routing.test.jsx` rendert jetzt zusätzlich alle Registry-Tab-IDs (vorher waren die Registry-Labs von diesem Test nicht abgedeckt); der Registry-Ladetest lädt die Module parallel.
- `WisoAngebotsvergleichLab`: doppelter Anbieter-Block als lokale Komponente `AngebotKalkulation` zusammengefasst.
- Dev-Abhängigkeiten gemeinsam aktualisiert: `vitest` + `@vitest/coverage-v8` auf 5.0.2, `size-limit` + `@size-limit/file` auf 14.1.0. `engines.node` auf `>=22.19.0` angehoben (Anforderung von size-limit 14). Lint, Typecheck, 1634 Tests, Coverage, Build und Size-Check bestanden.

### Behoben (Fixed)
- **Sentry startete nie** (`src/utils/errorMonitoring.js`): Der Import über einen Variablen-Pfad mit `@vite-ignore` landete mit gesetzter `VITE_SENTRY_DSN` wörtlich als `import("@sentry/react")` im Bundle, den der Browser nicht auflösen kann. Jetzt statischer Pfad im dynamischen `import()` – Sentry wird als eigener Chunk geladen; ohne DSN bleibt der Code weiterhin komplett aus dem Build entfernt.
- **Toter Alias `dnssec_lab`**: war sowohl dem DNSSEC-Validation- als auch dem DNSSEC-Rollover-Lab zugeordnet; die Rollover-Zuordnung war nie erreichbar und wurde entfernt (`dnssec_lab` öffnet wie bisher das Validation-Lab).
- **Vercel-Preview-Deployments schlugen fehl** (`.github/dependabot.yml`): Dependabot bumpte `@vitest/coverage-v8` bzw. `size-limit` / `@size-limit/file` einzeln, wodurch `npm ci` an Peer-Dependency-Konflikten (`ERESOLVE`) scheiterte. Die Gruppe `lint-and-test` erfasst nun auch `@vitest/*`, neue Gruppe `size-limit` bündelt `size-limit` und `@size-limit/*`.

---

## [3.72.0] - 2026-10-03

### Hinzugefügt (Added)
- **RFC 2131 DHCP DORA & Relay-Agent Studio** (`DhcpDoraLab.jsx` & `src/utils/dhcpDoraEngine.js`):
  - Vollständiger Zustandsautomat für DHCP-Clients (`INIT`, `SELECTING`, `REQUESTING`, `BOUND`, `RENEWING`, `REBINDING`).
  - Interaktiver 4-Way DORA Handshake (Discover -> Offer -> Request -> Ack) mit Wireshark-ähnlicher Paket-Dissektion (XID, CIADDR, YIADDR, GIADDR, DHCP-Optionen 53, 1, 3, 6, 51, 58, 59).
  - Visuelle Timeline für Lease-Lifecycle: T1 (50% Renewal per Unicast an leasing Server), T2 (87.5% Rebind per Broadcast) und DHCP-Release.
  - Simulation von DHCP Relay Agents (`GIADDR`) zur Weiterleitung über Subnetzgrenzen hinweg (+55 XP).
  - 7 dedizierte Unit-Tests (`src/utils/dhcpDoraEngine.test.js`).
- **IHK Software-Testverfahren & Grenzwertanalyse Studio** (`TestverfahrenLab.jsx` & `src/utils/testverfahrenEngine.js`):
  - Black-Box-Äquivalenzklassenbildung (GÄK & UÄKs) mit Live-Eingabetester für typische IHK-Prüfungsszenarien (Altersgrenzen, Rabattstaffeln, Passwörter).
  - 6-Punkte Grenzwertanalyse ($min-1, min, min+1, max-1, max, max+1$) mit Status- und Fehlerfall-Erklärung.
  - McCabe Zyklomatische Komplexität ($M = E - N + 2P$) mit Risikoklassifizierung (Clean Code) und Kontrollfluss-Überdeckungsmetriken (C0, C1, C2) (+55 XP).
  - 6 dedizierte Unit-Tests (`src/utils/testverfahrenEngine.test.js`).
- **IHK WISO Angebotsvergleich & Skontorechner Studio** (`WisoAngebotsvergleichLab.jsx` & `src/utils/wisoAngebotsvergleichEngine.js`):
  - Quantitativer Angebotsvergleich mit vollständigem kaufmännischen Kalkulationsschema (Listeneinkaufspreis $\rightarrow$ Rabatt $\rightarrow$ Zieleinkaufspreis $\rightarrow$ Skonto $\rightarrow$ Bareinkaufspreis $\rightarrow$ Bezugskosten $\rightarrow$ Bezugspreis) mit interaktiver 2-Anbieter-Gegenüberstellung.
  - Skonto vs. Kontokorrentkredit: Exakte Berechnung des effektiven Jahreszinssatzes ($p_{\text{eff}} = \frac{\text{Skontosatz} \times 360}{\text{Zahlungsziel} - \text{Skontofrist}}$), Gegenüberstellung mit dem Bankkreditzins, Ersparnisberechnung in Euro und IHK-Musterentscheidungsbegründung.
  - Qualitativer Angebotsvergleich: Scoring-Matrix mit Gewichtung und Nutzwertanalyse (+55 XP).
  - 6 dedizierte Unit-Tests (`src/utils/wisoAngebotsvergleichEngine.test.js`).
- **404 Not Found View & Routing-Robustheit** (`src/components/NotFoundView.jsx`):
  - Dedizierte 404-Fehleransicht bei ungültigen Pfaden mit Direktnavigation zum Dashboard und Suchfunktion.
  - Trailing-Slash-Toleranz in allen Routen (z. B. `/nwa_scoring_lab/`).
- **Persistente UI-Präferenzen** (`src/utils/uiPreferences.js`):
  - Theme, Schriftgröße, Dyslexie-, Farbenblindheits-, Kontrast- und Reduced-Motion-Modus werden unter `informatik_game_ui_prefs_v1` gespeichert und überstehen Reloads.
- **Multi-Tab Synchronisation**:
  - BroadcastChannel (`it_devgame_sync`) und Storage Event Synchronisation in `src/store/useStore.js` für tab-übergreifende Synchronisierung von XP, Streaks und Badges.

### Sicherheit (Security)
- **Web Worker Code-Sandbox** (`src/utils/sandboxRunner.js`, `src/utils/sandbox.worker.js`, `src/utils/sandboxEvaluator.js`):
  - Nutzercode in Coding-Challenges wird nicht mehr im UI-Haupt-Thread ausgeführt, sondern in einem isolierten Web Worker mit 3s Timeout-Schutz.
  - Automatische Terminierung von Endlosschleifen via `worker.terminate()`.
  - Blockierung gefährlicher Browser-APIs (`fetch`, `XMLHttpRequest`, `WebSocket`, `localStorage`, `IndexedDB`).
  - Migration von `codingChallengesEngine.js` auf asynchrone Schnittstelle.

### Behoben (Fixed)
- **PWA Update Toast**: Verhindert irrtümliche "Update verfügbar"-Meldung beim allerersten Seitenaufruf; Meldung erscheint nur bei echtem Service-Worker-Update.
- **Sentry Integration**: Dynamischer Import in `src/utils/errorMonitoring.js` gegen Vite-Statik-Auflösung und TypeScript-Typkonflikte abgesichert.

---

## [3.71.0] - 2026-09-28

### Hinzugefügt (Added)
- **Fehlerjournal & Spaced-Repetition-Review** (`src/utils/mistakeJournalEngine.js`, `MistakeReviewWidget.jsx`):
  - Falsch beantwortete Prüfungsfragen wandern mit Intervallen (1, 3, 7, 14, 30 Tage) ins Journal.
  - Dashboard-Widget mit Mini-Quiz zur gezielten Wiederholung.
- **Zentrale Lab-Registry** (`src/data/labRegistry.js`):
  - Datengetriebene Registrierung und dynamisches Laden von Modulen ohne monolithischen Switch-Block.
- **Automatische Barrierefreiheits-Labels** (`src/utils/a11yAutoLabel.js`):
  - Kontextbasierte Benennung unbeschrifteter Steuerelemente zur Laufzeit.
  - Neuer Axe-Core-A11y-Test für alle Module (`allLabsA11y.test.jsx`).

### Behoben (Fixed)
- **Kritisch: Lade-Skeleton blockierte Klicks** (`index.html`):
  - Skript-Positionierung hinter `#root` korrigiert, sodass Skeleton zuverlässig entfernt wird.
- **Streak-Berechnung** (`src/utils/storage.js`):
  - Lokale Datumsschlüssel (`toLocalDateKey`) und DST-sichere Tagesdifferenz-Berechnung.
- **Tote Dashboard-Routen**:
  - Aliase für `bigo`, `gitvisual`, `k8s`, `pkce`, `pythonwasm`, `ragai`, `regexmaster`, `sqldungeon` nachgepflegt.

---

## [3.70.0] - 2026-09-15

### Hinzugefügt (Added)
- **RFC 793 TCP State Machine & 3-Way Handshake Studio** (`TcpStateMachineLab.jsx` & `src/utils/tcpStateMachineEngine.js`):
  - Vollständiger Zustandsautomat für Client & Server (`CLOSED`, `LISTEN`, `SYN_SENT`, `ESTABLISHED`, `FIN_WAIT`, `TIME_WAIT` etc.).
  - 3-Way Handshake und 4-Way Teardown mit manueller Paket-Injektion (SYN, ACK, PSH+ACK, RST).
- **Prometheus Alertmanager & PromQL Alert Rule Evaluator Studio** (`SreSloBurnLab.jsx` & `src/utils/sreSloBurnEngine.js`):
  - Alert State Machine (`INACTIVE` -> `PENDING` -> `FIRING`) mit `for`-Timer-Simulation und Template-Auflösung.
- **IHK WISO BAB II & Zuschlagskalkulation** (`WisoBabLab.jsx` & `src/utils/wisoBabEngine.js`):
  - Betriebsabrechnungsbogen II mit Kostenüberdeckung / Kostenunterdeckung pro Kostenstelle.

---

## [3.69.0] - 2026-09-01

### Hinzugefügt (Added)
- **IHK WISO Arbeitsrecht & Kündigungsfristen-Kalenderrechner** (`WisoLaborLawLab.jsx` & `src/utils/wisoLaborLawEngine.js`):
  - Kalendarische Fristenberechnung nach BGB § 622 und KSchG § 4 (3-Wochen-Klagefrist).
- **IPv6 Subnetting & Nibble-Boundary Studio** (`Ipv6RoutingLab.jsx` & `src/utils/ipv6Routing.js`):
  - Adressplanung nach RFC 4291, RFC 4862 (SLAAC) und RFC 6164.

---

## Frühere Versionen

Für eine detaillierte Auflistung aller Versionen vor Version 3.69.0 siehe den Abschnitt **Änderungshistorie & Entwicklungsdokumentation** in [README.md](README.md).
