# Minecraft-Pokémon

Ein Prototyp für ein voxel-basiertes Minecraft-Pokémon Crossover-Spiel, entwickelt in Godot 4.x mit C#.

## Beschreibung
Dieses Projekt vereint das Überlebens- und Bausystem von **Minecraft** mit den Sammel- und Kampfelementen von **Pokémon**.

In der aktuellen Version bietet das Spiel:
- **🌟 Dynamax-Nester & Multi-Phasen Raid-Bosse (`RaidDenBlock`):**
  - Dynamax-Nester mit Lichtsäulen in der Voxel-Welt.
  - Gigadynamax-Mewtu (2500 HP) mit Barriere-Schutzschilden, Boss-Phasen und Koop/Solo-Kampf.
  - Meisterball-, SpAtk-EV- und EP-Belohnungen.
- **🤖 Pokémon-Helfer & Basis-Automatisierung (`HelperStationBlock`):**
  - Zugewiesene Begleiter automatisieren Prozesse:
  - *Feuer-Pokémon:* Verdoppeln Schmelzgeschwindigkeit von Erzen.
  - *Wasser-Pokémon:* Bewässern Felder automatisch.
  - *Boden-/Gesteins-Pokémon:* Fördern automatisch Eisen- und Kohle-Erze.
- **⚔️ 4-Moves-System mit Level-Up Learnsets & PP-Verwaltung:**
  - Jedes Pokémon verwaltet 4 individuelle Attacken.
  - Attacken-Lernen bei Levelanstieg inklusive Move-Ersatzlogik.
- **🧬 Vollständiges IV (0-31) & EV (0-252, Max 510) Status-System & Zucht-Genetik:**
  - Wesen-Multiplikatoren auf Angriff, Verteidigung und Initiative.
  - Effort Values (EVs) durch Kämpfe oder Raid-Siege.
  - Pensionszucht mit Fatumknoten (5 IVs vererben) & Ewigstein (Wesen vererben).
- **🧠 Taktische Trainer-KI:**
  - Intelligente Entscheidungen (Tränke bei niedrigen KP, Taktik-Wechsel bei Typ-Nachteil).
- **🌙 Tag-/Nacht-Spawns & Neue Spezies (Nachtara & Psiana).**
- **🗺 Live Minimap-HUD Overlay & Voxel-Radar.**
- **🔊 Synthetisierte Pokémon-Rufe (Custom Cries).**
- **🏆 Champ-Titel & Elite-Rematches.**
- **🏛 Voxel-Geheimbasis & Trophäen-Blöcke.**
- **🔵 Ball-Varianten:** Pokeball, Superball, Hyperball, Meisterball, Schwerball, Netzball, Finsterball, Tauchball.
- **🎆 Partikel-Feuerwerk & Jubel-Effekte.**
- **📖 Interaktives 3D-Pokédex-System (`P`-Taste).**
- **🌊 Wasser-Surfen, Land-Sprint & Fliegen (`F`-Taste).**
- **⚡ Status-Zustände im Kampf:** Paralyse, Verbrennung und Vergiftung.
- **✨ Shiny-Pokémon:** 8% Chance auf seltene Glanzformen mit Sternen-Partikel-Aura.
- **🎒 Held-Items:** Zauberwasser, Holzkohle, Glücks-Ei (+100% XP), Fatumknoten, Ewigstein, Wahlband, Fokus-Gurt, Überreste.
- **🐉 25+ Voxel-Pokémon Spezies & Mega-Evolutionen.**
- **🏘 Voxel-Dörfer, Beeren-Landwirtschaft & Dynamisches Wetter.**
- **🐣 Pokémon-Pension & Zucht-System.**
- **🌐 Multiplayer & Koop Manager (`H` / `J` Tasten).**
- **Tag / Nacht-Zyklus, Fackeln & JSON Save/Load (`F5`/`F9`).**

---

## Projektstruktur und Inhalte

