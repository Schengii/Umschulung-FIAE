import { fetchPageContent } from './browser.js';
import * as cheerio from 'cheerio';

/**
 * Bekannte Stadt-IDs für WG-Gesucht.
 * Format: https://www.wg-gesucht.de/wohnungen-in-{stadt}.{id}.2.0.html
 * Die IDs können über die WG-Gesucht Suche im Browser ermittelt werden.
 */
const CITY_IDS = {
  'berlin': 8,
  'hamburg': 55,
  'münchen': 90,
  'munich': 90,
  'frankfurt': 41,
  'frankfurt am main': 41,
  'frankfurt-am-main': 41,
  'köln': 73,
  'cologne': 73,
  'düsseldorf': 30,
  'stuttgart': 124,
  'dortmund': 28,
  'essen': 37,
  'leipzig': 77,
  'bremen': 17,
  'dresden': 29,
  'hannover': 57,
  'nürnberg': 96,
  'nuremberg': 96,
  'duisburg': 31,
  'bochum': 11,
  'wuppertal': 141,
  'bielefeld': 10,
  'bonn': 14,
  'münster': 91,
  'karlsruhe': 68,
  'mannheim': 82,
  'augsburg': 4,
  'wiesbaden': 137,
  'gelsenkirchen': 45,
  'mönchengladbach': 88,
  'braunschweig': 16,
  'kiel': 70,
  'chemnitz': 20,
  'aachen': 1,
  'halle': 53,
  'magdeburg': 80,
  'freiburg': 42,
  'freiburg im breisgau': 42,
  'krefeld': 74,
  'lübeck': 79,
  'oberhausen': 98,
  'erfurt': 36,
  'mainz': 81,
  'rostock': 112,
  'kassel': 69,
  'hagen': 51,
  'potsdam': 106,
  'saarbrücken': 115,
  'hamm': 56,
  'mülheim': 89,
  'ludwigshafen': 78,
  'heidelberg': 60,
  'darmstadt': 24,
  'würzburg': 140,
  'regensburg': 108,
  'ingolstadt': 64,
  'göttingen': 48,
  'ulm': 131,
  'wolfsburg': 139,
  'heilbronn': 61,
  'pforzheim': 104,
  'konstanz': 72,
  'fürth': 43,
  'siegen': 119,
  'hildesheim': 62,
  'trier': 129,
  'passau': 101,
  'bamberg': 6,
  'bayreuth': 8,
  'erlangen': 35,
};

/**
 * Normalisiert einen Stadtnamen für die ID-Suche.
 */
function normalizeCityName(city) {
  return city
    .toLowerCase()
    .trim()
    .replace(/\s*,.*$/, '') // Alles nach Komma entfernen
    .replace(/ä/g, 'ä')
    .replace(/ö/g, 'ö')
    .replace(/ü/g, 'ü');
}

/**
 * Versucht, die WG-Gesucht Stadt-ID über die Suchautosuggestion zu finden.
 */
