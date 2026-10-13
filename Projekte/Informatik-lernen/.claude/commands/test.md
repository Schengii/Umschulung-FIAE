# Slash-Kommando: /test

Führt die Vitest-Testsuite des Projekts aus und analysiert eventuelle Fehler.

## Ausführung:
```bash
# Standard: Schneller Testlauf (ohne A11y & Routing-Dauertests)
npm run test:fast

# Vollständiger Testlauf
npm test
```

## Anweisungen für Claude:
1. Führe zuerst `npm run test:fast` aus.
2. Wenn Tests fehlschlagen, analysiere die genauen Fehlermeldungen, Dateipfade und Zeilennummern.
3. Behebe Fehler in den entsprechenden `Engine.js`- oder Testdateien, ohne die Tests künstlich abzuschwächen.
4. Stelle sicher, dass keine Berechnungslogik der IHK-Formeln beschädigt wird.
