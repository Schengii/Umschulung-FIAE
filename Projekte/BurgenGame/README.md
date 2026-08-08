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

---

## 🛠️ Lokale Ausführung / Installation
1. Öffne die Datei `index.html` direkt in einem modernen Webbrowser deiner Wahl (Chrome, Edge, Firefox, Safari).
2. Alternativ kannst du einen lokalen Entwicklungsserver starten (`npm start` oder `npx http-server`).
3. Klicke auf den Bildschirm, um die Audiosynthese zu aktivieren.

---

## 🌐 Online Deployment & Hosting Guide
- **GitHub Pages:** Lade das Repository hoch und aktiviere GitHub Pages in den Repository-Einstellungen (`Source: main branch / root`).
- **Netlify / Vercel:** Importiere das Git-Repository direkt; als Build-Befehl ist `npm run build` hinterlegt.

