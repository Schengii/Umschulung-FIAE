# Handoff (Stand 2026-11-25, letzter Commit c649c1d auf origin/main)

## Ziel
IT-DevGame testen und verbessern: Design/Mobile prüfen, Lernpfad und Prüfungsplan bauen, Inhalte (Fachwissen, Übungen, Lektionen) erweitern und mit Quellen belegen.

## Erledigt (alles committet und gepusht)
Frühere Sitzungen:
- Einstufungstest und Tages-Lernmix, Lernpfad „Empfohlen für dich“ (Phase 1 bis 3), adaptiver 4-Wochen-Prüfungsplan.
- 21 Labs am Fehlerjournal, Drill-Absturz in 5 Labs behoben, Mobile/Design-Fixes, Golden-Tests.

Diese Sitzung (Inhalte):
- **Prüfungsfragen** (`examQuestionsExtra.js` IDs 52–71, `examQuestionsFachrichtungen.js` IDs 72–101): Security, WiSo, PM, Cloud, SQL sowie je 10 Fragen für FIDP, FIDV und ITSE. Neues optionales Feld `source: { label, url }`, im `ExamSimulator` als Link angezeigt, `contentIntegrity.test.js` prüft es.
- **Drills** (`labDrillsIhk.js`, 40 Fragen) für dguv_v3_lab, bsi_grundschutz_lab, ihk_dpia_lab, ihk_tom_catalog_lab, cpm_network, nwa_scoring, tco_roi_lab, itsm_simulator; in `drillQuestions.js` angebunden, im Lab als einklappbare `LabDrillSection` (ohne XP).
- **Kurse & Wissen**: `kurseWissenExtra.js` (KI-Masterclass +6 Module mit Quellenlink, Praxisprojekte +5, Web Components +3, Sprachen SQL und Bash), `flashcardsExtra.js` (Karten 21–52), 8 neue Kampagnen-Quests. Praxisprojekte hatten kein `icon`/`estimatedTime`, nachgetragen.
- **Einsteiger-Kurs**: `anfaengerGuides.js`, 12 statt 4 Kapitel mit Selbsttest; `**fett**` wurde als Sternchen angezeigt, behoben.
- **Systemarchitektur**: `architectureData.js`, `availabilityEngine.js` (typgeprüft, Golden-Tests), fünf Bereiche inkl. Verfügbarkeitsrechner.
- **Notizen**: `notebookTemplates.js` (12 Spickzettel-Vorlagen), `markdownLite.js` (Markdown-Vorschau, vorher roher Text).
- **Vertiefung statt Neues (Wunsch des Nutzers)**: `vertiefungData.js` und `vertiefungDataPraxis.js` vertiefen die bestehenden Einträge (Einsteiger 1-4, KI 1-4, Lit/Vaadin/native WC, 3 Projekte, 5 Kampagnenkapitel) und ergänzen 20 Fachthemen in den 7 Sprachen. Anzeige über `Shared/DeepDive.jsx` und `Shared/MarkdownView.jsx`. Zusätzlich in `vertiefungDataRest.js`: Einsteiger-Kapitel 5-12, alle 10 Architektur-Komponenten, SQL- und Bash-Fachthemen, Zusatzwissen `more` für Karteikarten 1-20 (Anzeige im Karteikarten-Modal). Nicht vertieft: Karteikarten 21-52, KI-Module 5-10, Projekte 4-8, Web-Components 4-6, Architekturmuster/-prinzipien (sind bereits detailliert).
- Gemeinsame Komponente `Shared/SelfTestQuiz.jsx` (Einsteiger-Kurs und Architektur).
- Letzter Lauf: `lint:ci`, `typecheck`, `npm test` (257 Dateien, 2487 Tests), `build`, `size` (alle Limits eingehalten) und `e2e` (63 von 63) grün; `npm audit` und Lighthouse liefen nur in der CI-Konfiguration, nicht lokal.

