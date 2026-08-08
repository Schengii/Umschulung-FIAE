import axios from 'axios';
import * as cheerio from 'cheerio';
import { fetchPageContent } from './browser.js';

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

/**
 * Löst einen Stadtnamen (z.B. "Bonn") in die interne Kleinanzeigen-Location-ID auf.
 */
async function resolveKleinanzeigenLocationId(city) {
  try {
    const url = `https://www.kleinanzeigen.de/s-ort-empfehlungen.json?query=${encodeURIComponent(city)}`;
    const html = await fetchPageContent(url);
    
    // Extrahieren des JSON-Inhalts aus dem eventuell umgebenden HTML-Code (durch Puppeteer)
    let jsonText = html;
    if (html.includes('<pre>')) {
      const match = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
      if (match) {
        jsonText = match[1];
      }
    }
    
    const parsed = JSON.parse(jsonText.trim());
    
    // Besten Treffer finden (erster Eintrag, der mit "_" beginnt und nicht "_0" ist)
    const keys = Object.keys(parsed);
    for (const key of keys) {
      if (key.startsWith('_') && key !== '_0') {
        const id = key.substring(1);
        console.log(`[Kleinanzeigen] Ort "${city}" zu ID "${id}" aufgelöst ("${parsed[key]}")`);
        return id;
      }
    }
  } catch (err) {
    console.error(`[Kleinanzeigen] Fehler beim Auflösen der Orts-ID für "${city}":`, err.message);
  }
  return null;
}

/**
 * Holt die neuesten Mietwohnungs-Anzeigen von Kleinanzeigen für eine bestimmte Stadt.
 * @param {string} city - Suchort (z.B. "Bonn")
 * @param {number} maxPrice - Maximale Warmmiete
 * @param {number} radiusKm - Suchradius in km (Standard: 10)
 */
