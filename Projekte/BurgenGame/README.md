# Empire Classic - Casual Castle Builder

Ein anspruchsvolles, browserbasiertes Aufbauspiel mit isometrischer Grafik, simulierten Wirtschaftskreisläufen, Tag-Nacht-Zyklen, Erfolgen (Achievements), einem KI-gesteuerten Bot und vollständigem Offline-Support (PWA).

## 🚀 Technologie-Stack
- **Struktur:** HTML5 & Vanilla Javascript (ES6-Klassen)
- **Styling:** CSS3 (Premium Glassmorphism-Design, reaktive Layouts)
- **Grafik:** HTML5 2D Canvas (Isometrische Perspektive mit partikelbasierten Wettereffekten)
- **Audio:** Web Audio API (Prozeduraler Lieder-Synthesizer, kein externer Sound-Asset-Bedarf)
- **Offline/PWA:** Service Worker Caching & Web App Manifest

---

## 📂 Projektstruktur & Dateiverzeichnis
Das Projekt wurde sauber aufgeräumt und in logische Subverzeichnisse aufgeteilt:

```
new game/
│
├── index.html                  # Einstiegspunkt & HTML5-Dokumentenstruktur
├── manifest.webmanifest        # PWA-Manifest-Einstellungen
├── service-worker.js           # Cache-Handler für vollen Offline-Support
│
├── assets/                     # Spiel-Assets (Medien & Lokalisierung)
│   └── lang/                   # Übersetzungsdateien
│       ├── de.json             # Deutsche Übersetzungen
│       └── en.json             # Englische Übersetzungen
│
├── css/                        # Stylesheets
│   └── index.css               # Modernes CSS-Design-System & Layout
│
└── js/                         # JavaScript-Anwendungslogik
    ├── core/                   # Kernkomponenten der Engine
    │   ├── config.js           # Spielkonstanten, Gebäude- & Truppenwerte
    │   ├── persistence.js      # Speichern/Laden via LocalStorage
    │   ├── state.js            # Spielstatus-Verwalter & Tick-Loop
    │   ├── canvas.js           # Isometrischer Canvas-Renderer & Partikelsystem
    │   ├── ui.js               # Kern-HTML-Interface (HUD, Modaler Dialog-Manager)
    │   └── main.js             # Initialisierer & Bootstrap-Einstiegspunkt
    │
    ├── features/               # Einzelne Gameplay-Erweiterungen & Module
    │   ├── achievements.js     # Erfolgs-System (Achievements)
    │   ├── ai_bot.js           # KI-Bot zur Automatisierung von Aktionen
    │   ├── daily_quests.js     # Tägliche Missionen & Belohnungen
    │   ├── dungeons.js         # Dungeon-Erkundung & Beutezüge
    │   ├── heroes.js           # Heldenverwaltung, Level & Skilltree
    │   ├── leaderboard.js      # Bestenlisten-Modul
    │   ├── leaderboard.json    # Standard-Highscore-Werte
    │   ├── marketplace.js      # Handelsplatz für Ressourcen & Karrenbau
    │   ├── night_cycle.js      # Tag-Nacht-Zyklus-Simulator (DOM-Overlay)
    │   ├── outposts.js         # Außenposten-Erweiterung & Handelsrouten
    │   ├── raids.js            # Raubritter-Angriffe, Kämpfe & Combat-Visualizer
    │   ├── seasons.js          # Jahreszeiten-Manager (Effekte auf Produktion & Marschzeit)
    │   ├── sound.js            # Synthesizer für Hintergrundmusik & Soundeffekte
    │   └── tutorial.js         # Einstiegsführung für neue Spieler
    │
    └── utils/                  # Utility- & Hilfs-Skripte
        ├── theme.js            # Dark/Light-Theme-Verwalter
        ├── i18n.js             # Übersetzungs-Manager (Internationalisierung)
        └── analytics.js        # Herrschaftsstatistiken
```

---

## ⚙️ Neue Features & Gameplay-Verbesserungen

### 43. 🌍 Unendliche Prozedurale Weltkarte (Phase 1)
- **Grenzenloses Entdecken:** Die Weltkarte ist nicht mehr auf 10x10 Felder beschränkt, sondern wird prozedural durch **Perlin Noise** generiert. Spieler können unendlich in alle Himmelsrichtungen scrollen und ihr Reich ausdehnen.
- **Biom-Generation:** Die Landschaft formt sich organisch zu Seen, dichten Wäldern und unpassierbaren Gebirgsketten, berechnet auf Basis deines einzigartigen Map-Seeds.
- **Dynamische Raubritter:** Anstatt fester Spawns erzeugen sich Banditenlager und Ruinen organisch in den unerforschten Weiten und stellen sich auf deine Erkundung ein.

