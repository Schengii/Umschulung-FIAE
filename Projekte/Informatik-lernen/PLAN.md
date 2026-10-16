# Umsetzungsplan (PLAN.md) – Informatik-lernen (IT-DevGame)

## 1. Ist-Zustand (max. 10 Zeilen)
1. Tech-Stack: React 19.3, Vite 8.3 (Rolldown), Zustand 5.0, TailwindCSS 4, Oxlint 1.87, Vitest 5.0, Playwright 1.64.
2. Umfang & Chunks: 235 Lab-Komponenten, PWA-Service-Worker, Vendor-Chunk-Splitting (React, UI, Charts, PDF, SQL) unterhalb aller Size-Limits (Shell 78.6 KB / 105 KB Budget).
3. Test-Suite: `npm test` (1.895 Tests, 211 Testdateien), `npm run typecheck` und `npm run build` laufen fehlerfrei durch.
4. CI-Bruch: `npm run lint:ci` scheitert hart (Exit-Code 1) an 28 Oxlint-Warnungen (`set-state-in-effect`, `react(purity)`, `react(immutability)`, `react(refs)`).
5. Coverage-Grenzlage: Statements 62,05% (Limit 60%), Branches 53,49% (Limit 52%), Functions 47,4% (Limit 45%), Lines 63,62% (Limit 62%).
6. Kritischer UI-Bug: `BadgesModal` stürzt beim Öffnen wegen fehlender `userState`-Prop-Übergabe in `ModalContainer.jsx` mit uncaught TypeError ab.
7. Gamification-Lücken: `FlashcardsModal` vergibt keine XP (fehlende Prop), 40+ Lab-Mastery-Badges fehlen im `BADGES`-Katalog, `Sm2SpacedRepetitionLab` hat abgetrennten State & Endlos-XP.
8. Broken Assets: `pushNotificationManager.js` referenziert nicht existierende `/pwa-192x192.png` Icons (404-Netzwerkfehler).
9. Architektur & Kopplung: Mehrere Labs (`IhkCheatSheetPdfGenerator`, `LinuxMemoryLab`, `ZkpCryptoVisualizerLab`) brechen die Entkopplung durch direkten Store-Import.
10. Sicherheit & A11y: Gute Basis (0 `dangerouslySetInnerHTML`), jedoch fehlende Worker-Scope-Sperren (Wasm/SAB) und fehlende Modal-Focus-Traps.

---

## 2. Maßnahmen

