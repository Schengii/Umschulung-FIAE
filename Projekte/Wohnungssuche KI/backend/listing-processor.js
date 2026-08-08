import * as cheerio from 'cheerio';
import { db } from './db.js';
import { parseListingFromText, evaluateListing, generateCoverLetter, parseListingFromScreenshot } from './ai-analyzer.js';
import { fetchPageContent, takeScreenshot } from './browser.js';
import { geocodeAddress, calculateDistance, getOSRMRoute, getTransitRoute } from './geocoder.js';
import { fetchNearbyPOIs } from './poi-fetcher.js';

/**
 * Bewertet eine Wohnung und reichert sie mit Entfernungs- und Routingdaten an.
 */
export async function processAndEvaluateListing(listing, preferences, force = false) {
  const apiKey = preferences.geminiApiKey;
  if (!apiKey) {
    console.log(`Kein Gemini API-Key vorhanden. Wohnung "${listing.title}" wird ohne AI-Bewertung gespeichert.`);
    listing.matchScore = 50;
    listing.matchSummary = 'Profil unvollständig: Trage einen Gemini API-Key ein, um dieses Inserat bewerten zu lassen.';
    listing.pros = [];
    listing.cons = [];
    listing.coverLetter = '';
    return listing;
  }

  // Caching: bereits bewertete Inserate überspringen, außer force = true
  if (!force && listing.matchScore && listing.matchScore !== 50 && listing.matchSummary && listing.matchSummary.length > 20 &&
      !listing.matchSummary.startsWith('Fehler') && !listing.matchSummary.startsWith('Profil')) {
    console.log(`[Cache] Listing "${listing.title}" hat bereits Score ${listing.matchScore}. Gemini-Bewertung wird übersprungen.`);
    return listing;
  }

  try {
    let enrichedData = { ...listing };
    
    // Falls qm oder zimmer noch 0 sind (weil Scraper sie nicht fand), lassen wir Gemini das Inserat parsen
    if (listing.sqm === 0 || listing.rooms === 0) {
      console.log(`Daten unvollständig für "${listing.title}". Lasse Gemini parsen...`);
      const rawTextForGemini = `Titel: ${listing.title}\nBeschreibung: ${listing.description}\nOrt: ${listing.location}`;
      const parsed = await parseListingFromText(rawTextForGemini, apiKey);
      
      enrichedData.sqm = parsed.sqm || listing.sqm;
      enrichedData.rooms = parsed.rooms || listing.rooms;
      if (parsed.priceKalt > 0) enrichedData.priceKalt = parsed.priceKalt;
      if (parsed.priceWarm > 0) enrichedData.priceWarm = parsed.priceWarm;
      if (parsed.location) enrichedData.location = parsed.location;

      // Phase 4 - Screenshot-Fallback: Falls Text-Parsing immer noch unvollständig, visuell analysieren
      if ((enrichedData.sqm === 0 || enrichedData.rooms === 0) && listing.url) {
        console.log(`[Screenshot-Fallback] Text-Parsing unvollständig für "${listing.title}". Erstelle Screenshot...`);
        const screenshot = await takeScreenshot(listing.url);
        if (screenshot) {
          const screenshotParsed = await parseListingFromScreenshot(screenshot, apiKey);
          if (screenshotParsed) {
            if (screenshotParsed.sqm > 0) enrichedData.sqm = screenshotParsed.sqm;
            if (screenshotParsed.rooms > 0) enrichedData.rooms = screenshotParsed.rooms;
            if (screenshotParsed.priceKalt > 0) enrichedData.priceKalt = screenshotParsed.priceKalt;
            if (screenshotParsed.priceWarm > 0) enrichedData.priceWarm = screenshotParsed.priceWarm;
            if (screenshotParsed.location && !enrichedData.location) enrichedData.location = screenshotParsed.location;
            console.log(`[Screenshot-Fallback] Visuelles Parsing erfolgreich für "${listing.title}": ${enrichedData.sqm} m², ${enrichedData.rooms} Zi.`);
          }
        }
      }
    }

    // Geocodiere die Wohnung für die Entfernung und Kartendarstellung
    let geocodingSuccessful = false;
    if (enrichedData.location) {
      try {
        const geo = await geocodeAddress(enrichedData.location);
        if (geo) {
          geocodingSuccessful = true;
          enrichedData.lat = geo.lat;
          enrichedData.lon = geo.lon;
          enrichedData.state = geo.state || '';
          
          // Entfernung zum Arbeitsplatz/Zielort (Legacy)
          if (preferences.targetLat !== null && preferences.targetLon !== null && preferences.targetLat !== undefined) {
            enrichedData.distanceKm = calculateDistance(geo.lat, geo.lon, preferences.targetLat, preferences.targetLon);
            console.log(`Entfernung zum Zielort berechnet für "${enrichedData.title}": ${enrichedData.distanceKm} km`);
            
            // OSRM Auto-Routing
            try {
              const carRoute = await getOSRMRoute(geo.lat, geo.lon, preferences.targetLat, preferences.targetLon, 'driving');
              if (carRoute) {
                enrichedData.carDistanceKm = carRoute.distanceKm;
                enrichedData.carDurationMin = carRoute.durationMin;
                enrichedData.travelTimeDrivingMin = carRoute.durationMin;
                console.log(`OSRM Auto-Route für "${enrichedData.title}": ${carRoute.distanceKm} km, ${carRoute.durationMin} Min.`);
              }
            } catch (carErr) {
              console.error(`OSRM Auto-Route Fehler für "${enrichedData.title}":`, carErr.message);
            }

            // OSRM Fußweg-Routing
            try {
              const footRoute = await getOSRMRoute(geo.lat, geo.lon, preferences.targetLat, preferences.targetLon, 'foot');
              if (footRoute) {
                enrichedData.footDistanceKm = footRoute.distanceKm;
                enrichedData.footDurationMin = footRoute.durationMin;
                enrichedData.travelTimeFootMin = footRoute.durationMin;
                console.log(`OSRM Fußweg-Route für "${enrichedData.title}": ${footRoute.distanceKm} km, ${footRoute.durationMin} Min.`);
              }
            } catch (footErr) {
              console.error(`OSRM Fußweg-Route Fehler für "${enrichedData.title}":`, footErr.message);
            }

            // OSRM Fahrrad-Routing
            try {
              const bikeRoute = await getOSRMRoute(geo.lat, geo.lon, preferences.targetLat, preferences.targetLon, 'bicycle');
              if (bikeRoute) {
                enrichedData.bikeDistanceKm = bikeRoute.distanceKm;
                enrichedData.bikeDurationMin = bikeRoute.durationMin;
                enrichedData.travelTimeBicycleMin = bikeRoute.durationMin;
                console.log(`OSRM Fahrrad-Route für "${enrichedData.title}": ${bikeRoute.distanceKm} km, ${bikeRoute.durationMin} Min.`);
              }
            } catch (bikeErr) {
              console.error(`OSRM Fahrrad-Route Fehler für "${enrichedData.title}":`, bikeErr.message);
            }
          }

          // Entfernung und Reisezeiten zu allen Zielen im targetAddresses-Array berechnen
          if (preferences.targetAddresses && Array.isArray(preferences.targetAddresses)) {
            const travelTimes = [];
            for (const target of preferences.targetAddresses) {
              if (target.address && target.lat !== null && target.lon !== null && target.lat !== undefined) {
                const dist = calculateDistance(geo.lat, geo.lon, target.lat, target.lon);
                const travelInfo = {
                  label: target.label || 'Unbenannt',
                  address: target.address,
                  lat: target.lat,
                  lon: target.lon,
                  distanceKm: dist
                };

                // OSRM Auto-Routing
                try {
                  const carRoute = await getOSRMRoute(geo.lat, geo.lon, target.lat, target.lon, 'driving');
                  if (carRoute) {
                    travelInfo.durationDriving = carRoute.durationMin;
                    travelInfo.distanceDrivingKm = carRoute.distanceKm;
                  }
                } catch (carErr) {
                  console.error(`OSRM Auto-Route Fehler für "${enrichedData.title}" zu "${target.label}":`, carErr.message);
                }

                // OSRM Fußweg-Routing
                try {
                  const footRoute = await getOSRMRoute(geo.lat, geo.lon, target.lat, target.lon, 'foot');
                  if (footRoute) {
                    travelInfo.durationFoot = footRoute.durationMin;
                    travelInfo.distanceFootKm = footRoute.distanceKm;
                  }
                } catch (footErr) {
                  console.error(`OSRM Fußweg-Route Fehler für "${enrichedData.title}" zu "${target.label}":`, footErr.message);
                }

                // OSRM Fahrrad-Routing
                try {
                  const bikeRoute = await getOSRMRoute(geo.lat, geo.lon, target.lat, target.lon, 'bicycle');
                  if (bikeRoute) {
                    travelInfo.durationBicycle = bikeRoute.durationMin;
                    travelInfo.distanceBicycleKm = bikeRoute.distanceKm;
                  }
                } catch (bikeErr) {
                  console.error(`OSRM Fahrrad-Route Fehler für "${enrichedData.title}" zu "${target.label}":`, bikeErr.message);
                }

                // db-transport.rest Transit-Routing
                try {
                  const transitRoute = await getTransitRoute(geo.lat, geo.lon, target.lat, target.lon);
                  if (transitRoute) {
                    travelInfo.durationTransit = transitRoute.durationMin;
                  }
                } catch (transitErr) {
                  console.error(`Transit Route Fehler für "${enrichedData.title}" zu "${target.label}":`, transitErr.message);
                }

                travelTimes.push(travelInfo);
              }
            }
            enrichedData.targetTravelTimes = travelTimes;
          }
          
          // Entfernung zur Wunschstadt
          if (preferences.wishCityLat !== null && preferences.wishCityLon !== null && preferences.wishCityLat !== undefined) {
            enrichedData.wishCityDistanceKm = calculateDistance(geo.lat, geo.lon, preferences.wishCityLat, preferences.wishCityLon);
            console.log(`Entfernung zur Wunschstadt berechnet für "${enrichedData.title}": ${enrichedData.wishCityDistanceKm} km`);
          }
          
          // Nahegelegene POIs abrufen
          try {
            const pois = await fetchNearbyPOIs(geo.lat, geo.lon);
            enrichedData.pois = pois;
          } catch (poiErr) {
            console.error(`Fehler beim Abrufen der POIs für "${enrichedData.title}":`, poiErr.message);
            enrichedData.pois = { supermarkets: [], publicTransit: [], parks: [] };
          }
        }
      } catch (geoErr) {
        console.error(`Fehler beim Geocodieren der Wohnung für Entfernung:`, geoErr.message);
      }
    }

    // Fallback Geofilter falls Geocoding fehlgeschlagen ist (z.B. durch Rate Limiting)
    if (!geocodingSuccessful && enrichedData.location) {
      const locationLower = enrichedData.location.toLowerCase();
      const isLocal = /bonn|k[öo]ln/i.test(locationLower) || /\b5[0-3]\d{3}\b/.test(locationLower);
      if (!isLocal) {
        console.log(`[Fallback-Geofilter] Wohnung "${enrichedData.title}" liegt vermutlich außerhalb der Zielregion (Ort: ${enrichedData.location}). Überspringe Gemini-Bewertung.`);
        enrichedData.matchScore = 10;
        enrichedData.matchSummary = `Geografisch unpassend: Die Wohnung befindet sich in ${enrichedData.location}, was außerhalb der Zielregion (Bonn/Köln, PLZ-Bereich 50-53) liegt.`;
        enrichedData.pros = [];
        enrichedData.cons = [`Außerhalb der Zielregion (${enrichedData.location})`];
        enrichedData.coverLetter = '';
        return enrichedData;
      }
    }

    // Bundesland-Filter: Wenn das Bundesland der Wohnung bekannt ist und sich von der Wunschstadt unterscheidet, filtern
    if (preferences.wishCityState && enrichedData.state && enrichedData.state !== preferences.wishCityState) {
      console.log(`[Bundesland-Filter] Wohnung "${enrichedData.title}" liegt in anderem Bundesland (${enrichedData.state} vs ${preferences.wishCityState}). Überspringe Gemini-Bewertung.`);
      enrichedData.matchScore = 10;
      enrichedData.matchSummary = `Geografisch unpassend: Die Wohnung befindet sich im Bundesland ${enrichedData.state}, Ihre Wunschstadt liegt jedoch in ${preferences.wishCityState}.`;
      enrichedData.pros = [];
      enrichedData.cons = [`Anderes Bundesland (${enrichedData.state})`];
      enrichedData.coverLetter = '';
      return enrichedData;
    }

    // Schneller Vorab-Filter: Wenn die Wohnung zu weit von der Wunschstadt entfernt ist,
    // überspringen wir die teure Gemini-Bewertung komplett und setzen direkt einen niedrigen Score.
    if (preferences.wishCityLat !== null && preferences.wishCityLon !== null && preferences.wishCityLat !== undefined && 
        enrichedData.wishCityDistanceKm !== undefined && enrichedData.wishCityDistanceKm !== null) {
      const radius = preferences.wishCityRadiusKm || 15;
      if (enrichedData.wishCityDistanceKm > radius) {
        console.log(`[Vorab-Filter] Wohnung "${enrichedData.title}" liegt außerhalb des Radius (${enrichedData.wishCityDistanceKm} km > ${radius} km). Überspringe Gemini-Bewertung.`);
        enrichedData.matchScore = 10;
        enrichedData.matchSummary = `Geografisch unpassend: Die Wohnung befindet sich ${enrichedData.wishCityDistanceKm} km entfernt von Ihrer Wunschstadt und überschreitet den Suchradius von ${radius} km.`;
        enrichedData.pros = [];
        enrichedData.cons = [`Außerhalb des Suchradius um die Wunschstadt (${enrichedData.wishCityDistanceKm} km)`];
        enrichedData.coverLetter = '';
        return enrichedData;
      }
    }

    console.log(`Bewerte Wohnung "${enrichedData.title}" mit Gemini...`);
    const evaluation = await evaluateListing(enrichedData, preferences, apiKey);
    
    enrichedData.matchScore = evaluation.matchScore;
    enrichedData.matchSummary = evaluation.matchSummary;
    enrichedData.pros = evaluation.pros;
    enrichedData.cons = evaluation.cons;

    // Optionaler Criteria-Breakdown und Kontaktinfos
    if (evaluation.criteriaBreakdown) enrichedData.criteriaBreakdown = evaluation.criteriaBreakdown;
    if (evaluation.contactEmail) enrichedData.contactEmail = evaluation.contactEmail;
    if (evaluation.contactPhone) enrichedData.contactPhone = evaluation.contactPhone;

    // Anschreiben direkt generieren, falls gute Übereinstimmung (z.B. Score >= 60)
    if (enrichedData.matchScore >= 60) {
      console.log(`Generiere Anschreiben für "${enrichedData.title}"...`);
      enrichedData.coverLetter = await generateCoverLetter(enrichedData, preferences, apiKey);
    } else {
      enrichedData.coverLetter = '';
    }

    // Autopilot Trigger-Status setzen
    if (preferences.autopilotEnabled && enrichedData.matchScore >= (preferences.autopilotMinScore || 85)) {
      enrichedData.autopilotReady = true;
      enrichedData.autopilotStatus = 'pending_confirmation'; // Ausgeschickt oder wartet auf Telegram-Bestätigung
    }

    // Preis-Historie initialisieren
    if (!enrichedData.priceHistory) {
      enrichedData.priceHistory = [{
        date: new Date().toISOString().split('T')[0],
        priceWarm: enrichedData.priceWarm,
        priceKalt: enrichedData.priceKalt
      }];
    }

    return enrichedData;
  } catch (error) {
    console.error(`Fehler bei der AI-Bewertung von "${listing.title}":`, error.message);
    listing.matchScore = 50;
    if (error.message.includes('429') || error.message.toLowerCase().includes('quota exceeded') || error.message.toLowerCase().includes('quota')) {
      listing.matchSummary = 'Gemini API-Limit erreicht (429 Quota Exceeded). Die freie API-Nutzung ist auf 20 Anfragen pro Tag begrenzt. Bitte trage einen anderen API-Key ein oder versuche es später noch einmal.';
    } else {
      listing.matchSummary = `Fehler bei AI-Bewertung: ${error.message}`;
    }
    listing.pros = [];
    listing.cons = [];
    listing.coverLetter = '';
    return listing;
  }
}