### 44. 🧩 Modding API & Plugin System (Option D)
- **Erweiterbares Modding-System:** Ermöglicht das Hinzufügen eigener Gebäude, Truppen und Skripte über einfache JSON-Konfigurationen oder JS-Skripte im Spiel.
- **In-Game Mod-Manager:** Neues UI-Panel unter `⚙️ Einstellungen -> 🧩 Modding`, über das benutzerdefinierte Mods hinzugefügt, geladen oder per Klick gelöscht werden können.
- **Beispiel-Mod Inkludiert:** Ein integrierter "Drachenhort & Zauberer"-Beispiel-Mod demonstriert das Hinzufügen neuer Truppentypen und Gebäude per Knopfdruck.

### 45. 🎮 Gamepad- & Tastatur-Steuerung (Option E)
- **Gamepad Controller API:** Volle Unterstützung für Xbox-, PlayStation-Controller, Steam Deck und sonstige Web-Gamepads.
  - **Linker Analogstick / D-Pad:** Reibungsloses Bewegen der isometrichen Kamera.
  - **Rechter Analogstick:** Steuerung eines virtuellen goldenen Cursors auf dem Bildschirm.
  - **Action-Buttons:** `A` / `Cross` zum Anklicken von Kacheln und Buttons, `B` zum Schließen von Modalen, `X` für das Baumenü, `Y` für die Weltkarte.
- **Tastatur-Hotkeys:**
  - `W, A, S, D` / `Pfeiltasten`: Kamera stufenlos verschieben.
  - `B`: Baumenü schnell öffnen.
  - `M`: Interaktive Weltkarte öffnen.
  - `H`: Heldenaltar öffnen.
  - `Leerzeichen`: Spiel pausieren oder fortsetzen.
  - `Escape`: Geöffnete Fenster schließen.

### 46. 🌐 Node.js Backend Server & Live-Weltchat (Option A)
- **Dedicated Node.js/Express Server:** Integrierter Server im Verzeichnis `server/` (Startbar via `npm run server`).
- **Cloud-Speicherung:** Sichert den Spielstand serverseitig in JSON-Dateien per REST API (`/api/save` & `/api/load`).
- **In-Game Weltchat:** Live-Kommunikation für alle Herrscher über das `💬 Weltchat`-Panel im Einstellungen-Menü.
- **Zentralisiertes Leaderboard:** Globale Highscores werden serverweit verglichen und synchronisiert.

### 47. ⚡ Reaktive UI Proxy Engine (Option B)
- **Automatische Data-Binding-Engine (`js/core/reactive_state.js`):** Verwandelt den Spielstatus `stateManager.state` in einen rekursiven Javascript `Proxy`.
- **HTML-Binding via `data-bind`:** DOM-Elemente können nun z.B. per `data-bind="resources.gold"` ausgezeichnet werden. Änderungen am Status lösen sofort und automatisch ein Re-Rendering des betroffenen Elements aus, ohne manuelle DOM-Querys.

### 48. 👑 Visuelles Stammbaum- & Dynastie-System (Option C)
- **Grafischer Familienstammbaum (`js/features/dynasty_tree.js`):** Interaktiver Stammbaum zur Verwaltung des Königsgeschlechts (Monarch, Gemahlin, Prinzen, Prinzessinnen).
- **Blutlinien-Traits & Vererbung:** Nachkommen erben mächtige Gene wie *Kriegerblut* (+15% Nahkampf), *Midas-Händchen* (+20% Gold) oder *Meisterarchitekt* (-15% Bauzeit).
- **Strategische Eheschließungen & Thronfolge:** Arrangiere dynastische Hochzeiten für 300 Gold oder lege fest, wer den Thron erben wird.

### 49. 🔮 Soundscape 2.0 & Canvas Partikel-Magie (Option D)
- **Magie-Partikeleffekte (`js/features/magic_particles.js`):** Dynamische Partikel-Visualisierung für Zauber, Heilungs-Auren, Feuerbälle, Magie-Funken und Segnungen direkt auf dem isometrischen Canvas.
- **Synthesizer SFX `magic`:** Web Audio API Erweiterung für magische Klangteppiche bei Heldenfähigkeiten und Zaubersprüchen.

### 50. 🎲 3D-WebGL Perspective Renderer
- **Echtes 3D-Canvas Rendering (`js/features/three_render.js`):** Ermöglicht das Umschalten von der klassischen 2D-Isometrie in einen drehbaren 3D-WebGL-Kamera-Modus (`🎲 3D-Ansicht`).
- **3D Gebäude-Projektion & Licht:** Rendert Quaderstrukturen mit Raumtiefe, Schatten und dynamischer Perspektiven-Projektion.

