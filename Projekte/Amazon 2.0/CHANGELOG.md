# 📋 Changelog – Amazon 2.0

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/) und dieses Projekt folgt den Richtlinien von [Semantic Versioning](https://semver.org/lang/de/).

---

## [Unreleased]
### Geplant
- 🌌 Fusion-Powered Supraleiter Quanten-Netzwerk Simulator
- 🤖 Bionischer 4D-Druck Vor-Ort-Fertigungs-Hub (Instant Local Micro-Factory)
- ⚡ Dezentrale CO₂-Tokenisierte Emissions-Futures & Direct Air Capture Zertifikate

---

## [3.8.0] - 2026-10-11
### Hinzugefügt
- **Sub-Orbital Point-to-Point Cargo Rocket Logistics** (`suborbitRocket.ts`, `suborbitRocketModal.ts`):
  - 45-Minuten ballistische Interkontinental-Frachtzustellung (*Starship Cargo MK-2*).
  - Hyperschall-Telemetrie mit Mach 18,2 und Magnetohydrodynamik (MHD)-Wärmeschild-Monitor (1.380 °C).
- **Sleep & Regeneration Neuro-Architecture AI** (`sleepErgoArchitect.ts`, `sleepErgoModal.ts`):
  - Wearable- & Schlafphasen-Sync (REM, Tiefschlaf, HRV) zur dynamischen Härtegrad- und Klimakonfiguration von Matratzen.
- **Merchant DeFi Staking & Liquidity Matrix** (`merchantLiquidityPool.ts`, `merchantLiquidityModal.ts`):
  - Dezentrale Micro-Lending Staking Vaults für Marktplatz-Händler mit 8,5 % APY und 150 % On-Chain Besicherung.
- **Geothermal & Volcanic Datacenter Cloud Tracker** (`geothermalCloud.ts`, `geothermalModal.ts`):
  - Monitoring von 100 % geothermisch betriebenen isländischen Rechenzentren mit 1.08 PUE Energieeffizienz.
- **Projekt-, AI- & Sicherheits-Konfiguration**:
  - Hinzufügen von `.env` und `.env.example`.
  - `.claudeignore` und `.geminiignore` zur Kontextfenster-Optimierung.
  - `CLAUDE.md` und `GEMINI.md` für standardisierte Entwicklungsleitfäden.
  - **Git Pre-Commit Hook** (`.githooks/pre-commit` & `scripts/pre-commit-check.mjs`) zum automatischen Blockieren von `.env`-Dateien und sensiblen API-Keys (Claude, OpenAI, Google Gemini, AWS, Stripe).
  - Vercel-Konfiguration (`vercel.json`) mit Sicherheitsheadern und SPA-Routing.
  - GitHub CI/CD Workflows (`.github/workflows/ci.yml`) und Issue-/PR-Templates.

### Bereinigt & Entfernt
- Entfernung von veraltetem `archive/`-Verzeichnis (alte monolithische JavaScript-Backups).
- Entfernung ungenutzter Boilerplate-Assets in `src/assets/` (`hero.png`, `vite.svg`, `typescript.svg`).
- Bereinigung ungenutzter und unreferenzierter Stub-Dateien und toter Funktionen (`a11y.ts`, `solarSailReflector.ts` etc.).

### Tests & Qualität
- 124 Vitest Tests über 75 Testdateien erfolgreich bestanden (100 % grün).
- 0 Warnungen im Production-Build (`tsc && vite build`).

---

## [3.7.0] - 2026-09-28
### Hinzugefügt
- **Neural-Audio Acoustic Hologram Suite** (`neuralAcousticHologram.ts`, `neuralAcousticModal.ts`):
  - Binaurale 3D-HRTF Raumakustik-Simulation mit umschaltbaren Sound-Räumen (Abbey Road Studio, Kölner Dom, Arena).
- **Autonomous Freeport Customs Vault Manager** (`freeportVault.ts`, `freeportModal.ts`):
  - Zoll- und steuerfreie Einlagerung von Luxusgütern im Schweizer Zollfreilager mit On-Chain Verwahrungszertifikat.
- **Hyperloop Express Tube Logistics Simulator** (`hyperloopLogistics.ts`, `hyperloopModal.ts`):
  - 1.000 km/h Vakuum-Röhren-Kapseltransport für 14-Minuten Express-Transit zwischen Metropolen.
- **Stratosphere Balloon IoT Mesh Relay** (`stratosphereBalloon.ts`, `stratosphereModal.ts`):
  - Solarbetriebenes HAPS-Höhenballon-Mesh in 20.450 m Höhe mit 420 km Ausleuchtungsradius.

---

## [3.6.0] - 2026-09-15
### Hinzugefügt
- **Holographic 3D Lightfield Display Engine** (`lightfieldDisplay.ts`, `lightfieldModal.ts`):
  - 16-Kanal Parallaxen-Verschiebung für brillenlose 3D-Tiefenwirkung im Browser.
- **KI-Multimarker Emotion & Facial Heatmap Tracker** (`facialEmotionTracker.ts`, `facialEmotionModal.ts`):
  - Lokale WebCam-Mikromimik-Analyse mit Aufmerksamkeits-Heatmaps.
- **Dezentrale Layer-3 zk-STARK Privacy Rollups** (`layer3Rollup.ts`, `layer3RollupModal.ts`):
  - Gebührenfreie Blitz-Checkouts in 42 ms mit 10.000 TPS Durchsatz.
- **Autonomes Frachtschiff- & Tiefsee-Logistik-Radar** (`maritimeLogistics.ts`, `maritimeModal.ts`):
  - Globales AIS-Satellitentracking für 24.000 TEU Mega-Carrier mit Wellenhöhen-Projektion.

---

## [3.5.0] - 2026-08-30
### Hinzugefügt
- **Quantum Key Distribution (QKD) Suite** (`qkdKeyExchange.ts`, `qkdModal.ts`):
  - Photonischer Quantenschlüsselaustausch nach E91 / Bell-Zuständen mit No-Cloning Garantie.
- **Ground Rover Lieferroboter-Schwarm** (`groundRoverSwarm.ts`, `groundRoverModal.ts`):
  - Autonome 6-Rad Bordstein-Zustellung mit LiDAR-Hinderniserkennung.
- **Bionic Exoskeleton Power Assist** (`exoskeletonErgo.ts`, `exoskeletonModal.ts`):
  - Carbon-Exoskelett Telemetrie mit +35 kg Hebeunterstützung.
- **Raman Laser Spectrometry Scanner** (`ramanSpectrometry.ts`, `ramanSpectrometryModal.ts`):
  - 785 nm Molekular-Echtheitsprüfung für Luxusuhren und Diamanten.

---

## [3.4.0] - 2026-08-10
### Hinzugefügt
- **AI Smart Solar Grid Logistics** (`solarGridLogistics.ts`, `solarGridModal.ts`).
- **Self-Healing Web3 Garantie-Smart Contracts** (`selfHealingWarranty.ts`, `selfHealingWarrantyModal.ts`).
- **Digital Olfaction Duft-Protokoll** (`digitalOlfaction.ts`, `digitalOlfactionModal.ts`).
- **Brain-Computer-Interface (BCI) Mind-Shopping** (`bciMindShopping.ts`, `bciMindModal.ts`).

---

## [3.3.0] - 2026-07-22
### Hinzugefügt
- **Metaverse VR Spatial Commerce & Haptic Gloves** (`vrSpatialCommerce.ts`, `vrSpatialModal.ts`).
- **Bitcoin Lightning Micro-Payment Streaming** (`lightningStream.ts`, `lightningStreamModal.ts`).
- **DNA- & Biomarker Ernährungs-Konfigurator** (`dnaNutrition.ts`, `dnaNutritionModal.ts`).
- **Satelliten-IoT Fallback via Starlink Direct-to-Cell** (`satelliteTracking.ts`, `satelliteTrackingModal.ts`).

---

## [3.2.0] - 2026-07-05
### Hinzugefügt
- **Neuro-Adaptive Eye-Tracking Navigation** (`eyeTracking.ts`, `eyeTrackingModal.ts`).
- **Zero-Knowledge Proof (zk-SNARKs) Alters- & Bonitätsprüfung** (`zkProofAuth.ts`, `zkProofModal.ts`).
- **Cold-Chain IoT Sensor Telemetrie** (`coldChainSensor.ts`, `coldChainModal.ts`).
- **Multimodale Bild- & Audiosuche** (`multimodalSearch.ts`, `multimodalSearchModal.ts`).

---

## [3.1.0] - 2026-06-18
### Hinzugefügt
- **NIST Post-Quantum Kryptografie** (ML-KEM-768 Kyber & ML-DSA-65 Dilithium).
- **Cross-Border Customs & Global Tariffs Engine** mit DDP Vorabberechnung.
- **Amazon Prime Air Drohnen 3D Flight-Tracker** (`droneLogistics.ts`).
- **Biometrischer Health- & Ergonomie-Sync** (`healthErgoSync.ts`).

---

## [3.0.0] - 2026-05-30
### Geändert
- **Vollständige Modularisierung**: Migration von monolithischem JS zu sauberem TypeScript + Vite Bundle.
- Einführung von Vitest für automatisierte Tests.
- Einführung des modularen Custom-CSS Design-Systems.
- Dynamisches ML-Pricing, WebRTC Receipt AirDrop, Smart-Mirror Dressing Room und CRDT Offline-Sync.

---

## [1.0.0 – 2.0.0] - Historisch
### Initial
- Ursprünglicher Proof-of-Concept Online-Shop mit Katalog, Warenkorb, Suche und Bestellabwicklung.
