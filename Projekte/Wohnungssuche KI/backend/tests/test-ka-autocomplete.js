import { fetchPageContent } from '../browser.js';

async function run() {
  try {
    const url = 'https://www.kleinanzeigen.de/s-ort-empfehlungen.json?query=Bonn';
    console.log(`Fetching autocomplete suggestions from ${url}...`);
    const jsonText = await fetchPageContent(url);
    console.log("Response text:", jsonText);
    const parsed = JSON.parse(jsonText);
    console.log("Parsed suggestions:", JSON.stringify(parsed, null, 2));
  } catch (e) {
    console.error("Error fetching suggestions:", e.message);
  }
}

run();
