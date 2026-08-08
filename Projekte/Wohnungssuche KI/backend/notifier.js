import axios from 'axios';
import { db } from './db.js';
import { generatePortfolioBuffer } from './pdf-generator.js';
import webpush from 'web-push';


/**
 * Sendet eine Benachrichtigung über Telegram, falls aktiviert und der Score ausreicht.
 */
export async function sendTelegramNotification(preferences, listing) {
  const telegramEnabled = preferences.telegramEnabled || process.env.TELEGRAM_ENABLED === 'true';
  const token = preferences.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
  const chatId = preferences.telegramChatId || process.env.TELEGRAM_CHAT_ID;

  if (!telegramEnabled || !token || !chatId) {
    return;
  }

  const score = listing.matchScore || 50;
  const minScore = preferences.telegramMinScore || 75;

  if (score < minScore) {
    console.log(`Telegram: Wohnung "${listing.title}" hat Score ${score}%, benötigt werden mindestens ${minScore}%. Keine Benachrichtigung gesendet.`);
    return;
  }

  // Echte Web-Push Benachrichtigung senden (PWA)
  try {
    const pushTitle = `🏠 Neue Wohnung gefunden! (${score}%)`;
    const pushBody = `${listing.title}\nMiete: ${listing.priceKalt ? `${listing.priceKalt} € Kalt` : 'N/A'} | Ort: ${listing.location || 'N/A'}`;
    sendWebPushNotification(pushTitle, pushBody, { listingId: listing.id }).catch(err => {
      console.error('Hintergrund Web Push Fehler:', err.message);
    });
  } catch (pushErr) {
    console.error('Fehler bei PWA Web Push Auslösung:', pushErr.message);
  }

  const portalNames = {
    kleinanzeigen: 'Kleinanzeigen',
    immoscout24: 'ImmoScout24',
    immowelt: 'Immowelt',
    'ohne-makler': 'ohne-makler.net',
    'wg-gesucht': 'WG-Gesucht'
  };
  const portalName = portalNames[listing.portal] || listing.portal || 'Sonstige';

  const pricePerSqm = listing.priceKalt && listing.sqm 
    ? `(${(listing.priceKalt / listing.sqm).toFixed(2)} €/m²)` 
    : '';

  // Pendelzeit-Angaben falls vorhanden
  let commuteText = '';
  if (listing.carDistanceKm !== undefined && listing.carDistanceKm !== null) {
    commuteText = `\n🚗 Arbeitsweg: ${listing.carDistanceKm} km (${listing.carDurationMin || '?'} Min.)`;
  }
  if (listing.bikeDistanceKm !== undefined && listing.bikeDistanceKm !== null) {
    commuteText += `\n🚲 Fahrrad: ${listing.bikeDistanceKm} km (${listing.bikeDurationMin || listing.travelTimeBicycleMin || '?'} Min.)`;
  }
  if (listing.footDistanceKm !== undefined && listing.footDistanceKm !== null) {
    commuteText += `\n🚶 Zu Fuß: ${listing.footDistanceKm} km (${listing.footDurationMin || '?'} Min.)`;
  }

  // Vorteile formatieren
  const prosText = listing.pros && listing.pros.length > 0
    ? listing.pros.slice(0, 3).map(p => `  ✓ ${p}`).join('\n')
    : '  Keine besonderen Vorteile extrahiert';

  const messageText = `🏠 *Neue passende Wohnung gefunden! (${score}%)*

*Titel:* ${escapeMarkdown(listing.title)}
*Portal:* ${portalName}
*Miete:* ${listing.priceKalt ? `${listing.priceKalt} € Kalt` : 'N/A'} | ${listing.priceWarm ? `${listing.priceWarm} € Warm` : 'N/A'}
*Details:* ${listing.sqm ? `${listing.sqm} m²` : 'N/A'} ${pricePerSqm} | ${listing.rooms ? `${listing.rooms} Zimmer` : 'N/A'}
*Ort:* ${escapeMarkdown(listing.location || 'Keine Ortsangabe')}${commuteText}

*Fazit:*
${escapeMarkdown(listing.matchSummary || 'Keine Zusammenfassung')}

*Top-Vorteile:*
${escapeMarkdown(prosText)}

🔗 [Link zur Anzeige öffnen](${listing.url})`;

  // token und chatId oben deklariert

  // Inline-Keyboard-Buttons definieren
  const keyboardRows = [
    [
      { text: '🔗 Exposé öffnen', url: listing.url },
      { text: '⭐ Favorit', callback_data: `fav_${listing.id}` },
      { text: '🗑️ Löschen', callback_data: `del_${listing.id}` }
    ]
  ];

  if (preferences.autopilotEnabled && listing.contactEmail) {
    keyboardRows.push([
      { text: '🚀 Autopilot: Bewerben', callback_data: `apply_${listing.id}` },
      { text: '📄 Bewerbungsmappe senden', callback_data: `mappe_${listing.id}` }
    ]);
  } else {
    keyboardRows.push([
      { text: '📄 Bewerbungsmappe senden', callback_data: `mappe_${listing.id}` }
    ]);
  }

  const replyMarkup = {
    inline_keyboard: keyboardRows
  };

  const hasPhoto = listing.images && listing.images.length > 0;

  if (hasPhoto) {
    try {
      console.log(`Sende Telegram-Bildbenachrichtigung (sendPhoto) für "${listing.title}"...`);
      // Telegram-Limits: Caption darf max. 1024 Zeichen lang sein.
      let captionText = messageText;
      if (captionText.length > 1024) {
        captionText = captionText.substring(0, 1020) + '...';
      }

      await axios.post(`https://api.telegram.org/bot${token}/sendPhoto`, {
        chat_id: chatId,
        photo: listing.images[0],
        caption: captionText,
        parse_mode: 'Markdown',
        reply_markup: replyMarkup
      }, { timeout: 8000 });
      console.log(`Telegram-Bildbenachrichtigung erfolgreich gesendet.`);
      return;
    } catch (error) {
      console.error(`Fehler beim Senden des Fotos an Telegram. Versuche Text-Fallback...`, error.response?.data || error.message);
    }
  }

  // Normaler Text-Sendeversuch (Fallback)
  console.log(`Sende normale Telegram-Textbenachrichtigung (sendMessage) für "${listing.title}"...`);
  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: messageText,
      parse_mode: 'Markdown',
      disable_web_page_preview: false,
      reply_markup: replyMarkup
    }, { timeout: 8000 });
    console.log(`Telegram-Textbenachrichtigung erfolgreich gesendet.`);
  } catch (error) {
    console.error(`Fehler beim Senden der Telegram-Textbenachrichtigung:`, error.response?.data || error.message);
  }
}