### 51. ⚡ Dynamische Naturkatastrophen & Wetter 3.0
- **Wetterereignisse & Zerstörung (`js/features/disasters_advanced.js`):** Simuliert spontane Blitzeinschläge, Dürrewellen (-50% Erntemenge) und Erdbeben.
- **Feuerwehrhaus & Katastrophenschutz:** Errichte Feuerwehrhäuser, um Brände an Gebäuden automatisch abzuwehren, oder erlässe den Evakuierungsbefehl (+20 Zufriedenheit).

### 52. ⚔️ Ritter-Turnier-System & Helden-Arena
- **Lanzenreiter- & Arenakampf (`js/features/tournament_arena.js`):** Schicke deinen Champion oder Helden in rundenbasierte Lanzenstechen-Duelle um Gold- und Edelstein-Preisgelder.
- **Taktische Aktionen:** Wähle zwischen *Lanzenschlag*, *Ansturm* (+50% Schaden) und *Schild heben* (-60% Gegnerschaden).

### 53. 🛡️ Gilden-System & Festungs-Belagerungskriege
- **Gilden-Gründung & Kasse (`js/features/guild_wars.js`):** Gründe deine eigene Gilde (z.B. *Gilde der Drachenritter*), sammle Rohstoffe in der Gilden-Bank und skaliere die Festungsstufe.
- **Kollektiver Belagerungskampf:** Belagere mächtige feindliche Drachenfestungen zusammen mit deinen Gildenmitgliedern für wöchentliches Gold und Rubine.

### 54. 🗺️ Visueller Karten- & Szenario-Editor
- **Map-Designer Tool (`js/features/map_editor.js`):** Zeichne per Klick individuelle 10x10 Map-Grids mit Wiesen, Burgen, Steinbrüchen, Flüssen und Banditenlagern.
- **JSON-Export & Import:** Speichere erstellte Szenarien als JSON-Format in der Zwischenablage ab oder lade Custom-Karten der Community.

### 55. 📈 Rohstoff-Börse & Aktienmarkt 2.0
- **Aktien-Handelsplatz (`js/features/stock_market.js`):** Handle mit Aktienanteilen bekannter Handelsgesellschaften (*Nordholz AG*, *Eisenbergbau GmbH*, *Südgold Bankverein*).
- **Passive Dividenden:** Kursveränderungen reagieren dynamisch alle 30 Sekunden; gehaltene Aktien werfen alle 30s automatische Gold-Dividenden ab.

### 56. 🔷 TypeScript Strikte Typisierung (`js/types/game.d.ts`)
- **Strikte Type-Safety:** Vollständige `.d.ts` Schnittstellen-Definitionen für `GameState`, `Resources`, `Building`, `TroopConfig` und `Mission` zur Vermeidung von Typfehlern bei künftigen Skalierungen.

### 57. ⚡ Vite Build- & Bundling Pipeline (`vite.config.js`)
- **Vite Setup:** Konfiguration für blitzschnelles HMR (Hot Module Replacement), Tree-Shaking und Produktion-Minifizierung unter `dist/`.

### 58. 🧪 Automatisierte Regressionstest-Suite (`scripts/test.js`)
- **Automatisierte Qualitätssicherung:** Test-Suite prüft Perlin Noise-Ränder, Konfigurations-Integrität und Reaktive-Proxy-State-Signale per `npm test` oder `node scripts/test.js`.

### 59. 🗄️ Backend Datenbank-Adapter (`server/db.js`)
- **Structured Database Adapter:** Strukturiertes Speichern von Benutzer-Spielständen auf dem Server mit Zeitstempeln und Datenvalidierung.

### 60. 📱 Mobile Viewport & CSS Refactoring
- **W3C Validierung:** Behebung von Viewport-Attribute-Warnungen (`maximum-scale`, `user-scalable`) und Auslagerung von Inline-Styles in `css/index.css`.








### 1. ⚔️ Premium 2D Kampf-Visualisierung
Beim Ausführen von Angriffskämpfen startet eine Live-2D-Simulation der Schlacht:
- Einheiten werden mit individuellen Waffensymbolen visualisiert (z. B. Schwerter für Schwertkämpfer, Bögen für Bogenschützen).
- Partikeleffekte und Funken sprühen an den Clash-Schnittstellen.
- Fliegende Schadenszahlen in Echtzeit zeigen die Intensität des Kampfes.

### 2. 🛡️ Heldenausrüstung & Seltenheitsstufen
Gegenstände, die in Dungeons erbeutet werden, besitzen Seltenheitsstufen (Common, Rare, Epic, Legendary):
- Das Heldenaltar-Ausrüstungs- und Inventarpanel ist farblich markiert (Grau, Blau, Violett, Gold).
- Angelegte Gegenstände verleihen dem gesamten Königreich signifikante Statuseffekte und Boni.

