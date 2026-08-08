# UrlaubsMomente - Deine intelligente Urlaubsgalerie

**UrlaubsMomente** ist eine datenschutzfreundliche, vollständig clientseitige Web-Applikation zur Organisation, Analyse und Präsentation deiner Urlaubsfotos. Deine Bilder und Metadaten verlassen nie deinen Browser und werden lokal in IndexedDB gespeichert.

---

## Hauptfeatures

1.  **Orts- & Datums-Organisation**: Automatische Gruppierung von Fotos in Reisen/Trips anhand zeitlicher Abstände und GPS-Koordinaten.
2.  **Qualitäts-Check (Aussortieren)**: Automatische Erkennung verwackelter/unscharfer Fotos (mittels Laplacian-Varianz-Filter) sowie Erkennung von Serienaufnahmen & Duplikaten zur Bereinigung der Galerie.
3.  **Clientseitiges AI-Tagging**: Lokale Bildklassifizierung mittels TensorFlow.js und MobileNet. Inklusive erweitertes Übersetzungswörterbuch ins Deutsche und Unterstützung für benutzerdefinierte Tags.
4.  **Gesichtserkennung (Face Detection)**: Clientseitige Erkennung von Gesichtern über tracking.js zur einfachen Zuordnung von Namen und Filterung nach Personen.
5.  **Interaktive Reise-Karte & Routen-Editor**: Visualisierung deiner Reiseabschnitte mit Leaflet-Karten und interaktivem Routen-Editor zur Platzierung eigener Stationen per Klick und Anpassung der Linienfarben.
6.  **Throwback-Diashow (Highlights)**: Automatischer Rückblick mit Ken-Burns-Effekt und clientseitig generierter Ambient-Melodie und Meeresrauschen (Web Audio API) inklusive Visualizer und Audio-Steuerungen.
7.  **Sicherer Datenexport**: Backup und Wiederherstellung über lokale ZIP-Dateien oder direkt über Google Drive sowie Generierung einer hochoptimierten, selbstständigen Web-Galerie (HTML-Datei) zum Teilen.
8.  **Mehrere Profile & PIN-Sperre**: Trennung der Bilder über Benutzerprofile (z.B. Standard, Privat, Familie) inklusive clientseitigem PIN-Schutz per SHA-256 Hashing.
9.  **Postkarten- & Collagen-Generator**: Erstellen von digitalen Postkarten mit bis zu 4 Bildern, anpassbaren Rahmen, Schriftarten, Texten und direktem Bildexport.

---

## Premium-Neuerungen & Refactoring

*   **Digitaler Postkarten-Generator**: Wähle Layouts (Polaroid, Split, Grid), schreibe Grüße, wähle Schriftarten und lade die Postkarte als JPEG herunter.
*   **Serienaufnahmen & Duplikate finden**: Erkennt automatisch fast identische Burst-Aufnahmen (zeitliche Nähe + Dateigrößenabgleich) und empfiehlt die schärfste Option.
*   **Intelligente Such-Vorschläge**: Dynamische Autocomplete-Vorschläge (Orte, Tags, Kameras) direkt unter der Suchleiste während der Eingabe.
*   **Zuschneiden (Crop) & Zeichnen (Draw)**: Im Editor lassen sich Bilder nun über Schieberegler zuschneiden und mit einem Malpinsel (Farbe & Stärke einstellbar) frei bemalen. Ein Sättigungsregler wurde ebenfalls hinzugefügt.
*   **Interaktiver Routen-Editor**: Auf der Karte können Wegpunkte direkt erstellt, verschoben, umbenannt und die Farbe des Routenpfades angepasst werden.
*   **Smarte Semantiksuche**: Unterstützt Token-basierte Filterabfragen in der Galerie (z.B. `tag:Strand`, `ort:Italien`, `kamera:iPhone`, `jahr:2025`).
*   **Passwortgeschützte Profile**: Integrierte lokale PIN-Sperre zum Schutz privater Datenbereiche (Standard, Privat, Familie).
*   **Thumbnail-Caching**: Zur drastischen Erhöhung der Performance generiert die App nun ressourcenschonende Thumbnails beim Upload, wodurch der Arbeitsspeicher bei großen Galerien geschont wird.
*   **Modularisierte Architektur**: Die ehemals 2800-zeilige Hauptdatei wurde in saubere, wiederverwendbare React-Komponenten (`src/components/`) und dedizierte Service-Klassen (`src/services/`) zerlegt.
*   **Audio-Visualizer**: Die Diashow bietet nun vollumfängliche Audiosteuerungen (Lautstärke, Moods, Meeresrauschen) und einen integrierten Canvas-Audio-Visualizer.
*   **HTML-Sharing-Kompression**: Bilder werden vor dem Sharing-Export automatisch komprimiert, was Dateigrößen um bis zu 90% verringert und Browserabstürze verhindert.

---

## Projektstruktur

```text
src/
├── assets/             # Statische Icons & Leaflet Marker
├── components/         # Modulare React UI-Komponenten
│   ├── Sidebar.jsx          # Seitliche Navigation, Profile & Speicheranzeige
│   ├── GalleryView.jsx      # Foto- & Albenraster mit smarten Filtern & Autocomplete
│   ├── MapView.jsx          # Leaflet-Reisekarte mit interaktivem Routen-Editor
│   ├── PeopleDashboard.jsx  # Personenerkennung und Gesichts-Benennung
│   ├── StatsView.jsx        # Reise-Statistiken (km, Kamera, Orte)
│   ├── UploadZone.jsx       # Drag & Drop Uploader und ZIP-Import
│   ├── QualityCheck.jsx     # Review-Ansicht für unscharfe Bilder & Duplikate
│   ├── SlideshowView.jsx    # Diashow mit Synth-Audio & Visualizer
│   ├── CloudConnection.jsx  # Google API Drive Backups & Foto-Import
│   ├── ImageEditor.jsx      # Detailansicht mit Canvas-Bildbearbeitung, Crop & Draw
│   └── PostcardView.jsx     # Postkarten- & Collagen-Generator mit Canvas-Export
├── services/           # Anwendungslogik & Utilities
│   ├── ai.js                # TensorFlow MobileNet Klassifizierer
│   ├── analyzer.js          # EXIF Parser, Schärfen-Analyzer & Bild-Fingerprints
│   ├── db.js                # IndexedDB Speicherverwaltung mit Profilfilterung
│   ├── editor.js            # Canvas Bildbearbeitungs-Filter, Crop & Draw
│   ├── exportTemplate.js    # Standalone HTML Sharing Generator
│   ├── faces.js             # Gesichts-Detektor (tracking.js)
│   └── googleApi.js         # Integration der Google APIs
├── App.jsx             # Hauptkomponente (Zustand, Routing & PIN-Lockscreen)
├── App.css
├── index.css
└── main.jsx
```

---

## Installation & Start

1.  **Abhängigkeiten installieren**:
    ```bash
    npm install
    ```
2.  **Entwicklungsserver starten**:
    ```bash
    npm run dev
    ```
3.  **Produktions-Build erstellen**:
    ```bash
    npm run build
    ```



