import { ImapFlow } from 'imapflow';
import { simpleParser } from 'mailparser';
import { parseListingFromText } from './ai-analyzer.js';
import { db } from './db.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sendTelegramNotification } from './notifier.js';
import { updateScanStatus } from './scan-status.js';
import { processAndEvaluateListing, enrichListingDetails } from './listing-processor.js';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function isDuplicate(newListing, existingListings) {
  for (const existing of existingListings) {
    if (newListing.url && existing.url && newListing.url === existing.url) {
      return true;
    }
    if (newListing.priceKalt > 0 && newListing.priceKalt === existing.priceKalt &&
        newListing.sqm > 0 && Math.abs(newListing.sqm - existing.sqm) < 0.5) {
      
      const getZipOrCleanLoc = (loc) => {
        if (!loc) return '';
        const zipMatch = loc.match(/\b\d{5}\b/);
        if (zipMatch) return zipMatch[0];
        return loc.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 15);
      };
      
      const zipNew = getZipOrCleanLoc(newListing.location);
      const zipExisting = getZipOrCleanLoc(existing.location);
      
      if (zipNew && zipExisting && zipNew === zipExisting) {
        return true;
      }
    }
  }
  return false;
}



/**
 * Sendet den E-Mail-Inhalt an Gemini, um strukturierte Wohnungsanzeigen zu extrahieren.
 * Unterstützt das Extrahieren mehrerer Anzeigen aus einer einzelnen Mail.
 */