### Phase 1: CI-Pipeline & Oxlint-Bereinigung (Abhängigkeiten zuerst)
- [x] M01 | Oxlint-Warnung react(immutability) in ServiceMeshLab beheben | P1 | S | `src/components/Content/ServiceMeshLab.jsx` | src/components/Content/ServiceMeshLab.jsx:34 | Fertig wenn: `mesh` per `useRef` verwaltet wird, keine direkte Mutation auf `useState`-Werten erfolgt und `npm run lint:ci` fehlerfrei durchläuft.
- [x] M02 | Oxlint-Warnungen react(refs) und set-state-in-effect in LinuxMemoryLab beheben | P1 | S | `src/components/Content/LinuxMemoryLab.jsx` | src/components/Content/LinuxMemoryLab.jsx:20, src/components/Content/LinuxMemoryLab.jsx:34, src/components/Content/LinuxMemoryLab.jsx:48 | Fertig wenn: Simulator per Lazy-State `useState(() => new LinuxMemorySimulator(4096, 2048))` initialisiert wird, kein Ref-Lesezugriff im Render erfolgt und `npm run lint:ci` fehlerfrei durchläuft.
- [x] M03 | Oxlint-Warnung react(set-state-in-effect) in SqliteWasmStudioLab beheben | P1 | S | `src/components/Content/SqliteWasmStudioLab.jsx` | src/components/Content/SqliteWasmStudioLab.jsx:24 | Fertig wenn: Initialisierung von `SqlSandboxInstance` ohne synchronen `setState`-Aufruf im `useEffect` erfolgt und `npm run lint:ci` keine Warnung ausgibt.
- [x] M04 | Oxlint-Warnung react(set-state-in-effect) in CustomChallengeCreatorLab beheben | P1 | S | `src/components/Content/CustomChallengeCreatorLab.jsx` | src/components/Content/CustomChallengeCreatorLab.jsx:42 | Fertig wenn: `customList` über Lazy-Initializer `useState(() => getStoredCustomChallenges())` initialisiert wird, der leere `useEffect` entfällt und `npm run lint:ci` fehlerfrei ist.
- [x] M05 | Oxlint-Warnung react(set-state-in-effect) in ExamCountdownWidget beheben | P1 | S | `src/components/Gamification/ExamCountdownWidget.jsx` | src/components/Gamification/ExamCountdownWidget.jsx:36 | Fertig wenn: `daysRemaining` als abgeleiteter Wert über `useMemo` berechnet wird, der synchrone `useEffect` entfällt und `npm run lint:ci` sauber durchläuft.
- [x] M06 | Oxlint-Warnungen react(set-state-in-effect) in IhkOralExamSimulator und ExamSimulator beheben | P1 | S | `src/components/Content/IhkOralExamSimulator.jsx`, `src/components/Content/ExamSimulator.jsx` | src/components/Content/IhkOralExamSimulator.jsx:88, src/components/Content/ExamSimulator.jsx:87 | Fertig wenn: Timer-Ablauf im Interval-Callback (`prev <= 1`) behandelt wird statt synchronem `setState` im Effect und `npm run lint:ci` fehlerfrei ist.
- [x] M07 | Oxlint-Warnungen react(set-state-in-effect) in CommandPaletteModal und PomodoroTimerWidget beheben | P1 | S | `src/components/Navigation/CommandPaletteModal.jsx`, `src/components/Navigation/PomodoroTimerWidget.jsx` | src/components/Navigation/CommandPaletteModal.jsx:22, src/components/Navigation/PomodoroTimerWidget.jsx:25 | Fertig wenn: Reset-Operationen beim Öffnen über Key-Wechsel oder Event-Handler gesteuert werden und `npm run lint:ci` grün ist.
- [x] M08 | Oxlint-Warnungen react(set-state-in-effect) in ZkpCryptoVisualizerLab und P2pQuizDuellLab beheben | P1 | S | `src/components/Content/ZkpCryptoVisualizerLab.jsx`, `src/components/Content/P2pQuizDuellLab.jsx` | src/components/Content/ZkpCryptoVisualizerLab.jsx:24, src/components/Content/P2pQuizDuellLab.jsx:90 | Fertig wenn: Zustandsübergänge bei Schrittwechseln in Event-Handlern erfolgen und `npm run lint:ci` fehlerfrei durchläuft.
- [x] M09 | Oxlint-Warnungen react(purity) bei Datumsaufrufen im Render beheben | P1 | S | `src/components/Footer/DsgvoFooterModal.jsx`, `src/components/Gamification/CertificateModal.jsx`, `src/components/Gamification/ActivityHeatmapWidget.jsx`, `src/components/Content/ExamReadinessLab.jsx`, `src/components/Content/OauthRevocationIntrospectionLab.jsx` | src/components/Footer/DsgvoFooterModal.jsx:168, src/components/Gamification/CertificateModal.jsx:8, src/components/Gamification/ActivityHeatmapWidget.jsx:12, src/components/Content/ExamReadinessLab.jsx:17, src/components/Content/OauthRevocationIntrospectionLab.jsx:148 | Fertig wenn: `new Date()` und `Date.now()` außerhalb der Render-Funktion, per Lazy-Initializer oder per `useMemo` gecacht werden und `npm run lint:ci` 0 Warnungen meldet.

