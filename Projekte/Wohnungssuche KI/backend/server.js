import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';
import axios from 'axios';
import * as cheerio from 'cheerio';
import multer from 'multer';
import fs from 'fs';
import nodemailer from 'nodemailer';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = class DOMMatrix {};
}

const pdfParse = require('pdf-parse');

import { db, profileStorage } from './db.js';
import { scrapeKleinanzeigen, scrapeImmowelt } from './scraper.js';
import { scrapeOhneMakler } from './scraper-ohnmakler.js';
import { scrapeWgGesucht } from './scraper-wggesucht.js';
import { scrapeImmoscout24 } from './scraper-immoscout24.js';
import { scrapeImmonet } from './scraper-immonet.js';
import { parseListingFromText, evaluateListing, generateCoverLetter, learnFromRejection, analyzeLeaseText, chatAboutListing, analyzeListingImages, parseViewingAppointmentFromEmail, generateLeaseNegotiationLetter, analyzeSalarySlip, parseViewingVoiceNote, generateLeaseTerminationLetter } from './ai-analyzer.js';
import { encryptText, decryptText } from './crypto-util.js';
import { fetchLiveDepartures } from './transit-fetcher.js';
import { generateRssFeed } from './rss-generator.js';
import { fetchPageContent } from './browser.js';
import { checkImapEmails } from './imap-scanner.js';
import { geocodeAddress, calculateDistance, getOSRMRoute } from './geocoder.js';
import { sendTelegramNotification, startTelegramUpdatesLoop, initVapidKeys } from './notifier.js';
import authRouter, { verifyToken } from './auth.js';
import { scanStatus, updateScanStatus } from './scan-status.js';
import { processAndEvaluateListing, enrichListingDetails } from './listing-processor.js';
import { PDFDocument, rgb } from 'pdf-lib';
import { generatePortfolioBuffer } from './pdf-generator.js';
import { generateSelfDisclosurePdf } from './self-disclosure-template.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Profil-Middleware: Extrahiere x-profile-id Header
app.use((req, res, next) => {
  const profileHeader = req.headers['x-profile-id'];
  req.profileId = profileHeader ? parseInt(profileHeader, 10) : 1;
  if (isNaN(req.profileId)) req.profileId = 1;
  profileStorage.run(req.profileId, () => next());
});

app.use('/auth', authRouter);

