import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from './db.js';

// Hilfsfunktion zur Initialisierung des Modells
function getModel(apiKey, modelName = 'gemini-2.5-flash') {
  const finalKey = apiKey || process.env.GEMINI_API_KEY;
  if (!finalKey) {
    throw new Error('Gemini API Key fehlt. Bitte richte deinen API-Key im Suchprofil ein oder setze GEMINI_API_KEY.');
  }
  const genAI = new GoogleGenerativeAI(finalKey);
  return genAI.getGenerativeModel({ model: modelName });
}

// Hilfsfunktion für API-Aufrufe mit Retry & Exponential Backoff
async function generateContentWithRetry(model, requestObj, retries = 4, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await model.generateContent(requestObj);
      return result;
    } catch (error) {
      const errorMsg = error.message || '';
      const isRateLimit = 
        errorMsg.includes('429') || 
        errorMsg.includes('Quota exceeded') || 
        errorMsg.includes('Rate limit') ||
        errorMsg.includes('Too Many Requests');
      
      if (isRateLimit && attempt < retries) {
        console.warn(`[Gemini API] Quota-Limit erreicht (429). Warte ${delayMs}ms vor Versuch ${attempt + 1}/${retries}...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        delayMs *= 2; // Exponential Backoff
        continue;
      }
      throw error;
    }
  }
}

/**
 * Parst unstrukturierten Text (z.B. Copy-Paste von Immobilienscout24) in ein strukturiertes Wohnungsobjekt.
 */
export async function parseListingFromText(rawText, apiKey) {
  const model = getModel(apiKey);
  
  const prompt = `
Du bist ein Datenextraktions-Assistent für deutsche Wohnungsanzeigen. Deine Aufgabe ist es, aus dem folgenden unstrukturierten Text (der von einer Wohnungssuche-Website kopiert wurde) strukturierte JSON-Daten zu extrahieren.

Hier ist der Text der Wohnungsanzeige:
"""
${rawText}
"""

Extrahiere die folgenden Informationen und antworte AUSSCHLIESSLICH im folgenden JSON-Format:
{
  "title": "Titel der Anzeige oder passende Überschrift",
  "priceKalt": 0, // Kaltmiete als Zahl (Euro), 0 falls nicht gefunden
  "priceWarm": 0, // Warmmiete als Zahl (Euro), 0 falls nicht gefunden (schätze wenn möglich Kaltmiete + Nebenkosten)
  "sqm": 0,       // Wohnfläche in Quadratmetern als Zahl, 0 falls nicht gefunden
  "rooms": 0,     // Anzahl der Zimmer als Zahl (auch halbe Zimmer möglich z.B. 2.5), 0 falls nicht gefunden
  "location": "Ortsteil und Stadt der Wohnung (z.B. Unterbilk, Düsseldorf oder Berlin Mitte)",
  "description": "Zusammenfassung der Wohnung (Lage, Zustand, Besonderheiten) in 3-4 Sätzen",
  "contactName": "Name des Ansprechpartners/Vermieters (falls vorhanden, sonst leere Zeichenkette)"
}

Wichtige Regeln:
1. Extrahiere nur Zahlen für priceKalt, priceWarm, sqm, und rooms. Keine Währungssymbole oder Einheiten.
2. Wenn ein Wert im Text absolut nicht zu finden ist, setze ihn auf 0.
3. Antworte NUR mit dem reinen JSON-Objekt, ohne Markdown-Formatierung wie \`\`\`json.
`;

  try {
    const result = await generateContentWithRetry(model, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text().trim();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Fehler bei parseListingFromText:', error);
    throw new Error('Gemini konnte den Text nicht analysieren: ' + error.message);
  }
}

/**
 * Bewertet eine Wohnung basierend auf den Kriterien des Nutzers.
 * Berechnet einen Score, Pros/Contras und eine Erklärung.
 */
export async function evaluateListing(listing, preferences, apiKey) {
  const model = getModel(apiKey);

  let poiText = 'Keine detaillierten POI-Daten vorhanden (evtl. Geocoding fehlgeschlagen).';
  if (listing.pois) {
    const smList = listing.pois.supermarkets && listing.pois.supermarkets.length > 0
      ? listing.pois.supermarkets.map(s => `${s.name} (${(s.distanceKm * 1000).toFixed(0)}m)`).join(', ')
      : 'Keine Supermärkte im Umkreis von 1 km';
    const ptList = listing.pois.publicTransit && listing.pois.publicTransit.length > 0
      ? listing.pois.publicTransit.map(p => `${p.name} (${p.type}, ${(p.distanceKm * 1000).toFixed(0)}m)`).join(', ')
      : 'Keine ÖPNV-Haltestellen im Umkreis von 1 km';
    const pkList = listing.pois.parks && listing.pois.parks.length > 0
      ? listing.pois.parks.map(p => `${p.name} (${(p.distanceKm * 1000).toFixed(0)}m)`).join(', ')
      : 'Keine Parks im Umkreis von 1 km';
    
    poiText = `
  - Supermärkte (Umkreis 1km): ${smList}
  - ÖPNV-Haltestellen (Umkreis 1km): ${ptList}
  - Parks & Grünflächen (Umkreis 1km): ${pkList}
   const prompt = `
Du bist ein persönlicher Assistent für die Wohnungssuche in Deutschland.
Deine Aufgabe ist es, ein Wohnungsangebot mit den Kriterien und Präferenzen des Nutzers zu vergleichen und eine ehrliche, hilfreiche Bewertung abzugeben.

Suchkriterien des Nutzers:
- Stadt/Orte: ${preferences.cities.join(', ') || 'Keine Angabe (überall)'}
- Minimale Warmmiete: ${preferences.minRentWarm ?? 0} €
- Maximale Warmmiete: ${preferences.maxRentWarm} €
- Mindestfläche: ${preferences.minSqm} qm
- Maximale Wohnfläche: ${preferences.maxSqm ?? 9999} qm
- Mindest-Zimmeranzahl: ${preferences.minRooms}
- Einbauküche (EBK) erforderlich: ${preferences.ebkRequired ? 'Ja' : 'Nein (bzw. egal)'}
- Balkon / Terrasse erforderlich: ${preferences.balkonRequired ? 'Ja' : 'Nein (bzw. egal)'}
- Erdgeschoss meiden: ${preferences.noGroundFloor ? 'Ja' : 'Nein'}
- Wohnberechtigungsschein (WBS) Status: ${preferences.wbsStatus === 'has' ? 'Ich habe einen WBS' : preferences.wbsStatus === 'none' ? 'Ich habe KEINEN WBS' : 'Egal'}
- Suchpräferenzen: Miete=${preferences.searchRent ?? true}, Kauf=${preferences.searchBuy ?? false}, Tausch=${preferences.searchSwap ?? false}
- Ausschluss-Kriterien & Blacklist (Kommagetrennt): "${preferences.blacklistKeywords || ''}"
- Ziel-Adresse für Entfernungsfilter: "${preferences.targetAddress || 'Keine Angabe'}"
- Minimale gewünschte Entfernung (KM): ${preferences.minDistanceKm ?? 0} km
- Maximal gewünschte Entfernung (KM): ${preferences.maxDistanceKm || 10} km
- Wunschstadt (gesuchter Ort): "${preferences.wishCity || 'Keine Angabe'}"
- Maximaler Suchradius um die Wunschstadt (KM): ${preferences.wishCityRadiusKm || 15} km
- Besondere Wünsche (Keywords/Text): "${preferences.wishes || 'Keine besonderen Wünsche'}"
- Automatisch gelernte Ausschlusskriterien (vom Benutzer abgelehnte Merkmale): "${preferences.learnedNegativePreferences?.join(', ') || 'Keine'}"
- Monatsnettoeinkommen des Benutzers: ${preferences.netIncome ?? 2500} €
- Maximal gewünschte Nebenkosten: ${preferences.maxNebenkosten ?? 250} €
- Maximales Kautionsbudget: ${preferences.maxKaution ?? 2000} €
- Globaler Mietspiegel-Richtwert der Wunschstadt: ${preferences.mietspiegelReference ?? 12.5} €/qm

Wohnungsangebot:
- Titel: "${listing.title}"
- Kaltmiete: ${listing.priceKalt} €
- Warmmiete: ${listing.priceWarm} €
- Größe: ${listing.sqm} qm
- Zimmer: ${listing.rooms}
- Ort: "${listing.location}"
- Berechnete Entfernung zum Ziel/Arbeitsort (KM): ${listing.distanceKm !== undefined && listing.distanceKm !== null ? `${listing.distanceKm} km` : 'Unbekannt'}
- Berechnete Entfernung zur Wunschstadt (KM): ${listing.wishCityDistanceKm !== undefined && listing.wishCityDistanceKm !== null ? `${listing.wishCityDistanceKm} km` : 'Unbekannt'}
- Infrastruktur & Points of Interest (POIs) in der Nähe:
  ${poiText}
- Zusammenfassung: "${listing.description}"

Analysiere das Angebot und erstelle eine JSON-Antwort mit folgenden Feldern:
{
  "matchScore": 85, // Eine Zahl zwischen 0 und 100, die angibt wie gut die Wohnung passt.
                    // Regelsätze für die Punktevergabe:
                    // 1. Warmmiete über dem Limit oder unter der Mindestwarmmiete -> drastischer Punktabzug (z. B. -30 bis -50 Punkte).
                    // 2. Zu klein, zu groß (über der maximalen Wohnfläche) oder zu wenige Zimmer -> Punktabzug (z. B. -15 bis -30 Punkte).
                    // 3. Wenn "Ich habe KEINEN WBS" ausgewählt ist und die Wohnung WBS erfordert (z. B. "nur mit WBS", "Wohnberechtigungsschein erforderlich" im Titel/Beschreibung) -> K.O. Kriterium! Setze den Score sofort auf maximal 10 und füge es als Haupt-Contra hinzu.
                    // 4. Tauschwohnungen: Wenn Tausch=false ist, aber das Inserat eine Tauschwohnung ist -> K.O. Kriterium! Setze den Score auf maximal 10. Wenn Tausch=true ist, sind Tauschwohnungen erwünscht.
                    // 4b. Wenn Kauf=true gesucht wird und das Inserat ein Kaufobjekt ist (oder Miete=true gesucht wird und das Inserat ein Mietobjekt ist), ist das passend. Sollte ein Kaufobjekt angeboten werden, obwohl nur Miete gesucht wird (Kauf=false), setze den Score auf maximal 10.
                    // 4c. Wenn Ausschluss-Keywords im Titel oder der Beschreibung vorkommen -> K.O. Kriterium! Setze den Score sofort auf maximal 10.
                    // 5. Einbauküche erforderlich, aber keine Küche vorhanden (und nicht erwähnte Nachrüstung) -> Punktabzug.
                    // 6. Balkon erforderlich, aber keiner vorhanden -> Punktabzug.
                    // 7. Erdgeschoss meiden is aktiv, aber die Wohnung liegt im Erdgeschoss/Hochparterre -> Punktabzug.
                    // 8. Wenn eine Ziel-Adresse hinterlegt ist und die berechnete Entfernung der Wohnung größer ist als die maximal gewünschte Entfernung oder geringer ist als die minimal gewünschte Entfernung -> Punktabzug (z. B. -10 bis -30 Punkte, je nach dem wie weit die Überschreitung/Unterschreitung ist).
                    // 9. Wenn eine Wunschstadt und ein Suchradius hinterlegt sind und die berechnete Entfernung zur Wunschstadt größer ist als der Suchradius -> K.O. Kriterium! Setze den Score sofort auf maximal 10 und füge als Contra hinzu (z. B. "Außerhalb des Suchradius um die Wunschstadt").
                    // 10. Besondere Wünsche erfüllt (z.B. Balkon, EBK, gute ÖPNV-Anbindung, sehr kurze Entfernung zum Zielort) -> Bonus (z. B. +5 bis +15 Punkte).
                    // 11. Wenn das Wohnungsangebot eines der "Automatisch gelernten Ausschlusskriterien" erfüllt (z.B. wenn es eine Eigenschaft aufweist, die der Benutzer in der Vergangenheit abgelehnt hat) -> drastischer Punktabzug (z.B. -30 bis -50 Punkte, oder direkt K.O. auf maximal 10 falls es ein schwerwiegender Widerspruch ist).
                    // 12. Wenn das Wohnungsangebot Anzeichen für versteckte Kosten oder Kostenfallen (z. B. Indexmiete, Staffelmiete, separate Heizungsanmeldung/Gasheizung, verpflichtende Stellplatzmiete, hohe Abstandszahlungen) aufweist -> Punktabzug (z. B. -5 bis -15 Punkte).
                    // 13. Nahegelegene Infrastruktur (POIs): Wenn wichtige Einrichtungen (Supermarkt, Bus/Bahn Haltestelle, Park) sehr nah gelegen sind (z. B. unter 500m), vergib einen Bonus (+3 bis +8 Punkte). Wenn die Anbindung an ÖPNV oder Einkaufsmöglichkeiten extrem schlecht oder nicht vorhanden ist (> 1km), vergib einen Punktabzug (-5 bis -10 Punkte).
  "matchSummary": "Eine kurze Erklärung (2-3 Sätze auf Deutsch), warum diese Bewertung zustande kam und wie gut das Angebot passt.",
  "pros": ["Pro-Punkt 1", "Pro-Punkt 2"], // Liste von Vorteilen dieser Wohnung auf Deutsch
  "cons": ["Contra-Punkt 1", "Contra-Punkt 2"], // Liste von Nachteilen dieser Wohnung auf Deutsch
  "contactEmail": "E-Mail-Adresse des Vermieters/Ansprechpartners, falls im Text/Beschreibung auffindbar (sonst null)",
  "contactPhone": "Telefonnummer des Vermieters/Ansprechpartners, falls im Text/Beschreibung auffindbar (sonst null)",
  "hiddenCosts": {
    "detected": true, // true falls Anzeichen für Kostenfallen oder versteckte Kosten (z. B. Indexmiete, Staffelmiete, separate Gas-/Heizkostenabrechnung, Stellplatzpflicht, hohe Abstandszahlung) vorliegen, sonst false.
    "details": "Details zu den versteckten Kosten auf Deutsch (z. B. 'Enthält Staffelmiete und separate Abrechnung für Gasheizung erforderlich'), sonst null."
  },
  "estimatedNebenkosten": 200, // Schätze die Nebenkosten/Betriebskosten für diese Wohnung (Euro), falls nicht direkt angegeben.
  "estimatedKaution": 1800, // Schätze die Kaution (in Euro, standardmäßig ca. 3x Kaltmiete).
  "mietpreisbremseCheck": {
    "isCompliant": true, // true, false oder null (falls nicht abschätzbar). Vergleiche die Kaltmiete pro qm der Wohnung mit dem Richtwert von ${preferences.mietspiegelReference ?? 12.5} €/qm und der ortsüblichen Vergleichsmiete für diese konkrete Lage und Ausstattung.
    "estimatedMietspiegelSqm": 11.5, // Schätze den ortsüblichen Mietspiegel/Quadratmeterpreis für diese konkrete Wohnlage/Baujahr/Ausstattung (in €/qm).
    "explanation": "Erklärung zur Einhaltung der Mietpreisbremse (z. B. 'Die Wohnung liegt mit 14,20 €/qm Kaltmiete deutlich über der ortsüblichen Vergleichsmiete von ca. 11,50 €/qm sowie dem eingestellten Richtwert von 12,50 €/qm. Es besteht der Verdacht eines Verstoßes gegen die Mietpreisbremse.')"
  },
  "criteriaBreakdown": {
    "rent": { "status": "pass" | "fail" | "neutral", "detail": "Erklärung zur Warmmiete/Budget" },
    "size": { "status": "pass" | "fail" | "neutral", "detail": "Erklärung zur Wohnfläche" },
    "rooms": { "status": "pass" | "fail" | "neutral", "detail": "Erklärung zur Zimmeranzahl" },
    "location": { "status": "pass" | "fail" | "neutral", "detail": "Erklärung zur Lage und Entfernung" },
    "ebk": { "status": "pass" | "fail" | "neutral", "detail": "Erklärung zur Einbauküche (EBK)" },
    "balkon": { "status": "pass" | "fail" | "neutral", "detail": "Erklärung zu Balkon/Terrasse" },
    "floor": { "status": "pass" | "fail" | "neutral", "detail": "Erklärung zur Etage / Erdgeschoss" },
    "wbs": { "status": "pass" | "fail" | "neutral", "detail": "Erklärung zum WBS-Status" }
  }
}
Antworte NUR mit dem reinen JSON-Objekt, ohne Markdown-Formatierung wie \`\`\`json.
\`;

  try {
    const result = await generateContentWithRetry(model, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text().trim();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Fehler bei evaluateListing:', error);
    return {
      matchScore: 50,
      matchSummary: 'Automatisierte Bewertung fehlgeschlagen: ' + error.message,
      pros: ['Konnte nicht analysiert werden'],
      cons: []
    };
  }
}

/**
 * Generiert ein maßgeschneidertes, freundliches und professionelles Bewerbungsschreiben (Anschreiben) in Deutsch.
 */
export async function generateCoverLetter(listing, preferences, apiKey) {
  const model = getModel(apiKey);

  const prompt = `
Du bist ein professioneller Bewerbungs-Coach. Erstelle ein kurzes, überzeugendes und höfliches Anschreiben (ca. 150-250 Wörter) auf Deutsch für eine Wohnungsbewerbung.
Das Anschreiben soll sich auf die Details der Wohnung beziehen und das persönliche Profil des Bewerbers sympathisch darstellen.

Profil des Bewerbers ("Über mich"):
"""
${preferences.aboutMe || 'Ich bin auf der Suche nach meiner ersten eigenen Wohnung zur Miete, habe ein geregeltes Einkommen und bin ein ruhiger, zuverlässiger Mieter.'}
"""

Wohnungsdetails:
- Titel: "${listing.title}"
- Ort: "${listing.location}"
- Besonderheiten: Zimmer: ${listing.rooms}, Größe: ${listing.sqm} qm, Warmmiete: ${listing.priceWarm} €
- Beschreibung: "${listing.description}"
- Ansprechpartner (falls vorhanden): "${listing.contactName || 'Sehr geehrte Damen und Herren'}"

Regeln für das Anschreiben:
1. Nutze eine passende Anrede. Wenn der Ansprechpartner bekannt ist (z.B. "Herr Müller"), schreibe "Sehr geehrter Herr Müller,". Wenn nicht, schreibe "Sehr geehrte Damen und Herren,".
2. Der Ton soll freundlich, professionell, interessiert und vertrauenswürdig sein.
3. Beziehe dich subtil auf Details aus der Anzeige (z. B. wenn eine Einbauküche erwähnt wird, oder die schöne Lage), um zu zeigen, dass du die Anzeige wirklich gelesen hast.
4. Hebe das Profil des Bewerbers positiv hervor (z. B. geregeltes Einkommen, Nichtraucher, keine Haustiere - je nachdem, was im "Über mich" steht).
5. Bitte am Ende höflich um einen Besichtigungstermin und nenne Kontaktdaten-Platzhalter wie [Telefonnummer] und [E-Mail-Adresse].
6. Antworte NUR mit dem reinen Text des Anschreibens (keine Kommentare davor oder danach).
`;

  try {
    const result = await generateContentWithRetry(model, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });

    return result.response.text().trim();
  } catch (error) {
    console.error('Fehler bei generateCoverLetter:', error);
    return `Fehler bei der Generierung des Anschreibens: ${error.message}`;
  }
}

/**
 * Analysiert eine vom Nutzer gelöschte Wohnung, um implizite Ablehnungsgründe
 * als Ausschlusskriterien zu lernen.
 */
export async function learnFromRejection(listing, preferences, reasons = [], customReason = '') {
  const apiKey = preferences.geminiApiKey;
  if (!apiKey) return;

  const model = getModel(apiKey);

  const userFeedbackStr = [
    reasons && reasons.length > 0 ? `Ausgewählte Gründe: ${reasons.join(', ')}` : '',
    customReason ? `Freitext-Begründung des Nutzers: "${customReason}"` : ''
  ].filter(Boolean).join('\n');

  const prompt = `
Du bist das Gehirn eines selbstoptimierenden Wohnungssuche-Assistenten.
Ein Benutzer hat soeben eine Wohnung aus seinen Ergebnissen gelöscht.
Deine Aufgabe ist es, zu analysieren, warum der Benutzer diese Wohnung abgelehnt hat, und ein konkretes Ausschlusskriterium daraus abzuleben.

Hier ist das Profil des Benutzers:
- Besondere Wünsche: "${preferences.wishes || 'Keine Angabe'}"
- Über mich: "${preferences.aboutMe || 'Keine Angabe'}"
- Bereits gelernte Ausschlusskriterien: "${preferences.learnedNegativePreferences?.join(', ') || 'Keine'}"

Hier sind die Details der gelöschten Wohnung:
- Titel: "${listing.title}"
- Ort: "${listing.location}"
- Miete: Kalt ${listing.priceKalt} € / Warm ${listing.priceWarm} €
- Größe: ${listing.sqm} qm, Zimmer: ${listing.rooms}
- Beschreibung: "${listing.description || 'Keine Beschreibung'}"
- Vorteile (Pros): ${JSON.stringify(listing.pros || [])}
- Nachteile (Cons): ${JSON.stringify(listing.cons || [])}

${userFeedbackStr ? `Vom Nutzer angegebenes Feedback zur Löschung:\n${userFeedbackStr}\n` : ''}

Deine Aufgabe:
Analysiere die gelöschte Wohnung und das angegebene Feedback.
Leite daraus ein prägnantes, konkretes unerwünschtes Merkmal der Wohnung ab (maximal 5 Wörter auf Deutsch), das als neues Ausschlusskriterium gelernt werden soll (z.B. "Haustiere verboten", "Erdgeschosswohnung", "Keine Einbauküche", "Heizung über Nachtspeicheröfen", "Wohnung an Hauptstraße", "Souterrainwohnung").
- Falls der Nutzer eine Freitext-Begründung angegeben hat, übersetze oder verallgemeinere sie in ein passendes, kurzes Ausschlusskriterium (z.B. "ist im Keller" -> "Souterrainwohnung", "keine Tiere" -> "Haustiere verboten").
- Vermeide rein numerische oder bereits fest konfigurierte Kriterien wie "Miete zu hoch" oder "Wohnung zu klein", es sei denn, es handelt sich um ein qualitatives Merkmal (z.B. "Heizkosten unkalkulierbar"). Bevorzuge qualitative Merkmale der Wohnung.
- Wenn das abgeleitete Kriterium bereits in der Liste der bereits gelernten Ausschlusskriterien enthalten ist oder keinen Sinn ergibt, kannst du das Feld "detectedPreference" leer lassen oder null setzen.

Antworte mit einem JSON-Objekt im folgenden Format (NUR das JSON-Objekt, ohne Markdown wie \`\`\`json):
{
  "detectedPreference": "Das abgeleitete Kriterium (Deutsch, max. 5 Wörter) oder null",
  "reasoning": "Eine kurze Erklärung (1-2 Sätze), warum dieses Merkmal auf Basis des Nutzerfeedbacks gelernt wurde."
}
`;

  try {
    const result = await generateContentWithRetry(model, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

    const responseText = result.response.text().trim();
    const parsed = JSON.parse(responseText);

    if (parsed.detectedPreference) {
      const currentList = preferences.learnedNegativePreferences || [];
      const cleanPref = parsed.detectedPreference.trim();
      
      if (cleanPref && !currentList.includes(cleanPref)) {
        currentList.push(cleanPref);
        // Letzte 15 Einträge behalten, um Kontext nicht zu sprengen
        const updatedList = currentList.slice(-15);
        db.savePreferences({ learnedNegativePreferences: updatedList });
        console.log(`[Self-Optimization] KI hat gelernt: "${cleanPref}" (${parsed.reasoning})`);
      }
    }
  } catch (error) {
    console.error('[Self-Optimization] Fehler beim Lernen aus Löschung:', error.message);
  }
}

/**
 * Analysiert den Text eines Mietvertrags auf mietrechtliche Kostenfallen und Fallstricke.
 */
export async function analyzeLeaseText(leaseText, apiKey) {
  const model = getModel(apiKey, 'gemini-2.5-flash');

  const prompt = `
Du bist ein deutscher Mietrechtsexperte. Deine Aufgabe ist es, den bereitgestellten Text eines Mietvertrags gründlich zu prüfen und auf mietrechtliche Fallstricke, unzulässige Klauseln und Kostenfallen zu analysieren.

Hier ist der Text des Mietvertrags (bzw. relevante Auszüge):
"""
${leaseText}
"""

Führe eine detaillierte Prüfung durch und erstelle einen strukturierten Bericht im folgenden JSON-Format. Antworte AUSSCHLIESSLICH mit dem JSON-Objekt, ohne Markdown-Formatierung wie \`\`\`json.

JSON-Format:
{
  "summary": "Eine kurze Zusammenfassung der wichtigsten Funde und des Gesamteindrucks (2-3 Sätze auf Deutsch).",
  "overallVerdict": "good" | "warning" | "danger", // good = unbedenklich, warning = einige verdächtige/ungünstige Klauseln, danger = kritische oder unwirksame/nachteilige Klauseln
  "checks": [
    {
      "category": "Schönheitsreparaturen",
      "status": "ok" | "unfavorable" | "invalid", // ok = gesetzlich zulässig/standard, unfavorable = mieterunfreundlich, invalid = voraussichtlich unwirksam nach BGH-Rechtsprechung (z. B. starre Fristenpläne, Endrenovierungspflicht ohne Ausgleich)
      "verdict": "Ergebnis zur Zulässigkeit in 1-2 Sätzen.",
      "originalClause": "Auszug der relevanten Textstelle aus dem Mietvertrag (falls vorhanden, sonst leer)"
    },
    {
      "category": "Tierhaltung",
      "status": "ok" | "unfavorable" | "invalid", // ok = übliche Regelung (mit Erlaubnisvorbehalt für Hunde/Katzen), unfavorable = mieterunfreundlich, invalid = voraussichtlich unwirksam (z. B. generelles Verbot von Hunden und Katzen)
      "verdict": "Ergebnis zur Zulässigkeit in 1-2 Sätzen.",
      "originalClause": "Auszug der relevanten Textstelle aus dem Mietvertrag (falls vorhanden, sonst leer)"
    },
    {
      "category": "Kündigungsausschluss / Mindestlaufzeit",
      "status": "ok" | "unfavorable" | "invalid", // ok = standard (Kündigungsausschluss bis max. 4 Jahre), unfavorable = lange Mindestlaufzeit (z. B. 2-4 Jahre), invalid = unwirksam (z. B. Kündigungsausschluss über 4 Jahre hinaus oder Benachteiligung des Mieters)
      "verdict": "Ergebnis zur Zulässigkeit in 1-2 Sätzen.",
      "originalClause": "Auszug der relevanten Textstelle aus dem Mietvertrag (falls vorhanden, sonst leer)"
    },
    {
      "category": "Mietstruktur (Staffel- / Indexmiete)",
      "status": "ok" | "unfavorable" | "invalid", // ok = Festmiete, unfavorable = Staffelmiete oder Indexmiete (Risiko von automatischen Mieterhöhungen), invalid = Gesetzesverstoß (z. B. unklare Staffeln, zu kurze Erhöhungsabstände)
      "verdict": "Ergebnis zur Zulässigkeit in 1-2 Sätzen.",
      "originalClause": "Auszug der relevanten Textstelle aus dem Mietvertrag (falls vorhanden, sonst leer)"
    },
    {
      "category": "Betriebskosten & Sonstiges",
      "status": "ok" | "unfavorable" | "invalid", // ok = standardmäßige Umlage, unfavorable = ungewöhnliche Umlagen (z. B. hohe Verwaltungskosten, unübliche Sonstige Betriebskosten), invalid = unzulässige Kostenumlage (z. B. Instandhaltungskosten auf den Mieter umgelegt)
      "verdict": "Ergebnis zur Zulässigkeit in 1-2 Sätzen.",
      "originalClause": "Auszug der relevanten Textstelle aus dem Mietvertrag (falls vorhanden, sonst leer)"
    }
  ]
}

Wichtige Regeln für die Analyse:
- Prüfe sorgfältig deutsche BGH-Urteile zu Schönheitsreparaturen (starre Fristenpläne "müssen renoviert werden" statt "in der Regel", Quotenabgeltungsklauseln sind unwirksam).
- Prüfe Tierhaltung (generelles Hunde/Katzenverbot ist unwirksam).
- Kündigungsverzicht darf maximal 4 Jahre betragen (seit Abschluss, nicht seit Mietbeginn) und muss für beide Parteien gleichermaßen gelten.
- Instandhaltung / Kleinreparaturen: Kleinreparaturklausel benötigt eine jährliche Obergrenze (ca. 150-300 Euro gesamt, Einzelfall max. 75-120 Euro), sonst ist sie unwirksam.
- Antworte ausschließlich mit dem validen JSON-Dokument.
`;

  try {
    const result = await generateContentWithRetry(model, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    });

      }
    });

    const responseText = result.response.text().trim();
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Fehler bei analyzeLeaseText:', error);
    throw new Error('Gemini konnte den Mietvertrag nicht analysieren: ' + error.message);
  }
}

/**
 * Chat-Interaktion über eine spezifische Wohnung.
 */
export async function chatAboutListing(listing, messages, preferences, apiKey) {
  const model = getModel(apiKey, 'gemini-2.5-flash');

  const systemInstruction = `Du bist ein hilfreicher Wohnungssuche-Assistent. Der Benutzer stellt dir Fragen zu einer bestimmten Wohnung.
Beziehe dich bei deinen Antworten auf die Details der Wohnung und die Suchkriterien des Benutzers. Antworte auf Deutsch, freundlich, präzise und kompetent.

Hier sind die Details der Wohnung:
- Titel: "${listing.title}"
- Kaltmiete: ${listing.priceKalt} €
- Warmmiete: ${listing.priceWarm} €
- Größe: ${listing.sqm} qm
- Zimmer: ${listing.rooms}
- Ort: "${listing.location}"
- Match-Score: ${listing.matchScore}%
- Match-Zusammenfassung: "${listing.matchSummary}"
- Vorteile (Pros): ${JSON.stringify(listing.pros || [])}
- Nachteile (Cons): ${JSON.stringify(listing.cons || [])}
- Beschreibung/Exposé: "${listing.description || 'Keine Beschreibung vorhanden'}"

Hier sind die Suchkriterien des Benutzers:
- Budget: ${preferences.minRentWarm ?? 0} € bis ${preferences.maxRentWarm} € Warmmiete
- Mindestfläche: ${preferences.minSqm} qm
- Mindestzimmer: ${preferences.minRooms}
- Besondere Wünsche: "${preferences.wishes || 'Keine Angabe'}"
- Über mich (Profil): "${preferences.aboutMe || 'Keine Angabe'}"
`;

  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : (msg.role === 'model' ? 'model' : 'user'),
    parts: [{ text: msg.content || msg.text || '' }]
  }));

  try {
    const result = await generateContentWithRetry(model, {
      contents,
      systemInstruction
    });
    return result.response.text().trim();
  } catch (error) {
    console.error('Fehler bei chatAboutListing:', error);
    throw new Error('Gemini konnte die Chat-Nachricht nicht verarbeiten: ' + error.message);
  }
}