### Phase 2: Kritische Bugfixes, Modals & Gamification-Korrekturen
- [x] M10 | BadgesModal Absturz durch fehlendes userState-Prop in ModalContainer beheben | P1 | S | `src/components/Navigation/ModalContainer.jsx` | src/components/Navigation/ModalContainer.jsx:96 | Fertig wenn: `userState={userState}` an `BadgesModal` übergeben wird und das Modal beim Öffnen ohne TypeError rendert.
- [x] M11 | FlashcardsModal XP-Vergabe durch Weiterleitung von onRewardXP aktivieren | P1 | S | `src/components/Navigation/ModalContainer.jsx` | src/components/Navigation/ModalContainer.jsx:132-135 | Fertig wenn: `onRewardXP={awardXP}` an `FlashcardsModal` übergeben wird und Nutzer beim Lernen von Flashcards verifizierbar XP erhalten.
- [x] M12 | 404-Asset-Fehler in PushNotificationManager bereinigen | P1 | S | `src/utils/pushNotificationManager.js` | src/utils/pushNotificationManager.js:38, src/utils/pushNotificationManager.js:39, src/utils/pushNotificationManager.js:57 | Fertig wenn: Nicht existente `/pwa-192x192.png` Pfade durch `/favicon.svg` oder vorhandene statische Icons ersetzt sind und keine 404-Fehler in der Konsole auftreten.
- [x] M13 | Toten Code addXP in WISO-Labs entfernen | P2 | S | `src/components/Content/WisoPaymentMethodsLab.jsx`, `src/components/Content/WisoBookkeepingLab.jsx`, `src/components/Content/WisoBabLab.jsx` | src/components/Content/WisoPaymentMethodsLab.jsx:16, src/components/Content/WisoBookkeepingLab.jsx:17, src/components/Content/WisoBabLab.jsx:18 | Fertig wenn: Der Aufruf `const addXP = useStore((s) => s.addXP);` rückstandslos entfernt ist und keine nicht existenten Store-Methoden referenziert werden.
- [x] M14 | Lab-Mastery-Badges in globaler BADGES-Tabelle registrieren | P2 | M | `src/utils/storage.js` | src/utils/storage.js:360-374, src/data/labRegistry.js:17-68 | Fertig wenn: Alle in `labRegistry.js` vergebenen Badges (`stp_rstp_master`, `bpmn_process_master`, `struktogramm_master`, etc.) in `BADGES` definiert sind und im `BadgesModal` angezeigt werden.
- [x] M15 | Sm2SpacedRepetitionLab an zentralen Store anbinden und Endlos-XP deckeln | P2 | M | `src/components/Content/Sm2SpacedRepetitionLab.jsx` | src/components/Content/Sm2SpacedRepetitionLab.jsx:41, src/components/Content/Sm2SpacedRepetitionLab.jsx:64 | Fertig wenn: Karten-Updates mit `userState.srsFlashcards` synchronisiert werden und XP nur einmalig bzw. nach Fälligkeit vergeben werden.

### Phase 3: Komponenten-Entkopplung & Architektur-Standards
- [x] M16 | IhkCheatSheetPdfGenerator entkoppeln und in labRegistry.js registrieren | P2 | S | `src/components/Content/IhkCheatSheetPdfGenerator.jsx`, `src/data/labRegistry.js` | src/components/Content/IhkCheatSheetPdfGenerator.jsx:8, src/components/Content/IhkCheatSheetPdfGenerator.jsx:122, src/data/labRegistry.js:109-111 | Fertig wenn: Die Komponente `onRewardXP` als Prop entgegennimmt, direkter `useStore`-Import entfällt und in `labRegistry.js` `xp: { prop: 'onRewardXP', badge: 'exam_passed' }` hinterlegt ist.
- [x] M17 | LinuxMemoryLab und ZkpCryptoVisualizerLab vollständig über Props entkoppeln | P2 | S | `src/components/Content/LinuxMemoryLab.jsx`, `src/components/Content/ZkpCryptoVisualizerLab.jsx` | src/components/Content/LinuxMemoryLab.jsx:8, src/components/Content/LinuxMemoryLab.jsx:43, src/components/Content/ZkpCryptoVisualizerLab.jsx:11, src/components/Content/ZkpCryptoVisualizerLab.jsx:28 | Fertig wenn: Direkte `useStore`- und `awardXP`-Importe entfallen und XP-Vergaben ausschließlich über die Props `onRewardXP` laufen.
- [x] M18 | Lernfeld-Mapping-Heuristik aus UI in ihkWeaknessAuditEngine auslagern | P2 | M | `src/components/Content/IhkWeaknessAuditLab.jsx`, `src/utils/ihkWeaknessAuditEngine.js` | src/components/Content/IhkWeaknessAuditLab.jsx:23-45, src/utils/ihkWeaknessAuditEngine.js:34 | Fertig wenn: `mapQuestionToLernfeld` als reine Engine-Funktion nach `ihkWeaknessAuditEngine.js` migriert ist und sowohl `question` als auch `frage` unterstützt.

