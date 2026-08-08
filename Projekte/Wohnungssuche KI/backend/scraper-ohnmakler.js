import { fetchPageContent } from './browser.js';
import * as cheerio from 'cheerio';
import { geocodeAddress } from './geocoder.js';

const CITY_MAPPINGS = {
  'frankfurt-am-main': 'frankfurt-main',
  'frankfurt-main': 'frankfurt-main',
  'frankfurt-an-der-oder': 'frankfurt-oder',
  'rothenburg-ob-der-tauber': 'rothenburg-tauber'
};

function cleanName(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
}

/**
 * Scrapt Mietwohnungs-Angebote von ohne-makler.net für eine bestimmte Stadt.
 * URL-Format: https://www.ohne-makler.net/immobilien/wohnung-mieten/{bundesland}/{city}/
 *
 * HTML-Struktur (Stand Juni 2025):
 * - Listing-Cards liegen in: div[class*="shadow-md p-4"]
 * - Jede Card enthält einen Link: a[href*="/immobilie/"]
 * - Titel: h4 (class enthält "line-clamp-1 group-hover:underline")
 * - Preis: span[class*="text-primary-500 text-xl"] 
 * - Fläche: span[class*="block text-slate-700 font-medium"] (z.B. "62m²")
 * - Adresse: span[class*="text-sm text-slate-500"]
 * - Bild: img in der Card
 */
export async function scrapeOhneMakler(city, maxPrice, options = {}) {
  if (!city || city.trim().length === 0) return [];

  const rawCity = city.split(',')[0].trim();
  let cleanCity = cleanName(rawCity);
  if (CITY_MAPPINGS[cleanCity]) {
    cleanCity = CITY_MAPPINGS[cleanCity];
  }

  let cleanState = '';
  try {
    const geo = await geocodeAddress(rawCity);
    if (geo && geo.state) {
      cleanState = cleanName(geo.state);
    }
  } catch (err) {
    console.error(`Geocoding fehlgeschlagen für Ohne-Makler-Suche:`, err.message);
  }

  if (!cleanState) {
    cleanState = cleanCity;
  }

  const listings = [];
  const seenIds = new Set();

  const typesToSearch = [];
  if (options.searchRent || options.searchSwap) {
    typesToSearch.push({ path: 'wohnung-mieten', label: 'rent' });
  }
  if (options.searchBuy) {
    typesToSearch.push({ path: 'wohnung-kaufen', label: 'buy' });
  }
  if (typesToSearch.length === 0) {
    typesToSearch.push({ path: 'wohnung-mieten', label: 'rent' });
  }

  for (const type of typesToSearch) {
    for (let page = 1; page <= 2; page++) {
      const pageParam = page > 1 ? `?p=${page}` : '';
      const url = `https://www.ohne-makler.net/immobilien/${type.path}/${cleanState}/${cleanCity}/${pageParam}`;
      console.log(`Starte Scan auf ohne-makler.net (${type.label}, Seite ${page}): ${url}`);

      try {
        const html = await fetchPageContent(url);
        const $ = cheerio.load(html);
        let pageListingsCount = 0;

        $('a[href*="/immobilie/"]').each((i, el) => {
          const href = $(el).attr('href') || '';
          if (!href.match(/\/immobilie\/\d+\//)) return;

          const idMatch = href.match(/\/immobilie\/(\d+)\//);
          const adId = idMatch ? idMatch[1] : `om-${Date.now()}-${i}`;

          if (seenIds.has(adId)) return;
          seenIds.add(adId);

          const fullUrl = href.startsWith('http') ? href : `https://www.ohne-makler.net${href}`;
          const card = $(el);
          const titleEl = card.find('h4').first();
          const title = titleEl.text().trim() || card.find('h3').first().text().trim() || 'Wohnung auf ohne-makler.net';
          const cardText = card.text().replace(/\s+/g, ' ').trim();

          let priceKalt = 0;
          card.find('span[class*="text-primary-500"]').each((_, priceEl) => {
            if (priceKalt > 0) return;
            const priceText = $(priceEl).text().trim();
            const priceMatch = priceText.match(/([\d.,]+)\s*€/);
            if (priceMatch) {
              priceKalt = parseInt(priceMatch[1].replace(/\./g, '').replace(',', '.'), 10);
            }
          });

          if (priceKalt === 0) {
            const priceMatch = cardText.match(/([\d][.\d]*)\s*€/);
            if (priceMatch) {
              priceKalt = parseInt(priceMatch[1].replace(/\./g, ''), 10);
            }
          }

          if (maxPrice && priceKalt > maxPrice) return;

          let sqm = 0;
          card.find('span[class*="text-slate-700"][class*="font-medium"]').each((_, sqmEl) => {
            if (sqm > 0) return;
            const sqmText = $(sqmEl).text().trim();
            const sqmMatch = sqmText.match(/(\d+(?:[.,]\d+)?)\s*m²/);
            if (sqmMatch) sqm = parseFloat(sqmMatch[1].replace(',', '.'));
          });

          if (sqm === 0) {
            const sqmMatch = cardText.match(/(\d+(?:[.,]\d+)?)\s*m²/);
            if (sqmMatch) sqm = parseFloat(sqmMatch[1].replace(',', '.'));
          }

          let rooms = 0;
          const roomsMatch = (title + ' ' + cardText).match(/(\d+(?:[.,]\d+)?)[- ]?(?:Zimmer|Zi\.)/i);
          if (roomsMatch) rooms = parseFloat(roomsMatch[1].replace(',', '.'));

          let location = city;
          card.find('span[class*="text-slate-500"], span[class*="text-slate-600"]').each((_, locEl) => {
            const locText = $(locEl).text().trim();
            if (locText.length > 3 && !locText.includes('€') && !locText.match(/^\d+m/)) {
              location = locText;
              return false;
            }
          });

          const imgUrl = card.find('img').first().attr('src') || card.find('img').first().attr('data-src') || '';

          const isSwap = title.toLowerCase().includes('tausch') || cardText.toLowerCase().includes('tausch');
          if (type.label === 'rent' && !options.searchRent && options.searchSwap && !isSwap) {
            return;
          }

          listings.push({
            id: `ohne-makler-${adId}`,
            portal: 'ohne-makler',
            url: fullUrl,
            title,
            priceKalt,
            priceWarm: priceKalt,
            sqm,
            rooms,
            location,
            description: cardText.substring(0, 400),
            images: imgUrl ? [imgUrl] : [],
            scrapedAt: new Date().toISOString(),
            manualImport: false,
            status: 'neu',
            isKauf: type.label === 'buy',
            isTausch: isSwap
          });
          pageListingsCount++;
        });

        console.log(`Seite ${page}: ${pageListingsCount} Angebote auf ohne-makler.net gefunden.`);
        if (pageListingsCount === 0) break;

        if (page < 2) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Fehler beim Scrapen von ohne-makler.net Seite ${page} (${city}):`, error.message);
        break;
      }
    }
  }

  console.log(`ohne-makler.net Scan beendet. Insgesamt ${listings.length} Angebote für "${city}" gefunden.`);
  return listings;
}