```
Minecraft-Pokemon/
├── Scenes/                  # Alle Godot-Szenendokumente
│   ├── Main.tscn            # Hauptszene (Umgebung, TerrainController, EffectsManager, WeatherManager, Player)
│   ├── Player.tscn          # Spieler-Kollisionskörper, Kamera, Raycast und erweitertes HUD
│   ├── Monster.tscn         # 3D-Modell eines Voxel-Monsters (inkl. Shiny Aura)
│   └── Pokeball.tscn        # Physikalischer Pokeball (RigidBody3D)
├── Scripts/                 # Alle C#-Skripte für die Spiellogik
│   ├── AchievementManager.cs# Voxel-Achievements & Trophäen-System
│   ├── Player.cs            # Steuerung, Kampf, Raid-Interaktion, Automatisierung, UI, Save/Load
│   ├── TerrainController.cs # Prozedurale Biome, Raid-Nester, Voxel-Dörfer, Spawns
│   ├── BlockType.cs         # Enum und Hilfsklassen (RaidDenBlock, HelperStationBlock, etc.)
│   ├── Monster.cs           # Voxelmodelle, Shiny-Aura, Companion-Logik
│   ├── Pokeball.cs          # Flugverhalten, Kollision, Fangprüfungen & Multiplikatoren
│   ├── PokemonData.cs       # Datenmodell (IVs, EVs, Wesen, 4 Moves, HeldItem, Mega, Tera)
│   ├── MoveData.cs          # Attacken-Datenmodell (Name, Typ, PP, Buffs/Debuffs)
│   ├── BattleManager.cs     # Rundenbasierte Schaden-, Raid-Boss- und KI-Berechnungen
│   ├── BreedingManager.cs   # Pensions-Zucht, Fatumknoten-Genetik & Schrittzähler-Ausbrüten
│   ├── WeatherManager.cs    # Dynamisches Wetter mit Partikeln & WeatherChanged-Event
│   ├── NpcTrainer.cs        # KI & Daten für NPC-Trainer & Arenaleiter
│   ├── NpcVillager.cs       # Voxel-Dorf Händler NPC
│   ├── HostileMob.cs        # Gegner-KI für Voxel-Creeper & Skelette
│   ├── MultiplayerManager.cs# ENet Multiplayer mit Positions- & Team-Sync
│   ├── EffectsManager.cs    # Partikeleffekte, Pokémon-Rufe & Feuerwerk
│   ├── QuestManager.cs      # Quest-System mit Persistenz & QuestCompleted-Event
│   └── SaveSystem.cs        # Save/Load mit Schema-Versionierung & Migration
├── Minecraft-Pokemon.Tests/ # xUnit-Unit-Tests (dotnet test)
│   └── BattleManagerTests.cs # 60 Tests (Typ-Effektivität, Raid-Schilde, IV/EVs, Moves, Genetik)
├── project.godot
├── Minecraft-Pokemon.csproj
└── README.md
```

---

## Setup & Ausführung

### Voraussetzungen
- **Godot 4.x** (mit Mono/.NET Support)
- **.NET 8 SDK** oder neuer

### Bauen & Testen
```bash
# Hauptprojekt bauen
dotnet build Minecraft-Pokemon.csproj

# Unit-Tests ausführen (60 Tests)
dotnet test Minecraft-Pokemon.Tests/Minecraft-Pokemon.Tests.csproj
```

### Spielstart
1. Öffne das Projekt in Godot 4.x.
2. Starte mit **F5** oder dem **Play**-Button.

---

## Steuerung
- **W, A, S, D:** Fortbewegen / Fliegen / Surfen
- **Leertaste (Space):** Springen / Steigen im Flug
- **Shift-Taste:** Sinken im Flug
- **Linksklick:** Block abbauen / Creeper angreifen
- **Rechtsklick:** Block platzieren / Heil-Station / Zucht / Raid-Nest betreten / Helfer-Automatisierung / Beeren ernten / Händler ansprechen
- **1 - 8 / Mausrad:** Hotbar-Item auswählen
- **Q-Taste:** Pokeball / Superball / Hyperball / Meisterball werfen
- **R-Taste:** Pokémon aus dem Team als Begleiter beschwören / zurückrufen
- **F-Taste:** Auf Begleiter-Pokémon aufsteigen, fliegen oder surfen / absteigen
- **P-Taste:** Voxel-Pokédex öffnen / schließen (mit Suchfilter)
- **B-Taste:** Rundenbasierten Kampf starten
- **M-Taste (im Kampf):** Mega-Evolution auslösen
- **C-Taste:** Crafting-Menü öffnen / schließen
- **E-Taste:** Digitales PC-Boxen-System öffnen
- **I-Taste:** Grid-Inventar öffnen / schließen
- **N-Taste:** Quest-Log öffnen / schließen
- **H-Taste:** Multiplayer-Server hosten
- **J-Taste:** Multiplayer-Server beitreten
- **L-Taste:** Kampftempo umschalten (1x / 2x / 4x)
- **K-Taste:** Angel-Minispiel starten
- **Z-Taste:** Dynamax auslösen
- **T-Taste:** Terastallisierung auslösen
- **F5-Taste:** Spielstand speichern
- **F9-Taste:** Spielstand laden
- **Esc:** Mauszeiger freigeben / fangen