export async function scrapeKleinanzeigen(city, maxPrice, radiusKm = 10, options = {}) {
  // Kleinanzeigen URL-Format mit Umkreis:
  // https://www.kleinanzeigen.de/s-wohnung-mieten/{ort}/c203-l{id}?radius={km}&maxPrice={preis}
  // Erlaubte Radius-Werte: 5, 10, 20, 30, 50, 100, 150, 200
  const allowedRadii = [5, 10, 20, 30, 50, 100, 150, 200];
  const closestRadius = allowedRadii.reduce((prev, curr) =>
    Math.abs(curr - radiusKm) < Math.abs(prev - radiusKm) ? curr : prev
  );

  const queryCity = encodeURIComponent(city.trim().toLowerCase().replace(/[^a-z0-9]/g, '-'));
  const priceParam = maxPrice ? `&maxPrice=${maxPrice}` : '';
  const listings = [];

  const locationId = await resolveKleinanzeigenLocationId(city);
  if (!locationId) {
    console.log(`[Kleinanzeigen] Warnung: Konnte keine Orts-ID für "${city}" ermitteln. Führe ID-lose Suche durch.`);
  }

  const typesToSearch = [];
  if (options.searchRent || options.searchSwap) {
    typesToSearch.push({ path: 'wohnung-mieten', cat: 'c203', label: 'rent' });
  }
  if (options.searchBuy) {
    typesToSearch.push({ path: 'wohnung-kaufen', cat: 'c196', label: 'buy' });
  }
  if (typesToSearch.length === 0) {
    typesToSearch.push({ path: 'wohnung-mieten', cat: 'c203', label: 'rent' });
  }

  for (const type of typesToSearch) {
    for (let page = 1; page <= 2; page++) {
      const pagePart = page > 1 ? `seite:${page}/` : '';
      const url = locationId
        ? `https://www.kleinanzeigen.de/s-${type.path}/${queryCity}/${pagePart}${type.cat}-l${locationId}?radius=${closestRadius}${priceParam}`
        : `https://www.kleinanzeigen.de/s-${type.path}/${queryCity}/${pagePart}${type.cat}?radius=${closestRadius}${priceParam}`;

      console.log(`Starte Scan auf Kleinanzeigen (${type.label}, Seite ${page}): ${url} (Radius: ${closestRadius} km)`);

      try {
        const html = await fetchPageContent(url);
        const $ = cheerio.load(html);
        let pageListingsCount = 0;

        $('.aditem').each((index, element) => {
          const adId = $(element).attr('data-adid');
          if (!adId) return;

          if (listings.some(l => l.id === `kleinanzeigen-${adId}`)) return;

          const titleEl = $(element).find('.aditem-main--middle--title a, .aditem-main--middle h2 a, .aditem-main--middle a.ellipsis').first();
          const href = titleEl.attr('href');
          const title = titleEl.text().trim();
          const listingUrl = href ? `https://www.kleinanzeigen.de${href}` : '';

          const priceText = $(element).find('.aditem-main--middle--price-shipping--price').text().trim();
          const priceVal = parseInt(priceText.replace(/[^0-9]/g, ''), 10) || 0;

          const detailsText = $(element).find('.aditem-main--middle--description').text().trim();
          const locationText = $(element).find('.aditem-main--top--left').text().trim();
          
          const textContent = $(element).text().trim().replace(/\s+/g, ' ');

          let rooms = 0;
          let sqm = 0;

          const sqmMatch = textContent.match(/(\d+(?:[.,]\d+)?)\s*(?:qm|m²|m2)/i);
          if (sqmMatch) {
            sqm = parseFloat(sqmMatch[1].replace(',', '.')) || 0;
          }

          const roomsMatch = textContent.match(/(\d+(?:[.,]\d+)?)\s*(?:zimmer|-zimmer|zi\b)/i);
          if (roomsMatch) {
            rooms = parseFloat(roomsMatch[1].replace(',', '.')) || 0;
          }

          const imgUrl = $(element).find('.imagebox img, .aditem-image img').attr('src') || '';

          const isSwap = title.toLowerCase().includes('tausch') || detailsText.toLowerCase().includes('tausch');
          
          // Filterung nach Tauschwohnungen (wenn nur Tausch gewünscht)
          if (type.label === 'rent' && !options.searchRent && options.searchSwap && !isSwap) {
            return; // Nur Tausch gesucht, aber kein Tausch-Inserat -> überspringen
          }

          listings.push({
            id: `kleinanzeigen-${adId}`,
            portal: 'kleinanzeigen',
            url: listingUrl,
            title: title,
            priceKalt: priceVal,
            priceWarm: priceVal,
            sqm: sqm,
            rooms: rooms,
            location: locationText,
            description: detailsText,
            images: imgUrl ? [imgUrl] : [],
            scrapedAt: new Date().toISOString(),
            manualImport: false,
            status: 'neu',
            isKauf: type.label === 'buy',
            isTausch: isSwap
          });
          pageListingsCount++;
        });

        console.log(`Seite ${page}: ${pageListingsCount} Angebote auf Kleinanzeigen gefunden.`);
        if (pageListingsCount === 0) break;

        if (page < 2) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Fehler beim Scrapen von Kleinanzeigen Seite ${page} (${city}):`, error.message);
        break;
      }
    }
  }

  console.log(`Scan abgeschlossen. Insgesamt ${listings.length} Angebote auf Kleinanzeigen gefunden.`);
  return listings;
}

/**
 * Holt die neuesten Mietwohnungs-Anzeigen von Immowelt für eine bestimmte Stadt.
 */
export async function scrapeImmowelt(city, maxPrice, options = {}) {
  if (!city || city.trim().length === 0) return [];
  const cleanCity = city.split(',')[0]
    .replace(/\d+/g, '')
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, '-');

  const listings = [];

  const typesToSearch = [];
  if (options.searchRent || options.searchSwap) {
    typesToSearch.push({ path: 'mieten', label: 'rent' });
  }
  if (options.searchBuy) {
    typesToSearch.push({ path: 'kaufen', label: 'buy' });
  }
  if (typesToSearch.length === 0) {
    typesToSearch.push({ path: 'mieten', label: 'rent' });
  }

  for (const type of typesToSearch) {
    for (let page = 1; page <= 2; page++) {
      // Immowelt pagination and date sorting:
      const pageParam = page > 1 ? `&sd=desc&sr=${page}` : '';
      const url = `https://www.immowelt.de/liste/${cleanCity}/wohnungen/${type.path}?sort=createdate%2Cdesc${pageParam}`;

      console.log(`Starte Scan auf Immowelt (${type.label}, Seite ${page}): ${url}`);

      try {
        const html = await fetchPageContent(url);
        const $ = cheerio.load(html);
        let pageListingsCount = 0;

        $('div[data-testid="serp-core-classified-card-testid"]').each((index, element) => {
          const card = $(element);
          const linkEl = card.find('a[href*="/expose/"]').first();
          const rawUrl = linkEl.attr('href') || '';
          if (!rawUrl) return;

          const exposeIdMatch = rawUrl.match(/\/expose\/([a-zA-Z0-9-]+)/);
          const adId = exposeIdMatch ? exposeIdMatch[1] : `immowelt-${Date.now()}-${index}`;
          
          if (listings.some(l => l.id === `immowelt-${adId}`)) return;

          const cleanUrl = exposeIdMatch
            ? `https://www.immowelt.de/expose/${exposeIdMatch[1]}`
            : (rawUrl.startsWith('http') ? rawUrl.split('?')[0].split('#')[0] : `https://www.immowelt.de${rawUrl.split('?')[0].split('#')[0]}`);

          const coverTitle = linkEl.attr('title') || '';
          let title = coverTitle || 'Wohnung zur Miete';
          if (title.includes(' - ')) {
            const titleParts = title.split(' - ');
            if (titleParts.length > 1) {
              title = titleParts[0] + ' in ' + (titleParts[1] || city);
            }
          }

          const textContent = card.text().trim().replace(/\s+/g, ' ');

          let priceKalt = 0;
          const priceMatch = textContent.match(/(\d+(?:\.\d+)?)\s*€/);
          if (priceMatch) {
            priceKalt = parseInt(priceMatch[1].replace('.', ''), 10);
          }

          if (maxPrice && priceKalt > maxPrice) {
            return;
          }

          let rooms = 0;
          const roomsMatch = textContent.match(/(\d+(?:[.,]\d+)?)\s*Zimmer/i);
          if (roomsMatch) {
            rooms = parseFloat(roomsMatch[1].replace(',', '.'));
          }

          let sqm = 0;
          const sqmMatch = textContent.match(/(\d+(?:[.,]\d+)?)\s*m²/);
          if (sqmMatch) {
            sqm = parseFloat(sqmMatch[1].replace(',', '.'));
          }

          let location = '';
          const locationRegex = /([A-Za-z0-9äöüß\s,.-]+?,\s*[A-Za-zäöüß\s.-]+?\s*\(\d{5}\))/;
          const locMatch = textContent.match(locationRegex);
          if (locMatch) {
            location = locMatch[1].trim()
              .replace(/^frei ab \d{2}\.\d{2}\.\d{4}\s*/i, '')
              .replace(/^\d+\.\s*Geschoss\s*/i, '')
              .replace(/^Geschoss\s*\d+\/\d+\s*/i, '')
              .replace(/^neu\s*/i, '');
          } else {
            location = city;
          }

          let description = '';
          if (location) {
            const idx = textContent.indexOf(location);
            if (idx !== -1) {
              description = textContent.substring(idx + location.length).trim();
            }
          }
          if (!description) {
            description = textContent;
          }

          const imgUrl = card.find('img').first().attr('src') || '';

          const isSwap = title.toLowerCase().includes('tausch') || description.toLowerCase().includes('tausch');
          if (type.label === 'rent' && !options.searchRent && options.searchSwap && !isSwap) {
            return;
          }

          listings.push({
            id: `immowelt-${adId}`,
            portal: 'immowelt',
            url: cleanUrl,
            title: title,
            priceKalt: priceKalt,
            priceWarm: priceKalt,
            sqm: sqm,
            rooms: rooms,
            location: location,
            description: description.substring(0, 500),
            images: imgUrl ? [imgUrl] : [],
            scrapedAt: new Date().toISOString(),
            manualImport: false,
            status: 'neu',
            isKauf: type.label === 'buy',
            isTausch: isSwap
          });
          pageListingsCount++;
        });

        console.log(`Seite ${page}: ${pageListingsCount} Angebote auf Immowelt gefunden.`);
        if (pageListingsCount === 0) break;

        if (page < 2) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Fehler beim Scrapen von Immowelt Seite ${page} (${city}):`, error.message);
        break;
      }
    }
  }

  console.log(`Scan abgeschlossen. Insgesamt ${listings.length} Angebote auf Immowelt gefunden.`);
  return listings;
}

