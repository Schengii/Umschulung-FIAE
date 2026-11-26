# Changelog

Alle nennenswerten Änderungen an **FinanzPortfolio CoPilot** werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/) und dieses Projekt hält sich an [Semantic Versioning](https://semver.org/lang/de/).

---

## [Unreleased]
### Sicherheit
- **Tresor**: PBKDF2 jetzt mit 600.000 Iterationen (neues `v2:`-Format); alte 100k-Tresore bleiben lesbar und werden beim nächsten Speichern automatisch migriert.
- **Tresor**: Bei aktivem Tresor werden Portfolios nicht mehr zusätzlich im Klartext in localStorage/IndexedDB abgelegt; der Tresor wird bei jeder Änderung aktualisiert (vorher veralteter Schnappschuss). Bestehende Klartext-Kopien werden beim Entsperren übernommen und entfernt.
- API-Key, Webhook-URL/-Token/-Logs, WebDAV-Zugang, Snapshots, Tags und Netto-Vermögen-Posten liegen bei aktivem Tresor nur noch verschlüsselt (`secureStore.ts`).
- `corsproxy.io` entfernt: Yahoo-Abfragen laufen über den eigenen, per Allowlist begrenzten Proxy `api/yahoo.ts` (`VITE_MARKET_PROXY_URL`, `off` zum Deaktivieren).
- Base64-Kodierung großer Tresore ohne Stack-Überlauf.
- **Passkey**: Entsperrung nutzt die WebAuthn-PRF-Erweiterung; der Schlüssel zum Entpacken der PIN liegt nicht mehr im Klartext neben den Daten. Alte Registrierungen werden verworfen (Passkey neu einrichten); ohne PRF-Unterstützung bleibt nur die PIN.
- **Recovery-Key** (160 Bit): Wiederherstellung der Master-PIN bei Vergessen; wird einmalig angezeigt, nach PIN-Änderung neu erzeugen.
- **Webhook-Backup** sendet nur noch den verschlüsselten Tresor (kein `local_unencrypted` mehr).
- **CSP** (Vercel, Netlify, `<meta>` im Build für GitHub Pages) ohne Inline-Skripte/eval; Service-Worker-Registrierung nach `main.tsx` verschoben. Zusätzlich HSTS und Permissions-Policy.
- CI: `npm audit --audit-level=high`.

### Behoben
- Verlustverrechnung: Verluste einzelner Verkäufe werden mit Gewinnen anderer Verkäufe verrechnet (`calculateGermanTax`).
- Kirchensteuer nach § 32d EStG korrekt (9 % → 27,99 %, 8 % → 27,82 %); zuvor falsche Formel und doppelte Berücksichtigung.

- Verlusttöpfe (`calculateEnhancedGermanTax`) nutzen echte FIFO-Einzelgewinne statt der 10 %-Umsatzschätzung; Aktienverluste nur mit Aktiengewinnen, Verlustvorträge fließen in die Steuer ein.
- `calculateDachTax` (DE) rechnet jetzt mit Teilfreistellung, Verlustverrechnung und ohne kurzfristige Krypto-Gewinne.
- Dividenden werden brutto versteuert (Quellensteuer mindert die Bemessungsgrundlage nicht mehr).
- Krypto: kurzfristige Gewinne laufen getrennt nach § 23 EStG (Freigrenze 1.000 €, ab 1.000 € voll steuerpflichtig) und nicht mehr über die 26,375 %-Abgeltungsteuer.
- Vorabpauschale: monatsanteilige Kürzung bei Erwerb im Steuerjahr (§ 18 Abs. 2 InvStG).
### Entwicklung
- Neue Tests für Krypto/Tresor, Secret-Store, Proxy-Allowlist und Steuerrecht (`germanTaxLaw.test.ts`).
- Linting mit Biome (`npm run lint` = Typecheck + Biome; `npm run lint:warnings` zeigt zusätzlich Warnungen). typescript-eslint unterstützt TypeScript 7 noch nicht.

### Offen
### Geplant
- WebSocket / Realtime-Kursticker für erweiterte Börsenplätze
- Multi-Währungs-Historisierung mit tagesgenauen EZB-Wechselkursen

---

## [1.0.0] - 2026-10-11

### ✨ Hinzugefügt (Added)
- **Sicherheit & Web Crypto Vault**:
  - Client-seitige AES-GCM 256-Bit-Verschlüsselung mit PBKDF2 (100.000 Iterationen) und SHA-256 für alle Depotdaten.
  - Master-PIN-Schutz und konfigurierbarer Inaktivitäts-Auto-Lock (5, 15, 30, 60 Minuten oder aus).
  - Versionierte Snapshots (letzte 5 Sicherungspunkte) mit 1-Klick Rollback vor destruktiven Aktionen oder Massenimporten.
  - Automatisierter Webhook Push-Backup (z. B. n8n, Home Assistant) und verschlüsselter WebDAV / Nextcloud Sync.
  - Automatischer Git Pre-Commit Hook (`.githooks/pre-commit`) zum Schutz vor unbeabsichtigtem Committen von `.env`-Dateien und echten API-Keys / Secrets.

- **🧹 Architektur-Bereinigung & Modularisierung**:
  - Bereinigung redundanter / ungenutzter Prototyp-Dateien (`CryptoTaxLossHarvestingModal.tsx`, `ocrParser.ts`).
  - Zentrale TypeScript Barrel-Exporte für modulare Architektur: [`src/components/index.ts`](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Finanzenportfolio/src/components/index.ts), [`src/services/index.ts`](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Finanzenportfolio/src/services/index.ts) und [`src/utils/index.ts`](file:///c:/Users/sche-/Desktop/Programmieren%20Projekte/Finanzenportfolio/src/utils/index.ts).
  - Konsolidierung redundanter Imports und Standardisierung der Projektversion auf 1.0.0 in `package.json`.

- **Portfolio-Analyse & Risikometriken**:
  - Zeitgewichtete Rendite (TTWRR) und interner Zinsfuß (IRR / IZF).
  - Volatilität, Sharpe Ratio und historischer Maximum Drawdown.
  - **Fama-French 5-Faktoren Risiko-Zerlegung**: Quantifizierung von Markt ($\beta$), Size ($\text{SMB}$), Value ($\text{HML}$), Profitabilität ($\text{RMW}$) und Investment ($\text{CMA}$) inklusive Quality Score (0-100).
  - **Asynchrone Monte-Carlo FIRE-Simulation**: 500-Pfade-Stresstest ohne UI-Blockaden zur Ermittlung von Ruin-Wahrscheinlichkeit und Entnahmestrategien.
  - **Rebalancing-Engine mit Drift-Toleranzbändern**: Planer für Kauf- und Rebalancing-Orders mit anpassbaren Schwellenwerten ($\pm 1\%$ bis $\pm 5\%$).
  - **Dividenden-Wachstums-Radar**: YoY-Wachstumsanalyse, Dividenden-Aristokraten-Klassifizierung und Mehrjahres-Cashflow-Prognosen.
  - **Optionen Delta-Hedging**: Portfolio-Delta-Aggregation und Put-Absicherungsvorschläge gegen Tail-Risk-Crashes.
  - **Krypto-Staking & DeFi**: 256 € Freigrenzen-Monitoring (§ 22 Nr. 3 EStG) und interaktiver Impermanent Loss Rechner.

- **Steuer- & Behördenassistenten (DACH-Region)**:
  - **Ausländische Quellensteuer-Rückerstattung**: Assistent für Schweiz (ESTV 82 I / Tax Voucher), Frankreich (Form 5000/5001), Österreich (ZS-RD1) und USA (W-8BEN).
  - **Anlage KAP & SO Export**: Schneller 1-Klick ELSTER / WISO Text-Export für die Einkommensteuererklärung.

- **Import / Export & Schnittstellen**:
  - Universeller CSV-Importer mit automatischer Erkennung für Portfolio Performance (PP), Parqet, Interactive Brokers (IBKR) und Trade Republic.
  - Multi-PDF OCR- und Text-Parser für Wertpapierabrechnungen.
  - Institutionelles Fonds-Factsheet mit A4-Druckansicht, CSV- und Markdown-Export.
  - iCal-Kalenderexport für anstehende Dividendenzahlungen.

- **Bedienung & UX**:
  - Spotlight Command Palette (`Strg + K` / `Cmd + K`) zur Tastaturnavigation.
  - Bestände-Tagging Studio (`#Core`, `#Satellite`, `#Dividende`, etc.) mit Sofort-Filterung.
  - Progressive Web App (PWA) mit Offline-Fähigkeit und Service Worker.
  - Responsive Dark- / Light-Mode Design mit Farb- und Glassmorphism-Akzenten.
  - Vitest Testsuite mit 50+ Unit- und Feature-Tests.
