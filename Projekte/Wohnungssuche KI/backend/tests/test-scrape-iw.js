import { scrapeImmowelt } from '../scraper.js';

async function run() {
  console.log('Testing Immowelt...');
  try {
    const results = await scrapeImmowelt('Bonn', 1000);
    console.log(`Found ${results.length} listings on Immowelt.`);
    if (results.length > 0) {
      console.log('First listing:', results[0]);
    }
  } catch (err) {
    console.error('Error testing Immowelt:', err);
  }
}
run();