/**
 * Analysiert bis zu 3 Bilder einer Wohnung visuell mit Gemini (Multimodalität).
 * Bewertet Helligkeit, Zustand und Ausstattung direkt aus den Fotos.
 * @param {string[]} imageUrls - Array von Bild-URLs (max. 3 werden analysiert)
 * @param {string} apiKey - Der Gemini API-Key
 */
export async function analyzeListingImages(imageUrls, apiKey) {
  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }

  const model = getModel(apiKey, 'gemini-2.5-flash');

  // Lade Bilder als Base64 (max. 3 Bilder)
  const imagesToAnalyze = imageUrls.slice(0, 3);
  const imageParts = [];
  
  for (const url of imagesToAnalyze) {
    try {
      const response = await import('axios').then(m => m.default.get(url, {
        responseType: 'arraybuffer',
        timeout: 10000,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; WohnungssucheKI/1.0)' }
      }));
      const base64 = Buffer.from(response.data).toString('base64');
      const contentType = response.headers['content-type'] || 'image/jpeg';
      imageParts.push({
        inlineData: { mimeType: contentType.split(';')[0], data: base64 }
      });
    } catch (e) {
      console.warn(`[Bildanalyse] Bild konnte nicht geladen werden: ${url} - ${e.message}`);
    }
  }

  if (imageParts.length === 0) {
    console.warn('[Bildanalyse] Kein Bild konnte geladen werden.');
    return null;
  }

  const prompt = `Du bist ein Immobilienexperte, der Fotos einer Wohnung analysiert. Analysiere die folgenden ${imageParts.length} Fotos sachlich und objektiv.

Bewerte auf Basis der Fotos:
1. Gesamteindruck der Wohnung (Zustand, Helligkeit, Gepflegtheit)
2. Erkennbare Ausstattungsmerkmale (Bodenbelag, Küche, Bad, Fenster)
3. Potenzielle Mängel oder Probleme, die auf den Fotos erkennbar sind

Antworte AUSSCHLIESSLICH mit diesem JSON-Format:
{
  "overallImpression": "gut" | "mittel" | "schlecht",
  "brightnessScore": 85, // 0-100: Wie hell und einladend wirken die Räume?
  "conditionScore": 75,  // 0-100: Wie gut ist der Gesamtzustand (Renovierungsbedarf)?
  "summary": "Ein kurzer Satz auf Deutsch, der den Gesamteindruck der Wohnung aus den Fotos beschreibt.",
  "positiveFeatures": ["Feature 1", "Feature 2"], // Positive Merkmale auf Deutsch, max. 4
  "negativeFeatures": ["Mangel 1"], // Negative Merkmale auf Deutsch, max. 4 (leer falls keine)
  "flooringType": "Parkett" | "Laminat" | "Teppich" | "Fliesen" | "Unbekannt",
  "bathroomStyle": "Modern" | "Klassisch" | "Veraltet" | "Unbekannt",
  "hasModernKitchen": true // true/false falls Küche sichtbar ist, null falls unklar
}`;

  try {
    const result = await generateContentWithRetry(model, {
      contents: [{ role: 'user', parts: [{ text: prompt }, ...imageParts] }],
      generationConfig: { responseMimeType: 'application/json' }
    });
    const text = result.response.text().trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('[Bildanalyse] Fehler bei analyzeListingImages:', error.message);
    return null;
  }
}

