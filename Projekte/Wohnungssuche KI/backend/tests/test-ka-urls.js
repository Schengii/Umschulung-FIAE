import { fetchPageContent } from '../browser.js';
import * as cheerio from 'cheerio';

async function testUrl(url) {
  try {
    console.log(`\nTesting URL: ${url}`);
    const html = await fetchPageContent(url);
    const $ = cheerio.load(html);
    let count = 0;
    $('.aditem').each((index, element) => {
      if (index < 3) {
        const title = $(element).find('.aditem-main--middle--title a, .aditem-main--middle h2 a, .aditem-main--middle a.ellipsis').first().text().trim();
        const locationText = $(element).find('.aditem-main--top--left').text().trim();
        console.log(`  - Ad ${index+1}: "${title}" in "${locationText}"`);
      }
      count++;
    });
    console.log(`Total ads found for this URL: ${count}`);
  } catch (e) {
    console.error("Error testing URL:", e.message);
  }
}

async function run() {
  // Try with 'bonn'
  await testUrl('https://www.kleinanzeigen.de/s-wohnung-mieten/bonn/c203?radius=10');
  // Try with postal code '53111'
  await testUrl('https://www.kleinanzeigen.de/s-wohnung-mieten/53111/c203?radius=10');
  // Try with 'bonn' and category and ID if we can search with keywords
  await testUrl('https://www.kleinanzeigen.de/s-wohnung-mieten/c203?keywords=Bonn&radius=10');
}

run();