async function extractListingsFromEmail(emailText, apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);
  // Wir nutzen gemini-2.5-flash, da es zuverlässig funktioniert
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  
  const prompt = `
Du bist ein Datenextraktions-Assistent für deutsche Wohnungsanzeigen. Deine Aufgabe ist es, aus dem Text einer Suchagent-E-Mail (z. B. von ImmobilienScout24, Immowelt oder WG-Gesucht) alle neuen Wohnungsangebote zu extrahieren.

Hier ist der Text der E-Mail:
"""
${emailText}
"""

Extrahiere alle aufgelisteten Wohnungsangebote und antworte AUSSCHLIESSLICH im folgenden JSON-Format (ein Array von Objekten):
[
  {
    "title": "Titel der Anzeige oder passende Überschrift",
    "priceKalt": 0, // Kaltmiete als Zahl (Euro), 0 falls nicht gefunden
    "priceWarm": 0, // Warmmiete als Zahl (Euro), 0 falls nicht gefunden (schätze falls nur Kaltmiete vorhanden)
    "sqm": 0,       // Wohnfläche in Quadratmetern als Zahl, 0 falls nicht gefunden
    "rooms": 0,     // Anzahl der Zimmer als Zahl, 0 falls nicht gefunden
    "location": "Ortsteil und Stadt der Wohnung (z.B. Unterbilk, Düsseldorf oder Berlin Mitte)",
    "url": "Vollständiger Link zum Exposé (z.B. https://www.immobilienscout24.de/expose/12345678...)",
    "description": "Zusammenfassung der Wohnung aus der E-Mail (z.B. 2 Zimmer, Balkon, Einbauküche) in 1-2 Sätzen",
    "contactName": ""
  }
]

Wichtige Regeln:
1. Extrahiere nur Zahlen für priceKalt, priceWarm, sqm und rooms. Keine Einheiten oder Währungssymbole.
2. Wenn eine URL zum Exposé in der E-Mail vorhanden ist, extrahiere sie vollständig für jedes Angebot. Das ist wichtig für die Verlinkung!
3. Falls mehrere Wohnungen in der E-Mail aufgeführt sind, extrahiere ALLE als separate Objekte im Array.
4. Antworte NUR mit dem reinen JSON-Array, ohne Markdown-Formatierung wie \`\`\`json.
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text().trim();
    const parsed = JSON.parse(responseText);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Fehler beim Extrahieren der Wohnungen aus E-Mail per Gemini:', error.message);
    return [];
  }
}

/**
 * Verbindet sich mit dem Postfach, sucht nach ungelöschten und ungelesenen Suchagent-Mails,
 * extrahiert Wohnungen mit Gemini, bewertet sie und speichert sie in der Datenbank.
 */
export async function checkImapEmails(profileId = 1) {
  const preferences = db.getPreferences(profileId);
  
  const imapEnabled = preferences.imapEnabled || process.env.IMAP_ENABLED === 'true';
  if (!imapEnabled) {
    console.log('IMAP Suchlauf ist deaktiviert.');
    return { success: false, message: 'IMAP Suchlauf ist deaktiviert.' };
  }

  const imapHost = preferences.imapHost || process.env.IMAP_HOST;
  const imapUser = preferences.imapUser || process.env.IMAP_USER;
  const imapPassword = preferences.imapPassword || process.env.IMAP_PASSWORD;
  const imapPort = Number(preferences.imapPort || process.env.IMAP_PORT) || 993;

  if (!imapHost || !imapUser || !imapPassword) {
    console.warn('IMAP Zugangsdaten sind unvollständig.');
    return { success: false, message: 'IMAP Zugangsdaten sind unvollständig.' };
  }

  const client = new ImapFlow({
    host: imapHost,
    port: imapPort,
    secure: true,
    auth: {
      user: imapUser,
      pass: imapPassword
    },
    logger: false
  });

  console.log(`Verbinde mit IMAP-Server: ${imapHost}...`);
  let newListingsCount = 0;

  try {
    updateScanStatus({
      portal: 'E-Mail-Suchlauf',
      message: 'Verbinde mit IMAP-Server...'
    });
    await client.connect();
    
    // Sperre die INBOX für Lese-/Schreibzugriff
    const lock = await client.getMailboxLock('INBOX');
    
    try {
      const existingListings = db.getListings(profileId);
      
      // Suche nach ungelesenen E-Mails
      // source: true liefert den Rohinhalt der Mail
      const fetchQuery = { seen: false };
      
      updateScanStatus({
        portal: 'E-Mail-Suchlauf',
        message: 'Suche nach ungelesenen Suchagent-Mails...'
      });
      
      for await (let message of client.fetch(fetchQuery, { source: true, envelope: true })) {
        const subject = message.envelope.subject || '';
        const from = message.envelope.from && message.envelope.from[0] ? message.envelope.from[0].address : '';
        
        // Prüfen, ob die E-Mail ein Suchagent von einem Portal ist
        // (z.B. Immobilienscout24, Immowelt, WG-Gesucht oder Kleinanzeigen)
        const isSearchAlert = 
          subject.toLowerCase().includes('immobilienscout24') ||
          subject.toLowerCase().includes('immowelt') ||
          subject.toLowerCase().includes('wg-gesucht') ||
          subject.toLowerCase().includes('kleinanzeigen') ||
          subject.toLowerCase().includes('immonet') ||
          subject.toLowerCase().includes('meinestadt') ||
          subject.toLowerCase().includes('wohnungsboerse') ||
          subject.toLowerCase().includes('suchauftrag') ||
          subject.toLowerCase().includes('suchagent') ||
          subject.toLowerCase().includes('neue angebote') ||
          subject.toLowerCase().includes('suchprofil') ||
          subject.toLowerCase().includes('suchergebnisse') ||
          subject.toLowerCase().includes('wohnungsanzeige') ||
          from.toLowerCase().includes('immobilienscout24') ||
          from.toLowerCase().includes('immowelt') ||
          from.toLowerCase().includes('wg-gesucht') ||
          from.toLowerCase().includes('immonet') ||
          from.toLowerCase().includes('meinestadt') ||
          from.toLowerCase().includes('wohnungsboerse') ||
          from.toLowerCase().includes('ebay');

        if (!isSearchAlert) {
          // Prüfen ob es eine Vermieter-Antwort ist (Phase 5 - Auto-Status-Update)
          const subjectLower = subject.toLowerCase();
          const isLandlordReply =
            subjectLower.includes('besichtigung') ||
            subjectLower.includes('viewing') ||
            subjectLower.includes('absage') ||
            subjectLower.includes('leider') ||
            subjectLower.includes('vergeben') ||
            subjectLower.includes('vermietet') ||
            subjectLower.includes('angebot') ||
            subjectLower.includes('re: bewerbung') ||
            subjectLower.includes('re: anfrage') ||
            subjectLower.includes('aw: bewerbung');

          if (isLandlordReply) {
            console.log(`[Auto-Status] Mögliche Vermieter-Antwort erkannt: "${subject}"`);
            // Finde passende Wohnung über Betreff-Matching (Titel-Suche in existierenden Inseraten)
            const listingsToMatch = existingListings.filter(l => l.status === 'beworben');
            let matchedListing = null;
            let newStatus = null;

            for (const l of listingsToMatch) {
              const titleWords = (l.title || '').toLowerCase().split(' ').filter(w => w.length > 4);
              const subjectMatches = titleWords.filter(word => subjectLower.includes(word));
              if (subjectMatches.length >= 2 || (l.location && subjectLower.includes(l.location.toLowerCase().split(',')[0]))) {
                matchedListing = l;
                break;
              }
            }

            if (matchedListing) {
              if (subjectLower.includes('besichtigung') || subjectLower.includes('einladung') || subjectLower.includes('termin')) {
                newStatus = 'besichtigung';
                try {
                  const parsedApp = await parseViewingAppointmentFromEmail(emailText, preferences.geminiApiKey);
                  if (parsedApp && parsedApp.date) {
                    matchedListing.viewingDate = `${parsedApp.date}T${parsedApp.time || '12:00'}`;
                    matchedListing.viewingAddress = parsedApp.address || matchedListing.location;
                    matchedListing.viewingNotes = parsedApp.notes || '';
                    matchedListing.suggestedReply = parsedApp.suggestedReply || '';
                    console.log(`[Auto-Termin] Besichtigungstermin extrahiert: ${matchedListing.viewingDate} (${matchedListing.viewingAddress})`);
                  }
                } catch (appErr) {
                  console.error('[Auto-Termin] Fehler beim Extrahieren des Besichtigungstermins:', appErr.message);
                }
              } else if (subjectLower.includes('absage') || subjectLower.includes('vergeben') || subjectLower.includes('vermietet') || subjectLower.includes('leider')) {
                newStatus = 'abgelehnt';
              }

              if (newStatus) {
                matchedListing.status = newStatus;
                db.saveListing(matchedListing, profileId);
                console.log(`[Auto-Status] Status von "${matchedListing.title}" auf "${newStatus}" gesetzt (basierend auf E-Mail: "${subject}").`);
              }
            }
          }
          // Keine Suchagenten-Mail -> überspringen
          continue;
        }

        console.log(`Verarbeite E-Mail: "${subject}" von ${from}`);
        updateScanStatus({
          portal: 'E-Mail-Suchlauf',
          message: `Lese E-Mail: "${subject.substring(0, 30)}..."`
        });
        
        // E-Mail-Inhalt parsen
        const parsedEmail = await simpleParser(message.source);
        const emailText = parsedEmail.text || parsedEmail.html || '';

        if (!emailText.trim()) {
          console.warn(`E-Mail ${message.uid} hat keinen lesbaren Inhalt.`);
          continue;
        }

        // Wohnungen per Gemini extrahieren
        const extractedListings = await extractListingsFromEmail(emailText, preferences.geminiApiKey);
        console.log(`Gemini hat ${extractedListings.length} Angebote in der E-Mail gefunden.`);

        const totalAlerts = extractedListings.length;
        let alertIndex = 0;

        for (const rawListing of extractedListings) {
          alertIndex++;

          // Vollständiges Wohnungsobjekt initialisieren
          const newListing = {
            id: `email-import-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            portal: rawListing.url && rawListing.url.includes('immoscout24') ? 'immoscout24' : 
                    rawListing.url && rawListing.url.includes('immowelt') ? 'immowelt' : 
                    rawListing.url && rawListing.url.includes('kleinanzeigen') ? 'kleinanzeigen' : 
                    rawListing.url && rawListing.url.includes('wg-gesucht') ? 'wg-gesucht' : 
                    rawListing.url && rawListing.url.includes('immonet') ? 'immonet' : 
                    rawListing.url && rawListing.url.includes('meinestadt') ? 'meinestadt' : 
                    rawListing.url && rawListing.url.includes('wohnungsboerse') ? 'wohnungsboerse' : 'sonstige',
            url: rawListing.url || '',
            title: rawListing.title || 'Wohnung aus E-Mail-Suchagent',
            priceKalt: rawListing.priceKalt || 0,
            priceWarm: rawListing.priceWarm || 0,
            sqm: rawListing.sqm || 0,
            rooms: rawListing.rooms || 0,
            location: rawListing.location || 'Siehe Beschreibung',
            description: rawListing.description || '',
            scrapedAt: new Date().toISOString(),
            manualImport: false, // Als automatisches Ergebnis behandeln
            status: 'neu'
          };

          // Dubletten prüfen
          if (isDuplicate(newListing, existingListings)) {
            console.log(`Angebot bereits vorhanden (Dublette): ${newListing.title}`);
            continue;
          }

          updateScanStatus({
            portal: 'E-Mail-Suchlauf',
            progress: alertIndex,
            total: totalAlerts,
            message: `Bewerte E-Mail-Inserat ${alertIndex} von ${totalAlerts}: "${newListing.title}"...`
          });

          // Bewerten und speichern
          let evaluated = await processAndEvaluateListing(newListing, preferences);
          if (evaluated.matchScore === 10 && evaluated.matchSummary && evaluated.matchSummary.startsWith('Geografisch unpassend')) {
            console.log(`[Filter] Überspringe Speichern der E-Mail-Wohnung "${evaluated.title}", da sie geografisch unpassend ist.`);
            continue;
          }

          // Auto-enrichment if matching score is good (>= 70) and listing has URL
          if (evaluated.matchScore >= 70 && evaluated.url && !evaluated.enriched) {
            console.log(`[Auto-Enrich] Promising E-Mail listing found: "${evaluated.title}" (Score: ${evaluated.matchScore}). Enriching details...`);
            evaluated = await enrichListingDetails(evaluated, preferences);
          }

          db.saveListing(evaluated, profileId);
          existingListings.push(evaluated);
          newListingsCount++;

          // Schlafzeit, um Gemini API-Rate-Limits (429) bei freier Nutzung zu vermeiden
          if (evaluated.matchScore !== 10 || !evaluated.matchSummary.startsWith('Geografisch unpassend')) {
            console.log(`Warte 4.5 Sekunden zur Ratenbegrenzung der Gemini API (IMAP)...`);
            await sleep(4500);
          }
        }

        // E-Mail als gelesen markieren, um sie nicht erneut zu verarbeiten
        await client.messageFlagsAdd({ uid: message.uid }, ['\\Seen']);
        console.log(`E-Mail "${subject}" wurde als gelesen markiert.`);
      }
    } finally {
      // Wichtig: Sperre freigeben
      lock.release();
    }
    
    await client.logout();
    console.log('IMAP Suchlauf abgeschlossen.');
    return { success: true, newCount: newListingsCount };
  } catch (error) {
    console.error('Fehler beim IMAP Suchlauf:', error.message);
    // Versuchen, sicher auszuloggen
    try {
      await client.logout();
    } catch (_) {}
    return { success: false, error: error.message };
  }
}
