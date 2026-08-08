# 🧪 Alchemisten-Akademie: Die Hallen des Schicksals (Glücksspiel-Plattform)

Willkommen in der **Alchemisten-Akademie**, einer thematisch dichten, atmosphärischen Casual-Mini-Game-Plattform, die klassische Glücksspielmechaniken mit Rollenspielelementen (RPG), Crafting und einer lebendigen alchemistischen Wirtschaft verbindet.

Dieses Projekt wurde vollständig in **Vanilla JavaScript**, **HTML5 Canvas**, **CSS3** und der **Web Audio API** entwickelt, um ein flüssiges, clientseitiges Spielerlebnis ohne Server-Abhängigkeiten zu gewährleisten.

---

## 📂 Ordnerstruktur

Die Plattform ist modular aufgebaut. Jedes Portal (Mini-Spiel) befindet sich in einem eigenen Unterordner mit isolierten Assets und Steuerungsdateien, teilt jedoch globale Stile und Logiken über die Hauptdateien im Stammverzeichnis:

```text
Glücksspiel/
├── index.html              # Akademie-Lobby (Hauptmenü, Marktplatz, Labor, Quests)
├── app.js                  # Kern-Engine der Lobby (NPC-Börse, Quests, UI-Steuerung)
├── style.css               # Spezifische Layouts und Animationen für die Lobby
├── shared.js               # Gemeinsames System (Globale Werte, Audio-Synthesizer, Tränke/Upgrades)
├── shared.css              # Globale Farbpaletten (HSL), Design-System und Themes
├── manifest.json            # PWA Manifest Datei
├── sw.js                   # Service Worker für Offline-Support & Caching
├── portfolio-metadata.json # Projekt-Metadaten für Portfoliolisten
├── README.md               # Diese Dokumentation
│
├── arena/                  # Arena der Prüfungen (RPG-Kampf, Etagen-Auswahl, Loot)
│   ├── index.html
│   ├── app.js
│   └── style.css
│
├── cauldron/               # Der Kessel des Schicksals (Crash-Game, Trank brauen)
│   ├── index.html
│   ├── app.js
│   └── style.css
│
├── plinko/                 # Essenz-Plinko (Peg-Physik-Spiel, Multiplikatoren)
│   ├── index.html
│   ├── app.js
│   └── style.css
│
├── slots/                  # Alchemisten-Spins (5-Walzen-Slot, Elementenrad)
│   ├── index.html
│   ├── app.js
│   └── style.css
│
├── mines/                  # Runen-Minen (Sichere Felder aufdecken, Minen-Ausweichen)
│   ├── index.html
│   ├── app.js
│   └── style.css
│
├── roulette/               # Elementen-Roulette (Wette auf Ur-Elemente und Äther)
│   ├── index.html
│   ├── app.js
│   └── style.css
│
├── classic_roulette/       # Alchemisten-Roulette (Zahlen-Roulette 0-36)
│   ├── index.html
│   ├── app.js
│   └── style.css
│
├── dice/                   # Athanor-Würfeln (Würfel-Duelle gegen den Rektor)
│   ├── index.html
│   ├── app.js
│   └── style.css
│
├── blackjack/              # Blei-Transmutation (Alchemistisches Blackjack gegen den Rektor)
│   ├── index.html
│   ├── app.js
│   └── style.css
│
├── baccarat/               # Alchemie-Baccara (Rubedo vs. Albedo Punto/Banco Kartenspiel)
│   ├── index.html
│   ├── app.js
│   └── style.css
│
├── pachinko/               # Athanor-Schmelze (Kinetisches Pachinko-Dropping Spiel)
│   ├── index.html
│   ├── app.js
│   └── style.css
│
└── keno/                   # Keno der Elemente (80 Runenfelder, 20 Runen Ziehung)
    ├── index.html
    ├── app.js
    └── style.css
```

---

## 🔮 Hauptfeatures & System-Architektur

### 1. Das Akademie-Fortschrittssystem (`shared.js` & LocalStorage)
Alle Spielstände, Guthaben, XP (Erfahrungspunkte), Akademie-Stufen, Trophäen und Inventarbestände werden persistent im clientseitigen `localStorage` des Browsers verwaltet.
*   **XP- & Level-Up**: Der Spieler erhält für Aktionen in allen Portalen Erfahrungspunkte. Ein Stufenaufstieg schaltet exklusive Inhalte im Marktplatz frei.
*   **Not-Stipendium (Gunst des Rektors)**: Ist das Guthaben des Spielers auf unter 5,00 € aufgebraucht, stellt der Rektor ein Not-Stipendium von 100,00 € zur Verfügung.

