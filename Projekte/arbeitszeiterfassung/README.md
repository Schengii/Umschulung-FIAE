# ⏱️ Arbeitszeiterfassung — OfficeTrack (PWA Zeiterfassung)

Eine PWA auf Enterprise-Niveau zur Erfassung von Arbeitsstunden, Überstunden und Abwesenheiten (Urlaub/Krankheit). Die App bietet Firebase Cloud-Synchronisation, eine automatisierte ArbZG-Pausenberechnung, erweiterte Projekt-Analytics per SVG-Donut-Chart und einen nativen Dark/Light-Mode.

---

## 🌟 Kernfunktionen

- **Offline-First Zeiterfassung**: Lokale Persistenz mit automatischer, konfliktfreier Synchronisation nach Firebase Firestore (Retry-Queue bei instabiler Verbindung).
- **ArbZG-Pausenautomatik**: Regelbasierte Engine berechnet gesetzliche Mindestpausen nach dem Arbeitszeitgesetz automatisch.
- **Projekt-Analytics**: Dynamische SVG-Donut- und Trenddiagramme zur Auswertung von Arbeitszeit je Projekt.
- **Export**: PDF-, CSV- und Excel-kompatible Exporte der erfassten Zeiten.
- **Karten-/Geo-Integration** (`geo.ts`, `map.ts`): Standortbezug für Projekte/Einsatzorte.
- **Dark/Light-Mode** & vollständige PWA-Installierbarkeit (eigener `sw.js` + `manifest.json`).

---

## 🧱 Architektur & Tech-Stack

- **Sprache**: TypeScript (`src/*.ts`), kompiliert/gebündelt mit **Vite**.
- **Legacy/Runtime-Ordner**: `js/` enthält die als Fallback mitgelieferten, nicht-gebündelten JS-Äquivalente der `src/*.ts`-Module (u. a. für den direkten `index.html`-Betrieb ohne Build-Schritt im Portfolio-Showcase).
- **Backend**: Firebase (Firestore + Hosting-Konfiguration in `firebase.json`/`.firebaserc`).
- **Tests**: Vitest + jsdom, Unit-Tests unter `src/__tests__/` (`arbzg.test.ts`, `geo.test.ts`, `projects.test.ts`, `storage.test.ts`).
- **Tooling**: ESLint (`.eslintrc.cjs`) + Prettier + Husky/lint-staged Pre-Commit-Hooks.

```
arbeitszeiterfassung/
├── index.html            # Einstiegspunkt (auch für den direkten Portfolio-Showcase ohne Build)
├── js/                    # Nicht-gebündelte JS-Module (Showcase-Fallback)
├── src/                   # TypeScript-Quellcode (Vite-Build)
│   ├── __tests__/         # Vitest Unit-Tests
│   ├── app.ts, storage.ts, charts.ts, arbzg.ts, geo.ts, map.ts, ...
│   └── css/styles.css
├── sw.js                  # Service Worker
├── manifest.json          # PWA-Manifest
├── firebase.json / .firebaserc
└── vite.config.js / tsconfig.json
```

---

## 🚀 Lokale Entwicklung

```bash
npm install
npm run dev        # Vite Dev-Server
npm run build       # Produktions-Build nach dist/
npm run preview     # Build lokal vorschauen
npm test            # Vitest Unit-Tests
npm run lint         # ESLint
```

---

## 🔗 Herkunft & Einbindung ins Portfolio

Dieses Verzeichnis ist eine manuell gepflegte Kopie (kein automatisierter Sync über `scripts/sync_projects.js` — siehe `portfolio-metadata.json` im Hauptrepo). Metadaten, Tags und Beschreibungstexte für die Portfolio-Übersichtsseite liegen in [`portfolio-metadata.json`](./portfolio-metadata.json).