/**
 * Sendet eine Testnachricht an Telegram zur Funktionsüberprüfung.
 */
export async function sendTelegramTestMessage(token, chatId) {
  const text = `ℹ️ *Wohnungssuche KI - Verbindungstest*
Glückwunsch! Die Verbindung zu deinem Telegram Bot wurde erfolgreich hergestellt. Du wirst ab jetzt über neue Wohnungsangebote benachrichtigt.`;

  try {
    await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
      chat_id: chatId,
      text: text,
      parse_mode: 'Markdown'
    }, { timeout: 5000 });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.response?.data?.description || error.message };
  }
}

// Markdown-Zeichen escapen, um Parse-Fehler in Telegram zu vermeiden
function escapeMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/`/g, '\\`');
}

let lastUpdateId = 0;
let isPollingStarted = false;

/**
 * Startet die Long-Polling-Schleife für Telegram getUpdates, um auf Inline-Button-Klicks zu reagieren.
 */
export function startTelegramUpdatesLoop() {
  if (isPollingStarted) return;
  isPollingStarted = true;

  console.log('Telegram Updates Loop (Long-Polling) gestartet.');
  
  // Asynchrone Endlosschleife
  const poll = async () => {
    const preferences = db.getPreferences();
    const telegramEnabled = preferences.telegramEnabled || process.env.TELEGRAM_ENABLED === 'true';
    const token = preferences.telegramBotToken || process.env.TELEGRAM_BOT_TOKEN;
    if (!telegramEnabled || !token) {
      setTimeout(poll, 5000);
      return;
    }

    try {
      // Wenn wir noch keine lastUpdateId haben, machen wir einen initialen schnellen Abruf,
      // um nur nachfolgende (neue) Updates zu bearbeiten.
      const params = {
        timeout: 10
      };
      if (lastUpdateId > 0) {
        params.offset = lastUpdateId + 1;
      } else {
        // Erstmalig: Nur das allerletzte Update holen, um die ID zu initialisieren
        params.limit = 1;
        params.offset = -1;
      }

      const response = await axios.get(`https://api.telegram.org/bot${token}/getUpdates`, {
        params,
        timeout: 15000
      });

      const updates = response.data.result;
      if (updates && updates.length > 0) {
        for (const update of updates) {
          // Update ID aktualisieren
          lastUpdateId = Math.max(lastUpdateId, update.update_id);

          // Nur verarbeiten, wenn wir bereits initialisiert waren (also nicht beim allerersten -1 Offset Abruf)
          if (params.offset !== -1 && update.callback_query) {
            console.log(`Telegram: Verarbeite Aktion "${update.callback_query.data}" für Update ${update.update_id}`);
            await handleTelegramCallbackQuery(update.callback_query, token);
          }
        }
      }
    } catch (error) {
      // Konsolenspam bei ungültigen Tokens oder Netzwerkausfall vermeiden
      if (error.response?.status !== 401 && error.response?.status !== 404) {
        console.error('Fehler in Telegram getUpdates Loop:', error.message);
      }
    }

    // Nächste Abfrage planen
    setTimeout(poll, 5000);
  };

  poll();
}

