import { scrapeKleinanzeigen } from '../scraper.js';

async function run() {
  try {
    console.log("Scrape Kleinanzeigen Test für Bonn...");
    const listings = await scrapeKleinanzeigen('Bonn', 600, 10);
    console.log("Ergebnis:", listings.length, "Inserate gefunden.");
    if (listings.length > 0) {
      console.log("Erstes Inserat:", JSON.stringify(listings[0], null, 2));
    }
  } catch (err) {
    console.error("Test Fehlgeschlagen:", err);
  }
}

run();
