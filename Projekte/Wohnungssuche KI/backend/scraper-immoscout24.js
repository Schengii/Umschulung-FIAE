import { fetchPageContent } from './browser.js';
import * as cheerio from 'cheerio';

const CITY_SLUGS = {
  'münchen': 'muenchen',
  'munich': 'muenchen',
  'köln': 'koeln',
  'cologne': 'koeln',
  'düsseldorf': 'duesseldorf',
  'nürnberg': 'nuernberg',
  'nuremberg': 'nuernberg',
  'frankfurt am main': 'frankfurt-am-main',
  'frankfurt-am-main': 'frankfurt-am-main',
  'frankfurt': 'frankfurt-am-main',
  'fürth': 'fuerth',
  'würzburg': 'wuerzburg',
};

const CITY_STATES = {
  'berlin': 'berlin',
  'hamburg': 'hamburg',
  'münchen': 'bayern',
  'munich': 'bayern',
  'frankfurt': 'hessen',
  'frankfurt am main': 'hessen',
  'köln': 'nordrhein-westfalen',
  'düsseldorf': 'nordrhein-westfalen',
  'dortmund': 'nordrhein-westfalen',
  'essen': 'nordrhein-westfalen',
  'bonn': 'nordrhein-westfalen',
  'münster': 'nordrhein-westfalen',
  'aachen': 'nordrhein-westfalen',
  'bielefeld': 'nordrhein-westfalen',
  'wuppertal': 'nordrhein-westfalen',
  'bochum': 'nordrhein-westfalen',
  'gelsenkirchen': 'nordrhein-westfalen',
  'mönchengladbach': 'nordrhein-westfalen',
  'krefeld': 'nordrhein-westfalen',
  'oberhausen': 'nordrhein-westfalen',
  'hamm': 'nordrhein-westfalen',
  'hagen': 'nordrhein-westfalen',
  'mülheim': 'nordrhein-westfalen',
  'siegen': 'nordrhein-westfalen',
  'stuttgart': 'baden-wuerttemberg',
  'karlsruhe': 'baden-wuerttemberg',
  'mannheim': 'baden-wuerttemberg',
  'freiburg': 'baden-wuerttemberg',
  'freiburg im breisgau': 'baden-wuerttemberg',
  'heidelberg': 'baden-wuerttemberg',
  'heilbronn': 'baden-wuerttemberg',
  'pforzheim': 'baden-wuerttemberg',
  'ulm': 'baden-wuerttemberg',
  'konstanz': 'baden-wuerttemberg',
  'nürnberg': 'bayern',
  'augsburg': 'bayern',
  'regensburg': 'bayern',
  'ingolstadt': 'bayern',
  'würzburg': 'bayern',
  'fürth': 'bayern',
  'erlangen': 'bayern',
  'bayreuth': 'bayern',
  'bamberg': 'bayern',
  'passau': 'bayern',
  'hannover': 'niedersachsen',
  'braunschweig': 'niedersachsen',
  'wolfsburg': 'niedersachsen',
  'hildesheim': 'niedersachsen',
  'göttingen': 'niedersachsen',
  'osnabrück': 'niedersachsen',
  'oldenburg': 'niedersachsen',
  'bremen': 'bremen',
  'leipzig': 'sachsen',
  'dresden': 'sachsen',
  'chemnitz': 'sachsen',
  'erfurt': 'thueringen',
  'halle': 'sachsen-anhalt',
  'magdeburg': 'sachsen-anhalt',
  'rostock': 'mecklenburg-vorpommern',
  'kiel': 'schleswig-holstein',
  'lübeck': 'schleswig-holstein',
  'potsdam': 'brandenburg',
  'saarbrücken': 'saarland',
  'mainz': 'rheinland-pfalz',
  'trier': 'rheinland-pfalz',
  'kassel': 'hessen',
  'wiesbaden': 'hessen',
  'darmstadt': 'hessen',
  'ludwigshafen': 'rheinland-pfalz',
};

function normalizeCityName(city) {
  return city.toLowerCase().trim().replace(/\s*,.*$/, '');
}