### 3. ⛵ Handelsrouten & Weltkarten-Handelskarren
- In der Karrenwerkstatt des Marktplatzes können Handelskarren für Holz, Eisen und Gold gebaut werden.
- Spieler können automatische Handelsrouten zu eroberten Außenposten zuweisen.
- Die Handelskarren bewegen sich physisch und animiert auf der Weltkarte zwischen Hauptburg und Außenposten und liefern regelmäßig Rohstoffe ab.

### 4. 🌦️ Wetterbedingte Marschzeit-Multiplikatoren
- Jahreszeiten und Wetterbedingungen beeinflussen direkt die Marschgeschwindigkeit deiner Armeen und Spione:
  - **Sommer**: Erhöhtes Tempo (+10% Geschwindigkeit).
  - **Herbst & Winter**: Schlechtes Wetter bremst Bewegungen (-10% / -25% Geschwindigkeit) aus.

### 5. 🤖 Intelligenter KI-Bot & Angriffs-Vorschlagssystem
Die KI wurde drastisch verbessert und agiert nun als intelligenter Mitspieler:
- **Quest- & Aufgaben-Erfüllung**: Erfüllt aktiv Hauptquests und gibt fertige tägliche Quests ab.
- **Wirtschaft & Steuern**: Verwaltet das Steuerhaus, startet und sammelt Steuereinnahmen selbstständig.
- **Kollisionssicherer Bau & Upgrades**: Platziert neue Gebäude kollisionsfrei auf dem 10x10-Raster (Ressourcen werden korrekt abgebucht) und wertet Gebäude systematisch auf (mit intelligenter Beachtung des Burgfried-Level-Limits, um Alert-Popups zu verhindern).
- **Militär & Helden**: Rekrutiert ausgewogen Truppen und schickt den Helden automatisch in den optimalen Dungeon.
- **Angriffs-Genehmigungssystem**: Greift gezielt Raubritter und unbesetzte Außenposten an und besetzt eigene leere Außenposten mit Garnisonen. Vor jedem Angriff fragt die KI den Spieler über eine schwebende Karte um Erlaubnis (kann im Einstellungs-Dropdown auf "Auto-Angriff" umgestellt werden).

### 6. ⚙️ Fehlerbehebung der Steuerung & Dropdown-Menü
- Klickbarkeit und Funktionalität des Einstellungen-Dropdowns in der oberen rechten Ecke wurden durch Anpassungen des Pointer-Event-Systems wieder vollständig hergestellt.

### 7. 🌦️ Canvas Wetter- & Jahreszeiteneffekte
- Partikelbasierte Animationen auf dem Canvas passend zur aktiven Jahreszeit:
  - Kirschblüten im Frühling, Sonnenstrahlen und Shimmer-Flares im Sommer, fallendes buntes Herbstlaub und dichter sinusförmig schwebender Schneefall im Winter.

### 8. ⚒️ Helden-Ausrüstungsschmiede
- Ein neues Handwerkssystem im Heldenaltar ermöglicht die Schmiedung mächtiger Waffen und Ränder (z.B. Eisenschild, Mythrilklinge) aus Rohstoffen (Eisen, Holz, Gold, Rubine) in verschiedenen Qualitätsstufen.

### 9. ⚔️ Echtzeit-Schlachtverlauf & Runden-Protokoll
- Die Kampf-Simulation besitzt ein interaktives Live-Protokoll, in dem jede Rundenaktion gelistet wird. Nach dem Kampf wird der gesamte Verlauf chronologisch im Bericht dargestellt.

### 10. 🐉 Weltkarten-Raidboss & Diplomatische Militärhilfe
- Ein legendärer *Uralter Drache (Level 6)* bedroht die Spielwelt. Spieler können 250 Gold ausgeben, um im Angriffspanel 10 zusätzliche Speerkämpfer als Unterstützung von ihren alliierten Nationen anzufordern.

### 11. 🚢 Diplomatische Allianz-Seehandelsrouten
- Wenn der Spieler ein Bündnis (Allianz) mit einer KI-Nation über das Diplomatie-Menü eingeht, wird ein profitabler Handelsweg im Seehafen freigeschaltet (bringt viel Gold und Edelsteine).

### 12. 🗿 Interaktive Dungeon-Abenteuer (Choose-Your-Own-Adventure)
- Das Durchqueren von Dungeons ist nun ein aktives Abenteuersystem. Der Held hat eigene Dungeon-HP und muss 3 zufällige Events (Golem, Speerfalle, Uralte Truhe) per Entscheidung bewältigen, wobei seine Heldenklasse und Ausrüstung seine Erfolgschancen steigern. Sinkt die HP auf 0, scheitert der Beutezug.
- Der KI-Bot kann diese Abenteuer eigenständig und klassenspezifisch spielen.

