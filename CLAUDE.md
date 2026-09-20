# CLAUDE.md — Projekt-Leitfaden & Kontext für Umschulung-FIAE

Entwickler- und KI-Leitfaden für das zentrale Portfolio- und Prüfungsvorbereitungs-Repository **Umschulung FIAE** von Maximilian Schenk.
Dieses Dokument definiert Architektur, Entwicklungsrichtlinien, Build-/Testbefehle und Qualitätsstandards für Claude Code.

---

## 🎯 Projekt-Überblick & Tech-Stack

Moderne, performante und barrierefreie Web-App (PWA) als Showcase für die Ausbildung/Umschulung zum **Fachinformatiker für Anwendungsentwicklung (FIAE)**.

- **Architektur:** Reines Vanilla HTML5, modernes CSS3 (Custom Design Tokens, Flexbox/Grid, Glassmorphism, Dark/Light Mode) und modulares Vanilla JavaScript (ES6+ ES-Module via `type="module"`).
- **Entwicklungs-Server:** `http-server` (Port 8080)
- **Testing & E2E:** Playwright E2E Test-Suite (`playwright test`) mit 54+ automatisierten Tests für Seitenstabilität und Projekt-Starts.
- **Code-Qualität & Linting:** ESLint 9 + Prettier (Flat Config `eslint.config.js`).
- **Offline & PWA:** Native Service Worker Implementierung (`sw.js`, Cache-Strategien) und `manifest.json`.
- **Hosting & Deployment:** Vercel / GitHub Pages mit optimierten CSP-Headern (`vercel.json`).
- **Datenschutz & A11y:** 100 % lokale Schriftarten (Inter & Outfit via WOFF2), WCAG 2.1 AA Konformität, barrierefreie Tastaturnavigation & ARIA-Live Regions.

---

## 🛠️ Häufige Entwickler- & Test-Befehle

| Aufgabe | Befehl |
| :--- | :--- |
| **Lokalen Dev-Server starten** | `npm run dev` *(Startet `http-server . -p 8080 -c-1`)* |
| **E2E-Tests ausführen (Playwright)** | `npm test` |
| **Linter prüfen** | `npm run lint` |
| **Linter Auto-Fix** | `npm run lint:fix` |
| **Projektdatenbank generieren** | `npm run generate-data` |
| **Daten-Synchronisation prüfen** | `npm run check-sync` |
| **Projekte synchronisieren** | `npm run sync-projects` |
| **Bilder optimieren/komprimieren** | `npm run optimize-images` / `npm run compress-images` |
| **Projektpfade & Links auditieren** | `npm run audit-project-paths` / `npm run check-project-links` |
| **OG Meta & Social Cards generieren**| `npm run add-og-meta` / `npm run generate-og-image` |

---

## 📂 Kern-Dateistruktur

```text
Umschulung-FIAE/
├── index.html                   # Haupt-Einstiegsseite & Personalisierung
├── package.json                 # Skripte und Dev-Dependencies
├── playwright.config.js         # Playwright E2E-Konfiguration
├── eslint.config.js             # ESLint Konfiguration (Flat Config)
├── sw.js                        # PWA Service Worker (Cache-First / Network-First)
├── manifest.json                # PWA Manifest
├── vercel.json                  # Vercel Deployment- und Security-Header
│
├── pages/                       # Alle 27 Inhalts- & Funktionsseiten
│   ├── home.html                # Hauptseite / Landing-Dashboard
│   ├── portfolio.html           # Projekt-Showcase (22 registrierte Projekte)
│   ├── ihk-cockpit.html         # IHK-Abschlussprojekt EcoChef (NWA, Phasenplan)
│   ├── lebenslauf.html          # Interaktiver Lebenslauf & PDF-Export
│   ├── ueber-mich.html          # Steckbrief, Skills & Transfermatrix
│   ├── dashboard.html           # IHK-Notensimulation (AP1 & AP2)
│   ├── architecture.html        # C4-Architektur & interaktiver Dependency Graph
│   └── ...                      # Weitere Fachseiten & Labore
│
├── assets/                      # Statische Assets & App-Logik
│   ├── css/                     # Stylesheets (style.css, modal.css, skeletons.css)
│   │   └── modules/             # Modulare Stylesheets
│   ├── js/                      # JavaScript Module
│   │   ├── main.js              # Kern-Initialisierung & Modul-Loader
│   │   ├── components.js        # Globale Komponenten (Header, Footer, Nav, A11y)
│   │   ├── constants.js         # Konstanten & Pfadauflösung (resolveAssetPath)
│   │   ├── portfolio.js         # Portfolio-Filterung & Rendering
│   │   ├── projects_data.js     # Generierte Datenbank (22 Projekte)
│   │   └── modules/             # Feature-Module (portfolio-copilot, ihk-cockpit, etc.)
│   ├── data/                    # JSON-Datenquellen (projects.json)
│   ├── fonts/                   # Lokale WOFF2 Fonts (DSGVO-konform)
│   └── images/                  # Optimierte WebP-Grafiken & Screenshots
│
└── scripts/                     # Node.js Automatisierungs- & Audit-Skripte
```

---

## 🧭 Richtlinien für Änderungen & Best Practices

1. **Pfadauflösung & Navigation:**
   - Pfade müssen über `resolveAssetPath` bzw. relative Pfade robust aufgelöst werden, um sowohl lokal unter `/` als auch in Unterpfaden oder Subpages fehlerfrei zu funktionieren.
2. **Daten-Konsistenz:**
   - Bei Änderungen an Projektdaten immer `npm run generate-data` und `npm run check-sync` ausführen, um `projects_data.js` und `projects.json` synchron zu halten.
3. **Barrierefreiheit (WCAG AA):**
   - Tastaturbedienbarkeit (`tabindex`, `focus-visible`, `Enter`/`Space`), ARIA-Attribute (`aria-expanded`, `aria-live`) und semantische HTML5-Elemente stets sicherstellen.
4. **Keine unnötigen externen Abhängigkeiten:**
   - Reines Vanilla JavaScript bevorzugen. Keine externen CDNs für Fonts oder Skripte einbinden (Datenschutz und Offline-Fähigkeit via PWA).
5. **Dokumentation & Changelog:**
   - Bei relevanten Feature-Erweiterungen oder Fixes das `CHANGELOG.md` aktualisieren.

---

## ⚡ Claude Code Tool-Nutzung

- **Spezialisierte Tools nutzen:** `Read`, `Edit`, `Write`, `Grep` und `Glob` statt Shell-Einzeilern.
- **Terminal/Bash:** Vorrangig für `npm run ...`, `npx playwright test` und Git-Befehle einsetzen.