// Upload-Verzeichnis für Dokumente
const UPLOADS_DIR = path.join(__dirname, 'data', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Statisches Verzeichnis für hochgeladene Dokumente
app.use('/uploads', express.static(UPLOADS_DIR));

// Aktiver Cron-Job Referenz
let activeCronJob = null;

// ==========================================
// HILFSFUNKTIONEN FÜR SCAN & AI BEWERTUNG
// ==========================================

function getLevenshteinDistance(a, b) {
  const tmp = [];
  let i, j, alen = a.length, blen = b.length;
  if (alen === 0) return blen;
  if (blen === 0) return alen;
  for (i = 0; i <= alen; i++) tmp[i] = [i];
  for (j = 0; j <= blen; j++) tmp[0][j] = j;
  for (i = 1; i <= alen; i++) {
    for (j = 1; j <= blen; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[alen][blen];
}

function getTitleSimilarity(title1, title2) {
  const t1 = title1.toLowerCase().trim();
  const t2 = title2.toLowerCase().trim();
  if (t1 === t2) return 1.0;
  const maxLen = Math.max(t1.length, t2.length);
  if (maxLen === 0) return 1.0;
  const dist = getLevenshteinDistance(t1, t2);
  return 1.0 - dist / maxLen;
}

function normalizeUrl(url) {
  if (!url) return '';
  try {
    let clean = url.split('?')[0].split('#')[0];
    if (clean.endsWith('/')) {
      clean = clean.slice(0, -1);
    }
    return clean.toLowerCase().trim();
  } catch (e) {
    return url.toLowerCase().trim();
  }
}

function isDuplicate(newListing, existingListings) {
  const newUrlNorm = normalizeUrl(newListing.url);
  
  for (const existing of existingListings) {
    // 1. Exakter URL-Match
    if (newListing.url && existing.url && newListing.url === existing.url) {
      return true;
    }
    
    // 2. Normalisierter URL-Match
    if (newUrlNorm && existing.url && newUrlNorm === normalizeUrl(existing.url)) {
      return true;
    }
    
    // 3. Starke Fuzzy-Übereinstimmung: Preis ±5% + qm ±3qm + Ort-Match
    if (newListing.priceWarm > 0 && existing.priceWarm > 0 &&
        newListing.sqm > 0 && existing.sqm > 0) {
      const priceDiffRatio = Math.abs(newListing.priceWarm - existing.priceWarm) / Math.max(newListing.priceWarm, existing.priceWarm);
      const sqmDiff = Math.abs(newListing.sqm - existing.sqm);
      
      if (priceDiffRatio <= 0.05 && sqmDiff <= 3) {
        const getZipOrCleanLoc = (loc) => {
          if (!loc) return '';
          const zipMatch = loc.match(/\b\d{5}\b/);
          if (zipMatch) return zipMatch[0];
          return loc.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
        };
        
        const locNew = getZipOrCleanLoc(newListing.location);
        const locExisting = getZipOrCleanLoc(existing.location);
        
        if (locNew && locExisting && locNew === locExisting) {
          return true;
        }
      }
    }
    
    // 4. Titel-Similarity: > 85% ähnlich AND gleicher Preis
    if (newListing.priceWarm > 0 && newListing.priceWarm === existing.priceWarm &&
        newListing.title && existing.title) {
      const sim = getTitleSimilarity(newListing.title, existing.title);
      if (sim > 0.85) {
        return true;
      }
    }
  }
  return false;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Führt den Suchlauf für alle Städte in den Präferenzen durch
async function runScan(profileId = 1) {
  console.log(`--- Automatischer Wohnungssuche-Scan gestartet (Profil-ID: ${profileId}) ---`);
  
  updateScanStatus({
    active: true,
    portal: 'Initialisierung',
    city: '',
    progress: 0,
    total: 0,
    message: 'Suchlauf wird initialisiert...'
  });

  const preferences = db.getPreferences(profileId);
  const existingListings = db.getListings(profileId);
  let newCount = 0;

  // 1. E-Mail-Suchlauf über IMAP durchführen (falls aktiviert)
  if (preferences.imapEnabled) {
    try {
      console.log('Starte IMAP E-Mail-Suchlauf...');
      updateScanStatus({
        portal: 'E-Mail-Suchlauf',
        message: 'Scanne Postfach nach Suchagenten...'
      });
      const imapResult = await checkImapEmails(profileId);
      if (imapResult && imapResult.success) {
        newCount += imapResult.newCount || 0;
      }
    } catch (e) {
      console.error('Fehler beim automatischen IMAP E-Mail-Suchlauf:', e.message);
    }
  }

  // 2. Suche auf Portalen durchführen
  const searchCities = [];
  if (preferences.wishCity && preferences.wishCity.trim().length > 0) {
    searchCities.push(preferences.wishCity.trim());
  } else if (preferences.cities && preferences.cities.length > 0) {
    searchCities.push(...preferences.cities);
  }

  const portalKeyMap = {
    'kleinanzeigen': 'kleinanzeigen',
    'immowelt': 'immowelt',
    'ohne-makler': 'ohneMakler',
    'wg-gesucht': 'wgGesucht',
    'immoscout24': 'immoscout24',
    'immonet': 'immonet'
  };

  const isPortalEnabled = (portalName) => {
    const settingsKey = portalKeyMap[portalName];
    if (!settingsKey) return true;
    return preferences.enabledPortals?.[settingsKey] !== false;
  };

  let portalCounts = {
    kleinanzeigen: 0,
    immowelt: 0,
    ohneMakler: 0,
    wgGesucht: 0,
    immoscout24: 0,
    immonet: 0
  };

  const options = {
    searchRent: preferences.searchRent !== false,
    searchBuy: !!preferences.searchBuy,
    searchSwap: !!preferences.searchSwap
  };

  if (searchCities.length > 0) {
    for (const city of searchCities) {
      // Geocodiere den Suchort, um saubere Namen für Portale zu erhalten
      let searchCityClean = city;
      
      updateScanStatus({
        portal: 'Geocoding',
        city: city,
        message: `Geocodiere Suchort: "${city}"...`
      });

      try {
        const geo = await geocodeAddress(city);
        if (geo && geo.city) {
          searchCityClean = geo.city;
          console.log(`Suchort "${city}" geocodiert zu sauberer Stadt: "${searchCityClean}" (Bundesland: "${geo.state}")`);
        }
      } catch (err) {
        console.error(`Fehler beim Geocodieren des Suchorts "${city}":`, err.message);
      }

      console.log(`Starte Multi-Portal-Suchlauf für "${searchCityClean}"...`);
      
      // Kleinanzeigen Scraping (mit Umkreis-Filter direkt im Portal)
      let kleinanzeigenListings = [];
      if (isPortalEnabled('kleinanzeigen')) {
        try {
          updateScanStatus({
            portal: 'Kleinanzeigen',
            city: searchCityClean,
            message: `Scrape Angebote von Kleinanzeigen...`
          });
          const radiusKm = preferences.wishCityRadiusKm || 10;
          kleinanzeigenListings = await scrapeKleinanzeigen(searchCityClean, preferences.maxRentWarm, radiusKm, options);
        } catch (err) {
          console.error(`Fehler beim Scrapen von Kleinanzeigen für "${searchCityClean}":`, err.message);
        }
      }

      // Immowelt Scraping
      let immoweltListings = [];
      if (isPortalEnabled('immowelt')) {
        try {
          updateScanStatus({
            portal: 'Immowelt',
            city: searchCityClean,
            message: `Scrape Angebote von Immowelt...`
          });
          immoweltListings = await scrapeImmowelt(searchCityClean, preferences.maxRentWarm, options);
        } catch (err) {
          console.error(`Fehler beim Scrapen von Immowelt für "${searchCityClean}":`, err.message);
        }
      }

      // ohne-makler.net Scraping
      let ohneMaklerListings = [];
      if (isPortalEnabled('ohne-makler')) {
        try {
          updateScanStatus({
            portal: 'Ohne Makler',
            city: searchCityClean,
            message: `Scrape Angebote von ohne-makler.net...`
          });
          ohneMaklerListings = await scrapeOhneMakler(searchCityClean, preferences.maxRentWarm, options);
        } catch (err) {
          console.error(`Fehler beim Scrapen von ohne-makler.net für "${searchCityClean}":`, err.message);
        }
      }

      // WG-Gesucht Scraping
      let wgGesuchtListings = [];
      if (isPortalEnabled('wg-gesucht')) {
        try {
          updateScanStatus({
            portal: 'WG-Gesucht',
            city: searchCityClean,
            message: `Scrape Angebote von WG-Gesucht...`
          });
          wgGesuchtListings = await scrapeWgGesucht(searchCityClean, preferences.maxRentWarm, options);
        } catch (err) {
          console.error(`Fehler beim Scrapen von WG-Gesucht für "${searchCityClean}":`, err.message);
        }
      }

      // ImmoScout24 Scraping
      let immoscout24Listings = [];
      if (isPortalEnabled('immoscout24')) {
        try {
          updateScanStatus({
            portal: 'ImmoScout24',
            city: searchCityClean,
            message: `Scrape Angebote von ImmoScout24...`
          });
          immoscout24Listings = await scrapeImmoscout24(searchCityClean, preferences.maxRentWarm, options);
        } catch (err) {
          console.error(`Fehler beim Scrapen von ImmoScout24 für "${searchCityClean}":`, err.message);
        }
      }

      // Immonet Scraping
      let immonetListings = [];
      if (isPortalEnabled('immonet')) {
        try {
          updateScanStatus({
            portal: 'Immonet',
            city: searchCityClean,
            message: `Scrape Angebote von Immonet...`
          });
          immonetListings = await scrapeImmonet(searchCityClean, preferences.maxRentWarm, options);
        } catch (err) {
          console.error(`Fehler beim Scrapen von Immonet für "${searchCityClean}":`, err.message);
        }
      }

      const combinedListings = [
        ...kleinanzeigenListings,
        ...immoweltListings,
        ...ohneMaklerListings,
        ...wgGesuchtListings,
        ...immoscout24Listings,
        ...immonetListings
      ];
      const totalCombined = combinedListings.length;
      let currentIndex = 0;

      for (const listing of combinedListings) {
        currentIndex++;
        
        // Dubletten-Prüfung
        if (isDuplicate(listing, existingListings)) {
          continue;
        }

        updateScanStatus({
          portal: listing.portal,
          city: searchCityClean,
          progress: currentIndex,
          total: totalCombined,
          message: `Bewerte Inserat ${currentIndex} von ${totalCombined}: "${listing.title}"...`
        });

        // Bewerten und speichern
        let evaluated = await processAndEvaluateListing(listing, preferences);
        if (evaluated.matchScore === 10 && evaluated.matchSummary && evaluated.matchSummary.startsWith('Geografisch unpassend')) {
          console.log(`[Filter] Überspringe Speichern der Wohnung "${evaluated.title}", da sie geografisch unpassend ist.`);
          continue;
        }

        // Auto-enrichment if matching score is good (>= 70) and listing has URL
        if (evaluated.matchScore >= 70 && evaluated.url && !evaluated.enriched) {
          console.log(`[Auto-Enrich] Promising listing found: "${evaluated.title}" (Score: ${evaluated.matchScore}). Enriching details...`);
          evaluated = await enrichListingDetails(evaluated, preferences);
        }

        db.saveListing(evaluated, profileId);
        existingListings.push(evaluated);

        // Telegram-Benachrichtigung senden
        try {
          await sendTelegramNotification(preferences, evaluated);
        } catch (tgErr) {
          console.error('Fehler bei Telegram Alert:', tgErr.message);
        }

        newCount++;

        // Track stats by portal
        const key = portalKeyMap[evaluated.portal];
        if (key) {
          portalCounts[key] = (portalCounts[key] || 0) + 1;
        }

        // Schlafzeit, um Gemini API-Rate-Limits (429) bei freier Nutzung zu vermeiden
        // falls tatsächlich eine AI-Bewertung durchgeführt wurde
        if (evaluated.matchScore !== 10 || !evaluated.matchSummary.startsWith('Geografisch unpassend')) {
          console.log(`Warte 4.5 Sekunden zur Ratenbegrenzung der Gemini API...`);
          await sleep(4500);
        }
      }
    }
  } else {
    console.log('Keine Wunschstadt oder Suchstädte hinterlegt. Überspringe Scraper-Suchlauf.');
  }

  // Scan-Zeitpunkt speichern
  const lastScanTime = new Date().toISOString();
  db.savePreferences({ lastScanTime }, profileId);

  // Scan-Statistik speichern
  db.saveScanResult({
    timestamp: lastScanTime,
    newCount,
    portalCounts
  }, profileId);

  console.log(`--- Scan beendet. ${newCount} neue Wohnungen gefunden ---`);
  
  updateScanStatus({
    active: false,
    portal: '',
    city: '',
    progress: 0,
    total: 0,
    message: `Suchlauf beendet. ${newCount} neue Angebote gefunden.`
  });

  return { success: true, newCount, lastScanTime };
}

// Konfiguriert den Scheduler basierend auf den Einstellungen des Nutzers
function setupScheduler() {
  if (activeCronJob) {
    activeCronJob.stop();
    activeCronJob = null;
  }

  const preferences = db.getPreferences(1);
  const hours = preferences.scanIntervalHours || 4;
  
  const cronExpression = `0 */${hours} * * *`;
  
  console.log(`Richte Scheduler ein: Suche alle ${hours} Stunden (${cronExpression}) für alle Profile`);
  
  activeCronJob = cron.schedule(cronExpression, async () => {
    try {
      const profiles = db.getProfiles();
      for (const p of profiles) {
        console.log(`Starte geplanten Suchlauf für Profil "${p.name}" (ID: ${p.id})...`);
        await runScan(p.id);
      }
    } catch (e) {
      console.error('Fehler während des geplanten Scans:', e);
    }
  });
}

// ==========================================
// API ENDPUNKTE
// ==========================================

// Profile abrufen
app.get('/api/profiles', (req, res) => {
  res.json(db.getProfiles());
});

// Profil erstellen
app.post('/api/profiles', (req, res) => {
  const { name } = req.body;
  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: 'Name ist erforderlich' });
  }
  const profile = db.createProfile(name);
  res.json(profile);
});

// Profil löschen
app.delete('/api/profiles/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.deleteProfile(parseInt(id, 10));
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Suchkriterien abfragen
app.get('/api/preferences', (req, res) => {
  res.json(db.getPreferences(req.profileId));
});

// Scan-Statistiken abfragen
app.get('/api/stats', (req, res) => {
  const history = db.getScanHistory(req.profileId);
  const listings = db.getListings(req.profileId);
  
  const portalTotals = {
    kleinanzeigen: 0,
    immowelt: 0,
    ohneMakler: 0,
    wgGesucht: 0,
    immoscout24: 0,
    immonet: 0,
    sonstige: 0
  };
  
  listings.forEach(l => {
    let portal = l.portal || 'sonstige';
    if (portal === 'ohne-makler') portal = 'ohneMakler';
    if (portal === 'wg-gesucht') portal = 'wgGesucht';
    if (portalTotals[portal] !== undefined) {
      portalTotals[portal]++;
    } else {
      portalTotals.sonstige++;
    }
  });
  
  res.json({
    scanHistory: history,
    totalListings: listings.length,
    portalTotals,
    lastScanTime: db.getPreferences(req.profileId).lastScanTime
  });
});

// Map HTML Template ausgeben
app.get('/api/map-html', (req, res) => {
  res.sendFile(path.join(__dirname, 'data', 'map.html'));
});

// Suchkriterien speichern
app.post('/api/preferences', async (req, res) => {
  const updated = db.savePreferences(req.body, req.profileId);
  
  // Geocodiere die Arbeitsplatz/Ziel-Adresse falls vorhanden
  if (updated.targetAddress && updated.targetAddress.trim().length > 0) {
    try {
      const geo = await geocodeAddress(updated.targetAddress);
      if (geo) {
        db.savePreferences({
          targetLat: geo.lat,
          targetLon: geo.lon
        }, req.profileId);
      }
    } catch (e) {
      console.error('Fehler beim Geocodieren der Zieladresse:', e.message);
    }
  } else {
    // Falls leer, setze Koordinaten zurück
    db.savePreferences({
      targetLat: null,
      targetLon: null
    }, req.profileId);
  }

  // Geocodiere die Wunschstadt falls vorhanden
  if (updated.wishCity && updated.wishCity.trim().length > 0) {
    try {
      const geo = await geocodeAddress(updated.wishCity);
      if (geo) {
        db.savePreferences({
          wishCityLat: geo.lat,
          wishCityLon: geo.lon,
          wishCityState: geo.state || null
        }, req.profileId);
      }
    } catch (e) {
      console.error('Fehler beim Geocodieren der Wunschstadt:', e.message);
    }
  } else {
    db.savePreferences({
      wishCityLat: null,
      wishCityLon: null,
      wishCityState: null
    }, req.profileId);
  }

  // Geocodiere das targetAddresses Array falls vorhanden
  if (req.body.targetAddresses && Array.isArray(req.body.targetAddresses)) {
    const geocodedAddresses = [];
    for (const target of req.body.targetAddresses) {
      if (target.address && target.address.trim().length > 0) {
        if (target.lat && target.lon) {
          geocodedAddresses.push(target);
        } else {
          try {
            const geo = await geocodeAddress(target.address);
            if (geo) {
              geocodedAddresses.push({
                ...target,
                lat: geo.lat,
                lon: geo.lon
              });
            } else {
              geocodedAddresses.push(target);
            }
          } catch (e) {
            console.error(`Fehler beim Geocodieren des Zielorts "${target.label || target.address}":`, e.message);
            geocodedAddresses.push(target);
          }
        }
      }
    }
    db.savePreferences({ targetAddresses: geocodedAddresses }, req.profileId);
  }
  
  // Bei Änderung des Intervalls Scheduler neu starten
  setupScheduler();
  res.json(db.getPreferences(req.profileId));
});

// Alle Wohnungen abrufen
app.get('/api/listings', (req, res) => {
  const listings = db.getListings(req.profileId);
  // Sortiere nach Match-Score absteigend (beste zuerst), neue als Fallback
  listings.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  res.json(listings);
});

// Einzelne Wohnung abrufen
app.get('/api/listings/:id', (req, res) => {
  const listing = db.getListingById(req.params.id, req.profileId);
  if (!listing) {
    return res.status(404).json({ error: 'Wohnung nicht gefunden' });
  }
  res.json(listing);
});

// Status einer Wohnung aktualisieren
app.post('/api/listings/:id/status', verifyToken, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const listing = db.getListingById(id);
  if (!listing) {
    return res.status(404).json({ error: 'Wohnung nicht gefunden' });
  }

  listing.status = status;
  db.saveListing(listing);
  res.json(listing);
});

// Chat über eine bestimmte Wohnung
app.post('/api/listings/:id/chat', async (req, res) => {
  const { id } = req.params;
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Ungültiges Nachrichten-Format.' });
  }

  const listing = db.getListingById(id);
  if (!listing) {
    return res.status(404).json({ error: 'Wohnung nicht gefunden' });
  }

  const preferences = db.getPreferences();
  if (!preferences.geminiApiKey) {
    return res.status(400).json({ error: 'Bitte trage zuerst deinen Gemini API-Key im Suchprofil ein.' });
  }

  try {
    const reply = await chatAboutListing(listing, messages, preferences, preferences.geminiApiKey);
    res.json({ reply });
  } catch (error) {
    console.error('Fehler im Wohnungs-Chat-Endpoint:', error);
    res.status(500).json({ error: error.message || 'Fehler bei der Kommunikation mit Gemini.' });
  }
});