### 13. 🔊 Dynamische Musik-Modi & Weiche Übergänge
- Der Web-Audio-Synthesizer wechselt automatisch Tempo, Melodie und Stimmung je nach aktueller Spielansicht (Burg-Ansicht, Weltkarte, Schlachtfeld) für maximale Immersion.

### 14. 💾 Spielstand Im- & Export
- Spieler können ihren Spielstand als Base64-Textcode im Einstellungsmenü sichern oder wieder importieren, um Backups zu erstellen oder Spielstände auszutauschen.

### 15. 🤝 Diplomatischer Ressourcenhandel
- Direkt im Diplomatie-Menü können Spieler Ressourcen (Holz, Stein, Eisen, Gold) mit K.I.-Nationen tauschen.
- Die Tauschverhältnisse sind abhängig von den diplomatischen Beziehungen (Allianz = 1:1, Neutral/Freundlich = 1.5:1, Hostile = kein Handel).
- Jede Nation verfügt über ein Tauschlimit (max 1000 Einheiten), das sich über Zeit wieder regeneriert, um die Wirtschaft auszubalancieren.

### 16. 🎨 Grafische & Taktische Kampf-Aufwertungen (Phase 1)
- **Schwebende Texte & Zahlen**: Ressourcenproduktion steigt periodisch über den Gebäuden auf. Steuereinnahmen zeigen `+ Gold` an. Im Kampf fliegen rote Schadensnummern und grüne Heilwerte empor.
- **Goldene Funken bei Fertigstellung**: Ein edler Partikeleffekt explodiert um fertiggestellte oder aufgewertete Gebäude mit einer Erfolgsmeldung.
- **Interaktive Canvas-Hover-Karten**: Premium Tooltips erscheinen beim Bewegen der Maus über Gebäude auf dem Canvas mit Level, Detailbeschreibung, Produktion und Interaktions-Hinweisen.
- **Projektil-Flugbahn im Kampf**: Bogenschützen verschießen fliegende Pfeile, Katapulte werfen Steine. Schadenswirkung verzögert sich dynamisch bis zum Einschlag.
- **Aktive Einheiten-Fähigkeiten**: 
  - *Ritter:* **Ansturm** (+50% Schaden und verdoppelte Bewegung beim Angriff).
  - *Bogenschützen:* **Brandpfeil** (setzt Gegner für 2 Runden in Brand, verursacht kontinuierlich Schaden).
  - *Speerkämpfer:* **Schildwall** (+50% Abwehr für 1 Runde auf Kosten der Bewegung).
- **Strategisches Geländesystem**: Büsche blockieren Einheiten nicht mehr, sondern dienen als Deckung vor Fernkampf (-40% Schaden). Felsen blockieren den Weg, verleihen aber Einheiten, die direkt an sie angrenzen, +20% Deckungsverteidigung.

### 17. 🤖 KI-Persönlichkeiten, Flächenexpansion & Ökonomie (Phase 2)
- **Erweiterte Burgfläche (14x14 Grid)**: Die Baulandfläche auf dem Canvas wurde von 10x10 auf 14x14 vergrößert, was fast die doppelte Baufläche (196 Kacheln statt 100) bietet, um Überfüllung zu vermeiden.
- **Strikte Gebäudelimits**: Unikale Strukturen sind auf 1 limitiert, Wirtschaftsgebäude (Farmen, Häuser, Sägewerke, etc.) auf maximal 2 und Mauern auf max. 40, damit die Burg abwechslungsreich aussieht und Platz für Dekorationen bleibt.
- **Bot-Persönlichkeiten & Raten**: Der KI-Helfer kann im Einstellungsmenü feinjustiert werden:
  - *Baumeister-Strategie:* Fokussiert Ressourcen, Steuern und Upgrades.
  - *Kriegsherr-Strategie:* Fokussiert Truppenrekrutierung und Angriffe auf Dungeons/Außenposten.
  - *Erkunder-Strategie:* Fokussiert Dungeons und Heldenlevel.
  - *Arbeitstakt:* Geschwindigkeit ist regulierbar zwischen Schnell (6s), Normal (15s) und Langsam (30s).
- **Saisonale Marktpreise**: Die Wechselkurse auf dem Marktplatz schwanken nun dynamisch mit den Jahreszeiten (z. B. wertvolles Holz/Nahrung im Winter, billiges Getreide im Sommer).

