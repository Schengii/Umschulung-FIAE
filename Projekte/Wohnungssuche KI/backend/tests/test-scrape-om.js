import { scrapeOhneMakler } from '../scraper-ohnmakler.js';

async function testCity(city) {
  console.log(`\n============================`);
  console.log(`Teste Stadt: "${city}"`);
  console.log(`============================`);
  try {
    const listings = await scrapeOhneMakler(city, 1500);
    console.log(`Ergebnis: ${listings.length} Wohnungen gefunden.`);
    if (listings.length > 0) {
      console.log(`Erste Wohnung:`, {
        title: listings[0].title,
        url: listings[0].url,
        priceKalt: listings[0].priceKalt,
        location: listings[0].location
      });
    }
  } catch (err) {
    console.error(`Fehler bei "${city}":`, err.message);
  }
}

async function run() {
  await testCity('Bonn');
  await testCity('Berlin');
  await testCity('Frankfurt am Main');
  await testCity('München');
}
run();
