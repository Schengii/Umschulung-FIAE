# 🗺️ Maps – Professionelle All-In-One Navigation & Outdoor App

[![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-blue)](https://github.com/Schengii/Maps)
[![Framework](https://img.shields.io/badge/Framework-React%20Native%20%2B%20Expo-61DAFB)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://typescriptlang.org)
[![DSGVO](https://img.shields.io/badge/Datenschutz-DSGVO%20konform-green)](https://www.bfdi.bund.de/)
[![WCAG](https://img.shields.io/badge/Barrierefreiheit-WCAG%202.1%20AA-green)](https://www.w3.org/WAI/WCAG21/quickref/)
[![Lizenz](https://img.shields.io/badge/Lizenz-MIT-yellow)](LICENSE)

---

## 📋 Beschreibung

**Maps** ist eine moderne, hochperformante und voll ausgestattete Navigationsanwendung für **iOS und Android**, die die besten Funktionen von **Google Maps**, **Apple Maps**, **Komoot**, **Waze** und **Garmin** in einer leichten, datenschutzfreundlichen React Native Anwendung (Expo SDK 51 & TypeScript 5) vereint.

Die App richtet sich an spezialisierte Zielgruppen & Fortbewegungsmodi:
- 🚶 **Fußgänger & Wanderer**: **Augmented Reality (AR) 3D-Kamera-Navigation**, **KI-Tour-Guide & Audio-POI-Storytelling**, **Echtzeit Satelliten-Wetterradar Overlay**, Komoot-Routenführung mit **interaktivem Touch-Scrubber für Höhenprofile**, Wegoberflächen (Asphalt/Schotter/Trail), GPX-Track Import/Export, GPS-Tour-Aufzeichnung und OLED-Akkusparmodus.
- 👥 **Gruppen & Vereine**: **Social Group Ride & Live-Tracking** – Freunde in Echtzeit auf der Route mit Abstand, Tempo und SOS-Notruf sehen.
- ⌚ **Smartwatch-Träger**: **Apple Watch & WearOS Begleiter-Sync** mit Turn-by-Turn Vibrationstakten und Puls-Übertragung.
- 🚲 **Radfahrer & Sportler**: Fahrradrouten entlang von Radfernwegen, Trinkwasserstellen, Reparaturstationen sowie **Bluetooth BLE Sensor-Kopplung** (Pulszonen, Trittfrequenz, Leistungsmesser) und **Rundtouren-Generator**.
- 🚗 **Autofahrer & Infotainment**: Schnellste Route mit Live-Verkehr, Stauvermeidung, Abbiege-Sprachausgabe, **Spurassistent (Lane Guidance)**, **3D-Kamera-Perspektive**, **Spiegel-HUD (Head-Up-Display)**, **Apple CarPlay & Android Auto Display Sync**, **Live-Spritpreis-Finder** und **In-App Media Player mit Audio-Ducking**.
- ⚡ **Elektrofahrzeuge (EV)**: Intelligenter Laderouten-Planer mit automatischen High-Power-Charging-Stopps (CCS 150kW+), SoC-Kalkulation (State of Charge) und Energieverbrauchsschätzung.
- 🚆 **ÖPNV & Transit**: Multimodale Navigation mit U-Bahn, S-Bahn, Tram, Bus, Ticketpreis-Schätzungen, Umstiegen und Fußweg-Etappen.
- 🏢 **Indoor- & Etagennavigation**: Gebäude- und Stockwerksanzeige (z. B. U2, U1, EG, 1. OG) für Bahnhöfe, Einkaufszentren und Flughäfen mit Etagenwähler.
- 🛡️ **Community & Waze-Gefahrenmelder**: 1-Tap Schnellmelder für mobile Blitzer, Glatteis, Pannen, Unfälle und Stauenden.
- 🔒 **100% Autonome On-Device Routing Engine & Offline-Vektorkarten**: Echte lokale A*-Routenberechnung ohne Internet, verschlüsseltes Cloud-Backup & speicherplatzsparende MBTiles.

---

## ✨ Vollständige Feature-Übersicht

| Kategorie | Feature | Beschreibung |
|---|---|---|
| 🌧️ **Wetter- & Regenradar** | **Live Satellite Radar Overlay**| Animierte Niederschlags- & Wolkenradar Kacheln mit Zeitleisten-Player (-30 Min bis +45 Min Prognose) |
| 👥 **Social Group Ride** | **Live Konvoi & Group Tracking** | Freunde in Echtzeit auf der Route mit Abstand zum Guide, Tempo, Akkustand & 1-Tap SOS-Notruf sehen |
| 🤖 **KI-Tour-Guide** | **AI Audio Storytelling** | Sprachgestützter Reiseführer mit historischen & kulturellen Geschichten zu Sehenswürdigkeiten & Schlössern |
| 🚘 **CarPlay & Android Auto** | **Native Infotainment Sync** | Widescreen Auto-Display Simulator mit Quick-POI-Filter (Tankstellen, Rastplätze, Schnelllader) |
| 🔒 **Autonomes Offline-Routing**| **On-Device A* Engine** | Vollständig autarke lokale Pfadfindung ohne Server-Abhängigkeit bei Funklöchern |
| 👓 **Augmented Reality** | **AR Live Camera Guidance** | 3D-Abbiegepfeile, Distanz-Pins und POI-Wegweiser direkt schwebend im Live-Kamerabild des Smartphones |
| ⌚ **Smartwatch Companion** | **Apple Watch / WearOS Sync** | Live-Spiegelung von Turn-by-Turn Anweisungen, ETA und haptischen Vibrationen am Handgelenk |
| 🎵 **Media Player** | **In-App Audio & Podcasts** | Schwebender Mini-Player für Podcasts & Radio mit automatischem Audio-Ducking während Sprachansagen |
| 🗺️ **Karte & 3D** | **3D-Kamera & OSM-Tiles** | Neigungswinkel (Pitch 50°), Heading/Kompass-Ausrichtung, OpenStreetMap, Topo & Dark Matter Kacheln |
| 🚘 **Head-Up-Display** | **Windshield HUD Mode** | Spiegelverkehrter (`transform: scaleY(-1)`), kontrastreicher Nacht-HUD-Modus zum Ablegen auf dem Armaturenbrett |
| 📊 **Höhenprofil & Scrubber** | **SVG Elevation Scrubber** | Reales Höhenprofil via Open-Meteo API mit interaktivem Drag-Scrubber & Live-Marker-Synchronisation |
| 🚴 **Bluetooth Sensoren** | **BLE Sport Sensors** | Direkte Kopplung von Herzfrequenz-Brustgurten (Polar, Garmin), Trittfrequenz- und Leistungsmessern |
| 🏢 **Indoor-Navigation** | **Multi-Level Indoor Mapping** | Erkennung von Bahnhöfen/Malls mit interaktivem Etagenschalter (U2, U1, EG, 1. OG) & Plattform-POIs |
| 💾 **Offline-Vektorkarten** | **MBTiles / PBF Vector Maps** | Verwaltung und Download von leichten Offline-Vektorkartenpaketen nach Bundesland |
| ☁️ **Cloud-Sync** | **Encrypted Cloud Backup** | Ende-zu-Ende verschlüsselte lokale Sicherung & Wiederherstellung von Tracks, Favoriten & Einstellungen |
| 🛡️ **Community Waze-Alerts** | **Hazard & Camera Reporting** | 1-Tap Meldung von Blitzern, Glätte, Unfällen & Stau mit automatischer Haltbarkeit & Karteneinblendung |
| ⚡ **EV-Ladeplaner** | **HPC Charging Stop Optimizer** | Automatische Berechnung optimaler Ladestopps entlang der Langstrecke bei niedrigem SoC |
| 🚆 **ÖPNV / Transit** | **Multimodaler Fahrplan** | Detaillierte Verbindungen mit Liniennummern (U3, Bus 100, Tram 19), Umstiegszählern & Fahrpreisen |
| 🔄 **Rundtouren-Generator** | **Loop Route Planner** | Automatische Schleifengenerierung ab Startort nach Wunschdistanz (z. B. 25 km Rennrad) & Himmelsrichtung |
| ⛽ **Spritpreis-Finder** | **Live Fuel Prices** | Anzeige der günstigsten Tankstellen (Diesel, Super E5, E10) und Spritkosten-Kalkulation je Route |
| 🛣️ **Spurassistent** | **Lane Guidance** | Grafische Einblendung empfohlener Fahrstreifen vor Kreuzungen und Autobahnabfahrten |
| 📍 **Karten-Gesten** | **Long-Press Waypoint Placing** | Direktes Hinzufügen von Zielen oder Zwischenstopps durch langes Drücken auf die Karte |
| 🧭 **Tour Recorder** | **Outdoor GPS Track Recorder** | Eigene Touren aufzeichnen (Distanz, Höhe, Speed, Puls) & als `.gpx` exportieren und teilen |
| 🚰 **Outdoor POIs** | **Overpass POI Search** | Trinkwasserstellen, Fahrrad-Reparaturstationen, Campingplätze, Aussichtspunkte, Apotheken & Gastro |
| 🚗 **Tacho & Alerts** | **Speedometer & Haptics** | Live-Geschwindigkeitsanzeige + haptische Warnungen (`expo-haptics`) bei Tempoüberschreitung |
| 🌤️ **Wetter-Live** | **Open-Meteo Forecast** | Realtime-Wetter & Regenprognose am Zielort & im Turn-by-Turn Overlay |
| 🔍 **Suche & Verlauf** | **Recent Search History** | Adresssuche (Nominatim) mit `AsyncStorage`-Verlauf und 1-Klick-Auswahl |
| 🔋 **Energie** | **OLED Akkuspar-Modus** | Minimalistisches High-Efficiency Dark Theme für stundenlange Outdoor-Touren |
| 📸 **Community** | **Spot Highlights** | Erfassen, bewerten & teilen von schönen Aussichtspunkten & Rastplätzen |
| ♿ **Accessibility** | **WCAG 2.1 AA** | Hochkontrast-Modus, skalierbare Textgrößen (100–150%) & Screenreader-Support |
| 🔒 **Datenschutz** | **DSGVO-Banner** | Privacy-by-Default, ausschließlich lokale Datenverarbeitung & Art. 17 Datenlöschung |

---

## 🚀 Installation, Tests & Ausführung

### Voraussetzungen

- [Node.js](https://nodejs.org) (v18 oder höher)
- [npm](https://www.npmjs.com) oder [yarn](https://yarnpkg.com)
- [Expo CLI](https://expo.dev/tools): `npm install -g expo-cli`

### Installation

```bash
# Repository klonen
git clone https://github.com/Schengii/Maps.git
cd Maps

# Abhängigkeiten installieren
npm install
```

### App starten

```bash
# Entwicklungsserver starten
npm start

# Direkt für Android starten
npm run android

# Direkt für iOS starten (nur auf macOS)
npm run ios
```

### Qualitätsprüfung & Tests durchführen

```bash
# TypeScript Typenprüfung ausführen (0 Fehler)
npm run type-check

# Jest Unit-Tests ausführen (22 Tests, 100% Pass)
npm test
```

---

## 📁 Projektstruktur

```
Maps/
├── App.tsx                          # Root-Einstiegspunkt der App
├── app.json                         # Expo-Konfiguration (iOS & Android Background Modes)
├── package.json                     # Projektabhängigkeiten & Skripte
├── tsconfig.json                    # TypeScript Konfiguration
├── jest.config.js                   # Jest Test-Konfiguration
├── README.md                        # Projektdokumentation
├── __tests__/
│   ├── services.test.js             # Tests für Elevation, SpeedAlert, EV, Transit, Fuel & GPX
│   ├── phase2_services.test.js      # Tests für BLE-Sensoren, Indoor-Map, Vector-Maps & Cloud-Sync
│   ├── phase3_services.test.js      # Tests für AR-Navigation, Smartwatch Sync & Audio-Player
│   ├── phase4_services.test.js      # Tests für On-Device Routing, KI-Tour-Guide & CarPlay Sync
│   └── phase5_services.test.js      # Tests für Wetterradar & Social Group Ride
│
└── src/
    ├── types/
    │   └── navigation.ts            # TypeScript Interfaces (Radar, GroupRide, Transit, EV, BLE, Indoor, AR, CarPlay)
    │
    ├── theme/
    │   └── colors.ts                # Farbpaletten (Light, Dark, High-Contrast)
    │
    ├── services/
    │   ├── WeatherRadarService.ts   # Live-Wetterradar Kacheln & Zeitleisten-Player
    │   ├── GroupRideService.ts      # Social Group Ride & Live-Tracking Session Management
    │   ├── OfflineRoutingEngineService.ts # On-Device A*-Pfadfindungs-Engine (100% offline)
    │   ├── AITourGuideService.ts    # KI-Audioguide, Geofence-Storytelling & Hintergrundinfos
    │   ├── CarPlaySyncService.ts    # Apple CarPlay & Android Auto Protokoll-Sync
    │   ├── ARNavigationService.ts   # AR-Projektion & Peilungsberechnung für 3D-Live-Kamera
    │   ├── SmartwatchSyncService.ts # Smartwatch Sync (Apple Watch / WearOS) & Haptik-Steuerung
    │   ├── AudioPlayerService.ts    # In-App Media Streaming & automatisches Audio-Ducking
    │   ├── BLESensorService.ts      # Bluetooth LE Fitness-Sensoren (Herzfrequenz, Trittfrequenz, Watt)
    │   ├── IndoorMapService.ts      # Mehrstöckige Etagennavigation (Bahnhöfe, Malls, Airports)
    │   ├── VectorMapService.ts      # Offline-Vektorkarten (MBTiles / PBF)
    │   ├── CloudSyncService.ts      # Verschlüsseltes Cloud-Backup & Multi-Device Sync
    │   ├── ElevationService.ts      # Open-Meteo Höhendaten, Steigungsprozente & Gradienten
    │   ├── TransitService.ts        # ÖPNV-Fahrpläne, U-Bahn/Bus/Tram Verbindungen & Tickets
    │   ├── EVChargingService.ts     # Elektroauto-Ladestopp-Optimierung & SoC-Kalkulation
    │   ├── FuelPriceService.ts      # Tankstellen & Live-Spritpreise (Diesel, E5, E10)
    │   ├── HazardReportService.ts   # Community Waze-Style Gefahren- & Blitzermelder
    │   ├── LoopPlannerService.ts    # Automatischer Rundtouren-Generator
    │   ├── RoutingService.ts        # OSRM Routing, Lane-Guidance & multimodale Vermittlung
    │   ├── POIService.ts            # Overpass POI API (Wasser, Reparatur, Apotheken etc.)
    │   ├── TrackRecordingService.ts # GPS Tour-Aufzeichnung mit Geschwindigkeitsberechnung
    │   ├── WeatherService.ts        # Open-Meteo Live-Wetter
    │   ├── GpxService.ts            # GPX Import & Export
    │   ├── SpeedAlertService.ts     # Temporechner, Limit-Prüfer & Haptik-Triggers
    │   ├── OfflineTileService.ts    # SQLite Kachel-Downloads
    │   └── VoiceService.ts          # Turn-by-Turn Sprachausgabe
    │
    ├── context/
    │   ├── LocationContext.tsx      # GPS Position, Kompass-Heading & Tracking
    │   └── NavigationContext.tsx    # State Management (3D, HUD, AR, Radar, GroupRide, Watch, CarPlay)
    │
    ├── screens/
    │   ├── HomeScreen.tsx           # Haupt-Screen mit allen Overlays, Modals, AR, Radar & Etagenschaltern
    │   └── SettingsScreen.tsx       # Einstellungen (Theme, WCAG, DSGVO, Offline Maps)
    │
    └── components/
        ├── WeatherRadarControl.tsx  # Schwebendes Wetterradar-Control mit Timeline-Player
        ├── GroupRideModal.tsx       # Social Group Ride Manager & Live-Mitgliederliste
        ├── AITourGuideModal.tsx     # KI-Tour-Guide Audioplayer & Geschichten
        ├── CarPlayModal.tsx         # CarPlay & Android Auto Widescreen Display Simulator
        ├── ARNavigationOverlayModal.tsx # AR-Kamera Wegweiser & Richtungs-Pins
        ├── SmartwatchCompanionModal.tsx # Smartwatch-Begleiter Vorschau & Sync
        ├── NavigationAudioPlayer.tsx# Schwebender Musik-/Podcast-Player mit Audio-Ducking
        ├── IndoorLevelSelector.tsx  # Vertikaler Etagenschalter für Gebäude
        ├── BLESensorModal.tsx       # Bluetooth BLE Sport-Sensor Dashboard
        ├── OfflineVectorMapsModal.tsx# Offline-Vektorkarten Download-Manager
        ├── CloudSyncModal.tsx       # Ende-zu-Ende verschlüsselte Cloud-Sicherung
        ├── MapViewComponent.tsx     # 3D-Kamera, OSM & Radar Tiles, Group-Marker, Scrubber
        ├── ActiveNavigationOverlay.tsx # Turn-by-Turn, Spurassistent, HUD-Button, Hazard-Quick-Report
        ├── HUDOverlayModal.tsx      # Spiegelverkehrter Head-Up-Display Modus für Windschutzscheibe
        ├── ElevationProfileChart.tsx# Interaktives SVG 2D-Höhenprofil mit Touch-Scrubber
        ├── ReportHazardModal.tsx    # 1-Tap Gefahrenmelder (Blitzer, Glätte, Stau, Unfall)
        ├── LoopRouteModal.tsx       # Rundtouren-Planer nach Distanz & Himmelsrichtung
        ├── RouteDetailsCard.tsx     # Bottom-Sheet mit Fahrpreisen, Spritkosten, Ladedetails & GPX Export
        ├── HeaderBar.tsx            # Suchleiste, Transport-Tabs & Quick Actions
        └── ...
```

---

## 🔒 Datenschutz & Barrierefreiheit (DSGVO & WCAG 2.1 AA)

- **Datenschutz**: Sämtliche Geodaten und Verläufe werden ausschließlich lokal auf dem Endgerät in `AsyncStorage` bzw. im `FileSystem` verarbeitet. Ein Klick auf "Einwilligungen zurücksetzen" im `SettingsScreen` führt eine vollständige Datenlöschung gemäß **DSGVO Art. 17 (Recht auf Vergessenwerden)** durch.
- **Barrierefreiheit**: Vollständige Einhaltung der **WCAG 2.1 AA Richtlinien** mit Kontrastverhältnissen > 7:1 im Hochkontrastmodus, Screenreader-Labeling aller interaktiven Steuerelemente sowie stufenlos skalierbaren Textgrößen.

---

## 📜 Lizenz

Dieses Projekt steht unter der [MIT Lizenz](LICENSE).
