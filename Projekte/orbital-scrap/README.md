# Orbital Scrap

Ein futuristisches, inkrementelles Idle- und Clicker-Spiel, entwickelt mit der **Godot Engine (v4.6)**. In **Orbital Scrap** sammelt der Spieler Weltraumschrott im Orbit, automatisiert die Produktion mit Drohnen und Minen, erforscht fortgeschrittene Technologien, zähmt Sonnenstürme und verteidigt seine Raumstation gegen gefräßige Weltraumpiraten.

---

## 🌌 Spielbeschreibung

Der erdnahe Weltraum ist übersät mit Trümmern und Schrott. Deine Aufgabe ist es, diesen wertvollen Rohstoff einzusammeln, daraus eine automatisierte Produktionsflotte im Orbit zu errichten und durch technologische Upgrades, Forschungen und Prestige-Multiplikatoren astronomische Produktionsraten zu erreichen. 

---

## 🛠️ Features

1. **Orbitale Flotte & Automatisierung:**
   * **Weltraumschrott-Klicker:** Sammle Schrott manuell per Knopfdruck oder Tastatur.
   * **Drohnen & Minen:** Automatisierte Grundeinheiten für passives Schrotteinkommen (SPS).
   * **Satelliten-Arrays:** Relaisstationen, die stetig Schrott fangen und wertvolle Daten für die Forschung senden.
   * **Dyson-Schwarm-Fragmente:** Gigantische orbitale Kollektoren zur massiven SPS-Gewinnung im Late-Game.

2. **Forschung & Technologien (Tech Tree):**
   * **Daten-Disks:** Eine neue Forschungs-Währung. Wird passiv durch Satelliten generiert oder kann aktiv durch Konvertieren von Schrott gewonnen werden.
   * **Passiv-Techs:**
     * *Ionentriebwerke:* Erhöht die Drohnenleistung permanent um +50% pro Stufe.
     * *Tiefenbohrung:* Erhöht die Minenleistung permanent um +50% pro Stufe.
   * **Aktiv-Skills (Cooldowns):**
     * *Overdrive:* Multipliziert deine Klick-Power 15 Sekunden lang um das 5-Fache! (Cooldown: 60s).
     * *Supercharge:* Verdoppelt deine gesamte SPS-Rate 30 Sekunden lang! (Cooldown: 90s).
   * **Automatisierung:**
     * *Asteroiden-Magnet:* Fängt goldenen Asteroiden mit einer Wahrscheinlichkeit von 35% vollautomatisch ab.

3. **Zufällige Weltraumereignisse (Events):**
   * **Goldene Asteroiden:** Fliegen über das All. Ein Klick bringt einen signifikanten Prozentsatz des Gesamtschrotts.
   * **Sonnenstürme:** Temporäre EM-Störungen. Drohnen arbeiten mit doppelter Leistung (+100% Boost), während Satelliten vorübergehend deaktiviert werden.
   * **Weltraumpiraten:** Stehlen kontinuierlich 2 % deines Schrottbestands pro Sekunde. Vertreibe sie durch schnelles Anklicken oder installiere automatisierte Abwehrlaser!
   * **Wurmlöcher:** Seltene Raumkrümmungen. Anklicken löst einen 20-sekündigen **Zeitwarp** aus, bei dem das Spiel mit 3-facher Geschwindigkeit läuft.

4. **Prestige-System & Shop:**
   * Starte deine Runde neu, um permanente Prestige-Punkte (PP) zu erhalten und deinen globalen Multiplikator zu steigern.
   * **Prestige-Upgrades:**
     * *Auto-Sammler:* Simuliert automatische Klicks pro Sekunde.
     * *Preisnachlass:* Senkt die Kosten aller Gebäude um bis zu 40 %.
     * *Schrott-Magnet:* Fügt einen Anteil deiner passiven Produktion (SPS) direkt zu deinen Klicks hinzu.
     * *Kritische Klicks:* Verleiht eine Chance auf das 10-fache Klickeinkommen.
     * *Asteroiden-Scanner:* Erhöht die Spawnrate und Ausbeute goldener Asteroiden.
     * *Offline-Kompensator:* Erhöht die Effizienz des passiven Schrottgewinns während deiner Abwesenheit.
     * *Abwehrlaser:* Schießt Weltraumpiraten vollautomatisch ab.

5. **Visuelle Orbit-Simulation:**
   * Eine wunderschöne, prozedural gezeichnete Echtzeit-Simulation auf der rechten Bildschirmseite zeigt deine Raumstation sowie die Orbits all deiner Drohnen, Minen, Satelliten, Dyson-Teile und deines rotierenden **Forschungslabors**.
   * Aktive Events (Piratenangriffe, Wurmlöcher, Abwehrlaser-Strahlen, Sonnensturm-Glow, Overdrive-Blitze und Supercharge-Auren) werden direkt visuell simuliert!

---

## 📁 Ordnerstruktur

Das Projekt ist sauber und modular strukturiert:

```text
orbital-scrap/
├── assets/
│   └── icon.svg              # Offizielles Icon des Spiels
├── scenes/
│   └── main.tscn             # Die Hauptspielszene (UI, Nodes, Signal-Verbindungen)
├── scripts/
│   ├── main.gd               # Haupt-Spiellogik (Upgrades, Event-Timer, Speichersystem)
│   └── orbit_visuals.gd      # Prozedurale 2D-Rendering-Logik der Orbit-Simulation
├── project.godot             # Godot Engine Projektkonfiguration (Viewport-Größe: 1152x800, Treiber etc.)
├── .gitignore                # Git-Ausschlussregeln (.godot/, Systemdateien, Logs)
└── README.md                 # Diese Dokumentation
```

---

## 🎮 Spielanleitung & Steuerung

### Steuerung:
* **Maus:** Klicke Knöpfe im UI an, sammle Asteroiden/Wurmlöcher ein oder beschieße Piratenschiffe durch direktes Anklicken auf der rechten Bildschirmseite.
* **Tastatur-Shortcuts:**
  * `Leertaste`: Schrott manuell sammeln
  * `D`: Drohne kaufen
  * `M`: Mine kaufen
  * `S`: Satellit kaufen
  * `Y`: Dyson-Schwarmteil kaufen
  * `C`: Klick-Power Upgrade
  * `U`: Drohnen-Upgrade
  * `N`: Minen-Upgrade
  * `I`: Satelliten-Upgrade
  * `O`: Dyson-Upgrade
  * `P`: Prestige durchführen

---

## 💾 Speichersystem

Das Spiel speichert automatisch alle **15 Sekunden** sowie beim ordnungsgemäßen Beenden des Fensters in der systemweiten Benutzerkonfiguration (`user://save_data.cfg`).
Beim Start wird der Spielstand automatisch geladen und der **Offline-Gewinn** basierend auf der vergangenen Zeit berechnet (für Schrott und Daten-Disks).
