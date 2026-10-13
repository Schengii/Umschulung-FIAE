# 🤝 Beitragen zu Informatik-lernen (IT-DevGame)

Vielen Dank für dein Interesse, zu **Informatik-lernen** beizutragen! Dieses Dokument hilft dir und KI-Assistenten (wie Claude oder Gemini) dabei, reibungslos im Einklang mit den Architektur- und Qualitätsstandards dieses Projekts mitzuarbeiten.

---

## 🧭 Inhaltsverzeichnis

- [Architektur-Prinzipien](#-architektur-prinzipien)
- [Entwicklungsumgebung & Setup](#-entwicklungsumgebung--setup)
- [Neues Lab hinzufügen](#-neues-lab-hinzufügen)
- [Qualitätssicherung & CI-Pipeline](#-qualitätssicherung--ci-pipeline)
- [Barrierefreiheit (WCAG 2.1 AA)](#-barrierefreiheit-wcag-21-aa)
- [Dokumentations-Pflicht](#-dokumentations-pflicht)
- [Pull-Request-Prozess](#-pull-request-prozess)

---

## 📐 Architektur-Prinzipien

1. **Entkopplung von Engine & UI**:
   - Rechnungen, Protokollsimulationen, mathematische Modelle und kaufmännische Berechnungen gehören ausschließlich nach `src/utils/*Engine.js`.
   - Jede Engine wird durch eine isolierte Testdatei (`src/utils/*Engine.test.js`) getestet.
   - UI-Komponenten in `src/components/Content/*Lab.jsx` konsumieren die Engines und binden XP-Ausschüttungen (`awardXP` / `onRewardXP`) ein.
2. **Code-Sandbox für Nutzercode**:
   - Nutzercode wird **niemals** per `eval` oder `new Function` im UI-Hauptthread ausgeführt.
   - Die Ausführung erfolgt über `runInSandbox` / `runTestCasesInSandbox` (`src/utils/sandboxRunner.js`) im Web Worker mit 3-Sekunden-Timeout.
3. **Barrierefreiheit (WCAG 2.1 AA)**:
   - Alle interaktiven Elemente müssen über Tastatur bedienbar und mit aussagekräftigen `aria-label`-Attributen versehen sein.
   - `prefers-reduced-motion` muss respektiert werden.
4. **Graduelle Typisierung**:
   - Kritische Berechnungs-Engines nutzen `// @ts-check` und JSDoc-Typkommentare. `npm run typecheck` validiert diese.

---

## 🛠️ Entwicklungsumgebung & Setup

Voraussetzung: **Node.js ≥ 22.19.0** und **npm ≥ 10**.

```bash
# Repository klonen & Abhängigkeiten installieren
git clone https://github.com/Schengii/Informatik-lernen.git
cd Informatik-lernen
npm install

# Lokale Umgebungsvariablen initialisieren
cp .env.example .env

# Entwicklungsserver starten (http://localhost:5173)
npm run dev
```

---

## 🧩 Neues Lab hinzufügen

Um ein neues IHK-Lernmodul / Lab anzulegen, steht ein automatisches Scaffolding-Tool bereit:

```bash
npm run new-lab -- <PascalName> "<Titel>" [kategorie] [schwierigkeit]
```

**Beispiel:**
```bash
npm run new-lab -- RaidLevel "RAID-Level Studio" hardware Intermediate
```

Das Skript legt an:
1. `src/utils/<PascalName>Engine.js`
2. `src/utils/<PascalName>Engine.test.js`
3. `src/components/Content/<PascalName>Lab.jsx`
4. Trägt das Lab in `src/data/labRegistry.js` und `src/data/labModulesData.js` ein.

Anschließend:
- Berechnungslogik & Formeln in der Engine implementieren und mit Unit-Tests absichern.
- UI gestalten und Barrierefreiheit beachten.
- Lab-Dokumentation aktualisieren:
  ```bash
  npm run docs:labs
  ```
- `README.md` und `CHANGELOG.md` aktualisieren.

---

## 🧪 Qualitätssicherung & CI-Pipeline

Vor jedem Commit oder Pull Request muss die lokale Pipeline erfolgreich durchlaufen:

```bash
# 1. Linter prüfen (0 Fehler, 0 Warnungen)
npm run lint:ci

# 2. TypeScript-Typen prüfen
npm run typecheck

# 3. Alle Unit- und Integrationstests ausführen
npm test

# 4. Produktions-Build erstellen
npm run build

# 5. Bundle-Größenbudgets prüfen (App Shell < 105 KB)
npm run size

# 6. E2E-Tests ausführen (optional lokal, Pflicht in CI)
npm run e2e
```

Für schnelles Feedback während der Entwicklung:
```bash
npm run test:fast
```

---

## ♿ Barrierefreiheit (WCAG 2.1 AA)

- Jeder Button und jedes Eingabefeld muss über ein sichtbares Label oder ein `aria-label` verfügen.
- Kontraste müssen den WCAG 2.1 AA Standards entsprechen.
- Animationen müssen mit reduzierter Bewegung harmonieren (`body.reduced-motion` / CSS Media Query).

---

## 📝 Dokumentations-Pflicht

Bei **jeder** Änderung (neu hinzugefügte, geänderte oder gelöschte Dateien):
- **`CHANGELOG.md`**: Eintrag unter `## [Unveröffentlicht]` im Format von [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).
- **`README.md`**: Abschnitt *Änderungshistorie* und bei neuen Modulen die Ordnerstruktur und Beschreibung aktualisieren.

---

## 🔀 Pull-Request-Prozess

1. Erstelle einen Branch von `main`:
   ```bash
   git checkout -b feature/mein-neues-lab
   ```
2. Committe deine Änderungen mit aussagekräftigen Commit-Nachrichten (nach Conventional Commits, z. B. `feat: füge RAID-Level Studio hinzu`).
3. Stelle sicher, dass alle Tests und CI-Checks lokal grün sind.
4. Erstelle einen Pull Request auf GitHub und fülle das PR-Template vollständig aus.
