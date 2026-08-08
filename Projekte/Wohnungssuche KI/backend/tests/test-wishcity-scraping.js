import { scrapeImmowelt } from '../scraper.js';
import { scrapeOhneMakler } from '../scraper-ohnmakler.js';
import { geocodeAddress } from '../geocoder.js';

async function run() {
  const city = 'Bonn Stadtteil Bad Godesberg';
  console.log(`Testing scrapers with city: "${city}"`);
  
  // Geocode first, just like in server.js runScan()
  let searchCityClean = city;
  try {
    const geo = await geocodeAddress(city);
    if (geo && geo.city) {
      searchCityClean = geo.city;
      console.log(`Search city "${city}" geocoded to clean city: "${searchCityClean}" (State: "${geo.state}")`);
    }
  } catch (err) {
    console.error(`Geocoding failed for search city "${city}":`, err.message);
  }

  console.log('\n--- Testing Immowelt ---');
  try {
    const iw = await scrapeImmowelt(searchCityClean, 1000);
    console.log(`Immowelt found: ${iw.length} listings`);
  } catch (err) {
    console.error('Immowelt failed:', err.message);
  }

  console.log('\n--- Testing Ohne-Makler ---');
  try {
    const om = await scrapeOhneMakler(searchCityClean, 1000);
    console.log(`Ohne-Makler found: ${om.length} listings`);
  } catch (err) {
    console.error('Ohne-Makler failed:', err.message);
  }
}
run();
