# CoOpVersusGame

Ein kooperatives und kompetitives 2D-Top-Down-Actionspiel, entwickelt in **Godot 4.x**. Das Spiel kombiniert prozedurale Levelgenerierung, verschiedene Charakterklassen, Wellen-Überlebenskampf, kooperative Rätsel und Bosse, interaktive Dungeonelemente sowie einen Upgrade-Shop.

---

## 🎮 Features

### 1. Charakterklassen- & Waffensystem
Es gibt 6 spielbare Klassen mit einzigartigen Fähigkeiten, Werten und **individuellen Waffentypen**, die durch Drücken der Taste `C` gewechselt werden können (sofern freigeschaltet):
*   **Soldier (Soldat):** Ausgewogene Werte, verfügt über ein Schutzschild. Schießt einen *Standard-Blaster*.
*   **Scout (Späher):** Hohe Geschwindigkeit, schneller Dash. Schießt einen *3-er Schrotflinten-Streuschuss* mit hoher Streuung, aber kürzerer Reichweite.
*   **Tank (Panzer):** Sehr hohe Lebenspunkte, langsamer, starkes Schild. Schießt eine *schwere explosive Rakete*, die bei Einschlag Flächenschaden (AoE) an Gegnern verursacht.
*   **Engineer (Ingenieur):** Kann Geschütztürme (Turrets) platzieren. Schießt einen *durchdringenden Laser*, der bis zu 3 Gegner durchschlagen kann.
*   **Mage (Magier):** Kann sich teleportieren (begleitet von einem *Swoosh-Audioeffekt*) und Heilzauber wirken. Schießt eine *zielsuchende Magiekugel*, die eigenständig auf nahe Feinde zusteuert.
*   **Rogue (Schurke):** Kann sich tarnen, sodass Gegner ihn ignorieren. Schießt einen *Giftpfeil*, der beim Auftreffen eine giftige Pfütze hinterlässt, die Schaden über Zeit verursacht.

### 2. Prozedurale Dungeon-Generierung & Lichtsystem
*   **Dungeon-Generierung:** Der `DungeonGenerator` erzeugt zufällige Dungeon-Layouts mithilfe von **Random Walk / Cellular Automata**-Algorithmen.
*   **Dynamische Schatten:** Das TileSet verfügt über eine Licht-Okklusionsschicht (`LightOccluder2D`). Wände blockieren Licht physikalisch korrekt und werfen realistische Echtzeit-Schatten, wenn sie von Fackeln oder Spielern angestrahlt werden.
*   **Sicherer Spawn:** Der 5x5-Mittelbereich des Dungeons wird immer als Bodenfläche freigegraben, um Blockaden beim Start zu verhindern.

### 3. Interaktivität & Dungeongefahren
*   **Explosive Fässer:** Rote Fässer spawnen im Dungeon. Sie nehmen Schaden und detonieren bei Zerstörung mit einem wuchtigen Explosionseffekt, der nahen Spielern und Gegnern massiven Schaden zufügt.
*   **Stachelfallen:** Fallen, die periodisch aus- und einfahren. Aktive Stacheln verletzen jede Entität, die auf ihnen steht.
*   **Wegfindung (Pathfinding):** Gegner nutzen einen `NavigationAgent2D` und weichen Wänden oder Hindernissen intelligent aus, um den Spieler zu verfolgen (ausgenommen Geister).

### 4. Kooperative Rätsel & Synergien
*   Das Spiel enthält **Druckplatten (Pressure Plates)** und **Puzzle-Türen (PuzzleDoors)**.
*   *Engineer-Synergie:* Die Geschütztürme des Ingenieurs können auf Druckplatten platziert werden und halten diese gedrückt, was Solo-Spielern das Lösen von Koop-Rätseln ermöglicht.

### 5. Upgrade- & Meta-Shop
*   **In-Game Shop (`Tab`-Taste):** Punkte können gegen permanente Statusverbesserungen (Lauftempo, Max Leben, Feuerrate, Dash-Abklingzeit) eingetauscht werden.
*   *QoL:* Der Shop zeigt die aktuellen Werte des Spielers (z. B. Lauftempo in Pixeln, Abklingzeiten in Sekunden) in Echtzeit an.
*   **Credits & XP Progression:** Lokales Speichern in `user://scores.json`.

### 6. Sound-Synthese in Echtzeit
Der `AudioManager` erzeugt retro-artige Soundeffekte komplett programmgesteuert über `AudioStreamGenerator` (keine externen Sounddateien benötigt!):
*   Schießen, Treffer und Boss-Spawn.
*   Neue synthetische Effekte für **Fass-Explosionen, Stachelfallen, Teleportationen und Power-ups**.
*   Dynamische Hintergrundmusik, die bei geringem Leben oder Bossbegegnungen an Tempo und Intensität zunimmt.

### 7. Minimap mit Fog of War
*   Die Minimap oben links zeigt Spieler und nahe Feinde an.
*   **Fog of War:** Die Struktur des Dungeons (Wände und Wege) wird auf der Minimap erst sichtbar, wenn ein Spieler die Region tatsächlich erkundet hat.

### 8. LAN-Lobby mit Ready-Check & Namenswahl
*   **Namenswahl:** Spieler können vor dem Beitritt oder Hosten ihren Wunschnamen eingeben.
*   **Ready-Check:** Clients können sich in der Lobby als "Bereit" markieren. Der Host sieht den Status aller Spieler und kann das Spiel erst starten, wenn alle verbundenen Spieler bereit sind.

---

## 🕹️ Steuerung (Controls)

*   **Bewegung (Movement):** `WASD` oder Pfeiltasten.
*   **Schießen (Shoot):** `Leertaste` oder Mausklick.
*   **Ausweichen (Dash):** `Shift`-Taste.
*   **Schild / Spezialfähigkeit:** `E`-Taste.
*   **Klasse wechseln:** `C`-Taste.
*   **Upgrade-Shop öffnen:** `Tab`-Taste.
