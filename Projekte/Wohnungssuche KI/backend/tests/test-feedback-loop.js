import { learnFromRejection } from '../ai-analyzer.js';
import { db } from '../db.js';

async function run() {
  const preferences = db.getPreferences();
  
  if (!preferences.geminiApiKey) {
    console.error("FEHLER: Bitte trage zuerst einen Gemini API-Key in deiner db.json ein.");
    return;
  }

  const mockListing = {
    id: 'test-feedback-listing',
    title: 'Helle 3-Zimmer-Wohnung mit Nachtspeicherheizung',
    location: 'Bonn',
    priceKalt: 650,
    priceWarm: 800,
    sqm: 75,
    rooms: 3,
    description: 'Eine schöne, helle Wohnung im Dachgeschoss. Die Wohnung wird kostengünstig über Nachtspeicherheizung (Nachtspeicheröfen) beheizt. Kein Aufzug vorhanden.',
    pros: ['Helle Zimmer', 'Günstige Kaltmiete'],
    cons: ['Nachtspeicherheizung', 'Kein Aufzug'],
    matchScore: 80
  };

  console.log("==================================================");
  console.log("Simuliere Löschung des Inserats...");
  console.log("Titel:", mockListing.title);
  console.log("Match-Score:", mockListing.matchScore);
  console.log("Bereits gelernte Ausschlusskriterien vorab:", preferences.learnedNegativePreferences || []);
  console.log("==================================================");

  console.log("Starte learnFromRejection...");
  await learnFromRejection(mockListing, preferences);

  const updatedPrefs = db.getPreferences();
  console.log("\n==================================================");
  console.log("Lernvorgang abgeschlossen.");
  console.log("Gelernte Ausschlusskriterien jetzt:", updatedPrefs.learnedNegativePreferences);
  console.log("==================================================");
}
run();