### Phase 4: Sicherheit, Performance & Barrierefreiheit (WCAG 2.1 AA)
- [x] M19 | Worker Sandbox Scope Lockdown um WebAssembly und SharedArrayBuffer härten | P2 | S | `src/utils/sandboxEvaluator.js` | src/utils/sandboxEvaluator.js:121-125 | Fertig wenn: `WebAssembly` und `SharedArrayBuffer` in `BLOCKED_WORKER_GLOBALS` eingetragen sind und fremder Code in der Sandbox keinen Zugriff darauf hat.
- [x] M20 | Date.now() Performance-Hotspot in Token-Rendering Schleife eliminieren | P2 | S | `src/components/Content/OauthRevocationIntrospectionLab.jsx` | src/components/Content/OauthRevocationIntrospectionLab.jsx:148 | Fertig wenn: Der aktuelle Zeitstempel vor der Schleife einmalig bestimmt wird und nicht pro Token neu aufgerufen wird.
- [x] M21 | Semantische ARIA-Attribute und Modal-Rollen für BadgesModal und FlashcardsModal ergänzen | P2 | S | `src/components/Gamification/BadgesModal.jsx`, `src/components/Gamification/FlashcardsModal.jsx` | src/components/Gamification/BadgesModal.jsx:23, src/components/Gamification/FlashcardsModal.jsx:106 | Fertig wenn: Beide Modale `role="dialog"`, `aria-modal="true"`, `aria-labelledby` besitzen und per Tastatur (Escape) schließbar sind.

### Phase 5: Testabdeckung, CI & Dokumentation
- [x] M22 | Isolierte Unit-Tests für pushNotificationManager.js ergänzen | P2 | S | `src/utils/pushNotificationManager.test.js` | src/utils/pushNotificationManager.test.js:1-20 | Fertig wenn: Test-Suite `scheduleDailyReminder`, Notification-Fallback und Service-Worker-Zweig mockt und abdeckt.
- [x] M23 | Isolierte Test-Suite für FlashcardsModal SM-2 Sortierung erstellen | P2 | S | `src/components/Gamification/FlashcardsModal.test.jsx` | src/components/Gamification/FlashcardsModal.jsx:18-35 | Fertig wenn: Fälligkeits-Priorisierung, Sortierung nach `dueDate` und TSV-Download isoliert getestet sind.
- [x] M24 | Unit-Tests für mapQuestionToLernfeld in ihkWeaknessAuditEngine.test.js anlegen | P2 | S | `src/utils/ihkWeaknessAuditEngine.test.js` | src/utils/ihkWeaknessAuditEngine.test.js:1-35 | Fertig wenn: Alle 12 Lernfelder sowie Randfälle (fehlende Kategorie, Drill-Format mit `frage`) isoliert getestet sind.
- [x] M25 | Dokumentation von Badges und PWA-Assets in README.md & CHANGELOG.md angleichen | P3 | S | `README.md`, `CHANGELOG.md` | README.md:33, CHANGELOG.md:1-25 | Fertig wenn: Badge-Übersicht, Lab-Gesamtzahl (235) und behobene Modals im Keep-a-Changelog Format dokumentiert sind.

### Optional (Ideen ohne Beleg im Projektcode)
- [ ] M26 | (Optional) Offline-Background-Sync via Service Worker Push API | P3 | L | `src/main.jsx` | - | Fertig wenn: Ein echter Web-Push-Service mit Backend-Subscription angebunden ist.
- [ ] M27 | (Optional) Multi-User WebRTC P2P-Turniere mit externem STUN/TURN Signaling | P3 | L | `src/components/Content/P2pQuizDuellLab.jsx` | - | Fertig wenn: Echte Multi-Client-Turniere über Internet-Grenzen hinweg spielbar sind.

---

## 3. Vorgehen je Phase: Reihenfolge, Test nach jeder Phase, Rollback

### Phase 1: CI-Pipeline & Oxlint-Bereinigung
- **Reihenfolge**: M01 → M02 → M03 → M04 → M05 → M06 → M07 → M08 → M09
- **Test nach Phase**:
  - `npm run lint:ci` (Muss mit Exit-Code 0 und 0 Warnungen abschließen)
  - `npm run typecheck`
  - `npm run test:fast`
- **Rollback**: `git checkout -- src/components/Content/ServiceMeshLab.jsx src/components/Content/LinuxMemoryLab.jsx src/components/Content/SqliteWasmStudioLab.jsx src/components/Content/CustomChallengeCreatorLab.jsx src/components/Gamification/ExamCountdownWidget.jsx src/components/Content/IhkOralExamSimulator.jsx src/components/Content/ExamSimulator.jsx src/components/Navigation/CommandPaletteModal.jsx src/components/Navigation/PomodoroTimerWidget.jsx src/components/Content/ZkpCryptoVisualizerLab.jsx src/components/Content/P2pQuizDuellLab.jsx src/components/Footer/DsgvoFooterModal.jsx src/components/Gamification/CertificateModal.jsx src/components/Gamification/ActivityHeatmapWidget.jsx src/components/Content/ExamReadinessLab.jsx src/components/Content/OauthRevocationIntrospectionLab.jsx`