### 18. 🏠 Steuerskalierung, Visuelle Dungeons & Wächter-Bosskämpfe (Phase 3)
- **Wohnhäuser-Multiplikator**: Je mehr Wohnhäuser in der Burg stehen und je höher ihre Stufe ist, desto höher fallen die eingenommenen Steuern aus (+15% pro Haus, +10% pro Stufenwert).
- **Visuelle Dungeon-Nodes**: Der Expeditions-Tab im Heldenaltar zeigt eine Raumkarte (1. Eingang, 2. Kammer, 3. Boss), um den Fortschritt visuell darzustellen.
- **Bosskämpfe im Dungeon**: Erreicht dein Held den Boss-Raum, kann dieser über das taktische Kampfsystem direkt bekämpft werden (dein Held + Truppen vs. Dungeon-Boss und Schergen).
- **Optimierter KI-Helfer**:
  - Gibt Quests & tägliche Aufgaben sofort bei Erfüllung ab (ohne Action-Cooldown).
  - Priorisiert das Upgraden bestehender Gebäude, bevor neue Kopien gebaut werden, was Baufläche spart.

### 19. ⚔️ Helden-Kampffähigkeiten & Defensive Belagerungsschlachten (Phase 4)
- **Aktive Helden-Fähigkeiten**: Drei neue, direkt im Kampffeld aktivierbare Talente können im Heldenaltar gelernt werden:
  - *Heiliges Licht:* Heilt alle befreundeten Einheiten und den Helden auf angrenzenden Kacheln um +40 HP.
  - *Klingensturm:* Teilt 20 AoE-Schaden an alle angrenzenden Gegner aus.
  - *Göttlicher Schild:* Verleiht dem Helden +30 Rüstung für 1 Runde.
- **Einzigartige Helden-Visualisierung**: Der Held erscheint im Kampf als lila Kugel mit einer goldenen Umrandung und der Bezeichnung `HELD`.
- **Saisonale Banditen-Belagerungen**: Beim Jahreszeitenwechsel zu Herbst oder Winter besteht eine 35%-Chance auf einen plötzlichen Banditen-Angriff auf deine Hauptburg.
- **Statische Mauern im Kampf**: Für je 5 in der Burg gebaute Mauern erscheint im Abwehrkampf eine Schutzmauer auf dem Spielfeld.
- **Mauerdeckungs-Verteidigung**: Einheiten erhalten +35% Verteidigung, wenn sie direkt an eine Schutzmauer angrenzen.
- **Garnisons-Verteidiger**: Der Abwehrkampf rekrutiert seine Verteidiger direkt aus den in deiner **Mauergarnison** stationierten Soldaten.

### 20. 👑 Dekorationen, Aktive Bedrohungen & Grafische Kampfberichte (Phase 5)
- **Königreichs-Dekorationen**: Drei neue zierende Strukturen können errichtet werden:
  - *Goldstatue:* Kosten: 100 Stein, 100 Gold. +10 Zufriedenheit.
  - *Schlossgarten:* Kosten: 100 Holz, 50 Gold. +8 Zufriedenheit.
  - *Königliches Banner:* Kosten: 50 Holz, 30 Gold. +5 Zufriedenheit.
- **Premium Isometrie-Render**: Die Dekorationen werden isometrisch mit detailreichen Strukturen auf dem Canvas dargestellt (pedestalierte Statue, Blumenbeete und ein dynamisch wehendes rotes Banner).
- **Steigerung der Produktionsgeschwindigkeit**: Die Zufriedenheit steigert nun die Effizienz deines Reiches: Bei maximaler Zufriedenheit (100 %) steigt die Ressourcenproduktion um **+25 %**.
- **Kriegserklärungen feindlicher Nationen**: Sinkt dein Ruf bei einer KI-Nation auf `-60` oder darunter (z. B. durch Erpressungen oder abgelehnte Anfragen), starten diese gezielte Invasionen auf deine Burg, deren Truppenstärke ihrer nationalen Ausrichtung entspricht.
- **Grafischer Verlust-Vergleich**: Der Kampfbericht-Bildschirm enthält nun ein CSS-gestyltes, horizontales Balkendiagramm, um deine Truppenverluste direkt grafisch darzustellen.

### 21. 🏰 3D-Grafiken für Gebäude
- Hochwertig vorgerenderte 3D-Isometric-Sprites für Hauptgebäude (`keep`, `woodcutter`, `quarry`, `farm`, `barracks`, `tavern`) erzeugen ein plastisches, realistisches Stadtbild.
- Integrierter Baufortschritts-Modus: Gebäude im Bau erscheinen halbtransparent mit einem dynamisch gezeichneten Holzgerüst.
- Robuster Fallback: Fehlen Grafikdateien, rendert das Spiel die entsprechenden Gebäude automatisch als klassische Vektorgrafiken weiter.