### 2. Schnellreise-System (Quick Travel Navigation)
In `shared.js` wird dynamisch beim Laden jeder Seite eine **Quick-Travel-Navigationsleiste** am oberen Bildschirmrand injiziert. Dies ermöglicht es dem Spieler, nahtlos zwischen der Hauptlobby und allen **14 Spieleportalen** hin- und herzureisen.

### 3. Alchemistische Wirtschaft (Marktplatz & Börse)
Die Lobby simuliert eine schwankende Rohstoffbörse für Zutaten (*Schwefel*, *Quecksilber*, *Alraunenwurzel*, *Drachenblut*). 
*   **Börsen-Ticker**: Nachrichtenereignisse beeinflussen die Preise.
*   **NPC-Handelsstand**: Dozenten und Schüler der Akademie bieten zufällige Kaufangebote für selbst gebraute Tränke.

### 4. Das Crafting- & Trank-System (mit Deluxe Potion-Auren)
Der Spieler sammelt Rohstoffe in der Arena oder kauft sie auf dem Markt, um mächtige Tränke im Labor herzustellen. Konsumierte Tränke gewähren temporäre Buffs und fügen der Benutzeroberfläche **mystische, pulsierende Auren** hinzu (*Trank des Hermes*, *Fortunas Essenz*, *Aegis-Elixier*, *Äther-Elixier*).

---

## 🏆 Masterpiece Release (v10.0.0)

### A. Provably Fair System & Spielstand-Integrität
- **Web Crypto SHA-256 Hashing**: Mathematisch verifizierbare Pre-Round Server-Hashes, Client-Seeds und Nonces mit eigenem Verifizierungs-Modal.
- **Savegame Signatur**: Kryptographische Checksumme schützt exportierte Spielstände vor Manipulationen.

### B. Story-Kampagne („Die Legende des Steins der Weisen“)
- **5 Kapitel-Akte**: Interaktives Kampagnen-Logbuch mit NPC-Dialogen (Dozent Barnabas, Sybilla, Meister Ignatius, Rektor Ignatius) und portalübergreifenden Herausforderungen.

### C. Homunculus-Zucht & Gefährten-System (Companion Pet)
- **Brutkasten**: 4 Elementar-Entwicklungen (*Feuer-Salamander*, *Eis-Kristallit*, *Äther-Phönix*, *Erd-Golem*) mit einzigartigen Perks (wie +5% Cashback auf Rundenverluste).
- **Pet-HUD Badge**: Fütterungssystem im Header mit Rohstoffen.

### D. Relikte & Ausrüstungs-System
- **3 Ausrüstungs-Slots**: Für mächtige Artefakte (*Ring des Midas*, *Amulett des Hermes*, *Kristall-Monokel*, *Stein der Weisen*, *Glut-Phiole*, *Äther-Kompass*).

### E. Gilden-Expeditionen & Laboratorium-Werkbank
- **Gilden-Expeditionen**: Zeitgesteuerte Idle-Erkundungen (5 Min, 15 Min, 60 Min) für automatische Rohstoff- und Golderträge.
- **Werkbank-Stufen (1 bis 5)**: Aufrüstbar vom *Holz-Tisch* bis zum *Kristall-Allembic* für höheres Brau-Ergebnis.

### F. Akademie-Kelch (Wochen-Turnier)
- Wöchentliches Punkte-Turnier in allen 14 Portalen gegen 5 NPC-Rivalen mit eigener Rangliste.

### G. Ambient Jukebox Engine & Partikel-Canvas
- **Jukebox-Player**: 3 synthetisierte Synth-Tracks im Header.
- **HTML5 Canvas Partikel-Engine**: Spektakulärer Goldregen bei Big Wins, magische Funken und Feuer-Explosionen.

### H. PWA Support & 14 Spieleportale
- 100% offline-fähig via `manifest.json` und Service Worker `sw.js`.
- **14 Spieleportale**: Cauldron (Crash), Plinko, Slots, Mines, Element-Roulette, Zahlen-Roulette, Dice, Blackjack, Baccarat, Pachinko, Arena, Tower, Poker und **Keno der Elemente**.

