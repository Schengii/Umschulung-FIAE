# Slash-Kommando: /new-lab

Hilft beim Erstellen eines neuen interaktiven IHK-Lernmoduls / Labs nach dem Projekt-Architekturstandard.

## Standard-Workflow:
1. **Scaffold ausführen**:
   ```bash
   npm run new-lab -- <PascalName> "<Titel>" [kategorie] [schwierigkeit]
   ```
   Beispiel: `npm run new-lab -- RaidLevel "RAID-Level Studio" hardware Intermediate`

2. **Entkopplung beachten**:
   - Berechnungs- und Simulationslogik gehört rein nach `src/utils/<name>Engine.js`.
   - Unit-Tests in `src/utils/<name>Engine.test.js` mit mind. 90%+ Testabdeckung erstellen.
   - UI in `src/components/Content/<Name>Lab.jsx` konsumiert die Engine und ruft `onRewardXP` / `onXPGain` auf.

3. **Registrierung & Dokumentation**:
   - Automatisch eingetragen durch Scaffold: `src/data/labRegistry.js` und `src/data/labModulesData.js`.
   - Dokumentation synchronisieren:
     ```bash
     npm run docs:labs
     ```
   - `CHANGELOG.md` und `_Projektuebersicht.md` aktualisieren.

4. **Qualitätsprüfung**:
   - `npm run test:fast` ausführen.
   - A11y (WCAG 2.1 AA) und Keyboard-Navigation prüfen.