async function resolveWgGesuchtCityId(city) {
  const normalizedCity = normalizeCityName(city);

  // Direktes Lookup in der lokalen Mapping-Tabelle
  if (CITY_IDS[normalizedCity] !== undefined) {
    console.log(`[WG-Gesucht] Stadt "${city}" → ID ${CITY_IDS[normalizedCity]} (aus lokalem Mapping)`);
    return CITY_IDS[normalizedCity];
  }

  // Variante ohne Umlaute probieren
  const asciiCity = normalizedCity
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
  if (CITY_IDS[asciiCity] !== undefined) {
    console.log(`[WG-Gesucht] Stadt "${city}" → ID ${CITY_IDS[asciiCity]} (aus ASCII-Mapping)`);
    return CITY_IDS[asciiCity];
  }

  // Partielle Übereinstimmung suchen
  for (const [key, id] of Object.entries(CITY_IDS)) {
    if (normalizedCity.includes(key) || key.includes(normalizedCity)) {
      console.log(`[WG-Gesucht] Stadt "${city}" → ID ${id} (partielle Übereinstimmung mit "${key}")`);
      return id;
    }
  }

  // Autocomplete-API versuchen
  try {
    const encodedCity = encodeURIComponent(city);
    const apiUrl = `https://www.wg-gesucht.de/ajax/search.php?query=${encodedCity}&type=4`;
    const html = await fetchPageContent(apiUrl);

    // JSON aus möglichem HTML-Wrapper extrahieren
    let jsonText = html;
    const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
    if (preMatch) jsonText = preMatch[1];

    const data = JSON.parse(jsonText.trim());
    if (data && Array.isArray(data) && data.length > 0) {
      const cityId = data[0].id || data[0].city_id;
      if (cityId) {
        console.log(`[WG-Gesucht] Stadt "${city}" → ID ${cityId} (via API)`);
        return parseInt(cityId, 10);
      }
    }
  } catch (err) {
    console.warn(`[WG-Gesucht] API-Lookup für "${city}" fehlgeschlagen:`, err.message);
  }

  console.warn(`[WG-Gesucht] Keine Stadt-ID für "${city}" gefunden.`);
  return null;
}

/**
 * Erstellt die WG-Gesucht Such-URL.
 * Format: https://www.wg-gesucht.de/wohnungen-in-{stadt}.{id}.2.0.html
 * Typ 2 = Wohnungen, Typ 0 = WGs, Typ 1 = 1-Zimmer
 */
function buildWgGesuchtUrl(citySlug, cityId, page = 0, type = 2, maxRent = null) {
  // Typ 2 = Wohnungen, Seitennummer beginnt bei 0
  let url = `https://www.wg-gesucht.de/wohnungen-in-${citySlug}.${cityId}.2.${page}.html`;

  const params = [];
  if (maxRent) params.push(`max_rent=${maxRent}`);
  if (params.length > 0) {
    url += `?` + params.join('&');
  }
  return url;
}

/**
 * Parst eine einzelne Listing-Karte von WG-Gesucht.
 */
