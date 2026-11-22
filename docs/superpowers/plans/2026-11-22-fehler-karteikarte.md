# „Fehler wird Karteikarte“ (Phase 2) Implementation Plan

> Entwurf: `docs/superpowers/specs/2026-11-22-demo-lernstand-design.md` (auf Branch `feat/demo-lernstand`, PR #80).

**Goal:** Im Ergebnis eines Prüfungslaufs legt ein Button die falsch beantworteten Fragen als eigene Leitner-Karten an.

**Architecture:** Reines Modul `modules/exam-to-flashcards.js` wandelt Fragen in Karten (`custom_exam_<frageId>`, Kategorie aus `EXAM_TOPICS`, Box 1, ohne Fälligkeit = heute fällig) und vermeidet Doppelte. `ihk-exam-simulator.js` bekommt nur Button, Speichern über `AppStorage` und eine Status-Meldung. `flashcards.js` zeigt Zeilenumbrüche eigener Karten (erst escapen, dann `\n` zu `<br>`).

**Interfaces:**
- `questionToCard(question): Card` — `id`, `category`, `hint_de/en`, `question_de/en` (Fragetext plus Optionen bzw. Elemente/Lückentext), `answer_de/en` (`correctAnswerText` plus Erklärung).
- `addMistakesAsCards({questions, answers, cards, boxLevels}): {cards, boxLevels, added, alreadyKnown}` — nur nicht vollständig richtige (`isFullyCorrect`) Fragen, unbeantwortet zählt als falsch; Eingaben bleiben unverändert.

**Tests:** Vitest je Fragetyp, Smoke über den ganzen Fragenpool, nur falsche Fragen, Box 1, keine Doppelten beim zweiten Lauf, bestehende Karten und Boxen bleiben, Eingaben unverändert. E2E: Lauf beenden, Button klicken, Karte erscheint in `flashcards.html`.
