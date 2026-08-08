import { fetchPageContent } from './browser.js';
import * as cheerio from 'cheerio';

function getCitySlug(city) {
  return city
    .split(',')[0]
    .trim()
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * Scrapt Mietwohnungs-Angebote von Immonet.de für eine bestimmte Stadt.
 * URL-Format: https://www.immonet.de/mieten/wohnungen-{city}.html
 * @param {string} city - Suchort
 * @param {number} maxPrice - Maximale Warmmiete
 * @param {object} options - Suchoptionen
 */
export async function scrapeImmonet(city, maxPrice, options = {}) {
  if (!city || city.trim().length === 0) return [];

  const rawCity = city.split(',')[0].trim();
  const citySlug = getCitySlug(rawCity);
  const listings = [];
  const seenIds = new Set();

  const typesToSearch = [];
  if (options.searchRent !== false || options.searchSwap) {
    typesToSearch.push({ path: 'mieten/wohnungen', label: 'rent' });
  }
  if (options.searchBuy) {
    typesToSearch.push({ path: 'kaufen/wohnungen', label: 'buy' });
  }
  if (typesToSearch.length === 0) {
    typesToSearch.push({ path: 'mieten/wohnungen', label: 'rent' });
  }

  for (const type of typesToSearch) {
    for (let page = 1; page <= 2; page++) {
      const pageParam = page > 1 ? `?page=${page}` : '';
      const priceParam = maxPrice ? `${pageParam ? '&' : '?'}price_to=${maxPrice}` : '';
      const url = `https://www.immonet.de/${type.path}-${citySlug}.html${pageParam}${priceParam}`;

      console.log(`[Immonet] Starte Scan (${type.label}, Seite ${page}): ${url}`);

      try {
        const html = await fetchPageContent(url);
        const $ = cheerio.load(html);
        let pageListingsCount = 0;

        // Immonet nutzt Karten mit IDs wie "selObject_XXXXXX"
        const selectors = [
          '[id^="selObject_"]',
          '.item__link',
          '[data-object-id]',
          '.result-list__listing',
          'article.result-list-entry',
        ];

        let processedItems = false;
        for (const selector of selectors) {
          const items = $(selector);
          if (items.length === 0) continue;

          console.log(`[Immonet] Verwende Selektor "${selector}" (${items.length} Elemente)`);
          items.each((_, el) => {
            const card = $(el);
            const rawId = card.attr('id') || card.attr('data-object-id') || '';
            const adId = rawId.replace('selObject_', '') || `immonet-${Date.now()}-${Math.random()}`;

            if (seenIds.has(adId)) return;
            seenIds.add(adId);

            const linkEl = card.find('a[href*="/expose/"], a[href*="/immobilie/"], a').first();
            const href = linkEl.attr('href') || '';
            if (!href || href === '#') return;

            const fullUrl = href.startsWith('http') ? href : `https://www.immonet.de${href}`;
            const cardText = card.text().replace(/\s+/g, ' ').trim();

            // Preis
            let priceWarm = 0;
            card.find('.item__price, .price, [class*="price"]').each((_, priceEl) => {
              if (priceWarm > 0) return;
              const text = $(priceEl).text().trim();
              const m = text.match(/(\d[\d.]+)\s*€/);
              if (m) priceWarm = parseInt(m[1].replace(/\./g, ''), 10);
            });
            if (priceWarm === 0) {
              const m = cardText.match(/(\d{3,4})\s*€/);
              if (m) priceWarm = parseInt(m[1], 10);
            }
            if (maxPrice && priceWarm > 0 && priceWarm > maxPrice) return;

            // Quadratmeter
            let sqm = 0;
            const sqmMatch = cardText.match(/(\d+(?:[.,]\d+)?)\s*m²/);
            if (sqmMatch) sqm = parseFloat(sqmMatch[1].replace(',', '.'));

            // Zimmer
            let rooms = 0;
            const roomsMatch = cardText.match(/(\d+(?:[.,]\d+)?)\s*(?:Zimmer|Zi\.)/i);
            if (roomsMatch) rooms = parseFloat(roomsMatch[1].replace(',', '.'));

            // Titel
            const title = card.find('h2, h3, .item__title, [class*="title"]').first().text().trim()
              || 'Wohnung auf Immonet';

            // Bild
            const imgUrl = card.find('img').first().attr('src') || card.find('img').first().attr('data-src') || '';
            const cleanImg = imgUrl && !imgUrl.includes('placeholder') ? imgUrl : '';

            // Ort
            let location = rawCity;
            const locEl = card.find('.item__description__address, [class*="address"], [class*="location"]').first();
            if (locEl.length > 0) {
              const locText = locEl.text().trim();
              if (locText.length > 3) location = locText;
            }

            const isSwap = title.toLowerCase().includes('tausch') || cardText.toLowerCase().includes('tausch');
            if (!options.searchRent && options.searchSwap && !isSwap) return;

            listings.push({
              id: `immonet-${adId}`,
              portal: 'immonet',
              url: fullUrl,
              title,
              priceKalt: priceWarm,
              priceWarm,
              sqm,
              rooms,
              location,
              description: cardText.substring(0, 500),
              images: cleanImg ? [cleanImg] : [],
              scrapedAt: new Date().toISOString(),
              manualImport: false,
              status: 'neu',
              isKauf: type.label === 'buy',
              isTausch: isSwap,
            });
            pageListingsCount++;
          });

          processedItems = true;
          break;
        }

        // Link-Fallback
        if (!processedItems || pageListingsCount === 0) {
          $('a[href*="/expose/"]').each((_, el) => {
            const href = $(el).attr('href') || '';
            const idMatch = href.match(/\/(\d{6,})/);
            if (!idMatch) return;
            const adId = idMatch[1];
            if (seenIds.has(adId)) return;
            seenIds.add(adId);

            const fullUrl = href.startsWith('http') ? href : `https://www.immonet.de${href}`;
            const parent = $(el).closest('div, article, li');
            const cardText = parent.text().replace(/\s+/g, ' ').trim();

            const priceMatch = cardText.match(/(\d{3,4})\s*€/);
            const priceWarm = priceMatch ? parseInt(priceMatch[1], 10) : 0;
            if (maxPrice && priceWarm > 0 && priceWarm > maxPrice) return;

            listings.push({
              id: `immonet-${adId}`,
              portal: 'immonet',
              url: fullUrl,
              title: $(el).text().trim() || 'Wohnung auf Immonet',
              priceKalt: priceWarm,
              priceWarm,
              sqm: 0,
              rooms: 0,
              location: rawCity,
              description: cardText.substring(0, 500),
              images: [],
              scrapedAt: new Date().toISOString(),
              manualImport: false,
              status: 'neu',
              isKauf: type.label === 'buy',
              isTausch: false,
            });
            pageListingsCount++;
          });
        }

        console.log(`[Immonet] Seite ${page}: ${pageListingsCount} Angebote gefunden.`);
        if (pageListingsCount === 0) break;

        if (page < 2) await new Promise(r => setTimeout(r, 2500));
      } catch (error) {
        console.error(`[Immonet] Fehler beim Scrapen (${rawCity}, Seite ${page}):`, error.message);
        break;
      }
    }
  }

  console.log(`[Immonet] Scan beendet. Insgesamt ${listings.length} Angebote für "${rawCity}".`);
  return listings;
}
