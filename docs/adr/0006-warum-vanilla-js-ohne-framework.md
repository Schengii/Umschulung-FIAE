# 0006 — Warum Vanilla JS statt SPA-Framework (React/Vue/Angular)

**Status:** Akzeptiert
**Datum:** 2026-09-20

## Kontext

Im Rahmen der FIAE-Umschulung und der IHK-Abschlussvorbereitung wird bei Webprojekten häufig hinterfragt, warum für ein umfassendes Portfolio mit 27+ Seiten, PWA-Funktionen, interaktiven Simulatoren und Tools kein Single Page Application (SPA) Framework wie React, Vue oder Angular eingesetzt wurde.

In technischen Fachgesprächen und Projektpräsentationen vor dem IHK-Prüfungsausschuss ist die Architekturentscheidung für oder gegen ein Framework ein klassisches Prüfungsthema.

## Entscheidung

Das Portfolio wird bewusst als **modulare Vanilla JavaScript Web-Applikation (HTML5, CSS3, ES6+ Module)** ohne Frontend-Framework umgesetzt:

1. **Beherrschung der Web-Grundlagen (Fundamentals first):**
   - Direkte Arbeit mit nativen Web APIs (DOM, Service Worker Cache API, Web Storage, Custom Events, AudioContext, Canvas, Web Workers).
   - Nachweis fundierten Verständnisses der Core-Standards ohne Abstraktionsschichten oder Framework-Magic.

2. **Zero-Overhead & Ladezeit-Performance:**
   - Kein Runtime-Framework-Footprint (kein React-DOM, kein virtueller DOM-Diffing-Overhead).
   - Sofortige Ausführbarkeit im Browser ohne zwingende Build-Pipeline oder Transpilierung.
   - Hohe Lighthouse-Scores (Accessibility, Best Practices, SEO konsistent bei 95–100 %).

3. **Autonomie & Zukunftsstabilität:**
   - Keine Abhängigkeit von Framework-Release-Zyklen, Deprecations oder Breaking Changes (z. B. Major-Version-Upgrades).
   - Minimaler Wartungsaufwand für Drittanbieter-Bibliotheken und nahezu keine Sicherheitslücken in Dependencies (`npm audit`: 0 Vulnerabilities).

4. **Transparenz für Prüfer und Recruiter:**
   - Der Quellcode ist direkt im Browser-Inspector les- und debugbar (kein obfuskierter/kompilierter Bundler-Code im Produktivbetrieb nötig).
   - Architekturmuster (Modulares MVC, Event-Bus, Observer, State Isolation) sind direkt in reinem JavaScript implementiert und somit transparent evaluierbar.

## Konsequenzen

- **Manuelle State-Synchronisation:** Reaktive UI-Updates erfordern eigene kleine Helferfunktionen und sauberes Event-Handling statt automatischer Two-Way-Bindings.
- **Wiederverwendbarkeit:** UI-Komponenten (Header, Navigation, Footer, Modals) werden über modulare Skripte (`components.js`) dynamisch injiziert, statt über JSX/SFC-Templates.
- **Ergebnis:** Höchste Langlebigkeit, exzellente Portabilität und ein optimaler Demonstrator für fundierte native Frontend-Kompetenz im IHK-Kontext.
