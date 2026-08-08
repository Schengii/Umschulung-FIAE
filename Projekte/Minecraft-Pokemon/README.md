# Minecraft-Pokémon

Ein Prototyp für ein voxel-basiertes Minecraft-Pokémon Crossover-Spiel, entwickelt in Godot 4.x mit C#.

## Beschreibung
Dieses Projekt vereint das Überlebens- und Bausystem von **Minecraft** mit den Sammel- und Kampfelementen von **Pokémon**.

In der aktuellen Version bietet das Spiel:
- **🌙 Tag-/Nacht-Spawns & Neue Spezies (Nachtara & Psiana):**
  - **Nachtara:** Unlicht-Pokémon mit leuchtenden Voxel-Ringen, das vor allem nachts in der Voxel-Welt auftaucht.
  - **Psiana:** Psycho-Pokémon, das bevorzugt am Tage spawnt.
- **🧬 Pokémon-Wesen & Status-Natures (Natures System):**
  - Jedes gefangene Pokémon besitzt ein individuelles Wesen (*Hart*, *Scheu*, *Mäßig*, *Froh*, *Kühn*), welches seine Statuswerte beeinflusst.
- **🗺 Live Minimap-HUD Overlay:**
  - Kompakte Minimap-Anzeige oben rechts im Screen mit Spieler-Koordinaten `[X / Z]` und Himmelsrichtungen.
- **🔊 Synthetisierte Pokémon-Rufe (Custom Cries):**
  - Spezifische Audio-Schreie über den `AudioStreamGenerator` beim Werfen (`Q`) oder Rufen (`R`) von Pokémon!
- **🏆 Champ-Titel & Elite-Rematches:** Dauerhafter **🏆 POKÉMON-CHAMP** Rang im Live-HUD & Rematches (Lv.70+).
- **🏛 Voxel-Geheimbasis & Trophäen-Blöcke:** Craftbare Dekorationen (`PokeStatueBlock`, `TrophyBlock`).
- **🔵 Ball-Varianten:** Pokeball, Superball (1.6x), Hyperball (2.5x), Meisterball (100%).
- **🎆 Partikel-Feuerwerk & Jubel-Effekte:** Bunte Voxel-Feuerwerke am Himmel bei Siegen & Eier-Schlüpfen.
- **📖 Interaktives 3D-Pokédex-System (`P`-Taste):** Lexikon zur Verfolgung deines Fangfortschritts über 21 Spezies.
- **🌊 Wasser-Surfen, Land-Sprint & Fliegen (`F`-Taste):** Lapras, Garados, Bisaflor, Raichu, Glurak, Zapdos.
- **⚡ Status-Zustände im Kampf:** Paralyse, Verbrennung und Vergiftung.
- **🧭 Voxel-Radar & Boss-Kompass:** Live-Meter-Entfernung zu Arenen, Dörfern, Dungeons & Liga-Palast.
- **✨ Shiny-Pokémon:** 8% Chance auf seltene Glanzformen mit Sternen-Partikel-Aura.
- **🎒 Held-Items:** Zauberwasser, Holzkohle, Glücks-Ei (+100% XP), Ewigstein.
- **🐉 21 Voxel-Pokémon Spezies:** Pikachu, Bisasam, Bisaknosp, Bisaflor, Glumanda, Glutexo, Glurak, Schiggy, Schillok, Turtok, Raichu, Nebulak, Alpollo, Gengar, Garados, Dragoran, Nachtara, Psiana, Mewtu, Zapdos, Arktos.
- **💥 Mega-Evolutionen (`M`-Taste im Kampf):** Mega-Glurak X, Mega-Bisaflor, Mega-Turtok, Mega-Mewtu Y.
- **🏘 Voxel-Dörfer, Beeren-Landwirtschaft & Dynamisches Wetter.**
- **🐣 Pokémon-Pension & Zucht-System (`BreedingPenBlock`).**
- **🏛 Boss-Dungeons & Legendäre Pokémon (Mewtu / Zapdos / Arktos).**
- **🌐 Multiplayer & Koop Manager (`H` / `J` Tasten).**
- **Poké-Center Heil-Station & Digitales PC-Speichersystem (`E`-Taste).**
- **Tag / Nacht-Zyklus, Fackeln & JSON Save/Load (`F5`/`F9`).**

---

## Projektstruktur und Inhalte

