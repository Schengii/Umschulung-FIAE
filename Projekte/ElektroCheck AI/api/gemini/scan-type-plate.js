import { guard, logError } from '../_lib/http.js';
import { GEMINI_QUOTA } from '../_lib/quota.js';
import { checkImage, generateJson, stripImageDataUrl } from '../_lib/gemini-helper.js';
import { scanSchema } from '../_lib/schemas.js';

export default async function handler(req, res) {
  if (!(await guard(req, res, { quota: GEMINI_QUOTA }))) return;

  try {
    const { imageBase64 } = req.body || {};
    const imageError = checkImage(imageBase64);
    if (imageError) return res.status(imageError.status).json({ error: imageError.error });

    const parsed = await generateJson(req, res, {
      systemInstruction: 'Du bist ein Assistent für Elektrofachkräfte. Analysiere dieses Bild eines elektronischen Bauteils oder Typenschilds. Lies alle sichtbaren Texte, Seriennummern und Spezifikationen ab. Gib die Antwort strikt als JSON zurück.',
      schema: scanSchema,
      parts: [
        { text: 'Lies das Typenschild auf dem folgenden Bild aus.' },
        { inlineData: { mimeType: 'image/jpeg', data: stripImageDataUrl(imageBase64) } }
      ],
      validate: true
    });
    if (parsed) res.json(parsed);
  } catch (error) {
    logError(req, 'Fehler beim Typenschild-Scan', error);
    res.status(500).json({ error: error.message || 'Fehler beim Scannen des Typenschilds.' });
  }
}