/**
 * Verarbeitet Klicks auf die Inline-Buttons (Favorisieren und Löschen).
 */
async function handleTelegramCallbackQuery(callbackQuery, token) {
  const { id: callbackQueryId, data, message } = callbackQuery;
  if (!data) return;

  const match = data.match(/^(fav|del|mappe|apply)_(.+)$/);
  if (!match) return;

  const action = match[1];
  const listingId = match[2];
  const listing = db.getListingById(listingId);

  const chatId = message.chat.id;
  const messageId = message.message_id;

  try {
    if (action === 'fav') {
      if (!listing) {
        await axios.post(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
          callback_query_id: callbackQueryId,
          text: 'Wohnung nicht mehr in der Datenbank vorhanden ❌',
          show_alert: true
        });
        return;
      }

      // Wohnung favorisieren
      listing.status = 'favorit';
      db.saveListing(listing);

      // Toast-Bestätigung senden
      await axios.post(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        callback_query_id: callbackQueryId,
        text: 'Wohnung als Favorit markiert! ⭐'
      });

      // Buttons aktualisieren (Favorit-Button ersetzen)
      const updatedReplyMarkup = {
        inline_keyboard: [
          [
            { text: '🔗 Exposé öffnen', url: listing.url },
            { text: '⭐ Favorisiert! ✅', callback_data: 'none' },
            { text: '🗑️ Löschen', callback_data: `del_${listingId}` }
          ],
          [
            { text: '📄 Bewerbungsmappe senden', callback_data: `mappe_${listingId}` }
          ]
        ]
      };

      await axios.post(`https://api.telegram.org/bot${token}/editMessageReplyMarkup`, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: updatedReplyMarkup
      });

    } else if (action === 'mappe') {
      const docs = db.getDocuments();
      if (!docs || docs.length === 0) {
        await axios.post(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
          callback_query_id: callbackQueryId,
          text: 'Keine Dokumente für die Mappe vorhanden! ❌ Bitte lade zuerst Dokumente hoch.',
          show_alert: true
        });
        return;
      }

      // Toast-Bestätigung senden
      await axios.post(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        callback_query_id: callbackQueryId,
        text: 'Generiere Bewerbungsmappe... ⏳'
      });

      const preferences = db.getPreferences();
      const docIds = docs.map(d => d.id);
      const title = preferences.candidateName 
        ? `Bewerbungsmappe - ${preferences.candidateName}` 
        : 'Bewerbungsmappe';

      console.log(`Generiere Mappe per Telegram Callback für Wohnung ${listingId}`);
      const pdfBytes = await generatePortfolioBuffer(title, docIds);

      // Sende PDF per sendDocument
      const formData = new FormData();
      formData.append('chat_id', chatId);
      formData.append('document', new Blob([pdfBytes], { type: 'application/pdf' }), 'Bewerbungsmappe.pdf');
      formData.append('caption', `📄 Hier ist deine Bewerbungsmappe für die Wohnung: "${listing ? listing.title : 'Mietwohnung'}"`);

      await axios.post(`https://api.telegram.org/bot${token}/sendDocument`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Buttons aktualisieren (Mappe-Button ersetzen)
      const updatedReplyMarkup = {
        inline_keyboard: [
          [
            { text: '🔗 Exposé öffnen', url: listing ? listing.url : '#' },
            { text: listing?.status === 'favorit' ? '⭐ Favorisiert! ✅' : '⭐ Favorit', callback_data: listing?.status === 'favorit' ? 'none' : `fav_${listingId}` },
            { text: '🗑️ Löschen', callback_data: `del_${listingId}` }
          ],
          [
            { text: '📄 Mappe gesendet! ✅', callback_data: 'none' }
          ]
        ]
      };

      await axios.post(`https://api.telegram.org/bot${token}/editMessageReplyMarkup`, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: updatedReplyMarkup
      });

    } else if (action === 'apply') {
      if (!listing) {
        await axios.post(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
          callback_query_id: callbackQueryId,
          text: 'Wohnung nicht mehr in der Datenbank vorhanden ❌',
          show_alert: true
        });
        return;
      }

      if (!listing.contactEmail) {
        await axios.post(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
          callback_query_id: callbackQueryId,
          text: 'Keine Kontakt-E-Mail vorhanden! ❌',
          show_alert: true
        });
        return;
      }

      await axios.post(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        callback_query_id: callbackQueryId,
        text: 'Bewerbung wird gesendet... 🚀'
      });

      try {
        const port = process.env.PORT || 5000;
        await axios.post(`http://localhost:${port}/api/listings/${listingId}/apply`);

        await axios.post(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
          callback_query_id: callbackQueryId,
          text: 'Bewerbung erfolgreich gesendet! 🚀'
        });

        const updatedReplyMarkup = {
          inline_keyboard: [
            [
              { text: '🔗 Exposé öffnen', url: listing.url },
              { text: '🚀 Beworben! ✅', callback_data: 'none' },
              { text: '🗑️ Löschen', callback_data: `del_${listingId}` }
            ]
          ]
        };

        await axios.post(`https://api.telegram.org/bot${token}/editMessageReplyMarkup`, {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: updatedReplyMarkup
        });
      } catch (err) {
        console.error('Fehler bei Telegram-Bewerbung:', err.message);
        await axios.post(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
          callback_query_id: callbackQueryId,
          text: `Fehler: ${err.response?.data?.error || err.message} ❌`,
          show_alert: true
        });
      }

    } else if (action === 'del') {
      const listingTitle = listing ? listing.title : 'Wohnung';
      
      // Wohnung aus DB löschen (mit lokalem Feedback zum automatischen Lernen)
      if (listing) {
        db.deleteListing(listingId);
      }

      // Toast-Bestätigung
      await axios.post(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
        callback_query_id: callbackQueryId,
        text: 'Wohnung gelöscht! 🗑️'
      });

      // Nachrichtentext ersetzen (ohne Buttons)
      const deletedMessageText = `❌ *Wohnung gelöscht*\n\nDie Wohnung "${escapeMarkdown(listingTitle)}" wurde aus der Datenbank gelöscht.`;

      if (message.photo) {
        await axios.post(`https://api.telegram.org/bot${token}/editMessageCaption`, {
          chat_id: chatId,
          message_id: messageId,
          caption: deletedMessageText,
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: [] }
        });
      } else {
        await axios.post(`https://api.telegram.org/bot${token}/editMessageText`, {
          chat_id: chatId,
          message_id: messageId,
          text: deletedMessageText,
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: [] }
        });
      }
    }
  } catch (err) {
    console.error('Fehler bei Telegram-Callback Verarbeitung:', err.response?.data || err.message);
  }
}