### 22. 🗺️ Interaktive Burg-Minimap
- Eine neue Glassmorphism-Minimap unten rechts zeigt ein Echtzeit-Abbild des 14x14-Spielfelds inklusive Gebäudecodierung und der aktuellen Kameraposition.
- Panning per Klick: Das Anklicken oder Ziehen der Minimap verschiebt die Hauptkamera zentriert auf das gewählte Planquadrat.

### 23. 🔊 Prozedurale Medieval Sound FX
- Erweiterung des Web Audio Synthesizers um prozedural generierte Audio-Effekte passend zum Geschehen:
  - Rhythmisches Holzhacken (`wood`) beim Anklicken des Holzfällers.
  - Helle Pickhacken-Schläge (`stone`) beim Steinbruch.
  - Metallischer Amboss-Klang (`blacksmith`) in der Schmiede.
  - Lauschige Tavernenmusik-Akkorde (`tavern`) beim Besuch der Schänke.
  - Harmonischer Aufstiegs-Fanfarenklang (`upgrade`) bei Bauabschlüssen.

### 24. ⏳ Zeitalter-System (Epochs & Ages)
- Einteilung des Reiches in 4 Epochen: *Dunkles Zeitalter*, *Feudalzeit*, *Ritterzeit* und *Imperialzeit*.
- Der Ausbau deines Burgfrieds (Keep) treibt den Epochenwechsel voran.
- Freischaltungssystem: Fortschrittliche Gebäude sind hinter Zeitalter-Voraussetzungen gesperrt, was im Baumenü mit Schloss-Symbolen und Anforderungsdetails visualisiert wird.

### 25. 🤝 Kooperative Allianzkämpfe & Bündnis-Events
- **Kollaborative Armeehilfe**: Spieler können im Angriffsmenü für Gold und Ressourcen verbündete KI-Truppen anheuern (z. B. Ritter von Nordmark, Speerkämpfer von Südgold, Schwertkämpfer von Ostkaiserreich).
- **Zufällige Allianz-Events**: Zwei neue diplomatische Szenarien erfordern taktische Hilfeleistungen (Senden von Truppen zur Verteidigung bedrängter Partner oder Rohstoffpakete) für Boni und Beziehungsaufbesserung.
- **Epochen-Quests**: Neue Quests in der Hauptreihe belohnen die Ausrufung neuer Zeitalter und das Ausführen kooperativer Angriffe.

### 26. 🌾 Produktionsketten & Bürgerbedürfnisse (Supply Chains & Needs)
- **Mehrstufige Veredelung**:
  - `Windmühle` & `Bäckerei`: Verarbeiten Getreide zu Mehl und nahrhaftem Brot, welches die Nahrungseffizienz steigert.
  - `Hopfenfeld` & `Brauerei`: Brauen kühles Bier für Tavernen und heben die Zufriedenheit der Bürgerschaft.
  - `Erzschmelze` & `Waffenschmiede`: Gießen Eisenbarren und schmieden hochwertige Waffen für Truppen.
  - `Kapelle` & `Dorfbrunnen`: Erfüllen Glaubens- und Hygienebedürfnisse deiner Einwohner.
- **Bauernaufstand & Streik-Mechanik**: Fällt die Gesamtzufriedenheit unter 20%, drohen spontane Bauernaufstände und Produktionsstopps, die diplomatisches Handeln oder Steuersenkungen erfordern.

### 27. 🌐 WebRTC Realtime P2P Live-Duelle
- **Live-P2P Multiplayer**: Erstelle einen eigenen Duell-Raumcode (`BURGEN-XXXXXX`) und fordere Mitspieler direkt in der Jousting-Arena oder im taktischen Rundenkampf zu einem 1v1-Echtzeit-Duell ohne Serverkosten heraus.

### 28. ☁️ Verschlüsselter Cloud-Sync & Backups
- **Automatische Cloud-Vault Sicherung**: Spielstände werden lokal und in einem verschlüsselten Cloud-Vault gesichert. Ein-Klick-Wiederherstellung erlaubt das nahtlose Laden von früheren Spielständen und Backups.

### 29. 📈 Interaktive Wirtschafts-Charts & Dashboards
- **Canvas-Liniendiagramme**: Visualisiere den 30-Tick-Verlauf von Holz, Stein, Eisen, Gold und Nahrung direkt im Statistik-Dashboard mit farbcodierten Datenkurven.

### 30. 🗡️ Spionage-Sabotage & Brandstiftung
- **Erweiterte Spionage-Aktionen**:
  - `Brandstiftung`: Setze gegnerische Kornspeicher in Brand (-30% Nahrungsvorräte).
  - `Tor-Sabotage`: Manipuliere Burgtor-Riegel für +25% Durchbruchschaden beim nächsten Angriff.