- **Theorie-Ausbau (Wissen-Tab)**: Nutzer will in Kurse & Wissen den gesamten Theorieteil. Artikel liegen in `src/data/topics/<id>.js` (Metadaten in `topicsData.js`, Abbildungen `src/assets/topics/*.svg`). Alle zwölf abgestimmten Lücken sind geschlossen: Block 1–6 (Hardware, Elektrotechnik/USV, Betriebssysteme, Netzwerkdienste, IT-Sicherheit im Betrieb, ITSM) vertieft, Block 7–12 neu (devops_container_cicd, softwarearchitektur_microservices, datenanalyse_statistik_ml, iiot_industrie40, beschaffung_bilanz_zahlungsverkehr, qualitaet_dokumentation_fachgespraech). Eine Stichprobenprüfung der riskantesten Angaben (per Websuche, überwiegend Sekundärquellen) ist erfolgt und hat neun Korrekturen ergeben (ISO 25010:2023 mit neun Merkmalen, DORA-Kennzahlen, Spannungsfall 4 %/3 %, Stundenrahmen der IHK-Projektarbeit, E-Rechnung-Fristen, MTBSI u. a.). Ungeprüft blieben der Wortlaut von § 288 BGB und § 14 UStG, die Seitenvorgabe der Projektdokumentation (IHK-abhängig) sowie die Normen selbst (DIN VDE, ISO, IEC kostenpflichtig). Das Prüfdatum im Artikel steht für Link-Erreichbarkeit.

## Entscheidungen
- Berufsfilter liegt im Spielstand (`careerFilter`), Wochenstunden 3/6/10, letzte 14 Tage vor der Prüfung nur Festigen.
- Lernwerkzeuge ohne Prüfungsbereich (15 Labs) bleiben ohne Schwächen-Signal und außerhalb des Plans.
- **Alias-Bereinigung der Lab-IDs bewusst nicht umgesetzt**: `tabs[0]` ist die kanonische ID, die übrigen Einträge sind Aliase. Ein Umbau würde alte Spielstände und Links gefährden. Nur auf Wunsch neu aufgreifen.
- Neue Inhalte liegen in eigenen `*Extra`-Dateien und werden in die bestehenden Listen gespreadet (Basisliste als `BASE_*`).
- Drill-Format hat kein Quellenfeld, Quellen stehen dort nur als Name im Erklärtext. Ein Quellenfeld für Drills wurde abgelehnt.
- Konzeptnotizen liegen im Vault unter `01 Projects/Informatik-lernen/`.

## Offene Punkte
- **Quellen nicht geprüft**: Alle Fachinhalte und Links (arXiv, OWASP, EUR-Lex, dejure, OASIS, OPC Foundation, ISA, NIST, BSI, RFC, IHK, Fowler, Azure, SRE) stammen aus Modellwissen, die Links wurden nicht abgerufen. Stichprobe gegen die Originale ist nötig, besonders DIN-Grenzwerte (VDE 0701-0702), PoE-Werte, Gesetzesangaben (BGB, HGB, ArbZG, BBiG, DSGVO) und Handelskalkulation.
- Nur teilweise im Browser angesehen: KI-Modul 6, Praxisprojekte, Einsteiger-Kapitel 1, Verfügbarkeitsrechner, Notizen-Vorschau (Subnetting), CPM-Drill. Übrige neue Inhalte nur über Tests geprüft.
- Weitere Lücken: Karteikarten und Drills ohne Quellenfeld.
- Kleinigkeiten ohne Entscheidung: gemischte Button-Stile innerhalb von Labs, Texte unter 12 px.
- E2E-Test „Command Palette A11y“ fällt bei hoher Rechnerlast sporadisch durch (einzeln grün).
- `README.md` und `_Projektuebersicht.md` nennen den Theorieausbau (35 Artikel, 37 SVGs). Unter Version 3.76.0 steht in der README noch die Beschreibung des alten Planers (Historie).
- Fehler-IDs aus alten Spielständen (`studyPlanWeeks`) bleiben ungenutzt im Spielstand.
- Origin enthielt einen fremden Merge-Commit (102e447), dessen Inhalt nicht geprüft wurde.

## Nächster Schritt
Restliche Angaben der Theorieartikel gegen Primärquellen lesen (Gesetzestexte, IHK-Handreichung der zuständigen Kammer); E-Rechnung-Fristen vor Verwendung erneut im BMF-FAQ prüfen. Anschließend die Lücken oben schließen, danach die Karteikarten ergänzen. Fragen zu Projekt/Fachgespräch (IDs 102–116, `examQuestionsProjekt.js`) sind vorhanden. Die Quiz-Arena hat jetzt 11 Kategorien (`quizArenaData.js` plus `quizArenaDataTheorie.js`).
