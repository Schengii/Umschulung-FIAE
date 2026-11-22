# Demo-Lernstand und „Fehler wird Karteikarte“ – Entwurf

Stand: 2026-11-22 · Status: zur Freigabe

## Absicht

Die Lernfunktionen (Dashboard, Prüfungsstatistik, Verlaufsdiagramm, Lernkalender, Kartei) sind ein
Vorzeigestück für Bewerbungen. Ein Recruiter, der die Seite zum ersten Mal öffnet, sieht aber nur
leere Zustände (0 %, kein Diagramm, kein Kalender). Die Technik dahinter bleibt unsichtbar.

## Ziele

1. **Demo-Modus (zuerst):** Ein Schalter „Beispiel-Lernstand laden“ füllt alle Lernbereiche mit
   realistischen Daten, ein Klick auf „Meinen Stand zurückholen“ stellt den echten Stand wieder her.
2. **Fehler wird Karteikarte (danach):** Im Ergebnis eines Prüfungslaufs legt ein Button die falsch
   beantworteten Fragen als eigene Leitner-Karten an.

## Nicht-Ziele

- Kein Prüfungstermin und kein Countdown (die Prüfung des Eigentümers liegt hinter ihm).
- Kein Backend, keine neuen Seiten, keine neuen externen Ressourcen.
- Keine Demo-Daten für Spiele-Highscores oder Achievements, die den Besucher irreführen könnten
  (siehe Anti-Ziele).

## Anti-Ziele (wäre ein Misserfolg, auch wenn es technisch läuft)

- Der echte Lernstand eines Besuchers geht verloren oder wird mit Demo-Daten vermischt.
- Demo-Daten sehen echt aus und werden für echte gehalten: Der Demo-Zustand muss immer sichtbar
  gekennzeichnet sein.
- Ein Export im Demo-Modus nimmt die Demo-Daten als echte Sicherung mit.

## Bedingungen

- Vorhandenen Backup-Mechanismus nutzen (`progress-backup.js`: Allowlist, `parseBackup`,
  `applyBackup`); die Demo-Daten erscheinen als normales Backup-Objekt.
- Kein direkter `localStorage`-Zugriff außerhalb von `components.js` und `progress-backup.js`
  (Konvention): Zugriff über `AppStorage` bzw. die dort schon vorhandene Schnittstelle.
- Nutzergesteuerte Texte nie roh in `innerHTML` (`escapeHtml`). Zweisprachig (DE/EN).
- Reine Logik in `modules/` mit Vitest, Seiten-Code dünn (Muster wie `leitner-box.js`).
- Neuer Schlüssel für den Demo-Zustand muss bewusst **nicht** in die Backup-Allowlist.
- Nach Änderungen an Seiten/Assets: `generate-sw-assets` als letzter Schritt.

## Ansätze

- **A) Nur „Fehler wird Karteikarte“:** klein, hilft nur nach einem Lauf. Verworfen als erster Schritt.
- **B) Demo-Modus (gewählt):** voller Eindruck sofort, nutzt den vorhandenen Backup-Pfad.
  Preis: Beispieldaten müssen mit neuen Schlüsseln mitwachsen.
- **C) Beides:** vollständig, doppelte Arbeit. Wird als B, danach A umgesetzt.

Gewählt vom Eigentümer: **B, danach A.**

## Entwurf Demo-Modus (meine Entscheidungen, korrigierbar)

- **Neues Modul `modules/demo-progress.js`** (rein, ohne DOM): `buildDemoBackup(now)` erzeugt ein
  Backup-Objekt im Format von `createBackup`. Datumswerte werden **relativ zu `now`** berechnet
  (Prüfungsläufe der letzten ~8 Wochen, Fälligkeiten der Karteikarten in den nächsten Tagen),
  damit Verlaufsdiagramm und Lernkalender nie veraltet aussehen. Zufall nur über einen festen Seed,
  damit Tests stabil bleiben.
- **Inhalt der Beispieldaten:** Kartei (Boxen, Fälligkeiten, einige Sterne, Zähler), Prüfungsläufe
  für AP1/AP2/WISO mit steigender Tendenz, Themenstatistik und falsche Fragen, Fachgespräch- und
  Interview-Ergebnisse, Quiz-Bestwert, Lernempfehlungen, ein paar besuchte Seiten. Name und
  Einstellungen (Theme, Sprache, Akzent) bleiben die des Besuchers, sie kommen nicht aus der Demo.
- **Aktivieren:** Schalter in der Backup-Karte des Dashboards. Ablauf: aktuellen Stand als Snapshot
  unter einem eigenen Schlüssel (`demo_mode_snapshot`) sichern, Demo einspielen (`applyBackup`),
  Marker `demo_mode_active` setzen, Seite neu rendern/neu laden.
- **Zurücksetzen:** Snapshot zurückspielen, beide Schlüssel löschen. War der Stand vorher leer,
  bleibt er leer.
- **Kennzeichnung:** Solange der Modus aktiv ist, zeigt das Dashboard einen gut sichtbaren Hinweis
  („Beispiel-Lernstand, nicht dein Fortschritt“) mit dem Zurück-Button.
- **Export im Demo-Modus:** Der Export-Button ist deaktiviert und erklärt warum.
- **Neuer Fortschritt im Demo-Modus** (Besucher übt weiter): geht beim Zurücksetzen verloren; das
  steht im Hinweis. Kein Mischen.

## Entwurf „Fehler wird Karteikarte“ (Phase 2)

Button „Falsch beantwortete als Karten merken“ im Ergebnis eines Laufs. Aus Frage und Erklärung
entsteht je eine eigene Karte (`flashcards_custom`, Box 1, heute fällig); Doppelte werden über die
Frage-ID vermieden. Eigenes Vitest-Modul für die Umwandlung. Details im Plan nach Phase 1.

## Prüfung

- Vitest: `buildDemoBackup` besteht `parseBackup`, enthält nur Allowlist-Schlüssel, Datumswerte
  relativ zu `now`; Aktivieren/Zurücksetzen mit einem Storage-Double, inklusive „vorher leer“.
- Playwright: Demo aktivieren zeigt Diagramm/Kalender/Hinweis, Zurücksetzen stellt den vorherigen
  Stand her, Export ist gesperrt.
- Bestehende Gates (`npm run check`, CSP, Bilingual, SW-Assets) bleiben grün.

## Dem Baumeister überlassen

Konkrete Zahlen der Beispieldaten, genauer Wortlaut der Hinweise, Position des Schalters in der
Backup-Karte, Umsetzung des Neurenderns (Reload oder Event).
