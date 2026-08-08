# 🐍 Snake Ascend: Block Royale

**Snake Ascend: Block Royale** ist ein innovatives Geschicklichkeitsspiel für Webbrowser, das Elemente aus **Tetris**, **Doodle Jump**, **Snake** und **Clash Royale** in einer eleganten und farbenfrohen Neon-Ästhetik miteinander verbindet.

---

## 🎮 Spielprinzip

1. **Auto-Climbing (Doodle Jump & Snake)**: 
   Die Schlange klettert automatisch von links nach rechts (und prallt von Wänden ab). Wenn sie auf einen Block trifft, klettert sie nach oben. Wenn kein Boden unter ihren Segmenten ist, zieht die Schwerkraft sie nach unten.
2. **Karten & Elixier (Clash Royale & Tetris)**:
   Du hast ein Elixier-Konto (max. 10 💧). Die Ladegeschwindigkeit erhöht sich, je länger deine Schlange ist! Du hast eine Hand aus 4 Karten, die du auf das Spielfeld ziehst oder tippst, um Tetris-Blöcke als Plattformen zu platzieren.
3. **Münzen & Gefahren**:
   Sammle Münzen und Äpfel auf dem Weg nach oben. Aber nimm dich in Acht vor den patrouillierenden **Spinnen** 🕷️ und **Käfern** 🦟! Kollisionen kosten dich Schlangen-Segmente (Lebenspunkte).
4. **Boss-Türme**:
   Alle 100 Meter triffst du auf einen mächtigen Boss-Turm. Deine Schlange attackiert ihn automatisch mit **Nahkampfangriffen (Elektro-Neon-Blitzen)**, wenn sie nahe genug ist. Alternativ kannst du **Kanonen-Blöcke** platzieren, die Laser-Projektile nach oben schießen!

---

## 🆕 Neue Erweiterungen & Verbesserungen

### ↩️ 1. Block-Rotation (Taktisches Platzieren)
* **Karten rotieren**: Du kannst ausgewählte Tetris-Blöcke vor dem Platzieren drehen!
* **Steuerung**: Drücke die **R-Taste**, die **Leertaste** oder klicke auf das **↩️ Symbol** im UI, um den Block im Uhrzeigersinn um 90° zu rotieren.

### 🔲 2. Präzise Gitter-Vorschau & Zerlegung
* **Präzise Vorschau**: Anstelle einer einfachen Box zeigt die Vorschau nun die exakte rotierte Tetris-Form (z. B. T- oder L-Form) als transparentes Gitter an der Maus-/Fingerposition an.
* **Gitter-Kollision**: Blöcke werden beim Platzieren in einzelne 1x1 Gitterzellen zerlegt. Das ermöglicht eine pixelgenaue Kollisionserkennung für jede Nische und Kante der Tetris-Form.
* **Platzierungs-Schutz**: Du kannst keine Blöcke mehr direkt auf dem Boss-Turm oder direkt auf dem Kopf der Schlange platzieren (Schutz vor Steckenbleiben).

### ⚡ 3. Visueller Boss-Kampf
* **Nahkampf-Visualisierung**: Teilt deine Schlange dem Boss Schaden im Nahbereich aus, zucken helle, neon-cyanfarbene **Elektro-Blitze** von ihrem Kopf zum Kern des Boss-Turms.
* **Boss-Angriffe**: Der Boss feuert zielsuchende Feuerbälle ab, die du mit deinen platzierten Blöcken oder dem Schild blocken kannst.

### 🎵 4. Dynamisches Audio & Fehlerbehebungen
* **Audio-Resumption**: Die procedurale Chiptune-BGM (generiert per Web Audio API) startet nun nach der ersten Interaktion (Klick auf Spielen/Sound) zuverlässig auf allen Browsern.
* **Redraw-Cooldown Fix**: Der Cooldown-Fehler des Redraw-Buttons (🔄) wurde korrigiert und läuft nun wie vorgesehen in fairen **10 Sekunden** ab.

---

## 🃏 Die Karten

* **I-, O-, T-, L-Blöcke**: Klassische Tetris-Formen zum Bauen von Wegen.
* **Feder-Block (🌀)**: Katapultiert die Schlange in die Höhe!
* **Apfel-Block (🍎)**: Spawnt ein Futter-Item, das Segmente (Leben) regeneriert.
* **Frost-Zauber (❄️)**: Verlangsamt Gegner und die Schlange kurzzeitig für präzise Manöver.
* **Schild-Zauber (🛡️)**: Verleiht der Schlange eine 6-sekündige Barriere gegen Schaden.
* **Kanone (🔫)**: Spawnt einen Block, der alle 1,5 Sekunden Laser nach oben schießt.
* **Bombe (💣)**: [NEU] Platziert einen Block, der nach 2,5 Sekunden mit einer feurigen Explosion zündet.
* **Magnet (🧲)**: [NEU] Zieht 6 Sekunden lang alle Münzen auf dem Bildschirm magisch zur Schlange.
* **Boost (⚡)**: [NEU] Verleiht beim Berühren einen Geschwindigkeitsboost, Unverwundbarkeit und einen Neon-Schweif.

---

## 📁 Projektordnerstruktur

```text
├── index.html          # Startpunkt des Spiels & HTML/UI-Overlays
├── README.md           # Diese Dokumentation
├── .gitignore          # Git-Ignore-Datei
└── src/
    ├── css/
    │   └── style.css   # Cyberpunk/Neon-Themes, Animationen & Glassmorphismus
    └── js/
        ├── audio.js    # Synthesizer für dynamische Audioeffekte (Web Audio API)
        ├── cards.js    # Deck-Manager, Hand, Rotation & Elixier-Berechnung
        ├── snake.js    # Schlangen-Physik-Engine & Kollisionserkennung
        └── game.js     # Spielkoordinator (Game Loop, Platzierung, Boss-Kämpfe)
```

---

## 🚀 Lokale Ausführung

Das Spiel läuft komplett im Browser und benötigt keinen Build-Prozess.

Starte einfach einen lokalen Webserver im Hauptverzeichnis des Projekts:

### Python 3
```bash
python -m http.server 8000
```
Öffne anschließend **[http://localhost:8000](http://localhost:8000)** in deinem Browser.

### Node.js (npx)
```bash
npx http-server -p 8000
```
Öffne anschließend **[http://localhost:8000](http://localhost:8000)** in deinem Browser.