function getCitySlug(city) {
  const normalized = normalizeCityName(city);
  if (CITY_SLUGS[normalized]) return CITY_SLUGS[normalized];
  return normalized
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function getCityState(city) {
  const normalized = normalizeCityName(city);
  if (CITY_STATES[normalized]) return CITY_STATES[normalized];
  // Fallback: Wir lassen den State leer und nutzen eine kürzere URL
  return null;
}

/**
 * Scrapt Mietwohnungs-Angebote von ImmoScout24 für eine bestimmte Stadt.
 * @param {string} city - Suchort
 * @param {number} maxPrice - Maximale Warmmiete
 * @param {object} options - Suchoptionen
 */
export async function scrapeImmoscout24(city, maxPrice, options = {}) {
  if (!city || city.trim().length === 0) return [];

  const rawCity = city.split(',')[0].trim();
  const citySlug = getCitySlug(rawCity);
  const state = getCityState(rawCity);

  const listings = [];
  const seenIds = new Set();

  const typesToSearch = [];
  if (options.searchRent !== false || options.searchSwap) {
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
      // ImmoScout24 URL-Format:
      // https://www.immobilienscout24.de/Suche/de/hessen/frankfurt-am-main/wohnung-mieten
      // Oder ohne State: https://www.immobilienscout24.de/Suche/de/wohnung-mieten?locationname=Frankfurt
      let url;
      if (state) {
        url = `https://www.immobilienscout24.de/Suche/de/${state}/${citySlug}/${type.path}`;
      } else {
        url = `https://www.immobilienscout24.de/Suche/de/${type.path}?locationname=${encodeURIComponent(rawCity)}`;
      }

      const priceParam = maxPrice ? `&priceto=${maxPrice}` : '';
      const pageParam = page > 1 ? `?pagenumber=${page}${priceParam.replace('?', '&')}` : (priceParam ? `?${priceParam.substring(1)}` : '');

      if (state) {
        url = `${url}${pageParam}`;
      } else {
        url = `${url}&pagenumber=${page}${priceParam}`;
      }

      console.log(`[ImmoScout24] Starte Scan (${type.label}, Seite ${page}): ${url}`);

      try {
        const html = await fetchPageContent(url);
        const $ = cheerio.load(html);
        let pageListingsCount = 0;

        // ImmoScout24 bettet Daten als JSON-LD ein
        $('script[type="application/ld+json"]').each((_, scriptEl) => {
          try {
            const jsonText = $(scriptEl).html();
            if (!jsonText) return;
            const data = JSON.parse(jsonText);

            // ItemList mit Wohnungen
            const items = data['@type'] === 'ItemList'
              ? (data.itemListElement || [])
              : (Array.isArray(data) ? data : []);

            items.forEach((item, idx) => {
              const listing = item.item || item;
              if (!listing || !listing.url) return;

              const idMatch = listing.url.match(/expose\/(\d+)/);
              const adId = idMatch ? idMatch[1] : `is24-${Date.now()}-${idx}`;

              if (seenIds.has(adId)) return;
              seenIds.add(adId);

              const fullUrl = listing.url.startsWith('http')
                ? listing.url
                : `https://www.immobilienscout24.de${listing.url}`;

              const price = listing.offers?.price || listing.price || 0;
              const parsedPrice = typeof price === 'string' ? parseInt(price.replace(/[^0-9]/g, ''), 10) : Math.round(Number(price));
              if (maxPrice && parsedPrice > 0 && parsedPrice > maxPrice) return;

              const isSwap = (listing.name || '').toLowerCase().includes('tausch');
              if (!options.searchRent && options.searchSwap && !isSwap) return;

              listings.push({
                id: `immoscout24-${adId}`,
                portal: 'immoscout24',
                url: fullUrl,
                title: listing.name || 'Wohnung auf ImmoScout24',
                priceKalt: parsedPrice,
                priceWarm: parsedPrice,
                sqm: parseFloat(listing.floorSize?.value || 0) || 0,
                rooms: parseFloat(listing.numberOfRooms || 0) || 0,
                location: listing.address?.addressLocality || rawCity,
                description: listing.description?.substring(0, 500) || '',
                images: listing.image ? (Array.isArray(listing.image) ? listing.image.slice(0, 5) : [listing.image]) : [],
                scrapedAt: new Date().toISOString(),
                manualImport: false,
                status: 'neu',
                isKauf: type.label === 'buy',
                isTausch: isSwap,
              });
              pageListingsCount++;
            });
          } catch (_) {}
        });

        // Fallback: HTML-Parsing wenn JSON-LD keine Ergebnisse bringt
        if (pageListingsCount === 0) {
          $('[data-id], article[data-id]').each((_, el) => {
            const adId = $(el).attr('data-id');
            if (!adId || seenIds.has(adId)) return;
            seenIds.add(adId);

            const linkEl = $(el).find('a[href*="/expose/"]').first();
            const href = linkEl.attr('href') || '';
            if (!href) return;

            const fullUrl = href.startsWith('http') ? href : `https://www.immobilienscout24.de${href}`;
            const cardText = $(el).text().replace(/\s+/g, ' ').trim();

            const priceMatch = cardText.match(/(\d[\d.]+)\s*€/);
            const priceWarm = priceMatch ? parseInt(priceMatch[1].replace(/\./g, ''), 10) : 0;
            if (maxPrice && priceWarm > 0 && priceWarm > maxPrice) return;

            const sqmMatch = cardText.match(/(\d+(?:[.,]\d+)?)\s*m²/);
            const roomsMatch = cardText.match(/(\d+(?:[.,]\d+)?)\s*Zimmer/i);
            const title = $(el).find('h5, h3, [data-cy="listing-title"]').first().text().trim() || 'Wohnung auf ImmoScout24';
            const isSwap = title.toLowerCase().includes('tausch');
            if (!options.searchRent && options.searchSwap && !isSwap) return;

            const imgUrl = $(el).find('img').first().attr('src') || $(el).find('img').first().attr('data-src') || '';

            listings.push({
              id: `immoscout24-${adId}`,
              portal: 'immoscout24',
              url: fullUrl,
              title,
              priceKalt: priceWarm,
              priceWarm,
              sqm: sqmMatch ? parseFloat(sqmMatch[1].replace(',', '.')) : 0,
              rooms: roomsMatch ? parseFloat(roomsMatch[1].replace(',', '.')) : 0,
              location: rawCity,
              description: cardText.substring(0, 500),
              images: imgUrl ? [imgUrl] : [],
              scrapedAt: new Date().toISOString(),
              manualImport: false,
              status: 'neu',
              isKauf: type.label === 'buy',
              isTausch: isSwap,
            });
            pageListingsCount++;
          });
        }

        console.log(`[ImmoScout24] Seite ${page}: ${pageListingsCount} Angebote gefunden.`);
        if (pageListingsCount === 0) break;

        if (page < 2) await new Promise(r => setTimeout(r, 2500));
      } catch (error) {
        console.error(`[ImmoScout24] Fehler beim Scrapen (${rawCity}, Seite ${page}):`, error.message);
        break;
      }
    }
  }

  console.log(`[ImmoScout24] Scan beendet. Insgesamt ${listings.length} Angebote für "${rawCity}".`);
  return listings;
}
