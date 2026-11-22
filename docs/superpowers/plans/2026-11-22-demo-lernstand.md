# Demo-Lernstand (Phase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or subagent-driven-development). Steps use checkbox syntax.

**Goal:** Ein Schalter auf dem Dashboard füllt alle Lernbereiche mit Beispieldaten und stellt den echten Stand auf Wunsch wieder her.

**Architecture:** Neues reines Modul `modules/demo-progress.js` (Logik mit übergebenem Storage, kein direkter `localStorage`-Zugriff) erzeugt ein Backup-Objekt, spielt es über `applyBackup` ein und sichert vorher den echten Stand unter einem Schlüssel außerhalb der Backup-Allowlist. `progress-backup.js` ruft die DOM-Verdrahtung `initDemoMode(card, window.localStorage)` am Ende von `initProgressBackup` auf.

**Tech Stack:** Vanilla-ES-Module, Vitest, Playwright, bestehendes `progress-backup.js`.

**Spec:** `docs/superpowers/specs/2026-11-22-demo-lernstand-design.md`

## Global Constraints

- Kein direkter `localStorage`-Zugriff außerhalb von `components.js` und `progress-backup.js`; das neue Modul bekommt den Storage als Argument.
- Zweisprachig: sichtbarer Text als `<span lang="de">`/`<span lang="en">`, Attribute mit `data-en-<attribut>`.
- Keine `<style>`-Elemente; Regeln in `assets/css/dashboard.css`.
- Demo-Schlüssel `demo_mode_active` und `demo_mode_snapshot` stehen **nicht** in der Backup-Allowlist.
- Letzter Schritt nach Dateiänderungen: `npm run generate-sw-assets`.
- Persönliche Einstellungen des Besuchers (`username`, `theme`, `lang`, `portfolio_*`, `sound_enabled`, `interview_tts_enabled`, `flashcards_extended_enabled`, `flashcards_new_per_day`) bleiben beim Aktivieren und Zurücksetzen erhalten.

## Review Focus

- Aktivieren, wenn vorher gar kein Fortschritt gespeichert war: Zurücksetzen muss wieder leer sein.
- Zweimal aktivieren hintereinander darf den Snapshot nicht mit Demo-Daten überschreiben.
- Snapshot fehlt oder ist beschädigt: Zurücksetzen räumt Demo-Daten auf, ohne zu werfen.
- Während der Demo geänderte Einstellungen (Theme, Sprache) überleben das Zurücksetzen.
- Backup-Export und QR-Sync sind im Demo-Modus gesperrt.

---

### Task 1: Beispieldaten erzeugen (`buildDemoBackup`)

**Files:**
- Create: `assets/js/modules/demo-progress.js`
- Test: `assets/js/modules/demo-progress.test.js`

**Interfaces:**
- Produces: `buildDemoBackup(now: Date): {app: string, version: number, exportedAt: string, data: Record<string, string>}`; Konstanten `DEMO_ACTIVE_KEY = 'demo_mode_active'`, `DEMO_SNAPSHOT_KEY = 'demo_mode_snapshot'`, `PERSONAL_KEYS: string[]`.

- [ ] **Step 1: Failing tests** in `demo-progress.test.js`: (a) `parseBackup(JSON.stringify(buildDemoBackup(now)))` wirft nicht und enthält nur Schlüssel, für die `isBackupKey` wahr ist; (b) kein Schlüssel aus `PERSONAL_KEYS` und weder `DEMO_ACTIVE_KEY` noch `DEMO_SNAPSHOT_KEY` ist enthalten; (c) `parseHistory(data.exam_history)` liefert ≥ 8 Läufe aller drei Modi, alle `date` liegen in der Vergangenheit und höchstens 60 Tage vor `now`, `percent` des letzten Laufs > `percent` des ersten; (d) jedes `exam_wrong_questions`-Element ist eine ID aus `EXAM_QUESTIONS`; (e) `flashcards_due_dates` hat Werte von heute bis +7 Tage (lokale Mitternacht) und mindestens eine fällige und eine zukünftige Karte; (f) zwei Aufrufe mit gleichem `now` liefern identische Daten; (g) mit einem um 30 Tage späteren `now` verschieben sich die Verlaufsdaten entsprechend.
- [ ] **Step 2:** `npx vitest run assets/js/modules/demo-progress.test.js`, erwartet FAIL (Modul fehlt).
- [ ] **Step 3: Implement** `buildDemoBackup`. Schlüssel: `flashcards_box_levels` (IDs 1–18, Boxen 1–5 deterministisch verteilt), `flashcards_due_dates` (Mitternachts-Timestamps über `startOfDay`/`nextDueDate`-Logik aus `leitner-box.js`), `known_flashcards`, `flashcards_starred`, `flashcard_total_count` (18), `flashcard_correct_count` (Anzahl Box 5), `exam_history` (11 Läufe in den letzten 54 Tagen, Modi rotierend ap1/ap2/wiso, Themen pro Modus aus `EXAM_TOPICS` mit je 3 Fragen und steigender Trefferquote; `percent` aus den Themensummen), `exam_topic_stats` (Summe der Verlaufs-Themen), `exam_wrong_questions` (≤ 8 IDs der schwächsten Themen aus `EXAM_QUESTIONS`), `quiz_best_score`, `interview_best_score`, `learning_recommendations_quiz_weak_categories`, `learning_recommendations_flashcards_wrong_counts`. Kein Zufall: Werte per Formel aus Index. `app`/`version` aus `BACKUP_APP_ID`/`BACKUP_VERSION`.
- [ ] **Step 4:** Tests erneut ausführen, erwartet PASS.
- [ ] **Step 5: Commit** `feat(demo): Beispiel-Lernstand erzeugen`.