/**
 * Parst eine Wohnungsanzeige visuell aus einem Screenshot (Base64) via Gemini.
 * Wird als Fallback verwendet, wenn herkömmliches HTML-Parsing unvollständige Daten liefert.
 * @param {{ base64: string, mimeType: string }} screenshot
 * @param {string} apiKey
 */
export async function parseListingFromScreenshot(screenshot, apiKey) {
  const model = getModel(apiKey, 'gemini-2.5-flash');

  const prompt = `Du siehst einen Screenshot einer deutschen Wohnungsanzeige. Extrahiere alle sichtbaren Daten aus dem Screenshot.

Antworte AUSSCHLIESSLICH mit diesem JSON-Format (ohne Markdown oder Kommentare):
{
  "title": "Titel der Anzeige oder eine sinnvolle Überschrift",
  "priceKalt": 0,
  "priceWarm": 0,
  "sqm": 0,
  "rooms": 0,
  "location": "Ort/Stadtteil der Wohnung",
  "description": "Kurze Zusammenfassung der Wohnung in 2-3 Sätzen",
  "contactName": ""
}`;

  try {
    const result = await generateContentWithRetry(model, {
      contents: [{
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType: screenshot.mimeType, data: screenshot.base64 } }
        ]
      }],
      generationConfig: { responseMimeType: 'application/json' }
    });
    const text = result.response.text().trim();
    const parsed = JSON.parse(text);
    console.log('[Screenshot-Fallback] Visuelles Parsing erfolgreich.');
    return parsed;
  } catch (error) {
    console.error('[Screenshot-Fallback] Fehler bei parseListingFromScreenshot:', error.message);
    return null;
  }
}

