import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Converts a File/Blob to the base64 format required by the Gemini API
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Analyzes multiple uploaded item images using Gemini, returning structured item details
 * @param {Blob[]} imageBlobs 
 * @param {string} apiKey 
 */
export async function analyzeItemImages(imageBlobs, apiKey) {
  if (!apiKey) {
    throw new Error('Bitte gib zuerst einen Gemini API-Schlüssel in den Einstellungen ein.');
  }

  if (!imageBlobs || imageBlobs.length === 0) {
    throw new Error('Bitte lade mindestens ein Bild hoch.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Use gemini-2.0-flash with Search Grounding tools for real-time web checking
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    tools: [{ googleSearch: {} }],
    generationConfig: {
      responseMimeType: 'application/json'
    }
  });

  // Convert all images to base64 parts in parallel
  const base64Parts = await Promise.all(
    imageBlobs.map(async (blob) => {
      const base64Data = await blobToBase64(blob);
      return {
        inlineData: {
          data: base64Data.split(',')[1],
          mimeType: blob.type
        },
      };
    })
  );

  const systemPrompt = `Du bist ein professioneller Verkaufs-Assistent für Plattformen wie eBay, Kleinanzeigen, Vinted und Shoop.
Nutze das integrierte Google Search Tool, um aktive Online-Angebote des abgebildeten Gegenstands zu finden. Ermittle aktuelle Preise und URLs der Angebote.

Analysiere alle bereitgestellten Bilder des Gegenstandes (z.B. verschiedene Blickwinkel, Zubehör, Etiketten oder Defekte).
Vergleiche und kombiniere die Informationen aus allen Bildern:
- Achte auf eventuelle Mängel, Kratzer oder Flecken auf den Detailaufnahmen und erwähne sie sachlich.
- Prüfe, ob Zubehör (OVP, Kabel, Anleitung) abgebildet ist, und nenne es im Lieferumfang.
- Erstelle ein strukturiertes JSON-Objekt auf Deutsch.

Das JSON-Objekt muss exakt diese Struktur haben:
{
  "name": "Aussagekräftiger, verkaufsfördernder Titel für die Anzeige (max. 60 Zeichen)",
  "description": "Detaillierte, freundliche und ansprechende Beschreibung für das Angebot. Gehe auf Details, Features und Qualität ein (ca. 100-250 Wörter). Nenne auch eventuelle Gebrauchsspuren oder mitgeliefertes Zubehör, das auf den Fotos zu sehen ist. Verwende Absätze für Lesbarkeit.",
  "condition": "Zustand des Artikels (Wähle exakt einen dieser Werte: 'Neu', 'Sehr gut', 'Gut', 'Akzeptabel', 'Defekt / Ersatzteil')",
  "functionality": "Details zur Funktion und Gebrauchsspuren (z.B. 'Voll funktionsfähig', 'Voll funktionsfähig mit leichten Gebrauchsspuren', oder gefundene Fehler/Defekte beschreiben)",
  "utility": "Nutzen/Vorteile des Gegenstands für den potenziellen Käufer (warum sollte man es kaufen?)",
  "suggestedPrice": 45.00, // Empfohlener Verkaufspreis als Zahl in Euro (z.B. 45.00)
  "shippingMethod": "Empfohlene Versandart in Deutschland mit ungefähren Kosten (z.B. 'DHL Paket versichert (5,49 €)' oder 'Bücher- und Warensendung (2,25 €)' oder 'Nur Abholung')",
  "paymentMethod": "Empfohlene Bezahlart (z.B. 'PayPal Freunde/Käuferschutz, Überweisung, Barzahlung bei Abholung')",
  "comparableOffers": [
    { 
      "platform": "ebay", 
      "title": "Titel des gefundenen eBay-Angebots", 
      "price": "49,99 €",
      "url": "Tatsächliche URL der gefundenen eBay-Anzeige" 
    },
    { 
      "platform": "kleinanzeigen", 
      "title": "Titel des gefundenen Kleinanzeigen-Angebots", 
      "price": "40,00 €",
      "url": "Tatsächliche URL der gefundenen Kleinanzeigen-Anzeige" 
    }
  ]
}

Gib nur das reine JSON-Objekt zurück.`;

  try {
    const result = await model.generateContent([
      systemPrompt,
      ...base64Parts
    ]);
    
    const response = await result.response;
    const text = response.text().trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Fehler bei der Gemini-Analyse:', error);
    throw new Error('Fehler bei der Analyse der Bilder. Bitte überprüfe deinen API-Schlüssel oder versuche es erneut.');
  }
}