/**
 * Initialisiert VAPID-Details für Web-Push
 */
export function initVapidKeys() {
  const preferences = db.getPreferences();
  let keys = preferences.vapidKeys;
  if (!keys) {
    console.log('Generiere neue VAPID-Schlüssel für PWA Web Push...');
    keys = webpush.generateVAPIDKeys();
    db.savePreferences({ vapidKeys: keys });
  }
  
  webpush.setVapidDetails(
    'mailto:wohnungssuche-ki@example.com',
    keys.publicKey,
    keys.privateKey
  );
  console.log('PWA Web Push VAPID Details erfolgreich gesetzt.');
}

/**
 * Sendet eine Web-Push-Benachrichtigung an alle registrierten Abonnements.
 */
export async function sendWebPushNotification(title, body, data = {}) {
  const subs = db.getPushSubscriptions();
  if (subs.length === 0) return;

  console.log(`Sende PWA Web Push an ${subs.length} registrierte Abonnements...`);
  
  const payload = JSON.stringify({
    notification: {
      title,
      body,
      icon: '/app_icon.png',
      badge: '/badge_icon.png',
      data
    }
  });

  const promises = subs.map(async (sub) => {
    try {
      await webpush.sendNotification(sub, payload);
    } catch (error) {
      if (error.statusCode === 410 || error.statusCode === 404) {
        console.log(`PWA Push-Abonnement abgelaufen/ungültig (Status ${error.statusCode}), lösche aus DB...`);
        db.deletePushSubscription(sub.endpoint);
      } else {
        console.error(`Fehler beim Senden von Web Push:`, error.message);
      }
    }
  });

  await Promise.all(promises);
}

/**
 * Sendet eine JSON-Webhook Benachrichtigung (z. B. an Home Assistant oder Zapier).
 */
export async function sendWebhookNotification(preferences, listing) {
  const webhookUrl = preferences.webhookUrl || process.env.WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await axios.post(webhookUrl, {
      event: 'new_listing',
      listing: {
        id: listing.id,
        title: listing.title,
        priceWarm: listing.priceWarm,
        sqm: listing.sqm,
        rooms: listing.rooms,
        location: listing.location,
        matchScore: listing.matchScore,
        matchSummary: listing.matchSummary,
        url: listing.url
      },
      timestamp: new Date().toISOString()
    }, { timeout: 5000 });
    console.log(`[Webhook] Benachrichtigung für "${listing.title}" an ${webhookUrl} gesendet.`);
  } catch (err) {
    console.error('[Webhook] Fehler beim Senden:', err.message);
  }
}