/**
 * Analysiert eine Vermieter-E-Mail auf Besichtigungstermine und schlägt Kalendereintrag + Antwortvorlage vor.
 */
export async function parseViewingAppointmentFromEmail(emailText, apiKey) {
  const model = getModel(apiKey, 'gemini-2.5-flash');

  const prompt = `
Du bist ein KI-E-Mail-Assistent für die Wohnungssuche.
Analysiere die folgende E-Mail eines Vermieters/Maklers auf eine Einladung zu einem Besichtigungstermin.

E-Mail-Text:
"""
${emailText}
"""

Extrahiere die Termin-Informationen und antworte AUSSCHLIESSLICH im folgenden JSON-Format:
{
  "isAppointmentInvite": true, // true, falls es sich um eine Einladung zu einer Besichtigung handelt
  "date": "YYYY-MM-DD",        // ISO-Datum (z.B. "2026-08-05"), null falls unklar
  "time": "HH:MM",             // Uhrzeit (z.B. "16:30"), null falls unklar
  "address": "Straße, Hausnummer, PLZ Ort (falls genannt, sonst null)",
  "contactPerson": "Name des Ansprechpartners/Maklers",
  "notes": "Besondere Hinweise (z.B. Klingeln bei Schmidt, Mappe mitbringen)",
  "suggestedReply": "Eine höfliche Antwort-E-Mail (auf Deutsch), in der die Einladung dankend zum vorgeschlagenen Termin bestätigt wird."
}
`;

  try {
    const result = await generateContentWithRetry(model, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });
    return JSON.parse(result.response.text().trim());
  } catch (error) {
    console.error('Fehler bei parseViewingAppointmentFromEmail:', error);
    return { isAppointmentInvite: false };
  }
}