/**
 * Lädt die Detailseite einer Wohnung (Volltext & Bilder) und führt eine neue Bewertung durch.
 */
export async function enrichListingDetails(listing, preferences) {
  if (!listing.url) {
    return listing;
  }

  console.log(`[Auto-Enrich] Lade Detaildaten für Wohnung: "${listing.title}" (${listing.url})...`);
  try {
    const html = await fetchPageContent(listing.url);
    const $ = cheerio.load(html);

    // 1. Vollständigen Beschreibungstext extrahieren
    let fullDescription = '';
    const extractedDetails = [];

    if (listing.portal === 'kleinanzeigen') {
      fullDescription = $('#viewad-description-text').text().trim();
      
      $('#viewad-details li, .addetails-list li, .ad-details-list li').each((i, el) => {
        const text = $(el).text().trim().replace(/\s+/g, ' ');
        if (text && !extractedDetails.includes(text)) {
          extractedDetails.push(text);
        }
      });
    } else if (listing.portal === 'immowelt') {
      fullDescription = $('div[class*="description"], p[class*="description"], div[class*="css-1h9yrmn"]').text().trim();
      if (!fullDescription) {
        let maxText = '';
        $('div, section').each((i, el) => {
          const t = $(el).text().trim();
          if (t.length > maxText.length && t.length < 5000 && !$(el).find('div').length) {
            maxText = t;
          }
        });
        fullDescription = maxText;
      }

      $('ul[class*="equipment"] li, div[class*="equipment"] span, section[class*="features"] li, .equipment-list li, .features-list li, div[class*="Equipment"] li').each((i, el) => {
        const text = $(el).text().trim().replace(/\s+/g, ' ');
        if (text && text.length < 100 && !extractedDetails.includes(text)) {
          extractedDetails.push(text);
        }
      });
    } else if (listing.portal === 'ohne-makler' || listing.url.includes('ohne-makler')) {
      $('table.table-striped td, .details-table td, ul.features li').each((i, el) => {
        const text = $(el).text().trim().replace(/\s+/g, ' ');
        if (text && text.length < 100 && !extractedDetails.includes(text)) {
          extractedDetails.push(text);
        }
      });
    }

    if (!fullDescription) {
      $('script, style, nav, footer, header').remove();
      fullDescription = $('body').text().replace(/\s+/g, ' ').trim();
    }

    if (extractedDetails.length > 0) {
      const detailsBlock = `\n\n### Zusätzliche Ausstattungsmerkmale & Details:\n- ` + extractedDetails.join('\n- ');
      if (!fullDescription.includes(detailsBlock)) {
        fullDescription += detailsBlock;
      }
    }

    if (fullDescription && fullDescription.length > 50) {
      listing.description = fullDescription;
    }

    // 2. Bilder extrahieren
    const images = [];
    if (listing.images && listing.images.length > 0) {
      images.push(...listing.images);
    }

    $('img').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      if (src) {
        let absSrc = src;
        if (src.startsWith('//')) absSrc = 'https:' + src;
        else if (src.startsWith('/')) {
          if (listing.portal === 'kleinanzeigen') absSrc = 'https://www.kleinanzeigen.de' + src;
          else if (listing.portal === 'immowelt') absSrc = 'https://www.immowelt.de' + src;
        }

        if (listing.portal === 'kleinanzeigen' && (absSrc.includes('i.ebayimg.com') || absSrc.includes('kleinanzeigen.de/s-moebel-wohnaccessoires/'))) {
          if (!images.includes(absSrc) && !absSrc.includes('avatar') && !absSrc.includes('logo')) {
            images.push(absSrc);
          }
        } else if (listing.portal === 'immowelt' && (absSrc.includes('mms.immowelt.de') || absSrc.includes('pictures.immowelt.de'))) {
          if (!images.includes(absSrc) && !absSrc.includes('avatar') && !absSrc.includes('logo')) {
            images.push(absSrc);
          }
        }
      }
    });

    if (images.length > 0) {
      listing.images = Array.from(new Set(images)).slice(0, 15);
    }

    listing.enriched = true;

    // 3. Neu bewerten mit den neuen Detaildaten (erzwungen!)
    const evaluated = await processAndEvaluateListing(listing, preferences, true);
    return evaluated;
  } catch (err) {
    console.error(`[Auto-Enrich] Fehler beim Laden der Detailseite:`, err.message);
    // Rückgabe der nicht enriched Daten im Fehlerfall
    return listing;
  }
}
