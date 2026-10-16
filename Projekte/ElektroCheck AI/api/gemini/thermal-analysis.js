import { guard, logError } from '../_lib/http.js';
import { GEMINI_QUOTA } from '../_lib/quota.js';
import { checkImage, generateJson, stripImageDataUrl } from '../_lib/gemini-helper.js';
import { thermalAnalysisSchema } from '../_lib/schemas.js';

export default async function handler(req, res) {
  if (!(await guard(req, res, { quota: GEMINI_QUOTA }))) return;

  try {
    const { imageBase64, description } = req.body || {};
    const imageError = checkImage(imageBase64, { missingMessage: 'Kein Bild zur Wärmebild-Analyse übergeben.' });
    if (imageError) return res.status(imageError.status).json({ error: imageError.error });
    const safeDescription = typeof description === 'string' ? description.slice(0, 2000) : '';

    const parsed = await generateJson(req, res, {
      systemInstruction: 'Du bist ein zertifizierter Thermograf und Elektrofachkraft. Analysiere das Infrarot-/Wärmebild eines elektrischen Systems (z.B. Schaltschrank). Identifiziere Hotspots, schätze deren Temperaturen anhand der Falschfarben (gelb/weiß/rot für heiß, blau/lila für kalt) und ordne sie elektrischen Bauteilen zu. Bewerte den Zustand nach VDE-Richtlinien und gib konkrete Handlungsempfehlungen. Antworte ausschließlich im vorgegebenen JSON-Format.',
      schema: thermalAnalysisSchema,
      parts: [
        {
          text: `Fehlerbeschreibung / Anlagenkontext: "${safeDescription || 'Keine zusätzlichen Angaben gemacht.'}"
Analysiere das beigefügte Infrarotbild. Finde alle überhitzten Kontakte, Sicherungen, Schütze oder Leitungen. Markiere sie mit Bounding-Boxes (normiert auf 0 bis 1000 im Format [ymin, xmin, ymax, xmax]) und schätze deren Temperatur.`
        },
        { inlineData: { data: stripImageDataUrl(imageBase64), mimeType: 'image/jpeg' } }
      ]
    });
    if (parsed) res.json(parsed);
  } catch (error) {
    logError(req, 'Fehler bei der Wärmebild-Analyse', error);
    res.status(500).json({ error: error.message || 'Fehler bei der thermografischen Analyse.' });
  }
}