function parseListingCard($, element, city) {
  const el = $(element);

  // ID aus dem data-id Attribut oder Link
  const adId = el.attr('data-id') || el.attr('id') || '';
  const linkEl = el.find('a[href*="/wohnungen/"]').first()
    || el.find('a[href*="/wg-zimmer/"]').first()
    || el.find('a.result-list-entry').first()
    || el.find('a[href*="wg-gesucht.de"]').first();

  const href = linkEl.attr('href') || el.find('a').first().attr('href') || '';
  if (!href || href.trim() === '') return null;

  // ID aus dem Link extrahieren falls kein data-id vorhanden
  const idFromHref = href.match(/\.(\d+)\.html/) || href.match(/\/(\d+)\//);
  const finalId = adId || (idFromHref ? idFromHref[1] : `wgg-${Date.now()}-${Math.random()}`);

  const fullUrl = href.startsWith('http')
    ? href
    : `https://www.wg-gesucht.de${href}`;

  // Titel
  const title = el.find('h3.headline-list-view, h3.truncate_title, .headline-list-view, .truncate_title').first().text().trim()
    || el.find('h3').first().text().trim()
    || el.find('.col-sm-8 h3').first().text().trim()
    || 'Wohnung auf WG-Gesucht';

  const cardText = el.text().replace(/\s+/g, ' ').trim();

  // Preis extrahieren
  let priceWarm = 0;
  // Versuche spezifische Preis-Elemente
  el.find('.col-xs-3.text-right, .detail-size-price-wrapper, .noprint').each((_, priceEl) => {
    if (priceWarm > 0) return;
    const priceText = $(priceEl).text().trim();
    const priceMatch = priceText.match(/(\d+[\d.]*)\s*€/);
    if (priceMatch) {
      priceWarm = parseInt(priceMatch[1].replace(/\./g, ''), 10);
    }
  });

  // Fallback: Preis aus Gesamttext
  if (priceWarm === 0) {
    const priceMatch = cardText.match(/(\d{2,4})\s*€/);
    if (priceMatch) priceWarm = parseInt(priceMatch[1], 10);
  }

  // Quadratmeter extrahieren
  let sqm = 0;
  const sqmMatch = cardText.match(/(\d+(?:[.,]\d+)?)\s*m²/);
  if (sqmMatch) sqm = parseFloat(sqmMatch[1].replace(',', '.'));

  // Zimmer extrahieren
  let rooms = 0;
  const roomsMatch = cardText.match(/(\d+(?:[.,]\d+)?)\s*(?:Zimmer|Zi\.)/i);
  if (roomsMatch) rooms = parseFloat(roomsMatch[1].replace(',', '.'));

  // Ort
  let location = city;
  const locationEl = el.find('.col-xs-11, .list-details-panel-inner, .detailansicht').first();
  if (locationEl.length > 0) {
    const locText = locationEl.text().replace(/\s+/g, ' ').trim();
    const locMatch = locText.match(/(\d{5}\s+[\w\s]+)/);
    if (locMatch) location = locMatch[1].trim();
  }

  // Bild
  const imgUrl = el.find('img').first().attr('src')
    || el.find('img').first().attr('data-src')
    || '';
  const cleanImgUrl = imgUrl && !imgUrl.includes('placeholder') && !imgUrl.includes('noimage')
    ? imgUrl
    : '';

  // Tausch prüfen
  const isSwap = title.toLowerCase().includes('tausch') || cardText.toLowerCase().includes('tausch');

  return {
    id: `wg-gesucht-${finalId}`,
    portal: 'wg-gesucht',
    url: fullUrl,
    title: title || 'Wohnung auf WG-Gesucht',
    priceKalt: priceWarm,
    priceWarm: priceWarm,
    sqm,
    rooms,
    location,
    description: cardText.substring(0, 500),
    images: cleanImgUrl ? [cleanImgUrl] : [],
    scrapedAt: new Date().toISOString(),
    manualImport: false,
    status: 'neu',
    isKauf: false,
    isTausch: isSwap,
  };
}

/**
 * Scrapt Mietwohnungs-Angebote von WG-Gesucht für eine bestimmte Stadt.
 * @param {string} city - Suchort (z.B. "Bonn")
 * @param {number} maxPrice - Maximale Warmmiete
 * @param {object} options - Suchoptionen (searchRent, searchBuy, searchSwap)
 */
export async function scrapeWgGesucht(city, maxPrice, options = {}) {
  if (!city || city.trim().length === 0) return [];

  const rawCity = city.split(',')[0].trim();

  // Stadt-ID ermitteln
  const cityId = await resolveWgGesuchtCityId(rawCity);
  if (cityId === null) {
    console.warn(`[WG-Gesucht] Überspringe Suche: Keine Stadt-ID für "${rawCity}" gefunden.`);
    return [];
  }

  // Stadtname für URL normalisieren (nur a-z, Bindestriche)
  const citySlug = rawCity
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  const listings = [];
  const seenIds = new Set();

  // Typen, die gescrapt werden sollen
  // Auf WG-Gesucht: type 2 = Wohnungen, type 0 = WGs (wir nehmen nur Wohnungen)
  const shouldScrape = options.searchRent !== false || options.searchSwap;

  if (!shouldScrape && !options.searchBuy) {
    console.log(`[WG-Gesucht] Weder Mieten noch Kaufen aktiviert. Überspringe.`);
    return [];
  }

  // Suchseiten scrapen (Seite 0 und 1 = 2 Seiten mit je ~20 Ergebnissen)
  for (let page = 0; page <= 1; page++) {
    const url = buildWgGesuchtUrl(citySlug, cityId, page, 2, maxPrice);
    console.log(`[WG-Gesucht] Starte Scan (Seite ${page + 1}/2): ${url}`);

    try {
      const html = await fetchPageContent(url);
      const $ = cheerio.load(html);
      let pageListingsCount = 0;

      // WG-Gesucht hat verschiedene Selektoren je nach Layout
      const selectors = [
        '.offer_list_item',
        '.list-details-item',
        'article.panel',
        '.wgg_card',
        '[data-id]',
        '.result-list-entry',
      ];

      let found = false;
      for (const selector of selectors) {
        const items = $(selector);
        if (items.length > 0) {
          console.log(`[WG-Gesucht] Verwende Selektor "${selector}" (${items.length} Elemente)`);
          items.each((_, element) => {
            try {
              const listing = parseListingCard($, element, rawCity);
              if (!listing) return;
              if (seenIds.has(listing.id)) return;

              // Preisfilter
              if (maxPrice && listing.priceWarm > 0 && listing.priceWarm > maxPrice) return;

              // Tauschfilter
              if (!options.searchRent && options.searchSwap && !listing.isTausch) return;

              // URL muss auf ein konkretes Inserat zeigen
              if (!listing.url.match(/\d{4,}/)) return;

              seenIds.add(listing.id);
              listings.push(listing);
              pageListingsCount++;
            } catch (parseErr) {
              console.warn(`[WG-Gesucht] Fehler beim Parsen eines Inserats:`, parseErr.message);
            }
          });
          found = true;
          break;
        }
      }

      if (!found) {
        // Fallback: Suche nach allen Links zu Inseraten
        console.log(`[WG-Gesucht] Kein spezifischer Selektor gefunden. Versuche Link-Fallback...`);
        $('a[href*="/wohnungen/"]').each((_, el) => {
          const href = $(el).attr('href') || '';
          if (!href.match(/\.(\d+)\.html$/) && !href.match(/\/(\d+)\.html/)) return;

          const idMatch = href.match(/\.(\d+)\.html$/) || href.match(/\/(\d+)\.html/);
          const adId = idMatch ? `wg-gesucht-${idMatch[1]}` : `wg-gesucht-${Date.now()}-${Math.random()}`;

          if (seenIds.has(adId)) return;
          seenIds.add(adId);

          const fullUrl = href.startsWith('http') ? href : `https://www.wg-gesucht.de${href}`;
          const parent = $(el).closest('div, article, li');
          const cardText = parent.text().replace(/\s+/g, ' ').trim();

          const priceMatch = cardText.match(/(\d{2,4})\s*€/);
          const sqmMatch = cardText.match(/(\d+(?:[.,]\d+)?)\s*m²/);
          const roomsMatch = cardText.match(/(\d+(?:[.,]\d+)?)\s*(?:Zimmer|Zi\.)/i);
          const priceWarm = priceMatch ? parseInt(priceMatch[1], 10) : 0;

          if (maxPrice && priceWarm > 0 && priceWarm > maxPrice) return;

          listings.push({
            id: adId,
            portal: 'wg-gesucht',
            url: fullUrl,
            title: $(el).text().trim() || 'Wohnung auf WG-Gesucht',
            priceKalt: priceWarm,
            priceWarm,
            sqm: sqmMatch ? parseFloat(sqmMatch[1].replace(',', '.')) : 0,
            rooms: roomsMatch ? parseFloat(roomsMatch[1].replace(',', '.')) : 0,
            location: rawCity,
            description: cardText.substring(0, 500),
            images: [],
            scrapedAt: new Date().toISOString(),
            manualImport: false,
            status: 'neu',
            isKauf: false,
            isTausch: false,
          });
          pageListingsCount++;
        });
      }

      console.log(`[WG-Gesucht] Seite ${page + 1}: ${pageListingsCount} Angebote gefunden.`);
      if (pageListingsCount === 0) break;

      if (page < 1) {
        await new Promise(resolve => setTimeout(resolve, 2500));
      }
    } catch (error) {
      console.error(`[WG-Gesucht] Fehler beim Scrapen von Seite ${page + 1} (${rawCity}):`, error.message);
      break;
    }
  }

  console.log(`[WG-Gesucht] Scan beendet. Insgesamt ${listings.length} Angebote für "${rawCity}" gefunden.`);
  return listings;
}
