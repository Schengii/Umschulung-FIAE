import { fetchPageContent } from '../browser.js';
import * as cheerio from 'cheerio';

async function run() {
  try {
    const url = 'https://www.kleinanzeigen.de/s-wohnung-mieten/bonn/c203-l1038?radius=10&maxPrice=600';
    console.log(`Testing URL: ${url}`);
    const html = await fetchPageContent(url);
    const $ = cheerio.load(html);
    let count = 0;
    $('.aditem').each((index, element) => {
      const title = $(element).find('.aditem-main--middle--title a, .aditem-main--middle h2 a, .aditem-main--middle a.ellipsis').first().text().trim();
      const locationText = $(element).find('.aditem-main--top--left').text().trim();
      console.log(`  - Ad ${index+1}: "${title}" in "${locationText}"`);
      count++;
    });
    console.log(`Total ads found: ${count}`);
  } catch (e) {
    console.error("Error testing URL:", e.message);
  }
}

run();