```
Minecraft-Pokemon/
├── Scenes/                  # Alle Godot-Szenendokumente
│   ├── Main.tscn            # Hauptszene (Umgebung, TerrainController, EffectsManager, WeatherManager, Player)
│   ├── Player.tscn          # Spieler-Kollisionskörper, Kamera, Raycast und erweitertes HUD (Pokédex, Minimap & Radar)
│   ├── Monster.tscn         # 3D-Modell eines Voxel-Monsters (inkl. Shiny Aura, Nachtara-Ringen & Psiana-Juwel)
│   └── Pokeball.tscn        # Physikalischer Pokeball (RigidBody3D)
├── Scripts/                 # Alle C#-Skripte für die Spiellogik
│   ├── Player.cs            # Steuerung, Flight/Riding/Surfing, Champ-Status, Pokédex P, Minimap, Cry-Audio, Save/Load
│   ├── TerrainController.cs # Prozedurale Biome, Voxel-Dörfer, Tag/Nacht-Spawns, Liga-Palast, Boss-Dungeons
│   ├── BlockType.cs         # Enum und Hilfsklassen (Water, Sand, HealStation, Torch, BreedingPen, TrophyBlock)
│   ├── Monster.cs           # Voxelmodelle (Garados-Kopfkamm, Nachtara-Ringe, Shiny-Glitzer-Aura)
│   ├── Pokeball.cs          # Flugverhalten des Balls, Kollision, Fangprüfungen & Multiplikatoren
│   ├── PokemonData.cs       # Datenmodell für Pokémon (Nature, StatusCondition, Shiny-Flag, HeldItem, Mega-Formen)
│   ├── MoveData.cs          # Attacken-Datenmodell (Name, Typ, Stärke)
│   ├── BattleManager.cs     # Rundenbasierte Schaden- & Status- & Held-Item Berechnungen
│   ├── BreedingManager.cs   # Pensions-Zucht & Schrittzähler-Ei-Ausbrüten
│   ├── WeatherManager.cs    # Dynamisches Wetter (Regen, Schnee) mit Partikeln
│   ├── NpcTrainer.cs        # KI & Daten für NPC-Trainer & Arenaleiter
│   ├── NpcVillager.cs       # Voxel-Dorf Händler NPC
│   ├── HostileMob.cs        # Gegner-KI für Voxel-Creeper & Skelette
│   ├── MultiplayerManager.cs# ENet Multiplayer Host/Join Manager
│   ├── EffectsManager.cs    # Partikeleffekte, synthetisierte Pokémon-Rufe & Feuerwerk Audio
│   └── SaveSystem.cs        # Spielstand speichern & laden in JSON (user://savegame.json)
├── project.godot            # Godot-Projektkonfigurationsdatei
├── Minecraft-Pokemon.csproj # MSBuild-Projektdatei für .NET C#
└── README.md                # Dokumentation
```

---

## Steuerung
- **W, A, S, D:** Fortbewegen / Fliegen / Surfen
- **Leertaste (Space):** Springen / Steigen im Flug
- **Shift-Taste:** Sinken im Flug
- **Linksklick:** Block abbauen / Creeper angreifen
- **Rechtsklick:** Block platzieren / Heil-Station / Zucht / Beeren ernten / Händler ansprechen
- **1 - 8 / Mausrad:** Hotbar-Item auswählen
- **Q-Taste:** Pokeball / Superball / Hyperball / Meisterball werfen
- **R-Taste:** Pokémon aus dem Team als Begleiter beschwören / zurückrufen
- **F-Taste:** Auf Begleiter-Pokémon aufsteigen, fliegen oder surfen / absteigen
- **P-Taste:** Voxel-Pokédex öffnen / schließen
- **B-Taste:** Rundenbasierten Kampf starten
- **M-Taste (im Kampf):** Mega-Evolution auslösen
- **C-Taste:** Crafting-Menü öffnen / schließen (Pokebälle, Superbälle, Hyperbälle, Trophäen-Blöcke, Zucht-Stall)
- **E-Taste:** Digitales PC-Boxen-System öffnen
- **H-Taste:** Multiplayer-Server hosten
- **J-Taste:** Multiplayer-Server beitreten
- **F5-Taste:** Spielstand speichern
- **F9-Taste:** Spielstand laden
- **Esc:** Mauszeiger freigeben / fangen