### Phase 2: Kritische Bugfixes, Modals & Gamification-Korrekturen
- **Reihenfolge**: M10 → M11 → M12 → M13 → M14 → M15
- **Test nach Phase**:
  - `npm test -- src/utils/storage.test.js src/utils/pushNotificationManager.test.js src/components/Content/LabsDashboard.test.jsx`
  - Manuelle Prüfung im Browser: Öffnen von BadgesModal und FlashcardsModal (kein Absturz, XP werden gutgeschrieben)
  - `npm run build`
- **Rollback**: `git checkout -- src/components/Navigation/ModalContainer.jsx src/utils/pushNotificationManager.js src/components/Content/WisoPaymentMethodsLab.jsx src/components/Content/WisoBookkeepingLab.jsx src/components/Content/WisoBabLab.jsx src/utils/storage.js src/components/Content/Sm2SpacedRepetitionLab.jsx`

### Phase 3: Komponenten-Entkopplung & Architektur-Standards
- **Reihenfolge**: M16 → M17 → M18
- **Test nach Phase**:
  - `npm test -- src/utils/ihkWeaknessAuditEngine.test.js src/data/labModulesData.test.js src/components/allLabsSmoke.test.jsx`
  - `npm run typecheck`
- **Rollback**: `git checkout -- src/components/Content/IhkCheatSheetPdfGenerator.jsx src/data/labRegistry.js src/components/Content/LinuxMemoryLab.jsx src/components/Content/ZkpCryptoVisualizerLab.jsx src/components/Content/IhkWeaknessAuditLab.jsx src/utils/ihkWeaknessAuditEngine.js`

### Phase 4: Sicherheit, Performance & Barrierefreiheit (WCAG 2.1 AA)
- **Reihenfolge**: M19 → M20 → M21
- **Test nach Phase**:
  - `npm test -- src/utils/sandboxRunner.test.js src/components/allLabsA11y.test.jsx`
  - `npm run build && npm run size`
- **Rollback**: `git checkout -- src/utils/sandboxEvaluator.js src/components/Content/OauthRevocationIntrospectionLab.jsx src/components/Gamification/BadgesModal.jsx src/components/Gamification/FlashcardsModal.jsx`

### Phase 5: Testabdeckung, CI & Dokumentation
- **Reihenfolge**: M22 → M23 → M24 → M25
- **Test nach Phase**:
  - Vollständige CI-Qualitätskette: `npm run lint:ci && npm run typecheck && npm test && npm run test:coverage && npm run build && npm run size`
  - Regression-Check: Coverage-Schwellenwerte (`statements: 60`, `branches: 52`, `functions: 45`, `lines: 62`) einhalten
- **Rollback**: `git checkout -- src/utils/pushNotificationManager.test.js src/components/Gamification/FlashcardsModal.test.jsx src/utils/ihkWeaknessAuditEngine.test.js README.md CHANGELOG.md`

---

## 4. Risiken und offene Fragen

### Risiken
1. **Oxlint Strict Mode vs. React 19 Hydration**: Das Beheben von `react(set-state-in-effect)` durch `useMemo` oder State-Initialisierungs-Funktionen darf keine unkontrollierten Re-Renders oder Hydration-Mismatches erzeugen.
2. **Badges-Schema-Erweiterung in UserState**: Werden 40+ neue Badges in `BADGES` (`storage.js`) aufgenommen, muss sichergestellt sein, dass bestehende `userState.unlockedBadges`-Arrays im LocalStorage und IndexedDB kompatibel bleiben und nicht durch Validatoren verworfen werden.
3. **Coverage-Grenzwerte in vite.config.js**: Da Functions (47,4% vs. 45% Schwelle) und Branches (53,49% vs. 52% Schwelle) sehr nah an der Abbruchgrenze liegen, muss jede neue Engine-Funktion mit isolierten Tests abgesichert werden, um den CI-Build nicht zu gefährden.

### Offene Fragen
1. **Badges-Kategorisierung**: Sollen die über 40 Lab-Badges im `BadgesModal` in Kategorien (z. B. "IHK Kernqualifikationen", "Netzwerktechnik", "Softwareentwicklung", "WISO") unterteilt werden, um die Übersichtlichkeit im Grid zu wahren?
2. **Push-Notification PWA Service Worker**: Soll `pushNotificationManager.js` persistente Push-Subscriptions über den bereits aktiven Service Worker (`vite-plugin-pwa`) mit echten Trigger-Events nutzen, oder reicht die tab-gebundene lokale Benachrichtigung?