// Partner-Votum einer Wohnung aktualisieren
app.post('/api/listings/:id/vote', (req, res) => {
  const { id } = req.params;
  const { partner, vote } = req.body; // partner: 'partnerA' | 'partnerB', vote: 'like' | 'dislike' | null

  if (partner !== 'partnerA' && partner !== 'partnerB') {
    return res.status(400).json({ error: 'Ungültiger Partner-Identifier.' });
  }

  const listing = db.getListingById(id);
  if (!listing) {
    return res.status(404).json({ error: 'Wohnung nicht gefunden' });
  }

  if (!listing.partnerVotes) {
    listing.partnerVotes = { partnerA: null, partnerB: null };
  }

  listing.partnerVotes[partner] = vote;
  db.saveListing(listing);
  res.json(listing);
});

// Bilder einer Wohnung visuell mit Gemini analysieren (Phase 2 - Multimodale Analyse)
app.post('/api/listings/:id/analyze-images', async (req, res) => {
  const { id } = req.params;
  const listing = db.getListingById(id);
  if (!listing) return res.status(404).json({ error: 'Wohnung nicht gefunden' });

  const preferences = db.getPreferences();
  if (!preferences.geminiApiKey) {
    return res.status(400).json({ error: 'Bitte trage zuerst deinen Gemini API-Key im Suchprofil ein.' });
  }

  const images = listing.images || [];
  if (images.length === 0) {
    return res.status(400).json({ error: 'Diese Wohnung hat keine Bilder für die Analyse.' });
  }

  try {
    console.log(`[Bildanalyse] Starte visuelle Analyse für "${listing.title}" (${images.length} Bilder)...`);
    const imageAnalysis = await analyzeListingImages(images, preferences.geminiApiKey);
    if (imageAnalysis) {
      listing.imageAnalysis = imageAnalysis;
      db.saveListing(listing);
      console.log(`[Bildanalyse] Ergebnis für "${listing.title}": ${imageAnalysis.overallImpression} (Zustand: ${imageAnalysis.conditionScore}%)`);
    }
    res.json({ imageAnalysis, listing });
  } catch (error) {
    console.error('[Bildanalyse] Fehler:', error);
    res.status(500).json({ error: error.message });
  }
});