### 31. 💍 Politische Dynastie-Heiraten
- **Königliche Hochzeiten**: Verheirate Nachkommen deiner Dynastie mit Thronfolgern verbündeter KI-Nationen für dauerhafte Allianz-Garantien und höhere tägliche Tribute.

### 32. 🏰 Burgtor- & Fallen-Verteidigung (Pitch & Trap Engine)
- **Taktische Mauer-Fallen**:
  - `Pechkessel`: Fügt Stürmern am Burgtor AoE-Brandschaden zu.
  - `Siedendes Öl`: Ignoriert Rüstung feindlicher Nahkämpfer.
  - `Fallgitter`: Blockiert Burgtordurchbrüche für 2 Kampfrunden.
  - `Krähenfüße`: Verlangsamt vorrückende Infanterie-Ketten.

### 33. 📜 Chronik des Reiches (Procedural History & Kingdom Chronicle)
- **Historisches Logbuch**: Hält alle Meilensteine deines Reiches chronologisch fest (Thronwechsel, gewonnene Schlachten, bezwungene Bossdrachen, überstandene Aufstände).

### 34. ⛵ Übersee-Handelsexpeditionen & Piraten-Seeschlachten
- **Exotischer Fernhandel**: Schicke Handelsflotten auf See-Expeditionen zum Kalifat oder Ost-Kaiserreich, um seltene Gewürze, Seide und Edelsteine zu importieren.
- **Piraten-Events**: Wehre Piratenüberfälle auf hoher See ab.

### 35. 🧪 Alchemistenlabor & Trankbrauerei (Potion Crafting)
- **Elixier-Brauerei**: Braue aus Rohstoffen und Dungeon-Dropzutaten mächtige Tränke wie *Marsch-Elixier*, *Heilbalsam* und *Griechisches Feuer*.

### 36. 🗺️ Gilden-Territorialkampf (Guild Fortress Control)
- **Megafestungen**: Erobere strategische Knotenpunkte (*Drachenpass*, *Eiserne Festung*, *Goldküste*) für tägliche Gilden-Tribute und Spezial-Buffs.

### 37. 🌧️ Prozedurale Wetter-Soundscapes & Umgebungs-Audio
- **Natur-Synthesizer**: Prozedural generierte Soundkulissen passend zur Jahreszeit (Regen, Donnergrollen, Vogelgezwitscher, Kriegshörner).

### 38. 💥 Visuelle Burg-Zerstörung & Feuer-Ausbreitung
- **Mauer-Trümmer**: Dynamische Gesteinspartikel zerplatzen bei Belagerungstreffern. Brände breiten sich spontan auf Nachbarkacheln aus, wenn keine Feuerwache vorhanden ist.

### 39. 👑 Erlass-System & Finanzpolitik 2.0
- **Politisches Management**:
  - `Brot-Subvention`: Steigert Bürger-Zufriedenheit um +25%.
  - `Kriegssteuer`: Bringt +45% mehr Gold auf Kosten der Stimmung.
  - `Seidenzoll`: Erhöht Seehandelserträge.

### 40. 🐉 Mythen-Tierzucht & Elementar-Drachen 2.0
- **Drachenhort-Zucht**: Züchte *Feuerdrachen*, *Frostwyvern* und *Sturmgreifen* mit individuellen Elementar-Kampfauren.

### 41. 🏆 Saisonale Liga-Ränge & Ranking 3.0
- **Ranglisten-System**: Dynamische Einstufung von *Bronze* bis *Obsidian-Königreich* basierend auf Königreichs-Score und Burgwert.

### 42. 📱 Touch-Gesten & Mobile Haptik-Overlay 2.0
- **Haptisches Feedback**: Nuancierte Vibrationsmuster (Vibration API) bei Bauabschlüssen, Schwerthieben und Siegesfanfaren auf Mobilgeräten.

---

## 🛠️ Lokale Ausführung / Installation
1. Öffne die Datei `index.html` direkt in einem modernen Webbrowser deiner Wahl (Chrome, Edge, Firefox, Safari).
2. Alternativ kannst du einen lokalen Entwicklungsserver starten (`npm start` oder `npx http-server`).
3. Klicke auf den Bildschirm, um die Audiosynthese zu aktivieren.

---

## 🌐 Online Deployment & Hosting Guide
- **GitHub Pages:** Lade das Repository hoch und aktiviere GitHub Pages in den Repository-Einstellungen (`Source: main branch / root`).
- **Netlify / Vercel:** Importiere das Git-Repository direkt; als Build-Befehl ist `npm run build` hinterlegt.