/**
 * Analyzes an uploaded purchase invoice / receipt image to extract price, merchant, purchase date
 * @param {Blob} fileBlob 
 * @param {string} apiKey 
 */
export async function analyzeInvoice(fileBlob, apiKey) {
  if (!apiKey) {
    throw new Error('Bitte gib zuerst einen Gemini API-Schlüssel in den Einstellungen ein.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json'
    }
  });

  const base64Data = await blobToBase64(fileBlob);
  const filePart = {
    inlineData: {
      data: base64Data.split(',')[1],
      mimeType: fileBlob.type
    },
  };

  const prompt = `Analysiere diese Rechnung / diesen Kaufbeleg.
Extrahiere die folgenden Informationen und gib sie als reines JSON-Objekt zurück.

JSON-Struktur:
{
  "originalPrice": 129.99, // Der Brutto-Endpreis (Zahl, Float)
  "purchaseDate": "2024-10-12", // Das Kaufdatum im Format YYYY-MM-DD (String)
  "merchant": "MediaMarkt", // Der Name des Händlers oder Shops (String)
  "warrantyMonths": 24 // Die Standard-Garantiezeit in Monaten (Zahl, meistens 24, bei manchen Produkten 12 oder 36)
}

Falls ein Feld nicht eindeutig zu erkennen ist, schätze es anhand des Inhalts ab oder verwende Standardwerte (z.B. 24 für warrantyMonths).`;

  try {
    const result = await model.generateContent([prompt, filePart]);
    const response = await result.response;
    const text = response.text().trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Fehler bei der Rechnungsanalyse:', error);
    throw new Error('Die Rechnung konnte nicht automatisch ausgelesen werden.');
  }
}

/**
 * Simulates a response from the buyer based on the item details, selected persona, and chat history.
 */
