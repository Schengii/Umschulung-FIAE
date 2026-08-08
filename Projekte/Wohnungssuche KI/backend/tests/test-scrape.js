import { fetchPageContent } from '../browser.js';
import * as cheerio from 'cheerio';
import fs from 'fs';

async function run() {
  try {
    const url = 'https://www.ohne-makler.net/immobilien/bonn/mieten/';
    console.log(`Starte Fetch von ${url}...`);
    const html = await fetchPageContent(url);
    fs.writeFileSync('ohne_makler_result.html', html, 'utf8');
    console.log("HTML erfolgreich gespeichert. Größe:", html.length);
    const $ = cheerio.load(html);
    console.log("Seitentitel:", $('title').text());
    
    // Suche nach Links mit /immobilie/
    const links = new Set();
    $('a').each((i, el) => {
      const href = $(el).attr('href') || '';
      if (href.includes('/immobilie/') && !href.includes('list')) {
        links.add(href);
      }
    });
    console.log("Gefundene Links (erste 15):", Array.from(links).slice(0, 15));

  } catch (e) {
    console.error("Scraping-Fehler:", e.message);
  }
}
run();
