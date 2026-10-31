// scripts/project_visibility.js
// Projekte, deren Quell-Repo privat ist: ins öffentliche Monorepo kommen nur der
// lauffähige Demo-Build und die Portfolio-Metadaten, kein Quellcode (siehe ADR 0012).
// Schlüssel = Ordnername unter Projekte/, Wert = relative Pfade, die erhalten bleiben.
// `portfolio-metadata.json` bleibt immer erhalten.

/** @type {Record<string, string[]>} */
const DEMO_ONLY = {
    'Amazon 2.0': ['dist'],
    'ElektroCheck AI': ['dist'],
    'Wohnungssuche KI': ['frontend/dist'],
    Minecraft: ['index.html', 'web'],
};

module.exports = { DEMO_ONLY };