export async function chatWithBuyer(itemDetails, persona, chatHistory, apiKey) {
  if (!apiKey) {
    throw new Error('Bitte gib zuerst einen Gemini API-Schlüssel ein.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const historyText = chatHistory
    .map((msg) => `${msg.sender === 'user' ? 'Verkäufer' : 'Käufer'}: ${msg.text}`)
    .join('\n');

  const prompt = `Du simulierst einen potenziellen Käufer für folgenden Artikel auf einer Verkaufsplattform wie Kleinanzeigen.
  
Artikel-Details:
- Name: ${itemDetails.name}
- Beschreibung: ${itemDetails.description}
- Zustand: ${itemDetails.condition}
- Empfohlener Preis: ${itemDetails.suggestedPrice} €
- Funktionalität: ${itemDetails.functionality}
- Versand: ${itemDetails.shippingMethod}

Deine Käufer-Persona:
- Name: ${persona.name}
- Charakter/Verhalten: ${persona.description}

Bisheriger Chatverlauf:
${historyText || '(Noch keine Nachrichten)'}

Regeln für deine Antwort:
1. Antworte kurz, prägnant und passend zu deiner Persona auf die letzte Nachricht des Verkäufers.
2. Halte dich an die typische Umgangssprache auf Kleinanzeigen (z. B. ungeduldig, feilschend, skeptisch oder sehr freundlich).
3. Bleibe in der Rolle. Schreibe NUR die direkte Nachricht des Käufers. Füge keine Erklärungen oder Formatierungen hinzu.`;

  try {
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Fehler im Käufer-Simulator:', error);
    throw new Error('Käufer konnte nicht antworten.');
  }
}

/**
 * Suggests a seller response based on the item details and chat history.
 */
export async function suggestResponse(itemDetails, persona, chatHistory, apiKey) {
  if (!apiKey) {
    throw new Error('Bitte gib zuerst einen Gemini API-Schlüssel ein.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const minPricePrompt = itemDetails.minimumPrice 
    ? `- Schmerzgrenze des Verkäufers: ${itemDetails.minimumPrice} € (Gehe NIEMALS unter diesen Preis! Wenn der Käufer weniger bietet, lehne freundlich ab oder biete einen Kompromiss über/an der Schmerzgrenze an.)`
    : '';

  const historyText = chatHistory
    .map((msg) => `${msg.sender === 'user' ? 'Verkäufer' : 'Käufer'}: ${msg.text}`)
    .join('\n');

  const prompt = `Du bist ein Verkaufs-Coach. Schlage eine optimale, freundliche und geschäftstüchtige Antwort für den Verkäufer auf die letzte Nachricht des Käufers vor.

Artikel-Details:
- Name: ${itemDetails.name}
- Beschreibung: ${itemDetails.description}
- Zustand: ${itemDetails.condition}
- Empfohlener Preis: ${itemDetails.suggestedPrice} €
${minPricePrompt}

Käufer-Persona: ${persona.name} (${persona.description})

Bisheriger Chatverlauf:
${historyText || '(Noch keine Nachrichten)'}

Gib ausschließlich den reinen Antwortvorschlag aus. Verwende keine Anführungszeichen oder zusätzlichen Kommentare.`;

  try {
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Fehler bei der Antwort-Generierung:', error);
    throw new Error('Es konnte kein Antwortvorschlag generiert werden.');
  }
}

/**
 * Generates tactical tips for the seller during negotiation.
 */
export async function getNegotiationFeedback(itemDetails, persona, chatHistory, apiKey) {
  if (!apiKey) {
    throw new Error('Bitte gib zuerst einen Gemini API-Schlüssel ein.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const minPricePrompt = itemDetails.minimumPrice 
    ? `- Schmerzgrenze des Verkäufers: ${itemDetails.minimumPrice} €`
    : '';

  const historyText = chatHistory
    .map((msg) => `${msg.sender === 'user' ? 'Verkäufer' : 'Käufer'}: ${msg.text}`)
    .join('\n');

  const prompt = `Analysiere das Verkaufsgespräch und gib dem Verkäufer kurze, taktische Tipps für die Verhandlung (max. 3 prägnante Tipps, jeweils 1-2 Sätze).

Artikel-Details:
- Name: ${itemDetails.name}
- Zustand: ${itemDetails.condition}
- Empfohlener Preis: ${itemDetails.suggestedPrice} €
${minPricePrompt}

Käufer-Persona: ${persona.name} (${persona.description})

Bisheriger Chatverlauf:
${historyText || '(Noch keine Nachrichten)'}

Antworte im Format einer ungeordneten Liste (Markdown-Strichpunkte). Bleibe extrem prägnant.`;

  try {
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Fehler bei Verhandlungstipps:', error);
    throw new Error('Kein Feedback verfügbar.');
  }
}

/**
 * Rewrites the listing description in a specific tone using Gemini
 * @param {string} description 
 * @param {string} tone 
 * @param {string} apiKey 
 */
export async function rewriteDescription(description, tone, apiKey) {
  if (!apiKey) {
    throw new Error('Bitte gib zuerst einen Gemini API-Schlüssel in den Einstellungen ein.');
  }

  if (!description) {
    throw new Error('Keine Beschreibung zum Umschreiben vorhanden.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Formuliere die folgende Artikelbeschreibung für eine Online-Anzeige (z.B. eBay Kleinanzeigen) um.
Der gewünschte Tonfall ist: "${tone}".

Original-Beschreibung:
${description}

Regeln:
1. Behalte alle wichtigen Fakten, Lieferumfang, Zustand und Mängel unverändert bei.
2. Passe nur den Stil und die Tonalität an.
3. Antworte AUSSCHLIESSLICH mit dem umformulierten Beschreibungstext. Verwende keine einleitenden oder abschließenden Sätze und keine Anführungszeichen.`;

  try {
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Fehler beim Umschreiben der Beschreibung:', error);
    throw new Error('Die Beschreibung konnte nicht umgeschrieben werden.');
  }
}

/**
 * Translates the listing description into a target language using Gemini
 * @param {string} description 
 * @param {string} targetLanguage 
 * @param {string} apiKey 
 */
export async function translateDescription(description, targetLanguage, apiKey) {
  if (!apiKey) {
    throw new Error('Bitte gib zuerst einen Gemini API-Schlüssel in den Einstellungen ein.');
  }

  if (!description) {
    throw new Error('Keine Beschreibung zum Übersetzen vorhanden.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Übersetze den folgenden Beschreibungstext einer Verkaufsanzeige exakt in diese Sprache: "${targetLanguage}".
Behalte die Struktur und Formatierung (z.B. Absätze, Strichpunkte) bei. 

Beschreibungstext:
${description}

Antworte AUSSCHLIESSLICH mit der Übersetzung. Verwende keine Kommentare oder Einleitungssätze.`;

  try {
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Fehler bei der Übersetzung:', error);
    throw new Error('Die Beschreibung konnte nicht übersetzt werden.');
  }
}

/**
 * Generates relevant hashtags/keywords for search optimization using Gemini
 * @param {string} title 
 * @param {string} description 
 * @param {string} apiKey 
 */
export async function generateTags(title, description, apiKey) {
  if (!apiKey) {
    throw new Error('Bitte gib zuerst einen Gemini API-Schlüssel in den Einstellungen ein.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `Analysiere den Titel und die Beschreibung dieses Artikels und generiere 6-8 hochrelevante, verkaufsfördernde Hashtags / Suchbegriffe für Plattformen wie Vinted, eBay oder Kleinanzeigen.
Antworte AUSSCHLIESSLICH mit einer durch Leerzeichen getrennten Liste von Hashtags (z.B. "#nike #airmax #sneaker #schuhe"). Verwende keine anderen Sätze oder Formatierungen.

Titel: ${title}
Beschreibung: ${description}`;

  try {
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Fehler bei der Hashtag-Generierung:', error);
    throw new Error('Es konnten keine Schlagwörter generiert werden.');
  }
}

/**
 * Analyzes uploaded product photos for quality and provides improvement tips.
 * @param {Blob[]} imageBlobs 
 * @param {string} apiKey 
 */
export async function analyzePhotoQuality(imageBlobs, apiKey) {
  if (!apiKey) {
    throw new Error('Bitte gib zuerst einen Gemini API-Schlüssel in den Einstellungen ein.');
  }
  if (!imageBlobs || imageBlobs.length === 0) {
    throw new Error('Keine Bilder zum Analysieren vorhanden.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json'
    }
  });

  const imageParts = await Promise.all(
    imageBlobs.slice(0, 3).map(async (blob) => {
      const base64 = await blobToBase64(blob);
      return {
        inlineData: {
          data: base64.split(',')[1],
          mimeType: blob.type || 'image/jpeg',
        },
      };
    })
  );

  const prompt = `Du bist ein erfahrener Fotografie-Coach für Gebrauchtwarenfotografie bei Kleinanzeigen und eBay. 
Analysiere diese Produktfotos und gib genau 3-5 konkrete Verbesserungstipps, damit die Fotos mehr Käufer anziehen.

Achte besonders auf: Beleuchtung, Hintergrund, Bildwinkel, Schärfe, fehlende Ansichten.

Gib die Antwort als valides JSON mit der folgenden Struktur zurück:
{"score": <Zahl 1-10>, "tips": [{"type": "warning|tip|error", "text": "<konkreter Tipp>"}, ...]}`;

  try {
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text().trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Fehler beim Foto-Qualitätscheck:', error);
    throw new Error('Foto-Analyse konnte nicht durchgeführt werden.');
  }
}

/**
 * Recommends the best selling platform based on item details.
 * @param {object} itemDetails 
 * @param {string} apiKey 
 */
export async function recommendPlatform(itemDetails, apiKey) {
  if (!apiKey) {
    throw new Error('Bitte gib zuerst einen Gemini API-Schlüssel in den Einstellungen ein.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json'
    }
  });

  const prompt = `Du bist ein Experte für Gebrauchtwarenverkauf in Deutschland. Empfehle die beste Verkaufsplattform für diesen Artikel.

Artikel: ${itemDetails.name}, Zustand: ${itemDetails.condition}, Preis: ${itemDetails.suggestedPrice} €

Gib die Antwort als valides JSON mit der folgenden Struktur zurück:
{"best": "kleinanzeigen|ebay|vinted", "reason": "<max 20 Wörter>", "platforms": [{"name": "kleinanzeigen", "score": <1-10>, "hint": "<kurzer Hinweis>"}, {"name": "ebay", "score": <1-10>, "hint": "<kurzer Hinweis>"}, {"name": "vinted", "score": <1-10>, "hint": "<kurzer Hinweis>"}]}`;

  try {
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = response.text().trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Fehler bei Plattform-Empfehlung:', error);
    throw new Error('Plattform-Empfehlung konnte nicht generiert werden.');
  }
}

/**
 * Recommends the best day/time to post a listing for maximum visibility.
 * @param {object} itemDetails 
 * @param {string} platform 
 * @param {string} apiKey 
 */
export async function getBestPostingTime(itemDetails, platform, apiKey) {
  if (!apiKey) {
    throw new Error('Bitte gib zuerst einen Gemini API-Schlüssel in den Einstellungen ein.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json'
    }
  });

  const prompt = `Du bist ein Experte für Online-Marktplätze in Deutschland. Analysiere diesen Artikel und empfehle den besten Zeitpunkt zum Einstellen auf ${platform}.

Artikel: ${itemDetails.name}, Kategorie/Zustand: ${itemDetails.condition}, Preis: ${itemDetails.suggestedPrice} €

Berücksichtige: Nutzeraktivität nach Wochentag und Uhrzeit auf deutschen Plattformen, Saisonalität, Zielgruppe des Artikels.

Gib die Antwort als valides JSON mit der folgenden Struktur zurück:
{
  "bestDay": "<Wochentag auf Deutsch>",
  "bestTime": "<Uhrzeit-Range z.B. '18:00 – 21:00 Uhr'>",
  "reason": "<1-2 Sätze Begründung>",
  "seasonalTip": "<Optionaler saisonaler Hinweis oder null>",
  "heatmap": [
    {"day": "Mo", "score": <1-5>},
    {"day": "Di", "score": <1-5>},
    {"day": "Mi", "score": <1-5>},
    {"day": "Do", "score": <1-5>},
    {"day": "Fr", "score": <1-5>},
    {"day": "Sa", "score": <1-5>},
    {"day": "So", "score": <1-5>}
  ]
}`;

  try {
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = response.text().trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Fehler bei Zeitpunkt-Empfehlung:', error);
    throw new Error('Zeitpunkt-Empfehlung konnte nicht generiert werden.');
  }
}

/**
 * Suggests complementary items that could be bundled with the current item for a better sale.
 * @param {object} mainItem 
 * @param {string[]} otherItemNames - Names of other items in the seller's history
 * @param {string} apiKey 
 */
export async function generateBundleSuggestion(mainItem, otherItemNames, apiKey) {
  if (!apiKey) {
    throw new Error('Bitte gib zuerst einen Gemini API-Schlüssel in den Einstellungen ein.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json'
    }
  });

  const otherItemsText = otherItemNames.length > 0
    ? `Weitere Artikel des Verkäufers: ${otherItemNames.slice(0, 5).join(', ')}`
    : 'Keine weiteren Artikel vorhanden.';

  const prompt = `Du bist ein Experte für Gebrauchtwarenverkauf. Erstelle einen Bundle-Verkaufsvorschlag für diesen Artikel.

Hauptartikel: ${mainItem.name} (${mainItem.condition}, ${mainItem.suggestedPrice} €)
${otherItemsText}

Schlage 2-3 typische Zubehör- oder Komplementärartikel vor, die gut dazu passen würden (aus den vorhandenen Artikeln oder als allgemeine Empfehlung).

Gib die Antwort als valides JSON mit der folgenden Struktur zurück:
{
  "bundleTitle": "<kurzer Bundle-Titel>",
  "items": ["<Artikel 1>", "<Artikel 2>", ...],
  "bundlePrice": <empfohlener Paketpreis als Zahl>,
  "savingsHint": "<Ersparnis-Text z.B. 'Statt 75€ als Paket für 65€'>",
  "bundleDescription": "<2-3 Sätze fertige Bundle-Beschreibung für das Inserat>"
}`;

  try {
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    const text = response.text().trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Fehler beim Bundle-Vorschlag:', error);
    throw new Error('Bundle-Vorschlag konnte nicht generiert werden.');
  }
}