/**
 * Generiert ein höfliches Nachverhandlungsschreiben für unzulässige oder benachteiligende Mietvertragsklauseln.
 */
export async function generateLeaseNegotiationLetter(listingTitle, leaseAnalysisResult, preferences, apiKey) {
  const model = getModel(apiKey, 'gemini-2.5-flash');

  const prompt = `
Du bist ein erfahrener deutscher Mietrechtsberater.
Erstelle ein höfliches, professionelles und konstruktives Schreiben/E-Mail an den Vermieter bezüglich des Mietvertragsentwurfs für die Wohnung "${listingTitle}".

Bewerber-Name: "${preferences.candidateName || preferences.aboutMe || 'Der Mieter'}"
Ergebnisse der Mietvertragsprüfung:
${JSON.stringify(leaseAnalysisResult, null, 2)}

Regeln:
1. Formulierung höflich, sachlich und lösungsorientiert (kein aggressiver Ton).
2. Gehe gezielt auf die als "invalid" (unwirksam) oder "unfavorable" (benachteiligend) eingestuften Klauseln ein (z. B. starre Schönheitsreparaturklauseln, überhöhte Kündigungsausschlüsse oder starres Tierhaltungsverbot).
3. Bitte um eine kurze Anpassung dieser Klauseln vor Unterzeichnung.
4. Gib NUR den reinen Text des Schreibens auf Deutsch zurück.
`;

  try {
    const result = await generateContentWithRetry(model, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    return result.response.text().trim();
  } catch (error) {
    console.error('Fehler bei generateLeaseNegotiationLetter:', error);
    throw new Error('Konnte Nachverhandlungsschreiben nicht generieren: ' + error.message);
  }
}

/**
 * Analysiert ein Gehaltsnachweis-Dokument (Text oder Bild/PDF-Auszug) zur automatischen Bonitätsprüfung.
 */
export async function analyzeSalarySlip(documentContent, apiKey, isImage = false) {
  const model = getModel(apiKey, 'gemini-2.5-flash');

  const prompt = `
Du bist ein Assistent zur Dokumentenanalyse. Extrahiere aus dem vorliegenden Gehaltsschein/Entgeltabrechnung folgende Daten:

Antworte AUSSCHLIESSLICH im folgenden JSON-Format:
{
  "netIncome": 0,          // Netto-Auszahlungsbetrag als Zahl in Euro
  "grossIncome": 0,        // Brutto-Gehalt als Zahl in Euro
  "employerName": "Name des Arbeitgebers/Firma",
  "employeeName": "Name des Arbeitnehmers",
  "documentDate": "YYYY-MM oder Monat/Jahr",
  "confidenceScore": 90    // Zuverlässigkeit der Extraktion in % (0-100)
}
`;

  try {
    const contents = isImage ? [
      { role: 'user', parts: [{ text: prompt }, { inlineData: { mimeType: documentContent.mimeType, data: documentContent.base64 } }] }
    ] : [
      { role: 'user', parts: [{ text: `${prompt}\n\nDokumententext:\n"""${documentContent}"""` }] }
    ];

    const result = await generateContentWithRetry(model, {
      contents,
      generationConfig: { responseMimeType: 'application/json' }
    });
    return JSON.parse(result.response.text().trim());
  } catch (error) {
    console.error('Fehler bei analyzeSalarySlip:', error);
    return null;
  }
}

/**
 * Analysiert eine Sprachnotiz / Notiz einer Besichtigung und strukturiert Eindrücke, Vor- und Nachteile.
 */
export async function parseViewingVoiceNote(noteText, listingTitle, apiKey) {
  const model = getModel(apiKey, 'gemini-2.5-flash');

  const prompt = `
Du bist ein KI-Besichtigungs-Coach.
Analysiere die folgende Notiz/Sprachaufnahme einer Wohnungsbesichtigung für "${listingTitle}":

Notiz:
"""
${noteText}
"""

Extrahiere die wichtigsten Beobachtungen im folgenden JSON-Format:
{
  "summary": "Zusammenfassung des Besichtigungseindrucks in 2 Sätzen",
  "newPros": ["Neuer Vorteil 1", "Neuer Vorteil 2"],
  "newCons": ["Neuer Mangel/Nachteil 1"],
  "overallImpression": "positiv" | "neutral" | "negativ",
  "recommendedAction": "Bewerbung einreichen" | "Bedenken klären" | "Wohnung absagen"
}
`;

  try {
    const result = await generateContentWithRetry(model, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' }
    });
    return JSON.parse(result.response.text().trim());
  } catch (error) {
    console.error('Fehler bei parseViewingVoiceNote:', error);
    return { summary: noteText, newPros: [], newCons: [], overallImpression: 'neutral' };
  }
}

