import { evaluateListing } from '../ai-analyzer.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockPreferences = {
  cities: ['Bonn'],
  minRentWarm: 400,
  maxRentWarm: 1200,
  minSqm: 45,
  maxSqm: 120,
  minRooms: 2,
  ebkRequired: true,
  balkonRequired: false,
  noGroundFloor: true,
  wbsStatus: 'none',
  blacklistKeywords: 'Tauschwohnung',
  targetAddress: 'Poststraße 1, Bonn',
  minDistanceKm: 0,
  maxDistanceKm: 10,
  wishCity: 'Bonn',
  wishCityRadiusKm: 15,
  wishes: 'Einbauküche, helles Bad',
  learnedNegativePreferences: [],
  netIncome: 3000,
  maxNebenkosten: 200,
  maxKaution: 2500,
  mietspiegelReference: 11.5,
  geminiApiKey: process.env.GEMINI_API_KEY || ''
};

const mockListing = {
  title: 'Helle 3-Zimmer-Wohnung in Bonn Poppelsdorf mit Einbauküche',
  priceKalt: 850,
  priceWarm: 1050,
  sqm: 72,
  rooms: 3,
  location: 'Bonn Poppelsdorf',
  description: 'Sehr schöne, helle 3-Zimmer-Wohnung im 2. Obergeschoss. Die Wohnung verfügt über ein großes Wohnzimmer, Schlafzimmer, Arbeitszimmer und eine Einbauküche. Keine Haustiere erlaubt. Die Kaution beträgt 3 Kaltmieten. Heizkosten sind in den Nebenkosten enthalten.',
  pois: {
    supermarkets: [{ name: 'Rewe', distanceKm: 0.3 }],
    publicTransit: [{ name: 'Clemens-August-Str', type: 'Bus', distanceKm: 0.1 }],
    parks: []
  }
};

async function runTest() {
  console.log('Starte Test der AI-Evaluierung mit Budget- & Mietpreisbremse-Check...');
  if (!mockPreferences.geminiApiKey) {
    console.error('FEHLER: Kein GEMINI_API_KEY in der .env oder den Präferenzen gefunden. Bitte trage diesen ein.');
    process.exit(1);
  }

  try {
    const result = await evaluateListing(mockListing, mockPreferences, mockPreferences.geminiApiKey);
    console.log('\n--- Testergebnis ---');
    console.log('Match Score:', result.matchScore);
    console.log('Zusammenfassung:', result.matchSummary);
    console.log('Vorteile (Pros):', result.pros);
    console.log('Nachteile (Cons):', result.cons);
    console.log('Geschätzte Nebenkosten:', result.estimatedNebenkosten, '€');
    console.log('Geschätzte Kaution:', result.estimatedKaution, '€');
    console.log('Mietpreisbremse-Check:', JSON.stringify(result.mietpreisbremseCheck, null, 2));
    
    if (result.estimatedNebenkosten !== undefined && result.mietpreisbremseCheck !== undefined) {
      console.log('\nSUCCESS: Neue Felder wurden erfolgreich von der KI zurückgegeben!');
    } else {
      console.error('\nFEHLER: Die neuen Felder fehlen in der Antwort der KI.');
    }
  } catch (error) {
    console.error('Test fehlgeschlagen:', error);
  }
}

runTest();