### Task 2: Aktivieren und Zurücksetzen

**Files:**
- Modify: `assets/js/modules/demo-progress.js`
- Test: `assets/js/modules/demo-progress.test.js`

**Interfaces:**
- Consumes: `buildDemoBackup` (Task 1), `createBackup`, `applyBackup`, `isBackupKey` aus `progress-backup.js`.
- Produces: `isDemoActive(storage): boolean`, `activateDemo(storage, now: Date): void`, `deactivateDemo(storage): void`. `storage` ist `Pick<Storage,'length'|'key'|'getItem'|'setItem'|'removeItem'>`.

- [ ] **Step 1: Failing tests** mit einem Map-basierten Storage-Double: Aktivieren sichert den Stand, ersetzt Fortschritt durch Demo, behält `PERSONAL_KEYS`-Werte und setzt `demo_mode_active`; Zurücksetzen stellt Fortschritt wieder her und löscht beide Demo-Schlüssel; Fälle aus Review Focus: vorher leer → danach leer; zweites `activateDemo` bei aktivem Modus ändert den Snapshot nicht; fehlender oder kaputter Snapshot → `deactivateDemo` wirft nicht und lässt nur persönliche Schlüssel übrig; in der Demo geändertes `theme` bleibt nach `deactivateDemo`; Schlüssel fremder Anwendungen (z. B. `foreign_app`) bleiben unberührt.
- [ ] **Step 2:** Tests ausführen, erwartet FAIL.
- [ ] **Step 3: Implement** die drei Funktionen. Snapshot = `JSON.stringify(createBackup(storage).data)` ohne `PERSONAL_KEYS`; Wiederherstellung über `applyBackup(storage, entries)` mit den aktuellen persönlichen Werten. Snapshot nur schreiben, wenn der Modus nicht aktiv ist; `setItem` für `DEMO_ACTIVE_KEY` erst nach erfolgreichem `applyBackup`.
- [ ] **Step 4:** Tests ausführen, erwartet PASS.
- [ ] **Step 5: Commit** `feat(demo): Demo-Modus aktivieren und zurücksetzen`.

### Task 3: Oberfläche und Verdrahtung

**Files:**
- Modify: `assets/js/modules/demo-progress.js` (Export `initDemoMode(card: HTMLElement, storage: Storage): void`), `assets/js/modules/progress-backup.js` (Aufruf am Ende von `initProgressBackup`), `pages/dashboard.html` (Block `#demo-mode` in `#progress-backup`), `assets/css/dashboard.css`
- Test: `assets/js/modules/demo_mode.spec.js` (Playwright)

**Interfaces:**
- Consumes: `isDemoActive`, `activateDemo`, `deactivateDemo` (Task 2).
- Produces: DOM `#demo-load-btn`, `#demo-reset-btn`, `#demo-banner` (`role="status"`, `hidden`, solange inaktiv), gesperrte Buttons `#backup-export-btn` und `#backup-qr-btn` (`disabled`, `title` erklärt den Grund) bei aktivem Modus.

- [ ] **Step 1: Failing E2E** (`demo_mode.spec.js`, Chromium): Dashboard laden → `#demo-load-btn` klicken, Bestätigung über `showConfirm` annehmen → Seite lädt neu, `#demo-banner` sichtbar, Verlaufsdiagramm vorhanden, `#backup-export-btn` disabled; `#demo-reset-btn` klicken → Banner weg, `exam_history` wieder leer, Export aktiv; vorher gesetzter `username` und `theme` überleben beides.
- [ ] **Step 2:** `E2E_ROOT=./ npx playwright test demo_mode --project=chromium`, erwartet FAIL.
- [ ] **Step 3: Implement** HTML-Block mit Erklärtext (DE/EN, nennt: echter Stand wird gesichert, neuer Fortschritt in der Demo geht beim Zurücksetzen verloren), Banner-Markup mit `lang`-Paaren, `initDemoMode` (Klick-Handler, `window.showConfirm` mit `{de,en}`-Texten, `location.reload()` nach Wechsel, Sperren der Export-/QR-Buttons), Banner-Regeln in `dashboard.css`.
- [ ] **Step 4:** E2E ausführen, erwartet PASS; danach `npm run check-bilingual` und `npm run check-csp`.
- [ ] **Step 5: Commit** `feat(demo): Schalter und Hinweis auf dem Dashboard`.

### Task 4: Abschluss

**Files:** `CHANGELOG.md`, `plan.md` (kurzer Vermerk), `sw.js` (generiert)

- [ ] **Step 1:** Changelog-Eintrag unter „Unreleased“.
- [ ] **Step 2:** `npm run generate-sw-assets`, dann `npm run check` und `E2E_ROOT=./ npx playwright test demo_mode dashboard_exam_history progress_backup --project=chromium`, erwartet alles grün.
- [ ] **Step 3:** PR öffnen (`SKIP_E2E=1 git push`, solange auf Port 8080 ein fremder Server läuft).
