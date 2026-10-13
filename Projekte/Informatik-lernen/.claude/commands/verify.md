# Slash-Kommando: /verify

Validiert die gesamte Qualitätssicherungs-Pipeline des Projekts vor Commits oder Pull Requests.

## Pipeline-Reihenfolge:
1. `npm run lint:ci` (Oxlint mit `--deny-warnings`)
2. `npm run typecheck` (`tsc --noEmit` für JSDoc/@ts-check)
3. `npm test` (vollständige Vitest-Suite)
4. `npm run build` (Vite-Produktionsbuild & PWA-Generierung)
5. `npm run size` (Bundle-Limits prüfen, z. B. App-Shell < 105 KB)

## Anweisungen für Claude:
1. Führe die Schritte der Pipeline nacheinander aus.
2. Stoppe beim ersten Fehler und melde die Ursache.
3. Stelle sicher, dass `README.md` und `CHANGELOG.md` aktualisiert sind, falls Code oder Dateien geändert wurden.
