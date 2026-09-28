# 0007 — Git-Simulator: In-Memory-State statt DOM-als-State, SVG-Visualisierung, Custom-Parser

**Status:** Akzeptiert
**Datum:** 2026-09-28

## Kontext

Der Git-Simulator (`assets/js/git-simulator.js`, ~970 Zeilen) ist ein vollständig clientseitiges Lernwerkzeug, das ein interaktives Git-Repository mit Branch-Visualisierung, 6 Leveln und einer Terminal-Konsole simuliert. Bei der Implementierung standen drei zentrale Architekturentscheidungen an:

1. **Wie wird der Simulator-Zustand verwaltet?**
2. **Wie wird der Commit-Graph visualisiert?**
3. **Wie werden Git-Befehle verarbeitet?**

## Entscheidungen

### 1. In-Memory-State (`gitState`-Objekt) statt DOM-als-Wahrheitsquelle

Der gesamte Zustand (`commits`, `branches`, `head`, `activeBranch`, `commitCount`) liegt in einem zentralen `gitState`-Objekt im JavaScript-Speicher. Das DOM (Terminal, SVG-Graph, Levelanzeige) ist reine Ausgabe und wird nach jeder Zustandsänderung neu gerendert (`renderGraph()`).

**Alternativen:** Zustand aus dem DOM lesen (z. B. SVG-Knoten-Attribute auswerten) oder LocalStorage für Persistenz nutzen.

**Begründung:** Klare Trennung von Logik und Darstellung — `check()`-Funktionen der Level prüfen direkt `gitState`, ohne DOM-Traversal. Reset (`resetGitState()`) ist ein einzelner Funktionsaufruf statt DOM-Bereinigung. LocalStorage-Persistenz wurde bewusst weggelassen: der Simulator ist ein Lernwerkzeug, dessen Zustand nach Seitenreload frisch starten soll.

### 2. SVG-Visualisierung statt Canvas oder Bibliothek

Die Commit-Tree-Visualisierung wird als inline SVG erzeugt (`renderGraph()`, `layoutGraph()`). Koordinaten werden per Tiefensuche berechnet und direkt als SVG-Elemente (`<circle>`, `<line>`, `<text>`) ins DOM geschrieben.

**Alternativen:** HTML5-Canvas, oder eine externe Graphen-Bibliothek (z. B. D3.js, mermaid).

**Begründung:** SVG ist mit CSS stilisierbar (Dark/Light-Mode-Token greifen direkt), ohne externe Abhängigkeit (DSGVO-Richtlinie: keine CDNs), und bietet native Skalierung ohne Pixelrechnung. Canvas hätte HiDPI-Behandlung erfordert; externe Bibliotheken widersprechen der Projektregel "keine unnötigen externen Abhängigkeiten".

### 3. Custom-Command-Parser statt echter Git-Bibliothek

Git-Befehle werden per eigenem String-Parser in `executeGitCommand()` verarbeitet. Nur die im Simulator sinnvollen Befehle sind implementiert (`commit`, `checkout`, `branch`, `merge`, `rebase`, `stash`, `reset`, `log`, `status`).

**Alternativen:** isomorphic-git (vollständige Git-Implementierung in JS), oder WebAssembly-Port von libgit2.

**Begründung:** Der Simulator dient der Vermittlung von Git-Konzepten, nicht der Emulation eines echten Repositories. isomorphic-git würde ~500 KB zum Bundle addieren (widerspricht dem No-Bundler-Ansatz aus ADR-0001) und echte Dateisystem-Simulation erfordern. Der Custom-Parser erlaubt kontrolliertes, fehlerfreundliches Feedback auf unbekannte Befehle.

## Konsequenzen

- Kein Seiten-übergreifender Zustand: der Simulator-Stand geht beim Reload verloren (bewusst).
- Level-Checks (`check()`-Funktionen) operieren ausschließlich auf `gitState` — DOM-unabhängig und unit-testbar.
- Neue Git-Befehle erfordern Erweiterung des Custom-Parsers in `executeGitCommand()`.
- SVG-Layout (`layoutGraph()`) skaliert linear mit der Commit-Anzahl — bei sehr langen Simulationssessions (50+ Commits) kann die SVG-Darstellung eng werden; ein Scroll- oder Zoom-Mechanismus existiert nicht und wäre bei Bedarf nachzurüsten.
