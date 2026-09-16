# 📈 FinanzPortfolio CoPilot

> **Professioneller, datenschutzfreundlicher & hochleistungsfähiger Portfolio-Tracker & Finanzanalyst** auf Basis von React 19, TypeScript, Vite, Web Crypto API, PWA und Vitest.

---

## 📚 Inhaltsverzeichnis
1. [Über das Projekt](#-über-das-projekt)
2. [✨ Feature-Highlights & Hauptfunktionen](#-feature-highlights--hauptfunktionen)
3. [⚖️ Steuer- & Finanzlogik (DACH-Region: DE, AT, CH)](#️-steuer--und-finanzlogik-dach-region-de-at-ch)
4. [⌨️ Shortcuts & Command Palette](#️-shortcuts--command-palette)
5. [🛠️ Technologie-Stack & Architektur](#️-technologie-stack--architektur)
6. [🔒 Sicherheit, Auto-Lock & Daten-Tresor (AES-GCM 256)](#-sicherheit-auto-lock--daten-tresor-aes-gcm-256)
7. [🚦 Entwicklungs- & Testbefehle](#-entwicklungs--und-testbefehle)

---

## 💡 Über das Projekt

Der **FinanzPortfolio CoPilot** ist eine moderne, datenschutzorientierte Client-Side Webapplikation (PWA) zur vollumfänglichen Analyse, Verfolgung und Optimierung von Wertpapier-, Immobilien-, Zins-, Krypto- und Derivate-Portfolios. 

### Warum FinanzPortfolio CoPilot?
- 🔒 **100% Datenschutz**: Keine Speicherung deiner Finanzdaten auf fremden Servern. Alle Transaktionen bleiben ausschließlich lokal in deinem Browser.
- ⚡ **Web Crypto Tresor & Auto-Lock**: AES-GCM 256-Bit Verschlüsselung aller Depotdaten via Master-PIN inklusive Inaktivitäts-Auto-Lock, PIN-Änderung und Entschlüsselungsfunktion.
- 🔄 **Versionierte Snapshots**: Bis zu 5 automatische Wiederherstellungspunkte vor Massenimporten mit 1-Klick Rollback.
- 🌐 **Automatisierter Webhook Push**: Verschlüsselte Tresor-Sicherungen per 1-Klick oder automatisch an private Automation-Server (n8n, Home Assistant).
- ⌨️ **Spotlight Command Palette**: Schnelle Suche und Tastaturnavigation via `Strg + K`.
- 📱 **Mobile First PWA**: 1-Klick-Installation auf iOS und Android mit resilientem Stale-While-Revalidate Offline-Cache.
- 📈 **Profianalysen**: TTWRR, IRR, dynamische Sharpe Ratio, echter Max Drawdown aus Transaktionshistorie, Fama-French 5-Faktor Zerlegung, Monte-Carlo FIRE-Simulation, Quellensteuer-Rückerstattung und Options-Prämienrenditen.

---

## ✨ Feature-Highlights & Hauptfunktionen

### 1. 📅 Finanzkalender mit iCal / .ics-Export (`CalendarExportModal.tsx` & `DividendCalendar.tsx`)
- **Universeller Kalender-Export**: Synchronisiere alle Zahltage, Ex-Dividenden-Termine und Festgeld-Fälligkeiten direkt mit Apple Kalender (macOS/iOS), Google Calendar oder Microsoft Outlook.
- **Drei Ereignis-Kategorien**:
  - *Erhaltener Cashflow:* Vergangene Dividendenzahlungen inklusive Betrag und Broker.
  - *Zukunfts-Prognose:* Hochrechnung zukünftiger Dividendenausschüttungen (3, 6 oder 12 Monate im Voraus) basierend auf deinen aktuellen Beständen.
  - *Zinstreppe & Festgelder:* Fälligkeitstermine von Sparbriefen und Termingeldern mit Benachrichtigung am Tag der Gutschrift.
- **Komfortable Bereitstellung**: 1-Klick-Download als `.ics`-Datei oder Direktkopieren des iCal-Contents in die Zwischenablage.

### 2. 🔁 DRIP Dividenden-Reinvestitions-Automatik (`DripCompoundModal.tsx`)
- **Zinseszins-Simulator (5 bis 30 Jahre)**: Interaktiver Vergleich des Vermögenszuwachses mit automatischer Wiederanlage der Dividenden (DRIP) vs. ohne Reinvestition (Ausschüttung auf das Verrechnungskonto).
- **Dualer AreaChart & Kennzahlen**: Visuelle Gegenüberstellung von Endvermögen, absolutem Zinseszins-Mehrwert (+X €) und annualisierter Überrendite.
- **1-Klick Ausführung**: Reinvestiere alle im laufenden Jahr erhaltenen Brutto-Dividenden mit einem einzigen Klick direkt als reale Nachkäufe in dein aktives Portfolio.

### 3. ⛏️ Erweiterte Krypto-Transaktionen & § 22 Nr. 3 EStG Steuerreport (`Transactions.tsx` & `TaxReportModal.tsx`)
- **Umfassende Transaktionstypen**: Volle Unterstützung für `STAKING`, `AIRDROP`, `MINING` und `FEE` (Gebühren) zusätzlich zu Kauf, Verkauf, Dividende und Cash-Buchungen.
- **Assetklassen-Katalog**: Transaktionserfassung für alle 8 Kategorien (Aktien, ETFs, Krypto, Anleihen, Immobilien, Edelmetalle, P2P Kredite, Cash).
- **Steuerlogik nach BMF-Richtlinien**:
  - Berücksichtigung der **256 € Freigrenze p.a.** gem. § 22 Nr. 3 Satz 2 EStG für Einkünfte aus Staking, Mining und Airdrops.
  - FiFo-Haltedauer-Tracking: Veräußerungsgewinne nach 1 Jahr Haltefrist bleiben auch bei gestakten Coins 100% steuerfrei (§ 23 EStG).

### 4. 📈 Benchmark-Vergleich & Alpha/Beta Engine (`BenchmarkComparison.tsx` & `Dashboard.tsx`)
- **Interaktiver Index-Wechsler**: Wähle flexibel zwischen den globalen Leitindizes **MSCI World**, **S&P 500**, **DAX 40** und **Bitcoin**.
- **Systematische Risiko-Attribution**:
  - *Jensen's Alpha ($\alpha$):* Exakte Messung deiner Outperformance über die risikofreie Marktrendite (2,0% EZB-Referenzzins).
  - *Markt-Beta ($\beta$):* Einstufung deines Portfolios in defensiv ($\beta < 0,9$), marktkonform ($\beta \approx 1,0$) oder volatil/aggressiv ($\beta > 1,1$).
  - *Tracking Error (p.a.):* Volatilität der Renditedifferenz zum gewählten Leitindex.
- **Interaktive Chartkurven**: Einzelne Benchmarkkurven können in der Legende per Klick ein- und ausgeblendet werden.

### 5. 📸 Smart Beleg & Foto Importer (`ReceiptScannerModal.tsx`)
- **Client-seitige Abrechnungserkennung**: Lade Screenshots, Fotos (PNG, JPG, WebP) oder PDF-Abrechnungen per Drag & Drop hoch.
- **Automatische Mustererkennung**:
  - Extrahiert Broker, Transaktionstyp (Kauf, Verkauf, Dividende, Staking), Ausführungsdatum, WKN / ISIN, Symbol, Stückzahl, Kurs, Gebühren und Steuern.
  - Optimiert für Trade Republic, Scalable Capital, ING, comdirect, Consorsbank und Bitpanda.
- **1-Klick Demo-Simulation**: Sofortiges Testen via voreingestellter Testabrechnungen mit interaktiver Buchungs-Übernahme.

### 6. ⚖️ DACH-Steueroptimierung (`TaxReportModal.tsx` & `SettingsModal.tsx`)
- **🇩🇪 Deutschland**: Abgeltungsteuer (26,375% inkl. Soli), Kirchensteuer, Sparer-Pauschbetrag (1.000 € / 2.000 € konfigurierbar), Vorabpauschale (§ 18 InvStG) basierend auf echten Beständen, Aktien- vs. Sonstiger Verlusttopf sowie Günstigerprüfung.
- **🇦🇹 Österreich**: Automatische Berechnung der Kapitalertragsteuer (**27,5% KESt flat**) auf Realisationsgewinne und Dividenden, OeKB-Meldefonds-Hinweise und Regelbesteuerungsoption (E1kv).
- **🇨🇭 Schweiz**: Private Kapitalgewinne auf Wertschriften sind **100% steuerfrei**! Getrennte Ausweisung der ordentlich steuerbaren Dividenden- & Zinserträge sowie Verrechnungssteuer-Anrechnung (35% VSt) im Wertschriftenverzeichnis.

### 7. ⚡ Werkzeuge & Assistenten Hub (`App.tsx`)
- **Aufgeräumte Navbar**: Statt überladener Einzelsymbole bündelt das "⚡ Werkzeuge"-Dropdown alle Spezialfunktionen strukturiert in drei Kategorien:
  - *📊 Analyse & Berichte:* DRIP Dividenden-Zinseszins, Finanzkalender & iCal Export, Dual Portfolio-Vergleich, Institutionelles Factsheet (PDF), Monte Carlo Stresstests, PDF-Monatsbericht.
  - *📑 Steuern & DACH:* Steuer- & Verlusttöpfe Report, Tax Loss Harvesting & Freibetrag, Ausländische Quellensteuer-Rückerstattung, Krypto FiFo Radar.
  - *📥 Daten & Cloud:* Smart Beleg- & Foto-Scanner, Universal CSV Importer, Stapel PDF Upload, Neobroker Order-Assistent, Nextcloud / WebDAV Sync, Offline QR-Code Transfer.

### 8. 🛡️ Gesetzliche Einlagensicherung in der Zinstreppe (`DepositLadderWidget.tsx`)
- **Klumpenrisiko-Frühwarnung**: Warnt sofort auffällig, sobald das aggregierte Anlagevolumen bei einem einzelnen Bankinstitut die gesetzliche Einlagensicherung von **100.000 €** übersteigt.
- **Vollständige Bearbeitbarkeit**: In-Place Bearbeitung von Festgeldern, Tagesgeldern und Sparbriefen inklusive Fälligkeitskalender.

### 9. 🏢 Immobilien & Cashflow-Tracker (`RealEstateTracker.tsx`)
- **Vollständige Objektdaten**: Verwaltung von Kaufpreis, aktuellem Marktwert, Darlehensrestschuld, Sollzins, Kaltmiete, monatlicher Bankrate und Bewirtschaftungskosten/Hausgeld.
- **KPIs & Renditen**: Brutto- und Netto-Mietrendite, Beleihungsquote (LTV), Netto-Eigenkapital (Equity) und monatlicher Netto-Cashflow nach Kosten.
- **In-Place Bearbeitung**: Editier-Modal zur direkten Anpassung existierender Immobilien.

### 10. ⚡ Sparplan-Sofortausführung (`SavingsSimulator.tsx`)
- **1-Klick Ausführung**: Mit dem Button "⚡ Jetzt ausführen" werden alle aktiven Sparpläne sofort als reale Kaufbuchungen zum aktuellen Datum und Kurs in die Transaktionshistorie eingebucht.

### 11. 📊 Interaktive Tabellen-Sortierung & CSV-Export (`Holdings.tsx` & `Transactions.tsx`)
- **Flexible Sortierung**: 1-Klick Sortierung auf allen Spalten auf- und absteigend.
- **1-Klick CSV Export**: Direkter Export der aktuellen Depotbestände und gefilterten Aktivitäten als formatierte CSV-Datei für Excel oder Steuersoftware.
- **Transaktionen bearbeiten**: Transaktionen können direkt in der Tabelle über das Bearbeiten-Symbol editiert werden.

### 12. 🎯 Echte Options-Prämienrendite & Greeks (`OptionIncomeTracker.tsx`)
- **Annualisierte Rendite**: Dynamische Berechnung der tatsächlichen annualisierten Rendite p.a. bezogen auf das gebundene Cash-Kollateral statt statischer Schätzwerte.
- **Delta-Hedging**: Portfolio-Delta-Aggregation und Absicherungsempfehlungen für Tail-Risk (Protective Puts).

### 13. 🏛️ Ausländische Quellensteuer-Rückerstattung (`WithholdingTaxRefundModal.tsx`)
- **Schweiz, Frankreich, Österreich & USA:** Automatische Berechnung rückforderbarer Quellensteuern (z. B. Schweiz 20% via ESTV Form 82 I / Tax Voucher, Frankreich 10% via Form 5000/5001, Österreich 12,5% via ZS-RD1).
- **Vollständig integriert:** Auch direkt über die Command Palette (`Strg + K` -> "Quellensteuer") erreichbar.

### 14. 🧬 Fama-French 5-Faktoren Risiko-Zerlegung (`FactorExposureWidget.tsx`)
- **Multi-Faktor Screening:** Quantifizierung von Marktrisiko (Beta $\beta$), Size-Prämie ($\text{SMB}$), Value/Growth-Tilt ($\text{HML}$), Profitabilitäts-Güte ($\text{RMW}$) und Investitions-Verhalten ($\text{CMA}$).

### 15. 🔒 Master-PIN Management & Web Crypto Tresor (`SettingsModal.tsx`)
- **PIN ändern & Tresor deaktivieren**: Sichere Änderung der Master-PIN unter Verifikation der alten PIN und Option zur dauerhaften Deaktivierung der Verschlüsselung.
- **Automatischer Inaktivitäts-Timer**: Automatisches Sperren nach 5, 15, 30 oder 60 Minuten.

---

## ⚖️ Steuer- und Finanzlogik (DACH-Region: DE, AT, CH)

| Land | Steuersatz auf Kursgewinne | Dividenden / Zinsen | Freibetrag | Besonderheiten |
|---|---|---|---|---|
| **🇩🇪 Deutschland** | 26,375% (inkl. Soli) | 26,375% (inkl. Soli) | 1.000 € (Single) / 2.000 € (Verheiratet) | Getrennte Verlusttöpfe (Aktien vs. Sonstige), Günstigerprüfung, Vorabpauschale (§ 18 InvStG), Krypto nach 1 Jahr steuerfrei (§ 23 EStG) |
| **🇦🇹 Österreich** | 27,5% (KESt flat) | 27,5% (KESt flat) | Keiner | Endbesteuerungswirkung, OeKB-Meldefonds für ausschüttungsgleiche Erträge (AgE), Regelbesteuerungsoption via E1kv |
| **🇨🇭 Schweiz** | **0% (Steuerfrei)** | Ordentlicher Einkommensteuersatz (~20% Ø) | Keiner | Private Kapitalgewinne steuerfrei, 35% Eidg. Verrechnungssteuer (VSt) wird bei Deklaration im Wertschriftenverzeichnis voll rückerstattet, kantonale Vermögenssteuer auf Gesamtvermögen |

---

## ⌨️ Shortcuts & Command Palette

| Tastenkombination | Aktion |
|---|---|
| <kbd>Strg</kbd> + <kbd>K</kbd> / <kbd>Cmd</kbd> + <kbd>K</kbd> | Spotlight Command Palette öffnen |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Befehl / Asset auswählen |
| <kbd>Enter</kbd> | Ausgewählte Aktion ausführen |
| <kbd>Esc</kbd> | Modal oder Suchfenster schließen |

---

## 🛠️ Technologie-Stack & Architektur

| Schicht | Technologie |
|---|---|
| **Frontend Framework** | React 19, TypeScript 6.0 |
| **Build Tool & Bundler** | Vite 8.1 (mit Rollup Manual Chunk-Splitting) |
| **Mobile & PWA** | Web App Manifest, Service Worker Caching (`sw.js`) mit Stale-While-Revalidate |
| **Charts & Visualisierung** | Recharts (Area, Bar, Pie, Radar, Line) |
| **Testing** | Vitest, Testing Library React, JSDOM |
| **Code Quality & Linting** | TypeScript `tsc --noEmit` |
| **Verschlüsselung** | Web Crypto API (PBKDF2 + AES-GCM 256-Bit) |
| **Deployment** | Vercel, Netlify, GitHub Pages, Cloudflare Pages |

---

## 🚦 Entwicklungs- & Testbefehle

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Entwicklungs-Server starten
npm run dev

# 3. Automatisierte Vitest Unit-Tests ausführen
npm run test

# 4. Code-Qualitätsprüfung ausführen
npm run lint

# 5. Produktions-Build erstellen
npm run build
```

---

*Erstellt mit ❤️ für maximale finanzielle Unabhängigkeit, Transparenz und kompromisslosen Datenschutz.*