// Besichtigungstermin aktualisieren
app.post('/api/listings/:id/viewing', (req, res) => {
  const { id } = req.params;
  const { viewingDate, viewingNotes } = req.body;

  const listing = db.getListingById(id);
  if (!listing) {
    return res.status(404).json({ error: 'Wohnung nicht gefunden' });
  }

  listing.viewingDate = viewingDate;
  listing.viewingNotes = viewingNotes;
  db.saveListing(listing);
  res.json(listing);
});

// Neues Anschreiben generieren oder anpassen
app.post('/api/listings/:id/generate-letter', verifyToken, async (req, res) => {
  const { id } = req.params;
  const preferences = db.getPreferences();
  
  const listing = db.getListingById(id);
  if (!listing) {
    return res.status(404).json({ error: 'Wohnung nicht gefunden' });
  }

  if (!preferences.geminiApiKey) {
    return res.status(400).json({ error: 'Bitte trage zuerst deinen Gemini API-Key im Suchprofil ein.' });
  }

  try {
    const letter = await generateCoverLetter(listing, preferences, preferences.geminiApiKey);
    listing.coverLetter = letter;
    db.saveListing(listing);
    res.json({ coverLetter: letter });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Funktion für die gesammelte Neu-Bewertung aller Angebote im Hintergrund
async function runBulkReevaluation() {
  console.log('--- Bulk Re-evaluation gestartet ---');
  const preferences = db.getPreferences();
  const listings = db.getListings();
  const total = listings.length;

  updateScanStatus({
    active: true,
    portal: 'Re-Evaluation',
    city: 'Alle Inserate',
    progress: 0,
    total: total,
    message: 'Neu-Bewertung aller Angebote wird gestartet...'
  });

  let index = 0;
  for (const listing of listings) {
    index++;
    updateScanStatus({
      active: true,
      portal: 'Re-Evaluation',
      city: 'Alle Inserate',
      progress: index,
      total: total,
      message: `Bewerte Inserat ${index} von ${total}: "${listing.title}"...`
    });

    try {
      console.log(`[Bulk Re-Evaluation] Bewerte "${listing.title}" (${index}/${total})...`);
      const evaluated = await processAndEvaluateListing(listing, preferences, true);
      db.saveListing(evaluated);
    } catch (err) {
      console.error(`Fehler bei Re-Evaluation von "${listing.title}":`, err.message);
    }

    // Warte kurz, um Gemini Rate-Limits zu umgehen (nur wenn noch weitere folgen)
    if (index < total) {
      await sleep(4500);
    }
  }

  updateScanStatus({
    active: false,
    portal: '',
    city: '',
    progress: 0,
    total: 0,
    message: `Re-Evaluation beendet. ${total} Angebote aktualisiert.`
  });
  console.log('--- Bulk Re-evaluation beendet ---');
}

// Route: Alle Wohnungen im Hintergrund neu bewerten
app.post('/api/listings/evaluate-all', (req, res) => {
  const preferences = db.getPreferences();
  if (!preferences.geminiApiKey) {
    return res.status(400).json({ error: 'Bitte trage zuerst deinen Gemini API-Key im Suchprofil ein.' });
  }

  // Status synchron auf aktiv setzen, um Race-Conditions im Frontend zu vermeiden
  updateScanStatus({
    active: true,
    portal: 'Re-Evaluation',
    city: 'Alle Inserate',
    progress: 0,
    total: db.getListings().length,
    message: 'Neu-Bewertung wird initialisiert...'
  });

  // Im Hintergrund starten
  runBulkReevaluation().catch(err => {
    console.error('Fehler bei Bulk Re-evaluation:', err);
  });

  res.json({ success: true, message: 'Bulk Re-evaluation gestartet.' });
});

// Route: Einzelne Wohnung manuell neu bewerten
app.post('/api/listings/:id/evaluate', async (req, res) => {
  const { id } = req.params;
  const listing = db.getListingById(id);
  
  if (!listing) {
    return res.status(404).json({ error: 'Wohnung nicht gefunden' });
  }

  const preferences = db.getPreferences();
  if (!preferences.geminiApiKey) {
    return res.status(400).json({ error: 'Bitte trage zuerst deinen Gemini API-Key im Suchprofil ein.' });
  }

  try {
    console.log(`Bewerte Wohnung "${listing.title}" manuell neu...`);
    const evaluated = await processAndEvaluateListing(listing, preferences, true);
    db.saveListing(evaluated);
    res.json(evaluated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Detail-Daten einer Wohnung nachladen (Bilder & Volltext)
app.post('/api/listings/:id/enrich', async (req, res) => {
  const { id } = req.params;
  const listing = db.getListingById(id);
  
  if (!listing) {
    return res.status(404).json({ error: 'Wohnung nicht gefunden' });
  }

  const preferences = db.getPreferences();
  try {
    const enriched = await enrichListingDetails(listing, preferences);
    db.saveListing(enriched);
    res.json(enriched);
  } catch (err) {
    console.error(`Fehler beim Nachladen der Detailseite:`, err.message);
    res.status(500).json({ error: `Fehler beim Nachladen: ${err.message}` });
  }
});

// Wohnung manuell über Link importieren
app.post('/api/listings/import-link', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL ist erforderlich' });
  }

  console.log(`Automatischer Import-Versuch für Link: ${url}`);
  const preferences = db.getPreferences();

  try {
    // Versuch, die Seite abzurufen (mit Puppeteer Stealth, um Cloudflare/Akamai zu umgehen)
    const html = await fetchPageContent(url);
    const $ = cheerio.load(html);
    
    // HTML in Text umwandeln, um das LLM nicht mit zu viel Rauschen zu überfordern
    // Wir entfernen Skripte, Styles und Header/Footer grob
    $('script, style, nav, footer, header').remove();
    const cleanText = $('body').text().replace(/\s+/g, ' ').trim();
    
    if (!preferences.geminiApiKey) {
      return res.json({ 
        success: false, 
        fallback: true,
        message: 'Der Link wurde geladen, aber für das Parsing wird ein Gemini API-Key benötigt. Trage den Key im Profil ein.' 
      });
    }

    console.log('Analysiere geladenen HTML-Inhalt mit Gemini...');
    const parsed = await parseListingFromText(cleanText, preferences.geminiApiKey);
    
    const newListing = {
      id: `manual-${Date.now()}`,
      portal: url.includes('immoscout24') ? 'immoscout24' : url.includes('immowelt') ? 'immowelt' : 'sonstige',
      url,
      title: parsed.title || 'Manuell importierte Wohnung',
      priceKalt: parsed.priceKalt || 0,
      priceWarm: parsed.priceWarm || 0,
      sqm: parsed.sqm || 0,
      rooms: parsed.rooms || 0,
      location: parsed.location || 'Unbekannter Ort',
      description: parsed.description || 'Keine Beschreibung extrahiert',
      scrapedAt: new Date().toISOString(),
      manualImport: true,
      status: 'neu'
    };

    const fullyEvaluated = await processAndEvaluateListing(newListing, preferences);
    db.saveListing(fullyEvaluated);
    
    res.json({ success: true, listing: fullyEvaluated });

  } catch (error) {
    console.error('Fehler beim Import-Link:', error.message);
    
    // Fallback an das Frontend senden
    res.json({
      success: false,
      fallback: true,
      message: 'Portal blockiert direkten Zugriff (Cloudflare/Akamai Schutz). Bitte kopiere den Text/Inhalt der Anzeige manuell und füge ihn unten ein.'
    });
  }
});

// Wohnung manuell über Text-Dump importieren
app.post('/api/listings/import-text', async (req, res) => {
  const { rawText, url } = req.body;
  if (!rawText) {
    return res.status(400).json({ error: 'Textinhalt ist erforderlich' });
  }

  const preferences = db.getPreferences();
  if (!preferences.geminiApiKey) {
    return res.status(400).json({ error: 'Bitte trage zuerst deinen Gemini API-Key im Suchprofil ein.' });
  }

  try {
    console.log('Kopierten Anzeigentext mit Gemini parsen...');
    const parsed = await parseListingFromText(rawText, preferences.geminiApiKey);
    
    const newListing = {
      id: `manual-text-${Date.now()}`,
      portal: url && url.includes('immoscout24') ? 'immoscout24' : url && url.includes('immowelt') ? 'immowelt' : 'sonstige',
      url: url || '',
      title: parsed.title || 'Manuell importierte Wohnung',
      priceKalt: parsed.priceKalt || 0,
      priceWarm: parsed.priceWarm || 0,
      sqm: parsed.sqm || 0,
      rooms: parsed.rooms || 0,
      location: parsed.location || 'Unbekannter Ort',
      description: parsed.description || 'Keine Beschreibung',
      scrapedAt: new Date().toISOString(),
      manualImport: true,
      status: 'neu'
    };

    const fullyEvaluated = await processAndEvaluateListing(newListing, preferences);
    db.saveListing(fullyEvaluated);
    
    res.json({ success: true, listing: fullyEvaluated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Scan-Status abfragen
app.get('/api/scan/status', (req, res) => {
  res.json(scanStatus);
});

// Manueller Scan-Trigger über die UI
app.post('/api/scan', async (req, res) => {
  try {
    const result = await runScan();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Einzelne Wohnung löschen
app.delete('/api/listings/:id', async (req, res) => {
  const { id } = req.params;
  const { reasons, customReason } = req.body || {};
  const listing = db.getListingById(id);

  if (listing) {
    const preferences = db.getPreferences();

    // Direktes Lernen aus ausgewählten Checkboxen (Sofortiger lokaler Fallback)
    const localKeywords = [];
    if (reasons && reasons.length > 0) {
      reasons.forEach(r => {
        if (r.includes('Balkon')) localKeywords.push('Kein Balkon');
        else if (r.includes('Einbauküche') || r.includes('EBK')) localKeywords.push('Keine Einbauküche');
        else if (r.includes('Erdgeschoss')) localKeywords.push('Erdgeschoss');
        else if (r.includes('Haustiere')) localKeywords.push('Haustiere verboten');
        else if (r.includes('WBS')) localKeywords.push('WBS');
        else if (r.includes('Tauschwohnung') || r.includes('Zwischenmiete')) localKeywords.push('Tauschwohnung');
        else if (r.includes('Lage')) localKeywords.push('Hauptstraße');
      });
    }

    if (localKeywords.length > 0) {
      const currentList = preferences.learnedNegativePreferences || [];
      let updated = false;
      localKeywords.forEach(kw => {
        if (!currentList.includes(kw)) {
          currentList.push(kw);
          updated = true;
        }
      });
      if (updated) {
        db.savePreferences({ learnedNegativePreferences: currentList.slice(-15) });
        console.log(`[Self-Optimization] Direkt gelernt aus Auswahl:`, localKeywords);
      }
    }

    // Wenn die Wohnung gelöscht wird und ein Gemini API Key vorhanden ist, analysieren wir sie, um Ablehnungsgründe zu lernen
    if (preferences.geminiApiKey) {
      try {
        console.log(`[Self-Optimization] Starte Analyse für gelöschte Wohnung: "${listing.title}" mit Gründen:`, reasons, customReason);
        // Asynchron ausführen, um den Client-Request nicht zu blockieren
        learnFromRejection(listing, preferences, reasons, customReason);
      } catch (err) {
        console.error('[Self-Optimization] Fehler beim Ausführen der Lernfunktion:', err.message);
      }
    }
  }

  const success = db.deleteListing(id);
  res.json({ success });
});

// ===== NOTIZEN API =====
app.get('/api/notes', (_req, res) => res.json(db.getNotes()));

app.post('/api/notes', (req, res) => {
  const { listingId, text, title } = req.body;
  if (!text || !listingId) return res.status(400).json({ error: 'listingId und text benötigt' });
  const note = {
    id: `note-${Date.now()}`,
    listingId,
    title: title || '',
    text,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  res.json(db.saveNote(note));
});

app.put('/api/notes/:id', (req, res) => {
  const { id } = req.params;
  const { text, title } = req.body;
  const existing = db.getNotes().find(n => n.id === id);
  if (!existing) return res.status(404).json({ error: 'Notiz nicht gefunden' });
  const updated = { ...existing, title: title ?? existing.title, text: text ?? existing.text, updatedAt: new Date().toISOString() };
  res.json(db.saveNote(updated));
});

app.delete('/api/notes/:id', (req, res) => {
  db.deleteNote(req.params.id);
  res.json({ success: true });
});

// ===== DOKUMENTE API =====
app.get('/api/documents', (_req, res) => res.json(db.getDocuments()));

app.post('/api/documents', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Keine Datei hochgeladen' });
  const { name, category } = req.body;
  const doc = {
    id: `doc-${Date.now()}`,
    name: name || req.file.originalname,
    category: category || 'Sonstiges',
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    url: `/uploads/${req.file.filename}`,
    uploadedAt: new Date().toISOString()
  };
  res.json(db.saveDocument(doc));
});

app.delete('/api/documents/:id', (req, res) => {
  const doc = db.getDocuments().find(d => d.id === req.params.id);
  if (doc) {
    const filePath = path.join(UPLOADS_DIR, doc.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    db.deleteDocument(doc.id);
  }
  res.json({ success: true });
});

// ===== BEWERBUNGSMAPPE ENDPOINTS =====

// Bewerbungsfoto uploaden
app.post('/api/preferences/profile-picture', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Keine Datei hochgeladen' });
  const url = `/uploads/${req.file.filename}`;
  db.savePreferences({ candidatePhoto: url });
  res.json({ success: true, url });
});



// Bewerbungsmappe generieren & herunterladen
app.post('/api/documents/generate-portfolio', async (req, res) => {
  const { title, documentIds } = req.body;
  
  try {
    const finalPdfBytes = await generatePortfolioBuffer(title, documentIds);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Bewerbungsmappe.pdf"`);
    res.send(Buffer.from(finalPdfBytes));
  } catch (err) {
    console.error('Fehler bei der PDF-Generierung:', err);
    res.status(500).json({ error: `Bewerbungsmappe konnte nicht generiert werden: ${err.message}` });
  }
});

// Mieterselbstauskunft generieren und als Dokument speichern
app.post('/api/documents/generate-self-disclosure', async (req, res) => {
  try {
    const data = req.body;
    const pdfBytes = await generateSelfDisclosurePdf(data);
    
    const filename = `self-disclosure-${Date.now()}.pdf`;
    const filePath = path.join(UPLOADS_DIR, filename);
    
    // PDF auf Festplatte schreiben
    fs.writeFileSync(filePath, Buffer.from(pdfBytes));
    
    // In Dokumenten-Datenbank registrieren
    const doc = {
      id: `doc-${Date.now()}`,
      name: `Mieterselbstauskunft - ${data.p1Name || 'Bewerber'}`,
      category: 'Selbstauskunft',
      filename: filename,
      originalName: 'Mieterselbstauskunft.pdf',
      size: pdfBytes.length,
      mimetype: 'application/pdf',
      url: `/uploads/${filename}`,
      uploadedAt: new Date().toISOString()
    };
    
    const savedDoc = db.saveDocument(doc);
    res.json(savedDoc);
  } catch (err) {
    console.error('Fehler bei Generierung der Selbstauskunft:', err);
    res.status(500).json({ error: `Mieterselbstauskunft konnte nicht generiert werden: ${err.message}` });
  }
});

// SMTP Verbindung testen
app.post('/api/smtp/test', async (req, res) => {
  const { host, port, secure, user, password, senderName } = req.body;
  if (!host || !user || !password) {
    return res.status(400).json({ error: 'Host, User und Passwort werden benötigt' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(port),
      secure: !!secure,
      auth: {
        user,
        pass: password
      }
    });

    // Testmail senden
    const mailOptions = {
      from: senderName ? `"${senderName}" <${user}>` : user,
      to: user,
      subject: '🏠 Wohnungssuche KI: SMTP Verbindungstest',
      text: 'Der SMTP-Verbindungstest war erfolgreich! Du kannst dich nun direkt aus der App auf Wohnungsanzeigen bewerben.',
      html: '<p>Der <strong>SMTP-Verbindungstest</strong> war erfolgreich! Du kannst dich nun direkt aus der App auf Wohnungsanzeigen bewerben.</p>'
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (error) {
    console.error('SMTP Test-Fehler:', error);
    res.status(500).json({ error: error.message });
  }
});

// E-Mail-Bewerbung senden
app.post('/api/listings/:id/send-email-apply', async (req, res) => {
  const { id } = req.params;
  const { recipientEmail, subject, emailBody, documentIds, coverTitle } = req.body;

  if (!recipientEmail || !subject || !emailBody) {
    return res.status(400).json({ error: 'recipientEmail, subject, und emailBody sind erforderlich.' });
  }

  const listing = db.getListingById(id);
  if (!listing) {
    return res.status(404).json({ error: 'Wohnung nicht gefunden' });
  }

  const preferences = db.getPreferences();
  const smtpHost = preferences.smtpHost || process.env.SMTP_HOST;
  const smtpUser = preferences.smtpUser || process.env.SMTP_USER;
  const smtpPassword = preferences.smtpPassword || process.env.SMTP_PASSWORD;
  const smtpPort = Number(preferences.smtpPort || process.env.SMTP_PORT) || 587;
  const smtpSecure = preferences.smtpSecure !== undefined ? !!preferences.smtpSecure : (process.env.SMTP_SECURE === 'true');
  const smtpSenderName = preferences.smtpSenderName || process.env.SMTP_SENDER_NAME;

  if (!smtpHost || !smtpUser || !smtpPassword) {
    return res.status(400).json({ error: 'Bitte konfiguriere zuerst die SMTP-Zugangsdaten in den Einstellungen oder in der .env-Datei.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPassword
      }
    });

    const attachments = [];

    // Generiere Bewerbungsmappe falls ausgewählte Dokumente vorhanden sind
    if (documentIds && Array.isArray(documentIds) && documentIds.length > 0) {
      console.log(`Generiere Bewerbungsmappe für E-Mail-Anhang mit Dokumenten: ${documentIds.join(', ')}`);
      const pdfBytes = await generatePortfolioBuffer(coverTitle || 'Bewerbung für Mietwohnung', documentIds);
      attachments.push({
        filename: 'Bewerbungsmappe.pdf',
        content: Buffer.from(pdfBytes)
      });
    }

    const mailOptions = {
      from: smtpSenderName ? `"${smtpSenderName}" <${smtpUser}>` : smtpUser,
      to: recipientEmail,
      subject: subject,
      text: emailBody,
      attachments: attachments
    };

    await transporter.sendMail(mailOptions);

    // Aktualisiere den Status der Wohnung im System
    listing.status = 'angeschrieben';
    listing.appliedAt = new Date().toISOString();
    db.saveListing(listing);

    res.json({ success: true, listing });
  } catch (error) {
    console.error('Fehler beim Senden der Bewerbung per E-Mail:', error);
    res.status(500).json({ error: `E-Mail konnte nicht gesendet werden: ${error.message}` });
  }
});

// Schnell-Bewerbung auslösen (z.B. für Autopilot)
app.post('/api/listings/:id/apply', async (req, res) => {
  const { id } = req.params;
  const listing = db.getListingById(id);
  if (!listing) {
    return res.status(404).json({ error: 'Wohnung nicht gefunden' });
  }

  const preferences = db.getPreferences();
  
  // Bestimme Empfänger-E-Mail
  const recipientEmail = listing.contactEmail || req.body.recipientEmail;
  if (!recipientEmail) {
    return res.status(400).json({ error: 'Keine Kontakt-E-Mail-Adresse für dieses Inserat vorhanden.' });
  }

  const subject = `Bewerbung für Mietwohnung: ${listing.title}`;
  
  // Stelle sicher, dass ein Anschreiben existiert
  let emailBody = listing.coverLetter;
  if (!emailBody) {
    if (preferences.geminiApiKey) {
      try {
        emailBody = await generateCoverLetter(listing, preferences, preferences.geminiApiKey);
        listing.coverLetter = emailBody;
        db.saveListing(listing);
      } catch (err) {
        console.error('Fehler beim automatischen Generieren des Anschreibens:', err);
      }
    }
  }

  if (!emailBody) {
    emailBody = `Sehr geehrte Damen und Herren,\n\nich interessiere mich sehr für Ihr Wohnungsangebot "${listing.title}" in ${listing.location} und würde mich über die Gelegenheit zu einer Besichtigung freuen.\n\nMit freundlichen Grüßen,\n${preferences.candidateName || 'Interessent'}`;
  }

  // Bestimme Dokumenten-Anhänge basierend auf Einstellungen
  let documentIds = [];
  if (preferences.autopilotAttachPortfolio) {
    documentIds = db.getDocuments().map(d => d.id);
  } else if (preferences.autopilotAttachSelfDisclosure) {
    documentIds = db.getDocuments().filter(d => d.category === 'Selbstauskunft').map(d => d.id);
  }

  // Nutze bestehende SMTP-Sendelogik
  const smtpHost = preferences.smtpHost || process.env.SMTP_HOST;
  const smtpUser = preferences.smtpUser || process.env.SMTP_USER;
  const smtpPassword = preferences.smtpPassword || process.env.SMTP_PASSWORD;
  const smtpPort = Number(preferences.smtpPort || process.env.SMTP_PORT) || 587;
  const smtpSecure = preferences.smtpSecure !== undefined ? !!preferences.smtpSecure : (process.env.SMTP_SECURE === 'true');
  const smtpSenderName = preferences.smtpSenderName || process.env.SMTP_SENDER_NAME;

  if (!smtpHost || !smtpUser || !smtpPassword) {
    return res.status(400).json({ error: 'Bitte konfiguriere zuerst die SMTP-Zugangsdaten in den Einstellungen.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPassword
      }
    });

    const attachments = [];

    if (documentIds.length > 0) {
      console.log(`[Autopilot-Apply] Generiere Bewerbungsmappe mit Dokumenten: ${documentIds.join(', ')}`);
      const pdfBytes = await generatePortfolioBuffer('Bewerbung für Mietwohnung', documentIds);
      attachments.push({
        filename: 'Bewerbungsmappe.pdf',
        content: Buffer.from(pdfBytes)
      });
    }

    const mailOptions = {
      from: smtpSenderName ? `"${smtpSenderName}" <${smtpUser}>` : smtpUser,
      to: recipientEmail,
      subject: subject,
      text: emailBody,
      attachments: attachments
    };

    await transporter.sendMail(mailOptions);

    listing.status = 'angeschrieben';
    listing.appliedAt = new Date().toISOString();
    db.saveListing(listing);

    res.json({ success: true, listing });
  } catch (error) {
    console.error('[Autopilot-Apply] Fehler beim Senden:', error);
    res.status(500).json({ error: `E-Mail konnte nicht gesendet werden: ${error.message}` });
  }
});

// Mietvertrag analysieren
app.post('/api/documents/analyze-lease', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Keine Datei hochgeladen.' });
  }

  const filePath = path.join(UPLOADS_DIR, req.file.filename);
  const preferences = db.getPreferences();

  if (!preferences.geminiApiKey) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(400).json({ error: 'Bitte trage zuerst deinen Gemini API-Key im Suchprofil ein.' });
  }

  try {
    const dataBuffer = fs.readFileSync(filePath);
    
    // PDF in Text konvertieren
    const pdfData = await pdfParse(dataBuffer);
    const textContent = pdfData.text;

    if (!textContent || textContent.trim().length === 0) {
      throw new Error('Der PDF-Inhalt konnte nicht gelesen werden (evtl. eingescannte Bilder ohne OCR).');
    }

    console.log(`Mietvertrag Textlänge: ${textContent.length} Zeichen. Starte Analyse mit Gemini...`);
    
    const analysis = await analyzeLeaseText(textContent, preferences.geminiApiKey);

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Fehler bei der Mietvertrags-Analyse:', error);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: `Analyse fehlgeschlagen: ${error.message}` });
  }
});

// ===== TELEGRAM TEST =====
app.post('/api/telegram/test', async (req, res) => {
  const { token, chatId } = req.body;
  if (!token || !chatId) return res.status(400).json({ error: 'Token und Chat-ID benötigt' });
  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: '🏠 *Wohnungssuche KI*\n\nVerbindungstest erfolgreich! Du bekommst ab jetzt Benachrichtigungen für neue passende Wohnungen.',
      parse_mode: 'Markdown'
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.description || err.message });
  }
});

// ===== PWA WEB PUSH ENDPOINTS =====
app.get('/api/push/vapid-public-key', (req, res) => {
  const preferences = db.getPreferences();
  if (!preferences.vapidKeys) {
    return res.status(404).json({ error: 'VAPID Keys not initialized' });
  }
  res.json({ publicKey: preferences.vapidKeys.publicKey });
});

app.post('/api/push/subscribe', (req, res) => {
  const subscription = req.body;
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Ungültiges Subscription-Objekt' });
  }
  db.savePushSubscription(subscription);
  res.json({ success: true });
});

app.post('/api/push/unsubscribe', (req, res) => {
  const { endpoint } = req.body;
  if (!endpoint) {
    return res.status(400).json({ error: 'Endpoint erforderlich' });
  }
  db.deletePushSubscription(endpoint);
  res.json({ success: true });
});

// ===== PARTNER VOTING =====
app.post('/api/listings/:id/partner-vote', (req, res) => {
  const { id } = req.params;
  const { partner, vote } = req.body; // partner: 'partnerA' | 'partnerB', vote: 'like' | 'dislike' | 'neutral'
  const listing = db.getListingById(id, req.profileId);
  if (!listing) return res.status(404).json({ error: 'Wohnung nicht gefunden' });

  if (!listing.partnerVotes) listing.partnerVotes = {};
  listing.partnerVotes[partner || 'partnerA'] = vote;
  
  db.saveListing(listing, req.profileId);
  res.json({ success: true, listing });
});

// ===== MIETVERTRAG NACHVERHANDLUNGS-BRIEF =====
app.post('/api/listings/:id/negotiation-letter', async (req, res) => {
  const { id } = req.params;
  const { leaseAnalysis } = req.body;
  const listing = db.getListingById(id, req.profileId);
  const preferences = db.getPreferences(req.profileId);

  if (!preferences.geminiApiKey) {
    return res.status(400).json({ error: 'Gemini API-Key fehlt in den Einstellungen.' });
  }

  try {
    const letter = await generateLeaseNegotiationLetter(listing ? listing.title : 'Mietwohnung', leaseAnalysis, preferences, preferences.geminiApiKey);
    res.json({ success: true, letter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== AUTOMATISCHER GEHALTSNACHWEIS CHECK =====
app.post('/api/documents/salary-check', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Keine Datei hochgeladen.' });
  const filePath = path.join(UPLOADS_DIR, req.file.filename);
  const preferences = db.getPreferences(req.profileId);

  if (!preferences.geminiApiKey) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return res.status(400).json({ error: 'Gemini API-Key erforderlich.' });
  }

  try {
    let result = null;
    if (req.file.mimetype === 'application/pdf' || req.file.filename.endsWith('.pdf')) {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      result = await analyzeSalarySlip(pdfData.text, preferences.geminiApiKey, false);
    } else {
      const dataBuffer = fs.readFileSync(filePath);
      const base64 = dataBuffer.toString('base64');
      result = await analyzeSalarySlip({ base64, mimeType: req.file.mimetype }, preferences.geminiApiKey, true);
    }

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ success: true, result });
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(500).json({ error: err.message });
  }
});

// ===== BEWERBUNGSMAPPE POST GENERATION =====
app.post('/api/documents/generate-portfolio', async (req, res) => {
  const { title, documentIds, watermarkText } = req.body;
  try {
    const pdfBytes = await generatePortfolioBuffer(title || 'Bewerbungsmappe', documentIds || [], watermarkText || '');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${title || 'Bewerbungsmappe'}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    res.status(500).json({ error: `Fehler beim Generieren: ${err.message}` });
  }
});

// ===== WASSERZEICHEN-BEWERBUNGSMAPPE DOWNLOAD =====
app.get('/api/portfolio/download', async (req, res) => {
  const watermark = req.query.watermark || '';
  const documentIds = req.query.docIds ? req.query.docIds.split(',') : db.getDocuments(req.profileId).map(d => d.id);
  
  try {
    const pdfBytes = await generatePortfolioBuffer('Bewerbungsmappe', documentIds, watermark);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Bewerbungsmappe${watermark ? '-Wasserzeichen' : ''}.pdf"`);
    res.send(Buffer.from(pdfBytes));
  } catch (err) {
    res.status(500).json({ error: `Fehler beim Erstellen der Bewerbungsmappe: ${err.message}` });
  }
});


// ===== ÖPNV ECHTZEIT ABFAHRTSMONITOR =====
app.get('/api/listings/:id/live-transit', async (req, res) => {
  const listing = db.getListingById(req.params.id, req.profileId);
  if (!listing) return res.status(404).json({ error: 'Wohnung nicht gefunden' });
  try {
    const departures = await fetchLiveDepartures(listing.lat, listing.lon);
    res.json({ success: true, departures });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== RSS FEED ENDPOINT =====
app.get('/api/feed/rss', (req, res) => {
  const profileId = req.query.profileId ? parseInt(req.query.profileId, 10) : (req.profileId || 1);
  const minScore = req.query.minScore ? parseInt(req.query.minScore, 10) : 0;
  const listings = db.getListings(profileId).filter(l => (l.matchScore || 0) >= minScore);
  const prefs = db.getPreferences(profileId);
  const rssXml = generateRssFeed(listings, prefs.candidateName || 'Wohnungssuche KI');
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.send(rssXml);
});

// ===== BESICHTIGUNGS-COACH & SPRACHNOTIZ =====
app.post('/api/listings/:id/viewing-note', async (req, res) => {
  const { id } = req.params;
  const { noteText } = req.body;
  const listing = db.getListingById(id, req.profileId);
  if (!listing) return res.status(404).json({ error: 'Wohnung nicht gefunden' });
  const preferences = db.getPreferences(req.profileId);

  if (!preferences.geminiApiKey) {
    return res.status(400).json({ error: 'Gemini API-Key in Einstellungen erforderlich.' });
  }

  try {
    const analysis = await parseViewingVoiceNote(noteText, listing.title, preferences.geminiApiKey);
    if (!listing.viewingNotesList) listing.viewingNotesList = [];
    listing.viewingNotesList.push({
      date: new Date().toISOString(),
      noteText,
      analysis
    });

    if (analysis.newPros) listing.pros = Array.from(new Set([...(listing.pros || []), ...analysis.newPros]));
    if (analysis.newCons) listing.cons = Array.from(new Set([...(listing.cons || []), ...analysis.newCons]));

    db.saveListing(listing, req.profileId);
    res.json({ success: true, listing, analysis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== KÜNDIGUNGSSCHREIBEN FÜR ALTE WOHNUNG =====
app.post('/api/moving/termination-letter', async (req, res) => {
  const formData = req.body;
  const preferences = db.getPreferences(req.profileId);

  if (!preferences.geminiApiKey) {
    return res.status(400).json({ error: 'Gemini API-Key in Einstellungen erforderlich.' });
  }

  try {
    const letter = await generateLeaseTerminationLetter(formData, preferences, preferences.geminiApiKey);
    res.json({ success: true, letter });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Server starten und Scheduler initialisieren
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf http://0.0.0.0:${PORT}`);
  db.getPreferences(); // DB initialisieren
  initVapidKeys(); // VAPID Keys für Web Push initialisieren
  db.cleanGeographicallyInvalid(); // Purge old invalid listings
  setupScheduler(); // Cron-Job starten
  startTelegramUpdatesLoop(); // Telegram Buttons überwachen
});