---

## Changelog – August 2026

### 🚀 Neu implementierte Groß-Features
1. **Dynamax-Nester & Multi-Phasen Raid-Bosse (`RaidDenBlock`):**
   - Lichtsäulen-Nester in der Welt.
   - Mehrstufige Schild-Barrieren, Raid-Logs, EP- und Meisterball-Belohnungen.
2. **Pokémon-Helfer & Basis-Automatisierung (`HelperStationBlock`):**
   - Begleiter übernehmen automatische Arbeiten (Erzabbau, Bewässerung, Schmelzen).
3. **4-Moves-System mit Level-Up Learnsets & PP-Verwaltung:**
   - Jedes Pokémon verwaltet bis zu 4 Moves, lernt bei Levelaufstieg neue Fähigkeiten und erlaubt Move-Ersetzungen.
4. **IV / EV System & Genetik-Zucht (`BreedingManager.cs`):**
   - 6-Werte IVs (0-31) und EVs (bis zu 510).
   - Vererbung mit Fatumknoten (5 IVs) und Ewigstein (Wesen).
5. **Taktische Trainer-KI (`BattleManager.EvaluateTrainerTactics`):**
   - Tränke-Nutzung bei niedrigen KP & Taktikwechsel bei Typ-Nachteil.
6. **Voxel-Rätsel & Transportsysteme:**
   - `ArenaPuzzleSwitch`, `IceSlideBlock` (Turbogleiten) und `RailTrackBlock` (Loren-Express-Fahrt).
7. **Biomspezifische Audio-Atmosphäre (`EffectsManager.PlayBiomeAmbience`):**
   - Vulkan-, Schnee-, Strand- und Gebirgs-Ambiente-Klänge.
8. **❤️ Pokémon-Freundschaft & Camping-Bonding:**
   - Zuneigungssystem (0–255), das durch gemeinsame Mahlzeiten am Camp gestärkt wird.
9. **👑 Voxel-Wettbewerbsbühne & Jury-Bänder (`ContestRibbonBlock`):**
   - Jury-Wertung basierend auf Coolness, Schönheit, Anmut, Klugheit, Stärke und Zuneigung inklusive Band-Auszeichnungen.
10. **⚡ Dynamische Wetter-Ereignisse (Gewitter & dichter Nebel):**
    - `Thunderstorm` & `HeavyFog` mit Partikeleffekten im `WeatherManager`.
11. **🌙 Team Rocket Nacht-Invasion & Mondschein-Duellanten (`NpcTrainer.cs`):**
    - Spezifische Herausforderer (*Team Rocket Rüpel* und *Mondschein-Astronaut*).
12. **📍 Live-Wegpunkte & Marker-System:**
    - Koordinaten-Markierungen auf der Minimap für Stützpunkte, Minen und Raids.
13. **🔬 Erweitertes Fossilien-DNA-Labor:**
    - Antike DNA-Sequenzierung mit garantierten perfekten 31 IVs und Urzeit-Shiny-Chancen.
14. **🌾 Voxel-Ranch & Weide-Gehege (`RanchTroughBlock`):**
    - Tröge & Weiden zur Team-Versorgung, Zuneigungssteigerung und Beeren-Ernte.
15. **🍂 Saisonale Blöcke & Herbstlaub (`AutumnLeavesBlock`):**
    - Herbst-Voxel-Dekorationen und dynamische Laub-Varianten.
16. **🍂 Dynamischer Jahreszeiten-Zyklus (`WeatherManager.SeasonChanged`):**
    - 4 rotierende Jahreszeiten (*Frühling, Sommer, Herbst, Winter*) mit Wetter- und Ambiente-Anpassungen.
17. **🏆 Turnier-Liga & Kampfzone (`BattleManager.GenerateBattleFrontierTeam`):**
    - Endlose Kampfserien mit steigendem Schwierigkeitsgrad und perfekten DV-Gegnerteams.
18. **xUnit-Testabdeckung:** 62 automatische Tests decken alle neuen Kernlogiken ab.

---

## Empfohlene nächste Ausbaustufen

1. **VR- / First-Person-Immersions-Modus:** Stereoskopische Kopfbewegung und taktiles Voxel-Mining für Godot OpenXR.
2. **Klang-Synthesizer & Pokédex-Sprachausgabe:** Audio-Vorlesen von Pokédex-Einträgen mit dynamischer Sprachsynthese.
3. **Flug-Rennen & Flug-Parcours:** Voxel-Ringe in den Himmels-Chunk-Höhen für Flug-Wettrennen mit Belohnungen.
