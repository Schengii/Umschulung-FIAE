# Slash-Kommando: /review

Führt ein strukturiertes Code-Review für kürzlich geänderte Dateien durch.

## Kriterien für das Review:
1. **Architektur**:
   - Ist die Logik sauber in `src/utils/*Engine.js` isoliert und nicht direkt in UI-Komponenten implementiert?
   - Gibt es isolierte Unit-Tests für jede Engine?
2. **Barrierefreiheit (WCAG 2.1 AA)**:
   - Haben alle Buttons, Eingabefelder und interaktiven Elemente verständliche `aria-label` / Labels?
   - Werden `prefers-reduced-motion` und Farbkontraste eingehalten?
3. **Sicherheit & Performance**:
   - Läuft dynamischer Code in `src/utils/sandboxRunner.js` (Web Worker) statt per `eval` / `new Function`?
   - Werden unnötige Re-Renders vermieden? Werden schwere Komponenten dynamisch geladen?
4. **Dokumentation & Regeln**:
   - Sind `README.md` und `CHANGELOG.md` aktualisiert?
