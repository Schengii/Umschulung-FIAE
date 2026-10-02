# 0011 — Git-Simulator: Logik als DOM-freie Engine

**Status:** Akzeptiert (ergänzt ADR 0007)
**Datum:** 2026-10-02

## Kontext

ADR 0007 legte fest, dass der Git-Simulator seinen Zustand im Speicher hält und Befehle mit einem eigenen Parser verarbeitet, und nannte als Konsequenz, die Level-Checks seien „DOM-unabhängig und unit-testbar". Tatsächlich lagen Zustand, Parser, Level-Regeln, Terminal-Ausgabe und SVG-Rendering in einer Datei (`assets/js/git-simulator.js`, ~960 Zeilen) und waren ineinander verschränkt: `executeGitCommand()` schrieb direkt ins Terminal und stieß das Rendering an. Unit-Tests gab es deshalb keine, nur drei E2E-Tests für Commit und Branch.

Das hatte Folgen, die ohne Tests niemand bemerkte:

- `git stash` und `git cherry-pick` waren nicht implementiert, obwohl Level 5 und 6 sie verlangen (ADR 0007 führt `stash` und `status` sogar als vorhanden auf). Level 5 galt nach einem beliebigen Commit als bestanden, Level 6 war nicht lösbar.
- Level 3 war nach der eigenen Anleitung nicht bestehbar: Die beschriebenen Schritte ergeben einen Fast-Forward, die Prüfung verlangte einen Merge-Commit.
- Level 4 galt schon vor dem Rebase als bestanden, weil die Prüfung den ersten statt des aktuellen Commits des Feature-Branches betrachtete.
- Die Erfolgsmeldung samt Konfetti kam nach jedem weiteren Befehl erneut.
- Eingaben wurden ungefiltert per `innerHTML` ins Terminal geschrieben.

## Entscheidung

Die Logik liegt in `assets/js/modules/git-engine.js`, ohne Zugriff auf `document`:

- `executeCommand(state, input)` verändert den Zustand und gibt ein Ergebnis zurück: Ausgabezeilen (`{ kind, de, en }`), ob der Zustand sich geändert hat, ob das Terminal geleert werden soll.
- `LEVEL_RULES` enthält je Level die vorbereitenden Befehle (`setup`) und das Ziel als reine Funktion des Zustands (`check`).
- `git-engine.test.js` deckt Befehle, Fehlerfälle und jedes Level ab — inklusive der Aussage, dass jedes Level genau nach seiner Anleitung lösbar ist und nicht schon im Startzustand als gelöst gilt.

`git-simulator.js` rendert nur noch: Terminalzeilen aus Textknoten (beide Sprachen als `lang`-Spans), den Commit-Graphen als SVG und den Level-Status.

Fachliche Korrekturen in der Engine:

- Neue Befehle: `git stash` / `stash pop` / `stash list`, `git cherry-pick`, `git status`, `git branch` (Liste), `git branch -d`, sowie `touch <datei>` als Ersatz für eine Dateiänderung (der Simulator hat kein Arbeitsverzeichnis).
- Merge und Rebase arbeiten über die tatsächliche Vorfahrenmenge: „Already up to date", Fast-Forward und Merge-Commit werden korrekt unterschieden.
- Commits, die kein Branch und kein HEAD mehr erreicht (nach Rebase, `reset --hard`, Löschen eines Branches, Verlassen eines Detached HEAD), verschwinden aus dem Graphen, wie bei `git log --all`.
- Branch-Namen werden validiert.

## Konsequenzen

- Neue Befehle oder Level sind eine Änderung an `git-engine.js` plus Test; die Seite muss dafür nicht angefasst werden, solange keine neue Darstellung nötig ist.
- Level-Texte (`git-simulator.js`) und Level-Regeln (`git-engine.js`) liegen in zwei Dateien. Wer ein Level ändert, muss beide anpassen; der Test „jedes Level ist nach Anleitung lösbar" hält die Regeln an den beschriebenen Schritten fest.
- Ausgabezeilen der Engine können Nutzereingaben enthalten (Branch-Namen, Commit-Nachrichten). Sie sind Text und dürfen nie als HTML eingefügt werden.
- Der Simulator bleibt eine Lehr-Vereinfachung: kein Index, keine Dateien, keine Konflikte. Die übrigen Aussagen aus ADR 0007 (In-Memory-Zustand, SVG, eigener Parser statt Git-Bibliothek) gelten weiter.