/**
 * Generiert ein rechtssicheres Kündigungsschreiben für die alte Mietwohnung (§ 573c BGB).
 */
export async function generateLeaseTerminationLetter(formData, preferences, apiKey) {
  const model = getModel(apiKey, 'gemini-2.5-flash');

  const prompt = `
Du bist ein deutscher Mietrechtsexperte. Erstelle ein formell korrektes Kündigungsschreiben für einen Mietvertrag (§ 573c BGB ordinäre 3-Monats-Frist).

Bewerber/Mieter: "${formData.tenantName || preferences.candidateName || 'Mieter'}"
Mieter-Adresse: "${formData.tenantAddress || 'Alte Adresse'}"
Vermieter-Name: "${formData.landlordName || 'Vermieter'}"
Vermieter-Adresse: "${formData.landlordAddress || 'Vermieter Adresse'}"
Wohnungs-Details: "${formData.flatDetails || 'Mietwohnung'}"
Gewünschtes Kündigungsdatum: "${formData.terminationDate || 'zum nächstmöglichen Zeitpunkt'}"

Regeln:
1. Formuliere ein rechtssicheres Kündigungsschreiben auf Deutsch.
2. Bitte um eine schriftliche Kündigungsbestätigung und Terminabsprache zur Wohnungsübergabe sowie Kautionsrückzahlung.
3. Gib NUR den reinen Text des Schreibens zurück.
`;

  try {
    const result = await generateContentWithRetry(model, {
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    return result.response.text().trim();
  } catch (error) {
    console.error('Fehler bei generateLeaseTerminationLetter:', error);
    throw new Error('Kündigungsschreiben konnte nicht generiert werden: ' + error.message);
  }
}




